export function timelineBounds(meds=[],events=[]){
  const vals=[]; for(const m of meds){if(m.startDateTime)vals.push(+new Date(m.startDateTime));if(m.stopDateTime)vals.push(+new Date(m.stopDateTime));} for(const e of events){if(e.onsetDateTime)vals.push(+new Date(e.onsetDateTime));if(e.endDateTime)vals.push(+new Date(e.endDateTime));}
  const good=vals.filter(Number.isFinite); if(!good.length)return null; let min=Math.min(...good),max=Math.max(...good); if(min===max)max=min+86400000; const pad=Math.max((max-min)*.06,3600000); return {min:min-pad,max:max+pad};
}
export function pct(value,b){return Math.max(0,Math.min(100,((value-b.min)/(b.max-b.min))*100));}
export function formatDateTime(v,locale='th-TH'){if(!v)return '-';const d=new Date(v);return Number.isNaN(+d)?v:new Intl.DateTimeFormat(locale,{dateStyle:'medium',timeStyle:'short'}).format(d)}
