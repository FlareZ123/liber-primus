'use strict';

/**
 * Source-original 238-degree table-factor erasure test.
 * Tests p55 as completely unknown and fits only 18 known p56/p57 runes.
 * Node.js 22, CommonJS, no third-party dependencies.
 */

const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

/** @param {string} fileName @returns {any} */
function readJSON(fileName) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', fileName), 'utf8'));
}

/** @param {number} value @returns {number} */
function mod(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} value @returns {number} */
function inverse(value) {
  for (let i = 1; i < 29; i++) if (mod(value * i) === 1) return i;
  throw new Error('Noninvertible GF29 coefficient');
}

/**
 * Highest-degree coefficient first throughout.
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number[]}
 */
function multiply(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) out[i + j] = mod(out[i + j] + a[i] * b[j]);
  }
  return out;
}

/**
 * @param {number[]} numerator
 * @param {number[]} divisor
 * @returns {number[]}
 */
function divideExactly(numerator, divisor) {
  const remainder = numerator.slice();
  const q = Array(numerator.length - divisor.length + 1).fill(0);
  const topInverse = inverse(divisor[0]);
  for (let i = 0; i < q.length; i++) {
    const scalar = mod(remainder[i] * topInverse);
    q[i] = scalar;
    for (let j = 0; j < divisor.length; j++) {
      remainder[i + j] = mod(remainder[i + j] - scalar * divisor[j]);
    }
  }
  assert(remainder.slice(q.length).every(x => x === 0), 'Source table must divide exactly');
  return q;
}

/** @param {number} count @returns {number[]} */
function primes(count) {
  const out = [];
  for (let n = 2; out.length < count; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) { prime = false; break; }
    }
    if (prime) out.push(n);
  }
  return out;
}

/** @returns {number[][]} */
function ringPositions() {
  const out = [];
  for (let d = 0; d < 4; d++) {
    const ring = [];
    for (let c = d; c < 8 - d; c++) ring.push(d * 8 + c);
    for (let r = d + 1; r < 32 - d; r++) ring.push(r * 8 + 7 - d);
    for (let c = 6 - d; c >= d; c--) ring.push((31 - d) * 8 + c);
    for (let r = 30 - d; r > d; r--) ring.push(r * 8 + d);
    out.push(ring);
  }
  return out;
}

/**
 * @param {number[][]} rings
 * @param {number} corner
 * @param {number} direction
 * @returns {number[]}
 */
function orientRings(rings, corner, direction) {
  const addresses = [];
  for (let d = 0; d < 4; d++) {
    const ring = rings[d];
    const corners = [[d, d], [d, 7 - d], [31 - d, 7 - d], [31 - d, d]];
    const first = ring.findIndex(pos =>
      Math.floor(pos / 8) === corners[corner][0] && pos % 8 === corners[corner][1]
    );
    assert(first >= 0);
    for (let n = 0; n < ring.length; n++) {
      addresses.push(ring[(first + direction * n + 4 * ring.length) % ring.length]);
    }
  }
  assert.equal(addresses.length, 256);
  assert.equal(new Set(addresses).size, 256);
  return addresses;
}

/**
 * Coefficient row for a degree-17 multiplier times fixed degree-238 Q.
 * @param {number} pos
 * @param {number[]} factor
 * @returns {number[]}
 */
function equationRow(pos, factor) {
  return Array.from({ length: 18 }, (_, j) => {
    const index = pos - j;
    return index >= 0 && index < factor.length ? factor[index] : 0;
  });
}

/**
 * Pivot selection depends only on known cell addresses, never known values.
 * Once rank 18 is reached, predict every untouched known cell and the 76 unknown cells.
 * @param {Array<[number,number]>} known
 * @param {number[]} factor
 * @returns {{training: number[], heldout: number, matched: number, firstMiss: number, predicted: number[]}}
 */
function fitAndPredict(known, factor) {
  /** @type {number[][]} */
  const basis = [];
  /** @type {number[]} */
  const pivots = [];
  const training = [];
  for (let i = 0; i < known.length; i++) {
    const [position, value] = known[i];
    const row = [...equationRow(position, factor), value];
    for (let k = 0; k < basis.length; k++) {
      const col = pivots[k];
      const weight = row[col];
      if (weight !== 0) {
        for (let j = col; j <= 18; j++) row[j] = mod(row[j] - weight * basis[k][j]);
      }
    }
    const col = row.findIndex((v, j) => j < 18 && v !== 0);
    if (col < 0) continue;
    const scalar = inverse(row[col]);
    for (let j = col; j <= 18; j++) row[j] = mod(row[j] * scalar);
    let insertion = pivots.findIndex(p => p > col);
    if (insertion < 0) insertion = pivots.length;
    pivots.splice(insertion, 0, col);
    basis.splice(insertion, 0, row);
    training.push(i);
    if (basis.length === 18) break;
  }
  assert.equal(basis.length, 18, 'Every frozen known subset must determine the 18 coefficients');
  const a = Array(18).fill(0);
  for (let k = basis.length - 1; k >= 0; k--) {
    const col = pivots[k];
    let rhs = basis[k][18];
    for (let j = col + 1; j < 18; j++) rhs = mod(rhs - basis[k][j] * a[j]);
    a[col] = rhs;
  }
  const predicted = multiply(a, factor);
  assert.equal(predicted.length, 256);
  for (const i of training) {
    const [pos, val] = known[i];
    assert.equal(predicted[pos], val, '18 source-known training equations must be satisfied');
  }
  const fit = new Set(training);
  const withheld = known.filter((_, i) => !fit.has(i));
  const matched = withheld.filter(([position, value]) => predicted[position] === value).length;
  const first = withheld.find(([position, value]) => predicted[position] !== value);
  return {
    training,
    heldout: withheld.length,
    matched,
    firstMiss: first ? first[0] : -1,
    predicted
  };
}

