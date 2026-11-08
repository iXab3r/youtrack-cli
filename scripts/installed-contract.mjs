// Executes from the installed product directory, resolving only installed package exports.
import test from "node:test";
import assert from "node:assert/strict";
import { createCliFixture } from "@eyeauras/cli-factory/testing";
import { createYouTrackCli, listIssues, getIssueActivitiesPage } from "@eyeauras/youtrack-cli";
test("installed offset budgets, cursors, profiles and cancellation retain 0.7 behavior", async t => {
  const f = await createCliFixture(t, {applicationId:"youtrack-cli",profiles:["default","other"].map(name=>({name,
    values:{url:`https://${name}.example.test/context/`},secrets:{token:`synthetic-${name}`},
  }))});
  const calls=[];
  f.runtime.fetch=async (input,init)=>{
    const url=new URL(input);assert.equal(url.pathname,"/context/api/issues");
    const profile=url.hostname.split(".")[0];assert.equal(new Headers(init.headers).get("authorization"),`Bearer synthetic-${profile}`);
    const skip=Number(url.searchParams.get("$skip"));const top=Number(url.searchParams.get("$top"));calls.push({skip,top});
    return Response.json(top===0||skip>=2?[]:[{id:String(skip),idReadable:`DEMO-${skip+1}`,summary:"Synthetic issue"}]);
  };
  const app=f.createApplication(createYouTrackCli);
  const argv=["issues","list","--page-size","1"];
  const page=await f.json(app,argv);assert.equal(page.count,1);assert.equal(page.hasMore,null);assert.equal(page.nextStart,1);
  const human=await f.run(app,argv);assert.equal(human.exitCode,0);assert.match(human.stdout,/More results/);
  const frames=await f.rpc(app,[argv,[...argv,"--profile","other"]]);assert.deepEqual(frames[0].result,frames[1].result);
  calls.length=0;
  const all=await f.json(app,[...argv,"--all","--max-results","2"]);assert.equal(all.count,2);assert.equal(all.hasMore,false);assert.deepEqual(calls.map(x=>x.skip),[0,1,2]);
  const overflow=await f.run(app,[...argv,"--all","--max-results","1","--json"]);assert.equal(overflow.exitCode,1);assert.equal(overflow.stdout,"");
  const connection={baseUrl:"https://cursor.example.test",token:"synthetic-cursor",fetch:async(input)=>{
    const url=new URL(input);assert.equal(url.pathname,"/api/issues/DEMO-1/activitiesPage");assert.equal(url.searchParams.get("cursor"),"opaque/+==");assert.equal(url.searchParams.get("reverse"),"true");
    return Response.json({activities:[],beforeCursor:"before/+==",afterCursor:"after/+==",hasBefore:true,hasAfter:false,reverse:true});
  }};
  const cursor=await getIssueActivitiesPage(connection,"DEMO-1",{categories:"IssueCreatedCategory",cursor:"opaque/+==",reverse:true});assert.equal(cursor.beforeCursor,"before/+==");
  const controller=new AbortController();let requests=0;
  await assert.rejects(listIssues({baseUrl:"https://cancel.example.test",token:"synthetic-cancel",signal:controller.signal,fetch:async()=>{
    requests++;controller.abort(new Error("synthetic cancellation"));return Response.json([{id:"0"}]);
  }},{pageSize:1,maxResults:2}));assert.equal(requests,1);
});

test("installed M01 exports and declarations retain repeatable fields, reactions and admission", async t => {
  const exports = await import("@eyeauras/youtrack-cli");
  for (const name of ["listIssueActivities", "getIssueActivity", "getIssueTag", "deleteIssueWorkItem", "updateIssueAttachment", "deleteIssueAttachment", "listIssueReactions", "getIssueReaction", "addIssueReaction", "removeIssueReaction"]) {
    assert.equal(typeof exports[name], "function", name);
  }
  const f = await createCliFixture(t, { applicationId: "youtrack-cli", profiles: [{
    name: "default", values: { url: "https://installed.example.test/context" },
    permissions: ["ReadOnly", "Update"], secrets: { token: "synthetic-installed" },
  }] });
  let calls = 0;
  f.runtime.fetch = async (input, init) => {
    calls++;
    const url = new URL(input);
    assert.equal(new Headers(init.headers).get("authorization"), "Bearer synthetic-installed");
    if (url.pathname === "/context/api/issues") {
      assert.deepEqual(url.searchParams.getAll("customFields"), ["State", "Priority"]);
      return Response.json([]);
    }
    assert.equal(url.pathname, "/context/api/issues/DEMO-1/comments/comment/reactions");
    assert.equal(init.method, "POST");
    assert.deepEqual(JSON.parse(init.body), { reaction: "thanks" });
    return Response.json({ id: "synthetic-reaction", reaction: "thanks" });
  };
  const app = f.createApplication(createYouTrackCli);
  const page = await f.json(app, ["issues", "list", "--custom-field", "State", "--custom-field", "Priority"]);
  assert.deepEqual(page, { count: 0, items: [], hasMore: false, nextStart: null });
  const add = ["issues", "comments", "reaction", "add", "DEMO-1", "comment", "--body", '{"reaction":"thanks"}'];
  assert.equal((await f.json(app, add)).reaction, "thanks");
  await app.execute(["permissions", "revoke", "Update"]);
  await assert.rejects(app.execute(add), { code: "permission.denied" });
  assert.equal(calls, 2);
});

