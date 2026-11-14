'use strict';
/** May-Aug 2014 sister-channel original-source census, Issue #905. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const inputs=[
 {name:'#cicadasolvers.freenode.log',size:18487233,hash:'bdd277c14f94c34b5ae714cd00c238065beeed4e'},
 {name:'#33012014.freenode.log',size:8629610,hash:'a2880b1db31ce523599ef30ca2e55291bf295900'}
];
/** @param {Buffer} b */
function sha(b){return crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');}
/** @param {string} file @param {any} pin */
function load(file,pin){
 const b=fs.readFileSync(file);
 assert.equal(b.length,pin.size,'source byte count');
 assert.equal(sha(b),pin.hash,'Git blob SHA1');
 const entries=b.toString('latin1').split(/\r?\n/).flatMap((s,i)=>{
  const m=s.match(/^(2014 (?:May|Jun|Jul|Aug) \d\d \d\d:\d\d) <([^>]+)> ?(.*)$/);
  return m?[{line:i+1,date:m[1],nick:m[2],body:m[3]}]:[];
 });
 console.log('ORIGINAL '+pin.name+' '+pin.hash+' '+entries.length+' dated May-Aug messages');
 return entries;
}
/** @param {any[]} entries */
function scanNames(entries,label){
 const counts=new Map();
 for(const e of entries){
  const names=[...new Set((e.body.match(/#[a-z0-9][a-z0-9_-]{3,}/ig)||[]).map(x=>x.toLowerCase()))];
  for(const name of names){
   const v=counts.get(name)||{name,mentions:0,ircContext:0,examples:[]};
   v.mentions++;
   if(/\b(?:irc|channel|freenode|join|server|chat|switched|moved)\b/i.test(e.body)){
    v.ircContext++;
    if(v.examples.length<3)v.examples.push(e);
   }
   counts.set(name,v);
  }
 }
 const arr=[...counts.values()].sort((a,b)=>b.ircContext-a.ircContext||b.mentions-a.mentions);
 console.log(label+'-CHANNEL-CANDIDATES '+JSON.stringify(arr.slice(0,40)));
}
const op=/\b(?:decrypt|decipher|plaintext|cleartext|cipher|vigenere|keyword|key|encrypt|shift|prime|totient|modulo|algorithm|solved|solution|cracked|offset)\b/i;
const page=/\b(?:liber\s*primus|lp2|page\s*[0-9]{1,2}\b|p\s*[0-9]{1,2}\b|runes?|manuscript|book|chapter)\b/i;
/** @param {any[]} entries */
function scanSister(entries){
 const hits=entries.map((e,i)=>({e,i})).filter(x=>page.test(x.e.body)&&op.test(x.e.body));
 const other=entries.filter(e=>page.test(e.body)&&!op.test(e.body));
 console.log('SISTER-STAT '+JSON.stringify({compoundHits:hits.length,pageOnly:other.length}));
 let last=-10000;
 for(const x of hits){
  if(x.i-last<=8)continue;
  last=x.i;
  console.log('SISTER-OP '+JSON.stringify({seed:x.e,window:entries.slice(Math.max(0,x.i-4),x.i+5)}));
 }
 for(const e of other.slice(0,65))console.log('SISTER-PAGE-ONLY '+JSON.stringify(e));
}
function main(){
 assert.equal(sha(Buffer.from('test')),'30d74d258442c7c65512eafab474568dd706c430');
 if(process.argv[2]==='--selftest'){
  assert(page.test('page 42'));assert(op.test('key'));console.log('PASS planted positive controls');return;
 }
 assert.equal(process.argv.length,4,'pass original two log paths');
 const primary=load(process.argv[2],inputs[0]),sister=load(process.argv[3],inputs[1]);
 scanNames(primary,'PRIMARY');
 scanNames(sister,'SISTER');
 scanSister(sister);
}
main();
