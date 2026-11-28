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

/** @param {number[]} values @returns {number} */
function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

/** @param {number[]} values @returns {number[][]} */
function permutations(values) {
  const found = new Map();
  /** @param {number[]} prefix @param {number[]} rest */
  function visit(prefix, rest) {
    if (!rest.length) {
      found.set(prefix.join(","), prefix.slice());
      return;
    }
    for (let index = 0; index < rest.length; index += 1) {
      visit(prefix.concat(rest[index]), rest.slice(0, index).concat(rest.slice(index + 1)));
    }
  }
  visit([], values);
  return [...found.values()];
}

/** @param {number[]} shell @returns {number[]} */
function h4Inverse(shell) {
  assert.equal(shell.length, 4);
  const inv2 = 15;
  return [
    mod((shell[0] + shell[3]) * inv2),
    mod((shell[1] + shell[2]) * inv2),
    mod((shell[2] - shell[1]) * inv2),
    mod((shell[3] - shell[0]) * inv2),
  ];
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const parts = transcription.split(/^\s*%\s*$/m);

/**
 * Parse complete page-local printed groups with zero-based rune starts.
 * Pages used here precede the rune-free p50 panel, so split index = page.
 * @param {number} page
 * @returns {{start:number, values:number[], len:number}[]}
 */
function pageWords(page) {
  const words = [];
  let current = [];
  let start = 0;
  let offset = 0;

  function flush() {
    if (!current.length) return;
    words.push({ start, values: current.slice(), len: current.length });
    current = [];
  }

  for (const char of [...parts[page]]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) start = offset;
      current.push(value);
      offset += 1;
    } else if (!/[\s/]/u.test(char)) {
      flush();
    }
  }
  flush();
  assert.equal(offset, corpus.pages[page].indices.length);
  return words;
}

const p6 = pageWords(6);
const titleStarts = [71, 75, 76, 80];
const title = titleStarts.map((start) => {
  const word = p6.find((candidate) => candidate.start === start);
  assert.ok(word, `missing p6 title word at ${start}`);
  return word;
});
assert.deepEqual(title.map((word) => word.values), [
  [24, 16, 14, 17],
  [19],
  [6, 27, 15, 17],
  [14, 12],
]);
assert.deepEqual(title.map((word) => word.len), [4, 1, 4, 2]);

const W1 = title[0].values;
const W3 = title[2].values;
const W4 = title[3].values;
const K = 2;
const e = 3;
const q = 4;
const g = 5;
const a = 6;
const b = 15;
const F = 0;

const block1Shell = [g, a * K, q * g, mod29(-e)];
const block1Residues = h4Inverse(block1Shell);
const block3Shell = [K + b, a * K, b, mod29(-b)];
const block3Residues = h4Inverse(block3Shell);
assert.deepEqual(block1Shell, [5, 12, 20, 26]);
assert.deepEqual(block1Residues, [1, 16, 4, 25]);
assert.deepEqual(block3Shell, [17, 12, 15, 14]);
assert.deepEqual(block3Residues, [1, 28, 16, 13]);

const observedTransition = block3Shell.map((value, index) => mod29(value - block1Shell[index]));
const literalTransition = [W4.at(-1), F, W1[0], W1.at(-1)];
assert.deepEqual(observedTransition, [12, 0, 24, 17]);
assert.deepEqual(observedTransition, literalTransition);
assert.deepEqual(observedTransition, [a * K, F, mod29(-g), K + b]);

const pageLengths = new Map([[37, 4], [38, 6], [39, 5], [40, 4]]);
const support = new Map();
for (const [page, wantedLength] of pageLengths) {
  const byResidue = new Map();
  for (const word of pageWords(page).filter((candidate) => candidate.len === wantedLength)) {
    const residue = mod29(word.start);
    if (!byResidue.has(residue)) byResidue.set(residue, []);
    byResidue.get(residue).push(word.start);
  }
  support.set(page, byResidue);
}

/** @param {number} page @param {number} residue @returns {number[]} */
function startsAtResidue(page, residue) {
  return support.get(page).get(residue) || [];
}

