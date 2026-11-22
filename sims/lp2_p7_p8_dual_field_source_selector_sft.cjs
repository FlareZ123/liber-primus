'use strict';
/**
 * Source-only dual-field selector gate for original Liber Primus p7/p8.
 *
 * Physical-page mapping is essential: the master transcription omits
 * the rune-free physical p50, so transcription part[50] is physical p51.
 * Uses only original GP indices, printed complete words, ink annotations,
 * exact p8 rune register and the original 256-token numerical table.
 * This SFT is read-only and runs under Node.js 22 on Windows 11.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..', 'resources', 'liber-primus');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('lp2-corpus.json'));
const ink = JSON.parse(read('lp2-ink-annotations.json'));
const grid = JSON.parse(read('lp2-grid-256.json'));
const parts = read('lp2-transcription.txt').split('%');
const runeValue = new Map(corpus.runes.map((r, i) => [r, i]));
const redMap = new Map(ink.pages.map(page => [
  page.page,
  new Set((page.red_spans || []).flatMap(span =>
    Array.from({ length: span.length }, (_, k) => span.start + k)))
]));
/** @typedef {{page:number,offset:number,value:number,red:boolean}} Cell */
/** @type {Cell[][]} */
const words = [];
/** @type {Cell[]} */
let current = [];
for (let page = 0; page <= 55; page++) {
  if (page === 50) continue;
  const physical = corpus.pages.find(p => p.page === page);
  let offset = 0;
  const part = parts[page > 50 ? page - 1 : page];
  assert.equal(typeof part, 'string');
  for (const char of part) {
    if (runeValue.has(char)) {
      current.push({
        page, offset, value: runeValue.get(char),
        red: redMap.get(page)?.has(offset) || false
      });
      offset++;
    } else if ((char === '-' || char === '.') && current.length) {
      words.push(current);
      current = [];
    }
  }
  assert.equal(offset, physical.indices.length);
}
if (current.length) words.push(current);
assert.equal(words.length, 2896);
/** @param {Cell[]} word @returns {boolean} */
const allRed = word => word.every(cell => cell.red) &&
  word.every(cell => cell.page === word[0].page);
/** @param {number} n @returns {number} */
const mod29 = n => ((n % 29) + 29) % 29;
/** @param {number[]} values @returns {number} */
const product29 = values =>
  values.reduce((a, x) => mod29(a * x), 1);
/** @param {Cell[]} word @returns {number} */
const prodWord = word => product29(word.map(cell => cell.value));
/** @param {number} p @returns {Cell[][]} */
const pageRedWords = p => words.filter(word =>
  allRed(word) && word[0].page === p);
const red7 = pageRedWords(7);
const red8 = pageRedWords(8);
const products = red7.map(prodWord);
const selector = red8.map(prodWord);
assert.deepEqual(products, [11, 26, 8, 15, 2]);
assert.deepEqual(selector, [4, 3]);
assert.deepEqual(red7.map(w => w.length), [2, 4, 3, 2, 3]);
assert.deepEqual(red8.map(w => w.length), [4, 8]);
assert.deepEqual(red7.flat().map(x => x.value),
  corpus.pages[7].indices.slice(194));
assert.deepEqual(red8.flat().map(x => x.value),
  corpus.pages[8].indices.slice(0, 12));

const scroll = words.filter(word =>
  word[0].page >= 3 && word[0].page <= 7);
assert.equal(scroll.length, 255);
assert.equal(scroll.filter(allRed).length, 13);
assert.equal(scroll.filter(w => !w.some(x => x.red)).length, 242);
assert.deepEqual(scroll.flat().map(x => x.value),
  corpus.pages.filter(p => p.page >= 3 && p.page <= 7)
    .flatMap(p => p.indices));
const p8 = corpus.pages[8].indices;
assert.equal(p8.length, 255);
assert.equal(redMap.get(8).size, 12);
assert.equal(255 - redMap.get(8).size, 243);
const cross89 = words.filter(word =>
  word.some(c => c.page === 8) && word.some(c => c.page === 9));
