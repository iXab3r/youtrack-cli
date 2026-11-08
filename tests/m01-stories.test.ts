import assert from "node:assert/strict";
import { after, afterEach, before, test, type TestContext } from "node:test";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { configuredFixture } from "./cli-fixture.js";

const server = setupServer();
before(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
after(() => server.close());

interface StoryCase {
  argv: string[];
  method: string;
  path: string;
  query: [string, string][];
  body?: unknown;
  result: unknown;
  response: unknown;
  update?: boolean;
}

/** Independently authored wire expectations, exercised through the real declaration on every surface. */
async function storyCase(t: TestContext, row: StoryCase) {
  const f = await configuredFixture(t, { permissions: [row.update ? "Update" : "ReadOnly"] });
  let calls = 0;
  server.use(http.all("*", async ({ request }) => {
    calls++;
    assert.equal(request.method, row.method);
    const url = new URL(request.url);
    assert.equal(url.origin, "https://youtrack.example.com");
    assert.equal(url.pathname, "/context" + row.path);
    assert.deepEqual([...url.searchParams].sort(), [...row.query].sort());
    assert.equal(request.headers.get("authorization"), "Bearer synthetic-token");
    if (row.body === undefined) assert.equal(await request.text(), "");
    else assert.deepEqual(await request.json(), row.body);
    return row.response === undefined ? new HttpResponse(null, { status: 204 }) : HttpResponse.json(row.response);
  }));
  assert.deepEqual(await f.cli.execute(row.argv), row.result);
  const json = await f.json(f.cli, row.argv);
  assert.deepEqual(json, row.result);
  const human = await f.run(f.cli, row.argv);
  assert.equal(human.exitCode, 0, human.stderr);
  assert.ok(human.stdout.trim());
  const replies = await f.rpc(f.cli, [row.argv]) as { result?: unknown; error?: unknown }[];
  assert.equal(replies[0]?.error, undefined);
  assert.deepEqual(replies[0]?.result, row.result);
  assert.equal(calls, 4);
  await f.cli.execute(["permissions", "revoke", row.update ? "Update" : "ReadOnly"]);
  await assert.rejects(f.cli.execute(row.argv), (e: unknown) => (e as { code: string }).code === "permission.denied");
  assert.equal(calls, 4);
}

const emptyPage = { count: 0, items: [], hasMore: false, nextStart: null };
const detail = { id: "synthetic-result" };

test("US-001 repeated custom-field selections retain order/duplicates on execute, human, JSON and RPC", async t => {
  await storyCase(t, {
    argv: ["issues", "list", "--fields", "id", "--custom-field", "Priority & type", "--custom-field", "State", "--custom-field", "State"],
    method: "GET", path: "/api/issues",
    query: [["fields", "id"], ["$top", "50"], ["$skip", "0"], ["customFields", "Priority & type"], ["customFields", "State"], ["customFields", "State"]],
    response: [], result: emptyPage,
  });
});

test("US-001 complete issue traversal keeps repeated selectors on every page", async t => {
  const f = await configuredFixture(t);
  const starts: string[] = [];
  server.use(http.get("*", ({ request }) => {
    const q = new URL(request.url).searchParams;
    assert.deepEqual(q.getAll("customFields"), ["Priority", "State"]);
    starts.push(q.get("$skip")!);
    return HttpResponse.json(starts.length === 1 ? [{ id: "synthetic-first" }] : []);
  }));
  assert.deepEqual(await f.cli.execute(["issues", "list", "--all", "--max-results", "2", "--page-size", "1", "--custom-field", "Priority", "--custom-field", "State"]), {
    count: 1, items: [{ id: "synthetic-first" }], hasMore: false, nextStart: null,
  });
  assert.deepEqual(starts, ["0", "1"]);
});
