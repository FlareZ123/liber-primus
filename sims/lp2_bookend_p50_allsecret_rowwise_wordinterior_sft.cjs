"use strict";
/**
 * Source-original, key-independent word-interior capacity theorem for
 * EVERY independent secret 29! substitution S[clock,K] on C.
 *
 * The source state uses the printed p50 first radix60 digit and any
 * subset of its second-digit parity splits (all 32 subsets enumerated).
 * Original pair inputs are the p7 GF81 bookend or literal 81x81 crop.
 *
 * SFT: node sims/lp2_bookend_p50_allsecret_rowwise_wordinterior_sft.cjs
 * Windows 11 / Node.js 22 / CommonJS / read-only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { encodeSourceNativeGP } =
  require("./lp2_native_gp_source_orthography_sft.cjs");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8")
  .replace(/\r\n/g, "\n");
const source = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const p50 = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const all = source.pages.filter(p => p.page <= 55)
  .flatMap(p => p.indices || []);
assert.equal(all.length, 12956);
assert.equal(p50.bytes.length, 256);
const A = all.slice(0, 6561), C = all.slice(6561);
assert.deepEqual([A.length, C.length], [6561, 6395]);
assert.deepEqual(A.slice(-6), C.slice(-6));

/**
 * Parse complete authentic printed words, joining original page and
 * line carries before deciding first-rune positions.
 */
const joined = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55).join("")
  .replace(/\/\n/g, "").replace(/\n/g, "");
const wordRegex = new RegExp("[" + source.runes.join("") + "]+", "gu");
const words = (joined.match(wordRegex) || [])
  .map(w => Array.from(w, ch => source.runes.indexOf(ch)));
assert.equal(words.length, 2896);
assert.deepEqual(words.flat(), all);
let offset = 0;
const first = new Uint8Array(all.length);
for (const w of words) {
  first[offset] = 1;
  offset += w.length;
}
assert.equal(offset, 12956);
const nonInitial = Array.from(first.slice(6561), v => 1 - v);
assert.equal(nonInitial.reduce((s, v) => s + v, 0), 4963);
assert.equal(first.slice(6561).reduce((s, v) => s + v, 0), 1432);

const holes = new Set([2244, 2384, 2476, 2575, 2672]);
const slots = Array.from({ length: 6400 }, (_, i) => i)
  .filter(i => !holes.has(i));
assert.equal(slots.length, 6395);
/** Multiply by (x+1) in GF(3^4) mod x^4+x^2+x+1. */
function mulGF81(x) {
  const d = [0, 0, 0, 0, 0];
  for (let i = 0; i < 4; i++) {
    const digit = x % 3;
    x = Math.floor(x / 3);
    d[i] += digit;
    d[i + 1] += digit;
  }
  const high = d[4] % 3;
  for (let i = 0; i < 3; i++) d[i] -= high;
  return d.slice(0, 4).reduce((s, v, i) =>
    s + ((v % 3 + 3) % 3) * 3 ** i, 0);
}
const powers = [1];
while (powers.length < 80) powers.push(mulGF81(powers.at(-1)));
assert.equal(new Set(powers).size, 80);
assert.equal(mulGF81(powers[79]), 1);
const sources = {
  field: slots.map(i =>
    A[81 * powers[Math.floor(i / 80)] + powers[i % 80]]),
  crop: slots.map(i =>
    A[81 * (Math.floor(i / 80) + 1) + i % 80 + 1])
};
const bytes = C.map((_, i) => p50.bytes[(6560 + i) % 256]);
const firstDigits = bytes.map(v => Math.floor(v / 60));
assert.ok(firstDigits.every(x => x >= 0 && x < 5));

/**
 * 5 mandatory first-digit states plus one extra independently split
 * parity state for every high-digit bit set in mask 0..31.
 * @param {number} mask
 * @returns {number[]} Exact source state id for every B rune.
 */
function clockFor(mask) {
  const base = [];
  let totalStates = 0;
  for (let d = 0; d < 5; d++) {
    base[d] = totalStates;
    totalStates += 1 + ((mask >> d) & 1);
  }
  const clock = bytes.map((v, i) => base[firstDigits[i]] +
    (((mask >> firstDigits[i]) & 1) ? v % 2 : 0));
  assert.equal(Math.max(...clock) + 1, totalStates);
  return clock;
}

