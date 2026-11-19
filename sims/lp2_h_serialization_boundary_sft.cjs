"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/**
 * Pair-interleaved H: each outside-in pair emits difference, then sum.
 * Odd center is emitted after all pairs.
 * @param {number[]} values
 * @returns {number[]}
 */
function Hpair(values) {
  const out = [];
  let left = 0;
  let right = values.length - 1;
  while (left < right) {
    out.push(
      mod29(values[left] - values[right]),
      mod29(values[left] + values[right])
    );
    left += 1;
    right -= 1;
  }
  if (left === right) out.push(values[left]);
  return out;
}

/**
 * Split H used by local inverse reports: differences outside-in, odd center,
 * then sums inside-out.
 * @param {number[]} values
 * @returns {number[]}
 */
function Hsplit(values) {
  const differences = [];
  const sums = [];
  let left = 0;
  let right = values.length - 1;
  while (left < right) {
    differences.push(mod29(values[left] - values[right]));
    sums.push(mod29(values[left] + values[right]));
    left += 1;
    right -= 1;
  }
  return [
    ...differences,
    ...(left === right ? [values[left]] : []),
    ...sums.reverse(),
  ];
}

/** @param {number[]} values @returns {number[]} */
function sorted(values) {
  return values.slice().sort((a, b) => a - b);
}

const parts = transcription.split(/^\s*%\s*$/m);
const unknownSegments = parts.slice(0, 55);
const pages = unknownSegments.map((text, segment) => ({
  page: segment >= 50 ? segment + 1 : segment,
  words: [],
  offset: 0,
}));

let current = [];
let startSegment = 0;
let endSegment = 0;
let startOffset = 0;
let crossingWords = 0;

/** Flush one canonical printed word. */
function flushWord() {
  if (!current.length) return;
  if (startSegment === endSegment) {
    const page = pages[startSegment];
    page.words.push({
      ordinal: page.words.length + 1,
      start: startOffset,
      values: current.slice(),
    });
  } else {
    crossingWords += 1;
  }
  current = [];
}

for (let segment = 0; segment < unknownSegments.length; segment += 1) {
  for (const character of [...unknownSegments[segment]]) {
    const value = runeIndex.get(character);
    if (value !== undefined) {
      if (!current.length) {
        startSegment = segment;
        startOffset = pages[segment].offset;
      }
      endSegment = segment;
      current.push(value);
      pages[segment].offset += 1;
    } else if (character === "/" || /\s/u.test(character)) {
      // Printed wraps may continue a word.
    } else {
      flushWord();
    }
  }
}
flushWord();

const canonicalWords = pages.flatMap((page) =>
  page.words.map((word) => ({page: page.page, ...word}))
);
const byPage = new Map(pages.map((page) => [page.page, page.words]));
const pageWords = (page) => byPage.get(page) || [];

assert.equal(crossingWords, 32);
assert.equal(canonicalWords.length, 2864);

const clear = signed2016
  .slice(
    signed2016.indexOf("Hello."),
    signed2016.indexOf("-----BEGIN PGP SIGNATURE-----")
  );
const source = clear
  .replace(/\b7A35090F\b/g, "")
  .match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g)
  .map((word, index) => ({index, ordinal: index + 1, word: word.toUpperCase()}));
assert.equal(source.length, 43);

const direction = pageWords(29)[29];
assert.deepEqual(direction, {
  ordinal: 30,
  start: 108,
  values: [11, 26, 11, 18],
});
assert.deepEqual(Hpair(direction.values), [22, 0, 15, 8]);
assert.deepEqual(Hsplit(direction.values), [22, 15, 8, 0]);

const openpgp = pageWords(42)[42];
assert.deepEqual(openpgp, {
  ordinal: 43,
  start: 206,
  values: [16, 0, 14],
});
assert.deepEqual(Hpair(openpgp.values), [2, 1, 0]);
assert.deepEqual(Hsplit(openpgp.values), [2, 0, 1]);

