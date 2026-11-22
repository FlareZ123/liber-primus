'use strict';

/**
 * Reproduction of the source-motivated previous-cipher-word prime-sum
 * substitution gate on the original 56 unsolved physical LP2 pages.
 *
 * Usage: node sims/lp2_wordprime_nextword_allsecret_sft.cjs
 * Node.js 22; read-only, no packages and no fitted unknown key.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const file = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const corpus = JSON.parse(file('resources/liber-primus/lp2-corpus.json'));
const original = corpus.pages.slice(0, 56).flatMap((p) => p.indices);
const E = corpus.translit.indexOf('E');

/** Recover printed LP2 words without treating page/line breaks as spaces. */
function manuscriptWords(text) {
  const lookup = new Map(corpus.runes.map((r, i) => [r, i]));
  const words = [];
  let word = [];
  for (const rune of text) {
    if (lookup.has(rune)) word.push(lookup.get(rune));
    else if ("-.'".includes(rune) && word.length) {
      words.push(word);
      word = [];
    }
  }
  if (word.length) words.push(word);
  return words;
}

const words = manuscriptWords(file('resources/liber-primus/lp2-transcription.txt')).slice(0, 2896);
assert.equal(original.length, 12956);
assert.equal(words.length, 2896);
assert.deepEqual(words.flat(), original);
assert.equal(E, 18);

/** Every previous-cipher-word prime sum picks one of 29 secret row keys. */
function priorCipherwordState(previous, modulus = 29) {
  return previous.reduce((sum, glyph) => sum + corpus.prime[glyph], 0) % modulus;
}

/**
 * An unrestricted row may output only ONE glyph for a fixed plaintext value
 * in a fixed public state, even when the row is nonbijective.
 *
 * @param {number[][]} ciphertextWords
 * @param {'word'|'eight'|'position'} clock
 * @param {number} [modulus=29]
 * @returns {{capacity:number, groups:number, observed:number, collisionPairs:number, eligiblePairs:number}}
 */
function bound(ciphertextWords, clock, modulus = 29) {
  const rows = new Map();
  let observed = 0;
  for (let i = 1; i < ciphertextWords.length; i++) {
    const source = priorCipherwordState(ciphertextWords[i - 1], modulus);
    for (let j = 0; j < ciphertextWords[i].length; j++) {
      const phase = clock === 'word' ? 0 : clock === 'eight' ? j % 8 : j;
      const key = source * 14 + phase;
      let count = rows.get(key);
      if (!count) {
        count = Array(29).fill(0);
        rows.set(key, count);
      }
      count[ciphertextWords[i][j]]++;
      observed++;
    }
  }
  let capacity = 0;
  let collisionPairs = 0;
  let eligiblePairs = 0;
  for (const count of rows.values()) {
    capacity += Math.max(...count);
    collisionPairs += count.reduce((n, x) => n + x * (x - 1), 0);
    const size = count.reduce((a, b) => a + b, 0);
    eligiblePairs += size * (size - 1);
  }
  return {capacity, groups: rows.size, observed, collisionPairs, eligiblePairs};
}

const word = bound(words, 'word');
const eight = bound(words, 'eight');
const position = bound(words, 'position');
assert.deepEqual(
  {word: word.capacity, eight: eight.capacity, position: position.capacity},
  {word: 688, eight: 1154, position: 1276}
);
assert.equal(word.observed, 12948);
assert.equal(word.groups, 29);
assert.equal(eight.groups, 232);
assert.equal(position.groups, 348);
assert.equal(word.collisionPairs, 200770);
assert.equal(word.eligiblePairs, 5838488);
const word32 = bound(words, 'position', 32);
const word60 = bound(words, 'position', 60);
assert.equal(word32.capacity, 1320);
assert.equal(word32.groups, 375);
assert.equal(word60.capacity, 1682);
assert.equal(word60.groups, 658);
console.log('ORIGINAL', JSON.stringify({word, eight, position, word32, word60}));

