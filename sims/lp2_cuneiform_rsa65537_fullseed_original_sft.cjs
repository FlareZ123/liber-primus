'use strict';

/**
 * Exact original LP2 test of the source-derived, conditional RSA-state cipher:
 *
 * N = 1033 * 3301 (both printed original LP2 cuneiform numerals)
 * e = 65537 (authentic Cicada RSA public-key exponent)
 * x[t+1] = x[t]^e mod N, key[t] = x[t] mod 29
 * C[t] = P[t] +/- key[t] mod 29.
 *
 * Covers every possible seed under (a) an uninterrupted glyph clock with
 * ordinary A/I/O singleton plaintext and (b) the historically solved p56
 * plaintext-F literal/skip rule, with every possible ambiguous skip.
 *
 * Run: node sims/lp2_cuneiform_rsa65537_fullseed_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');

const P = 1033;
const Q = 3301;
const N = P * Q;
const EXPONENT = 65537;
const INV_P_MOD_Q = 2010;
const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const source = corpus.pages.filter(page => page.page >= 0 && page.page <= 55)
  .flatMap(page => page.indices);
const originalP57 = corpus.pages.find(page => page.page === 57).indices;
assert.equal(N, 3409933);
assert.equal(source.length, 12956);
assert.equal(originalP57.length, 95);
assert.deepEqual(source.slice(0, 10), [15, 8, 18, 3, 6, 19, 27, 0, 15, 26]);
assert.equal(P * INV_P_MOD_Q % Q, 1);

/** @param {number} a @param {number} exponent @param {number} mod */
function modPow(a, exponent, mod) {
  let result = 1;
  while (exponent > 0) {
    if (exponent % 2 === 1) result = result * a % mod;
    a = a * a % mod;
    exponent = Math.floor(exponent / 2);
  }
  return result;
}

const nextState = new Uint32Array(N);
for (let state = 0; state < N; state++) {
  nextState[state] = modPow(state, EXPONENT, N);
}
assert.equal(nextState[0], 0);
assert.equal(nextState[637362], 1506115);
assert.equal(nextState[1506115], 637362);
assert.equal(637362 % 29, 0);
assert.equal(1506115 % 29, 0);

const singletonPositions = [176, 244, 350, 530, 644, 792, 967, 1025];
const singletonSymbols = singletonPositions.map(position => source[position]);
assert.deepEqual(singletonSymbols, [28, 15, 9, 1, 0, 21, 8, 7]);

/**
 * Complete-state RSA clock at a fixed glyph offset, reduced modulo P and Q,
 * and recombined by exact CRT. Zero residues are explicitly preserved.
 * @param {number} index
 */
function positionTables(index) {
  const aExponent = modPow(EXPONENT, index, P - 1);
  const bExponent = modPow(EXPONENT, index, Q - 1);
  return {
    a: Uint16Array.from({length: P}, (_, r) => r ? modPow(r, aExponent, P) : 0),
    b: Uint16Array.from({length: Q}, (_, r) => r ? modPow(r, bExponent, Q) : 0),
  };
}
const tables = singletonPositions.map(positionTables);

/** @param {number} a @param {number} b */
function crt(a, b) {
  let t = (b - a) * INV_P_MOD_Q % Q;
  if (t < 0) t += Q;
  return a + P * t;
}
/** @param {number} seed @param {number} index */
function stateAt(seed, index) {
  const table = tables[index];
  return crt(table.a[seed % P], table.b[seed % Q]);
}

/** @param {number[]} observed @param {1|-1} sign */
function singletonSieve(observed, sign) {
  const counts = Array(singletonPositions.length).fill(0);
  const fullSeeds = [];
  for (let seed = 0; seed < N; seed++) {
    for (let k = 0; k < observed.length; k++) {
      const pad = stateAt(seed, k) % 29;
      const plaintext = (observed[k] - sign * pad + 58) % 29;
      if (plaintext !== 24 && plaintext !== 10 && plaintext !== 3) break;
      counts[k]++;
      if (k === observed.length - 1) fullSeeds.push(seed);
    }
  }
  return {counts, fullSeeds};
}

const noBypass = {
  positive: singletonSieve(singletonSymbols, 1),
  negative: singletonSieve(singletonSymbols, -1),
};
assert.deepEqual(noBypass.positive.counts,
  [352752, 36244, 3773, 363, 51, 4, 0, 0]);
assert.deepEqual(noBypass.negative.counts,
  [352752, 36201, 3792, 383, 53, 7, 1, 0]);
assert.deepEqual(noBypass.positive.fullSeeds, []);
assert.deepEqual(noBypass.negative.fullSeeds, []);

