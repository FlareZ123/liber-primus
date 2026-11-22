"use strict";

/**
 * SFT: aggregate p0 crib-key sums in the original p50 direct-byte graph.
 *
 * This tests a compact architecture clue only. It does not claim that p50's
 * direct-byte graph generates the per-rune additive keys.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const grid = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-grid-256.json"), "utf8"));
const signed = fs.readFileSync(
  path.join(root, "resources", "historical", "cicada2016-4gq25-outguess.asc"), "utf8");

const p0 = corpus.pages.find((page) => page.page === 0).indices;
const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/K/g, "C").replace(/V/g, "U")
    .replace(/Q/g, "C").replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const out = [];
  for (let i = 0; i < normalized.length;) {
    const token = gpTokens.find((item) => normalized.startsWith(item.symbol, i));
    assert.ok(token, "unmapped GP spelling at " + word + ":" + i);
    out.push(token.value);
    i += token.symbol.length;
  }
  return out;
}

/** @param {number[]} xs @returns {number} */
const sum = (xs) => xs.reduce((a, b) => a + b, 0);

/** @param {number} start @param {string} plaintext @returns {number[]} */
function additiveKey(start, plaintext) {
  const plain = plaintext.split(/\s+/).flatMap(gp);
  const cipher = p0.slice(start, start + plain.length);
  assert.equal(cipher.length, plain.length);
  return cipher.map((value, i) => (value - plain[i] + 29) % 29);
}

/** @returns {string[]} */
function signedWords() {
  const clear = signed
    .split("-----BEGIN PGP SIGNATURE-----")[0]
    .split(/\r?\n\r?\n/)
    .slice(1)
    .join("\n");
  return clear.split(/[^A-Za-z0-9]+/)
    .filter((token) => /^[A-Za-z]+$/.test(token));
}

/** @param {number} start @returns {number[]} */
function orbit(start) {
  const out = [];
  const seen = new Set();
  let x = start;
  while (!seen.has(x)) {
    seen.add(x);
    out.push(x);
    x = grid.bytes[x];
  }
  return out;
}

const titleKey = additiveKey(0, "EPIPHANY SEEKS");
const roadKey = additiveKey(103, "THE ROAD");
const devotedPhraseKey = additiveKey(235, "THE DEVOTED");
const devotedWordKey = additiveKey(237, "DEVOTED");
const willKey = additiveKey(141, "WILL");

assert.deepEqual(titleKey, [26,24,8,19,27,24,18,3,0,8,0,16,19]);
assert.deepEqual(roadKey, [6,23,12,5,1,4]);
assert.deepEqual(devotedPhraseKey, [6,16,21,4,15,19,5,12,10]);
assert.deepEqual(devotedWordKey, [21,4,15,19,5,12,10]);
assert.deepEqual(willKey, [12,6,18,27]);

const sums = {
  title: sum(titleKey),
  roadPhrase: sum(roadKey),
  devotedPhrase: sum(devotedPhraseKey),
  devotedWord: sum(devotedWordKey),
  will: sum(willKey),
};
assert.deepEqual(sums, {
  title: 192,
  roadPhrase: 51,
  devotedPhrase: 108,
  devotedWord: 86,
  will: 63,
});

const message = signedWords();
assert.equal(message.length, 43);
const rows = message.map((word, index) => {
  const values = gp(word);
  const gp0 = sum(values);
  return {index, word: word.toUpperCase(), values, gp0, target: grid.bytes[gp0]};
});

function row(word) {
  const hits = rows.filter((item) => item.word === word);
  assert.ok(hits.length >= 1, "missing signed word " + word);
  return hits[0];
}
assert.equal(row("LIES").gp0, 63);
assert.equal(row("LIES").target, 51);
assert.equal(row("SEEKS").gp0, 71);
assert.equal(row("SEEKS").target, 108);
assert.equal(row("WORDS").gp0, 52);
assert.equal(row("WORDS").target, 86);

// The two body phrase shapes are each unique among adjacent source pairs.
const adjacent24 = [];
const adjacent27 = [];
for (let i = 0; i < rows.length - 1; i += 1) {
  const pair = rows.slice(i, i + 2);
  const lengths = pair.map((item) => item.values.length);
  if (lengths[0] === 2 && lengths[1] === 4) adjacent24.push(pair.map((x) => x.word).join(" "));
  if (lengths[0] === 2 && lengths[1] === 7) adjacent27.push(pair.map((x) => x.word).join(" "));
}
assert.deepEqual(adjacent24, ["THE ROAD"]);
assert.deepEqual(adjacent27, ["THE DEVOTED"]);

// The direct-byte graph joins all aggregate states at title sum 192.
const willOrbit = orbit(sums.will);
const roadOrbit = orbit(sums.roadPhrase);
const devotedOrbit = orbit(sums.devotedPhrase);
const titleOrbit = orbit(sums.title);

assert.equal(grid.bytes[63], 51);
assert.equal(willOrbit.indexOf(51), 1);
assert.equal(willOrbit.indexOf(192), 15);
assert.equal(willOrbit.indexOf(0), 16);
assert.equal(roadOrbit.indexOf(192), 14);
assert.equal(roadOrbit.indexOf(0), 15);
assert.equal(devotedOrbit.indexOf(192), 25);
assert.equal(devotedOrbit.indexOf(0), 26);
assert.equal(titleOrbit[0], 192);
assert.equal(titleOrbit[1], 0);
assert.equal(grid.bytes[192], 0);

console.log(JSON.stringify({
  aggregate_key_sums: sums,
  exact_signed_pointer_links: {
    LIES: {gp0: row("LIES").gp0, p50_target: row("LIES").target},
    SEEKS: {gp0: row("SEEKS").gp0, p50_target: row("SEEKS").target},
    WORDS: {gp0: row("WORDS").gp0, p50_target: row("WORDS").target},
  },
  unique_adjacent_shapes: {
    two_four: adjacent24,
    two_seven: adjacent27,
  },
  direct_byte_graph: {
    WILL_63: {to_51:1, to_192:15, to_0:16},
    ROAD_51: {to_192:14, to_0:15},
    DEVOTED_108: {to_192:25, to_0:26},
    TITLE_192: {to_0:1},
  },
  decision: "aggregate key sums occupy one source-selected p50 graph component; per-rune generator remains unknown",
}, null, 2));
