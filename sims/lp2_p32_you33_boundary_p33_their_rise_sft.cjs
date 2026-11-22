"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

function mod29(value) {
  return ((value % 29) + 29) % 29;
}

function H2(pair) {
  return [mod29(pair[0] - pair[1]), mod29(pair[0] + pair[1])];
}

function H2inv(pair) {
  const inv2 = 15;
  return [
    mod29((pair[0] + pair[1]) * inv2),
    mod29((pair[1] - pair[0]) * inv2),
  ];
}

function primes(count) {
  const out = [];
  for (let n = 2; out.length < count; n += 1) {
    let prime = true;
    for (let d = 2; d * d <= n; d += 1) {
      if (n % d === 0) {
        prime = false;
        break;
      }
    }
    if (prime) out.push(n);
  }
  return out;
}

const primeTable = primes(130);
function T(cardinal) {
  assert.ok(cardinal >= 1);
  return mod29(primeTable[cardinal - 1] - 1);
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const parts = transcription.split(/^\s*%\s*$/m);
const runeToValue = new Map(corpus.runes.map((rune, value) => [rune, value]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);

function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

function pageValues(page) {
  const out = [];
  for (const character of [...physicalPart(page)]) {
    if (runeToValue.has(character)) out.push(runeToValue.get(character));
  }
  return out;
}

let canonicalPageMap = null;

function buildCanonicalPageMap() {
  if (canonicalPageMap) return canonicalPageMap;

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
        end: startOffset + current.length - 1,
        values: current.slice(),
        length: current.length,
      });
    }
    current = [];
  }

  for (let segment = 0; segment < unknownSegments.length; segment += 1) {
    for (const character of [...unknownSegments[segment]]) {
      const value = runeToValue.get(character);
      if (value !== undefined) {
        if (!current.length) {
          startSegment = segment;
          startOffset = pages[segment].offset;
        }
        endSegment = segment;
        current.push(value);
        pages[segment].offset += 1;
      } else if (character === "/" || /\s/u.test(character)) {
        // Printed line and page wraps may continue a word.
      } else {
        flush();
      }
    }
  }
  flush();

  canonicalPageMap = new Map(pages.map((page) => [page.page, page.words]));
  return canonicalPageMap;
}

function canonicalWords(page) {
  return buildCanonicalPageMap().get(page) || [];
}

function spanWords(page) {
  const normalized = physicalPart(page).replace(/\/\s*/gu, "");
  let offset = 0;
  return (normalized.match(/[\u16A0-\u16FF]+/gu) || []).map((spelling) => {
    const values = [...spelling].map((rune) => runeToValue.get(rune));
    const row = {
      start: offset,
      end: offset + values.length,
      length: values.length,
      values,
    };
    offset = row.end;
    return row;
  });
}

function exactTwoWordRedSpans() {
  const out = [];
  for (const page of ink.pages) {
    if (page.page === 50) continue;
    const words = spanWords(page.page);
    for (const span of page.red_spans || []) {
      const selected = words.filter(
        (word) =>
          word.start >= span.start &&
          word.end <= span.start + span.length
      );
      const exact =
        selected.length === 2 &&
        selected[0].start === span.start &&
        selected[1].end === span.start + span.length;
      if (!exact) continue;
      out.push({
        page: page.page,
        start: span.start,
        pair: selected.map((word) => word.length),
      });
    }
  }
  return out;
}

function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const out = [];
  for (let index = 0; index < normalized.length;) {
    if (normalized.startsWith("ING", index)) {
      out.push(21);
      index += 3;
      continue;
    }
    if (normalized.startsWith("IO", index)) {
      out.push(27);
      index += 2;
      continue;
    }
    const token = gpTokens.find((row) =>
      normalized.startsWith(row.symbol, index)
    );
    assert.ok(token, "unmapped " + normalized.slice(index));
    out.push(token.value);
    index += token.symbol.length;
  }
  return out;
}

const sourceWords = signed2016
  .slice(
    signed2016.indexOf("Hello."),
    signed2016.indexOf("-----BEGIN PGP SIGNATURE-----")
  )
  .replace(/\b7A35090F\b/g, "")
  .match(/[A-Za-z]+/g)
  .map((word) => word.toUpperCase());

