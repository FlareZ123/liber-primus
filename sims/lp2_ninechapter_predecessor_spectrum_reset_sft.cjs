'use strict';
/**
 * Exact key-independent 29-symbol histogram majorization for any nine
 * original-chapter predecessor-ciphertext indexed substitution cipher.
 * Exhaust every source-physical page-boundary placement of <=3 additional
 * independent secret rekeys and every original-length native-English window.
 * Node.js 22 CommonJS, read-only, deterministic.
 *
 * Original JPEG 43/44: p26 terminator followed by red-initial p27.
 * Original JPEG 49/50: p32 terminator followed by red-initial p33.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encodeWords} = require('./lp2_difference_allletter_capacity_sft.cjs');
const root = path.resolve(__dirname, '..');
/** @param {string} relative @returns {string} */
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const Q = 29, LENGTH = 12956;
const SOURCE_CHAPTERS = [[0,2],[3,7],[8,14],[15,22],[23,26],
  [27,32],[33,39],[40,53],[54,55]];
assert.equal(gp.pages.slice(0,56).reduce((n,p)=>n+p.indices.length,0),LENGTH);
assert.deepEqual(SOURCE_CHAPTERS.map(([a,b])=>gp.pages.slice(a,b+1)
  .reduce((n,p)=>n+p.indices.length,0)),
  [729,1145,1729,1903,1021,1433,1680,3008,308]);

/** @param {number[]} seq @returns {number[]} */
function rankedSpectrum(seq) {
  const freq = new Int32Array(Q);
  for (const c of seq) freq[c]++;
  return Array.from(freq).sort((a,b)=>b-a)
    .map((_,i,a)=>a.slice(0,i+1).reduce((s,v)=>s+v,0));
}
/**
 * A single predecessor-conditioned 29x29 permutation table: at each preceding
 * ciphertext row, each plaintext symbol can take no more than one next output.
 * The top k plaintext symbols occupy <= k largest successor counts per row.
 * All observed doublets and each segment's initial rune are FREE.
 * @param {number[]} seq
 * @returns {number[]}
 */
function segmentCapacity(seq) {
  const m = Array.from({length:Q},()=>new Int32Array(Q));
  let repeats = 0;
  for (let j=1;j<seq.length;j++) {
    const prior = seq[j-1],next = seq[j];
    if (prior===next) repeats++;
    else m[prior][next]++;
  }
  const cap = Array(Q).fill(1+repeats);
  for (const row of m) {
    const sorted = Array.from(row).sort((a,b)=>b-a);
    let cumulative = 0;
    for (let k=0;k<Q;k++) {
      cumulative += sorted[k];
      cap[k] += cumulative;
    }
  }
  return cap;
}
const cached = new Map();
/** @param {number} first @param {number} last @returns {number[]} */
function intervalCapacity(first,last) {
  const key=first+','+last;
  if(!cached.has(key)) cached.set(key,segmentCapacity(
    gp.pages.slice(first,last+1).flatMap(p=>p.indices)));
  return cached.get(key);
}
/**
 * @param {number[]} extraCuts Page indices after which a new independent
 * 29x29 row-permutation key is allowed, in addition to true chapter boundaries.
 * @returns {number[]}
 */
function capacity(extraCuts) {
  const cap = Array(Q).fill(0);
  for(const [start,end] of SOURCE_CHAPTERS) {
    let left = start;
    for(const cut of extraCuts) if(cut>=start && cut<end) {
      const v=intervalCapacity(left,cut);
      for(let k=0;k<Q;k++)cap[k]+=v[k];
      left=cut+1;
    }
    const v=intervalCapacity(left,end);
    for(let k=0;k<Q;k++)cap[k]+=v[k];
  }
  return cap;
}
/**
 * Minimum top-k plaintext occupancy over every contiguous original-length
 * window, not a sampled subset. The smallest minimum across independent
 * source corpora and predeclared spelling variants deliberately gives the
 * unknown secret architecture the most favorable reference for each k.
 * @param {number[]} seq
 * @returns {number[]}
 */
function minimumWindowSpectrum(seq) {
  assert.ok(seq.length>=LENGTH);
  const freq=new Int32Array(Q),low=Array(Q).fill(Infinity);
  for(let j=0;j<LENGTH;j++)freq[seq[j]]++;
  for(let start=0;start+LENGTH<=seq.length;start++) {
    const sorted=Array.from(freq).sort((a,b)=>b-a);
    let run=0;
    for(let k=0;k<Q;k++) {
      run+=sorted[k];
      if(run<low[k])low[k]=run;
    }
    if(start+LENGTH<seq.length) {
      freq[seq[start]]--;
      freq[seq[start+LENGTH]]++;
    }
  }
  return low;
}
/** @returns {number[][]} */
function referenceSpectra() {
  const refs=['resources/control/gibran_prophet_58585.txt',
    'resources/control/shakespeare_first300k.txt',
    'resources/control/emerson_essays_2944.txt'];
  const out=[];
  for(const ref of refs) {
    const original=read(ref),sourceNative=original.toUpperCase()
      .replace(/ING/g,'NG').replace(/IO/g,'IA');
    out.push(minimumWindowSpectrum(encodeWords(original).flat()));
    out.push(minimumWindowSpectrum(encodeWords(sourceNative).flat()));
  }
  return out;
}
/** @param {number[]} cap @param {number[]} floor @returns {number} */
function minimumMargin(cap,floor) {
  return Math.min(...cap.map((value,k)=>value-floor[k]));
}
/** @returns {number[]} */
function physicalExtraCuts() {
  return SOURCE_CHAPTERS.flatMap(([first,last])=>
    Array.from({length:last-first},(_,j)=>first+j));
}
/**
 * Search each set of exactly n additional page rekeys. If no set works, any
 * smaller set also fails because splitting a table permits every former key.
 * @param {number[]} cuts
 * @param {number} n
 * @param {number[]} floor
 * @returns {{tested:number,passing:number,best:number,witness:number[]|null}}
 */
