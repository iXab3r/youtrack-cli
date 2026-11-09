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

test("US-073 update native appearance email and locale descriptors", async t => {
  await storyCase(t, {"argv":["server-settings","appearance-settings","get","--fields","id"],"method":"GET","path":"/api/admin/globalSettings/appearanceSettings","query":[["fields","id"]],"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"}});
  await storyCase(t, {"argv":["server-settings","notification-settings","get","--fields","id"],"method":"GET","path":"/api/admin/globalSettings/notificationSettings","query":[["fields","id"]],"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"}});
  await storyCase(t, {"argv":["server-settings","locale-settings","get","--fields","id"],"method":"GET","path":"/api/admin/globalSettings/localeSettings","query":[["fields","id"]],"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"}});
  await storyCase(t, {"argv":["server-settings","appearance-settings","update","--body","{\"timeZone\":{\"id\":\"UTC\"},\"dateFieldFormat\":{\"id\":\"synthetic-date-format\"},\"nativeExtra\":null}","--fields","id"],"method":"POST","path":"/api/admin/globalSettings/appearanceSettings","query":[["fields","id"]],"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"},"body":{"timeZone":{"id":"UTC"},"dateFieldFormat":{"id":"synthetic-date-format"},"nativeExtra":null},"update":true});
  await storyCase(t, {"argv":["server-settings","notification-settings","update","--body","{\"emailSettings\":{\"isEnabled\":false,\"from\":\"synthetic@example.test\",\"replyTo\":null,\"sslKey\":null,\"host\":null,\"login\":null,\"port\":-1,\"anonymous\":false,\"mailProtocol\":\"MS_GRAPH_API\"}}","--fields","id"],"method":"POST","path":"/api/admin/globalSettings/notificationSettings","query":[["fields","id"]],"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"},"body":{"emailSettings":{"isEnabled":false,"from":"synthetic@example.test","replyTo":null,"sslKey":null,"host":null,"login":null,"port":-1,"anonymous":false,"mailProtocol":"MS_GRAPH_API"}},"update":true});
  await storyCase(t, {"argv":["server-settings","locale-settings","update","--body","{\"locale\":{\"id\":\"en_US\",\"nativeExtra\":null},\"isRTL\":false}","--fields","id"],"method":"POST","path":"/api/admin/globalSettings/localeSettings","query":[["fields","id"]],"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"},"body":{"locale":{"id":"en_US","nativeExtra":null},"isRTL":false},"update":true});
});


test("US-073 descriptor and native type checks reject before HTTP without closing open values", async t => {
  const f = await configuredFixture(t, { permissions: ["Update"] }); let calls = 0;
  server.use(http.post("*", () => { calls++; return new HttpResponse(null, { status: 204 }); }));
  for (const [section, body] of [
    ["appearance-settings", { timeZone: "UTC" }], ["appearance-settings", { dateFieldFormat: null }],
    ["locale-settings", { locale: {} }], ["locale-settings", { locale: { id: "en_US" }, isRTL: "false" }],
    ["notification-settings", { emailSettings: { isEnabled: "false" } }], ["notification-settings", { emailSettings: { mailProtocol: "POP" } }],
    ["notification-settings", { emailSettings: { sslKey: false } }], ["notification-settings", { emailSettings: { port: 1.5 } }],
  ] as const) await assert.rejects(f.cli.execute(["server-settings", section, "update", "--body", JSON.stringify(body)]));
  assert.equal(calls, 0);
  for (const mailProtocol of ["SMTP", "SMTPS", "SMTP_TLS", "MS_GRAPH_API"]) await f.cli.execute(["server-settings", "notification-settings", "update", "--body", JSON.stringify({ emailSettings: { mailProtocol, sslKey: { id: "synthetic-ssl-entry", name: "synthetic-key" }, replyTo: null } })]);
  await f.cli.execute(["server-settings", "locale-settings", "update", "--body", JSON.stringify({ locale: { id: " synthetic-open-locale " } })]); assert.equal(calls, 5);
});

