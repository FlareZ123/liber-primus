"use strict";

/**
 * LP2 2013 missing-primes / terminal-180 fixed-register gate.
 * Node.js 22 CommonJS; no network, writes, or dependencies.
 * Original LP2 source: resources/liber-primus/lp2-corpus.json and lp2-grid-256.json.
 * 2013 historical prime-gap witness:
 * https://github.com/neuroretransmit/cicada/blob/main/2013/004-first-onion/README.md
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");

const read = (path) => JSON.parse(fs.readFileSync(path, "utf8"));
const mod29 = (x) => ((x % 29) + 29) % 29;

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const primes = [];
  for (let n = 2; primes.length < count; n++) {
    let prime = true;
    for (let j = 2; j * j <= n; j++) {
      if (n % j === 0) {
        prime = false;
        break;
      }
    }
    if (prime) primes.push(n);
  }
  return primes;
}

/** @param {number[]} arr @returns {number} */
function ioc(arr) {
  const counts = Array(29).fill(0);
  for (const x of arr) counts[x]++;
  return counts.reduce((sum, c) => sum + c * (c - 1), 0) / (arr.length * (arr.length - 1));
}

const corpus = read("resources/liber-primus/lp2-corpus.json");
const table = read("resources/liber-primus/lp2-grid-256.json");
const primes = firstPrimes(465);
const missing = primes.slice(20, 200);
assert.deepEqual([primes[19], missing[0], missing.at(-1), primes[200]], [71, 73, 1223, 1229]);
assert.equal(missing.length, 180);

assert.equal(table.bytes.length, 256);
assert.equal(corpus.pages[55].indices.length, 76);
assert.equal(corpus.pages[56].indices.length, 85);
assert.equal(corpus.pages[57].indices.length, 95);
assert.equal(corpus.pages[56].indices[56], 0);

let tick = 0;
const solved56 = corpus.pages[56].indices.map((cipher, i) => {
  if (i === 56) return cipher; // The established literal-F exception, no key tick.
  const value = mod29(cipher - (primes[tick] - 1));
  tick++;
  return value;
});
assert.equal(tick, 84);
assert.equal(solved56.slice(0, 5).map((x) => corpus.translit[x]).join(""), "ANEND");
const solved = solved56.concat(corpus.pages[57].indices);
const published = corpus.pages[56].indices.concat(corpus.pages[57].indices);
assert.equal(solved.length, missing.length);

const records = [];
for (let row = 1, i = 0; row <= 30; row++) {
  for (let col = 1; col <= 6; col++, i++) {
    records.push({
      i, row, col, byte: table.bytes[row * 8 + col],
      prime: missing[i], plain: solved[i], printed: published[i],
    });
  }
}
assert.equal(records.length, 180);

const plainMatches = records.filter((x) => mod29(x.byte - (x.prime - 1)) === x.plain).length;
const publishedMatches = records.filter((x) => mod29(x.byte - (x.prime - 1)) === x.printed).length;
assert.equal(plainMatches, 4);
assert.equal(publishedMatches, 5);

// An arbitrary SECRET stationary bivariate table F(B mod29, prime mod29)
// must emit the same plaintext for identical input pairs.
const states = new Map();
const contradictions = [];
for (const r of records) {
  const key = `${r.byte % 29}:${r.prime % 29}`;
  const old = states.get(key);
  if (old === undefined) states.set(key, r);
  else if (old.plain !== r.plain) contradictions.push({ key, first: old, second: r });
}
assert.equal(states.size, 166);
assert.equal(contradictions.length, 14);
assert.deepEqual(contradictions[0], {
  key: "28:19",
  first: { i: 33, row: 6, col: 4, byte: 86, prime: 251, plain: 18, printed: published[33] },
  second: { i: 52, row: 9, col: 5, byte: 144, prime: 367, plain: 1, printed: published[52] },
});

