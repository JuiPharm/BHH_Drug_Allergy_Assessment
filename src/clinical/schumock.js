export const SCHUMOCK_VERSION='Schumock-Thornton-1992';
export const QUESTIONS=['inappropriateDrug','inappropriateDoseRouteFrequency','monitoringNotPerformed','historyAllergy','drugInteraction','toxicConcentration','poorCompliance'];
const ANSWERS=new Set(['yes','no','unknown']);

export function calculate(input={}){
  // Missing answers are treated as Unknown rather than as No. A single Yes is
  // sufficient for the 7-question preventability rule; only seven explicit No
  // answers can produce Not preventable.
  const values=QUESTIONS.map(k=>ANSWERS.has(input[k])?input[k]:'unknown');
  if(values.includes('yes'))return{category:'preventable',complete:true,unknownCount:values.filter(v=>v==='unknown').length};
  if(values.every(v=>v==='no'))return{category:'not_preventable',complete:true,unknownCount:0};
  return{category:'unable_to_determine',complete:true,unknownCount:values.filter(v=>v==='unknown').length};
}
