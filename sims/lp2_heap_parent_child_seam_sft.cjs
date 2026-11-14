"use strict";
/**
 * Original LP2 sibling-seam / binary-heap-parent alignment.
 *
 * This is an independently checkable relationship in original ciphertext.
 * No plaintext, cipher key, or authored heap instruction is inferred.
 *
 * Node.js 22: node sims/lp2_heap_parent_child_seam_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const corpus = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, "..", "resources/liber-primus/lp2-corpus.json"),
  "utf8"
));
const pages = Array.from({ length: 58 }, (_, page) =>
  corpus.pages.find((entry) => entry.page === page)?.indices
);
assert.equal(pages.length, 58);
assert(pages.every(Array.isArray));
assert.deepEqual(pages.map((p) => p.length > 0 ? 1 : 0).filter((x) => x === 0), [0]);
assert.equal(pages[50].length, 0);
assert.equal(pages[27].length, 234);
assert.equal(pages[55].length, 76);
assert.equal(pages[56].length, 85);
assert.equal(pages[57].length, 95);

/**
 * Find all exact crossing matches inside a parent, where the crossing
 * string includes a nonempty suffix of left child and a nonempty prefix
 * of right child, at lengths 2 through 10.
 * @param {number[]} parent
 * @param {number[]} left
 * @param {number[]} right
 * @returns {{ length: number, leftCount: number, parentOffset: number }[]}
 */
function crossingMatches(parent, left, right) {
  const matches = [];
  for (let length = 2; length <= 10; length++) {
    for (let leftCount = 1; leftCount < length; leftCount++) {
      if (leftCount > left.length || length - leftCount > right.length) {
        continue;
      }
      const crossing = left.slice(-leftCount).concat(
        right.slice(0, length - leftCount)
      );
      for (let start = 0; start + length <= parent.length; start++) {
        let equal = true;
        for (let i = 0; i < length; i++) {
          if (parent[start + i] !== crossing[i]) {
            equal = false;
            break;
          }
        }
        if (equal) {
          matches.push({ length, leftCount, parentOffset: start });
        }
      }
    }
  }
  return matches;
}

/**
 * Find every offset of a source-exact substring.
 * @param {number[]} haystack
 * @param {number[]} needle
 * @returns {number[]}
 */
function findAll(haystack, needle) {
  const offsets = [];
  for (let start = 0; start + needle.length <= haystack.length; start++) {
    if (needle.every((x, i) => haystack[start + i] === x)) {
      offsets.push(start);
    }
  }
  return offsets;
}

const parents = [];
const reversed = [];
for (let parent = 0; 2 * parent + 2 < pages.length; parent++) {
  const left = 2 * parent + 1;
  const right = 2 * parent + 2;
  const matches = crossingMatches(pages[parent], pages[left], pages[right]);
  const controls = crossingMatches(pages[parent], pages[right], pages[left]);
  parents.push({
    parent, left, right,
    maxLength: Math.max(0, ...matches.map((m) => m.length)),
    matches
  });
  reversed.push(Math.max(0, ...controls.map((m) => m.length)));
}
assert.equal(parents.length, 28);
const counts = Object.fromEntries(
  [0, 2, 3, 7].map((length) =>
    [length, parents.filter((p) => p.maxLength === length).length])
);
assert.deepEqual(counts, { 0: 16, 2: 10, 3: 1, 7: 1 });
const crossing7 = parents.flatMap((p) =>
  p.matches.filter((m) => m.length >= 7).map((m) => ({
    parent: p.parent, left: p.left, right: p.right, ...m
  }))
);
assert.deepEqual(crossing7, [{
  parent: 27, left: 55, right: 56,
  length: 7, leftCount: 6, parentOffset: 28
}]);
assert(reversed.every((maximum) => maximum <= 3));
assert.deepEqual(pages[55].slice(-6).concat(pages[56][0]), pages[27].slice(28, 35));
assert.deepEqual(
  pages[27].slice(28, 35).map((i) => corpus.translit[i]),
  ["D", "J", "U", "B", "E", "I", "AE"]
);

// A source-first hypothetical continuation: if the same left-six-rune
// suffix were copied into a parent, page28 should contain p57's last six.
// It does not, and no other complete heap parent has this six-rune relation.
const sixRuneParents = [];
for (let parent = 0; 2 * parent + 1 < pages.length; parent++) {
  const left = 2 * parent + 1;
  const offsets = findAll(pages[parent], pages[left].slice(-6));
  if (offsets.length) {
    sixRuneParents.push({ parent, left, offsets });
  }
}
assert.deepEqual(sixRuneParents, [
  { parent: 27, left: 55, offsets: [28] }
]);
assert.deepEqual(
  pages[57].slice(-6).map((i) => corpus.translit[i]),
  ["E", "M", "E", "R", "G", "E"]
);
assert.deepEqual(findAll(pages[28], pages[57].slice(-6)), []);

// Conditional combinatorial reference only: assuming *one fixed,
// pre-identified distinct ordered triple* and uniform re-labelling of
// all 58 physical pages, exactly 28 of 58*57*56 assignments make that
// triple a zero-based heap parent + ordered pair of children.
// The heap interpretation was noticed after finding the ciphertext seam,
// so the figure is not a discovery-adjusted or authorial probability.
const orderedTripleHeapFraction = 28 / (58 * 57 * 56);


