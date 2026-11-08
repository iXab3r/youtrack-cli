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

test("US-063 separate project field removal from global field deletion", async t => {
  await storyCase(t, {"argv":["project","field","delete","project /?","field /?","--fields","id"],"method":"DELETE","path":"/api/admin/projects/project%20%2F%3F/customFields/field%20%2F%3F","query":[["fields","id"]],"response":undefined,"result":null,"update":true});
  await storyCase(t, {"argv":["field","delete","field /?"],"method":"DELETE","path":"/api/admin/customFieldSettings/customFields/field%20%2F%3F","query":[],"response":undefined,"result":null,"update":true});
});

test("US-063 a rejected global deletion does not replay or compensate project field removal", async t => {
  const f = await configuredFixture(t, { permissions: ["Update"] }); const seen: string[] = [];
  server.use(http.delete("*", ({ request }) => {
    const path = new URL(request.url).pathname; seen.push(path);
    return path.includes("/projects/") ? new HttpResponse(null, { status: 204 }) : new HttpResponse("synthetic-token private-response", { status: 409 });
  }));
  assert.equal(await f.cli.execute(["project", "field", "delete", "selected-project", "selected-project-field"]), null);
  await assert.rejects(f.cli.execute(["field", "delete", "selected-global-field"]), (error: Error) => { assert.match(error.message, /HTTP 409/); assert.doesNotMatch(error.message, /outcome is unknown|synthetic-token|private-response/); return true; });
  assert.deepEqual(seen, ["/context/api/admin/projects/selected-project/customFields/selected-project-field", "/context/api/admin/customFieldSettings/customFields/selected-global-field"]);
});

test("US-064 delete only the caller-selected project", async t => {
  await storyCase(t, {"argv":["project","delete","project /?"],"method":"DELETE","path":"/api/admin/projects/project%20%2F%3F","query":[],"response":undefined,"result":null,"update":true});
});

test("US-065 maintain enum bundles and delete selected values", async t => {
  await storyCase(t, {"argv":["bundle","enum","create","--body","{\"name\":\"Synthetic enum bundle\",\"values\":[{\"name\":\"Synthetic value\"}]}","--fields","id"],"method":"POST","path":"/api/admin/customFieldSettings/bundles/enum","query":[["fields","id"]],"body":{"name":"Synthetic enum bundle","values":[{"name":"Synthetic value"}]},"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"},"update":true});
  await storyCase(t, {"argv":["bundle","enum","update","bundle /?","--body","{\"name\":\"Renamed enum bundle\",\"values\":[]}","--fields","id"],"method":"POST","path":"/api/admin/customFieldSettings/bundles/enum/bundle%20%2F%3F","query":[["fields","id"]],"body":{"name":"Renamed enum bundle","values":[]},"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"},"update":true});
  await storyCase(t, {"argv":["bundle","enum","delete","bundle /?","--fields","id"],"method":"DELETE","path":"/api/admin/customFieldSettings/bundles/enum/bundle%20%2F%3F","query":[["fields","id"]],"response":undefined,"result":null,"update":true});
  await storyCase(t, {"argv":["bundle","enum","value","delete","bundle /?","value /?"],"method":"DELETE","path":"/api/admin/customFieldSettings/bundles/enum/bundle%20%2F%3F/values/value%20%2F%3F","query":[],"response":undefined,"result":null,"update":true});
});

test("US-065 bundle bodies keep sample metadata without inventing a required bundle name", async t => {
  const f = await configuredFixture(t, { permissions: ["Update"] }); const seen: unknown[] = [];
  server.use(http.post("*", async ({ request }) => { seen.push(await request.json()); return new HttpResponse(null, { status: 204 }); }));
  assert.equal(await f.cli.execute(["bundle", "enum", "create", "--body", '{"values":[]}']), null);
  const r = await f.run(f.cli, ["bundle", "enum", "create", "--body", '{"name":"Selected enum bundle","values":[]}']);
  assert.equal(r.exitCode, 0, r.stderr); assert.match(r.stdout, /Selected enum bundle/);
  assert.deepEqual(seen, [{ values: [] }, { name: "Selected enum bundle", values: [] }]);
});

