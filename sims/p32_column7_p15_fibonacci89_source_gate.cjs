#!/usr/bin/env node
"use strict";

// Reproduce the Issue #311 cross-round p32/p15 source-selector gate.
// Uses only the checked-in LP2 corpus plus the original-source dimensions
// documented in im-results/cicada2012-pgp-uid-original-prime-domain-resolution.md
// and resources/historical/cicada2016-4gq25.md.

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"
));

function sieve(limit) {
  const flags = new Uint8Array(limit + 1);
  flags.fill(1);
  flags[0] = 0;
  flags[1] = 0;
  for (let p = 2; p * p <= limit; p++) {
    if (!flags[p]) continue;
    for (let n = p * p; n <= limit; n += p) flags[n] = 0;
  }
  const primes = [];
  for (let n = 2; n <= limit; n++) if (flags[n]) primes.push(n);
  return primes;
}
const primeList = sieve(10000);
function primePi(n) {
  let lo = 0, hi = primeList.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (primeList[mid] <= n) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}
function nthPrime(k) {
  assert(k >= 1 && k <= primeList.length);
  return primeList[k - 1];
}

const dimensions = {
  2012: [509, 503],
  2016: [563, 569],
};
const ranked = Object.fromEntries(Object.entries(dimensions).map(([year, dims]) => {
  const sorted = [...dims].sort((a, b) => a - b);
  return [year, { sorted, ranks: sorted.map(primePi) }];
}));
const rankShift = ranked[2016].ranks.map((v, i) => v - ranked[2012].ranks[i]);
assert.deepEqual(ranked[2012].ranks, [96, 97]);
assert.deepEqual(ranked[2016].ranks, [103, 104]);
assert.deepEqual(rankShift, [7, 7]);

const p32 = corpus.pages.find(p => p.page === 32);
assert(p32, "physical p32 must exist");
assert.equal(p32.indices.length, 121);
const weights = p32.indices.map(i => corpus.prime[i]);
const rows = Array.from({ length: 11 }, (_, r) => weights.slice(r * 11, r * 11 + 11));
const cols = Array.from({ length: 11 }, (_, c) => rows.map(row => row[c]));
const sum = xs => xs.reduce((a, b) => a + b, 0);
const row1Sum = sum(rows[0]);
const col1Sum = sum(cols[0]);
const row7 = rows[6];
const col7 = cols[6];
const row7Sum = sum(row7);
const col7Sum = sum(col7);
const row7Rank = primePi(row7Sum);
const row7col7 = rows[6][6];
const row4col7 = rows[3][6];

assert.equal(row1Sum, 563);
assert.equal(col1Sum, 569);
assert.equal(row7Sum, 577);
assert.equal(row7Rank, 106);
assert.equal(col7Sum, 463);
assert.equal(row7col7, 3);
assert.equal(row4col7, 89);

const fibs = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987];
const p15Ordinals = fibs.map(f => f + 1);
const p15Primes = p15Ordinals.map(nthPrime);
const p90 = nthPrime(90);
const p106 = nthPrime(106);
assert.equal(p90, 463);
assert.equal(p106, 577);
assert.equal(Math.abs(3301 - p90), 2838);
assert(p15Ordinals.includes(90));
assert(!p15Ordinals.includes(106));

const out = {
  dimensions_prime_ranks: ranked,
  sorted_axis_rank_shift: rankShift,
  p32_checksums: { row1Sum, col1Sum },
  p32_row7: { weights: row7, sum: row7Sum, primeRank: row7Rank },
  p32_col7: { weights: col7, sum: col7Sum },
  p32_selected_cells: { row7_col7: row7col7, row4_col7: row4col7 },
  p15_fibonacci_prime: { fibs, ordinals: p15Ordinals, primes: p15Primes },
  p15_f89_output: { ordinal: 90, prime: p90, printedValue: 2838 },
  interpretation: "The +7 shift nominates both row 7 and column 7; p15's column-specific match is visible only after reading p32 contents. No source-selected unique column or cipher operation."
};
console.log(JSON.stringify(out, null, 2));
