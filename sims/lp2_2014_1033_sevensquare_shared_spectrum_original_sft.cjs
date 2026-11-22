'use strict';
/**
 * Source-exact Stage10 1033-square spectral-transfer test against two intact LP2
 * seven-rune-aligned chapters. Windows 11, Node.js 22, built-ins only.
 * This is a cipher *hypothesis* test. It cannot certify author intent.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const FIELD = 29;

/** @param {number} x @returns {number} */
const m29 = (x) => ((x % FIELD) + FIELD) % FIELD;

/** @param {number} a @returns {number} */
function inverse(a) {
  const v = m29(a);
  assert.notEqual(v, 0, 'singular scalar');
  for (let i = 1; i < FIELD; i += 1) {
    if (v * i % FIELD === 1) return i;
  }
  throw new Error('not invertible');
}

/** @param {number} n @returns {number[][]} */
const identity = (n) =>
  Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => +(i === j)));

/** @param {number[][]} a @param {number[][]} b @returns {number[][]} */
function multiply(a, b) {
  assert.equal(a[0].length, b.length);
  return a.map((row) => b[0].map((_, j) =>
    m29(row.reduce((sum, value, k) => sum + value * b[k][j], 0))));
}

/** @param {number[][]} matrix @param {number[]} vector @returns {number[]} */
function apply(matrix, vector) {
  return matrix.map((row) =>
    m29(row.reduce((sum, x, j) => sum + x * vector[j], 0)));
}

/** @param {number[][]} matrix @param {number} scale @returns {number[][]} */
function addDiagonal(matrix, scale) {
  return matrix.map((row, i) => row.map((v, j) =>
    m29(v + (i === j ? scale : 0))));
}

/** @param {number[][]} a @returns {number[]} */
function characteristic(a) {
  const n = a.length;
  let running = identity(n);
  const coefficients = [1];
  for (let k = 1; k <= n; k += 1) {
    const next = multiply(a, running);
    const trace = next.reduce((sum, row, j) => sum + row[j], 0);
    const coefficient = m29(-trace * inverse(k));
    coefficients.push(coefficient);
    running = addDiagonal(next, coefficient);
  }
  return coefficients;
}

/** @param {number[]} a @param {number[]} b @returns {number[]} */
function polynomialMultiply(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i += 1) {
    for (let j = 0; j < b.length; j += 1) {
      out[i + j] = m29(out[i + j] + a[i] * b[j]);
    }
  }
  return out;
}

/** @param {number[]} polynomial @param {number[][]} a @returns {number[][]} */
function polynomialAtMatrix(polynomial, a) {
  const n = a.length;
  let value = Array.from({ length: n }, () => Array(n).fill(0));
  for (const coefficient of polynomial) {
    value = addDiagonal(multiply(value, a), coefficient);
  }
  return value;
}

/** @param {number[][]} matrix @returns {number[][]} */
function nullspace(matrix) {
  const a = matrix.map((r) => r.map(m29));
  const height = a.length;
  const width = a[0].length;
  const pivots = [];
  let rank = 0;
  for (let col = 0; col < width && rank < height; col += 1) {
    const row = a.findIndex((v, i) => i >= rank && v[col] !== 0);
    if (row < 0) continue;
    [a[rank], a[row]] = [a[row], a[rank]];
    const factor = inverse(a[rank][col]);
    a[rank] = a[rank].map((v) => m29(v * factor));
    for (let i = 0; i < height; i += 1) {
      if (i === rank) continue;
      const value = a[i][col];
      a[i] = a[i].map((v, j) => m29(v - value * a[rank][j]));
    }
    pivots.push(col);
    rank += 1;
  }
  const free = Array.from({ length: width }, (_, i) => i)
    .filter((i) => !pivots.includes(i));
  return free.map((col) => {
    const v = Array(width).fill(0);
    v[col] = 1;
    for (let i = 0; i < pivots.length; i += 1) {
      v[pivots[i]] = m29(-a[i][col]);
    }
    return v;
  });
}

/** @param {number[]} v @returns {number[]} */
function normalized(v) {
  const first = v.find((x) => x !== 0);
  assert.notEqual(first, undefined);
  return v.map((x) => m29(x * inverse(first)));
}

