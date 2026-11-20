#!/usr/bin/env node
'use strict';

// Reproduce the conditional p0 receiver associated with the p28 READ OUT candidate,
// then test bounded direct DH and 179-adic scalar consumers. This does not validate
// the upstream READ OUT plaintext or authenticate p50 rune-offset output typing.

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const transcription = fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));

const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const translitIndex = new Map(corpus.translit.map((t, i) => [t, i]));
const parts = transcription.split(/^\s*%\s*$/m);
const table = grid.pages.flatMap(page => page.tokens);
const alphabet60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';

function pagePart(page) {
  return parts[page <= 49 ? page : page - 1];
}

function parsePage(page) {
  const text = pagePart(page);
  const runes = [];
  const words = [];
  let current = [];
  let start = 0;

  for (const ch of [...text]) {
    if (runeIndex.has(ch)) {
      if (current.length === 0) start = runes.length;
      const value = runeIndex.get(ch);
      runes.push(value);
      current.push(value);
    } else if (ch === '-' || ch === '.') {
      if (current.length) {
        words.push({ start, end: runes.length - 1, values: current });
        current = [];
      }
    }
  }
  if (current.length) words.push({ start, end: runes.length - 1, values: current });
  return { runes, words };
}

function gp0(transliterations) {
  return transliterations.reduce((sum, token) => {
    const value = translitIndex.get(token);
    assert.notEqual(value, undefined, 'Unknown GP29 transliteration: ' + token);
    return sum + value;
  }, 0);
}

function digit59(ch) {
  const d = alphabet60.indexOf(ch);
  assert.notEqual(d, -1, 'Token character is not in the base-60 alphabet');
  return d > 41 ? d - 1 : d; // base59 omits lowercase f
}

function tokenValue(token, base) {
  assert.equal(token.length, 2);
  if (base === 60) {
    return alphabet60.indexOf(token[0]) * 60 + alphabet60.indexOf(token[1]);
  }
  return digit59(token[0]) * 59 + digit59(token[1]);
}

function transliterate(values) {
  return values.map(value => corpus.translit[value]).join('');
}

const readSum = gp0(['R', 'EA', 'D']);
const outSum = gp0(['O', 'U', 'T']);
assert.equal(readSum, 55);
assert.equal(outSum, 20);
assert.equal(table.length, 256);

const readToken = table[readSum];
const outToken = table[outSum];
assert.equal(readToken, '1K');
assert.equal(outToken, '1g');

const start60 = tokenValue(readToken, 60);
const end60 = tokenValue(outToken, 60);
const start59 = tokenValue(readToken, 59);
const end59 = tokenValue(outToken, 59);

assert.equal(start60, 80);
assert.equal(end60, 102);
assert.equal(start59, 79);
assert.equal(end59, 100);

const p0 = parsePage(0);
const firstWord = p0.words.findIndex(word => word.start === start60);
const lastWord = p0.words.findIndex(word => word.end === end60);
assert.equal(firstWord, 17); // one-based word18
assert.equal(lastWord, 20);  // one-based word21

const selectedWords = p0.words.slice(firstWord, lastWord + 1);
assert.deepEqual(selectedWords.map(word => word.start), [80, 83, 90, 95]);
assert.deepEqual(selectedWords.map(word => word.end), [82, 89, 94, 102]);
assert.deepEqual(selectedWords.map(word => word.values.length), [3, 7, 5, 8]);

const selectedRunes = p0.runes.slice(start60, end60 + 1);
assert.equal(selectedRunes.length, 23);
assert.equal(selectedRunes.reduce((sum, value) => sum + value, 0), 328);

const base59Length = end59 - start59 + 1;
assert.equal(base59Length, 22);
assert.equal(p0.words.some(word => word.start === start59), false);
assert.equal(p0.words.some(word => word.end === end59), false);

const dhPrime = 23; // independently reconstructed in the p28 DH/H research
assert.equal(selectedRunes.length, dhPrime);

const expectedReceiver = [21,25,2,10,25,8,14,2,13,6,26,0,21,5,11,2,24,19,10,21,10,27,26];
assert.deepEqual(selectedRunes, expectedReceiver);

