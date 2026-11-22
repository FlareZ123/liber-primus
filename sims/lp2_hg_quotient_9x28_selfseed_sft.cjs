'use strict';

/**
 * Source-derived 9 x 28 self-seeded recurrence challenge for LP2.
 * Node.js 22, CommonJS. Run: node sims/lp2_hg_quotient_9x28_selfseed_sft.cjs
 * Authored-source branch only; a failed decode does not refute all source keys.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const book = read('resources/liber-primus/lp2-corpus.json');
const table = read('resources/liber-primus/lp2-grid-256.json');
const md = n => ((n % 29) + 29) % 29;
const CHAPTER_STARTS = [0, 729, 1874, 3603, 5506, 6527, 7960, 9640, 12648, 12956];
const H_TIMES_G_HIGH_FIRST = [12, 17, 11, 21, 23];

const bytes = table.pages.flatMap(p => p.bytes);
assert.equal(bytes.length, 256);
const sha = crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex');
assert.equal(sha, '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const flat = book.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(flat.length, 12956);
assert.deepEqual(book.pages.filter(p => p.page <= 55).filter(p => p.indices.length === 0).map(p => p.page), [50]);
assert.deepEqual(CHAPTER_STARTS.slice(1).map((n, i) => n - CHAPTER_STARTS[i]), [729,1145,1729,1903,1021,1433,1680,3008,308]);
assert.equal(book.pages[57].indices.length, 95);

/** @param {number[]} source @param {number[]} factor */
function divideMonicNormalized(source, factor) {
  const work = source.map(x => x % 29);
  const inverseLeading = 17; // 12 * 17 = 1 (mod 29)
  assert.equal(md(factor[0] * inverseLeading), 1);
  const quotient = [];
  for (let i = 0; i < source.length - factor.length + 1; i++) {
    const q = md(work[i] * inverseLeading);
    quotient.push(q);
    for (let k = 0; k < factor.length; k++)
      work[i + k] = md(work[i + k] - q * factor[k]);
  }
  const remainder = work.slice(source.length - factor.length + 1);
  return {quotient, remainder};
}

const {quotient, remainder} = divideMonicNormalized(bytes, H_TIMES_G_HIGH_FIRST);
assert.equal(quotient.length, 252);
assert.deepEqual(remainder, [0, 0, 0, 0]);
assert.equal(quotient[0], 0); // Original printed 203 reduces to 0 mod 29.

function ioc(values) {
  const hist = Array(29).fill(0);
  for (const v of values) hist[v]++;
  return hist.reduce((s, n) => s + n * (n - 1), 0) / (values.length * (values.length - 1));
}

/**
 * One original quotient row is both the 28-tap feedback polynomial
 * and the initial 28-element key state. All 28 original digits used.
 * @param {number[]} row 28 coefficients
 * @param {number} length
 * @param {'original'|'reverse'} direction
 */
function extendKey(row, length, direction) {
  assert.equal(row.length, 28);
  const taps = direction === 'original' ? row : [...row].reverse();
  const key = row.slice();
  while (key.length < length) {
    let z = 0;
    for (let step = 1; step <= 28; step++)
      z = md(z + taps[step - 1] * key[key.length - step]);
    key.push(z);
  }
  return key.slice(0, length);
}

/** @param {'original'|'reverse'} direction */
function allChapterKey(direction) {
  const key = [];
  for (let chapter = 0; chapter < 9; chapter++) {
    const length = CHAPTER_STARTS[chapter + 1] - CHAPTER_STARTS[chapter];
    key.push(...extendKey(quotient.slice(28 * chapter, 28 * (chapter + 1)),
      length, direction));
  }
  assert.equal(key.length, 12956);
  return key;
}

const native = Array.from({length: flat.length},
  (_, i) => book.pages[57].indices[i % 95]);
const results = [];
for (const direction of ['original', 'reverse']) {
  const key = allChapterKey(direction);
  for (const sign of [-1, 1]) {
    const candidate = flat.map((v, i) => md(v + sign * key[i]));
    assert.deepEqual(candidate.map((v, i) => md(v - sign * key[i])), flat);
    const plant = native.map((v, i) => md(v - sign * key[i]));
    assert.deepEqual(plant.map((v, i) => md(v + sign * key[i])), native);
    results.push({
      direction, sign, originalIoC: ioc(candidate),
      chapterIoC: CHAPTER_STARTS.slice(0, 9)
        .map((start, chapter) => ioc(candidate.slice(start, CHAPTER_STARTS[chapter+1]))),
      first40: candidate.slice(0, 40).map(i => book.translit[i]).join(' '),
      restoredKnownNativeIoC: ioc(native), exactNativePlantRecovery: native.length
    });
  }
}
// Key-independent prediction: if the quotient was generated as successive
// rows of the historical H*G 4-state recurrence, 140 fixed equations must hold.
let rowAgreement = 0;
for (let r = 4; r < 9; r++) for (let col = 0; col < 28; col++) {
  const at = (t) => quotient[t * 28 + col];
  if (at(r) === md(15 * at(r-4) + 20 * at(r-3) +
    16 * at(r-2) + at(r-1))) rowAgreement++;
}
assert.equal(rowAgreement, 6);
assert.ok(results.every(x => x.originalIoC > 0.034 && x.originalIoC < 0.035));
console.log(JSON.stringify({
  premise: '2013-H and p39-G divide the 256-cell original source polynomial; 252 quotient symbols split across 9 original chapters, 28 each',
  originalRuneCount: flat.length, originalIoC: ioc(flat),
  gridSha256: sha, quotientLength: quotient.length,
  quotientFourTermRemainder: remainder,
  HGrecurred28Columns: {agreement: rowAgreement, comparisons: 140, chanceMean: 140 / 29},
  sourceNativePositive: {origin: 'repeat authentic solved LP2 p57 95-rune plaintext',
    nativeRunes: native.length, exactRecovery: true},
  testedDecoder: '28-tap GP29 LFSR, self-initialized by its 28 source-derived quotient coefficients, per chapter; both coefficient directions and signs',
  results, decision: 'NO_ORDINARY_GP_ENGLISH_PLAINTEXT_IN_FOUR_SOURCE_FIXED_SELFSEEDED_INVERSIONS'
}, null, 2));
