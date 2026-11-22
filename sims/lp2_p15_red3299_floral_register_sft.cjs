'use strict';

/**
 * One-file original-input gate for p15's red 3299 as a possible modulus
 * on the title-stripped 16-page floral-border register (physical pp40–55).
 * Run from any directory: node sims/lp2_p15_red3299_floral_register_sft.cjs
 * Pure, deterministic analysis; no external dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const corpus = read('resources/liber-primus/lp2-corpus.json');
const ink = read('resources/liber-primus/lp2-ink-annotations.json');

const redStart = new Array(58).fill(0);
for (const page of ink.pages) {
  const start = (page.red_spans || []).find((span) => span.start === 0);
  if (start) redStart[page.page] = start.length;
}
assert.equal(redStart[40], 8);
assert.equal(redStart[54], 9);
assert.equal(redStart.slice(40, 56).reduce((a, b) => a + b, 0), 17);
assert.equal(corpus.pages.slice(40, 56).reduce((a, p) => a + p.runic_count, 0), 3316);
assert.equal(corpus.pages[50].runic_count, 0);

// Source-visible opening rubrics removed. In particular p53 red51 is body.
const body = corpus.pages.slice(40, 56).flatMap((p) => p.indices.slice(redStart[p.page]));
assert.equal(body.length, 3299);
assert.equal(new Set(body).size, 29);

const windows = [];
for (let first = 0; first + 16 <= 56; first += 1) {
  const pages = corpus.pages.slice(first, first + 16);
  const full = pages.reduce((a, p) => a + p.runic_count, 0);
  const titles = redStart.slice(first, first + 16).reduce((a, x) => a + x, 0);
  windows.push({ first, last: first + 15, full, titles, body: full - titles });
}
assert.deepEqual(windows.filter((w) => w.body === 3299).map((w) => w.first), [40]);


// Two author-visible red headings separate the floral pages into chapters.
// Their GP-prime sums jointly equal the totient of historical magic prime 1033.
const headingPrimeSums = [40, 54].map((page) =>
  corpus.pages[page].indices.slice(0, redStart[page])
    .reduce((sum, rune) => sum + corpus.prime[rune], 0));
assert.deepEqual(headingPrimeSums, [435, 597]);
assert.equal(headingPrimeSums[0] + headingPrimeSums[1], 1032);
assert.equal(corpus.pages.slice(40, 54).reduce((a, p) => a + p.runic_count, 0) -
  redStart[40], 3000);
assert.equal(corpus.pages.slice(54, 56).reduce((a, p) => a + p.runic_count, 0) -
  redStart[54], 299);


const indexHeadingSums = [15, 40, 54].map((page) =>
  corpus.pages[page].indices.slice(0, redStart[page])
    .reduce((sum, rune) => sum + rune, 0));
const primeHeadingSums = [15, 40, 54].map((page) =>
  corpus.pages[page].indices.slice(0, redStart[page])
    .reduce((sum, rune) => sum + corpus.prime[rune], 0));
assert.deepEqual(indexHeadingSums, [164, 116, 159]);
assert.deepEqual(primeHeadingSums, [638, 435, 597]);
assert.equal(indexHeadingSums[1] / 29, 4);
assert.equal(primeHeadingSums[1] / 29, 15);
assert.equal(primeHeadingSums[0] / 29, 22);
assert.equal(3299 % 29, 22);

// A transparent *single-heading* IID-GP baseline, not a look-elsewhere
// significance claim: P(eight random runes have both GP index and
// GP-prime sums 0 mod29). The source has multiple possible conventions.
const m = 29;
let residueProbabilities = new Float64Array(m * m);
residueProbabilities[0] = 1;
for (let t = 0; t < 8; t += 1) {
  const next = new Float64Array(m * m);
  for (let i = 0; i < m; i += 1) for (let j = 0; j < m; j += 1) {
    if (!residueProbabilities[m * i + j]) continue;
    for (let rune = 0; rune < m; rune += 1) {
      const target = m * ((i + rune) % m) + (j + corpus.prime[rune]) % m;
      next[target] += residueProbabilities[m * i + j] / m;
    }
  }
  residueProbabilities = next;
}
const dualZeroIIDProbability = residueProbabilities[0];
assert.ok(Math.abs(dualZeroIIDProbability - 0.0008913440105661737) < 1e-12);

const fibonacciDistinct = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987];
const printedSpiral = [3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222, 3152, 3038, 2838, 2472, 1820, 708, 1206, 4516];
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d += 1) if (n % d === 0) return false;
  return true;
}
const primeList = Array.from({ length: 7817 }, (_, i) => i + 1).filter(isPrime);
for (let i = 0; i < 16; i += 1) {
  assert.equal(printedSpiral[i], Math.abs(3301 - primeList[fibonacciDistinct[i]]));
}
assert.equal(primeList[173], 1033);
assert.equal(primeList[173] - 1, 1032);
const modulus = body.length;
assert.equal(printedSpiral[0], modulus);
assert.ok(isPrime(modulus));
assert.equal((modulus - 1), 2 * 17 * 97);
for (const q of [2, 17, 97]) {
  let a = 1;
  for (let i = 0; i < (modulus - 1) / q; i += 1) a = (a * 2) % modulus;
  assert.notEqual(a, 1, '2 must be a primitive root mod 3299');
}
const indexed = printedSpiral.map((x) => body[x % modulus]);
const preview = indexed.map((x) => corpus.translit[x]).join('-');
assert.equal(preview, 'A-I-B-J-EA-E-EO-Y-O-J-TH-X-U-F-TH-F');

// The 2^i read, with source position 0 explicitly retained, is reversible.
const order = [0];
let position = 1;
for (let i = 0; i < modulus - 1; i += 1) {
  order.push(position);
  position = (2 * position) % modulus;
}
assert.equal(new Set(order).size, modulus);
assert.equal(position, 1);
const permuted = order.map((i) => body[i]);
const restored = Array(modulus);
for (let i = 0; i < modulus; i += 1) restored[order[i]] = permuted[i];
assert.deepEqual(restored, body);

/** @param {number[]} x */
function adjacency(x) {
  const pair = new Int32Array(29 * 29);
  const from = new Int32Array(29);
  const to = new Int32Array(29);
  let doubles = 0;
  for (let i = 1; i < x.length; i += 1) {
    const a = x[i - 1];
    const b = x[i];
    pair[29 * a + b] += 1;
    from[a] += 1;
    to[b] += 1;
    if (a === b) doubles += 1;
  }
  const total = x.length - 1;
  let uniquePairs = 0;
  let mutualInformation = 0;
  for (let j = 0; j < pair.length; j += 1) {
    const count = pair[j];
    if (!count) continue;
    uniquePairs += 1;
    mutualInformation += (count / total) *
      Math.log((count * total) / (from[Math.floor(j / 29)] * to[j % 29]));
  }
  return { doubles, uniquePairs, mutualInformation };
}
const raw = adjacency(body);
const doubled = adjacency(permuted);
assert.equal(raw.doubles, 21);
assert.equal(doubled.doubles, 124);
assert.equal(raw.uniquePairs, 814);
assert.equal(doubled.uniquePairs, 824);

