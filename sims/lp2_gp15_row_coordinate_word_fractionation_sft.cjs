"use strict";

/**
 * Literal GP15 vertical-row coordinate gate.
 *
 * The original Gematria Primus chart prints indices 0..14 in the left
 * table and 15..28 in the right table. Pairing rows by vertical position
 * gives row(i)=i for i<15 and row(i)=i-15 otherwise; row14 has no right mate.
 *
 * This SFT tests two key-independent necessary conditions for any
 * word-preserving cipher that keeps those literal vertical row coordinates:
 *
 * 1. exact row-sequence preserving: arbitrary left/right changes are allowed;
 * 2. row-multiset preserving: additionally allow arbitrary row-position
 *    permutation inside each printed word;
 * 3. arbitrary segmentation / side changes while the full vertical-row tape
 *    stays fixed, tested by row-repeat and 15-symbol IoC invariants.
 *
 * No cipher key is searched. Native English is encoded with the repository's
 * source-calibrated GP spelling rules (ING->NG, IO->IA, QU->CW, V->U).
 *
 * SFT: node sims/lp2_gp15_row_coordinate_word_fractionation_sft.cjs
 * Node.js 20+ CommonJS, no third-party packages or network calls.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(ROOT, name), "utf8")
  .replace(/\r\n/g, "\n");

const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/lp2-transcription.txt");
const runeIndex = new Map(gp.runes.map((rune, i) => [rune, i]));
const tokens = gp.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);

/** @param {number} i */
const chartRow = (i) => i < 15 ? i : i - 15;

/**
 * Source-calibrated English -> GP29.
 * @param {string} word
 * @returns {number[] | null}
 */
function encodeWord(word) {
  const s = word.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < s.length;) {
    if (s.startsWith("ING", i)) {
      out.push(21);
      i += 3;
      continue;
    }
    if (s.startsWith("IO", i)) {
      out.push(27);
      i += 2;
      continue;
    }
    const token = tokens.find((x) => s.startsWith(x.s, i));
    if (!token) return null;
    out.push(token.i);
    i += token.s.length;
  }
  return out;
}

/** @param {string} text */
function encodeTextWords(text) {
  return (text.toUpperCase().match(/[A-Z]+/g) || [])
    .map(encodeWord).filter(Boolean);
}

/** Exact 2,896 complete original p0..55 printed words. */
function originalWords() {
  const stream = transcription.split("%").slice(0, 55).join("%");
  const words = [];
  let word = [];
  const finish = () => {
    if (word.length) words.push(word);
    word = [];
  };
  for (const ch of stream) {
    if (runeIndex.has(ch)) word.push(runeIndex.get(ch));
    else if (ch === "%" || ch === "/" || /\s/u.test(ch)) {}
    else finish();
  }
  finish();

  const flat = gp.pages.filter((p) => p.page < 56 && p.indices.length)
    .flatMap((p) => p.indices);
  assert.equal(words.length, 2896);
  assert.equal(flat.length, 12956);
  assert.deepEqual(words.flat(), flat);
  return words;
}

/** @param {number[]} word */
const rowSequenceKey = (word) =>
  word.length + ":" + word.map(chartRow).join(",");

/** @param {number[]} word */
function rowMultisetKey(word) {
  const counts = new Array(15).fill(0);
  for (const rune of word) counts[chartRow(rune)]++;
  return word.length + ":" + counts.join(",");
}

/** @param {number[][]} words @param {(x:number[])=>string} key */
function keySet(words, key) {
  return new Set(words.map(key));
}

/**
 * Score source words against a donor key set.
 * @param {number[][]} words
 * @param {Set<string>} donor
 * @param {(x:number[])=>string} key
 */
function score(words, donor, key) {
  const byLength = {};
  let n5 = 0, m5 = 0, n7 = 0, m7 = 0, n8 = 0, m8 = 0;
  for (const word of words) {
    const hit = donor.has(key(word));
    const row = byLength[word.length] || { n: 0, matched: 0 };
    row.n++;
    row.matched += Number(hit);
    byLength[word.length] = row;
    if (word.length >= 5) { n5++; m5 += Number(hit); }
    if (word.length >= 7) { n7++; m7 += Number(hit); }
    if (word.length >= 8) { n8++; m8 += Number(hit); }
  }
  return { n5, m5, n7, m7, n8, m8, byLength };
}

