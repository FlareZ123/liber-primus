'use strict';
/**
 * Original LP2 p39 / numerical-grid factor-16 quotient: eliminate all independent
 * word-local GP29 alphabet bijections and free within-word transpositions.
 * Read-only, deterministic Windows/Node.js 22 single-file test.
 *
 * Inputs are original physical p39 rune indices, its genuine printed word spans,
 * and the canonical 256 source table. The factor-16 quotient is fixed by the
 * previously established exact polynomial factorization; this test fits no key.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.join(__dirname, '..');
const resource = (name) => path.join(root, 'resources', 'liber-primus', name);
const corpus = JSON.parse(fs.readFileSync(resource('lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(resource('lp2-grid-256.json'), 'utf8'));
const transcription = fs.readFileSync(resource('lp2-transcription.txt'), 'utf8');
const modulo = (x) => ((x % 29) + 29) % 29;
const inverse = (x) => {
  for (let y = 1; y < 29; y += 1) if (modulo(x * y) === 1) return y;
  throw new Error('Nonzero field element has no inverse');
};

/** Descending-coefficient polynomial convolution over GF(29). */
function multiply(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i += 1) {
    for (let j = 0; j < b.length; j += 1) out[i + j] = modulo(out[i + j] + a[i] * b[j]);
  }
  return out;
}

/** Exact monic long division retaining a formal zero leading coefficient. */
function divide(numerator, monic) {
  const rest = numerator.slice();
  const quotient = Array(numerator.length - monic.length + 1).fill(0);
  for (let i = 0; i < quotient.length; i += 1) {
    const q = rest[i];
    quotient[i] = q;
    for (let j = 0; j < monic.length; j += 1) rest[i + j] = modulo(rest[i + j] - q * monic[j]);
  }
  return { quotient, remainder: rest.slice(-monic.length + 1) };
}

// Fully specified source factor F16: (x^2+10x+25)(x^2+18x+11)
// (x^3+14x^2+16x+24)
// (x^9+12x^8+20x^7+10x^6+5x^5+x^4+9x^3+15x+11).
const factor16 = [
  [1, 10, 25], [1, 18, 11], [1, 14, 16, 24],
  [1, 12, 20, 10, 5, 1, 9, 0, 15, 11],
].reduce(multiply, [1]);
assert.equal(factor16.length, 17);
assert.deepEqual(factor16, [1, 25, 17, 11, 15, 7, 11, 26, 6, 26, 13, 2, 6, 12, 26, 20, 13]);

