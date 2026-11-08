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

test("US-062 update the native work schedule without locale conversion", async t => {
  await storyCase(t, {"argv":["time-tracking","work-time","update","--body","{\"minutesADay\":450,\"workDays\":[1,2,3,4,5]}","--fields","id"],"method":"POST","path":"/api/admin/timeTrackingSettings/workTimeSettings","query":[["fields","id"]],"body":{"minutesADay":450,"workDays":[1,2,3,4,5]},"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"},"update":true});
});

test("US-062 native Int32 calendar values preserve order and server-owned limits", async t => {
  const f = await configuredFixture(t, { permissions: ["Update"] }); let calls = 0;
  server.use(http.post("*", async ({ request }) => {
    calls++; assert.deepEqual(await request.json(), { minutesADay: -1, workDays: [0,6,0], firstDayOfWeek: 1, futureMetadata: null });
    return new HttpResponse("synthetic-token private-response", { status: 400 });
  }));
  for (const body of [{ minutesADay: 1.5 }, { minutesADay: 2147483648 }, { workDays: [1,"2"] }, { workDays: null }]) {
    await assert.rejects(f.cli.execute(["time-tracking", "work-time", "update", "--body", JSON.stringify(body)])); assert.equal(calls, 0);
  }
  await assert.rejects(f.cli.execute(["time-tracking", "work-time", "update", "--body", '{"minutesADay":-1,"workDays":[0,6,0],"firstDayOfWeek":1,"futureMetadata":null}']), (error: Error) => {
    assert.match(error.message, /HTTP 400/); assert.doesNotMatch(error.message, /synthetic-token|private-response|outcome is unknown/); return true;
  }); assert.equal(calls, 1);
});
