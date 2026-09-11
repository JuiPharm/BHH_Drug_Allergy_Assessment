import {createEmptyCase,createDiagnosis,createAllergy,createMedication,createEvent,createAssessment,createClinicalModule,createConclusion,SCHEMA_VERSION,APP_NAME,APP_VERSION} from '../domain/models.js';
import {refreshAssessment} from '../domain/assessment-state.js';

const txt=v=>v==null?'':String(v);
const normalizeSex=v=>{const s=txt(v).trim().toLowerCase();if(['male','ชาย','m'].includes(s))return'male';if(['female','หญิง','f'].includes(s))return'female';return''};
const normalizeSeverity=v=>{const s=txt(v).trim().toLowerCase();return ['mild','moderate','severe'].includes(s)?s:''};

export function normalizeCase(input){
  const base=createEmptyCase();
  const x=input&&typeof input==='object'?structuredClone(input):{};
  const patient={...base.patient,...(x.patient??{}),age:{...base.patient.age,...(x.patient?.age??{})}};
  patient.sex=normalizeSex(patient.sex);
  patient.diagnoses=Array.isArray(patient.diagnoses)?patient.diagnoses.map(d=>createDiagnosis(typeof d==='string'?d:txt(d?.text))).filter(d=>d.text.trim()):[];
  patient.allergyHistory=Array.isArray(patient.allergyHistory)?patient.allergyHistory.map(a=>createAllergy(a)):[];
  const medications=Array.isArray(x.medications)?x.medications.map(m=>createMedication(m)):[];
  const events=Array.isArray(x.events)?x.events.map(e=>createEvent({...e,severity:normalizeSeverity(e.severity),seriousness:Array.isArray(e.seriousness)?e.seriousness:[]})):[];
  const assessments=Array.isArray(x.assessments)?x.assessments.map(a=>refreshAssessment({...createAssessment(a.drugId,a.eventId),...a},{touchUpdatedAt:false})):[];
  const clinicalModules=Array.isArray(x.clinicalModules)?x.clinicalModules.map(m=>createClinicalModule(m.type,m)):[];
  const conclusions=Array.isArray(x.conclusions)?x.conclusions.map(c=>createConclusion(c.drugId,c.eventId,c)):[];
  return {...base,...x,schemaVersion:SCHEMA_VERSION,application:{name:APP_NAME,version:APP_VERSION},metadata:{...base.metadata,...(x.metadata??{}),updatedAt:new Date().toISOString()},patient,medications,events,assessments,clinicalModules,conclusions};
}

