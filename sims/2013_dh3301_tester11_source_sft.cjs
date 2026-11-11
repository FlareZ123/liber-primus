'use strict';

/**
 * Source-fixed 2013 DH(3301) tester-secret gate for Liber Primus.
 * Run from repository root with Node.js 22.
 *
 * Historical transcript constants are frozen from:
 * neuroretransmit/cicada@ade9a02889ef8acbc8cde8edbfd0a785c369f4c3
 * irc-logs/clientlog-1362290293-9.txt
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');

/** @param {string} p */
const read = (p) => fs.readFileSync(p, 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const referenceText = read('resources/liber-primus/lp1-plaintext-reference.txt');

/** @param {number} x */
const mod29 = (x) => ((x % 29) + 29) % 29;

/** @param {number} base @param {number} exp @param {number} modulus */
function modPow(base, exp, modulus) {
  let b = BigInt(base);
  let e = BigInt(exp);
  const m = BigInt(modulus);
  let out = 1n;
  while (e > 0n) {
    if (e & 1n) out = (out * b) % m;
    b = (b * b) % m;
    e >>= 1n;
  }
  return Number(out);
}

/** @param {number} a @param {number} b */
function gcd(a, b) {
  while (b !== 0) [a, b] = [b, a % b];
  return Math.abs(a);
}

/** @param {number} a @param {number} modulus */
function multiplicativeOrder(a, modulus) {
  assert.equal(gcd(a, modulus), 1);
  let x = 1;
  for (let n = 1; n <= modulus; n++) {
    x = (x * a) % modulus;
    if (x === 1) return n;
  }
  throw new Error('order not found');
}

/** @param {number} a */
function inv29(a) {
  for (let x = 1; x < 29; x++) if ((a * x) % 29 === 1) return x;
  throw new Error('no inverse for ' + a);
}

/** @param {number[]} a */
function trimLeadingZeros(a) {
  let i = 0;
  while (i + 1 < a.length && a[i] === 0) i++;
  return a.slice(i);
}

/** @param {number[]} a @param {number[]} b */
function polyMul(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) out[i + j] = mod29(out[i + j] + a[i] * b[j]);
  }
  return trimLeadingZeros(out);
}

/** @param {number[]} numerator @param {number[]} divisor */
function polyDiv(numerator, divisor) {
  let work = trimLeadingZeros(numerator.slice());
  const d = trimLeadingZeros(divisor.slice());
  const quotient = Array(Math.max(1, work.length - d.length + 1)).fill(0);
  const leadInv = inv29(d[0]);
  while (work.length >= d.length && !(work.length === 1 && work[0] === 0)) {
    const degreeGap = work.length - d.length;
    const q = (work[0] * leadInv) % 29;
    quotient[quotient.length - 1 - degreeGap] = q;
    for (let i = 0; i < d.length; i++) work[i] = mod29(work[i] - q * d[i]);
    work = trimLeadingZeros(work);
  }
  return { quotient: trimLeadingZeros(quotient), remainder: work };
}

/** @typedef {[number, number]} F841 */
/** @param {F841} x @param {F841} y @returns {F841} */
function fieldMul(x, y) {
  const [a, b] = x;
  const [c, d] = y;
  return [mod29(a * c + 8 * b * d), mod29(a * d + b * c + 3 * b * d)];
}

/** @param {F841} x @param {number} exp @returns {F841} */
function fieldPow(x, exp) {
  /** @type {F841} */ let out = [1, 0];
  /** @type {F841} */ let base = x;
  let e = exp;
  while (e > 0) {
    if (e & 1) out = fieldMul(out, base);
    base = fieldMul(base, base);
    e = Math.floor(e / 2);
  }
  return out;
}

/** @param {number[]} seq @param {number} exp */
function transformPairs(seq, exp) {
  const out = [];
  for (let i = 0; i + 1 < seq.length; i += 2) out.push(...fieldPow([seq[i], seq[i + 1]], exp));
  if (seq.length % 2 === 1) out.push(seq.at(-1));
  return out;
}

