"use strict";

/**
 * LP2 original-input lag-five all-secret power-feedback gate.
 * Any family C[i] = C[i-1] + k[i]*(P[i]-P[i-5]^e) (mod 29),
 * k[i] != 0, has the key-free necessary equality
 * C[i] === C[i-1] iff P[i] === P[i-5]^e for same-word sites j >= 5.
 *
 * The genuine 2013 DH cubing and the p8 XIX inverse-cube give e=3,19.
 * All e=1..28 are included as a search-penalized exploratory comparison.
 * Original page joins, source word shapes and page-local sites are fixed.
 * Native-English Monte Carlo conditions on *each* original word length.
 * No original plaintext or historical unknown-page key is recovered.
 *
 * Node22 Windows CommonJS SFT:
 * node sims/lp2_lag5_power_feedback_allsecret_original_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");

const root = path.resolve(__dirname, "..");
/** @param {string} relative */
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = gp.pages.filter(p => p.page <= 55 && p.indices.length);
const original = pages.flatMap(p => p.indices);
const glyphs = new Map(gp.runes.map((r, i) => [r, i]));
const runic = new RegExp("[" + gp.runes.join("") + "]+", "gu");
const printed = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55).join("")
  .replace(/\/\r?\n/g, "").replace(/[\r\n%]/g, "");
const words = (printed.match(runic) || [])
  .map(w => Array.from(w, c => glyphs.get(c)));
assert.equal(original.length, 12956);
assert.equal(words.length, 2896);
assert.deepEqual(words.flat(), original);
const pageAt = new Uint8Array(original.length);
let offset = 0;
for (const p of pages) {
  pageAt.fill(p.page, offset, offset + p.indices.length);
  offset += p.indices.length;
}
const pow = Array.from({length: 29}, (_, n) => {
  const powers = Array(29).fill(1);
  for (let e = 1; e <= 28; e++) powers[e] = powers[e-1] * n % 29;
  return powers;
});
const slots = [];
offset = 0;
for (const w of words) {
  const eligible = [];
  for (let j = 5; j < w.length; j++) {
    if (pageAt[offset+j] === pageAt[offset+j-5])
      eligible.push({j, floral: pageAt[offset+j] >= 40 && pageAt[offset+j] <= 53});
  }
  slots.push(eligible);
  offset += w.length;
}
const eligible = slots.reduce((s, x) => s+x.length, 0);
const floralEligible = slots.reduce((s, x) => s+x.filter(t => t.floral).length, 0);
const observed = [0, 0];
for (let i = 0; i < words.length; i++)
  for (const site of slots[i]) {
    if (words[i][site.j] !== words[i][site.j-1]) continue;
    observed[0]++;
    if (site.floral) observed[1]++;
  }
assert.equal(eligible, 2073);
assert.equal(observed[0], 15);

/** @param {number} x */
const mod = x => ((x % 29) + 29) % 29;
/** @param {number} x */
const inv = x => {
  for (let y = 1; y < 29; y++) if (x*y%29 === 1) return y;
  throw Error("bad nonzero scalar " + x);
};

/**
 * Full native planted encrypt/decrypt of a reversible, nonperiodic keyed
 * fifth-back cipher. The output equality invariant survives every key.
 * @param {number[][]} native
 * @param {number} exponent
 */
function plant(native, exponent) {
  let checked = 0, markerMatches = 0;
  for (let wi = 0; wi < native.length; wi++) {
    const plain = native[wi], cipher = [], decoded = [];
    for (let j = 0; j < plain.length; j++) {
      if (j < 5) {
        cipher.push(plain[j]);
        decoded.push(cipher[j]);
      } else {
        const k = 1 + (7*wi + 11*j) % 28;
        cipher.push(mod(cipher[j-1] + k *
          (plain[j] - pow[plain[j-5]][exponent])));
        decoded.push(mod(pow[decoded[j-5]][exponent] +
          mod(cipher[j] - cipher[j-1]) * inv(k)));
      }
    }
    assert.deepEqual(decoded, plain);
    for (const {j} of slots[wi]) {
      assert.equal(cipher[j] === cipher[j-1],
        plain[j] === pow[plain[j-5]][exponent]);
      markerMatches++;
    }
    checked += plain.length;
  }
  assert.equal(checked, original.length);
  assert.equal(markerMatches, eligible);
  return {recovered: checked, checkedSites: markerMatches};
}

