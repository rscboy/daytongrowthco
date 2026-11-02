import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { hasSecretProjectsSession, secretProjectsCookie } from './secret-projects-auth';
import { readInternalProjectStorage, writeInternalProjectStorage } from './internal-project-storage';
import { RecipeError, type Actor } from './caruso-recipe-management';
import { recipeAccountService, type RecipeAccount } from './caruso-recipe-accounts';

export const recipeCookie = 'caruso_recipe_contributor';
type Session = { actor:Actor; expires:number; inviteId?:string; tokenHash?:string;accountId?:string;accountVersion?:string };
export type Invitation = { id:string; actor:Actor; tokenHash:string; expires:number; revoked:boolean; createdAt:string; requestFingerprint?:string; recipientEmail?:string };
function secret() {
  const s = process.env.CARUSO_RECIPE_SESSION_SECRET || process.env.SECRET_PROJECTS_SESSION_SECRET;
  if (!s) throw new RecipeError('Contributor sign-in is not configured.',503);
  return s;
}
export function digest(v:string) { return createHash('sha256').update(v).digest('hex'); }
function safeEqual(a:string,b:string) { const x=Buffer.from(a),y=Buffer.from(b); return x.length===y.length && timingSafeEqual(x,y); }
export function signValue(value:object) { const p=Buffer.from(JSON.stringify(value)).toString('base64url'); return `${p}.${createHmac('sha256',secret()).update(p).digest('base64url')}`; }
export function readSigned<T>(value:string): T | null {
  const [p,s,...extra]=value.split('.');
  if (!p||!s||extra.length||value.length>150_000) return null;
  if (!safeEqual(s,createHmac('sha256',secret()).update(p).digest('base64url'))) return null;
  try { return JSON.parse(Buffer.from(p,'base64url').toString('utf8')); } catch { return null; }
}
const inviteKey = (id:string) => `caruso-recipe-invite-${id}`;
const revokedKey = (id:string) => `caruso-recipe-invite-revoked-${id}`;
export async function currentActor(): Promise<Actor | null> {
  const c=await cookies();
  if (hasSecretProjectsSession(c.get(secretProjectsCookie)?.value)) return {id:'family-admin',name:'Family editor',role:'editor',ownerId:'sammy'};
  const raw=c.get(recipeCookie)?.value;
  if (!raw) return null;
  const session=readSigned<Session>(raw);
  if (!session || session.expires<=Date.now() || !session.actor) return null;
  if(session.accountId && session.accountVersion){
    try {const account=await recipeAccountService({action:'session',id:session.accountId,version:session.accountVersion});return (await accountAccess(account))?.actor??null;}
    catch(e){if(e instanceof RecipeError && e.status===401)return null;throw e;}
  }
  if (session.inviteId) {
    const record=await readInternalProjectStorage<Invitation>(inviteKey(session.inviteId));
    if (!record || record.revoked || record.expires<=Date.now() || record.tokenHash!==session.tokenHash || await readInternalProjectStorage(revokedKey(record.id))) return null;
    return record.actor;
  }
  return session.actor;
}
export async function accountAccess(account:RecipeAccount) {
  const grants=await Promise.all(account.inviteIds.map(id=>readInternalProjectStorage<Invitation>(inviteKey(id))));
  const live:Invitation[]=[];
  for(const grant of grants)if(grant&&!grant.revoked&&!await readInternalProjectStorage(revokedKey(grant.id)))live.push(grant);
  return live.find(g=>g.actor.role==='editor')??live[live.length-1]??null;
}
export async function currentRecipeSession(){
 const raw=(await cookies()).get(recipeCookie)?.value;if(!raw)return null;const session=readSigned<Session>(raw);return session&&session.expires>Date.now()?session:null;
}
export async function currentInvitation(){
 const s=await currentRecipeSession();if(!s?.inviteId)return null;
 const record=await readInternalProjectStorage<Invitation>(inviteKey(s.inviteId));
 return record&&!record.revoked&&record.expires>Date.now()&&record.tokenHash===s.tokenHash&&!await readInternalProjectStorage(revokedKey(record.id))?record:null;
}
export async function setAccountSession(account:RecipeAccount){
 const grant=await accountAccess(account);if(!grant)throw new RecipeError('Your access was revoked. Ask a family editor for a new invitation.',403);
 const expires=Date.now()+30*86400000;
 (await cookies()).set(recipeCookie,signValue({actor:grant.actor,expires,accountId:account.id,accountVersion:account.version}),{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:30*86400});
 return grant.actor;
}
export async function requireActor() { const actor=await currentActor(); if(!actor)throw new RecipeError('Sign in or open your family invitation first.',401); return actor; }
export async function setRecipeSession(actor:Actor, invitation?:Invitation) {
  const expires=invitation?.expires ?? Date.now()+30*86400000;
  const value=signValue({actor,expires,...(invitation?{inviteId:invitation.id,tokenHash:invitation.tokenHash}:{})});
  (await cookies()).set(recipeCookie,value,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:Math.floor((expires-Date.now())/1000)});
}
export function familyPasswordMatches(value:unknown) {
  return typeof value==='string' && Boolean(process.env.CARUSO_RECIPE_ADD_TOKEN) && safeEqual(value,process.env.CARUSO_RECIPE_ADD_TOKEN!);
}
export async function createInvitation(actor:Actor, days=30, request?:{id:string;createdAt:string;email?:string}) {
  if(request && (!/^[a-f0-9-]{36}$/i.test(request.id) || !Number.isFinite(Date.parse(request.createdAt))))throw new RecipeError('Please start a fresh invitation.');
  const id=request?digest(`caruso-invitation-request:${request.id}`).slice(0,32):randomBytes(16).toString('hex');
  const token=createHmac('sha256',secret()).update(`caruso-invitation-token:${id}`).digest('base64url');
  const fingerprint=digest(JSON.stringify({name:actor.name,role:actor.role,ownerId:actor.ownerId,email:request?.email??'',createdAt:request?.createdAt??''}));
  if(request){const existing=await readInternalProjectStorage<Invitation>(inviteKey(id));if(existing){
    if(existing.requestFingerprint!==fingerprint)throw new RecipeError('This invitation request changed. Start a new invitation.',409);
    if(existing.revoked || existing.expires<=Date.now() || await readInternalProjectStorage(revokedKey(id)))throw new RecipeError('This invitation was revoked or expired. Start a new invitation.',409);
    if(existing.tokenHash!==digest(token))throw new RecipeError('This invitation can no longer be retried. Start a new one.',409);
    return {record:existing,token:`${id}.${token}`};
  }}
  const createdAt=request?.createdAt??new Date().toISOString();
  if(Math.abs(Date.now()-Date.parse(createdAt))>5*60000)throw new RecipeError('Please start a fresh invitation.');
  const record:Invitation={id,actor:{...actor,id:`invite-${id}`},tokenHash:digest(token),expires:Date.parse(createdAt)+days*86400000,revoked:false,createdAt,...(request?{requestFingerprint:fingerprint}:{}),...(request?.email?{recipientEmail:request.email}:{})};
  const saved=await writeInternalProjectStorage(inviteKey(id),record);
  if(JSON.stringify(saved)!==JSON.stringify(record))throw new RecipeError('Invitation storage did not confirm the invitation.',503);
  return {record,token:`${id}.${token}`};
}
export async function recordInvitationEmail(record:Invitation, messageId:string) {
  const next={id:record.id,messageId,sentAt:new Date().toISOString()};const saved=await writeInternalProjectStorage(`caruso-recipe-invite-email-${record.id}`,next);
  if(JSON.stringify(saved)!==JSON.stringify(next))throw new RecipeError('Email confirmation could not be saved.',503);
}
export async function invitationEmailReceipt(id:string){return readInternalProjectStorage<{messageId:string}>(`caruso-recipe-invite-email-${id}`);}
export async function invitationForResend(id:unknown){
 if(typeof id!=='string'||!/^[a-f0-9]{32}$/.test(id))throw new RecipeError('Choose an invitation.');
 const record=await readInternalProjectStorage<Invitation>(inviteKey(id));
 if(!record||record.revoked||record.expires<=Date.now()||await readInternalProjectStorage(revokedKey(id)))throw new RecipeError('This invitation expired or was revoked.',409);
 if(!record.recipientEmail)throw new RecipeError('This invitation has no saved email address. Create an emailed invitation for this person.');
 const key=createHmac('sha256',secret()).update(`caruso-invitation-token:${id}`).digest('base64url');
 if(!safeEqual(record.tokenHash,digest(key)))throw new RecipeError('This older invitation cannot be resent. Create a new invitation for this person.',409);
 return {record,token:`${id}.${key}`};
}
export async function resendEmailReceipt(id:string,deliveryId:string){return readInternalProjectStorage<{messageId:string}>(`caruso-recipe-update-email-${id}-${deliveryId}`);}
export async function recordResendEmail(id:string,deliveryId:string,messageId:string){
 const value={id,deliveryId,messageId,sentAt:new Date().toISOString()};const saved=await writeInternalProjectStorage(`caruso-recipe-update-email-${id}-${deliveryId}`,value);
 if(JSON.stringify(saved)!==JSON.stringify(value))throw new RecipeError('Email confirmation could not be saved.',503);
}
export async function acceptInvitation(token:unknown) {
  if(typeof token!=='string'||!/^([a-f0-9]{32})\.([A-Za-z0-9_-]{43})$/.test(token))throw new RecipeError('This invitation is invalid.',401);
  const [id,key]=token.split('.');
  const record=await readInternalProjectStorage<Invitation>(inviteKey(id));
  if(!record||record.revoked||record.expires<=Date.now()||!safeEqual(record.tokenHash,digest(key))||await readInternalProjectStorage(revokedKey(id)))throw new RecipeError('This invitation has expired or was revoked. Ask a family editor for a new one.',401);
  await setRecipeSession(record.actor,record);return record.actor;
}
export async function revokeInvitation(id:string) {
  if(!/^[a-f0-9]{32}$/.test(id))throw new RecipeError('Invalid invitation.');
  const record=await readInternalProjectStorage<Invitation>(inviteKey(id));
  if(!record)throw new RecipeError('Invitation not found.',404);
  const tombstone={id,revoked:true};const confirmed=await writeInternalProjectStorage(revokedKey(id),tombstone);
  if(JSON.stringify(confirmed)!==JSON.stringify(tombstone))throw new RecipeError('Invitation revocation was not confirmed.',503);
  const next={...record,revoked:true};const saved=await writeInternalProjectStorage(inviteKey(id),next);
  if(JSON.stringify(saved)!==JSON.stringify(next))throw new RecipeError('Invitation revocation was not confirmed.',503);
}
export function checkOrigin(request:Request) {
  const origin=request.headers.get('origin');
  let sameOrigin=false;
  try {const url=new URL(origin||'');sameOrigin=url.host===request.headers.get('host') && (url.protocol==='https:' || (process.env.NODE_ENV!=='production' && url.protocol==='http:'));}catch{}
  if(!sameOrigin)throw new RecipeError('Open this action on the Recipe Book website.',403);
}
export async function readBody(request:Request,max=100000) {
  const raw=await request.text();if(Buffer.byteLength(raw)>max)throw new RecipeError('This request is too large.',413);
  try{return JSON.parse(raw);}catch{throw new RecipeError('This request is not valid JSON.');}
}
export function errorResponse(e:unknown) {
  if(e instanceof RecipeError)return Response.json({ok:false,error:e.message},{status:e.status,headers:{'Cache-Control':'private, no-store'}});
  console.error('Recipe service:',e instanceof Error?e.message:'Unavailable');
  return Response.json({ok:false,error:'Recipe storage is temporarily unavailable. No replacement data was used.'},{status:503,headers:{'Cache-Control':'private, no-store'}});
}
