"use strict";

/**
 * SFT: p28 literal-DH fragment lengths self-encode the READ OUT center transform.
 *
 * Reconstructs the canonical unknown-page physical lines, verifies the unique
 * p28 literal-DH line and its [2,3,9,4,5] fragment lengths, checks the
 * DH/cube relations, reproduces READ OUT, and exhausts p0..p55 for the same
 * ordered fragment-length pattern.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const parts = transcription.split(/^\s*%\s*$/m);

function mod(value, modulus) {
  return ((value % modulus) + modulus) % modulus;
}

function powMod(base, exponent, modulus) {
  let result = 1;
  let factor = mod(base, modulus);
  let power = exponent;
  while (power > 0) {
    if (power % 2 === 1) result = (result * factor) % modulus;
    factor = (factor * factor) % modulus;
    power = Math.floor(power / 2);
  }
  return result;
}

function H(left, right) {
  return [mod(left - right, 29), mod(left + right, 29)];
}

function translit(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

function physicalFragments(line) {
  return (line.match(/[\u16A0-\u16FF]+/gu) || []).map((fragment) =>
    [...fragment].map((rune) => {
      const value = runeIndex.get(rune);
      assert.notEqual(value, undefined);
      return value;
    })
  );
}

function runeBearingLines(pageText) {
  return pageText
    .trim()
    .split("/")
    .map((raw) => ({ raw, fragments: physicalFragments(raw) }))
    .filter((row) => row.fragments.flat().length > 0);
}

function parsePage(pageText) {
  const runes = [];
  const words = [];
  let current = [];
  let start = 0;

  function flush() {
    if (!current.length) return;
    words.push({
      index: words.length,
      start,
      end: start + current.length - 1,
      values: current.slice(),
      length: current.length,
    });
    current = [];
  }

  for (const char of [...pageText]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) start = runes.length;
      current.push(value);
      runes.push(value);
    } else if ((char === "-" || char === ".") && current.length) {
      flush();
    }
  }
  flush();
  return { runes, words };
}

function physicalPageForPart(partIndex) {
  return partIndex <= 49 ? partIndex : partIndex + 1;
}

const p28 = parsePage(parts[28]);
assert.equal(p28.runes.length, 269);
assert.equal(p28.words.length, 59);

const p28Lines = runeBearingLines(parts[28]);
const line6 = p28Lines[5];
const fragments = line6.fragments;
const fragmentLengths = fragments.map((fragment) => fragment.length);

assert.equal(translit(fragments[0]), "DH");
assert.deepEqual(fragmentLengths, [2, 3, 9, 4, 5]);
assert.equal(fragmentLengths.reduce((total, value) => total + value, 0), 23);
assert.equal(fragments.length, 5);

const outerH = fragments.map((fragment) =>
  H(fragment[0], fragment[fragment.length - 1])
);
assert.deepEqual(outerH, [
  [15, 2],
  [14, 4],
  [12, 12],
  [23, 12],
  [8, 19],
]);

const state = {
  p: 23,
  g: 5,
  a: 6,
  b: 15,
  A: 8,
  B: 19,
  K: 2,
};
assert.equal(fragmentLengths[0], state.K);
assert.equal(fragmentLengths[4], state.g);
assert.equal(p28Lines.indexOf(line6) + 1, state.a);

assert.equal(powMod(state.g, state.a, state.p), state.A);
assert.equal(powMod(state.g, state.b, state.p), state.B);
assert.equal(powMod(state.B, state.a, state.p), state.K);
assert.equal(powMod(state.A, state.b, state.p), state.K);

const cubeOrbit = [];
let exponent = 1;
do {
  cubeOrbit.push(exponent);
  exponent = mod(exponent * 3, 28);
} while (exponent !== 1);
assert.deepEqual(cubeOrbit, [1, 3, 9, 27, 25, 19]);

const bridgeHits = cubeOrbit.filter((candidate) =>
  powMod(state.K, candidate, 29) === state.A &&
  powMod(state.A, candidate, 29) === state.B &&
  powMod(state.B, candidate, 29) === state.b
);
assert.deepEqual(bridgeHits, [3]);

const e = bridgeHits[0];
assert.equal(fragmentLengths[1], e);
assert.equal(fragmentLengths[2], mod(e * e, 28));
assert.equal(mod(e * e * e, 28), 27);

const centerOffset = (p28.runes.length - 1) / 2;
assert.equal(centerOffset, 134);
assert.equal(p28.runes[centerOffset], 9);

const firstFourLength = fragmentLengths.slice(0, 4)
  .reduce((total, value) => total + value, 0);
const line6Start = p28.runes.length === 269
  ? p28Lines.slice(0, 5)
      .flatMap((row) => row.fragments.flat()).length
  : null;
assert.equal(line6Start, 117);
assert.equal(line6Start + firstFourLength - 1, centerOffset);
assert.equal(fragmentLengths[2], p28.runes[centerOffset]);
assert.equal(outerH[1][1], fragmentLengths[3]);
assert.equal(powMod(p28.runes[centerOffset], e, 29), outerH[1][1]);
assert.equal(powMod(p28.runes[centerOffset], e, 29), fragmentLengths[3]);

const word28 = p28.words[27];
assert.equal(word28.start, centerOffset + 1);
assert.deepEqual(word28.values, fragments[4]);
assert.deepEqual(word28.values, [28, 24, 10, 1, 20]);

const wordExponent = mod(e * e * e, 28);
assert.equal(wordExponent, 27);
assert.deepEqual(outerH[4], [state.A, state.B]);
assert.deepEqual(H(state.A, state.B), [18, wordExponent]);
assert.equal(wordExponent, mod(28 - 1, 28));

const pageNumberedFiveRuneControls = [];
for (let partIndex = 0; partIndex < parts.length; partIndex += 1) {
  const page = physicalPageForPart(partIndex);
  if (page < 1 || page > 55) continue;
  const parsed = parsePage(parts[partIndex]);
  const pageWord = parsed.words[page - 1];
  if (!pageWord || pageWord.length !== 5) continue;
  const firstH = H(
    pageWord.values[0],
    pageWord.values[pageWord.values.length - 1]
  );
  const secondH = H(firstH[0], firstH[1]);
  pageNumberedFiveRuneControls.push({
    page,
    firstH,
    secondH,
    pageMinus1Mod28: mod(page - 1, 28),
    match: secondH[1] === mod(page - 1, 28),
  });
}
assert.equal(pageNumberedFiveRuneControls.length, 10);
assert.deepEqual(
  pageNumberedFiveRuneControls.filter((row) => row.match),
  [{
    page: 28,
    firstH: [8, 19],
    secondH: [18, 27],
    pageMinus1Mod28: 27,
    match: true,
  }]
);

const output = [
  powMod(p28.runes[centerOffset], e, 29),
  ...word28.values.map((value) => powMod(value, wordExponent, 29)),
];
assert.deepEqual(output, [4, 28, 23, 3, 1, 16]);
assert.equal(translit(output), "READOUT");

const inverse = [
  powMod(output[0], 19, 29),
  ...output.slice(1).map((value) => powMod(value, 27, 29)),
];
assert.deepEqual(inverse, [p28.runes[centerOffset], ...word28.values]);

let runeBearingLineCount = 0;
let length23Count = 0;
let length23FiveFragmentCount = 0;
let length23FiveFragmentLine6Count = 0;
const exactSequenceHits = [];
const centerBoundaryFamily = [];
const centerEquationHits = [];

for (let partIndex = 0; partIndex < parts.length; partIndex += 1) {
  const page = physicalPageForPart(partIndex);
  if (page > 55) continue;

  const parsed = parsePage(parts[partIndex]);
  const lines = runeBearingLines(parts[partIndex]);
  let pageOffset = 0;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const row = lines[lineIndex];
    const lengths = row.fragments.map((fragment) => fragment.length);
    const lineLength = lengths.reduce((total, value) => total + value, 0);

    runeBearingLineCount += 1;
    if (lineLength === 23) length23Count += 1;
    if (lineLength === 23 && row.fragments.length === 5) {
      length23FiveFragmentCount += 1;
      if (lineIndex + 1 === 6) length23FiveFragmentLine6Count += 1;
    }

    const pageCenter = parsed.runes.length % 2 === 1
      ? (parsed.runes.length - 1) / 2
      : null;
    const endFourth = lengths.length >= 4
      ? pageOffset +
        lengths.slice(0, 4).reduce((total, value) => total + value, 0) - 1
      : null;

    if (
      lengths.length >= 4 &&
      pageCenter !== null &&
      endFourth === pageCenter &&
      parsed.runes[pageCenter] === lengths[2] &&
      row.fragments[1].length >= 2
    ) {
      const fragment2H = H(
        row.fragments[1][0],
        row.fragments[1][row.fragments[1].length - 1]
      );
      const centerValue = parsed.runes[pageCenter];
      const powerOutput = powMod(centerValue, lengths[1], 29);
      const candidate = {
        page,
        line: lineIndex + 1,
        lengths,
        centerValue,
        fragment2H,
        powerOutput,
        fragment4Length: lengths[3],
      };
      centerBoundaryFamily.push(candidate);
      if (
        powerOutput === fragment2H[1] &&
        powerOutput === lengths[3]
      ) {
        centerEquationHits.push(candidate);
      }
    }

    if (lengths.join(",") === "2,3,9,4,5") {
      exactSequenceHits.push({
        page,
        line: lineIndex + 1,
        pageOffset,
        lineLength,
        pageCenter,
        centerValue: pageCenter === null ? null : parsed.runes[pageCenter],
        endFourth,
      });
    }

    pageOffset += lineLength;
  }
}

assert.equal(runeBearingLineCount, 594);
assert.equal(length23Count, 145);
assert.equal(length23FiveFragmentCount, 45);
assert.equal(length23FiveFragmentLine6Count, 4);
assert.deepEqual(exactSequenceHits, [{
  page: 28,
  line: 6,
  pageOffset: 117,
  lineLength: 23,
  pageCenter: 134,
  centerValue: 9,
  endFourth: 134,
}]);
assert.deepEqual(centerBoundaryFamily, [
  {
    page: 11,
    line: 6,
    lengths: [8, 9, 2, 2],
    centerValue: 2,
    fragment2H: [1, 27],
    powerOutput: 19,
    fragment4Length: 2,
  },
  {
    page: 28,
    line: 6,
    lengths: [2, 3, 9, 4, 5],
    centerValue: 9,
    fragment2H: [14, 4],
    powerOutput: 4,
    fragment4Length: 4,
  },
]);
assert.deepEqual(centerEquationHits, [centerBoundaryFamily[1]]);

console.log(JSON.stringify({
  status: "PASS: p28 DH fragment lengths self-encode READ OUT center transform",
  fragmentLengths,
  state,
  cubeOrbit,
  center: {
    offset: centerOffset,
    value: p28.runes[centerOffset],
    exponent: e,
    output: output[0],
  },
  word: {
    indexOneBased: 28,
    start: word28.start,
    values: word28.values,
    exponent: wordExponent,
    output: output.slice(1),
    pageNumberedFiveRuneControls,
  },
  plaintext: translit(output),
  census: {
    runeBearingLineCount,
    length23Count,
    length23FiveFragmentCount,
    length23FiveFragmentLine6Count,
    exactSequenceHits,
    centerBoundaryFamily,
    centerEquationHits,
  },
  classification:
    "post-discovery source-visible structural support; exact [2,3,9,4,5] geometry is unique across 594 unknown rune-bearing lines and predicts center 9^3=4 before language scoring.",
}, null, 2));
