'use strict';

/**
 * Exact original p50 32x8 local-injectivity and source-conditioned null test.
 * Node.js 22 / CommonJS; read-only SFT. No input reconstruction or fitted key.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-grid-256.json'), 'utf8'));
const bytes = corpus.bytes;
const tokens = corpus.pages.flatMap(p => p.tokens);
assert.equal(bytes.length, 256);
assert.equal(tokens.length, 256);
assert.equal(corpus.alphabet.length, 60);
assert.equal(new Set(bytes).size, 161);
assert.equal(crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

/**
 * Count repeated unordered byte pairs in complete 8-cell blocks.
 * @param {number[]} values Complete 256-byte stream.
 * @param {number} phase Starting offset 0..7.
 * @returns {{pairs:number, rows:number, blocks:number}}
 */
function duplicates(values, phase) {
  let pairs = 0;
  let rows = 0;
  let blocks = 0;
  for (let at = phase; at + 8 <= values.length; at += 8) {
    let local = 0;
    for (let i = at; i < at + 8; i++) {
      for (let j = i + 1; j < at + 8; j++) {
        if (values[i] === values[j]) local++;
      }
    }
    pairs += local;
    if (local !== 0) rows++;
    blocks++;
  }
  return { pairs, rows, blocks };
}

const sourcePhases = Array.from({ length: 8 }, (_, phase) => duplicates(bytes, phase));
assert.deepEqual(sourcePhases.map(p => p.pairs), [0, 1, 2, 2, 4, 3, 1, 3]);
assert.equal(sourcePhases[0].blocks, 32);
assert.deepEqual(sourcePhases.slice(1).map(p => p.blocks), Array(7).fill(31));

const histogram = new Map([...corpus.alphabet].map(letter => [letter, 0]));
for (const token of tokens) histogram.set(token[1], histogram.get(token[1]) + 1);
const missing = [...histogram].filter(([, count]) => count === 0).map(([letter]) => letter);
assert.deepEqual(missing, ['f']);
assert.equal(bytes.some(value => [41, 101, 161, 221].includes(value)), false);

const clone = bytes.slice();
clone[1] = clone[0];
assert.ok(duplicates(clone, 0).pairs > 0, 'planted duplicate must be detected');

const frequencies = new Map();
for (const byte of bytes) frequencies.set(byte, (frequencies.get(byte) ?? 0) + 1);
let globalPairs = 0;
for (const count of frequencies.values()) globalPairs += count * (count - 1) / 2;
assert.equal(globalPairs, 127);
const analyticExpectedPairs = globalPairs * (32 * 28) / (256 * 255 / 2);

let state = 0x33012026;
function next() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}

const trials = 150000;
const shuffled = bytes.slice();
let collisionFree = 0;
let totalPairs = 0;
for (let trial = 0; trial < trials; trial++) {
  for (let i = 255; i > 0; i--) {
    const j = next() % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const value = duplicates(shuffled, 0).pairs;
  totalPairs += value;
  if (value === 0) collisionFree++;
}
assert.equal(collisionFree, 4238);
assert.equal(totalPairs, 524126);

console.log(JSON.stringify({
  source: 'original image-audited p49-51 base60 table',
  originalRows: sourcePhases[0],
  shiftedEightCellBlocks: sourcePhases.slice(1),
  distinctBytes: frequencies.size,
  totalRepeatedPairs: globalPairs,
  missingSecondDigitSymbols: missing,
  analyticExpectedWithinRowPairs: analyticExpectedPairs,
  null: {
    seed: '0x33012026',
    trials,
    collisionFree,
    meanPairs: totalPairs / trials,
    plusOneFraction: (collisionFree + 1) / (trials + 1)
  },
  interpretation: 'Local row injectivity only; no decoded plaintext or identified historical key.'
}, null, 2));