// P31 AND's subtraction key from the established local candidate.
// The two serializations contain the same values and assign different roles
// to positions 1 and 2.
const andKey = [17, 14, 7];
assert.deepEqual(Hpair(andKey), [10, 24, 14]);
assert.deepEqual(Hsplit(andKey), [10, 14, 24]);
assert.deepEqual(Hsplit(andKey), [mod29(-19), mod29(-15), mod29(-5)]);

// Two-rune uses are invariant to this serialization choice.
const p24Way = [27, 15];
assert.deepEqual(Hpair(p24Way), [12, 13]);
assert.deepEqual(Hsplit(p24Way), [12, 13]);

// The transforms always preserve the same multiset of pair outputs.
// Exact sequence equality is a separate property.
const equalityByLength = {};
for (const word of canonicalWords) {
  const pair = Hpair(word.values);
  const split = Hsplit(word.values);
  assert.deepEqual(sorted(pair), sorted(split));
  const key = String(word.values.length);
  if (!equalityByLength[key]) equalityByLength[key] = {words: 0, exactEqual: 0};
  equalityByLength[key].words += 1;
  if (pair.every((value, index) => value === split[index])) {
    equalityByLength[key].exactEqual += 1;
  }
}

// Charge both live serializations on every complete three-rune word for the
// exact descending authenticated-source restart pattern [k+2,k+1,k].
const restartHits = {Hpair: [], Hsplit: []};
for (const word of canonicalWords.filter((row) => row.values.length === 3)) {
  for (const [name, output] of [
    ["Hpair", Hpair(word.values)],
    ["Hsplit", Hsplit(word.values)],
  ]) {
    const [a, b, c] = output;
    if (
      a >= 2
      && a < source.length
      && b === a - 1
      && c === b - 1
    ) {
      restartHits[name].push({
        page: word.page,
        ordinal: word.ordinal,
        start: word.start,
        output,
        sourceWords: output.map((value) => source[value].word),
      });
    }
  }
}
assert.deepEqual(restartHits.Hpair, [{
  page: 42,
  ordinal: 43,
  start: 206,
  output: [2, 1, 0],
  sourceWords: ["PATH", "THE", "HELLO"],
}]);
assert.equal(restartHits.Hsplit.length, 0);

console.log(JSON.stringify({
  status: "PASS",
  canonicalContract: {
    completePageLocalWords: canonicalWords.length,
    crossingWords,
  },
  operations: {
    Hpair: "outside-in pairs, emit [difference,sum] per pair, odd center last",
    Hsplit: "all differences outside-in, odd center, sums inside-out",
    relation: "same multiset of pair outputs; different ordered serialization from length3 onward unless values coincide accidentally",
  },
  examples: {
    DIRECTION30: {
      raw: direction.values,
      Hpair: Hpair(direction.values),
      HpairRoles: ["p-1", "F", "b", "A"],
      Hsplit: Hsplit(direction.values),
      HsplitRoles: ["p-1", "b", "A", "F"],
    },
    OPENPGP43: {
      raw: openpgp.values,
      Hpair: Hpair(openpgp.values),
      Hsplit: Hsplit(openpgp.values),
    },
    p31ANDKey: {
      raw: andKey,
      Hpair: Hpair(andKey),
      HpairRoles: ["-B", "-g", "-b"],
      Hsplit: Hsplit(andKey),
      HsplitRoles: ["-B", "-b", "-g"],
    },
    p24TwoRune: {
      raw: p24Way,
      Hpair: Hpair(p24Way),
      Hsplit: Hsplit(p24Way),
    },
  },
  equalityByLength,
  restartHits,
  decision: "Hpair and Hsplit are different ordered transforms. OPENPGP43's descending-source restart is specific to Hpair; p31's ordered [-B,-b,-g] key-shell statement is specific to Hsplit. Two-rune H claims are unaffected. Cross-route evidence must name the serialization and may not treat the two ordered outputs as one canonical H transform.",
}, null, 2));