/** @param {number[][]} input @returns {number[][]} */
function matrixInverse(input) {
  const n = input.length;
  const a = input.map((row, i) => [...row, ...identity(n)[i]]);
  for (let j = 0; j < n; j += 1) {
    const pivot = a.findIndex((row, i) => i >= j && row[j] !== 0);
    assert.notEqual(pivot, -1, 'singular transfer matrix');
    [a[j], a[pivot]] = [a[pivot], a[j]];
    const scale = inverse(a[j][j]);
    a[j] = a[j].map((v) => m29(v * scale));
    for (let i = 0; i < n; i += 1) {
      if (i === j) continue;
      const factor = a[i][j];
      a[i] = a[i].map((v, k) => m29(v - factor * a[j][k]));
    }
  }
  return a.map((row) => row.slice(n));
}

/** @param {string} contents @returns {number[][][]} */
function readStage10(contents) {
  const blocks = contents.trim().split(/\r?\n\s*\r?\n/);
  assert.equal(blocks.length, 3, 'three historical squares');
  const matrices = blocks.map((block) =>
    block.trim().split(/\r?\n/).map((line) =>
      line.trim().split(/\s+/).map(Number)));
  assert.deepEqual(matrices.map((m) => m.length), [5, 7, 5]);
  for (const [j, m] of matrices.entries()) {
    const total = j === 0 ? 3301 : 1033;
    for (const row of m) {
      assert.equal(row.length, m.length);
      assert.equal(row.reduce((s, v) => s + v, 0), total);
    }
  }
  return matrices.map((m) => m.map((row) => row.map(m29)));
}

/**
 * Canonical source-only change of basis:
 * linear eigenspaces in the authentic 5-square CHANGE-root order H,A,E;
 * then the two irreducible quadratic nullspaces, sorted as written.
 * Each vector is the first RREF free-column null vector, normalized so its
 * first nonzero component is 1. A quadratic's second vector is M times it.
 * @param {number[][]} seven @returns {number[][]}
 */
function spectralBasis(seven) {
  const columns = [];
  for (const eigenvalue of [8, 24, 18]) {
    const root = nullspace(addDiagonal(seven, -eigenvalue));
    assert.equal(root.length, 1);
    columns.push(normalized(root[0]));
  }
  for (const quadratic of [[1, -5, -13], [1, 8, 8]]) {
    const kernel = nullspace(polynomialAtMatrix(quadratic, seven));
    assert.equal(kernel.length, 2);
    const v = normalized(kernel[0]);
    columns.push(v, apply(seven, v));
  }
  return Array.from({ length: 7 }, (_, i) => columns.map((v) => v[i]));
}

/** @param {number[]} text @param {number[][]} key @returns {number[]} */
function transform(text, key) {
  assert.equal(text.length % 7, 0);
  const output = [];
  for (let i = 0; i < text.length; i += 7) {
    output.push(...apply(key, text.slice(i, i + 7)));
  }
  return output;
}

/** @param {number[]} data @returns {number} */
function ioc(data) {
  const histogram = Array(FIELD).fill(0);
  for (const rune of data) {
    assert.ok(Number.isInteger(rune) && rune >= 0 && rune < 29);
    histogram[rune] += 1;
  }
  return histogram.reduce((sum, n) => sum + n * (n - 1), 0) /
    (data.length * (data.length - 1));
}

/** @param {number} actual @param {number} expected @returns {void} */
function close(actual, expected) {
  assert.ok(Math.abs(actual - expected) < 1e-12,
    'original IoC mismatch: ' + actual + ' versus ' + expected);
}

const historical = fs.readFileSync(
  path.join(ROOT, 'resources', 'cicada2014-openpuff-magic-squares.txt'), 'utf8');
const [first3301, seven1033, five1033] = readStage10(historical);
assert.equal(first3301.length, 5);
const roots5 = [5, 8, 24, 21, 18];
const factors5 = roots5.reduce(
  (poly, root) => polynomialMultiply(poly, [1, m29(-root)]), [1]);
assert.deepEqual(characteristic(five1033), factors5);
const factors7 = [
  [1, -8], [1, -24], [1, -18],
  [1, -5, -13], [1, 8, 8]
];
const expected7 = factors7.reduce(
  (poly, factor) => polynomialMultiply(poly, factor), [1]);
