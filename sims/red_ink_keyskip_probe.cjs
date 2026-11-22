"use strict";
/**
 * Test whether the exact 213 unsolved-LP2 red runes encode a repeating
 * additive key for black-only pages under skip-on-adjacent-repeat cipher.
 * Test is conditional on a key reset to phase zero at every physical page.
 * Train/test selection and null shuffles are split over disjoint pages.
 * Produces no inferred plaintext absent independently supported evidence.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {reference} = require("./skip_phase_hmm.cjs");
const {logLikelihood,encrypt} = require("./keyskip_transducer.cjs");
const ROOT = path.resolve(__dirname,"..");
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const ink = JSON.parse(fs.readFileSync(path.join(ROOT,"resources/liber-primus/lp2-ink-annotations.json"),"utf8"));
const M = 29, N = 100, Q = 0.81;
const identity = Array.from({length:M},(_,i)=>i);
const {q} = reference();
assert.equal(corpus.pages.length,58);
const pageAnnotations = new Map(ink.pages.map(x=>[x.page,x]));
const red = [];
for (const p of corpus.pages.filter(p=>p.page<56)) {
  for (const s of pageAnnotations.get(p.page)?.red_spans||[]) {
    for(let i=s.start;i<s.start+s.length;i++) {
      assert.equal(corpus.runes[p.indices[i]],s.runes[i-s.start]);
      red.push(p.indices[i]);
    }
  }
}
assert.equal(red.length,213);
const eligible = corpus.pages.filter(p=>p.status==="unsolved"&&p.indices.length>=N&&
 !(pageAnnotations.get(p.page)?.red_spans||[]).some(s=>s.length>0));
const train=eligible.filter((_,i)=>i%2===0), test=eligible.filter((_,i)=>i%2===1);
assert(train.length>=12&&test.length>=12);
const rng = (()=>{let state=0x496e6b31;return()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return(state>>>0)/4294967296;};})();
const sample=()=>{let p=rng(),s=0;for(let i=0;i<M;i++){s+=q[i];if(p<s)return i;}return M-1;};
/** @param {number[]} a */
function shuffled(a) {
  const out=a.slice();
  for(let i=out.length-1;i>0;i--) {
    const j=Math.floor(rng()*(i+1));
    [out[i],out[j]]=[out[j],out[i]];
  }
  return out;
}
/** @param {number[]} k */
function options(k) {
  return [k,k.slice().reverse()].flatMap((key,orientation)=>
    [1,-1].map(sign=>({key:key.map(x=>(M+sign*x)%M),
      orientation:orientation?"reversed":"forward",sign})));
}
/** @param {number[][]} data @param {number[]} k */
function evaluate(data,k){
  const opts=options(k);
  return opts.map((o,i)=>({
    i,orientation:o.orientation,sign:o.sign,
    score:data.reduce((v,c)=>v+logLikelihood(c,{
      key:o.key,q,inverseSigma:identity,offset:0,rejectRepeat:Q,
      maxTotalSkips:12,maxSkippedPerOutput:3}),0)
  }));
}
/** @param {number[][]} a @param {number[][]} b @param {number[]} k */
function ranked(a,b,k){
  const training=evaluate(a,k), testing=evaluate(b,k);
  const winner=training.reduce((x,y)=>x.score>=y.score?x:y);
  return {winner,heldout:testing[winner.i].score,
    heldoutPerRune:testing[winner.i].score/(b.length*N)};
}
const actualTrain=train.map(x=>x.indices.slice(0,N)),actualTest=test.map(x=>x.indices.slice(0,N));
const observed=ranked(actualTrain,actualTest,red);
const nulls=[],REPS=300;
for(let n=0;n<REPS;n++)nulls.push(ranked(actualTrain,actualTest,shuffled(red)).heldout);
const mean=nulls.reduce((s,x)=>s+x,0)/REPS;
const sd=Math.sqrt(nulls.reduce((s,x)=>s+(x-mean)**2,0)/(REPS-1));
const positive=[];
for(let rep=0;rep<8;rep++) {
  const plant=(source)=>source.map(()=>{
    const p=Array.from({length:N},sample);
    return encrypt(p,red,identity,rng,{offset:0,rejectRepeat:Q}).cipher;
  });
  positive.push(ranked(plant(train),plant(test),red));
}
const corrected=(1+nulls.filter(x=>x>=observed.heldout).length)/(REPS+1);
const null95=nulls.slice().sort((a,b)=>a-b)[Math.floor(REPS*.95)];
console.log(JSON.stringify({
  hypothesis:"The 213 accurately annotated unsolved red GP runes (forward/reverse, +/-) form a phase-zero repeating additive page-reset key; skip a colliding key proposal with p=0.81",
  source:"resources/liber-primus/lp2-ink-annotations.json",
  keyLength:red.length,corpusPages:56,emptyPage50:corpus.pages[50].indices.length,
  split:{trainPages:train.map(x=>x.page),testPages:test.map(x=>x.page),
    runesPerPage:N,trainingRunes:train.length*N,heldoutRunes:test.length*N},
  generator:"source q from authentic solved LP1/LP2 text; same plaintext symbol retained during rejected key draws",
  candidates:4,nullReplicates:REPS,positiveControls:positive.length,seed:"0x496e6b31",
  observed, null:{mean,sd,null95,max:Math.max(...nulls),
    countAtLeastActual:nulls.filter(x=>x>=observed.heldout).length,
    empiricalHeldoutP:corrected,z:(observed.heldout-mean)/sd},
  planted:{heldout:positive.map(x=>x.heldout),recoveredCorrectConfig:positive.filter(x=>
    x.winner.orientation==="forward"&&x.winner.sign===1).length,
    aboveNull95:positive.filter(x=>x.heldout>null95).length},
  limitation:"Tests only one exact reset/phase/model family; no cipher solution implied."
},null,2));