test("US-066 maintain state bundles and delete selected values", async t => {
  await storyCase(t, {"argv":["bundle","state","create","--body","{\"name\":\"Synthetic state bundle\",\"values\":[{\"name\":\"Synthetic value\",\"isResolved\":false}]}","--fields","id"],"method":"POST","path":"/api/admin/customFieldSettings/bundles/state","query":[["fields","id"]],"body":{"name":"Synthetic state bundle","values":[{"name":"Synthetic value","isResolved":false}]},"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"},"update":true});
  await storyCase(t, {"argv":["bundle","state","update","bundle /?","--body","{\"name\":\"Renamed state bundle\",\"values\":[]}","--fields","id"],"method":"POST","path":"/api/admin/customFieldSettings/bundles/state/bundle%20%2F%3F","query":[["fields","id"]],"body":{"name":"Renamed state bundle","values":[]},"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"},"update":true});
  await storyCase(t, {"argv":["bundle","state","delete","bundle /?","--fields","id"],"method":"DELETE","path":"/api/admin/customFieldSettings/bundles/state/bundle%20%2F%3F","query":[["fields","id"]],"response":undefined,"result":null,"update":true});
  await storyCase(t, {"argv":["bundle","state","value","delete","bundle /?","value /?"],"method":"DELETE","path":"/api/admin/customFieldSettings/bundles/state/bundle%20%2F%3F/values/value%20%2F%3F","query":[],"response":undefined,"result":null,"update":true});
});

test("US-067 maintain version bundles and delete selected values", async t => {
  await storyCase(t, {"argv":["bundle","version","create","--body","{\"name\":\"Synthetic version bundle\",\"values\":[{\"name\":\"Synthetic value\",\"released\":false,\"releaseDate\":null,\"startDate\":null}]}","--fields","id"],"method":"POST","path":"/api/admin/customFieldSettings/bundles/version","query":[["fields","id"]],"body":{"name":"Synthetic version bundle","values":[{"name":"Synthetic value","released":false,"releaseDate":null,"startDate":null}]},"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"},"update":true});
  await storyCase(t, {"argv":["bundle","version","update","bundle /?","--body","{\"name\":\"Renamed version bundle\",\"values\":[]}","--fields","id"],"method":"POST","path":"/api/admin/customFieldSettings/bundles/version/bundle%20%2F%3F","query":[["fields","id"]],"body":{"name":"Renamed version bundle","values":[]},"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"},"update":true});
  await storyCase(t, {"argv":["bundle","version","delete","bundle /?","--fields","id"],"method":"DELETE","path":"/api/admin/customFieldSettings/bundles/version/bundle%20%2F%3F","query":[["fields","id"]],"response":undefined,"result":null,"update":true});
  await storyCase(t, {"argv":["bundle","version","value","delete","bundle /?","value /?"],"method":"DELETE","path":"/api/admin/customFieldSettings/bundles/version/bundle%20%2F%3F/values/value%20%2F%3F","query":[],"response":undefined,"result":null,"update":true});
});

