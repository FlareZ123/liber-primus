"use strict";

/**
 * LP2 predecessor-exclusion 28-rank -> binary ASCII all-secret gate.
 *
 * Research question: can original nonrepeating GP29 successor ranks directly
 * encode ASCII text with an unknown *stationary* rank-to-bit mapping?
 * This test grants an unrestricted secret bit for every one of the 28 ranks,
 * independently within each original illustrated chapter, and every byte
 * phase and both bit-significance conventions. No key enumeration is needed.
 *
 * Original input is immutable. Rare zero-difference transitions are skipped,
 * not repaired; that is the explicit scope of this model.
 *
 * Run with Node 22. Only built-in Node modules; read-only.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"
));
const book = corpus.pages.filter(page => page.page <= 55)
  .flatMap(page => page.indices);
assert.equal(book.length, 12956);
assert.equal(corpus.pages.find(page => page.page === 50).indices.length, 0);
const cuts = [0, 729, 1874, 3603, 5506, 6527, 7960, 9640, 12648, 12956];
assert.equal(cuts[cuts.length - 1], book.length);

/**
 * The current rune determines a radix28 rank among the 28 successors other
 * than the preceding rune. A repeated rune has no radix28 digit.
 * @param {number[]} symbols - independent source sequence, initial rune = IV
 * @returns {{digits:number[],repeats:number}}
 */
function rank28(symbols) {
  const digits = [];
  let repeats = 0;
  for (let i = 1; i < symbols.length; i++) {
    const distance = (symbols[i] - symbols[i - 1] + 29) % 29;
    if (distance === 0) {
      repeats++;
    } else {
      digits.push(distance - 1);
    }
  }
  assert.equal(digits.length + repeats + 1, symbols.length);
  return {digits, repeats};
}

/**
 * All-secret ASCII necessary condition:
 * Every ASCII byte from 0x20..0x7e has MSB bit7 = 0, and bit6 OR bit5 = 1.
 * Every source rank occupying any MSB position must therefore map to zero.
 * Any byte whose bit6/bit5 ranks are both forced zero can never be printable
 * under any secret mapping, even if the 28 unknown labels are unrestricted.
 *
 * @param {number[]} digits
 * @param {number} phase - 0..7 initial discarded digits
 * @param {boolean} lsbFirst - original bit order within an octet
 * @returns {{forcedZeroRanks:number,unavoidableNonprintable:number,firstFailedByte:number,bytes:number}}
 */
function lowerBound(digits, phase, lsbFirst) {
  const msb = lsbFirst ? 7 : 0;
  const bit6 = lsbFirst ? 6 : 1;
  const bit5 = lsbFirst ? 5 : 2;
  const knownZero = new Set();
  for (let i = phase; i + 7 < digits.length; i += 8) {
    knownZero.add(digits[i + msb]);
  }
  let forced = 0;
  let firstFailedByte = -1;
  let bytes = 0;
  for (let i = phase; i + 7 < digits.length; i += 8) {
    if (knownZero.has(digits[i + bit6]) &&
        knownZero.has(digits[i + bit5])) {
      if (firstFailedByte === -1) firstFailedByte = bytes;
      forced++;
    }
    bytes++;
  }
  return {
    forcedZeroRanks: knownZero.size,
    unavoidableNonprintable: forced,
    firstFailedByte,
    bytes
  };
}

/**
 * @param {string} label
 * @param {number[]} sequence
 */
function evaluate(label, sequence) {
  const {digits, repeats} = rank28(sequence);
  const variants = [];
  for (let phase = 0; phase < 8; phase++) {
    for (const lsbFirst of [false, true]) {
      const bound = lowerBound(digits, phase, lsbFirst);
      variants.push({phase, lsbFirst, ...bound});
      assert.ok(bound.unavoidableNonprintable > 0,
        label + " must be impossible under this all-secret model");
    }
  }
  const minimum = Math.min(...variants.map(x => x.unavoidableNonprintable));
  const best = variants.filter(x => x.unavoidableNonprintable === minimum);
  return {
    label, runes: sequence.length, repeatedTransitions: repeats,
    rankDigits: digits.length, originalAlignmentCount: variants.length,
    allSecretPrintabilityImpossible: true, minimumUnavoidableNonprintable: minimum,
    exampleBest: best[0], variants
  };
}

const whole = evaluate("whole book", book);
assert.equal(whole.repeatedTransitions, 86);
assert.equal(whole.rankDigits, 12869);
assert.equal(whole.minimumUnavoidableNonprintable, 1607);
const chapters = [];
for (let i = 0; i < cuts.length - 1; i++) {
  chapters.push(evaluate("illustrated chapter " + (i + 1),
    book.slice(cuts[i], cuts[i + 1])));
}
assert.deepEqual(chapters.map(x => x.repeatedTransitions),
  [4, 6, 9, 10, 11, 13, 12, 18, 3]);
