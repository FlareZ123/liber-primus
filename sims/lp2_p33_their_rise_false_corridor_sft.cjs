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

/** @param {[number, number]} pair @returns {[number, number]} */
function h(pair) {
  const [x, y] = pair;
  return [mod29(x - y), mod29(x + y)];
}

/** @param {[number, number]} pair @returns {[number, number]} */
function hInv(pair) {
  const [u, v] = pair;
  const inverse2 = 15;
  return [
    mod29((u + v) * inverse2),
    mod29((v - u) * inverse2),
  ];
}

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const out = [];
  for (let candidate = 2; out.length < count; candidate += 1) {
    let prime = true;
    for (let divisor = 2; divisor * divisor <= candidate; divisor += 1) {
      if (candidate % divisor === 0) {
        prime = false;
        break;
      }
    }
    if (prime) out.push(candidate);
  }
  return out;
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const signedSource = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const parts = transcription.split(/^\s*%\s*$/m);
const primes = firstPrimes(130);

/** @param {number} n @returns {number} */
function totientPrimeOrdinal(n) {
  assert.ok(Number.isInteger(n) && n >= 1 && n <= primes.length);
  return mod29(primes[n - 1] - 1);
}

/** @param {number[]} values @returns {string} */
function spell(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/** @param {string} text @returns {number[][]} */
function runeWords(text) {
  const normalized = text.replace(/\/\s*/gu, "");
  return (normalized.match(/[\u16A0-\u16FF]+/gu) || []).map((word) =>
    [...word].map((rune) => {
      const value = runeIndex.get(rune);
      assert.notEqual(value, undefined);
      return value;
    })
  );
}

/** @param {number} page @returns {{values:number[],start:number,end:number,length:number}[]} */
function wordRows(page) {
  let offset = 0;
  return runeWords(physicalPart(page)).map((values) => {
    const row = {
      values,
      start: offset,
      end: offset + values.length,
      length: values.length,
    };
    offset = row.end;
    return row;
  });
}

/**
 * @param {{start:number,end:number,length:number}[]} rows
 * @param {number} start
 * @param {number} end
 */
function rowsInSpan(rows, start, end) {
  return rows.filter((row) => row.start >= start && row.end <= end);
}

// Reproduce the independently published p33 hidden text from literal title
// word lengths, the already fixed H polarity, and the solved-p56 serializer.
const p33Rows = wordRows(33);
const p33Ink = ink.pages.find((page) => page.page === 33);
assert.ok(p33Ink);
assert.deepEqual(
  p33Ink.red_spans.map((span) => [span.start, span.length]),
  [[0, 10], [91, 8]]
);

const upperTitleLengths = rowsInSpan(p33Rows, 0, 10).map((row) => row.length);
const lowerTitleLengths = rowsInSpan(p33Rows, 91, 99).map((row) => row.length);
assert.deepEqual(upperTitleLengths, [2, 8]);
assert.deepEqual(lowerTitleLengths, [3, 5]);

const upperExtended = [...upperTitleLengths, ...hInv(upperTitleLengths)];
const lowerExtended = [...lowerTitleLengths, ...h(lowerTitleLengths)];
assert.deepEqual(upperExtended, [2, 8, 5, 3]);
assert.deepEqual(lowerExtended, [3, 5, 27, 8]);

const hiddenText = spell([
  ...upperExtended.map(totientPrimeOrdinal),
  ...lowerExtended.map(totientPrimeOrdinal),
]);
assert.equal(hiddenText, "THEIRRISE");

// Parse the authenticated 2016 source under the repository's fixed 43-word
// tokenizer.
const clear = signedSource.split("-----BEGIN PGP SIGNATURE-----")[0];
const body = clear.slice(clear.indexOf("Hello."));
const signedWords = body
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word) => word.toUpperCase());

assert.equal(signedWords.length, 43);

const theirIndices = signedWords
  .map((word, index) => ({word, index}))
  .filter((row) => row.word === "THEIR")
  .map((row) => row.index);
assert.deepEqual(theirIndices, [19, 25]);

const table = grid.rows.flat();
const bytes = grid.byte_rows.flat();
assert.equal(table[theirIndices[0]], "0X");
assert.equal(bytes[theirIndices[0]], 33);

// Control: among all repeated signed words, THEIR is the only one whose
// earliest occurrence has a full native-base60 p50 value inside p0..p55.
const occurrences = new Map();
for (let index = 0; index < signedWords.length; index += 1) {
  const word = signedWords[index];
  if (!occurrences.has(word)) occurrences.set(word, []);
  occurrences.get(word).push(index);
}

const repeatedEarliestPageLandings = [];
for (const [word, indices] of occurrences.entries()) {
  if (indices.length < 2) continue;
  const first = indices[0];
  if (bytes[first] <= 55) {
    repeatedEarliestPageLandings.push({
      word,
      first,
      token: table[first],
      value: bytes[first],
    });
  }
}

assert.deepEqual(repeatedEarliestPageLandings, [{
  word: "THEIR",
  first: 19,
  token: "0X",
  value: 33,
}]);

const rise = theirIndices[1] - theirIndices[0];
assert.equal(rise, 6);
const destinationPage = bytes[theirIndices[0]] + rise;
assert.equal(destinationPage, 39);
assert.equal(signedWords[destinationPage], "FALSE");
assert.deepEqual(
  signedWords.slice(destinationPage, destinationPage + 4),
  ["FALSE", "PATHS", "VERIFY", "OPENPGP"]
);

console.log(JSON.stringify({
  status: "PASS",
  p33: {
    hiddenText,
    upperTitleLengths,
    lowerTitleLengths,
  },
  signedSource: {
    theirIndices,
    rise,
    corridor: signedWords.slice(destinationPage, destinationPage + 4),
  },
  p50: {
    firstTheirAddress: theirIndices[0],
    token: table[theirIndices[0]],
    fullBase60Value: bytes[theirIndices[0]],
    repeatedEarliestPageLandings,
  },
  route: {
    firstTheir: 19,
    p50Landing: 33,
    instruction: "THEIR RISE",
    secondTheir: 25,
    rise,
    destinationPage,
    destinationWord: signedWords[destinationPage],
  },
  interpretation:
    "The authenticated source word THEIR self-selects p33 through the native full-base60 p50 table. P33 independently yields THEIR RISE; the rise between the two THEIR word numbers is 6, and p33+6 lands on p39, the signed-source FALSE page. The original p39 scan supplies the external visual red-X cue; that visual observation is intentionally outside this text-only SFT.",
}, null, 2));
