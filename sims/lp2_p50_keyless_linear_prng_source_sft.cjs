'use strict';

/**
 * Keyless PRNG-state exclusion on the authentic 32x8 LP2 byte table.
 * Run with Node 22 from any working directory:
 *   node sims/lp2_p50_keyless_linear_prng_source_sft.cjs
 *
 * The two digit alphabets are documented source interpretations; neither
 * is asserted to have been selected by Cicada. This file reads only.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const MASK32 = 0xffffffffn;
const CASES = [
  { radix: 59, order: 'row', endian: 'be', bm: [128,128,128,128,130,129,128,129], linear: [31,31], affine: [32,32] },
  { radix: 59, order: 'row', endian: 'le', bm: [128,128,128,128,130,129,128,129], linear: [31,31], affine: [32,32] },
  { radix: 59, order: 'column', endian: 'be', bm: [129,129,129,127,128,129,127,129], linear: [31,31], affine: [33,33] },
  { radix: 59, order: 'column', endian: 'le', bm: [129,129,129,127,128,129,127,129], linear: [31,31], affine: [33,33] },
  { radix: 60, order: 'row', endian: 'be', bm: [128,130,129,128,128,128,128,128], linear: [29,29], affine: [30,30] },
  { radix: 60, order: 'row', endian: 'le', bm: [128,130,129,128,128,128,128,128], linear: [29,29], affine: [30,30] },
  { radix: 60, order: 'column', endian: 'be', bm: [128,131,128,130,128,129,128,129], linear: [32,32], affine: [32,32] },
  { radix: 60, order: 'column', endian: 'le', bm: [128,131,128,130,128,129,128,129], linear: [32,32], affine: [32,32] }
];

/**
 * Shortest GF(2) linear recurrence consistent with a fixed binary prefix.
 * An r-bit autonomous GF(2)-linear state machine with linear one-bit output
 * necessarily produces a stream of Berlekamp-Massey complexity <= r.
 *
 * @param {number[]} bits Each item is exactly zero or one.
 * @returns {number}
 */
function linearComplexity(bits) {
  const n = bits.length;
  const c = new Uint8Array(n + 1);
  const b = new Uint8Array(n + 1);
  c[0] = b[0] = 1;
  let order = 0;
  let shift = 1;
  for (let i = 0; i < n; i++) {
    let discrepancy = bits[i];
    for (let j = 1; j <= order; j++) discrepancy ^= c[j] & bits[i - j];
    if (discrepancy === 0) {
      shift++;
      continue;
    }
    const old = c.slice();
    for (let j = 0; j + shift <= n; j++) c[j + shift] ^= b[j];
    if (2 * order <= i) {
      order = i + 1 - order;
      b.set(old);
      shift = 1;
    } else {
      shift++;
    }
  }
  return order;
}

/**
 * @param {number[]} bytes Exactly 256 source bytes.
 * @returns {number[]}
 */
function bitplaneComplexities(bytes) {
  return Array.from({ length: 8 }, (_, bit) =>
    linearComplexity(bytes.map((value) => (value >>> bit) & 1))
  );
}

/**
 * @param {number[]} bytes
 * @param {'be'|'le'} endian
 * @returns {number[]} 64 unsigned 32-bit words.
 */
function unpackWords(bytes, endian) {
  assert.equal(bytes.length, 256);
  const words = [];
  for (let i = 0; i < 256; i += 4) {
    let value = 0;
    for (let j = 0; j < 4; j++) {
      const byte = bytes[i + j];
      value = endian === 'be'
        ? (value * 256 + byte) >>> 0
        : (value | (byte << (8 * j))) >>> 0;
    }
    words.push(value >>> 0);
  }
  return words;
}

/**
 * @param {number[]} words
 * @param {'be'|'le'} endian
 * @returns {number[]}
 */
function packWords(words, endian) {
  return words.flatMap((word) => Array.from({ length: 4 }, (_, i) =>
    endian === 'be' ? ((word >>> (8 * (3 - i))) & 255) : ((word >>> (8 * i)) & 255)
  ));
}

