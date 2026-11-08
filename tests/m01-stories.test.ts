import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
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
  multipart?: string;
  result: unknown;
  response: unknown;
  update?: boolean;
}

/** Independently authored wire expectations, exercised through the real declaration on every surface. */
async function storyCase(t: TestContext, row: StoryCase) {
  const f = await configuredFixture(t, { permissions: [row.update ? "Update" : "ReadOnly"] });
  const argv = row.argv.map(value => value === "$UPLOAD" ? join(f.root, "synthetic-upload.txt") : value);
  if (row.multipart !== undefined) await writeFile(join(f.root, "synthetic-upload.txt"), row.multipart);
  let calls = 0;
  server.use(http.all("*", async ({ request }) => {
    calls++;
    assert.equal(request.method, row.method);
    const url = new URL(request.url);
    assert.equal(url.origin, "https://youtrack.example.com");
    assert.equal(url.pathname, "/context" + row.path);
    assert.deepEqual([...url.searchParams].sort(), [...row.query].sort());
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
  await f.cli.execute(["permissions", "revoke", row.update ? "Update" : "ReadOnly"]);
  await assert.rejects(f.cli.execute(argv), (e: unknown) => (e as { code: string }).code === "permission.denied");
  assert.equal(calls, 4);
  for (const json of [false, true]) {
    const denied = await f.run(f.cli, [...argv, ...(json ? ["--json"] : [])]);
    assert.equal(denied.exitCode, 1);
    assert.equal(denied.stdout, "");
    assert.match(denied.stderr, /permission.denied|Permission .* disabled/);
  }
  const deniedRpc = await f.rpc(f.cli, [argv]) as { error: { data: { code: string } } }[];
  assert.equal(deniedRpc[0]?.error.data.code, "permission.denied");
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

test("US-002 issue history list/detail and native cursor filters retain their distinct contracts", async t => {
  await storyCase(t, {
    argv: ["issues", "activity", "list", "DEMO-1", "--categories", "CommentsCategory", "--author", "me", "--activity-start", "000", "--activity-end", "9223372036854775807", "--reverse", "--fields", "id"],
    method: "GET", path: "/api/issues/DEMO-1/activities",
    query: [["fields", "id"], ["$top", "50"], ["$skip", "0"], ["categories", "CommentsCategory"], ["author", "me"], ["start", "000"], ["end", "9223372036854775807"], ["reverse", "true"]],
    response: [], result: emptyPage,
  });
  await storyCase(t, {
    argv: ["issues", "activity", "get", "DEMO-1", "opaque/item", "--fields", "id"],
    method: "GET", path: "/api/issues/DEMO-1/activities/opaque%2Fitem", query: [["fields", "id"]], response: detail, result: detail,
  });
  const cursor = { id: "cursor-page", activities: [], beforeCursor: "a/opaque", afterCursor: "b?opaque", hasBefore: false, hasAfter: true, reverse: false };
  await storyCase(t, {
    argv: ["issues", "activity", "page", "DEMO-1", "--categories", "CommentsCategory", "--author", "me", "--activity-start", "-1", "--activity-end", "2", "--activity-id", "opaque activity", "--cursor", "a/opaque", "--fields", "id,activities"],
    method: "GET", path: "/api/issues/DEMO-1/activitiesPage",
    query: [["fields", "id,activities"], ["categories", "CommentsCategory"], ["author", "me"], ["start", "-1"], ["end", "2"], ["activityId", "opaque activity"], ["cursor", "a/opaque"]], response: cursor, result: cursor,
  });
});

test("US-003 issue writes expose projections, false/true notifications and draft-only publication", async t => {
  const rows: StoryCase[] = [
    { argv: ["issues", "create", "--body", "{}", "--draft-id", "draft/?opaque", "--mute-update-notifications", "false", "--fields", "id"],
      method: "POST", path: "/api/issues", query: [["fields", "id"], ["draftId", "draft/?opaque"], ["muteUpdateNotifications", "false"]], body: {}, response: detail, result: detail, update: true },
    { argv: ["issues", "update", "DEMO-1", "--body", '{"summary":null,"nativeMetadata":true}', "--mute-update-notifications", "--fields", "id"],
      method: "POST", path: "/api/issues/DEMO-1", query: [["fields", "id"], ["muteUpdateNotifications", "true"]], body: { summary: null, nativeMetadata: true }, response: detail, result: detail, update: true },
    { argv: ["issues", "fields", "set", "DEMO-1", "opaque field", "--body", '{"$type":"FutureIssueCustomField","value":null}', "--fields", "id", "--mute-update-notifications"],
      method: "POST", path: "/api/issues/DEMO-1/customFields/opaque%20field", query: [["fields", "id"], ["muteUpdateNotifications", "true"]], body: { $type: "FutureIssueCustomField", value: null }, response: detail, result: detail, update: true },
  ];
  for (const row of rows) await storyCase(t, row);
});

test("US-004 comment writes preserve native JSON, draft selectors and explicit notification controls", async t => {
  await storyCase(t, { argv: ["issues", "comments", "add", "DEMO-1", "--body", "{}", "--draft-id", "comment draft", "--mute-update-notifications", "false", "--fields", "id"], method: "POST", path: "/api/issues/DEMO-1/comments", query: [["fields", "id"], ["draftId", "comment draft"], ["muteUpdateNotifications", "false"]], body: {}, response: detail, result: detail, update: true });
  await storyCase(t, { argv: ["issues", "comments", "update", "DEMO-1", "c/1", "--body", '{"text":null,"pinned":true}', "--mute-update-notifications", "--fields", "id"], method: "POST", path: "/api/issues/DEMO-1/comments/c%2F1", query: [["fields", "id"], ["muteUpdateNotifications", "true"]], body: { text: null, pinned: true }, response: detail, result: detail, update: true });
});

test("US-006 work item writes expose mute controls and exact deletion with optional fields", async t => {
  const body = { duration: { minutes: -1 }, text: null, futureMetadata: true };
  for (const [leaf, path] of [["add", "/api/issues/DEMO-1/timeTracking/workItems"], ["update", "/api/issues/DEMO-1/timeTracking/workItems/item%2F1"]]) {
    await storyCase(t, { argv: ["issues", "work-items", leaf!, "DEMO-1", ...(leaf === "update" ? ["item/1"] : []), "--body", JSON.stringify(body), "--fields", "id", "--mute-update-notifications", "false"], method: "POST", path: path!, query: [["fields", "id"], ["muteUpdateNotifications", "false"]], body, response: detail, result: detail, update: true });
  }
  await storyCase(t, { argv: ["issues", "work-items", "delete", "DEMO-1", "item/1", "--fields", "id"], method: "DELETE", path: "/api/issues/DEMO-1/timeTracking/workItems/item%2F1", query: [["fields", "id"]], response: undefined, result: null, update: true });
});

test("US-007 work-item date/author filters stay distinct from offset paging", async t => {
  await storyCase(t, { argv: ["work-items", "list", "--fields", "id", "--start", "7", "--author", "me", "--creator", "creator/opaque", "--start-date", "2026-01-01", "--end-date", "2026-01-31", "--work-start", "-1", "--work-end", "9223372036854775807", "--created-start", "0", "--created-end", "1", "--updated-start", "2", "--updated-end", "3"],
    method: "GET", path: "/api/workItems", query: [["fields", "id"], ["$top", "50"], ["$skip", "7"], ["author", "me"], ["creator", "creator/opaque"], ["startDate", "2026-01-01"], ["endDate", "2026-01-31"], ["start", "-1"], ["end", "9223372036854775807"], ["createdStart", "0"], ["createdEnd", "1"], ["updatedStart", "2"], ["updatedEnd", "3"]], response: [], result: emptyPage });
});

test("US-008 tag search, exact issue-tag detail and assignment projection use their own routes", async t => {
  await storyCase(t, { argv: ["tags", "list", "--query", " team & release ", "--fields", "id"], method: "GET", path: "/api/tags", query: [["fields", "id"], ["$top", "50"], ["$skip", "0"], ["query", " team & release "]], response: [], result: emptyPage });
  await storyCase(t, { argv: ["issues", "tags", "get", "DEMO-1", "tag/opaque", "--fields", "id"], method: "GET", path: "/api/issues/DEMO-1/tags/tag%2Fopaque", query: [["fields", "id"]], response: detail, result: detail });
  await storyCase(t, { argv: ["issues", "tags", "add", "DEMO-1", "--body", '{"id":"tag/opaque","native":true}', "--fields", "id"], method: "POST", path: "/api/issues/DEMO-1/tags", query: [["fields", "id"]], body: { id: "tag/opaque", native: true }, response: detail, result: detail, update: true });
});

test("US-005 attachment upload controls, metadata update and exact deletion stay native", async t => {
  await storyCase(t, { argv: ["issues", "attachments", "upload", "DEMO-1", "--file", "$UPLOAD", "--fields", "id", "--mute-update-notifications", "false"], method: "POST", path: "/api/issues/DEMO-1/attachments", query: [["fields", "id"], ["muteUpdateNotifications", "false"]], multipart: "Synthetic multipart content", response: [detail], result: [detail], update: true });
  await storyCase(t, { argv: ["issues", "attachments", "update", "DEMO-1", "file/1", "--body", '{"name":"renamed.txt","nativeMetadata":true}', "--fields", "id"], method: "POST", path: "/api/issues/DEMO-1/attachments/file%2F1", query: [["fields", "id"]], body: { name: "renamed.txt", nativeMetadata: true }, response: detail, result: detail, update: true });
  await storyCase(t, { argv: ["issues", "attachments", "delete", "DEMO-1", "file/1", "--fields", "id"], method: "DELETE", path: "/api/issues/DEMO-1/attachments/file%2F1", query: [["fields", "id"]], response: undefined, result: null, update: true });
});
