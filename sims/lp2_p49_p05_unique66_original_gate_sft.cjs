"use strict";
/**
 * Original LP1 p05 mixed-square word-cell key against LP2 p49's 66-rune
 * pre-table page and the intact 138-rune p48-p49 sentence.
 *
 * The 13 printed word cells contain 76 source GP runes. Removing only
 * repeated occurrences (UOID=4, AETHEREAL=6) produces exactly 11
 * first-occurrence-distinct word cells with 66 runes. Original p49 has 66
 * runes and ends in a red 10-dot stop. This is a source-led candidate,
 * not evidence that the author intended the reduction.
 *
 * Reproducer: node sims/lp2_p49_p05_unique66_original_gate_sft.cjs
 * Node 22 CommonJS; deterministic, read-only, no dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
/** @param {string} rel @returns {string} */
const read = rel => fs.readFileSync(path.join(ROOT, rel), "utf8");
const book = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const lp1 = read("resources/transcriptions/lp1_wulfic_canonical.txt");
const runeIndex = new Map(book.runes.map((rune, i) => [rune, i]));
const anchor = "272-138-";
assert.equal(lp1.indexOf(anchor), lp1.lastIndexOf(anchor));
assert(lp1.indexOf(anchor) >= 0);
const sourceRows = lp1.slice(lp1.indexOf(anchor)).split(/\r?\n/).slice(0, 5)
  .map(line => line.replace(/\/$/, "").split("-"));
assert.deepEqual(sourceRows.map(row => row.length), [5, 5, 5, 5, 5]);
const printed = sourceRows.flat().filter(token => !/^\d+$/.test(token));
const wordNames = printed.map(token => [...token]
  .map(ch => book.translit[runeIndex.get(ch)]).join(""));
assert.deepEqual(wordNames, [
  "SHADOWS", "AETHEREAL", "BUFFERS", "UOID", "CARNAL",
  "OBSCURA", "FORM", "MOBIUS", "ANALOG", "UOID",
  "MOURNFUL", "AETHEREAL", "CABAL"
]);
assert.equal(printed.length, 13);
const repeated = printed.filter((word, i) => printed.indexOf(word) !== i);
assert.deepEqual(repeated.map(word => word.length), [4, 6]);
const distinct = [...new Set(printed)];
assert.equal(distinct.length, 11);
/** @param {string[]} words @returns {number[]} */
function runeTape(words) {
  return words.flatMap(word => [...word].map(ch => {
    assert(runeIndex.has(ch));
    return runeIndex.get(ch);
  }));
}
const full76 = runeTape(printed);
const unique66 = runeTape(distinct);
assert.equal(full76.length, 76);
assert.equal(unique66.length, 66);
assert.equal(full76.length - unique66.length, 10);
const page49 = book.pages[49].indices;
const page55 = book.pages[55].indices;
const page57 = book.pages[57].indices;
const sentenceBefore = book.pages[48].indices.slice(-72).concat(page49);
const sentenceAfter = book.pages[51].indices.concat(book.pages[52].indices.slice(0, 78));
assert.deepEqual([page49.length, sentenceBefore.length, sentenceAfter.length, page55.length],
  [66, 138, 170, 76]);
assert.equal(sentenceBefore.length + sentenceAfter.length, 308);
const p49CipherF = page49.flatMap((v, i) => v === 0 ? [i] : []);
assert.deepEqual(p49CipherF, [3, 33]);

/** @param {number} x @returns {number} */
const mod29 = x => ((x % 29) + 29) % 29;
/** @param {number[]} symbols @returns {number} */
function ioc(symbols) {
  const counts = Array(29).fill(0);
  for (const s of symbols) {
    assert(Number.isInteger(s) && s >= 0 && s < 29);
    counts[s]++;
  }
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (symbols.length * (symbols.length - 1));
}
/** @param {number[]} symbols @returns {string} */
const translit = symbols => symbols.map(i => book.translit[i]).join("");
/** @param {number[]} plain @param {number[]} key @param {number} sign */
function additive(plain, key, sign) {
  return plain.map((value, i) => mod29(value + sign * key[i % key.length]));
}
const direct = [];
for (const [representation, key] of [
  ["GP ordinal", unique66],
  ["GP prime", unique66.map(i => book.prime[i] % 29)],
  ["GP prime totient", unique66.map(i => (book.prime[i] - 1) % 29)]
]) for (const sign of [-1, 1]) {
  const decoded = additive(page49, key, sign);
  assert.deepEqual(additive(decoded, key, -sign), page49);
  const originalP57 = page57.slice(0, 66);
  assert.deepEqual(additive(additive(originalP57, key, -sign), key, sign),
    originalP57);
  direct.push({
    representation, sign, originalIoC: ioc(decoded),
    decryptedTransliteration: translit(decoded)
  });
}
assert.equal(direct.length, 6);
assert.equal(direct.find(r => r.representation === "GP ordinal" && r.sign === -1)
  .originalIoC, 0.05081585081585081);