/**
 * Test existence of a *completely unknown* fixed 32x32 GF(2) transition
 * W[t+1] = M W[t] + b. Set withConstant=false to require b=0.
 * Each row-reduction operation acts on all 32 target bits simultaneously.
 *
 * @param {number[]} words 64 fully observed 32-bit states.
 * @param {boolean} withConstant
 * @returns {{fits:boolean,rank:number,firstBadTransition?:number,residual?:number}}
 */
function fitGF2State(words, withConstant) {
  const pivots = Array(33).fill(null);
  let rank = 0;
  for (let t = 0; t + 1 < words.length; t++) {
    let input = BigInt(words[t]) | (withConstant ? (1n << 32n) : 0n);
    let output = words[t + 1] >>> 0;
    let inserted = false;
    for (let bit = 32; bit >= 0; bit--) {
      if (((input >> BigInt(bit)) & 1n) === 0n) continue;
      if (pivots[bit] === null) {
        pivots[bit] = { input, output };
        rank++;
        inserted = true;
        break;
      }
      input ^= pivots[bit].input;
      output = (output ^ pivots[bit].output) >>> 0;
    }
    if (!inserted && output !== 0) {
      return { fits: false, rank, firstBadTransition: t, residual: output };
    }
  }
  return { fits: true, rank };
}

/**
 * Multiplicative inverse of an odd 32-bit integer modulo 2^32.
 * @param {bigint} odd
 * @returns {bigint}
 */
function inverseOdd(odd) {
  assert.equal(odd & 1n, 1n);
  let inverse = 1n;
  for (let i = 0; i < 5; i++) inverse = (inverse * (2n - odd * inverse)) & MASK32;
  assert.equal((inverse * odd) & MASK32, 1n);
  return inverse;
}

/**
 * Recover *unknown* fixed (a,c) from an odd adjacent-state difference,
 * then require EVERY consecutive pair to obey W[t+1]=a*W[t]+c mod 2^32.
 * The source cases all have an odd difference; when none exists, this
 * branch deliberately reports inconclusive instead of falsely rejecting.
 *
 * @param {number[]} words
 * @returns {{fits:boolean|null,a?:string,c?:string,firstBadTransition?:number}}
 */
function fitMod32LCG(words) {
  const differences = words.slice(1).map((value, index) =>
    (BigInt(value) - BigInt(words[index])) & MASK32
  );
  let transition = -1;
  for (let i = 0; i + 1 < differences.length; i++) {
    if ((differences[i] & 1n) !== 0n) {
      transition = i;
      break;
    }
  }
  if (transition < 0) return { fits: null };
  const a = (differences[transition + 1] * inverseOdd(differences[transition])) & MASK32;
  const c = (BigInt(words[transition + 1]) - a * BigInt(words[transition])) & MASK32;
  for (let i = 0; i + 1 < words.length; i++) {
    const next = (a * BigInt(words[i]) + c) & MASK32;
    if (next !== BigInt(words[i + 1])) {
      return { fits: false, a: String(a), c: String(c), firstBadTransition: i };
    }
  }
  return { fits: true, a: String(a), c: String(c) };
}

/**
 * One standard pre-2014 Marsaglia xorshift32 generator (linear GF2 state).
 * @param {number} oldState
 * @returns {number}
 */
function xorshift32(oldState) {
  let value = oldState >>> 0;
  value ^= value << 13;
  value ^= value >>> 17;
  value ^= value << 5;
  return value >>> 0;
}

/**
 * @param {number} radix
 * @param {'row'|'column'} order
 * @param {string[][]} sourceRows
 * @param {string} completeAlphabet
 * @returns {number[]}
 */
function readTable(radix, order, sourceRows, completeAlphabet) {
  const alphabet = radix === 60 ? completeAlphabet : completeAlphabet.replace('f', '');
  assert.equal(alphabet.length, radix);
  const rows = sourceRows.map((row) => row.map((token) => {
    assert.equal(token.length, 2);
    const first = alphabet.indexOf(token[0]);
    const second = alphabet.indexOf(token[1]);
    assert.ok(first >= 0 && second >= 0);
    const value = radix * first + second;
    assert.ok(value >= 0 && value <= 255);
    return value;
  }));
  const bytes = order === 'row'
    ? rows.flat()
    : Array.from({ length: 256 }, (_, index) => rows[index % 32][Math.floor(index / 32)]);
  assert.equal(bytes.length, 256);
  return bytes;
}


