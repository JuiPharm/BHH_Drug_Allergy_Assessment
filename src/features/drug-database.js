import {$,$$,esc} from '../ui/dom.js';
import {getLang} from '../config/i18n.js';
import {toast} from '../ui/feedback.js';
import {downloadJson,readJsonFile} from '../services/files.js';
import {createEmptyDrugOverrides,mergeDrugDatabase,searchDrugDatabase,validateDrugEntry,drugNameKey} from '../domain/drug-database.js';
import {loadDrugMaster,loadDrugOverrides,saveDrugOverrides,hasDrugAdminPin,setDrugAdminPin,verifyDrugAdminPin,makeLocalDrugEntry} from '../services/drug-database.js';

export function createDrugDatabaseFeature({dialog}){
  let master=null,database=[],unlocked=false,query='',showInactive=false,lockTimer=null;
  const lang=()=>getLang();
  const th=()=>lang()==='th';
  function armAutoLock(){clearTimeout(lockTimer);if(unlocked)lockTimer=setTimeout(()=>{unlocked=false;render();toast(th()?'Drug Database ถูกล็อกอัตโนมัติ':'Drug Database auto-locked')},10*60*1000)}
  function currentOverrides(){return loadDrugOverrides()}
  function rebuild(){database=mergeDrugDatabase(master,currentOverrides());window.dispatchEvent(new CustomEvent('drugdb:changed',{detail:{database}}));render()}
  function statusText(){return unlocked?(th()?'ปลดล็อกสำหรับการแก้ไข':'Unlocked for editing'):(th()?'โหมดอ่านอย่างเดียว':'Read-only')}
  function render(){
    const root=$('#drugDbWorkspace');if(!root||!master)return;
    const active=database.filter(x=>x.active!==false).length,inactive=database.length-active,local=database.filter(x=>x.source==='local').length;
    $('#drugDbCount').textContent=active;$('#drugDbLocalCount').textContent=local;$('#drugDbInactiveCount').textContent=inactive;
    $('#drugDbLockState').textContent=statusText();$('#drugDbLockState').className=`badge ${unlocked?'complete':'concomitant'}`;
    $('#drugDbUnlockBtn').textContent=unlocked?(th()?'ล็อก':'Lock'):(hasDrugAdminPin()?(th()?'ปลดล็อกด้วย PIN':'Unlock with PIN'):(th()?'ตั้ง PIN สำหรับเครื่องนี้':'Set PIN on this device'));
    $('#drugDbAddBtn').disabled=!unlocked;$('#drugDbImportChangesBtn').disabled=!unlocked;$('#drugDbResetBtn').disabled=!unlocked;
    const results=searchDrugDatabase(database,query,{limit:200,includeInactive:showInactive});
    $('#drugDbResultMeta').textContent=(th()?`แสดง ${results.length} จาก ${database.length} รายการ`:`Showing ${results.length} of ${database.length} entries`)+(results.length===200?(th()?' · จำกัด 200 รายการ โปรดค้นหาให้แคบลง':' · limited to 200; narrow your search'):'');
    $('#drugDbList').innerHTML=results.map(item=>`<article class="drugdb-row ${item.active===false?'inactive':''}"><div><h3>${esc(item.genericName)}</h3><p>${esc(item.products?.[0]?.displayName||'')} ${item.products?.length>1?`· +${item.products.length-1}`:''}</p></div><div><span class="badge ${item.source==='local'?'suspected':'concomitant'}">${item.source==='local'?'LOCAL':'BHH MASTER'}</span>${item.active===false?` <span class="badge severe">${th()?'ปิดใช้งาน':'Inactive'}</span>`:''}</div><div class="record-actions"><button class="btn btn-ghost btn-small" data-db-view="${esc(item.id)}">${th()?'รายละเอียด':'Details'}</button>${unlocked?`<button class="btn btn-secondary btn-small" data-db-edit="${esc(item.id)}">${th()?'แก้ไข':'Edit'}</button><button class="btn btn-danger-soft btn-small" data-db-toggle="${esc(item.id)}">${item.active===false?(th()?'คืนค่า':'Restore'):(th()?'นำออก':'Remove')}</button>`:''}</div></article>`).join('')||`<div class="empty-state compact"><h3>${th()?'ไม่พบรายการ':'No matching entries'}</h3></div>`;
  }
  async function initData(){try{master=await loadDrugMaster();database=mergeDrugDatabase(master,currentOverrides());render();window.dispatchEvent(new CustomEvent('drugdb:ready',{detail:{database}}))}catch(e){console.error(e);$('#drugDbLoadError').hidden=false;$('#drugDbLoadError').textContent=th()?'โหลดฐานข้อมูลยาไม่สำเร็จ — Generic name ยังสามารถพิมพ์เองได้':'Drug database could not load — Generic name can still be entered manually.'}}
  function openPinDialog(){
    if(unlocked){unlocked=false;clearTimeout(lockTimer);render();return}
    const exists=hasDrugAdminPin();
    dialog.open({title:exists?(th()?'ปลดล็อก Drug Database':'Unlock Drug Database'):(th()?'ตั้ง PIN สำหรับ Drug Database':'Set Drug Database PIN'),kicker:'DRUG DATABASE',html:exists?`<div class="form-grid"><label><span class="field-required">PIN</span><input name="pin" inputmode="numeric" type="password" maxlength="8" autocomplete="off"></label><p class="helper-text">${th()?'PIN นี้เป็น local edit lock ของ browser ไม่ใช่ระบบยืนยันตัวตนหรือ security boundary':'This PIN is a local browser edit lock, not an authentication or security boundary.'}</p></div>`:`<div class="form-grid cols-2"><label><span class="field-required">PIN</span><input name="pin" inputmode="numeric" type="password" maxlength="8" autocomplete="off"></label><label><span class="field-required">${th()?'ยืนยัน PIN':'Confirm PIN'}</span><input name="pin2" inputmode="numeric" type="password" maxlength="8" autocomplete="off"></label><p class="span-2 helper-text">${th()?'กำหนด PIN ตัวเลข 4–8 หลักสำหรับเครื่อง/browser นี้ การล้าง browser storage สามารถลบ PIN ได้':'Set a 4–8 digit PIN for this browser/device. Clearing browser storage can remove it.'}</p></div>`,onSave:async()=>{const pin=dialog.val('pin');if(!/^\d{4,8}$/.test(pin))return dialog.error(th()?'PIN ต้องเป็นตัวเลข 4–8 หลัก':'PIN must contain 4–8 digits',{fields:['pin']});if(exists){if(!(await verifyDrugAdminPin(pin)))return dialog.error(th()?'PIN ไม่ถูกต้อง':'Incorrect PIN',{fields:['pin']})}else{if(pin!==dialog.val('pin2'))return dialog.error(th()?'PIN ทั้งสองช่องไม่ตรงกัน':'PIN values do not match',{fields:['pin','pin2']});await setDrugAdminPin(pin)}unlocked=true;armAutoLock();dialog.close();render()}})
  }
  function editEntry(id=null){
    if(!unlocked)return;armAutoLock();const item=id?database.find(x=>x.id===id):null;
    dialog.open({title:item?(th()?'แก้ไข Generic name':'Edit generic name'):(th()?'เพิ่ม Generic name':'Add generic name'),kicker:'DRUG DATABASE',html:`<div class="form-grid cols-2"><label class="span-2"><span class="field-required">Generic name</span><input name="generic" value="${esc(item?.genericName||'')}"></label>${!item?`<label>${th()?'Product / Trade name (ถ้ามี)':'Product / Trade name (optional)'}<input name="product"></label><label>${th()?'Dosage form (ถ้ามี)':'Dosage form (optional)'}<input name="form"></label>`:''}</div>`,onSave:()=>{const v=validateDrugEntry({genericName:dialog.val('generic')});if(!v.valid)return dialog.error(th()?'กรุณาระบุ Generic name':'Generic name is required',{fields:['generic']});const duplicate=database.find(x=>x.id!==id&&drugNameKey(x.genericName)===drugNameKey(v.name)&&x.active!==false);if(duplicate)return dialog.error(th()?'มี Generic name นี้ในฐานข้อมูลแล้ว':'This generic name already exists',{fields:['generic']});const ov=currentOverrides();if(!item){ov.added.push(makeLocalDrugEntry({genericName:v.name,productName:dialog.val('product'),dosageForm:dialog.val('form')}))}else if(item.source==='local'){const local=ov.added.find(x=>x.id===id);if(local){local.genericName=v.name;local.updatedAt=new Date().toISOString()}}else{ov.updated[id]={...(ov.updated[id]??{}),genericName:v.name,updatedAt:new Date().toISOString()}}saveDrugOverrides(ov);dialog.close();rebuild()}})
  }
  function toggleEntry(id){if(!unlocked)return;armAutoLock();const item=database.find(x=>x.id===id);if(!item)return;const ov=currentOverrides();if(item.source==='local'){
      const local=ov.added.find(x=>x.id===id);if(local)local.active=item.active===false;
    }else{const set=new Set(ov.disabled);item.active===false?set.delete(id):set.add(id);ov.disabled=[...set]}
    saveDrugOverrides(ov);rebuild();
  }
  function viewEntry(id){const item=database.find(x=>x.id===id);if(!item)return;dialog.open({title:item.genericName,kicker:'DRUG DATABASE',html:`<div class="drugdb-detail"><p><b>${th()?'แหล่งข้อมูล':'Source'}:</b> ${item.source==='local'?'Local override':'BHH master'}</p><p><b>${th()?'สถานะ':'Status'}:</b> ${item.active===false?(th()?'ปิดใช้งาน':'Inactive'):(th()?'ใช้งาน':'Active')}</p><h3>${th()?'ผลิตภัณฑ์ในไฟล์ต้นทาง':'Products in source file'}</h3><div class="mini-list">${(item.products??[]).slice(0,30).map(p=>`<div class="mini-row"><div><strong>${esc(p.displayName||'-')}</strong><small>${esc([p.itemCode,p.dosageForm,p.tmtCode].filter(Boolean).join(' · '))}</small></div></div>`).join('')||'<div>—</div>'}</div></div>`,onSave:()=>dialog.close()})}
  function exportChanges(){downloadJson({schemaVersion:'1.0',exportedAt:new Date().toISOString(),sourceDatabaseVersion:master?.databaseVersion??'',overrides:currentOverrides()},`BHH_DrugDB_Overrides_${new Date().toISOString().slice(0,10)}.json`)}
  function exportMerged(){downloadJson({...master,databaseVersion:`${master?.databaseVersion??'unknown'}+local`,generatedAt:new Date().toISOString(),generics:database.filter(x=>x.active!==false).map(({source,...x})=>x)},`BHH_Drug_Master_Merged_${new Date().toISOString().slice(0,10)}.json`)}
  async function importChanges(file){if(!unlocked)return;armAutoLock();try{const json=await readJsonFile(file),ov=json?.overrides??json;if(!Array.isArray(ov?.added)||!ov?.updated||!Array.isArray(ov?.disabled))throw new Error('invalid_overrides');saveDrugOverrides({...createEmptyDrugOverrides(),...ov});rebuild();toast(th()?'นำเข้า Drug Database changes แล้ว':'Drug database changes imported')}catch(e){console.error(e);toast(th()?'ไฟล์ Drug Database ไม่ถูกต้อง':'Invalid drug database file')}}
  function resetLocal(){if(!unlocked)return;if(!confirm(th()?'ลบการเพิ่ม/แก้ไข/นำออกรายการยาเฉพาะเครื่องนี้ทั้งหมดหรือไม่?':'Remove all local drug database changes on this device?'))return;saveDrugOverrides(createEmptyDrugOverrides());rebuild()}
  function switchTab(name){
    $$('[data-app-tab]').forEach(b=>{const active=b.dataset.appTab===name;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active))});
    $$('[data-app-panel]').forEach(p=>p.hidden=p.dataset.appPanel!==name);
    ['#unsavedBadge','#importBtn','#exportBtn','#printBtn'].forEach(sel=>{const el=$(sel);if(el)el.hidden=name==='drugdb'});
    if(name==='drugdb')document.getElementById('drugDbSearch')?.focus();
  }
  function init(){
    $$('[data-app-tab]').forEach(b=>b.addEventListener('click',()=>switchTab(b.dataset.appTab)));
    $('#drugDbSearch').addEventListener('input',e=>{query=e.target.value;render()});$('#drugDbShowInactive').addEventListener('change',e=>{showInactive=e.target.checked;render()});
    $('#drugDbUnlockBtn').addEventListener('click',openPinDialog);$('#drugDbAddBtn').addEventListener('click',()=>editEntry());$('#drugDbExportChangesBtn').addEventListener('click',exportChanges);$('#drugDbExportMergedBtn').addEventListener('click',exportMerged);$('#drugDbImportChangesBtn').addEventListener('click',()=>$('#drugDbFileInput').click());$('#drugDbFileInput').addEventListener('change',e=>{importChanges(e.target.files?.[0]);e.target.value=''});$('#drugDbResetBtn').addEventListener('click',resetLocal);
    $('#drugDbList').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.dbView)viewEntry(b.dataset.dbView);if(b.dataset.dbEdit)editEntry(b.dataset.dbEdit);if(b.dataset.dbToggle)toggleEntry(b.dataset.dbToggle)});
    initData();
  }
  return {init,render,rebuild,getDatabase:()=>database};
}
