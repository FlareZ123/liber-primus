/**
 * p50 nested-prime-count bracket -> p55 strict interiors.
 *
 * The nested p50 bracket itself selects pi(value): its two duplicate layers
 * satisfy separation = pi(base60 value). Apply that exact operation to each
 * of the 43 enclosed base60 values, reduce modulo GP29, and use the authentic
 * p56 subtraction direction on the 43 strict p55 word interiors.
 *
 * No phase, sign, radix, reversal, offset, affine term, or reset is searched.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} relative */
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');

const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const shakespeare = read('resources/control/shakespeare_first300k.txt');

const wordLengths = [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
const sourceWords = read('resources/liber-primus/lp2-transcription.txt')
  .replace(/\r\n/g, '\n').split(/\n%\n/)[54]
  .replace(/\/\n/g, '').replace(/[\n&$%§\/]/g, '')
  .split(/[-.]/).filter(Boolean);
assert.deepEqual(sourceWords.map((word) => Array.from(word).length), wordLengths);

/** @param {number} n */
function isPrime(n) {
  if (n < 2) return false;
  for (let divisor = 2; divisor * divisor <= n; divisor += 1) {
    if (n % divisor === 0) return false;
  }
  return true;
}

/** @param {number} n */
function primeCount(n) {
  let count = 0;
  for (let value = 2; value <= n; value += 1) {
    if (isPrime(value)) count += 1;
  }
  return count;
}

const cells = grid.bytes;
assert.equal(cells.length, 256);
assert.deepEqual(cells.map((value, i) => value === 193 ? i : null).filter((x) => x !== null), [83,127]);
assert.equal(cells[82], 201);
assert.equal(cells[128], 201);
assert.equal(128 - 82, primeCount(201));
assert.equal(127 - 83, primeCount(193));

const enclosed = cells.slice(84,127);
assert.equal(enclosed.length, 43);
const key = enclosed.map((value) => primeCount(value) % 29);

const page = gp.pages[55].indices;
assert.equal(page.length, 76);
let pageOffset = 0;
const segments = [];
for (let i = 0; i < sourceWords.length; i += 1) {
  const sourceIndices = Array.from(sourceWords[i]).map((rune) => gp.runes.indexOf(rune));
  assert.deepEqual(page.slice(pageOffset, pageOffset + sourceIndices.length), sourceIndices);
  segments.push(sourceIndices.slice(1, -1));
  pageOffset += sourceIndices.length;
}
assert.equal(pageOffset, 76);
const cipher = segments.flat();
assert.equal(cipher.length, 43);

/** @param {number} value */
const mod29 = (value) => (value % 29 + 29) % 29;
const plain = cipher.map((value, i) => mod29(value - key[i]));
const reencrypted = plain.map((value, i) => mod29(value + key[i]));
assert.deepEqual(reencrypted, cipher);

const tokenOrder = gp.translit.map((text, i) => ({text, i}))
  .sort((a, b) => b.text.length - a.text.length);
const vocab = new Map();
const triCounts = new Map();
/** @param {string} source */
const normalise = (source) => source.toUpperCase()
  .replace(/QU/g, 'CW').replace(/V/g, 'U').replace(/K/g, 'C')
  .replace(/Z/g, 'S').replace(/Q/g, 'C');

/** @param {string} word */
function encodeWord(word) {
  word = normalise(word);
  const out = [];
  for (let i = 0; i < word.length;) {
    const token = tokenOrder.find((candidate) => word.startsWith(candidate.text, i));
    assert.ok(token);
    out.push(token.i);
    i += token.text.length;
  }
  return out;
}

for (const word of shakespeare.toUpperCase().match(/[A-Z]+/g) || []) {
  const encoded = encodeWord(word);
  if (!vocab.has(encoded.length)) vocab.set(encoded.length, []);
  vocab.get(encoded.length).push(encoded);
  for (let i = 0; i + 3 <= encoded.length; i += 1) {
    const id = encoded[i] * 841 + encoded[i + 1] * 29 + encoded[i + 2];
    triCounts.set(id, (triCounts.get(id) || 0) + 1);
  }
}
const observedTotal = [...triCounts.values()].reduce((sum, count) => sum + count, 0);
assert.equal(observedTotal, 111151);
const alpha = 0.05;
const denominator = observedTotal + alpha * 29 ** 3;
const insideLengths = wordLengths.map((length) => Math.max(length - 2, 0));

/** @param {number[]} interiors */
function score(interiors) {
  let offset = 0;
  let sum = 0;
  let count = 0;
  for (const length of insideLengths) {
    for (let i = 0; i + 3 <= length; i += 1) {
      const id = interiors[offset + i] * 841 +
        interiors[offset + i + 1] * 29 + interiors[offset + i + 2];
      sum += Math.log(((triCounts.get(id) || 0) + alpha) / denominator);
      count += 1;
    }
    offset += length;
  }
  assert.equal(offset, 43);
  return sum / count;
}

let seed = 0x50314355;
/** @returns {number} */
function rand32() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}

/** @returns {number[]} */
function sampleNative() {
  const out = [];
  for (const length of wordLengths) {
    const choices = vocab.get(length);
    assert.ok(choices?.length);
    out.push(...choices[rand32() % choices.length].slice(1, -1));
  }
  assert.equal(out.length, 43);
  return out;
}

const nativeScores = [];
for (let i = 0; i < 2000; i += 1) nativeScores.push(score(sampleNative()));
nativeScores.sort((a, b) => a - b);

const originalScore = score(cipher);
const decodedScore = score(plain);
assert.ok(decodedScore < nativeScores[0]);

const plant = sampleNative();
const syntheticCipher = plant.map((value, i) => mod29(value + key[i]));
const recovered = syntheticCipher.map((value, i) => mod29(value - key[i]));
assert.deepEqual(recovered, plant);

console.log(JSON.stringify({
  status: 'PASS: p50 bracket prime-count stream does not decode p55 strict interiors',
  source: {
    p50Outer: {cells: [82,128], value: 201, separation: 46, pi: primeCount(201)},
    p50Inner: {cells: [83,127], value: 193, separation: 44, pi: primeCount(193)},
    enclosedCells: [84,126],
    enclosedCount: enclosed.length,
    p55StrictInteriors: cipher.length
  },
  keyMod29: key,
  decodedTranslit: plain.map((index) => gp.translit[index]).join(' '),
  scores: {
    originalCipher: originalScore,
    decoded: decodedScore,
    nativeMin: nativeScores[0],
    nativeMedian: nativeScores[1000]
  },
  positivePlant: {recovered: recovered.length},
  interpretation: 'The exact pi(value) operation selected by the nested bracket, aligned source-order to the 43 p55 strict interiors and applied with the authentic p56 subtraction direction, is a bounded negative. No free parameters were searched.'
}, null, 2));
