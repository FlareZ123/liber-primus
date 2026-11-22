'use strict';

/**
 * The proposed H2 hidden-clock GP29 substitution model, tested against the
 * ORIGINAL five-back and six-back ciphertext echoes on fully word-length-
 * matched synthetic English. This independently discriminates the model from
 * the source beyond its previously calibrated adjacent-repeat rate.
 *
 * Synthetic plaintext is Gibran GP29 whole words matched by exact original
 * printed word lengths. The physical ciphertext is never mutated. Every run
 * regenerates all 29 secret tableau permutations, English words, and hidden
 * q=.81 collision-skip trajectory with deterministic seed 0x33017bad.
 *
 * Evidence is a model-specific original-input negative, NOT a decryption.
 * Run with Windows Node.js 22 (no packages):
 *   node sims/lp2_h2_original_wordecho_source_shape_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {readWords,metrics,T}=require('./lag6_sparse_collision_repair.cjs');
const root=path.join(__dirname,'..');
const raw=fs.readFileSync(path.join(root,'resources/lp2-transcription.txt'),'utf8');
const original=readWords(raw).words;
const lengths=original.map(w=>w.length);
const originalCipher=original.flat();
assert.equal(original.length,2896);
assert.equal(originalCipher.length,12956);
const sourceNativeGP=JSON.parse(fs.readFileSync(path.join(root,
  'resources/liber-primus/lp2-corpus.json'),'utf8'));
assert.deepEqual(originalCipher,sourceNativeGP.pages.filter(p=>p.page<56)
  .flatMap(p=>p.indices));
const letters=sourceNativeGP.translit.map((s,i)=>({s,i}))
  .sort((a,b)=>b.s.length-a.s.length);
const text=fs.readFileSync(path.join(root,
  'resources/control/gibran_prophet_58585.txt'),'utf8');

/** @param {string} input @returns {number[]|null} */
function gpWord(input) {
  const w=input.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/[KQ]/g,'C').replace(/Z/g,'S');
  const out=[];
  for(let i=0;i<w.length;) {
    if(w.startsWith('ING',i)){out.push(21);i+=3;}
    else if(w.startsWith('IO',i)){out.push(27);i+=2;}
    else {
      const t=letters.find(v=>w.startsWith(v.s,i));
      if(!t)return null;
      out.push(t.i);i+=t.s.length;
    }
  }
  return out;
}
const byLength=Array.from({length:15},()=>[]);
for(const candidate of(text.match(/[A-Za-z]+/g)||[])) {
  const w=gpWord(candidate);
  if(w&&w.length<=14)byLength[w.length].push(w);
}
assert.ok(lengths.every(n=>n>0&&n<15&&byLength[n].length));
const sieve=new Uint8Array(650001);
const clock=[];
for(let i=2;i<sieve.length&&clock.length<45000;i++) {
  if(sieve[i])continue;
  clock.push((i-1)%29);
  if(i*i<sieve.length)for(let j=i*i;j<sieve.length;j+=i)sieve[j]=1;
}
assert.equal(clock.length,45000);
/** @param {number} initial */
function random(initial) {
  let s=initial>>>0;
  const float=()=> {
    s^=s<<13;s^=s>>>17;s^=s<<5;
    return(s>>>0)/4294967296;
  };
  return {float,int:n=>Math.floor(float()*n)};
}
/** @param {{int:(n:number)=>number}} rand */
function permutation(rand) {
  const v=Array.from({length:29},(_,i)=>i);
  for(let i=28;i>0;i--){const j=rand.int(i+1);[v[i],v[j]]=[v[j],v[i]];}
  return v;
}
/** @param {number[][]} words */
function echoes(words) {
  const found={
    lag5Pairs:0,
    lag5Same:0,
    lag5RuneS:0,
    lag6Affine:0,
    adjacentDoublets:0
  };
  let prev=-1;
  for(const word of words) {
    for(let j=0;j<word.length;j++) {
      const c=word[j];
      if(c===prev)found.adjacentDoublets++;
      if(j>=5&&c===word[j-5]) {
        found.lag5Same++;
        if(c===15)found.lag5RuneS++;
        if(j>=6&&word[j-1]===word[j-6])found.lag5Pairs++;
      }
      if(j>=6&&c===T(word[j-6]))found.lag6Affine++;
      prev=c;
    }
  }
  return found;
}
const actual=echoes(original);
assert.deepEqual(actual,{
  lag5Pairs:9,
  lag5Same:104,
  lag5RuneS:11,
  lag6Affine:80,
  adjacentDoublets:86
});
const established=metrics(original);
assert.equal(established.lag5Equal,actual.lag5Same);
assert.equal(established.lag5S,actual.lag5RuneS);
assert.equal(established.lag6Affine,actual.lag6Affine);
assert.equal(established.adjacentWithin+established.adjacentAcross,
  actual.adjacentDoublets);
