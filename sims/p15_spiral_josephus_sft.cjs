'use strict';
/**
 * Single runnable test (SFT) of original LP2 p15's frozen 16-cell clockwise
 * Fibonacci-prime spiral as a Josephus read order over physical pp15-22.
 * 
 * Run: node sims/p15_spiral_josephus_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { plaintextWords } = require('./authentic_decryption_regression.cjs');
const { trainNativeGP, languageScore } = require('./historical_solve_path_transfer.cjs');

const ROOT = path.join(__dirname, '..');
const SOURCE_SPIRAL = [
  3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222,
  3152, 3038, 2838, 2472, 1820, 708, 1206, 4516
];

/** @param {number} length @param {number[]} steps @returns {number[]} */
function josephusReadOrder(length, steps) {
  assert.ok(Number.isInteger(length) && length > 0);
  assert.ok(steps.length > 0 && steps.every(x => Number.isSafeInteger(x) && x > 0));
  const remaining = Array.from({ length }, (_, i) => i);
  const result = [];
  let cursor = 0;
  for (let i = 0; i < length; i++) {
    cursor = (cursor + steps[i % steps.length] - 1) % remaining.length;
    result.push(remaining.splice(cursor, 1)[0]);
    if (cursor === remaining.length) cursor = 0;
  }
  return result;
}

/** @param {number[]} source @param {number[]} order @returns {number[]} */
function readInOrder(source, order) {
  assert.equal(source.length, order.length);
  return order.map(index => source[index]);
}
/** @param {number[]} source @param {number[]} order @returns {number[]} */
function writeInOrder(source, order) {
  assert.equal(source.length, order.length);
  const result = new Array(source.length);
  order.forEach((index, i) => { result[index] = source[i]; });
  return result;
}
/** @param {number[]} values @returns {string} */
function gpIndexSha256(values) {
  return crypto.createHash('sha256').update(Buffer.from(values)).digest('hex');
}
/** @param {number[]} symbols @returns {number} */
function indexOfCoincidence(symbols) {
  const counts = new Uint32Array(29);
  for (const symbol of symbols) counts[symbol]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (symbols.length * (symbols.length - 1));
}

/** @returns {object} */
function run() {
  const corpus = JSON.parse(fs.readFileSync(
    path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
  const physicalPages = corpus.pages.filter(page => page.page >= 15 && page.page <= 22);
  assert.deepEqual(physicalPages.map(page => page.runic_count),
    [159, 267, 273, 260, 271, 269, 273, 131]);
  const original = physicalPages.flatMap(page => page.indices);
  assert.equal(original.length, 1903);

  const order = josephusReadOrder(original.length, SOURCE_SPIRAL);
  assert.equal(new Set(order).size, original.length);
  const decoded = readInOrder(original, order);
  assert.deepEqual(writeInOrder(decoded, order), original,
    'All 1,903 original positions must round-trip without a fitted key');

  const reverseSpiralControl = readInOrder(original,
    josephusReadOrder(original.length, [...SOURCE_SPIRAL].reverse()));

  // Model is trained on Gibran. Every language control and the complete
  // plaintext plant are independent editor-normalized solved-Cicada prose.
  const model = trainNativeGP(fs.readFileSync(
    path.join(ROOT, 'resources/control/gibran_prophet_58585.txt'), 'utf8'));
  const nativeReference = fs.readFileSync(
    path.join(ROOT, 'resources/liber-primus/lp1-plaintext-reference.txt'), 'utf8')
    .replace(/^#.*$/gm, '');
  const native = plaintextWords(nativeReference).flat();
  assert.ok(native.length >= original.length + 101);
  const nativeScores = [];
  for (let start = 0; start + original.length <= native.length; start += 101) {
    nativeScores.push(languageScore(native.slice(start, start + original.length), model));
  }
  assert.ok(nativeScores.length >= 10);

  const plantedPlaintext = native.slice(500, 500 + original.length);
  const plantedCiphertext = writeInOrder(plantedPlaintext, order);
  assert.deepEqual(readInOrder(plantedCiphertext, order), plantedPlaintext);
  assert.deepEqual(writeInOrder(readInOrder(plantedCiphertext, order), order),
    plantedCiphertext);
  assert.deepEqual([...order].sort((a, b) => a - b),
    Array.from({ length: original.length }, (_, i) => i));
  assert.equal(indexOfCoincidence(original), indexOfCoincidence(decoded),
    'Pure transposition preserves the exact rune histogram');

  const rawScore = languageScore(original, model);
  const proposedScore = languageScore(decoded, model);
  const reverseScore = languageScore(reverseSpiralControl, model);
  const nativeMinimum = Math.min(...nativeScores);
  assert.ok(rawScore < nativeMinimum && proposedScore < nativeMinimum,
    'Original and Josephus output are each below every native matched-length window');

  return {
    classification: 'Bounded negative of the fixed source spiral Josephus readout; no unknown plaintext or key',
    pages: physicalPages.map(page => page.page),
    runeCount: original.length,
    sourceSpiral: SOURCE_SPIRAL,
    originalCipherSha256: gpIndexSha256(original),
    decodedSha256: gpIndexSha256(decoded),
    sourceReadPositionsFirst40: order.slice(0, 40),
    sourceIoc: indexOfCoincidence(original),
    decodedIoc: indexOfCoincidence(decoded),
    GibranModel: {
      trainedOn: 'resources/control/gibran_prophet_58585.txt',
      control: 'independent editor-normalized solved Cicada LP1 prose',
      originalScore: rawScore,
      josephusScore: proposedScore,
      reverseSpiralControlScore: reverseScore,
      nativeWindows: nativeScores.length,
      nativeMinimum,
      nativeMedian: [...nativeScores].sort((a, b) => a - b)[Math.floor(nativeScores.length / 2)],
      nativeMaximum: Math.max(...nativeScores),
      nativePositivePlaintextScore: languageScore(plantedPlaintext, model)
    },
    first200DecodedGP: decoded.slice(0, 200).map(i => corpus.translit[i]).join(''),
    originalFullPositionRoundtrip: true,
    sourceNativePlantRoundtrip: true,
    interpretationLimit: 'No independent source prescribes Josephus or restores post-transposition printed word boundaries.'
  };
}
if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = { run, josephusReadOrder, readInOrder, writeInOrder };
