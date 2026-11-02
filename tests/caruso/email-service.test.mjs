import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import {fileURLToPath,pathToFileURL} from 'node:url';import ts from 'typescript';
const dir=await fs.mkdtemp(path.join(os.tmpdir(),'recipe-email-tests-'));
const source=new URL('../../daytongrowthco-crm/',import.meta.url);
await fs.symlink(fileURLToPath(new URL('node_modules/',source)),path.join(dir,'node_modules'));
const compile=s=>ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
await fs.writeFile(path.join(dir,'template.mjs'),compile(await fs.readFile(new URL('lib/recipe-invitation-email.ts',source),'utf8')));
let route=compile(await fs.readFile(new URL('app/api/internal/recipe-invitation/route.ts',source),'utf8')).replace("'../../../../lib/recipe-invitation-email'","'./template.mjs'").replace("'../../../../lib/email-deliveries'","'./tracking.mjs'");
await fs.writeFile(path.join(dir,'route.mjs'),route);await fs.writeFile(path.join(dir,'tracking.mjs'),'export async function recordEmailAccepted(){}');
const {POST,GET}=await import(pathToFileURL(path.join(dir,'route.mjs')));const {buildRecipeInvitationEmail}=await import(pathToFileURL(path.join(dir,'template.mjs')));
const input={id:'a'.repeat(32),email:'person@example.test',name:'Alex <script>',ownerName:'Alex',role:'contributor',expires:Date.now()+86400000,url:'https://www.daytongrowth.co/recipe-book/manage.html#invite='+'a'.repeat(32)+'.'+'b'.repeat(43)};
const request=(body,auth='Bearer test-secret')=>new Request('https://test.invalid/api/internal/recipe-invitation',{method:'POST',headers:{Authorization:auth,'Content-Type':'application/json'},body:JSON.stringify(body)});
test('email template contains all onboarding steps and escapes recipient content',()=>{const e=buildRecipeInvitationEmail(input);assert.ok(e.html.includes('&lt;script&gt;'));assert.ok(!e.html.includes('<script>'));for(const text of ['Accept invitation','https://github.com/rscboy/caruso-recipe-book','Never ask for my password','Trash'])assert.ok(e.html.includes(text));assert.ok(e.text.includes(input.url));assert.ok(e.text.includes('expires'));assert.ok(buildRecipeInvitationEmail({...input,role:'editor'}).text.includes('every family recipe'));});
test('authenticated mail service validates requests and confirms provider acceptance',async()=>{
 process.env.FUNNEL_CRM_API_SECRET='test-secret';process.env.RESEND_API_KEY='test-only';const original=globalThis.fetch;let calls=[];
 try{
  assert.equal((await POST(request(input,'Bearer bad'))).status,401);assert.equal((await POST(request(input,'Bearer ééééééééééé'))).status,401);
  const ready=await GET(new Request('https://test.invalid',{headers:{Authorization:'Bearer test-secret'}}));assert.equal((await ready.json()).ready,true);
  for(const patch of [{url:'https://attacker.invalid/recipe-book/manage.html#invite=x'},{url:input.url.replace('https://','https://user:pass@')},{email:'bad\nBcc:test@example.com'},{expires:Date.now()-1},{url:input.url.replace('a'.repeat(32),'c'.repeat(32))}])assert.equal((await POST(request({...input,...patch}))).status,400);
  globalThis.fetch=async(url,init)=>{calls.push({url,init});return Response.json({id:'confirmed-email-id'});};
  const sent=await POST(request(input));assert.equal(sent.status,200);assert.equal((await sent.json()).messageId,'confirmed-email-id');assert.equal(calls.length,1);assert.equal(calls[0].init.headers['Idempotency-Key'],'caruso-recipe-invite/'+input.id);const body=JSON.parse(calls[0].init.body);assert.deepEqual(body.to,[input.email]);assert.ok(body.text.includes('Use the Caruso Recipe Book skill'));
  globalThis.fetch=async()=>Response.json({error:'failed'},{status:500});assert.equal((await POST(request(input))).status,502);
  globalThis.fetch=async()=>Response.json({});assert.equal((await POST(request(input))).status,502);
 }finally{globalThis.fetch=original;await fs.rm(dir,{recursive:true,force:true});}
});
