#!/usr/bin/env node
'use strict';

// Source-frozen pure columnar test for p0:
// local 13-rune red heading -> stable rank order -> 13-column transposition
// of the 249 black body runes after the 13-dot marker.
// Only ascending/descending rank and the two natural transform directions.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const readJson = (p) => JSON.parse(fs.readFileSync(path.join(process.cwd(), p), 'utf8'));
const corpus = readJson('resources/liber-primus/lp2-corpus.json');
const ink = readJson('resources/liber-primus/lp2-p0-physical-ink-override.json');
const p0 = corpus.pages.find((p) => p.page === 0);
assert(p0);
assert.equal(p0.indices.length, 262);

const source = ink.physical_zero_based;
assert.equal(source.red_words.reduce((n, w) => n + w.length, 0), 13);
assert.equal(source.large_punctuation[0].after_runes, 13);
assert.equal(source.large_punctuation[0].dots, 13);
const key = source.red_words.flatMap((w) => w.gp_indices);
assert.deepEqual(key, [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5]);
assert.deepEqual(p0.indices.slice(0, 13), key);

const cipher = p0.indices.slice(13);
const width = 13;
assert.equal(cipher.length, 249);
assert.equal(cipher.length, width * 19 + 2);
const rows = Math.ceil(cipher.length / width);
const lengths = Array.from({ length: width }, (_, col) => Math.ceil((cipher.length - col) / width));
assert.deepEqual(lengths, [20, 20, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19]);

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

const toGp = (raw) => {
  const cleaned = raw.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const tokens = corpus.translit.map((s, i) => ({ s, i })).sort((a, b) => b.s.length - a.s.length);
  const out = [];
  for (const word of cleaned.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith('ING', i)) { out.push(21); i += 3; }
      else if (word.startsWith('IO', i)) { out.push(27); i += 2; }
      else {
        const t = tokens.find((x) => word.startsWith(x.s, i));
        assert(t, 'Unmapped GP spelling: ' + word.slice(i));
        out.push(t.i);
        i += t.s.length;
      }
    }
  }
  return out;
};
const ref = fs.readFileSync(path.join(process.cwd(), 'resources/control/shakespeare_first300k.txt'), 'utf8');
assert.equal(ref.length, 300000);
const train = toGp(ref.slice(0, 150000));
const heldout = toGp(ref.slice(150000));
const gram = (a, i) => (((a[i] * 29 + a[i + 1]) * 29 + a[i + 2]) * 29 + a[i + 3]);
const freq = new Map();
for (let i = 0; i + 4 <= train.length; i++) {
  const g = gram(train, i);
  freq.set(g, (freq.get(g) || 0) + 1);
}
const denominator = train.length - 3 + 0.1 * (29 ** 4);
const floor = Math.log(0.1 / denominator);
const logs = new Map([...freq].map(([g, n]) => [g, Math.log((n + 0.1) / denominator)]));
const score = (xs) => {
  let sum = 0;
  for (let i = 0; i + 4 <= xs.length; i++) sum += logs.get(gram(xs, i)) ?? floor;
  return sum / xs.length;
};
const ioc = (xs) => {
  const f = Array(29).fill(0);
  for (const x of xs) f[x]++;
  return f.reduce((s, n) => s + n * (n - 1), 0) / (xs.length * (xs.length - 1));
};
const translit = (xs) => xs.map((x) => corpus.translit[x]).join('');

const candidates = [];
for (const [name, order] of [['ascending-stable', orderAsc], ['descending-stable', orderDesc]]) {
  const inv = decryptColumnar(cipher, order);
  const fwd = encryptColumnar(cipher, order);
  assert.deepEqual(decryptColumnar(encryptColumnar(cipher, order), order), cipher);
  assert.deepEqual(encryptColumnar(decryptColumnar(cipher, order), order), cipher);

  candidates.push({ order: name, direction: 'inverse-columnar', symbols: inv });
  candidates.push({ order: name, direction: 'forward-columnar', symbols: fwd });
}

const heldoutScores = [];
for (let i = 0; i < 300; i++) {
  const offset = Math.floor(i * (heldout.length - cipher.length) / 299);
  heldoutScores.push(score(heldout.slice(offset, offset + cipher.length)));
}
heldoutScores.sort((a, b) => a - b);

// Positive control: the same transposition and inverse recover a planted clear p57 stream.
const clear = corpus.pages.find((p) => p.page === 57).indices;
assert.equal(clear.length, 95);
const planted = Array.from({ length: cipher.length }, (_, i) => clear[i % clear.length]);
for (const order of [orderAsc, orderDesc]) {
  assert.deepEqual(decryptColumnar(encryptColumnar(planted, order), order), planted);
  assert.deepEqual(encryptColumnar(decryptColumnar(planted, order), order), planted);
}

console.log(JSON.stringify({
  source: 'resources/liber-primus/17.jpg via lp2-p0-physical-ink-override.json',
  red_key_gp29: key,
  marker: { after_runes: 13, dots: 13 },
  black_body_runes: cipher.length,
  rectangle: { width, rows, column_lengths: lengths },
  stable_key_orders: { ascending: orderAsc, descending: orderDesc },
  original_body: { ioc: ioc(cipher), gp4_mean_log_score: score(cipher) },
  candidates: candidates.map((x) => ({
    order: x.order,
    direction: x.direction,
    ioc: ioc(x.symbols),
    gp4_mean_log_score: score(x.symbols),
    first120: translit(x.symbols.slice(0, 120))
  })),
  heldout_shakespeare_300_window_gp4_min_median_max: [
    heldoutScores[0], heldoutScores[149], heldoutScores[299]
  ],
  planted_p57_round_trip_runes_each_order_and_direction: planted.length
}, null, 2));
