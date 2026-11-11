"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(ROOT, name), "utf8");

function nthPrime(n) {
  let found = 0;
  for (let value = 2; ; value++) {
    let prime = true;
    for (let d = 2; d * d <= value; d++) {
      if (value % d === 0) { prime = false; break; }
    }
    if (prime && ++found === n) return value;
  }
}

function route(matrix, start, steps, directions) {
  let row = start.row;
  let col = start.col;
  return steps.map((step, index) => {
    const delta = directions[step.residue];
    assert.ok(delta, "unsupported direction residue " + step.residue);
    row += delta[0] * step.distance;
    col += delta[1] * step.distance;
    assert.ok(row >= 0 && row < matrix.length && col >= 0 && col < matrix[row].length,
      "route leaves source square at word " + (index + 1));
    return { word: index + 1, row, col, value: matrix[row][col] };
  });
}

function main() {
  const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
  const transcript = read("resources/lp2-transcription.txt").split("%");
  assert.ok(transcript.length >= 55);
  const pageText = transcript[32];
  const firstPeriod = pageText.indexOf(".");
  assert.ok(firstPeriod >= 0, "p32 first clause must end at a printed period");
  const firstClause = pageText.slice(0, firstPeriod);
  const words = firstClause.split(/[^\u16A0-\u16FF]+/u).filter(Boolean);
  const lengths = words.map((word) => [...word].length);
  assert.deepEqual(lengths, [1, 3, 5, 11, 5, 5, 3]);

  const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
  const steps = words.map((word) => {
    const runes = [...word];
    const middle = runes[Math.floor(runes.length / 2)];
    const ordinal = runeIndex.get(middle);
    assert.notEqual(ordinal, undefined);
    const prime = corpus.prime[ordinal];
    return {
      length: runes.length,
      middle,
      ordinal,
      prime,
      residue: prime % 8,
      distance: (runes.length - 1) / 2
    };
  });
  assert.deepEqual(steps.map((x) => x.ordinal), [20, 25, 13, 19, 2, 16, 3]);
  assert.deepEqual(steps.map((x) => x.prime), [73, 101, 43, 71, 5, 59, 7]);
  assert.equal(steps.reduce((sum, x) => sum + x.ordinal, 0), 98);
  assert.equal(steps.reduce((sum, x) => sum + x.prime, 0), 359);

  const page32 = corpus.pages.find((page) => page.page === 32);
  assert.ok(page32);
  assert.equal(page32.indices.length, 121);
  const matrix = Array.from({ length: 11 }, (_, row) =>
    page32.indices.slice(row * 11, (row + 1) * 11).map((index) => corpus.prime[index]));
  const transcriptRunes = [...pageText].filter((character) => runeIndex.has(character));
  assert.deepEqual(transcriptRunes.map((rune) => runeIndex.get(rune)), page32.indices);

  const central5 = matrix.slice(3, 8).map((row) => row.slice(3, 8));
  const perimeter = [
    ...central5[0],
    ...central5.slice(1, 4).map((row) => row[4]),
    ...central5[4].slice().reverse(),
    ...central5.slice(1, 4).reverse().map((row) => row[0])
  ];
  assert.deepEqual(perimeter, [67, 47, 19, 89, 53, 89, 107, 61, 37, 109, 107, 79, 41, 107, 17, 107]);
  const ringSum = perimeter.reduce((sum, value) => sum + value, 0);
  assert.equal(ringSum, 1136);
  const clausePrimeSum = words.flatMap((word) => [...word])
    .reduce((sum, rune) => sum + corpus.prime[runeIndex.get(rune)], 0);
  assert.equal(clausePrimeSum, 1467);
  assert.equal(clausePrimeSum - ringSum, 331);

  const squareBlocks = read("resources/cicada2014-openpuff-magic-squares.txt")
    .trim().split(/\r?\n\s*\r?\n/);
  const squares = squareBlocks.map((block) =>
    block.trim().split(/\r?\n/).map((line) => line.trim().split(/\s+/).map(Number)));
  assert.deepEqual(squares.map((square) => square.length), [5, 7, 5]);
  const square = squares[1];
  assert.ok(square.every((row) => row.length === 7));
  assert.equal(square[3][3], 331);
  const magicConstant = 1033;
  const rowSums = square.map((row) => row.reduce((sum, value) => sum + value, 0));
  const columnSums = square[0].map((_, col) =>
    square.reduce((sum, row) => sum + row[col], 0));
  const diagonals = [
    square.reduce((sum, row, index) => sum + row[index], 0),
    square.reduce((sum, row, index) => sum + row[6 - index], 0)
  ];
  assert.deepEqual(rowSums, Array(7).fill(magicConstant));
  assert.deepEqual(columnSums, Array(7).fill(magicConstant));
  assert.deepEqual(diagonals, [magicConstant, magicConstant]);

  const clockwise = { 1: [-1, 0], 3: [0, 1], 5: [1, 0], 7: [0, -1] };
  const selectedRoute = route(square, { row: 3, col: 3 }, steps, clockwise);
  const values = selectedRoute.map((cell) => cell.value);
  assert.deepEqual(values, [331, 114, 232, 15, 181, 27, 17]);
  const routeSum = values.reduce((sum, value) => sum + value, 0);
  assert.equal(routeSum, 917);
  assert.equal(nthPrime(32), 131);
  assert.equal(routeSum, 7 * nthPrime(32));
  assert.equal(magicConstant - routeSum, 116);
  assert.equal(4 * 29, 116);

  const residues = [1, 3, 5, 7];
  const baseDirections = [[-1, 0], [0, 1], [1, 0], [0, -1]];
  const orientationResults = [];
  for (const reverse of [false, true]) {
    const ordered = reverse ? [...baseDirections].reverse() : baseDirections;
    for (let rotation = 0; rotation < 4; rotation++) {
      const mapping = {};
      residues.forEach((residue, index) => {
        mapping[residue] = ordered[(index + rotation) % 4];
      });
      const candidate = route(square, { row: 3, col: 3 }, steps, mapping);
      orientationResults.push({
        reverse,
        rotation,
        sum: candidate.reduce((sum, cell) => sum + cell.value, 0),
        values: candidate.map((cell) => cell.value)
      });
    }
  }
  assert.deepEqual(orientationResults.map((x) => x.sum),
    [917, 1944, 917, 1944, 845, 1542, 845, 1542]);
  assert.equal(orientationResults.filter((x) => magicConstant - x.sum === 4 * 29).length, 2);

  const pageRoute = route(matrix, { row: 5, col: 5 }, steps, clockwise);
  const pageRouteValues = pageRoute.map((cell) => cell.value);
  const pageRouteIndices = pageRouteValues.map((value) => corpus.prime.indexOf(value));
  const pageRouteRunes = pageRouteIndices.map((index) => corpus.runes[index]);
  const pageRouteTranslit = pageRouteIndices.map((index) => corpus.translit[index]).join("");
  assert.deepEqual(pageRouteValues, [19, 97, 61, 47, 79, 71, 7]);
  assert.equal(pageRouteTranslit, "WABXNGMO");

  const payload = read("resources/historical/cicada2016-4gq25-outguess.asc");
  assert.equal(Buffer.byteLength(payload, "utf8"), 1136);
  const signatureHeader = "-----BEGIN PGP SIGNATURE-----";
  const headerStart = payload.indexOf(signatureHeader);
  assert.equal(headerStart, 317);
  assert.equal(signatureHeader.length, 29);
  const headerCentre = headerStart + Math.floor(signatureHeader.length / 2);
  assert.equal(headerCentre, 331);
  assert.equal(payload[headerCentre], " ");

  console.log(JSON.stringify({
    classification: "provisional source-constrained route; no plaintext or key",
    p32WordLengths: lengths,
    centreRunes: steps.map((x) => x.middle),
    centreOrdinals: steps.map((x) => x.ordinal),
    centrePrimes: steps.map((x) => x.prime),
    centreOrdinalSum: 98,
    centrePrimeSum: 359,
    p32FirstClausePrimeSum: clausePrimeSum,
    p32Central5Perimeter: perimeter,
    p32Central5PerimeterSum: ringSum,
    difference: clausePrimeSum - ringSum,
    selectedSquareCentre: square[3][3],
    magicConstant,
    rowSums,
    columnSums,
    diagonals,
    selectedRoute,
    routeValues: values,
    routeSum,
    magicGap: magicConstant - routeSum,
    fourDirectionsTimesAlphabet: 4 * 29,
    page32Prime: nthPrime(32),
    orientationSums: orientationResults.map((x) => x.sum),
    page32MatrixRoute: pageRoute,
    page32MatrixRouteRunes: pageRouteRunes,
    page32MatrixRouteTransliteration: pageRouteTranslit,
    payloadLength: Buffer.byteLength(payload, "utf8"),
    signatureHeaderStart: headerStart,
    signatureHeaderLength: signatureHeader.length,
    signatureHeaderCentre: headerCentre
  }, null, 2));
}

main();