test("US-075 read and update license aliases and root settings through native operations", async t => {
  await storyCase(t, { argv: ["server-settings", "license", "get", "--fields", "id"], method: "GET", path: "/api/admin/globalSettings/license", query: [["fields", "id"]], response: { id: "synthetic-license" }, result: { id: "synthetic-license" } });
  await storyCase(t, { argv: ["server-settings", "license", "update", "--license-secret", "initial", "--fields", "id"], method: "POST", path: "/api/admin/globalSettings/license", query: [["fields", "id"]], body: { license: "synthetic-stored-license" }, secrets: { "server-license:initial": "synthetic-stored-license" }, response: { id: "synthetic-license" }, result: { id: "synthetic-license" }, update: true });
  await storyCase(t, { argv: ["server-settings", "update", "--body", '{"appearanceSettings":{"timeZone":{"id":"UTC"}},"nativeExtra":null}', "--fields", "id"], method: "POST", path: "/api/admin/globalSettings", query: [["fields", "id"]], body: { appearanceSettings: { timeZone: { id: "UTC" } }, nativeExtra: null }, response: { id: "synthetic-global" }, result: { id: "synthetic-global" }, update: true });
});

test("US-075 environment import uses profile-scoped memory secrets without HTTP or bearer overwrite", async t => {
  const { createCliFixture } = await import("@eyeauras/cli-factory/testing"); const { ProfileSecrets } = await import("@eyeauras/cli-factory"); const { createYouTrackCli } = await import("../src/cli.js");
  const f = await createCliFixture(t, { applicationId: "youtrack-cli", defaultProfile: "alpha", profiles: ["alpha", "beta"].map(name => ({ name, values: { url: `https://${name}.example.test/context` }, permissions: ["Update"], secrets: { token: `synthetic-${name}-token` } })) });
  const cli = f.createApplication(createYouTrackCli); let calls = 0; server.use(http.all("*", () => { calls++; return HttpResponse.json({ id: "unexpected" }); }));
  for (const profile of ["alpha", "beta"]) {
    const license = ` synthetic-${profile}-license"\\\n `; const environment = { YOUTRACK_LICENSE: license }; const argv = ["--profile", profile, "server-settings", "license", "import", "token", "--from-env"];
    const human = await f.run(cli, argv, { environment }); assert.equal(human.exitCode, 0, human.stderr); assert.match(human.stdout, /Stored server license token/); assert(!human.stdout.includes(license));
    assert.deepEqual(await f.json(cli, argv, { environment }), { alias: "token", stored: true });
    const [reply] = await f.rpc(cli, [argv], { environment }) as { result: unknown }[]; assert.deepEqual(reply!.result, { alias: "token", stored: true });
    const secrets = new ProfileSecrets(f.secretStore, "youtrack-cli", profile); assert.equal(await secrets.get("server-license:token"), license); assert.equal(await secrets.get("token"), `synthetic-${profile}-token`);
  } assert.equal(calls, 0);
});

test("US-075 import admission and failed persistence have no fallback and no value output", async t => {
  const f = await configuredFixture(t, { permissions: ["ReadOnly"] }); let reads = 0; let writes = 0; let calls = 0;
  const get = f.secrets.get.bind(f.secrets); f.secrets.get = async (...args) => { reads++; return get(...args); };
  const license = 'synthetic-license"\\'; f.secrets.set = async () => { writes++; throw new Error(`synthetic store ${license}`); };
  const argv = ["server-settings", "license", "import", "initial", "--from-env"]; const environment = { YOUTRACK_LICENSE: license };
  server.use(http.all("*", () => { calls++; return HttpResponse.json({ id: "unexpected" }); }));
  for (const json of [false, true]) { const r = await f.run(f.cli, [...argv, ...(json ? ["--json"] : [])], { environment }); assert.equal(r.exitCode, 1); assert.match(r.stderr, /Update|permission/i); }
  const [denied] = await f.rpc(f.cli, [argv], { environment }) as { error: { data: { code: string } } }[]; assert.equal(denied!.error.data.code, "permission.denied"); assert.equal(reads, 0); assert.equal(writes, 0); assert.equal(calls, 0);
  await f.cli.execute(["permissions", "grant", "Update"]);
  for (const [args, env] of [[argv.slice(0, -1), environment], [argv, {}], [argv, { YOUTRACK_LICENSE: "" }]] as const) { const r = await f.run(f.cli, args, { environment: env }); assert.equal(r.exitCode, 1); assert.equal(writes, 0); }
  const failed = await f.run(f.cli, [...argv, "--verbose"], { environment }); assert.equal(failed.exitCode, 1); assert.equal(writes, 1); assert.equal(calls, 0); assert(!failed.stderr.includes(license)); assert(!failed.stderr.includes(JSON.stringify(license).slice(1,-1)));
});

