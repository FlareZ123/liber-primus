"use strict";

/*
 * Agent1 / Issue #1932 — finite source-selected p33 THEIR RISE gate.
 *
 * Tests exactly three preregistered reversible H alignments between the two
 * original p33 body blocks. The lower-minus-upper channel is the only
 * plaintext candidate. The sum channel is retained solely for inversion.
 *
 * No key search, sign reversal, phase search, word permutation, or extra
 * cipher layer is performed. Exact inversion is an implementation invariant,
 * not evidence of a historical cipher.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");

const root = path.resolve(__dirname, "..");
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}
function sha256(relative) {
  return createHash("sha256").update(fs.readFileSync(path.join(root, relative))).digest("hex");
}
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const parts = transcription.split(/^\s*%\s*$/m);
const runeIndex = new Map(corpus.runes.map((rune, value) => [rune, value]));
const mod29 = value => ((value % 29) + 29) % 29;

function runeValues(text) {
  return [...text].map(character => runeIndex.get(character))
    .filter(value => value !== undefined);
}

/*
 * Match the repository's canonical word parser: hyphen and period delimit
 * words; line slashes and page/section markers do not.
 */
function parseCanonicalWords(text) {
  const words = [];
  let runes = 0;
  let start = 0;
  let current = [];
  function flush() {
    if (current.length === 0) return;
    words.push({ start, end: start + current.length, values: current });
    current = [];
  }
  for (const character of [...text]) {
    const value = runeIndex.get(character);
    if (value !== undefined) {
      if (current.length === 0) start = runes;
      current.push(value);
      runes += 1;
    } else if (character === "-" || character === ".") {
      flush();
    }
  }
  flush();
  return words;
}

function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

function pageData(page) {
  const part = physicalPart(page);
  const full = runeValues(part);
  const canonical = corpus.pages.find(row => row.page === page);
  assert.ok(canonical, "missing canonical page " + page);
  assert.deepEqual(full, canonical.indices, "transcription/corpus mismatch on p" + page);

  const annotations = ink.pages.find(row => row.page === page);
  assert.ok(annotations, "missing ink annotations on p" + page);
  assert.equal(annotations.red_spans.length, 2, "expected two source headings on p" + page);
  const [first, second] = annotations.red_spans;
  const upperStart = first.start + first.length;
  const upperEnd = second.start;
  const lowerStart = second.start + second.length;
  const lowerEnd = full.length;
  assert.ok(upperStart <= upperEnd && lowerStart <= lowerEnd);

  let offset = 0;
  const lineRows = part.split(/\n/u)
    .filter(line => /[\u16A0-\u16FF]/u.test(line))
    .map((line, index) => {
      const values = runeValues(line);
      const row = { line: index + 1, start: offset, end: offset + values.length, values };
      offset = row.end;
      return row;
    });
  assert.equal(offset, full.length, "line parser must preserve every rune");

  function sliceLines(start, end) {
    return lineRows
      .filter(row => row.start < end && row.end > start)
      .map(row => {
        const lo = Math.max(0, start - row.start);
        const hi = Math.min(row.values.length, end - row.start);
        return {
          line: row.line,
          start: Math.max(row.start, start) - start,
          values: row.values.slice(lo, hi),
        };
      });
  }

  const allWords = parseCanonicalWords(part);
  const upperWords = allWords
    .filter(word => word.start >= upperStart && word.end <= upperEnd)
    .map(word => ({ ...word, start: word.start - upperStart, end: word.end - upperStart }));
  const lowerWords = allWords
    .filter(word => word.start >= lowerStart && word.end <= lowerEnd)
    .map(word => ({ ...word, start: word.start - lowerStart, end: word.end - lowerStart }));

  return {
    page, full, annotations,
    upperStart, upperEnd, lowerStart, lowerEnd,
    upper: full.slice(upperStart, upperEnd),
    lower: full.slice(lowerStart, lowerEnd),
    upperLines: sliceLines(upperStart, upperEnd),
    lowerLines: sliceLines(lowerStart, lowerEnd),
    upperWords, lowerWords,
  };
}

/* H(lower, upper) = (lower-upper, lower+upper) mod29. */
function H(lower, upper) {
  return [mod29(lower - upper), mod29(lower + upper)];
}
/* Inverse returns [lower, upper]. */
function Hinv(difference, sum) {
  return [
    mod29((difference + sum) * 15),
    mod29((sum - difference) * 15),
  ];
}

