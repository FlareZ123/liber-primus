"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const MOD = 29;

function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

function mod(value, modulus) {
  return ((value % modulus) + modulus) % modulus;
}

function uniqueSorted(values) {
  return [...new Set(values)].sort((a, b) => a - b);
}

function consecutiveRuns(values) {
  const sorted = uniqueSorted(values);
  const runs = [];
  for (let index = 0; index < sorted.length;) {
    let end = index + 1;
    while (end < sorted.length && sorted[end] === sorted[end - 1] + 1) end += 1;
    if (end - index >= 2) runs.push(sorted.slice(index, end));
    index = end;
  }
  return runs;
}

function hasRange(values, start, end) {
  const set = new Set(values);
  for (let value = start; value <= end; value += 1) {
    if (!set.has(value)) return false;
  }
  return true;
}

function H(values) {
  const output = [];
  for (let left = 0, right = values.length - 1; left < right; left += 1, right -= 1) {
    output.push(mod(values[left] - values[right], MOD));
    output.push(mod(values[left] + values[right], MOD));
  }
  if (values.length % 2 === 1) output.push(values[(values.length - 1) / 2]);
  return output;
}

function choose4(n) {
  return n * (n - 1) * (n - 2) * (n - 3) / 24;
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const parts = transcription.split(/^\s*%\s*$/m);
assert.equal(parts.length, 57);

const pages = parts.map((part, segment) => ({
  page: segment >= 50 ? segment + 1 : segment,
  words: [],
  offset: 0,
}));

let current = [];
let startSegment = 0;
let endSegment = 0;
let startOffset = 0;

function flushWord() {
  if (current.length === 0) return;
  if (startSegment === endSegment) {
    const page = pages[startSegment];
    page.words.push({
      ordinal: page.words.length + 1,
      start: startOffset,
      values: current.slice(),
    });
  }
  current = [];
}

for (let segment = 0; segment < parts.length; segment += 1) {
  for (const character of [...parts[segment]]) {
    const value = runeIndex.get(character);
    if (value !== undefined) {
      if (current.length === 0) {
        startSegment = segment;
        startOffset = pages[segment].offset;
      }
      endSegment = segment;
      current.push(value);
      pages[segment].offset += 1;
    } else if (character !== "/" && !/\s/u.test(character)) {
      flushWord();
    }
  }
}
flushWord();

const pageByNumber = new Map(pages.map((page) => [page.page, page]));
pageByNumber.set(50, { page: 50, words: [], offset: 0 });
assert.equal(pageByNumber.size, 58);
assert.deepEqual(
  [...pageByNumber.keys()].sort((a, b) => a - b),
  Array.from({ length: 58 }, (_, index) => index),
);

function receiver(sourceIndex) {
  const page = pageByNumber.get(sourceIndex);
  return page ? (page.words[sourceIndex] || null) : null;
}

const clear = signed.slice(
  signed.indexOf("Hello."),
  signed.indexOf("-----BEGIN PGP SIGNATURE-----"),
);
const signedWords = clear
  .replace(/\b7A35090F\b/gu, "")
  .match(/[A-Za-z]+/gu)
  .map((word) => word.toUpperCase());
assert.equal(signedWords.length, 43);

// Upstream, frozen p0 marker-row result from
// im-results/lp2-p0-square-state-rise-key-serializer.md.
// This SFT tests the downstream route, not the original pixel extraction.
const physicalLeftMinusRight = [18, 15, 20, 26];
const directions = uniqueSorted(physicalLeftMinusRight);
assert.deepEqual(directions, [15, 18, 20, 26]);
assert.deepEqual(
  directions.map((index) => signedWords[index]),
  ["WORDS", "MAP", "MEANING", "NUMBERS"],
);

const tape = grid.pages.flatMap((page) => page.tokens);
assert.equal(tape.length, 256);
const alpha60 = grid.alphabet;
const alpha59 = grid.alphabet.replace("f", "");

function decodeToken(token, radix) {
  const alphabet = radix === 59 ? alpha59 : alpha60;
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0, "token digit outside selected alphabet: " + token);
  return radix * high + low;
}

function wordValue(values, basis) {
  if (basis === "GP0") return values.reduce((sum, value) => sum + value, 0);
  if (basis === "GPprime") return values.reduce((sum, value) => sum + corpus.prime[value], 0);
  throw new Error("unknown word-value basis: " + basis);
}

