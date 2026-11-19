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
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const parts = transcription.split(/^\s*%\s*$/m);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/**
 * Encode an authenticated source word in canonical GP29 spelling.
 * @param {string} word
 * @returns {number[]}
 */
function gp(word) {
  const normalized = word.toUpperCase()
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
    const token = gpTokens.find((row) => normalized.startsWith(row.symbol, offset));
    assert.ok(token, "unmapped GP spelling " + word);
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
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

const signedClear = signed2016
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u)
  .slice(1)
  .join("\n");
const signedWords = signedClear
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word, index) => ({ index, word: word.toUpperCase(), values: gp(word) }));
assert.equal(signedWords.length, 43);

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

/** @returns {number[][]} */
function p39BodyForCounts() {
  const row = bodies.find((candidate) => candidate.page === 39 && candidate.start === 119);
  assert.ok(row);
  return row.body;
}

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

// P39 source geometry continues the same state arithmetic around the p33
// lower-body base p*g=115.
const p39Sections = physicalPart(39)
  .split(/^\s*&\s*$/m)
  .map((section) => runeWords(section))
  .filter((section) => section.length > 0);
assert.equal(p39Sections.length, 2);
const p39Upper = p39Sections[0];
const p39Lower = p39Sections[1];
const p39Body = p39BodyForCounts();
assert.equal(p39Upper.length, p + e);
assert.equal(p39Upper.flat().length, p * g + q);
assert.equal(p39Lower.length, 29);
assert.equal(p39Lower.flat().length, p * g + a);
assert.equal(p39Body.length, p + g);
assert.equal(p39Body.flat().length, p * g + e);

const p39RuneLines = physicalPart(39)
  .split(/\n/u)
  .filter((line) => /[\u16A0-\u16FF]/u.test(line));
assert.equal(p39RuneLines.length, 2 * a);
assert.equal(
  p39RuneLines.slice(0, a).reduce((sum, line) =>
    sum + [...line].filter((rune) => runeIndex.has(rune)).length, 0),
  p * g + q
);
assert.equal(
  p39RuneLines.slice(a).reduce((sum, line) =>
    sum + [...line].filter((rune) => runeIndex.has(rune)).length, 0),
  p * g + a
);

// The arrived circumference operation itself is a state register on p39.
// Depths [K,e,q,g]=[2,3,4,5] leave [p,a,K,0] runes.
/**
 * @param {number[][]} words
 * @param {number} depth
 * @returns {number[]}
 */
function shedDepthStream(words, depth) {
  if (depth === 0) return words.flat();
  return words.flatMap((word) =>
    word.length <= 2 * depth ? [] : word.slice(depth, -depth)
  );
}

/**
 * @param {number[][]} words
 * @param {number} depth
 * @returns {number}
 */
function shedDepthCount(words, depth) {
  return shedDepthStream(words, depth).length;
}
assert.deepEqual(
  [K, e, q, g].map((depth) => shedDepthCount(p39Body, depth)),
  [p, a, K, 0]
);

const p39DepthE = shedDepthStream(p39Body, e);
const p39DepthQ = shedDepthStream(p39Body, q);
const p39DepthESum = p39DepthE.reduce((sum, value) => sum + value, 0);
const p39DepthQSum = p39DepthQ.reduce((sum, value) => sum + value, 0);

const sourceFound = signedWords.find((row) => row.word === "FOUND");
const sourceGood = signedWords.find((row) => row.word === "GOOD");
const sourceLuck = signedWords.find((row) => row.word === "LUCK");
assert.ok(sourceFound);
assert.ok(sourceGood);
assert.ok(sourceLuck);
assert.deepEqual([sourceFound.index, sourceGood.index, sourceLuck.index], [35, 36, 37]);
assert.equal(sourceFound.values.reduce((sum, value) => sum + value, 0), sourceGood.index);
assert.equal(sourceGood.values[0], a);

assert.equal(p39DepthE.length, sourceGood.values[0]);
assert.equal(p39DepthESum, sourceGood.index);
assert.equal(p39DepthESum, sourceFound.values.reduce((sum, value) => sum + value, 0));

assert.deepEqual(p39DepthQ, [10, 5]);
assert.equal(p39DepthQ.length, K);
assert.equal(p39DepthQSum, b);
assert.deepEqual(H(p39DepthQ), [g, b]);
assert.equal(signedWords[b].word, "WORDS");

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
assert.equal(p39H1[1], e);
assert.equal(length3Red.find((row) => row.page !== 39)?.page, e);

// The p39 template counterpart is therefore physical p3=e. Transfer the
// unchanged circumference operation to the body immediately after that paired
// red span. This freezes p3 -> p53 before p53's marker semantics are opened.
const p3SecondBody = bodies.find((row) => row.page === e && row.start === 119);
assert.ok(p3SecondBody);
assert.equal(p3SecondBody.body.length, p - K);
assert.equal(p3SecondBody.body.flat().length, 95);
assert.equal(p3SecondBody.inner.length, 53);

