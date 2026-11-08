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

test("US-049 read and update general profile using native descriptor objects", async t => {
  await storyCase(t, {"argv":["user","profile","general","get","user /?","--fields","id"],"method":"GET","path":"/api/users/user%20%2F%3F/profiles/general","query":[["fields","id"]],"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"}});
  await storyCase(t, {"argv":["user","profile","general","update","user /?","--body","{\"timezone\":{\"id\":\"Europe/Berlin\"},\"locale\":{\"id\":\"synthetic-locale\",\"name\":null}}","--fields","id"],"method":"POST","path":"/api/users/user%20%2F%3F/profiles/general","query":[["fields","id"]],"body":{"timezone":{"id":"Europe/Berlin"},"locale":{"id":"synthetic-locale","name":null}},"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"},"update":true});
});

test("US-050 read and update native period format descriptors", async t => {
  await storyCase(t, {"argv":["user","profile","time-tracking","get","user /?","--fields","id"],"method":"GET","path":"/api/users/user%20%2F%3F/profiles/timetracking","query":[["fields","id"]],"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"}});
  await storyCase(t, {"argv":["user","profile","time-tracking","update","user /?","--body","{\"periodFormat\":{\"id\":\"FULL\",\"$type\":\"PeriodFieldFormat\"}}","--fields","id"],"method":"POST","path":"/api/users/user%20%2F%3F/profiles/timetracking","query":[["fields","id"]],"body":{"periodFormat":{"id":"FULL","$type":"PeriodFieldFormat"}},"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"},"update":true});
});

test("M05 profile descriptor preflight and empty replies preserve selected users", async t => {
  const f = await configuredFixture(t, { permissions: ["ReadOnly", "Update"] }); let calls = 0;
  server.use(http.all("*", () => { calls++; return new HttpResponse(null, { status: 204 }); }));
  for (const argv of [
    ["user", "profile", "general", "update", "user", "--body", '{"timezone":"Europe/Berlin"}'],
    ["user", "profile", "time-tracking", "update", "user", "--body", '{"periodFormat":"FULL"}'],
  ]) { await assert.rejects(f.cli.execute(argv)); assert.equal(calls, 0); }
  for (const kind of ["general", "time-tracking"]) {
    const argv = ["user", "profile", kind, "update", "Selected-user", "--body", "{}"];
    const r = await f.run(f.cli, argv); assert.equal(r.exitCode, 0, r.stderr); assert.match(r.stdout, /Selected-user/); assert.equal(await f.json(f.cli, argv), null);
    const hidden = await f.run(f.cli, ["user", "profile", kind, "update", "synthetic-token", "--body", "{}"]);
    assert.equal(hidden.exitCode, 0, hidden.stderr); assert.doesNotMatch(hidden.stdout + hidden.stderr, /synthetic-token/); assert.match(hidden.stdout, /redacted/);
  }
});

test("US-051 list searches and tags of an explicitly selected user", async t => {
  await storyCase(t, {"argv":["user","saved-queries","list","user /?","--fields","id","--start","7","--page-size","20"],"method":"GET","path":"/api/users/user%20%2F%3F/savedQueries","query":[["fields","id"],["$skip","7"],["$top","20"]],"response":[],"result":{"count":0,"items":[],"hasMore":false,"nextStart":null}});
  await storyCase(t, {"argv":["user","tags","list","user /?","--fields","id","--start","7","--page-size","20"],"method":"GET","path":"/api/users/user%20%2F%3F/tags","query":[["fields","id"],["$skip","7"],["$top","20"]],"response":[],"result":{"count":0,"items":[],"hasMore":false,"nextStart":null}});
});

test("US-052 filter groups and add the selected direct member without discovery", async t => {
  await storyCase(t, {"argv":["group","list","--query","team name /?","--fields","id","--start","7","--page-size","20"],"method":"GET","path":"/api/groups","query":[["fields","id"],["$skip","7"],["$top","20"],["query","team name /?"]],"response":[],"result":{"count":0,"items":[],"hasMore":false,"nextStart":null}});
  await storyCase(t, {"argv":["group","member","add","group /?","user /?","--body","{\"id\":\"user /?\",\"$type\":\"User\"}","--fields","id"],"method":"POST","path":"/api/groups/group%20%2F%3F/ownUsers/user%20%2F%3F","query":[["fields","id"]],"body":{"id":"user /?","$type":"User"},"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"},"update":true});
});

