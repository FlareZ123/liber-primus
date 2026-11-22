'use strict';

/**
 * Original 27x27 opening-chapter 180-degree rotation / p50 base60 2-cycle
 * source-gate, with all D4 controls and two finite-count conditional nulls.
 * Read-only Windows Node22/CommonJS single-file regression test.
 *
 * Source artifacts:
 * resources/liber-primus/{lp2-corpus.json,lp2-grid-256.json,
 * lp2-ink-annotations.json,lp2-transcription.txt}.
 *
 * This is an original-cipher navigation/residue observation, NOT LP2 plaintext.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {parseLP2Words} = require('./lp2_word_pages.cjs');
const {buildSourceNativeTrigramModel} = require('./lp1_source_native_trigram_model.cjs');

/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(
  __dirname, '..', 'resources', 'liber-primus', name), 'utf8');
/** @param {string} name @returns {any} */
const json = name => JSON.parse(read(name));
const corpus = json('lp2-corpus.json');
const grid = json('lp2-grid-256.json');
const ink = json('lp2-ink-annotations.json');
const words = parseLP2Words(read('lp2-transcription.txt'), 3).words;
const openingPages = corpus.pages.slice(0, 3);
const c = openingPages.flatMap(p => p.indices);
const t = grid.bytes;
const tokens = grid.pages.flatMap(p => p.tokens);
const N = 27;
const cycle2 = [249, 158];
const cycle11 = [0, 203, 68, 199, 47, 76, 114, 197, 115, 247, 192];

assert.deepEqual(openingPages.map(p => p.page), [0, 1, 2]);
assert.deepEqual(openingPages.map(p => p.indices.length), [262, 266, 201]);
assert.equal(c.length, N * N);
assert.equal(words.length, 158);
assert.equal(words.reduce((s, w) => s + w.length, 0), 729);
assert.equal(ink.pages[0].red_spans[0].length, 13);
assert.equal(openingPages[0].indices.length - ink.pages[0].red_spans[0].length, 249);
assert.equal(tokens[249], '2c');
assert.equal(tokens[158], '49');
assert.equal(t[249], 158);
assert.equal(t[158], 249);

const transforms = {
  identity: (r, q) => [r, q],
  rot90: (r, q) => [q, N - 1 - r],
  rot180: (r, q) => [N - 1 - r, N - 1 - q],
  rot270: (r, q) => [N - 1 - q, r],
  reflectHorizontal: (r, q) => [r, N - 1 - q],
  reflectVertical: (r, q) => [N - 1 - r, q],
  transpose: (r, q) => [q, r],
  reflectAntiDiagonal: (r, q) => [N - 1 - q, N - 1 - r]
};

/** @param {(r:number,c:number)=>number[]} transform
 * @param {number} i
 * @returns {number}
 */
function position(transform, i) {
  const [r, col] = transform(Math.floor(i/N), i % N);
  return r * N + col;
}

/** @param {number[]} source @param {(r:number,c:number)=>number[]} transform */
function match(source, transform) {
  const hits = [];
  for (let i = 0; i < 256; i++) {
    if (source[position(transform, i)] === t[i] % 29) hits.push(i);
  }
  return hits;
}

const d4 = Object.entries(transforms).map(([name, transform]) => {
  const hits = match(c, transform);
  return {name, matchesAll256: hits.length,
    twoCycleMatched: cycle2.filter(i => hits.includes(i)),
    elevenCycleMatched: cycle11.filter(i => hits.includes(i)),
    cycle2Positions: cycle2.map(i => position(transform, i))};
});
assert.deepEqual(d4.map(x => x.matchesAll256), [4,8,11,7,6,13,9,7]);
assert.deepEqual(d4.filter(x => x.twoCycleMatched.length === 2).map(x => x.name), ['rot180']);
assert.equal(d4.find(x => x.name === 'rot180').elevenCycleMatched.length, 0);

const rot = transforms.rot180;
assert.equal(position(rot, 158), 570);
assert.equal(position(rot, 249), 479);
assert.equal(c[570], 17);
assert.equal(c[479], 13);
assert.equal(t[158] % 29, 17);
assert.equal(t[249] % 29, 13);

const transformed = Array.from({length: 256}, (_, i) => c[position(rot, i)]);
const model = buildSourceNativeTrigramModel({
  corpus,
  referenceText: fs.readFileSync(path.join(
    __dirname,'..','resources','liber-primus','lp1-plaintext-reference.txt'),'utf8')
});

/** @param {number[]} a @returns {number} */
function ioc(a) {
  const count = Array(29).fill(0);
  for (const v of a) count[v]++;
  return count.reduce((s,n) => s+n*(n-1), 0) / (a.length*(a.length-1));
}
const outputs = [-1,1].map(sign => {
  const plain = transformed.map((v,i) => (v + sign*(t[i]%29) + 29)%29);
  const replay = plain.map((v,i) => (v - sign*(t[i]%29) +29)%29);
  assert.deepEqual(replay, transformed);
  return {sign, ioc:ioc(plain), meanTrigram:model.scoreStream(plain).mean,
    zeroCount:plain.filter(x=>x===0).length,
    twoCycleOutput:cycle2.map(i=>plain[i]),
    previewGP:model.spell(plain.slice(0,70))};
});
assert.deepEqual(outputs.map(x=>x.twoCycleOutput), [[0,0],[26,5]]);

