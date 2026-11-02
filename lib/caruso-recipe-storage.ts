import { createHash } from 'node:crypto';
import { parseRecipeAdditions, RECIPE_ADDITIONS_PATH } from './caruso-recipe-additions';
import { parseStore, RecipeError, slug, type RecipeStore } from './caruso-recipe-management';
import seed from './caruso-recipe-seed.json';

export const STORE_PATH = 'data/caruso-recipe-book-v2.json';
export class GitHubError extends Error { constructor(public status: number) { super(`Recipe storage request failed (${status}).`); } }
export async function recipeGitHub<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = process.env.CARUSO_RECIPE_GITHUB_TOKEN;
  const repo = process.env.CARUSO_RECIPE_GITHUB_REPOSITORY || 'rscboy/daytongrowthco';
  if (!token || !/^[\w.-]+\/[\w.-]+$/.test(repo)) throw new RecipeError('Recipe storage is not configured.',503);
  const response = await fetch(`https://api.github.com/repos/${repo}${path}`,{
    ...init, cache:'no-store', redirect:'error', signal:AbortSignal.timeout(15000),
    headers:{Accept:'application/vnd.github+json',Authorization:`Bearer ${token}`,'X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json',...init.headers},
  });
  if (!response.ok) throw new GitHubError(response.status);
  return response.json();
}
const branch = () => process.env.CARUSO_RECIPE_GITHUB_BRANCH || 'main';
export async function readFile(path: string, ref: string) {
  let file = await recipeGitHub<{content:string;encoding:string;sha?:string}>(`/contents/${path}?ref=${encodeURIComponent(ref)}`);
  // GitHub omits inline content above 1 MB. History must remain readable as it grows.
  if (file.encoding === 'none' && file.sha) file = await recipeGitHub(`/git/blobs/${file.sha}`);
  if (file.encoding !== 'base64' || typeof file.content !== 'string') throw new RecipeError('Recipe storage returned an unsupported format.',503);
  return Buffer.from(file.content.replace(/\n/g,''),'base64').toString('utf8');
}
async function neverExisted(path: string, ref: string) {
  const history = await recipeGitHub<unknown[]>(`/commits?path=${encodeURIComponent(path)}&sha=${encodeURIComponent(ref)}&per_page=1`);
  return Array.isArray(history) && history.length === 0;
}
export async function loadBook() {
  const head = await recipeGitHub<{object:{sha:string}}>(`/git/ref/heads/${encodeURIComponent(branch())}`);
  const sha = head.object.sha;
  try { return {sha,store:parseStore(JSON.parse(await readFile(STORE_PATH,sha))),initialized:true}; }
  catch (e) { if (!(e instanceof GitHubError) || e.status !== 404 || !(await neverExisted(STORE_PATH,sha))) throw e; }
  // One-time, read-only import of the verified original book plus current live
  // additions. Once v2 exists, missing/corrupt storage NEVER falls back to seed.
  const store = structuredClone(seed) as RecipeStore;
  let additions;
  try { additions = parseRecipeAdditions(await readFile(RECIPE_ADDITIONS_PATH,sha)); }
  catch (e) { if (!(e instanceof GitHubError) || e.status !== 404 || !(await neverExisted(RECIPE_ADDITIONS_PATH,sha))) throw e; additions = {entries:[]}; }
  for (const entry of additions.entries) {
    if (!store.records.some(r => r.recipe.id === entry.recipe.id)) store.records.push({recipe:entry.recipe,revision:1,deletedAt:null,updatedAt:'2026-11-02T00:00:00.000Z'});
    if (!store.profiles.some(p => p.id === entry.owner.id)) store.profiles.push(entry.owner);
  }
  return {sha,store:parseStore(store),initialized:false};
}
export async function saveBook(parentSha: string, store: RecipeStore, message: string) {
  parseStore(store);
  const parent = await recipeGitHub<{tree:{sha:string}}>(`/git/commits/${parentSha}`);
  const tree = await recipeGitHub<{sha:string}>('/git/trees',{method:'POST',body:JSON.stringify({base_tree:parent.tree.sha,tree:[{path:STORE_PATH,mode:'100644',type:'blob',content:JSON.stringify(store)}]})});
  const commit = await recipeGitHub<{sha:string}>('/git/commits',{method:'POST',body:JSON.stringify({message,tree:tree.sha,parents:[parentSha]})});
  try { await recipeGitHub(`/git/refs/heads/${encodeURIComponent(branch())}`,{method:'PATCH',body:JSON.stringify({sha:commit.sha,force:false})}); }
  catch (e) { if (e instanceof GitHubError && [409,422].includes(e.status)) throw new RecipeError('Another contribution was saved first. Review this change again.',409); throw e; }
  const verified = await readFile(STORE_PATH,commit.sha);
  if (verified !== JSON.stringify(store)) throw new RecipeError('Storage did not confirm the saved change. Check your history before retrying.',503);
}
export async function uploadPhoto(image: unknown, recipeId: string) {
  if (!slug(recipeId)) throw new RecipeError('Invalid recipe photo ID.');
  const im = image as {base64?:string;mimeType?:string};
  if (!im || typeof im.base64 !== 'string' || im.base64.length > 4_000_004 || !/^[A-Za-z0-9+/]+={0,2}$/.test(im.base64)) throw new RecipeError('Choose a photo under 3 MB.');
  const bytes = Buffer.from(im.base64,'base64');
  const type = bytes.subarray(0,3).equals(Buffer.from([255,216,255])) ? 'image/jpeg' : bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ? 'image/png' : bytes.toString('ascii',0,4) === 'RIFF' && bytes.toString('ascii',8,12) === 'WEBP' ? 'image/webp' : '';
  if (!type || type !== im.mimeType || bytes.length < 100 || bytes.length > 3_000_000) throw new RecipeError('Choose a valid JPG, PNG, or WebP photo under 3 MB.');
  const filename = `${recipeId}-${createHash('sha256').update(bytes).digest('hex').slice(0,10)}.${type === 'image/png' ? 'png' : type === 'image/webp' ? 'webp' : 'jpg'}`;
  const path = `public/recipe-book/community/${filename}`;
  const head = await recipeGitHub<{object:{sha:string}}>(`/git/ref/heads/${encodeURIComponent(branch())}`);
  try { await readFile(path,head.object.sha); }
  catch (e) {
    if (!(e instanceof GitHubError) || e.status !== 404) throw e;
    await recipeGitHub(`/contents/${path}`,{method:'PUT',body:JSON.stringify({message:'Save recipe photo',content:im.base64,branch:branch()})});
  }
  return `/api/caruso-recipe-book/image/${filename}`;
}
