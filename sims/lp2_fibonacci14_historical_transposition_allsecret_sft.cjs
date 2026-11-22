'use strict';

/**
 * Original-input SFT: p15 Fibonacci modulo GP29 has period 14, coinciding
 * with the recovered 2014 14-position Cicada transposition. Exclude the
 * full shared 14-phase bijective native-GP cipher family without guessing a key.
 * This file is read-only; run with Node.js 22 on Windows or any supported OS.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const GP29 = ['F', 'U', 'TH', 'O', 'R', 'C', 'G', 'W', 'H', 'N', 'I', 'J', 'EO', 'P', 'X', 'S', 'T', 'B', 'E', 'M', 'L', 'NG', 'OE', 'D', 'A', 'AE', 'Y', 'IA', 'EA'];
const GPINDEX = new Map(GP29.map((rune, index) => [rune, index]));
const ORDER = [2, 8, 9, 1, 12, 13, 11, 4, 5, 7, 3, 0, 6, 10];
const PERIOD = 14;
const MOD = 29;
const SOURCE = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const PAGES = SOURCE.pages.filter(page => page.page >= 15 && page.page <= 22).map(page => page.indices);
const ORIGINAL = PAGES.flat();
assert.deepEqual(PAGES.map(page => page.length), [159, 267, 273, 260, 271, 269, 273, 131]);
assert.equal(ORIGINAL.length, 1903);
assert.deepEqual(SOURCE.translit, GP29);

/**
 * Apply the original 2014 14-position row permutation, retaining a partial tail.
 * @param {Array<number|string>} input
 * @param {boolean} inverse
 * @returns {Array<number|string>}
 */
function permute14(input, inverse = false) {
  const output = input.slice();
  for (let offset = 0; offset + PERIOD <= input.length; offset += PERIOD) {
    for (let i = 0; i < PERIOD; i++) {
      output[offset + i] = input[offset + (inverse ? ORDER.indexOf(i) : ORDER[i])];
    }
  }
  return output;
}

const original2014 = 'IDGTKUMLOOARWOERTHISUTETLHUTIATSLLOUIMNITELNJ7TFYVOIUAUSNOCO5JI4MEODZZ';
const known2014 = 'GOODWORKULTIMATETRUTHISTHEULTIMATEILLUSIONJOINUSATFV7LYUCMEOZZD5J4ONIO';
assert.equal(permute14([...original2014]).join(''), known2014);
assert.equal(permute14([...known2014], true).join(''), original2014);

/**
 * Split a continuous 1903-rune vector on authentic physical page boundaries.
 * @param {number[]} input
 * @returns {number[][]}
 */
function splitOnPages(input) {
  let offset = 0;
  return PAGES.map(page => {
    const result = input.slice(offset, offset + page.length);
    offset += page.length;
    return result;
  });
}

/**
 * Exhaustive maximum count of one plaintext rune attainable under independent
 * arbitrary bijective symbol substitutions on each of 14 clock phases.
 * @param {number[][]} groups Each group starts a fresh key phase.
 * @returns {number}
 */
function capacity(groups) {
  const bins = Array.from({length: PERIOD}, () => Array(MOD).fill(0));
  for (const group of groups) {
    group.forEach((symbol, offset) => { bins[offset % PERIOD][symbol]++; });
  }
  return bins.reduce((sum, histogram) => sum + Math.max(...histogram), 0);
}

/**
 * Group original rune data after an optional original historical permutation.
 * @param {'none'|'chapter'|'page'} transposition
 * @param {boolean} inverse
 * @returns {number[][]}
 */
function sourceVariant(transposition, inverse) {
  if (transposition === 'chapter') {
    return splitOnPages(permute14(ORIGINAL, inverse));
  }
  if (transposition === 'page') {
    return PAGES.map(page => permute14(page, inverse));
  }
  return PAGES.map(page => page.slice());
}

const bounds = [];
for (const transposition of ['none', 'chapter', 'page']) {
  for (const inverse of (transposition === 'none' ? [false] : [false, true])) {
    const pages = sourceVariant(transposition, inverse);
    for (const clock of ['chapter', 'page']) {
      bounds.push({
        transposition, inverse, clock,
        maxCopiesOfAnyPlaintextRune: capacity(clock === 'chapter' ? [pages.flat()] : pages),
      });
    }
  }
}
assert.deepEqual(
  bounds.map(row => row.maxCopiesOfAnyPlaintextRune).sort((a, b) => a - b),
  [129, 130, 130, 131, 131, 132, 132, 133, 133, 133],
);
const worstBound = Math.max(...bounds.map(row => row.maxCopiesOfAnyPlaintextRune));
assert.equal(worstBound, 133);
const independentPerPageBound = PAGES.reduce((sum, page) => sum + capacity([page]), 0);
assert.equal(independentPerPageBound, 275);

