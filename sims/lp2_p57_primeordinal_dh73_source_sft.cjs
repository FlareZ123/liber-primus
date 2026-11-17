#!/usr/bin/env node
'use strict';

/**
 * Original 2013 Parable / solved p57 / p49-51 table prime-rank DH73 gate.
 *
 * Single-file runnable test, Windows Node22:
 *   node sims/lp2_p57_primeordinal_dh73_source_sft.cjs
 *
 * Reads original-source transcriptions only. Mathematical alignment is a
 * hypothesis; no unknown-page plaintext is claimed by passing this test.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = process.cwd();

/** @param {string} file @returns {any} */
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const C = read('resources/liber-primus/lp2-corpus.json');
const G = read('resources/liber-primus/base60-grid.json');
const id3 = fs.readFileSync(
  path.join(root, 'im-results/audio761-original-id3-frame-inventory.md'), 'utf8'
);
assert(id3.includes('Parable 1,595,277,641'));
const originalN = 1595277641;
const map = new Map(C.translit.map((r, i) => [r, i]));

/** @param {string} phrase @returns {number[]} */
function encodeNative(phrase) {
  const letters = phrase.toUpperCase()
    .replace(/K/g, 'C').replace(/V/g, 'U').replace(/[^A-Z]/g, '');
  const out = [];
  for (let i = 0; i < letters.length;) {
    // Source-authenticated p57 orthography: one ᛝ denotes ING or NG.
    // The same solved corpus uses ᛡ for the English IO digraph.
    if (letters.slice(i, i + 3) === 'ING') {
      out.push(map.get('NG'));
      i += 3;
      continue;
    }
    if (letters.slice(i, i + 2) === 'IO') {
      out.push(map.get('IA'));
      i += 2;
      continue;
    }
    const pair = letters.slice(i, i + 2);
    if (map.has(pair)) {
      out.push(map.get(pair));
      i += 2;
    } else {
      assert(map.has(letters[i]), 'Unencodable letter at ' + i);
      out.push(map.get(letters[i]));
      i++;
    }
  }
  return out;
}
/** @param {string} phrase @returns {number} */
const primeSum = (phrase) =>
  encodeNative(phrase).reduce((s, i) => s + C.prime[i], 0);
/** @param {number} n @returns {boolean} */
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}
/** @param {number} n @returns {number} */
function primePi(n) {
  let count = 0;
  for (let i = 2; i <= n; i++) if (isPrime(i)) count++;
  return count;
}
/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function powMod(base, exponent, modulus) {
  let output = 1;
  while (exponent > 0) {
    if (exponent % 2) output = output * base % modulus;
    base = base * base % modulus;
    exponent = Math.floor(exponent / 2);
  }
  return output;
}

const clauses = [
  'PARABLE',
  // The authentic p57 ING phoneme is one ᛝ rune, not I + NG.
  'LIKE THE INSTAR TUNNELING TO THE SURFACE',
  'WE MUST SHED OUR OWN CIRCUMFERENCES',
  'FIND THE DIVINITY WITHIN AND EMERGE'
];
const encoded = clauses.map(encodeNative);
const p57 = C.pages.find((page) => page.page === 57).indices;
assert.equal(p57.length, 95);
assert.deepEqual(encoded.flat(), p57, 'Every original clear rune must agree');
// PARABLE title is a fourth original p57 string, independent of the
// three 2013 MP3-number factors that first selected the address rule.
// Its GP-prime sum is itself prime, and its prime ordinal points to
// the original grid token 15. Under the previously frozen base59 codec,
// token15 evaluates to 64, the printed grid's 8x8 block size.
// This geometric interpretation was noticed retrospectively.
const titleSum = primeSum(clauses[0]);
const titlePrimeOrdinal = primePi(titleSum);
assert.equal(titleSum, 449);
assert.equal(titlePrimeOrdinal, 87);
const clauseSums = clauses.slice(1).map(primeSum);
const ranks = clauseSums.map(primePi);
assert.deepEqual(clauseSums, [1259, 1031, 1229]);
assert.deepEqual(ranks, [205, 173, 201]);
assert.equal(clauseSums.reduce((a, b) => a * b, 1), originalN);

