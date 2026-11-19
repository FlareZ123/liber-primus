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
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} n @returns {number} */
function phi(n) {
  assert.ok(Number.isInteger(n) && n > 0);
  let result = n;
  let rest = n;
  for (let d = 2; d * d <= rest; d += 1) {
    if (rest % d !== 0) continue;
    while (rest % d === 0) rest /= d;
    result -= result / d;
  }
  if (rest > 1) result -= result / rest;
  return result;
}

/** @param {number} n @returns {number} */
function mu(n) {
  assert.ok(Number.isInteger(n) && n > 0);
  let rest = n;
  let sign = 1;
  for (let d = 2; d * d <= rest; d += 1) {
    if (rest % d !== 0) continue;
    rest /= d;
    sign = -sign;
    if (rest % d === 0) return 0;
  }
  return rest > 1 ? -sign : sign;
}

/** @param {number} base @param {number} exponent @param {number} modulus */
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

/** @param {number} base @param {number} target @param {number} modulus */
function discreteLog(base, target, modulus) {
  const hits = [];
  for (let exponent = 1; exponent < modulus; exponent += 1) {
    if (powMod(base, exponent, modulus) === target) hits.push(exponent);
  }
  return hits;
}

/** @param {string} text @returns {number[][]} */
function parseWords(text) {
  const normalized = text.replace(/\/\s*/gu, "");
  return (normalized.match(/[\u16A0-\u16FF]+/gu) || []).map((word) =>
    [...word].map((rune) => {
      const value = runeIndex.get(rune);
      assert.notEqual(value, undefined);
      return value;
    })
  );
}

/** @param {string} line @returns {number[]} */
function lineRunes(line) {
  return [...line]
    .map((rune) => runeIndex.get(rune))
    .filter((value) => value !== undefined);
}

const parts = transcription.split(/^\s*%\s*$/m);
const p28Text = parts[28];
const p28Words = parseWords(p28Text);
const p28Lines = p28Text.trim().split("/").filter((line) => line.trim().length > 0);
assert.equal(p28Words.length, 59);
assert.equal(p28Lines.length, 12);

const selectedWord = p28Words[27];
assert.deepEqual(selectedWord, [28, 24, 10, 1, 20]);
assert.equal(selectedWord.length, 5);

let wordOffset = 0;
const wordSpans = p28Words.map((word) => {
  const start = wordOffset;
  wordOffset += word.length;
  return { start, end: wordOffset - 1, values: word };
});
let lineOffset = 0;
const lineSpans = p28Lines.map((line) => {
  const values = lineRunes(line);
  const row = { start: lineOffset, end: lineOffset + values.length - 1, values };
  lineOffset += values.length;
  return row;
});
const selectedSpan = wordSpans[27];
const selectedLineNumber = 6;
const selectedLine = lineSpans[selectedLineNumber - 1];
const localStart = selectedSpan.start - selectedLine.start + 1;
assert.equal(selectedLine.values.length, 23);
assert.equal(localStart, 19);

// Derive the already established p28 DH23 state from original layout.
const p = selectedLine.values.length;
const g = selectedWord.length;
const a = selectedLineNumber;
const B = localStart;
const bHits = discreteLog(g, B, p);
assert.deepEqual(bHits, [15]);
const b = bHits[0];
const A = powMod(g, a, p);
const K = powMod(B, a, p);
const e = g - K;
const q = e + 1;
assert.deepEqual(
  { p, g, a, b, A, B, K, e, q },
  { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2, e: 3, q: 4 },
);

const pages = corpus.pages.filter((page) => page.page <= 2);
const pageCounts = pages.map((page) => page.indices.length);
assert.deepEqual(pageCounts, [262, 266, 201]);
const grid = pages.flatMap((page) => page.indices);

// The independently recovered state fixes both opening-chapter area and side.
assert.equal(grid.length, 729);
assert.equal(e ** a, 729);
const side = mod29(-K);
assert.equal(side, 27);
assert.equal(side ** 2, grid.length);

/** @param {number} index @returns {[number, number]} */
function coord(index) {
  return [Math.floor(index / side) + 1, index % side + 1];
}

/** @param {number} row @param {number} col @returns {number} */
function index(row, col) {
  assert.ok(row >= 1 && row <= side && col >= 1 && col <= side);
  return (row - 1) * side + col - 1;
}

