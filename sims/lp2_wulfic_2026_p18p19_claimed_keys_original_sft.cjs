"use strict";

/**
 * Reproduce two publicly claimed LP2 keys on exact original GP29 ciphertext.
 * This is a candidate falsification, not recovery of plaintext.
 * SFT: node sims/lp2_wulfic_2026_p18p19_claimed_keys_original_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, "..",
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const mod29 = (n) => ((n % 29) + 29) % 29;
assert.equal(corpus.translit[17], "B");
assert.equal(corpus.translit[4], "R");
assert.equal(corpus.translit[13], "P");

/** The exact 2026 external key values and arithmetic direction, as printed
 * in Wulfic/Cicada3301-Liber_Primus/MASTER_TRACKER.md §3 (April 2026).
 */
const claims = [
  {originalScan: 18, lp2Page: 1, sign: -1, claim: "BEING",
    key: [11,6,1,20,25,20,9,15,24,26,25,7,19,8,10,24,18,9,0,16,9,4,14,22,13,13,3,28,5,21,24,19,5,1,27,14,6,17,24,24,22,8,23,6,22,19,2,11,3,19,25,15,24],
    originalInitial: 24, intendedInitial: 17, actualInitial: 13,
    expectedIoC: 0.03472833025961129},
  {originalScan: 19, lp2Page: 2, sign: 1, claim: "REARRANGING",
    key: [24,15,2,24,4,21,11,10,20,16,9,19,26,11,7,5,11,6,27,8,22,25,21,16,25,0,27,9,21,7,27,15,21,9,3,16,5,22,18,4,5,18,23,28,28,28,28],
    originalInitial: 22, intendedInitial: 4, actualInitial: 17,
    expectedIoC: 0.03437810945273632}
];
/** @param {number[]} chars @param {number[]} key @param {number} sign */
function apply(chars, key, sign) {
  return chars.map((n, index) => mod29(n + sign * key[index % key.length]));
}
/** @param {number[]} runes */
function ioc(runes) {
  const counts = Array(29).fill(0);
  for (const r of runes) counts[r]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (runes.length * (runes.length - 1));
}
const rows = [];
for (const item of claims) {
  const source = corpus.pages[item.lp2Page].indices;
  assert.equal(source.length, item.lp2Page === 1 ? 266 : 201);
  assert.equal(source[0], item.originalInitial);
  assert.equal(item.key.length, item.lp2Page === 1 ? 53 : 47);
  const candidate = apply(source, item.key, item.sign);
  assert.equal(candidate[0], item.actualInitial);
  assert.notEqual(candidate[0], item.intendedInitial);
  assert.ok(Math.abs(ioc(candidate) - item.expectedIoC) < 1e-12);
  assert.deepEqual(apply(candidate, item.key, -item.sign), source);
  const gp57 = corpus.pages[57].indices;
  assert.deepEqual(apply(apply(gp57, item.key, -item.sign),
    item.key, item.sign), gp57, "authentic solved GP57 source plant");
  rows.push({originalScan:item.originalScan, originalLP2Page:item.lp2Page,
    publishedClaim:item.claim, publishedKeyLength:item.key.length,
    cipherFirstRune:corpus.translit[source[0]],
    claimedPlainFirstRune:corpus.translit[item.intendedInitial],
    actualPlainFirstRune:corpus.translit[candidate[0]],
    matchClaimAtFirstRune:false,
    sourceIoC:Number(ioc(candidate).toFixed(12)),
    resultPrefix:candidate.slice(0,60).map((x)=>corpus.translit[x]).join("")});
}
console.log(JSON.stringify({source:"Original LP2 scans 18/19, exact 266/201 runes",
  external:"Wulfic/Cicada3301-Liber_Primus MASTER_TRACKER April 2026",
  claims:rows, positiveControl:"p57 GP source planted and exactly recovered"},
  null, 2));
console.log("PASS external proposed keys fail original ciphertext at first rune; no unknown plaintext authenticated.");
