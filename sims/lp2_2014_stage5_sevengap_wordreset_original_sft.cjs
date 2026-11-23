"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const transcript = fs.readFileSync(path.join(ROOT, "resources", "liber-primus", "lp2-transcription.txt"), "utf8");
const runeAlphabet = new Map(corpus.runes.map((r, i) => [r, i]));
const physicalPages = corpus.pages.filter((p) => p.page <= 55);
const originalIndices = physicalPages.flatMap((p) => p.indices);
const chapterPageStarts = [0, 3, 8, 15, 23, 27, 33, 40, 54, 56];
const historicalPermutation = [0, 6, 2, 5, 1, 4, 3];
const inversePermutation = [0, 4, 2, 6, 5, 3, 1];
const keys = {
  circumference: [0, 10, 4, 0, 1, 19, 0, 18, 4, 18, 9, 0, 18],
  divinity: [23, 10, 1, 10, 9, 10, 16, 26]
};

/**
 * Parse original physical rune and between-rune punctuation channels.
 * Page marks and manuscript line wraps do not interrupt complete words.
 * @param {string} raw source transcription
 * @returns {{indices:number[], gaps:string[], tail:string, pages:number[]}}
 */
function parseTape(raw) {
  const indices = [];
  const pages = [];
  const gaps = [];
  let pending = "";
  let currentPage = 0;
  for (const ch of raw) {
    if (runeAlphabet.has(ch)) {
      if (indices.length) gaps.push(pending);
      pending = "";
      indices.push(runeAlphabet.get(ch));
      pages.push(currentPage);
    } else if (ch === "%") {
      currentPage++;
    } else if (ch !== "/" && !/\s/u.test(ch)) {
      pending += ch;
    }
  }
  assert.equal(gaps.length, indices.length - 1);
  return { indices, gaps, tail: pending, pages };
}

/**
 * Apply the exact 2014 seven-column stage permutation to between-rune gaps.
 * Trailing incomplete seven-gap groups and the last gap of each chapter stay
 * in place, so the operation is a bijection of printed punctuation slots.
 * @param {string[]} sourceGaps original gap identities, including empty gaps
 * @param {number[]} permutation seven source indices
 * @param {number[]} bounds source-authentic chapter boundaries in rune offsets
 * @returns {string[]} reordered gap identities
 */
function permuteGaps(sourceGaps, permutation, bounds) {
  const out = sourceGaps.slice();
  for (let k = 0; k < bounds.length - 1; k++) {
    const start = bounds[k];
    const finish = bounds[k + 1] - 1;
    for (let i = start; i + 7 <= finish; i += 7) {
      for (let j = 0; j < 7; j++) {
        out[i + j] = sourceGaps[i + permutation[j]];
      }
    }
  }
  return out;
}

/**
 * Reversible GP29 word-local additive transformation, phase zero after
 * each decoded printed word break. A fixed word-local key clock is only a
 * candidate LP2 transfer of two historically authenticated LP1 keys.
 * @param {number[]} indices input rune indices
 * @param {string[]} gaps output-of-gap-transducer punctuation slots
 * @param {number[]} key GP29 historical key
 * @param {number} sign +1 or -1
 * @returns {number[]} shifted GP29 indices
 */
function wordShift(indices, gaps, key, sign) {
  let phase = 0;
  return indices.map((c, i) => {
    const out = (c + sign * key[phase] + 29) % 29;
    phase = gaps[i] ? 0 : (phase + 1) % key.length;
    return out;
  });
}

/** @param {number[]} input GP29 values @returns {number} IoC */
function ioc(input) {
  const counts = Array(29).fill(0);
  for (const x of input) counts[x]++;
  return counts.reduce((n, count) => n + count * (count - 1), 0)
    / (input.length * (input.length - 1));
}

/**
 * Count only complete source-word slots wholly contained in a target range.
 * @param {number[]} indices full source GP values
 * @param {string[]} gaps between-rune separators
 * @param {number} lo inclusive rune position
 * @param {number} hi exclusive rune position
 */
