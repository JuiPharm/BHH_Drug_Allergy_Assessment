import {createEmptyDrugOverrides,mergeDrugDatabase,normalizeDrugName,findExactDrug} from '../domain/drug-database.js';

const MASTER_URL='assets/data/drug-master.json';
const OVERRIDES_KEY='bhh-da-drugdb-overrides-v1';
const PIN_KEY='bhh-da-drugdb-pin-v1';
let masterPromise=null;

export async function loadDrugMaster(){
  if(!masterPromise)masterPromise=fetch(MASTER_URL,{cache:'no-cache'}).then(async r=>{if(!r.ok)throw new Error(`drug_master_http_${r.status}`);return r.json()});
  return masterPromise;
}
export function loadDrugOverrides(){
  try{const raw=localStorage.getItem(OVERRIDES_KEY);if(!raw)return createEmptyDrugOverrides();const parsed=JSON.parse(raw);return {...createEmptyDrugOverrides(),...parsed,updated:parsed.updated&&typeof parsed.updated==='object'?parsed.updated:{},added:Array.isArray(parsed.added)?parsed.added:[],disabled:Array.isArray(parsed.disabled)?parsed.disabled:[]}}catch{return createEmptyDrugOverrides()}
}
export function saveDrugOverrides(value){localStorage.setItem(OVERRIDES_KEY,JSON.stringify(value))}
export async function getMergedDrugDatabase(){const master=await loadDrugMaster();return mergeDrugDatabase(master,loadDrugOverrides())}
export async function findDrugByName(name){return findExactDrug(await getMergedDrugDatabase(),name)}
export function clearDrugOverrides(){localStorage.removeItem(OVERRIDES_KEY)}

const toHex=buf=>[...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
async function digest(value){return toHex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))}
function randomSalt(){const bytes=new Uint8Array(16);crypto.getRandomValues(bytes);return toHex(bytes)}
export function hasDrugAdminPin(){try{return Boolean(localStorage.getItem(PIN_KEY))}catch{return false}}
export async function setDrugAdminPin(pin){
  if(!/^\d{4,8}$/.test(pin))throw new Error('pin_format');
  const salt=randomSalt(),hash=await digest(`${salt}:${pin}`);localStorage.setItem(PIN_KEY,JSON.stringify({version:1,salt,hash,updatedAt:new Date().toISOString()}));return true;
}
export async function verifyDrugAdminPin(pin){
  try{const rec=JSON.parse(localStorage.getItem(PIN_KEY)||'null');if(!rec?.salt||!rec?.hash)return false;return(await digest(`${rec.salt}:${pin}`))===rec.hash}catch{return false}
}
export function drugAdminStorageInfo(){return {overridesKey:OVERRIDES_KEY,pinKey:PIN_KEY}}
export function makeLocalDrugEntry({genericName,productName='',dosageForm=''}){
  const id=`local-drug-${crypto.randomUUID?.()??Date.now().toString(36)}`;
  const product=productName||dosageForm?{itemCode:'',displayName:normalizeDrugName(productName),dosageForm:normalizeDrugName(dosageForm),majorClass:'',subClass:'',tmtCode:''}:null;
  return {id,genericName:normalizeDrugName(genericName),active:true,products:product?[product]:[],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
}
