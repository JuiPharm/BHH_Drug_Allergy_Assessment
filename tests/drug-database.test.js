import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createEmptyDrugOverrides,mergeDrugDatabase,findExactDrug,searchDrugDatabase,validateDrugEntry} from '../src/domain/drug-database.js';

test('BHH drug master was generated from attached source list',async()=>{
  const master=JSON.parse(await readFile(new URL('../assets/data/drug-master.json',import.meta.url),'utf8'));
  assert.equal(master.source.name,'Drug list Update 10092026.xls');
  assert.equal(master.source.totalRows,1568);
  assert.equal(master.source.rowsWithGenericName,1505);
  assert.equal(master.source.uniqueGenericNames,1053);
  assert.equal(master.generics.length,1053);
  const amox=master.generics.find(x=>x.genericName==='Amoxicillin');
  assert.ok(amox);
  assert.ok(amox.products.length>=2);
  const raw=JSON.stringify(master);
  assert.doesNotMatch(raw,/gross_margin|ราคาต้นทุน|ราคา OPD|ราคา IPD/);
});

test('manual Generic name remains valid when not in database',()=>{
  const result=validateDrugEntry({genericName:'New Generic Drug X'});
  assert.equal(result.valid,true);
  assert.equal(result.name,'New Generic Drug X');
});

test('local overrides can add, edit and remove entries without mutating master',()=>{
  const master={generics:[{id:'a',genericName:'Amoxicillin',active:true,products:[]},{id:'b',genericName:'Ibuprofen',active:true,products:[]}]};
  const ov=createEmptyDrugOverrides();
  ov.updated.a={genericName:'Amoxicillin (INN)'};
  ov.disabled.push('b');
  ov.added.push({id:'local-1',genericName:'NewDrug',active:true,products:[]});
  const merged=mergeDrugDatabase(master,ov);
  assert.equal(merged.find(x=>x.id==='a').genericName,'Amoxicillin (INN)');
  assert.equal(merged.find(x=>x.id==='b').active,false);
  assert.ok(findExactDrug(merged,'newdrug'));
  assert.equal(searchDrugDatabase(merged,'ibu').length,0);
  assert.equal(master.generics[0].genericName,'Amoxicillin');
});