const printed = G.rows.flat();
const BASE60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const BASE59 = BASE60.replace('f', '');
assert.equal(G.alphabet, BASE60);
assert.equal(printed.length, 256);
assert.equal(BASE59.length, 59);
assert(printed.every((token) => token.length === 2));
assert(printed.every((token) => !token.includes('f')));
/** @param {string} alphabet @returns {number[]} */
function convert(alphabet) {
  return printed.map((token) => {
    const hi = alphabet.indexOf(token[0]);
    const lo = alphabet.indexOf(token[1]);
    assert(hi >= 0 && lo >= 0);
    return hi * alphabet.length + lo;
  });
}
const bytes59 = convert(BASE59);
const bytes60 = convert(BASE60);
// Calibrate the missing-f radix premise: 256 trailing digits sample
// 60 possible characters. Under a simple iid base60 suffix null,
// exactly ONE missing among 60 is common (~37.7%), so the observed
// alphabet's missing f does NOT independently authenticate base59.
const trailingChars = printed.map((token) => token[1]);
const seenSuffixes = new Set(trailingChars);
assert.equal(trailingChars.length, 256);
assert.equal(seenSuffixes.size, 59);
assert.equal(seenSuffixes.has('f'), false);
const baseAlphabetSize = G.alphabet.length;
assert.equal(baseAlphabetSize, 60);
let occupancyDistribution = Array(baseAlphabetSize + 1).fill(0);
occupancyDistribution[0] = 1;
for (let draw = 0; draw < trailingChars.length; draw++) {
  const next = Array(baseAlphabetSize + 1).fill(0);
  for (let used = 0; used <= baseAlphabetSize; used++) {
    next[used] += occupancyDistribution[used] * used / baseAlphabetSize;
    if (used < baseAlphabetSize) {
      next[used + 1] += occupancyDistribution[used] *
        (baseAlphabetSize - used) / baseAlphabetSize;
    }
  }
  occupancyDistribution = next;
}
const chanceOneMissing = occupancyDistribution[baseAlphabetSize - 1];
const chanceAnyMissing = 1 - occupancyDistribution[baseAlphabetSize];
assert(Math.abs(chanceOneMissing - 0.37676962677387843) < 1e-12);
assert(Math.abs(chanceAnyMissing - 0.5693069430153482) < 1e-12);
const titleToken = printed[titlePrimeOrdinal];
const titleValue59 = bytes59[titlePrimeOrdinal];
const titleValue60 = bytes60[titlePrimeOrdinal];
assert.equal(titleToken, '15');
assert.equal(titleValue59, 64);
assert.equal(titleValue60, 65);
assert.equal(titleValue59, G.rows[0].length ** 2);
assert.equal(G.rows[0].length, 8);
const at59 = ranks.map((address) => bytes59[address]);
const at60 = ranks.map((address) => bytes60[address]);
const oneBased59 = ranks.map((address) => bytes59[address - 1]);
assert.deepEqual(ranks.map((index) => printed[index]), ['1G', '1v', '1E']);
assert.deepEqual(at59, [75, 115, 73]);
assert.deepEqual(at60, [76, 117, 74]);
assert.deepEqual(oneBased59, [191, 146, 108]);

const p = primeSum('FIND'); // 151
const a = primeSum('OUR'); // 21, independently equals public B's grid row index
const rowOfB = Math.floor(ranks[1] / 8);
assert.equal(rowOfB, 21);
assert.equal(a, rowOfB);
const must = primeSum('MUST'); // 186
const g = must % p; // 35
const B = at59[1]; // Public share comes from AUTHENTIC original table cell173.
const K = powMod(B, rowOfB, p); // K uses B cell's own row, no guessed b13.
const A = powMod(g, a, p); // Optional second public share, source checked below.
assert.deepEqual({p, g, a, A, B, K}, {
  p: 151, g: 35, a: 21, A: 107, B: 115, K: 73
});
// The discrete log of original B under source-derived g is precisely 13.
// This is an auxiliary consistency witness, not an input to recover K.
const candidateBExponents = Array.from({ length: p - 1 }, (_, i) => i)
  .filter((b) => powMod(g, b, p) === B);
