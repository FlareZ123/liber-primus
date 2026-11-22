"use strict";

/**
 * Direct nonlinear prior-plaintext rune cipher, 29-secret-lookup consensus.
 * Original LP2 corpus and two independently generated English positives.
 *
 * Model, word j >= 1: C[w,j] = P[w,j] + f(P[w,j-1]) (mod 29).
 * Word j=0: C[w,0] = P[w,0] + secretWordSeed[w] (mod 29).
 * Every f[x] is free in GP29; the word-initial seeds are entirely free.
 * Candidate GP-English words imply f(P[j-1]) = C[j] - P[j].
 * A single shared f must satisfy all real plaintext words simultaneously.
 *
 * This is DIRECT predecessor feedback, unlike the previously studied
 * cumulative state K[j+1]=K[j]+f(P[j]) with C[j]=P[j]+K[j].
 * Neither family is an authenticated Cicada decryption instruction.
 *
 * No dictionary guess is elevated to recovered plaintext. Source-native
 * English coverage is explicitly finite and measured by positive controls.
 *
 * Windows 11, Node.js 22, read-only:
 *   node sims/lp2_plain_predecessor_direct_lookup_dictionary_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

const ROOT = path.resolve(__dirname, "..");

/** @param {string} filename */
function read(filename) {
  return fs.readFileSync(path.join(ROOT, filename), "utf8");
}

/** @param {number} n */
function mod(n) {
  return (n % 29 + 29) % 29;
}

const GP = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const glyph = new Map(GP.runes.map((r, i) => [r, i]));
const translit = GP.translit.map((text, value) => ({text, value}))
  .sort((a, b) => b.text.length - a.text.length);

/**
 * Source-native GP spelling: maintain literal IO/ING/TH/EA/etc.
 * @param {string} text
 * @returns {Array<{p: number[], original: string}>}
 */
function nativeWords(text) {
  const words = [];
  for (const original of text.toUpperCase().match(/[A-Z]+/g) || []) {
    const spelling = original.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/[KQ]/g, "C").replace(/Z/g, "S");
    const p = [];
    for (let i = 0; i < spelling.length;) {
      const token = translit.find(z => spelling.startsWith(z.text, i));
      assert(token, "unmapped source word " + spelling.slice(i));
      p.push(token.value);
      i += token.text.length;
    }
    words.push({p, original});
  }
  return words;
}

const originalLayout = parseSharedCorpus();
assert.equal(originalLayout.runeCount, 12956);
assert.equal(originalLayout.words.length, 2896);
assert.equal(originalLayout.crossPageWords, 32);

const original = originalLayout.words.map(word =>
  [...word.runes].map(r => {
    assert(glyph.has(r), "unknown GP glyph");
    return glyph.get(r);
  }));
assert.deepEqual(original.flat(),
  GP.pages.filter(p => p.page < 56).flatMap(p => p.indices));

const referencePaths = [
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/control/gibran_prophet_58585.txt"
];
const dictionary = new Map();
for (const filename of referencePaths) {
  for (const word of nativeWords(read(filename))) {
    const key = word.p.join(",");
    if (!dictionary.has(key)) dictionary.set(key, word);
  }
}
assert.equal(dictionary.size, 12231);

const byLength = new Map();
for (const word of dictionary.values()) {
  if (!byLength.has(word.p.length)) byLength.set(word.p.length, []);
  byLength.get(word.p.length).push(word);
}

/**
 * All implied entries of a completely free secret 29-entry f.
 * @param {number[]} C
 * @param {number[]} P
 * @returns {{map:Int8Array,fields:number[]}|null}
 */
function implied(C, P) {
  assert.equal(C.length, P.length);
  const map = new Int8Array(29).fill(-1);
  const fields = [];
  for (let j = 1; j < C.length; j++) {
    const predecessor = P[j - 1];
    const value = mod(C[j] - P[j]);
    if (map[predecessor] >= 0 && map[predecessor] !== value)
      return null;
    if (map[predecessor] === -1) {
      map[predecessor] = value;
      fields.push(predecessor);
    }
  }
  return {map, fields};
}

/**
 * @param {number[]} C
 * @returns {Array<{map:Int8Array,fields:number[],word:string}>}
 */
function candidateMaps(C) {
  const out = [];
  for (const word of byLength.get(C.length) || []) {
    const mapping = implied(C, word.p);
    if (mapping) out.push({...mapping, word: word.original});
  }
  return out;
}

/**
 * @param {number[][]} ciphertextWords
 * @returns {Array<{C:number[],index:number,maps:ReturnType<typeof candidateMaps>}>}
 */
function longGroup(ciphertextWords) {
  return ciphertextWords.map((C, index) => ({C, index}))
    .filter(x => x.C.length >= 10)
    .map(x => ({...x, maps: candidateMaps(x.C)}));
}

/**
 * Number of shared assigned entries; -1 on ANY contradiction.
 * @param {{map:Int8Array,fields:number[]}} a
 * @param {{map:Int8Array,fields:number[]}} b
 */
function overlap(a, b) {
  let shared = 0;
  for (const x of a.fields) {
    if (b.map[x] >= 0) {
      if (a.map[x] !== b.map[x]) return -1;
      shared++;
    }
  }
  return shared;
}

