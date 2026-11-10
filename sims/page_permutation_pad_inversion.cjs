"use strict";
/**
 * Constructive inversion of a page-aligned, additive mod-29 pad when every
 * physical page has an independent UNKNOWN 29-rune output permutation.
 *
 * Ciphertext-only training uses only same-rune collisions within each page.
 * These are invariant under arbitrary page-specific rune permutations.
 * Recover K[t] by fitting the known GP-source cyclic autocorrelation to
 * within-page equality pairs; hold out entire pages before fitting K.
 *
 * No claim that this architecture is correct for LP2. Its synthetic control
 * reports both perfect-key detectability and the algorithm's actual power.
 * Node 22 / CommonJS. Run through the manual GitHub Actions workflow.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {shakespeareRunes, modelDistribution} = require("./latent_page_pad.cjs");
const {seededRandom, shuffledPermutation} = require("./outer_permutation_assignment.cjs");

const ROOT = path.resolve(__dirname, "..");
const A = 29;
const WINDOW = Number(process.env.WINDOW || 192);
const STARTS = Number(process.env.STARTS || 16);
const SWEEPS = Number(process.env.SWEEPS || 20);
const ROTATIONS = Number(process.env.ROTATIONS || 250);
const SEED = 0x33a31026;
const mod = x => (x % A + A) % A;

/** @param {number[]} frequencies @returns {number[]} */
function autoCorrelation(frequencies) {
  return Array.from({length:A}, (_, d) =>
    frequencies.reduce((s, v, j) => s + v * frequencies[(j+d) % A], 0));
}

/**
 * @param {number[][]} pages
 * @param {number[]} probabilities
 * @param {number} width
 * @returns {(Float64Array|null)[][]}
 */
function edges(pages, probabilities, width) {
  const out = Array.from({length:width}, () => Array(width).fill(null));
  const rates = autoCorrelation(probabilities);
  for (let i=0;i<width;i++) for (let j=i+3;j<width;j++) {
    let n=0, equal=0;
    for(const p of pages) if(j<p.length) {
      n++;
      if(p[i]===p[j])equal++;
    }
    if(n<8)continue;
    const w=new Float64Array(A);
    for(let d=0;d<A;d++) {
      const probability=rates[d];
      w[d]=equal*Math.log(probability)+(n-equal)*Math.log(1-probability);
    }
    out[i][j]=w;
    out[j][i]=w;
  }
  return out;
}

/** @param {(Float64Array|null)[][]} edge @param {number[]} key */
function energy(edge,key) {
  let total=0;
  for(let i=0;i<key.length;i++)for(let j=i+3;j<key.length;j++){
    const w=edge[i][j];
    if(w)total+=w[mod(key[i]-key[j])];
  }
  return total;
}

/**
 * Multi-eigenvector spectral initializer for the latent cyclic pad.
 * Each page-local equality indicator survives any permutation of its
 * output alphabet. Its centered expectation is r[K_i-K_j]-1/29, a
 * circulant positive-semidefinite kernel. Leading eigenvector pairs
 * encode Fourier phases of K, up to a global phase and harmonic index.
 *
 * @param {number[][]} pages
 * @param {number} width
 * @param {()=>number} random
 * @returns {number[][]}
 */
