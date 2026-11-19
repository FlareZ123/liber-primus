"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
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

/** @param {number} base @param {number} target @param {number} modulus @returns {number[]} */
function discreteLog(base, target, modulus) {
  const hits = [];
  for (let exponent = 1; exponent < modulus; exponent += 1) {
    if (powMod(base, exponent, modulus) === target) hits.push(exponent);
  }
  return hits;
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

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
const selectedWord = p28Words[27];

let wordOffset = 0;
const wordSpans = p28Words.map((word) => {
  const start = wordOffset;
  wordOffset += word.length;
  return {start, values: word};
});
let lineOffset = 0;
const lineSpans = p28Lines.map((line) => {
  const values = lineRunes(line);
  const row = {start: lineOffset, end: lineOffset + values.length - 1, values};
  lineOffset += values.length;
  return row;
});

const selectedSpan = wordSpans[27];
const selectedLineNumber = 6;
const selectedLine = lineSpans[selectedLineNumber - 1];
const localStart = selectedSpan.start - selectedLine.start + 1;

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
  {p,g,a,b,A,B,K,e,q},
  {p:23,g:5,a:6,b:15,A:8,B:19,K:2,e:3,q:4}
);

const grid = corpus.pages.filter((page) => page.page <= 2).flatMap((page) => page.indices);
const side = mod29(-K);
assert.equal(side, 27);
assert.equal(grid.length, side * side);

/** @param {number} row @param {number} col @returns {number} */
function index(row, col) {
  assert.ok(row >= 1 && row <= side && col >= 1 && col <= side);
  return (row - 1) * side + col - 1;
}

/** @param {number} row @param {number} col @returns {number} */
function value(row, col) {
  return grid[index(row, col)];
}

const directions = [
  ["H",0,1],
  ["V",1,0],
  ["D1",1,1],
  ["D2",1,-1],
];

/** @param {number[]} target @returns {Array<{radius:number,axis:string,points:number[][]}>} */
function findExactTriples(target) {
  const hits = [];
  for (let radius = 1; radius <= 13; radius += 1) {
    for (const [axis, dr, dc] of directions) {
      for (let row = 1; row <= side; row += 1) {
        for (let col = 1; col <= side; col += 1) {
          const points = [
            [row, col],
            [row + radius * dr, col + radius * dc],
            [row + 2 * radius * dr, col + 2 * radius * dc],
          ];
          if (points.some(([r,c]) => r < 1 || r > side || c < 1 || c > side)) continue;
          const values = points.map(([r,c]) => value(r,c));
          if (values.every((v,i) => v === target[i])) hits.push({radius, axis, points});
        }
      }
    }
  }
  return hits;
}

// Inputs known before the block9 precommit from the already opened block8 geometry.
const block8End = [p - a, mod29(A - B)];
assert.deepEqual(block8End, [17,18]);
assert.equal(value(...block8End), p);

// Prospective block9 packet: center is exactly the prior block endpoint.
const block9Packet = [B - A, p, B - A];
const block9Hits = findExactTriples(block9Packet);
assert.deepEqual(block9Hits, [{
  radius: K,
  axis: "D2",
  points: [[15,20],[17,18],[19,16]],
}]);
assert.deepEqual(block9Hits[0].points[1], block8End);

// Prospective block10 packet: the lower block9 outer becomes the next node center.
const block9LowerOuter = block9Hits[0].points[2];
assert.deepEqual(block9LowerOuter, [B, mod29(K - b)]);
const block10Packet = [p - 1, B - A, p - 1];
const block10Hits = findExactTriples(block10Packet);
assert.deepEqual(block10Hits, [{
  radius: e - K,
  axis: "V",
  points: [[18,16],[19,16],[20,16]],
}]);
assert.deepEqual(block10Hits[0].points[1], block9LowerOuter);

// Negative control from the later failed block11 gate: a state-looking packet need not be globally unique.
const block11Packet = [B - A, p - a, B - A];
const block11Hits = findExactTriples(block11Packet);
assert.equal(block11Hits.length, 2);

console.log(JSON.stringify({
  status: "PASS",
  dh23: {p,g,a,b,A,B,K,e,q},
  block9ProspectiveNode: {
    priorBlock8Endpoint: block8End,
    packet: block9Packet,
    globalExactHits: block9Hits,
    sealedCommitBeforeInspection: "783177e73c02a01e43ad9e2d4e97e58b33ec9897",
    outcome: "published block9 key node matched exactly",
  },
  block10ProspectiveNode: {
    priorBlock9Outer: block9LowerOuter,
    packet: block10Packet,
    globalExactHits: block10Hits,
    sealedCommitBeforeInspection: "90bac1d2d94090c15f48972d359596c8ca0358a8",
    outcome: "published block10 key node matched exactly",
  },
  control: {
    laterBlock11Packet: block11Packet,
    exactHitCount: block11Hits.length,
    note: "State expressibility alone does not imply uniqueness; the later block11 selection attempt failed prospectively.",
  },
  decision:
    "Retain two consecutive prospective exact key-node predictions as evidence that the independent DH23 state constrains the 27x27 route. Do not infer ciphertext paths or plaintext from these node hits alone.",
}, null, 2));
