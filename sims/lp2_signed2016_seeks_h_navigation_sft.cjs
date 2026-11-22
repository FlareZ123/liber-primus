"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));

const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {number} value */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {string} word */
function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const values = [];
  for (let index = 0; index < normalized.length;) {
    if (normalized.startsWith("ING", index)) {
      values.push(21);
      index += 3;
      continue;
    }
    if (normalized.startsWith("IO", index)) {
      values.push(27);
      index += 2;
      continue;
    }
    const token = gpTokens.find((row) => normalized.startsWith(row.symbol, index));
    assert.ok(token, `Unmapped GP token at ${normalized.slice(index)}`);
    values.push(token.value);
    index += token.symbol.length;
  }
  return values;
}

/** Outside-in H shell: outer differences, optional center, inner-to-outer sums. @param {number[]} values */
function H(values) {
  const differences = [];
  const sums = [];
  for (let left = 0, right = values.length - 1; left < right; left += 1, right -= 1) {
    differences.push(mod29(values[left] - values[right]));
    sums.push(mod29(values[left] + values[right]));
  }
  const shell = differences.slice();
  if (values.length % 2 === 1) shell.push(values[Math.floor(values.length / 2)]);
  shell.push(...sums.reverse());
  return shell;
}

/** @param {number[]} shell */
function Hinv(shell) {
  const output = Array(shell.length);
  const inverseTwo = 15;
  const pairs = Math.floor(shell.length / 2);
  for (let index = 0; index < pairs; index += 1) {
    const difference = shell[index];
    const sum = shell[shell.length - 1 - index];
    output[index] = mod29((difference + sum) * inverseTwo);
    output[shell.length - 1 - index] = mod29((sum - difference) * inverseTwo);
  }
  if (shell.length % 2 === 1) output[pairs] = shell[pairs];
  return output;
}

const clear = signed
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .replace(/^-----BEGIN PGP SIGNED MESSAGE-----[\s\S]*?Hash: SHA1\s*/, "")
  .replace(/\b3301\b/g, "")
  .replace(/\b[0-9A-F]{8,}\b/g, "");

const source = (clear.match(/[A-Za-z]+/g) || []).map((word, index) => ({
  index,
  word: word.toUpperCase(),
  values: gp(word),
}));

assert.equal(source.length, 43);

const expectedIndices = {
  HELLO: 0,
  THE: 1,
  PATH: 2,
  LIES: 3,
  EMPTY: 4,
  EPIPHANY: 5,
  SEEKS: 6,
  DEVOTED: 8,
  WAY: 13,
  WORDS: 15,
  MAP: 18,
  THEIR: 19,
  ROAD: 23,
};
for (const [word, index] of Object.entries(expectedIndices)) {
  assert.equal(source[index].word, word);
}

const seeks = source[6];
assert.deepEqual(seeks.values, [15, 18, 18, 5, 15]);
assert.equal(seeks.values.reduce((sum, value) => sum + value, 0), 71);

const navigationShell = [
  expectedIndices.HELLO,
  expectedIndices.WAY,
  expectedIndices.MAP,
  expectedIndices.ROAD,
  expectedIndices.THE,
];
assert.deepEqual(navigationShell, [0, 13, 18, 23, 1]);
assert.deepEqual(H(seeks.values), navigationShell);
assert.deepEqual(Hinv(navigationShell), seeks.values);

const navigationIndices = new Set([
  expectedIndices.WAY,
  expectedIndices.MAP,
  expectedIndices.ROAD,
]);

const sourceH = source.map((row) => {
  const shell = H(row.values);
  return {
    index: row.index,
    word: row.word,
    shell,
    labels: shell.map((value) => source[value]?.word || null),
    navigation: [...new Set(shell.filter((value) => navigationIndices.has(value)))],
  };
});

const completeNavigation = sourceH.filter(
  (row) => row.navigation.length === navigationIndices.size
);
assert.deepEqual(completeNavigation, [{
  index: 6,
  word: "SEEKS",
  shell: [0, 13, 18, 23, 1],
  labels: ["HELLO", "WAY", "MAP", "ROAD", "THE"],
  navigation: [13, 18, 23],
}]);

const fiveRuneRows = sourceH.filter((row) => source[row.index].values.length === 5);
assert.deepEqual(
  fiveRuneRows.map((row) => row.word),
  ["HELLO", "EMPTY", "SEEKS", "LIBER", "WORDS", "FOUND", "FALSE"]
);
assert.equal(
  Math.max(...fiveRuneRows.map((row) => row.navigation.length)),
  3
);
assert.deepEqual(
  fiveRuneRows.filter((row) => row.navigation.length === 3).map((row) => row.word),
  ["SEEKS"]
);

// The three navigation indices are exactly g=5 apart.
assert.equal(expectedIndices.MAP - expectedIndices.WAY, 5);
assert.equal(expectedIndices.ROAD - expectedIndices.MAP, 5);

// P6 source-visible cross-checks are independent of its ciphertext values.
const p6Ink = ink.pages.find((row) => row.page === 6);
assert.ok(p6Ink);
assert.equal(p6Ink.red_spans.length, 1);
assert.equal(p6Ink.red_spans[0].start, 71);
assert.equal(p6Ink.red_spans[0].length, 11);
assert.deepEqual(p6Ink.large_punctuation, [
  [71, 13, "red"],
  [82, 13, "red"],
]);
assert.equal(p6Ink.red_spans[0].start, seeks.values.reduce((sum, value) => sum + value, 0));
assert.equal(p6Ink.large_punctuation[0][1], expectedIndices.WAY);
assert.equal(p6Ink.large_punctuation[1][1], expectedIndices.WAY);

console.log(JSON.stringify({
  status: "PASS",
  classification: "exact authenticated-source H/index checksum; authored-use interpretation remains a hypothesis",
  signedSource: {
    wordCount: source.length,
    seeksIndex: seeks.index,
    seeksGp29: seeks.values,
    seeksGp0: 71,
    navigationIndices: {
      HELLO: 0,
      THE: 1,
      WAY: 13,
      MAP: 18,
      ROAD: 23,
    },
    HSEEKS: H(seeks.values),
    HSEEKSLabels: H(seeks.values).map((value) => source[value].word),
    uniqueAllNavigationWord: completeNavigation,
    fiveRuneRows,
  },
  p6VisibleCrossCheck: {
    page: 6,
    redStart: p6Ink.red_spans[0].start,
    redLength: p6Ink.red_spans[0].length,
    redPunctuation: p6Ink.large_punctuation,
  },
}, null, 2));
