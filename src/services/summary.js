import {enumText,phenotypeText,seriousnessText,recommendationsText} from '../config/labels.js';
export function buildSummary(state,l='th'){
  const th=l==='th',lines=[];
  const getMed=id=>state.medications.find(x=>x.id===id),getEvent=id=>state.events.find(x=>x.id===id);
  lines.push(`HN: ${state.patient.hn||'-'} | ${th?'อายุ':'Age'}: ${state.patient.age.value||'-'} ${enumText('ageUnit',state.patient.age.unit,l)} | ${th?'เพศ':'Sex'}: ${enumText('sex',state.patient.sex,l)||'-'} | ${th?'วันที่ Visit':'Visit'}: ${state.patient.visitDate||'-'}`);
  const dx=state.patient.diagnoses.filter(d=>d.text?.trim()).map(d=>d.text).join(', ');if(dx)lines.push(`Diagnosis: ${dx}`);
  for(const a of state.assessments){
    const m=getMed(a.drugId),e=getEvent(a.eventId),c=state.conclusions.find(x=>x.drugId===a.drugId&&x.eventId===a.eventId);
    const nclass=a.classification?enumText('naranjo',a.classification,l):(th?'ยังไม่ครบ':'Incomplete');
    const conclusion=c?.conclusion?enumText('conclusion',c.conclusion,l):'-',relationship=c?.relationshipType?enumText('relationship',c.relationshipType,l):'-';
    const common=`${m?.genericName||'?'} → ${e?.term||'?'}: Naranjo ${a.score??'—'} (${nclass}); Phenotype: ${phenotypeText(e,l)}; Timing: ${enumText('timing',e?.timing,l)}; Severity: ${enumText('severity',e?.severity,l)}; Seriousness: ${seriousnessText(e,l)}`;
    if(th)lines.push(`${common}; ข้อสรุปเภสัชกร: ${conclusion} (${relationship}); เหตุผล: ${c?.reasoning||'-'}; คำแนะนำ: ${recommendationsText(c,l)}${c?.recommendationNote?`; ${c.recommendationNote}`:''}`);
    else lines.push(`${common}; Pharmacist conclusion: ${conclusion} (${relationship}); Reasoning: ${c?.reasoning||'-'}; Recommendation: ${recommendationsText(c,l)}${c?.recommendationNote?`; ${c.recommendationNote}`:''}`);
  }
  return lines.join('\n');
}
