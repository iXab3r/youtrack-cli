import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { createAgile } from "../src/agile.js";
import { configuredFixture } from "./cli-fixture.js";
import { createStoryCase, type StoryCase } from "./story-case.js";
const server = setupServer();
before(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
after(() => server.close());
const storyCase = createStoryCase(server);
const detail = { id: "synthetic-result" };
const emptyPage = { count: 0, items: [], hasMore: false, nextStart: null };

test("US-029 create and update a board and mute sprint creation without discovery", async t => {
  await storyCase(t, { argv: ["agile", "create", "--body", '{"name":"Synthetic board","projects":[{"id":"p /?"}],"sprintsSettings":{"disableSprints":false}}', "--template", "scrum", "--fields", "id"], method: "POST", path: "/api/agiles", query: [["fields", "id"], ["template", "scrum"]], body: { name: "Synthetic board", projects: [{ id: "p /?" }], sprintsSettings: { disableSprints: false } }, response: detail, result: detail, update: true });
  await storyCase(t, { argv: ["agile", "update", "board /?", "--body", '{"name":"Renamed board","orphansAtTheTop":false}', "--fields", "id"], method: "POST", path: "/api/agiles/board%20%2F%3F", query: [["fields", "id"]], body: { name: "Renamed board", orphansAtTheTop: false }, response: undefined, result: null, update: true });
  await storyCase(t, { argv: ["sprint", "create", "board /?", "--body", '{"name":"Synthetic sprint","goal":null}', "--fields", "id", "--mute-update-notifications", "false"], method: "POST", path: "/api/agiles/board%20%2F%3F/sprints", query: [["fields", "id"], ["muteUpdateNotifications", "false"]], body: { name: "Synthetic sprint", goal: null }, response: detail, result: detail, update: true });
});

test("US-031 create a named enum choice with native metadata", async t => {
  await storyCase(t, { argv: ["bundle", "enum", "value", "create", "bundle /?", "--body", '{"name":"Synthetic choice","localizedName":null,"archived":false,"color":{"id":"style"}}', "--fields", "id"], method: "POST", path: "/api/admin/customFieldSettings/bundles/enum/bundle%20%2F%3F/values", query: [["fields", "id"]], body: { name: "Synthetic choice", localizedName: null, archived: false, color: { id: "style" } }, response: detail, result: detail, update: true });
});

test("US-032 update and archive an exact enum value without discovery", async t => {
  await storyCase(t, { argv: ["bundle", "enum", "value", "update", "bundle /?", "value /?", "--body", '{"archived":true,"description":null}', "--fields", "id"], method: "POST", path: "/api/admin/customFieldSettings/bundles/enum/bundle%20%2F%3F/values/value%20%2F%3F", query: [["fields", "id"]], body: { archived: true, description: null }, response: undefined, result: null, update: true });
});

test("US-033 create a version with native null dates and false release state", async t => {
  await storyCase(t, { argv: ["bundle", "version", "value", "create", "bundle /?", "--body", '{"name":"Synthetic version","releaseDate":null,"startDate":0,"released":false}', "--fields", "id"], method: "POST", path: "/api/admin/customFieldSettings/bundles/version/bundle%20%2F%3F/values", query: [["fields", "id"]], body: { name: "Synthetic version", releaseDate: null, startDate: 0, released: false }, response: detail, result: detail, update: true });
});

test("US-034 edit version dates and archive flags without conversion", async t => {
  await storyCase(t, { argv: ["bundle", "version", "value", "update", "bundle /?", "version /?", "--body", '{"releaseDate":0,"startDate":null,"released":true,"archived":false}', "--fields", "id"], method: "POST", path: "/api/admin/customFieldSettings/bundles/version/bundle%20%2F%3F/values/version%20%2F%3F", query: [["fields", "id"]], body: { releaseDate: 0, startDate: null, released: true, archived: false }, response: undefined, result: null, update: true });
});

test("US-035 state catalog metadata remains separate from issue workflow transitions", async t => {
  await storyCase(t, { argv: ["bundle", "state", "value", "create", "bundle /?", "--body", '{"name":"Synthetic state","isResolved":false}', "--fields", "id"], method: "POST", path: "/api/admin/customFieldSettings/bundles/state/bundle%20%2F%3F/values", query: [["fields", "id"]], body: { name: "Synthetic state", isResolved: false }, response: detail, result: detail, update: true });
  await storyCase(t, { argv: ["bundle", "state", "value", "update", "bundle /?", "state /?", "--body", '{"isResolved":true,"localizedName":null}', "--fields", "id"], method: "POST", path: "/api/admin/customFieldSettings/bundles/state/bundle%20%2F%3F/values/state%20%2F%3F", query: [["fields", "id"]], body: { isResolved: true, localizedName: null }, response: undefined, result: null, update: true });
});

test("US-014 create and edit global working tags with native sharing and colors", async t => {
  await storyCase(t, { argv: ["tags", "create", "--body", '{"name":"Synthetic tag","visibleFor":null,"color":{"id":"style"}}', "--fields", "id"], method: "POST", path: "/api/tags", query: [["fields", "id"]], body: { name: "Synthetic tag", visibleFor: null, color: { id: "style" } }, response: detail, result: detail, update: true });
  await storyCase(t, { argv: ["tags", "update", "tag /?", "--body", '{"untagOnResolve":false,"updateableBy":null}', "--fields", "id"], method: "POST", path: "/api/tags/tag%20%2F%3F", query: [["fields", "id"]], body: { untagOnResolve: false, updateableBy: null }, response: undefined, result: null, update: true });
});

test("US-036 field defaults retain native subtype values, null and empty selections", async t => {
  await storyCase(t, { argv: ["field", "defaults", "get", "field /?", "--fields", "id,defaultValues"], method: "GET", path: "/api/admin/customFieldSettings/customFields/field%20%2F%3F/fieldDefaults", query: [["fields", "id,defaultValues"]], response: { id: "synthetic-defaults", defaultValues: [], emptyFieldText: null }, result: { id: "synthetic-defaults", defaultValues: [], emptyFieldText: null } });
  const body = { $type: "EnumBundleCustomFieldDefaults", canBeEmpty: false, isPublic: false, emptyFieldText: null, defaultValues: [], bundle: { id: "synthetic-bundle" } };
  await storyCase(t, { argv: ["field", "defaults", "update", "field /?", "--body", JSON.stringify(body), "--fields", "id"], method: "POST", path: "/api/admin/customFieldSettings/customFields/field%20%2F%3F/fieldDefaults", query: [["fields", "id"]], body, response: detail, result: detail, update: true });
});

test("US-037 attach and configure explicit prototype and project-field IDs", async t => {
  const body = { field: { id: "prototype /?" }, $type: "EnumProjectCustomField", canBeEmpty: false, bundle: { id: "bundle" } };
  await storyCase(t, { argv: ["project", "field", "create", "project /?", "--body", JSON.stringify(body), "--fields", "id"], method: "POST", path: "/api/admin/projects/project%20%2F%3F/customFields", query: [["fields", "id"]], body, response: detail, result: detail, update: true });
  await storyCase(t, { argv: ["project", "field", "update", "project /?", "instance /?", "--body", '{"canBeEmpty":true,"emptyFieldText":null,"defaultValues":[]}', "--fields", "id"], method: "POST", path: "/api/admin/projects/project%20%2F%3F/customFields/instance%20%2F%3F", query: [["fields", "id"]], body: { canBeEmpty: true, emptyFieldText: null, defaultValues: [] }, response: undefined, result: null, update: true });
});

test("US-038 list projects using a field as a bounded native instance page", async t => {
  await storyCase(t, { argv: ["field", "instance", "list", "field /?", "--fields", "id,project(id)", "--start", "7", "--page-size", "20"], method: "GET", path: "/api/admin/customFieldSettings/customFields/field%20%2F%3F/instances", query: [["fields", "id,project(id)"], ["$skip", "7"], ["$top", "20"]], response: [], result: emptyPage });
});

test("M03 required identities and template preflight fail before HTTP with known local state", async t => {
  const f = await configuredFixture(t, { permissions: ["Update"] });
  let calls = 0;
  server.use(http.all("*", () => { calls++; return HttpResponse.json({}); }));
  for (const argv of [
    ["agile", "create", "--body", '{"name":"Synthetic"}'],
    ["agile", "create", "--body", '{"name":"Synthetic","projects":[{}]}'],
    ["bundle", "enum", "value", "create", "bundle", "--body", "{}"],
    ["tags", "create", "--body", "{}"],
    ["project", "field", "create", "project", "--body", '{"field":{"id":"prototype"}}'],
  ]) await assert.rejects(f.cli.execute(argv), (error: Error) => { assert.doesNotMatch(error.message, /outcome is unknown/i); return true; });
  assert.equal(calls, 0);
  await assert.rejects(createAgile({ baseUrl: "https://youtrack.example.test", token: "synthetic-token", fetch: (async () => { calls++; return Response.json({}); }) as typeof fetch },
    { name: "Synthetic", projects: [{ id: "p" }] }, { template: false } as never), (error: Error) => {
      assert.match(error.message, /template.*text/i); assert.doesNotMatch(error.message, /unknown/i); return true;
    });
  assert.equal(calls, 0);
});

test("M03 field instances retain raw offset rows, zero-size uncertainty and preflight overflow", async t => {
  const f = await configuredFixture(t, { permissions: ["ReadOnly"] });
  const argv = ["field", "instance", "list", "field"];
  let calls = 0;
  server.use(http.get("*", ({ request }) => {
    calls++; const q = new URL(request.url).searchParams;
    return HttpResponse.json(q.get("$top") === "0" ? [] : [{ id: "same", project: null }, { id: "same", project: null }]);
  }));
  assert.deepEqual(await f.cli.execute([...argv, "--page-size", "2", "--start", "3"]), { count: 2, items: [{ id: "same", project: null }, { id: "same", project: null }], hasMore: null, nextStart: 5 });
  assert.deepEqual(await f.cli.execute([...argv, "--page-size", "0"]), { count: 0, items: [], hasMore: null, nextStart: null });
  const before = calls;
  await assert.rejects(f.cli.execute([...argv, "--page-size", "1", "--start", String(Number.MAX_SAFE_INTEGER)]));
  assert.equal(calls, before);
});

test("M03 human native flags and dates stay readable with empty mutation replies", async t => {
  const f = await configuredFixture(t, { permissions: ["Update"] });
  server.use(http.post("*", () => HttpResponse.json({ id: "synthetic-version", name: "Synthetic", released: false, archived: false, releaseDate: 0, startDate: null, $type: "VersionBundleElement" })));
  const shown = await f.run(f.cli, ["bundle", "version", "value", "update", "bundle", "value", "--body", '{"released":false}']);
  assert.equal(shown.exitCode, 0, shown.stderr);
  assert.match(shown.stdout, /Released.*no/i);
  assert.match(shown.stdout, /1970/);
  assert.doesNotMatch(shown.stdout, /\$type|VersionBundleElement/);
  server.use(http.post("*", () => new HttpResponse(null, { status: 204 })));
  for (const argv of [["agile", "update", "board", "--body", "{}"], ["field", "defaults", "update", "field", "--body", "{}"], ["project", "field", "update", "project", "field", "--body", "{}"], ["tags", "update", "tag", "--body", "{}"]]) {
    const r = await f.run(f.cli, argv); assert.equal(r.exitCode, 0, r.stderr); assert.ok(r.stdout.trim());
  }
});

test("M03 empty create confirmations retain the selected object identity", async t => {
  const f = await configuredFixture(t, { permissions: ["Update"] });
  server.use(http.post("*", () => new HttpResponse(null, { status: 204 })));
  const rows = [
    { name: "board", argv: ["agile", "create", "--body", '{"name":"Selected board","projects":[{"id":"project"}]}'], expected: /Selected board/ },
    ...["enum", "state", "version"].map(kind => ({ name: kind, argv: ["bundle", kind, "value", "create", "bundle", "--body", JSON.stringify({ name: `Selected ${kind}` })], expected: new RegExp(`Selected ${kind}`) })),
    { name: "tag", argv: ["tags", "create", "--body", '{"name":"Selected tag"}'], expected: /Selected tag/ },
    { name: "field", argv: ["project", "field", "create", "Selected-project", "--body", '{"field":{"id":"Selected-prototype"},"$type":"EnumProjectCustomField"}'], expected: /Selected-prototype.*Selected-project|Selected-project.*Selected-prototype/ },
  ];
  for (const row of rows) await t.test(row.name, async () => {
    server.use(http.post("*", () => new HttpResponse(null, { status: 204 })));
    const shown = await f.run(f.cli, row.argv); assert.equal(shown.exitCode, 0, shown.stderr); assert.match(shown.stdout, row.expected);
    assert.equal(await f.json(f.cli, row.argv), null);
    assert.deepEqual((await f.rpc(f.cli, [row.argv]) as { result: unknown }[])[0]?.result, null);
  });
});


test("M03 empty create identities redact credentials without changing the submitted body", async t => {
  const token = "synthetic-token";
  const f = await configuredFixture(t, { permissions: ["Update"], token });
  for (const name of [token, "https://files.example.test/download?signature=synthetic-signature"]) {
    server.use(http.post("*", async ({ request }) => {
      const body = await request.json() as { name?: string; field?: { id: string } };
      assert.equal(body.name ?? body.field?.id, name);
      return new HttpResponse(null, { status: 204 });
    }));
    for (const argv of [
      ["agile", "create", "--body", JSON.stringify({ name, projects: [{ id: "project" }] })],
      ["bundle", "enum", "value", "create", "bundle", "--body", JSON.stringify({ name })],
      ["tags", "create", "--body", JSON.stringify({ name })],
      ["project", "field", "create", token, "--body", JSON.stringify({ field: { id: name }, $type: "EnumProjectCustomField" })],
    ]) {
      const shown = await f.run(f.cli, argv);
      assert.equal(shown.exitCode, 0, shown.stderr);
      assert.doesNotMatch(shown.stdout + shown.stderr, /synthetic-token|synthetic-signature/);
      assert.match(shown.stdout, /redacted/);
    }
  }
});