test("US-075 aliases have no env fallback and native nullable clearing remains available", async t => {
  const f = await configuredFixture(t, { permissions: ["Update"] }); let calls = 0;
  server.use(http.post("*", async ({ request }) => { calls++; assert.deepEqual(await request.json(), { license: null, username: null, nativeExtra: false }); return new HttpResponse(null, { status: 204 }); }));
  const missing = await f.run(f.cli, ["server-settings", "license", "update", "--license-secret", "initial"], { environment: { YOUTRACK_LICENSE: "synthetic-unimported-license" } });
  assert.equal(missing.exitCode, 1); assert.match(missing.stderr, /license import/); assert.equal(calls, 0);
  for (const argv of [
    ["server-settings", "license", "update"],
    ["server-settings", "license", "update", "--body", '{"license":"synthetic-raw-license"}'],
    ["server-settings", "license", "update", "--license-secret", "initial", "--body", '{"license":null}'],
    ["server-settings", "update", "--body", '{"license":{"license":"synthetic-raw-license"}}'],
  ]) { const r = await f.run(f.cli, argv); assert.equal(r.exitCode, 1); assert(!r.stderr.includes("synthetic-raw-license")); assert.equal(calls, 0); }
  const cleared = await f.run(f.cli, ["server-settings", "license", "update", "--body", '{"license":null,"username":null,"nativeExtra":false}']);
  assert.equal(cleared.exitCode, 0, cleared.stderr); assert.match(cleared.stdout, /Updated server license/); assert.equal(calls, 1);
});

test("US-075 known input license echoes and empty confirmations are safe on every surface", async t => {
  const license = 'synthetic/license"\\'; const encoded = encodeURIComponent(license).replace(/%[0-9A-F]{2}/g, part => part.toLowerCase());
  const f = await configuredFixture(t, { permissions: ["Update"], secrets: { "server-license:initial": license } }); let calls = 0;
  server.use(http.post("*", async ({ request }) => { calls++; assert.deepEqual(await request.json(), { license }); return HttpResponse.json({ id: "synthetic-license", echo: license, encoded, [encoded]: JSON.stringify({ license }) }); }));
  const argv = ["server-settings", "license", "update", "--license-secret", "initial"];
  for (const mode of ["execute", "human", "json", "rpc"]) {
    let result: unknown;
    if (mode === "execute") result = await f.cli.execute(argv);
    else if (mode === "rpc") result = await f.rpc(f.cli, [argv]);
    else { const r = await f.run(f.cli, [...argv, ...(mode === "json" ? ["--json"] : [])]); assert.equal(r.exitCode, 0, r.stderr); result = r.stdout; }
    const text = JSON.stringify(result); assert(!text.includes(license)); assert(!text.includes(encoded)); assert(!text.includes(JSON.stringify(license).slice(1,-1)));
  } assert.equal(calls, 4);
  server.use(http.post("*", () => new HttpResponse(null, { status: 204 })));
  const empty = await f.run(f.cli, argv); assert.equal(empty.exitCode, 0, empty.stderr); assert.match(empty.stdout, /Updated server license/);
});

