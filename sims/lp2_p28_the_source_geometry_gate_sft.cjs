"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p));
const text = (p) => read(p).toString("utf8").replace(/\r/g, "");
const corpus = JSON.parse(text("resources/liber-primus/lp2-corpus.json"));
const transcription = text("resources/liber-primus/lp2-transcription.txt").split(/^\s*%\s*$/m);
const runeId = new Map(corpus.runes.map((rune, i) => [rune, i]));

const image = read("resources/liber-primus/45.jpg");
assert.equal(
  crypto.createHash("sha256").update(image).digest("hex"),
  "318bb587f4dcab11b4db7ba3b8bb13b7913ca79bb409e1c987595503a22e0522"
);

function physicalText(page) {
  if (page === 50) return "";
  return transcription[page >= 51 ? page - 1 : page];
}

function geometry(page) {
  const lines = physicalText(page).split("\n");
  let offset = 0;
  const lineStarts = new Map();
  const lineEnds = new Map();
  const ordinals = new Map();
  let ordinal = 0;

  for (const [lineIndex, line] of lines.entries()) {
    const start = offset;
    for (const ch of line) if (runeId.has(ch)) offset += 1;
    if (offset > start) {
      ordinal += 1;
      lineStarts.set(lineIndex, start);
      lineEnds.set(lineIndex, offset - 1);
      ordinals.set(lineIndex, ordinal);
    }
  }

  const offsetToLine = new Map();
  for (const [lineIndex, start] of lineStarts.entries()) {
    for (let i = start; i <= lineEnds.get(lineIndex); i += 1) offsetToLine.set(i, lineIndex);
  }

  const words = [];
  let values = [];
  let start = null;
  let sepBefore = null;
  let lastSep = null;
  let currentOffset = 0;
  const emit = (sepAfter) => {
    if (!values.length) return;
    words.push({
      start,
      end: start + values.length - 1,
      length: values.length,
      values: values.slice(),
      sepBefore,
      sepAfter,
    });
    values = [];
    start = null;
    sepBefore = null;
  };

  for (const line of lines) {
    for (const ch of line) {
      if (runeId.has(ch)) {
        if (start === null) {
          start = currentOffset;
          sepBefore = lastSep;
        }
        values.push(runeId.get(ch));
        currentOffset += 1;
      } else if ("-.&$§".includes(ch)) {
        emit(ch);
        lastSep = ch;
      }
    }
    // Printed line wrap is layout only, not a canonical word delimiter.
  }
  emit(null);
  assert.equal(currentOffset, offset);

  const interiorLineStarts = new Set(
    [...lineStarts.entries()]
      .filter(([lineIndex]) => ordinals.get(lineIndex) > 1)
      .map(([, startOffset]) => startOffset)
  );

  return { words, lineStarts, lineEnds, ordinals, offsetToLine, interiorLineStarts };
}

const p28 = geometry(28);
const p28Two = p28.words.filter((word) => word.length === 2);
assert.deepEqual(p28Two.map((word) => word.start), [0,38,40,140,161,167,234,246,248]);

const p28LineStartTwo = p28Two.filter((word) => {
  const line = p28.offsetToLine.get(word.start);
  return p28.lineStarts.get(line) === word.start;
});
assert.deepEqual(p28LineStartTwo.map((word) => word.start), [0,140]);

const p28InteriorLineStartTwo = p28Two.filter((word) => p28.interiorLineStarts.has(word.start));
assert.deepEqual(p28InteriorLineStartTwo.map((word) => word.start), [140]);

const interiorCanonicalStarts = [...p28.interiorLineStarts]
  .map((start) => {
    const word = p28.words.find((candidate) => candidate.start === start);
    if (!word) return null;
    const line = p28.offsetToLine.get(start);
    return { line: p28.ordinals.get(line), start, length: word.length };
  })
  .filter(Boolean);
assert.deepEqual(interiorCanonicalStarts, [
  { line: 4, start: 71, length: 5 },
  { line: 7, start: 140, length: 2 },
  { line: 11, start: 229, length: 1 },
]);


// Matched adjacent-page control: p27 has the same local selector shape.
const p27 = geometry(27);
const p27Two = p27.words.filter((word) => word.length === 2);
assert.equal(p27Two.length, 11);
const p27InteriorLineStartTwo = p27Two.filter((word) => p27.interiorLineStarts.has(word.start));
assert.deepEqual(p27InteriorLineStartTwo.map((word) => word.start), [120]);

function lineBoundaryTemplate(g, nextStart) {
  const nextIndex = g.words.findIndex((word) => word.start === nextStart);
  assert.ok(nextIndex >= 2);
  const previous = g.words[nextIndex - 1];
  const before = g.words[nextIndex - 2];
  const next = g.words[nextIndex];
  const nextLine = g.offsetToLine.get(next.start);
  const previousLine = g.offsetToLine.get(previous.end);
  assert.equal(g.lineStarts.get(nextLine), next.start);
  assert.equal(g.lineEnds.get(previousLine), previous.end);
  return [before.length, previous.length, next.length];
}
assert.deepEqual(lineBoundaryTemplate(p27, 120), [4,5,2]);
assert.deepEqual(lineBoundaryTemplate(p28, 140), [4,5,2]);

// Only after the geometry selector is fixed do we inspect the selected runes.
assert.deepEqual(p28InteriorLineStartTwo[0].values, [24,25]);

let totalTwo = 0;
let interiorTwo = 0;
let pagesWithInteriorTwo = 0;
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const g = geometry(page);
  const twos = g.words.filter((word) => word.length === 2);
  const hits = twos.filter((word) => g.interiorLineStarts.has(word.start));
  totalTwo += twos.length;
  interiorTwo += hits.length;
  if (hits.length) pagesWithInteriorTwo += 1;
}
assert.equal(totalTwo, 465);
assert.equal(interiorTwo, 28);
assert.equal(pagesWithInteriorTwo, 25);

console.log(JSON.stringify({
  classification:
    "page-local p28 coordinate selector with a matched p27 typography control; not independent authentication and not a repair of the failed general +6/H-shell rule",
  p28: {
    canonicalWords: p28.words.length,
    canonicalTwoRuneStarts: p28Two.map((word) => word.start),
    lineStartTwoRuneStarts: p28LineStartTwo.map((word) => word.start),
    interiorLineStartTwoRuneStarts: p28InteriorLineStartTwo.map((word) => word.start),
    interiorCanonicalLineStarts: interiorCanonicalStarts,
    selectedOffset: 140,
  },
  matchedAdjacentControl: {
    page: 27,
    completeTwoRuneWords: p27Two.length,
    interiorLineStartTwoRuneStarts: p27InteriorLineStartTwo.map((word) => word.start),
    p27Template: lineBoundaryTemplate(p27, 120),
    p28Template: lineBoundaryTemplate(p28, 140),
  },
  matchedWholeBookContext: {
    completeTwoRuneWords: totalTwo,
    interiorLineStartTwoRuneWords: interiorTwo,
    pagesWithInteriorLineStartTwoRuneWord: pagesWithInteriorTwo,
  },
  decision:
    "once p28 and the complete-two-rune operand type are fixed independently, printed geometry selects offset140, but matched p27 typography prevents treating that layout as independent authorship evidence",
}, null, 2));
