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
});
