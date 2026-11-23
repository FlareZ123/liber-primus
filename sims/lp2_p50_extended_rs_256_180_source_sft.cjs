'use strict';
/**
 * LP2 32x8 table as extended Reed-Solomon [256,180] GF256 evaluations.
 * Original source, both conventional byte fields, all 1024 I/l variants.
 * No alternative byte traversal, bit order, phase, or fitted parameters.
 * Read-only Windows Node22 single-file test.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const G = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-grid-256.json'), 'utf8'));
const symbols = G.pages.flatMap((p) => p.tokens);
const base = G.pages.flatMap((p) => p.bytes);
assert.deepEqual(G.pages.map((p) => p.bytes.length), [80, 104, 72]);
const digits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
assert.equal(base.length, 256);
const ambiguous = symbols.flatMap((s, i) => {
  if (s[1] !== 'I' && s[1] !== 'l') return [];
  const alternate = 60 * digits.indexOf(s[0]) + digits.indexOf(s[1] === 'I' ? 'l' : 'I');
  assert.equal(Math.abs(base[i] - alternate), 29);
  return [{i, s, alternate}];
});
assert.deepEqual(ambiguous.map((v) => v.i), [2, 25, 45, 50, 90, 165, 175, 182, 199, 246]);

/** @param {number} a @param {number} b @param {number} poly @returns {number} */
function mul(a, b, poly) {
  let v = 0;
  while (b) {
    if (b & 1) v ^= a;
    a = (a << 1) ^ ((a & 128) ? poly : 0);
    a &= 255;
    b >>>= 1;
  }
  return v;
}
/** @param {number} a @param {number} e @param {number} poly @returns {number} */
function pow(a, e, poly) {
  let out = 1;
  while (e) {
    if (e & 1) out = mul(out, a, poly);
    a = mul(a, a, poly);
    e >>>= 1;
  }
  return out;
}
/**
 * Newton-interpolate degree<180 from x=0..179, evaluate remaining 76.
 * @param {readonly number[]} values
 * @param {number} poly
 * @returns {number[]} predicted XOR source (zero means exact codeword)
 */
function syndrome(values, poly) {
  assert.equal(values.length, 256);
  const co = values.slice(0, 180);
  const inv = new Array(256);
  for (let d = 1; d < 256; d += 1) {
    inv[d] = pow(d, 254, poly);
    assert.equal(mul(d, inv[d], poly), 1);
  }
  for (let order = 1; order < 180; order += 1) {
    for (let i = 179; i >= order; i -= 1) {
      co[i] = mul(co[i] ^ co[i - 1], inv[i ^ (i - order)], poly);
    }
  }
  const output = [];
  for (let x = 180; x < 256; x += 1) {
    let val = co[179];
    for (let i = 178; i >= 0; i -= 1) val = co[i] ^ mul(val, x ^ i, poly);
    output.push(val ^ values[x]);
  }
  return output;
}
const results = [];
for (const poly of [0x11b, 0x11d]) {
  const original = syndrome(base, poly);
  const deltas = ambiguous.map(({i, alternate}) => {
    const changed = base.slice();
    changed[i] = alternate;
    return syndrome(changed, poly).map((v, j) => v ^ original[j]);
  });
  let good = 0, minBad = 76, bestCount = 0, firstBestMask = -1;
  for (let mask = 0; mask < 1024; mask += 1) {
    const cur = original.slice();
    for (let j = 0; j < 10; j += 1) {
      if (mask & (1 << j)) for (let k = 0; k < 76; k += 1) cur[k] ^= deltas[j][k];
    }
    const wrong = cur.filter((v) => v !== 0).length;
    if (!wrong) good += 1;
    if (wrong < minBad) {
      minBad = wrong;
      bestCount = 1;
      firstBestMask = mask;
    } else if (wrong === minBad) bestCount += 1;
  }
  const coefficients = Array.from({length: 180}, (_, i) => (17 * i + 7) & 255);
  const nativePlant = Array.from({length: 256}, (_, x) => {
    let v = 0;
    for (let i = 179; i >= 0; i -= 1) v = coefficients[i] ^ mul(v, x, poly);
    return v;
  });
  assert.deepEqual(syndrome(nativePlant, poly), Array(76).fill(0), 'independent degree179 planted positive');
  const expected = poly === 0x11b ? [75, 74, 32, 6] : [76, 73, 8, 14];
  assert.deepEqual([original.filter((v) => v !== 0).length, minBad, bestCount, firstBestMask], expected);
  assert.equal(good, 0);
  results.push({poly:'0x'+poly.toString(16),caseAssignments:1024,fullMatches:good,
    wrongDefault:expected[0],minimumWrong:minBad,numberOfBestCases:bestCount,syntheticPositive:true});
}
console.log(JSON.stringify({source:'Physical p49-51 original byte panel',ambiguous:ambiguous.map((x)=>x.i),results},null,2));
console.log('PASS: complete 2048-case original table gate and both GF256 polynomial plants');
