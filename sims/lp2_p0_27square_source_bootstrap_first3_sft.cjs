"use strict";

/**
 * SFT: source-bounded bootstrap for the first three external 27x27 blocks.
 *
 * Purpose: test whether AS I GO THE / WEATHER / TURNS can be recovered from
 * original p0-p2 data with finite source-motivated choices, rather than by
 * supplying those plaintext lengths.
 *
 * Classification: bootstrap candidate, not authenticated LP2 plaintext.
 * Remaining assumptions are documented in the companion report.
 *
 * Run: node sims/lp2_p0_27square_source_bootstrap_first3_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8").replace(/\r\n/g, "\n");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const master = read("resources/transcriptions/liber_primus_master.txt");
const dictionary = read("resources/control/english_wordfreq_textblob.txt");

const grid = corpus.pages.filter(page => page.page <= 2).flatMap(page => page.indices);
assert.equal(grid.length, 729);
const side = 27;
const translit = corpus.translit;
const runeSet = new Set(corpus.runes);

/** @param {number} value */
function phi(value) {
  assert.ok(Number.isInteger(value) && value > 0);
  let result = value;
  let rest = value;
  for (let p = 2; p * p <= rest; p++) {
    if (rest % p !== 0) continue;
    while (rest % p === 0) rest /= p;
    result -= result / p;
  }
  if (rest > 1) result -= result / rest;
  return result;
}

/** @param {number} value */
function mu(value) {
  assert.ok(Number.isInteger(value) && value > 0);
  let rest = value;
  let sign = 1;
  for (let p = 2; p * p <= rest; p++) {
    if (rest % p !== 0) continue;
    rest /= p;
    sign = -sign;
    if (rest % p === 0) return 0;
  }
  return rest > 1 ? -sign : sign;
}

/** @param {number} value */
const mod29 = value => (value % 29 + 29) % 29;

/** @param {[number, number]} point */
const position = ([row, column]) => (row - 1) * side + column - 1;
/** @param {number} zeroBased */
const coordinate = zeroBased => [Math.floor(zeroBased / side) + 1, zeroBased % side + 1];
/** @param {[number, number]} point */
const at = point => grid[position(point)];

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
    const token = tokenOrder.find(row => clean.startsWith(row.token, i));
    if (!token) return null;
    out.push(token.ordinal);
    i += token.token.length;
  }
  return out;
}

const nativeWords = new Map();
for (const line of dictionary.split("\n")) {
  const match = /^([a-z]+) (\d+)$/.exec(line.trim());
  if (!match) continue;
  const encoded = encodeNativeGP(match[1]);
  if (!encoded) continue;
  const signature = encoded.join(",");
  const entries = nativeWords.get(signature) || [];
  entries.push({word: match[1], frequency: Number(match[2])});
  nativeWords.set(signature, entries);
}
for (const entries of nativeWords.values()) {
  entries.sort((a, b) => b.frequency - a.frequency);
}

/** @param {number[]} runes */
function dictionaryMatches(runes) {
  return nativeWords.get(runes.join(",")) || [];
}

// Recover the original word segmentation for the exact p0-p2 729-rune span.
const heading = corpus.pages[0].indices.slice(0, 8).map(i => corpus.runes[i]).join("")
  + "-"
  + corpus.pages[0].indices.slice(8, 13).map(i => corpus.runes[i]).join("");
const sourceStart = master.indexOf(heading);
assert(sourceStart >= 0);

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
const wordIndexByStart = new Map(sourceWords.map((word, i) => [word[0], i]));

/**
 * Count consecutive source-word segments that decrypt to source-native words.
 * Key phase is continuous from the candidate start.
 * @param {number} start
 * @param {number[]} key
 */
function consecutiveNativeWords(start, key) {
  const sourceWordIndex = wordIndexByStart.get(start);
  if (sourceWordIndex === undefined) return null;
  let keyClock = 0;
  const decoded = [];
  for (let i = sourceWordIndex; i < sourceWords.length; i++) {
    const sourceWord = sourceWords[i];
    const plain = sourceWord.map((p, j) =>
      mod29(grid[p] - key[(keyClock + j) % key.length]));
    keyClock += sourceWord.length;
    const matches = dictionaryMatches(plain);
    if (!matches.length) break;
    decoded.push({
      positions: [sourceWord[0], sourceWord.at(-1)],
      runes: plain,
      word: matches[0].word,
      frequency: matches[0].frequency,
    });
  }
  return decoded;
}

// Opening source facts.
const n = 13;
assert.equal(phi(n), 12);
const naturalAnchor = [n, phi(n)];
assert.deepEqual(naturalAnchor, [13, 12]);
assert.equal(translit[at(naturalAnchor)], "J");

