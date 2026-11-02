import { cookies } from 'next/headers';
import { acceptInvitation, checkOrigin, errorResponse, familyPasswordMatches, readBody, recipeCookie, setRecipeSession,setAccountSession,digest } from '@/lib/caruso-recipe-auth';
import {recipeAccountService} from '@/lib/caruso-recipe-accounts';
import { RecipeError } from '@/lib/caruso-recipe-management';
export const runtime='nodejs';
export async function POST(request:Request) {
  try {
    checkOrigin(request);const body=await readBody(request,2000);
    if(body.email){const account=await recipeAccountService({action:'login',email:body.email,password:body.password,source:digest(request.headers.get('x-vercel-forwarded-for')||request.headers.get('x-forwarded-for')||'unknown')});return Response.json({ok:true,actor:await setAccountSession(account)},{headers:{'Cache-Control':'private, no-store'}});}
    if(body.invitation) {const actor=await acceptInvitation(body.invitation);return Response.json({ok:true,actor});}
    if(!familyPasswordMatches(body.password))throw new RecipeError('That password was not accepted.',401);
    const actor={id:'family-editor',name:'Family editor',role:'editor' as const,ownerId:'sammy'};
    await setRecipeSession(actor);return Response.json({ok:true,actor});
  }catch(e){return errorResponse(e);}
}
export async function DELETE(request:Request) {
  try {checkOrigin(request);(await cookies()).delete(recipeCookie);return Response.json({ok:true});}catch(e){return errorResponse(e);}
}
