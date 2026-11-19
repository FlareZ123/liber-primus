"use strict";

/**
 * Director #1743: source-only p50 literal-token grammar gate.
 *
 * Uses only:
 * - exact p50 token tape;
 * - authenticated 2016 signed words;
 * - solved p56 and p57 plaintext;
 * - GP0 -> zero-based p50 addressing.
 *
 * Unknown-page ciphertext/plaintext is deliberately absent.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const signedSource = read("resources/historical/cicada2016-4gq25-outguess.asc");

const tape = grid.pages.flatMap((page) => page.tokens);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const oneLetter = new Map(
  corpus.translit
    .map((symbol, index) => [symbol.toUpperCase(), index])
    .filter(([symbol]) => symbol.length === 1)
);
const gpTokens = corpus.translit
  .map((symbol, index) => ({ symbol: symbol.toUpperCase(), index }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} word @returns {number[]} */
function gpWord(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const values = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      values.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      values.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling at " + normalized.slice(offset));
    values.push(token.index);
    offset += token.symbol.length;
  }
  return values;
}

/** @returns {{label:string, values:number[]}[]} */
function signedWords() {
  const clear = signedSource
    .split("-----BEGIN PGP SIGNATURE-----")[0]
    .split(/\r?\n\r?\n/)
    .slice(1)
    .join("\n");

  return clear
    .split(/[^A-Za-z0-9]+/)
    .filter((token) => /^[A-Za-z]+$/.test(token))
    .map((word) => ({ label: word.toUpperCase(), values: gpWord(word) }));
}

/** @param {string} text @returns {{label:string, values:number[]}[]} */
function runeWords(text) {
  const words = [];
  let current = [];

  for (const char of [...text]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      current.push(value);
    } else if (current.length) {
      words.push({
        label: current.map((item) => corpus.translit[item]).join(""),
        values: current,
      });
      current = [];
    }
  }
  if (current.length) {
    words.push({
      label: current.map((item) => corpus.translit[item]).join(""),
      values: current,
    });
  }
  return words;
}

/** @param {number[]} values @returns {number} */
function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

/**
 * @param {{label:string, values:number[]}[]} words
 * @returns {Array<object>}
 */
function records(words) {
  return words
    .map((word, index) => ({
      index,
      word,
      prev: index > 0 ? words[index - 1] : null,
      current: word,
      next: index + 1 < words.length ? words[index + 1] : null,
      address: sum(word.values),
    }))
    .filter((record) => record.address < 256);
}

/** @param {string} token @returns {{digit:number, rune:number}|null} */
function parseToken(token) {
  if (!/^\d[A-Za-z]$/.test(token)) return null;
  const digit = Number(token[0]);
  const rune = oneLetter.get(token[1].toUpperCase());
  return rune === undefined ? null : { digit, rune };
}

/**
 * @param {object} record
 * @param {string} token
 * @param {object} rule
 * @returns {boolean}
 */
function matches(record, token, rule) {
  const parsed = parseToken(token);
  const target = record[rule.scope];
  if (!parsed || !target) return false;

  const { digit, rune } = parsed;
  const values = target.values;

  if (rule.kind === "count") {
    return values.filter((value) => value === rune).length === digit;
  }
  if (rule.kind === "position") {
    const index = rule.origin === 0 ? digit : digit - 1;
    return index >= 0 && index < values.length && values[index] === rune;
  }
  if (rule.kind === "length-endpoint") {
    if (values.length !== digit) return false;
    const index = rule.endpoint === "first" ? 0 : values.length - 1;
    return values[index] === rune;
  }
  throw new Error("unknown rule");
}

/**
 * @param {Array<object>} sourceRecords
 * @param {object} rule
 * @param {string[]} tokens
 * @returns {{hits:number, positiveHits:number, details:Array<object>}}
 */
function score(sourceRecords, rule, tokens) {
  let hits = 0;
  let positiveHits = 0;
  const details = [];

  for (const record of sourceRecords) {
    const token = tokens[record.address];
    if (!matches(record, token, rule)) continue;
    hits += 1;
    if (Number(token[0]) > 0) positiveHits += 1;
    details.push({
      index: record.index,
      word: record.word.label,
      target: record[rule.scope].label,
      address: record.address,
      token,
    });
  }
  return { hits, positiveHits, details };
}

/** @param {string[]} source @param {number} shift @returns {string[]} */
function rotate(source, shift) {
  return source.map((_, index) => source[(index + shift) % source.length]);
}

