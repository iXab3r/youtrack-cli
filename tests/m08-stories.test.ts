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

test("US-074 read and update native system and CORS settings without local profile rewrites", async t => {
  await storyCase(t, {"argv":["server-settings","rest-settings","get","--fields","id"],"method":"GET","path":"/api/admin/globalSettings/restSettings","query":[["fields","id"]],"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"}});
  await storyCase(t, {"argv":["server-settings","system-settings","get","--fields","id"],"method":"GET","path":"/api/admin/globalSettings/systemSettings","query":[["fields","id"]],"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"}});
  await storyCase(t, {"argv":["server-settings","rest-settings","update","--body","{\"allowAllOrigins\":false,\"allowedOrigins\":[\"https://client.example.test/context:8080\",\"  native-origin  \"]}","--fields","id"],"method":"POST","path":"/api/admin/globalSettings/restSettings","query":[["fields","id"]],"body":{"allowAllOrigins":false,"allowedOrigins":["https://client.example.test/context:8080","  native-origin  "]},"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"},"update":true});
  await storyCase(t, {"argv":["server-settings","system-settings","update","--body","{\"allowStatisticsCollection\":false,\"isApplicationReadOnly\":false,\"baseUrl\":null,\"administratorEmail\":null,\"maxExportItems\":250}","--fields","id"],"method":"POST","path":"/api/admin/globalSettings/systemSettings","query":[["fields","id"]],"body":{"allowStatisticsCollection":false,"isApplicationReadOnly":false,"baseUrl":null,"administratorEmail":null,"maxExportItems":250},"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"},"update":true});
});

test("US-074 remote base URL changes preserve the selected local profile and literal inputs", async t => {
  const f = await configuredFixture(t, { permissions: ["ReadOnly", "Update"] }); const seen: string[] = [];
  const body = { baseUrl: "https://future.example.test/context/", administratorEmail: null, maxUploadFileSize: 9007199254740992, maxExportItems: -1, isApplicationReadOnly: false };
  server.use(http.all("*", async ({ request }) => {
    seen.push(request.method + " " + new URL(request.url).origin);
    if (request.method === "POST") assert.deepEqual(await request.json(), body);
    return HttpResponse.json({ id: "synthetic-settings", allowStatisticsCollection: false });
  }));
  assert.deepEqual(await f.cli.execute(["server-settings", "system-settings", "update", "--body", JSON.stringify(body)]), { id: "synthetic-settings", allowStatisticsCollection: false });
  await f.cli.execute(["server-settings", "system-settings", "get"]);
  assert.deepEqual(seen, ["POST https://youtrack.example.com", "GET https://youtrack.example.com"]);
  assert.equal((await f.profileStore.get("dev")).values.url, "https://youtrack.example.com/context");
});

test("US-074 native boolean, string-list and numeric types fail before HTTP", async t => {
  const f = await configuredFixture(t, { permissions: ["Update"] }); let calls = 0;
  server.use(http.all("*", () => { calls++; return HttpResponse.json({ id: "unexpected" }); }));
  for (const [section, body] of [
    ["rest-settings", { allowAllOrigins: "false" }], ["rest-settings", { allowedOrigins: [1] }],
    ["system-settings", { maxExportItems: 1.5 }], ["system-settings", { maxUploadFileSize: "large" }],
    ["system-settings", { baseUrl: false }], ["system-settings", { allowStatisticsCollection: "false" }],
  ] as const) {
    await assert.rejects(f.cli.execute(["server-settings", section, "update", "--body", JSON.stringify(body)])); assert.equal(calls, 0);
  }
});

