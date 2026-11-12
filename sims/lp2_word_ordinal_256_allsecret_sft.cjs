"use strict";

/**
 * Source-locked word-ordinal phase-256 arbitrary-permutation test.
 *
 * No secret key is guessed: every phase may have an independent 29! bijection.
 * Under C[word,0] = S[wordOrdinal % period](P[word,0]), equality among
 * word initials in the same phase is invariant under every such secret S.
 *
 * SFT: node sims/lp2_word_ordinal_256_allsecret_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseSharedCorpus } = require("./lp2_word_pages.cjs");

const root = path.join(__dirname, "..");
/** @param {string} name */
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const alphabet = [...corpus.runes];
const tokens = corpus.translit.map((name, index) => ({ name, index }))
  .sort((a, b) => b.name.length - a.name.length);
assert.equal(alphabet.length, 29);

/**
 * GP29 transliteration of an independently sourced Latin-alphabet word.
 * Mirrors the project's Shakespeare/Gibran/Emerson normalizer.
 * @param {string} original
 * @returns {number[]}
 */
function gpWord(original) {
  const word = original.toUpperCase().replace(/ING/g, "NG")
    .replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < word.length;) {
    const next = tokens.find(x => word.startsWith(x.name, i));
    assert.ok(next, "Unexpected GP source letter at " + word.slice(i));
    out.push(next.index);
    i += next.name.length;
  }
  return out;
}

/**
 * Xorshift32 with declared reproducibility seed.
 * @param {number} init
 * @returns {()=>number}
 */
