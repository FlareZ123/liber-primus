'use strict';

/**
 * Key-free binary-mask exclusion for an unknown zero-residue symbol of a
 * multiplicative differential field-unit cipher.
 *
 * D[i] = (C[i]-C[i-1]) mod 29 = (P[i]-a)*K[i] mod 29
 * with unknown fixed a and arbitrary nonzero K[i].
 * This forces D[i]===0 iff P[i]===a, regardless of the key schedule.
 *
 * The earlier field-unit differential study fixed a=28 (EA). Here all 29
 * possible a are tested, conditioned on the exact 2896 word lengths
 * of LP2 and on occurrence-weighted real GP-English control words.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encodeWords} = require('./field_unit_differential.cjs');
const {parseUnsolved,random32} = require('./lag6_conditioned_echo.cjs');
const ROOT = path.resolve(__dirname,'..');
const SOURCES = [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt'
];
const A=29;
const MOD=x=>(x%29+29)%29;

/** @param {number[][]} words */
function ciphertextMask(words) {
  let previous=-1,total=0,first=0;
  const masks=[];
  for (const word of words) {
    const mask=[];
    for(let i=0;i<word.length;i++){
      const hit=Number(previous===word[i]);
      total+=hit;
      if(i===0)first+=hit;
      previous=word[i];
      mask.push(hit);
    }
    masks.push(mask);
  }
  return {total,first,masks};
}

/**
 * @param {number[][]} reference All original occurrence-weighted GP words.
 * @returns {Map<number,number[][]>}
 */
function lengthBuckets(reference) {
  const map=new Map();
  for(const word of reference){
    const a=map.get(word.length)||[];
    a.push(word);
    map.set(word.length,a);
  }
  return map;
}

/**
 * Exact moments for independent occurrence-weighted English words selected
 * by LP2's fixed word-length sequence. Remove the globally first rune from
 * zero-difference eligibility, as it has no preceding published rune.
 * @param {number[]} lengths Original LP2 complete-word lengths.
 * @param {Map<number,number[][]>} bins English words grouped by length.
 */
function moments(lengths,bins) {
  const distribution=new Map();
  for(const [len,words] of bins){
    const mean=Array(A).fill(0),meanSq=Array(A).fill(0),
      probFirst=Array(A).fill(0),cross=Array(A).fill(0);
    for(const word of words){
      const counts=new Uint16Array(A);
      for(const rune of word)counts[rune]++;
      for(let rune=0;rune<A;rune++){
        mean[rune]+=counts[rune];
        meanSq[rune]+=counts[rune]*counts[rune];
        const f=Number(word[0]===rune);
        probFirst[rune]+=f;
        cross[rune]+=counts[rune]*f;
      }
    }
    const n=words.length;
    distribution.set(len,{mean:mean.map(x=>x/n),
      meanSq:meanSq.map(x=>x/n),
      first:probFirst.map(x=>x/n),
      cross:cross.map(x=>x/n),sampleWords:n});
  }
  const stats=Array.from({length:A},()=>({meanTotal:0,meanFirst:0,
    varTotal:0,varFirst:0,cov:0}));
  for(let wordIndex=0;wordIndex<lengths.length;wordIndex++){
    const len=lengths[wordIndex],d=distribution.get(len);
    assert.ok(d,'Reference lacks target word length '+len);
    for(let rune=0;rune<A;rune++){
      const x=d.mean[rune],f=d.first[rune],
        vx=d.meanSq[rune]-x*x,
        vf=f-f*f,
        cov=d.cross[rune]-x*f;
      const stat=stats[rune];
      if(wordIndex===0){
        // X-Y is the number of occurrences after the global first rune.
        stat.meanTotal+=x-f;
        stat.varTotal+=vx+vf-2*cov;
      } else {
        stat.meanTotal+=x;
        stat.meanFirst+=f;
        stat.varTotal+=vx;
        stat.varFirst+=vf;
        stat.cov+=cov;
      }
    }
  }
  return stats;
}

/** @param {{meanTotal:number,meanFirst:number,varTotal:number,varFirst:number,cov:number}} s
 * @param {number} total @param {number} first
 */
function squaredDistance(s,total,first) {
  const dx=total-s.meanTotal,dy=first-s.meanFirst;
  // Fixed 0.25 variance ridge only guards genuinely absent/rare symbols
  // whose empirical word-start variance can be zero in a small source.
  // Null simulations use the exact SAME regularized distance statistic.
  const varTotal=s.varTotal+0.25,varFirst=s.varFirst+0.25;
  const determinant=varTotal*varFirst-s.cov*s.cov;
  assert.ok(determinant>0);
  return (varFirst*dx*dx-2*s.cov*dx*dy+varTotal*dy*dy)/determinant;
}

/**
 * @param {number[]} lengths Fixed target exact GP word lengths.
 * @param {Map<number,number[][]>} bins English occurrence-weighted words.
 * @param {() => number} random Uint32 generator.
 */
function sampledMaskCounts(lengths,bins,random) {
  const total=new Int32Array(A),first=new Int32Array(A);
  for(let i=0;i<lengths.length;i++){
    const a=bins.get(lengths[i]);
    const word=a[random()%a.length];
    for(let j=i===0?1:0;j<word.length;j++)total[word[j]]++;
    if(i>0)first[word[0]]++;
  }
  return {total,first};
}

