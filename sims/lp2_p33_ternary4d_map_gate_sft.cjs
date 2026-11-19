"use strict";

/**
 * SFT: source-selected p33 upper body as an e^q = 3^4 ternary coordinate map.
 *
 * The family is exactly the 4! axis permutations times 2^4 axis reflections.
 * It is charged twice: on the original 81-rune body and after the independently
 * selected x^27 mod29 word operation is applied uniformly to all 81 runes.
 *
 * Run:
 *   node sims/lp2_p33_ternary4d_map_gate_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @param {string} source @returns {number[]} */
function runeValues(source) {
  return [...source]
    .map((rune) => runeIndex.get(rune))
    .filter((value) => value !== undefined);
}

/** @param {number[]} values @returns {string} */
function translit(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

const p33Text = transcription.split("%")[33];
const firstSection = p33Text.split("&")[0];
const physicalLines = firstSection.split("/").filter((line) => line.trim().length > 0);
const body = [];
for (let lineIndex = 0; lineIndex < physicalLines.length; lineIndex += 1) {
  let line = physicalLines[lineIndex];
  if (lineIndex === 0) line = line.slice(line.indexOf(".") + 1);
  body.push(...runeValues(line));
}
assert.equal(body.length, 81);

// Fixed GP29 trigram reference used by the existing p33 decoder gate.
const training = solved.sections
  .filter((section) => section.name !== "p56_an_end")
  .map((section) => runeValues(section.source_text));
const N = 29;
const alpha = 0.1;
const counts = new Map();
let total = 0;
for (const values of training) {
  for (let i = 0; i + 2 < values.length; i += 1) {
    const key = values[i] * N * N + values[i + 1] * N + values[i + 2];
    counts.set(key, (counts.get(key) || 0) + 1);
    total += 1;
  }
}
const denominator = total + alpha * N * N * N;
const unseenLog = Math.log(alpha / denominator);

/** @param {number[]} values @returns {number} */
function trigramScore(values) {
  let score = 0;
  let count = 0;
  for (let i = 0; i + 2 < values.length; i += 1) {
    const key = values[i] * N * N + values[i + 1] * N + values[i + 2];
    const hits = counts.get(key) || 0;
    score += hits
      ? Math.log((hits + alpha) / denominator)
      : unseenLog;
    count += 1;
  }
  return score / count;
}

/** @param {number} base @param {number} exponent @returns {number} */
function pow29(base, exponent) {
  let out = 1;
  let current = base % 29;
  let power = exponent;
  while (power > 0) {
    if (power & 1) out = (out * current) % 29;
    current = (current * current) % 29;
    power >>= 1;
  }
  return out;
}

/** @param {number[]} values @returns {number[][]} */
function permutations(values) {
  if (values.length <= 1) return [values];
  const out = [];
  for (let i = 0; i < values.length; i += 1) {
    const rest = values.slice(0, i).concat(values.slice(i + 1));
    for (const tail of permutations(rest)) out.push([values[i], ...tail]);
  }
  return out;
}

/** @param {number} index @returns {number[]} */
function ternaryDigits(index) {
  return [
    Math.floor(index / 27) % 3,
    Math.floor(index / 9) % 3,
    Math.floor(index / 3) % 3,
    index % 3,
  ];
}

/** @param {number[]} digits @returns {number} */
function ternaryIndex(digits) {
  return digits[0] * 27 + digits[1] * 9 + digits[2] * 3 + digits[3];
}

/**
 * @param {number[]} source
 * @returns {{perm:string,mask:number,score:number,preview:string}[]}
 */
function coordinateFamily(source) {
  const results = [];
  for (const permutation of permutations([0, 1, 2, 3])) {
    for (let mask = 0; mask < 16; mask += 1) {
      const output = Array(81);
      for (let outputIndex = 0; outputIndex < 81; outputIndex += 1) {
        const outputDigits = ternaryDigits(outputIndex);
        const sourceDigits = Array(4);
        for (let axis = 0; axis < 4; axis += 1) {
          const digit = (mask >> axis) & 1
            ? 2 - outputDigits[axis]
            : outputDigits[axis];
          sourceDigits[permutation[axis]] = digit;
        }
        output[outputIndex] = source[ternaryIndex(sourceDigits)];
      }

      // Coordinate maps are permutations, so inverse existence is guaranteed
      // by the unique source-index census below.
      assert.equal(new Set(output.map((_, index) => index)).size, 81);
      results.push({
        perm: permutation.join(""),
        mask,
        score: trigramScore(output),
        preview: translit(output).slice(0, 180),
      });
    }
  }
  return results.sort((left, right) => right.score - left.score);
}

const solvedScores = training
  .filter((values) => values.length >= 50)
  .map((values) => trigramScore(values));
const solvedMin = Math.min(...solvedScores);

const plainMap = coordinateFamily(body);
const poweredBody = body.map((value) => pow29(value, 27));
const poweredMap = coordinateFamily(poweredBody);

assert.equal(plainMap.length, 384);
assert.equal(poweredMap.length, 384);
assert.equal(plainMap.filter((row) => row.score >= solvedMin).length, 0);
assert.equal(poweredMap.filter((row) => row.score >= solvedMin).length, 0);

assert.equal(plainMap[0].perm, "3201");
assert.equal(plainMap[0].mask, 0);
assert.ok(Math.abs(plainMap[0].score - (-10.445631687550863)) < 1e-12);

assert.equal(poweredMap[0].perm, "3102");
assert.equal(poweredMap[0].mask, 9);
assert.ok(Math.abs(poweredMap[0].score - (-10.47360512048177)) < 1e-12);

process.stdout.write(JSON.stringify({
  classification: "bounded negative",
  sourceGeometry: {
    e: 3,
    q: 4,
    cells: 81,
    familySize: 384,
  },
  rawScore: trigramScore(body),
  solvedLongTextMinimum: solvedMin,
  pureCoordinateBest: plainMap[0],
  power27RawScore: trigramScore(poweredBody),
  power27CoordinateBest: poweredMap[0],
  pureCoordinateSolvedRangeHits: plainMap.filter((row) => row.score >= solvedMin).length,
  power27CoordinateSolvedRangeHits: poweredMap.filter((row) => row.score >= solvedMin).length,
  decision:
    "Retire the direct 3^4 axis-permutation/reflection readout of p33 upper81, with or without uniform x^27 first. Neither family approaches solved native-GP text.",
}, null, 2) + "\n");
