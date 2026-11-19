import {DatabaseSync} from 'node:sqlite';
import {existsSync,mkdirSync,chmodSync} from 'node:fs';
import {resolve} from 'node:path';
const source=resolve('.data/sandbox.sqlite');
if(!existsSync(source))throw Error('Run the sandbox first');
mkdirSync('.data/backups',{recursive:true,mode:0o700});
process.umask(0o077);
const target=resolve('.data/backups',new Date().toISOString().replaceAll(':','-')+'.sqlite');
const db=new DatabaseSync(source);
try{db.prepare('VACUUM INTO ?').run(target);chmodSync(target,0o600);console.log(target);}finally{db.close();}