test("US-052 conflicting body IDs fail before HTTP and path-selected empty member writes stay readable", async t => {
  const f = await configuredFixture(t, { permissions: ["Update"] }); let calls = 0;
  server.use(http.post("*", () => { calls++; return new HttpResponse(null, { status: 204 }); }));
  await assert.rejects(f.cli.execute(["group", "member", "add", "group", "selected-user", "--body", '{"id":"other-user"}']));
  assert.equal(calls, 0);
  const argv = ["group", "member", "add", "selected-group", "selected-user", "--body", "{}"];
  const r = await f.run(f.cli, argv); assert.equal(r.exitCode, 0, r.stderr); assert.match(r.stdout, /selected-user.*selected-group/);
  assert.equal(await f.json(f.cli, argv), null);
});

test("US-010 delete only the selected issue comment", async t => {
  await storyCase(t, {"argv":["issues","comments","delete","issue /?","comment /?","--fields","id"],"method":"DELETE","path":"/api/issues/issue%20%2F%3F/comments/comment%20%2F%3F","query":[["fields","id"]],"response":undefined,"result":null,"update":true});
});

test("US-013 delete the selected saved query with query-free defaults", async t => {
  await storyCase(t, {"argv":["saved-queries","delete","query /?"],"method":"DELETE","path":"/api/savedQueries/query%20%2F%3F","query":[],"response":undefined,"result":null,"update":true});
});

test("US-015 read tag usage with repeatable native custom fields before selected tag cleanup", async t => {
  await storyCase(t, {"argv":["tags","issues","list","tag /?","--custom-field","Priority","--custom-field","State","--custom-field","Priority","--fields","id","--start","7","--page-size","20"],"method":"GET","path":"/api/tags/tag%20%2F%3F/issues","query":[["fields","id"],["$skip","7"],["$top","20"],["customFields","Priority"],["customFields","State"],["customFields","Priority"]],"response":[],"result":{"count":0,"items":[],"hasMore":false,"nextStart":null}});
  await storyCase(t, {"argv":["tags","delete","tag /?","--fields","id"],"method":"DELETE","path":"/api/tags/tag%20%2F%3F","query":[["fields","id"]],"response":undefined,"result":null,"update":true});
});

test("US-020 delete only the selected issue without search expansion", async t => {
  await storyCase(t, {"argv":["issues","delete","issue /?"],"method":"DELETE","path":"/api/issues/issue%20%2F%3F","query":[],"response":undefined,"result":null,"update":true});
});

test("US-024 manage native child articles and remove only the hierarchy relation", async t => {
  await storyCase(t, {"argv":["article","child","add","article /?","--body","{\"id\":\"child /?\",\"$type\":\"Article\"}","--fields","id","--mute-update-notifications","false"],"method":"POST","path":"/api/articles/article%20%2F%3F/childArticles","query":[["fields","id"],["muteUpdateNotifications","false"]],"body":{"id":"child /?","$type":"Article"},"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"},"update":true});
  await storyCase(t, {"argv":["article","child","update","article /?","child /?","--body","{\"summary\":null,\"content\":\"Synthetic child content\"}","--fields","id","--mute-update-notifications","true"],"method":"POST","path":"/api/articles/article%20%2F%3F/childArticles/child%20%2F%3F","query":[["fields","id"],["muteUpdateNotifications","true"]],"body":{"summary":null,"content":"Synthetic child content"},"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"},"update":true});
  await storyCase(t, {"argv":["article","child","remove","article /?","child /?"],"method":"DELETE","path":"/api/articles/article%20%2F%3F/childArticles/child%20%2F%3F","query":[],"response":undefined,"result":null,"update":true});
});

test("US-027 delete only the selected article comment", async t => {
  await storyCase(t, {"argv":["article","comment","delete","article /?","comment /?","--fields","id"],"method":"DELETE","path":"/api/articles/article%20%2F%3F/comments/comment%20%2F%3F","query":[["fields","id"]],"response":undefined,"result":null,"update":true});
});

