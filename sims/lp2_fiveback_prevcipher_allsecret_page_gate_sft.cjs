'use strict';

/**
 * Original-LP2 all-secret necessary-condition test for a reversible
 * fifth-back, previous-ciphertext-conditioned finite-state cipher.
 *
 * Proposed complete page-local family:
 *   C[i] = pi[0](P[i])                                i < 5
 *   C[i] = (C[i-5] + pi[C[i-1]](P[i])) modulo 29       i >= 5
 * Every pi[state] is a completely unrestricted 29-symbol permutation,
 * independently secret for each physical page. Page boundaries reset;
 * the original 32 cross-page words remain split at their physical points.
 *
 * D[i] = C[i]-C[i-5] modulo 29 has the same equality partition as the
 * plaintext P[i] within each page x preceding-ciphertext-rune class.
 * The invariant is exact for ALL 55 * 29 * (29!) choices of page-state
 * permutations without knowing or fitting any key. This test compares
 * that invariant with native GP29 English word-length-matched plants.
 *
 * Reproduce: node sims/lp2_fiveback_prevcipher_allsecret_page_gate_sft.cjs
 * Node.js 22 or later. No file writes or network calls.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

/** @param {string} file @returns {string} */
function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}
const source = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const reference = JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const gpToIndex = new Map(source.runes.map((r, i) => [r, i]));
const runePattern = new RegExp('[' + source.runes.join('') + ']+', 'gu');
const original = source.pages.filter(p => p.page <= 55 && p.indices.length > 0);
const lengths = original.map(p => p.indices.length);
const originalString = read('resources/lp2-transcription.txt');
const originalWords = (originalString.split('%').slice(0, 55).join('%')
  .replace(/\/\r?\n/g, '').replace(/[\r\n%]/g, '')
  .match(runePattern) || []);
const originalWordLengths = originalWords.map(word => [...word].length);
assert.equal(original.length, 55);
assert.equal(originalWordLengths.length, 2896);
assert.equal(originalWordLengths.reduce((a, b) => a + b, 0), 12956);
assert.deepEqual(originalWords.flatMap(w => [...w].map(r => gpToIndex.get(r))),
  original.flatMap(page => page.indices));
assert.equal(reference.runes.join(''), source.runes.join(''));

/** @returns {number[][][]} Native original-GP words bucketed by rune length. */
function nativeBuckets() {
  const result = Array.from({ length: 15 }, () => []);
  for (const section of reference.sections) {
    for (const word of section.source_text.match(runePattern) || []) {
      const letters = [...word].map(r => gpToIndex.get(r));
      if (letters.length < result.length) result[letters.length].push(letters);
    }
  }
  for (const size of new Set(originalWordLengths)) {
    assert(result[size].length > 0, 'missing native source word length ' + size);
  }
  return result;
}
const buckets = nativeBuckets();

