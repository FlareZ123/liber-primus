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
const parts = transcription.split(/^\s*%\s*$/m);
const runeToValue = new Map(corpus.runes.map((rune, value) => [rune, value]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/** @param {string} line @returns {string[]} */
function runeWords(line) {
  return line.match(/[\u16A0-\u16FF]+/gu) || [];
}

/** @param {string} word @returns {number} */
function cipherGp0(word) {
  return [...word].reduce((sum, rune) => {
    const value = runeToValue.get(rune);
    assert.notEqual(value, undefined);
    return sum + value;
  }, 0);
}

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/[KQ]/g, "C")
    .replace(/V/g, "U")
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

/** @param {number} page @param {number} target */
function boundaryHits(page, target) {
  const lines = physicalPart(page)
    .split(/\n/u)
    .filter((line) => /[\u16A0-\u16FF]/u.test(line));
  const first = runeWords(lines[0]).map(cipherGp0);
  const last = runeWords(lines.at(-1)).map(cipherGp0);
  const hits = [];

  first.forEach((value, index) => {
    if (value === target) {
      hits.push({
        side: "first",
        position: index + 1,
        offsetFromEnd: first.length - 1 - index
      });
    }
  });
  last.forEach((value, index) => {
    if (value === target) {
      hits.push({
        side: "last",
        position: index + 1,
        offsetFromEnd: last.length - 1 - index
      });
    }
  });
  return { first, last, hits };
}

const clear = signed2016
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u)
  .slice(1)
  .join("\n");
const sourceWords = clear
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word) => word.toUpperCase());
assert.equal(sourceWords.length, 43);

const sourceGp0 = sourceWords.map((word) =>
  gp(word).reduce((sum, value) => sum + value, 0)
);

assert.deepEqual(sourceWords.slice(23, 30), [
  "ROAD", "AND", "THEIR", "NUMBERS", "ARE", "THE", "DIRECTION"
]);
assert.deepEqual(sourceGp0.slice(23, 30), [54, 56, 34, 83, 46, 20, 112]);

const corridor = [];
for (let page = 23; page <= 29; page += 1) {
  corridor.push({
    page,
    sourceWord: sourceWords[page],
    sourceGp0: sourceGp0[page],
    ...boundaryHits(page, sourceGp0[page])
  });
}

assert.deepEqual(corridor[1].hits, [{
  side: "last",
  position: 4,
  offsetFromEnd: 1
}]);
for (const page of [25, 26, 27, 28, 29]) {
  assert.deepEqual(corridor[page - 23].hits, []);
}

const family = [];
for (let page = 0; page <= 42; page += 1) {
  const result = boundaryHits(page, sourceGp0[page]);
  if (result.hits.length > 0) {
    family.push({
      page,
      sourceWord: sourceWords[page],
      sourceGp0: sourceGp0[page],
      hits: result.hits
    });
  }
}

assert.deepEqual(family, [
  {
    page: 21,
    sourceWord: "IS",
    sourceGp0: 25,
    hits: [{ side: "first", position: 3, offsetFromEnd: 3 }]
  },
  {
    page: 24,
    sourceWord: "AND",
    sourceGp0: 56,
    hits: [{ side: "last", position: 4, offsetFromEnd: 1 }]
  },
  {
    page: 34,
    sourceWord: "BE",
    sourceGp0: 35,
    hits: [
      { side: "first", position: 3, offsetFromEnd: 4 },
      { side: "last", position: 2, offsetFromEnd: 3 }
    ]
  },
  {
    page: 36,
    sourceWord: "GOOD",
    sourceGp0: 35,
    hits: [{ side: "first", position: 1, offsetFromEnd: 7 }]
  },
  {
    page: 38,
    sourceWord: "BEWARE",
    sourceGp0: 88,
    hits: [{ side: "first", position: 5, offsetFromEnd: 0 }]
  }
]);

console.log(JSON.stringify({
  status: "PASS",
  hypothesis:
    "THE ONE RISE means +1 physical page and +1 authenticated 2016 word index, with a same-index GP0 boundary receiver",
  predictedCorridor: sourceWords.slice(23, 30),
  corridor,
  familyBoundaryMatches: family,
  decision:
    "PARTIAL/NEGATIVE: p24 has the prospectively predicted AND=56 terminal-boundary state, but p25-p27 all miss under the unchanged rule; do not generalize ONE RISE as a boundary-state march."
}, null, 2));