assert.deepEqual(characteristic(seven1033), expected7);
assert.deepEqual(expected7, [1, 11, 22, 26, 13, 16, 18, 27]);
const S = spectralBasis(seven1033);
const Sinverse = matrixInverse(S);
assert.deepEqual(multiply(S, Sinverse), identity(7));
assert.deepEqual(multiply(Sinverse, S), identity(7));
assert.deepEqual(
  multiply(multiply(Sinverse, seven1033), S),
  [[8, 0, 0, 0, 0, 0, 0],
   [0, 24, 0, 0, 0, 0, 0],
   [0, 0, 18, 0, 0, 0, 0],
   [0, 0, 0, 0, 13, 0, 0],
   [0, 0, 0, 1, 5, 0, 0],
   [0, 0, 0, 0, 0, 0, 21],
   [0, 0, 0, 0, 0, 1, 21]]);
console.log('SPECTRAL_COMMON roots_1033 [8,24,18] extra_unforced [8,24]');

const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const byPage = new Map(corpus.pages.map((p) => [p.page, p.indices]));
/** @param {number} first @param {number} last @returns {number[]} */
const concatenate = (first, last) =>
  Array.from({ length: last - first + 1 }, (_, i) => byPage.get(first + i))
    .flat();
const solved = byPage.get(57);
assert.equal(solved.length, 95);
for (const [first, last, length, rawExpected, sExpected, inverseExpected] of [
  [8, 14, 1729, 0.03446048347364137, 0.034287106655527706,
    0.0343533781033781],
  [33, 39, 1680, 0.03436002155478034, 0.03450041124251964,
    0.034257210924870246]
]) {
  const source = concatenate(first, last);
  assert.equal(source.length, length);
  const fromPhysical = transform(source, S);
  const fromEigen = transform(source, Sinverse);
  close(ioc(source), rawExpected);
  close(ioc(fromPhysical), sExpected);
  close(ioc(fromEigen), inverseExpected);
  assert.deepEqual(transform(fromPhysical, Sinverse), source);
  assert.deepEqual(transform(fromEigen, S), source);

  const positive = Array.from({ length }, (_, j) => solved[j % solved.length]);
  assert.deepEqual(transform(transform(positive, S), Sinverse), positive);
  assert.deepEqual(transform(transform(positive, Sinverse), S), positive);
  assert.ok(ioc(positive) > 0.05);
  const stats = [ioc(source), ioc(fromPhysical), ioc(fromEigen)]
    .map((x) => x.toFixed(9));
  console.log('SOURCE p' + first + '-p' + last +
    ' n=' + length + ' IoC raw/S/Sinv=' + stats.join('/'));
  console.log('SOURCE_FIRST_28_S ' + fromPhysical.slice(0, 28).join(','));
  console.log('SOURCE_FIRST_28_SINV ' + fromEigen.slice(0, 28).join(','));
}

/**
 * Authenticated key-transfer receiver: source 256-cell grid / (H*G)
 * yields exactly 252 GP29 coefficients = three 84-rune lanes.
 * The authentic solved p56 uses 84 consumed prime-totient GP29 keys.
 * Allow both original three-lane serializations and either 7×7 basis.
 * Equality-pattern disagreements are key-independent for *all* 29!
 * possible secret fixed GP29 output alphabet permutations.
 */
const grid = JSON.parse(fs.readFileSync(path.join(
  ROOT, 'resources', 'liber-primus', 'base60-grid.json'), 'utf8'));
assert.equal(grid.rows.length, 32);
assert.ok(grid.rows.every((row) => row.length === 8));
const bytes = grid.rows.flat().map((token) => {
  assert.equal(token.length, 2);
  const high = grid.alphabet.indexOf(token[0]);
  const low = grid.alphabet.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  const value = 60 * high + low;
  assert.ok(value >= 0 && value <= 255);
  return value;
});
const divisor = polynomialMultiply(
  [24, 26, 3], [15, 5, 27]);
assert.deepEqual(divisor, [12, 17, 11, 21, 23]);
const remainder = bytes.map(m29);
const quotient = [];
for (let i = 0; i < 252; i += 1) {
  const coefficient = m29(remainder[i] * inverse(divisor[0]));
  quotient.push(coefficient);
  for (let j = 0; j < divisor.length; j += 1) {
    remainder[i + j] = m29(remainder[i + j] - coefficient * divisor[j]);
  }
}
assert.deepEqual(remainder.slice(252), [0, 0, 0, 0]);
assert.deepEqual(quotient.slice(0, 10), [0, 12, 9, 28, 2, 25, 23, 21, 18, 28]);