function rng(init) {
  let state = init >>> 0;
  assert.notEqual(state, 0);
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

const PERIODS = [16, 32, 43, 256];
const TRIALS = 1000;
const sources = [
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/control/beowulf_oe_gp_profile_corrected.json",
  "resources/control/latin-vulgate-gp-wholewords.txt"
];
const gpDigits = "0123456789ABCDEFGHIJKLMNOPQRS";

/**
 * Return already-normalized source-native GP words when author-preserved
 * Latin/Old-English resources are available, or normalize English words.
 * @param {string} source
 * @returns {number[][]}
 */
function sourceGPWords(source) {
  if (source.endsWith("beowulf_oe_gp_profile_corrected.json")) {
    const model = JSON.parse(read(source));
    let offset = 0;
    const words = model.allSourceGpWordLengths.map(length => {
      const token = model.sourceGpBase29.slice(offset, offset + length);
      assert.equal(token.length, length);
      offset += length;
      return [...token].map(c => {
        const value = gpDigits.indexOf(c);
        assert.ok(value >= 0);
        return value;
      });
    });
    assert.equal(offset, model.sourceGpBase29.length);
    assert.equal(words.length, model.acceptedSourceWords);
    return words;
  }
  if (source.endsWith("latin-vulgate-gp-wholewords.txt")) {
    return read(source).split(/\r?\n/u)
      .filter(token => /^[0-9A-S]+$/u.test(token))
      .map(token => [...token].map(c => gpDigits.indexOf(c)));
  }
  return (read(source).toUpperCase().match(/[A-Z]+/g) || []).map(gpWord);
}
const original = parseSharedCorpus();
assert.equal(original.words.length, 2896);
assert.equal(original.runeCount, 12956);
assert.equal(original.crossPageWords, 32);

const selected = original.words.map((w, ordinal) => ({
  ordinal, length: w.length, symbol: alphabet.indexOf([...w.runes][0])
})).filter(w => w.length <= 8);
assert.equal(selected.length, 2709);
assert.deepEqual(Array.from({ length: 8 }, (_, i) =>
  selected.filter(w => w.length === i + 1).length),
[83, 448, 720, 513, 317, 256, 216, 156]);
assert.ok(selected.every(w => w.symbol >= 0));

/**
 * Paired equality rate, conditional on the original absolute word ordinal
 * modulo the declared phase period. The 187 length>8 words are omitted
 * from observations but KEEP their original phase-clock positions.
 * @param {number[]} symbols
 * @param {number} period
 * @returns {{rate:number, equalPairs:number, eligiblePairs:number}}
 */
function phaseCollision(symbols, period) {
  assert.equal(symbols.length, selected.length);
  const bins = Array.from({ length: period }, () => new Uint16Array(29));
  const counts = new Uint16Array(period);
  for (let i = 0; i < selected.length; i++) {
    const phase = selected[i].ordinal % period;
    bins[phase][symbols[i]]++;
    counts[phase]++;
  }
  let equalPairs = 0, eligiblePairs = 0;
  for (let i = 0; i < period; i++) {
    eligiblePairs += counts[i] * (counts[i] - 1);
    for (const n of bins[i]) equalPairs += n * (n - 1);
  }
  return { rate: equalPairs / eligiblePairs, equalPairs, eligiblePairs };
}

/**
 * Fully unknown secret key: independent Fisher-Yates permutation at each
 * phase, with matching inverse. The planted alphabet is source-native GP29.
 * @param {number[]} symbols
 * @param {number} period
 * @param {()=>number} random
 */
function plant(symbols, period, random) {
  const forward = [];
  const inverse = [];
  for (let phase = 0; phase < period; phase++) {
    const p = Array.from({ length: 29 }, (_, i) => i);
    for (let j = 28; j > 0; j--) {
      const k = random() % (j + 1);
      [p[j], p[k]] = [p[k], p[j]];
    }
    const inv = new Array(29);
    for (let j = 0; j < 29; j++) inv[p[j]] = j;
    forward.push(p);
    inverse.push(inv);
  }
  const ciphertext = symbols.map((p, i) =>
    forward[selected[i].ordinal % period][p]);
  const recovered = ciphertext.map((c, i) =>
    inverse[selected[i].ordinal % period][c]);
  assert.deepEqual(recovered, symbols);
  assert.ok(recovered.some((p, i) =>
    inverse[(selected[i].ordinal + 1) % period][ciphertext[i]] !== p),
  "Wrong phase key unexpectedly recovered every symbol");
  assert.deepEqual(ciphertext.map((c, i) =>
    inverse[selected[i].ordinal % period][c]), symbols);
  const sourceRate = phaseCollision(symbols, period);
  const encryptedRate = phaseCollision(ciphertext, period);
  assert.deepEqual(encryptedRate, sourceRate);
  return { rateInvariant: true, recovered: symbols.length };
}

const originalSymbols = selected.map(w => w.symbol);
const observed = PERIODS.map(period => ({
  period, ...phaseCollision(originalSymbols, period)
}));
// Pin the original-input values to prevent accidental changes of parser or
// inclusion of the omitted 187 long words as clock-deleting positions.
const expected = [0.03428964863964075, 0.03449553260361449,
  0.03443067481744012, 0.0334734428735193];
for (let i = 0; i < PERIODS.length; i++) {
  assert.ok(Math.abs(observed[i].rate - expected[i]) < 1e-12);
}

const calibrated = [];
for (let sourceIndex = 0; sourceIndex < sources.length; sourceIndex++) {
  const words = sourceGPWords(sources[sourceIndex]);
  const pools = Array.from({ length: 9 }, () => []);
  for (const gp of words) {
    if (gp.length >= 1 && gp.length <= 8) pools[gp.length].push(gp[0]);
  }
  assert.ok(pools.slice(1).every(a => a.length > 0));
  const random = rng((0x33015600 + sourceIndex) >>> 0);
  const sampledMin = Array(PERIODS.length).fill(Infinity);
  const sampledMax = Array(PERIODS.length).fill(-Infinity);
  const sum = Array(PERIODS.length).fill(0);
  const atOrBelow = Array(PERIODS.length).fill(0);
  let planted = [];
  for (let trial = 0; trial < TRIALS; trial++) {
    const native = selected.map(w => {
      const pool = pools[w.length];
      return pool[random() % pool.length];
    });
    if (trial === 0) {
      // Plant a full initial-rune tape, with 256 independent 29! alphabets.
      planted = PERIODS.map(period => plant(native, period, random));
    }
    for (let i = 0; i < PERIODS.length; i++) {
      const rate = phaseCollision(native, PERIODS[i]).rate;
      sampledMin[i] = Math.min(sampledMin[i], rate);
      sampledMax[i] = Math.max(sampledMax[i], rate);
      sum[i] += rate;
      if (rate <= observed[i].rate) atOrBelow[i]++;
    }
  }
  assert.ok(atOrBelow.every(count => count === 0));
  calibrated.push({
    source: sources[sourceIndex], nativeTokens: words.length,
    poolSizes: pools.slice(1).map(p => p.length), planted,
    periods: PERIODS.map((period, i) => ({
      period, original: observed[i].rate, nativeMin: sampledMin[i],
      nativeMean: sum[i] / TRIALS, nativeMax: sampledMax[i],
      nativeAtOrBelowOriginal: atOrBelow[i],
      plusOneLowerTailP: (atOrBelow[i] + 1) / (TRIALS + 1)
    }))
  });
}
console.log(JSON.stringify({
  hypothesis: "One independently secret GP29 bijection per global WORD-ordinal phase",
  original: {
    completeWords: original.words.length, runes: original.runeCount,
    crossPageWords: original.crossPageWords,
    analyzedWordInitials: selected.length, omittedLongWords: 187,
    wordLengthCounts1to8: [83, 448, 720, 513, 317, 256, 216, 156],
    observed
  },
  seededSourceControlTrials: TRIALS,
  calibrated,
  verdict: "Each native GP-English source lies above every observed phase score; the tested word-period secret-permutation families are incompatible with these native-source models. No plaintext/key recovered."
}, null, 2));
