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

test("US-029 create and update a board and mute sprint creation without discovery", async t => {
  await storyCase(t, { argv: ["agile", "create", "--body", '{"name":"Synthetic board","projects":[{"id":"p /?"}],"sprintsSettings":{"disableSprints":false}}', "--template", "future-template", "--fields", "id"], method: "POST", path: "/api/agiles", query: [["fields", "id"], ["template", "future-template"]], body: { name: "Synthetic board", projects: [{ id: "p /?" }], sprintsSettings: { disableSprints: false } }, response: detail, result: detail, update: true });
  await storyCase(t, { argv: ["agile", "update", "board /?", "--body", '{"name":"Renamed board","orphansAtTheTop":false}', "--fields", "id"], method: "POST", path: "/api/agiles/board%20%2F%3F", query: [["fields", "id"]], body: { name: "Renamed board", orphansAtTheTop: false }, response: undefined, result: null, update: true });
  await storyCase(t, { argv: ["sprint", "create", "board /?", "--body", '{"name":"Synthetic sprint","goal":null}', "--fields", "id", "--mute-update-notifications", "false"], method: "POST", path: "/api/agiles/board%20%2F%3F/sprints", query: [["fields", "id"], ["muteUpdateNotifications", "false"]], body: { name: "Synthetic sprint", goal: null }, response: detail, result: detail, update: true });
});

test("US-031 create a named enum choice with native metadata", async t => {
  await storyCase(t, { argv: ["bundle", "enum", "value", "create", "bundle /?", "--body", '{"name":"Synthetic choice","localizedName":null,"archived":false,"color":{"id":"style"}}', "--fields", "id"], method: "POST", path: "/api/admin/customFieldSettings/bundles/enum/bundle%20%2F%3F/values", query: [["fields", "id"]], body: { name: "Synthetic choice", localizedName: null, archived: false, color: { id: "style" } }, response: detail, result: detail, update: true });
});

test("US-032 update and archive an exact enum value without discovery", async t => {
  await storyCase(t, { argv: ["bundle", "enum", "value", "update", "bundle /?", "value /?", "--body", '{"archived":true,"description":null}', "--fields", "id"], method: "POST", path: "/api/admin/customFieldSettings/bundles/enum/bundle%20%2F%3F/values/value%20%2F%3F", query: [["fields", "id"]], body: { archived: true, description: null }, response: undefined, result: null, update: true });
});

test("US-033 create a version with native null dates and false release state", async t => {
  await storyCase(t, { argv: ["bundle", "version", "value", "create", "bundle /?", "--body", '{"name":"Synthetic version","releaseDate":null,"startDate":0,"released":false}', "--fields", "id"], method: "POST", path: "/api/admin/customFieldSettings/bundles/version/bundle%20%2F%3F/values", query: [["fields", "id"]], body: { name: "Synthetic version", releaseDate: null, startDate: 0, released: false }, response: detail, result: detail, update: true });
});
