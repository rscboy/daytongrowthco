import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
const dir=mkdtempSync('/tmp/five-star-model-');
try {
 const code=ts.transpileModule(readFileSync('app/projects/secret/five-star-freeway/game-model.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 writeFileSync(`${dir}/model.cjs`,code);const require=createRequire(import.meta.url);const m=require(`${dir}/model.cjs`);
 assert.equal(m.validate(m.sample),'');
 for(const patch of [{name:''},{name:'a'.repeat(61)},{reviews:-1},{reviews:1.2},{reviews:NaN},{rating:0},{rating:5.1},{rating:Infinity},{goal:34},{goal:NaN}])assert.notEqual(m.validate({...m.sample,...patch}),'');
 assert.equal(m.validate({...m.sample,name:'<script>alert("test")</script>'}),''); // React text rendering, never HTML.
 assert.equal(m.cars.length,6);assert.equal(new Set(m.cars.map(c=>c.type)).size,6);assert.equal(m.hazards.length,8);
 let r=m.newRun(m.sample);for(let i=0;i<m.moments.length;i++){const moment=m.moments[i];const previous=r; r=m.answerMoment(r,i,moment.good);assert.ok(r.reviews>previous.reviews);assert.ok(r.rating>=1&&r.rating<=5);assert.ok(r.trust<=100);for(let bad=0;bad<moment.options.length;bad++){if(bad===moment.good)continue;const wrong=m.answerMoment(previous,i,bad);assert.equal(wrong.reviews,previous.reviews);assert.ok(wrong.trust<previous.trust);assert.equal(wrong.missed,previous.missed+1);}}
 assert.equal(r.successes,6);assert.equal(r.reviews,51);assert.ok(r.responses>0);assert.ok(r.rating<5);assert.ok(r.convoy>0);assert.ok(m.score(r)>m.score(m.newRun(m.sample)));
 const settings=JSON.parse(readFileSync('data/secret-projects-settings.json','utf8'));assert.deepEqual(settings.five_star_freeway,{active:false,passwordEnabled:false,passwordHash:null,updatedAt:null});
 const page=readFileSync('app/projects/secret/five-star-freeway/page.tsx','utf8');assert.match(page,/requireSecretProjectAccess\('five_star_freeway'\)/);assert.match(page,/index: false/);
 console.log('PASS: profile boundaries, six distinct vehicles, eight hazards, every good/bad customer decision, weighted honest ratings, responses, convoy, scoring, default privacy and route guard.');
} finally {rmSync(dir,{recursive:true,force:true});}
