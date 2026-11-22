'use strict';

/**
 * Source-led original 27x27 opening secret rank-one bilinear additive mask recovery.
 *
 * Hypothetical cipher: C[r,c] = (P[r,c]+R[r]*K[c]) mod29; arbitrary unknown
 * 27 row and 27 column mask values, with gauge R[0]=1. Under the historical
 * signed "epiphany seeks" heading, the 13 initial red title runes fix the
 * 13 first-row K values. Optimize the 40 remaining bilinear mask variables using
 * an independent GP29 trigram language model, with known-GP native planted
 * controls. This is a genuine 729-rune original-cipher inverse attempt, NOT
 * authenticated inventor selection. Run Node.js 22 CJS on Windows, read-only.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
/** @param {string} p @returns {string} */
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const C=corpus.pages.slice(0,3).flatMap(p=>p.indices);
assert.equal(C.length,729);
const mod=n=>((n%29)+29)%29;
const symbols=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
/** @param {string} plaintext @returns {number[]} */
function gpEncode(plaintext){
  const out=[];
  const normalized=plaintext.toUpperCase().replace(/^#.*$/gm,' ')
    .replace(/\[[^\]]*\]/g,' ')
    .replace(/QU/g,'CW').replace(/[KQ]/g,'C')
    .replace(/V/g,'U').replace(/Z/g,'S');
  for(const word of normalized.match(/[A-Z]+/g)||[]){
    for(let i=0;i<word.length;){
      const match=symbols.find(t=>word.startsWith(t.s,i));
      assert.ok(match,'unmappable GP29 native word: '+word);
      out.push(match.i);i+=match.s.length;
    }
  }
  return out;
}
const title=gpEncode('EPIPHANY SEEKS');
assert.equal(title.length,13);
const modelText=[
  read('resources/control/gibran_prophet_58585.txt'),
  read('resources/control/shakespeare_first300k.txt'),
].map(gpEncode);
const gamma=0.1;
const hist=new Float64Array(29*29*29).fill(gamma);
let triples=0;
for(const runes of modelText)
  for(let i=2;i<runes.length;i++){
    hist[841*runes[i-2]+29*runes[i-1]+runes[i]]++;
    triples++;
  }
const denominator=triples+hist.length*gamma;
const logP=Float64Array.from(hist,n=>Math.log(n/denominator));
const trigram=(a,b,c)=>logP[841*a+29*b+c];
const GP=a=>a.map(i=>corpus.translit[i]).join('');

/** @param {number[]} source @param {number[]} R @param {number[]} K */
function decrypt(source,R,K){
  return source.map((c,i)=>mod(c-R[Math.floor(i/27)]*K[i%27]));
}
/** @param {number[]} plain @param {number[]} R @param {number[]} K */
function encrypt(plain,R,K){
  return plain.map((p,i)=>mod(p+R[Math.floor(i/27)]*K[i%27]));
}
/** @param {number[]} plain @returns {number} */
function languageScore(plain){
  let score=0;
  for(let i=2;i<plain.length;i++)score+=trigram(plain[i-2],plain[i-1],plain[i]);
  return score/(plain.length-2);
}
let state=0x3301c27d;
const rand=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;};
const controls=gpEncode(read('resources/liber-primus/lp1-plaintext-reference.txt'));
assert.ok(controls.length>=729);
const plainNative=[...title,...controls.slice(0,716)];
assert.equal(plainNative.length,729);
const plantedR=Array.from({length:27},(_,i)=>i===0?1:rand()%29);
const plantedK=Array.from({length:27},()=>rand()%29);
const plantedC=encrypt(plainNative,plantedR,plantedK);
assert.deepEqual(decrypt(plantedC,plantedR,plantedK),plainNative);

