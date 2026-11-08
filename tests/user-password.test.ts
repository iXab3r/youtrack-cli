import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { ProfileSecrets } from "@eyeauras/cli-factory";
import { createCliFixture } from "@eyeauras/cli-factory/testing";
import { createYouTrackCli } from "../src/cli.js";
import { configuredFixture } from "./cli-fixture.js";
const server = setupServer();
before(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers()); after(() => server.close());
const password = ' synthetic-password"\\\n ';
const key = "user-initial-password:token";
const importArgs = ["user", "initial-password", "import", "token", "--from-env"];
const createArgs = ["user", "create", "--body", '{"login":"selected-user"}', "--password-secret", "token"];
const environment = { YOUTRACK_INITIAL_PASSWORD: password };
function safe(value: unknown) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  assert(!text.includes(password)); assert(!text.includes(JSON.stringify(password).slice(1, -1)));
}

test("US-056 import uses the selected profile, preserves exact password bytes and never sends HTTP", async t => {
  const f = await createCliFixture(t, { applicationId: "youtrack-cli", defaultProfile: "alpha", profiles: [
    { name: "alpha", values: { url: "https://alpha.example.test" }, permissions: ["Update"], secrets: { token: "synthetic-alpha-token" } },
    { name: "beta", values: { url: "https://beta.example.test" }, permissions: ["Update"], secrets: { token: "synthetic-beta-token" } },
  ] });
  const cli = f.createApplication(createYouTrackCli); let calls = 0;
  server.use(http.all("*", () => { calls++; return HttpResponse.json({ id: "unexpected" }); }));
  for (const profile of ["alpha", "beta"]) {
    const args = ["--profile", profile, ...importArgs];
    const r = await f.run(cli, args, { environment }); assert.equal(r.exitCode, 0, r.stderr); safe(r.stdout); safe(r.stderr);
    assert.deepEqual(await f.json(cli, args, { environment }), { alias: "token", stored: true });
    const [reply] = await f.rpc(cli, [args], { environment }) as { result: unknown }[];
    assert.deepEqual(reply!.result, { alias: "token", stored: true });
    const secrets = new ProfileSecrets(f.secretStore, "youtrack-cli", profile);
    assert.equal(await secrets.get(key), password); assert.equal(await secrets.get("token"), `synthetic-${profile}-token`);
  }
  assert.equal(calls, 0);
});

test("US-056 import admission, missing inputs and storage failure never persist a fallback", async t => {
  const f = await configuredFixture(t, { permissions: ["ReadOnly"] }); let reads = 0; let writes = 0; let calls = 0;
  const get = f.secrets.get.bind(f.secrets); f.secrets.get = async (...args) => { reads++; return get(...args); };
  f.secrets.set = async () => { writes++; throw new Error(`synthetic backend ${password}`); };
  server.use(http.all("*", () => { calls++; return HttpResponse.json({ id: "unexpected" }); }));
  for (const json of [false, true]) {
    const r = await f.run(f.cli, [...importArgs, ...(json ? ["--json"] : [])], { environment });
    assert.equal(r.exitCode, 1); assert.match(r.stderr, /Update|permission/i); safe(r.stderr);
  }
  const [reply] = await f.rpc(f.cli, [importArgs], { environment }); safe(reply);
  assert.equal(reads, 0); assert.equal(writes, 0); assert.equal(calls, 0);
  await f.cli.execute(["permissions", "grant", "Update"]);
  for (const [args, env] of [[importArgs.slice(0, -1), environment], [importArgs, {}], [importArgs, { YOUTRACK_INITIAL_PASSWORD: "" }]] as const) {
    const r = await f.run(f.cli, args, { environment: env }); assert.equal(r.exitCode, 1); assert.equal(writes, 0); safe(r.stderr);
  }
  const failed = await f.run(f.cli, [...importArgs, "--verbose"], { environment });
  assert.equal(failed.exitCode, 1); assert.equal(writes, 1); assert.equal(calls, 0); safe(failed.stderr);
});

test("US-056 creation has no env fallback and rejects passwords supplied through body", async t => {
  const f = await configuredFixture(t, { permissions: ["Update"] }); let calls = 0; let auxiliaryReads = 0;
  const get = f.secrets.get.bind(f.secrets); f.secrets.get = async (service, account) => { if (account.includes("user-initial-password:")) auxiliaryReads++; return get(service, account); };
  server.use(http.post("*", () => { calls++; return HttpResponse.json({ id: "unexpected" }); }));
  const missing = await f.run(f.cli, createArgs, { environment });
  assert.equal(missing.exitCode, 1); assert.match(missing.stderr, /initial-password import/); safe(missing.stderr); assert.equal(calls, 0);
  const raw = await f.run(f.cli, ["user", "create", "--password-secret", "token", "--body", JSON.stringify({ login: "selected-user", password })]);
  assert.equal(raw.exitCode, 1); safe(raw.stderr); assert.equal(auxiliaryReads, 1); assert.equal(calls, 0);
});

test("US-056 stored passwords travel only in the native body and are scrubbed from echoed results and empty confirmations", async t => {
  const f = await configuredFixture(t, { permissions: ["Update"], secrets: { [key]: password } }); let calls = 0;
  server.use(http.post("*", async ({ request }) => {
    calls++; assert.equal(new URL(request.url).searchParams.get("password"), null);
    assert.deepEqual(await request.json(), { login: "selected-user", password });
    assert.equal(request.headers.get("authorization"), "Bearer synthetic-token");
    return HttpResponse.json({ id: "synthetic-result", password, echo: JSON.stringify({ password }), [password]: password });
  }));
  for (const json of [false, true]) { const r = await f.run(f.cli, [...createArgs, ...(json ? ["--json"] : [])]); assert.equal(r.exitCode, 0, r.stderr); safe(r.stdout); safe(r.stderr); }
  safe(await f.cli.execute(createArgs)); safe(await f.rpc(f.cli, [createArgs])); assert.equal(calls, 4);
  server.use(http.post("*", () => new HttpResponse(null, { status: 204 })));
  const empty = await f.run(f.cli, createArgs); assert.equal(empty.exitCode, 0); assert.match(empty.stdout, /selected-user/);
  const coincident = await f.run(f.cli, ["user", "create", "--body", JSON.stringify({ login: password }), "--password-secret", "token"]);
  assert.equal(coincident.exitCode, 0); safe(coincident.stdout);
  assert.equal(await new ProfileSecrets(f.secrets, "youtrack-cli", "dev").get(key), password);
});

test("US-056 SDK password writes require HTTPS and redact causal errors without losing unknown-write diagnostics", async () => {
  const sdk = await import("../src/index.js");
  const create = Reflect.get(sdk, "createUser") as (connection: unknown, body: unknown) => Promise<unknown>;
  assert.equal(typeof create, "function"); let calls = 0;
  const transport = (async () => { calls++; const error = new Error(`synthetic ${JSON.stringify(password)}`); Object.assign(error, { code: "SYNTHETIC_TRANSPORT" }); throw error; }) as typeof fetch;
  await assert.rejects(create({ baseUrl: "http://users.example.test", token: "synthetic-token", fetch: transport }, { login: "synthetic", password }), /HTTPS/);
  assert.equal(calls, 0);
  await assert.rejects(create({ baseUrl: "https://users.example.test", token: "synthetic-token", fetch: transport }, { login: "synthetic", password }), (error: Error & { cause?: unknown }) => {
    assert.match(error.message, /outcome is unknown/); safe(error); safe(error.cause); assert.match(JSON.stringify(error.cause), /SYNTHETIC_TRANSPORT/); return true;
  }); assert.equal(calls, 1);
});
