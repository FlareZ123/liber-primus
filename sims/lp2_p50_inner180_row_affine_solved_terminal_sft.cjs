'use strict';

/**
 * Natural original p50 32x8 printed grid: test whether its 30 inner
 * six-byte rows are independently affinely encoded 6-GP29-rune blocks
 * of the ALREADY SOLVED terminal p56+p57 plaintext (85+95=180 runes).
 *
 * Each row is allowed its own unrestricted slope and intercept; enumerate
 * every distinct pair to find the best possible 6-point match. Thus 0/30
 * complete rows is a key-independent rejection of this exact decoder.
 *
 * Node22 CommonJS, local source files only, read-only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const load = p => fs.readFileSync(path.join(root, p), 'utf8');
const gp = JSON.parse(load('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(load('resources/liber-primus/lp2-grid-256.json'));
const source = load('resources/liber-primus/lp1-plaintext-reference.txt');
const sections = source.split(/^### (\d+)\s*$/m);
const p56i = sections.indexOf('56');
assert(p56i > 0);
const p56English = sections[p56i + 1].replace(/[a-f0-9]{128}/gi, ' ');
const spelled = gp.translit.map((s, i) => ({s, i})).sort((a, b) => b.s.length - a.s.length);

/** @param {string} text */
function encodeNativeGp(text) {
  const out = [];
  const normalized = text.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith('ING', i)) {out.push(21); i += 3; continue;}
      if (word.startsWith('IO', i)) {out.push(27); i += 2; continue;}
      const token = spelled.find(t => word.startsWith(t.s, i));
      assert(token, 'source p56 orthography not representable');
      out.push(token.i);
      i += token.s.length;
    }
  }
  return out;
}

const p56 = encodeNativeGp(p56English);
const p57 = gp.pages.find(p => p.page === 57).indices;
assert.deepEqual([p56.length, p57.length], [85, 95]);
const known = p56.concat(p57);
const bytes = grid.pages.flatMap(p => p.bytes);
assert.equal(bytes.length, 256);
const cells = Array.from({length: 256}, (_, i) => i).filter(i => {
  const r = Math.floor(i / 8), c = i % 8;
  return r >= 1 && r <= 30 && c >= 1 && c <= 6;
});
assert.equal(cells.length, 180);
const inner = cells.map(index => bytes[index]);

/** @param {number} x @param {number} field */
const mod = (x, field) => ((x % field) + field) % field;

/** @param {number} x @param {number} field */
function inverse(x, field) {
  const y = mod(x, field);
  for (let i = 1; i < field; i++) if ((y * i) % field === 1) return i;
  return null;
}

/**
 * @param {number[]} xs
 * @param {number[]} ys
 * @param {number} field
 */
function bestAffine(xs, ys, field) {
  assert.equal(xs.length, 6);
  assert.equal(ys.length, 6);
  let best = {matches: -1, slope: null, intercept: null, sourcePair: null};
  for (let i = 0; i < xs.length; i++) {
    for (let j = i + 1; j < xs.length; j++) {
      const reciprocal = inverse(xs[j] - xs[i], field);
      if (reciprocal === null) continue;
      const slope = mod((ys[j] - ys[i]) * reciprocal, field);
      const intercept = mod(ys[i] - slope * xs[i], field);
      const matches = xs.reduce((n, x, at) =>
        n + Number(mod(slope * x + intercept, field) === ys[at]), 0);
      if (matches > best.matches) best = {
        matches, slope, intercept, sourcePair: [i, j]
      };
    }
  }
  assert(best.matches >= 2);
  return best;
}

// Positive test: 30 independent arbitrary row keys, with all six positions
// planted consistently in each field and decoded without knowing that key.
for (const field of [29, 257]) {
  for (let row = 0; row < 30; row++) {
    const x = Array.from({length: 6}, (_, c) => (row * 19 + c * 31 + 4) % field);
    const slope = (row * 7 + 3) % field;
    const intercept = (row * 11 + 9) % field;
    const y = x.map(v => mod(slope * v + intercept, field));
    assert.equal(bestAffine(x, y, field).matches, 6);
  }
}

/**
 * The historical 2013 Cicada puzzle used bytewise XOR directly, making a
 * row-specific XOR key an independently motivated non-affine transfer.
 * An 8-bit XOR result may be a native 0..28 rune, or an 8-bit byte reduced
 * modulo29. Both are exhaustively and exactly checkable at 256 keys per row.
 *
 * @param {number[]} xs
 * @param {number[]} ys
 * @param {boolean} reduce
 */
function bestXor(xs, ys, reduce) {
  let best = {matches: -1, key: -1};
  for (let key = 0; key < 256; key++) {
    const n = xs.reduce((s, x, i) => s +
      Number((reduce ? ((x ^ key) % 29) : (x ^ key)) === ys[i]), 0);
    if (n > best.matches) best = {matches: n, key};
  }
  return best;
}
for (let row = 0; row < 30; row++) {
  const key = (row * 31 + 7) % 256;
  const y = known.slice(row * 6, row * 6 + 6);
  const planted = y.map(value => value ^ key);
  assert.equal(bestXor(planted, y, false).matches, 6);
  assert.equal(bestXor(planted, y, true).matches, 6);
}
const xorResults = [false, true].map(reduce => {
  const fits = [];
  for (let row = 0; row < 30; row++) {
    fits.push(bestXor(
      inner.slice(row * 6, row * 6 + 6),
      known.slice(row * 6, row * 6 + 6), reduce
    ).matches);
  }
  assert(fits.every(n => n < 6));
  return {
    model: reduce ? 'rowwise 8-bit XOR then modulo29' : 'direct rowwise 8-bit XOR',
    complete_rows: 0,
    total_rows: 30,
    maximum_matching_points_per_row: Math.max(...fits),
    source_row_scores: fits
  };
});
assert.deepEqual(xorResults.map(x => x.maximum_matching_points_per_row), [1, 3]);

const results = [];
for (const field of [29, 257]) {
  const rowScores = [];
  for (let row = 0; row < 30; row++) {
    const x = inner.slice(row * 6, row * 6 + 6).map(v => v % field);
    const y = known.slice(row * 6, row * 6 + 6);
    rowScores.push(bestAffine(x, y, field).matches);
  }
  const complete = rowScores.filter(v => v === 6).length;
  assert.equal(complete, 0);
  results.push({
    field, complete_rows: complete, total_rows: 30,
    max_matched_of_six: Math.max(...rowScores),
    matches_per_row: rowScores
  });
}
assert.deepEqual(results.map(x => x.max_matched_of_six), [4, 3]);
assert.deepEqual(inner.slice(0, 6), [249, 156, 222, 247, 4, 183]);
assert.deepEqual(known.slice(0, 6), [24, 9, 18, 9, 23, 7]);
console.log(JSON.stringify({
  source_alignment: 'p50 30x6 interior row-major -> native p56 85 + p57 95',
  original_gp56_57_plaintext: 180,
  rowwise_model: 'independent unknown affine key for EACH row',
  controls: 'PASS 30/30 synthetic rows in both prime fields',
  original_results: results,
  original_xor_results: xorResults,
  outcome: 'rowwise affine and exact per-row bytewise XOR decoding rejected',
  plaintext_recovered: false
}, null, 2));
