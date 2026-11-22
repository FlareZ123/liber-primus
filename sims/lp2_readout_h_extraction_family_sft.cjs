"use strict";

/**
 * Director #1723: full extraction-family audit for the canonical p0 H packet.
 *
 * The H-shell decoder is frozen to the reversible p28 implementation:
 * H(x,y)=(x-y,x+y) mod29, outside-in per printed word, preserving odd centers.
 *
 * Source-grounded retained counts:
 *   e=3: independently emitted by the p27/p28 DH construction and fixed in
 *        the p28 candidate report;
 *   7: cardinality of the seven-field DH tuple (p,g,a,b,A,B,K).
 *
 * For three-rune outputs, charge direction, first/last selection, all-hit vs
 * first/last occurrence handling, zero/one-based positions, and the three
 * already-tried value/position arithmetic orientations. Do not search
 * arbitrary 3-subsets of the seven-state set: no source selects one.
 *
 * The 2016 lexicon is every unique alphabetic word in the authenticated
 * signed message, not a hand-picked target. Seven-rune outputs are compared
 * against every seven-rune word in that same source.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const parts = transcription.split(/^\s*%\s*$/m);

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

function mod29(value) {
  return ((value % 29) + 29) % 29;
}

function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/K/g, "C")
    .replace(/V/g, "U")
    .replace(/Q/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const out = [];
  for (let offset = 0; offset < normalized.length;) {
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset));
    assert.ok(token, "unmapped GP spelling at " + normalized.slice(offset));
    out.push(token.value);
    offset += token.symbol.length;
  }
  return out;
}

function gp0(word) {
  return gp(word).reduce((total, value) => total + value, 0);
}

function parsePage(physicalPage) {
  if (physicalPage === 50) return { runes: [], words: [] };
  const text = parts[physicalPage < 50 ? physicalPage : physicalPage - 1];
  const runes = [];
  const words = [];
  let current = [];
  let start = 0;

  function flush() {
    if (!current.length) return;
    words.push({
      n: words.length + 1,
      start,
      end: start + current.length - 1,
      len: current.length,
      values: current.slice(),
      sum: current.reduce((total, value) => total + value, 0),
    });
    current = [];
  }

  for (const char of [...text]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) start = runes.length;
      current.push(value);
      runes.push(value);
    } else if (char === "-" || char === ".") {
      flush();
    }
  }
  flush();
  return { runes, words };
}

const physicalPages = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  physicalPages.push({ page, ...parsePage(page) });
}
assert.equal(physicalPages.length, 55);

function H(left, right) {
  return [mod29(left - right), mod29(left + right)];
}

function shellWord(word) {
  const out = [];
  for (
    let left = 0, right = word.values.length - 1;
    left < right;
    left += 1, right -= 1
  ) {
    out.push(...H(word.values[left], word.values[right]));
  }
  if (word.len % 2) out.push(word.values[(word.len - 1) / 2]);
  return out;
}

function shellWords(words) {
  return words.flatMap(shellWord);
}

const dhState = {
  p: 23,
  g: 5,
  a: 6,
  b: 15,
  A: 8,
  B: 19,
  K: 2,
};
const dhValues = Object.values(dhState);
const dhSet = new Set(dhValues);
const e = 3;
assert.equal(dhValues.length, 7);
assert.equal(new Set(dhValues).size, 7);

// Full authenticated 2016 signed-message vocabulary, including the warning.
const signed2016Words = [
  "HELLO", "THE", "PATH", "LIES", "EMPTY", "EPIPHANY", "SEEKS", "DEVOTED",
  "LIBER", "PRIMUS", "IS", "WAY", "ITS", "WORDS", "ARE", "MAP", "THEIR",
  "MEANING", "ROAD", "AND", "NUMBERS", "DIRECTION", "SEEK", "YOU", "WILL",
  "BE", "FOUND", "GOOD", "LUCK", "BEWARE", "FALSE", "PATHS", "VERIFY",
  "OPENPGP",
];

function makeLexicon(length) {
  const map = new Map();
  for (const word of signed2016Words) {
    const values = gp(word);
    if (values.length === length) map.set(values.join(","), word);
  }
  return map;
}

const lexicon3 = makeLexicon(3);
const lexicon7 = makeLexicon(7);
assert.deepEqual(
  [...lexicon3.values()].sort(),
  ["AND", "ARE", "ITS", "MAP", "PATH", "WAY", "YOU"],
);
assert.deepEqual(
  [...lexicon7.values()].sort(),
  ["DEVOTED", "NUMBERS", "OPENPGP"],
);

function makeWindow(page, firstWord, words, extra = {}) {
  const stream = shellWords(words);
  return {
    page,
    firstWord,
    words,
    stream,
    hits: stream
      .map((value, position) => ({ value, position }))
      .filter((hit) => dhSet.has(hit.value)),
    total: stream.length,
    ...extra,
  };
}

// Every consecutive four-complete-word window on all 55 rune-bearing pages.
const fourWordWindows = [];
for (const page of physicalPages) {
  for (let index = 0; index + 3 < page.words.length; index += 1) {
    fourWordWindows.push(makeWindow(
      page.page,
      index + 1,
      page.words.slice(index, index + 4),
    ));
  }
}
assert.equal(fourWordWindows.length, 2763);

// All exact 23-rune four-word windows, irrespective of center glyph.
const exact23FourWordWindows = fourWordWindows.filter((window) =>
  window.total === 23);
assert.equal(exact23FourWordWindows.length, 117);

// Match the source geometry used in #1706: all whole-word-bounded 23-rune
// intervals whose original, untransformed center rune is F (GP value zero).
const matched23CenterF = [];
for (const page of physicalPages) {
  const starts = new Set(page.words.map((word) => word.start));
  const ends = new Set(page.words.map((word) => word.end));
  for (let start = 0; start + 22 < page.runes.length; start += 1) {
    const end = start + 22;
    if (
      starts.has(start) &&
      ends.has(end) &&
      page.runes[start + 11] === 0
    ) {
      const words = page.words.filter((word) =>
        word.start >= start && word.end <= end);
      matched23CenterF.push(makeWindow(
        page.page,
        words[0].n,
        words,
        { start, end, center: start + 11 },
      ));
    }
  }
}
assert.equal(matched23CenterF.length, 23);
assert.deepEqual(
  matched23CenterF.filter((window) => window.page === 0)
    .map((window) => [window.start, window.end, window.center]),
  [[80, 102, 91], [166, 188, 177]],
);

// The original p0 receiver and a second manuscript-wide MAP hit are fixed
// before family evaluation; neither is used to alter the family.
const target = fourWordWindows.find((window) =>
  window.page === 0 && window.firstWord === 18);
const mirroredMapRival = fourWordWindows.find((window) =>
  window.page === 45 && window.firstWord === 61);
assert.ok(target);
assert.ok(mirroredMapRival);
assert.deepEqual(target.words.map((word) => word.len), [3, 7, 5, 8]);
assert.deepEqual(target.stream, [
  19, 23, 25,
  4, 16, 12, 9, 6, 10, 14,
  15, 8, 24, 5, 21,
  5, 28, 26, 22, 9, 0, 18, 2,
]);
assert.deepEqual(
  target.hits.map((hit) => [hit.position, hit.value]),
  [[0, 19], [1, 23], [7, 6], [10, 15], [11, 8], [13, 5], [15, 5], [22, 2]],
);
assert.equal(mirroredMapRival.total, 15);
assert.deepEqual(
  mirroredMapRival.words.map((word) => [word.n, word.start, word.end]),
  [[61, 255, 256], [62, 257, 258], [63, 259, 267], [64, 268, 269]],
);

// Source-supported three-hit family: e=3; vary every choice named in #1723.
const configs3 = [];
for (const direction of ["ltr", "rtl"]) {
  for (const duplicate of ["all-occurrences", "first-occurrence", "last-occurrence"]) {
    for (const selection of ["first3", "last3"]) {
      for (const origin of [0, 1]) {
        for (const operation of ["value+position", "value-position", "position-value"]) {
          configs3.push({ direction, duplicate, selection, origin, operation });
        }
      }
    }
  }
}
assert.equal(configs3.length, 72);

function orderedHits(window, direction, duplicate) {
  let sequence = (direction === "ltr"
    ? window.hits.slice()
    : window.hits.slice().reverse()
  ).map((hit) => ({
    ...hit,
    scanPosition: direction === "ltr"
      ? hit.position
      : window.total - 1 - hit.position,
  }));

  if (duplicate !== "all-occurrences") {
    const byValue = new Map();
    if (duplicate === "first-occurrence") {
      for (const hit of sequence) {
        if (!byValue.has(hit.value)) byValue.set(hit.value, hit);
      }
    } else {
      for (const hit of sequence) byValue.set(hit.value, hit);
    }
    sequence = [...byValue.values()]
      .sort((left, right) => left.scanPosition - right.scanPosition);
  }
  return sequence;
}

function applyOperation(hit, origin, operation) {
  const position = hit.scanPosition + origin;
  if (operation === "value+position") return mod29(hit.value + position);
  if (operation === "value-position") return mod29(hit.value - position);
  return mod29(position - hit.value);
}

function extract(window, config, count, lexicon) {
  const sequence = orderedHits(
    window, config.direction, config.duplicate);
  const selected = config.selection === "first3"
    ? sequence.slice(0, count)
    : sequence.slice(-count);
  if (selected.length !== count) return null;
  const output = selected.map((hit) =>
    applyOperation(hit, config.origin, config.operation));
  return {
    selected,
    output,
    word: lexicon.get(output.join(",")) || null,
  };
}

function evaluateThree(windowSet) {
  const byWord = {};
  const wordWindows = new Set();
  const mapWindows = new Map();
  const mapConfigurations = [];
  let totalWordHits = 0;
  let totalMapHits = 0;

  for (const config of configs3) {
    let configWordHits = 0;
    let configMapHits = 0;
    const configMapLocations = [];

    for (const window of windowSet) {
      const result = extract(window, config, e, lexicon3);
      if (!result || !result.word) continue;

      totalWordHits += 1;
      configWordHits += 1;
      byWord[result.word] = (byWord[result.word] || 0) + 1;
      wordWindows.add(
        window.page + ":" + window.firstWord + ":" +
        (window.start === undefined ? "" : window.start));

      if (result.word === "MAP") {
        totalMapHits += 1;
        configMapHits += 1;
        const key = window.page + ":" + window.firstWord + ":" +
          (window.start === undefined ? "" : window.start);
        const location = {
          page: window.page,
          firstWord: window.firstWord,
          wordNumbers: window.words.map((word) => word.n),
          start: window.start === undefined
            ? window.words[0].start
            : window.start,
          end: window.end === undefined
            ? window.words[window.words.length - 1].end
            : window.end,
          length: window.total,
          selected: result.selected.map((hit) => ({
            originalPosition: hit.position,
            scanPosition: hit.scanPosition,
            value: hit.value,
          })),
          output: result.output,
        };
        mapWindows.set(key, location);
        configMapLocations.push(location);
      }
    }

    if (configMapHits) {
      mapConfigurations.push({
        config,
        totalWordHits: configWordHits,
        mapHits: configMapHits,
        mapLocations: configMapLocations,
      });
    }
  }

  return {
    windows: windowSet.length,
    configurations: configs3.length,
    totalSourceWordHits: totalWordHits,
    sourceWordHitsByWord: byWord,
    distinctWindowsWithSourceWord: wordWindows.size,
    exactMapHits: totalMapHits,
    distinctWindowsWithMap: mapWindows.size,
    mapLocations: [...mapWindows.values()],
    mapConfigurations,
  };
}

// Source-supported full-state family: retain all seven distinct DH values.
// The all-occurrence arm also tests the first/last seven hit events, so the
// repeated g=5 event is not silently discarded.
const configs7 = [];
for (const direction of ["ltr", "rtl"]) {
  for (const duplicate of ["all-occurrences", "first-occurrence", "last-occurrence"]) {
    for (const selection of ["first7", "last7"]) {
      for (const origin of [0, 1]) {
        for (const operation of ["value+position", "value-position", "position-value"]) {
          configs7.push({ direction, duplicate, selection, origin, operation });
        }
      }
    }
  }
}
assert.equal(configs7.length, 72);

function evaluateSeven(windowSet) {
  let totalSourceWordHits = 0;
  const byWord = {};
  const locations = [];

  for (const config of configs7) {
    for (const window of windowSet) {
      const sequence = orderedHits(
        window, config.direction, config.duplicate);
      const selected = config.selection === "first7"
        ? sequence.slice(0, 7)
        : sequence.slice(-7);
      if (selected.length !== 7) continue;
      const output = selected.map((hit) =>
        applyOperation(hit, config.origin, config.operation));
      const word = lexicon7.get(output.join(","));
      if (!word) continue;
      totalSourceWordHits += 1;
      byWord[word] = (byWord[word] || 0) + 1;
      locations.push({
        page: window.page,
        firstWord: window.firstWord,
        start: window.start === undefined
          ? window.words[0].start
          : window.start,
        word,
        output,
        config,
      });
    }
  }

  return {
    windows: windowSet.length,
    configurations: configs7.length,
    totalSevenRuneSourceWordHits: totalSourceWordHits,
    sourceWordsByWord: byWord,
    locations,
  };
}

const allThree = evaluateThree(fourWordWindows);
const exact23Three = evaluateThree(exact23FourWordWindows);
const matchedThree = evaluateThree(matched23CenterF);
const allSeven = evaluateSeven(fourWordWindows);
const matchedSeven = evaluateSeven(matched23CenterF);

// Exact three-rune outputs over all 2,763 windows: 32 outputs in 19 windows.
// MAP occurs at the selected p0 receiver and at one reversed/one-based rival.
assert.equal(allThree.totalSourceWordHits, 32);
assert.deepEqual(allThree.sourceWordHitsByWord, {
  MAP: 6,
  WAY: 7,
  AND: 6,
  PATH: 5,
  ARE: 4,
  YOU: 2,
  ITS: 2,
});
assert.equal(allThree.distinctWindowsWithSourceWord, 19);
assert.equal(allThree.exactMapHits, 6);
assert.equal(allThree.distinctWindowsWithMap, 2);
assert.deepEqual(
  allThree.mapLocations.map((row) => [
    row.page, row.firstWord, row.start, row.end, row.length,
  ]),
  [[0, 18, 80, 102, 23], [45, 61, 255, 269, 15]],
);

// Among the 117 exact-23-rune four-word windows, only the selected p0 window
// yields MAP; the p0 whole-READOUT sibling yields WAY under another variant.
assert.equal(exact23FourWordWindows.length, 117);
assert.equal(exact23Three.totalSourceWordHits, 4);
assert.deepEqual(exact23Three.sourceWordHitsByWord, { MAP: 3, WAY: 1 });
assert.equal(exact23Three.distinctWindowsWithMap, 1);

// The same result holds on the 23 exact-center-F whole-word-bounded controls.
assert.equal(matchedThree.windows, 23);
assert.equal(matchedThree.totalSourceWordHits, 4);
assert.deepEqual(matchedThree.sourceWordHitsByWord, { MAP: 3, WAY: 1 });
assert.equal(matchedThree.distinctWindowsWithMap, 1);
assert.equal(matchedThree.mapLocations[0].page, 0);
assert.equal(matchedThree.mapLocations[0].start, 80);

// No seven-rune signed-message word is produced by the full seven-state family.
assert.deepEqual([...lexicon7.values()].sort(), ["DEVOTED", "NUMBERS", "OPENPGP"]);
assert.equal(allSeven.totalSevenRuneSourceWordHits, 0);
assert.equal(matchedSeven.totalSevenRuneSourceWordHits, 0);

// The candidate's first three distinct DH values are B,p,a at positions 0,1,7.
// This exact rule yields MAP, but the family also contains a second MAP window.
const candidateHits = orderedHits(target, "ltr", "first-occurrence");
const candidateFirstThree = candidateHits.slice(0, e);
assert.deepEqual(
  candidateFirstThree.map((hit) => [hit.position, hit.value]),
  [[0, 19], [1, 23], [7, 6]],
);
const candidateMap = candidateFirstThree.map((hit) =>
  mod29(hit.value + hit.position));
assert.deepEqual(candidateMap, gp("MAP"));

// The second MAP fit is the mirror configuration: reverse scan, last3,
// one-based positions, and position-value. It is on p45, not the 23-rune set.
const rivalHits = orderedHits(mirroredMapRival, "rtl", "first-occurrence");
const rivalLastThree = rivalHits.slice(-3);
const rivalMap = rivalLastThree.map((hit) =>
  applyOperation(hit, 1, "position-value"));
assert.deepEqual(rivalMap, gp("MAP"));
assert.equal(mirroredMapRival.page, 45);
assert.equal(mirroredMapRival.firstWord, 61);

// Reveal the already-published numeric continuation only after the extraction
// family has been evaluated. It validates state56, not the exact MAP letters.
const tableTokens = grid.pages.flatMap((page) => page.tokens);
const tableBytes = grid.pages.flatMap((page) => page.bytes);
assert.equal(tableTokens.length, 256);
assert.equal(tableBytes.length, 256);
const alphabet59 = grid.alphabet.replace("f", "");
function decode59(token) {
  return alphabet59.indexOf(token[0]) * 59 + alphabet59.indexOf(token[1]);
}
const mapGp0 = gp0("MAP");
const andGp0 = gp0("AND");
const seekGp0 = gp0("SEEK");
assert.deepEqual([mapGp0, andGp0, seekGp0], [56, 56, 56]);
assert.equal(tableTokens[56], "4E");
assert.equal(tableBytes[56], 254);
assert.equal(decode59(tableTokens[56]), 250);
const p0 = physicalPages.find((page) => page.page === 0);
const wordAt254 = p0.words.find((word) => word.start === 254);
assert.ok(wordAt254);
assert.equal(wordAt254.n, 57);
assert.equal(gp0("NEXT"), 57);

console.log(JSON.stringify({
  status: "PASS",
  frozenInputs: {
    pages: physicalPages.length,
    originalRunes: physicalPages.reduce((n, page) => n + page.runes.length, 0),
    fourWordWindows: fourWordWindows.length,
    exact23RuneFourWordWindows: exact23FourWordWindows.length,
    exact23RuneCenterFWholeWordControls: matched23CenterF.length,
    dhState,
    sourceRetainedCounts: { e, dhFieldCount: dhValues.length },
    canonicalShell: "outside-in H(x,y)=(x-y,x+y) mod29; preserve odd centers",
  },
  signed2016Lexicon: {
    threeRuneWords: [...lexicon3.values()].sort(),
    sevenRuneWords: [...lexicon7.values()].sort(),
    note: "MAP is a noun in 'its words are the map', not an imperative in the signed sentence",
  },
  selectedReceiver: {
    page: target.page,
    words: target.words.map((word) => word.n),
    offsets: [target.words[0].start, target.words[target.words.length - 1].end],
    runeLengths: target.words.map((word) => word.len),
    hStream: target.stream,
    dhHits: target.hits.map((hit) => [hit.position, hit.value]),
    firstThreeDistinct: candidateFirstThree.map((hit) => [hit.position, hit.value]),
    valuePlusZeroBasedPosition: candidateMap,
    output: "MAP",
  },
  threeRuneFamily: {
    dimensions: {
      direction: ["ltr", "rtl"],
      duplicatePolicy: [
        "all-occurrences",
        "first-occurrence",
        "last-occurrence",
      ],
      selection: ["first3", "last3"],
      positionOrigin: [0, 1],
      arithmetic: ["value+position", "value-position", "position-value"],
    },
    configurationCount: configs3.length,
    all2763FourWordWindows: allThree,
    exact23RuneFourWordWindows: exact23Three,
    exact23RuneCenterFControls: matchedThree,
    secondMapWindow: {
      page: mirroredMapRival.page,
      words: mirroredMapRival.words.map((word) => word.n),
      offsets: [
        mirroredMapRival.words[0].start,
        mirroredMapRival.words[mirroredMapRival.words.length - 1].end,
      ],
      stream: mirroredMapRival.stream,
      config: {
        direction: "rtl",
        duplicatePolicy: "first-occurrence",
        selection: "last3",
        positionOrigin: 1,
        arithmetic: "position-value",
      },
      output: rivalMap,
    },
  },
  sevenRuneFullStateFamily: {
    configurationCount: configs7.length,
    all2763FourWordWindows: allSeven,
    exact23RuneCenterFControls: matchedSeven,
    allDistinctFirstOccurrenceLtr: orderedHits(
      target, "ltr", "first-occurrence").map((hit) => [hit.position, hit.value]),
  },
  downstreamCollisionHoldout: {
    gp0: { MAP: mapGp0, AND: andGp0, SEEK: seekGp0 },
    p50Cell: 56,
    printedToken: tableTokens[56],
    conventionalBase60: tableBytes[56],
    dropFBase59: decode59(tableTokens[56]),
    p0WordStartingAt254: wordAt254.n,
    authenticatedNextGp0: gp0("NEXT"),
    interpretation: "the numeric edge is conditional evidence for state56->57/NEXT; it cannot authenticate MAP over AND or SEEK",
  },
  decision: {
    mapIsNotFamilywiseUnique: true,
    mapOccursAtTwoDistinctFourWordWindowsAcrossTheDeclaredFamily: true,
    mapIsUniqueWithinThe23MatchedCenterFControls: true,
    duplicatePolicyDoesNotChangeTheTargetFirstThreeBecauseTheyAreDistinct: true,
    exactMapLettersRemainPostObservation: true,
    noUnknownPagePlaintextOrCipherInverseRecovered: true,
  },
}, null, 2));
