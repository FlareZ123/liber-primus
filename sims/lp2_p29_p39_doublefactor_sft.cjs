'use strict';

/**
 * Original LP2 p29 / p39 / 2013-G polynomial source-gate.
 * Read the canonical descending GP29 page coefficients, freeze the historical
 * root X=3301 mod29=24 and original p39 red G(X)=27+5X+15X².
 *
 * Node.js 22: node sims/lp2_p29_p39_doublefactor_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const gp = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8')).bytes;
const mod = n => ((n % 29) + 29) % 29;

function inverse(n) {
  const v = mod(n);
  for (let k = 1; k < 29; k += 1) if (mod(k * v) === 1) return k;
  throw new Error('Noninvertible denominator in GF29');
}

/** Evaluate P(x), P'(x) simultaneously, input descending coefficients. */
function valueAndDerivative(desc, x) {
  let value = 0;
  let derivative = 0;
  for (const coefficient of desc) {
    derivative = mod(derivative * x + value);
    value = mod(value * x + coefficient);
  }
  return [value, derivative];
}

/** Exact long division in GF(29)[X], preserving every source coefficient slot. */
function divideDescending(desc, divisorAscending) {
  const remaining = desc.slice().reverse().map(mod);
  const quotient = Array(remaining.length - divisorAscending.length + 1).fill(0);
  const leadingInv = inverse(divisorAscending.at(-1));
  for (let j = remaining.length - 1; j >= divisorAscending.length - 1; j -= 1) {
    const q = mod(remaining[j] * leadingInv);
    quotient[j - divisorAscending.length + 1] = q;
    for (let k = 0; k < divisorAscending.length; k += 1) {
      const at = j - divisorAscending.length + 1 + k;
      remaining[at] = mod(remaining[at] - q * divisorAscending[k]);
    }
  }
  return { quotientDescending: quotient.reverse(), remainder: remaining.slice(0, divisorAscending.length - 1) };
}

function convolveAscending(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i += 1) for (let j = 0; j < b.length; j += 1) {
    out[i + j] = mod(out[i + j] + a[i] * b[j]);
  }
  return out;
}

function ioc(a) {
  const freq = Array(29).fill(0);
  for (const x of a) freq[x] += 1;
  return freq.reduce((s, n) => s + n * (n - 1), 0) / (a.length * (a.length - 1));
}

const pages = gp.pages.filter(p => p.page < 56 && p.indices.length > 0);
const table = grid.map(mod);
const p29 = pages.find(p => p.page === 29).indices;
const G = [27, 5, 15];
const rootG = 24;
assert.equal(table.length, 256);
assert.equal(p29.length, 277);
assert.deepEqual(valueAndDerivative(table, rootG), [0, 0]);
assert.deepEqual(valueAndDerivative(p29, rootG), [0, 0]);

const originalRootZero = pages.filter(p => valueAndDerivative(p.indices, rootG)[0] === 0).map(p => p.page);
const originalDoubleZero = pages.filter(p => valueAndDerivative(p.indices, rootG).every(n => n === 0)).map(p => p.page);
assert.deepEqual(originalRootZero, [10, 11, 29, 36]);
assert.deepEqual(originalDoubleZero, [29]);
assert.deepEqual(valueAndDerivative(p29.map(i => gp.prime[i]), rootG), [6, 13]);

const divided = divideDescending(p29, G);
assert.deepEqual(divided.remainder, [0, 0]);
assert.equal(divided.quotientDescending.length, 275);
const recomposed = convolveAscending(divided.quotientDescending.slice().reverse(), G).reverse();
assert.deepEqual(recomposed, p29);
const quotientIoC = ioc(divided.quotientDescending);
assert.ok(Math.abs(quotientIoC - 0.034054412740544125) < 1e-13);
const p57 = gp.pages.find(p => p.page === 57).indices;
const p57IoC = ioc(p57);
assert.ok(p57IoC > quotientIoC + 0.01);

const plantPlain = p57.concat(p57, p57.slice(0, 85)); // 275 native, known-source symbols
assert.equal(plantPlain.length, 275);
const plantCipher = convolveAscending(plantPlain.slice().reverse(), G).reverse();
const plantInverse = divideDescending(plantCipher, G);
assert.deepEqual(plantInverse.remainder, [0, 0]);
assert.deepEqual(plantInverse.quotientDescending, plantPlain);

console.log('Source root x=24, factor G(X)=27+5X+15X^2=15(X-24)^2');
console.log('Only p29 among 55 rune-bearing unknown pages shares the double root');
console.log('Single roots at original pages: ' + originalRootZero.join(', '));
console.log('p29 GF29 prime-weight control f/d: [6,13], not a second exact identity');
console.log('Direct quotient length=275; exact 277-symbol original re-encryption PASS');
console.log('p29 decoded quotient IoC=' + quotientIoC.toFixed(12) + ', solved p57=' + p57IoC.toFixed(12));
console.log('Independent native plaintext G-convolution plant: 275/275 recovered');
console.log('No readable original plaintext inferred by this direct G inverse');