test("installed M02 exports, command controls and global-history filters survive packaging", async t => {
  const exports = await import("@eyeauras/youtrack-cli");
  for (const name of ["createSavedQuery", "updateSavedQuery", "getIssueProject", "setIssueProject", "createVcsChange", "updateVcsChange", "deleteVcsChange", "listActivities", "getActivity", "listArticleTags", "getArticleTag", "addArticleTag", "removeArticleTag", "updateArticleAttachment", "deleteArticleAttachment", "listArticleReactions", "getArticleReaction", "addArticleReaction", "removeArticleReaction"]) assert.equal(typeof exports[name], "function", name);
  const f = await createCliFixture(t, { applicationId: "youtrack-cli", profiles: [{ name: "default", values: { url: "https://installed.example.test/context" }, permissions: ["ReadOnly", "Update"], secrets: { token: "synthetic-installed" } }] });
  let calls = 0;
  f.runtime.fetch = async (input, init) => {
    calls++; const url = new URL(input);
    assert.equal(new Headers(init.headers).get("authorization"), "Bearer synthetic-installed");
    if (url.pathname === "/context/api/commands") {
      assert.equal(url.searchParams.get("muteUpdateNotifications"), "false");
      assert.deepEqual(JSON.parse(init.body), { query: "State Fixed", issues: [{ idReadable: "DEMO-1" }], silent: false });
      return Response.json({ id: "synthetic-command" });
    }
    assert.equal(url.pathname, "/context/api/activities");
    assert.equal(url.searchParams.get("issueQuery"), "project: DEMO");
    return Response.json([]);
  };
  const app = f.createApplication(createYouTrackCli);
  await f.json(app, ["commands", "apply", "--query", "State Fixed", "--issues", "DEMO-1", "--silent", "false", "--mute-update-notifications", "false"]);
  const read = ["activities", "list", "--categories", "CommentsCategory", "--issue-query", "project: DEMO"];
  assert.equal((await f.rpc(app, [read]))[0].result.count, 0);
  await app.execute(["permissions", "revoke", "ReadOnly"]);
  await assert.rejects(app.execute(read), { code: "permission.denied" });
  assert.equal(calls, 2);
});

test("installed M03 exports and native board-template query survive packaging", async t => {
  const exports = await import("@eyeauras/youtrack-cli");
  for (const name of ["createAgile", "updateAgile", "createEnumValue", "updateEnumValue", "createVersionValue", "updateVersionValue", "createStateValue", "updateStateValue", "createTag", "updateTag", "getFieldDefaults", "updateFieldDefaults", "createProjectField", "updateProjectField", "listFieldInstances"]) assert.equal(typeof exports[name], "function", name);
  const f = await createCliFixture(t, { applicationId: "youtrack-cli", profiles: [{ name: "default", values: { url: "https://installed.example.test/context" }, permissions: ["ReadOnly", "Update"], secrets: { token: "synthetic-installed" } }] });
  let calls = 0;
  f.runtime.fetch = async (input, init) => {
    calls++; const u = new URL(input);
    assert.equal(u.pathname, "/context/api/agiles"); assert.equal(u.searchParams.get("template"), "scrum");
    assert.equal(new Headers(init.headers).get("authorization"), "Bearer synthetic-installed");
    assert.deepEqual(JSON.parse(init.body), { name: "Synthetic", projects: [{ id: "project" }] });
    return Response.json({ id: "synthetic-board" });
  };
  const app = f.createApplication(createYouTrackCli);
  const argv = ["agile", "create", "--body", '{"name":"Synthetic","projects":[{"id":"project"}]}', "--template", "scrum"];
  assert.equal((await f.json(app, argv)).id, "synthetic-board");
  await app.execute(["permissions", "revoke", "Update"]);
  await assert.rejects(app.execute(argv), { code: "permission.denied" }); assert.equal(calls, 1);
});

