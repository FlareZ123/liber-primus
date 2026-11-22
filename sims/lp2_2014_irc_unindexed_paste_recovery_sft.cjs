'use strict';
/**
 * Recover exact original-2014 solver-output paste IDs missed by the ten-file
 * fixed acquisition set. All bodies remain untrusted participant material.
 * Node 22, CommonJS. No downloaded code is executed.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const LOG_URL = 'https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/%23cicadasolvers.freenode.log';
const SOURCE_BYTES = 18487233;
const SOURCE_BLOB = 'bdd277c14f94c34b5ae714cd00c238065beeed4e';
/** @typedef {{id:string, line:number, role:string}} Target */
/** @type {Target[]} */
const TARGETS = [
 {id:'x2BH9uWg',line:168742,role:'May5 dictionary results'},
 {id:'BMXciqqy',line:168764,role:'May5 alternative dictionary results'},
 {id:'Bfb406ZX',line:171595,role:'May8 participant evidence'},
 {id:'uzU6wNqK',line:173951,role:'May11 shared file'},
 {id:'hjut50Rf',line:177508,role:'May14 shared lead'},
 {id:'TTmdVPRF',line:177812,role:'May14 third candidate'},
 {id:'xeeQb7Yj',line:184732,role:'May21 p33 phrase-pattern output'},
 {id:'tZtNWkLR',line:200201,role:'Jun14 eight-rune dictionary'},
 {id:'VJLnjtbz',line:207089,role:'Jun20 eight-rune wordlist'},
 {id:'SyYyn41E',line:203148,role:'Jun17 shared source'},
 {id:'s4exAVKr',line:216896,role:'Jul2 numeric intersection lead 1'},
 {id:'gXDGVf1Y',line:216903,role:'Jul2 numeric intersection lead 2'},
 {id:'N3qCRSq2',line:216906,role:'Jul2 eight-set intersection'},
 {id:'W7eB8Ab5',line:220991,role:'Jul14 shared lead'},
 {id:'Wrqq9JLr',line:198922,role:'Jun13 onion traversal proposal'},
 {id:'esfsBFE5',line:207079,role:'Jun20 word frequency table'}
];
/** @param {Buffer} b */
function gitBlob(b) {
 return crypto.createHash('sha1').update('blob '+b.length+'\0','utf8').update(b).digest('hex');
}
/** @param {Buffer} b */
function sha256(b) {return crypto.createHash('sha256').update(b).digest('hex');}
/** @param {string} id */
function sourceUrl(id){return 'https://pastebin.com/raw/'+id;}
/** @param {string} s */
function compact(s){return s.replace(/[\x00-\x1f\x7f]/g,' ').slice(0,1100);}
function selftest(){
 assert.equal(gitBlob(Buffer.from('test')),'30d74d258442c7c65512eafab474568dd706c430');
 assert.equal(TARGETS.length,new Set(TARGETS.map(x=>x.id)).size);
 assert(TARGETS.every(x=>/^[A-Za-z0-9]{8}$/.test(x.id) && x.line>160000));
 assert.equal(sourceUrl('x2BH9uWg'),'https://pastebin.com/raw/x2BH9uWg');
 console.log('PASS: fixed target IDs, no repeated IDs, Git blob identity, source URLs');
}
/** @param {string} url @param {number} ms */
async function fetchBytes(url,ms){
 const response=await fetch(url,{signal:AbortSignal.timeout(ms),
  headers:{'User-Agent':'LP2-period-source-recovery/1.0'}});
 const b=Buffer.from(await response.arrayBuffer());
 return {status:response.status,finalUrl:response.url,b};
}
/** @param {Target} t @param {string[]} lines */
async function examine(t,lines){
 const anchor=lines[t.line-1];
 assert(anchor && anchor.includes('pastebin.com/'+t.id),
  'historical line mismatch '+t.line+' '+t.id);
 assert(/^2014 (May|Jun|Jul|Aug) /.test(anchor),'wrong source date');
 const neighbors=lines.slice(t.line-4,t.line+3).map(x=>compact(x).slice(0,330));
 try{
  const result=await fetchBytes(sourceUrl(t.id),25000);
  const body=result.b.toString('utf8');
  const info={id:t.id,line:t.line,role:t.role,source:compact(anchor),
   status:result.status,finalUrl:result.finalUrl,
   bytes:result.b.length,sha256:sha256(result.b),
   preview:compact(body),neighbors};
  console.log('HISTORICAL_PASTE '+JSON.stringify(info));
 }catch(error){
  console.log('HISTORICAL_PASTE '+JSON.stringify({
   id:t.id,line:t.line,role:t.role,source:compact(anchor),
   networkError:String(error),neighbors}));
 }
}
async function main(){
 selftest();
 if(process.argv.includes('--selftest'))return;
 const r=await fetchBytes(LOG_URL,120000);
 assert.equal(r.status,200,'source HTTP status');
 assert.equal(r.b.length,SOURCE_BYTES,'original IRC byte count');
 assert.equal(gitBlob(r.b),SOURCE_BLOB,'original IRC Git object hash');
 const lines=r.b.toString('latin1').split(/\r?\n/);
 console.log('ORIGINAL_IRC_VERIFIED '+JSON.stringify({
  bytes:r.b.length,gitBlob:gitBlob(r.b),targetCount:TARGETS.length}));
 for(let i=0;i<TARGETS.length;i+=3){
  await Promise.all(TARGETS.slice(i,i+3).map(t=>examine(t,lines)));
 }
 console.log('COMPLETE: retrieved bodies are period-attributed participant data, never authenticated Cicada instructions');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
