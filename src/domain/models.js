import {emptyNaranjoAnswers,NARANJO_VERSION} from './naranjo.js';

export const APP_NAME='BHH Drug Allergy Assessment';
export const APP_VERSION='1.0.1';
export const SCHEMA_VERSION='1.0.0';

export function makeId(prefix){
  if(globalThis.crypto?.randomUUID) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
export function nowLocalInputValue(){
  const d=new Date();
  return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16);
}
export function todayInputValue(){return nowLocalInputValue().slice(0,10)}

export function createEmptyCase(){
  const now=new Date().toISOString();
  return {
    schemaVersion:SCHEMA_VERSION,
    application:{name:APP_NAME,version:APP_VERSION},
    metadata:{caseId:`DA-${todayInputValue().replaceAll('-','')}-${Math.random().toString(36).slice(2,6).toUpperCase()}`,status:'draft',createdAt:now,updatedAt:now},
    patient:{hn:'',age:{value:'',unit:'years'},sex:'',visitDate:'',diagnoses:[],diagnosisNote:'',allergyHistory:[],note:''},
    medications:[],events:[],assessments:[],clinicalModules:[],conclusions:[]
  };
}
export function createDiagnosis(text=''){return {id:makeId('dx'),text}}
export function createAllergy(seed={}){return {id:makeId('allergy'),drug:'',reaction:'',approxDate:'',severity:'',previousExposure:'',comment:'',...seed}}
export function createMedication(seed={}){return {id:makeId('drug'),genericName:'',tradeName:'',dose:'',route:'',frequency:'',startDateTime:'',stopDateTime:'',role:'concomitant',updatedAt:new Date().toISOString(),...seed}}
export function createEvent(seed={}){return {id:makeId('event'),term:'',onsetDateTime:'',endDateTime:'',timing:'indeterminate',phenotype:'',phenotypeOther:'',mechanism:'unknown',mechanismOther:'',severity:'',seriousness:[],outcome:'',management:'',objectiveEvidence:'',clinicalNote:'',updatedAt:new Date().toISOString(),...seed}}
export function createAssessment(drugId,eventId,seed={}){
  return {id:makeId('assessment'),drugId,eventId,algorithm:'Naranjo ADR Probability Scale',algorithmVersion:NARANJO_VERSION,status:'incomplete',answers:emptyNaranjoAnswers(),score:null,classification:null,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),snapshot:null,...seed};
}
export function createClinicalModule(type,seed={}){return {id:makeId('module'),type,drugId:'',eventId:'',inputs:{},result:null,status:'current',needsReviewReason:'',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),...seed}}
export function createConclusion(drugId,eventId,seed={}){return {id:makeId('conclusion'),drugId,eventId,conclusion:'',relationshipType:'',reasoning:'',recommendations:[],recommendationNote:'',updatedAt:new Date().toISOString(),...seed}}
