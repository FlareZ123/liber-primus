#!/usr/bin/env node
"use strict";

/**
 * Original LP2 p49 / p51 32x8 GP29-table lookup inversion.
 * One fixed column clock (printed position modulo 8), a fixed GP29 row,
 * and a previous-cipher or previous-plaintext state. No trained plaintext.
 * Run: node sims/lp2_p49_table32x8_gp29_state_lookup_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const grid = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-grid-256.json"), "utf8"));
const bytes = grid.pages.flatMap(page => page.bytes);
assert.equal(bytes.length, 256);
assert.equal(
  crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"
);
const page = number => corpus.pages.find(record => record.page === number).indices;
const p49 = page(49), p51 = page(51), p57 = page(57);
assert.deepEqual([p49.length, p51.length, p57.length], [66, 92, 95]);

const mod29 = value => ((value % 29) + 29) % 29;
const key = (row, column) => bytes[8 * row + column] % 29;

/**
 * Decrypt with the known table and original cipher symbols.
 * @param {number[]} ciphertext GP29 ordinal indices
 * @param {"cipher"|"plain"} stateSource Previous cipher or plain register
 * @param {1|-1} sign Signed additive forward key
 * @returns {number[]}
 */
function decrypt(ciphertext, stateSource, sign) {
  let state = 0;
  const output = [];
  for (let i = 0; i < ciphertext.length; i++) {
    const plain = mod29(ciphertext[i] - sign * key(state, i % 8));
    output.push(plain);
    state = stateSource === "cipher" ? ciphertext[i] : plain;
  }
  return output;
}

/**
 * Independent forward cipher, depending on previously emitted state.
 * @param {number[]} plaintext GP29 ordinal indices
 * @param {"cipher"|"plain"} stateSource Previous cipher or plain register
 * @param {1|-1} sign Signed additive forward key
 * @returns {number[]}
 */
function encrypt(plaintext, stateSource, sign) {
  let state = 0;
  const output = [];
  for (let i = 0; i < plaintext.length; i++) {
    const cipher = mod29(plaintext[i] + sign * key(state, i % 8));
    output.push(cipher);
    state = stateSource === "cipher" ? cipher : plaintext[i];
  }
  return output;
}

function ioc(sequence) {
  const counts = Array(29).fill(0);
  for (const value of sequence) counts[value]++;
  return counts.reduce((sum, value) => sum + value * (value - 1), 0) /
    (sequence.length * (sequence.length - 1));
}

const results = [];
for (const stateSource of ["cipher", "plain"]) {
  for (const sign of [1, -1]) {
    const plaintext49 = decrypt(p49, stateSource, sign);
    const plaintext51 = decrypt(p51, stateSource, sign);
    assert.deepEqual(encrypt(plaintext49, stateSource, sign), p49);
    assert.deepEqual(encrypt(plaintext51, stateSource, sign), p51);
    const plant = encrypt(p57, stateSource, sign);
    assert.deepEqual(decrypt(plant, stateSource, sign), p57);
    const entry = {
      stateSource, sign,
      p49Ioc: Number(ioc(plaintext49).toFixed(12)),
      p51Ioc: Number(ioc(plaintext51).toFixed(12)),
      p49Head: plaintext49.slice(0, 16).map(value => corpus.translit[value]).join(""),
      p51Head: plaintext51.slice(0, 16).map(value => corpus.translit[value]).join("")
    };
    assert(entry.p49Ioc < 0.045 && entry.p51Ioc < 0.045,
      "Unexpected native-language-frequency candidate, inspect plaintext");
    results.push(entry);
  }
}


