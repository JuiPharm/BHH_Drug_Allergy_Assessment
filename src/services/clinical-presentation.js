import {getLang} from '../config/i18n.js';
import {moduleCategoryText} from '../config/labels.js';

export function moduleResultText(mod){
  const r=mod.result;
  if(!r)return'-';
  if(r.complete===false)return moduleCategoryText(mod.type,'incomplete');
  if(mod.type==='penfast')return`${r.score}/5 · ${moduleCategoryText(mod.type,r.category)}`;
  if(mod.type==='regiscar'||mod.type==='alden')return`${r.score} · ${moduleCategoryText(mod.type,r.category)}`;
  return moduleCategoryText(mod.type,r.category);
}

export function moduleInterpretation(mod,patient){
  if(!mod.result)return'';
  const l=getLang();
  if(mod.result.complete===false)return l==='th'?'ข้อมูลโมดูลยังไม่ครบ จึงยังไม่ควรใช้ผลประกอบการตัดสินใจ':'Module data are incomplete; do not use the result for decision-making.';
  if(mod.type==='penfast'){
    const base=mod.result.lowRisk
      ?(l==='th'?'Low risk ตาม PEN-FAST; ใช้ร่วมกับ local delabeling pathway และ exclusion criteria':'Low risk by PEN-FAST; integrate with the local delabeling pathway and exclusion criteria.')
      :(l==='th'?'ไม่อยู่ในกลุ่ม PEN-FAST low risk; ประเมินเพิ่มเติมตาม local allergy pathway':'Not in the PEN-FAST low-risk group; use the local allergy pathway for further assessment.');
    const v=Number(patient?.age?.value),age=Number.isFinite(v)?(patient.age.unit==='years'?v:patient.age.unit==='months'?v/12:v/365.25):null;
    return age!==null&&age<18?`${base} · ${l==='th'?'Pediatric caution: ห้ามใช้คะแนนเพียงอย่างเดียวเพื่อสั่ง challenge':'Pediatric caution: do not use the score alone to trigger challenge.'}`:base;
  }
  if(mod.type==='regiscar'){
    const unknown=mod.result.unknownCount??0;
    const caution=unknown?` · ${l==='th'?`มีข้อมูล Unknown ${unknown} รายการ`:`${unknown} item(s) are Unknown`}`:'';
    return `RegiSCAR: ${moduleCategoryText('regiscar',mod.result.category,l)}${caution}`;
  }
  if(mod.type==='alden')return l==='th'?`ALDEN: ${moduleCategoryText('alden',mod.result.category,'th')} — ประเมินรายยาใน SJS/TEN`:`ALDEN: ${moduleCategoryText('alden',mod.result.category,'en')} — assess each drug in SJS/TEN.`;
  return l==='th'?`Preventability: ${moduleCategoryText('schumock',mod.result.category,'th')}`:`Preventability: ${moduleCategoryText('schumock',mod.result.category,'en')}`;
}
