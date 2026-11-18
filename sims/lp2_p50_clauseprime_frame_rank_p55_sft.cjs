'use strict';
/**
 * Source-selected 5x5 numerical-frame rank transposition on original LP2 p55.
 * Repro: node sims/lp2_p50_clauseprime_frame_rank_p55_sft.cjs
 *
 * The original 256-cell p50 numeral grid, when indexed by the p57 PARABLE
 * clause-prime hypothesis, selects rows 21..25 and columns 1..5.
 * The p55 suffix after its one incoming rune is exactly 3*25 runes.
 * The independently historical Cicada 2014 magic-square puzzle motivates
 * ranking 25 numeric cells and reading the three original 5x5 rune blocks
 * in that rank order. This is hypothetical; neither source authenticates
 * the particular p55 receiver.
 *
 * Node.js 22 CommonJS, Windows-compatible, no network/packages/writes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
function read(name) {
  return fs.readFileSync(path.join(ROOT, name), 'utf8');
}
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const encrypted = gp.pages.find(p => p.page === 55).indices;
assert.equal(encrypted.length, 76);
assert.equal(encrypted[0], 21);
const body = encrypted.slice(1);
assert.equal(body.length, 75);
const clear = gp.pages.find(p => p.page === 57).indices.slice(0, 75);
assert.equal(clear.length, 75);
const tokens = grid.pages.flatMap(p => p.tokens);
assert.equal(tokens.length, 256);
const addresses = Array.from({length:25}, (_, i) =>
  (21 + Math.floor(i / 5)) * 8 + 1 + i % 5);
/** @param {59|60} radix */
function values(radix) {
  const alphabet = radix === 59 ? grid.alphabet.replace('f', '') : grid.alphabet;
  assert.equal(alphabet.length, radix);
  return tokens.map(t => radix * alphabet.indexOf(t[0]) +
    alphabet.indexOf(t[1]));
}
/** @param {number[]} sourceBytes */
function ranked(sourceBytes) {
  const entries = addresses.map(i => sourceBytes[i]);
  assert.equal(new Set(entries).size, 25);
  return Array.from({length:25}, (_, i) => i)
    .sort((a, b) => entries[a] - entries[b] || a - b);
}
const source59 = values(59), source60 = values(60);
assert.deepEqual([169,173,201,205].map(i => source59[i]), [224,115,73,75]);
const ascending = ranked(source59);
assert.deepEqual(ranked(source60), ascending,
  'base59/base60 ambiguity does not change rank-based route');
/**
 * @param {number[]} input 75 GP rune indices
 * @param {number[]} route 25 original numeric-grid cell ranks
 * @param {boolean} inverse inverse route semantics
 * @returns {number[]}
 */
function apply(input, route, inverse) {
  assert.equal(input.length, 75);
  const out = [];
  for (let block = 0; block < 3; block++) {
    const src = input.slice(block*25, block*25+25), dst = new Array(25);
    for (let i = 0; i < 25; i++) {
      if (inverse) dst[route[i]] = src[i];
      else dst[i] = src[route[i]];
    }
    out.push(...dst);
  }
  return out;
}
const lookup = gp.translit.map((spelling, i) => ({spelling, i}))
  .sort((a, b) => b.spelling.length - a.spelling.length);
/** @param {string} source */
function nativeGP(source) {
  const out = [];
  for (let word of source.toUpperCase().match(/[A-Z]+/gu) || []) {
    word = word.replace(/QU/gu, 'CW').replace(/V/gu, 'U')
      .replace(/K/gu, 'C').replace(/Z/gu, 'S').replace(/IO/gu, 'IA');
    for (let i = 0; i < word.length;) {
      const token = lookup.find(t => word.startsWith(t.spelling, i));
      assert(token, 'cannot encode reference GP grapheme');
      out.push(token.i);
      i += token.spelling.length;
    }
  }
  return out;
}
const reference = nativeGP(read('resources/control/shakespeare_first300k.txt'));
assert(reference.length > 200000);
const pairs = new Uint32Array(29*29), triples = new Uint32Array(29*29*29);
for (let i = 2; i < reference.length; i++) {
  const k = reference[i-2] * 29 + reference[i-1];
  pairs[k]++; triples[k*29 + reference[i]]++;
}
/** @param {number[]} letters */
function trigrams(letters) {
  let sum = 0;
  for (let i = 2; i < letters.length; i++) {
    const k = letters[i-2] * 29 + letters[i-1];
    sum += Math.log((triples[k*29+letters[i]]+.1)/(pairs[k]+2.9));
  }
  return sum/(letters.length-2);
}
const output = [];
for (const direction of ['ascending', 'descending']) {
  const route = direction === 'ascending' ? ascending : ascending.slice().reverse();
  for (const inverse of [false,true]) {
    const plain = apply(body, route, inverse);
    assert.deepEqual(apply(plain,route,!inverse),body);
    const planted = apply(clear,route,!inverse);
    assert.deepEqual(apply(planted,route,inverse),clear);
    output.push({
      route:direction, inverse, trigrams:trigrams(plain),
      first40:plain.slice(0,40).map(i=>gp.translit[i]).join(''),
      recoveredSourceRunes:75, forwardReencryptedOriginal:75
    });
  }
}
assert.deepEqual(output.map(x=>x.trigrams).map(x=>+x.toFixed(10)),
  [-4.7209906996,-4.5808349619,-4.3524121621,-4.7574648970]);
const originalScore = trigrams(body);
const knownScore = trigrams(clear);
assert(Math.abs(originalScore - (-4.542704471048683)) < 1e-12);
assert(Math.abs(knownScore - (-2.540842377756682)) < 1e-12);
assert(output.every(o => o.trigrams < -4.3));
console.log(JSON.stringify({
  family:'first-party p50 numeric frame -> p55 3x25 GP rank transposition',
  radixInterpretations:['59','60'], identicalRankPermutation:true,
  rankPermutation:ascending, originalScore, clearSourceScore:knownScore, output,
  conclusion:'No coherent original p55 plaintext under any source-ranked transposition.'
}, null, 2));
