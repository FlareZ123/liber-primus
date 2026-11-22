"use strict";

/**
 * Original LP2 all-secret previous-ciphertext-state and word-position gate.
 * For printed word w and position j>=1:
 *    C[w,j] = (C[w,j-1] + h_(j,C[w,j-1])(P[w,j])) mod29
 * where every h is an otherwise arbitrary SECRET deterministic GP29 map,
 * possibly nonbijective. The secret map may depend both on relative word
 * position j and previous ciphertext label, but not on word length or page.
 *
 * Data processing: H(D | j,Cprev) <= H(P | j,Cprev) <= H(P | j),
 * with D=(C-Cprev) mod29. Thus the original conditional entropy exceeding
 * source-native GP English H(P|j) rejects the entire specified family
 * without guessing any map. Exact printed word lengths and original runes.
 *
 * A complete reversible affine-family plant tests exact re-encryption and
 * preservation of this inequality; chapter/word-length state sensitivity
 * is reported as non-exclusion for the broader models.
 *
 * Run: node sims/lp2_predecessor_wordposition_entropy_sft.cjs
 * Windows 11 Node.js 22 CommonJS; no network or third-party dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");

const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8")
  .replace(/\r\n/g, "\n");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const idx = new Map(corpus.runes.map((r, i) => [r, i]));
const rx = new RegExp("[" + corpus.runes.join("") + "]+", "gu");
const text = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55).join("%")
  .replace(/\/\n/g, "").replace(/[\r\n%]/g, "");
const original = (text.match(rx) || []).map(w =>
  Array.from(w, r => {
    assert(idx.has(r));
    return idx.get(r);
  }));
assert.equal(original.length, 2896);
assert.equal(original.flat().length, 12956);
assert.deepEqual(original.flat(), corpus.pages
  .filter(page => page.page <= 55).flatMap(page => page.indices));

const chapterEnds = [729, 1874, 3603, 5506, 6527, 7960, 9640, 12648, 12956];
const chapters = [];
let globalPos = 0;
for (const word of original) {
  chapters.push(chapterEnds.findIndex(end => globalPos < end));
  globalPos += word.length;
}
assert.equal(globalPos, 12956);
assert(chapters.every(c => c >= 0));

const mod = x => ((x % 29) + 29) % 29;
const modes = ["position", "position-length", "position-chapter"];
const previous = (i, j, mode) => {
  const word = original[i];
  if (mode === "position") return String(j);
  if (mode === "position-length") return j + ":" + word.length;
  return j + ":" + chapters[i];
};

/**
 * Word-position/source-condition histogram. Each group holds 29 output
 * counters, with no smoothing. The previous-ciphertext label is added
 * to the original-cipher grouping only.
 * @param {number[][]} words
 * @param {string} mode
 * @param {boolean} ciphertext
 */
function conditionalH(words, mode, ciphertext) {
  const grouped = new Map();
  let countAll = 0, bits = 0;
  for (let i = 0; i < original.length; i++) {
    const word = words[i];
    assert.equal(word.length, original[i].length);
    for (let j = 1; j < word.length; j++) {
      const state = previous(i, j, mode);
      const key = ciphertext ? state + ":" + word[j - 1] : state;
      let h = grouped.get(key);
      if (!h) {
        h = new Uint16Array(29);
        grouped.set(key, h);
      }
      h[ciphertext ? mod(word[j] - word[j - 1]) : word[j]]++;
      countAll++;
    }
  }
  let counted = 0;
  for (const hist of grouped.values()) {
    let n = 0;
    for (const v of hist) n += v;
    counted += n;
    for (const v of hist) if (v) bits -= v * Math.log2(v / n);
  }
  assert.equal(counted, countAll);
  assert.equal(counted, 10060);
  return {bits: bits / counted, states: grouped.size};
}
const originalResult = Object.fromEntries(modes.map(mode =>
  [mode, conditionalH(original, mode, true)]));

