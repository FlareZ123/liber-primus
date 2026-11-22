#!/usr/bin/env node
'use strict';

/**
 * Original-source SFT: familywide key-independent gate for stationary
 * 3-rune GP29 block bijections on the nine physical LP2 chapters.
 * Any arbitrary injective 29^3-symbol codebook preserves the frequency
 * histogram of disjoint triples, regardless of its secret entries.
 *
 * Tests all three phases for book-global and chapter-reset clocks and
 * source-length-matched Shakespeare, Gibran, Emerson native-GP controls.
 * Run: node sims/lp2_chapter_triple_bijection_gate_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));

const chapterRanges = [[0,2],[3,7],[8,14],[15,22],[23,26],
  [27,32],[33,39],[40,53],[54,55]];
const chapters = chapterRanges.map(([first,last]) =>
  gp.pages.filter((p) => p.page >= first && p.page <= last)
    .flatMap((p) => p.indices));
const book = chapters.flat();
assert.deepEqual(chapters.map((a) => a.length),
  [729,1145,1729,1903,1021,1433,1680,3008,308]);
assert.equal(book.length, 12956);

/**
 * Fixed-size block multiplicity is invariant under every secret permutation
 * of 29^3 triple values.
 * @param {number[]} runes
 * @param {number} phase
 * @returns {{blocks:number,distinct:number,max:number,collisions:number}}
 */
function profile(runes, phase) {
  const counts = new Uint16Array(29 ** 3);
  let blocks = 0, distinct = 0, max = 0;
  for (let i = phase; i + 2 < runes.length; i += 3) {
    const key = (runes[i] * 29 + runes[i+1]) * 29 + runes[i+2];
    const count = ++counts[key];
    blocks++;
    if (count === 1) distinct++;
    if (count > max) max = count;
  }
  return {blocks,distinct,max,collisions:blocks-distinct};
}

const tokens = gp.translit.map((s,i) => ({s,i}))
  .sort((a,b) => b.s.length - a.s.length);

/** @param {string} text @returns {number[]} */
function nativeRunes(text) {
  const out = [];
  for (const original of text.toUpperCase().match(/[A-Z]+/g) || []) {
    const word = original.replace(/QU/g,'CW').replace(/V/g,'U')
      .replace(/[KQ]/g,'C').replace(/Z/g,'S');
    for (let i = 0; i < word.length;) {
      const t = tokens.find((candidate) => word.startsWith(candidate.s,i));
      assert(t, 'unmapped control reference');
      out.push(t.i);
      i += t.s.length;
    }
  }
  return out;
}
const controls = [
  ['Shakespeare','resources/control/shakespeare_first300k.txt'],
  ['Gibran','resources/control/gibran_prophet_58585.txt'],
  ['Emerson','resources/control/emerson_essays_2944.txt']
].map(([name,file]) => ({name,runes:nativeRunes(read(file))}));

/**
 * Test finite windows of exactly the original rune count with no optimized
 * alignment or source-dependent selection.
 * @param {number[]} a
 * @param {number} size
 * @param {number} phase
 * @param {number} stride
 */
function referenceRange(a,size,phase,stride) {
  const observations = [];
  for (let start=0;start+size<=a.length;start+=stride)
    observations.push(profile(a.slice(start,start+size),phase));
  assert(observations.length > 0);
  return {
    windows: observations.length,
    distinctMin: Math.min(...observations.map((x) => x.distinct)),
    distinctMax: Math.max(...observations.map((x) => x.distinct)),
    maxCountMin: Math.min(...observations.map((x) => x.max)),
    maxCountMax: Math.max(...observations.map((x) => x.max))
  };
}
/** @param {number[]} runes @param {number} phase @param {number} stride */
function test(runes,phase,stride) {
  const original = profile(runes,phase);
  const references = Object.fromEntries(controls.map((c) =>
    [c.name,referenceRange(c.runes,runes.length,phase,stride)]));
  return {original,references,separated:Object.values(references)
    .every((v) => original.distinct > v.distinctMax)};
}
const global = Array.from({length:3},(_,phase) => test(book,phase,3959));
assert(global.every((x) => x.separated));
const perChapter = chapters.map((runes,i) => ({
  pages: chapterRanges[i],
  runes: runes.length,
  phases: Array.from({length:3},(_,phase) => test(runes,phase,1231))
}));
assert(perChapter.slice(0,8).every((c) =>
  c.phases.every((x) => x.separated)));
assert.equal(perChapter[8].phases[0].separated,false);

// Nontrivial fixed 29^3-codeword bijection positive plant. Every possible
// input triple is permuted exactly once, not just independent rune rotations.
const N = 29 ** 3, scale=104729, bias=3571;
const seen = new Set();
for (let x=0;x<N;x++) seen.add((x*scale+bias)%N);
assert.equal(seen.size,N);
let scaleInverse=0;
for (let x=1;x<N;x++) if ((x*scale)%N===1) {scaleInverse=x;break;}
assert(scaleInverse > 0);

/** @param {number[]} a @param {boolean} reverse @returns {number[]} */
function permute(a,reverse) {
  const output=a.slice();
  for(let i=0;i+2<a.length;i+=3) {
    const x=(a[i]*29+a[i+1])*29+a[i+2];
    const y=reverse ? (((x-bias+N)*scaleInverse)%N)
      : (((x*scale)+bias)%N);
    output[i]=Math.floor(y/841);
    output[i+1]=Math.floor(y/29)%29;
    output[i+2]=y%29;
  }
  return output;
}
const plant=controls[0].runes.slice(0,book.length);
const encrypted=permute(plant,false);
assert.deepEqual(permute(encrypted,true),plant);
assert.deepEqual(profile(encrypted,0),profile(plant,0));

console.log(JSON.stringify({
  source: {runes:book.length, chapterRuneCounts:chapters.map((a)=>a.length),
    tripleVocabulary:N, controlRunes:controls.map((c)=>[c.name,c.runes.length])},
  bookGlobal:global, chapters:perChapter,
  positiveControl:{recovered:plant.length,invariancePreserved:true},
  conclusion:'All 8 longer source chapters separate from English GP controls under every block phase; 308-rune terminal chapter does not. Any one stationary secret block table per chapter preserves the diagnostic histogram.'
},null,2));
