'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const pages = new Map(corpus.pages.map((p) => [p.page, p]));
const mod = (n) => ((n % 29) + 29) % 29;

/** @param {number} n @returns {number} */
function inverse(n) {
  for (let i = 1; i < 29; i++) if (mod(i * n) === 1) return i;
  throw new Error('Nonzero GF29 element must have an inverse');
}

/** @param {number[]} xs Distinct GF29 share IDs. @returns {number[][]} */
function basis(xs) {
  assert.equal(new Set(xs).size, xs.length);
  return xs.map((x, j) => {
    let polynomial = [1];
    let denominator = 1;
    for (let k = 0; k < xs.length; k++) {
      if (k === j) continue;
      const next = Array(polynomial.length + 1).fill(0);
      for (let m = 0; m < polynomial.length; m++) {
        next[m] = mod(next[m] - xs[k] * polynomial[m]);
        next[m + 1] = mod(next[m + 1] + polynomial[m]);
      }
      polynomial = next;
      denominator = mod(denominator * (x - xs[k]));
    }
    return polynomial.map((v) => mod(v * inverse(denominator)));
  });
}

/** @param {number[]} coefficients Ascending-degree GF29 coefficients. @param {number} x @returns {number} */
function evaluate(coefficients, x) {
  let y = 0;
  for (let i = coefficients.length - 1; i >= 0; i--) y = mod(y * x + coefficients[i]);
  return y;
}

/** @param {number[]} shares @param {number[][]} b @returns {number[]} */
function interpolate(shares, b) {
  return shares.map((_, k) => mod(shares.reduce((sum, value, j) => sum + value * b[j][k], 0)));
}

/** @param {number[]} a @returns {number} */
function ioc(a) {
  const counts = Array(29).fill(0);
  for (const x of a) counts[x]++;
  return counts.reduce((n, count) => n + count * (count - 1), 0) / (a.length * (a.length - 1));
}

const chapter = Array.from({length: 14}, (_, i) => pages.get(i + 40).indices).flat();
assert.equal(chapter.length, 3008);
const heading = chapter.slice(0, 8);
assert.deepEqual(heading, [0, 9, 19, 26, 6, 23, 25, 8]);
const cipher = chapter.slice(8);
assert.equal(cipher.length, 3000);
const rank = Array.from({length: 8}, (_, i) => i).sort((a, b) => heading[a] - heading[b]);
assert.deepEqual(rank, [0, 4, 7, 1, 2, 5, 6, 3]);
const solved = pages.get(57).indices;
assert.equal(solved.length, 95);

/** @param {string} mode @param {number} row @param {number} col @returns {number} */
function position(mode, row, col) {
  if (mode === 'stride') return 8 * row + col;
  if (mode === 'blocks') return 375 * col + row;
  return 375 * rank.indexOf(col) + row;
}

/** @param {number[]} packed @param {string} mode @returns {number[][]} */
function unpack(packed, mode) {
  return Array.from({length: 375}, (_, row) =>
    Array.from({length: 8}, (_, col) => packed[position(mode, row, col)]));
}

/** @param {number[][]} shares @param {string} mode @returns {number[]} */
function pack(shares, mode) {
  const out = Array(3000);
  for (let row = 0; row < 375; row++)
    for (let col = 0; col < 8; col++) out[position(mode, row, col)] = shares[row][col];
  return out;
}

const expected = [
  [0, 38, [19, 17, 7], 0.03402495543672014],
  [0, 49, [22, 13, 9], 0.03520855614973262],
  [0, 49, [13, 15, 13], 0.034224598930481284],
  [0, 35, [13, 7, 17], 0.03443850267379679],
  [0, 25, [8, 8, 12], 0.0346096256684492],
  [0, 27, [9, 16, 11], 0.03553654188948307],
];
let trial = 0;
for (const [idType, ids] of [
  ['heading-plus-one', heading.map((x) => x + 1)],
  ['historical-1-through-8', heading.map((_, i) => i + 1)],
]) {
  const b8 = basis(ids);
  const b5 = basis(ids.slice(0, 5));
  for (const mode of ['stride', 'blocks', 'red-ranked-blocks']) {
    const rows = unpack(cipher, mode);
    assert.deepEqual(pack(rows, mode), cipher);
    const full = rows.map((row) => interpolate(row, b8));
    assert.deepEqual(pack(full.map((co) => ids.map((x) => evaluate(co, x))), mode), cipher);

    let exactDegree4Rows = 0;
    let heldout = 0;
    const highZeros = [0, 0, 0];
    const secret = [];
    for (let r = 0; r < 375; r++) {
      const co5 = interpolate(rows[r].slice(0, 5), b5);
      secret.push(co5[0]);
      for (let k = 5; k < 8; k++) if (full[r][k] === 0) highZeros[k - 5]++;
      if (full[r].slice(5).every((x) => x === 0)) exactDegree4Rows++;
      for (let col = 5; col < 8; col++)
        if (evaluate(co5, ids[col]) === rows[r][col]) heldout++;
    }
    const [wantExact, wantHeldout, wantZeros, wantIoC] = expected[trial++];
    assert.equal(exactDegree4Rows, wantExact);
    assert.equal(heldout, wantHeldout);
    assert.deepEqual(highZeros, wantZeros);
    assert(Math.abs(ioc(secret) - wantIoC) < 1e-12);

    // Positive source-native implant: true 375-rune GP text from solved p57,
    // spread with a distinct degree-four polynomial at each row.
    const native = Array.from({length: 375}, (_, r) => solved[r % solved.length]);
    const plant = native.map((symbol, r) => {
      const coefficients = [symbol];
      for (let k = 1; k <= 4; k++) coefficients.push(mod(13 * r + 11 * k + 3 * r * k));
      return ids.map((x) => evaluate(coefficients, x));
    });
    const encoded = pack(plant, mode);
    const decoded = unpack(encoded, mode);
    let plantHeldout = 0;
    const recovered = decoded.map((row) => {
      const co = interpolate(row.slice(0, 5), b5);
      assert(interpolate(row, b8).slice(5).every((x) => x === 0));
      for (let col = 5; col < 8; col++) {
        assert.equal(evaluate(co, ids[col]), row[col]);
        plantHeldout++;
      }
      return co[0];
    });
    assert.deepEqual(recovered, native);
    assert.equal(plantHeldout, 1125);
    console.log(JSON.stringify({idType, mode, ids, exactDegree4Rows, heldout,
      heldoutTotal: 1125, highZeros, secretIoC: ioc(secret),
      first28GP: secret.slice(0, 28).map((x) => corpus.translit[x]).join(''),
      plantRecovered: '375/375', plantHeldout: '1125/1125', fullForwardRoundtrip: true}));
  }
}
assert.equal(trial, 6);
console.log('PASS: original fails all six degree-four five-of-eight gates; all authentic-GP plants invert.');
