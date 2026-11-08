import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { createAgile } from "../src/agile.js";
import { createProject } from "../src/issue-fields.js";
import { configuredFixture } from "./cli-fixture.js";
const server = setupServer();
before(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
after(() => server.close());
const board = { name: "Synthetic board", projects: [{ id: "project" }] };
const project = { name: "Synthetic project", shortName: "SYN", leader: { id: "leader" } };

test("native template sets preserve omission and every supported SDK value", async () => {
  for (const row of [
    { run: createProject, body: project, path: "/context/api/admin/projects", values: [undefined, "scrum", "kanban"] },
    { run: createAgile, body: board, path: "/context/api/agiles", values: [undefined, "kanban", "scrum", "version", "custom", "personal"] },
  ]) for (const template of row.values) {
    let calls = 0;
    const result = await row.run({ baseUrl: "https://templates.example.test/context/", token: "synthetic-token", fetch: (async (input, init) => {
      calls++; const url = new URL(input as string); assert.equal(url.pathname, row.path);
      assert.equal(url.searchParams.get("template"), template ?? null); assert.equal(init?.method, "POST");
      assert.deepEqual(JSON.parse(init?.body as string), row.body); return Response.json({ id: "synthetic-result" });
    }) as typeof fetch }, row.body, template === undefined ? {} : { template });
    assert.deepEqual(result, { id: "synthetic-result" }); assert.equal(calls, 1);
  }
});

test("unsupported SDK templates fail before HTTP without value echoes or unknown-write claims", async () => {
  let calls = 0;
  const connection = { baseUrl: "https://templates.example.test", token: "synthetic-token", fetch: (async () => { calls++; return Response.json({ id: "unexpected" }); }) as typeof fetch };
  for (const row of [{ run: createProject, body: project }, { run: createAgile, body: board }]) {
    for (const template of ["future-template", "SCRUM", " scrum ", "synthetic-token", ""]) {
      await assert.rejects(row.run(connection, row.body, { template }), (error: Error) => {
        assert.match(error.message, /template/i); assert.doesNotMatch(error.message, /future-template|synthetic-token|outcome is unknown/); return true;
      });
      assert.equal(calls, 0);
    }
  }
});

test("unsupported CLI templates fail before secret and HTTP effects on every surface", async t => {
  const f = await configuredFixture(t, { permissions: ["Update"] }); let calls = 0; let reads = 0;
  const original = f.secrets.get.bind(f.secrets); f.secrets.get = async (...args) => { reads++; return original(...args); };
  server.use(http.post("*", () => { calls++; return HttpResponse.json({ id: "unexpected" }); }));
  for (const argv of [
    ["project", "create", "--body", JSON.stringify(project), "--template", "synthetic-token"],
    ["agile", "create", "--body", JSON.stringify(board), "--template", "synthetic-token"],
  ]) {
    await assert.rejects(f.cli.execute(argv));
    for (const json of [false, true]) {
      const r = await f.run(f.cli, [...argv, ...(json ? ["--json"] : [])]); assert.equal(r.exitCode, 1); assert.equal(r.stdout, "");
      assert.match(r.stderr, /template/i); assert.doesNotMatch(r.stderr, /synthetic-token|outcome is unknown/);
    }
    const [reply] = await f.rpc(f.cli, [argv]) as { error: { message: string } }[];
    assert.match(reply!.error.message, /template/i); assert.doesNotMatch(reply!.error.message, /synthetic-token|outcome is unknown/);
  }
  assert.equal(calls, 0); assert.equal(reads, 0);
});
