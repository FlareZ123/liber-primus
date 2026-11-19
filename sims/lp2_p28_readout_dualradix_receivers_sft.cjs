"use strict";

/**
 * Dual-radix READ OUT receiver SFT.
 *
 * The recovered p28 instruction supplies GP0 addresses 55 and 20. This test
 * freezes both already-used p50 interpretations and asks what each selects in
 * the original LP2 source, with no page search or boundary tuning.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeSet = new Set(corpus.runes);
const parts = transcription.split(/^\s*%\s*$/m);

/** @param {string} text @returns {Array<{start:number,end:number,values:number[],sum:number}>} */
function parseWords(text) {
  const words = [];
  let current = [];
  let start = 0;
  let offset = 0;
  const flush = () => {
    if (!current.length) return;
    words.push({
      start,
      end: offset - 1,
      values: current.slice(),
      sum: current.reduce((a, b) => a + b, 0),
    });
    current = [];
  };
  for (const char of [...text]) {
    if (runeSet.has(char)) {
      if (!current.length) start = offset;
      current.push(runeIndex.get(char));
      offset += 1;
    } else if (char === "-" || char === ".") {
      flush();
    }
  }
  flush();
  return words;
}

/** @param {string} text @returns {number[]} */
function allRunes(text) {
  return [...text].map((char) => runeIndex.get(char)).filter((value) => value !== undefined);
}

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function modPow(base, exponent, modulus) {
  let result = 1;
  let factor = base % modulus;
  let e = exponent;
  while (e > 0) {
    if (e % 2 === 1) result = (result * factor) % modulus;
    factor = (factor * factor) % modulus;
    e = Math.floor(e / 2);
  }
  return result;
}

/** @param {number[]} values @returns {string} */
function translit(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

/** @param {string} token @param {string} alphabet @returns {number} */
function decodeToken(token, alphabet) {
  return alphabet.indexOf(token[0]) * alphabet.length + alphabet.indexOf(token[1]);
}

// Exact READ OUT GP values recovered by the separately tested p28 transform.
const READ = [4, 28, 23];
const OUT = [3, 1, 16];
const readGp0 = READ.reduce((a, b) => a + b, 0);
const outGp0 = OUT.reduce((a, b) => a + b, 0);
assert.equal(translit(READ), "READ");
assert.equal(translit(OUT), "OUT");
assert.equal(readGp0, 55);
assert.equal(outGp0, 20);

const tokens = grid.pages.flatMap((page) => page.tokens);
const bytes = grid.pages.flatMap((page) => page.bytes);
const base60 = grid.alphabet;
const base59 = base60.replace("f", "");
assert.equal(tokens[readGp0], "1K");
assert.equal(tokens[outGp0], "1g");
assert.equal(bytes[readGp0], 80);
assert.equal(bytes[outGp0], 102);

const b59Start = decodeToken(tokens[readGp0], base59);
const b59End = decodeToken(tokens[outGp0], base59);
const b60Start = decodeToken(tokens[readGp0], base60);
const b60End = decodeToken(tokens[outGp0], base60);
assert.deepEqual([b59Start, b59End], [79, 100]);
assert.deepEqual([b60Start, b60End], [80, 102]);

const p = 23;
const g = 5;
const B = 19;

// Base59 receiver: p27, multiplicative-group sized.
const p27Words = parseWords(physicalPart(27));
const p27Runes = allRunes(physicalPart(27));
const p27First = p27Words.findIndex((word) => word.start === b59Start);
const p27Last = p27Words.findIndex((word) => word.end === b59End);
assert.deepEqual([p27First + 1, p27Last + 1], [20, 24]);
const p27Selected = p27Words.slice(p27First, p27Last + 1);
assert.equal(p27Selected.length, g);
assert.equal(b59End - b59Start + 1, p - 1);
assert.deepEqual(p27Selected.map((word) => word.sum), [155, 20, 27, 47, 55]);

// The selected p27 words write OUT, page27 and READ into fixed positions.
assert.equal(p27Selected[1].sum, outGp0);
assert.equal(p27Selected[2].sum, 27);
assert.equal(p27Selected[4].sum, readGp0);

// All five word sums map through the same base59 p50 table to exact p27
// word boundaries; READ and OUT map to the receiver's own left/right ends.
const p27Starts = new Map(p27Words.map((word, index) => [word.start, index + 1]));
const p27Ends = new Map(p27Words.map((word, index) => [word.end, index + 1]));
const p27SelfMap = p27Selected.map((word) => {
  const value = decodeToken(tokens[word.sum], base59);
  return {
    sum: word.sum,
    value,
    startWord: p27Starts.get(value) || null,
    endWord: p27Ends.get(value) || null,
  };
});
assert.deepEqual(p27SelfMap, [
  { sum: 155, value: 110, startWord: null, endWord: 27 },
  { sum: 20, value: 100, startWord: null, endWord: 24 },
  { sum: 27, value: 25, startWord: null, endWord: 4 },
  { sum: 47, value: 75, startWord: 19, endWord: null },
  { sum: 55, value: 79, startWord: 20, endWord: null },
]);

// Base60 receiver: p0, field-modulus sized.
const p0Words = parseWords(physicalPart(0));
const p0Runes = allRunes(physicalPart(0));
const p0First = p0Words.findIndex((word) => word.start === b60Start);
const p0Last = p0Words.findIndex((word) => word.end === b60End);
assert.deepEqual([p0First + 1, p0Last + 1], [18, 21]);
const p0Selected = p0Words.slice(p0First, p0Last + 1);
assert.equal(b60End - b60Start + 1, p);
assert.equal(p0Runes[(b60Start + b60End) / 2], 0);
assert.deepEqual(p0Selected.map((word) => word.sum % 29), [B, outGp0, g, p]);

// Whole-book receiver controls.
const b59BoundaryHits = [];
const b60BoundaryHits = [];
let fiveWordWindows = 0;
let fourWordWindows = 0;
const p27PatternHits = [];
const p0PatternHits = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const words = parseWords(physicalPart(page));
  const runes = allRunes(physicalPart(page));

  const s59 = words.findIndex((word) => word.start === b59Start);
  const e59 = words.findIndex((word) => word.end === b59End);
  if (s59 >= 0 && e59 >= s59) {
    b59BoundaryHits.push({
      page,
      firstWord: s59 + 1,
      lastWord: e59 + 1,
      wordCount: e59 - s59 + 1,
    });
  }

  const s60 = words.findIndex((word) => word.start === b60Start);
  const e60 = words.findIndex((word) => word.end === b60End);
  if (s60 >= 0 && e60 >= s60) {
    b60BoundaryHits.push({
      page,
      firstWord: s60 + 1,
      lastWord: e60 + 1,
      wordCount: e60 - s60 + 1,
      center: runes[(b60Start + b60End) / 2],
    });
  }

  for (let i = 0; i + 4 < words.length; i += 1) {
    fiveWordWindows += 1;
    const sums = words.slice(i, i + 5).map((word) => word.sum);
    if (sums[1] === outGp0 && sums[2] === page && sums[4] === readGp0) {
      p27PatternHits.push({
        page,
        firstWord: i + 1,
        lastWord: i + 5,
        start: words[i].start,
        end: words[i + 4].end,
        sums,
      });
    }
  }

  for (let i = 0; i + 3 < words.length; i += 1) {
    fourWordWindows += 1;
    const residues = words.slice(i, i + 4).map((word) => word.sum % 29);
    if (
      residues[0] === B &&
      residues[1] === outGp0 &&
      residues[2] === g &&
      residues[3] === p
    ) {
      p0PatternHits.push({
        page,
        firstWord: i + 1,
        lastWord: i + 4,
        start: words[i].start,
        end: words[i + 3].end,
        residues,
      });
    }
  }
}

