"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const out = [];
  for (let candidate = 2; out.length < count; candidate += 1) {
    let prime = true;
    for (let divisor = 2; divisor * divisor <= candidate; divisor += 1) {
      if (candidate % divisor === 0) { prime = false; break; }
    }
    if (prime) out.push(candidate);
  }
  return out;
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const tokens = grid.pages.flatMap((page) => page.tokens);
const bytes = grid.pages.flatMap((page) => page.bytes);
const primes = firstPrimes(400);

/** @param {number} cardinal @returns {number} */
function T(cardinal) {
  return (primes[cardinal - 1] - 1) % 29;
}

const p23OriginalCardinals = [2, 6, 3, 5, 4, 5, 25, 23, 33];
const p23OriginalValues = p23OriginalCardinals.map(T);
const phrase = p23OriginalValues.map((value) => corpus.translit[value]).join("");
const phraseGp0 = p23OriginalValues.reduce((sum, value) => sum + value, 0);
assert.equal(phrase, "THEORIGINAL");
assert.equal(phraseGp0, 97);

const p23 = ink.pages.find((page) => page.page === 23);
assert.ok(p23);
assert.equal(p23.rune_count, 213);

const unknownRedRunes = ink.pages
  .filter((page) => page.page <= 55)
  .flatMap((page) => page.red_spans || [])
  .reduce((sum, span) => sum + span.length, 0);
assert.equal(unknownRedRunes, 213);

const addresses = [28, phraseGp0, p23.rune_count];
assert.deepEqual(addresses, [28, 97, 213]);
const values = addresses.map((address) => ({
  address,
  token: tokens[address],
  byte: bytes[address],
  divmod29: [Math.floor(bytes[address] / 29), bytes[address] % 29]
}));
assert.deepEqual(values, [
  { address: 28, token: "2U", byte: 150, divmod29: [5, 5] },
  { address: 97, token: "2U", byte: 150, divmod29: [5, 5] },
  { address: 213, token: "2U", byte: 150, divmod29: [5, 5] }
]);

const value150Addresses = bytes
  .map((value, address) => value === 150 ? address : null)
  .filter((address) => address !== null);
assert.deepEqual(value150Addresses, addresses);

const sourcePageRuneCountMatches = ink.pages
  .filter((page) => page.page <= 55 && page.page !== 50 && page.rune_count < 256)
  .filter((page) => bytes[page.rune_count] === bytes[28])
  .map((page) => ({ page: page.page, runeCount: page.rune_count }));
assert.deepEqual(sourcePageRuneCountMatches, [{ page: 23, runeCount: 213 }]);

const multiplicities = new Map();
for (const value of bytes) multiplicities.set(value, (multiplicities.get(value) || 0) + 1);
const histogram = {};
for (const multiplicity of multiplicities.values()) {
  histogram[multiplicity] = (histogram[multiplicity] || 0) + 1;
}
assert.deepEqual(histogram, { 1: 92, 2: 49, 3: 14, 4: 6 });

const pairAssignments = [...multiplicities.values()]
  .reduce((sum, n) => sum + n * (n - 1), 0);
const tripleAssignments = [...multiplicities.values()]
  .reduce((sum, n) => sum + n * (n - 1) * (n - 2), 0);
const pairCollisionRate = pairAssignments / (256 * 255);
const tripleCollisionRate = tripleAssignments / (256 * 255 * 254);

const eligiblePageTotals = ink.pages
  .filter((page) => page.page <= 55 && page.page !== 50 && page.rune_count < 256)
  .map((page) => ({ page: page.page, runeCount: page.rune_count }));
const physicalPageAddresses = Array.from({ length: 58 }, (_, page) => page)
  .filter((page) => page !== 50);

/** @param {number} shift @returns {{sourcePages:number,totalEdges:number,rows:object[]}} */
function pageTotalAliasAtShift(shift) {
  const shiftedByte = (address) => bytes[(address + shift) % bytes.length];
  const rows = [];
  let totalEdges = 0;
  for (const source of eligiblePageTotals) {
    const peers = physicalPageAddresses
      .filter((page) => shiftedByte(source.runeCount) === shiftedByte(page));
    if (peers.length > 0) {
      rows.push({ ...source, peers });
      totalEdges += peers.length;
    }
  }
  return { sourcePages: rows.length, totalEdges, rows };
}

const observedPageTotalAliases = pageTotalAliasAtShift(0);
assert.deepEqual(observedPageTotalAliases, {
  sourcePages: 5,
  totalEdges: 7,
  rows: [
    { page: 8, runeCount: 255, peers: [37, 40, 55] },
    { page: 23, runeCount: 213, peers: [28] },
    { page: 32, runeCount: 121, peers: [5] },
    { page: 49, runeCount: 66, peers: [27] },
    { page: 55, runeCount: 76, peers: [33] }
  ]
});

const cyclicAliases = Array.from({ length: 256 }, (_, shift) => pageTotalAliasAtShift(shift));
const cyclicSourceTail = cyclicAliases.filter(
  (row) => row.sourcePages >= observedPageTotalAliases.sourcePages
).length;
const cyclicEdgeTail = cyclicAliases.filter(
  (row) => row.totalEdges >= observedPageTotalAliases.totalEdges
).length;
assert.equal(cyclicSourceTail, 118);
assert.equal(cyclicEdgeTail, 48);

const conditionalThirdPeerRate = 1 / 254;

console.log(JSON.stringify({
  status: "PASS",
  independentlyDerivedAddresses: {
    p28PhysicalPage: 28,
    gp0TheOriginal: phraseGp0,
    p23OriginalRuneCount: p23.rune_count,
    unknownRedRuneCount: unknownRedRunes
  },
  exactP50AliasClass: values,
  p23SourceControl: {
    pagesWhoseRuneCountSharesP28Token: sourcePageRuneCountMatches,
    fullPageTotalAliasFamily: observedPageTotalAliases,
    cyclicSourceTail: [cyclicSourceTail, 256],
    cyclicEdgeTail: [cyclicEdgeTail, 256],
    conditionalThirdPeerRate
  },
  p50Multiplicity: {
    distinctValues: multiplicities.size,
    histogram,
    exactValue150Addresses: value150Addresses,
    conditionalPairCollisionRate: pairCollisionRate,
    conditionalTripleCollisionRate: tripleCollisionRate
  },
  classification:
    "Post-discovery cross-object alias bridge. The conditional rates describe the fixed table multiplicity arrangement only and are not authorship probabilities. Duplicate-token navigation is not yet an authenticated operation."
}, null, 2));