test("US-075 SDK license credentials stay on original HTTPS origin at every redirect hop", async () => {
  const sdk = await import("../src/index.js"); const update = Reflect.get(sdk, "updateLicense") as (connection: unknown, body: unknown) => Promise<unknown>; const root = Reflect.get(sdk, "updateGlobalSettings") as typeof update;
  assert.equal(typeof update, "function"); assert.equal(typeof root, "function"); const license = "synthetic-redirect-license";
  for (const nested of [false, true]) {
    const body = nested ? { license: { license } } : { license }; const write = nested ? root : update; let initial = 0;
    await assert.rejects(write({ baseUrl: "http://license.example.test/context", token: "synthetic-token", fetch: async () => { initial++; return Response.json({}); } }, body), /HTTPS/); assert.equal(initial, 0);
    for (const status of [307, 308]) for (const destination of ["http://license.example.test/next", "https://other.example.test/next", "https://license.example.test:8443/next"]) {
      let calls = 0; const fetch = async (_input: unknown, init: RequestInit | undefined) => { calls++; assert.deepEqual(JSON.parse(init?.body as string), body); return new Response(null, { status, headers: { location: calls === 1 ? "/same-origin" : destination } }); };
      await assert.rejects(write({ baseUrl: "https://license.example.test/context", token: "synthetic-token", fetch }, body), /outcome is unknown/); assert.equal(calls, 2);
    }
    let calls = 0; const fetch = async (_input: unknown, init: RequestInit | undefined) => { calls++; assert.deepEqual(JSON.parse(init?.body as string), body); return calls === 1 ? new Response(null, { status: 307, headers: { location: "/same-origin" } }) : Response.json({ id: "synthetic", echo: license }); };
    assert.deepEqual(await write({ baseUrl: "https://license.example.test/context", token: "synthetic-token", fetch }, body), { id: "synthetic", echo: "[redacted]" }); assert.equal(calls, 2);
    for (const status of [301, 302, 303]) {
      calls = 0; const fetch = async (_input: unknown, init: RequestInit | undefined) => { calls++; if (calls === 1) return new Response(null, { status, headers: { location: "https://other.example.test/result" } }); assert.equal(init?.method, "GET"); assert(init?.body == null); assert.equal(new Headers(init?.headers).get("authorization"), null); return Response.json({ id: "synthetic" }); };
      assert.deepEqual(await write({ baseUrl: "https://license.example.test/context", token: "synthetic-token", fetch }, body), { id: "synthetic" }); assert.equal(calls, 2);
    }
  }
});

test("US-075 cancellation before persistence leaves the selected alias unchanged", async t => {
  const { ProfileSecrets } = await import("@eyeauras/cli-factory"); const f = await configuredFixture(t, { permissions: ["Update"], secrets: { "server-license:initial": "synthetic-existing-license" } }); const controller = new AbortController(); let writes = 0; let lookups = 0; let entered!: () => void; let release!: () => void;
  const pending = new Promise<void>(resolve => { entered = resolve; }); const blocked = new Promise<void>(resolve => { release = resolve; }); const get = f.secrets.get.bind(f.secrets); const set = f.secrets.set.bind(f.secrets);
  f.secrets.get = async (service, account) => { if (account.endsWith(":token") && ++lookups === 2) { entered(); await blocked; } return get(service, account); }; f.secrets.set = async (...args) => { writes++; return set(...args); };
  const run = f.run(f.cli, ["server-settings", "license", "import", "initial", "--from-env"], { signal: controller.signal, environment: { YOUTRACK_LICENSE: "synthetic-new-license" } });
  // A missing command in the red phase must fail promptly instead of waiting for a handler hook.
  await Promise.race([pending, run.then(() => { throw new Error("Import did not reach its admitted secret lookup."); })]); controller.abort(); release(); const result = await run;
  assert.equal(result.exitCode, 130); assert.equal(writes, 0); assert.equal(await new ProfileSecrets(f.secrets, "youtrack-cli", "dev").get("server-license:initial"), "synthetic-existing-license");
});