assert.equal(sourceWords.length, 43);
assert.equal(sourceWords[32], "YOU");
assert.equal(sourceWords[33], "WILL");
assert.equal(sourceWords[19], "THEIR");
assert.equal(sourceWords[25], "THEIR");

const state = Object.freeze({
  p: 23,
  g: 5,
  a: 6,
  b: 15,
  A: 8,
  B: 19,
  K: 2,
  e: 3,
  q: 4,
});
const directState = new Set(Object.values(state));

const p32 = pageValues(32);
assert.equal(p32.length, 121);
assert.equal(Math.sqrt(p32.length), 11);
assert.equal(canonicalWords(32).length, 21);

const boundaryPairs = [];
for (let boundary = 11; boundary <= 110; boundary += 11) {
  boundaryPairs.push({
    boundary,
    pair: [p32[boundary - 1], p32[boundary]],
    bothDirectState:
      directState.has(p32[boundary - 1]) &&
      directState.has(p32[boundary]),
  });
}

assert.deepEqual(
  boundaryPairs.filter((row) => row.bothDirectState),
  [{boundary: 33, pair: [state.K, state.A], bothDirectState: true}]
);

const selected = boundaryPairs.find((row) => row.boundary === 33);
assert.deepEqual(selected.pair, [2, 8]);
assert.equal(p32[32], state.K);
assert.equal(p32[33], state.A);

const redSpans = exactTwoWordRedSpans();
assert.equal(redSpans.length, 8);

const pairMatches = [];
for (const boundary of boundaryPairs) {
  for (const span of redSpans) {
    if (
      boundary.pair[0] === span.pair[0] &&
      boundary.pair[1] === span.pair[1]
    ) {
      pairMatches.push({
        boundary: boundary.boundary,
        pair: boundary.pair,
        page: span.page,
        start: span.start,
      });
    }
  }
}
assert.equal(boundaryPairs.length * redSpans.length, 80);
assert.deepEqual(pairMatches, [{
  boundary: 33,
  pair: [2, 8],
  page: 33,
  start: 0,
}]);

const p33Upper = redSpans.find((row) => row.page === 33 && row.start === 0);
const p33Lower = redSpans.find((row) => row.page === 33 && row.start === 91);
assert.deepEqual(p33Upper.pair, [2, 8]);
assert.deepEqual(p33Lower.pair, [3, 5]);

const upperExtended = [...p33Upper.pair, ...H2inv(p33Upper.pair)];
const upperOutput = upperExtended.map(T);
assert.deepEqual(upperExtended, [2, 8, 5, 3]);
assert.deepEqual(upperOutput, gp("THEIR"));

const lowerExtended = [...p33Lower.pair, ...H2(p33Lower.pair)];
const lowerOutput = lowerExtended.map(T);
assert.deepEqual(lowerExtended, [3, 5, 27, 8]);
assert.deepEqual(lowerOutput, gp("RISE"));

const p33Words = canonicalWords(33);
const youReceiver = p33Words[28];
const willReceiver = p33Words[34];
assert.equal(youReceiver.ordinal, 29);
assert.equal(youReceiver.start, 116);
assert.deepEqual(youReceiver.values, [14, 17, 8]);
assert.equal(willReceiver.ordinal, 35);
assert.equal(willReceiver.start, 132);
assert.deepEqual(willReceiver.values, [3, 15, 17, 22]);

const p31Key = [17, 14, 7];
assert.deepEqual(
  youReceiver.values.map((value, index) =>
    mod29(value - p31Key[index])
  ),
  gp("YOU")
);

const willKey = [25, 5, 26, 2];
assert.deepEqual(
  willReceiver.values.map((value, index) =>
    mod29(value - willKey[index])
  ),
  gp("WILL")
);

const theirRise = sourceWords.lastIndexOf("THEIR") - sourceWords.indexOf("THEIR");
assert.equal(theirRise, state.a);
assert.equal(willReceiver.ordinal - youReceiver.ordinal, state.a);

