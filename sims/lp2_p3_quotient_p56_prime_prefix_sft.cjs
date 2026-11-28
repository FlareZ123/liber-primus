'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const MOD = 29;
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-ink-annotations.json'), 'utf8'));
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @param {number} x @returns {number} */
function mod(x) {
  return ((x % MOD) + MOD) % MOD;
}

/** @param {number} x @returns {number} */
function inv(x) {
  for (let i = 1; i < MOD; i += 1) {
    if (mod(x * i) === 1) return i;
  }
  throw new Error('no inverse for ' + x);
}

/** @param {[number, number]} x @param {[number, number]} y @param {number} r @param {number} t @returns {[number, number]} */
function fieldMul(x, y, r = 3, t = 8) {
  const [a, b] = x;
  const [c, d] = y;
  return [mod(a * c + t * b * d), mod(a * d + b * c + r * b * d)];
}

/** @param {number[]} coefficients @param {number} r @param {number} t @returns {[number, number]} */
function fieldEval(coefficients, r = 3, t = 8) {
  /** @type {[number, number]} */
  let acc = [0, 0];
  /** @type {[number, number]} */
  let power = [1, 0];
  for (const coefficient of coefficients) {
    acc = [mod(acc[0] + coefficient * power[0]), mod(acc[1] + coefficient * power[1])];
    power = fieldMul(power, [0, 1], r, t);
  }
  return acc;
}

/** @param {number[]} numerator @param {number[]} denominator @returns {{quotient:number[], remainder:number[]}} */
function polynomialDivide(numerator, denominator) {
  const a = numerator.map(mod);
  const quotient = Array(Math.max(0, a.length - denominator.length + 1)).fill(0);
  const leadingInverse = inv(denominator.at(-1));
  for (let i = a.length - 1; i >= denominator.length - 1; i -= 1) {
    const q = mod(a[i] * leadingInverse);
    const qi = i - denominator.length + 1;
    quotient[qi] = q;
    for (let j = 0; j < denominator.length; j += 1) {
      a[qi + j] = mod(a[qi + j] - q * denominator[j]);
    }
  }
  return { quotient: quotient.map(mod), remainder: a.slice(0, denominator.length - 1).map(mod) };
}

/** @param {number} page @param {number} start @param {number} length @returns {number[]} */
function redSpan(page, start, length) {
  const record = ink.pages.find((item) => item.page === page);
  assert(record, 'missing ink page ' + page);
  const span = (record.red_spans || []).find((item) => item.start === start && item.length === length);
  assert(span, 'missing red span p' + page + ' start' + start + ' len' + length);
  return [...span.runes].map((rune) => {
    const index = runeIndex.get(rune);
    assert.notStrictEqual(index, undefined, 'unknown rune ' + rune);
    return index;
  });
}

/** @param {number} count @returns {number[]} */
function primes(count) {
  const out = [];
  for (let candidate = 2; out.length < count; candidate += 1) {
    let prime = true;
    for (let d = 2; d * d <= candidate; d += 1) {
      if (candidate % d === 0) {
        prime = false;
        break;
      }
    }
    if (prime) out.push(candidate);
  }
  return out;
}

const p3Triad = redSpan(3, 119, 3);
assert.deepStrictEqual(p3Triad, [13, 23, 2]);
const leadInverse = inv(p3Triad[2]);
const relation = {
  r: mod(-p3Triad[1] * leadInverse),
  t: mod(-p3Triad[0] * leadInverse),
};
assert.deepStrictEqual(relation, { r: 3, t: 8 });

const p15Second = redSpan(15, 9, 11);
const p57Red = redSpan(57, 0, 7);
const p57Padded = p57Red.concat(Array(p15Second.length - p57Red.length).fill(0));
const difference = p15Second.map((value, i) => mod(value - p57Padded[i]));
const division = polynomialDivide(difference, p3Triad);
assert.deepStrictEqual(division.remainder, [0, 0]);
const Q = division.quotient;
assert.deepStrictEqual(Q, [5, 5, 14, 9, 10, 4, 27, 17, 25]);
const EQ = fieldEval(Q);
assert.deepStrictEqual(EQ, [17, 24]);

const p15First = redSpan(15, 0, 9);
assert.deepStrictEqual(fieldMul(EQ, fieldEval(p15First)), [23, 8]);

const p56Red = redSpan(56, 0, 5);
assert.deepStrictEqual(p56Red, [25, 11, 22, 15, 4]);
const p56Crosshold = fieldMul(EQ, fieldEval(p56Red));
assert.deepStrictEqual(p56Crosshold, [1, 2]);

