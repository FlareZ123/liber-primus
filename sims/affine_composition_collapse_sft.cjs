'use strict';

const assert = require('node:assert/strict');
const mod = (x) => ((x % 29) + 29) % 29;
let seed = 0x330129;
function rand() {
  seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
  return seed >>> 0;
}
function permute(values, permutation) {
  return permutation.map((i) => values[i]);
}
function apply(values, ops) {
  let out = values.slice();
  for (const op of ops) {
    if (op.type === 'add') out = out.map((x, i) => mod(x + op.key[i]));
    else if (op.type === 'sub') out = out.map((x, i) => mod(x - op.key[i]));
    else if (op.type === 'atbash') out = out.map((x) => mod(28 - x));
    else if (op.type === 'perm') out = permute(out, op.perm);
    else throw new Error('unknown operation: ' + op.type);
  }
  return out;
}
function collapse(ops, n) {
  let perm = Array.from({ length: n }, (_, i) => i);
  let sign = new Array(n).fill(1);
  let bias = new Array(n).fill(0);
  for (const op of ops) {
    if (op.type === 'add' || op.type === 'sub') {
      const d = op.type === 'add' ? 1 : -1;
      bias = bias.map((b, i) => mod(b + d * op.key[i]));
    } else if (op.type === 'atbash') {
      sign = sign.map((s) => -s);
      bias = bias.map((b) => mod(28 - b));
    } else if (op.type === 'perm') {
      perm = op.perm.map((i) => perm[i]);
      sign = op.perm.map((i) => sign[i]);
      bias = op.perm.map((i) => bias[i]);
    } else throw new Error('unknown operation: ' + op.type);
  }
  return { perm, sign, bias };
}
function shuffled(n) {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = rand() % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function key(n) { return Array.from({ length: n }, () => rand() % 29); }

const n = 14;
const stage05 = [0, 6, 2, 5, 1, 4, 3, 7, 13, 9, 12, 8, 11, 10];
const cases = 500;
let checks = 0;
for (let c = 0; c < cases; c++) {
  const ops = [];
  const count = 4 + (rand() % 9);
  for (let j = 0; j < count; j++) {
    switch (rand() % 4) {
      case 0: ops.push({ type: 'add', key: key(n) }); break;
      case 1: ops.push({ type: 'sub', key: key(n) }); break;
      case 2: ops.push({ type: 'atbash' }); break;
      case 3: ops.push({ type: 'perm', perm: c === 0 && j === 0 ? stage05 : shuffled(n) }); break;
    }
  }
  const reduced = collapse(ops, n);
  for (let pos = 0; pos < n; pos++) {
    for (let x = 0; x < 29; x++) {
      const input = new Array(n).fill(0);
      input[pos] = x;
      const actual = apply(input, ops);
      const expected = reduced.perm.map((source, i) =>
        mod(reduced.sign[i] * input[source] + reduced.bias[i]));
      assert.deepEqual(actual, expected, `case=${c} pos=${pos} symbol=${x}`);
      checks++;
    }
  }
}
console.log(JSON.stringify({
  result: 'PASS',
  seed: '0x330129',
  cases,
  max_operations_per_case: 12,
  alphabet_size: 29,
  positions: n,
  input_position_symbol_checks: checks,
  exact_stage05_inverse_included: true,
  normal_form: 'y[i] = sign[i] * x[perm[i]] + bias[i] mod 29'
}, null, 2));
