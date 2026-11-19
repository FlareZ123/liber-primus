"use strict";

/**
 * SFT: p0 original 13-dot marker geometry authenticates the EPIPHANY SEEKS
 * residual key against the independently reconstructed DH state.
 *
 * Node.js 22, CommonJS, read-only.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const ink = JSON.parse(read("resources/liber-primus/lp2-p0-physical-ink-override.json"));

const M = 29;
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
const markerGroups = Object.freeze({
  L: Object.freeze([1, 4, 7, 10]),
  C: Object.freeze([0, 3, 6, 9, 12]),
  R: Object.freeze([2, 5, 8, 11]),
});
const markerScanColumns = Object.freeze([
  "C", "L", "R", "C", "L", "R", "C", "L", "R", "C", "L", "R", "C",
]);

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % M) + M) % M;
}

/** @param {number[]} values @returns {number} */
function sum29(values) {
  return mod29(values.reduce((sum, value) => sum + value, 0));
}

/**
 * Interleaved outside-in H.
 * @param {number[]} values
 * @returns {number[]}
 */
function H(values) {
  const out = [];
  for (let left = 0, right = values.length - 1; left < right; left += 1, right -= 1) {
    out.push(mod29(values[left] - values[right]));
    out.push(mod29(values[left] + values[right]));
  }
  if (values.length % 2 === 1) {
    out.push(values[(values.length - 1) / 2]);
  }
  return out;
}

/**
 * Parse Latin text into the repository GP29 alphabet.
 * @param {string} text
 * @returns {number[]}
 */
