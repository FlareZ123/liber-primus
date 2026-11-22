"use strict";
/**
 * Original LP2 direct irrational running-key gate, Node.js 22 CommonJS.
 *
 * Independently visible clues: solved p57 mentions CIRCUMFERENCES (pi);
 * the p15 Fibonacci illustration motivates golden-ratio phi. The author
 * has not authenticated either key interpretation.
 *
 * Test literal fractional digits in decimal or GP29-native base29, with
 * natural first integer symbol optionally present, both additive signs.
 * All arithmetic is exact integer arithmetic with 25 guard digits.
 *
 * Reproduce: node sims/lp2_pi_goldenratio_original_direct_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const corpus = JSON.parse(fs.readFileSync(path.resolve(
  __dirname, "..", "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const L = 1900;
const mod = n => (n % 29 + 29) % 29;
/** @param {number[]} values @returns {number} */
function ioc(values) {
  const f = Array(29).fill(0);
  for (const n of values) { assert(n >= 0 && n < 29); f[n]++; }
  return f.reduce((s, n) => s + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}
/** @param {bigint} scale @param {bigint} den @returns {bigint} */
function arctan(scale, den) {
  let result = 0n, power = den, sign = 1n;
  for (let k = 0; ; k++) {
    const term = scale / (BigInt(2 * k + 1) * power);
    if (!term) break;
    result += sign * term;
    sign = -sign;
    power *= den * den;
  }
  return result;
}
/** @param {bigint} n @returns {bigint} */
function sqrtFloor(n) {
  if (n < 2n) return n;
  let x = 1n << BigInt(Math.ceil(n.toString(2).length / 2));
  for (;;) {
    const y = (x + n / x) >> 1n;
    if (y >= x) return x;
    x = y;
  }
}
/**
 * @param {"pi"|"golden"} constant
 * @param {10|29} radix
 * @param {number} length
 * @returns {number[]}
 */
function digits(constant, radix, length) {
  const b = BigInt(radix), guard = 25, scale = b ** BigInt(length + guard);
  const scaled = constant === "pi" ?
    16n * arctan(scale, 5n) - 4n * arctan(scale, 239n) :
    (scale + sqrtFloor(5n * scale * scale)) / 2n;
  let fraction = (scaled % scale) / b ** BigInt(guard);
  const out = Array(length).fill(0);
  for (let i = length - 1; i >= 0; i--) {
    out[i] = Number(fraction % b);
    fraction /= b;
  }
  return out;
}
assert.equal(digits("pi", 10, L).slice(0, 20).join(""),
  "14159265358979323846");
assert.equal(digits("golden", 10, L).slice(0, 20).join(""),
  "61803398874989484820");
const originalPages = [0, 8, 15, 27, 32, 33, 39, 55];
const originalChapters = [[0, 1, 2], [8, 9, 10, 11, 12, 13, 14]];
const nativeP57 = corpus.pages.find(p => p.page === 57).indices;
assert.equal(nativeP57.length, 95);
const nativeIoc = ioc(nativeP57);
assert.ok(nativeIoc > 0.06);
const results = [];
for (const constant of ["pi", "golden"]) {
  for (const radix of [10, 29]) {
    const sequence = digits(constant, radix, L);
    const integerPart = constant === "pi" ? 3 : 1;
    for (const includeInteger of [false, true]) {
      const stream = includeInteger ? [integerPart, ...sequence] : sequence;
      for (const sign of [-1, 1]) {
        const perPage = [];
        for (const page of originalPages) {
          const original = corpus.pages.find(p => p.page === page).indices;
          const decoded = original.map((n, i) => mod(n + sign * stream[i]));
          const reencoded = decoded.map((n, i) =>
            mod(n - sign * stream[i]));
          assert.deepEqual(reencoded, original);
          perPage.push({page, runes: original.length,
            ioc: Number(ioc(decoded).toFixed(9))});
        }
        results.push({constant, radix, includeInteger, sign,
          maxIoc: Math.max(...perPage.map(x => x.ioc)), perPage});
      }
    }
  }
}
assert.equal(results.length, 16);

/**
 * Test the authentic p56 plaintext-F-transparent operation. Ciphertext F
 * may represent a literal unenciphered F with no key advancement. Other
 * ciphertext runes consume one key digit only if decoded plaintext is non-F.
 * Every legal key count is retained, including ambiguous ciphertext zeros.
 * @param {number[]} ciphertext
 * @param {number[]} key
 * @param {-1|1} sign
 * @returns {{reached:number,states:number}}
 */
function fTransparentReach(ciphertext, key, sign) {
  let states = new Set([0]);
  for (let i = 0; i < ciphertext.length; i++) {
    const next = new Set();
    for (const used of states) {
      if (ciphertext[i] === 0) next.add(used);
      const plain = mod(ciphertext[i] + sign * key[used]);
      if (plain !== 0) next.add(used + 1);
    }
    if (next.size === 0) return {reached:i, states:0};
    states = next;
  }
  return {reached:ciphertext.length, states:states.size};
}
/**
 * Positive source-native planted cipher with literal F skipped.
 * @param {number[]} plaintext
 * @param {number[]} key
 * @param {-1|1} sign
 * @returns {number[]}
 */
function fTransparentEncrypt(plaintext, key, sign) {
  let used = 0;
  return plaintext.map(x => x === 0 ? 0 : mod(x - sign * key[used++]));
}
const fTransparent = [];
for (const constant of ["pi", "golden"]) {
  for (const radix of [10, 29]) {
    const fractional = digits(constant, radix, L);
    for (const includeInteger of [false, true]) {
      const stream = includeInteger ?
        [constant === "pi" ? 3 : 1, ...fractional] : fractional;
      for (const sign of [-1, 1]) {
        const planted = fTransparentEncrypt(nativeP57, stream, sign);
        assert.equal(fTransparentReach(planted, stream, sign).reached,
          nativeP57.length);
        const pageReach = originalPages.map(page => {
          const ciphertext = corpus.pages.find(p => p.page === page).indices;
          return {page, total:ciphertext.length,
            ...fTransparentReach(ciphertext, stream, sign)};
        });
        const chapterReach = originalChapters.map(pages => {
          const ciphertext = pages.flatMap(page =>
            corpus.pages.find(p => p.page === page).indices);
          return {pages:pages.join(","), total:ciphertext.length,
            ...fTransparentReach(ciphertext, stream, sign)};
        });
        fTransparent.push({constant, radix, includeInteger, sign,
          pageReach, chapterReach});
      }
    }
  }
}
assert.equal(fTransparent.length, 16);
for (const pages of originalChapters) {
  assert.ok(fTransparent.every(test =>
    test.chapterReach.find(x => x.pages === pages.join(",")).reached <
      test.chapterReach.find(x => x.pages === pages.join(",")).total));
}
const allVariantsFailed = [27, 32, 33, 39];
for (const page of allVariantsFailed) {
  assert.equal(fTransparent.filter(test =>
    test.pageReach.find(x => x.page === page).reached ===
      corpus.pages.find(p => p.page === page).indices.length).length, 0);
}

assert.ok(results.every(x => x.maxIoc < 0.04));
console.log(JSON.stringify({
  status: "PASS", originalPages, originalVariants: results.length,
  knownClearP57NativeIoc: nativeIoc,
  maximumOriginalIoc: Math.max(...results.map(x => x.maxIoc)),
  decimals: {pi: "3.14159265358979323846",
    golden: "1.61803398874989484820"},
  evidence: results,
  fTransparent: {
    rule: "every legal genuine plaintext-F bypass and key-advance history",
    variants: fTransparent.length,
    noFullOriginalPage: allVariantsFailed,
    chaptersNoFullInverse: originalChapters.map(x => x.join(",")),
    pageReach: fTransparent
  },
  conclusion: "Neither literal pi nor golden-ratio fractional digits, " +
    "in the two native radices with the immediate additive operation, " +
    "recover GP29-native prose on original examined pages. " +
    "Complex transformations and unsupplied keys are outside scope."
}, null, 2));
