"use strict";

/**
 * SFT: authenticated OPENPGP43 numbered object closes to the signed-source
 * opening under the established outside-in H shell.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
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

function flush() {
  if (!current.length) return;
  if (startSegment === endSegment) {
    const page = pages[startSegment];
    page.words.push({
      ordinal: page.words.length + 1,
      start: startOffset,
      values: current.slice(),
    });
  }
  current = [];
}

for (let segment = 0; segment < unknownSegments.length; segment += 1) {
  for (const char of [...unknownSegments[segment]]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) {
        startSegment = segment;
        startOffset = pages[segment].offset;
      }
      endSegment = segment;
      current.push(value);
      pages[segment].offset += 1;
    } else if (char === "/" || /\s/u.test(char)) {
      // Printed line/page wraps may continue a word.
    } else {
      flush();
    }
  }
}
flush();

const wordsByPage = new Map(pages.map((page) => [page.page, page.words]));
const canonicalWords = pages.flatMap((page) =>
  page.words.map((word) => ({page: page.page, ...word}))
);

const clear = signed2016
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u)
  .slice(1)
  .join("\n");

const source = clear
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word, index) => ({index, ordinal: index + 1, word: word.toUpperCase()}));

assert.equal(source.length, 43);
assert.deepEqual(
  source.slice(0, 3).map((row) => row.word),
  ["HELLO", "THE", "PATH"]
);
assert.equal(source[42].word, "OPENPGP");

/**
 * @param {number} value
 */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/**
 * Outside-in H shell in visible pair order.
 *
 * @param {number[]} values
 */
function shell(values) {
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

// Source ordinal43 OPENPGP -> physical page43 -> project p42 -> word43.
const p42 = wordsByPage.get(42);
assert.ok(p42);
const openpgp = p42[42];
assert.ok(openpgp);
assert.equal(openpgp.ordinal, 43);
assert.equal(openpgp.start, 206);
assert.deepEqual(openpgp.values, [16, 0, 14]);

const openpgpShell = shell(openpgp.values);
assert.deepEqual(openpgpShell, [2, 1, 0]);
assert.deepEqual(
  openpgpShell.map((index) => source[index].word),
  ["PATH", "THE", "HELLO"]
);
assert.deepEqual(
  [...openpgpShell].reverse().map((index) => source[index].word),
  ["HELLO", "THE", "PATH"]
);

// Charge all complete canonical three-rune words. The predeclared predicate is
// an H shell forming a strict descending consecutive source-index triple.
const threeRuneWords = canonicalWords.filter((word) => word.values.length === 3);
assert.equal(threeRuneWords.length, 716);

const descendingRuns = threeRuneWords
  .map((word) => ({...word, h: shell(word.values)}))
  .filter(({h}) =>
    h.length === 3 &&
    h[1] === h[0] - 1 &&
    h[2] === h[1] - 1 &&
    h[2] >= 0 &&
    h[0] < source.length
  )
  .map(({page, ordinal, start, values, h}) => ({
    page,
    ordinal,
    start,
    values,
    h,
  }));

assert.deepEqual(descendingRuns, [{
  page: 42,
  ordinal: 43,
  start: 206,
  values: [16, 0, 14],
  h: [2, 1, 0],
}]);

console.log("PASS OPENPGP43 H shell restarts signed source at HELLO THE PATH");
console.log(JSON.stringify({
  sourceTail: source.slice(38).map((row) => row.word),
  sourceOpening: source.slice(0, 3).map((row) => row.word),
  receiver: {
    page: 42,
    ordinal: openpgp.ordinal,
    start: openpgp.start,
    values: openpgp.values,
    shell: openpgpShell,
    shellWords: openpgpShell.map((index) => source[index].word),
  },
  threeRuneWords: threeRuneWords.length,
  descendingRuns,
}, null, 2));
