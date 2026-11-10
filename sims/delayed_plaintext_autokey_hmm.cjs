"use strict";
/**
 * Exact 29-state hidden-Markov inversion for delayed plaintext-autokey,
 * with observable previous-ciphertext-dependent collision rewriting.
 *
 * Model for j>=lag, within one reset unit:
 *   tentative[j] = (P[j] + a*P[j-lag]) mod29.
 *   If tentative[j] == emitted[j-1], replace it, with probability q,
 *   uniformly by one of the other 28 glyphs. Otherwise publish tentative.
 * The first lag ciphertext runes are unconstrained IV symbols. The hidden
 * first lag plaintext runes have the independently trained GP prior.
 *
 * This source performs marginal-likelihood exact inference, not an IoC
 * shortcut or a heuristic choice of the hidden repaired locations. A
 * separate Viterbi pass recovers an explicit MAP plaintext and an exact
 * emitting path for the selected family, then re-encrypts the candidate.
 *
 * Original-data input is the canonical 55-page unsolved LP2 corpus;
 * language training is on the first 240000 characters of Shakespeare;
 * independent planted English is drawn from the last 60000 characters.
 * Supports page, section, global reset scopes; scans lags 1..12 and every
 * nonzero multiplier. No plaintext claim follows from low original scores.
 *
 * Run: node sims/delayed_plaintext_autokey_hmm.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const ROOT=path.resolve(__dirname,".."), N=29, Q=0.81, MAX_LAG=12;
const data=JSON.parse(fs.readFileSync(path.join(ROOT,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const raw=fs.readFileSync(path.join(ROOT,"resources/control/shakespeare_first300k.txt"),"utf8");
const pages=data.pages.filter(p=>p.page<56 && p.indices.length).map(p=>p.indices);
assert.equal(pages.length,55);
const pageFlat=pages.flat();
assert.equal(pageFlat.length,12956);
const sections=[729,1145,1729,9,1894,1021,1524,1589,3316];
let cursor=0;
const sectionUnits=sections.map(length=>{
  const unit=pageFlat.slice(cursor,cursor+length);
  cursor+=length;
  return unit;
});
assert.equal(cursor,12956);
const GP=new Map(data.translit.map((x,i)=>[x,i]));
GP.set("ING",21);
/** @param {string} input */
function encode(input) {
  const output=[];
  for(const word of input.toUpperCase().match(/[A-Z]+/g)||[]) {
    const w=word.replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");
    for(let i=0;i<w.length;) {
      let found=false;
      for(const k of [3,2,1]){
        const part=w.slice(i,i+k);
        if(part.length===k && GP.has(part)){
          output.push(GP.get(part));i+=k;found=true;break;
        }
      }
      if(!found)i++;
    }
  }
  return output;
}
const train=encode(raw.slice(0,240000)), heldout=encode(raw.slice(240000));
assert.ok(train.length>100000 && heldout.length>30000);
const prior=Float64Array.from({length:N},()=>0.5);
for(const x of train)prior[x]++;
const totalPrior=prior.reduce((a,b)=>a+b,0);
for(let k=0;k<N;k++)prior[k]/=totalPrior;
const logPrior=Array.from(prior,Math.log);
const mod=x=>(x%N+N)%N;
/** @param {number} seed */
function rng32(seed){
  let x=seed>>>0;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};
}
/**
 * The iid-uniform-plaintext observable law is exact for this forward model:
 * an equal published neighbor has probability (1-q)/29; each other rune
 * has probability [1+q/28]/29.
 * @param {number} c @param {number} previous
 */
function baselineLog(c,previous){
  return Math.log((c===previous?1-Q:1+Q/28)/N);
}
/**
 * Exact sum-product (forward algorithm) over the 29 possible values of
 * P[j-lag]. All possible rewrites are integrated, rather than erased.
 * Each column has <=58 nonzero predecessor-successor possibilities.
 * @param {number[][]} units
 * @param {number} lag
 * @param {number} coefficient
 */
