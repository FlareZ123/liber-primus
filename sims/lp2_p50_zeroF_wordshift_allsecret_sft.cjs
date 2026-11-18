"use strict";

/**
 * Director #1422: fixed p50 zero->F outer inverse plus all-secret per-word
 * GP29 Caesar-shift necessary-condition gate.
 *
 * The composite was predeclared on issue #1422 before evaluation.
 *
 * Outer layer:
 *   literal-leading-zero p50 cell -> moving exception F/index0;
 *   otherwise p50 byte low3 -> [F,TH,EO,NG,OE,AE,IA,EA];
 *   swap previous ciphertext <-> moving exception, other 27 symbols fixed.
 *
 * Inner layer:
 *   each complete printed word may have ANY independent additive GP29 offset.
 *   Subtracting the first rune from all runes gives a shift-invariant signature,
 *   so all 29^2896 possible word-key assignments are tested without enumeration.
 *
 * Gate:
 *   require at least 150 contiguous original runes across complete words whose
 *   signatures each match at least one source-native dictionary word of the
 *   same GP rune length before fitting any word-number rule.
 *
 * Node.js 22, CommonJS, read-only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { encodeSourceNativeGP } =
  require("./lp2_native_gp_source_orthography_sft.cjs");

const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const bytes = grid.bytes;
const tokens = grid.pages.flatMap(page => page.tokens);
const pages = corpus.pages.filter(page => page.page <= 55 && page.indices.length);
const original = pages.flatMap(page => page.indices);

const sourceText = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55).join("%")
  .replace(/\/\r?\n/g, "").replace(/[\r\n%]/g, "");
const runePattern = new RegExp("[" + corpus.runes.join("") + "]+", "gu");
const glyphIndex = new Map(corpus.runes.map((glyph, index) => [glyph, index]));
const wordShapes = (sourceText.match(runePattern) || []).map(word =>
  Array.from(word, glyph => glyphIndex.get(glyph)));

assert.equal(original.length, 12956);
assert.equal(wordShapes.length, 2896);
assert.deepEqual(wordShapes.flat(), original);

const special = [
  corpus.translit.indexOf("F"),
  ...corpus.translit.map((value, index) =>
    value.length === 2 ? index : -1).filter(index => index >= 0)
];
assert.deepEqual(special, [0, 2, 12, 21, 22, 25, 27, 28]);

/**
 * @param {number} value
 * @param {number} left
 * @param {number} right
 * @returns {number}
 */
function swap(value, left, right) {
  if (left === right) return value;
  if (value === left) return right;
  if (value === right) return left;
  return value;
}

/**
 * @param {number} control
 * @returns {number}
 */
function marker(control) {
  if (tokens[control][0] === "0") return 0;
  return special[bytes[control] & 7];
}

/**
 * @param {number[]} plain
 * @returns {number[]}
 */
function outerEncrypt(plain) {
  assert.equal(plain.length, original.length);
  const cipher = new Array(plain.length);
  cipher[0] = plain[0];
  for (let i = 1; i < plain.length; i++) {
    const control = (i - 1) & 255;
    cipher[i] = swap(plain[i], cipher[i - 1], marker(control));
  }
  return cipher;
}

/**
 * @param {number[]} cipher
 * @returns {number[]}
 */
function outerDecrypt(cipher) {
  assert.equal(cipher.length, original.length);
  const plain = new Array(cipher.length);
  plain[0] = cipher[0];
  for (let i = 1; i < cipher.length; i++) {
    const control = (i - 1) & 255;
    plain[i] = swap(cipher[i], cipher[i - 1], marker(control));
  }
  return plain;
}

/**
 * @param {number[]} word
 * @returns {string}
 */
function signature(word) {
  const first = word[0];
  return word.map(value => (value - first + 29) % 29).join(",");
}

const dictionarySignatures = new Map();
const dictionaryWords = new Map();

for (const line of read("resources/control/english_wordfreq_textblob.txt")
  .split(/\r?\n/)) {
  const match = line.match(/^([A-Za-z]+)/);
  if (!match) continue;
  const encoded = encodeSourceNativeGP(match[1]);
  const length = encoded.length;
  if (!dictionarySignatures.has(length)) {
    dictionarySignatures.set(length, new Set());
    dictionaryWords.set(length, []);
  }
  dictionarySignatures.get(length).add(signature(encoded));
  dictionaryWords.get(length).push(encoded);
}

for (let length = 1; length <= 14; length++) {
  assert.ok(dictionarySignatures.get(length)?.size);
  assert.ok(dictionaryWords.get(length)?.length);
}

/**
 * @param {number[]} stream
 * @returns {{
 *   compatible:number,
 *   compatibleLength5Plus:number,
 *   totalLength5Plus:number,
 *   byLength:Object,
 *   longestRunes:number,
 *   longestStartWord:number,
 *   longestEndWord:number
 * }}
 */
