'use strict';

/**
 * Six-share negative with no key search: the original LP2 p2 201 runes and
 * five 201-rune lanes from p23-26 cannot form a 5-of-10 Shamir codeword.
 * Conditional on treating p2 as an additional share. Includes byte packing.
 * Run: node sims/lp2_p2_p23_sixshare_rank_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {number} a @param {number} b @param {number} poly @returns {number} */
function gf256Mul(a, b, poly) {
  let out = 0;
  for (let i = 0; i < 8; i++) {
    if (b & 1) out ^= a;
    const hi = a & 128;
    a = (a << 1) & 255;
    if (hi) a ^= poly & 255;
    b >>= 1;
  }
  return out;
}
const F29 = {
  plus: (a, b) => (a + b) % 29,
  minus: (a, b) => (a - b + 29) % 29,
  times: (a, b) => (a * b) % 29,
};
/** @param {number} poly @returns {object} */
function F256(poly) {
  return { plus: (a, b) => a ^ b, minus: (a, b) => a ^ b,
    times: (a, b) => gf256Mul(a, b, poly) };
}
/**
 * Leibniz determinant avoids any inverse/zero-pivot assumption and supplies
 * a six-column independent full-rank certificate.
 * @param {number[][]} matrix 6 rows by 6 columns
 * @param {object} field plus/minus/times operations
 * @returns {number}
 */
function det6(matrix, field) {
  assert.equal(matrix.length, 6);
  matrix.forEach(r => assert.equal(r.length, 6));
  let out = 0;
  /** @param {number[]} chosen @param {number} used */
  function visit(chosen, used) {
    if (chosen.length < 6) {
      for (let col = 0; col < 6; col++)
        if (!(used & (1 << col))) visit([...chosen, col], used | (1 << col));
      return;
    }
    let term = 1, parity = 0;
    for (let i = 0; i < 6; i++) {
      term = field.times(term, matrix[i][chosen[i]]);
      for (let j = i + 1; j < 6; j++)
        if (chosen[i] > chosen[j]) parity ^= 1;
    }
    out = parity ? field.minus(out, term) : field.plus(out, term);
  }
  visit([], 0);
  return out;
}
/** @param {number[]} indices @returns {number[]} */
function encode29Fixed123(indices) {
  assert.equal(indices.length, 201);
  let n = 0n;
  for (const x of indices) {
    assert(Number.isInteger(x) && x >= 0 && x < 29);
    n = n * 29n + BigInt(x);
  }
  assert(n < (1n << 984n), 'full 201 GP29 symbols must fit 123 bytes');
  const result = Array.from({ length: 123 }, (_, i) => Number((n >> BigInt(8 * (122 - i))) & 255n));
  let check = result.reduce((acc, x) => acc * 256n + BigInt(x), 0n);
  const recovered = Array(201).fill(0);
  for (let i = 200; i >= 0; i--) {
    recovered[i] = Number(check % 29n);
    check /= 29n;
  }
  assert.equal(check, 0n);
  assert.deepEqual(recovered, indices, 'lossless fixed-width natural base29-to-binary conversion');
  return result;
}
/** @param {number[][]} rows @returns {number[][]} */
function head6(rows) { return rows.map(r => r.slice(0, 6)); }
/** @param {number} poly @param {number} positions */
function plantedShamir(poly, positions) {
  const f = F256(poly), rows = Array.from({ length: 6 }, () => []);
  for (let col = 0; col < positions; col++) {
    const coeff = Array.from({ length: 5 }, (_, j) => (col * 47 + j * 31 + 7) & 255);
    for (let x = 1; x <= 6; x++) {
      let y = coeff[4];
      for (let k = 3; k >= 0; k--) y = f.plus(f.times(y, x), coeff[k]);
      rows[x - 1].push(y);
    }
  }
  return rows;
}
function run() {
  const corpus = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../resources/liber-primus/lp2-corpus.json'), 'utf8'));
  const page = n => corpus.pages.find(p => p.page === n).indices;
  const sixth = page(2);
  const body = [...page(23).slice(16), ...page(24), ...page(25), ...page(26)];
  assert.equal(sixth.length, 201);
  assert.equal(page(23).length, 213);
  assert.equal(body.length, 1005);
  const lanes = {
    fiveStrands: [sixth, ...Array.from({ length: 5 }, (_, i) => body.slice(201 * i, 201 * (i + 1)))],
    fiveQuintets: [sixth, ...Array.from({ length: 5 }, (_, i) => Array.from({ length: 201 }, (_, j) => body[5 * j + i]))],
  };
  const expected = { fiveStrands: { gp29: 25, f11b: 49, f11d: 68 },
    fiveQuintets: { gp29: 20, f11b: 183, f11d: 79 } };
  const results = [];
  for (const [name, rows] of Object.entries(lanes)) {
    assert(rows.every(r => r.length === 201));
    const gp29 = det6(head6(rows), F29);
    const bytes = rows.map(encode29Fixed123);
    const f11b = det6(head6(bytes), F256(0x11b));
    const f11d = det6(head6(bytes), F256(0x11d));
    assert.deepEqual({ gp29, f11b, f11d }, expected[name]);
    assert(gp29 !== 0 && f11b !== 0 && f11d !== 0);
    results.push({ layout: name, p2PlusFiveRows: 6, runeColumns: 201,
      binaryColumns: 123, originalDeterminants: { gp29, gf256Poly11b: f11b, gf256Poly11d: f11d },
      rankOverEachDeclaredField: 6 });
  }
  // Positive control: six genuine five-of-ten shares are degree-four evaluations
  // at distinct identifiers, so every 6x6 minor vanishes over the same field.
  for (const poly of [0x11b, 0x11d]) {
    const plant = plantedShamir(poly, 123);
    assert.equal(det6(head6(plant), F256(poly)), 0);
  }
  const plant29 = Array.from({ length: 6 }, () => []);
  for (let j = 0; j < 201; j++) {
    const c = Array.from({ length: 5 }, (_, k) => (j * 7 + k * 3 + 5) % 29);
    for (let x = 1; x <= 6; x++) {
      let v = c[4];
      for (let k = 3; k >= 0; k--) v = (v * x + c[k]) % 29;
      plant29[x - 1].push(v);
    }
  }
  assert.equal(det6(head6(plant29), F29), 0);
  console.log(JSON.stringify({
    claim: 'Conditional sixth-share (p2) impossible for all x-labels under natural direct GF29 or fixed-width GF256 share codecs',
    originalScope: 'LP2 p2 201 runes plus post-red16 p23-26 1005 runes, two independent 201x5 layouts',
    nistFieldAndAlternate11dPositivePlants: true, results,
  }, null, 2));
}
run();