const p56Key = primes(84).map((prime) => mod(prime - 1));
assert.deepStrictEqual(p56Key.slice(0, 5), [1, 2, 4, 6, 10]);
const p56PlainTitle = p56Red.map((value, i) => mod(value - p56Key[i]));
assert.deepStrictEqual(p56PlainTitle, [24, 9, 18, 9, 23]);
assert.strictEqual(p56PlainTitle.map((index) => corpus.translit[index]).join(''), 'ANEND');

const keyPairs = p56Key.slice(0, -1).map((value, i) => [value, p56Key[i + 1]]);
const prefixPairPositions = keyPairs.flatMap((pair, i) => pair[0] === 1 && pair[1] === 2 ? [i] : []);
assert.deepStrictEqual(prefixPairPositions, [0]);

const exactPrintedHits = [];
const rotatedHits = [];
const anyKeyPairHits = [];
let presentationCount = 0;
for (const pageRecord of ink.pages) {
  for (const span of pageRecord.red_spans || []) {
    const source = [...span.runes].map((rune) => runeIndex.get(rune));
    assert(source.every((value) => value !== undefined));
    const printedOutput = fieldMul(EQ, fieldEval(source));
    if (printedOutput[0] === 1 && printedOutput[1] === 2) {
      exactPrintedHits.push([pageRecord.page, span.start, span.length]);
    }
    for (let i = 0; i < keyPairs.length; i += 1) {
      if (printedOutput[0] === keyPairs[i][0] && printedOutput[1] === keyPairs[i][1]) {
        anyKeyPairHits.push([pageRecord.page, span.start, span.length, i]);
      }
    }
    for (const reversed of [false, true]) {
      const oriented = reversed ? source.slice().reverse() : source;
      for (let rotation = 0; rotation < oriented.length; rotation += 1) {
        presentationCount += 1;
        const candidate = oriented.slice(rotation).concat(oriented.slice(0, rotation));
        const output = fieldMul(EQ, fieldEval(candidate));
        if (output[0] === 1 && output[1] === 2) {
          rotatedHits.push([pageRecord.page, span.start, span.length, reversed, rotation]);
        }
      }
    }
  }
}
assert.strictEqual(presentationCount, 450);
assert.deepStrictEqual(exactPrintedHits, [[56, 0, 5]]);
assert.deepStrictEqual(rotatedHits, [[56, 0, 5, false, 0]]);
assert.deepStrictEqual(anyKeyPairHits, [[56, 0, 5, 0]]);

const factorSurvivors = [];
for (let r = 0; r < MOD; r += 1) {
  for (let t = 0; t < MOD; t += 1) {
    const factor = [mod(-2 * t), mod(-2 * r), 2];
    const candidateDivision = polynomialDivide(difference, factor);
    if (!candidateDivision.remainder.every((value) => value === 0)) continue;
    const candidateEQ = fieldEval(candidateDivision.quotient, r, t);
    factorSurvivors.push({
      r,
      t,
      Q: candidateDivision.quotient,
      p15Product: fieldMul(candidateEQ, fieldEval(p15First, r, t), r, t),
      p56Product: fieldMul(candidateEQ, fieldEval(p56Red, r, t), r, t),
    });
  }
}
assert.strictEqual(factorSurvivors.length, 2);
assert.deepStrictEqual(factorSurvivors.map(({ r, t, p56Product }) => ({ r, t, p56Product })), [
  { r: 3, t: 8, p56Product: [1, 2] },
  { r: 18, t: 12, p56Product: [24, 26] },
]);

const p54Red = redSpan(54, 0, 9);
const p54Output = fieldMul(EQ, fieldEval(p54Red));
assert.deepStrictEqual(p54Output, [0, 20]);

console.log(JSON.stringify({
  p3_relation: relation,
  Q,
  E_Q: EQ,
  p15_first_product: fieldMul(EQ, fieldEval(p15First)),
  p56_red_ciphertext: p56Red,
  p56_key_prefix: p56Key.slice(0, 5),
  p56_plain_title: p56PlainTitle,
  p56_plain_translit: p56PlainTitle.map((index) => corpus.translit[index]).join(''),
  p56_crosshold: p56Crosshold,
  red_presentations_charged: presentationCount,
  rotated_hits: rotatedHits,
  printed_red_to_any_p56_keypair_hits: anyKeyPairHits,
  factor_survivors: factorSurvivors,
  p54_other_len9_output: p54Output,
}, null, 2));
