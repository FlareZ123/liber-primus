"use strict";

/**
 * Director #1422: predeclared p50 moving-exception sparse-transposition gate.
 *
 * Leading-zero control cells are identity. Every other state swaps only the
 * previous ciphertext rune and the p50-low3-selected source-visible special
 * rune [F,TH,EO,NG,OE,AE,IA,EA]. The other 27 GP29 symbols are unchanged.
 *
 * The structural gate was frozen on issue #1422 before evaluation. Only if all
 * three source-native control registers move closer to the original for
 * adjacent repeats, within-word lag5 equality, AND leading-zero repeat share
 * may the original inverse be inspected for language.
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
 * @param {number[]} plain
 * @returns {number[]}
 */
function encrypt(plain) {
  assert.equal(plain.length, original.length);
  const cipher = new Array(plain.length);
  cipher[0] = plain[0];

  for (let i = 1; i < plain.length; i++) {
    const control = (i - 1) & 255;
    if (tokens[control][0] === "0") {
      cipher[i] = plain[i];
      continue;
    }
    cipher[i] = swap(
      plain[i],
      cipher[i - 1],
      special[bytes[control] & 7]
    );
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
    if (tokens[control][0] === "0") {
      plain[i] = cipher[i];
      continue;
    }
    plain[i] = swap(
      cipher[i],
      cipher[i - 1],
      special[bytes[control] & 7]
    );
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

const target = {
  adjacent: source.adjacent,
  lag5: source.lag5,
  leadingZeroShare: source.leadingZeroShare
};
const random = xorshift32(0x3301A518);
const trials = 48;
const expected = {
  Shakespeare: {
    adjacent: [21418, 9096],
    lag5: [5930, 5705],
    encodedShareMean: 0.5546452892747379
  },
  Gibran: {
    adjacent: [20725, 9778],
    lag5: [5871, 5660],
    encodedShareMean: 0.5137621199763371
  },
  Emerson: {
    adjacent: [19809, 9330],
    lag5: [6355, 6244],
    encodedShareMean: 0.506294149408704
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
    mean("cipher", "leadingZeroShare") - expected[name].encodedShareMean
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
  controls.push({ name, plain, cipher, pass });
}

assert.deepEqual(controls.map(row => row.pass), [
  { adjacent: true, lag5: true, leadingZeroShare: false },
  { adjacent: true, lag5: true, leadingZeroShare: true },
  { adjacent: true, lag5: true, leadingZeroShare: true }
]);

// Predeclared all-three-register gate therefore fails. The deterministic
// original inverse is intentionally not scored or printed as candidate text.
assert.equal(controls.every(row =>
  row.pass.adjacent && row.pass.lag5 && row.pass.leadingZeroShare), false);

console.log(JSON.stringify({
  model: "leading-zero identity; otherwise swap previous-C with p50-low3 special",
  source,
  controls,
  decision:
    "FAIL predeclared all-three structural gate; original inverse language not inspected"
}, null, 2));
