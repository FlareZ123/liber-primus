"use strict";

/**
 * Director #1686: fixed p50 solved-control output-grammar gate.
 *
 * Frozen address rule:
 *   whole solved word GP0 sum -> zero-based row-major p50 cell.
 *
 * Frozen numeric output family:
 *   (a) conventional base60 value
 *   (b) order-preserving base59 value with lowercase f removed.
 *
 * Frozen receiver semantics:
 *   1. output equals a GP0 sum present in the same solved section;
 *   2. output equals a GP0 sum present in the other solved section;
 *   3. output equals the GP0 sum of the immediate next solved word.
 *
 * p57 is the training section. Model selection is charged across both radices
 * and all three receiver semantics (six tried grammars). p56 is untouched
 * until after the training comparison.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const solved = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "external", "relikd-solved-gp29-native-v1.json"),
  "utf8"
));
const grid = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-grid-256.json"),
  "utf8"
));

const runeIndex = new Map(solved.runes.map((rune, index) => [rune, index]));
const transliteration = [
  "F", "U", "TH", "O", "R", "C", "G", "W", "H", "N",
  "I", "J", "EO", "P", "X", "S", "T", "B", "E", "M",
  "L", "NG", "OE", "D", "A", "AE", "Y", "IA", "EA"
];
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");
const cells = grid.pages.flatMap((page) => page.tokens);

assert.equal(alphabet60.length, 60);
assert.equal(alphabet59.length, 59);
assert.equal(cells.length, 256);
assert.ok(cells.every((token) => !token.includes("f")));

function parseRuneWords(text) {
  const words = [];
  let current = [];
  for (const ch of [...text]) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      current.push(value);
    } else if (current.length) {
      words.push(current);
      current = [];
    }
  }
  if (current.length) words.push(current);
  return words;
}

function gp0(word) {
  return word.reduce((sum, value) => sum + value, 0);
}

function spell(word) {
  return word.map((value) => transliteration[value]).join("");
}

function decodeToken(token, alphabet) {
  return alphabet.indexOf(token[0]) * alphabet.length + alphabet.indexOf(token[1]);
}

function sectionRows(name) {
  const section = solved.sections.find((candidate) => candidate.name === name);
  assert.ok(section);
  return parseRuneWords(section.source_text).map((word, index) => ({
    index: index + 1,
    word: spell(word),
    gp0: gp0(word)
  }));
}

function uniqueAddresses(rows) {
  const seen = new Set();
  return rows.filter((row) => {
    if (seen.has(row.gp0)) return false;
    seen.add(row.gp0);
    return true;
  });
}

function alphabetFor(base) {
  assert.ok(base === 59 || base === 60);
  return base === 60 ? alphabet60 : alphabet59;
}

function receiverStats(sourceRows, receiverRows, base) {
  const source = uniqueAddresses(sourceRows);
  const receiverSums = new Set(uniqueAddresses(receiverRows).map((row) => row.gp0));
  const alphabet = alphabetFor(base);
  const hits = source
    .map((row) => ({
      ...row,
      token: cells[row.gp0],
      value: decodeToken(cells[row.gp0], alphabet)
    }))
    .filter((row) => receiverSums.has(row.value));
  const tableSuccesses = cells
    .map((token) => decodeToken(token, alphabet))
    .filter((value) => receiverSums.has(value))
    .length;
  return {
    n: source.length,
    K: tableSuccesses,
    observed: hits.length,
    hits
  };
}

function nextWordHits(rows, base) {
  const alphabet = alphabetFor(base);
  const hits = [];
  for (let i = 0; i + 1 < rows.length; i += 1) {
    const current = rows[i];
    const next = rows[i + 1];
    const value = decodeToken(cells[current.gp0], alphabet);
    if (value === next.gp0) {
      hits.push({
        index: current.index,
        word: current.word,
        value,
        nextWord: next.word
      });
    }
  }
  return hits;
}

function choose(n, k) {
  if (k < 0 || k > n) return 0;
  const m = Math.min(k, n - k);
  let result = 1;
  for (let i = 1; i <= m; i += 1) {
    result *= (n - m + i) / i;
  }
  return result;
}

function hypergeometricUpperTail(N, K, n, observed) {
  const denominator = choose(N, n);
  let numerator = 0;
  for (let k = observed; k <= Math.min(K, n); k += 1) {
    numerator += choose(K, k) * choose(N - K, n - k);
  }
  return numerator / denominator;
}

const p56 = sectionRows("p56_an_end");
const p57 = sectionRows("p57_parable");

assert.equal(p56.length, 25);
assert.equal(uniqueAddresses(p56).length, 18);
assert.equal(p57.length, 20);
assert.equal(uniqueAddresses(p57).length, 17);

const training = {
  same60: receiverStats(p57, p57, 60),
  same59: receiverStats(p57, p57, 59),
  cross60: receiverStats(p57, p56, 60),
  cross59: receiverStats(p57, p56, 59),
  next60: nextWordHits(p57, 60),
  next59: nextWordHits(p57, 59)
};

assert.deepEqual(
  training.same60.hits.map((row) => [row.word, row.value]),
  [["PARABLE", 42], ["TUNNELNG", 56], ["CIRCUMFERENCES", 120]]
);
assert.deepEqual(
  training.same59.hits.map((row) => [row.word, row.value]),
  [["SHED", 120], ["WITHIN", 131]]
);
assert.deepEqual(
  training.cross60.hits.map((row) => [row.word, row.value]),
  [["PARABLE", 42], ["TUNNELNG", 56], ["TO", 33]]
);
assert.deepEqual(
  training.cross59.hits.map((row) => [row.word, row.value]),
  [["TO", 33]]
);
assert.equal(training.next60.length, 0);
assert.equal(training.next59.length, 0);

const trainingTests = [
  {
    name: "same-section/base60",
    p: hypergeometricUpperTail(256, training.same60.K, training.same60.n, training.same60.observed)
  },
  {
    name: "same-section/base59",
    p: hypergeometricUpperTail(256, training.same59.K, training.same59.n, training.same59.observed)
  },
  {
    name: "cross-section/base60",
    p: hypergeometricUpperTail(256, training.cross60.K, training.cross60.n, training.cross60.observed)
  },
  {
    name: "cross-section/base59",
    p: hypergeometricUpperTail(256, training.cross59.K, training.cross59.n, training.cross59.observed)
  },
  { name: "next-word/base60", p: 1 },
  { name: "next-word/base59", p: 1 }
];

const bestTraining = trainingTests.reduce((best, test) => test.p < best.p ? test : best);
const familywiseBonferroni = Math.min(1, bestTraining.p * trainingTests.length);

assert.equal(bestTraining.name, "same-section/base60");
assert.ok(Math.abs(bestTraining.p - 0.07940915368668736) < 1e-12);
assert.ok(Math.abs(familywiseBonferroni - 0.47645492212012414) < 1e-12);

// Freeze the best p57 training grammar before inspecting p56.
const holdoutSame60 = receiverStats(p56, p56, 60);
const holdoutSame60P = hypergeometricUpperTail(
  256,
  holdoutSame60.K,
  holdoutSame60.n,
  holdoutSame60.observed
);
const holdoutNext60 = nextWordHits(p56, 60);

assert.deepEqual(
  holdoutSame60.hits.map((row) => [row.word, row.value]),
  [["TO", 33], ["DUTY", 25], ["THIS", 25]]
);
assert.ok(Math.abs(holdoutSame60P - 0.12194452388557367) < 1e-12);
assert.equal(holdoutNext60.length, 0);

// Reverse training cannot select a radix: same-section base60/base59 tie 3-3.
const reverse60 = receiverStats(p56, p56, 60);
const reverse59 = receiverStats(p56, p56, 59);
assert.equal(reverse60.observed, 3);
assert.equal(reverse59.observed, 3);

// Cross-page receiver semantics reverses the preferred radix by direction:
// p56 -> p57 favors base59 (3 vs 2), while p57 -> p56 favors base60 (3 vs 1).
const p56To57_60 = receiverStats(p56, p57, 60);
const p56To57_59 = receiverStats(p56, p57, 59);
assert.equal(p56To57_60.observed, 2);
assert.equal(p56To57_59.observed, 3);
assert.deepEqual(
  p56To57_59.hits.map((row) => [row.word, row.value]),
  [["WITHIN", 131], ["DUTY", 25], ["THIS", 25]]
);
assert.equal(training.cross60.observed, 3);
assert.equal(training.cross59.observed, 1);

// The strongest named cross-page edge is therefore not predicted by the
// p57-selected base60 grammar.
assert.ok(!p56To57_60.hits.some((row) => row.word === "WITHIN"));
assert.ok(p56To57_59.hits.some((row) => row.word === "WITHIN" && row.value === 131));

const summary = {
  training: {
    section: "p57_parable",
    models: trainingTests,
    best: bestTraining,
    familywiseBonferroni
  },
  holdout: {
    section: "p56_an_end",
    frozenGrammar: bestTraining.name,
    sameSectionHits: holdoutSame60.observed,
    sameSectionP: holdoutSame60P,
    immediateNextWordHits: holdoutNext60.length
  },
  reverseTraining: {
    base60Hits: reverse60.observed,
    base59Hits: reverse59.observed
  },
  crossSection: {
    p56ToP57: { base60Hits: p56To57_60.observed, base59Hits: p56To57_59.observed },
    p57ToP56: { base60Hits: training.cross60.observed, base59Hits: training.cross59.observed }
  },
  decision: "No fixed numeric p50 output grammar survives solved-control selection and holdout; do not blind-test unknown LP2 under Director #1686."
};

console.log(JSON.stringify(summary, null, 2));
