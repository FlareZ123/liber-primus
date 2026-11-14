'use strict';
/**
 * LP2 p15 source 4x4 spiral as four projective GP30 maps.
 * Tests every possible changing-secret quadrant selection by an exact
 * original-word-count capacity invariant, plus one fully reversible
 * ciphertext-driven state clock and solved-p57 positive controls.
 *
 * Node 22 CommonJS, built-ins only:
 * node sims/lp2_p15_projective_infinity_quadrant_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
/** @param {string} relativePath */
const read = relativePath =>
  fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/lp2-transcription.txt');
const runeIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));
/** @param {number} x */
const mod = x => ((x % 29) + 29) % 29;
/** @param {number} a */
function inverse(a) {
  assert.notEqual(mod(a), 0);
  for (let k = 1; k < 29; k++) {
    if (mod(a * k) === 1) return k;
  }
  throw new Error('Nonzero field element has no inverse');
}

// Transcribed directly from original p15 (32.jpg); original source image
// and full Fibonacci-prime spiral reconstruction are independently recorded
// in results/lp2-p15-fibonacci-prime-spiral.md.
const square = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820]
];
const maps = [];
for (const r of [0, 2]) {
  for (const c of [0, 2]) {
    const M = [
      square[r][c], square[r][c + 1],
      square[r + 1][c], square[r + 1][c + 1]
    ].map(mod);
    const [a, b, cc, d] = M;
    assert.notEqual(mod(a * d - b * cc), 0, 'PGL quadrant');
    assert.notEqual(cc, 0, 'Each original PGL map moves infinity');
    maps.push(M);
  }
}
assert.deepEqual(maps, [
  [10, 3, 1, 22],
  [20, 22, 21, 25],
  [11, 17, 21, 17],
  [19, 7, 12, 22]
]);
// The *inverse* returns plaintext infinity at C=a/c, not at -d/c.
const poles = maps.map(([a, , c]) => mod(a * inverse(c)));
assert.deepEqual(poles, [10, 12, 24, 4]);
for (let i = 0; i < maps.length; i++) {
  const inverseMap = invertMatrix(maps[i]);
  for (let cipher = 0; cipher <= 29; cipher++) {
    assert.equal(mobius(inverseMap, cipher) === 29, cipher === poles[i]);
  }
}

// GP30: finite GP indices 0..28 and a word break as infinity (29).
// For M=(a,b;c,d), M(x)=(ax+b)/(cx+d), with the usual projective
// interpretation at infinity and at the pole. Each map is invertible.
/** @param {number[]} M @param {number} x */
function mobius(M, x) {
  const [a, b, c, d] = M;
  const denominator = x === 29 ? c : mod(c * x + d);
  if (denominator === 0) return 29;
  const numerator = x === 29 ? a : mod(a * x + b);
  return mod(numerator * inverse(denominator));
}
/** @param {number[]} M */
const invertMatrix = ([a, b, c, d]) => [d, mod(-b), mod(-c), a];
for (const M of maps) {
  const inverseMap = invertMatrix(M);
  for (let x = 0; x <= 29; x++) {
    assert.equal(mobius(inverseMap, mobius(M, x)), x);
  }
}
/** @param {string} input */
function parseWords(input) {
  const cleaned = input.replace(/[\r\n/%]/g, '');
  const separator = new RegExp('[^' + corpus.runes.join('') + ']+', 'u');
  return cleaned.split(separator).filter(Boolean)
    .map(word => [...word].map(rune => {
      assert(runeIndex.has(rune));
      return runeIndex.get(rune);
    }));
}
/** @param {number[][]} words */
function serializeWords(words) {
  const output = [];
  words.forEach((word, index) => {
    if (index !== 0) output.push(29);
    output.push(...word);
  });
  return output;
}
let seen = 0;
let unknownEnd = -1;
for (let i = 0; i < transcription.length; i++) {
  if (runeIndex.has(transcription[i])) seen++;
  if (seen === 12956) {
    unknownEnd = i + 1;
    break;
  }
}
assert(unknownEnd !== -1);
const words = parseWords(transcription.slice(0, unknownEnd));
assert.equal(words.length, 2896);
assert.equal(words.reduce((n, w) => n + w.length, 0), 12956);
const source = serializeWords(words);
assert.equal(source.length, 15851);
const sourceHistogram = Array(30).fill(0);
source.forEach(x => sourceHistogram[x]++);

