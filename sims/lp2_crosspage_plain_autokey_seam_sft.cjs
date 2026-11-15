"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const transcription = fs.readFileSync(path.join(root, "resources/liber-primus/lp2-transcription.txt"), "utf8");
const lexicon = fs.readFileSync(path.join(root, "resources/control/english_wordfreq_textblob.txt"), "utf8");

/** @typedef {{c: number[], pages: number[]}} RuneWord */
/** @typedef {{word: string, indices: number[]}} DictionaryWord */
const indexByRune = new Map(corpus.runes.map((rune, i) => [rune, i]));
const multiTokens = ["ING", "TH", "NG", "EO", "OE", "AE", "IA", "EA"];

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/**
 * Convert a printed/transliterated source word to native GP29.
 * Seven historical composite glyphs and the longer ING ligature take priority.
 * @param {string} source
 * @returns {number[] | null}
 */
function toGP(source) {
  const normalized = source.toUpperCase().replace(/QU/g, "CW")
    .replace(/[KQ]/g, "C").replace(/V/g, "U").replace(/Z/g, "S");
  const result = [];
  for (let i = 0; i < normalized.length;) {
    const token = multiTokens.find((value) => normalized.startsWith(value, i)) || normalized[i];
    const n = corpus.translit.indexOf(token === "ING" ? "NG" : token);
    if (n === -1) return null;
    result.push(n);
    i += token.length;
  }
  return result;
}

/**
 * Page separators are layout and never terminate a printed word.
 * The original numerical-table-only physical page 50 has no rune page.
 * @param {string} source
 * @returns {RuneWord[]}
 */
function parsePrintedWords(source) {
  const segments = source.split("%").slice(0, 55);
  assert.equal(segments.length, 55);
  const words = [];
  let c = [], pages = [], page = 0;
  /** @returns {void} */
  function finish() {
    if (c.length) words.push({c, pages});
    c = [];
    pages = [];
  }
  for (const character of segments.join("%")) {
    const index = indexByRune.get(character);
    if (index !== undefined) {
      c.push(index);
      pages.push(page >= 50 ? page + 1 : page);
    } else if (character === "%") {
      page++;
    } else if (character === "/" || /\s/u.test(character)) {
      // Physical wraps are within a GP word.
    } else {
      finish();
    }
  }
  finish();
  return words;
}

/**
 * Deduplicate native-GP spellings within each original printed rune length.
 * @param {string} source
 * @returns {Map<number, DictionaryWord[]>}
 */
function dictionaryByLength(source) {
  const grouped = new Map();
  for (const line of source.split(/\r?\n/u)) {
    const match = /^([a-z]+)\s+\d+$/u.exec(line);
    if (!match) continue;
    const indices = toGP(match[1]);
    if (!indices) continue;
    if (!grouped.has(indices.length)) grouped.set(indices.length, new Map());
    grouped.get(indices.length).set(indices.join(","), {word: match[1], indices});
  }
  return new Map(Array.from(grouped, ([length, values]) => [length, Array.from(values.values())]));
}

const words = parsePrintedWords(transcription);
const candidates = dictionaryByLength(lexicon);
const pages = corpus.pages.slice(0, 56).filter((page) => page.indices.length > 0);
const sourceRunes = words.flatMap((word) => word.c);
const canonicalRunes = pages.flatMap((page) => page.indices);
assert.deepEqual(sourceRunes, canonicalRunes);
assert.equal(sourceRunes.length, 12956);
assert.equal(words.length, 2896);
assert.equal(pages.length, 55);

const crossPage = words.map((word, i) => ({word, i})).filter(({word}) =>
  word.pages[0] !== word.pages[word.pages.length - 1]);
assert.equal(crossPage.length, 32);

/**
 * The exact key-independent invariant of C_i = P_i + P_(i-1) + key[page_i].
 * For positions i>=2 in the same page as i-1:
 *       C_i-C_(i-1) = P_i-P_(i-2).
 * This is valid even when P_(i-2) lies on an earlier physical page.
 * @param {number[]} ciphertext
 * @param {RuneWord} printed
 * @param {number[]} candidate
 * @returns {boolean}
 */
function compatible(ciphertext, printed, candidate) {
  for (let i = 2; i < ciphertext.length; i++) {
    if (printed.pages[i] !== printed.pages[i - 1]) continue;
    if (mod29(ciphertext[i] - ciphertext[i - 1]) !==
        mod29(candidate[i] - candidate[i - 2])) return false;
  }
  return true;
}

/**
 * @param {number[]} ciphertext
 * @param {RuneWord} printed
 * @returns {DictionaryWord[]}
 */
function matchedWords(ciphertext, printed) {
  return (candidates.get(printed.c.length) || []).filter((candidate) =>
    compatible(ciphertext, printed, candidate.indices));
}

/**
 * For a seam at position i>=2, its relative page key is fixed by a
 * proposed complete plaintext word:
 *    delta = (C_i-C_(i-1)) - (P_i-P_(i-2)).
 * @param {number[]} ciphertext
 * @param {number[]} plaintext
 * @param {number} cut
 * @returns {number}
 */
function relativePageKey(ciphertext, plaintext, cut) {
  assert.ok(cut >= 2);
  return mod29(ciphertext[cut] - ciphertext[cut - 1] -
    plaintext[cut] + plaintext[cut - 2]);
}

/**
 * @param {number[]} message
 * @param {number[]} pageAtPosition
 * @param {number[]} pageKeys
 * @returns {number[]}
 */
