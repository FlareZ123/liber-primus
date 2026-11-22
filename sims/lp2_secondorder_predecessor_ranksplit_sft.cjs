"use strict";
/**
 * LP2 two-step ciphertext-feedback decoder, with original source, a frozen
 * training/heldout split and genuinely reversible source-native language plants.
 *
 * Hypothesis: C[i] = S[C[i-2], C[i-1]][P[i]], where 841 arbitrary secret
 * bijections are fixed across the book. At the first two glyphs of each
 * physical rune-bearing page, emit plaintext directly (unscored).
 *
 * Every row's equality pattern is secret-alphabet invariant. This reproducer
 * tests two distinct decisions:
 *   (1) the exact conditional-collision statistic on 12,846 source positions;
 *   (2) a rank-sorted maximum-likelihood independent-row inverse trained
 *       only on physical pp0–27 and frozen for pp28–55.
 *
 * A negative is not a general proof against arbitrary additional registers,
 * moving keys, or non-English/variable-length plaintext.
 *
 * Single-file test: node sims/lp2_secondorder_predecessor_ranksplit_sft.cjs
 * @module lp2_secondorder_predecessor_ranksplit_sft
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = corpus.pages.filter(p => p.status === "unsolved" && p.indices.length);
const original = pages.map(p => p.indices);
const lengths = original.map(p => p.length);
const MOD = 29;
assert.equal(original.length, 55);
assert.equal(original.flat().length, 12956);
assert.equal(corpus.translit[18], "E");

/** Translate GP-English consistently with the established control encoder. */
function encode(raw) {
  const tokens = corpus.translit.map((token, i) => ({token, i}))
    .sort((a, b) => b.token.length - a.token.length);
  const result = [];
  for (let word of raw.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/K/g, "C").replace(/Z/g, "S");
    for (let at = 0; at < word.length;) {
      const selected = tokens.find(item => word.startsWith(item.token, at));
      assert.ok(selected, "GP-encodable source: " + word.slice(at));
      result.push(selected.i);
      at += selected.token.length;
    }
  }
  return result;
}
const english = {
  Shakespeare: encode(read("resources/control/shakespeare_first300k.txt")),
  Gibran: encode(read("resources/control/gibran_prophet_58585.txt"))
};
assert.equal(english.Shakespeare.length, 218800);
assert.equal(english.Gibran.length, 63114);

/** Exact conditional second-order ciphertext equality invariant. */
function collision(book) {
  const rows = Array.from({length: MOD * MOD}, () => new Uint16Array(MOD));
  for (const a of book)
    for (let i = 2; i < a.length; i++)
      rows[a[i - 2] * MOD + a[i - 1]][a[i]]++;
  let comparisonPairs = 0, equalPairs = 0, observations = 0;
  for (const row of rows) {
    let n = 0;
    for (const count of row) {
      n += count;
      equalPairs += count * (count - 1);
    }
    observations += n;
    comparisonPairs += n * (n - 1);
  }
  return {
    observations, comparisonPairs, equalPairs,
    conditionalCollisionRate: equalPairs / comparisonPairs
  };
}
const observed = collision(original);
assert.deepEqual(observed, {
  observations: 12846,
  comparisonPairs: 201168,
  equalPairs: 7022,
  conditionalCollisionRate: 7022 / 201168
});

/** Source-trained, fixed target GP29 letter probabilities. */
const frequency = new Float64Array(MOD).fill(0.3);
for (const rune of english.Shakespeare.slice(0, 70000)) frequency[rune]++;
const frequencyTotal = frequency.reduce((sum, x) => sum + x, 0);
const logProbability = Array.from(frequency,
  x => Math.log(x / frequencyTotal));
const sourceOrder = Array.from({length: MOD}, (_, i) => i)
  .sort((a, b) => frequency[b] - frequency[a] || a - b);

/**
 * Recover one speculative inverse table from original first-half frequencies.
 * This is a whole-table rank-MLE estimate: each state maps its most frequent
 * emitted rune to the globally most frequent native rune, and so on.
 * The output likelihood on pp28–55 is not used in the fitting.
 */
