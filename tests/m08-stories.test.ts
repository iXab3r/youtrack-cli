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

test("US-071 read a single schema document and safe installation status", async t => {
  await storyCase(t, {"argv":["api-schema","get"],"method":"GET","path":"/api/openapi.json","query":[],"response":{"openapi":"3.0.1","info":{"title":"Synthetic API","version":"synthetic-version"},"paths":{}},"result":{"openapi":"3.0.1","info":{"title":"Synthetic API","version":"synthetic-version"},"paths":{}}});
  await storyCase(t, {"argv":["server","telemetry","get","--fields","id"],"method":"GET","path":"/api/admin/telemetry","query":[["fields","id"]],"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"}});
  await storyCase(t, {"argv":["server-settings","get","--fields","id"],"method":"GET","path":"/api/admin/globalSettings","query":[["fields","id"]],"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"}});
});

test("US-071 root settings redact native license values and echoes without follow-up reads", async t => {
  const f = await configuredFixture(t); let calls = 0; const license = 'synthetic-license"\\';
  server.use(http.get("*", ({ request }) => {
    calls++; assert.equal(new URL(request.url).pathname, "/context/api/admin/globalSettings");
    assert.equal(new URL(request.url).searchParams.get("fields"), "license,error,metadata");
    return HttpResponse.json({ license: { username: null, license, error: `Invalid ${license}` }, metadata: JSON.stringify({ license }), [license]: license });
  }));
  const argv = ["server-settings", "get", "--fields", "license,error,metadata"];
  for (const mode of ["execute", "human", "json", "rpc"]) {
    let value: unknown;
    if (mode === "execute") value = await f.cli.execute(argv);
    else if (mode === "rpc") value = await f.rpc(f.cli, [argv]);
    else { const r = await f.run(f.cli, [...argv, ...(mode === "json" ? ["--json"] : [])]); assert.equal(r.exitCode, 0, r.stderr); value = r.stdout; }
    const encoded = typeof value === "string" ? value : JSON.stringify(value);
    assert(!encoded.includes(license)); assert(!encoded.includes(JSON.stringify(license).slice(1,-1)));
  } assert.equal(calls, 4);
});
