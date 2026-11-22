"use strict";
/**
 * Original LP2 p0 red-title source-convention gate.
 * Native 2013 Gematria Primus chart, pre-LP2 solved LP1 operations,
 * original p0 ink overlay, and exact solved LP2 p56 positive.
 *
 * Run: node sims/lp2_p0_red13_historical_title_sft.cjs
 * Evidence class: finite historic-operator negatives; no unknown plaintext.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { plaintextWords, decipher, run: solvedRegression } =
  require("./authentic_decryption_regression.cjs");

const root = path.resolve(__dirname, "..");
/** @param {string} filename */
function read(filename) {
  return JSON.parse(fs.readFileSync(path.join(root, filename), "utf8"));
}

/** @param {number[]} values @param {string[]} alphabet */
function roman(values, alphabet) {
  return values.map(i => alphabet[i]).join("");
}

/** @param {number[]} values */
function equalityPattern(values) {
  const assigned = new Map();
  return values.map(value => {
    if (!assigned.has(value)) assigned.set(value, assigned.size);
    return String.fromCharCode(65 + assigned.get(value));
  }).join("");
}

/** @param {number[]} cipher @param {string} method @param {number[]} key @param {boolean} skipF */
function render(cipher, method, key, skipF) {
  const skipped = skipF ? new Set([7]) : new Set();
  return decipher(cipher, method, key, skipped).plaintext;
}

function main() {
  const corpus = read("resources/liber-primus/lp2-corpus.json");
  const image = read("resources/liber-primus/lp2-p0-physical-ink-override.json");
  const ink = read("resources/liber-primus/lp2-ink-annotations.json");
  const p0 = corpus.pages.find(x => x.page === 0).indices;
  const p56 = corpus.pages.find(x => x.page === 56).indices;
  const p57 = corpus.pages.find(x => x.page === 57).indices;
  const title = p0.slice(0, 13);
  assert.equal(p0.length, 262);
  assert.equal(p56.length, 85);
  assert.equal(p57.length, 95);
  assert.deepEqual(title, [15,8,18,3,6,19,27,0,15,26,18,21,5]);
  assert.deepEqual(title, image.physical_zero_based.red_words.flatMap(w => w.gp_indices));
  assert.equal(image.physical_zero_based.large_punctuation[0].after_runes, 13);
  assert.equal(ink.pages.find(x => x.page === 0).red_spans[0].length, 13);
  assert.equal(equalityPattern(title.slice(0, 8)), "ABCDEFGH");
  assert.equal(equalityPattern(title), "ABCDEFGHAICJK");
  assert.deepEqual(plaintextWords("AN END").flat(), [24,9,18,9,23]);

  const sourcePlain = plaintextWords(
    "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO " +
    "IT IS THE DUTY OF EVERY PILGRIM TO SEEK OUT THIS PAGE"
  ).flat();
  assert.equal(sourcePlain.length, 85);
  const p56Decoded = decipher(p56, "totient", [], new Set([56])).plaintext;
  assert.deepEqual(p56Decoded, sourcePlain);
  const known = solvedRegression();
  assert.equal(known.reduce((sum, x) => sum + x.recoveredRunes, 0), 599);

  const raw = roman(title, corpus.translit);
  const operations = [
    { name: "2013 GP transliteration", values: title },
    { name: "LP1 WARNING reversed GP", values: render(title, "invert", [], false) },
    { name: "LP1 KOAN reversed GP +3", values: render(title, "invert3", [], false) },
    { name: "p56 prime-totient start2 no F bypass", values: render(title, "totient", [], false) },
    { name: "p56 prime-totient start2 literal F at7", values: render(title, "totient", [], true) },
  ];
  for (const keyword of ["DIVINITY", "FIRFUMFERENFE"]) {
    const key = plaintextWords(keyword).flat();
    for (const skipF of [false, true]) {
      operations.push({
        name: "solved LP1 Vigenere " + keyword + (skipF ? " literal F at7" : " no F bypass"),
        values: render(title, "vigenere", key, skipF)
      });
    }
  }
  const output = {
    status: "PASS: input and all 599 solved runes checked; no unknown-page plaintext",
    source: {
      page: 0,
      redRuneCount: 13,
      redWordLengths: [8, 5],
      large13DotMarkerAtOffset: 13,
      firstBlackRunes: roman(p0.slice(13, 20), corpus.translit),
      exactTitleIndices: title,
      exactTitleTransliteration: raw,
      equalityPattern: "ABCDEFGH AICJK",
      equalityImplication: "Every one-to-one static rune substitution must repeat plaintext symbols at positions 0/8 and 2/10, and nowhere else."
    },
    nativeControl: {
      p56FirstFiveCipher: roman(p56.slice(0, 5), corpus.translit),
      p56FirstFivePlain: roman(sourcePlain.slice(0, 5), corpus.translit),
      exactP56PrimeTotientRunes: 85,
      authenticSolvedRunes: 599,
      p57ClearTitle: roman(p57.slice(0, 7), corpus.translit)
    },
    historicallyAttestedFamily: operations.map(op => ({
      name: op.name,
      output: roman(op.values.slice(0, 8), corpus.translit) + " " +
        roman(op.values.slice(8), corpus.translit),
      plaintextIndices: op.values
    }))
  };
  process.stdout.write(JSON.stringify(output, null, 2) + "\n");
}
if (require.main === module) main();
module.exports = { equalityPattern, main };
