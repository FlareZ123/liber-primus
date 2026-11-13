#!/usr/bin/env node
'use strict';

/**
 * Test whether the 180 known terminal GP runes reveal a short binary
 * XOR/LFSR keystream for a 256-byte, four-ring table cipher.
 *
 * Run: node sims/lp2_terminal256_xor_bitlfsr_sft.cjs
 *
 * The original p55 ring is never used to infer an LFSR. Exact original
 * sources and a synthetic 76-rune recovery plant are asserted.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const table = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-grid-256.json'), 'utf8'
));
const original = Buffer.from(table.bytes);
assert.equal(original.length, 256);
assert.equal(crypto.createHash('sha256').update(original).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

function firstPrimes(count) {
  const out = [];
  for (let n = 2; out.length < count; n++) {
    let prime = true;
    for (const p of out) {
      if (p * p > n) break;
      if (n % p === 0) { prime = false; break; }
    }
    if (prime) out.push(n);
  }
  return out;
}

const primes = firstPrimes(85);
let clock = 0;
const cipher56 = corpus.pages[56].indices;
const plain56 = cipher56.map((x, i) => {
  if (i === 56) {
    assert.equal(x, 0, 'Known literal F interrupter at local p56 offset 56');
    return x;
  }
  return ((x - (primes[clock++] - 1)) % 29 + 29) % 29;
});
assert.equal(clock, 84);
assert.equal(plain56.map(x => corpus.translit[x]).join(''),
  'ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE');
const plain57 = corpus.pages[57].indices;
assert.equal(plain57.length, 95);
const known = plain56.concat(plain57);
assert.equal(known.length, 180);
assert.equal(corpus.pages[55].indices.length, 76);

/**
 * The clockwise shell of a 32×8 rectangle, at inset t (0..3).
 * Each index is a zero-based source row-major byte position.
 */
function ring(t) {
  const top = t, bottom = 31 - t, left = t, right = 7 - t;
  const out = [];
  for (let c = left; c <= right; c++) out.push(top * 8 + c);
  for (let r = top + 1; r <= bottom; r++) out.push(r * 8 + right);
  for (let c = right - 1; c >= left; c--) out.push(bottom * 8 + c);
  for (let r = bottom - 1; r > top; r--) out.push(r * 8 + left);
  return out;
}

assert.deepEqual([0, 1, 2, 3].map(t => ring(t).length), [76, 68, 60, 52]);

/** Four original corners times two winding directions, consistent across rings. */
function route(corner, reverse, fromRing = 1) {
  const out = [];
  for (let t = fromRing; t <= 3; t++) {
    const source = ring(t);
    const width = 8 - 2 * t, height = 32 - 2 * t;
    const corners = [0, width - 1, width + height - 2,
      2 * width + height - 3];
    const start = corners[corner];
    for (let i = 0; i < source.length; i++) {
      out.push(source[(start + (reverse ? -i : i) + source.length) % source.length]);
    }
  }
  return out;
}

function asBits(bytes, bitOrder) {
  const bits = [];
  for (const b of bytes) {
    for (let i = 0; i < 8; i++) {
      bits.push((b >> (bitOrder === 'msb' ? 7 - i : i)) & 1);
    }
  }
  return bits;
}

/** Return packed byte values from an exact sequence of eight-bit groups. */
function fromBits(bits, bitOrder) {
  assert.equal(bits.length % 8, 0);
  return Array.from({ length: bits.length / 8 }, (_, i) => {
    let b = 0;
    for (let j = 0; j < 8; j++) {
      const shift = bitOrder === 'msb' ? 7 - j : j;
      b |= bits[8 * i + j] << shift;
    }
    return b;
  });
}

/**
 * Classical Berlekamp–Massey over GF(2). Return the *exact* minimum
 * linear complexity on the supplied finite binary record.
 */
function berlekampMassey(bits) {
  const nmax = bits.length;
  let C = new Uint8Array(nmax + 1);
  let B = new Uint8Array(nmax + 1);
  C[0] = B[0] = 1;
  let L = 0, m = -1;
  for (let n = 0; n < nmax; n++) {
    let d = bits[n];
    for (let j = 1; j <= L; j++) d ^= C[j] & bits[n - j];
    if (d === 0) continue;
    const oldC = C.slice();
    const shift = n - m;
    for (let j = 0; j + shift <= nmax; j++) C[j + shift] ^= B[j];
    if (2 * L <= n) {
      L = n + 1 - L;
      B = oldC;
      m = n;
    }
  }
  return { L, C: Array.from(C.subarray(0, L + 1)) };
}