assert.equal(cross89.length, 1);
assert.equal(cross89[0].filter(c => c.page === 8).length, 1);
assert.equal(cross89[0].filter(c => c.page === 9).length, 5);

const redPairs = [];
let previous = null;
for (const word of words) {
  if (!allRed(word)) {
    previous = null;
    continue;
  }
  const p = word[0].page;
  if (previous && previous[0].page === p) {
    redPairs.push({ page: p, products: [prodWord(previous), prodWord(word)] });
  }
  previous = word;
}
assert.equal(redPairs.length, 35);
assert.deepEqual(redPairs.filter(x => x.products.join(',') === '4,3'),
  [{ page: 8, products: [4, 3] }]);

/** @param {number} a @param {number} b @returns {number} */
function multiplyGF4(a, b) {
  let result = 0;
  for (let bit = 0; bit < 2; bit++) {
    if ((b >>> bit) & 1) result ^= a;
    a <<= 1;
    if (a & 4) a ^= 7;
  }
  return result;
}
/** @param {number[]} values @returns {{period:number,addresses:number[]}} */
function orbit4(values) {
  const taps = values.slice(0, 4).map(n => n % 4);
  const state = [values[4] % 4, 0, 0, 0];
  const seen = new Set();
  const addresses = [];
  for (let i = 0; i <= 256; i++) {
    const address = state.reduce((a, x) => 4 * a + x, 0);
    if (seen.has(address)) return { period: i, addresses };
    seen.add(address);
    addresses.push(address);
    let feedback = 0;
    for (let j = 0; j < 4; j++)
      feedback ^= multiplyGF4(taps[j], state[j]);
    state.splice(0, 4, state[1], state[2], state[3], feedback);
  }
  throw new Error('Unexpected GF4 period');
}
/** @param {number[]} values @returns {number} */
function period3(values) {
  const taps = values.map(n => n % 3);
  const state = [1, 0, 0, 0, 0];
  const seen = new Set();
  for (let i = 0; i <= 243; i++) {
    const key = state.reduce((a, x) => 3 * a + x, 0);
    if (seen.has(key)) return i;
    seen.add(key);
    let feedback = 0;
    for (let j = 0; j < 5; j++)
      feedback = (feedback + taps[j] * state[j]) % 3;
    state.splice(0, 5, state[1], state[2], state[3], state[4], feedback);
  }
  throw new Error('Unexpected GF3 period');
}
assert.equal(orbit4(products).period, 255);
assert.equal(period3(products), 242);
assert.equal(new Set(orbit4(products).addresses).size, 255);

const gp0 = w => w.map(c => c.value);
const prime = w => w.map(c => corpus.prime[c.value]);
const sum29 = w => mod29(w.reduce((a, x) => a + x, 0));
const features = {
  length: w => w.length,
  gp0Sum: w => sum29(gp0(w)),
  gp1Sum: w => sum29(gp0(w).map(x => x + 1)),
  primeSum: w => sum29(prime(w)),
  gp0Product: w => product29(gp0(w)),
  gp1Product: w => product29(gp0(w).map(x => x + 1)),
  primeProduct: w => product29(prime(w)),
  firstGp0: w => w[0].value,
  lastGp0: w => w[w.length - 1].value,
  firstPrime: w => corpus.prime[w[0].value] % 29,
  lastPrime: w => corpus.prime[w[w.length - 1].value] % 29
};
const inventory = Object.entries(features).map(([name, fn]) => {
  const v = red7.map(fn);
  return { name, values: v, gf4Period: orbit4(v).period, gf3Period: period3(v) };
});
assert.deepEqual(inventory.filter(x => x.gf4Period === 255)
  .map(x => x.name), ['gp0Product', 'firstGp0']);
assert.deepEqual(inventory.filter(x => x.gf3Period === 242)
  .map(x => x.name), ['gp0Product']);
assert.deepEqual(inventory.filter(x =>
  x.gf3Period === 242 && x.gf4Period === 255)
  .map(x => x.name), ['gp0Product']);

