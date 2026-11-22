"use strict";

/**
 * SFT: p0 ROAD -> LEAD -> frozen ROAD endpoint closure.
 *
 * At the fixed p0 ROAD ciphertext receiver, enumerate every distinct
 * authenticated 2016 four-GP-rune target under four simple alphabet-number
 * conventions. Verify that ROAD/A1Z26 alone produces a key string whose GP0
 * address maps through the conventional base60 p50 table to offset 108,
 * the independently selected ROAD endpoint.
 *
 * Node.js 22, CommonJS, no third-party dependencies.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);
const tableBytes = grid.pages.flatMap((page) => page.bytes);

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/K/g, "C")
    .replace(/V/g, "U")
    .replace(/Q/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const out = [];
  for (let index = 0; index < normalized.length;) {
    const token = gpTokens.find((item) =>
      normalized.startsWith(item.symbol, index));
    assert.ok(token, "unmapped GP spelling in " + word + " at " + index);
    out.push(token.value);
    index += token.symbol.length;
  }
  return out;
}

/** @param {string} word @returns {number} */
function gp0(word) {
  return gp(word).reduce((sum, value) => sum + value, 0);
}

/**
 * @param {number[]} values
 * @param {"A1"|"A0"|"Z1"|"Z0"} mode
 * @returns {string|null}
 */
function numberedAlphabet(values, mode) {
  if (mode === "A1") {
    if (!values.every((value) => value >= 1 && value <= 26)) return null;
    return values.map((value) => String.fromCharCode(64 + value)).join("");
  }
  if (mode === "A0") {
    if (!values.every((value) => value >= 0 && value <= 25)) return null;
    return values.map((value) => String.fromCharCode(65 + value)).join("");
  }
  if (mode === "Z1") {
    if (!values.every((value) => value >= 1 && value <= 26)) return null;
    return values.map((value) => String.fromCharCode(91 - value)).join("");
  }
  if (!values.every((value) => value >= 0 && value <= 25)) return null;
  return values.map((value) => String.fromCharCode(90 - value)).join("");
}

const signedClear = signed2016
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\r?\n\r?\n/u)
  .slice(1)
  .join("\n");

const authenticatedTargets = [...new Set(
  signedClear
    .split(/[^A-Za-z]+/u)
    .filter(Boolean)
    .map((word) => word.toUpperCase())
    .filter((word) => gp(word).length === 4)
)];

assert.deepEqual(authenticatedTargets, [
  "LIES", "THEIR", "ROAD", "SEEK",
  "WILL", "GOOD", "LUCK", "PATHS",
]);

const roadCipher = [16, 8, 25, 27];
const modes = ["A1", "A0", "Z1", "Z0"];
const rows = [];

for (const target of authenticatedTargets) {
  const plain = gp(target);
  const key = roadCipher.map((value, index) =>
    (value - plain[index] + 29) % 29);

  for (const mode of modes) {
    const keyString = numberedAlphabet(key, mode);
    let keyGp0 = null;
    let tableByte = null;
    if (keyString !== null) {
      keyGp0 = gp0(keyString);
      if (keyGp0 < tableBytes.length) tableByte = tableBytes[keyGp0];
    }
    rows.push({
      target,
      mode,
      key,
      keyString,
      keyGp0,
      tableByte,
    });
  }
}

const gp71Hits = rows.filter((row) => row.keyGp0 === 71);
const endpointHits = rows.filter((row) => row.tableByte === 108);

assert.deepEqual(gp71Hits, [{
  target: "ROAD",
  mode: "A1",
  key: [12, 5, 1, 4],
  keyString: "LEAD",
  keyGp0: 71,
  tableByte: 108,
}]);
assert.deepEqual(endpointHits, gp71Hits);

assert.deepEqual(gp("ROAD"), [4, 3, 24, 23]);
assert.deepEqual(gp("LEAD"), [20, 28, 23]);
assert.equal(gp0("LEAD"), 71);
assert.equal(gp0("SEEKS"), 71);
assert.equal(tableBytes[71], 108);
assert.equal(tableBytes[20], 102);

assert.deepEqual(
  gp("ROAD").map((value, index) =>
    (value + [12, 5, 1, 4][index]) % 29),
  roadCipher
);

const dh = {a: 6, g: 5, K: 2, b: 15, A: 8};
assert.deepEqual([
  (dh.a * dh.K) % 29,
  dh.g,
  (dh.K * dh.b) % 29,
  (dh.b * dh.A) % 29,
], [12, 5, 1, 4]);

console.log(JSON.stringify({
  status: "PASS",
  frozenReceiver: {
    cipher: roadCipher,
    plaintext: "ROAD",
    offsets: [105, 108],
    upstreamDirections: {
      SEEKS: {gp0: 71, p50Base60: 108},
      THE: {gp0: 20, p50Base60: 102},
    },
  },
  closure: {
    additiveKey: [12, 5, 1, 4],
    A1Z26: "LEAD",
    leadGp: gp("LEAD"),
    leadGp0: gp0("LEAD"),
    seeksGp0: gp0("SEEKS"),
    p50Base60: tableBytes[gp0("LEAD")],
    endpoint: 108,
    dhFactorization: "[a*K,g,K*b,b*A] mod29",
  },
  control: {
    authenticatedFourRuneTargets: authenticatedTargets,
    modes,
    combinations: rows.length,
    gp71Hits,
    endpointHits,
  },
  classification:
    "Bounded post-discovery self-consistency closure. ROAD/A1Z26 alone in the fixed 32-case authenticated-source family returns the independently selected ROAD endpoint.",
}, null, 2));
