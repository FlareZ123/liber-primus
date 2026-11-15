'use strict';

// A read-only, source-exact original terminal test. Node.js 22, Windows 11.
// All four-state GF(29) polynomial coefficients are secret and eliminated.
// No plaintext or guessed original key is supplied for p55.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

/** @param {string} name @returns {any} */
function load(name) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources',
    'liber-primus', name), 'utf8'));
}

/** @param {number} x @returns {number} */
function mod(x) { return (x % 29 + 29) % 29; }

const inverses = Array.from({length: 29}, (_, x) => {
  for (let k = 1; k < 29; k++) if (k * x % 29 === 1) return k;
  return 0;
});

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const result = [];
  for (let n = 2; result.length < count; n++) {
    let isPrime = true;
    for (let d = 2; d * d <= n; d++) if (n % d === 0) { isPrime = false; break; }
    if (isPrime) result.push(n);
  }
  return result;
}

/**
 * All monomials of total degree <= degree in the last four residues.
 * Includes constant, linear, repeated-variable and all mixed terms.
 * @param {number} degree @returns {number[][]}
 */
function monomials(degree) {
  const terms = [[]];
  for (let d = 1; d <= degree; d++) {
    /** @param {number[]} arr @param {number} start */
    function visit(arr, start) {
      if (arr.length === d) { terms.push(arr); return; }
      for (let j = start; j < 4; j++) visit([...arr, j], j);
    }
    visit([], 0);
  }
  return terms;
}

/**
 * @param {number[]} seq
 * @param {number} i
 * @param {number[][]} terms
 * @returns {number[]}
 */
function features(seq, i, terms) {
  const lag = [seq[i-1], seq[i-2], seq[i-3], seq[i-4]];
  return terms.map((monomial) =>
    monomial.reduce((v, index) => v * lag[index] % 29, 1));
}

/**
 * Exact incremental GF29 elimination with arbitrary secret coefficients.
 * Returns first genuinely inconsistent recurrence equation, if any.
 * i is a zero-based index into the 180 known-register residues.
 * @param {number[]} seq
 * @param {number[][]} terms
 * @returns {{firstFailure: number | null, rank: number}}
 */
function firstFailure(seq, terms) {
  const d = terms.length;
  const basis = Array(d).fill(null);
  let rank = 0;
  for (let i = 4; i < seq.length; i++) {
    const row = [...features(seq, i, terms), seq[i]];
    let newPivot = false;
    for (let j = 0; j < d; j++) {
      if (row[j] === 0) continue;
      if (basis[j] !== null) {
        const factor = row[j];
        for (let k = j; k <= d; k++) {
          row[k] = mod(row[k] - factor * basis[j][k]);
        }
      } else {
        const inverse = inverses[row[j]];
        assert.ok(inverse !== 0);
        for (let k = j; k <= d; k++) row[k] = row[k] * inverse % 29;
        basis[j] = row;
        rank++;
        newPivot = true;
        break;
      }
    }
    if (!newPivot && row[d] !== 0) return {firstFailure: i, rank};
  }
  return {firstFailure: null, rank};
}

/**
 * Original concentric 32x8 rings. Each ring has 8 independently
 * selected source-corner/direction readouts, with no fitted index shift.
 * @returns {number[][][]}
 */
function ringVariants() {
  const all = [];
  for (let top = 0, left = 0, bottom = 31, right = 7;
       top <= bottom && left <= right;
       top++, left++, bottom--, right--) {
    const clockwise = [];
    for (let x = left; x <= right; x++) clockwise.push(8 * top + x);
    for (let y = top + 1; y <= bottom; y++) clockwise.push(8 * y + right);
    if (bottom > top) for (let x = right - 1; x >= left; x--) {
      clockwise.push(8 * bottom + x);
    }
    if (left < right) for (let y = bottom - 1; y > top; y--) {
      clockwise.push(8 * y + left);
    }
    const corners = [8 * top + left, 8 * top + right,
      8 * bottom + right, 8 * bottom + left];
    const variants = [];
    for (let corner = 0; corner < 4; corner++) {
      for (let sense = 0; sense < 2; sense++) {
        const seq = sense ? [clockwise[0], ...clockwise.slice(1).reverse()]
          : clockwise;
        const pos = seq.indexOf(corners[corner]);
        assert.ok(pos >= 0);
        variants.push([...seq.slice(pos), ...seq.slice(0, pos)]);
      }
    }
    all.push(variants);
  }
  return all;
}

