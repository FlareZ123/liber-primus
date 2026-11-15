'use strict';

/**
 * Source-original SFT: LP2 p27 double-letter invariant for a multiplicative
 * plaintext-difference cipher. Run from this repository with Node.js 22.
 * The script makes no writes and fits no unknown-page key.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const table = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-grid-256.json'), 'utf8'));
const dictionary = fs.readFileSync(path.join(root, 'resources', 'control', 'english_wordfreq_textblob.txt'), 'utf8');
const M = 29;
const TOKENS = [...corpus.translit].sort((a, b) => b.length - a.length);
const GP_VALUE = new Map(corpus.translit.map((s, i) => [s, i]));

/** @param {number} x @returns {number} */
function mod(x) { return ((x % M) + M) % M; }

/** @param {number} x @returns {number} */
function inverse(x) {
  const v = mod(x);
  assert.notEqual(v, 0);
  for (let a = 1; a < M; a++) if (mod(a * v) === 1) return a;
  throw new Error('No multiplicative inverse');
}

/**
 * Source-native GP29 normalization from the existing TextBlob tests.
 * @param {string} input
 * @returns {number[] | null}
 */
function encode(input) {
  const s = input.toUpperCase()
    .replace(/QU/g, 'CW').replace(/[KQ]/g, 'C').replace(/V/g, 'U')
    .replace(/Z/g, 'S').replace(/ING/g, 'NG').replace(/IO/g, 'IA');
  const out = [];
  for (let i = 0; i < s.length;) {
    const token = TOKENS.find((t) => s.startsWith(t, i));
    if (!token) return null;
    out.push(GP_VALUE.get(token));
    i += token.length;
  }
  return out;
}

/** @param {number[]} x @returns {string} */
function repeatedPattern(x) {
  let s = '';
  for (let i = 1; i < x.length; i++) s += x[i] === x[i - 1] ? '1' : '0';
  return s;
}

const unsolvedPages = corpus.pages.filter((p) => p.page <= 55);
assert.equal(unsolvedPages.reduce((n, p) => n + p.runic_count, 0), 12956);
const p27 = unsolvedPages.find((p) => p.page === 27);
assert.equal(p27.runic_count, 234);

const actual = p27.indices.slice(79, 91);
assert.deepEqual(actual, [12, 4, 9, 15, 3, 3, 5, 24, 18, 26, 18, 18]);
assert.equal(actual.map((v) => corpus.translit[v]).join(''), 'EORNSOOCAEYEE');
const pattern = repeatedPattern(actual);
assert.equal(pattern, '00001000001');
console.log('Original physical p27 rune offset79, 12 runes:', actual.map((i) => corpus.translit[i]).join(''));
console.log('Within-word equality mask (destinations 1..11):', pattern);
console.log('Forced same-rune pair destination indices:', [...pattern].flatMap((s, i) => s === '1' ? [i + 1] : []));

const words = dictionary.split(/\r?\n/).filter((s) => /^[a-z]+ /i.test(s)).map((s) => s.split(' ')[0]);
assert.equal(words.length, 29157);
let matched = 0, encodable = 0, sameLength = 0;
for (const word of words) {
  const runes = encode(word);
  if (!runes) continue;
  encodable++;
  if (runes.length !== 12) continue;
  sameLength++;
  if (repeatedPattern(runes) === pattern) matched++;
}
assert.equal(matched, 0);
console.log('Fixed TextBlob lexicon entries:', words.length,
  'encodable:', encodable, 'GP12:', sameLength, 'exact equality-mask matches:', matched);

// 'ambassadress' is an English lexical counterexample outside this
// fixed TextBlob inventory; this is a hypothetical plaintext only.
const hypothetical = encode('ambassadress');
assert.deepEqual(hypothetical, [24, 19, 17, 24, 15, 15, 24, 23, 4, 18, 15, 15]);
assert.equal(repeatedPattern(hypothetical), pattern);
const forced = [];
for (let i = 1; i < actual.length; i++) {
  if (hypothetical[i] === hypothetical[i - 1]) {
    assert.equal(actual[i], actual[i - 1]);
    forced.push(null);
  } else {
    const k = mod((actual[i] - actual[i - 1]) *
      inverse(hypothetical[i] - hypothetical[i - 1]));
    assert.ok(k >= 1 && k <= 28);
    assert.equal(mod(actual[i - 1] + k * (hypothetical[i] - hypothetical[i - 1])), actual[i]);
    forced.push(k);
  }
}
const expectedK = [19, 12, 5, 11, null, 26, 10, 11, 13, 22, null];
assert.deepEqual(forced, expectedK);
console.log('Conditional AMBASSADRESS key multipliers, positions1..11:', forced);

// A narrow original-grid key-consumer check: cyclic 256-byte source
// tape mapped to nonzero GF29 multipliers by 1+(byte mod28).
// Neither the conversion nor the word/corpus clock is author-selected.
assert.equal(table.bytes.length, 256);
const key = table.bytes.map((v) => 1 + v % 28);
const globalIndex = unsolvedPages.filter((p) => p.page < 27)
  .reduce((n, p) => n + p.runic_count, 0) + 79;
