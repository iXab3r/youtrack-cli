import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { configuredFixture } from "./cli-fixture.js";
import { createStoryCase, type StoryCase } from "./story-case.js";
const server = setupServer();
before(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
after(() => server.close());
const storyCase = createStoryCase(server);
const detail = { id: "synthetic-result" };
const emptyPage = { count: 0, items: [], hasMore: false, nextStart: null };

test("US-039 manage only explicitly selected user-bundle groups and individuals", async t => {
  await storyCase(t, { argv: ["bundle", "user", "group", "create", "bundle /?", "--body", '{"id":"group /?","$type":"UserGroup"}', "--fields", "id"], method: "POST", path: "/api/admin/customFieldSettings/bundles/user/bundle%20%2F%3F/groups", query: [["fields", "id"]], body: { id: "group /?", $type: "UserGroup" }, response: detail, result: detail, update: true });
  await storyCase(t, { argv: ["bundle", "user", "individual", "create", "bundle /?", "--body", '{"id":"user /?","$type":"User"}', "--fields", "id"], method: "POST", path: "/api/admin/customFieldSettings/bundles/user/bundle%20%2F%3F/individuals", query: [["fields", "id"]], body: { id: "user /?", $type: "User" }, response: undefined, result: null, update: true });
  await storyCase(t, { argv: ["bundle", "user", "group", "remove", "bundle /?", "group /?", "--fields", "id"], method: "DELETE", path: "/api/admin/customFieldSettings/bundles/user/bundle%20%2F%3F/groups/group%20%2F%3F", query: [["fields", "id"]], response: undefined, result: null, update: true });
  await storyCase(t, { argv: ["bundle", "user", "individual", "remove", "bundle /?", "user /?"], method: "DELETE", path: "/api/admin/customFieldSettings/bundles/user/bundle%20%2F%3F/individuals/user%20%2F%3F", query: [], response: undefined, result: null, update: true });
});

test("US-039 member preflight, empty confirmations and credential labels preserve native requests", async t => {
  const f = await configuredFixture(t, { permissions: ["Update"] });
  let calls = 0;
  server.use(http.all("*", () => { calls++; return new HttpResponse(null, { status: 204 }); }));
  for (const kind of ["group", "individual"]) {
    await assert.rejects(f.cli.execute(["bundle", "user", kind, "create", "bundle", "--body", "{}"]));
    assert.equal(calls, 0);
  }
  for (const kind of ["group", "individual"]) for (const member of ["selected-member", "synthetic-token"]) {
    for (const argv of [
      ["bundle", "user", kind, "create", "synthetic-token", "--body", JSON.stringify({ id: member })],
      ["bundle", "user", kind, "remove", "synthetic-token", member],
    ]) {
      const r = await f.run(f.cli, argv); assert.equal(r.exitCode, 0, r.stderr);
      assert.match(r.stdout, /selected-member|redacted/);
      assert.doesNotMatch(r.stdout + r.stderr, /synthetic-token|\$type/);
    }
  }
});

test("US-040 create typed global fields and edit native metadata without discovery", async t => {
  await storyCase(t, { argv: ["field", "create", "--body", '{"name":"Synthetic field","fieldType":{"id":"enum[1]"},"aliases":null,"isAutoAttached":false}', "--fields", "id"], method: "POST", path: "/api/admin/customFieldSettings/customFields", query: [["fields", "id"]], body: { name: "Synthetic field", fieldType: { id: "enum[1]" }, aliases: null, isAutoAttached: false }, response: detail, result: detail, update: true });
  await storyCase(t, { argv: ["field", "update", "field /?", "--body", '{"localizedName":null,"isDisplayedInIssueList":false}', "--fields", "id"], method: "POST", path: "/api/admin/customFieldSettings/customFields/field%20%2F%3F", query: [["fields", "id"]], body: { localizedName: null, isDisplayedInIssueList: false }, response: undefined, result: null, update: true });
});

test("US-040 missing type/name fails locally and empty field writes name their selection", async t => {
  const f = await configuredFixture(t, { permissions: ["Update"] }); let calls = 0;
  server.use(http.all("*", () => { calls++; return new HttpResponse(null, { status: 204 }); }));
  for (const body of [{ name: "Synthetic" }, { fieldType: { id: "enum[1]" } }, { name: "Synthetic", fieldType: {} }]) {
    await assert.rejects(f.cli.execute(["field", "create", "--body", JSON.stringify(body)])); assert.equal(calls, 0);
  }
  for (const argv of [
    ["field", "create", "--body", '{"name":"Selected field","fieldType":{"id":"enum[1]"}}'],
    ["field", "update", "Selected field", "--body", '{"aliases":null}'],
  ]) {
    const r = await f.run(f.cli, argv); assert.equal(r.exitCode, 0, r.stderr); assert.match(r.stdout, /Selected field/);
    assert.equal(await f.json(f.cli, argv), null);
  }
});

test("M04 sparse mutation confirmations name the selected identity once and retain bundle context", async t => {
  const f = await configuredFixture(t, { permissions: ["Update"] });
  server.use(http.all("*", () => HttpResponse.json({ id: "selected-id" })));
  for (const argv of [
    ["field", "update", "selected-id", "--body", "{}"],
    ["bundle", "user", "group", "remove", "bundle-1", "selected-id"],
    ["bundle", "user", "individual", "create", "bundle-1", "--body", '{"id":"selected-id"}'],
  ]) {
    const r = await f.run(f.cli, argv); assert.equal(r.exitCode, 0, r.stderr);
    const title = r.stdout.split("\n")[0] ?? "";
    assert.equal(title.split("selected-id").length - 1, 1, title);
    if (argv[0] === "bundle") assert.match(title, /bundle-1/);
  }
});

test("US-041 attach and detach existing project work types by native ID", async t => {
  await storyCase(t, {"argv":["project","work-item-type","create","project /?","--body","{\"id\":\"type /?\"}","--fields","id"],"method":"POST","path":"/api/admin/projects/project%20%2F%3F/timeTrackingSettings/workItemTypes","query":[["fields","id"]],"body":{"id":"type /?"},"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"},"update":true});
  await storyCase(t, {"argv":["project","work-item-type","delete","project /?","type /?","--fields","id"],"method":"DELETE","path":"/api/admin/projects/project%20%2F%3F/timeTrackingSettings/workItemTypes/type%20%2F%3F","query":[["fields","id"]],"response":undefined,"result":null,"update":true});
});