function spectralCandidates(pages,width,random) {
  const matrix=Array.from({length:width},()=>new Float64Array(width));
  for(let i=0;i<width;i++)for(let j=i+3;j<width;j++) {
    let n=0,e=0;
    for(const p of pages)if(j<p.length){
      n++;
      e+=Number(p[i]===p[j]);
    }
    if(n<8)continue;
    matrix[i][j]=matrix[j][i]=(e-n/A)/Math.sqrt(n);
  }
  const count=8;
  const vectors=Array.from({length:count},()=>
    Float64Array.from({length:width},()=>random()-.5));
  const normalize=(vectors,index)=>{
    const a=vectors[index];
    for(let k=0;k<index;k++){
      const b=vectors[k];
      let projection=0;
      for(let t=0;t<width;t++)projection+=a[t]*b[t];
      for(let t=0;t<width;t++)a[t]-=projection*b[t];
    }
    let norm=0;
    for(const v of a)norm+=v*v;
    norm=Math.sqrt(norm);
    if(norm<1e-12){for(let t=0;t<width;t++)a[t]=random()-.5;return normalize(vectors,index);}
    for(let t=0;t<width;t++)a[t]/=norm;
  };
  for(let i=0;i<count;i++)normalize(vectors,i);
  for(let step=0;step<80;step++){
    const next=Array.from({length:count},()=>new Float64Array(width));
    for(let k=0;k<count;k++){
      const v=vectors[k],w=next[k];
      for(let i=0;i<width;i++){
        let n=8*v[i];
        const row=matrix[i];
        for(let j=0;j<width;j++)n+=row[j]*v[j];
        w[i]=n;
      }
    }
    for(let k=0;k<count;k++)normalize(next,k);
    for(let k=0;k<count;k++)vectors[k]=next[k];
  }
  const eigen=vectors.map(v=>{
    let value=0;
    for(let i=0;i<width;i++)for(let j=0;j<width;j++)
      value+=v[i]*matrix[i][j]*v[j];
    return {value,v};
  }).sort((a,b)=>b.value-a.value);
  const out=[];
  for(let a=0;a<count;a++)for(let b=a+1;b<count;b++){
    const u=eigen[a].v,v=eigen[b].v;
    const theta=Array.from({length:width},(_,i)=>
      Math.atan2(v[i],u[i])*A/(2*Math.PI));
    for(let h=1;h<=14;h++){
      let inverse=1;
      while((h*inverse)%A!==1)inverse++;
      for(let shift=0;shift<8;shift++){
        const candidate=theta.map(t=>mod(Math.round(t+shift/8)*inverse));
        out.push(candidate);
      }
    }
  }
  return out;
}

/**
 * Multistart coordinate optimization of a densely coupled 29-state model.
 * No ground truth is ever supplied to this routine.
 * @param {(Float64Array|null)[][]} edge
 * @param {()=>number} random
 * @param {number} starts
 * @param {number} sweeps
 */
function inferKey(edge,random,starts,sweeps,spectralSeeds=[]) {
  const length=edge.length;
  let winner=null,best=-Infinity;
  const ranked=spectralSeeds.map(key=>({key,score:energy(edge,key)}))
    .sort((a,b)=>b.score-a.score).slice(0,12);
  for(let s=0;s<starts+ranked.length;s++) {
    const key=s<ranked.length?ranked[s].key.slice():
      Array.from({length},()=>Math.floor(random()*A));
    const order=Array.from({length},(_,i)=>i);
    for(let iteration=0;iteration<sweeps;iteration++){
      for(let t=length-1;t>0;t--){
        const j=Math.floor(random()*(t+1));
        [order[t],order[j]]=[order[j],order[t]];
      }
      let changed=0;
      for(const i of order) {
        const scores=new Float64Array(A);
        for(let j=0;j<length;j++){
          const w=edge[i][j];
          if(!w)continue;
          const kj=key[j];
          for(let candidate=0;candidate<A;candidate++){
            scores[candidate]+=w[mod(candidate-kj)];
          }
        }
        let chosen=key[i];
        let value=scores[chosen];
        for(let candidate=0;candidate<A;candidate++){
          if(scores[candidate]>value){chosen=candidate;value=scores[candidate];}
        }
        if(chosen!==key[i]){key[i]=chosen;changed++;}
      }
      if(!changed)break;
    }
    const score=energy(edge,key);
    if(score>best){best=score;winner=key.slice();}
  }
  return {key:winner,trainingScore:best};
}

/**
 * Independent held-out log likelihood ratio versus uniform-rune equality.
 * Exclude close lags so anti-repeat repair is not fitted as cryptographic
 * key structure. No page-local symbol mapping needs to be inferred.
 * @param {number[][]} pages
 * @param {number[]} key
 * @param {number[]} rates
 */
function heldout(pages,key,rates) {
  let score=0, observations=0;
  for(const page of pages) {
    const n=Math.min(page.length,key.length);
    for(let i=0;i<n;i++)for(let j=i+3;j<n;j++) {
      const r=rates[mod(key[i]-key[j])];
      const same=page[i]===page[j];
      score+=same?Math.log(r*A):Math.log((1-r)/(1-1/A));
      observations++;
    }
  }
  return {score, observations, scorePerPair:score/observations};
}

/** @param {number[][]} original @param {()=>number} random */
function rotatePages(original,random){
  return original.map(p=>{
    const offset=Math.floor(random()*p.length);
    return p.slice(offset).concat(p.slice(0,offset));
  });
}

