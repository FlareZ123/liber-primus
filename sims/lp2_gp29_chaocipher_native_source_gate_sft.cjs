'use strict';

/**
 * Original GP29 source gate for a literal 29-symbol Chaocipher generalization.
 * Historical 26-letter reference: Moshe Rubin, "Chaocipher Revealed:
 * The Algorithm" (2010), tested against the standard 28-character vector.
 * The GP29 13/14/15 nadir choices are research adaptations, not Cicada clues.
 * Read only, Windows Node.js 22, no dependencies, fixed xorshift32 seed.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const original = corpus.pages.filter((p) => p.page <= 55)
  .flatMap((p) => p.indices);
const p57 = corpus.pages.find((p) => p.page === 57).indices;
assert.equal(original.length, 12956);
assert.equal(p57.length, 95);

/** @param {number[]} a */
function repeatCount(a) {
  let n = 0;
  for (let i = 1; i < a.length; i++) if (a[i] === a[i - 1]) n++;
  return n;
}

/** @param {number[]} a @param {number} by */
function rotateLeft(a, by) {
  return a.slice(by).concat(a.slice(0, by));
}

/**
 * Bijective moving two-alphabet Chaocipher, with source-parametrized nadir.
 * @param {number[]} input
 * @param {number[]} initialLeft
 * @param {number[]} initialRight
 * @param {number} nadir 0-based insertion index
 * @param {'encrypt'|'decrypt'} mode
 * @returns {number[]}
 */
function chaocipher(input, initialLeft, initialRight, nadir, mode) {
  const left = initialLeft.slice();
  const right = initialRight.slice();
  const output = [];
  for (const value of input) {
    const index = mode === 'encrypt'
      ? right.indexOf(value) : left.indexOf(value);
    assert(index >= 0);
    output.push(mode === 'encrypt' ? left[index] : right[index]);
    const l = rotateLeft(left, index);
    const r = rotateLeft(right, index + 1);
    l.splice(nadir, 0, l.splice(1, 1)[0]);
    r.splice(nadir, 0, r.splice(2, 1)[0]);
    left.splice(0, left.length, ...l);
    right.splice(0, right.length, ...r);
  }
  return output;
}

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
/** @param {string} s */
const toIndex = (s) => [...s].map((c) => alphabet.indexOf(c));
/** @param {number[]} a */
const toLetters = (a) => a.map((i) => alphabet[i]).join('');
const standardLeft = toIndex('HXUCZVAMDSLKPEFJRIGTWOBNYQ');
const standardRight = toIndex('PTLNBQDEOYSFAVZKGJRIHWXUMC');
const standardPlain = toIndex('WELLDONEISBETTERTHANWELLSAID');
const standardCipher = toIndex('OAHQHCNYNXTSZJRRHJBYHQKSOUJY');
assert.equal(toLetters(chaocipher(standardPlain,
  standardLeft, standardRight, 13, 'encrypt')),
  toLetters(standardCipher));
assert.deepEqual(chaocipher(standardCipher,
  standardLeft, standardRight, 13, 'decrypt'), standardPlain);

let randomState = 3301;
/** @returns {number} */
function nextRandom() {
  randomState ^= randomState << 13;
  randomState ^= randomState >>> 17;
  randomState ^= randomState << 5;
  return randomState >>> 0;
}
/** @returns {number[]} */
function randomAlphabet() {
  const a = Array.from({ length: 29 }, (_, i) => i);
  for (let i = 28; i > 0; i--) {
    const j = nextRandom() % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const plain = Array.from({ length: original.length },
  (_, i) => p57[i % p57.length]);
assert.equal(repeatCount(original), 86);
assert.equal(repeatCount(plain), 137);
const results = [];
for (const nadir of [13, 14, 15]) {
  const counts = [];
  for (let trial = 0; trial < 48; trial++) {
    const left = randomAlphabet();
    const right = randomAlphabet();
    const crypt = chaocipher(plain, left, right, nadir, 'encrypt');
    assert.equal(crypt.length, original.length);
    // Each key exactly recovers the whole 12,956-symbol known plaintext.
    assert.deepEqual(chaocipher(crypt, left, right, nadir,
      'decrypt'), plain);
    counts.push(repeatCount(crypt));
  }
  results.push({
    nadir,
    trials: counts.length,
    minimum: Math.min(...counts),
    maximum: Math.max(...counts),
    mean: counts.reduce((sum, n) => sum + n, 0) / counts.length,
    counts,
  });
}
assert.deepEqual(results.map((r) => r.minimum), [397, 411, 407]);
assert.deepEqual(results.map((r) => r.maximum), [509, 520, 515]);

/** @param {number[]} source */
function coincidence(source) {
  const f = new Array(29).fill(0);
  for (const value of source) f[value]++;
  const n = source.length;
  return f.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1));
}

// Direct, fully original-cipher inverses: only two alphabet orders visible
// in the authentic GP29 chart (printed and completely reversed). The
// Chaocipher operation is still hypothetical; this tests what its
// lowest-description-length wheel keys literally do to the unknown book.
const gpOrder = Array.from({ length: 29 }, (_, i) => i);
const gpReversed = gpOrder.slice().reverse();
const originalInversions = [];
for (const nadir of [13, 14, 15]) {
  for (const [leftName, left] of [
    ['gpPrinted', gpOrder],
    ['gpReverse', gpReversed],
  ]) {
    for (const [rightName, right] of [
      ['gpPrinted', gpOrder],
      ['gpReverse', gpReversed],
    ]) {
      const recovered = chaocipher(original, left, right,
        nadir, 'decrypt');
      const rescrambled = chaocipher(recovered, left, right,
        nadir, 'encrypt');
      assert.deepEqual(rescrambled, original);
      originalInversions.push({
        nadir,
        leftName,
        rightName,
        coincidence: coincidence(recovered),
        first25RuneIndices: recovered.slice(0, 25),
      });
    }
  }
}
assert(originalInversions.every((r) =>
  r.coincidence > 0.034 && r.coincidence < 0.035));

console.log(JSON.stringify({
  cipher: 'Chaocipher, exact 26-letter reference plus 29-rune 13/14/15 nadir adaptations',
  originalUnknownRuneCount: original.length,
  originalAdjacentEquals: repeatCount(original),
  originalWordAndPageGeometry: 'No reset of moving wheels; printed word boundaries unchanged',
  nativeEnglishSource: 'Source p57 PARABLE, exactly 95 GP runes cyclically tiled to 12956',
  nativeEnglishAdjacentEquals: repeatCount(plain),
  keyGenerator: 'xorshift32, seed 3301, Fisher-Yates on both GP29 alphabets',
  exactReversibilityControls: 144,
  simulations: results,
  originalSourceWheelInversions: originalInversions,
  validConclusion: 'Direct 29-symbol Chaocipher as specified fails sampled-original-repeat profile; no claim of exhaustive all-key impossibility or historical author opcode',
}, null, 2));
