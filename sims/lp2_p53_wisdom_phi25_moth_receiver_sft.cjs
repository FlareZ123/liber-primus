'use strict';
/**
 * LP1 p05 moth-associated Wisdom-square phi(cell) key on a distinct LP2 moth receiver, p53.
 * Director issue #2346. This is ONE frozen original-source transfer, not a parameter sweep.
 * Run: node sims/lp2_p53_wisdom_phi25_moth_receiver_sft.cjs
 *
 * The printed physical p53 page is image 70.jpg. The canonical p53 runes occupy 179 positions,
 * 128 black followed by 51 red; no symbol is dropped or clock-reset at the ink transition.
 * The LP1 p05 moth and 5x5 square were authored before p53; their hypothesized cipher role
 * remains unproven. LP2 p55 has already failed this exact phase-zero key.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { decode, encode, phi } = require('./p55_wisdom_totient25_sft.cjs');
const { plaintextWords } = require('./authentic_decryption_regression.cjs');
const { trainNativeGP, languageScore } = require('./historical_solve_path_transfer.cjs');

const ROOT = path.resolve(__dirname, '..');
const SQUARE = [
  272, 138, 341, 131, 151,
  366, 199, 130, 320, 18,
  226, 245, 91, 245, 226,
  18, 320, 130, 199, 366,
  151, 131, 341, 138, 272
];
const KEY = [12, 15, 10, 14, 5, 4, 24, 19, 12, 6, 25, 23, 14,
  23, 25, 6, 12, 19, 24, 4, 5, 14, 10, 15, 12];

/** @param {number[]} values */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, number) => sum + number * (number - 1), 0) /
    (values.length * (values.length - 1));
}

/** @param {number[]} values */
function sha256(values) {
  return crypto.createHash('sha256').update(Buffer.from(values)).digest('hex');
}

/** @param {string} source @param {number[]} indices @param {string[]} runes @param {string[]} translit */
function preserveLayout(source, indices, runes, translit) {
  const index = new Map(runes.map((rune, i) => [rune, i]));
  let position = 0;
  const result = source.replace(/\p{Script=Runic}/gu, rune => {
    assert.equal(index.get(rune), indices[position], 'source transcript must match canonical GP29 rune');
    return translit[indices[position++]];
  });
  assert.equal(position, indices.length);
  return result;
}

function run() {
  const corpus = JSON.parse(fs.readFileSync(
    path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
  const page = corpus.pages.find(entry => entry.page === 53);
  assert.ok(page);
  const original = page.indices;
  assert.equal(original.length, 179);
  const reference = fs.readFileSync(
    path.join(ROOT, 'resources/liber-primus/lp2-transcription.txt'), 'utf8')
    .split('%')[52]; // physical p53: p50 is numeric and has no rune-transcript segment.
  const originalLayout = preserveLayout(reference, original, corpus.runes, corpus.translit);

  const key = SQUARE.map(value => phi(value) % 29);
  assert.deepEqual(key, KEY);
  assert.ok(key.every(value => value !== 0));
  const { plaintext, consumed } = decode(original, key);
  assert.equal(consumed, 179);
  assert.deepEqual(encode(plaintext, key), original);
  const outputLayout = preserveLayout(reference, plaintext, corpus.runes, corpus.translit);
  assert.equal(plaintext.length, 179);

  const nativeReference = fs.readFileSync(
    path.join(ROOT, 'resources/liber-primus/lp1-plaintext-reference.txt'), 'utf8')
    .replace(/^#.*$/gm, '');
  const solvedNative = plaintextWords(nativeReference).flat();
  const model = trainNativeGP(fs.readFileSync(
    path.join(ROOT, 'resources/control/gibran_prophet_58585.txt'), 'utf8'));
  const nativeScores = [];
  const nativeIocs = [];
  for (let start = 0; start + 179 <= solvedNative.length; start += 23) {
    const control = solvedNative.slice(start, start + 179);
    nativeScores.push(languageScore(control, model));
    nativeIocs.push(ioc(control));
  }
  assert.ok(nativeScores.length >= 100);
  const rawScore = languageScore(original, model);
  const decodedScore = languageScore(plaintext, model);
  const nativeMin = Math.min(...nativeScores);
  assert.ok(decodedScore < nativeMin, 'decoded page fails solved-native GP language control');
  assert.ok(ioc(plaintext) < Math.min(...nativeIocs),
    'decoded page fails every solved-native GP IoC control');

  const nativePlant = solvedNative.slice(400, 579);
  assert.equal(nativePlant.length, 179);
  assert.deepEqual(decode(encode(nativePlant, key), key).plaintext, nativePlant);

  return {
    classification: 'Bounded negative: single frozen LP1 p05 phi-square transfer to original LP2 p53',
    source: {
      physicalPage: 53,
      originalScan: 'resources/liber-primus/70.jpg',
      mothSource: 'resources/liber-primus/05.jpg',
      square: SQUARE, key,
      keyPeriod: 25,
      fullRuneCount: original.length,
      redSuffixRunes: 51,
      literalFBypassSites: [],
      clockConsumed: consumed,
      sourceSHA256: sha256(original),
      inverseSHA256: sha256(plaintext)
    },
    decoded: {
      iocOriginal: ioc(original),
      iocInverse: ioc(plaintext),
      sourceNativeLanguageScore: rawScore,
      inverseNativeLanguageScore: decodedScore,
      minSolvedNativeLanguageScore: nativeMin,
      minSolvedNativeIoc: Math.min(...nativeIocs),
      originalLayout,
      outputLayout,
      exactReencryption: true
    },
    controls: {
      authenticSolvedLP1WindowCount: nativeScores.length,
      sourceSolvedPlant: 'LP1 solved 179-rune register starting at 400',
      sourceSolvedPlantExact: true
    },
    decision: 'No recovered plaintext. Retire this exact unshifted 25-period phi-of-Wisdom-cell key on both original moth pages p53 and p55; no further clock or sign search.'
  };
}

if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = { run };
