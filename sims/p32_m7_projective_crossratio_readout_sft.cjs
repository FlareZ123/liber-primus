#!/usr/bin/env node
"use strict";

// Source-fixed p32 M7 cross-ratio readout gate.
// Run from repository root with Node 22. No third-party dependencies.
const fs = require("node:fs");
const assert = require("node:assert/strict");

const read = (p) => fs.readFileSync(p, "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const gibran = read("resources/control/gibran_prophet_58585.txt");

const mod = (n) => ((n % 29) + 29) % 29;
const inv = (n) => {
  for (let i = 1; i < 29; i++) if (mod(n * i) === 1) return i;
  throw new Error("non-invertible field element");
};
const applyPGL = (A, x) => {
  const [a, b, c, d] = [A[0][0], A[0][1], A[1][0], A[1][1]];
  if (x === null) return c === 0 ? null : mod(a * inv(c));
  const den = mod(c * x + d);
  return den === 0 ? null : mod((a * x + b) * inv(den));
};
const multiply2 = (A, B) => [
  [mod(A[0][0] * B[0][0] + A[0][1] * B[1][0]), mod(A[0][0] * B[0][1] + A[0][1] * B[1][1])],
  [mod(A[1][0] * B[0][0] + A[1][1] * B[1][0]), mod(A[1][0] * B[0][1] + A[1][1] * B[1][1])]
];

const M7 = [[14, 25], [25, 28]];
const corrections = [3, 0, 8];
const maps = corrections.map((n) => multiply2([[1, mod(n)], [0, 1]], M7));
assert.equal(applyPGL(M7, 22), 22);
assert.equal(applyPGL(M7, 25), 25);

const pages = [];
const allRunes = [];
let globalOffset = 0;
for (const page of corpus.pages) {
  pages.push({ page: page.page, start: globalOffset, indices: page.indices });
  allRunes.push(...page.indices);
  globalOffset += page.indices.length;
}

const marks = [];
for (const pageInk of ink.pages) {
  const page = pages.find((p) => p.page === pageInk.page);
  for (const event of (pageInk.large_punctuation || [])) {
    if (event[1] === 13) marks.push(page.start + event[0]);
  }
}
marks.sort((a, b) => a - b);
assert.equal(marks.length, 31);
const bounds = [0, ...marks, allRunes.length];
const fragments = bounds.slice(0, -1).map((start, i) => ({
  id: i + 1,
  start,
  end: bounds[i + 1],
  seq: allRunes.slice(start, bounds[i + 1])
})).filter((f) => f.seq.length > 0);
assert.equal(fragments.length, 30);

const ranked = fragments.map((f) => ({
  ...f,
  row: f.id - 1,
  rankByte: grid.bytes[(f.id - 1) * 8 + 1]
})).sort((a, b) => a.rankByte - b.rankByte);
assert.equal(new Set(ranked.map((f) => f.rankByte)).size, 30);
assert.equal(ranked[25].id, 22);
assert.equal(ranked[25].seq.length, 8);
const firstRuneForRank = (rank) => ranked[rank].seq[0];
const rowForRank = (rank) => ranked[rank].row;

const p33 = pages.find((p) => p.page === 33);
const heading = p33.indices.slice(91, 99);
assert.equal(heading.length, 8);
assert.deepEqual(heading, ranked[25].seq);

const states = [[13, 23, 2]];
for (let n = 1; n < 210; n++) {
  states.push(states[n - 1].map((x, i) => applyPGL(maps[i], x)));
}
assert.deepEqual(states[1], [27, 5, 15]);
const nextState = (s) => s.map((x, i) => applyPGL(maps[i], x));
assert.deepEqual(nextState(states[209]), states[0]);

// Reverse traversal starts at the p39 image of the p3 seed, then walks
// backward through the same 210-state cycle.
const reverseStates = [states[1], states[0], ...states.slice(2).reverse()];
assert.equal(reverseStates.length, 210);
for (let i = 0; i < 209; i++) {
  assert.deepEqual(nextState(reverseStates[i + 1]), reverseStates[i]);
}

const target = pages.filter((p) => p.page >= 33 && p.page <= 39).flatMap((p) => p.indices);
assert.equal(target.length, 1680);

const point = (x) => x === null ? [1, 0] : [x, 1];
const determinant = (u, v) => mod(u[0] * v[1] - u[1] * v[0]);

// Returns finite 0..28, null for projective infinity, undefined for 0/0.
function crossRatio(a, b, c, d) {
  const numerator = mod(determinant(point(a), point(c)) * determinant(point(b), point(d)));
  const denominator = mod(determinant(point(a), point(d)) * determinant(point(b), point(c)));
  if (denominator === 0) return numerator === 0 ? undefined : null;
  return mod(numerator * inv(denominator));
}

function makeKey(kind, stateList) {
  const key = [];
  let infinity = 0;
  let undefinedCount = 0;
  const row22 = grid.bytes.slice(21 * 8, 22 * 8).map(mod);

  for (const state of stateList) {
    const selectedRows = state.map((x) => rowForRank(x === null ? 29 : x));
    for (let col = 0; col < 8; col++) {
      let result;
      if (kind === "state+row22") {
        result = crossRatio(state[0], state[1], state[2], row22[col]);
      } else if (kind === "state+heading") {
        result = crossRatio(state[0], state[1], state[2], heading[col]);
      } else if (kind === "rows+heading") {
        const values = selectedRows.map((row) => mod(grid.bytes[row * 8 + col]));
        result = crossRatio(values[0], values[1], values[2], heading[col]);
      } else {
        throw new Error("unknown readout kind: " + kind);
      }

      if (result === undefined) {
        undefinedCount++;
        key.push(null); // preserve a genuine projective degeneracy as an erasure
      } else {
        if (result === null) infinity++;
        const rank = result === null ? 29 : result;
        key.push(firstRuneForRank(rank));
      }
    }
  }
  assert.equal(key.length, 1680);
  return { key, infinity, undefinedCount };
}

const tokens = corpus.translit.map((s, i) => ({ s, i })).sort((a, b) => b.s.length - a.s.length);
function encodeEnglishControl(text) {
  const out = [];
  for (let word of (text.toUpperCase().match(/[A-Z]+/g) || [])) {
    word = word.replace(/QU/g, "CW").replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S").replace(/ING/g, "NG");
    for (let j = 0; j < word.length;) {
      const token = tokens.find((t) => word.startsWith(t.s, j));
      if (!token) throw new Error("unmapped control text at " + word.slice(j));
      out.push(token.i);
      j += token.s.length;
    }
  }
  return out;
}
const native = encodeEnglishControl(gibran);
const train = native.slice(0, 40000);
const controlPlain = native.slice(40000, 41680);
assert.equal(controlPlain.length, 1680);
const trigramCounts = new Map();
for (let i = 2; i < train.length; i++) {
  const key = train[i - 2] * 841 + train[i - 1] * 29 + train[i];
  trigramCounts.set(key, (trigramCounts.get(key) || 0) + 1);
}
const denominator = train.length - 2 + 0.1 * 29 ** 3;

function trigramScore(seq) {
  let sum = 0;
  let windows = 0;
  for (let i = 2; i < seq.length; i++) {
    if (seq[i - 2] == null || seq[i - 1] == null || seq[i] == null) continue;
    const key = seq[i - 2] * 841 + seq[i - 1] * 29 + seq[i];
    sum += Math.log(((trigramCounts.get(key) || 0) + 0.1) / denominator);
    windows++;
  }
  return { score: sum / windows, windows };
}
function ioc(seq) {
  const freq = Array(29).fill(0);
  let n = 0;
  for (const x of seq) if (x != null) { freq[x]++; n++; }
  return { value: freq.reduce((s, x) => s + x * (x - 1), 0) / (n * (n - 1)), n };
}

const variants = [];
for (const [orientation, stateList, ciphertext] of [
  ["p3-forward", states, target],
  ["p39-backward", reverseStates, [...target].reverse()]
]) {
  for (const kind of ["state+row22", "state+heading", "rows+heading"]) {
    const built = makeKey(kind, stateList);
    for (const sign of [-1, 1]) {
      const decoded = ciphertext.map((c, i) => built.key[i] == null ? null : mod(c + sign * built.key[i]));
      const rawMasked = ciphertext.map((c, i) => built.key[i] == null ? null : c);
      const encodedControl = controlPlain.map((p, i) => built.key[i] == null ? null : mod(p + built.key[i]));
      const recoveredControl = encodedControl.map((c, i) => c == null ? null : mod(c - built.key[i]));
      const positiveControlExact = recoveredControl.every((x, i) => x == null || x === controlPlain[i]);
      assert.equal(positiveControlExact, true);
      variants.push({
        kind,
        orientation,
        sign,
        infinity: built.infinity,
        erasures: built.undefinedCount,
        validPositions: decoded.filter((x) => x != null).length,
        ioc: ioc(decoded),
        trigram: trigramScore(decoded),
        rawMaskedTrigram: trigramScore(rawMasked),
        positiveControlExact
      });
    }
  }
}

const raw = { ioc: ioc(target), trigram: trigramScore(target) };
const nativeControl = { ioc: ioc(controlPlain), trigram: trigramScore(controlPlain) };
const scores = variants.map((v) => v.trigram.score);
const output = {
  statePeriod: states.length,
  p3Seed: states[0],
  p39OneStep: states[1],
  fragmentCount: fragments.length,
  emptyFragmentIds: bounds.slice(0, -1).map((s, i) => ({ id: i + 1, n: bounds[i + 1] - s })).filter((x) => x.n === 0).map((x) => x.id),
  fixedRank25: { fragmentId: ranked[25].id, p50Row: ranked[25].row + 1, length: ranked[25].seq.length },
  p33Heading: heading,
  targetRunes: target.length,
  raw,
  nativeControl,
  variantCount: variants.length,
  bestTrigram: Math.max(...scores),
  worstTrigram: Math.min(...scores),
  minErasureCount: Math.min(...variants.map((v) => v.erasures)),
  maxErasureCount: Math.max(...variants.map((v) => v.erasures)),
  minInfinityCount: Math.min(...variants.map((v) => v.infinity)),
  maxInfinityCount: Math.max(...variants.map((v) => v.infinity)),
  variants
};
process.stdout.write(JSON.stringify(output, null, 2) + "\n");
