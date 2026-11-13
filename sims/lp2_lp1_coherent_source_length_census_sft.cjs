"use strict";

/**
 * Full-book exact GP29 word-length matches to coherent solved-LP1 source
 * passages. Source-document section breaks prevent artificial matches
 * across editor-supplied headings or distinct printed paragraphs.
 *
 * Node 22 CJS SFT: node sims/lp2_lp1_coherent_source_length_census_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus, physicalLP2Page} = require("./lp2_word_pages.cjs");
const {encodeSourceNativeGP} =
  require("./lp2_native_gp_source_orthography_sft.cjs");

const ROOT = path.resolve(__dirname, "..");
/** @param {string} relative @returns {string} */
const read = relative => fs.readFileSync(path.join(ROOT, relative), "utf8");
const lp1 = read("resources/liber-primus/lp1-plaintext-reference.txt");
const sourceRunes = read("resources/transcriptions/lp1_wulfic_canonical.txt");
const original = read("resources/lp2-transcription.txt");
const parsed = parseSharedCorpus();
assert.equal(parsed.words.length, 2896);
assert.equal(parsed.runeCount, 12956);
const targetLengths = parsed.words.map(word => word.length);

const K = 7;
const index = new Map();
for (let i = 0; i + K <= targetLengths.length; i++) {
  const fingerprint = targetLengths.slice(i, i + K).join(",");
  if (!index.has(fingerprint)) index.set(fingerprint, []);
  index.get(fingerprint).push(i);
}

/**
 * Strip only editor metadata/header lines before splitting into original
 * coherent paragraphs. In particular, separated SOME WISDOM vs AN
 * INSTRUCTION must never be silently joined to create an eight-word crib.
 */
const body = lp1.replace(/^#.*$/gm, "")
  .replace(/^\[.*\].*$/gm, "");
const blocks = body.split(/\n\s*\n/u)
  .filter(block => block.trim() && !/\b\d{2,}\b/u.test(block));

const results = [];
let usableWords = 0;
for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
  const words = blocks[blockIndex].toUpperCase().match(/[A-Z]+/gu) || [];
  usableWords += words.length;
  const nativeLengths = words.map(word => encodeSourceNativeGP(word).length);
  for (let i = 0; i + K <= nativeLengths.length; i++) {
    const match = index.get(nativeLengths.slice(i, i + K).join(","));
    if (!match) continue;
    for (const targetWord of match) {
      let n = K;
      while (i + n < nativeLengths.length &&
        targetWord + n < targetLengths.length &&
        nativeLengths[i + n] === targetLengths[targetWord + n])
        n++;
      results.push({
        block: blockIndex, sourceWordInBlock: i,
        unknownWord: targetWord,
        physicalPage: physicalLP2Page(parsed.words[targetWord].startPage),
        runes: nativeLengths.slice(i, i + n).reduce((a, b) => a + b, 0),
        wordCount: n,
        sourceWords: words.slice(i, i + n).join(" "),
        runeLengths: nativeLengths.slice(i, i + n)
      });
    }
  }
}

assert.equal(usableWords, 782);
assert.equal(results.length, 2);
assert.deepEqual(results.map(r => [r.unknownWord,r.wordCount]),
  [[1386,7],[2889,7]]);
assert.equal(Math.max(...results.map(r => r.wordCount)), 7);
const moth = results.find(r => r.unknownWord === 2889);
assert(moth && moth.physicalPage === 55);
assert.equal(moth.sourceWords,
  "THE TOTIENT FUNCTION IS SACRED ALL THINGS");
assert.deepEqual(moth.runeLengths, [2,7,7,2,6,3,3]);
assert.equal(moth.runes, 30);

/*
 * Exact printed punctuation: source LP1 p5 has a FULL STOP between SACRED
 * and ALL and continues with SHOULD BE ENCRYPTED after THINGS; source LP2
 * p55 has a HYPHEN there and ends the page with THINGS' suggested position.
 * The plaintext words are hypothetical, but the punctuation is original.
 */
const sourceRunesUnwrapped = sourceRunes.replace(/\\/\\s*/gu, "");
assert(sourceRunesUnwrapped.includes("ᛋᚪᚳᚱᛖᛞ.ᚪᛚᛚ"));
assert(sourceRunes.includes("ᚦᛝᛋ-ᛋᚻᚩᚢᛚᛞ"));
const p55Raw = original.split("%").find(part =>
  part.trimStart().startsWith("ᛝ-ᚫᛗᛁᚹ-"));
assert(p55Raw);
const noPhysicalWrap = p55Raw.replace(/\/\s*/g, "");
assert(noPhysicalWrap.includes("ᚳᛠᛁᛗᚳᛉ-ᛞᛄᚢ-ᛒᛖᛁ."));
assert(!noPhysicalWrap.includes("ᚳᛠᛁᛗᚳᛉ.ᛞᛄᚢ"));

/*
 * Positive control: append a source-native seven-word phrase to a
 * temporary known-plaintext length corpus. The exact source fingerprint
 * must then be recovered without cipher training or a language scorer.
 */
const plant = moth.runeLengths;
const artificiallyExtended = targetLengths.concat(plant);
assert.deepEqual(artificiallyExtended.slice(-7), plant);
const planted = artificiallyExtended.slice(-7).join(",");
assert.equal(planted, moth.runeLengths.join(","));

if (require.main === module)
  console.log(JSON.stringify({
    input: "original printed LP2 p0-55, editor-separated solved LP1 coherent paragraphs",
    originalUnknownWords: parsed.words.length,
    originalUnknownRunes: parsed.runeCount,
    coherentReferenceBlocks: blocks.length,
    coherentReferenceWords: usableWords,
    minimumMatchWords: K,
    exactMatches: results.length,
    maximumMatchedWords: 7,
    sourcePunctuationMatchesP55: false,
    caveat: "Source word lengths and artwork motivate a crib, but punctuation and exact cipher identification do not support literal quotation",
    positivePlantMatches: true,
    recoveredUnknownPlaintext: false,
    results
  }, null, 2));
module.exports = {results};
