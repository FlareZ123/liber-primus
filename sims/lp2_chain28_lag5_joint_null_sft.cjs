/**
 * Original LP2 first-order no-repeat Markov null versus word-local five-back
 * recurrence. Fully seeded, source-shaped, read-only, Windows Node 22 SFT.
 * Run: node sims/lp2_chain28_lag5_joint_null_sft.cjs
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT,
  'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const text = fs.readFileSync(path.join(ROOT,
  'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const pages = corpus.pages.filter((p) => p.page < 56 && p.indices.length)
  .map((p) => p.indices);
const original = pages.flat();
const wordLengths = text.split('%').slice(0, -2).join('')
  .replace(/\/\s*/g, '').replace(/[.\-&$\r\n]/g, '-')
  .split('-').filter((w) => /[\u16A0-\u16FF]/u.test(w))
  .map((w) => [...w].filter((ch) => /[\u16A0-\u16FF]/u.test(ch)).length);
assert.equal(original.length, 12956);
assert.equal(wordLengths.length, 2896);
assert.equal(wordLengths.reduce((a, b) => a + b, 0), original.length);
assert.equal(wordLengths.reduce((a, b) => a + Math.max(0, b - 5), 0), 2105);

function makeRng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/**
 * Simulate original page shapes with fixed original first symbol per page.
 * Diagonal mass is the observed pooled original adjacent-doublet probability.
 * Off-diagonal transitions are uniformly drawn from the other 28 GP runes.
 * @param {() => number} random
 * @param {number} pRepeat
 */
function simulation(random, pRepeat) {
  const output = [];
  for (const page of pages) {
    let prev = page[0];
    output.push(prev);
    for (let i = 1; i < page.length; i++) {
      let next;
      if (random() < pRepeat) next = prev;
      else {
        const step = Math.floor(random() * 28);
        next = step >= prev ? step + 1 : step;
      }
      output.push(next);
      prev = next;
    }
  }
  return output;
}

/** @param {number[]} tape */
function lag5(tape) {
  let offset = 0;
  let equal5 = 0;
  let adjacentEqual5 = 0;
  for (const length of wordLengths) {
    for (let i = 5; i < length; i++) {
      const hit = tape[offset + i] === tape[offset + i - 5];
      if (hit) {
        equal5++;
        if (i + 1 < length &&
          tape[offset + i + 1] === tape[offset + i - 4]) adjacentEqual5++;
      }
    }
    offset += length;
  }
  return [equal5, adjacentEqual5];
}

/** @param {number[]} tape */
function transitions(tape) {
  const table = Array.from({ length: 29 }, () => Array(29).fill(0));
  const rowTotals = Array(29).fill(0);
  let position = 0;
  for (const page of pages) {
    for (let i = 1; i < page.length; i++) {
      const a = tape[position + i - 1];
      const b = tape[position + i];
      table[a][b]++;
      rowTotals[a]++;
    }
    position += page.length;
  }
  return { table, rowTotals };
}

/** @param {number[]} tape @param {number} pRepeat */
function firstOrder(tape, pRepeat) {
  const { table, rowTotals } = transitions(tape);
  let offDiagonalChi2 = 0;
  let diagonalChi2 = 0;
  let doublets = 0;
  for (let i = 0; i < 29; i++) {
    const row = rowTotals[i];
    const expectedOffDiagonal = (row - table[i][i]) / 28;
    const expectedDiagonal = row * pRepeat;
    doublets += table[i][i];
    diagonalChi2 += (table[i][i] - expectedDiagonal) ** 2 /
      expectedDiagonal;
    for (let j = 0; j < 29; j++) {
      if (j === i) continue;
      offDiagonalChi2 +=
        (table[i][j] - expectedOffDiagonal) ** 2 / expectedOffDiagonal;
    }
  }
  return { doublets, offDiagonalChi2, diagonalChi2 };
}

const originalFirst = firstOrder(original, 86 / 12901);
const originalLag5 = lag5(original);
assert.equal(originalFirst.doublets, 86);
assert.ok(Math.abs(originalFirst.offDiagonalChi2 - 813.921590265191) < 1e-8);
assert.ok(Math.abs(originalFirst.diagonalChi2 - 26.64447651755661) < 1e-8);
assert.deepEqual(originalLag5, [104, 9]);
console.log('Original ciphertext:', {
  runes: original.length, words: wordLengths.length, originalFirst,
  originalLag5, withinWordLag5Opportunities: 2105
});

const pRepeat = originalFirst.doublets / pages
  .reduce((sum, page) => sum + page.length - 1, 0);
assert.equal(pRepeat, 86 / 12901);

