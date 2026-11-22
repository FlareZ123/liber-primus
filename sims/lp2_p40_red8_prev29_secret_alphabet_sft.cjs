"use strict";
/**
 * Exact source-input SFT: node sims/lp2_p40_red8_prev29_secret_alphabet_sft.cjs
 * LP2 p40–53 red8/375×8 decoder, previous-ciphertext GP29 row and eight
 * column states. Any fixed 29-way bijection per state preserves within-state
 * equalities. This excludes a much larger family than a selected printed key.
 *
 * Run on Node.js 22, CommonJS, no dependencies or persistent writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const gp = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const table = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-grid-256.json"), "utf8"));
const gibran = fs.readFileSync(path.join(root,
  "resources/control/gibran_prophet_58585.txt"), "utf8");
const shakespeare = fs.readFileSync(path.join(root,
  "resources/control/shakespeare_first300k.txt"), "utf8");
const N = 29;
const RED = [0, 9, 19, 26, 6, 23, 25, 8];
const order = RED.map((value, i) => ({value, i}))
  .sort((a, b) => a.value - b.value).map(({i}) => i);
assert.deepEqual(order, [0, 4, 7, 1, 2, 5, 6, 3]);
assert.equal(table.bytes.length, 256);
assert.equal(table.shape, "32 rows by 8 columns across LP2 pages 49, 50, 51");
const raw = gp.pages.filter(p => p.page >= 40 && p.page <= 53)
  .flatMap(p => p.indices);
assert.deepEqual(raw.slice(0, 8), RED);
assert.equal(raw.length, 3008);
const body = raw.slice(8);
const cipher = new Uint8Array(3000);
for (let b = 0; b < 8; b++) {
  for (let row = 0; row < 375; row++) {
    cipher[8 * row + order[b]] = body[375 * b + row];
  }
}
const original = gp.pages.filter(p => p.page <= 55)
  .reduce((sum, p) => sum + p.indices.length, 0);
assert.equal(original, 12956);
/**
 * State g_i=(i mod 8, C_(i−1)), previous cipher initialized to final red
 * heading rune 8. The observed original C determines every group BEFORE
 * an unknown plaintext key/permutation is chosen.
 * @param {ArrayLike<number>} ciphertext
 * @returns {Int16Array}
 */
function states(ciphertext) {
  const group = new Int16Array(ciphertext.length);
  let previous = RED[7];
  for (let i = 0; i < ciphertext.length; i++) {
    group[i] = 29 * (i % 8) + previous;
    previous = ciphertext[i];
  }
  return group;
}
/**
 * Number of symbol-equal unordered pairs WITHIN the same observed group.
 * Every independently chosen 29-way state permutation preserves this.
 * @param {ArrayLike<number>} symbols
 * @param {ArrayLike<number>} groups
 */
function equality(symbols, groups) {
  const counts = Array.from({length: 232}, () => new Int32Array(29));
  const lengths = new Int32Array(232);
  for (let i = 0; i < symbols.length; i++) {
    const g = groups[i], c = symbols[i];
    assert.ok(g >= 0 && g < 232 && c >= 0 && c < N);
    lengths[g]++;
    counts[g][c]++;
  }
  let matches = 0, eligible = 0;
  for (let g = 0; g < 232; g++) {
    eligible += lengths[g] * (lengths[g] - 1) / 2;
    for (let c = 0; c < 29; c++) {
      matches += counts[g][c] * (counts[g][c] - 1) / 2;
    }
  }
  return {matches, eligible, rate: matches / eligible,
    groupsUsed: Array.from(lengths).filter(n => n !== 0).length,
    minGroup: Math.min(...lengths), maxGroup: Math.max(...lengths)};
}
const sourceGroup = states(cipher);
const source = equality(cipher, sourceGroup);
assert.deepEqual(source, {
  matches: 663, eligible: 19213, rate: 663 / 19213,
  groupsUsed: 232, minGroup: 4, maxGroup: 23
});
const alphabet = new Map(gp.translit.map((token, i) => [token, i]));
const multis = ["NG", "TH", "EO", "OE", "IA", "EA", "AE"];
/**
 * Native historical GP spellings from raw English controls; non-rune chars
 * are delimiters, not guessed manuscript text.
 * @param {string} text
 */
