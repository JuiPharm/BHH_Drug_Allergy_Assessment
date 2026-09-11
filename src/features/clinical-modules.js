import {$,esc} from '../ui/dom.js';
import {t,getLang} from '../config/i18n.js';
import {moduleName,moduleCategoryText} from '../config/labels.js';
import {createClinicalModule} from '../domain/models.js';
import {loadClinicalEngine} from '../clinical/registry.js';
import {toast} from '../ui/feedback.js';

const opt=(value,label,current)=>`<option value="${value}" ${current===value?'selected':''}>${label}</option>`;

export function createClinicalModulesFeature({store,dialog}){
  const state=()=>store.getState();
  const getMed=id=>state().medications.find(x=>x.id===id);
  const getEvent=id=>state().events.find(x=>x.id===id);
  const scopes=['modules','report','shell'];

  const ageYears=()=>{
    const a=state().patient.age,v=Number(a.value);
    if(!Number.isFinite(v))return null;
    return a.unit==='years'?v:a.unit==='months'?v/12:v/365.25;
  };

  function resultText(mod){
    const r=mod.result;
    if(!r)return'-';
    if(r.complete===false)return moduleCategoryText(mod.type,'incomplete');
    if(mod.type==='penfast')return`${r.score}/5 · ${moduleCategoryText(mod.type,r.category)}`;
    if(mod.type==='regiscar'||mod.type==='alden')return`${r.score} · ${moduleCategoryText(mod.type,r.category)}`;
    return moduleCategoryText(mod.type,r.category);
  }

  function interpretation(m){
    if(!m.result)return'';
    const l=getLang();
    if(m.result.complete===false)return l==='th'?'ข้อมูลโมดูลยังไม่ครบ จึงยังไม่ควรใช้ผลประกอบการตัดสินใจ':'Module data are incomplete; do not use the result for decision-making.';
    if(m.type==='penfast'){
      const base=m.result.lowRisk
        ?(l==='th'?'Low risk ตาม PEN-FAST; ใช้ร่วมกับ local delabeling pathway และ exclusion criteria':'Low risk by PEN-FAST; integrate with the local delabeling pathway and exclusion criteria.')
        :(l==='th'?'ไม่อยู่ในกลุ่ม PEN-FAST low risk; ประเมินเพิ่มเติมตาม local allergy pathway':'Not in the PEN-FAST low-risk group; use the local allergy pathway for further assessment.');
      const age=ageYears();
      return age!==null&&age<18?`${base} · ${l==='th'?'Pediatric caution: ห้ามใช้คะแนนเพียงอย่างเดียวเพื่อสั่ง challenge':'Pediatric caution: do not use the score alone to trigger challenge.'}`:base;
    }
    if(m.type==='regiscar'){
      const unknown=m.result.unknownCount??0;
      const caution=unknown?` · ${l==='th'?`มีข้อมูล Unknown ${unknown} รายการ ควรตีความคะแนนด้วยความระมัดระวัง`:`${unknown} item(s) are Unknown; interpret the score cautiously.`}`:'';
      return `${l==='th'?'RegiSCAR':'RegiSCAR'}: ${moduleCategoryText('regiscar',m.result.category,l)}${caution}`;
    }
    if(m.type==='alden')return l==='th'?`ALDEN: ${moduleCategoryText('alden',m.result.category,'th')} — ประเมินรายยาใน SJS/TEN`:`ALDEN: ${moduleCategoryText('alden',m.result.category,'en')} — assess each drug in SJS/TEN.`;
    return l==='th'?`Preventability: ${moduleCategoryText('schumock',m.result.category,'th')}`:`Preventability: ${moduleCategoryText('schumock',m.result.category,'en')}`;
  }

  function render(){
    const l=getLang(),s=state(),hasSuspected=s.medications.some(m=>m.role==='suspected'),hasEvent=s.events.length>0;
    const requirements={penfast:hasSuspected,regiscar:hasEvent,alden:hasSuspected&&hasEvent,schumock:hasSuspected&&hasEvent};
    document.querySelectorAll('[data-module]').forEach(b=>{const ready=requirements[b.dataset.module]!==false;b.disabled=!ready;b.setAttribute('aria-disabled',String(!ready));b.title=ready?'':(l==='th'?(b.dataset.module==='regiscar'?'เพิ่ม ADR Event ก่อนใช้โมดูลนี้':b.dataset.module==='penfast'?'เพิ่มยาที่ Role = Suspected ก่อนใช้โมดูลนี้':'เพิ่ม Suspected drug และ ADR Event ก่อนใช้โมดูลนี้'):(b.dataset.module==='regiscar'?'Add an ADR event first':b.dataset.module==='penfast'?'Add a Suspected drug first':'Add a Suspected drug and ADR event first'));});
    $('#moduleResults').innerHTML=s.clinicalModules.map(m=>{
      const stale=m.status==='needs_review';
      const warning=stale?t('moduleNeedsReview'):interpretation(m);
      const updated=new Date(m.updatedAt).toLocaleString(l==='th'?'th-TH':'en-GB');
      return `<article class="record-card module-result-card ${stale?'module-stale':''}">
        <div class="record-title"><h3>${moduleName(m.type)} ${stale?`<span class="badge needs_review">${t('needsReview')}</span>`:''}</h3>
          <p>${esc(getMed(m.drugId)?.genericName||'')} ${m.drugId&&m.eventId?'×':''} ${esc(getEvent(m.eventId)?.term||'')}</p>
          <div class="module-warning">${esc(warning)}</div></div>
        <div class="record-detail"><span>${l==='th'?'ผล':'Result'}</span><b class="result-big">${esc(resultText(m))}</b></div>
        <div class="record-detail"><span>${l==='th'?'แก้ไขล่าสุด':'Updated'}</span><b>${esc(updated)}</b></div>
        <div class="record-actions"><button class="btn btn-ghost btn-small" data-edit-module="${m.id}">${t('edit')}</button><button class="btn btn-danger-soft btn-small" data-del-module="${m.id}">${t('delete')}</button></div>
      </article>`;
    }).join('');
  }

  function pairSelectors(mod,{drugOptional=false,eventOptional=false}={}){
    const l=getLang(),meds=state().medications.filter(m=>m.role==='suspected'),events=state().events;
    const choose=l==='th'?'— เลือก —':'— Select —';
    return `<div class="form-grid cols-2">
      <label>${drugOptional?t('suspected'):`<span class="field-required">${t('suspected')}</span>`} ${drugOptional?`<span class="muted">(${l==='th'?'ไม่บังคับ':'optional'})</span>`:''}
        <select name="drug"><option value="">${choose}</option>${meds.map(m=>`<option value="${m.id}" ${mod.drugId===m.id?'selected':''}>${esc(m.genericName)}</option>`).join('')}</select>
      </label>
      <label>${eventOptional?'ADR event':'<span class="field-required">ADR event</span>'} ${eventOptional?`<span class="muted">(${l==='th'?'ไม่บังคับ':'optional'})</span>`:''}
        <select name="event"><option value="">${choose}</option>${events.map(e=>`<option value="${e.id}" ${mod.eventId===e.id?'selected':''}>${esc(e.term)}</option>`).join('')}</select>
      </label>
    </div>`;
  }

  const selectYNU=(name,value='unknown')=>`<select name="${name}">${opt('unknown',t('unknown'),value)}${opt('yes',t('yes'),value)}${opt('no',t('no'),value)}</select>`;

  function penFastForm(mod,l){
    const recency=mod.inputs.recency??'unknown',treatment=mod.inputs.treatment??'unknown';
    const severe=mod.inputs.severePhenotype===true?'yes':mod.inputs.severePhenotype===false?'no':'unknown';
    return `${pairSelectors(mod,{eventOptional:true})}<div class="dialog-section"><h3>PEN-FAST</h3>
      <div class="form-grid cols-2">
        <label>${l==='th'?'ระยะเวลาตั้งแต่ reaction':'Time since reaction'}<select name="recency">${opt('unknown','Unknown (+2)',recency)}${opt('le5','≤ 5 years (+2)',recency)}${opt('gt5','> 5 years (0)',recency)}</select></label>
        <label>${l==='th'?'Anaphylaxis/Angioedema หรือ SCAR':'Anaphylaxis/angioedema or SCAR'}${selectYNU('severePhenotype',severe)}</label>
        <label>${l==='th'?'Reaction ต้องได้รับการรักษาหรือไม่':'Was treatment required?'}<select name="treatment">${opt('unknown','Unknown (+1)',treatment)}${opt('yes','Yes (+1)',treatment)}${opt('no','No (0)',treatment)}</select></label>
      </div>
      <div class="help-box">${l==='th'?'ใช้สำหรับประวัติแพ้ penicillin เท่านั้น; คะแนน <3 เป็น low risk ตาม original adult rule แต่ไม่ใช่คำสั่งทำ direct oral challenge อัตโนมัติ ต้องตรวจ phenotype, exclusion criteria และ local protocol โดยเฉพาะผู้ป่วยเด็ก':'Use for a penicillin-allergy history only. A score <3 is low risk by the original adult rule, not an automatic direct oral challenge order. Check phenotype, exclusion criteria and local protocol, especially in children.'}</div>
    </div>`;
  }

  function regiScarForm(mod,l){
    return `${pairSelectors(mod,{drugOptional:true})}<div class="dialog-section"><h3>RegiSCAR — DRESS</h3>
      <div class="form-grid cols-2">
        <label>Fever ≥38.5°C ${selectYNU('fever',mod.inputs.fever||'unknown')}</label>
        <label>Lymph nodes ≥2 sites ${selectYNU('lymphNodes',mod.inputs.lymphNodes||'unknown')}</label>
        <label>Eosinophilia<select name="eosinophilia">${opt('unknown','Unknown',mod.inputs.eosinophilia||'unknown')}${opt('none','<700/µL; or <10% if WBC <4,000/µL (0)',mod.inputs.eosinophilia)}${opt('mild','700–1,499/µL; or 10–19.9% if WBC <4,000/µL (+1)',mod.inputs.eosinophilia)}${opt('severe','≥1,500/µL; or ≥20% if WBC <4,000/µL (+2)',mod.inputs.eosinophilia)}</select></label>
        <label>Atypical lymphocytes ${selectYNU('atypicalLymphocytes',mod.inputs.atypicalLymphocytes||'unknown')}</label>
        <label>Rash &gt;50% BSA ${selectYNU('rashOver50',mod.inputs.rashOver50||'unknown')}</label>
        <label>${l==='th'?'ผื่นเข้า pattern DRESS (อย่างน้อย 2: facial edema, infiltration, purpura, desquamation)':'Rash suggestive of DRESS (≥2: facial edema, infiltration, purpura, desquamation)'} ${selectYNU('rashSuggestive',mod.inputs.rashSuggestive||'unknown')}</label>
        <label>Skin biopsy<select name="biopsy">${opt('unknown','Unknown / compatible (0)',mod.inputs.biopsy||'unknown')}${opt('supportive','Compatible / supportive (0)',mod.inputs.biopsy)}${opt('not_supportive','Suggests another diagnosis (−1)',mod.inputs.biopsy)}</select></label>
        <label>Internal organ involvement<select name="organInvolvement">${opt('unknown','Unknown',mod.inputs.organInvolvement||'unknown')}${opt('none','None (0)',mod.inputs.organInvolvement)}${opt('one','1 organ (+1)',mod.inputs.organInvolvement)}${opt('two_plus','≥2 organs (+2)',mod.inputs.organInvolvement)}</select></label>
        <label>Resolution ≥15 days ${selectYNU('resolution15Days',mod.inputs.resolution15Days||'unknown')}</label>
        <label>${l==='th'?'ตัด alternative diagnoses ได้ด้วยการตรวจที่เหมาะสม ≥3 รายการ':'Alternative diagnoses excluded with ≥3 appropriate investigations'} ${selectYNU('alternativeCausesExcluded',mod.inputs.alternativeCausesExcluded||'unknown')}</label>
      </div>
      <div class="help-box">${l==='th'?'<2 = No case, 2–3 = Possible, 4–5 = Probable, ≥6 = Definite. RegiSCAR กำหนดคะแนนให้ Unknown บางข้อโดยตรง จึงต้องตีความร่วมกับจำนวนข้อมูลที่ยังไม่ทราบและ clinical differential':'<2 = No case, 2–3 = Possible, 4–5 = Probable, ≥6 = Definite. RegiSCAR explicitly scores Unknown for some criteria; interpret the score alongside missing information and the clinical differential.'}</div>
    </div>`;
  }

  function aldenForm(mod,l){
    return `${pairSelectors(mod)}<div class="dialog-section"><h3>ALDEN — SJS/TEN</h3>
      <div class="form-grid cols-2">
        <label><span class="field-required">Delay from drug intake to index day</span><select name="delay"><option value="">— Select —</option>${opt('suggestive','Suggestive +3: 5–28 d (or 1–4 d after previous same-drug reaction)',mod.inputs.delay)}${opt('compatible','Compatible +2: 29–56 d',mod.inputs.delay)}${opt('likely','Likely +1: 1–4 d (or 5–56 d after previous same-drug reaction)',mod.inputs.delay)}${opt('unlikely','Unlikely −1: >56 d',mod.inputs.delay)}${opt('excluded','Excluded −3: drug started on/after index day',mod.inputs.delay)}</select></label>
        <label><span class="field-required">Drug present in body on index day</span><select name="bodyPresence"><option value="">— Select using half-life data —</option>${opt('definite','Definite 0: continued or stopped <5 half-lives',mod.inputs.bodyPresence)}${opt('doubtful','Doubtful −1: >5 half-lives with renal/hepatic impairment or interaction',mod.inputs.bodyPresence)}${opt('excluded','Excluded −3: >5 half-lives without impairment/interaction',mod.inputs.bodyPresence)}</select></label>
        <label><span class="field-required">Prechallenge / rechallenge</span><select name="prechallenge"><option value="">— Select —</option>${opt('specific_disease_drug','Same drug caused SJS/TEN (+4)',mod.inputs.prechallenge)}${opt('specific_disease_or_drug','Similar drug caused SJS/TEN or same drug caused another reaction (+2)',mod.inputs.prechallenge)}${opt('unspecific','Similar drug caused another reaction (+1)',mod.inputs.prechallenge)}${opt('unknown','Not done / unknown (0)',mod.inputs.prechallenge)}${opt('negative','Previous exposure without reaction (−2)',mod.inputs.prechallenge)}</select></label>
        <label><span class="field-required">Dechallenge</span><select name="dechallenge"><option value="">— Select —</option>${opt('neutral','Drug stopped / unknown (0)',mod.inputs.dechallenge)}${opt('negative','Drug continued without harm (−2)',mod.inputs.dechallenge)}</select></label>
        <label><span class="field-required">Drug notoriety</span><select name="notoriety"><option value="">— Select from reliable reference —</option>${opt('strong','High-risk list (+3)',mod.inputs.notoriety)}${opt('associated','Associated (+2)',mod.inputs.notoriety)}${opt('suspected','Suspected / under surveillance (+1)',mod.inputs.notoriety)}${opt('unknown','All other / new drugs (0)',mod.inputs.notoriety)}${opt('not_suspected','Evidence against association (−1)',mod.inputs.notoriety)}</select></label>
        <label><span class="field-required">Other cause / another drug more likely</span><select name="otherCause"><option value="">— Select after ranking drugs —</option>${opt('none','No deduction (0)',mod.inputs.otherCause)}${opt('possible','Another drug intermediate score >3 (−1)',mod.inputs.otherCause)}</select></label>
      </div>
      <div class="help-box">${l==='th'?'ALDEN ใช้เฉพาะ SJS/TEN และต้องประเมิน “รายยา” หลังระบุ index day ให้ถูกต้อง ระบบจงใจไม่ตั้งค่าเริ่มต้นให้ notoriety, half-life/body presence หรือ prechallenge เพื่อป้องกันคะแนนสูงปลอมจาก default value':'ALDEN is specific to SJS/TEN and is applied per drug after defining the index day. Notoriety, half-life/body presence and prechallenge intentionally have no scoring defaults to prevent falsely high scores.'}</div>
    </div>`;
  }

  function schumockForm(mod,l){
    const qs=[
      ['inappropriateDrug','ยาที่ใช้ไม่เหมาะสมกับภาวะทางคลินิกหรือไม่?','Was the drug inappropriate for the clinical condition?'],
      ['inappropriateDoseRouteFrequency','ขนาดยา วิธีให้ หรือความถี่ไม่เหมาะสมกับอายุ น้ำหนัก หรือโรคหรือไม่?','Was dose, route or frequency inappropriate for age, weight or disease?'],
      ['monitoringNotPerformed','ไม่ได้ทำ TDM/การติดตามที่จำเป็นหรือไม่?','Was required TDM/laboratory monitoring not performed?'],
      ['historyAllergy','มีประวัติแพ้หรือเคยเกิด reaction จากยานี้มาก่อนหรือไม่?','Was there a history of allergy or previous reaction?'],
      ['drugInteraction','มี drug interaction ที่เกี่ยวข้องหรือไม่?','Was a drug interaction involved?'],
      ['toxicConcentration','มี toxic serum concentration/ผลติดตามที่บ่งชี้ระดับเป็นพิษหรือไม่?','Was a toxic serum concentration or toxic monitoring result documented?'],
      ['poorCompliance','poor compliance/non-adherence มีส่วนทำให้เกิด ADR หรือไม่?','Did poor compliance/non-adherence contribute to the ADR?']
    ];
    return `${pairSelectors(mod)}<div class="dialog-section"><h3>Schumock & Thornton — 7 questions</h3><div class="form-grid cols-2">${qs.map(([k,th,en])=>`<label>${l==='th'?th:en}${selectYNU(k,mod.inputs[k]||'unknown')}</label>`).join('')}</div><div class="help-box">${l==='th'?'Yes อย่างน้อย 1 ข้อ → Preventable; ทุกข้อ No → Not preventable; หากไม่มี Yes แต่ยังมี Unknown → Unable to determine':'Any Yes → Preventable; all No → Not preventable; no Yes with at least one Unknown → Unable to determine.'}</div></div>`;
  }

  async function openEditor(type,id=null){
    const source=id?state().clinicalModules.find(x=>x.id===id):null;
    let mod=source?structuredClone(source):createClinicalModule(type);
    if(!mod)return;
    const engine=await loadClinicalEngine(mod.type),l=getLang();
    const builders={penfast:penFastForm,regiscar:regiScarForm,alden:aldenForm,schumock:schumockForm};
    dialog.open({title:moduleName(mod.type),kicker:'OPTIONAL CLINICAL MODULE',html:builders[mod.type](mod,l),onSave:()=>saveModule(mod,id,engine)});
  }

  function requirePair(mod,{drug=false,event=false}={}){
    const l=getLang(),fields=[];
    if(drug&&!mod.drugId)fields.push('drug');
    if(event&&!mod.eventId)fields.push('event');
    if(fields.length)return dialog.error(l==='th'?(drug&&event?'กรุณาเลือก Suspected drug และ ADR event':'กรุณาเลือกข้อมูลที่จำเป็นก่อนบันทึกโมดูล'):(drug&&event?'Select a Suspected drug and an ADR event':'Select the required item before saving the module'),{fields});
    return true;
  }

  function saveModule(mod,id,engine){
    mod.drugId=dialog.val('drug');mod.eventId=dialog.val('event');
    if(mod.type==='penfast'){
      if(!requirePair(mod,{drug:true}))return;
      const severe=dialog.val('severePhenotype');
      mod.inputs={recency:dialog.val('recency'),severePhenotype:severe==='yes'?true:severe==='no'?false:null,treatment:dialog.val('treatment')};
    }
    if(mod.type==='regiscar'){
      if(!requirePair(mod,{event:true}))return;
      mod.inputs={fever:dialog.val('fever'),lymphNodes:dialog.val('lymphNodes'),eosinophilia:dialog.val('eosinophilia'),atypicalLymphocytes:dialog.val('atypicalLymphocytes'),rashOver50:dialog.val('rashOver50'),rashSuggestive:dialog.val('rashSuggestive'),biopsy:dialog.val('biopsy'),organInvolvement:dialog.val('organInvolvement'),resolution15Days:dialog.val('resolution15Days'),alternativeCausesExcluded:dialog.val('alternativeCausesExcluded')};
    }
    if(mod.type==='alden'){
      if(!requirePair(mod,{drug:true,event:true}))return;
      mod.inputs={delay:dialog.val('delay'),bodyPresence:dialog.val('bodyPresence'),prechallenge:dialog.val('prechallenge'),dechallenge:dialog.val('dechallenge'),notoriety:dialog.val('notoriety'),otherCause:dialog.val('otherCause')};
    }
    if(mod.type==='schumock'){
      if(!requirePair(mod,{drug:true,event:true}))return;
      mod.inputs=Object.fromEntries(['inappropriateDrug','inappropriateDoseRouteFrequency','monitoringNotPerformed','historyAllergy','drugInteraction','toxicConcentration','poorCompliance'].map(k=>[k,dialog.val(k)]));
    }
    mod.result=engine.calculate(mod.inputs);
    if(mod.result.complete===false){const fields=mod.type==='alden'?['delay','bodyPresence','prechallenge','dechallenge','notoriety','otherCause']:[];return dialog.error(getLang()==='th'?'กรอกข้อมูลโมดูลที่จำเป็นให้ครบก่อนบันทึก':'Complete the required module inputs before saving',{fields});}
    mod.status='current';mod.needsReviewReason='';mod.updatedAt=new Date().toISOString();
    if(id){const target=state().clinicalModules.find(x=>x.id===id);if(target)Object.assign(target,mod);}
    else state().clinicalModules.push(mod);
    store.update(()=>{}, {scopes});dialog.close();
  }

  function init(){
    $('#moduleSection').addEventListener('click',e=>{
      const b=e.target.closest('button');if(!b)return;
      if(b.dataset.module)openEditor(b.dataset.module).catch(handleLoadError);
      if(b.dataset.editModule){const m=state().clinicalModules.find(x=>x.id===b.dataset.editModule);if(m)openEditor(m.type,m.id).catch(handleLoadError);}
      if(b.dataset.delModule)store.update(s=>{s.clinicalModules=s.clinicalModules.filter(x=>x.id!==b.dataset.delModule)},{scopes});
    });
  }

  function handleLoadError(err){console.error(err);toast(getLang()==='th'?'โหลดโมดูลไม่สำเร็จ':'Unable to load module');}
  return {init,render,resultText,interpretation};
}
