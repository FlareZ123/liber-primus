'use strict';

/**
 * Exact 308-rune original-source two-time-pad gate.
 *
 * A is the two complete sentences straddling the runeless 256-cell p50 table:
 * p48 last72 + p49 all66 + p51 first92 + p52 first78.
 * B is the separate original final encrypted chapter p54 all232 + p55 all76.
 * Each is 308 GP29 symbols. We test the direct, unrotated positionwise
 * additive same-pad hypothesis C1 = P1 + K, C2 = P2 + K (mod 29).
 *
 * This is a deliberately narrow source-selected comparison. The exact
 * 308-length coincidence may be accidental. Do not infer a shared key or
 * source-supported key clock from matching length alone.
 *
 * Usage in repository: node sims/lp2_tablebracket_terminal308_twotimepad_sft.cjs
 * Node22, Windows-compatible, no external dependencies or file writes.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @type {{translit:string[],pages:{page:number,indices:number[]}[]}} */
const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8',
));

const pages = corpus.pages;
assert.equal(pages.length, 58);
assert.equal(pages.slice(0, 56).reduce((sum, p) => sum + p.indices.length, 0), 12956);
assert.equal(pages[50].indices.length, 0);
const left = pages[48].indices.slice(-72)
  .concat(pages[49].indices, pages[51].indices.slice(0, 92), pages[52].indices.slice(0, 78));
const right = pages[54].indices.concat(pages[55].indices);
assert.deepEqual([pages[49].indices.length, pages[54].indices.length, pages[55].indices.length], [66, 232, 76]);
assert.equal(left.length, 308);
assert.equal(right.length, 308);

const gpLookup = Object.fromEntries(corpus.translit.map((name, idx) => [name, idx]));

/**
 * Transliterates a public-domain control to approximate native GP29
 * using established digraph glyphs and normalized English spelling.
 * Nonletter characters are not emitted.
 * @param {string} original
 * @returns {number[]}
 */
function gpEncode(original) {
  const src = original.toUpperCase().replace(/[KQ]/g, 'C').replace(/V/g, 'U').replace(/Z/g, 'S');
  /** @type {number[]} */
  const out = [];
  for (let i = 0; i < src.length;) {
    if (!/[A-Z]/.test(src[i])) {
      i += 1;
      continue;
    }
    /** @type {number | undefined} */
    let found;
    for (const candidate of ['ING', 'TH', 'EA', 'NG', 'EO', 'OE', 'AE', 'IA', 'IO']) {
      if (src.startsWith(candidate, i)) {
        found = gpLookup[candidate === 'ING' ? 'NG' : candidate === 'IO' ? 'IA' : candidate];
        i += candidate.length;
        break;
      }
    }
    if (found === undefined) {
      found = gpLookup[src[i]];
      i += 1;
    }
    if (found !== undefined) out.push(found);
  }
  return out;
}

/**
 * Absolute GF29 difference frequencies for two 308-symbol streams.
 * @param {number[]} a
 * @param {number[]} b
 * @param {number} [offsetA]
 * @param {number} [offsetB]
 * @returns {number[]}
 */
function differenceHistogram(a, b, offsetA = 0, offsetB = 0) {
  const h = Array(29).fill(0);
  for (let i = 0; i < 308; i += 1) {
    h[(a[offsetA + i] - b[offsetB + i] + 29) % 29] += 1;
  }
  return h;
}

/**
 * @param {number[]} hist
 * @returns {[number,number,number]}
 */
function metrics(hist) {
  const mean = 308 / 29;
  return [
    hist[0],
    Math.max(...hist),
    hist.reduce((sum, n) => sum + ((n - mean) ** 2) / mean, 0),
  ];
}

/** @type {number} */
let seed = 0x308f2301;

/**
 * Seeded, deterministic xorshift32.
 * @param {number} n
 * @returns {number}
 */
function draw(n) {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) % n;
}

const hOriginal = differenceHistogram(left, right);
const original = metrics(hOriginal);
assert.equal(original[0], 14);
assert.equal(original[1], 16);
assert.ok(Math.abs(original[2] - 20.980519480519483) < 1e-10);

const sources = [
  'shakespeare_first300k.txt',
  'emerson_essays_2944.txt',
  'gibran_prophet_58585.txt',
].map((name) => {
  const originalText = fs.readFileSync(path.join(__dirname, '..', 'resources', 'control', name), 'utf8');
  return {name, digits: gpEncode(originalText)};
});
assert.ok(sources.every(({digits}) => digits.length > 308));

/** Positive same-pad plant: arbitrary shared additive key cancels exactly. */
const sampleA = sources[0].digits.slice(3000, 3308);
const sampleB = sources[1].digits.slice(5000, 5308);
const sameKey = Array.from({length: 308}, () => draw(29));
const encryptedA = sampleA.map((x, i) => (x + sameKey[i]) % 29);
const encryptedB = sampleB.map((x, i) => (x + sameKey[i]) % 29);
assert.deepEqual(differenceHistogram(encryptedA, encryptedB), differenceHistogram(sampleA, sampleB));
assert.equal(encryptedA.length, 308);
assert.equal(encryptedB.length, 308);

console.log('original-source component lengths: 72 + 66 + 92 + 78 = 232 + 76 = 308');
console.log('original difference histogram:', JSON.stringify(hOriginal));
console.log('original [same,bestShiftCount,chi2]:', JSON.stringify(original));
console.log('same-key additive positive-control exact histogram recovery: PASS');

const trials = 15000;
const rows = [];
for (let r = 0; r < 3; r += 1) {
  const a = sources[r];
  const b = sources[(r + 1) % 3];
  const means = [0, 0, 0];
  const low = [0, 0, 0];
  for (let t = 0; t < trials; t += 1) {
    const m = metrics(differenceHistogram(
      a.digits,
      b.digits,
      draw(a.digits.length - 308),
      draw(b.digits.length - 308),
    ));
    for (let i = 0; i < 3; i += 1) {
      means[i] += m[i];
      if (m[i] <= original[i]) low[i] += 1;
    }
  }
  rows.push({
    sourcePair: [a.name, b.name],
    controls: [a.digits.length, b.digits.length],
    trials,
    controlMeans: means.map((x) => x / trials),
    empiricalLowerTailAtOriginal: low.map((x) => x / trials),
  });
}
console.log('natural-GP control pairs (unconditioned by whitespace):');
for (const row of rows) console.log(JSON.stringify(row));
console.log('Decision: direct zero-phase 308-rune two-time pad is not supported under these three');
console.log('finite GP-native source-control comparisons; no plaintext or authenticated key.');
