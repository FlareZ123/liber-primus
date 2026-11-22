#!/usr/bin/env node
'use strict';

// Test the source-locked hypothesis that LP1's hidden 5x5 magic-square
// values, reduced modulo 29, are an additive GP29 key for LP2's five-dot
// pages. The five-dot stencil is original on p7 and vertically reflected
// on p23. No key phase, alphabet permutation, or free key material is fit.

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const shakespeare = fs.readFileSync(path.join(root, 'resources/control/shakespeare_first300k.txt'), 'utf8');

const matrix = [
  [272, 138, 341, 131, 151],
  [366, 199, 130, 320, 18],
  [226, 245, 91, 245, 226],
  [18, 320, 130, 199, 366],
  [151, 131, 341, 138, 272]
];
const sum = xs => xs.reduce((a, b) => a + b, 0);
assert.deepEqual(matrix.map(sum), [1033, 1033, 1033, 1033, 1033]);
assert.deepEqual(matrix[0].map((_, c) => sum(matrix.map(row => row[c]))), [1033, 1033, 1033, 1033, 1033]);
assert.equal(sum(matrix.map((row, i) => row[i])), 1033);
assert.equal(sum(matrix.map((row, i) => row[4 - i])), 1033);

const rowMajor = matrix.flat().map(x => x % 29);
const vertical = matrix.slice().reverse().flat().map(x => x % 29);
assert.equal(rowMajor.length, 25);
assert.equal(vertical.length, 25);

const tokenPairs = [
  ['TH', 2], ['NG', 21], ['EO', 12], ['OE', 22], ['AE', 25], ['IA', 27], ['EA', 28],
  ['F', 0], ['U', 1], ['O', 3], ['R', 4], ['C', 5], ['G', 6], ['W', 7],
  ['H', 8], ['N', 9], ['I', 10], ['J', 11], ['P', 13], ['X', 14], ['S', 15],
  ['T', 16], ['B', 17], ['E', 18], ['M', 19], ['L', 20], ['D', 23],
  ['A', 24], ['Y', 26]
];

function encodeEnglishToGP(text) {
  const source = text.toUpperCase().replace(/[^A-Z]/g, '');
  const out = [];
  for (let i = 0; i < source.length;) {
    let found = false;
    for (const [token, value] of tokenPairs) {
      if (source.startsWith(token, i)) {
        out.push(value);
        i += token.length;
        found = true;
        break;
      }
    }
    if (found) continue;
    const ch = source[i++];
    // Conventional GP scoring approximations for letters without a distinct rune.
    if (ch === 'K' || ch === 'Q') out.push(5);
    else if (ch === 'V') out.push(1);
    else if (ch === 'Z') out.push(15);
  }
  return out;
}

const englishGP = encodeEnglishToGP(shakespeare);
const split = Math.floor(englishGP.length * 0.78);
const training = englishGP.slice(0, split);
const holdout = englishGP.slice(split);

const bigramCounts = Array.from({ length: 29 }, () => Array(29).fill(0));
const rowTotals = Array(29).fill(0);
for (let i = 1; i < training.length; i++) {
  bigramCounts[training[i - 1]][training[i]]++;
  rowTotals[training[i - 1]]++;
}
const logP = bigramCounts.map((row, a) =>
  row.map(count => Math.log((count + 0.1) / (rowTotals[a] + 2.9)))
);