// Widened source-driven opening family:
// - both coordinate orders for (n,phi(n));
// - all four axes through the anchor;
// - unchanged or center-totient key;
// - all three cyclic key rotations;
// - left/center/right origin;
// - +/- n row-major displacement;
// - candidate starts must coincide with an original source-word start.
//
// This intentionally includes far more alternatives than the eventual branch.
const axes = [
  ["H", 0, 1],
  ["V", 1, 0],
  ["NWSE", 1, 1],
  ["NESW", 1, -1],
];
const originOffsets = [["left", 0], ["center", 1], ["right", 2]];
const openingFamily = [];

for (const anchor of [[n, phi(n)], [phi(n), n]]) {
  for (const [axis, dr, dc] of axes) {
    const [row, column] = anchor;
    const cells = [-1, 0, 1].map(t => position([row + t * dr, column + t * dc]));
    const rawKey = cells.map(p => grid[p]);

    for (const centerTotient of [false, true]) {
      const transformed = rawKey.slice();
      if (centerTotient) {
        if (transformed[1] === 0) continue;
        transformed[1] = phi(transformed[1]);
      }

      for (let rotation = 0; rotation < 3; rotation++) {
        const key = transformed.slice(rotation).concat(transformed.slice(0, rotation));
        for (const [originName, originOffset] of originOffsets) {
          for (const sign of [-1, 1]) {
            const start = cells[originOffset] + sign * n;
            const run = consecutiveNativeWords(start, key);
            if (!run) continue;
            openingFamily.push({
              anchor,
              axis,
              centerTotient,
              rotation,
              originName,
              sign,
              start,
              key,
              run,
            });
          }
        }
      }
    }
  }
}
assert.equal(openingFamily.length, 126);
openingFamily.sort((a, b) => b.run.length - a.run.length);
assert.equal(openingFamily[0].run.length, 4);
assert.equal(openingFamily[1].run.length, 3);
assert.equal(openingFamily.filter(row => row.run.length === 4).length, 1);

const first = openingFamily[0];
assert.deepEqual(first.anchor, [13, 12]);
assert.equal(first.axis, "H");
assert.equal(first.centerTotient, true);
assert.equal(first.rotation, 0);
assert.equal(first.originName, "center");
assert.equal(first.sign, 1);
assert.equal(first.start, 348);
assert.deepEqual(first.key.map(i => translit[i]), ["AE", "I", "EA"]);
assert.deepEqual(first.run.map(row => row.word), ["as", "i", "go", "the"]);
assert.deepEqual(first.run.map(row => row.positions), [
  [348, 349],
  [350, 350],
  [351, 352],
  [353, 354],
]);

// Under this key, scanning all original word starts independently also yields
// only one four-word run, and it is the same start.
const allStartsForFirstKey = sourceWords
  .map(word => consecutiveNativeWords(word[0], first.key))
  .filter(Boolean);
assert.equal(allStartsForFirstKey.filter(run => run.length >= 4).length, 1);

// Block 2 is chained from block 1's endpoint. Start a three-cell horizontal
// node at the endpoint X: X-OE-X. Center-totient gives X-I-X. The published
// mu(phi(k)) rotation rule is evaluated rather than hard-coded.
const firstEnd = first.run.at(-1).positions[1];
assert.equal(firstEnd, 354);
assert.deepEqual(coordinate(firstEnd), [14, 4]);
const node2Raw = grid.slice(firstEnd, firstEnd + 3);
assert.deepEqual(node2Raw.map(i => translit[i]), ["X", "OE", "X"]);
const node2Derived = [node2Raw[0], phi(node2Raw[1]), node2Raw[2]];
assert.deepEqual(node2Derived.map(i => translit[i]), ["X", "I", "X"]);
const rotation2 = mod29(node2Derived.reduce((sum, value) => sum + mu(phi(value)), 0)) % 3;
assert.equal(rotation2, 2);
const key2 = node2Derived.slice(rotation2).concat(node2Derived.slice(0, rotation2));
assert.deepEqual(key2.map(i => translit[i]), ["X", "X", "I"]);

const start2 = firstEnd + phi(node2Raw[1]);
assert.equal(start2, 364);
assert.deepEqual(coordinate(start2), [14, 14]);

// Longest dictionary-prefix gate from the fixed center start, reading right.
const block2Stream = [];
for (let i = 0; i < 12; i++) {
  block2Stream.push(mod29(grid[start2 + i] - key2[i % 3]));
}
const prefixCounts2 = [];
const exact2 = [];
for (let length = 1; length <= block2Stream.length; length++) {
  const prefix = block2Stream.slice(0, length);
  let prefixCount = 0;
  for (const signature of nativeWords.keys()) {
    const encoded = signature.split(",").map(Number);
    if (encoded.length >= length && prefix.every((value, i) => encoded[i] === value)) {
      prefixCount++;
    }
  }
  prefixCounts2.push(prefixCount);
  const matches = dictionaryMatches(prefix);
  if (matches.length) exact2.push({length, matches});
}
assert.equal(prefixCounts2[4] > 0, true);
assert.equal(prefixCounts2[5], 0);
assert.deepEqual(
  exact2.filter(row => row.length === 5)[0].matches[0].word,
  "weather",
);
const block2Plain = block2Stream.slice(0, 5);
assert.deepEqual(block2Plain.map(i => translit[i]), ["W", "EA", "TH", "E", "R"]);