test("US-068 maintain build bundles and native value metadata", async t => {
  await storyCase(t, {"argv":["bundle","build","create","--body","{\"name\":\"Synthetic build bundle\",\"values\":[{\"name\":\"Synthetic build value\",\"archived\":false,\"assembleDate\":null}]}","--fields","id"],"method":"POST","path":"/api/admin/customFieldSettings/bundles/build","query":[["fields","id"]],"body":{"name":"Synthetic build bundle","values":[{"name":"Synthetic build value","archived":false,"assembleDate":null}]},"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"},"update":true});
  await storyCase(t, {"argv":["bundle","build","update","bundle /?","--body","{\"values\":[]}","--fields","id"],"method":"POST","path":"/api/admin/customFieldSettings/bundles/build/bundle%20%2F%3F","query":[["fields","id"]],"body":{"values":[]},"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"},"update":true});
  await storyCase(t, {"argv":["bundle","build","value","create","bundle /?","--body","{\"name\":\"Synthetic build value\",\"archived\":false,\"assembleDate\":null}","--fields","id"],"method":"POST","path":"/api/admin/customFieldSettings/bundles/build/bundle%20%2F%3F/values","query":[["fields","id"]],"body":{"name":"Synthetic build value","archived":false,"assembleDate":null},"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"},"update":true});
  await storyCase(t, {"argv":["bundle","build","value","update","bundle /?","value /?","--body","{\"description\":null,\"ordinal\":0,\"archived\":true,\"assembleDate\":0}","--fields","id"],"method":"POST","path":"/api/admin/customFieldSettings/bundles/build/bundle%20%2F%3F/values/value%20%2F%3F","query":[["fields","id"]],"body":{"description":null,"ordinal":0,"archived":true,"assembleDate":0},"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"},"update":true});
  await storyCase(t, {"argv":["bundle","build","delete","bundle /?"],"method":"DELETE","path":"/api/admin/customFieldSettings/bundles/build/bundle%20%2F%3F","query":[],"response":undefined,"result":null,"update":true});
  await storyCase(t, {"argv":["bundle","build","value","delete","bundle /?","value /?","--fields","id"],"method":"DELETE","path":"/api/admin/customFieldSettings/bundles/build/bundle%20%2F%3F/values/value%20%2F%3F","query":[["fields","id"]],"response":undefined,"result":null,"update":true});
});

test("US-068 build value creation needs a name and empty replies identify its bundle", async t => {
  const f = await configuredFixture(t, { permissions: ["Update"] }); let calls = 0;
  server.use(http.post("*", () => { calls++; return new HttpResponse(null, { status: 204 }); }));
  await assert.rejects(f.cli.execute(["bundle", "build", "value", "create", "selected-bundle", "--body", '{"assembleDate":null}'])); assert.equal(calls, 0);
  const result = await f.run(f.cli, ["bundle", "build", "value", "create", "selected-bundle", "--body", '{"name":"Selected build","assembleDate":null}']);
  assert.equal(result.exitCode, 0, result.stderr); assert.match(result.stdout, /Selected build/); assert.match(result.stdout, /selected-bundle/); assert.equal(calls, 1);
});

test("US-068 adjacent empty value updates scrub selected IDs and show bundle context", async t => {
  const f = await configuredFixture(t, { permissions: ["Update"] });
  server.use(http.post("*", () => new HttpResponse(null, { status: 204 })));
  for (const family of ["version", "build"]) {
    const argv = ["bundle", family, "value", "update", "selected-bundle", "synthetic-token", "--body", "{}"];
    const r = await f.run(f.cli, argv); assert.equal(r.exitCode, 0, r.stderr); assert.doesNotMatch(r.stdout, /synthetic-token/); assert.match(r.stdout, /selected-bundle/);
    assert.equal(await f.json(f.cli, argv), null);
  }
});

