'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const MOD = 29;
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-ink-annotations.json'), 'utf8'));
const signed = fs.readFileSync(path.join(root, 'resources/historical/cicada2016-4gq25-outguess.asc'), 'utf8');
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @param {number} x @returns {number} */
function mod(x) {
  return ((x % MOD) + MOD) % MOD;
}

/** @param {[number,number]} x @param {[number,number]} y @returns {[number,number]} */
function mul(x, y) {
  const [a, b] = x;
  const [c, d] = y;
  return [mod(a * c + 8 * b * d), mod(a * d + b * c + 3 * b * d)];
}

/** @param {number[]} coefficients @returns {[number,number]} */
function evaluate(coefficients) {
  /** @type {[number,number]} */
  let acc = [0, 0];
  /** @type {[number,number]} */
  let power = [1, 0];
  for (const coefficient of coefficients) {
    acc = [mod(acc[0] + coefficient * power[0]), mod(acc[1] + coefficient * power[1])];
    power = mul(power, [0, 1]);
  }
  return acc;
}

/** @param {number} page @param {number} start @param {number} length @returns {number[]} */
function redSpan(page, start, length) {
  const pageRecord = ink.pages.find((item) => item.page === page);
  assert(pageRecord);
  const span = (pageRecord.red_spans || []).find((item) => item.start === start && item.length === length);
  assert(span);
  return [...span.runes].map((rune) => {
    const value = runeIndex.get(rune);
    assert.notStrictEqual(value, undefined);
    return value;
  });
}

const body = signed.split('-----BEGIN PGP SIGNATURE-----')[0];
const words = body.match(/\b[A-Za-z]+\b/g)
  .filter((word) => !['BEGIN', 'PGP', 'SIGNED', 'MESSAGE', 'Hash', 'SHA'].includes(word))
  .map((word) => word.toUpperCase());
assert.strictEqual(words.length, 43);

const Q = [5, 5, 14, 9, 10, 4, 27, 17, 25];
const EQ = evaluate(Q);
assert.deepStrictEqual(EQ, [17, 24]);

const discreteLog = new Map();
let state = [1, 0];
for (let exponent = 0; exponent < MOD * MOD - 1; exponent += 1) {
  assert(!discreteLog.has(state.join(',')), 'Q repeated before full orbit');
  discreteLog.set(state.join(','), exponent);
  state = mul(state, EQ);
}
assert.deepStrictEqual(state, [1, 0]);
assert.strictEqual(discreteLog.size, 840);

/** @param {[number,number]} residue @returns {{exponent:number,row:number,col:number}} */
function orbitCoordinate(residue) {
  const exponent = discreteLog.get(residue.join(','));
  assert.notStrictEqual(exponent, undefined, 'zero residue has no discrete log');
  return { exponent, row: Math.floor(exponent / MOD), col: exponent % MOD };
}

/** @param {number} row @param {number} col @returns {string} */
function interval(row, col) {
  assert(row <= col);
  return words.slice(row, col + 1).join(' ');
}

const selected = [
  { name: 'p7', page: 7, start: 194, length: 14, expected: [20, 23], phrase: 'MEANING IS THE ROAD' },
  { name: 'p39', page: 39, start: 119, length: 3, expected: [17, 23], phrase: 'THE MAP THEIR MEANING IS THE ROAD' },
  { name: 'p40', page: 40, start: 0, length: 8, expected: [5, 8], phrase: 'EPIPHANY SEEKS THE DEVOTED' },
  { name: 'p56', page: 56, start: 0, length: 5, expected: [4, 5], phrase: 'EMPTY EPIPHANY' },
];

const selectedOutputs = [];
for (const item of selected) {
  const residue = evaluate(redSpan(item.page, item.start, item.length));
  const coordinate = orbitCoordinate(residue);
  assert.deepStrictEqual([coordinate.row, coordinate.col], item.expected, item.name);
  assert.strictEqual(interval(coordinate.row, coordinate.col), item.phrase, item.name);
  selectedOutputs.push({ ...item, residue, ...coordinate });
}

const punctuationClauses = new Map([
  ['0,0', 'HELLO'],
  ['1,4', 'THE PATH LIES EMPTY'],
  ['5,8', 'EPIPHANY SEEKS THE DEVOTED'],
  ['9,13', 'LIBER PRIMUS IS THE WAY'],
  ['14,18', 'ITS WORDS ARE THE MAP'],
  ['19,23', 'THEIR MEANING IS THE ROAD'],
  ['24,29', 'AND THEIR NUMBERS ARE THE DIRECTION'],
  ['30,35', 'SEEK AND YOU WILL BE FOUND'],
  ['36,37', 'GOOD LUCK'],
  ['38,40', 'BEWARE FALSE PATHS'],
  ['41,42', 'VERIFY OPENPGP'],
]);

const census = [];
const exactClauseHits = [];
const adjacentDistinctHits = [];
for (const pageRecord of ink.pages) {
  for (const [spanIndex, span] of (pageRecord.red_spans || []).entries()) {
    const source = [...span.runes].map((rune) => runeIndex.get(rune));
    assert(source.every((value) => value !== undefined));
    const residue = evaluate(source);
    if (residue[0] === 0 && residue[1] === 0) {
      census.push({ page: pageRecord.page, spanIndex, start: span.start, length: span.length, residue, zero: true });
      continue;
    }
    const coordinate = orbitCoordinate(residue);
    const key = coordinate.row + ',' + coordinate.col;
    const row = {
      page: pageRecord.page,
      spanIndex,
      start: span.start,
      length: span.length,
      residue,
      exponent: coordinate.exponent,
      base29: [coordinate.row, coordinate.col],
      endpointWords: [words[coordinate.row], words[coordinate.col]],
    };
    census.push(row);
    if (punctuationClauses.has(key)) {
      exactClauseHits.push({ ...row, clause: punctuationClauses.get(key) });
    }
    if (coordinate.col === coordinate.row + 1) {
      adjacentDistinctHits.push(row);
    }
  }
}

assert.deepStrictEqual(exactClauseHits.map((item) => [item.page, item.start, item.base29, item.clause]), [
  [40, 0, [5, 8], 'EPIPHANY SEEKS THE DEVOTED'],
]);
assert.deepStrictEqual(adjacentDistinctHits.map((item) => [item.page, item.start, item.base29]), [
  [56, 0, [4, 5]],
]);

const p39 = selectedOutputs.find((item) => item.name === 'p39');
assert(p39);
assert.strictEqual(p39.exponent, 516);
assert.deepStrictEqual([p39.row, p39.col], [17, 23]);

// Independent p50 work selected this same signed-source interval as its MAP/ROAD core.
// This test only charges the numeric interval fixed by that external report; it does not
// rederive p50 geometry or use p39 to choose its endpoints.
const independentP50MapRoadInterval = [17, 23];
assert.deepStrictEqual([p39.row, p39.col], independentP50MapRoadInterval);

console.log(JSON.stringify({
  E_Q: EQ,
  q_order: discreteLog.size,
  path_model: 'Q^k <-> base29 coordinates [floor(k/29), k%29]; multiply by Q increments k mod840',
  selected: selectedOutputs,
  exact_punctuation_clause_hits: exactClauseHits,
  distinct_adjacent_coordinate_hits: adjacentDistinctHits,
  p39_independent_p50_interval: independentP50MapRoadInterval,
  complete_red_span_count: census.length,
  census,
}, null, 2));
