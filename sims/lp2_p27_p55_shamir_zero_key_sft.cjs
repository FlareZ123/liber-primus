'use strict';
/**
 * SFT: evaluate the 2013 Shamir secret-at-zero primitive as a direct original
 * p55 key, using the already-observed p27 terminal 6-rune match.
 * Exact original data only; Node 22, CommonJS, no external packages.
 *
 * This is a conditional rejection, not a recovered key or plaintext.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, '../resources/liber-primus/lp2-corpus.json'), 'utf8'
));
/** @param {number} index */
const page = index => source.pages.find(x => x.page === index).indices;
/** @param {number} x */
const mod = x => ((x % 29) + 29) % 29;
const p27 = page(27);
const ciphertext = page(55);
assert.equal(p27.length, 234);
assert.equal(ciphertext.length, 76);
assert.deepEqual(p27.slice(28, 34), ciphertext.slice(70));
assert.deepEqual([15, 25, 41], ciphertext.flatMap((x, i) => x === 0 ? [i] : []));

const afterMarker = [...p27.slice(34), ...p27.slice(0, 28)];
assert.equal(afterMarker.length, 228);

/** @param {number[][]} shares */
function reconstruct(shares) {
  const [a, b, c] = shares;
  assert.ok(shares.every(s => s.length === 76));
  // Lagrange interpolation at x=0 using three 2013-style shares at x=1,2,3.
  return a.map((x, i) => mod(3 * x - 3 * b[i] + c[i]));
}

/**
 * Forward cipher: original solved p56 plaintext-F passthrough, independently
 * supplied GP29 key at each non-F plaintext position. The output can itself
 * contain F due to an encrypted non-F rune.
 * @param {number[]} plain
 * @param {number[]} key
 * @param {number} sign
 */
function encode(plain, key, sign) {
  let j = 0;
  return plain.map(p => p === 0 ? 0 : mod(p - sign * key[j++]));
}

/**
 * Enumerate all three independent choices of encrypted-vs-bypassed ciphertext F.
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {number} sign
 */
function allDecodings(cipher, key, sign) {
  const results = [];
  const fsites = cipher.flatMap((x, i) => x === 0 ? [i] : []);
  for (let mask = 0; mask < 2 ** fsites.length; mask++) {
    let j = 0;
    const plain = [];
    const violations = [];
    for (let i = 0; i < cipher.length; i++) {
      const bit = fsites.indexOf(i);
      const bypass = bit >= 0 && (mask & (1 << bit)) !== 0;
      const p = bypass ? 0 : mod(cipher[i] + sign * key[j++]);
      plain.push(p);
      // A normal encrypted plaintext F is forbidden under the p56 rule.
      if (p === 0 && !bypass) violations.push(i);
    }
    results.push({mask, plain, violations});
  }
  return results;
}

const layouts = {
  contiguous: [
    afterMarker.slice(0, 76),
    afterMarker.slice(76, 152),
    afterMarker.slice(152)
  ],
  interleaved: [0, 1, 2].map(k => afterMarker.filter((_, i) => i % 3 === k))
};
const verdict = {};
for (const [layout, shares] of Object.entries(layouts)) {
  const key = reconstruct(shares);
  const outcomes = [];
  for (const sign of [-1, 1]) {
    const attempts = allDecodings(ciphertext, key, sign);
    assert.equal(attempts.length, 8);
    // Each of eight F branch histories has a violation before any observed F.
    const expectedFirst = layout === 'contiguous'
      ? (sign === -1 ? 8 : 0) : (sign === -1 ? 9 : 5);
    for (const attempt of attempts) {
      assert.equal(attempt.violations[0], expectedFirst);
      assert.ok(attempt.violations.length >= 1);
    }
    outcomes.push({
      sign,
      tested: attempts.length,
      accepted: attempts.filter(a => a.violations.length === 0).length,
      commonFirstContradiction: attempts[0].violations[0],
      maxViolations: Math.max(...attempts.map(a => a.violations.length))
    });
    // Real source-native solved p57 register, exactly the same full 76-rune
    // clock with F bypass, verifies this cipher's forward/inverse contract.
    const known = page(57).slice(0, 76);
    assert.equal(known.length, 76);
    const synthetic = encode(known, key, sign);
    const recovered = allDecodings(synthetic, key, sign);
    assert.ok(recovered.some(x => x.violations.length === 0 &&
      x.plain.every((p, i) => p === known[i])));
  }
  verdict[layout] = {keyStart: key.slice(0, 10), outcomes};
}
console.log(JSON.stringify({
  source: 'original LP2 physical p27, p55, and solved clear p57',
  historicalAnalogy: 'Shamir degree-two interpolation secret at x=0 from x=1,2,3',
  page27Marker: [28, 33],
  testedFullLength: 76,
  totalSourceOriginalVariants: 32,
  acceptedSourceOriginalVariants: 0,
  verdict
}, null, 2));
