// Source-exact 4x4 Fibonacci-prime matrix-power Hill inverse.
// Run on Windows: node sims/lp2_p15_p39_dynamic_matrix_power_sft.cjs
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const pages = corpus.pages;
const tr = corpus.translit;
const mod = (value) => ((value % 29) + 29) % 29;
const identity = () => Array.from({ length: 4 }, (_, i) => Array.from({ length: 4 }, (_, j) => Number(i === j)));
const transpose = (a) => a[0].map((_, c) => a.map((row) => row[c]));
/** @param {number[][]} a @param {number[][]} b */
function multiply(a, b) {
  return a.map((row) => Array.from({ length: 4 }, (_, c) => mod(row.reduce((s, x, k) => s + x * b[k][c], 0))));
}
/** @param {number[][]} m */
function inverse(m) {
  const b = m.map((row, i) => row.concat(identity()[i]));
  for (let j = 0; j < 4; j++) {
    const pivot = b.findIndex((row, i) => i >= j && row[j] !== 0);
    assert.ok(pivot >= j, 'matrix must be invertible');
    [b[j], b[pivot]] = [b[pivot], b[j]];
    let scalar = 1;
    while ((scalar * b[j][j]) % 29 !== 1) scalar++;
    b[j] = b[j].map((x) => mod(scalar * x));
    for (let i = 0; i < 4; i++) {
      if (i === j) continue;
      const multiplier = b[i][j];
      b[i] = b[i].map((x, k) => mod(x - multiplier * b[j][k]));
    }
  }
  return b.map((row) => row.slice(4));
}
/** @param {number[][]} mat @param {number[]} block */
function apply(mat, block) {
  return mat.map((row) => mod(row.reduce((s, x, k) => s + x * block[k], 0)));
}
/**
 * @param {number[]} input Original GP rune ordinals, length multiple of 4
 * @param {number[][]} base Signed 4x4 p15 matrix or its inverse
 * @param {0|1} initialPower
 * @param {boolean} transposed Whether to transpose each power before use
 */
function transform(input, base, initialPower, transposed) {
  assert.equal(input.length % 4, 0);
  let power = initialPower ? base.map((row) => row.slice()) : identity();
  const result = [];
  for (let i = 0; i < input.length; i += 4) {
    result.push(...apply(transposed ? transpose(power) : power, input.slice(i, i + 4)));
    power = multiply(power, base);
  }
  return result;
}
function ioc(input) {
  const counts = Array(29).fill(0);
  input.forEach((v) => counts[v]++);
  return counts.reduce((s, v) => s + v * (v - 1), 0) / (input.length * (input.length - 1));
}
const original = [3258, 3222, 3152, 3038, 3278, 3299, 3298, 2838, 3288, 3294, 3296, 2472, 4516, 1206, 708, 1820];
const restored = original.map((n, i) => i === 12 || i === 13 ? -n : n);
const M = Array.from({ length: 4 }, (_, i) => restored.slice(i * 4, i * 4 + 4).map(mod));
assert.deepEqual(M, [[10, 3, 20, 22], [1, 22, 21, 25], [11, 17, 19, 7], [8, 12, 12, 22]]);
const Mi = inverse(M);
assert.deepEqual(multiply(M, Mi), identity());
assert.deepEqual(multiply(Mi, M), identity());
let power = identity();
for (let i = 1; i <= 812; i++) {
  power = multiply(power, M);
  if (i === 812) assert.deepEqual(power, identity());
  else if ([406, 116, 28].includes(i)) assert.notDeepEqual(power, identity());
}
const targets = [
  { name: 'p16..p22', stream: pages.slice(16, 23).flatMap((p) => p.indices), expectedLength: 1744 },
  { name: 'p40..p53 black tail', stream: pages.slice(40, 54).flatMap((p) => p.indices).slice(8), expectedLength: 3000 },
];
const control = [...pages[57].indices.slice(0, 92)];
assert.equal(control.length % 4, 0);
let highest = { ioc: -1 };
for (const target of targets) {
  assert.equal(target.stream.length, target.expectedLength);
  console.log('SOURCE TARGET', target.name, 'n', target.stream.length, 'cipher IOC', ioc(target.stream).toFixed(10));
  for (const [name, matrix, back] of [['M', M, Mi], ['M^-1', Mi, M]]) {
    for (const initialPower of [0, 1]) {
      for (const transposed of [false, true]) {
        const output = transform(target.stream, matrix, initialPower, transposed);
        // Independent source-native positive plant and original exact reencryption.
        const expectedControl = transform(transform(control, back, initialPower, transposed), matrix, initialPower, transposed);
        assert.deepEqual(expectedControl, control);
        const originalAgain = transform(output, back, initialPower, transposed);
        assert.deepEqual(originalAgain, target.stream);
        const v = ioc(output);
        console.log(JSON.stringify({
          target: target.name, matrix: name, initialPower,
          transposed, ioc: Number(v.toFixed(10)),
          prefix32: output.slice(0, 32).map((x) => tr[x]).join(' '),
          originalRoundtrip: output.length, plantRoundtrip: control.length,
        }));
        if (v > highest.ioc) highest = { ioc: v, target: target.name, name, initialPower, transposed };
      }
    }
  }
}
assert.ok(highest.ioc < 0.037, 'No original-source power model may be mistaken for GP-native English');
console.log('HIGHEST', JSON.stringify(highest), 'known native clear GP IOC', ioc(control).toFixed(10));
