'use strict';

/**
 * Source-linked p32 prime-row/prime-column 4x4 selector applied to p55's
 * sixteen complete source-printed words. Node.js 22, CommonJS, local-only.
 *
 * The 2016 signed tree image selects p32's 11x11 orientation by 563x569
 * first-row/first-column GP-prime checksums; p55 repeats the tree art.
 * A prime-valued row/column intersection is an exploratory 16-symbol key,
 * with no historical instruction specifying this selector or key consumer.
 *
 * Reproduce: node sims/lp2_p32_p55_prime16_wordkey_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {parseSharedCorpus, physicalLP2Page} = require('./lp2_word_pages.cjs');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(
  root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const square = corpus.pages.find(p => p.page === 32).indices;
const p55 = corpus.pages.find(p => p.page === 55).indices;
const p57 = corpus.pages.find(p => p.page === 57).indices;
assert.equal(square.length, 121);
assert.equal(p55.length, 76);
assert.equal(p55[0], 21); // inherited cross-page NG rune
assert.equal(p57.length, 95);

function sum(values) {
  return values.reduce((a, b) => a + b, 0);
}

function isPrime(n) {
  if (n < 2) return false;
  for (let p = 2; p * p <= n; p++)
    if (n % p === 0) return false;
  return true;
}

const rowSums = Array.from({length: 11}, (_, r) =>
  sum(square.slice(r * 11, r * 11 + 11).map(i => corpus.prime[i])));
const colSums = Array.from({length: 11}, (_, c) =>
  sum(Array.from({length: 11}, (_, r) => corpus.prime[square[r * 11 + c]])));
assert.deepEqual(rowSums, [563,617,287,540,743,513,577,579,603,537,486]);
assert.deepEqual(colSums, [569,429,641,669,518,611,463,690,378,578,499]);

const primeRows = rowSums.flatMap((value, i) => isPrime(value) ? [i] : []);
const primeCols = colSums.flatMap((value, i) => isPrime(value) ? [i] : []);
assert.deepEqual(primeRows, [0,1,4,6]);
assert.deepEqual(primeCols, [0,2,6,10]);

const words = parseSharedCorpus().words.filter(word =>
  physicalLP2Page(word.startPage) === 55);
const index = new Map(corpus.runes.map((rune, i) => [rune, i]));
const wordDigits = words.map(word => Array.from(word.runes, r => index.get(r)));
assert.equal(words.length, 16);
assert.deepEqual(wordDigits.map(w => w.length),
  [4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
assert.deepEqual(wordDigits.flat(), p55.slice(1));

const keyRow = primeRows.flatMap(r => primeCols.map(c => square[11 * r + c]));
const keyCol = primeCols.flatMap(c => primeRows.map(r => square[11 * r + c]));
assert.deepEqual(keyRow,
  [20,25,13,21,8,17,18,7,21,12,7,14,15,14,1,7]);
assert.deepEqual(keyCol,
  [20,8,21,15,25,17,12,14,13,18,7,1,21,7,14,7]);

const mod = n => ((n % 29) + 29) % 29;
function ioc(a) {
  const counts = Array(29).fill(0);
  for (const v of a) counts[v]++;
  return sum(counts.map(n => n * (n - 1))) / (a.length * (a.length - 1));
}
function shift(group, key, sign) {
  return group.flatMap((w, i) => w.map(v => mod(v + sign * key[i])));
}

const nativePlant = p57.slice(0, 75);
assert.equal(nativePlant.length, 75);
const plantWords = [];
let offset = 0;
for (const word of wordDigits) {
  plantWords.push(nativePlant.slice(offset, offset + word.length));
  offset += word.length;
}
assert.equal(offset, 75);

const cases = [];
for (const [order, original] of [['row', keyRow], ['column', keyCol]])
  for (const reverse of [false, true])
    for (const method of ['ordinal', 'prime', 'prime_totient'])
      for (const sign of [-1, 1]) {
        const sequence = reverse ? original.slice().reverse() : original;
        const key = sequence.map(n => method === 'ordinal' ? n :
          method === 'prime' ? corpus.prime[n] % 29 :
          (corpus.prime[n] - 1) % 29);
        const decoded = shift(wordDigits, key, sign);
        assert.deepEqual(shift(plantWords.map((w, i) =>
          w.map(v => mod(v - sign * key[i]))), key, sign), nativePlant);
        assert.deepEqual(shift(
          wordDigits.map((w, i) => w.map(v => mod(v + sign * key[i]))),
          key, -sign), p55.slice(1));
        cases.push({order, reverse, method, sign, ioc: ioc(decoded),
          first12: decoded.slice(0, 12).map(i => corpus.translit[i]).join(' ')});
      }
assert.equal(cases.length, 24);
cases.sort((a, b) => b.ioc - a.ioc);
assert.equal(cases[0].order, 'column');
assert.equal(cases[0].reverse, true);
assert.equal(cases[0].method, 'ordinal');
assert.equal(cases[0].sign, 1);
assert(Math.abs(cases[0].ioc - 0.04) < 1e-12);

// Source-selected 563 and 569 checksum axes remain fixed. The other
// 100 interior cells are uniformly permuted in each of 100k seeded draws.
// This measures the exploratory "at least 4 prime rows and 4 prime cols"
// selection under a conditional null, not a discovery-wide p-value.
const gpWeights = square.map(i => corpus.prime[i]);
const interior = Array.from({length: 100}, (_, i) =>
  gpWeights[11 * (1 + Math.floor(i / 10)) + 1 + (i % 10)]);
let seed = 0x3c3301;
function random() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) / 4294967296;
}
let atLeastFour = 0, exactlyFour = 0;
const shuffled = gpWeights.slice();
for (let iteration = 0; iteration < 100000; iteration++) {
  for (let j = 99; j > 0; j--) {
    const k = Math.floor(random() * (j + 1));
    [interior[j], interior[k]] = [interior[k], interior[j]];
  }
  for (let j = 0; j < 100; j++)
    shuffled[11 * (1 + Math.floor(j / 10)) + 1 + (j % 10)] = interior[j];
  let nr = 0, nc = 0;
  for (let axis = 0; axis < 11; axis++) {
    let rs = 0, cs = 0;
    for (let j = 0; j < 11; j++) {
      rs += shuffled[11 * axis + j];
      cs += shuffled[11 * j + axis];
    }
    nr += Number(isPrime(rs));
    nc += Number(isPrime(cs));
  }
  atLeastFour += Number(nr >= 4 && nc >= 4);
  exactlyFour += Number(nr === 4 && nc === 4);
}
assert.equal(atLeastFour, 13813);
assert.equal(exactlyFour, 5110);

console.log(JSON.stringify({
  source: '2016 signed 563x569 tree; original LP2 p32 / p55',
  p32_prime_rows: primeRows.map(i => [i, rowSums[i]]),
  p32_prime_columns: primeCols.map(i => [i, colSums[i]]),
  p55_carry_excluded: 1, p55_complete_words: 16, p55_body_runes: 75,
  selector_conditional_null: {draws: 100000, at_least_four_each: atLeastFour,
    exactly_four_each: exactlyFour, fixed_axes: 'first row and column'},
  p55_body_raw_ioc: ioc(p55.slice(1)),
  solved_p57_75rune_control_ioc: ioc(nativePlant),
  variants: cases.length, best: cases[0], worst: cases[cases.length - 1],
  every_plant_and_original_reencryption: '75/75 per variant',
  result: 'No readable 75-rune p55 plaintext from this direct 16-word key.',
  caveat: 'The prime-only selector and all key applications are conjectural.'
}, null, 2));
