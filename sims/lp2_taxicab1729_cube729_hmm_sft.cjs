'use strict';

/**
 * Source-selected taxicab 729-rune common-pad key cancellation, allowing
 * all 29 unknown constant chapter IVs. The exact pair-language forward HMM
 * sums over all 29 possible first plaintext runes at every position.
 *
 * Run from a repository checkout: node sims/lp2_taxicab1729_cube729_hmm_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const db = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const first = db.pages.filter(p => p.page <= 2).flatMap(p => p.indices);
const tree = db.pages.filter(p => p.page >= 8 && p.page <= 14).flatMap(p => p.indices);
assert.equal(first.length, 729);
assert.equal(tree.length, 1729);
assert.equal(9 ** 3 + 10 ** 3, 1729);
const cuts = [tree.slice(0, 729), tree.slice(1000, 1729)];

const tokens = db.translit.map((t, i) => ({t, i}))
  .sort((a, b) => b.t.length - a.t.length);
/** @param {string} plaintext @returns {number[]} */
function encode(plaintext) {
  const out = [];
  for (const word of plaintext.match(/[A-Za-z]+/g) || []) {
    const s = word.toUpperCase().replace(/[KVZQ]/g,
      c => ({K: 'C', V: 'U', Z: 'S', Q: 'C'})[c]);
    for (let i = 0; i < s.length;) {
      const hit = tokens.find(x => s.startsWith(x.t, i));
      assert.ok(hit, 'Unmapped GP word ' + s);
      out.push(hit.i);
      i += hit.t.length;
    }
  }
  return out;
}

const texts = [
  read('resources/control/shakespeare_first300k.txt'),
  read('resources/control/gibran_prophet_58585.txt'),
  read('resources/control/emerson_essays_2944.txt')
].map(encode);
const names = ['Shakespeare', 'Gibran', 'Emerson'];
/** @param {number} n @returns {number} */
function mod(n) { return (n % 29 + 29) % 29; }
/** @param {number[]} a @param {number[]} b @returns {number[]} */
function difference(a, b) {
  assert.equal(a.length, b.length);
  return a.map((v, i) => mod(v - b[i]));
}
const originals = cuts.map(c => difference(first, c));

/**
 * @param {number[]} seq
 * @returns {{p:Float64Array,q:Float64Array[]}}
 */
function model(seq) {
  const p = new Float64Array(29).fill(1);
  const q = Array.from({length: 29}, () => new Float64Array(29).fill(0.5));
  for (let i = 0; i < seq.length; i++) {
    p[seq[i]]++;
    if (i) q[seq[i - 1]][seq[i]]++;
  }
  const total = p.reduce((a, b) => a + b, 0);
  for (let i = 0; i < 29; i++) p[i] /= total;
  for (let i = 0; i < 29; i++) {
    const rowTotal = q[i].reduce((a, b) => a + b, 0);
    for (let j = 0; j < 29; j++) q[i][j] /= rowTotal;
  }
  return {p, q};
}
const subtraction = Array.from({length: 29}, (_, delta) =>
  Array.from({length: 29}, (_, symbol) => mod(symbol - delta)));

/**
 * Exact pair-language forward marginal of P-Q=d-shift over 29 hidden
 * plaintext choices per position. All word boundaries are ignored.
 *
 * @param {number[]} d
 * @param {{p:Float64Array,q:Float64Array[]}} m
 * @param {number} shift
 * @returns {number}
 */
function forward(d, m, shift) {
  let previousDelta = mod(d[0] - shift);
  let previous = Float64Array.from({length: 29}, (_, i) =>
    m.p[i] * m.p[subtraction[previousDelta][i]]);
  let next = new Float64Array(29);
  let total = previous.reduce((a, b) => a + b, 0);
  let ll = Math.log(total);
  for (let i = 0; i < 29; i++) previous[i] /= total;
  for (let k = 1; k < d.length; k++) {
    next.fill(0);
    const delta = mod(d[k] - shift);
    const earlier = subtraction[previousDelta];
    const current = subtraction[delta];
    for (let i = 0; i < 29; i++) {
      const weight = previous[i];
      const left = m.q[i];
      const right = m.q[earlier[i]];
      for (let j = 0; j < 29; j++) {
        next[j] += weight * left[j] * right[current[j]];
      }
    }
    total = next.reduce((a, b) => a + b, 0);
    ll += Math.log(total);
    for (let i = 0; i < 29; i++) next[i] /= total;
    [previous, next] = [next, previous];
    previousDelta = delta;
  }
  return ll / d.length;
}

