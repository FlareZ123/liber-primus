#!/usr/bin/env node
"use strict";

// Reproduce the p4 Wisdom phi-grid -> p36 state packet -> p21 H2D
// -> p12/p26 state-pair route. This is a state/navigation result,
// not unknown plaintext recovery.

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const mod = (n, p = 29) => ((n % p) + p) % p;

function phi(n) {
  let x = n;
  let rem = n;
  for (let p = 2; p * p <= rem; p++) {
    if (rem % p === 0) {
      while (rem % p === 0) rem /= p;
      x -= Math.floor(x / p);
    }
  }
  if (rem > 1) x -= Math.floor(x / rem);
  return x;
}

function invMod(a, p = 29) {
  for (let x = 1; x < p; x++) if (mod(a * x, p) === 1) return x;
  throw new Error("noninvertible scalar " + a);
}

function detMod(A, p = 29) {
  const n = A.length;
  const a = A.map((row) => row.map((x) => mod(x, p)));
  let det = 1;
  for (let col = 0; col < n; col++) {
    let pivot = col;
    while (pivot < n && a[pivot][col] === 0) pivot++;
    if (pivot === n) return 0;
    if (pivot !== col) {
      [a[pivot], a[col]] = [a[col], a[pivot]];
      det = mod(-det, p);
    }
    const value = a[col][col];
    det = mod(det * value, p);
    const inverse = invMod(value, p);
    for (let row = col + 1; row < n; row++) {
      const factor = mod(a[row][col] * inverse, p);
      for (let j = col; j < n; j++) a[row][j] = mod(a[row][j] - factor * a[col][j], p);
    }
  }
  return det;
}

function inverseMatrix(A, p = 29) {
  const n = A.length;
  const a = A.map((row, i) =>
    row.map((x) => mod(x, p)).concat(Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)))
  );
  for (let col = 0; col < n; col++) {
    let pivot = col;
    while (pivot < n && a[pivot][col] === 0) pivot++;
    if (pivot === n) throw new Error("singular matrix");
    [a[col], a[pivot]] = [a[pivot], a[col]];
    const inverse = invMod(a[col][col], p);
    a[col] = a[col].map((x) => mod(x * inverse, p));
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = a[row][col];
      a[row] = a[row].map((x, j) => mod(x - factor * a[col][j], p));
    }
  }
  return a.map((row) => row.slice(n));
}

function matMul(A, B) {
  return A.map((row) =>
    B[0].map((_, j) => mod(row.reduce((sum, x, k) => sum + x * B[k][j], 0)))
  );
}

function mulLeft(A, v) {
  return A.map((row) => mod(row.reduce((sum, x, j) => sum + x * v[j], 0)));
}

function mulRight(v, A) {
  return A[0].map((_, j) => mod(v.reduce((sum, x, i) => sum + x * A[i][j], 0)));
}

function H2D(pair) {
  assert.equal(pair.length, 2);
  return [mod(pair[0] - pair[1]), mod(pair[0] + pair[1])];
}

function H5(v) {
  assert.equal(v.length, 5);
  return [
    mod(v[0] - v[4]),
    mod(v[1] - v[3]),
    v[2],
    mod(v[1] + v[3]),
    mod(v[0] + v[4]),
  ];
}

const squareRaw = read("resources/external/derived/2014-stage04/05-square.txt")
  .match(/\d+/g)
  .map(Number);
assert.equal(squareRaw.length, 25);
const square = Array.from({ length: 5 }, (_, r) => squareRaw.slice(5 * r, 5 * r + 5));
const M = square.map((row) => row.map((n) => mod(phi(n))));
const expectedM = [
  [12, 15, 10, 14, 5],
  [4, 24, 19, 12, 6],
  [25, 23, 14, 23, 25],
  [6, 12, 19, 24, 4],
  [5, 14, 10, 15, 12],
];
assert.deepEqual(M, expectedM);
assert.equal(detMod(M), 28);
const Mi = inverseMatrix(M);
const identity = Array.from({ length: 5 }, (_, i) =>
  Array.from({ length: 5 }, (_, j) => (i === j ? 1 : 0))
);
assert.deepEqual(matMul(M, Mi), identity);
assert.deepEqual(matMul(Mi, M), identity);

