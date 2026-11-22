"use strict";

// @ts-check
// Source-frozen test of the one obvious non-additive group operation on the
// LP1 p05 prime-ordinal staircase: multiplicative Vigenere over GF(29).
// The only starts are the three original clause ranks and the 1033-square rank.
// A ciphertext F is necessarily plaintext F under nonzero multipliers and,
// following the solved-p56 rule, bypasses the key clock.

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

function primesThrough(bound) {
  const composite = new Uint8Array(bound + 1);
  const primes = [];
  for (let n = 2; n <= bound; n++) {
    if (composite[n]) continue;
    primes.push(n);
    if (n * n <= bound) {
      for (let k = n * n; k <= bound; k += n) composite[k] = 1;
    }
  }
  return primes;
}

function inverse(a, m = 29) {
  let t = 0, nextT = 1, r = m, nextR = a;
  while (nextR !== 0) {
    const q = Math.floor(r / nextR);
    [t, nextT] = [nextT, t - q * nextT];
    [r, nextR] = [nextR, r - q * nextR];
  }
  assert.equal(r, 1, "multiplicative key must be a unit");
  return ((t % m) + m) % m;
}

function mod(a, m = 29) { return ((a % m) + m) % m; }

function encryptAdditiveF(plain, key) {
  let clock = 0;
  return plain.map((p) => {
    if (p === 0) return 0;
    return (p + key[clock++]) % 29;
  });
}

function ioc(xs) {
  const counts = new Uint32Array(29);
  for (const x of xs) counts[x]++;
  let pairs = 0;
  for (const n of counts) pairs += n * (n - 1);
  return pairs / (xs.length * (xs.length - 1));
}

function maxCount(xs) {
  const counts = new Uint32Array(29);
  for (const x of xs) counts[x]++;
  return Math.max(...counts);
}

function decodeSegment(cipher, primes, start, direction) {
  let clock = 0;
  const plain = new Array(cipher.length);
  for (let i = 0; i < cipher.length; i++) {
    const c = cipher[i];
    if (c === 0) {
      plain[i] = 0;
      continue;
    }
    const ordinal = start + 28 * clock;
    const k = primes[ordinal - 1] % 29;
    assert.notEqual(k, 0);
    plain[i] = direction === "C=P*K" ? (c * inverse(k)) % 29 : (c * k) % 29;
    clock++;
  }
  return plain;
}

function encodeSegment(plain, primes, start, direction) {
  let clock = 0;
  const cipher = new Array(plain.length);
  for (let i = 0; i < plain.length; i++) {
    const p = plain[i];
    if (p === 0) {
      cipher[i] = 0;
      continue;
    }
    const ordinal = start + 28 * clock;
    const k = primes[ordinal - 1] % 29;
    assert.notEqual(k, 0);
    cipher[i] = direction === "C=P*K" ? (p * k) % 29 : (p * inverse(k)) % 29;
    clock++;
  }
  return cipher;
}

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const solved = JSON.parse(fs.readFileSync(path.join(root, "resources", "external", "relikd-solved-gp29-native-v1.json"), "utf8"));
const ranges = [[0, 2], [3, 7], [8, 14], [15, 22], [23, 26], [27, 32], [33, 39], [40, 53], [54, 55]];
const pages = corpus.pages.filter((p) => p.page <= 55 && p.indices.length > 0);
const chapters = ranges.map(([lo, hi]) => corpus.pages
  .filter((p) => p.page >= lo && p.page <= hi)
  .flatMap((p) => p.indices));
const book = pages.flatMap((p) => p.indices);
const pageSegments = pages.map((p) => p.indices);
assert.equal(book.length, 12956);
assert.deepEqual(chapters.map((p) => p.length), [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308]);

