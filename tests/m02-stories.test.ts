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

test("US-012 create and edit saved searches preserve native fields and projection", async t => {
  await storyCase(t, { argv: ["saved-queries", "create", "--body", '{"name":"Synthetic queue","query":null,"visibleFor":null}', "--fields", "id"], method: "POST", path: "/api/savedQueries", query: [["fields", "id"]], body: { name: "Synthetic queue", query: null, visibleFor: null }, response: detail, result: detail, update: true });
  await storyCase(t, { argv: ["saved-queries", "update", "q /?", "--body", '{"query":"project: DEMO","updateableBy":null}', "--fields", "id"], method: "POST", path: "/api/savedQueries/q%20%2F%3F", query: [["fields", "id"]], body: { query: "project: DEMO", updateableBy: null }, response: undefined, result: null, update: true });
});

test("US-016 read and set the exact issue project without discovery", async t => {
  await storyCase(t, { argv: ["issues", "project", "get", "DEMO /?", "--fields", "id"], method: "GET", path: "/api/issues/DEMO%20%2F%3F/project", query: [["fields", "id"]], response: detail, result: detail });
  await storyCase(t, { argv: ["issues", "project", "set", "DEMO /?", "--body", '{"id":"target /?"}', "--fields", "id", "--mute-update-notifications", "false"], method: "POST", path: "/api/issues/DEMO%20%2F%3F/project", query: [["fields", "id"], ["muteUpdateNotifications", "false"]], body: { id: "target /?" }, response: detail, result: detail, update: true });
});

test("US-017 native VCS create, state update and exact removal retain opaque IDs", async t => {
  await storyCase(t, { argv: ["issues", "vcs-changes", "create", "DEMO-1", "--body", '{"version":"synthetic-version","state":4}', "--fields", "id", "--mute-update-notifications"], method: "POST", path: "/api/issues/DEMO-1/vcsChanges", query: [["fields", "id"], ["muteUpdateNotifications", "true"]], body: { version: "synthetic-version", state: 4 }, response: detail, result: detail, update: true });
  await storyCase(t, { argv: ["issues", "vcs-changes", "update", "DEMO-1", "change /?", "--body", '{"state":2}', "--fields", "id", "--mute-update-notifications", "false"], method: "POST", path: "/api/issues/DEMO-1/vcsChanges/change%20%2F%3F", query: [["fields", "id"], ["muteUpdateNotifications", "false"]], body: { state: 2 }, response: undefined, result: null, update: true });
  await storyCase(t, { argv: ["issues", "vcs-changes", "delete", "DEMO-1", "change /?"], method: "DELETE", path: "/api/issues/DEMO-1/vcsChanges/change%20%2F%3F", query: [], response: undefined, result: null, update: true });
});
