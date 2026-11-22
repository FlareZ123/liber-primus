#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/base60-grid.json'));
const shakespeare = read('resources/control/shakespeare_first300k.txt');
const alpha = corpus.translit;
const chapter = corpus.pages.filter(p => p.page >= 33 && p.page <= 39)
  .flatMap(p => p.indices);
assert.equal(chapter.length, 1680);

const b60 = grid.alphabet;
const value60 = (s) => [...s].reduce((v, ch) => {
  const d = b60.indexOf(ch);
  assert.ok(d >= 0);
  return v * 60 + d;
}, 0);
const cell7G = grid.rows[6][6];       // hypothesis: global row 7, column G
const cell119 = grid.rows[14][6];     // one-based cell 119, global row 15, col 7
assert.equal(cell7G, '2a');
assert.equal(cell119, '0Z');
const v7G = value60(cell7G);
const v119 = value60(cell119);
function totient(n) {
  let x = n, result = n;
  for (let p = 2; p * p <= x; p++) {
    if (x % p === 0) {
      while (x % p === 0) x /= p;
      result -= result / p;
    }
  }
  if (x > 1) result -= result / x;
  return result;
}
assert.equal(v7G, 156);
assert.equal(totient(v7G), 48);
assert.equal(v119, 35);
assert.equal(48 * 35, chapter.length);

const tokens = alpha.map((token, index) => ({token, index}))
  .sort((a, b) => b.token.length - a.token.length);
function gpEncode(text) {
  const clean = text.toUpperCase().replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Q/g, 'CW').replace(/Z/g, 'S');
  const out = [];
  for (const word of clean.match(/[A-Z]+/g) || []) {
    for (let at = 0; at < word.length;) {
      const t = tokens.find(x => word.startsWith(x.token, at));
      assert.ok(t, 'complete GP transliteration');
      out.push(t.index);
      at += t.token.length;
    }
  }
  return out;
}
const native = gpEncode(shakespeare);
const split = Math.floor(native.length * 0.7);
const train = native.slice(0, split);
const held = native.slice(split);
const counts = Array.from({length: 29}, () => new Float64Array(29).fill(1));
const rowTotals = new Float64Array(29);
for (let i = 1; i < train.length; i++) {
  counts[train[i - 1]][train[i]] += 1;
  rowTotals[train[i - 1]] += 1;
}
const logP = new Float64Array(29 * 29);
for (let a = 0; a < 29; a++) {
  for (let b = 0; b < 29; b++) {
    logP[a * 29 + b] = Math.log(counts[a][b] / (rowTotals[a] + 29));
  }
}
function measure(seq) {
  let ll = 0;
  const hist = new Uint32Array(29);
  for (let i = 0; i < seq.length; i++) {
    hist[seq[i]]++;
    if (i) ll += logP[seq[i - 1] * 29 + seq[i]];
  }
  let numerator = 0;
  for (const n of hist) numerator += n * (n - 1);
  return {
    bigramLL: ll / Math.max(1, seq.length - 1),
    ioc: numerator / (seq.length * (seq.length - 1))
  };
}
function primeList(n) {
  const out = [];
  for (let x = 2; out.length < n; x++) {
    let prime = true;
    for (let d = 2; d * d <= x; d++) {
      if (x % d === 0) { prime = false; break; }
    }
    if (prime) out.push(x);
  }
  return out;
}
const primeKey = primeList(chapter.length).map(p => (p - 1) % 29);
const mod29 = (x) => ((x % 29) + 29) % 29;
function phiShift(seq, sign, skipF) {
  let k = 0;
  return seq.map(v => {
    if (skipF && v === 0) return 0;
    return mod29(v + sign * primeKey[k++]);
  });
}

// One 48x35 row-major rectangle, read/de-read by columns.
function rectInverse(seq) {
  const out = new Array(seq.length);
  for (let r = 0; r < 48; r++) {
    for (let c = 0; c < 35; c++) out[r * 35 + c] = seq[c * 48 + r];
  }
  return out;
}
function rectForward(seq) {
  const out = [];
  for (let c = 0; c < 35; c++) {
    for (let r = 0; r < 48; r++) out.push(seq[r * 35 + c]);
  }
  return out;
}

// Historical LP1 7-column read order 1736254, in zero-based column indices.
const historical = [0, 6, 2, 5, 1, 4, 3];
const inverseHistorical = historical.map((_, i) => historical.indexOf(i));
function blockInverse(seq, order) {
  const out = new Array(seq.length);
  for (let base = 0; base < seq.length; base += 35) {
    const cols = new Array(7);
    let ptr = 0;
    for (const c of order) {
      cols[c] = seq.slice(base + ptr, base + ptr + 5);
      ptr += 5;
    }
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 7; c++) out[base + r * 7 + c] = cols[c][r];
    }
  }
  return out;
}
function blockForward(seq, order) {
  const out = [];
  for (let base = 0; base < seq.length; base += 35) {
    const cols = Array.from({length: 7}, (_, c) =>
      Array.from({length: 5}, (_, r) => seq[base + r * 7 + c]));
    for (const c of order) out.push(...cols[c]);
  }
  return out;
}

