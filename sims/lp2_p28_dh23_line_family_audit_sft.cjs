"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const parts = transcription.split(/^\s*%\s*$/m);
const tokens = grid.pages.flatMap((page) => page.tokens);
const alphabet59 = grid.alphabet.replace("f", "");

function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

function physicalLines(page) {
  return physicalPart(page).trim().split("/").filter((line) => line.trim().length > 0);
}

function lineRunes(line) {
  return [...line].map((rune) => runeIndex.get(rune)).filter((value) => value !== undefined);
}

function translit(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

function firstFragment(line) {
  const match = line.match(/[\u16A0-\u16FF]+/u);
  return match ? translit([...match[0]].map((rune) => runeIndex.get(rune))) : "";
}

function lineWords(line) {
  const matches = line.match(/[\u16A0-\u16FF]+/gu) || [];
  let offset = 0;
  return matches.map((text, index) => {
    const values = [...text].map((rune) => runeIndex.get(rune));
    const row = {
      number: index + 1,
      length: values.length,
      start1: offset + 1,
      end1: offset + values.length,
      text: translit(values),
    };
    offset += values.length;
    return row;
  });
}

function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d += 1) if (n % d === 0) return false;
  return true;
}

function nthPrime(n) {
  let count = 0;
  for (let value = 2; ; value += 1) {
    if (!isPrime(value)) continue;
    count += 1;
    if (count === n) return value;
  }
}

function powMod(base, exponent, modulus) {
  let result = 1;
  let factor = base % modulus;
  let e = exponent;
  while (e > 0) {
    if (e & 1) result = (result * factor) % modulus;
    factor = (factor * factor) % modulus;
    e >>= 1;
  }
  return result;
}

function multiplicativeOrder(g, p) {
  if (g <= 0 || g >= p) return 0;
  let value = 1;
  for (let k = 1; k < p; k += 1) {
    value = (value * g) % p;
    if (value === 1) return k;
  }
  return 0;
}

function decode59(token) {
  return alphabet59.indexOf(token[0]) * 59 + alphabet59.indexOf(token[1]);
}

function parseRuneWords(text) {
  const words = [];
  let current = [];
  for (const char of [...text]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      current.push(value);
    } else if (current.length) {
      words.push(current);
      current = [];
    }
  }
  if (current.length) words.push(current);
  return words;
}

const targetTuple = {p: 23, g: 5, a: 6, B: 19};
const targetMultiset = [5, 6, 19, 23].join(",");

const allLines = [];
const naturalDhRows = [];
const targetMultisetRows = [];

for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const lines = physicalLines(page);
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    const values = lineRunes(line);
    const words = lineWords(line);
    const fragment = firstFragment(line);
    allLines.push({
      page,
      line: lineIndex + 1,
      length: values.length,
      firstFragment: fragment,
      firstFragmentRunes: fragment ? (line.match(/[\u16A0-\u16FF]+/u)[0].length) : 0,
    });

    for (const word of words) {
      for (const origin of [0, 1]) {
        const sourceValues = [values.length, word.length, lineIndex + origin, word.start1];
        if (sourceValues.slice().sort((a, b) => a - b).join(",") === targetMultiset) {
          targetMultisetRows.push({
            page,
            line: lineIndex + 1,
            origin,
            word: word.number,
            sourceValues,
            firstFragment: fragment,
            firstFragmentRunes: fragment ? (line.match(/[\u16A0-\u16FF]+/u)[0].length) : 0,
            wordText: word.text,
            lastWord: word.number === words.length,
          });
        }

        const [p, g, a, B] = sourceValues;
        if (
          isPrime(p) && p > 2 &&
          g > 1 && g < p &&
          a > 0 && a < p &&
          B > 0 && B < p &&
          multiplicativeOrder(g, p) === p - 1
        ) {
          naturalDhRows.push({
            page,
            line: lineIndex + 1,
            origin,
            word: word.number,
            p, g, a, B,
            A: powMod(g, a, p),
            K: powMod(B, a, p),
            firstFragment: fragment,
            firstFragmentRunes: fragment ? (line.match(/[\u16A0-\u16FF]+/u)[0].length) : 0,
            wordText: word.text,
            lastWord: word.number === words.length,
          });
        }
      }
    }
  }
}

assert.equal(allLines.length, 604);
assert.equal(naturalDhRows.length, 424);
assert.deepEqual(targetMultisetRows, [
  {
    page: 8, line: 6, origin: 1, word: 6,
    sourceValues: [23, 5, 6, 19],
    firstFragment: "YSHUL", firstFragmentRunes: 5,
    wordText: "AOJIAU", lastWord: true,
  },
  {
    page: 28, line: 6, origin: 1, word: 5,
    sourceValues: [23, 5, 6, 19],
    firstFragment: "DH", firstFragmentRunes: 2,
    wordText: "EAAIUL", lastWord: true,
  },
]);

