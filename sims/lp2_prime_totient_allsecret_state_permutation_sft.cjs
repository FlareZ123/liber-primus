"use strict";

/**
 * Original LP2 prime-totient state: all-secret 29! permutation exclusion.
 *
 * The independently solved p56 uses phi(prime_i) = prime_i - 1 mod 29.
 * For every physical page and each of the 29 prime-totient residues,
 * grant the author a separate arbitrary secret GP29 alphabet permutation.
 * Within a fixed state, equality of two ciphertext symbols is exactly
 * invariant under every one of those 29! possibilities.
 *
 * Three source-shaped clock choices are book, physical-page, and the
 * nine original visual-chapter resets. No key or cipher shift is fitted.
 * This is a conditional source-register gate, not recovered plaintext.
 *
 * Requires Node.js 20+ and original repository reference files. No writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
/** @param {string} filename @returns {string} */
function read(filename) {
  return fs.readFileSync(path.join(ROOT, filename), "utf8");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const shakespeare = read("resources/control/shakespeare_first300k.txt");
const alphabet = corpus.translit
  .map((name, index) => ({ name: name.toLowerCase(), index }))
  .sort((a, b) => b.name.length - a.name.length);

/**
 * Tokenize Shakespeare using the standard GP ligatures; ING is the same
 * rune as NG in the independently attested solved-LP1 convention.
 *
 * @param {string} text
 * @returns {number[]}
 */
function toGP(text) {
  const source = text.toLowerCase().replace(/v/g, "u")
    .replace(/[kq]/g, "c").replace(/z/g, "s");
  const result = [];
  for (const word of source.match(/[a-z]+/gu) || []) {
    for (let pos = 0; pos < word.length;) {
      if (word.startsWith("ing", pos)) {
        result.push(21);
        pos += 3;
      } else {
        const token = alphabet.find((item) => word.startsWith(item.name, pos));
        assert(token, "Unmappable GP control at " + word.slice(pos));
        result.push(token.index);
        pos += token.name.length;
      }
    }
  }
  return result;
}

const native = toGP(shakespeare);
assert.equal(native.length, 217644);

const original = [];
const physicalPage = [];
const clocks = {
  book: [],
  page: [],
  chapter: [],
};
const chapterStarts = new Set([0, 3, 8, 15, 23, 27, 33, 40, 54]);
let bookPosition = 0;
let chapterPosition = 0;
for (let page = 0; page < 56; page++) {
  if (chapterStarts.has(page)) chapterPosition = 0;
  for (let i = 0; i < corpus.pages[page].indices.length; i++) {
    original.push(corpus.pages[page].indices[i]);
    physicalPage.push(page);
    clocks.book.push(bookPosition++);
    clocks.page.push(i);
    clocks.chapter.push(chapterPosition++);
  }
}
assert.equal(original.length, 12956);
assert.equal(physicalPage.filter((p) => p === 50).length, 0);

/** @param {number} howMany @returns {number[]} */
function firstPrimes(howMany) {
  const limit = 20 * howMany;
  const sieve = new Uint8Array(limit + 1).fill(1);
  sieve[0] = sieve[1] = 0;
  for (let p = 2; p * p <= limit; p++) {
    if (!sieve[p]) continue;
    for (let q = p * p; q <= limit; q += p) sieve[q] = 0;
  }
  const out = [];
  for (let p = 2; p <= limit && out.length < howMany; p++) {
    if (sieve[p]) out.push(p);
  }
  assert.equal(out.length, howMany);
  return out;
}

const primeKey = firstPrimes(original.length).map((p) => (p - 1) % 29);

/**
 * Conditional GP symbol-collision rate for arbitrary unknown secret
 * permutations indexed by (physical page, prime-totient residue).
 *
 * Each state contributes all ordered distinct-position pairs. A bijection
 * on that state's 29 output labels preserves exactly the numerator.
 *
 * @param {number[]} runes
 * @param {number[]} clock
 * @returns {{ numerator:number,denominator:number,rate:number,groups:number }}
 */
function collision(runes, clock) {
  assert.equal(runes.length, original.length);
  const counts = new Int32Array(56 * 29 * 29);
  const stateTotals = new Int32Array(56 * 29);
  let numerator = 0;
  let denominator = 0;
  let groups = 0;
  for (let i = 0; i < original.length; i++) {
    const state = physicalPage[i] * 29 + primeKey[clock[i]];
    const oldCount = stateTotals[state];
    if (!oldCount) groups++;
    numerator += 2 * counts[state * 29 + runes[i]];
    denominator += 2 * oldCount;
    counts[state * 29 + runes[i]]++;
    stateTotals[state]++;
  }
  return { numerator, denominator, rate: numerator / denominator, groups };
}

const expectedOriginal = {
  book: [3602, 107016, 1540],
  page: [3594, 103732, 1595],
  chapter: [3670, 105532, 1548],
};

const windows = 150;
const stride = Math.floor((native.length - original.length) / (windows - 1));
const inverse29 = Array.from({ length: 29 }, (_, a) => {
  if (a === 0) return 0;
  for (let b = 1; b < 29; b++) if ((a * b) % 29 === 1) return b;
  assert.fail("29 is prime; every nonzero multiplier must be invertible");
});

for (const [clockName, clock] of Object.entries(clocks)) {
  const observed = collision(original, clock);
  assert.deepEqual(
    [observed.numerator, observed.denominator, observed.groups],
    expectedOriginal[clockName],
  );
  const rates = [];
  for (let i = 0; i < windows; i++) {
    const start = i * stride;
    const sample = native.slice(start, start + original.length);
    rates.push(collision(sample, clock).rate);
  }
  rates.sort((a, b) => a - b);
  assert(rates[0] > 0.056);
  assert(observed.rate < rates[0]);

  // Fully source-shaped independent native positive control. The secret
  // slope and offset vary per (page, prime residue), giving 1,595 separate
  // invertible substitutions in the physical-page clock.
  const plain = native.slice(0, original.length);
  const encoded = [];
  for (let i = 0; i < plain.length; i++) {
    const page = physicalPage[i];
    const residue = primeKey[clock[i]];
    const slope = (7 * page + 11 * residue + 3) % 28 + 1;
    const offset = (13 * page + 19 * residue + 5) % 29;
    encoded.push((slope * plain[i] + offset) % 29);
    const decoded = ((encoded[i] - offset + 29) * inverse29[slope]) % 29;
    assert.equal(decoded, plain[i]);
  }
  const originalNative = collision(plain, clock);
  const encodedNative = collision(encoded, clock);
  assert.deepEqual(encodedNative, originalNative);

  console.log(JSON.stringify({
    clock: clockName,
    original: observed,
    native_windows: windows,
    native_min: rates[0],
    native_median: rates[Math.floor(windows / 2)],
    native_max: rates.at(-1),
    native_at_or_below_original: rates.filter((r) => r <= observed.rate).length,
    planted_native_original: originalNative,
    planted_cipher_equal: encodedNative.numerator === originalNative.numerator,
    planted_inversion_exact: true,
  }));
}

console.log("Decision: no original unknown plaintext or key recovered.");
