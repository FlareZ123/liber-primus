#!/usr/bin/env node
"use strict";

/**
 * Source-only receiver charge:
 *   p6 -> p23 local DH state
 *   p24-p26 -> A
 *   p27 red rubric -> select (b,B)
 *   DH-state value as p27 word number, DH-state value as shedding depth
 *   -> unique p57 clear-word checksum/length hit.
 *
 * This does not decrypt the selected core. It selects a ciphertext/semantic
 * receiver under a finite, source-motivated state/index/shedding family.
 *
 * Run from repository root:
 *   node sims/lp2_p27_dh_state_word19_divinity_receiver_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const parts = read("resources/liber-primus/lp2-transcription.txt").split("%");

const runeId = new Map(corpus.runes.map((glyph, i) => [glyph, i]));
const mod29 = (x) => ((x % 29) + 29) % 29;
const H = (x, y) => [mod29(x - y), mod29(x + y)];
const page = (n) => {
  const row = corpus.pages.find((x) => x.page === n);
  assert.ok(row, `missing p${n}`);
  return row;
};
const part = (p) => p === 50 ? "" : parts[p >= 51 ? p - 1 : p];

function words(p) {
  const raw = part(p);
  const out = [];
  let values = [];
  let start = 0;
  let offset = 0;
  const emit = () => {
    if (!values.length) return;
    out.push({ start, values });
    values = [];
  };
  for (const ch of raw) {
    if (runeId.has(ch)) {
      if (!values.length) start = offset;
      values.push(runeId.get(ch));
      offset += 1;
    } else if ("-.&$§".includes(ch)) {
      emit();
    }
  }
  emit();
  assert.equal(offset, page(p).indices.length, `p${p} rune count mismatch`);
  return out;
}

const translit = (values) => values.map((v) => corpus.translit[v]).join("");
const primeSum = (values) => values.reduce((sum, v) => sum + corpus.prime[v], 0);
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

function redWordLengths(p, start) {
  const ann = ink.pages.find((x) => x.page === p);
  assert.ok(ann);
  const span = (ann.red_spans || []).find((x) => x.start === start);
  assert.ok(span);
  return words(p)
    .filter((w) =>
      w.start >= span.start &&
      w.start + w.values.length <= span.start + span.length
    )
    .map((w) => w.values.length);
}

function redFields(p, start) {
  const ann = ink.pages.find((x) => x.page === p);
  const span = ann.red_spans.find((x) => x.start === start);
  assert.ok(span);
  const pg = page(p);
  const isRed = Array(pg.indices.length).fill(false);
  for (const s of ann.red_spans || []) {
    for (let i = s.start; i < s.start + s.length; i += 1) isRed[i] = true;
  }
  const ws = words(p);
  const following = ws.find(
    (w) =>
      w.start === span.start + span.length &&
      w.values.every((_, j) => !isRed[w.start + j])
  );
  assert.ok(following);
  const red = pg.indices.slice(span.start, span.start + span.length);
  return {
    length: red.length,
    sumMod29: mod29(red.reduce((a, b) => a + b, 0)),
    followingSumMod29: mod29(following.values.reduce((a, b) => a + b, 0)),
  };
}

// p6 adjacent-H schedule -> p23 typed tuple [K,a,e,g].
const p6Lengths = redWordLengths(6, 71);
assert.deepEqual(p6Lengths, [4, 1, 4, 2]);
const p6H = [...H(p6Lengths[0], p6Lengths[1]), ...H(p6Lengths[2], p6Lengths[3])];
assert.deepEqual(p6H, [3, 5, 2, 6]);
const p23State = [p6H[2], p6H[3], p6H[0], p6H[1]];
assert.deepEqual(p23State, [2, 6, 3, 5]);
assert.deepEqual(redWordLengths(23, 0), p23State);
const [K, a, e, g] = p23State;

// The p23 address supplies the DH modulus; p24-p26 count geometry holds out A.
const p = 23;
const A = modPow(g, a, p);
assert.equal(A, 8);
const mayflyCounts = [24, 25, 26].map((n) => page(n).runic_count);
assert.deepEqual(mayflyCounts, [270, 273, 265]);
assert.deepEqual([
  Math.abs(mayflyCounts[0] - mayflyCounts[1]),
  Math.abs(mayflyCounts[0] - mayflyCounts[2]),
  Math.abs(mayflyCounts[1] - mayflyCounts[2]),
], [e, g, A]);

// Ordinary DH has two b/B continuations before p27's literal red fields are read.
const branches = [];
for (let b = 1; b < p; b += 1) {
  if (modPow(A, b, p) !== K) continue;
  const B = modPow(g, b, p);
  if (modPow(B, a, p) === K) branches.push({ b, B });
}
assert.deepEqual(branches, [{ b: 4, B: 4 }, { b: 15, B: 19 }]);

const p27Fields = redFields(27, 0);
assert.deepEqual(p27Fields, {
  length: 19,
  sumMod29: 15,
  followingSumMod29: 2,
});
const selected = branches.filter(
  ({ b, B }) =>
    p27Fields.length === B &&
    p27Fields.sumMod29 === b &&
    p27Fields.followingSumMod29 === K
);
assert.deepEqual(selected, [{ b: 15, B: 19 }]);
const { b, B } = selected[0];

// Finite receiver family. The signed 2016 clue motivates word numbers; p57
// supplies literal SHED/CIRCUMFERENCES/FIND/DIVINITY language. Charge every
// primitive local DH/state value as the p27 word index, both zero/one origins,
// and (conservatively) every state value as the symmetric shedding depth.
const state = { K, e, q: 4, g, a, A, b, B, p };
const p27Words = words(27);
const p57Words = words(57).map((w, i) => ({
  index0: i,
  translit: translit(w.values),
  length: w.values.length,
  primeSum: primeSum(w.values),
}));

const hits = [];
let charged = 0;
for (const [indexRole, indexValue] of Object.entries(state)) {
  for (const origin of [0, 1]) {
    const index0 = origin === 0 ? indexValue : indexValue - 1;
    if (index0 < 0 || index0 >= p27Words.length) continue;
    const source = p27Words[index0];

    for (const [depthRole, depth] of Object.entries(state)) {
      if (depth <= 0 || source.values.length <= 2 * depth) continue;
      charged += 1;
      const core = source.values.slice(depth, source.values.length - depth);
      const corePrimeSum = primeSum(core);

      for (const target of p57Words) {
        if (target.length !== core.length || target.primeSum !== corePrimeSum) continue;
        hits.push({
          indexRole,
          indexValue,
          origin,
          depthRole,
          depth,
          index0,
          word: translit(source.values),
          core: translit(core),
          coreLength: core.length,
          corePrimeSum,
          target: target.translit,
          targetIndex0: target.index0,
        });
      }
    }
  }
}

assert.deepEqual(hits, [{
  indexRole: "B",
  indexValue: 19,
  origin: 0,
  depthRole: "K",
  depth: 2,
  index0: 19,
  word: "EORNSOOCAEYEE",
  core: "NSOOCAEY",
  coreLength: 8,
  corePrimeSum: 376,
  target: "DIUINITY",
  targetIndex0: 16,
}]);

console.log(JSON.stringify({
  classification:
    "finite source-selected receiver; no rune-level plaintext inverse or KDF established",
  p6Lengths,
  p6H,
  p23State: { K, a, e, g },
  mayflyCounts,
  A,
  dhBranches: branches,
  p27Fields,
  selectedBranch: selected[0],
  receiverFamily: {
    state,
    p27WordCount: p27Words.length,
    p57WordCount: p57Words.length,
    chargedNonemptyIndexDepthCases: charged,
    hitCount: hits.length,
    hits,
  },
}, null, 2));
