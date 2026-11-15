'use strict';

/**
 * LP1 p05 mixed-square word cells as an affine prime/totient p55 key.
 * Source-fixed 13 written cells provide precisely 76 GP29 indices.
 * Both original-ink byte orientations, both prime/totient shifts,
 * two signs, and every possible authentic transparent-F clock are
 * tested on the exact original p55 ciphertext, without fitting a key.
 *
 * Reproduce on Windows 11: node sims/lp1_p05_word76_p55_totient_affine_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { trainNativeGP, languageScore } = require('./historical_solve_path_transfer.cjs');
const root = path.join(__dirname, '..');
/** @param {string} relative */
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const book = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const lp1 = read('resources/transcriptions/lp1_wulfic_canonical.txt');
const anchor = '272-138-';
assert.equal(lp1.indexOf(anchor), lp1.lastIndexOf(anchor));
const cells = lp1.slice(lp1.indexOf(anchor)).split(/\r?\n/).slice(0, 5)
  .map(line => line.replace(/\/$/, '').split('-'));
assert.deepEqual(cells.map(row => row.length), [5, 5, 5, 5, 5]);
const wordCells = cells.flatMap(row => row.filter(cell => !/^\d+$/.test(cell)));
assert.equal(wordCells.length, 13);
const keyIndices = wordCells.join('').split('').map(rune => book.runes.indexOf(rune));
assert.equal(keyIndices.length, 76);
assert.ok(keyIndices.every(index => index >= 0 && index < 29));
const forward = keyIndices.map(index => book.prime[index]);
assert.deepEqual(forward.slice(0, 6), [53, 23, 97, 89, 7, 19]);
assert.ok(forward.every(p => (p - 1) % 29 !== 0),
  'Source phi(prime) must be an invertible multiplier for every position');
const sourceCipher = book.pages[55].indices;
assert.equal(sourceCipher.length, 76);
const sourceF = sourceCipher.flatMap((rune, position) => rune === 0 ? [position] : []);
assert.deepEqual(sourceF, [15, 25, 41]);
const mod = n => ((n % 29) + 29) % 29;
/** @param {number} x @returns {number} */
function inverse29(x) {
  assert.notEqual(mod(x), 0);
  for (let candidate = 1; candidate < 29; candidate++)
    if (mod(candidate * x) === 1) return candidate;
  throw new Error('Unreachable: nonzero GF29 element without inverse');
}
/** @param {number[]} x @returns {number} */
function ioc(x) {
  const freq = Array(29).fill(0);
  for (const v of x) freq[v]++;
  return freq.reduce((acc, n) => acc + n * (n - 1), 0) / (x.length * (x.length - 1));
}
/**
 * @param {number[]} ciphertext
 * @param {number[]} sourcePrimes
 * @param {'prime'|'totient'} shift
 * @param {1|-1} sign
 * @param {number[]} skipped True original plaintext-F bypass positions
 * @returns {{plaintext:number[],forbidden:number[],clock:number}}
 */
function decode(ciphertext, sourcePrimes, shift, sign, skipped) {
  const skippedPositions = new Set(skipped);
  const plaintext = [], forbidden = [];
  let clock = 0;
  for (let index = 0; index < ciphertext.length; index++) {
    const c = ciphertext[index];
    if (skippedPositions.has(index)) {
      assert.equal(c, 0, 'A literal plaintext F must encrypt to ciphertext F');
      plaintext.push(0);
      continue;
    }
    const prime = sourcePrimes[clock++];
    const a = mod(prime - 1);
    const b = shift === 'prime' ? prime : prime - 1;
    const p = mod(inverse29(a) * (c - sign * b));
    plaintext.push(p);
    if (p === 0) forbidden.push(index);
  }
  return { plaintext, forbidden, clock };
}
/**
 * The only author-attested F handling, applied to synthetic known GP text.
 * @param {number[]} plaintext
 * @param {number[]} sourcePrimes
 * @param {'prime'|'totient'} shift
 * @param {1|-1} sign
 */
function encrypt(plaintext, sourcePrimes, shift, sign) {
  const ciphertext = [], skipped = [];
  let clock = 0;
  for (const p of plaintext) {
    if (p === 0) {
      skipped.push(ciphertext.length);
      ciphertext.push(0);
      continue;
    }
    const prime = sourcePrimes[clock++];
    const a = mod(prime - 1);
    const b = shift === 'prime' ? prime : prime - 1;
    ciphertext.push(mod(a * p + sign * b));
  }
  return { ciphertext, skipped, clock };
}
const nativePlaintext = book.pages[57].indices.slice(0, 76);
assert.equal(nativePlaintext.length, 76);
const rows = [];
for (const orientation of ['printed', 'reversed']) {
  const primes = orientation === 'printed' ? forward : forward.slice().reverse();
  for (const shift of ['prime', 'totient']) {
    for (const sign of [-1, 1]) {
      const plant = encrypt(nativePlaintext, primes, shift, sign);
      const restored = decode(plant.ciphertext, primes, shift, sign, plant.skipped);
      assert.deepEqual(restored.plaintext, nativePlaintext,
        'Source-native solved-p57 plant must recover all 76 symbols');
      assert.deepEqual(restored.forbidden, []);
      assert.equal(restored.clock, plant.clock);
      let legal = 0, minForbidden = Infinity, maxIoc = 0, best = null;
      for (let mask = 0; mask < 8; mask++) {
        const skip = sourceF.filter((_, bit) => (mask & (1 << bit)) !== 0);
        const result = decode(sourceCipher, primes, shift, sign, skip);
        const illegal = result.forbidden.length;
        if (illegal === 0) legal++;
        if (illegal < minForbidden) minForbidden = illegal;
        const score = ioc(result.plaintext);
        if (score > maxIoc) {
          maxIoc = score;
          best = { mask, skipped: skip, illegal, firstForbidden: result.forbidden[0] ?? null,
            first30: result.plaintext.slice(0, 30).map(index => book.translit[index]).join(' ') };
        }
      }
      assert.equal(legal, 0, 'Every source-frozen affine cipher option must violate the p56 F rule');
      rows.push({ orientation, shift, sign, cases: 8, viable: legal,
        minForbidden, maxIoc, strongestIocOutput: best, nativePlantRecovered: 76 });
    }
  }
}
assert.equal(rows.length, 8);
assert.deepEqual(rows.map(x => x.minForbidden), [2, 4, 1, 1, 1, 5, 2, 2]);

