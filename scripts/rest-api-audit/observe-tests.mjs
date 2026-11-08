import {registerHooks} from 'node:module';
import {appendFileSync} from 'node:fs';
const root=process.cwd();
Error.stackTraceLimit=35;
globalThis.__auditRequest=(path,method,stack)=>{
 const frames=stack.split('\n').filter(s=>s.includes(root+'/src/')||s.includes(root+'/tests/')).map(s=>s.replaceAll(root+'/',''));
 appendFileSync((process.env.YOUTRACK_AUDIT_CAPTURE ?? root+'/.workspace/workstreams/rest-api-coverage-audit')+'/test-requests.ndjson',JSON.stringify({method,path,frames,testFile:process.argv[1]?.replace(root+'/dist/','').replace(/\.js$/,'.ts')})+'\n');
};
registerHooks({load(url,context,next){const r=next(url,context);if(url===`file://${root}/dist/src/client.js`){const token='async function request(connection, path, query, responseName = "JSON", options = {}) {';if(!String(r.source).includes(token))throw new Error('Transport signature changed');return {...r,source:String(r.source).replace(token,token+' globalThis.__auditRequest(path,options.method ?? "GET",new Error().stack);')};}return r;}});