function mapDirection(sourceIndex, basis, origin) {
  const first = receiver(sourceIndex);
  if (!first) return null;

  const value = wordValue(first.values, basis);
  const address = mod(value - origin, tape.length);
  const token = tape[address];
  const branches = {};

  for (const radix of [59, 60]) {
    const decoded = decodeToken(token, radix);
    const page = mod(decoded, 58);
    const second = receiver(page);
    if (!second) return null;
    branches[radix] = {
      decoded,
      page,
      word: page + 1,
      values: second.values,
      h: H(second.values),
    };
  }

  return {
    sourceIndex,
    sourceWord: signedWords[sourceIndex],
    firstWord: sourceIndex + 1,
    firstValues: first.values,
    basis,
    value,
    address,
    token,
    branches,
    coordinates: uniqueSorted([
      ...branches[59].h,
      ...branches[60].h,
    ]),
  };
}

const selectedRows = directions.map((index) => mapDirection(index, "GP0", 0));
assert.ok(selectedRows.every(Boolean));

const expectedFirst = [
  { index: 15, value: 75, token: "2v", base59: 174, page59: 0, base60: 177, page60: 3 },
  { index: 18, value: 115, token: "47", base59: 243, page59: 11, base60: 247, page60: 15 },
  { index: 20, value: 34, token: "3H", base59: 194, page59: 20, base60: 197, page60: 23 },
  { index: 26, value: 19, token: "0X", base59: 33, page59: 33, base60: 33, page60: 33 },
];

assert.deepEqual(
  selectedRows.map((row) => ({
    index: row.sourceIndex,
    value: row.value,
    token: row.token,
    base59: row.branches[59].decoded,
    page59: row.branches[59].page,
    base60: row.branches[60].decoded,
    page60: row.branches[60].page,
  })),
  expectedFirst,
);

const expectedH59 = [
  [15, 15, 10, 6, 28, 8, 26, 9],
  [26, 25],
  [8, 28, 6],
  [17, 7],
];
const expectedH60 = [
  [9, 21, 9, 17],
  [22, 27, 15, 11, 8],
  [12, 3, 10, 4, 28, 1, 5, 18],
  [17, 7],
];

assert.deepEqual(selectedRows.map((row) => row.branches[59].h), expectedH59);
assert.deepEqual(selectedRows.map((row) => row.branches[60].h), expectedH60);

const coordinates59 = uniqueSorted(expectedH59.flat());
const coordinates60 = uniqueSorted(expectedH60.flat());
const combinedCoordinates = uniqueSorted([...coordinates59, ...coordinates60]);
const combinedRuns = consecutiveRuns(combinedCoordinates);

