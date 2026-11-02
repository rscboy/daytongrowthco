import {test} from 'node:test';import assert from 'node:assert/strict';import crypto from 'node:crypto';
const base='http://127.0.0.1:3099';
class Client{cookie='';async call(path,body,method=body?'POST':'GET'){const r=await fetch(base+'/api/caruso-recipe-book'+path,{method,headers:{Origin:base,...(this.cookie?{Cookie:this.cookie}:{}),...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});for(const set of r.headers.getSetCookie())this.cookie=set.split(';')[0];return {status:r.status,...await r.json()};}}
test('invitation -> immediate password -> sign out -> email sign-in -> password change -> revoke',async()=>{
 const admin=new Client(),person=new Client(),returning=new Client(),outsider=new Client();
 assert.equal((await outsider.call('/account',{action:'register',email:'account@example.test',password:'a secure testing passphrase'})).status,401);
 await admin.call('/session',{password:'local-editor-test'});const initial=await admin.call('/manage');
 const invitation=await admin.call('/invite',{name:'Account Person',email:'account@example.test',owner:{id:'account-person',name:'Account Person',initials:'AP'},role:'contributor',requestId:crypto.randomUUID(),createdAt:new Date().toISOString()});assert.equal(invitation.status,200);
 const token=new URLSearchParams(new URL(invitation.url).hash.slice(1)).get('invite');await person.call('/session',{invitation:token});
 const setup=await person.call('/account');assert.equal(setup.email,'account@example.test');assert.equal(setup.hasPassword,false);
 assert.equal((await person.call('/account',{action:'register',email:setup.email,password:'short'})).status,400);
 assert.equal((await person.call('/account',{action:'register',email:'someone-else@example.test',password:'a secure testing passphrase'})).status,403);
 const password='a secure testing passphrase';assert.equal((await person.call('/account',{action:'register',email:setup.email,password})).status,200);assert.equal((await person.call('/account')).hasPassword,true);const afterSetup=await person.call('?live=1&after-account-setup=1');assert.equal(afterSetup.status,200,'reader remains available when the account service returns legacy JSON-encoded grants');assert.equal(afterSetup.entries.length,initial.records.filter(r=>!r.deletedAt).length);
 await person.call('/session',undefined,'DELETE');assert.equal((await person.call('/manage')).actor,null);
 assert.equal((await returning.call('/session',{email:setup.email,password:'wrong'})).status,401);
 assert.equal((await returning.call('/session',{email:setup.email.toUpperCase(),password})).status,200);
 const live=await returning.call('/manage');assert.equal(live.actor.role,'contributor');assert.equal(live.actor.ownerId,'account-person');assert.ok(live.records.every(r=>!r.canManage));
 const reader=await returning.call('?live=1');assert.equal(reader.status,200);assert.equal(reader.entries.length,initial.records.filter(r=>!r.deletedAt).length);
 const another=new Client();await another.call('/session',{email:setup.email,password});
 assert.equal((await returning.call('/account',{action:'password',currentPassword:'wrong',password:'my replacement test passphrase'})).status,401);
 assert.equal((await returning.call('/account',{action:'password',currentPassword:password,password:'my replacement test passphrase'})).status,200);
 assert.equal((await another.call('/manage')).actor,null,'password change invalidates other signed sessions');
 const after=await admin.call('/manage');assert.deepEqual(after.records,initial.records,'password setup does not change recipes');assert.equal(JSON.stringify(after).includes(password),false);assert.equal(JSON.stringify(after).includes(setup.email),false);
 await admin.call('/invite',{id:invitation.id},'DELETE');assert.equal((await returning.call('/manage')).actor,null);
 const revoked=new Client();assert.equal((await revoked.call('/session',{email:setup.email,password:'my replacement test passphrase'})).status,403);assert.equal((await revoked.call('/session',{invitation:token})).status,401);
});
