"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const raw = read("resources/lp2-transcription.txt");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runePattern = /[\u16A0-\u16FF]/u;
const tape = grid.pages.flatMap((page) => page.tokens);
const alpha59 = grid.alphabet.replace("f", "");
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {number[]} values @returns {number|null} */
function recursiveCore(values) {
  let layer = values.slice();
  while (layer.length > 1) layer = layer.slice(1, -1);
  return layer.length ? layer[0] : null;
}

/** @param {number[][]} words @returns {{cores:number[], gp0:number}} */
function coreSignature(words) {
  const cores = words.map(recursiveCore).filter((value) => value !== null);
  return { cores, gp0: cores.reduce((sum, value) => sum + value, 0) };
}

/** @param {number} address @returns {number|null} */
function base59(address) {
  if (address < 0 || address >= tape.length) return null;
  const token = tape[address];
  return 59 * alpha59.indexOf(token[0]) + alpha59.indexOf(token[1]);
}

/** @param {string} word @returns {number} */
function gp0(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/[KQ]/g, "C")
    .replace(/V/g, "U")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const values = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      values.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      values.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset));
    assert.ok(token, `unmapped GP token in ${word} at ${offset}`);
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values.reduce((sum, value) => sum + value, 0);
}

const segments = raw.split("%").slice(0, 55);
const stream = segments.join("%");

/** @typedef {{page:number,value:number}[]} Word */
/** @type {Word[]} */
const words = [];
/** @type {{page:number,value:number}[]} */
let current = [];
let runePage = 0;

function finishWord() {
  if (!current.length) return;
  words.push(current);
  current = [];
}

for (const character of stream) {
  if (runePattern.test(character)) {
    current.push({ page: runePage, value: runeIndex.get(character) });
  } else if (character === "%") {
    runePage += 1;
  } else if (character === "/" || /\s/u.test(character)) {
    // Printed line wrapping preserves a word.
  } else {
    finishWord();
  }
}
finishWord();

/** @param {number} page @returns {number} */
function physicalPage(page) {
  return page >= 50 ? page + 1 : page;
}

/** @type {Map<number, number[][]>} */
const completeWords = new Map();
for (let page = 0; page < segments.length; page += 1) {
  completeWords.set(
    physicalPage(page),
    words
      .filter((word) => word[0].page === page && word[word.length - 1].page === page)
      .map((word) => word.map((site) => site.value)),
  );
}
completeWords.set(50, []);

const sourceStart = signed.indexOf("Hello.");
const sourceEnd = signed.indexOf("-----BEGIN PGP SIGNATURE-----");
const sourceWords = signed
  .slice(sourceStart, sourceEnd)
  .replace(/\b7A35090F\b/g, "")
  .match(/[A-Za-z]+/g)
  .map((word) => word.toUpperCase());

/** @type {Map<number, string[]>} */
const sourceByGp0 = new Map();
for (const word of sourceWords) {
  const value = gp0(word);
  if (!sourceByGp0.has(value)) sourceByGp0.set(value, []);
  sourceByGp0.get(value).push(word);
}

assert.deepEqual(sourceByGp0.get(112), ["DIRECTION"]);

// Full 43-word signed-message -> fixed p50/base59 -> physical-scan register.
const scanRegister = sourceWords.map((word, index) => {
  const address = gp0(word);
  const token = address >= 0 && address < tape.length ? tape[address] : null;
  const value = token === null ? null : base59(address);
  const scan = value !== null && value >= 17 && value <= 74 ? value : null;
  return {
    ordinal: index + 1,
    word,
    gp0: address,
    token,
    base59: value,
    scan,
    page: scan === null ? null : scan - 17,
  };
});
assert.equal(scanRegister.length, 43);
const scanHits = scanRegister.filter((row) => row.scan !== null);
assert.deepEqual(
  scanHits.map(({ word, gp0: address, token, base59: value, scan, page }) =>
    ({ word, gp0: address, token, base59: value, scan, page })),
  [
    { word: "HELLO", gp0: 69, token: "1D", base59: 72, scan: 72, page: 55 },
    { word: "LIES", gp0: 63, token: "0p", base59: 50, scan: 50, page: 33 },
    { word: "DEVOTED", gp0: 102, token: "0W", base59: 32, scan: 32, page: 15 },
    { word: "LIBER", gp0: 69, token: "1D", base59: 72, scan: 72, page: 55 },
    { word: "DIRECTION", gp0: 112, token: "1D", base59: 72, scan: 72, page: 55 },
    { word: "BE", gp0: 35, token: "0d", base59: 39, scan: 39, page: 22 },
    { word: "FOUND", gp0: 36, token: "0s", base59: 53, scan: 53, page: 36 },
    { word: "GOOD", gp0: 35, token: "0d", base59: 39, scan: 39, page: 22 },
    { word: "VERIFY", gp0: 59, token: "19", base59: 68, scan: 68, page: 51 },
  ],
);
const addressMultiplicity = new Map();
for (const row of scanRegister) {
  addressMultiplicity.set(row.gp0, (addressMultiplicity.get(row.gp0) || 0) + 1);
}
assert.equal(addressMultiplicity.size, 27);
const collisionRows = [...addressMultiplicity.entries()]
  .filter(([, count]) => count > 1)
  .sort((a, b) => a[0] - b[0])
  .map(([address, count]) => ({ address, count }));