/**
 * @param {number[]} d
 * @param {{p:Float64Array,q:Float64Array[]}} m
 * @returns {{shift:number,score:number}}
 */
function bestOffset(d, m) {
  let winner = {shift: 0, score: -Infinity};
  for (let shift = 0; shift < 29; shift++) {
    const score = forward(d, m, shift);
    if (score > winner.score) winner = {shift, score};
  }
  return winner;
}
let rng = 0x1729deed;
/** @returns {number} */
function random() {
  rng ^= rng << 13;
  rng ^= rng >>> 17;
  rng ^= rng << 5;
  return rng >>> 0;
}

// Source-native full-length plant with a genuinely unknown 729-symbol pad and
// an independent 17-symbol chapter offset. The key-cancellation relation
// survives, and a known-key inverse recovers every original native symbol.
const plainA = texts[1].slice(17, 746);
const plainB = texts[2].slice(97, 826);
const key = Array.from({length: 729}, () => random() % 29);
const codedA = plainA.map((x, i) => mod(x + key[i] + 17));
const codedB = plainB.map((x, i) => mod(x + key[i]));
assert.deepEqual(codedA.map((v, i) => mod(v - key[i] - 17)), plainA);
assert.deepEqual(codedB.map((v, i) => mod(v - key[i])), plainB);
assert.deepEqual(difference(codedA, codedB).map(v => mod(v - 17)),
  difference(plainA, plainB));

const rows = [];
for (let training = 0; training < 3; training++) {
  const heldout = [0, 1, 2].filter(x => x !== training);
  const m = model(texts[training]);
  const original = originals.map(d => bestOffset(d, m));
  const truePlantScore = forward(difference(codedA, codedB), m, 17);
  const uncodedPlantScore = forward(difference(plainA, plainB), m, 0);
  assert(Math.abs(truePlantScore - uncodedPlantScore) < 1e-12);
  const n = 250;
  let nativeMean = 0;
  let nativeMinimum = Infinity;
  const nativeAtMostOriginal = [0, 0];
  let uniformMean = 0;
  for (let trial = 0; trial < n; trial++) {
    const a = texts[heldout[0]];
    const b = texts[heldout[1]];
    const startA = random() % (a.length - 729);
    const startB = random() % (b.length - 729);
    const sample = Array.from({length: 729}, (_, i) =>
      mod(a[startA + i] - b[startB + i]));
    // A native pair is scored at its known true zero offset. The original
    // receives the strictly stronger all-29-offset optimization.
    const score = forward(sample, m, 0);
    nativeMean += score;
    nativeMinimum = Math.min(nativeMinimum, score);
    for (let i = 0; i < 2; i++) {
      if (score <= original[i].score) nativeAtMostOriginal[i]++;
    }
    const unrelated = Array.from({length: 729}, () => random() % 29);
    uniformMean += forward(unrelated, m, 0);
  }
  rows.push({
    training: names[training],
    heldout: heldout.map(i => names[i]),
    original,
    truePlantScore,
    nativeTrials: n,
    nativeMean: nativeMean / n,
    nativeMinimum,
    nativeAtMostOriginal,
    independentPadMean: uniformMean / n
  });
}
assert(Math.abs(rows[0].original[0].score - (-3.3715388761818756)) < 1e-9);
assert(Math.abs(rows[0].original[1].score - (-3.3756562763452864)) < 1e-9);
assert.deepEqual(rows[0].original.map(x => x.shift), [22, 20]);
assert(rows.every(r => r.nativeAtMostOriginal.every(k => k <= 5)));
console.log(JSON.stringify({
  contract: 'Original pp0-2 versus pp8-14 [0,729) or [1000,1729), arbitrary common 729-key and unknown static chapter IV',
  sourceGPCounts: texts.map(t => t.length),
  plant: {length: 729, keySymbols: 729, relativeIV: 17, completeRecovered: true},
  model: 'Full 29-state exact forward GP29 pair bigram HMM, three independent training corpora',
  seed: '0x1729deed',
  rows,
  status: 'No authentic plaintext, key, or authorial cube-reuse instruction. Native-English shared-pad model is disfavoured.'
}, null, 2));
