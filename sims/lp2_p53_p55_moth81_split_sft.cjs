"use strict";

/**
 * Moth-page 81-rune source split: original LP1 p5 as a conditional
 * key for LP2 p53 red51 and p55 terminal30.
 *
 * SFT: node sims/lp2_p53_p55_moth81_split_sft.cjs
 * Original inputs only; no fitted key, clock or phase.
 * Negative result is specific to direct GP29 Vigenere and to a
 * single static alphabet plus arbitrary transposition.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const annotation = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const lp1 = read("resources/transcriptions/lp1_wulfic_canonical.txt");

const sourceStart = lp1.indexOf("ᛋᚩᛗᛖ-ᚹᛁᛋᛞᚩᛗ");
const sourceEnd = lp1.indexOf("272-", sourceStart);
assert(sourceStart >= 0 && sourceEnd > sourceStart);
const source = lp1.slice(sourceStart, sourceEnd);
const sourceCut = source.indexOf("ᚪᛚᛚ-");
assert(sourceCut > 0, "p5 sentence boundary before ALL");
const sourceIndex = runeText => [...runeText]
  .filter(glyph => gp.runes.includes(glyph))
  .map(glyph => gp.runes.indexOf(glyph));
const originalP5 = sourceIndex(source);
const sourcePrefix = sourceIndex(source.slice(0, sourceCut));
const sourceSuffix = sourceIndex(source.slice(sourceCut));
assert.equal(originalP5.length, 81);
assert.equal(sourcePrefix.length, 51);
assert.equal(sourceSuffix.length, 30);
assert.deepEqual([...sourcePrefix, ...sourceSuffix], originalP5);

const p53 = gp.pages.find(page => page.page === 53);
const p55 = gp.pages.find(page => page.page === 55);
const ink53 = annotation.pages.find(page => page.page === 53);
const span = ink53.red_spans.find(item => item.start === 128 && item.length === 51);
assert(span, "p53 original red 51 at local 128");
const p53Red = p53.indices.slice(span.start, span.start + span.length);
assert.equal(p53Red.length, 51);
const sections = read("resources/lp2-transcription.txt").split(/\n%\n/);
const printedP55 = sections[54].replace(/\/\n/g, "").replace(/\n/g, "");
const runeWords = printedP55.match(new RegExp("[" + gp.runes.join("") + "]+", "gu")) || [];
assert.equal(runeWords.length, 17);
assert.equal(runeWords[0], "ᛝ"); // carried from p54
const bodyWords = runeWords.slice(1);
assert.deepEqual(bodyWords.map(word => [...word].length),
  [4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]);
const lastSevenLengths = bodyWords.slice(-7).map(word => [...word].length);
assert.deepEqual(lastSevenLengths, [2, 7, 7, 2, 6, 3, 3]);
const p55Terminal = p55.indices.slice(46);
assert.equal(p55Terminal.length, 30);
assert.deepEqual(sourceIndex(runeWords.slice(-7).join("")), p55Terminal);
const combined = [...p53Red, ...p55Terminal];
assert.equal(combined.length, 81);

const mod29 = n => ((n % 29) + 29) % 29;
const counts = a => {
  const out = Array(29).fill(0);
  for (const value of a) out[value]++;
  return out;
};
const countP5 = counts(originalP5);
const countCombined = counts(combined);
const overlap = countP5.reduce((sum, n, i) => sum + Math.min(n, countCombined[i]), 0);
assert.equal(overlap, 50);
const distribution = a => a.slice().sort((a, b) => b - a);
assert.notDeepEqual(distribution(countP5), distribution(countCombined));
assert.equal(Math.max(...countP5), 11);
assert.equal(Math.max(...countCombined), 7);

const ioc = values => {
  const n = values.length, f = counts(values);
  return f.reduce((sum, v) => sum + v * (v - 1), 0) / (n * (n - 1));
};
/** @param {number[]} plain @param {number[]} key */
const encrypt = (plain, key) => plain.map((value, i) => mod29(value + key[i]));
/** @param {number[]} cipher @param {number[]} key */
const decrypt = (cipher, key) => cipher.map((value, i) => mod29(value - key[i]));
const minus = decrypt(combined, originalP5);
const plus = combined.map((value, i) => mod29(value + originalP5[i]));
assert(Math.abs(ioc(minus) - 0.030555555555555555) < 1e-12);
assert(Math.abs(ioc(plus) - 0.03611111111111111) < 1e-12);

