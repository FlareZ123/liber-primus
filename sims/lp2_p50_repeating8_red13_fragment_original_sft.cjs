'use strict';
/**
 * Source-typed 32x8 p49–51 table as 32 repeating eight-byte keys, one per 13-dot interval.
 * A complete original-input test of a possible human-visual readout:
 * 32 eight-byte rows vs 31 large source punctuation events -> 32 intervals.
 * The history offers actual XOR and GP29 addition in other stages, but no explicit row-to-interval key handoff.
 *
 * Node.js 22, Windows 11: node sims/lp2_p50_rowdes_red13_fragment_original_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const base = path.resolve(__dirname, '..');
const load = rel => JSON.parse(fs.readFileSync(path.join(base, rel), 'utf8'));
const corpus = load('resources/liber-primus/lp2-corpus.json');
const ink = load('resources/liber-primus/lp2-ink-annotations.json');
const grid = load('resources/liber-primus/base60-grid.json');
const rows = grid.byte_rows;
assert.equal(rows.length, 32);
assert.ok(rows.every(r => r.length === 8 && r.every(v => v >= 0 && v < 256)));

const cipherFull = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
const all = corpus.pages.flatMap(p => p.indices);
assert.equal(cipherFull.length, 12956);
assert.equal(all.length, 13136);
const marks = [];
let pageStart = 0;
for (const page of corpus.pages) {
  const punctuation = ink.pages.find(p => p.page === page.page)?.large_punctuation ?? [];
  for (const [localOffset, size] of punctuation) {
    if (size === 13) marks.push(pageStart + localOffset);
  }
  pageStart += page.indices.length;
}
assert.equal(marks.length, 31);
marks.sort((a, b) => a - b);
const bounds = [0, ...marks, all.length];
assert.equal(bounds.length, 33);
assert.equal(bounds[28], 12956);
assert.deepEqual(bounds.flatMap((v, i) => i < 32 && bounds[i + 1] === v ? [i] : []), [8, 11]);

// Source-simple 8-byte row repetition: no block cipher, KDF or counter.
/** @param {number[]} row @param {number} length */
function rowPad(row, length) {
  return Buffer.from(Array.from({ length }, (_, i) => row[i % 8]));
}
const keypads = rows.slice(0, 28).map((row, i) =>
  rowPad(row, bounds[i + 1] - bounds[i]));
assert.deepEqual([...keypads[0].subarray(0, 8)], rows[0]);
const mod = (x, n) => ((x % n) + n) % n;

/** @typedef {{relation:'gp29'|'cyclic28'|'ordered28',sign:1|-1}} Model
 * @param {number[]} input
 * @param {Model} model
 * @param {boolean} decoding
 */
function apply(input, model, decoding) {
  const out = new Array(input.length).fill(0);
  for (let j = 0; j < 28; j++) {
    const begin = bounds[j], end = bounds[j + 1];
    if (begin === end) continue;
    const stream = keypads[j];
    if (model.relation === 'gp29') {
      for (let i = begin; i < end; i++) {
        const k = stream[i - begin] % 29;
        out[i] = mod(input[i] + (decoding ? -1 : 1) * model.sign * k, 29);
      }
      continue;
    }
    out[begin] = input[begin];
    let used = 0;
    for (let i = begin + 1; i < end; i++) {
      const previous = decoding ? input[i - 1] : out[i - 1];
      const isEscape = decoding ? input[i] === previous : input[i] === 28;
      if (isEscape) {
        out[i] = decoding ? 28 : previous;
        continue;
      }
      const key = stream[used++] % 28;
      if (decoding) {
        const digit = model.relation === 'cyclic28'
          ? mod(input[i] - previous - 1, 29)
          : input[i] - (input[i] > previous ? 1 : 0);
        assert.ok(digit >= 0 && digit < 28);
        out[i] = mod(digit - model.sign * key, 28);
      } else {
        const digit = mod(input[i] + model.sign * key, 28);
        out[i] = model.relation === 'cyclic28'
          ? mod(previous + digit + 1, 29)
          : digit + (digit >= previous ? 1 : 0);
      }
    }
  }
  return out;
}

