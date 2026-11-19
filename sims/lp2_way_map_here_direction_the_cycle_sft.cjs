"use strict";

/**
 * SFT for the signed-2016 WAY -> MAP table move and DIRECTION -> THE return.
 * Node.js 22, CommonJS, read-only, no third-party dependencies.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(ROOT, relative), "utf8").replace(/\r/g, "");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const tableTokens = grid.pages.flatMap((page) => page.tokens);

const gpAlphabet = corpus.translit
  .map((token, index) => ({ token: token.toLowerCase(), index }))
  .sort((a, b) => b.token.length - a.token.length);

/** @param {string} word @returns {number[]} */
function tokenize(word) {
  let rest = word
    .toLowerCase()
    .replace(/v/g, "u")
    .replace(/k/g, "c")
    .replace(/z/g, "s");
  const out = [];
  while (rest.length > 0) {
    const hit = gpAlphabet.find(({ token }) => rest.startsWith(token));
    assert.ok(hit, "unrecognized GP token in " + word + ": " + rest);
    out.push(hit.index);
    rest = rest.slice(hit.token.length);
  }
  return out;
}

/** @param {string} word */
const gp0 = (word) => tokenize(word).reduce((sum, value) => sum + value, 0);

/** @param {number} count */
function firstPrimes(count) {
  const out = [];
  for (let n = 2; out.length < count; n += 1) {
    let prime = true;
    for (let d = 2; d * d <= n; d += 1) {
      if (n % d === 0) {
        prime = false;
        break;
      }
    }
    if (prime) out.push(n);
  }
  return out;
}

const primes = firstPrimes(29);
/** @param {string} word */
const gpPrime = (word) =>
  tokenize(word).reduce((sum, value) => sum + primes[value], 0);

const body = signed2016
  .slice(
    signed2016.indexOf("Hello."),
    signed2016.indexOf("-----BEGIN PGP SIGNATURE-----")
  )
  .replace(/\b7A35090F\b/g, "");
const signedWords =
  body.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g) || [];
assert.equal(signedWords.length, 43);
const thePositions = signedWords
  .map((word, index) => (word.toLowerCase() === "the" ? index + 1 : null))
  .filter((position) => position !== null);
assert.deepEqual(thePositions, [2, 8, 13, 18, 23, 29]);
const followers = thePositions.map((position) =>
  signedWords[position].toUpperCase()
);
assert.deepEqual(followers, [
  "PATH",
  "DEVOTED",
  "WAY",
  "MAP",
  "ROAD",
  "DIRECTION",
]);

const deltas = {
  N: [-1, 0],
  S: [1, 0],
  E: [0, 1],
  W: [0, -1],
};

/** @param {number} index @param {string} token @returns {number|null} */
function literalMove(index, token) {
  const match = token.match(/^([1-9])([NSEWnsew])$/);
  if (!match) return null;
  const row = Math.floor(index / 8);
  const col = index % 8;
  const [dr, dc] = deltas[match[2].toUpperCase()];
  const distance = Number(match[1]);
  const nextRow = row + dr * distance;
  const nextCol = col + dc * distance;
  return nextRow >= 0 && nextRow < 32 && nextCol >= 0 && nextCol < 8
    ? nextRow * 8 + nextCol
    : null;
}

/** @param {number} index @param {"N"|"S"|"E"|"W"} direction */
function oneStep(index, direction) {
  const row = Math.floor(index / 8);
  const col = index % 8;
  const [dr, dc] = deltas[direction];
  return (row + dr) * 8 + col + dc;
}

const followerRows = followers.map((word) => {
  const address = gp0(word);
  const token = tableTokens[address];
  return {
    word,
    address,
    token,
    destination: literalMove(address, token),
  };
});

assert.deepEqual(
  followerRows.map(({ word, address, token }) => ({ word, address, token })),
  [
    { word: "PATH", address: 39, token: "05" },
    { word: "DEVOTED", address: 102, token: "0W" },
    { word: "WAY", address: 57, token: "1w" },
    { word: "MAP", address: 56, token: "4E" },
    { word: "ROAD", address: 54, token: "2a" },
    { word: "DIRECTION", address: 98, token: "1C" },
  ]
);

