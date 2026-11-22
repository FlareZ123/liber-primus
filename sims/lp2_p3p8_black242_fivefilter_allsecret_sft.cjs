'use strict';
/**
 * SFT: all-secret order-five affine GF(29) word-to-rune transfer on original LP2.
 *
 * Source: physical p3-p7 have 242 wholly black complete printed words;
 * p8 has 242 wholly page-contained black runes (one more black rune carries
 * into the first p9 word). The five red p7 words motivate an order-five
 * source-to-recipient recurrence, without authenticating this opcode.
 *
 * Arbitrarily secret 11 coefficients:
 *   Y[i] = a0 + sum(j=0..4, a[j+1]*X[i-j])
 *               + sum(j=1..5, b[j]*Y[i-j]) (mod 29).
 *
 * The 11 unknown coefficients are inferred only from the first 11
 * independent equations. Exact inconsistency on 237 original equations
 * rejects the complete family for each of nine explicitly chosen source
 * summaries, independent of the secret key. The planted input must pass.
 *
 * Run on Windows 11 using Node 22:
 *   node sims/lp2_p3p8_black242_fivefilter_allsecret_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} relative @returns {string} */
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const source = read('resources/liber-primus/lp2-transcription.txt');
const runeIndex = new Map(gp.runes.map((r, i) => [r, i]));
/** @param {number} x @returns {number} */
const mod = x => ((x % 29) + 29) % 29;

const pageStarts = new Map();
let total = 0;
for (const p of gp.pages.filter(p => p.page <= 55)) {
  pageStarts.set(p.page, total);
  total += p.indices.length;
}
assert.equal(total, 12956);
const redSites = new Set();
for (const p of ink.pages.filter(p => p.page <= 55)) {
  for (const span of p.red_spans || []) {
    for (let j = 0; j < span.length; j++) {
      redSites.add(pageStarts.get(p.page) + span.start + j);
    }
  }
}
const words = [];
const original = [];
let current = [], start = 0;
for (const ch of source.split('%').slice(0, 55).join('%')) {
  if (runeIndex.has(ch)) {
    if (!current.length) start = original.length;
    const index = runeIndex.get(ch);
    current.push(index);
    original.push(index);
  } else if (ch === '%' || ch === '/' || /\s/u.test(ch)) {
    // Line and page wrapping preserve the same complete printed word.
  } else if (current.length) {
    words.push({start, w: current, red: current.every((_, j) => redSites.has(start + j))});
    current = [];
  }
}
if (current.length) {
  words.push({start, w: current, red: current.every((_, j) => redSites.has(start + j))});
}
assert.equal(original.length, 12956);
assert.equal(words.length, 2896);

const sourceWords = words.filter(x =>
  x.start >= pageStarts.get(3) && x.start < pageStarts.get(8));
assert.equal(sourceWords.length, 255);
assert.equal(sourceWords.filter(x => x.red).length, 13);
const blackWords = sourceWords.filter(x => !x.red).map(x => x.w);
assert.equal(blackWords.length, 242);

const p8 = gp.pages.find(p => p.page === 8).indices;
const receiver = p8.slice(12, -1);
assert.equal(p8.length, 255);
assert.equal(receiver.length, 242);
const summaries = {
  'ordinal-sum': w => w.reduce((s, x) => s + x, 0),
  'prime-sum': w => w.reduce((s, x) => s + gp.prime[x], 0),
  'ordinal-product': w => w.reduce((s, x) => s * x, 1),
  'prime-product': w => w.reduce((s, x) => s * gp.prime[x], 1),
  'length': w => w.length,
  'first': w => w[0],
  'last': w => w.at(-1),
  'alternating-sum': w => w.reduce((s, x, i) => s + (i % 2 ? -x : x), 0),
  'weighted-sum': w => w.reduce((s, x, i) => s + (i + 1) * x, 0),
};
/** @param {number[]} x @param {number[]} y @param {number} i @returns {number[]} */
function row(x, y, i) {
  return [1, x[i], x[i - 1], x[i - 2], x[i - 3], x[i - 4],
    y[i - 1], y[i - 2], y[i - 3], y[i - 4], y[i - 5], y[i]];
}
/**
 * Exact finite-field RREF, including contradictory rows.
 * @param {number[][]} rows
 * @param {number} cols
 * @returns {{rank:number,inconsistent:boolean,solution:number[]}}
 */
