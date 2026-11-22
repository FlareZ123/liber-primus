"use strict";
/**
 * Original-printed LP2 p22 word-length crib against the three LP1 pages
 * selected by an exact mirrored figure (LP1 pp14–16). Native-GP word
 * spellings follow the solved-source ING/IO calibration. Only whole
 * consecutive source words and original p22 printed word boundaries count.
 *
 * A deliberately permissive word-length-only search is an upper bound on
 * any punctuation-constrained exact passage. Requiring source-matched
 * punctuation could only remove matches. This is a bounded negative for
 * literal source passage reuse, not a general cipher exclusion.
 *
 * SFT: node sims/lp1_lp2_p22_literal_passage_crib_sft.cjs
 * Dependencies: Node 20+ only. Deterministic seed and source file checks.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const originalLP2 = read("resources/liber-primus/lp2-transcription.txt");
const reference = read("resources/liber-primus/lp1-plaintext-reference.txt");
const tokenTable = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);

/** @param {string} raw @param {boolean} calibrated @returns {number[]} */
function encodeGP(raw, calibrated = true) {
  const word = raw.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const indices = [];
  for (let i = 0; i < word.length;) {
    if (calibrated && word.startsWith("ING", i)) {
      indices.push(21);
      i += 3;
    } else if (calibrated && word.startsWith("IO", i)) {
      indices.push(27);
      i += 2;
    } else {
      const token = tokenTable.find(t => word.startsWith(t.s, i));
      assert(token, "Unmappable source word " + raw);
      indices.push(token.i);
      i += token.s.length;
    }
  }
  return indices;
}
const runeIndex = new Map(gp.runes.map((r, i) => [r, i]));
const page22 = originalLP2.trim().split(/\n%\n/)[22];
assert(page22, "Original physical LP2 page 22 must exist");
const page22Printed = page22.replace(/\/\n/g, "").replace(/\n/g, "");
const runes = new RegExp("[" + gp.runes.join("") + "]+", "gu");
const targetRuneWords = page22Printed.match(runes) || [];
const target = targetRuneWords.map(w => w.length);
const targetSource = targetRuneWords.join("");
const targetPage = gp.pages.find(p => p.page === 22);
assert(targetPage);
assert.equal(target.length, 28, "Printed complete p22 words");
assert.equal(targetSource.length, 131, "Original p22 page-local runes");
assert.deepEqual(Array.from(targetSource, r => runeIndex.get(r)), targetPage.indices,
  "Pinned corpus rune identities and source boundary parser agree");

const sections = reference.split(/### (\d+)\n/);
const pageText = new Map();
for (let i = 1; i < sections.length; i += 2) {
  pageText.set(Number(sections[i]), sections[i + 1]);
}
const source = [];
for (const page of [14, 15, 16]) {
  assert(pageText.has(page));
  const nativeProse = pageText.get(page)
    .replace(/^\[[^\n]*\]$/gm, "")
    .replace(/^\d+(?:\s+\d+)+$/gm, "");
  const words = nativeProse.replace(/\x27/g, "").match(/[A-Z]+/g) || [];
  for (const word of words) {
    source.push({page, word, indices: encodeGP(word)});
  }
}
assert.deepEqual([14, 15, 16].map(n =>
  source.filter(x => x.page === n).length), [87, 16, 2]);
assert.equal(source.length, 105);
assert.equal(source.reduce((s, w) => s + w.indices.length, 0), 408);
// Digit-only p16 5×5 numerical cells are not GP-native words; retain the
// actual two rune words KNOW THIS. Editorial continuation notes omitted.

const native = source.map(x => x.indices.length);
const legacy = source.map(x => encodeGP(x.word, false).length);

/**
 * Longest common contiguous *complete-word* length run.
 * @param {number[]} a
 * @param {number[]} b
 * @returns {{words:number,sourceAt:number,targetAt:number,runes:number}}
 */
function longest(a, b) {
  let prior = new Uint16Array(b.length + 1);
  let current = new Uint16Array(b.length + 1);
  let best = 0, startA = -1, startB = -1;
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      current[j] = a[i] === b[j] ? 1 + prior[j + 1] : 0;
      if (current[j] > best) {
        best = current[j];
        startA = i;
        startB = j;
      }
    }
    [prior, current] = [current, prior];
  }
  let runes = 0;
  for (let k = 0; k < best; k++) runes += a[startA + k];
  return {words: best, sourceAt: startA, targetAt: startB, runes};
}
const actual = longest(native, target);
assert.deepEqual(actual, {words: 5, sourceAt: 58, targetAt: 2, runes: 23});
assert.equal(source.slice(58, 63).map(x => x.word).join(" "),
  "THE MASTER THE MASTER STOPPED");
