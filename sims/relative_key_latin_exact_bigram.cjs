'use strict';
/**
 * Independently sourced Latin-GP exact two-stream decryption test.
 * Target: original physical LP2 page28 vs page42 (269 vs 272 runes).
 * Source hypothesis (preselected by other research): ciphertext difference
 * D_i=C28_i-C42_i=4*(P28_i-P42_i) mod29, one reused unknown pad.
 *
 * Exact 29-state forward marginal and Viterbi backtrace from
 * precommitted Latin Vulgate source counts; compare all 272 rotations.
 * Also fit an independent source-English GP comparison.
 *
 * Source-true controls use 2 disjoint heldout Latin passages and a shared
 * random pad, either with intact cipher or forced 81%-rate local
 * repeat repairs. No LP2 plaintext claims without coherent original output.
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {latinModel}=require('./title_grid_kdf_viterbi.cjs');
const {train}=require('./grid_keyskip_viterbi.cjs');
const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ALPHABET=[...'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'];
const mod=x=>(x%29+29)%29;
const N=269,SHIFTS=272;
const a=corpus.pages.find(x=>x.page===28).indices;
const b=corpus.pages.find(x=>x.page===42).indices;
assert.equal(a.length,N);assert.equal(b.length,SHIFTS);
const GP=JSON.parse(read('resources/control/latin-vulgate-heldout-gp.json')).runes;
assert.equal(GP.length,2400);

/** Reproducible PRNG for synthetic actual-source positive controls. */
function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;};}

/** Return exact source difference sequence for scale4, shift by original page42 index. */
function diff(x,y,shift=0){
  const out=new Uint8Array(x.length);
  for(let i=0;i<x.length;i++)out[i]=mod(22*(x[i]-y[(i+shift)%y.length]));
  return out;
}

/**
 * Exact forward sum of two independent source-bigram plaintext strings,
 * constrained by each original page's observed difference sequence.
 * @param {Uint8Array} differences 4-inverted GP rune offsets, one per position.
 * @param {ReturnType<typeof latinModel>} lm
 */
function marginal(differences,lm){
  const probs=Float64Array.from(lm.bigram,Math.exp);
  const u=Float64Array.from(lm.unigram,Math.exp);
  let prev=new Float64Array(29),next=new Float64Array(29),mass=0,log=0;
  const d0=differences[0];
  for(let p=0;p<29;p++){
    const q=mod(p-d0);
    mass+=prev[p]=u[p]*u[q];
  }
  log+=Math.log(mass);for(let p=0;p<29;p++)prev[p]/=mass;
  for(let i=1;i<differences.length;i++){
    const dprev=differences[i-1],d=differences[i];
    mass=0;
    for(let p=0;p<29;p++){
      const q=mod(p-d),idx=p;
      let m=0;
      for(let v=0;v<29;v++){
        const qprev=mod(v-dprev);
        m+=prev[v]*probs[v*29+idx]*probs[qprev*29+q];
      }
      next[p]=m;mass+=m;
    }
    log+=Math.log(mass);
    for(let p=0;p<29;p++)next[p]/=mass;
    [prev,next]=[next,prev];
  }
  return log;
}

/** Exact maximum two-stream source-bigram Viterbi path for fixed difference tape. */
function viterbi(differences,lm){
  let prev=new Float64Array(29),next=new Float64Array(29);
  const trace=new Int8Array(differences.length*29);
  for(let p=0;p<29;p++)prev[p]=lm.unigram[p]+lm.unigram[mod(p-differences[0])];
  for(let i=1;i<differences.length;i++){
    const prevD=differences[i-1],d=differences[i];
    for(let p=0;p<29;p++){
      let best=-Infinity,bestV=-1;const q=mod(p-d);
      for(let v=0;v<29;v++){
        const qprev=mod(v-prevD);
        const candidate=prev[v]+lm.bigram[v*29+p]+lm.bigram[qprev*29+q];
        if(candidate>best){best=candidate;bestV=v;}
      }
      next[p]=best;trace[i*29+p]=bestV;
    }
    [prev,next]=[next,prev];
  }
  let state=0;
  for(let p=1;p<29;p++)if(prev[p]>prev[state])state=p;
  const p=new Array(differences.length),q=new Array(differences.length);
  for(let i=differences.length-1;i>=0;i--){
    p[i]=state;q[i]=mod(state-differences[i]);
    if(i)state=trace[i*29+state];
  }
  return {p,q,score:Math.max(...prev)};
}

