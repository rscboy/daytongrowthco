import { cookies } from "next/headers";
import { hasSecretProjectsSession, secretProjectsCookie } from "@/lib/secret-projects-auth";
import { checkOrigin, createInvitation, currentActor, errorResponse, readBody, revokeInvitation } from '@/lib/caruso-recipe-auth';
import { RecipeError, validateProfile } from '@/lib/caruso-recipe-management';
import { loadBook, saveBook } from '@/lib/caruso-recipe-storage';
export const runtime='nodejs';
async function editor() {
  const c=await cookies();
  if(hasSecretProjectsSession(c.get(secretProjectsCookie)?.value))return;
  const actor=await currentActor();
  if(!actor)return Response.json({error: "Unauthorized."},{status: 401});
  if(actor.role!=='editor')throw new RecipeError('Only a family editor can manage invitations.',403);
}
export async function POST(request:Request) {
  try {
    checkOrigin(request);const denied=await editor();if(denied)return denied;const body=await readBody(request,2000);
    const owner=validateProfile(body.owner);
    if(!['contributor','editor'].includes(body.role))throw new RecipeError('Choose contributor or family editor.');
    const {record,token}=await createInvitation({id:'',name:owner.name,role:body.role,ownerId:owner.id});
    const {store,sha}=await loadBook();
    store.invitations=[...(store.invitations??[]),{id:record.id,name:record.actor.name,role:record.actor.role,ownerId:record.actor.ownerId,expires:record.expires,revoked:false}];
    await saveBook(sha,store,`Invite ${record.actor.name} to the recipe book`);
    return Response.json({ok:true,url:`${request.headers.get('origin')}/recipe-book/manage.html#invite=${token}`,id:record.id,expires:record.expires},{headers:{'Cache-Control':'private, no-store'}});
  }catch(e){return errorResponse(e);}
}
export async function DELETE(request:Request) {
  try {checkOrigin(request);const denied=await editor();if(denied)return denied;const body=await readBody(request,1000);await revokeInvitation(body.id);const {store,sha}=await loadBook();store.invitations=(store.invitations??[]).map(i=>i.id===body.id?{...i,revoked:true}:i);await saveBook(sha,store,'Revoke recipe contributor invitation');return Response.json({ok:true});}catch(e){return errorResponse(e);}
}
