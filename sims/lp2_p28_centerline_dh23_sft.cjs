"use strict";

/**
 * Source-exact p28 center-line DH23 selector.
 *
 * Frozen upstream selection:
 *   solved p57 GP0/table navigation gives FIND -> 28;
 *   physical p28 word28 is independently selected by page number and exact
 *   center placement.
 *
 * This SFT tests the untouched physical-line consequences of that object:
 *   - its physical line is the only LP2 line whose first visible fragment is DH;
 *   - line number / line length / word length / local start are 6/23/5/19;
 *   - those are a complete standard DH instance p=23, g=5, a=6, B=19;
 *   - the unique discrete log is b=15, giving A=8 and K=2;
 *   - both nested circumferences of the selected five-rune word sum to K mod p;
 *   - among all five-rune words p0..p55, only p28 word28 has both shell sums K;
 *   - p50 center token 13 has the prime-inverse continuation 13th prime=41,
 *     whose base59 table value is EMERGE=83.
 *
 * Run from repository root:
 *   node sims/lp2_p28_centerline_dh23_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const tokens = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");
const parts = transcription.split(/^\s*%\s*$/m);

function decode(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return high * alphabet.length + low;
}

function decode59(token) {
  return decode(token, alphabet59);
}

function parseWords(text) {
  const normalized = text.replace(/\/\s*/gu, "");
  return (normalized.match(/[\u16A0-\u16FF]+/gu) || []).map((word) =>
    [...word].map((rune) => {
      const value = runeIndex.get(rune);
      assert.notEqual(value, undefined);
      return value;
    })
  );
}

function translit(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

function gp0(values) {
  return values.reduce((sum, value) => sum + value, 0);
}

function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

function physicalLines(page) {
  return physicalPart(page).trim().split("/").filter((line) => line.trim().length > 0);
}

function lineRunes(line) {
  return [...line]
    .map((rune) => runeIndex.get(rune))
    .filter((value) => value !== undefined);
}

function firstFragment(line) {
  const match = line.match(/[\u16A0-\u16FF]+/u);
  return match ? translit([...match[0]].map((rune) => runeIndex.get(rune))) : "";
}

function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d += 1) {
    if (n % d === 0) return false;
  }
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
  let power = exponent;
  while (power > 0) {
    if (power % 2 === 1) result = (result * factor) % modulus;
    factor = (factor * factor) % modulus;
    power = Math.floor(power / 2);
  }
  return result;
}

function discreteLog(base, target, modulus) {
  const hits = [];
  for (let exponent = 1; exponent < modulus; exponent += 1) {
    if (powMod(base, exponent, modulus) === target) hits.push(exponent);
  }
  return hits;
}

const p57 = solved.sections.find((section) => section.name === "p57_parable");
assert.ok(p57);
const p57Rows = parseWords(p57.source_text).map((word) => ({
  text: translit(word),
  gp0: gp0(word),
}));
const p57Word = (text) => {
  const row = p57Rows.find((candidate) => candidate.text === text);
  assert.ok(row);
  return row;
};
const emerge = p57Word("EMERGE");
const divinity = p57Word("DIUINITY");
assert.equal(emerge.gp0, 83);
assert.equal(divinity.gp0, 105);

const p28Words = parseWords(physicalPart(28));
assert.equal(p28Words.length, 59);
const selected = p28Words[27];
assert.deepEqual(selected, [28, 24, 10, 1, 20]);
assert.equal(selected.length, 5);
assert.equal(gp0(selected), emerge.gp0);

const p28Lines = physicalLines(28);
assert.equal(p28Lines.length, 12);
const selectedLineNumber = 6;
const selectedLine = p28Lines[selectedLineNumber - 1];
const selectedLineValues = lineRunes(selectedLine);
assert.equal(selectedLineValues.length, 23);
assert.equal(firstFragment(selectedLine), "DH");

let wordOffset = 0;
const wordSpans = p28Words.map((word, index) => {
  const start = wordOffset;
  wordOffset += word.length;
  return { number: index + 1, start, end: wordOffset - 1, length: word.length, values: word };
});
let lineOffset = 0;
const lineSpans = p28Lines.map((line, index) => {
  const length = lineRunes(line).length;
  const row = { number: index + 1, start: lineOffset, end: lineOffset + length - 1, length };
  lineOffset += length;
  return row;
});
const selectedSpan = wordSpans[27];
const line6Span = lineSpans[5];
assert.deepEqual(
  { start: selectedSpan.start, end: selectedSpan.end },
  { start: 135, end: 139 }
);
assert.deepEqual(
  { start: line6Span.start, end: line6Span.end, length: line6Span.length },
  { start: 117, end: 139, length: 23 }
);
const localStartOneBased = selectedSpan.start - line6Span.start + 1;
const localEndOneBased = selectedSpan.end - line6Span.start + 1;
assert.equal(localStartOneBased, 19);
assert.equal(localEndOneBased, 23);

