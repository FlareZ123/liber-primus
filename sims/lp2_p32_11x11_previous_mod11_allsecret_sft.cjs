"use strict";

/**
 * LP2 p32 11x11 source-shaped, all-secret previous-ciphertext feedback gate.
 * Run with Node.js 22: node sims/lp2_p32_11x11_previous_mod11_allsecret_sft.cjs
 *
 * The GP29 alphabet value is the zero-based original runic index.
 * The 11x11 shape is inferred from the 121 original p32 runes; it is not an
 * author-declared cipher. All 121 secret state alphabets may be independent.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(ROOT, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
const N = pages.reduce((n, p) => n + p.indices.length, 0);
const STATES = 121;
assert.equal(N, 12956);
assert.equal(pages.length, 55);
assert.equal(corpus.pages.find(p => p.page === 32).indices.length, STATES);
const pageStarts = new Set();
let running = 0;
for (const page of pages) {
  pageStarts.add(running);
  running += page.indices.length;
}
assert.equal(running, N);
const ciphertext = pages.flatMap(p => p.indices);

/** @param {number[]} histogram @returns {number} */
function entropy(histogram) {
  const n = histogram.reduce((a, b) => a + b, 0);
  let h = 0;
  for (const count of histogram) if (count) {
    const x = count / n;
    h -= x * Math.log2(x);
  }
  return h;
}

/**
 * A public state is (time mod11, previous ciphertext rune mod11).
 * The full alphabet conditional entropy is invariant under arbitrary
 * secret bijective 29-rune alphabets for each of the 121 states.
 * @param {number[][]} cipherPages
 * @param {"page"|"global"} clock
 */
function conditional(cipherPages, clock) {
  const rows = Array.from({length: STATES}, () => Array(29).fill(0));
  let absolute = 0, transitions = 0;
  for (const page of cipherPages) {
    for (let j = 1; j < page.length; j++) {
      const phase = ((clock === "page" ? j : absolute + j) % 11);
      const state = 11 * phase + page[j - 1] % 11;
      rows[state][page[j]]++;
      transitions++;
    }
    absolute += page.length;
  }
  const conditioned = rows.reduce((sum, hist) => {
    const size = hist.reduce((a, b) => a + b, 0);
    return sum + size / transitions * entropy(hist);
  }, 0);
  return {bitsPerRune: conditioned, transitions,
    occupiedStates: rows.filter(h => h.some(Boolean)).length};
}

const pageClock = conditional(pages.map(p => p.indices), "page");
const globalClock = conditional(pages.map(p => p.indices), "global");
assert.equal(pageClock.transitions, 12901);
assert.equal(globalClock.transitions, 12901);
assert.equal(pageClock.occupiedStates, 121);
assert.equal(globalClock.occupiedStates, 121);
assert.ok(Math.abs(pageClock.bitsPerRune - 4.62707585899637) < 1e-10);
assert.ok(Math.abs(globalClock.bitsPerRune - 4.644484706739438) < 1e-10);

/**
 * Historical rune spelling control:
 *  - ᛝ is one symbol for the English ending ING and for NG;
 *  - ᛡ is one symbol for IO (rendered "IA" by the corpus transliteration).
 * The spelling choice affects the source-control sample distribution,
 * not the key-independent conditional-entropy identity.
 */
const tokens = corpus.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {string} prose @returns {number[]} */
function encodeNative(prose) {
  const upper = prose.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S")
    .replace(/ING/g, "NG").replace(/IO/g, "IA");
  const output = [];
  for (const word of upper.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      const token = tokens.find(t => word.startsWith(t.s, i));
      assert.ok(token, "unknown source spelling token");
      output.push(token.i);
      i += token.s.length;
    }
  }
  return output;
}
function destinationEntropy(stream, start) {
  const counts = Array(29).fill(0);
  for (let i = 1; i < N; i++) {
    if (!pageStarts.has(i)) counts[stream[start + i]]++;
  }
  return entropy(counts);
}
const controls = [];
const sourceControls = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"]
];
let plantPlain = null;
for (const [name, filename] of sourceControls) {
  const encoded = encodeNative(read(filename));
  const entropies = [];
  for (let at = 0; at + N <= encoded.length; at += Math.floor(N / 2)) {
    const window = encoded.slice(at, at + N);
    if (!plantPlain) plantPlain = window;
    entropies.push(destinationEntropy(window, 0));
  }
  assert.ok(entropies.length);
  controls.push({name, windows: entropies.length,
    maxBits: Math.max(...entropies), minBits: Math.min(...entropies)});
}
assert.deepEqual(controls.map(x => x.windows), [32, 8, 48]);
const maximumNative = Math.max(...controls.map(x => x.maxBits));
assert.ok(maximumNative > 4.30 && maximumNative < 4.31);
assert.ok(pageClock.bitsPerRune > maximumNative);
assert.ok(globalClock.bitsPerRune > maximumNative);

