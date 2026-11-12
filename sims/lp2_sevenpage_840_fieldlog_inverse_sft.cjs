"use strict";

/**
 * Full source-selected visual chapter p33..p39 (seven repeated cuneiform pages):
 * 1680 GP29 runes = 840 paired field values = |GF(29^2)^*|.
 * The independently marked p3 red triad [13,23,2] defines
 * u^2=3u+8, and u is a primitive element of order 840.
 *
 * Test the direct bijective discrete-log 2-rune inverse with frozen
 * coordinate and exponent orientations on the complete ORIGINAL chapter.
 *
 * Node.js 22, CommonJS, no dependencies; no key or plaintext search.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const mod = x => (x % 29 + 29) % 29;
/** @param {[number,number]} x @param {[number,number]} y */
function mul(x, y) {
  return [mod(x[0] * y[0] + 8 * x[1] * y[1]),
    mod(x[0] * y[1] + x[1] * y[0] + 3 * x[1] * y[1])];
}
const pages = corpus.pages.filter(p => p.page >= 33 && p.page <= 39);
assert.deepEqual(pages.map(p => p.indices.length), [214,261,271,238,228,228,240]);
const chapter = pages.flatMap(p => p.indices);
assert.equal(chapter.length, 1680);
assert.deepEqual(corpus.pages[3].indices.slice(119, 122), [13,23,2]);

const powers = [], logs = new Map();
let z = [1, 0];
for (let k = 0; k < 840; k++) {
  const id = 29 * z[0] + z[1];
  assert(!logs.has(id));
  powers.push(z);
  logs.set(id, k);
  z = mul(z, [0,1]);
}
assert.deepEqual(z, [1,0]);
assert.equal(logs.size, 840);
assert(!logs.has(0));

/** @param {number[]} v */
function ioc(v) {
  const counts = Array(29).fill(0);
  v.forEach(x => counts[x]++);
  return counts.reduce((sum, n) => sum + n * (n - 1), 0)
    / (v.length * (v.length - 1));
}

/**
 * 840 nonzero field elements -> 840 exponent values -> 2 GP29 digits.
 * The pair 28,28 would encode 840 and is unused, by source group order.
 * @param {number[]} indices original paired coordinates
 * @param {boolean} swap field-coordinate exchange
 * @param {boolean} invert field-element inverse (=negate discrete logarithm)
 * @param {boolean} littleEndian digit swap
 */
function decode(indices, swap, invert, littleEndian) {
  assert.equal(indices.length % 2, 0);
  const out = [];
  for (let i = 0; i < indices.length; i += 2) {
    const key = swap
      ? 29 * indices[i+1] + indices[i]
      : 29 * indices[i] + indices[i+1];
    const exponent = logs.get(key);
    assert.notEqual(exponent, undefined, "Observed zero field element");
    const n = invert ? (840-exponent) % 840 : exponent;
    const a = Math.floor(n / 29), b = n % 29;
    out.push(...(littleEndian ? [b,a] : [a,b]));
  }
  return out;
}

/** @param {number[]} text GP29 paired plaintext without the pair [28,28]. */
function encode(text) {
  assert.equal(text.length % 2, 0);
  const out = [];
  for (let i = 0; i < text.length; i += 2) {
    const exponent = 29 * text[i] + text[i+1];
    assert(exponent < 840);
    out.push(...powers[exponent]);
  }
  return out;
}

// An actual solved-page rune inventory is a source-native fixed positive plant.
// It proves exact ciphertext->log and reverse encryption on 1680 symbols.
const seed = [...corpus.pages[56].indices, ...corpus.pages[57].indices];
assert.equal(seed.length, 180);
const plant = Array.from({length: 1680}, (_, i) => seed[i % seed.length]);
const encrypted = encode(plant);
assert.deepEqual(decode(encrypted, false, false, false), plant);
assert.deepEqual(encode(decode(chapter, false, false, false)), chapter);

const variants = [];
for (const swap of [false, true])
  for (const invert of [false, true])
    for (const littleEndian of [false, true]) {
      const plain = decode(chapter, swap, invert, littleEndian);
      const absent = plain.reduce((acc, val, j) =>
        acc + ((j % 2 === 0) && val === 28 && plain[j+1] === 28), 0);
      assert.equal(absent, 0);
      variants.push({
        swap, invert, littleEndian,
        fullChapterIoC: Number(ioc(plain).toFixed(9)),
        firstRuneIndices: plain.slice(0, 16)
      });
    }
assert.deepEqual(variants.map(x => x.fullChapterIoC),
  [0.034295499,0.034295499,0.034295499,0.034295499,
   0.034240194,0.034240194,0.034240194,0.034240194]);
console.log(JSON.stringify({
  originalPages: pages.map(p => p.page),
  originalRunes: chapter.length,
  fieldNonzeroCount: powers.length,
  observedZeroPairs: 0,
  observedDistinctPairs: new Set(Array.from({length:840}, (_,i) =>
    29 * chapter[2*i] + chapter[2*i+1])).size,
  originalIoC: Number(ioc(chapter).toFixed(9)),
  variants,
  positiveNativeSourceRunes: plant.length,
  positiveExactInverse: true,
  recoveredPlaintext: false,
  decision: "Direct source-primitive GF841 log-to-GP29 conversion fails to produce linguistic output on all 1680 original runes"
}, null, 2));
