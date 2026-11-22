#!/usr/bin/env node
"use strict";

// Test the direct p0 red-heading -> p49-51 32x8 table -> five-shift key
// hypothesis against the original unknown LP2 ciphertext.
// Run from repository root: node sims/lp2_red_heading_p50_column_key_sft.cjs

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const ROOT = path.resolve(__dirname, "..");
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(ROOT, name), "utf8"));
const corpus = readJson("resources/liber-primus/lp2-corpus.json");
const grid = readJson("resources/liber-primus/base60-grid.json");
const mod = (n, m) => ((n % m) + m) % m;
const mod29 = (n) => mod(n, 29);

const p0 = corpus.pages.find((p) => p.page === 0);
assert.ok(p0);
assert.equal(corpus.runes.length, 29);
assert.equal(p0.indices.length, 262);
const heading = p0.indices.slice(0, 13);
assert.equal(heading.length, 13);
const primeSum = (values) => values.reduce((sum, rune) => sum + corpus.prime[rune], 0);
const headingSums = [
  primeSum(heading.slice(0, 8)),
  primeSum(heading.slice(8, 13)),
];
assert.deepEqual(headingSums, [347, 315]);
assert.equal(headingSums[0] - headingSums[1], 32);

assert.equal(grid.rows.length, 32);
assert.ok(grid.rows.every((row) => row.length === 8));
assert.equal(grid.alphabet.length, 60);
const base60 = (token) => {
  const hi = grid.alphabet.indexOf(token[0]);
  const lo = grid.alphabet.indexOf(token[1]);
  assert.ok(hi >= 0 && lo >= 0, "invalid base60 token " + token);
  return hi * 60 + lo;
};

function makeCandidate(indexing) {
  const zeroBased = indexing === "zero-based";
  const start = zeroBased
    ? headingSums[0] % 256
    : mod(headingSums[0] - 1, 256);
  const end = zeroBased
    ? headingSums[1] % 256
    : mod(headingSums[1] - 1, 256);
  const indices = Array.from({ length: 5 }, (_, i) => start - 8 * i);
  assert.equal(indices[4], end);
  const cells = indices.map((index) => {
    const row = Math.floor(index / 8);
    const col = index % 8;
    const token = grid.rows[row][col];
    const byte = base60(token);
    return { index, row, col, token, byte, shift: byte % 29 };
  });
  return {
    indexing,
    endpointAddresses: [headingSums[0] % 256, headingSums[1] % 256],
    indices,
    cells,
    key: cells.map((cell) => cell.shift),
  };
}

const candidates = [
  makeCandidate("zero-based"),
  makeCandidate("one-based"),
];
assert.deepEqual(candidates[0].cells.map((c) => c.token), ["0n", "3D", "2v", "3C", "19"]);
assert.deepEqual(candidates[0].key, [20, 19, 3, 18, 11]);
assert.deepEqual(candidates[1].cells.map((c) => c.token), ["3I", "3L", "3P", "0P", "2Q"]);
assert.deepEqual(candidates[1].key, [24, 27, 2, 25, 1]);

// Keep exact source page/rune locations. p0's first 13 runes are the red title;
// all subsequent runes through p55 are the unknown black-body ciphertext.
const unknown = [];
const locations = [];
for (const page of corpus.pages.filter((p) => p.page <= 55 && p.page !== 50)) {
  const start = page.page === 0 ? 13 : 0;
  for (let i = start; i < page.indices.length; i++) {
    unknown.push(page.indices[i]);
    locations.push({ page: page.page, pageRuneOffset: i });
  }
}
assert.equal(unknown.length, 12943);

function scaledIC(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  const numerator = counts.reduce((sum, count) => sum + count * (count - 1), 0);
  return 29 * numerator / (values.length * (values.length - 1));
}

// No-skip additive inverse: P = C + sign*K, with the key clock on every rune.
function noSkipScaledIC(cipher, key, sign) {
  const plain = cipher.map((value, i) => mod29(value + sign * key[i % key.length]));
  return scaledIC(plain);
}

