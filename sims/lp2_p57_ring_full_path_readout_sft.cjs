#!/usr/bin/env node
"use strict";

// Trace every unit cell of the already documented p57 -> p50 -> p32
// navigation hypothesis. This is a diagnostic readout, not a decoder.

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const reference = read("resources/liber-primus/lp1-plaintext-reference.txt");

const DIRECTIONS = [
  [-1, 0], [-1, 1], [0, 1], [1, 1],
  [1, 0], [1, -1], [0, -1], [-1, -1]
];
const DIRECTION_NAMES = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
const mod = (n, m) => ((n % m) + m) % m;
const totient = n => {
  let rem = n, result = n;
  for (let p = 2; p * p <= rem; p++) {
    if (rem % p) continue;
    while (rem % p === 0) rem /= p;
    result -= result / p;
  }
  if (rem > 1) result -= result / rem;
  return result;
};

assert.equal(grid.bytes.length, 256);
const ringLayers = Array.from({ length: 4 }, (_, layer) => {
  const height = 32 - 2 * layer, width = 8 - 2 * layer;
  return { height, width, perimeter: 2 * height + 2 * width - 4 };
});
const perimeters = ringLayers.map(x => x.perimeter);
const phiValues = perimeters.map(totient);
assert.deepEqual(perimeters, [76, 68, 60, 52]);
assert.deepEqual(phiValues, [36, 32, 16, 24]);

const payloadStart = signed.indexOf("Hello.");
const signatureStart = signed.indexOf("-----BEGIN PGP SIGNATURE-----");
assert.ok(payloadStart >= 0 && signatureStart > payloadStart);
const payload = signed.slice(payloadStart, signatureStart);
const words = payload.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g) || [];
assert.equal(words.length, 43);

const alphabet = corpus.translit.map((token, index) => ({
  token: token.toUpperCase(), index
})).sort((a, b) => b.token.length - a.token.length);
function gpEncode(text) {
  const clean = text.toUpperCase()
    .replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/K/g, "C").replace(/Z/g, "S").replace(/Q/g, "C");
  const out = [];
  for (const chunk of clean.match(/[A-Z]+/g) || []) {
    for (let at = 0; at < chunk.length;) {
      const token = alphabet.find(item => chunk.startsWith(item.token, at));
      assert.ok(token, "word cannot be tokenized in GP alphabet: " + chunk);
      out.push(token.index);
      at += token.token.length;
    }
  }
  return out;
}
const wordData = words.map((word, i) => {
  const indices = gpEncode(word);
  const primeWeights = indices.map(index => corpus.prime[index]);
  return {
    index: i + 1, word, indices, primeWeights,
    primeSum: primeWeights.reduce((a, b) => a + b, 0)
  };
});

const positions = phiValues.slice().reverse();
assert.deepEqual(positions, [24, 16, 32, 36]);
const selected = positions.map(i => wordData[i - 1]);
assert.deepEqual(selected.map(x => x.word.toLowerCase()),
  ["road", "words", "and", "found"]);
assert.deepEqual(selected.map(x => x.primeSum), [204, 179, 215, 130]);
const addresses = selected.map(x => x.primeSum);
const ringBytes = addresses.map(i => grid.bytes[i]);
assert.deepEqual(ringBytes, [194, 175, 84, 86]);

const p32 = corpus.pages.find(page => page.page === 32).indices;
assert.equal(p32.length, 121);
const startRow = 3, startCol = 0, startIndex = 33;
assert.equal(corpus.translit[p32.slice(33, 38)[0]], "H");
assert.equal(p32.slice(33, 38).map(i => corpus.translit[i]).join(""), "HOMEX");

function walkEveryCell(bytes) {
  let row = startRow, col = startCol, drTotal = 0, dcTotal = 0;
  const full = [startIndex], endpoints = [], segments = [];
  for (const byte of bytes) {
    assert(Number.isInteger(byte) && byte >= 0 && byte < 256);
    const distance = byte >> 3, direction = byte & 7;
    const [dr, dc] = DIRECTIONS[direction];
    drTotal += dr * distance;
    dcTotal += dc * distance;
    const segment = [];
    for (let k = 0; k < distance; k++) {
      row = mod(row + dr, 11);
      col = mod(col + dc, 11);
      const cell = row * 11 + col;
      full.push(cell);
      segment.push(cell);
    }
    endpoints.push(row * 11 + col);
    segments.push({ byte, direction, directionName: DIRECTION_NAMES[direction],
      distance, cells: segment, endpoint: row * 11 + col });
  }
  const seen = new Set(), unique = [];
  for (const cell of full) {
    if (!seen.has(cell)) { seen.add(cell); unique.push(cell); }
  }
  const missing = Array.from({ length: 121 }, (_, i) => i)
    .filter(i => !seen.has(i));
  const text = cells => cells.map(i => corpus.translit[p32[i]]);
  return {
    full, endpoints, segments, unique, missing,
    steps: full.length - 1, end: row * 11 + col,
    delta: [drTotal, dcTotal],
    fullTokens: text(full), uniqueTokens: text(unique),
    missingTokens: text(missing)
  };
}