test("installed M04 access catalogs, exports and notification resource retain their native contracts", async t => {
  const sdk = await import("@eyeauras/youtrack-cli");
  for (const name of [
    "addUserBundleGroup", "addUserBundleIndividual", "removeUserBundleGroup", "removeUserBundleIndividual",
    "createCustomField", "updateCustomField", "addProjectWorkItemType", "removeProjectWorkItemType", "updateProjectTimeSettings",
    "listRoleAssignments", "getRoleAssignment", "listPermissions", "listRoles", "getRole", "createRoleAssignment", "deleteRoleAssignment",
    "addProjectTeamUser", "removeProjectTeamUser", "addProjectTeamGroup", "removeProjectTeamGroup", "updateProjectTeam",
    "getUserNotifications", "updateUserNotifications",
  ]) assert.equal(typeof sdk[name], "function", name);
  const f = await createCliFixture(t, { applicationId: "youtrack-cli", profiles: [{ name: "default", values: { url: "https://installed.example.test/context" }, permissions: ["ReadOnly", "Update"], secrets: { token: "synthetic-installed" } }] });
  const body = { holder: { id: "holder", $type: "User" }, role: { id: "role" }, scope: { $type: "GlobalScope" } };
  let calls = 0;
  f.runtime.fetch = async (input, init) => {
    calls++; const u = new URL(input);
    assert.equal(new Headers(init.headers).get("authorization"), "Bearer synthetic-installed");
    if (u.pathname === "/context/api/roles") {
      assert.equal(u.searchParams.get("query"), "permission:synthetic-key"); return Response.json([]);
    }
    if (u.pathname === "/context/api/assignedRoles") {
      assert.equal(init.method, "POST"); assert.deepEqual(JSON.parse(init.body), body); return new Response(null, { status: 204 });
    }
    assert.equal(u.pathname, "/context/api/users/selected%20user/profiles/notifications");
    return Response.json({ emailNotificationsEnabled: false });
  };
  const app = f.createApplication(createYouTrackCli);
  assert.equal((await f.json(app, ["role", "list", "--query", "permission:synthetic-key"])).count, 0);
  assert.equal(await f.json(app, ["role-assignment", "create", "--body", JSON.stringify(body)]), null);
  const result = await sdk.getUserNotifications({ baseUrl: "https://installed.example.test/context", token: "synthetic-installed", fetch: f.runtime.fetch }, "selected user");
  assert.equal(result.emailNotificationsEnabled, false); assert.equal(calls, 3);
});

test("installed M05 exports preserve native profile, repeated fields and selected cleanup paths", async t => {
  const sdk = await import("@eyeauras/youtrack-cli");
  for (const name of [
    "getUserGeneralProfile", "updateUserGeneralProfile", "getUserTimeProfile", "updateUserTimeProfile", "listUserSavedQueries", "listUserTags",
    "addGroupMember", "deleteIssueComment", "deleteSavedQuery", "listTagIssues", "deleteTag", "deleteIssue",
    "addChildArticle", "updateChildArticle", "removeChildArticle", "deleteArticleComment",
  ]) assert.equal(typeof sdk[name], "function", name);
  const f = await createCliFixture(t, { applicationId: "youtrack-cli", profiles: [{ name: "default", values: { url: "https://installed.example.test/context" }, permissions: ["ReadOnly", "Update"], secrets: { token: "synthetic-installed" } }] });
  let calls = 0;
  f.runtime.fetch = async (input, init) => {
    calls++; const u = new URL(input);
    assert.equal(new Headers(init.headers).get("authorization"), "Bearer synthetic-installed");
    if (u.pathname === "/context/api/groups") { assert.equal(u.searchParams.get("query"), "  "); return Response.json([]); }
    if (u.pathname === "/context/api/tags/tag/issues") { assert.deepEqual(u.searchParams.getAll("customFields"), ["State", "Priority"]); return Response.json([]); }
    if (u.pathname === "/context/api/articles/parent/childArticles/child") {
      assert.equal(init.method, "POST"); assert.deepEqual(JSON.parse(init.body), { summary: null }); assert.equal(u.searchParams.get("muteUpdateNotifications"), "false"); return new Response(null, { status: 204 });
    }
    if (u.pathname === "/context/api/issues/selected-issue") { assert.equal(init.method, "DELETE"); assert.equal(u.search, ""); return new Response(null, { status: 204 }); }
    assert.equal(u.pathname, "/context/api/users/user/profiles/timetracking"); return Response.json({ periodFormat: { id: "FULL", $type: "PeriodFieldFormat" } });
  };
  const app = f.createApplication(createYouTrackCli);
  assert.equal((await f.json(app, ["group", "list", "--query", "  "])).count, 0);
  assert.equal((await f.json(app, ["tags", "issues", "list", "tag", "--custom-field", "State", "--custom-field", "Priority"])).count, 0);
  assert.equal(await f.json(app, ["article", "child", "update", "parent", "child", "--body", '{"summary":null}', "--mute-update-notifications", "false"]), null);
  assert.equal(await f.json(app, ["issues", "delete", "selected-issue"]), null);
  const time = await sdk.getUserTimeProfile({ baseUrl: "https://installed.example.test/context", token: "synthetic-installed", fetch: f.runtime.fetch }, "user");
  assert.equal(time.periodFormat.id, "FULL"); assert.equal(calls, 5);
});
