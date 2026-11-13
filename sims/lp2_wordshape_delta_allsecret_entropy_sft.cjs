"use strict";

/**
 * Source-native key-independent entropy gate on the cumulative DIFFERENCE
 * stream, with one independent secret GP29 bijection per originally visible
 * (word-start physical page, current glyph physical page, word length,
 * relative rune position) state.
 *
 * Model for each printed word w:
 *   C[w,0] = g_startPage,length(P[w,0])
 *   (C[w,j] - C[w,j-1]) mod29 = h_state(P[w,j]), j>=1
 *
 * The h_state can be an arbitrary hidden 29! permutation for each state.
 * It preserves conditional entropy H(D | state) exactly; no keys need
 * guessing. This is distinct from a nonfeedback fixed word-shape S-box gate.
 *
 * Exact original 12,956-rune input and positive invertible cipher plants.
 * Deterministic 500 control draws per independent source corpus.
 * Run: node sims/lp2_wordshape_delta_allsecret_entropy_sft.cjs
 * Windows 11 / Node.js 22 / CommonJS, no third-party modules, no writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");

const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8")
  .replace(/\r\n/g, "\n");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const glyphMap = new Map(gp.runes.map((r, i) => [r, i]));
const rx = new RegExp("[" + gp.runes.join("") + "]+", "gu");
const joined = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55).join("%")
  .replace(/\/\n/g, "").replace(/[\r\n%]/g, "");
const originalWords = (joined.match(rx) || []).map(word =>
  Array.from(word, symbol => {
    assert(glyphMap.has(symbol));
    return glyphMap.get(symbol);
  }));
assert.equal(originalWords.length, 2896);
assert.equal(originalWords.flat().length, 12956);

const originalPages = gp.pages.filter(p => p.page <= 55);
const pageAtRune = new Uint8Array(12956);
let offset = 0;
for (const page of originalPages) {
  pageAtRune.fill(page.page, offset, offset + page.indices.length);
  offset += page.indices.length;
}
assert.equal(offset, 12956);
assert.deepEqual(originalWords.flat(), originalPages.flatMap(p => p.indices));

const mod = x => ((x % 29) + 29) % 29;

/**
 * Frozen original layout. Key depends on both the start page AND the
 * physical page containing the currently consumed glyph. This subsumes
 * either independent selector alone, including actual crossed-page words.
 */
const specs = [];
const stateIndices = new Map();
const states = [];
offset = 0;
for (const original of originalWords) {
  const startPage = pageAtRune[offset];
  const positions = [];
  for (let j = 1; j < original.length; j++) {
    const currentPage = pageAtRune[offset + j];
    const stateKey = startPage + ":" + currentPage + ":" + original.length + ":" + j;
    let state = stateIndices.get(stateKey);
    if (state === undefined) {
      state = states.length;
      stateIndices.set(stateKey, state);
      states.push({startPage, currentPage, length: original.length, j});
    }
    positions.push(state);
  }
  specs.push(positions);
  offset += original.length;
}
assert.equal(offset, 12956);
const N = specs.reduce((n, a) => n + a.length, 0);
assert.equal(N, 10060);

/** @param {Uint16Array[]} hist */
function entropy(hist) {
  let total = 0, countAll = 0;
  for (const h of hist) {
    let count = 0;
    for (const n of h) count += n;
    if (!count) continue;
    countAll += count;
    for (const n of h) if (n) total -= n * Math.log2(n / count);
  }
  assert.equal(countAll, N);
  return total / countAll;
}

/** @returns {Uint16Array[]} */
function emptyHist() {
  return states.map(() => new Uint16Array(29));
}

/**
 * @param {number[][]} words
 * @param {boolean} useDelta Whether to compute GP29 differences (cipher)
 *                            or raw plaintext symbols.
 */
