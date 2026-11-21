#!/usr/bin/env node
'use strict';

// Read-only gate for the LP2 first-difference stream proposed as a 28-symbol
// keyed step sequence. No dependencies beyond Node.js.
const fs = require('node:fs');
const path = require('node:path');

const INPUT = path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json');
const EXPECTED_CORPUS_BLOB = '054f2a0f780b7d46901acbe3d9bf4f0ac1801165';
const corpus = JSON.parse(fs.readFileSync(INPUT, 'utf8'));
const ciphertext = corpus.pages
  .filter(page => page.page >= 0 && page.page <= 55)
  .flatMap(page => page.indices);

if (ciphertext.length !== 12956) {
  throw new Error('Expected 12,956 rune indices on LP2 pages 0-55; got ' + ciphertext.length);
}

const mod = (x, p) => ((x % p) + p) % p;
function inverse(a, p) {
  for (let x = 1; x < p; x++) if (mod(a * x, p) === 1) return x;
  throw new Error('No inverse for ' + a + ' mod ' + p);
}

// D[i] = C[i+1] - C[i] (mod 29). This is the exact step sequence in
// C[i+1] = C[i] + D[i] (mod 29).
const steps = ciphertext.slice(1).map((value, i) => mod(value - ciphertext[i], 29));
const nonzero = steps.filter(value => value !== 0);
const nonzeroRank = nonzero.map(value => value - 1);

// 15 is a primitive root modulo 29. Map each nonzero field element to its
// exponent; this is one source-motivated 28-symbol encoding, not a search
// over arbitrary alphabet permutations.
const log15 = Array(29).fill(-1);
let power = 1;
for (let exponent = 0; exponent < 28; exponent++) {
  if (log15[power] !== -1) throw new Error('15 is not primitive modulo 29');
  log15[power] = exponent;
  power = (power * 15) % 29;
}
if (power !== 1 || log15.slice(1).some(value => value < 0)) {
  throw new Error('Primitive-root table construction failed');
}
const nonzeroLog15 = nonzero.map(value => log15[value]);

function berlekampMasseyField(sequence, prime) {
  let connection = [1];
  let previous = [1];
  let complexity = 0;
  let shift = 1;
  let lastDiscrepancy = 1;

  for (let n = 0; n < sequence.length; n++) {
    let discrepancy = sequence[n];
    for (let i = 1; i <= complexity; i++) {
      discrepancy = mod(discrepancy + (connection[i] || 0) * sequence[n - i], prime);
    }
    if (discrepancy === 0) {
      shift++;
      continue;
    }

    const oldConnection = connection.slice();
    const scale = mod(discrepancy * inverse(lastDiscrepancy, prime), prime);
    while (connection.length < previous.length + shift) connection.push(0);
    for (let j = 0; j < previous.length; j++) {
      connection[j + shift] = mod(
        connection[j + shift] - scale * previous[j],
        prime
      );
    }

    if (2 * complexity <= n) {
      complexity = n + 1 - complexity;
      previous = oldConnection;
      lastDiscrepancy = discrepancy;
      shift = 1;
    } else {
      shift++;
    }
  }

  connection.length = complexity + 1;
  return { complexity, connection };
}

function fieldHoldout(sequence, prime) {
  const split = Math.floor(sequence.length / 2);
  const fitted = berlekampMasseyField(sequence.slice(0, split), prime);
  let hits = 0;

  for (let n = split; n < sequence.length; n++) {
    let prediction = 0;
    for (let j = 1; j <= fitted.complexity; j++) {
      prediction = mod(
        prediction - fitted.connection[j] * sequence[n - j],
        prime
      );
    }
    if (prediction === sequence[n]) hits++;
  }

  return {
    length: sequence.length,
    fullSequenceComplexity: berlekampMasseyField(sequence, prime).complexity,
    trainingLength: split,
    trainingComplexity: fitted.complexity,
    holdoutLength: sequence.length - split,
    exactHoldoutHits: hits,
    holdoutAccuracy: hits / (sequence.length - split),
    randomSymbolBaseline: 1 / prime
  };
}

const MASK64 = (1n << 64n) - 1n;
function parity64(value) {
  let x = value;
  x ^= x >> 32n;
  x ^= x >> 16n;
  x ^= x >> 8n;
  x ^= x >> 4n;
  return Number((0x6996n >> (x & 15n)) & 1n);
}
function parityBig(value) {
  let x = value;
  let parity = 0;
  while (x !== 0n) {
    parity ^= parity64(x & MASK64);
    x >>= 64n;
  }
  return parity;
}

