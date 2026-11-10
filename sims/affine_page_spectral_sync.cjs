"use strict";
/**
 * Blind cross-page recovery of a shared 29-ary key under a different unknown
 * affine rune alphabet C[p,t] = a[p]*(P[p,t]+K[t]) + b[p] (mod29).
 *
 * Hidden multipliers a[p] scramble which Fourier harmonic exposes the same
 * pad waveform. On even within-page offsets, select one of 28 harmonics for
 * each page using 14 anchored initializations and constrained coordinate
 * ascent. Freeze all frequency/phase parameters before testing odd offsets.
 * Calibrate the entire fitted procedure by independent rotations of genuine
 * pages. Positive controls use a fresh 29-ary key and independent affine
 * page labels, with optional ciphertext-repeat rewriting.
 *
 * This is an architectural discriminator, not a plaintext decoder.
 * Node.js 22, CommonJS, no external packages; manual CI only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {makePrior, xorshift} = require("./caesar_pad_spectral.cjs");
const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const english = fs.readFileSync(
  path.join(ROOT, "resources/control/shakespeare_first300k.txt"), "utf8");
const MOD = 29, PREFIX = 150;
const CT = Array.from({length: 29}, (_,h) =>
  Float64Array.from({length:29}, (_,c) => Math.cos(2*Math.PI*h*c/29)));
const ST = Array.from({length: 29}, (_,h) =>
  Float64Array.from({length:29}, (_,c) => Math.sin(2*Math.PI*h*c/29)));

/** @param {number[][]} pages */
function fit(pages) {
  const n = pages.length, tcount = PREFIX / 2;
  assert(n > 5 && pages.every(p => p.length >= PREFIX));
  const zr = new Float64Array(tcount), zi = new Float64Array(tcount);
  let best = null;
  for (let anchor=1;anchor<=14;anchor++) {
    const h = new Int8Array(n), pr = new Float64Array(n), pi = new Float64Array(n);
    h[0] = anchor; pr[0]=1;
    for (let t=0;t<tcount;t++) {
      const c=pages[0][2*t];zr[t]=CT[anchor][c];zi[t]=ST[anchor][c];
    }
    // Choose each page's strongest train-only anchored Fourier harmonic.
    for (let j=1;j<n;j++) {
      let top=-1, optH=1, optR=1, optI=0;
      for (let f=1;f<MOD;f++) {
        let cr=0,ci=0;
        for (let t=0;t<tcount;t++) {
          const c=pages[j][2*t], r=CT[f][c], i=ST[f][c];
          cr += r*zr[t]+i*zi[t]; ci += i*zr[t]-r*zi[t];
        }
        const strength=cr*cr+ci*ci;
        if(strength>top){top=strength;optH=f;const norm=Math.sqrt(strength);
          optR=cr/norm;optI=ci/norm;}
      }
      h[j]=optH;pr[j]=optR;pi[j]=optI;
    }
    const sr=new Float64Array(tcount),si=new Float64Array(tcount);
    /** @param {number} j @param {number} sign */
    function accumulate(j,sign) {
      const f=h[j],ar=pr[j],ai=pi[j];
      for(let t=0;t<tcount;t++) {
        const c=pages[j][2*t],r=CT[f][c],i=ST[f][c];
        sr[t]+=sign*(r*ar+i*ai);
        si[t]+=sign*(i*ar-r*ai);
      }
    }
    for(let j=0;j<n;j++)accumulate(j,1);
    // Exact single-page frequency/phase coordinate maximization with a
    // fixed reference page; never consult held-out symbols.
    for(let iteration=0;iteration<3;iteration++) {
      for(let j=1;j<n;j++) {
        accumulate(j,-1);
        let top=-1,optH=1,optR=1,optI=0;
        for(let f=1;f<MOD;f++) {
          let cr=0,ci=0;
          for(let t=0;t<tcount;t++) {
            const c=pages[j][2*t],r=CT[f][c],i=ST[f][c];
            cr+=r*sr[t]+i*si[t];ci+=i*sr[t]-r*si[t];
          }
          const strength=cr*cr+ci*ci;
          if(strength>top){top=strength;optH=f;const norm=Math.sqrt(strength);
            optR=cr/norm;optI=ci/norm;}
        }
        h[j]=optH;pr[j]=optR;pi[j]=optI;accumulate(j,1);
      }
    }
    let train=0;
    for(let t=0;t<tcount;t++)train+=sr[t]*sr[t]+si[t]*si[t];
    train/=n*tcount;
    if(best===null||train>best.training)
      best={training:train,frequencies:Array.from(h),phaseReal:Array.from(pr),
        phaseImag:Array.from(pi),anchor};
  }
  let hold=0;
  for(let t=1;t<PREFIX;t+=2) {
    let re=0,im=0;
    for(let j=0;j<n;j++) {
      const f=best.frequencies[j],c=pages[j][t],
        r=CT[f][c],i=ST[f][c],ar=best.phaseReal[j],ai=best.phaseImag[j];
      re+=r*ar+i*ai;im+=i*ar-r*ai;
    }
    hold+=re*re+im*im;
  }
  best.heldout=hold/(n*tcount);
  return best;
}
/** @param {number[][]} pages @param {()=>number} rng */
function rotate(pages,rng) {
  return pages.map(p=>{const k=Math.floor(rng()*p.length);
    return p.slice(k).concat(p.slice(0,k));});
}
/**
 * @param {number[][]} reference
 * @param {number[]} prior
 * @param {number} overwriteRate
 * @param {number} seed
 */
