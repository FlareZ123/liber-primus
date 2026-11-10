'use strict';

/**
 * Held-out inference of the rune-dependent width of the printed LP2 lines.
 *
 * A greedy visual line break immediately after token t predicts
 * sum(width(token[0..t])) <= W < sum(width(token[0..t+1])).
 *
 * Infer 29 rune widths, two visible separators and W using ONLY the early
 * (or late) physical-page line breaks. Freeze the learned widths and predict
 * the other half. This is a typesetting model, not a ciphertext decryption.
 * The permutation null shuffles rune values inside physical pages while
 * leaving all printed line lengths, punctuation slots and rune counts fixed.
 *
 * Node 22+ / CommonJS / no third-party dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const GP = [...'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'];
const IDS = new Map(GP.map((value, i) => [value, i]));
const PUNC = new Map([['-', 29], ['.', 30]]);
const N = 31;
const DEFAULT_SEED = 0x47a1f34b;

/** @param {string} source */
function parsePages(source) {
  const records = source.split('%').slice(0, 55);
  assert.equal(records.length, 55);
  const pages = records.map((record, i) => {
    const lines = record.split('/').map(text => [...text.trim()].map(char =>
      IDS.has(char) ? IDS.get(char) : (PUNC.get(char) ?? -1)
    ).filter(x => x >= 0)).filter(line => line.length > 0);
    return { page: i < 50 ? i : i + 1, lines };
  });
  const total = pages.reduce((n, page) => n + page.lines.reduce(
    (acc, line) => acc + line.filter(x => x < 29).length, 0
  ), 0);
  assert.equal(total, 12956);
  assert.equal(pages.length, 55);
  return pages;
}

/** @param {{page:number,lines:number[][]}[]} pages */
function rowsFor(pages) {
  const rows = [];
  for (const page of pages) {
    for (let i = 0; i + 1 < page.lines.length; i++) {
      const line = page.lines[i];
      const nextLine = page.lines[i + 1];
      if (line.filter(v => v < 29).length < 18 ||
          nextLine.filter(v => v < 29).length < 18) continue;
      const counts = Array(N).fill(0);
      for (const rune of line) counts[rune]++;
      rows.push({
        page: page.page, counts, next: nextLine[0],
        line, lookahead: nextLine, cut: line.length
      });
    }
  }
  return rows;
}

/**
 * Independent xorshift generator.
 * @param {number} seed Nonzero 32-bit seed
 */
