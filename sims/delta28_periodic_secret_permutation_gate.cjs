'use strict';
/**
 * Test arbitrary secret per-phase 28-symbol permutations after the observed
 * LP2 near-nonrepeating GP-index difference coding.
 *
 * Reproduction: node sims/delta28_periodic_secret_permutation_gate.cjs
 * Native source calibration uses only decrypted LP2 p56 and clear LP2 p57.
 * No unknown plaintext or key is assumed or recovered.
 *
 * @typedef {{symbol:number, global:number, page:number,
 *   nonzeroPage:number, pageIndex:number}} Observation
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const corpus=JSON.parse(fs.readFileSync(path.join(__dirname,'..',
  'resources/liber-primus/lp2-corpus.json'),'utf8'));
const pages=corpus.pages.filter(p=>p.page<56 && p.indices.length>0);
const mod=(x,n)=>(x%n+n)%n;
assert.equal(pages.length,55);
assert.equal(pages.reduce((s,p)=>s+p.indices.length,0),12956);

/** @returns {number[]} */
function referenceNativeGP(){
  const primes=[];
  for(let n=2;primes.length<200;n++){
    let prime=true;
    for(let d=2;d*d<=n;d++)if(n%d===0){prime=false;break;}
    if(prime)primes.push(n);
  }
  let i=0;
  const p56=corpus.pages[56].indices.map(c=>
    c===0?0:mod(c-(primes[i++]-1),29));
  const native=[...p56,...corpus.pages[57].indices].filter(v=>v!==28);
  assert.equal(native.length,178);
  assert.equal(native.filter(v=>v===18).length,25);
  return native;
}
const native=referenceNativeGP();

/** @returns {Observation[]} */
function observed(){
  /** @type {Observation[]} */
  const observations=[];
  let global=0;
  let repeat=0;
  for(const page of pages){
    let nonzeroPage=0;
    for(let i=1;i<page.indices.length;i++){
      const step=mod(page.indices[i]-page.indices[i-1],29);
      if(step===0){repeat++;continue;}
      observations.push({symbol:step-1,global:global+i,page:i,
        nonzeroPage,pageIndex:page.page});
      nonzeroPage++;
    }
    global+=page.indices.length;
  }
  assert.equal(repeat,86);
  assert.equal(observations.length,12815);
  return observations;
}
const real=observed();
const clockModes=['global','page','nonzeroPage'];
/** @param {Observation} o @param {string} clock */
function coordinate(o,clock){
  return clock==='global'?o.global:clock==='page'?o.page:o.nonzeroPage;
}
/** @param {Observation[]} obs @param {string} clock @param {number} period
 * @returns {number}
 */
function predictiveLift(obs,clock,period){
  const train=obs.filter(x=>x.pageIndex<=27);
  const test=obs.filter(x=>x.pageIndex>=28);
  const alpha=0.5;
  const histogram=Array.from({length:period},()=>new Uint16Array(29));
  const marginal=new Uint32Array(28);
  for(const x of train){
    const row=histogram[coordinate(x,clock)%period];
    row[x.symbol]++;
    row[28]++;
    marginal[x.symbol]++;
  }
  const baseline=Array.from(marginal,v=>Math.log((v+alpha)/
    (train.length+28*alpha)));
  let lift=0;
  for(const x of test){
    const row=histogram[coordinate(x,clock)%period];
    lift+=Math.log((row[x.symbol]+alpha)/(row[28]+28*alpha))
      -baseline[x.symbol];
  }
  return lift;
}
const scores={};
for(const clock of clockModes){
  const values=[];
  for(let period=1;period<=256;period++)
    values.push({period,heldoutNats:predictiveLift(real,clock,period)});
  assert.equal(values[0].heldoutNats,0);
  const bestNontrivial=values.slice(1).reduce((a,b)=>b.heldoutNats>a.heldoutNats?b:a);
  assert.ok(bestNontrivial.heldoutNats<0,'unexpected original positive phase signal');
  scores[clock]={bestNontrivial,period16:values[15].heldoutNats,
    period28:values[27].heldoutNats,period64:values[63].heldoutNats,
    period128:values[127].heldoutNats,period256:values[255].heldoutNats,
    countNonpositive:values.filter(x=>x.heldoutNats<=0).length};
}
let state=0x53179024;
/** @returns {number} */
function random(){
  state ^= state<<13;
  state ^= state>>>17;
  state ^= state<<5;
  return state>>>0;
}
/** @returns {number[]} */
function permutation(){
  const values=Array.from({length:28},(_,i)=>i);
  for(let i=27;i>0;i--){
    const j=random()%(i+1);
    [values[i],values[j]]=[values[j],values[i]];
  }
  return values;
}
/**
 * Encrypt original-layout, native-GP-sampled plaintext with a genuinely
 * hidden permutation per public clock phase. Preserve every original EA
 * anchor (zero ciphertext step) and page length. Independently invert
 * each original-site observation with the true key to verify 100% recovery.
 *
 * @param {number} period @param {string} clock
 * @returns {Observation[]}
 */