/**
 * A valid nontrivial chart-row-preserving involution:
 * swap left/right mates for vertical rows 0..13; keep the unpaired row14 X.
 * @param {number} rune
 */
function toggleColumn(rune) {
  const row = chartRow(rune);
  if (row === 14) return 14;
  return rune < 15 ? 15 + row : row;
}

/** Exact-sequence positive. @param {number[]} word */
const sequencePlant = (word) => word.map(toggleColumn);

/**
 * Multiset-only positive: reverse positions and toggle the table side.
 * This is also an involution.
 * @param {number[]} word
 */
const multisetPlant = (word) => word.slice().reverse().map(toggleColumn);

const original = originalWords();
const corpora = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"]
].map(([name, file]) => [name, encodeTextWords(read(file))]);

assert.deepEqual(corpora.map(([name, words]) => [name, words.length]), [
  ["Shakespeare", 55407],
  ["Gibran", 15733],
  ["Emerson", 77932]
]);

const donors = corpora.flatMap(([, words]) => words);
assert.equal(donors.length, 149072);

const sequenceDonor = keySet(donors, rowSequenceKey);
const multisetDonor = keySet(donors, rowMultisetKey);
const sequenceScore = score(original, sequenceDonor, rowSequenceKey);
const multisetScore = score(original, multisetDonor, rowMultisetKey);

assert.deepEqual(
  [sequenceScore.n5, sequenceScore.m5, sequenceScore.n7, sequenceScore.m7],
  [1132, 1, 559, 0]
);
assert.deepEqual(
  [multisetScore.n5, multisetScore.m5,
    multisetScore.n7, multisetScore.m7,
    multisetScore.n8, multisetScore.m8],
  [1132, 69, 559, 5, 343, 0]
);

// Independent large lexicon sensitivity.
const dictionaryWords = read("resources/control/english_wordfreq_textblob.txt")
  .split("\n")
  .filter((line) => /^[a-z]+\s+\d+$/.test(line))
  .map((line) => encodeWord(line.split(/\s+/)[0])).filter(Boolean);
assert.equal(dictionaryWords.length, 29157);
const dictionarySequence = score(original,
  keySet(dictionaryWords, rowSequenceKey), rowSequenceKey);
const dictionaryMultiset = score(original,
  keySet(dictionaryWords, rowMultisetKey), rowMultisetKey);
assert.deepEqual(
  [dictionarySequence.n5, dictionarySequence.m5,
    dictionarySequence.n7, dictionarySequence.m7],
  [1132, 3, 559, 0]
);
assert.deepEqual(
  [dictionaryMultiset.n5, dictionaryMultiset.m5,
    dictionaryMultiset.n7, dictionaryMultiset.m7,
    dictionaryMultiset.n8, dictionaryMultiset.m8],
  [1132, 100, 559, 9, 343, 2]
);

// Leave-one-corpus-out calibration for the broader row-multiset invariant.
const expectedLeaveOneOut = new Map([
  ["Shakespeare", [16822, 12713, 6958, 3936]],
  ["Gibran", [4735, 4335, 1983, 1711]],
  ["Emerson", [26450, 18641, 12501, 6474]]
]);
const leaveOneOut = [];
for (let i = 0; i < corpora.length; i++) {
  const [name, held] = corpora[i];
  const donorWords = corpora.filter((_, j) => j !== i)
    .flatMap(([, words]) => words);
  const result = score(held, keySet(donorWords, rowMultisetKey),
    rowMultisetKey);
  const expected = expectedLeaveOneOut.get(name);
  assert.deepEqual([result.n5, result.m5, result.n7, result.m7], expected);
  leaveOneOut.push({ name, n5: result.n5, m5: result.m5,
    n7: result.n7, m7: result.m7 });
}


