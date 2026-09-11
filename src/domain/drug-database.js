export function normalizeDrugName(value){
  return String(value??'').normalize('NFKC').trim().replace(/\s+/g,' ');
}
export function drugNameKey(value){return normalizeDrugName(value).toLocaleLowerCase('en-US')}
export function createEmptyDrugOverrides(){return {schemaVersion:'1.0',added:[],updated:{},disabled:[]}}
export function validateDrugEntry(entry){
  const errors=[];const name=normalizeDrugName(entry?.genericName);
  if(!name)errors.push('generic_name_required');
  if(name.length>180)errors.push('generic_name_too_long');
  return {valid:errors.length===0,errors,name};
}
export function mergeDrugDatabase(master,overrides=createEmptyDrugOverrides()){
  const updated=overrides?.updated&&typeof overrides.updated==='object'?overrides.updated:{};
  const disabled=new Set(Array.isArray(overrides?.disabled)?overrides.disabled:[]);
  const base=(master?.generics??[]).map(item=>({...item,...(updated[item.id]??{}),active:!disabled.has(item.id)&&(updated[item.id]?.active??item.active??true),source:'master'}));
  const added=(Array.isArray(overrides?.added)?overrides.added:[]).map(item=>({...item,active:item.active!==false,source:'local'}));
  const map=new Map();
  for(const item of [...base,...added])map.set(item.id,item);
  return [...map.values()].sort((a,b)=>normalizeDrugName(a.genericName).localeCompare(normalizeDrugName(b.genericName),'en',{sensitivity:'base'}));
}
export function findExactDrug(database,name){const key=drugNameKey(name);return(database??[]).find(x=>x.active!==false&&drugNameKey(x.genericName)===key)??null}
export function searchDrugDatabase(database,query,{limit=100,includeInactive=false}={}){
  const q=drugNameKey(query);const words=q.split(' ').filter(Boolean);
  const scored=[];
  for(const item of database??[]){
    if(!includeInactive&&item.active===false)continue;
    const generic=drugNameKey(item.genericName);
    const productText=(item.products??[]).map(p=>`${p.displayName??''} ${p.itemCode??''} ${p.tmtCode??''}`).join(' ').toLocaleLowerCase('en-US');
    if(!q){scored.push([0,item]);continue}
    let score=0;
    if(generic===q)score=100;
    else if(generic.startsWith(q))score=80;
    else if(generic.includes(q))score=60;
    else if(words.every(w=>generic.includes(w)))score=50;
    else if(productText.includes(q))score=30;
    if(score)scored.push([score,item]);
  }
  scored.sort((a,b)=>b[0]-a[0]||normalizeDrugName(a[1].genericName).localeCompare(normalizeDrugName(b[1].genericName),'en',{sensitivity:'base'}));
  return scored.slice(0,limit).map(x=>x[1]);
}