function sourceWords(indices, gaps, lo, hi) {
  const lengths = [];
  const singletonValues = [];
  let start = 0;
  for (let i = 0; i < indices.length; i++) {
    if (i === indices.length - 1 || gaps[i]) {
      if (start >= lo && i + 1 <= hi) {
        const length = i + 1 - start;
        lengths.push(length);
        if (length === 1) singletonValues.push(indices[start]);
      }
      start = i + 1;
    }
  }
  return { words: lengths.length, singleton: singletonValues.length,
    singletonAlphabet: new Set(singletonValues).size, lengths };
}

/** @param {number[]} lengths source word lengths @returns {number} */
function wordLengthMI(lengths) {
  const hist = Array.from({ length: 9 }, () => Array(9).fill(0));
  const left = Array(9).fill(0);
  const right = Array(9).fill(0);
  const n = lengths.length - 1;
  for (let i = 0; i < n; i++) {
    const a = Math.min(lengths[i], 9) - 1;
    const b = Math.min(lengths[i + 1], 9) - 1;
    hist[a][b]++;
    left[a]++;
    right[b]++;
  }
  let mi = 0;
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const v = hist[i][j];
      if (v) mi += v / n * Math.log(v * n / (left[i] * right[j]));
    }
  }
  return mi;
}

function historicalStage5Positive() {
  const grouped = [
    "TL BE IE OV UT HT RE ID TS EO ST PO SO YR",
    "SL BT II IY T4 DG UQ IM NU 44 2I 15 33 9M"
  ].join(" ").replace(/\s+/gu, "");
  assert.equal(grouped.length, 56);
  let solved = "";
  for (let i = 0; i < grouped.length; i += 7) {
    for (const p of historicalPermutation) solved += grouped[i + p];
  }
  assert.equal(solved, "TOBELIEVETRUTHISTODESTROYPOSSIBILITYQ4UTGDI2N4M4UIM59133");
  return solved;
}