// Exact reachability for the historical plaintext-F bypass under a periodic
// five-symbol key. The sufficient state is consumed-key phase modulo five.
// Ciphertext F can either be literal plaintext F (no consumption) or a
// non-F plaintext that consumes a key symbol. A consuming transition that
// yields plaintext F is forbidden by the forward rule.
function firstTransparentDead(cipher, key, sign, sourceLocations) {
  let phases = new Set([0]);
  for (let offset = 0; offset < cipher.length; offset++) {
    const ciphertext = cipher[offset];
    const next = new Set();
    for (const phase of phases) {
      if (ciphertext === 0) next.add(phase);
      const plain = mod29(ciphertext + sign * key[phase]);
      if (plain !== 0) next.add((phase + 1) % key.length);
    }
    if (next.size === 0) {
      return {
        offset,
        source: sourceLocations ? sourceLocations[offset] : null,
        ciphertext,
        priorPhases: Array.from(phases),
        impossibleTransitions: Array.from(phases).map((phase) => ({
          phase,
          keyValue: key[phase],
          forcedPlain: mod29(ciphertext + sign * key[phase]),
        })),
      };
    }
    phases = next;
  }
  return { firstDead: null, finalPhases: Array.from(phases) };
}

// A positive implementation control: encrypt known clear p57 with the same
// candidate key and F-bypass rule. The authentic p57 text is used only as a
// planted control, never as an unknown-page crib.
function encryptTransparent(plain, key, sign) {
  let consumed = 0;
  return plain.map((value) => {
    if (value === 0) return 0;
    const cipher = mod29(value - sign * key[consumed % key.length]);
    consumed++;
    return cipher;
  });
}

const p57 = corpus.pages.find((p) => p.page === 57).indices;
assert.equal(p57.length, 95);

const results = candidates.map((candidate) => {
  const minus = firstTransparentDead(unknown, candidate.key, -1, locations);
  const plus = firstTransparentDead(unknown, candidate.key, 1, locations);
  assert.ok(minus.offset !== undefined, "zero-dead minus path unexpectedly survived");
  assert.ok(plus.offset !== undefined, "zero-dead plus path unexpectedly survived");

  const minusPlant = firstTransparentDead(
    encryptTransparent(p57, candidate.key, -1), candidate.key, -1, null
  );
  const plusPlant = firstTransparentDead(
    encryptTransparent(p57, candidate.key, 1), candidate.key, 1, null
  );
  assert.equal(minusPlant.firstDead, null);
  assert.equal(plusPlant.firstDead, null);

  return {
    indexing: candidate.indexing,
    cells: candidate.cells,
    key: candidate.key,
    noSkipScaledIC: {
      decryptSubtract: noSkipScaledIC(unknown, candidate.key, -1),
      decryptAdd: noSkipScaledIC(unknown, candidate.key, 1),
    },
    transparentF: {
      decryptSubtract: minus,
      decryptAdd: plus,
    },
    p57Plant: { decryptSubtractPasses: true, decryptAddPasses: true },
  };
});

assert.deepEqual(
  results.map((r) => [r.transparentF.decryptSubtract.offset, r.transparentF.decryptAdd.offset]),
  [[7, 21], [3, 220]]
);
assert.deepEqual(
  results.map((r) => [
    r.transparentF.decryptSubtract.source.pageRuneOffset,
    r.transparentF.decryptAdd.source.pageRuneOffset,
  ]),
  [[20, 34], [16, 233]]
);

console.log(JSON.stringify({
  hypothesis: "p0 red-heading prime sums modulo256 address a five-cell p49-51 table path; base60 cell bytes modulo29 form a repeating additive GP29 key",
  headingRuneLengths: [8, 5],
  headingPrimeSums: headingSums,
  difference: 32,
  tableShape: [32, 8],
  unknownRuneCount: unknown.length,
  keyCandidates: results,
  decision: "Both indexing conventions and both additive directions fail the original plaintext-F-transparent inverse inside p0; no-skip IC remains at the uniform GP29 baseline.",
}, null, 2));