/** A strict p56-style emitter: plaintext F is literal and costs no key rune.
 * Any original non-F ciphertext decoding to F invalidates this model.
 * The original two cipher-F sites may be literal or keyed zeros.
 * @param {number[]} sourceKey
 * @param {number} mask
 * @returns {{output:number[], illegal:number[], consumed:number}}
 */
function strictFInverse(sourceKey, mask) {
  let consumed = 0;
  const output = [], illegal = [];
  for (let i = 0; i < page49.length; i++) {
    const eventIndex = p49CipherF.indexOf(i);
    if (eventIndex >= 0 && ((mask >>> eventIndex) & 1)) {
      output.push(0);
      continue;
    }
    const value = mod29(page49[i] - (book.prime[sourceKey[consumed++]] - 1));
    if (value === 0 && page49[i] !== 0) illegal.push(i);
    output.push(value);
  }
  return {output, illegal, consumed};
}
/** Genuine solved p57 source positive for the exact historical strict emitter. */
function strictPlant(original, sourceKey) {
  const out = [];
  let clock = 0;
  for (const p of original) {
    if (p === 0) out.push(0);
    else out.push(mod29(p + book.prime[sourceKey[clock++]] - 1));
  }
  const recovered = [];
  clock = 0;
  for (let i = 0; i < original.length; i++) {
    if (original[i] === 0) recovered.push(0);
    else recovered.push(mod29(out[i] - (book.prime[sourceKey[clock++]] - 1)));
  }
  assert.deepEqual(recovered, original);
  return {literalF: original.filter(v => v === 0).length, ciphertext: out};
}
const fModes = [];
for (const [order, key] of [
  ["printed", unique66], ["reversed", unique66.slice().reverse()]
]) {
  strictPlant(page57.slice(0, 66), key);
  for (let mask = 0; mask < 4; mask++) {
    const decoded = strictFInverse(key, mask);
    assert.equal(decoded.output.length, 66);
    fModes.push({
      order, ciphertextFMask: mask, consumed: decoded.consumed,
      forbiddenNonFToPlainF: decoded.illegal,
      compatibleWithStrictF: decoded.illegal.length === 0,
      originalIoC: ioc(decoded.output),
      decryptedTransliteration: translit(decoded.output)
    });
  }
}
assert.deepEqual(fModes.filter(r => r.compatibleWithStrictF)
  .map(r => [r.order, r.ciphertextFMask]), [["printed", 2]]);
assert.equal(fModes.length, 8);

/** Whole-sentence source-key transport, distinct from page-local 66 key. */
const longSentence = [];
for (const [sourceName, key] of [
  ["13 printed words / 76", full76],
  ["11 unique words / 66", unique66]
]) for (const [name, keyValue] of [
  ["GP ordinal", key],
  ["GP prime totient", key.map(i => (book.prime[i] - 1) % 29)]
]) for (const sign of [-1, 1]) {
  const pre = additive(sentenceBefore, keyValue, sign);
  const post = additive(sentenceAfter, keyValue, sign);
  const combined = additive(sentenceBefore.concat(sentenceAfter), keyValue, sign);
  assert.deepEqual(additive(combined, keyValue, -sign),
    sentenceBefore.concat(sentenceAfter));
  longSentence.push({
    sourceName, representation: name, sign,
    intactPre138IoC: ioc(pre), intactPost170IoC: ioc(post),
    continuous308IoC: ioc(combined),
    prePrefix: translit(pre.slice(0, 42)),
    postPrefix: translit(post.slice(0, 42))
  });
}
assert.equal(longSentence.length, 8);
assert(longSentence.every(v => v.continuous308IoC < 0.05));
console.log(JSON.stringify({
  classification: "Original-source key candidate; bounded negative direct inverses; no plaintext",
  exactInput: {
    lp1P05PrintedWordRuneCount: full76.length,
    lp1P05UniqueWordRuneCount: unique66.length,
    repeatedRuneCount: 10, uniqueWords: distinct.length,
    printedWordCells: printed.length, repeatedWords: ["UOID", "AETHEREAL"],
    physicalP49Runes: page49.length, intactPreTableRunes: sentenceBefore.length,
    intactPostTableRunes: sentenceAfter.length,
    physicalP55Runes: page55.length, p49CipherF
  },
  direct, strictP56TotientEmitter: fModes, intactSentenceInversions: longSentence,
  interpretation: "The exact 76/66/10 numerical fit is real but does not select a cipher. Direct ordinal and source-authentic totient transfer do not recover readable text. One p49 strict-F variant remains algebraically possible yet has no identified plaintext."
}, null, 2));
