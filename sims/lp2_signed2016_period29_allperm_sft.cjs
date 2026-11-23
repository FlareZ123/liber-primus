'use strict';

// Read-only original LP2 period-29 ALL-secret alphabet-permutation gate.
// Run on Windows Node 22: node sims/lp2_signed2016_period29_allperm_sft.cjs

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const txt = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const book = JSON.parse(txt('resources/liber-primus/lp2-corpus.json'));
const pages = book.pages.filter((p) => p.page <= 55);
const unknown = pages.flatMap((p) => p.indices);
assert.equal(unknown.length, 12956);
const labels = book.translit;
const digs = ['TH', 'NG', 'EO', 'OE', 'AE', 'IA', 'EA'];
function gp(t) {
  const s = t.toUpperCase().replace(/[^A-Z]/g, '')
    .replace(/QU/g, 'CW').replace(/ING/g, 'NG').replace(/IO/g, 'IA')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const a = [];
  for (let i = 0; i < s.length;) {
    const rune = digs.find((r) => s.startsWith(r, i)) || s[i];
    const index = labels.indexOf(rune);
    assert.ok(index >= 0);
    a.push(index);
    i += rune.length;
  }
  return a;
}
const native = {
  gibran: gp(txt('resources/control/gibran_prophet_58585.txt')),
  shakespeare: gp(txt('resources/control/shakespeare_first300k.txt'))
};
assert.equal(native.gibran.length, 61918);
assert.equal(native.shakespeare.length, 215146);
const starts = new Set([0, 3, 8, 15, 23, 27, 33, 40, 54]);
function segments(mode) {
  if (mode === 'book') return [{ offset: 0, length: unknown.length }];
  const out = [];
  let offset = 0;
  let current;
  for (const page of pages) {
    const len = page.indices.length;
    if (!len) continue;
    if (mode === 'page' || !current || starts.has(page.page)) {
      current = { offset, length: 0 };
      out.push(current);
    }
    current.length += len;
    offset += len;
  }
  assert.equal(offset, unknown.length);
  return out;
}
function collisions(sequence, segs, startAt = 0) {
  const counts = Array.from({ length: 29 }, () => Array(29).fill(0));
  for (const { offset, length } of segs) {
    for (let i = 0; i < length; i++) counts[i % 29][sequence[startAt + offset + i]]++;
  }
  return counts.reduce((sum, row) =>
    sum + row.reduce((n, v) => n + v * (v - 1), 0), 0);
}
function scanAllNativeWindows(sequence, segs) {
  const width = unknown.length;
  assert.ok(sequence.length >= width);
  const counts = Array.from({ length: 29 }, () => Array(29).fill(0));
  const size = Array(29).fill(0);
  for (const { offset, length } of segs) {
    for (let j = 0; j < length; j++) {
      counts[j % 29][sequence[offset + j]]++;
      size[j % 29]++;
    }
  }
  const denominator = size.reduce((s, n) => s + n * (n - 1), 0);
  let numerator = counts.reduce((s, row) =>
    s + row.reduce((v, n) => v + n * (n - 1), 0), 0);
  assert.equal(numerator, collisions(sequence, segs));
  let min = numerator;
  let bestWindow = 0;
  let rotation = 0;
  for (let begin = 0; begin + width < sequence.length; begin++) {
    rotation = (rotation + 1) % 29; // every retained rune moves one phase left
    for (const { offset, length } of segs) {
      const lossRow = counts[(28 + rotation) % 29];
      const lost = sequence[begin + offset];
      const old = lossRow[lost];
      numerator -= old * (old - 1);
      lossRow[lost]--;
      numerator += (old - 1) * (old - 2);

      const gainRow = counts[((length - 1) % 29 + rotation) % 29];
      const gained = sequence[begin + offset + length];
      const prior = gainRow[gained];
      numerator -= prior * (prior - 1);
      gainRow[gained]++;
      numerator += (prior + 1) * prior;
    }
    const start = begin + 1;
    if (start <= 5 || start === sequence.length - width)
      assert.equal(numerator, collisions(sequence, segs, start));
    if (numerator < min) {
      min = numerator;
      bestWindow = start;
    }
  }
  return {
    windows: sequence.length - width + 1,
    minCollisionCount: min,
    denominator,
    minIoc: min / denominator,
    bestWindow
  };
}
const expected = {
  book: {
    unknown: 199294,
    gibran: [330770, 39971, 5775254],
    shakespeare: [322806, 189165, 5775254]
  },
  chapter: {
    unknown: 199600,
    gibran: [331194, 17673, 5775528],
    shakespeare: [323244, 188842, 5775528]
  },
  page: {
    unknown: 199966,
    gibran: [330984, 16549, 5783088],
    shakespeare: [322446, 189275, 5783088]
  }
};
const output = {};
for (const mode of ['book', 'chapter', 'page']) {
  const segs = segments(mode);
  const original = collisions(unknown, segs);
  assert.equal(original, expected[mode].unknown);
  const nativeResults = {};
  for (const name of ['gibran', 'shakespeare']) {
    const result = scanAllNativeWindows(native[name], segs);
    assert.deepEqual(
      [result.minCollisionCount, result.bestWindow, result.denominator],
      expected[mode][name]);
    assert.ok(original < result.minCollisionCount);
    nativeResults[name] = result;
  }
  output[mode] = { segments: segs.length, original,
    originalIoc: original / nativeResults.gibran.denominator,
    native: nativeResults };
}

// A secret independent permutation for each of 29 positions must leave
// the period-stratified collision count exactly invariant, for all resets.
const perms = Array.from({ length: 29 }, (_, phase) =>
  Array.from({ length: 29 }, (_, rune) => (rune * 3 + phase * 11) % 29));
assert.equal(new Set(perms[0]).size, 29);
for (const mode of ['book', 'chapter', 'page']) {
  let offset = 0;
  const transformed = [];
  for (const seg of segments(mode)) {
    assert.equal(seg.offset, offset);
    for (let i = 0; i < seg.length; i++) {
      transformed.push(perms[i % 29][unknown[offset + i]]);
    }
    offset += seg.length;
  }
  assert.equal(collisions(transformed, segments(mode)), output[mode].original);
  assert.equal(transformed.length, unknown.length);
}
console.log(JSON.stringify(output, null, 2));
