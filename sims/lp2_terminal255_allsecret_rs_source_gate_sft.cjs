'use strict';

/**
 * Original LP2 terminal 255-rune Reed–Solomon all-secret alphabet gate.
 * Run: node sims/lp2_terminal255_allsecret_rs_source_gate_sft.cjs
 * Read-only; Node.js 22+, no external packages.
 *
 * This tests a CONDITIONAL model, not an authenticated Cicada cipher.
 * Any GP29 label may secretly denote ANY GF(256) byte, provided the
 * same rune has the same distinct byte across the entire codeword.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const page = (n) => corpus.pages.find((p) => p.page === n).indices;
const p55 = page(55);
const p56Cipher = page(56);
const p57Clear = page(57);
assert.deepEqual([p55.length, p56Cipher.length, p57Clear.length], [76, 85, 95]);

const p56Words = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';

/** @param {string} words @returns {number[]} */
function parseGp(words) {
  const tokens = corpus.translit.map((token, i) => ({ token, i }))
    .sort((a, b) => b.token.length - a.token.length);
  const out = [];
  for (const word of words.split(' ')) {
    for (let j = 0; j < word.length;) {
      const t = tokens.find((x) => word.startsWith(x.token, j));
      assert.ok(t, 'Bad GP spelling: ' + word.slice(j));
      out.push(t.i);
      j += t.token.length;
    }
  }
  return out;
}
const p56Plain = parseGp(p56Words);
assert.equal(p56Plain.length, 85);

/** @param {number} n @returns {number[]} */
function firstPrimes(n) {
  const result = [];
  for (let x = 2; result.length < n; x++) {
    let prime = true;
    for (let d = 2; d * d <= x; d++) {
      if (x % d === 0) { prime = false; break; }
    }
    if (prime) result.push(x);
  }
  return result;
}
const primes = firstPrimes(85);
let cursor = 0;
for (let i = 0; i < 85; i++) {
  if (i === 56) {
    assert.equal(p56Cipher[i], 0);
    assert.equal(p56Plain[i], 0);
  } else {
    const decoded = ((p56Cipher[i] - (primes[cursor++] - 1)) % 29 + 29) % 29;
    assert.equal(decoded, p56Plain[i], 'P56 authenticated cipher/known text at ' + i);
  }
}
assert.equal(cursor, 84);

/**
 * GF(2^8) with a declared irreducible polynomial and primitive generator.
 * @param {number} polynomial
 * @param {number} generator
 */
function field(polynomial, generator) {
  /** @param {number} a @param {number} b */
  function multiplySlow(a, b) {
    let out = 0;
    while (b) {
      if (b & 1) out ^= a;
      b >>>= 1;
      a <<= 1;
      if (a & 0x100) a ^= polynomial;
    }
    return out;
  }
  const exp = new Uint16Array(510);
  const log = new Uint16Array(256);
  let x = 1;
  for (let i = 0; i < 255; i++) {
    exp[i] = x;
    log[x] = i;
    x = multiplySlow(x, generator);
  }
  assert.equal(x, 1);
  assert.equal(new Set(exp.slice(0, 255)).size, 255);
  for (let i = 255; i < 510; i++) exp[i] = exp[i - 255];
  return {
    /** @param {number} a @param {number} b */
    multiply: (a, b) => a && b ? exp[log[a] + log[b]] : 0,
    /** @param {number} a */
    inverse: (a) => exp[255 - log[a]],
    /** @param {number} k */
    power: (k) => exp[k % 255],
  };
}

/**
 * A coefficient row at root alpha^k is the sum over every site labelled
 * GP symbol s of alpha^(k*(254-position)). This is linear in all 29
 * entirely unknown, even nonlinear, stationary rune->byte assignments.
 * @param {number[]} tape
 * @param {ReturnType<typeof field>} gf
 * @param {number} startRoot
 * @param {number} rows
 */
function constraintMatrix(tape, gf, startRoot, rows) {
  assert.equal(tape.length, 255);
  return Array.from({ length: rows }, (_, i) => {
    const k = startRoot + i;
    const result = new Uint8Array(29);
    for (let position = 0; position < 255; position++) {
      result[tape[position]] ^= gf.power(k * (254 - position));
    }
    return result;
  });
}

/**
 * Gaussian-elimination rank over GF(256), with no guessed alphabet values.
 * @param {Uint8Array[]} matrix
 * @param {ReturnType<typeof field>} gf
 */
