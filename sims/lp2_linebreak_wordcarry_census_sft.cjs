"use strict";

/**
 * Director #1557: classify every original p0-p55 physical rune-line break
 * against the repository's canonical complete-word grammar.
 *
 * Run from repository root:
 *   node sims/lp2_linebreak_wordcarry_census_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const transcription = fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-transcription.txt"), "utf8");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));

const runeSet = new Set(corpus.runes);
const parts = transcription.split(/^%$/m);
assert.equal(parts.length, 57);

const sourcePages = [];
for (let page = 0; page <= 55; page++) {
  if (page === 50) continue;
  sourcePages.push({
    page,
    body: parts[page < 50 ? page : page - 1]
  });
}

let globalRune = 0;
let currentWord = [];
let wordStart = 0;
const words = [];
const lineBreaks = [];

/** Finish the current canonical word. */
function finishWord() {
  if (!currentWord.length) return;
  words.push({
    start: wordStart,
    end: globalRune,
    length: globalRune - wordStart
  });
  currentWord = [];
}

for (const { page, body } of sourcePages) {
  let line = 1;
  for (const ch of body) {
    if (runeSet.has(ch)) {
      if (!currentWord.length) wordStart = globalRune;
      currentWord.push(ch);
      globalRune++;
    } else if (ch === "/") {
      lineBreaks.push({
        page,
        lineBefore: line,
        lineAfter: line + 1,
        boundary: globalRune
      });
      line++;
    } else if (/\s/u.test(ch)) {
      // Canonical source wrapping/whitespace does not terminate a word.
    } else {
      finishWord();
    }
  }
}
finishWord();

assert.equal(globalRune, 12956);
assert.equal(words.length, 2896);

let wordIndex = 0;
for (const lineBreak of lineBreaks) {
  while (wordIndex < words.length && words[wordIndex].end <= lineBreak.boundary) {
    wordIndex++;
  }
  const word = words[wordIndex];
  if (word && word.start < lineBreak.boundary && lineBreak.boundary < word.end) {
    Object.assign(lineBreak, {
      kind: "split",
      wordStart: word.start,
      wordEnd: word.end,
      wordLength: word.length,
      prefix: lineBreak.boundary - word.start,
      suffix: word.end - lineBreak.boundary
    });
  } else {
    lineBreak.kind = "boundary";
  }
}

/**
 * Keep only breaks between two rune-bearing printed lines.
 *
 * @param {{page:number,lineBefore:number,lineAfter:number}} lineBreak
 * @returns {boolean}
 */
function isRuneLineBreak(lineBreak) {
  const page = sourcePages.find((item) => item.page === lineBreak.page);
  assert.ok(page);
  const lines = page.body.split(/\/\r?\n/u);
  const before = lines[lineBreak.lineBefore - 1] || "";
  const after = lines[lineBreak.lineAfter - 1] || "";
  return [...before].some((ch) => runeSet.has(ch)) &&
    [...after].some((ch) => runeSet.has(ch));
}

const runeLineBreaks = lineBreaks.filter(isRuneLineBreak);
const splitBreaks = runeLineBreaks.filter((lineBreak) => lineBreak.kind === "split");
const boundaryBreaks = runeLineBreaks.filter((lineBreak) => lineBreak.kind === "boundary");
const split42 = splitBreaks.filter((lineBreak) =>
  lineBreak.prefix === 4 && lineBreak.suffix === 2);

assert.equal(runeLineBreaks.length, 539);
assert.equal(boundaryBreaks.length, 151);
assert.equal(splitBreaks.length, 388);
assert.equal(split42.length, 13);

assert.deepEqual(
  split42.map((lineBreak) => [lineBreak.page, lineBreak.lineBefore, lineBreak.boundary]),
  [
    [6, 9, 1644],
    [8, 7, 2012],
    [9, 3, 2194],
    [11, 1, 2684],
    [17, 2, 4075],
    [28, 5, 6878],
    [32, 2, 7887],
    [37, 2, 8987],
    [43, 10, 10646],
    [45, 1, 10985],
    [47, 2, 11551],
    [52, 3, 12272],
    [55, 3, 12948]
  ]
);

const p55Target = runeLineBreaks.find((lineBreak) =>
  lineBreak.page === 55 && lineBreak.lineBefore === 3 && lineBreak.lineAfter === 4);
assert.deepEqual(p55Target, {
  page: 55,
  lineBefore: 3,
  lineAfter: 4,
  boundary: 12948,
  kind: "split",
  wordStart: 12944,
  wordEnd: 12950,
  wordLength: 6,
  prefix: 4,
  suffix: 2
});

const visualChapters = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];

const terminalControls = visualChapters.map(([firstPage, lastPage]) => {
  const candidates = runeLineBreaks.filter((lineBreak) => lineBreak.page === lastPage);
  const lineBreak = candidates[candidates.length - 1];
  assert.ok(lineBreak);
  return {
    chapter: `p${firstPage}-p${lastPage}`,
    kind: lineBreak.kind,
    prefix: lineBreak.prefix || null,
    suffix: lineBreak.suffix || null,
    page: lineBreak.page,
    lineBefore: lineBreak.lineBefore,
    boundary: lineBreak.boundary
  };
});

assert.deepEqual(
  terminalControls.map(({ kind, prefix, suffix }) => [kind, prefix, suffix]),
  [
    ["split", 2, 8],
    ["boundary", null, null],
    ["boundary", null, null],
    ["split", 1, 6],
    ["split", 3, 5],
    ["split", 2, 3],
    ["split", 1, 3],
    ["boundary", null, null],
    ["split", 4, 2]
  ]
);
assert.equal(terminalControls.filter((item) => item.kind === "split").length, 6);

const splitDistribution = {};
for (const lineBreak of splitBreaks) {
  const key = `${lineBreak.prefix}/${lineBreak.suffix}`;
  splitDistribution[key] = (splitDistribution[key] || 0) + 1;
}

console.log(JSON.stringify({
  canonicalRunes: globalRune,
  canonicalWords: words.length,
  physicalRuneLineBreaks: runeLineBreaks.length,
  completeWordBoundaryBreaks: boundaryBreaks.length,
  splitWordBreaks: splitBreaks.length,
  splitRate: splitBreaks.length / runeLineBreaks.length,
  exact4By2Count: split42.length,
  exact4By2Pages: split42.map((lineBreak) => lineBreak.page),
  p55Target,
  visualChapterFinalLineControls: terminalControls,
  splitDistribution
}, null, 2));

console.log("PASS: 388/539 rune-line breaks split canonical words; p55 4/2 is one of 13 exact 4/2 splits.");
