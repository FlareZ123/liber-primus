/**
 * Physical p55 -> p56 reset hypothesis using the source-visible 2013
 * prime_echo list, and the authentic solved p56 phi-prime key schedule.
 * Exactly two source-framing choices, two GP29 orientations, and the
 * eight possible F-consumption masks are frozen before reading outputs.
 *
 * @typedef {{page:number,indices:number[]}} Page
 * @typedef {{translit:string[],prime:number[],pages:Page[]}} Corpus
 */
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @type {Corpus} */
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const originalScript = fs.readFileSync(path.join(root, "resources", "historical", "cicada2013-os-original-prime-echo.sh"), "utf8");
const historicalPrimes = [...originalScript.matchAll(/^echo\s+(?:-n\s+)?["']?(\d+)/gm)].map((m) => Number(m[1]));
assert.equal(historicalPrimes.length, 464);
assert.equal(historicalPrimes[173], 1033);
assert.equal(historicalPrimes[463], 3301);
assert.deepEqual(historicalPrimes, [...historicalPrimes].sort((a, b) => a - b));

/** @param {number} n @returns {boolean} */
function prime(n) {
  if (n < 2) return false;
  for (let j = 2; j * j <= n; j++) if (n % j === 0) return false;
  return true;
}
const independentlyGenerated = [];
for (let n = 2; independentlyGenerated.length < 464; n++) if (prime(n)) independentlyGenerated.push(n);
assert.deepEqual(historicalPrimes, independentlyGenerated);

/** @param {number} p @returns {number[]} */
function page(p) {
  const found = corpus.pages.find((item) => item.page === p);
  assert.ok(found);
  return found.indices;
}
/** @param {number[]} a @returns {string} */
function render(a) { return a.map((x) => corpus.translit[x]).join(""); }
/** @param {number[]} a @returns {number} */
function pairCount(a) {
  const h = Array(29).fill(0);
  for (const r of a) h[r]++;
  return h.reduce((n, x) => n + x * (x - 1), 0);
}

const c55 = page(55);
const c56 = page(56);
const native = page(57).slice(0, 76);
assert.equal(c55.length, 76);
assert.equal(c56.length, 85);
assert.equal(native.length, 76);
// Genuine solved p56 has a prime clock starting at 2 and one nonconsuming F.
let j56 = 0;
const known56 = c56.map((x, i) => i === 56 ? 0 : (x + 29 - ((historicalPrimes[j56++] - 1) % 29)) % 29);
assert.equal(c56[56], 0);
assert.equal(render(known56), "ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE");

const F = c55.flatMap((x, i) => x === 0 ? [i] : []);
assert.deepEqual(F, [15, 25, 41]);

/**
 * Exactly source-motivated boundary anchors:
 *  start76: physical p55 opens at last 76 prime_echo entries;
 *  endConsumed: actual consumed symbols end exactly at source prime 3301.
 * @param {number} mask
 * @param {"start76"|"endConsumed"} anchor
 * @returns {number}
 */
function startIndex(mask, anchor) {
  const skips = [0, 1, 2].reduce((n, b) => n + ((mask >> b) & 1), 0);
  return historicalPrimes.length - (anchor === "start76" ? 76 : 76 - skips);
}

/**
 * Reversible GP29 additive stream with original-authentic F positions.
 * direction=-1 deciphers; direction=1 is a fixed source-compatible control.
 * @param {number[]} input
 * @param {number} mask
 * @param {"start76"|"endConsumed"} anchor
 * @param {1|-1} direction
 * @returns {number[]}
 */
function decode(input, mask, anchor, direction) {
  let cursor = startIndex(mask, anchor);
  return input.map((r, i) => {
    const pos = F.indexOf(i);
    if (pos >= 0 && ((mask >> pos) & 1)) {
      assert.equal(r, 0);
      return 0;
    }
    const key = (historicalPrimes[cursor++] - 1) % 29;
    return (r + 29 + direction * key) % 29;
  });
}

/**
 * Exact inverse for planted positive and original source controls.
 * @param {number[]} input
 * @param {number} mask
 * @param {"start76"|"endConsumed"} anchor
 * @param {1|-1} direction
 * @returns {number[]}
 */
function encode(input, mask, anchor, direction) {
  let cursor = startIndex(mask, anchor);
  return input.map((r, i) => {
    const pos = F.indexOf(i);
    if (pos >= 0 && ((mask >> pos) & 1)) {
      assert.equal(r, 0);
      return 0;
    }
    const key = (historicalPrimes[cursor++] - 1) % 29;
    return (r + 29 - direction * key) % 29;
  });
}

const results = [];
for (const anchor of /** @type {Array<"start76"|"endConsumed">} */ (["start76", "endConsumed"])) {
  for (const direction of /** @type {Array<1|-1>} */ ([-1, 1])) {
    for (let mask = 0; mask < 8; mask++) {
      const decoded = decode(c55, mask, anchor, direction);
      assert.deepEqual(encode(decoded, mask, anchor, direction), c55);
      const planted = native.slice();
      for (let pos = 0; pos < F.length; pos++) if ((mask >> pos) & 1) planted[F[pos]] = 0;
      assert.deepEqual(decode(encode(planted, mask, anchor, direction), mask, anchor, direction), planted);
      results.push({
        anchor, direction, mask,
        firstPrime: historicalPrimes[startIndex(mask, anchor)],
        indexOfCoincidence: pairCount(decoded) / (76 * 75),
        equalOrderedPairCount: pairCount(decoded),
        first24: render(decoded.slice(0, 24))
      });
    }
  }
}
assert.equal(results.length, 32);
const sorted = [...results].sort((a, b) => b.equalOrderedPairCount - a.equalOrderedPairCount);
assert.equal(sorted[0].equalOrderedPairCount, 218);
assert.ok(results.every((r) => r.indexOfCoincidence < 0.04561403509));
assert.equal(startIndex(0, "endConsumed"), 388);
assert.equal(startIndex(7, "endConsumed"), 391);
process.stdout.write(JSON.stringify({
  source: "Original 2013 prime_echo last464-prime list; solved LP2 p56 phi-prime clock starts at2",
  hypothesis: "Unknown p55 consumes source-prime tail before p56 resets to2",
  originalP55Runes: c55.length,
  originalFPositions: F,
  tested: results.length,
  best: sorted.slice(0, 4),
  control: "All authentic p55 roundtrips, all 32 solved-p57 plaintext plants, authentic p56 85/85",
  finding: "Every direct tail-of-source prime-totient candidate remains nonlinguistic"
}, null, 2) + "\n");