// The DH3301 exponent selector is conditional on an unsigned participant
// transcript; reproduce it as context, not as authenticated provenance.
const participantExponent = 1661;
const phiExponent = phi(participantExponent);
const cellNumber = mod(phiExponent);
assert.equal(phiExponent, 1500);
assert.equal(cellNumber, 21);
const selectedCell = square[Math.floor((cellNumber - 1) / 5)][(cellNumber - 1) % 5];
assert.equal(selectedCell, 151);
function primeRank(n) {
  let rank = 0;
  for (let x = 2; x <= n; x++) {
    let prime = true;
    for (let d = 2; d * d <= x; d++) if (x % d === 0) { prime = false; break; }
    if (prime) rank++;
  }
  return rank;
}
assert.equal(primeRank(selectedCell), 36);

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeToValue = new Map(corpus.runes.map((rune, i) => [rune, i]));
const parts = read("resources/liber-primus/lp2-transcription.txt").split(/^\s*%\s*$/m);

function pageFragments(page) {
  const partIndex = page <= 49 ? page : page - 1;
  const text = parts[partIndex];
  if (typeof text !== "string") return [];
  const result = [];
  let values = [];
  let start = 0;
  let offset = 0;
  const flush = () => {
    if (!values.length) return;
    result.push({
      page,
      ordinal: result.length + 1,
      index: result.length,
      start,
      values: values.slice(),
    });
    values = [];
  };
  for (const ch of [...text]) {
    const value = runeToValue.get(ch);
    if (value !== undefined) {
      if (!values.length) start = offset;
      values.push(value);
      offset++;
    } else if ((ch === "-" || ch === ".") && values.length) {
      flush();
    }
    // A slash and a line break continue the physical-page fragment.
  }
  flush();
  return result;
}

const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const messageStart = signed.indexOf("Hello.");
const signatureStart = signed.indexOf("-----BEGIN PGP SIGNATURE-----");
assert(messageStart >= 0 && signatureStart > messageStart);
const clear = signed.slice(messageStart, signatureStart).replace(/\b7A35090F\b/g, "");
const sourceWords = (clear.match(/[A-Za-z]+/g) || []).map((word) => word.toUpperCase());
assert.equal(sourceWords.length, 43);
for (const [i, word] of [[4, "EMPTY"], [12, "THE"], [15, "WORDS"], [19, "THEIR"], [21, "IS"], [26, "NUMBERS"], [36, "GOOD"]]) {
  assert.equal(sourceWords[i], word);
}

function gpWord(word) {
  const normalized = word.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const tokens = corpus.translit.map((token, value) => ({ token, value })).sort((a, b) => b.token.length - a.token.length);
  const values = [];
  for (let offset = 0; offset < normalized.length;) {
    const match = tokens.find((entry) => normalized.startsWith(entry.token, offset));
    if (!match) throw new Error("cannot GP0-encode " + word + " at " + offset);
    values.push(match.value);
    offset += match.token.length;
  }
  return values;
}

const state = { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2, e: 3, q: 4 };
const statePacket = [state.b, state.B, state.q, mod(state.p - state.K), state.q];

const p36 = pageFragments(36)[36];
assert.deepEqual(
  { ordinal: p36.ordinal, index: p36.index, start: p36.start, values: p36.values },
  { ordinal: 37, index: 36, start: 169, values: [2, 22, 4, 1, 20] }
);
const matrixOutput = mulLeft(M, p36.values);
assert.deepEqual(matrixOutput, statePacket);
assert.deepEqual(matrixOutput.map((i) => sourceWords[i]), ["WORDS", "THEIR", "EMPTY", "IS", "EMPTY"]);
assert.deepEqual(H5(p36.values), [
  state.a + state.g,
  mod(state.p - state.K),
  state.q,
  state.p,
  state.p - 1,
]);

