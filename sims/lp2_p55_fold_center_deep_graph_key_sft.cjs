"use strict";

/**
 * LP2 p55 source-word graph reaches original solved END and DEEP, then tests
 * the resulting 17-rune composite key as an actual original-cipher inverse.
 *
 * Original source controls and fixed wrong-prime-weight nulls are included.
 * Node.js 22, dependency free, read only.
 * Run: node sims/lp2_p55_fold_center_deep_graph_key_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const trans = read("resources/lp2-transcription.txt").split("%");
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const roman = (indices) => indices.map((i) => i === null ? "~" : corpus.translit[i]).join("");
const parts = (page) => page === 50 ? [] :
  trans[page > 50 ? page - 1 : page]
    .replaceAll("/", "").replaceAll("\n", "").replaceAll("\r", "")
    .split(/[-.&$§,:!?]/u)
    .map((piece) => (piece.match(/[ᚠ-᛿]+/gu) || []).join(""))
    .filter(Boolean)
    .map((word) => Array.from(word, (rune) => runeIndex.get(rune)));
const words = Array.from({length: 58}, (_, page) => parts(page));
const total = (word, primes) => word.reduce((a, i) => a + primes[i], 0);
const prime = corpus.prime;
const addr = (sum, phase = 0, wordPhase = 0) =>
  ({page: (sum + phase) % 58, word: Math.floor(sum / 58) + wordPhase});
const select = (sum, phase = 0, wordPhase = 0) => {
  const to = addr(sum, phase, wordPhase);
  return {...to, selected: words[to.page][to.word] || null};
};
const gpWord = (text) => {
  const alphabet = corpus.translit
    .map((token, index) => ({token, index}))
    .sort((a, b) => b.token.length - a.token.length);
  const result = [];
  for (let i = 0; i < text.length;) {
    const found = alphabet.find((entry) => text.startsWith(entry.token, i));
    assert.ok(found, "invalid GP romanization " + text);
    result.push(found.index);
    i += found.token.length;
  }
  return result;
};
assert.match(signed, /words are the map/i);
assert.equal(corpus.pages[55].indices.length, 76);
assert.equal(words[55].length, 17);
assert.equal(roman(words[55].flat()), roman(corpus.pages[55].indices));
assert.deepEqual(words[55].map((word) => word.length),
  [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);

const source = [];
let at = total(words[55][8], prime);
for (let step = 0; step < 4; step++) {
  const next = select(at);
  assert.ok(next.selected);
  source.push({
    step, primeSum: at, page: next.page, word: next.word,
    printed: roman(next.selected)
  });
  at = total(next.selected, prime);
}
assert.deepEqual(source.map((s) => [s.primeSum, s.page, s.word]),
  [[365,17,6], [511,47,8], [120,4,2], [288,56,4]]);
assert.deepEqual(source.map((s) => s.printed),
  ["NGAELOEIEOY", "WAE", "LGFNIACX", "CTHGW"]);

const signedTHE = total(gpWord("THE"), prime);
const printedFOLD = select(signedTHE);
assert.equal(signedTHE, 72);
assert.deepEqual([printedFOLD.page, printedFOLD.word, roman(printedFOLD.selected)],
  [14, 1, "FOLD"]);
const foldSum = total(printedFOLD.selected, prime);
const printedSB = select(foldSum);
assert.deepEqual([foldSum, printedSB.page, printedSB.word, roman(printedSB.selected)],
  [171, 55, 2, "SB"]);
const endSum = total(printedSB.selected, prime);
const printedEND = select(endSum);
assert.deepEqual([endSum, printedEND.page, printedEND.word, roman(printedEND.selected)],
  [114, 56, 1, "OESR"]);

// Independently authenticate the second destination from the actual published
// prime-totient p56 cipher. It is well before p56's one literal-F interrupter.
const knownP56 = corpus.pages[56].indices;
const knownPrimes = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53];
const deep = knownP56.slice(12, 16).map((c, i) =>
  (c - (knownPrimes[i+12] - 1) % 29 + 29) % 29);
assert.equal(roman(deep), "DEEP");
assert.equal(roman(knownP56.slice(12, 16)), "CTHGW");

const historyKey = gpWord("FIRFUMFERENFE");
assert.equal(historyKey.length, 13);
assert.equal(total(historyKey, prime), 365);
assert.equal(deep.length, 4);
const composite = [[...historyKey, ...deep], [...deep, ...historyKey]];
for (const key of composite) assert.equal(key.length, 17);

/**
 * Exact finite graph walk. The target condition is tested BEFORE following
 * another edge; the 2016 map has no prescribed p50 numeric-table consumer.
 * @param {number[]} assignedPrimes
 * @param {number} pagePhase
 * @param {number} wordPhase
 * @param {number} maxHops
 * @returns {number} first hop into p56 word4, -1 if absent
 */
function reachDeep(assignedPrimes, pagePhase = 0, wordPhase = 0, maxHops = 3) {
  let n = total(words[55][8], assignedPrimes);
  const seen = new Set();
  for (let step = 0; step <= maxHops; step++) {
    const next = select(n, pagePhase, wordPhase);
    const target = next.page + ":" + next.word;
    if (target === "56:4") return step;
    if (!next.selected || seen.has(target)) return -1;
    seen.add(target);
    n = total(next.selected, assignedPrimes);
  }
  return -1;
}
assert.equal(reachDeep(prime), 3);
const pagePhaseHit = Array.from({length: 58}, (_, phase) => phase)
  .filter((phase) => reachDeep(prime, phase) >= 0);
