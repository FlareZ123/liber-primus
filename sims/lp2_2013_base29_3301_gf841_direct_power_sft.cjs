'use strict';
/**
 * Original-cipher SFT: the 2013 signed BASE29 example 3301 -> 3QO fixes
 * H(z)=z^2+18z+11 over F29. Use the same historically printed 3301 as
 * a field-power exponent on adjacent original GP29 rune pairs.
 *
 * This is an exploratory reversible operation, not an attested Cicada cipher.
 * Run: node sims/lp2_2013_base29_3301_gf841_direct_power_sft.cjs
 * No command-line arguments, third-party packages, or data writes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname,
  '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const MOD = 29;
/** @param {number} x @returns {number} */
const mod = x => ((x % MOD) + MOD) % MOD;
/**
 * F(29^2) = F29[z] / (z^2+18z+11), so z^2=18+11z.
 * @param {[number,number]} x
 * @param {[number,number]} y
 * @returns {[number,number]}
 */
function multiply([a, b], [c, d]) {
  return [mod(a*c+18*b*d), mod(a*d+b*c+11*b*d)];
}
/**
 * @param {[number,number]} x
 * @param {number} exponent
 * @returns {[number,number]}
 */
function power(x, exponent) {
  let value = [1, 0];
  let base = x;
  for (let e = exponent; e > 0; e = Math.floor(e/2)) {
    if (e % 2) value = multiply(value, base);
    base = multiply(base, base);
  }
  return value;
}
/**
 * @param {number[]} original
 * @param {number} exponent
 * @param {boolean} reversePair
 * @param {number} lead
 * @returns {number[]}
 */
function transform(original, exponent, reversePair, lead) {
  const result = original.slice(0, lead);
  for (let i = lead; i+1 < original.length; i += 2) {
    const input = reversePair ?
      [original[i+1], original[i]] : [original[i], original[i+1]];
    const mapped = power(input, exponent);
    result.push(...(reversePair ? mapped.reverse() : mapped));
  }
  if ((original.length-lead) % 2) result.push(original.at(-1));
  assert.equal(result.length, original.length);
  return result;
}
/** @param {number[]} data @returns {number} */
function ioc(data) {
  const counts = Array(29).fill(0);
  for (const index of data) counts[index]++;
  return counts.reduce((sum, n) => sum+n*(n-1), 0)/(data.length*(data.length-1));
}
/** @param {number[]} data @returns {string} */
const letters = data => data.map(i => corpus.translit[i]).join('');
/** @param {number[]} data @returns {number} */
function doublets(data) {
  let n = 0;
  for (let i = 1; i < data.length; i++) if (data[i] === data[i-1]) n++;
  return n;
}
const unknownPages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
const allUnknown = unknownPages.flatMap(p => p.indices);
const p55 = corpus.pages.find(p => p.page === 55).indices;
const p36 = corpus.pages.find(p => p.page === 36).indices;
const known = corpus.pages.find(p => p.page === 57).indices;
assert.equal(unknownPages.length, 55);
assert.equal(allUnknown.length, 12956);
assert.equal(p55.length, 76);
assert.equal(p36.length, 238);
assert.equal(known.length, 95);
// 3301 mod 840 = 781, coprime to 840; its inverse is 541.
const SOURCE_EXPONENT = 3301;
const INVERSE = 541;
assert.equal((SOURCE_EXPONENT*INVERSE)%840, 1);
assert.deepEqual(power([0, 0], SOURCE_EXPONENT), [0, 0]);
for (let a = 0; a < 29; a++) for (let b = 0; b < 29; b++) {
  const x = [a, b];
  assert.deepEqual(power(power(x, SOURCE_EXPONENT), INVERSE), x);
  assert.deepEqual(power(power(x, INVERSE), SOURCE_EXPONENT), x);
}
// Original-solved p57 is an *independent positive* for full inversion.
for (const reversePair of [false, true]) {
  const encrypted = transform(known, SOURCE_EXPONENT, reversePair, 0);
  const decrypted = transform(encrypted, INVERSE, reversePair, 0);
  assert.deepEqual(decrypted, known);
}
const candidates = [];
// p55 lead=0 pairs all 76 printed runes. lead=1 excludes the single
// p54-word carry rune, and leaves its trailing body rune unpaired.
for (const [name, source] of [['p55', p55], ['p36', p36]]) {
  for (const lead of (name === 'p55' ? [0, 1] : [0])) {
    for (const reversePair of [false, true]) {
      for (const [direction, exponent, restore] of [
        ['inverse', INVERSE, SOURCE_EXPONENT],
        ['forward', SOURCE_EXPONENT, INVERSE]
      ]) {
        const decoded = transform(source, exponent, reversePair, lead);
        const roundtrip = transform(decoded, restore, reversePair, lead);
        assert.deepEqual(roundtrip, source);
        candidates.push({
          page: name, lead, reversePair, direction,
          sourceIoC: ioc(source), decodedIoC: ioc(decoded),
          decodedDoublets: doublets(decoded),
          first100: letters(decoded).slice(0, 100)
        });
      }
    }
  }
}
const book = [];
for (const reversePair of [false, true]) {
  for (const [direction, exponent, restore] of [
    ['inverse', INVERSE, SOURCE_EXPONENT],
    ['forward', SOURCE_EXPONENT, INVERSE]
  ]) {
    const decoded = unknownPages.flatMap(p => transform(p.indices,
      exponent, reversePair, 0));
    const reciphered = unknownPages.flatMap((p, i) => {
      const index = unknownPages.slice(0, i).reduce((s, page) =>
        s + page.indices.length, 0);
      return transform(decoded.slice(index, index+p.indices.length),
        restore, reversePair, 0);
    });
    assert.deepEqual(reciphered, allUnknown);
    book.push({
      reversePair, direction, sourceIoC: ioc(allUnknown),
      decodedIoC: ioc(decoded), sourceDoublets: doublets(allUnknown),
      decodedDoublets: doublets(decoded), first100: letters(decoded).slice(0, 100)
    });
  }
}
console.log(JSON.stringify({
  field: 'F29[z]/(z^2+18z+11)',
  historicalSource: '2013 signed BASE29 3301 -> 3QO',
  exponent: SOURCE_EXPONENT, inverseExponentMod840: INVERSE,
  testedFieldElements: 841, solvedP57PlantRecovered: known.length,
  sourcePages: unknownPages.length, unknownRunes: allUnknown.length,
  p55Candidates: candidates.filter(x => x.page === 'p55'),
  independentP36Candidates: candidates.filter(x => x.page === 'p36'),
  bookPageResetCandidates: book,
  originalPlaintextRecovered: false,
  interpretiveLimit: 'No signed instruction specifies power-cipher pairing; these finite source-locked inverses recover no readable unknown page'
}, null, 2));
