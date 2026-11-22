'use strict';

/**
 * Frozen original p39/p29/p50 3301 double-root endian gate.
 * Node.js 22, CommonJS, Windows 11, no file writes or tunable arguments.
 * Computes both uniform first-to-last coefficient conventions for each
 * authentic source and reports whether a single convention fits them all.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const dir = path.join(__dirname, '..', 'resources', 'liber-primus');
const json = (name) => JSON.parse(fs.readFileSync(
  path.join(dir, name), 'utf8'
));
const corpus = json('lp2-corpus.json');
const ink = json('lp2-ink-annotations.json');
const table = json('lp2-grid-256.json');
const p29 = corpus.pages.find((p) => p.page === 29).indices;
const p39 = corpus.pages.find((p) => p.page === 39).indices;
const red = ink.pages.find((p) => p.page === 39).red_spans;
assert.equal(p29.length, 277);
assert.equal(table.bytes.length, 256);
assert.ok(red.some((span) => span.start === 119 && span.length === 3));
const printedRed = p39.slice(119, 122);
assert.deepEqual(printedRed, [27, 5, 15]);

const root = 3301 % 29;
assert.equal(root, 24);
/**
 * Polynomial evaluation and formal derivative in GF29 using Horner.
 * @param {number[]} highFirst
 * @returns {{value:number, derivative:number}}
 */
function valueDerivative(highFirst) {
  let value = 0;
  let derivative = 0;
  for (const coefficient of highFirst) {
    derivative = (derivative * root + value) % 29;
    value = (value * root + coefficient) % 29;
  }
  return { value, derivative };
}
const operands = [
  { name: 'p39 original red', indices: printedRed },
  { name: 'p29 intact 277 GP29', indices: p29 },
  { name: 'p50 intact 256 base60-byte hypothesis', indices: table.bytes }
];
const expected = [
  [{ value: 27, derivative: 25 }, { value: 0, derivative: 0 }],
  [{ value: 0, derivative: 0 }, { value: 13, derivative: 10 }],
  [{ value: 0, derivative: 0 }, { value: 16, derivative: 4 }]
];
const outputs = operands.map((source, index) => {
  const printedHighFirst = valueDerivative(source.indices);
  const printedLowFirst = valueDerivative([...source.indices].reverse());
  assert.deepEqual(printedHighFirst, expected[index][0]);
  assert.deepEqual(printedLowFirst, expected[index][1]);
  console.log(source.name, 'PRINTED_HIGH_FIRST',
    JSON.stringify(printedHighFirst), 'PRINTED_LOW_FIRST',
    JSON.stringify(printedLowFirst));
  return [printedHighFirst, printedLowFirst];
});
for (const order of [0, 1]) {
  const allDoubleRoot = outputs.every((results) =>
    results[order].value === 0 && results[order].derivative === 0);
  assert.equal(allDoubleRoot, false,
    'No single source-wide coefficient endian has all three double roots');
}
assert.ok(outputs[0][1].value === 0 && outputs[1][0].value === 0 &&
  outputs[2][0].value === 0);
console.log('ONLY_MIXED_ENDIAN_MATCHES', 'red=LOW_FIRST',
  'p29=HIGH_FIRST', 'p50=HIGH_FIRST');
console.log('GF29_DIMENSIONS_P29_QUOTIENT', 275,
  'P50_QUOTIENT', 254,
  'SYNROMES_TWO_EACH', 'CHECKSUM_NOT_UNIQUE_KEY');
console.log('PASS: original-value 3301 root has no uniform coefficient convention');
