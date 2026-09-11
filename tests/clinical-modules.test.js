import test from 'node:test';
import assert from 'node:assert/strict';
import {calculate as calculatePenFast} from '../src/clinical/penfast.js';
import {calculate as calculateRegiscar} from '../src/clinical/regiscar.js';
import {calculate as calculateAlden,suggestDelay as suggestAldenDelay} from '../src/clinical/alden.js';
import {calculate as calculateSchumock} from '../src/clinical/schumock.js';

test('PEN-FAST low-risk cutoff is <3',()=>{const zero=calculatePenFast({recency:'gt5',severePhenotype:false,treatment:'no'});assert.equal(zero.score,0);assert.equal(zero.category,'very_low');assert.equal(zero.lowRisk,true);assert.equal(zero.complete,true);assert.equal(calculatePenFast({recency:'le5',severePhenotype:false,treatment:'yes'}).score,3);assert.equal(calculatePenFast({recency:'le5',severePhenotype:false,treatment:'yes'}).lowRisk,false)});
test('PEN-FAST severe phenotype adds two points',()=>assert.equal(calculatePenFast({recency:'gt5',severePhenotype:true,treatment:'no'}).score,2));
test('RegiSCAR classification boundaries',()=>{assert.equal(calculateRegiscar({fever:'yes',lymphNodes:'yes',eosinophilia:'severe',atypicalLymphocytes:'yes',rashOver50:'yes',rashSuggestive:'yes',biopsy:'unknown',organInvolvement:'two_plus',resolution15Days:'yes',alternativeCausesExcluded:'yes'}).category,'definite');assert.equal(calculateRegiscar({fever:'no',lymphNodes:'no',eosinophilia:'none',atypicalLymphocytes:'no',rashOver50:'no',rashSuggestive:'no',biopsy:'not_supportive',organInvolvement:'none',resolution15Days:'no',alternativeCausesExcluded:'no'}).category,'no_case')});
test('ALDEN score boundaries',()=>{assert.equal(calculateAlden({delay:'suggestive',bodyPresence:'definite',prechallenge:'specific_disease_drug',dechallenge:'neutral',notoriety:'strong',otherCause:'none'}).score,10);assert.equal(calculateAlden({delay:'suggestive',bodyPresence:'definite',prechallenge:'unknown',dechallenge:'neutral',notoriety:'strong',otherCause:'none'}).category,'very_probable')});
test('Schumock any yes is preventable; unknown blocks non-preventable',()=>{assert.equal(calculateSchumock({historyAllergy:'yes'}).category,'preventable');const allNo={historyAllergy:'no',inappropriateDrug:'no',inappropriateDoseRouteFrequency:'no',monitoringNotPerformed:'no',drugInteraction:'no',poorCompliance:'no',toxicConcentration:'no'};assert.equal(calculateSchumock(allNo).category,'not_preventable');assert.equal(calculateSchumock({...allNo,poorCompliance:'unknown'}).category,'unable_to_determine')});
test('ALDEN delay suggestion uses real dates',()=>assert.equal(suggestAldenDelay('2026-01-01T08:00','2026-01-07T08:00'),'suggestive'));

test('PEN-FAST unknown recency and unknown treatment score conservatively',()=>{const r=calculatePenFast({recency:'unknown',severePhenotype:null,treatment:'unknown'});assert.equal(r.score,3);assert.equal(r.lowRisk,false)});
test('ALDEN refuses to score incomplete inputs instead of defaulting missing fields to zero',()=>{const r=calculateAlden({delay:'suggestive'});assert.equal(r.complete,false);assert.equal(r.score,null);assert.equal(r.category,'incomplete');assert.ok(r.missing.includes('notoriety'))});
