'use strict';

/**
 * Source-locked p57 prime-ordinal -> original 256-table XOR route.
 * Repeats the frozen four-unit selector, identifies its 167 output with the
 * historically archived 761.MP3 label, and checks one direct p55 consumer.
 *
 * Run on Node.js 22: node sims/lp2_terminal_xor_167mp3_word20_sft.cjs
 * The MP3 is an external source; only its documented basename and decimal
 * reversal are asserted here. No recovered unknown LP2 plaintext is claimed.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const table = JSON.parse(read('resources/liber-primus/base60-grid.json'));
const originalPages = read('resources/liber-primus/lp2-transcription.txt').split('%');
originalPages.splice(50, 0, '');
assert.equal(originalPages.length, 58);
assert.equal(corpus.pages[50].indices.length, 0);

const runeId = new Map(corpus.runes.map((rune, index) => [rune, index]));
assert.equal(runeId.size, 29);
/** @param {string} text @returns {number[]} */
const runeIndices = text => [...text].flatMap(ch => runeId.has(ch) ? [runeId.get(ch)] : []);
/** @param {number[]} runes @returns {number} */
const primeSum = runes => runes.reduce((sum, rune) => sum + corpus.prime[rune], 0);
/** @param {number} n @returns {number[]} */
function firstPrimes(n) {
  const out = [];
  for (let candidate = 2; out.length < n; candidate++) {
    let prime = true;
    for (let factor = 2; factor * factor <= candidate; factor++) {
      if (candidate % factor === 0) { prime = false; break; }
    }
    if (prime) out.push(candidate);
  }
  return out;
}
const primes = firstPrimes(300);
const primeOrdinal = new Map(primes.map((prime, index) => [prime, index + 1]));
const p57 = originalPages[57];
const units = p57.split('.').map(runeIndices).filter(x => x.length);
assert.deepEqual(units.map(primeSum), [449, 1259, 1031, 1229]);
const fourIndices = units.map(x => primeOrdinal.get(primeSum(x)));
assert.deepEqual(fourIndices, [87, 205, 173, 201]);
const words = p57.replace(/\//g, '').replace(/[.&$§]/g, '-')
  .split('-').map(runeIndices).filter(x => x.length > 0);
assert.equal(words.length, 20);
assert.equal(words.reduce((sum, word) => sum + word.length, 0), 95);

assert.equal(table.rows.length, 32);
assert.equal(table.byte_rows.length, 32);
assert.equal(table.alphabet.length, 60);
for (let row = 0; row < 32; row++) {
  assert.equal(table.rows[row].length, 8);
  assert.equal(table.byte_rows[row].length, 8);
  for (let col = 0; col < 8; col++) {
    const token = table.rows[row][col];
    const expected = table.alphabet.indexOf(token[0]) * 60 +
      table.alphabet.indexOf(token[1]);
    assert.equal(table.byte_rows[row][col], expected);
  }
}
const bytes = table.byte_rows.flat();
assert.equal(bytes.length, 256);
const selectedBytes = fourIndices.map(index => bytes[index - 1]);
assert.deepEqual(selectedBytes, [111, 194, 148, 110]);
assert.equal(selectedBytes.reduce((a, b) => a + b, 0), 563);

const xorPointer = index => index ^ bytes[index - 1];
const destinations = fourIndices.map(xorPointer);
assert.deepEqual(destinations, [56, 15, 57, 167]);
assert.equal(Number('761'.split('').reverse().join('')), destinations[3]);
// Independent stronger historical object: 2014 signed Stage10 actually links
// to /167.jpg, byte-identical to canonical first-release LP1 scan 15.jpg.
// Pinned external blob SHA and image identity are documented separately in
// im-results/2014-stage10-three-images-lp1-source-handoff.md.
const lp1P15Image = fs.readFileSync(path.join(root, 'resources/liber-primus/15.jpg'));
assert.equal(
  crypto.createHash('sha256').update(lp1P15Image).digest('hex'),
  'f163903bec1236f1c89c96343d0bd1dee610b697c3ba82514651f04c5fbee4b9',
);
assert.equal(destinations[1], 15);
assert.equal(destinations[3], 167);
const verifiedHistorical167 = {
  stage10Filename: '167.jpg',
  canonicalFirstReleaseScan: '15.jpg',
  lp1Page: 15,
  knownKey: 'FIRFUMFERENFE',
};
// The original 2013 recording is AUDIO/761.MP3 and has displayed runtime 2:47.
// The displayed 167 seconds is approximate, so no exact frame-duration claim.

const orbit = [];
let state = fourIndices[0];
do {
  assert.ok(state >= 1 && state <= 256);
  assert.ok(!orbit.includes(state));
  orbit.push(state);
  state = xorPointer(state);
  assert.ok(orbit.length <= 256);
} while (state !== fourIndices[0]);
assert.deepEqual(orbit, [
  87, 56, 104, 166, 180, 27, 182, 158, 101, 54,
  157, 169, 89, 138, 11, 151, 14, 10, 243, 217,
]);
assert.equal(orbit.length, words.length);

/** @param {number} x @returns {number} */
const mod29 = x => ((x % 29) + 29) % 29;
/** @param {number[]} a @returns {number} */
function ioc(a) {
  const count = Array(29).fill(0);
  for (const rune of a) count[rune]++;
  return count.reduce((sum, n) => sum + n * (n - 1), 0) /
    (a.length * (a.length - 1));
}
/**
 * The one frozen, exploratory direct GP29 additive consumer.
 * @param {number[]} input
 * @param {-1|1} sign
 * @returns {number[]}
 */
function apply(input, sign) {
  return input.map((c, i) => mod29(c + sign * (orbit[i % orbit.length] % 29)));
}
const p55 = corpus.pages[55].indices;
assert.equal(p55.length, 76);
const direct = [-1, 1].map(sign => {
  const decoded = apply(p55, sign);
  assert.deepEqual(apply(decoded, /** @type {-1|1} */ (-sign)), p55);
  // Positive control from source-authentic already-clear p57 with same key.
  const native = corpus.pages[57].indices;
  assert.deepEqual(apply(apply(native, /** @type {-1|1} */ (-sign)), sign), native);
  return { sign, ioc: ioc(decoded), gp: decoded.map(n => corpus.translit[n]).join(' ') };
});
assert.ok(Math.abs(direct[0].ioc - 0.03754385964912281) < 1e-12);
assert.ok(Math.abs(direct[1].ioc - 0.028771929824561403) < 1e-12);

// Independent authentic solved-p56 totient control with true F skip at 56.
const expectedWords = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const orderedTokens = corpus.translit.map((token, index) => ({ token, index }))
  .sort((a, b) => b.token.length - a.token.length);
const expectedP56 = [];
for (const word of expectedWords.split(' ')) {
  for (let i = 0; i < word.length;) {
    const item = orderedTokens.find(({ token }) => word.startsWith(token, i));
    assert.ok(item);
    expectedP56.push(item.index);
    i += item.token.length;
  }
}
let keyIndex = 0;
const decodedP56 = corpus.pages[56].indices.map((c, i) =>
  i === 56 ? 0 : mod29(c - (primes[keyIndex++] - 1)));
assert.equal(keyIndex, 84);
assert.deepEqual(decodedP56, expectedP56);
assert.equal(primeSum(decodedP56.slice(0, 5)), 311);
assert.equal(primeOrdinal.get(311), 64);

console.log(JSON.stringify({
  source: 'original p57, p56, pp49-51 table and 2013 761.MP3 label',
  fourIndices, selectedBytes, destinations,
  audio761Reverse: 167,
  independentHistorical2014Image: verifiedHistorical167,
  p57PrintedWords: words.length,
  xorOrbitLength: orbit.length,
  xorOrbit: orbit,
  p55RawIoc: ioc(p55),
  p55DirectConsumers: direct,
  solvedP56RunesRecovered: decodedP56.length,
  recoveredUnknownPlaintext: false,
}, null, 2));
