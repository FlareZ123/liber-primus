'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const MOD = 29;
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-ink-annotations.json'), 'utf8'));
const signed2016 = fs.readFileSync(path.join(root, 'resources/historical/cicada2016-4gq25-outguess.asc'), 'utf8');
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
function mul(x, y, r = 3, t = 8) {
  const [a, b] = x;
  const [c, d] = y;
  return [mod(a * c + t * b * d), mod(a * d + b * c + r * b * d)];
}

/** @param {number[]} coefficients @param {number} r @param {number} t @returns {[number, number]} */
function evaluate(coefficients, r = 3, t = 8) {
  /** @type {[number, number]} */
  let acc = [0, 0];
  /** @type {[number, number]} */
  let power = [1, 0];
  for (const coefficient of coefficients) {
    acc = [mod(acc[0] + coefficient * power[0]), mod(acc[1] + coefficient * power[1])];
    power = mul(power, [0, 1], r, t);
  }
  return acc;
}

/** @param {number[]} numerator @param {number[]} denominator @returns {{quotient:number[], remainder:number[]}} */
function divide(numerator, denominator) {
  const a = numerator.map(mod);
  const quotient = Array(Math.max(0, a.length - denominator.length + 1)).fill(0);
  const leadInv = inv(denominator.at(-1));
  for (let i = a.length - 1; i >= denominator.length - 1; i -= 1) {
    const q = mod(a[i] * leadInv);
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
  const pageRecord = ink.pages.find((item) => item.page === page);
  assert(pageRecord, 'missing page ' + page);
  const span = (pageRecord.red_spans || []).find((item) => item.start === start && item.length === length);
  assert(span, 'missing red span p' + page + ':' + start + '+' + length);
  return [...span.runes].map((rune) => {
    const value = runeIndex.get(rune);
    assert.notStrictEqual(value, undefined, 'unknown rune ' + rune);
    return value;
  });
}

/** @param {[number, number]} q @param {number} r @param {number} t @returns {number[][]} */
function multiplicationMatrix(q, r, t) {
  const [x, y] = q;
  return [
    [x, mod(t * y)],
    [y, mod(x + r * y)],
  ];
}

/** @param {number[][]} matrix @returns {number[]} */
function flatten(matrix) {
  return matrix.flat();
}

const signedBody = signed2016.split('-----BEGIN PGP SIGNATURE-----')[0];
const words = signedBody.match(/\b[A-Za-z]+\b/g).filter((word) => !['BEGIN', 'PGP', 'SIGNED', 'MESSAGE', 'Hash', 'SHA'].includes(word));
assert.strictEqual(words.length, 43);
assert.deepStrictEqual(words.slice(0, 9).map((word) => word.toUpperCase()), [
  'HELLO', 'THE', 'PATH', 'LIES', 'EMPTY', 'EPIPHANY', 'SEEKS', 'THE', 'DEVOTED',
]);
assert.strictEqual(words[17].toUpperCase(), 'THE');
assert.strictEqual(words[18].toUpperCase(), 'MAP');
assert.strictEqual(words[20].toUpperCase(), 'MEANING');
assert.strictEqual(words[23].toUpperCase(), 'ROAD');
assert.strictEqual(words[24].toUpperCase(), 'AND');
assert.strictEqual(words[29].toUpperCase(), 'DIRECTION');

const p3 = redSpan(3, 119, 3);
assert.deepStrictEqual(p3, [13, 23, 2]);
const leadInv = inv(p3[2]);
const sourceRelation = { r: mod(-p3[1] * leadInv), t: mod(-p3[0] * leadInv) };
assert.deepStrictEqual(sourceRelation, { r: 3, t: 8 });

const p15Second = redSpan(15, 9, 11);
const p57 = redSpan(57, 0, 7);
const paddedP57 = p57.concat(Array(p15Second.length - p57.length).fill(0));
const difference = p15Second.map((value, i) => mod(value - paddedP57[i]));
const division = divide(difference, p3);
assert.deepStrictEqual(division.remainder, [0, 0]);
const Q = division.quotient;
assert.deepStrictEqual(Q, [5, 5, 14, 9, 10, 4, 27, 17, 25]);

const EQ = evaluate(Q);
assert.deepStrictEqual(EQ, [17, 24]);
const matrix = multiplicationMatrix(EQ, sourceRelation.r, sourceRelation.t);
assert.deepStrictEqual(matrix, [[17, 18], [24, 2]]);
const matrixWords = flatten(matrix).map((index) => words[index].toUpperCase());
assert.deepStrictEqual(matrixWords, ['THE', 'MAP', 'AND', 'PATH']);

const factorRelations = [];
for (let r = 0; r < MOD; r += 1) {
  for (let t = 0; t < MOD; t += 1) {
    const factor = [mod(-2 * t), mod(-2 * r), 2];
    const candidate = divide(difference, factor);
    if (!candidate.remainder.every((value) => value === 0)) continue;
    const candidateEQ = evaluate(candidate.quotient, r, t);
    const candidateMatrix = multiplicationMatrix(candidateEQ, r, t);
    factorRelations.push({
      r,
      t,
      Q: candidate.quotient,
      EQ: candidateEQ,
      matrix: candidateMatrix,
      words: flatten(candidateMatrix).map((index) => words[index].toUpperCase()),
    });
  }
}
assert.strictEqual(factorRelations.length, 2);
assert.deepStrictEqual(factorRelations.map(({ r, t, words: mapped }) => ({ r, t, words: mapped })), [
  { r: 3, t: 8, words: ['THE', 'MAP', 'AND', 'PATH'] },
  { r: 18, t: 12, words: ['EPIPHANY', 'THEIR', 'THEIR', 'THE'] },
]);

let exactMapPhraseMultipliers = 0;
for (let x = 0; x < MOD; x += 1) {
  for (let y = 0; y < MOD; y += 1) {
    const candidateWords = flatten(multiplicationMatrix([x, y], 3, 8)).map((index) => words[index].toUpperCase());
    if (candidateWords.join(' ') === 'THE MAP AND PATH') {
      exactMapPhraseMultipliers += 1;
      assert.deepStrictEqual([x, y], EQ);
    }
  }
}
assert.strictEqual(exactMapPhraseMultipliers, 1);

const p15First = redSpan(15, 0, 9);
const p54 = redSpan(54, 0, 9);
const p56 = redSpan(56, 0, 5);
const typed = [
  { name: 'p15-first', source: p15First, expectedE: [24, 6], expectedOut: [23, 8], expectedWords: ['ROAD', 'DEVOTED'] },
  { name: 'p54', source: p54, expectedE: [13, 28], expectedOut: [0, 20], expectedWords: ['HELLO', 'MEANING'] },
  { name: 'p56', source: p56, expectedE: [3, 23], expectedOut: [1, 2], expectedWords: ['THE', 'PATH'] },
];
for (const item of typed) {
  const E = evaluate(item.source);
  const output = mul(EQ, E);
  assert.deepStrictEqual(E, item.expectedE, item.name + ' residue');
  assert.deepStrictEqual(output, item.expectedOut, item.name + ' Q product');
  assert.deepStrictEqual(output.map((index) => words[index].toUpperCase()), item.expectedWords, item.name + ' words');
}

const lengthNine = [];
const targetP54Presentations = [];
let presentations = 0;
for (const pageRecord of ink.pages) {
  for (const span of pageRecord.red_spans || []) {
    const source = [...span.runes].map((rune) => runeIndex.get(rune));
    if (span.length === 9) lengthNine.push([pageRecord.page, span.start]);
    for (const reversed of [false, true]) {
      const oriented = reversed ? source.slice().reverse() : source;
      for (let rotation = 0; rotation < oriented.length; rotation += 1) {
        presentations += 1;
        const rotated = oriented.slice(rotation).concat(oriented.slice(0, rotation));
        const output = mul(EQ, evaluate(rotated));
        if (output[0] === 0 && output[1] === 20) {
          targetP54Presentations.push([pageRecord.page, span.start, span.length, reversed, rotation]);
        }
      }
    }
  }
}
assert.deepStrictEqual(lengthNine, [[15, 0], [54, 0]]);
assert.strictEqual(presentations, 450);
assert.deepStrictEqual(targetP54Presentations, [[54, 0, 9, false, 0]]);

console.log(JSON.stringify({
  source_relation: sourceRelation,
  Q,
  E_Q: EQ,
  multiplication_matrix: matrix,
  matrix_words: matrixWords,
  factor_relations: factorRelations,
  typed_receivers: typed.map((item) => {
    const output = mul(EQ, evaluate(item.source));
    return {
      name: item.name,
      residue: evaluate(item.source),
      output,
      output_words: output.map((index) => words[index].toUpperCase()),
    };
  }),
  complete_red_length9: lengthNine,
  charged_presentations: presentations,
  p54_target_hits: targetP54Presentations,
  exact_map_phrase_multipliers: exactMapPhraseMultipliers,
}, null, 2));
