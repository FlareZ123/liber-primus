"use strict";
/**
 * LP2 original all-lag, fresh-secret-every-word monoalphabetic
 * ciphertext-feedback family: key-independent E(word) obstruction.
 *
 * Model for any 1 <= lag < 14:
 *   Q_w,j = permutation_w(P_w,j), arbitrary 29! fresh secret per word
 *   C_w,j = Q_w,j + (j>=lag ? C_w,j-lag : 0) mod 29.
 * Source original word breaks are preserved and all 32 cross-page words joined.
 * The inverse residual D_w,j = C_w,j - C_w,j-lag mod29 gives
 * permutation_w(P_w,j), hence all within-word same-symbol multiplicities.
 *
 * Read-only self-contained Windows 11 Node.js22 CommonJS single-file test.
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const ROOT = path.resolve(__dirname, "..");
const read = f => fs.readFileSync(path.join(ROOT, f), "utf8");
const source = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const physical = read("resources/liber-primus/lp2-transcription.txt").split("%");
const sourceGlyph = new Map(source.runes.map((g, i) => [g, i]));
const regex = new RegExp("[" + source.runes.join("") + "]+", "gu");
/** @param {string} fragment */
function parseWords(fragment) {
  const noWraps = fragment.replace(/\/\r?\n/g, "").replace(/[\r\n%]/g, "");
  return (noWraps.match(regex) || []).map(word =>
    Array.from(word, rune => {
      assert(sourceGlyph.has(rune));
      return sourceGlyph.get(rune);
    }));
}
const words = parseWords(physical.slice(0, 55).join(""));
assert.equal(words.length, 2896);
assert.deepEqual(words.flat(), source.pages.slice(0, 56).flatMap(p => p.indices));
assert.equal(words.flat().length, 12956);
assert.equal(words.filter(w => w.length === 1).length, 83);
assert.equal(words.filter(w => w.length === 2).length, 448);
assert.equal(Math.max(...words.map(w => w.length)), 14);

/** @param {number[]} word @returns {number} */
function equalPairs(word) {
  const frequencies = Array(29).fill(0);
  for (const x of word) frequencies[x]++;
  return frequencies.reduce((n, count) => n + count * (count - 1) / 2, 0);
}
/** @param {number[][]} book @returns {number} */
function bookEqualPairs(book) {
  return book.reduce((acc, word) => acc + equalPairs(word), 0);
}
/** @param {number[]} word @param {number} lag @returns {number[]} */
function originalInverseResidual(word, lag) {
  return word.map((cipher, j) =>
    ((cipher - (j >= lag ? word[j - lag] : 0)) % 29 + 29) % 29);
}
const observed = [];
for (let lag = 0; lag <= 13; lag++) {
  const changed = words.map(word => lag ? originalInverseResidual(word, lag) : word);
  observed.push({ lag, sourceEqualPairs: bookEqualPairs(changed) });
}
assert.deepEqual(observed.map(x => x.sourceEqualPairs),
  [811, 1079, 1026, 939, 863, 817, 803, 842, 817, 816, 811, 810, 811, 812]);
const highestResidual = Math.max(...observed.slice(1).map(x => x.sourceEqualPairs));
assert.equal(highestResidual, 1079);
// Every lag >= 14 is identically unfeedbacked for every original word,
// so its original E is exactly 811. This certifies ALL positive lags.
for (const lag of [14, 15, 16, 28, 29, 761]) {
  assert.deepEqual(words.map(w => originalInverseResidual(w, lag)), words);
}

// GP29 historical reference orthography, including ING -> rune NG and IO -> IA.
const tokens = source.translit.map((token, index) => ({ token, index }))
  .sort((a, b) => b.token.length - a.token.length);