/**
 * @param {Array<object>} sourceRecords
 * @param {object} rule
 * @returns {{observed:number, mean:number, max:number, tailCount:number, tail:number}}
 */
function cyclicStats(sourceRecords, rule) {
  const observed = score(sourceRecords, rule, tape).hits;
  const nullScores = [];
  for (let shift = 0; shift < tape.length; shift += 1) {
    nullScores.push(score(sourceRecords, rule, rotate(tape, shift)).hits);
  }
  const tailCount = nullScores.filter((value) => value >= observed).length;
  return {
    observed,
    mean: nullScores.reduce((a, b) => a + b, 0) / nullScores.length,
    max: Math.max(...nullScores),
    tailCount,
    tail: tailCount / nullScores.length,
  };
}

/** @param {number} seed @returns {() => number} */
function makeRng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/**
 * @param {string[]} source
 * @param {() => number} random
 * @returns {string[]}
 */
function shuffled(source, random) {
  const result = source.slice();
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

assert.equal(tape.length, 256);
assert.equal(grid.alphabet.length, 60);

const p56 = solved.sections.find((section) => section.name === "p56_an_end");
const p57 = solved.sections.find((section) => section.name === "p57_parable");
assert.ok(p56);
assert.ok(p57);

const corpora = {
  signed: signedWords(),
  p56: runeWords(p56.source_text),
  p57: runeWords(p57.source_text),
};
assert.equal(corpora.signed.length, 43);
assert.equal(corpora.p56.length, 25);
assert.equal(corpora.p57.length, 20);

const sourceRecords = Object.fromEntries(
  Object.entries(corpora).map(([name, words]) => [name, records(words)])
);

const rules = [];
for (const scope of ["prev", "current", "next"]) {
  rules.push({ name: "count_" + scope, kind: "count", scope });
}
for (const scope of ["prev", "current", "next"]) {
  for (const origin of [0, 1]) {
    rules.push({
      name: "pos" + origin + "_" + scope,
      kind: "position",
      scope,
      origin,
    });
  }
}
for (const scope of ["prev", "current", "next"]) {
  for (const endpoint of ["first", "last"]) {
    rules.push({
      name: "len_" + scope + "_" + endpoint,
      kind: "length-endpoint",
      scope,
      endpoint,
    });
  }
}
assert.equal(rules.length, 15);

const ruleByName = new Map(rules.map((rule) => [rule.name, rule]));

// The obvious target-specific literal reading is already non-exceptional.
const countNext = ruleByName.get("count_next");
assert.ok(countNext);
assert.deepEqual(
  score(sourceRecords.signed, countNext, tape).details.map((hit) => [
    hit.word,
    hit.target,
    hit.token,
  ]),
  [
    ["DEVOTED", "LIBER", "0W"],
    ["ITS", "WORDS", "1O"],
    ["YOU", "WILL", "2L"],
    ["FOUND", "GOOD", "0s"],
    ["GOOD", "LUCK", "0d"],
  ]
);
assert.equal(cyclicStats(sourceRecords.signed, countNext).tailCount, 199);
assert.equal(cyclicStats(sourceRecords.p56, countNext).tailCount, 104);
assert.equal(cyclicStats(sourceRecords.p57, countNext).tailCount, 13);

// Leave one corpus out. Selection is by smallest cyclic tail, then most hits.
const folds = {};
for (const heldout of Object.keys(sourceRecords)) {
  const trainNames = Object.keys(sourceRecords).filter((name) => name !== heldout);
  const training = trainNames.flatMap((name) => sourceRecords[name]);

  const ranked = rules
    .map((rule) => ({ rule, stats: cyclicStats(training, rule) }))
    .sort((left, right) =>
      left.stats.tail - right.stats.tail ||
      right.stats.observed - left.stats.observed
    );

  const selected = ranked[0].rule;
  folds[heldout] = {
    trainNames,
    selected: selected.name,
    training: ranked[0].stats,
    heldout: cyclicStats(sourceRecords[heldout], selected),
    heldoutScore: score(sourceRecords[heldout], selected, tape),
  };
}

assert.equal(folds.signed.selected, "pos0_next");
assert.equal(folds.signed.training.observed, 3);
assert.equal(folds.signed.training.tailCount, 26);
assert.equal(folds.signed.heldout.observed, 2);
assert.equal(folds.signed.heldout.tailCount, 81);
assert.equal(folds.signed.heldoutScore.positiveHits, 2);

assert.equal(folds.p56.selected, "pos1_prev");
assert.equal(folds.p56.training.observed, 5);
assert.equal(folds.p56.training.tailCount, 3);
assert.equal(folds.p56.heldout.observed, 0);
assert.equal(folds.p56.heldout.tailCount, 256);

assert.equal(folds.p57.selected, "pos1_current");
assert.equal(folds.p57.training.observed, 7);
assert.equal(folds.p57.training.tailCount, 5);
assert.equal(folds.p57.heldout.observed, 0);
assert.equal(folds.p57.heldout.tailCount, 256);

// Deterministic exact-token-multiset permutations.
const selectedByHeldout = {
  signed: ruleByName.get("pos0_next"),
  p56: ruleByName.get("pos1_prev"),
  p57: ruleByName.get("pos1_current"),
};
const observedByHeldout = Object.fromEntries(
  Object.entries(selectedByHeldout).map(([name, rule]) => [
    name,
    score(sourceRecords[name], rule, tape),
  ])
);
const observedFamilyMax = Object.fromEntries(
  Object.entries(sourceRecords).map(([name, rows]) => [
    name,
    Math.max(...rules.map((rule) => score(rows, rule, tape).hits)),
  ])
);

const permutationCount = 50000;
const random = makeRng(0x24c1cada);
const fixedTailCounts = { signed: 0, p56: 0, p57: 0 };
const fixedPositiveTailCounts = { signed: 0, p56: 0, p57: 0 };
const familyTailCounts = { signed: 0, p56: 0, p57: 0 };

for (let trial = 0; trial < permutationCount; trial += 1) {
  const permuted = shuffled(tape, random);

  for (const name of Object.keys(sourceRecords)) {
    const fixed = score(sourceRecords[name], selectedByHeldout[name], permuted);
    if (fixed.hits >= observedByHeldout[name].hits) fixedTailCounts[name] += 1;
    if (fixed.positiveHits >= observedByHeldout[name].positiveHits) {
      fixedPositiveTailCounts[name] += 1;
    }

    const familyMax = Math.max(
      ...rules.map((rule) => score(sourceRecords[name], rule, permuted).hits)
    );
    if (familyMax >= observedFamilyMax[name]) familyTailCounts[name] += 1;
  }
}

assert.deepEqual(fixedTailCounts, { signed: 15159, p56: 50000, p57: 50000 });
assert.deepEqual(fixedPositiveTailCounts, { signed: 9147, p56: 50000, p57: 50000 });
assert.deepEqual(familyTailCounts, { signed: 33300, p56: 6830, p57: 5762 });

const correctedTail = (count) => (count + 1) / (permutationCount + 1);

console.log(JSON.stringify({
  classification: "negative control gate; no literal p50 grammar transfers",
  ruleCount: rules.length,
  acceptance: {
    requiresPositiveDigitHeldout: true,
    requiresFamilywiseHeldoutTailAtMost: 0.01,
    passed: false,
  },
  countNext: Object.fromEntries(
    Object.entries(sourceRecords).map(([name, rows]) => {
      const stats = cyclicStats(rows, countNext);
      const observed = score(rows, countNext, tape);
      return [name, {
        hits: observed.hits,
        positiveHits: observed.positiveHits,
        cyclicTail: stats.tail,
      }];
    })
  ),
  folds: Object.fromEntries(
    Object.entries(folds).map(([name, fold]) => [name, {
      train: fold.trainNames,
      selectedRule: fold.selected,
      trainHits: fold.training.observed,
      trainCyclicTail: fold.training.tail,
      heldoutHits: fold.heldout.observed,
      heldoutPositiveHits: fold.heldoutScore.positiveHits,
      heldoutCyclicTail: fold.heldout.tail,
    }])
  ),
  permutationCalibration: {
    trials: permutationCount,
    seed: "0x24c1cada",
    fixedHeldoutTails: Object.fromEntries(
      Object.keys(sourceRecords).map((name) => [name, {
        rule: selectedByHeldout[name].name,
        tail: correctedTail(fixedTailCounts[name]),
        positiveTail: correctedTail(fixedPositiveTailCounts[name]),
      }])
    ),
    familywiseMaxTails: Object.fromEntries(
      Object.keys(sourceRecords).map((name) => [
        name,
        correctedTail(familyTailCounts[name]),
      ])
    ),
  },
}, null, 2));
