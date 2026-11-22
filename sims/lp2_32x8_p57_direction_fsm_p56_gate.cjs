"use strict";

/**
 * Bounded source-motivated tests of p57 directions against the p50 32x8 table.
 *
 * Node.js 22, CommonJS, no dependencies.
 * Run: node sims/lp2_32x8_p57_direction_fsm_p56_gate.cjs
 *
 * Readings tested:
 * A. 256-cell, 8-direction bitmask maze, starting at black marker offset194.
 * B. 32x8 grid walk driven by p57 totient directions, reading destination
 *    bytes as per-page prime-start ordinals.
 * C. 32-state / 8-direction transducer, with black marker ordinal8 as the
 *    initial state and each cell byte's low five bits as the next state.
 *
 * The p56 known-answer vector is a positive control. Every possible
 * transparent-F branch is retained until a page becomes impossible.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/lp2-transcription.txt");
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const segments = transcription.split(/^\s*%\s*$/m);
assert.equal(segments.length, 57);

const runeToIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const runeTokens = corpus.translit.map((token, index) => ({token, index}))
  .sort((a, b) => b.token.length - a.token.length);
const mod29 = n => ((n % 29) + 29) % 29;

function parseWords(segment) {
  return (segment.replace(/\/\s*/gu, "").match(/[\u16A0-\u16FF]+/gu) || [])
    .map(word => Array.from(word, rune => {
      const index = runeToIndex.get(rune);
      assert.notEqual(index, undefined, "unknown original GP rune");
      return index;
    }));
}

function encodeWord(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/K/g, "C")
    .replace(/Z/g, "S")
    .replace(/ING/g, "NG")
    .replace(/IO/g, "IA");
  const output = [];
  for (let i = 0; i < normalized.length;) {
    const token = runeTokens.find(x => normalized.startsWith(x.token, i));
    assert.ok(token, "known plaintext token cannot be represented: " + normalized);
    output.push(token.index);
    i += token.token.length;
  }
  return output;
}

function primes(count) {
  let limit = 10000;
  while (true) {
    const composite = new Uint8Array(limit + 1);
    const output = [];
    for (let p = 2; p <= limit; p++) {
      if (composite[p]) continue;
      output.push(p);
      if (p * p <= limit) {
        for (let k = p * p; k <= limit; k += p) composite[k] = 1;
      }
    }
    if (output.length >= count) return output.slice(0, count);
    limit *= 2;
  }
}
const primeList = primes(800);
const totients = primeList.map(p => p - 1);

function josephus(stepValues) {
  const remaining = Array.from({length: 56}, (_, i) => i);
  const eliminated = [];
  let cursor = 0;
  for (const step of stepValues) {
    cursor = (cursor + step - 1) % remaining.length;
    eliminated.push(remaining.splice(cursor, 1)[0]);
  }
  return {eliminated, survivors: remaining};
}

function firstImpossible(page, startOrdinal) {
  const ciphertext = corpus.pages[page].indices;
  let states = new Set([0]);
  for (let i = 0; i < ciphertext.length; i++) {
    const c = ciphertext[i];
    const next = new Set();
    const cases = [];
    for (const used of states) {
      if (c === 0) {
        next.add(used);
        cases.push({used, mode: "literal-F", nextUsed: used});
      }
      const keyIndex = startOrdinal + used;
      const keyTotient = totients[keyIndex];
      const keyMod29 = keyTotient % 29;
      const plaintext = mod29(c - keyMod29);
      if (plaintext !== 0) {
        next.add(used + 1);
        cases.push({used, mode: "consume", keyIndex,
          prime: primeList[keyIndex], keyTotient, keyMod29,
          plaintext, nextUsed: used + 1});
      } else {
        cases.push({used, mode: "invalid-consume", keyIndex,
          prime: primeList[keyIndex], keyTotient, keyMod29, plaintext});
      }
    }
    if (next.size === 0) {
      const prefix = ciphertext.slice(0, i + 1);
      return {
        page, startOrdinal, failAt: i, cipher: c,
        cipherRune: corpus.translit[c],
        statesBefore: [...states].sort((a, b) => a - b),
        cases,
        prefix: prefix.map(x => corpus.translit[x]).join(""),
        prefixLiteralFPositions: prefix.flatMap((x, j) => x === 0 ? [j] : [])
      };
    }
    states = next;
  }
  return {page, startOrdinal, valid: true, finalStates: [...states]};
}

