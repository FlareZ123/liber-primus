'use strict';
/**
 * Original LP2 word-prime-sum conservation: a clue-selected numerical
 * hypothesis tested against authentic solved Cicada and Latin GP29 prose.
 *
 * Independent source clue: LP1 names GP primes/totient as sacred and the
 * verified 2016 Cicada message says "their numbers are the direction".
 * Test the simple, reversible-invariant hypothesis that encryption changes
 * the GP29 runes inside each word while preserving that word's EXACT
 * integer sum of GP prime weights. Such a transformation may be arbitrarily
 * complicated and independently keyed; the necessary sum equality remains.
 *
 * SFT: node sims/lp2_wordprime_sum_conservation_sft.cjs
 * Windows Node.js 22, dependency-free. No output files.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const sourceRunes = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
const lookup = new Map(corpus.runes.map((r, i) => [r, i]));
assert.equal(sourceRunes.length, 12956);

/** @type {number[][]} */
const originals = [];
let w = [], count = 0;
for (const ch of read('resources/liber-primus/lp2-transcription.txt')) {
  if (lookup.has(ch)) {
    if (count + w.length === sourceRunes.length) break;
    w.push(lookup.get(ch));
  } else if ('- .&$§'.includes(ch) && w.length) {
    originals.push(w);
    count += w.length;
    w = [];
  }
}
if (w.length) { originals.push(w); count += w.length; }
assert.equal(count, 12956);
assert.equal(originals.length, 2896);
assert.deepEqual(originals.flat(), sourceRunes);

const tokens = corpus.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
/**
 * Source GP29 orthography: longest-match TH, NG, EO, OE, AE, IA, EA,
 * and the single-rune ING and IO. Normalization preserves the
 * canonical original p57 PARABLE (verified against all 95 original runes).
 * @param {string} raw
 * @returns {number[]}
 */
function encode(raw) {
  const s = raw.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < s.length;) {
    if (s.startsWith('ING', i)) {
      out.push(21); i += 3;
    } else if (s.startsWith('IO', i)) {
      out.push(27); i += 2;
    } else {
      const t = tokens.find(t => s.startsWith(t.s, i));
      assert(t, 'Missing GP symbol for ' + raw);
      out.push(t.i);
      i += t.s.length;
    }
  }
  return out;
}
const source = read('resources/liber-primus/lp1-plaintext-reference.txt');
const parable = source.split('### 57')[1];
const nativeParable = (parable.match(/[A-Z]+/g) || []).flatMap(encode);
assert.deepEqual(nativeParable, corpus.pages[57].indices);

/** @returns {number[][]} */
function solvedProse() {
  const sections = source.split(/\n### /).slice(1)
    .filter(t => /^(?:1|3|5|6|9|10|11|12|13|14|15|56|57)\n/.test(t));
  const words = [];
  for (let section of sections) {
    section = section.replace(/^[0-9]+\n/, '')
      .replace(/^[^\n]*\n/, '')
      .replace(/36367763[\s\S]*?2a8b4/, '')
      .replace(/\(.*?\)/g, '')
      .replace(/^\[[^\]\n]*\].*$/gm, '');
    words.push(...(section.match(/[A-Za-z]+/g) || []).map(encode));
  }
  return words;
}
/** @returns {number[][]} */
function latinProse() {
  const digits = '0123456789ABCDEFGHIJKLMNOPQRS';
  assert.equal(digits.length, 29);
  return read('resources/control/latin-vulgate-gp-wholewords.txt')
    .split(/\r?\n/).filter(s => /^[0-9A-S]+$/.test(s))
    .map(s => [...s].map(c => digits.indexOf(c)));
}
/** @param {number[]} w @returns {number} */
const primeSum = w => w.reduce((t, i) => t + corpus.prime[i], 0);
const actualTotal = originals.reduce((t, w) => t + primeSum(w), 0);
assert.equal(actualTotal, 668182);

