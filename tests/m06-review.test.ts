import assert from "node:assert/strict";
import { test } from "node:test";
import { ProfileSecrets } from "@eyeauras/cli-factory";
import { createUser, updateUser, createLinkType, updateLinkType } from "../src/index.js";
import { createYouTrackCli } from "../src/cli.js";
import { configuredFixture } from "./cli-fixture.js";
const password = "synthetic-redirect-password";
const token = "synthetic-redirect-token";
const baseUrl = "https://users.example.test/context/";
const body = { login: "synthetic-user", password };
const key = "user-initial-password:initial";

// Only injected fetch functions are used: no request can reach a network service.
test("M06 password bodies cannot follow 307/308 to HTTP or another origin at any hop", async () => {
  for (const status of [307, 308]) for (const target of [
    "http://users.example.test/api/users", "http://other.example.test/api/users",
    "https://other.example.test/api/users", "https://users.example.test:8443/api/users",
  ]) for (const afterSameOrigin of [false, true]) for (const updating of [false, true]) {
    let calls = 0;
    const fetch = (async (_input, init) => {
      calls++; assert.equal(init?.method, "POST"); assert.deepEqual(JSON.parse(init?.body as string), body);
      if (afterSameOrigin && calls === 1) return new Response(null, { status, headers: { location: "/same-origin" } });
      if (calls === (afterSameOrigin ? 2 : 1)) return new Response(null, { status, headers: { location: target } });
      return Response.json({ id: "unexpected-disclosure" });
    }) as typeof globalThis.fetch;
    const connection = { baseUrl, token, fetch };
    await assert.rejects(updating ? updateUser(connection, "selected", body) : createUser(connection, body), (error: Error) => {
      assert.match(error.message, /outcome is unknown/); assert(!JSON.stringify(error).includes(password)); return true;
    });
    assert.equal(calls, afterSameOrigin ? 2 : 1, "Reject before dispatching a password to the redirect destination");
  }
});

test("M06 same-origin HTTPS password redirects preserve native bodies and bearer continuity", async () => {
  for (const status of [307, 308]) {
    let calls = 0;
    const fetch = (async (input, init) => {
      calls++; assert.equal(new URL(input as URL).origin, "https://users.example.test");
      assert.equal(init?.method, "POST"); assert.deepEqual(JSON.parse(init?.body as string), body);
      assert.equal(new Headers(init?.headers).get("authorization"), `Bearer ${token}`);
      return calls === 1 ? new Response(null, { status, headers: { location: "/redirected/users" } }) : Response.json({ id: "synthetic-user", echo: password });
    }) as typeof globalThis.fetch;
    assert.deepEqual(await createUser({ baseUrl, token, fetch }, body), { id: "synthetic-user", echo: "[redacted]" });
    assert.equal(calls, 2);
  }
});

test("M06 CLI password redirect rejection retains safe unknown-write diagnostics on every surface", async t => {
  const f = await configuredFixture(t, { permissions: ["Update"], secrets: { [key]: password } }); let calls = 0;
  f.runtime.fetch = async () => { calls++; return calls % 2 === 1 ? new Response(null, { status: 307, headers: { location: "https://other.example.test/api/users" } }) : Response.json({ id: "unexpected" }); };
  const cli = f.createApplication(createYouTrackCli);
  const argv = ["user", "create", "--body", '{"login":"synthetic-user"}', "--password-secret", "initial"];
  for (const mode of ["execute", "human", "json", "rpc"]) {
    calls = 0;
    if (mode === "execute") await assert.rejects(cli.execute(argv), /outcome is unknown/);
    else if (mode === "rpc") {
      const [reply] = await f.rpc(cli, [[...argv, "--verbose"]]) as { error: { message: string; data: { code: string } } }[];
      assert.match(reply!.error.message, /outcome is unknown/); assert.equal(reply!.error.data.code, "request.failed"); assert(!JSON.stringify(reply).includes(password));
    } else {
      const result = await f.run(cli, [...argv, "--verbose", ...(mode === "json" ? ["--json"] : [])]);
      assert.equal(result.exitCode, 1); assert.equal(result.stdout, ""); assert.match(result.stderr, /outcome is unknown/); assert(!result.stderr.includes(password));
    }
    assert.equal(calls, 1);
  }
});

test("M06 canceled import cannot start persistence after its pending token lookup", async t => {
  const f = await configuredFixture(t, { permissions: ["Update"], secrets: { [key]: "synthetic-existing-password" } });
  const controller = new AbortController(); let writes = 0;
  const get = f.secrets.get.bind(f.secrets); const set = f.secrets.set.bind(f.secrets);
  // Core reads token for readiness before the handler's own lookup.
  let lookups = 0; let entered!: () => void; let release!: () => void;
  const pending = new Promise<void>(resolve => { entered = resolve; });
  const blocked = new Promise<void>(resolve => { release = resolve; });
  f.secrets.get = async (service, account) => { if (account.endsWith(":token") && ++lookups === 2) { entered(); await blocked; } return get(service, account); };
  f.secrets.set = async (...args) => { writes++; return set(...args); };
  const run = f.run(f.cli, ["user", "initial-password", "import", "initial", "--from-env"], { signal: controller.signal, environment: { YOUTRACK_INITIAL_PASSWORD: password } });
  await pending; controller.abort(); release(); const result = await run;
  assert.equal(result.exitCode, 130); assert.equal(writes, 0);
  assert.equal(await new ProfileSecrets(f.secrets, "youtrack-cli", "dev").get(key), "synthetic-existing-password");
});

test("M06 nullable inward labels pass through SDK and CLI while creation still requires the property", async t => {
  const f = await configuredFixture(t, { permissions: ["Update"] }); let calls = 0;
  f.runtime.fetch = async (_input, init) => { calls++; assert.equal(JSON.parse(init?.body as string).targetToSource, null); return Response.json({ id: "synthetic-type", targetToSource: null }); };
  const connection = { baseUrl, token, fetch: f.runtime.fetch };
  assert.deepEqual(await updateLinkType(connection, "selected", { targetToSource: null }), { id: "synthetic-type", targetToSource: null });
  assert.deepEqual(await createLinkType(connection, { name: "Synthetic", sourceToTarget: "outward", targetToSource: null }), { id: "synthetic-type", targetToSource: null });
  const cli = f.createApplication(createYouTrackCli);
  const argv = ["link-types", "update", "selected", "--body", '{"targetToSource":null}'];
  assert.deepEqual(await cli.execute(argv), { id: "synthetic-type", targetToSource: null });
  assert.deepEqual(await f.json(cli, argv), { id: "synthetic-type", targetToSource: null });
  assert.equal((await f.run(cli, argv)).exitCode, 0);
  const [reply] = await f.rpc(cli, [argv]) as { result: unknown }[];
  assert.deepEqual(reply!.result, { id: "synthetic-type", targetToSource: null }); assert.equal(calls, 6);
  await assert.rejects(createLinkType(connection, { name: "Synthetic", sourceToTarget: "outward" }));
  await assert.rejects(updateLinkType(connection, "selected", { targetToSource: 42 })); assert.equal(calls, 6);
});
