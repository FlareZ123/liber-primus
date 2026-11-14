'use strict';

/**
 * Original terminal p55/p56/p57 252-rune null-F and 256-cell GF29 H/G gate.
 * Node 22, read only. Execute from the repository root.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const json = (filename) => JSON.parse(fs.readFileSync(path.join(filename), 'utf8'));
const source = json('resources/liber-primus/lp2-corpus.json');
const grid = json('resources/liber-primus/base60-grid.json');
const pg = (n) => source.pages.find((entry) => entry.page === n).indices;
const original = grid.byte_rows.flat();
assert.equal(original.length, 256);
assert.equal(createHash('sha256').update(Buffer.from(original)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

const mod = (n) => (n % 29 + 29) % 29;
const F = [1, 28, 13, 9, 14]; // Monic H_2013*G_p39, highest power first.
/** @param {number[]} coefficients @returns {number[]} */
function divideByF(coefficients) {
  assert.equal(coefficients.length, 256);
  const quotient = [];
  for (let i = 0; i < 252; i += 1) {
    let n = coefficients[i];
    for (let k = 1; k <= 4; k += 1) {
      if (i >= k) n -= F[k] * quotient[i - k];
    }
    quotient.push(mod(n));
  }
  return quotient;
}
/** @param {number[]} data @returns {number[]} */
function multiplyByF(data) {
  assert.equal(data.length, 252);
  const out = Array(256).fill(0);
  for (let i = 0; i < 252; i += 1) {
    for (let k = 0; k <= 4; k += 1) out[i + k] = mod(out[i + k] + data[i] * F[k]);
  }
  return out;
}
const sourceResidues = original.map(mod);
const quotient = divideByF(sourceResidues);
assert.deepEqual(multiplyByF(quotient), sourceResidues);

const p55 = pg(55), p56 = pg(56), p57 = pg(57);
assert.deepEqual([p55.length, p56.length, p57.length], [76, 85, 95]);
const findF = (a) => a.flatMap((v, i) => v === 0 ? [i] : []);
assert.deepEqual(findF(p55), [15, 25, 41]);
assert.deepEqual(findF(p56), [35, 47, 51, 56, 74]);
const p55NoF = p55.filter((value) => value !== 0);
const p56NoSkip = p56.filter((value, index) => index !== 56);
assert.deepEqual([p55NoF.length, p56NoSkip.length, p57.length], [73, 84, 95]);

// Authentic p56 prime-totient rule. Original p56 index56 is the only literal F;
// it does not consume a prime, as independently established on all 85 runes.
const primes = [];
for (let candidate = 2; primes.length < 85; candidate += 1) {
  let isPrime = true;
  for (let f = 2; f * f <= candidate; f += 1) {
    if (candidate % f === 0) { isPrime = false; break; }
  }
  if (isPrime) primes.push(candidate);
}
let counter = 0;
const p56Plain = p56.map((c, index) => index === 56 ? 0 : mod(c - (primes[counter++] - 1)));
assert.equal(counter, 84);
assert.equal(p56Plain.map((v) => source.translit[v]).join(' ').slice(0, 9), 'A N E N D');
assert.deepEqual(findF(p56Plain), [56]);
const p56PlainNoSkip = p56Plain.filter((_, index) => index !== 56);

const spans = [
  {label: 'p55 ciphertext excluding all three F', data: p55NoF, start: 0, matches: 0, bestShift: 6},
  {label: 'p56 ciphertext excluding authenticated F', data: p56NoSkip, start: 73, matches: 4, bestShift: 6},
  {label: 'p56 authentic plaintext excluding F', data: p56PlainNoSkip, start: 73, matches: 1, bestShift: 7},
  {label: 'p57 clear original', data: p57, start: 157, matches: 1, bestShift: 8},
];
for (const item of spans) {
  const observed = quotient.slice(item.start, item.start + item.data.length);
  assert.equal(observed.length, item.data.length);
  const exact = observed.filter((x, i) => x === item.data[i]).length;
  const counts = Array.from({length: 29}, (_, d) =>
    observed.filter((x, i) => mod(x + d) === item.data[i]).length);
  assert.equal(exact, item.matches);
  assert.equal(Math.max(...counts), item.bestShift);
  item.matches = exact;
}
// A true 252-symbol source-native planted GP message would encode and recover
// exactly, with the same fixed four coefficients and byte length.
const plant = [...p55NoF, ...p56PlainNoSkip, ...p57];
assert.equal(plant.length, 252);
assert.deepEqual(divideByF(multiplyByF(plant)), plant);

console.log(JSON.stringify({
  sourceTable: 'LP2 p49-p51 256 numeric cells', factor: F,
  quotientLength: quotient.length,
  terminalClock: {p55NoF: 73, p56NoLiteralF: 84, p57Clear: 95, total: 252},
  observed: spans.map(({label, start, matches, bestShift, data}) =>
    ({label, start, length: data.length, exactMatches: matches, bestCaesarMatches: bestShift})),
  sourceCodewordReconstructed: true, positivePlantRecovered: true,
}, null, 2));
