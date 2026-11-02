import { randomUUID } from 'node:crypto';
import { currentActor, requireActor, checkOrigin, readBody, errorResponse, signValue, readSigned, digest } from '@/lib/caruso-recipe-auth';
import { applyChange, prepareChange, canManage, RecipeError, type Draft } from '@/lib/caruso-recipe-management';
import { loadBook, saveBook, uploadPhoto } from '@/lib/caruso-recipe-storage';
export const runtime='nodejs';
export const maxDuration=60;
type Ticket={actorId:string; digest:string; revision:number; id:string; expires:number};
const json=(v:object)=>Response.json({ok:true,...v},{headers:{'Cache-Control':'private, no-store'}});
export async function GET() {
  try {
    const actor=await currentActor();if(!actor)return json({actor:null});
    const {store}=await loadBook();
    return json({actor,profiles:store.profiles,invitations:actor.role==='editor'?(store.invitations??[]):[],records:store.records.map(r=>({...r,canManage:canManage(actor,r)})),history:store.history.filter(h=>actor.role==='editor'||(h.before?.recipe.owner===actor.ownerId&&h.after.recipe.owner===actor.ownerId)||(!h.before&&h.after.recipe.owner===actor.ownerId))});
  }catch(e){return errorResponse(e);}
}
export async function POST(request:Request) {
  try {
    checkOrigin(request);const actor=await requireActor();const body=await readBody(request,4_200_000);
    if(body.mode==='photo') {
      const {store}=await loadBook();
      if(body.recipeId && store.records.some(r=>r.recipe.id===body.recipeId&&!canManage(actor,r)))throw new RecipeError('You cannot change this recipe.',403);
      return json({url:await uploadPhoto(body.image,randomUUID())});
    }
    const {store,sha}=await loadBook();
    if(body.mode==='prepare') {
      const p=prepareChange(store,actor,body.draft,new Date().toISOString());
      const ticket=signValue({actorId:actor.id,digest:digest(JSON.stringify(p.draft)),revision:p.before?.revision??0,id:randomUUID(),expires:Date.now()+15*60000});
      return json({...p,ticket});
    }
    if(body.mode!=='commit'||typeof body.ticket!=='string')throw new RecipeError('Review the change before saving.');
    const ticket=readSigned<Ticket>(body.ticket);
    if(!ticket||ticket.actorId!==actor.id||ticket.expires<=Date.now()||ticket.digest!==digest(JSON.stringify(body.draft)))throw new RecipeError('This review expired or changed. Review it again.',409);
    const result=applyChange(store,actor,body.draft as Draft,ticket.revision,ticket.id,new Date().toISOString());
    if(!result.replayed)await saveBook(sha,result.store,`${result.change.action}: ${result.change.after.recipe.title} (${actor.name})`);
    return json({change:result.change,replayed:result.replayed,recipeId:result.change.recipeId});
  }catch(e){return errorResponse(e);}
}
