'use strict';

/**
 * One frozen source-typed, drifting-clock GP29 cipher hypothesis:
 *
 * K_(t+3) = 23*K_(t+2) + 5*K_(t+1) + 6*K_t (mod 29),
 * C_i = P_i + sign*K_t (mod 29).
 *
 * The signed historical DH worked example provides [p,g,a]=[23,5,6].
 * It does not instruct the use of an LFSR: this test is exploratory.
 * If a tentative C equals the preceding emitted C, a 0.81-probability
 * rejection consumes a fresh K and retries the same plaintext rune.
 *
 * All 29^3 unknown initial states and every possible number of collision
 * retries are marginalized EXACTLY by a finite-state forward algorithm.
 * Invariant all-zero state is handled with its exact infinite geometric tail.
 *
 * Source ciphertext is read as one continuous 12,956-rune stream. The
 * plaintext unigram is learned only from an external Shakespeare reference.
 * A held-out, independently seeded positive plant validates the model.
 *
 * Run: node sims/lp2_dh23_lfsr3_collision_skip_hmm_sft.cjs
 * Windows Node.js 22, CommonJS, zero external packages, read-only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encode} = require('./affine_echo_literary_control.cjs');

const ROOT = path.resolve(__dirname, '..');
const CORPUS = JSON.parse(fs.readFileSync(path.join(
  ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const C = CORPUS.pages.filter(p => p.page <= 55)
  .flatMap(p => p.indices);
assert.equal(C.length, 12956);
const REFERENCE = fs.readFileSync(path.join(
  ROOT, 'resources/control/shakespeare_first300k.txt'), 'utf8');
const N = 29, STATES = N*N*N, REJECT = 0.81, ACCEPT = 1-REJECT;
const TAP = [23,5,6];
/** @param {number} x @returns {number} */
const mod = x => (x % N + N) % N;

/** @returns {Float64Array} */
function referencePrior() {
  const count = new Float64Array(N).fill(1);
  for (const token of REFERENCE.match(/[A-Za-z]+/g) || []) {
    for (const rune of encode(token)) count[rune]++;
  }
  const sum = count.reduce((a,b) => a+b,0);
  return count.map(x => x/sum);
}
const q = referencePrior();
assert.ok(q.every(x => x > 0));
assert.ok(Math.abs(q.reduce((a,b)=>a+b,0)-1)<1e-12);

/** @param {number} s @returns {number} */
function transition(s) {
  const a = Math.floor(s/(N*N));
  const b = Math.floor(s/N)%N;
  const c = s%N;
  return b*N*N + c*N + (TAP[0]*c+TAP[1]*b+TAP[2]*a)%N;
}

/**
 * Precompute how many repeated pad symbols a state offers before one differs.
 * For these taps, all nonzero states have a constant prefix of length 1..3.
 * Zero is an absorbing state and its rejected-collision tail sums to 1.
 */
function prepare() {
  const first = new Uint8Array(STATES);
  const next = new Uint16Array(STATES);
  const runs = new Uint8Array(STATES);
  const changed = new Uint8Array(STATES);
  const stop = new Uint16Array(STATES);
  const same = new Uint16Array(STATES*3);
  for (let s=0;s<STATES;s++) {
    first[s] = Math.floor(s/(N*N));
    next[s] = transition(s);
    let cursor=s, length=0;
    while (length<4 && Math.floor(cursor/(N*N))===first[s]) {
      same[s*3 + length] = transition(cursor);
      cursor = transition(cursor);
      length++;
      if (s===0) break;
    }
    if (s===0) {
      runs[s]=0;
      changed[s]=0;
      stop[s]=0;
    } else {
      assert.ok(length>=1 && length<=3,
        'all nonzero states must change within three key draws');
      assert.notEqual(Math.floor(cursor/(N*N)),first[s]);
      runs[s]=length;
      changed[s]=Math.floor(cursor/(N*N));
      stop[s]=transition(cursor);
    }
  }
  return {first,next,runs,changed,stop,same};
}
const STATE=prepare();

/** @param {number[]} c @returns {number} */
function flatRepeatLogLikelihood(c) {
  let sum = -Math.log(N);
  const same = ACCEPT/(N-REJECT);
  const different = 1/(N-REJECT);
  for(let i=1;i<c.length;i++) {
    sum += Math.log(c[i]===c[i-1]?same:different);
  }
  return sum;
}

/**
 * Exact forward likelihood of the source-tap LFSR with collision skips.
 * @param {number[]} c Original or planted GP29 indices
 * @param {1|-1} sign c = p + sign*k
 * @returns {{logLik:number,baseline:number,llr:number,perRune:number,
 * posteriorMax:number,steps:number}}
 */
