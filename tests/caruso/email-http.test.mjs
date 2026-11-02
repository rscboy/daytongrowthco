import {test} from 'node:test';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';
const origin='http://127.0.0.1:3099';
test('invitation email, stable retries, partial failure, privacy, and revocation',async()=>{
 let cookie='';async function api(path,body,method=body?'POST':'GET'){const r=await fetch(origin+'/api/caruso-recipe-book'+path,{method,headers:{Origin:origin,Cookie:cookie,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});for(const c of r.headers.getSetCookie())cookie=c.split(';')[0];return {status:r.status,...await r.json()};}
 await api('/session',{password:'local-editor-test'});assert.equal((await api('/invite')).emailReady,true);
 const before=await api('/manage');
 const request={name:'Email Person',email:'person@example.test',owner:{id:'email-person',name:'Email Person',initials:'EP'},role:'contributor',requestId:randomUUID(),createdAt:new Date().toISOString()};
 const first=await api('/invite',request);assert.equal(first.status,200);assert.equal(first.emailStatus,'sent');
 const again=await api('/invite',request);assert.equal(again.url,first.url);assert.equal(again.id,first.id);assert.equal(again.emailStatus,'sent');
 const changed=await api('/invite',{...request,email:'different@example.test'});assert.equal(changed.status,409);
 const retry={...request,email:'retry@example.test',requestId:randomUUID()};
 const failed=await api('/invite',retry);assert.equal(failed.status,200);assert.equal(failed.emailStatus,'unconfirmed');assert.ok(failed.url.includes('#invite='));
 const success=await api('/invite',retry);assert.equal(success.id,failed.id);assert.equal(success.url,failed.url);assert.equal(success.emailStatus,'sent');
 const invalid=await api('/invite',{...request,email:'bad\r\nBcc: other@example.test',requestId:randomUUID()});assert.equal(invalid.status,400);
 const after=await api('/manage');assert.deepEqual(after.records,before.records);assert.equal(after.invitations.filter(i=>i.id===first.id).length,1);assert.equal(JSON.stringify(after).includes('person@example.test'),false);
 assert.equal((await api('/invite',{id:first.id},'DELETE')).status,200);assert.equal((await api('/invite',request)).status,409);
 console.log('Email sending and retry behavior passed without contacting a real email provider.');
});
