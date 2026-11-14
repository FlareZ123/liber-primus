'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');

/**
 * Original-source 32×8 terminal-rune XOR all-secret gate.
 * Run from the repository root on Windows Node.js 22:
 * node sims/lp2_grid256_terminal_inner180_xor_allsecret_sft.cjs
 *
 * Hypothetical consumer:
 *   gridByte[row, col] = RowSecret[row] XOR ColSecret[col] XOR RuneCode[plainRune].
 * Every row/column/codeword byte is unrestricted, including noninjective
 * RuneCode. Source-visible geometry selects ring lengths 76+68+60+52.
 * No secret, phase, or candidate plaintext is inferred from p55.
 */
const gridSource = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-grid-256.json', 'utf8'));
const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const bytes = gridSource.pages.flatMap(page => page.bytes);
assert.equal(bytes.length, 256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

const page = n => corpus.pages.find(p => p.page === n).indices;
/** @returns {number[]} First 84 primes. */
function firstPrimes(count) {
  const ps = [];
  for (let n = 2; ps.length < count; n++) {
    if (ps.every(p => n % p !== 0)) ps.push(n);
  }
  return ps;
}
const primes = firstPrimes(84);
let clock = 0;
const p56 = page(56).map((cipher, i) => {
  if (i === 56) {
    assert.equal(cipher, 0, 'Source p56 transparent-F position');
    return 0;
  }
  const key = (primes[clock++] - 1) % 29;
  return (cipher - key + 29) % 29;
});
assert.equal(clock, 84);
assert.equal(p56.length, 85);
assert.equal(p56.slice(0, 9).map(i => corpus.translit[i]).join(''), 'ANENDWITHI');
const p57 = page(57);
assert.equal(p57.length, 95);
const known = p56.concat(p57);
assert.equal(known.length, 180);

/** @param {number} level @returns {number[]} Ring positions, NW clockwise. */
function ring(level) {
  const out = [];
  const top = level, left = level, bottom = 31 - level, right = 7 - level;
  for (let c = left; c <= right; c++) out.push(top * 8 + c);
  for (let r = top + 1; r <= bottom; r++) out.push(r * 8 + right);
  for (let c = right - 1; c >= left; c--) out.push(bottom * 8 + c);
  for (let r = bottom - 1; r > top; r--) out.push(r * 8 + left);
  return out;
}

/** @param {number} level @returns {number[][]} Four corners × two directions. */
function orientations(level) {
  const base = ring(level);
  const corners = [
    level * 8 + level, level * 8 + 7 - level,
    (31 - level) * 8 + 7 - level, (31 - level) * 8 + level
  ];
  return corners.flatMap(start => {
    const k = base.indexOf(start);
    assert.ok(k >= 0);
    const forward = base.slice(k).concat(base.slice(0, k));
    return [forward, [forward[0], ...forward.slice(1).reverse()]];
  });
}

for (let l = 0; l < 4; l++) {
  assert.equal(ring(l).length, [76, 68, 60, 52][l]);
}
const full = Array.from({ length: 4 }, (_, i) => ring(i)).flat();
assert.equal(new Set(full).size, 256);
// A four-cell, two-row/two-column original counterexample in the first
// inner-ring NW-clockwise mapping: both positions in one column have S,
// both in the other have I. All hidden row/column/rune masks cancel.
const innerNatural = full.slice(76);
const witness = [182, 198, 193, 177];
assert.deepEqual(witness.map(at => known[innerNatural.indexOf(at)]), [15, 15, 10, 10]);
assert.equal(witness.reduce((acc, at) => acc ^ bytes[at], 0), 214);
const options = [1, 2, 3].map(orientations);
const bits = Array.from({ length: 69 }, (_, i) => 1n << BigInt(i));

/**
 * Solve all 180 original byte equations over GF(2) for all eight output bits
 * simultaneously. A nonzero zero-coefficient residual is an exact
 * inconsistency even when every one of 69 secret bytes is unrestricted.
 *
 * @param {number[]} table 256 byte values.
 * @param {number[]} coords 180 original grid addresses.
 * @param {number[]} plaintext 180 known GP29 symbol IDs.
 * @returns {{ rank: number, contradictions: number, first: number|null }}
 */
function check(table, coords, plaintext) {
  const pivots = Array(69).fill(0n);
  const values = Array(69).fill(0);
  let rank = 0, contradictions = 0, first = null;
  for (let i = 0; i < 180; i++) {
    const a = coords[i];
    let mask = bits[a >> 3] ^ bits[32 + (a & 7)] ^ bits[40 + plaintext[i]];
    let value = table[a];
    for (let b = 68; b >= 0; b--) {
      if ((mask & bits[b]) === 0n) continue;
      if (pivots[b] !== 0n) {
        mask ^= pivots[b];
        value ^= values[b];
      } else {
        pivots[b] = mask;
        values[b] = value;
        rank++;
        break;
      }
    }
    if (mask === 0n && value !== 0) {
      contradictions++;
      if (first === null) first = i;
    }
  }
  return { rank, contradictions, first };
}

// Every ring independently chooses one of four corners and two directions;
// known plaintext is tested in source order and its entire reversal.
let checked = 0, successes = 0, minimum = Infinity, maximumRank = 0, best = [];
const perOrientationMinimum = [Infinity, Infinity];
for (let a = 0; a < 8; a++) {
  for (let b = 0; b < 8; b++) {
    for (let c = 0; c < 8; c++) {
      const coords = options[0][a].concat(options[1][b], options[2][c]);
      assert.equal(new Set(coords).size, 180);
      for (let reversal = 0; reversal < 2; reversal++) {
        const t = reversal ? known.toReversed() : known;
        const result = check(bytes, coords, t);
        checked++;
        maximumRank = Math.max(maximumRank, result.rank);
        perOrientationMinimum[reversal] = Math.min(perOrientationMinimum[reversal], result.contradictions);
        if (result.contradictions === 0) successes++;
        if (result.contradictions < minimum) {
          minimum = result.contradictions;
          best = [{ a, b, c, reversal, ...result }];
        } else if (result.contradictions === minimum) {
          best.push({ a, b, c, reversal, ...result });
        }
      }
    }
  }
}
assert.equal(checked, 1024);
assert.equal(successes, 0);
assert.equal(minimum, 119);
assert.equal(maximumRank, 57);
assert.deepEqual(perOrientationMinimum, [119, 119]);

// Planted exact original-shape positive with independent byte secrets.
// The planted complete 256 positions contain a 76-rune clear p57 prefix
// on the outer ring and the same real known p56+p57 in the inner rings.
const rowKeys = Array.from({ length: 32 }, (_, r) => (17 + 41 * r) & 255);
const colKeys = Array.from({ length: 8 }, (_, c) => (99 + 53 * c) & 255);
const runeKeys = Array.from({ length: 29 }, (_, p) => (55 + 113 * p) & 255);
assert.equal(new Set(runeKeys).size, 29);
const plantedTable = Array(256).fill(null);
const plantedPlain = p57.slice(0, 76).concat(known);
for (let i = 0; i < 256; i++) {
  const at = full[i], row = at >> 3, col = at & 7;
  plantedTable[at] = rowKeys[row] ^ colKeys[col] ^ runeKeys[plantedPlain[i]];
}
const inner = full.slice(76);
assert.equal(check(plantedTable, inner, known).contradictions, 0);
for (let i = 0; i < 256; i++) {
  const at = full[i], row = at >> 3, col = at & 7;
  const decodedByte = plantedTable[at] ^ rowKeys[row] ^ colKeys[col];
  assert.equal(runeKeys.indexOf(decodedByte), plantedPlain[i]);
}
console.log(JSON.stringify({
  source: 'canonical 256 byte table + authentic p56/p57',
  model: '8-bit XOR of arbitrary secret row/column/rune codewords',
  original: { checked, successes, minimumContradictions: minimum, maximumRank,
    minimumByForwardReversedKnown: perOrientationMinimum, best },
  synthetic: '256/256 source-shape encode/decode, 180/180 known equations exact'
}, null, 2));