/** @param {string} letters @returns {number[]} */
function encodeWord(letters) {
  const normalized = letters.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < normalized.length;) {
    if (normalized.startsWith("ING", i)) { out.push(21); i += 3; }
    else if (normalized.startsWith("IO", i)) { out.push(27); i += 2; }
    else {
      const matching = tokens.find(t => normalized.startsWith(t.token, i));
      assert(matching);
      out.push(matching.index);
      i += matching.token.length;
    }
  }
  return out;
}
/** @param {number} seed */
function nextRandom(seed) {
  return () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  };
}
// Native GP English controls with EXACT real source-word rune lengths.
const donors = [
  { name: "Shakespeare", file: "resources/control/shakespeare_first300k.txt", seed: 0x33012a },
  { name: "Emerson", file: "resources/control/emerson_essays_2944.txt", seed: 0x33012b },
  { name: "Gibran", file: "resources/control/gibran_prophet_58585.txt", seed: 0x33012c }
];
const donorRows = [];
const donorSamples = [];
for (const donor of donors) {
  let text = read(donor.file);
  if (donor.name === "Gibran") {
    const upper = text.toUpperCase();
    const b = upper.indexOf("ALMUSTAFA");
    const e = upper.indexOf("*** END OF THIS PROJECT", b);
    assert(b >= 0 && e > b);
    text = text.slice(b, e);
  }
  const bin = new Map();
  for (const w of text.match(/[A-Za-z]+/g) || []) {
    const gp = encodeWord(w);
    const array = bin.get(gp.length) || [];
    array.push(gp);
    bin.set(gp.length, array);
  }
  const comparable = words.filter(w => bin.has(w.length));
  const comparableOriginal = bookEqualPairs(comparable);
  const random = nextRandom(donor.seed);
  const trials = 1000;
  let min = Infinity, max = 0, sum = 0, compatible = 0;
  for (let n = 0; n < trials; n++) {
    const planted = comparable.map(word => {
      const choices = bin.get(word.length);
      return choices[Math.floor(random() * choices.length)];
    });
    if (n === 0) donorSamples.push(planted);
    const count = bookEqualPairs(planted);
    if (count <= highestResidual) compatible++;
    min = Math.min(min, count);
    max = Math.max(max, count);
    sum += count;
  }
  assert.equal(compatible, 0);
  assert(min > highestResidual);
  donorRows.push({
    donor: donor.name, comparableWords: comparable.length,
    observedUntransformedSameSlots: comparableOriginal,
    samples: trials, minimum: min, maximum: max, mean: sum / trials,
    samplesAtOrBelowAnyOriginalLag: compatible
  });
}
assert.deepEqual(donorRows.map(d => d.comparableWords), [2896, 2896, 2893]);

/**
 * A true reversible word-reset ciphertext-feedback cipher with unrestricted
 * new random 29! maps PER original word, for every lag.
 * No standalone nonce and no state corruption when words cross source pages.
 * @param {number[][]} text
 * @param {number} lag
 * @param {number} seed
 */
function encryptDecodePositive(text, lag, seed) {
  const random = nextRandom(seed);
  const cipherBook = [];
  const recoveredBook = [];
  for (const word of text) {
    const perm = Array.from({ length: 29 }, (_, i) => i);
    for (let i = 28; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [perm[i], perm[j]] = [perm[j], perm[i]];
    }
    const inverse = Array(29);
    perm.forEach((value, i) => { inverse[value] = i; });
    const ciphertext = [];
    for (let j = 0; j < word.length; j++) {
      const residual = perm[word[j]];
      const feedback = j >= lag ? ciphertext[j - lag] : 0;
      ciphertext.push((residual + feedback) % 29);
    }
    cipherBook.push(ciphertext);
    const recoveredResidual = originalInverseResidual(ciphertext, lag);
    assert.equal(equalPairs(recoveredResidual), equalPairs(word));
    const recovered = recoveredResidual.map(x => inverse[x]);
    assert.deepEqual(recovered, word);
    const replay = [];
    for (let j = 0; j < word.length; j++) {
      replay.push((perm[recovered[j]] + (j >= lag ? replay[j - lag] : 0)) % 29);
    }
    assert.deepEqual(replay, ciphertext);
    recoveredBook.push(recovered);
  }
  assert.deepEqual(recoveredBook, text);
  return { words: text.length, runes: text.flat().length, lag };
}
const solved = parseWords(physical[56]);
assert.equal(solved.length, 20);
assert.deepEqual(solved.flat(), source.pages[57].indices);
assert.equal(solved.flat().length, 95);
const controls = [];
for (let lag = 1; lag <= 13; lag++) {
  const donor = encryptDecodePositive(donorSamples[0], lag, 0x33013abc + lag);
  const genuine = encryptDecodePositive(solved, lag, 0x33011300 + lag);
  controls.push({ lag, donor, genuine });
}
assert.equal(controls.length, 13);
console.log(JSON.stringify({
  model: "Any unrestricted fresh 29! GP29 word substitution, followed by j-lag ciphertext feedback, with truly intact original words",
  originalSource: { runes: 12956, completeWords: 2896, observed },
  originalAllPositiveLagMaximumInternalEqualPairs: highestResidual,
  allLagAtLeast14IdenticalToOriginal: true,
  sourceNativeEnglishWordLengthMatchedControls: donorRows,
  syntheticAndGenuineSolvedPositive: controls,
  conclusion: "No positive integer lag in word-reset additive ciphertext feedback with one unrestricted new monoalphabet per complete word produces native English-like GP29 original ciphertext; all lag>=14 coincide with the established plain word-local map. Other output laws, multiple alphabets within word, altered punctuation, or intermediate language remain untested."
}, null, 2));
