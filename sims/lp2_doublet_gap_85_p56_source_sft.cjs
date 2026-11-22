"use strict";

/**
 * Source-native LP2 repeat-marker distance test against the solved 85-rune
 * physical p56. Standalone SFT, Node.js 22:
 * node sims/lp2_doublet_gap_85_p56_source_sft.cjs
 *
 * Reads committed original-derived corpus. Does not modify the repository.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, "../resources/liber-primus/lp2-corpus.json"), "utf8"
));
const body = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
const p56 = corpus.pages[56].indices;

assert.equal(body.length, 12956);
assert.equal(p56.length, 85);

/** @param {number[]} stream */
function repeatSites(stream) {
  const positions = [];
  for (let i = 1; i < stream.length; ++i) {
    if (stream[i] === stream[i - 1]) positions.push(i);
  }
  return positions;
}

/** @param {number} count */
function firstPrimes(count) {
  const list = [];
  for (let n = 2; list.length < count; ++n) {
    if (list.every(p => p * p > n || n % p !== 0)) list.push(n);
  }
  return list;
}

/** @param {number[]} marks */
function stepResidues(marks) {
  return marks.slice(1).map((p, i) => (p - marks[i]) % 29);
}

/**
 * Find the maximum exact symbol matches after one fixed affine GP29
 * mapping. This is an over-permissive upper bound; no result is interpreted
 * as a known Cicada operation.
 * @param {number[]} source
 * @param {number[]} target
 */
function bestAffine(source, target) {
  let best = { matches: -1 };
  for (const reverse of [false, true]) {
    for (let multiplier = 1; multiplier < 29; ++multiplier) {
      for (let shift = 0; shift < 29; ++shift) {
        let matches = 0;
        for (let i = 0; i < target.length; ++i) {
          const j = reverse ? target.length - 1 - i : i;
          if ((source[j] * multiplier + shift) % 29 === target[i]) ++matches;
        }
        if (matches > best.matches) {
          best = { reverse, multiplier, shift, matches };
        }
      }
    }
  }
  return best;
}

/** @param {number[]} a @param {number[]} b */
function exactMatches(a, b) {
  assert.equal(a.length, b.length);
  return a.filter((x, i) => x === b[i]).length;
}

const actualSites = repeatSites(body);
assert.equal(actualSites.length, 86);
assert.equal(actualSites[0], 122);
assert.equal(actualSites[85], 12939);
const actualGaps = stepResidues(actualSites);
assert.equal(actualGaps.length, 85);
assert.deepEqual(actualGaps.slice(0, 8), [27, 17, 23, 13, 11, 23, 18, 1]);

// Authentic p56 consecutive-prime-totient control: plaintext F is copied
// transparently at local rune 56, without advancing the prime-key clock.
const prime = firstPrimes(85);
let tick = 0;
const p56Plain = p56.map((symbol, i) => i === 56
  ? 0
  : (symbol - (prime[tick++] - 1) % 29 + 29) % 29);
assert.equal(tick, 84);
assert.equal(p56[56], 0);
assert.deepEqual(p56Plain.slice(0, 5), [24, 9, 18, 9, 23]); // "ANEND"

const printed = {
  direct: exactMatches(actualGaps, p56),
  affine: bestAffine(actualGaps, p56)
};
const decrypted = {
  direct: exactMatches(actualGaps, p56Plain),
  affine: bestAffine(actualGaps, p56Plain)
};
assert.equal(printed.direct, 3);
assert.deepEqual(printed.affine,
  { reverse: false, multiplier: 8, shift: 12, matches: 10 });
assert.equal(decrypted.direct, 3);
assert.deepEqual(decrypted.affine,
  { reverse: true, multiplier: 8, shift: 17, matches: 10 });

// Independent source-length positive plant. Encode all 85 known p56 rune
// indices exactly as distances between 86 duplicate-symbol events, with
// no accidental additional duplicates, then recover all 85 symbol indices.
const plantedSites = [122];
for (const symbol of p56) {
  plantedSites.push(plantedSites.at(-1) + (symbol || 29));
}
assert.ok(plantedSites.at(-1) < body.length);
const positionSet = new Set(plantedSites);
const plant = new Array(body.length);
plant[0] = 0;
for (let i = 1; i < plant.length; ++i) {
  plant[i] = positionSet.has(i) ? plant[i - 1] : (plant[i - 1] + 1) % 29;
}
assert.deepEqual(repeatSites(plant), plantedSites);
assert.deepEqual(stepResidues(repeatSites(plant)), p56);

console.log(JSON.stringify({
  source: "LP2 physical pages 0–55 original GP29 indices",
  originalRunes: body.length,
  repeatEvents: actualSites.length,
  interEventDistances: actualGaps.length,
  targetP56Runes: p56.length,
  originalMarkEndpoints: [actualSites[0], actualSites.at(-1)],
  originalDistancesFirstEight: actualGaps.slice(0, 8),
  printedP56: printed,
  verifiedDecryptedP56: decrypted,
  plantedPositive: "85/85 exact native symbols recovered from 86 marker positions",
  recoveredUnknownPlaintext: false
}, null, 2));
