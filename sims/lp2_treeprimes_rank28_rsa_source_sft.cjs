'use strict';

/**
 * Source-locked test of an outer 28-symbol nonrepeat rank encoder followed by
 * 563 x 569 RSA on LP2 physical pp32 and 55.
 *
 * Run from the repository root with Node.js 22:
 * node sims/lp2_treeprimes_rank28_rsa_source_sft.cjs
 *
 * No cryptographic key, original ciphertext symbol, or source page is modified.
 */
const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');

const p = 563;
const q = 569;
const n = p * q;
const phi = (p - 1) * (q - 1);
const e = 65537;
const d = 160833;

/** @param {number} value @param {number} exponent @param {number} modulus */
function power(value, exponent, modulus) {
  let base = BigInt(value);
  let exp = BigInt(exponent);
  let out = 1n;
  const mod = BigInt(modulus);
  while (exp > 0n) {
    if ((exp & 1n) !== 0n) out = (out * base) % mod;
    base = (base * base) % mod;
    exp >>= 1n;
  }
  return Number(out);
}

/** @param {number[]} data @param {'sorted'|'cyclic'} mode */
function invertExclusion(data, mode) {
  const ranks = [];
  const repeats = [];
  for (let j = 1; j < data.length; j++) {
    const current = data[j];
    const previous = data[j - 1];
    if (current === previous) {
      repeats.push(j);
      continue;
    }
    ranks.push(mode === 'sorted'
      ? current - Number(current > previous)
      : ((current - previous + 29) % 29) - 1);
  }
  return { ranks, repeats };
}

/** @param {number} value @param {number} radix @param {number} width */
function digits(value, radix, width) {
  const out = Array(width).fill(0);
  let v = value;
  for (let k = width - 1; k >= 0; k--) {
    out[k] = v % radix;
    v = Math.floor(v / radix);
  }
  assert.equal(v, 0);
  return out;
}

/** @param {number[]} a @param {number} radix */
function numberFromDigits(a, radix) {
  return a.reduce((v, x) => v * radix + x, 0);
}

/** @param {number[]} rankDigits @param {'sorted'|'cyclic'} mode @param {number} initial */
function wrapExclusion(rankDigits, mode, initial) {
  const out = [initial];
  for (const rank of rankDigits) {
    const previous = out[out.length - 1];
    const next = mode === 'sorted'
      ? rank + Number(rank >= previous)
      : (previous + rank + 1) % 29;
    assert.notEqual(next, previous);
    assert(next >= 0 && next < 29);
    out.push(next);
  }
  return out;
}

assert.equal(n, 320347);
assert.equal(phi, 319216);
assert.equal((e * d) % phi, 1);
assert.equal(corpus.pages[32].indices.length, 121);
assert.equal(corpus.pages[55].indices.length, 76);
assert.equal(corpus.pages[57].indices.length, 95);
const tree = corpus.pages[32].indices;
assert.equal(tree.slice(0, 11).reduce((sum, r) => sum + corpus.prime[r], 0), 563);
assert.equal(Array.from({length: 11}, (_, j) => corpus.prime[tree[j * 11]])
  .reduce((sum, r) => sum + r, 0), 569);

const summaries = [];
for (const page of [32, 55]) {
  const original = corpus.pages[page].indices;
  for (const mode of ['sorted', 'cyclic']) {
    for (const direction of ['forward', 'reverse']) {
      const source = direction === 'forward' ? original : [...original].reverse();
      const { ranks, repeats } = invertExclusion(source, mode);
      for (let phase = 0; phase < 4; phase++) {
        const packets = [];
        for (let j = phase; j + 3 < ranks.length; j += 4) {
          packets.push(numberFromDigits(ranks.slice(j, j + 4), 28));
        }
        const invalid = packets.map((value, j) => ({value, j})).filter(x => x.value >= n);
        const entry = {
          page, mode, direction, phase,
          sourceLength: source.length, repeatOffsets: repeats,
          completePackets: packets.length,
          invalidPackets: invalid.length,
          firstInvalid: invalid[0] || null
        };
        summaries.push(entry);
        assert(invalid.length > 0, 'An unanticipated fully valid original RSA packet stream');
      }
    }
  }
}

assert.equal(summaries.length, 32);
const group = (page, mode, direction) =>
  summaries.filter(x => x.page === page && x.mode === mode && x.direction === direction)
    .map(x => x.invalidPackets);
assert.deepEqual(group(32, 'sorted', 'forward'), [10,16,15,18]);
assert.deepEqual(group(32, 'sorted', 'reverse'), [11,18,15,15]);
assert.deepEqual(group(32, 'cyclic', 'forward'), [16,16,11,12]);
assert.deepEqual(group(32, 'cyclic', 'reverse'), [13,12,17,14]);
assert.deepEqual(group(55, 'sorted', 'forward'), [7,10,6,10]);
assert.deepEqual(group(55, 'sorted', 'reverse'), [8,11,5,9]);
assert.deepEqual(group(55, 'cyclic', 'forward'), [9,11,10,8]);
assert.deepEqual(group(55, 'cyclic', 'reverse'), [7,9,8,7]);

// Genuine 90-rune source-native positive: 30 three-GP-rune messages.
// Encrypt each source triplet by the specified historical e, write four
// base28 rank digits, and use the exact reversible outer exclusion encoder.
const solved = corpus.pages[57].indices.slice(0, 90);
for (const mode of ['sorted', 'cyclic']) {
  const rankDigits = [];
  for (let j = 0; j < solved.length; j += 3) {
    const m = numberFromDigits(solved.slice(j, j + 3), 29);
    assert(m < n);
    rankDigits.push(...digits(power(m, e, n), 28, 4));
  }
  const syntheticCipher = wrapExclusion(rankDigits, mode, tree[0]);
  assert.equal(syntheticCipher.length, 121);
  const inverse = invertExclusion(syntheticCipher, mode);
  assert.deepEqual(inverse.repeats, []);
  assert.deepEqual(inverse.ranks, rankDigits);
  const recovered = [];
  for (let j = 0; j < inverse.ranks.length; j += 4) {
    const cipherInteger = numberFromDigits(inverse.ranks.slice(j, j + 4), 28);
    assert(cipherInteger < n);
    const recoveredInteger = power(cipherInteger, d, n);
    assert(recoveredInteger < 29 ** 3);
    recovered.push(...digits(recoveredInteger, 29, 3));
  }
  assert.deepEqual(recovered, solved);
  console.log('PASS source-native 90/90 planted GP-rune RSA recovery:', mode);
}
console.log(JSON.stringify({
  status: 'PASS',
  explanation: 'Original rank28 packet domain is impossible in all 32 combinations; no LP2 plaintext recovered',
  modulus: n, exponent: e, privateExponent: d,
  summaries
}, null, 2));