/**
 * Exact maximum count of ONE arbitrary plaintext GP rune among the
 * non-word-initial positions, for all independent 29! bijections
 * S_(z,K): C->P. Each (z,K) row may map precisely one ciphertext
 * value to the chosen plaintext label. The best count in that row is
 * its highest observed original C frequency, restricted to noninitial
 * printed word positions. Thus sum(max_C n[z,K,C,noninitial]) is an
 * absolute key-independent maximum, not a statistical estimate.
 *
 * @param {number[]} K Source A partner for each original B rune
 * @param {number[]} ciphertext Original or planted B ciphertext
 * @param {number[]} state p50 source state at each B position
 * @returns {number}
 */
function nonInitialCapacity(K, ciphertext, state) {
  assert.equal(K.length, 6395);
  assert.equal(ciphertext.length, 6395);
  assert.equal(state.length, 6395);
  const count = Array.from({ length: (Math.max(...state) + 1) * 29 },
    () => new Uint16Array(29));
  for (let i = 0; i < ciphertext.length; i++)
    if (nonInitial[i]) count[state[i] * 29 + K[i]][ciphertext[i]]++;
  return count.reduce((s, row) => s + Math.max(...row), 0);
}

/** Pinned 32-mask exhaustive original-input capacities, no text priors. */
const masks = Array.from({ length: 32 }, (_, mask) => {
  const state = clockFor(mask);
  return {
    mask,
    states: Math.max(...state) + 1,
    split: Array.from({ length: 5 }, (_, d) => d)
      .filter(d => (mask >> d) & 1),
    cap: Object.fromEntries(Object.entries(sources).map(([name, K]) =>
      [name, nonInitialCapacity(K, C, state)]))
  };
});
assert.deepEqual([masks[0].cap, masks[7].cap, masks[15].cap,
  masks[23].cap, masks[31].cap], [
  { field: 552, crop: 556 },
  { field: 661, crop: 697 },
  { field: 699, crop: 734 },
  { field: 689, crop: 721 },
  { field: 727, crop: 758 }
]);

// Source-native GP29 word banks; each sampled plaintext retains the
// exact printed 2896 word lengths and the original B word-initial flags.
const corpora = {
  Gibran: "resources/control/gibran_prophet_58585.txt",
  Shakespeare: "resources/control/shakespeare_first300k.txt"
};
const bank = {};
for (const [name, file] of Object.entries(corpora)) {
  const wordsInBook = read(file).toUpperCase().match(/[A-Z]+/g) || [];
  const candidates = Array.from({ length: 15 }, () => []);
  for (const word of wordsInBook) {
    const encoded = encodeSourceNativeGP(word);
    if (encoded.length >= 1 && encoded.length <= 14)
      candidates[encoded.length].push(encoded);
  }
  assert.ok(words.every(w => candidates[w.length].length > 0));
  bank[name] = candidates;
}

/** @param {number} seed @returns {() => number} */
function seededRandom(seed) {
  let current = seed >>> 0;
  return () => {
    current ^= current << 13;
    current ^= current >>> 17;
    current ^= current << 5;
    return (current >>> 0) / 4294967296;
  };
}
/**
 * @param {number[][][]} candidates
 * @param {() => number} random
 * @returns {number[]} Complete original-word-shape GP29 donor
 */
function makeControl(candidates, random) {
  const sample = words.flatMap(w => {
    const options = candidates[w.length];
    return options[Math.floor(random() * options.length)];
  });
  assert.equal(sample.length, all.length);
  return sample.slice(6561);
}
/**
 * @param {number[]} decoded
 * @returns {number[]} Non-word-initial rune count for EVERY GP29 label.
 */