/**
 * Recover every 32-bit LCG state compatible with one observed 8-bit lane.
 * Lanes 16,23,24 expose 8 bits and leave exactly 2^24 state candidates.
 * The low-eight lane obeys a projected recurrence and cannot uniquely
 * identify the original full state.
 * @param {number[]} bytes
 * @param {number} a
 * @param {number} c
 * @param {number} shift
 * @param {number} [expectedFirstState]
 * @returns {{fits:boolean,candidates:number|null,containsExpected?:boolean,firstMismatch?:number}}
 */
function recoverTruncatedLCG(bytes, a, c, shift, expectedFirstState) {
  assert.ok([0, 16, 23, 24].includes(shift));
  if (shift === 0) {
    for (let i = 1; i < bytes.length; i++) {
      if (((Math.imul(bytes[i - 1], a) + c) & 255) !== bytes[i])
        return { fits: false, candidates: 0, firstMismatch: i };
    }
    return { fits: true, candidates: null };
  }
  let candidates = 0;
  let containsExpected = false;
  const highCount = 2 ** (24 - shift), lowCount = 2 ** shift;
  for (let high = 0; high < highCount; high++) {
    const prefix = ((high << (shift + 8)) | (bytes[0] << shift)) >>> 0;
    for (let low = 0; low < lowCount; low++) {
      const first = (prefix | low) >>> 0;
      let state = first, index = 1;
      for (; index < bytes.length; index++) {
        state = (Math.imul(state, a) + c) >>> 0;
        if (((state >>> shift) & 255) !== bytes[index]) break;
      }
      if (index === bytes.length) {
        candidates++;
        if (first === expectedFirstState) containsExpected = true;
      }
    }
  }
  const result = { fits: candidates > 0, candidates };
  if (expectedFirstState !== undefined) result.containsExpected = containsExpected;
  return result;
}

/**
 * Published before 2014. C's emitted fifteen-bit rand() contains state
 * bits16..30, allowing either low byte16..23 or high byte23..30.
 * Mod-2^31 implementations have identical visible lower31-bit evolution.
 */
const BYTE_LCG_FAMILIES = [
  { name: 'ANSI-C', a: 1103515245, c: 12345, shifts: [16, 23] },
  { name: 'MSVC', a: 214013, c: 2531011, shifts: [16, 23] },
  { name: 'Borland', a: 22695477, c: 1, shifts: [16, 23] },
  { name: 'Numerical-Recipes', a: 1664525, c: 1013904223, shifts: [0, 24] }
];

