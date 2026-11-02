import { cookies } from "next/headers";
import { hasSecretProjectsSession, secretProjectsCookie } from "@/lib/secret-projects-auth";
import { checkOrigin, createInvitation, currentActor, errorResponse, readBody, revokeInvitation, recordInvitationEmail, invitationEmailReceipt } from '@/lib/caruso-recipe-auth';
import { invitationEmail, emailInvitation, invitationEmailReady } from '@/lib/caruso-recipe-email';
import { RecipeError, validateProfile } from '@/lib/caruso-recipe-management';
import { loadBook, saveBook } from '@/lib/caruso-recipe-storage';
import {invitationForResend,resendEmailReceipt,recordResendEmail} from '@/lib/caruso-recipe-auth';
export const runtime='nodejs';
export const maxDuration=60;
async function editor() {
  const c=await cookies();
  if(hasSecretProjectsSession(c.get(secretProjectsCookie)?.value))return;
  const actor=await currentActor();
  if(!actor)return Response.json({error: "Unauthorized."},{status: 401});
  if(actor.role!=='editor')throw new RecipeError('Only a family editor can manage invitations.',403);
}
export async function GET(){try{const denied=await editor();if(denied)return denied;return Response.json({ok:true,emailReady:await invitationEmailReady()},{headers:{'Cache-Control':'private, no-store'}});}catch(e){return errorResponse(e);}}
export async function POST(request:Request) {
  try {
    checkOrigin(request);const denied=await editor();if(denied)return denied;const body=await readBody(request,2000);
    if(body.action==='resend'){
      if(typeof body.requestId!=='string'||!/^[a-f0-9-]{36}$/i.test(body.requestId)||typeof body.createdAt!=='string'||!Number.isFinite(Date.parse(body.createdAt)))throw new RecipeError('Start a fresh invitation resend.');
      const {record,token}=await invitationForResend(body.id);
      const receipt=await resendEmailReceipt(record.id,body.requestId);
      if(!receipt){
        const age=Date.now()-Date.parse(body.createdAt);if(age < -5*60000 || age > 23*3600000)throw new RecipeError('Start a fresh invitation resend.');
        const {store}=await loadBook();const ownerName=store.profiles.find(p=>p.id===record.actor.ownerId)?.name||record.actor.name;
        const origin=process.env.NODE_ENV==='production'?'https://recipes.daytongrowth.co':request.headers.get('origin');
        const messageId=await emailInvitation(record,`${origin}/recipe-book/manage.html?v=3#invite=${token}`,ownerName,{id:body.requestId,createdAt:body.createdAt});
        await recordResendEmail(record.id,body.requestId,messageId);
      }
      return Response.json({ok:true,id:record.id,email:record.recipientEmail,emailStatus:'sent'},{headers:{'Cache-Control':'private, no-store'}});
    }
    const owner=validateProfile(body.owner);
    if(!['contributor','editor'].includes(body.role))throw new RecipeError('Choose contributor or family editor.');
    const email=invitationEmail(body.email);
    const name=typeof body.name==='string'?body.name.trim():owner.name;
    if(!name||name.length>80)throw new RecipeError('Enter the recipient’s name.');
    if(email&&!body.requestId)throw new RecipeError('Please start a fresh invitation.');
    const inviteRequest=body.requestId?{id:body.requestId,createdAt:body.createdAt,email}:undefined;
    const {record,token}=await createInvitation({id:'',name,role:body.role,ownerId:owner.id},30,inviteRequest);
    const {store,sha}=await loadBook();
    if(!store.invitations?.some(i=>i.id===record.id)){
      store.invitations=[...(store.invitations??[]),{id:record.id,name:record.actor.name,role:record.actor.role,ownerId:record.actor.ownerId,expires:record.expires,revoked:false}];
      await saveBook(sha,store,`Invite ${record.actor.name} to the recipe book`);
    }
    const origin=process.env.NODE_ENV==='production'?'https://recipes.daytongrowth.co':request.headers.get('origin');
    const url=`${origin}/recipe-book/manage.html?v=3#invite=${token}`;
    let emailStatus:'sent'|'unconfirmed'|'not-requested'='not-requested';
    if(email){try{const receipt=await invitationEmailReceipt(record.id);if(!receipt){const messageId=await emailInvitation(record,url,owner.name);await recordInvitationEmail(record,messageId);}emailStatus='sent';}catch{emailStatus='unconfirmed';}}
    return Response.json({ok:true,url,id:record.id,expires:record.expires,emailStatus},{headers:{'Cache-Control':'private, no-store'}});
  }catch(e){return errorResponse(e);}
}
export async function DELETE(request:Request) {
  try {checkOrigin(request);const denied=await editor();if(denied)return denied;const body=await readBody(request,1000);await revokeInvitation(body.id);const {store,sha}=await loadBook();store.invitations=(store.invitations??[]).map(i=>i.id===body.id?{...i,revoked:true}:i);await saveBook(sha,store,'Revoke recipe contributor invitation');return Response.json({ok:true});}catch(e){return errorResponse(e);}
}