// The exact ordered state packet is a singleton among all 318 five-rune
// page fragments under the four simplest Hill conventions.
const fiveRuneFragments = [];
for (let page = 0; page <= 55; page++) {
  if (page === 50) continue;
  for (const fragment of pageFragments(page)) {
    if (fragment.values.length === 5) fiveRuneFragments.push(fragment);
  }
}
assert.equal(fiveRuneFragments.length, 318);
const variants = [
  ["M-column", (v) => mulLeft(M, v)],
  ["M-row", (v) => mulRight(v, M)],
  ["inverse-M-column", (v) => mulLeft(Mi, v)],
  ["inverse-M-row", (v) => mulRight(v, Mi)],
];
const variantMatches = variants.map(([name, apply]) => ({
  name,
  hits: fiveRuneFragments
    .filter((fragment) => JSON.stringify(apply(fragment.values)) === JSON.stringify(statePacket))
    .map((fragment) => ({
      page: fragment.page,
      ordinal: fragment.ordinal,
      index: fragment.index,
      values: fragment.values,
    })),
}));
assert.deepEqual(variantMatches.map((x) => [x.name, x.hits.length]), [
  ["M-column", 1],
  ["M-row", 0],
  ["inverse-M-column", 0],
  ["inverse-M-row", 0],
]);
assert.equal(variantMatches[0].hits[0].page, 36);
assert.equal(variantMatches[0].hits[0].ordinal, 37);

// Agent1's DH-state adversarial audit records a near-miss tuple with b and K
// swapped. It must not produce this ordered state packet.
const wrongNearMissPacket = [2, 19, 4, 8, 4];
const wrongNearMissHits = fiveRuneFragments.filter((fragment) =>
  JSON.stringify(mulLeft(M, fragment.values)) === JSON.stringify(wrongNearMissPacket)
);
assert.equal(wrongNearMissHits.length, 0);

// The q endpoints select the literal H fragment on p4; p-K selects p21.
const p4H = pageFragments(4)[4];
assert.deepEqual(p4H.values, [8]);
assert.equal(corpus.translit[8], "H");
const p21 = pageFragments(21)[21];
assert.deepEqual(p21.values, [19, 7]);
const p21H2D = H2D(p21.values);
assert.deepEqual(p21H2D, [12, 26]);
assert.deepEqual(p21H2D.map((i) => sourceWords[i]), ["THE", "NUMBERS"]);

// THE / NUMBERS selects p12 fragment13 and p26 fragment27.
const p12 = pageFragments(12)[12];
const p26 = pageFragments(26)[26];
assert.deepEqual(p12.values, [28, 1, 0, 15, 20]);
assert.deepEqual(p26.values, [4, 19, 22]);
const sumMod29 = (fragment) => mod(fragment.values.reduce((sum, value) => sum + value, 0));
const lengthPacket = H2D([p12.values.length, p26.values.length]);
const sumPacket = H2D([sumMod29(p12), sumMod29(p26)]);
assert.deepEqual(lengthPacket, [state.K, state.A]);
assert.deepEqual(sumPacket, [state.B, state.p - 1]);

