'use strict';

/**
 * SFT: original LP1 p5's three consecutive sacred clauses have prime-index
 * progression 147,175,203; the embedded 1033 square precedes prime1039.
 * Separately test one source-selected 28-index-stride LP2 totient clock.
 * Read-only, Node.js 22/CommonJS, standard-library only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p));
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json').toString('utf8'));
const lp1 = read('resources/transcriptions/lp1_wulfic_canonical.txt').toString('utf8');
const sourceJpeg = read('resources/liber-primus/05.jpg');
assert.equal(crypto.createHash('sha256').update(sourceJpeg).digest('hex'),
  '2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7');

const alphabet = new Map(corpus.runes.map((r, i) => [r, i]));
const clauses = lp1.split('.').map((segment) => {
  const symbols = [...segment].map((r) => alphabet.get(r)).filter((n) => n !== undefined);
  return {
    text: symbols.map((n) => corpus.translit[n]).join(''),
    sourceSum: symbols.reduce((sum, n) => sum + corpus.prime[n], 0),
    count: symbols.length,
  };
}).filter((entry) => entry.count >= 3);

const limit = 6000000;
const composite = new Uint8Array(limit + 1);
const primes = [];
for (let n = 2; n <= limit; n++) {
  if (composite[n]) continue;
  primes.push(n);
  if (n * n <= limit) {
    for (let k = n * n; k <= limit; k += n) composite[k] = 1;
  }
}
const rank = new Int32Array(limit + 1);
for (let i = 0; i < primes.length; i++) rank[primes[i]] = i + 1;
const triad = [
  'THEPRIMESARESACRED',
  'THETOTIENTFUNCTIANISSACRED',
  'ALLTHNGSSHOULDBEENCRYPTED',
];
const at = clauses.findIndex((c) => c.text === triad[0]);
assert.ok(at >= 0);
assert.deepEqual(clauses.slice(at, at + 3).map((c) => c.text), triad);
assert.deepEqual(clauses.slice(at, at + 3).map((c) => c.sourceSum), [853, 1039, 1237]);
assert.deepEqual(clauses.slice(at, at + 3).map((c) => rank[c.sourceSum]), [147, 175, 203]);
assert.equal(primes[173], 1033);
assert.equal(primes[174], 1039);

// The LP1 p5 JPEG's original complete 179-byte reversed-hex ASCII inset
// spells the complete 25-cell 1033 magic square, not an inferred grid.
assert.equal(sourceJpeg.length, 673066);
assert.equal(sourceJpeg.subarray(336713).equals(Buffer.from(sourceJpeg.subarray(0, 336353)).reverse()), true);
const center = sourceJpeg.subarray(336353, 336713).toString('ascii');
assert.equal(center.slice(0, 2), '\n\n');
const squareText = Buffer.from([...center.slice(2)].reverse().join(''), 'hex').toString('ascii');
const cells = [...squareText.matchAll(/\b\d+\b/g)].map((m) => Number(m[0]));
assert.equal(cells.length, 25);
assert.deepEqual(cells.slice(0, 5), [272, 138, 341, 131, 151]);
for (let i = 0; i < 5; i++) {
  assert.equal(cells.slice(i * 5, i * 5 + 5).reduce((a, b) => a + b), 1033);
  assert.equal(Array.from({ length: 5 }, (_, j) => cells[j * 5 + i]).reduce((a, b) => a + b), 1033);
}
assert.equal(Array.from({ length: 5 }, (_, i) => cells[i * 6]).reduce((a, b) => a + b), 1033);
assert.equal(Array.from({ length: 5 }, (_, i) => cells[4 + i * 4]).reduce((a, b) => a + b), 1033);

assert.equal(clauses.length, 87);
const triplets = [];
for (let i = 0; i < clauses.length - 2; i++) {
  const three = clauses.slice(i, i + 3);
  if (three.every((c) => rank[c.sourceSum] > 0)) triplets.push({ i, ranks: three.map((c) => rank[c.sourceSum]) });
}
assert.equal(triplets.length, 7);
const arithmetic = triplets.filter(({ ranks: r }) => r[1] - r[0] === r[2] - r[1]);
assert.deepEqual(arithmetic, [{ i: at, ranks: [147, 175, 203] }]);

const originals = corpus.pages.filter((p) => p.page <= 55).flatMap((p) => p.indices);
const native = corpus.pages.find((p) => p.page === 57).indices;
assert.equal(originals.length, 12956);
assert.equal(native.length, 95);
const schedule = originals.map((_, i) => primes[146 + 28 * i]);
assert.deepEqual(schedule.slice(0, 3), [853, 1039, 1237]);
assert.equal(schedule.at(-1), 5222579);
const norm = (x) => (x % 29 + 29) % 29;
const ioc = (list) => {
  const counts = Array(29).fill(0);
  for (const n of list) counts[n]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) / (list.length * (list.length - 1));
};
assert.ok(Math.abs(ioc(native) - 0.06270996640537514) < 1e-12);
const modes = [];
for (const operation of ['prime', 'totient', 'ordinal']) {
  const keyAt = (i) => operation === 'prime'
    ? schedule[i] : operation === 'totient' ? schedule[i] - 1 : 147 + 28 * i;
  for (const sign of [-1, 1]) {
    const deciphered = originals.map((c, i) => norm(c + sign * keyAt(i)));
    // Exact reversible original-cipher and native-GP plant checks.
    assert.deepEqual(deciphered.map((p, i) => norm(p - sign * keyAt(i))), originals);
    const planted = native.map((p, i) => norm(p - sign * keyAt(i)));
    assert.deepEqual(planted.map((c, i) => norm(c + sign * keyAt(i))), native);
    modes.push({ operation, sign, ioc: Number(ioc(deciphered).toFixed(12)),
      early: Number(ioc(deciphered.slice(0, 4000)).toFixed(12)),
      late: Number(ioc(deciphered.slice(-4000)).toFixed(12)) });
  }
}
assert.ok(modes.every((m) => m.ioc < 0.036));
console.log('LP1 original 3 sacred clauses:', triad);
console.log('Source GP sums: [853,1039,1237]; prime ranks: [147,175,203]; rank stride28.');
console.log('LP1 p5 original hidden square: all rows/columns/diagonals=1033, prior prime to 1039.');
console.log('Source LP1 period clauses:', clauses.length, 'three-consecutive-all-prime:', triplets.length,
  'arithmetic-progression triple(s):', arithmetic.length);
console.log('Original LP2 runes:', originals.length, 'schedule first3:', schedule.slice(0, 3));
console.log('Native p57 IoC:', ioc(native), 'original cipher IoC:', ioc(originals));
console.log('Source-derived direct source-to-key model results:', JSON.stringify(modes));
console.log('All 6 complete original inverses reconstruct exactly; no source-native plaintext recovered. PASS.');
