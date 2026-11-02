import { RecipeError } from './caruso-recipe-management';
export type RecipeAccount = {id:string;email:string;name:string;version:string;inviteIds:string[]};
export async function recipeAccountService(action:Record<string,unknown>):Promise<RecipeAccount> {
 const secret=process.env.FUNNEL_CRM_API_SECRET||process.env.CRM_API_SECRET;
 if(!secret)throw new RecipeError('Account sign-in is temporarily unavailable.',503);
 const r=await fetch(process.env.CARUSO_RECIPE_ACCOUNTS_ENDPOINT||'https://daytongrowthco-crm.vercel.app/api/internal/recipe-accounts',{method:'POST',cache:'no-store',redirect:'error',signal:AbortSignal.timeout(15000),headers:{Authorization:`Bearer ${secret}`,'Content-Type':'application/json'},body:JSON.stringify(action)});
 const body=await r.json().catch(()=>null);
 if(!r.ok||!body?.account)throw new RecipeError(body?.error||'Account sign-in is temporarily unavailable.',[400,401,409,429].includes(r.status)?r.status:503);
 const account=body.account;let ids:unknown=account.inviteIds;
 try{for(let depth=0;typeof ids==='string'&&depth<4;depth++)ids=JSON.parse(ids);}catch{throw new RecipeError('Account access could not be read. Please try again.',503);}
 if(!Array.isArray(ids)||ids.length>100||!ids.every(id=>typeof id==='string'&&/^[a-f0-9]{32}$/.test(id)))throw new RecipeError('Account access could not be read. Please try again.',503);
 return {...account,inviteIds:[...new Set(ids)]};
}
