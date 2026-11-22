"use strict";
/**
 * Source-selected 16-floral-page common additive-pad necessary-invariant test.
 *
 * In one cipher model, every physical page p40..55 (p50 is runeless) reuses
 * the same page-local GP29 additive key K[i], plus an arbitrary secret
 * per-page Caesar offset. At aligned positions differences cancel K; the
 * highest count among all 29 residues of a page pair is invariant to both
 * keys and arbitrary whole-page offsets. We give every pair its independently
 * best offset, which is MORE generous than jointly consistent page offsets.
 *
 * Execute from repository root: node sims/lp2_floral_sharedpad_invariant_sft.cjs
 * Read-only. Node.js 22 built-ins only. Source input is the canonical GP29
 * physical-page corpus, and three checked-in plain-language text controls.
 * No source indicates this is the actual historical cipher. This is a
 * bounded, conditional falsification of one source-motivated architecture.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const load = relative => fs.readFileSync(path.join(ROOT, relative), "utf8");
const corpus = JSON.parse(load("resources/liber-primus/lp2-corpus.json"));
const pages = corpus.pages.filter(page =>
  page.page >= 40 && page.page <= 55 && page.indices.length > 0);
assert.deepEqual(pages.map(p => p.page),
  [40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 51, 52, 53, 54, 55]);
assert.equal(pages.length, 15);
assert.equal(new Set(pages.map(p => p.page)).size, 15);
assert.equal(corpus.pages[50].indices.length, 0);
const gp = new Map(corpus.translit.map((symbol, i) => [symbol, i]));
/** @param {string} text @returns {number[]} */
function toGP(text) {
  const out = [];
  for (let word of text.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/K/g, "C").replace(/Z/g, "S");
    for (let i = 0; i < word.length;) {
      const pair = word.slice(i, i + 2);
      if (gp.has(pair)) {
        out.push(gp.get(pair));
        i += 2;
      } else if (gp.has(word[i])) {
        out.push(gp.get(word[i]));
        i += 1;
      } else {
        i += 1;
      }
    }
  }
  return out;
}
/**
 * @param {number[][]} streams
 * @returns {{pairs:number,aligned:number,equalities:number,bestOffsetMatches:number,zeroRate:number,bestRate:number}}
 */
function agreement(streams) {
  let aligned = 0, equalities = 0, bestOffsetMatches = 0, pairs = 0;
  for (let i = 0; i < streams.length; i++) {
    for (let j = i + 1; j < streams.length; j++) {
      const a = streams[i], b = streams[j];
      const length = Math.min(a.length, b.length);
      const counts = new Uint16Array(29);
      for (let k = 0; k < length; k++) {
        assert.ok(a[k] >= 0 && a[k] < 29 && b[k] >= 0 && b[k] < 29);
        counts[(a[k] - b[k] + 29) % 29]++;
      }
      aligned += length;
      equalities += counts[0];
      bestOffsetMatches += Math.max(...counts);
      pairs++;
    }
  }
  return {
    pairs, aligned, equalities, bestOffsetMatches,
    zeroRate: equalities / aligned,
    bestRate: bestOffsetMatches / aligned
  };
}
/** @param {number} seed @returns {() => number} */
function prng(seed) {
  let state = seed;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}
/**
 * Independently draw one native-GP window of the exact original length for
 * each of the fifteen source pages. No original runes select native samples.
 * @param {number[]} native
 * @param {() => number} next
 * @returns {number[][]}
 */
