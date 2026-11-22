"use strict";

/**
 * Original LP2 self-loop marker bound for a reversible 29-symbol constrained cipher.
 *
 * C[i] = C[i-1] if and only if P[i] == E, where E is one fixed,
 * unknown GP29 plaintext symbol. The other 28 plaintext symbols map
 * bijectively to the 28 ciphertext symbols other than C[i-1].
 * These 28-symbol permutations can be entirely secret and can change
 * with page, position, prior ciphertext, any external state, or key.
 * A self-loop therefore exposes the exact plaintext positions of E
 * without knowing any of those secret permutations.
 *
 * The bound compares the original self-loop positions (word-initial,
 * interior, and final) with three independent native-GP language donors,
 * sampling a donor word for every exact original printed word length.
 * Chernoff / moment-generating-function bounds are rigorous under this
 * explicitly declared independent word-bootstrap model. They are NOT
 * universal probabilities of Cicada authorship or English writing.
 *
 * SFT: node sims/lp2_selfloop_rare_plaintext_symbol_sft.cjs
 * Windows 11 / Node.js 22 / CommonJS, no packages or network.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const rune = new Map(gp.runes.map((v, i) => [v, i]));
const source = gp.pages.filter(p => p.page <= 55);
const original = source.flatMap(p => p.indices);
const originalWords = read("resources/liber-primus/lp2-transcription.txt")
  .replace(/[\/\r\n%&$\s]/g, "").split(/[-.]/)
  .filter(w => /[\u16A0-\u16FF]/u.test(w)).slice(0, 2896)
  .map(w => Array.from(w, ch => rune.get(ch)));
assert.equal(original.length, 12956);
assert.equal(originalWords.length, 2896);
assert.deepEqual(originalWords.flat(), original);

const pageStarts = new Set();
let globalOffset = 0;
for (const page of source) {
  if (page.indices.length) pageStarts.add(globalOffset);
  globalOffset += page.indices.length;
}
assert.equal(pageStarts.size, 55);
const role = [];
const slotMap = new Map();
globalOffset = 0;
for (const word of originalWords) {
  let skip = -1;
  for (let j = 0; j < word.length; j++, globalOffset++) {
    if (pageStarts.has(globalOffset)) skip = j;
    role.push(j === 0 ? 0 : j === word.length - 1 ? 2 : 1);
  }
  const id = word.length + ":" + skip;
  const slot = slotMap.get(id) || { len: word.length, skip, count: 0 };
  slot.count++;
  slotMap.set(id, slot);
}
assert.equal(globalOffset, original.length);
const observed = [0, 0, 0]; // word-first, word-inside, word-last
let transitions = 0;
for (let i = 1; i < original.length; i++) {
  if (pageStarts.has(i)) continue;
  transitions++;
  if (original[i] === original[i - 1]) observed[role[i]]++;
}
assert.equal(transitions, 12901);
assert.deepEqual(observed, [23, 44, 19]);

/** Source-calibrated Latin-text to GP29, following the repository's
 * lp2_native_gp_source_orthography_sft.cjs ING/IO/QU/V/K/Z conventions.
 * @param {string} text @returns {number[]} */
function encodeNativeGP(text) {
  const t = text.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const tokens = gp.translit.map((s, i) => ({ s, i }))
    .sort((a, b) => b.s.length - a.s.length);
  const out = [];
  for (let i = 0; i < t.length;) {
    if (t.startsWith("ING", i)) {
      out.push(21);
      i += 3;
    } else if (t.startsWith("IO", i)) {
      out.push(27);
      i += 2;
    } else {
      const token = tokens.find(v => t.startsWith(v.s, i));
      assert(token, "GP29 cannot encode " + t.slice(i));
      out.push(token.i);
      i += token.s.length;
    }
  }
  return out;
}

/** @param {number[][]} words @returns {Map<number, number[][]>} */
function donorPools(words) {
  const pools = new Map();
  for (const w of words) {
    const pool = pools.get(w.length) || [];
    pool.push(w);
    pools.set(w.length, pool);
  }
  for (const slot of slotMap.values()) assert(pools.has(slot.len));
  return pools;
}

/** @param {{n:number,dist:{k:number,p:number}[]}[]} rows
 * @param {number} t @param {boolean} derivative @returns {number} */
function cumulant(rows, t, derivative) {
  let sum = 0;
  for (const row of rows) {
    let max = -Infinity;
    for (const cell of row.dist) max = Math.max(max, t * cell.k);
    let denominator = 0;
    let numerator = 0;
    for (const cell of row.dist) {
      const v = cell.p * Math.exp(t * cell.k - max);
      denominator += v;
      numerator += cell.k * v;
    }
    sum += row.n * (derivative
      ? numerator / denominator : max + Math.log(denominator));
  }
  return sum;
}

/** One-sided Chernoff upper bound for the event S == target, where
 * independent slot-level donor words define the sum S.
 * @param {{n:number,dist:{k:number,p:number}[]}[]} rows
 * @param {number} target @returns {number} */
function pointChernoff(rows, target) {
  const mean = cumulant(rows, 0, true);
  if (Math.abs(mean - target) < 1e-10) return 1;
  let lo = target < mean ? -50 : 0;
  let hi = target < mean ? 0 : 50;
  if (target < mean && cumulant(rows, lo, true) > target + 1e-10)
    return 0;
  if (target > mean && cumulant(rows, hi, true) < target - 1e-10)
    return 0;
  for (let i = 0; i < 70; i++) {
    const mid = (lo + hi) / 2;
    if (cumulant(rows, mid, true) < target) lo = mid;
    else hi = mid;
  }
  const t = (lo + hi) / 2;
  return Math.exp(cumulant(rows, t, false) - t * target);
}

