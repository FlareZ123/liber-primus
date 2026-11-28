'use strict';

const assert = require('assert');

const MOD = 29;

/** @param {number} x @returns {number} */
function mod(x) {
  return ((x % MOD) + MOD) % MOD;
}

/** @param {[number, number]} x @param {[number, number]} y @returns {[number, number]} */
function mul(x, y) {
  const [a, b] = x;
  const [c, d] = y;
  return [mod(a * c + 8 * b * d), mod(a * d + b * c + 3 * b * d)];
}

/** @param {[number, number]} x @param {number} n @returns {[number, number]} */
function pow(x, n) {
  let result = [1, 0];
  let base = x;
  let exponent = n;
  while (exponent > 0) {
    if (exponent & 1) result = mul(result, base);
    base = mul(base, base);
    exponent = Math.floor(exponent / 2);
  }
  return result;
}

/** @param {[number, number]} x @returns {number} */
function order(x) {
  for (let d = 1; d <= 840; d += 1) {
    if (840 % d === 0) {
      const y = pow(x, d);
      if (y[0] === 1 && y[1] === 0) return d;
    }
  }
  throw new Error('nonzero field element must have order dividing 840');
}

const Q = [17, 24];
const M = [[17, mod(8 * 24)], [24, mod(17 + 3 * 24)]];
assert.deepStrictEqual(M, [[17, 18], [24, 2]]);

const frobenius = pow(Q, 29);
assert.deepStrictEqual(frobenius, [2, 5]);
assert.deepStrictEqual(frobenius, [M[1][1], mod(-M[1][0])]);

const trace = mod(M[0][0] + M[1][1]);
const norm = mod(M[0][0] * M[1][1] - M[0][1] * M[1][0]);
assert.strictEqual(trace, 19);
assert.strictEqual(norm, 8);
assert.strictEqual(order(Q), 840);

let primitiveCount = 0;
const traceNorm = [];
for (let a = 0; a < MOD; a += 1) {
  for (let b = 0; b < MOD; b += 1) {
    if (a === 0 && b === 0) continue;
    const x = [a, b];
    const ord = order(x);
    if (ord === 840) primitiveCount += 1;
    const fx = pow(x, 29);
    const tr = mod(a + fx[0]);
    const n = mul(x, fx)[0];
    if (tr === 19 && n === 8) traceNorm.push({ x, order: ord });
  }
}
assert.strictEqual(primitiveCount, 192);
assert.deepStrictEqual(traceNorm, [{ x: [2, 5], order: 840 }, { x: [17, 24], order: 840 }]);

console.log(JSON.stringify({
  field: 'GF(29)[u]/(u^2-3u-8)',
  Q,
  multiplication_matrix: M,
  frobenius,
  trace,
  norm,
  order: order(Q),
  primitive_count: primitiveCount,
  trace19_norm8_elements: traceNorm,
  dependency: {
    frobenius_from_matrix: '[M22,-M21]',
    trace_from_matrix: 'tr(M)',
    norm_from_matrix: 'det(M)',
  },
  decision: 'exact identities; dependent algebraic consequences, not independent authentication',
}, null, 2));
