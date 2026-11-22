"use strict";

/**
 * Director #1422: p50 zero->F moving-exception sparse transposition.
 *
 * Predeclared on issue #1422 before control evaluation.
 *
 * State rule:
 * - current rune i is controlled by source table cell (i-1) mod 256;
 * - literal-leading-zero cells select GP index0 F as moving exception;
 * - every other cell selects [F,TH,EO,NG,OE,AE,IA,EA][byte & 7];
 * - swap only previous ciphertext C[i-1] <-> selected exception;
 * - fix all other 27 GP29 symbols;
 * - first global rune is identity.
 *
 * This is an exact involution. The structural gate required all three
 * independent native-English registers to move closer to the original on:
 * adjacent repeats=86, within-word lag5 equalities=104, and leading-zero
 * repeat share=33/86. Only after that gate passed was the original inverse
 * inspected for native GP language.
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
const words = (sourceText.match(runePattern) || []).map(word =>
  Array.from(word, glyph => glyphIndex.get(glyph)));

assert.equal(original.length, 12956);
assert.equal(words.length, 2896);
assert.deepEqual(words.flat(), original);
assert.equal(bytes.length, 256);
assert.equal(tokens.length, 256);

const pageAt = new Uint8Array(original.length);
let pageOffset = 0;
for (const page of pages) {
  pageAt.fill(page.page, pageOffset, pageOffset + page.indices.length);
  pageOffset += page.indices.length;
}

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
function encrypt(plain) {
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
 * The state permutation is an involution.
 *
 * @param {number[]} cipher
 * @returns {number[]}
 */
