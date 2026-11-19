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
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const tokens = grid.rows.flat();
const base60 = grid.byte_rows.flat();
const alphabet59 = grid.alphabet.replace("f", "");

/** @param {string} token @returns {number|null} */
function decodeBase59(token) {
  const high = alphabet59.indexOf(token[0]);
  const low = alphabet59.indexOf(token[1]);
  return high < 0 || low < 0 ? null : high * 59 + low;
}

const base59 = tokens.map(decodeBase59);
assert.equal(tokens.length, 256);
assert.equal(base60.length, 256);

const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} word @returns {number[]} */
function gpIndices(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const output = [];
  let offset = 0;
  while (offset < normalized.length) {
    if (normalized.startsWith("ING", offset)) {
      output.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      output.push(27);
      offset += 2;
      continue;
    }

    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP word " + word + " at " + offset);
    output.push(token.value);
    offset += token.symbol.length;
  }
  return output;
}

/** @param {string} word @returns {number} */
function gp0(word) {
  return gpIndices(word).reduce((sum, value) => sum + value, 0);
}

/**
 * @param {Array<number|null>} table
 * @param {number} start
 * @param {number} steps
 * @returns {number[]|null}
 */
function walk(table, start, steps) {
  const route = [start];
  let state = start;
  for (let index = 0; index < steps; index += 1) {
    if (state < 0 || state >= 256) return null;
    const next = table[state];
    if (!Number.isInteger(next)) return null;
    state = next;
    route.push(state);
  }
  return route;
}

const clear = signed2016.match(
  /Hash: SHA1\n\n([\s\S]*?)\n-----BEGIN PGP SIGNATURE-----/u
);
assert.ok(clear);
const words = (clear[1].match(/\b[A-Za-z]+\b/gu) || []).map((word, index) => ({
  index,
  word: word.toUpperCase(),
  gp: gpIndices(word),
  gp0: gp0(word),
}));
assert.equal(words.length, 43);
assert.deepEqual(
  words.slice(5, 9).map((row) => row.word),
  ["EPIPHANY", "SEEKS", "THE", "DEVOTED"]
);

const dh = { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2, e: 3 };
assert.equal(grid.rows[0].length, dh.A);
const route = walk(base60, gp0("SEEKS"), dh.p);
assert.ok(route);
assert.deepEqual(route, [
  71, 108, 14, 183, 81, 58, 146, 92, 236, 238, 129, 179,
  175, 18, 15, 212, 70, 169, 228, 144, 125, 20, 102, 32,
]);

const p32 = corpus.pages.find((page) => page.page === 32);
assert.ok(p32);
assert.equal(p32.indices.length, 121);
assert.equal(gp0("EPIPHANY"), 121);
const p32Side = Math.sqrt(p32.indices.length);
assert.equal(p32Side, dh.A + dh.e);
assert.equal(p32.indices.length, (dh.A + dh.e) ** 2);

const topPrimeSum = p32.indices
  .slice(0, p32Side)
  .reduce((sum, rune) => sum + corpus.prime[rune], 0);
const leftPrimeSum = Array.from(
  { length: p32Side },
  (_, row) => p32.indices[row * p32Side]
).reduce((sum, rune) => sum + corpus.prime[rune], 0);
assert.equal(topPrimeSum, 563);
assert.equal(leftPrimeSum, 569);

/** @param {number} state @returns {{row:number,col:number}} */
function p50Coordinate(state) {
  return { row: Math.floor(state / dh.A), col: state % dh.A };
}

/**
 * Reuse zero-based table coordinates on the source-oriented 11x11 p32 square.
 * The 32-row source coordinate is reduced modulo 11. The 8-column coordinate
 * already lies inside the 11-column target.
 *
 * @param {number} state
 * @returns {{offset:number,value:number,row:number,col:number}}
 */
function projectNatural(state) {
  const source = p50Coordinate(state);
  const row = source.row % p32Side;
  const col = source.col;
  const offset = row * p32Side + col;
  return { offset, value: p32.indices[offset], row, col };
}

