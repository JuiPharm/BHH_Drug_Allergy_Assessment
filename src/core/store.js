import {createEmptyCase} from '../domain/models.js';

export function createStore(initial=createEmptyCase()){
  let state=initial,dirty=false,selectedAssessmentId=null;
  const subscribers=new Set();
  const notify=scopes=>subscribers.forEach(fn=>fn(new Set(scopes)));
  return {
    getState:()=>state,
    replaceState(next,{markDirty=true,scopes=['all']}={}){state=next;dirty=markDirty;selectedAssessmentId=state.assessments?.[0]?.id??null;notify(scopes)},
    update(mutator,{scopes=['all'],markDirty=true,touch=true}={}){mutator(state);if(touch&&state.metadata)state.metadata.updatedAt=new Date().toISOString();if(markDirty)dirty=true;notify(scopes)},
    subscribe(fn){subscribers.add(fn);return()=>subscribers.delete(fn)},
    isDirty:()=>dirty,
    setDirty(value,{notifyScope=true}={}){dirty=!!value;if(notifyScope)notify(['shell'])},
    getSelectedAssessmentId:()=>selectedAssessmentId,
    setSelectedAssessmentId(id,{notifyScope=true}={}){selectedAssessmentId=id;if(notifyScope)notify(['naranjo'])},
    reset(){state=createEmptyCase();dirty=false;selectedAssessmentId=null;notify(['all'])}
  };
}