function solve(rows, cols) {
  const a = rows.map(r => r.map(mod));
  const pivots = [];
  let rank = 0;
  for (let col = 0; col < cols; col++) {
    let pivot = rank;
    while (pivot < a.length && a[pivot][col] === 0) pivot++;
    if (pivot === a.length) continue;
    [a[rank], a[pivot]] = [a[pivot], a[rank]];
    let inv = 1;
    while (mod(inv * a[rank][col]) !== 1) inv++;
    for (let j = col; j <= cols; j++) a[rank][j] = mod(a[rank][j] * inv);
    for (let i = 0; i < a.length; i++) {
      if (i === rank || a[i][col] === 0) continue;
      const v = a[i][col];
      for (let j = col; j <= cols; j++) {
        a[i][j] = mod(a[i][j] - v * a[rank][j]);
      }
    }
    pivots.push(col);
    rank++;
    if (rank === a.length) break;
  }
  const inconsistent = a.some(r => r.slice(0, cols).every(x => x === 0) && r[cols] !== 0);
  const solution = Array(cols).fill(0);
  for (let i = 0; i < rank; i++) solution[pivots[i]] = a[i][cols];
  return {rank, inconsistent, solution};
}
/** @param {number[]} equation @param {number[]} coefficients @returns {number} */
function predict(equation, coefficients) {
  return mod(equation.slice(0, 11).reduce((s, x, i) => s + x * coefficients[i], 0));
}

const output = [];
for (const [name, summary] of Object.entries(summaries)) {
  const x = blackWords.map(w => mod(summary(w)));
  const rows = Array.from({length: 237}, (_, j) => row(x, receiver, j + 5));
  const originalFit = solve(rows, 11);
  const earlyFit = solve(rows.slice(0, 30), 11);
  const firstIndependent = solve(rows.slice(0, 11), 11);
  assert.equal(originalFit.rank, 11, name + ': full rank');
  assert.equal(originalFit.inconsistent, true, name + ': original incompatible');
  assert.equal(earlyFit.inconsistent, true, name + ': first 30 incompatible');
  assert.equal(firstIndependent.inconsistent, false, name + ': first 11 independent');
  assert.equal(firstIndependent.rank, 11, name + ': initial fit rank');

  const untouched = rows.slice(30).filter(r => predict(r, firstIndependent.solution) === r[11]).length;
  // Positive control: synthetic 242-rune receiver from frozen arbitrary secret
  // coefficients under precisely the same black-word inputs and recurrence.
  const chosen = [7, 3, 19, 14, 5, 22, 27, 11, 1, 20, 8];
  const synthetic = Array(242).fill(0);
  for (let j = 0; j < 5; j++) synthetic[j] = receiver[j];
  for (let j = 5; j < 242; j++) {
    synthetic[j] = predict(row(x, synthetic, j), chosen);
  }
  const plantedRows = Array.from({length: 237}, (_, j) => row(x, synthetic, j + 5));
  const planted = solve(plantedRows.slice(0, 30), 11);
  assert.equal(planted.rank, 11, name + ': planted rank');
  assert.equal(planted.inconsistent, false, name + ': planted consistency');
  assert.deepEqual(planted.solution, chosen, name + ': recovered all 11 secret coefficients');
  assert.equal(plantedRows.slice(30).filter(r => predict(r, planted.solution) === r[11]).length,
    207, name + ': 207/207 planted withheld symbols');
  for (const r of plantedRows) assert.equal(predict(r, planted.solution), r[11]);

  output.push({summary: name, originalRank: originalFit.rank,
    originalInconsistent: originalFit.inconsistent,
    first30Inconsistent: earlyFit.inconsistent,
    untouchedCorrectOf207: untouched,
    plantedRecovered11: true, plantedUntouchedCorrectOf207: 207});
}
console.log(JSON.stringify({
  sourceBlackWords: blackWords.length,
  sourceRedWords: 13,
  recipientPage8BlackContainedRunes: receiver.length,
  secretCoefficients: 11,
  originalEquations: 237,
  findings: output
}, null, 2));
console.log('PASS: all nine original finite-field systems inconsistent; planted full-rank receivers recover exactly.');