// A source-authentic provisional CRIB uses the actual 81 solved LP1 p5
// glyphs as assumed plaintext. An arbitrary positional pad always fits;
// test the historically meaningful shorter-key alternatives *without*
// fitting secret phase, alphabet or field coefficients.
const inferredPad = combined.map((x, i) => mod29(x - originalP5[i]));

/** @param {number[]} sequence @param {number} period */
function incompatiblePhases(sequence, period) {
  let inconsistent = 0;
  for (let phase = 0; phase < period; phase++) {
    const values = new Set();
    for (let i = phase; i < sequence.length; i += period)
      values.add(sequence[i]);
    if (values.size > 1) inconsistent++;
  }
  return inconsistent;
}
const period5 = incompatiblePhases(inferredPad, 5);
const period25 = incompatiblePhases(inferredPad, 25);
const period29 = incompatiblePhases(inferredPad, 29);
assert.deepEqual([period5, period25, period29], [5, 25, 28]);
assert.equal(inferredPad[0], 1);
assert.equal(inferredPad[29], 21);
assert.equal(inferredPad[58], 27);

/** @param {number} value */
function reciprocal(value) {
  for (let i = 1; i < 29; i++) if (mod29(value * i) === 1) return i;
  throw Error("Cannot invert zero in F29");
}
/** @param {number[]} sequence */
function linearComplexity(sequence) {
  let C = [1], B = [1], degree = 0, shift = 1, last = 1;
  for (let pos = 0; pos < sequence.length; pos++) {
    let discrepancy = sequence[pos];
    for (let j = 1; j <= degree; j++)
      discrepancy += (C[j] || 0) * sequence[pos - j];
    discrepancy = mod29(discrepancy);
    if (!discrepancy) { shift++; continue; }
    const old = C.slice(), factor = mod29(discrepancy * reciprocal(last));
    for (let j = 0; j < B.length; j++)
      C[shift+j] = mod29((C[shift+j] || 0) - factor * B[j]);
    if (2 * degree <= pos) {
      degree = pos + 1 - degree; B = old; last = discrepancy; shift = 1;
    } else shift++;
  }
  return degree;
}
const inferredPadLinearComplexity = linearComplexity(inferredPad);
assert.equal(inferredPadLinearComplexity, 41); // generic for 81 GP digits
// A truly periodic source-native key plant must pass the same invariant.
const nativePeriod29Plant = Array.from({length: 81}, (_, i) => i % 29);
assert.equal(incompatiblePhases(nativePeriod29Plant, 29), 0);
assert(linearComplexity(nativePeriod29Plant) <= 29);

const plantedPlain = gp.pages[57].indices.slice(0, 81);
assert.equal(plantedPlain.length, 81);
const plantedCipher = encrypt(plantedPlain, originalP5);
assert.deepEqual(decrypt(plantedCipher, originalP5), plantedPlain);
assert.deepEqual(encrypt(minus, originalP5), combined);

const show = a => a.map(i => gp.translit[i]).join(" ");
console.log(JSON.stringify({
  classification: "Conditional original-artifact alignment; NO LP2 plaintext",
  originalP5SourceRunes: originalP5.length,
  originalP5SentenceBoundary: sourcePrefix.length,
  sourceSuffixLength: sourceSuffix.length,
  sourceP53Red: {offset: span.start, count: p53Red.length},
  sourceP55Suffix: {offset: 46, count: p55Terminal.length,
    finalSevenPrintedWordLengths: lastSevenLengths},
  compositeCount: combined.length,
  originalP5MaxSymbolMultiplicity: Math.max(...countP5),
  compositeMaxSymbolMultiplicity: Math.max(...countCombined),
  stationaryBijectionAndPermutationPossible: false,
  minimumSymbolChangesUnderIdentityOnlyPermutation: combined.length - overlap,
  nativePositiveControlGP81IoC: ioc(plantedPlain),
  originalVigenereSubtractIoC: ioc(minus),
  originalVigenereAddIoC: ioc(plus),
  inferredPadPeriodicPhaseContradictions: {period5, period25, period29},
  inferredPadFirstThreeAtPhase0Period29: [inferredPad[0], inferredPad[29], inferredPad[58]],
  inferredPadF29LinearComplexity: inferredPadLinearComplexity,
  sourceKeyDirectVigenereSubtract: show(minus),
  sourceKeyDirectVigenereAdd: show(plus),
  exactOriginalReencryption: true,
  exactSourceNativePlant: true
}, null, 2));