function decode(cipher, key, sign, period, maxSkip = 2, skipPenalty = 3.5) {
  const n = cipher.length;
  const stateCount = period * 29;
  let dp = new Float64Array(stateCount);
  dp.fill(-Infinity);

  // Each page starts at the square's top-left cell.
  const firstPlain = (cipher[0] - sign * key[0] + 29) % 29;
  dp[1 * 29 + firstPlain] = 0;

  const back = new Array(n);
  const skipBack = new Array(n);
  back[0] = new Int32Array(stateCount);
  back[0].fill(-1);
  skipBack[0] = new Int8Array(stateCount);

  for (let i = 1; i < n; i++) {
    const next = new Float64Array(stateCount);
    next.fill(-Infinity);
    const previousState = new Int32Array(stateCount);
    previousState.fill(-1);
    const rejectedAtPosition = new Int8Array(stateCount);

    for (let phase = 0; phase < period; phase++) {
      for (let previousPlain = 0; previousPlain < 29; previousPlain++) {
        const state = phase * 29 + previousPlain;
        const base = dp[state];
        if (!Number.isFinite(base)) continue;

        for (let rejected = 0; rejected <= maxSkip; rejected++) {
          const acceptedKey = key[(phase + rejected) % period];
          const plain = (cipher[i] - sign * acceptedKey + 29) % 29;

          // Every rejected draw must have emitted the previous published
          // ciphertext rune under this same candidate plaintext rune.
          let valid = true;
          for (let q = 0; q < rejected; q++) {
            const trial = (plain + sign * key[(phase + q) % period] + 29) % 29;
            if (trial !== cipher[i - 1]) {
              valid = false;
              break;
            }
          }
          if (!valid) continue;

          const nextPhase = (phase + rejected + 1) % period;
          const nextState = nextPhase * 29 + plain;
          const candidate = base + logP[previousPlain][plain] - skipPenalty * rejected;
          if (candidate > next[nextState]) {
            next[nextState] = candidate;
            previousState[nextState] = state;
            rejectedAtPosition[nextState] = rejected;
          }
        }
      }
    }
    dp = next;
    back[i] = previousState;
    skipBack[i] = rejectedAtPosition;
  }

  let bestScore = -Infinity;
  let bestState = -1;
  for (let state = 0; state < stateCount; state++) {
    if (dp[state] > bestScore) {
      bestScore = dp[state];
      bestState = state;
    }
  }
  assert.notEqual(bestState, -1, 'no valid Viterbi path');

  const plain = new Array(n);
  const skipHistogram = [0, 0, 0];
  let state = bestState;
  for (let i = n - 1; i >= 1; i--) {
    plain[i] = state % 29;
    const rejected = skipBack[i][state];
    skipHistogram[rejected]++;
    state = back[i][state];
    assert.notEqual(state, -1, 'broken Viterbi backpointer');
  }
  plain[0] = state % 29;

  return {
    plain,
    scorePerRune: bestScore / Math.max(1, n - 1),
    rejectedDraws: skipHistogram[1] + 2 * skipHistogram[2],
    skipHistogram,
    preview: plain.map(index => corpus.translit[index]).join('').slice(0, 100)
  };
}

function encrypt(plain, key, sign, period) {
  const cipher = [];
  let pointer = 0;
  let previousCipher = null;
  let rejectedDraws = 0;
  for (const symbol of plain) {
    let localRejects = 0;
    let value;
    while (true) {
      value = (symbol + sign * key[pointer % period] + 29) % 29;
      if (previousCipher !== null && value === previousCipher) {
        pointer++;
        rejectedDraws++;
        localRejects++;
        assert.ok(localRejects <= 2, 'plant exceeded the decoder skip bound');
      } else {
        break;
      }
    }
    cipher.push(value);
    pointer++;
    previousCipher = value;
  }
  return { cipher, rejectedDraws };
}

const original = [];
for (const item of [
  { page: 7, key: rowMajor, orientation: 'LP1 square row-major; LP2 five-dot baseline' },
  { page: 23, key: vertical, orientation: 'LP1 square vertically reflected; LP2 five-dot vertical mirror' }
]) {
  const cipher = corpus.pages[item.page].indices;
  assert.equal(cipher.length, item.page === 7 ? 208 : 213);
  for (const period of [24, 25]) {
    for (const sign of [-1, 1]) {
      const result = decode(cipher, item.key, sign, period);
      original.push({
        page: item.page,
        orientation: item.orientation,
        period,
        sign,
        scorePerRune: result.scorePerRune,
        rejectedDraws: result.rejectedDraws,
        skipHistogram: result.skipHistogram,
        preview: result.preview
      });
    }
  }
}

