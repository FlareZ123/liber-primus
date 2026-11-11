#!/usr/bin/env node
'use strict';

// Test the p05 source-derived Möbius 28-cycle as the cyclic rune order for
// the phase-35 78-base29 -> 79-base28 packet hypothesis. The existing
// red_source_79_phase35_order_gate module supplies the shared exact codec.

const fs = require('node:fs');
const assert = require('node:assert/strict');
const { packetValue, pack, unpack } = require('./red_source_79_phase35_order_gate.cjs');

const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const pages = corpus.pages.filter((p) => p.page < 56);
const ciphertext = pages.flatMap((p) => p.indices);
const translit = corpus.translit;
const mod = (x, p = 29) => ((x % p) + p) % p;

function inverse(a) {
  a = mod(a);
  for (let x = 1; x < 29; x++) if (mod(a * x) === 1) return x;
  throw new Error('non-invertible residue ' + a);
}

function applyPGL2(matrix, x) {
  const [[a, b], [c, d]] = matrix;
  if (x === null) return c === 0 ? null : mod(a * inverse(c));
  const denominator = mod(c * x + d);
  return denominator === 0 ? null : mod((a * x + b) * inverse(denominator));
}

const M05 = [[272, 151], [151, 272]].map((row) => row.map((x) => mod(x)));
const M16 = [[434, 966], [966, 434]].map((row) => row.map((x) => mod(x)));
assert.deepEqual(M05, [[11, 6], [6, 11]]);
assert.deepEqual(M16, [[28, 9], [9, 28]]);

// The p05 MOBIUS cell's GP-prime sum is 226; 226 mod 29 fixes seed 23.
const seed = mod(226);
assert.equal(seed, 23);
const cyclePoints = [];
const cycleSymbols = [];
let point = seed;
for (let i = 0; i < 28; i++) {
  assert.notEqual(point, 1);
  assert.notEqual(point, 28);
  cyclePoints.push(point);
  cycleSymbols.push(point === null ? 1 : point); // projective infinity -> GP index 1
  point = applyPGL2(M05, point);
}
assert.equal(point, seed);
assert.equal(new Set(cycleSymbols).size, 28);
assert.deepEqual(cycleSymbols.slice().sort((a, b) => a - b), [...Array(28).keys()]);

// M16 is the six-step map on M05's 28-cycle, not a second 28-cycle.
// Since gcd(6,28)=2, its own orbit from seed 23 has length 14.
const m16Orbit = [];
point = seed;
for (let i = 0; i < 14; i++) {
  m16Orbit.push(point);
  point = applyPGL2(M16, point);
}
assert.equal(point, seed);
assert.equal(new Set(m16Orbit).size, 14);
for (let i = 0; i < 28; i++) {
  assert.equal(applyPGL2(M16, cyclePoints[i]), cyclePoints[(i + 6) % 28]);
}

// The 28 non-EA cycle symbols plus its fixed EA symbol form the natural
// 29-symbol cyclic order. Cyclic rotations are rank-invariant; only direction
// remains, so test the forward and reverse orders.
const orders = [
  { name: 'M05 forward 28-cycle + EA fixed point', order: [...cycleSymbols, 28] },
  { name: 'M05 reverse 28-cycle + EA fixed point', order: [...cycleSymbols].reverse().concat([28]) }
];
function inverseOrder(order) {
  assert.equal(order.length, 29);
  assert.equal(new Set(order).size, 29);
  const rank = Array(29);
  order.forEach((rune, i) => { rank[rune] = i; });
  return rank;
}

// The independent p53 red51 source anchor fixes phase 35: p53 begins after
// 12,469 earlier runes; its red span starts at local offset 128.
let p53Offset = 0;
for (const page of pages) {
  if (page.page === 53) break;
  p53Offset += page.indices.length;
}
const redStart = p53Offset + 128;
assert.equal(p53Offset, 12469);
assert.equal(redStart, 12597);
const phase = (redStart - 1) % 79;
assert.equal(phase, 35);

const starts = [];
for (let start = phase; start + 79 <= ciphertext.length; start += 79) {
  let clean = true;
  for (let i = start; i < start + 79; i++) {
    if (ciphertext[i] === ciphertext[i - 1]) { clean = false; break; }
  }
  if (clean) starts.push(start);
}
assert.equal(starts.length, 95);

