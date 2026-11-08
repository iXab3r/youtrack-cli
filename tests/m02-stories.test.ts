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