assert.deepEqual(candidateBExponents, [13]);
assert.equal(powMod(A, candidateBExponents[0], p), K);
assert.equal(at59[0], (p - 1) / 2);
assert.equal(at59[1], B);
assert.equal(at59[2], K);
assert.equal(powMod(at59[1], a, p), at59[2]);
assert.notEqual(powMod(at60[1], a, p), at60[2]);
assert.notEqual(powMod(oneBased59[1], a, p), oneBased59[2]);
assert.equal(originalN % printed.length, K);
assert.equal(powMod(g, (p - 1) / 2, p), p - 1);

// Three authenticated parable prime ordinals plot three corners of a
// 5x5 grid square (rows21..25, columns1..5). The missing fourth corner
// independently matches the source-solved p56 word PAGE=224 under base59.
const tableCoords = ranks.map((i) => [Math.floor(i / 8), i % 8]);
assert.deepEqual(tableCoords, [[25, 5], [21, 5], [25, 1]]);
const upperLeft = 21 * 8 + 1;
assert.equal(upperLeft, 169);
assert.equal(printed[upperLeft], '3m');
assert.equal(bytes59[upperLeft], 224);
assert.equal(bytes60[upperLeft], 228);
const sourceSolved = fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp1-plaintext-reference.txt'), 'utf8'
);
const p56Text = sourceSolved.split('### 56')[1].split('### 57')[0];
assert.equal((p56Text.match(/\bPAGE\b/g) || []).length, 2);
assert.equal(primeSum('PAGE'), 224);
const cornerRows = [
  [upperLeft, ranks[1]],
  [ranks[2], ranks[0]]
].map((row) => row.map((i) => bytes59[i]));
assert.deepEqual(cornerRows, [[224, 115], [73, 75]]);
const leftMinusRight = 224 + 73 - 115 - 75;
assert.equal(leftMinusRight, A); // A is 107 from the separately derived DH tuple.
const shiftedCorner = 21 * 8 + 0; // rank-minus-one changes all three corners.
assert.equal(bytes59[shiftedCorner], 236);
assert.equal(bytes59[shiftedCorner] + bytes59[200] - bytes59[172] - bytes59[204], 7);

const outer = [];
for (let c = 0; c < 8; c++) outer.push(c);
for (let r = 1; r < 32; r++) outer.push(r * 8 + 7);
for (let c = 6; c >= 0; c--) outer.push(31 * 8 + c);
for (let r = 30; r > 0; r--) outer.push(r * 8);
assert.equal(outer.length, 76);
assert.equal(new Set(outer).size, 76);
assert.equal(outer[K], 24);
assert.equal(printed[outer[K]], '1n');
assert.equal(bytes59[outer[K]], A);

// Conditional permutation probability for the exact three values at
// three fixed distinct rank-address slots. Values were discovered retrospectively.
const freq = (value) => bytes59.filter((x) => x === value).length;
const count = [75, 115, 73].map(freq);
const conditionalProbability =
  (count[0] / 256) * (count[1] / 255) * (count[2] / 254);
assert.deepEqual(count, [2, 2, 1]);
assert.equal(1 / conditionalProbability, 4145280);

// Exact fixed-geometry null, conditional on the ORIGINAL base59 256-value
// multiset. Fix the three clause-rank addresses and the uniquely forced
// fourth corner, modulus FIND151, second value's row21 exponent and
// generator g35. Permute values among all 256 cells WITHOUT replacement.
// Count ordered four-cell assignments (UL,UR,LL,LR) satisfying
// LL = UR^21 mod151 and UL+LL-UR-LR = A107.
// The relation itself was found retrospectively: these probabilities
// must NEVER be treated as discovery-wide statistical evidence.
const valueFrequencies = new Map();
for (const value of bytes59) {
  valueFrequencies.set(value, (valueFrequencies.get(value) || 0) + 1);
}
const possibleValues = [...valueFrequencies.entries()];
const fixedGeometryDenominator = 256 * 255 * 254 * 253;
let sourceRelationAssignments = 0;
let exactAllCornersAssignments = 0;
for (const [publicB, publicMultiplicity] of possibleValues) {
  if (publicB < 1 || publicB >= p) continue;
  const proposedK = powMod(publicB, rowOfB, p);
  if (!valueFrequencies.has(proposedK) || proposedK === 0) continue;
  for (const [upperLeftValue] of possibleValues) {
    const lowerRightValue = upperLeftValue + proposedK - publicB - A;
    if (!valueFrequencies.has(lowerRightValue)) continue;
    const sequence = [publicB, proposedK, upperLeftValue, lowerRightValue];
    const previouslyTaken = new Map();
    let assignments = 1;
    for (const value of sequence) {
      const remaining = valueFrequencies.get(value) - (previouslyTaken.get(value) || 0);
      assignments *= remaining;
      previouslyTaken.set(value, (previouslyTaken.get(value) || 0) + 1);
    }
    sourceRelationAssignments += assignments;
    if (upperLeftValue === 224 && publicB === 115 &&
        proposedK === 73 && lowerRightValue === 75) {
      exactAllCornersAssignments += assignments;
    }
  }
}
assert.equal(sourceRelationAssignments, 29807);
assert.equal(exactAllCornersAssignments, 4);
assert.equal(fixedGeometryDenominator, 4195023360);
assert.equal(exactAllCornersAssignments / fixedGeometryDenominator, 1 / 1048755840);

