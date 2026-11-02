import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {loadRecipeModules} from './load-modules.mjs';
const {additions:{parseRecipeAdditions,validRecipeImage},management:{validateRecipe}}=await loadRecipeModules();
const seed=JSON.parse(fs.readFileSync(new URL('../../lib/caruso-recipe-seed.json',import.meta.url)));
const extra=JSON.parse(fs.readFileSync(new URL('./fixtures/live-additions.json',import.meta.url)));
test('the actual reader accepts the entire original book and saved additions without altering recipes',()=>{
 const entries=[...seed.records.map(r=>({recipe:r.recipe,owner:seed.profiles.find(p=>p.id===r.recipe.owner)})),...extra.entries];
 const parsed=parseRecipeAdditions(JSON.stringify({version:1,entries}));assert.equal(parsed.entries.length,35);
 for(let i=0;i<entries.length;i++){assert.deepEqual(parsed.entries[i].recipe,validateRecipe(entries[i].recipe));}
 assert.ok(entries.filter(e=>e.recipe.image.startsWith('/recipe-book/')).length>=12);
});
test('reader and writer share safe image rules for original, uploaded and external photos',()=>{
 for(const image of ['/recipe-book/sam-g-challah.jpg','/recipe-book/all-recipes-family.jpg','/api/caruso-recipe-book/image/test-123.jpg','https://example.com/photo.jpg']){
  const recipe={...seed.records[0].recipe,image};assert.ok(validRecipeImage(image));assert.equal(validateRecipe(recipe).image,image);assert.equal(parseRecipeAdditions(JSON.stringify({version:1,entries:[{recipe,owner:seed.profiles[0]}]})).entries[0].recipe.image,image);
 }
 for(const image of ['javascript:alert(1)','//evil.test/photo','/recipe-book/../secret','https://user:pass@example.com/image.jpg'])assert.equal(validRecipeImage(image),false);
});