/** @param {string} text */
function parseGp(text) {
  const tokens = corpus.translit.map((s, i) => ({ s, i })).sort((a, b) => b.s.length - a.s.length);
  const prose = text.split(/\r?\n/)
    .filter((line) => !line.trim().startsWith('#') && !line.trim().startsWith('['))
    .join(' ')
    .replace(/[0-9a-f]{64,}/gi, ' ')
    .toUpperCase();
  const out = [];
  for (const word of prose.match(/[A-Z]+/g) || []) {
    let i = 0;
    while (i < word.length) {
      const token = tokens.find((t) => word.startsWith(t.s, i));
      if (token) {
        out.push(token.i);
        i += token.s.length;
      } else {
        i++;
      }
    }
  }
  return out;
}

const reference = parseGp(referenceText);
const split = Math.floor(reference.length * 0.8);
const train = reference.slice(0, split);
const holdout = reference.slice(split);
const trigramCounts = new Map();
let trigramTotal = 0;
for (let i = 0; i + 2 < train.length; i++) {
  const k = train[i] * 841 + train[i + 1] * 29 + train[i + 2];
  trigramCounts.set(k, (trigramCounts.get(k) || 0) + 1);
  trigramTotal++;
}

/** @param {number[]} sequence */
function score(sequence) {
  const counts = Array(29).fill(0);
  for (const x of sequence) counts[x]++;
  let logp = 0;
  for (let i = 0; i + 2 < sequence.length; i++) {
    const k = sequence[i] * 841 + sequence[i + 1] * 29 + sequence[i + 2];
    logp += Math.log(((trigramCounts.get(k) || 0) + 0.05) / (trigramTotal + 0.05 * 29 ** 3));
  }
  return {
    length: sequence.length,
    ioc: counts.reduce((s, c) => s + c * (c - 1), 0) / (sequence.length * (sequence.length - 1)),
    top12Mass: counts.slice().sort((a, b) => b - a).slice(0, 12).reduce((s, c) => s + c, 0) / sequence.length,
    trigramNatsPerRune: logp / (sequence.length - 2),
  };
}


const dh = { modulus: 3301, base: 2757, serverSecret: 331, serverPublic: 1264, clientPublic: 2800, shared: 1067 };
assert.equal(modPow(dh.base, dh.serverSecret, dh.modulus), dh.serverPublic);
assert.equal(modPow(dh.clientPublic, dh.serverSecret, dh.modulus), dh.shared);

const baseOrder = multiplicativeOrder(dh.base, dh.modulus);
assert.equal(baseOrder, 550);
let testerExponentResidue = null;
for (let e = 0; e < baseOrder; e++) {
  if (modPow(dh.base, e, dh.modulus) === dh.clientPublic) {
    testerExponentResidue = e;
    break;
  }
}
assert.equal(testerExponentResidue, 11);

const testerCandidates = [];
for (let e = testerExponentResidue; e < dh.modulus; e += baseOrder) {
  if (e >= 2) testerCandidates.push(e);
}
assert.deepEqual(testerCandidates, [11, 561, 1111, 1661, 2211, 2761]);
for (const e of testerCandidates) {
  assert.equal(modPow(dh.base, e, dh.modulus), dh.clientPublic);
  assert.equal(modPow(dh.serverPublic, e, dh.modulus), dh.shared);
}


/** @param {number} n */
function divisors(n) {
  const out = [];
  for (let d = 1; d * d <= n; d++) {
    if (n % d !== 0) continue;
    out.push(d);
    if (d * d !== n) out.push(n / d);
  }
  return out.sort((a, b) => a - b);
}

/** @param {number} n */
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}

/** @param {number} n */
function oneBasedPrimeOrdinal(n) {
  assert.equal(isPrime(n), true);
  let rank = 0;
  for (let k = 2; k <= n; k++) if (isPrime(k)) rank++;
  return rank;
}

