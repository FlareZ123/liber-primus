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
const sourceRunesUnwrapped = sourceRunes.replace(/\/\s*/gu, "");
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


/**
 * Secondary source-led calibration: hold fixed the exact source LP1 p5
 * moth-linked 18-word inventory and original p55 16-word length multiset,
 * then randomize only p55 complete-word order (uniform permutations).
 * The exact p55 suffix event compares 12 p5 windows to one terminal window.
 * Ten possible target windows yield a rigorous, conservative union bound.
 */
const p5Start = sourceRunesUnwrapped.indexOf("ᛋᚩᛗᛖ-ᚹᛁᛋᛞᚩᛗ");
const p5Stop = sourceRunesUnwrapped.indexOf("272-",p5Start);
assert(p5Start >= 0 && p5Stop > p5Start);
const p5Words = sourceRunesUnwrapped.slice(p5Start,p5Stop)
  .match(/[\u16a0-\u16ff]+/gu);
assert.equal(p5Words.length,18);
const p5Lengths = p5Words.map(w=>[...w].length);
assert.deepEqual(p5Lengths,[4,6,2,6,3,6,2,7,7,2,6,3,3,6,2,9,4,3]);
const p55Lengths = parsed.byStartPage[54].map(w=>w.length);
assert.deepEqual(p55Lengths,[4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
const sourceWindows = Array.from({length:p5Lengths.length-K+1},(_,i)=>
  p5Lengths.slice(i,i+K));
const occurrences=[];
for (let i=0;i<=p55Lengths.length-K;i++)
  for(let j=0;j<sourceWindows.length;j++)
    if(p55Lengths.slice(i,i+K).join(",")===sourceWindows[j].join(","))
      occurrences.push([i,j]);
assert.deepEqual(occurrences,[[9,6]]);
/** @param {number[]} window @returns {number} */
function permutationProbability(window){
  const counts=new Map();
  for(const n of p55Lengths)counts.set(n,(counts.get(n)||0)+1);
  let p=1;
  for(let i=0;i<window.length;i++){
    const count=counts.get(window[i])||0;
    p*=count/(p55Lengths.length-i);
    counts.set(window[i],count-1);
  }
  return p;
}
const terminalChance=sourceWindows.reduce((sum,w)=>
  sum+permutationProbability(w),0);
const exactFixedPhrase=permutationProbability(p55Lengths.slice(-7));
const anyPagePositionUnionBound=(p55Lengths.length-K+1)*terminalChance;
assert(Math.abs(terminalChance-0.00015956265956265956)<1e-16);
assert(Math.abs(exactFixedPhrase-0.00000555000555000555)<1e-16);
assert(anyPagePositionUnionBound<0.0016);

if (require.main === module)
  console.log(JSON.stringify({
    input: "original printed LP2 p0-55, editor-separated solved LP1 coherent paragraphs",
    originalUnknownWords: parsed.words.length,
    originalUnknownRunes: parsed.runeCount,
    coherentReferenceBlocks: blocks.length,
    coherentReferenceWords: usableWords,
    minimumMatchWords: K,
    exactMatches: results.length,
    p5MothPermutationControl: {sourceP5Words:p5Words.length,
      originalP55Words:p55Lengths.length, matchedWindowPairs:occurrences,
      terminalSevenWindowEventProbability:terminalChance,
      matchedPhraseFixedTerminalProbability:exactFixedPhrase,
      anyOfTenP55WindowsUnionBound:anyPagePositionUnionBound,
      caveat:"Conditional uniform word-order permutation; selected after original match, not an author-implied p-value"},
    maximumMatchedWords: 7,
    sourcePunctuationMatchesP55: false,
    caveat: "Source word lengths and artwork motivate a crib, but punctuation and exact cipher identification do not support literal quotation",
    positivePlantMatches: true,
    recoveredUnknownPlaintext: false,
    results
  }, null, 2));
module.exports = {results};