function transform(data, alignment) {
  const differences = [];
  const sums = [];
  const pairs = [];

  function add(upperIndex, lowerIndex, upperValue, lowerValue, coordinate) {
    const [difference, sum] = H(lowerValue, upperValue);
    differences.push(difference);
    sums.push(sum);
    pairs.push({
      upperIndex, lowerIndex, upperValue, lowerValue,
      difference, sum, coordinate,
    });
  }

  if (alignment === "flat-body") {
    for (let index = 0; index < Math.min(data.upper.length, data.lower.length); index += 1) {
      add(index, index, data.upper[index], data.lower[index], [index]);
    }
  } else if (alignment === "printed-line") {
    const count = Math.min(data.upperLines.length, data.lowerLines.length);
    for (let row = 0; row < count; row += 1) {
      const upper = data.upperLines[row];
      const lower = data.lowerLines[row];
      const width = Math.min(upper.values.length, lower.values.length);
      for (let column = 0; column < width; column += 1) {
        add(
          upper.start + column,
          lower.start + column,
          upper.values[column],
          lower.values[column],
          [row + 1, column + 1],
        );
      }
    }
  } else if (alignment === "canonical-word") {
    const count = Math.min(data.upperWords.length, data.lowerWords.length);
    for (let word = 0; word < count; word += 1) {
      const upper = data.upperWords[word];
      const lower = data.lowerWords[word];
      const width = Math.min(upper.values.length, lower.values.length);
      for (let within = 0; within < width; within += 1) {
        add(
          upper.start + within,
          lower.start + within,
          upper.values[within],
          lower.values[within],
          [word + 1, within + 1],
        );
      }
    }
  } else {
    throw new Error("unregistered alignment: " + alignment);
  }

  /*
   * Reconstruct both complete source bodies. Any unmatched rune remains
   * unchanged; every paired rune is recovered from (difference,sum).
   */
  const recoveredUpper = [...data.upper];
  const recoveredLower = [...data.lower];
  for (const pair of pairs) {
    const [lowerValue, upperValue] = Hinv(pair.difference, pair.sum);
    recoveredLower[pair.lowerIndex] = lowerValue;
    recoveredUpper[pair.upperIndex] = upperValue;
  }
  assert.deepEqual(recoveredUpper, data.upper, alignment + " upper inverse");
  assert.deepEqual(recoveredLower, data.lower, alignment + " lower inverse");

  return { alignment, differences, sums, pairs, roundTrip: true };
}

const training = solved.sections
  .filter(section => section.name !== "p56_an_end")
  .map(section => runeValues(section.source_text));
const N = 29;
const alpha = 0.1;
const trigramCounts = new Map();
let trigramTotal = 0;
for (const values of training) {
  for (let index = 0; index + 2 < values.length; index += 1) {
    const key = values[index] * N * N + values[index + 1] * N + values[index + 2];
    trigramCounts.set(key, (trigramCounts.get(key) || 0) + 1);
    trigramTotal += 1;
  }
}
const denominator = trigramTotal + alpha * N * N * N;
const unseenLog = Math.log(alpha / denominator);

function trigramScore(values) {
  if (values.length < 3) return null;
  let score = 0;
  let count = 0;
  for (let index = 0; index + 2 < values.length; index += 1) {
    const key = values[index] * N * N + values[index + 1] * N + values[index + 2];
    const hits = trigramCounts.get(key) || 0;
    score += hits ? Math.log((hits + alpha) / denominator) : unseenLog;
    count += 1;
  }
  return score / count;
}

function preview(values, limit = 48) {
  return values.slice(0, limit).map(value => corpus.translit[value]).join(" ");
}

function summarize(data) {
  const raw = {
    upper: trigramScore(data.upper),
    lower: trigramScore(data.lower),
  };
  const methods = {};
  for (const alignment of ["flat-body", "printed-line", "canonical-word"]) {
    const result = transform(data, alignment);
    const cut = Math.floor(result.differences.length * 2 / 3);
    methods[alignment] = {
      pairedRunes: result.pairs.length,
      differenceRunes: result.differences.length,
      roundTrip: result.roundTrip,
      differenceScore: trigramScore(result.differences),
      prefixScore: trigramScore(result.differences.slice(0, cut)),
      withheldSuffixScore: trigramScore(result.differences.slice(cut)),
      differencePreview: preview(result.differences),
      sumScore: trigramScore(result.sums),
      sumPreview: preview(result.sums, 24),
    };
  }
  return {
    page: data.page,
    upperRunes: data.upper.length,
    lowerRunes: data.lower.length,
    upperLineLengths: data.upperLines.map(line => line.values.length),
    lowerLineLengths: data.lowerLines.map(line => line.values.length),
    upperWords: data.upperWords.length,
    lowerWords: data.lowerWords.length,
    raw,
    methods,
  };
}