const dhStarts = [];
let totalPhysicalLines = 0;
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const lines = physicalLines(page);
  for (let index = 0; index < lines.length; index += 1) {
    totalPhysicalLines += 1;
    if (firstFragment(lines[index]) === "DH") {
      dhStarts.push({ page, line: index + 1 });
    }
  }
}
assert.equal(totalPhysicalLines, 604);
assert.deepEqual(dhStarts, [{ page: 28, line: 6 }]);

const p = selectedLineValues.length;
const g = selected.length;
const a = selectedLineNumber;
const B = localStartOneBased;
assert.deepEqual({ p, g, a, B }, { p: 23, g: 5, a: 6, B: 19 });
assert.equal(powMod(g, p - 1, p), 1);
assert.notEqual(powMod(g, (p - 1) / 2, p), 1);

const bHits = discreteLog(g, B, p);
assert.deepEqual(bHits, [15]);
const b = bHits[0];
const A = powMod(g, a, p);
const K = powMod(B, a, p);
assert.deepEqual({ b, A, K }, { b: 15, A: 8, K: 2 });
assert.equal(powMod(A, b, p), K);
assert.ok(grid.pages.every((page) => page.cols === A));

const outerCircumference = [selected[0], selected[4]];
const innerCircumference = [selected[1], selected[3]];
assert.equal(gp0(outerCircumference) % p, K);
assert.equal(gp0(innerCircumference) % p, K);

const doubleSharedWords = [];
let fiveRuneWords = 0;
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const words = parseWords(physicalPart(page));
  for (let index = 0; index < words.length; index += 1) {
    const word = words[index];
    if (word.length !== 5) continue;
    fiveRuneWords += 1;
    const outer = (word[0] + word[4]) % p;
    const inner = (word[1] + word[3]) % p;
    if (outer === K && inner === K) {
      doubleSharedWords.push({ page, word: index + 1, values: word });
    }
  }
}
assert.equal(fiveRuneWords, 318);
assert.deepEqual(doubleSharedWords, [
  { page: 28, word: 28, values: [28, 24, 10, 1, 20] },
]);

const red13Objects = [];
for (const page of ink.pages) {
  for (const span of page.red_spans || []) {
    const end = span.start + span.length;
    const mark = (page.large_punctuation || []).find((candidate) =>
      candidate[0] === end && candidate[1] === 13 && candidate[2] === "red"
    );
    if (mark) red13Objects.push({ page: page.page, length: span.length });
  }
}
assert.deepEqual(
  red13Objects.filter((row) => row.length === B),
  [{ page: 27, length: 19 }]
);
assert.equal(B - 13, a);

assert.equal(tokens[divinity.gp0], "13");
const prime13 = nthPrime(13);
assert.equal(prime13, 41);
assert.equal(tokens[prime13], "1O");
assert.equal(decode59(tokens[prime13]), emerge.gp0);

console.log(JSON.stringify({
  status: "PASS: p28 center line directly selects the complete DH23 worked tuple",
  p28: {
    physicalLines: p28Lines.length,
    selectedLine: selectedLineNumber,
    selectedLineRunes: selectedLineValues.length,
    uniqueDHLineStarts: dhStarts,
    selectedWord: 28,
    selectedWordValues: selected,
    selectedWordLength: selected.length,
    selectedWordLinePositions: [localStartOneBased, localEndOneBased],
  },
  dh23: { p, g, a, B, b, A, K },
  circumferences: {
    outer: outerCircumference,
    outerMod23: gp0(outerCircumference) % p,
    inner: innerCircumference,
    innerMod23: gp0(innerCircumference) % p,
    fiveRuneWords,
    doubleSharedWords,
  },
  p27Prediction: {
    publicB: B,
    redMarker: 13,
    uniquePage: red13Objects.find((row) => row.length === B).page,
    residual: B - 13,
  },
  center13: {
    divinityAddress: divinity.gp0,
    token: tokens[divinity.gp0],
    thirteenthPrime: prime13,
    targetToken: tokens[prime13],
    base59: decode59(tokens[prime13]),
    target: "EMERGE",
  },
}, null, 2));
