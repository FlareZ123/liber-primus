'use strict';
/**
 * Source-locked F29 weighted ternary zeta/Möbius original-LP2 inversion.
 * Run: node sims/lp2_ternary_spiral_weighted_zeta_inverse.cjs
 * Native inputs: 6561 first LP2 runes, solved LP1 p15 Fibonacci-prime
 * square, 6561 genuine Latin Vulgate GP runes as an independent control.
 * Node 22+, CommonJS. This is a finite direct-register candidate, not
 * an established historical encryption.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { latinSource, ioc } = require('./lp2_ternary_mobius_zeta_inverse.cjs');

const N = 6561, M = 29;
const source = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources/liber-primus/lp2-corpus.json'), 'utf8'
));
const original = source.pages.filter(p => p.page < 56)
  .flatMap(p => p.indices).slice(0, N);
assert.equal(original.length, N);

/** @param {number} x @returns {number} */
const mod = x => ((x % M) + M) % M;

const spiralValues = [
  3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222,
  3152, 3038, 2838, 2472, 1820, 708, 1206, 4516
];
const spiralPrimes = [
  2, 3, 5, 7, 13, 23, 43, 79,
  149, 263, 463, 829, 1481, 2593, 4507, 7817
];
const printed = [
  3258, 3222, 3152, 3038,
  3278, 3299, 3298, 2838,
  3288, 3294, 3296, 2472,
  4516, 1206, 708, 1820
];
const streams = {
  spiral_values: spiralValues,
  spiral_primes: spiralPrimes,
  row_values: printed,
  row_primes: printed.map(x => x < 3301 ? 3301 - x : 3301 + x)
};

/**
 * Traverse eight ternary coordinate axes. The two directed edge weights
 * on axis j are s*key[2*j], s*key[2*j+1] in F29.
 *
 * For normal 0<1<2, zeta maps (x,y,z) to
 * (x, y+a*x, z+b*y+a*b*x). Möbius is its inverse.
 * Reverse uses the same three-element chain traversed 2<1<0.
 *
 * @param {number[]} input
 * @param {number[]} weights
 * @param {number} mask 8-bit direction mask on the ternary axes
 * @param {1|-1} direction +1 zeta, -1 Möbius
 * @param {1|-1} sign common source-weight sign
 * @returns {number[]}
 */
function transform(input, weights, mask, direction, sign) {
  assert.equal(input.length, N);
  assert.equal(weights.length, 16);
  assert(direction === 1 || direction === -1);
  assert(sign === 1 || sign === -1);
  const out = input.slice();
  for (let axis = 0, stride = 1; axis < 8; axis++, stride *= 3) {
    const a = mod(weights[2 * axis] * sign);
    const b = mod(weights[2 * axis + 1] * sign);
    const reverse = (mask >>> axis) & 1;
    for (let base = 0; base < N; base += 3 * stride) {
      for (let off = 0; off < stride; off++) {
        const i = base + off, j = i + stride, k = j + stride;
        const x = out[i], y = out[j], z = out[k];
        if (direction === -1) {
          if (reverse) {
            out[i] = mod(x - a * y);
            out[j] = mod(y - b * z);
          } else {
            out[j] = mod(y - a * x);
            out[k] = mod(z - b * y);
          }
        } else if (reverse) {
          out[j] = mod(y + b * z);
          out[i] = mod(x + a * y + a * b * z);
        } else {
          out[j] = mod(y + a * x);
          out[k] = mod(z + b * y + a * b * x);
        }
      }
    }
  }
  return out;
}

/**
 * Enumerate 4 source readouts x two signs x two directions x 256 masks.
 * Model choice is scored solely by global GP rune index of coincidence;
 * unknown global GP alphabet relabeling leaves this score invariant.
 * @param {number[]} sample
 * @returns {{best:{name:string,sign:number,direction:number,mask:number,ioc:number}, numberAbove05:number}}
 */
function scan(sample) {
  let best = { name: '', sign: 0, direction: 0, mask: 0, ioc: -1 };
  let numberAbove05 = 0;
  for (const [name, key] of Object.entries(streams)) {
    for (const sign of [-1, 1]) {
      for (const direction of [-1, 1]) {
        for (let mask = 0; mask < 256; mask++) {
          const score = ioc(transform(sample, key, mask, direction, sign));
          if (score > 0.05) numberAbove05++;
          if (score > best.ioc) {
            best = { name, sign, direction, mask, ioc: score };
          }
        }
      }
    }
  }
  return { best, numberAbove05 };
}

function main() {
  const originalResult = scan(original);
  const latin = latinSource();
  assert.equal(latin.length, N);
  const secret = { name: 'spiral_values', sign: 1, mask: 87 };
  const encrypted = transform(latin, streams[secret.name], secret.mask, 1, secret.sign);
  const plantResult = scan(encrypted);
  const decoded = transform(
    encrypted, streams[secret.name], secret.mask, -1, secret.sign
  );
  assert.deepEqual(decoded, latin);
  const reencrypted = transform(
    decoded, streams[secret.name], secret.mask, 1, secret.sign
  );
  assert.deepEqual(reencrypted, encrypted);
  assert.deepEqual(
    {
      name: plantResult.best.name, sign: plantResult.best.sign,
      direction: plantResult.best.direction, mask: plantResult.best.mask
    },
    { name: secret.name, sign: 1, direction: -1, mask: secret.mask }
  );
  assert.equal(plantResult.numberAbove05, 1);
  assert(Math.abs(originalResult.best.ioc - 0.03465145110984717) < 1e-12);
  assert(Math.abs(plantResult.best.ioc - 0.07503057609451266) < 1e-12);
  console.log(JSON.stringify({
    experiment: 'source p15 Fibonacci-spiral ternary incidence algebra',
    physical_pages: 'LP2 first 6561 runes',
    originalRawIoc: ioc(original),
    configurations: 4096,
    original: originalResult,
    planted: {
      originalLatinIoc: ioc(latin), recovered: plantResult,
      correctOriginalGpRunes: decoded.filter((v, i) => v === latin[i]).length,
      recoveredSingleBestModel: true,
      exactReencryption: true
    }
  }, null, 2));
}

if (require.main === module) main();
module.exports = { streams, transform, scan };
