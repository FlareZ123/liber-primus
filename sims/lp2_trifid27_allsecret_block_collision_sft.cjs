"use strict";
/**
 * Every-secret-key original-LP2 collision obstruction for deterministic
 * fixed-period t=3 and t=5 block permutations on 27 GP runes with two
 * EXACT, unchanged literal bypass symbols. F=GP index 0; the other symbol
 * is enumerated over all 28 remaining rune indices.
 *
 * Theorem: for a fixed-key bijection B : A^t -> A^t and full aligned blocks,
 * B(x)=B(y) iff x=y. Therefore the pair-collision count
 *        sum_x n(x)*(n(x)-1)/2
 * is exactly invariant under EVERY secret 3x3x3 Trifid cube key, and even
 * under every (27^t)! secret full-block permutation.
 *
 * This only applies if the bypass mask is identical in original plaintext
 * and ciphertext. The known historical LP2 p56 plaintext-F bypass does not
 * guarantee that: its ciphertext F can arise from an encrypted non-F rune.
 * Hence this is a scoped conditional exclusion, not an LP2 solution.
 *
 * Source-native English controls preserve every printed rune and word/page
 * position of the ORIGINAL source, and preserve the exact original bypass
 * positions under each hypothesized bypass choice. Controls are generated
 * from two independent sourced literary registers. The "page-key" clock
 * uses only within-page collisions, allowing every physical page its OWN
 * arbitrary secret block key. Clocks are page, book, word, and page-key.
 *
 * Windows Node.js 22, CommonJS, built-ins only, read-only:
 * node sims/lp2_trifid27_allsecret_block_collision_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseSharedCorpus } = require("./lp2_word_pages.cjs");
const {trifid} = require("./lp2_trifid27_transparent2_sourceorder_sft.cjs");
const ROOT = path.resolve(__dirname, "..");
/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), "utf8");
}
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = corpus.pages.filter((p) => p.page < 56 && p.indices.length);
const whole = pages.flatMap((p) => p.indices);
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const words = parseSharedCorpus().words.map((entry) =>
  [...entry.runes].map((rune) => {
    const x = runeIndex.get(rune);
    assert.notEqual(x, undefined);
    return x;
  }));
assert.equal(whole.length, 12956);
assert.equal(pages.length, 55);
assert.equal(words.length, 2896);
assert.deepEqual(words.flat(), whole);

/** Source-native 29-rune English orthography, with original GP digraphs. 
 * @param {string} text @returns {number[]} */
function englishGP(text) {
  const map = new Map(corpus.translit.map((s, i) => [s, i]));
  const normalized = text.toUpperCase()
    .replace(/QU/g, "CW").replace(/[KQ]/g, "C")
    .replace(/V/g, "U").replace(/Z/g, "S")
    .replace(/[^A-Z]/g, " ");
  const result = [];
  for (const word of normalized.split(" ")) {
    for (let j = 0; j < word.length;) {
      const pair = map.get(word.slice(j, j + 2));
      if (pair !== undefined) {
        result.push(pair);
        j += 2;
      } else {
        const single = map.get(word[j]);
        assert.notEqual(single, undefined);
        result.push(single);
        j++;
      }
    }
  }
  return result;
}
const CONTROL_SOURCES = [
  {name: "Gibran", path: "resources/control/gibran_prophet_58585.txt"},
  {name: "Shakespeare", path: "resources/control/shakespeare_first300k.txt"}
];
const starts = [0, 2500, 5000, 10000, 20000];

/**
 * Collision count among fully aligned period-length blocks of 27-symbol
 * core stream. Per-part segmentation resets core clock.
 *
 * If perPart=true, collisions are counted separately within each part,
 * so each part can use an independent secret permutation.
 *
 * @param {number[][]} parts
 * @param {number} period
 * @param {number} other
 * @param {boolean} perPart
 * @returns {{pairs:number,fullBlocks:number}}
 */