/** @param {number} n @returns {boolean} */
const isPrime = (n) => {
  if (n < 2) return false;
  for (let divisor = 2; divisor * divisor <= n; divisor += 1) {
    if (n % divisor === 0) return false;
  }
  return true;
};
const primes = [];
for (let n = 2; primes.length < 84; n += 1) {
  if (isPrime(n)) primes.push(n);
}
const trueP56Key = primes.map((prime) => m29(prime - 1));
assert.deepEqual(trueP56Key.slice(0, 10), [1, 2, 4, 6, 10, 12, 16, 18, 22, 28]);
assert.equal(byPage.get(56).length, 85);
assert.equal(byPage.get(56)[56], 0, 'actual one literal skipped F rune');

function equalityDisagreements(source, target) {
  assert.equal(source.length, target.length);
  let disagreement = 0;
  for (let i = 0; i < source.length; i += 1) {
    for (let j = i + 1; j < source.length; j += 1) {
      disagreement += +( (source[i] === source[j]) !==
                          (target[i] === target[j]) );
    }
  }
  return disagreement;
}
assert.equal(equalityDisagreements(
  trueP56Key.map((v) => m29(7 * v + 3)), trueP56Key), 0);
assert.deepEqual(transform(transform(trueP56Key, S), Sinverse), trueP56Key);
assert.equal(equalityDisagreements(
  transform(transform(trueP56Key, S), Sinverse), trueP56Key), 0);

const sourceTransfer = [];
for (const layout of ['contiguous', 'interleaved']) {
  for (let lane = 0; lane < 3; lane += 1) {
    const raw = layout === 'contiguous'
      ? quotient.slice(lane * 84, (lane + 1) * 84)
      : quotient.filter((_, i) => i % 3 === lane);
    for (const [operator, matrix] of [
      ['identity', null], ['S', S], ['Sinverse', Sinverse]
    ]) {
      const attempt = matrix ? transform(raw, matrix) : raw;
      sourceTransfer.push({
        layout, lane, operator,
        disagreements: equalityDisagreements(attempt, trueP56Key),
        equalSymbols: attempt.reduce((sum, v, j) =>
          sum + +(v === trueP56Key[j]), 0)
      });
    }
  }
}
assert.equal(sourceTransfer.length, 18);
const minimum = Math.min(...sourceTransfer.map((x) => x.disagreements));
const maxDirect = Math.max(...sourceTransfer.map((x) => x.equalSymbols));
assert.equal(minimum, 191);
assert.equal(maxDirect, 8);
const winner = sourceTransfer.find((r) => r.disagreements === minimum);
assert.deepEqual(
  [winner.layout, winner.lane, winner.operator],
  ['contiguous', 1, 'S']);
console.log('ORIGINAL_KEY_TRANSFER 18 layouts, key-independent equality mismatches minimum=' +
  minimum + ', max exact symbols=' + maxDirect +
  ', best contiguous middle84 after S');


/**
 * Complete spectral relation. The sum of roots of every irreducible
 * 7-square factor (the single root for a linear factor, field trace
 * for a conjugate quadratic pair) is exactly the unordered spectrum
 * of the independently printed 5-square. This is an invariant
 * **of the factors**, not a license for arbitrary ordering as CHANGE.
 *
 * A commuting linear B5<-C7 intertwiner has rank at most three:
 * C7's irreducible quadratic four-space cannot map nontrivially
 * into the split-linear B5 representation. Test the three surviving
 * native eigencoordinates on two natural full-source registrations.
 */
const factorTraces = factors7.map((factor) => m29(-factor[1]));
assert.deepEqual([...factorTraces].sort((a, b) => a - b),
  [...roots5].sort((a, b) => a - b));
console.log('TRACE_COLLAPSE seven irreducible-factor traces=' +
  factorTraces.join(',') + ' five-square eigenroots=' + roots5.join(','));
const V5 = [
  [1, 1, 1, 1, 1],
  [0, 24, 11, 18, 1],
  [0, 8, 0, 20, 1],
  [0, 24, 18, 18, 1],
  [28, 1, 28, 1, 1]
];
const V5inverse = matrixInverse(V5);
assert.deepEqual(multiply(V5, V5inverse), identity(5));
assert.deepEqual(
  multiply(multiply(V5inverse, five1033), V5),
  roots5.map((value, i) =>
    roots5.map((_, j) => i === j ? value : 0)));
/**
 * @param {number[]} runes
 * @param {number} packetLength
 * @param {number[][]} inverseBasis
 * @param {number[]} coordinateIndices
 * @returns {number[][]}
 */