const legacyMatch = longest(legacy, target);
assert.equal(legacyMatch.words, 5);
assert(actual.words < 12 && actual.runes < 40,
  "Gate fails even before requiring five additional held-out words");

/** @param {number} seed @returns {() => number} */
function rng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}
// Matched null: preserve the exact 106-source-word GP-length inventory and
// frozen p22 layout, randomize only source word order (Fisher–Yates).
const random = rng(0x47a11ca5);
const shuffled = native.slice();
const histogram = new Int32Array(30);
const iterations = 20000;
for (let trial = 0; trial < iterations; trial++) {
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = random() % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const matches = longest(shuffled, target).words;
  assert(matches < histogram.length);
  histogram[matches]++;
}
assert.deepEqual(Array.from(histogram).slice(0, 9),
  [0, 0, 5, 8716, 8979, 2034, 241, 20, 4]);
const atLeastObserved = histogram.slice(actual.words)
  .reduce((sum, n) => sum + n, 0);
assert.equal(atLeastObserved, 2300);

// Exact-source positive plant: 17 *consecutive actual LP1 GP-native words*
// consist of 12 discovery words and five wholly withheld following words.
// Use eleven other original LP1 words as filler to make a 28-word, 131-rune
// synthetic page. Its GP rune identities, not just lengths, are constructed.
const plantStart = 35;
const plantedSource = source.slice(plantStart, plantStart + 17);
assert.equal(plantedSource.length, 17);
const prefixLength = plantedSource.reduce((n, x) => n + x.indices.length, 0);
const remaining = 131 - prefixLength;
assert(remaining > 0);
const options = [...new Map(source.map(x => [x.indices.length, x])).values()]
  .sort((a, b) => Math.abs(a.indices.length - remaining / 11)
    - Math.abs(b.indices.length - remaining / 11));
/** @param {number} count @param {number} need @returns {object[]|null} */
function synthFiller(count, need) {
  if (count === 0) return need === 0 ? [] : null;
  if (need < count || need > count * 13) return null;
  for (const x of options) {
    const tail = synthFiller(count - 1, need - x.indices.length);
    if (tail) return [x, ...tail];
  }
  return null;
}
const filler = synthFiller(11, remaining);
assert(filler);
const planted = [...plantedSource, ...filler];
assert.equal(planted.length, 28);
assert.equal(planted.reduce((sum, x) => sum + x.indices.length, 0), 131);
const plantedRunes = planted.flatMap(x => x.indices).map(i => gp.runes[i]).join("");
assert.equal(plantedRunes.length, 131);
const plantBest = longest(native, planted.map(x => x.indices.length));
assert(plantBest.words >= 17 && plantBest.runes >= 40,
  "Known source-native 12-word crib plus five heldout words must be detected");
assert.deepEqual(
  planted.slice(0, 17).map(x => x.indices),
  source.slice(plantStart, plantStart + 17).map(x => x.indices),
  "Exact source-rune identities and all five held-out words recovered");
const heldoutPage57 = pageText.get(57).match(/[A-Z]+/g).flatMap(w => encodeGP(w));
assert.equal(heldoutPage57.length, 95);
assert.deepEqual(heldoutPage57, gp.pages[57].indices,
  "Native-GP encoder independently reproduces all solved p57 runes");

if (require.main === module) {
  console.log(JSON.stringify({
    targetPhysicalPage: 22, originalRunes: 131, originalWords: 28,
    sourcePhysicalPages: [14, 15, 16], sourceWordCount: 106,
    nativeSourceRunes: 408, targetPrintedWordLengths: target,
    maximumPermissiveSourceMatch: actual,
    maximumSourceWords: source.slice(actual.sourceAt, actual.sourceAt + actual.words)
      .map(x => x.word),
    legacyMaximumWords: legacyMatch.words,
    matchedScrambledSourceTrials: iterations, atLeastObserved,
    empiricalTail: atLeastObserved / iterations,
    positiveControl: {words: planted.length, runes: plantedRunes.length,
      exactSourceCribWords: 12, withheldNextWords: 5,
      detectedRunWords: plantBest.words},
    conclusion: "No literal source-passage crib under original p22 word boundaries"
  }, null, 2));
}
module.exports = {encodeGP, longest};
