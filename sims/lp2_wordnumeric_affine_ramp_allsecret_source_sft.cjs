"use strict";

/**
 * Original LP2 12,956-rune test: are all printed words encrypted as
 * C[w,j] = P[w,j] + A[w] + g[w]*j (mod29)?
 *
 * A[w] is ENTIRELY SECRET and can vary adaptively at every word. The observed
 * within-word difference histogram is independent of all A[w]. Test global
 * drift g, and clue-motivated current/preceding printed-word length,
 * GP index sum or Gematria prime sum as drift, in both directions.
 *
 * External source: the source-native (already solved) 2,979-rune GP29 LP1/LP2
 * plaintext witness. Text is split into original complete printed GP words.
 * Source and native planted controls are read only.
 *
 * Windows 11 / Node.js 22:
 *   node sims/lp2_wordnumeric_affine_ramp_allsecret_source_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.join(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const runeWord = w => [...w].map(r => {
  const value = runeIndex.get(r);
  assert.notEqual(value, undefined, `unmapped source rune ${r}`);
  return value;
});
const mod = x => ((x % 29) + 29) % 29;
const originalWords = read("resources/liber-primus/lp2-transcription.txt")
  .replace(/[\/\n\r%&$\s]/g, "")
  .split(/[-.]/)
  .filter(w => /[\u16A0-\u16FF]/u.test(w))
  .slice(0, 2896)
  .map(runeWord);
const solvedWords = solved.sections.flatMap(section =>
  (section.source_text.match(/[\u16A0-\u16FF]+/gu) || []).map(runeWord));
const countRunes = words => words.reduce((n, w) => n + w.length, 0);
assert.equal(originalWords.length, 2896);
assert.equal(countRunes(originalWords), 12956);
assert.equal(solvedWords.length, 740);
assert.equal(countRunes(solvedWords), 2979);
assert.equal(corpus.prime.length, 29);

/** @param {number[]} w @param {"prime"|"index"|"length"} kind */
function wordNumber(w, kind) {
  if (kind === "length") return w.length % 29;
  if (kind === "index") return mod(w.reduce((s, v) => s + v, 0));
  return mod(w.reduce((s, v) => s + corpus.prime[v], 0));
}

/**
 * @param {number[][]} words
 * @param {{kind?: "prime"|"index"|"length", mode?: "previous"|"current"|"global",
 *          sign?: number, constant?: number}} model
 * @returns {number[]}
 */
function differenceHistogram(words, model = {}) {
  const {kind = "prime", mode = "global", sign = 1, constant = 0} = model;
  const hist = Array(29).fill(0);
  let previous = kind === "prime" ? 761 % 29 : 0;
  for (const word of words) {
    const current = wordNumber(word, kind);
    const drift = sign * (mode === "previous" ? previous
      : mode === "current" ? current : constant);
    for (let j = 1; j < word.length; j++) {
      hist[mod(word[j] - word[j - 1] - drift)]++;
    }
    previous = current;
  }
  return hist;
}

/**
 * Two-sample chi-square homogeneity. This allows for reference-sample noise
 * instead of treating native solved GP29 frequencies as fixed theoretical
 * probabilities. The 29 bins have nominal 28 degrees of freedom; correlated
 * within-word pairs and genre make exact iid-tail calibration inappropriate.
 * @param {number[]} observed
 * @param {number[]} native
 */
function homogeneity(observed, native) {
  const a = observed.reduce((s, x) => s + x, 0);
  const b = native.reduce((s, x) => s + x, 0);
  let chi = 0;
  for (let v = 0; v < 29; v++) {
    const pool = observed[v] + native[v];
    const e1 = pool * a / (a + b);
    const e2 = pool * b / (a + b);
    chi += (observed[v] - e1) ** 2 / e1
      + (native[v] - e2) ** 2 / e2;
  }
  return chi;
}

function same(a, b) {
  assert.deepEqual(a, b);
}

/** Source-native words resampled to exactly the 2,896 original word lengths. */
function nativeLengthMatchedWords() {
  const groups = Array.from({length: 15}, () => []);
  const counters = Array(15).fill(0);
  for (const word of solvedWords) if (word.length < 15) groups[word.length].push(word);
  return originalWords.map(word => {
    const pool = groups[word.length];
    assert.ok(pool.length > 0, `missing source-native word length ${word.length}`);
    return pool[counters[word.length]++ % pool.length];
  });
}