// "THE NUMBERS": their GP0 sums, reduced modulo 29, select p20 and p25.
const theGP = gpWord(sourceWords[12]);
const numbersGP = gpWord(sourceWords[26]);
const theRawNumber = theGP.reduce((sum, value) => sum + value, 0);
const numbersRawNumber = numbersGP.reduce((sum, value) => sum + value, 0);
const numberPages = [mod(theRawNumber), mod(numbersRawNumber)];
assert.deepEqual({ theGP, numbersGP, theRawNumber, numbersRawNumber, numberPages }, {
  theGP: [2, 18],
  numbersGP: [9, 1, 19, 17, 18, 4, 15],
  theRawNumber: 20,
  numbersRawNumber: 83,
  numberPages: [20, 25],
});
const p20 = pageFragments(numberPages[0])[numberPages[0]];
const p25Numbered = pageFragments(numberPages[1])[numberPages[1]];
assert.deepEqual(p20.values, [11, 10]);
assert.deepEqual(p25Numbered.values, [25, 17]);
const numberLengthPacket = H2D([p20.values.length, p25Numbered.values.length]);
const numberSumPacket = H2D([sumMod29(p20), sumMod29(p25Numbered)]);
assert.deepEqual(numberLengthPacket, [0, state.q]);
assert.deepEqual(numberSumPacket, [state.A, state.g]);

// Charge the same 42x42 ordered-pair family. A p20/p38 collision exists;
// p25 is distinguished by its independent one-rise route and unique [K,g] object.
const agPairMatches = [];
for (const left of indexed) {
  for (const right of indexed) {
    const lengths = H2D([left.fragment.values.length, right.fragment.values.length]);
    const sums = H2D([sumMod29(left.fragment), sumMod29(right.fragment)]);
    if (
      JSON.stringify(lengths) === JSON.stringify([0, state.q]) &&
      JSON.stringify(sums) === JSON.stringify([state.A, state.g])
    ) {
      agPairMatches.push({ i: left.i, j: right.i });
    }
  }
}
assert.deepEqual(agPairMatches, [{ i: 20, j: 25 }, { i: 20, j: 38 }]);

// Existing p25 side object: predecessor rune plus p25 fragment30.
const p25Fragments = pageFragments(25);
const p25SideObject = [p25Fragments[28].values[p25Fragments[28].values.length - 1], ...p25Fragments[29].values];
assert.deepEqual(p25SideObject, [18, 3, 20, 10, 11, 16]);
const p25SideState = H2D([p25SideObject[0], p25SideObject[p25SideObject.length - 1]]);
assert.deepEqual(p25SideState, [state.K, state.g]);

// The three independently sourced pairs close a K-A-g state triangle.
const N = [[state.A, state.g], [state.K, state.g]];
assert.deepEqual(N, [[8, 5], [2, 5]]);
assert.equal(detMod(N), 1);
const Ni = inverseMatrix(N);
assert.deepEqual(Ni, [[5, 24], [27, 8]]);
const p21HillPlain = mulLeft(Ni, p21.values);
assert.deepEqual(p21HillPlain, [2, 18]);
assert.deepEqual(p21HillPlain.map((i) => corpus.translit[i]), ["TH", "E"]);
assert.equal(p21HillPlain.map((i) => corpus.translit[i]).join(""), "THE");

// Familywise two-rune control: only p21 fragment22 decrypts to THE.
const twoRuneFragments = [];
for (let page = 0; page <= 55; page++) {
  if (page === 50) continue;
  for (const fragment of pageFragments(page)) {
    if (fragment.values.length === 2) twoRuneFragments.push(fragment);
  }
}
assert.equal(twoRuneFragments.length, 465);
const Nt = N.map((_, i) => N.map((row) => row[i]));
const Nit = inverseMatrix(Nt);
const twoRuneVariants = [
  ["N-column", (v) => mulLeft(N, v)],
  ["N-inverse-column", (v) => mulLeft(Ni, v)],
  ["N-transpose-column", (v) => mulLeft(Nt, v)],
  ["N-inverse-transpose-column", (v) => mulLeft(Nit, v)],
];
const theRuneHits = twoRuneVariants.map(([name, apply]) => ({
  name,
  hits: twoRuneFragments.filter((fragment) => JSON.stringify(apply(fragment.values)) === JSON.stringify([2, 18]))
    .map((fragment) => ({ page: fragment.page, ordinal: fragment.ordinal, values: fragment.values })),
}));
assert.deepEqual(theRuneHits.map((entry) => [entry.name, entry.hits.length]), [
  ["N-column", 0],
  ["N-inverse-column", 1],
  ["N-transpose-column", 0],
  ["N-inverse-transpose-column", 0],
]);
assert.deepEqual(theRuneHits[1].hits, [{ page: 21, ordinal: 22, values: [19, 7] }]);
assert.equal(pageFragments(21).filter((fragment) => fragment.values.length === 2).length, 9);

