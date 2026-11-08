import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { configuredFixture } from "./cli-fixture.js";
const server = setupServer();
before(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers()); after(() => server.close());
const started = 1700000000000;
const rows = [
  { argv: ["server", "telemetry", "get"], path: "/context/api/admin/telemetry", data: { id: "synthetic-telemetry", startedTime: started, uptime: "Synthetic uptime", $type: "Telemetry" }, title: /Server telemetry/, detail: /2023-11-14T22:13:20/, raw: /1700000000000/ },
  { argv: ["server-settings", "system-settings", "get"], path: "/context/api/admin/globalSettings/systemSettings", data: { id: "synthetic-system", maxUploadFileSize: 10485760, maxExportItems: 250, allowStatisticsCollection: false, $type: "SystemSettings" }, title: /System settings/, detail: /10(?:\.0+)?\s+MiB/, raw: /10485760/ },
  { argv: ["server-settings", "rest-settings", "get"], path: "/context/api/admin/globalSettings/restSettings", data: { id: "synthetic-cors", allowedOrigins: ["https://client.example.test/context:8080"], allowAllOrigins: false, $type: "RestCorsSettings" }, title: /CORS settings/, detail: /https:\/\/client.example.test\/context:8080/, raw: /\$type/ },
  { argv: ["server-settings", "get"], path: "/context/api/admin/globalSettings", data: { id: "synthetic-global", $type: "GlobalSettings" }, title: /Global settings/, detail: /synthetic-global/, raw: /\$type/ },
];

test("M08 default status views format dates and sizes and hide service metadata", async t => {
  const f = await configuredFixture(t);
  for (const row of rows) {
    server.use(http.get("*", ({ request }) => { assert.equal(new URL(request.url).pathname, row.path); return HttpResponse.json(row.data); }));
    const r = await f.run(f.cli, row.argv); assert.equal(r.exitCode, 0, r.stderr);
    assert.match(r.stdout, row.title); assert.match(r.stdout, row.detail); assert.doesNotMatch(r.stdout, row.raw); assert.doesNotMatch(r.stdout, /\$type/);
  }
});

test("M08 explicit projections and JSON execute RPC retain native dates sizes and metadata", async t => {
  const f = await configuredFixture(t);
  for (const row of rows) {
    server.use(http.get("*", () => HttpResponse.json(row.data)));
    const r = await f.run(f.cli, [...row.argv, "--fields", "id,startedTime,maxUploadFileSize,$type"]);
    assert.equal(r.exitCode, 0, r.stderr); assert.match(r.stdout, row.raw);
    assert.deepEqual(await f.cli.execute(row.argv), row.data); assert.deepEqual(await f.json(f.cli, row.argv), row.data);
    const [reply] = await f.rpc(f.cli, [row.argv]) as { result: unknown }[]; assert.deepEqual(reply!.result, row.data);
  }
});

test("M08 sparse default records and empty CORS selections do not invent status values", async t => {
  const f = await configuredFixture(t);
  server.use(http.get("*", () => HttpResponse.json({})));
  for (const row of rows) { const r = await f.run(f.cli, row.argv); assert.equal(r.exitCode, 0, r.stderr); assert.match(r.stdout, row.title); assert.doesNotMatch(r.stdout, /1970|NaN|undefined|No allowed origins/); }
  server.use(http.get("*", () => HttpResponse.json({ allowedOrigins: [], allowAllOrigins: false })));
  const empty = await f.run(f.cli, ["server-settings", "rest-settings", "get"]); assert.equal(empty.exitCode, 0, empty.stderr); assert.match(empty.stdout, /No allowed origins/); assert.match(empty.stdout, /no/);
});