function project(runes, packetLength, inverseBasis, coordinateIndices) {
  assert.equal(runes.length % packetLength, 0);
  const output = [];
  for (let i = 0; i < runes.length; i += packetLength) {
    const z = apply(inverseBasis, runes.slice(i, i + packetLength));
    output.push(coordinateIndices.map((j) => z[j]));
  }
  return output;
}
const fiveChapter = concatenate(3, 7);
const sevenChapter = concatenate(8, 14);
const sevenCuneiform = concatenate(33, 39);
assert.equal(fiveChapter.length, 1145);
assert.equal(sevenChapter.length, 1729);
assert.equal(sevenCuneiform.length, 1680);
const pFive = project(fiveChapter, 5, V5inverse, [1, 2, 4]);
const pSeven = project(sevenChapter, 7, Sinverse, [0, 1, 2]);
const pCuneiform = project(sevenCuneiform, 7, Sinverse, [0, 1, 2]);
assert.deepEqual([pFive.length, pSeven.length, pCuneiform.length],
  [229, 247, 240]);
/** @param {number[][]} a @param {number[][]} b @param {number} offset */
function sharedModeMatches(a, b, offset) {
  let matches = 0;
  let wholeTriples = 0;
  for (let i = 0; i < a.length; i += 1) {
    const eq = a[i].map((v, j) => +(v === b[i + offset][j]));
    matches += eq.reduce((sum, v) => sum + v, 0);
    wholeTriples += +(eq.every(Boolean));
  }
  return [matches, wholeTriples];
}
const sharedResults = [
  sharedModeMatches(pFive, pSeven, 0),
  sharedModeMatches(pFive, pSeven, 18),
  sharedModeMatches(pFive, pCuneiform, 0),
  sharedModeMatches(pFive, pCuneiform, 11)
];
assert.deepEqual(sharedResults, [[22, 0], [23, 0], [19, 0], [19, 0]]);

// Positively plant three source-symbol modes in both authentic dimensions,
// with four 7-square and two 5-square secondary modes zero.
const original3 = Array.from({ length: 229 }, (_, i) =>
  [solved[(3 * i) % 95], solved[(3 * i + 1) % 95],
    solved[(3 * i + 2) % 95]]);
const fivePlant = original3.flatMap(([h, a, e]) =>
  apply(V5, [0, h, a, 0, e]));
const sevenPlant = original3.flatMap(([h, a, e]) =>
  apply(S, [h, a, e, 0, 0, 0, 0]));
const pFivePlant = project(fivePlant, 5, V5inverse, [1, 2, 4]);
const pSevenPlant = project(sevenPlant, 7, Sinverse, [0, 1, 2]);
assert.deepEqual(pFivePlant, original3);
assert.deepEqual(pSevenPlant, original3);
assert.deepEqual(sharedModeMatches(pFivePlant, pSevenPlant, 0), [687, 229]);
console.log('THREE_SHARED_MODES original full-packet equal positions=' +
  sharedResults.map((v) => v.join('/')).join(',') +
  ' vs 687/229 planted positives; no reused source-aligned state');


/**
 * Noninvertible but source-canonical five-symbol *field-trace* reduction.
 * Each 7-symbol packet decomposes as H, A, E and two GF(29²) extensions.
 * Trace on the quadratic extension q1=x²−5x−13 sends (u,v)->2u+5v;
 * trace on q2=x²+8x+8 sends (u,v)->2u+21v. This gives the complete
 * printed CHANGE multiset in exactly five positions without fitting a
 * ciphertext. Test the trace output alone and through the genuine
 * 5-square physical/eigenvector basis in both directions.
 *
 * For a genuine positive plant the 7-input can be lifted exactly from
 * any 5-symbol source, choosing the quadratic trace's v-component zero
 * and u=input/2. The kernel is two-dimensional per packet.
 */