// Block 3 starts at the next row-major cell after WEATHER.
const end2 = start2 + block2Plain.length - 1;
const start3 = end2 + 1;
assert.deepEqual(coordinate(start3), [14, 19]);
assert.equal(translit[grid[start3]], "A");

// Previous derived-center I=10 supplies phi(10)=4 and 10 itself.
// From A move +4 columns to the new center NG; +/-10 rows gives H,NG,C.
const priorCenter = node2Derived[1];
assert.equal(translit[priorCenter], "I");
const [start3Row, start3Column] = coordinate(start3);
const center3 = [start3Row, start3Column + phi(priorCenter)];
assert.deepEqual(center3, [14, 23]);
const node3Points = [
  [center3[0] - priorCenter, center3[1]],
  center3,
  [center3[0] + priorCenter, center3[1]],
];
const key3 = node3Points.map(at);
assert.deepEqual(key3.map(i => translit[i]), ["H", "NG", "C"]);
const rotation3 = ((key3.reduce((sum, value) => sum + mu(phi(value)), 0) % 3) + 3) % 3;
assert.equal(rotation3, 0);

// Test all four cardinal read directions from A. Only UP sustains a native
// dictionary prefix to five runes; it yields TURNS and the sixth rune kills
// every continuation.
const directions = [
  ["up", -1, 0],
  ["down", 1, 0],
  ["left", 0, -1],
  ["right", 0, 1],
];
const directionResults = [];
for (const [name, dr, dc] of directions) {
  const stream = [];
  let row = start3Row;
  let column = start3Column;
  for (let i = 0; i < 12; i++) {
    if (row < 1 || row > 27 || column < 1 || column > 27) break;
    stream.push(mod29(at([row, column]) - key3[i % 3]));
    row += dr;
    column += dc;
  }

  let lastPrefix = 0;
  const exact = [];
  for (let length = 1; length <= stream.length; length++) {
    const prefix = stream.slice(0, length);
    let prefixCount = 0;
    for (const signature of nativeWords.keys()) {
      const encoded = signature.split(",").map(Number);
      if (encoded.length >= length && prefix.every((value, i) => encoded[i] === value)) {
        prefixCount++;
      }
    }
    if (prefixCount) lastPrefix = length;
    const matches = dictionaryMatches(prefix);
    if (matches.length) exact.push({length, matches});
  }
  directionResults.push({name, stream, lastPrefix, exact});
}
directionResults.sort((a, b) => b.lastPrefix - a.lastPrefix);
assert.equal(directionResults[0].name, "up");
assert.equal(directionResults[0].lastPrefix, 5);
assert.ok(directionResults.slice(1).every(row => row.lastPrefix <= 2));
const turns = directionResults[0].exact.find(row => row.length === 5);
assert(turns);
assert.equal(turns.matches[0].word, "turns");
assert.deepEqual(
  directionResults[0].stream.slice(0, 5).map(i => translit[i]),
  ["T", "U", "R", "N", "S"],
);


// Block 4 prospective finite family. Freeze only state carried from TURNS:
// anchor A=(14,19), previous key-center NG=21, distance phi(21)=12.
// Enumerate every in-bounds cardinal center displacement by 12, build the
// aligned three-cell node around that center, center-totient and rotate by the
// same mu(phi(k)) rule. Independently enumerate every in-bounds cardinal
// ciphertext start displacement by 12 and every cardinal read direction.
// Score only longest native-dictionary prefix depth; do not supply COLD.
const anchor4 = [14, 19];
assert.equal(translit[at(anchor4)], "A");
const priorCenter4 = translit.indexOf("NG");
const distance4 = phi(priorCenter4);
assert.equal(distance4, 12);

