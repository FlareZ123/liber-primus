'use strict';

/**
 * Original-source SFT for the public November-2026 LP2 27x27 route.
 * Audits the 38 published MAIN ciphertext readings, and enumerates all
 * geometrically eligible three-rune nodes under the public phi/Mobius decoder.
 * Only finite geometry and two-rune ambiguity are evaluated. This does not
 * assert an unknown-page plaintext or a historical encryption key.
 *
 * Run: node sims/lp2_public27_shortblock_ambiguity_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..',
  'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const pages = data.pages.filter((page) => page.page <= 2);
assert.deepEqual(pages.map((page) => page.indices.length), [262, 266, 201]);
const matrix = pages.flatMap((page) => page.indices);
assert.equal(matrix.length, 729);

/** @param {number} r Zero-based row @param {number} c Zero-based column */
function at(r, c) { return matrix[r * 27 + c]; }

/** @param {number} n Positive integer @returns {number} */
function phi(n) {
  assert.ok(Number.isInteger(n) && n > 0);
  let result = n, factor = 2, rest = n;
  while (factor * factor <= rest) {
    if (rest % factor === 0) {
      result -= result / factor;
      while (rest % factor === 0) rest /= factor;
    }
    factor++;
  }
  if (rest > 1) result -= result / rest;
  return result;
}

/** @param {number} n Positive integer @returns {-1|0|1} */
function mu(n) {
  assert.ok(Number.isInteger(n) && n > 0);
  let factors = 0, rest = n;
  for (let p = 2; p * p <= rest; p++) {
    if (rest % p !== 0) continue;
    rest /= p;
    factors++;
    if (rest % p === 0) return 0;
    while (rest % p === 0) rest /= p;
  }
  if (rest > 1) factors++;
  return factors % 2 === 0 ? 1 : -1;
}

/**
 * Exact coordinates and proposed outputs in 38 public Markdown walkthroughs,
 * ordered MAIN routes only; exclude optional alternative SOON in block 16.
 * Each row contains block number and one-based (r,c,plaintext-rune) readings.
 * The published cipher/math rows are linked in the accompanying source audit.
 */
const publicMainRoute = `
01|13:25:A,13:26:S,13:27:I,14:1:G,14:2:O,14:3:TH,14:4:E
02|14:14:W,14:15:EA,14:16:TH,14:17:E,14:18:R
03|14:19:T,13:19:U,12:19:R,11:19:N,10:19:S
04|14:7:C,13:7:O,12:7:L,11:7:D
05|26:19:I,26:18:M,26:17:A,26:16:Y
06|19:16:C,18:16:R,17:16:Y
07|11:16:N,12:17:O,13:18:W,14:19:TH,15:20:E
08|15:20:I,16:19:D,17:18:EA
09|18:15:O,18:16:F
10|19:17:TH,19:16:E
11|19:23:E,20:23:N,21:23:D
12|21:9:I,21:10:S
13|26:3:D,26:2:EA,26:1:TH
14|25:16:S,26:15:E,27:14:E
15|27:18:Y,26:17:O,25:16:U
16|25:16:S,25:17:O,25:18:O,25:19:N
17|25:25:TH,25:26:E,25:27:N
18|22:21:TH,21:20:E
19|21:4:C/K,20:4:E,19:4:Y
20|18:7:I,19:6:S
21|9:16:T,8:17:O
22|9:20:G,9:21:O
23|12:23:T,12:22:O
24|9:19:TH,9:18:E
25|14:24:EA,15:23:S,16:22:T
26|6:12:O,7:13:F
27|20:12:TH,20:13:E
28|19:11:M,18:12:A,17:13:P,16:14:L,15:15:I,14:16:F,13:17:E
29|18:11:M,18:12:A,18:13:Y
30|25:12:B,26:11:E
31|11:11:TH,11:12:E
32|10:10:D,11:9:EA,12:8:TH
33|12:18:O,12:17:F
34|6:11:Y,6:12:O,6:13:U
35|7:2:G,8:1:O
36|27:1:D,27:2:O
37|22:2:A,22:1:S
38|5:17:I,6:17:A,7:17:S,8:17:C/K
`.trim();

const byCell = new Map();
let readCount = 0;
const lines = publicMainRoute.split('\n');
assert.equal(lines.length, 38);
for (const line of lines) {
  const [blockText, entries] = line.split('|');
  const block = Number(blockText);
  for (const entry of entries.split(',')) {
    const [rText, cText, plain] = entry.split(':');
    const r = Number(rText), c = Number(cText);
    assert.ok(Number.isInteger(r) && r >= 1 && r <= 27);
    assert.ok(Number.isInteger(c) && c >= 1 && c <= 27);
    assert.ok(plain.length > 0);
    const id = 27 * (r - 1) + c - 1;
    const v = byCell.get(id) || [];
    v.push({block, plain});
    byCell.set(id, v);
    readCount++;
  }
}
const reused = [...byCell.entries()].filter(([, assignments]) => assignments.length > 1);
const conflicts = reused.filter(([, assignments]) =>
  new Set(assignments.map((assignment) => assignment.plain)).size > 1);
