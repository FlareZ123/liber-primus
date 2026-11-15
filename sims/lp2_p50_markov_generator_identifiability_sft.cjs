'use strict';

/**
 * Original LP2 p49–51 byte-generator identifiability SFT.
 * Source: resources/liber-primus/lp2-grid-256.json
 * Runtime: Node.js 22, CommonJS, Windows-compatible.
 *
 * This tests the arbitrary stationary k-byte lookup recurrence
 * x[t+k] = F(x[t], ..., x[t+k-1]), with F unknown.
 * It does not assume a particular PRNG, seed, English plaintext, or GP29 key.
 */
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { createHash } = require('node:crypto');

const sourcePath = join(__dirname, '..', 'resources', 'liber-primus', 'lp2-grid-256.json');
const grid = JSON.parse(readFileSync(sourcePath, 'utf8'));
const bytes = grid.bytes;
const alphabet = grid.alphabet;

assert.equal(bytes.length, 256);
assert.equal(grid.byte_count, 256);
assert.equal(grid.pages.reduce((n, p) => n + p.bytes.length, 0), 256);
assert.deepStrictEqual(grid.pages.flatMap((p) => p.bytes), bytes);
assert.equal(createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
assert.equal(alphabet.length, 60);
assert.deepStrictEqual(
  grid.pages.flatMap((p) => p.tokens).map((token) =>
    60 * alphabet.indexOf(token[0]) + alphabet.indexOf(token[1])),
  bytes);

/**
 * @param {number[]} tape - Native byte values.
 * @param {number} order - Window length of a deterministic stationary lookup.
 * @param {number} split - Length of the training prefix.
 * @returns {{trainStates:number,conflicts:Array<{first:number,second:number,state:string,prior:number,after:number}>,holdoutMatches:number,holdoutCorrect:number}}
 */
function inspect(tape, order, split) {
  const learned = new Map();
  const conflicts = [];
  let holdoutMatches = 0;
  let holdoutCorrect = 0;
  for (let i = 0; i < split - order; i += 1) {
    const state = tape.slice(i, i + order).join(',');
    const next = tape[i + order];
    const prior = learned.get(state);
    if (prior === undefined) learned.set(state, { at: i, next });
    else if (prior.next !== next) {
      conflicts.push({
        first: prior.at, second: i, state, prior: prior.next, after: next,
      });
    }
  }
  for (let i = split; i + order < tape.length; i += 1) {
    const state = tape.slice(i, i + order).join(',');
    const prior = learned.get(state);
    if (prior !== undefined) {
      holdoutMatches += 1;
      if (prior.next === tape[i + order]) holdoutCorrect += 1;
    }
  }
  return { trainStates: learned.size, conflicts, holdoutMatches, holdoutCorrect };
}

const original1 = inspect(bytes, 1, 128);
const original2 = inspect(bytes, 2, 128);
assert.equal(original1.trainStates, 98);
assert.equal(original1.conflicts.length, 29);
assert.deepStrictEqual(original1.conflicts[0], {
  first: 7, second: 14, state: '183', prior: 92, after: 212,
});
assert.equal(original2.trainStates, 126);
assert.equal(original2.conflicts.length, 0);
assert.equal(original2.holdoutMatches, 0);

const plantedOne = Array.from({ length: 256 }, (_, i) => (3 + 7 * i) % 37);
const positiveOne = inspect(plantedOne, 1, 128);
assert.equal(positiveOne.conflicts.length, 0);
assert.equal(positiveOne.holdoutMatches, 127);
assert.equal(positiveOne.holdoutCorrect, 127);

const plantedTwo = [0, 1];
while (plantedTwo.length < 256) {
  plantedTwo.push((plantedTwo[plantedTwo.length - 1] +
    plantedTwo[plantedTwo.length - 2]) % 29);
}
const positiveTwo = inspect(plantedTwo, 2, 128);
assert.equal(positiveTwo.conflicts.length, 0);
assert.equal(positiveTwo.holdoutMatches, 126);
assert.equal(positiveTwo.holdoutCorrect, 126);

/**
 * @param {number} start - Table index 0..255.
 * @returns {number} - Which exact cycle the orbit eventually reaches.
 */
function basin(start) {
  const seen = new Set();
  let at = start;
  while (!seen.has(at)) {
    seen.add(at);
    at = bytes[at];
  }
  return at === 158 || at === 249 ? 1 : 0;
}
const minority = bytes.map((_, i) => i).filter((i) => basin(i) === 1);
assert.deepStrictEqual(minority, [9, 158, 227, 249]);
const mask = Array.from({ length: 32 }, (_, row) => {
  let value = 0;
  for (let col = 0; col < 8; col += 1) value = 2 * value + basin(row * 8 + col);
  return value;
});
assert.equal(mask.reduce((sum, b) => sum + b.toString(2).replaceAll('0', '').length, 0), 4);

console.log('CONTROL one-byte lookup: 127/127 holdout predictions correct');
console.log('CONTROL two-byte Fibonacci mod29: 126/126 holdout predictions correct');
console.log('SOURCE first128 one-byte state: 98 distinct states, 29 contradictions');
console.log('SOURCE first128 two-byte state: 126 distinct states, 0 repeated pairs');
console.log('SOURCE holdout two-byte state: 0 prior state matches; zero predictions possible');
console.log('SOURCE pointer-map two-cycle basin: indices 9,158,227,249 (4/256)');
console.log('SOURCE pointer-map 32x8 bit projection: ' +
  Buffer.from(mask).toString('hex'));
console.log('PASS original-source generator-identifiability and positive controls');