test("US-042 update project time settings with native references and false", async t => {
  await storyCase(t, {"argv":["project","time-tracking","update","project /?","--body","{\"enabled\":false,\"estimate\":{\"id\":\"project-field\"},\"timeSpent\":null}","--fields","id"],"method":"POST","path":"/api/admin/projects/project%20%2F%3F/timeTrackingSettings","query":[["fields","id"]],"body":{"enabled":false,"estimate":{"id":"project-field"},"timeSpent":null},"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"},"update":true});
});

test("US-043 read service roles, assignments and permission catalog without local grants", async t => {
  await storyCase(t, {"argv":["role-assignment","list","--fields","id","--start","7","--page-size","20","--query","scope:project! holder:user!"],"method":"GET","path":"/api/assignedRoles","query":[["fields","id"],["$skip","7"],["$top","20"],["query","scope:project! holder:user!"]],"response":[],"result":{"count":0,"items":[],"hasMore":false,"nextStart":null}});
  await storyCase(t, {"argv":["permission-catalog","list","--fields","id","--start","7","--page-size","20"],"method":"GET","path":"/api/permissions","query":[["fields","id"],["$skip","7"],["$top","20"]],"response":[],"result":{"count":0,"items":[],"hasMore":false,"nextStart":null}});
  await storyCase(t, {"argv":["role","list","--fields","id","--start","7","--page-size","20","--query","permission:synthetic-key"],"method":"GET","path":"/api/roles","query":[["fields","id"],["$skip","7"],["$top","20"],["query","permission:synthetic-key"]],"response":[],"result":{"count":0,"items":[],"hasMore":false,"nextStart":null}});
  await storyCase(t, {"argv":["role-assignment","get","selected /?","--fields","id"],"method":"GET","path":"/api/assignedRoles/selected%20%2F%3F","query":[["fields","id"]],"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"}});
  await storyCase(t, {"argv":["role","get","selected /?","--fields","id"],"method":"GET","path":"/api/roles/selected%20%2F%3F","query":[["fields","id"]],"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"}});
});