function traceToFive(sevenSource) {
  assert.equal(sevenSource.length % 7, 0);
  const output = [];
  for (let i = 0; i < sevenSource.length; i += 7) {
    const z = apply(Sinverse, sevenSource.slice(i, i + 7));
    output.push(m29(2 * z[3] + 5 * z[4]), z[0], z[1],
      m29(2 * z[5] + 21 * z[6]), z[2]);
  }
  return output;
}
function transformFive(text, basis) {
  assert.equal(text.length % 5, 0);
  const output = [];
  for (let i = 0; i < text.length; i += 5) {
    output.push(...apply(basis, text.slice(i, i + 5)));
  }
  return output;
}
/** @param {number[]} fiveSource @returns {number[]} */
function liftFiveSource(fiveSource) {
  assert.equal(fiveSource.length % 5, 0);
  const output = [];
  for (let i = 0; i < fiveSource.length; i += 5) {
    const [c, h, a, ng, e] = fiveSource.slice(i, i + 5);
    output.push(...apply(S, [
      h, a, e, m29(15 * c), 0, m29(15 * ng), 0
    ]));
  }
  return output;
}
for (const [originalSeven, n, own, physical, inversePhysical] of [
  [sevenChapter, 1235, 0.03431649813975157,
    0.034320435173459146, 0.03450416341314576],
  [sevenCuneiform, 1200, 0.034334167361690295,
    0.034452321378926884, 0.03462885738115096]
]) {
  const originalTrace = traceToFive(originalSeven);
  assert.equal(originalTrace.length, n);
  close(ioc(originalTrace), own);
  close(ioc(transformFive(originalTrace, V5)), physical);
  close(ioc(transformFive(originalTrace, V5inverse)), inversePhysical);
  const fiveNative = Array.from({ length: n }, (_, i) => solved[i % 95]);
  assert.deepEqual(traceToFive(liftFiveSource(fiveNative)), fiveNative);
  assert.ok(ioc(fiveNative) > 0.05);
  console.log('FIVE_TRACE_OUTPUT original_7=' + originalSeven.length +
    ' to_5=' + n + ' IoC coordinate/physical/inverse=' +
    [own, physical, inversePhysical].map((x) => x.toFixed(9)).join('/') +
    ' authentic-native plant=' + n + '/' + n);
}


/**
 * The immediately adjacent original LP2 p3-7 scroll has exactly 255
 * source-printed words; the following original physical p8 has exactly
 * 255 ciphertext runes. Test the independent 2014 original *5-square*
 * against the 255-word register; this is a different consumer than
 * applying either square to raw rune quintets. The original page-8
 * 255-rune tape is a candidate per-word key clock, exactly 51 blocks
 * of five. No fitted phase or inserted rune.
 */
