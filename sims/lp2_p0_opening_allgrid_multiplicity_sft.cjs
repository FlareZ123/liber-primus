"use strict";

/**
 * SFT: all-grid multiplicity audit for the source-bounded p0 opening.
 *
 * Freezes the published Block-1 transform, its globally unique X-OE-X
 * endpoint, original p0-p2 source word boundaries, and native-GP vocabulary.
 * It evaluates every in-bounds three-cell anchor/axis state on the original
 * 27x27 grid, then separately evaluates the matched red-count family
 * n=1..27 using anchors (n,phi(n)) and (phi(n),n).
 *
 * Blocks 2 and 3 are deterministic once the fixed endpoint is reached:
 * X-OE-X -> matrix center -> physical p0 boundary. Therefore multiplicity of
 * the first three-block bootstrap reduces to multiplicity of source-compatible
 * Block-1 states that reach the endpoint.
 *
 * Run:
 *   node sims/lp2_p0_opening_allgrid_multiplicity_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} file */
function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8").replace(/\r\n/g, "\n");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const master = read("resources/transcriptions/liber_primus_master.txt");
const dictionary = read("resources/control/english_wordfreq_textblob.txt");

const translit = corpus.translit;
const runeSet = new Set(corpus.runes);
const pages = corpus.pages.filter(page => page.page <= 2);
const grid = pages.flatMap(page => page.indices);
assert.equal(grid.length, 729);

const side = 27;

/** @param {[number, number]} point */
function position([row, column]) {
  return (row - 1) * side + column - 1;
}

/** @param {number} index */
function coordinate(index) {
  return [Math.floor(index / side) + 1, index % side + 1];
}

/** @param {[number, number]} point */
function at(point) {
  return grid[position(point)];
}

/** @param {[number, number]} point */
function inBounds([row, column]) {
  return row >= 1 && row <= side && column >= 1 && column <= side;
}

/** @param {number} value */
function mod29(value) {
  return (value % 29 + 29) % 29;
}

/** @param {number} n */
function phi(n) {
  assert.ok(Number.isInteger(n) && n > 0);
  let value = n;
  let rest = n;
  for (let p = 2; p * p <= rest; p++) {
    if (rest % p !== 0) continue;
    while (rest % p === 0) rest /= p;
    value -= value / p;
  }
  if (rest > 1) value -= value / rest;
  return value;
}

/** @param {number} n */
function mu(n) {
  assert.ok(Number.isInteger(n) && n > 0);
  let rest = n;
  let sign = 1;
  for (let p = 2; p * p <= rest; p++) {
    if (rest % p !== 0) continue;
    rest /= p;
    sign = -sign;
    if (rest % p === 0) return 0;
  }
  return rest > 1 ? -sign : sign;
}

/** @param {number[]} raw */
function deriveKey(raw) {
  if (raw[1] === 0) return null;
  const derived = [raw[0], phi(raw[1]), raw[2]];
  if (derived.some(value => value <= 0)) return null;
  const rotation = ((derived.reduce(
    (sum, value) => sum + mu(phi(value)), 0,
  ) % 3) + 3) % 3;
  return {
    derived,
    rotation,
    key: derived.slice(rotation).concat(derived.slice(0, rotation)),
  };
}

const tokenOrder = translit.map((token, ordinal) => ({token, ordinal}))
  .sort((a, b) => b.token.length - a.token.length);

/** @param {string} original */
function encodeNativeGP(original) {
  const clean = original.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < clean.length;) {
    if (clean.startsWith("ING", i)) {
      out.push(21);
      i += 3;
      continue;
    }
    if (clean.startsWith("IO", i)) {
      out.push(27);
      i += 2;
      continue;
    }
    const row = tokenOrder.find(item => clean.startsWith(item.token, i));
    if (!row) return null;
    out.push(row.ordinal);
    i += row.token.length;
  }
  return out;
}

const nativeWords = new Set();
for (const line of dictionary.split("\n")) {
  const match = /^([a-z]+) (\d+)$/.exec(line.trim());
  if (!match) continue;
  const encoded = encodeNativeGP(match[1]);
  if (encoded) nativeWords.add(encoded.join(","));
}

// Exact source word segmentation over the p0-p2 729-rune span.
const heading = corpus.pages[0].indices.slice(0, 8)
  .map(index => corpus.runes[index]).join("")
  + "-"
  + corpus.pages[0].indices.slice(8, 13)
    .map(index => corpus.runes[index]).join("");
const sourceStart = master.indexOf(heading);
assert.ok(sourceStart >= 0);