/** @param {number[]} values @returns {string} */
function translit(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

const p0End = pageCounts[0] - 1;
const p1Start = pageCounts[0];
const p1End = pageCounts[0] + pageCounts[1] - 1;
const p2Start = pageCounts[0] + pageCounts[1];
const p2End = grid.length - 1;

// Physical page boundaries land on compact DH-state coordinates.
assert.deepEqual(coord(p0End), [mod29(-B), B]);
assert.deepEqual(coord(p1Start), [mod29(-B), p - e]);
assert.deepEqual(coord(p1End), [p - e, b]);
assert.deepEqual(coord(p2Start), [p - e, mod29(K - b)]);
assert.deepEqual(coord(p2End), [mod29(-K), mod29(-K)]);

// The visible p0 red count is the state difference b-K.
const p0Ink = ink.pages.find((page) => page.page === 0);
assert.ok(p0Ink);
assert.equal(p0Ink.red_spans[0].length, b - K);
const n = b - K;
assert.equal(n, 13);
assert.equal(phi(n), 12);

const directions = [
  ["H", 0, 1],
  ["V", 1, 0],
  ["D1", 1, 1],
  ["D2", 1, -1],
];

/**
 * Find exact oriented triples on the 27x27 grid.
 * @param {number[]} target
 * @param {number[]} radii
 */
function findTriples(target, radii) {
  const hits = [];
  for (const radius of radii) {
    for (let row = 1; row <= side; row += 1) {
      for (let col = 1; col <= side; col += 1) {
        for (const [name, dr, dc] of directions) {
          const points = [
            [row, col],
            [row + radius * dr, col + radius * dc],
            [row + 2 * radius * dr, col + 2 * radius * dc],
          ];
          if (points.some(([r, c]) =>
            r < 1 || r > side || c < 1 || c > side)) continue;
          const values = points.map(([r, c]) => grid[index(r, c)]);
          if (values.every((value, i) => value === target[i])) {
            hits.push({ name, radius, points, values });
          }
        }
      }
    }
  }
  return hits;
}

/** @param {number[]} raw @param {boolean} transformCenter */
function deriveExternalKey(raw, transformCenter) {
  const derived = raw.slice();
  if (transformCenter) derived[1] = phi(derived[1]);
  const rotation = mod29(
    derived.reduce((sum, value) => sum + mu(phi(value)), 0),
  ) % 3;
  return derived.slice(rotation).concat(derived.slice(0, rotation));
}

/** @param {number[]} pathIndices @param {number[]} key */
function decrypt(pathIndices, key) {
  return pathIndices.map((sourceIndex, i) =>
    mod29(grid[sourceIndex] - key[i % key.length]));
}

// Block 1 source node: state-typed, exact and unique at the red13/totient anchor.
const block1Raw = [mod29(-q), B - A, mod29(-1)];
assert.deepEqual(block1Raw, [25, 11, 28]);
assert.deepEqual(block1Raw.map((v) => corpus.translit[v]), ["AE", "J", "EA"]);
const block1Hits = findTriples(block1Raw, [1]);
assert.deepEqual(block1Hits.map((hit) => ({
  name: hit.name,
  points: hit.points,
})), [{
  name: "H",
  points: [[13, 11], [13, 12], [13, 13]],
}]);
assert.deepEqual(block1Hits[0].points[1], [n, phi(n)]);

// Its center follows a closed state totient ladder.
assert.equal(phi(B - A), mod29(-B));
assert.equal(phi(mod29(-B)), q);
const block1Distance = phi(B - A) + phi(mod29(-B));
assert.equal(block1Distance, mod29(-b));
assert.equal(block1Distance, 14);

const block1Start = [
  block1Hits[0].points[0][0],
  block1Hits[0].points[0][1] + block1Distance,
];
assert.deepEqual(block1Start, [b - K, mod29(-q)]);
assert.deepEqual(block1Start, [13, 25]);

// The pre-existing endpoint is independently state-typed and unique.
const endpointRaw = [mod29(-b), p - 1, mod29(-b)];
assert.deepEqual(endpointRaw, [14, 22, 14]);
assert.deepEqual(endpointRaw.map((v) => corpus.translit[v]), ["X", "OE", "X"]);
const endpointHits = findTriples(endpointRaw, [1]);
assert.deepEqual(endpointHits.map((hit) => ({
  name: hit.name,
  points: hit.points,
})), [{
  name: "H",
  points: [[14, 4], [14, 5], [14, 6]],
}]);
assert.deepEqual(endpointHits[0].points[0], [mod29(-b), q]);
assert.deepEqual(endpointHits[0].points[1], [mod29(-b), g]);
assert.equal(phi(p - 1), mod29(-B));
assert.deepEqual(
  [endpointHits[0].points[0][0],
    endpointHits[0].points[0][1] + phi(p - 1)],
  [mod29(-b), mod29(-b)],
);

const block1Path = [348, 349, 350, 351, 352, 353, 354];
assert.deepEqual(coord(block1Path[0]), block1Start);
assert.deepEqual(coord(block1Path.at(-1)), endpointHits[0].points[0]);
const block1Key = deriveExternalKey(block1Raw, true);
assert.deepEqual(block1Key, [mod29(-q), mod29(-B), mod29(-1)]);
const block1Plain = decrypt(block1Path, block1Key);
assert.equal(translit(block1Plain), "ASIGOTHE");

// Block 2 endpoint transform and physical-boundary geometry remain state-typed.
const block2Path = [364, 365, 366, 367, 368];
const block2Key = deriveExternalKey(endpointRaw, true);
assert.deepEqual(block2Key, [mod29(-b), mod29(-b), mod29(-B)]);
assert.deepEqual(coord(block2Path[0]), [mod29(-b), mod29(-b)]);
assert.equal(block2Path.length, g);
assert.deepEqual(coord(block2Path.at(-1)), [mod29(-b), A - B + 29]);
assert.equal(coord(p0End)[1], B);
const block2Plain = decrypt(block2Path, block2Key);
assert.equal(translit(block2Plain), "WEATHER");

// Block 3 source object and ciphertext path are state packets.
// [A,-A,g] occurs twice over all radii; the selected object is fixed by the
// existing half-turn geometry at center (-b,p) with radius -B.
const block3Raw = [A, mod29(-A), g];
const block3AllHits = findTriples(block3Raw,
  Array.from({ length: 13 }, (_, i) => i + 1));
assert.equal(block3AllHits.length, 2);
const selectedBlock3 = block3AllHits.find((hit) =>
  hit.name === "V" &&
  hit.radius === mod29(-B) &&
  hit.points[1][0] === mod29(-b) &&
  hit.points[1][1] === p);
assert.ok(selectedBlock3);
assert.deepEqual(selectedBlock3.points, [
  [q, p],
  [mod29(-b), p],
  [mod29(-g), p],
]);

const block3Path = [369, 342, 315, 288, 261];
assert.deepEqual(coord(block3Path[0]), [mod29(-b), B]);
assert.deepEqual(coord(block3Path.at(-1)), [mod29(-B), B]);
assert.equal(block3Path.length, g);
assert.equal(block3Path.at(-1), p0End);
const block3Key = deriveExternalKey(block3Raw, false);
assert.deepEqual(block3Key, block3Raw);
const block3Plain = decrypt(block3Path, block3Key);
assert.equal(translit(block3Plain), "TURNS");

// First p1 candidate block: its frozen route is likewise state-typed.
const block4Raw = [A, K, A];
const block4Hits = findTriples(block4Raw, [1]);
assert.deepEqual(block4Hits.map((hit) => ({
  name: hit.name,
  points: hit.points,
})), [{
  name: "V",
  points: [[mod29(-q), B], [mod29(-e), B], [mod29(-K), B]],
}]);
const block4Key = deriveExternalKey(block4Raw, true);
assert.deepEqual(block4Key, [1, A, A]);
const block4Path = [357, 330, 303, 276];
assert.deepEqual(coord(block4Path[0]), [mod29(-b), g + K]);
assert.deepEqual(coord(block4Path.at(-1)), [B - A, g + K]);
assert.equal(block4Path.length, q);
const block4Plain = decrypt(block4Path, block4Key);
assert.equal(translit(block4Plain), "COLD");

// The frozen post-TURNS 12-step geometry is exactly the p0 state geometry.
assert.equal(phi(b - K), 12);
assert.deepEqual(
  [
    coord(block3Path[0]),
    block4Hits[0].points[1],
    coord(block4Path[0]),
  ],
  [
    [mod29(-b), B],
    [mod29(-e), B],
    [mod29(-b), g + K],
  ],
);
assert.equal(block4Hits[0].points[1][0] - coord(block3Path[0])[0], 12);
assert.equal(coord(block3Path[0])[1] - coord(block4Path[0])[1], 12);

// Exact forward replay on every recovered candidate rune.
for (const [pathIndices, key, plain] of [
  [block1Path, block1Key, block1Plain],
  [block2Path, block2Key, block2Plain],
  [block3Path, block3Key, block3Plain],
  [block4Path, block4Key, block4Plain],
]) {
  pathIndices.forEach((sourceIndex, i) => {
    assert.equal(mod29(plain[i] + key[i % key.length]), grid[sourceIndex]);
  });
}

console.log(JSON.stringify({
  status: "PASS",
  dh23: { p, g, a, b, A, B, K, e, q },
  chapter: {
    runeCount: grid.length,
    ePowA: e ** a,
    side,
    sideExpression: "-K mod29",
    pageCounts,
    pageBoundaryCoordinates: {
      p0End: coord(p0End),
      p1Start: coord(p1Start),
      p1End: coord(p1End),
      p2Start: coord(p2Start),
      p2End: coord(p2End),
    },
  },
  block1: {
    raw: block1Raw,
    rawTranslit: translit(block1Raw),
    centerTotientChain: [B - A, phi(B - A), phi(phi(B - A))],
    movement: block1Distance,
    start: block1Start,
    endpoint: endpointHits[0].points,
    key: block1Key,
    plaintextCandidate: translit(block1Plain),
  },
  block2: {
    key: block2Key,
    path: block2Path.map(coord),
    plaintextCandidate: translit(block2Plain),
  },
  block3: {
    raw: block3Raw,
    selectedSource: selectedBlock3,
    allRawPacketHits: block3AllHits,
    path: block3Path.map(coord),
    plaintextCandidate: translit(block3Plain),
  },
  block4: {
    raw: block4Raw,
    uniqueSource: block4Hits[0],
    key: block4Key,
    path: block4Path.map(coord),
    plaintextCandidate: translit(block4Plain),
  },
  classification:
    "Independent DH23-state lock on the pre-existing 27x27 route. It strongly compresses the opening geometry and candidate plaintext, while route operations were discovered retrospectively and therefore remain below authenticated unknown-page plaintext.",
}, null, 2));