function sample(native, next) {
  return pages.map(p => {
    const offset = Math.floor(next() * (native.length - p.indices.length));
    return native.slice(offset, offset + p.indices.length);
  });
}
/** @param {number[]} symbols @param {number} pageIndex */
function encryptPlant(symbols, pageIndex) {
  return symbols.map((v, i) => (v + (13 * i * i + 17 * i + 5) % 29 +
    (pageIndex * 13 + 3) % 29) % 29);
}
/** @param {number[]} symbols @param {number} pageIndex */
function decryptPlant(symbols, pageIndex) {
  return symbols.map((v, i) => ((v - (13 * i * i + 17 * i + 5) % 29 -
    (pageIndex * 13 + 3) % 29) % 29 + 29) % 29);
}
function main() {
  const original = agreement(pages.map(p => p.indices));
  assert.equal(original.pairs, 105);
  assert.equal(original.aligned, 19079);
  assert.equal(original.equalities, 684);
  assert.equal(original.bestOffsetMatches, 1232);
  const authors = [
    ["Shakespeare", "resources/control/shakespeare_first300k.txt", 9876513],
    ["Gibran", "resources/control/gibran_prophet_58585.txt", 12345678],
    ["Emerson", "resources/control/emerson_essays_2944.txt", 98765432]
  ];
  const controls = [];
  for (const [author, source, seed] of authors) {
    const native = toGP(load(source));
    assert.ok(native.length > 15000);
    const next = prng(seed);
    let zeroMin = Infinity, zeroSum = 0, maxMin = Infinity, maxSum = 0;
    const trials = 2000;
    for (let t = 0; t < trials; t++) {
      const v = agreement(sample(native, next));
      assert.equal(v.aligned, original.aligned);
      zeroMin = Math.min(zeroMin, v.zeroRate);
      maxMin = Math.min(maxMin, v.bestRate);
      zeroSum += v.zeroRate;
      maxSum += v.bestRate;
    }
    assert.ok(zeroMin > original.zeroRate,
      author + ": original source zero-shift matches unexpectedly high");
    assert.ok(maxMin > original.bestRate,
      author + ": original source best-shift matches unexpectedly high");
    controls.push({
      author, source, nativeSymbols: native.length, trials, seed,
      zeroMean: zeroSum / trials, zeroMinimum: zeroMin,
      bestMean: maxSum / trials, bestMinimum: maxMin,
      lowerTailUpperBound: 1 / (trials + 1)
    });
  }
  // Native GP29 source positive control, with a common hidden additive pad
  // and separate arbitrary Caesar offsets. All ciphertexts are reversible.
  const native = toGP(load(authors[0][1]));
  const plaintext = pages.map((p, i) => native.slice(205000 + 700 * i,
    205000 + 700 * i + p.indices.length));
  const ciphertext = plaintext.map((p, i) => encryptPlant(p, i));
  ciphertext.forEach((symbols, i) =>
    assert.deepEqual(decryptPlant(symbols, i), plaintext[i]));
  const plantPlain = agreement(plaintext);
  const plantCipher = agreement(ciphertext);
  assert.equal(plantCipher.bestOffsetMatches, plantPlain.bestOffsetMatches);
  assert.equal(plantCipher.aligned, plantPlain.aligned);
  assert.ok(plantPlain.bestRate > original.bestRate);
  return {
    scope: "physical pp40-55: fifteen nonempty original rune pages",
    model: "common page-position GP29 additive pad; arbitrary page Caesar offsets",
    source: "exact original-pixel identical floral border on all 16 pages",
    original, controls,
    positivePlant: {
      symbols: plaintext.reduce((n, a) => n + a.length, 0),
      perPageOffsetAndPadReversedExactly: true,
      sourceGPBestRate: plantPlain.bestRate,
      encryptedGPBestRate: plantCipher.bestRate
    },
    decision: "Bounded common page-aligned additive pad negative for native-GP English-like plaintext. No recovered unknown plaintext or cipher key.",
    caveat: "Does not exclude nonadditive feedback, non-GP plaintext, independent pads, within-page position shifts, transpositions, or additional unknown cipher layers."
  };
}
if (require.main === module) console.log(JSON.stringify(main(), null, 2));
module.exports = {toGP, agreement, sample, encryptPlant, decryptPlant, main};
