"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/**
 * Read one UTF-8 repository file.
 * @param {string} relative
 * @returns {string}
 */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

/**
 * Positive modulo.
 * @param {number} value
 * @returns {number}
 */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/**
 * Canonical GP spelling used by the repository.
 * @param {string} word
 * @returns {number[]}
 */
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
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling: " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

/**
 * Parse page-local printed rune groups by '-' and '.' delimiters.
 * @param {string} text
 * @returns {{start:number, values:number[]}[]}
 */
function parsePage(text) {
  const words = [];
  let current = [];
  let start = 0;
  let runeOffset = 0;

  function flush() {
    if (!current.length) return;
    words.push({ start, values: current.slice() });
    current = [];
  }

  for (const char of [...text]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) start = runeOffset;
      current.push(value);
      runeOffset += 1;
    } else if (char === "-" || char === ".") {
      flush();
    }
  }
  flush();
  return words;
}

/**
 * Generate unique permutations.
 * @param {number[]} values
 * @returns {number[][]}
 */
function permutations(values) {
  const found = new Map();

  function visit(prefix, rest) {
    if (!rest.length) {
      found.set(prefix.join(","), prefix.slice());
      return;
    }
    for (let index = 0; index < rest.length; index += 1) {
      visit(
        prefix.concat(rest[index]),
        rest.slice(0, index).concat(rest.slice(index + 1))
      );
    }
  }

  visit([], values);
  return [...found.values()];
}

const clear = signed
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .slice(signed.indexOf("Hello."));
const sourceWords = clear
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word) => word.toUpperCase());

assert.equal(sourceWords.length, 43);
assert.deepEqual(sourceWords.slice(30), [
  "SEEK", "AND", "YOU", "WILL", "BE", "FOUND", "GOOD", "LUCK",
  "BEWARE", "FALSE", "PATHS", "VERIFY", "OPENPGP",
]);

const sourceLengths = sourceWords.map((word) => gp(word).length);

const parts = transcription.split(/^\s*%\s*$/m);
const p6Words = parsePage(parts[6]);
const titleStarts = [71, 75, 76, 80];
const title = titleStarts.map((start) => {
  const row = p6Words.find((word) => word.start === start);
  assert.ok(row, "missing p6 title word at " + start);
  return row;
});

const titleLengths = title.map((word) => word.values.length);
assert.deepEqual(titleLengths, [4, 1, 4, 2]);
assert.deepEqual(title[0].values, [24, 16, 14, 17]);
assert.deepEqual(title[1].values, [19]);

const q = 4;
const w1 = title[0].values;
const B = title[1].values[0];

// Conservative post-discovery role family:
// [signed W1 rune, q, W2 singleton, signed distinct W1 rune].
const targetFamily = new Map();
for (let left = 0; left < w1.length; left += 1) {
  for (const leftSign of [1, -1]) {
    for (let right = 0; right < w1.length; right += 1) {
      if (right === left) continue;
      for (const rightSign of [1, -1]) {
        const vector = [
          mod29(leftSign * w1[left]),
          q,
          B,
          mod29(rightSign * w1[right]),
        ];
        const key = vector.join(",");
        if (!targetFamily.has(key)) targetFamily.set(key, []);
        targetFamily.get(key).push({ left, leftSign, right, rightSign });
      }
    }
  }
}
assert.equal(targetFamily.size, 48);

const layoutFamily = permutations(titleLengths);
assert.equal(layoutFamily.length, 12);

const hits = [];
let configurations = 0;
for (const layout of layoutFamily) {
  const cuts = [0];
  for (const width of layout) cuts.push(cuts.at(-1) + width);
  assert.equal(cuts.at(-1), 11);

  for (let start = 0; start <= sourceWords.length - 11; start += 1) {
    const sums = [];
    for (let block = 0; block < 4; block += 1) {
      let total = 0;
      for (
        let offset = start + cuts[block];
        offset < start + cuts[block + 1];
        offset += 1
      ) {
        total += sourceLengths[offset];
      }
      sums.push(mod29(total));
    }

    configurations += targetFamily.size;
    const roles = targetFamily.get(sums.join(","));
    if (roles) {
      hits.push({
        start,
        end: start + 10,
        words: sourceWords.slice(start, start + 11),
        layout,
        sums,
        roles,
      });
    }
  }
}

assert.equal(configurations, 12 * 33 * 48);
assert.equal(hits.length, 1);
assert.deepEqual(hits[0], {
  start: 32,
  end: 42,
  words: [
    "YOU", "WILL", "BE", "FOUND", "GOOD", "LUCK",
    "BEWARE", "FALSE", "PATHS", "VERIFY", "OPENPGP",
  ],
  layout: [4, 1, 4, 2],
  sums: [14, 4, 19, 13],
  roles: [{ left: 2, leftSign: 1, right: 1, rightSign: -1 }],
});

// The selected source packet is exactly:
// [W1[2], q, W2, -W1[1]] = [-b, q, B, b-K].
assert.deepEqual(hits[0].sums, [
  w1[2],
  q,
  B,
  mod29(-w1[1]),
]);

// The already-frozen H4 orientation yields another direct state shell.
function H4(values) {
  return [
    mod29(values[0] - values[3]),
    mod29(values[1] - values[2]),
    mod29(values[1] + values[2]),
    mod29(values[0] + values[3]),
  ];
}
assert.deepEqual(H4(hits[0].sums), [1, 14, 23, 27]);

// Independent source-state consistency: the selected interval omits exactly
// the leading K=2 trailing-block words SEEK AND and begins at fold residue e=3.
assert.deepEqual(sourceWords.slice(30, 32), ["SEEK", "AND"]);
assert.equal(hits[0].start - 30, 2);
assert.equal(hits[0].start % 29, 3);

console.log(JSON.stringify({
  status: "PASS",
  p6: {
    titleStarts,
    titleLengths,
    W1: w1,
    W2: B,
    targetFamily: targetFamily.size,
    layoutPermutations: layoutFamily.length,
  },
  charge: {
    windows: 33,
    configurations,
    hits: hits.length,
  },
  selector: hits[0],
  selectorState: {
    blockSums: "[-b,q,B,b-K]",
    H4: "[a-g,-b,p,-K]",
    skippedLeadingWords: "K=2 -> SEEK AND",
    startingFoldResidue: "e=3",
  },
}, null, 2));
