'use strict';

/**
 * Original LP2 exact all-initial-state test for the 1033*3301 modular square.
 *
 * Runs with Node.js 22 from the repository root. Standard library only.
 * Input: canonical original LP2 GP29 integer corpus, physical pages 0-55.
 * Four specified hypotheses: direct/delta symbol register, +/- GP29 key.
 * All 3,409,933 possible initial integer states and all F bypass histories
 * are propagated exactly as sets of states, without plaintext scoring.
 * This is a deliberately bounded hypothesis, not a recovered Cicada cipher.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');

const M = 1033 * 3301;
const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const source = corpus.pages.filter(p => p.page >= 0 && p.page <= 55)
  .flatMap(p => p.indices);
const p57 = corpus.pages.find(p => p.page === 57).indices;

assert.equal(M, 3409933);
assert(M * M < Number.MAX_SAFE_INTEGER);
assert.equal(source.length, 12956);
assert.equal(p57.length, 95);
assert(source.every(x => Number.isInteger(x) && x >= 0 && x < 29));

/** @param {number} n @returns {boolean} */
function isPrime(n) {
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return n >= 2;
}
assert(isPrime(1033) && isPrime(3301));

/**
 * @param {number} state
 * @param {number} sign
 * @returns {number}
 */
function key(state, sign) {
  const digit = state % 29;
  return sign === 1 ? digit : (29 - digit) % 29;
}

/**
 * Propagate every possible modulus-state and every possible transparent-F
 * path under the authentic p56 rule: plaintext F (0) emits cipher 0 and
 * pauses the key clock; ordinary non-F emits P+/-K modulo29 and advances it.
 * Every cipher 0 permits transparent F; if K is nonzero it *also* permits a
 * normal non-F whose encrypted value happens to be 0. Both are retained.
 *
 * Delta mode reads cipher C[i]-C[i-1] for original i>=1; C[0] is the IV.
 *
 * @param {number[]} cipher
 * @param {'delta'|'direct'} register
 * @param {1|-1} sign
 * @returns {{ firstOnlyZero:number, finalStates:number[], survivorCounts:number[], lastNonzeroIndex:number }}
 */
function allStates(cipher, register, sign) {
  const activeA = new Uint32Array(M);
  const activeB = new Uint32Array(M);
  const stamped = new Uint32Array(M);
  for (let x = 0; x < M; x++) activeA[x] = x;
  let active = activeA, next = activeB, length = M;
  let firstOnlyZero = -1, lastNonzeroIndex = -1;
  const survivorCounts = [];
  const start = register === 'delta' ? 1 : 0;

  for (let i = start; i < cipher.length; i++) {
    const observed = register === 'delta'
      ? (cipher[i] - cipher[i - 1] + 29) % 29
      : cipher[i];
    const stamp = i + 1;
    let nextLength = 0;

    for (let k = 0; k < length; k++) {
      const x = active[k];
      const shift = key(x, sign);

      if (observed === 0 && stamped[x] !== stamp) {
        stamped[x] = stamp;
        next[nextLength++] = x;
      }
      if (observed !== shift) {
        const y = (x * x) % M;
        if (stamped[y] !== stamp) {
          stamped[y] = stamp;
          next[nextLength++] = y;
        }
      }
    }

    assert(nextLength > 0, 'zero state must remain feasible');
    [active, next] = [next, active];
    length = nextLength;
    if (length !== 1 || active[0] !== 0) {
      lastNonzeroIndex = i;
    } else if (firstOnlyZero < 0) {
      firstOnlyZero = i;
    }
    if ([start, start + 1, 20, 40, 80, 160, 320, 640, 1000, cipher.length - 1].includes(i)) {
      survivorCounts.push([i, length]);
    }
  }
  return {
    firstOnlyZero,
    lastNonzeroIndex,
    finalStates: Array.from(active.subarray(0, length)),
    survivorCounts,
  };
}

/**
 * Positive-control encoder; F emit/skip history is known to the encoder.
 * @param {number[]} plain
 * @param {'delta'|'direct'} register
 * @param {1|-1} sign
 * @param {number} seed
 * @param {number} iv
 * @returns {{ cipher:number[], endState:number }}
 */
