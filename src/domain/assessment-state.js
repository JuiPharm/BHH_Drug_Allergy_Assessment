import {calculateNaranjo,validateNaranjoRationales} from './naranjo.js';

export function refreshAssessment(a,{preserveNeedsReview=true,touchUpdatedAt=true}={}){
  const r=calculateNaranjo(a.answers);
  const rationaleErrors=validateNaranjoRationales(a.answers);
  let status=r.completed && rationaleErrors.length===0?'complete':'incomplete';
  if(preserveNeedsReview && a.status==='needs_review') status='needs_review';
  return {...a,status,completed:r.completed,answeredCount:r.answeredCount,score:r.score,provisionalScore:r.provisionalScore,classification:r.classification,rationaleErrors,...(touchUpdatedAt?{updatedAt:new Date().toISOString()}:{})};
}
export function markLinkedAssessmentsNeedsReview(data,{drugId=null,eventId=null,reason='source_changed'}={}){
  data.assessments=(data.assessments??[]).map(a=>((drugId&&a.drugId===drugId)||(eventId&&a.eventId===eventId))?{...a,status:'needs_review',needsReviewReason:reason,updatedAt:new Date().toISOString()}:a);
}
export function markLinkedClinicalModulesNeedsReview(data,{drugId=null,eventId=null,reason='source_changed'}={}){
  data.clinicalModules=(data.clinicalModules??[]).map(m=>((drugId&&m.drugId===drugId)||(eventId&&m.eventId===eventId))?{...m,status:'needs_review',needsReviewReason:reason,updatedAt:new Date().toISOString()}:m);
}
export function confirmAssessmentReview(a,drug,event){
  const refreshed=refreshAssessment({...a,status:'incomplete'},{preserveNeedsReview:false});
  return {...refreshed,needsReviewReason:'',snapshot:{drugUpdatedAt:drug?.updatedAt??null,eventUpdatedAt:event?.updatedAt??null,confirmedAt:new Date().toISOString()}};
}
