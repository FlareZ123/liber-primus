'use strict';
// Exact source-gated 56-page Q^15 candidate clock; no ciphertext-fitted keys.
// Agent48, 2026-11-28. From repository root: node sims/lp2_p3_q_b15_pageclock_original_sft.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname,'..');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-ink-annotations.json'),'utf8'));
const english = fs.readFileSync(path.join(ROOT,'resources/control/gibran_prophet_58585.txt'),'utf8');
const M=29, PERIOD=840;
const mod = x=>(x%M+M)%M, mod840=x=>(x%PERIOD+PERIOD)%PERIOD;
const mul=(x,y)=>[mod(x[0]*y[0]+8*x[1]*y[1]),mod(x[0]*y[1]+x[1]*y[0]+3*x[1]*y[1])];
const eq=(a,b)=>a[0]===b[0]&&a[1]===b[1];
const Q=[17,24], powers=[];
let x=[1,0];
for(let k=0;k<PERIOD;k++){powers.push(x);x=mul(x,Q);}
assert.deepEqual(x,[1,0]);assert(!powers.slice(1).some(y=>eq(y,[1,0])));
assert.deepEqual(powers[15],[21,15]);
assert.deepEqual(powers[420],[28,0]);
assert.equal(mod(8**2),6);
assert.equal(powers[15].length,2);
const state56=powers[15];
let y=[1,0],ord=0;do{y=mul(y,state56);ord++;}while(!eq(y,[1,0])&&ord<841);
assert.equal(ord,56);
const pages=corpus.pages.filter(p=>p.page>=0&&p.page<=55);
assert.equal(pages.length,56);
const raw=pages.flatMap(p=>p.indices);
assert.equal(raw.length,12956);
const translit=corpus.translit;
function gpWord(word) {
  const s=word.toUpperCase().replace(/QU/g,'CW').replace(/[KV]/g,'C').replace(/Z/g,'S');
  const out=[];const doublets=['TH','EO','NG','OE','AE','IA','EA'];
  for(let i=0;i<s.length;){
    let sym=null,n=1;
    if(s.slice(i,i+3)==='ING'){sym='NG';n=3;}
    else for(const d of doublets){if(s.startsWith(d,i)){sym=d;n=d.length;break;}}
    if(!sym)sym=s[i];
    const index=translit.indexOf(sym);if(index>=0)out.push(index);
    i+=n;
  }
  return out;
}
const native=(english.match(/[A-Za-z]+/g)||[]).flatMap(gpWord);
const training=native.slice(0,20000);
assert.equal(training.length,20000);
const counts=Array.from({length:29},()=>Array(29).fill(0.25));
for(let i=1;i<training.length;i++)counts[training[i-1]][training[i]]++;
const logp=counts.map(row=>{const t=row.reduce((s,v)=>s+v,0);return row.map(v=>Math.log(v/t));});
function score(tape){let s=0;for(let i=1;i<tape.length;i++)s+=logp[tape[i-1]][tape[i]];return s/(tape.length-1);}
function ioc(tape){const f=Array(29).fill(0);for(const v of tape)f[v]++;return f.reduce((s,v)=>s+v*(v-1),0)/(tape.length*(tape.length-1));}
const round=x=>+x.toFixed(6);
function better(a,b){return b.score-a.score||a.seed-b.seed;}
function top5Push(best,item){if(best.length<5||item.score>best[best.length-1].score){best.push(item);best.sort(better);best.length=Math.min(best.length,5);}}
// In each page take complete rune pairs. At most one terminal rune/page is
// excluded, rather than inventing a padding symbol or a page-crossing pair.
const pairOriginal=pages.flatMap(p=>p.indices.slice(0,2*Math.floor(p.indices.length/2)));
const pairCount=pairOriginal.length/2;assert.equal(pairOriginal.length,12924);
function pairExponents(step,dir){
  return pages.flatMap(p=>Array.from({length:Math.floor(p.indices.length/2)},(_,j)=>mod840(dir*(15*p.page+step*j))));
}
function pairCodec(input,exps,seed,op,inverse){
  const out=new Array(input.length);
  for(let j=0;j<exps.length;j++){
    const e=mod840(exps[j]+seed),m=powers[e];
    const xy=[input[2*j],input[2*j+1]];
    const zz=op==='mul'?mul(xy,powers[inverse?mod840(-e):e]):
      [mod(xy[0]+(inverse?-m[0]:m[0])),mod(xy[1]+(inverse?-m[1]:m[1]))];
    out[2*j]=zz[0];out[2*j+1]=zz[1];
  }
  return out;
}
function pairScan(input,exps,op){
  const best=[];
  for(let seed=0;seed<PERIOD;seed++){
    const plain=pairCodec(input,exps,seed,op,true);
    const item={seed,score:score(plain),ioc:ioc(plain)};
    top5Push(best,item);
  }
  return best.map(o=>({seed:o.seed,score:round(o.score),ioc:round(o.ioc)}));
}
const pairHeld=native.slice(21000,21000+pairOriginal.length);
assert.equal(pairHeld.length,pairOriginal.length);
const pairModes=[];
for(const step of [0,1])for(const dir of [1,-1]){
 const exps=pairExponents(step,dir);assert.equal(exps.length,pairCount);
 for(const op of ['mul','add']){
  const originalBest=pairScan(pairOriginal,exps,op);
  // Native-language positive controls use the IDENTICAL page arities and
  // fixed alphabet scoring model, not a synthetic short-window toy.
  const ciphertext=pairCodec(pairHeld,exps,23,op,false);
  const exact=pairCodec(ciphertext,exps,23,op,true);
  assert.deepEqual(exact,pairHeld);
  const plantedBest=pairScan(ciphertext,exps,op);
  assert.equal(plantedBest[0].seed,23,'native positive control must rank seed23 first');
  assert(originalBest[0].score<-4.55,'original must remain far below native plant');
  pairModes.push({step,dir,op,originalBest:originalBest.slice(0,3),positiveTop:plantedBest[0]});
}}
// Scalar families: a, b and trace are nonzero GF29-linear functionals,
// which become the same complete phase family as Q^seed ranges over all 840
// nonzero field multipliers. Reversal of sign is shift420 for linear readouts.
// Norm is period28 and its sign reversal is shift14, so only trace and norm
// with one sign need independent enumeration.
const scalarOriginal=raw;
const scalarHeld=native.slice(21000,21000+raw.length);
assert.equal(scalarHeld.length,raw.length);
const trace=z=>mod(2*z[0]+3*z[1]);
const norm=z=>mod(z[0]*z[0]+3*z[0]*z[1]-8*z[1]*z[1]);
assert.equal(trace(powers[420]),mod(-trace([1,0])));
assert.equal(norm(powers[14]),28);
function scalarExponents(step,dir){
 return pages.flatMap(p=>p.indices.map((_,j)=>mod840(dir*(15*p.page+step*j))));
}
function scalarCodec(input,exps,seed,law,inverse){
 const out=new Array(input.length);
 for(let i=0;i<input.length;i++){
  const k=(law==='trace'?trace:norm)(powers[mod840(exps[i]+seed)]);
  out[i]=mod(input[i]+(inverse?-k:k));
 }
 return out;
}
function scalarScan(input,exps,law){
 const best=[];
 const limit=law==='trace'?840:28;
 for(let seed=0;seed<limit;seed++){
  const text=scalarCodec(input,exps,seed,law,true);
  top5Push(best,{seed,score:score(text),ioc:ioc(text)});
 }
 return best.map(o=>({seed:o.seed,score:round(o.score),ioc:round(o.ioc)}));
}
const scalarModes=[];
for(const step of [0,1])for(const dir of [1,-1]){
 const exps=scalarExponents(step,dir);
 for(const law of ['trace','norm']){
  const originalBest=scalarScan(scalarOriginal,exps,law);
  const cipher=scalarCodec(scalarHeld,exps,23,law,false);
  assert.deepEqual(scalarCodec(cipher,exps,23,law,true),scalarHeld);
  const plant=scalarScan(cipher,exps,law);
  assert.equal(plant[0].score,round(score(scalarHeld)),'positive control native score');
  assert(plant.some(v=>v.seed===23), 'true native seed must be a winning recovered phase');
  assert(originalBest[0].score<-4.55);
  scalarModes.push({step,dir,law,originalBest:originalBest.slice(0,3),positiveTop:plant[0]});
 }}