assert.equal(grid.byte_rows.length, 32);
assert.ok(grid.byte_rows.every(row => row.length === 8));
const table = grid.byte_rows.flat();
assert.equal(table.length, 256);

// 31 thirteen-dot events in physical order. At the co-located p7 position,
// red sorts before black, matching the source event serialization.
const markers = [];
for (const page of ink.pages) {
  for (const mark of page.large_punctuation || []) {
    if (mark[1] === 13) markers.push({page: page.page, offset: mark[0], color: mark[2]});
  }
}
markers.sort((a, b) => a.page - b.page || a.offset - b.offset ||
  (a.color === "black" ? 1 : -1));
assert.equal(markers.length, 31);
const blackOrdinal = markers.findIndex(mark => mark.color === "black");
assert.equal(blackOrdinal, 8);
assert.deepEqual(markers[blackOrdinal], {page: 7, offset: 194, color: "black"});

// Validate original page/segment associations; the transcription omits p50.
const pageIds = [];
for (let page = 0; page < 56; page++) {
  if (page === 50) {
    assert.equal(corpus.pages[page].indices.length, 0);
    continue;
  }
  const segmentIndex = page < 50 ? page : page - 1;
  assert.deepEqual(parseWords(segments[segmentIndex]).flat(), corpus.pages[page].indices);
  pageIds.push(page);
}

// The 55 p57 word interiors supply both Josephus steps and 8-way directions.
const p57Words = parseWords(segments[56]);
assert.equal(p57Words.length, 20);
assert.deepEqual(p57Words.flat(), corpus.pages[57].indices);
const interiors = p57Words.flatMap(word => word.slice(1, -1));
assert.equal(interiors.length, 55);
const steps = interiors.map(index => corpus.prime[index] - 1);
const directions = steps.map(value => value % 8);
const forward = josephus(steps);
const reverseSteps = josephus(steps.slice().reverse());
assert.deepEqual(forward.survivors, [50]);
assert.deepEqual(reverseSteps.survivors, [50]);
assert.deepEqual([...forward.eliminated].sort((a, b) => a - b), pageIds);
assert.deepEqual([...reverseSteps.eliminated].sort((a, b) => a - b), pageIds);

// Positive control: exact 85-rune p56 known-answer encryption.
const p56Plaintext =
  "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT " +
  "IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";
const p56Plain = p56Plaintext.split(/\s+/).flatMap(encodeWord);
assert.equal(p56Plain.length, 85);
const p56LiteralF = p56Plain.flatMap((r, i) => r === 0 ? [i] : []);
assert.deepEqual(p56LiteralF, [56]);
let p56Consumed = 0;
const p56Reproduced = p56Plain.map(plain => {
  if (plain === 0) return 0;
  const cipher = mod29(plain + totients[p56Consumed] % 29);
  p56Consumed++;
  return cipher;
});
assert.deepEqual(p56Reproduced, corpus.pages[56].indices);
assert.equal(p56Consumed, 84);

// Reading A: each byte is an eight-way exit mask. Start at local rune offset
// 194. Direction order is N, NE, E, SE, S, SW, W, NW.
const compass = [[-1,0],[-1,1],[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1]];
function mazeFirstFailure(openBit) {
  let cell = 194;
  const trace = [];
  for (let i = 0; i < directions.length; i++) {
    const direction = directions[i];
    const mask = table[cell];
    const bit = (mask >> direction) & 1;
    if (bit !== openBit) {
      return {openBit, failAt: i, cell, row: Math.floor(cell / 8),
        col: cell % 8, direction, mask, bit, trace};
    }
    const row = Math.floor(cell / 8) + compass[direction][0];
    const col = (cell % 8) + compass[direction][1];
    if (row < 0 || row >= 32 || col < 0 || col >= 8) {
      return {openBit, failAt: i + 1, edge: true, lastCell: cell, trace};
    }
    const nextCell = row * 8 + col;
    trace.push({step: i, from: cell, to: nextCell, direction, mask, bit});
    cell = nextCell;
  }
  return {openBit, valid: true, finalCell: cell, trace};
}
const mazeOneIsOpen = mazeFirstFailure(1);
const mazeZeroIsOpen = mazeFirstFailure(0);
assert.equal(mazeOneIsOpen.failAt, 1);
assert.equal(mazeOneIsOpen.cell, 186);
assert.equal(mazeOneIsOpen.direction, 2);
assert.equal(mazeOneIsOpen.mask, 19);
assert.equal(mazeOneIsOpen.bit, 0);
assert.equal(mazeZeroIsOpen.failAt, 0);
assert.equal(mazeZeroIsOpen.cell, 194);
assert.equal(mazeZeroIsOpen.direction, 0);
assert.equal(mazeZeroIsOpen.mask, 159);
assert.equal(mazeZeroIsOpen.bit, 1);

