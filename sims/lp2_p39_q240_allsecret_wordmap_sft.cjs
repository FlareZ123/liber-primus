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

console.log(JSON.stringify({
  register: 'untouched p39, complete 256-cell table / source F16',
  sourceRunes: 240,
  genuinePrintedWords: spans.length,
  fivePlusWords: 25,
  sourceFactorDegree: 16,
  original,
  planted: '256-residue GF29 convolution and 55 independent secret affine word keys: PASS',
  authenticUnknownPlaintextRecovered: false,
}, null, 2));