const block4Family = [];
for (const [centerDir, centerDr, centerDc] of directions) {
  const center = [
    anchor4[0] + distance4 * centerDr,
    anchor4[1] + distance4 * centerDc,
  ];
  if (center.some(value => value < 1 || value > 27)) continue;

  const nodePoints = [
    [center[0] - centerDr, center[1] - centerDc],
    center,
    [center[0] + centerDr, center[1] + centerDc],
  ];
  if (nodePoints.flat().some(value => value < 1 || value > 27)) continue;
  const rawNode = nodePoints.map(at);
  if (rawNode[1] === 0) continue;
  const derivedNode = [rawNode[0], phi(rawNode[1]), rawNode[2]];
  const rotation = ((derivedNode.reduce(
    (sum, value) => sum + mu(phi(value)), 0,
  ) % 3) + 3) % 3;
  const key = derivedNode.slice(rotation).concat(derivedNode.slice(0, rotation));

  for (const [startDir, startDr, startDc] of directions) {
    const start = [
      anchor4[0] + distance4 * startDr,
      anchor4[1] + distance4 * startDc,
    ];
    if (start.some(value => value < 1 || value > 27)) continue;

    for (const [readDir, readDr, readDc] of directions) {
      const stream = [];
      let row = start[0];
      let column = start[1];
      for (let i = 0; i < 20; i++) {
        if (row < 1 || row > 27 || column < 1 || column > 27) break;
        stream.push(mod29(at([row, column]) - key[i % 3]));
        row += readDr;
        column += readDc;
      }

      let lastPrefix = 0;
      const exact = [];
      for (let length = 1; length <= stream.length; length++) {
        const prefix = stream.slice(0, length);
        let prefixCount = 0;
        for (const signature of nativeWords.keys()) {
          const encoded = signature.split(",").map(Number);
          if (encoded.length >= length
            && prefix.every((value, i) => encoded[i] === value)) {
            prefixCount++;
          }
        }
        if (prefixCount) lastPrefix = length;
        const matches = dictionaryMatches(prefix);
        if (matches.length) exact.push({length, matches});
      }

      block4Family.push({
        centerDir,
        center,
        nodePoints,
        rawNode,
        derivedNode,
        rotation,
        key,
        startDir,
        start,
        readDir,
        stream,
        lastPrefix,
        exact,
      });
    }
  }
}
assert.equal(block4Family.length, 36);
block4Family.sort((a, b) => b.lastPrefix - a.lastPrefix);
assert.equal(block4Family[0].lastPrefix, 5);
assert.equal(block4Family[1].lastPrefix, 3);
assert.equal(block4Family.filter(row => row.lastPrefix === 5).length, 1);

const fourth = block4Family[0];
assert.equal(fourth.centerDir, "down");
assert.deepEqual(fourth.center, [26, 19]);
assert.deepEqual(fourth.rawNode.map(i => translit[i]), ["H", "TH", "H"]);
assert.deepEqual(fourth.derivedNode.map(i => translit[i]), ["H", "U", "H"]);
assert.equal(fourth.rotation, 1);
assert.deepEqual(fourth.key.map(i => translit[i]), ["U", "H", "H"]);
assert.equal(fourth.startDir, "left");
assert.deepEqual(fourth.start, [14, 7]);
assert.equal(fourth.readDir, "up");
assert.deepEqual(
  fourth.stream.slice(0, 6).map(i => translit[i]),
  ["C", "O", "L", "D", "L", "P"],
);
const cold = fourth.exact.find(row => row.length === 4);
assert(cold);
assert.equal(cold.matches[0].word, "cold");
assert.equal(fourth.exact.some(row => row.length === 5), false);

console.log(JSON.stringify({
  status: "source-bounded four-block bootstrap candidate; route still requires independent selector validation",
  openingFamilyCandidates: openingFamily.length,
  openingUniqueMaxRun: first.run.length,
  openingRunnerUpRun: openingFamily[1].run.length,
  block1: {
    anchor: first.anchor,
    key: first.key.map(i => translit[i]),
    start: first.start,
    sourceWordPositions: first.run.map(row => row.positions),
    words: first.run.map(row => row.word.toUpperCase()),
  },
  block2: {
    node: node2Raw.map(i => translit[i]),
    key: key2.map(i => translit[i]),
    start: start2,
    coordinate: coordinate(start2),
    plaintextRunes: block2Plain.map(i => translit[i]),
    word: "WEATHER",
    nextRuneHasAnyDictionaryContinuation: prefixCounts2[5] > 0,
  },
  block3: {
    start: start3,
    coordinate: coordinate(start3),
    keyNodeCoordinates: node3Points,
    key: key3.map(i => translit[i]),
    directionPrefixDepths: Object.fromEntries(directionResults.map(row => [row.name, row.lastPrefix])),
    word: "TURNS",
  },
  block4: {
    familyCandidates: block4Family.length,
    uniqueMaxPrefixDepth: fourth.lastPrefix,
    runnerUpPrefixDepth: block4Family[1].lastPrefix,
    centerDirection: fourth.centerDir,
    center: fourth.center,
    key: fourth.key.map(i => translit[i]),
    startDirection: fourth.startDir,
    start: fourth.start,
    readDirection: fourth.readDir,
    decryptedPrefix: fourth.stream.slice(0, 6).map(i => translit[i]),
    word: "COLD",
  },
  combinedReading: "AS I GO THE WEATHER TURNS COLD",
}, null, 2));