// Numeric cells visibly printed in the 2013 0_wisdom 5x5 square.
// NUMBER factors composite input directly. Among the six DH representatives,
// only 1661 exposes one of these source cells as a proper divisor.
const wisdomNumericCells = [272, 138, 131, 151, 18, 226, 245];
const wisdomCellSet = new Set(wisdomNumericCells);
const numberRows = testerCandidates.map((exponent) => ({
  exponent,
  divisors: divisors(exponent),
  wisdomDivisors: divisors(exponent).filter((d) => d !== 1 && d !== exponent && wisdomCellSet.has(d)),
}));
const numberMatches = numberRows.filter((r) => r.wisdomDivisors.length > 0);
assert.deepEqual(numberMatches, [{
  exponent: 1661,
  divisors: [1, 11, 151, 1661],
  wisdomDivisors: [151],
}]);
const sourceSelectedExponent = numberMatches[0].exponent;
assert.equal(oneBasedPrimeOrdinal(151), 36);
assert.equal(151 % 29, 6);
assert.equal(sourceSelectedExponent % 29, 8);

// Separate inbound-only log value. The base for that exchange is not preserved here.
// These are arithmetic observations only, not a claim that its server selected base 5.
assert.equal(modPow(5, testerExponentResidue, 3301), 3034);
assert.equal(multiplicativeOrder(5, 3301), 75);
assert.equal(multiplicativeOrder(3034, 3301), 75);

const pages = corpus.pages.filter((p) => p.status === 'unsolved' && p.indices?.length && p.page <= 55);
const original = pages.flatMap((p) => p.indices);
assert.equal(original.length, 12956);

const gridCoefficients = grid.pages.flatMap((p) => p.bytes).map((x) => x % 29);
const base29Factor = [1, 18, 11];
const ac24DoubleRoot = [1, 10, 25];
const divisor = polyMul(base29Factor, ac24DoubleRoot);
const division = polyDiv(gridCoefficients, divisor);
assert.deepEqual(division.remainder, [0]);
assert.equal(division.quotient.length, 251);
const fixedWidthQuotient = [0, ...division.quotient];
assert.equal(fixedWidthQuotient.length, 252);

const plantPlain = Array.from({ length: 2400 }, (_, i) => reference[i % reference.length]);

/** @param {number} a @param {number} m */
function inverseModSmall(a, m) {
  for (let x = 1; x < m; x++) if ((a * x) % m === 1) return x;
  return null;
}

const candidateResults = testerCandidates.map((exponent) => {
  const exponentMod840 = exponent % 840;
  const g = gcd(exponentMod840, 840);
  if (g !== 1) {
    return {
      exponent,
      exponentMod840,
      gcdWith840: g,
      reversibleOnF841Nonzero: false,
    };
  }

  const inverseExponent = inverseModSmall(exponentMod840, 840);
  assert.notEqual(inverseExponent, null);
  for (const sample of [[0, 0], [1, 0], [0, 1], [3, 7], [28, 28]]) {
    assert.deepEqual(fieldPow(fieldPow(sample, exponentMod840), inverseExponent), sample);
  }

  const decodedBook = transformPairs(original, inverseExponent);
  const decodedPage = pages.flatMap((p) => transformPairs(p.indices, inverseExponent));
  const quotientDecoded = transformPairs(fixedWidthQuotient, inverseExponent);
  const quotientBytes = Array.from(
    { length: 126 },
    (_, i) => quotientDecoded[2 * i] * 29 + quotientDecoded[2 * i + 1],
  );

  const plantCipher = transformPairs(plantPlain, exponentMod840);
  const plantRecovered = transformPairs(plantCipher, inverseExponent);
  assert.deepEqual(plantRecovered, plantPlain);

  return {
    exponent,
    exponentMod840,
    gcdWith840: g,
    reversibleOnF841Nonzero: true,
    inverseExponent,
    original: {
      inverseBookPairs: score(decodedBook),
      inversePagePairs: score(decodedPage),
    },
    quotient252: {
      score: score(quotientDecoded),
      byteRange0to255: quotientBytes.filter((x) => x < 256).length,
      printableAscii: quotientBytes.filter((x) => x >= 32 && x <= 126).length,
      byteHead: quotientBytes.slice(0, 16),
    },
    positiveControl: {
      exactRecovery: plantRecovered.every((x, i) => x === plantPlain[i]),
      recoveredScore: score(plantRecovered),
    },
  };
});