// Source-led candidate inverse: use the parent tape beginning at the exact
// observed pointer p27[28] as a GP29 additive key for every original
// unknown p55 rune, with no phase or symbol deleted.
const mod29 = (n) => ((n % 29) + 29) % 29;
const candidatePad = pages[27].slice(28, 28 + pages[55].length);
assert.equal(candidatePad.length, 76);
const padCandidates = [-1, 1].map((sign) => {
  const plain = pages[55].map((cipher, i) =>
    mod29(cipher + sign * candidatePad[i])
  );
  for (let i = 0; i < pages[55].length; i++) {
    assert.equal(mod29(plain[i] - sign * candidatePad[i]),
      pages[55][i]);
  }
  const counts = Array(29).fill(0);
  for (const value of plain) counts[value]++;
  const ioc = counts.reduce((sum, count) => sum + count * (count - 1), 0)
    / (plain.length * (plain.length - 1));
  return { sign, ioc, head40: plain.slice(0, 40)
    .map((i) => corpus.translit[i]).join(" ") };
});
assert(Math.abs(padCandidates[0].ioc - 0.03333333333333333) < 1e-12);
assert(Math.abs(padCandidates[1].ioc - 0.030877192982456142) < 1e-12);

// Additional exact source-native self-indexing check: seven boundary
// GP-prime weights add to the (76+1)th ordinary prime (389).
const sharedSeven = pages[55].slice(-6).concat(pages[56][0]);
assert.deepEqual(sharedSeven, pages[27].slice(28, 35));
const boundaryPrimeSum = sharedSeven.reduce(
  (total, rune) => total + corpus.prime[rune], 0
);
assert.equal(boundaryPrimeSum, 389);
assert.equal(pages[55].length + 1, 77);

// The independent solved p56 schedule is Euler phi(successive primes)
// modulo29 with one literal, nonconsuming Fehu at source local index56.
// A parent tape used as the same direct pad for the right child would
// have to reproduce those 84 independently known key symbols.
const primes = [];
for (let n = 2; primes.length < 400; n++) {
  if (primes.every((p) => n % p !== 0)) primes.push(n);
}
assert.equal(pages[56][56], 0);
let exactSolvedPadMatches = 0;
const matchesAt = [];
for (let i = 0; i < 85; i++) {
  if (i === 56) continue;
  const expectedPad = (primes[i - (i > 56)] - 1) % 29;
  if (pages[27][28 + i] === expectedPad) {
    exactSolvedPadMatches++;
    matchesAt.push(i);
  }
}
assert.equal(exactSolvedPadMatches, 2);
assert.deepEqual(matchesAt, [63, 66]);

assert.equal(primes[76], 389);
const selfIndexingSeams = [];
let eligibleAdjacentSeams = 0;
for (let left = 0; left < 57; left++) {
  const leftPage = pages[left];
  const rightPage = pages[left + 1];
  if (leftPage.length < 6 || rightPage.length < 1) continue;
  eligibleAdjacentSeams++;
  const span = leftPage.slice(-6).concat(rightPage[0]);
  const gpSum = span.reduce((sum, i) => sum + corpus.prime[i], 0);
  const primeAtOrdinal = primes[leftPage.length];
  if (gpSum === primeAtOrdinal) {
    selfIndexingSeams.push({ left, right: left + 1,
      leftLength: leftPage.length, ordinal: leftPage.length + 1,
      gpSum, primeAtOrdinal });
  }
}
assert.equal(eligibleAdjacentSeams, 55);
assert.deepEqual(selfIndexingSeams, [{
  left: 55, right: 56, leftLength: 76,
  ordinal: 77, gpSum: 389, primeAtOrdinal: 389
}]);

console.log(JSON.stringify({
  source: "original 58 LP2 physical pages; source GP29 indices",
  sevenBoundaryPrimeSum: boundaryPrimeSum,
  nextPrimeOrdinal: 77,
  nextPrime: primes[76],
  sourceAdjacentSevenSelfIndexingCount: eligibleAdjacentSeams,
  sourceAdjacentSevenSelfIndexingHits: selfIndexingSeams,
  zeroBasedCompleteHeapParents: parents.length,
  maxCrossingMatchCounts: counts,
  exactSevenRuneCrossing: crossing7[0],
  exactSevenRuneSymbols: pages[27].slice(28, 35)
    .map((i) => corpus.translit[i]),
  reverseChildOrderMax: Math.max(...reversed),
  leftChildTerminalSixParentMatches: sixRuneParents,
  parentPointerAdditiveP55: padCandidates,
  parentPointerMatchesActualSolvedP56TotientPad: exactSolvedPadMatches,
  missingPage58Probe: "p28 does not contain the last six p57 runes",
  conditionalRandomPageLabels: {
    oneSpecificOrderedTripleAsHeapFamily: "1/6612",
    fraction: orderedTripleHeapFraction,
    warning: "postnoticed heap hypothesis; not a discovery-adjusted p-value"
  },
  classification: "original-ciphertext geometry; no decoder, key, or plaintext"
}, null, 2));
