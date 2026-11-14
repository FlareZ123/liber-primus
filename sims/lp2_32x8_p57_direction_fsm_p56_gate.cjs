"use strict";

/**
 * Bounded source-motivated test of a 32-state / 8-direction table walker.
 *
 * Node.js 22, CommonJS, no dependencies.
 * Run: node sims/lp2_32x8_p57_direction_fsm_p56_gate.cjs
 *
 * Hypothesis:
 * - the 31 original thirteen-dot events define state labels;
 * - the black event's chronological ordinal is the initial state;
 * - the 32x8 p50 table is a state x direction transition table;
 * - p57 interior totients modulo 8 are the 55 direction inputs;
 * - each cell byte is the next page's prime-totient start ordinal;
 * - its low five bits select the next state;
 * - outputs are assigned to pages in p57's Josephus order and used with
 *   the established p56 transparent-F prime-totient cipher.
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
const primeList = primes(700);
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

// Validate the canonical 32x8 table.
assert.equal(grid.byte_rows.length, 32);
assert.ok(grid.byte_rows.every(row => row.length === 8));
const table = grid.byte_rows.flat();
assert.equal(table.length, 256);

// Extract the 31 thirteen-dot events in physical order. At the co-located
// p7 mark, the red event sorts before the black event, matching the original
// annotation/event serialization used by the source audit.
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

// Validate all original page/segment mappings; the transcription omits p50.
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

// The 55 p57 word interiors supply both the Josephus steps and 8-way inputs.
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

// Table walker: each input direction selects one cell in the current row.
// The cell byte is the page's prime-start ordinal and its low five bits are
// the next 0..31 state.
function walk(dirs, startState) {
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
  const fsmForward = walk(directions, startState);
  const fsmReverse = walk(directions.slice().reverse(), startState);
  const firstForwardPage = forward.eliminated[0];
  const firstReversePage = reverseSteps.eliminated[0];
  return {
    startState,
    forward: {
      firstPage: firstForwardPage,
      firstPageKeyStart: fsmForward.outputs[0],
      firstTenKeyStarts: fsmForward.outputs.slice(0, 10),
      firstTenStates: fsmForward.states.slice(0, 10),
      failure: firstImpossible(firstForwardPage, fsmForward.outputs[0])
    },
    reverseSteps: {
      firstPage: firstReversePage,
      firstPageKeyStart: fsmReverse.outputs[0],
      firstTenKeyStarts: fsmReverse.outputs.slice(0, 10),
      firstTenStates: fsmReverse.states.slice(0, 10),
      failure: firstImpossible(firstReversePage, fsmReverse.outputs[0])
    }
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

// A simpler direct-page interpretation of the same outputs is not a
// 55-page permutation: only 23 distinct page residues occur.
const directPages = blackOrdinalStart.forward.firstTenKeyStarts; // prefix diagnostic only
const allForward = walk(directions, blackOrdinal).outputs;
const directPageResidues = allForward.map(value => value % 56);
assert.equal(new Set(directPageResidues).size, 23);

console.log(JSON.stringify({
  decision: "REJECTED: fixed 32x8 direction-FSM to p56 page-key schedule",
  source: {
    tableDimensions: [32, 8],
    thirteenDotEvents: markers.length,
    blackMarker: markers[blackOrdinal],
    blackMarkerChronologicalOrdinal: blackOrdinal,
    p57InteriorCount: interiors.length,
    directionModulus: 8,
    forwardFirstPages: forward.eliminated.slice(0, 10),
    reverseStepFirstPages: reverseSteps.eliminated.slice(0, 10),
    survivors: {forward: forward.survivors, reverseSteps: reverseSteps.survivors}
  },
  p56PositiveControl: {
    plaintextRunes: p56Plain.length,
    literalFPositions: p56LiteralF,
    keySymbolsConsumed: p56Consumed,
    exactOriginalCiphertextReproduced: true
  },
  blackOrdinalStart,
  blackPageStart,
  directPageOutputControl: {
    uniquePageResidues: new Set(directPageResidues).size,
    totalOutputs: directPageResidues.length
  },
  scope: [
    "Tests the fixed mapping cell = table[state*8 + totientDirectionMod8], nextState = cellByte mod32, page key start = full cell byte.",
    "Tests black marker chronological ordinal 8 and the obvious page-number state 7.",
    "Rejects this table-walker plus p56 transparent-F prime-totient page decoder in both Josephus directions.",
    "Does not reject the p50 table as a different kind of source-selected object or the p57 route as a navigation clue."
  ]
}, null, 2));
