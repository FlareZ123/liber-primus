'use strict';

/**
 * Signed-2013 BASE29(3301) field as a moving, reversible GP29 pair mask.
 * A bounded original-source test on the untouched LP2 rune tape.
 * Run with Node.js 22 on Windows or another supported platform.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} relative @returns {string} */
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const signed = read('resources/external/2013-tcp-server-signed-source.md');
assert.match(signed, /BASE29 3301/u);
assert.match(signed, /3QO/u);
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((n, p) => n + p.indices.length, 0), 12956);
assert.equal(corpus.pages[50].indices.length, 0);

/** @param {number} n @returns {number} */
const mod = n => ((n % 29) + 29) % 29;
/**
 * The signed digit polynomial 3+26z+24z², normalized by 24⁻¹,
 * gives z²+18z+11=0 over GF(29), hence z²=18+11z.
 * @param {number[]} x @param {number[]} y @returns {number[]}
 */
function multiply(x, y) {
  const [a, b] = x;
  const [c, d] = y;
  return [mod(a * c + 18 * b * d), mod(a * d + b * c + 11 * b * d)];
}
const one = [1, 0];
const alpha = [0, 1];
const powers = [one];
for (let i = 1; i <= 840; i++) powers.push(multiply(powers[i - 1], alpha));
assert.deepEqual(powers[840], one);
assert.deepEqual(powers[420], [28, 0]);
assert.equal(new Set(powers.slice(0, 840).map(pair => pair.join(','))).size, 840);
assert.deepEqual(powers[280], [12, 3]);
assert.deepEqual(powers[168], [18, 13]);

/**
 * @param {number[]} input
 * @param {number} startBlock
 * @param {1|-1} direction
 * @returns {{ output: number[], nextBlock: number }}
 */
function transform(input, startBlock, direction) {
  const output = [];
  let block = startBlock;
  for (let i = 0; i + 1 < input.length; i += 2) {
    const exponent = mod840(direction * block);
    const pair = multiply([input[i], input[i + 1]], powers[exponent]);
    output.push(pair[0], pair[1]);
    block++;
  }
  // Preserve an unpaired final printed rune, without fabricating padding.
  if (input.length % 2 === 1) output.push(input[input.length - 1]);
  return { output, nextBlock: block };
}
/** @param {number} exponent @returns {number} */
function mod840(exponent) {
  return ((exponent % 840) + 840) % 840;
}
/** @param {number[]} seq @returns {number} */
function ioc(seq) {
  const counts = Array(29).fill(0);
  for (const x of seq) counts[x]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) / (seq.length * (seq.length - 1));
}
/** @param {1|-1} direction @param {'page'|'book'} clock */
function run(direction, clock) {
  /** @type {Map<number, number[]>} */
  const outByPage = new Map();
  let block = 0;
  for (const page of pages) {
    if (clock === 'page') block = 0;
    const decoded = transform(page.indices, block, direction);
    const replay = transform(decoded.output, block, /** @type {1|-1} */ (-direction));
    assert.deepEqual(replay.output, page.indices, 'original whole-page replay');
    assert.equal(decoded.output.length, page.indices.length);
    outByPage.set(page.page, decoded.output);
    block = decoded.nextBlock;
  }
  /** @param {number[]} pgs @returns {number[]} */
  const flatten = pgs => pgs.flatMap(n => outByPage.get(n) || []);
  const all = pages.flatMap(p => outByPage.get(p.page));
  const train = flatten([16, 17, 18, 19, 20, 21]);
  const hold = flatten([40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 51, 52, 53]);
  const terminal = flatten([55]);
  assert.equal(train.length, 1613);
  assert.equal(hold.length, 3008);
  assert.equal(all.length, 12956);
  return {
    clock, direction: direction === 1 ? 'multiply' : 'divide',
    all: ioc(all), p16to21: ioc(train), p40to53: ioc(hold),
    p55: ioc(terminal),
    first35: train.slice(0, 35).map(n => corpus.translit[n]).join('')
  };
}
const outcomes = [];
for (const clock of ['page', 'book']) {
  for (const direction of /** @type {const} */ ([1, -1])) {
    outcomes.push(run(direction, clock));
  }
}
const expected = [
  ['page', 'multiply', 0.034485809465376924, 0.03442639595470426, 0.034382097800168404],
  ['page', 'divide', 0.03444079173532625, 0.034384090800705806, 0.034438482194029535],
  ['book', 'multiply', 0.034460131008982216, 0.034493315016483624, 0.034426320854177135],
  ['book', 'divide', 0.034482866273391075, 0.03441255063157749, 0.03468922691025904]
];
for (let i = 0; i < outcomes.length; i++) {
  const x = outcomes[i], e = expected[i];
  assert.equal(x.clock, e[0]);
  assert.equal(x.direction, e[1]);
  assert.ok(Math.abs(x.all - e[2]) < 1e-12);
  assert.ok(Math.abs(x.p16to21 - e[3]) < 1e-12);
  assert.ok(Math.abs(x.p40to53 - e[4]) < 1e-12);
}
// Independently source-authentic plaintext control, in its original GP29 spelling.
const known = corpus.pages[57].indices;
assert.equal(known.length, 95);
const cipher = transform(known, 0, 1).output;
assert.deepEqual(transform(cipher, 0, -1).output, known);
assert.deepEqual(transform(cipher, 0, -1).output, corpus.pages[57].indices);
for (const outcome of outcomes) console.log(JSON.stringify(outcome));
console.log('PASS: 4 original-source inversions, full replay, primitive 840-order field and 95/95 original solved-p57 plant');
