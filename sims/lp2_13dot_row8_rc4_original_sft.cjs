#!/usr/bin/env node
'use strict';
// Read-only source-frozen experiment: 32 original 13-dot intervals and 32
// eight-byte rows of the p50 number table, each row as an independent RC4 key.
// Run from repository root with Node.js 22.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(process.cwd(), p), 'utf8'));
const corpus = readJson('resources/liber-primus/lp2-corpus.json');
const ink = readJson('resources/liber-primus/lp2-ink-annotations.json');
const table = readJson('resources/liber-primus/base60-grid.json').byte_rows;
const full = corpus.pages.flatMap((p) => p.indices);
assert.equal(full.length, 13136);
assert.equal(table.length, 32);
assert(table.every((row) => row.length === 8 && row.every((x) => Number.isInteger(x) && x >= 0 && x < 256)));
const markers = [];
let start = 0;
for (const page of corpus.pages) {
  const events = ink.pages.find((p) => p.page === page.page)?.large_punctuation || [];
  for (const e of events) if (e[1] === 13) markers.push(start + e[0]);
  start += page.indices.length;
}
markers.sort((a, b) => a - b);
assert.equal(markers.length, 31);
const bounds = [0, ...markers, full.length];
assert.equal(bounds[28], 12956);
const lengths = bounds.slice(0, 28).map((n, i) => bounds[i + 1] - n);
assert.equal(lengths.reduce((a, b) => a + b, 0), 12956);
assert.equal(lengths.filter((n) => n === 0).length, 2);
const cipher = full.slice(0, 12956);
const mod = (a, n) => ((a % n) + n) % n;

/**
 * Standard RC4, one output byte per invocation, state fresh for each key.
 * @param {number[]} key
 * @returns {() => number}
 */
function rc4(key) {
  const s = Array.from({ length: 256 }, (_, i) => i);
  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + s[i] + key[i % key.length]) & 255;
    [s[i], s[j]] = [s[j], s[i]];
  }
  let i = 0;
  j = 0;
  return () => {
    i = (i + 1) & 255;
    j = (j + s[i]) & 255;
    [s[i], s[j]] = [s[j], s[i]];
    return s[(s[i] + s[j]) & 255];
  };
}
/**
 * Four complete reversible source-consumers, each reset per 13-dot interval.
 * GP28 forms preserve literal F and its nonconsuming clock, source-solved on p56.
 * @param {number[]} input
 * @param {string} mode
 * @param {boolean} encode
 * @returns {number[]}
 */
function run(input, mode, encode) {
  assert.equal(input.length, cipher.length);
  const answer = [];
  const skip = mode.includes('skip'), feedback = mode.includes('diff');
  const m = skip ? 28 : 29;
  for (let seg = 0; seg < 28; seg++) {
    const next = rc4(table[seg]);
    let predecessor = 0;
    for (let i = bounds[seg]; i < bounds[seg + 1]; i++) {
      const c = input[i];
      if (skip && c === 0) { answer.push(0); continue; }
      const x = skip ? c - 1 : c;
      const key = next() % m;
      const y = encode ? mod(x + key + (feedback ? predecessor : 0), m)
        : mod(x - key - (feedback ? predecessor : 0), m);
      answer.push(skip ? y + 1 : y);
      if (feedback) predecessor = encode ? y : x;
    }
  }
  return answer;
}
/** @param {number[]} xs */
function ioc(xs) {
  const f = Array(29).fill(0);
  for (const x of xs) f[x]++;
  return f.reduce((s, c) => s + c * (c - 1), 0) / (xs.length * (xs.length - 1));
}
/** Preserve GP-native ING and IO spellings. @param {string} raw */
function toGp(raw) {
  const cleaned = raw.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const tokens = corpus.translit.map((s, i) => ({ s, i })).sort((a, b) => b.s.length - a.s.length);
  const out = [];
  for (const w of cleaned.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < w.length;) {
      if (w.startsWith('ING', i)) { out.push(21); i += 3; }
      else if (w.startsWith('IO', i)) { out.push(27); i += 2; }
      else {
        const t = tokens.find((x) => w.startsWith(x.s, i));
        assert(t, 'Unmapped rune spelling: ' + w.slice(i));
        out.push(t.i);
        i += t.s.length;
      }
    }
  }
  return out;
}
const ref = fs.readFileSync(path.join(process.cwd(), 'resources/control/shakespeare_first300k.txt'), 'utf8').slice(0, 300000);
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
/** @param {number[]} xs */
function score(xs) {
  assert.equal(xs.length, cipher.length);
  let sum = 0, pos = 0;
  for (const len of lengths) {
    for (let i = pos; i + 4 <= pos + len; i++) sum += logs.get(gram(xs, i)) ?? floor;
    pos += len;
  }
  return sum / xs.length;
}
const known = rc4([...Buffer.from('Key', 'ascii')]);
assert.equal(Buffer.from(Array.from({ length: 9 }, () => known())).toString('hex'),
  'eb9f7781b734ca72a7');
const clear = corpus.pages.find((p) => p.page === 57).indices;
assert.equal(clear.length, 95);
const plant = Array.from({ length: cipher.length }, (_, i) => clear[i % clear.length]);
const outcomes = [];
for (const mode of ['direct29', 'diff29', 'direct28skip', 'diff28skip']) {
  assert.deepEqual(run(run(plant, mode, true), mode, false), plant);
  const decoded = run(cipher, mode, false);
  assert.deepEqual(run(decoded, mode, true), cipher);
  outcomes.push({
    mode, ioc: ioc(decoded), score: score(decoded),
    first80: decoded.slice(0, 80).map((x) => corpus.translit[x]).join('')
  });
}
const sample = [];
for (let i = 0; i < 300; i++) {
  const offset = Math.floor(i * (heldout.length - cipher.length) / 299);
  sample.push(score(heldout.slice(offset, offset + cipher.length)));
}
sample.sort((a, b) => a - b);
assert(sample[0] - Math.max(...outcomes.map((x) => x.score)) > 3);
console.log(JSON.stringify({
  original_runes: full.length, unsolved_runes: cipher.length,
  thirteen_dot_marks: markers.length, table_shape: [32, 8],
  unknown_interval_lengths: lengths, raw_ioc: ioc(cipher), raw_score: score(cipher),
  rc4_known_vector: 'passed',
  planted_runes_recovered_each_model: plant.length,
  original_runes_reencrypted_each_model: cipher.length,
  gp4_training_runes: train.length, gp4_heldout_runes: heldout.length,
  gp4_heldout_300_min_median_max: [sample[0], sample[149], sample[299]],
  outputs: outcomes
}, null, 2));
