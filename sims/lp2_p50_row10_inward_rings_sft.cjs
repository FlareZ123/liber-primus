'use strict';

/**
 * Source-conditioned p50 row10 entry to four nested table rings.
 * Uses only published original LP2 corpus, table bytes and solved-page control.
 * The page/word address map is hypothetical, and this is NOT a plaintext decoder.
 * Run from the repository with Node.js 22.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {string} filename */
function load(filename) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', filename), 'utf8'));
}
const corpus = load('resources/liber-primus/lp2-corpus.json');
const gridSource = load('resources/liber-primus/base60-grid.json');
const grid = gridSource.byte_rows;
assert.deepEqual(grid.map(row => row.length), Array(32).fill(8));
assert.equal(grid[10][0], 142);
assert.equal(gridSource.rows[10][0], '2M');

/** @param {number} count @returns {number[]} */
function primes(count) {
  /** @type {number[]} */
  const result = [];
  for (let n = 2; result.length < count; n++) {
    let isPrime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) { isPrime = false; break; }
    }
    if (isPrime) result.push(n);
  }
  return result;
}
/** @param {string} words @returns {number[]} */
function gp(words) {
  const tokens = corpus.translit.map((token, rune) => ({ token, rune }))
    .sort((a, b) => b.token.length - a.token.length);
  /** @type {number[]} */
  const out = [];
  for (const word of words.split(' ')) {
    for (let at = 0; at < word.length;) {
      const next = tokens.find(item => word.startsWith(item.token, at));
      assert.ok(next, 'unencodable original spelling: ' + word.slice(at));
      out.push(next.rune);
      at += next.token.length;
    }
  }
  return out;
}
const cipher56 = corpus.pages[56].indices;
const solved57 = corpus.pages[57].indices;
assert.equal(cipher56.length, 85);
assert.equal(solved57.length, 95);
assert.equal(corpus.pages[55].indices.length, 76);
assert.equal(corpus.pages[50].indices.length, 0);
const shiftPrimes = primes(85);
let clock = 0;
const solved56 = cipher56.map((rune, index) => {
  if (index === 56) { assert.equal(rune, 0); return 0; }
  return ((rune - (shiftPrimes[clock++] - 1)) % 29 + 29) % 29;
});
assert.equal(clock, 84);
const expected = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
assert.deepEqual(solved56, gp(expected), 'native p56 phi(prime), literal-F solution');
const known = solved56.concat(solved57);
assert.equal(known.length, 180);

/**
 * Return one rectangular shell. The site (row10,column=depth) is on its
 * left boundary at every depth. Clockwise follows top/right/bottom/left;
 * counterclockwise reverses this order. Rotate to the same sourced site.
 * @param {number} depth
 * @param {boolean} reverse
 * @returns {[number,number][]}
 */
function ring(depth, reverse) {
  const top = depth, bottom = 31 - depth;
  const left = depth, right = 7 - depth;
  /** @type {[number,number][]} */
  const cells = [];
  for (let col = left; col <= right; col++) cells.push([top, col]);
  for (let row = top + 1; row <= bottom; row++) cells.push([row, right]);
  for (let col = right - 1; col >= left; col--) cells.push([bottom, col]);
  for (let row = bottom - 1; row > top; row--) cells.push([row, left]);
  if (reverse) cells.reverse();
  const start = cells.findIndex(([r, c]) => r === 10 && c === depth);
  assert.ok(start >= 0);
  return cells.slice(start).concat(cells.slice(0, start));
}

/**
 * Exact all-secret deterministic-codebook upper bound. Every input value
 * may have any GP29 output label, selected to maximize original agreement.
 * If the bound is less than len(output), no such function can explain input.
 * @param {number[]} inputs
 * @param {number[]} outputs
 */
function mapCapacity(inputs, outputs) {
  assert.equal(inputs.length, outputs.length);
  /** @type {Map<number, Map<number,number>>} */
  const classes = new Map();
  for (let index = 0; index < inputs.length; index++) {
    const k = inputs[index], y = outputs[index];
    const counts = classes.get(k) || new Map();
    counts.set(y, (counts.get(y) || 0) + 1);
    classes.set(k, counts);
  }
  let maxMatches = 0, conflictedClasses = 0;
  for (const counts of classes.values()) {
    maxMatches += Math.max(...counts.values());
    if (counts.size > 1) conflictedClasses++;
  }
  return {
    maxMatches,
    requiredChanges: outputs.length - maxMatches,
    conflictedClasses,
    distinctInputs: classes.size,
  };
}

const outcomes = [];
for (const reverse of [false, true]) {
  const shells = [0, 1, 2, 3].map(depth => ring(depth, reverse));
  assert.deepEqual(shells.map(shell => shell.length), [76, 68, 60, 52]);
  assert.deepEqual(shells.map(shell => shell[0]), [[10, 0], [10, 1], [10, 2], [10, 3]]);
  const cells = shells.flat();
  assert.equal(cells.length, 256);
  assert.equal(new Set(cells.map(([r, c]) => 8 * r + c)).size, 256);
  const bytes = cells.map(([r, c]) => grid[r][c]);
  const inside = bytes.slice(76), residues = inside.map(byte => byte % 29);
  assert.equal(bytes[0], 142);
  assert.deepEqual(cells[204], [10, 3]);
  const exact = residues.filter((value, i) => value === known[i]).length;
  const raw = mapCapacity(inside, known);
  const residue = mapCapacity(residues, known);
  const positive = mapCapacity(inside, residues);
  assert.equal(positive.maxMatches, 180);
  assert.equal(positive.requiredChanges, 0);
  const target = reverse
    ? { exact: 5, raw: 131, residue: 52, rawConflicts: 37 }
    : { exact: 9, raw: 133, residue: 53, rawConflicts: 36 };
  assert.equal(exact, target.exact);
  assert.equal(raw.maxMatches, target.raw);
  assert.equal(residue.maxMatches, target.residue);
  assert.equal(raw.conflictedClasses, target.rawConflicts);
  assert.equal(raw.distinctInputs, 127);
  assert.equal(residue.distinctInputs, 29);
  outcomes.push({
    direction: reverse ? 'counterclockwise' : 'clockwise',
    ringStarts: shells.map(s => s[0]),
    ringLengths: shells.map(s => s.length),
    knownNativeGP: known.length,
    directByteModulo29Matches: exact,
    bestAnySecretRawByteToGP: raw,
    bestAnySecretResidue29ToGP: residue,
    positiveSecretRawByteToGP: positive,
  });
}
console.log(JSON.stringify({
  model: '2014/2016 conditional address-to-p50:w0, radial inward ring starts',
  sourceRow10Col0: { token: '2M', base60Byte: 142, onOuterPerimeter: true },
  pageControls: { p55Unknown: 76, p56Solved: 85, p57Solved: 95 },
  outcomes,
  interpretation: 'conditional static-codebook exclusions only, not recovered plaintext',
}, null, 2));
