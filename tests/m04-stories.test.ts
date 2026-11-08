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