const raw = measure(chapter);
const nativeHeldout = measure(held);
const globalCases = [];
for (const placement of ['trans_then_phi', 'phi_then_trans']) {
  for (const sign of [-1, 1]) {
    for (const skipF of [false, true]) {
      const out = placement === 'trans_then_phi'
        ? phiShift(rectInverse(chapter), sign, skipF)
        : rectInverse(phiShift(chapter, sign, skipF));
      globalCases.push({placement, sign, skipF, ...measure(out),
        first70: out.slice(0, 70).map(i => alpha[i]).join(' ')});
    }
  }
}
const globalBest = [...globalCases].sort((a, b) => b.bigramLL - a.bigramLL)[0];

const blockCases = [];
for (const [orderName, order] of [
  ['historical-1736254', historical],
  ['inverse-1736254', inverseHistorical]
]) {
  for (const placement of ['trans_then_phi', 'phi_then_trans']) {
    for (const sign of [-1, 1]) {
      for (const skipF of [false, true]) {
        const out = placement === 'trans_then_phi'
          ? phiShift(blockInverse(chapter, order), sign, skipF)
          : blockInverse(phiShift(chapter, sign, skipF), order);
        blockCases.push({orderName, placement, sign, skipF, ...measure(out),
          first70: out.slice(0, 70).map(i => alpha[i]).join(' ')});
      }
    }
  }
}
const blockBest = [...blockCases].sort((a, b) => b.bigramLL - a.bigramLL)[0];

// Exact familywise null: all 7! column orders, maximum over the 8
// non-key choices (layer order, sign, literal-F handling).
const phiArrays = {};
for (const sign of [-1, 1]) {
  for (const skipF of [false, true]) {
    phiArrays[sign + '/' + skipF] = phiShift(chapter, sign, skipF);
  }
}
const observedBest = blockBest.bigramLL;
let permutations = 0;
let exceed = 0;
const nullMaxima = [];
function visitPermutations(a, at, callback) {
  if (at === a.length) { callback(a.slice()); return; }
  for (let i = at; i < a.length; i++) {
    [a[at], a[i]] = [a[i], a[at]];
    visitPermutations(a, at + 1, callback);
    [a[at], a[i]] = [a[i], a[at]];
  }
}
visitPermutations([0, 1, 2, 3, 4, 5, 6], 0, order => {
  let best = -Infinity;
  const t = blockInverse(chapter, order);
  for (const sign of [-1, 1]) {
    for (const skipF of [false, true]) {
      best = Math.max(best, measure(phiShift(t, sign, skipF)).bigramLL);
      best = Math.max(best, measure(blockInverse(phiArrays[sign + '/' + skipF], order)).bigramLL);
    }
  }
  permutations++;
  nullMaxima.push(best);
  if (best >= observedBest) exceed++;
});
nullMaxima.sort((a, b) => a - b);
const familywiseP = (exceed + 1) / (permutations + 1);

const plant = held.slice(0, 1680);
const globalPlant1 = rectForward(phiShift(plant, 1, false));
const globalRecovered1 = phiShift(rectInverse(globalPlant1), -1, false);
const globalPlant2 = phiShift(rectForward(plant), 1, false);
const globalRecovered2 = rectInverse(phiShift(globalPlant2, -1, false));
const blockPlant1 = blockForward(phiShift(plant, 1, false), historical);
const blockRecovered1 = phiShift(blockInverse(blockPlant1, historical), -1, false);
const blockPlant2 = phiShift(blockForward(plant, historical), 1, false);
const blockRecovered2 = blockInverse(phiShift(blockPlant2, -1, false), historical);
const exact = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
assert.ok(exact(globalRecovered1, plant));
assert.ok(exact(globalRecovered2, plant));
assert.ok(exact(blockRecovered1, plant));
assert.ok(exact(blockRecovered2, plant));

console.log(JSON.stringify({
  selector: {
    p10: '7 G',
    globalTableRow7ColumnG: cell7G,
    base60Value156: v7G,
    totient48: totient(v7G),
    oneBasedCell119: cell119,
    base60Value35: v119,
    chapterLength: chapter.length,
    factorization: '48 x 35'
  },
  scores: {raw, nativeHeldout},
  globalTranspose: {cases: globalCases.map(({first70, ...x}) => x), best: globalBest},
  blockwise5x7: {
    cases: blockCases.map(({first70, ...x}) => x),
    best: blockBest,
    permutationNull: {
      permutations,
      maxOverEightVariantsAtLeastObserved: exceed,
      familywiseP,
      medianMax: nullMaxima[Math.floor(nullMaxima.length / 2)],
      q95Max: nullMaxima[Math.floor(nullMaxima.length * 0.95)]
    }
  },
  positivePlants: {
    globalTransThenPhi: exact(globalRecovered1, plant),
    globalPhiThenTrans: exact(globalRecovered2, plant),
    blockTransThenPhi: exact(blockRecovered1, plant),
    blockPhiThenTrans: exact(blockRecovered2, plant)
  }
}, null, 2));
