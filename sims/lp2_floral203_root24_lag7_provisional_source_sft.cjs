'use strict';

/**
 * Research probe: p39 source-root24 double checksum readout, first 3N=203,
 * floral p40-p55 black 16x203. Source-chosen root order is exactly seven;
 * score its lag-seven coincidences and held-out controls.
 * Windows Node22, read only, no external packages.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const repo = path.resolve(__dirname, '..');
/** @param {string} p */
function read(p) { return JSON.parse(fs.readFileSync(path.join(repo,p), 'utf8')); }
const corpus = read('resources/liber-primus/lp2-corpus.json');
const pages = corpus.pages;
const ink = read('resources/liber-primus/lp2-ink-annotations.json').pages;
const grid = read('resources/liber-primus/lp2-grid-256.json');
const red = new Map(ink.map((p) => [p.page, p.red_spans || []]));
/** @param {number} n */
const mod = (n) => ((n % 29) + 29) % 29;
const black = [];
for (let p = 40; p <= 55; p++) {
  const runes = pages.find((q) => q.page === p).indices;
  for (let j = 0; j < runes.length; j++)
    if (!(red.get(p) || []).some((s) => j >= s.start && j < s.start + s.length))
      black.push(runes[j]);
}
assert.equal(black.length, 3248);
assert.equal(grid.pages.flatMap((p) => p.tokens)[0], '3N');
assert.equal(grid.pages.flatMap((p) => p.bytes)[0], 203);
assert.deepEqual(pages.find((p) => p.page === 39).indices.slice(119,122), [27,5,15]);
const rows = Array.from({length: 16}, (_, i) => new Uint8Array(black.slice(i*203, i*203+203)));
/** @param {Uint8Array[] | number[][]} data @param {number} root */
function readout(data, root) {
  const out = [];
  for (const row of data) {
    let p = 0, d = 0;
    for (const x of row) { d = (root * d + p) % 29; p = (root * p + x) % 29; }
    out.push(p,d);
  }
  return out;
}
/** @param {number[]} a @param {number} lag */
function coincidences(a,lag) {
  let count = 0, longest = 0, run = 0;
  const positions = [];
  for(let j=0;j+lag<a.length;j++){
    if(a[j]===a[j+lag]){positions.push(j);count++;run++;longest=Math.max(longest,run);}
    else run=0;
  }
  return {count,positions,longest};
}
const observed = readout(rows,24);
assert.deepEqual(observed, [15,22,25,13,9,20,16,15,22,25,13,1,8,8,9,22,9,7,18,7,1,25,24,9,26,16,15,9,27,17,21,12]);
const trace = coincidences(observed,7);
assert.deepEqual(trace, {count:6,positions:[0,1,2,3,8,16],longest:4});
assert.deepEqual(observed.slice(0,4),observed.slice(7,11));
assert.deepEqual(observed.slice(0,4).map((i) => corpus.translit[i]), ['S','OE','AE','P']);
// Canonical GP29 indices 15/22/25/13 spell S/OE/AE/P, not S/ING/A/P;
// the earlier SINGAP geographic-looking string was a chart-index error.

const roots7 = [];
for(let root=1;root<29;root++){
  let x=1;for(let j=0;j<7;j++)x=mod(x*root);
  if(x===1)roots7.push({root,...coincidences(readout(rows,root),7)});
}
assert.deepEqual(roots7.map((x)=>[x.root,x.count]), [[1,1],[7,0],[16,0],[20,0],[23,3],[24,6],[25,3]]);
const reversedCoefficient = coincidences(readout(rows.map((r)=>Array.from(r).reverse()),24),7);
assert.deepEqual(reversedCoefficient,{count:0,positions:[],longest:0});
const allRunes = pages.filter((p)=>p.page<=55).flatMap((p)=>p.indices);
const otherIntervals=[0,3248,6496,9708].map((start)=>{
  const a=allRunes.slice(start,start+3248);
  const r=Array.from({length:16},(_,j)=>a.slice(j*203,j*203+203));
  return {start,...coincidences(readout(r,24),7)};
});
assert.deepEqual(otherIntervals.map((x)=>x.count),[2,1,0,1]);

// Source-boundary control: shift the entire continuous 3248-rune tape
// cyclically by each of the 203 possible single-cell offsets and partition
// again into sixteen logical rows. Offset0 is the actual red-heading boundary.
const rotateCases = [];
for(let start=0;start<203;start++){
  const r = Array.from({length:16},(_,row) => Array.from({length:203},
    (_,j) => black[(start + row*203 + j)%3248]));
  const q = coincidences(readout(r,24),7);
  rotateCases.push({start,match:q.count,longest:q.longest});
}
assert.deepEqual(rotateCases[0],{start:0,match:6,longest:4});
assert.deepEqual(rotateCases.filter((x)=>x.match>=6).map((x)=>x.start),[0]);
assert.deepEqual(rotateCases.filter((x)=>x.longest>=4).map((x)=>x.start),[0]);

// Same input per-row histograms, but no inter-position order. A reproducible
// null for the strength of the observed lag-seven signal rather than proof.
let a=0x33012026,b=0x7f4a7c15,c=0xc1cad4d4,d=0x20142016;
function randomUint32() {
  const t=((a+b)|0)+d|0;
  d=(d+1)|0;
  a=b^(b>>>9);
  b=(c+(c<<3))|0;
  c=(c<<21|c>>>11);
  c=(c+t)|0;
  return t>>>0;
}
const N=100000;
let nAtLeastSix=0,nAtLeastFourRun=0;
const histogram=Array(26).fill(0);
for(let test=0;test<N;test++){
  for(const row of rows)for(let j=202;j>0;j--){
    const k=Math.floor(randomUint32()*(j+1)/4294967296);
    const z=row[j];row[j]=row[k];row[k]=z;
  }
  const out=readout(rows,24);
  const result=coincidences(out,7);
  histogram[result.count]++;
  if(result.count>=6)nAtLeastSix++;
  if(result.longest>=4)nAtLeastFourRun++;
}
assert.equal(nAtLeastSix,23);
assert.equal(nAtLeastFourRun,3);
console.log(JSON.stringify({
  status:'PASS',source:'original floral black 16x203 and source red p39 (x-24)^2',
  root24Observed:trace,sourceReadout32:observed,
  otherSeventhRoots:roots7.map((r)=>({root:r.root,lag7:r.count})),
  reverseCoefficientOrder: {lag7:reversedCoefficient.count,longest:reversedCoefficient.longest},
  nonfloralSourceIntervals:otherIntervals.map((r)=>({start:r.start,lag7:r.count,longest:r.longest})),
  sourceBoundaryCyclic203Offsets: {cases:203,onlySixOrMore:[0],onlyRunFour:[0],
    highestOtherOffset:Math.max(...rotateCases.slice(1).map((r)=>r.match))},
  originalRowHistogramPreservingShuffle:{
    samples:N,random:'sfc32 [0x33012026,0x7f4a7c15,0xc1cad4d4,0x20142016]',
    lag7AtLeastSix:nAtLeastSix,runAtLeastFour:nAtLeastFourRun,
    firstCounts:histogram.slice(0,9)
  },
  caveat:'Post-selected clue; no long GP plaintext or independent source authentication; do not interpret SINGAP as a destination'
},null,2));