/**
 * @param {number} state
 * @param {{swap:boolean,rowReflect:boolean,colReflect:boolean}} orientation
 * @returns {{offset:number,value:number}}
 */
function projectOriented(state, orientation) {
  const source = p50Coordinate(state);
  let row = source.row % p32Side;
  let col = source.col;

  if (orientation.swap) [row, col] = [col, row];
  if (orientation.rowReflect) row = p32Side - 1 - row;
  if (orientation.colReflect) col = p32Side - 1 - col;

  const offset = row * p32Side + col;
  return { offset, value: p32.indices[offset] };
}

const stateLengths = Object.entries(dh)
  .filter(([, value]) => value >= 2 && value <= route.length);
const coordinateCandidates = [];

for (const [lengthField, length] of stateLengths) {
  for (let start = 0; start + length <= route.length; start += 1) {
    const states = route.slice(start, start + length);
    const coordinates = states.map(p50Coordinate);
    const rowSum = coordinates.reduce((sum, cell) => sum + cell.row, 0);
    const colSum = coordinates.reduce((sum, cell) => sum + cell.col, 0);
    if (rowSum !== 29) continue;

    for (const [colField, value] of Object.entries(dh)) {
      if (colSum !== value) continue;
      coordinateCandidates.push({
        lengthField,
        length,
        start,
        states,
        rowSum,
        colSum,
        colField,
      });
    }
  }
}

assert.deepEqual(coordinateCandidates, [
  {
    lengthField: "K",
    length: 2,
    start: 6,
    states: [146, 92],
    rowSum: 29,
    colSum: 6,
    colField: "a",
  },
  {
    lengthField: "e",
    length: 3,
    start: 20,
    states: [125, 20, 102],
    rowSum: 29,
    colSum: 15,
    colField: "b",
  },
]);

const wordRanges = [];
let cursor = 0;
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const pageText = transcription.split(/\n%\n/u)[32];
const runeSet = new Set(corpus.runes);
let wordIndex = 0;
let wordStart = null;

for (const symbol of [...pageText.replace(/\/\n/gu, "").replace(/\n/gu, "")]) {
  if (runeSet.has(symbol)) {
    if (wordStart === null) wordStart = cursor;
    cursor += 1;
    continue;
  }
  if ("-.&$".includes(symbol) && wordStart !== null) {
    wordRanges.push({
      index: wordIndex,
      start: wordStart,
      end: cursor - 1,
      length: cursor - wordStart,
    });
    wordIndex += 1;
    wordStart = null;
  }
}
if (wordStart !== null) {
  wordRanges.push({
    index: wordIndex,
    start: wordStart,
    end: cursor - 1,
    length: cursor - wordStart,
  });
}
assert.equal(cursor, 121);
assert.equal(wordRanges.length, 22);

/** @param {number} offset @returns {{index:number,start:number,end:number,length:number}} */
function containingWord(offset) {
  const hit = wordRanges.find((word) => offset >= word.start && offset <= word.end);
  assert.ok(hit);
  return hit;
}

const candidateClosures = coordinateCandidates.map((candidate) => {
  const projected = candidate.states.map(projectNatural);
  const containing = projected.map((cell) => containingWord(cell.offset));
  const sourceIndex = containing.reduce((sum, word) => sum + word.index, 0);
  const target = words[sourceIndex] || null;
  const exact = Boolean(
    target &&
    target.gp.length === projected.length &&
    target.gp.every((value, index) => value === projected[index].value)
  );
  return {
    ...candidate,
    offsets: projected.map((cell) => cell.offset),
    values: projected.map((cell) => cell.value),
    containingWordIndices: containing.map((word) => word.index),
    containingWordLengths: containing.map((word) => word.length),
    sourceIndex,
    targetWord: target ? target.word : null,
    targetGp: target ? target.gp : null,
    exact,
  };
});

