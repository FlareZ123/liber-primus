#!/usr/bin/env node
"use strict";

// Reproduce the p57 -> four p50 ring perimeters -> 2016 word map ->
// GP-prime-sum table addresses -> p32 compass bridge.
// This is a navigation hypothesis, not a ciphertext decryption.

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const GRID_PATH = path.join(ROOT, "resources", "liber-primus", "lp2-grid-256.json");
const CORPUS_PATH = path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json");
const SIGNED_PATH = path.join(ROOT, "resources", "historical", "cicada2016-4gq25-outguess.asc");

const DIRECTIONS = [
  [-1, 0], [-1, 1], [0, 1], [1, 1],
  [1, 0], [1, -1], [0, -1], [-1, -1]
];
const DIRECTION_NAMES = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
const mod = (n, m) => ((n % m) + m) % m;

function totient(n) {
  let remaining = n, result = n;
  for (let p = 2; p * p <= remaining; p++) {
    if (remaining % p !== 0) continue;
    while (remaining % p === 0) remaining /= p;
    result -= result / p;
  }
  if (remaining > 1) result -= result / remaining;
  return result;
}

function hasOrderedSubsequence(values, target) {
  let at = 0;
  for (const value of values) if (value === target[at]) at++;
  return at === target.length;
}

function permutations(values) {
  const out = [];
  function visit(prefix, remaining) {
    if (!remaining.length) { out.push(prefix); return; }
    for (let i = 0; i < remaining.length; i++) {
      visit(prefix.concat(remaining[i]),
        remaining.slice(0, i).concat(remaining.slice(i + 1)));
    }
  }
  visit([], values);
  return out;
}

