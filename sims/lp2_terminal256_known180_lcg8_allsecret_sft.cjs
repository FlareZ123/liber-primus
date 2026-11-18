'use strict';

/**
 * Source-native terminal 76/180 known-plaintext recovery for any secret
 * 8-bit affine LCG stream, with literal XOR/add/sub byte masks.
 *
 * Windows 11, Node.js 22+; no external dependencies:
 *   node sims/lp2_terminal256_known180_lcg8_allsecret_sft.cjs
 *
 * Reversible success would recover a complete withheld 76-rune p55 page.
 * The original source fails the required uninterrupted 180-byte recurrence.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const source = JSON.parse(fs.readFileSync(path.join(
  root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(
  root, 'resources', 'liber-primus', 'lp2-grid-256.json'), 'utf8'));
const bytes = grid.bytes;
assert.equal(bytes.length, 256);
assert.equal(crypto.createHash('sha256')
  .update(Buffer.from(bytes)).digest('hex'),
'3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

/** @param {number} n @returns {number[]} */
function firstPrimes(n) {
  const values = [];
  for (let p = 2; values.length < n; p++) {
    let prime = true;
    for (const earlier of values) {
      if (earlier * earlier > p) break;
      if (p % earlier === 0) { prime = false; break; }
    }
    if (prime) values.push(p);
  }
  return values;
}
const primes = firstPrimes(85);
let clock = 0;
const originalP56 = source.pages[56].indices;
const solvedP56 = originalP56.map((v, i) => {
  if (i === 56) {
    assert.equal(v, 0);
    return v;
  }
  return ((v - primes[clock++] + 1) % 29 + 29) % 29;
});
assert.equal(clock, 84);
assert.equal(solvedP56.map(i => source.translit[i]).join(''),
'ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE');
const p57 = source.pages[57].indices;
assert.deepEqual([source.pages[55].indices.length, originalP56.length, p57.length],
  [76, 85, 95]);
const known = solvedP56.concat(p57);
const printed = originalP56.concat(p57);
const gpPrime = primes.slice(0, 29);
const registers = [
  ['solved-index', known],
  ['printed-index', printed],
  ['solved-prime', known.map(v => gpPrime[v])],
  ['printed-prime', printed.map(v => gpPrime[v])]
];

/** @param {number} inset @returns {number[]} */
function ring(inset) {
  const top = inset, bottom = 31 - inset;
  const left = inset, right = 7 - inset;
  const result = [];
  for (let x = left; x <= right; x++) result.push(top * 8 + x);
  for (let y = top + 1; y <= bottom; y++) result.push(y * 8 + right);
  for (let x = right - 1; x >= left; x--) result.push(bottom * 8 + x);
  for (let y = bottom - 1; y > top; y--) result.push(y * 8 + left);
  return result;
}
assert.deepEqual([0, 1, 2, 3].map(t => ring(t).length),
  [76, 68, 60, 52]);

/**
 * @param {number} corner Original upper-left, upper-right, lower-right, lower-left.
 * @param {boolean} reverse
 * @param {number} [startRing=1]
 * @returns {number[]}
 */
function route(corner, reverse, startRing = 1) {
  const order = [];
  for (let inset = startRing; inset < 4; inset++) {
    const r = ring(inset), width = 8 - 2 * inset, height = 32 - 2 * inset;
    const cornerIndex = [0, width - 1, width + height - 2,
      2 * width + height - 3][corner];
    for (let i = 0; i < r.length; i++)
      order.push(r[(cornerIndex + (reverse ? -i : i) + r.length) % r.length]);
  }
  return order;
}

/**
 * @param {number} actual Original table byte
 * @param {number} glyph Known GP index or source prime weight
 * @param {'xor'|'minus'|'plus'} operator
 * @returns {number}
 */
function inferMask(actual, glyph, operator) {
  if (operator === 'xor') return actual ^ glyph;
  if (operator === 'minus') return (actual - glyph + 256) & 255;
  return (actual + glyph) & 255;
}

/**
 * The first two known mask states determine the affine intercept for every
 * possible 8-bit multiplier. This enumerates every possible secret a,b,
 * including even, non-invertible and odd multipliers.
 * @param {number[]} knownMask
 * @returns {{matches:number,multiplier:number,increment:number}}
 */
