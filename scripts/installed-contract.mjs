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
