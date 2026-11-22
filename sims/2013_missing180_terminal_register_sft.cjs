'use strict';

/**
 * Exact independent 2013 telnet-primes gap -> LP2 terminal 180-register gate.
 * Read-only, deterministic, Node 22/CommonJS. All input comes from pinned
 * original-source interpretations already published under resources/.
 *
 * Usage: node sims/2013_missing180_terminal_register_sft.cjs
 * No inferred plaintext; output tests only the expressly named consumers.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const dir = path.join(__dirname, '..', 'resources', 'liber-primus');
const grid = JSON.parse(fs.readFileSync(path.join(dir, 'base60-grid.json'), 'utf8'));
const corpus = JSON.parse(fs.readFileSync(path.join(dir, 'lp2-corpus.json'), 'utf8'));

/** @param {number} n @returns {boolean} */
function isPrime(n) {
  for (let d = 2; d * d <= n; d += 1) if (n % d === 0) return false;
  return n > 1;
}
const missing = Array.from({ length: 1223 - 73 + 1 }, (_, i) => i + 73).filter(isPrime);
const interior = grid.byte_rows.slice(1, -1).flatMap((row) => row.slice(1, -1));
const terminal = corpus.pages.filter((p) => p.page === 56 || p.page === 57).flatMap((p) => p.indices);
assert.equal(missing.length, 180, '2013 gap should omit exactly 180 primes');
assert.equal(missing[0], 73);
assert.equal(missing[179], 1223);
assert.equal(interior.length, 180, '30 x 6 inner grid');
assert.equal(terminal.length, 180, '85 solved p56 + 95 cleartext p57 original symbols');
assert.equal(grid.byte_rows.length, 32);
assert.equal(grid.byte_rows[0].length, 8);
/** @param {number} x @returns {number} */
const m29 = (x) => ((x % 29) + 29) % 29;
const p56Cipher = corpus.pages.find((p) => p.page === 56).indices;
const p57Clear = corpus.pages.find((p) => p.page === 57).indices;
const firstPrimes = [];
for (let n = 2; firstPrimes.length < 84; n += 1) if (isPrime(n)) firstPrimes.push(n);
const native56 = [];
let phiClock = 0;
for (let i = 0; i < p56Cipher.length; i += 1) {
  // Authentic p56 AN END cipher: single unchanged literal-F interrupter at 56.
  native56.push(i === 56 ? 0 : m29(p56Cipher[i] - (firstPrimes[phiClock++] - 1)));
}
assert.equal(phiClock, 84);
assert.deepEqual(native56.slice(0, 5), [24, 9, 18, 9, 23], 'solved AN END prefix');
const nativeTarget = native56.concat(p57Clear);
assert.equal(nativeTarget.length, 180);


/**
 * Unconstrained deterministic row-codebook upper bound, many-to-one allowed.
 * For each fixed 0..28 input state, choose the most common output rune.
 * A stationary byte-to-rune *bijection* cannot do better than this bound.
 *
 * @param {number[]} produced
 * @param {number[]} wanted
 * @returns {number}
 */
function maxRowMatches(produced, wanted) {
  const hist = Array.from({ length: 29 }, () => new Int32Array(29));
  produced.forEach((n, i) => { hist[n][wanted[i]] += 1; });
  return hist.reduce((sum, row) => sum + Math.max(...row), 0);
}