// This impossibility already holds independently inside each solved physical page.
const countConflicts = (list) => {
  const seen = new Map();
  let conflicts = 0;
  for (const r of list) {
    const key = `${r.byte % 29}:${r.prime % 29}`;
    if (seen.has(key) && seen.get(key) !== r.plain) conflicts++;
    else seen.set(key, r.plain);
  }
  return conflicts;
};
assert.equal(countConflicts(records.slice(0, 85)), 1);
assert.equal(countConflicts(records.slice(85)), 2);

// A stronger impossibility survives even if the decoder reads ALL eight bits
// of the source grid byte; reducing only the historical prime to its GP29
// residue still collapses distinct original inputs to incompatible plaintext.
const lookupConflicts = (keyOf) => {
  const table = new Map();
  const failures = [];
  for (const r of records) {
    const key = keyOf(r);
    const old = table.get(key);
    if (old && old.plain !== r.plain) failures.push({ key, first: old, second: r });
    else if (!old) table.set(key, r);
  }
  return { distinct: table.size, failures };
};
const fullByte = lookupConflicts((r) => `${r.byte}:${r.prime % 29}`);
assert.equal(fullByte.distinct, 179);
assert.equal(fullByte.failures.length, 1);
assert.deepEqual([fullByte.failures[0].first.i, fullByte.failures[0].second.i], [21, 86]);
assert.deepEqual([fullByte.failures[0].first.byte, fullByte.failures[0].second.byte], [54, 54]);
assert.deepEqual([fullByte.failures[0].first.prime, fullByte.failures[0].second.prime], [181, 587]);
assert.deepEqual([fullByte.failures[0].first.plain, fullByte.failures[0].second.plain], [4, 24]);

// The high quotient of an odd prime by the odd modulus29 has parity
// determined by the prime's residue: prime=q*29+r and q+r is odd.
// Thus appending prime quotient parity cannot distinguish any collision.
const primeQuotientParity = lookupConflicts(
  (r) => `${r.byte % 29}:${r.prime % 29}:${Math.floor(r.prime / 29) % 2}`,
);
assert.equal(primeQuotientParity.failures.length, 14);
assert.equal(primeQuotientParity.distinct, 166);
const byteQuotientParity = lookupConflicts(
  (r) => `${r.byte % 29}:${r.prime % 29}:${Math.floor(r.byte / 29) % 2}`,
);
assert.equal(byteQuotientParity.failures.length, 9);
assert.equal(byteQuotientParity.distinct, 171);

// Fully invertible planted GF29 affine relationship on the original grid and prime inputs.
for (const r of records) {
  const planted = mod29(7 * r.byte + 11 * (r.prime - 1) + 2);
  const recoveredByteResidue = mod29(25 * (planted - 11 * (r.prime - 1) - 2));
  assert.equal(recoveredByteResidue, r.byte % 29);
}

const p55 = corpus.pages[55].indices;
const first76Inverse = p55.map((x, i) => mod29(x - (missing[i] - 1)));
assert.equal(ioc(first76Inverse), 0.03824561403508772);
console.log(JSON.stringify({
  historicalGap: { before: 71, omittedFirst: 73, omittedLast: 1223, after: 1229, length: 180 },
  matchedGeometry: { outerGrid: 76, innerGrid: 180, p55: 76, solvedP56P57: 180 },
  fixedKnownPlaintextGate: { primeTotientMatches: plainMatches, originalPublishedMatches: publishedMatches, total: 180 },
  arbitraryStationaryPairCodebook: { uniquePairs: states.size, conflicts: contradictions.length, withinP56: 1, withinP57: 2 },
  firstContradiction: contradictions[0],
  strongerFullByteSecretLookup: { distinct: fullByte.distinct, contradictions: fullByte.failures.length, witness: fullByte.failures[0] },
  quotientParityLift: { primeQuotientContradictions: primeQuotientParity.failures.length, byteQuotientContradictions: byteQuotientParity.failures.length },
  p55First76MissingPrimeInverse: { ioc: ioc(first76Inverse), opening: first76Inverse.slice(0, 30).map((i) => corpus.translit[i]).join("") },
  positive: "180/180 planted GF29 affine byte residues recovered exactly",
}, null, 2));
