"use strict";

/**
 * Director #1422 bounded composite:
 * fixed zero->F p50 surface inverse, then K[i]=p50_byte[i mod256] mod29
 * under both additive signs, phase0 continuous. Predeclared before evaluation.
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
const original = corpus.pages.filter(page =>
  page.page <= 55 && page.indices.length).flatMap(page => page.indices);
assert.equal(original.length, 12956);

const special = [0, 2, 12, 21, 22, 25, 27, 28];

/** @param {number} v @param {number} a @param {number} b @returns {number} */
function swap(v, a, b) {
  if (a === b) return v;
  if (v === a) return b;
  if (v === b) return a;
  return v;
}

/** @param {number} control @returns {number} */
function marker(control) {
  return tokens[control][0] === "0" ? 0 : special[bytes[control] & 7];
}

/** @param {number[]} plain @returns {number[]} */
function outerEncrypt(plain) {
  const out = new Array(plain.length);
  out[0] = plain[0];
  for (let i = 1; i < plain.length; i++) {
    out[i] = swap(plain[i], out[i - 1], marker((i - 1) & 255));
  }
  return out;
}

/** @param {number[]} cipher @returns {number[]} */
function outerDecrypt(cipher) {
  const out = new Array(cipher.length);
  out[0] = cipher[0];
  for (let i = 1; i < cipher.length; i++) {
    out[i] = swap(cipher[i], cipher[i - 1], marker((i - 1) & 255));
  }
  return out;
}

/** @param {number} value @returns {number} */
function mod(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number[]} stream @returns {number} */
function ioc(stream) {
  const counts = new Uint32Array(29);
  for (const value of stream) counts[value]++;
  return Array.from(counts).reduce(
    (sum, count) => sum + count * (count - 1), 0) /
    (stream.length * (stream.length - 1));
}

const sourceText = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55).join("%")
  .replace(/\/\r?\n/g, "").replace(/[\r\n%]/g, "");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runePattern = new RegExp("[" + corpus.runes.join("") + "]+", "gu");
const wordShapes = (sourceText.match(runePattern) || []).map(word =>
  Array.from(word, rune => runeIndex.get(rune)));
assert.equal(wordShapes.length, 2896);

const dictionary = new Map();
for (const line of read("resources/control/english_wordfreq_textblob.txt")
  .split(/\r?\n/)) {
  const match = line.match(/^([A-Za-z]+)/);
  if (!match) continue;
  const encoded = encodeSourceNativeGP(match[1]);
  if (!dictionary.has(encoded.length)) dictionary.set(encoded.length, new Set());
  dictionary.get(encoded.length).add(encoded.join(","));
}

/**
 * @param {number[]} stream
 * @returns {{hits:number,longHits:number,maxRunRunes:number,byLength:Object}}
 */
function lexical(stream) {
  let offset = 0;
  let hits = 0;
  let longHits = 0;
  let currentRunes = 0;
  let maxRunRunes = 0;
  const byLength = {};

  for (const shape of wordShapes) {
    const length = shape.length;
    const word = stream.slice(offset, offset + length);
    offset += length;
    const hit = dictionary.get(length)?.has(word.join(",")) || false;
    if (!byLength[length]) byLength[length] = { total: 0, hits: 0 };
    byLength[length].total++;
    byLength[length].hits += Number(hit);

    if (hit) {
      hits++;
      longHits += Number(length >= 5);
      currentRunes += length;
      maxRunRunes = Math.max(maxRunRunes, currentRunes);
    } else {
      currentRunes = 0;
    }
  }
  assert.equal(offset, stream.length);
  return { hits, longHits, maxRunRunes, byLength };
}

const intermediate = outerDecrypt(original);
assert.deepEqual(outerEncrypt(intermediate), original);
assert.equal(intermediate.reduce(
  (sum, value, index) => sum + Number(value !== original[index]), 0), 549);

const expected = {
  "-1": {
    ioc: 0.03446046465017899,
    hits: 182,
    maxRunRunes: 4,
    byLengthHits: [62, 97, 20, 3]
  },
  "1": {
    ioc: 0.03444633256234413,
    hits: 198,
    maxRunRunes: 7,
    byLengthHits: [71, 99, 25, 3]
  }
};

const observed = [];
for (const sign of /** @type {const} */ ([-1, 1])) {
  const plain = intermediate.map((value, index) =>
    mod(value + sign * (bytes[index & 255] % 29)));
  const lex = lexical(plain);
  const target = expected[String(sign)];
  assert.ok(Math.abs(ioc(plain) - target.ioc) < 1e-15);
  assert.equal(lex.hits, target.hits);
  assert.equal(lex.longHits, 0);
  assert.equal(lex.maxRunRunes, target.maxRunRunes);
  assert.deepEqual([1, 2, 3, 4].map(length => lex.byLength[length].hits),
    target.byLengthHits);
  for (let length = 5; length <= 14; length++) {
    assert.equal(lex.byLength[length].hits, 0);
  }
  observed.push({
    sign,
    ioc: ioc(plain),
    dictionaryHits: lex.hits,
    length5PlusHits: lex.longHits,
    longestDictionaryRunRunes: lex.maxRunRunes
  });
}

// Full layered arithmetic positive.
const p57 = corpus.pages.find(page => page.page === 57).indices;
const positivePlain = Array.from(
  { length: original.length }, (_, index) => p57[index % p57.length]);
for (const sign of /** @type {const} */ ([-1, 1])) {
  const inner = positivePlain.map((value, index) =>
    mod(value - sign * (bytes[index & 255] % 29)));
  const outer = outerEncrypt(inner);
  const recoveredInner = outerDecrypt(outer);
  const recoveredPlain = recoveredInner.map((value, index) =>
    mod(value + sign * (bytes[index & 255] % 29)));
  assert.deepEqual(recoveredPlain, positivePlain);
}

console.log(JSON.stringify({
  model:
    "fixed zero-F surface inverse + direct phase0 p50 byte-mod29 additive key",
  intermediateIoC: ioc(intermediate),
  observed,
  positive: {
    runes: positivePlain.length,
    bothSignsExactLayeredRoundtrip: true
  },
  decision:
    "FAIL both signs: uniform IoC, zero native dictionary words of GP length >=5"
}, null, 2));
