'use strict';
/**
 * Source-led p05 square -> p55 25-period Euler-totient key test.
 *
 * Fixed hypothesis:
 *   key[i] = phi(p05_square_cell[i]) mod 29, printed row-major;
 *   repeat the 25-key over p55's 75 complete-word runes;
 *   decrypt by subtraction mod29.
 *
 * The solved-p56 literal-F exception is implemented correctly: it
 * triggers only when both the ciphertext and current key symbol are F/0.
 * No phase, offset, square rotation, key permutation or score-tuned
 * parameter is used.
 *
 * Run: node sims/p55_wisdom_totient25_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { plaintextWords } = require('./authentic_decryption_regression.cjs');
const { trainNativeGP, languageScore } = require('./historical_solve_path_transfer.cjs');

const ROOT = path.resolve(__dirname, '..');
const P = 29;
const SOURCE_WISDOM_1033 = [
  [272, 138, 341, 131, 151],
  [366, 199, 130, 320, 18],
  [226, 245, 91, 245, 226],
  [18, 320, 130, 199, 366],
  [151, 131, 341, 138, 272]
];
const WORD_LENGTHS = [4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
const EXPECTED_KEY = [
  12, 15, 10, 14, 5, 4, 24, 19, 12, 6, 25, 23, 14,
  23, 25, 6, 12, 19, 24, 4, 5, 14, 10, 15, 12
];
const EXPECTED_WORDS = [
  'PRFOE', 'IP', 'MF', 'OGIFBTH', 'RNGEOIAIY', 'THM',
  'WPBTHANTFNPTHHG', 'DNGNRBD', 'CEBU', 'WR', 'EOIADEAAEU',
  'PJBEOMEOM', 'HH', 'JORWSM', 'MGT', 'WOIA'
];

function mod29(value) { return (value % P + P) % P; }

/** Exact integer Euler totient. */
function phi(value) {
  let n = value;
  let result = value;
  for (let factor = 2; factor * factor <= n; factor++) {
    if (n % factor === 0) {
      while (n % factor === 0) n /= factor;
      result -= result / factor;
    }
  }
  if (n > 1) result -= result / n;
  return result;
}

/** @param {number[]} values @param {number[]} key */
function decode(values, key) {
  let consumed = 0;
  const plaintext = values.map(cipher => {
    const currentKey = key[consumed % key.length];
    if (cipher === 0 && currentKey === 0) return 0;
    const result = mod29(cipher - currentKey);
    consumed++;
    return result;
  });
  return { plaintext, consumed };
}

/** @param {number[]} values @param {number[]} key */
function encode(values, key) {
  let consumed = 0;
  return values.map(plain => {
    const currentKey = key[consumed % key.length];
    if (plain === 0 && currentKey === 0) return 0;
    const result = mod29(plain + currentKey);
    consumed++;
    return result;
  });
}

/** @param {number[]} values @param {string[]} translit */
function wordDisplay(values, translit) {
  let start = 0;
  return WORD_LENGTHS.map(length => {
    const word = values.slice(start, start + length)
      .map(index => translit[index]).join('');
    start += length;
    return word;
  });
}

/** @param {number[]} values */
function digest(values) {
  return crypto.createHash('sha256').update(Buffer.from(values)).digest('hex');
}

function run() {
  const corpus = JSON.parse(fs.readFileSync(
    path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
  const page55 = corpus.pages.find(page => page.page === 55);
  assert.ok(page55, 'canonical physical p55 must exist');
  const original76 = page55.indices;
  assert.equal(original76.length, 76);
  assert.equal(original76[0], 21,
    'first p55 rune is the inherited NG completing the p54 word');
  assert.equal(WORD_LENGTHS.reduce((sum, value) => sum + value, 0), 75);
  const original75 = original76.slice(1);

  const cells = SOURCE_WISDOM_1033.flat();
  assert.equal(cells.length, 25);
  const phiValues = cells.map(phi);
  const key = phiValues.map(mod29);
  assert.deepEqual(key, EXPECTED_KEY);
  assert.ok(key.every(value => value !== 0),
    'the fixed p05-cell totient key contains no F/0 symbol');
  const transparentFPositions = original75.flatMap((cipher, i) =>
    cipher === 0 && key[i % key.length] === 0 ? [i] : []);
  assert.deepEqual(transparentFPositions, []);
  const rawWords = wordDisplay(original75, corpus.translit);

  const decoded = decode(original75, key);
  assert.equal(decoded.consumed, 75);
  assert.deepEqual(encode(decoded.plaintext, key), original75);
  assert.deepEqual([original76[0], ...encode(decoded.plaintext, key)], original76);
  const decodedWords = wordDisplay(decoded.plaintext, corpus.translit);
  assert.deepEqual(decodedWords, EXPECTED_WORDS);

  const nativeText = fs.readFileSync(
    path.join(ROOT, 'resources/liber-primus/lp1-plaintext-reference.txt'), 'utf8')
    .replace(/^#.*$/gm, '');
  const native = plaintextWords(nativeText).flat();
  const model = trainNativeGP(fs.readFileSync(
    path.join(ROOT, 'resources/control/gibran_prophet_58585.txt'), 'utf8'));
  const nativeScores = [];
  for (let start = 0; start + 75 <= native.length; start += 23) {
    nativeScores.push(languageScore(native.slice(start, start + 75), model));
  }
  assert.equal(nativeScores.length, 151);
  const nativeMinimum = Math.min(...nativeScores);
  const nativeMedian = [...nativeScores].sort((a, b) => a - b)[75];
  const nativeMaximum = Math.max(...nativeScores);
  const rawScore = languageScore(original75, model);
  const decodedScore = languageScore(decoded.plaintext, model);
  assert.ok(decodedScore < nativeMinimum);

  const plant = native.slice(400, 475);
  assert.equal(plant.length, 75);
  const plantedCipher = encode(plant, key);
  assert.deepEqual(decode(plantedCipher, key).plaintext, plant);

  return {
    classification: 'Bounded negative: direct p05-cell totient key on original p55 body',
    source: {
      squareCellsRowMajor: cells,
      phiValues: phiValues,
      keyModulo29: key,
      keyPeriod: 25,
      p55PageLocalRunes: original76.length,
      inheritedP54RuneIndex: original76[0],
      p55CompleteWordRunes: original75.length,
      wordLengths: WORD_LENGTHS,
      rawWordDisplay: rawWords
    },
    original75IndexSHA256: digest(original75),
    rawScore,
    nativeControls: {
      windows: nativeScores.length,
      stride: 23,
      minimum: nativeMinimum,
      median: nativeMedian,
      maximum: nativeMaximum
    },
    correctLiteralFRule: {
      keyHasZero: key.includes(0),
      transparentFPositions,
      keySymbolsConsumed: decoded.consumed
    },
    decoded: {
      decodedIndexSHA256: digest(decoded.plaintext),
      score: decodedScore,
      decodedWords,
      exactForwardReencoding: true,
      belowEveryNativeControl: true
    },
    positivePlant: {
      source: '75-rune LP1 native plaintext window at offset 400',
      exactRecoveryUnderCorrectLiteralFRule: true
    },
    limitation: 'A bijective additive key roundtrip is only an implementation invariant. The correct p56 literal-F exception is inactive because every p05-cell totient key symbol is nonzero. The p55 moth also occurs on p53; no source explicitly says to apply phi to each p05 square cell or repeat the key. No unknown plaintext or authentic key is recovered.'
  };
}

if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = { run, phi, decode, encode };