assert.deepEqual(consecutiveRuns(coordinates59), [
  [6, 7, 8, 9, 10],
  [25, 26],
]);
assert.deepEqual(consecutiveRuns(coordinates60), [
  [3, 4, 5],
  [7, 8, 9, 10, 11, 12],
  [17, 18],
  [21, 22],
]);
assert.deepEqual(combinedRuns, [
  [3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  [17, 18],
  [21, 22],
  [25, 26, 27, 28],
]);

const decodedRuns = combinedRuns.map((run) => ({
  indices: run,
  words: run.map((index) => signedWords[index]),
}));
assert.deepEqual(decodedRuns[0].words, [
  "LIES", "EMPTY", "EPIPHANY", "SEEKS", "THE",
  "DEVOTED", "LIBER", "PRIMUS", "IS", "THE",
]);
assert.deepEqual(decodedRuns[3].words, ["THEIR", "NUMBERS", "ARE", "THE"]);

// The primary map is deliberately fixed to GP0, zero-origin table addressing,
// both already-live table radices, the 58 physical pages, and the fixed H map.
// Charge all four-element direction sets from the 42 valid numbered receivers.
const validFirstDirections = Array.from({ length: 43 }, (_, index) => index)
  .filter((index) => receiver(index) !== null);
assert.equal(validFirstDirections.length, 42);
assert.equal(choose4(validFirstDirections.length), 111930);

const prepared = Array.from({ length: 43 }, (_, index) =>
  mapDirection(index, "GP0", 0)
);

let validFourSets = 0;
let bothFixedRuns = 0;
let exactUnion = 0;
let runAtLeast10 = 0;
let maximumRun = 0;
const exactUnionSets = [];

for (let a = 0; a < validFirstDirections.length; a += 1) {
  for (let b = a + 1; b < validFirstDirections.length; b += 1) {
    for (let c = b + 1; c < validFirstDirections.length; c += 1) {
      for (let d = c + 1; d < validFirstDirections.length; d += 1) {
        const indices = [
          validFirstDirections[a],
          validFirstDirections[b],
          validFirstDirections[c],
          validFirstDirections[d],
        ];
        const rows = indices.map((index) => prepared[index]);
        if (rows.some((row) => row === null)) continue;

        validFourSets += 1;
        const coordinates = uniqueSorted(rows.flatMap((row) => row.coordinates));
        const runs = consecutiveRuns(coordinates);
        const longest = Math.max(0, ...runs.map((run) => run.length));
        if (longest >= 10) runAtLeast10 += 1;
        if (longest > maximumRun) maximumRun = longest;

        if (hasRange(coordinates, 3, 12) && hasRange(coordinates, 25, 28)) {
          bothFixedRuns += 1;
        }
        if (coordinates.join(",") === combinedCoordinates.join(",")) {
          exactUnion += 1;
          exactUnionSets.push(indices);
        }
      }
    }
  }
}

assert.equal(validFourSets, 40920);
assert.equal(bothFixedRuns, 68);
assert.equal(exactUnion, 4);
assert.equal(runAtLeast10, 3068);
assert.equal(maximumRun, 21);
assert.deepEqual(exactUnionSets, [
  [15, 18, 19, 26],
  [15, 18, 19, 35],
  [15, 18, 20, 26],
  [15, 18, 20, 35],
]);

// Sensitivity checks: alternate GP-prime or one-origin addressing does not
// reproduce both source intervals for the marker-selected four directions.
const alternatives = [
  { basis: "GP0", origin: 1 },
  { basis: "GPprime", origin: 0 },
  { basis: "GPprime", origin: 1 },
].map((mode) => {
  const rows = directions.map((index) => mapDirection(index, mode.basis, mode.origin));
  if (rows.some((row) => row === null)) {
    return { ...mode, valid: false, intervals: [] };
  }
  const coordinates = uniqueSorted(rows.flatMap((row) => row.coordinates));
  return {
    ...mode,
    valid: true,
    intervals: consecutiveRuns(coordinates),
    bothFixedRuns: hasRange(coordinates, 3, 12) && hasRange(coordinates, 25, 28),
  };
});
assert.ok(alternatives.every((row) => !row.valid || row.bothFixedRuns === false));

// Iterating the same map again is non-selective: it expands the first output
// to every one of the 29 GP indices. Do not promote this iteration.
function partialStep(indices) {
  const outputs = [];
  const missing = [];
  for (const index of indices) {
    const first = receiver(index);
    if (!first) {
      missing.push({ index, reason: "first receiver" });
      continue;
    }
    const address = mod(wordValue(first.values, "GP0"), tape.length);
    const token = tape[address];
    for (const radix of [59, 60]) {
      const decoded = decodeToken(token, radix);
      const page = mod(decoded, 58);
      const second = receiver(page);
      if (!second) {
        missing.push({ index, radix, page, reason: "second receiver" });
        continue;
      }
      outputs.push(...H(second.values));
    }
  }
  return { outputs, next: uniqueSorted(outputs), missing };
}

const secondIteration = partialStep(combinedCoordinates);
assert.deepEqual(secondIteration.next, Array.from({ length: 29 }, (_, index) => index));
assert.equal(secondIteration.missing.length, 6);

console.log(JSON.stringify({
  status: "PASS",
  upstreamMarkerRow: {
    physicalLeftMinusRight: physicalLeftMinusRight,
    riseOrderedIndices: directions,
    signedWords: directions.map((index) => signedWords[index]),
    note: "The original pixel extraction is established by the upstream p0 marker serializer SFT; this file starts from its frozen row output.",
  },
  firstReceiversAndP50: selectedRows.map((row) => ({
    sourceIndex: row.sourceIndex,
    sourceWord: row.sourceWord,
    receiver: "p" + row.sourceIndex + " word" + row.firstWord,
    gp0: row.value,
    p50Address: row.address,
    p50Token: row.token,
    base59: row.branches[59].decoded,
    page59: row.branches[59].page,
    base60: row.branches[60].decoded,
    page60: row.branches[60].page,
  })),
  secondReceivers: selectedRows.flatMap((row) =>
    [59, 60].map((radix) => ({
      sourceIndex: row.sourceIndex,
      radix,
      receiver: "p" + row.branches[radix].page + " word" + row.branches[radix].word,
      values: row.branches[radix].values,
      h: row.branches[radix].h,
    }))
  ),
  base59Coordinates: coordinates59,
  base59Runs: consecutiveRuns(coordinates59),
  base60Coordinates: coordinates60,
  base60Runs: consecutiveRuns(coordinates60),
  combinedCoordinates,
  combinedRuns: decodedRuns,
  familyControl: {
    candidateFourSets: choose4(validFirstDirections.length),
    validFourSets,
    bothFixedRuns,
    exactSameUnion: exactUnion,
    exactUnionSets,
    runAtLeast10,
    maximumRun,
    warning: "These are descriptive finite-family counts, not a p-value; the target intervals and route were identified after the upstream marker output.",
  },
  alternativeSelectedModes: alternatives,
  iterationControl: {
    nextCoordinateCount: secondIteration.next.length,
    nextCoordinates: secondIteration.next,
    missingSecondReceivers: secondIteration.missing.length,
    decision: "The second iteration saturates all 29 GP indices; do not extend this map recursively.",
  },
  interpretation: "A source-constrained navigation candidate, not unknown LP2 plaintext or a general cipher inverse.",
}, null, 2));
