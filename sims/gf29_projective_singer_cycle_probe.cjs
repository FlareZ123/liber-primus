'use strict';

/**
 * Source-derived projective quotient test for the p3/p39 GF(29^2) root.
 *
 * p3 gives u^2 = 3u + 8; the cross-triad grid root z = 23 + 27u is
 * primitive in GF(29^2). Multiplication by z on coefficient pairs is
 * M = [[23,13],[27,17]] mod 29. Its projective action has order 30 on
 * P^1(F_29), naturally 29 finite GP labels plus infinity.
 *
 * Tests:
 *   - the natural 29-point completion of M^j on F_29, period 30;
 *   - direct and Ac=24-centred projective coordinates;
 *   - forward/reverse action and book/page clocks (8 variants);
 *   - the finite projective orbit of 24 as a 30-step additive key schedule,
 *     with GP-index, Ac-centred, prime-mod-29, and phi-prime-mod-29 projections,
 *     both signs and book/page clocks (32 variants).
 *
 * Uses the original canonical LP2 corpus and the solved LP1/LP2 reference.
 * No parameters are fitted to LP2. This is a bounded hypothesis test, not a
 * claim that the post-selected field root was intended as a cipher key.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const referenceText = read('resources/liber-primus/lp1-plaintext-reference.txt');
const MOD = 29;
const mod = x => ((x % MOD) + MOD) % MOD;

function inverse(x) {
  for (let y = 1; y < MOD; y++) if (mod(x * y) === 1) return y;
  throw new Error('non-invertible element');
}

function matrixMultiply(A, B) {
  return [
    [
      mod(A[0][0] * B[0][0] + A[0][1] * B[1][0]),
      mod(A[0][0] * B[0][1] + A[0][1] * B[1][1])
    ],
    [
      mod(A[1][0] * B[0][0] + A[1][1] * B[1][0]),
      mod(A[1][0] * B[0][1] + A[1][1] * B[1][1])
    ]
  ];
}

function matrixInverse(A) {
  const d = mod(A[0][0] * A[1][1] - A[0][1] * A[1][0]);
  const di = inverse(d);
  return [
    [mod(A[1][1] * di), mod(-A[0][1] * di)],
    [mod(-A[1][0] * di), mod(A[0][0] * di)]
  ];
}

const M = [[23, 13], [27, 17]];
const M_INV = matrixInverse(M);
const IDENTITY = [[1, 0], [0, 1]];
const TRANSLATE_AC_TO_ZERO = [[1, mod(-24)], [0, 1]];
const TRANSLATE_ZERO_TO_AC = matrixInverse(TRANSLATE_AC_TO_ZERO);
const AC_CENTRED_M = matrixMultiply(
  matrixMultiply(TRANSLATE_AC_TO_ZERO, M),
  TRANSLATE_ZERO_TO_AC
);

function scalarMatrix(A) {
  return A[0][1] === 0 && A[1][0] === 0 && A[0][0] === A[1][1];
}

function assertProjectiveOrder30() {
  let P = IDENTITY;
  for (let k = 1; k <= 30; k++) {
    P = matrixMultiply(P, M);
    if (k < 30) assert.equal(scalarMatrix(P), false, 'M became scalar at ' + k);
  }
  assert.equal(scalarMatrix(P), true);
  assert.equal(P[0][0], 11); // M^30 = 11 I over F_29.
}

function projectiveOrbit(start, A) {
  const seen = new Set();
  const out = [];
  let x = start; // null represents infinity.
  while (!seen.has(String(x))) {
    seen.add(String(x));
    out.push(x);
    const a = x === null ? 1 : x;
    const b = x === null ? 0 : 1;
    const ap = mod(A[0][0] * a + A[0][1] * b);
    const bp = mod(A[1][0] * a + A[1][1] * b);
    x = bp === 0 ? null : mod(ap * inverse(bp));
  }
  return { orbit: out, returnedTo: x };
}

/**
 * Complete the projective permutation on the 29 finite points by deleting
 * infinity from domain and codomain and closing the unique missing edge:
 * the finite pole (which maps to infinity) maps instead to M^j(infinity).
 * This is the unique completion that uses the projective image of infinity.
 */
