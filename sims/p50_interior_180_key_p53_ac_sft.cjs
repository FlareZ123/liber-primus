'use strict';

// Test the 180-cell interior of the original p50 32x8 table as a one-to-one
// GP29 additive key for p53's 179 runes plus p54's enlarged initial Ac.
// The 76-cell perimeter -> p55 half is already tested by
// sims/p55_table_perimeter_key_sft.cjs.

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const table = JSON.parse(read('resources/liber-primus/base60-grid.json'));
const gibranText = read('resources/control/gibran_prophet_58585.txt');

const bytes = table.byte_rows.flat();
assert.equal(table.byte_rows.length, 32);
assert.ok(table.byte_rows.every(row => row.length === 8));
assert.equal(bytes.length, 256);
assert.equal(
  crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290'
);

const p53 = corpus.pages.find(page => page.page === 53).indices;
const p54 = corpus.pages.find(page => page.page === 54).indices;
const p55 = corpus.pages.find(page => page.page === 55).indices;
assert.equal(p53.length, 179);
assert.equal(p54.length, 232);
assert.equal(p54[0], 24); // enlarged red Ac initial
assert.equal(p55.length, 76);

const target = [...p53, p54[0]];
assert.equal(target.length, 180);

// Interior: rows 1..30 and columns 1..6, zero-based.
const interiorRowMajor = [];
for (let row = 1; row <= 30; row++) {
  for (let column = 1; column <= 6; column++) {
    interiorRowMajor.push(table.byte_rows[row][column]);
  }
}
assert.equal(interiorRowMajor.length, 180);
const perimeterCount = 256 - interiorRowMajor.length;
assert.equal(perimeterCount, 76);

// The 2013 180/76 split also motivates the standard outer-to-inner clockwise
// spiral: the first 76 cells are the perimeter; the remaining 180 are inner.
const spiralCoordinates = [];
let top = 0, bottom = 31, left = 0, right = 7;
while (top <= bottom && left <= right) {
  for (let column = left; column <= right; column++) spiralCoordinates.push([top, column]);
  top++;
  for (let row = top; row <= bottom; row++) spiralCoordinates.push([row, right]);
  right--;
  if (top <= bottom) {
    for (let column = right; column >= left; column--) spiralCoordinates.push([bottom, column]);
    bottom--;
  }
  if (left <= right) {
    for (let row = bottom; row >= top; row--) spiralCoordinates.push([row, left]);
    left++;
  }
}
assert.equal(spiralCoordinates.length, 256);
const perimeterCoordinates = spiralCoordinates.slice(0, 76);
const interiorSpiral = spiralCoordinates.slice(76)
  .map(([row, column]) => table.byte_rows[row][column]);
assert.equal(perimeterCoordinates.length, 76);
assert.equal(interiorSpiral.length, 180);

const keys = [
  { order: 'interior-row-major', values: interiorRowMajor.map(byte => byte % 29) },
  { order: 'interior-clockwise-spiral', values: interiorSpiral.map(byte => byte % 29) }
];

// Reuse the repository's established native-GP control normalization.
const tokens = corpus.translit
  .map((spelling, index) => ({ spelling, index }))
  .sort((a, b) => b.spelling.length - a.spelling.length);

function nativeGp(text) {
  const output = [];
  for (let word of (text.toUpperCase().match(/[A-Z]+/g) || [])) {
    word = word.replace(/QU/g, 'CW').replace(/V/g, 'U')
      .replace(/K/g, 'C').replace(/Z/g, 'S').replace(/ING/g, 'NG');
    for (let i = 0; i < word.length;) {
      const token = tokens.find(item => word.startsWith(item.spelling, i));
      if (!token) throw new Error('Unmapped Gibran text: ' + word.slice(i));
      output.push(token.index);
      i += token.spelling.length;
    }
  }
  return output;
}

const native = nativeGp(gibranText);
assert.equal(native.length, 62696);
const trainingLength = 40000;
const counts = new Map();
let total = 0;
for (let i = 2; i < trainingLength; i++) {
  const triple = native[i - 2] * 841 + native[i - 1] * 29 + native[i];
  counts.set(triple, (counts.get(triple) || 0) + 1);
  total++;
}
const denominator = total + 0.1 * 29 ** 3;

