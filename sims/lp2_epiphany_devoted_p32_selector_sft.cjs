"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");
const tableTokens = grid.pages.flatMap((page) => page.tokens);
assert.equal(tableTokens.length, 256);

const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const out = [];
  for (let offset = 0; offset < normalized.length;) {
    const token = gpTokens.find((item) => normalized.startsWith(item.symbol, offset));
    assert.ok(token, "unmapped GP word " + word + " at " + offset);
    out.push(token.value);
    offset += token.symbol.length;
  }
  return out;
}

/** @param {string} word @returns {number} */
function gp0(word) {
  return gp(word).reduce((sum, value) => sum + value, 0);
}

/** @param {string} token @param {string} alphabet @returns {number|null} */
function decodeToken(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  if (high < 0 || low < 0) return null;
  return high * alphabet.length + low;
}

const clear = signed2016
  .slice(signed2016.indexOf("Hello."), signed2016.indexOf("-----BEGIN PGP SIGNATURE-----"))
  .replace(/\b[0-9A-F]{8}\b/g, "")
  .replace(/\b\d+\b/g, "");
const words = (clear.match(/[A-Za-z]+/g) || []).map((word) => word.toUpperCase());
assert.equal(words.length, 43);
assert.deepEqual(words.slice(5, 9), ["EPIPHANY", "SEEKS", "THE", "DEVOTED"]);

const signed = words.map((word, index) => ({index, word, gp0: gp0(word)}));
assert.equal(gp0("EPIPHANY"), 121);
assert.equal(gp0("DEVOTED"), 102);

const p32 = corpus.pages.find((page) => page.page === 32);
assert.ok(p32);
assert.equal(p32.indices.length, 121);
assert.equal(tableTokens[102], "0W");
assert.equal(decodeToken("0W", alphabet59), 32);
assert.equal(decodeToken("0W", alphabet60), 32);

const pageCounts = corpus.pages.map((page) => ({page: page.page, count: page.indices.length}));

/**
 * @param {0|1} addressOrigin
 * @param {59|60} radix
 * @param {0|1} pageOrigin
 * @returns {Array<object>}
 */
function audit(addressOrigin, radix, pageOrigin) {
  const alphabet = radix === 59 ? alphabet59 : alphabet60;
  const hits = [];

  for (const first of signed) {
    const candidatePages = pageCounts.filter((page) => page.count === first.gp0);
    if (!candidatePages.length) continue;

    for (const second of signed) {
      const address = second.gp0 - addressOrigin;
      if (address < 0 || address >= 256) continue;

      const value = decodeToken(tableTokens[address], alphabet);
      if (value === null) continue;
      const pageNumber = value - pageOrigin;

      for (const page of candidatePages) {
        if (page.page !== pageNumber) continue;
        hits.push({
          firstIndex: first.index,
          first: first.word,
          firstGp0: first.gp0,
          secondIndex: second.index,
          second: second.word,
          secondGp0: second.gp0,
          page: page.page,
          token: tableTokens[address],
          value,
          forward: first.index < second.index,
          gap: second.index - first.index,
        });
      }
    }
  }
  return hits;
}

const family = [];
for (const addressOrigin of /** @type {const} */ ([0, 1])) {
  for (const radix of /** @type {const} */ ([59, 60])) {
    for (const pageOrigin of /** @type {const} */ ([0, 1])) {
      family.push({
        addressOrigin,
        radix,
        pageOrigin,
        hits: audit(addressOrigin, radix, pageOrigin),
      });
    }
  }
}

const z59 = family.find((row) => row.addressOrigin === 0 && row.radix === 59 && row.pageOrigin === 0);
const z60 = family.find((row) => row.addressOrigin === 0 && row.radix === 60 && row.pageOrigin === 0);
assert.ok(z59 && z60);

assert.deepEqual(z59.hits, [{
  firstIndex: 5,
  first: "EPIPHANY",
  firstGp0: 121,
  secondIndex: 8,
  second: "DEVOTED",
  secondGp0: 102,
  page: 32,
  token: "0W",
  value: 32,
  forward: true,
  gap: 3,
}]);

assert.deepEqual(z60.hits, [
  {
    firstIndex: 4,
    first: "EMPTY",
    firstGp0: 92,
    secondIndex: 3,
    second: "LIES",
    secondGp0: 63,
    page: 51,
    token: "0p",
    value: 51,
    forward: false,
    gap: -1,
  },
  {
    firstIndex: 5,
    first: "EPIPHANY",
    firstGp0: 121,
    secondIndex: 8,
    second: "DEVOTED",
    secondGp0: 102,
    page: 32,
    token: "0W",
    value: 32,
    forward: true,
    gap: 3,
  },
]);

const forwardZeroOrigin = [...z59.hits, ...z60.hits].filter((hit) => hit.forward);
assert.ok(forwardZeroOrigin.every((hit) => hit.first === "EPIPHANY" && hit.second === "DEVOTED" && hit.page === 32));

const epiphanyDevotedConfigs = family.filter((row) =>
  row.hits.some((hit) => hit.first === "EPIPHANY" && hit.second === "DEVOTED" && hit.page === 32));
assert.deepEqual(epiphanyDevotedConfigs.map((row) => ({
  addressOrigin: row.addressOrigin,
  radix: row.radix,
  pageOrigin: row.pageOrigin,
})), [
  {addressOrigin: 0, radix: 59, pageOrigin: 0},
  {addressOrigin: 0, radix: 60, pageOrigin: 0},
]);

const oneOne = family.filter((row) => row.addressOrigin === 1 && row.pageOrigin === 1);
assert.ok(oneOne.every((row) =>
  row.hits.filter((hit) => hit.forward).every((hit) => hit.first === "EPIPHANY" && hit.second === "THE" && hit.page === 32)));

assert.equal(p32.indices.length, 11 * 11);
const topPrimeSum = p32.indices.slice(0, 11).reduce((sum, value) => sum + corpus.prime[value], 0);
const leftPrimeSum = Array.from({length: 11}, (_, row) => p32.indices[row * 11])
  .reduce((sum, value) => sum + corpus.prime[value], 0);
assert.equal(topPrimeSum, 563);
assert.equal(leftPrimeSum, 569);

console.log(JSON.stringify({
  status: "PASS",
  signedClause: words.slice(5, 9),
  epiphanyGp0: gp0("EPIPHANY"),
  devotedGp0: gp0("DEVOTED"),
  p32RuneCount: p32.indices.length,
  devotedAddressToken: tableTokens[102],
  devotedBase59: decodeToken(tableTokens[102], alphabet59),
  devotedBase60: decodeToken(tableTokens[102], alphabet60),
  family: family.map((row) => ({
    addressOrigin: row.addressOrigin,
    radix: row.radix,
    pageOrigin: row.pageOrigin,
    hits: row.hits,
  })),
  p32Axes: {topPrimeSum, leftPrimeSum},
  decision: "EPIPHANY / DEVOTED is a source-selected p32 handoff; traversal and cipher remain unresolved.",
}, null, 2));
