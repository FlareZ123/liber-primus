"use strict";

/**
 * Exact GF(29) coprimality gate: original pp49-51 256-byte table versus the
 * p55+p56+p57 256-GP-rune terminal source. Node.js 22 / CommonJS SFT.
 *
 * No freely selected key, factor, page ordering or decoding phase.
 * The only source variants are original or authentically decoded p56, with
 * printed terminal order or complete reversal. This excludes any COMMON
 * positive-degree polynomial divisor shared by the two original objects
 * under these literal representations, not all terminal cipher mechanisms.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const base = path.resolve(__dirname, "..");
const load = relative => JSON.parse(fs.readFileSync(path.join(base, relative), "utf8"));
const db = load("resources/liber-primus/lp2-corpus.json");
const grid = load("resources/liber-primus/lp2-grid-256.json");
const bytes = grid.bytes;
assert.equal(bytes.length, 256);
assert.equal(crypto.createHash("sha256").update(Buffer.from(bytes))
  .digest("hex"), "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

const p55 = db.pages[55].indices, c56 = db.pages[56].indices,
  p57 = db.pages[57].indices;
assert.deepEqual([p55.length, c56.length, p57.length], [76, 85, 95]);
/** @param {number} x */
const mod = x => (x % 29 + 29) % 29;

/** @param {number[]} coefficients */
function trim(coefficients) {
  const p = coefficients.map(mod);
  while (p.length > 1 && p[p.length - 1] === 0) p.pop();
  return p;
}

/** @param {number} x */
function inverse(x) {
  assert.notEqual(mod(x), 0, "No inverse of zero");
  for (let k = 1; k < 29; k++) if (mod(k * x) === 1) return k;
  throw Error("GF29 inverse missing");
}

/** @param {number[]} a @param {number[]} b */
function multiply(a, b) {
  const result = Array(a.length + b.length - 1).fill(0);
  a.forEach((x, i) => b.forEach((y, j) => {
    result[i + j] = mod(result[i + j] + x * y);
  }));
  return trim(result);
}

/** @param {number[]} a @param {number[]} b */
function remainder(a, b) {
  let r = trim(a);
  const d = trim(b);
  assert(!(d.length === 1 && d[0] === 0));
  while (r.length >= d.length && !(r.length === 1 && r[0] === 0)) {
    const shift = r.length - d.length;
    const k = mod(r[r.length - 1] * inverse(d[d.length - 1]));
    for (let j = 0; j < d.length; j++)
      r[j + shift] = mod(r[j + shift] - k * d[j]);
    r = trim(r);
  }
  return r;
}

/** @param {number[]} a @param {number[]} b */
function monicGcd(a, b) {
  let x = trim(a), y = trim(b);
  while (!(y.length === 1 && y[0] === 0)) {
    [x, y] = [y, remainder(x, y)];
  }
  return trim(x.map(t => mod(t * inverse(x[x.length - 1]))));
}

/** @param {number} n */
function firstPrimes(n) {
  const out = [];
  for (let x = 2; out.length < n; x++) {
    let prime = true;
    for (let d = 2; d * d <= x; d++) if (x % d === 0) { prime = false; break; }
    if (prime) out.push(x);
  }
  return out;
}
const keys = firstPrimes(84);
let clock = 0;
const plain56 = c56.map((c, at) =>
  at === 56 ? 0 : mod(c - (keys[clock++] - 1)));
assert.equal(clock, 84);
const GP = db.translit.map((token, index) => ({token, index}))
  .sort((a, b) => b.token.length - a.token.length);
/** @param {string} prose */
function encodeGP(prose) {
  const values = [];
  for (const word of prose.split(" ")) {
    for (let i = 0; i < word.length;) {
      const match = GP.find(x => word.startsWith(x.token, i));
      assert(match, "Known GP token " + word.slice(i));
      values.push(match.index);
      i += match.token.length;
    }
  }
  return values;
}
assert.deepEqual(plain56, encodeGP(
  "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE"));

const gridPoly = bytes.map(mod).reverse();
// Degree-16 monic low-degree factor, exact prior GF29 factorization:
// (X+5)^2 (X²+18X+11) (X³+14X²+16X+24)
// (X⁹+12X⁸+20X⁷+10X⁶+5X⁵+X⁴+9X³+15X+11).
const factor = multiply(
  multiply([25, 10, 1], [11, 18, 1]),
  multiply([24, 16, 14, 1], [11, 15, 0, 9, 1, 5, 10, 20, 12, 1])
);
assert.equal(factor.length, 17);
assert.deepEqual(remainder(gridPoly, factor), [0],
  "Exact original 256-cell grid has the frozen degree-16 divisor");

const cases = [
  ["all-original printed", p55.concat(c56, p57)],
  ["all-original reversed", p55.concat(c56, p57).reverse()],
  ["solved-p56 printed", p55.concat(plain56, p57)],
  ["solved-p56 reversed", p55.concat(plain56, p57).reverse()]
];
for (const [label, terminal] of cases) {
  assert.equal(terminal.length, 256);
  const polynomial = terminal.slice().reverse();
  const gcd = monicGcd(gridPoly, polynomial);
  assert.deepEqual(gcd, [1], label + " shared-factor exclusion");
  const sixteenRemainder = remainder(polynomial, factor);
  assert.equal(sixteenRemainder.length, 16);
  console.log(label, "gcd=1, degree16-factor remainder=",
    sixteenRemainder.join(","));
}

// Positive source-native plant: replace a terminal codeword with an
// explicitly encoded multiple of the source's actual degree-16 factor.
// The plant has exactly 256 positions and shares a factor of degree >= 16.
const native = Array.from({length: 240}, (_, i) => p57[i % p57.length]);
native[native.length - 1] = 1;
const planted = multiply(factor, native);
assert.equal(planted.length, 256);
assert.deepEqual(remainder(planted, factor), [0]);
assert(monicGcd(gridPoly, planted).length >= 17,
  "Planted shared factor must be independently recovered");
console.log("PASS: 4 original negative readings; exact common-factor plant.");
