'use strict';
/**
 * Original LP2 p3-p8, frozen p7-GF4/p50-radix59 correction:
 * exact obstruction to a direct 29-state associative commutative
 * word accumulator, even with an arbitrary secret output permutation
 * separately for each word length.
 *
 * Windows 11 / Node.js 22 SFT:
 * node sims/lp2_scroll255_commutative_accumulator_obstruction_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const base = path.join(__dirname, '..', 'resources', 'liber-primus');
const read = name => fs.readFileSync(path.join(base, name), 'utf8');
const corpus = JSON.parse(read('lp2-corpus.json'));
const grid = JSON.parse(read('lp2-grid-256.json'));
const ink = JSON.parse(read('lp2-ink-annotations.json'));
const transcription = read('lp2-transcription.txt').split('%');
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const mod = x => (x % 29 + 29) % 29;
const bag = w => [...w].sort((a, b) => a - b).join(',');

const words = [];
let pending = [];
for (let page = 3; page <= 7; page++) {
  for (const char of transcription[page]) {
    if (runeIndex.has(char)) pending.push(runeIndex.get(char));
    else if ((char === '-' || char === '.') && pending.length) {
      words.push(pending);
      pending = [];
    }
  }
}
if (pending.length) words.push(pending);
assert.equal(words.length, 255);
assert.deepEqual(words.flat(), corpus.pages.slice(3, 8).flatMap(p => p.indices));
const cipher = corpus.pages[8].indices;
assert.equal(cipher.length, 255);

const redFive = [
  [23, 3], [22, 16, 2, 25], [5, 7, 11], [14, 28], [6, 28, 19]
];
assert.deepEqual(corpus.pages[7].indices.slice(194), redFive.flat());
const products = redFive.map(w => w.reduce((acc, v) => mod(acc * v), 1));
assert.deepEqual(products, [11, 26, 8, 15, 2]);

function gf4mul(a, b) {
  let v = 0;
  for (let bit = 0; bit < 2; bit++) {
    if ((b >>> bit) & 1) v ^= a;
    a <<= 1;
    if (a & 4) a ^= 7;
  }
  return v;
}
const state = [products[4] % 4, 0, 0, 0];
const addresses = [];
for (let i = 0; i < 255; i++) {
  addresses.push(state.reduce((acc, digit) => 4 * acc + digit, 0));
  let feedback = 0;
  for (let j = 0; j < 4; j++) feedback ^= gf4mul(state[j], products[j] % 4);
  state.splice(0, 4, state[1], state[2], state[3], feedback);
}
assert.equal(new Set(addresses).size, 255);
assert.deepEqual(addresses.slice(0, 8), [128, 1, 7, 30, 123, 236, 177, 199]);
const digits = grid.alphabet.replace('f', '');
const tokens = grid.pages.flatMap(p => p.tokens);
assert.equal(tokens.length, 256);
const table = tokens.map(t => 59 * digits.indexOf(t[0]) + digits.indexOf(t[1]));
assert(table.every(v => v >= 0 && v <= 251));
const corrected = cipher.map((value, i) => mod(value + table[addresses[i]]));
const fourPairs = [[47, 240], [48, 231], [235, 236], [88, 179]];
assert.deepEqual(fourPairs.map(([i, j]) => [corrected[i], corrected[j]]),
  [[20, 20], [8, 8], [2, 2], [9, 9]]);

const byBag = new Map(words.map((w, i) => [bag(w), i]));
assert.equal(byBag.size, 251);
/**
 * If equal-length words have equal emitted values under an injective
 * length-specific output code, their internal accumulator states coincide.
 * Adding the same symbol must then keep the states and their outputs equal.
 * The test requires only observed source words and one-rune extensions.
 */
