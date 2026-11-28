/**
 * Source-only SFT for the p24-p26 mayfly count triangle.
 *
 * The three contiguous mayfly pages have source rune counts 270,273,265.
 * Their pairwise absolute differences are 3,5,8, equal to the independently
 * reconstructed p28 DH23 derived/primary state values e=3,g=5,A=8.
 *
 * Run from repository root:
 *   node sims/lp2_p24_26_mayfly_dh23_count_triangle_sft.cjs
 */
"use strict";

const fs = require("fs");
const assert = require("assert");

const corpus = JSON.parse(
  fs.readFileSync("resources/liber-primus/lp2-corpus.json", "utf8")
);
const ink = JSON.parse(
  fs.readFileSync("resources/liber-primus/lp2-ink-annotations.json", "utf8")
);
const pages = corpus.pages.filter((p) => p.page >= 0 && p.page <= 55);
assert.strictEqual(pages.length, 56);

const count = (page) => {
  const row = pages.find((p) => p.page === page);
  assert.ok(row, `missing page ${page}`);
  return row.runic_count;
};

const c24 = count(24);
const c25 = count(25);
const c26 = count(26);
assert.deepStrictEqual([c24, c25, c26], [270, 273, 265]);

const edge = {
  "24-25": Math.abs(c24 - c25),
  "24-26": Math.abs(c24 - c26),
  "25-26": Math.abs(c25 - c26),
};
assert.deepStrictEqual(edge, { "24-25": 3, "24-26": 5, "25-26": 8 });

// Independently established p28 DH23 state labels.
const p = 23;
const g = 5;
const a = 6;
const b = 15;
const A = 8;
const B = 19;
const K = 2;
const e = g - K;
assert.strictEqual(e, 3);
assert.strictEqual((g ** a) % p, A);
assert.strictEqual((g ** b) % p, B);
assert.strictEqual((B ** a) % p, K);
assert.deepStrictEqual(
  [edge["24-25"], edge["24-26"], edge["25-26"]],
  [e, g, A]
);

// Charge every contiguous three-page window under the same order-free test.
const target = [e, g, A].slice().sort((x, y) => x - y);
const hits = [];
for (let start = 0; start <= 53; start += 1) {
  const v = [count(start), count(start + 1), count(start + 2)];
  const diffs = [
    Math.abs(v[0] - v[1]),
    Math.abs(v[0] - v[2]),
    Math.abs(v[1] - v[2]),
  ].sort((x, y) => x - y);
  if (diffs.every((x, i) => x === target[i])) {
    hits.push({ start, pages: [start, start + 1, start + 2], counts: v, diffs });
  }
}
assert.deepStrictEqual(hits, [
  { start: 24, pages: [24, 25, 26], counts: [270, 273, 265], diffs: [3, 5, 8] },
]);

// Source punctuation: the mayfly chapter is locally framed by red 13-dot
// marks after p23's heading and at p26's end, with p22's terminal13 as an
// additional outer bracket. P57 terminates with the corpus-unique 23-dot mark.
// P23's separate five-black-dot graphic and the external image's specimen-5
// label independently select g=5.
const p22Ink = ink.pages.find((row) => row.page === 22);
const p23Ink = ink.pages.find((row) => row.page === 23);
const p26Ink = ink.pages.find((row) => row.page === 26);
const p57Ink = ink.pages.find((row) => row.page === 57);
assert.deepStrictEqual(p22Ink.large_punctuation, [[131, 13, "red"]]);
assert.deepStrictEqual(p23Ink.large_punctuation, [[16, 13, "red"]]);
assert.deepStrictEqual(p26Ink.large_punctuation, [[265, 13, "red"]]);
assert.deepStrictEqual(p57Ink.large_punctuation, [
  [7, 13, "red"],
  [95, 23, "red"],
]);
assert.strictEqual(ink.counts.red23, 1);

const sourceP = 23;
const sourceBoundary = 13;
const sourceG = 5;

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

// Charge the remaining two edge values as (e,A), both signs of K=±(g-e),
// both integer relations b-K=13 / b+K=13, and every nonzero DH exponent a.
// No p28 rune value enters this family.
const remaining = target.filter((x) => x !== sourceG);
const survivors = [];
for (const eCandidate of remaining) {
  const ACandidate = remaining.find((x) => x !== eCandidate);
  for (const kSign of [1, -1]) {
    const KCandidate =
      ((kSign * (sourceG - eCandidate)) % sourceP + sourceP) % sourceP;
    if (KCandidate === 0) continue;

    for (const relation of ["b-K=13", "b+K=13"]) {
      const bCandidate =
        relation === "b-K=13"
          ? sourceBoundary + KCandidate
          : sourceBoundary - KCandidate;
      if (bCandidate < 1 || bCandidate > sourceP - 1) continue;

      for (let aCandidate = 1; aCandidate < sourceP; aCandidate += 1) {
        if (modPow(sourceG, aCandidate, sourceP) !== ACandidate) continue;
        const BCandidate = modPow(sourceG, bCandidate, sourceP);
        if (
          modPow(ACandidate, bCandidate, sourceP) === KCandidate &&
          modPow(BCandidate, aCandidate, sourceP) === KCandidate
        ) {
          survivors.push({
            p: sourceP,
            e: eCandidate,
            g: sourceG,
            a: aCandidate,
            b: bCandidate,
            A: ACandidate,
            B: BCandidate,
            K: KCandidate,
            kSign,
            relation,
          });
        }
      }
    }
  }
}

assert.deepStrictEqual(survivors, [
  {
    p: 23,
    e: 3,
    g: 5,
    a: 6,
    b: 15,
    A: 8,
    B: 19,
    K: 2,
    kSign: 1,
    relation: "b-K=13",
  },
]);

console.log("PASS lp2_p24_26_mayfly_dh23_count_triangle_sft");
console.log("mayfly counts:", [c24, c25, c26]);
console.log("edge labels:", edge, "=", { e, g, A });
console.log("contiguous triple hits:", JSON.stringify(hits));
console.log("charged independent DH survivors:", JSON.stringify(survivors));
