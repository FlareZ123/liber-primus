'use strict';
/**
 * Compound page-15 4x4 square as 128-bit AES/ChaCha IV; each of the eight
 * vertical 32-byte grid columns as a 256-bit key for a text section.
 *
 * Four preregistered IV encodings: page-layout or red-centre spiral;
 * printed integers or prime-complements absolute to 3301, each mod 256.
 * Reproduce: node sims/grid_square_iv_keys.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { inputs, evaluate, cipherBytes } = require('./grid_section_column_keys.cjs');
const { encode } = require('./grid_keyskip_viterbi.cjs');

const GRID = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820]
];
const SPIRAL = [
  [1, 1], [1, 2], [2, 2], [2, 1], [2, 0], [1, 0], [0, 0], [0, 1],
  [0, 2], [0, 3], [1, 3], [2, 3], [3, 3], [3, 2], [3, 1], [3, 0]
];
const ROOT = path.join(__dirname, '..');
const ROUNDS = 100;

/** @returns {{name:string, iv:Buffer}[]} */
function candidateIVs() {
  assert.deepEqual(SPIRAL.map(([r, c]) => GRID[r][c]).slice(0, 5),
    [3299, 3298, 3296, 3294, 3288]);
  const sequences = [
    { prefix: 'row', numbers: GRID.flat() },
    { prefix: 'spiral', numbers: SPIRAL.map(([r, c]) => GRID[r][c]) }
  ];
  return sequences.flatMap(x => [
    { name: x.prefix + '-printed-mod256',
      iv: Buffer.from(x.numbers.map(n => n % 256)) },
    { name: x.prefix + '-prime-complement-mod256',
      iv: Buffer.from(x.numbers.map(n => Math.abs(3301 - n) % 256)) }
  ]);
}

/** @param {number[][]} groups @param {number[][]} keys @param {{name:string,iv:Buffer}[]} variants */
function scoreIVs(groups, keys, variants) {
  return variants.map(({ name, iv }) => {
    const result = evaluate(groups, keys, iv);
    return { name, ivHex: iv.toString('hex'), winner: result.winner,
      fixedWinner: result.fixedWinner };
  }).sort((a, b) => b.winner.optimum - a.winner.optimum);
}

/** @param {number} seed */
function random(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return x >>> 0;
  };
}

/** @param {number[][]} groups @param {number[][]} keys @param {Buffer} iv */
function plant(groups, keys, iv) {
  const source = fs.readFileSync(path.join(ROOT, 'resources/control/shakespeare_first300k.txt'), 'utf8');
  const plain = encode(source);
  const needed = groups.reduce((n, group) => n + group.length, 0);
  assert.ok(plain.length >= needed);
  let at = 0, repairCount = 0;
  const rand = random(0x45515e03);
  const ciphertext = groups.map((g, i) => {
    const stream = cipherBytes(keys[i], 'aes-256-ctr', g.length, iv);
    const output = Array.from({ length: g.length },
      (_, j) => (plain[at + j] + stream[j] % 29) % 29);
    at += g.length;
    for (let j = 1; j < output.length; j++)
      if (output[j] === output[j - 1] && rand() / 2 ** 32 < 0.81) {
        output[j] = (output[j] + 1 + rand() % 28) % 29;
        repairCount++;
      }
    return output;
  });
  const result = evaluate(ciphertext, keys, iv);
  const trueMode = result.all.find(x => x.algorithm === 'aes-256-ctr'
    && x.reverse === false && x.scaled === false && x.sign === -1);
  assert.ok(trueMode && trueMode.fixed > 0.047, 'Known-key implanted English should be detectable');
  assert.deepEqual(result.winner.assignment, [0, 1, 2, 3, 4, 5, 6, 7]);
  return { changes: repairCount, mode: 'aes-256-ctr, forward, byte%29, sign -1',
    trueModeFixed: trueMode.fixed, winner: result.winner };
}

function main() {
  const { groups, columnKeys } = inputs();
  const variants = candidateIVs();
  const observed = scoreIVs(groups, columnKeys, variants);
  console.log('SOURCE', JSON.stringify({
    square: GRID, spiralStart: SPIRAL[0], ivs: variants.map(x => ({
      name: x.name, hex: x.iv.toString('hex')
    })), groupLengths: groups.map(x => x.length)
  }));
  const plantedIV = variants.find(x => x.name === 'spiral-prime-complement-mod256').iv;
  console.log('PLANT', JSON.stringify(plant(groups, columnKeys, plantedIV)));
  console.log('ACTUAL', JSON.stringify(observed));
  const rand = random(0x45f19123);
  let exceeding = 0, sum = 0, peak = 0;
  for (let t = 0; t < ROUNDS; t++) {
    const fake = Array.from({ length: 4 }, (_, i) => ({
      name: 'random' + i, iv: Buffer.from(Array.from({ length: 16 }, () => rand() & 255))
    }));
    const best = scoreIVs(groups, columnKeys, fake)[0].winner.optimum;
    if (best >= observed[0].winner.optimum) exceeding++;
    sum += best;
    peak = Math.max(peak, best);
  }
  console.log('NULL', JSON.stringify({
    matchedReplicates: ROUNDS, randomIVsPerReplicate: 4,
    eachIVSearch: '16 mode families and optimal 8! column assignments',
    observedBest: observed[0].winner.optimum,
    wrongIVMeanBest: sum / ROUNDS, wrongIVMaximum: peak,
    correctedUpperTail: (exceeding + 1) / (ROUNDS + 1)
  }));
}
if (require.main === module) main();
module.exports = { GRID, SPIRAL, candidateIVs, scoreIVs, plant };
