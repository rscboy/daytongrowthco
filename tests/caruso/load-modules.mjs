import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';
export async function loadRecipeModules(){
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'caruso-module-tests-'));
 for(const name of ['caruso-recipe-management','caruso-recipe-additions']){
  const source=await fs.readFile(new URL(`../../lib/${name}.ts`,import.meta.url),'utf8');
  const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace(/from '(\.\/caruso-[a-z-]+)'/g,"from '$1.mjs'");
  await fs.writeFile(path.join(dir,name+'.mjs'),compiled);
 }
 return {management:await import(pathToFileURL(path.join(dir,'caruso-recipe-management.mjs'))),additions:await import(pathToFileURL(path.join(dir,'caruso-recipe-additions.mjs')))};
}
