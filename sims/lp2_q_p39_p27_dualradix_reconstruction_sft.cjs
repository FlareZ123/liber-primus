'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const MOD = 29;
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-ink-annotations.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/base60-grid.json'), 'utf8'));
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @param {number} x @returns {number} */
function mod(x) { return ((x % MOD) + MOD) % MOD; }

/** @param {[number,number]} x @param {[number,number]} y @returns {[number,number]} */
function mul(x, y) {
  return [
    mod(x[0] * y[0] + 8 * x[1] * y[1]),
    mod(x[0] * y[1] + x[1] * y[0] + 3 * x[1] * y[1]),
  ];
}

/** @param {[number,number]} x @param {number} n @returns {[number,number]} */
function pow(x, n) {
  /** @type {[number,number]} */ let acc = [1, 0];
  let base = x;
  let exponent = n;
  while (exponent > 0) {
    if (exponent & 1) acc = mul(acc, base);
    base = mul(base, base);
    exponent = Math.floor(exponent / 2);
  }
  return acc;
}

/** @param {number[]} coefficients @returns {[number,number]} */
function evaluate(coefficients) {
  /** @type {[number,number]} */ let acc = [0, 0];
  /** @type {[number,number]} */ let power = [1, 0];
  for (const coefficient of coefficients) {
    acc = [
      mod(acc[0] + coefficient * power[0]),
      mod(acc[1] + coefficient * power[1]),
    ];
    power = mul(power, [0, 1]);
  }
  return acc;
}

function redSpan(page, start, length) {
  const pageRecord = ink.pages.find((item) => item.page === page);
  assert.ok(pageRecord);
  const span = (pageRecord.red_spans || []).find((item) => item.start === start && item.length === length);
  assert.ok(span);
  return {
    pageRecord,
    span,
    values: [...span.runes].map((rune) => {
      const value = runeIndex.get(rune);
      assert.notEqual(value, undefined);
      return value;
    }),
  };
}

// The source field is the physical p3 red119 triad.
const p3 = redSpan(3, 119, 3);
assert.deepEqual(p3.values, [13, 23, 2]);
assert.deepEqual(evaluate(p3.values), [0, 0]);

// Its manuscript homolog is the only other complete red3: same offset119 and
// the same red13 bracket on both sides.
const p39 = redSpan(39, 119, 3);
assert.deepEqual(p39.values, [27, 5, 15]);
const p39Marks = p39.pageRecord.large_punctuation.filter(
  (mark) => mark[1] === 13 && mark[2] === 'red' &&
    (mark[0] === p39.span.start || mark[0] === p39.span.start + p39.span.length),
);
assert.deepEqual(p39Marks, [[119, 13, 'red'], [122, 13, 'red']]);
const red3Spans = [];
for (const pageRecord of ink.pages) {
  for (const span of pageRecord.red_spans || []) {
    if (span.length === 3) red3Spans.push([pageRecord.page, span.start, span.length]);
  }
}
assert.deepEqual(red3Spans, [[3, 119, 3], [39, 119, 3]]);

const p39Residue = evaluate(p39.values);
assert.deepEqual(p39Residue, [2, 21]);

// Reproduce the pre-existing p27 source-selected cell254 receiver.
const p27 = redSpan(27, 0, 19);
assert.deepEqual(p27.pageRecord.large_punctuation, [[19, 13, 'red']]);
const residual = p27.span.length - 13;
assert.equal(residual, 6);
const thirteenthIndex = p27.values[12];
assert.equal(corpus.translit[thirteenthIndex], 'I');
assert.equal(corpus.prime[thirteenthIndex], 31);

const width = grid.rows[0].length;
assert.equal(width, 8);
assert.ok(grid.rows.every((row) => row.length === width));
const cell = corpus.prime[thirteenthIndex] * width + residual;
assert.equal(cell, 254);
const token = grid.rows.flat()[cell];
assert.equal(token, '39');

const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace('f', '');
const tokenValue = (text, alphabet) => alphabet.length * alphabet.indexOf(text[0]) + alphabet.indexOf(text[1]);
const n59 = tokenValue(token, alphabet59);
const n60 = tokenValue(token, alphabet60);
assert.deepEqual([n59, n60], [186, 189]);

const quotient59 = Math.floor(n59 / MOD);
const quotient60 = Math.floor(n60 / MOD);
const radixDelta = n60 - n59;
assert.deepEqual([quotient59, quotient60, radixDelta], [6, 6, 3]);