/** @param {number} initial @returns {() => number} */
function rng(initial) {
  let state = initial >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/** @param {() => number} next @returns {number[][]} */
function nativePages(next) {
  const flat = originalWordLengths.flatMap(size => {
    const words = buckets[size];
    return words[Math.floor(next() * words.length)];
  });
  const pages = [];
  let cursor = 0;
  for (const count of lengths) {
    pages.push(flat.slice(cursor, cursor + count));
    cursor += count;
  }
  assert.equal(cursor, 12956);
  return pages;
}

/** @param {() => number} next @returns {number[][]} */
function secretTables(next) {
  return Array.from({ length: 29 }, () => {
    const table = Array.from({ length: 29 }, (_, i) => i);
    for (let i = 28; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      [table[i], table[j]] = [table[j], table[i]];
    }
    assert.equal(new Set(table).size, 29);
    return table;
  });
}

/**
 * @param {number[]} plain
 * @param {number[][]} tables
 * @returns {number[]}
 */
function encrypt(plain, tables) {
  const cipher = [];
  for (let i = 0; i < plain.length; i++) {
    const table = tables[i < 5 ? 0 : cipher[i - 1]];
    const emitted = table[plain[i]];
    cipher.push(i < 5 ? emitted : (cipher[i - 5] + emitted) % 29);
  }
  return cipher;
}

/**
 * @param {number[]} cipher
 * @param {number[][]} tables
 * @returns {number[]}
 */
function decrypt(cipher, tables) {
  const plain = [];
  for (let i = 0; i < cipher.length; i++) {
    const table = tables[i < 5 ? 0 : cipher[i - 1]];
    const residual = i < 5 ? cipher[i] : (cipher[i] - cipher[i - 5] + 29) % 29;
    plain.push(table.indexOf(residual));
  }
  return plain;
}

/**
 * Count within-page same-state equality pairs in observable fifth-back
 * ciphertext differences. Two positions belong to the same class only
 * when both the physical page and previous ciphertext glyph agree.
 * Any secret state-indexed bijection of the plaintext alphabet preserves
 * equality of the residuals within that class exactly.
 *
 * @param {number[][]} ciphertextPages
 * @returns {{runes:number, classes:number, comparisons:number, matches:number, rate:number}}
 */
function measure(ciphertextPages) {
  const rows = new Map();
  let runes = 0;
  for (let page = 0; page < ciphertextPages.length; page++) {
    const c = ciphertextPages[page];
    for (let i = 5; i < c.length; i++) {
      const id = 29 * page + c[i - 1];
      let hist = rows.get(id);
      if (!hist) { hist = new Uint16Array(29); rows.set(id, hist); }
      hist[(c[i] - c[i - 5] + 29) % 29]++;
      runes++;
    }
  }
  let comparisons = 0, matches = 0;
  for (const hist of rows.values()) {
    let total = 0;
    for (const value of hist) {
      total += value;
      matches += value * (value - 1) / 2;
    }
    comparisons += total * (total - 1) / 2;
  }
  return { runes, classes: rows.size, comparisons, matches,
    rate: matches / comparisons };
}

const actual = measure(original.map(p => p.indices));
assert.deepEqual(actual, { runes: 12681, classes: 1590,
  comparisons: 52239, matches: 1808, rate: 1808 / 52239 });

const next = rng(0x31a45);
const trials = 100;
const scores = [];
let recoveredFirstPlant = 0;
let wrongKeyDifferences = 0;
for (let trial = 0; trial < trials; trial++) {
  const plainPages = nativePages(next);
  const cipherPages = [];
  for (let page = 0; page < plainPages.length; page++) {
    const tables = secretTables(next);
    const cipher = encrypt(plainPages[page], tables);
    const recovered = decrypt(cipher, tables);
    assert.deepEqual(recovered, plainPages[page]);
    if (trial === 0) {
      recoveredFirstPlant += recovered.length;
      const wrong = secretTables(next);
      wrongKeyDifferences += decrypt(cipher, wrong)
        .filter((letter, i) => letter !== plainPages[page][i]).length;
    }
    cipherPages.push(cipher);
  }
  scores.push(measure(cipherPages).rate);
}
assert.equal(recoveredFirstPlant, 12956);
assert(wrongKeyDifferences > 10000);
assert(scores.every(rate => rate > actual.rate),
  'matched original GP29 source-native control crossed original all-secret gate');
const sorted = [...scores].sort((a, b) => a - b);
console.log(JSON.stringify({
  hypothesis: 'Per-page secret 29-state/29-symbol permutations, ' +
    'five-back modular feedback and one-back ciphertext-state selector',
  proof: 'C[i]-C[i-5] = pi[C[i-1]](P[i]) modulo 29, so exact ' +
    'within-page, within-C[i-1] equality pairs are key-invariant',
  original: actual,
  matchedSolvedCicadaControl: {
    source: 'resources/external/relikd-solved-gp29-native-v1.json',
    words: originalWordLengths.length,
    runes: originalWordLengths.reduce((a, b) => a + b, 0),
    physicalPages: lengths.length,
    pageRuneCountsPreserved: true,
    originalWordLengthsPreserved: true,
    secretPermutationCountPerPlant: 55 * 29,
    trials, deterministicSeed: '0x31a45',
    minimum: sorted[0], median: sorted[trials / 2],
    maximum: sorted.at(-1),
    plantsAtOrBelowOriginal: scores.filter(rate => rate <= actual.rate).length
  },
  reversibility: { correctlyRecoveredFirstPlantRunes: recoveredFirstPlant,
    wrongKeyDifferentRunes: wrongKeyDifferences },
  decision: 'Excludes this precisely specified complete per-page ' +
    'ciphertext-conditioned fifth-back feedback family with ALL secret ' +
    'permutations for the tested source-native GP29 English register. ' +
    'No unknown original plaintext/key recovered.',
  unresolved: 'No original author instruction selects this state law. ' +
    'Other state variables, word-specific key changes, distinct feedback, ' +
    'and alternative plaintext registers are outside this necessary-condition test.'
}, null, 2));
