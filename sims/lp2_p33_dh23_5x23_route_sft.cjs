"use strict";

/**
 * Agent 2: source-constrained p33 DH23 / 5x23 consumer gate.
 *
 * Hypothesis:
 *   - p33's visible M and NG markers have GP-prime values 71 and 79.
 *   - The authenticated 2013 TCP challenge's worked example supplies p=23,g=5.
 *   - Reducing the marker values mod 23 gives public shares 2 and 10.
 *   - Their DH shared value is 8, matching the second red title's 8 runes.
 *   - The selected second black body has 115 = 5*23 runes.
 *
 * This tests only two simple consumers of that fixed state:
 *   1. A 23-symbol DH orbit, repeated as a GP29 additive/subtractive stream,
 *      including the p56-style literal-F non-consuming exception.
 *   2. A 5x23 row-major body reshape read by columns in the DH orbit order.
 *
 * The DH parameters are from a historical worked example, not an LP2-specific
 * instruction. The M/NG-to-public-share mapping and the 5x23 reshape are
 * hypotheses. This script is a bounded negative gate, not a decryption claim.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = relative =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved = JSON.parse(
  read("resources/external/relikd-solved-gp29-native-v1.json")
);
const transcription = read("resources/liber-primus/lp2-transcription.txt");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const mod = (value, modulus) => ((value % modulus) + modulus) % modulus;
const modPow = (base, exponent, modulus) => {
  let result = 1;
  let factor = mod(base, modulus);
  let power = exponent;
  while (power > 0) {
    if (power & 1) result = (result * factor) % modulus;
    factor = (factor * factor) % modulus;
    power >>= 1;
  }
  return result;
};

const runeValues = source =>
  [...source]
    .map(character => runeIndex.get(character))
    .filter(value => value !== undefined);

const translit = values => values.map(value => corpus.translit[value]).join("");

function parseSection(sectionText) {
  const physicalLines = sectionText
    .split("/")
    .filter(line => line.trim().length > 0);
  let titleDone = false;
  let title = [];
  const bodyLines = [];

  for (const line of physicalLines) {
    let bodyPart = line;
    if (!titleDone) {
      const dot = line.indexOf(".");
      assert.ok(dot >= 0, "each p33 section must have a title/body dot");
      title = runeValues(line.slice(0, dot));
      bodyPart = line.slice(dot + 1);
      titleDone = true;
    }
    bodyLines.push(runeValues(bodyPart));
  }

  return {
    title,
    bodyLines,
    body: bodyLines.flat(),
    lineLengths: bodyLines.map(line => line.length),
  };
}

// ---------------------------------------------------------------------------
// Original p33 layout and the marker-derived DH state.
// ---------------------------------------------------------------------------

const p33Sections = transcription.split("%")[33].split("&").map(parseSection);
assert.equal(p33Sections.length, 2);
assert.deepEqual(
  p33Sections.map(section => ({
    title: section.title.length,
    body: section.body.length,
    lines: section.lineLengths,
  })),
  [
    { title: 10, body: 81, lines: [8, 16, 18, 23, 16] },
    { title: 8, body: 115, lines: [11, 18, 18, 22, 22, 24] },
  ]
);

const p33 = corpus.pages.find(page => page.page === 33);
assert.ok(p33);
assert.deepEqual(p33Sections[0].title, p33.indices.slice(0, 10));
assert.deepEqual(p33Sections[0].body, p33.indices.slice(10, 91));
assert.deepEqual(p33Sections[1].title, p33.indices.slice(91, 99));
assert.deepEqual(p33Sections[1].body, p33.indices.slice(99, 214));

const markerM = corpus.translit.indexOf("M");
const markerNG = corpus.translit.indexOf("NG");
assert.equal(markerM, 19);
assert.equal(markerNG, 21);

const markerPrimeM = corpus.prime[markerM];
const markerPrimeNG = corpus.prime[markerNG];
assert.equal(markerPrimeM, 71);
assert.equal(markerPrimeNG, 79);

const modulus = 23;
const generator = 5;
const publicM = mod(markerPrimeM, modulus);
const publicNG = mod(markerPrimeNG, modulus);
assert.deepEqual([publicM, publicNG], [2, 10]);

function discreteLog(base, target, prime) {
  for (let exponent = 0; exponent < prime - 1; exponent += 1) {
    if (modPow(base, exponent, prime) === target) return exponent;
  }
  throw new Error("no discrete log for " + target + " in the selected group");
}

const exponentM = discreteLog(generator, publicM, modulus);
const exponentNG = discreteLog(generator, publicNG, modulus);
assert.deepEqual([exponentM, exponentNG], [2, 3]);

const shared = modPow(publicM, exponentNG, modulus);
assert.equal(shared, modPow(publicNG, exponentM, modulus));
assert.equal(shared, 8);
assert.equal(shared, p33Sections[1].title.length);

const body = p33Sections[1].body;
assert.equal(body.length, 115);
assert.equal(body.length, 5 * modulus);

const orbit = [];
let state = shared;
for (let i = 0; i < modulus - 1; i += 1) {
  orbit.push(state);
  state = mod(state * generator, modulus);
}
assert.equal(state, shared);
assert.equal(new Set(orbit).size, modulus - 1);
orbit.push(0);
assert.equal(orbit.length, modulus);
assert.deepEqual(
  [...orbit].sort((a, b) => a - b),
  Array.from({ length: modulus }, (_, i) => i)
);

const streamKey = Array.from({ length: 5 }, () => orbit).flat();
assert.equal(streamKey.length, body.length);

// ---------------------------------------------------------------------------
// Fixed GP29 language calibration from published solved text; p56 excluded.
// ---------------------------------------------------------------------------

const training = solved.sections
  .filter(section => section.name !== "p56_an_end")
  .map(section => runeValues(section.source_text));

const alphabetSize = 29;
const alpha = 0.1;
const trigramCounts = new Map();
let trigramTotal = 0;

for (const values of training) {
  for (let i = 0; i + 2 < values.length; i += 1) {
    const key =
      values[i] * alphabetSize * alphabetSize +
      values[i + 1] * alphabetSize +
      values[i + 2];
    trigramCounts.set(key, (trigramCounts.get(key) || 0) + 1);
    trigramTotal += 1;
  }
}

const denominator =
  trigramTotal + alpha * alphabetSize * alphabetSize * alphabetSize;
const unseenLog = Math.log(alpha / denominator);

function trigramScore(values) {
  let score = 0;
  let count = 0;
  for (let i = 0; i + 2 < values.length; i += 1) {
    const key =
      values[i] * alphabetSize * alphabetSize +
      values[i + 1] * alphabetSize +
      values[i + 2];
    const hits = trigramCounts.get(key) || 0;
    score += hits
      ? Math.log((hits + alpha) / denominator)
      : unseenLog;
    count += 1;
  }
  return score / count;
}

const solvedScores = training
  .filter(values => values.length >= 50)
  .map(trigramScore);
const solvedMinimum = Math.min(...solvedScores);

// ---------------------------------------------------------------------------
// Consumer 1: DH orbit as a 23-symbol GP29 key, repeated five times.
// Literal F is optionally transparent and non-consuming, as on solved p56.
// ---------------------------------------------------------------------------

const literalFPositions = body
  .map((value, index) => (value === 0 ? index : null))
  .filter(index => index !== null);
assert.deepEqual(literalFPositions, [28, 54, 75, 98, 103]);

const streamCandidates = [];

for (let mask = 0; mask < 1 << literalFPositions.length; mask += 1) {
  for (const sign of [-1, 1]) {
    let keyIndex = 0;
    const plaintext = [];

    for (let i = 0; i < body.length; i += 1) {
      const fIndex = literalFPositions.indexOf(i);
      const literal =
        fIndex >= 0 && (mask & (1 << fIndex)) !== 0;

      if (literal) {
        plaintext.push(body[i]);
      } else {
        plaintext.push(
          mod(body[i] + sign * streamKey[keyIndex % modulus], alphabetSize)
        );
        keyIndex += 1;
      }
    }

    // Exact forward reconstruction for every candidate.
    let reverseKeyIndex = 0;
    const reconstructed = [];
    for (let i = 0; i < plaintext.length; i += 1) {
      const fIndex = literalFPositions.indexOf(i);
      const literal =
        fIndex >= 0 && (mask & (1 << fIndex)) !== 0;

      if (literal) {
        reconstructed.push(plaintext[i]);
      } else {
        reconstructed.push(
          mod(
            plaintext[i] - sign * streamKey[reverseKeyIndex % modulus],
            alphabetSize
          )
        );
        reverseKeyIndex += 1;
      }
    }
    assert.deepEqual(reconstructed, body);

    streamCandidates.push({
      mask,
      sign,
      literal: literalFPositions.filter(
        (_, index) => (mask & (1 << index)) !== 0
      ),
      consumed: keyIndex,
      score: trigramScore(plaintext),
      ioc: plaintext.reduce((counts, value) => {
        counts[value] += 1;
        return counts;
      }, Array(29).fill(0)).reduce(
        (sum, count) => sum + count * (count - 1),
        0
      ) / (plaintext.length * (plaintext.length - 1)),
      preview: translit(plaintext).slice(0, 120),
    });
  }
}

streamCandidates.sort((a, b) => b.score - a.score);
const bestStream = streamCandidates[0];

// ---------------------------------------------------------------------------
// Consumer 2: fill 5x23 row-major, read columns in the DH orbit order.
// The reverse traversal is the opposite direction of the same route.
// ---------------------------------------------------------------------------

const matrix = Array.from({ length: 5 }, (_, row) =>
  body.slice(row * modulus, (row + 1) * modulus)
);

function columnReadout(start) {
  const order = [];
  let current = start;
  for (let i = 0; i < modulus - 1; i += 1) {
    order.push(current);
    current = mod(current * generator, modulus);
  }
  order.push(0);
  assert.equal(new Set(order).size, modulus);
  return {
    order,
    output: order.flatMap(column => matrix.map(row => row[column])),
  };
}

const selectedReadout = columnReadout(shared);
const transposed = selectedReadout.output;
const reverseTransposed = [...transposed].reverse();

let readIndex = 0;
const inverseTransposition = Array(body.length);
for (const column of selectedReadout.order) {
  for (let row = 0; row < 5; row += 1) {
    inverseTransposition[row * modulus + column] = transposed[readIndex];
    readIndex += 1;
  }
}
assert.deepEqual(inverseTransposition, body);

const phaseControl = Array.from({ length: modulus - 1 }, (_, index) => {
  const start = index + 1;
  const candidate = columnReadout(start).output;
  return {
    start,
    score: trigramScore(candidate),
    preview: translit(candidate).slice(0, 36),
  };
}).sort((a, b) => b.score - a.score);

const selectedPhaseRank =
  phaseControl.findIndex(candidate => candidate.start === shared) + 1;
assert.equal(selectedPhaseRank, 17);

const rawScore = trigramScore(body);
const transpositionScore = trigramScore(transposed);
const reverseScore = trigramScore(reverseTransposed);

assert.ok(bestStream.score < solvedMinimum);
assert.ok(transpositionScore < solvedMinimum);
assert.ok(reverseScore < solvedMinimum);

console.log(JSON.stringify({
  status: "PASS",
  classification:
    "bounded negative: p33 DH23/5x23 direct stream and route consumers fail",
  sourceState: {
    visibleMarkers: {
      M: { gpIndex: markerM, gpPrime: markerPrimeM, mod23: publicM },
      NG: { gpIndex: markerNG, gpPrime: markerPrimeNG, mod23: publicNG },
    },
    historicalWorkedExample: { modulus, generator },
    discreteLogs: [exponentM, exponentNG],
    shared,
    titleLength: p33Sections[1].title.length,
    bodyLength: body.length,
    bodyFactorization: "5 x 23",
    bodyLineLengths: p33Sections[1].lineLengths,
    dhOrbit: orbit,
  },
  calibration: {
    longSolvedMinimum: solvedMinimum,
    rawBodyScore: rawScore,
  },
  dhStream: {
    candidates: streamCandidates.length,
    best: bestStream,
    decision: "No candidate reaches the long solved-text calibration.",
  },
  fiveByTwentyThreeRoute: {
    columnOrder: selectedReadout.order,
    forwardScore: transpositionScore,
    reverseScore,
    forwardPreview: translit(transposed).slice(0, 120),
    reversePreview: translit(reverseTransposed).slice(0, 120),
    selectedPhaseStart: shared,
    selectedPhaseRankOf22: selectedPhaseRank,
    bestControlPhase: phaseControl[0],
    decision: "The fixed DH start is not a strong phase and neither direction yields plaintext.",
  },
  decision:
    "Retain the M/NG -> DH8 -> title8 alignment as structural evidence only. Reject the tested direct GP29 stream and 5x23 column-route consumers; do not broaden to arbitrary phases or recurrences.",
}, null, 2));
