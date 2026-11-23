'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} name */
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const c = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pageTexts = read('resources/liber-primus/lp2-transcription.txt').split('%');
const runes = new Map(c.runes.map((symbol, i) => [symbol, i]));
const alphabet = c.translit.map((symbol, i) => ({ symbol, i }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {string} text */
function gpWords(text) {
  let s = text.toUpperCase();
  let k = s.indexOf('*** START OF');
  if (k >= 0) s = s.slice(s.indexOf('\n', k) + 1);
  k = s.indexOf('*** END OF');
  if (k >= 0) s = s.slice(0, k);
  const words = [];
  for (let word of s.match(/[A-Z]+/g) || []) {
    word = word.replace(/[VKQZ]/g, (ch) => ({
      V: 'U', K: 'C', Q: 'C', Z: 'S',
    })[ch]);
    const sequence = [];
    for (let i = 0; i < word.length;) {
      const match = alphabet.find((x) => word.startsWith(x.symbol, i));
      assert(match);
      sequence.push(match.i);
      i += match.symbol.length;
    }
    words.push(sequence);
  }
  return words;
}

/** @param {number} page */
function originalWords(page) {
  const s = pageTexts[page >= 51 ? page - 1 : page];
  const words = [];
  let word = [];
  for (const glyph of s) {
    if (runes.has(glyph)) word.push(runes.get(glyph));
    else if ('-.&$'.includes(glyph) && glyph !== '') {
      if (word.length) words.push(word);
      word = [];
    }
  }
  if (word.length) words.push(word);
  assert.deepEqual(words.flat(), c.pages.find((p) => p.page === page).indices);
  return words;
}

const original = Array.from({ length: 56 }, (_, p) => p)
  .filter((page) => page !== 50)
  .map((page) => ({ page, words: originalWords(page) }));
assert.equal(original.reduce((n, page) => n + page.words.flat().length, 0), 12956);
const donors = [
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt',
  'resources/control/shakespeare_first300k.txt',
];
const native = donors.map((file) => gpWords(read(file)));
const pool = new Map();
for (const source of native) for (const word of source) {
  if (!pool.has(word.length)) pool.set(word.length, []);
  pool.get(word.length).push(word);
}

/** @param {number} seed */
function matchedBooks(seed) {
  const cursor = new Map();
  return original.map(({ page, words }) => ({
    page,
    words: words.map((sample) => {
      const length = sample.length;
      const candidates = pool.get(length);
      assert(candidates);
      const i = cursor.get(length) || 0;
      cursor.set(length, i + 1);
      return candidates[(seed * 193 + i * 47 + length * 71) % candidates.length];
    }),
  }));
}

/**
 * Count the target plaintext bigram difference modulo 29 within each page.
 * A zero ciphertext step under any rotating state-private nonzero permutation
 * of plaintext bigram differences, with one distinguished fixed delta D,
 * occurs iff the plaintext step is D.
 * @param {{page:number,words:number[][]}[]} pages
 */
function differences(pages) {
  const count = Array(29).fill(0);
  let eligible = 0;
  for (const { words } of pages) {
    const tape = words.flat();
    for (let i = 1; i < tape.length; i++) {
      count[(tape[i] - tape[i - 1] + 29) % 29]++;
      eligible++;
    }
  }
  return { count, eligible };
}

const stats = native.map((words, id) => {
  const { count, eligible } = differences([{ page: id, words }]);
  const min = Math.min(...count);
  const delta = count.indexOf(min);
  return { file: donors[id], eligible, delta, min,
    rate: min / eligible };
});
console.log('Source-native wholetext fixed delta minima:', JSON.stringify(stats));

let min = Number.POSITIVE_INFINITY;
let bestSeed = -1;
let bestDelta = -1;
const lows = [];
for (let seed = 0; seed < 384; seed++) {
  const { count, eligible } = differences(matchedBooks(seed));
  assert.equal(eligible, 12901);
  const current = Math.min(...count);
  if (current < min) {
    min = current;
    bestSeed = seed;
    bestDelta = count.indexOf(current);
  }
  lows.push({ seed, delta: count.indexOf(current), count: current });
}
lows.sort((a, b) => a.count - b.count);
assert.deepEqual({ min, bestSeed, bestDelta },
  { min: 169, bestSeed: 249, bestDelta: 18 });
assert.ok(min > 86);
console.log('384 original-word-layout native books, 29 deltas each;',
  JSON.stringify({ observedRepeats: 86, minimum: min, seed: bestSeed,
    delta: bestDelta, topTen: lows.slice(0, 10) }));

/** @param {number} x */
const norm = (x) => (x % 29 + 29) % 29;

/** @param {number} scale */
function inverse29(scale) {
  for (let i = 1; i < 29; i++) if ((scale * i) % 29 === 1) return i;
  throw Error('Nonunit scale');
}

/**
 * Positive plant with a position-varying, secretly keyed multiplier of the
 * plaintext previous-symbol delta. The distinguished delta stays fixed.
 * The entire plaintext remains invertible from the page's first ciphertext.
 * @param {{page:number,words:number[][]}[]} pages
 * @param {number} delta
 */
function plant(pages, delta) {
  let repeats = 0;
  for (const { page, words } of pages) {
    const plain = words.flat();
    const cipher = [plain[0]];
    const decoded = [cipher[0]];
    for (let i = 1; i < plain.length; i++) {
      const scale = 1 + ((11 * i + page * 5) % 28);
      const step = norm(plain[i] - plain[i - 1] - delta);
      cipher.push(norm(cipher[i - 1] + step * scale));
      const observed = norm(cipher[i] - cipher[i - 1]);
      decoded.push(norm(decoded[i - 1] + delta + observed * inverse29(scale)));
      assert.equal(observed === 0, norm(plain[i] - plain[i - 1]) === delta);
      if (observed === 0) repeats++;
    }
    assert.deepEqual(decoded, plain);
  }
  return repeats;
}

const synthetic = matchedBooks(bestSeed);
const plantRepeats = plant(synthetic, bestDelta);
assert.equal(plantRepeats, min);
console.log('Positive original-shape 12956-rune native plant:',
  JSON.stringify({ delta: bestDelta, repeats: plantRepeats,
    readback: 'all pages byte-exact', changingScale: true }));
console.log('PASS: fixed previous-plaintext difference cannot reproduce original86 repeats on 384 original-word-native controls; authentic source remains undeciphered.');
