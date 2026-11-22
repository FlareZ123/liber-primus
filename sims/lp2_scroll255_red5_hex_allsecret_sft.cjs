"use strict";

/**
 * Original p3–p8 255-word/255-rune readout, p7 red-five-period codebook gate.
 * Windows 11, Node.js 22: run from the repository root or any directory.
 *
 * SOURCE: Exact source 2014 p3–p8 rune transcription + original p7 red ink.
 * OBSERVATION: The 255 direct duplicate differences spell HEX [8,18,14].
 * MODEL: Y[j] = F(length(word[j]), summary(word[j])) + K5[j % 5] mod29.
 * K5 is the five original p7 red-word GP0 products, never fitted to the text.
 *
 * The mathematically best possible secret deterministic F for each summary
 * is a modal-output lookup on the immutable source-input equivalence classes.
 * Every class collision is a necessary failure for ALL possible hidden keys.
 *
 * No new plaintext is claimed; this is a scoped structural exclusion.
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const ink = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp2-ink-annotations.json"), "utf8"));
const trans = fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp2-transcription.txt"), "utf8").split("%");
const runeMap = new Map(corpus.runes.map((r, i) => [r, i]));

/** @param {number} v @returns {number} */
function mod(v) { return (v % 29 + 29) % 29; }

/**
 * Recover complete words respecting printed '-' and '.' delimiters.
 * The '/' and page separators are nonword wraps.
 * @param {string} s
 * @returns {Array<{start:number,end:number,v:number[]}>}
 */
function parseWords(s) {
  const result = [];
  let current = [], start = 0, offset = 0;
  function flush() {
    if (current.length) result.push({start, end: offset - 1, v: current});
    current = [];
  }
  for (const ch of s) {
    if (runeMap.has(ch)) {
      if (!current.length) start = offset;
      current.push(runeMap.get(ch));
      offset++;
    } else if (ch === "-" || ch === ".") flush();
  }
  flush();
  return result;
}

const page7 = parseWords(trans[7]);
assert.equal(page7.reduce((n, w) => n + w.v.length, 0), 208);
const red = ink.pages.find(p => p.page === 7).red_spans;
assert.deepEqual(red.map(s => [s.start, s.length]), [[194, 14]]);
const lastRed = page7.filter(w => w.start >= 194 && w.end < 208);
assert.equal(lastRed.length, 5);
assert.deepEqual(lastRed.map(w => w.v),
  [[23,3], [22,16,2,25], [5,7,11], [14,28], [6,28,19]]);
const five = lastRed.map(w => w.v.reduce((a, b) => mod(a * b), 1));
assert.deepEqual(five, [11, 26, 8, 15, 2]);
const words = parseWords(trans.slice(3, 8).join(""));
const ciphertext = corpus.pages[8].indices;
assert.equal(words.length, 255);
assert.equal(ciphertext.length, 255);
assert.equal(words.reduce((n, w) => n + w.v.length, 0), 1145);

/** @param {number[]} v @returns {string} */
function wordID(v) { return v.join(","); }
const occurrences = new Map();
words.forEach(({v}, i) => {
  const k = wordID(v);
  occurrences.set(k, [...(occurrences.get(k) || []), i]);
});
const repeated = [...occurrences.values()]
  .filter(ids => ids.length > 1).sort((a, b) => a[0] - b[0]);
assert.deepEqual(repeated, [[47, 240], [48, 231], [235, 236]]);
const rawDifferences = repeated.map(([a, b]) => mod(ciphertext[a] - ciphertext[b]));
assert.deepEqual(rawDifferences, [8, 18, 14]);

const residual = ciphertext.map((y, i) => mod(y - five[i % 5]));
const correctedMatches = repeated.map(([a, b]) => residual[a] === residual[b]);
assert.deepEqual(correctedMatches, [false, true, true]);
let rotationsWithTwo = 0;
for (let offset = 0; offset < 5; offset++) {
  for (const sign of [-1, 1]) {
    const keyless = ciphertext.map((y, i) => mod(y - sign * five[(i + offset) % 5]));
    const n = repeated.filter(([a, b]) => keyless[a] === keyless[b]).length;
    assert(n <= 2);
    if (n === 2) {
      assert.equal(offset, 0);
      assert.equal(sign, 1);
      rotationsWithTwo++;
    }
  }
}
assert.equal(rotationsWithTwo, 1);
// An equally source-native five-page rival resets the five-word key
// at each physical page boundary. Preserve original cross-page whole words;
// assign a complete word by either the page where it starts or where it ends.
// Neither alternate reset repairs all three original source collisions.
const pageRuneLength = corpus.pages.slice(3, 8).map(p => p.indices.length);
assert.deepEqual(pageRuneLength, [217, 261, 263, 196, 208]);
const cuts = [0];
for (const n of pageRuneLength) cuts.push(cuts.at(-1) + n);
function pageOfRune(offset) {
  return cuts.findIndex((v, i) => i < 5 && v <= offset && offset < cuts[i + 1]);
}
const pageStartCounter = Array(5).fill(0), pageEndCounter = Array(5).fill(0);
const startOrd = [], endOrd = [];
for (const w of words) {
  const sp = pageOfRune(w.start), ep = pageOfRune(w.end);
  assert(sp >= 0 && ep >= 0);
  startOrd.push(pageStartCounter[sp]++);
  endOrd.push(pageEndCounter[ep]++);
}
assert.deepEqual(pageStartCounter, [44,60,58,44,49]);
assert.deepEqual(pageEndCounter, [43,60,58,44,50]);
const pageResetBest = {};
for (const [name, phase] of Object.entries({start:startOrd, end:endOrd})) {
  let best = 0;
  for (const sign of [-1, 1]) for (let offset = 0; offset < 5; offset++) {
    const keyless = ciphertext.map((y, i) =>
      mod(y - sign * five[(phase[i] + offset) % 5]));
    const n = repeated.filter(([a, b]) => keyless[a] === keyless[b]).length;
    best = Math.max(best, n);
  }
  assert.equal(best, 1);
  pageResetBest[name] = best;
}