function bestLCG(knownMask) {
  assert.equal(knownMask.length, 180);
  let best = {matches: 0, multiplier: -1, increment: -1};
  for (let a = 0; a < 256; a++) {
    const b = (knownMask[1] - a * knownMask[0] + 65536) & 255;
    let matches = 0;
    for (let i = 1; i < knownMask.length; i++) {
      if (((a * knownMask[i - 1] + b) & 255) === knownMask[i])
        matches++;
    }
    if (matches > best.matches)
      best = {matches, multiplier: a, increment: b};
  }
  return best;
}

/**
 * @param {number} multiplier An odd integer modulo 256
 * @returns {number} Unique multiplicative inverse modulo 256
 */
function inverse8(multiplier) {
  assert.equal(multiplier & 1, 1);
  for (let candidate = 1; candidate < 256; candidate += 2)
    if (((candidate * multiplier) & 255) === 1) return candidate;
  throw new Error('Odd element had no multiplicative inverse modulo 256');
}

/** Positive: a true secret odd-multiplier LCG and unknown outer 76 GP runes. */
function positivePlant() {
  const multiplier = 5, increment = 103, stream = [72];
  for (let i = 1; i < 256; i++)
    stream.push((multiplier * stream.at(-1) + increment) & 255);
  const rim = ring(0), inside = route(0, false);
  const hidden = p57.slice(0, 76);
  const artificial = Array(256).fill(0);
  for (let i = 0; i < 76; i++)
    artificial[rim[i]] = stream[i] ^ hidden[i];
  for (let i = 0; i < 180; i++)
    artificial[inside[i]] = stream[i + 76] ^ known[i];
  assert.equal(new Set(rim.concat(inside)).size, 256);
  const observed = inside.map((cell, i) =>
    inferMask(artificial[cell], known[i], 'xor'));
  const recovered = bestLCG(observed);
  assert.deepEqual(recovered, {matches: 179, multiplier, increment});
  const inv = inverse8(recovered.multiplier);
  const restoredStream = Array(76).fill(0);
  let state = observed[0];
  for (let i = 75; i >= 0; i--) {
    state = (inv * (state - recovered.increment + 256)) & 255;
    restoredStream[i] = state;
  }
  assert.deepEqual(restoredStream, stream.slice(0, 76));
  const decoded = rim.map((cell, i) =>
    artificial[cell] ^ restoredStream[i]);
  assert.deepEqual(decoded, hidden);
  return {recoveredMultiplier: recovered.multiplier,
    recoveredIncrement: recovered.increment, recoveredKnown: 180,
    recoveredHidden: decoded.length};
}

/** @returns {object} */
function run() {
  const attempts = [];
  for (let corner = 0; corner < 4; corner++)
    for (const reverse of [false, true]) {
      const cells = route(corner, reverse);
      assert.equal(cells.length, 180);
      for (const [name, knownTarget] of registers)
        for (const operator of /** @type {Array<'xor'|'minus'|'plus'>} */
          (['xor', 'minus', 'plus'])) {
          const inferred = cells.map((cell, i) =>
            inferMask(bytes[cell], knownTarget[i], operator));
          attempts.push({corner, reverse, register: name, operator,
            source13_31Matches: inferred.slice(1).reduce((sum, value, i) =>
              sum + Number(((13 * inferred[i] + 31) & 255) === value), 0),
            ...bestLCG(inferred)});
        }
    }
  assert.equal(attempts.length, 96);
  const max = Math.max(...attempts.map(a => a.matches));
  const min = Math.min(...attempts.map(a => a.matches));
  assert.equal(max, 6);
  assert.equal(min, 4);
  const source13_31Max = Math.max(...attempts.map(a => a.source13_31Matches));
  assert.equal(source13_31Max, 3);
  assert(attempts.every(a => a.matches < 179));
  return {sources: 'Original table 256 printed bytes and known p56+p57 180 runes',
    sourceSHA256: crypto.createHash('sha256')
      .update(Buffer.from(bytes)).digest('hex'),
    models: attempts.length, transitionsPerModel: 179,
    possibleSecretsPerModel: 256, maxAdjacentMatches: max,
    minBestAdjacentMatches: min, source13_31MaxAdjacentMatches: source13_31Max,
    bestExamples: attempts.filter(a => a.matches === max),
    positive: positivePlant(),
    decision: 'All 96 source-shaped complete 8-bit LCG keystream models impossible; no p55 plaintext recovered'};
}
if (require.main === module)
  console.log(JSON.stringify(run(), null, 2));
module.exports = {ring, route, inferMask, bestLCG, inverse8, run};
