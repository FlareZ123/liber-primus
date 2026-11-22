'use strict';

/**
 * Original p7 cubing orbit / p8-p9 changing-state GP29 inverse.
 * Tests precisely the source-obvious cubic update from the five p7
 * red word products and the missing orbit member in the red p8 title.
 * Node 22, CommonJS, no fitted keys or ciphertext-dependent search.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const base = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const readText = name => fs.readFileSync(path.join(base, name), 'utf8');
const corpus = JSON.parse(readText('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(readText('resources/liber-primus/lp2-ink-annotations.json'));
const master = readText('resources/transcriptions/liber_primus_master.txt');
const gp = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @param {number} x @param {number} exponent @returns {number} */
function modPow(x, exponent) {
  let power = x % 29;
  let result = 1;
  let e = exponent;
  while (e > 0) {
    if (e % 2 === 1) result = (result * power) % 29;
    power = (power * power) % 29;
    e = Math.floor(e / 2);
  }
  return result;
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const count = Array(29).fill(0);
  for (const value of values) count[value]++;
  return count.reduce((sum, n) => sum + n * (n - 1), 0) / (values.length * (values.length - 1));
}

/** @param {number[]} values @param {number} length @returns {{count:number,min:number,max:number}} */
function nativeWindows(values, length) {
  const stats = [];
  for (let start = 0; start + length <= values.length; start++) {
    stats.push(ioc(values.slice(start, start + length)));
  }
  assert(stats.length > 0);
  return { count: stats.length, min: Math.min(...stats), max: Math.max(...stats) };
}

/** @param {number[]} ciphertext @param {number} initialState @returns {number[]} */
function decrypt(ciphertext, initialState) {
  let state = initialState;
  const plaintext = [];
  for (const symbol of ciphertext) {
    plaintext.push((modPow(symbol, 19) - state + 29) % 29);
    state = modPow((state + symbol) % 29, 3);
  }
  return plaintext;
}

/** @param {number[]} plaintext @param {number} initialState @returns {number[]} */
function encrypt(plaintext, initialState) {
  let state = initialState;
  const ciphertext = [];
  for (const symbol of plaintext) {
    const c = modPow((symbol + state) % 29, 3);
    ciphertext.push(c);
    state = modPow((state + c) % 29, 3);
  }
  return ciphertext;
}

/** @param {string} input @returns {number[]} */
function textRunes(input) {
  return [...input].filter(rune => gp.has(rune)).map(rune => gp.get(rune));
}

const p7 = corpus.pages.find(page => page.page === 7);
const p8 = corpus.pages.find(page => page.page === 8);
const p9 = corpus.pages.find(page => page.page === 9);
const p7Ink = ink.pages.find(page => page.page === 7);
const p8Ink = ink.pages.find(page => page.page === 8);
assert.equal(p7Ink.red_spans.length, 1);
assert.deepEqual(p7Ink.red_spans[0], {
  start: 194,
  length: 14,
  runes: 'ᛞᚩᛟᛏᚦᚫᚳᚹᛄᛉᛠᚷᛠᛗ'
});
assert.equal(p8Ink.red_spans[0].start, 0);
assert.equal(p8Ink.red_spans[0].length, 12);
assert.equal(p8.indices.length, 255);
assert.equal(p9.indices.length, 268);

const p7Red = p7.indices.slice(194);
const wordLengths = [2, 4, 3, 2, 3]; // five original red printed words
const productValues = [];
let offset = 0;
for (const length of wordLengths) {
  const word = p7Red.slice(offset, offset + length);
  assert.equal(word.length, length);
  productValues.push(word.reduce((acc, rune) => (acc * rune) % 29, 1));
  offset += length;
}
assert.equal(offset, p7Red.length);
assert.deepEqual(productValues, [11, 26, 8, 15, 2]);
const seedCycle = [2, 8, 19, 15, 11, 26];
for (let i = 0; i < seedCycle.length; i++) {
  assert.equal(modPow(seedCycle[i], 3), seedCycle[(i + 1) % seedCycle.length]);
  assert.equal(modPow(modPow(seedCycle[i], 3), 19), seedCycle[i]);
}
assert.deepEqual(
  [...new Set([...productValues, 19])].sort((a, b) => a - b),
  [...seedCycle].sort((a, b) => a - b)
);
assert(p8.indices.slice(0, 12).filter(value => value === 19).length >= 1,
  'Original p8 red heading contains M=GP index19, the missing cubic orbit value');

const p8Black = p8.indices.slice(12);
const original = [...p8Black, ...p9.indices];
assert.equal(p8Black.length, 243);
assert.equal(original.length, 511);
const nativePages = master.split(/(?:^|\r?\n)%[ \t]*(?:\r?\n|$)/);
const native = [...textRunes(nativePages[10]), ...textRunes(nativePages[11])];
assert.equal(native.length, 361);
const control243 = nativeWindows(native, 243);
const control268 = nativeWindows(native, 268);
console.log('[SOURCE] p7 red five product values:', productValues.join(','));
console.log('[SOURCE] exact six-element cubic permutation orbit:', seedCycle.join(' → '));
console.log('[SOURCE] p8 red M19 closes orbit; p8 black=243, p9=268, stitched=511');
console.log('[CONTROL] native original GP clear pp10+11:', native.length, 'runes');
console.log('[CONTROL] p8 native 243-window bounds:', JSON.stringify(control243));
console.log('[CONTROL] p9 native 268-window bounds:', JSON.stringify(control268));

for (const seed of seedCycle) {
  const result = decrypt(original, seed);
  const a = result.slice(0, 243);
  const b = result.slice(243);
  assert.deepEqual(encrypt(result, seed), original,
    'Any claimed original decoder must exactly reencrypt 511 source rune values');
  const plantedCipher = encrypt(native, seed);
  assert.deepEqual(decrypt(plantedCipher, seed), native,
    'Source-native 361-rune planted English must be fully recoverable');
  const aIOC = ioc(a);
  const bIOC = ioc(b);
  assert(aIOC < control243.min && bIOC < control268.min,
    'Unexpected original GP language-range output; examine it before discarding');
  console.log('[ORIGINAL]', JSON.stringify({
    seed, p8IOC: aIOC, p9IOC: bIOC,
    firstP8: a.slice(0, 35).map(value => corpus.translit[value]).join(''),
    firstP9: b.slice(0, 35).map(value => corpus.translit[value]).join(''),
    originalReencrypted: original.length,
    plantedGPNativeRecovered: native.length
  }));
}
console.log('[DECISION] Source-visible cube orbit supplies six finite seeds, but no authored output/update rule.');
console.log('[DECISION] The specified ciphertext-fed cubic inverse fails intact p8 and untouched p9 for all six source seeds.');
console.log('[REPRODUCTION] PASS; no unknown LP2 plaintext or authentic key.');
