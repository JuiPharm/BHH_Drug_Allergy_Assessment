export const REGISCAR_VERSION='DRESS-validation-score';
const VALID={
  fever:new Set(['yes','no','unknown']),
  lymphNodes:new Set(['yes','no','unknown']),
  eosinophilia:new Set(['none','mild','severe','unknown']),
  atypicalLymphocytes:new Set(['yes','no','unknown']),
  rashOver50:new Set(['yes','no','unknown']),
  rashSuggestive:new Set(['yes','no','unknown']),
  biopsy:new Set(['supportive','not_supportive','unknown']),
  organInvolvement:new Set(['none','one','two_plus','unknown']),
  resolution15Days:new Set(['yes','no','unknown']),
  alternativeCausesExcluded:new Set(['yes','no','unknown'])
};
const ynu=(v,yes,no,unknown=no)=>v==='yes'?yes:v==='no'?no:unknown;

export function validate(input={}){
  const missing=[];
  for(const [key,set] of Object.entries(VALID))if(!set.has(input[key]))missing.push(key);
  return {valid:missing.length===0,missing};
}

export function calculate(input={}){
  const validation=validate(input);
  if(!validation.valid)return{score:null,category:'incomplete',complete:false,missing:validation.missing,unknownCount:null};
  let score=0;
  score+=ynu(input.fever,0,-1,-1);
  score+=ynu(input.lymphNodes,1,0,0);
  score+=({none:0,mild:1,severe:2,unknown:0})[input.eosinophilia];
  score+=ynu(input.atypicalLymphocytes,1,0,0);
  score+=ynu(input.rashOver50,1,0,0);
  score+=ynu(input.rashSuggestive,1,-1,0);
  score+=input.biopsy==='not_supportive'?-1:0;
  score+=({none:0,one:1,two_plus:2,unknown:0})[input.organInvolvement];
  score+=ynu(input.resolution15Days,0,-1,-1);
  score+=ynu(input.alternativeCausesExcluded,1,0,0);
  const unknownCount=Object.values(input).filter(v=>v==='unknown').length;
  return {score,category:score<2?'no_case':score<=3?'possible':score<=5?'probable':'definite',complete:true,missing:[],unknownCount};
}