assert.equal(candidateClosures.length, 2);
assert.equal(candidateClosures.filter((row) => row.exact).length, 1);
const areClosure = candidateClosures.find((row) => row.exact);
assert.ok(areClosure);
assert.deepEqual(areClosure.states, [125, 20, 102]);
assert.equal(areClosure.states[0], dh.g ** dh.e);
assert.equal(areClosure.states[0], dh.A * dh.b + dh.g);
assert.equal(areClosure.states[1], gp0("THE"));
assert.equal(areClosure.states[1], dh.p - dh.e);
assert.equal(areClosure.states[1], dh.A * dh.K + dh.K ** 2);
assert.equal(areClosure.states[2], gp0("DEVOTED"));
assert.equal(areClosure.states[2], dh.a * (dh.p - dh.a));
assert.equal(areClosure.states[2], dh.A * (dh.a * dh.K) + dh.a);
assert.deepEqual(areClosure.offsets, [49, 26, 17]);
assert.deepEqual(areClosure.values, [24, 4, 18]);
assert.deepEqual(areClosure.containingWordIndices, [8, 5, 3]);
assert.deepEqual(areClosure.containingWordIndices, [dh.A, dh.g, dh.e]);
assert.deepEqual(areClosure.containingWordLengths, [6, 5, 11]);
assert.deepEqual(areClosure.states.map(p50Coordinate), [
  { row: dh.b, col: dh.g },
  { row: dh.K, col: dh.K ** 2 },
  { row: dh.a * dh.K, col: dh.a },
]);
assert.deepEqual(areClosure.states.map(projectNatural).map((cell) => [cell.row, cell.col]), [
  [dh.K ** 2, dh.g],
  [dh.K, dh.K ** 2],
  [1, dh.a],
]);
assert.equal(areClosure.sourceIndex, dh.A + dh.g + dh.e);
assert.equal(areClosure.sourceIndex, 16);
assert.equal(areClosure.targetWord, "ARE");
assert.deepEqual(areClosure.targetGp, [24, 4, 18]);

const kRival = candidateClosures.find((row) => row.lengthField === "K");
assert.ok(kRival);
assert.equal(kRival.sourceIndex, 15);
assert.equal(kRival.targetWord, "WORDS");
assert.deepEqual(kRival.containingWordIndices, [13, dh.K]);
assert.equal(kRival.exact, false);
const dhValueSet = new Set(Object.values(dh));
assert.ok(areClosure.containingWordIndices.every((value) => dhValueSet.has(value)));
assert.ok(!kRival.containingWordIndices.every((value) => dhValueSet.has(value)));

assert.equal(areClosure.offsets.reduce((sum, value) => sum + value, 0), 92);
assert.equal(gp0("EMPTY"), 92);
assert.equal(route[dh.g + dh.K], 92);
assert.equal(
  areClosure.containingWordIndices.reduce((sum, value) => sum + value, 0),
  16
);
const areOneBasedWordNumbers = areClosure.containingWordIndices.map((value) => value + 1);
assert.deepEqual(areOneBasedWordNumbers, [dh.e ** 2, dh.a, dh.K ** 2]);
assert.equal(areOneBasedWordNumbers.reduce((sum, value) => sum + value, 0), dh.B);

const areOneBasedPositions = areClosure.offsets.map((offset, index) => {
  const word = containingWord(offset);
  return offset - word.start + 1;
});
assert.deepEqual(areOneBasedPositions, [dh.a, dh.K, dh.e ** 2]);

assert.equal(
  areClosure.containingWordLengths.reduce((sum, value) => sum + value, 0),
  dh.p - 1
);

const distinctTargets = new Map();
for (const word of words) {
  const key = word.gp.join(",");
  if (!distinctTargets.has(key)) distinctTargets.set(key, word);
}
assert.equal(distinctTargets.size, 34);

const orientations = [];
for (const swap of [false, true]) {
  for (const rowReflect of [false, true]) {
    for (const colReflect of [false, true]) {
      orientations.push({ swap, rowReflect, colReflect });
    }
  }
}
assert.equal(orientations.length, 8);

// Matched square-page control. Among unknown rune-bearing pages, only p6 and
// p32 have nonzero perfect-square rune counts. Apply the same route projection
// and lexical family to both without changing width A or target orientation.
const squareUnknownPages = corpus.pages
  .filter((page) => page.page <= 55 && page.indices.length > 0)
  .filter((page) => Number.isInteger(Math.sqrt(page.indices.length)))
  .map((page) => ({ page: page.page, side: Math.sqrt(page.indices.length), indices: page.indices }));
