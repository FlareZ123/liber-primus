"use strict";
/**
 * Original LP2 GP29 digraph substitution all-key gate.
 *
 * The p50 numerical artifact uses two-character tokens, making a pair-wise
 * symbol operation a natural candidate but not an authenticated instruction.
 * For any fixed bijection on all 29^2 GP digraphs, block identities and the
 * collision rate are EXACT invariants. This also applies if every physical
 * rune-bearing page uses an entirely independent 841-way secret bijection.
 *
 * This script assesses the original p0..p55 ciphertext and untouched native-
 * GP Shakespeare/Gibran reference windows, and constructs exact positive
 * encryption/decryption controls under hidden secret 841-entry permutations.
 *
 * Windows Node.js 22/CommonJS, no external packages, no file writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = corpus.pages.filter(p => p.status === "unsolved" && p.indices.length);
const lengths = pages.map(p => p.indices.length);
const original = pages.map(p => p.indices);
const M = 29, PAIRS = M * M;
assert.equal(original.length, 55);
assert.equal(original.flat().length, 12956);

const gp = corpus.translit.map((token, i) => ({ token, i }))
  .sort((a, b) => b.token.length - a.token.length);
/** @param {string} source */
function encode(source) {
  const out = [];
  for (let word of source.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/K/g, "C").replace(/Z/g, "S");
    for (let i = 0; i < word.length;) {
      const token = gp.find(x => word.startsWith(x.token, i));
      assert.ok(token, "GP source token: " + word.slice(i));
      out.push(token.i);
      i += token.token.length;
    }
  }
  return out;
}
/** @param {number[]} flat @returns {number[][]} */
function byPages(flat) {
  const out = [];
  let offset = 0;
  for (const length of lengths) {
    out.push(flat.slice(offset, offset + length));
    offset += length;
  }
  assert.equal(offset, 12956);
  return out;
}
/** 
 * @param {number[][]} book
 * @param {boolean} independentPageKeys
 */
function collision(book, independentPageKeys) {
  const bins = new Uint16Array(PAIRS);
  let observedPairs = 0, eligiblePairs = 0, equals = 0, observations = 0;
  for (const symbols of book) {
    if (independentPageKeys) bins.fill(0);
    for (let i = 0; i + 1 < symbols.length; i += 2) {
      bins[M * symbols[i] + symbols[i + 1]]++;
      observations++;
    }
    if (independentPageKeys) {
      let n = 0;
      for (const count of bins) {
        equals += count * (count - 1);
        n += count;
      }
      eligiblePairs += n * (n - 1);
    }
  }
  if (!independentPageKeys) {
    let n = 0;
    for (const count of bins) {
      equals += count * (count - 1);
      n += count;
    }
    eligiblePairs += n * (n - 1);
  }
  observedPairs = observations;
  return {
    digraphs: observedPairs,
    comparedOrderedPairs: eligiblePairs,
    exactEqualOrderedPairs: equals,
    collision: equals / eligiblePairs,
  };
}

let seed = 0x5cf28e;
/** @returns {number} */
function random() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
/** @returns {{forward:Uint16Array,inverse:Uint16Array}} */
function secretPermutation() {
  const shuffled = Array.from({ length: PAIRS }, (_, i) => i);
  for (let i = PAIRS - 1; i > 0; i--) {
    const j = random() % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const forward = Uint16Array.from(shuffled);
  const inverse = new Uint16Array(PAIRS);
  for (let i = 0; i < PAIRS; i++) inverse[forward[i]] = i;
  return {forward, inverse};
}
/** @param {number[][]} source */
function plant(source) {
  const encoded = source.map(s => s.slice());
  const transformed = [];
  let roundtripped = 0;
  for (const symbols of encoded) {
    const {forward, inverse} = secretPermutation();
    const dst = symbols.slice();
    for (let i = 0; i + 1 < symbols.length; i += 2) {
      const before = M * symbols[i] + symbols[i + 1];
      const after = forward[before];
      dst[i] = Math.floor(after / M);
      dst[i + 1] = after % M;
      assert.equal(inverse[M * dst[i] + dst[i + 1]], before);
      roundtripped += 2;
    }
    transformed.push(dst);
  }
  const plaintextRate = collision(encoded, true);
  const cipherRate = collision(transformed, true);
  assert.deepEqual(cipherRate, plaintextRate);
  return {roundtrippedRunes:roundtripped,
    unchangedOddPageTails:12956-roundtripped, exactInvariant:cipherRate.collision};
}
const originalInvariant = {
  oneSharedKey: collision(original, false),
  independentPageKeys: collision(original, true),
};
assert.deepEqual(originalInvariant.oneSharedKey, {
  digraphs: 6462, comparedOrderedPairs: 41750982,
  exactEqualOrderedPairs: 50962,
  collision: 50962 / 41750982
});
assert.deepEqual(originalInvariant.independentPageKeys, {
  digraphs:6462, comparedOrderedPairs:792550,
  exactEqualOrderedPairs:910,
  collision:910/792550
});
const controls = [
  ["Shakespeare", encode(read("resources/control/shakespeare_first300k.txt"))],
  ["Gibran", encode(read("resources/control/gibran_prophet_58585.txt"))],
].map(([name, english]) => {
  const records = [];
  for (let start = 0; start + 12956 <= english.length; start += 6400)
    records.push({
      sourceRuneOffset: start,
      oneSharedKey: collision(byPages(english.slice(start, start + 12956)),false).collision,
      independentPageKeys: collision(byPages(english.slice(start, start + 12956)),true).collision,
    });
  assert.ok(records.length >= 8);
  return {
    source: name, sourceRunes: english.length, windows: records.length,
    minGlobal: Math.min(...records.map(r => r.oneSharedKey)),
    maxGlobal: Math.max(...records.map(r => r.oneSharedKey)),
    minPage: Math.min(...records.map(r => r.independentPageKeys)),
    maxPage: Math.max(...records.map(r => r.independentPageKeys)),
    positive: plant(byPages(english.slice(0,12956))),
  };
});
assert.ok(controls.every(c =>
  c.minGlobal > originalInvariant.oneSharedKey.collision * 2.5 &&
  c.minPage > originalInvariant.independentPageKeys.collision * 2.5));
assert.ok(controls.every(c=>c.positive.roundtrippedRunes===12924));
console.log(JSON.stringify({
  interpretation: "Original LP2 is inconsistent with a stationary GP29 digraph permutation under these native-GP English controls, even if all 55 physical page keys are arbitrary and independent.",
  source: "Original LP2 p0..p55 GP29 rune sequence; 55 nonempty pages, 12956 runes",
  exactCipherFamily: "Each (P[2j],P[2j+1]) maps bijectively to (C[2j],C[2j+1]), page-reset clock and complete 841! secret alphabet, optionally distinct for every page",
  evidence: {
    original: originalInvariant,
    nativeSourceControls: controls,
    secretPermutationPositiveSeed: "0x5cf28e",
    note: "Controls are English-register calibration, not a language-independent mathematical impossibility. A running secret map, non-GP plaintext, changing block boundaries or precompression escapes this result.",
  },
  unknownPlaintextRecovered: false,
}, null, 2));