function searchResets(cuts,n,floor) {
  let tested=0,passing=0,best=-Infinity,witness=null;
  /** @param {number[]} chosen @param {number} start */
  function visit(chosen,start) {
    if(chosen.length===n) {
      const margin=minimumMargin(capacity(chosen),floor);
      tested++;
      if(margin>best)best=margin;
      if(margin>=0) {
        passing++;
        if(witness===null)witness=chosen.slice();
      }
      return;
    }
    for(let i=start;i<=cuts.length-(n-chosen.length);i++) {
      chosen.push(cuts[i]);visit(chosen,i+1);chosen.pop();
    }
  }
  visit([],0);
  return {tested,passing,best,witness};
}
/**
 * Construct a source-length GP-native positive under entirely secret,
 * independent, arbitrary predecessor-indexed 29-symbol permutations.
 * Return exact full plaintext by inverse and reencrypt all symbols.
 * @param {number[]} plain
 */
function plantedPositive(plain) {
  assert.equal(plain.length,LENGTH);
  let seed=0x33012929;
  /** @returns {number} */
  function random(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;}
  const output=[],recovered=[];let offset=0;
  for(const [start,end] of SOURCE_CHAPTERS) {
    const n=gp.pages.slice(start,end+1).reduce((s,p)=>s+p.indices.length,0);
    const truth=plain.slice(offset,offset+n);offset+=n;
    const f=[],inverse=[];
    for(let row=0;row<Q;row++) {
      const permutation=Array.from({length:Q},(_,j)=>j);
      for(let j=Q-1;j>0;j--){
        const k=random()%(j+1);
        [permutation[j],permutation[k]]=[permutation[k],permutation[j]];
      }
      const inv=Array(Q);
      permutation.forEach((c,p)=>{inv[c]=p;});
      f.push(permutation);inverse.push(inv);
    }
    const crypt=[truth[0]],decoded=[truth[0]];
    for(let j=1;j<n;j++){
      crypt[j]=f[crypt[j-1]][truth[j]];
      decoded[j]=inverse[crypt[j-1]][crypt[j]];
    }
    assert.deepEqual(decoded,truth);
    for(let j=1;j<n;j++)
      assert.equal(crypt[j],f[crypt[j-1]][decoded[j]]);
    output.push(...crypt);recovered.push(...decoded);
  }
  assert.deepEqual(recovered,plain);
  const bound = segmentCapacity(output);
  const actual = rankedSpectrum(plain);
  // A book-global single fixed predecessor key is not the plant's model,
  // therefore verify the nine-section bound with its own segmentation.
  const plantedChapters = [];
  let pos=0;
  for(const [first,last] of SOURCE_CHAPTERS){
    const n=gp.pages.slice(first,last+1).reduce((s,p)=>s+p.indices.length,0);
    plantedChapters.push(output.slice(pos,pos+n));pos+=n;
  }
  const bound9=Array(Q).fill(0);
  for(const unit of plantedChapters){
    const v=segmentCapacity(unit);
    for(let k=0;k<Q;k++)bound9[k]+=v[k];
  }
  assert.ok(actual.every((v,k)=>v<=bound9[k]));
  return {recovered:recovered.length,runicTop5:actual[4],
    capacityTop5:bound9[4],cipherTop5:rankedSpectrum(output)[4]};
}
function main() {
  const floor=Array(Q).fill(Infinity);
  for(const counts of referenceSpectra())
    counts.forEach((v,k)=>{if(v<floor[k])floor[k]=v;});
  assert.deepEqual(floor.slice(0,9),
    [1397,2441,3376,4259,5131,5894,6598,7280,7942]);
  const base=capacity([]);
  assert.deepEqual(base.slice(0,9),
    [1353,2389,3304,4148,4918,5633,6307,6934,7516]);
  const boundaries=physicalExtraCuts();
  assert.equal(boundaries.length,47);
  const tests=[0,1,2,3,4].map(extra=>searchResets(boundaries,extra,floor));
  assert.deepEqual(tests.map(x=>x.tested),[1,47,1081,16215,178365]);
  assert.deepEqual(tests.slice(0,4).map(x=>x.passing),[0,0,0,0]);
  assert.equal(tests[3].best,-51);
  assert.equal(tests[4].passing,987);
  assert.deepEqual(tests[4].witness,[3,18,43,47]);
  const positive=plantedPositive(encodeWords(
    read('resources/control/gibran_prophet_58585.txt')).flat().slice(0,LENGTH));
  assert.equal(positive.recovered,LENGTH);
  console.log(JSON.stringify({
    status:'all-secret source-chapter predecessor S-box requires >=4 further page-boundary rekeys for any control-English spectral compatibility',
    originalRunes:LENGTH,originalChapters:SOURCE_CHAPTERS,
    originalTopKCapacity:base.slice(0,15),perKControlLowerBound:floor.slice(0,15),
    spectralDeficits:floor.slice(0,15).map((v,k)=>v-base[k]),
    extraResetSearch:tests,positive
  },null,2));
}
if(require.main===module)main();
module.exports={main,segmentCapacity,minimumWindowSpectrum,capacity,
  rankedSpectrum,searchResets,plantedPositive};
