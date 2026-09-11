import {$} from './dom.js';
let timer=null;
export function toast(message){const el=$('#toast');if(!el)return;el.textContent=message;el.classList.add('show');clearTimeout(timer);timer=setTimeout(()=>el.classList.remove('show'),1900)}
