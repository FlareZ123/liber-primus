'use strict';

/**
 * LP2's unique two-word ciphertext bookend, its literal GP-prime word means,
 * and a source-frozen dual-pointer inverse using p50's printed byte table.
 *
 * This experiment deliberately changes no original input or book clock.
 * Run from the repository root with Node.js 22:
 *   node sims/lp2_terminal_ps_dual_pointer_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

/** @param {string} filename @returns {any} */
const json = (filename) => JSON.parse(fs.readFileSync(path.join(root, filename), 'utf8'));
const corpus = json('resources/liber-primus/lp2-corpus.json');
const grid = json('resources/liber-primus/base60-grid.json');
const text = fs.readFileSync(path.join(root, 'resources/lp2-transcription.txt'), 'utf8');
const bytes = grid.byte_rows.flat();
assert.equal(bytes.length, 256);

const runeToIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));
const primeToIndex = new Map(corpus.prime.map((prime, i) => [prime, i]));

/**
 * Preserve true printed word boundaries, while discarding line/page notation.
 * The numeric table contains no GP runes and is intentionally excluded.
 * @returns {string[]}
 */
function unsolvedWords() {
  const sections = text.split('$').slice(0, -2);
  assert.equal(sections.length, 8);
  return sections.join(' ')
    .replace(/[\/%\n\r&§0-9]/g, '')
    .split(/[.\-,;:?! ]+/)
    .filter((word) => word && [...word].every((rune) => runeToIndex.has(rune)));
}

/**
 * @param {string} word
 * @returns {{value:number, rune:string}|null}
 */
function exactPrimeMean(word) {
  const letters = [...word];
  const sum = letters.reduce((acc, rune) => acc + corpus.prime[runeToIndex.get(rune)], 0);
  if (sum % letters.length !== 0) return null;
  const value = sum / letters.length;
  const index = primeToIndex.get(value);
  return index === undefined ? null : { value, rune: corpus.translit[index] };
}

/**
 * @param {number} start
 * @returns {{path:number[], repeated:number, cycleLength:number, tailLength:number}}
 */
function pointerOrbit(start) {
  const path = [];
  const visited = new Map();
  let cell = start;
  while (!visited.has(cell)) {
    visited.set(cell, path.length);
    path.push(cell);
    cell = bytes[cell];
  }
  const tailLength = visited.get(cell);
  return { path, repeated: cell, cycleLength: path.length - tailLength, tailLength };
}

/** @param {number[]} a @returns {number} */
function ioc(a) {
  const frequencies = Array(29).fill(0);
  for (const letter of a) frequencies[letter]++;
  return frequencies.reduce((acc, n) => acc + n * (n - 1), 0) / (a.length * (a.length - 1));
}

/** @param {number[]} a @returns {string} */
function gp(a) {
  return a.map((v) => corpus.translit[v]).join('');
}

const words = unsolvedWords();
assert.equal(words.length, 2896);
assert.equal(words.reduce((n, word) => n + [...word].length, 0), 12956);
assert.deepEqual(words.slice(-2), ['ᛞᛄᚢ', 'ᛒᛖᛁ']);
const firstPair = words.findIndex((word, i) => word === 'ᛞᛄᚢ' && words[i + 1] === 'ᛒᛖᛁ');
assert.equal(firstPair, 1462);
assert.deepEqual(words.map((word, i) => word === 'ᛞᛄᚢ' && words[i + 1] === 'ᛒᛖᛁ' ? i : -1)
  .filter((i) => i >= 0), [1462, 2894]);

assert.deepEqual(exactPrimeMean(words[firstPair]), { value: 43, rune: 'P' });
assert.deepEqual(exactPrimeMean(words[firstPair + 1]), { value: 53, rune: 'S' });
const threeRuneWords = words.filter((w) => [...w].length === 3);
const validTripleMeans = threeRuneWords.map(exactPrimeMean).filter(Boolean);
assert.equal(threeRuneWords.length, 720);
assert.equal(validTripleMeans.length, 90);
assert.equal(validTripleMeans.slice(-2).map((x) => x.rune).join(''), 'PS');

const first = pointerOrbit(43);
const second = pointerOrbit(53);
assert.deepEqual({
  length: first.path.length, tail: first.tailLength,
  cycle: first.cycleLength, repeated: first.repeated
}, { length: 18, tail: 7, cycle: 11, repeated: 76 });
assert.deepEqual({
  length: second.path.length, tail: second.tailLength,
  cycle: second.cycleLength, repeated: second.repeated
}, { length: 18, tail: 7, cycle: 11, repeated: 115 });

const sameLengthGP = corpus.prime.map((prime, i) => ({
  prime, rune: corpus.translit[i], length: pointerOrbit(prime).path.length
})).filter((x) => x.length === 18);
assert.deepEqual(sameLengthGP.map((x) => x.rune), ['P', 'S', 'B']);

/**
 * Both streams independently start at GP-prime addresses and advance once
 * per actual output rune. No chosen phases, per-page fitting or extra layers.
 * @param {number} n
 * @returns {number[]}
 */
function dualKey(n) {
  const key = [];
  let firstCell = 43, secondCell = 53;
  for (let i = 0; i < n; i++) {
    key.push(((bytes[firstCell] - bytes[secondCell]) % 29 + 29) % 29);
    firstCell = bytes[firstCell];
    secondCell = bytes[secondCell];
  }
  return key;
}

const maxLength = Math.max(corpus.pages[27].indices.length, corpus.pages[55].indices.length);
const key = dualKey(maxLength);
const outcomes = [];
for (const { page, anchor } of [{ page: 27, anchor: 28 }, { page: 55, anchor: 70 }]) {
  const cipher = corpus.pages[page].indices;
  const plain = cipher.map((value, i) => (value - key[i] + 29) % 29);
  const opposite = cipher.map((value, i) => (value + key[i]) % 29);
  assert.deepEqual(plain.map((value, i) => (value + key[i]) % 29), cipher);
  assert.deepEqual(cipher.slice(anchor, anchor + 6), [23, 11, 1, 17, 18, 10]);
  outcomes.push({
    page,
    originalIoc: ioc(cipher),
    minusIoc: ioc(plain),
    plusIoc: ioc(opposite),
    decryptedAnchor: gp(plain.slice(anchor, anchor + 6)),
    first80: gp(plain.slice(0, 80))
  });
}
assert.notEqual(outcomes[0].decryptedAnchor, outcomes[1].decryptedAnchor);
console.log(JSON.stringify({
  originalWords: words.length,
  threeRuneWords: threeRuneWords.length,
  validExactPrimeMeans: validTripleMeans.length,
  lastValidMeans: 'PS',
  orbits: { P: first, S: second },
  gpPrimeSeedsWithOrbitLength18: sameLengthGP,
  results: outcomes,
  statement: 'No original unknown plaintext recovered; the P/S pointer difference is a failed candidate, not an established key'
}, null, 2));
