"use strict";

/**
 * All-secret 29-entry plaintext-feedback key: dictionary-consensus gate.
 *
 * If C_j = P_j + K_j mod29 and K_(j+1)=K_j+f(P_j) mod29, then
 * f(P_(j-1)) = (C_j-C_(j-1))-(P_j-P_(j-1)) mod29.
 * An arbitrary word-initial K cancels. Every candidate native-GP
 * plaintext word therefore specifies a partial 29-entry feedback table.
 * Multiple correctly decoded words must demand the SAME function f.
 *
 * No unknown f entries, seeds, cipher parameters or plaintext guesses
 * are fitted. We enumerate English word types from three source corpora,
 * compare partial maps on long original words, and calibrate exact power
 * on genuinely solved LP1 and a native English plant of original lengths.
 *
 * Scope: a single f throughout the corpus, 1:1 preserved word boundaries,
 * and English-like plaintext covered by the explicitly named lexicon.
 * This is a conditional source-informed architecture test, not an
 * authentication that Cicada used this particular feedback cipher.
 *
 * Node.js 22, run: node sims/lp2_unknown_plain_feedback_dictionary_consensus_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

const ROOT = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(ROOT, name), "utf8");
const GP = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const rune = new Map(GP.runes.map((r, i) => [r, i]));
const tokens = GP.translit.map((text, value) => ({text, value}))
  .sort((a, b) => b.text.length - a.text.length);
const mod = x => (x % 29 + 29) % 29;

/** @param {string} text */
function nativeWords(text) {
  const result = [];
  for (const original of text.toUpperCase().match(/[A-Z]+/g) || []) {
    const word = original.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/[KQ]/g, "C").replace(/Z/g, "S");
    const symbols = [];
    for (let i = 0; i < word.length;) {
      const z = tokens.find(token => word.startsWith(token.text, i));
      assert(z, "unmapped source word " + word.slice(i));
      symbols.push(z.value);
      i += z.text.length;
    }
    result.push({symbols, original});
  }
  return result;
}

const canonical = parseSharedCorpus();
assert.equal(canonical.runeCount, 12956);
assert.equal(canonical.words.length, 2896);
assert.equal(canonical.crossPageWords, 32);
const original = canonical.words.map(word => [...word.runes].map(r => {
  const n = rune.get(r);
  assert.notEqual(n, undefined);
  return n;
}));
assert.deepEqual(original.flat(), GP.pages.filter(p =>
  p.page < 56).flatMap(p => p.indices));

const sources = [
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/control/gibran_prophet_58585.txt"
];
const dictionary = new Map();
for (const source of sources)
  for (const word of nativeWords(read(source))) {
    const key = word.symbols.join(",");
    if (!dictionary.has(key)) dictionary.set(key, word);
  }
assert.equal(dictionary.size, 12231);
const byLength = new Map();
for (const word of dictionary.values()) {
  const n = word.symbols.length;
  if (!byLength.has(n)) byLength.set(n, []);
  byLength.get(n).push(word);
}

/** Partial unknown f, or null if candidate demands conflicting f at one letter.
 * @param {number[]} ciphertext
 * @param {number[]} plain
 */
function impliedMap(ciphertext, plain) {
  const values = new Int8Array(29).fill(-1), fields = [];
  for (let j = 1; j < ciphertext.length; j++) {
    const p = plain[j - 1];
    const value = mod(ciphertext[j] - ciphertext[j - 1] -
      plain[j] + p);
    if (values[p] >= 0 && values[p] !== value) return null;
    if (values[p] < 0) {
      values[p] = value;
      fields.push(p);
    }
  }
  return {values, fields};
}

/** @param {number[]} cipher */
function candidateMaps(cipher) {
  const mappings = [];
  for (const candidate of byLength.get(cipher.length) || []) {
    const mapping = impliedMap(cipher, candidate.symbols);
    if (mapping) mappings.push({...mapping, word: candidate.original});
  }
  return mappings;
}

/** @param {number[][]} ciphertextWords */
function longGroup(ciphertextWords) {
  return ciphertextWords.map((cipher, index) => ({cipher, index}))
    .filter(row => row.cipher.length >= 10)
    .map(row => ({...row, maps: candidateMaps(row.cipher)}));
}

/** @param {{values:Int8Array,fields:number[]}} a
 * @param {{values:Int8Array,fields:number[]}} b
 * @returns {number} Number of equal assigned entries shared or -1 if conflict.
 */
function compatibleOverlap(a, b) {
  let overlap = 0;
  for (const p of a.fields) {
    if (b.values[p] >= 0) {
      if (a.values[p] !== b.values[p]) return -1;
      overlap++;
    }
  }
  return overlap;
}

