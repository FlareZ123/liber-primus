"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const donor =
  read("resources/control/shakespeare_first300k.txt") + "\n" +
  read("resources/control/gibran_prophet_58585.txt") + "\n" +
  read("resources/control/emerson_essays_2944.txt");

const mod29 = (value) => ((value % 29) + 29) % 29;
const sorted = gp.translit
  .map((text, index) => ({ text, index }))
  .sort((left, right) => right.text.length - left.text.length);

/** @param {string} source @returns {number[]} */
function encodeNative(source) {
  const out = [];
  for (const raw of source.toUpperCase().match(/[A-Z]+/g) || []) {
    const word = raw
      .replace(/QU/g, "CW")
      .replace(/V/g, "U")
      .replace(/[KQ]/g, "C")
      .replace(/Z/g, "S");
    for (let offset = 0; offset < word.length;) {
      const token = word.startsWith("ING", offset)
        ? { text: "ING", index: 21 }
        : word.startsWith("IO", offset)
          ? { text: "IO", index: 27 }
          : sorted.find((candidate) => word.startsWith(candidate.text, offset));
      if (!token) {
        offset += 1;
        continue;
      }
      out.push(token.index);
      offset += token.text.length;
    }
  }
  return out;
}

const training = encodeNative(donor);
assert.equal(training.length, 600925);

const trigram = new Map();
for (let index = 0; index + 2 < training.length; index += 1) {
  const key =
    training[index] * 29 * 29 +
    training[index + 1] * 29 +
    training[index + 2];
  trigram.set(key, (trigram.get(key) || 0) + 1);
}

const alpha = 0.15;
const vocabulary = 29 ** 3;
const total = training.length - 2;

/** @param {number[]} sequence @returns {number} */
function languageScore(sequence) {
  assert(sequence.length >= 3);
  let result = 0;
  for (let index = 0; index + 2 < sequence.length; index += 1) {
    const key =
      sequence[index] * 29 * 29 +
      sequence[index + 1] * 29 +
      sequence[index + 2];
    result += Math.log(
      ((trigram.get(key) || 0) + alpha) /
      (total + alpha * vocabulary)
    );
  }
  return result / (sequence.length - 2);
}

/** @param {number[]} sequence @returns {string} */
function transliterate(sequence) {
  return sequence.map((value) => gp.translit[value]).join("");
}

const pages = new Map(gp.pages.map((page) => [page.page, page.indices]));
assert.equal(pages.get(50).length, 0);

const operations = [
  ["A-B", (a, b) => mod29(a - b)],
  ["B-A", (a, b) => mod29(b - a)],
  ["A+B", (a, b) => mod29(a + b)],
];

const pairMaxima = [];

for (let a = 40; a <= 55; a += 1) {
  for (let b = a + 1; b <= 55; b += 1) {
    /** @type {null | object} */
    let best = null;

    for (const reverseB of [false, true]) {
      for (const endpoint of ["prefix", "suffix"]) {
        for (const [operationName, operation] of operations) {
          let left = pages.get(a).slice();
          let right = pages.get(b).slice();
          if (reverseB) right.reverse();

          const length = Math.min(left.length, right.length);
          if (length < 3) continue;

          if (endpoint === "prefix") {
            left = left.slice(0, length);
            right = right.slice(0, length);
          } else {
            left = left.slice(-length);
            right = right.slice(-length);
          }

          const output = left.map((value, index) =>
            operation(value, right[index])
          );
          const score = languageScore(output);

          if (!best || score > best.score) {
            best = {
              score,
              reverseB,
              endpoint,
              operation: operationName,
              length,
              preview: transliterate(output.slice(0, 100)),
            };
          }
        }
      }
    }

    if (best) {
      pairMaxima.push({
        a,
        b,
        mirror: b === 95 - a,
        ...best,
      });
    }
  }
}

pairMaxima.sort((left, right) => right.score - left.score);
assert.equal(pairMaxima.length, 105);

const mirrors = pairMaxima
  .filter((row) => row.mirror)
  .map((row) => ({ ...row, rank: pairMaxima.indexOf(row) + 1 }));
const controls = pairMaxima.filter((row) => !row.mirror);

assert.equal(mirrors.length, 7);
assert.equal(controls.length, 98);
assert.deepEqual(mirrors.map((row) => row.rank), [18, 20, 52, 60, 69, 82, 97]);

const mean = (values) =>
  values.reduce((sum, value) => sum + value, 0) / values.length;
const median = (values) => {
  const sortedValues = values.slice().sort((a, b) => a - b);
  return sortedValues[Math.floor(sortedValues.length / 2)];
};

const mirrorScores = mirrors.map((row) => row.score);
const controlScores = controls.map((row) => row.score);

let wins = 0;
let comparisons = 0;
for (const mirror of mirrorScores) {
  for (const control of controlScores) {
    comparisons += 1;
    if (mirror > control) wins += 1;
    else if (mirror === control) wins += 0.5;
  }
}

assert.equal(comparisons, 686);
assert.equal(wins, 316);
assert(Math.abs(mean(mirrorScores) - (-13.140771938172719)) < 1e-12);
assert(Math.abs(mean(controlScores) - (-13.09343659625019)) < 1e-12);
assert(Math.abs(median(mirrorScores) - (-13.189975563814889)) < 1e-12);
assert(Math.abs(median(controlScores) - (-13.162062623809701)) < 1e-12);

const bestMirror = mirrors[0];
assert.deepEqual(
  {
    a: bestMirror.a,
    b: bestMirror.b,
    rank: bestMirror.rank,
    reverseB: bestMirror.reverseB,
    endpoint: bestMirror.endpoint,
    operation: bestMirror.operation,
    length: bestMirror.length,
  },
  {
    a: 44,
    b: 51,
    rank: 18,
    reverseB: false,
    endpoint: "suffix",
    operation: "A-B",
    length: 92,
  }
);

console.log(JSON.stringify({
  status: "PASS",
  hypothesis: "section reflection -> mirrored page pairs -> direct GP29 sum/difference",
  chargedFamily: {
    orientations: ["printed-B", "reversed-B"],
    endpoints: ["prefix", "suffix"],
    operations: ["A-B", "B-A", "A+B"],
    variantsPerPair: 12,
    offsets: 0,
    additiveShifts: 0,
  },
  typedException: "p45<->p50 has no rune/rune test because p50 is the numeric panel",
  pairCounts: {
    allRunePairs: pairMaxima.length,
    mirrors: mirrors.length,
    controls: controls.length,
  },
  mirrors,
  matchedControl: {
    mirrorMean: mean(mirrorScores),
    controlMean: mean(controlScores),
    mirrorMedian: median(mirrorScores),
    controlMedian: median(controlScores),
    wins,
    comparisons,
    winRate: wins / comparisons,
    globalBest: pairMaxima[0],
  },
  decision: "No mirror-pair language enrichment; retire uniform direct +/- GP29 page pairing for the p40-p55 frame.",
}, null, 2));