// Independent, fixed GP-English heldout calibration without original-page fitting.
const gp = corpus.translit.map((s, i) => ({s, i})).sort((a, b) => b.s.length - a.s.length);
const source = fs.readFileSync(path.join(base, 'resources/control/shakespeare_first300k.txt'), 'utf8');
/** @param {string} text */
function english(text) {
  const out = [];
  for (let word of text.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g, 'CW').replace(/V/g, 'U').replace(/K/g, 'C').replace(/Z/g, 'S');
    for (let i = 0; i < word.length;) {
      const rune = gp.find(x => word.startsWith(x.s, i));
      assert.ok(rune);
      out.push(rune.i);
      i += rune.s.length;
    }
  }
  return out;
}
const language = english(source);
assert.ok(language.length > 16000);
const train = language.slice(0, 180000);
const sample = language.slice(-16000, -16000 + cipherFull.length);
assert.equal(sample.length, cipherFull.length);
const counts = new Uint32Array(29 ** 3), totals = new Uint32Array(29 ** 2);
for (let i = 2; i < train.length; i++) {
  const pair = train[i - 2] * 29 + train[i - 1];
  counts[pair * 29 + train[i]]++;
  totals[pair]++;
}
const logp = Float64Array.from(counts, (f, i) =>
  Math.log((f + 0.2) / (totals[Math.floor(i / 29)] + 29 * 0.2))
);
/** @param {number[]} v @param {number} begin @param {number} end */
function score(v, begin = 0, end = v.length) {
  let sum = 0;
  for (let i = begin + 2; i < end; i++) sum += logp[(v[i - 2] * 29 + v[i - 1]) * 29 + v[i]];
  return sum / (end - begin - 2);
}
function limits(first, last) {
  const begin = corpus.pages.filter(p => p.page < first).reduce((s, p) => s + p.indices.length, 0);
  const end = corpus.pages.filter(p => p.page <= last).reduce((s, p) => s + p.indices.length, 0);
  return [begin, end];
}
const a = limits(0, 2), b = limits(8, 14), c = limits(40, 53);
assert.deepEqual([a[1] - a[0], b[1] - b[0], c[1] - c[0]], [729, 1729, 3008]);
const models = [];
for (const relation of ['gp29', 'cyclic28', 'ordered28']) {
  for (const sign of [-1, 1]) {
    /** @type {Model} */
    const model = {relation, sign};
    const clear = apply(cipherFull, model, true);
    assert.deepEqual(apply(clear, model, false), cipherFull);
    let plant = sample.slice();
    if (relation !== 'gp29') {
      for (let j = 0; j < 28; j++) {
        const begin = bounds[j], end = bounds[j + 1];
        if (begin === end) continue;
        plant[begin] = cipherFull[begin];
        for (let i = begin + 1; i < end; i++) {
          plant[i] = cipherFull[i] === cipherFull[i - 1] ? 28 : (plant[i] === 28 ? 18 : plant[i]);
        }
      }
    }
    const synthetic = apply(plant, model, false);
    assert.deepEqual(apply(synthetic, model, true), plant,
      'All original-length source-layout native GP plants must recover exactly');
    models.push({
      relation, sign,
      first22: clear.slice(0, 22).map(v => corpus.translit[v]).join(''),
      original: score(clear),
      p0_2: score(clear, ...a),
      p8_14: score(clear, ...b),
      p40_53: score(clear, ...c),
      nativePlant: score(plant),
    });
  }
}
models.sort((x, y) => y.p0_2 - x.p0_2);
console.log(JSON.stringify({
  source: 'Original p50 32x8 bytes as 32 repeating-eight-byte row keys for red13-separated intervals',
  originalRuneCount: cipherFull.length, marks: marks.length,
  sourceIntervals: bounds.length - 1,
  row0HeadVerified: true,
  rawOriginalScores: {
    full: score(cipherFull), p0_2: score(cipherFull, ...a),
    p8_14: score(cipherFull, ...b), p40_53: score(cipherFull, ...c),
  },
  heldoutNative: score(sample),
  models,
  assertion: 'All six original-output roundtrips and independent source-shaped native-GP planted roundtrips pass',
  limit: 'No creator-selected table-to-interval byte/rune reduction or rank28 escape rule is established',
}, null, 2));