function decrypt(cipher) {
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
 * @param {number[]} stream
 * @returns {{
 *   adjacent:number,leadingZeroAdjacent:number,lag5:number,sLag5:number,
 *   leadingZeroShare:number
 * }}
 */
function counts(stream) {
  let adjacent = 0;
  let leadingZeroAdjacent = 0;

  for (let i = 1; i < stream.length; i++) {
    if (pageAt[i] !== pageAt[i - 1] || stream[i] !== stream[i - 1]) continue;
    adjacent++;
    leadingZeroAdjacent += Number(tokens[(i - 1) & 255][0] === "0");
  }

  let wordOffset = 0;
  let lag5 = 0;
  let sLag5 = 0;
  let eligible = 0;
  for (const word of words) {
    for (let j = 5; j < word.length; j++) {
      eligible++;
      if (stream[wordOffset + j] === stream[wordOffset + j - 5]) {
        lag5++;
        sLag5 += Number(stream[wordOffset + j] === 15);
      }
    }
    wordOffset += word.length;
  }

  assert.equal(wordOffset, stream.length);
  assert.equal(eligible, 2105);
  return {
    adjacent,
    leadingZeroAdjacent,
    lag5,
    sLag5,
    leadingZeroShare: adjacent ? leadingZeroAdjacent / adjacent : 0
  };
}

/**
 * @param {number[]} stream
 * @returns {number}
 */
function ioc(stream) {
  const histogram = new Uint32Array(29);
  for (const value of stream) histogram[value]++;
  const numerator = Array.from(histogram)
    .reduce((sum, value) => sum + value * (value - 1), 0);
  return numerator / (stream.length * (stream.length - 1));
}

/**
 * @param {number} seed
 * @returns {() => number}
 */
function xorshift32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/**
 * @param {string} file
 * @returns {Map<number, number[][]>}
 */
function nativePools(file) {
  const pools = new Map();
  for (const word of read(file).match(/[A-Za-z]+/g) || []) {
    const encoded = encodeSourceNativeGP(word);
    if (!pools.has(encoded.length)) pools.set(encoded.length, []);
    pools.get(encoded.length).push(encoded);
  }
  return pools;
}

const source = counts(original);
assert.equal(source.adjacent, 86);
assert.equal(source.leadingZeroAdjacent, 33);
assert.equal(source.lag5, 104);
assert.equal(source.sLag5, 11);
assert.ok(Math.abs(source.leadingZeroShare - 33 / 86) < 1e-15);

const target = {
  adjacent: source.adjacent,
  lag5: source.lag5,
  leadingZeroShare: source.leadingZeroShare
};

const random = xorshift32(0x3301A518);
const trials = 48;
const expected = {
  Shakespeare: {
    adjacent: [21418, 6707],
    lag5: [5930, 5661],
    encodedShare: 0.39679820342206146
  },
  Gibran: {
    adjacent: [20725, 8093],
    lag5: [5871, 5644],
    encodedShare: 0.4130530305230735
  },
  Emerson: {
    adjacent: [19809, 7898],
    lag5: [6355, 6221],
    encodedShare: 0.4167166415388099
  }
};

const controls = [];
for (const [name, file] of [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"]
]) {
  const pools = nativePools(file);
  const observed = [];

  for (let trial = 0; trial < trials; trial++) {
    const plain = words.flatMap(word => {
      const options = pools.get(word.length);
      assert.ok(options?.length);
      return options[Math.floor(random() * options.length)];
    });
    const cipher = encrypt(plain);
    assert.deepEqual(decrypt(cipher), plain, name + " exact roundtrip");
    observed.push({ plain: counts(plain), cipher: counts(cipher) });
  }

  const mean = (side, key) =>
    observed.reduce((sum, item) => sum + item[side][key], 0) / trials;
  const sum = (side, key) =>
    observed.reduce((total, item) => total + item[side][key], 0);

  assert.deepEqual(
    [sum("plain", "adjacent"), sum("cipher", "adjacent")],
    expected[name].adjacent
  );
  assert.deepEqual(
    [sum("plain", "lag5"), sum("cipher", "lag5")],
    expected[name].lag5
  );
  assert.ok(Math.abs(
    mean("cipher", "leadingZeroShare") - expected[name].encodedShare
  ) < 1e-15);

  const plain = {
    adjacent: mean("plain", "adjacent"),
    lag5: mean("plain", "lag5"),
    leadingZeroShare: mean("plain", "leadingZeroShare")
  };
  const cipher = {
    adjacent: mean("cipher", "adjacent"),
    lag5: mean("cipher", "lag5"),
    leadingZeroShare: mean("cipher", "leadingZeroShare")
  };
  const pass = {
    adjacent: Math.abs(cipher.adjacent - target.adjacent) <
      Math.abs(plain.adjacent - target.adjacent),
    lag5: Math.abs(cipher.lag5 - target.lag5) <
      Math.abs(plain.lag5 - target.lag5),
    leadingZeroShare:
      Math.abs(cipher.leadingZeroShare - target.leadingZeroShare) <
      Math.abs(plain.leadingZeroShare - target.leadingZeroShare)
  };

  assert.deepEqual(pass, {
    adjacent: true,
    lag5: true,
    leadingZeroShare: true
  });
  controls.push({ name, plain, cipher, pass });
}

// The complete predeclared structural gate passes, so the original inverse may
// now be examined under the frozen rule.
const decoded = decrypt(original);
assert.deepEqual(encrypt(decoded), original);
assert.ok(Math.abs(ioc(original) - 0.03447839786450569) < 1e-15);
assert.ok(Math.abs(ioc(decoded) - 0.034556243505167686) < 1e-15);
const decodedStructure = counts(decoded);
assert.equal(decodedStructure.adjacent, 478);
assert.equal(decodedStructure.leadingZeroAdjacent, 114);
assert.ok(Math.abs(decodedStructure.leadingZeroShare - 114 / 478) < 1e-15);
assert.equal(decodedStructure.lag5, 99);
assert.equal(decodedStructure.sLag5, 12);
const changedPositions = decoded.reduce(
  (sum, value, index) => sum + Number(value !== original[index]), 0);
assert.equal(changedPositions, 549);

// Build the same source-native English dictionary register used by the project's
// lexical gates, then compare complete printed words without changing boundaries.
const dictionaryByLength = new Map();
for (const line of read("resources/control/english_wordfreq_textblob.txt")
  .split(/\r?\n/)) {
  const match = line.match(/^([A-Za-z]+)/);
  if (!match) continue;
  const encoded = encodeSourceNativeGP(match[1]);
  const key = encoded.join(",");
  if (!dictionaryByLength.has(encoded.length)) {
    dictionaryByLength.set(encoded.length, new Set());
  }
  dictionaryByLength.get(encoded.length).add(key);
}

let decodedOffset = 0;
const decodedWords = words.map(word => {
  const result = decoded.slice(decodedOffset, decodedOffset + word.length);
  decodedOffset += word.length;
  return result;
});
assert.equal(decodedOffset, decoded.length);

const isDictionaryWord = word =>
  dictionaryByLength.get(word.length)?.has(word.join(",")) || false;
const hitLengths = new Map();
let exactHits = 0;
let longestRun = 0;
let currentRun = 0;

for (const word of decodedWords) {
  if (isDictionaryWord(word)) {
    exactHits++;
    hitLengths.set(word.length, (hitLengths.get(word.length) || 0) + 1);
    currentRun++;
    longestRun = Math.max(longestRun, currentRun);
  } else {
    currentRun = 0;
  }
}

assert.equal(exactHits, 204);
assert.deepEqual(Object.fromEntries(hitLengths), {
  1: 77,
  2: 105,
  3: 18,
  4: 4
});
assert.equal(longestRun, 3);
assert.equal(Array.from(hitLengths.entries())
  .filter(([length]) => length >= 5)
  .reduce((sum, [, count]) => sum + count, 0), 0);

const renderWord = word => word.map(value => corpus.translit[value]).join("");
const decodedPrefixWords = decodedWords.slice(0, 12).map(renderWord);
assert.deepEqual(decodedPrefixWords, [
  "SHEOGMIAF", "SYENGC", "THJGAE", "FJOE", "ONN", "NEWBASOEOEINGU",
  "NNGITH", "HBNIA", "PBN", "EOJTH", "ANGYX", "BDP"
]);

console.log(JSON.stringify({
  model:
    "literal-leading-zero selects F; otherwise p50-low3 special; swap with previous ciphertext",
  source,
  controls,
  originalInverse: {
    exactForwardReencryption: true,
    originalIoC: ioc(original),
    decodedIoC: ioc(decoded),
    decodedStructure,
    changedPositions,
    changedFraction: changedPositions / decoded.length,
    exactNativeDictionaryWords: exactHits,
    hitLengths: Object.fromEntries(hitLengths),
    wordsLengthAtLeast5: 0,
    longestDictionaryRun: longestRun,
    firstTwelveWords: decodedPrefixWords
  },
  decision:
    "PASS frozen structural gate, FAIL blind native-language inverse"
}, null, 2));