const sourceWords = [];
let currentWord = [];
let globalRune = 0;
for (let i = sourceStart; i < master.length && globalRune < grid.length; i++) {
  const ch = master[i];
  if (runeSet.has(ch)) {
    currentWord.push(globalRune++);
    continue;
  }
  if (currentWord.length && "-.$%&/\n".includes(ch)) {
    sourceWords.push(currentWord);
    currentWord = [];
  }
}
if (currentWord.length) sourceWords.push(currentWord);
assert.equal(globalRune, 729);
assert.equal(sourceWords.length, 182);

const wordIndexByStart = new Map(sourceWords.map((word, index) => [word[0], index]));
const wordIndexByEnd = new Map(sourceWords.map((word, index) => [word.at(-1), index]));

// The published globally unique endpoint remains frozen.
const matrixCenterIndex = position([14, 14]);
const endpointCandidates = [];
for (let index = 0; index + 2 < grid.length; index++) {
  const [row, column] = coordinate(index);
  if (column > 25) continue;
  const raw = [grid[index], grid[index + 1], grid[index + 2]];
  if (raw[0] !== raw[2] || raw[1] === 0) continue;
  if (index + phi(raw[1]) === matrixCenterIndex) endpointCandidates.push(index);
}
assert.deepEqual(endpointCandidates, [354]);
const endpoint = endpointCandidates[0];
const endpointWordIndex = wordIndexByEnd.get(endpoint);
assert.equal(endpointWordIndex, 91);
assert.deepEqual(coordinate(endpoint), [14, 4]);

/**
 * @param {number} startIndex
 * @param {number[]} key
 * @returns {{wordCount:number, allNative:boolean}}
 */
function evaluateSourceRun(startIndex, key) {
  const startWordIndex = wordIndexByStart.get(startIndex);
  if (startWordIndex === undefined || startWordIndex > endpointWordIndex) {
    return {wordCount: 0, allNative: false};
  }

  let keyClock = 0;
  let allNative = true;
  for (let wordIndex = startWordIndex; wordIndex <= endpointWordIndex; wordIndex++) {
    const word = sourceWords[wordIndex];
    const plain = word.map((sourceIndex, offset) =>
      mod29(grid[sourceIndex] - key[(keyClock + offset) % key.length]));
    keyClock += word.length;
    if (!nativeWords.has(plain.join(","))) allNative = false;
  }

  return {
    wordCount: endpointWordIndex - startWordIndex + 1,
    allNative,
  };
}

const axes = [
  ["H", 0, 1],
  ["V", 1, 0],
  ["NWSE", 1, 1],
  ["NESW", 1, -1],
];

/**
 * Apply the frozen opening rule to one anchor/axis state.
 * @param {[number, number]} anchor
 * @param {[string, number, number]} axis
 */
function evaluateState(anchor, axis) {
  const [axisName, dr, dc] = axis;
  const first = [anchor[0] - dr, anchor[1] - dc];
  const last = [anchor[0] + dr, anchor[1] + dc];
  if (!inBounds(first) || !inBounds(last)) return null;

  const raw = [at(first), at(anchor), at(last)];
  const derivation = deriveKey(raw);
  if (!derivation) return {rawState: true, executable: false};

  const distance = phi(raw[1]) + phi(derivation.derived[1]);
  const start = [
    first[0] + dr * distance,
    first[1] + dc * distance,
  ];
  if (!inBounds(start)) return {rawState: true, executable: false};

  const startIndex = position(start);
  if (startIndex > endpoint) return {rawState: true, executable: false};

  const run = evaluateSourceRun(startIndex, derivation.key);
  return {
    rawState: true,
    executable: true,
    sourceAligned: run.wordCount > 0,
    allNative: run.allNative,
    anchor,
    axis: axisName,
    start,
    startIndex,
    wordCount: run.wordCount,
    key: derivation.key,
  };
}

// Strict all-grid census.
const allGrid = {
  rawStates: 0,
  executable: 0,
  sourceAligned: 0,
  allNative: 0,
  winners: [],
};

for (let row = 1; row <= side; row++) {
  for (let column = 1; column <= side; column++) {
    for (const axis of axes) {
      const result = evaluateState([row, column], axis);
      if (!result) continue;
      allGrid.rawStates++;
      if (!result.executable) continue;
      allGrid.executable++;
      if (!result.sourceAligned) continue;
      allGrid.sourceAligned++;
      if (!result.allNative) continue;
      allGrid.allNative++;
      allGrid.winners.push(result);
    }
  }
}

assert.equal(allGrid.rawStates, 2600);
assert.equal(allGrid.executable, 373);
assert.equal(allGrid.sourceAligned, 105);
assert.equal(allGrid.allNative, 1);
assert.equal(allGrid.winners.length, 1);

const winner = allGrid.winners[0];
assert.deepEqual(winner.anchor, [13, 12]);
assert.equal(winner.axis, "H");
assert.deepEqual(winner.start, [13, 25]);
assert.equal(winner.startIndex, 348);
assert.equal(winner.wordCount, 4);
assert.deepEqual(winner.key.map(index => translit[index]), ["AE", "I", "EA"]);

