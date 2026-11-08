import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { configuredFixture } from "./cli-fixture.js";
import { createStoryCase } from "./story-case.js";
const server = setupServer();
before(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
after(() => server.close());
const storyCase = createStoryCase(server);

test("US-061 maintain global work item types with native attachment flags", async t => {
  await storyCase(t, {"argv":["work-item-type","create","--body","{\"name\":\"Synthetic work type\",\"autoAttached\":false}","--fields","id"],"method":"POST","path":"/api/admin/timeTrackingSettings/workItemTypes","query":[["fields","id"]],"body":{"name":"Synthetic work type","autoAttached":false},"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"},"update":true});
  await storyCase(t, {"argv":["work-item-type","update","type /?","--body","{\"name\":\"Renamed work type\",\"autoAttached\":true}","--fields","id"],"method":"POST","path":"/api/admin/timeTrackingSettings/workItemTypes/type%20%2F%3F","query":[["fields","id"]],"body":{"name":"Renamed work type","autoAttached":true},"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"},"update":true});
  await storyCase(t, {"argv":["work-item-type","delete","type /?","--fields","id"],"method":"DELETE","path":"/api/admin/timeTrackingSettings/workItemTypes/type%20%2F%3F","query":[["fields","id"]],"response":undefined,"result":null,"update":true});
});


test("US-061 native work-type requirements and empty replies retain selected identity", async t => {
  const f = await configuredFixture(t, { permissions: ["Update"] }); let calls = 0;
  server.use(http.post("*", () => { calls++; return new HttpResponse(null, { status: 204 }); }));
  for (const body of [{}, { name: "Synthetic", autoAttached: "false" }]) {
    await assert.rejects(f.cli.execute(["work-item-type", "create", "--body", JSON.stringify(body)])); assert.equal(calls, 0);
  }
  const argv = ["work-item-type", "create", "--body", '{"name":"Selected work type","autoAttached":false}'];
  const result = await f.run(f.cli, argv); assert.equal(result.exitCode, 0, result.stderr); assert.match(result.stdout, /Selected work type/);
  assert.equal(await f.json(f.cli, argv), null); assert.equal(calls, 2);
});