function witnessList(outputs) {
  const witnesses = [];
  for (let i = 0; i < words.length; i++) {
    for (let j = i + 1; j < words.length; j++) {
      if (words[i].length !== words[j].length || outputs[i] !== outputs[j]) continue;
      for (let r = 0; r < 29; r++) {
        const left = byBag.get(bag([...words[i], r]));
        const right = byBag.get(bag([...words[j], r]));
        if (left === undefined || right === undefined) continue;
        if (outputs[left] !== outputs[right]) {
          witnesses.push({ base: [i, j], addedRune: r,
            extension: [left, right],
            values: [outputs[i], outputs[j], outputs[left], outputs[right]] });
        }
      }
    }
  }
  return witnesses;
}
const witnesses = witnessList(corrected);
assert.deepEqual(witnesses, [
  { base: [54, 235], addedRune: 5, extension: [74, 105], values: [2, 2, 17, 21] },
  { base: [54, 236], addedRune: 5, extension: [74, 105], values: [2, 2, 17, 21] }
]);
assert.deepEqual(words[54], [6, 28]);
assert.deepEqual(words[235], [23, 21]);
assert.deepEqual(words[236], [23, 21]);
assert.deepEqual(words[74], [5, 28, 6]);
assert.deepEqual(words[105], [5, 21, 23]);
for (const [a, b] of [[54, 74], [235, 105], [236, 105]]) {
  assert.deepEqual(bag([...words[a], 5]), bag(words[b]));
}

// Positive control: an actual commutative associative GP29 accumulator
// on the SAME 255 original words must have zero extension contradictions.
const planted = words.map(w => mod(w.reduce((s, r) => s + r, 0)));
assert.deepEqual(witnessList(planted), []);

// Independent second symbol class: a different global H collision has
// incompatible continuation by two common multiset symbols {5,10}.
assert.deepEqual([words[128], words[166], words[183], words[221]],
  [[26], [27, 20], [5, 10, 26], [20, 27, 10, 5]]);
assert.deepEqual([corrected[128], corrected[166], corrected[183], corrected[221]],
  [25, 25, 19, 8]);
// Both H=2 and H=25 require multiple distinct hidden states under a fixed
// global state-to-output map. Each of the other 27 emitted symbols requires
// its own state: any compatible global readout needs at least 31 states.
assert.equal(new Set(corrected).size, 29);

// Universal abelian-group obstruction (even with more than 29 states).
// Matrix variables: 29 input labels A, 29 output labels B, 12 true-length
// keys D, five source-page keys E, and one black/red key F.
// The 255 original word equations are integer linear relations in ANY
// abelian group G, independent of the order or decomposition of G.
const pageCuts = [];
let total = 0;
for (let p = 3; p <= 7; p++) {
  total += corpus.pages[p].indices.length;
  pageCuts.push(total);
}
const redOffsets = new Set();
let baseOffset = 0;
for (let p = 3; p <= 7; p++) {
  for (const span of ink.pages.find(x => x.page === p)?.red_spans || [])
    for (let i = 0; i < span.length; i++)
      redOffsets.add(baseOffset + span.start + i);
  baseOffset += corpus.pages[p].indices.length;
}
assert.equal(total, 1145);
assert.equal(baseOffset, total);
function wordEquations(outputs, pageClock) {
  const matrix = [];
  let cursor = 0;
  for (let i = 0; i < 255; i++) {
    const w = words[i], row = Array(76).fill(0);
    for (const rune of w) row[rune]++;
    row[29 + outputs[i]] = -1;
    row[58 + w.length - 1] = 1;
    const first = pageCuts.findIndex(x => cursor < x);
    const last = pageCuts.findIndex(x => cursor + w.length - 1 < x);
    row[70 + (pageClock === 'start' ? first : last)] = 1;
    row[75] = redOffsets.has(cursor) ? 1 : 0;
    cursor += w.length;
    matrix.push(row);
  }
  assert.equal(cursor, 1145);
  return matrix;
}
const pivotRows = [
  5, 2, 1, 8, 3, 15, 4, 16, 9, 6, 14, 0, 12, 13, 11, 7, 17,
  22, 27, 19, 20, 21, 24, 23, 26, 28, 10, 25, 18, 30, 33, 31,
  29, 38, 35, 34, 32, 44, 41, 52, 36, 40, 37, 97, 39, 46, 74,
  48, 47, 50, 53, 59, 188, 49, 55, 57, 56, 58, 61, 51, 60, 54,
  63, 67, 66, 68, 77, 83, 70, 104, 162, 206, 73
];
const pivotColumns = [...Array(68).keys(), 70, 71, 72, 73, 75];
assert.equal(pivotRows.length, 73);
assert.equal(pivotColumns.length, 73);
const alternateRows = pivotRows.slice();
alternateRows[72] = 75;
function bareissDet(matrix, indices, columns) {
  const a = indices.map(i => columns.map(j => BigInt(matrix[i][j])));
  const n = a.length;
  let divisor = 1n, sign = 1n;
  for (let k = 0; k < n - 1; k++) {
    if (a[k][k] === 0n) {
      let x = k + 1;
      while (x < n && a[x][k] === 0n) x++;
      if (x === n) return 0n;
      [a[k], a[x]] = [a[x], a[k]];
      sign = -sign;
    }
    const pivot = a[k][k];
    for (let i = k + 1; i < n; i++) {
      for (let j = k + 1; j < n; j++) {
        const numerator = a[i][j] * pivot - a[i][k] * a[k][j];
        assert.equal(numerator % divisor, 0n);
        a[i][j] = numerator / divisor;
      }
      a[i][k] = 0n;
    }
    divisor = pivot;
  }
  return sign * a[n - 1][n - 1];
}
// Three integer gauge solutions, valid over every abelian coefficient group.
const gaugeInput = Array(76).fill(0);
for (let i = 0; i < 29; i++) gaugeInput[i] = 1;
for (let len = 1; len <= 12; len++) gaugeInput[58 + len - 1] = -len;
const gaugeLength = Array(76).fill(0);
for (let y = 29; y < 58; y++) gaugeLength[y] = 1;
for (let len = 58; len < 70; len++) gaugeLength[len] = 1;
const gaugePage = Array(76).fill(0);
for (let y = 29; y < 58; y++) gaugePage[y] = 1;
for (let p = 70; p < 75; p++) gaugePage[p] = 1;
const gauges = [gaugeInput, gaugeLength, gaugePage];
// The free columns [68,69,74] of the 73-column pivot minor have gauge
// coordinates [[-11,1,0],[-12,1,0],[0,0,1]], determinant exactly +1.
assert.deepEqual([68, 69, 74].map(f => gauges.map(g => g[f])),
  [[-11, 1, 0], [-12, 1, 0], [0, 0, 1]]);