const out = {
  source: '2013 documented command primes jumps 71 -> 1229',
  gap: { first: missing[0], last: missing.at(-1), count: missing.length },
  source_register: {
    original_grid_inner: interior.length, original_terminal_glyphs: terminal.length,
    p56_authentic_plaintext_clock: phiClock,
    p56_native_prefix: native56.slice(0, 5),
  },
  readings: [],
};
for (const reverseMissing of [false, true]) {
  const q = reverseMissing ? [...missing].reverse() : missing;
  for (const reverseGrid of [false, true]) {
    const b = reverseGrid ? [...interior].reverse() : interior;
    for (const [name, fn] of [
      ['grid+prime (mod29)', (v, p) => m29(v + p)],
      ['grid-prime (mod29)', (v, p) => m29(v - p)],
      ['prime-grid (mod29)', (v, p) => m29(p - v)],
      ['grid XOR low-prime-byte (mod29)', (v, p) => (v ^ (p & 255)) % 29],
    ]) {
      const proposed = b.map((v, i) => fn(v, q[i]));
      out.readings.push({
        prime_reverse: reverseMissing,
        grid_reverse: reverseGrid,
        operation: name,
        fixed_matches: proposed.filter((v, i) => v === terminal[i]).length,
        best_arbitrary_stationary_row_decoder: maxRowMatches(proposed, terminal),
        native_fixed_matches: proposed.filter((v, i) => v === nativeTarget[i]).length,
        best_arbitrary_stationary_native_decoder: maxRowMatches(proposed, nativeTarget),
      });
    }
  }
}

// p57's "SHED OUR OWN CIRCUMFERENCES": strict 30x6 inner source rings
// have sizes 68+60+52. Try all four real corners and two directions, with
// authenticated p56 prime-totient subtraction and no fitted keystream.
const innerRows = grid.byte_rows.slice(1, -1).map((row) => row.slice(1, -1));
/** @returns {number[]} */
function ringPeel(corner, counterclockwise) {
  const output = [];
  for (let depth = 0; depth < 3; depth += 1) {
    const top = depth, bottom = 29 - depth, left = depth, right = 5 - depth;
    const cells = [];
    for (let x = left; x <= right; x += 1) cells.push([top, x]);
    for (let y = top + 1; y <= bottom; y += 1) cells.push([y, right]);
    for (let x = right - 1; x >= left; x -= 1) cells.push([bottom, x]);
    for (let y = bottom - 1; y > top; y -= 1) cells.push([y, left]);
    const target = [[top, left], [top, right], [bottom, right], [bottom, left]][corner];
    const start = cells.findIndex(([y, x]) => y === target[0] && x === target[1]);
    assert.ok(start >= 0);
    for (let k = 0; k < cells.length; k += 1) {
      const ix = (start + (counterclockwise ? -k : k) + 2 * cells.length) % cells.length;
      const [y, x] = cells[ix];
      output.push(innerRows[y][x]);
    }
  }
  assert.equal(output.length, 180);
  return output;
}
out.circumference_totient_readings = [];
for (let corner = 0; corner < 4; corner += 1) {
  for (const counterclockwise of [false, true]) {
    const tableBytes = ringPeel(corner, counterclockwise);
    for (const reversePrimes of [false, true]) {
      const primes = reversePrimes ? [...missing].reverse() : missing;
      const predicted = tableBytes.map((byte, i) => m29(byte - (primes[i] - 1)));
      out.circumference_totient_readings.push({
        corner, counterclockwise, reversePrimes,
        original_ink_matches: predicted.filter((v, i) => v === terminal[i]).length,
        solved_native_matches: predicted.filter((v, i) => v === nativeTarget[i]).length,
        best_secret_stationary_native_matches: maxRowMatches(predicted, nativeTarget),
      });
    }
  }
}

out.byte_domain = {
  // Check historical XOR and modular-additive byte combinations against
  // literal GP prime weights of all 180 source-visible terminal symbols.
  direct_primeweight_xor_matches: interior.filter((v, i) => v === ((missing[i] & 255) ^ corpus.prime[terminal[i]])).length,
  direct_primeweight_add_matches: interior.filter((v, i) => v === ((missing[i] + corpus.prime[terminal[i]]) & 255)).length,
  xor_printable_ascii: interior.map((v, i) => v ^ (missing[i] & 255)).filter((v) => v >= 32 && v <= 126).length,
};
console.log(JSON.stringify(out, null, 2));