function nativePlant(period,clock){
  const key=Array.from({length:period},permutation);
  /** @type {Observation[]} */
  const output=[];
  let global=0;
  let recovered=0;
  for(const page of pages){
    let previous=page.indices[0];
    let nonzeroPage=0;
    for(let i=1;i<page.indices.length;i++){
      const d=mod(page.indices[i]-page.indices[i-1],29);
      if(d===0){
        const next=previous;
        assert.equal(mod(next-previous,29),0);
        recovered++;
        continue;
      }
      const o={symbol:-1,global:global+i,page:i,
        nonzeroPage,pageIndex:page.page};
      const phase=coordinate(o,clock)%period;
      const plaintext=native[random()%native.length];
      const step=key[phase][plaintext]+1;
      const next=mod(previous+step,29);
      const candidate=mod(next-previous,29);
      const decoded=key[phase].indexOf(candidate-1);
      assert.equal(decoded,plaintext);
      assert.equal(mod(decoded,29),plaintext);
      previous=next;
      output.push({...o,symbol:step-1});
      nonzeroPage++;
      recovered++;
    }
    global+=page.indices.length;
  }
  assert.equal(recovered,12901);
  assert.equal(output.length,real.length);
  return output;
}
const controls=[];
for(const period of [16,28,64,128,256]){
  for(const clock of clockModes){
    const obs=nativePlant(period,clock);
    const trueLift=predictiveLift(obs,clock,period);
    const wrongLift=predictiveLift(obs,clock,period+1);
    // Dense English-like source remains detectable for all covered keys.
    assert.ok(trueLift>0,
      'synthetic planted 28-rune phase-key escaped the score at '+period+'/'+clock);
    assert.ok(trueLift>wrongLift+150,
      'incorrect neighboring phase period was not rejected');
    controls.push({period,clock,trueLift,wrongLift});
  }
}
console.log(JSON.stringify({
  evidence:'Original-only finite predictive rejection of stationary public-clock per-phase 28-symbol secret permutations under native-GP source controls',
  input:{runePages:pages.length,runes:12956,adjacentEqual:86,
    transitionCount:12815,trainObserved:real.filter(o=>o.pageIndex<=27).length,
    heldoutObserved:real.filter(o=>o.pageIndex>=28).length},
  source:{decryptedPage56:85,clearPage57:95,
    nonMarkerNativeRunes:native.length,nativeE:native.filter(x=>x===18).length},
  observations:{periodRange:[1,256],alphaPerSymbol:0.5,
    scores},
  sourceNativeSecretPermutationControls:controls,
  limits:'Conditional direct native-GP coding; public global/page/nonzero-page phase clocks, independent stationary source. No constraints on nonlinear secret state, per-page key, binary/codebook intermediate, or arbitrarily changing phase.'
},null,2));
