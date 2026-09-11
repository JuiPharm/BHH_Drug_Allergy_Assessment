import {$,val as readVal,checked as readChecked} from './dom.js';
export function createDialogController(){
  const dialog=$('#formDialog'),body=$('#dialogBody'),title=$('#dialogTitle'),kicker=$('#dialogKicker'),save=$('#dialogSave');
  let onSave=null;
  save.addEventListener('click',()=>onSave?.());
  dialog.addEventListener('close',()=>{onSave=null;body.innerHTML=''});
  return {
    open({title:heading,kicker:tag='',html,onSave:handler}){title.textContent=heading;kicker.textContent=tag;body.innerHTML=html;onSave=handler;dialog.showModal()},
    close(){if(dialog.open)dialog.close()},
    val(name){return readVal(name,body)},
    checked(name){return readChecked(name,body)},
    body
  };
}
