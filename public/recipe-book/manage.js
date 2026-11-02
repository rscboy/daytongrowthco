'use strict';
const $=id=>document.getElementById(id);
const API='/api/caruso-recipe-book';
let book=null, draft=null, prepared=null, selected=null, tabName=['invite','account'].includes(new URLSearchParams(location.search).get('tab'))?new URLSearchParams(location.search).get('tab'):'recipes', busy=false, inviteId=null, invitation=null, photoBusy=false, inviteEmailRequest=null, accountInfo=null, accountRequest=null;
const fallbackPhoto='https://www.daytongrowth.co/recipe-book/all-recipes-family.jpg';
function status(message='',error=false){$('status').textContent=message;$('status').className=error?'error':'';}
function node(parent,tag,text,className){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;parent.append(n);return n;}
function button(parent,label,fn,cls='quiet'){const b=node(parent,'button',label,cls);b.type='button';b.addEventListener('click',()=>run(fn));return b;}
async function api(path='',body,method=body?'POST':'GET'){
 const r=await fetch(API+path,{method,credentials:'same-origin',redirect:'error',cache:'no-store',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(55000)});
 const result=await r.json();if(!r.ok||result.ok!==true)throw new Error(result.error||'The request could not be completed.');return result;
}
async function run(fn){if(busy||photoBusy)return;busy=true;document.querySelectorAll('button').forEach(b=>b.disabled=true);status();try{await fn();}catch(e){status(e.message||'Something went wrong.',true);}finally{busy=false;document.querySelectorAll('button').forEach(b=>b.disabled=false);if(prepared)$('approve').disabled=prepared.duplicates.length>0&&!prepared.draft.allowDuplicate;}}
function owner(id){return book.profiles.find(p=>p.id===id)||{id,name:id,initials:id.slice(0,2)};}
function panels(){for(const id of ['editor','review','success'])$(id).hidden=true;}
async function load(){
 book=await api('/manage');$('sign-in').hidden=!!book.actor||!!invitation;$('workspace').hidden=!book.actor;
 if(!book.actor)return;
 $('identity').textContent=book.actor.name+' · '+(book.actor.role==='editor'?'Family editor':'Your collection');$('invite-tab').hidden=book.actor.role!=='editor';
 if(!book.profiles.some(p=>p.id===book.actor.ownerId))book.profiles.push({id:book.actor.ownerId,name:book.actor.name,initials:book.actor.name.slice(0,2)});
 const previousInviteOwner=$('invite-owner').value;
 $('invite-owner').replaceChildren();node($('invite-owner'),'option','Create their collection').value='new';for(const p of book.profiles)node($('invite-owner'),'option',p.name+"'s collection").value=p.id;
 if(Array.from($('invite-owner').options).some(o=>o.value===previousInviteOwner))$('invite-owner').value=previousInviteOwner;
 if(tabName==='account')await loadAccount();
 render();
}
function render(){
 if(!book?.actor)return;
 if(tabName==='invite'&&book.actor.role!=='editor')tabName='recipes';
 const detailVisible=!$('editor').hidden||!$('review').hidden||!$('success').hidden;
 $('recipes-panel').hidden=detailVisible||!['recipes','trash'].includes(tabName);$('history-panel').hidden=detailVisible||tabName!=='history';$('invite-panel').hidden=detailVisible||tabName!=='invite';
 $('account-panel').hidden=detailVisible||tabName!=='account';
 $('new-recipe').hidden=tabName==='trash';$('undo').hidden=tabName==='trash';
 document.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tab===tabName)));
 const normalize=s=>s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();const terms=normalize($('search').value).split(' ').filter(Boolean).filter(t=>t!=='s');const list=$('recipe-list');list.replaceChildren();
 const records=book.records.filter(r=>Boolean(r.deletedAt)===(tabName==='trash')&&terms.every(t=>normalize([r.recipe.title,r.recipe.subtitle,owner(r.recipe.owner).name,...r.recipe.ingredients.flatMap(g=>g.items)].join(' ')).includes(t)));
 for(const r of records){
  const c=node(list,'article',undefined,'card');node(c,'h3',r.recipe.title+' '+r.recipe.subtitle);node(c,'p',owner(r.recipe.owner).name+"'s collection",'muted');node(c,'p',r.recipe.description);
  if(draft){button(c,'Select this recipe',()=>selectRecipe(r));continue;}
  if(r.deletedAt){if(r.canManage)button(c,'Restore',()=>review({action:'restore',recipeId:r.recipe.id}));}
  else{if(r.canManage){button(c,'Edit',()=>selectRecipe(r,'edit'));button(c,'Move',()=>selectRecipe(r,'move'));button(c,'Move to trash',()=>review({action:'delete',recipeId:r.recipe.id}),'danger');}button(c,'Make my version',()=>selectRecipe(r,'variation'));}
 }
 if(!records.length)node(list,'p',tabName==='trash'?'No matching recipes in trash.':'No recipes match. Try another name or ingredient.');
 $('selection-help').textContent=draft?'Select the exact recipe for this '+draft.action+'. Nothing is saved until you approve the review.':(tabName==='trash'?'Deleted recipes stay here until you restore them.':'Contributors manage their collection. Family editors can manage the whole book.');
 $('invite-directory').hidden=detailVisible||tabName!=='invite';const directory=$('invitation-list');directory.replaceChildren();for(const invite of book.invitations||[]){const c=node(directory,'article',undefined,'history-item');node(c,'h3',invite.name);node(c,'p',(invite.role==='editor'?'Family editor':'Their collection')+' · '+(invite.revoked?'Revoked':invite.expires<Date.now()?'Private link expired':'Private link expires '+new Date(invite.expires).toLocaleDateString()));if(!invite.revoked)button(c,'Revoke access',async()=>{await api('/invite',{id:invite.id},'DELETE');await load();status('Access revoked.');},'danger');}
 const history=$('history-list');history.replaceChildren();
 for(const h of [...book.history].reverse()){
  const c=node(history,'article',undefined,'history-item');node(c,'h3',h.after.recipe.title+' '+h.after.recipe.subtitle);node(c,'p',h.action+' · '+h.actorName+' · '+new Date(h.at).toLocaleString(),'muted');
  if(h.before)button(c,'Review version before this change',()=>review({action:'revert',recipeId:h.recipeId,historyId:h.id}));
 }
 if(!book.history.length)node(history,'p','Changes will appear here after the first save.');
}
function selectRecipe(record,action){
 selected=record;
 const intent=action?{action,recipeId:record.recipe.id,expectedRevision:record.revision}: {...draft,recipeId:record.recipe.id,expectedRevision:record.revision};draft=null;render();
 if(['delete','restore','revert','undo'].includes(intent.action))return review(intent);
 if(intent.action==='move'){showEditor(intent,record.recipe);return;}
 if(intent.action==='variation'){
  const r={...record.recipe,...intent.recipe,id:intent.recipe?.id||makeId(record.recipe.title+'-'+book.actor.ownerId+'-version')};showEditor(intent,r);return;
 }
 showEditor(intent,{...record.recipe,...intent.changes,...(intent.image?{image:intent.image.url}:{})});
}
function makeId(s){return s.normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60)+'-'+crypto.randomUUID().slice(0,8);}
let editing=null;
function showEditor(intent,recipe){
 panels();prepared=null;editing={intent,recipe,base:selected?.recipe};$('editor').hidden=false;$('editor-title').textContent=intent.action==='move'?'Move this recipe':intent.action==='variation'?'Make your version':intent.action==='add'?'Add a recipe':'Edit this recipe';
 $('collection').replaceChildren();for(const p of book.profiles.filter(p=>book.actor.role==='editor'||p.id===book.actor.ownerId))node($('collection'),'option',p.name+"'s collection").value=p.id;
 $('collection').value=intent.owner?.id||(intent.action==='variation'?book.actor.ownerId:recipe.owner)||book.actor.ownerId;
 const moving=intent.action==='move';for(const id of ['recipe-title','subtitle','description','prep','cook','total','yield','tags','ingredients','steps','note','photo-url','photo'])$(id).disabled=moving;
 $('recipe-title').value=recipe.title||'';for(const key of ['subtitle','description','prep','cook','total','yield','note'])$(key).value=recipe[key]||'';
 $('tags').value=(recipe.tags||[]).join(', ');$('photo-url').value=recipe.image||fallbackPhoto;$('photo').value='';$('photo-status').textContent='';
 $('ingredients').value=(recipe.ingredients||[]).map(g=>'['+g.category+']\n'+g.items.join('\n')).join('\n\n');
 $('steps').value=(recipe.steps||[]).map(s=>s.title+'\n'+s.text).join('\n\n');
 editing.rawInputs=Object.fromEntries(['recipe-title','subtitle','description','prep','cook','total','yield','note','tags','ingredients','steps','photo-url'].map(id=>[id,$(id).value]));
 $('collection').disabled=!moving&&intent.action==='edit';render();$('editor').scrollIntoView({behavior:'smooth',block:'start'});
}
function readEditor(){
 const {intent,recipe}=editing;const target=owner($('collection').value);
 if(intent.action==='move')return {...intent,owner:target};
 const ingredients=[];let group=null;for(const raw of $('ingredients').value.split('\n')){const line=raw.trim();if(!line)continue;if(/^\[.+\]$/.test(line)){group={category:line.slice(1,-1),items:[]};ingredients.push(group);}else{if(!group){group={category:'Ingredients',items:[]};ingredients.push(group);}group.items.push(line);}}
 const steps=$('steps').value.trim().split(/\n\s*\n/).map(s=>{const [title,...lines]=s.split('\n');return {title:title.trim(),text:lines.join('\n').trim()};});
 const changes={title:$('recipe-title').value.trim(),subtitle:$('subtitle').value.trim(),description:$('description').value.trim(),prep:$('prep').value.trim(),cook:$('cook').value.trim(),total:$('total').value.trim(),yield:$('yield').value.trim(),note:$('note').value.trim(),tags:$('tags').value.split(',').map(t=>t.trim()).filter(Boolean),ingredients,steps,image:$('photo-url').value.trim(),color:recipe.color||'gold'};
 for(const [key,id] of [['title','recipe-title'],['subtitle','subtitle'],['description','description'],['prep','prep'],['cook','cook'],['total','total'],['yield','yield'],['note','note'],['tags','tags'],['ingredients','ingredients'],['steps','steps'],['image','photo-url']])if($(id).value===editing.rawInputs?.[id]&&recipe[key]!==undefined)changes[key]=recipe[key];
 const patch=intent.action==='edit'?Object.fromEntries(Object.entries(changes).filter(([k,v])=>JSON.stringify(v)!==JSON.stringify(editing.base?.[k]))):changes;
 const final={...intent};delete final.image;
 return intent.action==='edit'?{action:'edit',recipeId:intent.recipeId,expectedRevision:intent.expectedRevision,changes:patch}:{...final,owner:target,recipe:{...changes,id:recipe.id||makeId(changes.title)}};
}
function displayRecipe(parent,record,label,old){
 const section=node(parent,'div',undefined,'version');node(section,'h3',label);
 if(!record){node(section,'p','New recipe');return;}
 const r=record.recipe;node(section,'p',record.deletedAt?'In trash':'In the recipe book','muted');
 for(const key of ['title','subtitle','description','prep','cook','total','yield','note'])node(section,'p',key+': '+r[key],old&&JSON.stringify(old.recipe[key])!==JSON.stringify(r[key])?'changed':'');
 node(section,'p','Collection: '+owner(r.owner).name,old&&old.recipe.owner!==r.owner?'changed':'');
 const img=node(section,'img');img.src=r.image;img.alt='Recipe photo';img.referrerPolicy='no-referrer';node(section,'p','Tags: '+r.tags.join(', '));
 for(const g of r.ingredients){node(section,'h4',g.category);const ul=node(section,'ul');for(const item of g.items)node(ul,'li',item);}
 const ol=node(section,'ol');for(const step of r.steps){const li=node(ol,'li');node(li,'strong',step.title);node(li,'p',step.text);}
}
async function review(intent){
 prepared=null;if(intent.recipeId&&intent.expectedRevision===undefined){const cached=book.records.find(r=>r.recipe.id===intent.recipeId);if(cached)intent={...intent,expectedRevision:cached.revision};}const result=await api('/manage',{mode:'prepare',draft:intent});prepared=result;draft=null;panels();$('review').hidden=false;render();
 $('review-title').textContent=({add:'Add this recipe?',edit:'Save these changes?',move:'Move this recipe?',delete:'Move this recipe to trash?',restore:'Restore this recipe?',variation:'Save your version?',revert:'Restore this earlier version?'})[result.draft.action]||'Review this change';
 $('review-owner').textContent=result.after.recipe.title+' '+result.after.recipe.subtitle;
 $('comparison').replaceChildren();displayRecipe($('comparison'),result.before,'Before');displayRecipe($('comparison'),result.after,'After',result.before);
 $('duplicate-warning').hidden=!result.duplicates.length;$('duplicates').replaceChildren();$('separate').checked=!!result.draft.allowDuplicate;$('review-separate').hidden=true;
 for(const duplicate of result.duplicates){const p=node($('duplicates'),'p',duplicate.title+' · '+owner(duplicate.owner).name);const current=book.records.find(r=>r.recipe.id===duplicate.id);if(current?.canManage&&['add','variation'].includes(result.draft.action))button(p,'Update this existing recipe instead',()=>{const r={...result.after.recipe};delete r.id;delete r.owner;return review({action:'edit',recipeId:duplicate.id,changes:r});});}
 $('approve').disabled=!!result.duplicates.length&&!result.draft.allowDuplicate;$('approve').textContent=result.draft.action==='delete'?'Approve and move to trash':'Approve and save';
 $('review-explanation').textContent=result.draft.action==='delete'?'The recipe will leave the book. You can restore it from Trash.':'Only the change shown above will be saved. Earlier versions remain in History.';
 $('review').focus();$('review').scrollIntoView({behavior:'smooth',block:'start'});
}
function validateLink(v){
 if(!v||typeof v!=='object'||Array.isArray(v))throw Error('The prepared change is invalid.');
 if(!v.action&&v.recipe&&v.owner&&v.image)return {version:2,action:'add',recipe:v.recipe,owner:v.owner,image:v.image};
 if(!['add','edit','move','delete','restore','revert','undo','variation'].includes(v.action))throw Error('This change needs a supported action.');
 return v;
}
function decode(hash){
 const params=new URLSearchParams(hash.slice(1));invitation=params.get('invite');
 if(invitation){if(!/^[a-f0-9]{32}\.[A-Za-z0-9_-]{43}$/.test(invitation))throw Error('This invitation is invalid.');return null;}
 const encoded=params.get('change')||params.get('recipe');if(!encoded)return null;
 if(encoded.length>32004||!/^[A-Za-z0-9_-]+$/.test(encoded))throw Error('The link is invalid or too long. Use the paste option.');
 const bytes=Uint8Array.from(atob(encoded.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));if(bytes.length>24000)throw Error('Use the paste option for this change.');
 return validateLink(JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes)));
}
async function openDraft(value){
 draft=validateLink(value);prepared=null;panels();if(!book?.actor){status('Sign in or accept your invitation, then review this prepared change.');return;}
 if(draft.action==='add'){const d=draft;draft=null;const p=d.owner||owner(book.actor.ownerId);if(!book.profiles.some(o=>o.id===p.id))book.profiles.push({...p,initials:p.initials||p.name.slice(0,2)});showEditor(d,{...d.recipe,owner:p.id,image:d.image?.url||d.recipe?.image||fallbackPhoto});return;}
 if(draft.action==='undo'){const d=draft;draft=null;return review(d);}
 tabName=draft.action==='restore'?'trash':'recipes';$('search').value=draft.query||'';render();
 if(draft.recipeId){const r=book.records.find(r=>r.recipe.id===draft.recipeId);if(r)return selectRecipe(r);status('That recipe was not found. Select a matching recipe below.',true);}
}
$('login').addEventListener('submit',e=>{e.preventDefault();run(async()=>{try{await api('/session',{password:$('password').value});await load();if(draft)await openDraft(draft);}finally{$('password').value='';}});});
$('accept-invite').addEventListener('click',()=>run(async()=>{await api('/session',{invitation});history.replaceState(null,'',location.pathname+location.search);invitation=null;$('invitation').hidden=true;tabName='account';await load();if(draft){status('Your prepared change is waiting. Set your password first, or continue with your private link.');button($('account-message'),'Continue to my prepared change',()=>openDraft(draft));}}));
$('sign-out').addEventListener('click',()=>run(async()=>{await api('/session',undefined,'DELETE');location.reload();}));
$('search').addEventListener('input',render);
for(const b of document.querySelectorAll('[data-tab]'))b.addEventListener('click',()=>{draft=null;prepared=null;panels();tabName=b.dataset.tab;$('search').value='';render();if(tabName==='account')run(loadAccount);});
$('new-recipe').addEventListener('click',()=>{draft=null;showEditor({action:'add'},{image:fallbackPhoto,color:'gold',owner:book.actor.ownerId});});
$('cancel-edit').addEventListener('click',()=>{panels();editing=null;render();});
$('recipe-form').addEventListener('submit',e=>{e.preventDefault();run(()=>review(readEditor()));});
$('cancel-review').addEventListener('click',()=>{prepared=null;panels();render();});
$('undo').addEventListener('click',()=>run(()=>review({action:'undo'})));
$('separate').addEventListener('change',()=>{$('review-separate').hidden=!$('separate').checked;$('approve').disabled=true;});
$('review-separate').addEventListener('click',()=>run(()=>review({...prepared.draft,allowDuplicate:true})));
$('approve').addEventListener('click',()=>run(async()=>{
 if(!prepared)return;const approval=prepared;
 try{const result=await api('/manage',{mode:'commit',draft:approval.draft,ticket:approval.ticket});prepared=null;panels();$('success').hidden=false;$('success-message').textContent=result.change.action==='delete'?'The recipe is in Trash. Restore it whenever you need it.':'Your change is saved in the book and its history.';$('view-recipe').href='/projects/secret/recipes_for_benny?recipe='+encodeURIComponent(result.recipeId);await load();$('success').scrollIntoView({behavior:'smooth'});}
 catch(e){status(e.message+' If the connection was interrupted, retry this same approval; it will not save twice.',true);}
}));
$('continue').addEventListener('click',()=>{panels();tabName='recipes';render();});
$('load-draft').addEventListener('click',()=>run(async()=>{const raw=$('draft-json').value;if(new TextEncoder().encode(raw).length>24000)throw Error('Keep the prepared change under 24 KB.');await openDraft(JSON.parse(raw));$('paste-option').open=false;}));
$('invite-role').addEventListener('change',()=>{$('invite-permissions').textContent=$('invite-role').value==='editor'?'A family editor can change every recipe and create or revoke invitations. Private links expire after 30 days. Account access continues until revoked.':'They can manage recipes in the selected collection. Private links expire after 30 days. Account access continues until revoked.';});
async function sendInvitationEmail(body){
 status('Creating the invitation and sending the email…');
 const result=await api('/invite',body);inviteId=result.id;$('invitation-url').value=result.url;$('invite-result').hidden=false;
 $('invite-result-title').textContent=result.emailStatus==='sent'?'Invitation emailed.':'Invitation saved. Email not confirmed.';
 $('invite-delivery').textContent=result.emailStatus==='sent'?'Sent to '+body.email+'. They can open the invitation and follow the steps in the email. If it doesn’t arrive, ask them to check spam.':'We couldn’t confirm the email. Retry using the same invitation, or copy the private link and share it yourself.';
 $('retry-invite-email').hidden=result.emailStatus==='sent';await load();status();
}
$('invite-form').addEventListener('submit',e=>{e.preventDefault();run(async()=>{
 const name=$('invite-name').value.trim();const email=$('invite-email').value.trim();const choice=$('invite-owner').value;
 const fingerprint=JSON.stringify({name,email,choice,role:$('invite-role').value});
 if(!inviteEmailRequest||inviteEmailRequest.fingerprint!==fingerprint){const id=choice==='new'?makeId(name):choice;const p=choice==='new'?{id,name,initials:name.slice(0,2)}:owner(id);inviteEmailRequest={fingerprint,body:{name,email,role:$('invite-role').value,owner:p,requestId:crypto.randomUUID(),createdAt:new Date().toISOString()}};}
 await sendInvitationEmail(inviteEmailRequest.body);
});});
$('retry-invite-email').addEventListener('click',()=>run(async()=>{if(inviteEmailRequest)await sendInvitationEmail(inviteEmailRequest.body);}));
$('copy-invite').addEventListener('click',()=>run(async()=>{await navigator.clipboard.writeText($('invitation-url').value);status('Invitation copied. Share it privately.');}));
$('revoke-invite').addEventListener('click',()=>run(async()=>{await api('/invite',{id:inviteId},'DELETE');$('invite-result').hidden=true;status('Invitation revoked. Existing access from this invitation is also revoked.');}));
$('photo').addEventListener('change',()=>run(async()=>{
 const file=$('photo').files[0];if(!file)return;if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>25000000)throw Error('Choose a JPG, PNG, or WebP photo under 25 MB.');
 photoBusy=true;try{
 const bitmap=await createImageBitmap(file);const scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));const c=document.createElement('canvas');c.width=Math.max(1,Math.round(bitmap.width*scale));c.height=Math.max(1,Math.round(bitmap.height*scale));const ctx=c.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(bitmap,0,0,c.width,c.height);bitmap.close();const base64=c.toDataURL('image/jpeg',.85).split(',')[1];if(base64.length*3/4>3000000)throw Error('Choose a smaller photo.');
 const result=await api('/manage',{mode:'photo',image:{base64,mimeType:'image/jpeg'}});$('photo-url').value=result.url;$('photo-status').textContent='Photo ready. Review the change before saving it.';
 }finally{photoBusy=false;}
}));
window.addEventListener('hashchange',()=>run(async()=>{
 const next=decode(location.hash);$('invitation').hidden=!invitation;
 if(next)await openDraft(next);
}));
(async()=>{try{draft=decode(location.hash);$('invitation').hidden=!invitation;await load();if(draft)await openDraft(draft);}catch(e){status(e.message,true);}})();

