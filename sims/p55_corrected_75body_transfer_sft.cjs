#!/usr/bin/env node
'use strict';
/**
 * Corrected p55 body source-transfer gates.
 *
 * The 76 page-local segments include an incoming p54 NG carry at index 0.
 * The physical p55 body is p55[1:] (75 runes, 16 words). This script tests
 * only two fixed candidates on that body:
 *   1. LP1 p5 Wisdom 5x5 row-major phi(cell) mod29, period 25, subtraction.
 *   2. Solved-p56 phi(prime_j) mod29 transfer, with one candidate F skip at
 *      p55 body index 24 (page-local index 25).
 *
 * No key, phase, orientation, skip, or language-score search is performed.
 * Run: node sims/p55_corrected_75body_transfer_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { plaintextWords } = require('./authentic_decryption_regression.cjs');
const { trainNativeGP, languageScore } = require('./historical_solve_path_transfer.cjs');

const ROOT = path.resolve(__dirname, '..');
const MODULUS = 29;
const WORD_LENGTHS = [4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
const PAGE56_ENGLISH =
  'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EVERY PILGRIM TO SEEK OUT THIS PAGE';
const PAGE56_NORMALIZED =
  'ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE';
const PAGE56_SPECIAL_F = 56;
const P55_SPECIAL_F_BODY_INDEX = 24;
const WISDOM_1033 = [
  [272, 138, 341, 131, 151],
  [366, 199, 130, 320, 18],
  [226, 245, 91, 245, 226],
  [18, 320, 130, 199, 366],
  [151, 131, 341, 138, 272]
];
const WRONG_3301 = [
  [434, 1311, 312, 278, 966],
  [204, 812, 934, 280, 1071],
  [626, 620, 809, 620, 626],
  [1071, 280, 934, 812, 204],
  [966, 278, 312, 1311, 434]
];

function mod(value) {
  return (value % MODULUS + MODULUS) % MODULUS;
}
function phi(value) {
  let remainder = value;
  let result = value;
  for (let prime = 2; prime * prime <= remainder; prime++) {
    if (remainder % prime !== 0) continue;
    while (remainder % prime === 0) remainder /= prime;
    result = result / prime * (prime - 1);
  }
  if (remainder > 1) result = result / remainder * (remainder - 1);
  return result;
}
function primeTotientStream(count) {
  const values = [];
  for (let candidate = 2; values.length < count; candidate++) {
    let isPrime = true;
    for (let divisor = 2; divisor * divisor <= candidate; divisor++) {
      if (candidate % divisor === 0) { isPrime = false; break; }
    }
    if (isPrime) values.push(mod(candidate - 1));
  }
  return values;
}
function applyPrime(input, skipAt, sign, key) {
  let clock = 0;
  const output = input.map((rune, index) => {
    if (index === skipAt) return rune;
    assert.ok(clock < key.length, 'prime key stream exhausted');
    return mod(rune + sign * key[clock++]);
  });
  return { output, consumed: clock };
}
function indexOfCoincidence(values) {
  const counts = new Uint32Array(MODULUS);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (values.length * (values.length - 1));
}
function transliterate(values, alphabet) {
  return values.map(index => alphabet[index]).join('');
}
function displayWords(values, alphabet) {
  let offset = 0;
  return WORD_LENGTHS.map(length => {
    const word = transliterate(values.slice(offset, offset + length), alphabet);
    offset += length;
    return word;
  });
}
function applyCell(values, key, sign) {
  return values.map((value, index) => mod(value + sign * key[index % 25]));
}
function run() {
  const corpus = JSON.parse(fs.readFileSync(
    path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
  const lookup = page => corpus.pages.find(entry => entry.page === page).indices;
  const p55PageLocal = lookup(55);
  assert.equal(p55PageLocal.length, 76);
  assert.equal(p55PageLocal[0], 21, 'p55[0] is inherited p54 NG');
  const body = p55PageLocal.slice(1);
  assert.equal(body.length, 75);
  assert.equal(WORD_LENGTHS.reduce((sum, length) => sum + length, 0), 75);
  const fPositions = body.flatMap((rune, index) => rune === 0 ? [index] : []);
  assert.deepEqual(fPositions, [14, 24, 40]);
  assert.equal(body[P55_SPECIAL_F_BODY_INDEX], 0);

  const cellKey = WISDOM_1033.flat().map(value => mod(phi(value)));
  assert.deepEqual(cellKey, [
    12, 15, 10, 14, 5, 4, 24, 19, 12, 6, 25, 23, 14,
    23, 25, 6, 12, 19, 24, 4, 5, 14, 10, 15, 12
  ]);
  const cellDecoded = applyCell(body, cellKey, -1);
  assert.deepEqual(applyCell(cellDecoded, cellKey, +1), body);

  const primeKey = primeTotientStream(85);
  const p55Prime = applyPrime(body, P55_SPECIAL_F_BODY_INDEX, -1, primeKey);
  assert.equal(p55Prime.consumed, 74);
  assert.deepEqual(
    applyPrime(p55Prime.output, P55_SPECIAL_F_BODY_INDEX, +1, primeKey).output,
    body
  );

  const p56Cipher = lookup(56);
  const p56Plain = plaintextWords(PAGE56_ENGLISH).flat();
  assert.equal(p56Cipher.length, 85);
  assert.equal(p56Plain.length, 85);
  const p56Decoded = applyPrime(p56Cipher, PAGE56_SPECIAL_F, -1, primeKey);
  assert.equal(p56Decoded.consumed, 84);
  assert.deepEqual(p56Decoded.output, p56Plain);
  assert.equal(transliterate(p56Decoded.output, corpus.translit), PAGE56_NORMALIZED);
  assert.deepEqual(
    applyPrime(p56Decoded.output, PAGE56_SPECIAL_F, +1, primeKey).output,
    p56Cipher
  );

  const gibran = fs.readFileSync(
    path.join(ROOT, 'resources/control/gibran_prophet_58585.txt'), 'utf8');
  const model = trainNativeGP(gibran);
  const nativeText = fs.readFileSync(
    path.join(ROOT, 'resources/liber-primus/lp1-plaintext-reference.txt'), 'utf8'
  ).replace(/^#.*$/gm, '');
  const native = plaintextWords(nativeText).flat();
  const nativeScores = [];
  const nativeIoCs75 = [];
  const nativeIoCs76 = [];
  const overlappingIoCs75 = [];
  const overlappingIoCs76 = [];
  for (let start = 0; start + 76 <= native.length; start += 23) {
    const window75 = native.slice(start, start + 75);
    const window76 = native.slice(start, start + 76);
    nativeScores.push(languageScore(window75, model));
    nativeIoCs75.push(indexOfCoincidence(window75));
    nativeIoCs76.push(indexOfCoincidence(window76));
  }
  for (let start = 0; start + 75 <= native.length; start++) {
    overlappingIoCs75.push(indexOfCoincidence(native.slice(start, start + 75)));
  }
  for (let start = 0; start + 76 <= native.length; start++) {
    overlappingIoCs76.push(indexOfCoincidence(native.slice(start, start + 76)));
  }
  const nativeSorted = [...nativeScores].sort((a, b) => a - b);
  const nativeIoC75Sorted = [...nativeIoCs75].sort((a, b) => a - b);
  const nativeIoC76Sorted = [...nativeIoCs76].sort((a, b) => a - b);
  const overlappingIoC75Sorted = [...overlappingIoCs75].sort((a, b) => a - b);
  const overlappingIoC76Sorted = [...overlappingIoCs76].sort((a, b) => a - b);
  const bodyIoC = indexOfCoincidence(body);
  const pageLocalIoC = indexOfCoincidence(p55PageLocal);
  assert.ok(Math.min(...nativeIoCs75) > bodyIoC);
  assert.ok(Math.min(...overlappingIoCs75) > bodyIoC);
  assert.ok(Math.min(...nativeIoCs76) > pageLocalIoC);
  assert.ok(Math.min(...overlappingIoCs76) > pageLocalIoC);
  const nativeMinimum = Math.min(...nativeScores);
  const nativeMedian = nativeSorted[Math.floor(nativeSorted.length / 2)];
  const nativeMaximum = Math.max(...nativeScores);
  const cellScore = languageScore(cellDecoded, model);
  const primeScore = languageScore(p55Prime.output, model);
  assert.ok(cellScore < nativeMinimum);
  assert.ok(primeScore < nativeMinimum);

  const wrongKey = WRONG_3301.flat().map(value => mod(phi(value)));
  const wrongDecoded = applyCell(body, wrongKey, -1);
  const plant = native.slice(400, 475);
  assert.equal(plant.length, 75);
  assert.deepEqual(applyCell(applyCell(plant, cellKey, +1), cellKey, -1), plant);
  const primePlant = plant.map((rune, index) =>
    index === P55_SPECIAL_F_BODY_INDEX ? 0 : rune);
  const primePlantEncoded = applyPrime(
    primePlant, P55_SPECIAL_F_BODY_INDEX, +1, primeKey
  );
  const primePlantDecoded = applyPrime(
    primePlantEncoded.output, P55_SPECIAL_F_BODY_INDEX, -1, primeKey
  );
  assert.deepEqual(primePlantDecoded.output, primePlant);

  return {
    classification: 'Corrected p55 75-body source-transfer gates: both fixed candidates negative',
    segmentation: {
      pageLocalRuneSegments: p55PageLocal.length,
      inheritedP54RuneIndex: p55PageLocal[0],
      inheritedP54Rune: corpus.translit[p55PageLocal[0]],
      actualP55BodyRunes: body.length,
      bodyWordCount: WORD_LENGTHS.length,
      bodyWordLengths: WORD_LENGTHS,
      bodyFPositions: fPositions
    },
    nativeModel: {
      reference: 'Gibran Prophet GP29 trigrams',
      nativeWindows: nativeScores.length,
      minimum: nativeMinimum,
      median: nativeMedian,
      maximum: nativeMaximum
    },
    frequencyPreservingFamilyInvariant: {
      pageLocal76: {
        ioC: pageLocalIoC,
        stride23Windows: nativeIoCs76.length,
        stride23Minimum: nativeIoC76Sorted[0],
        stride23Median: nativeIoC76Sorted[Math.floor(nativeIoC76Sorted.length / 2)],
        stride23Maximum: nativeIoC76Sorted[nativeIoC76Sorted.length - 1],
        overlappingWindows: overlappingIoCs76.length,
        overlappingMinimum: overlappingIoC76Sorted[0],
        overlappingP01: overlappingIoC76Sorted[Math.floor(overlappingIoC76Sorted.length * 0.01)],
        overlappingP05: overlappingIoC76Sorted[Math.floor(overlappingIoC76Sorted.length * 0.05)],
        overlappingMedian: overlappingIoC76Sorted[Math.floor(overlappingIoC76Sorted.length / 2)],
        overlappingMaximum: overlappingIoC76Sorted[overlappingIoC76Sorted.length - 1],
        atOrBelowStride23: nativeIoCs76.filter(value => value <= pageLocalIoC).length,
        atOrBelowOverlapping: overlappingIoCs76.filter(value => value <= pageLocalIoC).length
      },
      body75: {
        ioC: bodyIoC,
        stride23Windows: nativeIoCs75.length,
        stride23Minimum: nativeIoC75Sorted[0],
        stride23Median: nativeIoC75Sorted[Math.floor(nativeIoC75Sorted.length / 2)],
        stride23Maximum: nativeIoC75Sorted[nativeIoC75Sorted.length - 1],
        overlappingWindows: overlappingIoCs75.length,
        overlappingMinimum: overlappingIoC75Sorted[0],
        overlappingP01: overlappingIoC75Sorted[Math.floor(overlappingIoCs75.length * 0.01)],
        overlappingP05: overlappingIoC75Sorted[Math.floor(overlappingIoCs75.length * 0.05)],
        overlappingMedian: overlappingIoC75Sorted[Math.floor(overlappingIoCs75.length / 2)],
        overlappingMaximum: overlappingIoC75Sorted[overlappingIoCs75.length - 1],
        atOrBelowStride23: nativeIoCs75.filter(value => value <= bodyIoC).length,
        atOrBelowOverlapping: overlappingIoCs75.filter(value => value <= bodyIoC).length
      },
      conclusion: 'Neither complete input can yield native-GP English through a fixed bijective monoalphabetic substitution, pure transposition, or their composition.'
    },

    wisdomSquarePhiCell: {
      key: cellKey,
      period: 25,
      rawBodyIoC: bodyIoC,
      decodedIoC: indexOfCoincidence(cellDecoded),
      rawBodyScore: languageScore(body, model),
      decodedScore: cellScore,
      wrong3301SquareScore: languageScore(wrongDecoded, model),
      output: transliterate(cellDecoded, corpus.translit),
      words: displayWords(cellDecoded, corpus.translit),
      forwardReconstruction: true,
      solvedNativePositivePlant: true
    },
    solvedP56PrimeTotientTransfer: {
      operation: 'subtract phi(prime_j) mod29; start prime2; skip only the fixed p55 body F at index24',
      skippedBodyIndex: P55_SPECIAL_F_BODY_INDEX,
      otherBodyFPositionsProcessed: [14, 40],
      consumedPrimeKeys: p55Prime.consumed,
      rawBodyScore: languageScore(body, model),
      decodedScore: primeScore,
      decodedIoC: indexOfCoincidence(p55Prime.output),
      output: transliterate(p55Prime.output, corpus.translit),
      words: displayWords(p55Prime.output, corpus.translit),
      forwardReconstruction: true,
      solvedP56Control: true,
      solvedNativePositivePlant: true,
      p56ControlPlaintext: transliterate(p56Decoded.output, corpus.translit)
    },
    sourceLimitation: 'The LP1 p5 moth also appears on LP2 p53. Neither the artwork nor the 75=3x25 body length selects a p55 cipher, key clock, or cross-page transfer.'
  };
}
if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = { run, applyCell, applyPrime };