assert.equal(globalIndex, 6606);
const sourceScores = [];
for (const [label, start] of [['global', globalIndex], ['page-local', 79]]) {
  for (const shift of [0, 1]) {
    let matches = 0, eligible = 0;
    for (let i = 1; i < actual.length; i++) {
      if (forced[i - 1] === null) continue;
      eligible++;
      if (key[(start + i - shift) % key.length] === forced[i - 1]) matches++;
    }
    assert.equal(eligible, 9);
    sourceScores.push([label, shift, matches]);
  }
}
assert.deepEqual(sourceScores, [
  ['global', 0, 0], ['global', 1, 1],
  ['page-local', 0, 0], ['page-local', 1, 0]
]);
console.log('p50 grid direct nonzero-multiplier match counts (9 known):', sourceScores);

// Genuine solved GP text plant: arbitrary nonzero evolving multipliers,
// exact forward encryption and full lossless inverse, with doubles
// retained independently of the key.
const p57 = corpus.pages.find((p) => p.page === 57).indices;
assert.equal(p57.length, 95);
const plantedKey = p57.map((_, i) => 1 + ((11 * i + 7) % 28));
const encrypted = [p57[0]];
for (let i = 1; i < p57.length; i++) {
  encrypted.push(mod(encrypted[i - 1] +
    plantedKey[i] * (p57[i] - p57[i - 1])));
}
const restored = [encrypted[0]];
for (let i = 1; i < encrypted.length; i++) {
  restored.push(mod(restored[i - 1] +
    inverse(plantedKey[i]) * (encrypted[i] - encrypted[i - 1])));
  assert.equal(encrypted[i] === encrypted[i - 1], p57[i] === p57[i - 1]);
}
assert.deepEqual(restored, p57);
console.log('Authentic solved-p57 constructive plant restored:', restored.length, '/', p57.length);
// Complete 55-original-page equality-spectrum invariant. For any secret
// nonzero multiplier tape, within-page adjacent-equal counts are identical
// for the plaintext and the ciphertext. The source-native English control
// windows are exhaustive, length-matched and independent of any key fit.
const physicalPages = corpus.pages.filter((p) => p.page <= 55 && p.runic_count > 0);
assert.equal(physicalPages.length, 55);
const lengths = physicalPages.map((p) => p.runic_count);
const edges = [];
let fullLength = 0;
for (let i = 0; i < lengths.length; i++) {
  fullLength += lengths[i];
  if (i + 1 < lengths.length) edges.push(fullLength);
}
assert.equal(fullLength, 12956);
assert.equal(edges.length, 54);
const originalWithin = physicalPages.reduce((sum, p) =>
  sum + p.indices.slice(1).filter((v, i) => v === p.indices[i]).length, 0);
assert.equal(originalWithin, 86);

/** @param {string} raw @returns {number[]} */
function sourceTape(raw) {
  const out = [];
  for (const word of raw.match(/[a-z]+/gi) || []) {
    const x = encode(word);
    if (x !== null) out.push(...x);
  }
  return out;
}

/** @param {number[]} tape @returns {{minimum:number, bestOffset:number, atMostOriginal:number, windows:number}} */
function allWindows(tape) {
  const prefix = new Uint32Array(tape.length);
  for (let i = 1; i < tape.length; i++)
    prefix[i] = prefix[i - 1] + Number(tape[i] === tape[i - 1]);
  let minimum = Infinity, bestOffset = -1, atMostOriginal = 0, windows = 0;
  for (let offset = 0; offset + fullLength <= tape.length; offset++) {
    let count = prefix[offset + fullLength - 1] - prefix[offset];
    for (const x of edges) count -= Number(tape[offset + x - 1] === tape[offset + x]);
    if (count < minimum) {
      minimum = count;
      bestOffset = offset;
    }
    if (count <= originalWithin) atMostOriginal++;
    windows++;
  }
  return { minimum, bestOffset, atMostOriginal, windows };
}
const controlSpecs = [
  ['shakespeare_first300k.txt', 217106, 323, 45148, 204151],
  ['gibran_prophet_58585.txt', 62492, 344, 17188, 49537],
  ['emerson_essays_2944.txt', 321327, 309, 225748, 308372]
];
for (const [name, expectedLength, expectedMin, expectedOffset, expectedWindows] of controlSpecs) {
  const source = fs.readFileSync(path.join(root, 'resources', 'control', name), 'utf8');
  const tape = sourceTape(source);
  assert.equal(tape.length, expectedLength, name + ' source rune length');
  const x = allWindows(tape);
  assert.deepEqual(x, {
    minimum: expectedMin, bestOffset: expectedOffset,
    atMostOriginal: 0, windows: expectedWindows
  });
  console.log('All matched native-GP English windows,', name, x);
}
console.log('Original eligible pairs:', fullLength - physicalPages.length,
  'original equal pairs:', originalWithin);
console.log('Decision: this zero-added-noise difference cipher cannot decode any of the three fixed English control windows.');