assert.deepEqual(chapters.map(x => x.minimumUnavoidableNonprintable),
  [68, 141, 214, 235, 112, 160, 207, 372, 15]);

// More generous scope: a completely new secret map and byte phase on
// every original physical page. Six short pages have at least one alignment
// for which the necessary condition alone cannot reject printable ASCII.
const physicalPageBounds = [];
for (const page of corpus.pages.filter(item => item.page <= 55 &&
                                            item.indices.length > 0)) {
  const digits = rank28(page.indices).digits;
  const variants = [];
  for (let phase = 0; phase < 8; phase++) {
    for (const lsbFirst of [false, true]) {
      variants.push(lowerBound(digits, phase, lsbFirst));
    }
  }
  physicalPageBounds.push({
    page: page.page,
    allSixteenAlignmentsImpossible: variants.every(
      variant => variant.unavoidableNonprintable > 0)
  });
}
assert.equal(physicalPageBounds.length, 55);
assert.equal(physicalPageBounds.filter(x => x.allSixteenAlignmentsImpossible)
  .length, 49);
assert.deepEqual(physicalPageBounds.filter(
  x => !x.allSixteenAlignmentsImpossible).map(x => x.page),
  [14, 22, 32, 49, 51, 55]);

/**
 * Real positive control: encode the known p57 English instruction directly
 * as ASCII bits using one fixed *unknown* balanced 28-rank bit partition.
 * Give the decoder only the generated GP29 stream, not its bit labels.
 *
 * @param {number[]} sourceBytes
 * @returns {{ciphertext:number[],bits:number[]}}
 */
function encodeAscii(sourceBytes) {
  const ciphertext = [7];
  const bits = [];
  let usedZeros = 0;
  let usedOnes = 0;
  for (const byte of sourceBytes) {
    assert.ok(byte >= 32 && byte <= 126);
    for (let bit = 7; bit >= 0; bit--) {
      const value = (byte >> bit) & 1;
      bits.push(value);
      const rank = value === 0 ? (usedZeros++ % 14) : (14 + usedOnes++ % 14);
      const prior = ciphertext[ciphertext.length - 1];
      ciphertext.push((prior + rank + 1) % 29);
    }
  }
  return {ciphertext, bits};
}

const originalSolvedText =
  "PARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE " +
  "WE MUST SHED OUR OWN CIRCUMFERENCES";
const plantedBytes = [...Buffer.from(originalSolvedText, "ascii")];
const planted = encodeAscii(plantedBytes);
const decoded = rank28(planted.ciphertext);
assert.equal(decoded.repeats, 0);
assert.deepEqual(decoded.digits.map(digit => Number(digit >= 14)), planted.bits);
const recoveredBytes = [];
for (let start = 0; start < decoded.digits.length; start += 8) {
  let byte = 0;
  for (let bit = 0; bit < 8; bit++) {
    byte = byte * 2 + Number(decoded.digits[start + bit] >= 14);
  }
  recoveredBytes.push(byte);
}
assert.deepEqual(recoveredBytes, plantedBytes);
assert.equal(Buffer.from(recoveredBytes).toString("ascii"), originalSolvedText);
assert.equal(lowerBound(decoded.digits, 0, false).unavoidableNonprintable, 0);

console.log(JSON.stringify({
  status: "PASS",
  originalRuneCounts: {book: whole.runes, chapters: chapters.map(x => x.runes)},
  book: {
    repeatedTransitions: whole.repeatedTransitions,
    rankDigits: whole.rankDigits,
    allSecretAlignmentVariants: whole.originalAlignmentCount,
    minimumForcedNonprintableBytes: whole.minimumUnavoidableNonprintable,
    best: whole.exampleBest
  },
  chapters: chapters.map(x => ({
    label: x.label, runes: x.runes, repeats: x.repeatedTransitions,
    rankDigits: x.rankDigits, variants: x.originalAlignmentCount,
    minimumForcedNonprintableBytes: x.minimumUnavoidableNonprintable,
    best: x.exampleBest
  })),
  physicalPageGate: {
    pagesTested: physicalPageBounds.length,
    pagesRejectedForEveryAlignment: 49,
    inconclusiveShortPages: [14, 22, 32, 49, 51, 55]
  },
  positive: {
    asciiBytesRecovered: recoveredBytes.length,
    exact: recoveredBytes.length === plantedBytes.length,
    noRepeatCipherRunes: planted.ciphertext.length,
    plaintext: originalSolvedText
  }
}, null, 2));