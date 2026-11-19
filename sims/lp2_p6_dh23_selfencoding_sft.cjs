"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt")
  .replace(/\r/g, "");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const table = grid.pages.flatMap((page) => page.tokens);
const parts = transcription.split("%");

/** @param {number} value */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {[number, number]} pair */
function H(pair) {
  return [mod29(pair[0] - pair[1]), mod29(pair[0] + pair[1])];
}

/** @param {number} base @param {number} exp @param {number} mod */
function powMod(base, exp, mod) {
  let result = 1;
  let value = base % mod;
  let exponent = exp;
  while (exponent > 0) {
    if (exponent & 1) result = (result * value) % mod;
    value = (value * value) % mod;
    exponent >>= 1;
  }
  return result;
}

/** @param {number[]} values */
function gp0(values) {
  return values.reduce((sum, value) => sum + value, 0);
}

/** @param {string} raw */
function pageWords(raw) {
  const words = [];
  let current = [];
  let offset = 0;
  const flush = () => {
    if (!current.length) return;
    words.push({
      start: offset - current.length,
      end: offset - 1,
      values: current.slice(),
      text: current.map((value) => corpus.translit[value]).join(""),
      gp0: gp0(current),
    });
    current = [];
  };

  for (const character of raw) {
    if (runeIndex.has(character)) {
      current.push(runeIndex.get(character));
      offset += 1;
    } else if (character === "/" || /\s/u.test(character)) {
      // Physical wraps do not terminate printed words.
    } else {
      flush();
    }
  }
  flush();
  return words;
}

/** @param {string} raw */
function runeValues(raw) {
  return [...raw]
    .filter((rune) => runeIndex.has(rune))
    .map((rune) => runeIndex.get(rune));
}

// Exact source boundaries of the visually sixth passage.
const p38Ink = ink.pages.find((page) => page.page === 38);
const p39Ink = ink.pages.find((page) => page.page === 39);
assert.ok(p38Ink && p39Ink);
assert.ok(
  p38Ink.large_punctuation.some(
    (mark) => mark[0] === 186 && mark[1] === 10 && mark[2] === "red"
  )
);
assert.ok(
  p39Ink.large_punctuation.some(
    (mark) => mark[0] === 119 && mark[1] === 13 && mark[2] === "red"
  )
);

const p38Runes = runeValues(parts[38]);
const p39PrefixRaw = parts[39].split("&")[0];
const p39PrefixRunes = runeValues(p39PrefixRaw);
assert.equal(p39PrefixRunes.length, 119);

/** @param {number} physicalPage */
function physicalPageRaw(physicalPage) {
  return parts[physicalPage < 50 ? physicalPage : physicalPage - 1];
}

/** @param {number} physicalPage */
function physicalPageRunes(physicalPage) {
  return runeValues(physicalPageRaw(physicalPage));
}

/** @param {number} physicalPage */
function physicalPageWords(physicalPage) {
  return pageWords(physicalPageRaw(physicalPage));
}

/**
 * Complete-rune/complete-word interval between two red punctuation cuts.
 * @param {{page:number,offset:number,count:number}} left
 * @param {{page:number,offset:number,count:number}} right
 */
function redInterval(left, right) {
  const runes = [];
  const words = [];
  for (let page = left.page; page <= right.page; page += 1) {
    if (page === 50) continue;
    const pageRunes = physicalPageRunes(page);
    const pageWordRows = physicalPageWords(page);
    const low = page === left.page ? left.offset : 0;
    const high = page === right.page ? right.offset : pageRunes.length;
    runes.push(...pageRunes.slice(low, high));
    for (const word of pageWordRows) {
      if (word.start >= low && word.end < high) words.push({ page, ...word });
    }
  }
  return { runes, words };
}

const p38PassageRunes = p38Runes.slice(186);
const passageRunes = [...p38PassageRunes, ...p39PrefixRunes];

const p38PassageWords = pageWords(parts[38]).filter((word) => word.start >= 186);
const p39PassageWords = pageWords(p39PrefixRaw).filter((word) => word.start < 119);
const passageWords = [...p38PassageWords, ...p39PassageWords];

assert.equal(p38PassageRunes.length, 42);
assert.equal(p38PassageWords.length, 8);
assert.equal(p39PrefixRunes.length, 119);
assert.equal(p39PassageWords.length, 26);
assert.equal(passageRunes.length, 161);
assert.equal(passageWords.length, 34);

// Independent DH23 state already fixed elsewhere.
const p = 23;
const g = 5;
const a = 6;
const A = 8;
const b = 15;
const B = 19;
const K = 2;
const cubeExponent = 3;

// Boundary pair reproduces p and the cube exponent.
assert.equal(10 + 13, p);
assert.equal(13 - 10, cubeExponent);
assert.equal(passageRunes.length, 7 * p);

// Sixth complete word.
const word6 = passageWords[5];
assert.equal(word6.text, "XH");
assert.deepEqual(word6.values, [14, 8]);
assert.equal(word6.gp0, p - 1);
assert.deepEqual(H(word6.values), [a, p - 1]);
assert.equal(word6.values[1], A);
assert.equal(table[word6.gp0], "0x");

// Sixth rune independently gives B.
assert.equal(passageRunes[5], B);
assert.equal(table[passageRunes[5]], "0X");

// First word after the physical p38->p39 page break is passage word9.
const word9 = passageWords[8];
assert.equal(p38PassageWords.length + 1, 9);
assert.equal(word9.text, "SW");
assert.deepEqual(word9.values, [15, 7]);
assert.equal(word9.values[0], b);
assert.equal(word9.values[1], passageRunes.length / p);
assert.equal(word9.gp0, p - 1);
assert.deepEqual(H(word9.values), [A, p - 1]);
assert.equal(table[word9.gp0], "0x");

