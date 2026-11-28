#!/usr/bin/env node
"use strict";

/**
 * Exact source-only integration test:
 *   p6 adjacent-H schedule -> p23 [K,a,e,g]
 *   p24-p26 count triangle -> A
 *   DH branch ambiguity -> p27 red [B,b,K] selector
 *
 * This is a structural state-handoff test, not plaintext recovery.
 * Run from repository root with Node.js 22:
 *   node sims/lp2_p6_p23_p27_local_dh_state_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const load = (p) => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(load("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(load("resources/liber-primus/lp2-ink-annotations.json"));
const transcript = load("resources/liber-primus/lp2-transcription.txt").split("%");
const runeId = new Map(corpus.runes.map((glyph, index) => [glyph, index]));
const pages = corpus.pages.filter((row) => row.page >= 0 && row.page <= 55);
assert.equal(pages.length, 56);

const mod29 = (n) => ((n % 29) + 29) % 29;
const H = (x, y) => [mod29(x - y), mod29(x + y)];
const modPow = (base, exponent, modulus) => {
  let result = 1n;
  let x = BigInt(base);
  let n = BigInt(exponent);
  const m = BigInt(modulus);
  while (n > 0n) {
    if ((n & 1n) === 1n) result = (result * x) % m;
    x = (x * x) % m;
    n >>= 1n;
  }
  return Number(result);
};
const page = (n) => {
  const row = pages.find((x) => x.page === n);
  assert.ok(row, `missing page p${n}`);
  return row;
};
const segment = (p) => p === 50 ? "" : transcript[p >= 51 ? p - 1 : p];

function pageWords(p) {
  if (p === 50) return [];
  const pg = page(p);
  const raw = segment(p);
  assert.ok(raw, `missing transcription p${p}`);
  const words = [];
  let current = [];
  let runeOffset = 0;
  for (const symbol of raw) {
    if (runeId.has(symbol)) {
      assert.equal(pg.indices[runeOffset], runeId.get(symbol), `p${p} transcription mismatch`);
      current.push(runeOffset);
      runeOffset += 1;
    } else if ("-.&$§".includes(symbol) && current.length) {
      words.push(current);
      current = [];
    }
  }
  if (current.length) words.push(current);
  assert.equal(runeOffset, pg.indices.length, `p${p} rune count mismatch`);
  return words;
}

const wordCache = new Map(pages.map((row) => [row.page, pageWords(row.page)]));

function redRows() {
  const rows = [];
  for (const pg of pages) {
    const ann = ink.pages.find((x) => x.page === pg.page);
    if (!ann || pg.page === 50) continue;
    const isRed = Array(pg.indices.length).fill(false);
    for (const span of ann.red_spans || []) {
      for (let k = span.start; k < span.start + span.length; k += 1) isRed[k] = true;
    }
    for (const span of ann.red_spans || []) {
      const words = wordCache.get(pg.page);
      const inside = words.filter(
        (w) => w[0] >= span.start && w.at(-1) < span.start + span.length
      );
      const following = words.find(
        (w) => w[0] === span.start + span.length && w.every((k) => !isRed[k])
      );
      const redValues = pg.indices.slice(span.start, span.start + span.length);
      const redSum = redValues.reduce((sum, value) => sum + value, 0);
      const followingSum = following
        ? following.reduce((sum, k) => sum + pg.indices[k], 0)
        : null;
      rows.push({
        page: pg.page,
        start: span.start,
        redLength: span.length,
        wordLengths: inside.map((w) => w.length),
        redSumMod29: mod29(redSum),
        followingBlackSumMod29: followingSum === null ? null : mod29(followingSum),
      });
    }
  }
  return rows;
}

const reds = redRows();
assert.equal(reds.length, 16);

const p6 = reds.find((r) => r.page === 6 && r.start === 71);
const p23 = reds.find((r) => r.page === 23 && r.start === 0);
const p27 = reds.find((r) => r.page === 27 && r.start === 0);
assert.ok(p6 && p23 && p27);

assert.deepEqual(p6.wordLengths, [4, 1, 4, 2]);
const p6H = [...H(4, 1), ...H(4, 2)];
assert.deepEqual(p6H, [3, 5, 2, 6]);
const p23Predicted = [p6H[2], p6H[3], p6H[0], p6H[1]];
assert.deepEqual(p23Predicted, [2, 6, 3, 5]);
assert.deepEqual(p23.wordLengths, p23Predicted);

// The p6->p23 bridge types the local tuple as [K,a,e,g].
const [K, a, e, g] = p23Predicted;
const p = 23;
assert.deepEqual({ p, g, a, K, e }, { p: 23, g: 5, a: 6, K: 2, e: 3 });

const A = modPow(g, a, p);
assert.equal(A, 8);

// Independent mayfly-page geometry supplies [e,g,A] edge by edge.
const counts = [page(24).runic_count, page(25).runic_count, page(26).runic_count];
assert.deepEqual(counts, [270, 273, 265]);
const edges = {
  "24-25": Math.abs(counts[0] - counts[1]),
  "24-26": Math.abs(counts[0] - counts[2]),
  "25-26": Math.abs(counts[1] - counts[2]),
};
assert.deepEqual(edges, { "24-25": e, "24-26": g, "25-26": A });

// Given p,g,a,K,A, ordinary DH leaves exactly two private-b branches.
const bBranches = [];
for (let b = 1; b < p; b += 1) {
  if (modPow(A, b, p) !== K) continue;
  const B = modPow(g, b, p);
  if (modPow(B, a, p) !== K) continue;
  bBranches.push({ b, B });
}
assert.deepEqual(bBranches, [{ b: 4, B: 4 }, { b: 15, B: 19 }]);

// P27 supplies a literal three-field receiver: red length, red GP0 sum,
// and first following-black-word GP0 sum.
assert.deepEqual(
  [p27.redLength, p27.redSumMod29, p27.followingBlackSumMod29],
  [19, 15, K]
);

const branchMatches = bBranches.filter(
  ({ b, B }) =>
    p27.redLength === B &&
    p27.redSumMod29 === b &&
    p27.followingBlackSumMod29 === K
);
assert.deepEqual(branchMatches, [{ b: 15, B: 19 }]);

// Charge the same [B,b,K] triple against every physical red span.
const allBranchHits = [];
for (const row of reds) {
  for (const branch of bBranches) {
    if (
      row.redLength === branch.B &&
      row.redSumMod29 === branch.b &&
      row.followingBlackSumMod29 === K
    ) {
      allBranchHits.push({
        page: row.page,
        start: row.start,
        branch,
        triple: [row.redLength, row.redSumMod29, row.followingBlackSumMod29],
      });
    }
  }
}

console.log(JSON.stringify({
  classification: "source-only local DH-state handoff; no plaintext/key claim",
  p6Lengths: p6.wordLengths,
  p6AdjacentH: p6H,
  p23HeadingLengths: p23.wordLengths,
  p23TypedState: { p, K, a, e, g },
  mayflyCounts: counts,
  mayflyEdges: edges,
  derivedA: A,
  dhBBranches: bBranches,
  p27Fields: {
    redLength: p27.redLength,
    redSumMod29: p27.redSumMod29,
    followingBlackSumMod29: p27.followingBlackSumMod29,
  },
  selectedBranch: branchMatches[0],
  allRedSpanBranchHits: allBranchHits,
}, null, 2));