console.log(JSON.stringify({
  p57Source: {
    titleSum,
    titlePrimeOrdinal,
    titleOriginalTableToken: titleToken,
    titleBase59Value: titleValue59,
    titleBase60Value: titleValue60,
    gridWidthSquared: G.rows[0].length ** 2,
    clearRuneMatch: '95/95',
    actualEnglish: 'TUNNELING (one ING rune)',
    clauseSums, primeOrdinals: ranks,
    actualTableTokens: ranks.map((index) => printed[index])
  },
  table: {
    base59ValuesAtZeroBasedRanks: at59,
    base60ValuesAtZeroBasedRanks: at60,
    base59ValuesAtRankMinusOne: oneBased59
  },
  sourceSelectedArithmeticCandidate: {
    original2013ParableNumber: originalN,
    literalModulo256: originalN % 256,
    modulus: p, generator: g, sourceSelectedPrivateA: a,
    exponentAlsoTableRowOfPublicShare: rowOfB,
    tablePublicShareB: B, derivedSharedK: K, sourceCheckedPublicA: A,
    optionalLogarithmOfB: candidateBExponents,
    firstClauseHalfGroupOrder: at59[0],
    secondClausePublicShare: at59[1],
    thirdClauseSharedValue: at59[2],
    outerRingAtKIndex: { ringIndex: K, flatCell: outer[K], value: bytes59[outer[K]] }
  },
  primeRankSquare: {
    anchoredCorners: { rows21and25: cornerRows, addresses: [169, 173, 201, 205] },
    missingCornerValue224: bytes59[169],
    solvedP56WordPAGEPrimeSum: primeSum('PAGE'),
    solvedP56PAGEOccurrences: 2,
    leftMinusRight,
    rankMinusOneAlternativeMissingCorner: bytes59[168]
  },
  conditionalExactSlotProbability: conditionalProbability,
  base59RadixPremiseNull: {
    sourceAlphabetSize: baseAlphabetSize,
    sourceTrailingDigitCount: trailingChars.length,
    observedDistinctTrailingDigits: seenSuffixes.size,
    omittedSourceDigit: 'f',
    conditionalSpecifiedFMissingProbability:
      ((baseAlphabetSize - 1) / baseAlphabetSize) ** trailingChars.length,
    chanceExactlyOneUnspecifiedMissingDigit: chanceOneMissing,
    chanceAnyUnspecifiedMissingDigit: chanceAnyMissing,
    conclusion: 'One unspecified absent trailing character is common under the declared base60 alphabet; missing f alone does not select base59.'
  },
  conditionalFixedGeometryNull: {
    countedOriginalMultisetPermutations: fixedGeometryDenominator,
    relationMatchedAssignments: sourceRelationAssignments,
    relationProbability: sourceRelationAssignments / fixedGeometryDenominator,
    exactFourOriginalCornerAssignments: exactAllCornersAssignments,
    exactFourOriginalCornersProbability:
      exactAllCornersAssignments / fixedGeometryDenominator,
    caution: 'Fixed selectors, radix, modulus and relation assumed in advance. Original discovery was retrospective.'
  },
  note: 'K73 is computed directly from table-sourced B115 and its zero-based row21 (also GP(OUR)=21), independent of any b=13 guess. Fixed-address permutation probability is unadjusted. Zero unknown-page plaintext.'
}, null, 2));
