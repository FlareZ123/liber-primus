"use strict";

/**
 * Original-terminal 256-cell grid: unrestricted five-tap convolution
 * determined by 180 authentic solved GP29 runes.
 *
 * Run on Windows 11: node sims/lp2_terminal256_fivetap_knownsuffix_original_sft.cjs
 * No third-party modules, network, random seeds or file writes.
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");
const original = JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-grid-256.json"), "utf8"));
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const N = 29;
const mod = (x) => (x % N + N) % N;
const table = original.pages.flatMap((p) => p.bytes.map((x) => x % N));
assert.equal(table.length, 256);
const ciphertext56 = corpus.pages.find((p) => p.page === 56).indices;
const plaintext57 = corpus.pages.find((p) => p.page === 57).indices;
assert.equal(ciphertext56.length, 85);
assert.equal(plaintext57.length, 95);

/** Historical p56 consecutive-prime-minus-one key and literal F bypass at 56. */
const primes = [];
for (let n = 2; primes.length < 84; n++) {
  let isPrime = true;
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) { isPrime = false; break; }
  }
  if (isPrime) primes.push((n - 1) % N);
}
assert.equal(ciphertext56[56], 0);
let primeClock = 0;
const plaintext56 = ciphertext56.map((c, i) =>
  i === 56 ? c : mod(c - primes[primeClock++]));
assert.equal(primeClock, 84);
assert.equal(plaintext56.slice(0, 15).map((i) => corpus.translit[i]).join(""), "ANENDWITHINTHEDEE");
const candidates = [
  { name: "solved p56 and clear p57", values: [...plaintext56, ...plaintext57] },
  { name: "printed p56 and clear p57", values: [...ciphertext56, ...plaintext57] },
];

/** Exact source-factor identity from signed 2013 BASE29 and p39 red triad. */
const sourceFactorHighFirst = [1, 28, 13, 9, 14];
const residual = table.slice();
for (let i = 0; i < 252; i++) {
  const lead = residual[i];
  for (let k = 0; k < 5; k++) residual[i + k] = mod(residual[i + k] - lead * sourceFactorHighFirst[k]);
}
assert.deepEqual(residual.slice(-4), [0, 0, 0, 0]);

/** @param {number} x */
function inverse(x) {
  for (let y = 1; y < N; y++) if (mod(x * y) === 1) return y;
  throw new Error("zero pivot: GF29 inverse not defined");
}

/**
 * A 256-symbol grid equals a convolution of a 252-rune message Q
 * and ANY unknown five-tap kernel K, with Q[72..251] fixed to the
 * authentic 180-rune suffix. The 180 equations at grid j=76..255
 * depend only on known Q and exhaustively eliminate all secret K.
 * @param {number[]} grid
 * @param {number[]} suffix
 */
function solve(grid, suffix) {
  assert.equal(grid.length, 256);
  assert.equal(suffix.length, 180);
  const rows = [];
  for (let j = 76; j < 256; j++) {
    const row = [];
    for (let k = 0; k < 5; k++) {
      const at = j - k;
      row.push(at >= 72 && at <= 251 ? suffix[at - 72] : 0);
    }
    rows.push([...row, grid[j]]);
  }
  const reduced = rows.map((r) => r.slice());
  let rank = 0;
  const pivots = [];
  for (let col = 0; col < 5; col++) {
    let pivot = rank;
    while (pivot < reduced.length && reduced[pivot][col] === 0) pivot++;
    if (pivot === reduced.length) continue;
    [reduced[pivot], reduced[rank]] = [reduced[rank], reduced[pivot]];
    const scale = inverse(reduced[rank][col]);
    for (let c = col; c < 6; c++) reduced[rank][c] = mod(reduced[rank][c] * scale);
    for (let r = rank + 1; r < reduced.length; r++) {
      const multiple = reduced[r][col];
      if (!multiple) continue;
      for (let c = col; c < 6; c++) reduced[r][c] = mod(reduced[r][c] - multiple * reduced[rank][c]);
    }
    pivots.push(col);
    rank++;
  }
  const contradictionRows = reduced.filter((row, i) =>
    i >= rank && row.slice(0, 5).every((v) => v === 0) && row[5] !== 0).length;
  const kernel = Array(5).fill(0);
  for (let i = rank - 1; i >= 0; i--) {
    const col = pivots[i];
    let value = reduced[i][5];
    for (let k = col + 1; k < 5; k++) value = mod(value - reduced[i][k] * kernel[k]);
    kernel[col] = value;
  }
  const matchedEquations = rows.filter((row) =>
    mod(row.slice(0, 5).reduce((sum, value, k) => sum + value * kernel[k], 0)) === row[5]).length;
  return {rank, augmentedRank: rank + Number(contradictionRows > 0),
    contradictionRows, matchedEquations, totalEquations: 180, kernel};
}

/** @param {number[]} q @param {number[]} k */
function convolve(q, k) {
  const out = Array(256).fill(0);
  for (let j = 0; j < 256; j++)
    for (let tap = 0; tap < 5; tap++) {
      const at = j - tap;
      if (at >= 0 && at < 252) out[j] = mod(out[j] + k[tap] * q[at]);
    }
  return out;
}
const observed = [];
for (const [tableOrder, grid] of [["printed", table], ["reversed", table.slice().reverse()]]) {
  for (const candidate of candidates) {
    for (const [suffixOrder, suffix] of [["printed", candidate.values], ["reversed", candidate.values.slice().reverse()]]) {
      const result = solve(grid, suffix);
      assert.equal(result.rank, 5);
      assert.equal(result.augmentedRank, 6);
      assert(result.contradictionRows > 0);
      observed.push({ tableOrder, knownSuffix: candidate.name, suffixOrder, ...result });
    }
  }
}
assert.deepEqual(observed.map((x) => x.contradictionRows),
  [164, 161, 171, 166, 170, 173, 166, 169]);
assert.deepEqual(observed.map((x) => x.matchedEquations),
  [16, 19, 9, 14, 10, 7, 14, 11]);
console.log("exact original known-suffix ranks:", JSON.stringify(observed));

/** Independently planted genuine known suffix under a secret kernel. */
const key = [3, 5, 8, 13, 21];
const hidden72 = Array.from({ length: 72 }, (_, i) => (i * 7 + 9) % N);
const known180 = candidates[0].values;
const planted = convolve([...hidden72, ...known180], key);
const fit = solve(planted, known180);
assert.equal(fit.rank, 5);
assert.equal(fit.augmentedRank, 5);
assert.equal(fit.contradictionRows, 0);
assert.equal(fit.matchedEquations, 180);
assert.deepEqual(fit.kernel, key);
const recovered = [];
for (let j = 0; j < 252; j++) {
  let value = planted[j];
  for (let tap = 1; tap < 5; tap++) {
    if (j - tap >= 0) value = mod(value - key[tap] * recovered[j - tap]);
  }
  recovered[j] = mod(value * inverse(key[0]));
}
assert.deepEqual(recovered, [...hidden72, ...known180]);
assert.deepEqual(convolve(recovered, key), planted);
console.log("positive planted 252-symbol inverse:", JSON.stringify({
  recoveredKernel: fit.kernel, hiddenSymbolsRecovered: 72,
  suffixSymbolsRecovered: 180, exactGridRoundTrip: 256
}));
console.log("PASS: all eight original-source five-tap inverse gates fail; positive known-tail plant recovers all hidden symbols");
