import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../../public/recipe-book/manage.js',import.meta.url),'utf8');
function form(recipe,intent){
 const fields=new Map();const element=id=>{if(!fields.has(id))fields.set(id,{value:'',addEventListener(){}});return fields.get(id);};
 const context=vm.createContext({document:{getElementById:element,querySelectorAll:()=>[]},window:{addEventListener(){}},crypto:{randomUUID:()=> 'test-unique'},fixtureRecipe:recipe,fixtureIntent:intent});
 vm.runInContext(source.slice(0,source.lastIndexOf('(async()=>{try{draft=decode')),context);
 for(const [key,id] of [['title','recipe-title'],['subtitle','subtitle'],['description','description'],['prep','prep'],['cook','cook'],['total','total'],['yield','yield'],['note','note'],['image','photo-url']])element(id).value=recipe[key];
 element('tags').value=recipe.tags.join(', ');element('ingredients').value=recipe.ingredients.map(g=>'['+g.category+']\n'+g.items.join('\n')).join('\n\n');element('steps').value=recipe.steps.map(s=>s.title+'\n'+s.text).join('\n\n');element('collection').value=recipe.owner;
 vm.runInContext("book={profiles:[{id:fixtureRecipe.owner,name:'Test owner',initials:'T'}]};editing={intent:fixtureIntent,recipe:fixtureRecipe,base:fixtureRecipe,rawInputs:Object.fromEntries(['recipe-title','subtitle','description','prep','cook','total','yield','note','tags','ingredients','steps','photo-url'].map(id=>[id,$(id).value]))};",context);
 return {element,read:()=>JSON.parse(JSON.stringify(vm.runInContext('readEditor()',context)))};
}
const recipe={id:'test-recipe',owner:'test-owner',title:'Original',subtitle:'Recipe',description:'A description',prep:'1 min',cook:'2 min',total:'3 min',yield:'1 serving',note:'  A family note\n\nwith paragraphs.  ',tags:['Family'],color:'gold',image:'https://example.com/first.jpg',ingredients:[{category:'Group',items:['  1 tbsp ingredient  ']}],steps:[{title:'Cook',text:'First paragraph.\n\nA second paragraph in the same step.'}]};
test('renaming in the browser preserves untouched multi-paragraph instructions, notes and ingredient whitespace',()=>{
 const f=form(recipe,{action:'edit',recipeId:recipe.id,expectedRevision:4});f.element('recipe-title').value='Renamed';assert.deepEqual(f.read(),{action:'edit',recipeId:recipe.id,expectedRevision:4,changes:{title:'Renamed'}});
});
test('the browser’s final add draft honors a changed photo over the AI link’s original photo',()=>{
 const f=form(recipe,{action:'add',image:{url:recipe.image},recipe});f.element('photo-url').value='https://example.com/new.jpg';const draft=f.read();assert.equal(draft.recipe.image,'https://example.com/new.jpg');assert.equal(draft.image,undefined);
});
