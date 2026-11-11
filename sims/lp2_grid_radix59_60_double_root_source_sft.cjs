"use strict";
/**
 * Source-only selector between base-60 and absent-f base-59 readings of the
 * printed 32x8 LP2 grid. The independently original p39 red GP triad
 * 27,5,15 = 15*(X-24)^2 and p54 oversized GP A (index 24) nominate the
 * exact evaluation point before trying either digit alphabet.
 *
 * Compare P(24) and P'(24) of the grid polynomial over F29, treating the
 * first printed cell as the leading coefficient. No ciphertext key is fitted.
 *
 * Run: node sims/lp2_grid_radix59_60_double_root_source_sft.cjs
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
/** @param {string} file */
const readJSON = file => JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8"));
const grid = readJSON("resources/liber-primus/base60-grid.json");
const ink = readJSON("resources/liber-primus/lp2-ink-annotations.json");
const corpus = readJSON("resources/liber-primus/lp2-corpus.json");
const N = 29;
const point = 24;
const canonical = grid.rows.flat();
const alphabet = grid.alphabet;

/** @param {number} x */
const mod = x => ((x % N) + N) % N;

/**
 * Evaluate the polynomial and its formal derivative by simultaneous Horner,
 * reading the canonical 256 printed values in descending-degree order.
 * @param {number[]} values
 * @param {number} x
 */
function evaluation(values, x) {
  let value = 0, derivative = 0;
  for (const coefficient of values) {
    derivative = mod(derivative * x + value);
    value = mod(value * x + coefficient);
  }
  return {value, derivative};
}

/**
 * @param {number} radix
 * @param {string} digits
 * @returns {number[]}
 */
function parse(radix, digits) {
  return canonical.map(token => {
    const hi = digits.indexOf(token[0]), lo = digits.indexOf(token[1]);
    assert.ok(hi >= 0 && lo >= 0);
    return radix * hi + lo;
  });
}

function main() {
  assert.equal(canonical.length, 256);
  assert.equal(alphabet.length, 60);
  assert.ok(!canonical.some(token => token.includes("f")));
  const base60 = parse(60, alphabet);
  const base59SameDigits = parse(59, alphabet);
  const base59Compressed = parse(59, alphabet.replace("f", ""));
  assert.deepEqual(base60, grid.byte_rows.flat());
  assert.equal(crypto.createHash("sha256").update(Buffer.from(base60))
    .digest("hex"), "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

  // The p39 red inscription's exact GP indices, independently from source.
  const marked = ink.pages.find(page => page.page === 39)
    .red_spans.find(span => span.length === 3);
  const gpIndex = new Map(corpus.runes.map((r, i) => [r, i]));
  assert.deepEqual([...marked.runes].map(r => gpIndex.get(r)), [27, 5, 15]);
  assert.equal(corpus.pages[54].indices[0], point);
  for (let x = 0; x < N; x++)
    assert.equal(mod(27 + 5*x + 15*x*x), mod(15*(x-point)**2));

  const sixty = evaluation(base60, point);
  const fiftyNineFixed = evaluation(base59SameDigits, point);
  const fiftyNineCompressed = evaluation(base59Compressed, point);
  assert.deepEqual(sixty, {value:0, derivative:0});
  assert.deepEqual(fiftyNineFixed, {value:20, derivative:5});
  assert.deepEqual(fiftyNineCompressed, {value:20, derivative:12});

  // With an unchanged 60-character ordinal lookup, P_b(X) is affine in radix b.
  const radixSlope = {
    value: mod(sixty.value-fiftyNineFixed.value),
    derivative: mod(sixty.derivative-fiftyNineFixed.derivative)
  };
  assert.deepEqual(radixSlope, {value:9, derivative:24});
  for (let b = 0; b < N; b++) {
    const computed = evaluation(parse(b, alphabet), point);
    const predicted = {
      value: mod(radixSlope.value * (b-60)),
      derivative: mod(radixSlope.derivative * (b-60))
    };
    assert.deepEqual(computed, predicted);
    assert.equal(computed.value === 0 && computed.derivative === 0, b === 2);
  }

  console.log(JSON.stringify({
    originalCells: canonical.length, gpPoint:point,
    p39RedTriad:[27,5,15], triadFactor:"15*(X-24)^2 in F29",
    base60:{...sixty, range:[Math.min(...base60),Math.max(...base60)]},
    base59Compressed:{...fiftyNineCompressed,
      range:[Math.min(...base59Compressed),Math.max(...base59Compressed)]},
    base59UncompressedOrdinals:fiftyNineFixed,
    fixedDigitRadixSlopes:radixSlope,
    exactRule:"Fixed 60-digit ordinals: P_b(24)=9*(b-60), P_b'(24)=24*(b-60) mod29",
    conditionalSelector:"For the p39/p54 double-root premise, radix 60 wins over 59; no decryption follows"
  },null,2));
}
if (require.main === module) main();
module.exports = {evaluation, parse, main};
