'use strict';

// One-file, read-only, source-exact original LP2 GP29 cubic-orbit test.
// Run: node sims/lp2_signed_cube_orbit_allkey_sft.cjs

const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const readText = (p) => readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(readText('resources/liber-primus/lp2-corpus.json'));
const labels = corpus.translit;
assert.equal(labels.length, 29);

const cube = (v) => (v * v * v) % 29;

/** @param {number} v @param {number} power @returns {number} */
function cubePower(v, power) {
  for (let i = 0; i < power; i++) v = cube(v);
  return v;
}

const cycles = [];
const orbit = Array(29).fill(-1);
for (let x = 0; x < 29; x++) {
  if (orbit[x] !== -1) continue;
  const group = [];
  let v = x;
  while (orbit[v] === -1) {
    orbit[v] = cycles.length;
    group.push(v);
    v = cube(v);
  }
  assert.equal(v, x);
  cycles.push(group);
}
assert.deepEqual(cycles, [
  [0], [1], [2, 8, 19, 15, 11, 26],
  [3, 27, 21, 10, 14, 18],
  [4, 6, 13, 22, 5, 9],
  [7, 24, 20, 25, 23, 16],
  [12, 17], [28]
]);
for (let x = 0; x < 29; x++) assert.equal(cubePower(x, 6), x);

const digraphs = ['TH', 'NG', 'EO', 'OE', 'AE', 'IA', 'EA'];

/** Historical GP spelling normalization and longest-two-rune matching. */
function latinToGP(text) {
  const normalized = text.toUpperCase().replace(/[^A-Z]/g, '')
    .replace(/QU/g, 'CW')
    .replace(/ING/g, 'NG')
    .replace(/IO/g, 'IA')
    .replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C')
    .replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < normalized.length;) {
    const token = digraphs.find((d) => normalized.startsWith(d, i)) || normalized[i];
    const index = labels.indexOf(token);
    assert.ok(index !== -1, 'Invalid GP token: ' + token);
    out.push(index);
    i += token.length;
  }
  return out;
}

/** @param {number[]} indices @returns {number[]} */
function orbitCounts(indices) {
  const result = Array(cycles.length).fill(0);
  for (const i of indices) {
    assert.ok(Number.isInteger(i) && i >= 0 && i < 29);
    result[orbit[i]]++;
  }
  return result;
}

/** Minimum necessary orbit-changing positions under arbitrary bijection/reordering. */
function orbitMoveLowerBound(sourceCounts, targetCounts) {
  return sourceCounts.reduce((sum, n, i) => sum + Math.abs(n - targetCounts[i]), 0) / 2;
}

/** Slide the exact source-length register across ALL contiguous native-English windows. */
function nativeWindowBounds(native, targetCounts, sourceLength) {
  assert.ok(native.length >= sourceLength);
  const counts = orbitCounts(native.slice(0, sourceLength));
  let minMoves = Infinity;
  let bestOffset = -1;
  let bestCounts = null;
  let minEOB = Infinity, maxEOB = -Infinity;
  let minEA = Infinity, maxEA = -Infinity;
  for (let begin = 0; begin + sourceLength <= native.length; begin++) {
    if (begin > 0) {
      counts[orbit[native[begin - 1]]]--;
      counts[orbit[native[begin + sourceLength - 1]]]++;
    }
    const moves = orbitMoveLowerBound(targetCounts, counts);
    if (moves < minMoves) {
      minMoves = moves;
      bestOffset = begin;
      bestCounts = [...counts];
    }
    minEOB = Math.min(minEOB, counts[orbit[12]]);
    maxEOB = Math.max(maxEOB, counts[orbit[12]]);
    minEA = Math.min(minEA, counts[orbit[28]]);
    maxEA = Math.max(maxEA, counts[orbit[28]]);
  }
  return {
    windows: native.length - sourceLength + 1,
    minMoves,
    bestOffset,
    bestCounts,
    EOB: [minEOB, maxEOB],
    EA: [minEA, maxEA]
  };
}