// P53 independently answers with the next solved instruction word MUST. Its
// terminal red span is 51 runes, exactly GP0(MUST), and is the sole red span
// with that length. Its first pair maps through frozen H to [e,F]. Repeated
// circumference shedding gives a unique state-count packet.
const mustGp0 = gp("MUST").reduce((sum, value) => sum + value, 0);
assert.equal(mustGp0, 51);
const p53Ink = ink.pages.find((page) => page.page === p3SecondBody.inner.length);
assert.ok(p53Ink);
assert.equal(p53Ink.red_spans.length, 1);
const p53RedSpan = p53Ink.red_spans[0];
assert.equal(p53RedSpan.length, mustGp0);
const p53Rows = wordRows(p3SecondBody.inner.length);
const p53RedWords = p53Rows
  .filter((row) =>
    row.start >= p53RedSpan.start &&
    row.end <= p53RedSpan.start + p53RedSpan.length
  )
  .map((row) => row.values);
assert.equal(p53RedWords.length, K * a);
const p53RedFlat = p53RedWords.flat();
assert.deepEqual(H(p53RedFlat.slice(0, 2)), [e, 0]);

const p53ShedCounts = [1, 2, 3, 4, 5].map((depth) =>
  shedDepthCount(p53RedWords, depth)
);
assert.deepEqual(
  p53ShedCounts,
  [mod29(-K), K * a, g, e, a - g]
);

const redSpanControls = [];
for (const page of ink.pages) {
  if (page.page === 50) continue;
  const rows = wordRows(page.page);
  for (const span of page.red_spans || []) {
    const words = rows
      .filter((row) =>
        row.start >= span.start &&
        row.end <= span.start + span.length
      )
      .map((row) => row.values);
    const flat = words.flat();
    redSpanControls.push({
      page: page.page,
      start: span.start,
      length: span.length,
      firstH: flat.length >= 2 ? H(flat.slice(0, 2)) : null,
      shedCounts: [1, 2, 3, 4, 5].map((depth) =>
        shedDepthCount(words, depth)
      ),
    });
  }
}
assert.deepEqual(
  redSpanControls
    .filter((row) => row.length === mustGp0)
    .map((row) => [row.page, row.start]),
  [[53, 128]]
);
assert.deepEqual(
  redSpanControls
    .filter((row) => row.firstH?.[0] === e && row.firstH?.[1] === 0)
    .map((row) => [row.page, row.start]),
  [[53, 128]]
);
assert.deepEqual(
  redSpanControls
    .filter((row) =>
      JSON.stringify(row.shedCounts) === JSON.stringify(p53ShedCounts)
    )
    .map((row) => [row.page, row.start]),
  [[53, 128]]
);

// The first literal shed of the MUST-marked p53 object yields 27, so preserve
// the already fixed output type and open physical p27. Its only red title is a
// dense state holdout that was not used to derive the pointer.
const p27Page = p53ShedCounts[0];
assert.equal(p27Page, 27);
const p27Ink = ink.pages.find((page) => page.page === p27Page);
assert.ok(p27Ink);
assert.equal(p27Ink.red_spans.length, 1);
const p27RedSpan = p27Ink.red_spans[0];
const p27Rows = wordRows(p27Page);
const p27RedWords = p27Rows
  .filter((row) =>
    row.start >= p27RedSpan.start &&
    row.end <= p27RedSpan.start + p27RedSpan.length
  )
  .map((row) => row.values);
const p27RedFlat = p27RedWords.flat();
assert.equal(p27RedSpan.start, 0);
assert.equal(p27RedSpan.length, B);
assert.equal(p27RedFlat[0], B);
assert.equal(p27RedFlat.reduce((sum, value) => sum + value, 0) % 29, b);
assert.deepEqual(H(p27RedFlat.slice(0, 2)), [a, e]);
const p27ShedCounts = [1, 2, 3, 4, 5].map((depth) =>
  shedDepthCount(p27RedWords, depth)
);
assert.deepEqual(p27ShedCounts, [A + g, A, a, q, K]);
assert.deepEqual(
  redSpanControls
    .filter((row) =>
      row.length === B &&
      JSON.stringify(row.shedCounts) === JSON.stringify(p27ShedCounts)
    )
    .map((row) => [row.page, row.start]),
  [[27, 0]]
);

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

const nestedStateHits = bodies
  .filter((row) =>
    shedDepthCount(row.body, K) === p &&
    shedDepthCount(row.body, e) === a &&
    shedDepthCount(row.body, q) === K
  )
  .map((row) => [row.page, row.start]);
assert.deepEqual(nestedStateHits, [[39,119]]);

const signedWordSelectorHits = bodies
  .map((row) => {
    const stream = shedDepthStream(row.body, e);
    const sum = stream.reduce((total, value) => total + value, 0);
    const target = signedWords[sum];
    return target && stream.length === target.values[0]
      ? [row.page, row.start, stream.length, sum, target.word]
      : null;
  })
  .filter(Boolean);
