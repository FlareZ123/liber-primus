'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const MOD=29;

const corpus=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const grid=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-grid-256.json'),'utf8'));
const gibran=fs.readFileSync(path.join(ROOT,'resources/control/gibran_prophet_58585.txt'),'utf8');
const bytes=grid.pages.flatMap(p=>p.bytes);

const startK=236,targetK=748;
const directions=[];let k=startK;
while(k!==targetK){
 assert.ok(directions.length<840,'target must be reachable before cycle');
 const col=k%MOD,step=bytes[col];
 directions.push(step);
 k=(k+step)%840;
}
assert.equal(directions.length,21);
const key=directions.map(v=>v%MOD);
assert.deepEqual(key,[10,9,0,0,0,0,22,28,5,21,4,28,5,1,0,0,0,0,0,0,0]);

const p15=corpus.pages.find(p=>p.page===15);assert(p15);
assert.equal(p15.runic_count,159);
const body=p15.indices.slice(20);
assert.equal(body.length,139);

const DIGRAPHS=['TH','EO','NG','OE','AE','IA','EA'];
function gpWord(word){
 const s=word.toUpperCase().replace(/QU/g,'CW').replace(/[KV]/g,'C').replace(/Z/g,'S');
 const out=[];
 for(let i=0;i<s.length;){
   let token=null,step=1;
   if(s.slice(i,i+3)==='ING'){token='NG';step=3;}
   else{
     for(const d of DIGRAPHS)if(s.slice(i,i+d.length)===d){token=d;step=d.length;break;}
     if(!token)token=s[i];
   }
   const j=corpus.translit.indexOf(token);if(j>=0)out.push(j);
   i+=step;
 }
 return out;
}
const gpText=text=>(text.match(/[A-Za-z]+/g)||[]).flatMap(gpWord);
const native=gpText(gibran),trainLength=20000;
assert.ok(native.length>=trainLength+body.length);
const train=native.slice(0,trainLength),plant=native.slice(trainLength,trainLength+body.length);

const counts=Array.from({length:MOD},()=>Array(MOD).fill(0.25));
for(let i=1;i<train.length;i++)counts[train[i-1]][train[i]]+=1;
const logp=counts.map(row=>{const total=row.reduce((a,b)=>a+b,0);return row.map(v=>Math.log(v/total));});
const score=a=>{let s=0;for(let i=1;i<a.length;i++)s+=logp[a[i-1]][a[i]];return s/(a.length-1);};
const ioc=a=>{const f=Array(MOD).fill(0);for(const x of a)f[x]++;return f.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));};
const apply=(a,phase,sign)=>a.map((v,i)=>((v+sign*key[(i+phase)%key.length])%MOD+MOD)%MOD);

const encryptedPlant=plant.map((v,i)=>(v+key[i%key.length])%MOD);
assert.deepEqual(apply(encryptedPlant,0,-1),plant);

function census(cipher){
 const rows=[];
 for(let phase=0;phase<key.length;phase++){
   const plain=apply(cipher,phase,-1);
   rows.push({phase,score:score(plain),ioc:ioc(plain),prefix:plain.slice(0,100).map(x=>corpus.translit[x]).join('')});
 }
 rows.sort((a,b)=>b.score-a.score||a.phase-b.phase);
 return rows;
}
const plantRows=census(encryptedPlant);
assert.equal(plantRows.findIndex(r=>r.phase===0)+1,1);

const rows=census(body),minus=apply(body,0,-1),plus=apply(body,0,1);
const result={
 schema:'lp2-p15-redpath-adjacent-body-pad-v1',
 classification:'prospectively frozen source/table path-key consumer',
 input:{page:15,bodyStart:20,bodyRunes:body.length,startK,targetK,pathSteps:directions.length,directions,key},
 heldNativePlant:{phase0Rank:plantRows.findIndex(r=>r.phase===0)+1,trueScore:score(plant),top5:plantRows.slice(0,5)},
 original:{
   rawScore:score(body),rawIoC:ioc(body),
   subtraction:{phase0Rank:rows.findIndex(r=>r.phase===0)+1,score:score(minus),ioc:ioc(minus),prefix:minus.slice(0,160).map(x=>corpus.translit[x]).join('')},
   addition:{score:score(plus),ioc:ioc(plus),prefix:plus.slice(0,160).map(x=>corpus.translit[x]).join('')},
   topPhases:rows.slice(0,10),
 },
 decision:'The receiver, 21 direction numbers, mod29 reduction, forward order, phase0 and subtraction sign were frozen before output inspection. Native plant validates phase sensitivity. Promote only if original phase0 is native-like/coherent; otherwise reject this literal additive adjacent-body consumer without retuning.',
};
const json=JSON.stringify(result,null,2);
console.log(json);
if(process.env.RUNNER_TEMP)fs.writeFileSync(path.join(process.env.RUNNER_TEMP,'source-test-output.json'),json);
