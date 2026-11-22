"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(ROOT, name), "utf8");
const GP = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const alphabet = grid.alphabet;
assert.equal(alphabet.length, 60, "base60 alphabet must have 60 symbols");

const TABLE = grid.rows.flat().map((token) => {
  assert.equal(token.length, 2, "each p50 cell must be a two-character base60 token");
  const hi = alphabet.indexOf(token[0]);
  const lo = alphabet.indexOf(token[1]);
  assert.ok(hi >= 0 && lo >= 0, "unknown base60 digit");
  return hi * 60 + lo;
});
const derivedBytes = JSON.parse(read("resources/liber-primus/lp2-grid-256.json")).bytes;
assert.deepEqual(TABLE, derivedBytes, "base60 source grid and normalized byte table disagree");
assert.equal(TABLE.length, 256);
assert.equal(TABLE.filter((value) => value < 60).length, 60);

const runeToIndex = new Map(GP.runes.map((rune, index) => [rune, index]));
const runeIndices = (text) =>
  Array.from(text).filter((rune) => runeToIndex.has(rune)).map((rune) => runeToIndex.get(rune));

const sourceText = read("resources/transcriptions/lp2-image-corrected.txt");
const pageSegments = sourceText.split("%").slice(0, 55);
assert.equal(pageSegments.length, 55, "expected the 55 rune-bearing LP2 pages p0-p49 and p51-p55");

const lineGroups = [];
let globalRune = 0;
for (let segment = 0; segment < pageSegments.length; segment++) {
  const physicalPage = segment < 50 ? segment : segment + 1;
  const pageIndices = GP.pages[physicalPage].indices;
  const pageLines = pageSegments[segment]
    .split("/")
    .map((raw) => ({ ids: runeIndices(raw) }))
    .filter((line) => line.ids.length > 0);

  let pageCursor = 0;
  for (let lineIndex = 0; lineIndex < pageLines.length; lineIndex++) {
    const ids = pageLines[lineIndex].ids;
    const sourceIds = pageIndices.slice(pageCursor, pageCursor + ids.length);
    assert.deepEqual(sourceIds, ids, "printed-line transcription does not align with canonical page runes");
    pageCursor += ids.length;

    const primeSum = ids.reduce((sum, id) => sum + GP.prime[id], 0);
    const gp0Sum = ids.reduce((sum, id) => sum + id, 0);
    const opps = [];
    for (let j = 0; j < ids.length - 1; j++) {
      opps.push({ pos: globalRune + j, event: ids[j] === ids[j + 1] });
    }
    // A line-wrap pair belongs to the line containing its first rune.
    if (lineIndex + 1 < pageLines.length) {
      opps.push({
        pos: globalRune + ids.length - 1,
        event: ids[ids.length - 1] === pageLines[lineIndex + 1].ids[0],
      });
    }

    lineGroups.push({
      id: lineGroups.length,
      start: globalRune,
      length: ids.length,
      gp0Sum,
      primeSum,
      phiSum: primeSum - ids.length,
      opps,
    });
    globalRune += ids.length;
  }
  assert.equal(pageCursor, pageIndices.length, "printed lines do not cover the canonical page");
}
assert.equal(lineGroups.length, 594);
assert.equal(globalRune, 12956);
assert.equal(lineGroups.reduce((sum, group) => sum + group.opps.length, 0), 12901);
assert.equal(
  lineGroups.reduce((sum, group) => sum + group.opps.filter((op) => op.event).length, 0),
  86
);

// Reconstruct the original word stream. Slash and page boundaries preserve a
// word; other non-rune punctuation terminates it, matching lp2_word_pages.cjs.
const words = [];
let currentWord = "";
let wordStart = 0;
let runePosition = 0;
function finishWord() {
  if (!currentWord) return;
  words.push({ start: wordStart, runes: currentWord, length: Array.from(currentWord).length });
  currentWord = "";
}
for (const character of pageSegments.join("%")) {
  if (runeToIndex.has(character)) {
    if (!currentWord) wordStart = runePosition;
    currentWord += character;
    runePosition++;
  } else if (character === "%" || character === "/" || /\s/u.test(character)) {
    // Line and page separators do not terminate a word.
  } else {
    finishWord();
  }
}
finishWord();
assert.equal(words.length, 2896);
assert.equal(runePosition, 12956);

const wordGroups = words.map((word, id) => {
  const ids = runeIndices(word.runes);
  assert.equal(ids.length, word.length);
  const primeSum = ids.reduce((sum, index) => sum + GP.prime[index], 0);
  return {
    id,
    start: word.start,
    length: word.length,
    gp0Sum: ids.reduce((sum, index) => sum + index, 0),
    primeSum,
    phiSum: primeSum - word.length,
    opps: [],
  };
});
const wordAt = new Int32Array(12956);
wordAt.fill(-1);
for (const word of wordGroups) {
  for (let position = word.start; position < word.start + word.length; position++) {
    assert.equal(wordAt[position], -1, "overlapping word spans");
    wordAt[position] = word.id;
  }
}
assert.ok(Array.from(wordAt).every((id) => id >= 0), "some runes are not assigned to a word");