const p3 = pageData(3);
const p15 = pageData(15);
const p33 = pageData(33);

assert.deepEqual(
  p33.annotations.red_spans.map(span => [span.start, span.length]),
  [[0, 10], [91, 8]],
);
assert.equal(p33.upper.length, 81);
assert.equal(p33.lower.length, 115);
assert.deepEqual(p33.upperLines.map(line => line.values.length), [8, 16, 18, 23, 16]);
assert.deepEqual(p33.lowerLines.map(line => line.values.length), [11, 18, 18, 22, 22, 24]);
assert.equal(p33.upperWords.length, 21);
assert.equal(p33.lowerWords.length, 28);

assert.equal(p3.upper.length, 103);
assert.equal(p3.lower.length, 95);
assert.equal(p3.upperWords.length, 19);
assert.equal(p3.lowerWords.length, 21);
assert.equal(p15.upper.length, 0);
assert.equal(p15.lower.length, 139);
assert.equal(p15.upperWords.length, 0);
assert.equal(p15.lowerWords.length, 32);

const longSolvedScores = training
  .filter(values => values.length >= 50)
  .map(trigramScore);
const solvedRange = {
  min: Math.min(...longSolvedScores),
  max: Math.max(...longSolvedScores),
};
const p56Plain = runeValues(solved.sections.find(section => section.name === "p56_an_end").source_text);
const p57Plain = runeValues(solved.sections.find(section => section.name === "p57_parable").source_text);
const p56Score = trigramScore(p56Plain);
const p57Score = trigramScore(p57Plain);

const results = [p3, p15, p33].map(summarize);
const target = results.find(result => result.page === 33);
const targetScores = Object.values(target.methods).map(method => method.differenceScore);
const targetPrefixScores = Object.values(target.methods).map(method => method.prefixScore);
const targetSuffixScores = Object.values(target.methods).map(method => method.withheldSuffixScore);
const targetSumScores = Object.values(target.methods).map(method => method.sumScore);
const bestDifferenceScore = Math.max(...targetScores);
const bestPrefixScore = Math.max(...targetPrefixScores);
const bestSuffixScore = Math.max(...targetSuffixScores);
const bestSumScore = Math.max(...targetSumScores);

assert.deepEqual(
  Object.values(target.methods).map(method => method.pairedRunes),
  [81, 80, 61],
);
assert.ok(Object.values(target.methods).every(method => method.roundTrip));
assert.ok(bestDifferenceScore < solvedRange.min);
assert.ok(bestPrefixScore < solvedRange.min);
assert.ok(bestSuffixScore < solvedRange.min);
assert.ok(bestSumScore < solvedRange.min);
assert.ok(bestDifferenceScore < p56Score - 1.0);
assert.ok(bestDifferenceScore < p57Score - 2.0);

const output = {
  status: "PASS",
  classification: "bounded negative: no p33 plaintext/key from the three frozen THEIR RISE H alignments",
  source: {
    physicalPage: 33,
    originalImage: "resources/liber-primus/50.jpg (archive index 50 = LP2 p33)",
    originalImageSha256: sha256("resources/liber-primus/50.jpg"),
    upperHeading: [0, 10],
    upperBody: [10, 91],
    lowerHeading: [91, 99],
    lowerBody: [99, 214],
    H: "H(lower,upper)=(lower-upper,lower+upper) mod29",
  },
  calibration: {
    longSolvedSections: longSolvedScores.length,
    longSolvedScoreRange: solvedRange,
    heldOutSolvedP56Score: p56Score,
    solvedP57Score: p57Score,
    note: "Trigram scores are diagnostics, not a cipher selector; exact inverse is only an implementation invariant.",
  },
  bestP33DifferenceScore: bestDifferenceScore,
  bestP33PrefixScore: bestPrefixScore,
  bestP33WithheldSuffixScore: bestSuffixScore,
  bestP33SumChannelScore: bestSumScore,
  results,
};

console.log(JSON.stringify(output, null, 2));
