'use strict';
/**
 * Drift-aware periodogram for a key pointer that advances by one, or by
 * two after collision rejection (soft filter probability 0.81).
 *
 * A conventional lag=period test misses a key whose index advances
 * extra steps in a cipher that rejects repeated output runes. We model
 * skips as Binomial(d, 0.81/29); a period L then produces a broad
 * coincidence ridge at d such that d + skips is a multiple of L.
 *
 * We scan periods L=29..1600 and rune lags 30..8000. Nulls independently
 * rotate each full physical rune page, retaining its symbol content and
 * most short-range structure. A planted periodic Vigenere key provides
 * an end-to-end sensitivity control.
 *
 * Run (Node.js 22+, no dependencies):
 *   node sims/skip_drift_period.cjs
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const {reference}=require('./skip_phase_hmm.cjs');
const pageArrays=corpus.pages.filter(p=>p.status==='unsolved'&&p.indices.length).map(p=>p.indices);
const ALL=pageArrays.flat(), N=ALL.length, M=29, MIN_LAG=30, MAX_LAG=8000;
const MIN_PERIOD=29, MAX_PERIOD=1600, REJECT=0.81, SKIP_RATE=REJECT/29;
assert.equal(N,12956);
assert.equal(pageArrays.length,55);
const P_EQUAL=1/M;
const LOGP=Math.log(SKIP_RATE),LOGQ=Math.log(1-SKIP_RATE);
const logFactorial=new Float64Array(MAX_LAG+2);
for(let i=2;i<logFactorial.length;i++)logFactorial[i]=logFactorial[i-1]+Math.log(i);
/**
 * Precompute the weight for every lag/period, subtracting the 1/L
 * phase-uniform baseline. The planted schedule's period is assumed
 * to spread rune labels nearly uniformly over the 29-symbol alphabet.
 * @returns {Array<{period:number,weight:Float32Array,normalizer:number}>}
 */
function kernels(){
  const output=[];
  for(let L=MIN_PERIOD;L<=MAX_PERIOD;L++){
    const weight=new Float32Array(MAX_LAG+1);
    weight.fill(-1/L,MIN_LAG);
    const maxHarmonic=Math.floor(MAX_LAG*(1+SKIP_RATE)/L)+2;
    for(let m=1;m<=maxHarmonic;m++){
      const center=m*L/(1+SKIP_RATE);
      const sd=Math.sqrt(center*SKIP_RATE*(1-SKIP_RATE))/(1+SKIP_RATE);
      const lo=Math.max(MIN_LAG,Math.floor(center-7*sd-3));
      const hi=Math.min(MAX_LAG,Math.ceil(center+7*sd+3));
      for(let d=lo;d<=hi;d++){
        const k=m*L-d;
        if(k<0||k>d)continue;
        const pmf=Math.exp(logFactorial[d]-logFactorial[k]-logFactorial[d-k]+k*LOGP+(d-k)*LOGQ);
        weight[d]+=pmf;
      }
    }
    let norm=0;
    for(let d=MIN_LAG;d<=MAX_LAG;d++){
      const v=weight[d];
      norm+=(N-d)*P_EQUAL*(1-P_EQUAL)*v*v;
    }
    output.push({period:L,weight,normalizer:Math.sqrt(norm)});
  }
  return output;
}
/**
 * @param {number[]} values
 * @returns {Float64Array} deviations of lag-match counts from uniform.
 */
function collisionResiduals(values){
  assert.equal(values.length,N);
  const output=new Float64Array(MAX_LAG+1);
  for(let d=MIN_LAG;d<=MAX_LAG;d++){
    let hits=0;
    for(let i=0;i<N-d;i++)hits+=Number(values[i]===values[i+d]);
    output[d]=hits-(N-d)/M;
  }
  return output;
}
/**
 * Weighted period score (approximately standardized under iid uniform).
 * @param {Float64Array} residuals
 * @param {Array<{period:number,weight:Float32Array,normalizer:number}>} bank
 * @returns {Array<{period:number,z:number}>}
 */