function cipherPlant(plainA,plainB,repair=false,seed=0x32428119){
  const random=rng(seed),key=Array.from({length:N},()=>Math.floor(29*random()));
  const encrypt=(plain)=>{
    let previous=-1,repaired=0;const output=[];
    for(let i=0;i<N;i++){
      let v=mod(4*plain[i]+key[i]);
      if(repair && v===previous && random()<0.81){
        v=mod(v+1+Math.floor(28*random()));repaired++;
      }
      output.push(v);previous=v;
    }
    return {output,repaired};
  };
  const x=encrypt(plainA),y=encrypt(plainB);
  y.output.push(3,11,25);
  return {x:x.output,y:y.output,repaired:[x.repaired,y.repaired]};
}

/** Search all original page42 rotations, no scale/language parameters fit to real LP2. */
function scan(x,y,lm){
  const scores=Array.from({length:y.length},(_,shift)=>({shift,score:marginal(diff(x,y,shift),lm)}));
  scores.sort((v,w)=>w.score-v.score);
  const observed=scores.find(x=>x.shift===0);
  const decoded=viterbi(diff(x,y),lm);
  const render=arr=>arr.slice(0,100).map(i=>ALPHABET[i]).join('');
  return {zeroRank:scores.findIndex(x=>x.shift===0)+1,
    bestShift:scores[0].shift,observedScore:observed.score,
    bestScore:scores[0].score,secondScore:scores[1].score,
    medianScore:scores[Math.floor(scores.length/2)].score,
    topFive:scores.slice(0,5),
    decodedZero:{first100a:render(decoded.p),first100b:render(decoded.q),pathLogScore:decoded.score},
    path:decoded};
}
function study(){
  const latin=latinModel();
  const english=train(read('resources/control/shakespeare_first300k.txt').slice(0,200000));
  const p=GP.slice(0,N),q=GP.slice(800,800+N);
  const clean=cipherPlant(p,q,false),repaired=cipherPlant(p,q,true);
  const originalLatin=scan(a,b,latin),originalEnglish=scan(a,b,english);
  const plantedClean=scan(clean.x,clean.y,latin);
  const plantedRepaired=scan(repaired.x,repaired.y,latin);
  const correct=(actual)=>actual.path.p.filter((v,i)=>v===p[i]).length;
  const trueOffsetExpected=diff(clean.x,clean.y).every((v,i)=>v===mod(p[i]-q[i]));
  assert.ok(trueOffsetExpected);
  assert.equal(plantedClean.zeroRank,1,'Exact correct Latin shared pad must rank original alignment first');
  assert.ok(correct(plantedClean)>=N*0.15,'Positive Latin Viterbi should partially recover plaintext');
  const strip=run=>({zeroRank:run.zeroRank,bestShift:run.bestShift,
    observedScore:run.observedScore,bestScore:run.bestScore,secondScore:run.secondScore,
    medianScore:run.medianScore,topFive:run.topFive,decodedZero:run.decodedZero});
  return {hypothesis:'Physical LP2 p28 vs p42 share unknown scale4 additive key; exact pair difference constraint',
    positionCount:N,rotations:SHIFTS,sourceLanguage:'Latin Vulgate source vs English Shakespeare GP',scale:4,
    latinSourceTrainRunes:latin.symbols,latinPlantSource:'Disjoint Vulgate Revelation GP indices 0..268 and 800..1068',
    original:{latin:strip(originalLatin),english:strip(originalEnglish)},
    positive:{clean:{...strip(plantedClean),recoveredFirstPlaintext:correct(plantedClean),outOf:N},
      repaired:{...strip(plantedRepaired),recoveredFirstPlaintext:correct(plantedRepaired),outOf:N,repairs:repaired.repaired}},
    classification:'No plaintext unless coherent original zero-shift inverse with heldout clue. Pair and scale postselected in prior LP2 research.'};
}
if(require.main===module)process.stdout.write(JSON.stringify(study(),null,2)+'\n');
module.exports={marginal,viterbi,diff,scan,study};
