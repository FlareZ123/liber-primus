"use strict";

/**
 * SFT: source-only derivation of the p0 red heading's final five runes.
 *
 * Inputs are restricted to original/source facts already in this repository:
 * - p0-p2 contain exactly 729 = 27^2 canonical runes;
 * - the physical p0 red heading is grouped 8 + 5 and followed by a 13-dot
 *   rubricated delimiter;
 * - solved LP1 explicitly marks Euler's totient function as sacred.
 *
 * No candidate 27x27 plaintext route, MAP stage, English crib, or external
 * transition rule is used to build the key.
 *
 * Run: node sims/lp2_p0_red_ratio_sourceonly_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-p0-physical-ink-override.json"));
const allInk = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));

/** @param {number} value */
function phi(value) {
  assert.ok(Number.isInteger(value) && value > 0);
  let result = value;
  let rest = value;
  for (let p = 2; p * p <= rest; p++) {
    if (rest % p !== 0) continue;
    while (rest % p === 0) rest /= p;
    result -= result / p;
  }
  if (rest > 1) result -= result / rest;
  return result;
}

/** @param {number} value */
const mod29 = value => (value % 29 + 29) % 29;

// Original-rubrication control: across LP2, take every page-start red title
// immediately followed by a red 13-dot mark, then measure from that title
// start to the next red 13-dot mark. The p0 section is the only perfect square.
const pageCounts = Array(58).fill(0);
for (const page of corpus.pages) pageCounts[page.page] = page.indices.length;
const pagePrefix = [0];
for (const count of pageCounts) pagePrefix.push(pagePrefix.at(-1) + count);

const red13Markers = [];
for (const page of allInk.pages) {
  for (const [afterRunes, dots, color] of page.large_punctuation || []) {
    if (dots === 13 && color === "red") {
      red13Markers.push({
        page: page.page,
        afterRunes,
        global: pagePrefix[page.page] + afterRunes,
      });
    }
  }
}
red13Markers.sort((a, b) => a.global - b.global);

const rubricatedTitleSpans = [];
for (const page of allInk.pages) {
  for (const span of page.red_spans || []) {
    if (span.start !== 0) continue;
    const immediate13 = (page.large_punctuation || []).some(
      mark => mark[0] === span.length && mark[1] === 13 && mark[2] === "red",
    );
    if (!immediate13) continue;
    const globalStart = pagePrefix[page.page];
    const openingMark = globalStart + span.length;
    const nextMark = red13Markers.find(mark => mark.global > openingMark);
    assert(nextMark);
    const runeSpan = nextMark.global - globalStart;
    rubricatedTitleSpans.push({
      page: page.page,
      titleLength: span.length,
      nextMarkPage: nextMark.page,
      nextMarkAfterRunes: nextMark.afterRunes,
      runeSpan,
      squareRoot: Math.sqrt(runeSpan),
    });
  }
}
assert.equal(rubricatedTitleSpans.length, 8);
const squareRubricatedSpans = rubricatedTitleSpans.filter(
  span => Number.isInteger(span.squareRoot),
);
assert.deepEqual(
  squareRubricatedSpans.map(span => [
    span.page,
    span.nextMarkPage,
    span.nextMarkAfterRunes,
    span.runeSpan,
    span.squareRoot,
  ]),
  [[0, 2, 201, 729, 27]],
);

const grid = corpus.pages.filter(page => page.page <= 2).flatMap(page => page.indices);
assert.equal(grid.length, squareRubricatedSpans[0].runeSpan);
const side = squareRubricatedSpans[0].squareRoot;
assert.equal(side, 27);

const words = ink.physical_zero_based.red_words;
assert.deepEqual(words.map(word => word.length), [8, 5]);
const red = words.flatMap(word => word.gp_indices);
assert.equal(red.length, 13);
assert.deepEqual(red, grid.slice(0, 13));

const punctuation = ink.physical_zero_based.large_punctuation[0];
assert.equal(punctuation.after_runes, red.length);
assert.equal(punctuation.dots, red.length);

const index = token => corpus.translit.indexOf(token);
const at = ([row, column]) => {
  assert.ok(row >= 1 && row <= side && column >= 1 && column <= side);
  return grid[(row - 1) * side + column - 1];
};

// The source-visible delimiter count n=13 and the authenticated totient
// operation define the ordered coordinate (n, phi(n)).
const n = punctuation.dots;
const anchor = [n, phi(n)];
assert.deepEqual(anchor, [13, 12]);
assert.equal(at(anchor), index("J"));

