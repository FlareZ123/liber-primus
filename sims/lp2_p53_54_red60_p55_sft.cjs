"use strict";

/**
 * Agent48, 13 November 2026.
 * Test the 51+9 consecutive page-edge red runes as a 60-rune additive key
 * for original physical p55 and for the frozen LP1 p5 seven-word crib.
 *
 * SFT: node sims/lp2_p53_54_red60_p55_sft.cjs
 * No generated plaintext is claimed.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const sourceWords = [
  "ᚦᛖ", "ᛏᚩᛏᛁᛖᚾᛏ", "ᚠᚢᚾᚳᛏᛡᚾ",
  "ᛁᛋ", "ᛋᚪᚳᚱᛖᛞ", "ᚪᛚᛚ", "ᚦᛝᛋ"
];
const runeMap = new Map(gp.runes.map((r, i) => [r, i]));
const numbers = runes => [...runes].map(r => {
  assert(runeMap.has(r), "unknown rune");
  return runeMap.get(r);
});
const mod29 = x => ((x % 29) + 29) % 29;
const atPage = n => ink.pages.find(p => p.page === n);
assert.equal(atPage(53).red_spans.length, 1);
assert.equal(atPage(54).red_spans.length, 1);
const tail53 = atPage(53).red_spans[0];
const head54 = atPage(54).red_spans[0];
assert.equal(tail53.start + tail53.length, gp.pages[53].indices.length);
assert.equal(head54.start, 0);
assert.deepEqual([tail53.length, head54.length], [51, 9]);
const key = numbers(tail53.runes + head54.runes);
assert.equal(key.length, 60);
const page55 = gp.pages[55].indices;
assert.equal(page55.length, 76);
const originalSuffix = page55.slice(46);
const phrase = numbers(sourceWords.join(""));
assert.deepEqual(sourceWords.map(w => [...w].length), [2,7,7,2,6,3,3]);
assert.equal(phrase.length, 30);
assert(originalSuffix.length === phrase.length);

/**
 * @param {number[]} input
 * @param {1|-1} sign
 * @param {number} offset
 * @returns {number[]}
 */
function transform(input, sign, offset) {
  return input.map((x, i) => mod29(x + sign * key[(offset + i) % key.length]));
}

const results = [];
for (const phase of [0, 46]) {
  for (const sign of [-1, 1]) {
    const prediction = transform(phrase, sign, phase);
    const matchPositions = prediction.flatMap((v, i) =>
      v === originalSuffix[i] ? [i] : []);
    const expected = phase === 46 && sign === 1 ? [] :
      phase === 0 && sign === -1 ? [15] :
      phase === 0 && sign === 1 ? [23] : [23];
    assert.deepEqual(matchPositions, expected);
    assert.deepEqual(transform(prediction, -sign, phase), phrase);
    assert.deepEqual(transform(transform(page55, -sign, 0), sign, 0), page55);
    results.push({phase, sign, matched: matchPositions.length, matchPositions});
  }
}
const ioc = input => {
  const bins = Array(29).fill(0);
  for (const x of input) bins[x]++;
  return bins.reduce((s, n) => s + n * (n - 1), 0) /
    (input.length * (input.length - 1));
};
console.log(JSON.stringify({
  source: "original LP2 p53 red suffix (51) + p54 red prefix (9)",
  keyLength: key.length,
  sourceCrib: "THE TOTIENT FUNCTION IS SACRED ALL THINGS",
  sourceCribIsProvisional: true,
  originalP55Length: page55.length,
  originalP55SuffixOffset: 46,
  exactCribTests: results,
  ioc: {
    rawP55: ioc(page55),
    subtractedP55: ioc(transform(page55, -1, 0)),
    addedP55: ioc(transform(page55, 1, 0))
  },
  verdict: "No crib match under the four frozen additive conventions; no plaintext identified"
}, null, 2));