// Under the authenticated solved-p56 cipher, plaintext F=0 must emit C=0.
// The two algebraic zero residues here have NONZERO original ciphertext,
// so they cannot be F-transparent plaintext skips under that proven cipher.
assert.deepEqual(cycle2.map(i=>transformed[i]), [13,17]);
assert.ok(cycle2.every(i => transformed[i] !== 0));

// An arbitrary, secret *single* GP29 mapping from table residues to
// original rotated rune values is still insufficient. Every one of the
// 29 table residues has several different outputs; even the optimal
// (postfitted) one-to-one-input lookup must mismatch 205 of 256 runes.
const lookupOutputHistograms = Array.from({length:29},()=>new Map());
for(let i=0;i<256;i++) {
  const input=t[i]%29;
  const output=transformed[i];
  const hist=lookupOutputHistograms[input];
  hist.set(output,(hist.get(output)||0)+1);
}
const lookupBestTotal=lookupOutputHistograms.reduce((sum,hist)=>
  sum+Math.max(...hist.values()),0);
const polyOutputs=lookupOutputHistograms.filter(hist=>hist.size>1).length;
assert.equal(polyOutputs,29);
assert.equal(lookupBestTotal,51);
assert.equal(256-lookupBestTotal,205);

let state = 0x33412317;
/** @param {number} limit @returns {number} */
function randomIndex(limit) {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return (state >>> 0) % limit;
}
/** @param {number[]} a @param {number} first @param {number} last */
function shuffleInterval(a,first,last) {
  for(let i=last-1;i>first;i--) {
    const j=first+randomIndex(i-first+1);
    const item=a[i];a[i]=a[j];a[j]=item;
  }
}

/**
 * Original-rune multiset null for all eight D4 transforms simultaneously,
 * preserving either full chapter or each of three original page histograms.
 * @param {boolean} withinPages
 * @param {number} attempts
 * @returns {{attempts:number, hits:number, addOneTail:number}}
 */
function permutationNull(withinPages, attempts) {
  const a=c.slice();
  const bounds=[0,262,528,729];
  let hits=0;
  const positions=Object.values(transforms).map(transform=>
    [position(transform,cycle2[0]),position(transform,cycle2[1])]);
  for(let n=0;n<attempts;n++) {
    if(withinPages) {
      for(let k=0;k<3;k++)shuffleInterval(a,bounds[k],bounds[k+1]);
    } else shuffleInterval(a,0,a.length);
    if(positions.some(([i,j])=> a[i]===t[cycle2[0]]%29 &&
      a[j]===t[cycle2[1]]%29))hits++;
  }
  return {attempts,hits,addOneTail:(hits+1)/(attempts+1)};
}

const allSourceNull=permutationNull(false,25000);
const pageCountPreservedNull=permutationNull(true,25000);

console.log(JSON.stringify({
  classification:'source-aligned 249/158 p50 two-cycle 180-degree exact residue match, no plaintext',
  sourceSha256:Object.fromEntries([
    'lp2-corpus.json','lp2-grid-256.json','lp2-ink-annotations.json','lp2-transcription.txt'
  ].map(name=>[name,crypto.createHash('sha256').update(read(name)).digest('hex')])),
  source:{
    openingPageLengths:openingPages.map(p=>p.indices.length),
    chapterWords:words.length,chapterRunes:c.length,square:[27,27],
    p0Red:13,p0Black:249
  },
  cycle:cycle2.map(i=>({
    cell:i,tableToken:tokens[i],tableByte:t[i],
    modulo29:t[i]%29,mirrorIndex:position(rot,i),
    originalRune:c[position(rot,i)], originalGP:corpus.translit[c[position(rot,i)]]
  })),
  d4,all256Rot180Hits:match(c,rot),directModulo29AdditiveConsumers:outputs,
  clearP57Trigram:model.p57Score,
  exactSingleLookupObstruction:{sourceInputResiduesWithConflictingRuneOutputs:polyOutputs,bestPossibleMatchesWithArbitrary29To29Lookup:lookupBestTotal,forcedMismatches:256-lookupBestTotal},
  authenticFTransparencyObstruction:'the two matched GP29 zeros have original rotated ciphertext P=13 and B=17 (both non-F), so cannot be plaintext F skips in the proven p56 mechanism',
  nullTests:{fullChapterShuffle:allSourceNull,eachPageShuffle:pageCountPreservedNull},
  limitations:'180-degree half-turn is visually motivated but typed count-to-cell/residue lookup was recognized after original ciphertext inspection; conditional shuffle rates are NOT discovery-adjusted and no plaintext/key/cipher is authenticated'
},null,2));