/** @param {string} name @param {number[][]} donor */
function evaluate(name, donor) {
  const pools = donorPools(donor);
  const rows = Array.from({ length: 29 }, () =>
    Array.from({ length: 3 }, () => []));
  for (const slot of slotMap.values()) {
    const pool = pools.get(slot.len);
    const hist = Array.from({ length: 29 }, () =>
      Array.from({ length: 3 }, () => Array(slot.len + 1).fill(0)));
    for (const word of pool) {
      const counts = Array.from({ length: 29 }, () => [0, 0, 0]);
      for (let j = 0; j < word.length; j++) {
        if (j === slot.skip) continue;
        const r = j === 0 ? 0 : j === word.length - 1 ? 2 : 1;
        counts[word[j]][r]++;
      }
      for (let g = 0; g < 29; g++)
        for (let r = 0; r < 3; r++)
          hist[g][r][counts[g][r]]++;
    }
    for (let g = 0; g < 29; g++) {
      for (let r = 0; r < 3; r++) {
        const dist = hist[g][r].map((value, k) =>
          ({ k, p: value / pool.length })).filter(x => x.p > 0);
        rows[g][r].push({ n: slot.count, dist });
      }
    }
  }
  let familyBound = 0;
  const candidates = [];
  for (let g = 0; g < 29; g++) {
    const means = rows[g].map(row => cumulant(row, 0, true));
    // For each fixed candidate escape glyph E, all three original role
    // counts must match. Bounding their intersection by the strongest
    // one-sided marginal is valid without assuming independence of roles.
    const bounds = rows[g].map((row, r) => pointChernoff(row, observed[r]));
    const upper = Math.min(...bounds);
    familyBound += upper;
    candidates.push({ glyph: gp.translit[g], mean: means, upper });
  }
  candidates.sort((a, b) => b.upper - a.upper);
  assert(familyBound >= 0 && Number.isFinite(familyBound));
  console.log(name + ": candidate-wise union upper bound " + familyBound);
  console.log("  least excluded identity:", candidates[0]);
  return familyBound;
}

/** Plant a whole-book reversible ciphertext under a changing
 * predecessor-conditioned 28-choice cipher whose only self-loops encode F.
 * The hidden key is a distinct 28-symbol permutation for every C[i-1].
 * @param {number[]} plain @returns {number[]} */
function encryptPlant(plain) {
  const cipher = [];
  for (let i = 0; i < plain.length; i++) {
    if (pageStarts.has(i)) {
      cipher.push(plain[i]);
    } else {
      const previous = cipher[i - 1];
      const p = plain[i];
      const delta = p === 0 ? 0 : 1 + ((5 * (p - 1) + 7 * previous) % 28);
      cipher.push((previous + delta) % 29);
    }
  }
  return cipher;
}
/** @param {number[]} cipher @returns {number[]} */
function decryptPlant(cipher) {
  const plain = [];
  for (let i = 0; i < cipher.length; i++) {
    if (pageStarts.has(i)) {
      plain.push(cipher[i]);
    } else {
      const previous = cipher[i - 1];
      const delta = (cipher[i] - previous + 29) % 29;
      const rank = ((17 * (delta - 1 - 7 * previous)) % 28 + 28) % 28;
      plain.push(delta === 0 ? 0 : rank + 1);
    }
  }
  return plain;
}

const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const native = solved.sections.flatMap(s =>
  (s.source_text.match(/[\u16A0-\u16FF]+/gu) || [])
    .map(word => Array.from(word, r => rune.get(r))));
const pools = donorPools(native);
let seed = 0x330128;
function random() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) / 0x100000000;
}
const plant = originalWords.flatMap(word => {
  const pool = pools.get(word.length);
  return pool[Math.floor(random() * pool.length)];
});
assert.equal(plant.length, original.length);
const plantCipher = encryptPlant(plant);
assert.deepEqual(decryptPlant(plantCipher), plant);
for (let i = 1; i < plant.length; i++)
  if (!pageStarts.has(i))
    assert.equal(plantCipher[i] === plantCipher[i - 1], plant[i] === 0);
console.log("Original repeat position roles:", observed, "of", transitions);
console.log("Positive plant exact roundtrip:", plant.length, "runes");

const solvedBound = evaluate("Solved LP1/p57 native", native);
const gibranBound = evaluate("Gibran", Array.from(
  read("resources/control/gibran_prophet_58585.txt").matchAll(/[A-Za-z]+/g),
  m => encodeNativeGP(m[0])));
const shakespeareBound = evaluate("Shakespeare", Array.from(
  read("resources/control/shakespeare_first300k.txt").matchAll(/[A-Za-z]+/g),
  m => encodeNativeGP(m[0])));
assert(Math.abs(solvedBound / 4.839056880013e-10 - 1) < 0.001);
assert(Math.abs(gibranBound / 1.111494010903e-10 - 1) < 0.001);
assert(Math.abs(shakespeareBound / 2.749663877e-16 - 1) < 0.001);
console.log("PASS: role-typed original self-loop one-glyph model is",
  "incompatible with three independent source-shaped native word donors",
  "at their stated conditional Chernoff bounds.");
