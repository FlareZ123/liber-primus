'use strict';

/**
 * Read-only LP2 top-quotient/LP1 p05 square candidate, for source-exact
 * independent reproduction. Node.js 22, CommonJS, no dependencies.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const lp1 = read('resources/liber-primus/lp1-plaintext-reference.txt');
assert.equal(crypto.createHash('sha256').update(Buffer.from(grid.bytes))
  .digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
assert(lp1.includes('272  138  341  131  151'));
assert(lp1.includes('226  245   91  245  226'));

// Printed LP1 physical p05 second 5x5 numeric Wisdom square, row-major.
const wisdomSquare = [
  [272, 138, 341, 131, 151],
  [366, 199, 130, 320, 18],
  [226, 245, 91, 245, 226],
  [18, 320, 130, 199, 366],
  [151, 131, 341, 138, 272]
].map((row) => row.map((x) => x % 29));
const cells = grid.bytes.map((byte, index) => ({
  index, byte, highQuotient: Math.floor(byte / 29), residue: byte % 29
})).filter((cell) => cell.highQuotient === 8);
assert.equal(cells.length, 25);
assert.deepEqual(cells.map((x) => x.index),
  [5,9,12,48,56,65,92,115,121,138,140,148,157,158,159,160,166,167,168,170,176,214,227,233,236]);

const mod = (x) => ((x % 29) + 29) % 29;
const residues = cells.map((c) => c.residue);
/** @param {number[][]} matrix */
const rotate = (matrix) => matrix[0].map((_, c) =>
  matrix.map((row) => row[c]).reverse());
const matrices = new Map();
for (let reflected = 0; reflected < 2; reflected++) {
  let matrix = reflected ? [...wisdomSquare].reverse() : wisdomSquare;
  for (let turn = 0; turn < 4; turn++) {
    const flat = matrix.flat();
    matrices.set(flat.join(','), flat);
    matrix = rotate(matrix);
  }
}
assert.equal(matrices.size, 4); // The source key itself is reflection-symmetric.
const layouts = [...matrices.values()];
const decoded = (pad, sign, source = residues) =>
  source.map((x, i) => mod(x + sign * pad[i]));
const original = decoded(wisdomSquare.flat(), -1);
assert.deepEqual(original.slice(17, 21), [2, 12, 4, 26]);
assert.equal(original.map((x) => corpus.translit[x]).join(''),
  'DAOEGTCHUREOMUSROEEOBTHEORYRANA');

const exactTarget = [2, 12, 4, 26]; // TH + EO + R + Y
/** @param {number[]} symbols */
function containsTheory(symbols) {
  for (let i = 0; i <= symbols.length - exactTarget.length; i++) {
    if (exactTarget.every((v, j) => symbols[i + j] === v)) return true;
  }
  return false;
}
const hits = [];
for (const [i, pad] of layouts.entries()) {
  for (const sign of [-1, 1]) {
    const plain = decoded(pad, sign);
    if (containsTheory(plain)) hits.push({layout: i, sign});
    assert.deepEqual(plain.map((p, j) => mod(p - sign * pad[j])),
      residues);
  }
}
assert(hits.length > 0);
let x = 0x3301;
/** @returns {number} */
function random32() {
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  return x >>> 0;
}
const trials = 100000;
let randomHit = 0;
let zeroE = 0;
for (let trial = 0; trial < trials; trial++) {
  const shuffled = residues.slice();
  for (let i = 24; i > 0; i--) {
    const j = random32() % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  let any = false;
  let everyEFree = true;
  for (const pad of layouts) {
    for (const sign of [-1, 1]) {
      const candidate = decoded(pad, sign, shuffled);
      if (containsTheory(candidate)) any = true;
      if (candidate.includes(18)) everyEFree = false;
    }
  }
  if (any) randomHit++;
  if (everyEFree) zeroE++;
}
console.log(JSON.stringify({
  source: 'LP2 pp49–51: q=floor(byte/29)=8, 25 cells',
  square: 'LP1 physical p05: printed symmetric 5x5 Wisdom numbers',
  originalPositions: cells.map((c) => c.index),
  originalMinusSquareGP29: original,
  originalMinusSquareTranslit: original.map((v) => corpus.translit[v]).join(''),
  wordTheory: {runeIndices: exactTarget, decodedOffsets: [17, 18, 19, 20],
    originalTableOffsets: [167, 168, 170, 176]},
  originalLayoutsWithExactTarget: hits,
  postSelectionCaveat: 'THEORY chosen after looking; fixed-word null does not adjust for all possible words, routes, keys or prior searches',
  conditionalRandomResiduePermutations: trials,
  anyTheoryInEightLayouts: randomHit,
  noRuneEInAllEightLayouts: zeroE,
  noIdentifiedPlaintextOrKey: true
}, null, 2));
