'use strict';

/**
 * Source-locked 1033/3301 investigation of the original five numbered
 * cuneiform passages. Read-only SFT, compatible with Windows Node.js 22.
 * The numeric match is an exact source structure, not a claimed decryption.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(root, 'lp2-ink-annotations.json'), 'utf8'));
const transcription = fs.readFileSync(path.join(root, 'lp2-transcription.txt'), 'utf8');
const runeMap = new Map(corpus.runes.map((rune, i) => [rune, i]));

/** @param {string} text @returns {number[]} */
function runes(text) {
  return Array.from(text).filter(ch => runeMap.has(ch)).map(ch => runeMap.get(ch));
}

/** @param {number[]} data @returns {number} */
function ioc(data) {
  const counts = Array(29).fill(0);
  for (const value of data) counts[value]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (data.length * (data.length - 1));
}

/** @param {number[]} hay @param {number[]} needle @returns {number[]} */
function allStarts(hay, needle) {
  const out = [];
  for (let i = 0; i <= hay.length - needle.length; i++) {
    if (needle.every((v, k) => hay[i + k] === v)) out.push(i);
  }
  return out;
}

/** @param {number[]} data @returns {string} */
function digest(data) {
  return crypto.createHash('sha256').update(Buffer.from(data)).digest('hex');
}

// The physical cuneiform chapter begins at p33's second red heading,
// index 91; the first p33 heading belongs to the preceding source unit.
const p33 = corpus.pages.find(p => p.page === 33);
const p39 = corpus.pages.find(p => p.page === 39);
assert.deepEqual(
  ink.pages.find(p => p.page === 33).red_spans.map(x => [x.start, x.length]),
  [[0, 10], [91, 8]]
);
const chapter = corpus.pages.filter(p => p.page >= 33 && p.page <= 39)
  .flatMap(p => p.indices).slice(91);
assert.equal(chapter.length, 1589);
assert.equal(p33.indices.length, 214);

// Arabic red labels 1..5 visibly partition the uninterrupted numbered text.
const headings = [...transcription.matchAll(/(?:^|\n)([1-5])-/g)];
assert.deepEqual(headings.map(h => Number(h[1])), [1, 2, 3, 4, 5]);
const units = headings.map((h, i) => {
  const start = h.index + h[0].length;
  const next = i < 4 ? headings[i + 1].index : transcription.length;
  return runes(transcription.slice(start,
    Math.min(next, transcription.indexOf('&', start))));
});
assert.deepEqual(units.map(u => u.length), [139, 91, 98, 96, 129]);
const starts = units.map(u => {
  const matches = allStarts(chapter, u);
  assert.equal(matches.length, 1);
  return matches[0];
});
assert.deepEqual(starts, [754, 893, 984, 1082, 1178]);
const numbered = units.flat();
assert.equal(numbered.length, 553);
assert.equal(digest(numbered),
  'f432558b32ef4120d80f330d068d4f211005f4a6dac7780e3eec2d1e7a0f191a');

const redMark = ink.pages.find(p => p.page === 39).red_spans;
assert.deepEqual(redMark.map(x => [x.start, x.length]), [[119, 3]]);
const redAt = chapter.length - p39.indices.length + redMark[0].start;
assert.equal(redAt, 1468);
const red3 = chapter.slice(redAt, redAt + 3);
assert.deepEqual(red3, [27, 5, 15]);
const unnumbered = chapter.slice(0, starts[0]).concat(
  chapter.slice(starts[4] + units[4].length, redAt),
  chapter.slice(redAt + 3)
);
assert.equal(unnumbered.length, 1033);
assert.equal(chapter.length, unnumbered.length + numbered.length + red3.length);

// The source Babylonian numerals are 1033 and 3301. Modular multiplication
// by 3301 modulo 1033 has exactly three orbits, of sizes 1, 516, 516.
const modulus = 1033;
const multiplier = 3301 % modulus;
const seen = new Set();
const cycles = [];
for (let first = 0; first < modulus; first++) {
  if (seen.has(first)) continue;
  const orbit = [];
  for (let i = first; !seen.has(i); i = i * multiplier % modulus) {
    orbit.push(i);
    seen.add(i);
  }
  cycles.push(orbit);
}
assert.deepEqual(cycles.map(c => c.length), [1, 516, 516]);
assert.deepEqual(cycles.map(c => c[0]), [0, 1, 5]);
assert.equal(seen.size, 1033);

// The marked red triple has GP-prime sum 173, the zero-based prime ordinal
// of 1033. This cross-relation is source arithmetic, not an authored opcode.
const redPrimeSum = red3.reduce((n, i) => n + corpus.prime[i], 0);
assert.equal(redPrimeSum, 173);
let primeCount = 0;
for (let n = 2; n <= 1033; n++) {
  let prime = true;
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) { prime = false; break; }
  }
  if (prime) primeCount++;
}
assert.equal(primeCount, 174);
const anchors = cycles.map(c => unnumbered[c[0]]);
assert.deepEqual(anchors, [21, 2, 5]);
assert.notDeepEqual(red3, anchors);

// First literal GP29 additive consumers of the distinct original text pools.
const pad = unnumbered.slice(0, numbered.length);
const decodedMinus = numbered.map((v, i) => (v - pad[i] + 29) % 29);
const decodedPlus = numbered.map((v, i) => (v + pad[i]) % 29);
assert(Math.abs(ioc(decodedMinus) - 0.03411562753885263) < 1e-12);
assert(Math.abs(ioc(decodedPlus) - 0.03370285923945803) < 1e-12);

// Source-typed multiplicative-orbit differences, whose GP29 output remains
// indistinguishable from a random-looking 29-symbol stream by unigram IoC.
const differences = unnumbered.map((v, i) =>
  (unnumbered[i * multiplier % modulus] - v + 29) % 29);
assert(Math.abs(ioc(differences) - 0.03410139805038385) < 1e-12);

// Reversible positive: the known solved p57 native rune text is first
// encrypted with this literal candidate pad and then recovered exactly.
const solved = corpus.pages.find(p => p.page === 57).indices;
assert.equal(solved.length, 95);
const nativePlant = Array.from({length: 553}, (_, i) => solved[i % solved.length]);
const encryptedPlant = nativePlant.map((v, i) => (v + pad[i]) % 29);
assert.deepEqual(encryptedPlant.map((v, i) => (v - pad[i] + 29) % 29),
  nativePlant);

console.log(JSON.stringify({
  chapter: {pageRange: '33-39',startP33:91,length:chapter.length},
  originalSegments: {
    unnumbered: unnumbered.length, numbered: numbered.length, red: red3.length,
    numberedLengths: units.map(u => u.length), numberedStarts: starts
  },
  hashes: {unnumbered: digest(unnumbered), numbered: digest(numbered)},
  cuneiform: {modulus, multiplier, orbits: cycles.map(c => c.length)},
  red: {
    runeIndices: red3, gpPrimeSum: redPrimeSum, primeOrdinal0Of1033: primeCount - 1,
    literalOrbitAnchors: anchors, seedsMatch: false
  },
  nativeP57IoC: ioc(solved),
  actual: {
    rawNumberedIoC: ioc(numbered), rawUnnumberedIoC: ioc(unnumbered),
    directMinusIoC: ioc(decodedMinus), directPlusIoC: ioc(decodedPlus),
    orbitDifferenceIoC: ioc(differences)
  },
  plantedNativeRunnersRecovered: nativePlant.length,
  unknownPlaintextRecovered: false
}, null, 2));