/**
 * Exhaust anchors with >=12 original runes, compare to every other
 * original word of >=10 runes and every type-matched dictionary reading.
 * Each candidate map is exact, not fitted to a language score.
 * @param {ReturnType<typeof longGroup>} group
 */
function strongest(group) {
  const anchors = group.filter(row => row.C.length >= 12);
  let anchorMaps = 0;
  const best = {any: -1, three: -1, anyWitness: null,
    threeWitness: null};

  for (const anchor of anchors) {
    for (const mapping of anchor.maps) {
      anchorMaps++;
      let any = 0;
      let three = 0;
      for (const target of group) {
        if (target.index === anchor.index) continue;
        let maximumShared = -1;
        for (const possible of target.maps) {
          maximumShared = Math.max(maximumShared,
            overlap(mapping, possible));
        }
        if (maximumShared >= 0) any++;
        if (maximumShared >= 3) three++;
      }
      if (any > best.any) {
        best.any = any;
        best.anyWitness = {
          index: anchor.index, plain: mapping.word,
          assigned: mapping.fields.length
        };
      }
      if (three > best.three) {
        best.three = three;
        best.threeWitness = {
          index: anchor.index, plain: mapping.word,
          assigned: mapping.fields.length
        };
      }
    }
  }
  return {
    targets: group.length,
    anchors: anchors.length,
    anchorMaps,
    anyCompatibleOtherWords: best.any,
    threeSharedOtherWords: best.three,
    anyWitness: best.anyWitness,
    threeWitness: best.threeWitness
  };
}

/**
 * True reversible independent plain-word plant, arbitrary seed per word,
 * hidden nonlinear f(x)=(GPprime[x]+1) mod29.
 * @param {number[]} P
 * @param {number} seed
 * @returns {number[]}
 */
function encrypt(P, seed) {
  const C = [mod(P[0] + seed)];
  for (let j = 1; j < P.length; j++) {
    C.push(mod(P[j] + GP.prime[P[j - 1]] + 1));
  }
  return C;
}

/** @param {number[]} C @param {number} firstPlain */
function decrypt(C, firstPlain) {
  const P = [firstPlain];
  for (let j = 1; j < C.length; j++) {
    P.push(mod(C[j] - GP.prime[P[j - 1]] - 1));
  }
  return P;
}

const real = strongest(longGroup(original));
assert.equal(real.targets, 109);
assert.equal(real.anchors, 25);
assert.equal(real.anchorMaps, 105);
assert.equal(real.anyCompatibleOtherWords, 1);
assert.equal(real.threeSharedOtherWords, 1);

const lengthTargets = original.filter(p => p.length >= 10);
const plantedWords = lengthTargets.map((ciphertextShape, i) => {
  const choices = byLength.get(ciphertextShape.length);
  assert(choices && choices.length);
  const P = choices[(11 + 17 * i) % choices.length].p;
  const C = encrypt(P, 24 + 7 * i);
  assert.deepEqual(decrypt(C, P[0]), P);
  return C;
});
const planted = strongest(longGroup(plantedWords));
assert.equal(planted.targets, 109);
assert.equal(planted.anchors, 25);
assert.equal(planted.anchorMaps, 137);
assert.equal(planted.anyCompatibleOtherWords, 108);
assert.equal(planted.threeSharedOtherWords, 107);

// Independent previously solved Cicada English, with realistic dictionary gaps.
const lp1 = read("resources/liber-primus/lp1-plaintext-reference.txt")
  .split(/\r?\n/u).filter(line => {
    const s = line.trim();
    return s && !s.startsWith("#") && !s.startsWith("[") &&
      !/^[0-9a-f]{25,}$/iu.test(s) && !/^\d+[\s\d]+$/.test(s);
  }).join(" ");
const trueWords = nativeWords(lp1).filter(x => x.p.length >= 10);
const coveredWords = trueWords.filter(x => dictionary.has(x.p.join(",")));
const solvedPlants = trueWords.map((x, i) => {
  const C = encrypt(x.p, 24 + 17 * i);
  assert.deepEqual(decrypt(C, x.p[0]), x.p);
  return C;
});
const solved = strongest(longGroup(solvedPlants));
assert.equal(trueWords.length, 20);
assert.equal(coveredWords.length, 14);
assert.equal(solved.targets, 20);
assert.equal(solved.anchors, 8);
assert.equal(solved.anchorMaps, 35);
assert.equal(solved.anyCompatibleOtherWords, 14);
assert.equal(solved.threeSharedOtherWords, 14);

console.log(JSON.stringify({
  status: "conditional native-GP source-register negative; no unknown plaintext",
  model: "C_j=P_j+f(P_(j-1)) mod29; separate arbitrary first-rune seed per word",
  dictionaryTypes: dictionary.size,
  corpusRunes: originalLayout.runeCount,
  corpusWords: originalLayout.words.length,
  crossPageWords: originalLayout.crossPageWords,
  original: real,
  independentExactLengthPlant: planted,
  solvedLP1Plant: {
    longWords: trueWords.length, dictionaryRepresented: coveredWords.length,
    ...solved
  }
}, null, 2));
