import {getLang} from '../config/i18n.js';
import {formatDateTime} from '../domain/timeline.js';
export const $=(s,root=document)=>root.querySelector(s);
export const $$=(s,root=document)=>[...root.querySelectorAll(s)];
export const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
export const fmt=v=>formatDateTime(v,getLang()==='th'?'th-TH':'en-GB');
export const val=(name,root)=>$(`[name="${name}"]`,root)?.value??'';
export const checked=(name,root)=>$$(`[name="${name}"]:checked`,root).map(x=>x.value);