// Boundary-free full-row-tape invariant: arbitrary spaces and side changes.
function rowTapeStats(runes) {
  const rows = runes.map(chartRow);
  const counts = new Array(15).fill(0);
  let same = 0;
  for (let i = 0; i < rows.length; i++) {
    counts[rows[i]]++;
    if (i && rows[i] === rows[i - 1]) same++;
  }
  const ioc = counts.reduce((sum, n) => sum + n * (n - 1), 0)
    / (rows.length * (rows.length - 1));
  return { same, rate: same / (rows.length - 1), ioc };
}

const originalTape = original.flat();
const originalRowTape = rowTapeStats(originalTape);
assert.equal(originalRowTape.same, 538);
assert.ok(Math.abs(originalRowTape.rate - 0.041528367425704364) < 1e-15);
assert.ok(Math.abs(originalRowTape.ioc - 0.06767736514967561) < 1e-15);

const expectedRowWindows = new Map([
  ["Shakespeare", [5104, 40, 795, 0.06136626785025087, 0.1030028780127949]],
  ["Gibran", [5505, 9, 862, 0.06653801620995754, 0.1069235314633777]],
  ["Emerson", [5056, 61, 837, 0.06460825935932073, 0.10787511190385318]]
]);
const rowWindowBounds = [];
for (const [name, words] of corpora) {
  const runes = words.flat();
  const stride = Math.max(1, Math.floor((runes.length - originalTape.length) / 5000));
  let windows = 0;
  let minSame = Infinity;
  let minRate = Infinity;
  let minIoc = Infinity;
  for (let start = 0; start + originalTape.length <= runes.length; start += stride) {
    const stats = rowTapeStats(runes.slice(start, start + originalTape.length));
    windows++;
    minSame = Math.min(minSame, stats.same);
    minRate = Math.min(minRate, stats.rate);
    minIoc = Math.min(minIoc, stats.ioc);
  }
  const expected = expectedRowWindows.get(name);
  assert.equal(windows, expected[0]);
  assert.equal(stride, expected[1]);
  assert.equal(minSame, expected[2]);
  assert.ok(Math.abs(minRate - expected[3]) < 1e-15);
  assert.ok(Math.abs(minIoc - expected[4]) < 1e-15);
  assert.ok(originalRowTape.same < minSame);
  assert.ok(originalRowTape.ioc < minIoc);
  rowWindowBounds.push({ name, windows, stride, minSame, minRate, minIoc });
}

// Genuine creator-authentic p57 source spelling + reversible positives.
const reference = read("resources/liber-primus/lp1-plaintext-reference.txt");
const p57Text = reference.split("### 57\n")[1].trim();
const p57Words = encodeTextWords(p57Text);
assert.equal(p57Words.length, 20);
assert.deepEqual(p57Words.flat(), gp.pages.find((p) => p.page === 57).indices);

for (const word of p57Words) {
  const seqCipher = sequencePlant(word);
  assert.equal(rowSequenceKey(seqCipher), rowSequenceKey(word));
  assert.deepEqual(sequencePlant(seqCipher), word);

  const bagCipher = multisetPlant(word);
  assert.equal(rowMultisetKey(bagCipher), rowMultisetKey(word));
  assert.deepEqual(multisetPlant(bagCipher), word);
}

console.log(JSON.stringify({
  source: {
    words: original.length,
    runes: original.flat().length,
    donorWords: donors.length
  },
  exactRowSequence: {
    lengthAtLeast5: [sequenceScore.m5, sequenceScore.n5],
    lengthAtLeast7: [sequenceScore.m7, sequenceScore.n7]
  },
  rowMultiset: {
    lengthAtLeast5: [multisetScore.m5, multisetScore.n5],
    lengthAtLeast7: [multisetScore.m7, multisetScore.n7],
    lengthAtLeast8: [multisetScore.m8, multisetScore.n8]
  },
  textBlobSensitivity: {
    exactLengthAtLeast5: [dictionarySequence.m5, dictionarySequence.n5],
    bagLengthAtLeast5: [dictionaryMultiset.m5, dictionaryMultiset.n5],
    bagLengthAtLeast8: [dictionaryMultiset.m8, dictionaryMultiset.n8]
  },
  leaveOneOut,
  globalRowTape: {
    original: originalRowTape,
    controls: rowWindowBounds
  },
  positive: "p57 exact GP source + reversible vertical-row plants PASS"
}, null, 2));
