"use strict";

/**
 * SFT: p28 literal DH selects word31 and fixed outer-H yields THE.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const parts = transcription.split(/^\s*%\s*$/m);

function mod(value, modulus) {
  return ((value % modulus) + modulus) % modulus;
}

function H(left, right) {
  return [mod(left - right, 29), mod(left + right, 29)];
}

function translit(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

function parsePage(pageText) {
  const runes = [];
  const words = [];
  let current = [];

  function flush() {
    if (!current.length) return;
    words.push(current.slice());
    current = [];
  }

  for (const char of [...pageText]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      current.push(value);
      runes.push(value);
    } else if ((char === "-" || char === ".") && current.length) {
      flush();
    }
  }
  flush();
  return { runes, words };
}

function physicalFragments(line) {
  return (line.match(/[\u16A0-\u16FF]+/gu) || []).map((fragment) =>
    [...fragment].map((rune) => runeIndex.get(rune))
  );
}

function runeBearingLines(pageText) {
  return pageText
    .trim()
    .split("/")
    .map((raw) => physicalFragments(raw))
    .filter((fragments) => fragments.flat().length > 0);
}

function physicalPageForPart(partIndex) {
  return partIndex <= 49 ? partIndex : partIndex + 1;
}

const translitTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

function gp(word) {
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
    const token = translitTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, `unmapped GP spelling: ${word}`);
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

const p28 = parsePage(parts[28]);
const p28Lines = runeBearingLines(parts[28]);
const line6 = p28Lines[5];
const line7 = p28Lines[6];

const state = { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2, e: 3 };
const dh = line6[0];

assert.deepEqual(dh, [state.p, state.A]);
assert.equal(translit(dh), "DH");
assert.deepEqual(H(dh[0], dh[1]), [state.b, state.K]);

const selector = dh[0] + dh[1];
assert.equal(selector, state.p + state.A);
assert.equal(selector, 31);

const word31 = p28.words[selector - 1];
assert.deepEqual(word31, line7[state.e - 1]);
assert.equal(word31.length, state.g);
assert.deepEqual(word31, [10, 18, 13, 28, 8]);
assert.deepEqual(H(word31[0], word31[word31.length - 1]), [2, 18]);
assert.equal(translit(H(word31[0], word31[word31.length - 1])), "THE");

const line7Lengths = line7.map((fragment) => fragment.length);
assert.equal(line7Lengths.reduce((total, value) => total + value, 0), state.p - 1);
assert.equal(line7Lengths[0], state.K);
assert.equal(line7Lengths[state.e - 1], state.g);
assert.equal(line7Lengths[4], state.a);
assert.equal(line7Lengths[5], 1);

let runeBearingLineCount = 0;
const stateProfileHits = [];
let fiveRuneWordCount = 0;
const outerTheHits = [];

const signedClear = signed2016
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\r?\n\r?\n/)
  .slice(1)
  .join("\n");
const signedWords = [...new Set(
  signedClear.split(/[^A-Za-z]+/).filter(Boolean).map((word) => word.toUpperCase())
)];
const signedTwoRune = new Map();
for (const word of signedWords) {
  const values = gp(word);
  if (values.length !== 2) continue;
  const key = values.join(",");
  if (!signedTwoRune.has(key)) signedTwoRune.set(key, []);
  signedTwoRune.get(key).push(word);
}
assert.deepEqual([...signedTwoRune.keys()].sort(), ["10,15", "17,18", "2,18"]);

const stateFieldEntries = Object.entries({
  p: state.p,
  g: state.g,
  a: state.a,
  b: state.b,
  A: state.A,
  B: state.B,
  K: state.K,
});
const pairSumRows = [];
for (let left = 0; left < stateFieldEntries.length; left += 1) {
  for (let right = left + 1; right < stateFieldEntries.length; right += 1) {
    const [leftName, leftValue] = stateFieldEntries[left];
    const [rightName, rightValue] = stateFieldEntries[right];
    const index = leftValue + rightValue;
    if (index < 1 || index > p28.words.length) continue;
    const target = p28.words[index - 1];
    if (target.length < 2) continue;
    const output = H(target[0], target[target.length - 1]);
    pairSumRows.push({
      expression: `${leftName}+${rightName}`,
      index,
      output,
      signedTargets: signedTwoRune.get(output.join(",")) || [],
    });
  }
}
assert.equal(pairSumRows.length, 20);
assert.deepEqual(
  pairSumRows.filter((row) => row.signedTargets.length > 0),
  [{
    expression: "p+A",
    index: 31,
    output: [2, 18],
    signedTargets: ["THE"],
  }]
);

const stateValues = new Set([
  state.p, state.g, state.a, state.b, state.A, state.B, state.K,
]);
let twoRuneFragmentCount = 0;
let validSamePageIndexCount = 0;
let statePairSourceCount = 0;
let validStatePairIndexCount = 0;
const signedTwoRuneHits = [];
const statePairSignedHits = [];

for (let partIndex = 0; partIndex < parts.length; partIndex += 1) {
  const page = physicalPageForPart(partIndex);
  if (page > 55) continue;

  const parsed = parsePage(parts[partIndex]);
  const lines = runeBearingLines(parts[partIndex]);

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const fragments = lines[lineIndex];
    const lengths = fragments.map((fragment) => fragment.length);
    const lineLength = lengths.reduce((total, value) => total + value, 0);
    runeBearingLineCount += 1;

    if (
      lineLength === state.p - 1 &&
      lengths.length >= 6 &&
      lengths[0] === state.K &&
      lengths[state.e - 1] === state.g &&
      lengths[4] === state.a &&
      lengths[5] === 1
    ) {
      stateProfileHits.push({ page, line: lineIndex + 1, lengths });
    }

    for (let fragmentIndex = 0; fragmentIndex < fragments.length; fragmentIndex += 1) {
      const fragment = fragments[fragmentIndex];
      if (fragment.length !== 2) continue;

      twoRuneFragmentCount += 1;

      const distinctStatePair =
        fragment[0] !== fragment[1] &&
        stateValues.has(fragment[0]) &&
        stateValues.has(fragment[1]);
      if (distinctStatePair) statePairSourceCount += 1;

      const sum = fragment[0] + fragment[1];
      if (sum < 1 || sum > parsed.words.length) continue;
      validSamePageIndexCount += 1;
      if (distinctStatePair) validStatePairIndexCount += 1;

      const target = parsed.words[sum - 1];
      if (target.length < 2) continue;

      const output = H(target[0], target[target.length - 1]);
      const signedTargets = signedTwoRune.get(output.join(","));
      if (!signedTargets) continue;

      const hit = {
        page,
        line: lineIndex + 1,
        fragment: fragmentIndex + 1,
        source: fragment,
        sum,
        targetLength: target.length,
        output,
        signedTargets,
      };
      signedTwoRuneHits.push(hit);
      if (distinctStatePair) statePairSignedHits.push(hit);
    }
  }

  for (let wordIndex = 0; wordIndex < parsed.words.length; wordIndex += 1) {
    const word = parsed.words[wordIndex];
    if (word.length !== 5) continue;
    fiveRuneWordCount += 1;
    const output = H(word[0], word[word.length - 1]);
    if (output[0] === 2 && output[1] === 18) {
      outerTheHits.push({ page, word: wordIndex + 1, values: word });
    }
  }
}

assert.equal(runeBearingLineCount, 594);
assert.deepEqual(stateProfileHits, [{
  page: 28,
  line: 7,
  lengths: [2, 4, 5, 4, 6, 1],
}]);

assert.equal(fiveRuneWordCount, 318);
assert.deepEqual(outerTheHits, [{
  page: 28,
  word: 31,
  values: [10, 18, 13, 28, 8],
}]);

assert.equal(twoRuneFragmentCount, 621);
assert.equal(validSamePageIndexCount, 595);
assert.equal(signedTwoRuneHits.length, 7);
assert.equal(statePairSourceCount, 22);
assert.equal(validStatePairIndexCount, 21);
assert.deepEqual(statePairSignedHits, [{
  page: 28,
  line: 6,
  fragment: 1,
  source: [23, 8],
  sum: 31,
  targetLength: 5,
  output: [2, 18],
  signedTargets: ["THE"],
}]);

console.log(JSON.stringify({
  status: "PASS: p28 literal DH selects word31 and outer-H yields THE",
  source: {
    literal: "DH",
    values: dh,
    labels: ["p", "A"],
    outerH: H(dh[0], dh[1]),
    outerHLabels: ["b", "K"],
    selector,
  },
  selected: {
    page: 28,
    word: 31,
    values: word31,
    length: word31.length,
    outerH: H(word31[0], word31[word31.length - 1]),
    plaintext: "THE",
    nextLineLengths: line7Lengths,
  },
  controls: {
    runeBearingLineCount,
    stateProfileHits,
    fiveRuneWordCount,
    outerTheHits,
    twoRuneFragmentCount,
    validSamePageIndexCount,
    signedTwoRuneHitCount: signedTwoRuneHits.length,
    pairSumRows,
    statePairSourceCount,
    validStatePairIndexCount,
    statePairSignedHits,
  },
  classification:
    "post-discovery source-constrained local plaintext candidate; do not generalize local GP0 word indexing without a new holdout.",
}, null, 2));
