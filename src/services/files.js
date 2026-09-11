const MAX_IMPORT_BYTES=5*1024*1024;
export function safeFilename(value){return String(value||'bhh-drug-allergy-case').replace(/[^a-zA-Z0-9._-]+/g,'_').slice(0,100)||'case'}
export function downloadJson(data,filename){
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export async function readJsonFile(file){
  if(!file)throw new Error('file_required');
  if(file.size>MAX_IMPORT_BYTES)throw new Error('file_too_large');
  if(file.type&&file.type!=='application/json'&&!file.name.toLowerCase().endsWith('.json'))throw new Error('json_required');
  const text=await file.text();
  if(!text.trim())throw new Error('empty_file');
  return JSON.parse(text);
}
export async function copyText(text){
  if(globalThis.navigator?.clipboard&&globalThis.isSecureContext){await navigator.clipboard.writeText(text);return}
  const area=document.createElement('textarea');area.value=text;area.style.position='fixed';area.style.opacity='0';document.body.appendChild(area);area.select();document.execCommand('copy');area.remove();
}