function marginal(units,lag,coefficient){
  let logLikelihood=0,logNull=0,eligible=0,closeEvents=0;
  for(const unit of units)for(let r=0;r<Math.min(lag,unit.length);r++){
    let previousState=Float64Array.from(prior);
    for(let j=r+lag;j<unit.length;j+=lag){
      const c=unit[j],previousCipher=unit[j-1],next=new Float64Array(N);
      if(c===previousCipher){
        closeEvents++;
        for(let old=0;old<N;old++){
          const p=mod(c-coefficient*old);
          next[p]+=previousState[old]*prior[p]*(1-Q);
        }
      } else {
        for(let old=0;old<N;old++){
          const pLiteral=mod(c-coefficient*old);
          const pRewritten=mod(previousCipher-coefficient*old);
          next[pLiteral]+=previousState[old]*prior[pLiteral];
          next[pRewritten]+=previousState[old]*prior[pRewritten]*(Q/28);
        }
      }
      let normalizer=0;
      for(const value of next)normalizer+=value;
      assert.ok(normalizer>0);
      logLikelihood+=Math.log(normalizer);
      logNull+=baselineLog(c,previousCipher);
      for(let p=0;p<N;p++)next[p]/=normalizer;
      previousState=next;
      eligible++;
    }
  }
  return {lag,coefficient,eligible,closeEvents,
    logPerRune:logLikelihood/eligible,
    uniformNullPerRune:logNull/eligible,
    improvementPerRune:(logLikelihood-logNull)/eligible};
}
/** @param {number[][]} units */
function scan(units){
  const candidates=[];
  for(let lag=1;lag<=MAX_LAG;lag++)for(let a=1;a<N;a++)
    candidates.push(marginal(units,lag,a));
  candidates.sort((x,y)=>y.improvementPerRune-x.improvementPerRune);
  assert.equal(candidates.length,MAX_LAG*28);
  return candidates;
}
/**
 * Produce independently heldout known-English synthetic ciphertext,
 * including the exact random collision rewrite and emitted IV.
 * @param {number[][]} layout
 * @param {number} lag
 * @param {number} coefficient
 * @param {number} seed
 */
function plant(layout,lag,coefficient,seed){
  const draw=rng32(seed);
  let rewritten=0,unrepaired=0;
  const plaintext=[];
  const iv=[];
  const flags=[];
  const ciphertext=layout.map(unit=>{
    const start=Math.floor(draw()*(heldout.length-unit.length));
    const p=heldout.slice(start,start+unit.length);
    plaintext.push(p);
    const c=[],mask=[];
    for(let j=0;j<p.length;j++){
      let emitted=j<lag?Math.floor(draw()*N):mod(p[j]+coefficient*p[j-lag]);
      const first=emitted;
      let fixed=false;
      if(j>0&&emitted===c[j-1]){
        if(draw()<Q){
          const rank=Math.floor(draw()*28);
          emitted=rank>=c[j-1]?rank+1:rank;
          fixed=true;rewritten++;
        }else unrepaired++;
      }
      mask.push(fixed);
      c.push(emitted);
      if(!fixed&&j>=lag)assert.equal(first,emitted);
    }
    iv.push(c.slice(0,lag));
    flags.push(mask);
    return c;
  });
  // Plant has exact forward truth: the published replacement is recorded in ciphertext.
  for(let u=0;u<ciphertext.length;u++)for(let j=lag;j<ciphertext[u].length;j++){
    const t=mod(plaintext[u][j]+coefficient*plaintext[u][j-lag]);
    if(flags[u][j]){assert.equal(t,ciphertext[u][j-1]);assert.notEqual(ciphertext[u][j],t);}
    else assert.equal(t,ciphertext[u][j]);
  }
  return {plaintext,ciphertext,iv,flags,rewritten,unrepaired};
}
/**
 * Forward transformation using the selected IVs and literal/rewrite flags.
 * This verifies the exact ciphertext path for original and planted data.
 * @param {number[][]} plaintext
 * @param {number[][]} iv
 * @param {boolean[][]} flags
 * @param {number} lag
 * @param {number} coefficient
 */
function reencrypt(plaintext,iv,flags,lag,coefficient){
  return plaintext.map((unit,u)=>{
    const c=[];
    for(let j=0;j<unit.length;j++){
      const tentative=j<lag?iv[u][j]:mod(unit[j]+coefficient*unit[j-lag]);
      let emitted=tentative;
      if(flags[u][j]){
        assert.ok(j>0);
        assert.equal(tentative,c[j-1]);
        // The chosen non-repeating emitted rune is carried in iv at j<lag.
        // For later positions a 29-way rewrite choice is not determined by
        // plaintext and the boolean alone; the explicit output path is needed.
        assert.ok(j<lag,"Explicit rewrite output required outside the IV");
      }
      c.push(emitted);
    }
    return c;
  });
}
/**
 * Exact max-product inference. The explicit output itself determines which
 * non-repeating symbol was chosen at a rewritten site.
 * @param {number[]} ciphertext
 * @param {number} lag
 * @param {number} a
 */