// Reconstructed p28 DH23 state. This is a candidate state/operation selector,
// not proof that the p0 receiver uses DH as a cipher.
const dh = { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2 };
function mod(value, modulus) {
  return ((value % modulus) + modulus) % modulus;
}
function powMod(base, exponent, modulus) {
  let result = 1;
  let factor = mod(base, modulus);
  let power = exponent;
  while (power > 0) {
    if (power & 1) result = (result * factor) % modulus;
    factor = (factor * factor) % modulus;
    power >>= 1;
  }
  return result;
}
assert.equal(powMod(dh.g, dh.a, dh.p), dh.A);
assert.equal(powMod(dh.g, dh.b, dh.p), dh.B);
assert.equal(powMod(dh.B, dh.a, dh.p), dh.K);
assert.equal(powMod(dh.A, dh.b, dh.p), dh.K);
const invK23 = 12;
const invK29 = 15;
assert.equal(mod(dh.K * invK23, dh.p), 1);
assert.equal(mod(dh.K * invK29, 29), 1);

// Standard generator order in F_23*, plus the same orbit seeded at K.
const generatorPowers = [];
let power = 1;
for (let i = 0; i < dh.p - 1; i++) {
  generatorPowers.push(power);
  power = mod(power * dh.g, dh.p);
}
assert.equal(power, 1);
assert.equal(new Set(generatorPowers).size, dh.p - 1);
const seededOrbit = [];
let orbit = dh.K;
while (!seededOrbit.includes(orbit)) {
  seededOrbit.push(orbit);
  orbit = mod(orbit * dh.g, dh.p);
}
assert.equal(orbit, dh.K);
assert.equal(seededOrbit.length, dh.p - 1);

function oneBasedPositionOrder(multiplier) {
  return Array.from({ length: dh.p }, (_, i) => {
    const residue = mod(multiplier * (i + 1), dh.p);
    return (residue === 0 ? dh.p : residue) - 1;
  });
}
const dhPermutations = {
  K_stride_zero_based: Array.from({ length: dh.p }, (_, i) => mod(dh.K * i, dh.p)),
  K_stride_inverse_zero_based: Array.from({ length: dh.p }, (_, i) => mod(invK23 * i, dh.p)),
  K_stride_one_based: oneBasedPositionOrder(dh.K),
  K_stride_inverse_one_based: oneBasedPositionOrder(invK23),
  g_powers_zero_first: [0, ...generatorPowers],
  g_powers_reverse_zero_first: [0, ...generatorPowers.slice().reverse()],
  g_powers_zero_last: [...generatorPowers, 0],
  g_powers_reverse_zero_last: [...generatorPowers.slice().reverse(), 0],
  K_seeded_g_zero_based: [...seededOrbit, 0],
  K_seeded_g_reverse_zero_based: [...seededOrbit.slice().reverse(), 0],
  K_seeded_g_one_based: [...seededOrbit.map(value => value - 1), dh.p - 1],
  K_seeded_g_reverse_one_based: [...seededOrbit.slice().reverse().map(value => value - 1), dh.p - 1]
};
function applyPermutation(values, permutation) {
  return permutation.map(index => values[index]);
}
for (const permutation of Object.values(dhPermutations)) {
  assert.equal(permutation.length, dh.p);
  assert.equal(new Set(permutation).size, dh.p);
  assert(permutation.every(index => index >= 0 && index < dh.p));
}
const positionalOutputs = Object.fromEntries(
  Object.entries(dhPermutations).map(([name, permutation]) => [
    name,
    {
      sourceIndices: permutation,
      runeIndices: applyPermutation(selectedRunes, permutation),
      transliteration: transliterate(applyPermutation(selectedRunes, permutation))
    }
  ])
);
const thing = [2, 10, 21]; // GP29 TH, I, NG
function containsThing(values) {
  for (let i = 0; i <= values.length - thing.length; i++) {
    if (thing.every((value, j) => values[i + j] === value)) return true;
  }
  return false;
}
const observedThing = Object.entries(dhPermutations)
  .filter(([, permutation]) => containsThing(applyPermutation(selectedRunes, permutation)))
  .map(([name]) => name);

// Fixed-multiset conditional null for the noticed TH-I-NG word.
const MASK64 = (1n << 64n) - 1n;
const TWO64 = 1n << 64n;
let rngState = 0x3301n;
function next64() {
  rngState = (rngState + 0x9E3779B97F4A7C15n) & MASK64;
  let z = rngState;
  z = ((z ^ (z >> 30n)) * 0xBF58476D1CE4E5B9n) & MASK64;
  z = ((z ^ (z >> 27n)) * 0x94D049BB133111EBn) & MASK64;
  return z ^ (z >> 31n);
}
function randomBelow(limit) {
  const bound = BigInt(limit);
  const cutoff = TWO64 - (TWO64 % bound);
  let value;
  do { value = next64(); } while (value >= cutoff);
  return Number(value % bound);
}
function shuffled(values) {
  const output = values.slice();
  for (let i = output.length - 1; i > 0; i--) {
    const j = randomBelow(i + 1);
    [output[i], output[j]] = [output[j], output[i]];
  }
  return output;
}
const nullIterations = 100000;
let familyHits = 0;
for (let i = 0; i < nullIterations; i++) {
  const sample = shuffled(selectedRunes);
  if (Object.values(dhPermutations).some(permutation => containsThing(applyPermutation(sample, permutation)))) {
    familyHits++;
  }
}
assert.equal(familyHits, 30220);