function innerCounts(decoded) {
  assert.equal(decoded.length, C.length);
  const counts = Array(29).fill(0);
  for (let i = 0; i < decoded.length; i++)
    if (nonInitial[i]) counts[decoded[i]]++;
  return counts;
}
const trialsPerBook = 128;
const controls = {};
let nativePlant = null;
for (const [author, book] of Object.keys(corpora).entries()) {
  const rand = seededRandom((0x50330181 + author * 0x1000333) >>> 0);
  const countsByTrial = [];
  for (let trial = 0; trial < trialsPerBook; trial++) {
    const donor = makeControl(bank[book], rand);
    if (author === 0 && trial === 0) nativePlant = donor;
    countsByTrial.push(innerCounts(donor));
  }
  controls[book] = countsByTrial;
}
assert.equal(nativePlant.length, 6395);

const findings = masks.map(mask => {
  const native = {};
  for (const [sourceName, cap] of Object.entries(mask.cap)) {
    const comparison = {};
    for (const [book, control] of Object.entries(controls)) {
      const eCounts = control.map(c => c[18]);
      comparison[book] = {
        n: trialsPerBook,
        excludeE: eCounts.filter(v => v > cap).length,
        excludeAnyGP: control.filter(c => Math.max(...c) > cap).length,
        sourceNativeEInsideRange: [Math.min(...eCounts), Math.max(...eCounts)]
      };
    }
    native[sourceName] = comparison;
  }
  return { ...mask, native };
});

// Test all valid secret rowwise alphabets on positive source-native
// plaintext, including 8/10-state models both source K alignments.
for (const mask of [7, 31]) {
  const state = clockFor(mask);
  const states = Math.max(...state) + 1;
  for (const [sourceName, K] of Object.entries(sources)) {
    const random = seededRandom(0x1f3e5033 + mask);
    const tables = Array.from({ length: states * 29 }, () => {
      const permutation = Array.from({ length: 29 }, (_, j) => j);
      for (let j = 28; j > 0; j--) {
        const n = Math.floor(random() * (j + 1));
        [permutation[n], permutation[j]] = [permutation[j], permutation[n]];
      }
      return permutation;
    });
    const cipherPlant = nativePlant.map((v, i) =>
      tables[state[i] * 29 + K[i]][v]);
    const reversePlant = cipherPlant.map((v, i) =>
      tables[state[i] * 29 + K[i]].indexOf(v));
    assert.deepEqual(reversePlant, nativePlant);
    const cap = nonInitialCapacity(K, cipherPlant, state);
    const trueMax = Math.max(...innerCounts(nativePlant));
    assert.ok(trueMax <= cap,
      "Genuine nonlinear secret-row plant must survive its own cap");
    assert.ok(innerCounts(nativePlant)[18] <= cap);
  }
}
assert.ok(findings.some(f => f.mask === 7 && (
  f.native.field.Gibran.excludeE > 0 ||
  f.native.crop.Shakespeare.excludeE > 0)));
console.log(JSON.stringify({
  status: "PASS",
  original: {
    runes: all.length, sourceA: A.length, sourceB: C.length,
    originalPrintedWords: words.length, BNonInitialRuneSites: 4963,
    BFirstRuneSites: 1432, p50Cells: p50.bytes.length, BClockPositions: bytes.length
  },
  theorem: "For EVERY secret rowwise GP29 alphabet S_(p50state,K), one plaintext rune's count at non-word-initial positions is <= sum over source states/K rows of max original ciphertext category count in that row at those positions.",
  masksExamined: masks.length,
  controlsPerCorpus: trialsPerBook,
  representativeMasks: findings.filter(x => [0, 7, 15, 23, 31]
    .includes(x.mask)),
  completeMasks: findings.map(f => ({
    mask: f.mask, states: f.states, split: f.split, cap: f.cap,
    rejectsAny: {
      field: Object.fromEntries(Object.entries(f.native.field)
        .map(([book, v]) => [book, v.excludeAnyGP])),
      crop: Object.fromEntries(Object.entries(f.native.crop)
        .map(([book, v]) => [book, v.excludeAnyGP]))
    }
  })),
  positiveNativeAlphabetPlants: 4,
  caveat: "The source pairing and p50 clock are interpretative. This exact row-permutation bound does not constrain arbitrary full 841! pair mixers, positional secret keys, resegmented source words or non-native-GP plaintext."
}, null, 2));
