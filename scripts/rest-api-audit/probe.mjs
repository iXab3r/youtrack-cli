import { registerHooks } from 'node:module';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { createCli } from '@eyeauras/cli-factory';
import { createCliFixture } from '@eyeauras/cli-factory/testing';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
const root=process.cwd();
const capture=resolve(process.argv[2] ?? '.workspace/workstreams/rest-api-coverage-audit');
Error.stackTraceLimit=35;
let requestFrames=[];
globalThis.__auditRequest=(path,method,stack)=>{requestFrames=stack.split('\n').filter(s=>s.includes(root+'/src/')).map(s=>s.replaceAll(root+'/',''));};
// Only expose the product's existing definition for traversal; no handler is changed.
registerHooks({load(url, context, next) {const result=next(url,context);if(url===new URL('./dist/src/cli.js',`file://${root}/`).href) {const s=String(result.source);assert(s.includes('return createCli({'));return {...result,source:s.replace('return createCli({','return ({')};}if(url===`file://${root}/dist/src/client.js`){const token='async function request(connection, path, query, responseName = "JSON", options = {}) {';assert(String(result.source).includes(token));return {...result,source:String(result.source).replace(token,token+' globalThis.__auditRequest(path,options.method ?? "GET",new Error().stack);')};}return result;}});
const {createYouTrackCli}=await import(`file://${root}/dist/src/cli.js`);
const def=createYouTrackCli();
const sourceFileHashes={};
for(const dir of ['src','tests','integration-tests'])for(const file of (await readdir(dir)).filter(file=>file.endsWith('.ts')).sort()){
 const path=dir+'/'+file;sourceFileHashes[path]=createHash('sha256').update(await readFile(path)).digest('hex');
}
for(const path of ['package.json','package-lock.json'])sourceFileHashes[path]=createHash('sha256').update(await readFile(path)).digest('hex');
await writeFile(resolve(capture,'probe-lock.json'),JSON.stringify({head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),sourceFileHashes},null,2)+'\n');
const leaves=[];
function walk(nodes,prefix=[]){for(const n of nodes){const full=[...prefix,n.name];if(n.children)walk(n.children,full);else if(n.run)leaves.push({n,syntax:full.join(' ')});}}
walk(def.commands);
const cleanup=[];const f=await createCliFixture({after:fn=>cleanup.push(fn)}, {applicationId:'youtrack-cli',profiles:[{name:'default',values:{url:'https://audit.example.test/context'},permissions:['ReadOnly','Update'],secrets:{token:'synthetic-audit-token'}}]});
const server=setupServer();server.listen({onUnhandledRequest:'error'});
const app=f.createApplication(runtime=>createCli({...def,runtime}));
let requests=[];
const facts=JSON.parse(await readFile(new URL('../../docs/rest-api-coverage/official-operations.json',import.meta.url),'utf8'));
const norm=s=>s.replace(/\{[^}]+\}/g,'{}');
const operations=facts.map(o=>({method:o.method,path:o.path,o}));
server.use(http.all('*',async({request})=>{
 const url=new URL(request.url);assert.equal(url.origin,'https://audit.example.test');assert(url.pathname.startsWith('/context/api/'));
 const path=url.pathname.slice('/context'.length);const op=operations.filter(x=>x.method===request.method && new RegExp('^'+x.path.replace(/[.*+?^$()|[\]\\]/g,'\\$&').replace(/\{[^}]+\}/g,'[^/]+')+'$').test(path)).sort((a,b)=>(a.path.match(/\{/g)||[]).length-(b.path.match(/\{/g)||[]).length)[0];
 assert(op,request.method+' '+path);
 requests.push({method:request.method,path,operation:op.method+' '+op.path,query:Object.fromEntries(url.searchParams),stack:requestFrames});
 const responseKind=op.o.responseKind;
 if(op.path.endsWith('/attachments')&&request.method==='POST')return HttpResponse.json([{id:'synthetic-result'}]);
 if(responseKind==='array')return HttpResponse.json([{id:'synthetic-result',login:'synthetic-user'}]);
 return HttpResponse.json({id:'synthetic-result',login:'synthetic-user',count:1,suggestions:[],activities:[],beforeCursor:'before',afterCursor:'after',hasBefore:false,hasAfter:false,reverse:false});
}));
await writeFile(resolve(f.root,'upload.txt'),'synthetic upload');
const results=[];
try{
 for(const {n,syntax} of leaves){
  const args=syntax.split(' ').map(t=>t.startsWith('<')?'audit-'+t.slice(1,-1).toLowerCase():t);
  if(/ (download|export) |issues batch /.test(syntax)){results.push({syntax,description:n.description,permission:n.permission,workflow:true,options:n.options?.map(o=>o.flags)});continue;}
  for(const direct of n.options?.some(o=>o.flags==='--direct')?[false,true]:[false]){
   const argv=[...args];
   for(const option of n.options||[]){if(!option.required)continue;
    const flag=option.flags.split(' ')[0];let value='synthetic';
    if(flag==='--body')value=JSON.stringify({project:{id:'synthetic-project'},projects:[{id:'synthetic-project'}],field:{id:'synthetic-field'},fieldType:{id:'enum[1]'},summary:'Synthetic audit',text:'Synthetic text',reaction:'thanks',name:'Synthetic sprint',query:'project: DEMO',version:'synthetic-version',state:1,id:'synthetic-target',$type:'SimpleIssueCustomField',value:'Synthetic',duration:{minutes:1}});
    if(flag==='--body' && syntax==='role-assignment create')value=JSON.stringify({role:{id:'synthetic-role'},holder:{id:'synthetic-holder',$type:'User'},scope:{$type:'ProjectScope',project:{id:'synthetic-project'}}});
    if(flag==='--file')value=resolve(f.root,'upload.txt');
    if(flag==='--query')value='synthetic query';if(flag==='--issues')value='DEMO-1';if(flag==='--categories')value='CommentsCategory';
    argv.push(flag,value);
   }
   if(direct)argv.push('--direct');
   const otherPermission=n.permission==='ReadOnly'?'Update':'ReadOnly';
   await app.execute(['permissions','revoke',otherPermission]);
   const surfaces={};let captured=[];
   for(const mode of ['execute','human','json','rpc']){
    requests=[];f.resetOutput();let error;
    try{
     if(mode==='execute')await app.execute(argv);
     if(mode==='human'||mode==='json'){const r=await f.run(app,[...argv,...(mode==='json'?['--json']:[])]);assert.equal(r.exitCode,0,r.stderr);if(mode==='json')JSON.parse(r.stdout);}
     if(mode==='rpc'){const r=await f.rpc(app,[argv]);assert(!r[0].error,JSON.stringify(r[0].error));}
    }catch(e){error=e.message;}
    surfaces[mode]={passed:!error,requests:requests.length,...(error?{error}:{})};
    if(mode==='execute')captured=requests;
    else if(!error)assert.deepEqual(requests.map(x=>[x.method,x.path,x.query]),captured.map(x=>[x.method,x.path,x.query]));
   }
   await app.execute(['permissions','revoke',n.permission]);requests=[];
   let denied=false;try{await app.execute(argv);}catch(e){denied=e.code==='permission.denied';}
   assert(denied,syntax+' admission');assert.equal(requests.length,0);await app.execute(['permissions','grant',n.permission]);await app.execute(['permissions','grant',otherPermission]);
   results.push({syntax,description:n.description,direct,permission:n.permission,options:n.options?.map(o=>o.flags)||[],requests:captured,surfaces,deniedBeforeHttp:denied});
  }
 }
}finally{server.close();for(const fn of cleanup.reverse())await fn();}
await writeFile(resolve(capture,'probe.json'),JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify({leaves:leaves.length,variants:results.length,operations:new Set(results.flatMap(x=>x.requests||[]).map(x=>norm(x.operation))).size,failed:results.filter(x=>x.surfaces&&Object.values(x.surfaces).some(v=>!v.passed)).map(x=>({syntax:x.syntax,surfaces:x.surfaces}))},null,2));