// Matched, fixed-inventory randomization. The inferential unit is the
// 3299-symbol *source* register. The 2^i permutation has one frozen key.
let state = 123456789;
function randomInt(bound) {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return Math.floor(((state >>> 0) / 4294967296) * bound);
}
const shuffled = body.slice();
const trials = 3000;
let nullMiAtLeast = 0;
let nullDoublesAtLeast = 0;
for (let t = 0; t < trials; t += 1) {
  for (let j = shuffled.length - 1; j > 0; j -= 1) {
    const k = randomInt(j + 1);
    [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
  }
  const result = adjacency(shuffled);
  if (result.mutualInformation >= doubled.mutualInformation) nullMiAtLeast += 1;
  if (result.doubles >= doubled.doubles) nullDoublesAtLeast += 1;
}

// Second independent cardinality: all 3316 floral runes = 4 * 829.
// The 145th prime, 829, is independently selected by p15's Fibonacci144+1.
// The 90th prime, 463, is independently the prime rank of red 3299.
const floral = corpus.pages.slice(40, 56).flatMap((p) => p.indices);
assert.equal(floral.length, 3316);
assert.equal(primeList[fibonacciDistinct[11]], 829);
assert.equal(primeList[fibonacciDistinct[10]], 463);
assert.equal(primeList.filter((p) => p <= 3299).length, 463);
assert.equal(floral.length, 4 * 829);
const fourPrimeWindows = windows.filter((w) => w.full === 4 * 829);
assert.deepEqual(fourPrimeWindows.map((w) => w.first), [40]);

const rows = 829;
const cols = 4;
const colFirst = Array.from({ length: floral.length }, (_, i) =>
  floral[(i % rows) * cols + Math.floor(i / rows)]);
const rowFirst = Array.from({ length: floral.length }, (_, i) =>
  floral[(i % cols) * rows + Math.floor(i / cols)]);
const restoredColumns = Array(floral.length);
const restoredRows = Array(floral.length);
for (let i = 0; i < floral.length; i += 1) {
  restoredColumns[(i % rows) * cols + Math.floor(i / rows)] = colFirst[i];
  restoredRows[(i % cols) * rows + Math.floor(i / cols)] = rowFirst[i];
}
assert.deepEqual(restoredColumns, floral);
assert.deepEqual(restoredRows, floral);
const fourBy829 = {
  raw: adjacency(floral),
  colFirst: adjacency(colFirst),
  rowFirst: adjacency(rowFirst)
};
assert.equal(fourBy829.raw.doubles, 21);
assert.equal(fourBy829.colFirst.doubles, 121);
assert.equal(fourBy829.rowFirst.doubles, 119);


// One source-motivated identity-changing stage: the verified p56 decoder
// subtracts prime totients. The highlighted red3299 is the 463rd prime.
// Freeze the clock at that prime, with all 3316 floral symbols consumed.
// Both natural four-column inversions and two cipher-layer orders are checked.
const primeWindow = [];
for (let n = 2; primeWindow.length < 462 + floral.length; n += 1) {
  if (isPrime(n)) primeWindow.push(n);
}
assert.equal(primeWindow[462], 3299);
assert.equal(primeWindow[463], 3301);
const totients = primeWindow.slice(462, 462 + floral.length)
  .map((p) => (p - 1) % 29);
function transposeFour(x, dir) {
  if (dir === 0) return x.slice();
  return Array.from({ length: x.length }, (_, i) =>
    dir === 1 ? x[(i % rows) * cols + Math.floor(i / rows)] :
      x[(i % cols) * rows + Math.floor(i / cols)]);
}
function reverseTranspose(x, dir) {
  return transposeFour(x, dir === 1 ? 2 : dir === 2 ? 1 : 0);
}
function addPad(x, sign) {
  return x.map((v, i) => (v + sign * totients[i] + 29) % 29);
}
function decodeOriginal(x, sign, dir, layer) {
  return layer === 0 ? addPad(transposeFour(x, dir), sign) :
    transposeFour(addPad(x, sign), dir);
}
function encodePlant(x, sign, dir, layer) {
  return layer === 0 ? reverseTranspose(addPad(x, -sign), dir) :
    addPad(reverseTranspose(x, dir), -sign);
}
function indexCoincidence(x) {
  const bins = new Int32Array(29);
  for (const v of x) bins[v] += 1;
  return bins.reduce((sum, n) => sum + n * (n - 1), 0) / (x.length * (x.length - 1));
}
const native = Array.from({ length: floral.length }, (_, i) =>
  corpus.pages[57].indices[i % corpus.pages[57].indices.length]);
const compound = [];
for (const dir of [0, 1, 2]) {
  for (const layer of dir === 0 ? [0] : [0, 1]) {
    for (const sign of [-1, 1]) {
      const plaintext = decodeOriginal(floral, sign, dir, layer);
      assert.deepEqual(encodePlant(plaintext, sign, dir, layer), floral);
      assert.deepEqual(decodeOriginal(encodePlant(native, sign, dir, layer),
        sign, dir, layer), native);
      compound.push({ dir, layer, sign, ioc: indexCoincidence(plaintext) });
    }
  }
}
assert.equal(compound.length, 10);
const low = Math.min(...compound.map((r) => r.ioc));
const high = Math.max(...compound.map((r) => r.ioc));
assert.ok(Math.abs(low - 0.03436039350323037) < 1e-12);
assert.ok(Math.abs(high - 0.03459309677290235) < 1e-12);


// The most literal p15 4x4-square Hill key on the source-selected
// 4x829-rune floral register. Earlier whole-LP2 tests used a different
// consumer; this uses exactly the full sixteen floral pages.
const hillPrinted = [
  [10, 3, 20, 22], [1, 22, 21, 25],
  [11, 17, 19, 7], [21, 17, 12, 22]
];
const hillInverse = [
  [19, 1, 6, 3], [11, 7, 8, 22],
  [2, 10, 15, 28], [25, 4, 1, 15]
];
for (let r = 0; r < 4; r += 1) for (let q = 0; q < 4; q += 1) {
  const value = hillPrinted[r].reduce((sum, x, k) =>
    sum + x * hillInverse[k][q], 0) % 29;
  assert.equal(value, r === q ? 1 : 0);
}
function hill(x, mat, direction) {
  assert.equal(x.length % 4, 0);
  const result = [];
  for (let i = 0; i < x.length; i += 4) {
    for (let j = 0; j < 4; j += 1) {
      let sum = 0;
      for (let k = 0; k < 4; k += 1) {
        sum += (direction === 0 ? mat[j][k] : mat[k][j]) * x[i + k];
      }
      result.push(sum % 29);
    }
  }
  return result;
}
const hillDirect = [];
for (const [key, mat, inverse] of [
  ['printed', hillPrinted, hillInverse], ['inverse', hillInverse, hillPrinted]
]) for (const direction of [0, 1]) {
  const decoded = hill(floral, mat, direction);
  assert.deepEqual(hill(decoded, inverse, direction), floral);
  const nativeCipher = hill(native, inverse, direction);
  assert.deepEqual(hill(nativeCipher, mat, direction), native);
  hillDirect.push({ key, direction, ioc: indexCoincidence(decoded) });
}
assert.equal(hillDirect.length, 4);
assert.ok(hillDirect.every((x) => x.ioc > 0.0344 && x.ioc < 0.0347));


// Red-ink-only, visually selected floral material: the p40 red8 rubric,
// the p53 red51 ending and the p54 red9 rubric. GP-prime addition is an
// authentic earlier Cicada operation. The sum matches a printed p15 cell.
const floralRedPages = [40, 53, 54];
const floralRedParts = floralRedPages.map((page) =>
  ink.pages.find((p) => p.page === page).red_spans.flatMap((span) =>
    corpus.pages[page].indices.slice(span.start, span.start + span.length)));
const floralRedPrimeSums = floralRedParts.map((runes) =>
  runes.reduce((sum, rune) => sum + corpus.prime[rune], 0));
assert.deepEqual(floralRedParts.map((x) => x.length), [8, 51, 9]);
assert.deepEqual(floralRedPrimeSums, [435, 2262, 597]);
assert.equal(floralRedPrimeSums.reduce((sum, value) => sum + value, 0), 3294);
assert.ok(printedSpiral.includes(3294));
assert.equal(3301 - 3294, 7);
assert.equal(primeList[3], 7);

// Source-stratified fixed-inventory null. Because the p15 square has
// sixteen cells, the **any-cell** probability is the apt exploratory
// postselection statistic, rather than the exact 3294 probability.
let redShuffleState = 19333885;
function redRandomInt(n) {
  redShuffleState ^= redShuffleState << 13;
  redShuffleState ^= redShuffleState >>> 17;
  redShuffleState ^= redShuffleState << 5;
  return Math.floor(((redShuffleState >>> 0) / 4294967296) * n);
}
const redTrials = 200000;
const p15Cells = new Set(printedSpiral);
let anyCellCount = 0;
let exact3294Count = 0;
let dualZero40Count = 0;
let exactTotient1033Count = 0;
let jointAllCount = 0;
for (let trial = 0; trial < redTrials; trial += 1) {
  let sum = 0;
  let p40Prime = 0;
  let p40Index = 0;
  let p54Prime = 0;
  for (let part = 0; part < 3; part += 1) {
    const source = corpus.pages[floralRedPages[part]].indices.slice();
    for (let j = 0; j < floralRedParts[part].length; j += 1) {
      const k = j + redRandomInt(source.length - j);
      [source[j], source[k]] = [source[k], source[j]];
      const v = corpus.prime[source[j]];
      sum += v;
      if (part === 0) {
        p40Prime += v;
        p40Index += source[j];
      }
      if (part === 2) p54Prime += v;
    }
  }
  const dualZero40 = (p40Prime % 29) === 0 && (p40Index % 29) === 0;
  const exactTotient1033 = p40Prime + p54Prime === 1032;
  const anyCell = p15Cells.has(sum);
  dualZero40Count += dualZero40;
  exactTotient1033Count += exactTotient1033;
  anyCellCount += anyCell;
  exact3294Count += sum === 3294;
  jointAllCount += dualZero40 && exactTotient1033 && anyCell;
}
assert.equal(anyCellCount, 2698);
assert.equal(exact3294Count, 305);
assert.equal(dualZero40Count, 212);
assert.equal(exactTotient1033Count, 151);
assert.equal(jointAllCount, 0);
const redSumExploratory = {
  redRuns: [8, 51, 9],
  sumGpPrimes: floralRedPrimeSums,
  totalGpPrime: 3294,
  exactP15SpiralCell: 3294,
  selectedPrime: 7,
  trials: redTrials,
  anyP15CellCount: anyCellCount,
  anyP15CellP: (anyCellCount + 1) / (redTrials + 1),
  exactValueCount: exact3294Count,
  exactValueP: (exact3294Count + 1) / (redTrials + 1),
  p40BothResiduesZeroCount: dualZero40Count,
  headingsExactPhi1033Count: exactTotient1033Count,
  tripleIntersectionCount: jointAllCount,
  tripleIntersectionAddOneExploratoryBound: (jointAllCount + 1) / (redTrials + 1)
};


// The reverse all-red sum selects original p15 3294 = 3301 - prime4;
// a contemporary solver knew the genuine 2014 seven-column row operation
// [0,6,2,5,1,4,3]. Test it once on this title-stripped 3299-rune scope,
// optionally combined in either layer order with genuine solved-p56
// consecutive-prime-totient GP29 at the source-selected prime4=7.
const historicalSeven = [0, 6, 2, 5, 1, 4, 3];
function rowSeven(x, inverse) {
  const y = x.slice();
  for (let base = 0; base + 7 <= x.length; base += 7) {
    for (let j = 0; j < 7; j += 1) {
      if (inverse) y[base + historicalSeven[j]] = x[base + j];
      else y[base + j] = x[base + historicalSeven[j]];
    }
  }
  return y;
}
assert.equal(rowSeven([...('TLBEIEO')], false).join(''), 'TOBELIE');
const primeSevenPad = primeWindow.slice(3, 3 + modulus)
  .map((p) => (p - 1) % 29);
assert.equal(primeWindow[3], 7);
assert.equal(primeSevenPad.length, modulus);
const padSeven = (x, sign) => x.map((value, i) =>
  (value + sign * primeSevenPad[i] + 29) % 29);
const sevenDirection = (x, dir) =>
  dir === 0 ? x.slice() : rowSeven(x, dir === 2);
const sevenInverse = (x, dir) =>
  dir === 0 ? x.slice() : rowSeven(x, dir === 1);
const sevenCompound = [];
for (const dir of [0, 1, 2]) for (const layer of [0, 1]) {
  for (const sign of [-1, 1]) {
    const decode = (x) => layer === 0 ?
      padSeven(sevenDirection(x, dir), sign) :
      sevenDirection(padSeven(x, sign), dir);
    const encode = (x) => layer === 0 ?
      sevenInverse(padSeven(x, -sign), dir) :
      padSeven(sevenInverse(x, dir), -sign);
    const result = decode(body);
    assert.deepEqual(encode(result), body);
    const nativePlant = Array.from({ length: modulus }, (_, i) =>
      corpus.pages[57].indices[i % corpus.pages[57].indices.length]);
    assert.deepEqual(decode(encode(nativePlant)), nativePlant);
    sevenCompound.push({ dir, layer, sign, ioc: indexCoincidence(result) });
  }
}
assert.equal(sevenCompound.length, 12);
assert.ok(Math.abs(Math.min(...sevenCompound.map((x) => x.ioc)) -
  0.034347472110096026) < 1e-12);
assert.ok(Math.abs(Math.max(...sevenCompound.map((x) => x.ioc)) -
  0.034535521817718254) < 1e-12);


// Source-locked candidate modular read: *two* independently printed
// values determine g=3301-3294=7, modulus=3299, and 7 generates
// every nonzero GP position modulo3299. This closes the key selection
// weakness of the previous exploratory g=2 primitive-root read.
let k7 = 1;
const powerSevenIndices = [0];
for (let i = 0; i < modulus - 1; i += 1) {
  powerSevenIndices.push(k7);
  k7 = (7 * k7) % modulus;
}
assert.equal(k7, 1);
assert.equal(new Set(powerSevenIndices).size, modulus);
const inversePowers = Array(modulus);
for (let i = 0; i < modulus; i += 1) {
  inversePowers[powerSevenIndices[i]] = i;
}
const movePower7 = (x, dir) => (dir === 1 ?
  powerSevenIndices : inversePowers).map((i) => x[i]);
const inversePower7 = (x, dir) => movePower7(x, dir === 1 ? 2 : 1);
assert.deepEqual(inversePower7(movePower7(body, 1), 1), body);
assert.deepEqual(inversePower7(movePower7(body, 2), 2), body);
const directPower7 = adjacency(movePower7(body, 1));
assert.equal(directPower7.doubles, 103);
assert.equal(directPower7.uniquePairs, 825);
assert.ok(Math.abs(directPower7.mutualInformation - 0.13068461544393015) < 1e-12);

let power7State = 193345;
function p7RandomInt(n) {
  power7State ^= power7State << 13;
  power7State ^= power7State >>> 17;
  power7State ^= power7State << 5;
  return Math.floor(((power7State >>> 0) / 4294967296) * n);
}
let power7NullAboveMI = 0;
let power7NullAboveDoubles = 0;
const perm7Null = body.slice();
const null7Trials = 5000;
for (let trial = 0; trial < null7Trials; trial += 1) {
  for (let j = perm7Null.length - 1; j > 0; j -= 1) {
    const k = p7RandomInt(j + 1);
    [perm7Null[j], perm7Null[k]] = [perm7Null[k], perm7Null[j]];
  }
  const st = adjacency(perm7Null);
  power7NullAboveMI += st.mutualInformation >= directPower7.mutualInformation;
  power7NullAboveDoubles += st.doubles >= directPower7.doubles;
}
assert.ok(Math.abs((power7NullAboveMI + 1) / (null7Trials + 1) -
  0.29094181163767247) < 1e-12);
assert.ok(Math.abs((power7NullAboveDoubles + 1) / (null7Trials + 1) -
  0.8612277544491101) < 1e-12);

const power7Compounds = [];
for (const startingPrimeRank of [4, 463]) {
  const keyStream = primeWindow.slice(startingPrimeRank - 1,
    startingPrimeRank - 1 + modulus).map((p) => (p - 1) % 29);
  assert.equal(keyStream.length, modulus);
  const addStream = (x, sign) => x.map((v, i) =>
    (v + sign * keyStream[i] + 29) % 29);
  for (const dir of [1, 2]) for (const layer of [0, 1]) {
    for (const sign of [-1, 1]) {
      const decode = (x) => layer === 0 ?
        addStream(movePower7(x, dir), sign) :
        movePower7(addStream(x, sign), dir);
      const encode = (x) => layer === 0 ?
        inversePower7(addStream(x, -sign), dir) :
        addStream(inversePower7(x, dir), -sign);
      const output = decode(body);
      assert.deepEqual(encode(output), body);
      const nativePlant = Array.from({ length: modulus }, (_, i) =>
        corpus.pages[57].indices[i % corpus.pages[57].indices.length]);
      assert.deepEqual(decode(encode(nativePlant)), nativePlant);
      power7Compounds.push({
        startingPrimeRank, direction: dir, layer, sign,
        ioc: indexCoincidence(output)
      });
    }
  }
}
assert.equal(power7Compounds.length, 16);
assert.ok(Math.abs(Math.min(...power7Compounds.map((x) => x.ioc)) -
  0.03444122123119801) < 1e-12);
assert.ok(Math.abs(Math.max(...power7Compounds.map((x) => x.ioc)) -
  0.03456493330669143) < 1e-12);


// Distinct use of the same fully source-selected modular generator as an
// additive stream: K[i] = (7^i mod3299) mod29, starting exponent0.
// The genuine solved p56 provides the modulo29 additive operator; no
// extra key, reset, skipped symbol, page phase or postselection is fitted.
let gen7State = 1;
const power7AddKey = [];
for (let i = 0; i < modulus; i += 1) {
  power7AddKey.push(gen7State % 29);
  gen7State = (7 * gen7State) % modulus;
}
assert.deepEqual(power7AddKey.slice(0, 10),
  [1, 7, 20, 24, 23, 22, 9, 4, 27, 7]);
const power7PadOutput = [-1, 1].map((sign) => {
  const decode = (x) => x.map((v, i) =>
    (v + sign * power7AddKey[i] + 29) % 29);
  const encode = (x) => x.map((v, i) =>
    (v - sign * power7AddKey[i] + 29) % 29);
  const decoded = decode(body);
  assert.deepEqual(encode(decoded), body);
  const sourceNative = Array.from({ length: modulus }, (_, i) =>
    corpus.pages[57].indices[i % corpus.pages[57].indices.length]);
  assert.deepEqual(decode(encode(sourceNative)), sourceNative);
  return { sign, ioc: indexCoincidence(decoded) };
});
assert.ok(Math.abs(power7PadOutput[0].ioc - 0.03458386695271791) < 1e-12);
assert.ok(Math.abs(power7PadOutput[1].ioc - 0.03457908758575977) < 1e-12);

console.log(JSON.stringify({
  source: 'LP2 physical p40-55; remove opening red8 at p40 and red9 at p54',
  titlelessLength: modulus,
  uniqueMatchingSixteenPageWindow: [40, 55],
  p15SpiralIndexedOffsets: printedSpiral.map((x) => x % modulus),
  indexedSixteenRunes: preview,
  prime463IsRed3299Rank: true,
  fourTimes829EqualsOriginalFloralLength: true,
  naturalFourBy829Readouts: fourBy829,
  floralRedHeadingPrimeSums: headingPrimeSums,
  floralAllRedPrimeSumAndP15CellNull: redSumExploratory,
  selectedHistoricalSevenRowPrimeTotient: sevenCompound,
  power7AdditiveStream: power7PadOutput,
  sourceSelectedPower7Mod3299: {
    direct: directPower7,
    miNullUpperTail: (power7NullAboveMI + 1) / (null7Trials + 1),
    doubletNullUpperTail: (power7NullAboveDoubles + 1) / (null7Trials + 1),
    compounds: power7Compounds
  },
  historicalPrime1033Totient: 1032,
  p15P40P54HeadingIndexSums: indexHeadingSums,
  p15P40P54HeadingPrimeSums: primeHeadingSums,
  p40BothSumsZeroMod29IIDProbability: dualZeroIIDProbability,
  nativeFloralChapterBodyLengths: [3000, 299],
  p15PrintedFourSquareHillOnFourBy829: hillDirect,
  p463PrimeTotientAndFourColumnInverses: compound,
  sourceP57SolvedIoC: indexCoincidence(corpus.pages[57].indices),
  primitiveRoot: 2,
  sourceOrder: raw,
  doubledOrder: doubled,
  nullTrials: trials,
  upperTailMi: (nullMiAtLeast + 1) / (trials + 1),
  upperTailDoublets: (nullDoublesAtLeast + 1) / (trials + 1),
  conclusion: 'No plaintext; selected direct index read nonlinguistic and 2-power order ordinary under inventory-matched null.'
}, null, 2));
