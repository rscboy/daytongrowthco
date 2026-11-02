import fs from 'node:fs/promises';
import ts from 'typescript';
// Verify the reader contract as behavior, before any website can be published.
// No production credentials, production writes, or fallback recipes are used.
const source=await fs.readFile(new URL('../lib/caruso-recipe-additions.ts',import.meta.url),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {parseRecipeAdditions}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
const original=JSON.parse(await fs.readFile(new URL('../lib/caruso-recipe-seed.json',import.meta.url),'utf8'));
const entries=original.records.map(r=>({recipe:r.recipe,owner:original.profiles.find(p=>p.id===r.recipe.owner)}));
const parsed=parseRecipeAdditions(JSON.stringify({version:1,entries}));
if(parsed.entries.length!==entries.length||parsed.entries.some((entry,i)=>JSON.stringify(entry.recipe)!==JSON.stringify(Object.fromEntries(Object.keys(entry.recipe).map(k=>[k,entries[i].recipe[k]])))))throw Error('Recipe reader changed the saved original recipes.');
console.log(`[recipe-reader-guard] All ${parsed.entries.length} original recipes, photos and instructions pass the reader contract.`);