/** @param {number[]} ciphertext @param {number} restartLimit */
function search(ciphertext,restartLimit){
  const windows=[];
  for(let row=0;row<27;row++){
    const positions=Array.from({length:27},(_,col)=>row*27+col);
    const affected=[...new Set(positions.flatMap(i=>[i,i+1,i+2])
      .filter(i=>i>=2&&i<729))];
    windows.push({type:'row',index:row,positions,affected});
  }
  for(let col=0;col<27;col++){
    const positions=Array.from({length:27},(_,row)=>row*27+col);
    const affected=[...new Set(positions.flatMap(i=>[i,i+1,i+2])
      .filter(i=>i>=2&&i<729))];
    windows.push({type:'column',index:col,positions,affected});
  }
  const degrees=[...windows.slice(1,27),...windows.slice(27+13)];
  /** @param {number[]} pt @param {number[]} starts */
  const sumAffected=(pt,starts)=>{
    let sum=0;
    for(const i of starts)sum+=trigram(pt[i-2],pt[i-1],pt[i]);
    return sum;
  };
  let best=null;
  for(let trial=0;trial<restartLimit;trial++){
    const R=Array(27).fill(1);
    const K=Array.from({length:27},(_,i)=>i<13?mod(ciphertext[i]-title[i]):(trial===0?0:rand()%29));
    for(let i=1;i<27;i++)R[i]=trial===0?1:rand()%29;
    const pt=decrypt(ciphertext,R,K);
    assert.deepEqual(pt.slice(0,13),title);
    let sweepCount=0,changed=0;
    for(let sweep=0;sweep<22;sweep++){
      sweepCount++;
      let updates=0;
      const ordering=degrees.slice();
      if(sweep%2===0) ordering.reverse();
      for(const d of ordering){
        const values=d.type==='row'?R:K;
        const initial=values[d.index];
        let top=initial,topScore=sumAffected(pt,d.affected);
        for(let shift=1;shift<29;shift++){
          const candidate=(initial+shift)%29;
          const delta=mod(candidate-initial);
          for(const i of d.positions)pt[i]=mod(pt[i]-delta*(d.type==='row'?K[i%27]:R[Math.floor(i/27)]));
          const now=sumAffected(pt,d.affected);
          if(now>topScore+1e-12){topScore=now;top=candidate;}
          for(const i of d.positions)pt[i]=mod(pt[i]+delta*(d.type==='row'?K[i%27]:R[Math.floor(i/27)]));
        }
        if(top!==initial){
          const delta=mod(top-initial);
          for(const i of d.positions)pt[i]=mod(pt[i]-delta*(d.type==='row'?K[i%27]:R[Math.floor(i/27)]));
          values[d.index]=top;
          updates++;changed++;
        }
      }
      if(updates===0)break;
    }
    const score=languageScore(pt);
    assert.deepEqual(encrypt(pt,R,K),ciphertext);
    assert.deepEqual(pt.slice(0,13),title);
    if(!best||score>best.score){
      best={score,pt:pt.slice(),R:R.slice(),K:K.slice(),sweeps:sweepCount,updates:changed,trial};
    }
  }
  return best;
}
const nativeScore=languageScore(plainNative);
const controlSolved=search(plantedC,8);
const originalSolved=search(C,14);
const accuracy=controlSolved.pt.filter((n,i)=>n===plainNative[i]).length;
const source=originalSolved.pt;
const sourceScore=originalSolved.score;
const trainLast=languageScore(controls.slice(-729));
// The planted source text is external to model training. A second,
 // independently selected control is every 729-rune sliding window of
 // already-solved LP1 GP-native prose, with no masks. This provides a
 // frozen absolute-scale reference for the original best-score.
const benchmark=[];
for(let start=0;start+729<=controls.length;start++)
  benchmark.push(languageScore(controls.slice(start,start+729)));
benchmark.sort((a,b)=>a-b);
const trainingFloor=benchmark[0],trainingMedian=benchmark[Math.floor(benchmark.length/2)];
assert.ok(benchmark.length>1000);
assert.ok(originalSolved.score<trainingFloor);
console.log(JSON.stringify({
  hypothesis:'C[r,c]=P[r,c]+R[r]*K[c] mod29, arbitrary 27x27 rank-one secret mask, R0=1',
  originalGrid:[27,27], originalFirst13GP:title,
  plantedControl:{
    originalNativeModelScore:+nativeScore.toFixed(5),
    solvedNativeModelScore:+controlSolved.score.toFixed(5),
    recoveredRunes:accuracy,of:729,positiveModelRunes:controls.length,
    heldoutNativeWindows:benchmark.length,
    heldoutNativeMinimum:+trainingFloor.toFixed(5),
    heldoutNativeMedian:+trainingMedian.toFixed(5),
    correctRows:controlSolved.R.filter((v,i)=>v===plantedR[i]).length,
    correctCols:controlSolved.K.filter((v,i)=>v===plantedK[i]).length
  },
  original:{
    bestTrainingMean:+sourceScore.toFixed(5),
    nativeIndependentEndMean:+trainLast.toFixed(5),
    bestTrial:originalSolved.trial,
    sweeps:originalSolved.sweeps,
    currentHeadline:GP(source.slice(0,13)),
    bodyFirst180:GP(source.slice(13,193)),
    fullCipherInverse:true,
    recoveredNoVerifiedPlaintext:true
  },
  warning:'Language-optimized 40 free bilinear variables can hallucinate partial English; no phrase is verified without independently source-fixed key/operation and a heldout full-run decoder'
},null,2));
console.log('PASS: full original bilinear grid key search and positive plant are reversibly implemented');