// Matched source-state family: vary only the visible count n=1..27 while
// keeping n -> phi(n), the two coordinate orders and all four axes fixed.
const countFamily = {
  nStates: 27,
  nStatesWithGeometry: 0,
  nStatesWithSourceAligned: 0,
  nStatesWithAllNative: 0,
  geometryCandidates: 0,
  sourceAlignedCandidates: 0,
  allNativeCandidates: 0,
  winners: [],
};

for (let n = 1; n <= 27; n++) {
  const p = phi(n);
  const anchors = [];
  for (const anchor of [[n, p], [p, n]]) {
    if (!anchors.some(row => row[0] === anchor[0] && row[1] === anchor[1])) {
      anchors.push(anchor);
    }
  }

  let hasGeometry = false;
  let hasSourceAligned = false;
  let hasAllNative = false;

  for (const anchor of anchors) {
    for (const axis of axes) {
      const result = evaluateState(anchor, axis);
      if (!result) continue;
      if (result.rawState && result.executable) {
        hasGeometry = true;
        countFamily.geometryCandidates++;
      }
      if (!result.sourceAligned) continue;
      hasSourceAligned = true;
      countFamily.sourceAlignedCandidates++;
      if (!result.allNative) continue;
      hasAllNative = true;
      countFamily.allNativeCandidates++;
      countFamily.winners.push({n, phi: p, ...result});
    }
  }

  if (hasGeometry) countFamily.nStatesWithGeometry++;
  if (hasSourceAligned) countFamily.nStatesWithSourceAligned++;
  if (hasAllNative) countFamily.nStatesWithAllNative++;
}

assert.equal(countFamily.nStatesWithGeometry, 16);
assert.equal(countFamily.nStatesWithSourceAligned, 11);
assert.equal(countFamily.nStatesWithAllNative, 1);
assert.equal(countFamily.geometryCandidates, 48);
assert.equal(countFamily.sourceAlignedCandidates, 17);
assert.equal(countFamily.allNativeCandidates, 1);
assert.equal(countFamily.winners.length, 1);
assert.equal(countFamily.winners[0].n, 13);
assert.deepEqual(countFamily.winners[0].anchor, [13, 12]);
assert.equal(countFamily.winners[0].axis, "H");

// Once the endpoint is fixed, Blocks 2 and 3 contain no candidate-dependent
// choices. Assert their source geometry still reproduces the published states.
const endpointRaw = [grid[endpoint], grid[endpoint + 1], grid[endpoint + 2]];
assert.deepEqual(endpointRaw.map(index => translit[index]), ["X", "OE", "X"]);
const block2 = deriveKey(endpointRaw);
assert.deepEqual(block2.key.map(index => translit[index]), ["X", "X", "I"]);
assert.equal(endpoint + phi(endpointRaw[1]), matrixCenterIndex);
assert.deepEqual(coordinate(matrixCenterIndex), [14, 14]);

const p0EndIndex = pages[0].indices.length - 1;
assert.deepEqual(coordinate(p0EndIndex), [10, 19]);

console.log(JSON.stringify({
  status: "PASS: actual source-bounded opening is the sole all-native state in the strict all-grid census",
  endpoint: {
    index: endpoint,
    coordinate: coordinate(endpoint),
    sourceWordIndex: endpointWordIndex,
  },
  allGrid: {
    rawInBoundsNodeAxisStates: allGrid.rawStates,
    executableToOrBeforeEndpoint: allGrid.executable,
    sourceWordAligned: allGrid.sourceAligned,
    allNativeSourceDelimitedRuns: allGrid.allNative,
    winner: {
      anchor: winner.anchor,
      axis: winner.axis,
      start: winner.start,
      key: winner.key.map(index => translit[index]),
      wordCount: winner.wordCount,
    },
  },
  matchedCountFamily: {
    nStates: countFamily.nStates,
    nStatesWithGeometry: countFamily.nStatesWithGeometry,
    nStatesWithSourceAligned: countFamily.nStatesWithSourceAligned,
    nStatesWithAllNative: countFamily.nStatesWithAllNative,
    geometryCandidates: countFamily.geometryCandidates,
    sourceAlignedCandidates: countFamily.sourceAlignedCandidates,
    allNativeCandidates: countFamily.allNativeCandidates,
    winningN: countFamily.winners[0].n,
  },
  interpretation: [
    "The actual n=13 state is rank 1 under the exact all-source-word-native criterion.",
    "Blocks 2 and 3 are deterministic after the globally fixed endpoint, so they do not provide independent multiplicity evidence inside this census.",
    "This is structural support for the published bootstrap, not creator authentication of the reconstructed transition grammar."
  ]
}, null, 2));
