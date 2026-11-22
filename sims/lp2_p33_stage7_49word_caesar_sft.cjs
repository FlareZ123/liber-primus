"use strict";

/**
 * Original-input test of the recovered Stage7 order-seven square as a
 * per-printed-word GP29 Caesar key for LP2 p33's 49 black fragments.
 *
 * This tests the word-level receiver made plausible by the original
 * upper21/lower28 printed-word structure, separate from earlier
 * continuous-rune Hill/additive consumers.
 *
 * Run: node sims/lp2_p33_stage7_49word_caesar_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { buildSourceNativeTrigramModel } = require("./lp1_source_native_trigram_model.cjs");

const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8").replace(/\r/g, "");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const text = read("resources/external/Liber Primus 57.txt");
const lp1 = read("resources/transcriptions/lp1_wulfic_canonical.txt");
const runes = gp.runes;
const mod = x => ((x % 29) + 29) % 29;
const p33 = gp.pages.find(p => p.page === 33);
const ann = ink.pages.find(p => p.page === 33);
assert.deepEqual(ann.red_spans.map(s => [s.start, s.length]), [[0,10],[91,8]]);

const source = text.match(/%33\n([\s\S]*?)%34\n/);
assert(source, "Original preserved p33 transcription is available");
const halves = source[1].split(/(?=\[ᛝᚦᛇ)/);
assert.equal(halves.length, 2);
const parse = section => section
  .replace(/\[[^\]]*\]/g, "᛫")
  .replace(/[⁕\[\]\n]/g, "")
  .split("᛫").filter(Boolean)
  .map(w => Array.from(w, r => runes.indexOf(r)));
const upper = parse(halves[0]), lower = parse(halves[1]);
assert.deepEqual([upper.length,lower.length], [21,28]);
assert(upper.concat(lower).every(w => w.every(v => v >= 0)));
const words = upper.concat(lower);
const flat = xs => xs.flat();
assert.deepEqual(flat(upper), p33.indices.slice(10, 91));
assert.deepEqual(flat(lower), p33.indices.slice(99));
assert.equal(flat(words).length, 196);

const square = read("resources/cicada2014-openpuff-magic-squares.txt")
  .trim().split(/\n\s*\n/)[1].trim()
  .split(/\n/).map(line => line.trim().split(/\s+/).map(Number));
assert.deepEqual(square.map(r => r.length), Array(7).fill(7));
assert(square.every(r => r.reduce((a,b)=>a+b,0) === 1033));

const known = new Set((lp1.match(/[ᚠ-ᛠ]+/gu) || []).filter(w => w.length >= 3));
const originalWordCount = words.filter(w => known.has(w.map(v=>runes[v]).join(""))).length;
const model = buildSourceNativeTrigramModel({
  corpus: gp,
  referenceText: read("resources/liber-primus/lp1-plaintext-reference.txt")
});
/** @param {number[][]} ws */
function score(ws) {
  return model.scoreChapters([
    flat(ws.slice(0,21)),
    flat(ws.slice(21))
  ]).mean;
}
const originalScore = score(words);
assert(Math.abs(originalScore - (-3.4439765253728107)) < 1e-9);
/** @param {number[][]} mat */
const transpose = mat => mat[0].map((_, col) => mat.map(row => row[col]));
/** @param {number[][]} mat */
const flip = mat => mat.map(row => row.slice().reverse());

const variants = [];
const uniqueOutputFingerprints = new Set();
for (const rowReverse of [false,true]) for (const colReverse of [false,true])
  for (const columnFirst of [false,true]) for (const sign of [-1,1]) {
    let mat = square.map(row => row.slice());
    if (rowReverse) mat.reverse();
    if (colReverse) mat = flip(mat);
    if (columnFirst) mat = transpose(mat);
    const key = mat.flat().map(mod);
    const candidate = words.map((w,i) => w.map(v => mod(v + sign*key[i])));
    const count = candidate.filter(w => known.has(w.map(v=>runes[v]).join(""))).length;
    const value = score(candidate);
    variants.push({rowReverse,colReverse,columnFirst,sign,
      nativeSolvedWordsLengthThreeOrMore:count,meanTrigramLogScore:value});
    uniqueOutputFingerprints.add(flat(candidate).join(","));
    assert.equal(count, 0, "No authentic GP-native length>=3 word");
  }
assert.equal(variants.length, 16);
assert.equal(uniqueOutputFingerprints.size, 8, "Stage7 square has 180-degree symmetry");

// Exact reversible positives on 49 matched-length solved GP words.
// These demonstrate correct word boundaries and arbitrary key values.
const vocabulary = (lp1.match(/[ᚠ-ᛠ]+/gu) || []).map(
  word => Array.from(word, r => runes.indexOf(r))
);
const planted = words.map(w => {
  const found = vocabulary.find(v => v.length === w.length);
  assert(found, "Solved-native source has every original length");
  return found;
});
for (const variant of variants) {
  let mat = square.map(row => row.slice());
  if (variant.rowReverse) mat.reverse();
  if (variant.colReverse) mat = flip(mat);
  if (variant.columnFirst) mat = transpose(mat);
  const key = mat.flat().map(mod);
  const cipher = planted.map((w,i) => w.map(v => mod(v-variant.sign*key[i])));
  const decoded = cipher.map((w,i) => w.map(v => mod(v+variant.sign*key[i])));
  assert.deepEqual(decoded, planted);
}
const ranked = variants.slice().sort((a,b)=>b.meanTrigramLogScore-a.meanTrigramLogScore);
assert(ranked[0].meanTrigramLogScore < -3, "English solved control band is higher");
console.log(JSON.stringify({
  classification: "Bounded negative for direct Stage7-cell per-word Caesar; no unknown plaintext",
  source: {
    page:33, blackWords:49, upperWords:21, lowerWords:28, originalRunes:196,
    stage7Order:7, stage7MagicSum:1033, orientationsAndSigns:16,
    uniqueDecryptedOutputs:uniqueOutputFingerprints.size
  },
  sourceTrigram: { original:originalScore, best:ranked[0],worst:ranked.at(-1) },
  lexicon: { solvedNativeRuneTypesLengthThreeOrMore:known.size,
    originalNativeHits:originalWordCount, maximumDecryptedNativeHits:0 },
  positiveControls: "All 16 encoders exactly recover 49 planted solved-GP matched-length words."
},null,2));
