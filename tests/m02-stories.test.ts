import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { configuredFixture } from "./cli-fixture.js";
import { createStoryCase, type StoryCase } from "./story-case.js";
const server = setupServer();
before(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
after(() => server.close());
const storyCase = createStoryCase(server);
const detail = { id: "synthetic-result" };
const emptyPage = { count: 0, items: [], hasMore: false, nextStart: null };

test("US-012 create and edit saved searches preserve native fields and projection", async t => {
  await storyCase(t, { argv: ["saved-queries", "create", "--body", '{"name":"Synthetic queue","query":null,"visibleFor":null}', "--fields", "id"], method: "POST", path: "/api/savedQueries", query: [["fields", "id"]], body: { name: "Synthetic queue", query: null, visibleFor: null }, response: detail, result: detail, update: true });
  await storyCase(t, { argv: ["saved-queries", "update", "q /?", "--body", '{"query":"project: DEMO","updateableBy":null}', "--fields", "id"], method: "POST", path: "/api/savedQueries/q%20%2F%3F", query: [["fields", "id"]], body: { query: "project: DEMO", updateableBy: null }, response: undefined, result: null, update: true });
});

test("US-016 read and set the exact issue project without discovery", async t => {
  await storyCase(t, { argv: ["issues", "project", "get", "DEMO /?", "--fields", "id"], method: "GET", path: "/api/issues/DEMO%20%2F%3F/project", query: [["fields", "id"]], response: detail, result: detail });
  await storyCase(t, { argv: ["issues", "project", "set", "DEMO /?", "--body", '{"id":"target /?"}', "--fields", "id", "--mute-update-notifications", "false"], method: "POST", path: "/api/issues/DEMO%20%2F%3F/project", query: [["fields", "id"], ["muteUpdateNotifications", "false"]], body: { id: "target /?" }, response: detail, result: detail, update: true });
});

test("US-017 native VCS create, state update and exact removal retain opaque IDs", async t => {
  await storyCase(t, { argv: ["issues", "vcs-changes", "create", "DEMO-1", "--body", '{"version":"synthetic-version","state":4}', "--fields", "id", "--mute-update-notifications"], method: "POST", path: "/api/issues/DEMO-1/vcsChanges", query: [["fields", "id"], ["muteUpdateNotifications", "true"]], body: { version: "synthetic-version", state: 4 }, response: detail, result: detail, update: true });
  await storyCase(t, { argv: ["issues", "vcs-changes", "update", "DEMO-1", "change /?", "--body", '{"state":2}', "--fields", "id", "--mute-update-notifications", "false"], method: "POST", path: "/api/issues/DEMO-1/vcsChanges/change%20%2F%3F", query: [["fields", "id"], ["muteUpdateNotifications", "false"]], body: { state: 2 }, response: undefined, result: null, update: true });
  await storyCase(t, { argv: ["issues", "vcs-changes", "delete", "DEMO-1", "change /?"], method: "DELETE", path: "/api/issues/DEMO-1/vcsChanges/change%20%2F%3F", query: [], response: undefined, result: null, update: true });
});

test("US-018 command controls retain explicit targets, false flags, caret and native visibility", async t => {
  const body = { query: "State Fixed", issues: [{ idReadable: "DEMO-1" }, { id: "2-1" }], comment: "Synthetic\ncontext", visibility: { $type: "CommandLimitedVisibility", permittedGroups: [{ id: "g /?" }], permittedUsers: [] }, caret: -1, silent: false, runAs: "synthetic-login" };
  await storyCase(t, { argv: ["commands", "apply", "--query", "State Fixed", "--issues", "DEMO-1,2-1", "--comment", "Synthetic\ncontext", "--visibility", JSON.stringify(body.visibility), "--caret", "-1", "--silent", "false", "--run-as", "synthetic-login", "--fields", "id", "--mute-update-notifications", "false"], method: "POST", path: "/api/commands", query: [["fields", "id"], ["muteUpdateNotifications", "false"]], body, response: detail, result: detail, update: true });
});

test("US-019 global activity list detail and cursor page preserve native filters", async t => {
  await storyCase(t, { argv: ["activities", "list", "--categories", "CommentsCategory,IssueCreatedCategory", "--issue-query", "project: DEMO", "--author", "me", "--activity-start", "-1", "--activity-end", "9223372036854775807", "--reverse", "--start", "7", "--fields", "id"], method: "GET", path: "/api/activities", query: [["fields", "id"], ["$top", "50"], ["$skip", "7"], ["categories", "CommentsCategory,IssueCreatedCategory"], ["issueQuery", "project: DEMO"], ["author", "me"], ["start", "-1"], ["end", "9223372036854775807"], ["reverse", "true"]], response: [], result: emptyPage });
  await storyCase(t, { argv: ["activities", "get", "activity /?", "--fields", "id"], method: "GET", path: "/api/activities/activity%20%2F%3F", query: [["fields", "id"]], response: detail, result: detail });
  const cursor = { id: "page", activities: [], beforeCursor: "before /?", afterCursor: "after /?", hasBefore: false, hasAfter: true, reverse: true };
  await storyCase(t, { argv: ["activities", "page", "--categories", "CommentsCategory", "--activity-id", "activity /?", "--issue-query", "project: DEMO", "--author", "me", "--activity-start", "000", "--activity-end", "-1", "--cursor", "before /?", "--reverse", "--fields", "id,activities"], method: "GET", path: "/api/activitiesPage", query: [["fields", "id,activities"], ["categories", "CommentsCategory"], ["activityId", "activity /?"], ["issueQuery", "project: DEMO"], ["author", "me"], ["start", "000"], ["end", "-1"], ["cursor", "before /?"], ["reverse", "true"]], response: cursor, result: cursor });
});

test("US-021 article writes expose notifications and draft-only publication", async t => {
  await storyCase(t, { argv: ["article", "create", "--body", "{}", "--draft-id", "draft /?", "--fields", "id", "--mute-update-notifications", "false"], method: "POST", path: "/api/articles", query: [["fields", "id"], ["draftId", "draft /?"], ["muteUpdateNotifications", "false"]], body: {}, response: detail, result: detail, update: true });
  await storyCase(t, { argv: ["article", "update", "KB /?", "--body", '{"summary":null,"content":"Synthetic\\ncontent","parentArticle":null}', "--fields", "id", "--mute-update-notifications"], method: "POST", path: "/api/articles/KB%20%2F%3F", query: [["fields", "id"], ["muteUpdateNotifications", "true"]], body: { summary: null, content: "Synthetic\ncontent", parentArticle: null }, response: undefined, result: null, update: true });
});

test("US-022 article comments retain draft publication and notification controls", async t => {
  await storyCase(t, { argv: ["article", "comment", "add", "KB-1", "--body", "{}", "--draft-id", "comment /?", "--fields", "id", "--mute-update-notifications", "false"], method: "POST", path: "/api/articles/KB-1/comments", query: [["fields", "id"], ["draftId", "comment /?"], ["muteUpdateNotifications", "false"]], body: {}, response: detail, result: detail, update: true });
  await storyCase(t, { argv: ["article", "comment", "update", "KB-1", "c /?", "--body", '{"text":null,"pinned":true}', "--fields", "id", "--mute-update-notifications"], method: "POST", path: "/api/articles/KB-1/comments/c%20%2F%3F", query: [["fields", "id"], ["muteUpdateNotifications", "true"]], body: { text: null, pinned: true }, response: undefined, result: null, update: true });
});

test("US-023 article tags read, assign and remove relations without deleting global tags", async t => {
  await storyCase(t, { argv: ["article", "tag", "list", "KB-1", "--fields", "id"], method: "GET", path: "/api/articles/KB-1/tags", query: [["fields", "id"], ["$top", "50"], ["$skip", "0"]], response: [], result: emptyPage });
  await storyCase(t, { argv: ["article", "tag", "get", "KB-1", "tag /?", "--fields", "id"], method: "GET", path: "/api/articles/KB-1/tags/tag%20%2F%3F", query: [["fields", "id"]], response: detail, result: detail });
  await storyCase(t, { argv: ["article", "tag", "add", "KB-1", "--body", '{"id":"tag /?","color":{"id":"synthetic-style"}}', "--fields", "id"], method: "POST", path: "/api/articles/KB-1/tags", query: [["fields", "id"]], body: { id: "tag /?", color: { id: "synthetic-style" } }, response: detail, result: detail, update: true });
  await storyCase(t, { argv: ["article", "tag", "remove", "KB-1", "tag /?"], method: "DELETE", path: "/api/articles/KB-1/tags/tag%20%2F%3F", query: [], response: undefined, result: null, update: true });
});

test("US-025 article attachment upload controls, native metadata and exact deletion", async t => {
  await storyCase(t, { argv: ["article", "attachment", "upload", "KB-1", "--file", "$UPLOAD", "--fields", "id", "--mute-update-notifications", "false"], method: "POST", path: "/api/articles/KB-1/attachments", query: [["fields", "id"], ["muteUpdateNotifications", "false"]], multipart: "Synthetic article attachment", response: [detail], result: [detail], update: true });
  await storyCase(t, { argv: ["article", "attachment", "update", "KB-1", "file /?", "--body", '{"name":"Synthetic.txt","visibility":null}', "--fields", "id"], method: "POST", path: "/api/articles/KB-1/attachments/file%20%2F%3F", query: [["fields", "id"]], body: { name: "Synthetic.txt", visibility: null }, response: detail, result: detail, update: true });
  await storyCase(t, { argv: ["article", "attachment", "delete", "KB-1", "file /?"], method: "DELETE", path: "/api/articles/KB-1/attachments/file%20%2F%3F", query: [], response: undefined, result: null, update: true });
});

test("US-026 article comment reactions preserve open native values and exact relations", async t => {
  const path = "/api/articles/KB-1/comments/comment%20%2F%3F/reactions";
  await storyCase(t, { argv: ["article", "comment", "reaction", "list", "KB-1", "comment /?", "--fields", "id"], method: "GET", path, query: [["fields", "id"], ["$top", "50"], ["$skip", "0"]], response: [], result: emptyPage });
  await storyCase(t, { argv: ["article", "comment", "reaction", "get", "KB-1", "comment /?", "r /?", "--fields", "id"], method: "GET", path: path + "/r%20%2F%3F", query: [["fields", "id"]], response: detail, result: detail });
  await storyCase(t, { argv: ["article", "comment", "reaction", "add", "KB-1", "comment /?", "--body", '{"reaction":null,"author":{"id":"synthetic-user"}}', "--fields", "id"], method: "POST", path, query: [["fields", "id"]], body: { reaction: null, author: { id: "synthetic-user" } }, response: detail, result: detail, update: true });
  await storyCase(t, { argv: ["article", "comment", "reaction", "remove", "KB-1", "comment /?", "r /?"], method: "DELETE", path: path + "/r%20%2F%3F", query: [], response: undefined, result: null, update: true });
});

test("M02 new offset lists retain empty, short, zero-size and overflow contracts", async t => {
  const f = await configuredFixture(t, { permissions: ["ReadOnly"] });
  const rows = [
    ["activities", "list", "--categories", "CommentsCategory"],
    ["article", "tag", "list", "KB-1"],
    ["article", "comment", "reaction", "list", "KB-1", "comment"],
  ];
  let calls = 0;
  for (const argv of rows) {
    server.use(http.get("*", ({ request }) => {
      calls++;
      const q = new URL(request.url).searchParams;
      assert.equal(q.get("$skip"), "3");
      return HttpResponse.json(q.get("$top") === "0" ? [] : [{ id: "synthetic-row" }]);
    }));
    assert.deepEqual(await f.cli.execute([...argv, "--page-size", "2", "--start", "3"]), { count: 1, items: [{ id: "synthetic-row" }], hasMore: null, nextStart: 4 });
    assert.deepEqual(await f.cli.execute([...argv, "--page-size", "0", "--start", "3"]), { count: 0, items: [], hasMore: null, nextStart: null });
    const before = calls;
    await assert.rejects(f.cli.execute([...argv, "--page-size", "1", "--start", String(Number.MAX_SAFE_INTEGER)]), /offset|safe|overflow/i);
    assert.equal(calls, before);
    server.use(http.get("*", () => HttpResponse.json(null)));
    await assert.rejects(f.cli.execute(argv), /Invalid collection/);
    server.use(http.get("*", () => HttpResponse.json([{ id: "one" }, { id: "two" }])));
    await assert.rejects(f.cli.execute([...argv, "--page-size", "1"]), /More items/);
  }
});

test("M02 silent true/false, sparse projections and invalid controls keep native semantics", async t => {
  const f = await configuredFixture(t, { permissions: ["Update"] });
  let calls = 0;
  for (const [flags, expected] of [[[], undefined], [["--silent"], true], [["--silent", "true"], true], [["--silent", "false"], false]] as const) {
    server.use(http.post("*", async ({ request }) => {
      calls++;
      const body = await request.json() as Record<string, unknown>;
      assert.equal(body.silent, expected);
      assert.equal(Object.hasOwn(body, "silent"), expected !== undefined);
      return HttpResponse.json({ query: "State Fixed", issues: [] });
    }));
    await f.cli.execute(["commands", "apply", "--query", "State Fixed", "--issues", "DEMO-1", ...flags]);
  }
  assert.equal(calls, 4);
  for (const flags of [["--silent", "invalid-synthetic-value"], ["--caret", "2147483648"], ["--visibility", "["]]) {
    await assert.rejects(f.cli.execute(["commands", "apply", "--query", "State Fixed", "--issues", "DEMO-1", ...flags]));
    assert.equal(calls, 4);
  }
  server.use(http.get("*", () => HttpResponse.json(null)));
  for (const argv of [["issues", "project", "get", "DEMO-1"], ["activities", "get", "activity"], ["article", "tag", "get", "KB-1", "tag"], ["article", "comment", "reaction", "get", "KB-1", "comment", "reaction"]]) {
    await f.cli.execute(["permissions", "grant", "ReadOnly"]);
    await assert.rejects(f.cli.execute(argv), /Invalid object/);
  }
});

test("M02 interleaved RPC isolates article and history profile auth and admission", async t => {
  const f = await configuredFixture(t, { permissions: ["ReadOnly", "Update"] });
  await f.cli.execute(["profile", "create", "other", "--url", "https://other.example.test/track"]);
  await f.secrets.set("ai-cli-factory:youtrack-cli", "other:token", "synthetic-other");
  await f.cli.execute(["permissions", "grant", "ReadOnly", "--profile", "other"]);
  await f.cli.execute(["permissions", "revoke", "Update", "--profile", "other"]);
  const calls: string[] = [];
  server.use(http.all("*", ({ request }) => {
    const u = new URL(request.url), other = u.hostname === "other.example.test";
    assert.equal(request.headers.get("authorization"), other ? "Bearer synthetic-other" : "Bearer synthetic-token");
    calls.push(u.host + u.pathname);
    if (other) return new HttpResponse("synthetic-other private-response", { status: 403 });
    return HttpResponse.json(u.pathname.endsWith("/activities") ? [] : { id: "synthetic-saved-query", query: "synthetic-token" });
  }));
  const replies = await f.rpc(f.cli, [
    ["activities", "list", "--categories", "CommentsCategory", "--profile", "dev"],
    ["article", "comment", "reaction", "add", "KB-1", "comment", "--body", '{"reaction":"future"}', "--profile", "other"],
    ["article", "tag", "get", "KB-1", "tag", "--profile", "other"],
    ["saved-queries", "create", "--body", '{"name":"Synthetic","query":"project: DEMO"}', "--profile", "dev"],
  ]) as { result?: unknown; error?: { data: { code: string } } }[];
  assert.deepEqual(replies[0]?.result, emptyPage);
  assert.equal(replies[1]?.error?.data.code, "permission.denied");
  assert.equal(replies[2]?.error?.data.code, "http.forbidden");
  assert.equal((replies[3]?.result as { query: string }).query, "[redacted]");
  assert.equal(calls.length, 3);
  assert.doesNotMatch(JSON.stringify(replies), /synthetic-other|synthetic-token|private-response/);
});

test("M02 cancellation reaches a global-history request and cannot return success", async t => {
  const f = await configuredFixture(t, { permissions: ["ReadOnly"] });
  const controller = new AbortController();
  let calls = 0, observed: AbortSignal | undefined;
  server.use(http.get("*", ({ request }) => {
    calls++; observed = request.signal;
    controller.abort();
    return HttpResponse.json([]);
  }));
  await assert.rejects(f.cli.execute(["activities", "list", "--categories", "CommentsCategory"], controller.signal));
  assert.equal(calls, 1);
  assert.equal(observed?.aborted, true);
});

test("M02 default human mutation views name the selected object on empty replies", async t => {
  const f = await configuredFixture(t, { permissions: ["Update"] });
  server.use(http.all("*", () => new HttpResponse(null, { status: 204 })));
  for (const [argv, human] of [
    [["saved-queries", "create", "--body", '{"name":"Synthetic","query":"project: DEMO"}'], /Saved search/],
    [["issues", "project", "set", "DEMO-1", "--body", '{"id":"synthetic-project"}'], /Moved issue DEMO-1/],
    [["issues", "vcs-changes", "update", "DEMO-1", "synthetic-change", "--body", '{"state":2}'], /VCS change.*synthetic-change/],
    [["article", "attachment", "update", "KB-1", "synthetic-file", "--body", '{"name":"Synthetic.txt"}'], /Updated attachment.*synthetic-file/],
    [["article", "comment", "reaction", "remove", "KB-1", "comment", "synthetic-reaction"], /Removed reaction synthetic-reaction/],
  ] as const) {
    const result = await f.run(f.cli, [...argv]);
    assert.equal(result.exitCode, 0, result.stderr);
    assert.match(result.stdout, human);
  }
});

test("M02 DELETE projections follow explicit parameter tables while defaults remain query-free", async t => {
  for (const [argv, path] of [
    [["issues", "vcs-changes", "delete", "DEMO-1", "change"], "/api/issues/DEMO-1/vcsChanges/change"],
    [["article", "attachment", "delete", "KB-1", "attachment"], "/api/articles/KB-1/attachments/attachment"],
    [["article", "tag", "remove", "KB-1", "tag"], "/api/articles/KB-1/tags/tag"],
    [["article", "comment", "reaction", "remove", "KB-1", "comment", "reaction"], "/api/articles/KB-1/comments/comment/reactions/reaction"],
  ] as const) await storyCase(t, { argv: [...argv, "--fields", "id"], method: "DELETE", path, query: [["fields", "id"]], response: detail, result: detail, update: true });
});
