export const PENFAST_VERSION='Trubiano-2020';
const RECENCY=new Set(['gt5','le5','unknown']);
const TREATMENT=new Set(['no','yes','unknown']);

export function validate(input={}){
  const missing=[];
  if(!RECENCY.has(input.recency)) missing.push('recency');
  if(![true,false,null].includes(input.severePhenotype)) missing.push('severePhenotype');
  if(!TREATMENT.has(input.treatment)) missing.push('treatment');
  return {valid:missing.length===0,missing};
}

export function calculate(input={}){
  const validation=validate(input);
  if(!validation.valid)return{score:null,category:'incomplete',lowRisk:false,complete:false,missing:validation.missing};
  let score=0;
  if(input.recency==='le5'||input.recency==='unknown')score+=2;
  if(input.severePhenotype===true)score+=2;
  if(input.treatment==='yes'||input.treatment==='unknown')score+=1;
  const category=score===0?'very_low':score<=2?'low':score===3?'moderate':'high';
  return {score,category,lowRisk:score<3,complete:true,missing:[]};
}
