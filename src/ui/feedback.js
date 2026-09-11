import {$} from './dom.js';
let timer=null;
export function toast(message){
  const modal=$('#formDialog'),dialogFeedback=$('#dialogFeedback');
  if(modal?.open&&dialogFeedback){
    dialogFeedback.textContent=message;
    dialogFeedback.hidden=false;
    dialogFeedback.scrollIntoView({block:'nearest'});
    return;
  }
  const el=$('#toast');if(!el)return;
  el.textContent=message;el.classList.add('show');clearTimeout(timer);timer=setTimeout(()=>el.classList.remove('show'),2400);
}
