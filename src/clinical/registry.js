export const MODULE_TYPES=['penfast','regiscar','alden','schumock'];
const loaders={penfast:()=>import('./penfast.js'),regiscar:()=>import('./regiscar.js'),alden:()=>import('./alden.js'),schumock:()=>import('./schumock.js')};
export async function loadClinicalEngine(type){const loader=loaders[type];if(!loader)throw new Error('unsupported_clinical_module');return loader()}