let rng = 0x9e3779b9;
function randomInt(limit) {
  rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0;
  return rng % limit;
}
const controls = [];
for (let t = 0; t < 12; t++) {
  const n = t % 2 === 0 ? 208 : 213;
  const start = (t * 7919 + split + 300) % Math.max(1, holdout.length - n);
  const plain = holdout.slice(start, start + n);
  const sign = t % 2 === 0 ? 1 : -1;

  for (const period of [24, 25]) {
    const encrypted = encrypt(plain, rowMajor, sign, period);
    const recovered = decode(encrypted.cipher, rowMajor, sign, period);
    let matches = 0;
    for (let i = 0; i < n; i++) if (recovered.plain[i] === plain[i]) matches++;
    controls.push({
      plant: t,
      length: n,
      period,
      sign,
      actualRejectedDraws: encrypted.rejectedDraws,
      recovered: matches,
      exact: matches === n,
      scorePerRune: recovered.scorePerRune
    });
  }
}

assert.equal(controls.length, 24);
assert.ok(controls.every(x => x.recovered >= x.length - 4), 'a planted control fell outside the four-rune tolerance');


function mod29(x) { return ((x % 29) + 29) % 29; }
function transposeMatrix(a) { return a[0].map((_, j) => a.map(row => row[j])); }
function modInverse(a) {
  for (let x = 1; x < 29; x++) if (mod29(a * x) === 1) return x;
  throw new Error("noninvertible pivot in F29");
}
function inverseMatrix(input) {
  const n = input.length;
  const a = input.map((row, i) => row.map(mod29).concat(
    Array.from({length:n}, (_, j) => i === j ? 1 : 0)
  ));
  for (let col = 0; col < n; col++) {
    let pivot = col;
    while (pivot < n && a[pivot][col] === 0) pivot++;
    if (pivot === n) throw new Error("Hill matrix singular over F29");
    [a[col], a[pivot]] = [a[pivot], a[col]];
    const inv = modInverse(a[col][col]);
    a[col] = a[col].map(value => mod29(value * inv));
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = a[row][col];
      a[row] = a[row].map((value, j) => mod29(value - factor * a[col][j]));
    }
  }
  return a.map(row => row.slice(n));
}
function determinantMod29(input) {
  const n = input.length;
  const a = input.map(row => row.map(mod29));
  let determinant = 1;
  for (let col = 0; col < n; col++) {
    let pivot = col;
    while (pivot < n && a[pivot][col] === 0) pivot++;
    if (pivot === n) return 0;
    if (pivot !== col) {
      [a[col], a[pivot]] = [a[pivot], a[col]];
      determinant = mod29(-determinant);
    }
    const value = a[col][col];
    determinant = mod29(determinant * value);
    const inv = modInverse(value);
    for (let row = col + 1; row < n; row++) {
      const factor = mod29(a[row][col] * inv);
      for (let j = col; j < n; j++) a[row][j] = mod29(a[row][j] - factor * a[col][j]);
    }
  }
  return determinant;
}
function hillTransform(input, keyMatrix, phase, operation) {
  const transform = operation === "inverse" ? inverseMatrix(keyMatrix) : keyMatrix;
  const output = input.slice();
  for (let start = phase; start + 5 <= input.length; start += 5) {
    const block = input.slice(start, start + 5);
    const mapped = transform.map(row =>
      mod29(row.reduce((sum, coefficient, j) => sum + coefficient * block[j], 0))
    );
    for (let j = 0; j < 5; j++) output[start + j] = mapped[j];
  }
  return output;
}
function hillMetrics(output) {
  let bigram = 0;
  for (let i = 1; i < output.length; i++) bigram += logP[output[i - 1]][output[i]];
  const counts = Array(29).fill(0);
  for (const value of output) counts[value]++;
  const pairs = counts.reduce((sum, n) => sum + n * (n - 1), 0);
  return {
    bigramPerRune: bigram / Math.max(1, output.length - 1),
    ioc: pairs / (output.length * Math.max(1, output.length - 1))
  };
}
function hillMatrixTests() {
  const originalTests = [];
  const sourceOrientations = [
    {page:7, name:"LP1 square row-major / p7 baseline", key:matrix.map(row => row.map(mod29))},
    {page:23, name:"LP1 square vertically reflected / p23 mirror", key:matrix.slice().reverse().map(row => row.map(mod29))}
  ];
  for (const source of sourceOrientations) {
    const cipher = corpus.pages[source.page].indices;
    for (const [matrixOrder, key] of [
      ["printed", source.key],
      ["transpose", transposeMatrix(source.key)]
    ]) {
      for (const operation of ["inverse", "direct"]) {
        for (let phase = 0; phase < 5; phase++) {
          const plain = hillTransform(cipher, key, phase, operation);
          originalTests.push({
            page:source.page, orientation:source.name, matrixOrder, operation, phase,
            ...hillMetrics(plain),
            preview:plain.slice(0, 100).map(value => corpus.translit[value]).join("")
          });
        }
      }
    }
  }
  originalTests.sort((a, b) => b.bigramPerRune - a.bigramPerRune);

  const positiveControls = [];
  for (const source of sourceOrientations) {
    const n = corpus.pages[source.page].indices.length;
    const plain = holdout.slice(100, 100 + n);
    if (plain.length !== n) throw new Error("insufficient held-out Hill control text");
    for (const [matrixOrder, key] of [
      ["printed", source.key],
      ["transpose", transposeMatrix(source.key)]
    ]) {
      for (const operation of ["inverse", "direct"]) {
        for (let phase = 0; phase < 5; phase++) {
          const inverseOperation = operation === "inverse" ? "direct" : "inverse";
          const cipher = hillTransform(plain, key, phase, inverseOperation);
          const recovered = hillTransform(cipher, key, phase, operation);
          const matches = recovered.reduce((sum, value, i) => sum + Number(value === plain[i]), 0);
          positiveControls.push({page:source.page, matrixOrder, operation, phase, matches, length:n});
        }
      }
    }
  }
  if (positiveControls.length !== 40 ||
      positiveControls.some(control => control.matches !== control.length))
    throw new Error("Hill cipher synthetic positive control failed");

  const globalCipher = corpus.pages
    .filter(page => page.page <= 55 && page.indices.length)
    .flatMap(page => page.indices);
  assert.equal(globalCipher.length, 12956);
  const globalTests = [];
  for (const source of [
    {name:"global row-major", key:matrix.map(row => row.map(mod29))},
    {name:"global vertical reflection", key:matrix.slice().reverse().map(row => row.map(mod29))}
  ]) {
    for (const [matrixOrder, key] of [
      ["printed", source.key],
      ["transpose", transposeMatrix(source.key)]
    ]) {
      for (const operation of ["inverse", "direct"]) {
        for (let phase = 0; phase < 5; phase++) {
          const plain = hillTransform(globalCipher, key, phase, operation);
          globalTests.push({
            orientation:source.name, matrixOrder, operation, phase,
            ...hillMetrics(plain),
            preview:plain.slice(0, 120).map(value => corpus.translit[value]).join("")
          });
        }
      }
    }
  }
  globalTests.sort((a, b) => b.bigramPerRune - a.bigramPerRune);

  const globalPlain = holdout.slice(100, 100 + globalCipher.length);
  if (globalPlain.length !== globalCipher.length)
    throw new Error("insufficient held-out global Hill control text");
  const globalPositiveControls = [];
  for (const source of [
    {name:"global row-major", key:matrix.map(row => row.map(mod29))},
    {name:"global vertical reflection", key:matrix.slice().reverse().map(row => row.map(mod29))}
  ]) {
    for (const [matrixOrder, key] of [
      ["printed", source.key],
      ["transpose", transposeMatrix(source.key)]
    ]) {
      for (const operation of ["inverse", "direct"]) {
        for (let phase = 0; phase < 5; phase++) {
          const inverseOperation = operation === "inverse" ? "direct" : "inverse";
          const cipher = hillTransform(globalPlain, key, phase, inverseOperation);
          const recovered = hillTransform(cipher, key, phase, operation);
          const matches = recovered.reduce((sum, value, i) => sum + Number(value === globalPlain[i]), 0);
          globalPositiveControls.push({orientation:source.name, matrixOrder, operation, phase,
            matches, length:globalCipher.length});
        }
      }
    }
  }
  if (globalPositiveControls.length !== 40 ||
      globalPositiveControls.some(control => control.matches !== control.length))
    throw new Error("global Hill cipher synthetic positive control failed");

  const matrix29 = matrix.map(row => row.map(mod29));
  const vertical29 = matrix.slice().reverse().map(row => row.map(mod29));
  const englishControls = [208, 213].map(n => hillMetrics(holdout.slice(100, 100 + n)));
  const bestByPage = [7, 23].map(page =>
    originalTests.filter(test => test.page === page).sort((a, b) => b.bigramPerRune - a.bigramPerRune)[0]
  );
  const phaseZeroByPage = [7, 23].map(page =>
    originalTests.filter(test => test.page === page && test.phase === 0)
      .sort((a, b) => b.bigramPerRune - a.bigramPerRune)[0]
  );
  return {
    matrixMod29:matrix29,
    determinantMod29:determinantMod29(matrix29),
    verticalReflectionDeterminantMod29:determinantMod29(vertical29),
    originalTests:originalTests.length,
    bestByPage,
    phaseZeroByPage,
    heldOutEnglishControls:englishControls,
    positiveControls:{exact:positiveControls.filter(x => x.matches === x.length).length,total:positiveControls.length},
    globalContinuousStream:{
      length:globalCipher.length,
      lengthModulo5:globalCipher.length % 5,
      tests:globalTests.length,
      best:globalTests[0],
      bestPhaseZero:globalTests.filter(test => test.phase === 0)
        .sort((a, b) => b.bigramPerRune - a.bigramPerRune)[0],
      heldOutEnglishControl:hillMetrics(globalPlain),
      positiveControls:{exact:globalPositiveControls.filter(x => x.matches === x.length).length,total:globalPositiveControls.length}
    }
  };
}


