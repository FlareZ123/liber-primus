#!/usr/bin/env node
'use strict';

// Test whether the 13 red dropcap GP values supply a source-derived
// permutation for the 13 p0 marker atoms. The permutation is applied either
// before the fixed H transform (column-major or physical-raster marker order)
// or after H to the resulting K13. This is a bounded test, not a permutation
// search. Dropcap offsets are from the independent Round44 P1 image census.

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const lp1Reference = read('resources/liber-primus/lp1-plaintext-reference.txt');
const flat = corpus.pages.flatMap((page) => page.indices);
const p0 = corpus.pages.find((page) => page.page === 0);
const p57 = corpus.pages.find((page) => page.page === 57);
assert.ok(p0 && p57, 'missing p0 or clear p57 control');

const M = 29;
const mod = (value) => ((value % M) + M) % M;
const state = Object.freeze({ p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2, e: 3, q: 4 });
const t = state.g + state.K;
const w = 13;

function cumulative(seed, rises) {
  const out = [mod(seed)];
  let value = mod(seed);
  for (const rise of rises) {
    value = mod(value + rise);
    out.push(value);
  }
  return out;
}
function H(values) {
  const out = [];
  for (let left = 0, right = values.length - 1; left < right; left += 1, right -= 1) {
    out.push(mod(values[left] - values[right]), mod(values[left] + values[right]));
  }
  if (values.length % 2 === 1) out.push(values[(values.length - 1) / 2]);
  return out;
}

const left = cumulative(-state.q, [state.q - 1, w - 1, w + 1]);
const center = cumulative(state.q, [state.q, state.q + t, state.q + 2 * t, state.q + 3 * t]);
const right = cumulative(t, [t - 1, t, t + 1]);
const columnMajorState = [...left, ...center, ...right];
const physicalRasterState = [
  center[0], left[0], right[0],
  center[1], left[1], right[1],
  center[2], left[2], right[2],
  center[3], left[3], right[3],
  center[4]
];
const baseKey = H(columnMajorState);
const EXPECTED_KEY = [26, 24, 8, 19, 27, 24, 18, 3, 0, 8, 0, 16, 19];
assert.deepEqual(baseKey, EXPECTED_KEY, 'base state key changed');

const DROP_CAP_GLOBAL_POSITIONS = Object.freeze([
  0, 729, 848, 1541, 1874, 3612, 5506, 6527, 7960, 8051, 9519, 9640, 12648
]);
const dropValues = DROP_CAP_GLOBAL_POSITIONS.map((position) => {
  assert.ok(position >= 0 && position < flat.length);
  return flat[position];
});
assert.deepEqual(dropValues, [15, 20, 13, 24, 14, 20, 1, 19, 23, 21, 27, 0, 24],
  'dropcap GP values changed');

function rankOrder(values, descending) {
  return values.map((value, index) => ({ value, index }))
    .sort((a, b) => (descending ? b.value - a.value : a.value - b.value) || a.index - b.index)
    .map((entry) => entry.index);
}
function inversePermutation(permutation) {
  const inverse = Array(permutation.length);
  permutation.forEach((value, index) => { inverse[value] = index; });
  return inverse;
}
const permutations = [
  { name: 'ascending-rank', order: rankOrder(dropValues, false) },
  { name: 'inverse-ascending-rank', order: inversePermutation(rankOrder(dropValues, false)) },
  { name: 'descending-rank', order: rankOrder(dropValues, true) },
  { name: 'inverse-descending-rank', order: inversePermutation(rankOrder(dropValues, true)) }
];

const title = p0.indices.slice(0, 13);
const body = p0.indices.slice(13);
assert.equal(body.length, 249);
const expectedTitle = [18, 13, 10, 13, 8, 24, 9, 26, 15, 18, 18, 5, 15];
const titlePlain = title.map((value, index) => mod(value - baseKey[index]));
assert.deepEqual(titlePlain, expectedTitle, 'fixed p0 title positive control changed');

const lp1Only = lp1Reference.split(/^### 56\\s*$/m)[0];
const reference = lp1Only.split(/\\r?\\n/)
  .filter((line) => line.trim() &&
    !line.trim().startsWith('#') &&
    !line.trim().startsWith('[') &&
    !/^\\d/.test(line.trim()))
  .join(' ')
  .toUpperCase()
  .replace(/[^A-Z]/g, '');
const counts = Array.from({ length: 26 }, () => Array(26).fill(0));
const totals = Array(26).fill(0);
for (let i = 1; i < reference.length; i += 1) {
  const a = reference.charCodeAt(i - 1) - 65;
  const b = reference.charCodeAt(i) - 65;
  counts[a][b] += 1;
  totals[a] += 1;
}
function score(values) {
  const text = values.map((i) => corpus.translit[i]).join('').toUpperCase().replace(/[^A-Z]/g, '');
  let total = 0;
  let n = 0;
  for (let i = 1; i < text.length; i += 1) {
    const a = text.charCodeAt(i - 1) - 65;
    const b = text.charCodeAt(i) - 65;
    total += Math.log((counts[a][b] + 1) / (totals[a] + 26));
    n += 1;
  }
  return total / n;
}
function decrypt(values, key) {
  return values.map((value, index) => mod(value - key[index % key.length]));
}
function encrypt(values, key) {
  return values.map((value, index) => mod(value + key[index % key.length]));
}
function render(values) {
  return values.map((i) => corpus.translit[i]).join('');
}

const variants = [];
for (const permutation of permutations) {
  const order = permutation.order;
  const postHKey = order.map((index) => baseKey[index]);
  const postHPlain = decrypt(body, postHKey);
  assert.deepEqual(encrypt(postHPlain, postHKey), body);
  variants.push({
    construction: 'permute-H-key',
    markerOrder: 'column-major',
    permutation: permutation.name,
    order,
    key: postHKey,
    score: score(postHPlain),
    prefix: render(postHPlain).slice(0, 150),
    roundtrip: true
  });

  for (const marker of [
    { name: 'column-major', values: columnMajorState },
    { name: 'physical-raster', values: physicalRasterState }
  ]) {
    const orderedState = order.map((index) => marker.values[index]);
    const key = H(orderedState);
    const plain = decrypt(body, key);
    assert.deepEqual(encrypt(plain, key), body);
    variants.push({
      construction: 'permute-marker-before-H',
      markerOrder: marker.name,
      permutation: permutation.name,
      order,
      orderedState,
      key,
      score: score(plain),
      prefix: render(plain).slice(0, 150),
      roundtrip: true
    });
  }
}

const result = {
  hypothesis: 'the 13 red dropcap GP values supply a permutation for the 13 p0 marker-derived key atoms',
  state,
  markerColumns: [4, 5, 4],
  columnMajorState,
  physicalRasterState,
  baseKey,
  dropcapGlobalPositions: DROP_CAP_GLOBAL_POSITIONS,
  dropcapValues,
  dropcapTransliteration: dropcapValues.map((i) => corpus.translit[i]).join(''),
  ascendingRank: rankOrder(dropValues, false),
  descendingRank: rankOrder(dropValues, true),
  titlePositiveControl: titlePlain,
  bodyLength: body.length,
  lp1ReferenceLetters: reference.length,
  originalBodyScore: score(body),
  clearP57ControlScore: score(p57.indices),
  variants
};
console.log(JSON.stringify(result, null, 2));
if (!variants.every((variant) => variant.roundtrip)) process.exitCode = 1;