function plant(reference,prior,overwriteRate,seed){
  const rng=xorshift(seed), n=reference.length,
    pad=Array.from({length:PREFIX},()=>Math.floor(rng()*MOD)),
    multiplier=Array.from({length:n},()=>1+Math.floor(rng()*28)),
    shift=Array.from({length:n},()=>Math.floor(rng()*MOD));
  const cumulative=[];let sum=0;
  for(const p of prior){sum+=p;cumulative.push(sum);}
  const sample=()=>{const u=rng();const index=cumulative.findIndex(x=>x>u);
    return index>=0?index:MOD-1;};
  let repairs=0;
  const pages=reference.map((page,j)=>{
    const out=[];
    for(let t=0;t<page.length;t++) {
      let c=(multiplier[j]*(sample()+pad[t%PREFIX])+shift[j])%MOD;
      if(t>0&&c===out[t-1]&&rng()<overwriteRate){
        c=(c+1+Math.floor(rng()*28))%MOD;repairs++;
      }
      out.push(c);
    }
    return out;
  });
  return {pages,multiplier,shift,repairs};
}
/** @param {number[]} xs */
function average(xs){return xs.reduce((x,y)=>x+y,0)/xs.length;}
/** @param {number} repeats */
function run(repeats=160){
  const pages=corpus.pages.filter(p=>p.status==="unsolved"&&p.indices.length>=PREFIX)
    .map(p=>p.indices);
  assert.equal(pages.length,49);
  const prior=makePrior(english),actual=fit(pages);
  const rng=xorshift(0xa15f111e);
  const nullScores=[];
  for(let i=0;i<repeats;i++)nullScores.push(fit(rotate(pages,rng)).heldout);
  const sorted=nullScores.slice().sort((a,b)=>a-b);
  const p=(1+nullScores.filter(x=>x>=actual.heldout).length)/(repeats+1);
  const planted=[];
  for(const q of [0,0.81])for(let i=0;i<12;i++){
    const generated=plant(pages,prior,q,(0xa15f2000+i*1033+Math.floor(q*1000))>>>0);
    const candidate=fit(generated.pages);
    const keyH=(candidate.frequencies[0]*generated.multiplier[0])%MOD;
    const aligned=candidate.frequencies.filter((f,j)=>
      (f*generated.multiplier[j])%MOD===keyH).length;
    planted.push({overwrite:q,seed:i,repairs:generated.repairs,
      train:candidate.training,heldout:candidate.heldout,
      aboveRealNull95:candidate.heldout>sorted[Math.floor(.95*repeats)],
      correctFrequencyPages:aligned});
  }
  return {
    model:"Shared page-reset mod29 pad, one unknown invertible affine multiplier and additive offset per page",
    source:"Original LP2 55 unsolved rune pages; cohort 49 with >=150 runes",
    pages:pages.length,prefix:PREFIX,trainingOffsets:"even 0..148",
    untouchedOffsets:"odd 1..149",
    harmonicSearch:"14 reference harmonics, 28 per nonreference page, 3 train-only coordinate passes",
    original:{training:actual.training,heldout:actual.heldout,
      selectedReferenceHarmonic:actual.anchor},
    null:{method:"Independent full-page rotations; identical exhaustive fit each time",
      seed:"0xa15f111e",trials:repeats,mean:average(nullScores),
      min:sorted[0],max:sorted.at(-1),q95:sorted[Math.floor(.95*repeats)],
      upperTail:p},
    planted:{model:"Shakespeare-GP unigram, page-matched runes, shared random pad, independent affine labels",
      trials:planted,zeroRepairDetected:planted.filter(x=>x.overwrite===0&&x.aboveRealNull95).length,
      overwriteDetected:planted.filter(x=>x.overwrite>0&&x.aboveRealNull95).length},
    caveat:"An exploratory detector for the exactly specified full-cohort mechanism. It does not infer a key, decode plaintext, or exclude different key resets, symbol edits or language registers."
  };
}
if(require.main===module) console.log(JSON.stringify(run(Number(process.argv[2]||160)),null,2));
module.exports={fit,plant,run};
