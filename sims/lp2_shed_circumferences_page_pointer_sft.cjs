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
function H(pair) {
  const [left, right] = pair;
  return [mod29(left - right), mod29(left + right)];
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const parts = transcription.split(/^\s*%\s*$/m);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

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

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/** @param {number} page @returns {{start:number,end:number,values:number[]}[]} */
function wordRows(page) {
  let offset = 0;
  return runeWords(physicalPart(page)).map((values) => {
    const row = { start: offset, end: offset + values.length, values };
    offset = row.end;
    return row;
  });
}

/** @param {number[]} values @returns {string} */
function spell(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

/**
 * Literal "shed circumference" of a printed rune word: remove its first and
 * last rune. One-rune and two-rune words have empty interiors.
 * @param {number[]} word
 * @returns {number[]}
 */
function shedWord(word) {
  return word.length <= 2 ? [] : word.slice(1, -1);
}

/** @param {number[][]} words @returns {number[]} */
function shedWords(words) {
  return words.flatMap(shedWord);
}

/**
 * Bodies begin immediately after a red span and end at the next red span on
 * the same page or at the page's final rune.
 * @returns {{page:number,start:number,titleLength:number,body:number[][],inner:number[]}[]}
 */
function redStartedBodies() {
  const out = [];
  for (const page of ink.pages) {
    if (page.page === 50) continue;
    const rows = wordRows(page.page);
    const spans = [...(page.red_spans || [])].sort((a, b) => a.start - b.start);
    for (let i = 0; i < spans.length; i += 1) {
      const span = spans[i];
      const bodyStart = span.start + span.length;
      const bodyEnd = i + 1 < spans.length ? spans[i + 1].start : rows.at(-1)?.end ?? bodyStart;
      const body = rows
        .filter((row) => row.start >= bodyStart && row.end <= bodyEnd)
        .map((row) => row.values);
      if (body.length === 0) continue;
      out.push({
        page: page.page,
        start: span.start,
        titleLength: span.length,
        body,
        inner: shedWords(body),
      });
    }
  }
  return out;
}

const p57 = solved.sections.find((section) => section.name === "p57_parable");
assert.ok(p57);
const p57Words = runeWords(p57.source_text);
assert.equal(spell(p57Words[0]), "PARABLE");
const p57BodySolved = p57Words.slice(1);
const p57Spelling = p57BodySolved.map(spell);
const instruction = ["WE", "MUST", "SHED", "OUR", "OWN", "CIRCUMFERENCES", "FIND", "THE", "DIUINITY", "WITHIN", "AND", "EMERGE"];
assert.ok(
  instruction.every((word, i) =>
    p57Spelling.slice(0, p57Spelling.length - instruction.length + 1).some(
      (_, start) => p57Spelling[start + i] === word &&
        instruction.every((expected, j) => p57Spelling[start + j] === expected)
    )
  )
);
assert.equal(p57BodySolved.length, 19);
assert.equal(p57BodySolved.flat().length, 88);
assert.equal(shedWords(p57BodySolved).length, 50);

// The canonical physical transcription must independently reproduce the same
// p57 body geometry selected by its red PARABLE title.
const bodies = redStartedBodies();
const p57Body = bodies.find((row) => row.page === 57 && row.start === 0);
assert.ok(p57Body);
assert.equal(p57Body.titleLength, 7);
assert.equal(p57Body.body.length, 19);
assert.equal(p57Body.body.flat().length, 88);
assert.equal(p57Body.inner.length, 50);
assert.equal(JSON.stringify(p57Body.body), JSON.stringify(p57BodySolved));

// p50 is the unique non-runic physical page and carries the 256-cell number
// table. The literal solved-page instruction therefore yields its page number.
assert.equal(grid.lp2_pages.includes(p57Body.inner.length), true);
assert.equal(p57Body.inner.length, 50);

// Existing p50/DH route: B=19 selects physical p33.
const B = 19;
const p = 23;
const g = 5;
const a = 6;
const A = 8;
const K = 2;
const b = 15;
const e = 3;
const q = 4;
assert.equal(grid.byte_rows.flat()[B], 33);

// P33's second red heading begins [B+K,K]. Under the frozen H orientation it
// yields [B,p], matching the original-image decorative M plus first title D.
// A second H yields [GP0(WE),13], reconnecting the page to the solved p57
// instruction and the literal red 13-dot title punctuation.
const p33Rows = wordRows(33);
const p33FirstTitle = p33Rows.filter((row) => row.start >= 0 && row.end <= 10);
const p33SecondTitle = p33Rows.filter((row) => row.start >= 91 && row.end <= 99);
assert.deepEqual(p33SecondTitle[0].values.slice(0, 2), [B + K, K]);
assert.deepEqual(H(p33SecondTitle[0].values.slice(0, 2)), [B, p]);
assert.equal(corpus.translit.indexOf("M"), B);
assert.equal(p33FirstTitle[0].values[0], p);
const weGp0 = corpus.translit.indexOf("W") + corpus.translit.indexOf("E");
assert.equal(weGp0, 25);
assert.deepEqual(H([B, p]), [weGp0, 13]);

const p33Ink = ink.pages.find((page) => page.page === 33);
assert.ok(p33Ink);
assert.ok(p33Ink.large_punctuation.some(([offset, dots, color]) =>
  offset === 10 && dots === 13 && color === "red"
));

// Transfer the clear p57 operation unchanged to p33's first black body.
const p33FirstBody = bodies.find((row) => row.page === 33 && row.start === 0);
assert.ok(p33FirstBody);
assert.equal(p33FirstBody.titleLength, A + K);
assert.equal(p33FirstBody.body.length, p - K);
assert.equal(p33FirstBody.body.flat().length, e ** q);
assert.equal(p33FirstBody.inner.length, 39);

// The transferred target p39 carries an independent DH/H holdout in its only
// red three-rune rubric. Its GP values are [-K,g,b]. Repeated frozen H on the
// first two values yields [p-1,e] -> [B,GP0(WE)] -> [p,b], and the last value
// is already the literal third red rune. None of these values was used to
// obtain the p33 shed-count pointer 39.
const p39Ink = ink.pages.find((page) => page.page === 39);
assert.ok(p39Ink);
assert.equal(p39Ink.red_spans.length, 1);
const p39Red = [...p39Ink.red_spans[0].runes].map((rune) => {
  const value = runeIndex.get(rune);
  assert.notEqual(value, undefined);
  return value;
});
assert.deepEqual(p39Red, [mod29(-K), g, b]);
const p39H1 = H(p39Red.slice(0, 2));
const p39H2 = H(p39H1);
const p39H3 = H(p39H2);
assert.deepEqual(p39H1, [p - 1, e]);
assert.deepEqual(p39H2, [B, weGp0]);
assert.deepEqual(p39H3, [p, b]);
assert.equal(p39H3[1], p39Red[2]);

const length3Red = [];
for (const page of ink.pages) {
  for (const span of page.red_spans || []) {
    if (span.length !== 3) continue;
    length3Red.push({
      page: page.page,
      start: span.start,
      values: [...span.runes].map((rune) => runeIndex.get(rune)),
    });
  }
}
assert.deepEqual(length3Red, [
  { page: 3, start: 119, values: [13, 23, 2] },
  { page: 39, start: 119, values: [mod29(-K), g, b] },
]);

// A third source body gives a frozen further prediction under the same literal
// operation, without assigning that output a meaning here.
const p3SecondBody = bodies.find((row) => row.page === 3 && row.start === 119);
assert.ok(p3SecondBody);
assert.equal(p3SecondBody.body.length, 21);
assert.equal(p3SecondBody.body.flat().length, 95);
assert.equal(p3SecondBody.inner.length, 53);

// Full red-body census under the same rule. This includes one-rune words by
// giving them empty interiors, so the 39/50 results do not depend on a special
// eligibility exception.
const census = bodies.map((row) => ({
  page: row.page,
  start: row.start,
  titleLength: row.titleLength,
  bodyWords: row.body.length,
  bodyRunes: row.body.flat().length,
  oneRuneWords: row.body.filter((word) => word.length === 1).length,
  innerRunes: row.inner.length,
}));
assert.equal(census.length, 15);
assert.deepEqual(
  census.filter((row) => row.innerRunes <= 57).map((row) => [row.page, row.start, row.innerRunes]),
  [[3,119,53],[33,0,39],[56,0,35],[57,0,50]]
);

console.log(JSON.stringify({
  status: "PASS",
  solvedInstruction: {
    title: "PARABLE",
    text: p57Spelling.join(" "),
    bodyWords: p57Body.body.length,
    bodyRunes: p57Body.body.flat().length,
    afterSheddingCircumferences: p57Body.inner.length,
    pointer: "p57 -> p50",
  },
  p33Transfer: {
    selectedBy: "B=19 -> p50[19]=33",
    hChain: {
      secondHeadingFirstTwo: p33SecondTitle[0].values.slice(0, 2),
      throughH: H(p33SecondTitle[0].values.slice(0, 2)),
      secondH: H([B, p]),
      interpretation: "[B+K,K] -> [B,p] -> [GP0(WE),13]",
    },
    bodyWords: p33FirstBody.body.length,
    bodyRunes: p33FirstBody.body.flat().length,
    afterSheddingCircumferences: p33FirstBody.inner.length,
    pointer: "p33 -> p39",
    p39Holdout: {
      redTitle: p39Red,
      interpretation: "[-K,g,b]",
      h1: p39H1,
      h2: p39H2,
      h3: p39H3,
    },
  },
  thirdPrediction: {
    source: "p3 second red-started body",
    bodyWords: p3SecondBody.body.length,
    bodyRunes: p3SecondBody.body.flat().length,
    afterSheddingCircumferences: p3SecondBody.inner.length,
    pointer: "p3 -> p53",
  },
  census,
  interpretation:
    "Solved p57 literally says WE MUST SHED OUR OWN CIRCUMFERENCES. Removing each body's first and last rune leaves exactly 50 runes, selecting the p50 number table. P50 state B=19 selects p33; p33's source-visible H chain returns WE and the red 13-dot count. Reusing the solved instruction unchanged on p33's first black body leaves exactly 39 runes, selecting p39. The target p39 independently carries red title [-K,g,b]=[27,5,15], whose H chain is [p-1,e] -> [B,GP0(WE)] -> [p,b]. An independent original-image inventory also establishes p39 as the only other page sharing p33's reused three-dot divider graphic. The same operation on p3's second red-started body predicts p53, preserved separately without forced interpretation.",
}, null, 2));