/**
 * Encode English text into the public GP29 orthography with word-local digraphs.
 * @param {string} source
 * @returns {number[]}
 */
function encodeEnglish(source) {
  const output = [];
  const words = source.toUpperCase().replace(/V/g, 'U').replace(/[QK]/g, 'C').replace(/Z/g, 'S').match(/[A-Z]+/g) || [];
  for (const originalWord of words) {
    const word = originalWord.replace(/ING/g, 'NG').replace(/IO/g, 'IA');
    for (let i = 0; i < word.length;) {
      const token = [3, 2, 1].map(length => word.slice(i, i + length)).find(part => GPINDEX.has(part));
      if (token) {
        output.push(GPINDEX.get(token));
        i += token.length;
      } else {
        i++;
      }
    }
  }
  return output;
}

/**
 * Find the smallest modal-rune count over every complete source-length window.
 * This tests all windows, without choosing a flattering reference excerpt.
 * @param {number[]} sequence
 * @param {number} length
 * @returns {{windows:number,minPeak:number,minPosition:number}}
 */
function scanSource(sequence, length) {
  assert.ok(sequence.length >= length);
  const counts = Array(MOD).fill(0);
  for (let i = 0; i < length; i++) counts[sequence[i]]++;
  let minimum = length;
  let minimumIndex = 0;
  for (let i = 0; i <= sequence.length - length; i++) {
    const peak = Math.max(...counts);
    if (peak < minimum) {
      minimum = peak;
      minimumIndex = i;
    }
    if (i + length < sequence.length) {
      counts[sequence[i]]--;
      counts[sequence[i + length]]++;
    }
  }
  return { windows: sequence.length - length + 1, minPeak: minimum, minPosition: minimumIndex };
}

const controls = {};
let shakespeare = [];
for (const [label, filename] of [
  ['Shakespeare', 'shakespeare_first300k.txt'],
  ['Emerson', 'emerson_essays_2944.txt'],
  ['Gibran', 'gibran_prophet_58585.txt'],
]) {
  const source = fs.readFileSync(path.join(ROOT, 'resources/control', filename), 'utf8');
  const encoded = encodeEnglish(source);
  if (label === 'Shakespeare') shakespeare = encoded;
  controls[label] = { runes: encoded.length, ...scanSource(encoded, ORIGINAL.length) };
  assert.ok(controls[label].minPeak > worstBound, label + ' ordinary GP text must exceed all-secret original capacity');
}
const vulgateFile = fs.readFileSync(path.join(ROOT, 'resources/control/latin-vulgate-gp-wholewords.txt'), 'utf8');
const vulgate = vulgateFile.split(/\r?\n/).filter(line => /^[0-9A-S]+$/.test(line)).join('').split('').map(symbol => Number.parseInt(symbol, 36));
controls.Vulgate = { runes: vulgate.length, ...scanSource(vulgate, ORIGINAL.length) };
assert.ok(controls.Vulgate.minPeak > worstBound);

/** @param {number} value @returns {number} */
function mod29(value) { return ((value % MOD) + MOD) % MOD; }

const fib = [0, 1];
while (fib.length < 2 * PERIOD) fib.push(mod29(fib[fib.length - 1] + fib[fib.length - 2]));
assert.deepEqual(fib.slice(0, PERIOD), fib.slice(PERIOD, 2 * PERIOD));
assert.deepEqual(fib.slice(0, PERIOD), [0, 1, 1, 2, 3, 5, 8, 13, 21, 5, 26, 2, 28, 1]);

const plant = shakespeare.slice(0, ORIGINAL.length);
const plantChecks = [];
for (const clock of ['chapter', 'page']) {
  const groups = clock === 'chapter' ? [plant] : splitOnPages(plant);
  const masked = groups.map(group => group.map((symbol, i) => mod29(7 * symbol + 3 + 5 * (i % PERIOD))));
  const historicalCipher = masked.map(group => permute14(group));
  const restoredCipher = historicalCipher.map(group => permute14(group, true));
  const recovered = restoredCipher.map(group => group.map((symbol, i) => mod29(25 * (symbol - 3 - 5 * (i % PERIOD))))).flat();
  assert.deepEqual(recovered, plant);
  assert.equal(capacity(groups), capacity(restoredCipher));
  plantChecks.push({clock, recovered: recovered.length, sourceModalCapacity: capacity(groups)});
}

console.log(JSON.stringify({
  decision: 'No shared 14-phase GP29 bijection plus original 14-column permutation yields native source-English on LP2 pp15-22',
  source: 'physical pages p15-p22 (1903 original unmodified runes)',
  p15FibonacciModulo29Period: PERIOD,
  historical2014Positive: '70/70',
  allSecretVariants: bounds,
  mostPermissiveSharedKeyCeiling: worstBound,
  independentPageAlphabetsUpperBound: independentPerPageBound,
  referenceCompleteWindowControls: controls,
  exactPlantedInverses: plantChecks,
}, null, 2));
