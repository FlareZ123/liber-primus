#!/usr/bin/env node
"use strict";

// Reproducible p0–2 156-word pointer-graph test.
// Run from repository root:
//   node sims/lp2_13x12_wordmap_23cycle_source_gate.cjs
// Optional: --skip-null or --iterations=N

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { parseLP2Words } = require("./lp2_word_pages.cjs");

const ROOT = path.resolve(__dirname, "..");
const readText = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const readJson = (p) => JSON.parse(readText(p));

const raw = readText("resources/lp2-transcription.txt");
const corpus = readJson("resources/liber-primus/lp2-corpus.json");
const p50 = readJson("resources/liber-primus/lp2-grid-256.json");
const { words } = parseLP2Words(raw, 3);
const heading = words.slice(0, 2);
const body = words.slice(2);
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));

function primeSum(word) {
  let total = 0;
  for (const rune of word.runes) {
    const i = runeIndex.get(rune);
    assert.notEqual(i, undefined, `unknown rune ${rune}`);
    total += corpus.prime[i];
  }
  return total;
}

const headingSums = heading.map(primeSum);
const sums = body.map(primeSum);
const n = body.length;
const pointer = sums.map((s) => s % n);
const seeds = headingSums.map((s) => s % n);

function traceToCycle(start, next) {
  const seen = new Map();
  const path = [];
  let at = start;
  while (!seen.has(at)) {
    seen.set(at, path.length);
    path.push(at);
    at = next[at];
  }
  const split = seen.get(at);
  return {
    path,
    transient: path.slice(0, split),
    cycle: path.slice(split),
  };
}

function collectCycles(next) {
  const done = new Set();
  const cycles = [];
  for (let start = 0; start < next.length; start++) {
    if (done.has(start)) continue;
    const seen = new Map();
    const path = [];
    let at = start;
    while (!done.has(at) && !seen.has(at)) {
      seen.set(at, path.length);
      path.push(at);
      at = next[at];
    }
    if (seen.has(at)) cycles.push(path.slice(seen.get(at)));
    for (const x of path) done.add(x);
  }
  return cycles;
}

const firstTrace = traceToCycle(seeds[0], pointer);
const secondTrace = traceToCycle(seeds[1], pointer);
const cycles = collectCycles(pointer);
const cycle = firstTrace.cycle;
const cycleSet = new Set(cycle);
const targetPositions = [563, 569].map((target) => ({
  sum: target,
  cells: sums.map((s, i) => s === target ? i + 1 : null).filter(Boolean),
  cycleCells: sums.map((s, i) => s === target && cycleSet.has(i) ? i + 1 : null).filter(Boolean),
}));

assert.equal(words.length, 158);
assert.equal(body.length, 156);
assert.equal(words.reduce((s, w) => s + w.length, 0), 729);
assert.equal(heading.reduce((s, w) => s + w.length, 0), 13);
assert.deepEqual(headingSums, [347, 315]);
assert.deepEqual(seeds, [35, 3]);
assert.deepEqual(cycles.map((c) => c.length).sort((a, b) => a - b), [2, 23]);
assert.equal(firstTrace.transient.length, 3);
assert.deepEqual(firstTrace.transient.map((i) => i + 1), [36, 56, 113]);
assert.equal(cycle.length, 23);
assert.deepEqual(targetPositions, [
  { sum: 563, cells: [4], cycleCells: [4] },
  { sum: 569, cells: [89], cycleCells: [89] },
]);
assert.equal(secondTrace.transient.length, 0);
assert.equal(new Set(cycle).size, 23);

const p32 = corpus.pages.find((p) => p.page === 32).indices;
assert.equal(p32.length, 121);
const p32Prime = p32.map((i) => corpus.prime[i]);
const p32TopRowSum = p32Prime.slice(0, 11).reduce((a, b) => a + b, 0);
const p32FirstColumnSum = p32Prime.filter((_, i) => i % 11 === 0).reduce((a, b) => a + b, 0);
assert.equal(p32TopRowSum, 563);
assert.equal(p32FirstColumnSum, 569);
const p32Modulo121 = [563, 569].map((value) => {
  const index0 = value % 121;
  return {
    value,
    index0,
    cell1: index0 + 1,
    rune: corpus.translit[p32[index0]],
  };
});
assert.deepEqual(p32Modulo121.map((x) => x.rune), ["H", "S"]);

const cycleTable = cycle.map((i, k) => ({
  step: k + 1,
  bodyWordCell1: i + 1,
  primeSum: sums[i],
}));