// Exact page-to-page red-state transport is a separate source-only control.
const red=ink.pages.flatMap(p=>(p.red_spans||[]).map(s=>{
 let z=[0,0];for(let i=s.start+s.length-1;i>=s.start;i--){z=mul(z,[0,1]);z[0]=mod(z[0]+corpus.pages[p.page].indices[i]);}
 return {page:p.page,start:s.start,length:s.length,state:z};
}));
assert.equal(red.length,18);
const redEdges=[];
for(let i=0;i<red.length;i++)for(let j=0;j<red.length;j++){
 if(i===j||red[i].page===red[j].page)continue;
 const delta=mod840(red[j].page-red[i].page);
 const e=mod840(15*delta);
 if(eq(mul(red[i].state,powers[e]),red[j].state))redEdges.push([i,j]);
}
assert.equal(redEdges.length,0);
// The solved p56 red title supplies independently authenticated initial
// [1,2] prime-minus-one shifts under the already-source-frozen multiplier Q.
// If the Q^15 clock transfers that *same* key packet across the 56
// unresolved pages, its nine long original page-initial headings must agree
// with the solved p56 seed transported by (page-56) steps.
const p56red=red.find(r=>r.page===56&&r.start===0&&r.length===5);
assert(p56red && eq(mul(Q,p56red.state),[1,2]));
const anchoredClock=red.filter(r=>r.page<=55&&r.start===0&&r.length>=8)
 .map(r=>({
  page:r.page,
  observedQRed:mul(Q,r.state),
  predicted:mul([1,2],powers[mod840(15*(r.page-56))])
 }));