assert.deepEqual(squareUnknownPages.map((row) => [row.page, row.side]), [[6, 14], [32, 11]]);

let lexicalComparisons = 0;
const lexicalHits = [];
for (const reverse of [false, true]) {
  const directedRoute = reverse ? [...route].reverse() : route;
  for (const orientation of orientations) {
    const projected = directedRoute.map((state) => projectOriented(state, orientation));
    for (const target of distinctTargets.values()) {
      for (let start = 0; start + target.gp.length <= projected.length; start += 1) {
        lexicalComparisons += 1;
        const match = target.gp.every(
          (value, index) => projected[start + index].value === value
        );
        if (!match) continue;
        lexicalHits.push({
          reverse,
          orientation,
          start,
          word: target.word,
          states: directedRoute.slice(start, start + target.gp.length),
          offsets: projected
            .slice(start, start + target.gp.length)
            .map((cell) => cell.offset),
        });
      }
    }
  }
}
assert.equal(lexicalComparisons, 11152);
assert.deepEqual(lexicalHits, [
  {
    reverse: false,
    orientation: { swap: false, rowReflect: false, colReflect: false },
    start: 20,
    word: "ARE",
    states: [125, 20, 102],
    offsets: [49, 26, 17],
  },
]);

const squarePageHits = [];
for (const page of squareUnknownPages) {
  for (const reverse of [false, true]) {
    const directedRoute = reverse ? [...route].reverse() : route;
    for (const orientation of orientations) {
      const projected = directedRoute.map((state) => {
        const source = p50Coordinate(state);
        let row = source.row % page.side;
        let col = source.col;
        if (orientation.swap) [row, col] = [col, row];
        if (orientation.rowReflect) row = page.side - 1 - row;
        if (orientation.colReflect) col = page.side - 1 - col;
        const offset = row * page.side + col;
        return { offset, value: page.indices[offset] };
      });
      for (const target of distinctTargets.values()) {
        for (let start = 0; start + target.gp.length <= projected.length; start += 1) {
          const match = target.gp.every(
            (value, index) => projected[start + index].value === value
          );
          if (!match) continue;
          squarePageHits.push({
            page: page.page,
            reverse,
            orientation,
            start,
            word: target.word,
            states: directedRoute.slice(start, start + target.gp.length),
            offsets: projected.slice(start, start + target.gp.length).map((cell) => cell.offset),
          });
        }
      }
    }
  }
}
assert.deepEqual(squarePageHits, [
  {
    page: 6,
    reverse: true,
    orientation: { swap: false, rowReflect: false, colReflect: true },
    start: 14,
    word: "IS",
    states: [238, 236],
    offsets: [21, 23],
  },
  {
    page: 32,
    reverse: false,
    orientation: { swap: false, rowReflect: false, colReflect: false },
    start: 20,
    word: "ARE",
    states: [125, 20, 102],
    offsets: [49, 26, 17],
  },
]);

const areOccurrences = words
  .filter((word) => word.word === "ARE")
  .map((word) => word.index);
assert.deepEqual(areOccurrences, [16, 27]);
assert.deepEqual(
  words.slice(14, 19).map((word) => word.word),
  ["ITS", "WORDS", "ARE", "THE", "MAP"]
);

const occurrencePageClosures = [];
for (const word of words) {
  const values = [
    { radix: "base60", value: base60[word.index] },
    { radix: "base59", value: base59[word.index] },
  ];
  for (const item of values) {
    if (item.value !== p32.indices.length) continue;
    occurrencePageClosures.push({
      index: word.index,
      word: word.word,
      radix: item.radix,
      token: tokens[word.index],
      value: item.value,
    });
  }
}
assert.deepEqual(occurrencePageClosures, [
  { index: 16, word: "ARE", radix: "base60", token: "21", value: 121 },
]);
assert.equal(base60[dh.A + dh.g + dh.e], (dh.A + dh.e) ** 2);