function inverseFromTraining(book) {
  const rows = Array.from({length: MOD * MOD}, () => new Uint16Array(MOD));
  for (let p = 0; p < 28; p++) {
    const a = book[p];
    for (let i = 2; i < a.length; i++)
      rows[a[i - 2] * MOD + a[i - 1]][a[i]]++;
  }
  return rows.map(row => {
    const cipherOrder = Array.from({length: MOD}, (_, i) => i)
      .sort((a, b) => row[b] - row[a] || a - b);
    const inverse = new Uint8Array(MOD);
    for (let i = 0; i < MOD; i++)
      inverse[cipherOrder[i]] = sourceOrder[i];
    return inverse;
  });
}
/** Decode each eligible rune with a frozen previously inferred table. */
function evaluate(book) {
  const inv = inverseFromTraining(book);
  let trainLL = 0, trainN = 0, heldoutLL = 0, heldoutN = 0, heldoutE = 0;
  for (let p = 0; p < book.length; p++) {
    const a = book[p];
    for (let i = 2; i < a.length; i++) {
      const plain = inv[a[i - 2] * MOD + a[i - 1]][a[i]];
      if (p < 28) {trainLL += logProbability[plain]; trainN++;}
      else {
        heldoutLL += logProbability[plain]; heldoutN++;
        if (plain === 18) heldoutE++;
      }
    }
  }
  assert.equal(trainN, 6705);
  assert.equal(heldoutN, 6141);
  return {
    trainingMeanLogProbability: trainLL / trainN,
    frozenHeldoutMeanLogProbability: heldoutLL / heldoutN,
    frozenHeldoutECount: heldoutE,
    frozenHeldoutEFraction: heldoutE / heldoutN
  };
}
const sourceResult = evaluate(original);
assert.ok(Math.abs(sourceResult.frozenHeldoutMeanLogProbability -
  (-4.268512181116278)) < 1e-12);

/** Fixed xorshift32 seed for the full experiment, no fitted random controls. */
let randomState = 0xa435f220;
function random() {
  randomState ^= randomState << 13;
  randomState ^= randomState >>> 17;
  randomState ^= randomState << 5;
  return randomState >>> 0;
}
/** Return 841 independent secret GP29 substitution permutations. */
function secretTables() {
  return Array.from({length: MOD * MOD}, () => {
    const row = Array.from({length: MOD}, (_, i) => i);
    for (let i = MOD - 1; i > 0; i--) {
      const j = random() % (i + 1);
      [row[i], row[j]] = [row[j], row[i]];
    }
    return row;
  });
}
/** A genuinely reversible second-order original-shape English plant. */
function plant(source) {
  const first = random() % (source.length - 12956);
  const plaintext = source.slice(first, first + 12956);
  const forward = secretTables();
  const inverse = forward.map(row => {
    const inv = new Uint8Array(MOD);
    row.forEach((rune, i) => {inv[rune] = i;});
    return inv;
  });
  const encrypted = [];
  let offset = 0, verified = 0;
  for (const len of lengths) {
    const p = plaintext.slice(offset, offset + len);
    const c = [p[0], p[1]];
    for (let i = 2; i < len; i++) {
      const state = c[i - 2] * MOD + c[i - 1];
      c.push(forward[state][p[i]]);
      assert.equal(inverse[state][c[i]], p[i]);
      verified++;
    }
    encrypted.push(c);
    offset += len;
  }
  assert.equal(offset, 12956);
  assert.equal(verified, 12846);
  return {sourceOffset: first, inverseVerified: verified,
    score: evaluate(encrypted), invariant: collision(encrypted)};
}
const controls = Array.from({length: 32}, (_, i) => ({
  trial: i,
  nativeSource: i % 2 ? "Shakespeare" : "Gibran",
  ...plant(i % 2 ? english.Shakespeare : english.Gibran)
}));
assert.ok(controls.every(c =>
  c.score.frozenHeldoutMeanLogProbability >
    sourceResult.frozenHeldoutMeanLogProbability + 0.2));
assert.ok(controls.every(c =>
  c.invariant.conditionalCollisionRate >
    observed.conditionalCollisionRate + 0.02));
const stats = values => ({
  min: Math.min(...values),
  max: Math.max(...values),
  mean: values.reduce((sum, v) => sum + v, 0) / values.length
});
const result = {
  classification: "original two-step static-feedback decryption attempt; no unknown plaintext recovered",
  hypothesis: "C[i]=S[C[i-2],C[i-1]][P[i]], 841 fixed secret arbitrary bijections",
  original: {pages:55,runes:12956,...observed,...sourceResult},
  controls: {
    genuineGPPlantedBooks: controls.length,
    inverseVerifiedRunesPerBook: 12846,
    frozenHeldoutMeanLogProbability: stats(controls.map(
      c => c.score.frozenHeldoutMeanLogProbability)),
    conditionalCollisionRate: stats(controls.map(
      c => c.invariant.conditionalCollisionRate)),
    trials: controls.map(c => ({
      trial:c.trial, source:c.nativeSource, sourceOffset:c.sourceOffset,
      heldoutLogProbability:c.score.frozenHeldoutMeanLogProbability,
      conditionalCollisionRate:c.invariant.conditionalCollisionRate
    }))
  },
  limits: "Second-order static S-box with normal source-native English tested; no claim about changing hidden states, keys, plaintext registers, or extra layers"
};
console.log(JSON.stringify(result, null, 2));