function encrypt(plain, register, sign, seed, iv) {
  let x = seed;
  let previous = iv;
  const cipher = register === 'delta' ? [iv] : [];
  for (const p of plain) {
    let output;
    if (p === 0) {
      output = 0;
    } else {
      output = (p + key(x, sign)) % 29;
      x = (x * x) % M;
    }
    const emitted = register === 'delta' ? (previous + output) % 29 : output;
    cipher.push(emitted);
    previous = emitted;
  }
  return { cipher, endState: x };
}

/** @param {number[]} symbols @returns {number} */
function ioc(symbols) {
  const counts = new Uint32Array(29);
  for (const rune of symbols) counts[rune]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (symbols.length * (symbols.length - 1));
}

const expected = [
  ['delta', 1, 428, 427],
  ['delta', -1, 365, 364],
  ['direct', 1, 786, 785],
  ['direct', -1, 968, 967],
];
const results = [];
for (const [register, sign, firstOnlyZero, lastNonzeroIndex] of expected) {
  const actual = allStates(source, register, sign);
  assert.equal(actual.firstOnlyZero, firstOnlyZero);
  assert.equal(actual.lastNonzeroIndex, lastNonzeroIndex);
  assert.deepEqual(actual.finalStates, [0]);

  // Nonzero source-derived initial key and native clear GP text; verifies
  // exact forward encryption and blind all-seed retention of true state.
  const plantPlain = p57.concat(p57);
  const plant = encrypt(plantPlain, register, sign, 3299, source[0]);
  const recoveredStates = allStates(plant.cipher, register, sign);
  assert(recoveredStates.finalStates.includes(plant.endState));
  assert.notEqual(plant.endState, 0);
  assert.equal(plant.cipher.length, register === 'delta' ? 191 : 190);

  results.push({
    register,
    sign,
    firstOnlyZero,
    lastNonzeroIndex,
    finalStates: actual.finalStates,
    survivorCounts: actual.survivorCounts,
    nativePlantSymbols: plantPlain.length,
    nativePlantTrueEndStateRetained: true,
  });
}
// Source-visible red chapter boundaries. Each chapter may independently reset
// the entire, secret modulus state. This is strictly more permissive than the
// book-global clock and needs no language/seed fitting.
const chapterCuts = [0, 729, 1874, 3603, 5506, 6527, 7960, 9640, 12648, 12956];
const expectedChapterFinalStateCounts = {
  'delta+': [1, 1, 1, 1, 1, 1, 1, 1, 26],
  'delta-': [1, 1, 1, 1, 1, 1, 1, 1, 18],
  'direct+': [17, 1, 1, 1, 1, 1, 1, 1, 93],
  'direct-': [17, 1, 1, 1, 1, 1, 1, 1, 91],
};
const chapterResults = [];
for (let j = 0; j < chapterCuts.length - 1; j++) {
  const originalChapter = source.slice(chapterCuts[j], chapterCuts[j + 1]);
  const row = { chapter: j + 1, runeCount: originalChapter.length, survivorCounts: {} };
  for (const register of ['delta', 'direct']) {
    for (const sign of [1, -1]) {
      const mode = register + (sign === 1 ? '+' : '-');
      const actual = allStates(originalChapter, register, sign);
      assert.equal(actual.finalStates.length, expectedChapterFinalStateCounts[mode][j]);
      if (actual.finalStates.length === 1) assert.deepEqual(actual.finalStates, [0]);
      row.survivorCounts[mode] = actual.finalStates.length;
    }
  }
  chapterResults.push(row);
}
assert.deepEqual(chapterResults.map(r => r.runeCount),
  [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308]);

const differences = source.slice(1).map((c, i) => (c - source[i] + 29) % 29);
console.log(JSON.stringify({
  source: 'original 56 unsolved LP2 pages p0-p55; 12956 GP29 runes',
  sourceGp29Ioc: ioc(source),
  zeroKeyDifferenceGp29Ioc: ioc(differences),
  mathematicalCondition: 'N is squarefree, so a state reaching zero implies initial state zero',
  result: 'all nonzero seeds/state paths eliminated in four declared F-bypass models',
  cases: results,
  sourceChapterIndependentSecretSeedCases: chapterResults,
}, null, 2));