assert.equal(scanRegister.length - addressMultiplicity.size, 16);

const cellValues = tape.map((token) =>
  59 * alpha59.indexOf(token[0]) + alpha59.indexOf(token[1])
);
const N = tape.length;
const K = cellValues.filter((value) => value >= 17 && value <= 74).length;
const U = addressMultiplicity.size;
assert.equal(N, 256);
assert.equal(K, 63);
assert.equal(new Set(cellValues).size, 161);
assert.equal(Math.min(...cellValues), 0);
assert.equal(Math.max(...cellValues), 251);
assert.equal(new Set(cellValues.filter((value) => value >= 17 && value <= 74)).size, 37);

function binom(n, k) {
  if (k < 0 || k > n) return 0n;
  k = Math.min(k, n - k);
  let result = 1n;
  for (let i = 1; i <= k; i += 1) {
    result = result * BigInt(n - k + i) / BigInt(i);
  }
  return result;
}

// Null: randomly permute the exact 256 decoded values over address slots,
// while holding the 27 GP0 addresses and their 43-word multiplicities fixed.
let weightedSubsetWays = Array.from({ length: U + 1 }, () => Array(44).fill(0n));
weightedSubsetWays[0][0] = 1n;
for (const weight of addressMultiplicity.values()) {
  const next = weightedSubsetWays.map((row) => row.slice());
  for (let hitAddresses = 0; hitAddresses < U; hitAddresses += 1) {
    for (let wordHits = 0; wordHits <= 43 - weight; wordHits += 1) {
      if (weightedSubsetWays[hitAddresses][wordHits] !== 0n) {
        next[hitAddresses + 1][wordHits + weight] +=
          weightedSubsetWays[hitAddresses][wordHits];
      }
    }
  }
  weightedSubsetWays = next;
}
const weightedWordHitWays = Array(44).fill(0n);
for (let hitAddresses = 0; hitAddresses <= U; hitAddresses += 1) {
  for (let wordHits = 0; wordHits <= 43; wordHits += 1) {
    weightedWordHitWays[wordHits] += weightedSubsetWays[hitAddresses][wordHits]
      * binom(N - U, K - hitAddresses);
  }
}
const totalWordNullWays = binom(N, K);
assert.equal(weightedWordHitWays.reduce((a, b) => a + b, 0n), totalWordNullWays);
const observedWordHits = scanHits.length;
const observedAddressHits = new Set(scanHits.map((row) => row.gp0)).size;
const observedPageCount = new Set(scanHits.map((row) => row.page)).size;
const expectedWordHits = weightedWordHitWays.reduce(
  (sum, ways, hits) => sum + (Number(ways) / Number(totalWordNullWays)) * hits, 0
);
const pWordHitsAtLeastObserved = weightedWordHitWays
  .slice(observedWordHits)
  .reduce((sum, ways) => sum + Number(ways), 0) / Number(totalWordNullWays);

const addressHitWays = Array(U + 1).fill(0n);
for (let hits = 0; hits <= U; hits += 1) {
  addressHitWays[hits] = binom(U, hits) * binom(N - U, K - hits);
}
const totalAddressNullWays = binom(N, K);
const expectedAddressHits = addressHitWays.reduce(
  (sum, ways, hits) => sum + (Number(ways) / Number(totalAddressNullWays)) * hits, 0
);
const pAddressHitsAtLeastObserved = addressHitWays
  .slice(observedAddressHits)
  .reduce((sum, ways) => sum + Number(ways), 0) / Number(totalAddressNullWays);

