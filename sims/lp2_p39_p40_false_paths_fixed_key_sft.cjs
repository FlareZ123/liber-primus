"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/transcriptions/lp2-image-corrected.txt");
const signedText = read("resources/historical/cicada2016-4gq25-outguess.asc");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} word @returns {number[]} */
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
    const token = gpTokens.find((candidate) => normalized.startsWith(candidate.symbol, offset));
    assert.ok(token, `unmapped GP spelling ${normalized.slice(offset)}`);
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

/** @param {number[]} values @returns {number} */
function encodeKey(values) {
  return values.reduce((accumulator, value) => accumulator * 29 + value, 0);
}

/** @param {number[]} left @param {number[]} right @returns {boolean} */
function same(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

/**
 * @param {{page:number,tape:number[]}[]} pages
 * @param {number[]} key
 * @param {{index:number,word:string,values:number[]}[]} targets
 * @returns {{windows:number,tests:number,hits:object[],counts:Map<number,number>}}
 */
function scan(pages, key, targets) {
  const counts = new Map();
  const hits = [];
  let windows = 0;
  let tests = 0;
  for (const { page, tape } of pages) {
    for (let start = 0; start + key.length <= tape.length; start += 1) {
      windows += 1;
      const cipher = tape.slice(start, start + key.length);
      for (const target of targets) {
        const subtractKey = cipher.map((value, index) => mod29(value - target.values[index]));
        const addKey = subtractKey.map((value) => mod29(-value));
        for (const candidateKey of [subtractKey, addKey]) {
          const id = encodeKey(candidateKey);
          counts.set(id, (counts.get(id) || 0) + 1);
        }
        for (const sign of ["subtract", "add"]) {
          tests += 1;
          const polarity = sign === "subtract" ? -1 : 1;
          const output = cipher.map((value, index) => mod29(value + polarity * key[index]));
          if (same(output, target.values)) {
            hits.push({ page, start, sign, target: target.word, sourceIndex: target.index, cipher });
          }
        }
      }
    }
  }
  return { windows, tests, hits, counts };
}

const blocks = transcription.split(/^\s*%\s*$/m).slice(0, 55);
const pages = blocks.map((block, blockIndex) => ({
  page: blockIndex >= 50 ? blockIndex + 1 : blockIndex,
  tape: [...block].map((char) => runeIndex.get(char)).filter((value) => value !== undefined),
}));
assert.equal(pages.length, 55);

const clear = signedText.split("-----BEGIN PGP SIGNATURE-----")[0];
const sourceWords = clear
  .slice(clear.indexOf("Hello."))
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word) => word.toUpperCase());
assert.equal(sourceWords.length, 43);
assert.equal(sourceWords[39], "FALSE");
assert.equal(sourceWords[40], "PATHS");

function distinctTargets(arity) {
  const seen = new Set();
  const out = [];
  for (let index = 0; index < sourceWords.length; index += 1) {
    const values = gp(sourceWords[index]);
    const id = values.join(",");
    if (values.length !== arity || seen.has(id)) continue;
    seen.add(id);
    out.push({ index, word: sourceWords[index], values });
  }
  return out;
}

const targets5 = distinctTargets(5);
const targets4 = distinctTargets(4);
assert.equal(targets5.length, 7);
assert.equal(targets4.length, 9);

const key39 = [19, 12, 19, 2, 5];
const key40 = [20, 20, 12, 6];
const result39 = scan(pages, key39, targets5);
const result40 = scan(pages, key40, targets4);

assert.equal(result39.windows, 12736);
assert.equal(result39.tests, 12736 * 7 * 2);
assert.deepEqual(result39.hits, [{
  page: 39,
  start: 132,
  sign: "subtract",
  target: "FALSE",
  sourceIndex: 39,
  cipher: [19, 7, 10, 17, 23],
}]);

assert.equal(result40.windows, 12791);
assert.equal(result40.tests, 12791 * 9 * 2);
assert.deepEqual(result40.hits, [{
  page: 40,
  start: 71,
  sign: "subtract",
  target: "PATHS",
  sourceIndex: 40,
  cipher: [4, 15, 14, 21],
}]);

assert.equal(result39.hits[0].page + 1, result40.hits[0].page);
assert.equal(result39.hits[0].sourceIndex + 1, result40.hits[0].sourceIndex);

const hist39 = new Map();
for (const count of result39.counts.values()) hist39.set(count, (hist39.get(count) || 0) + 1);
assert.deepEqual([...hist39.entries()].sort((left, right) => left[0] - right[0]), [
  [1, 176640],
  [2, 826],
  [3, 4],
]);
assert.equal(result39.counts.get(encodeKey(key39)), 1);
assert.equal(29 ** 5 - result39.counts.size, 20333679);

const hist40 = new Map();
for (const count of result40.counts.values()) hist40.set(count, (hist40.get(count) || 0) + 1);
assert.deepEqual([...hist40.entries()].sort((left, right) => left[0] - right[0]), [
  [1, 166764],
  [2, 26842],
  [3, 2920],
  [4, 244],
  [5, 6],
  [6, 4],
]);
assert.equal(result40.counts.get(encodeKey(key40)), 1);
assert.equal(29 ** 4 - result40.counts.size, 510501);

console.log("PASS lp2_p39_p40_false_paths_fixed_key_sft");
console.log(JSON.stringify({
  p39: {
    key: key39,
    windows: result39.windows,
    tests: result39.tests,
    hit: result39.hits[0],
    singletonKeys: hist39.get(1),
    zeroHitKeys: 29 ** 5 - result39.counts.size,
  },
  p40: {
    key: key40,
    windows: result40.windows,
    tests: result40.tests,
    hit: result40.hits[0],
    singletonKeys: hist40.get(1),
    zeroHitKeys: 29 ** 4 - result40.counts.size,
  },
  adjacency: {
    physicalPages: [39, 40],
    sourceIndices: [39, 40],
    phrase: "FALSE PATHS",
  },
}, null, 2));