const exactNaturalTupleRows = naturalDhRows.filter((row) =>
  row.p === targetTuple.p &&
  row.g === targetTuple.g &&
  row.a === targetTuple.a &&
  row.B === targetTuple.B
);
assert.equal(exactNaturalTupleRows.length, 2);
assert.deepEqual(
  exactNaturalTupleRows.map((row) => [row.page, row.line, row.firstFragment]),
  [[8, 6, "YSHUL"], [28, 6, "DH"]]
);

const dhFragmentLines = allLines.filter((row) => row.firstFragment === "DH");
assert.deepEqual(
  dhFragmentLines.map((row) => [row.page, row.line, row.length]),
  [[28, 6, 23]]
);

const twoRuneFragmentLines = allLines.filter((row) => row.firstFragmentRunes === 2);
assert.equal(twoRuneFragmentLines.length, 120);
assert.equal(
  targetMultisetRows.filter((row) => row.firstFragmentRunes === 2).length,
  1
);

// Exact source-preserving null:
// keep every line/word geometry fixed and permute first fragments only among
// lines with the same first-fragment rune length. There is one literal DH
// fragment among the 120 two-rune starts and one target-tuple geometry in that
// stratum, giving exact probability 1/120.
const lengthStratifiedDhNull = 1 / twoRuneFragmentLines.length;
assert.equal(lengthStratifiedDhNull, 1 / 120);

// Predeclared p57 punctuation holdout.
const marks = [];
for (const page of ink.pages) {
  for (const [offset, dots, color] of page.large_punctuation || []) {
    marks.push({page: page.page, offset, dots, color});
  }
}
const dotHistogram = {};
for (const mark of marks) dotHistogram[mark.dots] = (dotHistogram[mark.dots] || 0) + 1;
assert.deepEqual(dotHistogram, {"10": 4, "13": 31, "23": 1});
assert.deepEqual(
  marks.filter((mark) => mark.dots === 23),
  [{page: 57, offset: 95, dots: 23, color: "red"}]
);

const p57 = solved.sections.find((section) => section.name === "p57_parable");
assert.ok(p57);
const p57Rows = parseRuneWords(p57.source_text).map((word) => ({
  text: translit(word),
  gp0: word.reduce((sum, value) => sum + value, 0),
}));
const emerge = p57Rows.find((row) => row.text === "EMERGE");
assert.deepEqual(emerge, {text: "EMERGE", gp0: 83});

const dotClosures = [10, 13, 23].map((dots) => {
  const prime = nthPrime(dots);
  const token = prime < tokens.length ? tokens[prime] : null;
  const table59 = token ? decode59(token) : null;
  return {
    dots,
    nthPrime: prime,
    directEmerge: prime === emerge.gp0,
    p50Token: token,
    p50Base59: table59,
    tableEmerge: table59 === emerge.gp0,
  };
});
assert.deepEqual(dotClosures, [
  {dots: 10, nthPrime: 29, directEmerge: false, p50Token: "16", p50Base59: 65, tableEmerge: false},
  {dots: 13, nthPrime: 41, directEmerge: false, p50Token: "1O", p50Base59: 83, tableEmerge: true},
  {dots: 23, nthPrime: 83, directEmerge: true, p50Token: "3D", p50Base59: 190, tableEmerge: false},
]);

console.log(JSON.stringify({
  status: "PASS: p28 DH23 line family audited with a duplicate geometry and independent p57 punctuation holdout",
  lineFamily: {
    physicalLines: allLines.length,
    naturalPrimitiveRootDhRows: naturalDhRows.length,
    exactTargetTupleRows: exactNaturalTupleRows,
    targetTupleMultisetRows,
    uniqueLiteralDhLines: dhFragmentLines,
    twoRuneFirstFragmentLines: twoRuneFragmentLines.length,
    exactLengthStratifiedDhNull: lengthStratifiedDhNull,
  },
  punctuationHoldout: {
    dotHistogram,
    unique23DotMark: marks.filter((mark) => mark.dots === 23),
    emerge,
    dotClosures,
  },
  decision:
    "The tuple geometry (23,5,6,19) is duplicated on p8 and p28, so geometry alone is not unique. P28 is uniquely labeled DH, and under a first-fragment-length-preserving permutation the unique DH label lands on the sole two-rune-start target-tuple line with exact probability 1/120. Independently, the predeclared p57 punctuation holdout selects 23 because the unique terminal 23-dot mark has 23rd prime=83=GP0(EMERGE), while 13 reaches the same 83 through p50 cell41/base59; dot-count10 does neither. Retain p=23/DH as source-constrained, but do not treat the raw tuple geometry as unique evidence.",
}, null, 2));