function gpText(text) {
  const normalized = text
    .toUpperCase()
    .replace(/K/g, "C")
    .replace(/V/g, "U")
    .replace(/Q/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const out = [];
  for (let index = 0; index < normalized.length;) {
    const token = gpTokens.find((row) => normalized.startsWith(row.symbol, index));
    assert.ok(token, "unmapped GP spelling: " + normalized.slice(index));
    out.push(token.value);
    index += token.symbol.length;
  }
  return out;
}

/**
 * Split rune-native text into rune words.
 * @param {string} source
 * @returns {number[][]}
 */
function runeWords(source) {
  const out = [];
  let current = [];
  for (const character of [...source]) {
    const value = runeIndex.get(character);
    if (value !== undefined) {
      current.push(value);
    } else if (current.length) {
      out.push(current);
      current = [];
    }
  }
  if (current.length) out.push(current);
  return out;
}

/**
 * Assign thirteen sequential atoms to the physical marker's scan rows, sum
 * the three visible columns, then H the [left,center,right] column vector.
 *
 * The original-image SFT independently fixes these index groups from the JPEG.
 *
 * @param {number[]} values
 * @param {boolean} mirror
 * @returns {{columns:number[], packet:number[]}}
 */
function visualMarkerPacket(values, mirror = false) {
  assert.equal(values.length, 13);
  const leftGroup = mirror ? markerGroups.R : markerGroups.L;
  const rightGroup = mirror ? markerGroups.L : markerGroups.R;
  const columns = [
    sum29(leftGroup.map((index) => values[index])),
    sum29(markerGroups.C.map((index) => values[index])),
    sum29(rightGroup.map((index) => values[index])),
  ];
  return {columns, packet: H(columns)};
}

assert.deepEqual(markerScanColumns, [
  "C", "L", "R", "C", "L", "R", "C", "L", "R", "C", "L", "R", "C",
]);
assert.equal(
  [...markerGroups.L, ...markerGroups.C, ...markerGroups.R].sort((a, b) => a - b).join(","),
  [...Array(13).keys()].join(",")
);

const cipher = ink.physical_zero_based.red_words.flatMap((word) => word.gp_indices);
assert.deepEqual(cipher, [
  15, 8, 18, 3, 6, 19, 27, 0,
  15, 26, 18, 21, 5,
]);

const plain = [...gpText("EPIPHANY"), ...gpText("SEEKS")];
assert.equal(plain.length, 13);
const key = cipher.map((value, index) => mod29(value - plain[index]));
assert.deepEqual(key, [
  26, 24, 8, 19, 27, 24, 18, 3,
  0, 8, 0, 16, 19,
]);

const keyVisual = visualMarkerPacket(key);
assert.deepEqual(keyVisual.columns, [
  mod29(-state.q),
  state.e,
  state.B,
]);
assert.deepEqual(keyVisual.columns, [25, 3, 19]);
assert.deepEqual(keyVisual.packet, [state.a, state.b, state.e]);
assert.deepEqual(keyVisual.packet, [6, 15, 3]);

const mirroredKeyVisual = visualMarkerPacket(key, true);
assert.deepEqual(mirroredKeyVisual.packet, [mod29(-state.a), state.b, state.e]);
assert.deepEqual(mirroredKeyVisual.packet, [23, 15, 3]);

const clear = signed
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .replace(/^-----BEGIN PGP SIGNED MESSAGE-----[\s\S]*?Hash: SHA1\s*/, "")
  .replace(/\b3301\b/g, "")
  .replace(/\b[0-9A-F]{8,}\b/g, "");

const signedWords = (clear.match(/[A-Za-z]+/g) || []).map((text) => ({
  text: text.toUpperCase(),
  values: gpText(text),
  source: "signed2016",
}));
assert.equal(signedWords.length, 43);

const lexicalPool = new Map();
for (const section of solved.sections) {
  for (const values of runeWords(section.source_text)) {
    const text = values.map((value) => corpus.translit[value]).join("");
    lexicalPool.set(text, {text, values, source: "solved"});
  }
}
for (const row of signedWords) {
  lexicalPool.set(row.text, row);
}

const length8 = [...lexicalPool.values()].filter((row) => row.values.length === 8);
const length5 = [...lexicalPool.values()].filter((row) => row.values.length === 5);
assert.equal(lexicalPool.size, 295);
assert.equal(length8.length, 18);
assert.equal(length5.length, 38);

const exactTarget = [state.a, state.b, state.e];
const exactHits = [];
const mirroredExactHits = [];
const permutationHits = [];
let lexicalCases = 0;

const permutations = [
  [state.a, state.b, state.e],
  [state.a, state.e, state.b],
  [state.b, state.a, state.e],
  [state.b, state.e, state.a],
  [state.e, state.a, state.b],
  [state.e, state.b, state.a],
];
const permutationSet = new Set(permutations.map((row) => row.join(",")));

for (const sign of [1, -1]) {
  for (const left of length8) {
    for (const right of length5) {
      lexicalCases += 1;
      const candidate = [...left.values, ...right.values];
      const candidateKey = cipher.map((value, index) =>
        mod29(sign === 1 ? value - candidate[index] : candidate[index] - value)
      );
      const physical = visualMarkerPacket(candidateKey);
      const mirrored = visualMarkerPacket(candidateKey, true);
      const row = {
        sign: sign === 1 ? "C-P" : "P-C",
        left: left.text,
        right: right.text,
        leftSource: left.source,
        rightSource: right.source,
      };

      if (physical.packet.every((value, index) => value === exactTarget[index])) {
        exactHits.push({...row, packet: physical.packet});
      }
      if (mirrored.packet.every((value, index) => value === exactTarget[index])) {
        mirroredExactHits.push({...row, packet: mirrored.packet});
      }

      for (const [orientation, packet] of [
        ["physical", physical.packet],
        ["horizontal-mirror", mirrored.packet],
      ]) {
        if (permutationSet.has(packet.join(","))) {
          permutationHits.push({...row, orientation, packet});
        }
      }
    }
  }
}

assert.equal(lexicalCases, 1368);
assert.deepEqual(exactHits, [{
  sign: "C-P",
  left: "EPIPHANY",
  right: "SEEKS",
  leftSource: "signed2016",
  rightSource: "signed2016",
  packet: [6, 15, 3],
}]);
assert.deepEqual(mirroredExactHits, []);
assert.equal(permutationHits.length, 3);

console.log(JSON.stringify({
  status: "PASS",
  marker: {
    scanColumns: markerScanColumns,
    indexGroups: markerGroups,
  },
  target: {
    phrase: "EPIPHANY SEEKS",
    key,
    visualColumns: keyVisual.columns,
    visualColumnTyping: ["-q", "e", "B"],
    visualPacket: keyVisual.packet,
    visualPacketTyping: ["a", "b", "e"],
    horizontalMirrorPacket: mirroredKeyVisual.packet,
  },
  controls: {
    lexicalPool: lexicalPool.size,
    length8: length8.length,
    length5: length5.length,
    lexicalCases,
    exactPhysicalHits: exactHits,
    exactMirroredHits: mirroredExactHits,
    permutationHits,
  },
}, null, 2));
