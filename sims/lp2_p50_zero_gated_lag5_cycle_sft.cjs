"use strict";

/**
 * Director #1422: predeclared p50-gated reversible lag1 -> lag5 3-cycle gate.
 *
 * The model was frozen in issue #1422 before source-native controls were run.
 * It uses the source-natural 256-cell clock and the already frozen special
 * GP29 class [F,TH,EO,NG,OE,AE,IA,EA]. Literal leading-zero cells pass
 * through. Every other cell rotates the distinct state symbols
 * [C[i-1], C[i-5], special] and leaves all other runes unchanged.
 *
 * Gate rule: require the model to move both adjacent-repeat suppression and
 * within-word lag-five equality toward the original before inspecting any
 * unknown original inverse for language.
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

assert.equal(bytes.length, 256);
assert.equal(tokens.length, 256);
assert.equal(original.length, 12956);
assert.equal(words.length, 2896);
assert.deepEqual(words.flat(), original);

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
 * Rotate the distinct symbols in [a,b,r]. Forward is left rotation, inverse
 * is right rotation. Symbols outside the state tuple are unchanged.
 *
 * @param {number} value
 * @param {number} a
 * @param {number} b
 * @param {number} r
 * @param {boolean} inverse
 * @returns {number}
 */
function cycleValue(value, a, b, r, inverse) {
  const state = [];
  for (const item of [a, b, r]) {
    if (!state.includes(item)) state.push(item);
  }
  if (state.length < 2 || !state.includes(value)) return value;
  const index = state.indexOf(value);
  const step = inverse ? state.length - 1 : 1;
  return state[(index + step) % state.length];
}

/**
 * @param {number[]} plain
 * @returns {number[]}
 */
function encrypt(plain) {
  assert.equal(plain.length, original.length);
  const cipher = new Array(plain.length);
  for (let i = 0; i < plain.length; i++) {
    if (i < 5) {
      cipher[i] = plain[i];
      continue;
    }

    const control = (i - 1) & 255;
    if (tokens[control][0] === "0") {
      cipher[i] = plain[i];
      continue;
    }

    cipher[i] = cycleValue(
      plain[i],
      cipher[i - 1],
      cipher[i - 5],
      special[bytes[control] & 7],
      false
    );
  }
  return cipher;
}

/**
 * @param {number[]} cipher
 * @returns {number[]}
 */
function decrypt(cipher) {
  assert.equal(cipher.length, original.length);
  const plain = new Array(cipher.length);
  for (let i = 0; i < cipher.length; i++) {
    if (i < 5) {
      plain[i] = cipher[i];
      continue;
    }

    const control = (i - 1) & 255;
    if (tokens[control][0] === "0") {
      plain[i] = cipher[i];
      continue;
    }

    plain[i] = cycleValue(
      cipher[i],
      cipher[i - 1],
      cipher[i - 5],
      special[bytes[control] & 7],
      true
    );
  }
  return plain;
}

/**
 * @param {number[]} stream
 * @returns {{adjacent:number,leadingZeroAdjacent:number,lag5:number,sLag5:number}}
 */
function counts(stream) {
  let adjacent = 0;
  let leadingZeroAdjacent = 0;
  for (let i = 1; i < stream.length; i++) {
    if (pageAt[i] !== pageAt[i - 1] || stream[i] !== stream[i - 1]) continue;
    adjacent++;
    if (tokens[(i - 1) & 255][0] === "0") leadingZeroAdjacent++;
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
  return { adjacent, leadingZeroAdjacent, lag5, sLag5 };
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
assert.deepEqual(source, {
  adjacent: 86,
  leadingZeroAdjacent: 33,
  lag5: 104,
  sLag5: 11
});

const random = xorshift32(0x3301A518);
const trials = 48;
const corpora = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"]
];

const expectedSums = {
  Shakespeare: {
    plain: [21418, 5059, 5930, 900],
    cipher: [9505, 5086, 2798, 246]
  },
  Gibran: {
    plain: [20725, 5011, 5871, 1033],
    cipher: [10238, 5056, 3471, 307]
  },
  Emerson: {
    plain: [19809, 4697, 6355, 889],
    cipher: [9770, 4750, 3133, 236]
  }
};

const controls = [];
for (const [name, file] of corpora) {
  const pools = nativePools(file);
  const observed = [];

  for (let trial = 0; trial < trials; trial++) {
    const plain = words.flatMap(word => {
      const options = pools.get(word.length);
      assert.ok(options?.length, "missing source-matched length " + word.length);
      return options[Math.floor(random() * options.length)];
    });

    const cipher = encrypt(plain);
    assert.deepEqual(decrypt(cipher), plain, name + " exact planted roundtrip");
    observed.push({ plain: counts(plain), cipher: counts(cipher) });
  }

  const sum = (side, key) =>
    observed.reduce((total, item) => total + item[side][key], 0);
  const keys = ["adjacent", "leadingZeroAdjacent", "lag5", "sLag5"];
  const plainSums = keys.map(key => sum("plain", key));
  const cipherSums = keys.map(key => sum("cipher", key));

  assert.deepEqual(plainSums, expectedSums[name].plain);
  assert.deepEqual(cipherSums, expectedSums[name].cipher);

  controls.push({
    name,
    trials,
    plainMeans: Object.fromEntries(keys.map((key, index) =>
      [key, plainSums[index] / trials])),
    cipherMeans: Object.fromEntries(keys.map((key, index) =>
      [key, cipherSums[index] / trials]))
  });
}

// The predeclared structural gate fails before any original-language inverse.
// Adjacent repeats move down, but lag-five equalities also move down in all
// three independent source-native registers, opposite the required direction.
assert.ok(controls.every(row =>
  row.cipherMeans.adjacent < row.plainMeans.adjacent));
assert.ok(controls.every(row =>
  row.cipherMeans.lag5 < row.plainMeans.lag5));
assert.ok(controls.every(row =>
  row.cipherMeans.adjacent > source.adjacent));
assert.ok(controls.every(row =>
  row.cipherMeans.lag5 < source.lag5));

console.log(JSON.stringify({
  model: "leading-zero pass-through; otherwise rotate distinct [C1,C5,p50-low3 special]",
  source,
  controls,
  decision: "FAIL predeclared joint structural gate; original inverse language not inspected"
}, null, 2));