let pageStart = 0;
for (let physicalPage = 0; physicalPage < 56; physicalPage++) {
  const ids = GP.pages[physicalPage].indices;
  for (let j = 0; j < ids.length - 1; j++) {
    const position = pageStart + j;
    const wordId = wordAt[position];
    assert.ok(wordId >= 0, "page opportunity has no source word");
    wordGroups[wordId].opps.push({
      pos: position,
      event: ids[j] === ids[j + 1],
    });
  }
  pageStart += ids.length;
}
assert.equal(pageStart, 12956);
assert.equal(wordGroups.reduce((sum, group) => sum + group.opps.length, 0), 12901);
assert.equal(
  wordGroups.reduce((sum, group) => sum + group.opps.filter((op) => op.event).length, 0),
  86
);

function mod(value, modulus) {
  return ((value % modulus) + modulus) % modulus;
}

function makeRng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

// Conditional null: preserve each line's or word's observed event count, then
// choose that many positions uniformly without replacement within that group.
function runTest(groups, maskFunction, seed, simulations = 50000) {
  let maskPositions = 0;
  let observedHits = 0;
  let expectedHits = 0;
  let variance = 0;
  const prepared = [];

  for (const group of groups) {
    const masks = group.opps.map((op) => Boolean(maskFunction(group, op)));
    const n = group.opps.length;
    const e = group.opps.filter((op) => op.event).length;
    const m = masks.filter(Boolean).length;
    maskPositions += m;
    observedHits += group.opps.reduce(
      (sum, op, index) => sum + (op.event && masks[index] ? 1 : 0),
      0
    );
    if (n > 0) {
      expectedHits += (e * m) / n;
      if (n > 1) {
        variance += e * (m / n) * (1 - m / n) * ((n - e) / (n - 1));
      }
    }
    if (e > 0) prepared.push({ n, e, masks });
  }

  const random = makeRng(seed);
  let upper = 0;
  let lower = 0;
  for (let simulation = 0; simulation < simulations; simulation++) {
    let hits = 0;
    for (const group of prepared) {
      const chosen = new Set();
      while (chosen.size < group.e) {
        chosen.add(Math.floor(random() * group.n));
      }
      for (const index of chosen) {
        if (group.masks[index]) hits++;
      }
    }
    if (hits >= observedHits) upper++;
    if (hits <= observedHits) lower++;
  }

  const misses = 86 - observedHits;
  const result = {
    maskPositions,
    observedHits,
    expectedHits: Number(expectedHits.toFixed(3)),
    sd: Number(Math.sqrt(variance).toFixed(3)),
    z: Number(((observedHits - expectedHits) / Math.sqrt(variance)).toFixed(3)),
    eventRateInMask: Number((observedHits / maskPositions).toFixed(6)),
    eventRateOutsideMask: Number((misses / (12901 - maskPositions)).toFixed(6)),
    enrichment: Number(
      ((observedHits / maskPositions) / (misses / (12901 - maskPositions))).toFixed(4)
    ),
    simulations,
    upperTail: Number(((upper + 1) / (simulations + 1)).toFixed(6)),
    lowerTail: Number(((lower + 1) / (simulations + 1)).toFixed(6)),
    seed: "0x" + (seed >>> 0).toString(16).padStart(8, "0"),
  };
  return result;
}

const baselineLine = runTest(
  lineGroups,
  (_group, op) => TABLE[mod(op.pos, 256)] < 60,
  0x42415345
);
const lineTests = {
  baseline: baselineLine,
  primePlus: runTest(
    lineGroups,
    (group, op) => TABLE[mod(op.pos + (group.primeSum % 256), 256)] < 60,
    0x5052494d
  ),
  primeMinus: runTest(
    lineGroups,
    (group, op) => TABLE[mod(op.pos - (group.primeSum % 256), 256)] < 60,
    0x5052494e
  ),
  phiPlus: runTest(
    lineGroups,
    (group, op) => TABLE[mod(op.pos + (group.phiSum % 256), 256)] < 60,
    0x544f5449
  ),
  phiMinus: runTest(
    lineGroups,
    (group, op) => TABLE[mod(op.pos - (group.phiSum % 256), 256)] < 60,
    0x544f544a
  ),
};

