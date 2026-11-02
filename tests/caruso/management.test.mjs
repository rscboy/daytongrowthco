import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadRecipeModules} from './load-modules.mjs';
const {management:{applyChange,prepareChange,parseStore,validateRecipe,validateDraft,findDuplicates}}=await loadRecipeModules();
const seed=JSON.parse(fs.readFileSync(new URL('../../lib/caruso-recipe-seed.json',import.meta.url),'utf8'));
const editor={id:'editor-1',name:'Sam',role:'editor',ownerId:'sammy'};
const contributor={id:'new-person',name:'New Person',role:'contributor',ownerId:'new-person'};
const at='2026-11-02T15:00:00.000Z';
const recipe={...seed.records[0].recipe,id:'new-recipe',owner:'new-person',title:'Test recipe',subtitle:'New version'};
const owner={id:'new-person',name:'New Person',initials:'NP'};
const fresh=()=>structuredClone(seed);
const addition=()=>({action:'add',owner,recipe,allowDuplicate:true});
const add=(store=fresh())=>applyChange(store,contributor,addition(),0,'add-1',at).store;
test('all original recipes survive import with unique IDs and full instructions',()=>{
 const s=parseStore(fresh());assert.equal(s.records.length,30);assert.equal(new Set(s.records.map(r=>r.recipe.id)).size,30);
 for(const r of s.records){assert.deepEqual(validateRecipe(r.recipe),r.recipe);assert.ok(r.recipe.steps.length);}
});
test('a fresh contributor adds into their assigned collection',()=>{
 const s=add();assert.equal(s.records.length,31);assert.equal(s.history.length,1);assert.equal(s.profiles.at(-1).id,owner.id);
 assert.deepEqual(s.records.slice(0,30),seed.records);
});
test('edits merge requested fields and preserve quantities, instructions, and notes',()=>{
 const s=add();const next=applyChange(s,contributor,{action:'edit',recipeId:recipe.id,changes:{title:'My renamed recipe'}},1,'rename',at).store;
 const changed=next.records.at(-1);assert.equal(changed.recipe.title,'My renamed recipe');assert.deepEqual(changed.recipe.ingredients,recipe.ingredients);assert.deepEqual(changed.recipe.steps,recipe.steps);assert.equal(changed.recipe.note,recipe.note);assert.equal(changed.revision,2);
 assert.equal(next.history.at(-1).before.recipe.title,recipe.title);
});
test('delete is recoverable and restoring preserves every recipe field',()=>{
 const s=add();const trashed=applyChange(s,contributor,{action:'delete',recipeId:recipe.id},1,'delete',at).store;
 assert.equal(trashed.records.at(-1).deletedAt,at);
 const restored=applyChange(trashed,contributor,{action:'restore',recipeId:recipe.id,allowDuplicate:true},2,'restore',at).store;
 assert.equal(restored.records.at(-1).deletedAt,null);assert.deepEqual(restored.records.at(-1).recipe,recipe);assert.equal(restored.history.length,3);
});
test('contributors cannot edit, delete, move, restore, or revert other collections',()=>{
 const s=fresh();const r=s.records[0];
 for(const action of ['edit','delete','move','restore','revert'])assert.throws(()=>prepareChange(s,contributor,{action,recipeId:r.recipe.id,changes:{title:'Overwrite'},owner},at),e=>e.status===403);
 assert.throws(()=>prepareChange(s,contributor,{...addition(),owner:{id:'sammy',name:'Sammy',initials:'S'}},at),e=>e.status===403);
});
test('contributors cannot move their own recipes into someone else’s collection',()=>{
 assert.throws(()=>prepareChange(add(),contributor,{action:'move',recipeId:recipe.id,owner:{id:'sammy',name:'Sammy',initials:'S'}},at),e=>e.status===403);
});
test('family editor can move recipes without altering recipe contents',()=>{
 const s=add();const next=applyChange(s,editor,{action:'move',recipeId:recipe.id,owner:{id:'autumn',name:'Autumn',initials:'Au'}},1,'move',at).store;
 assert.deepEqual(next.records.at(-1).recipe,{...recipe,owner:'autumn'});
});
test('a variation copies another collection’s recipe without changing its original',()=>{
 const s=fresh();const original=s.records[0];const result=applyChange(s,contributor,{action:'variation',recipeId:original.recipe.id,owner,recipe:{id:'my-variation',title:'My family version'},allowDuplicate:true},0,'variation',at);
 assert.deepEqual(result.store.records[0],original);const variation=result.store.records.at(-1).recipe;
 assert.equal(variation.owner,owner.id);assert.equal(variation.title,'My family version');assert.deepEqual(variation.steps,original.recipe.steps);assert.equal(variation.note,original.recipe.note);
});
test('identical ingredients flag renamed duplicates',()=>{
 const duplicates=findDuplicates(fresh(),recipe);assert.ok(duplicates.some(d=>d.id===seed.records[0].recipe.id));
 assert.throws(()=>applyChange(fresh(),contributor,{...addition(),allowDuplicate:false},0,'unapproved-duplicate',at),e=>e.status===409);
});
test('stale approvals cannot overwrite a newer edit',()=>{
 const s=add();const changed=applyChange(s,contributor,{action:'edit',recipeId:recipe.id,changes:{title:'New title'}},1,'edit-1',at).store;
 assert.throws(()=>applyChange(changed,contributor,{action:'delete',recipeId:recipe.id},1,'stale-delete',at),e=>e.status===409);
});
test('an edit form opened before another edit cannot prepare an overwrite',()=>{
 const s=add();const changed=applyChange(s,contributor,{action:'edit',recipeId:recipe.id,changes:{note:'A later note'}},1,'later',at).store;
 assert.throws(()=>prepareChange(changed,contributor,{action:'edit',recipeId:recipe.id,expectedRevision:1,changes:{title:'An old form'}},at),e=>e.status===409);
 assert.equal(changed.records.at(-1).recipe.note,'A later note');
});
test('repeating the same approved operation changes nothing twice',()=>{
 const first=applyChange(fresh(),contributor,addition(),0,'stable-id',at);
 const repeat=applyChange(first.store,contributor,addition(),0,'stable-id',at);
 assert.equal(repeat.replayed,true);assert.deepEqual(repeat.store,first.store);
 assert.throws(()=>applyChange(first.store,editor,addition(),0,'stable-id',at),e=>e.status===403);
});
test('undo add moves the newly added recipe to trash',()=>{
 const s=add();const p=prepareChange(s,contributor,{action:'undo'},at);assert.equal(p.draft.action,'delete');
 assert.ok(applyChange(s,contributor,p.draft,1,'undo-add',at).store.records.at(-1).deletedAt);
});
test('undo rename and undo deletion recover the previous version',()=>{
 const s=add();const renamed=applyChange(s,contributor,{action:'edit',recipeId:recipe.id,changes:{title:'Renamed'}},1,'rename',at).store;
 const undo=prepareChange(renamed,contributor,{action:'undo'},at);assert.equal(undo.after.recipe.title,recipe.title);
 const deleted=applyChange(s,contributor,{action:'delete',recipeId:recipe.id},1,'delete',at).store;
 const back=prepareChange(deleted,contributor,{action:'undo'},at);assert.equal(back.after.deletedAt,null);assert.deepEqual(back.after.recipe,recipe);
});
test('undo refuses to overwrite another person’s later edit',()=>{
 const s=add();const edited=applyChange(s,editor,{action:'edit',recipeId:recipe.id,changes:{title:'Editor update'}},1,'editor-update',at).store;
 assert.throws(()=>prepareChange(edited,contributor,{action:'undo'},at),e=>e.status===409);
});
test('a vague recipe name does not automatically mutate the first match',()=>{
 assert.throws(()=>prepareChange(fresh(),editor,{action:'delete',query:'chicken'},at),e=>e.status===404);
});
test('existing IDs, including trashed recipes, cannot be re-added',()=>{
 const s=add();const trashed=applyChange(s,contributor,{action:'delete',recipeId:recipe.id},1,'delete',at).store;
 assert.throws(()=>prepareChange(trashed,contributor,addition(),at),e=>e.status===409);
});
test('history recovery checks the target collection permissions',()=>{
 const s=add();const moved=applyChange(s,editor,{action:'move',recipeId:recipe.id,owner:{id:'autumn',name:'Autumn',initials:'Au'}},1,'move',at).store;
 assert.throws(()=>prepareChange(moved,contributor,{action:'revert',recipeId:recipe.id,historyId:'move'},at),e=>e.status===403);
});
test('malformed drafts and unsafe image URLs are rejected',()=>{
 for(const input of [null,[],{}, {action:'wipe'}, {action:'edit',changes:{owner:'sammy'}}, {action:'add',allowDuplicate:'yes'}, {action:'delete',recipeId:'../../settings'}, {action:'edit',image:{url:'javascript:alert(1)'}}])assert.throws(()=>validateDraft(input));
 for(const image of ['javascript:alert(1)','https://user:pass@example.com/img.png','/recipe-book/../../private','data:image/png;base64,AAAA'])assert.throws(()=>validateRecipe({...recipe,image}));
});
test('missing and invalid durable storage fails closed',()=>{
 for(const s of [null,{}, {version:1}, {...fresh(),records:[seed.records[0],seed.records[0]]}])assert.throws(()=>parseStore(s));
});