// Exploratory only: modulo-256 lookup and byte compass interpretation are
// not established by the core pointer-graph result.
const directions = [
  [-1, 0], [-1, 1], [0, 1], [1, 1],
  [1, 0], [1, -1], [0, -1], [-1, -1],
];
const directionNames = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
function compassRoute(cycleCells, wordSums) {
  let row = 3;
  let col = 0; // zero-based p32 index 33, the H in the H-O-M-E-X run
  const steps = [];
  for (let k = 0; k < cycleCells.length; k++) {
    const bodyIndex = cycleCells[k];
    const sum = wordSums[bodyIndex];
    const address = sum % 256;
    const byte = p50.bytes[address];
    const direction = byte & 7;
    const distance = byte >> 3;
    const [dr, dc] = directions[direction];
    row = ((row + dr * distance) % 11 + 11) % 11;
    col = ((col + dc * distance) % 11 + 11) % 11;
    const p32Index0 = row * 11 + col;
    steps.push({
      step: k + 1,
      bodyWordCell1: bodyIndex + 1,
      primeSum: sum,
      p50Address0: address,
      p50Byte: byte,
      direction: directionNames[direction],
      distance,
      p32Index0,
      p32Rune: corpus.translit[p32[p32Index0]],
    });
  }
  return steps;
}
const exploratoryCompass = compassRoute(cycle, sums);
const secondHeadingCompass = compassRoute(secondTrace.cycle, sums);
const fullCycleDisplacement = cycle.reduce(([totalRow, totalCol], bodyIndex) => {
  const value = p50.bytes[sums[bodyIndex] % 256];
  const [dr, dc] = directions[value & 7];
  const distance = value >> 3;
  return [totalRow + dr * distance, totalCol + dc * distance];
}, [0, 0]);
assert.deepEqual(fullCycleDisplacement, [-85, 14]);
assert.equal(exploratoryCompass[11].p32Rune, "X");
assert.equal(secondHeadingCompass[11].p32Rune, "U");
assert.equal(exploratoryCompass.at(-1).p32Index0, 69);
assert.equal(secondHeadingCompass.at(-1).p32Index0, 69);
assert.equal(exploratoryCompass.at(-1).p32Rune, "IA");
assert.equal(secondHeadingCompass.at(-1).p32Rune, "IA");
const p32XIndices0 = p32
  .map((value, i) => corpus.translit[value] === "X" ? i : null)
  .filter((i) => i !== null);
const actualMidpointX = corpus.translit[p32[exploratoryCompass[11].p32Index0]] === "X";

function makeRng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}
function shuffle(values, random) {
  const out = values.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const groupIndices = [0, 1, 2].map((page) =>
  body.map((word, i) => word.startPage === page ? i : -1).filter((i) => i >= 0)
);
const iterationsArg = process.argv.find((arg) => arg.startsWith("--iterations="));
const iterations = iterationsArg ? Number(iterationsArg.split("=")[1]) : 1_000_000;
let nullResult = null;

if (!process.argv.includes("--skip-null")) {
  const random = makeRng(0x51f15e);
  let shared23AndTargets = 0;
  let midpointXAmongGate = 0;

  for (let trial = 0; trial < iterations; trial++) {
    const shuffled = sums.slice();
    for (const group of groupIndices) {
      const values = shuffle(group.map((i) => shuffled[i]), random);
      group.forEach((i, j) => { shuffled[i] = values[j]; });
    }

    const next = shuffled.map((s) => s % n);
    const a = traceToCycle(seeds[0], next).cycle;
    const b = traceToCycle(seeds[1], next).cycle;
    if (a.length !== 23 || b.length !== 23) continue;
    const setA = new Set(a);
    if (b.length !== setA.size || !b.every((i) => setA.has(i))) continue;
    if (!a.some((i) => shuffled[i] === 563) || !a.some((i) => shuffled[i] === 569)) continue;

    shared23AndTargets++;
    const route = compassRoute(a, shuffled);
    if (corpus.translit[p32[route[11].p32Index0]] === "X") midpointXAmongGate++;
  }

  nullResult = {
    iterations,
    pageGroupSizes: groupIndices.map((g) => g.length),
    shared23CycleContainingBothTargets: shared23AndTargets,
    frequency: shared23AndTargets / iterations,
    midpointXAmongThose: midpointXAmongGate,
  };
}

const output = {
  parser: "sims/lp2_word_pages.cjs::parseLP2Words(raw, 3)",
  totalWords: words.length,
  totalRunes: words.reduce((s, w) => s + w.length, 0),
  redHeadingRuneCount: heading.reduce((s, w) => s + w.length, 0),
  bodyWords: body.length,
  bodyMapDimensions: "13 x 12 (orientation not used by flat pointer test)",
  heading: heading.map((w, i) => ({
    word: w.runes,
    primeSum: headingSums[i],
    seedIndex0: seeds[i],
    seedCell1: seeds[i] + 1,
  })),
  firstSeedTransientCells1: firstTrace.transient.map((i) => i + 1),
  secondSeedTransientCells1: secondTrace.transient.map((i) => i + 1),
  cycleLengths: cycles.map((c) => c.length).sort((a, b) => b - a),
  unique23Cycle: cycleTable,
  targetPositions,
  p32: {
    runeCount: p32.length,
    topRowPrimeSum: p32TopRowSum,
    firstColumnPrimeSum: p32FirstColumnSum,
    modulo121Lookups: p32Modulo121,
    xIndices0: p32XIndices0,
  },
  exploratoryModulo256Compass: {
    convention: "address = wordPrimeSum % 256; direction = byte & 7; distance = byte >> 3; 11x11 toroidal walk",
    startP32Index0: 33,
    midpointStep: 12,
    midpointStepRecord: exploratoryCompass[11],
    midpointIsX: actualMidpointX,
    steps: exploratoryCompass,
    secondRedHeadingCycleStep1: secondTrace.cycle[0] + 1,
    secondRedHeadingMidpoint: secondHeadingCompass[11],
    secondRedHeadingSteps: secondHeadingCompass,
    allStepsNetDisplacement: fullCycleDisplacement,
    allStepsNetDisplacementMod11: fullCycleDisplacement.map((x) => ((x % 11) + 11) % 11),
    bothRedHeadingCyclesFinishAtSameCell0: 69,
    sameTerminalIsPermutationInvariant: true,
    qualification: "The equal terminal is a tautology of commutative toroidal vectors, not independent evidence. Neither compass split nor wrap is source selected.",
  },
  pageStratifiedPermutationDiagnostic: nullResult,
};

console.log(JSON.stringify(output, null, 2));