function collisions(parts, period, other, perPart) {
  const counts = new Map();
  let pairs = 0, fullBlocks = 0;
  function finish() {
    for (const n of counts.values()) pairs += n * (n-1) / 2;
    counts.clear();
  }
  for (const part of parts) {
    if (perPart) finish();
    const core = part.filter((value) => value !== 0 && value !== other);
    for (let i = 0; i + period <= core.length; i += period) {
      let code = 0;
      for (let j = 0; j < period; j++) {
        code = code * 29 + core[i + j];
      }
      counts.set(code, (counts.get(code) || 0) + 1);
      fullBlocks++;
    }
  }
  finish();
  return {pairs, fullBlocks};
}
/** @param {number[]} values @param {number[][]} shape @returns {number[][]} */
function split(values, shape) {
  let start = 0;
  const pieces = shape.map((part) => {
    const piece = values.slice(start, start + part.length);
    start += part.length;
    return piece;
  });
  assert.equal(start, values.length);
  return pieces;
}
/**
 * Preserve every original bypass position while filling ALL other source
 * rune positions in order with native-language core symbols.
 * @param {number[]} english
 * @param {number} start
 * @param {number} other
 * @returns {number[]}
 */
function nativeWithOriginalMask(english, start, other) {
  const clean = english.slice(start).filter((x) => x !== 0 && x !== other);
  let consumed = 0;
  const result = whole.map((original) => {
    if (original === 0 || original === other) return original;
    assert.ok(consumed < clean.length);
    return clean[consumed++];
  });
  assert.equal(result.length, whole.length);
  return result;
}
/** @param {number[]} native @param {string} clock @returns {number[][]} */
function segments(native, clock) {
  if (clock === "book") return [native];
  if (clock === "words") return split(native, words);
  return split(native, pages.map((x) => x.indices));
}

/**
 * A genuine full-block Trifid keyed 3D-coordinate permutation plant.
 * A secret permutation is applied to the 27 core symbols before Trifid,
 * then inverted on ciphertext; exact bypass symbols remain unchanged.
 * @param {number[]} input
 * @param {number} other
 * @param {number} period
 * @returns {number[]}
 */
