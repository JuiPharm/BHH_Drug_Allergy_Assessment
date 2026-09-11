import {readFile,writeFile} from 'node:fs/promises';
const files=['01-foundation.css','02-shell.css','03-workspace.css','04-naranjo-modules.css','05-report-dialog.css','06-responsive-print.css'];
const parts=[];for(const file of files)parts.push((await readFile(new URL(`../assets/css/${file}`,import.meta.url),'utf8')).trim());
await writeFile(new URL('../assets/styles.css',import.meta.url),parts.join('\n')+'\n');
console.log(`Built assets/styles.css from ${files.length} CSS modules`);
