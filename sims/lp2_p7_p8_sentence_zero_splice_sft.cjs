"use strict";

/**
 * Source-anchored p7 -> p8 ternary zero-splice, with exact original-cipher
 * receiver and authentic solved LP2 control.
 *
 * Run (Node.js 22, Windows 11): node sims/lp2_p7_p8_sentence_zero_splice_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const ink = JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-ink-annotations.json"), "utf8"));
const pageText = fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-transcription.txt"), "utf8").split("%");
const p7 = corpus.pages[7].indices;
const p8 = corpus.pages[8].indices;
const black = p8.slice(12);
const target = corpus.pages.slice(9, 15).flatMap(p => p.indices);
const solved = corpus.pages[57].indices;
const runeSet = new Set(corpus.runes);
assert.equal(p7.length, 208);
assert.equal(p8.length, 255);
assert.equal(black.length, 243);
assert.equal(target.length, 1474);
assert.equal(solved.length, 95);
const p7Ink = ink.pages.find(p => p.page === 7);
const p8Ink = ink.pages.find(p => p.page === 8);
assert(p7Ink.large_punctuation.some(x => x[0] === 208 && x[1] === 13 && x[2] === "red"));
assert(p8Ink.red_spans.some(x => x.start === 0 && x.length === 12));

const redWords = [[23, 3], [22, 16, 2, 25], [5, 7, 11], [14, 28], [6, 28, 19]];
assert.deepEqual(p7.slice(194), redWords.flat());
const product = redWords.map(w => w.reduce((a, b) => a * b % 29, 1));
assert.deepEqual(product, [11, 26, 8, 15, 2]);
const taps = product.map(x => x % 3);
assert.deepEqual(taps, [2, 2, 2, 0, 2]);

// The actual original physical transcription, without inventing a sentence
// boundary at a line wrap or a page edge.
const stops = [];
const hyphens = new Set();
let runeOffset = 0;
for (const ch of pageText[8]) {
  if (runeSet.has(ch)) runeOffset++;
  else if (runeOffset > 12 && runeOffset < 255) {
    if (ch === ".") stops.push(runeOffset - 12);
    if (ch === "-") hyphens.add(runeOffset - 12);
  }
}
assert.equal(runeOffset, 255);
assert.deepEqual(stops, [28, 122, 208]);
assert(hyphens.has(87));

/** @param {number[]} seed @returns {number[]} */
function cycle(seed) {
  const output = [];
  let state = seed.slice();
  for (let n = 0; n < 242; n++) {
    output.push(state[0]);
    state = state.slice(1).concat([taps.reduce((v, x, j) => v + x * state[j], 0) % 3]);
  }
  assert.deepEqual(state, seed);
  return output;
}
const seq = cycle(taps);
const splicePositions = [];
for (let i = 0; i < 242; i++) {
  if ([0, 1, 2, 3].every(j => seq[(i + j) % 242] === 0)) splicePositions.push((i + 4) % 242);
}
assert.deepEqual(splicePositions, [87, 208]);

/** @param {number} insertion @returns {number[]} */
function completeCycle(insertion) {
  const trits = [...seq.slice(0, insertion), 0, ...seq.slice(insertion)];
  assert.equal(trits.length, 243);
  const addresses = trits.map((_, i) => {
    let addr = 0;
    for (let j = 0; j < 5; j++) addr = 3 * addr + trits[(i + j) % 243];
    return addr;
  });
  assert.equal(new Set(addresses).size, 243);
  assert(addresses.includes(0));
  return addresses;
}
const maps = splicePositions.map(completeCycle);
const stopSet = new Set(stops);
let phaseSentence = 0;
let phaseSentenceOtherHyphen = 0;
for (let phase = 0; phase < 242; phase++) {
  const a = (87 + phase) % 242;
  const b = (208 + phase) % 242;
  const isSentence = stopSet.has(a) || stopSet.has(b);
  if (isSentence) phaseSentence++;
  if ((stopSet.has(a) && hyphens.has(b)) || (stopSet.has(b) && hyphens.has(a))) {
    phaseSentenceOtherHyphen++;
  }
}
assert.equal(phaseSentence, 6);
assert.equal(phaseSentenceOtherHyphen, 4);

/** @param {number} n @returns {number} */
function mod29(n) { return (n % 29 + 29) % 29; }
/** @param {number[]} arr @returns {number} */
function ioc(arr) {
  const hist = Array(29).fill(0);
  arr.forEach(x => hist[x]++);
  return hist.reduce((s, n) => s + n * (n - 1), 0) / (arr.length * (arr.length - 1));
}
/** @param {number[]} addresses @returns {number[]} */
function addressTable(addresses) {
  const table = Array(243);
  for (let i = 0; i < 243; i++) table[addresses[i]] = black[i];
  assert(table.every(x => Number.isInteger(x)));
  return table;
}
/**
 * @param {number[]} text
 * @param {number[]} table
 * @param {"cipher"|"plain"} driver
 * @param {"ordinal"|"prime"} addrType
 * @param {number} sign
 * @param {boolean} decrypt
 * @returns {number[]}
 */
function transform(text, table, driver, addrType, sign, decrypt) {
  const previous = p8.slice(-5);
  const out = [];
  for (const x of text) {
    const address = previous.slice(-5).reduce((v, r) =>
      3 * v + (addrType === "ordinal" ? r % 3 : corpus.prime[r] % 3), 0);
    const y = mod29(x + (decrypt ? -sign : sign) * table[address]);
    out.push(y);
    previous.push(driver === "cipher" ? (decrypt ? x : y) : (decrypt ? y : x));
  }
  return out;
}

const result = [];
for (let k = 0; k < 2; k++) {
  const table = addressTable(maps[k]);
  for (const addrType of ["ordinal", "prime"]) {
    for (const driver of ["cipher", "plain"]) {
      for (const sign of [-1, 1]) {
        const plain = transform(target, table, driver, addrType, sign, true);
        assert.deepEqual(transform(plain, table, driver, addrType, sign, false), target);
        const planted = transform(solved, table, driver, addrType, sign, false);
        assert.deepEqual(transform(planted, table, driver, addrType, sign, true), solved);
        result.push({
          splice: splicePositions[k], addrType, driver, sign,
          ioc: Number(ioc(plain).toFixed(10)),
          prefix: plain.slice(0, 24).map(x => corpus.translit[x]).join("."),
          originalReencryption: target.length,
          solvedRoundTrip: solved.length
        });
      }
    }
  }
}
assert.equal(result.length, 16);
const newSplice = result.filter(r => r.splice === 208);
const min = Math.min(...newSplice.map(r => r.ioc));
const max = Math.max(...newSplice.map(r => r.ioc));
assert(min > 0.033 && max < 0.036);
console.log(JSON.stringify({
  source: "original p7 red14 and terminal red13, original p8 red12/black243 and punctuation",
  fiveRedWordProducts: product,
  primitiveGF3Taps: taps,
  missingZeroSplices: splicePositions,
  p7Terminal13DotPosition: 208,
  p8BlackSentenceStops: stops,
  punctuationSelectedSplice: 208,
  originalPhaseNull: { phases: 242, eitherSpliceAtSentence: phaseSentence, sentenceAndOtherHyphen: phaseSentenceOtherHyphen },
  targetRunes: target.length,
  rawIoC: ioc(target),
  punctuationSpliceIoCRange: [min, max],
  statement: "The original punctuation chooses one genuine de Bruijn zero splice; the eight direct GP29 consumers with that splice recover no English-like signal.",
  results: result
}, null, 2));
