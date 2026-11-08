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
