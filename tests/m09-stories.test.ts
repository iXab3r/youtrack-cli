import assert from "node:assert/strict";
import { test } from "node:test";
import { ProfileSecrets } from "@eyeauras/cli-factory";
import { createCliFixture } from "@eyeauras/cli-factory/testing";
import { createYouTrackCli } from "../src/cli.js";
import { configuredFixture, fixture } from "./cli-fixture.js";

const families = [
  { argv: ["user", "initial-password", "delete"], namespace: "user-initial-password:", title: /Deleted initial password/ },
  { argv: ["server-settings", "license", "delete"], namespace: "server-license:", title: /Deleted server license/ },
];

test("US-077 deletes only the selected profile/family and never its bearer credential", async t => {
  for (const family of families) {
    const f = await createCliFixture(t, { applicationId: "youtrack-cli", defaultProfile: "alpha", profiles: ["alpha", "beta"].map(name => ({
      name, values: { url: `https://${name}.example.test` }, permissions: ["Update"], secrets: { token: `synthetic-${name}-token`, "user-initial-password:token": "synthetic-password", "server-license:token": "synthetic-license" },
    })) });
    let requests = 0; f.runtime.fetch = async () => { requests++; throw new Error("Unexpected HTTP"); };
    const cli = f.createApplication(createYouTrackCli); const alpha = new ProfileSecrets(f.secretStore, "youtrack-cli", "alpha"); const beta = new ProfileSecrets(f.secretStore, "youtrack-cli", "beta");
    const key = family.namespace + "token"; const other = family.namespace === "server-license:" ? "user-initial-password:token" : "server-license:token";
    for (const mode of ["execute", "human", "json", "rpc"]) {
      await alpha.set(key, "synthetic-selected-secret"); const argv = [...family.argv, "token"];
      if (mode === "execute") assert.deepEqual(await cli.execute(argv), { alias: "token", deleted: true });
      else if (mode === "json") assert.deepEqual(await f.json(cli, argv), { alias: "token", deleted: true });
      else if (mode === "rpc") { const [reply] = await f.rpc(cli, [argv]) as { result: unknown }[]; assert.deepEqual(reply!.result, { alias: "token", deleted: true }); }
      else { const r = await f.run(cli, argv); assert.equal(r.exitCode, 0, r.stderr); assert.match(r.stdout, family.title); assert.match(r.stdout, /token/); }
      assert.equal(await alpha.get(key), undefined); assert.notEqual(await beta.get(key), undefined); assert.notEqual(await alpha.get(other), undefined);
      assert.equal(await alpha.get("token"), "synthetic-alpha-token"); assert.equal(await beta.get("token"), "synthetic-beta-token");
    } assert.equal(requests, 0);
  }
});

test("US-077 disabled Update denies every deletion surface before secret or HTTP effects", async t => {
  for (const family of families) {
    const f = await configuredFixture(t, { permissions: ["ReadOnly"] }); let reads = 0; let deletes = 0; let requests = 0;
    f.secrets.get = async () => { reads++; return "synthetic-secret"; }; f.secrets.delete = async () => { deletes++; }; f.runtime.fetch = async () => { requests++; return Response.json({}); };
    const cli = f.createApplication(createYouTrackCli); const argv = [...family.argv, "token"];
    await assert.rejects(cli.execute(argv), (e: unknown) => (e as { code: string }).code === "permission.denied");
    for (const json of [false, true]) { const r = await f.run(cli, [...argv, ...(json ? ["--json"] : [])]); assert.equal(r.exitCode, 1); assert.match(r.stderr, /Update|permission/i); }
    const [reply] = await f.rpc(cli, [argv]) as { error: { data: { code: string } } }[]; assert.equal(reply!.error.data.code, "permission.denied");
    assert.equal(reads, 0); assert.equal(deletes, 0); assert.equal(requests, 0);
  }
});

test("US-077 absent aliases are idempotent but missing arguments fail before effects", async t => {
  for (const family of families) {
    const f = await configuredFixture(t, { permissions: ["Update"] }); let deletes = 0; const remove = f.secrets.delete.bind(f.secrets); f.secrets.delete = async (...args) => { deletes++; return remove(...args); };
    assert.deepEqual(await f.cli.execute([...family.argv, "absent"]), { alias: "absent", deleted: true });
    assert.deepEqual(await f.cli.execute([...family.argv, "absent"]), { alias: "absent", deleted: true }); assert.equal(deletes, 2);
    let reads = 0; const get = f.secrets.get.bind(f.secrets); f.secrets.get = async (...args) => { reads++; return get(...args); };
    const failed = await f.run(f.cli, family.argv); assert.equal(failed.exitCode, 1); assert.equal(reads, 0); assert.equal(deletes, 2);
  }
});