/**
 * Exact forward and keyless inverse positive control. A random nonzero key
 * at every position enforces zero difference iff plaintext equals marker.
 * @param {number[][]} plain Synthetic known plaintext word sequence.
 * @param {number} marker GP symbol whose zero residue is encoded.
 * @param {() => number} random Uint32 generator.
 */
function positiveControl(plain,marker,random) {
  let preceding=0;
  const encoded=plain.map((word,wordIndex)=>word.map((p,i)=>{
    if(wordIndex===0&&i===0){
      preceding=random()%A;
    }else{
      const k=1+random()%28;
      preceding=MOD(preceding+(p-marker)*k);
    }
    return preceding;
  }));
  const got=ciphertextMask(encoded);
  // Ciphertext equality mask must equal fixed plaintext marker mask.
  for(let i=0;i<plain.length;i++)for(let j=0;j<plain[i].length;j++){
    assert.equal(got.masks[i][j],
      Number(!(i===0&&j===0)&&plain[i][j]===marker));
  }
  return {marker,runes:plain.reduce((n,w)=>n+w.length,0),
    reproducedMarkerHits:got.total,reproducedWordStarts:got.first};
}

/**
 * @param {number} [repetitions=5000]
 * @param {number} [seed=0x17ef3301]
 */
function run(repetitions=5000,seed=0x17ef3301) {
  assert.ok(Number.isInteger(repetitions)&&repetitions>=100);
  const raw=fs.readFileSync(path.join(ROOT,'resources/lp2-transcription.txt'),'utf8');
  const original=parseUnsolved(raw);
  const actual=ciphertextMask(original);
  assert.equal(original.length,2896);
  assert.equal(original.flat().length,12956);
  assert.deepEqual([actual.total,actual.first],[86,23]);
  const lengths=original.map(word=>word.length);
  const generated=[];
  const seedGenerator=random32(seed);
  for(const sourceFile of SOURCES) {
    const source=fs.readFileSync(path.join(ROOT,sourceFile),'utf8');
    const allReference=encodeWords(source).filter(word=>word.length);
    const bins=lengthBuckets(allReference);
    const parameters=moments(lengths,bins);
    // Positive test: every plaintext marker becomes precisely one difference
    // zero, with fully randomized nonzero unit keys. The first rune is seed.
    const plain=lengths.map(len=>{
      const a=bins.get(len);
      return a[seedGenerator()%a.length];
    });
    const control=positiveControl(plain,28,seedGenerator);
    const observed=parameters.map((m,a)=>({
      marker:a,originalTotal:actual.total,originalFirst:actual.first,
      expectedTotal:m.meanTotal,expectedFirst:m.meanFirst,
      sdTotal:Math.sqrt(m.varTotal),sdFirst:Math.sqrt(m.varFirst),
      squaredMahalanobis:squaredDistance(m,actual.total,actual.first),
      exceeded:0
    }));
    const random=random32((seed ^ ((generated.length+1)*0x9e3779b9))>>>0);
    for(let i=0;i<repetitions;i++){
      const sample=sampledMaskCounts(lengths,bins,random);
      for(let a=0;a<A;a++)if(
        squaredDistance(parameters[a],sample.total[a],sample.first[a])
        >=observed[a].squaredMahalanobis)observed[a].exceeded++;
    }
    for(const o of observed)o.empiricalUpperP=(o.exceeded+1)/(repetitions+1);
    observed.sort((a,b)=>a.squaredMahalanobis-b.squaredMahalanobis);
    generated.push({sourceFile,sourceWords:allReference.length,
      referenceGP:allReference.reduce((n,w)=>n+w.length,0),
      replicateBooks:repetitions,positiveControl:control,
      closestMarkers:observed.slice(0,8),
      largestEmpiricalCompatibility:Math.max(...observed.map(s=>s.empiricalUpperP)),
      markerWithLargestEmpiricalCompatibility:observed.reduce((a,b)=>
        a.empiricalUpperP>=b.empiricalUpperP?a:b).marker,
      allMarkersOutOfBand:observed.every(x=>x.empiricalUpperP<.01)});
  }
  return {cipherContract:'D[i]=(P[i]-a)*K[i] modulo29, a fixed unknown GP marker, K[i] any nonzero unit',actual:{doublets:actual.total,wordInitialDoublets:actual.first,words:original.length,runes:12956},repetitions,seed:'0x'+(seed>>>0).toString(16),results:generated,
    caveat:'Exact-length independently sampled English-word reference models; squared distance uses fixed 0.25 variance ridge for rare-marker singularity. This does not exclude plaintext transposition, word-boundary changes, non-English codes, mixed zero symbols, or a keyed zero/nonzero remapping.'};
}
if(require.main===module){
  const n=Number(process.argv[2]||'5000');
  console.log(JSON.stringify(run(n),null,2));
}
module.exports={ciphertextMask,lengthBuckets,moments,
  squaredDistance,sampledMaskCounts,positiveControl,run};
