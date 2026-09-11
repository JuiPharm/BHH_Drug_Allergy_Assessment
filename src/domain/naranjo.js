export const NARANJO_VERSION = '1981-reviewed-2026-09';
export const ANSWERS = ['yes','no','unknown'];

export const NARANJO_QUESTIONS = [
  {id:'1', scores:{yes:1,no:0,unknown:0}, rationaleRequired:true,
   th:'มีรายงานสรุปชัดเจนเกี่ยวกับอาการไม่พึงประสงค์นี้จากยาดังกล่าวมาก่อนหรือไม่?',
   en:'Are there previous conclusive reports on this reaction?',
   guidance:{
    th:{yes:'มีข้อมูลจากแหล่งอ้างอิงที่น่าเชื่อถือสนับสนุนว่าเคยเกิดปฏิกิริยานี้จากยา',no:'สืบค้นแล้วไม่พบรายงานที่สนับสนุน',unknown:'ข้อมูลไม่เพียงพอหรือยังไม่ได้สืบค้นอย่างเหมาะสม'},
    en:{yes:'Reliable literature supports this reaction with the drug.',no:'An adequate search found no supporting report.',unknown:'Evidence is insufficient or has not been adequately checked.'}
   }},
  {id:'2', scores:{yes:2,no:-1,unknown:0},
   th:'อาการไม่พึงประสงค์เกิดขึ้นภายหลังได้รับยาที่สงสัยหรือไม่?',
   en:'Did the adverse event appear after the suspected drug was administered?',
   guidance:{th:{yes:'ลำดับเวลาสอดคล้อง: เริ่มยาแล้วจึงเกิดอาการ',no:'อาการเกิดก่อนเริ่มยาหรือ chronology ไม่สอดคล้อง',unknown:'เวลาเริ่มยา/เริ่มอาการไม่ชัดเจน'},en:{yes:'The chronology is compatible: exposure preceded the event.',no:'The event preceded exposure or chronology is incompatible.',unknown:'Exposure/onset timing is insufficiently known.'}}},
  {id:'3', scores:{yes:1,no:0,unknown:0},
   th:'อาการดีขึ้นเมื่อหยุดยาที่สงสัย หรือเมื่อได้รับ specific antagonist หรือไม่?',
   en:'Did the reaction improve when the drug was discontinued or a specific antagonist was given?',
   guidance:{th:{yes:'มี positive dechallenge หลังหยุดยา หรือหลังได้รับ specific antagonist',no:'อาการไม่ดีขึ้นแม้มีช่วงเวลาที่เหมาะสมให้ประเมิน',unknown:'ยังประเมิน dechallenge ไม่ได้ เช่น ยังไม่หยุดยา/ข้อมูลไม่พอ'},en:{yes:'A positive dechallenge followed discontinuation or a specific antagonist.',no:'The event did not improve despite an adequate observation period.',unknown:'Dechallenge cannot be assessed.'}}},
  {id:'4', scores:{yes:2,no:-1,unknown:0},
   th:'อาการกลับมาเกิดซ้ำเมื่อได้รับยาที่สงสัยซ้ำหรือไม่?',
   en:'Did the reaction reappear when the drug was readministered?',
   guidance:{th:{yes:'มี rechallenge แล้วเกิดอาการเดิม/สอดคล้องซ้ำ',no:'ได้รับยาซ้ำโดยไม่เกิดอาการเดิม',unknown:'ไม่มีการให้ยาซ้ำหรือข้อมูลไม่เพียงพอ'},en:{yes:'Re-exposure reproduced a compatible reaction.',no:'Re-exposure occurred without recurrence.',unknown:'No rechallenge or insufficient information.'}}},
  {id:'5', scores:{yes:-1,no:2,unknown:0}, rationaleRequired:true,
   th:'มีสาเหตุอื่นที่สามารถอธิบายอาการนี้ได้ด้วยตัวมันเองหรือไม่?',
   en:'Are there alternative causes that could on their own have caused the reaction?',
   guidance:{th:{yes:'มีโรค ยาอื่น การติดเชื้อ หรือสาเหตุอื่นที่อธิบายอาการได้',no:'ประเมิน differential แล้วไม่พบ alternative cause ที่เหมาะสม',unknown:'ข้อมูลยังไม่พอที่จะตัดสาเหตุอื่น'},en:{yes:'Another disease, drug, infection, or exposure can independently explain the event.',no:'Reasonable alternatives were assessed and none adequately explains it.',unknown:'Alternatives cannot yet be assessed.'}}},
  {id:'6', scores:{yes:-1,no:1,unknown:0},
   th:'อาการกลับมาเกิดซ้ำเมื่อได้รับ placebo หรือไม่?',
   en:'Did the reaction reappear when a placebo was given?',
   guidance:{th:{yes:'มี placebo exposure และอาการเกิดซ้ำ',no:'ได้รับ placebo แล้วไม่เกิดอาการ',unknown:'ไม่มีข้อมูล placebo หรือไม่สามารถประเมินได้'},en:{yes:'The event recurred with placebo.',no:'Placebo did not reproduce the event.',unknown:'No placebo information / not assessable.'}}},
  {id:'7', scores:{yes:1,no:0,unknown:0}, rationaleRequired:true,
   th:'ตรวจพบยาในเลือดหรือสารน้ำของร่างกายในระดับที่ทราบว่าเป็นพิษหรือไม่?',
   en:'Was the drug detected in blood or other fluids at a concentration known to be toxic?',
   guidance:{th:{yes:'มีผลระดับยาหรือหลักฐานเชิงปริมาณอยู่ในช่วง toxic',no:'มีการตรวจที่เหมาะสมและไม่พบระดับ toxic',unknown:'ไม่ได้ตรวจ/ไม่มีเกณฑ์ toxic ที่ใช้ได้ หรือข้อมูลไม่พอ'},en:{yes:'An appropriate assay showed a known toxic concentration.',no:'Appropriate testing did not show a toxic concentration.',unknown:'Not measured, no applicable toxic threshold, or insufficient information.'}}},
  {id:'8', scores:{yes:1,no:0,unknown:0},
   th:'อาการรุนแรงขึ้นเมื่อเพิ่มขนาดยา หรือดีขึ้นเมื่อลดขนาดยาหรือไม่?',
   en:'Was the reaction more severe when the dose increased or less severe when the dose decreased?',
   guidance:{th:{yes:'มี dose-response relationship ที่สอดคล้อง',no:'มีการเปลี่ยนขนาดยาแต่ไม่พบความสัมพันธ์',unknown:'ไม่มีการเปลี่ยนขนาดยาหรือข้อมูลไม่พอ'},en:{yes:'A compatible dose-response relationship is documented.',no:'Dose changed without a compatible response.',unknown:'Dose-response cannot be assessed.'}}},
  {id:'9', scores:{yes:1,no:0,unknown:0}, rationaleRequired:true,
   th:'ผู้ป่วยเคยมีอาการคล้ายกันจากยานี้หรือยาที่เกี่ยวข้องมาก่อนหรือไม่?',
   en:'Did the patient have a similar reaction to the same or a related drug previously?',
   guidance:{th:{yes:'มีประวัติ reaction คล้ายกันจากยาเดิมหรือยาที่เกี่ยวข้อง',no:'ไม่เคยได้รับยานี้/ยาที่เกี่ยวข้องมาก่อน หรือเคยได้รับแล้วไม่เกิด reaction คล้ายกัน',unknown:'ไม่สามารถยืนยันประวัติ previous exposure ได้'},en:{yes:'A similar reaction occurred with the same or a related drug previously.',no:'There was no previous exposure, or prior exposure occurred without a similar reaction.',unknown:'Prior exposure/history cannot be established.'}}},
  {id:'10', scores:{yes:1,no:0,unknown:0}, rationaleRequired:true,
   th:'มีหลักฐานเชิงวัตถุยืนยันอาการไม่พึงประสงค์หรือไม่?',
   en:'Was the adverse event confirmed by objective evidence?',
   guidance:{th:{yes:'มี physical finding, laboratory, imaging หรือหลักฐาน objective สนับสนุน',no:'ประเมิน objective data แล้วไม่พบหลักฐานสนับสนุน',unknown:'ยังไม่มีหรือข้อมูล objective ไม่เพียงพอ'},en:{yes:'Physical findings, laboratory data, imaging, or other objective evidence support the event.',no:'Available objective evaluation does not support the event.',unknown:'Objective evidence is unavailable or insufficient.'}}}
];