function main() {
  const file = path.join(__dirname, '..', 'resources', 'liber-primus', 'base60-grid.json');
  const original = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.equal(original.rows.length, 32);
  assert.ok(original.rows.every((row) => row.length === 8));
  assert.equal(new Set(original.rows.flat()).size, 161);

  const source60 = readTable(60, 'row', original.rows, original.alphabet);
  assert.equal(
    crypto.createHash('sha256').update(Buffer.from(source60)).digest('hex'),
    '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290'
  );

  // Source-independent positive control A: a complete xorshift32 byte stream.
  let state = 3301;
  const bytePlant = [];
  for (let i = 0; i < 256; i++) {
    state = xorshift32(state);
    bytePlant.push(state >>> 24);
  }
  assert.deepEqual(bitplaneComplexities(bytePlant), Array(8).fill(32));

  // Positive controls B/C: recover a completely unknown GF2 state map and
  // a completely unknown modular LCG multiplier/increment, respectively.
  const linearPlant = [3301];
  for (let i = 1; i < 64; i++) linearPlant.push(xorshift32(linearPlant[i - 1]));
  const a = 1664525n;
  const c = 1013904223n;
  const lcgPlant = [3301];
  for (let i = 1; i < 64; i++) {
    lcgPlant.push(Number((a * BigInt(lcgPlant[i - 1]) + c) & MASK32));
  }
  for (const endian of ['be', 'le']) {
    assert.deepEqual(unpackWords(packWords(linearPlant, endian), endian), linearPlant);
    assert.deepEqual(unpackWords(packWords(lcgPlant, endian), endian), lcgPlant);
    assert.equal(fitGF2State(linearPlant, false).fits, true);
    assert.equal(fitGF2State(linearPlant, true).fits, true);
    assert.deepEqual(fitMod32LCG(lcgPlant), {
      fits: true,
      a: '1664525',
      c: '1013904223'
    });
  }


  // Four 256-byte controls recover the correct first emitting state within
  // the complete candidate class. Middle-byte C rand() states need not be
  // unique even with all 256 output bytes.
  const truncatedPlants = [
    { a: 214013, c: 2531011, shift: 16 },
    { a: 214013, c: 2531011, shift: 23 },
    { a: 1664525, c: 1013904223, shift: 24 },
    { a: 1664525, c: 1013904223, shift: 0 }
  ];
  for (const plant of truncatedPlants) {
    let state = 3301, firstState;
    const bytes = [];
    for (let i = 0; i < 256; i++) {
      state = (Math.imul(state, plant.a) + plant.c) >>> 0;
      if (i === 0) firstState = state;
      bytes.push((state >>> plant.shift) & 255);
    }
    const recovered = recoverTruncatedLCG(bytes, plant.a, plant.c, plant.shift, firstState);
    assert.equal(recovered.fits, true);
    if (plant.shift === 0) assert.equal(recovered.candidates, null);
    else {
      assert.ok(recovered.candidates >= 1);
      assert.equal(recovered.containsExpected, true);
      if (plant.shift === 24) assert.equal(recovered.candidates, 1);
    }
  }

  // Full state enumeration: 28 tests x 2^24 candidates, plus four exact
  // low-eight recurrence checks. No fitted start, byte gaps or phase.
  const truncatedOriginal = [];
  for (const radix of [59, 60]) {
    for (const order of ['row', 'column']) {
      const bytes = readTable(radix, order, original.rows, original.alphabet);
      for (const family of BYTE_LCG_FAMILIES) {
        for (const shift of family.shifts) {
          const recovered = recoverTruncatedLCG(bytes, family.a, family.c, shift);
          assert.equal(recovered.fits, false);
          assert.equal(recovered.candidates, 0);
          truncatedOriginal.push({ radix, order, family: family.name, shift });
        }
      }
    }
  }
  assert.equal(truncatedOriginal.length, 32);

  const result = [];
  for (const sourceCase of CASES) {
    const { radix, order, endian } = sourceCase;
    const bytes = readTable(radix, order, original.rows, original.alphabet);
    const complexity = bitplaneComplexities(bytes);
    assert.deepEqual(complexity, sourceCase.bm);
    const states = unpackWords(bytes, endian);
    const linear = fitGF2State(states, false);
    const affine = fitGF2State(states, true);
    const lcg = fitMod32LCG(states);
    assert.equal(linear.fits, false);
    assert.equal(affine.fits, false);
    assert.equal(lcg.fits, false);
    assert.deepEqual([linear.rank, linear.firstBadTransition], sourceCase.linear);
    assert.deepEqual([affine.rank, affine.firstBadTransition], sourceCase.affine);
    result.push({
      radix, order, endian, complexity,
      linear: { rank: linear.rank, contradictionAtTransition: linear.firstBadTransition },
      affine: { rank: affine.rank, contradictionAtTransition: affine.firstBadTransition },
      lcg: { contradictionAtTransition: lcg.firstBadTransition }
    });
  }

  console.log(JSON.stringify({
    input: 'Original LP2 pp49-51 32x8 tokens, unchanged',
    sourceBytes: 256,
    sourceDistinctTokens: 161,
    sourceSHA256Radix60: '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290',
    positiveControls: {
      directXorshift32Bitplanes: 8,
      fullyObservedLinearPlant: 64,
      fullyObservedLCGPlant: 64,
      truncatedLCGFullLengthPlants: 4
    },
    originalCases: result,
    truncatedOriginal: {
      cases: truncatedOriginal.length,
      exhaustiveCandidateInitialStates: 469762048,
      sourceViableStates: 0,
      families: BYTE_LCG_FAMILIES.map((family) => family.name)
    }
  }, null, 2));
}

main();