// Exact null for distinct scan pages: sample 27 table outputs without replacement,
// preserve the multiplicity of every decoded value, and count distinct values 17..74.
const valueFrequency = new Map();
for (const value of cellValues) valueFrequency.set(value, (valueFrequency.get(value) || 0) + 1);
const inRangeFrequencies = Array.from({ length: 58 }, (_, index) =>
  valueFrequency.get(index + 17) || 0
);
const outOfRangeCells = N - K;
let pageWaysDp = Array.from({ length: U + 1 }, () => Array(59).fill(0n));
pageWaysDp[0][0] = 1n;
function addValueGroup(frequency, isInRange) {
  const next = Array.from({ length: U + 1 }, () => Array(59).fill(0n));
  for (let selected = 0; selected <= U; selected += 1) {
    for (let distinct = 0; distinct <= 58; distinct += 1) {
      const prior = pageWaysDp[selected][distinct];
      if (prior === 0n) continue;
      for (let take = 0; take <= Math.min(frequency, U - selected); take += 1) {
        const nextDistinct = distinct + (isInRange && take > 0 ? 1 : 0);
        next[selected + take][nextDistinct] += prior * binom(frequency, take);
      }
    }
  }
  pageWaysDp = next;
}
for (const frequency of inRangeFrequencies) addValueGroup(frequency, true);
addValueGroup(outOfRangeCells, false);
const uniquePageWays = pageWaysDp[U];
const totalPageNullWays = binom(N, U);
assert.equal(uniquePageWays.reduce((a, b) => a + b, 0n), totalPageNullWays);
const expectedUniquePages = uniquePageWays.reduce(
  (sum, ways, pages) => sum + (Number(ways) / Number(totalPageNullWays)) * pages, 0
);
const pUniquePagesAtLeastObserved = uniquePageWays
  .slice(observedPageCount)
  .reduce((sum, ways) => sum + Number(ways), 0) / Number(totalPageNullWays);
const pUniquePagesExactlyObserved =
  Number(uniquePageWays[observedPageCount]) / Number(totalPageNullWays);

assert.equal(observedWordHits, 9);
assert.equal(observedAddressHits, 7);
assert.equal(observedPageCount, 6);
assert.ok(Math.abs(expectedWordHits - 10.58203125) < 1e-10);
assert.ok(Math.abs(pWordHitsAtLeastObserved - 0.659991153363159) < 1e-10);
assert.ok(Math.abs(expectedAddressHits - 6.64453125) < 1e-10);
assert.ok(Math.abs(pAddressHitsAtLeastObserved - 0.5142898502072955) < 1e-10);
assert.ok(Math.abs(expectedUniquePages - 6.269899280370158) < 1e-10);
assert.ok(Math.abs(pUniquePagesAtLeastObserved - 0.6432084719154291) < 1e-10);
assert.ok(Math.abs(pUniquePagesExactlyObserved - 0.2011349098855441) < 1e-10);


const p49Words = completeWords.get(49);
const p55Words = completeWords.get(55);
assert.ok(p49Words);
assert.ok(p55Words);

const p49 = coreSignature(p49Words);
assert.deepEqual(p49.cores, [20, 19, 19, 14, 4]);
assert.equal(p49.gp0, 76);
assert.equal(tape[76], "1s");
assert.equal(base59(76), 112);

assert.equal(grid.pages[0].page, 49);
assert.equal(grid.pages[0].image, "66.jpg");
assert.equal(grid.pages[0].tokens.length, 80);
assert.equal(grid.pages[0].tokens[76], "1s");

const p55Corpus = corpus.pages.find((page) => page.page === 55);
assert.ok(p55Corpus);
assert.equal(p55Corpus.indices.length, 76);
assert.equal(p55Words.length, 16);
assert.equal(
  p55Words.reduce((sum, word) => sum + word.length, 0),
  75,
);

const pageCounts = new Map(
  corpus.pages
    .filter((page) => page.page <= 55)
    .map((page) => [page.page, page.indices.length]),
);
pageCounts.set(50, 0);

