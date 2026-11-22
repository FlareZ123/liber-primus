'use strict';

/**
 * LP2 printed inner180 numerical cells as an arbitrary byte->GP29 key
 * lookup, calibrated on authentic p56 AN END and clear p57 PARABLE.
 * Node.js 22 CommonJS, read-only, no dependencies.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const bytes = grid.pages.flatMap((page) => page.bytes);
assert.equal(bytes.length, 256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const pages = new Map(corpus.pages.map((page) => [page.page, page.indices]));
assert.equal(pages.get(55).length, 76);
const cipher56 = pages.get(56);
const clear57 = pages.get(57);
assert.equal(cipher56.length, 85);
assert.equal(clear57.length, 95);

/** @param {number} n @returns {boolean} */
function prime(n) {
  for (let k = 2; k * k <= n; k++) if (n % k === 0) return false;
  return n > 1;
}
const primes = [];
for (let n = 2; primes.length < cipher56.length; n++) {
  if (prime(n)) primes.push(n);
}
// The original p56 clear F at rune index56 does not consume a prime clock.
assert.equal(cipher56[56], 0);
let clock = 0;
const key56 = cipher56.map((_, i) =>
  i === 56 ? 0 : ((primes[clock++] - 1) % 29));
assert.equal(clock, 84);
const plain56 = cipher56.map((v, i) => (v - key56[i] + 29) % 29);
assert.equal(plain56.map((v) => corpus.translit[v]).join(''),
  'ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE');

// p57 is original printed clear GP29. Its known plaintext-key shift is 0.
const knownPlaintext = plain56.concat(clear57);
const knownCiphertext = cipher56.concat(clear57);
const knownShifts = knownCiphertext.map((v, i) =>
  (v - knownPlaintext[i] + 29) % 29);
assert.equal(knownShifts.length, 180);
assert.deepEqual(knownShifts, key56.concat(Array(95).fill(0)));

// One-cell-wide physical circumference is 76 tokens, with a 30x6 interior.
const ring = new Set();
for (let r = 0; r < 32; r++) {
  for (let c = 0; c < 8; c++) {
    if (r === 0 || r === 31 || c === 0 || c === 7) ring.add(r * 8 + c);
  }
}
assert.equal(ring.size, 76);
const innerRows = Array.from({ length: 30 }, (_, r) =>
  Array.from({ length: 6 }, (_, c) => bytes[(r + 1) * 8 + (c + 1)]));
const row = innerRows.flat();
const column = Array.from({ length: 6 }, (_, c) =>
  Array.from({ length: 30 }, (_, r) => innerRows[r][c])).flat();
const traversals = {
  row,
  rowreverse: row.slice().reverse(),
  column,
  columnreverse: column.slice().reverse()
};

/**
 * Minimum number of changed GP29 key shifts needed to make one secret
 * byte->shift lookup consistent. For each byte choose its modal shift.
 * @param {number[]} labels
 * @param {number[]} shifts
 * @returns {number}
 */
function minimumConflicts(labels, shifts) {
  assert.equal(labels.length, shifts.length);
  const occurrences = new Map();
  for (let i = 0; i < labels.length; i++) {
    let hist = occurrences.get(labels[i]);
    if (!hist) occurrences.set(labels[i], hist = new Map());
    hist.set(shifts[i], (hist.get(shifts[i]) || 0) + 1);
  }
  let errors = 0;
  for (const hist of occurrences.values()) {
    const frequencies = [...hist.values()];
    errors += frequencies.reduce((a, b) => a + b, 0) - Math.max(...frequencies);
  }
  return errors;
}

/**
 * Original conflicting witness: same table byte forces unequal p56 key shifts.
 * @param {number[]} labels
 * @returns {[number,number,number,number,number]}
 */
function firstConflict(labels) {
  for (let i = 0; i < knownShifts.length; i++) {
    for (let j = 0; j < i; j++) {
      if (labels[i] === labels[j] && knownShifts[i] !== knownShifts[j]) {
        return [labels[i], j, knownShifts[j], i, knownShifts[i]];
      }
    }
  }
  throw Error('Expected contradictory byte-to-key lookup');
}
const expected = {
  row: { all: 37, p56: 16, p57: 0, witness: [59,11,7,32,20] },
  rowreverse: { all: 29, p56: 12, p57: 0, witness: [52,17,2,19,12] },
  column: { all: 32, p56: 10, p57: 0, witness: [156,22,24,30,10] },
  columnreverse: { all: 35, p56: 13, p57: 0, witness: [32,17,2,18,8] }
};
const results = {};
for (const [name, labels] of Object.entries(traversals)) {
  assert.equal(labels.length, 180);
  const actual = {
    all: minimumConflicts(labels, knownShifts),
    p56: minimumConflicts(labels.slice(0, 85), knownShifts.slice(0, 85)),
    p57: minimumConflicts(labels.slice(85), knownShifts.slice(85)),
    witness: firstConflict(labels)
  };
  assert.deepEqual(actual, expected[name]);
  results[name] = actual;

  // Fixed-original-table positive cipher: the same repeated byte always
  // gives exactly the same seeded key shift, producing zero conflicts.
  const planted = labels.map((byte) => (7 * byte + 13) % 29);
  assert.equal(minimumConflicts(labels, planted), 0);
  const recovered = labels.map((byte) => (7 * byte + 13) % 29);
  const cipherPlant = knownPlaintext.map((v, i) => (v + planted[i]) % 29);
  assert.deepEqual(cipherPlant.map((v, i) => (v - recovered[i] + 29) % 29),
    knownPlaintext);
  const first = new Map();
  let collision = null;
  for (let i = 0; i < labels.length; i++) {
    const prev = first.get(labels[i]);
    if (prev !== undefined) { collision = i; break; }
    first.set(labels[i], i);
  }
  assert.notEqual(collision, null);
  const tampered = planted.slice();
  tampered[collision] = (tampered[collision] + 1) % 29;
  assert(minimumConflicts(labels, tampered) > 0);
}
console.log(JSON.stringify({
  source: 'authentic LP2 p50 bytes, p56 solved GP prime-totient and p57 clear',
  printed_table_ring: ring.size,
  physical_table_interior: row.length,
  p56_cipher_runes: cipher56.length,
  p56_literal_F_at: 56,
  p56_prime_clock_consumptions: clock,
  p57_clear_runes: clear57.length,
  candidate_secret_lookup_class: 'arbitrary fixed 256-byte-to-GP29 shift',
  original: results,
  source_matched_positive_lookup: 'all 180 plaintext symbols exactly recovered',
  unknown_p55_plaintext_recovered: false
}, null, 2));
