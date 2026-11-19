"use strict";

/**
 * SFT: block11 state continuity selects one [11,17,11] node, the packet
 * formula restores start (B,p), and a bounded direction/length charge
 * uniquely decrypts original ciphertext to END.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const grid = corpus.pages.filter((page) => page.page <= 2).flatMap((page) => page.indices);

assert.equal(grid.length, 729);

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

const state = Object.freeze({
  p: 23,
  g: 5,
  a: 6,
  b: 15,
  A: 8,
  B: 19,
  K: 2,
  e: 3,
  q: 4,
});

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} n @returns {number} */
function phi(n) {
  let result = n;
  let value = n;
  for (let prime = 2; prime * prime <= value; prime += 1) {
    if (value % prime !== 0) continue;
    while (value % prime === 0) value /= prime;
    result -= result / prime;
  }
  if (value > 1) result -= result / value;
  return result;
}

/** @param {number} n @returns {number} */
function mobius(n) {
  if (n === 1) return 1;
  let value = n;
  let factors = 0;
  for (let prime = 2; prime * prime <= value; prime += 1) {
    if (value % prime !== 0) continue;
    value /= prime;
    factors += 1;
    if (value % prime === 0) return 0;
    while (value % prime === 0) value /= prime;
  }
  if (value > 1) factors += 1;
  return factors % 2 === 0 ? 1 : -1;
}

/** @param {number[]} packet @returns {{unrotated:number[],rotation:number,key:number[]}} */
function deriveKey(packet) {
  assert.equal(packet.length, 3);
  assert.equal(packet[0], packet[2]);
  const unrotated = [packet[0], phi(packet[1]), packet[2]];
  const rotation = mod29(
    unrotated.reduce((sum, value) => sum + mobius(phi(value)), 0)
  ) % 3;
  const key = unrotated.slice(rotation).concat(unrotated.slice(0, rotation));
  return { unrotated, rotation, key };
}

/** @param {string} source @returns {number[][]} */
function runeWords(source) {
  const words = [];
  let current = [];
  for (const char of [...source]) {
    const value = runeIndex.get(char);
    if (value !== undefined) current.push(value);
    else if (current.length) {
      words.push(current);
      current = [];
    }
  }
  if (current.length) words.push(current);
  return words;
}

/** @param {string} word @returns {number[]} */
function gpWord(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const values = [];
  for (let index = 0; index < normalized.length;) {
    if (normalized.startsWith("ING", index)) {
      values.push(21);
      index += 3;
      continue;
    }
    if (normalized.startsWith("IO", index)) {
      values.push(27);
      index += 2;
      continue;
    }
    const token = gpTokens.find((candidate) => normalized.startsWith(candidate.symbol, index));
    assert.ok(token, `unmapped GP spelling ${word} at ${index}`);
    values.push(token.value);
    index += token.symbol.length;
  }
  return values;
}

/** @param {number} row @param {number} column @returns {number} */
function cell(row, column) {
  assert.ok(row >= 1 && row <= 27);
  assert.ok(column >= 1 && column <= 27);
  return grid[(row - 1) * 27 + column - 1];
}

const known = new Map();
for (const section of solved.sections) {
  for (const values of runeWords(section.source_text)) {
    known.set(values.join(","), values.map((value) => corpus.translit[value]).join(""));
  }
}
const signedClear = signed
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u)
  .slice(1)
  .join("\n");
const sourceWords = signedClear
  .split(/[^A-Za-z0-9]+/u)
  .filter((word) => /^[A-Za-z]+$/u.test(word))
  .map((word) => word.toUpperCase());
for (const word of sourceWords) {
  const values = gpWord(word);
  known.set(values.join(","), word);
}

const directions = [
  ["H", 0, 1],
  ["V", 1, 0],
  ["D1", 1, 1],
  ["D2", 1, -1],
];

/** @param {number[]} target @returns {Array<{radius:number,axis:string,points:number[][],linear:number[]}>} */
function findExactTriples(target) {
  const hits = [];
  for (let radius = 1; radius <= 13; radius += 1) {
    for (const [axis, dr, dc] of directions) {
      for (let row = 1; row <= 27; row += 1) {
        for (let column = 1; column <= 27; column += 1) {
          const points = [
            [row, column],
            [row + radius * dr, column + radius * dc],
            [row + 2 * radius * dr, column + 2 * radius * dc],
          ];
          if (points.some(([r, c]) => r < 1 || r > 27 || c < 1 || c > 27)) continue;
          const values = points.map(([r, c]) => cell(r, c));
          if (values.every((value, index) => value === target[index])) {
            hits.push({
              radius,
              axis,
              points,
              linear: points.map(([r, c]) => (r - 1) * 27 + c - 1),
            });
          }
        }
      }
    }
  }
  return hits;
}