// The p25 cube output OITOHL does not become the p28 READ OUT candidate
// under this local p21 Hill key; do not generalize the key to every receiver.
const p25CubeRaw = [3, 10, 16, 3, 8, 20];
const p28ReadOut = [4, 28, 23, 3, 1, 16];
const p25UnderNi = [];
for (let i = 0; i < p25CubeRaw.length; i += 2) p25UnderNi.push(...mulLeft(Ni, p25CubeRaw.slice(i, i + 2)));
assert.deepEqual(p25UnderNi, [23, 16, 7, 21, 27, 28]);
assert.notDeepEqual(p25UnderNi, p28ReadOut);

// The independently reported p23 red-span lengths are state-typed by the
// q, K, A recovered above: H([2,6])=[-q,A], H([3,5])=[-K,A].
const p23FirstFour = pageFragments(23).slice(0, 4);
const p23Lengths = p23FirstFour.map((fragment) => fragment.values.length);
const p23H2D = [H2D(p23Lengths.slice(0, 2)), H2D(p23Lengths.slice(2, 4))];
assert.deepEqual(p23Lengths, [2, 6, 3, 5]);
assert.deepEqual(p23H2D, [[25, 8], [27, 8]]);
assert.deepEqual(p23H2D, [[mod(-state.q), state.A], [mod(-state.K), state.A]]);

// Familywise charge: every ordered pair, including repeats, from all
// available source-indexed fragments page i / fragment i+1, i=0..42.
const indexed = [];
const missing = [];
for (let i = 0; i <= 42; i++) {
  const fragment = pageFragments(i)[i];
  if (fragment) indexed.push({ i, fragment });
  else missing.push(i);
}
assert.equal(indexed.length, 42);
assert.deepEqual(missing, [32]);
const lengthOnlyMatches = [];
const pairMatches = [];
for (const left of indexed) {
  for (const right of indexed) {
    const lengths = H2D([left.fragment.values.length, right.fragment.values.length]);
    const sums = H2D([sumMod29(left.fragment), sumMod29(right.fragment)]);
    if (JSON.stringify(lengths) === JSON.stringify([state.K, state.A])) {
      lengthOnlyMatches.push({ i: left.i, j: right.i });
    }
    if (
      JSON.stringify(lengths) === JSON.stringify([state.K, state.A]) &&
      JSON.stringify(sums) === JSON.stringify([state.B, state.p - 1])
    ) {
      pairMatches.push({ i: left.i, j: right.i });
    }
  }
}
assert.equal(lengthOnlyMatches.length, 55);
assert.deepEqual(pairMatches, [{ i: 12, j: 26 }]);

// The prefix indices [15,19] select a length-only control pair.
const p15 = pageFragments(15)[15];
const p19Prefix = pageFragments(19)[19];
const prefixLengths = H2D([p15.values.length, p19Prefix.values.length]);
const prefixSums = H2D([sumMod29(p15), sumMod29(p19Prefix)]);
assert.deepEqual(prefixLengths, [state.K, state.A]);
assert.deepEqual(prefixSums, [4, 1]);

