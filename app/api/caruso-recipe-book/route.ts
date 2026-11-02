import { hasSecretProjectAccess } from '@/lib/secret-project-access';
import { currentActor, errorResponse, familyPasswordMatches, readBody, checkOrigin } from '@/lib/caruso-recipe-auth';
import { applyChange, RecipeError, type Draft } from '@/lib/caruso-recipe-management';
import { loadBook, saveBook, uploadPhoto } from '@/lib/caruso-recipe-storage';
export const runtime='nodejs';
export const maxDuration=60;
export async function GET(request:Request) {
  try {
    const actor=await currentActor();
    if(!actor && !(await hasSecretProjectAccess('recipes_for_benny')))throw new RecipeError('Recipe Book access required.',403);
    const {store}=await loadBook();
    if(new URL(request.url).searchParams.get('live')==='1')return Response.json({ok:true,version:1,entries:store.records.filter(r=>!r.deletedAt).map(r=>({recipe:r.recipe,owner:store.profiles.find(p=>p.id===r.recipe.owner)})),profiles:store.profiles},{headers:{'Cache-Control':'private, no-store'}});
    return Response.json({ok:true,owners:store.profiles.map(p=>({id:p.id,name:p.name}))},{headers:{'Cache-Control':'private, no-store'}});
  }catch(e){return errorResponse(e);}
}
// Existing review links remain usable. All new skills use the signed review flow.
export async function POST(request:Request) {
  try {
    checkOrigin(request);
    const password=request.headers.get('authorization')?.replace(/^Bearer\s+/i,'');
    if(!familyPasswordMatches(password))throw new RecipeError('Unauthorized.',401);
    const body=await readBody(request,4_200_000);
    if(!body.recipe||!body.owner||!body.image)throw new RecipeError('The recipe is incomplete.');
    if(body.image.base64)body.image={url:await uploadPhoto(body.image,body.recipe.id)};
    const owner={...body.owner,initials:body.owner.initials||body.owner.name?.slice(0,2)||body.owner.id.slice(0,2)};
    const draft:Draft={action:'add',recipe:body.recipe,owner,image:body.image};
    const {store,sha}=await loadBook();
    const result=applyChange(store,{id:'family-editor',name:'Family editor',role:'editor',ownerId:'sammy'},draft,0,`legacy-add-${body.recipe.id}`,new Date().toISOString());
    if(!result.replayed)await saveBook(sha,result.store,`Add ${body.recipe.title} through legacy review`);
    return Response.json({ok:true,recipeId:result.change.recipeId,publication:'live',recipeUrl:`/projects/secret/recipes_for_benny?recipe=${encodeURIComponent(result.change.recipeId)}`});
  }catch(e){return errorResponse(e);}
}