function rank(residuals,bank){
  const result=[];
  for(const k of bank){
    let score=0;
    for(let d=MIN_LAG;d<=MAX_LAG;d++)score+=residuals[d]*k.weight[d];
    result.push({period:k.period,z:score/k.normalizer});
  }
  result.sort((x,y)=>y.z-x.z);
  return result;
}
/** @param {number} seed */
function randomGenerator(seed){
  let x=seed>>>0;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};
}
/**
 * Preserve page contents and neighboring runes by independently
 * circularly shifting the entire page. Changes only two boundary pairs
 * on each page. Nulls remove any long-range cross-page key phase.
 * @param {()=>number} random
 */
function rotatedPages(random){
  const out=[];
  for(const page of pageArrays){
    const shift=Math.floor(random()*page.length);
    for(let i=0;i<page.length;i++)out.push(page[(i+shift)%page.length]);
  }
  return out;
}
/** @param {number[]} q @param {()=>number} random */
function sampleRune(q,random){
  const x=random();let cumul=0;
  for(let i=0;i<M;i++){cumul+=q[i];if(x<cumul)return i;}
  return M-1;
}
/**
 * Random independent key symbols, adjusted to be unequal at every
 * adjacent position including at wraparound; then repeated periodically.
 * @param {number} length
 * @param {()=>number} random
 * @returns {number[]}
 */
function randomPeriodicKey(length,random){
  const key=[];
  for(let i=0;i<length;i++){
    let value=Math.floor(random()*M);
    if(i>0&&value===key[i-1])value=(value+1+Math.floor(random()*(M-1)))%M;
    key.push(value);
  }
  if(key[length-1]===key[0])key[length-1]=(key[length-1]+1)%M;
  return key;
}
/**
 * Synthetic periodic-key Vigenere with collision-triggered consumption
 * of the next key symbol and same plaintext re-encrypted.
 * @param {number[]} key
 * @param {number[]} q
 * @param {number} seed
 * @returns {number[]}
 */
function planted(key,q,seed){
  const random=randomGenerator(seed);
  let pointer=0,previous=-1;
  const out=[];
  for(let i=0;i<N;i++){
    const p=sampleRune(q,random);
    let cipher=(p+key[pointer])%M;
    pointer=(pointer+1)%key.length;
    if(previous>=0&&cipher===previous&&random()<REJECT){
      cipher=(p+key[pointer])%M;
      pointer=(pointer+1)%key.length;
    }
    out.push(cipher);
    previous=cipher;
  }
  return out;
}
/**
 * @param {number} trials
 * @param {number} seed
 */
function study(trials=60,seed=0x39a51eef){
  assert.ok(Number.isInteger(trials)&&trials>0&&trials<=1000);
  const bank=kernels(),actual=rank(collisionResiduals(ALL),bank);
  const rng=randomGenerator(seed);
  const nullMax=[];
  for(let i=0;i<trials;i++){
    const score=rank(collisionResiduals(rotatedPages(rng)),bank);
    nullMax.push(score[0].z);
  }
  nullMax.sort((a,b)=>a-b);
  const best=actual[0].z;
  const q=reference().q;
  const key=randomPeriodicKey(399,randomGenerator(0x6f3d482b));
  const pos=rank(collisionResiduals(planted(key,q,0x24abb5db)),bank);
  return {
    hypothesis:'periodic modulo-29 additive key with soft key-skip; phase drift approximated Binomial(d,0.81/29)',
    scope:{runes:N,physicalPages:pageArrays.length,lagRange:[MIN_LAG,MAX_LAG],keyPeriodRange:[MIN_PERIOD,MAX_PERIOD]},
    seed,trials,actual:actual.slice(0,12),
    maxFamilywiseP:(1+nullMax.filter(x=>x>=best).length)/(trials+1),
    nullSummary:{median:nullMax[Math.floor((trials-1)/2)],p95:nullMax[Math.ceil(.95*trials)-1],max:nullMax.at(-1)},
    plantedControl:{truePeriod:399,seedKey:0x6f3d482b,seedPlain:0x24abb5db,top:pos.slice(0,10),period399:pos.find(x=>x.period===399)},
    caveat:'Null circular rotations disrupt cross-page coherence, not all possible page-local keys. Gaussian-standardized scores are diagnostic, familywise empirical ranks are authoritative; prior/rate/schedule assumptions remain provisional.'
  };
}
if(require.main===module)console.log(JSON.stringify(study(),null,2));
module.exports={kernels,collisionResiduals,rank,rotatedPages,randomPeriodicKey,planted,study};