const toyEchoes=echoes([[15,4,3,2,1,15,4]]);
assert.equal(toyEchoes.lag5Pairs,1);
assert.equal(toyEchoes.lag5RuneS,1);
assert.equal(echoes([[0,1,2,3,4,5,24]]).lag6Affine,1);

const N=2500,rand=random(0x33017bad);
const columns=Object.fromEntries(Object.keys(actual).map(k=>[k,[]]));
let trueSkippedTotal=0;
for(let run=0;run<N;run++) {
  const secret=Array.from({length:29},()=>permutation(rand));
  let j=0,previous=-1;
  const emitted=[];
  for(const n of lengths) {
    const plain=byLength[n][rand.int(byLength[n].length)];
    const cipher=[];
    for(const p of plain) {
      let c=secret[clock[j]][p];
      while(c===previous&&rand.float()<.81) {
        j++;trueSkippedTotal++;
        c=secret[clock[j]][p];
      }
      cipher.push(c);previous=c;j++;
    }
    emitted.push(cipher);
  }
  const observed=echoes(emitted);
  for(const [k,v] of Object.entries(observed))columns[k].push(v);
}
const summary={};
for(const [k,values] of Object.entries(columns)) {
  const mean=values.reduce((a,b)=>a+b,0)/N;
  const sd=Math.sqrt(values.reduce((s,v)=>s+(v-mean)**2,0)/N);
  summary[k]={
    original:actual[k],sampleMean:mean,sampleSd:sd,
    min:Math.min(...values),max:Math.max(...values),
    atOrAboveOriginal:values.filter(x=>x>=actual[k]).length,
    addOneUpperTail:(1+values.filter(x=>x>=actual[k]).length)/(N+1),
    atOrBelowOriginal:values.filter(x=>x<=actual[k]).length
  };
}
const fitsAll=['lag5Pairs','lag5Same','lag5RuneS','lag6Affine'];
const simultaneousFits=Array.from({length:N},(_,i)=>i)
  .filter(i=>fitsAll.every(k=>columns[k][i]>=actual[k])).length;
assert.ok(summary.adjacentDoublets.sampleMean>=70 &&
  summary.adjacentDoublets.sampleMean<=110);
console.log(JSON.stringify({
  status:'conditional original-source H2 structural failure; no authentic LP2 plaintext',
  model:'29 fully secret random GP29 rows; successive-prime phi row labels; q=.81 repeat-rejection key skip',
  originalRunes:originalCipher.length,
  originalPrintedWords:original.length,
  controlWordPoolSizes:byLength.map(a=>a.length),
  language:'Gibran source-native whole words sampled at exact original GP word lengths',
  secret:'independent unknown random 29x29 permutation tableau regenerated each trial',
  hiddenPrimeAdvance:'cipher collision produces extra consumed row with Bernoulli p=.81',
  trials:N,seed:'0x33017bad',
  totalSkippedPrimeRowsAcrossAllTrials:trueSkippedTotal,
  metrics:summary,
  fourEventJointAtOrAboveOriginal:simultaneousFits,
  jointAddOneUpperTail:(simultaneousFits+1)/(N+1),
  caution:'The source-selected 5/6-back echo statistics are retrospectively discovered and correlated; this is finite null model discrimination, not a general theorem about all English or all H2 variants.'
},null,2));