// Reading B: the p57 directions walk through the 32x8 grid. Read the
// destination cell's byte as the next page's p56 prime-start ordinal.
// Two source-grounded starts are tested: flat local offset194 and the
// page/offset coordinate (row7, column194 mod8) = flat cell58.
function gridWalk(startCell, dirs, wrap) {
  let cell = startCell;
  const outputs = [];
  const cells = [cell];
  const trace = [];
  for (let i = 0; i < dirs.length; i++) {
    const direction = dirs[i];
    let row = Math.floor(cell / 8) + compass[direction][0];
    let col = (cell % 8) + compass[direction][1];
    if (wrap) {
      row = (row + 32) % 32;
      col = (col + 8) % 8;
    } else if (row < 0 || row >= 32 || col < 0 || col >= 8) {
      return {startCell, wrap, failAt: i, edge: true, cell, row, col, trace};
    }
    const nextCell = row * 8 + col;
    outputs.push(table[nextCell]);
    trace.push({step: i, from: cell, to: nextCell, direction, byte: table[nextCell]});
    cell = nextCell;
    cells.push(cell);
  }
  return {startCell, wrap, outputs, cells,
    uniqueCells: new Set(cells).size, finalCell: cell, trace};
}
function gridWalkCandidate(startCell, pageOrder) {
  const f = gridWalk(startCell, directions, false);
  const r = gridWalk(startCell, directions.slice().reverse(), false);
  const fw = gridWalk(startCell, directions, true);
  const rw = gridWalk(startCell, directions.slice().reverse(), true);
  return {
    startCell,
    noWrap: {forward: f, reverseSteps: r},
    wrap: {
      forward: {
        firstTenCells: fw.cells.slice(0, 10),
        firstTenKeyStarts: fw.outputs.slice(0, 10),
        uniqueCells: fw.uniqueCells,
        finalCell: fw.finalCell,
        firstPage: pageOrder.forward[0],
        failure: firstImpossible(pageOrder.forward[0], fw.outputs[0])
      },
      reverseSteps: {
        firstTenCells: rw.cells.slice(0, 10),
        firstTenKeyStarts: rw.outputs.slice(0, 10),
        uniqueCells: rw.uniqueCells,
        finalCell: rw.finalCell,
        firstPage: pageOrder.reverse[0],
        failure: firstImpossible(pageOrder.reverse[0], rw.outputs[0])
      }
    }
  };
}
const gridWalkFlatOffset = gridWalkCandidate(194, {
  forward: forward.eliminated, reverse: reverseSteps.eliminated
});
const gridWalkPageCoordinate = gridWalkCandidate(58, {
  forward: forward.eliminated, reverse: reverseSteps.eliminated
});
assert.equal(gridWalkFlatOffset.noWrap.forward.failAt, 18);
assert.equal(gridWalkFlatOffset.noWrap.reverseSteps.failAt, 15);
assert.equal(gridWalkPageCoordinate.noWrap.forward.failAt, 18);
assert.equal(gridWalkPageCoordinate.noWrap.reverseSteps.failAt, 15);
assert.equal(gridWalkFlatOffset.wrap.forward.firstTenKeyStarts[0], 19);
assert.equal(gridWalkFlatOffset.wrap.forward.failure.failAt, 13);
assert.equal(gridWalkFlatOffset.wrap.forward.failure.cipher, 20);
assert.equal(gridWalkFlatOffset.wrap.forward.failure.cases[0].keyIndex, 32);
assert.equal(gridWalkFlatOffset.wrap.forward.failure.cases[0].prime, 137);
assert.equal(gridWalkFlatOffset.wrap.forward.failure.cases[0].keyTotient, 136);
assert.equal(gridWalkFlatOffset.wrap.forward.failure.cases[0].keyMod29, 20);
assert.equal(gridWalkFlatOffset.wrap.reverseSteps.failure.failAt, 4);
assert.equal(gridWalkFlatOffset.wrap.reverseSteps.failure.cipher, 24);
assert.equal(gridWalkFlatOffset.wrap.reverseSteps.failure.cases[0].keyIndex, 22);
assert.equal(gridWalkFlatOffset.wrap.reverseSteps.failure.cases[0].prime, 83);
assert.equal(gridWalkFlatOffset.wrap.reverseSteps.failure.cases[0].keyTotient, 82);
assert.equal(gridWalkFlatOffset.wrap.reverseSteps.failure.cases[0].keyMod29, 24);
assert.equal(gridWalkPageCoordinate.wrap.forward.firstTenKeyStarts[0], 47);
assert.equal(gridWalkPageCoordinate.wrap.forward.failure.failAt, 85);
assert.equal(gridWalkPageCoordinate.wrap.forward.failure.cipher, 17);
assert.equal(gridWalkPageCoordinate.wrap.forward.failure.cases[0].keyIndex, 131);
assert.equal(gridWalkPageCoordinate.wrap.forward.failure.cases[0].prime, 743);
assert.equal(gridWalkPageCoordinate.wrap.forward.failure.cases[0].keyTotient, 742);
assert.equal(gridWalkPageCoordinate.wrap.forward.failure.cases[0].keyMod29, 17);
assert.equal(gridWalkPageCoordinate.wrap.reverseSteps.failure.failAt, 48);
assert.equal(gridWalkPageCoordinate.wrap.reverseSteps.failure.cipher, 5);
assert.equal(gridWalkPageCoordinate.wrap.reverseSteps.failure.cases[0].keyIndex, 94);
assert.equal(gridWalkPageCoordinate.wrap.reverseSteps.failure.cases[0].prime, 499);
assert.equal(gridWalkPageCoordinate.wrap.reverseSteps.failure.cases[0].keyTotient, 498);
assert.equal(gridWalkPageCoordinate.wrap.reverseSteps.failure.cases[0].keyMod29, 5);
assert.equal(gridWalkFlatOffset.wrap.forward.uniqueCells, 33);
assert.equal(gridWalkPageCoordinate.wrap.forward.uniqueCells, 33);