// The original first p55 rune is NG, joined to the last word on p54.
// Treat it as an untouched cross-page carry and independently decode only
// the 75 complete-word body. The 76-rune p05 tape can provide 75 symbols
// by dropping one physical endpoint; both orientations are fixed by source.
assert.equal(sourceCipher[0], 21, 'First p55 rune is NG carried from p54');
const body = sourceCipher.slice(1);
const bodyFs = body.flatMap((v, index) => v === 0 ? [index] : []);
assert.deepEqual(bodyFs, [14, 24, 40]);
const bodyRows = [], bodySurvivors = [];
const model = trainNativeGP(read('resources/control/emerson_essays_2944.txt'));
const p57Score = languageScore(book.pages[57].indices, model);
for (const orientation of ['printed', 'reversed']) {
  const oriented = orientation === 'printed' ? forward : forward.slice().reverse();
  for (const end of ['first75', 'last75']) {
    const key75 = end === 'first75' ? oriented.slice(0, 75) : oriented.slice(1);
    for (const shift of ['prime', 'totient']) {
      for (const sign of [-1, 1]) {
        const plant75 = book.pages[57].indices.slice(0, 75);
        const enc = encrypt(plant75, key75, shift, sign);
        assert.deepEqual(decode(enc.ciphertext, key75, shift, sign, enc.skipped).plaintext, plant75);
        let viableMasks = 0, minForbidden = Infinity;
        for (let mask = 0; mask < 8; mask++) {
          const skip = bodyFs.filter((_, index) => (mask & (1 << index)) !== 0);
          const candidate = decode(body, key75, shift, sign, skip);
          minForbidden = Math.min(minForbidden, candidate.forbidden.length);
          if (candidate.forbidden.length === 0) {
            viableMasks++;
            const nativeScore = languageScore(candidate.plaintext, model);
            bodySurvivors.push({
              orientation, end, shift, sign, mask, skipped: skip, ioc: ioc(candidate.plaintext),
              nativeScore, first30: candidate.plaintext.slice(0, 30).map(i => book.translit[i]).join(' '),
              complete: candidate.plaintext.map(i => book.translit[i]).join(' ')
            });
          }
        }
        bodyRows.push({ orientation, end, shift, sign, viableMasks, minForbidden });
      }
    }
  }
}
assert.equal(bodyRows.length, 16);
assert.equal(bodySurvivors.length, 1, 'Source-literal 75-rune body has one F-valid but nonprose reading');
assert.deepEqual(
  { orientation: bodySurvivors[0].orientation, end: bodySurvivors[0].end,
    shift: bodySurvivors[0].shift, sign: bodySurvivors[0].sign, mask: bodySurvivors[0].mask },
  { orientation: 'reversed', end: 'first75', shift: 'prime', sign: 1, mask: 7 }
);
assert.ok(Math.abs(bodySurvivors[0].ioc - 0.033873873873873875) < 1e-12);
assert.ok(bodySurvivors[0].nativeScore < p57Score - 2,
  'The sole authentic-F-consistent body candidate must be clearly inferior to solved GP text');

console.log(JSON.stringify({
  source: 'Original LP1 p05 written magic-square cells and original LP2 p55',
  originalSourceTapeRunes: forward.length,
  sourceCiphertextRunes: sourceCipher.length,
  originalCiphertextFPositions: sourceF,
  operations: 'C = phi(prime[key_clock])*P +/- (prime or phi(prime)) mod29',
  authenticFRule: 'P=F => C=F and no key consumed',
  originalCandidateCount: rows.length * 8,
  originalViableCompleteCandidates: rows.reduce((s, row) => s + row.viable, 0),
  rows,
  originalBody75CandidateCount: bodyRows.length * 8,
  originalBody75FViable: bodySurvivors.length,
  originalBody75Rows: bodyRows,
  originalBody75Survivors: bodySurvivors,
  p57NativeControlScore: p57Score,
  decision: 'All 64 whole-page decodings structurally contradict the p56 F rule. Exactly one of 128 natural 75-body alignment cases survives that necessary rule, but fails the source-native prose test. No unknown plaintext or key recovered.'
}, null, 2));
