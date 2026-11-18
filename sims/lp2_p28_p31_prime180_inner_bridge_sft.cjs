'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { buildSourceNativeTrigramModel } = require('./lp1_source_native_trigram_model.cjs');

const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const referenceText = read('resources/transcriptions/lp1_wulfic_canonical.txt');
const model = buildSourceNativeTrigramModel({ corpus, referenceText });

/** @param {number} n @returns {boolean} */
function isPrime(n) {
  if (n < 2) return false;
  for (let divisor = 2; divisor * divisor <= n; divisor++) {
    if (n % divisor === 0) return false;
  }
  return true;
}

/** @param {number} n @returns {number} */
function primePi(n) {
  let count = 0;
  for (let value = 2; value <= n; value++) if (isPrime(value)) count++;
  return count;
}

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

const pages = corpus.pages.filter((page) => page.page <= 55);
const blockPages = pages.filter((page) => page.page >= 28 && page.page <= 31);
assert.deepEqual(blockPages.map((page) => page.indices.length), [269, 277, 263, 269]);
assert.ok(blockPages.every((page) => isPrime(page.indices.length)));

const blocks = transcription.split(/\r?\n%\r?\n/);
const runeSet = new Set(corpus.runes);
/** @param {number} page @returns {string} */
function pageText(page) {
  if (page === 50) return '';
  return blocks[page > 50 ? page - 1 : page];
}

/** @param {number} page @returns {{periods:number,lines:number}} */
function layout(page) {
  const source = pageText(page);
  let periods = 0;
  for (const ch of Array.from(source)) if (ch === '.') periods++;
  const lines = source.split(/\r?\n/).filter((line) => line.endsWith('/')).length;
  return { periods, lines };
}

assert.deepEqual(blockPages.map((page) => layout(page.page).periods), [3, 4, 5, 6]);
assert.deepEqual(blockPages.map((page) => layout(page.page).lines), [12, 12, 12, 12]);

const exact3456Starts = [];
for (let start = 0; start <= 52; start++) {
  const periodVector = [0, 1, 2, 3].map((delta) => layout(start + delta).periods);
  if (periodVector.join(',') === '3,4,5,6') exact3456Starts.push(start);
}
assert.deepEqual(exact3456Starts, [28]);

const sourceBlock = blockPages.flatMap((page) => page.indices);
assert.equal(sourceBlock.length, 1078);
assert.equal(primePi(sourceBlock.length), 180);

const primePositions = [];
const primeTape = [];
for (let position = 1; position <= sourceBlock.length; position++) {
  if (!isPrime(position)) continue;
  primePositions.push(position);
  primeTape.push(sourceBlock[position - 1]);
}
assert.equal(primeTape.length, 180);
assert.equal(primePositions.at(-1), 1069);

const tokens = grid.pages.flatMap((page) => page.tokens);
const bytes60 = grid.bytes;
const innerAddresses = [];
for (let row = 1; row < 31; row++) {
  for (let column = 1; column < 7; column++) innerAddresses.push(row * 8 + column);
}
assert.equal(innerAddresses.length, 180);

const a59 = grid.alphabet.replace('f', '');
/** @param {string} token @returns {number} */
function base59(token) {
  const hi = a59.indexOf(token[0]);
  const lo = a59.indexOf(token[1]);
  assert.ok(hi >= 0 && lo >= 0);
  return hi * 59 + lo;
}

const inner60 = innerAddresses.map((address) => bytes60[address]);
const inner59 = innerAddresses.map((address) => base59(tokens[address]));
const exactResidueMatches = (values) => primeTape.filter(
  (rune, index) => rune === mod29(values[index])
).length;
assert.equal(exactResidueMatches(inner60), 7);
assert.equal(exactResidueMatches(inner59), 8);

const candidate = {};
for (const [radix, key] of [['base60', inner60], ['base59', inner59]]) {
  for (const [direction, sign] of [['subtract', -1], ['add', 1]]) {
    const plain = primeTape.map((rune, index) => mod29(rune + sign * key[index]));
    candidate[radix + '_' + direction] = {
      trigram: model.scoreStream(plain).mean,
      prefix: model.spell(plain.slice(0, 80))
    };
  }
}

const extractedScore = model.scoreStream(primeTape).mean;
assert.ok(model.p57Score > -2.5);
for (const value of Object.values(candidate)) {
  assert.ok(value.trigram < -3.7);
}
assert.ok(extractedScore < -3.7);

// Positive control: a genuine native-GP source segment under the exact inner-base60 additive pad.
const plantedPlain = model.training.slice(0, 180);
const plantedCipher = plantedPlain.map((rune, index) => mod29(rune + inner60[index]));
const recoveredPlant = plantedCipher.map((rune, index) => mod29(rune - inner60[index]));
assert.deepEqual(recoveredPlant, plantedPlain);
assert.ok(model.scoreStream(recoveredPlant).mean > -2.6);

// Context census: pi(total)=180 alone is not unique among four-page windows.
const pi180Starts = [];
for (let start = 0; start <= 52; start++) {
  const total = pages.slice(start, start + 4).reduce((sum, page) => sum + page.indices.length, 0);
  if (primePi(total) === 180) pi180Starts.push(start);
}
assert.deepEqual(pi180Starts, [10, 16, 17, 18, 28, 45]);

console.log(JSON.stringify({
  selectedBlock: {
    pages: [28, 29, 30, 31],
    runeCounts: blockPages.map((page) => page.indices.length),
    periodCounts: blockPages.map((page) => layout(page.page).periods),
    lineCounts: blockPages.map((page) => layout(page.page).lines),
    exact3456Starts,
    totalRunes: sourceBlock.length,
    primeCountOfTotal: primePi(sourceBlock.length)
  },
  sourceBridge: {
    primeIndexedTapeLength: primeTape.length,
    p50OnceShedInnerCells: innerAddresses.length,
    directResidueMatches: {
      base60: exactResidueMatches(inner60),
      base59: exactResidueMatches(inner59)
    },
    extractedTrigram: extractedScore,
    pi180FourPageStarts: pi180Starts
  },
  directPadCandidates: candidate,
  controls: {
    solvedP57Trigram: model.p57Score,
    nativePlantRecovered: recoveredPlant.length,
    nativePlantTrigram: model.scoreStream(recoveredPlant).mean
  },
  decision:
    'The selected p28-p31 block has a unique 3,4,5,6 punctuation progression and a natural 1078->180 prime-position bridge to the once-shed p50 interior, but the literal row-major p50 additive pad fails native-GP language.'
}, null, 2));
