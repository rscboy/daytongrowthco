import {test} from 'node:test';
import assert from 'node:assert/strict';
const base='http://127.0.0.1:3099';
class Client {
 cookie='';
 async call(path,body,method=body?'POST':'GET',origin=base){
  const r=await fetch(base+'/api/caruso-recipe-book'+path,{method,headers:{Origin:origin,...(this.cookie?{Cookie:this.cookie}:{}),...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
  for(const set of r.headers.getSetCookie())this.cookie=set.split(';')[0];
  return {status:r.status,...await r.json()};
 }
}
test('complete invitation, permissions, review, save, history, trash, restore, duplicate, conflict and revocation HTTP workflow',async()=>{
 const admin=new Client(),person=new Client(),outsider=new Client();
 assert.equal((await outsider.call('/manage')).actor,null);
 assert.equal((await outsider.call('/manage',{mode:'prepare',draft:{action:'delete',query:'pasta'}})).status,401);
 assert.equal((await admin.call('/session',{password:'wrong'})).status,401);
 assert.equal((await admin.call('/session',{password:'local-editor-test'},'POST','https://attacker.invalid')).status,403);
 assert.equal((await admin.call('/session',{password:'local-editor-test'})).status,200);
 const initial=await admin.call('/manage');assert.equal(initial.records.length,35);assert.ok(!initial.records.some(r=>r.recipe.id==='gigi-hadid-pasta'));assert.ok(initial.records.some(r=>r.recipe.id==='autumns-vodka-pasta'));
 const invite=await admin.call('/invite',{owner:{id:'integration-person',name:'Integration Person',initials:'IP'},role:'contributor'});assert.equal(invite.status,200);
 const token=new URLSearchParams(new URL(invite.url).hash.slice(1)).get('invite');
 assert.equal((await person.call('/session',{invitation:token+'x'})).status,401);
 assert.equal((await person.call('/session',{invitation:token})).status,200);
 assert.equal((await person.call('/invite',{owner:{id:'other',name:'Other',initials:'O'},role:'editor'})).status,403);
 const recipe={...initial.records[0].recipe,id:'integration-recipe',owner:'integration-person',title:'Integration recipe',subtitle:'Test version',ingredients:[{category:'Test',items:['1 test ingredient']}],steps:[{title:'Test',text:'A test-only instruction.'}]};
 let draft={action:'add',owner:{id:'integration-person',name:'Integration Person',initials:'IP'},recipe};
 let p=await person.call('/manage',{mode:'prepare',draft});assert.equal(p.status,200);assert.equal(p.before,null);
 assert.equal((await person.call('/manage')).records.length,35,'preparing must not save');
 assert.equal((await person.call('/manage',{mode:'commit',draft:{...p.draft,recipe:{...recipe,title:'Tampered'}},ticket:p.ticket})).status,409);
 const commit=await person.call('/manage',{mode:'commit',draft:p.draft,ticket:p.ticket});assert.equal(commit.status,200);
 const repeated=await person.call('/manage',{mode:'commit',draft:p.draft,ticket:p.ticket});assert.equal(repeated.replayed,true);
 let current=await person.call('/manage');assert.equal(current.records.length,36);assert.equal(current.history.length,1);
 for(const action of ['edit','delete','restore','move'])assert.equal((await person.call('/manage',{mode:'prepare',draft:{action,recipeId:initial.records[0].recipe.id,changes:{title:'Unauthorized'},owner:{id:'integration-person',name:'Integration Person',initials:'IP'}}})).status,403);
 const stale=await person.call('/manage',{mode:'prepare',draft:{action:'delete',recipeId:recipe.id}});
 const edit=await person.call('/manage',{mode:'prepare',draft:{action:'edit',recipeId:recipe.id,expectedRevision:1,changes:{title:'Renamed successfully'}}});assert.equal(edit.status,200);
 assert.equal((await person.call('/manage',{mode:'commit',draft:edit.draft,ticket:edit.ticket})).status,200);
 assert.equal((await person.call('/manage',{mode:'commit',draft:stale.draft,ticket:stale.ticket})).status,409);
 assert.equal((await person.call('/manage',{mode:'prepare',draft:{action:'edit',recipeId:recipe.id,expectedRevision:1,changes:{note:'Stale form'}}})).status,409);
 const renamed=(await person.call('/manage')).records.find(r=>r.recipe.id===recipe.id);assert.deepEqual(renamed.recipe.ingredients,recipe.ingredients);assert.equal(renamed.recipe.note,recipe.note);
 const del=await person.call('/manage',{mode:'prepare',draft:{action:'delete',recipeId:recipe.id}});assert.equal((await person.call('/manage',{mode:'commit',draft:del.draft,ticket:del.ticket})).status,200);
 assert.ok((await person.call('/manage')).records.find(r=>r.recipe.id===recipe.id).deletedAt);
 const restore=await person.call('/manage',{mode:'prepare',draft:{action:'restore',recipeId:recipe.id}});assert.equal((await person.call('/manage',{mode:'commit',draft:restore.draft,ticket:restore.ticket})).status,200);
 const restored=(await person.call('/manage')).records.find(r=>r.recipe.id===recipe.id);assert.equal(restored.deletedAt,null);assert.deepEqual(restored.recipe,renamed.recipe);
 const duplicate=await person.call('/manage',{mode:'prepare',draft:{action:'variation',recipeId:recipe.id,recipe:{id:'integration-variation'}}});assert.equal(duplicate.status,200);assert.ok(duplicate.duplicates.length);
 assert.equal((await person.call('/manage',{mode:'commit',draft:duplicate.draft,ticket:duplicate.ticket})).status,409);
 const separate=await person.call('/manage',{mode:'prepare',draft:{...duplicate.draft,allowDuplicate:true}});assert.equal((await person.call('/manage',{mode:'commit',draft:separate.draft,ticket:separate.ticket})).status,200);
 const final=await admin.call('/manage');assert.deepEqual(final.records.slice(0,35),initial.records);assert.equal(final.records.length,37);
 assert.equal((await admin.call('/invite',{id:invite.id},'DELETE')).status,200);
 assert.equal((await person.call('/manage')).actor,null);assert.equal((await person.call('/session',{invitation:token})).status,401);
 console.log('Verified: 35 existing recipes preserved; invited contributor add/edit/delete/restore/variation; duplicate approval; stale/tampered review rejection; idempotent retry; invitation revocation.');
});
