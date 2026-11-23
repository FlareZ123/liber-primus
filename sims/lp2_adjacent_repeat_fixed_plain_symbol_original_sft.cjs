'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} relative */
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const rawPages = read('resources/liber-primus/lp2-transcription.txt').split('%');
const runeIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));
const originalPages = [];

/** @param {number} page */
function parseOriginalPage(page) {
  const raw = rawPages[page >= 51 ? page - 1 : page];
  const words = [];
  let word = [];
  for (const character of raw) {
    if (runeIndex.has(character)) {
      word.push(runeIndex.get(character));
    } else if ('-.&$'.includes(character) && character !== '') {
      if (word.length) words.push(word);
      word = [];
    }
  }
  if (word.length) words.push(word);
  const original = corpus.pages.find((entry) => entry.page === page).indices;
  assert.deepEqual(words.flat(), original, 'Original transcription mismatch on p' + page);
  return { page, words };
}

for (let p = 0; p < 56; p++) {
  if (p !== 50) originalPages.push(parseOriginalPage(p));
}

/**
 * Position categories: first of multirune word, last of multirune word,
 * strict interior, sole rune in a word.
 * @param {number[][]} words
 * @returns {{tape:number[], positions:number[]}}
 */
function describeWords(words) {
  const tape = [];
  const positions = [];
  for (const word of words) {
    for (let i = 0; i < word.length; i++) {
      tape.push(word[i]);
      positions.push(word.length === 1 ? 3 : i === 0 ? 0 :
        i === word.length - 1 ? 1 : 2);
    }
  }
  return { tape, positions };
}

/**
 * Aggregate original adjacent-equality flags, separately restarting at each page.
 * @param {{page:number,words:number[][]}[]} pages
 */
function originalFlags(pages) {
  const bins = [0, 0, 0, 0];
  let N = 0;
  let n = 0;
  for (const { words } of pages) {
    const { tape, positions } = describeWords(words);
    N += tape.length - 1;
    for (let i = 1; i < tape.length; i++) {
      if (tape[i] === tape[i - 1]) {
        bins[positions[i]]++;
        n++;
      }
    }
  }
  return { N, n, bins };
}

/**
 * Author-era English GP29 normalization: V->U, K/Q->C, Z->S.
 * Longest matching GP spelling first. This is a control encoding,
 * not a claim about the LP2 author's unknown plaintext spelling.
 * @param {string} text
 */
function nativeWords(text) {
  let body = text.toUpperCase();
  const start = body.indexOf('*** START OF');
  if (start >= 0) body = body.slice(body.indexOf('\n', start) + 1);
  const end = body.indexOf('*** END OF');
  if (end >= 0) body = body.slice(0, end);
  const alphabet = corpus.translit.map((token, index) => ({ token, index }))
    .sort((a, b) => b.token.length - a.token.length);
  const words = [];
  for (let word of body.match(/[A-Z]+/g) || []) {
    word = word.replace(/[VKQZ]/g, (character) =>
      ({ V: 'U', K: 'C', Q: 'C', Z: 'S' })[character]);
    const runes = [];
    for (let i = 0; i < word.length;) {
      const matching = alphabet.find(({ token }) => word.startsWith(token, i));
      assert(matching, 'Unmapped letter in donor ' + word);
      runes.push(matching.index);
      i += matching.token.length;
    }
    words.push(runes);
  }
  return words;
}

/**
 * GP29 frequency/word-position summary, excluding the first rune of
 * each page from eligible repeat positions.
 * @param {{page:number,words:number[][]}[]} pages
 */
function donorSummary(pages) {
  const bins = Array.from({ length: 29 }, () => [0, 0, 0, 0]);
  let N = 0;
  for (const { words } of pages) {
    const { tape, positions } = describeWords(words);
    for (let i = 1; i < tape.length; i++) {
      bins[tape[i]][positions[i]]++;
      N++;
    }
  }
  return { N, bins };
}

/**
 * Bernoulli deviance plus conditional positional multinomial deviance.
 * The 0.5 pseudocount is applied only to finite control position bins.
 * @param {{N:number,n:number,bins:number[]}} observed
 * @param {{N:number,bins:number[][]}} donor
 * @param {number} symbol
 */
function deviance(observed, donor, symbol) {
  const m = donor.bins[symbol].reduce((a, b) => a + b, 0);
  if (m === 0 || m === donor.N) return Number.POSITIVE_INFINITY;
  const p = m / donor.N;
  const q = observed.n / observed.N;
  const freq = 2 * (observed.n * Math.log(q / p) +
    (observed.N - observed.n) * Math.log((1 - q) / (1 - p)));
  const pos = observed.bins.reduce((sum, b, i) =>
    sum + (b ? 2 * b * Math.log((b / observed.n) /
      ((donor.bins[symbol][i] + 0.5) / (m + 2))) : 0), 0);
  return { symbol, freq, position: pos, total: freq + pos, expected: m };
}

/** @param {ReturnType<typeof originalFlags>} observed
 *  @param {ReturnType<typeof donorSummary>} reference */