// For any choice among these four projective maps, even an entirely
// secret and arbitrary different choice at EACH original symbol position,
// deciphering a literal ciphertext space never emits a space, because all
// c entries are nonzero. A finite ciphertext rune emits a space only at
// the inverse-map pole. The union {7,14,13,3} is therefore an absolute
// all-secret bound on how many plaintext word breaks can be generated.
const arbitraryScheduleMaxSpaces =
  [...new Set(poles)].reduce((sum, pole) => sum + sourceHistogram[pole], 0);
assert.deepEqual(poles.map(x => sourceHistogram[x]), [471, 399, 482, 424]);
assert.equal(sourceHistogram[29], 2895);
assert.equal(arbitraryScheduleMaxSpaces, 1776);
assert(arbitraryScheduleMaxSpaces < sourceHistogram[29]);

// One concrete source-matrix, changing-state reversible proposal: the
// preceding emitted ciphertext token chooses the next quadrant. This
// uses a fully determined public IV = infinity; a different secret clock
// cannot break the all-secret word-count bound proved above.
/** @param {number[]} plaintext */
function encrypt(plaintext) {
  let previousCipher = 29;
  return plaintext.map(p => {
    const c = mobius(maps[previousCipher % 4], p);
    previousCipher = c;
    return c;
  });
}
/** @param {number[]} ciphertext */
function decrypt(ciphertext) {
  let previousCipher = 29;
  return ciphertext.map(c => {
    const p = mobius(invertMatrix(maps[previousCipher % 4]), c);
    previousCipher = c;
    return p;
  });
}
const originalInverse = decrypt(source);
assert.deepEqual(encrypt(originalInverse), source);
const originalDecodedSpaces = originalInverse.filter(x => x === 29).length;
assert.equal(originalDecodedSpaces, 464);
const finite = originalInverse.filter(x => x !== 29);
const histogram = Array(29).fill(0);
finite.forEach(x => histogram[x]++);
const ioc = histogram.reduce((sum, n) => sum + n * (n - 1), 0) /
  (finite.length * (finite.length - 1));

// Authentic p57 runic cleartext, with its own original printed breaks,
// confirms both directions of the full projective map on a real GP phrase.
const p57Page = transcription.split('%').at(-1);
const p57Words = parseWords(p57Page);
assert.deepEqual(p57Words.flat(), corpus.pages[57].indices);
const native = serializeWords(p57Words);
const encryptedNative = encrypt(native);
assert.deepEqual(decrypt(encryptedNative), native);
assert.deepEqual(encrypt(decrypt(encryptedNative)), encryptedNative);
const longNative = Array.from({ length: source.length },
  (_, index) => native[index % native.length]);
const longEncrypted = encrypt(longNative);
assert.deepEqual(decrypt(longEncrypted), longNative);

// All-secret upper bound is entirely separate from this concrete decoder:
// no schedule over these four source matrices can yield 2,895 spaces from
// the original printed 15,851-token register. A mechanism changing word
// lengths or adding a different fifth matrix would be a different proposal.
console.log(JSON.stringify({
  original: {
    unknownRunes: seen, printedWords: words.length,
    sourceTokens: source.length, ciphertextWordSeparators: sourceHistogram[29]
  },
  projective: {
    matrices: maps, poles, poleInputCounts: poles.map(x => sourceHistogram[x]),
    arbitraryStateMaxDecodedSeparators: arbitraryScheduleMaxSpaces,
    missingSeparators: sourceHistogram[29] - arbitraryScheduleMaxSpaces
  },
  previousCipherState: {
    originalDecodedSeparators: originalDecodedSpaces,
    decodedWordCount: originalDecodedSpaces + 1,
    finiteDecodedRunes: finite.length, decodedRuneIoC: ioc,
    originalRoundtrip: true
  },
  authenticGPPositive: {
    p57Runes: corpus.pages[57].indices.length,
    p57PrintWords: p57Words.length,
    p57Recovered: true, longNativeRecoveredSymbols: longNative.length
  },
  conclusion: 'All four original p15 projective quadrant maps together have insufficient original-cipher pole events to preserve the printed LP2 word count, for every secret changing quadrant schedule; the source-locked predecessor-state inverse does not recover plaintext.'
}, null, 2));
