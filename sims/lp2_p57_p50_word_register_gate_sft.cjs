'use strict';

/**
 * Source-locked p57-word / p50-state register test.
 * Run: node sims/lp2_p57_p50_word_register_gate_sft.cjs
 * Inputs: original GP29 corpus, printed p57 separators and 256-cell p50 bytes.
 * This deliberately tests one semantic word-number rule, not a key search.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const table = JSON.parse(read('resources/liber-primus/lp2-grid-256.json')).bytes;
const transcription = read('resources/liber-primus/lp2-transcription.txt');
assert.equal(table.length, 256);
assert.equal(corpus.pages[57].indices.length, 95);

const end = transcription.lastIndexOf('§');
const start = transcription.lastIndexOf('%', end);
const printed = transcription.slice(start + 1, end).trim().replace(/\/\r?\n/g, '').replace(/\r?\n/g, '');
const wordRunes = printed.split(/[.\-]/).filter(Boolean).map((word) => Array.from(word));
const lengths = wordRunes.map((word) => word.length);
assert.deepEqual(lengths, [7,4,2,6,7,2,2,7,2,4,4,3,3,14,4,2,8,5,3,6]);
assert.equal(wordRunes.length, 20);

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const indices = wordRunes.map((word) => word.map((rune) => {
  const idx = runeIndex.get(rune);
  assert.notEqual(idx, undefined);
  return idx;
}));
assert.deepEqual(indices.flat(), corpus.pages[57].indices);
const gp0 = indices.map((word) => word.reduce((total, idx) => total + idx, 0));
const gpPrime = indices.map((word) => word.reduce((total, idx) => total + corpus.prime[idx], 0));
const words = indices.map((word) => word.map((idx) => corpus.translit[idx]).join(''));
const p51Start = corpus.pages[51].indices.slice(0, 3);
assert.equal(p51Start.map((idx) => corpus.translit[idx]).join(''), 'WWP');
const rootAddress = p51Start.reduce((total, idx) => total + corpus.prime[idx], 0);
assert.equal(rootAddress, 81);

function forward(startAddress, successor) {
  const states = [startAddress];
  for (let i = 0; i < 20; i += 1) states.push(successor[states[i]]);
  return states;
}

const states = forward(rootAddress, table);
assert.deepEqual(states, [81,58,146,92,236,238,129,179,175,18,15,212,70,169,228,144,125,20,102,32,115]);
const signed = states.slice(0, -1).map((value, i) => states[i + 1] - value);
const modulo = (value) => ((value % 256) + 256) % 256;
const positive = gp0.map((number, i) => modulo(number) === modulo(signed[i]) ? i : -1).filter((i) => i >= 0);
const negative = gp0.map((number, i) => modulo(-number) === modulo(signed[i]) ? i : -1).filter((i) => i >= 0);
assert.deepEqual(positive, [19]);
assert.deepEqual(negative, [16]);
const matchesEither = [...positive, ...negative].sort((a, b) => a - b);
assert.deepEqual(matchesEither, [16,19]);
assert.equal(gp0[16], 105);  // DIUINITY, source V is written U.
assert.equal(gp0[19], 83);   // EMERGE, before the unique terminal 23 dots.
assert.equal(gpPrime[17], 115); // WITHIN.
assert.deepEqual([signed[2],signed[6],signed[15]].map(modulo), [202,50,237]);
assert.deepEqual([words[2],words[6],words[15]], ['THE','THE','THE']);

let sameOrBetter = 0;
let landOn115 = 0;
for (let seed = 0; seed < 256; seed += 1) {
  const pathStates = forward(seed, table);
  let count = 0;
  for (let i = 0; i < 20; i += 1) {
    const delta = pathStates[i + 1] - pathStates[i];
    if (modulo(delta) === modulo(gp0[i]) || modulo(delta) === modulo(-gp0[i])) count += 1;
  }
  if (count >= matchesEither.length) sameOrBetter += 1;
  if (pathStates[20] === 115) landOn115 += 1;
}
assert.equal(sameOrBetter, 12);
assert.equal(landOn115, 26);

// Independent, state-consistent positive: a table encoding exactly these
// twenty word-number directions must recover all twenty, including THE.
const plantedTable = Array.from({length:256}, (_, i) => i);
const plantedStates = [0];
for (let i = 0; i < 20; i += 1) {
  const next = modulo(plantedStates[i] + gp0[i]);
  assert.equal(plantedStates.includes(next), false);
  plantedTable[plantedStates[i]] = next;
  plantedStates.push(next);
}
assert.deepEqual(forward(0, plantedTable), plantedStates);
assert.ok(plantedStates.slice(0, -1).every((state, i) => modulo(plantedTable[state] - state) === modulo(gp0[i])));

console.log(JSON.stringify({
  p57Words: words,
  wordGP0: gp0,
  p51FirstWord: 'WWP',
  sourceRoot: rootAddress,
  states,
  signedSteps: signed,
  literalWordNumberDirection: {
    samePositive: positive.map((i) => ({index:i,word:words[i]})),
    sameNegative: negative.map((i) => ({index:i,word:words[i]})),
    consistentDirectionCount: 0,
    fitsEitherSign: matchesEither.length,
    rejectedSteps: 20 - matchesEither.length,
    repeatedTHEUnsignedStepResidues: [202,50,237],
    sourceStartComparison: {all:256, atLeastTwoMatches:sameOrBetter, landingOn115:landOn115}
  },
  sourceLocalCoincidences: {
    finalEMERGEgp0:83,
    finalEdge:states[20]-states[19],
    WITHINprimeSum:115,
    terminalNode:states[20]
  },
  plantedAllTwentyWordDirections: 'PASS',
  interpretation:'The 20-step count alignment does not define a consistent word-number direction command or a reversible unknown-page cipher.'
},null,2));