async function loadAccount(){
 accountInfo=await api('/account');$('account-email').value=accountInfo.email||'';$('account-name').value=accountInfo.name||'';
 $('account-email').readOnly=!!accountInfo.email;$('account-name').readOnly=accountInfo.hasPassword;
 $('current-password-field').hidden=!accountInfo.hasPassword;$('current-password').required=accountInfo.hasPassword;
 $('account-title').textContent=accountInfo.hasPassword?'Your account.':'Set your password.';
 $('account-help').textContent=accountInfo.hasPassword?'You can sign in with your email and password. Use this form if you want to change your password.':'Choose a password for future visits. If this email already has an account, enter its existing password to connect this invitation. You can also continue with your private link.';
 $('save-account').textContent=accountInfo.hasPassword?'Change my password':'Save my password';$('account-continue').textContent=accountInfo.hasPassword?'Recipe home':'Skip password setup and open the book';
}
$('account-login').addEventListener('submit',e=>{e.preventDefault();run(async()=>{try{await api('/session',{email:$('login-email').value,password:$('login-password').value});await load();if(draft)await openDraft(draft);}finally{$('login-password').value='';}});});
$('account-form').addEventListener('submit',e=>{e.preventDefault();run(async()=>{
 try{
  if($('new-password').value!==$('confirm-password').value)throw Error('The passwords do not match.');
  accountRequest??={requestId:crypto.randomUUID(),createdAt:new Date().toISOString()};
  await api('/account',{action:accountInfo?.hasPassword?'password':'register',email:$('account-email').value,name:$('account-name').value,password:$('new-password').value,currentPassword:$('current-password').value,...accountRequest});
  await loadAccount();$('account-message').textContent='Password saved. Bookmark recipes.daytongrowth.co. Next time, choose Sign in and use your email and password.';status('Your password is saved.');
  if(draft)await openDraft(draft);
 }finally{for(const id of ['new-password','confirm-password','current-password'])$(id).value='';}
});});