// The DH shared secret as a multiplicative GP29 map and its inverse.
const multiplyK = selectedRunes.map(value => mod(dh.K * value, 29));
const multiplyInverseK = selectedRunes.map(value => mod(invK29 * value, 29));
function splitByLengths(values, lengths) {
  const pieces = [];
  let offset = 0;
  for (const length of lengths) {
    pieces.push(transliterate(values.slice(offset, offset + length)));
    offset += length;
  }
  assert.equal(offset, values.length);
  return pieces;
}
const originalWordLengths = selectedWords.map(word => word.values.length);
const dhReadoutTest = {
  state: dh,
  generatorOrder: generatorPowers,
  K_seeded_orbit: seededOrbit,
  inverseK_mod23: invK23,
  inverseK_mod29: invK29,
  positionalPermutations: positionalOutputs,
  observedThingVariants: observedThing,
  conditionalFixedMultisetNull: {
    targetRuneIndices: thing,
    targetTransliteration: 'THING',
    seed: 'SplitMix64 0x3301',
    iterations: nullIterations,
    familyHits: familyHits,
    rate: familyHits / nullIterations
  },
  GP29_multiplication: {
    multiplyByK: {
      runeIndices: multiplyK,
      transliteration: transliterate(multiplyK),
      originalWordSegments: splitByLengths(multiplyK, originalWordLengths)
    },
    multiplyByInverseK: {
      runeIndices: multiplyInverseK,
      transliteration: transliterate(multiplyInverseK),
      originalWordSegments: splitByLengths(multiplyInverseK, originalWordLengths)
    }
  },
  decision: 'No coherent plaintext or independently verifiable key material in the 14 fixed direct DH-derived consumers.'
};

// Transfer the 179-adic READ residue into BASE29, without using the p0
// receiver's rune values to derive the scalar.
const e = 3; // b^-1 mod (p-1)
assert.equal(mod(dh.b * e, dh.p - 1), 1);
const page53 = parsePage(53);
const page15 = parsePage(15);
assert.equal(page53.runes.length, 179);
const residue179 = mod(e * readSum - dh.A, 179);
assert.equal(residue179, 157);
assert.equal(page53.runes.length - (dh.p - 1), residue179);
const receiverInteger = selectedRunes.reduce((n, value) => n * 29n + BigInt(value), 0n);
assert.equal(Number(receiverInteger % 179n), residue179);
const scalarKey = residue179 % 29;
const inverseScalarKey = 17;
assert.equal(scalarKey, 12);
assert.equal(scalarKey, invK23);
assert.equal(mod(scalarKey * inverseScalarKey, 29), 1);

const scalarMaps = {
  shift_plus_12: selectedRunes.map(value => mod(value + scalarKey, 29)),
  shift_minus_12: selectedRunes.map(value => mod(value - scalarKey, 29)),
  multiply_12: selectedRunes.map(value => mod(scalarKey * value, 29)),
  multiply_inverse_17: selectedRunes.map(value => mod(inverseScalarKey * value, 29)),
  affine_3x_minus_8: selectedRunes.map(value => mod(e * value - dh.A, 29)),
  affine_inverse_10x_plus_22: selectedRunes.map(value => mod(10 * value + 22, 29))
};
const scalarOutputs = Object.fromEntries(
  Object.entries(scalarMaps).map(([name, values]) => [
    name,
    {
      runeIndices: values,
      transliteration: transliterate(values),
      originalWordSegments: splitByLengths(values, originalWordLengths)
    }
  ])
);
const liarPrefix = [20, 10, 24, 4]; // GP29 L,I,A,R
assert.deepEqual(scalarMaps.multiply_12.slice(0, 4), liarPrefix);
const allPages = Array.from({ length: 56 }, (_, page) => parsePage(page));
const rawPrefix = [21, 25, 2, 10];
const rawPrefixMatches = [];
for (let page = 0; page < allPages.length; page++) {
  const runes = allPages[page].runes;
  for (let offset = 0; offset + rawPrefix.length <= runes.length; offset++) {
    if (rawPrefix.every((value, j) => runes[offset + j] === value)) {
      rawPrefixMatches.push({ page, offset });
    }
  }
}
assert.deepEqual(rawPrefixMatches, [{ page: 0, offset: 80 }]);