test("US-069 maintain owned bundles and native value metadata", async t => {
  await storyCase(t, {"argv":["bundle","owned","create","--body","{\"name\":\"Synthetic owned bundle\",\"values\":[{\"name\":\"Synthetic owned value\",\"archived\":false,\"owner\":{\"id\":\"owner /?\"}}]}","--fields","id"],"method":"POST","path":"/api/admin/customFieldSettings/bundles/ownedField","query":[["fields","id"]],"body":{"name":"Synthetic owned bundle","values":[{"name":"Synthetic owned value","archived":false,"owner":{"id":"owner /?"}}]},"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"},"update":true});
  await storyCase(t, {"argv":["bundle","owned","update","bundle /?","--body","{\"values\":[]}","--fields","id"],"method":"POST","path":"/api/admin/customFieldSettings/bundles/ownedField/bundle%20%2F%3F","query":[["fields","id"]],"body":{"values":[]},"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"},"update":true});
  await storyCase(t, {"argv":["bundle","owned","value","create","bundle /?","--body","{\"name\":\"Synthetic owned value\",\"archived\":false,\"owner\":{\"id\":\"owner /?\"}}","--fields","id"],"method":"POST","path":"/api/admin/customFieldSettings/bundles/ownedField/bundle%20%2F%3F/values","query":[["fields","id"]],"body":{"name":"Synthetic owned value","archived":false,"owner":{"id":"owner /?"}},"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"},"update":true});
  await storyCase(t, {"argv":["bundle","owned","value","update","bundle /?","value /?","--body","{\"description\":null,\"ordinal\":0,\"archived\":true,\"owner\":null}","--fields","id"],"method":"POST","path":"/api/admin/customFieldSettings/bundles/ownedField/bundle%20%2F%3F/values/value%20%2F%3F","query":[["fields","id"]],"body":{"description":null,"ordinal":0,"archived":true,"owner":null},"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"},"update":true});
  await storyCase(t, {"argv":["bundle","owned","delete","bundle /?"],"method":"DELETE","path":"/api/admin/customFieldSettings/bundles/ownedField/bundle%20%2F%3F","query":[],"response":undefined,"result":null,"update":true});
  await storyCase(t, {"argv":["bundle","owned","value","delete","bundle /?","value /?","--fields","id"],"method":"DELETE","path":"/api/admin/customFieldSettings/bundles/ownedField/bundle%20%2F%3F/values/value%20%2F%3F","query":[["fields","id"]],"response":undefined,"result":null,"update":true});
});

test("US-069 owned values require names at creation and native nullable owner descriptors", async t => {
  const f = await configuredFixture(t, { permissions: ["Update"] }); let calls = 0;
  server.use(http.post("*", () => { calls++; return new HttpResponse(null, { status: 204 }); }));
  for (const body of [{ owner: null }, { name: "Synthetic", owner: "user-id" }, { name: "Synthetic", owner: [] }]) {
    await assert.rejects(f.cli.execute(["bundle", "owned", "value", "create", "selected-bundle", "--body", JSON.stringify(body)])); assert.equal(calls, 0);
  }
  const r = await f.run(f.cli, ["bundle", "owned", "value", "create", "selected-bundle", "--body", '{"name":"Selected owned value","owner":null}']);
  assert.equal(r.exitCode, 0, r.stderr); assert.match(r.stdout, /Selected owned value/); assert.match(r.stdout, /selected-bundle/); assert.equal(calls, 1);
});

test("US-070 maintain user bundles with native group and individual references", async t => {
  await storyCase(t, {"argv":["bundle","user","create","--body","{\"name\":\"Synthetic user bundle\",\"individuals\":[{\"id\":\"user /?\"}],\"groups\":[{\"id\":\"group /?\"}]}","--fields","id"],"method":"POST","path":"/api/admin/customFieldSettings/bundles/user","query":[["fields","id"]],"body":{"name":"Synthetic user bundle","individuals":[{"id":"user /?"}],"groups":[{"id":"group /?"}]},"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"},"update":true});
  await storyCase(t, {"argv":["bundle","user","update","bundle /?","--body","{\"individuals\":[],\"groups\":[]}","--fields","id"],"method":"POST","path":"/api/admin/customFieldSettings/bundles/user/bundle%20%2F%3F","query":[["fields","id"]],"body":{"individuals":[],"groups":[]},"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"},"update":true});
  await storyCase(t, {"argv":["bundle","user","delete","bundle /?","--fields","id"],"method":"DELETE","path":"/api/admin/customFieldSettings/bundles/user/bundle%20%2F%3F","query":[["fields","id"]],"response":undefined,"result":null,"update":true});
});
