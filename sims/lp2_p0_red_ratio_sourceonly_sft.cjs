"use strict";

/**
 * SFT: source-only geometry for the p0 final five red runes, plus the
 * source-native GP orthography gate on the resulting R-A-T-I-O sequence.
 *
 * The geometry uses only original/source facts:
 * - complete LP2 red-title / red-13-dot rubrication;
 * - the uniquely selected 729 = 27^2 p0-p2 span;
 * - p0's physical 8+5 red grouping and 13-dot delimiter;
 * - the solved LP1 instruction that Euler's totient function is sacred.
 *
 * It derives the exact five-rune sequence R-A-T-I-O, then checks whether that
 * sequence is source-attested spelling for the Latin-looking word RATIO.
 * The answer is no under the calibrated solved-LP orthography: every observed
 * plaintext IO in the 181-word LP1 control uses the dedicated IOR/IA rune.
 *
 * Run: node sims/lp2_p0_red_ratio_sourceonly_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} file */
const read = file => fs.readFileSync(path.join(root, file), "utf8").replace(/\r\n/g, "\n");

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

// Rubrication control. Consider every page-start red title immediately followed
// by a red 13-dot mark. For candidates that have a later red 13-dot mark,
// measure from title start to that next mark.
const pageCounts = Array(58).fill(0);
for (const page of corpus.pages) pageCounts[page.page] = page.indices.length;
const pagePrefix = [0];
for (const count of pageCounts) pagePrefix.push(pagePrefix.at(-1) + count);

const red13Markers = [];
for (const page of allInk.pages) {
  for (const [afterRunes, dots, color] of page.large_punctuation || []) {
    if (dots !== 13 || color !== "red") continue;
    red13Markers.push({
      page: page.page,
      afterRunes,
      global: pagePrefix[page.page] + afterRunes,
    });
  }
}
red13Markers.sort((a, b) => a.global - b.global);

