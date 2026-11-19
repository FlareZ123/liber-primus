"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const reference = read("resources/liber-primus/lp1-plaintext-reference.txt");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const tape = grid.pages.flatMap((page) => page.tokens);
const alpha60 = grid.alphabet;
const alpha59 = grid.alphabet.replace("f", "");
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {string} word @returns {number} */
function gp0(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/[KQ]/g, "C")
    .replace(/V/g, "U")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  let sum = 0;
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      sum += 21;
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      sum += 27;
      offset += 2;
      continue;
    }
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset));
    assert.ok(token, "unmapped GP token in " + word + " at " + offset);
    sum += token.value;
    offset += token.symbol.length;
  }
  return sum;
}

/** @param {number} value @returns {number} */
function address(value) {
  return ((value % 256) + 256) % 256;
}

/** @param {number} source @param {string} alphabet */
function tableRead(source, alphabet) {
  const index = address(source);
  const token = tape[index];
  return {
    source,
    address: index,
    token,
    value: alphabet.length * alphabet.indexOf(token[0]) +
      alphabet.indexOf(token[1]),
  };
}

/** @param {string[]} words */
function adjacentPairs(words) {
  return words.slice(0, -1).map((word, index) => ({
    position1: index + 1,
    first: word,
    second: words[index + 1],
    firstGp0: gp0(word),
    secondGp0: gp0(words[index + 1]),
  }));
}

/** @param {string} source */
function signedWords(source) {
  const clearStart = source.indexOf("Hash: SHA1");
  const signatureStart = source.indexOf("-----BEGIN PGP SIGNATURE-----");
  assert.ok(clearStart >= 0 && signatureStart > clearStart);
  const clear = source
    .slice(clearStart + "Hash: SHA1".length, signatureStart)
    .replace(/\b7A35090F\b/g, "");
  return (clear.match(/[A-Za-z]+/g) || []).map((word) => word.toUpperCase());
}

const source16 = reference.split("### 16\n")[1].split("\n### ")[0];
const square = source16
  .split(/\n/)
  .map((line) => line.trim())
  .filter((line) => /^\d+\s+\d+/.test(line))
  .map((line) => line.split(/\s+/).map(Number));

assert.deepEqual(square, [
  [434, 1311, 312, 278, 966],
  [204, 812, 934, 280, 1071],
  [626, 620, 809, 620, 626],
  [1071, 280, 934, 812, 204],
  [966, 278, 312, 1311, 434],
]);

// Preserve the already established center transition.
assert.deepEqual(tableRead(809, alpha59), {
  source: 809,
  address: 41,
  token: "1O",
  value: 83,
});
assert.equal(gp0("EMERGE"), 83);
assert.equal(gp0("NUMBERS"), 83);

// The two target source numbers are each duplicated by 180-degree symmetry.
const locations = new Map();
for (let row = 0; row < 5; row += 1) {
  for (let col = 0; col < 5; col += 1) {
    const value = square[row][col];
    if (!locations.has(value)) locations.set(value, []);
    locations.get(value).push([row + 1, col + 1]);
  }
}
assert.deepEqual(locations.get(278), [[1, 4], [5, 2]]);
assert.deepEqual(locations.get(1071), [[2, 5], [4, 1]]);

const signed = signedWords(signed2016);
assert.equal(signed.length, 43);
assert.deepEqual(signed.slice(-2), ["VERIFY", "OPENPGP"]);
assert.equal(gp0("VERIFY"), 59);
assert.equal(gp0("OPENPGP"), 75);
assert.deepEqual(
  signed.map((word, index) => ({ position: index + 1, word, value: gp0(word) }))
    .filter((row) => row.value === 59),
  [{ position: 42, word: "VERIFY", value: 59 }],
);
assert.deepEqual(
  signed.map((word, index) => ({ position: index + 1, word, value: gp0(word) }))
    .filter((row) => row.value === 75),
  [{ position: 43, word: "OPENPGP", value: 75 }],
);
assert.deepEqual(
  signed.map((word, index) => ({ position: index + 1, word, value: gp0(word) }))
    .filter((row) => row.value === 83),
  [{ position: 27, word: "NUMBERS", value: 83 }],
);

const p57 = "PARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE"
  .split(/\s+/);
const sourcePairFamilies = [
  ["base60->base60", alpha60, alpha60],
  ["base60->base59", alpha60, alpha59],
  ["base59->base60", alpha59, alpha60],
  ["base59->base59", alpha59, alpha59],
];

/**
 * Charge every directed 8-neighbor edge in the literal 5x5 source square.
 * @param {string[]} targetWords
 */