const MAX = 29n ** 78n;
const tokenPairs = translit.map((token, index) => [token, index])
  .sort((a, b) => b[0].length - a[0].length);
function englishToGP(text) {
  const source = text.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (const word of source.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      let found = false;
      for (const [token, index] of tokenPairs) {
        if (word.startsWith(token, i)) {
          out.push(index);
          i += token.length;
          found = true;
          break;
        }
      }
      if (!found) throw new Error('unmapped control text: ' + word.slice(i));
    }
  }
  return out;
}

const controlText = fs.readFileSync('resources/control/shakespeare_first300k.txt', 'utf8');
const control = englishToGP(controlText);
const split = Math.floor(control.length * 0.78);
const train = control.slice(0, split);
const holdout = control.slice(split);
const counts = Array.from({ length: 29 }, () => Array(29).fill(0));
const totals = Array(29).fill(0);
for (let i = 1; i < train.length; i++) {
  counts[train[i - 1]][train[i]]++;
  totals[train[i - 1]]++;
}
const logP = counts.map((row, i) =>
  row.map((count) => Math.log((count + 0.1) / (totals[i] + 2.9)))
);
function score(sequence) {
  let sum = 0;
  for (let i = 1; i < sequence.length; i++) sum += logP[sequence[i - 1]][sequence[i]];
  return sum / Math.max(1, sequence.length - 1);
}

const results = orders.map(({ name, order }) => {
  const ranks = inverseOrder(order);
  let valid = 0;
  let invalid = 0;
  const decoded = [];
  const packetScores = [];
  for (const start of starts) {
    const value = packetValue(ciphertext, start, ranks);
    if (value < MAX) {
      const plain = unpack(value);
      valid++;
      decoded.push(...plain);
      packetScores.push(score(plain));
    } else {
      invalid++;
    }
  }

  // Exact source-native positive control: 12 planted packets under this order.
  let predecessor = 0;
  let roundTrips = 0;
  for (let j = 0; j < 12; j++) {
    const plain = control.slice(j * 78, (j + 1) * 78);
    assert.equal(plain.length, 78);
    const encoded = pack(plain, predecessor, order);
    const recoveredValue = packetValue([predecessor, ...encoded], 1, ranks);
    assert.deepEqual(unpack(recoveredValue), plain);
    predecessor = encoded.at(-1);
    roundTrips++;
  }

  return {
    name,
    valid,
    invalid,
    decodedRunes: decoded.length,
    bigramScore: decoded.length ? score(decoded) : null,
    packetScoreRange: packetScores.length
      ? [Math.min(...packetScores), Math.max(...packetScores)]
      : null,
    preview: decoded.slice(0, 120).map((index) => translit[index]).join(''),
    order,
    plantedRoundTrips: roundTrips,
    plantedPlainRunes: roundTrips * 78,
    plantedCipherRunes: roundTrips * 79
  };
});

const uniformBaseline = logP.flat().reduce((sum, value) => sum + value, 0) / (29 * 29);
console.log(JSON.stringify({
  source: 'canonical LP2 pages 0-55; original GP indices',
  hypothesis: 'p05 M05 projective 28-cycle plus fixed EA as the 29-symbol cyclic order for the 79/78 predecessor-excluding packet inverse',
  sourceAnchor: { p53Offset, redStart, phase, cleanPackets: starts.length },
  construction: {
    p05MobiusCellPrimeSum: 226,
    seed,
    M05,
    M16,
    cycleSymbols,
    m16OrbitLength: m16Orbit.length,
    m16StepOnM05Cycle: 6,
    eaFixedSymbol: 28
  },
  languageModel: {
    trainingRunes: train.length,
    holdoutRunes: holdout.length,
    rawCipherBigramScore: score(ciphertext),
    heldoutEnglishBigramScore: score(holdout),
    nativeEnglishBigramScore: score(control.slice(0, ciphertext.length)),
    uniformRandomBigramBaseline: uniformBaseline
  },
  results,
  inference: 'Both source-selected orientations fail the 29^78 capacity gate on roughly half the 95 clean packets and produce nonlinguistic outputs; no authentic plaintext or key recovered.'
}, null, 2));