/**
 * @param {number[][]} terms
 * @returns {number[]}
 */
function planted(terms) {
  const coefficients = terms.map((_, i) => (7 * i + 3) % 29);
  const seq = [1, 2, 3, 4];
  for (let i = 4; i < 180; i++) {
    const f = features(seq, i, terms);
    seq.push(f.reduce((v, x, j) => v + x * coefficients[j], 0) % 29);
  }
  return seq;
}

function main() {
  const g = load('lp2-grid-256.json');
  const c = load('lp2-corpus.json');
  assert.equal(g.bytes.length, 256);
  const B = g.bytes;
  const page56 = c.pages.find((p) => p.page === 56);
  const page57 = c.pages.find((p) => p.page === 57);
  const primes = firstPrimes(90);
  let clock = 0;
  const p56Plain = page56.indices.map((v, i) =>
    i === 56 ? v : mod(v - (primes[clock++] - 1)));
  assert.equal(clock, 84);
  assert.equal(page56.indices[56], 0);
  assert.equal(p56Plain.map((i) => c.translit[i]).join(''),
    'ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE');
  assert.equal(page57.indices.length, 95);

  const V = ringVariants();
  assert.deepEqual(V.map((r) => r[0].length), [76, 68, 60, 52]);
  const regs = [['plaintext', p56Plain.concat(page57.indices)],
    ['printed', page56.indices.concat(page57.indices)]];
  const answer = [];
  for (const [degree, expectedTermCount] of [[2, 15], [3, 35]]) {
    const terms = monomials(degree);
    assert.equal(terms.length, expectedTermCount);
    assert.equal(firstFailure(planted(terms), terms).firstFailure, null,
      'source-length planted positive');
    for (const [register, known] of regs) {
      assert.equal(known.length, 180);
      let layouts = 0;
      let exactFits = 0;
      let minFail = 999;
      let maxFail = -1;
      for (let reversed = 0; reversed < 2; reversed++) {
        for (let a = 0; a < 8; a++) {
          for (let b = 0; b < 8; b++) {
            for (let d = 0; d < 8; d++) {
              const layout = (reversed
                ? [V[3][d], V[2][b], V[1][a]]
                : [V[1][a], V[2][b], V[3][d]]).flat();
              const residual = layout.map((index, i) => mod(known[i] - B[index]));
              const result = firstFailure(residual, terms);
              layouts++;
              if (result.firstFailure === null) exactFits++;
              else {
                minFail = Math.min(minFail, result.firstFailure);
                maxFail = Math.max(maxFail, result.firstFailure);
              }
            }
          }
        }
      }
      assert.equal(layouts, 1024);
      assert.equal(exactFits, 0);
      const expected = register === 'plaintext'
        ? degree === 2 ? [19, 19] : [38, 39]
        : degree === 2 ? [19, 19] : [39, 40];
      assert.deepEqual([minFail, maxFail], expected);
      answer.push({register, degree, secretCoefficients: expectedTermCount,
        layouts, exactFits, firstContradictionRange: [minFail, maxFail]});
    }
  }
  console.log(JSON.stringify({status: 'PASS', sourceGrid: '32x8 original bytes',
    knownTerminal: 'p56 85 authenticated plus p57 95 clear', outerUnknown: 76,
    rings: [76, 68, 60, 52], positiveControls: ['quadratic', 'cubic'],
    allSecretOriginalResults: answer}, null, 2));
}

main();
