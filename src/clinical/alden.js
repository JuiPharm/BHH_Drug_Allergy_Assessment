export const ALDEN_VERSION='Sassolas-2010';

export const OPTIONS={
  delay:{suggestive:3,compatible:2,likely:1,unlikely:-1,excluded:-3},
  bodyPresence:{definite:0,doubtful:-1,excluded:-3},
  prechallenge:{specific_disease_drug:4,specific_disease_or_drug:2,unspecific:1,unknown:0,negative:-2},
  dechallenge:{neutral:0,negative:-2},
  notoriety:{strong:3,associated:2,suspected:1,unknown:0,not_suspected:-1},
  otherCause:{none:0,possible:-1}
};

export function validate(input={}){
  const missing=[];
  for(const [key,map] of Object.entries(OPTIONS)){
    if(!(input[key] in map)) missing.push(key);
  }
  return {valid:missing.length===0,missing};
}

export function calculate(input={}){
  const validation=validate(input);
  if(!validation.valid) return {score:null,category:'incomplete',complete:false,missing:validation.missing};
  let score=0;
  for(const [key,map] of Object.entries(OPTIONS)) score+=map[input[key]];
  return {score,category:score<0?'very_unlikely':score<=1?'unlikely':score<=3?'possible':score<=5?'probable':'very_probable',complete:true,missing:[]};
}

// Convenience only for first-exposure chronology. The pharmacist must still
// select/confirm the ALDEN latency category because previous reaction changes
// the latency rule.
export function suggestDelay(startDateTime,onsetDateTime){
  if(!startDateTime||!onsetDateTime)return null;
  const ms=new Date(onsetDateTime)-new Date(startDateTime);
  if(!Number.isFinite(ms))return null;
  const days=ms/86400000;
  if(days<=0)return'excluded';
  if(days<=4)return'likely';
  if(days<=28)return'suggestive';
  if(days<=56)return'compatible';
  return'unlikely';
}