function main() {
  const grid = JSON.parse(fs.readFileSync(GRID_PATH, "utf8"));
  const corpus = JSON.parse(fs.readFileSync(CORPUS_PATH, "utf8"));
  const signed = fs.readFileSync(SIGNED_PATH, "utf8");
  assert.equal(grid.bytes.length, 256);

  // Complete pp49-51 table is 32x8. Each successive inner rectangle
  // removes one row and one column from every side.
  const ringLayers = Array.from({ length: 4 }, (_, layer) => {
    const height = 32 - 2 * layer, width = 8 - 2 * layer;
    return { height, width, perimeter: 2 * height + 2 * width - 4 };
  });
  const perimeters = ringLayers.map(layer => layer.perimeter);
  assert.deepEqual(perimeters, [76, 68, 60, 52]);
  const phiValues = perimeters.map(totient);
  assert.deepEqual(phiValues, [36, 32, 16, 24]);

  // Match the established 2016 SFT tokenization: start at Hello, stop at
  // the PGP signature, and retain alphabetic tokens only.
  const start = signed.indexOf("Hello.");
  const signature = signed.indexOf("-----BEGIN PGP SIGNATURE-----");
  assert.ok(start >= 0 && signature > start);
  const payload = signed.slice(start, signature);
  const words = payload.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g) || [];
  assert.equal(words.length, 43);

  const alphabet = corpus.translit.map((token, index) => ({
    token: token.toUpperCase(), index
  })).sort((a, b) => b.token.length - a.token.length);

  function gpEncode(text) {
    const clean = text.toUpperCase()
      .replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/K/g, "C").replace(/Z/g, "S").replace(/Q/g, "C");
    const encoded = [];
    for (const chunk of clean.match(/[A-Z]+/g) || []) {
      for (let at = 0; at < chunk.length;) {
        const token = alphabet.find(item => chunk.startsWith(item.token, at));
        assert.ok(token, "word cannot be tokenized in GP alphabet: " + chunk);
        encoded.push(token.index);
        at += token.token.length;
      }
    }
    return encoded;
  }

  const wordData = words.map((word, i) => {
    const runeIndices = gpEncode(word);
    const primeWeights = runeIndices.map(index => corpus.prime[index]);
    return {
      index: i + 1,
      word,
      gpTokens: runeIndices.map(index => corpus.translit[index]),
      primeWeights,
      primeSum: primeWeights.reduce((sum, value) => sum + value, 0)
    };
  });

  // Ring phi values are page numbers and one-based word positions. Reading
  // from the innermost circumference outward is the "emerge" interpretation.
  const wordIndices = phiValues.slice().reverse();
  assert.deepEqual(wordIndices, [24, 16, 32, 36]);
  const selected = wordIndices.map(index => wordData[index - 1]);
  assert.deepEqual(selected.map(item => item.word.toLowerCase()),
    ["road", "words", "and", "found"]);
  assert.deepEqual(selected.map(item => item.primeSum), [204, 179, 215, 130]);

  // Existing p50 word-address work uses zero-based array offsets.
  const addresses = selected.map(item => item.primeSum);
  assert.ok(addresses.every(address => address >= 0 && address < grid.bytes.length));
  const selectedBytes = addresses.map(address => grid.bytes[address]);
  assert.deepEqual(selectedBytes, [194, 175, 84, 86]);

  const p32 = corpus.pages.find(page => page.page === 32).indices;
  const marker = p32.slice(33, 38).map(index => corpus.translit[index]).join("");
  assert.equal(marker, "HOMEX");
  const startRow = 3, startCol = 0, startIndex = startRow * 11 + startCol;
  assert.equal(startIndex, 33);
  assert.equal(corpus.translit[p32[startIndex]], "H");

  function step(row, col, byte) {
    const distance = byte >> 3, direction = byte & 7;
    const [dr, dc] = DIRECTIONS[direction];
    const nextRow = mod(row + dr * distance, 11);
    const nextCol = mod(col + dc * distance, 11);
    return {
      row: nextRow, col: nextCol, position: nextRow * 11 + nextCol,
      byte, direction, directionName: DIRECTION_NAMES[direction], distance
    };
  }

  function walk(bytes) {
    let row = startRow, col = startCol;
    const steps = [];
    for (const byte of bytes) {
      const result = step(row, col, byte);
      row = result.row; col = result.col;
      steps.push({
        ...result,
        rune: corpus.translit[p32[result.position]]
      });
    }
    return {
      start: [startRow, startCol],
      startIndex,
      steps,
      positions: steps.map(item => item.position),
      final: [row, col],
      finalIndex: row * 11 + col
    };
  }

  const selectedRoute = walk(selectedBytes);
  assert.deepEqual(selectedRoute.positions, [35, 47, 36, 37]);
  assert.deepEqual(selectedRoute.steps.map(item => item.rune), ["M", "IA", "E", "X"]);
  assert.equal(selectedRoute.finalIndex, 37);
  assert.deepEqual(selectedRoute.final, [3, 4]);
  assert.ok(hasOrderedSubsequence(selectedRoute.positions, [35, 36, 37]));

  // Existing 43-word compass route uses the separate p50 byte interval 84..126.
  const existing43Route = walk(grid.bytes.slice(84, 127));
  assert.equal(existing43Route.steps.length, 43);
  assert.equal(existing43Route.finalIndex, 37);

  // Sensitivity: one-based cell numbering means sum-1 and does not reach X.
  const oneBasedAddresses = addresses.map(address => address - 1);
  const oneBasedRoute = walk(oneBasedAddresses.map(address => grid.bytes[address]));
  assert.deepEqual(oneBasedRoute.positions, [0, 2, 99, 99]);
  assert.equal(oneBasedRoute.finalIndex, 99);

  const outerToInnerRoute = walk(phiValues.map(index =>
    grid.bytes[wordData[index - 1].primeSum]
  ));

  // Exhaustive descriptive control over all ordered 4-tuples of distinct
  // message-word occurrences whose GP-prime sums are valid table addresses.
  // This is post hoc and not a discovery-wide p-value.
  const eligible = wordData.filter(item =>
    Number.isInteger(item.primeSum) && item.primeSum >= 0 &&
    item.primeSum < grid.bytes.length
  );
  assert.equal(eligible.length, 35);
  const vectors = eligible.map(item => {
    const byte = grid.bytes[item.primeSum];
    const distance = byte >> 3, direction = byte & 7;
    const [dr, dc] = DIRECTIONS[direction];
    return { index: item.index, dr: dr * distance, dc: dc * distance };
  });

  let total = 0, endpointX = 0, endpointXAndMEX = 0;
  for (let a = 0; a < vectors.length; a++) {
    for (let b = 0; b < vectors.length; b++) {
      if (b === a) continue;
      for (let c = 0; c < vectors.length; c++) {
        if (c === a || c === b) continue;
        for (let d = 0; d < vectors.length; d++) {
          if (d === a || d === b || d === c) continue;
          let row = startRow, col = startCol;
          const positions = [];
          for (const vector of [vectors[a], vectors[b], vectors[c], vectors[d]]) {
            row = mod(row + vector.dr, 11);
            col = mod(col + vector.dc, 11);
            positions.push(row * 11 + col);
          }
          total++;
          if (positions[3] === 37) {
            endpointX++;
            if (hasOrderedSubsequence(positions, [35, 36, 37])) {
              endpointXAndMEX++;
            }
          }
        }
      }
    }
  }
  assert.equal(total, 1256640);
  assert.equal(endpointX, 9192);
  assert.equal(endpointXAndMEX, 72);

  const selectedPermutationCount = permutations(wordIndices)
    .filter(indices => {
      const route = walk(indices.map(index => grid.bytes[wordData[index - 1].primeSum]));
      return hasOrderedSubsequence(route.positions, [35, 36, 37]);
    }).length;
  assert.equal(selectedPermutationCount, 4);

  const output = {
    classification: "provisional navigation bridge; not a decryption",
    sources: [
      "resources/liber-primus/lp2-grid-256.json",
      "resources/liber-primus/lp2-corpus.json",
      "resources/historical/cicada2016-4gq25-outguess.asc"
    ],
    grid: { height: 32, width: 8, cells: grid.bytes.length, ringLayers },
    ringPerimetersOuterToInner: perimeters,
    eulerTotientsOuterToInner: phiValues,
    wordSelectionOrder: "inner-to-outer",
    selectedWords: selected.map((item, i) => ({
      wordIndex: item.index,
      word: item.word,
      gpTokens: item.gpTokens,
      primeWeights: item.primeWeights,
      primeSum: item.primeSum,
      zeroBasedTableAddress: addresses[i],
      tableByte: selectedBytes[i]
    })),
    p32: {
      marker,
      start: { row: startRow, col: startCol, position: startIndex, rune: "H" },
      selectedRoute: selectedRoute.steps,
      final: { row: 3, col: 4, position: 37, rune: "X" },
      existing43WordCompassRouteFinalIndex: existing43Route.finalIndex,
      outerToInnerRoutePositions: outerToInnerRoute.positions
    },
    oneBasedTableAddressAlternative: {
      addresses: oneBasedAddresses,
      bytes: oneBasedRoute.steps.map(item => item.byte),
      positions: oneBasedRoute.positions,
      finalIndex: oneBasedRoute.finalIndex
    },
    exhaustiveDescriptiveControl: {
      eligibleWordOccurrences: eligible.length,
      orderedFourTuples: total,
      reachXEndpoint: endpointX,
      reachXEndpointRate: endpointX / total,
      reachXAndVisitMEXInOrder: endpointXAndMEX,
      reachXAndVisitMEXRate: endpointXAndMEX / total,
      selectedSetMEXPermutations: selectedPermutationCount,
      warning: "Post hoc conditional control; not a discovery-wide p-value."
    },
    interpretation: "The inside-out phi-ring selector chooses four words whose GP-prime-sum addresses produce a second route from the p32 H marker to X. Zero-based table addressing is essential. No plaintext, cipher key, or final destination is recovered."
  };
  process.stdout.write(JSON.stringify(output, null, 2) + "\n");
}

if (require.main === module) main();