// A one-step continuation through [B,p-1]=[19,22] does not reproduce
// the state packet; do not recursively extend the map.
const p19 = pageFragments(19)[19];
const p22 = pageFragments(22)[22];
const continuationLengths = H2D([p19.values.length, p22.values.length]);
const continuationSums = H2D([sumMod29(p19), sumMod29(p22)]);
assert.deepEqual(continuationLengths, [0, 6]);
assert.deepEqual(continuationSums, [17, 9]);
assert.notDeepEqual(continuationLengths, [state.K, state.A]);
assert.notDeepEqual(continuationSums, [state.B, state.p - 1]);

console.log(JSON.stringify({
  classification: "source-selected state route; p21 fragment22 decrypts to THE; no full-page plaintext recovered",
  phiSquare: square,
  phiGridMod29: M,
  determinantMod29: detMod(M),
  conditionalSelector: { exponent: participantExponent, phi: phiExponent, cell: cellNumber, value: selectedCell, primeRank: 36 },
  p36: { ordinal: p36.ordinal, index: p36.index, values: p36.values, M_times_C: matrixOutput, sourceWords: matrixOutput.map((i) => sourceWords[i]), H5: H5(p36.values) },
  fiveRuneFragmentCount: fiveRuneFragments.length,
  variantMatches,
  wrongNearMissPacket,
  wrongNearMissHits: wrongNearMissHits.length,
  p4H: p4H.values,
  p21: { values: p21.values, H2D: p21H2D, sourceWords: p21H2D.map((i) => sourceWords[i]) },
  p23CrossCheck: { redSpanLengths: p23Lengths, H2D: p23H2D, predictedFrom: { negativeQ: mod(-state.q), negativeK: mod(-state.K), A: state.A } },
  theNumbersBranch: {
    theGP, numbersGP, rawNumbers: [theRawNumber, numbersRawNumber], pageNumbersMod29: numberPages,
    p20: { ordinal: p20.ordinal, values: p20.values, length: p20.values.length, sumMod29: sumMod29(p20) },
    p25: { ordinal: p25Numbered.ordinal, values: p25Numbered.values, length: p25Numbered.values.length, sumMod29: sumMod29(p25Numbered) },
    H2D_lengths: numberLengthPacket, H2D_sums: numberSumPacket,
    familywiseMatches: agPairMatches,
    p25SideObject, p25SideState,
  },
  stateTriangle: { KA: lengthPacket, Ag: numberSumPacket, Kg: p25SideState, N, determinant: detMod(N), inverse: Ni },
  p21HillDecryption: {
    ciphertext: p21.values, plaintextRuneValues: p21HillPlain,
    plaintextRunes: p21HillPlain.map((i) => corpus.translit[i]).join(""),
    allTwoRuneFragments: twoRuneFragments.length, variants: theRuneHits,
    twoRuneFragmentsOnP21: 9,
  },
  p25CubeNegative: { OITOHL: p25CubeRaw, underNInverse: p25UnderNi, READ_OUT_target: p28ReadOut },
  p12p26: {
    p12: { ordinal: p12.ordinal, values: p12.values, length: p12.values.length, sumMod29: sumMod29(p12) },
    p26: { ordinal: p26.ordinal, values: p26.values, length: p26.values.length, sumMod29: sumMod29(p26) },
    H2D_lengths: lengthPacket,
    H2D_sums: sumPacket,
    orderedPairMatchesAmong: indexed.length * indexed.length,
    lengthOnlyPairCount: lengthOnlyMatches.length,
    uniqueDualChannelPair: pairMatches,
    prefixControl_p15p19: {
      p15: { ordinal: p15.ordinal, values: p15.values, length: p15.values.length, sumMod29: sumMod29(p15) },
      p19: { ordinal: p19Prefix.ordinal, values: p19Prefix.values, length: p19Prefix.values.length, sumMod29: sumMod29(p19Prefix) },
      H2D_lengths: prefixLengths,
      H2D_sums: prefixSums,
    },
  },
  sourceIndexedFragmentCount: indexed.length,
  missingSourceIndexedPages: missing,
  nonrecursiveContinuation: { lengths: continuationLengths, sums: continuationSums },
}, null, 2));