// The route-derived printed coordinate tuple itself is a narrow receiver gate.
// Use one-based coordinates [(e^2,a),(a,K),(K^2,e^2)] on every unknown page.
const printedCoordinateTuple = [
  [dh.e ** 2, dh.a],
  [dh.a, dh.K],
  [dh.K ** 2, dh.e ** 2],
];
const coordinateReceiverRows = [];
for (const page of corpus.pages.filter((candidate) => candidate.page <= 55 && candidate.indices.length > 0)) {
  const pageText = transcription.split(/\n%\n/u)[page.page];
  const ranges = [];
  let pageCursor = 0;
  let rangeStart = null;
  for (const symbol of [...pageText.replace(/\/\n/gu, "").replace(/\n/gu, "")]) {
    if (runeSet.has(symbol)) {
      if (rangeStart === null) rangeStart = pageCursor;
      pageCursor += 1;
      continue;
    }
    if ("-.&$".includes(symbol) && rangeStart !== null) {
      ranges.push({ start: rangeStart, end: pageCursor - 1, length: pageCursor - rangeStart });
      rangeStart = null;
    }
  }
  if (rangeStart !== null) {
    ranges.push({ start: rangeStart, end: pageCursor - 1, length: pageCursor - rangeStart });
  }

  const selected = [];
  let valid = true;
  for (const [wordNumber, runePosition] of printedCoordinateTuple) {
    const word = ranges[wordNumber - 1];
    if (!word || runePosition > word.length) {
      valid = false;
      break;
    }
    const offset = word.start + runePosition - 1;
    selected.push({ offset, value: page.indices[offset] });
  }
  if (!valid) continue;

  const key = selected.map((cell) => cell.value).join(",");
  const sourceWord = [...distinctTargets.values()].find(
    (target) => target.gp.length === 3 && target.gp.join(",") === key
  );
  coordinateReceiverRows.push({
    page: page.page,
    offsets: selected.map((cell) => cell.offset),
    values: selected.map((cell) => cell.value),
    sourceWord: sourceWord ? sourceWord.word : null,
  });
}
assert.deepEqual(coordinateReceiverRows, [
  { page: 32, offsets: [49, 26, 17], values: [24, 4, 18], sourceWord: "ARE" },
  { page: 44, offsets: [44, 27, 20], values: [21, 20, 22], sourceWord: null },
]);

assert.equal(words[17].word, "THE");
assert.equal(17 + 1, dh.p - dh.g);
assert.equal(words[18].word, "MAP");
assert.equal(gp0("MAP"), 56);
assert.equal(tokens[56], "4E");
assert.equal(String.fromCharCode(Number.parseInt(tokens[56], 16)), "N");
assert.equal(56 - 8, 48);
assert.equal(gp0("HERE"), 48);

// Frozen transfer control: the tempting rule "last three nonterminal states
// of any p32-terminating p50 path project to the next source word" fails.
// ARE index16 itself enters p32 as 16 -> 121 -> 237 -> 32.
const areIndexRoute = walk(base60, 16, 3);
assert.ok(areIndexRoute);
assert.deepEqual(areIndexRoute, [16, 121, 237, 32]);
const transferProjection = areIndexRoute.slice(0, 3).map(projectNatural);
assert.deepEqual(
  transferProjection.map((cell) => cell.value),
  [2, 17, 27]
);
assert.notDeepEqual(
  transferProjection.map((cell) => cell.value),
  gpIndices("THE")
);

// Freeze the same route-to-p32 gate over every signed-word/DH-depth path.
// The only coordinate-gated state sets are the two already seen on SEEKS;
// MEANING and FALSE merely enter the same [125,20,102] tail.
const terminalP32Routes = [];
for (const word of words) {
  for (const [field, depth] of Object.entries(dh)) {
    for (const [radix, table] of Object.entries({ base60, base59 })) {
      const candidateRoute = walk(table, word.gp0, depth);
      if (!candidateRoute || candidateRoute.at(-1) !== 32) continue;
      terminalP32Routes.push({
        word: word.word,
        index: word.index,
        field,
        depth,
        radix,
        route: candidateRoute,
      });
    }
  }
}
assert.equal(terminalP32Routes.length, 14);
assert.ok(terminalP32Routes.every((row) => row.radix === "base60"));