function score(sequence) {
  let sum = 0;
  for (let i = 2; i < sequence.length; i++) {
    const triple = sequence[i - 2] * 841 + sequence[i - 1] * 29 + sequence[i];
    sum += Math.log(((counts.get(triple) || 0) + 0.1) / denominator);
  }
  return sum / (sequence.length - 2);
}

function ioc(sequence) {
  const frequencies = Array(29).fill(0);
  for (const value of sequence) frequencies[value]++;
  return frequencies.reduce((sum, n) => sum + n * (n - 1), 0) /
    (sequence.length * (sequence.length - 1));
}

const heldOut = [];
for (let i = trainingLength; i + target.length <= native.length; i++) {
  heldOut.push(score(native.slice(i, i + target.length)));
}
heldOut.sort((a, b) => a - b);
assert.equal(heldOut.length, 22517);
const worstNative = heldOut[0];
const medianNative = heldOut[Math.floor(heldOut.length / 2)];
const bestNative = heldOut[heldOut.length - 1];

const candidates = [];
for (const { order, values: key } of keys) {
  for (const sign of [-1, 1]) {
    const decoded = target.map((value, i) => ((value + sign * key[i]) % 29 + 29) % 29);
    const planted = native.slice(1000, 1000 + target.length);
    const encryptedPlant = planted.map((value, i) => (value + key[i]) % 29);
    const recoveredPlant = encryptedPlant.map((value, i) => ((value - key[i]) % 29 + 29) % 29);
    assert.deepEqual(recoveredPlant, planted);
    const originalRoundTrip = decoded.map((value, i) => ((value - sign * key[i]) % 29 + 29) % 29);
    assert.deepEqual(originalRoundTrip, target);
    const candidateScore = score(decoded);
    const result = {
      order,
      direction: sign < 0 ? 'C-K' : 'C+K',
      score: candidateScore,
      ioc: ioc(decoded),
      nativeWindowsAtOrBelowCandidate: heldOut.filter(value => value <= candidateScore).length,
      preview: decoded.slice(0, 60).map(index => corpus.translit[index]).join(''),
      exactOriginalRoundTrip: true,
      exactPlanted180Recovery: true
    };
    assert.ok(candidateScore < worstNative);
    candidates.push(result);
  }
}

const expectedScores = [
  -12.500389482766725, -12.260663098125832,
  -12.54436530314436, -12.27839340448106
];
for (let i = 0; i < expectedScores.length; i++) {
  assert.ok(Math.abs(candidates[i].score - expectedScores[i]) < 1e-10);
}
assert.ok(Math.abs(worstNative - (-9.353988528918798)) < 1e-10);

console.log(JSON.stringify({
  hypothesis: 'The p50 32x8 table interior (180 bytes) is a one-to-one mod-29 additive key for p53 plus p54 enlarged Ac (180 runes).',
  sourceStructure: {
    table: '32x8 base60-decoded original bytes',
    tableSha256: '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290',
    interior: 'rows 1..30, columns 1..6, tested row-major and inner clockwise spiral',
    interiorBytes: interiorRowMajor.length,
    interiorSpiralFirst8: spiralCoordinates.slice(76, 84),
    perimeterBytes: perimeterCount,
    target: 'all p53 runes followed by p54 initial enlarged Ac24',
    targetRunes: target.length,
    p55ComplementRunes: p55.length,
    historicalSelector: '2013 prime list has 180 omitted and 76 visible values; selector is historical/participant-reconstructed, not signed LP2 instruction'
  },
  keyProjection: 'interior byte mod 29; row-major and inner clockwise spiral orders',
  controls: {
    gibranRunes: native.length,
    trainingRunes: trainingLength,
    heldOut180RuneWindows: heldOut.length,
    worstNativeWindow: worstNative,
    medianNativeWindow: medianNative,
    bestNativeWindow: bestNative,
    plantedAndOriginalRoundTrips: 'exact'
  },
  candidates,
  decision: 'Both additive directions fail in both natural interior orders, below every held-out native-GP 180-rune window. Reject this direct interior-byte-mod29 key; the 180/76 structural correspondence is not itself a decipherment.'
}, null, 2));