const allFollowerEdges = [];
for (const source of followerRows) {
  for (const target of followerRows) {
    if (
      source.word !== target.word &&
      source.destination === target.address
    ) {
      allFollowerEdges.push([source.word, target.word]);
    }
  }
}
assert.deepEqual(allFollowerEdges, [["WAY", "MAP"]]);

const adjacentEdges = followerRows
  .slice(0, -1)
  .filter(
    (source, index) =>
      source.destination === followerRows[index + 1].address
  )
  .map((source, index) => [source.word, followerRows[index + 1].word]);
assert.deepEqual(adjacentEdges, [["WAY", "MAP"]]);

assert.equal(gp0("WAY"), 57);
assert.equal(gp0("MAP"), 56);
assert.equal(tableTokens[57], "1w");
assert.equal(literalMove(57, tableTokens[57]), 56);
const winners = tableTokens.filter((token) => literalMove(57, token) === 56);
assert.equal(winners.length, 3);
assert.deepEqual([...new Set(winners)].sort(), ["1W", "1w"]);
assert.equal(tableTokens.filter((token) => token === "1w").length, 1);
assert.equal(winners.length / tableTokens.length, 3 / 256);

// Compose with the previously frozen MAP token consumer.
assert.equal(tableTokens[56], "4E");
assert.equal(
  String.fromCharCode(Number.parseInt(tableTokens[56], 16)),
  "N"
);
assert.equal(oneStep(56, "N"), 48);
assert.equal(gp0("HERE"), 48);

/** @param {string} token @param {59|60} radix */
function decodeRadix(token, radix) {
  const alphabet =
    radix === 60 ? grid.alphabet : grid.alphabet.slice(0, -1);
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  return high < 0 || low < 0 ? null : high * radix + low;
}

assert.equal(gp0("DIRECTION"), 98);
assert.equal(tableTokens[98], "1C");
assert.equal(decodeRadix("1C", 59), 71);
assert.equal(decodeRadix("1C", 60), 72);
assert.equal(gp0("THE"), 20);
assert.equal(gpPrime("THE"), 72);

const carrierHits = [];
for (const source of followerRows) {
  for (const radix of [59, 60]) {
    const value = decodeRadix(source.token, radix);
    for (const metric of ["GP0", "GP-prime"]) {
      const target =
        metric === "GP0" ? gp0("THE") : gpPrime("THE");
      if (value === target) {
        carrierHits.push({
          source: source.word,
          radix,
          metric,
          value,
        });
      }
    }
  }
}
assert.deepEqual(carrierHits, [
  {
    source: "DIRECTION",
    radix: 60,
    metric: "GP-prime",
    value: 72,
  },
]);

/*
 * Held-out solved-text transfer.
 *
 * The composite rule is fixed above before opening this corpus:
 *   source GP0 -> literal digit+cardinal move -> intermediate state
 *   -> intermediate token as hex ASCII cardinal -> one grid step.
 * Test every adjacent solved word pair, requiring the final state to equal
 * the next word's GP0. The one-stage movement grammar is also censused.
 */
const solvedRuneIndex = new Map(solved.runes.map((rune, index) => [rune, index]));

/** @param {string} text @returns {number[][]} */
function solvedWordVectors(text) {
  const out = [];
  let current = [];
  for (const char of [...text]) {
    if (solvedRuneIndex.has(char)) {
      current.push(solvedRuneIndex.get(char));
    } else if (current.length > 0) {
      out.push(current);
      current = [];
    }
  }
  if (current.length > 0) out.push(current);
  return out;
}

/** @param {number[]} vector */
const vectorGp0 = (vector) => vector.reduce((sum, value) => sum + value, 0);

/** @param {number[]} vector */
const vectorText = (vector) =>
  vector.map((value) => corpus.translit[value]).join("").toUpperCase();

