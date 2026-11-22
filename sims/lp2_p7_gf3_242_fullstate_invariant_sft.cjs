"use strict";

/**
 * Original LP2 p7 GF(3) 242-state all-secret receiver decision.
 * SFT: node sims/lp2_p7_gf3_242_fullstate_invariant_sft.cjs
 * Reuses the project's solved-English -> GP29 source orthography.
 * No network, no file writes, and no guessed unknown-page plaintext.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const {encodeSourceNativeGP} =
  require("./lp2_native_gp_source_orthography_sft.cjs");

const PERIOD = 242;
const originalPages = gp.pages.filter(p => p.page >= 8 && p.page <= 14);
const lengths = originalPages.map(p => p.indices.length);
const original = originalPages.flatMap(p => p.indices);
assert.deepEqual(lengths, [255, 268, 263, 273, 261, 272, 137]);
assert.equal(original.length, 1729);
assert.equal(gp.pages[8].indices.length - 12, 243);

/**
 * P7 red-word GP-index products give GF(3) taps [2,2,2,0,2].
 * Every nonzero five-trit state occurs exactly once, then repeats.
 * @returns {number[][]}
 */
function genuineSourceStateCycle() {
  const taps = [2, 2, 2, 0, 2];
  let s = [1, 0, 0, 0, 0];
  const seen = new Set();
  const cycle = [];
  for (let i = 0; i < PERIOD; i++) {
    const id = s.reduce((n, v) => 3 * n + v, 0);
    assert.notEqual(id, 0, "zero is not in the primitive cycle");
    assert(!seen.has(id), "state must be visited only once");
    seen.add(id);
    cycle.push(s.slice());
    const next = taps.reduce((n, t, j) => n + t * s[j], 0) % 3;
    s = [...s.slice(1), next];
  }
  assert.equal(seen.size, PERIOD);
  assert.deepEqual(s, [1, 0, 0, 0, 0]);
  return cycle;
}
const cycle = genuineSourceStateCycle();

/**
 * Count same-rune unordered pairs within each repeated internal state.
 * A per-state GP29 bijection preserves this integer exactly for ANY key.
 * @param {number[][]} parts
 * @param {boolean} pageReset
 * @returns {{pairs:number, equal:number}}
 */
function invariant(parts, pageReset) {
  const bins = Array.from({length:PERIOD}, () => new Uint16Array(29));
  let offset = 0;
  for (const part of parts) {
    for (let i = 0; i < part.length; i++) {
      const state = (pageReset ? i : offset) % PERIOD;
      assert(Number.isInteger(part[i]) && part[i] >= 0 && part[i] < 29);
      bins[state][part[i]]++;
      offset++;
    }
  }
  let pairs = 0, equal = 0;
  for (const row of bins) {
    let size = 0;
    for (const n of row) {
      equal += n * (n - 1) / 2;
      size += n;
    }
    pairs += size * (size - 1) / 2;
  }
  return {pairs, equal};
}

/** @param {number[]} symbols */
function splitLikeOriginal(symbols) {
  let at = 0;
  const result = lengths.map(length => {
    const part = symbols.slice(at, at + length);
    at += length;
    return part;
  });
  assert.equal(at, original.length);
  return result;
}

const actualContinuous = invariant(originalPages.map(p => p.indices), false);
const actualRestart = invariant(originalPages.map(p => p.indices), true);
assert.deepEqual(actualContinuous, {pairs:5327, equal:195});
assert.deepEqual(actualRestart, {pairs:5718, equal:210});
const originalBlackAndLater = [
  gp.pages[8].indices.slice(12),
  ...gp.pages.filter(p => p.page >= 9 && p.page <= 14)
    .map(p => p.indices)
];
assert.deepEqual(invariant(originalBlackAndLater, false),
  {pairs:5243, equal:194});
const later = gp.pages.filter(p => p.page >= 9 && p.page <= 14)
  .map(p => p.indices);
assert.deepEqual(invariant(later, false), {pairs:3762, equal:136});

const runeIndex = new Map(gp.runes.map((glyph, i) => [glyph, i]));
const solvedGP = solved.sections.flatMap(section =>
  [...section.source_text].filter(c => runeIndex.has(c))
    .map(c => runeIndex.get(c)));