/** @param {string} source */
function poolsFromSource(source) {
  const map = new Map();
  for (const w of source.toUpperCase().match(/[A-Z]+/g) || []) {
    const code = encodeSourceNativeGP(w);
    if (!map.has(code.length)) map.set(code.length, []);
    map.get(code.length).push(code);
  }
  for (const w of original)
    assert(map.get(w.length)?.length, "source missing word length " + w.length);
  return map;
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
function draw(pools, random) {
  return original.map(w => {
    const candidates = pools.get(w.length);
    return candidates[Math.floor(random() * candidates.length)];
  });
}

const inv = new Uint8Array(29);
for (let m = 1; m < 29; m++) {
  for (let k = 1; k < 29; k++) if ((m * k) % 29 === 1) inv[m] = k;
  assert(inv[m] > 0);
}

/**
 * Complete positive reversible cipher: distinct secret affine alphabet for
 * every observed (word-position, previous-ciphertext-symbol).
 * The missing first rune of the model is inverted separately per word.
 * @param {number[][]} plain
 */
function plant(plain) {
  let exactlyRecovered = 0;
  const encrypted = plain.map((w, i) => {
    const out = new Array(w.length);
    out[0] = mod(11 * w[0] + 5 * w.length + 3);
    assert.equal(mod(inv[11] * (out[0] - 5 * w.length - 3)), w[0]);
    exactlyRecovered++;
    for (let j = 1; j < w.length; j++) {
      const prev = out[j - 1];
      const multiplier = 1 + ((7 * j + 13 * prev) % 28);
      const shift = mod(11 * j + 3 * prev);
      out[j] = mod(prev + multiplier * w[j] + shift);
      const decoded = mod(inv[multiplier] * (out[j] - prev - shift));
      assert.equal(decoded, w[j]);
      exactlyRecovered++;
    }
    return out;
  });
  assert.equal(exactlyRecovered, 12956);
  const cipherH = conditionalH(encrypted, "position", true).bits;
  const plainH = conditionalH(plain, "position", false).bits;
  assert(cipherH <= plainH + 1e-11,
    "data processing with predecessor conditioning on a true invertible plant");
  return {plaintext: plainH, ciphertext: cipherH, recovered: exactlyRecovered};
}

const sources = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"]
];
const trials = 500, results = {};
for (let i = 0; i < sources.length; i++) {
  const [name, filename] = sources[i];
  const pools = poolsFromSource(read(filename));
  const random = xorshift32(0x33015635 + i);
  const sorted = Object.fromEntries(modes.map(mode => [mode, []]));
  for (let trial = 0; trial < trials; trial++) {
    const p = draw(pools, random);
    for (const mode of modes) {
      sorted[mode].push(conditionalH(p, mode, false).bits);
    }
  }
  const modeStats = {};
  for (const mode of modes) {
    const values = sorted[mode].sort((a, b) => a - b);
    modeStats[mode] = {
      original: originalResult[mode].bits,
      controlMin: values[0],
      controlMedian: values[Math.floor(trials / 2)],
      controlMax: values[trials - 1]
    };
  }
  assert(modeStats.position.original > modeStats.position.controlMax + 0.20,
    name + " key-independent predecessor+position exclusion");
  assert(modeStats["position-length"].original <
    modeStats["position-length"].controlMin,
    name + " the word-length conditioned extension is not excluded");
  assert(modeStats["position-chapter"].original <
    modeStats["position-chapter"].controlMin,
    name + " the visual-chapter extension is not excluded");

  const planted = plant(draw(pools, random));
  assert(planted.ciphertext < originalResult.position.bits - 0.20);
  results[name] = {strata: modeStats, positivePlant: planted};
}

console.log(JSON.stringify({
  verdict: "all-secret fixed word-position x previous-ciphertext map excluded under source-native English; broader clocks undecided",
  originalWords: original.length,
  originalRunes: 12956,
  withinWordSteps: 10060,
  originalConditionalEntropy: originalResult,
  trialsPerSource: trials,
  allPlantRunesRecovered: 12956,
  controls: results
}, null, 2));