function rank(observed, reference) {
  return Array.from({ length: 29 }, (_, i) => deviance(observed, reference, i))
    .filter((row) => Number.isFinite(row.total))
    .sort((a, b) => a.total - b.total);
}

/**
 * Construct native vocabulary controls with the exact complete printed-word
 * lengths of all 55 rune-bearing original pages. This preserves all page seams.
 * @param {number[][]} donor
 * @param {number} seed
 */
function matchedNative(donor, seed) {
  const byLength = new Map();
  for (const word of donor) {
    if (!byLength.has(word.length)) byLength.set(word.length, []);
    byLength.get(word.length).push(word);
  }
  const cursor = new Map();
  return originalPages.map(({ page, words }) => ({
    page,
    words: words.map((original) => {
      const pool = byLength.get(original.length);
      assert(pool && pool.length > 0, 'Missing native word length ' + original.length);
      const index = cursor.get(original.length) || 0;
      cursor.set(original.length, index + 1);
      return pool[(seed * 193 + index * 47 + original.length * 71) % pool.length];
    }),
  }));
}

/**
 * Synthetic bijective evolving substitution of 28 non-special digits.
 * The sole plaintext symbol 'special' maps to repeated ciphertext.
 * @param {{page:number,words:number[][]}[]} source
 * @param {number} special
 */
function plantAndInvert(source, special) {
  const ciphertextPages = [];
  const decodedPages = [];
  for (const { page, words } of source) {
    const plain = words.flat();
    const ciphertext = [plain[0]];
    const decoded = [ciphertext[0]];
    for (let i = 1; i < plain.length; i++) {
      const compressed = plain[i] > special ? plain[i] - 1 : plain[i];
      const shift = (7 * i + 11 * page) % 28;
      const increment = plain[i] === special ? 0 : 1 + (5 * compressed + shift) % 28;
      ciphertext.push((ciphertext[i - 1] + increment) % 29);
      const seen = (ciphertext[i] - ciphertext[i - 1] + 29) % 29;
      const unpacked = seen === 0 ? special : ((17 * (seen - 1 - shift + 56)) % 28);
      decoded.push(seen === 0 ? special : unpacked >= special ? unpacked + 1 : unpacked);
    }
    assert.deepEqual(decoded, plain, 'Planted complete page inverse failed p' + page);
    ciphertextPages.push({ page, words: [], tape: ciphertext });
    decodedPages.push({ page, words, tape: decoded });
  }
  return { ciphertextPages, decodedPages };
}

const observed = originalFlags(originalPages);
assert.equal(originalPages.reduce((sum, page) =>
  sum + page.words.flat().length, 0), 12956);
assert.equal(originalPages.reduce((sum, page) => sum + page.words.length, 0), 2928);
assert.deepEqual(observed, { N: 12901, n: 86, bins: [23, 19, 44, 0] });
console.log('Original exact flags:', JSON.stringify(observed));

const filenames = [
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt',
  'resources/control/shakespeare_first300k.txt',
];
const donors = filenames.map((file) => nativeWords(read(file)));
for (let j = 0; j < donors.length; j++) {
  const native = [{ page: 0, words: donors[j] }];
  const best = rank(observed, donorSummary(native));
  console.log('Full native donor', filenames[j], JSON.stringify(best.slice(0, 4)));
}

const joined = donors.flat();
const minima = [];
for (let seed = 0; seed < 384; seed++) {
  const sampled = matchedNative(joined, seed);
  const candidates = rank(observed, donorSummary(sampled));
  minima.push({ seed, symbol: corpus.translit[candidates[0].symbol],
    value: candidates[0].total, frequency: candidates[0].freq,
    position: candidates[0].position });
}
minima.sort((a, b) => a.value - b.value);
console.log('384 exact-original-word-length matched native controls; top 12:',
  JSON.stringify(minima.slice(0, 12)));
console.log('All 384 are conditional literary controls, not actual unknown LP2 words.');

const positive = matchedNative(joined, 0);
const special = 28; // EA, present at an English-register frequency near observed repeat rate
const { ciphertextPages } = plantAndInvert(positive, special);
const synthetic = {
  N: observed.N,
  n: 0,
  bins: [0, 0, 0, 0],
};
for (let p = 0; p < positive.length; p++) {
  const { tape, positions } = describeWords(positive[p].words);
  const encrypted = ciphertextPages[p].tape;
  for (let i = 1; i < tape.length; i++) {
    const flag = encrypted[i] === encrypted[i - 1];
    assert.equal(flag, tape[i] === special);
    if (flag) {
      synthetic.n++;
      synthetic.bins[positions[i]]++;
    }
  }
}
const plantedScore = rank(synthetic, donorSummary(positive));
assert.equal(plantedScore[0].symbol, special);
assert.ok(plantedScore[0].total < 5, 'Expected positive native-control fit');
console.log('Original-shaped positive plant, exact full inverse and sentinel:',
  JSON.stringify({ synthetic, winningSymbol: corpus.translit[plantedScore[0].symbol],
    minDeviance: plantedScore[0].total }));
console.log('PASS: an all-key fixed-repeat-sentinel original-input gate with positive plant.');