function encodeFiveBits(sequence, order) {
  const bits = [];
  for (const value of sequence) {
    for (let j = 0; j < 5; j++) {
      bits.push(order === 'msb' ? ((value >> (4 - j)) & 1) : ((value >> j) & 1));
    }
  }
  return bits;
}

function binaryLfsrHoldout(bits) {
  const split = Math.floor(bits.length / 2);
  let connection = 1n;
  let previous = 1n;
  let complexity = 0;
  let shift = 1;
  let history = 0n;

  for (let n = 0; n < split; n++) {
    const discrepancy = bits[n] ^ parityBig((connection >> 1n) & history);
    if (discrepancy === 0) {
      shift++;
      history = (history << 1n) | BigInt(bits[n]);
      continue;
    }

    const oldConnection = connection;
    connection ^= previous << BigInt(shift);
    if (2 * complexity <= n) {
      complexity = n + 1 - complexity;
      previous = oldConnection;
      shift = 1;
    } else {
      shift++;
    }
    history = (history << 1n) | BigInt(bits[n]);
  }

  let hits = 0;
  for (let n = split; n < bits.length; n++) {
    const prediction = parityBig((connection >> 1n) & history);
    if (prediction === bits[n]) hits++;
    history = (history << 1n) | BigInt(bits[n]);
  }

  return {
    bitLength: bits.length,
    trainingLength: split,
    trainingComplexity: complexity,
    holdoutLength: bits.length - split,
    exactHoldoutHits: hits,
    holdoutAccuracy: hits / (bits.length - split),
    randomBitBaseline: 0.5
  };
}

function exactLcgMatches(sequence, modulus) {
  const matches = [];
  for (let multiplier = 0; multiplier < modulus; multiplier++) {
    for (let increment = 0; increment < modulus; increment++) {
      let valid = true;
      for (let i = 1; i < sequence.length; i++) {
        if ((multiplier * sequence[i - 1] + increment) % modulus !== sequence[i]) {
          valid = false;
          break;
        }
      }
      if (valid) matches.push({ multiplier, increment });
    }
  }
  return matches;
}

const frequencies = Array(29).fill(0);
for (const value of steps) frequencies[value]++;

const fieldSequences = [
  ['all-differences-GF29', steps],
  ['nonzero-differences-GF29', nonzero],
  ['nonzero-rank-GF29', nonzeroRank],
  ['nonzero-log15-GF29', nonzeroLog15]
];

const binarySequences = [
  ['all-differences-5bit', steps],
  ['nonzero-rank-5bit', nonzeroRank],
  ['nonzero-log15-5bit', nonzeroLog15],
  ['nonzero-raw-5bit', nonzero]
];

const output = {
  input: {
    path: 'resources/liber-primus/lp2-corpus.json',
    expectedGitBlobSha: EXPECTED_CORPUS_BLOB,
    runeCount: ciphertext.length,
    transitionCount: steps.length
  },
  stepDistribution: {
    zeroTransitions: frequencies[0],
    nonzeroTransitions: nonzero.length,
    nonzeroFrequencyMinimum: Math.min(...frequencies.slice(1)),
    nonzeroFrequencyMaximum: Math.max(...frequencies.slice(1)),
    frequenciesByResidue0to28: frequencies
  },
  gf29BerlekampMassey: fieldSequences.map(([name, sequence]) => ({
    name,
    ...fieldHoldout(sequence, 29)
  })),
  binaryFiveBitBerlekampMassey: binarySequences.flatMap(([name, sequence]) =>
    ['msb', 'lsb'].map(order => ({
      name,
      bitOrder: order,
      ...binaryLfsrHoldout(encodeFiveBits(sequence, order))
    }))
  ),
  firstOrderLcgExactSearch: {
    fullDifferencesModulo29: exactLcgMatches(steps, 29),
    nonzeroRankModulo28: exactLcgMatches(nonzeroRank, 28),
    nonzeroLog15Modulo28: exactLcgMatches(nonzeroLog15, 28)
  },
  interpretation: 'Tests apply to the observed first-difference stream itself. They do not test an unknown key K where D = plaintext + K.'
};

console.log(JSON.stringify(output, null, 2));
