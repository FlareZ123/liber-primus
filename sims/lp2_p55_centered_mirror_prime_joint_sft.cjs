"use strict";
/** Joint p55 centered-flank and prime401 original-source SFT. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseLP2Words } = require("./lp2_word_pages.cjs");
const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const c = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const parsed = parseLP2Words(read("resources/lp2-transcription.txt"), 57);
const rune = new Map(c.runes.map((s, i) => [s, i]));
const TARGET = 401;

/** @param {number} n @param {number} k */
function choose(n, k) {
  let x = 1;
  for (let i = 1; i <= k; i++) x = x * (n - i + 1) / i;
  assert(Number.isSafeInteger(x));
  return x;
}

/**
 * Counts exact joint event [a,b, five runes summing 401, a,b] under a
 * random permutation of the given, unchanged 29-glyph multiset.
 * @param {number[]} values
 */
function exactJoint(values) {
  const n = values.length;
  if (n < 9) return { n, pJoint: 0, pSum: 0, pPair: 0 };
  const counts = Array(29).fill(0);
  for (const x of values) counts[x]++;
  const dp = Array.from({ length: 6 }, () => new Float64Array(TARGET + 1));
  dp[0][0] = 1;
  for (const glyph of values) {
    const weight = c.prime[glyph];
    for (let k = 5; k >= 1; k--)
      for (let sum = TARGET; sum >= weight; sum--)
        dp[k][sum] += dp[k - 1][sum - weight];
  }
  let favorable = 0n;
  let samePair = 0n;
  for (let i = 0; i < 29; i++) for (let j = 0; j < 29; j++) {
    const a = counts[i], b = counts[j];
    if (i === j ? a < 4 : a < 2 || b < 2) continue;
    const ways = i === j
      ? a * (a - 1) * (a - 2) * (a - 3)
      : a * (a - 1) * b * (b - 1);
    samePair += BigInt(ways);
    let subsets = 0;
    if (i === j) {
      const inverseFourth = [1, -4, 10, -20, 35, -56];
      for (let q = 0; q <= 5; q++) {
        const t = TARGET - q * c.prime[i];
        if (t >= 0) subsets += inverseFourth[q] * dp[5 - q][t];
      }
    } else {
      // Expand (1+ux^i)^-2 (1+ux^j)^-2 up to coefficient u^5.
      for (let q = 0; q <= 5; q++) for (let r = 0; r <= q; r++) {
        const t = TARGET - r * c.prime[i] - (q - r) * c.prime[j];
        if (t >= 0)
          subsets += (q % 2 ? -1 : 1) * (r + 1) * (q - r + 1) * dp[5 - q][t];
      }
    }
    assert(Number.isSafeInteger(subsets) && subsets >= 0);
    favorable += BigInt(ways) * BigInt(subsets);
  }
  const falling4 = BigInt(n) * BigInt(n - 1) * BigInt(n - 2) * BigInt(n - 3);
  const denominator = falling4 * BigInt(choose(n - 4, 5));
  return {
    n, numerator: favorable.toString(), denominator: denominator.toString(),
    pJoint: Number(favorable) / Number(denominator),
    pSum: dp[5][TARGET] / choose(n, 5),
    pPair: Number(samePair) / Number(falling4)
  };
}

/** @param {number} page */
function interior(page) {
  return parsed.byContainedPage[page].flatMap((w) =>
    [...w.runes].slice(1, -1).map((r) => rune.get(r)));
}
const pages = Array.from({ length: 55 }, (_, page) => {
  const values = interior(page);
  const s = Math.floor((values.length - 5) / 2);
  const block = values.slice(s, s + 5);
  return {
    physicalPage: page < 50 ? page : page + 1,
    ...exactJoint(values),
    centerStart: s, center: block,
    sum: block.reduce((t, x) => t + c.prime[x], 0),
    mirrored: s >= 2 && s + 7 <= values.length
      && values[s - 2] === values[s + 5]
      && values[s - 1] === values[s + 6]
  };
});
const p55 = pages.find((p) => p.physicalPage === 55);
const vals55 = interior(54);
assert.equal(parsed.byContainedPage[54].length, 16);
assert.equal(p55.n, 43);
assert.equal(p55.centerStart, 19);
assert.deepEqual(p55.center, [21, 20, 15, 23, 27]);
assert.equal(p55.sum, 401);
assert.deepEqual(vals55.slice(17, 19), [13, 8]);
assert.deepEqual(vals55.slice(24, 26), [13, 8]);
assert.deepEqual(c.pages.find((p) => p.page === 57).indices.slice(0, 2), [13, 24]);
assert.deepEqual(pages.filter((p) => p.mirrored).map((p) => p.physicalPage), [55]);
assert.deepEqual(pages.filter((p) => p.sum === TARGET).map((p) => p.physicalPage), [55]);
const allWindows = [];
for (let page = 0; page < 55; page++) {
  const values = interior(page);
  for (let s = 2; s + 7 <= values.length; s++) {
    if (values[s - 2] !== values[s + 5] || values[s - 1] !== values[s + 6]) continue;
    allWindows.push({
      physicalPage: page < 50 ? page : page + 1, offset: s,
      sum: values.slice(s, s + 5).reduce((t, x) => t + c.prime[x], 0)
    });
  }
}
assert.equal(allWindows.length, 8);
assert.deepEqual(allWindows.filter((p) => p.sum === 401),
  [{ physicalPage: 55, offset: 19, sum: 401 }]);
const positive = exactJoint([13, 8, 21, 20, 15, 23, 27, 13, 8]);
assert.ok(Math.abs(positive.pJoint - 1 / 378) < 1e-12);
assert.equal(p55.numerator, "1778768");
assert.equal(p55.denominator, "1705300112880");
const familywise = 1 - pages.reduce((p, x) => p * (1 - x.pJoint), 1);
assert.ok(Math.abs(p55.pJoint - 0.0000010430820865870487) < 1e-16);
assert.ok(Math.abs(familywise - 0.00011390651599441082) < 1e-12);
console.log(JSON.stringify({
  status: "intermediate source pattern; no decrypted unknown plaintext",
  p55: { centerStart: 19, runes: p55.center,
    flanks: "PH", base29: "PA", primeSum: p55.sum,
    favorable: p55.numerator, possible: p55.denominator,
    pJoint: p55.pJoint, pSum: p55.pSum, pPair: p55.pPair },
  allNineRuneFlankMatches: allWindows,
  familywiseAnyCenteredPage: familywise,
  syntheticPositive: positive.pJoint,
  limitation: "two-rune flank width and PA output were postselected"
}, null, 2));