// Plant: all eight original-shape singleton positions decode as ordinary A/I/O.
for (const sign of [1, -1]) {
  let directState = 3299;
  const planted = singletonPositions.map((position, k) => {
    for (let i = k === 0 ? 0 : singletonPositions[k - 1]; i < position; i++) {
      directState = nextState[directState];
    }
    assert.equal(directState, stateAt(3299, k));
    const plain = [24, 10, 3][k % 3];
    return (plain + sign * (directState % 29) + 29) % 29;
  });
  const sift = singletonSieve(planted, sign);
  assert(sift.fullSeeds.includes(3299));
}

/**
 * Exact set propagation: original p56's plaintext F emits zero without
 * consuming key. A ciphertext zero can ALSO encrypt a non-F plaintext
 * whenever its key shift is nonzero. Both branches are retained.
 *
 * @param {number[]} cipher
 * @param {1|-1} sign
 */
function allStateFBypass(cipher, sign) {
  let active = new Uint32Array(N);
  let buffer = new Uint32Array(N);
  const stamped = new Uint32Array(N);
  for (let seed = 0; seed < N; seed++) active[seed] = seed;
  let length = N;
  const checkpoints = [];
  for (let i = 0; i < cipher.length; i++) {
    const glyph = cipher[i], tag = i + 1;
    let nextLength = 0;
    for (let k = 0; k < length; k++) {
      const state = active[k];
      const pad = state % 29;
      const shift = sign === 1 ? pad : (29 - pad) % 29;

      // Literal-F branch (plaintext 0; output 0; key not advanced).
      if (glyph === 0 && stamped[state] !== tag) {
        stamped[state] = tag;
        buffer[nextLength++] = state;
      }

      // Non-F branch requires plaintext != 0 and always advances key.
      if (glyph !== shift) {
        const next = nextState[state];
        if (stamped[next] !== tag) {
          stamped[next] = tag;
          buffer[nextLength++] = next;
        }
      }
    }
    [active, buffer] = [buffer, active];
    length = nextLength;
    if ([1000, 2000, 5000, 10000, 12955].includes(i)) {
      checkpoints.push([i, length]);
    }
  }
  return {
    final: Array.from(active.subarray(0, length)).sort((a, b) => a - b),
    checkpoints,
  };
}

const bypassPositive = allStateFBypass(source, 1);
const bypassNegative = allStateFBypass(source, -1);
assert.deepEqual(bypassPositive.checkpoints,
  [[1000, 4], [2000, 3], [5000, 3], [10000, 3], [12955, 3]]);
assert.deepEqual(bypassNegative.checkpoints,
  [[1000, 11], [2000, 3], [5000, 3], [10000, 3], [12955, 3]]);
const degenerate = [0, 637362, 1506115];
assert.deepEqual(bypassPositive.final, degenerate);
assert.deepEqual(bypassNegative.final, degenerate);

/**
 * Independently supplied original p57 GP-language plaintext, with authentic
 * p56 F passthrough, secret nonzero RSA state and both key signs.
 * @param {number[]} plaintext
 * @param {1|-1} sign
 * @param {number} seed
 */
function encrypt(plaintext, sign, seed) {
  let state = seed;
  const ciphertext = [];
  for (const symbol of plaintext) {
    if (symbol === 0) {
      ciphertext.push(0);
    } else {
      ciphertext.push((symbol + sign * (state % 29) + 29) % 29);
      state = nextState[state];
    }
  }
  return {ciphertext, endState: state};
}
for (const sign of [1, -1]) {
  const plant = encrypt(originalP57.concat(originalP57), sign, 3299);
  assert.notEqual(plant.endState, 0);
  const recoveredStates = allStateFBypass(plant.ciphertext, sign);
  assert(recoveredStates.final.includes(plant.endState));
}

/** @param {number[]} tape */
function ioc(tape) {
  const count = Array(29).fill(0);
  for (const rune of tape) count[rune]++;
  return count.reduce((sum, n) => sum + n * (n - 1), 0) /
    (tape.length * (tape.length - 1));
}
assert(Math.abs(ioc(source) - 0.03447839786450569) < 1e-12);
console.log(JSON.stringify({
  modulus: N,
  sourcePrimes: [P, Q],
  authenticatedRsaPublicExponent: EXPONENT,
  originalCipherRunes: source.length,
  firstEightOriginalSingletonPositions: singletonPositions,
  noBypassAllSeedSieve: noBypass,
  strictHistoricalFBypass: {
    positive: bypassPositive,
    negative: bypassNegative,
    allSurvivorsEmitExactlyOriginalCiphertext: true,
  },
  positiveControls: 'RSA CRT exact-clock plant and 190 solved-p57 native-GP F-bypass plant pass both signs',
  originalPlaintextRecovered: false,
}, null, 2));