export function emptyNaranjoAnswers(){
  return Object.fromEntries(NARANJO_QUESTIONS.map(q=>[q.id,{answer:null,rationale:''}]));
}

export function calculateNaranjo(answers={}){
  let provisionalScore=0, answeredCount=0;
  for(const q of NARANJO_QUESTIONS){
    const ans=answers?.[q.id]?.answer ?? null;
    if(ANSWERS.includes(ans)){
      answeredCount++;
      provisionalScore += q.scores[ans];
    }
  }
  const completed=answeredCount===NARANJO_QUESTIONS.length;
  const score=completed?provisionalScore:null;
  return {answeredCount,completed,provisionalScore,score,classification:completed?classifyNaranjo(score):null};
}

export function classifyNaranjo(score){
  if(score>=9) return 'definite';
  if(score>=5) return 'probable';
  if(score>=1) return 'possible';
  return 'doubtful';
}

export function validateNaranjoRationales(answers={}){
  const errors=[];
  for(const q of NARANJO_QUESTIONS){
    const item=answers?.[q.id]??{};
    const required=q.rationaleRequired || item.answer==='unknown';
    if(required && item.answer && !String(item.rationale??'').trim()) errors.push(q.id);
  }
  return errors;
}

export function getNaranjoPrerequisites(state={}){
  const medications=Array.isArray(state.medications)?state.medications:[];
  const events=Array.isArray(state.events)?state.events:[];
  const suspectedCount=medications.filter(m=>m?.role==='suspected').length;
  const eventCount=events.length;
  return {
    suspectedCount,
    eventCount,
    hasSuspected:suspectedCount>0,
    hasEvent:eventCount>0,
    ready:suspectedCount>0&&eventCount>0
  };
}

