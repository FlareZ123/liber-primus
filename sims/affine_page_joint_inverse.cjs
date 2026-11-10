"use strict";
/**
 * Constructive inversion of the affine-page shared-pad hypothesis:
 * C[j,t] = a[j]*(P[j,t]+K[t]) + b[j] (mod 29).
 *
 * An independent Fourier fitter first supplies 49 page-wise frequency and
 * phase guesses. For each global multiplier u=1..28, a two-way coordinate
 * likelihood maximizer recovers page offsets and key symbols from 75 even
 * rune offsets, using a separately sourced GP-English character prior.
 *
 * At 75 strictly held-out odd offsets, infer each key symbol ONLY from the
 * 25 even-numbered pages; score independently on the other 24 pages.
 * Compare with full-page rotations, and recover source plaintext in
 * forward-generated known-key controls.
 *
 * This is a model-conditional inversion, never an assertion that an LP2
 * plaintext was recovered unless its held-out language score is exceptional.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {makePrior}=require("./caesar_pad_spectral.cjs");
const {fit,plant}=require("./affine_page_spectral_sync.cjs");
const MOD=29,PREFIX=150,T=PREFIX/2;
const ROOT=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(
  path.join(ROOT,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const english=fs.readFileSync(
  path.join(ROOT,"resources/control/shakespeare_first300k.txt"),"utf8");
const logq=makePrior(english).map(Math.log);
const mod=x=>(x%MOD+MOD)%MOD;
/** @param {number} seed */
function rng32(seed){let x=seed|0;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;
  return (x>>>0)/4294967296;};}
/** @param {number} real @param {number} imaginary */
function quantize(real,imag){
  return mod(Math.round(MOD*Math.atan2(imag,real)/(2*Math.PI)));
}
/**
 * @param {number[][]} pages
 * @param {{frequencies:number[],phaseReal:number[],phaseImag:number[]}} spectral
 * @param {number} factor
 */
function optimize(pages,spectral,factor){
  const n=pages.length,shift=new Int8Array(n),key=new Int8Array(T);
  const transformed=pages.map((page,j)=>Int8Array.from(
    Array.from({length:T},(_,t)=>mod(factor*spectral.frequencies[j]*page[2*t]))));
  for(let j=0;j<n;j++)shift[j]=mod(factor*quantize(
    spectral.phaseReal[j],spectral.phaseImag[j]));
  // Coordinate ascent is deterministic, and consumes exclusively even
  // positions. Integer page shifts and key phases are defined up to gauge.
  for(let iteration=0;iteration<9;iteration++){
    for(let t=0;t<T;t++){
      let best=-Infinity,choice=0;
      for(let k=0;k<MOD;k++){
        let score=0;
        for(let j=0;j<n;j++)
          score+=logq[mod(transformed[j][t]-shift[j]-k)];
        if(score>best){best=score;choice=k;}
      }
      key[t]=choice;
    }
    for(let j=0;j<n;j++){
      let best=-Infinity,choice=0;
      for(let b=0;b<MOD;b++){
        let score=0;
        for(let t=0;t<T;t++)
          score+=logq[mod(transformed[j][t]-b-key[t])];
        if(score>best){best=score;choice=b;}
      }
      shift[j]=choice;
    }
  }
  let train=0;
  for(let j=0;j<n;j++)for(let t=0;t<T;t++)
    train+=logq[mod(transformed[j][t]-shift[j]-key[t])];
  return {factor,shift:Array.from(shift),key:Array.from(key),
    train:train/(n*T)};
}
/**
 * @param {number[][]} pages
 * @param {ReturnType<typeof optimize>} hypothesis
 * @param {number[]} frequency
 * @param {number[][] | null} knownPlain
 */
function holdout(pages,hypothesis,frequency,knownPlain=null){
  const n=pages.length,source=[],predictions=[],inferredKeys=[];
  let score=0,correct=0;
  for(let t=0;t<T;t++){
    let best=-Infinity,choice=0;
    for(let k=0;k<MOD;k++){
      let current=0;
      for(let j=0;j<n;j+=2)
        current+=logq[mod(hypothesis.factor*frequency[j]*pages[j][2*t+1]-
          hypothesis.shift[j]-k)];
      if(current>best){best=current;choice=k;}
    }
    inferredKeys.push(choice);
    for(let j=1;j<n;j+=2){
      const predicted=mod(hypothesis.factor*frequency[j]*pages[j][2*t+1]-
        hypothesis.shift[j]-choice);
      score+=logq[predicted];
      predictions.push(predicted);
      if(knownPlain){const plain=knownPlain[j][2*t+1];
        source.push(plain);if(predicted===plain)correct++;}
    }
  }
  return {perRune:score/predictions.length,predictions,
    correct:knownPlain?correct/predictions.length:null,
    inferredKeys};
}
/**
 * Select pages that agree most strongly with the fit on training positions.
 * The selector never sees odd-offset ciphertext. Wrong-frequency pages in a
 * planted manuscript produce incoherent Fourier components; a robust 36-page
 * core can learn a common pad without forcing those outliers into the key.
 *
 * @param {number[][]} pages
 * @param {ReturnType<typeof fit>} spectrum
 */
