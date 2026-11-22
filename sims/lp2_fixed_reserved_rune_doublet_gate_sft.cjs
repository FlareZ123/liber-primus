"use strict";

/**
 * LP2 original-input test: does C[i] === C[i-1] indicate a fixed
 * plaintext GP rune R, even under arbitrary secret nonzero-step bijections?
 * Native-English register is source-calibrated for ING and IO.
 *
 * Run: node sims/lp2_fixed_reserved_rune_doublet_gate_sft.cjs
 * Node.js 22, CommonJS, no third-party dependencies, no file writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");
const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = gp.pages.filter(p => p.page <= 55 && p.indices.length);
const original = pages.flatMap(p => p.indices);
assert.equal(original.length, 12956);
const text = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55).join("%")
  .replace(/\/\r?\n/g, "").replace(/[\r\n%]/g, "");
const pattern = new RegExp("[" + gp.runes.join("") + "]+", "gu");
const glyphToIndex = new Map(gp.runes.map((g, i) => [g, i]));
const words = (text.match(pattern) || []).map(w =>
  Array.from(w, g => glyphToIndex.get(g)));
assert.equal(words.length, 2896);
assert.deepEqual(words.flat(), original);
const pageAt = new Uint8Array(original.length);
let offset = 0;
for (const page of pages) {
  pageAt.fill(page.page, offset, offset + page.indices.length);
  offset += page.indices.length;
}
const slots = [];
offset = 0;
for (let wi = 0; wi < words.length; wi++) {
  for (let j = 0; j < words[wi].length; j++) {
    const g = offset + j;
    if (g > 0 && pageAt[g] === pageAt[g - 1]) {
      slots.push({g, wi, j, kind:j === 0 ? 0 : 1});
    }
  }
  offset += words[wi].length;
}
assert.equal(slots.length, 12901);
assert.equal(slots.filter(s => s.kind === 0).length, 2873);
const observed = [0, 0];
for (const s of slots) {
  if (original[s.g] === original[s.g - 1]) observed[s.kind]++;
}
assert.deepEqual(observed, [23, 63]);

/** @param {number} initial */
function xorshift32(initial) {
  let state = initial >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}
const random = xorshift32(0x33015635);

/** @param {string} raw */
function wordPools(raw) {
  const pools = new Map();
  for (const latin of raw.toUpperCase().match(/[A-Z]+/g) || []) {
    const w = encodeSourceNativeGP(latin);
    if (!pools.has(w.length)) pools.set(w.length, []);
    pools.get(w.length).push(w);
  }
  return pools;
}

/** @param {Map<number, number[][]>} pools */
function draw(pools) {
  return words.map(w => {
    const choices = pools.get(w.length);
    assert(choices?.length, "missing native-GP word length " + w.length);
    return choices[Math.floor(random() * choices.length)];
  });
}

/** @param {number[][]} plain */
function counts(plain) {
  const out = Array.from({length:29}, () => [0, 0]);
  for (const s of slots) out[plain[s.wi][s.j]][s.kind]++;
  return out;
}

/**
 * Positive plant: one special rune R creates the zero ciphertext step,
 * while all other 28 symbols get a position-varying invertible 28-way
 * nonzero step. This demonstrates exactly what the invariant would detect,
 * including all page resets. A plant is not evidence of the real cipher.
 * @param {number[]} plain
 * @param {number} reserved
 */
function plantAndInvert(plain, reserved) {
  const cipher = new Array(plain.length);
  const recovered = new Array(plain.length);
  for (let i = 0; i < plain.length; i++) {
    if (i === 0 || pageAt[i] !== pageAt[i-1]) {
      cipher[i] = plain[i];
      recovered[i] = cipher[i];
      continue;
    }
    const shift = (3 * pageAt[i] + 7 * i) % 28;
    const rank = plain[i] < reserved ? plain[i] : plain[i] - 1;
    const delta = plain[i] === reserved ? 0 : 1 + (11 * rank + shift) % 28;
    cipher[i] = (cipher[i-1] + delta) % 29;
    const difference = (cipher[i] - cipher[i-1] + 29) % 29;
    if (difference === 0) recovered[i] = reserved;
    else {
      const code = (difference - 1 - shift + 56) % 28;
      const unshifted = (23 * code) % 28; // 11^-1 mod 28
      recovered[i] = unshifted < reserved ? unshifted : unshifted + 1;
    }
  }
  assert.deepEqual(recovered, plain);
  const zeros = [0, 0], expected = [0, 0];
  for (const s of slots) {
    if (cipher[s.g] === cipher[s.g-1]) zeros[s.kind]++;
    if (plain[s.g] === reserved) expected[s.kind]++;
  }
  assert.deepEqual(zeros, expected);
  return {runesRecovered: recovered.length, zeroStepByPosition:zeros};
}
const corpora = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"]
];
const trials = 300;
const result = [];
for (const [name, file] of corpora) {
  const pools = wordPools(read(file));
  const observations = Array.from({length:29}, () => [[], []]);
  let plant = null;
  for (let t = 0; t < trials; t++) {
    const plainWords = draw(pools);
    if (t === 0) plant = plantAndInvert(plainWords.flat(), 0);
    const sample = counts(plainWords);
    for (let r = 0; r < 29; r++) {
      observations[r][0].push(sample[r][0]);
      observations[r][1].push(sample[r][1]);
    }
  }
  const avg = arr => arr.reduce((s, n) => s+n, 0) / arr.length;
  const deviations = observations.map(([start, inner], index) => {
    const ms = avg(start), mi = avg(inner);
    const sd = (arr, mean) => Math.sqrt(avg(arr.map(x => (x-mean)**2)));
    const zs = (observed[0]-ms) / sd(start, ms);
    const zi = (observed[1]-mi) / sd(inner, mi);
    return {rune:gp.translit[index], index, zStart:zs, zInner:zi,
      startMean:ms, innerMean:mi,
      startRange:[Math.min(...start), Math.max(...start)],
      innerRange:[Math.min(...inner), Math.max(...inner)]};
  });
  const nearest = deviations.slice().sort((a,b) =>
    Math.max(Math.abs(a.zStart),Math.abs(a.zInner)) -
    Math.max(Math.abs(b.zStart),Math.abs(b.zInner)))[0];
  const withinTwoSigma = deviations.filter(x =>
    Math.abs(x.zStart) <= 2 && Math.abs(x.zInner) <= 2);
  assert.equal(withinTwoSigma.length, 0, name+" fixed-rune reject");
  result.push({name, trials, observed, reservedF:deviations[0],
    bestOtherCandidate:nearest, withinTwoSigma:withinTwoSigma.length,
    positiveControl:plant});
}
console.log(JSON.stringify({
  classification:"finite source-native-English exclusion only; no plaintext",
  pages:pages.length, words:words.length, runes:original.length,
  transitions:slots.length, observedDoublets:observed, result
}, null, 2));
