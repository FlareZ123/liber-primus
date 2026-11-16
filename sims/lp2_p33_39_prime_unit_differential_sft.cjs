'use strict';

/**
 * Original-input bounded GP29 prime-unit difference cipher test.
 *
 * The 2013 prime_echo script first-party displays all 464 primes through
 * 3301 and pauses at 1033, 3301. The original p15 matrix highlights 3299.
 * Hypothesis, NOT an authenticated LP2 instruction:
 *   C_j = (C_(j-1) + (p_j mod 29) * P_j) mod 29,
 * with p_j=1033,...,3299 reset at p33[91] and each p34...p39 start.
 * Explicit predecessor at page boundary is prior original ciphertext.
 *
 * Read-only Windows Node22 CommonJS single-file test; no network required.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
/** @param {string} file */
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const script = read('resources/historical/cicada2013-os-original-prime-echo.sh');
const control = JSON.parse(read('resources/control/beowulf_oe_gp_profile_corrected.json'));
const primes = [...script.matchAll(/echo(?: -n)?\s+"(\d+)[^"]*"/g)].map(match => Number(match[1]));
assert.equal(primes.length, 464);
assert.deepEqual([primes[173], primes[462], primes[463]], [1033, 3299, 3301]);
const interval = primes.slice(173, 463);
assert.equal(interval.length, 290);
assert(interval.every(prime => prime % 29 !== 0));

/** @param {number} n */
const mod29 = n => ((n % 29) + 29) % 29;
/** @param {number} x */
const inverse = x => {
  for (let y = 1; y < 29; y++) {
    if (mod29(x * y) === 1) return y;
  }
  throw new Error('Non-unit multiplier ' + x);
};
/** @param {number[]} data */
const coincidence = data => {
  const counts = new Array(29).fill(0);
  for (const x of data) counts[x]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (data.length * (data.length - 1));
};
/** @param {number[]} data */
const roman = data => data.map(i => corpus.translit[i]).join('');
/** @param {number[]} data @param {number} prev */
function decode(data, prev) {
  return data.map((c, i) => mod29((c - (i === 0 ? prev : data[i - 1])) * inverse(interval[i] % 29)));
}
/** @param {number[]} data @param {number} prev */
function encode(data, prev) {
  const output = [];
  for (let i = 0; i < data.length; i++) {
    output.push(mod29((i === 0 ? prev : output[i - 1]) + (interval[i] % 29) * data[i]));
  }
  return output;
}
const pages = corpus.pages.filter(p => p.page >= 33 && p.page <= 39);
assert.deepEqual(pages.map(p => p.indices.length), [214, 261, 271, 238, 228, 228, 240]);
const sizes = [123, 261, 271, 238, 228, 228, 240];
const decoded = [];
const report = [];
const originalSegments = [];
let previousCipher = pages[0].indices[90];
const plain57 = corpus.pages.find(p => p.page === 57).indices;
assert.equal(plain57.length, 95);
assert.equal(plain57.filter(x => x === 0).length, 3);
let nativePlantChecks = 0;
for (let k = 0; k < pages.length; k++) {
  const original = k === 0 ? pages[k].indices.slice(91) : pages[k].indices;
  assert.equal(original.length, sizes[k]);
  assert(original.length <= interval.length);
  const plain = decode(original, previousCipher);
  assert.deepEqual(encode(plain, previousCipher), original);
  const nativePlain = Array.from({ length: original.length }, (_, i) => plain57[i % plain57.length]);
  const plantedCipher = encode(nativePlain, previousCipher);
  assert.deepEqual(decode(plantedCipher, previousCipher), nativePlain);
  const wrong = plantedCipher.map((c, i) => mod29((c - (i === 0 ? previousCipher : plantedCipher[i - 1])) * inverse(interval[(i + 1) % interval.length] % 29)));
  assert.notDeepEqual(wrong, nativePlain);
  nativePlantChecks++;
  report.push({
    physicalPage: pages[k].page,
    sourceRunes: original.length,
    sourceFirst: roman(original.slice(0, 12)),
    inverseFirst: roman(plain.slice(0, 35)),
    inverseIc: Number(coincidence(plain).toFixed(8)),
    inverseF: plain.filter(x => x === 0).length,
  });
  originalSegments.push(...original);
  decoded.push(...plain);
  previousCipher = pages[k].indices.at(-1);
}
assert.equal(decoded.length, 1589);
assert.equal(decoded.filter(x => x === 0).length, 12);
assert.equal(nativePlantChecks, 7);
const beowulfF = control.allGpCounts[0] / control.allSourceGpRunes;
const native57F = plain57.filter(x => x === 0).length / plain57.length;
console.log(JSON.stringify({
  model: 'C=(previous C + (source prime mod29)*P) mod29; prime reset at each original page',
  interval: [interval.length, interval[0], interval.at(-1)],
  originalCipherRunes: originalSegments.length,
  originalIc: coincidence(originalSegments),
  inverseIc: coincidence(decoded),
  originalCipherAdjacentEquals: decoded.filter(x => x === 0).length,
  forcedInverseF: decoded.filter(x => x === 0).length,
  independentPlainFReferenceRates: { beowulf: beowulfF, solvedP57: native57F },
  nativeSourceEnglishPlantChecks: nativePlantChecks,
  fullReencryptMatchesOriginal: true,
  perPage: report,
  result: 'original inverse remains nonprose; no source selects this differential operation'
}, null, 2));
