'use strict';
/**
 * Second-order ciphertext-state frequency invariant for original LP2.
 * Test fixed bijective GP29 emission rows indexed by C[i-2]; the output
 * distribution within a row is only a permutation of plaintext frequencies.
 * Node 22, CommonJS; original inputs and native solved English controls.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} p @returns {any} */
const load = p => JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const cp = load('resources/liber-primus/lp2-corpus.json');
const source = load('resources/external/relikd-solved-gp29-native-v1.json');
const unknown = cp.pages.slice(0,56).filter(p=>p.indices.length).map(p=>p.indices);
const known = source.sections.map(section => Array.from(section.source_text)
  .filter(ch=>source.runes.includes(ch))
  .map(ch=>source.runes.indexOf(ch)));
assert.equal(unknown.length,55);
assert.equal(unknown.reduce((n,p)=>n+p.length,0),12956);
assert.equal(known.reduce((n,p)=>n+p.length,0),2979);
/** @param {number[][]} pages @returns {{state:number,step:number,page:number}[]} */
function events(pages) {
  return pages.flatMap((p,page)=>p.slice(2).map((c,k)=>({
    state:p[k],step:(c-p[k+1]+29)%29,page
  })));
}
/** @param {{state:number,step:number,page:number}[]} es */
function stat(es) {
  const counts=Array.from({length:29},()=>new Int32Array(29));
  const rows=new Int32Array(29),columns=new Int32Array(29);
  let zeros=0;
  for (const {state,step} of es) {
    counts[state][step]++;rows[state]++;columns[step]++;
    zeros+=Number(step===0);
  }
  let coll=0,pairs=0,chi=0,mi=0;
  for(let a=0;a<29;a++) {
    pairs+=rows[a]*(rows[a]-1);
    for(let b=0;b<29;b++) {
      let x=counts[a][b],exp=rows[a]*columns[b]/es.length;
      coll+=x*(x-1);
      if(exp>0)chi+=(x-exp)**2/exp;
      if(x)mi+=x/es.length*Math.log2(x*es.length/(rows[a]*columns[b]));
    }
  }
  return {
    n:es.length,zeros,conditionalNormalizedIoC:29*coll/pairs,
    chiSquareIndependence:chi,mutualInformationBits:mi,
    minRow:Math.min(...rows),maxRow:Math.max(...rows)
  };
}
/** @param {number[][]} pages @param {(twoBack:number,p:number)=>number} emit */
function enc(pages,emit) {
  return pages.map(input=>{
    let prev=0,back=0;
    return input.map(p=>{
      const c=(prev+emit(back,p))%29;
      back=prev;prev=c;return c;
    });
  });
}
/** @param {number} seed @returns {()=>number} */
function prng(seed) {
  let x=seed|0;
  return ()=>{
    x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;
  };
}
/** @param {number} seed @returns {number[][]} */
function makeRows(seed) {
  const r=prng(seed);
  return Array.from({length:29},()=>{
    const out=Array.from({length:28},(_,i)=>i+1);
    for(let i=27;i>0;i--){const j=r()%(i+1);[out[i],out[j]]=[out[j],out[i]];}
    out.push(0);assert.equal(new Set(out).size,29);return out;
  });
}
const originalEvents=events(unknown);
assert.equal(originalEvents.length,12846);
const original=stat(originalEvents);
const rotor=stat(events(enc(known,(v,p)=>p===28?0:1+(p+v)%28)));
const controls=[];
for(let seed=1;seed<=100;seed++){
  const table=makeRows(0x33010000+seed);
  controls.push(stat(events(enc(known,(v,p)=>table[v][p]))).conditionalNormalizedIoC);
}
controls.sort((a,b)=>a-b);
assert.ok(controls[0]>original.conditionalNormalizedIoC);
const byPage=unknown.map(()=>[]);
originalEvents.forEach((event,i)=>byPage[event.page].push(i));
const shuffle=prng(0x33012016);
const steps=originalEvents.map(e=>e.step);
let lower=0,upper=0,sum=0;
const N=2000;
for(let t=0;t<N;t++){
  const shuffled=[...steps];
  for(const ids of byPage)for(let j=ids.length-1;j>0;j--){
    const k=shuffle()%(j+1),x=ids[j],y=ids[k];
    [shuffled[x],shuffled[y]]=[shuffled[y],shuffled[x]];
  }
  const val=stat(originalEvents.map((e,i)=>({
    state:e.state,step:shuffled[i],page:e.page
  }))).conditionalNormalizedIoC;
  lower+=Number(val<=original.conditionalNormalizedIoC);
  upper+=Number(val>=original.conditionalNormalizedIoC);
  sum+=val;
}
console.log(JSON.stringify({
  test:'fixed ciphertext two-back GP29 state-row bijection, no trained key',
  sourceOriginal:original,
  sourceNativeSolvedFixedRotor:rotor,
  sourceNativeSolvedSecretRows:{tested:controls.length,min:controls[0],
    median:controls[49],max:controls.at(-1)},
  originalPageStratifiedShuffle:{permutations:N,seed:'0x33012016',
    nullMeanIoC:sum/N,lowerOrEqual:lower,upperOrEqual:upper,
    lowerTailP:(lower+1)/(N+1),upperTailP:(upper+1)/(N+1)},
  decision:'No strong original state-conditioned language signal for stationary two-back codebooks; this is a source-limited model exclusion, not plaintext.'
},null,2));
