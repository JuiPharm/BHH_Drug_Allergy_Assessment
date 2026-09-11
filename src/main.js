import {createStore} from './core/store.js';
import {createDialogController} from './ui/dialog.js';
import {applyStaticTranslations,setLang,subscribeLanguage} from './config/i18n.js';
import {$,$$} from './ui/dom.js';
import {createShellFeature} from './features/shell.js';
import {createPatientFeature} from './features/patient.js';
import {createMedicationFeature} from './features/medications.js';
import {createEventFeature} from './features/events.js';
import {createTimelineFeature} from './features/timeline.js';
import {createNaranjoFeature} from './features/naranjo.js';
import {createClinicalModulesFeature} from './features/clinical-modules.js';
import {createConclusionFeature} from './features/conclusions.js';
import {createReportFeature} from './features/report.js';
import {createFileOperationsFeature} from './features/file-operations.js';
import {createDrugDatabaseFeature} from './features/drug-database.js';

const store=createStore(),dialog=createDialogController(),ctx={store,dialog};
const features={shell:createShellFeature(ctx),patient:createPatientFeature(ctx),medications:createMedicationFeature(ctx),events:createEventFeature(ctx),timeline:createTimelineFeature(ctx),naranjo:createNaranjoFeature(ctx),modules:createClinicalModulesFeature(ctx),conclusions:createConclusionFeature(ctx),report:createReportFeature(ctx),files:createFileOperationsFeature(ctx),drugDatabase:createDrugDatabaseFeature(ctx)};
const renderOrder=['patient','medications','events','timeline','naranjo','modules','conclusions','report','shell','drugDatabase'];
function renderScopes(scopes){const all=scopes.has('all');for(const key of renderOrder)if(all||scopes.has(key))features[key].render()}
for(const feature of Object.values(features))feature.init?.();
store.subscribe(renderScopes);
$$('[data-lang]').forEach(b=>b.addEventListener('click',()=>setLang(b.dataset.lang)));
subscribeLanguage(()=>{applyStaticTranslations();renderScopes(new Set(['all']))});
applyStaticTranslations();renderScopes(new Set(['all']));store.setDirty(false);
