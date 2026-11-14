"use strict";

/**
 * Original LP2 lag-five fixed-marker obstruction. No unknown plaintext found.
 *
 * Model: within each original printed word, for j>=5, C[j] == C[j-5]
 * if and only if P[j] is one reserved GP29 rune m. All other 28 plaintext
 * values may be encrypted under arbitrary secret 28-way permutations,
 * independent by word, position, key, and prior ciphertext. The first
 * five runes of each word are unconstrained as an initialization.
 *
 * An eight-rune original word has exact lag-five echoes at j=5,6,7.
 * Any such model forces that plaintext word to end m,m,m. Neither
 * independently pinned native English source contains any eight-rune
 * word with a triple-identical GP29 ending, across any choice of m.
 *
 * SFT: node sims/lp2_lag5_reserved_rune_triple_word_sft.cjs
 * Node.js 22, CommonJS, deterministic, read-only, no external packages.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseLP2Words} = require("./lp2_word_pages.cjs");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");

const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const parsed = parseLP2Words(read("resources/liber-primus/lp2-transcription.txt"));
const runeToIndex = new Map(corpus.runes.map((glyph, i) => [glyph, i]));
const words = parsed.words.map(w => [...w.runes].map(r => {
  const i = runeToIndex.get(r);
  assert.notEqual(i, undefined);
  return i;
}));
assert.equal(words.length, 2896);
assert.equal(parsed.runeCount, 12956);
assert.deepEqual(words.flat(), corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices));

/** @param {number[]} a @returns {number[]} Zero-based lag-five echo positions. */
function lag5Hits(a) {
  const result = [];
  for (let j = 5; j < a.length; j++) {
    if (a[j] === a[j - 5]) result.push(j);
  }
  return result;
}

const echoCount = words.reduce((n, w) => n + lag5Hits(w).length, 0);
const opportunityCount = words.reduce((n, w) => n + Math.max(0, w.length - 5), 0);
assert.equal(opportunityCount, 2105);
assert.equal(echoCount, 104);

const witnessIndex = 2722;
const witness = words[witnessIndex];
assert.equal(witness.length, 8);
assert.deepEqual(lag5Hits(witness), [5, 6, 7]);
assert.deepEqual(witness.slice(0, 3), witness.slice(5, 8));
assert.equal(corpus.runes[witness[0]], "ᛋ");
assert.equal(corpus.runes[witness[1]], "ᛞ");
assert.equal(corpus.runes[witness[2]], "ᛝ");

/** @param {string[]} tokens @returns {{lengthEight:number, tripleEndings:string[], byLength:Map<number,number[][]>}} */
function indexEnglish(tokens) {
  const byLength = new Map();
  let lengthEight = 0;
  const tripleEndings = [];
  for (const word of tokens) {
    if (!/^[A-Za-z]+$/.test(word)) continue;
    const runeIndices = encodeSourceNativeGP(word);
    if (!runeIndices.length) continue;
    const n = runeIndices.length;
    if (!byLength.has(n)) byLength.set(n, []);
    byLength.get(n).push(runeIndices);
    if (n === 8) {
      lengthEight++;
      if (runeIndices[5] === runeIndices[6] &&
          runeIndices[6] === runeIndices[7]) tripleEndings.push(word);
    }
  }
  return {lengthEight, tripleEndings, byLength};
}
const Shakespeare = indexEnglish(read("resources/control/shakespeare_first300k.txt")
  .match(/[A-Za-z]+/g) || []);
const TextBlob = indexEnglish(read("resources/control/english_wordfreq_textblob.txt")
  .split(/\r?\n/).map(line => line.split(" ")[0]));
assert.equal(Shakespeare.lengthEight, 2328);
assert.equal(TextBlob.lengthEight, 4331);
assert.deepEqual(Shakespeare.tripleEndings, []);
assert.deepEqual(TextBlob.tripleEndings, []);

/**
 * A complete and reversible marker/copy model with a distinct secret
 * 28-way permutation at each word/position; source observations never
 * supply these keys. This planted codec is an implementation positive.
 * @param {number[]} plain
 * @param {number} marker
 * @param {number} wordId
 * @returns {number[]}
 */
function encrypt(plain, marker, wordId) {
  const c = plain.slice(0, Math.min(5, plain.length));
  for (let j = 5; j < plain.length; j++) {
    const p = plain[j];
    const old = c[j - 5];
    if (p === marker) {
      c.push(old);
    } else {
      const rank = p - Number(p > marker);
      const secret = (7 * wordId + 3 * j + 5) % 28;
      const shifted = (rank + secret) % 28;
      c.push(shifted + Number(shifted >= old));
    }
  }
  return c;
}

/** @param {number[]} cipher @param {number} marker @param {number} wordId @returns {number[]} */
function decrypt(cipher, marker, wordId) {
  const p = cipher.slice(0, Math.min(5, cipher.length));
  for (let j = 5; j < cipher.length; j++) {
    const old = cipher[j - 5];
    if (cipher[j] === old) {
      p.push(marker);
    } else {
      const shifted = cipher[j] - Number(cipher[j] > old);
      const secret = (7 * wordId + 3 * j + 5) % 28;
      const rank = (shifted - secret + 28) % 28;
      p.push(rank + Number(rank >= marker));
    }
  }
  return p;
}

let testedPositions = 0;
const plant = words.map((w, i) => {
  const pool = Shakespeare.byLength.get(w.length) || TextBlob.byLength.get(w.length);
  assert.ok(pool && pool.length, "missing source-native word length " + w.length);
  return pool[(17 * i + 5) % pool.length];
});
for (const marker of [0, 18, 28]) {
  const c = plant.map((w, i) => encrypt(w, marker, i));
  const decoded = c.map((w, i) => decrypt(w, marker, i));
  assert.deepEqual(decoded, plant);
  for (let i = 0; i < plant.length; i++) {
    const w = plant[i];
    const cipherWord = c[i];
    for (let j = 5; j < w.length; j++) {
      assert.equal(cipherWord[j] === cipherWord[j - 5], w[j] === marker);
      testedPositions++;
    }
  }
}
const originalWitnessPlaintextSuffix = Array.from(
  {length: 29}, (_, marker) => corpus.translit[marker].repeat(3));
assert.equal(originalWitnessPlaintextSuffix.length, 29);

console.log(JSON.stringify({
  result: "all-secret fixed plaintext marker at five-back echoes incompatible with matched native English dictionary",
  authenticUnknownPlaintextRecovered: false,
  observedWords: words.length,
  originalRunes: parsed.runeCount,
  lag5Hits: echoCount,
  lag5Opportunities: opportunityCount,
  originalWitnessWordIndexZeroBased: witnessIndex,
  originalWitnessStartPage: parsed.words[witnessIndex].startPage,
  originalWitnessEndPage: parsed.words[witnessIndex].endPage,
  witnessOriginalGP: witness.map(i => corpus.translit[i]).join(" "),
  witnessEchoOffsetsZeroBased: lag5Hits(witness),
  modelImpliedWordEnding: "m m m under every one of 29 reserved runes and every secret 28-way alphabet",
  englishSourceEightRuneCount: {Shakespeare: Shakespeare.lengthEight, TextBlob: TextBlob.lengthEight},
  nativeEnglishEightRuneTripleEndings: {
    Shakespeare: Shakespeare.tripleEndings.length,
    TextBlob: TextBlob.tripleEndings.length
  },
  nativePositivePlants: 3,
  nativeExactRecoveredSymbols: plant.reduce((n, w) => n + w.length, 0),
  nativeVerifiedNonIVPositions: testedPositions
}, null, 2));