const controlScores = controls.map(x => x.scorePerRune);
const summary = {
  keyRowMajor: rowMajor,
  keyVerticalReflection: vertical,
  original: original.sort((a, b) => b.scorePerRune - a.scorePerRune),
  positiveControls: {
    count: controls.length,
    exact: controls.filter(x => x.exact).length,
    minimumRecovered: Math.min(...controls.map(x => x.recovered)),
    meanScorePerRune: controlScores.reduce((a, b) => a + b, 0) / controlScores.length,
    minimumScorePerRune: Math.min(...controlScores),
    maximumScorePerRune: Math.max(...controlScores),
    trials: controls
  }
};


function matrixStateTests() {
  const dotPoints = {
    p7:[[796.941,3105.773],[992.500,3166.637],[1296.931,2866.789],[1479.265,3127.500],[1527.153,2936.153]],
    p23:[[796.941,568.227],[992.500,507.363],[1296.931,807.211],[1479.265,546.500],[1527.153,737.939]]
  };
  function rankSeed(points) {
    const xOrder = points.slice().sort((a,b) => a[0]-b[0]);
    const yOrder = points.map(point => point[1]).sort((a,b) => a-b);
    return xOrder.map(point => yOrder.indexOf(point[1]) + 1);
  }
  function makeStateKey(seed, keyMatrix, rowUpdate, flatten) {
    let state = seed.map(mod29);
    const initial = state.join(",");
    const states = [];
    for (let t = 0; t < 29; t++) {
      if (states.some(previous => previous.join(",") === state.join(","))) break;
      states.push(state.slice());
      if (rowUpdate) {
        state = keyMatrix[0].map((_,j) =>
          mod29(state.reduce((sum,value,i) => sum + value * keyMatrix[i][j], 0))
        );
      } else {
        state = keyMatrix.map(row =>
          mod29(row.reduce((sum,value,i) => sum + value * state[i], 0))
        );
      }
    }
    if (state.join(",") !== initial || states.length !== 28)
      throw new Error("five-dot-seeded matrix state did not close at 28 states");
    return flatten === "time" ? states.flat() :
      Array.from({length:5}, (_,j) => states.map(vector => vector[j])).flat();
  }
  const sourceSeeds = [
    {page:7, name:"p7", ranks:rankSeed(dotPoints.p7),
      key:matrix.map(row => row.map(mod29))},
    {page:23, name:"p23", ranks:rankSeed(dotPoints.p23),
      key:matrix.slice().reverse().map(row => row.map(mod29))}
  ];
  const localTests = [];
  const localControls = [];
  for (const source of sourceSeeds) {
    const cipher = corpus.pages[source.page].indices;
    for (const base of [0,1]) {
      const seed = source.ranks.map(value => value - base);
      for (const rowUpdate of [false,true]) {
        const key = makeStateKey(seed, source.key, rowUpdate, "time");
        for (const sign of [-1,1]) {
          const plain = cipher.map((value,i) => mod29(value - sign * key[i % key.length]));
          localTests.push({
            page:source.page, seedBase:base === 0 ? "one-based" : "zero-based",
            stateUpdate:rowUpdate ? "row" : "column", sign,
            statePeriod:28, keyLength:key.length, ...hillMetrics(plain),
            preview:plain.slice(0,100).map(value => corpus.translit[value]).join("")
          });
          const control = holdout.slice(100,100+cipher.length);
          const planted = control.map((value,i) => mod29(value + sign * key[i % key.length]));
          const recovered = planted.map((value,i) => mod29(value - sign * key[i % key.length]));
          localControls.push(recovered.reduce((sum,value,i) => sum + Number(value === control[i]),0));
        }
      }
    }
  }
  localTests.sort((a,b) => b.bigramPerRune-a.bigramPerRune);

  const globalCipher = corpus.pages.filter(page => page.page <= 55 && page.indices.length)
    .flatMap(page => page.indices);
  const globalPlain = holdout.slice(100,100+globalCipher.length);
  const globalTests = [];
  const globalControls = [];
  for (const source of sourceSeeds) {
    const seed = source.ranks.map(value => value - 1);
    for (const rowUpdate of [false,true]) {
      for (const flatten of ["time","component"]) {
        const key = makeStateKey(seed, source.key, rowUpdate, flatten);
        for (const sign of [-1,1]) {
          const plain = globalCipher.map((value,i) => mod29(value - sign * key[i % key.length]));
          globalTests.push({
            seedSource:source.name, stateUpdate:rowUpdate ? "row" : "column",
            flatten, sign, statePeriod:28, keyLength:key.length,
            ...hillMetrics(plain),
            preview:plain.slice(0,120).map(value => corpus.translit[value]).join("")
          });
          const planted = globalPlain.map((value,i) => mod29(value + sign * key[i % key.length]));
          const recovered = planted.map((value,i) => mod29(value - sign * key[i % key.length]));
          globalControls.push(recovered.reduce((sum,value,i) => sum + Number(value === globalPlain[i]),0));
        }
      }
    }
  }
  globalTests.sort((a,b) => b.bigramPerRune-a.bigramPerRune);
  if (localControls.length !== 16 ||
      localControls.some((x,i) => x !== (i < 8 ? 208 : 213)) ||
      globalControls.length !== 16 || globalControls.some(x => x !== globalCipher.length))
    throw new Error("matrix-state synthetic positive control failed");
  return {
    dotRankSeeds:{p7:sourceSeeds[0].ranks,p23:sourceSeeds[1].ranks},
    matrixStatePeriod:28,
    generatedKeyLength:140,
    localTests:localTests.length,
    localBest:localTests[0],
    localBestByPage:[7,23].map(page => localTests.filter(x=>x.page===page)
      .sort((a,b)=>b.bigramPerRune-a.bigramPerRune)[0]),
    globalTests:globalTests.length,
    globalBest:globalTests[0],
    globalHeldOutEnglishControl:hillMetrics(globalPlain),
    positiveControls:{
      localExact:localControls.filter((x,i) => x === (i < 8 ? 208 : 213)).length,
      localTotal:localControls.length,
      globalExact:globalControls.filter(x=>x===globalCipher.length).length,
      globalTotal:globalControls.length
    }
  };
}


summary.hillMatrix = hillMatrixTests();
summary.matrixState = matrixStateTests();
console.log(JSON.stringify(summary, null, 2));
