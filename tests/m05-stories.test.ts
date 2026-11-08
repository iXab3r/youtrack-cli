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