/**
 * Reconstruct an earlier binary prefix using *only* a contiguous known
 * suffix and the LFSR connection found from that suffix. A final nonzero
 * recurrence coefficient is required to step backwards uniquely.
 */
function recoverEarlier(knownBits, prefixLength) {
  const { L, C } = berlekampMassey(knownBits);
  assert(L > 0 && L <= knownBits.length / 2);
  assert.equal(C[L], 1, 'Reversible backwards LFSR connection');
  const output = Array(prefixLength).fill(0).concat(knownBits);
  for (let n = prefixLength + L - 1; n >= L; n--) {
    let v = output[n];
    for (let j = 1; j < L; j++) v ^= C[j] & output[n - j];
    output[n - L] = v;
  }
  return { prefix: output.slice(0, prefixLength), L };
}

/* Source-original, all-secret short-binary-LFSR obstruction. */
const runs = [];
for (let corner = 0; corner < 4; corner++) {
  for (let reverse = 0; reverse < 2; reverse++) {
    const indices = route(corner, !!reverse);
    assert.equal(indices.length, 180);
    for (const register of ['plaintext', 'printed-p56']) {
      const target = register === 'plaintext' ? known : cipher56.concat(plain57);
      const mask = target.map((v, i) => original[indices[i]] ^ v);
      for (const bitOrder of ['msb', 'lsb']) {
        runs.push({
          corner, reverse: !!reverse, register, bitOrder,
          linearComplexity: berlekampMassey(asBits(mask, bitOrder)).L
        });
      }
    }
  }
}
assert.equal(runs.length, 32);
const values = runs.map(x => x.linearComplexity);
assert.equal(Math.min(...values), 719);
assert.equal(Math.max(...values), 723);
assert(values.every(x => x > 717));

/* Complete positive erasure/inversion control on the SAME 32×8 geometry. */
let state = 0x3301;
const prefixState = Array.from({ length: 47 }, () => {
  state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
  return (state >>>= 0) & 1;
});
const plantedBits = prefixState.slice();
for (let i = plantedBits.length; i < 256 * 8; i++) {
  plantedBits.push(plantedBits[i - 47] ^ plantedBits[i - 5] ^ plantedBits[i - 1]);
}
const plantedMask = fromBits(plantedBits, 'msb');
const plantedGrid = new Uint8Array(256);
const border = ring(0);
const inside = route(0, false);
const plantedUnknown = plain57.slice(0, 76);
for (let i = 0; i < 76; i++) {
  plantedGrid[border[i]] = plantedUnknown[i] ^ plantedMask[i];
}
for (let i = 0; i < 180; i++) {
  plantedGrid[inside[i]] = known[i] ^ plantedMask[76 + i];
}
assert.equal(new Set(border.concat(inside)).size, 256);
const observedMask = inside.map((index, i) => plantedGrid[index] ^ known[i]);
const recovered = recoverEarlier(asBits(observedMask, 'msb'), 76 * 8);
const recoveredMask = fromBits(recovered.prefix, 'msb');
const restoredUnknown = border.map((index, i) => plantedGrid[index] ^ recoveredMask[i]);
assert.deepEqual(restoredUnknown, plantedUnknown);
assert.deepEqual(recoveredMask, plantedMask.slice(0, 76));
assert(recovered.L <= 47);

console.log(JSON.stringify({
  input: 'Original 256 table bytes and p56+p57 180 known GP runes',
  knownBitsPerModel: 1440, placements: runs.length,
  minLinearComplexity: Math.min(...values),
  maxLinearComplexity: Math.max(...values),
  original: runs,
  positivePlant: {
    trueMaximumOrder: 47,
    detectedComplexity: recovered.L,
    recoveredUnknownRunes: restoredUnknown.length,
    exactRecovery: true
  },
  decision: 'No direct byte-XOR mask from any binary LFSR of order at most 718 in these 32 source-fixed registers/route/bit-order models.'
}, null, 2));