// Exact source-derived p05 rank starts:
// clauses: 853/1039/1237 are prime ranks 147/175/203;
// the original hidden square sum 1033 is prime rank 174.
const starts = [147, 174, 175, 203];
const maxClock = book.length;
const maxOrdinal = Math.max(...starts) + 28 * maxClock;
const primes = primesThrough(6000000);
assert.ok(primes.length > maxOrdinal);
assert.deepEqual([primes[146], primes[173], primes[174], primes[202]], [853, 1033, 1039, 1237]);
for (const start of starts) {
  for (let i = 0; i < maxClock; i++) assert.notEqual(primes[start + 28 * i - 1] % 29, 0);
}

// Authenticate the shared data and the actual solved-p56 F-transparent
// semantics independently of the candidate multiplicative operation.
const runeIndex = new Map(corpus.runes.map((symbol, i) => [symbol, i]));
const solvedP56 = solved.sections.find((section) => section.name === "p56_an_end").source_text;
const plain56 = [...solvedP56].filter((c) => runeIndex.has(c)).map((c) => runeIndex.get(c));
const cipher56 = corpus.pages.find((p) => p.page === 56).indices;
assert.equal(plain56.length, 85);
const p56Key = Array.from({ length: 86 }, (_, i) => (primes[i] - 1) % 29);
assert.deepEqual(encryptAdditiveF(plain56, p56Key), cipher56);
assert.equal(plain56.filter((x) => x === 0).length, 1);
assert.equal(cipher56.filter((x) => x === 0).length, 1);

// The candidate multiplicative transport has an exact source-native positive
// plant on the clear p57 control. Test both reciprocal conventions and all
// four frozen starts; this is an implementation check, not historical evidence.
const clear57 = corpus.pages.find((p) => p.page === 57).indices;
assert.equal(clear57.length, 95);
for (const start of starts) {
  for (const direction of ["C=P*K", "C=P/K"]) {
    const planted = encodeSegment(clear57, primes, start, direction);
    assert.deepEqual(decodeSegment(planted, primes, start, direction), clear57);
  }
}

// Only three source-natural key clocks are tested: one book stream, reset at
// the nine original red-heading chapters, or reset at each physical page.
const clocks = {
  book: [book],
  chapter: chapters,
  page: pageSegments
};
const results = [];
for (const start of starts) {
  for (const direction of ["C=P*K", "C=P/K"]) {
    for (const [clockName, segments] of Object.entries(clocks)) {
      const decoded = segments.flatMap((segment) => decodeSegment(segment, primes, start, direction));
      assert.equal(decoded.length, 12956);
      results.push({
        startPrimeOrdinal: start,
        key: "prime(start + 28*i) mod 29",
        direction,
        clock: clockName,
        ioc: ioc(decoded),
        maxSymbolCount: maxCount(decoded),
        fCount: decoded.filter((x) => x === 0).length
      });
    }
  }
}
assert.equal(results.length, 24);
const rawIoc = ioc(book);
const clearIoc = ioc(clear57);
const sorted = [...results].sort((a, b) => b.ioc - a.ioc);
console.log(JSON.stringify({
  source: "Original LP2 p0-p55 canonical ciphertext; exact original visual chapter and page cuts",
  sourceSelector: {
    lp1Clauses: [853, 1039, 1237],
    clausePrimeOrdinals: [147, 175, 203],
    lp1SquareSum: 1033,
    squarePrimeOrdinal: 174,
    stride: 28,
    strideMeaning: "phi(29)"
  },
  model: "multiplicative Vigenere over GF(29), K_i=prime(start+28*i) mod 29",
  fRule: "ciphertext F is plaintext F and does not consume a key symbol; nonzero multipliers make this deterministic",
  starts,
  tested: "four source-fixed starts × two reciprocal conventions × three source-natural clocks",
  models: results.length,
  originalRunes: book.length,
  originalCipherIoC: rawIoc,
  clearP57IoC: clearIoc,
  solvedP56Control: "85/85 exact authentic additive prime-totient re-encryption; one F bypass",
  multiplicativeNativePlant: "95/95 exact clear-p57 recovery for all four starts and both conventions",
  bestCandidate: sorted[0],
  worstCandidate: sorted[sorted.length - 1],
  allResults: results
}, null, 2));
