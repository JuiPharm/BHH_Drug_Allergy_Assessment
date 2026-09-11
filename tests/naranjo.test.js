import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyNaranjoAnswers,calculateNaranjo,classifyNaranjo,validateNaranjoRationales} from '../src/domain/naranjo.js';

test('Naranjo does not classify incomplete answers',()=>{const a=emptyNaranjoAnswers();a['1'].answer='yes';const r=calculateNaranjo(a);assert.equal(r.completed,false);assert.equal(r.score,null);assert.equal(r.classification,null)});
test('Naranjo preserves no and unknown semantics',()=>{const a=emptyNaranjoAnswers();a['2'].answer='no';a['3'].answer='unknown';assert.equal(a['2'].answer,'no');assert.equal(a['3'].answer,'unknown')});
test('Naranjo classification boundaries',()=>{assert.equal(classifyNaranjo(9),'definite');assert.equal(classifyNaranjo(5),'probable');assert.equal(classifyNaranjo(1),'possible');assert.equal(classifyNaranjo(0),'doubtful')});
test('Required rationale includes Q1/Q5/Q7/Q9/Q10 and Unknown',()=>{const a=emptyNaranjoAnswers();for(const q of Object.keys(a)){a[q].answer='no';a[q].rationale=''}a['2'].answer='unknown';const errors=validateNaranjoRationales(a);for(const q of ['1','2','5','7','9','10'])assert.ok(errors.includes(q))});