// This target uses only already-source-visible arithmetic on the selected cell:
// the common base29 quotient and literal difference between its two live radix readings.
const p27Target = [quotient59, radixDelta];
assert.deepEqual(p27Target, [6, 3]);

// The unique nonzero field multiplier sending p39's original red state to the
// p27 source target is target / p39.
const p39Inverse = pow(p39Residue, 839);
assert.deepEqual(mul(p39Residue, p39Inverse), [1, 0]);
const reconstructedQ = mul(p27Target, p39Inverse);
assert.deepEqual(reconstructedQ, [17, 24]);

// Compare with the independently frozen quotient operand from p15-second/p57.
const quotientCoefficients = [5, 5, 14, 9, 10, 4, 27, 17, 25];
const quotientQ = evaluate(quotientCoefficients);
assert.deepEqual(quotientQ, [17, 24]);
assert.deepEqual(reconstructedQ, quotientQ);
assert.deepEqual(mul(quotientQ, p39Residue), p27Target);

// Charge the complete printed-red source class under the independently frozen Q.
// P39 is the only complete red span whose Q output equals this p27 target.
const targetHits = [];
for (const pageRecord of ink.pages) {
  for (const span of pageRecord.red_spans || []) {
    const residue = evaluate([...span.runes].map((rune) => runeIndex.get(rune)));
    const output = mul(quotientQ, residue);
    if (output[0] === p27Target[0] && output[1] === p27Target[1]) {
      targetHits.push([pageRecord.page, span.start, span.length]);
    }
  }
}
assert.deepEqual(targetHits, [[39, 119, 3]]);

// Charge every red13-adjacent complete red span against every other source's
// simple length/dot sum-difference pair. This keeps the older H-style
// observation as a control, not as a premise of the Q reconstruction.
const marked = [];
for (const pageRecord of ink.pages) {
  for (const span of pageRecord.red_spans || []) {
    const touches13 = (pageRecord.large_punctuation || []).some(
      (mark) => mark[1] === 13 && mark[2] === 'red' &&
        (mark[0] === span.start || mark[0] === span.start + span.length),
    );
    if (!touches13) continue;
    const residue = evaluate([...span.runes].map((rune) => runeIndex.get(rune)));
    marked.push({
      page: pageRecord.page,
      start: span.start,
      length: span.length,
      qOutput: mul(quotientQ, residue),
      lengthDotPair: [mod(span.length - 13), mod(span.length + 13)],
    });
  }
}
assert.equal(marked.length, 16);
const crossMatches = [];
for (const source of marked) {
  for (const target of marked) {
    if (
      source.qOutput[0] === target.lengthDotPair[0] &&
      source.qOutput[1] === target.lengthDotPair[1]
    ) {
      crossMatches.push({
        from: [source.page, source.start, source.length],
        to: [target.page, target.start, target.length],
        pair: source.qOutput,
      });
    }
  }
}
assert.deepEqual(crossMatches, [
  {from: [39, 119, 3], to: [27, 0, 19], pair: [6, 3]},
]);

const result = {
  status: 'PASS',
  classification:
    'independent Q reconstruction from p39 red119 state and p27 source-selected dual-radix receiver; exact red13 cross-lock; no plaintext',
  fieldSource: {page: 3, span: [119, 3], coefficients: p3.values},
  homologSource: {page: 39, span: [119, 3], coefficients: p39.values, residue: p39Residue},
  p27Receiver: {
    redLength: p27.span.length,
    redDots: 13,
    residual,
    thirteenthRune: corpus.translit[thirteenthIndex],
    thirteenthRunePrime: corpus.prime[thirteenthIndex],
    cell,
    token,
    base59: n59,
    base60: n60,
    commonBase29Quotient: quotient59,
    radixDelta,
    targetPair: p27Target,
  },
  reconstructedMultiplier: reconstructedQ,
  independentQuotientEvaluation: quotientQ,
  allRedTargetHits: targetHits,
  red13MarkedSpanCount: marked.length,
  red13LengthDotCrossMatches: crossMatches,
  boundary:
    'The p27 pair [6,3] is obtained without H from already selected cell254 as common base29 quotient6 plus literal base60-base59 delta3. Interpreting that pair as a field target is still a new cross-object step; the result independently reconstructs the frozen Q value but does not by itself prove the authors intended field multiplication here.',
};

const json = JSON.stringify(result, null, 2);
console.log(json);
if (process.env.RUNNER_TEMP) {
  fs.writeFileSync(path.join(process.env.RUNNER_TEMP, 'source-test-output.json'), json);
}