function coherentCore(pages,spectrum){
  const n=pages.length,cos=Math.cos,sin=Math.sin,score=new Float64Array(n);
  const re=new Float64Array(75),im=new Float64Array(75);
  for(let t=0;t<75;t++){
    let sr=0,si=0;
    for(let j=0;j<n;j++){
      const a=2*Math.PI*spectrum.frequencies[j]*pages[j][2*t]/MOD;
      const r=cos(a),i=sin(a),pr=spectrum.phaseReal[j],
        pi=spectrum.phaseImag[j];
      sr+=r*pr+i*pi;si+=i*pr-r*pi;
    }
    re[t]=sr;im[t]=si;
  }
  for(let j=0;j<n;j++){
    let v=0;
    for(let t=0;t<75;t++){
      const a=2*Math.PI*spectrum.frequencies[j]*pages[j][2*t]/MOD,
        r=cos(a),i=sin(a),pr=spectrum.phaseReal[j],pi=spectrum.phaseImag[j];
      const cr=r*pr+i*pi,ci=i*pr-r*pi;
      v+=cr*re[t]+ci*im[t];
    }
    score[j]=v;
  }
  return Array.from({length:n},(_,j)=>j).sort((a,b)=>score[b]-score[a])
    .slice(0,36).sort((a,b)=>a-b);
}
/** @param {number[][]} pages */
function decode(pages,knownPlain=null,actualMultipliers=null){
  const spectrum=fit(pages),core=coherentCore(pages,spectrum),
    selected=core.map(j=>pages[j]),
    reduced={frequencies:core.map(j=>spectrum.frequencies[j]),
      phaseReal:core.map(j=>spectrum.phaseReal[j]),
      phaseImag:core.map(j=>spectrum.phaseImag[j])},cases=[];
  for(let u=1;u<MOD;u++)cases.push(optimize(selected,reduced,u));
  cases.sort((a,b)=>b.train-a.train);
  const winner=cases[0];
  const held=holdout(selected,winner,reduced.frequencies,
    knownPlain?core.map(j=>knownPlain[j]):null);
  let correctMultiplier=null;
  if(actualMultipliers){
    correctMultiplier=reduced.frequencies.filter((h,j)=>
      mod(winner.factor*h*actualMultipliers[core[j]])===1).length;
  }
  return {train:winner.train,heldout:held.perRune,factor:winner.factor,
    spectralHeldout:spectrum.heldout,selectedPages:core.length,
    correctMultiplier,correctPlaintext:held.correct,
    recoveredGPPreview:held.predictions.slice(0,60).map(i=>corpus.translit[i]).join("")};
}
/** @param {number[][]} pages @param {()=>number} rng */
function rotate(pages,rng){return pages.map(p=>{const off=Math.floor(rng()*p.length);
  return p.slice(off).concat(p.slice(0,off));});}
/** @param {number} nullCount */
function run(nullCount=40){
  const originals=corpus.pages.filter(p=>p.status==="unsolved"&&
    p.indices.length>=PREFIX).map(p=>p.indices);
  assert.equal(originals.length,49);
  const real=decode(originals);
  const rnd=rng32(0xa15f701a),nulls=[];
  for(let i=0;i<nullCount;i++)nulls.push(decode(rotate(originals,rnd)).heldout);
  const plants=[];
  for(const overwrite of [0,0.81])for(let i=0;i<8;i++){
    const planted=plant(originals,logq.map(Math.exp),overwrite,
      (0xa15f3100+1439*i+Math.floor(1000*overwrite))>>>0);
    const result=decode(planted.pages,planted.plainPages,planted.multiplier);
    plants.push({overwrite,seed:i,repairs:planted.repairs,...result});
  }
  return {
    question:"Constructive GP/plaintext recovery from a hidden common pad with independent unknown affine rune alphabets per page",
    originalCorpus:{pages:49,runesPerPage:PREFIX,
      evenRuneOffsetsPerPage:75,oddRuneOffsetsPerPage:75,
      keyFitPagesPerOddOffset:25,unfittedEvaluationPagesPerOddOffset:24},
    estimator:"Select 36 pages by even-offset coherence; 28 global multiplicative hypotheses, nine deterministic row/key coordinate steps; no original plaintext known",
    observed:real,
    null:{repetitions:nullCount,seed:"0xa15f701a",
      heldoutMean:nulls.reduce((a,b)=>a+b,0)/nulls.length,
      heldoutMin:Math.min(...nulls),heldoutMax:Math.max(...nulls),
      upperTail:(1+nulls.filter(x=>x>=real.heldout).length)/(nullCount+1)},
    positiveControls:{runs:plants,
      meanCorrectUnedited:plants.filter(x=>x.overwrite===0).reduce(
        (s,x)=>s+x.correctPlaintext,0)/8,
      meanCorrectRewritten:plants.filter(x=>x.overwrite>0).reduce(
        (s,x)=>s+x.correctPlaintext,0)/8},
    limit:"No plaintext claim without original-ciphertext out-of-sample language evidence and an independent exact forward transformation."
  };
}
if(require.main===module)console.log(JSON.stringify(run(Number(process.argv[2]||40)),null,2));
module.exports={quantize,optimize,holdout,decode,run};