const home = [8,3,19,18];
assert.deepEqual(p32.slice(33, 37), home);
assert.equal(
  home.map((value) => corpus.translit[value]).join(""),
  "HOME"
);

const homeHits = [];
for (let segment = 0; segment < 55; segment += 1) {
  const page = segment >= 50 ? segment + 1 : segment;
  const values = [];
  for (const character of [...parts[segment]]) {
    const value = runeToValue.get(character);
    if (value !== undefined) values.push(value);
  }
  for (let offset = 0; offset <= values.length - home.length; offset += 1) {
    if (home.every((value, index) => value === values[offset + index])) {
      homeHits.push({page, offset});
    }
  }
}
assert.deepEqual(homeHits, [{page:32, offset:33}]);

// Charge the complete 43-word map directly against canonical complete page-local words.
const mapRows = sourceWords.map((word, index) => {
  const target = canonicalWords(index)[index];
  return {
    index,
    word,
    page: index,
    fragment: index + 1,
    target: target ? {start: target.start, end: target.end, values: target.values} : null,
  };
});
assert.equal(mapRows.length, 43);
assert.equal(mapRows.filter((row) => row.target).length, 42);
assert.deepEqual(
  mapRows.filter((row) => !row.target).map(({index, word, page, fragment}) => ({index, word, page, fragment})),
  [{index: 32, word: "YOU", page: 32, fragment: 33}]
);

const p31f32 = canonicalWords(31)[31];
const p33f34 = canonicalWords(33)[33];
const p33f33 = canonicalWords(33)[32];
const p33f12 = canonicalWords(33)[11];
assert.deepEqual(p31f32.values, [12, 23, 1]);
assert.deepEqual(p33f34.values, [12, 24]);
assert.deepEqual(p33f33.values, [0, 12, 10]);
assert.deepEqual(p33f12.values, [20, 2, 16]);
const render = (values) => values.map((value) => corpus.translit[value]).join("");
assert.equal(render(p33f33.values), "FEOI");
assert.equal(render(p33f12.values), "LTHT");
assert.deepEqual(sourceWords.slice(30, 36), ["SEEK", "AND", "YOU", "WILL", "BE", "FOUND"]);

const p32LineCounts = physicalPart(32)
  .split("\n")
  .map((line) => [...line].filter((character) => runeToValue.has(character)).length)
  .filter(Boolean);
assert.deepEqual(p32LineCounts, [25, 23, 23, 21, 22, 7]);
const p6 = pageValues(6);
assert.equal(p6.length, 196);
assert.equal(Math.sqrt(p6.length), 14);
const p6LineCounts = physicalPart(6)
  .split("\n")
  .map((line) => [...line].filter((character) => runeToValue.has(character)).length)
  .filter(Boolean);
assert.equal(p6LineCounts.length, 10);

const p32Words = canonicalWords(32);
const wordBoundaryMultiples = boundaryPairs
  .filter((row) =>
    p32Words.some((word) => word.end + 1 === row.boundary) &&
    p32Words.some((word) => word.start === row.boundary)
  )
  .map((row) => row.boundary);
assert.deepEqual(wordBoundaryMultiples, [33, 44, 99]);
let p32LineTotal = 0;
const p32LineEnds = p32LineCounts.map((count) => (p32LineTotal += count));
assert.deepEqual(p32LineEnds, [25, 48, 71, 92, 114, 121]);
assert.equal(p32LineEnds.includes(33), false);

const naiveUniformPairExpected = 80 / (29 * 29);
const naiveUniformPairAtLeastOne = 1 - Math.pow(1 - 1 / (29 * 29), 80);
const naiveUniformDirectStateExpected =
  boundaryPairs.length * Math.pow(directState.size / 29, 2);