assert.equal(solved.sections.length, 9);
assert.equal(solvedGP.length, 2979);
const gibranGP = encodeSourceNativeGP(read(
  "resources/control/gibran_prophet_58585.txt"), true);
assert.equal(gibranGP.length, 62492);

/**
 * Frozen contiguous-window controls. Each candidate uses exactly the
 * original chapter's seven source page lengths and positional boundaries.
 * @param {number[]} reference
 * @param {number} step
 */
function controlWindows(reference, step) {
  let count = 0;
  let continuousMin = Infinity, continuousMax = -Infinity;
  let restartMin = Infinity, restartMax = -Infinity;
  let continuousAtOrBelow = 0, restartAtOrBelow = 0;
  for (let start = 0; start + original.length <= reference.length;
    start += step) {
    const pieces = splitLikeOriginal(
      reference.slice(start, start + original.length));
    const a = invariant(pieces, false);
    const b = invariant(pieces, true);
    assert.equal(a.pairs, actualContinuous.pairs);
    assert.equal(b.pairs, actualRestart.pairs);
    continuousMin = Math.min(continuousMin, a.equal);
    continuousMax = Math.max(continuousMax, a.equal);
    restartMin = Math.min(restartMin, b.equal);
    restartMax = Math.max(restartMax, b.equal);
    continuousAtOrBelow += Number(a.equal <= actualContinuous.equal);
    restartAtOrBelow += Number(b.equal <= actualRestart.equal);
    count++;
  }
  return {
    count, continuousMin, continuousMax, restartMin, restartMax,
    continuousAtOrBelow, restartAtOrBelow
  };
}
const solvedControl = controlWindows(solvedGP, 1);
const gibranControl = controlWindows(gibranGP, 37);
assert.deepEqual(solvedControl, {
  count:1251, continuousMin:314, continuousMax:370,
  restartMin:317, restartMax:402,
  continuousAtOrBelow:0, restartAtOrBelow:0
});
assert.deepEqual(gibranControl, {
  count:1643, continuousMin:260, continuousMax:377,
  restartMin:286, restartMax:426,
  continuousAtOrBelow:0, restartAtOrBelow:0
});

// Full GP29, genuinely invertible state-private alphabet control:
// even 242 distinct nontrivial phase alphabets cannot change either
// collision statistic. State seed and initial cycle phase may differ.
function affineKey(phase) {
  const state = cycle[phase];
  const id = state.reduce((v, trit) => 3 * v + trit, 0);
  return {a:1 + (id * 11) % 28, b:(id * id + 13) % 29};
}
function invA(a) {
  for (let b = 1; b < 29; b++) if ((a * b) % 29 === 1) return b;
  throw Error("not invertible");
}
function crypt(parts, pageReset, startPhase) {
  let offset = 0;
  const ciphertext = [];
  const recovered = [];
  for (const part of parts) {
    const out = [], restored = [];
    for (let i = 0; i < part.length; i++) {
      const phase = (startPhase + (pageReset ? i : offset)) % PERIOD;
      const {a,b} = affineKey(phase);
      const c = (a * part[i] + b) % 29;
      out.push(c);
      restored.push((invA(a) * ((c - b + 29) % 29)) % 29);
      offset++;
    }
    ciphertext.push(out);
    recovered.push(restored);
  }
  assert.deepEqual(recovered, parts);
  assert.deepEqual(invariant(ciphertext, pageReset),
    invariant(parts, pageReset));
}
const planted = splitLikeOriginal(solvedGP.slice(0, original.length));
for (const phase of [0, 67, 241]) {
  crypt(planted, false, phase);
  crypt(planted, true, phase);
}

console.log(JSON.stringify({
  result:"no original plaintext; 242-state fixed-bijection family excluded for sampled native GP",
  source:"p7 GF3 five-tap primitive cycle",
  statePeriod:cycle.length,
  originalPages:lengths,
  actualContinuous, actualRestart,
  originalBlackAndLater:invariant(originalBlackAndLater, false),
  later:invariant(later, false),
  solvedControl, gibranControl,
  positiveSecretAlphabetPhases:[0,67,241],
  keyIndependent:true
}, null, 2));