function normalize(text) {
  const s = text.toUpperCase().replace(/QU/g, "CW").replace(/ING/g, "NG")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const result = [];
  for (let i = 0; i < s.length;) {
    const code = s.charCodeAt(i);
    if (code < 65 || code > 90) {i++; continue;}
    const token = multis.find(x => s.startsWith(x, i));
    if (token) {
      result.push(alphabet.get(token));
      i += token.length;
    } else {
      if (alphabet.has(s[i])) result.push(alphabet.get(s[i]));
      i++;
    }
  }
  return result;
}
const corpora = [normalize(gibran), normalize(shakespeare)];
assert.equal(corpora[0].length, 62696);
assert.ok(corpora[1].length > 200000);
let seed = 0x3301d1f4;
/** @returns {number} seeded unbiased-for-purpose deterministic LCG sample. */
function random() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
}
/**
 * A completely arbitrary additive shift is a valid secret permutation
 * in each of 232 observed states. Its output state uses previous emitted
 * C_i, so no unknown plaintext is needed to identify the state at decode.
 * @param {number[]} plaintext
 * @param {Int8Array} key
 */
function encryptShift(plaintext, key) {
  const encrypted = new Uint8Array(plaintext.length);
  let previous = RED[7];
  for (let i = 0; i < plaintext.length; i++) {
    const g = (i % 8) * 29 + previous;
    encrypted[i] = (plaintext[i] + key[g]) % 29;
    previous = encrypted[i];
  }
  return encrypted;
}
/** @param {ArrayLike<number>} arr */
function distribution(arr) {
  const a = Array.from(arr).sort((x, y) => x - y);
  return {minimum: a[0], p05: a[Math.floor(a.length * 0.05)],
    median: a[Math.floor(a.length * 0.5)], maximum: a[a.length - 1],
    notAboveSource: a.filter(x => x <= source.rate).length};
}
const cycles = 350, plantedRates = [], sameTapeRates = [];
let example = null;
for (let i = 0; i < cycles; i++) {
  const corpus = corpora[i % 2];
  const offset = Math.floor(random() * (corpus.length - 3000));
  const plaintext = corpus.slice(offset, offset + 3000);
  const key = Int8Array.from({length: 232}, () => Math.floor(random() * 29));
  const generated = encryptShift(plaintext, key);
  const group = states(generated);
  const fromCipher = equality(generated, group);
  const fromPlain = equality(plaintext, group);
  assert.deepEqual(fromCipher, fromPlain,
    "Every shift must preserve state-group equalities on authentic GP prose");
  plantedRates.push(fromCipher.rate);
  sameTapeRates.push(equality(plaintext, sourceGroup).rate);
  if (i === 0) example = {source: "Gibran", offset, 
    matches: fromCipher.matches, eligible: fromCipher.eligible};
}
const nativePlanted = distribution(plantedRates);
const nativeSourceTape = distribution(sameTapeRates);
assert.ok(nativePlanted.minimum > 0.0582 && nativePlanted.minimum < 0.0584);
assert.ok(nativeSourceTape.minimum > 0.0550 && nativeSourceTape.minimum < 0.0551);
assert.equal(nativePlanted.notAboveSource, 0);
assert.equal(nativeSourceTape.notAboveSource, 0);
// Stronger positive control: all 232 secret alphabets are arbitrary 29!
// permutations, rather than just additive shifts. A causal decoder recovers
// the authentic native GP plaintext for every symbol and has the same E.
const seedNative = corpora[0].slice(35000, 38000);
assert.equal(seedNative.length, 3000);
const perm = Array.from({length:232}, () => {
  const a = Uint8Array.from({length:29}, (_, i) => i);
  for (let i = 28; i > 0; i--) {
    const k = Math.floor(random() * (i + 1)),tmp = a[i];
    a[i] = a[k]; a[k] = tmp;
  }
  return a;
});
const inverse = perm.map(a => {
  const b = new Uint8Array(29);
  for (let i = 0; i < 29; i++) b[a[i]] = i;
  return b;
});
const permuted = new Uint8Array(seedNative.length);
let prev = RED[7];
for (let i = 0; i < seedNative.length; i++) {
  const state = (i % 8) * 29 + prev;
  permuted[i] = perm[state][seedNative[i]];
  prev = permuted[i];
}
const rec = new Uint8Array(seedNative.length);
prev = RED[7];
for (let i = 0; i < permuted.length; i++) {
  const state = (i % 8) * 29 + prev;
  rec[i] = inverse[state][permuted[i]];
  prev = permuted[i];
}
assert.deepEqual(Array.from(rec), seedNative);
assert.deepEqual(equality(permuted, states(permuted)),
  equality(seedNative, states(permuted)));
console.log(JSON.stringify({
  original: source, nativeSamples: cycles,
  sameSourceStateTape: nativeSourceTape,
  randomSecretShiftEncryption: nativePlanted,
  exemplar: example, arbitrary232PermutationPlantRecovered: rec.length,
  verdict: "No secret 232-state 29-way bijections under the exact red8/previous-cipher rule can change the original within-state equality rate; no native-GP prose in calibrated original source"
}, null, 2));