const immediateTitleCandidates = [];
const rubricatedTitleSpans = [];
for (const page of allInk.pages) {
  for (const span of page.red_spans || []) {
    if (span.start !== 0) continue;
    const immediate13 = (page.large_punctuation || []).some(
      mark => mark[0] === span.length && mark[1] === 13 && mark[2] === "red",
    );
    if (!immediate13) continue;

    immediateTitleCandidates.push({page: page.page, titleLength: span.length});
    const globalStart = pagePrefix[page.page];
    const openingMark = globalStart + span.length;
    const nextMark = red13Markers.find(mark => mark.global > openingMark);
    if (!nextMark) continue; // final p57 title has no later red-13 delimiter.

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
assert.equal(immediateTitleCandidates.length, 9);
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
/** @param {[number, number]} point */
const at = ([row, column]) => {
  assert.ok(row >= 1 && row <= side && column >= 1 && column <= side);
  return grid[(row - 1) * side + column - 1];
};

// Source-visible n=13 and authenticated totient define (n, phi(n)).
const n = punctuation.dots;
const anchor = [n, phi(n)];
assert.deepEqual(anchor, [13, 12]);
assert.equal(at(anchor), index("J"));

// Use the visible second-group length as a diagonal stride. Test all four
// directions before inspecting the candidate output.
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

const originalNode = [at(anchor), selected.middleRune, selected.endRune];
assert.deepEqual(originalNode, [index("J"), index("R"), index("TH")]);
const key = [originalNode[0], phi(originalNode[1]), originalNode[2]];
assert.deepEqual(key, [index("J"), index("TH"), index("TH")]);

const cipher = words[1].gp_indices;
const plain = cipher.map((value, i) => mod29(value - key[i % key.length]));
assert.deepEqual(plain.map(value => corpus.translit[value]), ["R", "A", "T", "I", "O"]);
assert.deepEqual(
  plain.map((value, i) => mod29(value + key[i % key.length])),
  cipher,
);

// Coordinate-order control.
const swappedAnchor = [phi(n), n];
assert.deepEqual(swappedAnchor, [12, 13]);
const swappedMiddle = [swappedAnchor[0] + stride, swappedAnchor[1] + stride];
const swappedEnd = [swappedAnchor[0] + 2 * stride, swappedAnchor[1] + 2 * stride];
assert.equal(phi(at(swappedMiddle)), at(swappedEnd));
const swappedKey = [at(swappedAnchor), phi(at(swappedMiddle)), at(swappedEnd)];
const swappedPlain = cipher.map((value, i) => mod29(value - swappedKey[i % swappedKey.length]));
assert.notDeepEqual(swappedPlain, plain);

// Source-native orthography gate. Reproduce the authenticated 181-word LP1
// p10-p13 alignment used by the project's native-GP spelling control.
const sourceLP1 = read("resources/transcriptions/lp1_wulfic_canonical.txt");
const plainLP1 = read("resources/liber-primus/lp1-plaintext-reference.txt");
const runeToIndex = new Map(corpus.runes.map((rune, ordinal) => [rune, ordinal]));
const tokenOrder = corpus.translit.map((token, ordinal) => ({token, ordinal}))
  .sort((a, b) => b.token.length - a.token.length);

/** @param {string} original @param {boolean} sourceCalibration */
function encodeNativeGP(original, sourceCalibration = true) {
  const clean = original.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < clean.length;) {
    if (sourceCalibration && clean.startsWith("ING", i)) {
      out.push(21);
      i += 3;
      continue;
    }
    if (sourceCalibration && clean.startsWith("IO", i)) {
      out.push(27);
      i += 2;
      continue;
    }
    const token = tokenOrder.find(row => clean.startsWith(row.token, i));
    assert(token, "unmapped source-native spelling in " + original);
    out.push(token.ordinal);
    i += token.token.length;
  }
  return out;
}

const startP10 = sourceLP1.indexOf("ᚦᛖ-ᛚᚩᛋᛋ");
const afterP13 = sourceLP1.indexOf("\n$\n%\n", startP10);
assert(startP10 >= 0 && afterP13 > startP10);
const printedP10to13 = sourceLP1.slice(startP10, afterP13)
  .replace(/\/\n%\n/g, "")
  .replace(/\/\n/g, "")
  .replace(/\n/g, "");
const sourceWordPattern = new RegExp("[" + corpus.runes.join("") + "]+", "gu");
const printedWords = printedP10to13.match(sourceWordPattern) || [];

const plainSections = plainLP1.split(/### (\d+)\n/);
const referenceWords = [];
for (let i = 1; i < plainSections.length; i += 2) {
  const pageNumber = Number(plainSections[i]);
  if (pageNumber < 10 || pageNumber > 13) continue;
  const cleaned = plainSections[i + 1].replace(/^\[[^\n]*\]$/gm, "");
  referenceWords.push(...(cleaned.match(/[A-Z]+/g) || []));
}
assert.equal(referenceWords.length, 181);
assert.equal(printedWords.length, referenceWords.length);

const ioWitnesses = [];
for (let i = 0; i < referenceWords.length; i++) {
  if (!referenceWords[i].includes("IO")) continue;
  const printed = [...printedWords[i]].map(rune => runeToIndex.get(rune));
  const native = encodeNativeGP(referenceWords[i], true);
  const separate = encodeNativeGP(referenceWords[i], false);
  assert.deepEqual(native, printed);
  assert.notDeepEqual(separate, printed);
  ioWitnesses.push(referenceWords[i]);
}
assert.equal(ioWitnesses.length, 9);

// Under the calibrated source spelling, RATIO is four runes R-A-T-IOR.
// The geometric five-rune output is therefore not source-native RATIO under
// the demonstrated solved-LP convention. Latin-specific spelling remains an
// unsupported possibility rather than authenticated plaintext.
const sourceNativeRatio = encodeNativeGP("RATIO", true);
assert.deepEqual(sourceNativeRatio, [index("R"), index("A"), index("T"), index("IA")]);
assert.notDeepEqual(sourceNativeRatio, plain);

console.log(JSON.stringify({
  status: "geometry reproduces R-A-T-I-O, but source-native RATIO interpretation fails solved-LP IO orthography",
  immediateRedTitleWithRed13Candidates: immediateTitleCandidates.length,
  finiteTitleToNextRed13Spans: rubricatedTitleSpans.length,
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
  geometricOutput: plain.map(value => corpus.translit[value]),
  forwardReencryption: true,
  solvedLP1IoWordOccurrences: ioWitnesses.length,
  solvedLP1IoWitnesses: ioWitnesses,
  sourceNativeRATIO: sourceNativeRatio.map(value => corpus.translit[value]),
  orthographyConflict: true,
  swappedCoordinateControl: {
    anchor: swappedAnchor,
    key: swappedKey.map(value => corpus.translit[value]),
    output: swappedPlain.map(value => corpus.translit[value]),
  },
}, null, 2));