/** @param {F841} x */
function fieldTrace(x) {
  return mod29(2 * x[0] + 3 * x[1]);
}

/** @param {F841} x */
function fieldNorm(x) {
  return mod29(x[0] * x[0] + 3 * x[0] * x[1] - 8 * x[1] * x[1]);
}

/** @param {number} n */
function base29Digits(n) {
  const out = [];
  do {
    out.push(n % 29);
    n = Math.floor(n / 29);
  } while (n > 0);
  return out.reverse();
}

// The BASE29 factor root z = 23 - 2u is primitive in the p3 field.
const z = [23, 27];
const toyDh = { modulus: 23, generator: 5, serverPrivate: 6, serverPublic: 8, clientPrivate: 15, clientPublic: 19, shared: 2 };
assert.equal(modPow(toyDh.generator, toyDh.serverPrivate, toyDh.modulus), toyDh.serverPublic);
assert.equal(modPow(toyDh.generator, toyDh.clientPrivate, toyDh.modulus), toyDh.clientPublic);
assert.equal(modPow(toyDh.clientPublic, toyDh.serverPrivate, toyDh.modulus), toyDh.shared);
assert.equal(modPow(toyDh.serverPublic, toyDh.clientPrivate, toyDh.modulus), toyDh.shared);

const invariantRows = testerCandidates.map((exponent) => {
  const w = fieldPow(z, exponent % 840);
  return {
    exponent,
    exponentMod840: exponent % 840,
    w,
    coordinateSum: mod29(w[0] + w[1]),
    coordinateProduct: mod29(w[0] * w[1]),
    trace: fieldTrace(w),
    norm: fieldNorm(w),
  };
});
const invariantMatches = invariantRows.filter((r) =>
  r.trace === toyDh.generator &&
  r.norm === toyDh.shared
);
assert.deepEqual(invariantMatches, [{
  exponent: 1661,
  exponentMod840: 821,
  w: [6, 17],
  coordinateSum: 23,
  coordinateProduct: 15,
  trace: 5,
  norm: 2,
}]);
// Secondary checks were not used to select the candidate.
assert.equal(invariantMatches[0].w[0], toyDh.serverPrivate);
assert.equal(invariantMatches[0].coordinateSum, toyDh.modulus);
assert.equal(invariantMatches[0].coordinateProduct, toyDh.clientPrivate);

assert.equal(invariantMatches[0].exponent, sourceSelectedExponent);
const selectedExponent = sourceSelectedExponent;
const selectedFieldExponent = invariantMatches[0].exponentMod840;
const selectedInverseExponent = inverseModSmall(selectedFieldExponent, 840);
assert.equal(selectedInverseExponent, 221);
assert.deepEqual(base29Digits(selectedExponent), [1, 28, 8]);

/** @param {number[]} sequence @param {number} x */
function elgamalDecrypt(sequence, x) {
  const out = [];
  let zeroFirstComponents = 0;
  let blocks = 0;
  for (let i = 0; i + 3 < sequence.length; i += 4) {
    const c1 = [sequence[i], sequence[i + 1]];
    const c2 = [sequence[i + 2], sequence[i + 3]];
    blocks++;
    if (c1[0] === 0 && c1[1] === 0) {
      zeroFirstComponents++;
      continue;
    }
    out.push(...fieldMul(c2, fieldPow(c1, (840 - selectedFieldExponent) % 840)));
  }
  return { out, blocks, zeroFirstComponents, leftoverRunes: sequence.length % 4 };
}