// Reading C: 32-state / 8-direction transducer. A cell byte is both the
// page's zero-based prime-start ordinal and its low-five-bit next state.
function stateWalk(dirs, startState) {
  let state = startState;
  const outputs = [];
  const states = [];
  for (const direction of dirs) {
    const value = table[state * 8 + direction];
    outputs.push(value);
    state = value % 32;
    states.push(state);
  }
  return {outputs, states, finalState: state};
}
function runStartState(startState) {
  const fsmForward = stateWalk(directions, startState);
  const fsmReverse = stateWalk(directions.slice().reverse(), startState);
  return {
    startState,
    forward: {
      firstPage: forward.eliminated[0],
      firstPageKeyStart: fsmForward.outputs[0],
      firstTenKeyStarts: fsmForward.outputs.slice(0, 10),
      firstTenStates: fsmForward.states.slice(0, 10),
      failure: firstImpossible(forward.eliminated[0], fsmForward.outputs[0])
    },
    reverseSteps: {
      firstPage: reverseSteps.eliminated[0],
      firstPageKeyStart: fsmReverse.outputs[0],
      firstTenKeyStarts: fsmReverse.outputs.slice(0, 10),
      firstTenStates: fsmReverse.states.slice(0, 10),
      failure: firstImpossible(reverseSteps.eliminated[0], fsmReverse.outputs[0])
    },
    outputs: fsmForward.outputs
  };
}
const blackOrdinalStart = runStartState(blackOrdinal);
const blackPageStart = runStartState(7);
assert.equal(blackOrdinalStart.forward.firstPage, 39);
assert.equal(blackOrdinalStart.forward.firstPageKeyStart, 122);
assert.equal(blackOrdinalStart.forward.failure.failAt, 67);
assert.equal(blackOrdinalStart.forward.failure.cipher, 26);
assert.deepEqual(blackOrdinalStart.forward.failure.statesBefore, [66]);
assert.equal(blackOrdinalStart.forward.failure.cases[0].keyIndex, 188);
assert.equal(blackOrdinalStart.forward.failure.cases[0].prime, 1129);
assert.equal(blackOrdinalStart.forward.failure.cases[0].keyTotient, 1128);
assert.equal(blackOrdinalStart.forward.failure.cases[0].keyMod29, 26);
assert.equal(blackOrdinalStart.forward.failure.cases[0].plaintext, 0);
assert.deepEqual(blackOrdinalStart.forward.failure.prefixLiteralFPositions, [43, 49]);