/** @param {number} index @param {string} token @returns {number|null} */
function hexCardinalMove(index, token) {
  if (!/^[0-9A-Fa-f]{2}$/.test(token)) return null;
  const direction = String.fromCharCode(Number.parseInt(token, 16)).toUpperCase();
  return deltas[direction] ? oneStep(index, direction) : null;
}

let solvedAdjacencies = 0;
let directMovementEligible = 0;
const directMovementHits = [];
const compositeEligible = [];
const compositeHits = [];

for (const section of solved.sections) {
  const words = solvedWordVectors(section.source_text);
  for (let index = 0; index + 1 < words.length; index += 1) {
    solvedAdjacencies += 1;
    const sourceAddress = vectorGp0(words[index]);
    const targetAddress = vectorGp0(words[index + 1]);
    if (sourceAddress >= tableTokens.length) continue;

    const middle = literalMove(sourceAddress, tableTokens[sourceAddress]);
    if (middle === null) continue;
    directMovementEligible += 1;
    if (middle === targetAddress) {
      directMovementHits.push({
        section: section.name,
        index,
        sourceText: vectorText(words[index]),
        targetText: vectorText(words[index + 1]),
        sourceAddress,
        token: tableTokens[sourceAddress],
        targetAddress,
      });
    }

    const destination = hexCardinalMove(middle, tableTokens[middle]);
    if (destination === null) continue;
    const row = {
      section: section.name,
      index,
      sourceText: vectorText(words[index]),
      targetText: vectorText(words[index + 1]),
      sourceAddress,
      sourceToken: tableTokens[sourceAddress],
      middle,
      middleToken: tableTokens[middle],
      destination,
      targetAddress,
    };
    compositeEligible.push(row);
    if (destination === targetAddress) compositeHits.push(row);
  }
}

assert.equal(solvedAdjacencies, 731);
assert.equal(directMovementEligible, 81);
assert.deepEqual(directMovementHits, []);
assert.equal(compositeEligible.length, 11);
assert.deepEqual(compositeHits, [{
  section: "0_welcome",
  index: 25,
  sourceText: "WAY",
  targetText: "HERE",
  sourceAddress: 57,
  sourceToken: "1w",
  middle: 56,
  middleToken: "4E",
  destination: 48,
  targetAddress: 48,
}]);

// Global control: full-byte -> authenticated-word GP-prime links are not unique.
const distinctWords = [...new Set(signedWords.map((word) => word.toUpperCase()))];
const globalPrimeLinks = [];
for (const source of distinctWords) {
  const address = gp0(source);
  if (address >= grid.bytes.length) continue;
  for (const target of distinctWords) {
    if (grid.bytes[address] === gpPrime(target)) {
      globalPrimeLinks.push([source, target]);
    }
  }
}
assert.equal(globalPrimeLinks.length, 5);
assert.ok(
  globalPrimeLinks.some(
    ([source, target]) =>
      source === "DIRECTION" && target === "THE"
  )
);

console.log(
  JSON.stringify(
    {
      status: "PASS",
      thePositions,
      followers,
      followerRows,
      allFollowerEdges,
      adjacentEdges,
      wayToMap: {
        token: tableTokens[57],
        destination: 56,
        fixedTargetPermutationRate: 3 / 256,
      },
      mapToHere: {
        token: tableTokens[56],
        direction: "N",
        destination: 48,
      },
      solvedTransfer: {
        solvedAdjacencies,
        directMovementEligible,
        directMovementHits,
        compositeEligible: compositeEligible.length,
        compositeHits,
      },
      directionToThe: {
        token: tableTokens[98],
        base59: 71,
        base60: 72,
        carrierHits,
        globalPrimeLinks,
      },
      classification:
        "Strong clue-constrained solve-path candidate with solved-text transfer: WAY->MAP is the unique literal movement edge in the fixed follower set, and the fixed WAY->MAP->HERE composite is the sole hit among 731 solved GP29 word adjacencies (11 composite-eligible), exactly on solved WELCOME WAY HERE. DIRECTION->THE remains unique only in the fixed follower/radix/carrier-numbering family.",
    },
    null,
    2
  )
);
