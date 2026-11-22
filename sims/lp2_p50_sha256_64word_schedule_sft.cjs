'use strict';
/**
 * Original p49–51 256 printed base60 bytes as a standard SHA-256 message
 * schedule: 64 32-bit words, the final 48 words determined by initial 16.
 * Source typed hypotheses only: printed row-major big-endian and byte-
 * little-endian words, with no input tuning.
 *
 * Windows Node.js 22:
 *   node sims/lp2_p50_sha256_64word_schedule_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources/liber-primus/base60-grid.json'), 'utf8'));
const bytes = source.rows.flat().map((token) => {
  const hi = source.alphabet.indexOf(token[0]);
  const lo = source.alphabet.indexOf(token[1]);
  assert.equal(token.length, 2);
  assert.ok(hi >= 0 && lo >= 0);
  return hi * 60 + lo;
});
assert.equal(bytes.length, 256);
assert.deepEqual(bytes, source.byte_rows.flat());
assert.ok(bytes.every((x) => Number.isInteger(x) && x >= 0 && x <= 255));

/** @param {number} x @param {number} r */
const rotr = (x, r) => (x >>> r) | (x << (32 - r));
/** @param {number} x */
const small0 = (x) => rotr(x, 7) ^ rotr(x, 18) ^ (x >>> 3);
/** @param {number} x */
const small1 = (x) => rotr(x, 17) ^ rotr(x, 19) ^ (x >>> 10);

/**
 * @param {number[]} first16
 * @returns {number[]} Exact SHA-256 W0..W63 expanded schedule.
 */
function expand(first16) {
  assert.equal(first16.length, 16);
  const words = first16.slice();
  for (let i = 16; i < 64; i++) {
    words.push((small1(words[i - 2]) + words[i - 7] +
      small0(words[i - 15]) + words[i - 16]) >>> 0);
  }
  return words;
}

/**
 * @param {number[]} data
 * @param {boolean} littleEndian
 * @returns {number[]}
 */
function asWords(data, littleEndian) {
  assert.equal(data.length, 256);
  return Array.from({length: 64}, (_, i) => {
    const [a, b, c, d] = data.slice(4 * i, 4 * i + 4);
    return (littleEndian ?
      (d << 24) | (c << 16) | (b << 8) | a :
      (a << 24) | (b << 16) | (c << 8) | d) >>> 0;
  });
}

/**
 * @param {number[]} data
 * @returns {number[]}
 */
function toBytesBE(data) {
  return data.flatMap((x) =>
    [(x >>> 24) & 255, (x >>> 16) & 255, (x >>> 8) & 255, x & 255]);
}

const originalBE = asWords(bytes, false);
const originalLE = asWords(bytes, true);
for (const [name, actual] of [['big-endian', originalBE],
                            ['little-endian', originalLE]]) {
  const predicted = expand(actual.slice(0, 16));
  const matching = actual.flatMap((word, i) =>
    i >= 16 && word === predicted[i] ? [i] : []);
  assert.equal(matching.length, 0);
  console.log(JSON.stringify({
    source: 'p49–51 authentic 256 original printed base60 bytes',
    interpretation: name,
    first64Bytes: 'Original W0..W15',
    untouchedHoldoutWords: 48,
    fullWordMatches: matching.length,
    firstUnseenWord: {position: 16, authentic: actual[16],
      predicted: predicted[16]},
    lastUnseenWord: {position: 63, authentic: actual[63],
      predicted: predicted[63]}
  }));
}

// Positive control with an independently recognizable SHA-256 block: "abc"
// followed by SHA-style 0x80 padding and 64-bit big-endian bit length 24.
const knownBlock = Array(64).fill(0);
knownBlock[0] = 0x61; knownBlock[1] = 0x62; knownBlock[2] = 0x63;
knownBlock[3] = 0x80; knownBlock[63] = 24;
const first16 = Array.from({length: 16}, (_, i) => {
  const [a, b, c, d] = knownBlock.slice(4 * i, 4 * i + 4);
  return ((a << 24) | (b << 16) | (c << 8) | d) >>> 0;
});
const fullPlant = expand(first16);
assert.equal(fullPlant.length, 64);
assert.deepEqual(fullPlant.slice(0, 16), first16);
assert.deepEqual(asWords(toBytesBE(fullPlant), false), fullPlant);
assert.deepEqual(expand(asWords(toBytesBE(fullPlant), false).slice(0, 16)),
  fullPlant);
assert.equal(fullPlant[0], 0x61626380);
assert.equal(fullPlant[16], 0x61626380, 'Known SHA-256 abc W16 value');
assert.equal(fullPlant[17], 0x000f0000, 'Known SHA-256 abc W17 value');
console.log('PASS: SHA-256 abc source-block schedule 48/48 positive; ' +
  'original big-endian and little-endian schedule 0/48 each.');