/** @param {number[]} prior @param {number[][]} template @param {number} seed */
function planted(prior,template,seed){
  const random=seededRandom(seed), width=Math.max(...template.map(p=>p.length));
  const pad=Array.from({length:width},()=>Math.floor(random()*A));
  const cumulative=[];let n=0;
  for(const p of prior){n+=p;cumulative.push(n);}
  const sample=()=>{const v=random();let j=0;while(j<28&&v>=cumulative[j])j++;return j;};
  let repairs=0;
  const pages=template.map(original=>{
    const sigma=shuffledPermutation(Array.from({length:A},(_,i)=>i),random);
    const output=[];
    for(let t=0;t<original.length;t++) {
      let c=sigma[(sample()+pad[t])%A];
      if(t&&c===output[t-1]&&random()<.81) {
        const other=Math.floor(random()*28);
        c=other>=output[t-1]?other+1:other;
        repairs++;
      }
      output.push(c);
    }
    return output;
  });
  return {pages,pad,repairs};
}

/** @param {number[]} found @param {number[]} correct */
function keyRecovery(found,correct){
  let matches=0,best=null;
  for(const direction of [-1,1])for(let offset=0;offset<A;offset++) {
    let n=0;
    for(let i=0;i<found.length;i++)if(found[i]===mod(offset+direction*correct[i]))n++;
    if(n>matches){matches=n;best={direction,offset};}
  }
  return {matches,total:found.length,fraction:matches/found.length,gauge:best};
}

/**
 * @param {number[][]} data
 * @param {number[]} prior
 * @param {number} seed
 * @param {number[]|null} groundTruth
 */
function run(data,prior,seed,groundTruth=null) {
  const random=seededRandom(seed),rates=autoCorrelation(prior);
  const training=data.filter((_,i)=>i%4!==0);
  const checking=data.filter((_,i)=>i%4===0);
  const fit=inferKey(edges(training,prior,WINDOW),random,STARTS,SWEEPS,
    spectralCandidates(training,WINDOW,random));
  const observed=heldout(checking,fit.key,rates);
  let greater=0;
  const nullScores=[];
  for(let i=0;i<ROTATIONS;i++){
    const value=heldout(rotatePages(checking,random),fit.key,rates).score;
    nullScores.push(value);
    if(value>=observed.score)greater++;
  }
  const mean=nullScores.reduce((s,v)=>s+v,0)/ROTATIONS;
  const sd=Math.sqrt(nullScores.reduce((s,v)=>s+(v-mean)**2,0)/(ROTATIONS-1));
  return {
    trainingPages:training.length,heldoutPages:checking.length,
    width:WINDOW,starts:STARTS,sweeps:SWEEPS,
    trainingScore:fit.trainingScore,
    observed, nullMean:mean,nullSD:sd,
    nullUpperP:(greater+1)/(ROTATIONS+1),
    relativeZ:(observed.score-mean)/sd,
    recovered:groundTruth?keyRecovery(fit.key,groundTruth.slice(0,WINDOW)):null,
    oracleHeldout:groundTruth?heldout(checking,groundTruth.slice(0,WINDOW),rates):null,
    inferredKey:fit.key
  };
}

function main(){
  const corpus=JSON.parse(fs.readFileSync(path.join(ROOT,"resources/liber-primus/lp2-corpus.json"),"utf8"));
  const template=corpus.pages.filter(p=>p.status==="unsolved"&&p.indices.length).map(p=>p.indices);
  assert.equal(template.length,55);
  assert.equal(template.reduce((s,p)=>s+p.length,0),12956);
  const text=fs.readFileSync(path.join(ROOT,"resources/control/shakespeare_first300k.txt"),"utf8");
  const prior=modelDistribution(shakespeareRunes(text).slice(6000,180000),.1);
  const synthetic=planted(prior,template,0x88017fa3);
  const control=run(synthetic.pages,prior,SEED+1,synthetic.pad);
  const actual=run(template,prior,SEED+2);
  console.log(JSON.stringify({
    hypothesis:"same page-position additive pad, independent unknown page glyph permutations",
    model:"cyclic autocorrelation collision inversion; disjoint pages for key fit and evaluation",
    source:"Shakespeare GP transliteration, 10% uniform-mixture prior",
    seed:SEED,plantSeed:0x88017fa3,syntheticRepairCount:synthetic.repairs,
    sourceAutocorrelation:autoCorrelation(prior),
    control,real:actual
  },null,2));
}
if(require.main===module)main();
module.exports={autoCorrelation,edges,energy,inferKey,spectralCandidates,heldout,planted,keyRecovery,run};