// A is independently repeated by the page-break word count.
assert.equal(p38PassageWords.length, A);

// Familywise matched control over every consecutive red 10/13-type interval.
const redEvents = ink.pages
  .flatMap((page) => (page.large_punctuation || [])
    .filter((mark) => mark[2] === "red")
    .map((mark) => ({ page: page.page, offset: mark[0], count: mark[1] })))
  .sort((left, right) => left.page - right.page || left.offset - right.offset);

/** @param {{page:number,offset:number,count:number}} left @param {{page:number,offset:number,count:number}} right */
function firstPhysicalPageBreak(left, right) {
  if (left.page === right.page) return null;
  const firstWords = physicalPageWords(left.page)
    .filter((word) => word.start >= left.offset);
  let nextPage = left.page + 1;
  while (nextPage === 50) nextPage += 1;
  if (nextPage > right.page) return null;
  const nextWords = physicalPageWords(nextPage);
  if (!nextWords.length) return null;
  return { wordsBefore: firstWords.length, nextPage, firstWord: nextWords[0] };
}

const comparable = [];
for (let index = 0; index + 1 < redEvents.length; index += 1) {
  const left = redEvents[index];
  const right = redEvents[index + 1];
  if (left.count + right.count !== p) continue;
  if (Math.abs(left.count - right.count) !== cubeExponent) continue;
  const interval = redInterval(left, right);
  const sixthWord = interval.words[5];
  const pageBreak = firstPhysicalPageBreak(left, right);
  comparable.push({
    left,
    right,
    runes: interval.runes.length,
    words: interval.words.length,
    rune6: interval.runes[5] ?? null,
    word6Text: sixthWord?.text ?? null,
    word6H: sixthWord?.values.length === 2 ? H(sixthWord.values) : null,
    jointMatch:
      interval.runes[5] === B &&
      sixthWord?.values.length === 2 &&
      H(sixthWord.values)[0] === a &&
      H(sixthWord.values)[1] === p - 1,
    lengthDivisibleByP: interval.runes.length % p === 0,
    lengthQuotient: interval.runes.length % p === 0
      ? interval.runes.length / p
      : null,
    pageBreak: pageBreak ? {
      wordsBefore: pageBreak.wordsBefore,
      nextPage: pageBreak.nextPage,
      firstWordText: pageBreak.firstWord.text,
      firstWordValues: pageBreak.firstWord.values,
      firstWordH: pageBreak.firstWord.values.length === 2
        ? H(pageBreak.firstWord.values)
        : null,
    } : null,
    jointPageBreak:
      interval.runes.length === 7 * p &&
      pageBreak?.wordsBefore === A &&
      pageBreak?.firstWord.values.length === 2 &&
      pageBreak.firstWord.values[0] === b &&
      pageBreak.firstWord.values[1] === interval.runes.length / p &&
      H(pageBreak.firstWord.values)[0] === A &&
      H(pageBreak.firstWord.values)[1] === p - 1,
  });
}
assert.equal(comparable.length, 6);
const passageBoundaryKey = [38, 186, 10, 39, 119, 13];
assert.deepEqual(
  comparable.filter((row) => row.jointMatch).map((row) => [
    row.left.page, row.left.offset, row.left.count,
    row.right.page, row.right.offset, row.right.count,
  ]),
  [passageBoundaryKey]
);
assert.deepEqual(
  comparable.filter((row) => row.jointPageBreak).map((row) => [
    row.left.page, row.left.offset, row.left.count,
    row.right.page, row.right.offset, row.right.count,
  ]),
  [passageBoundaryKey]
);
assert.deepEqual(
  comparable.filter((row) => row.lengthDivisibleByP).map((row) => [
    row.left.page, row.right.page, row.lengthQuotient,
  ]),
  [[38, 39, 7]]
);

// The DH tuple closes exactly.
assert.equal(powMod(g, a, p), A);
assert.equal(powMod(g, b, p), B);
assert.equal(powMod(B, a, p), K);
assert.equal(powMod(A, b, p), K);

console.log(JSON.stringify({
  status: "PASS",
  source: {
    opening: { page: 38, runeOffset: 186, redDots: 10 },
    closing: { page: 39, runeOffset: 119, redDots: 13 },
    p38Runes: p38PassageRunes.length,
    p38Words: p38PassageWords.length,
    p39Runes: p39PrefixRunes.length,
    p39Words: p39PassageWords.length,
    totalRunes: passageRunes.length,
    totalWords: passageWords.length,
  },
  boundaryState: {
    sum: 10 + 13,
    difference: 13 - 10,
    interpretation: { p, cubeExponent },
  },
  word6: {
    text: word6.text,
    values: word6.values,
    H: H(word6.values),
    rawSecond: word6.values[1],
    p50: table[word6.gp0],
  },
  rune6: {
    value: passageRunes[5],
    interpretation: "B",
    p50: table[passageRunes[5]],
  },
  pageBreak: {
    wordsBeforeBreak: p38PassageWords.length,
    firstWordAfterBreak: word9.text,
    values: word9.values,
    H: H(word9.values),
    p50: table[word9.gp0],
  },
  familywise: {
    comparableIntervals: comparable.length,
    jointSixthCoordinateMatches: comparable.filter((row) => row.jointMatch),
    pDivisibleIntervals: comparable.filter((row) => row.lengthDivisibleByP),
    jointPageBreakMatches: comparable.filter((row) => row.jointPageBreak),
  },
  dh: { p, g, a, A, b, B, K },
}, null, 2));
