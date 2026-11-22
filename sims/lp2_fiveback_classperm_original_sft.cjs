"use strict";
/**
 * All-secret five-back ciphertext-conditioned GP29 substitution gate.
 *
 * Hypothesis within each printed source word:
 *   C[j] = IV[j]                          when j < 5 (unrestricted seed);
 *   C[j] = sigma[class(C[j-5], j, len)](P[j]) when j >= 5,
 * where every sigma is an arbitrary, secret 29-symbol bijection shared
 * across the manuscript. Four independent class specifications are tested:
 * predecessor only, predecessor+word length, predecessor+position mod5,
 * and all three. Every secret alphabet and initial five-rune vector is
 * allowed. Equality collisions within a class survive any such bijection.
 *
 * Human source motivations: original p7 five red words, manuscript
 * within-word lag-five echo, original p57 word-circumference instruction.
 * These clues do not authenticate this proposed algorithm.
 *
 * Source: exact original GP29 ciphertext and complete words, 3 independent
 * source-native English GP29 word pools with original word-length shapes.
 *
 * Run from the repository: node sims/lp2_fiveback_classperm_original_sft.cjs
 * Node 22+, Windows 11, CommonJS, read-only, deterministic.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");

const ROOT = path.resolve(__dirname, "..");
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(ROOT, name), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const glyph = new Map(gp.runes.map((g, i) => [g, i]));
const re = new RegExp("[" + gp.runes.join("") + "]+", "gu");
const input = read("resources/lp2-transcription.txt")
  .split("%").slice(0, 55).join("%")
  .replace(/\/\r?\n/g, "").replace(/[\r\n%]/g, "");
const words = (input.match(re) || [])
  .map(w => [...w].map(g => glyph.get(g)));
const book = gp.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(words.length, 2896);
assert.equal(book.length, 12956);
assert.deepEqual(words.flat(), book);
const lengths = words.map(w => w.length);
assert.equal(Math.max(...lengths), 14);

let seed = 0x33015131;
/** @returns {number} A deterministic number in [0,1). */
function random() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
}
/** @returns {number[]} */
function permutation() {
  const a = Array.from({length:29}, (_, i) => i);
  for (let i = 28; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
/**
 * @param {number} prev
 * @param {number} position
 * @param {number} length
 * @param {"pred"|"length"|"phase"|"both"} mode
 * @returns {number}
 */
function state(prev, position, length, mode) {
  assert(prev >= 0 && prev < 29);
  if (mode === "pred") return prev;
  if (mode === "length") return 29 * length + prev;
  if (mode === "phase") return 29 * (position % 5) + prev;
  assert.equal(mode, "both");
  return 29 * (5 * length + position % 5) + prev;
}
/**
 * @param {number[][]} ciphertext
 * @param {"pred"|"length"|"phase"|"both"} mode
 * @param {number[][] | null} plaintext Plaintext uses the same
 * ciphertext-predecessor state labels as the paired cipher.
 * @returns {{n:number,groups:number,pairs:number,hits:number,rate:number}}
 */
function collisions(ciphertext, mode, plaintext = null) {
  const bins = new Map();
  let n = 0;
  for (let wi = 0; wi < ciphertext.length; wi++) {
    const c = ciphertext[wi];
    const p = plaintext ? plaintext[wi] : c;
    assert.equal(c.length, p.length);
    for (let j = 5; j < c.length; j++) {
      const key = state(c[j - 5], j, c.length, mode);
      let hist = bins.get(key);
      if (!hist) {
        hist = new Uint32Array(29);
        bins.set(key, hist);
      }
      hist[p[j]]++;
      n++;
    }
  }
  let pairs = 0;
  let hits = 0;
  for (const hist of bins.values()) {
    let count = 0;
    for (const k of hist) {
      count += k;
      hits += k * (k - 1) / 2;
    }
    pairs += count * (count - 1) / 2;
  }
  return {n, groups:bins.size, pairs, hits, rate:hits/pairs};
}
/**
 * @param {number[][]} plaintext
 * @param {"pred"|"length"|"phase"|"both"} mode
 * @returns {{ciphertext:number[][],recovered:number[][]}}
 */
function encryptPlant(plaintext, mode) {
  const maps = new Map();
  const inv = new Map();
  const ivs = [];
  const ciphertext = plaintext.map(p => {
    const c = [];
    const iv = [];
    for (let j = 0; j < p.length; j++) {
      if (j < 5) {
        const k = Math.floor(random() * 29);
        iv.push(k);
        c.push((p[j] + k) % 29);
      } else {
        const key = state(c[j-5], j, p.length, mode);
        if (!maps.has(key)) {
          const m = permutation();
          const inverse = Array(29);
          m.forEach((symbol, i) => { inverse[symbol] = i; });
          maps.set(key, m);
          inv.set(key, inverse);
        }
        c.push(maps.get(key)[p[j]]);
      }
    }
    ivs.push(iv);
    return c;
  });
  const recovered = ciphertext.map((c, wi) => {
    const p = [];
    for (let j = 0; j < c.length; j++) {
      if (j < 5) p.push((c[j] - ivs[wi][j] + 29) % 29);
      else p.push(inv.get(state(c[j-5], j, c.length, mode))[c[j]]);
    }
    return p;
  });
  return {ciphertext, recovered};
}
/** @param {string} filename @returns {number[][][]} */
function wordBuckets(filename) {
  const buckets = Array.from({length:15},()=>[]);
  for (const word of read(filename).match(/[A-Za-z]+/g) || []) {
    const encoded = encodeSourceNativeGP(word);
    if (encoded.length <= 14) buckets[encoded.length].push(encoded);
  }
  for (const n of lengths) assert(buckets[n].length > 0,
    "missing GP word length " + n + " in " + filename);
  return buckets;
}
/** @param {number[][][]} buckets @returns {number[][]} */
function drawBook(buckets) {
  return lengths.map(n => {
    const arr = buckets[n];
    return arr[Math.floor(random() * arr.length)];
  });
}

const modes = ["pred", "length", "phase", "both"];
const observed = Object.fromEntries(modes.map(m => [m, collisions(words, m)]));
assert(modes.every(m => observed[m].n === 2105));
const sources = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"]
];
const report = {model:"C[j]=secret_permutation[state(C[j-5],position,length)](P[j])",
  originalRunes:book.length, originalWords:words.length, eligible:2105,
  seed:"0x33015131", drawsPerSourcePerMode:200, results:[]};
for (const mode of modes) {
  const item = {mode, original:observed[mode], nativeControls:[]};
  for (const [name, filename] of sources) {
    const buckets = wordBuckets(filename);
    const values = [];
    let minPairs = Infinity;
    let maxPairs = 0;
    for (let trial = 0; trial < 200; trial++) {
      const plain = drawBook(buckets);
      const plant = encryptPlant(plain, mode);
      if (trial === 0) {
        assert.deepEqual(plant.recovered, plain,
          "synthetic source-native inverse and replay " + mode);
        const pStat = collisions(plant.ciphertext, mode, plain);
        const cStat = collisions(plant.ciphertext, mode);
        assert.equal(pStat.pairs, cStat.pairs);
        assert.equal(pStat.hits, cStat.hits,
          "all-secret within-class collision invariant");
      }
      const s = collisions(plant.ciphertext, mode);
      minPairs = Math.min(minPairs, s.pairs);
      maxPairs = Math.max(maxPairs, s.pairs);
      values.push(s.rate);
    }
    values.sort((a, b) => a-b);
    item.nativeControls.push({name, draws:values.length,
      min:values[0], median:values[100], max:values.at(-1),
      atOrBelowObserved:values.filter(v=>v <= item.original.rate).length,
      minPairs, maxPairs});
  }
  report.results.push(item);
}
console.log(JSON.stringify(report, null, 2));
console.log("PASS: original input, positive inverse and source-native calibrations.");