assert.equal(readCount, 115);
assert.equal(byCell.size, 103);
assert.equal(reused.length, 11);
assert.equal(readCount - byCell.size, 12);
assert.equal(conflicts.length, 9);
const conflictCoords = conflicts.map(([id]) =>
  String(Math.floor(id / 27) + 1) + ':' + String(id % 27 + 1)).sort();
assert.deepEqual(conflictCoords, [
  '12:17', '14:16', '14:19', '15:20', '18:16',
  '19:16', '25:16', '26:17', '8:17'
].sort());

/** Count keys by their first two aligned GP29 indices. */
const prefixCounts = new Int32Array(29 * 29);
let geometricNodes = 0, nodeModes = 0;
const axes = [[0, 1], [1, 0], [1, 1], [1, -1]];
for (let r = 0; r < 27; r++) for (let c = 0; c < 27; c++) {
  for (const [dr, dc] of axes) for (let h = 1; h <= 13; h++) {
    const r1 = r - dr * h, c1 = c - dc * h;
    const r3 = r + dr * h, c3 = c + dc * h;
    if (Math.min(r1, c1, r3, c3) < 0 ||
        Math.max(r1, c1, r3, c3) >= 27) continue;
    const original = [at(r1, c1), at(r, c), at(r3, c3)];
    if (original.includes(0)) continue; // documented phi/Mobius demands 1..28
    geometricNodes++;
    for (const centerTransformed of [false, true]) {
      const key = original.slice();
      if (centerTransformed) key[1] = phi(key[1]);
      const phase = ((key.reduce((sum, v) => sum + mu(phi(v)), 0) % 3) + 3) % 3;
      const aligned = key.slice(phase).concat(key.slice(0, phase));
      prefixCounts[29 * aligned[0] + aligned[1]]++;
      nodeModes++;
    }
  }
}
assert.equal(geometricNodes, 13012);
assert.equal(nodeModes, 26024);
assert.equal(prefixCounts.filter((v) => v !== 0).length, 784);
for (let a = 1; a < 29; a++) for (let b = 1; b < 29; b++) {
  assert.ok(prefixCounts[a * 29 + b] > 0);
}

/** All 8 directed immediate-neighbor readings in the 27x27 source matrix. */
const neighborPairs = [];
for (let r = 0; r < 27; r++) for (let c = 0; c < 27; c++) {
  for (const [dr, dc] of [...axes, ...axes.map(([x, y]) => [-x, -y])]) {
    const rr = r + dr, cc = c + dc;
    if (rr < 0 || rr >= 27 || cc < 0 || cc >= 27) continue;
    neighborPairs.push([at(r, c), at(rr, cc)]);
  }
}
assert.equal(neighborPairs.length, 5512);

/**
 * @param {number} first Hypothetical plaintext GP29 index
 * @param {number} second Hypothetical plaintext GP29 index
 */
function candidates(first, second) {
  let paths = 0, keyNodePaths = 0;
  for (const [c0, c1] of neighborPairs) {
    const a = (c0 - first + 29) % 29, b = (c1 - second + 29) % 29;
    const ways = prefixCounts[a * 29 + b];
    if (ways) { paths++; keyNodePaths += ways; }
  }
  return {paths, keyNodePaths};
}
let min = Infinity, max = -Infinity;
for (let a = 0; a < 29; a++) for (let b = 0; b < 29; b++) {
  const {paths} = candidates(a, b);
  min = Math.min(min, paths);
  max = Math.max(max, paths);
}
assert.deepEqual([min, max], [5004, 5248]);
assert.deepEqual(candidates(2, 18), {paths: 5114, keyNodePaths: 169308});
assert.deepEqual(candidates(3, 0), {paths: 5108, keyNodePaths: 177070});
assert.deepEqual(candidates(16, 3), {paths: 5190, keyNodePaths: 173320});

const claimedThe = [at(18, 16), at(18, 15)];
const k0 = (claimedThe[0] - 2 + 29) % 29;
const k1 = (claimedThe[1] - 18 + 29) % 29;
assert.deepEqual([k0, k1], [22, 22]);
assert.equal(prefixCounts[22 * 29 + 22], 22);

console.log(JSON.stringify({
  sourceGrid: 'LP2 p0-2: 27x27, 729 original indices',
  publicMainRoute: {blocks: 38, runeReadings: readCount, uniqueCells: byCell.size,
    repeatedCells: reused.length, excessReadings: readCount - byCell.size,
    conflictingPlaintextCells: conflicts.length, conflictingCellCoordinates: conflictCoords},
  threeRuneNodes: {geometricNodes, centerModeVariants: nodeModes,
    reachablePositiveKeyPrefixes: 784, totalPositiveKeyPrefixes: 784},
  twoRuneInverse: {directedNeighborPaths: neighborPairs.length,
    testedPlaintextPairs: 841, minMatchingPaths: min, maxMatchingPaths: max,
    exampleTHE: candidates(2, 18), publishedTHEAlternativeNodes: 22}
}, null, 2));
console.log('PASS: exhaustive original-source short-block ambiguity and public route cell reuse.');
