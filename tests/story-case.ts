import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { TestContext } from "node:test";
import { http, HttpResponse } from "msw";
import type { setupServer } from "msw/node";
import { configuredFixture } from "./cli-fixture.js";

export interface StoryCase {
  argv: string[];
  method: string;
  path: string;
  query: [string, string][];
  body?: unknown;
  multipart?: string;
  result: unknown;
  response: unknown;
  update?: boolean;
}

/** Independently authored wire expectations, exercised through the real declaration on every surface. */
export function createStoryCase(server: ReturnType<typeof setupServer>) {
return async function storyCase(t: TestContext, row: StoryCase) {
  const f = await configuredFixture(t, { permissions: [row.update ? "Update" : "ReadOnly"] });
  const argv = row.argv.map(value => value === "$UPLOAD" ? join(f.root, "synthetic-upload.txt") : value);
  if (row.multipart !== undefined) await writeFile(join(f.root, "synthetic-upload.txt"), row.multipart);
  let calls = 0;
  let effects = 0;
  server.use(http.all("*", async ({ request }) => {
    calls++; effects++;
    assert.equal(request.method, row.method);
    const url = new URL(request.url);
    assert.equal(url.origin, "https://youtrack.example.com");
    assert.equal(url.pathname, "/context" + row.path);
    assert.deepEqual([...url.searchParams].sort(), [...row.query].sort());
    for (const name of new Set(row.query.map(([name]) => name))) {
      assert.deepEqual(url.searchParams.getAll(name), row.query.filter(([key]) => key === name).map(([, value]) => value));
    }
    assert.equal(request.headers.get("authorization"), "Bearer synthetic-token");
    if (row.multipart !== undefined) {
      const form = await request.formData();
      assert.deepEqual([...form.keys()], ["upload1"]);
      const file = form.get("upload1") as File;
      assert.equal(file.name, "synthetic-upload.txt");
      assert.equal(await file.text(), row.multipart);
    } else if (row.body === undefined) assert.equal(await request.text(), "");
    else assert.deepEqual(await request.json(), row.body);
    return row.response === undefined ? new HttpResponse(null, { status: 204 }) : HttpResponse.json(row.response);
  }));
  assert.deepEqual(await f.cli.execute(argv), row.result);
  const json = await f.json(f.cli, argv);
  assert.deepEqual(json, row.result);
  const human = await f.run(f.cli, argv);
  assert.equal(human.exitCode, 0, human.stderr);
  if (row.result !== null) assert.ok(human.stdout.trim());
  const replies = await f.rpc(f.cli, [argv]) as { result?: unknown; error?: unknown }[];
  assert.equal(replies[0]?.error, undefined);
  assert.deepEqual(replies[0]?.result, row.result);
  assert.equal(calls, 4);
  for (const status of [400, 401, 403, 404, 409, 429, 500]) {
    let rejectedCalls = 0;
    server.use(http.all("*", () => { rejectedCalls++; effects++; return new HttpResponse("synthetic-token private-response", { status }); }));
    await assert.rejects(f.cli.execute(argv), (error: unknown) => {
      assert.match((error as Error).message, new RegExp(`HTTP ${status}`));
      assert.doesNotMatch((error as Error).message, /synthetic-token|private-response/);
      return true;
    });
    assert.equal(rejectedCalls, 1, "No automatic retry after rejection");
  }
  if (row.update) {
    for (const failure of ["lost reply", "invalid JSON", "invalid shape", "server failure"] as const) {
      let attempted = 0;
      server.use(http.all("*", () => {
        attempted++; effects++; // The server has already received/applied this synthetic operation.
        if (failure === "lost reply") return HttpResponse.error();
        if (failure === "invalid JSON") return new HttpResponse("synthetic-token private-response");
        if (failure === "invalid shape") return HttpResponse.json(42);
        return new HttpResponse("synthetic-token private-response", { status: 503 });
      }));
      await assert.rejects(f.cli.execute(argv), (error: unknown) => {
        assert.match((error as Error).message, /write outcome is unknown/i);
        if (failure === "lost reply") assert.equal((error as { code: string }).code, "request.failed");
        return true;
      });
      for (const json of [false, true]) {
        const shown = await f.run(f.cli, [...argv, ...(json ? ["--json"] : [])]);
        assert.equal(shown.exitCode, 1);
        assert.equal(shown.stdout, "");
        assert.match(shown.stderr, /write outcome is unknown/i);
        assert.doesNotMatch(shown.stderr, /synthetic-token|private-response/);
      }
      const [reply] = await f.rpc(f.cli, [argv]) as { error: { message: string; data: { code: string } } }[];
      assert.match(reply!.error.message, /write outcome is unknown/i);
      if (failure === "lost reply") assert.equal(reply!.error.data.code, "request.failed");
      assert.equal(attempted, 4, "One attempt per surface; ambiguous writes never retry");
    }
  }
  const beforeDenied = effects;
  await f.cli.execute(["permissions", "revoke", row.update ? "Update" : "ReadOnly"]);
  await assert.rejects(f.cli.execute(argv), (e: unknown) => (e as { code: string }).code === "permission.denied");
  assert.equal(effects, beforeDenied);
  for (const json of [false, true]) {
    const denied = await f.run(f.cli, [...argv, ...(json ? ["--json"] : [])]);
    assert.equal(denied.exitCode, 1);
    assert.equal(denied.stdout, "");
    assert.match(denied.stderr, /permission.denied|Permission .* disabled/);
  }
  const deniedRpc = await f.rpc(f.cli, [argv]) as { error: { data: { code: string } } }[];
  assert.equal(deniedRpc[0]?.error.data.code, "permission.denied");
  assert.equal(effects, beforeDenied);
}

}