function projectivePermutation(A) {
  const forward = [];
  const backward = Array(MOD);
  for (let x = 0; x < MOD; x++) {
    const den = mod(A[1][0] * x + A[1][1]);
    const y = den === 0
      ? mod(A[0][0] * inverse(A[1][0]))
      : mod((A[0][0] * x + A[0][1]) * inverse(den));
    forward[x] = y;
  }
  assert.equal(new Set(forward).size, MOD, 'projective completion is not bijective');
  for (let x = 0; x < MOD; x++) backward[forward[x]] = x;
  return { forward, backward };
}

function parseGp(text) {
  // Remove editorial continuation labels, headings and long hexadecimal hash.
  const prose = text.split(/\r?\n/)
    .filter(line => !line.trim().startsWith('#') && !line.trim().startsWith('['))
    .join(' ')
    .replace(/[0-9a-f]{64,}/gi, ' ')
    .toUpperCase();
  const tokens = corpus.translit
    .map((s, i) => ({ s, i }))
    .sort((a, b) => b.s.length - a.s.length);
  const out = [];
  for (const word of prose.match(/[A-Z]+/g) || []) {
    let i = 0;
    while (i < word.length) {
      const token = tokens.find(t => word.startsWith(t.s, i));
      if (token) {
        out.push(token.i);
        i += token.s.length;
      } else {
        i++;
      }
    }
  }
  return out;
}

const pages = corpus.pages.filter(p => p.status === 'unsolved' && p.indices?.length);
const positions = [];
for (const page of pages) {
  for (let local = 0; local < page.indices.length; local++) {
    positions.push({ page: page.page, local, c: page.indices[local] });
  }
}
const original = positions.map(p => p.c);
assert.equal(pages.length, 55);
assert.equal(original.length, 12956);

const gpReference = parseGp(referenceText);
const split = Math.floor(gpReference.length * 0.8);
const train = gpReference.slice(0, split);
const holdout = gpReference.slice(split);
const trigramCounts = new Map();
let trigramTotal = 0;
for (let i = 0; i + 2 < train.length; i++) {
  const k = train[i] * 841 + train[i + 1] * 29 + train[i + 2];
  trigramCounts.set(k, (trigramCounts.get(k) || 0) + 1);
  trigramTotal++;
}
const SMOOTH = 0.05;
const TRIGRAM_SPACE = 29 ** 3;

function score(sequence) {
  const counts = Array(29).fill(0);
  for (const x of sequence) counts[x]++;
  const n = sequence.length;
  let logp = 0;
  for (let i = 0; i + 2 < n; i++) {
    const k = sequence[i] * 841 + sequence[i + 1] * 29 + sequence[i + 2];
    logp += Math.log(
      ((trigramCounts.get(k) || 0) + SMOOTH) /
      (trigramTotal + SMOOTH * TRIGRAM_SPACE)
    );
  }
  return {
    ioc: counts.reduce((s, c) => s + c * (c - 1), 0) / (n * (n - 1)),
    trigramNatsPerRune: logp / (n - 2),
    top12Mass: counts.slice().sort((a, b) => b - a).slice(0, 12)
      .reduce((s, c) => s + c, 0) / n
  };
}

function projectiveSubstitutionTests() {
  const results = [];
  for (const [coordinate, base] of [
    ['direct-GP-coordinate', M],
    ['Ac-centred-coordinate', AC_CENTRED_M]
  ]) {
    for (const [orientation, step] of [
      ['forward', base],
      ['reverse', matrixInverse(base)]
    ]) {
      for (const clock of ['book', 'page']) {
        const maps = [];
        let power = IDENTITY;
        for (let phase = 0; phase < 30; phase++) {
          maps.push(projectivePermutation(power));
          power = matrixMultiply(power, step);
        }
        let phase = 0;
        let lastPage = null;
        const decoded = [];
        for (let i = 0; i < positions.length; i++) {
          if (clock === 'page' && positions[i].page !== lastPage) {
            phase = 0;
            lastPage = positions[i].page;
          }
          decoded.push(maps[phase].backward[original[i]]);
          phase = (phase + 1) % 30;
        }
        let checkPhase = 0;
        let checkPage = null;
        for (let i = 0; i < positions.length; i++) {
          if (clock === 'page' && positions[i].page !== checkPage) {
            checkPhase = 0;
            checkPage = positions[i].page;
          }
          assert.equal(maps[checkPhase].forward[decoded[i]], original[i]);
          checkPhase = (checkPhase + 1) % 30;
        }
        results.push({
          coordinate, orientation, clock,
          ...score(decoded),
          exactOriginalReencryption: true
        });
      }
    }
  }
  return results;
}

