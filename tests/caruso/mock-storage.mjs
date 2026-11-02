// Isolated integration-test transport. Loaded explicitly by NODE_OPTIONS only;
// application code has no test endpoint, bypass, or production fixture fallback.
import fs from 'node:fs';
import crypto from 'node:crypto';
const original=globalThis.fetch;
const additions=JSON.parse(fs.readFileSync(process.env.CARUSO_TEST_FIXTURE || new URL('./fixtures/live-additions.json',import.meta.url),'utf8'));
const key='data/caruso-recipe-additions.json';
let cursor=0,head='test-initial-head';const commits=new Map([[head,{files:{[key]:JSON.stringify(additions)},parent:null}]]);const trees=new Map();const invites=new Map();
const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});
const id=()=>crypto.createHash('sha1').update(String(++cursor)).digest('hex');
globalThis.fetch=async(input,init={})=>{
 const url=typeof input==='string'?input:input instanceof URL?input.href:input.url;
 const u=new URL(url);const method=init.method||'GET';
 const body=typeof init.body==='string'?JSON.parse(init.body):{};
 if(u.hostname==='api.github.com'&&u.pathname.startsWith('/repos/recipe-test/book/')){
  const p=decodeURIComponent(u.pathname.slice('/repos/recipe-test/book'.length));
  if(p==='/git/ref/heads/recipe-workflow-test')return reply({object:{sha:head}});
  if(p.startsWith('/contents/')){
   const path=p.slice('/contents/'.length);const commit=commits.get(u.searchParams.get('ref')||head);const value=commit?.files[path];
   if(method==='GET')return value===undefined?reply({message:'Not found'},404):reply({encoding:'base64',content:Buffer.from(value).toString('base64')});
   if(method==='PUT'){const sha=id();commits.set(sha,{files:{...commits.get(head).files,[path]:Buffer.from(body.content,'base64')},parent:head});head=sha;return reply({commit:{sha}},201);}
  }
  if(p.startsWith('/commits')){const path=u.searchParams.get('path');return reply(commits.get(head).files[path]?[{sha:head}]:[]);}
  if(p.startsWith('/git/commits/')&&method==='GET'){const sha=p.split('/').at(-1);return commits.has(sha)?reply({tree:{sha},parents:[]}):reply({},404);}
  if(p==='/git/trees'&&method==='POST'){const sha=id();const base=commits.get(body.base_tree)?.files||trees.get(body.base_tree);const files={...base};for(const t of body.tree)files[t.path]=t.content;trees.set(sha,files);return reply({sha},201);}
  if(p==='/git/commits'&&method==='POST'){const sha=id();commits.set(sha,{files:trees.get(body.tree),parent:body.parents[0]});return reply({sha},201);}
  if(p==='/git/refs/heads/recipe-workflow-test'&&method==='PATCH'){if(commits.get(body.sha)?.parent!==head)return reply({message:'not fast forward'},422);head=body.sha;return reply({object:{sha:head}});}
  return reply({message:'Unexpected test storage request '+p},500);
 }
 if(u.hostname==='recipe-test-storage.invalid'){
  const k=decodeURIComponent(u.pathname.split('/').at(-1));if(method==='GET')return invites.has(k)?reply({value:invites.get(k)}):reply({},404);
  if(method==='PUT'){invites.set(k,body.value);return reply({value:body.value});}
 }
 return original(input,init);
};
