'use strict';

/**
 * Exact key-independent direct-text obstruction for four archived 256-byte
 * candidate shares (three historical onion-service excerpts and the LP2 grid).
 *
 * Any *fixed* GF(256) linear reconstruction, with an optional unknown constant
 * XOR byte, is represented by 33 binary coefficients. Each aligned output byte
 * contributes one GF(2) equation saying its top bit must be zero for 7-bit text.
 * Full column rank proves there is no nonconstant all-7-bit output, independently
 * of the four GF(256) share coefficients, including unknown Shamir x coordinates.
 *
 * This does not restrict binary keys, KDFs, per-byte coefficients or other
 * relative source alignments. Run: node sims/onion256_fourshare_ascii_rank.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
/** @param {string} relative */
const json = (relative) => JSON.parse(
  fs.readFileSync(path.join(ROOT, relative), 'utf8')
);
const HISTORY = json('resources/cicada-hiddenservice-256-candidates.json');
const GRID = json('resources/liber-primus/lp2-grid-256.json');
const CORRECTIONS = [[45,81], [50,21], [165,47], [172,174], [246,224]];
const MODES = ['row-major', 'row-major-reversed',
  'column-major', 'column-major-reversed'];
const POLYNOMIALS = [0x1b, 0x1d];

/**
 * Multiply two byte elements in GF(2^8) with reduction by x^8 + poly.
 * @param {number} a
 * @param {number} b
 * @param {number} poly Polynomial's low eight bits (0x1b or 0x1d).
 */
function gfMul(a, b, poly) {
  let out = 0;
  for (let j = 0; j < 8; j++) {
    if ((b & 1) !== 0) out ^= a;
    b >>>= 1;
    a = ((a << 1) ^ ((a & 0x80) ? poly : 0)) & 0xff;
  }
  return out;
}

/** @param {number} a @param {number} n @param {number} poly */
function gfPow(a, n, poly) {
  let r = 1;
  while (n > 0) {
    if ((n & 1) !== 0) r = gfMul(r, a, poly);
    a = gfMul(a, a, poly);
    n = Math.floor(n / 2);
  }
  return r;
}

/** @param {number[]} bytes @param {string} layout */
function arrange(bytes, layout) {
  assert.equal(bytes.length, 256);
  const columnMajor = Array.from({length: 256}, (_, i) =>
    bytes[(i % 32) * 8 + Math.floor(i / 32)]);
  if (layout === 'row-major') return bytes.slice();
  if (layout === 'row-major-reversed') return bytes.slice().reverse();
  if (layout === 'column-major') return columnMajor;
  if (layout === 'column-major-reversed') return columnMajor.reverse();
  throw new Error('Unknown layout: ' + layout);
}

/**
 * Each output's MSB is a linear combination of 32 secret coefficient bits and
 * a 33rd bit for the fixed XOR-byte high bit.
 * @param {number[][]} sources Four aligned 256-byte arrays.
 * @param {number} poly
 * @returns {bigint[]}
 */
function topBitRows(sources, poly) {
  assert.equal(sources.length, 4);
  for (const source of sources) assert.equal(source.length, 256);
  const rows = [];
  for (let i = 0; i < 256; i++) {
    let equation = 1n << 32n;  // Optional uniform XOR high-bit.
    for (let source = 0; source < 4; source++) {
      for (let bit = 0; bit < 8; bit++) {
        if ((gfMul(sources[source][i], 1 << bit, poly) & 128) !== 0)
          equation |= 1n << BigInt(source * 8 + bit);
      }
    }
    rows.push(equation);
  }
  return rows;
}

/**
 * Compute binary rank and a row-index witness by exact GF(2) elimination.
 * @param {bigint[]} rows
 * @returns {{rank:number,witness:number[]}}
 */
function gf2Rank(rows) {
  const pivots = Array(33).fill(0n);
  const witness = [];
  for (let i = 0; i < rows.length; i++) {
    let x = rows[i];
    for (let bit = 32; bit >= 0; bit--) {
      if ((x & (1n << BigInt(bit))) === 0n) continue;
      if (pivots[bit] !== 0n) x ^= pivots[bit];
      else {
        pivots[bit] = x;
        witness.push(i);
        break;
      }
    }
  }
  return {rank: witness.length, witness};
}

/** @param {bigint[]} rows */
function firstFullPrefix(rows) {
  for (let n = 33; n <= rows.length; n++)
    if (gf2Rank(rows.slice(0, n)).rank === 33) return n;
  return null;
}

