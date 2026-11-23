/**
 * Source-selected five-lane, five-bit Bacon candidate on original LP2 pp36-38.
 * Windows Node.js 22 standalone read-only SFT; no external dependencies.
 *
 * This explores one 91-column binary register. It is not an LP2 decryption
 * or a proof against all 2^29 possible hidden rune-to-bit assignments.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} file @returns {string} */
const load = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const source = JSON.parse(load('resources/liber-primus/lp2-corpus.json'));
const gibran = load('resources/control/gibran_prophet_58585.txt').toUpperCase().replace(/[^A-Z]/g, '');
const emerson = load('resources/control/emerson_essays_2944.txt').toUpperCase().replace(/[^A-Z]/g, '');
assert.equal(gibran.length, 66521);
const ranges = [
  [[36, 99, 238]],
  [[37, 0, 91]],
  [[37, 91, 189]],
  [[37, 189, 228], [38, 0, 57]],
  [[38, 57, 186]],
];
const complete = ranges.map((parts) => parts.flatMap(([p, a, b]) => source.pages[p].indices.slice(a, b)));
assert.deepEqual(complete.map((x) => x.length), [139, 91, 98, 96, 129]);
assert.equal(complete.reduce((a, b) => a + b.length, 0), 553);
const columns = complete.map((x) => x.slice(0, 91));
for (const row of complete) for (const x of row) assert.ok(Number.isInteger(x) && x >= 0 && x < 29);

/** @param {number} seed @returns {() => number} */
function random(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
/** @param {number} mask @param {number[][]} rows @returns {Uint8Array} */
function decode(mask, rows) {
  const result = new Uint8Array(91);
  for (let i = 0; i < 91; i++) {
    let n = 0;
    for (let j = 0; j < 5; j++) n = (n << 1) | ((mask >>> rows[j][i]) & 1);
    result[i] = n;
  }
  return result;
}
/** @param {Uint8Array} v @returns {string} */
const render = (v) => Array.from(v, (x) => x < 26 ? String.fromCharCode(65 + x) : '_').join('');
/** @param {number[][]} rows @returns {number} */
const doublets = (rows) => rows.reduce((n, row) => n +
  row.slice(1).filter((x, i) => x === row[i]).length, 0);

// Freeze the language model on Gibran; the positive plaintext comes from
// an independent Emerson text and is not used to train the model.
const counts = new Int32Array(26 ** 4);
const unigrams = new Float64Array(26);
const a = Array.from(gibran, (c) => c.charCodeAt(0) - 65);
for (let i = 0; i < a.length; i++) {
  unigrams[a[i]]++;
  if (i >= 3) counts[(((a[i - 3] * 26 + a[i - 2]) * 26 + a[i - 1]) * 26 + a[i])]++;
}
for (let i = 0; i < 26; i++) unigrams[i] = Math.log(unigrams[i] / a.length + 1e-8);
const grams = Float64Array.from(counts, (n) => Math.log(n + 0.0005));
/** @param {Uint8Array} v @returns {number} */
function score(v) {
  let s = 0;
  for (let i = 0; i < 91; i++) s += v[i] < 26 ? unigrams[v[i]] * 0.25 : -10;
  for (let i = 3; i < 91; i++) {
    const w = v[i - 3], x = v[i - 2], y = v[i - 1], z = v[i];
    s += w < 26 && x < 26 && y < 26 && z < 26
      ? grams[(((w * 26 + x) * 26 + y) * 26 + z)] : -13;
  }
  return s / 91;
}
/**
 * Seeded four-start, 720000-toggle simulated annealing on a 29-bit
 * shared rune alphabet. Heuristic only; its best score is not an upper bound.
 * @param {number[][]} rows
 * @param {number} seed
 * @returns {{score:number,mask:number,text:string}}
 */
function optimize(rows, seed) {
  const rng = random(seed);
  let best = {score: -1e6, mask: 0};
  for (let trial = 0; trial < 4; trial++) {
    let mask = (rng() * 0x20000000) | 0;
    let cur = score(decode(mask, rows));
    if (cur > best.score) best = {score: cur, mask};
    for (let i = 0; i < 180000; i++) {
      const trialMask = mask ^ (1 << ((rng() * 29) | 0));
      const trialScore = score(decode(trialMask, rows));
      const temperature = 0.15 + 1.8 * (1 - (i % 10000) / 10000);
      if (trialScore > cur || rng() < Math.exp((trialScore - cur) / temperature)) {
        mask = trialMask;
        cur = trialScore;
        if (cur > best.score) best = {score: cur, mask};
      }
    }
  }
  return {...best, text: render(decode(best.mask, rows))};
}

// Original direct source-visible canonical GP0 parity.
const parity = Array.from(decode(0x0aaaaaaa, columns), (n) =>
  n < 26 ? String.fromCharCode(65 + n) : String(n - 26)).join('');
assert.equal(parity,
  'OHGGPYCSLD5MLEBVISUVZMFWQLIE4GNTFAQCKRP55DQDVSSFFGAK25FOZAXK411CQXQW05NPHUO2K45SMBJLZUFHLDJ');
const original = optimize(columns, 3301);
assert.equal(original.mask, 13377681);
assert.ok(Math.abs(original.score + 6.068296298455122) < 1e-6);
assert.equal(doublets(columns), 0);

// Construct real English Bacon payload in five *random-looking* rune rows,
// hiding its 29-bit alphabet and independently suppressing adjacent doublets.
const truth = emerson.slice(800, 891);
const english = Array.from(truth, (c) => c.charCodeAt(0) - 65);
assert.equal(truth.length, 91);
const hiddenMask = 0x0aa6b5ad;
const pool = [[], []];
for (let i = 0; i < 29; i++) pool[(hiddenMask >>> i) & 1].push(i);
const rng = random(1033);
const plant = Array.from({length: 5}, () => []);
for (let i = 0; i < 91; i++) {
  for (let j = 0; j < 5; j++) {
    const options = pool[(english[i] >>> (4 - j)) & 1];
    let letter = options[(rng() * options.length) | 0];
    while (i > 0 && letter === plant[j][i - 1]) {
      letter = options[(rng() * options.length) | 0];
    }
    plant[j].push(letter);
  }
}
assert.equal(doublets(plant), 0);
assert.equal(render(decode(hiddenMask, plant)), truth);
const positive = optimize(plant, 3310);
assert.equal(positive.text, truth);
assert.ok(positive.score > 0);
assert.ok(original.score < -5);
console.log(JSON.stringify({
  status: 'PASS', inputPages: [36, 37, 38],
  numberedLengths: complete.map((row) => row.length),
  originalColumnCount: 91, originalRemainderRunes: 98,
  canonicalParityReadout: parity, originalBest: original,
  independentNativePlant: positive, nativeTruth: truth,
  originalDoublets: doublets(columns), plantedDoublets: doublets(plant),
}, null, 2));
