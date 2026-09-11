import {refreshAssessment} from './assessment-state.js';

const ALLOWED={ageUnit:new Set(['years','months','days']),sex:new Set(['male','female']),role:new Set(['suspected','concomitant']),severity:new Set(['mild','moderate','severe']),timing:new Set(['immediate','delayed','indeterminate'])};
const uniq=arr=>[...new Set(arr)];
const validDate=v=>!v||Number.isFinite(new Date(v).getTime());

export function validateCase(data,{forPrint=false}={}){
  const errors=[],warnings=[];
  if(!data?.metadata?.caseId?.trim()) errors.push('case_id_required');
  if(!data?.patient?.hn?.trim()) errors.push('patient_hn_required');
  const age=Number(data?.patient?.age?.value);
  if(data?.patient?.age?.value===''||!Number.isFinite(age)||age<0) errors.push('patient_age_required');
  if(!ALLOWED.ageUnit.has(data?.patient?.age?.unit)) errors.push('patient_age_unit_invalid');
  if(!ALLOWED.sex.has(data?.patient?.sex)) errors.push('patient_sex_required');
  if(!data?.patient?.visitDate||!validDate(data.patient.visitDate)) errors.push('visit_date_required');
  if(!(data?.patient?.diagnoses??[]).some(d=>String(d.text??'').trim())) warnings.push('diagnosis_missing');
  if(!(data?.medications??[]).length) errors.push('medication_required');
  if(!(data?.events??[]).length) errors.push('event_required');

  const medIds=new Set(),eventIds=new Set();
  for(const m of data.medications??[]){
    if(!m.id||medIds.has(m.id)) errors.push('medication_id_invalid');
    if(m.id) medIds.add(m.id);
    if(!m.genericName?.trim()) errors.push('medication_generic_required');
    if(!m.dose?.trim()||!m.route?.trim()||!m.frequency?.trim()||!m.startDateTime) errors.push('medication_fields_required');
    if(!ALLOWED.role.has(m.role)) errors.push('medication_role_invalid');
    if(!validDate(m.startDateTime)||!validDate(m.stopDateTime)) errors.push('medication_date_invalid');
    if(m.startDateTime&&m.stopDateTime&&new Date(m.stopDateTime)<new Date(m.startDateTime)) errors.push('medication_date_invalid');
  }
  for(const e of data.events??[]){
    if(!e.id||eventIds.has(e.id)) errors.push('event_id_invalid');
    if(e.id) eventIds.add(e.id);
    if(!e.term?.trim()||!e.onsetDateTime||!e.severity||!e.outcome?.trim()||!e.management?.trim()) errors.push('event_fields_required');
    if(e.severity&&!ALLOWED.severity.has(e.severity)) errors.push('event_severity_invalid');
    if(e.timing&&!ALLOWED.timing.has(e.timing)) errors.push('event_timing_invalid');
    if(!validDate(e.onsetDateTime)||!validDate(e.endDateTime)) errors.push('event_date_invalid');
    if(e.onsetDateTime&&e.endDateTime&&new Date(e.endDateTime)<new Date(e.onsetDateTime)) errors.push('event_date_invalid');
  }

  const pairs=new Set();
  for(const a of data.assessments??[]){
    if(!medIds.has(a.drugId)||!eventIds.has(a.eventId)) errors.push('assessment_reference_invalid');
    const pair=`${a.drugId}::${a.eventId}`;
    if(pairs.has(pair)) errors.push('assessment_duplicate_pair');
    pairs.add(pair);
    const med=(data.medications??[]).find(m=>m.id===a.drugId);
    if(med&&med.role!=='suspected') errors.push('assessment_drug_not_suspected');
    const r=refreshAssessment(a,{touchUpdatedAt:false});
    if(forPrint&&r.status!=='complete') errors.push(r.status==='needs_review'?'assessment_needs_review':'assessment_incomplete');
  }
  if(forPrint){
    for(const e of data.events??[]){if(!(data.assessments??[]).some(a=>a.eventId===e.id)) errors.push('event_without_assessment')}
    if(!(data.assessments??[]).length) errors.push('assessment_required');
    for(const a of data.assessments??[]){
      const c=(data.conclusions??[]).find(x=>x.drugId===a.drugId&&x.eventId===a.eventId);
      if(!c||!c.conclusion||!c.relationshipType||!c.reasoning?.trim()) errors.push('conclusion_required');
      if(c?.relationshipType==='allergic'){
        const ev=(data.events??[]).find(e=>e.id===a.eventId);
        if(!ev?.phenotype) errors.push('allergic_phenotype_required');
        if(ev?.phenotype==='other'&&!ev?.phenotypeOther?.trim()) errors.push('allergic_phenotype_detail_required');
      }
    }
  }
  const moduleIds=new Set();
  for(const m of data.clinicalModules??[]){
    if(!m.id||moduleIds.has(m.id)) errors.push('clinical_module_id_invalid');
    if(m.id) moduleIds.add(m.id);
    if(!['penfast','regiscar','alden','schumock'].includes(m.type)) errors.push('clinical_module_type_invalid');
    if(m.drugId&&!medIds.has(m.drugId)) errors.push('clinical_module_reference_invalid');
    if(m.eventId&&!eventIds.has(m.eventId)) errors.push('clinical_module_reference_invalid');
    if(m.type==='penfast'&&!m.drugId) errors.push('clinical_module_reference_invalid');
    if(m.type==='regiscar'&&!m.eventId) errors.push('clinical_module_reference_invalid');
    if(['alden','schumock'].includes(m.type)&&(!m.drugId||!m.eventId)) errors.push('clinical_module_reference_invalid');
    if(m.result?.complete===false) warnings.push('clinical_module_incomplete');
  }
  const conclusionPairs=new Set();
  for(const c of data.conclusions??[]){
    if(!medIds.has(c.drugId)||!eventIds.has(c.eventId)) errors.push('conclusion_reference_invalid');
    const pair=`${c.drugId}::${c.eventId}`;
    if(conclusionPairs.has(pair)) errors.push('conclusion_duplicate_pair');
    conclusionPairs.add(pair);
  }
  if((data?.clinicalModules??[]).some(m=>m.status==='needs_review')) warnings.push('clinical_module_needs_review');
  return {valid:errors.length===0,errors:uniq(errors),warnings:uniq(warnings)};
}
