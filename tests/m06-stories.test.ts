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

test("US-028 delete an explicitly selected article", async t => {
  await storyCase(t, {"argv":["article","delete","article /?","--fields","id"],"method":"DELETE","path":"/api/articles/article%20%2F%3F","query":[["fields","id"]],"response":undefined,"result":null,"update":true});
});

test("US-030 delete only selected sprint and board identities", async t => {
  await storyCase(t, {"argv":["sprint","delete","board /?","sprint /?","--fields","id"],"method":"DELETE","path":"/api/agiles/board%20%2F%3F/sprints/sprint%20%2F%3F","query":[["fields","id"]],"response":undefined,"result":null,"update":true});
  await storyCase(t, {"argv":["agile","delete","board /?"],"method":"DELETE","path":"/api/agiles/board%20%2F%3F","query":[],"response":undefined,"result":null,"update":true});
});
