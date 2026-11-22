'use strict';
/**
 * Bookend GP29 shared-alphabet test with arbitrary hidden per-position bijections.
 * Node 22 CommonJS, Windows 11, read-only. Run:
 *   node sims/lp2_bookend_allsecret_samealphabet_collision_sft.cjs
 *
 * The theorem is exact: for any bijection S_i, S_i(P_i)=S_i(Q_i)
 * if and only if P_i=Q_i. No unknown alphabet is fitted.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt');
const originals = corpus.pages.filter(page => page.page >= 0 && page.page <= 55);
const runes = originals.flatMap(page => page.indices);
const first = originals.filter(page => page.page < 28).flatMap(page => page.indices);
const second = originals.filter(page => page.page >= 28).flatMap(page => page.indices);
assert.equal(runes.length, 12956);
assert.equal(first.length, 6761);
assert.equal(second.length, 6195);
assert.equal(first.length - second.length, (563 + 569) / 2);
assert.equal(corpus.runes.length, 29);

let fnv = 2166136261;
for (const rune of runes) fnv = Math.imul(fnv ^ rune, 16777619) >>> 0;
assert.equal(fnv, 0xfe63c4ed);
const phrase = [23, 11, 1, 17, 18, 10];
assert.deepEqual(runes.slice(6555, 6561), phrase);
assert.deepEqual(runes.slice(-6), phrase);

const runeIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));
const originalWords = [];
let current = [];
let scanned = 0;
for (const glyph of transcript) {
  if (scanned === 12956) break;
  if (runeIndex.has(glyph)) {
    current.push(runeIndex.get(glyph));
    scanned++;
  } else if (glyph === '%' || glyph === '/' || /\s/u.test(glyph)) {
    // Printed physical-page and line breaks are transparent inside words.
  } else if (current.length) {
    originalWords.push(current);
    current = [];
  }
}
if (current.length) originalWords.push(current);
assert.equal(originalWords.length, 2896);
assert.deepEqual(originalWords.flat(), runes);
assert.equal(Math.max(...originalWords.map(word => word.length)), 14);

// Exact distinct source clocks, with the six matching bookend runes excluded
// from the source-echo evaluation, since those six chose its phase.
const echoA = 366;
const bookendB = 6761;
const echoN = second.length - phrase.length;
const dimensionA = first.length - second.length;
assert.equal(dimensionA, 566);
assert.equal(echoA + echoN, 6555);
assert.equal(bookendB + echoN, 12950);
const pageStarts = new Map();
let offset = 0;
for (const page of originals) {
  pageStarts.set(page.page, offset);
  offset += page.indices.length;
}
assert.equal(offset, runes.length);
const pairs = [];
for (let page = 0; page < 28; page++) {
  const n = Math.min(originals[page].indices.length, originals[page + 28].indices.length);
  if (n > 0) pairs.push([pageStarts.get(page), pageStarts.get(page + 28), n]);
}
assert.equal(pairs.length, 27);

function countSame(a, startA, startB, length) {
  let equal = 0;
  for (let i = 0; i < length; i++) equal += Number(a[startA + i] === a[startB + i]);
  return equal;
}
function stats(a) {
  const echo = countSame(a, echoA, bookendB, echoN);
  const dimension = countSame(a, dimensionA, bookendB, second.length);
  const pagewise = pairs.reduce((sum, [x, y, n]) => sum + countSame(a, x, y, n), 0);
  return [echo, dimension, pagewise];
}
const observed = stats(runes);
assert.deepEqual(observed, [183, 215, 195]);
const lengths = [echoN, second.length, pairs.reduce((sum, x) => sum + x[2], 0)];
assert.deepEqual(lengths, [6189, 6195, 5663]);
console.log('ORIGINAL: echoed end-aligned, 2016 image-dimension aligned, and 28 physical page-pair clocks');
for (let k = 0; k < 3; k++) {
  console.log('  alignment ' + k + ': ' + observed[k] + '/' + lengths[k] +
    ' = ' + (100 * observed[k] / lengths[k]).toFixed(4) + '% equal runes');
}

// Source-normalized English uses the already solved LP1 ING->NG and IO->IA
// GP spelling, plus standard GP substitutions. Within each original printed
// word slot we sample an actual source word of that precise GP rune length.
// This preserves ALL 2,896 exact unknown-source word lengths, including
// the thirty-two words continued across physical page boundaries.
const tokenLabels = corpus.translit.map((label, index) => ({ label, index }))
  .sort((a, b) => b.label.length - a.label.length);
function encodeWord(word) {
  const input = word.toUpperCase().replace(/QU/g, 'CW')
    .replace(/ING/g, 'NG').replace(/IO/g, 'IA')
    .replace(/K/g, 'C').replace(/V/g, 'U')
    .replace(/Z/g, 'S').replace(/Q/g, 'C');
  const result = [];
  for (let i = 0; i < input.length;) {
    const t = tokenLabels.find(token => input.startsWith(token.label, i));
    assert(t, 'Unmapped source letter');
    result.push(t.index);
    i += t.label.length;
  }
  return result;
}
assert.deepEqual(encodeWord('THINGS'), [2, 21, 15]);
assert.deepEqual(encodeWord('FUNCTION'), [0, 1, 9, 5, 16, 27, 9]);
function sourcePools(text) {
  const pools = Array.from({ length: 15 }, () => []);
  for (const match of text.match(/[A-Za-z]+/g)) {
    const encoded = encodeWord(match);
    if (encoded.length <= 14) pools[encoded.length].push(encoded);
  }
  for (let n = 1; n <= 14; n++) assert(pools[n].length > 0);
  return pools;
}
const englishA = sourcePools(read('resources/control/shakespeare_first300k.txt'));
const englishB = sourcePools(read('resources/control/gibran_prophet_58585.txt'));
const generated = new Uint8Array(runes.length);
let state = 0x33011192;
function random32() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
const numberOfTrials = 400;
const controls = [[], [], []];
for (let trial = 0; trial < numberOfTrials; trial++) {
  let position = 0;
  for (const word of originalWords) {
    const source = position < first.length ? englishA : englishB;
    const options = source[word.length];
    const pick = options[random32() % options.length];
    for (let i = 0; i < word.length; i++) generated[position + i] = pick[i];
    position += word.length;
  }
  assert.equal(position, generated.length);
  const scored = stats(generated);
  for (let k = 0; k < 3; k++) controls[k].push(scored[k]);
}
for (let k = 0; k < 3; k++) {
  const counts = controls[k];
  const minimum = Math.min(...counts);
  const maximum = Math.max(...counts);
  const mean = counts.reduce((sum, n) => sum + n, 0) / counts.length;
  const asLow = counts.filter(n => n <= observed[k]).length;
  console.log('ENGLISH CONTROL ' + k + ': ' + numberOfTrials +
    ' full-wordshape-matched plants, min=' + minimum + ', max=' + maximum +
    ', mean=' + mean.toFixed(3) + ', original-or-lower=' + asLow);
  assert.equal(asLow, 0);
}

// Positive: encrypt two full source-English inputs using a brand-new 29!
// secret permutation at every one of 6,189 aligned positions, shared exactly
// between the two passages. The ciphertext equality vector is invariant.
// Prove inverse restoration on both streams, including every matched event.
const nativeA = generated.slice(echoA, echoA + echoN);
const nativeB = generated.slice(bookendB, bookendB + echoN);
const nativeMatches = countSame(
  [...nativeA, ...nativeB], 0, echoN, echoN);
const encryptedA = new Uint8Array(echoN);
const encryptedB = new Uint8Array(echoN);
const differentKeyB = new Uint8Array(echoN);
function permutation() {
  const out = Array.from({ length: 29 }, (_, i) => i);
  for (let j = 28; j > 0; j--) {
    const k = random32() % (j + 1);
    [out[j], out[k]] = [out[k], out[j]];
  }
  return out;
}
for (let i = 0; i < echoN; i++) {
  const key = permutation();
  const rivalKey = permutation();
  encryptedA[i] = key[nativeA[i]];
  encryptedB[i] = key[nativeB[i]];
  differentKeyB[i] = rivalKey[nativeB[i]];
  assert.equal(key.indexOf(encryptedA[i]), nativeA[i]);
  assert.equal(key.indexOf(encryptedB[i]), nativeB[i]);
  assert.equal(encryptedA[i] === encryptedB[i], nativeA[i] === nativeB[i]);
}
const plantedMatches = countSame(
  [...encryptedA, ...encryptedB], 0, echoN, echoN);
assert.equal(plantedMatches, nativeMatches);
const independentKeyMatches = countSame(
  [...encryptedA, ...differentKeyB], 0, echoN, echoN);
console.log('SHARED-PERMUTATION POSITIVE: ' + plantedMatches +
  '/' + echoN + ' exact matches retained, all 2*' + echoN +
  ' recovered source symbols invert exactly');
console.log('INDEPENDENT-PERMUTATION RIVAL: ' + independentKeyMatches +
  '/' + echoN + ' matches (expected near 1/29 by independent random keys)');
console.log('PASS: three frozen original shared-alphabet clocks lack ' +
  'source-native equalities under the exact arbitrary-bijection invariant');