for (const mode of ['start', 'end']) {
  const matrix = wordEquations(corrected, mode);
  for (const gauge of gauges)
    for (const row of matrix)
      assert.equal(row.reduce((acc, v, i) => acc + v * gauge[i], 0), 0);
  const d1 = bareissDet(matrix, pivotRows, pivotColumns);
  const d2 = bareissDet(matrix, alternateRows, pivotColumns);
  assert.equal(d1, 45562267n);
  assert.equal(d2, 2223716n);
  assert.equal(794171n * d1 - 16271966n * d2, 1n);
  // Both selected 73x73 determinants are coprime, so these 73 columns
  // have an INTEGER left inverse. The three gauges span every assignment
  // of the remaining three coordinates, so all solutions over any abelian
  // group are gauges. Every such output label B[y] is constant.
  console.log('UNIVERSAL_ABELIAN_CERTIFICATE ' + JSON.stringify({
    originalPageClock: mode,
    equations: matrix.length, variables: 76, pivotColumns: 73,
    determinant1: d1.toString(), determinant2: d2.toString(),
    bezout: [794171, -16271966],
    freeColumns: [68, 69, 74], universalOutputLabelsMustCoincide: true
  }));
}
// Native positive control: source-word GP29 sum has nonconstant output
// labels and supplies an actual solution over Z29. Consequently ALL
// rank-73 minors of its equation matrix are divisible by29.
const plantMatrix = wordEquations(planted, 'start');
const plantDet1 = bareissDet(plantMatrix, pivotRows, pivotColumns);
const plantDet2 = bareissDet(plantMatrix, alternateRows, pivotColumns);
assert.equal(plantDet1 % 29n, 0n);
assert.equal(plantDet2 % 29n, 0n);

console.log(JSON.stringify({
  sourceWords: words.length, sourceRunes: words.flat().length,
  outputRunes: corrected.length, outputDistinctSymbols: present.size,
  originalSourceAnagrams: fourPairs,
  nonAssociativeEvidence: witnesses,
  additivePositiveControl: 'PASS: zero extension contradictions',
  globalDeterministicStateLowerBound: 31,
  abelianGroupAnyCardinalityNoGo: 'CERTIFIED by two coprime rank-73 integer minors',
  conclusion: 'No direct 29-state commutative associative word accumulator with injective length-specific readout'
}, null, 2));
console.log('PASS: original corrected scroll register violates universal monoid extension congruence.');
