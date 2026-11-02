import {currentActor,currentRecipeSession,currentInvitation,checkOrigin,readBody,errorResponse,createInvitation,setAccountSession,digest} from '@/lib/caruso-recipe-auth';
import {recipeAccountService} from '@/lib/caruso-recipe-accounts';
import {invitationEmail} from '@/lib/caruso-recipe-email';
import {RecipeError} from '@/lib/caruso-recipe-management';
import {loadBook,saveBook} from '@/lib/caruso-recipe-storage';
export const runtime='nodejs';
export const maxDuration=60;
const json=(v:object)=>Response.json({ok:true,...v},{headers:{'Cache-Control':'private, no-store'}});
export async function GET(){try{
 const actor=await currentActor();if(!actor)throw new RecipeError('Sign in or accept your invitation first.',401);
 const s=await currentRecipeSession();
 if(s?.accountId){const a=await recipeAccountService({action:'session',id:s.accountId,version:s.accountVersion});return json({email:a.email,name:a.name,hasPassword:true});}
 const invite=await currentInvitation();return json({email:invite?.recipientEmail||'',name:actor.name,hasPassword:false,canCreate:Boolean(invite||actor.role==='editor')});
}catch(e){return errorResponse(e);}}
export async function POST(request:Request){try{
 checkOrigin(request);const actor=await currentActor();if(!actor)throw new RecipeError('Sign in or accept your invitation first.',401);
 const body=await readBody(request,2500);const source=digest(request.headers.get('x-vercel-forwarded-for')||request.headers.get('x-forwarded-for')||'unknown');const s=await currentRecipeSession();
 if(body.action==='password'){
  if(!s?.accountId)throw new RecipeError('Create your account first.');
  const a=await recipeAccountService({action:'session',id:s.accountId,version:s.accountVersion});
  const updated=await recipeAccountService({action:'password',id:a.id,version:a.version,email:a.email,password:body.currentPassword,newPassword:body.password,source});
  await setAccountSession(updated);return json({email:updated.email,hasPassword:true});
 }
 if(body.action!=='register')throw new RecipeError('Choose a supported account action.');
 if(typeof body.password!=='string'||body.password.length<12||body.password.length>128)throw new RecipeError('Use a password between 12 and 128 characters.');
 let invite=await currentInvitation();const email=invitationEmail(body.email)?.toLowerCase();if(!email)throw new RecipeError('Enter your email address.');
 if(invite?.recipientEmail&&email!==invite.recipientEmail.toLowerCase())throw new RecipeError('Use the email address this invitation was sent to.',403);
 if(!invite){
  if(actor.role!=='editor'||s?.accountId)throw new RecipeError('Open your private invitation to create your account.',403);
  const name=typeof body.name==='string'?body.name.trim():'';if(!name||name.length>80)throw new RecipeError('Enter your name.');
  const made=await createInvitation({...actor,name},30,{id:body.requestId,createdAt:body.createdAt,email});invite=made.record;
  const {store,sha}=await loadBook();if(!store.invitations?.some(i=>i.id===invite!.id)){store.invitations??=[];store.invitations.push({id:invite.id,name,role:invite.actor.role,ownerId:invite.actor.ownerId,expires:invite.expires,revoked:false});await saveBook(sha,store,'Create personal recipe account invitation');}
 }
 const a=await recipeAccountService({action:'register',email,name:invite.actor.name,password:body.password,inviteId:invite.id,source});
 await setAccountSession(a);return json({email:a.email,hasPassword:true});
}catch(e){return errorResponse(e);}}