const corpus = readJSON('lp2-corpus.json');
const grid = readJSON('lp2-grid-256.json');
const original = grid.bytes;
assert.equal(original.length, 256);
assert.equal(
  createHash('sha256').update(Buffer.from(original)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290'
);
const table = original.map(x => x % 29);
const cofactors = [
  [1, 5], [1, 5], [1, 18, 11], [1, 14, 16, 24],
  [1, 12, 20, 10, 5, 1, 9, 0, 15, 11]
];
const lowDegreeProduct = cofactors.reduce(multiply, [28]);
assert.equal(lowDegreeProduct.length, 17);
const quotient = divideExactly(table, lowDegreeProduct);
assert.equal(quotient[0], 0); // Source table's high-degree zero coefficient.
const q238 = quotient.slice(1);
assert.equal(q238.length, 239);
assert.equal(q238[0], 1);
assert.deepEqual(multiply(lowDegreeProduct, [0, ...q238]), table);
assert.equal(
  createHash('sha256').update(Buffer.from(q238)).digest('hex'),
  '9cb443bed228623bbd522efcd73888d3a4870c3db0ddcc147011765f3c8a9eb3'
);

const [c55, c56, c57] = [55, 56, 57].map(i => corpus.pages[i].indices);
assert.deepEqual([c55.length, c56.length, c57.length], [76, 85, 95]);
const key = primes(85);
let clock = 0;
const solved56 = c56.map((cipher, i) => {
  if (i === 56) {
    assert.equal(cipher, 0); // Authentic plaintext-F transparency.
    return 0;
  }
  const addend = key[clock++] - 1;
  const plain = mod(cipher - addend);
  assert.equal(mod(plain + addend), cipher);
  return plain;
});
assert.equal(clock, 84);
assert.deepEqual(solved56.slice(0, 5), [24, 9, 18, 9, 23]); // AN END.

const rings = ringPositions();
assert.deepEqual(rings.map(r => r.length), [76, 68, 60, 52]);
const paths = [{ name: 'printed', addresses: Array.from({ length: 256 }, (_, i) => i) }];
for (let corner = 0; corner < 4; corner++) {
  for (const direction of [1, -1]) {
    paths.push({ name: 'ring-c' + corner + '-d' + direction, addresses: orientRings(rings, corner, direction) });
  }
}

const outcomes = [];
for (const [name, middle] of [['cipher', c56], ['plain', solved56]]) {
  const knownValues = middle.concat(c57);
  for (const { name: walk, addresses } of paths) {
    const known = knownValues.map((value, i) => [addresses[i + 76], value]);
    const test = fitAndPredict(known, q238);
    assert.equal(test.training.length, 18);
    assert.equal(test.heldout, 162);
    outcomes.push({ register: name, walk, heldout: test.heldout, match: test.matched, firstMiss: test.firstMiss });
  }
}
assert.deepEqual(
  outcomes.map(r => r.match),
  [4,4,6,9,5,5,11,5,8, 5,6,7,4,7,7,7,1,6]
);

// Positive: native 256-rune codeword built under the same unmodified generator.
// Fit on 18 inner symbols, recover all other inner symbols and the entire outer 76.
const positiveMultiplier = Array.from({ length: 18 }, (_, i) => mod(4 + 7 * i));
const positiveCodeword = multiply(positiveMultiplier, q238);
const positioned = paths[1].addresses;
const positiveKnown = positioned.slice(76).map(pos => [pos, positiveCodeword[pos]]);
const positive = fitAndPredict(positiveKnown, q238);
assert.equal(positive.heldout, 162);
assert.equal(positive.matched, 162);
assert.deepEqual(positive.predicted, positiveCodeword);

for (const outcome of outcomes) console.log(JSON.stringify(outcome));
console.log('Planted exact positive: 18/18 fit, 162/162 held-out, 256/256 reconstructed');
console.log('PASS: source grid factor exact, authentic solved p56 exact, 18/18 original variants reject before decoding p55');