const coordinateOutputs = [];
function dihedralCoordinates(row, column) {
  return [
    [row, column],
    [column, 10 - row],
    [10 - row, 10 - column],
    [10 - column, row],
    [row, 10 - column],
    [10 - row, column],
    [column, row],
    [10 - column, 10 - row],
  ];
}
for (const origin of [0,1]) {
  const row = state.K - origin;
  const column = state.A - origin;
  for (const [r,c] of dihedralCoordinates(row, column)) {
    coordinateOutputs.push(p32[r * 11 + c]);
  }
}
const coordinateStateHits = [...new Set(
  coordinateOutputs.filter((value) => directState.has(value))
)].sort((left, right) => left - right);
assert.deepEqual(coordinateStateHits, [state.a, state.A, state.b, state.B, state.e].sort((left,right)=>left-right));

const selectedRow = p32.slice(33, 44);
assert.equal(
  selectedRow.map((value) => corpus.translit[value]).join(""),
  "HOMEXWDSLFD"
);

console.log(JSON.stringify({
  status: "PASS",
  geometry: {
    p32RuneCount: p32.length,
    squareFactorization: "121=11x11; inferred reflow only, not printed geometry",
    printedLineRuneCounts: p32LineCounts,
    matchedSquareControl: {page: 6, runeCount: p6.length, factorization: "14x14", printedLineCount: p6LineCounts.length},
    missingOrdinal: 33,
    consumer: "candidate ordered pair straddling the 33-rune boundary; not an admitted repair",
    boundaryPair: selected.pair,
    stateTyping: ["K", "A"],
    oneBasedScalar: {offset: 32, value: p32[32], state: "K"},
    zeroBasedScalar: {offset: 33, value: p32[33], state: "A"},
  },
  controls: {
    internalBoundaries: boundaryPairs.length,
    exactTwoWordRedSpans: redSpans.length,
    pairComparisons: 80,
    directStateBoundaryHits: boundaryPairs.filter((row) => row.bothDirectState),
    redSpanPairMatches: pairMatches,
    naiveUniformPairExpected,
    naiveUniformPairAtLeastOne,
    naiveUniformDirectStateExpected,
    wordBoundaryMultiples,
    lineBoundaryMultiples: p32LineEnds,
  },
  completeMap: {
    sourceWords: mapRows.map(({index, word, page, fragment, target}) => ({
      index, word, page, fragment, exists: Boolean(target),
    })),
    existing: mapRows.filter((row) => row.target).length,
    missing: mapRows.filter((row) => !row.target).map(({index, word, page, fragment}) => ({index, word, page, fragment})),
  },
  fallbackCoordinates: {
    skipToNextPagePreservingFragment: {page: 33, fragment: 33, values: p33f33.values, gp: render(p33f33.values)},
    overflowCarryAfter21CompleteWords: {page: 33, fragment: 12, values: p33f12.values, gp: render(p33f12.values)},
  },
  immediateHandoff: {
    page: 33,
    upperTitle: p33Upper.pair,
    upperDecoded: "THEIR",
    lowerTitle: p33Lower.pair,
    lowerDecoded: "RISE",
    theirRise,
  },
  heldOutSuffix: {
    p33YouWord: youReceiver.ordinal,
    p33WillWord: willReceiver.ordinal,
    displacement: willReceiver.ordinal - youReceiver.ordinal,
    expected: "a=6",
  },
  exactRowStartObservation: {
    word: "HOME",
    values: home,
    exactOccurrences: homeHits,
    familywiseSelection: "not selected; see im-results/lp2-p32-home-wordstart-english-prefix-familywise.md (p=0.94560544)",
  },
  matrixCoordinateGate: {chargedReadings:coordinateOutputs.length, directStateOutputs:coordinateStateHits, result:"AMBIGUOUS"},
  excludedFromSelector: {
    selectedRowTranslit: "HOMEXWDSLFD",
    note: "Known p32 lexical material was not used to choose boundary33.",
  },
  decision:
    "BOUNDED NEGATIVE: the 43-word diagonal has 42 existing coordinates; YOU32 -> p32/f33 is absent because p32 has 21 complete page-local words. The boundary33/title match is reproducible but not source-selected, the 11x11 reflow is unprinted, and HOME fails the familywise post-period test. Skip/carry alternatives yield no selected receiver; no terminator is present. Treat this as a page-length exception, not a repaired map.",
}, null, 2));