for(const r of anchoredClock)r.matches=eq(r.observedQRed,r.predicted);
assert.equal(anchoredClock.length,9);
assert.equal(anchoredClock.filter(r=>r.matches).length,0);
const report={
 schema:1,classification:'source-motivated Q^15 56-page cycle; direct original-cipher negative',
 origin:{field:'GF29[u]/(u^2-3u-8)',Q,orderQ:840,b2013:15,clock:powers[15],orderClock:56,
     manuscriptUnknownPages:56,unpairedRunesOmitted:raw.length-pairOriginal.length},
 score:{model:'GP29 bigram from first20k independent Gibran native runes; unsmoothed evidence not used',
   baselineOriginal:round(score(raw)),baselineNative:round(score(scalarHeld)),
   originalIoC:round(ioc(raw)),nativeIoC:round(ioc(scalarHeld))},
 family:{pair:'4 source schedules x [multiplicative,additive] x 840 exact starting states each',
         scalar:'4 schedules x [trace(840 phases),norm(28 phases)]; coefficient readouts and +/- are phase-equivalent',
         pairFraming:'page-local consecutive complete pairs; at most one leftover rune per page omitted',
         red:'18 full printed red spans; ordered distinct-page Q^(15*pageDelta) transitions'},
 redEdges,anchoredClock,pairModes,scalarModes,
 decision:'Direct page-clock GF841 pair transports and trace/norm GP29 keystreams produce no native plaintext on LP2, despite rank-one native planted controls. This does not exclude a keyed/reordered/nonsimple cipher. No authenticated LP2 plaintext or author-selected page clock.'
};
assert.equal(Math.max(...pairModes.map(m=>m.originalBest[0].score))<-4.55,true);
assert.equal(Math.max(...scalarModes.map(m=>m.originalBest[0].score))<-4.55,true);
console.log(JSON.stringify(report,null,2));
if(process.env.RUNNER_TEMP)fs.writeFileSync(path.join(process.env.RUNNER_TEMP,'lp2-p3-q-b15-pageclock-output.json'),JSON.stringify(report,null,2));