test("US-077 safe alias acknowledgements never echo known bearer or auxiliary values", async t => {
  for (const family of families) for (const alias of ["synthetic-token", "synthetic-private-alias"]) {
    const f = await configuredFixture(t, { permissions: ["Update"], secrets: { [family.namespace + alias]: alias } });
    const result = await f.json(f.cli, [...family.argv, alias]); assert.deepEqual(result, { alias: "[redacted]", deleted: true });
    const secrets = new ProfileSecrets(f.secrets, "youtrack-cli", "dev"); await secrets.set(family.namespace + alias, alias);
    const human = await f.run(f.cli, [...family.argv, alias]); assert.equal(human.exitCode, 0, human.stderr); assert.match(human.stdout, family.title); assert(!human.stdout.includes(alias));
  }
});

test("US-077 deletion failures preserve useful redacted causes and never promise rollback or retry", async t => {
  for (const family of families) for (const applied of [false, true]) {
    const secret = 'synthetic-secret/with"quotes'; const key = family.namespace + "initial";
    const f = await configuredFixture(t, { permissions: ["Update"], secrets: { [key]: secret } }); let deletes = 0; const remove = f.secrets.delete.bind(f.secrets);
    f.secrets.delete = async (...args) => { deletes++; if (applied) await remove(...args); const error = new Error(`synthetic store ${secret}`); Object.assign(error, { code: "SYNTHETIC_DELETE_FAILED" }); throw error; };
    const r = await f.run(f.cli, [...family.argv, "initial", "--verbose"]); assert.equal(r.exitCode, 1); assert.equal(r.stdout, ""); assert.match(r.stderr, /deletion outcome is unknown/i); assert.match(r.stderr, /SYNTHETIC_DELETE_FAILED/); assert(!r.stderr.includes(secret)); assert(!r.stderr.includes(JSON.stringify(secret).slice(1,-1))); assert.equal(deletes, 1);
    assert.equal(await new ProfileSecrets(f.secrets, "youtrack-cli", "dev").get(key), applied ? undefined : secret);
  }
});

test("US-077 cancellation during lookup prevents a secret deletion from starting", async t => {
  for (const family of families) {
    const key = family.namespace + "initial"; const f = await configuredFixture(t, { permissions: ["Update"], secrets: { [key]: "synthetic-retained-secret" } });
    const controller = new AbortController(); let deletes = 0; let entered!: () => void; let release!: () => void;
    const pending = new Promise<void>(resolve => { entered = resolve; }); const blocked = new Promise<void>(resolve => { release = resolve; }); const get = f.secrets.get.bind(f.secrets);
    f.secrets.get = async (service, account) => { if (account.endsWith(":" + key)) { entered(); await blocked; } return get(service, account); }; f.secrets.delete = async () => { deletes++; };
    const run = f.run(f.cli, [...family.argv, "initial"], { signal: controller.signal });
    await Promise.race([pending, run.then(() => { throw new Error("Deletion did not reach its admitted lookup."); })]); controller.abort(); release(); const r = await run;
    assert.equal(r.exitCode, 130); assert.equal(deletes, 0); assert.equal(await new ProfileSecrets(f.secrets, "youtrack-cli", "dev").get(key), "synthetic-retained-secret");
  }
});

test("US-077 cancellation after persistence starts makes no rollback promise", async t => {
  for (const family of families) {
    const key = family.namespace + "initial"; const f = await configuredFixture(t, { permissions: ["Update"], secrets: { [key]: "synthetic-secret" } }); const controller = new AbortController(); const remove = f.secrets.delete.bind(f.secrets); let deletes = 0;
    f.secrets.delete = async (...args) => { deletes++; await remove(...args); controller.abort(); };
    const r = await f.run(f.cli, [...family.argv, "initial"], { signal: controller.signal }); assert.equal(r.exitCode, 130); assert.equal(deletes, 1); assert.equal(await new ProfileSecrets(f.secrets, "youtrack-cli", "dev").get(key), undefined);
  }
});

test("US-077 deletion help is available without profiles or secret-store access", async t => {
  const f = await fixture(t); let reads = 0; let deletes = 0; f.secrets.get = async () => { reads++; return undefined; }; f.secrets.delete = async () => { deletes++; };
  for (const family of families) { const r = await f.run(f.cli, [...family.argv, "--help"]); assert.equal(r.exitCode, 0, r.stderr); assert.match(r.stdout, /delete(?: \[options\])? <alias>/); }
  assert.equal(reads, 0); assert.equal(deletes, 0);
});