function forward(c,sign) {
  const direct = Array.from({length:N}, (_,r) => {
    const row = new Float64Array(N);
    for(let k=0;k<N;k++) row[k]=q[mod(r-sign*k)];
    return row;
  });
  let current=new Float64Array(STATES).fill(1/STATES);
  let logLik=0;
  for(let i=0;i<c.length;i++) {
    const nextProb=new Float64Array(STATES);
    const obs=c[i];
    if(i===0) {
      for(let s=0;s<STATES;s++) {
        nextProb[STATE.next[s]]+=current[s]*direct[obs][STATE.first[s]];
      }
    } else if (obs===c[i-1]) {
      for(let s=0;s<STATES;s++) {
        const mass=current[s]*direct[obs][STATE.first[s]];
        if(mass===0)continue;
        const r=STATE.runs[s];
        if(r===0) {
          nextProb[0]+=mass; // exact geometric tail: ACCEPT/(1-REJECT)=1
        }else{
          let power=ACCEPT;
          for(let j=0;j<r;j++) {
            nextProb[STATE.same[s*3+j]]+=mass*power;
            power*=REJECT;
          }
        }
      }
    } else {
      const difference=mod(obs-c[i-1]);
      const prev=c[i-1];
      for(let s=0;s<STATES;s++) {
        const mass=current[s];
        if(mass===0)continue;
        const key=STATE.first[s];
        nextProb[STATE.next[s]]+=mass*direct[obs][key];
        const run=STATE.runs[s];
        if(run>0 && mod(sign*(STATE.changed[s]-key))===difference) {
          nextProb[STATE.stop[s]]+=mass*
            direct[prev][key]*REJECT**run;
        }
      }
    }
    let norm=0;
    for(let s=0;s<STATES;s++)norm+=nextProb[s];
    assert.ok(norm>0 && Number.isFinite(norm));
    logLik+=Math.log(norm);
    const inv=1/norm;
    for(let s=0;s<STATES;s++) nextProb[s]*=inv;
    current=nextProb;
    if((i+1)%4096===0) console.log(
      'progress '+JSON.stringify({modelSign:sign,runes:i+1,
        sourceTap:TAP,rawLogLik:+logLik.toFixed(3)}));
  }
  let posteriorMax=0;
  for(const x of current)if(x>posteriorMax)posteriorMax=x;
  const baseline=flatRepeatLogLikelihood(c);
  return {logLik,baseline,llr:logLik-baseline,
    perRune:(logLik-baseline)/c.length,posteriorMax,steps:c.length};
}

/** @param {number} seed @returns {()=>number} */
function random(seed) {
  let state=seed>>>0;
  return()=> {
    state ^= state<<13;state^=state>>>17;state^=state<<5;
    return (state>>>0)/4294967296;
  };
}

/**
 * Reference-unigram English-like positive ciphertext, with exact
 * same-plaintext key-consumption on collision retries.
 * @param {number} length
 * @param {1|-1} sign
 */
function plant(length,sign,nativePlain=null) {
  const rng=random(0x4115ef27);
  let a=7,b=11,c=19;
  const nextKey=()=>{
    const result=a;
    [a,b,c]=[b,c,mod(TAP[0]*c+TAP[1]*b+TAP[2]*a)];
    return result;
  };
  const cdf=[];
  let acc=0;
  for(const x of q) cdf.push(acc+=x);
  const plain=[],cipher=[],used=[];
  let skips=0;
  for(let i=0;i<length;i++) {
    const r=rng();
    const p=nativePlain ? nativePlain[i] : cdf.findIndex(x=>r<x);
    assert.ok(p>=0);
    let v,key;
    do {
      key=nextKey();
      v=mod(p+sign*key);
      if(i>0 && v===cipher[i-1] && rng()<REJECT) {
        skips++;
      } else break;
    }while(true);
    plain.push(p);cipher.push(v);used.push(key);
    assert.equal(mod(plain[i]+sign*used[i]),cipher[i]);
  }
  return {cipher,skips,initialSeed:[7,11,19],
    signature:cipher.slice(0,16)};
}

// Two independent plants check both a matched synthetic model and a
// fixed GP-normalized sample of historically solved Liber Primus prose.
const sourceText=fs.readFileSync(path.join(
  ROOT, 'resources/liber-primus/lp1-plaintext-reference.txt'),'utf8');
const nativePlain=[];
for (const line of sourceText.split(/\r?\n/)) {
  const trimmed=line.trim();
  if(!trimmed || trimmed.startsWith('#') ||
      trimmed.startsWith('[') || /^\d/.test(trimmed))continue;
  for(const word of trimmed.match(/[A-Za-z]+/g)||[])
    nativePlain.push(...encode(word));
}
assert.ok(nativePlain.length>=2048);
const positive=plant(2048,1);
assert.ok(positive.skips>10,'positive should exercise real clock drift');
const posScore=forward(positive.cipher,1);
assert.ok(posScore.llr>100,'same-model planted cipher must be recognized');
const nativePlant=plant(2048,1,nativePlain);
const nativeScore=forward(nativePlant.cipher,1);
const realForward=forward(C,1);
const realReverse=forward(C,-1);
assert.ok(Math.abs(realForward.logLik-realReverse.logLik)<1e-7,
  'with all unknown states, seed-negation makes signs equivalent');
const report={
  hypothesis:'source DH [p,g,a] -> GF29 third-order key, '
    +'original word/punctuation positions unchanged; exact collision-skip HMM',
  confidence:'exploratory only; source does not explicitly select LFSR',
  source:'canonical lp2-corpus.json, pages 0..55',
  runeCount:C.length, initialKeyStates:STATES, taps:TAP,
  skipProbability:REJECT,
  training:'independent Shakespeare GP-English unigram',
  tests:{
    synthetic:{length:positive.cipher.length,skips:positive.skips,
      score:posScore,firstCipher:positive.signature,
      trueSeed:positive.initialSeed},
    nativeKnownPlain:{length:nativePlant.cipher.length,
      skips:nativePlant.skips,score:nativeScore,
      source:'LP1 solved transliteration, source-normalized GP29'},
    originalPlus:realForward,
    originalMinus:realReverse
  },
  signSymmetry:'With 29^3 unrestricted initial states, +/- are exactly equivalent by K -> -K.',
  caveat:'An excluded model is not an exclusion of nonlinear, keyed, '
    +'non-GP29, re-ordered, or differently reset mechanisms; this test '
    +'does not authenticate the DH tap assignment'
};
console.log('SOURCE-TAP COLLISION-SKIP REPORT\n'+JSON.stringify(report,null,2));