function keyedTrifidPlant(input, other, period) {
  const core = Array.from({length: 29}, (_, i) => i)
    .filter((i) => i !== 0 && i !== other);
  const perm = Array.from({length: 27}, (_, i) => i);
  // Fixed Fisher-Yates permutation, purely for a reproducible positive.
  let state = 0x33012727;
  for (let i = 26; i > 0; i--) {
    state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
    const j = (state >>> 0) % (i+1);
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  const encode = Array.from({length: 29}, (_, i) => i);
  const decode = Array.from({length: 29}, (_, i) => i);
  for (let i = 0; i < core.length; i++) {
    encode[core[i]] = core[perm[i]];
    decode[core[perm[i]]] = core[i];
  }
  const encodedInput = input.map((v) => encode[v]);
  const encodedOutput = trifid(encodedInput, other, period, [0,1,2], false);
  const output = encodedOutput.map((v) => decode[v]);
  // Trifid in a shuffled cube is still a permutation; exact ciphertext
  // and corresponding source native-language plant must roundtrip.
  const back = trifid(output.map((v) => encode[v]),
    other, period, [0,1,2], true).map((v) => decode[v]);
  assert.deepEqual(back, input);
  return output;
}
/** @returns {object} */
function main() {
  const registers = CONTROL_SOURCES.map((ref) => {
    const gp = englishGP(read(ref.path));
    assert.ok(gp.length > 20000, "Source too short for independent windows");
    return {name: ref.name, gp};
  });
  const periods = [3,5], clocks = ["book","pages","words","pageKeys"];
  const results = [];
  let positiveCount = 0;
  for (const period of periods) {
    for (const clock of clocks) {
      const perPart = clock === "pageKeys";
      const originalParts = clock === "book" ? [whole] :
        clock === "words" ? words : pages.map((p) => p.indices);
      let originalMin = Infinity, originalMax = -Infinity;
      let nativeMin = Infinity, nativeMax = -Infinity;
      let worstNativeMinusOriginal = Infinity;
      let passMasks = 0;
      let near = null;
      const controlsByRegister = {};
      for (const register of registers) {
        controlsByRegister[register.name] = {min: Infinity, max: -Infinity};
      }
      for (let other = 1; other < 29; other++) {
        const original = collisions(originalParts, period, other, perPart);
        originalMin = Math.min(originalMin, original.pairs);
        originalMax = Math.max(originalMax, original.pairs);
        let ownNativeMin = Infinity;
        for (const register of registers) {
          for (const start of starts) {
            const native = nativeWithOriginalMask(register.gp, start, other);
            const parts = segments(native, clock);
            const n = collisions(parts, period, other, perPart);
            assert.equal(n.fullBlocks, original.fullBlocks);
            const range = controlsByRegister[register.name];
            range.min = Math.min(range.min, n.pairs);
            range.max = Math.max(range.max, n.pairs);
            ownNativeMin = Math.min(ownNativeMin, n.pairs);
            nativeMin = Math.min(nativeMin, n.pairs);
            nativeMax = Math.max(nativeMax, n.pairs);
            const margin = n.pairs - original.pairs;
            if (margin < worstNativeMinusOriginal) {
              worstNativeMinusOriginal = margin;
              near = {other, register: register.name,
                start, original: original.pairs, native: n.pairs};
            }
          }
        }
        if (original.pairs >= ownNativeMin) passMasks++;
      }
      assert.equal(passMasks, 0, "Original must fail all source-native masks");
      assert.ok(worstNativeMinusOriginal > 0);
      // Positive hidden-key experiment at one representative other-bypass.
      // Each page receives exactly one shared secret mapping; for pageKeys
      // they may differ, but using the same map is a permitted special case.
      const hiddenNative = nativeWithOriginalMask(registers[0].gp, 0, 9);
      const hiddenParts = segments(hiddenNative, clock);
      const ciphertextPlant = hiddenParts.map((part) =>
        keyedTrifidPlant(part, 9, period));
      const before = collisions(hiddenParts, period, 9, perPart);
      const after = collisions(ciphertextPlant, period, 9, perPart);
      assert.deepEqual(after, before, "Secret-key invariant must hold");
      positiveCount++;
      results.push({
        period, clock, secondBypassChoices: 28,
        originalPairs: [originalMin, originalMax],
        nativePairs: [nativeMin, nativeMax],
        nativeRanges: controlsByRegister,
        sourceNativeMasksPassing: passMasks,
        smallestMargin: worstNativeMinusOriginal,
        tightestCase: near
      });
    }
  }
  assert.equal(positiveCount, 8);
  return {
    classification: "Key-independent conditional obstruction for ALL stationary length-3/5 full-block GP27 bijections, including all keyed Trifid cubes",
    source: {runes: whole.length, pages: pages.length, words: words.length,
      exactOriginalBypassMasks: 28,
      nativeRegisters: registers.map(({name,gp})=>({name, GP:gp.length})),
      nativeOffsetStarts: starts},
    proof: "A deterministic full-block bijection is injective; identical plaintext aligned blocks are exactly the identical ciphertext aligned blocks. Pooled or within-page pair-collision counts are therefore invariant for any secret block substitution, for each specified core reset clock.",
    allSecretKeyNativeObstructions: results,
    nativeHiddenKeyPositiveControls: positiveCount,
    limitation: "Requires 27 core symbols, two exact literal bypasses F+other (including ciphertext), fixed block key within comparison scope, untouched word/page boundaries and original-like GP English register. Does not exclude dynamically changing keys, period>=6, non-English intermediate codes, the authentic plaintext-F ambiguity, modified segmentation or other ciphers."
  };
}
if (require.main === module) console.log(JSON.stringify(main(), null, 2));
module.exports = {main, collisions, nativeWithOriginalMask, keyedTrifidPlant};