assert.deepEqual(pagePhaseHit, [0]);
for (const delta of [-2,-1,1,2])
  assert.equal(reachDeep(prime, 0, delta), -1);

// Deterministic 29-weight shuffle. It retains every original cipher rune,
// all word/page boundaries, the authentic 29 prime values, and the two fixed
// target word positions. The joint statistic is selected retrospectively.
let state = 0x7e1dd233;
const random32 = () => {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
};
const nullCount = {centerDirect:0, centerWithinThree:0, centerExactlyThree:0,
  SBexact114:0, jointSBendAndCenterDeep:0};
const simulations = 50000;
for (let sim = 0; sim < simulations; sim++) {
  const p = prime.slice();
  for (let j = 28; j > 0; j--) {
    const k = random32() % (j+1);
    [p[j], p[k]] = [p[k], p[j]];
  }
  const step = reachDeep(p);
  const sb = total(words[55][2], p) === 114;
  if (step === 0) nullCount.centerDirect++;
  if (step >= 0) nullCount.centerWithinThree++;
  if (step === 3) nullCount.centerExactlyThree++;
  if (sb) nullCount.SBexact114++;
  if (sb && step === 3) nullCount.jointSBendAndCenterDeep++;
}
assert.deepEqual(nullCount, {
  centerDirect:392, centerWithinThree:674, centerExactlyThree:79,
  SBexact114:1224, jointSBendAndCenterDeep:3
});

/**
 * Historical, fixed 29-ary Vigenere transfer: either one of 17 key glyphs
 * per physical page segment, or ordinary rune-continuous period 17.
 * A literal ciphertext F may be dropped, without advancing rune-key clock.
 * @param {number[][]} segments
 * @param {number[]} key
 * @param {"segment"|"rune"} mode
 * @param {1|-1} sign
 * @param {number} mask
 * @returns {(number|null)[]}
 */
function decrypt(segments, key, mode, sign, mask) {
  const output = [];
  let clock = 0, fSite = 0;
  for (let w = 0; w < segments.length; w++) {
    for (const c of segments[w]) {
      let drop = false;
      if (c === 0) {
        drop = ((mask >> fSite) & 1) !== 0;
        fSite++;
      }
      if (drop) {
        output.push(null);
        continue;
      }
      const shift = key[mode === "segment" ? w : clock % key.length];
      output.push((c + sign * shift + 29) % 29);
      if (mode === "rune") clock++;
    }
  }
  return output;
}
/** @param {(number|null)[]} seq */
function coincidence(seq) {
  const freq = new Array(29).fill(0);
  for (const x of seq) if (x !== null) freq[x]++;
  const n = freq.reduce((a,b)=>a+b,0);
  return freq.reduce((a,b)=>a+b*(b-1),0)/(n*(n-1));
}
const results = [];
for (let order = 0; order < 2; order++)
  for (const mode of ["segment","rune"])
    for (const sign of [-1,1])
      for (let mask = 0; mask < 8; mask++) {
        const plain = decrypt(words[55], composite[order], mode, sign, mask);
        results.push({order, mode, sign, mask,
          ioc: coincidence(plain), romanization: roman(plain)});
      }
results.sort((a,b) => b.ioc-a.ioc);
assert.equal(results.length, 64);
assert.deepEqual(
  [results[0].order,results[0].mode,results[0].sign,results[0].mask],
  [1,"rune",1,0]);
assert.ok(Math.abs(results[0].ioc - 0.04105263157894737) < 1e-12);
assert.ok(results[0].ioc < coincidence(corpus.pages[57].indices.slice(0,76)));

// Native GP solved p57 positive: every one of the eight key/clock/sign choices
// recovers 76/76 characters when legitimately used for GP29 encryption.
const native = corpus.pages[57].indices.slice(0,76);
assert.equal(native.length, 76);
for (let order = 0; order < 2; order++)
  for (const mode of ["segment","rune"])
    for (const sign of [-1,1]) {
      const key = composite[order];
      let cursor = 0;
      const planted = words[55].map((word,w) => word.map(() => {
        const p = native[cursor];
        const shift = key[mode === "segment" ? w : cursor % key.length];
        cursor++;
        return (p - sign * shift + 29) % 29;
      }));
      assert.deepEqual(decrypt(planted, key, mode, sign, 0), native);
    }
console.log(JSON.stringify({
  evidence: "Original LP2 p55 folded word map reaches established p56 END and DEEP",
  originalFoldCenterToDeep: source,
  foldToEnd: {
    the: signedTHE, fold: foldSum, sb: endSum,
    target: "p56 word1", ciphertext: roman(printedEND.selected)
  },
  historicKey: roman(historyKey),
  keyComposition: composite.map(roman),
  nullConditions: {
    source: "50,000 frozen prime-label permutations; physical targets held",
    pagePhaseHitWithinThree: pagePhaseHit, wrongWordPhaseHits: 0,
    ...nullCount
  },
  keyConsumer: {
    candidates: results.length, best: results[0],
    nativeSolvedP57First76IoC: coincidence(native),
    genuineUnknownPlaintext: false,
    positivePlants: 8
  }
}, null, 2));
