"use strict";

/**
 * LP2 p55 terminal 7-word source-linked crib, bounded exact-original gate.
 * Source clue: original p5 moth artwork reappears on p55. Original solved
 * p5 printed phrase has the exact p55 FINAL SEVEN word-rune lengths.
 * Test an independently frozen candidate crib, plus reversible mechanisms.
 *
 * SFT: node sims/lp2_p55_moth_p5_sevenword_crib_sft.cjs
 * Node22+, CommonJS, no third-party packages.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const reference = read("resources/liber-primus/lp1-plaintext-reference.txt");
const lp1 = read("resources/transcriptions/lp1_wulfic_canonical.txt");
const {encodeSourceNativeGP: encode} =
  require("./lp2_native_gp_source_orthography_sft.cjs");

const sections = read("resources/lp2-transcription.txt").split(/\n%\n/);
// p50 has no text and is absent from this derivative's section array.
// All runic values below are checked against original corpus p55 indices.
const printedP55 = sections[54].replace(/\/\n/g, "").replace(/\n/g, "");
const runeWordPattern = new RegExp("[" + gp.runes.join("") + "]+", "gu");
const words = printedP55.match(runeWordPattern) || [];
assert.equal(words.length, 17);
assert.equal(words[0], "ᛝ"); // incoming carry from physical p54
const plainBody = words.slice(1);
assert.equal(plainBody.length, 16);
const targetLengths = plainBody.map(w => w.length);
assert.deepEqual(targetLengths, [4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
assert.equal(targetLengths.reduce((s,n) => s+n,0), 75);
const allRuneValues = words.join("").split("").map(r => gp.runes.indexOf(r));
assert.deepEqual(allRuneValues, gp.pages[55].indices);

const lp1Phrase = "THE TOTIENT FUNCTION IS SACRED ALL THINGS";
const phraseWords = lp1Phrase.split(" ");
const phraseLengths = phraseWords.map(w => encode(w).length);
assert.deepEqual(phraseLengths, targetLengths.slice(9));
const plaintext = encode(lp1Phrase);
assert.equal(plaintext.length, 30);
const ciphertext = gp.pages[55].indices.slice(46);
assert.equal(ciphertext.length, 30);
assert.deepEqual(ciphertext, words.slice(10).join("").split("")
  .map(r => gp.runes.indexOf(r)));

const lp1p5 = reference.split("### 5\n")[1].split("272")[0];
assert(lp1p5.includes("THE TOTIENT FUNCTION IS SACRED"));
assert(lp1p5.includes("ALL THINGS SHOULD BE ENCRYPTED"));
const originalStart = lp1.indexOf("ᛋᚩᛗᛖ-ᚹᛁᛋᛞᚩᛗ");
const originalEnd = lp1.indexOf("272-", originalStart);
const originalKey = [...lp1.slice(originalStart, originalEnd)]
  .filter(r => gp.runes.includes(r)).map(r => gp.runes.indexOf(r));
assert.equal(originalKey.length, 81);
assert.deepEqual(encode(lp1p5), originalKey);
assert(originalKey.join(",").includes(plaintext.join(",")));

function matches(text, target) {
  const words = text.match(/[A-Z]+/g) || [];
  const lens = words.map(w => encode(w).length);
  const positions = [];
  for (let i = 0; i + target.length <= words.length; i++) {
    if (target.every((length, j) => lens[i+j] === length))
      positions.push({index:i,phrase:words.slice(i,i+target.length).join(" ")});
  }
  return {wordCount:words.length,positions};
}
const target = targetLengths.slice(9);
const referenceMatches = matches(reference,target);
assert(referenceMatches.positions.some(x=>x.phrase===lp1Phrase));
const controls = [
  ["Shakespeare","resources/control/shakespeare_first300k.txt"],
  ["Gibran","resources/control/gibran_prophet_58585.txt"],
  ["Emerson","resources/control/emerson_essays_2944.txt"]
].map(([name,file])=>{
  const result=matches(read(file).toUpperCase(),target);
  assert.equal(result.positions.length,0,
    name+" should not have this exact seven-word pattern");
  return {name,words:result.wordCount,exactLength7Matches:result.positions.length};
});

// A one-alphabet bijection must preserve equality and the number of
// distinct symbols. Both fail for this exact source-selected candidate.
const pset = new Set(plaintext), cset = new Set(ciphertext);
assert.equal(pset.size,16);
assert.equal(cset.size,15);
const forward = new Map();
let deterministicViolations = 0;
for (let i = 0; i < plaintext.length; i++) {
  const p = plaintext[i], c = ciphertext[i];
  if (forward.has(p) && forward.get(p) !== c) deterministicViolations++;
  else forward.set(p,c);
}
assert(deterministicViolations > 0);
const shifts = ciphertext.map((x,i)=>(x-plaintext[i]+29)%29);
let lockedKeyMatches = 0;
for (let i = 0; i < shifts.length; i++) {
  if (shifts[i] === originalKey[(46+i)%81]) lockedKeyMatches++;
}
assert.equal(lockedKeyMatches,1);
const sameShift = shifts.every(s=>s===shifts[0]);
assert.equal(sameShift,false);
console.log(JSON.stringify({
  status:"Strong source-motif seven-word length crib; PLAINTEXT UNPROVEN",
  p55BodyWords:16, sourceMothP5Phrase:lp1Phrase,
  p55FinalSevenWordRuneLengths:target,
  suffixStartOriginalP55RuneIndex:46,suffixRunes:30,
  p5ExactOriginalSourceKeyRunes:81,
  solvedLP1ReferenceMatches:referenceMatches.positions,
  sourceNativeEnglishControls:controls,
  prospectiveCribDistinctRunes:pset.size,
  originalSuffixDistinctRunes:cset.size,
  fixedMonoalphabetDeterministicViolations:deterministicViolations,
  globalSingleGPShiftFits:sameShift,
  authenticP5TextGuideKeyRuneMatchesAtLockedP55Phase:lockedKeyMatches,
  plainGpPrefix:plaintext.map(x=>gp.translit[x]).join(""),
  originalCipherGpPrefix:ciphertext.map(x=>gp.translit[x]).join(""),
  decision:"Keep as provisional source-linked crib. Same word lengths alone do not recover plaintext; simple bijective substitution and printed-p5 Vigenere fail."
},null,2));