// The actual punctuation-delimited words carry across p48->49 and p51->52.
// The 66/92 physical-page-only results above are diagnostic fragments.
const transcription = fs.readFileSync(path.join(root, "resources/liber-primus/lp2-transcription.txt"), "utf8");
const printedPages = transcription.split(/^%$/m);
assert.equal(printedPages.length, 57);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
/** @param {string} source */
function runeNumbers(source) {
  return [...source].flatMap(x => runeIndex.has(x) ? [runeIndex.get(x)] : []);
}
/** @param {number} n Physical LP2 page */
function pageText(n) {
  return printedPages[n < 50 ? n : n - 1].replace(/[\/\r\n]/g, "");
}
const p48Text = pageText(48), p49Text = pageText(49);
const p51Text = pageText(51), p52Text = pageText(52);
const before = runeNumbers(p48Text.slice(p48Text.lastIndexOf(".") + 1) + p49Text);
const after = runeNumbers(p51Text + p52Text.slice(0, p52Text.indexOf(".") + 1));
assert.equal(before.length, 138);
assert.equal(after.length, 170);
assert.deepEqual(before.slice(-66), p49);
assert.deepEqual(after.slice(0, 92), p51);

// The same original-source key rule at proper sentence starts, and across the
// numeric grid without resetting either previous-rune or eight-column clock.
/**
 * @param {number[]} input
 * @param {"cipher"|"plain"} stateSource
 * @param {1|-1} sign
 * @param {{state:number,position:number}} prior
 */
function decryptContinuous(input, stateSource, sign, prior) {
  let { state, position } = prior;
  const plaintext = [];
  for (const c of input) {
    const plain = mod29(c - sign * key(state, position % 8));
    plaintext.push(plain);
    state = stateSource === "cipher" ? c : plain;
    position++;
  }
  return { plaintext, state, position };
}
const fullSentenceTests = [];
for (const stateSource of ["cipher", "plain"]) {
  for (const sign of [1, -1]) {
    const prior = { state: 0, position: 0 };
    const decodedBefore = decryptContinuous(before, stateSource, sign, prior);
    const reset = decryptContinuous(after, stateSource, sign, prior);
    const carry = decryptContinuous(after, stateSource, sign, decodedBefore);
    const sourceCase = {
      stateSource, sign, before138Ioc: Number(ioc(decodedBefore.plaintext).toFixed(12)),
      after170ResetIoc: Number(ioc(reset.plaintext).toFixed(12)),
      after170CarryIoc: Number(ioc(carry.plaintext).toFixed(12))
    };
    assert(sourceCase.before138Ioc < 0.045 && sourceCase.after170ResetIoc < 0.045 &&
      sourceCase.after170CarryIoc < 0.045, "Unexpected sentence-scale language candidate");
    fullSentenceTests.push(sourceCase);
  }
}
assert.deepEqual(fullSentenceTests.map(row => [
  row.before138Ioc, row.after170ResetIoc, row.after170CarryIoc
]), [
  [0.033322754681, 0.034458753916, 0.032718412809],
  [0.035650058183, 0.035363731291, 0.035015663070],
  [0.037025282979, 0.035363731291, 0.033136094675],
  [0.034169046863, 0.034110685694, 0.034389140271]
]);

// A second natural reading, using the current ciphertext rune as row:
// it is not a 29-to-29 bijection in any of the eight columns and either sign.
const currentRowInjectivity = [];
for (const sign of [1, -1]) {
  const distinct = Array.from({ length: 8 }, (_, column) => new Set(
    Array.from({ length: 29 }, (_, rune) => mod29(rune - sign * key(rune, column)))
  ).size);
  assert(distinct.every(count => count < 29));
  currentRowInjectivity.push({ sign, distinctByColumn: distinct });
}

assert.deepEqual(results.map(x => [x.p49Ioc, x.p51Ioc]), [
  [0.033566433566, 0.033683707597],
  [0.035431235431, 0.032489249881],
  [0.037296037296, 0.037983755375],
  [0.028438228438, 0.030578117535]
]);
console.log(JSON.stringify({
  verdict: "bounded negative; no original unknown LP2 plaintext or cipher",
  source: "original 32x8 p49-51 table; 29 GP symbol rows; eight printed columns",
  original: { p49Ioc: ioc(p49), p51Ioc: ioc(p51) },
  exactForwardReencryption: "4 of 4 models on both original p49 and p51",
  positiveNativeSolvedP57Plants: "4 of 4 models recover all 95 original known plaintext symbols",
  testedModels: results,
  originalComplete138And170RuneSentenceTests: fullSentenceTests,
  currentCipherRowNotInjective: currentRowInjectivity
}, null, 2));
