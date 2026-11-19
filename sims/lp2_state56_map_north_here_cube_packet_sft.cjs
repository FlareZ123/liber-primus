"use strict";

/**
 * SFT: authenticated state56 -> p50 4E bifurcation.
 *
 * Tests two source-simple readings of the already selected p50 cell56:
 * 1. literal hexadecimal 0x4E = ASCII N; one grid step north lands on
 *    cell48 = GP0(HERE), the independently recovered p28 checkpoint.
 * 2. conventional base60 4E = 254; p0 offset254 is one-based word57.
 *    The independently selected GP29 cube map sends its three ciphertext
 *    runes to [b,a,K*g] from the source-derived p28 DH23 exchange.
 *
 * No plaintext is fitted in this test.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);
const table = grid.rows.flat();
const parts = transcription.split(/^\s*%\s*$/m);

function mod29(value) {
  return ((value % 29) + 29) % 29;
}

function powMod(base, exponent, modulus) {
  let result = 1;
  let factor = base % modulus;
  let power = exponent;
  while (power > 0) {
    if (power % 2 === 1) result = (result * factor) % modulus;
    factor = (factor * factor) % modulus;
    power = Math.floor(power / 2);
  }
  return result;
}

function H(left, right) {
  return [mod29(left - right), mod29(left + right)];
}

function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
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
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling at " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

function gp0(word) {
  return gp(word).reduce((total, value) => total + value, 0);
}

function parsePage(text) {
  const runes = [];
  const words = [];
  let current = [];
  let start = 0;

  function flush() {
    if (!current.length) return;
    words.push({
      index: words.length,
      start,
      end: start + current.length - 1,
      values: current.slice(),
      length: current.length,
    });
    current = [];
  }

  for (const char of [...text]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) start = runes.length;
      current.push(value);
      runes.push(value);
    } else if ((char === "-" || char === ".") && current.length) {
      flush();
    }
  }
  flush();
  return { runes, words };
}

function physicalLines(page) {
  return parts[page].trim().split("/").filter((line) => line.trim().length > 0);
}

function lineFragments(line) {
  return (line.match(/[\u16A0-\u16FF]+/gu) || []).map((fragment) =>
    [...fragment].map((rune) => {
      const value = runeIndex.get(rune);
      assert.notEqual(value, undefined);
      return value;
    })
  );
}

function decodeBase60(token) {
  const high = grid.alphabet.indexOf(token[0]);
  const low = grid.alphabet.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return high * grid.alphabet.length + low;
}

function signedWords() {
  const clear = signed2016
    .split("-----BEGIN PGP SIGNATURE-----")[0]
    .split(/\r?\n\r?\n/)
    .slice(1)
    .join("\n");
  return clear.split(/[^A-Za-z0-9]+/)
    .filter((token) => /^[A-Za-z]+$/.test(token))
    .map((token) => token.toUpperCase());
}

function asciiCardinal(token) {
  if (!/^[0-9A-Fa-f]{2}$/.test(token)) return null;
  const char = String.fromCharCode(Number.parseInt(token, 16)).toUpperCase();
  return "NSEW".includes(char) ? char : null;
}

function moveOne(address, direction) {
  const row = Math.floor(address / 8);
  const col = address % 8;
  const delta = {
    N: [-1, 0],
    S: [1, 0],
    E: [0, 1],
    W: [0, -1],
  }[direction];
  assert.ok(delta);
  const nextRow = row + delta[0];
  const nextCol = col + delta[1];
  if (nextRow < 0 || nextRow >= 32 || nextCol < 0 || nextCol >= 8) return null;
  return nextRow * 8 + nextCol;
}

const signed = signedWords();
assert.equal(signed.length, 43);
assert.equal(gp0("MAP"), 56);
assert.equal(gp0("AND"), 56);
assert.equal(gp0("SEEK"), 56);
assert.equal(table[56], "4E");

const signedAddresses = [...new Set(signed.map(gp0))];
const signedCardinals = signedAddresses
  .map((address) => ({
    address,
    token: table[address],
    direction: asciiCardinal(table[address]),
  }))
  .filter((entry) => entry.direction !== null);
assert.deepEqual(signedCardinals, [{ address: 56, token: "4E", direction: "N" }]);

const tableCardinals = table
  .map((token, address) => ({
    address,
    token,
    direction: asciiCardinal(token),
  }))
  .filter((entry) => entry.direction !== null)
  .map((entry) => ({
    ...entry,
    destination: moveOne(entry.address, entry.direction),
  }));
assert.deepEqual(tableCardinals, [
  { address: 56, token: "4E", direction: "N", destination: 48 },
  { address: 140, token: "45", direction: "E", destination: 141 },
  { address: 170, token: "4E", direction: "N", destination: 162 },
]);

assert.equal(gp0("HERE"), 48);
assert.equal(moveOne(56, "N"), gp0("HERE"));
assert.equal(table[48], "4D");

const p28OutputAddresses = new Map(
  ["READ", "OUT", "HERE", "GCD"].map((word) => [gp0(word), word])
);
const cardinalHitsOnP28Outputs = tableCardinals
  .filter((entry) => p28OutputAddresses.has(entry.destination))
  .map((entry) => ({
    ...entry,
    word: p28OutputAddresses.get(entry.destination),
  }));
assert.deepEqual(cardinalHitsOnP28Outputs, [{
  address: 56,
  token: "4E",
  direction: "N",
  destination: 48,
  word: "HERE",
}]);

// Reconstruct the source-local p28 DH23 exchange from literal line6.
const line6 = physicalLines(28)[5];
const fragments = lineFragments(line6);
const lineRunes = fragments.flat();
assert.equal(corpus.translit[fragments[0][0]] + corpus.translit[fragments[0][1]], "DH");
const p = lineRunes.length;
const g = fragments.length;
const a = 6;
const [b, K] = H(fragments[0][0], fragments[0][1]);
const A = powMod(g, a, p);
const B = powMod(g, b, p);
assert.deepEqual({ p, g, a, b, A, B, K }, {
  p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2,
});
assert.equal(powMod(A, b, p), K);
assert.equal(powMod(B, a, p), K);

// The second reading of the same printed token is its conventional base60 byte.
const receiverOffset = decodeBase60(table[56]);
assert.equal(receiverOffset, 254);
const p0 = parsePage(parts[0]);
const receiver = p0.words.find((word) => word.start === receiverOffset);
assert.ok(receiver);
assert.equal(receiver.index, 56);
assert.equal(receiver.length, 3);
assert.deepEqual(receiver.values, [19, 4, 21]);

const cubePacket = receiver.values.map((value) => powMod(value, 3, 29));
const expectedPacket = [b, a, mod29(K * g)];
assert.deepEqual(cubePacket, [15, 6, 10]);
assert.deepEqual(cubePacket, expectedPacket);

// Manuscript-wide control: exact tuple and every permutation of its multiset.
const packetPermutations = new Set([
  [15, 6, 10],
  [15, 10, 6],
  [6, 15, 10],
  [6, 10, 15],
  [10, 15, 6],
  [10, 6, 15],
].map((values) => values.join(",")));

let threeRuneWords = 0;
const permutationHits = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  for (const word of parsePage(parts[page]).words) {
    if (word.length !== 3) continue;
    threeRuneWords += 1;
    const cubed = word.values.map((value) => powMod(value, 3, 29));
    if (packetPermutations.has(cubed.join(","))) {
      permutationHits.push({
        page,
        word: word.index,
        start: word.start,
        cipher: word.values,
        cubed,
      });
    }
  }
}
assert.equal(threeRuneWords, 723);
assert.deepEqual(permutationHits, [{
  page: 0,
  word: 56,
  start: 254,
  cipher: [19, 4, 21],
  cubed: [15, 6, 10],
}]);

// Broad calibration: two distinct direct DH fields plus one product of two
// DH fields is a much wider family and is intentionally reported as such.
const state = [p, g, a, b, A, B, K];
const stateSet = new Set(state);
const products = new Set();
for (const left of state) {
  for (const right of state) products.add(mod29(left * right));
}

let broadFamilyHits = 0;
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  for (const word of parsePage(parts[page]).words) {
    if (word.length !== 3) continue;
    const cubed = word.values.map((value) => powMod(value, 3, 29));
    let hit = false;
    for (let productPosition = 0; productPosition < 3; productPosition += 1) {
      const directPositions = [0, 1, 2].filter((index) => index !== productPosition);
      if (
        products.has(cubed[productPosition]) &&
        stateSet.has(cubed[directPositions[0]]) &&
        stateSet.has(cubed[directPositions[1]]) &&
        cubed[directPositions[0]] !== cubed[directPositions[1]]
      ) {
        hit = true;
      }
    }
    if (hit) broadFamilyHits += 1;
  }
}
assert.equal(broadFamilyHits, 64);

console.log(JSON.stringify({
  state56: {
    signedCollision: ["MAP", "AND", "SEEK"],
    token: table[56],
    hex: "0x4E",
    asciiDirection: "N",
    northDestination: 48,
    destinationWord: "HERE",
  },
  base60Receiver: {
    offset: receiverOffset,
    oneBasedWord: receiver.index + 1,
    cipher: receiver.values,
    cubePacket,
    typedPacket: ["b", "a", "K*g"],
  },
  controls: {
    signedDistinctGpAddresses: signedAddresses.length,
    signedHexCardinalAddresses: signedCardinals.length,
    tableHexCardinalCells: tableCardinals.length,
    threeRuneWords,
    cubePacketPermutationHits: permutationHits.length,
    broadTwoStateOneProductHits: broadFamilyHits,
  },
}, null, 2));