const p0Other = p0.runes.slice(156, 179);
assert.equal(p0Other.length, 23);
assert.equal(p0Other[11], 16); // T center; second p0 window with residue157
const p15Span = page15.runes.slice(23, 74);
const p53Span = page53.runes.slice(128, 179);
assert.equal(p15Span.length, 51);
assert.equal(p53Span.length, 51);
const scalarControls = {
  p0_offset156: {
    center: p0Other[11],
    multiply12: transliterate(p0Other.map(value => mod(scalarKey * value, 29))),
    multiply17: transliterate(p0Other.map(value => mod(inverseScalarKey * value, 29)))
  },
  p15_23_73: {
    multiply12: transliterate(p15Span.map(value => mod(scalarKey * value, 29))),
    multiply17: transliterate(p15Span.map(value => mod(inverseScalarKey * value, 29)))
  },
  p53_red_128_178: {
    multiply12: transliterate(p53Span.map(value => mod(scalarKey * value, 29))),
    multiply17: transliterate(p53Span.map(value => mod(inverseScalarKey * value, 29)))
  }
};

// Conditional null for the post-hoc LIAR-at-start observation under the two
// source-derived multiplicative directions, preserving the exact rune multiset.
rngState = 0x3301n;
let liarStartHits = 0;
for (let i = 0; i < nullIterations; i++) {
  const sample = shuffled(selectedRunes);
  const hit = [scalarKey, inverseScalarKey].some(multiplier => {
    const prefix = sample.slice(0, 4).map(value => mod(multiplier * value, 29));
    return liarPrefix.every((value, j) => prefix[j] === value);
  });
  if (hit) liarStartHits++;
}
assert.equal(liarStartHits, 21);
const scalarTransferTest = {
  derivation: {
    exponentInverse: e,
    readGP0: readSum,
    publicShareA: dh.A,
    residue179: residue179,
    alternate179MinusGroupOrder: page53.runes.length - (dh.p - 1),
    receiverBase29IntegerMod179: Number(receiverInteger % 179n),
    scalarKeyMod29: scalarKey,
    inverseSharedSecretMod23: invK23,
    inverseScalarKeyMod29: inverseScalarKey
  },
  scalarOutputs: scalarOutputs,
  uniqueRawPrefixAcrossUnknownPages: rawPrefixMatches,
  multiply12Prefix: {
    runeIndices: scalarMaps.multiply_12.slice(0, 4),
    transliteration: transliterate(scalarMaps.multiply_12.slice(0, 4)),
    originalWordLengths: originalWordLengths,
    originalWordSegments: scalarOutputs.multiply_12.originalWordSegments
  },
  controls: scalarControls,
  conditionalLiarStartNull: {
    targetRuneIndices: liarPrefix,
    targetTransliteration: 'LIAR',
    maps: [scalarKey, inverseScalarKey],
    seed: 'SplitMix64 0x3301',
    iterations: nullIterations,
    hits: liarStartHits,
    rate: liarStartHits / nullIterations
  },
  decision: 'Unique LIAR prefix is a candidate marker only: it crosses the original word boundary and the remaining receiver plus independent p15/p53 controls do not decode.'
};


console.log(JSON.stringify({
  upstreamPhrase: 'READ OUT',
  gp0: { READ: readSum, OUT: outSum },
  table: {
    size: table.length,
    READ: { address: readSum, token: readToken, base60: start60, base59: start59 },
    OUT: { address: outSum, token: outToken, base60: end60, base59: end59 }
  },
  p0: {
    runeCount: p0.runes.length,
    selectedWordRangeOneBased: [firstWord + 1, lastWord + 1],
    wordStarts: selectedWords.map(word => word.start),
    wordEnds: selectedWords.map(word => word.end),
    wordLengths: selectedWords.map(word => word.values.length),
    words: selectedWords.map(word => transliterate(word.values)),
    runeIndices: selectedRunes,
    transliteration: transliterate(selectedRunes),
    selectedLength: selectedRunes.length
  },
  dhPrime,
  dhReadoutTest,
  scalarTransferTest,
  base59Control: {
    start: start59,
    end: end59,
    inclusiveLength: base59Length,
    startIsWordBoundary: false,
    endIsWordBoundary: false
  },
  result: 'PASS: conditional p0 receiver, direct DH consumers and 179-adic scalar-transfer probe reproduced; no plaintext claim.'
}, null, 2));
