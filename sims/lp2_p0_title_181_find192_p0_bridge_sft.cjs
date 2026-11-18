"use strict";

/**
 * P0 title checksum bridge.
 *
 * Original ciphertext heading:
 *   GP0(first 13 p0 runes) = 181 = prime #42.
 *   GP0(FIND) = 42 -> p50[42] = 0S -> physical p28.
 *
 * Conditional plaintext heading:
 *   GP0(EPIPHANY SEEKS) = 192.
 *   p50[192] = 00 -> physical p0.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(
  fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8")
);
const grid = JSON.parse(
  fs.readFileSync(path.join(root, "resources/liber-primus/lp2-grid-256.json"), "utf8")
);
const signed = fs.readFileSync(
  path.join(root, "resources/historical/cicada2016-4gq25-outguess.asc"),
  "utf8"
);

const p0 = corpus.pages.find((page) => page.page === 0).indices;
const tokens = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");

const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {string} text @returns {number[]} */
function gp(text) {
  const normalized = text
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/K/g, "C")
    .replace(/V/g, "U")
    .replace(/Q/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const out = [];
  for (let i = 0; i < normalized.length;) {
    const token = gpTokens.find((item) => normalized.startsWith(item.symbol, i));
    assert.ok(token);
    out.push(token.value);
    i += token.symbol.length;
  }
  return out;
}

/** @param {number[]} values @returns {number} */
function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

/** @param {string} token @param {string} alphabet @returns {number} */
function decode(token, alphabet) {
  return alphabet.indexOf(token[0]) * alphabet.length + alphabet.indexOf(token[1]);
}

/** @param {number} n @returns {boolean} */
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d += 1) {
    if (n % d === 0) return false;
  }
  return true;
}

/** @param {number} n @returns {number} */
function primePi(n) {
  let count = 0;
  for (let value = 2; value <= n; value += 1) {
    if (isPrime(value)) count += 1;
  }
  return count;
}

assert.equal(p0.length, 262);
assert.equal(sum(p0.slice(0, 13)), 181);
assert.equal(isPrime(181), true);
assert.equal(primePi(181), 42);

assert.equal(sum(gp("FIND")), 42);
assert.equal(tokens[42], "0S");
assert.equal(decode(tokens[42], alphabet59), 28);
assert.equal(decode(tokens[42], alphabet60), 28);

const title = gp("EPIPHANY SEEKS");
assert.equal(title.length, 13);
assert.equal(sum(title), 192);
assert.equal(tokens[192], "00");
assert.equal(decode(tokens[192], alphabet59), 0);
assert.equal(decode(tokens[192], alphabet60), 0);

const body = signed
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .replace(/^-----BEGIN PGP SIGNED MESSAGE-----[\s\S]*?Hash: SHA1\s*/, "")
  .replace(/\b3301\b/g, "")
  .replace(/\b[0-9A-F]{8,}\b/g, "");
const words = (body.match(/[A-Za-z]+/g) || []).map((text, index) => {
  const values = gp(text);
  return {
    index,
    text: text.toUpperCase(),
    gp0: sum(values),
    length: values.length,
  };
});
assert.equal(words.length, 43);

const pairs = [];
for (let i = 0; i < words.length - 1; i += 1) {
  const left = words[i];
  const right = words[i + 1];
  if (left.gp0 + right.gp0 === 192) {
    pairs.push({
      index: i,
      phrase: left.text + " " + right.text,
      lengths: [left.length, right.length],
    });
  }
}
assert.deepEqual(pairs, [
  { index: 5, phrase: "EPIPHANY SEEKS", lengths: [8, 5] },
]);

console.log(JSON.stringify({
  status:
    "PASS: p0 ciphertext title sum181 -> prime#42 -> FIND -> p28; conditional plaintext title sum192 -> 00 -> p0",
  ciphertext: { gp0: 181, primeOrdinal: 42, selector: "FIND", page: 28 },
  plaintext: { phrase: "EPIPHANY SEEKS", gp0: 192, token: "00", page: 0 },
  signedPair: pairs[0],
}, null, 2));
