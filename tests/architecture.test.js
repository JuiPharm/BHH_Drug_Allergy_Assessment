import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {join} from 'node:path';
import {loadClinicalEngine,MODULE_TYPES} from '../src/clinical/registry.js';

const ROOT=new URL('../',import.meta.url);

test('optional clinical engines are lazy-loadable modules',async()=>{
  for(const type of MODULE_TYPES){
    const engine=await loadClinicalEngine(type);
    assert.equal(typeof engine.calculate,'function',`${type} must expose calculate()`);
  }
});

test('patient clinical data is not persisted by source modules',async()=>{
  async function walk(dir){
    const entries=await readdir(dir,{withFileTypes:true});
    const files=[];
    for(const e of entries){const p=join(dir,e.name);if(e.isDirectory())files.push(...await walk(p));else if(e.name.endsWith('.js'))files.push(p)}
    return files;
  }
  const srcDir=new URL('../src/',import.meta.url).pathname;
  const files=await walk(srcDir);
  for(const file of files){
    if(file.endsWith('/config/i18n.js'))continue; // language preference only
    const text=await readFile(file,'utf8');
    assert.equal(/localStorage|sessionStorage|indexedDB/.test(text),false,`patient persistence API found in ${file}`);
  }
});

test('index enforces no outbound application connections',async()=>{
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  assert.match(html,/connect-src 'none'/);
  assert.match(html,/type="module" src="src\/main\.js"/);
  assert.match(html,/assets\/bhh-logo\.png/);
  assert.match(html,/assets\/favicon\.png/);
});

test('modal validation feedback is rendered inside the top-layer dialog',async()=>{
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  const dialogStart=html.indexOf('<dialog id="formDialog"');
  const dialogEnd=html.indexOf('</dialog>',dialogStart);
  const feedbackPos=html.indexOf('id="dialogFeedback"',dialogStart);
  assert.ok(dialogStart>=0&&dialogEnd>dialogStart,'form dialog must exist');
  assert.ok(feedbackPos>dialogStart&&feedbackPos<dialogEnd,'dialog feedback must live inside <dialog> top layer');
  const dialogJs=await readFile(new URL('../src/ui/dialog.js',import.meta.url),'utf8');
  assert.match(dialogJs,/function error\(message/);
  assert.match(dialogJs,/aria-invalid/);
});

test('ADR modal exposes required fields and uses inline dialog errors',async()=>{
  const source=await readFile(new URL('../src/features/events.js',import.meta.url),'utf8');
  for(const name of ['term','onset','severity','outcome','management']){
    assert.match(source,new RegExp(`name="${name}"`));
  }
  assert.match(source,/field-required/);
  assert.match(source,/dialog\.error/);
  assert.doesNotMatch(source,/toast\(/);
});

test('other modal save validation does not depend on background toast',async()=>{
  for(const file of ['medications.js','patient.js','conclusions.js']){
    const source=await readFile(new URL(`../src/features/${file}`,import.meta.url),'utf8');
    assert.match(source,/dialog\.error/);
  }
  const modules=await readFile(new URL('../src/features/clinical-modules.js',import.meta.url),'utf8');
  assert.match(modules,/dialog\.error/);
  assert.match(modules,/structuredClone\(source\)/);
});