assert.deepEqual(signedWordSelectorHits, [[39,119,a,sourceGood.index,"GOOD"]]);

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
      geometry: {
        upperLines: a,
        upperWords: p39Upper.length,
        upperRunes: p39Upper.flat().length,
        lowerLines: a,
        lowerWordsIncludingTitle: p39Lower.length,
        lowerRunesIncludingTitle: p39Lower.flat().length,
        lowerBodyWords: p39Body.length,
        lowerBodyRunes: p39Body.flat().length,
      },
      nestedShedCounts: {
        depths: [K, e, q, g],
        counts: [K, e, q, g].map((depth) => shedDepthCount(p39Body, depth)),
        uniqueRedBodyHit: nestedStateHits,
        depthE: {
          values: p39DepthE,
          count: p39DepthE.length,
          rawSum: p39DepthESum,
          sourceRelation: "count=GP(G)=a=6; sum=GP0(FOUND)=signed index(GOOD)=36",
          signedWordSelectorHits,
        },
        depthQ: {
          values: p39DepthQ,
          count: p39DepthQ.length,
          rawSum: p39DepthQSum,
          throughH: H(p39DepthQ),
          sourceRelation: "count=K=2; sum=b=15=index(WORDS); H(core)=[g,b]",
        },
      },
    },
  },
  p39ToP53Transfer: {
    p39SelectsE: p39H1[1],
    pairedLength3RedSpans: length3Red,
    source: "p3=e second red-started body",
    bodyWords: p3SecondBody.body.length,
    bodyRunes: p3SecondBody.body.flat().length,
    afterSheddingCircumferences: p3SecondBody.inner.length,
    pointer: "p3 -> p53",
    p53Holdout: {
      redStart: p53RedSpan.start,
      redLength: p53RedSpan.length,
      interpretation: "red length=GP0(MUST)=51",
      redWords: p53RedWords.length,
      firstH: H(p53RedFlat.slice(0, 2)),
      nestedShedCounts: p53ShedCounts,
      stateInterpretation: "[-K,K*a,g,e,a-g]",
      readoutParameterPair: [e, p53ShedCounts[0]],
      nextPointer: p27Page,
      p27Holdout: {
        redLength: p27RedSpan.length,
        firstRune: p27RedFlat[0],
        redGp0Mod29: p27RedFlat.reduce((sum, value) => sum + value, 0) % 29,
        firstH: H(p27RedFlat.slice(0, 2)),
        nestedShedCounts: p27ShedCounts,
        interpretation: "length=B, first=B, GP0 mod29=b, H(first2)=[a,e], sheds=[A+g,A,a,q,K]",
      },
      matchingLengthControls: redSpanControls.filter((row) => row.length === mustGp0).length,
      matchingFirstHControls: redSpanControls.filter((row) => row.firstH?.[0] === e && row.firstH?.[1] === 0).length,
      matchingShedPacketControls: redSpanControls.filter((row) =>
        JSON.stringify(row.shedCounts) === JSON.stringify(p53ShedCounts)
      ).length,
    },
  },
  census,
  interpretation:
    "Solved p57 literally says WE MUST SHED OUR OWN CIRCUMFERENCES. Removing each body's first and last rune leaves exactly 50 runes, selecting the p50 number table. P50 state B=19 selects p33; p33's source-visible H chain returns WE and the red 13-dot count. Reusing the solved instruction unchanged on p33's first black body leaves exactly 39 runes, selecting p39. The target p39 independently carries red title [-K,g,b]=[27,5,15], whose H chain is [p-1,e] -> [B,GP0(WE)] -> [p,b]. Its geometry continues the p33 p*g state: upper runes=p*g+q=119, lower black runes=p*g+e=118, complete lower section=p*g+a=121, lower black words=p+g=28, and both source sections have a=6 lines. Repeated shedding at depths [K,e,q,g] leaves [p,a,K,0], uniquely among red-started bodies. At depth e the six-rune core has raw sum36: count6=GP(G)=a and sum36=GP0(FOUND)=zero-based signed index GOOD, the sole red-body depth-e hit of the fixed first-GP/index selector. At depth q the two-rune core [10,5] has sum b=15=index(WORDS) and H(core)=[g,b]. An independent original-image inventory also establishes p39 as the only other page sharing p33's reused three-dot divider graphic. P39's H chain emits e=3, and p3 is the unique other page carrying the same three-rune red span at the same offset119. The paired p3 body sheds to p53. P53 then carries the unique 51-rune red span, equal to GP0(MUST); its first pair maps through H to [e,F], while repeated shedding leaves [-K,K*a,g,e,a-g]=[27,12,5,3,1]. Thus the route reconstructs WE then MUST from source features while the solved p57 text supplies SHED. The p53 packet also exposes [e,-K]=[3,27], the already used p28 READ OUT exponent pair, without yet authenticating exponentiation as the cipher operator. Keeping the same page-pointer output type, the first shed of the MUST-marked p53 object gives p27. P27 answers with a unique red state register: length and first rune B=19, whole-title GP0 mod29=b=15, H(first2)=[a,e], and nested shed counts [A+g,A,a,q,K]=[13,8,6,4,2].",
}, null, 2));