/** @param {number[]} numbers */
function sha256(numbers) {
  return crypto.createHash('sha256')
    .update(Buffer.from(numbers)).digest('hex');
}

/**
 * Deterministic source-native full-degree Shamir plant.
 * Reconstruct ASCII at x=0 from four shares at x=1,2,3,4.
 * @param {number} poly
 */
function control(poly) {
  const message = 'CICADA 3301 ORIGINAL SOURCE TEST ';
  const plain = Array.from({length: 256}, (_, i) =>
    message.charCodeAt(i % message.length));
  const xs = [1,2,3,4];
  const shares = xs.map(() => Array(256).fill(0));
  let state = 0x9e3779b9;
  /** @returns {number} */
  function randomByte() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state & 255;
  }
  for (let i = 0; i < 256; i++) {
    const coeff = [plain[i], randomByte(), randomByte(), randomByte()];
    for (let s = 0; s < 4; s++) {
      let y = coeff[3];
      for (let k = 2; k >= 0; k--) y = gfMul(y, xs[s], poly) ^ coeff[k];
      shares[s][i] = y;
    }
  }
  const lambdas = xs.map((x, i) => {
    let lambda = 1;
    for (let j = 0; j < xs.length; j++) {
      if (j === i) continue;
      lambda = gfMul(lambda, xs[j], poly);
      lambda = gfMul(lambda, gfPow(x ^ xs[j], 254, poly), poly);
    }
    return lambda;
  });
  const recovered = plain.map((_, i) =>
    shares.reduce((sum, share, s) =>
      sum ^ gfMul(lambdas[s], share[i], poly), 0));
  assert.deepEqual(recovered, plain, 'Shamir control must recover ASCII');
  const rank = gf2Rank(topBitRows(shares, poly)).rank;
  assert.ok(rank <= 32, 'A valid ASCII source must have a null vector');
  return {recoveredBytes: recovered.length, rank, lambdas};
}

function run() {
  assert.equal(HISTORY.sourceServices.length, 3);
  const historic = HISTORY.sourceServices.map(({hex}) => {
    assert.match(hex, /^[0-9a-f]{512}$/i);
    return [...Buffer.from(hex, 'hex')];
  });
  assert.equal(GRID.bytes.length, 256);
  const variants = [];
  for (const corrected of [false, true]) {
    const grid = GRID.bytes.slice();
    if (corrected)
      for (const [index, value] of CORRECTIONS) grid[index] = value;
    for (const layout of MODES) {
      const aligned = historic.concat([arrange(grid, layout)]);
      for (const poly of POLYNOMIALS) {
        const rows = topBitRows(aligned, poly);
        const rank = gf2Rank(rows);
        const firstFull = firstFullPrefix(rows);
        const blocks = Array.from({length: 6}, (_, i) =>
          gf2Rank(rows.slice(i * 40, i * 40 + 40)).rank);
        assert.equal(rank.rank, 33, 'Original all-ASCII obstruction failed');
        assert.ok(firstFull !== null && firstFull <= 40);
        assert.deepEqual(blocks, [33,33,33,33,33,33]);
        assert.equal(rank.witness.length, 33);
        variants.push({
          corrected, layout, fieldLowPolynomial: '0x' + poly.toString(16),
          rank: rank.rank, firstFullRankPrefix: firstFull,
          disjoint40ByteBlockRanks: blocks,
          sourceSha256: aligned.map(sha256),
          independentSourceBytePositions: rank.witness
        });
      }
    }
  }
  const controls = POLYNOMIALS.map(poly => ({
    fieldLowPolynomial: '0x' + poly.toString(16), ...control(poly)
  }));
  const result = {
    source: 'Three 256-byte historical onion candidates and one LP2 grid',
    exactModel: 'Any four GF256 coefficients and a fixed XOR byte, ' +
      'aligned bytewise; 7-bit ASCII requires all output MSBs zero',
    cases: variants.length,
    variants, controls,
    conclusion: 'All 16 original-source variants have rank 33; ' +
      'every nonzero linear combination has at least six bytes with ' +
      'MSB=1 in disjoint 40-byte blocks of the first 240 bytes, ' +
      'even after a fixed XOR byte. The all-zero coefficients yield ' +
      'only a constant byte string, not a recovered message.',
    limitations: 'No proof against binary output, nonlinear KDFs, ' +
      'per-byte field coefficients, changing keys or unknown ' +
      'relative source alignments; historical share attribution unproven'
  };
  console.log(JSON.stringify(result, null, 2));
  return result;
}

if (require.main === module) run();
module.exports = {gfMul, gf2Rank, topBitRows, arrange, control, run};