const block10Packet = [state.p - 1, state.B - state.A, state.p - 1];
assert.deepEqual(block10Packet, [22,11,22]);
const block10Hits = findExactTriples(block10Packet);
assert.deepEqual(block10Hits, [{
  radius: 1,
  axis: "V",
  points: [[18,16],[19,16],[20,16]],
  linear: [474,501,528],
}]);
const shared = block10Hits[0].points[1];
assert.deepEqual(shared, [state.B, state.B - state.e]);

const block11Packet = [
  state.B - state.A,
  state.p - state.a,
  state.B - state.A,
];
assert.deepEqual(block11Packet, [11,17,11]);

const block11Hits = findExactTriples(block11Packet);
assert.deepEqual(block11Hits, [
  {
    radius: state.q,
    axis: "D2",
    points: [[19,16],[23,12],[27,8]],
    linear: [501,605,709],
  },
  {
    radius: state.a,
    axis: "H",
    points: [[13,12],[13,18],[13,24]],
    linear: [335,341,347],
  },
]);

const continuousHits = block11Hits.filter((hit) =>
  hit.points.some(([row, column]) => row === shared[0] && column === shared[1])
);
assert.deepEqual(continuousHits, [block11Hits[0]]);

const derived = deriveKey(block11Packet);
assert.deepEqual(derived, {
  unrotated: [11,16,11],
  rotation: 2,
  key: [11,11,16],
});

// Restore the terms subtracted in the packet formula.
const stateStart = [
  block11Packet[0] + state.A,
  block11Packet[1] + state.a,
];
const swappedStart = [stateStart[1], stateStart[0]];
assert.deepEqual(stateStart, [state.B, state.p]);
assert.deepEqual(stateStart, [19,23]);
assert.deepEqual(swappedStart, [23,19]);

// Independent state identity from the selected node start reaches the same column.
assert.equal(shared[1] + state.g + state.K, state.p);

const compass = [
  ["N",-1,0], ["NE",-1,1], ["E",0,1], ["SE",1,1],
  ["S",1,0], ["SW",1,-1], ["W",0,-1], ["NW",-1,-1],
];
const lengths = [
  ["K", state.K],
  ["e", state.e],
  ["q", state.q],
  ["g", state.g],
  ["a", state.a],
  ["g+K", state.g + state.K],
  ["A", state.A],
];

const lexical = [];
for (const [startName, start] of [["state", stateStart], ["swapped", swappedStart]]) {
  for (const [lengthName, length] of lengths) {
    for (const [direction, dr, dc] of compass) {
      const coords = Array.from({ length }, (_, index) => [
        start[0] + dr * index,
        start[1] + dc * index,
      ]);
      if (coords.some(([row, column]) => row < 1 || row > 27 || column < 1 || column > 27)) continue;
      const cipher = coords.map(([row, column]) => cell(row, column));
      const plaintext = cipher.map((value, index) =>
        mod29(value - derived.key[index % derived.key.length])
      );
      const label = known.get(plaintext.join(",")) || null;
      if (label) {
        lexical.push({
          startName,
          start,
          lengthName,
          length,
          direction,
          coords,
          cipher,
          plaintext,
          label,
        });
      }
    }
  }
}

assert.deepEqual(lexical, [{
  startName: "state",
  start: [19,23],
  lengthName: "e",
  length: 3,
  direction: "S",
  coords: [[19,23],[20,23],[21,23]],
  cipher: [0,20,10],
  plaintext: [18,9,23],
  label: "END",
}]);

const winning = lexical[0];
assert.deepEqual(
  winning.plaintext.map((value, index) => mod29(value + derived.key[index])),
  winning.cipher
);

console.log(JSON.stringify({
  status: "PASS",
  block10Shared: shared,
  block11: {
    packet: block11Packet,
    allNodes: block11Hits,
    continuitySelected: continuousHits[0],
    key: derived,
    restoredStarts: {
      state: stateStart,
      swapped: swappedStart,
    },
    chargedLengths: lengths,
    lexical,
  },
  plaintext: "END",
  scope: "exact local block11 inverse; no general block12 transition claimed",
}, null, 2));
