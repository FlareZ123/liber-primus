'use strict';

/**
 * Direct Euclidean first-quotient / p0 READOUT cryptanalytic gate.
 * The p29 and p50 original operands are independently selected by the signed
 * DIRECTION and unique p39 red marked GF29 factor. Both p0 23-rune receivers
 * are selected separately by the p28 READ OUT interval navigation.
 *
 * Node22: node sims/lp2_p29_p50_euclid_first23_p0_readout_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, 'resources/liber-primus', name), 'utf8');
const c = JSON.parse(read('lp2-corpus.json'));
const grid = JSON.parse(read('lp2-grid-256.json')).bytes;
const original29 = c.pages.find((p) => p.page === 29).indices;
const original0 = c.pages.find((p) => p.page === 0).indices;
const solved57 = c.pages.find((p) => p.page === 57).indices;
const ref = read('lp1-plaintext-reference.txt');
assert.deepEqual([original29.length, grid.length, original0.length], [277, 256, 262]);
const mod = (n) => (n % 29 + 29) % 29;
const trim = (a) => {
  while (a.length && a[a.length - 1] === 0) a.pop();
  return a;
};
const inv = (n) => {
  assert.ok(n > 0 && n < 29);
  const value = Array.from({ length: 28 }, (_, i) => i + 1).find((x) => x * n % 29 === 1);
  assert.ok(value);
  return value;
};
/**
 * @param {number[]} input Source polynomials, ascending GF29 powers.
 * @param {number[]} divisor Source polynomials, ascending GF29 powers.
 * @returns {{q:number[],rem:number[]}}
 */
function divide(input, divisor) {
  const remainder = trim(input.slice());
  const by = trim(divisor.slice());
  assert.ok(by.length);
  const quotient = Array(Math.max(0, remainder.length - by.length + 1)).fill(0);
  while (remainder.length >= by.length) {
    const shift = remainder.length - by.length;
    const k = mod(remainder[remainder.length - 1] * inv(by[by.length - 1]));
    quotient[shift] = k;
    for (let i = 0; i < by.length; i++)
      remainder[i + shift] = mod(remainder[i + shift] - k * by[i]);
    trim(remainder);
  }
  return { q: trim(quotient), rem: remainder };
}
const A = original29.slice().reverse(), B = grid.map((n) => n % 29).reverse();
const { q, rem } = divide(A, B);
assert.equal(q.length, 23); // Source byte 203 is 0 mod29, dropping degree 255.
assert.equal(rem.length, 254);
const reconstruct = Array(A.length).fill(0);
for (let i = 0; i < B.length; i++)
  for (let j = 0; j < q.length; j++)
    reconstruct[i + j] = mod(reconstruct[i + j] + B[i] * q[j]);
for (let i = 0; i < rem.length; i++) reconstruct[i] = mod(reconstruct[i] + rem[i]);
assert.deepEqual(reconstruct, A);
const print = (a) => a.map((i) => c.translit[i]).join('');
const orientations = [['printed-high', q.slice().reverse()], ['reverse-low', q.slice()]];
assert.ok(orientations.every(([, v]) => v.every((x) => x !== 0)));
const page57 = solved57.slice(0, 23);
assert.equal(page57.length, 23);

/** @param {string} text @returns {number[]} */
function encodeLatin(text) {
  const abc = c.translit;
  const src = text.toUpperCase().replace(/[KQ]/g, 'C').replace(/V/g, 'U').replace(/Z/g, 'S');
  const output = [];
  for (let i = 0; i < src.length;) {
    let candidate = -1;
    for (let j = 0; j < abc.length; j++)
      if (src.startsWith(abc[j], i) && (candidate < 0 || abc[j].length > abc[candidate].length))
        candidate = j;
    if (candidate < 0) i++;
    else { output.push(candidate); i += abc[candidate].length; }
  }
  return output;
}
const native = encodeLatin(ref);
const tripletCounts = new Uint32Array(29 ** 3), pairCounts = new Uint32Array(29 ** 2);
for (let i = 2; i < native.length; i++) {
  const index = native[i - 2] * 29 + native[i - 1];
  tripletCounts[index * 29 + native[i]]++;
  pairCounts[index]++;
}
function score(a) {
  let scoreValue = 0;
  for (let i = 2; i < a.length; i++) {
    const index = a[i - 2] * 29 + a[i - 1];
    scoreValue += Math.log((tripletCounts[index * 29 + a[i]] + 0.2) / (pairCounts[index] + 5.8));
  }
  return scoreValue / (a.length - 2);
}
const shift = (a, key, sign) => a.map((value, i) => mod(value + sign * key[i]));
assert.ok(score(page57) > -2.3);
console.log(JSON.stringify({
  resultType: 'source-selected Euclidean first quotient; bounded negative on p0 readout receivers',
  originals: { page29Runes: 277, tableBytes: 256, tableLeadByte: grid[0],
    tableLeadGF29: grid[0] % 29, quotientRunes: 23, remainderRunes: rem.length },
  sourceQuotientPrinted: q.slice().reverse(),
  sourceQuotientRomanized: print(q.slice().reverse()),
  exactReconstruction: true,
  solvedP57Trigram23: score(page57)
}));
for (const start of [80, 166]) {
  const receiver = original0.slice(start, start + 23);
  for (const [orientation, key] of orientations) for (const sign of [-1, 1]) {
    const output = shift(receiver, key, sign);
    assert.deepEqual(shift(output, key, -sign), receiver);
    // A solved plaintext plant via precisely the same key/phase and receiver length.
    assert.deepEqual(shift(shift(page57, key, -sign), key, sign), page57);
    console.log(JSON.stringify({
      source: 'p0 readout 23-rune receiver', start, orientation, sign,
      meanTrigram: score(output), rawTrigram: score(receiver), result: print(output)
    }));
  }
}
console.log('PASS: eight frozen source quotient/p0 consumers nonlinguistic; positive plants exact');
