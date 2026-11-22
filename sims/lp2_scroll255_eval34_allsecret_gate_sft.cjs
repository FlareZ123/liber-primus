'use strict';
/**
 * Original p3-p8 word-to-rune nonlinear-hash source gate.
 * Windows 11 / Node.js 22 SFT:
 *   node sims/lp2_scroll255_eval34_allsecret_gate_sft.cjs
 *
 * Conditional hypothesis: p7 red products specify the GF(4) 255-state
 * correction, the original p49-p51 table is read by omitted-f base59,
 * and the adjacent p8 red products (4,3) select a commutative whole-word
 * hash H(G_word(3),G_word(4)) with an arbitrarily secret output codebook.
 * Exact equal-input/different-output contradictions need no known H.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.join(__dirname, '..', 'resources', 'liber-primus');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('lp2-corpus.json'));
const ink = JSON.parse(read('lp2-ink-annotations.json'));
const grid = JSON.parse(read('lp2-grid-256.json'));
const parts = read('lp2-transcription.txt').split('%');
const rune = new Map(corpus.runes.map((r, i) => [r, i]));
const red = new Map(ink.pages.map(p => [p.page, new Set(
  (p.red_spans || []).flatMap(span =>
    Array.from({ length: span.length }, (_, j) => span.start + j))
)]));
/** @typedef {{page:number,offset:number,value:number}} RuneCell */
/** @type {RuneCell[][]} */
const allWords = [];
/** @type {RuneCell[]} */
let word = [];
for (let page = 0; page <= 55; page++) {
  if (page === 50) continue;
  const part = parts[page > 50 ? page - 1 : page];
  assert.equal(typeof part, 'string');
  let offset = 0;
  for (const c of part) {
    if (rune.has(c)) {
      word.push({ page, offset, value: rune.get(c) });
      offset++;
    } else if ((c === '-' || c === '.') && word.length) {
      allWords.push(word);
      word = [];
    }
  }
  assert.equal(offset, corpus.pages[page].indices.length);
}
if (word.length) allWords.push(word);
assert.equal(allWords.length, 2896);
const scroll = allWords.filter(w =>
  w[0].page >= 3 && w[0].page <= 7);
const p8 = corpus.pages[8].indices;
assert.equal(scroll.length, 255);
assert.equal(p8.length, 255);
assert.equal(scroll.reduce((n, w) => n + w.length, 0), 1145);
const values = scroll.map(w => w.map(c => c.value));

/** @param {RuneCell[]} w @returns {boolean} */
const whollyRed = w => w.every(c =>
  c.page === w[0].page && red.get(c.page).has(c.offset));
/** @param {number} x @returns {number} */
const mod29 = x => ((x % 29) + 29) % 29;
/** @param {RuneCell[]} w @returns {number} */
const product = w => w.reduce((x, c) => mod29(x * c.value), 1);
const red7 = allWords.filter(w =>
  w[0].page === 7 && whollyRed(w)).map(product);
const red8 = allWords.filter(w =>
  w[0].page === 8 && whollyRed(w)).map(product);
assert.deepEqual(red7, [11, 26, 8, 15, 2]);
assert.deepEqual(red8, [4, 3]);

const canonical = crypto.createHash('sha256')
  .update(Buffer.from(grid.bytes)).digest('hex');