function encrypt(message, pageAtPosition, pageKeys) {
  const output = [];
  let previousPlaintext = 0;
  for (let i = 0; i < message.length; i++) {
    output.push(mod29(message[i] + previousPlaintext + pageKeys[pageAtPosition[i]]));
    previousPlaintext = message[i];
  }
  return output;
}

/**
 * @param {number[]} message
 * @param {number[]} pageAtPosition
 * @param {number[]} pageKeys
 * @returns {number[]}
 */
function decrypt(message, pageAtPosition, pageKeys) {
  const output = [];
  let previousPlaintext = 0;
  for (let i = 0; i < message.length; i++) {
    const value = mod29(message[i] - previousPlaintext - pageKeys[pageAtPosition[i]]);
    output.push(value);
    previousPlaintext = value;
  }
  return output;
}

const rows = [];
for (const {word} of crossPage) {
  const cut = word.pages.findIndex((page) => page !== word.pages[0]);
  assert.ok(cut >= 1);
  const selected = matchedWords(word.c, word);
  const deltas = new Set(cut >= 2
    ? selected.map((candidate) => relativePageKey(word.c, candidate.indices, cut))
    : []);
  rows.push({
    boundary: String(word.pages[0]) + "->" + word.pages[word.pages.length - 1],
    length: word.c.length,
    leftLength: cut,
    constraints: word.c.length - 2 - (cut >= 2 ? 1 : 0),
    dictionarySize: (candidates.get(word.c.length) || []).length,
    compatible: selected.length,
    relativeKeyCandidates: cut >= 2 ? deltas.size : null
  });
}
assert.equal(rows.filter((row) => row.compatible === 0).length, 19);
assert.equal(rows.filter((row) => row.relativeKeyCandidates !== null).length, 25);
assert.equal(rows.filter((row) => row.compatible === 0 && row.relativeKeyCandidates !== null).length, 15);

// Native GP positive: exactly the original 2,896 printed word lengths,
// exact original positions and the 32 original cross-page word cuts.
const plantedWords = words.map((word, i) => {
  const pool = candidates.get(word.c.length);
  assert.ok(pool && pool.length, "no native-GP lexicon words of required length");
  return pool[(i * 173 + 31) % pool.length].indices;
});
const plaintext = plantedWords.flat();
const pageAtPosition = words.flatMap((word) => word.pages);
const pageKeys = Array.from({length: 58}, (_, physicalPage) => (11 * physicalPage + 7) % 29);
const planted = encrypt(plaintext, pageAtPosition, pageKeys);
assert.deepEqual(decrypt(planted, pageAtPosition, pageKeys), plaintext);
assert.deepEqual(encrypt(decrypt(planted, pageAtPosition, pageKeys),
  pageAtPosition, pageKeys), planted);

let offset = 0, nativeSeamsFound = 0, deltaSeamsFound = 0;
for (let i = 0; i < words.length; i++) {
  const word = words[i], trueWord = plantedWords[i];
  if (word.pages[0] !== word.pages[word.pages.length - 1]) {
    const ciphertext = planted.slice(offset, offset + word.c.length);
    const selected = matchedWords(ciphertext, word);
    assert.ok(selected.some((candidate) =>
      candidate.indices.join(",") === trueWord.join(",")), "plant's native word must survive");
    nativeSeamsFound++;
    const cut = word.pages.findIndex((page) => page !== word.pages[0]);
    if (cut >= 2) {
      const trueDelta = mod29(pageKeys[word.pages[cut]] - pageKeys[word.pages[cut - 1]]);
      const deltas = new Set(selected.map((candidate) =>
        relativePageKey(ciphertext, candidate.indices, cut)));
      assert.ok(deltas.has(trueDelta), "plant's true relative key must survive");
      deltaSeamsFound++;
    }
  }
  offset += word.c.length;
}
assert.equal(offset, 12956);
assert.equal(nativeSeamsFound, 32);
assert.equal(deltaSeamsFound, 25);

/** @type {Set<number>} */
const seenPages = new Set();
let pageComponents = 0;
const neighbors = new Map(pages.map((page) => [page.page, []]));
for (const {word} of crossPage) {
  const first = word.pages[0], last = word.pages[word.pages.length - 1];
  neighbors.get(first).push(last);
  neighbors.get(last).push(first);
}
for (const physicalPage of neighbors.keys()) {
  if (seenPages.has(physicalPage)) continue;
  pageComponents++;
  const stack = [physicalPage];
  while (stack.length) {
    const item = stack.pop();
    if (seenPages.has(item)) continue;
    seenPages.add(item);
    stack.push(...neighbors.get(item));
  }
}
assert.equal(pageComponents, 23);

console.log(JSON.stringify({
  model: "GP29 plaintext-one-back with independent per-physical-page additive keys",
  source: {runes: sourceRunes.length, words: words.length,
    sourcePages: pages.length, crossPageWords: crossPage.length,
    seamGraphComponents: pageComponents},
  original: {zeroDictionaryCompatibleSeams: 19, ambiguousOrViableSeams: 13,
    seamsWithObservableKeyDifference: 25,
    zeroCompatibleObservableKeyDifferences: 15, rows},
  nativePlant: {runesRecovered: plaintext.length,
    originalLayoutSeamWordsRecovered: nativeSeamsFound,
    originalLayoutRelativeKeysRetained: deltaSeamsFound}
}, null, 2));