function additiveProjectiveOrbitTests() {
  const results = [];
  const primes = corpus.prime;
  for (const [orientation, step] of [['forward', M], ['reverse', M_INV]]) {
    const { orbit } = projectiveOrbit(24, step);
    assert.equal(orbit.length, 30);
    const keyMaps = [
      ['GP-index', x => x === null ? 0 : x],
      ['Ac-centred', x => x === null ? 0 : mod(24 - x)],
      ['prime-mod-29', x => x === null ? 0 : mod(primes[x])],
      ['phi-prime-mod-29', x => x === null ? 0 : mod(primes[x] - 1)]
    ];
    for (const [mapping, map] of keyMaps) {
      for (const sign of [1, -1]) {
        for (const clock of ['book', 'page']) {
          const pageOffset = new Map();
          let bookOffset = 0;
          const decoded = [];
          const keyAt = [];
          for (const position of positions) {
            let offset;
            if (clock === 'book') {
              offset = bookOffset++;
            } else {
              offset = pageOffset.get(position.page) || 0;
              pageOffset.set(position.page, offset + 1);
            }
            const key = map(orbit[offset % orbit.length]);
            keyAt.push(key);
            decoded.push(mod(position.c - sign * key));
          }
          assert.ok(decoded.every((p, i) => mod(p + sign * keyAt[i]) === original[i]));
          results.push({
            orientation, mapping, sign, clock,
            ...score(decoded),
            exactOriginalReencryption: true
          });
        }
      }
    }
  }
  return results;
}

function main() {
  assertProjectiveOrder30();
  const { orbit, returnedTo } = projectiveOrbit(24, M);
  assert.equal(orbit.length, 30);
  assert.equal(returnedTo, 24);
  const projective = projectiveSubstitutionTests();
  const additive = additiveProjectiveOrbitTests();
  const all = [
    ...projective.map(x => ({ family: 'projective-permutation', ...x })),
    ...additive.map(x => ({ family: 'projective-orbit-additive-key', ...x }))
  ];
  all.sort((a, b) => b.trigramNatsPerRune - a.trigramNatsPerRune);
  const result = {
    source: 'resources/liber-primus/lp2-corpus.json',
    fieldRoot: 'z = 23 + 27u, u^2 = 3u + 8 over GF(29)',
    multiplicationMatrix: M,
    determinant: mod(M[0][0] * M[1][1] - M[0][1] * M[1][0]),
    projectiveOrder: 30,
    M30: [[11, 0], [0, 11]],
    orbitFromAc24: orbit.map(x => x === null ? 'infinity' : x),
    sourceRunes: original.length,
    sourcePages: pages.length,
    referenceGpSymbols: gpReference.length,
    referenceTrainSymbols: train.length,
    referenceHoldoutSymbols: holdout.length,
    referenceHoldoutScore: score(holdout),
    rawCiphertextScore: score(original),
    testedVariants: all.length,
    projectiveVariants: projective.length,
    additiveVariants: additive.length,
    bestProjective: all.find(x => x.family === 'projective-permutation'),
    bestAdditive: all.find(x => x.family === 'projective-orbit-additive-key'),
    bestOverall: all[0],
    worstOverall: all[all.length - 1],
    allOriginalRoundTripsExact: all.every(x => x.exactOriginalReencryption),
    interpretation: 'All 40 declared source-fixed variants remain ciphertext-like; exact reencryption verifies only the bijective implementation, not key identity.'
  };
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) main();
module.exports = {
  matrixMultiply, matrixInverse, projectiveOrbit, projectivePermutation, score
};
