'use strict';

/**
 * Original GP word-length parity versus literal 32x8 LP2 numeric table.
 * Decision gate: source-fixed phase zero plus full 2-radix/8-bit/256-phase
 * family under a 32-row permutation null preserving every 8-column row.
 *
 * Run: node sims/lp2_wordparity_p50_bitplane_original_gate.cjs
 * Node.js 22 CommonJS, read-only, built-in modules only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const text = read('resources/liber-primus/lp2-transcription.txt');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const runeAlphabet = [...'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'];
const runeIndices = new Map(runeAlphabet.map((symbol, index) => [symbol, index]));
const words = text.replace(/[^-\.\u16a0-\u16ff]/gu, '')
  .split(/[-.]/).filter(Boolean).slice(0, 2896);
const original = corpus.pages.filter((page) => page.page <= 55)
  .flatMap((page) => page.indices);
assert.equal(words.length, 2896);
assert.deepEqual(words.flatMap((word) => [...word].map((symbol) => runeIndices.get(symbol))), original);
assert.equal(original.length, 12956);

const lengths = words.map((word) => [...word].length);
const parity = lengths.map((length) => length & 1);
assert.equal(parity.reduce((a, b) => a + b, 0), 1450);
const tokens = grid.pages.flatMap((page) => page.tokens);
assert.equal(tokens.length, 256);
assert.equal(grid.bytes.length, 256);
const radix60 = grid.alphabet;
const radix59 = radix60.replace('f', '');
const bytes = [
  grid.bytes,
  tokens.map((token) => 59 * radix59.indexOf(token[0]) + radix59.indexOf(token[1])),
];
assert.ok(tokens.every((token, i) =>
  60 * radix60.indexOf(token[0]) + radix60.indexOf(token[1]) === bytes[0][i]));
assert.ok(bytes[1].every((byte) => byte >= 0 && byte < 256));

const lengthAtMod256 = new Int16Array(256);
const parityDifference = new Int16Array(256);
for (let i = 0; i < parity.length; i += 1) {
  const residue = i & 255;
  lengthAtMod256[residue] += 1;
  parityDifference[residue] += parity[i] ? 1 : -1;
}
const n = words.length;
const ones = parity.reduce((sum, value) => sum + value, 0);

/** Evaluate all predeclared source table binary masks and cyclic phases. */
function evaluate(rowOrder) {
  let best = Number.NEGATIVE_INFINITY;
  let source = null;
  let phaseZeroBest = Number.NEGATIVE_INFINITY;
  let naturalBit2 = null;

  for (let radix = 0; radix < 2; radix += 1) {
    for (let bit = 0; bit < 8; bit += 1) {
      const mask = new Uint8Array(256);
      for (let i = 0; i < mask.length; i += 1) {
        const originalIndex = 8 * rowOrder[i >>> 3] + (i & 7);
        mask[i] = (bytes[radix][originalIndex] >>> bit) & 1;
      }
      for (let phase = 0; phase < 256; phase += 1) {
        let maskOnes = 0;
        let matches = n - ones;
        for (let i = 0; i < 256; i += 1) {
          const value = mask[(i + phase) & 255];
          maskOnes += lengthAtMod256[i] * value;
          matches += parityDifference[i] * value;
        }
        const expected = (ones * maskOnes + (n - ones) * (n - maskOnes)) / n;
        const sd = Math.sqrt(ones * (n - ones) * maskOnes * (n - maskOnes)
          / (n * n * (n - 1)));
        const z = (matches - expected) / sd;
        if (z > best) {
          best = z;
          source = { radix: radix ? 59 : 60, bit, phase, matches };
        }
        if (phase === 0 && z > phaseZeroBest) phaseZeroBest = z;
        if (radix === 0 && bit === 2 && phase === 0) {
          naturalBit2 = { z, matches, expected };
        }
      }
    }
  }
  return { best, source, phaseZeroBest, naturalBit2 };
}

const identity = Array.from({ length: 32 }, (_, i) => i);
const originalGate = evaluate(identity);
assert.equal(originalGate.source.radix, 59);
assert.equal(originalGate.source.bit, 4);
assert.equal(originalGate.source.phase, 53);
assert.equal(originalGate.source.matches, 1539);
assert.equal(originalGate.naturalBit2.matches, 1502);
assert.ok(Math.abs(originalGate.best - 6.770704764583919) < 1e-8);

let randomState = 0x33011914;
/** Deterministic xorshift32 for the null, no simulated p-value precision. */
function random() {
  randomState ^= randomState << 13;
  randomState ^= randomState >>> 17;
  randomState ^= randomState << 5;
  return randomState >>> 0;
}
const drawCount = 150;
let familyExceedances = 0;
let fixedExceedances = 0;
let phaseZeroExceedances = 0;
let familyMin = Infinity;
let familyMax = -Infinity;
let familySum = 0;
for (let draw = 0; draw < drawCount; draw += 1) {
  const perm = identity.slice();
  for (let i = 31; i > 0; i -= 1) {
    const j = random() % (i + 1);
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  const result = evaluate(perm);
  if (result.best >= originalGate.best) familyExceedances += 1;
  if (result.naturalBit2.z >= originalGate.naturalBit2.z) fixedExceedances += 1;
  if (result.phaseZeroBest >= originalGate.phaseZeroBest) phaseZeroExceedances += 1;
  familyMin = Math.min(familyMin, result.best);
  familyMax = Math.max(familyMax, result.best);
  familySum += result.best;
}
assert.equal(familyExceedances, 120);
assert.equal(fixedExceedances, 2);
assert.equal(phaseZeroExceedances, 49);

function pack(bits, bitReversed, complemented) {
  const result = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j += 1) {
      byte |= (bits[i + j] ^ +complemented) << (bitReversed ? j : 7 - j);
    }
    result.push(byte);
  }
  return result;
}
const fourDirectBitstreams = [];
for (const reverse of [false, true]) {
  for (const complement of [false, true]) {
    const packed = pack(parity, reverse, complement);
    assert.equal(packed.length, 362);
    fourDirectBitstreams.push({
      reverse,
      complement,
      printableAsciiCount: packed.filter((value) => value >= 32 && value <= 126).length,
      firstEightBytes: packed.slice(0, 8).map((value) => value.toString(16).padStart(2, '0')).join(''),
    });
  }
}

console.log(JSON.stringify({
  decision: 'No source-selected key or plaintext; bit-plane/phase family maximum is ordinary under source-table row permutations.',
  originalWords: words.length,
  originalRunes: original.length,
  oddLengthWords: ones,
  tableRows: 32,
  tableColumns: 8,
  original: originalGate,
  matchingNull: {
    rowsShuffled: drawCount,
    preserves: 'every literal 8-cell source row intact, including column and intra-row numerical relationships',
    familyExceedances,
    familyMeanMaxZ: familySum / drawCount,
    familyMin,
    familyMax,
    phaseZeroBestExceedances: phaseZeroExceedances,
    naturalBit2PhaseZeroExceedances: fixedExceedances,
  },
  directBitstreams: fourDirectBitstreams,
  interpretiveBoundary: 'The bit2/phase0 signal is postselected after inspection of all eight bit planes; 150 draws are a bounded empirical comparison, not a universal significance statement.',
}, null, 2));
