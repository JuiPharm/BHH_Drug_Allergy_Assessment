import {$,val as readVal,checked as readChecked} from './dom.js';

export function createDialogController(){
  const dialog=$('#formDialog'),body=$('#dialogBody'),title=$('#dialogTitle'),kicker=$('#dialogKicker'),save=$('#dialogSave'),feedback=$('#dialogFeedback');
  let onSave=null;

  function clearError(){
    if(feedback){feedback.hidden=true;feedback.textContent='';}
    body.querySelectorAll('[aria-invalid="true"]').forEach(el=>el.removeAttribute('aria-invalid'));
  }

  function error(message,{fields=[]}={}){
    if(feedback){feedback.textContent=message;feedback.hidden=false;}
    const targets=fields.map(name=>body.querySelector(`[name="${name}"]`)).filter(Boolean);
    targets.forEach(el=>el.setAttribute('aria-invalid','true'));
    targets[0]?.focus({preventScroll:false});
    feedback?.scrollIntoView({block:'nearest',behavior:'smooth'});
    return false;
  }

  save.addEventListener('click',()=>{clearError();onSave?.();});
  body.addEventListener('input',e=>{if(e.target.matches('[aria-invalid="true"]'))e.target.removeAttribute('aria-invalid')});
  body.addEventListener('change',e=>{if(e.target.matches('[aria-invalid="true"]'))e.target.removeAttribute('aria-invalid')});
  dialog.addEventListener('close',()=>{onSave=null;body.innerHTML='';clearError()});

  return {
    open({title:heading,kicker:tag='',html,onSave:handler}){clearError();title.textContent=heading;kicker.textContent=tag;body.innerHTML=html;onSave=handler;dialog.showModal()},
    close(){if(dialog.open)dialog.close()},
    error,
    clearError,
    val(name){return readVal(name,body)},
    checked(name){return readChecked(name,body)},
    body,
    isOpen(){return dialog.open}
  };
}
