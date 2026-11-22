'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const chapter = corpus.pages.slice(40, 54).flatMap(page => page.indices);
const header = [0, 9, 19, 26, 6, 23, 25, 8];
const order = [...Array(8).keys()].sort((a, b) => header[a] - header[b]);
const N = 3000;
const ROWS = 375;
const CLOCK = 32;
const COLS = 8;

assert.equal(chapter.length, 3008);
assert.deepEqual(chapter.slice(0, 8), header);
assert.deepEqual(order, [0, 4, 7, 1, 2, 5, 6, 3]);
const body = chapter.slice(8);

function uncolumnar(cipher, permutation) {
  assert.equal(cipher.length, N);
  const out = new Array(N);
  for (let j = 0; j < COLS; j++) {
    const col = permutation[j];
    for (let row = 0; row < ROWS; row++) out[row * COLS + col] = cipher[ROWS * j + row];
  }
  return out;
}

function columnar(plain, permutation) {
  assert.equal(plain.length, N);
  const out = new Array(N);
  for (let j = 0; j < COLS; j++) {
    const col = permutation[j];
    for (let row = 0; row < ROWS; row++) out[ROWS * j + row] = plain[row * COLS + col];
  }
  return out;
}

function equalPhasePairs(runes) {
  assert.equal(runes.length, N);
  const bins = Array.from({ length: CLOCK * COLS }, () => new Uint16Array(29));
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const symbol = runes[row * COLS + col];
      assert(Number.isInteger(symbol) && symbol >= 0 && symbol < 29);
      bins[(row % CLOCK) * COLS + col][symbol]++;
    }
  }
  let equal = 0;
  let eligible = 0;
  for (let phase = 0; phase < CLOCK; phase++) {
    const n = Math.floor((ROWS - 1 - phase) / CLOCK) + 1;
    for (let col = 0; col < COLS; col++) {
      eligible += n * (n - 1) / 2;
      for (const count of bins[phase * COLS + col]) equal += count * (count - 1) / 2;
    }
  }
  return { equal, eligible, rate: equal / eligible };
}

function gpNative(text) {
  const tokenIndex = new Map(corpus.translit.map((token, index) => [token, index]));
  const tokens = corpus.translit.slice().sort((a, b) => b.length - a.length);
  const s = text.toUpperCase()
    .replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Q/g, 'C').replace(/Z/g, 'S')
    .replace(/ING/g, 'NG');
  const out = [];
  for (let i = 0; i < s.length;) {
    const token = tokens.find(t => s.startsWith(t, i));
    if (token) {
      out.push(tokenIndex.get(token));
      i += token.length;
    } else {
      i++;
    }
  }
  return out;
}

function sourceWindows(file) {
  const native = gpNative(fs.readFileSync(path.join(root, 'resources', 'control', file), 'utf8'));
  let min = Infinity, max = -Infinity, count = 0, atOrBelowOriginal = 0;
  for (let start = 0; start + N <= native.length; start += 127) {
    const rate = equalPhasePairs(native.slice(start, start + N)).rate;
    min = Math.min(min, rate);
    max = Math.max(max, rate);
    if (rate <= original.rate) atOrBelowOriginal++;
    count++;
  }
  return { file, runes: native.length, windows: count, min, max, atOrBelowOriginal, native };
}

const decolumned = uncolumnar(body, order);
assert.deepEqual(columnar(decolumned, order), body);
const original = equalPhasePairs(decolumned);
const otherLayout = equalPhasePairs(body);
assert.deepEqual([original.equal, original.eligible], [581, 16104]);
assert.deepEqual([otherLayout.equal, otherLayout.eligible], [564, 16104]);

const shakespeare = sourceWindows('shakespeare_first300k.txt');
const gibran = sourceWindows('gibran_prophet_58585.txt');
const emerson = sourceWindows('emerson_essays_2944.txt');
assert.deepEqual(
  [shakespeare.windows, gibran.windows, emerson.windows],
  [1691, 471, 2521]
);
for (const source of [shakespeare, gibran, emerson]) {
  assert.equal(source.atOrBelowOriginal, 0);
  assert(source.min > original.rate);
}

// Blind reversible positive: 256 arbitrary, independently secret bijections
// indexed by (row mod 32, printed column), followed by the red-key transpose.
let seed = 0x33011234;
function randomIndex(bound) {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) % bound;
}
const forward = [], inverse = [];
for (let phaseCol = 0; phaseCol < CLOCK * COLS; phaseCol++) {
  const perm = [...Array(29).keys()];
  for (let i = 28; i > 0; i--) {
    const j = randomIndex(i + 1);
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  const inv = Array(29);
  perm.forEach((v, i) => { inv[v] = i; });
  forward.push(perm);
  inverse.push(inv);
}

const planted = gibran.native.slice(1200, 4200);
assert.equal(planted.length, N);
const encodedRows = planted.map((symbol, i) => {
  const phaseCol = (Math.floor(i / COLS) % CLOCK) * COLS + i % COLS;
  return forward[phaseCol][symbol];
});
const emittedCipher = columnar(encodedRows, order);
const recoveredRows = uncolumnar(emittedCipher, order);
const recovered = recoveredRows.map((symbol, i) => {
  const phaseCol = (Math.floor(i / COLS) % CLOCK) * COLS + i % COLS;
  return inverse[phaseCol][symbol];
});
assert.deepEqual(recovered, planted);
assert.deepEqual(equalPhasePairs(recoveredRows), equalPhasePairs(planted));
assert(equalPhasePairs(planted).rate > original.rate);

console.log(JSON.stringify({
  source: 'original 2014 LP2 pp40-53, all 3008 runes, red8 + 3000-body',
  header, order,
  original, directStride8: otherLayout,
  nativeControls: [shakespeare, gibran, emerson].map(
    ({ file, runes, windows, min, max, atOrBelowOriginal }) =>
      ({ file, runes, windows, min, max, atOrBelowOriginal })
  ),
  arbitrarySecretBijectionPlant: {
    decoded: recovered.length,
    perfectReencryption: emittedCipher.length,
    phasePairs: equalPhasePairs(planted)
  }
}, null, 2));