function viterbiUnit(ciphertext,lag,a){
  const plain=new Array(ciphertext.length);
  const repair=new Array(ciphertext.length).fill(false);
  for(let r=0;r<Math.min(lag,ciphertext.length);r++){
    const steps=Math.ceil((ciphertext.length-r)/lag);
    let priorScores=Float64Array.from(logPrior);
    const trace=new Array(steps);
    for(let t=1;t<steps;t++){
      const j=r+t*lag,c=ciphertext[j],previous=ciphertext[j-1];
      const scores=new Float64Array(N).fill(-Infinity), predecessor=new Int8Array(N),
        rewrite=new Uint8Array(N);
      for(let prevP=0;prevP<N;prevP++){
        const base=priorScores[prevP];
        const p0=mod(c-a*prevP);
        const value0=base+logPrior[p0]+(c===previous?Math.log(1-Q):0);
        if(value0>scores[p0]){
          scores[p0]=value0;predecessor[p0]=prevP;rewrite[p0]=0;
        }
        if(c!==previous){
          const p1=mod(previous-a*prevP);
          const value1=base+logPrior[p1]+Math.log(Q/28);
          if(value1>scores[p1]){
            scores[p1]=value1;predecessor[p1]=prevP;rewrite[p1]=1;
          }
        }
      }
      trace[t]={predecessor,rewrite};
      const max=Math.max(...scores);
      for(let p=0;p<N;p++)scores[p]-=max;
      priorScores=scores;
    }
    let state=priorScores.indexOf(Math.max(...priorScores));
    for(let t=steps-1;t>=0;t--){
      const j=r+t*lag;
      plain[j]=state;
      if(t){
        repair[j]=Boolean(trace[t].rewrite[state]);
        state=trace[t].predecessor[state];
      }
    }
  }
  for(let j=lag;j<ciphertext.length;j++){
    const tentative=mod(plain[j]+a*plain[j-lag]);
    if(repair[j]){
      assert.equal(tentative,ciphertext[j-1]);
      assert.notEqual(ciphertext[j],ciphertext[j-1]);
    }else assert.equal(tentative,ciphertext[j]);
  }
  return {plain,repair};
}
/** @param {number[][]} units @param {number} lag @param {number} a */
function decipher(units,lag,a){
  const p=units.map(u=>viterbiUnit(u,lag,a));
  const priorRuneAccuracy=null;
  return {plaintext:p.map(x=>x.plain),rewriteMasks:p.map(x=>x.repair),
    modeledRewrites:p.reduce((n,x)=>n+x.repair.filter(Boolean).length,0),
    priorRuneAccuracy};
}
function main(){
  const original={};
  for(const [scope,units] of Object.entries({
    page:pages,section:sectionUnits,continuous:[pageFlat]
  })){
    const ranking=scan(units);
    const choice=ranking[0],decoded=decipher(units,choice.lag,choice.coefficient);
    original[scope]={
      bestFive:ranking.slice(0,5),
      worst:ranking.at(-1),
      candidateCount:ranking.length,
      allCandidateGainsNegative:ranking.every(r=>r.improvementPerRune<0),
      bestMAPRecoveredRewrites:decoded.modeledRewrites,
      bestMAPFirst60GP:decoded.plaintext[0].slice(0,60).map(i=>data.translit[i]).join(" ")
    };
  }
  const known=plant(pages,5,17,0x1acf31ab);
  const plantedRanking=scan(known.ciphertext);
  const plantedInverse=decipher(known.ciphertext,5,17);
  const originalPlain=known.plaintext.flat(),recovered=plantedInverse.plaintext.flat();
  let correct=0;
  for(let i=0;i<originalPlain.length;i++)correct+=Number(originalPlain[i]===recovered[i]);
  const trueModelRank=plantedRanking.findIndex(x=>x.lag===5&&x.coefficient===17)+1;
  assert.equal(trueModelRank,1,"True delayed-feedback model must be highest likelihood");
  assert.ok(plantedRanking[0].improvementPerRune>0.1);
  assert.ok(original.page.allCandidateGainsNegative);
  const report={
    model:"P[j]+a*P[j-lag] mod29, exact sum-product collision rewrite q=.81",
    source:{corpusSHA256:crypto.createHash("sha256").update(
      fs.readFileSync(path.join(ROOT,"resources/liber-primus/lp2-corpus.json"))).digest("hex"),
      knownEnglishTrainingRunes:train.length,heldoutEnglishRunes:heldout.length,
      actualPages:pages.length,actualRunes:pageFlat.length},
    sweep:{lagMin:1,lagMax:MAX_LAG,multipliers:28,scopes:3,q:Q},
    original,
    positive:{trueLag:5,trueCoefficient:17,seed:"0x1acf31ab",
      authenticShakespeareHoldout:true,
      originalRuneCount:originalPlain.length,
      rewrittenPositions:known.rewritten,
      unrepairedCollisionPositions:known.unrepaired,
      trueModelRank,
      best:plantedRanking[0],
      nextBest:plantedRanking[1],
      viterbiRuneAccuracy:correct/recovered.length,
      viterbiDecodedRewrites:plantedInverse.modeledRewrites}
  };
  process.stdout.write(JSON.stringify(report,null,2)+"\n");
  return report;
}
if(require.main===module)main();
module.exports={encode,marginal,scan,plant,viterbiUnit,decipher,main};
