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
  {label: 'p55 ciphertext excluding all three F', data: p55NoF, start: 0, matches: 0, bestShift: 6, witness: [3, 9, 17, 10, 15], pairWitness: [8, 18, 20, 13, 19, 5]},
  {label: 'p56 ciphertext excluding authenticated F', data: p56NoSkip, start: 73, matches: 4, bestShift: 6, witness: [8, 9, 13, 3, 8], pairWitness: [34, 35, 5, 5, 5, 0]},
  {label: 'p56 authentic plaintext excluding F', data: p56PlainNoSkip, start: 73, matches: 1, bestShift: 7, witness: [8, 9, 13, 10, 9], pairWitness: [34, 35, 5, 5, 2, 24]},
  {label: 'p57 clear original', data: p57, start: 157, matches: 1, bestShift: 8, witness: [3, 9, 12, 24, 5], pairWitness: [5, 37, 10, 26, 20, 7]},
];
for (const item of spans) {
  const observed = quotient.slice(item.start, item.start + item.data.length);
  assert.equal(observed.length, item.data.length);
  const exact = observed.filter((x, i) => x === item.data[i]).length;
  const counts = Array.from({length: 29}, (_, d) =>
    observed.filter((x, i) => mod(x + d) === item.data[i]).length);
  assert.equal(exact, item.matches);
  assert.equal(Math.max(...counts), item.bestShift);
  // All-secret necessary-condition test: even an arbitrary stationary
  // (possibly noninjective) 29-entry symbol function must preserve equality.
  /** @type {Map<number, {i:number,output:number}>} */
  const symbolRule = new Map();
  /** @type {number[] | null} */
  let firstConflict = null;
  for (let i = 0; i < observed.length; i += 1) {
    const q = observed[i];
    const previous = symbolRule.get(q);
    if (previous && previous.output !== item.data[i]) {
      firstConflict = [previous.i, i, q, previous.output, item.data[i]];
      break;
    }
    if (!previous) symbolRule.set(q, {i, output: item.data[i]});
  }
  assert.deepEqual(firstConflict, item.witness);
  // A first-order state-less local transducer with one position of source
  // memory must map each pair [Q[i-1],Q[i]] to one fixed output symbol.
  /** @type {Map<string, {i:number,output:number}>} */
  const pairRule = new Map();
  /** @type {number[] | null} */
  let firstPairConflict = null;
  for (let i = 1; i < observed.length; i += 1) {
    const key = observed[i - 1] + ',' + observed[i];
    const previous = pairRule.get(key);
    if (previous && previous.output !== item.data[i]) {
      firstPairConflict = [
        previous.i, i, observed[i - 1], observed[i],
        previous.output, item.data[i]
      ];
      break;
    }
    if (!previous) pairRule.set(key, {i, output: item.data[i]});
  }
  assert.deepEqual(firstPairConflict, item.pairWitness);
  item.matches = exact;
}
// A competing four-check reading keeps all 256 terminal glyph positions and
// treats exactly the three original p55 F glyphs plus the authenticated
// p56 literal F as four GF29 erasures in the source table's degree-4 code.
// Solve their values *uniquely*, without tuning output words or ciphertext.
const erasurePositions = [15, 25, 41, 76 + 56];
const polyFAscending = F.slice().reverse();
/** @param {number[]} descending */
function modFactor(descending) {
  const a = descending.slice().reverse().map(mod);
  for (let k = a.length - 1; k >= 4; k -= 1) {
    const q = a[k];
    for (let j = 0; j < 5; j += 1) {
      a[k - 4 + j] = mod(a[k - 4 + j] - q * polyFAscending[j]);
    }
  }
  return a.slice(0, 4);
}
const syndromeColumns = erasurePositions.map((position) =>
  modFactor(Array.from({length: 256}, (_, i) => +(i === position))));
assert.deepEqual(syndromeColumns,
  [[19,26,24,0],[8,18,12,12],[16,4,5,2],[20,24,0,0]]);
/** @param {number} x */
function inverse29(x) {
  for (let i = 1; i < 29; i += 1) if (mod(i*x) === 1) return i;
  throw Error('not invertible');
}
/** @param {number[][]} matrix @param {number[]} rhs */
function solve4(matrix, rhs) {
  const a = matrix.map((row, i) => [...row, rhs[i]]);
  for (let c = 0; c < 4; c += 1) {
    let row = c;
    while (row < 4 && a[row][c] === 0) row += 1;
    assert.ok(row < 4);
    [a[c], a[row]] = [a[row], a[c]];
    const scale = inverse29(a[c][c]);
    for (let j = c; j <= 4; j += 1) a[c][j] = mod(a[c][j] * scale);
    for (let i = 0; i < 4; i += 1) if (i !== c) {
      const factor = a[i][c];
      for (let j = c; j <= 4; j += 1) a[i][j] = mod(a[i][j] - factor*a[c][j]);
    }
  }
  return a.map((row) => row[4]);
}
const erasureTests = [
  {label:'p56 printed ciphertext', terminal:[...p55,...p56,...p57], expected:[15,20,9,27]},
  {label:'p56 authenticated plaintext', terminal:[...p55,...p56Plain,...p57], expected:[6,19,28,20]},
];
for (const test of erasureTests) {
  const erased = test.terminal.slice();
  for (const position of erasurePositions) erased[position] = 0;
  const syndrome = modFactor(erased);
  const rhs = syndrome.map((value) => mod(-value));
  const matrix = Array.from({length:4}, (_, i) =>
    syndromeColumns.map((column) => column[i]));
  const answer = solve4(matrix, rhs);
  assert.deepEqual(answer, test.expected);
  const corrected = test.terminal.slice();
  erasurePositions.forEach((position, i) => {corrected[position] = answer[i];});
  assert.deepEqual(modFactor(corrected), [0,0,0,0]);
  assert.notEqual(answer[3], 0); // Known p56 literal F must remain rune0.
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
  observed: spans.map(({label, start, matches, bestShift, data, witness, pairWitness}) =>
    ({label, start, length: data.length, exactMatches: matches, bestCaesarMatches: bestShift, allSecretFunctionConflict: witness, allSecretPairConflict: pairWitness})),
  sourceCodewordReconstructed: true, positivePlantRecovered: true,
  erasurePositions,
  erasureTests: erasureTests.map(({label, expected}) => ({label, recoveredGP: expected})),
}, null, 2));
