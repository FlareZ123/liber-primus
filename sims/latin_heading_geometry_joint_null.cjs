'use strict';
/**
 * Calibrate a published Latin heading candidate against shuffled original
 * 27x27 rune-grid cells. Conditional, postselected geometry test only.
 *
 * Run: node sims/latin_heading_geometry_joint_null.cjs [trials]
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const grid = corpus.pages.slice(0, 3).flatMap(p => p.indices);
const mod = x => ((x % 29) + 29) % 29;
const at = (r, c) => 27 * (r - 1) + c - 1;
const anchor = [13, 12];
const anchorIndex = at(...anchor);
assert.equal(grid.length, 729);
assert.deepEqual(corpus.pages.slice(0, 3).map(p => p.indices.length), [262, 266, 201]);
assert.equal(grid[anchorIndex], 11);
const red = grid.slice(0, 13);
assert.deepEqual(red, [15,8,18,3,6,19,27,0,15,26,18,21,5]);
const firstPlain = [15,18,5,1,18,9,23,10]; // SECUENDI, C/K rune may be Q
const secondPlain = [4,24,16,10,3]; // RATIO
const firstCipher = red.slice(0, 8).reverse(), secondCipher = red.slice(8);
const key4 = firstCipher.slice(0, 4).map((v, i) => mod(v - firstPlain[i]));
const key3 = secondCipher.slice(0, 3).map((v, i) => mod(v - secondPlain[i]));
assert.deepEqual(key4, [14,9,14,5]);
assert.deepEqual(key3, [11,2,2]);
const decode = (c, k) => c.map((v, i) => mod(v - k[i % k.length]));
const encode = (p, k) => p.map((v, i) => mod(v + k[i % k.length]));
assert.deepEqual(decode(firstCipher, key4), firstPlain);
assert.deepEqual(decode(secondCipher, key3), secondPlain);
assert.deepEqual(encode(firstPlain, key4), firstCipher);
assert.deepEqual(encode(secondPlain, key3), secondCipher);
const translit = p => p.map(i => corpus.translit[i]).join('');
assert.equal(translit(firstPlain) + ' ' + translit(secondPlain), 'SECUENDI RATIO');

/**
 * Each candidate rectangle reads X-N-X-C clockwise starting upper-left.
 * Opposite X corners must be equidistant from opening J(13,12).
 * A candidate straight ray starts at the opening J, passes through R,
 * and ends at TH; every valid step length and all eight directions count.
 * @param {number[]} symbols 729 rune indices.
 * @param {boolean} includeCoordinates
 */
function countGeometries(symbols, includeCoordinates = false) {
  const xPositions = [];
  for (let i = 0; i < symbols.length; i++)
    if (symbols[i] === 14) xPositions.push(i);
  const anchorR = anchor[0] - 1, anchorC = anchor[1] - 1;
  let rectangles = 0, triples = 0;
  const rectangleLocations = [], tripleLocations = [];
  for (let i = 0; i < xPositions.length; i++) {
    const ai = xPositions[i], r1 = Math.floor(ai / 27), c1 = ai % 27;
    for (let j = i + 1; j < xPositions.length; j++) {
      const bi = xPositions[j], r2 = Math.floor(bi / 27), c2 = bi % 27;
      if (r1 >= r2 || c1 >= c2) continue;
      if ((r1 - anchorR) ** 2 + (c1 - anchorC) ** 2 !==
          (r2 - anchorR) ** 2 + (c2 - anchorC) ** 2) continue;
      if (symbols[r1 * 27 + c2] !== 9 || symbols[r2 * 27 + c1] !== 5) continue;
      rectangles++;
      if (includeCoordinates) rectangleLocations.push(
        [[r1+1,c1+1],[r1+1,c2+1],[r2+1,c2+1],[r2+1,c1+1]]);
    }
  }
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      for (let radius = 1; radius <= 13; radius++) {
        const mr = anchorR + radius * dr, mc = anchorC + radius * dc;
        const er = anchorR + 2 * radius * dr, ec = anchorC + 2 * radius * dc;
        if (mr < 0 || mr > 26 || mc < 0 || mc > 26 ||
            er < 0 || er > 26 || ec < 0 || ec > 26) break;
        if (symbols[mr * 27 + mc] !== 4 || symbols[er * 27 + ec] !== 2) continue;
        triples++;
        if (includeCoordinates) tripleLocations.push(
          [anchor,[mr+1,mc+1],[er+1,ec+1]]);
      }
    }
  return {rectangles, triples,
    ...(includeCoordinates ? {rectangleLocations, tripleLocations} : {})};
}

/** @param {number} seed */
function rng(seed) {
  let x = seed >>> 0;
  return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return x >>> 0; };
}
const original = countGeometries(grid, true);
assert.equal(original.rectangles, 1);
assert.equal(original.triples, 1);
assert.deepEqual(original.rectangleLocations[0],
  [[6,3],[6,9],[24,9],[24,3]]);
assert.deepEqual(original.tripleLocations[0],
  [[13,12],[18,17],[23,22]]);
const n = process.argv[2] ? Number(process.argv[2]) : 100000;
assert.ok(Number.isSafeInteger(n) && n >= 1 && n <= 1000000);
const movable = [];
for (let i = 13; i < grid.length; i++)
  if (i !== anchorIndex) movable.push(i);
assert.equal(movable.length, 715);
const originalValues = movable.map(i => grid[i]);
const random = rng(0x24131329);
let rFound = 0, tFound = 0, both = 0, rSum = 0, tSum = 0;
for (let b = 0; b < n; b++) {
  const values = originalValues.slice();
  for (let j = values.length - 1; j > 0; j--) {
    const k = random() % (j + 1);
    [values[j], values[k]] = [values[k], values[j]];
  }
  const shuffled = grid.slice();
  for (let j = 0; j < movable.length; j++) shuffled[movable[j]] = values[j];
  const {rectangles, triples} = countGeometries(shuffled);
  rSum += rectangles;
  tSum += triples;
  if (rectangles) rFound++;
  if (triples) tFound++;
  if (rectangles && triples) both++;
}
const p = hits => (hits + 1) / (n + 1);
console.log(JSON.stringify({
  status: 'Published postselected candidate, not authenticated LP2 decryption',
  ciphertext: {red, firstCipher, secondCipher, key4, key3,
    candidatePlaintext: 'SECUENDI RATIO', exactReencryption: true},
  original,
  conditionalNull: {
    fixedFirst13RuneIndices: true, fixedAnchorJ: anchor, movableCells: movable.length,
    shufflePreservesComplete729RuneHistogram: true,
    seed: '0x24131329', trials: n, rectangleFound: rFound,
    tripleFound: tFound, jointFound: both,
    meanRectangleCount: rSum / n, meanTripleCount: tSum / n,
    pRectangle: p(rFound), pTriple: p(tFound), pJoint: p(both)
  },
  caveat: 'Target words, key families, anchor and geometric conditions came from a published fitted proposal. These tails are conditional, not multiplicity-adjusted discovery probabilities.'
}, null, 2));