test("US-044 assign a selected holder and role in a native explicit scope, then revoke by ID", async t => {
  await storyCase(t, {"argv":["role-assignment","create","--body","{\"holder\":{\"id\":\"user /?\",\"$type\":\"User\"},\"role\":{\"id\":\"role /?\"},\"scope\":{\"$type\":\"ProjectScope\",\"project\":{\"id\":\"project /?\"}},\"$type\":\"AssignedRole\"}","--fields","id"],"method":"POST","path":"/api/assignedRoles","query":[["fields","id"]],"body":{"holder":{"id":"user /?","$type":"User"},"role":{"id":"role /?"},"scope":{"$type":"ProjectScope","project":{"id":"project /?"}},"$type":"AssignedRole"},"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"},"update":true});
  await storyCase(t, {"argv":["role-assignment","delete","assignment /?","--fields","id"],"method":"DELETE","path":"/api/assignedRoles/assignment%20%2F%3F","query":[["fields","id"]],"response":undefined,"result":null,"update":true});
});

test("US-044 assignment creation requires selected identities and preserves scoped empty confirmations", async t => {
  const f = await configuredFixture(t, { permissions: ["Update"] }); let calls = 0; let sent: unknown;
  server.use(http.post("*", async ({ request }) => { calls++; sent = await request.json(); return new HttpResponse(null, { status: 204 }); }));
  for (const body of [{ role: { id: "role" } }, { role: { id: "role" }, holder: { id: "holder" } }, { role: { id: "role" }, holder: { id: "holder" }, scope: {} }]) {
    await assert.rejects(f.cli.execute(["role-assignment", "create", "--body", JSON.stringify(body)])); assert.equal(calls, 0);
  }
  const body = { role: { id: "Selected-role" }, holder: { id: "Selected-holder", $type: "User" }, scope: { $type: "GlobalScope" } };
  const argv = ["role-assignment", "create", "--body", JSON.stringify(body)];
  const shown = await f.run(f.cli, argv); assert.equal(shown.exitCode, 0, shown.stderr);
  assert.match(shown.stdout, /Selected-role/); assert.match(shown.stdout, /Selected-holder/); assert.match(shown.stdout, /Global/);
  assert.doesNotMatch(shown.stdout, /\$type|GlobalScope/); assert.deepEqual(sent, body); assert.equal(await f.json(f.cli, argv), null);
  const secretBody = { role: { id: "synthetic-token" }, holder: { id: "synthetic-token" }, scope: { $type: "ProjectScope", project: { id: "synthetic-token" } } };
  const hidden = await f.run(f.cli, ["role-assignment", "create", "--body", JSON.stringify(secretBody)]);
  assert.equal(hidden.exitCode, 0, hidden.stderr); assert.doesNotMatch(hidden.stdout + hidden.stderr, /synthetic-token/); assert.match(hidden.stdout, /redacted/); assert.deepEqual(sent, secretBody);
});

test("US-045 add and remove direct project team users without touching inherited membership", async t => {
  await storyCase(t, {"argv":["project","team","user","add","project /?","--body","{\"id\":\"user /?\"}","--fields","id"],"method":"POST","path":"/api/admin/projects/project%20%2F%3F/team/ownUsers","query":[["fields","id"]],"body":{"id":"user /?"},"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"},"update":true});
  await storyCase(t, {"argv":["project","team","user","remove","project /?","user /?"],"method":"DELETE","path":"/api/admin/projects/project%20%2F%3F/team/ownUsers/user%20%2F%3F","query":[],"response":undefined,"result":null,"update":true});
});

test("US-046 add and remove project team groups by their native IDs", async t => {
  await storyCase(t, {"argv":["project","team","group","add","project /?","--body","{\"id\":\"group /?\",\"$type\":\"NestedGroup\"}","--fields","id"],"method":"POST","path":"/api/admin/projects/project%20%2F%3F/team/groups","query":[["fields","id"]],"body":{"id":"group /?","$type":"NestedGroup"},"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"},"update":true});
  await storyCase(t, {"argv":["project","team","group","remove","project /?","group /?","--fields","id"],"method":"DELETE","path":"/api/admin/projects/project%20%2F%3F/team/groups/group%20%2F%3F","query":[["fields","id"]],"response":undefined,"result":null,"update":true});
});

test("US-047 update native direct team lists including an empty selection", async t => {
  await storyCase(t, {"argv":["project","team","update","project /?","--body","{\"ownUsers\":[],\"groups\":[{\"id\":\"group /?\",\"$type\":\"NestedGroup\"}]}","--fields","id"],"method":"POST","path":"/api/admin/projects/project%20%2F%3F/team","query":[["fields","id"]],"body":{"ownUsers":[],"groups":[{"id":"group /?","$type":"NestedGroup"}]},"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"},"update":true});
});