/**
 * Most favorable possible deterministic arbitrary secret lookup over input
 * equivalence classes. This bound even permits noninjective maps and
 * a different alphabet for every word length.
 * @param {number[]} input
 * @param {number[]} output
 * @param {boolean} includeLength
 * @returns {{max:number, groups:number, conflictingGroups:number}}
 */
function bound(input, output, includeLength) {
  const groups = new Map();
  for (let i = 0; i < words.length; i++) {
    const label = includeLength ? words[i].v.length + ":" + input[i] : String(input[i]);
    const counts = groups.get(label) || Array(29).fill(0);
    counts[output[i]]++;
    groups.set(label, counts);
  }
  let max = 0, conflictingGroups = 0;
  for (const counts of groups.values()) {
    const total = counts.reduce((a, b) => a + b, 0);
    const most = Math.max(...counts);
    max += most;
    if (most !== total) conflictingGroups++;
  }
  return {max, groups:groups.size, conflictingGroups};
}
const summaries = {
  ordinalSum:w => mod(w.reduce((s, x) => s + x, 0)),
  primeSum:w => mod(w.reduce((s, x) => s + corpus.prime[x], 0)),
  ordinalProduct:w => w.reduce((s, x) => mod(s * x), 1),
  first:w => w[0],
  last:w => w[w.length - 1],
  length:w => w.length,
};
const expected = {
  ordinalSum:[47,162], primeSum:[48,153], ordinalProduct:[46,149],
  first:[51,157], last:[54,156], length:[34,34],
};
const output = {};
for (const [name, fn] of Object.entries(summaries)) {
  const feature = words.map(w => fn(w.v));
  const raw = bound(feature, residual, false);
  const lengthAdjusted = bound(feature, residual, true);
  assert.deepEqual([raw.max, lengthAdjusted.max], expected[name]);
  assert(lengthAdjusted.max < 255);
  const planted = words.map((w, i) =>
    mod(7 * w.v.length + 9 * feature[i] + 3));
  const encoded = planted.map((y, i) => mod(y + five[i % 5]));
  const exact = encoded.map((y, i) => mod(y - five[i % 5]));
  assert.deepEqual(exact, planted);
  assert.equal(bound(feature, exact, true).max, 255);
  output[name] = {singleTable:raw, arbitraryByLength:lengthAdjusted};
}
// Source-typed HEX consumer: use the original 256 base60-decoded table
// cells as unsigned bytes and original p7 red-five products as periodic masks.
// All three complete 256-byte variants must re-encrypt exactly.
const grid = JSON.parse(fs.readFileSync(path.join(ROOT,
  "resources", "liber-primus", "lp2-grid-256.json"), "utf8"));
const table = grid.bytes;
assert.equal(table.length, 256);
assert.deepEqual(table.slice(0, 3), [203, 231, 167]);
const byteMasks = {
  xor:(v,k) => v ^ k,
  plus:(v,k) => (v + k) & 255,
  minus:(v,k) => (v - k + 256) & 255,
};
const byteConsumers = {};
for (const [name, encode] of Object.entries(byteMasks)) {
  const out = table.map((v, j) => encode(v, five[j % five.length]));
  const decoded = out.map((v, j) => {
    const k = five[j % five.length];
    return name === "xor" ? (v ^ k)
      : name === "plus" ? ((v - k + 256) & 255)
      : ((v + k) & 255);
  });
  assert.deepEqual(decoded, table);
  byteConsumers[name] = {
    first16:out.slice(0, 16),
    printableASCII:out.filter(v => v >= 32 && v <= 126).length,
  };
}
assert.equal(byteConsumers.xor.printableASCII, 103);
assert.equal(byteConsumers.plus.printableASCII, 96);
assert.equal(byteConsumers.minus.printableASCII, 93);
assert.deepEqual(byteConsumers.xor.first16.slice(0, 4), [192,253,175,181]);

console.log(JSON.stringify({
  source:"Original p3-p8, exact p7 five red-word GP-index product key",
  red5:five, originalDifferences:rawDifferences, correctedMatches,
  directP50ByteConsumers:byteConsumers,
  pageResetBest,
  sourceWordCount:words.length, page8RuneCount:ciphertext.length,
  arbitrarySecretLookupBounds:output,
  plant:"every feature's 255-position positive reaches 255/255"
},null,2));