function evaluate(stream) {
  let offset = 0;
  let compatible = 0;
  let compatibleLength5Plus = 0;
  let totalLength5Plus = 0;
  const byLength = {};
  let runRunes = 0;
  let runStart = -1;
  let longestRunes = 0;
  let longestStartWord = -1;
  let longestEndWord = -1;

  for (let wordIndex = 0; wordIndex < wordShapes.length; wordIndex++) {
    const length = wordShapes[wordIndex].length;
    const word = stream.slice(offset, offset + length);
    offset += length;
    const hit = dictionarySignatures.get(length)?.has(signature(word)) || false;

    if (!byLength[length]) byLength[length] = { total: 0, compatible: 0 };
    byLength[length].total++;
    byLength[length].compatible += Number(hit);

    if (length >= 5) {
      totalLength5Plus++;
      compatibleLength5Plus += Number(hit);
    }
    compatible += Number(hit);

    if (hit) {
      if (runRunes === 0) runStart = wordIndex;
      runRunes += length;
      if (runRunes > longestRunes) {
        longestRunes = runRunes;
        longestStartWord = runStart;
        longestEndWord = wordIndex;
      }
    } else {
      runRunes = 0;
      runStart = -1;
    }
  }

  assert.equal(offset, stream.length);
  return {
    compatible,
    compatibleLength5Plus,
    totalLength5Plus,
    byLength,
    longestRunes,
    longestStartWord,
    longestEndWord
  };
}

const intermediate = outerDecrypt(original);
assert.deepEqual(outerEncrypt(intermediate), original);

const observed = evaluate(intermediate);
assert.deepEqual(observed, {
  compatible: 1020,
  compatibleLength5Plus: 1,
  totalLength5Plus: 1132,
  byLength: {
    1: { total: 83, compatible: 83 },
    2: { total: 448, compatible: 448 },
    3: { total: 720, compatible: 450 },
    4: { total: 513, compatible: 38 },
    5: { total: 317, compatible: 1 },
    6: { total: 256, compatible: 0 },
    7: { total: 216, compatible: 0 },
    8: { total: 156, compatible: 0 },
    9: { total: 78, compatible: 0 },
    10: { total: 52, compatible: 0 },
    11: { total: 32, compatible: 0 },
    12: { total: 18, compatible: 0 },
    13: { total: 4, compatible: 0 },
    14: { total: 3, compatible: 0 }
  },
  longestRunes: 18,
  longestStartWord: 1461,
  longestEndWord: 1467
});

// Positive: populate every original word slot with a real registered native-GP
// dictionary word of the same GP length, add an independent secret word shift,
// wrap the full shifted stream in the frozen outer layer, then recover it.
const positivePlain = [];
const positiveInner = [];
for (let wordIndex = 0; wordIndex < wordShapes.length; wordIndex++) {
  const length = wordShapes[wordIndex].length;
  const options = dictionaryWords.get(length);
  const word = options[(wordIndex * 17 + 5) % options.length];
  const shift = (7 * wordIndex + 13) % 29;
  positivePlain.push(...word);
  positiveInner.push(...word.map(value => (value + shift) % 29));
}
assert.equal(positivePlain.length, original.length);
assert.equal(positiveInner.length, original.length);

const positiveCipher = outerEncrypt(positiveInner);
const positiveRecoveredInner = outerDecrypt(positiveCipher);
assert.deepEqual(positiveRecoveredInner, positiveInner);
const positive = evaluate(positiveRecoveredInner);
assert.equal(positive.compatible, 2896);
assert.equal(positive.compatibleLength5Plus, 1132);
assert.equal(positive.longestRunes, 12956);

// Exact known word shift inversion also recovers the planted native plaintext.
let positiveOffset = 0;
const recoveredPlain = [];
for (let wordIndex = 0; wordIndex < wordShapes.length; wordIndex++) {
  const length = wordShapes[wordIndex].length;
  const shift = (7 * wordIndex + 13) % 29;
  recoveredPlain.push(...positiveRecoveredInner
    .slice(positiveOffset, positiveOffset + length)
    .map(value => (value - shift + 29) % 29));
  positiveOffset += length;
}
assert.deepEqual(recoveredPlain, positivePlain);

console.log(JSON.stringify({
  model:
    "fixed zero-F outer inverse plus arbitrary independent additive shift per complete printed word",
  observed,
  positive: {
    compatible: positive.compatible,
    compatibleLength5Plus: positive.compatibleLength5Plus,
    longestRunes: positive.longestRunes,
    exactOuterRoundtrip: true,
    exactKnownShiftPlaintextRecovery: true
  },
  requiredContiguousRunes: 150,
  decision:
    "FAIL all-secret word-shift necessary condition; longest compatible span 18 runes"
}, null, 2));
