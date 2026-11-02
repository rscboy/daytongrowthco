import type { CommunityRecipe } from './caruso-recipe-additions';

export type Actor = { id: string; name: string; role: 'editor' | 'contributor'; ownerId: string };
export type Profile = { id: string; name: string; initials: string; image?: string; imagePosition?: string };
export type RecipeRecord = { recipe: CommunityRecipe; revision: number; deletedAt: string | null; updatedAt: string };
export type Change = { id: string; actorId: string; actorName: string; action: string; recipeId: string; before: RecipeRecord | null; after: RecipeRecord; at: string };
export type InvitationSummary = {id:string;name:string;role:'editor'|'contributor';ownerId:string;expires:number;revoked:boolean};
export type RecipeStore = { version: 2; records: RecipeRecord[]; profiles: Profile[]; history: Change[]; invitations?:InvitationSummary[] };
export type Draft = {
  version?: number; action: 'add' | 'edit' | 'move' | 'delete' | 'restore' | 'revert' | 'undo' | 'variation';
  recipeId?: string; query?: string; recipe?: Partial<CommunityRecipe>; changes?: Partial<CommunityRecipe>;
  owner?: Profile; image?: { url?: string }; allowDuplicate?: boolean; historyId?: string; expectedRevision?: number;
};
export type Prepared = { draft: Draft; before: RecipeRecord | null; after: RecipeRecord; duplicates: { id: string; title: string; owner: string }[] };
export class RecipeError extends Error { constructor(message: string, public status = 400) { super(message); } }
export const slug = (v: unknown): v is string => typeof v === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v) && v.length <= 80;
const text = (v: unknown, max: number): v is string => typeof v === 'string' && v.trim().length > 0 && v.length <= max;
const fields = ['title','subtitle','description','prep','cook','total','yield','tags','color','ingredients','steps','note','image'] as const;
const colors = new Set(['blue','coral','gold','green','lavender','lilac','mint','peach','pink','rust','tomato','orange','yellow']);
export function validImage(v: unknown): v is string {
  if (typeof v !== 'string' || v.length > 2000) return false;
  if (/^\/(?:recipe-book|api\/caruso-recipe-book\/image)\/[a-zA-Z0-9_.\/-]+$/.test(v) && !v.includes('..')) return true;
  try { const u = new URL(v); return u.protocol === 'https:' && !u.username && !u.password; } catch { return false; }
}
export function validateRecipe(value: unknown): CommunityRecipe {
  const r = value as CommunityRecipe;
  if (!r || !slug(r.id) || !slug(r.owner)) throw new RecipeError('Choose a valid recipe and collection.');
  for (const key of ['title','subtitle','description','prep','cook','total','yield','note'] as const) if (!text(r[key], 1500)) throw new RecipeError(`The recipe needs ${key}.`);
  if (!validImage(r.image) || !colors.has(r.color)) throw new RecipeError('Choose a valid photo and recipe color.');
  if (!Array.isArray(r.tags) || !r.tags.length || r.tags.length > 6 || !r.tags.every(t => text(t,40))) throw new RecipeError('Use one to six short tags.');
  if (!Array.isArray(r.ingredients) || !r.ingredients.length || r.ingredients.length > 12 || !r.ingredients.every(g => g && text(g.category,120) && Array.isArray(g.items) && g.items.length > 0 && g.items.length <= 60 && g.items.every(i => text(i,500)))) throw new RecipeError('Check the ingredient groups and quantities.');
  if (!Array.isArray(r.steps) || !r.steps.length || r.steps.length > 30 || !r.steps.every(s => s && text(s.title,120) && text(s.text,1500))) throw new RecipeError('Check the complete cooking instructions.');
  return structuredClone(Object.fromEntries((['id','owner',...fields] as const).map(k => [k,r[k]]))) as CommunityRecipe;
}
export function validateProfile(p: Profile): Profile {
  if (!p || !slug(p.id) || p.id === 'all' || !text(p.name,80) || !text(p.initials,6)) throw new RecipeError('Choose a collection name.');
  return { id:p.id, name:p.name.trim(), initials:p.initials.trim(), ...(validImage(p.image) ? {image:p.image} : {}), ...(text(p.imagePosition,40) ? {imagePosition:p.imagePosition} : {}) };
}
export function canManage(actor: Actor, record: RecipeRecord) { return actor.role === 'editor' || record.recipe.owner === actor.ownerId; }
export function normalized(v: string) { return v.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim(); }
export function findDuplicates(store: RecipeStore, recipe: CommunityRecipe, excludeId?: string) {
  const title = normalized(`${recipe.title} ${recipe.subtitle}`);
  const ingredients = normalized(recipe.ingredients.flatMap(g => g.items).join(' '));
  const words = new Set(title.split(' ').filter(w => w.length > 2));
  return store.records.filter(r => !r.deletedAt && r.recipe.id !== excludeId && (
    normalized(`${r.recipe.title} ${r.recipe.subtitle}`) === title ||
    normalized(r.recipe.ingredients.flatMap(g => g.items).join(' ')) === ingredients ||
    (() => { const other = new Set(normalized(`${r.recipe.title} ${r.recipe.subtitle}`).split(' ').filter(w => w.length > 2)); const shared = [...words].filter(w => other.has(w)).length; return shared >= 2 && shared / Math.max(words.size,other.size) >= .75; })()
  )).map(r => ({id:r.recipe.id,title:`${r.recipe.title} ${r.recipe.subtitle}`,owner:r.recipe.owner}));
}
export function validateDraft(value: unknown): Draft {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new RecipeError('The change is missing.');
  const d = value as Draft;
  if (Object.keys(d).some(k => !['version','action','recipeId','query','recipe','changes','owner','image','allowDuplicate','historyId','expectedRevision'].includes(k))) throw new RecipeError('This change contains unsupported fields.');
  if (d.version !== undefined && d.version !== 1 && d.version !== 2) throw new RecipeError('Unsupported review link version.');
  if (!['add','edit','move','delete','restore','revert','undo','variation'].includes(d.action)) throw new RecipeError('Choose a supported recipe action.');
  if (d.recipeId !== undefined && !slug(d.recipeId)) throw new RecipeError('Invalid recipe ID.');
  if (d.query !== undefined && !text(d.query,160)) throw new RecipeError('Enter a recipe name.');
  if (d.allowDuplicate !== undefined && typeof d.allowDuplicate !== 'boolean') throw new RecipeError('Invalid duplicate choice.');
  if (d.expectedRevision !== undefined && (!Number.isSafeInteger(d.expectedRevision) || d.expectedRevision < 1)) throw new RecipeError('Invalid recipe version.');
  if (d.owner) validateProfile({...d.owner,initials:d.owner.initials || d.owner.name?.slice(0,2)});
  if (d.changes && (typeof d.changes !== 'object' || Array.isArray(d.changes) || Object.keys(d.changes).some(k => !fields.includes(k as typeof fields[number])))) throw new RecipeError('Edit recipe details only; use Move to change collections.');
  if (d.image && (!validImage(d.image.url) || Object.keys(d.image).some(k => k !== 'url'))) throw new RecipeError('Choose a valid photo URL or upload a photo on the website.');
  return structuredClone(d);
}
export function prepareChange(store: RecipeStore, actor: Actor, input: unknown, at: string): Prepared {
  const draft = validateDraft(input);
  if (draft.action === 'undo') {
    const last = [...store.history].reverse().find(h => h.actorId === actor.id);
    if (!last) throw new RecipeError('You have no changes to undo.',404);
    const current = store.records.find(r => r.recipe.id === last.recipeId);
    if (!current || current.revision !== last.after.revision) throw new RecipeError('This recipe changed since your last action. Review its history instead.',409);
    return prepareChange(store,actor,{action:last.before ? 'revert' : 'delete',recipeId:last.recipeId,historyId:last.before ? last.id : undefined},at);
  }
  const before = draft.recipeId ? store.records.find(r => r.recipe.id === draft.recipeId) ?? null : null;
  const adding = draft.action === 'add' || draft.action === 'variation';
  if (!adding && !before) throw new RecipeError('Select the exact recipe on this page.',404);
  if (before && draft.expectedRevision !== undefined && before.revision !== draft.expectedRevision) throw new RecipeError('This recipe changed while you were editing. Reload the latest recipe and review your changes again.',409);
  if (before && !adding && !canManage(actor,before)) throw new RecipeError('You can manage recipes in your own collection. A family editor can help with other collections.',403);
  if (before?.deletedAt && !['restore','revert'].includes(draft.action)) throw new RecipeError('This recipe is in trash. Restore it first.',409);
  if (draft.action === 'restore' && !before?.deletedAt) throw new RecipeError('This recipe is already in the book.',409);
  let recipe: CommunityRecipe;
  let deletedAt: string | null = null;
  if (adding) {
    if (draft.action === 'variation' && !before) throw new RecipeError('Select the original recipe for your variation.',404);
    const owner = draft.owner || store.profiles.find(p => p.id === actor.ownerId);
    if (!owner) throw new RecipeError('Choose a collection for the recipe.');
    if (actor.role !== 'editor' && owner.id !== actor.ownerId) throw new RecipeError('Add recipes to your own collection.',403);
    recipe = validateRecipe({...((draft.action === 'variation' && before) ? before.recipe : {}),...draft.recipe,owner:owner.id,...(draft.image ? {image:draft.image.url} : {})});
    if (draft.action === 'variation' && before && recipe.id === before.recipe.id) throw new RecipeError('Give your variation a new recipe ID.');
    if (store.records.some(r => r.recipe.id === recipe.id)) throw new RecipeError('This recipe ID already exists, including in trash. Choose the existing recipe or a new ID.',409);
  } else {
    recipe = structuredClone(before!.recipe);
    if (draft.action === 'edit') recipe = validateRecipe({...recipe,...draft.changes,...(draft.image ? {image:draft.image.url} : {})});
    if (draft.action === 'move') {
      if (!draft.owner) throw new RecipeError('Choose a destination collection.');
      if (actor.role !== 'editor' && draft.owner.id !== actor.ownerId) throw new RecipeError('A family editor can move recipes to another collection.',403);
      recipe.owner = draft.owner.id;
    }
    if (draft.action === 'delete') deletedAt = at;
    if (draft.action === 'revert') {
      const h = store.history.find(h => h.id === draft.historyId && h.recipeId === recipe.id);
      if (!h?.before) throw new RecipeError('That earlier version is unavailable.',404);
      if (!canManage(actor,h.before)) throw new RecipeError('A family editor can restore that collection.',403);
      recipe = structuredClone(h.before.recipe); deletedAt = h.before.deletedAt;
    }
  }
  const after = {recipe, revision:(adding ? 0 : before!.revision)+1,deletedAt,updatedAt:at};
  let duplicates = !deletedAt && ['add','variation','edit','restore','revert'].includes(draft.action) ? findDuplicates(store,recipe,adding ? undefined : recipe.id) : [];
  if (draft.action === 'edit' && before) {
    const alreadySimilar = new Set(findDuplicates(store,before.recipe,before.recipe.id).map(d=>d.id));
    duplicates = duplicates.filter(d=>!alreadySimilar.has(d.id));
  }
  return {draft,before:adding ? null : before,after,duplicates};
}
export function applyChange(store: RecipeStore, actor: Actor, draft: Draft, expectedRevision: number, id: string, at: string) {
  const previous = store.history.find(h => h.id === id);
  if (previous) { if (previous.actorId !== actor.id) throw new RecipeError('This approval belongs to another contributor.',403); return {store,change:previous,replayed:true}; }
  const p = prepareChange(store,actor,draft,at);
  if ((p.before?.revision ?? 0) !== expectedRevision) throw new RecipeError('Someone changed this recipe. Review the latest version before saving.',409);
  if (p.duplicates.length && !p.draft.allowDuplicate) throw new RecipeError('A similar recipe exists. Review it or explicitly save a separate version.',409);
  const next = structuredClone(store);
  if (p.draft.owner && !next.profiles.some(o => o.id === p.draft.owner!.id)) next.profiles.push(validateProfile({...p.draft.owner,initials:p.draft.owner.initials || p.draft.owner.name.slice(0,2)}));
  const i = next.records.findIndex(r => r.recipe.id === p.after.recipe.id);
  if (i < 0) next.records.push(p.after); else next.records[i] = p.after;
  const change = {id,actorId:actor.id,actorName:actor.name,action:p.draft.action,recipeId:p.after.recipe.id,before:p.before,after:p.after,at};
  next.history.push(change);
  return {store:next,change,replayed:false};
}
export function parseStore(value: unknown): RecipeStore {
  const s = value as RecipeStore;
  if (!s || s.version !== 2 || !Array.isArray(s.records) || !Array.isArray(s.profiles) || !Array.isArray(s.history)) throw new RecipeError('Recipe storage is unavailable; no defaults were applied.',503);
  const ids = new Set<string>();
  for (const r of s.records) {
    validateRecipe(r.recipe);
    if (ids.has(r.recipe.id) || !Number.isSafeInteger(r.revision) || r.revision < 1 || !(r.deletedAt === null || text(r.deletedAt,40))) throw new RecipeError('Recipe storage is invalid.',503);
    ids.add(r.recipe.id);
  }
  for (const p of s.profiles) validateProfile(p);
  return s;
}