const configurations = [];
for (const [qWordName, qWord] of [["W1", W1], ["W3", W3]]) {
  for (const endpointOrientation of [0, 1]) {
    const endpoints = endpointOrientation
      ? [qWord.at(-1), qWord[0]]
      : [qWord[0], qWord.at(-1)];
    for (const terminalRuneIndex of [0, 1]) {
      const base = [W4[terminalRuneIndex], F, endpoints[0], endpoints[1]];
      for (const permutation of permutations([0, 1, 2, 3])) {
        const permuted = permutation.map((index) => base[index]);
        for (const direction of [1, -1]) {
          const transition = permuted.map((value) => mod29(direction * value));
          const predictedShell = block1Shell.map((value, index) => mod29(value + transition[index]));
          const predictedResidues = h4Inverse(predictedShell);
          const receiverStarts = [37, 38, 39, 40].map((page, index) =>
            startsAtResidue(page, predictedResidues[index])
          );
          configurations.push({
            qWordName,
            endpointOrientation,
            terminalRuneIndex,
            permutation,
            direction,
            transition,
            predictedShell,
            predictedResidues,
            receiverStarts,
            supportsAll: receiverStarts.every((starts) => starts.length > 0),
            supportsAddress71: receiverStarts[3].includes(71),
          });
        }
      }
    }
  }
}

assert.equal(configurations.length, 384);
const numericTransitions = new Set(configurations.map((row) => row.transition.join(",")));
assert.equal(numericTransitions.size, 192);

const exactVectorLabels = configurations.filter((row) =>
  row.transition.every((value, index) => value === observedTransition[index])
);
assert.equal(exactVectorLabels.length, 2);
assert.equal(new Set(exactVectorLabels.map((row) => row.transition.join(","))).size, 1);

const supported = configurations.filter((row) => row.supportsAll);
const supportedNumeric = new Map(supported.map((row) => [row.transition.join(","), row]));
assert.equal(supported.length, 6);
assert.equal(supportedNumeric.size, 3);

const address71 = supported.filter((row) => row.supportsAddress71);
const address71Numeric = new Map(address71.map((row) => [row.transition.join(","), row]));
assert.equal(address71.length, 4);
assert.equal(address71Numeric.size, 2);

const expectedCurrentStarts = [146, 57, 132, 71];
const fullSelectorHits = address71.filter((row) =>
  row.receiverStarts.every((starts, index) => starts.includes(expectedCurrentStarts[index]))
);
assert.equal(fullSelectorHits.length, 2);
assert.equal(new Set(fullSelectorHits.map((row) => row.transition.join(","))).size, 1);
assert.deepEqual(fullSelectorHits[0].transition, observedTransition);
assert.deepEqual(fullSelectorHits[0].predictedShell, block3Shell);
assert.deepEqual(fullSelectorHits[0].predictedResidues, block3Residues);

const decoy = [...address71Numeric.values()].find((row) =>
  row.transition.join(",") !== observedTransition.join(",")
);
assert.ok(decoy);
assert.deepEqual(decoy.transition, [24, 17, 14, 0]);
assert.deepEqual(decoy.predictedResidues, [13, 17, 17, 13]);
assert.deepEqual(decoy.receiverStarts, [[71], [75], [17], [13, 71, 216]]);

console.log(JSON.stringify({
  status: "PASS",
  block1: { shell: block1Shell, residues: block1Residues },
  block3: { shell: block3Shell, residues: block3Residues },
  observedTransition,
  literalTransition,
  charge: {
    labeledConfigurations: configurations.length,
    distinctNumericTransitions: numericTransitions.size,
    exactVectorLabels: exactVectorLabels.length,
    allPageSupport: { labeled: supported.length, numeric: supportedNumeric.size },
    p40Address71: { labeled: address71.length, numeric: address71Numeric.size },
    fullIndependentReceiverSelectors: {
      labeled: fullSelectorHits.length,
      numeric: new Set(fullSelectorHits.map((row) => row.transition.join(","))).size,
    },
  },
  decoy: {
    transition: decoy.transition,
    predictedResidues: decoy.predictedResidues,
    receiverStarts: decoy.receiverStarts,
  },
}, null, 2));
