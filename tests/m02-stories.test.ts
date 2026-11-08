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

test("US-018 command controls retain explicit targets, false flags, caret and native visibility", async t => {
  const body = { query: "State Fixed", issues: [{ idReadable: "DEMO-1" }, { id: "2-1" }], comment: "Synthetic\ncontext", visibility: { $type: "CommandLimitedVisibility", permittedGroups: [{ id: "g /?" }], permittedUsers: [] }, caret: -1, silent: false, runAs: "synthetic-login" };
  await storyCase(t, { argv: ["commands", "apply", "--query", "State Fixed", "--issues", "DEMO-1,2-1", "--comment", "Synthetic\ncontext", "--visibility", JSON.stringify(body.visibility), "--caret", "-1", "--silent", "false", "--run-as", "synthetic-login", "--fields", "id", "--mute-update-notifications", "false"], method: "POST", path: "/api/commands", query: [["fields", "id"], ["muteUpdateNotifications", "false"]], body, response: detail, result: detail, update: true });
});

test("US-019 global activity list detail and cursor page preserve native filters", async t => {
  await storyCase(t, { argv: ["activities", "list", "--categories", "CommentsCategory,IssueCreatedCategory", "--issue-query", "project: DEMO", "--author", "me", "--activity-start", "-1", "--activity-end", "9223372036854775807", "--reverse", "--start", "7", "--fields", "id"], method: "GET", path: "/api/activities", query: [["fields", "id"], ["$top", "50"], ["$skip", "7"], ["categories", "CommentsCategory,IssueCreatedCategory"], ["issueQuery", "project: DEMO"], ["author", "me"], ["start", "-1"], ["end", "9223372036854775807"], ["reverse", "true"]], response: [], result: emptyPage });
  await storyCase(t, { argv: ["activities", "get", "activity /?", "--fields", "id"], method: "GET", path: "/api/activities/activity%20%2F%3F", query: [["fields", "id"]], response: detail, result: detail });
  const cursor = { id: "page", activities: [], beforeCursor: "before /?", afterCursor: "after /?", hasBefore: false, hasAfter: true, reverse: true };
  await storyCase(t, { argv: ["activities", "page", "--categories", "CommentsCategory", "--activity-id", "activity /?", "--issue-query", "project: DEMO", "--author", "me", "--activity-start", "000", "--activity-end", "-1", "--cursor", "before /?", "--reverse", "--fields", "id,activities"], method: "GET", path: "/api/activitiesPage", query: [["fields", "id,activities"], ["categories", "CommentsCategory"], ["activityId", "activity /?"], ["issueQuery", "project: DEMO"], ["author", "me"], ["start", "000"], ["end", "-1"], ["cursor", "before /?"], ["reverse", "true"]], response: cursor, result: cursor });
});
