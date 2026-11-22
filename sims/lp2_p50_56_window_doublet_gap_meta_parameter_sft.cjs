"use strict";

/*
 * Original-source p50 meta-parameter gate.
 * Node.js 20+, CommonJS, built-in modules only.
 *
 * Bounded tests:
 *   (1) any contiguous 56-byte row-major window is a permutation 0..55;
 *   (2) direct 8-bit, 16-bit LE/BE, LEB128 or BEB128 windows rank-correlate
 *       with the 86 original LP2 adjacent-doublet gap values.
 *
 * The 256-byte stream is a provisional base60 interpretation of the
 * original p49-p51 32x8 table, not an authenticated key.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');

const root = path.resolve(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));

const bytes = grid.bytes;
assert.equal(bytes.length, 256);
const inputHash = createHash('sha256').update(Buffer.from(bytes)).digest('hex');
assert.equal(inputHash,
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

const stream = corpus.pages
  .filter(page => page.page <= 55)
  .flatMap(page => page.indices);
assert.equal(stream.length, 12956);

const doubletPositions = [];
for (let i = 1; i < stream.length; i++) {
  if (stream[i] === stream[i - 1]) doubletPositions.push(i);
}
assert.equal(doubletPositions.length, 86);

const gaps = doubletPositions.map((position, i) =>
  i === 0 ? position : position - doubletPositions[i - 1]);
assert.equal(gaps.length, 86);
assert.deepEqual(gaps.slice(0, 12),
  [122, 85, 249, 197, 129, 127, 23, 47, 59, 553, 390, 35]);

function isPermutation0To55(values) {
  return values.length === 56 &&
    values.every(value => Number.isInteger(value) && value >= 0 && value < 56) &&
    new Set(values).size === 56;
}

// Positive control for the exact page-index permutation predicate.
assert.equal(isPermutation0To55(Array.from({length: 56}, (_, i) => i)), true);

const permutationHits = [];
for (let start = 0; start + 56 <= bytes.length; start++) {
  if (isPermutation0To55(bytes.slice(start, start + 56))) {
    permutationHits.push(start);
  }
}
assert.equal(bytes.length - 56 + 1, 201);
assert.deepEqual(permutationHits, []);

function decodeLeb128(data) {
  const values = [];
  let value = 0n;
  let shift = 0n;
  for (const byte of data) {
    value |= BigInt(byte & 0x7f) << shift;
    if ((byte & 0x80) === 0) {
      values.push(value);
      value = 0n;
      shift = 0n;
    } else {
      shift += 7n;
    }
  }
  return values; // Any incomplete trailing value is deliberately ignored.
}

function decodeBeb128(data) {
  const values = [];
  let value = 0n;
  for (const byte of data) {
    value = (value << 7n) | BigInt(byte & 0x7f);
    if ((byte & 0x80) === 0) {
      values.push(value);
      value = 0n;
    }
  }
  return values;
}

const candidates = [];
function addWindows(kind, values) {
  for (let start = 0; start + 86 <= values.length; start++) {
    candidates.push({
      kind,
      start,
      values: values.slice(start, start + 86)
    });
  }
}

addWindows('u8', bytes);

for (const endian of ['le', 'be']) {
  const values = [];
  for (let i = 0; i < bytes.length; i += 2) {
    values.push(endian === 'le'
      ? bytes[i] + 256 * bytes[i + 1]
      : 256 * bytes[i] + bytes[i + 1]);
  }
  addWindows('u16-' + endian, values);
}

const leb = decodeLeb128(bytes);
const beb = decodeBeb128(bytes);
assert.equal(leb.length, 127);
assert.equal(beb.length, 127);
addWindows('leb128', leb);
addWindows('beb128', beb);

assert.equal(candidates.length, 341);

function averageRanks(values) {
  const order = values.map((_, index) => index).sort((a, b) => {
    if (values[a] < values[b]) return -1;
    if (values[a] > values[b]) return 1;
    return a - b;
  });
  const result = Array(values.length);
  for (let i = 0; i < order.length;) {
    let j = i + 1;
    while (j < order.length && values[order[j]] === values[order[i]]) j++;
    const rank = (i + j - 1) / 2 + 1;
    for (let k = i; k < j; k++) result[order[k]] = rank;
    i = j;
  }
  return result;
}

function rankCorrelation(x, y) {
  const n = x.length;
  assert.equal(y.length, n);
  const meanX = (n + 1) / 2;
  const meanY = y.reduce((sum, value) => sum + value, 0) / n;
  let numerator = 0;
  let sumX2 = 0;
  let sumY2 = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    numerator += dx * dy;
    sumX2 += dx * dx;
    sumY2 += dy * dy;
  }
  return numerator / Math.sqrt(sumX2 * sumY2);
}

const targetRanks = averageRanks(gaps);
assert.equal(rankCorrelation(targetRanks, targetRanks), 1);

const candidateRanks = candidates.map(candidate =>
  averageRanks(candidate.values));
const scored = candidates.map((candidate, i) => ({
  kind: candidate.kind,
  start: candidate.start,
  rho: rankCorrelation(candidateRanks[i], targetRanks)
})).sort((a, b) => Math.abs(b.rho) - Math.abs(a.rho));

const best = scored[0];
assert.equal(best.kind, 'u8');
assert.equal(best.start, 149);
assert.ok(Math.abs(best.rho - (-0.3130)) < 0.0001);

// Deterministic max-over-341 randomization null, preserving the target ranks.
let randomState = 0x3301e203;
function nextUint32() {
  randomState ^= randomState << 13;
  randomState ^= randomState >>> 17;
  randomState ^= randomState << 5;
  return randomState >>> 0;
}

const nullMaxima = [];
for (let draw = 0; draw < 2000; draw++) {
  const shuffled = targetRanks.slice();
  for (let j = shuffled.length - 1; j > 0; j--) {
    const at = nextUint32() % (j + 1);
    [shuffled[j], shuffled[at]] = [shuffled[at], shuffled[j]];
  }
  let maximum = 0;
  for (const ranks of candidateRanks) {
    const value = Math.abs(rankCorrelation(ranks, shuffled));
    if (value > maximum) maximum = value;
  }
  nullMaxima.push(maximum);
}

nullMaxima.sort((a, b) => a - b);
const observed = Math.abs(best.rho);
const exceedances = nullMaxima.filter(value => value >= observed).length;
const q95 = nullMaxima[Math.floor(0.95 * nullMaxima.length)];
const q99 = nullMaxima[Math.floor(0.99 * nullMaxima.length)];
const nullMax = nullMaxima[nullMaxima.length - 1];
const empiricalTail = (exceedances + 1) / (nullMaxima.length + 1);

assert.equal(exceedances, 1361);
assert.ok(Math.abs(q95 - 0.4013) < 0.001);
assert.ok(Math.abs(q99 - 0.4441) < 0.001);
assert.ok(Math.abs(nullMax - 0.5315) < 0.001);
assert.ok(Math.abs(empiricalTail - 0.6806596701649176) < 1e-12);

const result = {
  classification: 'bounded negative for two direct source-order readings',
  input: {
    path: 'resources/liber-primus/lp2-grid-256.json',
    byte_count: bytes.length,
    sha256: inputHash,
    codec: 'provisional conventional base60'
  },
  page_index_permutation: {
    window_length: 56,
    windows_tested: 201,
    permutation_0_to_55_hits: permutationHits
  },
  doublet_gap_scan: {
    source_runes: stream.length,
    adjacent_doublets: doubletPositions.length,
    gap_values: gaps.length,
    first_12_gap_values: gaps.slice(0, 12),
    encodings: {
      u8_windows: 171,
      u16_le_windows: 43,
      u16_be_windows: 43,
      leb128_windows: 42,
      beb128_windows: 42
    },
    candidate_windows: candidates.length,
    best: {
      kind: best.kind,
      start: best.start,
      spearman_rho: best.rho
    },
    max_over_windows_null: {
      method: 'permute target average-rank vector; xorshift32; 2000 draws',
      seed: '0x3301e203',
      q95: q95,
      q99: q99,
      maximum: nullMax,
      exceedances: exceedances,
      add_one_empirical_tail_fraction: empiricalTail
    }
  }
};

console.log(JSON.stringify(result, null, 2));