const selectedQuotientElgamal = elgamalDecrypt(fixedWidthQuotient, selectedFieldExponent);
assert.equal(selectedQuotientElgamal.zeroFirstComponents, 0);
assert.equal(selectedQuotientElgamal.blocks, 63);
const selectedQuotientElgamalBytes = Array.from(
  { length: selectedQuotientElgamal.out.length / 2 },
  (_, i) => selectedQuotientElgamal.out[2 * i] * 29 + selectedQuotientElgamal.out[2 * i + 1],
);
const selectedOriginalElgamal = elgamalDecrypt(original, selectedFieldExponent);
assert.equal(selectedOriginalElgamal.zeroFirstComponents, 1);

function additive1661(sign, clock) {
  const key = base29Digits(selectedExponent);
  const out = [];
  let bookOffset = 0;
  for (const page of pages) {
    let pageOffset = 0;
    for (const c of page.indices) {
      const offset = clock === 'book' ? bookOffset++ : pageOffset++;
      out.push(mod29(c + sign * key[offset % key.length]));
    }
  }
  return out;
}
const selectedBase29Additive = [];
for (const sign of [-1, 1]) {
  for (const clock of ['book', 'page']) {
    selectedBase29Additive.push({ sign, clock, score: score(additive1661(sign, clock)) });
  }
}

console.log(JSON.stringify({
  historicalDh: {
    ...dh,
    baseOrder,
    testerExponentResidueModuloBaseOrder: testerExponentResidue,
    candidatePrivateExponentsIn2To3300: testerCandidates,
  },
  conditionalOrder75Observation: {
    base5: multiplicativeOrder(5, 3301),
    client3034: multiplicativeOrder(3034, 3301),
    pow5ToResidue11: modPow(5, testerExponentResidue, 3301),
  },
  reference: { symbols: reference.length, holdout: score(holdout) },
  rawOriginal: score(original),
  numberWisdomSelector: {
    sourceNumericCells: wisdomNumericCells,
    candidateRows: numberRows,
    uniqueMatch: numberMatches[0],
    primeOrdinal151: oneBasedPrimeOrdinal(151),
    gpResidues: { cell151: 151 % 29, exponent1661: sourceSelectedExponent % 29 },
  },
  invariantRows,
  selectedExponent: {
    privateExponent: selectedExponent,
    fieldExponent: selectedFieldExponent,
    inverseFieldExponent: selectedInverseExponent,
    base29Digits: base29Digits(selectedExponent),
    fieldElement: invariantMatches[0].w,
    primarySelection: { numberDivisor: 151, oneBasedPrimeOrdinal: 36 },
    independentFieldCorroboration: { trace: toyDh.generator, norm: toyDh.shared },
    secondaryChecks: {
      firstCoordinate: invariantMatches[0].w[0],
      coordinateSum: invariantMatches[0].coordinateSum,
      coordinateProduct: invariantMatches[0].coordinateProduct,
    },
  },
  candidateResults,
  selectedBase29Additive,
  selectedElgamal: {
    originalBook: {
      blocks: selectedOriginalElgamal.blocks,
      zeroFirstComponents: selectedOriginalElgamal.zeroFirstComponents,
      leftoverRunes: selectedOriginalElgamal.leftoverRunes,
    },
    quotient252: {
      score: score(selectedQuotientElgamal.out),
      byteRange0to255: selectedQuotientElgamalBytes.filter((x) => x < 256).length,
      printableAscii: selectedQuotientElgamalBytes.filter((x) => x >= 32 && x <= 126).length,
      byteHead: selectedQuotientElgamalBytes.slice(0, 16),
    },
  },
}, null, 2));
