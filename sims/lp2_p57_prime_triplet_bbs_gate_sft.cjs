/**
 * Original-input gate for a BBS consumer suggested by the authenticated
 * 2013 761.MP3 numeric tag and LP2 p57's three prime-valued body clauses.
 *
 * Hypothesis only: neither source prescribes Blum–Blum–Shub or a GP29 pad.
 * Run: node sims/lp2_p57_prime_triplet_bbs_gate_sft.cjs
 *
 * All 48 variants are source-fixed before looking at LP2 unknown ciphertext:
 * 2 initial states x0, 3 natural output projections, 3 printed reset clocks,
 * and 2 additive signs. No language-guided choice or key fitting is used.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @type {{page:number,indices:number[]}[]} */
const pages = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
    'utf8'
  )
).pages;

const PRIMES = [1031, 1229, 1259];
const P = 1031;
const Q = 1259;
const SEED = 1229;
const N = P * Q;

assert.equal(P % 4, 3);
assert.equal(Q % 4, 3);
assert.equal(SEED % 4, 1);
assert.equal(PRIMES.reduce((x, y) => x * y, 1), 1595277641);
assert.equal(N, 1298029);
assert.ok(N * N < Number.MAX_SAFE_INTEGER);

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const frequencies = Array(29).fill(0);
  for (const v of values) {
    assert.ok(Number.isInteger(v) && v >= 0 && v < 29);
    frequencies[v]++;
  }
  return frequencies.reduce((s, n) => s + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

/**
 * BBS x_(n+1) = x_n^2 (mod pq).
 * bit-msb/bit-lsb consumes five successive parity bits with rejection
 * for 29..31, producing unbiased GP29 symbols. residue projections are
 * the direct alternative, explicitly labelled noncanonical.
 * @param {number} count
 * @param {'seed'|'square'} initial
 * @param {'residue'|'high-residue'|'bit-msb'|'bit-lsb'} projection
 * @returns {number[]}
 */
function stream(count, initial, projection) {
  let x = initial === 'square' ? SEED * SEED % N : SEED;
  const out = [];
  while (out.length < count) {
    if (projection === 'residue' || projection === 'high-residue') {
      x = x * x % N;
      out.push(projection === 'residue' ? x % 29 : Math.floor(x / 29) % 29);
      continue;
    }
    let fiveBits = 0;
    for (let k = 0; k < 5; k++) {
      x = x * x % N;
      const bit = x % 2;
      if (projection === 'bit-msb') {
        fiveBits = 2 * fiveBits + bit;
      } else {
        fiveBits += bit * (2 ** k);
      }
    }
    if (fiveBits < 29) out.push(fiveBits);
  }
  return out;
}

/** @param {number[]} plain @param {number[]} key @param {number} sign */
function shift(plain, key, sign) {
  assert.equal(plain.length, key.length);
  return plain.map((c, i) => (c + sign * key[i] + 29) % 29);
}

const unknown = pages.filter(p => p.page >= 0 && p.page <= 55);
const book = unknown.flatMap(p => p.indices);
assert.equal(book.length, 12956);
assert.equal(unknown.length, 56);
const chapterRanges = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55],
];
const units = {
  book: [book],
  chapter: chapterRanges.map(([a, b]) =>
    unknown.filter(p => p.page >= a && p.page <= b).flatMap(p => p.indices)),
  page: unknown.filter(p => p.indices.length > 0).map(p => p.indices),
};
assert.equal(units.chapter.flat().length, 12956);
assert.equal(units.page.flat().length, 12956);
const clear57 = pages.find(p => p.page === 57).indices;
assert.equal(clear57.length, 95);

const measurements = [];
let plantedCases = 0;
for (const [clock, parts] of Object.entries(units)) {
  for (const initial of ['seed', 'square']) {
    for (const projection of ['residue', 'high-residue', 'bit-msb', 'bit-lsb']) {
      const cipher = parts.flat();
      const key = parts.flatMap(part => stream(part.length, initial, projection));
      for (const sign of [-1, 1]) {
        const output = shift(cipher, key, sign);
        // Complete inverse test with an independent, authentic clear-GP input.
        const plantedPlain = Array.from(
          {length: cipher.length}, (_, i) => clear57[i % clear57.length]);
        const plantedCipher = shift(plantedPlain, key, -sign);
        assert.deepEqual(shift(plantedCipher, key, sign), plantedPlain);
        plantedCases++;
        measurements.push({
          clock, initial, projection, sign,
          ioc: ioc(output),
        });
      }
    }
  }
}
assert.equal(plantedCases, 48);
const byScore = measurements.slice().sort((a, b) => b.ioc - a.ioc);
const report = {
  candidate: 'p57/761.mp3 BBS, conditional direct GP29 additive consumer',
  modulus: N,
  seed: SEED,
  gpRuneCount: book.length,
  unknownPageCount: unknown.length,
  directCandidateCount: measurements.length,
  plantedRoundTrips: plantedCases,
  originalCipherIoC: ioc(book),
  originalSolvedP57ClearIoC: ioc(clear57),
  minDecodedIoC: byScore[byScore.length - 1].ioc,
  maxDecodedIoC: byScore[0].ioc,
  strongestVariant: byScore[0],
  allVariants: measurements,
};
process.stdout.write(JSON.stringify(report, null, 2) + '\n');
