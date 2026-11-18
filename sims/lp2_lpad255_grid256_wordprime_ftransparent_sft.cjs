'use strict';

/**
 * Original-input SFT: one byte per LP2 p3-p7 word selects the start of
 * a resetting prime-totient clock. Check both endpoints of the 256-byte
 * source table and both GP29 directions, including plaintext-F bypass.
 *
 * This is a finite, speculative source-to-receiver hypothesis. It does
 * not claim that LPAD, the table pairing, or the word clock was authored.
 *
 * Node.js 22, Windows 11:
 *   node sims/lp2_lpad255_grid256_wordprime_ftransparent_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
/** @param {string} name @returns {string} */
function read(name) {
  return fs.readFileSync(path.join(root, name), 'utf8');
}

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const source = read('resources/liber-primus/lp2-transcription.txt');
const alphabet = corpus.runes;
const pageText = source.split('%').slice(3, 8).join('')
  .replace(/[\/\r\n]/g, '').replace(/[&$]/g, '.');
const words = pageText.split(/[.-]/).filter(Boolean)
  .map((word) => [...word].map((glyph) => alphabet.indexOf(glyph)));
assert.ok(words.every((word) => word.length > 0 &&
  word.every((letter) => letter >= 0)));
assert.equal(words.length, 255);
const printed = corpus.pages.slice(3, 8).flatMap((page) => page.indices);
assert.equal(printed.length, 1145);
assert.deepEqual(words.flat(), printed);
assert.equal(Math.max(...words.map((word) => word.length)), 12);
assert.equal(grid.bytes.length, 256);
assert.deepEqual(grid.bytes.slice(0, 3), [203, 231, 167]);

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const primes = [];
  for (let candidate = 2; primes.length < count; candidate++) {
    let isPrime = true;
    for (let divisor = 2; divisor * divisor <= candidate; divisor++) {
      if (candidate % divisor === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) primes.push(candidate);
  }
  return primes;
}
const primes = firstPrimes(300);
/** @param {number} n @returns {number} */
function mod29(n) {
  return ((n % 29) + 29) % 29;
}

/**
 * Exact inverse as a dynamic program over distinct prime clocks. A
 * ciphertext F may be plaintext F without consuming a prime, or an
 * enciphered non-F consuming a prime. Every non-F ciphertext symbol
 * must decode to non-F; otherwise it violates the proven p56 rule.
 * @param {number[]} cipher GP29 indices
 * @param {number} start 0-based index in the prime sequence
 * @param {-1|1} direction Sign of decrypting key shift
 * @returns {number} Total complete valid inverse paths
 */
function inversePathCount(cipher, start, direction) {
  /** @type {Map<number, number>} */
  let clocks = new Map([[start, 1]]);
  for (const symbol of cipher) {
    const next = new Map();
    for (const [keyIndex, paths] of clocks) {
      if (symbol === 0) {
        next.set(keyIndex, (next.get(keyIndex) || 0) + paths);
      }
      const decoded = mod29(symbol + direction * (primes[keyIndex] - 1));
      if (decoded !== 0) {
        next.set(keyIndex + 1, (next.get(keyIndex + 1) || 0) + paths);
      }
    }
    clocks = next;
    if (clocks.size === 0) return 0;
  }
  return [...clocks.values()].reduce((sum, paths) => sum + paths, 0);
}

/**
 * Exact source-style forward transform with plaintext-F transparency.
 * @param {number[]} plaintext GP29 indices
 * @param {number} start 0-based prime start index
 * @param {-1|1} direction Decrypting sign, inverted during encryption
 * @returns {number[]} Ciphertext
 */
function encrypt(plaintext, start, direction) {
  let keyIndex = start;
  return plaintext.map((letter) => {
    if (letter === 0) return 0;
    return mod29(letter - direction * (primes[keyIndex++] - 1));
  });
}

/**
 * Assert exact forward reconstruction of a specified known plaintext.
 * @param {number[]} cipher
 * @param {number[]} plaintext
 * @param {number} start
 * @param {-1|1} direction
 */
function assertKnownPlaintext(cipher, plaintext, start, direction) {
  assert.deepEqual(encrypt(plaintext, start, direction), cipher);
  assert.ok(inversePathCount(cipher, start, direction) > 0);
}

/** @param {string} phrase @returns {number[]} */
function sourceGp(phrase) {
  const letters = corpus.translit.map((token, i) => ({ token, i }))
    .sort((a, b) => b.token.length - a.token.length);
  const indices = [];
  for (const word of phrase.split(' ')) {
    for (let position = 0; position < word.length;) {
      const found = letters.find(({ token }) => word.startsWith(token, position));
      assert.ok(found);
      indices.push(found.i);
      position += found.token.length;
    }
  }
  return indices;
}

// Exact independent solved-page p56 positive: one F at index 56 is
// transparent, the four remaining ciphertext Fs are encrypted.
const actualP56 = corpus.pages.find((page) => page.page === 56).indices;
const knownP56 = sourceGp('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE');
assert.equal(actualP56.length, 85);
assert.equal(knownP56.length, 85);
assertKnownPlaintext(actualP56, knownP56, 0, -1);
assert.equal(inversePathCount(actualP56, 0, -1), 22);

// Independently plant 255 exact source-length F-transparent words from
// genuine clear GP p57. Every planted inverse must remain admissible.
const clear = corpus.pages.find((page) => page.page === 57).indices;
let cursor = 0;
const reports = [];
for (const offset of [0, 1]) {
  for (const direction of /** @type {Array<-1|1>} */ ([-1, 1])) {
    let impossible = 0;
    let possible = 0;
    let ambiguous = 0;
    let pathsTotal = 0;
    /** @type {number[]} */
    const firstImpossible = [];
    for (let i = 0; i < words.length; i++) {
      const start = grid.bytes[i + offset];
      const count = inversePathCount(words[i], start, direction);
      if (count === 0) {
        impossible++;
        if (firstImpossible.length < 10) firstImpossible.push(i);
      } else {
        possible++;
        pathsTotal += count;
        if (count > 1) ambiguous++;
      }
      const planted = words[i].map((_, j) => clear[(cursor + j) % clear.length]);
      const synthetic = encrypt(planted, start, direction);
      assertKnownPlaintext(synthetic, planted, start, direction);
      cursor += words[i].length;
    }
    reports.push({ gridOffset: offset, direction, possible,
      impossible, ambiguous, pathsTotal, firstImpossible });
  }
}
assert.deepEqual(reports.map((r) => [
  r.gridOffset, r.direction, r.possible, r.impossible, r.ambiguous,
  r.pathsTotal
]), [
  [0, -1, 207, 48, 21, 228],
  [0, 1, 216, 39, 18, 234],
  [1, -1, 218, 37, 18, 236],
  [1, 1, 221, 34, 19, 240]
]);

console.log(JSON.stringify({
  status: 'PASS: exact candidate excluded by original non-invertible words',
  source: 'LP2 p3-p7: 255 words / 1145 runes; p49-p51: 256 base60 byte cells',
  operation: 'one original table byte selects each word prime-clock start; phi(prime); optional plaintext-F bypass',
  p56KnownControl: { runes: 85, inversePaths: 22,
    exactExpectedPlaintextReencrypts: true },
  plantedControls: '255/255 clear-p57 length-preserving words recovered per variant',
  variants: reports,
  result: 'Every frozen offset/sign has 34-48 words with zero valid F-transparent inverse; no decoded unknown plaintext.'
}, null, 2));
