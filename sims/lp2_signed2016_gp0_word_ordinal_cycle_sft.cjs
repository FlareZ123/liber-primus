"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const values = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      values.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      values.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find((row) =>
      normalized.startsWith(row.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling " + word);
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

/** @param {string} word @returns {number} */
function gp0(word) {
  return gp(word).reduce((sum, value) => sum + value, 0);
}

const clear = signed.split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/).slice(1).join("\n");
const words = clear.split(/[^A-Za-z0-9]+/)
  .filter((token) => /^[A-Za-z]+$/.test(token))
  .map((word) => word.toUpperCase());
const sums = words.map(gp0);
assert.equal(words.length, 43);

const nextHits = [];
const previousHits = [];
for (let index = 0; index < words.length; index += 1) {
  if (index + 1 < words.length && sums[index] === index + 1) {
    nextHits.push([index, words[index], index + 1, words[index + 1]]);
  }
  if (index > 0 && sums[index] === index - 1) {
    previousHits.push([index, words[index], index - 1, words[index - 1]]);
  }
}
assert.deepEqual(nextHits, [
  [34, "BE", 35, "FOUND"],
  [35, "FOUND", 36, "GOOD"],
]);
assert.deepEqual(previousHits, [
  [36, "GOOD", 35, "FOUND"],
]);

/**
 * @param {number[]} values
 * @param {boolean} oneBased
 * @returns {number[][]}
 */
function mutualCycles(values, oneBased) {
  const cycles = [];
  for (let index = 0; index < values.length; index += 1) {
    const target = values[index] - (oneBased ? 1 : 0);
    if (target <= index || target >= values.length) continue;
    if (values[target] - (oneBased ? 1 : 0) === index) {
      cycles.push([index, target]);
    }
  }
  return cycles;
}

assert.deepEqual(mutualCycles(sums, false), [[35, 36]]);
assert.deepEqual(mutualCycles(sums, true), []);

const oneBasedNext = [];
const oneBasedPrevious = [];
for (let index = 0; index < words.length; index += 1) {
  if (index + 1 < words.length && sums[index] === index + 2) {
    oneBasedNext.push(index);
  }
  if (index > 0 && sums[index] === index) {
    oneBasedPrevious.push(index);
  }
}
assert.deepEqual(oneBasedNext, []);
assert.deepEqual(oneBasedPrevious, []);

const rotationHits = [];
for (let shift = 0; shift < sums.length; shift += 1) {
  const rotated = sums.slice(shift).concat(sums.slice(0, shift));
  const cycles = mutualCycles(rotated, false);
  if (cycles.length) rotationHits.push({ shift, cycles });
}
assert.deepEqual(rotationHits, [{ shift:0, cycles:[[35,36]] }]);

let solvedWindows = 0;
let solvedWithCycle = 0;
let solvedWithAdjacentCycle = 0;
let solvedWithForwardRun2 = 0;
let solvedWithForwardRun3 = 0;

for (const section of solved.sections) {
  const runeWords = section.source_text.match(/[\u16A0-\u16FF]+/gu) || [];
  const sectionSums = runeWords.map((raw) =>
    [...raw].reduce((sum, rune) => sum + runeIndex.get(rune), 0)
  );

  for (let start = 0; start + 43 <= sectionSums.length; start += 1) {
    solvedWindows += 1;
    const window = sectionSums.slice(start, start + 43);
    const cycles = mutualCycles(window, false);
    if (cycles.length) solvedWithCycle += 1;
    if (cycles.some(([left, right]) => right === left + 1)) {
      solvedWithAdjacentCycle += 1;
    }

    let run = 0;
    let maxRun = 0;
    for (let index = 0; index < 42; index += 1) {
      if (window[index] === index + 1) {
        run += 1;
        maxRun = Math.max(maxRun, run);
      } else {
        run = 0;
      }
    }
    if (maxRun >= 2) solvedWithForwardRun2 += 1;
    if (maxRun >= 3) solvedWithForwardRun3 += 1;
  }
}

assert.equal(solvedWindows, 436);
assert.equal(solvedWithCycle, 60);
assert.equal(solvedWithAdjacentCycle, 8);
assert.equal(solvedWithForwardRun2, 3);
assert.equal(solvedWithForwardRun3, 0);

console.log(JSON.stringify({
  status: "PASS",
  classification:
    "source-internal selector: zero-based GP0/index mapping has the sole cycle FOUND<->GOOD and the sole consecutive forward-pointer run BE->FOUND->GOOD; one-based numbering is null; solved-native controls make the exact run uncommon but not unique enough for authorship probability",
  nextHits,
  previousHits,
  cycles: mutualCycles(sums, false),
  oneBased: {
    cycles: mutualCycles(sums, true),
    nextHits: oneBasedNext,
    previousHits: oneBasedPrevious,
  },
  rotations: rotationHits,
  solved: {
    windows: solvedWindows,
    withCycle: solvedWithCycle,
    withAdjacentCycle: solvedWithAdjacentCycle,
    withForwardRun2: solvedWithForwardRun2,
    withForwardRun3: solvedWithForwardRun3,
  },
}, null, 2));
