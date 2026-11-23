"use strict";
/**
 * Source-derived, bounded *factor* bridge between original p55 word interiors
 * and the actual 256-token p49-51 numeric table.
 *
 * The 43 authentic p55 strict word-interior GP29 digits yield N43=8*P,
 * where P is a 206-bit certified prime. The original table prints 256
 * base60/base59 byte-looking tokens (a prospective 2048-bit integer).
 * A claim that P is a genuine RSA-style factor of this 2048-bit object
 * entails N2048 mod P = 0, independent of the unknown other factor.
 *
 * Check only natural radix59/60, row/column and byte big/little-endian.
 * Explicitly preserve both radix hypotheses; do not optimize presentation
 * or seek other hashes, key schedules, phases, or targets.
 */
const assert = require("node:assert/strict");
const corpus = require("../resources/liber-primus/lp2-corpus.json");
const table = require("../resources/liber-primus/lp2-grid-256.json");
const sourceP55 = corpus.pages.find(p => p.page === 55).indices;
assert.equal(sourceP55.length, 76);
const wordLengths = [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
assert.equal(wordLengths.reduce((a, b) => a + b, 0), 76);
const inner = [];
const outer = [];
for (let offset = 0, i = 0; i < wordLengths.length; i++) {
  const n = wordLengths[i];
  const word = sourceP55.slice(offset, offset + n);
  if (i === 0) outer.push(...word);
  else {
    outer.push(word[0], word[n - 1]);
    inner.push(...word.slice(1, -1));
  }
  offset += n;
}
assert.deepEqual([inner.length, outer.length], [43, 33]);
const gp29ToBig = indices => indices.reduce((a, x) => 29n * a + BigInt(x), 0n);
const sourceInner = gp29ToBig(inner);
assert.equal(sourceInner % 8n, 0n);
const primeP = sourceInner / 8n;
assert.equal(primeP, 63755441409934721069036418908763882578170591536653256311514221n);
assert.equal(primeP.toString(2).length, 206);

assert.equal(table.shape, "32 rows by 8 columns across LP2 pages 49, 50, 51");
const sourceTokens = table.pages.flatMap(p => p.tokens);
assert.equal(sourceTokens.length, 256);
assert.equal(table.bytes.length, 256);
const base59 = table.alphabet.replace("f", "");
assert.equal(base59.length, 59);
assert(!sourceTokens.some(v => v.includes("f")));
const readRadix = radix => sourceTokens.map(token => {
  const alphabet = radix === 60 ? table.alphabet : base59;
  const a = alphabet.indexOf(token[0]), b = alphabet.indexOf(token[1]);
  assert(a >= 0 && b >= 0);
  const byte = radix * a + b;
  assert(byte >= 0 && byte <= 255);
  return byte;
});
assert.deepEqual(readRadix(60), table.bytes);

function packBE(bytes) {
  return bytes.reduce((a, x) => 256n * a + BigInt(x), 0n);
}
function unpackBE(value) {
  assert(value >= 0n && value < (1n << 2048n));
  const bytes = Array(256).fill(0);
  let x = value;
  for (let j = 255; j >= 0; j--) {
    bytes[j] = Number(x % 256n);
    x /= 256n;
  }
  assert.equal(x, 0n);
  return bytes;
}
function gcd(a, b) {
  while (b !== 0n) {
    const remainder = a % b;
    a = b;
    b = remainder;
  }
  return a;
}

// Source-native, exact 2048-bit positive factor detection, independent of
// original data. A planted cofactor can be arbitrary; it is *not* claimed
// to correspond to an actual RSA private key.
const cofactor = (1n << 1839n) + 3n;
const plantedN = primeP * cofactor;
assert.equal(unpackBE(plantedN).length, 256);
assert.equal(packBE(unpackBE(plantedN)), plantedN);
assert.equal(gcd(packBE(unpackBE(plantedN)), primeP), primeP);

const tests = [];
for (const radix of [59, 60]) {
  const printed = readRadix(radix);
  const layouts = [
    ["row", printed],
    ["column", Array.from({length:256},(_,i)=>printed[(i % 32)*8+Math.floor(i/32)])]
  ];
  for (const [layout, bytes] of layouts) {
    for (const endian of ["big", "little"]) {
      const ordered = endian === "big" ? bytes : [...bytes].reverse();
      const N = packBE(ordered);
      assert.deepEqual(unpackBE(N), ordered);
      const remainder = N % primeP;
      tests.push({
        radix, layout, endian,
        integerBits: N.toString(2).length,
        leastSignificantByte: ordered[255],
        remainder: remainder.toString(),
        gcd: gcd(N, primeP).toString(),
        divides: remainder === 0n
      });
    }
  }
}
assert.equal(tests.length, 8);
assert(tests.every(t => !t.divides && t.gcd === "1"));
console.log(JSON.stringify({
  experiment: "p55-43-interior-206bit-prime as direct p50-2048bit factor",
  originalSource: "p55 76 runes, strict 43+33 source-word split; 256 original table numeric tokens",
  originalInner43Base29: sourceInner.toString(),
  factorCandidateP: primeP.toString(),
  completeNaturalPackings: tests,
  syntheticPositive2048bitFactorDetected: true,
  status: "Exact 8/8 negative: no direct P factor of original table bigint. No unknown LP2 plaintext/key. RSA interpretation and wordwise p55 partition remain hypothetical."
}, null, 2));
console.log("PASS");