function scan(targetWords) {
  const targetPairs = adjacentPairs(targetWords);
  const results = [];

  for (const [family, firstAlphabet, secondAlphabet] of sourcePairFamilies) {
    const hits = [];
    let directedEdges = 0;

    for (let row = 0; row < 5; row += 1) {
      for (let col = 0; col < 5; col += 1) {
        for (let dRow = -1; dRow <= 1; dRow += 1) {
          for (let dCol = -1; dCol <= 1; dCol += 1) {
            if (dRow === 0 && dCol === 0) continue;
            const nextRow = row + dRow;
            const nextCol = col + dCol;
            if (nextRow < 0 || nextRow >= 5 ||
                nextCol < 0 || nextCol >= 5) continue;

            directedEdges += 1;
            const firstSource = square[row][col];
            const secondSource = square[nextRow][nextCol];
            const firstRead = tableRead(firstSource, firstAlphabet);
            const secondRead = tableRead(secondSource, secondAlphabet);
            const pairMatches = targetPairs.filter((pair) =>
              pair.firstGp0 === firstRead.value &&
              pair.secondGp0 === secondRead.value);

            if (pairMatches.length) {
              hits.push({
                from: [row + 1, col + 1],
                to: [nextRow + 1, nextCol + 1],
                source: [firstSource, secondSource],
                reads: [firstRead, secondRead],
                targetPairs: pairMatches,
              });
            }
          }
        }
      }
    }

    assert.equal(directedEdges, 144);
    results.push({ family, directedEdges, hits });
  }

  return results;
}

const signedScan = scan(signed);
assert.deepEqual(
  signedScan.map((row) => ({ family: row.family, hitCount: row.hits.length })),
  [
    { family: "base60->base60", hitCount: 0 },
    { family: "base60->base59", hitCount: 2 },
    { family: "base59->base60", hitCount: 0 },
    { family: "base59->base59", hitCount: 0 },
  ],
);

const mixedHits = signedScan[1].hits;
assert.deepEqual(
  mixedHits.map((hit) => ({
    from: hit.from,
    to: hit.to,
    source: hit.source,
    values: hit.reads.map((read) => read.value),
    words: hit.targetPairs.map((pair) =>
      [pair.first, pair.second, pair.position1]),
  })),
  [
    {
      from: [1, 4],
      to: [2, 5],
      source: [278, 1071],
      values: [59, 75],
      words: [["VERIFY", "OPENPGP", 42]],
    },
    {
      from: [5, 2],
      to: [4, 1],
      source: [278, 1071],
      values: [59, 75],
      words: [["VERIFY", "OPENPGP", 42]],
    },
  ],
);

// The same charged family has no adjacent-word hit in solved p57.
const p57Scan = scan(p57);
assert.ok(p57Scan.every((row) => row.hits.length === 0));

// Literal OpenPGP key-id representations do not continue to a known-word state.
const knownWords = [...new Set([...signed, ...p57])];
const knownGp0 = new Set(knownWords.map(gp0));
const keyId = "7A35090F";
const keyIdInteger = Number.parseInt(keyId, 16);
const keyIdRepresentations = [
  ["full-integer", keyIdInteger],
  ["low-byte", keyIdInteger & 255],
  ["high-byte", (keyIdInteger >>> 24) & 255],
  ["first-16", Number.parseInt(keyId.slice(0, 4), 16)],
  ["last-16", Number.parseInt(keyId.slice(4), 16)],
  ["byte-0", 0x7A],
  ["byte-1", 0x35],
  ["byte-2", 0x09],
  ["byte-3", 0x0F],
];

const keyIdReads = [];
for (const [representation, value] of keyIdRepresentations) {
  for (const [radix, alphabet] of [["base60", alpha60], ["base59", alpha59]]) {
    const readout = tableRead(value, alphabet);
    keyIdReads.push({
      representation,
      input: value,
      radix,
      ...readout,
      knownWordHit: knownGp0.has(readout.value),
    });
  }
}
assert.ok(keyIdReads.every((row) => !row.knownWordHit));

console.log(JSON.stringify({
  status: "PASS",
  establishedCenterBridge: {
    source: 809,
    base59: tableRead(809, alpha59),
    gp0: 83,
    p57Word: "EMERGE",
    signed2016Word: "NUMBERS",
  },
  squareEdgeFamily: {
    directedEdgesPerRadixPair: 144,
    radixPairs: sourcePairFamilies.map(([family]) => family),
    signed2016Hits: signedScan.map((row) => ({
      family: row.family,
      hitCount: row.hits.length,
    })),
    uniqueMixedRadixHit: mixedHits.map((hit) => ({
      from: hit.from,
      to: hit.to,
      source: hit.source,
      values: hit.reads.map((read) => read.value),
      words: hit.targetPairs.map((pair) =>
        [pair.first, pair.second, pair.position1]),
    })),
    p57Hits: p57Scan.map((row) => ({
      family: row.family,
      hitCount: row.hits.length,
    })),
  },
  openPgpKeyIdStop: keyIdReads,
  classification:
    "Intermediate source-structured bridge. Across every directed 8-neighbor edge of the source 5x5 square and all four fixed/mixed base60/base59 pairs, only base60->base59 yields an authenticated signed-2016 adjacent-word hit: the 180-degree-symmetric 278->1071 edges map to VERIFY OPENPGP. The existing post-MUST state is base59, so this result does not authorize an additional reset to base60. No unknown LP2 plaintext or key is claimed.",
}, null, 2));
