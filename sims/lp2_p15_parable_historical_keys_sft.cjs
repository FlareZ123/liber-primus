'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..'),MOD=29;
const corpus=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const gibran=fs.readFileSync(path.join(ROOT,'resources/control/gibran_prophet_58585.txt'),'utf8');
const body=corpus.pages.find(p=>p.page===15).indices.slice(20);
assert.equal(body.length,139);

const DIGRAPHS=['TH','EO','NG','OE','AE','IA','EA'];
function gpWord(word){
 const s=word.toUpperCase().replace(/QU/g,'CW').replace(/K/g,'C').replace(/V/g,'U').replace(/Z/g,'S');
 const out=[];
 for(let i=0;i<s.length;){
  let token=null,step=1;
  if(s.slice(i,i+3)==='ING'){token='NG';step=3;}
  else{for(const d of DIGRAPHS)if(s.slice(i,i+d.length)===d){token=d;step=d.length;break;}if(!token)token=s[i];}
  const j=corpus.translit.indexOf(token);if(j>=0)out.push(j);i+=step;
 }
 return out;
}
const keys={CIRCUMFERENCE:gpWord('CIRCUMFERENCE'),DIVINITY:gpWord('DIVINITY')};
assert.deepEqual(keys.CIRCUMFERENCE,[5,10,4,5,1,19,0,18,4,18,9,5,18]);
assert.deepEqual(keys.DIVINITY,[23,10,1,10,9,10,16,26]);

const native=(gibran.match(/[A-Za-z]+/g)||[]).flatMap(gpWord),train=native.slice(0,20000),plant=native.slice(20000,20000+body.length);
const counts=Array.from({length:MOD},()=>Array(MOD).fill(.25));
for(let i=1;i<train.length;i++)counts[train[i-1]][train[i]]++;
const logp=counts.map(row=>{const z=row.reduce((a,b)=>a+b,0);return row.map(v=>Math.log(v/z));});
const score=a=>{let s=0;for(let i=1;i<a.length;i++)s+=logp[a[i-1]][a[i]];return s/(a.length-1);};
const ioc=a=>{const f=Array(MOD).fill(0);for(const x of a)f[x]++;return f.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));};

function test(key){
 const apply=(a,phase,sign)=>a.map((v,i)=>((v+sign*key[(i+phase)%key.length])%MOD+MOD)%MOD);
 const enc=plant.map((v,i)=>(v+key[i%key.length])%MOD);
 const census=a=>Array.from({length:key.length},(_,phase)=>{const p=apply(a,phase,-1);return{phase,score:score(p),ioc:ioc(p),prefix:p.slice(0,100).map(x=>corpus.translit[x]).join('')}}).sort((a,b)=>b.score-a.score||a.phase-b.phase);
 const pc=census(enc),oc=census(body),minus=apply(body,0,-1),plus=apply(body,0,1);
 assert.equal(pc.findIndex(x=>x.phase===0)+1,1);
 return {key,heldPhase0Rank:1,rawScore:score(body),phase0Rank:oc.findIndex(x=>x.phase===0)+1,subtract:{score:score(minus),ioc:ioc(minus),prefix:minus.slice(0,140).map(x=>corpus.translit[x]).join('')},add:{score:score(plus),ioc:ioc(plus),prefix:plus.slice(0,140).map(x=>corpus.translit[x]).join('')},top5:oc.slice(0,5)};
}
const result={
 schema:'lp2-p15-parable-historical-keys-v1',
 classification:'prospectively frozen PARABLE-selected historical-key transfer; negative',
 normalization:'standard GP variants K->C, V->U, Z->S, QU->CW',
 input:{page:15,bodyStart:20,bodyRunes:body.length},
 CIRCUMFERENCE:test(keys.CIRCUMFERENCE),
 DIVINITY:test(keys.DIVINITY),
 decision:'Both held native controls recover phase0 first. Original p15 phase0 is nonprose and worse than raw for both exact keys. Reject literal repeating Vigenere transfer of CIRCUMFERENCE and DIVINITY to p15 offset20; do not derive variants.',
};
assert.equal(result.CIRCUMFERENCE.phase0Rank,13);
assert.equal(result.DIVINITY.phase0Rank,2);
const json=JSON.stringify(result,null,2);console.log(json);
if(process.env.RUNNER_TEMP)fs.writeFileSync(path.join(process.env.RUNNER_TEMP,'source-test-output.json'),json);