function makeRandom(seed) {
  let state = seed >>> 0;
  assert.notEqual(state, 0);
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/**
 * Fit the one-step greedy-wrap inequalities with squared hinge loss.
 * A prior keeps the scale nondegenerate. Rune widths are relative units.
 * @param {ReturnType<typeof rowsFor>} rows
 * @param {number} [iterations]
 * @param {number} [regularization]
 */
function fit(rows, iterations = 2500, regularization = 0.005) {
  const original = [...Array(29).fill(1), 0.35, 0.35];
  const weights = original.slice();
  const firstMoment = Array(N + 1).fill(0);
  const secondMoment = Array(N + 1).fill(0);
  const gradients = Array(N + 1).fill(0);
  let boundary = 24.8;
  for (let step = 1; step <= iterations; step++) {
    gradients.fill(0);
    for (const item of rows) {
      let length = 0;
      for (let j = 0; j < N; j++) length += item.counts[j] * weights[j];
      const remaining = boundary - length;
      let error = 0;
      let sign = 0;
      if (remaining < 0) {
        error = -remaining;
        sign = 1;
      } else if (remaining > weights[item.next]) {
        error = remaining - weights[item.next];
        sign = -1;
      } else continue;
      for (let j = 0; j < N; j++) {
        gradients[j] += 2 * error * sign * item.counts[j];
      }
      if (sign < 0) gradients[item.next] -= 2 * error;
      gradients[N] -= 2 * error * sign;
    }
    for (let j = 0; j < N; j++) {
      gradients[j] += 2 * regularization *
        (weights[j] - original[j]) * rows.length;
    }
    let mean = 0;
    for (let j = 0; j < 29; j++) mean += weights[j] / 29;
    for (let j = 0; j < 29; j++) {
      gradients[j] += rows.length * 6 * (mean - 1) / 29;
    }
    for (let j = 0; j <= N; j++) {
      const gradient = gradients[j] / rows.length;
      firstMoment[j] = 0.9 * firstMoment[j] + 0.1 * gradient;
      secondMoment[j] = 0.999 * secondMoment[j] +
        0.001 * gradient * gradient;
      const normalized = 0.035 *
        (firstMoment[j] / (1 - Math.pow(0.9, step))) /
        (Math.sqrt(secondMoment[j] / (1 - Math.pow(0.999, step))) + 1e-7);
      if (j === N) boundary -= normalized;
      else weights[j] = Math.max(j >= 29 ? 0.05 : 0.25,
        Math.min(2, weights[j] - normalized));
    }
  }
  return { boundary, weights };
}

/**
 * @param {ReturnType<typeof rowsFor>} rows
 * @param {{boundary:number,weights:number[]}} model
 */
function score(rows, model) {
  let valid = 0, withinOne = 0, withinTwo = 0, exactBreak = 0;
  let violation = 0, absoluteBreakError = 0;
  let firstWidth = 0, starts = 0;
  for (const item of rows) {
    let width = 0;
    for (let j = 0; j < N; j++) width += item.counts[j] * model.weights[j];
    const gap = model.boundary - width;
    const error = Math.max(0, -gap, gap - model.weights[item.next]);
    violation += error;
    valid += Number(error < 1e-8);
    if (item.next < 29) {
      firstWidth += model.weights[item.next];
      starts++;
    }
    const run = item.line.concat(item.lookahead);
    let consumed = 0, index = 0;
    while (index < run.length &&
           consumed + model.weights[run[index]] <= model.boundary) {
      consumed += model.weights[run[index++]];
    }
    const deviation = Math.abs(index - item.cut);
    absoluteBreakError += deviation;
    exactBreak += Number(deviation === 0);
    withinOne += Number(deviation <= 1);
    withinTwo += Number(deviation <= 2);
  }
  return {
    rows: rows.length, valid,
    validRate: valid / rows.length,
    meanViolation: violation / rows.length,
    exactBreakRate: exactBreak / rows.length,
    withinOne: withinOne / rows.length,
    withinTwo: withinTwo / rows.length,
    meanAbsoluteBreakError: absoluteBreakError / rows.length,
    meanFirstRuneWidth: firstWidth / starts,
    runeStarts: starts
  };
}

/**
 * Optimize the only free scalar of a fixed, equal-width-runes baseline.
 * @param {ReturnType<typeof rowsFor>} training
 */
function equalWidthBaseline(training) {
  const weights = [...Array(29).fill(1), 0.35, 0.35];
  let best = null;
  for (let i = 1800; i <= 2900; i++) {
    const boundary = i / 100;
    const s = score(training, {boundary, weights});
    if (best === null || s.meanViolation < best.loss) {
      best = {boundary, loss: s.meanViolation};
    }
  }
  return {weights, boundary: best.boundary};
}

/**
 * Preserve every original physical-page rune inventory and every exact line
 * and punctuation position, while scrambling only rune identities.
 * @param {{page:number,lines:number[][]}[]} pages
 * @param {()=>number} random
 */
function shuffleRuneLabels(pages, random) {
  return pages.map(page => {
    const symbols = page.lines.flat().filter(x => x < 29);
    for (let j = symbols.length - 1; j > 0; j--) {
      const k = random() % (j + 1);
      [symbols[j], symbols[k]] = [symbols[k], symbols[j]];
    }
    let cursor = 0;
    const lines = page.lines.map(line =>
      line.map(v => v < 29 ? symbols[cursor++] : v));
    assert.equal(cursor, symbols.length);
    return {page: page.page, lines};
  });
}

/** @param {number[]} sample @param {number} observed @param {'less'|'more'} tail */
function summarizeNull(sample, observed, tail) {
  const mean = sample.reduce((a, b) => a + b, 0) / sample.length;
  const exceeds = sample.filter(x =>
    tail === 'less' ? x <= observed : x >= observed).length;
  return {
    mean, min: Math.min(...sample), max: Math.max(...sample),
    exceed: exceeds, trials: sample.length,
    empiricalP: (exceeds + 1) / (sample.length + 1)
  };
}

/**
 * @param {{page:number,lines:number[][]}[]} target
 * @param {{boundary:number,weights:number[]}} model
 * @param {number} trials
 * @param {number} seed
 */
function nullChallenge(target, model, trials, seed) {
  const observed = score(rowsFor(target), model);
  const random = makeRandom(seed);
  const errors = [], break1 = [], firstWidths = [];
  for (let i = 0; i < trials; i++) {
    const shuffled = shuffleRuneLabels(target, random);
    const s = score(rowsFor(shuffled), model);
    errors.push(s.meanViolation);
    break1.push(s.withinOne);
    firstWidths.push(s.meanFirstRuneWidth);
  }
  return {
    observed,
    meanViolation: summarizeNull(errors, observed.meanViolation, 'less'),
    withinOne: summarizeNull(break1, observed.withinOne, 'more'),
    firstRuneWidth: summarizeNull(
      firstWidths, observed.meanFirstRuneWidth, 'more'
    )
  };
}

function main(trials = 1000) {
  const source = fs.readFileSync(path.join(ROOT,'resources',
    'lp2-transcription.txt'),'utf8');
  const pages = parsePages(source);
  const firstPages = pages.filter(p => p.page < 26);
  const lastPages = pages.filter(p => p.page >= 26);
  const trainingFirst = rowsFor(firstPages);
  const trainingLast = rowsFor(lastPages);
  assert.equal(trainingFirst.length, 245);
  assert.equal(trainingLast.length, 256);
  const forward = fit(trainingFirst);
  const backward = fit(trainingLast);
  const baselineForward = equalWidthBaseline(trainingFirst);
  const baselineBackward = equalWidthBaseline(trainingLast);
  const a = nullChallenge(lastPages, forward, trials, DEFAULT_SEED);
  const b = nullChallenge(firstPages, backward, trials,
    DEFAULT_SEED ^ 0x92538253);
  const weights1 = forward.weights.slice(0,29);
  const weights2 = backward.weights.slice(0,29);
  const m1 = weights1.reduce((x,y) => x+y, 0) / 29;
  const m2 = weights2.reduce((x,y) => x+y, 0) / 29;
  let cov = 0, var1 = 0, var2 = 0;
  for (let i = 0; i < 29; i++) {
    cov += (weights1[i]-m1)*(weights2[i]-m2);
    var1 += (weights1[i]-m1)**2;
    var2 += (weights2[i]-m2)**2;
  }
  return {
    source: 'resources/lp2-transcription.txt',
    pageCount: pages.length,
    rows: trainingFirst.length + trainingLast.length,
    definition: 'A line ends when the next glyph would exceed the fixed glyph-width budget. Lower mean violation is better.',
    configuration: {steps:2500, regularization:0.005,
      minimumRunesPerLine:18, seed:DEFAULT_SEED, nullTrials:trials},
    forward: {trainPages:'0–25', testPages:'26–55 excluding rune-free 50',
      cutoff:forward.boundary, glyphWidths:forward.weights,
      baseline:score(trainingLast,baselineForward), ...a},
    backward: {trainPages:'26–55 excluding rune-free 50',
      testPages:'0–25',cutoff:backward.boundary,
      glyphWidths:backward.weights, baseline:score(trainingFirst,baselineBackward),...b},
    crossFitGlyphWidthPearson:cov/Math.sqrt(var1*var2),
    caveats:'This recovers only a predictive visual line-break model. Printed source glyph widths are not directly measured and the model is not an LP2 cipher or plaintext recovery.'
  };
}

if (require.main === module) {
  const trials = Number(process.argv[2] || 1000);
  assert(Number.isInteger(trials) && trials >= 50);
  process.stdout.write(JSON.stringify(main(trials), null, 2) + '\n');
}
module.exports = {parsePages, rowsFor, fit, score, equalWidthBaseline,
  shuffleRuneLabels, nullChallenge, main};