const ringRoute = walkEveryCell(ringBytes);
assert.deepEqual(ringRoute.endpoints, [35, 47, 36, 37]);
assert.equal(ringRoute.end, 37);
assert.equal(ringRoute.steps, 65);
assert.equal(ringRoute.unique.length, 30);
assert.deepEqual(ringRoute.full.slice(0, 5), [33, 34, 35, 36, 37]);
assert.equal(ringRoute.fullTokens.slice(0, 5).join(""), "HOMEX");

const baselineBytes = grid.bytes.slice(84, 127);
assert.equal(baselineBytes.length, 43);
const baselineRoute = walkEveryCell(baselineBytes);
assert.equal(baselineRoute.end, 37);
assert.deepEqual(baselineRoute.delta, [110, -117]);
assert.equal(baselineRoute.steps, 604);
assert.equal(baselineRoute.unique.length, 113);
assert.equal(baselineRoute.missing.length, 8);
assert.deepEqual(baselineRoute.missing,
  [9, 78, 89, 90, 100, 101, 108, 118]);



// Cross-artifact checksum candidate: the four selected word-prime sums are
// compared with the 729-rune opening section. This is a diagnostic, not a
// prescribed book-cipher operation.
const openingPages = [0, 1, 2].map(page =>
  corpus.pages.find(item => item.page === page).indices);
const openingChapter = openingPages.flat();
assert.deepEqual(openingPages.map(x => x.length), [262, 266, 201]);
assert.equal(openingChapter.length, 729);
const selectedAddressSum = addresses.reduce((a, b) => a + b, 0);
assert.equal(selectedAddressSum, 728);
const openingReadoutZeroBased = addresses.map(index =>
  corpus.translit[openingChapter[index]]);
const openingReadoutOneBased = addresses.map(position =>
  corpus.translit[openingChapter[position - 1]]);
const openingLastRune = corpus.translit[openingChapter[728]];
let fourSubsetCount728 = 0;
for (let a = 0; a < wordData.length; a++)
  for (let b = a + 1; b < wordData.length; b++)
    for (let c = b + 1; c < wordData.length; c++)
      for (let d = c + 1; d < wordData.length; d++)
        if (wordData[a].primeSum + wordData[b].primeSum +
            wordData[c].primeSum + wordData[d].primeSum === 728)
          fourSubsetCount728++;

// Counterexamples to the two most consequential selector conventions.
const oneBasedBytes = addresses.map(address => grid.bytes[address - 1]);
assert.deepEqual(oneBasedBytes, [68, 166, 251, 179]);
const oneBasedRoute = walkEveryCell(oneBasedBytes);
assert.equal(oneBasedRoute.end, 99);
assert.equal(oneBasedRoute.segments[3].distance, 22);

const p32MapPerimeters = [40, 32, 24, 16, 8];
const p32MapTotients = p32MapPerimeters.map(totient);
const p32MapRingPositions = p32MapTotients.slice().reverse();
assert.deepEqual(p32MapTotients, [16, 16, 8, 8, 4]);
assert.deepEqual(p32MapRingPositions, [4, 8, 8, 16, 16]);
function deriveWordRoute(wordPositions) {
  const selectedWords = wordPositions.map(position => wordData[position - 1]);
  const wordSums = selectedWords.map(item => item.primeSum);
  const bytes = wordSums.map(address => grid.bytes[address]);
  return { positions: wordPositions, words: selectedWords.map(x => x.word),
    wordSums, bytes, route: walkEveryCell(bytes) };
}
const p32MapRingRoute = deriveWordRoute(p32MapRingPositions);
const p32MapRingUniquePositions = [...new Set(p32MapRingPositions)];
const p32MapRingUniqueRoute = deriveWordRoute(p32MapRingUniquePositions);
assert.deepEqual(p32MapRingRoute.wordSums, [224, 72, 72, 179, 179]);
assert.deepEqual(p32MapRingRoute.bytes, [68, 164, 164, 175, 175]);
assert.equal(p32MapRingRoute.route.end, 101);
assert.deepEqual(p32MapRingUniqueRoute.wordSums, [224, 72, 179]);
assert.equal(p32MapRingUniqueRoute.route.end, 111);

