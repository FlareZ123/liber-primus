'use strict';

/**
 * Fixed 2016 Cicada clear-signed text versus all original LP2 ciphertext
 * word-length starts, with a source-preserving, whole-word insertion screen.
 * GP tokenization and original word breaks are the only normalization.
 * This tests a retrospective crib and DOES NOT claim recovered plaintext.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const sourceRaw = read('resources/historical/cicada2016-4gq25-outguess.asc');
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const signedText = sourceRaw.split(/\r?\n\r?\n/).slice(1).join('\n\n')
  .split('-----BEGIN PGP SIGNATURE-----')[0];
const alphabetic = (signedText.match(/[A-Za-z0-9]+/g) || [])
  .filter((token) => /^[A-Za-z]+$/.test(token));
const digraphs = new Set(['TH', 'EO', 'NG', 'OE', 'AE', 'IA', 'EA']);

/** Official GP normalization: V=U, K/Q=C, Z=S, ING=NG.
 * @param {string} input @returns {number} */
function gpLength(input) {
  const word = input.toUpperCase().replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  let count = 0;
  for (let i = 0; i < word.length;) {
    if (word.slice(i, i + 3) === 'ING') i += 3;
    else if (digraphs.has(word.slice(i, i + 2))) i += 2;
    else i++;
    count++;
  }
  return count;
}
assert.equal(alphabetic.length, 43);
const source = alphabetic.map(gpLength);
const rune = /[\u16A0-\u16FF]/u;

/** @param {string} input @returns {{words:string[],pages:number[]}} */
function originalWords(input) {
  const words = [], pages = [];
  let word = '', currentPage = 0, firstPage = 0;
  for (const ch of input.split('%').slice(0, 55).join('%')) {
    if (rune.test(ch)) {
      if (!word) firstPage = currentPage;
      word += ch;
    } else if (ch === '%') {
      currentPage++;
    } else if (ch === '/' || /\s/u.test(ch)) {
      continue;
    } else if (word) {
      words.push(word); pages.push(firstPage); word = '';
    }
  }
  if (word) { words.push(word); pages.push(firstPage); }
  return {words, pages};
}
const {words, pages} = originalWords(transcription);
const lengths = words.map((word) => [...word].length);
assert.equal(words.length, 2896);
assert.equal(lengths.reduce((a, b) => a + b, 0), 12956);
const PAGE_RUNS = [];
for (let i = 0; i < pages.length; i++) {
  const previous = PAGE_RUNS.at(-1);
  if (!previous || previous.page !== pages[i]) {
    PAGE_RUNS.push({page: pages[i], start: i, end: i + 1});
  } else previous.end = i + 1;
}
assert.equal(PAGE_RUNS.length, 55);

/** Exact DP longest compatible source substring anywhere in original text.
 * There are no fitted word substitutions, alignments or source offsets.
 * @param {number[]} target @param {0|1|-1} sign
 * @returns {{length:number,target:number,source:number}} */
function longest(target, sign) {
  const n = target.length, previous = new Uint16Array(n + 1);
  let prev = previous, current = new Uint16Array(n + 1);
  let found = {length: 0, target: -1, source: -1};
  for (let j = 0; j < source.length; j++) {
    const v = source[j];
    for (let i = 0; i < n; i++) {
      const x = target[i], compatible = sign === 0 ? x === v
        : (x === v || x === v + sign);
      const matched = compatible ? prev[i] + 1 : 0;
      current[i + 1] = matched;
      if (matched > found.length) {
        found = {length: matched, target: i + 1 - matched,
          source: j + 1 - matched};
      }
    }
    const temp = prev; prev = current; current = temp;
  }
  return found;
}
const signs = /** @type {Array<0|1|-1>} */ ([0, 1, -1]);
const original = signs.map((sign) => longest(lengths, sign));
assert.deepEqual(original, [
  {length: 6, target: 2024, source: 16},
  {length: 13, target: 1594, source: 16},
  {length: 9, target: 223, source: 19},
]);
assert.equal(pages[1594], 29);
assert.equal(alphabetic.slice(16, 29).join(' ').toUpperCase(),
  'ARE THE MAP THEIR MEANING IS THE ROAD AND THEIR NUMBERS ARE THE');
// The original next ciphertext word is short, so the distinctive word
// "DIRECTION" (GP length 9) cannot extend the 13-word match.
assert.equal(alphabetic[29].toUpperCase(), 'DIRECTION');
assert.equal(source[29], 9);
assert.equal(lengths[1607], 3);

// The no-extra-rune word THEIR is four distinct source GP symbols; its
// original candidate has an exact repeated ciphertext glyph. This rules
// out a single injective monoalphabetic substitution for this crib.
assert.equal(alphabetic[19].toUpperCase(), 'THEIR');
const candidateTheir = [...words[1597]].map((r) => corpus.runes.indexOf(r));
assert.deepEqual(candidateTheir, [17, 12, 12, 4]);
const allDistinctPlain = new Set([2, 18, 10, 4]);
assert.equal(allDistinctPlain.size, 4);
assert.equal(new Set(candidateTheir).size, 3);
console.log('ORIGINAL ' + JSON.stringify(original));

let seed = 761;
/** @returns {number} */
function random32() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed;
}
/** @param {'all'|'page'} mode @returns {number[]} */
function shuffled(mode) {
  const out = lengths.slice();
  const partitions = mode === 'all' ? [{start: 0, end: out.length}] : PAGE_RUNS;
  for (const {start, end} of partitions) {
    for (let i = end - 1; i > start; i--) {
      const j = start + random32() % (i - start + 1);
      const temp = out[i]; out[i] = out[j]; out[j] = temp;
    }
  }
  return out;
}
const start = Date.now();
for (const mode of /** @type {Array<'all'|'page'>} */ (['all', 'page'])) {
  const count = [0, 0, 0], min = [99, 99, 99], max = [0, 0, 0];
  const trials = [[], [], []];
  for (let repetition = 0; repetition < 512; repetition++) {
    const control = shuffled(mode);
    for (let k = 0; k < signs.length; k++) {
      const x = longest(control, signs[k]).length;
      trials[k].push(x);
      if (x >= original[k].length) count[k]++;
      if (x < min[k]) min[k] = x;
      if (x > max[k]) max[k] = x;
    }
  }
  const medians = trials.map((a) => a.sort((a, b) => a - b)[256]);
  assert.deepEqual(count, mode === 'all' ? [414, 12, 353] : [407, 8, 350]);
  console.log(mode.toUpperCase() + ' NULL ' +
    JSON.stringify(signs.map((sign, k) => ({sign, observed: original[k].length,
      median: medians[k], min: min[k], max: max[k],
      controlsAtLeast: count[k], trials: 512}))));
}
console.log('PASS signed2016 43 original source words, 2896 original target words,'
  + ' exact page29 match geometry and 1024×3 conditional controls, elapsed_ms='
  + (Date.now() - start));