assert.equal(blackOrdinalStart.reverseSteps.firstPage, 15);
assert.equal(blackOrdinalStart.reverseSteps.firstPageKeyStart, 122);
assert.equal(blackOrdinalStart.reverseSteps.failure.failAt, 79);
assert.equal(blackOrdinalStart.reverseSteps.failure.cipher, 4);
assert.deepEqual(blackOrdinalStart.reverseSteps.failure.statesBefore, [77]);
assert.equal(blackOrdinalStart.reverseSteps.failure.cases[0].keyIndex, 199);
assert.equal(blackOrdinalStart.reverseSteps.failure.cases[0].prime, 1223);
assert.equal(blackOrdinalStart.reverseSteps.failure.cases[0].keyTotient, 1222);
assert.equal(blackOrdinalStart.reverseSteps.failure.cases[0].keyMod29, 4);
assert.equal(blackOrdinalStart.reverseSteps.failure.cases[0].plaintext, 0);
assert.deepEqual(blackOrdinalStart.reverseSteps.failure.prefixLiteralFPositions, [0, 18, 27, 66]);

assert.equal(blackPageStart.forward.firstPageKeyStart, 254);
assert.equal(blackPageStart.forward.failure.failAt, 25);
assert.equal(blackPageStart.forward.failure.cipher, 12);
assert.equal(blackPageStart.forward.failure.cases[0].keyIndex, 279);
assert.equal(blackPageStart.forward.failure.cases[0].keyMod29, 12);
assert.equal(blackPageStart.forward.failure.cases[0].plaintext, 0);
assert.equal(blackPageStart.reverseSteps.failure.failAt, 116);
assert.equal(blackPageStart.reverseSteps.failure.cipher, 8);
assert.equal(blackPageStart.reverseSteps.failure.cases[0].keyIndex, 367);
assert.equal(blackPageStart.reverseSteps.failure.cases[0].keyMod29, 8);
assert.equal(blackPageStart.reverseSteps.failure.cases[0].plaintext, 0);

const directPageResidues = blackOrdinalStart.outputs.map(value => value % 56);
assert.equal(new Set(directPageResidues).size, 23);

console.log(JSON.stringify({
  decision: "REJECTED: fixed 32x8 p57 direction-map readings",
  source: {
    tableDimensions: [32, 8],
    thirteenDotEvents: markers.length,
    blackMarker: markers[blackOrdinal],
    blackMarkerChronologicalOrdinal: blackOrdinal,
    p57InteriorCount: interiors.length,
    firstDirections: directions.slice(0, 12),
    forwardSurvivor: forward.survivors,
    reverseStepSurvivor: reverseSteps.survivors
  },
  p56PositiveControl: {
    plaintextRunes: p56Plain.length,
    literalFPositions: p56LiteralF,
    keySymbolsConsumed: p56Consumed,
    exactOriginalCiphertextReproduced: true
  },
  bitmaskMaze: {oneMeansOpen: mazeOneIsOpen, zeroMeansOpen: mazeZeroIsOpen},
  gridWalk: {flatOffset194: gridWalkFlatOffset, pageCoordinate58: gridWalkPageCoordinate},
  transducer: {blackOrdinalStart, blackPageStart},
  directPageOutputControl: {
    uniquePageResidues: new Set(directPageResidues).size,
    totalOutputs: directPageResidues.length
  },
  scope: [
    "Rejects the direct 256-cell direction-mask maze from black marker offset194 under both bit polarities.",
    "Rejects the toroidal destination-byte grid walk as a p56 page-key source for both source-grounded start-cell mappings and both directions; nonwrapping walks leave the grid before 55 steps.",
    "Rejects the fixed 32-state / 8-direction transducer with black ordinal8 and page-number7 starts when outputs are p56 prime-start ordinals.",
    "Does not reject the p50 table as a different kind of source-selected object or the p57 route as a navigation clue."
  ]
}, null, 2));
