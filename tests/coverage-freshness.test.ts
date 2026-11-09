import assert from "node:assert/strict";
import { test, type TestContext } from "node:test";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

type CoverageRow = { status: string; binding: { permission: string; command: string; surfaces: { rpc: { passed: boolean } } } };

const tracked = resolve("docs/rest-api-coverage/current");
const files = ["coverage.json", "coverage.tsv", "summary.json"];
async function fixture(t: TestContext) {
  const root = await mkdtemp(join(tmpdir(), "youtrack-freshness-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const generated = join(root, "generated"); await cp(tracked, generated, { recursive: true });
  const script = new URL("../../scripts/rest-api-audit/verify.mjs", import.meta.url).href;
  const { assertFreshCoverage } = await import(script) as { assertFreshCoverage(expected: string, actual: string): Promise<void> };
  return { generated, assertFreshCoverage };
}

test("US-078 fresh comparison accepts only the documented commit-lineage difference", async t => {
  const { generated, assertFreshCoverage } = await fixture(t);
  await assertFreshCoverage(tracked, generated);
  const path = join(generated, "summary.json"); const summary = JSON.parse(await readFile(path, "utf8")); summary.baselineHead = "1".repeat(40); await writeFile(path, JSON.stringify(summary, null, 2) + "\n");
  await assertFreshCoverage(tracked, generated);
  summary.covered--; summary.missing++; await writeFile(path, JSON.stringify(summary, null, 2) + "\n");
  await assert.rejects(assertFreshCoverage(tracked, generated), /summary.json/);
});

test("US-078 changed routes permissions bindings or surface evidence fail without tracked overwrite", async t => {
  const { generated, assertFreshCoverage } = await fixture(t); const original = await readFile(join(tracked, "coverage.json"), "utf8");
  for (const mutate of [
    (rows: CoverageRow[]) => { rows.pop(); },
    (rows: CoverageRow[]) => { rows.push(structuredClone(rows[0]!)); },
    (rows: CoverageRow[]) => { rows[0]!.binding.permission = rows[0]!.binding.permission === "Update" ? "ReadOnly" : "Update"; },
    (rows: CoverageRow[]) => { rows[0]!.binding.command = "synthetic other command"; },
    (rows: CoverageRow[]) => { rows[0]!.binding.surfaces.rpc.passed = false; },
    (rows: CoverageRow[]) => { rows[0]!.status = "missing"; },
  ]) {
    const rows: CoverageRow[] = JSON.parse(original); mutate(rows); await writeFile(join(generated, "coverage.json"), JSON.stringify(rows, null, 2) + "\n");
    await assert.rejects(assertFreshCoverage(tracked, generated), /coverage.json/); assert.equal(await readFile(join(tracked, "coverage.json"), "utf8"), original);
  }
});

test("US-078 missing malformed and TSV drift fail with artifact context", async t => {
  const { generated, assertFreshCoverage } = await fixture(t);
  const original = new Map(await Promise.all(files.map(async name => [name, await readFile(join(generated, name), "utf8")] as const)));
  for (const name of files) {
    await rm(join(generated, name)); await assert.rejects(assertFreshCoverage(tracked, generated), new RegExp(name.replace(".", "\\."))); await writeFile(join(generated, name), original.get(name)!);
    await writeFile(join(generated, name), "synthetic invalid artifact"); await assert.rejects(assertFreshCoverage(tracked, generated), new RegExp(name.replace(".", "\\."))); await writeFile(join(generated, name), original.get(name)!);
  }
});