const baselineWord = runTest(
  wordGroups,
  (_group, op) => TABLE[mod(op.pos, 256)] < 60,
  0x42415345
);
const wordTests = {
  baseline: baselineWord,
  primePlus: runTest(
    wordGroups,
    (group, op) => TABLE[mod(op.pos + (group.primeSum % 256), 256)] < 60,
    0x50525731
  ),
  primeMinus: runTest(
    wordGroups,
    (group, op) => TABLE[mod(op.pos - (group.primeSum % 256), 256)] < 60,
    0x50525732
  ),
  phiPlus: runTest(
    wordGroups,
    (group, op) => TABLE[mod(op.pos + (group.phiSum % 256), 256)] < 60,
    0x50484931
  ),
  phiMinus: runTest(
    wordGroups,
    (group, op) => TABLE[mod(op.pos - (group.phiSum % 256), 256)] < 60,
    0x50484932
  ),
  primeMapPlus: runTest(
    wordGroups,
    (group, op) => TABLE[mod(op.pos + TABLE[mod(group.primeSum, 256)], 256)] < 60,
    0x50524d31
  ),
  primeMapMinus: runTest(
    wordGroups,
    (group, op) => TABLE[mod(op.pos - TABLE[mod(group.primeSum, 256)], 256)] < 60,
    0x50524d32
  ),
  phiMapPlus: runTest(
    wordGroups,
    (group, op) => TABLE[mod(op.pos + TABLE[mod(group.phiSum, 256)], 256)] < 60,
    0x50484d31
  ),
  phiMapMinus: runTest(
    wordGroups,
    (group, op) => TABLE[mod(op.pos - TABLE[mod(group.phiSum, 256)], 256)] < 60,
    0x50484d32
  ),
};

const walkTests = {};
for (const [field, seed] of [
  ["gp0Sum", 0x47503031],
  ["primeSum", 0x50524931],
  ["phiSum", 0x50484931],
]) {
  const walkMasks = wordGroups.map((group) => {
    let state = mod(group[field], 256);
    const mask = new Uint8Array(group.length);
    for (let j = 0; j < group.length; j++) {
      state = TABLE[state];
      mask[j] = state < 60 ? 1 : 0;
    }
    return mask;
  });
  walkTests[field] = runTest(
    wordGroups,
    (group, op) => walkMasks[group.id][op.pos - group.start] === 1,
    seed
  );
}

const variants = [
  ["line-prime-plus", lineTests.primePlus],
  ["line-prime-minus", lineTests.primeMinus],
  ["line-phi-plus", lineTests.phiPlus],
  ["line-phi-minus", lineTests.phiMinus],
  ["word-prime-plus", wordTests.primePlus],
  ["word-prime-minus", wordTests.primeMinus],
  ["word-phi-plus", wordTests.phiPlus],
  ["word-phi-minus", wordTests.phiMinus],
  ["word-prime-map-plus", wordTests.primeMapPlus],
  ["word-prime-map-minus", wordTests.primeMapMinus],
  ["word-phi-map-plus", wordTests.phiMapPlus],
  ["word-phi-map-minus", wordTests.phiMapMinus],
  ["word-walk-gp0", walkTests.gp0Sum],
  ["word-walk-prime", walkTests.primeSum],
  ["word-walk-phi", walkTests.phiSum],
];
const nominal = variants.filter(([, result]) => result.upperTail < 0.05);
const minRawP = Math.min(...variants.map(([, result]) => result.upperTail));
const familywiseBonferroni = Math.min(1, minRawP * variants.length);

assert.equal(baselineLine.maskPositions, 3025);
assert.equal(baselineLine.observedHits, 33);
assert.equal(baselineWord.maskPositions, 3025);
assert.equal(baselineWord.observedHits, 33);
assert.ok(baselineLine.upperTail < 0.002);
assert.ok(baselineWord.upperTail < 0.002);
assert.equal(variants.length, 15);
assert.equal(nominal.length, 1);
assert.equal(nominal[0][0], "line-prime-plus");
assert.ok(nominal[0][1].upperTail > 0.03 && nominal[0][1].upperTail < 0.04);
assert.ok(wordTests.primeMapPlus.upperTail > 0.05 && wordTests.primeMapPlus.upperTail < 0.06);
assert.ok(familywiseBonferroni > 0.5);

const output = {
  interpretation:
    "The phase-zero p50 low60 association replicates, but no tested source-derived line/word-local prime/totient state improves it. No plaintext or cipher mechanism is recovered.",
  corpus: {
    runeBearingPages: 55,
    printedLines: lineGroups.length,
    words: wordGroups.length,
    runes: globalRune,
    adjacentWithinPageOpportunities: 12901,
    equalAdjacentEvents: 86,
    p50Cells: TABLE.length,
    low60Cells: TABLE.filter((value) => value < 60).length,
  },
  baseline: { lineConditioned: baselineLine, wordConditioned: baselineWord },
  lineTests,
  wordTests,
  wordTableWalkTests: walkTests,
  multipleTesting: {
    sourceDerivedVariants: variants.length,
    nominalUpperTailBelow005: nominal.map(([name, result]) => ({ name, p: result.upperTail })),
    minimumRawP: minRawP,
    bonferroniAdjustedMinimum: familywiseBonferroni,
  },
};

console.log(JSON.stringify(output, null, 2));
