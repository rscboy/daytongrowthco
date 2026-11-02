import {RecipeError} from './caruso-recipe-management';
import type {Invitation} from './caruso-recipe-auth';
export function invitationEmail(value:unknown):string|undefined {
  if(value===undefined||value==='')return undefined;
  if(typeof value!=='string')throw new RecipeError('Enter a valid email address.');
  const email=value.trim();const parts=email.split('@');
  if(email.length>254||parts.length!==2||parts[0].length>64||parts[0].startsWith('.')||parts[0].endsWith('.')||parts[0].includes('..')||!/^[-A-Za-z0-9.!#$%&'*+/=?^_`{|}~]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/.test(email))throw new RecipeError('Enter a valid email address.');
  return email;
}
export async function invitationEmailReady(){
  const secret=process.env.FUNNEL_CRM_API_SECRET||process.env.CRM_API_SECRET;if(!secret)return false;
  try{const r=await fetch(process.env.CARUSO_RECIPE_EMAIL_ENDPOINT||'https://daytongrowthco-crm.vercel.app/api/internal/recipe-invitation',{cache:'no-store',redirect:'error',signal:AbortSignal.timeout(15000),headers:{Authorization:`Bearer ${secret}`}});const b=await r.json();return r.ok&&b.ok===true&&b.ready===true;}catch{return false;}
}
export async function emailInvitation(record:Invitation,url:string,ownerName:string) {
  if(!record.recipientEmail)throw new RecipeError('This invitation needs an email address.');
  // Provider retry keys expire after 24 hours. Never automatically resend an
  // uncertain old request after that window; the private link still works.
  if(Date.now()-Date.parse(record.createdAt)>23*3600000)throw new RecipeError('This email request is too old to retry safely. Copy the invitation link instead.');
  const secret=process.env.FUNNEL_CRM_API_SECRET||process.env.CRM_API_SECRET;
  if(!secret)throw new RecipeError('Invitation email is not configured.',503);
  const endpoint=process.env.CARUSO_RECIPE_EMAIL_ENDPOINT||'https://daytongrowthco-crm.vercel.app/api/internal/recipe-invitation';
  const response=await fetch(endpoint,{method:'POST',cache:'no-store',redirect:'error',signal:AbortSignal.timeout(20000),headers:{Authorization:`Bearer ${secret}`,'Content-Type':'application/json'},body:JSON.stringify({id:record.id,email:record.recipientEmail,name:record.actor.name,ownerName,role:record.actor.role,expires:record.expires,url})});
  const body=await response.json().catch(()=>null);
  if(!response.ok||body?.ok!==true||typeof body.messageId!=='string'||!body.messageId)throw new RecipeError('The invitation is saved, but email sending could not be confirmed. Retry the email or copy the private link.',502);
  return body.messageId;
}