function main() {
  assert.equal(corpus.pages.length, 58);
  assert.equal(originalIndices.length, 12956);
  assert.equal(physicalPages.filter((p) => p.indices.length > 0).length, 55);
  assert.equal(corpus.pages.find((p) => p.page === 50).indices.length, 0);
  const src = parseTape(transcript.split("%").slice(0, 55).join("%"));
  assert.deepEqual(src.indices, originalIndices);
  assert.equal(src.gaps.filter(Boolean).length, 2895);
  assert.equal(src.tail, ".&$");
  const chapters = chapterPageStarts.map((p) => physicalPages
    .filter((part) => part.page < p)
    .reduce((sum, part) => sum + part.indices.length, 0));
  assert.deepEqual(chapters, [0,729,1874,3603,5506,6527,7960,9640,12648,12956]);
  assert.deepEqual(historicalPermutation.map((n) => inversePermutation[n]),
    [0,1,2,3,4,5,6]);
  let crossPageWords = 0;
  let first = 0;
  for (let i = 0; i < src.indices.length; i++) {
    if (i === src.indices.length - 1 || src.gaps[i]) {
      if (src.pages[first] !== src.pages[i]) crossPageWords++;
      first = i + 1;
    }
  }
  assert.equal(crossPageWords, 32);
  const originalWords = sourceWords(src.indices, src.gaps, 0, src.indices.length);
  assert.equal(originalWords.words, 2896);
  assert.equal(originalWords.singleton, 83);

  const knownSource = historicalStage5Positive();
  const solved = parseTape(transcript.split("%")[56]);
  const native = corpus.pages.find((p) => p.page === 57).indices;
  assert.deepEqual(solved.indices, native);
  assert.equal(native.length, 95);
  assert.ok(ioc(native) > 0.06);
  const positiveBounds = [0, native.length];
  const scopes = {
    p16to21: [physicalPages.filter((p) => p.page < 16)
      .reduce((n, p) => n + p.indices.length, 0),
      physicalPages.filter((p) => p.page < 22)
        .reduce((n, p) => n + p.indices.length, 0)],
    p40to53: [chapters[7], chapters[8]]
  };
  assert.deepEqual(scopes, { p16to21: [3762,5375], p40to53: [9640,12648] });

  const results = {};
  for (const [direction, permutation, undo] of [
    ["stage5", historicalPermutation, inversePermutation],
    ["inverseStage5", inversePermutation, historicalPermutation]
  ]) {
    const transformedGaps = permuteGaps(src.gaps, permutation, chapters);
    assert.deepEqual(permuteGaps(transformedGaps, undo, chapters), src.gaps);
    const transformedWords = sourceWords(src.indices, transformedGaps, 0, src.indices.length);
    assert.equal(transformedWords.words, 2896);
    assert.equal(transformedGaps.filter(Boolean).length, 2895);
    if (direction === "stage5") assert.equal(transformedWords.singleton, 587);
    else assert.equal(transformedWords.singleton, 457);

    const geometry = Object.fromEntries(Object.entries(scopes).map(([name, ends]) => {
      const original = sourceWords(src.indices, src.gaps, ...ends);
      const changed = sourceWords(src.indices, transformedGaps, ...ends);
      return [name, { originalWords: original.words, originalSingleton: original.singleton,
        transformedWords: changed.words, transformedSingleton: changed.singleton,
        singletonAlphabet: changed.singletonAlphabet }];
    }));
    results[direction] = {
      wholeWords: transformedWords.words,
      oneRuneWords: transformedWords.singleton,
      wordLengthMI: wordLengthMI(transformedWords.lengths),
      geometry,
      inverses: {}
    };
    for (const [keyName, key] of Object.entries(keys)) {
      for (const sign of [-1, 1]) {
        const candidate = wordShift(src.indices, transformedGaps, key, sign);
        assert.deepEqual(wordShift(candidate, transformedGaps, key, -sign), src.indices);
        const nativeCipher = wordShift(native, solved.gaps, key, -sign);
        const plantedGaps = permuteGaps(solved.gaps, undo, positiveBounds);
        const recoveredGaps = permuteGaps(plantedGaps, permutation, positiveBounds);
        assert.deepEqual(recoveredGaps, solved.gaps);
        const nativeRecovered = wordShift(nativeCipher, recoveredGaps, key, sign);
        assert.deepEqual(nativeRecovered, native);
        assert.deepEqual(wordShift(nativeRecovered, recoveredGaps, key, -sign), nativeCipher);
        const otherKey = keys[keyName === "circumference" ? "divinity" : "circumference"];
        assert.notDeepEqual(wordShift(nativeCipher, recoveredGaps, otherKey, sign), native);
        const diagnostics = {};
        for (const [scopeName, ends] of Object.entries(scopes)) {
          const sample = candidate.slice(ends[0], ends[1]);
          const score = ioc(sample);
          assert.ok(score < 0.04 && score > 0.03);
          diagnostics[scopeName] = {
            runes: sample.length,
            ioc: Number(score.toFixed(12)),
            firstGP: sample.slice(0, 25).map((v) => corpus.translit[v]).join(" ")
          };
        }
        results[direction].inverses[keyName + (sign === -1 ? "Minus" : "Plus")] = diagnostics;
      }
    }
  }
  assert.equal(results.stage5.geometry.p16to21.transformedSingleton, 79);
  assert.equal(results.stage5.geometry.p40to53.transformedSingleton, 140);
  assert.equal(results.inverseStage5.geometry.p16to21.transformedSingleton, 62);
  assert.equal(results.inverseStage5.geometry.p40to53.transformedSingleton, 96);
  console.log(JSON.stringify({
    status: "PASS",
    historical2014Positive: knownSource,
    exactOriginal: { runes: 12956, words: 2896, gapMarks: 2896,
      originalOneRuneWords: 83, originalWordLengthMI: wordLengthMI(originalWords.lengths),
      pageCarryWords: crossPageWords, chapterStarts: chapters },
    authenticSolvedP57Controls: { runes: native.length, nativeIoC: ioc(native), modelsRecovered: 8 },
    rawIoC: Object.fromEntries(Object.entries(scopes)
      .map(([name, ends]) => [name, ioc(src.indices.slice(...ends))])),
    results, decision: "No unknown original plaintext or source-selected LP2 decoder"
  }, null, 2));
}

main();