let offDiagonalGreaterOrEqual = 0;
let diagonalGreaterOrEqual = 0;
let offDiagonalSum = 0;
let diagonalSum = 0;
const firstRandom = makeRng(20261115);
for (let replicate = 0; replicate < 2000; replicate++) {
  const sim = firstOrder(simulation(firstRandom, pRepeat), pRepeat);
  offDiagonalSum += sim.offDiagonalChi2;
  diagonalSum += sim.diagonalChi2;
  offDiagonalGreaterOrEqual += Number(
    sim.offDiagonalChi2 >= originalFirst.offDiagonalChi2);
  diagonalGreaterOrEqual += Number(
    sim.diagonalChi2 >= originalFirst.diagonalChi2);
}
assert.equal(offDiagonalGreaterOrEqual, 446);
assert.equal(diagonalGreaterOrEqual, 1116);
console.log('First-order conditional 28-choice Markov null:', {
  replicates: 2000, offDiagonalMean: offDiagonalSum / 2000,
  offDiagonalGreaterOrEqual, diagonalMean: diagonalSum / 2000,
  diagonalGreaterOrEqual
});

let lag5GreaterOrEqual = 0;
let pairGreaterOrEqual = 0;
let jointGreaterOrEqual = 0;
let lag5Sum = 0;
let pairSum = 0;
const lagRandom = makeRng(20261115);
for (let replicate = 0; replicate < 4000; replicate++) {
  const [five, pair] = lag5(simulation(lagRandom, pRepeat));
  lag5Sum += five;
  pairSum += pair;
  if (five >= originalLag5[0]) lag5GreaterOrEqual++;
  if (pair >= originalLag5[1]) pairGreaterOrEqual++;
  if (five >= originalLag5[0] && pair >= originalLag5[1])
    jointGreaterOrEqual++;
}
assert.equal(lag5GreaterOrEqual, 0);
assert.equal(pairGreaterOrEqual, 1);
assert.equal(jointGreaterOrEqual, 0);
assert.equal(lag5Sum / 4000, 72.6085);
assert.equal(pairSum / 4000, 1.6225);
console.log('Word-local 5-back / two-hit Markov null:', {
  replicates: 4000, lag5Mean: lag5Sum / 4000,
  pairMean: pairSum / 4000,
  lag5GreaterOrEqual, pairGreaterOrEqual, jointGreaterOrEqual
});

// More generous in-sample maximum-likelihood stationary first-order chain:
// preserve the exact authentic 29x29 successor frequencies, including every
// observed rare self-loop, rather than enforcing a flat 28-choice successor.
// This conditions on all original first-order evidence in the entire book.
const fitted = transitions(original);
const cumulative = Array.from({ length: 29 }, () => Array(29).fill(0));
for (let i = 0; i < 29; i++) {
  let total = 0;
  for (let j = 0; j < 29; j++) {
    total += fitted.table[i][j];
    cumulative[i][j] = total;
  }
  assert.equal(total, fitted.rowTotals[i]);
}
const mLE = makeRng(20261115);
function fittedSimulation() {
  const generated = [];
  for (const page of pages) {
    let predecessor = page[0];
    generated.push(predecessor);
    for (let i = 1; i < page.length; i++) {
      const draw = Math.floor(mLE() * fitted.rowTotals[predecessor]);
      let successor = 0;
      while (cumulative[predecessor][successor] <= draw) successor++;
      generated.push(successor);
      predecessor = successor;
    }
  }
  return generated;
}
let fittedFiveSum = 0;
let fittedPairSum = 0;
let fittedFiveGE = 0;
let fittedPairGE = 0;
let fittedJointGE = 0;
let fittedMaximumFive = 0;
for (let replicate = 0; replicate < 4000; replicate++) {
  const [five, pair] = lag5(fittedSimulation());
  fittedFiveSum += five;
  fittedPairSum += pair;
  fittedMaximumFive = Math.max(fittedMaximumFive, five);
  fittedFiveGE += Number(five >= originalLag5[0]);
  fittedPairGE += Number(pair >= originalLag5[1]);
  fittedJointGE += Number(
    five >= originalLag5[0] && pair >= originalLag5[1]);
}
assert.equal(fittedFiveSum / 4000, 72.69425);
assert.equal(fittedPairSum / 4000, 1.6785);
assert.equal(fittedMaximumFive, 102);
assert.equal(fittedFiveGE, 0);
assert.equal(fittedPairGE, 0);
assert.equal(fittedJointGE, 0);
console.log('Maximum-likelihood 29x29 in-sample fitted Markov null:', {
  replicates: 4000,
  lag5Mean: fittedFiveSum / 4000,
  pairMean: fittedPairSum / 4000,
  lag5GE: fittedFiveGE,
  pairGE: fittedPairGE,
  jointGE: fittedJointGE,
  maximumLag5: fittedMaximumFive
});
console.log('PASS: neither a uniform 28-other-symbol walk nor the fitted full 29x29 stationary Markov chain explains the word-local fifth-apart repeats.');
