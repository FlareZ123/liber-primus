"use strict";

/**
 * Complete original-word all-secret five-phase lexical viability test.
 * Word-local substitution alphabets may be arbitrary 29! permutations,
 * independent for all five local phases and independently secret by word.
 *
 * Identical positions modulo five must preserve equal/different relations
 * between their source GP plaintext and published ciphertext runes.
 * This is a necessary condition for every possible hidden key; it is not
 * a decryptor or source-selected historical cipher.
 *
 * SFT: node sims/lp2_wordlocal_fivephase_allword_lexical_capacity_sft.cjs
 * Windows Node22, CommonJS, source-native GP English, read-only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseLP2Words, physicalLP2Page} = require("./lp2_word_pages.cjs");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");
const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeToIndex = new Map(corpus.runes.map((s, i) => [s, i]));
const parsed = parseLP2Words(read("resources/liber-primus/lp2-transcription.txt"));
const sourceWords = parsed.words.map(w => [...w.runes].map(r => {
  const n = runeToIndex.get(r);
  assert.notEqual(n, undefined);
  return n;
}));
assert.equal(parsed.runeCount, 12956);
assert.equal(sourceWords.length, 2896);
assert.deepEqual(sourceWords.flat(), corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices));

/**
 * Exact full invariant of unrestricted per-word period-five permutations:
 * for each phase all pairs of positions sharing that phase preserve
 * their equality and inequality. Source words are at most 14 runes, so
 * distances five and ten suffice to exhaust all such comparisons.
 * @param {number[]} a
 * @returns {string}
 */
function signature(a) {
  let result = "";
  for (let j = 5; j < a.length; j++) {
    result += Number(a[j] === a[j - 5]);
  }
  for (let j = 10; j < a.length; j++) {
    result += Number(a[j] === a[j - 10]);
  }
  return result;
}

/** @param {number[]} a @returns {string} */
const keyOf = a => a.length + ":" + signature(a);
const dictionary = new Map();
const byLength = new Map();
/** @param {string[]} words */
function addWords(words) {
  for (const word of words) {
    if (!/^[A-Za-z]+$/.test(word)) continue;
    const gp = encodeSourceNativeGP(word);
    if (!gp.length) continue;
    const k = keyOf(gp);
    if (!dictionary.has(k)) dictionary.set(k, new Set());
    dictionary.get(k).add(word.toUpperCase());
    if (!byLength.has(gp.length)) byLength.set(gp.length, []);
    byLength.get(gp.length).push(gp);
  }
}
const Shakespeare = read("resources/control/shakespeare_first300k.txt")
  .match(/[A-Za-z]+/g) || [];
const TextBlob = read("resources/control/english_wordfreq_textblob.txt")
  .split(/\r?\n/).map(s => s.split(" ")[0]);
assert.equal(Shakespeare.length, 55407);
assert.equal(TextBlob.length, 29164);
addWords(Shakespeare);
addWords(TextBlob);
assert.equal(dictionary.size, 246);

const missing = [];
const rare = [];
for (let i = 0; i < sourceWords.length; i++) {
  const cipherWord = sourceWords[i];
  const set = dictionary.get(keyOf(cipherWord));
  if (!set || !set.size) missing.push(i);
  if (cipherWord.length >= 6 && set && set.size <= 2) {
    rare.push({
      originalWordIndex: i,
      physicalPage: physicalLP2Page(parsed.words[i].startPage),
      gpLength: cipherWord.length,
      sourceSignature: signature(cipherWord),
      candidates: [...set].sort()
    });
  }
}
assert.deepEqual(missing, []);
assert.deepEqual(rare, [
  {originalWordIndex:754,physicalPage:13,gpLength:14,
    sourceSignature:"1000000000000",candidates:["SEQUESTRECTOMY"]},
  {originalWordIndex:1353,physicalPage:25,gpLength:14,
    sourceSignature:"0000001000000",candidates:["INFRAMAXILLARY","METEMPSYCHOSIS"]},
  {originalWordIndex:1967,physicalPage:36,gpLength:10,
    sourceSignature:"10011",candidates:["TAPESTRIES"]},
  {originalWordIndex:2722,physicalPage:51,gpLength:8,
    sourceSignature:"111",candidates:["MESDAMES"]}
]);

const native = sourceWords.map((w, i) => {
  const pool = byLength.get(w.length);
  assert.ok(pool && pool.length, "unrepresented native word length " + w.length);
  return pool[(i * 17 + 5) % pool.length];
});
let total = 0;
/**
 * A source-positive full plaintext encryption using five arbitrary-per-word
 * affine permutations, one per phase. The phase rows are secret to an
 * outsider but known exactly in this matched positive test.
 */
for (let i = 0; i < native.length; i++) {
  const p = native[i];
  const c = p.map((v, j) => (17 * v + (7 * i + 11 * (j % 5)) % 29) % 29);
  const back = c.map((v, j) => (12 * ((v - (7 * i + 11 * (j % 5)) % 29 + 29) % 29)) % 29);
  assert.deepEqual(back, p);
  assert.equal(signature(c), signature(p));
  assert.ok(dictionary.has(keyOf(c)));
  total += p.length;
}
assert.equal(total, 12956);

console.log(JSON.stringify({
  status: "all 2896 original words lexically admissible under independent secret five-phase alphabets, four highly constrained word types",
  authenticUnknownPlaintextRecovered: false,
  sourceRunes: total,
  originalWords: sourceWords.length,
  dictionarySignatures: dictionary.size,
  sourceLexiconTokens: {Shakespeare: Shakespeare.length, TextBlob: TextBlob.length},
  incompatiblePrintedWords: missing.length,
  sourceNativeCipherPlant: "12956/12956 exact inverse, 2896/2896 signature invariant",
  fourAtMostTwoCandidateWords: rare
}, null, 2));