// Exploratory, non-source-backed check: use the eight unvisited GP runes as
// a repeating additive/subtractive key on the 113 first-visit runes.
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}
const pathCipher = baselineRoute.unique.map(cell => p32[cell]);
const complementKey = baselineRoute.missing.map(cell => p32[cell]);
const complementDecrypt = sign => pathCipher.map((value, i) =>
  mod(value + sign * complementKey[i % complementKey.length], 29));

function encodeReferencePage(text) { return gpEncode(text); }
const refSections = reference.split(/^###\s+(\d+)\s*$/gm);
const nativePages = [];
for (let i = 1; i < refSections.length; i += 2) {
  const lines = refSections[i + 1].split(/\r?\n/)
    .filter(line => !line.startsWith("[") &&
      !/^\s*[0-9a-f ]{30,}$/i.test(line) &&
      !/^\s*\d[\d ]{40,}$/.test(line));
  nativePages.push(encodeReferencePage(lines.join(" ")));
}
const trigramCounts = Array(29 ** 3).fill(0);
let trigramTotal = 0;
for (const page of nativePages) {
  for (let i = 0; i + 2 < page.length; i++) {
    trigramCounts[page[i] * 841 + page[i + 1] * 29 + page[i + 2]]++;
    trigramTotal++;
  }
}
const alpha = 0.1, denominator = trigramTotal + alpha * 29 ** 3;
function trigramScore(values) {
  let score = 0;
  for (let i = 0; i + 2 < values.length; i++) {
    const key = values[i] * 841 + values[i + 1] * 29 + values[i + 2];
    score += Math.log((trigramCounts[key] + alpha) / denominator);
  }
  return score / (values.length - 2);
}
const native113 = [];
for (const page of nativePages) {
  for (let i = 0; i + 113 <= page.length; i++) native113.push(page.slice(i, i + 113));
}
const native113Scores = native113.map(trigramScore).sort((a, b) => a - b);
const complementScores = {
  raw: trigramScore(pathCipher),
  subtract: trigramScore(complementDecrypt(-1)),
  add: trigramScore(complementDecrypt(1)),
  nativeWindowCount: native113.length,
  nativeMin: native113Scores[0],
  nativeMedian: native113Scores[Math.floor(native113Scores.length / 2)]
};


const cycleColumns = Array.from({ length: 11 }, (_, i) => mod(4 * i, 11));
const cycleMapReadout = [];
for (let row = 0; row < 11; row++) {
  for (const col of cycleColumns) cycleMapReadout.push(p32[row * 11 + col]);
}
const baselineAtRingPositions = positions.map(position => {
  const cell = baselineRoute.endpoints[position - 1];
  return { position, cell, rune: corpus.translit[p32[cell]] };
});
const netDisplacement = {
  ringRaw: ringRoute.delta,
  baselineRaw: baselineRoute.delta,
  ringModulo11: ringRoute.delta.map(x => mod(x, 11)),
  baselineModulo11: baselineRoute.delta.map(x => mod(x, 11))
};

const output = {
  classification: "full-path diagnostic; no plaintext or key recovered",
  ringSelector: {
    perimetersOuterToInner: perimeters,
    totientsOuterToInner: phiValues,
    selectedWordPositionsInnerToOuter: positions,
    selectedWords: selected.map(x => x.word),
    gpPrimeSums: addresses,
    p50Bytes: ringBytes
  },
  p32: {
    mapSize: 121,
    start: { row: startRow, col: startCol, index: startIndex, rune: "H" },
    marker: "HOMEX"
  },
  netDisplacement,
  baselineEndpointsAtRingSelectedWordPositions: baselineAtRingPositions,
  repeatedShiftCycle: {
    shift: [0, 4],
    order: 11,
    columns: cycleColumns,
    row3Runes: cycleColumns.map(col => corpus.translit[p32[3 * 11 + col]]).join(" "),
    rowwiseReadout: cycleMapReadout.map(i => corpus.translit[i]).join(""),
    rawMapIoC: ioc(p32),
    cycleReadoutIoC: ioc(cycleMapReadout),
    rawMapTrigramScore: trigramScore(p32),
    cycleReadoutTrigramScore: trigramScore(cycleMapReadout),
    interpretation: "The natural 11-cycle rowwise permutation does not recover GP-English plaintext."
  },
  fourMoveRingRoute: {
    moves: ringRoute.segments.map(x => ({
      byte: x.byte, direction: x.directionName, distance: x.distance,
      endpoint: x.endpoint
    })),
    endpointRunes: ringRoute.endpoints.map(i => corpus.translit[p32[i]]),
    finalCell: ringRoute.end,
    rawDisplacement: ringRoute.delta,
    modulo11Displacement: ringRoute.delta.map(x => mod(x, 11)),
    unitSteps: ringRoute.steps,
    uniqueCellsIncludingStart: ringRoute.unique.length,
    firstFiveCells: ringRoute.full.slice(0, 5),
    firstFiveRunes: ringRoute.fullTokens.slice(0, 5).join(""),
    fullPathRunes: ringRoute.fullTokens.join(""),
    uniqueFirstVisitRunes: ringRoute.uniqueTokens.join("")
  },
  openingChapterCrossCheck: {
    pageRuneCounts: openingPages.map(x => x.length),
    totalRunes: openingChapter.length,
    selectedWordPrimeSum: selectedAddressSum,
    zeroBasedPositions: addresses,
    zeroBasedRunes: openingReadoutZeroBased,
    oneBasedRunes: openingReadoutOneBased,
    finalZeroBasedRune: openingLastRune,
    fourSubsetsAmong43WordsSumming728: fourSubsetCount728,
    totalFourSubsets: 123410,
    interpretation: "The selected sums total 729-1 and address the final opening-chapter rune W; however 243 of 123410 four-word subsets share this sum, and neither direct readout is plaintext."
  },
  addressConventionAlternative: {
    oneBasedBytes,
    endpoints: oneBasedRoute.endpoints,
    endpointRunes: oneBasedRoute.endpoints.map(i => corpus.translit[p32[i]]),
    finalCell: oneBasedRoute.end,
    finalRune: corpus.translit[p32[oneBasedRoute.end]],
    lastMoveDistance: oneBasedRoute.segments[3].distance,
    interpretation: "The 1-based alternative ends at EA; its last 22-step SE move is a full two-row/column cycles and leaves the position unchanged."
  },
  p32MapRingAlternative: {
    perimetersOuterToInner: p32MapPerimeters,
    totientsOuterToInner: p32MapTotients,
    positionsInnerToOuter: p32MapRingPositions,
    words: p32MapRingRoute.words,
    gpPrimeSums: p32MapRingRoute.wordSums,
    p50Bytes: p32MapRingRoute.bytes,
    endpointRunes: p32MapRingRoute.route.endpoints.map(i => corpus.translit[p32[i]]),
    finalCell: p32MapRingRoute.route.end,
    finalRune: corpus.translit[p32[p32MapRingRoute.route.end]],
    deduplicatedPositions: p32MapRingUniquePositions,
    deduplicatedWords: p32MapRingUniqueRoute.words,
    deduplicatedEndpointRunes: p32MapRingUniqueRoute.route.endpoints.map(i => corpus.translit[p32[i]]),
    deduplicatedFinalCell: p32MapRingUniqueRoute.route.end,
    interpretation: "Using the 11x11 p32 map itself as the ring source does not converge on X; duplicate totients select repeated words."
  },
  baseline43ByteRoute: {
    tableInterval: [84, 127],
    moveCount: baselineBytes.length,
    finalCell: baselineRoute.end,
    rawDisplacement: baselineRoute.delta,
    modulo11Displacement: baselineRoute.delta.map(x => mod(x, 11)),
    endpointDistinctCount: new Set(baselineRoute.endpoints).size,
    unitSteps: baselineRoute.steps,
    uniqueCellsIncludingStart: baselineRoute.unique.length,
    uniqueFirstVisitRunes: baselineRoute.uniqueTokens.join(""),
    missingCellsRowMajor: baselineRoute.missing,
    missingRunesRowMajor: baselineRoute.missingTokens.join(" ")
  },
  complementKeyDiagnostic: {
    key: complementKey.map(i => corpus.translit[i]).join(" "),
    trigramScores: complementScores,
    interpretation: "Both signs remain far below native GP-English windows; this exploratory complement-key idea is retired."
  }
};
process.stdout.write(JSON.stringify(output, null, 2) + "\n");
