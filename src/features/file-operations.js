import {$} from '../ui/dom.js';
import {getLang,t} from '../config/i18n.js';
import {downloadJson,readJsonFile,safeFilename} from '../services/files.js';
import {migrateLegacy} from '../services/migration.js';
import {validateCase} from '../domain/validation.js';
import {toast} from '../ui/feedback.js';
const INTEGRITY_ERRORS=new Set(['medication_id_invalid','event_id_invalid','assessment_reference_invalid','assessment_duplicate_pair','assessment_drug_not_suspected','clinical_module_id_invalid','clinical_module_type_invalid','clinical_module_reference_invalid','conclusion_reference_invalid','conclusion_duplicate_pair']);
export function createFileOperationsFeature({store}){
  function init(){
    $('#exportBtn').addEventListener('click',()=>{const s=store.getState();s.metadata.updatedAt=new Date().toISOString();downloadJson(s,`${safeFilename(s.metadata.caseId)}.json`);store.setDirty(false);toast(t('exported'))});
    $('#importBtn').addEventListener('click',()=>$('#fileInput').click());
    $('#fileInput').addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{const raw=await readJsonFile(f),m=migrateLegacy(raw),integrity=validateCase(m.data);const fatal=integrity.errors.filter(x=>INTEGRITY_ERRORS.has(x));if(fatal.length)throw new Error(`integrity_error:${fatal.join(',')}`);store.replaceState(m.data,{markDirty:true});toast(`${t('imported')}: ${m.report.join(', ')}`)}catch(err){alert(`${getLang()==='th'?'นำเข้าไม่สำเร็จ':'Import failed'}: ${err.message}`)}finally{e.target.value=''}});
    $('#newCaseBtn').addEventListener('click',()=>{if(store.isDirty()&&!confirm(getLang()==='th'?'ข้อมูลปัจจุบันยังไม่ได้ Export ต้องการเริ่มเคสใหม่หรือไม่?':'Current data has not been exported. Start a new case?'))return;store.reset()});
    window.addEventListener('beforeunload',e=>{if(store.isDirty()){e.preventDefault();e.returnValue=''}});
  }
  return {init,render(){}};
}
