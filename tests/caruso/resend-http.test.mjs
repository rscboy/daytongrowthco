import {test} from 'node:test';import assert from 'node:assert/strict';import crypto from 'node:crypto';
const base='http://127.0.0.1:3099';class Client{cookie='';async call(path,body,method=body?'POST':'GET'){const r=await fetch(base+'/api/caruso-recipe-book'+path,{method,headers:{Origin:base,...(this.cookie?{Cookie:this.cookie}:{}),...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});for(const s of r.headers.getSetCookie())this.cookie=s.split(';')[0];return {status:r.status,...await r.json()};}}
test('resend uses the existing grant, retries safely and refuses unauthorized or revoked sends',async()=>{
 const admin=new Client(),person=new Client(),outsider=new Client();await admin.call('/session',{password:'local-editor-test'});
 const initial=await admin.call('/manage');const invite=await admin.call('/invite',{name:'Resend Person',email:'resend@example.test',owner:{id:'resend-person',name:'Resend Person',initials:'RP'},role:'contributor',requestId:crypto.randomUUID(),createdAt:new Date().toISOString()});assert.equal(invite.emailStatus,'sent');
 const before=await admin.call('/manage');const body={action:'resend',id:invite.id,requestId:crypto.randomUUID(),createdAt:new Date().toISOString()};
 assert.equal((await outsider.call('/invite',body)).status,401);
 const sent=await admin.call('/invite',body);assert.equal(sent.status,200);assert.equal(sent.emailStatus,'sent');assert.equal(sent.email,'resend@example.test');assert.equal(sent.url,undefined);
 assert.equal((await admin.call('/invite',body)).emailStatus,'sent');assert.equal((await admin.call('/invite',{...body,requestId:'bad'})).status,400);
 const after=await admin.call('/manage');assert.deepEqual(after.invitations,before.invitations);assert.deepEqual(after.records,initial.records);
 const token=new URLSearchParams(new URL(invite.url).hash.slice(1)).get('invite');assert.equal((await person.call('/session',{invitation:token})).status,200,'the original link still works after resending');assert.equal((await person.call('/invite',body)).status,403);
 await admin.call('/invite',{id:invite.id},'DELETE');assert.equal((await admin.call('/invite',{...body,requestId:crypto.randomUUID()})).status,409);
 const retryInvite=await admin.call('/invite',{name:'Retry Person',email:'retry@example.test',owner:{id:'retry-person',name:'Retry Person',initials:'RP'},role:'contributor',requestId:crypto.randomUUID(),createdAt:new Date().toISOString()});const retry={action:'resend',id:retryInvite.id,requestId:crypto.randomUUID(),createdAt:new Date().toISOString()};assert.equal((await admin.call('/invite',retry)).status,502);assert.equal((await admin.call('/invite',retry)).emailStatus,'sent');assert.equal((await admin.call('/invite',retry)).emailStatus,'sent');
});
