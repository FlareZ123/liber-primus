"use strict";

/**
 * P50 DIVINITY-ring inward 4-byte destination hypothesis.
 *
 * This is a geometry/value reproduction only. It does not assert that the
 * resulting four bytes are an intended IP address.
 *
 * Run:
 *   node sims/lp2_p50_divinity_inward_ipv4_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const tokens = grid.pages.flatMap((page) => page.tokens);
const bytes = grid.pages.flatMap((page) => page.bytes);
const alphabet59 = grid.alphabet.replace("f", "");

/** @param {string} token */
function decode59(token) {
  const high = alphabet59.indexOf(token[0]);
  const low = alphabet59.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return high * 59 + low;
}

/** @param {number[]} word */
function gp0(word) {
  return word.reduce((sum, value) => sum + value, 0);
}

/** @param {number[]} word */
function spell(word) {
  return word.map((value) => corpus.translit[value]).join("");
}

/** @param {string} text */
function runeWords(text) {
  return (text.match(/[\u16A0-\u16FF]+/gu) || []).map((word) =>
    [...word].map((rune) => {
      const value = runeIndex.get(rune);
      assert.notEqual(value, undefined);
      return value;
    })
  );
}

const p57 = solved.sections.find((section) => section.name === "p57_parable");
assert.ok(p57);
const p57Words = runeWords(p57.source_text);
const divinity = p57Words.find((word) => spell(word) === "DIUINITY");
assert.ok(divinity);
assert.equal(gp0(divinity), 105);

assert.deepEqual(
  grid.pages.map((page) => [page.page, page.rows, page.cols, page.tokens.length]),
  [[49, 10, 8, 80], [50, 13, 8, 104], [51, 9, 8, 72]]
);
assert.equal(tokens.length, 256);
assert.equal(bytes.length, 256);
assert.ok(bytes.every((value) => Number.isInteger(value) && value >= 0 && value <= 255));

const address = gp0(divinity);
const width = 8;
const height = 32;
const row = Math.floor(address / width);
const column = address % width;
const ringOrdinal = Math.min(row, height - 1 - row, column, width - 1 - column) + 1;

assert.deepEqual({ address, row, column, ringOrdinal }, {
  address: 105,
  row: 13,
  column: 1,
  ringOrdinal: 2,
});
assert.equal(tokens[address], "13");

/*
 * Manuscript-native DH23 supplies K=2, so ring ordinal 2 is the twice-shed
 * circumference. Moving one cell inward from column1 enters the K=2 core at
 * columns2..5. Its width4 also equals rune length(FIND).
 */
const K = 2;
assert.equal(ringOrdinal, K);
const inwardAddresses = [2, 3, 4, 5].map((coreColumn) => row * width + coreColumn);
assert.deepEqual(inwardAddresses, [106, 107, 108, 109]);
assert.deepEqual(inwardAddresses.map((i) => tokens[i]), ["0V", "3c", "0E", "34"]);

const nativeBytes = inwardAddresses.map((i) => bytes[i]);
const base59Bytes = inwardAddresses.map((i) => decode59(tokens[i]));
assert.deepEqual(nativeBytes, [31, 218, 14, 184]);
assert.deepEqual(base59Bytes, [31, 215, 14, 181]);
assert.ok(nativeBytes.every((value) => value <= 255));
assert.ok(base59Bytes.every((value) => value <= 255));

const nativeIpv4 = nativeBytes.join(".");
const base59Ipv4 = base59Bytes.join(".");
assert.equal(nativeIpv4, "31.218.14.184");
assert.equal(base59Ipv4, "31.215.14.181");

/*
 * Important control: every canonical base60 table value is byte-valid. IPv4
 * syntax therefore provides no evidence on its own; the evidence is solely
 * the prior DIVINITY address, K=2 ring and inward four-cell selection.
 */
assert.equal(Math.max(...bytes), 255);
assert.equal(Math.min(...bytes), 0);

console.log(JSON.stringify({
  status: "PASS: DIVINITY105 sits on ring2 and its inward K2-core row is four native bytes",
  source: {
    divinityGp0: address,
    token: tokens[address],
    coordinate: [row, column],
    ringOrdinal,
    K,
  },
  inward: {
    addresses: inwardAddresses,
    tokens: inwardAddresses.map((i) => tokens[i]),
    nativeBytes,
    nativeIpv4,
    base59Bytes,
    base59Ipv4,
  },
  caution: "all canonical base60 table values are 0..255, so IPv4 syntax is generic",
}, null, 2));