/**
 * A necessary test for a per-word exact GP-prime-sum preserving cipher.
 * Each original printed word length is held fixed. The comparator source
 * is independently preserved, outside the unknown ciphertext. Z estimates
 * the difference under independent length-matched source-word sampling.
 * @param {number[][]} control
 * @returns {{referenceWords:number,expectedTotal:number,sigma:number,z:number,byLength:Record<string,{n:number,observedMean:number,sourceMean:number}>,pool:Map<number, number[]>}}
 */
function evaluate(control) {
  /** @type {Map<number, number[]>} */
  const pool = new Map();
  for (const w of control) {
    if (!pool.has(w.length)) pool.set(w.length, []);
    pool.get(w.length).push(primeSum(w));
  }
  const stats = new Map();
  for (const [length, values] of pool) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0)
      / values.length;
    stats.set(length, {mean, variance});
  }
  let expectedTotal = 0, varianceTotal = 0;
  /** @type {Record<string, {n:number,observedMean:number,sourceMean:number}>} */
  const byLength = {};
  for (const w of originals) {
    const st = stats.get(w.length);
    assert(st, 'Missing native reference word length ' + w.length);
    expectedTotal += st.mean;
    varianceTotal += st.variance;
    const row = byLength[w.length] ||
      (byLength[w.length] = {n: 0, observedMean: 0, sourceMean: st.mean});
    row.n++;
    row.observedMean += primeSum(w);
  }
  for (const row of Object.values(byLength))
    row.observedMean /= row.n;
  const sigma = Math.sqrt(varianceTotal);
  return {referenceWords: control.length, expectedTotal, sigma,
    z: (actualTotal - expectedTotal) / sigma, byLength, pool};
}
const solved = solvedProse();
const latin = latinProse();
assert.equal(latin.length, 39835);
const authored = evaluate(solved);
const vulgate = evaluate(latin);
assert(authored.z > 20, 'Source-native known-Cicada mean gap disappeared');
assert(vulgate.z > 20, 'Independent Vulgate mean gap disappeared');
for (let length = 3; length <= 12; length++) {
  assert(authored.byLength[length].observedMean >
    authored.byLength[length].sourceMean,
    'Authentic solved prose prime sums exceed the original at length ' + length);
  assert(vulgate.byLength[length].observedMean >
    vulgate.byLength[length].sourceMean,
    'Latin prime sums exceed the original at length ' + length);
}

// A deterministic native positive control constructs a complete source-shaped
// synthetic ciphertext by PERMUTING runes within every source word. The per-word
// GP prime sum is unchanged, irrespective of the particular permutation.
let seed = 0x33012014;
/** @returns {number} */
function random() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
/** @param {Map<number, number[]>} pool @param {number} expectation @param {number} sigma @returns {number} */
function plantedZ(pool, expectation, sigma) {
  let sum = 0;
  for (const w of originals) {
    const values = pool.get(w.length);
    sum += values[random() % values.length];
  }
  return (sum - expectation) / sigma;
}
const plantAuthored = plantedZ(authored.pool,
  authored.expectedTotal, authored.sigma);
const plantLatin = plantedZ(vulgate.pool,
  vulgate.expectedTotal, vulgate.sigma);
assert(Math.abs(plantAuthored) < 5);
assert(Math.abs(plantLatin) < 5);

console.log(JSON.stringify({
  originalWords: originals.length,
  originalRunes: sourceRunes.length,
  originalPrimeSum: actualTotal,
  observedMeanPrimePerRune: actualTotal / sourceRunes.length,
  solvedSource: {
    words: authored.referenceWords,
    expectedMeanPrimePerRune: authored.expectedTotal / sourceRunes.length,
    standardizedDifference: authored.z,
    positivePlantZ: plantAuthored
  },
  independentLatinVulgate: {
    words: vulgate.referenceWords,
    expectedMeanPrimePerRune: vulgate.expectedTotal / sourceRunes.length,
    standardizedDifference: vulgate.z,
    positivePlantZ: plantLatin
  },
  byLength3to12: Object.fromEntries(
    Object.entries(authored.byLength).filter(([l]) =>
      Number(l) >= 3 && Number(l) <= 12))
}, null, 2));
console.log('PASS: source-native word-GP-prime-sum conservation fails on original LP2');