// For the final original red group, use its visible length as the stride.
// Test every diagonal direction before reading the candidate plaintext.
const stride = words[1].length;
assert.equal(stride, 5);

const diagonalTests = [];
for (const rowSign of [-1, 1]) {
  for (const columnSign of [-1, 1]) {
    const middle = [
      anchor[0] + rowSign * stride,
      anchor[1] + columnSign * stride,
    ];
    const end = [
      anchor[0] + rowSign * 2 * stride,
      anchor[1] + columnSign * 2 * stride,
    ];
    const inBounds = [...middle, ...end].every(value => value >= 1 && value <= side);
    if (!inBounds) continue;
    const middleRune = at(middle);
    const endRune = at(end);
    diagonalTests.push({
      direction: [rowSign, columnSign],
      middle,
      end,
      middleRune,
      endRune,
      phiMatches: middleRune > 0 && phi(middleRune) === endRune,
    });
  }
}
assert.equal(diagonalTests.length, 4);
const matches = diagonalTests.filter(test => test.phiMatches);
assert.equal(matches.length, 1);
const selected = matches[0];
assert.deepEqual(selected.direction, [1, 1]);
assert.deepEqual(selected.middle, [18, 17]);
assert.deepEqual(selected.end, [23, 22]);
assert.equal(selected.middleRune, index("R"));
assert.equal(selected.endRune, index("TH"));
assert.equal(phi(selected.middleRune), selected.endRune);

// The source-selected three-cell node is therefore J-R-TH. Apply the
// authenticated totient operation only to its center, yielding J-TH-TH.
const originalNode = [at(anchor), selected.middleRune, selected.endRune];
assert.deepEqual(originalNode, [index("J"), index("R"), index("TH")]);
const key = [originalNode[0], phi(originalNode[1]), originalNode[2]];
assert.deepEqual(key, [index("J"), index("TH"), index("TH")]);

// Only now inspect the untouched final five red ciphertext runes.
const cipher = words[1].gp_indices;
const plain = cipher.map((value, i) => mod29(value - key[i % key.length]));
assert.deepEqual(
  plain.map(value => corpus.translit[value]),
  ["R", "A", "T", "I", "O"],
);
assert.deepEqual(
  plain.map((value, i) => mod29(value + key[i % key.length])),
  cipher,
);

// Explicit coordinate-order control. Swapping (n,phi(n)) to (phi(n),n)
// produces a separate southeast phi-chain, but its derived key does not
// recover the source-native word RATIO. This records the remaining convention
// sensitivity instead of hiding it.
const swappedAnchor = [phi(n), n];
assert.deepEqual(swappedAnchor, [12, 13]);
const swappedMiddle = [swappedAnchor[0] + stride, swappedAnchor[1] + stride];
const swappedEnd = [swappedAnchor[0] + 2 * stride, swappedAnchor[1] + 2 * stride];
assert.equal(phi(at(swappedMiddle)), at(swappedEnd));
const swappedKey = [at(swappedAnchor), phi(at(swappedMiddle)), at(swappedEnd)];
const swappedPlain = cipher.map((value, i) => mod29(value - swappedKey[i % swappedKey.length]));
assert.notDeepEqual(swappedPlain, plain);

console.log(JSON.stringify({
  status: "source-only candidate plaintext for the final five red runes",
  rubricatedTitleCandidates: rubricatedTitleSpans.length,
  perfectSquareRubricatedSpans: squareRubricatedSpans.map(span => ({
    page: span.page,
    nextMarkPage: span.nextMarkPage,
    runeSpan: span.runeSpan,
    squareRoot: span.squareRoot,
  })),
  sourceSpanRunes: grid.length,
  gridSide: side,
  physicalRedGroups: words.map(word => word.length),
  delimiterDots: n,
  anchor,
  anchorRune: corpus.translit[at(anchor)],
  stride,
  diagonalTests: diagonalTests.map(test => ({
    direction: test.direction,
    middle: test.middle,
    end: test.end,
    runes: [test.middleRune, test.endRune].map(value => corpus.translit[value]),
    phiMatches: test.phiMatches,
  })),
  selectedNode: originalNode.map(value => corpus.translit[value]),
  key: key.map(value => corpus.translit[value]),
  ciphertext: cipher.map(value => corpus.translit[value]),
  plaintext: plain.map(value => corpus.translit[value]),
  forwardReencryption: true,
  swappedCoordinateControl: {
    anchor: swappedAnchor,
    key: swappedKey.map(value => corpus.translit[value]),
    plaintext: swappedPlain.map(value => corpus.translit[value]),
  },
}, null, 2));