assert.equal(canonical,
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const radix = grid.alphabet.replace('f', '');
assert.equal(radix.length, 59);
const tokens = grid.pages.flatMap(p => p.tokens);
assert.equal(tokens.length, 256);
const table = tokens.map(t => {
  const high = radix.indexOf(t[0]);
  const low = radix.indexOf(t[1]);
  assert(high >= 0 && low >= 0);
  return 59 * high + low;
});
assert.equal(Math.max(...table), 251);

/** @param {number} a @param {number} b @returns {number} */
function gf4(a, b) {
  let result = 0;
  for (let i = 0; i < 2; i++) {
    if ((b >>> i) & 1) result ^= a;
    a <<= 1;
    if (a & 4) a ^= 7;
  }
  return result;
}
let state = [red7[4] % 4, 0, 0, 0];
const address = [];
for (let i = 0; i < 255; i++) {
  address.push(state.reduce((n, v) => 4 * n + v, 0));
  let feedback = 0;
  for (let j = 0; j < 4; j++)
    feedback ^= gf4(red7[j] % 4, state[j]);
  state = [state[1], state[2], state[3], feedback];
}
assert.equal(new Set(address).size, 255);
const corrected = p8.map((c, i) => mod29(c + table[address[i]]));
const originalPairs = [[47,240], [48,231], [235,236], [88,179]];
assert.deepEqual(originalPairs.map(([i, j]) =>
  mod29(p8[i] - p8[j])), [8, 18, 14, 25]);
assert(originalPairs.every(([i, j]) => corrected[i] === corrected[j]));

/**
 * A symmetric polynomial in the exact GP0 rune multiset.
 * @param {number[]} w
 * @param {number} at
 * @returns {number}
 */
function evalWord(w, at) {
  return w.reduce((a, v) => mod29(a * mod29(at + v)), 1);
}
/**
 * The first equal-feature value is fixed. Any divergent later output
 * falsifies every possible deterministic secret output lookup.
 * @param {number[][]} features
 * @param {number[]} output
 * @returns {{distinct:number,collisions:number,contradictions:number,
 *  conflictingGroups:number,firstWitness:number[]|null}}
 */
function stats(features, output) {
  const groups = new Map();
  for (let i = 0; i < features.length; i++) {
    const key = features[i].join(',');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(i);
  }
  let collisions = 0, contradictions = 0, conflictingGroups = 0;
  let firstWitness = null;
  for (const indices of groups.values()) {
    collisions += indices.length - 1;
    const first = indices[0];
    let divergent = false;
    for (const i of indices.slice(1)) {
      if (output[i] !== output[first]) {
        contradictions++;
        divergent = true;
        if (firstWitness === null) firstWitness = [first, i];
      }
    }
    if (divergent) conflictingGroups++;
  }
  return {
    distinct: groups.size, collisions, contradictions,
    conflictingGroups, firstWitness
  };
}
const features = {
  eval34: values.map(w => [evalWord(w, 3), evalWord(w, 4)]),
  eval034: values.map(w => [
    evalWord(w, 0), evalWord(w, 3), evalWord(w, 4)
  ]),
  eval3417: values.map(w => [
    evalWord(w, 3), evalWord(w, 4), evalWord(w, 17)
  ])
};
const pair = stats(features.eval34, corrected);
const triple = stats(features.eval034, corrected);
const otherTriple = stats(features.eval3417, corrected);
assert.deepEqual([pair.distinct, pair.collisions, pair.contradictions],
  [210, 45, 38]);
assert.deepEqual([triple.distinct, triple.collisions, triple.contradictions],
  [251, 4, 0]);
assert.deepEqual([otherTriple.distinct, otherTriple.collisions,
  otherTriple.contradictions], [248, 7, 3]);
// Original source-specific independent certificate, no statistical score.
assert.deepEqual(features.eval34[13], [0, 16]);
assert.deepEqual(features.eval34[17], [0, 16]);
assert.equal(corrected[13], 18);
assert.equal(corrected[17], 25);

// Plant a genuine unknown 29x29 nonlinear hash, synthesize original p8
// ciphertext with the same fixed table/state, and recover it exactly.
const planted = features.eval34.map(([a, b]) =>
  mod29(a * a + 3 * a * b + 7 * b + 5));
const syntheticCipher = planted.map((v, i) =>
  mod29(v - table[address[i]]));
assert.deepEqual(syntheticCipher.map((v, i) =>
  mod29(v + table[address[i]])), planted);
const control = stats(features.eval34, planted);
assert.equal(control.contradictions, 0);
assert.equal(control.collisions, 45);
console.log('LP2_SCROLL255_WORD_EVAL34_ORIGINAL_GATE ' + JSON.stringify({
  source: 'p3-p7 255 whole words -> p8 255 original runes',
  conditionalModel: 'p7 GF4 255-state plus p50 omitted-f radix59',
  red7Products: red7, red8Products: red8,
  sourceTableSha256: canonical,
  tableDistinct: new Set(table).size,
  exactAnagramPairs: originalPairs,
  pair, triple, otherTriple, control,
  witness: {
    word13: values[13], word17: values[17],
    sharedEvaluations34: features.eval34[13],
    corrected13: corrected[13], corrected17: corrected[17]
  },
  recoveredUnknownPlaintext: false
}));