/** @param {ReturnType<longGroup>} group */
function strongestAnchor(group) {
  const anchors = group.filter(row => row.cipher.length >= 12);
  let candidateCount = 0;
  const best = {any: -1, threeShared: -1, anyExample: null,
    threeSharedExample: null};
  for (const anchor of anchors) {
    for (const mapping of anchor.maps) {
      candidateCount++;
      let any = 0, threeShared = 0;
      for (const target of group) {
        if (target.index === anchor.index) continue;
        let maxOverlap = -1;
        for (const other of target.maps)
          maxOverlap = Math.max(maxOverlap,
            compatibleOverlap(mapping, other));
        if (maxOverlap >= 0) any++;
        if (maxOverlap >= 3) threeShared++;
      }
      if (any > best.any) {
        best.any = any;
        best.anyExample = {index: anchor.index, word: mapping.word,
          fields: mapping.fields.length};
      }
      if (threeShared > best.threeShared) {
        best.threeShared = threeShared;
        best.threeSharedExample = {index: anchor.index,
          word: mapping.word, fields: mapping.fields.length};
      }
    }
  }
  return {targets: group.length, anchors: anchors.length,
    candidateAnchorMaps: candidateCount, ...best};
}

/** Source-native plant: one fixed function, independent word seeds.
 * @param {number[]} plaintext @param {number} seed
 */
function plantWord(plaintext, seed) {
  let key = seed;
  return plaintext.map(p => {
    const c = mod(p + key);
    key = mod(key + GP.prime[p] + 1);
    return c;
  });
}

/** @param {number[]} cipher @param {number} seed */
function recoverPlant(cipher, seed) {
  let key = seed;
  return cipher.map(c => {
    const p = mod(c - key);
    key = mod(key + GP.prime[p] + 1);
    return p;
  });
}

const originalGroup = longGroup(original);
const originalResult = strongestAnchor(originalGroup);
assert.equal(originalResult.targets, 109);
assert.equal(originalResult.anchors, 25);
assert.equal(originalResult.candidateAnchorMaps, 109);
assert.equal(originalResult.any, 1);
assert.equal(originalResult.threeShared, 0);

// Fully planted native-GP English, exactly the original >=10 length profile,
// to confirm that the same constraint solver could recover a shared f.
const sourceLong = original.map((x, index) => ({n: x.length, index}))
  .filter(x => x.n >= 10);
const sourcePlant = sourceLong.map((row, i) => {
  const dictionaryOptions = byLength.get(row.n);
  assert(dictionaryOptions && dictionaryOptions.length);
  const plain = dictionaryOptions[(11 + 17 * i) %
    dictionaryOptions.length].symbols;
  const seed = mod(24 + 7 * i);
  const cipher = plantWord(plain, seed);
  assert.deepEqual(recoverPlant(cipher, seed), plain);
  return cipher;
});
const sourcePlantResult = strongestAnchor(longGroup(sourcePlant));
assert.equal(sourcePlantResult.targets, 109);
assert.equal(sourcePlantResult.anchors, 25);
assert.equal(sourcePlantResult.any, 108);
assert.equal(sourcePlantResult.threeShared, 107);

// Independent genuine solved-LP1 English: remove editorial headings,
// retain genuine words, and encrypt with the very same planted f.
const lp1Plain = read("resources/liber-primus/lp1-plaintext-reference.txt")
  .split(/\r?\n/u).filter(line => {
    const s = line.trim();
    return s && !s.startsWith("#") && !s.startsWith("[") &&
      !/^[0-9a-f]{25,}$/iu.test(s) && !/^\d+[\s\d]+$/.test(s);
  }).join(" ");
const nativeLP1 = nativeWords(lp1Plain);
assert.equal(nativeLP1.length, 796);
const lp1Long = nativeLP1.filter(row => row.symbols.length >= 10);
const lp1DictionaryLong = lp1Long.filter(row =>
  dictionary.has(row.symbols.join(","))).length;
assert.equal(lp1Long.length, 20);
assert.equal(lp1DictionaryLong, 14);
const lp1Plant = lp1Long.map((word, i) => {
  const seed = mod(24 + 17 * i);
  const cipher = plantWord(word.symbols, seed);
  assert.deepEqual(recoverPlant(cipher, seed), word.symbols);
  return cipher;
});
const lp1PlantResult = strongestAnchor(longGroup(lp1Plant));
assert.equal(lp1PlantResult.targets, 20);
assert.equal(lp1PlantResult.anchors, 8);
assert.equal(lp1PlantResult.any, 14);
assert.equal(lp1PlantResult.threeShared, 14);

console.log(JSON.stringify({
  classification: "conditional all-secret original negative; no LP2 plaintext/key",
  hypothesis: "C=P+K mod29; K_next=K+f(P) mod29, f arbitrary 29-entry table",
  lexiconTypes: dictionary.size,
  allSourceRunes: canonical.runeCount,
  allSourceWords: canonical.words.length,
  original: originalResult,
  exactLengthMatchedSourcePlant: sourcePlantResult,
  genuineSolvedLP1: {longWords: lp1Long.length,
    dictionaryCovered: lp1DictionaryLong, ...lp1PlantResult},
  missingPremise: "preserved GP29 word boundaries and English-like lexicon",
  nextDecision: "requires independently supplied non-wordwise operation or key"
}, null, 2));