test("US-072 inspect backup metadata and explicitly update native settings", async t => {
  await storyCase(t, {"argv":["backup","file","list","--fields","id","--start","7","--page-size","20"],"method":"GET","path":"/api/admin/databaseBackup/backups","query":[["fields","id"],["$skip","7"],["$top","20"]],"response":[],"result":{"count":0,"items":[],"hasMore":false,"nextStart":null}});
  await storyCase(t, {"argv":["backup","file","get","synthetic-backup","--fields","id"],"method":"GET","path":"/api/admin/databaseBackup/backups/synthetic-backup","query":[["fields","id"]],"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"}});
  await storyCase(t, {"argv":["backup","settings","get","--fields","id"],"method":"GET","path":"/api/admin/databaseBackup/settings","query":[["fields","id"]],"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"}});
  await storyCase(t, {"argv":["backup","status","get","--fields","id"],"method":"GET","path":"/api/admin/databaseBackup/settings/backupStatus","query":[["fields","id"]],"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"}});
  await storyCase(t, {"argv":["backup","settings","update","--body","{\"isOn\":false,\"archiveFormat\":\"ZIP\",\"location\":null,\"filesToKeep\":-1,\"cronExpression\":\" native cron \",\"notifiedUsers\":[]}","--fields","id"],"method":"POST","path":"/api/admin/databaseBackup/settings","query":[["fields","id"]],"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"},"body":{"isOn":false,"archiveFormat":"ZIP","location":null,"filesToKeep":-1,"cronExpression":" native cron ","notifiedUsers":[]},"update":true});
});


test("US-072 backup pages keep raw offsets and never fetch archives or poll", async t => {
  const f = await configuredFixture(t); let calls = 0; let rows: unknown[] = [];
  server.use(http.get("*", ({ request }) => { calls++; assert.equal(new URL(request.url).pathname, "/context/api/admin/databaseBackup/backups"); return HttpResponse.json(rows); }));
  const args = ["backup", "file", "list", "--start", "7", "--page-size", "20"];
  assert.deepEqual(await f.cli.execute(args), { count: 0, items: [], hasMore: false, nextStart: null });
  rows = [{ id: "synthetic-backup", name: "synthetic.zip", size: 1048576, creationDate: 1700000000000 }];
  assert.deepEqual(await f.cli.execute(args), { count: 1, items: rows, hasMore: null, nextStart: 8 });
  rows = []; assert.deepEqual(await f.cli.execute(["backup", "file", "list", "--page-size", "0"]), { count: 0, items: [], hasMore: null, nextStart: null });
  rows = [{ id: "synthetic-backup", name: "synthetic.zip", size: 1048576, creationDate: 1700000000000 }];
  const shown = await f.run(f.cli, args); assert.equal(shown.exitCode, 0, shown.stderr); assert.match(shown.stdout, /synthetic.zip/); assert.doesNotMatch(shown.stdout, /1700000000000|1048576|\$type/);
  assert.equal(calls, 4); await assert.rejects(f.cli.execute(["backup", "file", "list", "--start", String(Number.MAX_SAFE_INTEGER), "--page-size", "1"])); assert.equal(calls, 4);
});

test("US-072 explicit backup action controls stay in the selected Update request", async t => {
  const f = await configuredFixture(t, { permissions: ["Update"] }); const body = { backupStatus: { backupInProgress: true }, archiveFormat: "TAR_GZ", filesToKeep: 0, location: null, cronExpression: "", isOn: false, notifiedUsers: [{ id: "synthetic-user" }], nativeExtra: null }; let calls = 0;
  server.use(http.post("*", async ({ request }) => { calls++; assert.equal(new URL(request.url).pathname, "/context/api/admin/databaseBackup/settings"); assert.deepEqual(await request.json(), body); return new HttpResponse(null, { status: 204 }); }));
  const shown = await f.run(f.cli, ["backup", "settings", "update", "--body", JSON.stringify(body)]); assert.equal(shown.exitCode, 0, shown.stderr); assert.match(shown.stdout, /Updated backup settings/); assert.equal(calls, 1);
  for (const invalid of [{ archiveFormat: "tar" }, { filesToKeep: 1.5 }, { location: false }, { isOn: "false" }, { cronExpression: null }, { notifiedUsers: [false] }]) await assert.rejects(f.cli.execute(["backup", "settings", "update", "--body", JSON.stringify(invalid)]));
  assert.equal(calls, 1);
});
