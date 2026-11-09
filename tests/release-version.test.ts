import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";
import { fixture } from "./cli-fixture.js";

test("US-079 consolidated candidate advertises 0.9.0 and retains exact Core 0.7.1", async t => {
  const f = await fixture(t); const version = await f.run(f.cli, ["--version"]);
  assert.equal(version.exitCode, 0, version.stderr); assert.equal(version.stdout.trim(), "0.9.0");
  const manifest = JSON.parse(await readFile(new URL("../../package.json", import.meta.url), "utf8"));
  const lock = JSON.parse(await readFile(new URL("../../package-lock.json", import.meta.url), "utf8"));
  assert.equal(manifest.version, "0.9.0"); assert.equal(lock.version, "0.9.0"); assert.equal(lock.packages[""].version, "0.9.0");
  assert.equal(manifest.dependencies["@eyeauras/cli-factory"], "0.7.1"); assert.equal(lock.packages["node_modules/@eyeauras/cli-factory"].version, "0.7.1");
});