const tokens = grid.pages.flatMap(p => p.tokens);
assert.equal(tokens.length, 256);
const a60 = grid.alphabet;
const second = tokens.map(t => t[1]);
const absent = [...a60].filter(char => !second.includes(char));
assert.deepEqual(absent, ['f']);
assert.equal(second.filter(ch => ch === 'F').length, 2);
assert(grid.bytes.every(n => n >= 0 && n <= 255));
assert.equal(new Set(grid.bytes).size, 161);
const a59 = a60.replace('f', '');
const table59 = tokens.map(token =>
  59 * a59.indexOf(token[0]) + a59.indexOf(token[1]));
const pairs = [[47, 240], [48, 231], [235, 236], [88, 179]];
for (const [i, j] of pairs) {
  assert.deepEqual(
    scroll[i].map(c => c.value).sort((a, b) => a - b),
    scroll[j].map(c => c.value).sort((a, b) => a - b));
}
const observed = pairs.map(([i, j]) => mod29(p8[i] - p8[j]));
assert.deepEqual(observed, [8, 18, 14, 25]);
const models = [];
for (const name of ['gp0Product', 'firstGp0']) {
  const addr = orbit4(red7.map(features[name])).addresses;
  for (const [radix, table] of Object.entries({ radix60: grid.bytes, radix59: table59 })) {
    const predicted = pairs.map(([i, j]) =>
      mod29(table[addr[j]] - table[addr[i]]));
    models.push({ selector: name, radix, predicted,
      matches: predicted.filter((v, i) => v === observed[i]).length });
  }
}
assert.deepEqual(models.map(m => m.matches), [2, 4, 0, 0]);
const nullCounts = Array.from({ length: 12 }, (_, i) =>
  Array.from({ length: 29 }, (_, j) => j).filter(j => j % 12 === i).length);
const good3 = new Set();
const good4 = new Set();
for (let i = 0; i < 243; i++) {
  const v = [0,0,0,0,0].map((_, j) => Math.floor(i / 3 ** (4 - j)) % 3);
  if (period3(v) === 242) good3.add(v.join(','));
}
for (let i = 0; i < 256; i++) {
  const v = [0,0,0,0].map((_, j) => Math.floor(i / 4 ** (3 - j)) % 4);
  if (orbit4([...v, 1]).period === 255) good4.add(v.join(','));
}
assert.equal(good3.size, 22);
assert.equal(good4.size, 32);
let total = 0, gf3 = 0, gf4 = 0, both = 0;
for (let a = 0; a < 12; a++)
for (let b = 0; b < 12; b++)
for (let c = 0; c < 12; c++)
for (let d = 0; d < 12; d++)
for (let e = 0; e < 12; e++) {
  const wt = nullCounts[a] * nullCounts[b] * nullCounts[c] *
    nullCounts[d] * nullCounts[e];
  const m3 = good3.has([a,b,c,d,e].map(n => n%3).join(','));
  const m4 = e%4 !== 0 &&
    good4.has([a,b,c,d].map(n => n%4).join(','));
  total += wt;
  gf3 += wt * Number(m3);
  gf4 += wt * Number(m4);
  both += wt * Number(m3 && m4);
}
assert.deepEqual([total, gf3, gf4, both],
  [20511149, 1709460, 1786344, 173446]);
console.log('LP2_DUAL_FIELD_SOURCE_SELECTOR ' + JSON.stringify({
  p7RedProducts: products, p8RedProducts: selector,
  physicallyRedPairs: redPairs.length, ordered43Matches: 1,
  p3p7Words: 255, blackScrollWords: 242,
  p8Runes: 255, p8BlackRunes: 243, p8CompleteBlackRunes: 242,
  p8p9CarriedRuneCount: 1,
  featureInventory: inventory,
  candidateModels: models, observedDifferences: observed,
  tableAbsentSecondDigits: absent, tableConventionalDistinctBytes: 161,
  conventionalByteNullPAbsentLowerf: Math.pow(252 / 256, 256),
  fiveGp29ValueNull: { total, gf3, gf4, both,
    dualRate: both / total },
  independentlyRecoveredUnknownPlaintext: false
}));