const unknownPages = corpus.pages.filter((p) => p.page <= 55);
assert.equal(unknownPages.length, 56);
assert.equal(unknownPages.filter((p) => p.indices.length !== 0).length, 55);
const unknown = unknownPages.flatMap((p) => p.indices);
assert.equal(unknown.length, 12956);
const observed = orbitCounts(unknown);
assert.deepEqual(observed, [458, 450, 2637, 2750, 2688, 2669, 844, 460]);

// Same-book genuine cleartext check, without imposing our modern spelling encoder.
const solved57 = corpus.pages.find((p) => p.page === 57).indices;
assert.equal(solved57.length, 95);
assert.deepEqual(orbitCounts(solved57), [3, 6, 14, 28, 23, 20, 1, 0]);

// Independent authentically solved LP1 prose excerpts, each section included once.
const lp1 = readText('resources/liber-primus/lp1-plaintext-reference.txt');
const marks = [...lp1.matchAll(/^### (\d+)\n/gm)];
const sections = Object.fromEntries(marks.map((m, i) => [
  +m[1], lp1.slice(m.index + m[0].length, marks[i + 1]?.index ?? lp1.length)
]));
const selectedLP1 = [1, 3, 6, 10, 12, 14, 15]
  .map((n) => sections[n].replace(/\(.*?\)/gs, '').replace(/\d+/g, '')).join(' ');
const nativeLP1 = latinToGP(selectedLP1);
assert.equal(nativeLP1.length, 2357);
assert.deepEqual(orbitCounts(nativeLP1), [39, 123, 0, 0, 0, 0, 31, 23].map((v, i) => {
  // Only compare the invariant fixed and two-cycle bins; other bins are computed below.
  return i === 0 || i === 1 || i === 6 || i === 7 ? v : orbitCounts(nativeLP1)[i];
}));

const gibran = latinToGP(readText('resources/control/gibran_prophet_58585.txt'));
const shakespeare = latinToGP(readText('resources/control/shakespeare_first300k.txt'));
assert.equal(gibran.length, 61918);
assert.equal(shakespeare.length, 215146);
const g = nativeWindowBounds(gibran, observed, unknown.length);
const s = nativeWindowBounds(shakespeare, observed, unknown.length);
assert.deepEqual(
  [g.windows, g.minMoves, g.bestOffset, g.EOB, g.EA],
  [48963, 1247, 16691, [193, 281], [81, 245]]
);
assert.deepEqual(
  [s.windows, s.minMoves, s.bestOffset, s.EOB, s.EA],
  [202191, 1213, 149402, [214, 322], [95, 189]]
);

// Full-length native positive: an arbitrary per-symbol secret cube exponent
// and a complete position reversal cannot change the eight orbit totals.
const original = gibran.slice(0, unknown.length);
const altered = original.map((r, i) => cubePower(r, (7 * i + 3) % 6));
assert.deepEqual(orbitCounts(altered), orbitCounts(original));
assert.deepEqual(orbitCounts([...altered].reverse()), orbitCounts(original));
const roundTrip = altered.map((r, i) => cubePower(r, (6 - (7 * i + 3) % 6) % 6));
assert.deepEqual(roundTrip, original);

console.log(JSON.stringify({
  originalRunes: unknown.length,
  cycles: cycles.map((members) => members.map((i) => labels[i]).join('/')),
  originalOrbitCounts: observed,
  lp1Native: { runes: nativeLP1.length, orbitCounts: orbitCounts(nativeLP1) },
  p57Clear: { runes: solved57.length, orbitCounts: orbitCounts(solved57) },
  gibran: g,
  shakespeare: s,
  minimumOrbitChangingRunesForMatchedNativeEnglish: Math.min(g.minMoves, s.minMoves),
  positiveNativeRoundTrip: original.length
}, null, 2));