// A fully arbitrary 121-row secret alphabet can be cipher-feedback keyed
// and still losslessly recover every original-length native source rune.
let seed = 0x33013211;
/** @returns {number} */
function rand() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed;
}
const perms = Array.from({length: STATES}, () => {
  const letters = Array.from({length: 29}, (_, i) => i);
  for (let i = 28; i > 0; i--) {
    const j = rand() % (i + 1);
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  return letters;
});
const inverses = perms.map(perm => {
  const inverse = Array(29);
  perm.forEach((value, i) => { inverse[value] = i; });
  return inverse;
});
/** @param {"page"|"global"} clock */
function plantedCipher(clock) {
  let absolute = 0, source = 0;
  const out = [], recovered = [], sourcePages = [];
  const jointRows = Array.from({length: STATES}, () => Array(29).fill(0));
  for (const original of pages) {
    const page = [];
    let prev = 0;
    for (let j = 0; j < original.indices.length; j++) {
      const phase = ((clock === "page" ? j : absolute + j) % 11);
      const state = phase * 11 + prev % 11;
      const plain = plantPlain[source++];
      const c = perms[state][plain];
      const p = inverses[state][c];
      assert.equal(p, plain);
      if (j > 0) jointRows[state][plain]++;
      prev = c;
      page.push(c);
      out.push(c);
      recovered.push(p);
    }
    sourcePages.push(page);
    absolute += original.indices.length;
  }
  assert.equal(source, N);
  assert.deepEqual(recovered, plantPlain);
  const cipherConditional = conditional(sourcePages, clock).bitsPerRune;
  let nativeConditional = 0;
  for (const hist of jointRows) {
    const count = hist.reduce((a, b) => a + b, 0);
    if (count) nativeConditional += count / 12901 * entropy(hist);
  }
  assert.ok(Math.abs(cipherConditional - nativeConditional) < 1e-12);
  assert.ok(cipherConditional < destinationEntropy(plantPlain, 0));
  return {roundtrip: recovered.length, cipherConditional,
    nativeConditional, nativeMarginal: destinationEntropy(plantPlain, 0)};
}
const positive = {page: plantedCipher("page"), global: plantedCipher("global")};

// Distinct, fixed source-key subclass, without optimizing any unknown key.
const printed = corpus.pages.find(p => p.page === 32).indices;
function indexCoincidence(values) {
  const bins = Array(29).fill(0);
  for (const value of values) bins[value]++;
  return bins.reduce((s, n) => s + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}
const sourceKeyReadings = [];
for (const clock of ["page", "global"]) {
  for (const transpose of [false, true]) {
    for (const sign of [1, -1]) {
      let absolute = 0;
      const decoded = [];
      for (const page of pages) {
        for (let j = 0; j < page.indices.length; j++) {
          const phase = (clock === "page" ? j : absolute + j) % 11;
          const previous = j ? page.indices[j - 1] : 0;
          const rank = previous % 11;
          const sourcePosition = transpose ? 11 * rank + phase : 11 * phase + rank;
          decoded.push((page.indices[j] - sign * printed[sourcePosition] + 29) % 29);
        }
        absolute += page.indices.length;
      }
      sourceKeyReadings.push({clock, transpose, sign,
        ioc: indexCoincidence(decoded)});
    }
  }
}
assert.equal(sourceKeyReadings.length, 8);
assert.ok(sourceKeyReadings.every(r => r.ioc > 0.0344 && r.ioc < 0.0346));

console.log(JSON.stringify({
  input: {pages: pages.length, runes: N, p32RuneCount: STATES,
    withinPageTransitions: pageClock.transitions},
  model: "121 arbitrary GP29 alphabet permutations keyed by phase mod11 and previous C mod11",
  original: {pageClock, globalClock, originalIoC: indexCoincidence(ciphertext)},
  historicalSpellingMatchedControl: {controls, maximumNative},
  exactEnglishRegisterGaps: {
    pageClock: pageClock.bitsPerRune - maximumNative,
    globalClock: globalClock.bitsPerRune - maximumNative
  },
  allSecretPositive: positive,
  printedP32SourceKey: sourceKeyReadings,
  conclusion: "Native GP English is impossible in this all-secret model for the sampled source register; no original LP2 plaintext or cipher identified."
}, null, 2));
