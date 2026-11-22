"use strict";

/**
 * Exact GP-native whole-word length crib gate on source-original LP2.
 * Compares the 2,896 canonical printed LP2 words with four frozen literary
 * source corpora and the solved Cicada LP1 reference.
 *
 * Fully deterministic SFT: node sims/lp2_wordlength_literary_crib_sft.cjs
 * Historical source attribution requires a longer, independently selected
 * quotation and a withheld original-cipher prediction. This script makes
 * no decryption or authentic-key claim.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");

/** @param {string} filename */
function read(filename) {
  return fs.readFileSync(path.join(ROOT, filename), "utf8");
}

const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const RUNE = new Set(gp.runes);
const SOURCE = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55).join("%");

/** @returns {{length:number,page:number}[]} */
function originalWords() {
  const out = [];
  let pending = 0;
  let page = 0;
  let lastRunePage = 0;
  function finish() {
    if (pending) out.push({length: pending, page: lastRunePage});
    pending = 0;
  }
  for (const ch of SOURCE) {
    if (RUNE.has(ch)) {
      pending++;
      lastRunePage = page;
    } else if (ch === "%") {
      page++;
    } else if (ch !== "/" && !/\s/u.test(ch)) {
      finish();
    }
  }
  finish();
  assert.equal(out.length, 2896);
  assert.equal(out.reduce((n, word) => n + word.length, 0), 12956);
  return out;
}

const TOKENS = gp.translit.slice().sort((a, b) => b.length - a.length);

/**
 * Native GP transliteration, as in the repository's solved-English controls.
 * @param {string} text
 * @param {boolean} foldIng
 */
function normalizedWordLengths(text, foldIng) {
  return (text.toUpperCase().match(/[A-Z]+/g) || []).map(raw => {
    let word = raw.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/[KQ]/g, "C").replace(/Z/g, "S");
    if (foldIng) word = word.replace(/ING/g, "NG");
    let count = 0;
    for (let i = 0; i < word.length;) {
      const token = TOKENS.find(t => word.startsWith(t, i));
      assert(token, "unrecognized GP spelling: " + word);
      i += token.length;
      count++;
    }
    return count;
  });
}

/**
 * Find the maximum exact run of equal word lengths with rolling k-gram maps.
 * @param {number[]} original
 * @param {number[]} source
 * @param {number} [minLength=4]
 */
function longestRun(original, source, minLength = 4) {
  for (let k = 16; k >= minLength; k--) {
    const table = new Map();
    for (let i = 0; i + k <= original.length; i++) {
      const key = original.slice(i, i + k).join(",");
      const sites = table.get(key) || [];
      sites.push(i);
      table.set(key, sites);
    }
    let count = 0;
    const sites = [];
    for (let j = 0; j + k <= source.length; j++) {
      const v = table.get(source.slice(j, j + k).join(","));
      if (!v) continue;
      for (const i of v) {
        count++;
        if (sites.length < 8) sites.push({manuscriptWord: i, referenceWord: j});
      }
    }
    if (count) return {longestWords: k, matchCount: count, sites};
  }
  return {longestWords: 0, matchCount: 0, sites: []};
}

const original = originalWords();
const lengths = original.map(x => x.length);
const sources = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt", 55407],
  ["Gibran", "resources/control/gibran_prophet_58585.txt", 15733],
  ["Emerson", "resources/control/emerson_essays_2944.txt", 77932],
  ["LP1 editor-normalized", "resources/liber-primus/lp1-plaintext-reference.txt", 904]
];

const actual = [];
for (const [name, file, wordCount] of sources) {
  const raw = read(file);
  for (const foldIng of [true, false]) {
    const source = normalizedWordLengths(raw, foldIng);
    assert.equal(source.length, wordCount, "reference word count drift: " + file);
    const result = longestRun(lengths, source);
    assert.equal(result.longestWords,
      name === "LP1 editor-normalized" ? 7 : 9,
      "unexpectedly long candidate source crib: " + name);
    actual.push({name, foldIng, sourceWords: source.length, ...result,
      sites: result.sites.map(x => ({
        ...x, physicalLP2Page: original[x.manuscriptWord].page >= 50 ?
          original[x.manuscriptWord].page + 1 :
          original[x.manuscriptWord].page
      }))});
  }
}

// Beowulf original-source control: corrected case-safe thorn/eth/AE normalization.
// The 10,885 word lengths are from the pinned Old English Harrison/Sharp
// edition, independently of any unknown ciphertext plaintext hypothesis.
const oldEnglish = JSON.parse(
  read("resources/control/beowulf_oe_gp_profile_corrected.json"));
assert.equal(oldEnglish.acceptedSourceWords, 10885);
assert.equal(oldEnglish.allSourceGpRunes, 48012);
const oldLengths = oldEnglish.allSourceGpWordLengths;
assert.equal(oldLengths.length, 10885);
assert.equal(oldLengths.reduce((sum, len) => sum + len, 0), 48012);
const oldResult = longestRun(lengths, oldLengths);
assert.equal(oldResult.longestWords, 8);
actual.push({name: "Beowulf Old English", sourceWords: oldLengths.length,
  ...oldResult});

// A planted, genuine Old English 16-word excerpt is recoverable under the
// identical fixed manuscript/source word-length matcher.
const oldPlant = lengths.slice();
oldPlant.splice(1450, 16, ...oldLengths.slice(2300, 2316));
const oldPositive = longestRun(oldPlant, oldLengths);
assert.equal(oldPositive.longestWords, 16);
assert(oldPositive.sites.some(x =>
  x.manuscriptWord === 1450 && x.referenceWord === 2300),
  "planted original Beowulf 16-word length crib missing");

const latin = read("resources/control/latin-vulgate-gp-wholewords.txt")
  .split(/\r?\n/u).filter(x => /^[0-9A-S]+$/u.test(x))
  .map(x => x.length);
assert.equal(latin.length, 39835);
const latinResult = longestRun(lengths, latin);
assert.equal(latinResult.longestWords, 9);
actual.push({name: "Vulgate New Testament", sourceWords: latin.length,
  ...latinResult});

// Planted positive: an authentic source's 16 consecutive word lengths
// inserted at one original position must be recovered as a 16-word crib.
const planted = lengths.slice();
const target = normalizedWordLengths(
  read("resources/control/gibran_prophet_58585.txt"), true);
planted.splice(1234, 16, ...target.slice(4500, 4516));
const positive = longestRun(planted, target);
assert.equal(positive.longestWords, 16);
assert(positive.sites.some(x =>
  x.manuscriptWord === 1234 && x.referenceWord === 4500),
  "planted text was not recovered at its true position");

console.log(JSON.stringify({
  original: {words: original.length, runes: 12956},
  sources: actual,
  planted: {runLength: 16, sourceWord: 4500, originalWord: 1234,
    recovered: true},
  decision: "No unaltered ten-word source passage in this finite corpus. " +
    "Matches of up to nine lengths do not identify plaintext or keys."
}, null, 2));
