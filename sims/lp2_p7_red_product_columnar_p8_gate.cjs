'use strict';

// Direct source-key test: the five products of p7's five red words rank
// a 5-column transposition of the adjacent p8 243-rune black body.
// Only stable ascending/descending key rank and the two transform directions.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8').replace(/\r\n/g, '\n');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const pages = read('resources/liber-primus/lp2-transcription.txt').split(/\n%\s*\n/);
const { encodeSourceNativeGP } = require('./lp2_native_gp_source_orthography_sft.cjs');
const mod = (x) => ((x % 29) + 29) % 29;
const page = (n) => corpus.pages.find((p) => p.page === n).indices;

const p7 = page(7);
const p8 = page(8);
const p57 = page(57);
assert.equal(p7.length, 208);
assert.equal(p8.length, 255);
assert.equal(p57.length, 95);

const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
function redWordsOn(n) {
  const annotation = ink.pages.find((p) => p.page === n);
  const out = [];
  let offset = 0;
  let start = 0;
  let running = [];
  function flush() {
    if (!running.length) return;
    const span = (annotation.red_spans || []).find((s) =>
      start >= s.start && start + running.length <= s.start + s.length);
    if (span) out.push({ start, indices: running });
    running = [];
  }
  for (const ch of pages[n]) {
    const i = runeIndex.get(ch);
    if (i !== undefined) {
      if (!running.length) start = offset;
      running.push(i);
      offset++;
    } else if (ch === '-' || ch === '.') flush();
  }
  flush();
  return out;
}
const p7RedWords = redWordsOn(7);
assert.deepEqual(p7RedWords.map((w) => w.indices), [
  [23, 3], [22, 16, 2, 25], [5, 7, 11], [14, 28], [6, 28, 19]
]);
const product29 = (xs) => xs.reduce((v, x) => mod(v * x), 1);
const key = p7RedWords.map((w) => product29(w.indices));
assert.deepEqual(key, [11, 26, 8, 15, 2]);
assert.deepEqual(ink.pages.find((p) => p.page === 7).red_spans, [{ start: 194, length: 14 }]);
assert.deepEqual(ink.pages.find((p) => p.page === 8).red_spans, [{ start: 0, length: 12 }]);

const cipher = p8.slice(12);
const width = 5;
assert.equal(cipher.length, 243);
assert.equal(cipher.length, width * 48 + 3);
const rows = Math.ceil(cipher.length / width);
const lengths = Array.from({ length: width }, (_, col) => Math.ceil((cipher.length - col) / width));
assert.deepEqual(lengths, [49, 49, 49, 48, 48]);
const indexed = key.map((v, i) => ({ v, i }));
const orderAsc = indexed.slice().sort((a, b) => a.v - b.v || a.i - b.i).map((x) => x.i);
const orderDesc = indexed.slice().sort((a, b) => b.v - a.v || a.i - b.i).map((x) => x.i);

function encryptColumnar(plain, order) {
  const cols = Array.from({ length: width }, () => []);
  for (let i = 0; i < plain.length; i++) cols[i % width].push(plain[i]);
  return order.flatMap((col) => cols[col]);
}
function decryptColumnar(ct, order) {
  const cols = Array(width);
  let offset = 0;
  for (const col of order) {
    cols[col] = ct.slice(offset, offset + lengths[col]);
    offset += lengths[col];
  }
  assert.equal(offset, ct.length);
  const out = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < width; col++) {
      if (row < cols[col].length) out.push(cols[col][row]);
    }
  }
  return out;
}

const reference = read('resources/liber-primus/lp1-plaintext-reference.txt');
const training = [];
for (const paragraph of reference.split(/\n\s*\n/)) {
  const sequence = [];
  for (const word of paragraph.split('\n')
    .filter((line) => !line.trim().startsWith('#') && !line.trim().startsWith('['))
    .join(' ').match(/[A-Za-z]+/g) || []) {
    const encoded = encodeSourceNativeGP(word);
    if (encoded.length) sequence.push(...encoded);
  }
  if (sequence.length >= 3) training.push(sequence);
}
const trigrams = new Map();
let total = 0;
for (const sequence of training) {
  for (let i = 2; i < sequence.length; i++) {
    const k = sequence.slice(i - 2, i + 1).join(',');
    trigrams.set(k, (trigrams.get(k) || 0) + 1);
    total++;
  }
}
const denominator = total + 0.1 * (29 ** 3);
function score(xs) {
  let value = 0;
  for (let i = 2; i < xs.length; i++) {
    value += Math.log(((trigrams.get(xs.slice(i - 2, i + 1).join(',')) || 0) + 0.1) / denominator);
  }
  return value / (xs.length - 2);
}
function ioc(xs) {
  const counts = Array(29).fill(0);
  for (const x of xs) counts[x]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) / (xs.length * (xs.length - 1));
}
const nativeWindows = [];
for (const sequence of training) {
  for (let i = 0; i + cipher.length <= sequence.length; i++) {
    nativeWindows.push(score(sequence.slice(i, i + cipher.length)));
  }
}
assert.equal(nativeWindows.length, 710);
nativeWindows.sort((a, b) => a - b);

const candidates = [];
for (const [name, order] of [['ascending-stable', orderAsc], ['descending-stable', orderDesc]]) {
  const inv = decryptColumnar(cipher, order);
  const fwd = encryptColumnar(cipher, order);
  assert.deepEqual(decryptColumnar(encryptColumnar(cipher, order), order), cipher);
  assert.deepEqual(encryptColumnar(decryptColumnar(cipher, order), order), cipher);
  candidates.push({ order: name, direction: 'inverse-columnar', symbols: inv });
  candidates.push({ order: name, direction: 'forward-columnar', symbols: fwd });
}

// Positive control: both transforms and inverses recover a planted clear p57 stream.
const planted = Array.from({ length: cipher.length }, (_, i) => p57[i % p57.length]);
for (const order of [orderAsc, orderDesc]) {
  assert.deepEqual(decryptColumnar(encryptColumnar(planted, order), order), planted);
  assert.deepEqual(encryptColumnar(decryptColumnar(planted, order), order), planted);
}

console.log(JSON.stringify({
  source: 'original p7 five red words -> p8 12-rune red heading -> p8 243-rune black body',
  p7_red_word_indices: p7RedWords.map((w) => w.indices),
  p7_red_word_products_gp29: key,
  p8_black_body_runes: cipher.length,
  rectangle: { width, rows, column_lengths: lengths },
  stable_key_orders: { ascending: orderAsc, descending: orderDesc },
  original_body: { ioc: ioc(cipher), native_gp_trigram_mean_log_score: score(cipher) },
  candidates: candidates.map((x) => ({
    order: x.order,
    direction: x.direction,
    ioc: ioc(x.symbols),
    native_gp_trigram_mean_log_score: score(x.symbols),
    first120: x.symbols.slice(0, 120).map((v) => corpus.translit[v]).join('')
  })),
  native_243_window_count: nativeWindows.length,
  native_243_window_score_min_median_max: [
    nativeWindows[0], nativeWindows[Math.floor(nativeWindows.length / 2)], nativeWindows[nativeWindows.length - 1]
  ],
  planted_p57_round_trip_runes_each_order_and_direction: planted.length
}, null, 2));