assert.deepEqual(
  b59BoundaryHits.filter((row) => row.wordCount === g),
  [{ page: 27, firstWord: 20, lastWord: 24, wordCount: 5 }]
);
assert.deepEqual(
  b60BoundaryHits.filter((row) => row.center === 0),
  [{ page: 0, firstWord: 18, lastWord: 21, wordCount: 4, center: 0 }]
);
assert.equal(fiveWordWindows, 2708);
assert.deepEqual(p27PatternHits, [{
  page: 27,
  firstWord: 20,
  lastWord: 24,
  start: 79,
  end: 100,
  sums: [155, 20, 27, 47, 55],
}]);
assert.equal(fourWordWindows, 2763);
assert.deepEqual(p0PatternHits, [{
  page: 0,
  firstWord: 18,
  lastWord: 21,
  start: 80,
  end: 102,
  residues: [19, 20, 5, 23],
}]);

// The exact READ OUT word-layer cube rule does not immediately decrypt either
// receiver. This keeps the receiver evidence separate from consumer claims.
const wordLayerDecode = (words) => words.flatMap((word) => {
  const layers = Math.ceil(word.values.length / 2);
  const exponent = modPow(3, layers, 28);
  return word.values.map((value) => modPow(value, exponent, 29));
});
const p27Layer = wordLayerDecode(p27Selected);
const p0Layer = wordLayerDecode(p0Selected);
assert.equal(translit(p27Layer), "EORNSOOCAEYEEWGUTHNTHOEAOEX");
assert.equal(translit(p0Layer), "XTMIAAYNGJRNMFEGHJTTHIAOIAES");

console.log(JSON.stringify({
  status: "PASS",
  instruction: {
    READ: { gp0: readGp0, token: tokens[readGp0], base59: b59Start, base60: b60Start },
    OUT: { gp0: outGp0, token: tokens[outGp0], base59: b59End, base60: b60End },
  },
  base59Receiver: {
    page: 27,
    start: b59Start,
    end: b59End,
    runes: p - 1,
    words: p27Selected.length,
    sums: p27Selected.map((word) => word.sum),
    selfMap: p27SelfMap,
    uniqueFiveWordPatternHits: p27PatternHits,
  },
  base60Receiver: {
    page: 0,
    start: b60Start,
    end: b60End,
    runes: p,
    center: "F",
    residues: p0Selected.map((word) => word.sum % 29),
    uniqueFourWordPatternHits: p0PatternHits,
  },
  controls: {
    base59BoundaryHits: b59BoundaryHits,
    base60BoundaryHits: b60BoundaryHits,
    fiveWordWindows,
    fourWordWindows,
    p27WordLayerConsumer: translit(p27Layer),
    p0WordLayerConsumer: translit(p0Layer),
  },
  interpretation:
    "READ OUT's fixed GP0 addresses produce complementary dual-radix receivers: base59 uniquely selects a p27 five-word, 22=p-1 interval with READ/OUT/page self-reference; base60 uniquely selects a p0 23=p interval centered on F with residues [B,OUT,g,p]. Both minimal word-layer consumers remain ciphertext.",
}, null, 2));
