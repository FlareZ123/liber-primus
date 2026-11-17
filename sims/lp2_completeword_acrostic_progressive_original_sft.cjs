"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseLP2Words, physicalLP2Page} = require("./lp2_word_pages.cjs");

/**
 * Original complete-word acrostic, including genuine cross-page continuations.
 * Rejects only direct and classic additive-progressive readings.
 * No original LP2 plaintext is asserted or inferred.
 */

const root = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const raw = fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-transcription.txt"), "utf8");
const parsed = parseLP2Words(raw, 55);
const alphabet = new Map(corpus.runes.map((r, i) => [r, i]));
assert.equal(parsed.runeCount, 12956);
assert.equal(parsed.words.length, 2896);
assert.equal(parsed.crossPageWords, 32);
const sourceIndices = parsed.words.flatMap(w => [...w.runes].map(r => {
  assert(alphabet.has(r));
  return alphabet.get(r);
}));
const original = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.deepEqual(sourceIndices, original);

const chapters = [0, 3, 8, 15, 23, 27, 33, 40, 54];

/** @param {number} page Original physical LP2 page. @returns {number} */
function chapterOf(page) {
  let out = 0;
  for (let i = 0; i < chapters.length; i++) if (page >= chapters[i]) out = i;
  return out;
}

/**
 * Return 0-based per-word progressive clock.
 * @param {"book"|"page"|"chapter"} reset Reset policy.
 * @returns {number[]}
 */
function clocks(reset) {
  let lastScope = -1;
  let t = 0;
  return parsed.words.map(w => {
    const physicalPage = physicalLP2Page(w.startPage);
    const scope = reset === "book" ? 0 : reset === "page" ? physicalPage : chapterOf(physicalPage);
    if (scope !== lastScope) t = 0;
    lastScope = scope;
    return t++;
  });
}

/** @param {number} n Zero-based GP rune index. @returns {number} */
function mod29(n) { return ((n % 29) + 29) % 29; }

/** @param {number[]} values GP indices. @returns {number} */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const x of values) counts[x]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (values.length * (values.length - 1));
}

/** @param {number[]} values GP indices. @returns {string} */
function render(values) { return values.map(v => corpus.translit[v]).join(" "); }

const solved = corpus.pages.find(p => p.page === 57).indices;
assert.equal(solved.length, 95);
assert(ioc(solved) > 0.06);
const nativePlant = Array.from({length: parsed.words.length}, (_, i) => solved[i % solved.length]);
const positions = {
  first: parsed.words.map(w => alphabet.get([...w.runes][0])),
  last: parsed.words.map(w => alphabet.get([...w.runes].at(-1)))
};
const results = [];

for (const [edge, input] of Object.entries(positions)) {
  const plainResult = {edge, mode: "direct", ioc: ioc(input), firstThirty: render(input.slice(0, 30))};
  results.push(plainResult);
  for (const reset of ["book", "page", "chapter"]) {
    const clock = clocks(reset);
    for (const sign of [-1, 1]) {
      // Hypothetical C_i = P_i + sign * i; inverse is P_i = C_i - sign * i.
      const decoded = input.map((v, i) => mod29(v - sign * clock[i]));
      const encPlant = nativePlant.map((v, i) => mod29(v + sign * clock[i]));
      const decPlant = encPlant.map((v, i) => mod29(v - sign * clock[i]));
      assert.deepEqual(decPlant, nativePlant);
      assert.deepEqual(decoded.map((v, i) => mod29(v + sign * clock[i])), input);
      assert.equal(ioc(decoded.map(v => mod29(v + 17))), ioc(decoded));
      results.push({
        edge, mode: reset + (sign > 0 ? "-plus" : "-minus"),
        ioc: ioc(decoded), firstThirty: render(decoded.slice(0, 30))
      });
    }
  }
}
// Independent source-visible 16-cell p15 numeral key: 2896 source words = 16 * 181.
// Both complete source-printed cell order and the red-3299-start decoded spiral are frozen.
const p15Keys = {
  redSpiral: [3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222,
              3152, 3038, 2838, 2472, 1820, 708, 1206, 4516],
  printedRows: [3258, 3222, 3152, 3038, 3278, 3299, 3298, 2838,
                3288, 3294, 3296, 2472, 4516, 1206, 708, 1820]
};
assert.equal(parsed.words.length, 16 * 181);
const p15Cases = [];
for (const [edge, input] of Object.entries(positions)) {
  for (const [order, nums] of Object.entries(p15Keys)) {
    assert.equal(nums.length, 16);
    for (const decodeSign of [-1, 1]) {
      const decoded = input.map((v, i) => mod29(v + decodeSign * nums[i % 16]));
      const encrPlant = nativePlant.map((v, i) => mod29(v - decodeSign * nums[i % 16]));
      assert.deepEqual(encrPlant.map((v, i) => mod29(v + decodeSign * nums[i % 16])), nativePlant);
      assert.deepEqual(decoded.map((v, i) => mod29(v - decodeSign * nums[i % 16])), input);
      p15Cases.push({edge, order, decodeSign, ioc: ioc(decoded), firstThirty: render(decoded.slice(0, 30))});
    }
  }
}
assert.equal(p15Cases.length, 8);
assert(p15Cases.every(r => r.ioc < 0.036));

// Typed "numbers are the direction" candidate: use p15's 16 printed numbers
// as source-frozen positions WITHIN each of the 2896 complete original words.
// The two ordinary indexing conventions and directions are registered, not tuned.
const originalWords = parsed.words.map(w => [...w.runes].map(r => alphabet.get(r)));
const p15SelectorCases = [];
for (const [order, nums] of Object.entries(p15Keys)) {
  for (const oneBased of [false, true]) {
    for (const fromEnd of [false, true]) {
      const positions = originalWords.map((w, i) => {
          const n = nums[i % 16] - (oneBased ? 1 : 0);
        const offset = ((n % w.length) + w.length) % w.length;
        return fromEnd ? w.length - 1 - offset : offset;
      });
      const extracted = originalWords.map((w, i) => w[positions[i]]);
      // A planted, source-typed 2896-rune message must survive this selection.
      const planted = originalWords.map(w => w.slice());
      for (let i = 0; i < planted.length; i++) planted[i][positions[i]] = nativePlant[i];
      assert.deepEqual(planted.map((w, i) => w[positions[i]]), nativePlant);
      assert.equal(extracted.length, 2896);
      p15SelectorCases.push({
        order, oneBased, fromEnd, ioc: ioc(extracted),
        firstThirty: render(extracted.slice(0, 30))
      });
    }
  }
}
assert.equal(p15SelectorCases.length, 8);
assert(p15SelectorCases.every(r => r.ioc < 0.036));

assert.equal(results.length, 14);
assert(results.every(r => r.ioc < 0.036));
console.log(JSON.stringify({
  test: "complete-word acrostic and progressive Caesar original-source gate",
  originalPages: 56, runeBearingPages: 55,
  runes: sourceIndices.length, printedWords: parsed.words.length,
  crossPageWords: parsed.crossPageWords,
  nativeSolvedP57IoC: ioc(solved),
  positivePlants: "20/20 complete 2896-rune reversible GP29 additive positives; 8/8 literal within-word 2896-rune message implants",
  cases: results,
  p15NumeralKeyCases: p15Cases,
  p15WithinWordSelectorCases: p15SelectorCases
}, null, 2));
