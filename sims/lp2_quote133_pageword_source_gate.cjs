#!/usr/bin/env node
"use strict";

/**
 * Quote GP-prime sums as page/word addresses in the historical 133-title
 * context. Scope: original LP2 ciphertext and seven independently annotated
 * quotes. The 75-page numbering is from the later combined LP1+LP2 archive.
 * No unknown plaintext is claimed or printed.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const load = p => fs.readFileSync(path.join(root, p), "utf8");

const corpus = JSON.parse(load("resources/liber-primus/lp2-corpus.json"));
const notes = JSON.parse(load("resources/liber-primus/lp2-quote-punctuation-spans.json"));
const master = load("resources/transcriptions/liber_primus_master.txt");
const transcribed = load("resources/lp2-transcription.txt");
const originalHtml = load("resources/cicada2014-onion7-index.html");
const sourceTitle = Number(originalHtml.match(/<title>(\d+)<\/title>/)[1]);
const originalImageIds = [...originalHtml.matchAll(/<img src="(\d+)\.jpg"/g)]
  .map(m => Number(m[1]));
assert.equal(sourceTitle, 133);
assert.deepEqual(originalImageIds, Array.from({length: 58}, (_, i) => i));

const indices = new Map(corpus.runes.map((x, i) => [x, i]));
const ciphertext = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(ciphertext.length, 12956);
const prefix = [0];
for (const glyph of ciphertext) prefix.push(prefix.at(-1) + corpus.prime[glyph]);
const sum = (start, end) => prefix[end] - prefix[start];

const scannedWords = master.split("%").map(page =>
  [...page.matchAll(/[ᚠ-᛿]+/gu)].map(m => [...m[0]].map(ch => indices.get(ch)))
);
assert(scannedWords.length >= 74);
const address = (weight, radix) => ({
  scan: weight % radix,
  ordinal: Math.floor(weight / radix)
});
const valid = (weight, radix) => {
  const a = address(weight, radix);
  return a.scan >= 1 && a.scan <= 75 &&
    a.ordinal < (scannedWords[a.scan - 1]?.length || 0);
};

const quoted = notes.quotes.map((q, i) => {
  const weight = sum(q.start, q.end);
  return {i, weight, runes: q.end - q.start, ...address(weight, 133)};
});
assert.deepEqual(quoted.map(q => q.weight), [948, 1105, 738, 2684, 3335, 8042, 3388]);
assert.deepEqual(quoted.map(q => q.scan), [17, 41, 73, 24, 10, 62, 63]);
assert.deepEqual(quoted.map(q => q.ordinal), [7, 8, 5, 20, 25, 60, 25]);
const source58 = quoted.filter(q => q.runes === 58);
assert.equal(source58.length, 1, "exactly one marked quote spans all 58 LP2 images");
assert.equal(source58[0].i, 3);
const otherPrimeSum = quoted.filter(q => q.i !== source58[0].i)
  .reduce((acc, q) => acc + q.weight, 0);
assert.equal(otherPrimeSum, 133 * (133 - 1));
// Independent solved PARABLE source has 19 body words. Seven quotes and 56
// encrypted pages yield a second, algebraically related numeric expression;
// it is not an independent statistical confirmation of quote intentionality.
const parableGroups = transcribed.split("%")[56].split(".")
  .map(clause => clause.split("-").map(w => [...w].filter(ch => indices.has(ch)))
    .filter(w => w.length > 0))
  .filter(group => group.length > 0);
assert.deepEqual(parableGroups.map(g => g.length), [1, 7, 6, 6]);
const parableBodyWords = parableGroups.slice(1).reduce((n, group) => n + group.length, 0);
const acIndex = corpus.translit.indexOf("A");
const numberOfEncryptedPages = corpus.pages.filter(p => p.page <= 55).length;
const totalQuoteWeight = quoted.reduce((acc, q) => acc + q.weight, 0);
assert.deepEqual([parableBodyWords, acIndex, numberOfEncryptedPages], [19, 24, 56]);
assert.equal(totalQuoteWeight, numberOfEncryptedPages * parableBodyWords ** 2 + acIndex);

const leftPrimeSum = quoted.slice(0, source58[0].i).reduce((acc, q) => acc + q.weight, 0);
const rightPrimeSum = quoted.slice(source58[0].i + 1).reduce((acc, q) => acc + q.weight, 0);
assert.equal(leftPrimeSum, 21 * 133 - 2);
assert.equal(rightPrimeSum, 111 * 133 + 2);


assert(quoted.every(q => valid(q.weight, 133)));

// A modulus above the smallest sum leaves that sum as a page number >75.
// This bounds the complete possible-radix search without arbitrary cutoffs.
const maxObservedRadix = Math.min(...quoted.map(q => q.weight));
const validRadices = [];
for (let radix = 2; radix <= maxObservedRadix; radix++) {
  if (quoted.every(q => valid(q.weight, radix))) validRadices.push(radix);
}
assert.deepEqual(validRadices, [133]);

// Original printed line and page wraps do not terminate words.
const text = transcribed.split("%").slice(0, 55).join("%");
const words = [];
let offset = 0, first = 0, open = false;
for (const ch of text) {
  if (indices.has(ch)) {
    if (!open) {first = offset; open = true;}
    offset++;
  } else if (ch === "/" || ch === "%" || /\s/u.test(ch)) {
    // Only layout.
  } else if (open) {
    words.push({start: first, end: offset});
    open = false;
  }
}
if (open) words.push({start: first, end: offset});
assert.equal(offset, ciphertext.length);
assert.equal(words.length, 2896);

const shapes = notes.quotes.map(q => ({
  runes: q.end - q.start,
  words: words.filter(w => w.start >= q.start && w.end <= q.end).length
}));
assert.deepEqual(shapes.map(x => x.words), [4, 5, 2, 14, 13, 34, 14]);
const samples = shapes.map(({words: n, runes}) => {
  const found = [];
  for (let j = 0; j + n <= words.length; j++) {
    const end = words[j + n - 1].end;
    if (end - words[j].start === runes) found.push({sum: sum(words[j].start, end)});
  }
  return found;
});
assert.deepEqual(samples.map(s => s.length), [232, 204, 192, 128, 51, 64, 80]);

// In every surrogate, any admissible radix is bounded by its smallest
// weight. This static ceiling contains the entire surrogate support.
const maxRadix = Math.min(...samples.map(p => Math.max(...p.map(x => x.sum))));
const width = Math.ceil((maxRadix + 1) / 32);
for (const pool of samples) for (const value of pool) {
  const flags = new Uint32Array(width);
  for (let radix = 2; radix <= maxRadix; radix++) {
    if (valid(value.sum, radix)) flags[radix >>> 5] |= (1 << (radix & 31));
  }
  value.flags = flags;
}
function hasRadix(row, radix) {
  return (row.flags[radix >>> 5] & (1 << (radix & 31))) !== 0;
}
function someRadix(rows) {
  for (let word = 0; word < width; word++) {
    let mask = rows[0].flags[word];
    for (let k = 1; k < rows.length; k++) mask &= rows[k].flags[word];
    if (mask) return true;
  }
  return false;
}
let state = 0x13413331;
function draw() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
let arbitraryRadix = 0, sourceRadix = 0, sourceRadixFirstTwo = 0;
const trials = 100000;
for (let t = 0; t < trials; t++) {
  const rows = samples.map(p => p[draw() % p.length]);
  if (someRadix(rows)) arbitraryRadix++;
  if (rows.every(x => hasRadix(x, 133))) {
    sourceRadix++;
    if (rows[0].sum % 133 === 17 && rows[1].sum % 133 === 41) {
      sourceRadixFirstTwo++;
    }
  }
}

// A source-visible subset selector is the unique 58-rune quotation:
// exclude it, then compare the remaining six source prime sums against
// title * (title-1), without searching alternative omission positions.
const otherSamples = samples.filter((_, i) => i !== source58[0].i);
let checksumState = 0x13358;
function checksumDraw() {
  checksumState ^= checksumState << 13;
  checksumState ^= checksumState >>> 17;
  checksumState ^= checksumState << 5;
  return checksumState >>> 0;
}
let exactChecksum = 0, moduloChecksum = 0;
const checksumTrials = 1000000;
for (let t = 0; t < checksumTrials; t++) {
  let total = 0;
  for (const pool of otherSamples) total += pool[checksumDraw() % pool.length].sum;
  if (total === 133 * 132) exactChecksum++;
  if (total % 133 === 0) moduloChecksum++;
}

// A separate conditional null for the source-ordered triad balance around the
// unique 58-rune pivot: left congruent to -2 (133), right congruent to +2.
let triadState = 0x133581;
function triadDraw() {
  triadState ^= triadState << 13;
  triadState ^= triadState >>> 17;
  triadState ^= triadState << 5;
  return triadState >>> 0;
}
const triadTrials = 2000000;
let balancedTriads = 0, exactAndBalanced = 0;
for (let k = 0; k < triadTrials; k++) {
  let left = 0, right = 0;
  for (const pool of samples.slice(0, 3)) left += pool[triadDraw() % pool.length].sum;
  for (const pool of samples.slice(source58[0].i + 1)) {
    right += pool[triadDraw() % pool.length].sum;
  }
  if (left % 133 === 131 && right % 133 === 2) {
    balancedTriads++;
    if (left + right === 133 * 132) exactAndBalanced++;
  }
}

console.log(JSON.stringify({
  source: "Original quoted LP2 ciphertext; 2014 HTML title 133; later combined 75-scan order",
  crossIdentity: {sourceTitle, originalImageCount: originalImageIds.length, totalQuoteWeight, encryptedPages: numberOfEncryptedPages, solvedParableBodyWords: parableBodyWords, acIndex, equality: "56 * 19^2 + 24 = 20240", note: "algebraically related to the 133-based quote checksum; not independent evidence"},
  caution: "The 2014 original LP2 onion index used 0.jpg..57.jpg; these addresses use a later combined-archive numbering. This is a numeric coincidence candidate, not a historical key or decryption.",
  addresses: quoted.map(q => ({
    ...q,
    sourceRunes: scannedWords[q.scan - 1][q.ordinal].map(i => corpus.runes[i]).join("")
  })),
  validRadices,
  source58Checksum: {omittedQuoteIndex: source58[0].i, otherPrimeSum, expected: 133 * 132, sixRunes: 347, sixWords: 72, leftPrimeSum, rightPrimeSum, leftTarget: 133 * 21 - 2, rightTarget: 133 * 111 + 2, checksumTrials, exactChecksum, moduloChecksum, seed: '0x13358', triadTrials, balancedTriads, exactAndBalanced, triadSeed: '0x133581'},
  matchedPools: samples.map((pool, i) => ({
    ...shapes[i], candidateSpans: pool.length,
    valid133: pool.filter(x => hasRadix(x, 133)).length,
    exactResidue: pool.filter(x => x.sum % 133 === quoted[i].scan).length
  })),
  null: {type: "matched rune length and word count, independent sampling with replacement",
    random: "xorshift32 seed 0x13413331", trials, maxRadix,
    arbitraryRadix, sourceRadix, sourceRadixFirstTwo},
  noRecoveredPlaintext: true
}, null, 2));
