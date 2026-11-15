"use strict";

/** LP2 original whole-word step-affine inverse gate. Node.js 22 / CommonJS SFT. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const data = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const original = read("resources/liber-primus/lp2-transcription.txt");
const lexicon = read("resources/control/english_wordfreq_textblob.txt");
const runeIndex = new Map(data.runes.map((rune, index) => [rune, index]));
const tokens = data.translit.map((token, index) => [token, index])
  .sort((left, right) => right[0].length - left[0].length);
const mod29 = (n) => ((n % 29) + 29) % 29;
const inverses = Array.from({length: 29}, (_, n) =>
  n ? Array.from({length: 29}, (_, candidate) => candidate)
    .find((candidate) => n * candidate % 29 === 1) : 0);

/** @param {string} text @returns {number[] | null} */
function nativeGP(text) {
  const source = text.toUpperCase().replace(/QU/g, "CW")
    .replace(/[KQ]/g, "C").replace(/V/g, "U").replace(/Z/g, "S");
  const output = [];
  for (let i = 0; i < source.length;) {
    if (source.startsWith("ING", i)) { output.push(21); i += 3; continue; }
    if (source.startsWith("IO", i)) { output.push(27); i += 2; continue; }
    const token = tokens.find(([name]) => source.startsWith(name, i));
    if (!token) return null;
    output.push(token[1]);
    i += token[0].length;
  }
  return output;
}

/** The transcription's slash is a physical line wrap and % a page break.
 * Neither divides a printed word. Other delimiters divide printed words.
 * @returns {number[][]}
 */
function sourceWords() {
  const pages = original.split("%").slice(0, 55);
  assert.equal(pages.length, 55);
  const words = [];
  let word = [];
  for (const symbol of pages.join("%")) {
    if (runeIndex.has(symbol)) {
      word.push(runeIndex.get(symbol));
    } else if (symbol === "%" || symbol === "/" || /\s/u.test(symbol)) {
      continue;
    } else if (word.length) {
      words.push(word);
      word = [];
    }
  }
  if (word.length) words.push(word);
  return words;
}

/** @returns {Map<number, number[][]>} */
function sourceDictionary() {
  const grouped = new Map();
  for (const line of lexicon.split(/\r?\n/u)) {
    const match = /^([a-z]+)\s+\d+$/u.exec(line);
    if (!match) continue;
    const word = nativeGP(match[1]);
    if (!word) continue;
    if (!grouped.has(word.length)) grouped.set(word.length, new Map());
    grouped.get(word.length).set(word.join(","), word);
  }
  return new Map([...grouped].map(([length, values]) =>
    [length, [...values.values()]]));
}

/** One word-local affine letter-to-step relation:
 * C_i - C_(i-1) = a*P_i + k_word (mod 29), for i >= 1.
 * C_0 is unrestricted, so this is valid for continuous and word-reset chains.
 * All 28 nonzero slopes and all 29 offsets are allowed independently per word.
 * @param {number[]} ciphertextWord
 * @param {number[]} plaintextWord
 * @returns {boolean}
 */
function isCompatible(ciphertextWord, plaintextWord) {
  const c = ciphertextWord, p = plaintextWord;
  assert.equal(c.length, p.length);
  if (c.length < 3) return true;
  const firstP = p[1], firstD = mod29(c[1] - c[0]);
  let slope = null;
  let offset = null;
  for (let i = 2; i < c.length; i++) {
    const dp = mod29(p[i] - firstP);
    const dd = mod29(c[i] - c[i - 1] - firstD);
    if (dp) {
      slope = mod29(dd * inverses[dp]);
      offset = mod29(firstD - slope * firstP);
      break;
    }
    if (dd) return false;
  }
  if (slope === null) return true; // same P suffix, same D suffix
  if (slope === 0) return false;
  for (let i = 1; i < c.length; i++)
    if (mod29(c[i] - c[i - 1] - slope * p[i] - offset) !== 0)
      return false;
  return true;
}

const words = sourceWords();
const dictionary = sourceDictionary();
const actual = words.flat();
const expected = data.pages.slice(0, 56).flatMap((page) => page.indices);
assert.deepEqual(actual, expected);
assert.equal(words.length, 2896);
assert.equal(actual.length, 12956);

const rows = [];
for (let length = 5; length <= 14; length++) {
  const originalWords = words.filter((word) => word.length === length);
  const entries = dictionary.get(length) || [];
  let supported = 0;
  for (const originalWord of originalWords)
    if (entries.some((candidate) => isCompatible(originalWord, candidate)))
      supported++;
  rows.push({length, original: originalWords.length,
    dictionary: entries.length, supported, excluded: originalWords.length - supported});
}
const expectedRows = [
  [317, 289], [256, 46], [216, 0], [156, 0], [78, 0],
  [52, 0], [32, 0], [18, 0], [4, 0], [3, 0]
];
assert.deepEqual(rows.map((row) => [row.original, row.supported]), expectedRows);
assert.equal(rows.slice(2).reduce((s, row) => s + row.original, 0), 559);

// Positive control: one native-GP dictionary word per original whole-word
// boundary, including the 32 original cross-page continuations. Each word
// receives its own unknown offset; slope 17 is invertible.
const chosen = words.map((word, i) => {
  const pool = dictionary.get(word.length);
  assert(pool && pool.length);
  return pool[(173 * i + 31) % pool.length];
});
const synthetic = [];
const decoded = [];
let previousCipher = 0;
for (let i = 0; i < chosen.length; i++) {
  const key = (7 * i + 3) % 29;
  const recovered = [];
  for (const plain of chosen[i]) {
    const next = mod29(previousCipher + 17 * plain + key);
    synthetic.push(next);
    const step = mod29(next - previousCipher);
    recovered.push(mod29((step - key) * inverses[17]));
    previousCipher = next;
  }
  decoded.push(recovered);
}
assert.deepEqual(decoded, chosen);
assert.equal(synthetic.length, 12956);
let offset = 0;
for (let i = 0; i < chosen.length; i++) {
  const fragment = synthetic.slice(offset, offset + chosen[i].length);
  assert(isCompatible(fragment, chosen[i]), "positive source-native word " + i);
  offset += chosen[i].length;
}
assert.equal(offset, 12956);
console.log(JSON.stringify({originalWords: words.length, sourceRunes: actual.length,
  model: "word-local unknown affine P_i -> cumulative C step, first step omitted",
  rows, longWordsAtLeastSeven: 559, longWordsSupported: 0,
  positive: "2896/2896 source-native words and 12956/12956 runes recovered"},
  null, 2));
console.log("PASS source-original inverse exclusion; no unknown LP2 plaintext recovered.");