export function migrateLegacy(input){
  if(!input||typeof input!=='object'||Array.isArray(input)) throw new Error('invalid_json');
  if(String(input.schemaVersion??'').startsWith('1.')&&Array.isArray(input.medications)) return {data:normalizeCase(input),report:['native_import']};

  if(String(input.schemaVersion??'').startsWith('2.')&&Array.isArray(input.medications)&&Array.isArray(input.events)){
    const out=createEmptyCase(),p=input.patient??{};
    out.patient.hn=txt(p.hn);out.patient.age={value:txt(p.age),unit:'years'};out.patient.sex=normalizeSex(p.sex);out.patient.visitDate=txt(p.visitDate);
    if(txt(p.diagnosis))out.patient.diagnoses=[createDiagnosis(txt(p.diagnosis))];
    if(txt(p.allergyHistory))out.patient.allergyHistory=[createAllergy({drug:'Legacy history',reaction:txt(p.allergyHistory)})];
    out.medications=input.medications.map(m=>createMedication({genericName:txt(m.genericName),tradeName:txt(m.tradeName),dose:txt(m.dose||m.strength),route:txt(m.route),frequency:txt(m.frequency),startDateTime:txt(m.startDateTime),stopDateTime:txt(m.stopDateTime),role:m.role==='suspected'?'suspected':'concomitant'}));
    const medMap=new Map(input.medications.map((m,i)=>[m.id,out.medications[i].id]));
    out.events=input.events.map(e=>createEvent({term:txt(e.term),onsetDateTime:txt(e.onsetDateTime),endDateTime:txt(e.endDateTime),severity:normalizeSeverity(e.severity),seriousness:Array.isArray(e.seriousness)?e.seriousness:[],outcome:txt(e.outcome),management:txt(e.actionTaken||e.management),objectiveEvidence:txt(e.objectiveEvidence),clinicalNote:txt(e.description||e.clinicalNote)}));
    const eventMap=new Map(input.events.map((e,i)=>[e.id,out.events[i].id]));
    for(const old of input.assessments??[]){
      const d=medMap.get(old.drugId),ev=eventMap.get(old.eventId);if(!d||!ev)continue;
      const a=createAssessment(d,ev);
      for(const q of Object.keys(a.answers)){const src=old.answers?.[q];if(src&&['yes','no','unknown'].includes(src.answer))a.answers[q]={answer:src.answer,rationale:txt(src.rationale)}}
      out.assessments.push({...refreshAssessment(a),status:'needs_review',needsReviewReason:'legacy_workbench_q3_review'});
    }
    return {data:normalizeCase(out),report:['imported_workbench','naranjo_marked_needs_review']};
  }

  if(input.patient&&Array.isArray(input.drugs)&&Array.isArray(input.adrs)){
    const out=createEmptyCase(),p=input.patient??{};
    out.patient.hn=txt(p.patientHn);out.patient.age={value:txt(p.patientAge),unit:'years'};out.patient.sex=normalizeSex(p.patientSex);out.patient.visitDate=txt(p.patientVisitDate);
    if(txt(p.patientDx))out.patient.diagnoses=[createDiagnosis(txt(p.patientDx))];
    if(txt(p.patientAllergy))out.patient.allergyHistory=[createAllergy({drug:'Legacy history',reaction:txt(p.patientAllergy)})];
    out.medications=input.drugs.map(d=>createMedication({genericName:txt(d.name),dose:txt(d.dose),route:txt(d.route),frequency:txt(d.frequency),startDateTime:d.start?`${d.start}T00:00`:'',stopDateTime:d.stop?`${d.stop}T00:00`:'',role:d.suspected?'suspected':'concomitant'}));
    out.events=input.adrs.map(e=>createEvent({term:txt(e.event),onsetDateTime:e.date?`${e.date}T${e.time||'00:00'}`:'',severity:normalizeSeverity(e.severity),outcome:txt(e.outcome),management:txt(e.action)}));
    return {data:normalizeCase(out),report:['imported_timeline','legacy_naranjo_not_imported']};
  }

  if(Array.isArray(input.answers)&&('suspectedDrug'in input||'adverseEvent'in input)){
    const out=createEmptyCase();out.patient.hn=txt(input.patientId);
    const drug=createMedication({genericName:txt(input.suspectedDrug),role:'suspected',dose:'Imported — verify',route:'Imported — verify',frequency:'Imported — verify'});
    const event=createEvent({term:txt(input.adverseEvent),management:'Imported legacy case — verify',outcome:'Unknown'});
    out.medications.push(drug);out.events.push(event);
    const a=createAssessment(drug.id,event.id),map={'ใช่':'yes','ไม่ใช่':'no','ไม่ทราบ':'unknown','Yes':'yes','No':'no','Unknown':'unknown','yes':'yes','no':'no','unknown':'unknown'};
    for(const row of input.answers){const q=String(row.number??'');if(a.answers[q]&&map[row.answer])a.answers[q]={answer:map[row.answer],rationale:txt(row.criterion)}}
    out.assessments.push({...refreshAssessment(a),status:'needs_review',needsReviewReason:'legacy_naranjo_state_review'});
    return {data:normalizeCase(out),report:['imported_naranjo_bhh','naranjo_marked_needs_review','clinical_fields_require_verification']};
  }
  throw new Error('unsupported_schema');
}