function matrixRank(matrix, gf) {
  const a = matrix.map((v) => Uint8Array.from(v));
  let row = 0;
  for (let col = 0; col < 29; col++) {
    let pivot = row;
    while (pivot < a.length && !a[pivot][col]) pivot++;
    if (pivot === a.length) continue;
    [a[row], a[pivot]] = [a[pivot], a[row]];
    const factor = gf.inverse(a[row][col]);
    for (let j = col; j < 29; j++) a[row][j] = gf.multiply(a[row][j], factor);
    for (let k = row + 1; k < a.length; k++) {
      const m = a[k][col];
      if (!m) continue;
      for (let j = col; j < 29; j++) a[k][j] ^= gf.multiply(m, a[row][j]);
    }
    row++;
    if (row === 29) break;
  }
  return row;
}

/**
 * Direct codeword syndrome under a known byte assignment, used only for
 * independent actual-codeword positive controls.
 * @param {number[]} tape
 * @param {number[]} assignment
 * @param {ReturnType<typeof field>} gf
 * @param {number} root
 */
function evaluate(tape, assignment, gf, root) {
  const x = gf.power(root);
  let total = 0;
  for (const label of tape) total = gf.multiply(total, x) ^ assignment[label];
  return total;
}

const summary = [];
for (const spec of [
  { polynomial: 0x11d, generator: 2, name: 'QR-field' },
  { polynomial: 0x11b, generator: 3, name: 'AES-field' },
]) {
  const gf = field(spec.polynomial, spec.generator);

  // True nonzero injective 3-symbol codewords. Period 3 divides 255.
  // Roots 1..75 vanish for any three assigned distinct bytes; root 0
  // additionally needs the three assigned bytes to XOR to zero.
  const planted = Array.from({ length: 255 }, (_, i) => i % 3);
  for (const { start, byteValues } of [
    { start: 0, byteValues: [7, 11, 12] },
    { start: 1, byteValues: [7, 11, 31] },
  ]) {
    assert.equal(new Set(byteValues).size, 3);
    for (let k = start; k < start + 75; k++) {
      assert.equal(evaluate(planted, byteValues, gf, k), 0,
        'Nonconstant RS-positive at root ' + k);
    }
  }

  for (const version of [
    { name: 'original-p56-cipher', p56: p56Cipher },
    { name: 'authenticated-p56-plaintext', p56: p56Plain },
  ]) {
    for (const reversed of [false, true]) {
      for (const start of [0, 1]) {
        const ranks = {};
        const absent = [];
        for (let omitted = 0; omitted < p55.length; omitted++) {
          const tape = [
            ...p55.slice(0, omitted),
            ...p55.slice(omitted + 1),
            ...version.p56,
            ...p57Clear,
          ];
          if (reversed) tape.reverse();
          assert.equal(tape.length, 255);
          const present = new Set(tape).size;
          const expectedRank = present - (start === 1 ? 1 : 0);

          // Only 30 or 29 consecutive checks suffice to attain the
          // maximum possible rank. All 75 checks therefore have the
          // SAME nullspace: zero labels (root 0), constant labels (root 1).
          const matrix = constraintMatrix(tape, gf, start, start === 0 ? 30 : 29);
          const rank = matrixRank(matrix, gf);
          assert.equal(rank, expectedRank, JSON.stringify({
            field: spec.name, version: version.name, reversed, start, omitted
          }));
          assert.ok(present >= 28);
          if (present === 28) absent.push(omitted);
          ranks[rank] = (ranks[rank] || 0) + 1;
        }
        summary.push({
          field: spec.name, p56: version.name, reversed,
          rootStart: start, omissionsChecked: 76, rankHistogram: ranks,
          missingSymbolOmissions: absent,
          injectiveStationaryLabelingPossible: false,
        });
      }
    }
  }
}
assert.equal(summary.length, 16);
assert.equal(summary.reduce((n, item) => n + item.omissionsChecked, 0), 1216);
console.log(JSON.stringify({
  case: 'Original LP2 75 (one removed p55 rune) + 85 + 95 = 255',
  note: 'Source geometry motivates the test but supplies no RS opcode.',
  status: 'PASS; zero injective stationary 29-rune to GF256 labelings',
  positive: 'Nonconstant 255-position 3-symbol RS plants pass 75/75 checks in both fields and root conventions',
  cases: summary,
}, null, 2));