/**
 * Exact source-native plant and forward inverse using arbitrary per-word
 * secret offsets and a true ciphertext-previous-word numeral drift.
 * @param {number[][]} plaintext
 * @param {"prime"|"index"|"length"} kind
 * @param {number} sign
 */
function plantPrevious(plaintext, kind, sign) {
  let rng = 0x3301fa31;
  const random = () => {
    rng ^= rng << 13;
    rng ^= rng >>> 17;
    rng ^= rng << 5;
    return rng >>> 0;
  };
  const ciphers = [], secretOffsets = [];
  let previous = kind === "prime" ? 761 % 29 : 0;
  for (const word of plaintext) {
    const a = random() % 29;
    const cipher = word.map((p, j) => mod(p + a + sign * previous * j));
    secretOffsets.push(a);
    ciphers.push(cipher);
    previous = wordNumber(cipher, kind);
  }
  const recovered = [];
  previous = kind === "prime" ? 761 % 29 : 0;
  for (let w = 0; w < ciphers.length; w++) {
    recovered.push(ciphers[w].map((c, j) =>
      mod(c - secretOffsets[w] - sign * previous * j)));
    previous = wordNumber(ciphers[w], kind);
  }
  same(recovered, plaintext);
  same(differenceHistogram(ciphers, {mode: "previous", kind, sign}),
    differenceHistogram(plaintext));
  return {kind, sign, recovered: countRunes(recovered)};
}

function run() {
  const native = differenceHistogram(solvedWords);
  const base = differenceHistogram(originalWords);
  assert.equal(base.reduce((a, b) => a + b, 0), 10060);
  assert.equal(base[0], 63);
  const globals = Array.from({length: 29}, (_, g) => ({
    slope: g, chi: homogeneity(
      differenceHistogram(originalWords, {mode: "global", constant: g}), native)
  })).sort((a, b) => a.chi - b.chi);
  assert.equal(globals[0].slope, 22);
  assert.ok(Math.abs(globals[0].chi - 308.10570344486956) < 1e-9);

  const sourceNumerics = [];
  for (const kind of ["prime", "index", "length"])
    for (const mode of ["current", "previous"])
      for (const sign of [-1, 1]) {
        const model = {kind, mode, sign};
        sourceNumerics.push({...model,
          chi: homogeneity(differenceHistogram(originalWords, model), native)});
      }
  sourceNumerics.sort((a, b) => a.chi - b.chi);
  assert.equal(sourceNumerics[0].kind, "length");
  assert.equal(sourceNumerics[0].mode, "current");
  assert.equal(sourceNumerics[0].sign, 1);
  assert.ok(Math.abs(sourceNumerics[0].chi - 301.6543241571248) < 1e-9);

  const plant = nativeLengthMatchedWords();
  assert.equal(countRunes(plant), 12956);
  const plantedChi = homogeneity(differenceHistogram(plant), native);
  assert.ok(Math.abs(plantedChi - 8.854050716963457) < 1e-9);
  const controls = [];
  for (const kind of ["prime", "index", "length"])
    for (const sign of [-1, 1]) controls.push(plantPrevious(plant, kind, sign));
  assert.ok(globals[0].chi > 300);
  assert.ok(sourceNumerics.every(row => row.chi > 300));

  const output = {
    receiver: "All 2,896 authentic unknown LP2 printed words (12,956 runes)",
    nativeReference: "740 independently published solved GP29 words, 2,979 runes",
    originalAdjacentPairs: 10060, originalEqualAdjacent: base[0],
    knownSolvedPairs: native.reduce((a, b) => a + b, 0),
    invariant: "C[w,j]-C[w,j-1] = P[w,j]-P[w,j-1] + g[w] mod29; arbitrary A[w] cancels",
    bestAll29GlobalSlopes: globals.slice(0, 4),
    sourceDerivedCurrentPreviousSlopes: sourceNumerics,
    exactLengthMatchedNativePositiveChi: plantedChi,
    nativePositiveForwardInverseControls: controls,
    conclusion: "No constant slope or signed-current/preceding-word prime/index/length ramp yields native GP29 prose statistics. This is a necessary-condition exclusion of the specified length-preserving additive-ramp models, even with fully secret per-word offsets; it is not a rejection of all stateful/nonlinear or non-English ciphers."
  };
  console.log(JSON.stringify(output, null, 2));
  return output;
}
if (require.main === module) run();
module.exports = {wordNumber, differenceHistogram, homogeneity, nativeLengthMatchedWords,
  plantPrevious, run};