/** @param {number} seed */
function rng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/** @param {number[][]} selection */
function score(selection) {
  const whole = Array(29).fill(0), floral = Array(29).fill(0);
  for (let wi = 0; wi < selection.length; wi++) {
    const w = selection[wi];
    for (const {j, floral: isFloral} of slots[wi]) {
      const powers = pow[w[j-5]], actual = w[j];
      for (let e = 1; e <= 28; e++) {
        if (powers[e] !== actual) continue;
        whole[e]++;
        if (isFloral) floral[e]++;
      }
    }
  }
  return [whole, floral];
}
const controlFiles = [
  "resources/control/shakespeare_first300k.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt"
];
const trials = 300;
const results = [];
for (let src = 0; src < controlFiles.length; src++) {
  const pools = new Map();
  for (const latin of read(controlFiles[src]).toUpperCase().match(/[A-Z]+/g) || []) {
    const w = encodeSourceNativeGP(latin);
    if (!pools.has(w.length)) pools.set(w.length, []);
    pools.get(w.length).push(w);
  }
  assert(words.every(w => pools.has(w.length)));
  const random = rng(0x33015700 + src + 2);
  const samples = Array.from({length: 2},
    () => Array.from({length: 29}, () => []));
  let planted = null;
  for (let t = 0; t < trials; t++) {
    const selection = words.map(w => {
      const pool = pools.get(w.length);
      return pool[Math.floor(random() * pool.length)];
    });
    if (t === 0) planted = plant(selection, 19);
    const counts = score(selection);
    for (let kind = 0; kind < 2; kind++)
      for (let e = 1; e <= 28; e++) samples[kind][e].push(counts[kind][e]);
  }
  /** @param {number[]} arr */
  const mean = arr => arr.reduce((s, n) => s+n, 0) / arr.length;
  const estimates = Array.from({length: 28}, (_, n) => {
    const e = n + 1;
    const scopes = samples.map((type, kind) => {
      const arr = type[e], mu = mean(arr);
      const sd = Math.sqrt(mean(arr.map(x => (x-mu)**2)));
      return {observed: observed[kind], mean: +mu.toFixed(3),
        sd: +sd.toFixed(3), z: +((observed[kind]-mu)/sd).toFixed(3),
        min: Math.min(...arr), max: Math.max(...arr)};
    });
    return {e, full: scopes[0], floral: scopes[1]};
  });
  const ranked = estimates.slice().sort((a, b) =>
    Math.abs(a.full.z) - Math.abs(b.full.z));
  results.push({source: controlFiles[src], trials, planted,
    selected: estimates.filter(x => x.e === 3 || x.e === 19),
    exploratoryClosest: ranked.slice(0, 5),
    withinTwoSD: estimates.filter(x => Math.abs(x.full.z) <= 2).map(x => x.e)});
}
console.log(JSON.stringify({
  scope: "All-secret finite lag-five power-map count gate, not historical cipher identification",
  original: {runes: original.length, words: words.length,
    eligible, floralEligible, zeroSteps: observed[0],
    floralZeroSteps: observed[1]},
  keyFreeIdentity: "CeqPrev iff PeqPow(P5,e), any secret nonzero per-site key",
  historicalSelectedExponents: [3,19],
  results,
  caveat: "Count-level native-English exclusion only; e=21 is post-selected and has no creator-supplied key, opcode or plaintext."
}, null, 2));