/** Source-native GP29 spelling, including the attested composite NG and IA runes. */
function toGP(raw) {
  const str = raw.toUpperCase()
    .replaceAll('QU', 'CW')
    .replaceAll('V', 'U')
    .replaceAll('K', 'C')
    .replaceAll('Z', 'S');
  const compounds = [
    ['ING', 21], ['TH', 2], ['EO', 12], ['NG', 21],
    ['OE', 22], ['AE', 25], ['IA', 27], ['EA', 28], ['IO', 27]
  ];
  const output = [];
  for (let i = 0; i < str.length;) {
    const found = compounds.find(([token]) => str.startsWith(token, i));
    if (found) {
      output.push(found[1]);
      i += found[0].length;
    } else {
      const rune = corpus.translit.indexOf(str[i]);
      if (rune < 0) return null;
      output.push(rune);
      i++;
    }
  }
  return output;
}

function makeRng(init) {
  let seed = init >>> 0;
  return () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 0x100000000;
  };
}

/** Fixed-length word sampling preserves every printed original word length. */
function sourcePools(text) {
  const pools = Array.from({length: 15}, () => []);
  for (const match of text.match(/[A-Za-z]+/g) || []) {
    const encoded = toGP(match);
    if (encoded && encoded.length <= 14) pools[encoded.length].push(encoded);
  }
  for (const target of words) {
    assert(pools[target.length].length > 0, 'Absent source word of length ' + target.length);
  }
  return pools;
}

function sampleWords(pools, rng) {
  return words.map((word) => {
    const pool = pools[word.length];
    return pool[Math.floor(rng() * pool.length)];
  });
}

/** An independent, deliberately secret 29-way bijection for each public row. */
function buildPermutations(seed) {
  const rng = makeRng(seed);
  return Array.from({length: 29 * 14}, () => {
    const values = Array.from({length: 29}, (_, i) => i);
    for (let i = values.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [values[i], values[j]] = [values[j], values[i]];
    }
    return values;
  });
}

function encryptAndRecover(plaintxt, keys) {
  const encrypted = [];
  const recovered = [];
  let previous = null;
  for (const word of plaintxt) {
    const state = previous === null ? 0 : priorCipherwordState(previous);
    const cipherword = word.map((r, j) => keys[state * 14 + j][r]);
    const plainword = cipherword.map((c, j) => keys[state * 14 + j].indexOf(c));
    encrypted.push(cipherword);
    recovered.push(plainword);
    previous = cipherword;
  }
  assert.deepEqual(recovered, plaintxt);
  return encrypted;
}

const controls = [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt'
];
const samples = 300;
let positive = false;
for (const filename of controls) {
  const pools = sourcePools(file(filename));
  const rng = makeRng(0x33012016);
  const eCounts = [];
  for (let trial = 0; trial < samples; trial++) {
    const simulated = sampleWords(pools, rng);
    let count = 0;
    for (const word of simulated.slice(1)) {
      for (const glyph of word) if (glyph === E) count++;
    }
    eCounts.push(count);
  }
  eCounts.sort((a, b) => a - b);
  assert(eCounts[0] > position.capacity, 'Source-native control falls within original mod29 capacity');
  assert(eCounts[0] > word32.capacity, 'Source-native control falls within original mod32 capacity');
  console.log('NATIVE_CONTROL', JSON.stringify({
    source: filename,
    simulations: samples,
    minE: eCounts[0],
    medianE: eCounts[Math.floor(samples / 2)],
    maxE: eCounts[samples - 1],
    originalUpper29: position.capacity, originalUpper32: word32.capacity
  }));
  if (!positive) {
    const plaintext = sampleWords(pools, makeRng(0x1234abcd));
    const planted = encryptAndRecover(plaintext, buildPermutations(0x5eed3301));
    const cipherCapacity = bound(planted, 'position').capacity;
    const trueE = plaintext.slice(1).flat().filter((r) => r === E).length;
    assert(cipherCapacity >= trueE);
    console.log('POSITIVE_PLANT', JSON.stringify({
      runes: plaintext.flat().length, recovered: plaintext.flat().length,
      nativeE: trueE, ciphertextRowCapacity: cipherCapacity
    }));
    positive = true;
  }
}
console.log('PASS: original previous-word-prime-state modulo29 and modulo32 stationary alphabets exclude all sampled GP English controls; modulo60 is not excluded');