assert.deepEqual(
  [...pageCounts].filter(([, count]) => count === 76).map(([page]) => page),
  [55],
);

/** @type {Map<number, number[]>} */
const pagesByRuneCount = new Map();
for (const [page, count] of pageCounts) {
  if (!pagesByRuneCount.has(count)) pagesByRuneCount.set(count, []);
  pagesByRuneCount.get(count).push(page);
}

const pageRows = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const signature = coreSignature(completeWords.get(page) || []);
  const output = base59(signature.gp0);
  pageRows.push({
    page,
    coreCount: signature.cores.length,
    coreGp0: signature.gp0,
    p50InRange: signature.gp0 < tape.length,
    base59Output: output,
    sourceLabels: output === null ? [] : (sourceByGp0.get(output) || []),
    runeCountTargets: pagesByRuneCount.get(signature.gp0) || [],
  });
}

const sourceLabeled = pageRows.filter((row) => row.sourceLabels.length);
const countMatched = pageRows.filter((row) => row.runeCountTargets.length);
const joint = pageRows.filter((row) =>
  row.sourceLabels.length && row.runeCountTargets.length);

assert.equal(pageRows.length, 55);
assert.equal(pageRows.filter((row) => row.p50InRange).length, 11);
assert.deepEqual(
  sourceLabeled.map((row) => ({
    page: row.page,
    coreGp0: row.coreGp0,
    base59Output: row.base59Output,
    sourceLabels: row.sourceLabels,
  })),
  [
    { page: 49, coreGp0: 76, base59Output: 112, sourceLabels: ["DIRECTION"] },
    { page: 53, coreGp0: 242, base59Output: 41, sourceLabels: ["ITS"] },
  ],
);
assert.deepEqual(
  countMatched.map((row) => ({
    page: row.page,
    coreGp0: row.coreGp0,
    runeCountTargets: row.runeCountTargets,
  })),
  [
    { page: 7, coreGp0: 232, runeCountTargets: [54] },
    { page: 23, coreGp0: 269, runeCountTargets: [20, 28, 31] },
    { page: 49, coreGp0: 76, runeCountTargets: [55] },
  ],
);
assert.deepEqual(joint, [pageRows.find((row) => row.page === 49)]);

console.log(JSON.stringify({
  status: "PASS",
  route: "p49 recursive SHED -> 76 -> same-scan p50[76]=1s -> base59 112=DIRECTION -> unique 76-rune physical page p55",
  p49: {
    image: grid.pages[0].image,
    completeWords: p49Words.length,
    cores: p49.cores,
    coreGp0: p49.gp0,
    tableToken: tape[p49.gp0],
    base59: base59(p49.gp0),
    authenticatedLabel: sourceByGp0.get(base59(p49.gp0)),
  },
  p55Receiver: {
    physicalRunes: p55Corpus.indices.length,
    completeWords: p55Words.length,
    locallyOwnedRunes: p55Words.reduce((sum, word) => sum + word.length, 0),
  },
  controls: {
    runeBearingPages: pageRows.length,
    p50InRange: pageRows.filter((row) => row.p50InRange).length,
    sourceLabeled,
    countMatched,
    joint,
  },
  signedWordScanRegister: {
    rows: scanRegister,
    hits: scanHits,
    addressMultiplicity: collisionRows,
    uniqueGp0Addresses: U,
    collisionExcess: scanRegister.length - U,
    p50Values: {
      cells: N,
      range: [Math.min(...cellValues), Math.max(...cellValues)],
      uniqueValues: new Set(cellValues).size,
      scanRangeCells: K,
      scanRangeUniqueValues: 37,
    },
    null: {
      method: "Randomly permute the exact 256 decoded p50 values over address slots while preserving the 43 word GP0 addresses and their multiplicities.",
      observed: {
        wordHits: observedWordHits,
        uniqueHitAddresses: observedAddressHits,
        uniquePages: observedPageCount,
      },
      expected: {
        wordHits: expectedWordHits,
        uniqueHitAddresses: expectedAddressHits,
        uniquePages: expectedUniquePages,
      },
      upperTail: {
        wordHits: pWordHitsAtLeastObserved,
        uniqueHitAddresses: pAddressHitsAtLeastObserved,
        uniquePages: pUniquePagesAtLeastObserved,
      },
      exactPageCount: pUniquePagesExactlyObserved,
    },
  },
}, null, 2));