const table = grid.bytes;
assert.equal(table.length, 256);
assert.equal(
  crypto.createHash('sha256').update(Buffer.from(table)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290'
);
const { quotient: q240, remainder } = divide(table.map((n) => n % 29), factor16);
assert.equal(q240.length, 240);
assert.ok(remainder.every((x) => x === 0));
assert.deepEqual(q240.slice(0, 16), [0, 28, 18, 14, 3, 2, 14, 21, 7, 27, 23, 2, 3, 2, 25, 26]);

const p39 = corpus.pages.find((p) => p.page === 39).indices;
assert.equal(p39.length, 240);
const chunks = transcription.split('%');
const runeToIndex = new Map(corpus.runes.map((glyph, index) => [glyph, index]));
const reconstructed = [];
const spans = [];
let lastCut = 0;
for (const glyph of chunks[39]) {
  if (runeToIndex.has(glyph)) reconstructed.push(runeToIndex.get(glyph));
  if ('-.,;:!?'.includes(glyph) && reconstructed.length > lastCut) {
    spans.push([lastCut, reconstructed.length]);
    lastCut = reconstructed.length;
  }
}
if (lastCut < reconstructed.length) spans.push([lastCut, reconstructed.length]);
assert.deepEqual(reconstructed, p39);
assert.equal(spans.length, 55);
assert.equal(spans.filter(([a, b]) => b - a >= 5).length, 25);
assert.equal(spans.reduce((sum, [a, b]) => sum + b - a, 0), 240);

/**
 * Counts exact whole-word transforms; every printed word may have an
 * independent unknown Caesar, affine, or unrestricted bijective 29-rune key.
 */
function matches(plaintext, register) {
  const result = {
    shift: 0, affine: 0, arbitraryBijection: 0, permutedBijection: 0,
    longShift: 0, longAffine: 0, longBijection: 0, longPermutedBijection: 0,
  };
  for (const [start, end] of spans) {
    const length = end - start;
    const b = modulo(plaintext[start] - register[start]);
    let shift = true;
    for (let i = start + 1; i < end; i += 1) {
      if (modulo(plaintext[i] - register[i]) !== b) shift = false;
    }
    let affine = false;
    for (let a = 1; a < 29 && !affine; a += 1) {
      const delta = modulo(plaintext[start] - a * register[start]);
      affine = true;
      for (let i = start + 1; i < end; i += 1) {
        if (modulo(a * register[i] + delta) !== plaintext[i]) {
          affine = false;
          break;
        }
      }
    }
    const forward = new Map();
    const backward = new Map();
    let bijection = true;
    for (let i = start; i < end; i += 1) {
      const from = register[i];
      const to = plaintext[i];
      if ((forward.has(from) && forward.get(from) !== to)
        || (backward.has(to) && backward.get(to) !== from)) bijection = false;
      forward.set(from, to);
      backward.set(to, from);
    }
    const spectrum = (data) => {
      const counts = new Map();
      for (let i = start; i < end; i += 1) counts.set(data[i], (counts.get(data[i]) ?? 0) + 1);
      return [...counts.values()].sort((a, b) => a - b).join(',');
    };
    const permutedBijection = spectrum(plaintext) === spectrum(register);
    result.permutedBijection += Number(permutedBijection);
    result.shift += Number(shift);
    result.affine += Number(affine);
    result.arbitraryBijection += Number(bijection);
    if (length >= 5) {
      result.longShift += Number(shift);
      result.longAffine += Number(affine);
      result.longBijection += Number(bijection);
      result.longPermutedBijection += Number(permutedBijection);
    }
  }
  return result;
}

function reverseWords(input) {
  const out = input.slice();
  for (const [a, b] of spans) {
    const reversed = input.slice(a, b).reverse();
    out.splice(a, b - a, ...reversed);
  }
  return out;
}

const original = {
  printed: matches(p39, q240),
  reversedFull: matches(p39, q240.slice().reverse()),
  reversedEachWord: matches(p39, reverseWords(q240)),
};
assert.deepEqual(original, {
  printed: { shift: 2, affine: 7, arbitraryBijection: 34, permutedBijection: 39, longShift: 0, longAffine: 0, longBijection: 8, longPermutedBijection: 13 },
  reversedFull: { shift: 3, affine: 7, arbitraryBijection: 35, permutedBijection: 38, longShift: 0, longAffine: 0, longBijection: 8, longPermutedBijection: 10 },
  reversedEachWord: { shift: 2, affine: 7, arbitraryBijection: 34, permutedBijection: 39, longShift: 0, longAffine: 0, longBijection: 8, longPermutedBijection: 13 },
});

// A planted register with independent secret word multipliers and offsets.
// The complete 256-residue source-shaped table must reverse to its hidden 240-register.
const knownGP = corpus.pages.find((p) => p.page === 57).indices;
assert.equal(knownGP.length, 95);
const plantedPlain = Array.from({ length: 240 }, (_, i) => knownGP[i % knownGP.length]);
const plantedKeyed = Array(240).fill(0);
for (let w = 0; w < spans.length; w += 1) {
  const [a, b] = spans[w];
  const multiplier = 1 + (w % 28);
  const shift = modulo(7 + 3 * w);
  const inv = inverse(multiplier);
  for (let i = a; i < b; i += 1) plantedKeyed[i] = modulo(inv * (plantedPlain[i] - shift));
}
const plantedTable = multiply(factor16, plantedKeyed);
const positive = divide(plantedTable, factor16);
assert.ok(positive.remainder.every((x) => x === 0));
assert.deepEqual(positive.quotient, plantedKeyed);
assert.deepEqual(matches(plantedPlain, positive.quotient), {
  shift: 4, affine: 55, arbitraryBijection: 55, permutedBijection: 55,
  longShift: 1, longAffine: 25, longBijection: 25, longPermutedBijection: 25,
});


/**
 * An arbitrary independent monoalphabetic 29-rune bijection at each phase
 * cannot contradict two observed pairs occupying that same phase.
 * This tests exact source-visible period4/8/16/32 dimensions without fitting
 * a key, Caesar shifts, a guessed plaintext or a lexical score.
 *
 * @param {number[]} source
 * @param {number[]} target
 * @param {number} period
 * @returns {{period: number, contradictoryPhases: number, contradictedPairs: number}}
 */
function arbitraryPhaseBijection(source, target, period) {
  assert.equal(source.length, target.length);
  const forward = Array.from({ length: period }, () => new Map());
  const backward = Array.from({ length: period }, () => new Map());
  const failed = new Set();
  let contradictedPairs = 0;
  for (let i = 0; i < source.length; i += 1) {
    const r = i % period;
    const a = source[i];
    const b = target[i];
    if ((forward[r].has(a) && forward[r].get(a) !== b)
      || (backward[r].has(b) && backward[r].get(b) !== a)) {
      failed.add(r);
      contradictedPairs += 1;
    }
    forward[r].set(a, b);
    backward[r].set(b, a);
  }
  return { period, contradictoryPhases: failed.size, contradictedPairs };
}

// The separately printed p15 4x4 spiral uniquely selects these 16 cell
// coordinates, but does not say to rearrange the Q240 table by them.
const p15Spiral16 = [5, 6, 10, 9, 8, 4, 0, 1, 2, 3, 7, 11, 15, 14, 13, 12];
const qSpiral = q240.map((_, i) =>
  q240[16 * Math.floor(i / 16) + p15Spiral16[i % 16]]);
const phasePeriods = [4, 8, 16, 32];
const phaseGate = {
  printed: phasePeriods.map((k) => arbitraryPhaseBijection(q240, p39, k)),
  reverse: phasePeriods.map((k) => arbitraryPhaseBijection(q240.slice().reverse(), p39, k)),
  p15Spiral16: phasePeriods.map((k) => arbitraryPhaseBijection(qSpiral, p39, k)),
};
assert.deepEqual(phaseGate, {
  printed: [
    { period: 4, contradictoryPhases: 4, contradictedPairs: 174 },
    { period: 8, contradictoryPhases: 8, contradictedPairs: 142 },
    { period: 16, contradictoryPhases: 16, contradictedPairs: 92 },
    { period: 32, contradictoryPhases: 28, contradictedPairs: 45 },
  ],
  reverse: [
    { period: 4, contradictoryPhases: 4, contradictedPairs: 185 },
    { period: 8, contradictoryPhases: 8, contradictedPairs: 145 },
    { period: 16, contradictoryPhases: 16, contradictedPairs: 87 },
    { period: 32, contradictoryPhases: 26, contradictedPairs: 45 },
  ],
  p15Spiral16: [
    { period: 4, contradictoryPhases: 4, contradictedPairs: 178 },
    { period: 8, contradictoryPhases: 8, contradictedPairs: 141 },
    { period: 16, contradictoryPhases: 16, contradictedPairs: 93 },
    { period: 32, contradictoryPhases: 28, contradictedPairs: 44 },
  ],
});
const plantedPhase = q240.map((v, i) => modulo(v + 3 * (i % 16) + 7));
assert.deepEqual(arbitraryPhaseBijection(q240, plantedPhase, 16),
  { period: 16, contradictoryPhases: 0, contradictedPairs: 0 });


/**
 * Returns row rank over GF29; the parameter-free rank mismatch is an
 * impossibility certificate for all secret coefficients of the model.
 * @param {number[][]} matrix
 * @returns {number}
 */
function gfRank(matrix) {
  const rows = matrix.map((line) => line.slice());
  let pivotRow = 0;
  for (let column = 0; column < rows[0].length && pivotRow < rows.length; column += 1) {
    let pick = pivotRow;
    while (pick < rows.length && rows[pick][column] === 0) pick += 1;
    if (pick === rows.length) continue;
    [rows[pivotRow], rows[pick]] = [rows[pick], rows[pivotRow]];
    const pivotInverse = inverse(rows[pivotRow][column]);
    for (let j = column; j < rows[pivotRow].length; j += 1) {
      rows[pivotRow][j] = modulo(rows[pivotRow][j] * pivotInverse);
    }
    for (let i = pivotRow + 1; i < rows.length; i += 1) {
      const factor = rows[i][column];
      if (factor === 0) continue;
      for (let j = column; j < rows[i].length; j += 1) {
        rows[i][j] = modulo(rows[i][j] - factor * rows[pivotRow][j]);
      }
    }
    pivotRow += 1;
  }
  return pivotRow;
}

/**
 * Necessary and sufficient linear consistency condition for ANY unknown
 * 2*order + 1 coefficients in the time-invariant two-stream state equation:
 *
 *   C[i] = d + sum(a[j]*C[i-j-1], j=0..order-1)
 *            + sum(b[j]*Q[i-j], j=0..order-1) mod29.
 *
 * The independent coefficient d and ALL a,b values are granted freely.
 * @param {number[]} register
 * @param {number[]} target
 * @param {number} order
 */
function unknownLinearState(register, target, order) {
  const rows = [];
  for (let i = order; i < target.length; i += 1) {
    rows.push([
      ...Array.from({ length: order }, (_, j) => target[i - j - 1]),
      ...Array.from({ length: order }, (_, j) => register[i - j]),
      1,
    ]);
  }
  return {
    order,
    coefficientRank: gfRank(rows),
    augmentedRank: gfRank(rows.map((row, i) => [...row, target[order + i]])),
    equations: rows.length,
  };
}
const stateOrders = [1, 2, 4, 8, 16];
const stateGate = {
  printed: stateOrders.map((n) => unknownLinearState(q240, p39, n)),
  reverse: stateOrders.map((n) => unknownLinearState(q240.slice().reverse(), p39, n)),
  p15Spiral16: stateOrders.map((n) => unknownLinearState(qSpiral, p39, n)),
};
for (const value of Object.values(stateGate)) {
  for (let i = 0; i < stateOrders.length; i += 1) {
    assert.equal(value[i].coefficientRank, 2 * stateOrders[i] + 1);
    assert.equal(value[i].augmentedRank, 2 * stateOrders[i] + 2);
    assert.equal(value[i].equations, 240 - stateOrders[i]);
  }
}

// Hard positive: the complete GF29 source-shaped 256-entry source polynomial
// can encode 240 ACTUAL solved-p57 GP runes under an independent 16-stage
// all-secret affine feedback. Recover the exact 240 original-length register
// by dividing the planted table by the same source factor16.
const p57Native = corpus.pages.find((p) => p.page === 57).indices;
const messageNative = Array.from({ length: 240 }, (_, i) => p57Native[i % p57Native.length]);
const tapA = [10, 3, 20, 22, 1, 22, 21, 25, 11, 17, 19, 7, 8, 12, 12, 22];
const tapB = [1, ...factor16.slice(1, 16)];
assert.equal(tapB.length, 16);
const plantQ = q240.slice(0, 16);
const d = 24;
for (let i = 16; i < 240; i += 1) {
  let rest = d;
  for (let j = 0; j < 16; j += 1) rest += tapA[j] * messageNative[i - 1 - j];
  for (let j = 1; j < 16; j += 1) rest += tapB[j] * plantQ[i - j];
  plantQ.push(modulo(messageNative[i] - rest));
}
const plant256 = multiply(factor16, plantQ);
assert.equal(plant256.length, 256);
const plantedTransfer = divide(plant256, factor16);
assert.deepEqual(plantedTransfer.quotient, plantQ);
assert.ok(plantedTransfer.remainder.every((v) => v === 0));
assert.deepEqual(unknownLinearState(plantedTransfer.quotient, messageNative, 16),
  { order: 16, coefficientRank: 33, augmentedRank: 33, equations: 224 });

console.log(JSON.stringify({
  register: 'untouched p39, complete 256-cell table / source F16',
  sourceRunes: 240,
  genuinePrintedWords: spans.length,
  fivePlusWords: 25,
  sourceFactorDegree: 16,
  original,
  phaseGate,
  stateGate,
  planted: '256-residue GF29 convolution; 55 independent secret word-affine keys; 16 independent secret phase shifts; secret 16-stage feedback on genuine 240-rune GP-native prose via factor16 convolution: PASS',
  authenticUnknownPlaintextRecovered: false,
}, null, 2));