const originalTranscription = fs.readFileSync(path.join(
  ROOT, 'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8');
const glyphMap = new Map(corpus.runes.map((rune, i) => [rune, i]));
const print = originalTranscription.split('%').slice(3, 8).join('')
  .replace(/[\n\/&$]/g, '');
const exactPrintedWords = print.split(/[-.]/)
  .map((piece) => [...piece].filter((rune) => glyphMap.has(rune))
    .map((rune) => glyphMap.get(rune)))
  .filter((word) => word.length > 0);
assert.equal(exactPrintedWords.length, 255);
assert.deepEqual(exactPrintedWords.flat(), concatenate(3, 7));
assert.equal(byPage.get(8).length, 255);
const sourceRuneWords = exactPrintedWords.flat();
const sourceP8 = byPage.get(8);
const B5inverse = matrixInverse(five1033);
/** @param {number[]} key @param {number} sign @param {number[]} source @returns {number[]} */
function addWordKey(key, sign, source) {
  assert.equal(key.length, 255);
  assert.equal(source.length, 1145);
  const result = [];
  let cursor = 0;
  for (let w = 0; w < exactPrintedWords.length; w += 1) {
    const shift = key[w];
    for (let j = 0; j < exactPrintedWords[w].length; j += 1) {
      result.push(m29(source[cursor] + sign * shift));
      cursor += 1;
    }
  }
  assert.equal(cursor, source.length);
  return result;
}
const scrollTransforms = [
  ['physical', five1033, 0.03425504626377989, 0.034589428039209696],
  ['physical-inverse', B5inverse, 0.034549729746236296, 0.034529880599749596],
  ['CHANGE-eigenvector', V5, 0.0341817571075213, 0.03420771368369622],
  ['CHANGE-eigen-inverse', V5inverse, 0.03468714691422115, 0.0343573457110575]
];
const nativeScroll = Array.from(
  { length: sourceRuneWords.length }, (_, i) => solved[i % solved.length]);
assert.ok(ioc(nativeScroll) > 0.055);
for (const [name, matrix, positiveIoc, negativeIoc] of scrollTransforms) {
  const wordKey = transformFive(sourceP8, matrix);
  assert.equal(wordKey.length, 255);
  assert.deepEqual(transformFive(wordKey, matrixInverse(matrix)), sourceP8);
  const plus = addWordKey(wordKey, 1, sourceRuneWords);
  const minus = addWordKey(wordKey, -1, sourceRuneWords);
  close(ioc(plus), positiveIoc);
  close(ioc(minus), negativeIoc);
  assert.deepEqual(addWordKey(wordKey, -1, plus), sourceRuneWords);
  assert.deepEqual(addWordKey(wordKey, 1, minus), sourceRuneWords);
  assert.deepEqual(
    addWordKey(wordKey, 1, addWordKey(wordKey, -1, nativeScroll)),
    nativeScroll);
  console.log('ADJACENT_255WORD_SOURCE matrix=' + name +
    ' original scroll 1145/1145 runes, key=255 p8, IoC +/-=' +
    [ioc(plus), ioc(minus)].map((v) => v.toFixed(9)).join('/') +
    ' genuine native positive=1145/1145');
}


/**
 * Authentic-source reversal duality of the complete five-factor trace map:
 * every nonconstant 7-square trace factor has the OPPOSITE reversal parity
 * from the corresponding 5-square CHANGE eigenmode; the constant E mode
 * is reflection-even in both squares.
 *
 * The complete SOURCE-DERIVED 5x7 trace F has the striking exact identity
 *          J5 * F + F * J7 = (2/7 mod 29) * U5x7
 * where J denotes index reversal, U is all ones, and 2/7 mod29 = 21.
 * Thus on any 7-source packet with rune sum zero, F anti-commutes with
 * reversing; otherwise it differs by exactly the packet's mean.
 * This is a structural fact of the printed 2014 squares, NOT proof the
 * creator intended this conversion as an LP2 decoder.
 */
const traceFromEigenCoordinates = [
  [0, 0, 0, 2, 5, 0, 0],
  [1, 0, 0, 0, 0, 0, 0],
  [0, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 2, 21],
  [0, 0, 1, 0, 0, 0, 0]
];
const tracePhysical = multiply(
  multiply(V5, traceFromEigenCoordinates), Sinverse);
assert.deepEqual(tracePhysical, [
  [22,18,28,21,20,18,19],
  [10,7,1,2,23,9,7],
  [19,27,10,25,11,23,2],
  [14,12,27,19,20,14,11],
  [2,3,1,0,22,3,28]
]);
const reverseMatrix = (n) =>
  Array.from({length:n}, (_,i) =>
    Array.from({length:n}, (_,j) => +(i + j === n - 1)));
const leftReflection = multiply(reverseMatrix(5),tracePhysical);
const rightReflection = multiply(tracePhysical,reverseMatrix(7));
assert.ok(leftReflection.every((row,i) =>
  row.every((v,j) => m29(v + rightReflection[i][j]) === 21)));
assert.deepEqual(tracePhysical.map(row =>
  m29(row.reduce((s,v) => s + v,0))), [1,1,1,1,1]);
assert.deepEqual(Array.from({length:7}, (_,j) =>
  m29(tracePhysical.reduce((s,row) => s + row[j],0))),
  [9,9,9,9,9,9,9]);
for (const [eigenRoot, sevenEigenColumn, fiveEigenColumn,
  sourceSevenParity, sourceFiveParity] of [
    [8, 0, 1, -1, 1],
    [24, 1, 2, 1, -1],
    [18, 2, 4, 1, 1]
]) {
  const v7 = S.map(row => row[sevenEigenColumn]);
  const v5 = V5.map(row => row[fiveEigenColumn]);
  assert.deepEqual(apply(reverseMatrix(7),v7),
    v7.map(v => m29(sourceSevenParity * v)));
  assert.deepEqual(apply(reverseMatrix(5),v5),
    v5.map(v => m29(sourceFiveParity * v)));
  assert.deepEqual(apply(seven1033,v7),
    v7.map(v => m29(eigenRoot * v)));
  assert.deepEqual(apply(five1033,v5),
    v5.map(v => m29(eigenRoot * v)));
}
for (const [quadraticIndex, traceIndex, sevenParity, fiveParity] of [
  [3, 0, 1, -1], [5, 3, -1, 1]
]) {
  const z7a = S.map(row => row[quadraticIndex]);
  const z7b = S.map(row => row[quadraticIndex + 1]);
  const z5 = V5.map(row => row[traceIndex]);
  for (const v7 of [z7a,z7b]) {
    assert.deepEqual(apply(reverseMatrix(7),v7),
      v7.map(v=>m29(sevenParity*v)));
  }
  assert.deepEqual(apply(reverseMatrix(5),z5),
    z5.map(v=>m29(fiveParity*v)));
}
const traceLinear = a => apply(tracePhysical,a);
const printedFirstSeven = concatenate(8,14).slice(0,7);
assert.deepEqual(traceLinear(printedFirstSeven),
  transformFive(traceToFive(printedFirstSeven),V5));
const baseReversal = [...printedFirstSeven].reverse();
const lhs = traceLinear(baseReversal);
const rhs = [...traceLinear(printedFirstSeven)].reverse()
  .map((v)=>m29(21*printedFirstSeven.reduce((s,x)=>s+x,0)-v));
assert.deepEqual(lhs,rhs);
console.log('REVERSE_DUALITY original 2014 5x7 TRACE map rank5, opposite parity C/H/A/NG, even E; J5*F+F*J7=21*ones; original 7-rune block PASS');


/**
 * The physical LP2 p33 red cuneiform headings print 1033 and3301,
 * providing a more direct human-visible pointer to the actual 2014
 * 1033 squares. The 21+28 black words start as a literal 7x7 grid,
 * last word BMB continuing across p33->p34. This is the strongest
 * source-directed recipient for our new rank5 trace. Read the complete
 * 49 words, summarize each to GP29 (native index sum, genuine GP
 * prime sum, physical length) and apply the *unaltered 5x7 F* to each
 * consecutive row7. This produces exactly 35 native candidate runes.
 * We do not claim an unknown plaintext from these short outputs.
 */
const transPages = originalTranscription.split(/\r?\n%\r?\n/);
assert.equal(transPages.length, 57);
const p33parts = transPages[33].split('&');
assert.equal(p33parts.length, 2);
const tokenizePart = s => s.replace(/[\/\s]/g, '')
  .split(/[-.]/).filter(Boolean);
const p33Printed49 = p33parts.map(part => tokenizePart(part).slice(2)).flat();
assert.equal(p33Printed49.length, 49);
p33Printed49[48] += tokenizePart(transPages[34])[0];
assert.deepEqual(p33Printed49.slice(-3), [
  'ᚱᚪᚱ', 'ᚫᚪᚷᛟᛞ', 'ᛒᛗᛒ'
]);
const p33WordIndices = p33Printed49.map(word =>
  [...word].map(r => glyphMap.get(r)));
assert.equal(p33WordIndices.flat().length, 198);
assert.deepEqual(p33WordIndices.slice(0,3).map(w=>w.length),[2,9,6]);
assert.deepEqual(p33WordIndices.slice(-3).map(w=>w.length),[3,5,3]);
const p33NativePrime = corpus.prime;
const p33Summaries = [
  ['index-sum', p33WordIndices.map(w=>m29(w.reduce((a,v)=>a+v,0))),
    [27,7,27,8,8,17,15,5,21,24,4,15,17,2,10]],
  ['prime-sum',p33WordIndices.map(w=>m29(w.reduce((a,v)=>a+p33NativePrime[v],0))),
    [18,10,20,14,15,13,4,5,20,19,6,17,2,4,24]],
  ['word-length',p33WordIndices.map(w=>w.length),
    [6,27,19,25,28,12,27,7,6,22,9,18,23,28,8]]
];
for(const [name,src,first15] of p33Summaries){
 const output=[];
 for(let i=0;i<src.length;i+=7)output.push(...apply(tracePhysical,src.slice(i,i+7)));
 assert.equal(output.length,35);
 assert.deepEqual(output.slice(0,15),first15);
 console.log('ORIGINAL_P33_CUNEIFORM_1033_TO_35 source=' +name+
   ' words=49 complete output35='+
   output.map(i=>corpus.translit[i]).join('.')+
   ' no independently readable plaintext');
}
const clear35 = solved.slice(0,35);
const plantedP33Seven = liftFiveSource(transformFive(clear35,V5inverse));
assert.equal(plantedP33Seven.length,49);
const recovered35=[];
for(let i=0;i<49;i+=7)recovered35.push(
  ...apply(tracePhysical,plantedP33Seven.slice(i,i+7)));
assert.deepEqual(recovered35,clear35);
console.log('P33_49WORD_TRACE native GP positive exact 35/35');

console.log('SELFTEST_PASS original squares, charpolys, canonical basis, 3409 original runes, solved-native positives, 84-prime authenticated-key transfer, canonical shared three-mode original receiver, full factor-trace five-symbol original reductions, adjacent 255-word CHANGE-square key receiver, exact five-to-seven reversal-dual trace, p33 explicit 1033 49-word firstparty receiver');
