"use strict";

// Source-native solved-page register/rubric control. Run with Node.js.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/** @typedef {{page: number, indices: number[]}} RunePage */
/** @typedef {{pages: RunePage[], translit: string[]}} Corpus */
/** @typedef {{page: number, red_spans?: {start: number, length: number, runes: string}[], large_punctuation?: [number, number, string][]}} InkPage */

/** @type {Corpus} */
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
/** @type {{pages: InkPage[]}} */
const ink = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "resources", "liber-primus", "lp2-ink-annotations.json"), "utf8"));
const p56 = corpus.pages.find(p => p.page === 56);
const p57 = corpus.pages.find(p => p.page === 57);
const i56 = ink.pages.find(p => p.page === 56);
const i57 = ink.pages.find(p => p.page === 57);
assert.ok(p56 && p57 && i56 && i57);
assert.equal(p56.indices.length, 85);
assert.equal(p57.indices.length, 95);
assert.deepEqual(i56.red_spans, [{start: 0, length: 5, runes: "ᚫᛄᛟᛋᚱ"}]);
assert.deepEqual(i56.large_punctuation, [[5, 13, "red"], [45, 10, "red"], [85, 13, "red"]]);
assert.deepEqual(i57.red_spans, [{start: 0, length: 7, runes: "ᛈᚪᚱᚪᛒᛚᛖ"}]);
assert.deepEqual(i57.large_punctuation, [[7, 13, "red"], [95, 23, "red"]]);

/** @param {string} phrase @returns {number[]} */
function sourceNative(phrase) {
  const aliases = corpus.translit.map((token, index) => ({token, index}));
  aliases.push({token: "ING", index: 21}, {token: "IO", index: 27});
  aliases.sort((a, b) => b.token.length - a.token.length);
  /** @type {number[]} */
  const output = [];
  for (const raw of phrase.split(/\s+/)) {
    const word = raw.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
    for (let pos = 0; pos < word.length;) {
      const hit = aliases.find(x => word.startsWith(x.token, pos));
      assert.ok(hit, "Unencodable word "+word+" at index "+pos);
      output.push(hit.index);
      pos += hit.token.length;
    }
  }
  return output;
}

/** @param {number} n @returns {number[]} */
function firstPrimes(n) {
  /** @type {number[]} */
  const primes = [];
  for (let candidate = 2; primes.length < n; candidate++) {
    let isPrime = true;
    for (let i = 2; i * i <= candidate; i++) {
      if (candidate % i === 0) { isPrime = false; break; }
    }
    if (isPrime) primes.push(candidate);
  }
  return primes;
}
const primes = firstPrimes(85);

/** @param {number[]} original @param {readonly number[]} resets @returns {number[]} */
function primeTotientDecode(original, resets) {
  let keyIndex = 0;
  /** @type {number[]} */
  const output = [];
  for (let i = 0; i < original.length; i++) {
    if (resets.includes(i)) keyIndex = 0;
    if (i === 56) {
      assert.equal(original[i], 0);
      output.push(0); // Authentic plaintext-F passthrough.
      continue;
    }
    const phi = primes[keyIndex++] - 1;
    output.push((original[i] - phi % 29 + 29) % 29);
  }
  return output;
}

/** @param {number[]} a @param {number[]} b @returns {number} */
function matching(a, b) {
  assert.equal(a.length, b.length);
  return a.reduce((count, value, index) => count + (value === b[index] ? 1 : 0), 0);
}
const expected56 = sourceNative("AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE");
const expected57 = sourceNative("PARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE");
assert.equal(expected56.length, 85);
assert.equal(expected57.length, 95);
assert.deepEqual(p56.indices.slice(0, 5), [25, 11, 22, 15, 4]);
assert.deepEqual(expected56.slice(0, 5), [24, 9, 18, 9, 23]);
assert.deepEqual(p57.indices.slice(0, 7), [13, 24, 4, 24, 17, 20, 18]);
assert.deepEqual(p57.indices, expected57);
assert.deepEqual(primeTotientDecode(p56.indices, []), expected56);
const counts = {
  historicalContinuous: matching(primeTotientDecode(p56.indices, []), expected56),
  resetAtRedTitle: matching(primeTotientDecode(p56.indices, [5]), expected56),
  resetAtRedTenDot: matching(primeTotientDecode(p56.indices, [45]), expected56),
  resetAtBoth: matching(primeTotientDecode(p56.indices, [5, 45]), expected56),
  wrongTitleBoundary: matching(primeTotientDecode(p56.indices, [4]), expected56),
  wrongTenDotBoundary: matching(primeTotientDecode(p56.indices, [44]), expected56),
  clearP57: matching(p57.indices, expected57)
};
assert.deepEqual(counts, {
  historicalContinuous: 85,
  resetAtRedTitle: 6,
  resetAtRedTenDot: 48,
  resetAtBoth: 8,
  wrongTitleBoundary: 5,
  wrongTenDotBoundary: 46,
  clearP57: 95
});
console.log(JSON.stringify({
  source: "Original LP2 73.jpg / 74.jpg",
  observed: counts,
  criterion: "Red rubric/printed markers alone do not determine a solved-page cipher-state transition.",
  status: "PASS"
}, null, 2));
