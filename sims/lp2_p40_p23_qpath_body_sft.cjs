'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const MOD=29;
const corpus=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const ink=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-ink-annotations.json'),'utf8'));
const gibran=fs.readFileSync(path.join(ROOT,'resources/control/gibran_prophet_58585.txt'),'utf8');
const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
const mod=x=>((x%MOD)+MOD)%MOD;
const mul=(x,y)=>[mod(x[0]*y[0]+8*x[1]*y[1]),mod(x[0]*y[1]+x[1]*y[0]+3*x[1]*y[1])];
const ev=a=>{let z=[0,0],p=[1,0];for(const c of a){z=[mod(z[0]+c*p[0]),mod(z[1]+c*p[1])];p=mul(p,[0,1]);}return z;};
const Q=[17,24];

const p23=corpus.pages.find(p=>p.page===23);assert(p23);
const redRecord=ink.pages.find(p=>p.page===23);assert(redRecord);
const red=redRecord.red_spans.find(s=>s.start===0&&s.length===16);assert(red);
const redRunes=[...red.runes].map(r=>{const v=runeIndex.get(r);assert.notEqual(v,undefined);return v;});
const seed=ev(redRunes);
assert.deepEqual(seed,[5,22]);
const body=p23.indices.slice(16);
assert.ok(body.length>50);

function keyStream(seedValue,n,phaseSteps=0){
  let state=[...seedValue];
  for(let i=0;i<phaseSteps;i++)state=mul(state,Q);
  const out=[];
  while(out.length<n){
    state=mul(state,Q);
    out.push(state[0],state[1]);
  }
  return out.slice(0,n);
}
const frozenKey=keyStream(seed,body.length,0);

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
const logp=counts.map(row=>{const t=row.reduce((a,b)=>a+b,0);return row.map(v=>Math.log(v/t));});
const score=a=>{let s=0;for(let i=1;i<a.length;i++)s+=logp[a[i-1]][a[i]];return s/(a.length-1);};
const ioc=a=>{const f=Array(MOD).fill(0);for(const x of a)f[x]++;return f.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));};
const apply=(a,k,sign)=>a.map((v,i)=>mod(v+sign*k[i]));

const encryptedPlant=apply(plant,frozenKey,+1);
assert.deepEqual(apply(encryptedPlant,frozenKey,-1),plant);

function phaseCensus(cipher){
  const rows=[];
  for(let phase=0;phase<840;phase++){
    const k=keyStream(seed,cipher.length,phase);
    const plain=apply(cipher,k,-1);
    rows.push({phase,score:score(plain),ioc:ioc(plain),prefix:plain.slice(0,80).map(x=>corpus.translit[x]).join('')});
  }
  rows.sort((a,b)=>b.score-a.score||a.phase-b.phase);
  return rows;
}
const plantRows=phaseCensus(encryptedPlant);
const plantRank=plantRows.findIndex(r=>r.phase===0)+1;
assert.equal(plantRank,1,'held native plant must rank frozen path phase first');

const originalRows=phaseCensus(body);
const frozenDecoded=apply(body,frozenKey,-1);
const inverseSign=apply(body,frozenKey,+1);
const frozenRank=originalRows.findIndex(r=>r.phase===0)+1;
const result={
  schema:'lp2-p40-p23-qpath-body-v1',
  classification:'prospectively frozen p40-selected p23 post-red Q-path additive consumer',
  input:{page:23,redLength:16,bodyRunes:body.length,seed,Q,boundary:'immediately after red opener',serialization:'advance Q once, emit [a,b], repeat',operation:'GP29 subtraction'},
  heldNativePlant:{runes:plant.length,phase0Rank:plantRank,trueScore:score(plant),trueIoC:ioc(plant),top5:plantRows.slice(0,5)},
  original:{
    rawScore:score(body),rawIoC:ioc(body),
    frozen:{phase:0,rankOf840:frozenRank,score:score(frozenDecoded),ioc:ioc(frozenDecoded),prefix:frozenDecoded.slice(0,160).map(x=>corpus.translit[x]).join('')},
    inverseSign:{score:score(inverseSign),ioc:ioc(inverseSign),prefix:inverseSign.slice(0,160).map(x=>corpus.translit[x]).join('')},
    top10SubtractionPhases:originalRows.slice(0,10),
  },
  decision:'The receiver, seed, advance rule, coordinate order, phase0 and subtraction sign were frozen before output inspection. Native plant validates sensitivity. Promote only if phase0 is native-like/coherent; otherwise reject this literal additive Q-path body consumer without retuning.',
};
const json=JSON.stringify(result,null,2);
console.log(json);
if(process.env.RUNNER_TEMP)fs.writeFileSync(path.join(process.env.RUNNER_TEMP,'source-test-output.json'),json);