function conditionalH(words, useDelta) {
  assert.equal(words.length, originalWords.length);
  const counts = emptyHist();
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    assert.equal(w.length, originalWords[i].length);
    for (let k = 1; k < w.length; k++) {
      const state = specs[i][k - 1];
      const v = useDelta ? mod(w[k] - w[k - 1]) : w[k];
      counts[state][v]++;
    }
  }
  return entropy(counts);
}

const originalH = conditionalH(originalWords, true);

/** @param {string} source */
function nativeWordPools(source) {
  const byLength = new Map();
  for (const word of source.toUpperCase().match(/[A-Z]+/g) || []) {
    const values = encodeSourceNativeGP(word);
    if (!byLength.has(values.length)) byLength.set(values.length, []);
    byLength.get(values.length).push(values);
  }
  for (const original of originalWords) {
    assert(byLength.get(original.length)?.length,
      "missing native source words of original length " + original.length);
  }
  return byLength;
}

/** @param {number} seed */
function xorshift32(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
}

/** @param {Map<number,number[][]>} pools @param {()=>number} random */
function drawWords(pools, random) {
  return originalWords.map(original => {
    const choices = pools.get(original.length);
    return choices[Math.floor(random() * choices.length)];
  });
}

/**
 * Reversible planted cipher with a distinct source-layout-derived affine
 * bijection for each state; the key is known only for the positive control.
 * @param {number[][]} plain
 * @returns {number[][]}
 */
function plant(plain) {
  let recovered = 0, start = 0;
  const encrypted = plain.map((word, i) => {
    const page = pageAtRune[start];
    const out = new Array(word.length);
    out[0] = mod(11 * word[0] + 5 * page + 3 * word.length + 2);
    assert.equal(word[0], mod(8 * (out[0] - 5 * page - 3 * word.length - 2)));
    recovered++;
    for (let j = 1; j < word.length; j++) {
      const s = states[specs[i][j - 1]];
      const shift = mod(3 * s.startPage + 5 * s.currentPage +
        7 * s.length + 11 * s.j);
      const transition = mod(17 * word[j] + shift);
      out[j] = mod(out[j - 1] + transition);
      const decoded = mod(12 * (out[j] - out[j - 1] - shift));
      assert.equal(decoded, word[j]);
      recovered++;
    }
    start += word.length;
    return out;
  });
  assert.equal(start, 12956);
  assert.equal(recovered, 12956);
  const firstH = conditionalH(plain, false);
  const secondH = conditionalH(encrypted, true);
  assert(Math.abs(firstH - secondH) < 1e-12,
    "all-secret fixed-state permutation preserves conditional entropy exactly");
  return encrypted;
}

const sources = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"]
];
const trials = 500, results = {};
for (let i = 0; i < sources.length; i++) {
  const [name, filename] = sources[i];
  const pools = nativeWordPools(read(filename));
  const random = xorshift32(0x33015635 + i);
  const samples = new Array(trials);
  for (let trial = 0; trial < trials; trial++) {
    samples[trial] = conditionalH(drawWords(pools, random), false);
  }
  samples.sort((a, b) => a - b);
  assert(originalH > samples[trials - 1] + 0.18,
    name + ": original exceeds all secret-alphabet English controls");
  const plantedPlain = drawWords(pools, random);
  const encrypted = plant(plantedPlain);
  const plantH = conditionalH(encrypted, true);
  assert(plantH < originalH - 0.18);
  results[name] = {
    controlMin: samples[0],
    controlMedian: samples[Math.floor(trials / 2)],
    controlMax: samples[trials - 1],
    plantedCipherEntropy: plantH,
    exactPlantRecovered: 12956
  };
}

console.log(JSON.stringify({
  result: "conditional finite-native-English exclusion; no plaintext/key",
  originalWords: originalWords.length,
  originalRunes: 12956,
  withinWordDifferences: N,
  independentSecretAlphabetStates: states.length,
  originalConditionalEntropyBitsPerRune: originalH,
  trialsPerCorpus: trials,
  controls: results
}, null, 2));