test("M05 new collections preserve raw paging and repeated-field SDK validation before HTTP", async t => {
  const f = await configuredFixture(t, { permissions: ["ReadOnly"] }); let calls = 0;
  server.use(http.get("*", ({ request }) => { calls++; const q = new URL(request.url).searchParams; return HttpResponse.json(q.get("$top") === "0" ? [] : [{ id: "same" }, { id: "same" }]); }));
  for (const argv of [["user", "saved-queries", "list", "user"], ["user", "tags", "list", "user"], ["tags", "issues", "list", "tag"]]) {
    assert.deepEqual(await f.cli.execute([...argv, "--start", "3", "--page-size", "2"]), { count: 2, items: [{ id: "same" }, { id: "same" }], hasMore: null, nextStart: 5 });
    assert.deepEqual(await f.cli.execute([...argv, "--page-size", "0"]), { count: 0, items: [], hasMore: null, nextStart: null });
    const before = calls; await assert.rejects(f.cli.execute([...argv, "--start", String(Number.MAX_SAFE_INTEGER), "--page-size", "1"])); assert.equal(calls, before);
  }
  const { listTagIssues } = await import("../src/issue-relations.js"); let requests = 0;
  const connection = { baseUrl: "https://youtrack.example.test", token: "synthetic-token", fetch: (async () => { requests++; return Response.json([]); }) as typeof fetch };
  for (const customFields of [null, "State", [42]]) await assert.rejects(listTagIssues(connection, "tag", { customFields } as never));
  assert.equal(requests, 0);
});

test("M05 empty cleanup confirmations identify selected objects without discovery or credential echoes", async t => {
  const f = await configuredFixture(t, { permissions: ["Update"] }); let calls = 0;
  server.use(http.all("*", () => { calls++; return new HttpResponse(null, { status: 204 }); }));
  const rows = [
    ["issues", "comments", "delete", "selected-issue", "selected-comment"],
    ["saved-queries", "delete", "selected-query"], ["tags", "delete", "selected-tag"], ["issues", "delete", "selected-issue"],
    ["article", "child", "add", "selected-parent", "--body", '{"id":"selected-child"}'],
    ["article", "child", "update", "selected-parent", "selected-child", "--body", '{"summary":null}'],
    ["article", "child", "remove", "selected-parent", "selected-child"], ["article", "comment", "delete", "selected-parent", "selected-comment"],
  ];
  for (const argv of rows) {
    const before = calls; const r = await f.run(f.cli, argv); assert.equal(r.exitCode, 0, r.stderr); assert.match(r.stdout, /selected-/); assert.equal(calls, before + 1);
    if (argv[1] === "child") { assert.match(r.stdout, /selected-parent/); assert.match(r.stdout, /selected-child/); }
    assert.equal(await f.json(f.cli, argv), null);
  }
  const hidden = await f.run(f.cli, ["tags", "delete", "synthetic-token"]); assert.equal(hidden.exitCode, 0, hidden.stderr);
  assert.doesNotMatch(hidden.stdout + hidden.stderr, /synthetic-token/); assert.match(hidden.stdout, /redacted/);
});

test("M05 descriptor views print native profile values without object dumps", async t => {
  const f = await configuredFixture(t, { permissions: ["ReadOnly"] });
  server.use(http.get("*", () => HttpResponse.json({ timezone: { id: "Europe/Berlin", presentation: "Berlin time", $type: "TimeZoneDescriptor" }, locale: { id: "locale", name: "Synthetic locale" }, dateFieldFormat: { id: "date", pattern: "yyyy-MM-dd" }, periodFormat: { id: "FULL", $type: "PeriodFieldFormat" }, $type: "GeneralUserProfile" })));
  const general = await f.run(f.cli, ["user", "profile", "general", "get", "selected-user"]);
  assert.equal(general.exitCode, 0, general.stderr); assert.match(general.stdout, /Berlin time/); assert.match(general.stdout, /yyyy-MM-dd/); assert.match(general.stdout, /Synthetic locale/);
  const time = await f.run(f.cli, ["user", "profile", "time-tracking", "get", "selected-user"]);
  assert.equal(time.exitCode, 0, time.stderr); assert.match(time.stdout, /FULL/); assert.doesNotMatch(general.stdout + time.stdout, /\$type|TimeZoneDescriptor|PeriodFieldFormat|\[object Object\]/);
});
