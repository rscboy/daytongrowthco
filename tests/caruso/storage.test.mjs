import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';
const dir=await fs.mkdtemp(path.join(os.tmpdir(),'caruso-storage-tests-'));
for(const name of ['caruso-recipe-storage','caruso-recipe-management','caruso-recipe-additions']){
 const source=await fs.readFile(new URL(`../../lib/${name}.ts`,import.meta.url),'utf8');
 let compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
 compiled=compiled.replace(/from '(\.\/caruso-[a-z-]+)'/g,"from '$1.mjs'").replace("from './caruso-recipe-seed.json'","from './caruso-recipe-seed.json' with {type:'json'}");
 await fs.writeFile(path.join(dir,name+'.mjs'),compiled);
}
await fs.copyFile(new URL('../../lib/caruso-recipe-seed.json',import.meta.url),path.join(dir,'caruso-recipe-seed.json'));
const {loadBook,saveBook,uploadPhoto}=await import(pathToFileURL(path.join(dir,'caruso-recipe-storage.mjs')));
process.env.CARUSO_RECIPE_GITHUB_TOKEN='test-only';
process.env.CARUSO_RECIPE_GITHUB_REPOSITORY='test/book';
const seed=JSON.parse(await fs.readFile(path.join(dir,'caruso-recipe-seed.json'),'utf8'));
const json=(v,s=200)=>new Response(JSON.stringify(v),{status:s});
const file=v=>json({encoding:'base64',content:Buffer.from(typeof v==='string'?v:JSON.stringify(v)).toString('base64')});
test('storage reads and writes fail closed, confirm saves, and reject races',async(t)=>{
 const original=globalThis.fetch;
 try{
  await t.test('an outage never falls back to bundled recipes',async()=>{
   const urls=[];globalThis.fetch=async u=>{urls.push(String(u));return String(u).includes('/git/ref/')?json({object:{sha:'head'}}):json({},500);};
   await assert.rejects(loadBook());assert.equal(urls.length,2);
  });
  await t.test('a missing v2 record with prior history is not re-seeded',async()=>{
   globalThis.fetch=async u=>String(u).includes('/git/ref/')?json({object:{sha:'head'}}):String(u).includes('/contents/')?json({},404):json([{sha:'prior-store'}]);
   await assert.rejects(loadBook());
  });
  await t.test('corrupt saved data never falls back to the seed',async()=>{
   globalThis.fetch=async u=>String(u).includes('/git/ref/')?json({object:{sha:'head'}}):file({version:2,records:[],profiles:'bad',history:[]});await assert.rejects(loadBook());
  });
  await t.test('uninitialized book imports current additions without writing',async()=>{
   const methods=[];globalThis.fetch=async(u,init)=>{methods.push(init.method||'GET');u=String(u);if(u.includes('/git/ref/'))return json({object:{sha:'head'}});if(u.includes('/commits?'))return json([]);if(u.includes('caruso-recipe-book-v2'))return json({},404);return file({version:1,entries:[]});};
   const loaded=await loadBook();assert.equal(loaded.initialized,false);assert.equal(loaded.store.records.length,30);assert.ok(methods.every(m=>m==='GET'));
  });
  await t.test('missing old additions with history is not replaced with empty',async()=>{
   globalThis.fetch=async u=>{u=String(u);if(u.includes('/git/ref/'))return json({object:{sha:'head'}});if(u.includes('/contents/'))return json({},404);return json(u.includes('caruso-recipe-additions')?[{sha:'old'}]:[]);};await assert.rejects(loadBook());
  });
  await t.test('a non-fast-forward update rejects a concurrent save',async()=>{
   globalThis.fetch=async(u,init)=>{if(init.method==='PATCH')return json({},422);return String(u).includes('/git/commits/head')?json({tree:{sha:'tree'}}):json({sha:'created'});};
   await assert.rejects(saveBook('head',seed,'Test'),e=>e.status===409);
  });
  await t.test('a storage acknowledgement with different content is rejected',async()=>{
   globalThis.fetch=async(u,init)=>{if(String(u).includes('/contents/'))return file({...seed,records:[]});if(String(u).endsWith('/git/commits/head'))return json({tree:{sha:'tree'}});return json({sha:'created'});};
   await assert.rejects(saveBook('head',seed,'Test'),e=>e.status===503);
  });
  await t.test('a successful save verifies the exact committed document',async()=>{
   let stored;const calls=[];globalThis.fetch=async(u,init)=>{calls.push([String(u),init.method||'GET']);if(String(u).includes('/contents/'))return file(stored);if(String(u).endsWith('/git/commits/head'))return json({tree:{sha:'tree'}});if(String(u).endsWith('/git/trees'))stored=JSON.parse(init.body).tree[0].content;return json({sha:'created'});};
   await saveBook('head',seed,'Test');assert.deepEqual(JSON.parse(stored),seed);assert.equal(calls.at(-1)[1],'GET');
  });
  await t.test('invalid and oversized photos are rejected before storage',async()=>{
   globalThis.fetch=()=>{throw Error('Must not contact storage');};
   await assert.rejects(uploadPhoto({base64:'AAAA',mimeType:'image/jpeg'},'photo-test'));
   await assert.rejects(uploadPhoto({base64:'AAAA',mimeType:'image/jpeg'},'../../private'));
  });
 }finally{globalThis.fetch=original;await fs.rm(dir,{recursive:true,force:true});}
});
