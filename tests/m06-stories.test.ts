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

test("US-028 delete an explicitly selected article", async t => {
  await storyCase(t, {"argv":["article","delete","article /?","--fields","id"],"method":"DELETE","path":"/api/articles/article%20%2F%3F","query":[["fields","id"]],"response":undefined,"result":null,"update":true});
});

test("US-030 delete only selected sprint and board identities", async t => {
  await storyCase(t, {"argv":["sprint","delete","board /?","sprint /?","--fields","id"],"method":"DELETE","path":"/api/agiles/board%20%2F%3F/sprints/sprint%20%2F%3F","query":[["fields","id"]],"response":undefined,"result":null,"update":true});
  await storyCase(t, {"argv":["agile","delete","board /?"],"method":"DELETE","path":"/api/agiles/board%20%2F%3F","query":[],"response":undefined,"result":null,"update":true});
});

test("US-053 create projects with an explicit leader/template and preserve native updates", async t => {
  await storyCase(t, {"argv":["project","create","--body","{\"name\":\"Synthetic project\",\"shortName\":\"SYN\",\"leader\":{\"id\":\"leader /?\"}}","--fields","id","--template","scrum"],"method":"POST","path":"/api/admin/projects","query":[["fields","id"],["template","scrum"]],"body":{"name":"Synthetic project","shortName":"SYN","leader":{"id":"leader /?"}},"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"},"update":true});
  await storyCase(t, {"argv":["project","update","project /?","--body","{\"name\":\"Renamed project\",\"description\":null,\"archived\":false}","--fields","id"],"method":"POST","path":"/api/admin/projects/project%20%2F%3F","query":[["fields","id"]],"body":{"name":"Renamed project","description":null,"archived":false},"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"},"update":true});
});

test("US-053 project creation needs a native leader and names empty successful results", async t => {
  const f = await configuredFixture(t, { permissions: ["Update"] }); let calls = 0;
  server.use(http.post("*", () => { calls++; return new HttpResponse(null, { status: 204 }); }));
  for (const body of [{ name: "Synthetic", shortName: "SYN" }, { name: "Synthetic", shortName: "SYN", leader: {} }]) {
    await assert.rejects(f.cli.execute(["project", "create", "--body", JSON.stringify(body)])); assert.equal(calls, 0);
  }
  const argv = ["project", "create", "--body", '{"name":"Selected-project","shortName":"SYN","leader":{"id":"leader"}}'];
  const r = await f.run(f.cli, argv); assert.equal(r.exitCode, 0, r.stderr); assert.match(r.stdout, /Selected-project/); assert.equal(calls, 1);
  assert.equal(await f.json(f.cli, argv), null);
});

test("US-054 use explicit project-scoped issue endpoints and repeated native fields", async t => {
  await storyCase(t, {"argv":["project","issues","list","project /?","--custom-field","Priority","--custom-field","State","--custom-field","Priority","--fields","id","--start","7","--page-size","20"],"method":"GET","path":"/api/admin/projects/project%20%2F%3F/issues","query":[["fields","id"],["$skip","7"],["$top","20"],["customFields","Priority"],["customFields","State"],["customFields","Priority"]],"response":[],"result":{"count":0,"items":[],"hasMore":false,"nextStart":null}});
  await storyCase(t, {"argv":["project","issues","get","project /?","issue /?","--fields","id"],"method":"GET","path":"/api/admin/projects/project%20%2F%3F/issues/issue%20%2F%3F","query":[["fields","id"]],"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"}});
  await storyCase(t, {"argv":["project","issues","create","project /?","--body","{\"summary\":\"Synthetic scoped issue\",\"description\":null}","--fields","id","--mute-update-notifications","false"],"method":"POST","path":"/api/admin/projects/project%20%2F%3F/issues","query":[["fields","id"],["muteUpdateNotifications","false"]],"body":{"summary":"Synthetic scoped issue","description":null},"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"},"update":true});
  await storyCase(t, {"argv":["project","issues","update","project /?","issue /?","--body","{\"summary\":null,\"description\":\"Synthetic scoped update\"}","--fields","id","--mute-update-notifications","true"],"method":"POST","path":"/api/admin/projects/project%20%2F%3F/issues/issue%20%2F%3F","query":[["fields","id"],["muteUpdateNotifications","true"]],"body":{"summary":null,"description":"Synthetic scoped update"},"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"},"update":true});
});

test("US-054 scoped creation preflight and empty replies retain issue identity and project context", async t => {
  const f = await configuredFixture(t, { permissions: ["Update"] }); let calls = 0;
  server.use(http.post("*", () => { calls++; return new HttpResponse(null, { status: 204 }); }));
  await assert.rejects(f.cli.execute(["project", "issues", "create", "selected-project", "--body", "{}"])); assert.equal(calls, 0);
  for (const argv of [
    ["project", "issues", "create", "selected-project", "--body", '{"summary":"Selected issue"}'],
    ["project", "issues", "update", "selected-project", "selected-issue", "--body", '{"summary":null}'],
  ]) {
    const r = await f.run(f.cli, argv); assert.equal(r.exitCode, 0, r.stderr); assert.match(r.stdout, /Selected issue|selected-issue/); assert.match(r.stdout, /selected-project/);
    assert.equal(await f.json(f.cli, argv), null);
  }
});

test("US-057 create update and delete explicitly named groups", async t => {
  await storyCase(t, {"argv":["group","create","--body","{\"name\":\"Synthetic group\"}","--fields","id"],"method":"POST","path":"/api/groups","query":[["fields","id"]],"body":{"name":"Synthetic group"},"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"},"update":true});
  await storyCase(t, {"argv":["group","update","group /?","--body","{\"name\":\"Renamed group\"}","--fields","id"],"method":"POST","path":"/api/groups/group%20%2F%3F","query":[["fields","id"]],"body":{"name":"Renamed group"},"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"},"update":true});
  await storyCase(t, {"argv":["group","delete","group /?","--fields","id"],"method":"DELETE","path":"/api/groups/group%20%2F%3F","query":[["fields","id"]],"response":undefined,"result":null,"update":true});
});

test("US-058 read and maintain native organizations without hidden membership changes", async t => {
  await storyCase(t, {"argv":["organization","list","--fields","id","--start","7","--page-size","20"],"method":"GET","path":"/api/admin/organizations","query":[["fields","id"],["$skip","7"],["$top","20"]],"response":[],"result":{"count":0,"items":[],"hasMore":false,"nextStart":null}});
  await storyCase(t, {"argv":["organization","get","org /?","--fields","id"],"method":"GET","path":"/api/admin/organizations/org%20%2F%3F","query":[["fields","id"]],"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"}});
  await storyCase(t, {"argv":["organization","create","--body","{\"name\":\"Synthetic organization\"}","--fields","id"],"method":"POST","path":"/api/admin/organizations","query":[["fields","id"]],"body":{"name":"Synthetic organization"},"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"},"update":true});
  await storyCase(t, {"argv":["organization","update","org /?","--body","{\"name\":\"Renamed organization\"}","--fields","id"],"method":"POST","path":"/api/admin/organizations/org%20%2F%3F","query":[["fields","id"]],"body":{"name":"Renamed organization"},"response":{"id":"synthetic-result"},"result":{"id":"synthetic-result"},"update":true});
  await storyCase(t, {"argv":["organization","delete","org /?"],"method":"DELETE","path":"/api/admin/organizations/org%20%2F%3F","query":[],"response":undefined,"result":null,"update":true});
});