const terminalCoordinateStateSets = new Set();
for (const terminal of terminalP32Routes) {
  for (const [, length] of stateLengths) {
    if (length > terminal.route.length) continue;
    for (let start = 0; start + length <= terminal.route.length; start += 1) {
      const states = terminal.route.slice(start, start + length);
      const coordinates = states.map(p50Coordinate);
      const rowSum = coordinates.reduce((sum, cell) => sum + cell.row, 0);
      const colSum = coordinates.reduce((sum, cell) => sum + cell.col, 0);
      if (rowSum !== 29) continue;
      if (!Object.values(dh).includes(colSum)) continue;
      terminalCoordinateStateSets.add(states.join(","));
    }
  }
}
assert.deepEqual([...terminalCoordinateStateSets].sort(), ["125,20,102", "146,92"]);

// Among all consecutive e=3 windows on the natural p32 projection, identify
// windows whose selected cells are all addressed by simple DH-state-derived
// one-based printed coordinates, then apply the fixed source-index prediction.
const simpleStateCoordinates = new Set([
  dh.p, dh.g, dh.a, dh.b, dh.A, dh.B, dh.K, dh.e,
  dh.K ** 2, dh.e ** 2, dh.a * dh.K, dh.A + dh.A,
  dh.p - dh.a, dh.p - dh.g, dh.p - 1, 29,
]);
const eWindowCoordinateAudit = [];
for (let start = 0; start + dh.e <= route.length; start += 1) {
  const states = route.slice(start, start + dh.e);
  const cells = states.map((state) => {
    const projected = projectNatural(state);
    const word = containingWord(projected.offset);
    return {
      state,
      offset: projected.offset,
      value: projected.value,
      word0: word.index,
      word1: word.index + 1,
      position1: projected.offset - word.start + 1,
    };
  });
  const sourceIndex = cells.reduce((sum, cell) => sum + cell.word0, 0);
  const target = words[sourceIndex] || null;
  const exact = Boolean(
    target &&
    target.gp.length === dh.e &&
    target.gp.every((value, index) => value === cells[index].value)
  );
  eWindowCoordinateAudit.push({
    start,
    states,
    cells,
    allSimple: cells.every(
      (cell) => simpleStateCoordinates.has(cell.word1) && simpleStateCoordinates.has(cell.position1)
    ),
    sourceIndex,
    targetWord: target ? target.word : null,
    exact,
  });
}
assert.deepEqual(
  eWindowCoordinateAudit.filter((row) => row.exact).map((row) => ({
    start: row.start,
    states: row.states,
    sourceIndex: row.sourceIndex,
    targetWord: row.targetWord,
  })),
  [{ start: 20, states: [125, 20, 102], sourceIndex: 16, targetWord: "ARE" }]
);

console.log(JSON.stringify({
  status: "PASS",
  route,
  coordinateCandidates,
  candidateClosures,
  uniqueClosure: areClosure,
  controls: {
    lexicalComparisons,
    lexicalHits,
    p32OccurrenceClosures: occurrencePageClosures,
    rejectedGenericTransfer: {
      route: areIndexRoute,
      projected: transferProjection.map((cell) => cell.value),
      expectedNextSourceWord: "THE",
    },
    terminalP32Routes: terminalP32Routes.length,
    terminalCoordinateStateSets: [...terminalCoordinateStateSets].sort(),
    squarePageHits,
    coordinateReceiverRows,
    printedCoordinateTuple,
    eWindowExactClosures: eWindowCoordinateAudit.filter((row) => row.exact),
  },
  continuation: {
    sourceContext: words.slice(14, 19).map((word) => word.word),
    mapState: gp0("MAP"),
    mapToken: tokens[56],
    mapDirection: "N",
    hereState: gp0("HERE"),
  },
  classification:
    "source-constrained p32 ARE extraction candidate; coordinate projection is inferred and discovery was retrospective",
}, null, 2));
