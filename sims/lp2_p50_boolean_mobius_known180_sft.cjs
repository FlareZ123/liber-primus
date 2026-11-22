'use strict';

/**
 * LP2 p50 32x8 table, the 2013 attested "MOBIUS" word, and 180 known
 * terminal GP runes: frozen Boolean-lattice GF(29) zeta/Mobius inverse gate.
 *
 * A historical Mobius reference is not a source-selected p50 decoder.
 * Source inputs are untouched; no fitted key, shift, IV or hidden symbol.
 * Run with Node.js 22 using checked-in original numeric resources.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

/** @param {string} filename @returns {any} */
function loadJson(filename) {
  return JSON.parse(fs.readFileSync(path.join(root, filename), 'utf8'));
}
const corpus = loadJson('resources/liber-primus/lp2-corpus.json');
const table = loadJson('resources/liber-primus/base60-grid.json');
const historicalWisdom = fs.readFileSync(
  path.join(root, 'resources/external/2013-0-wisdom.txt'), 'utf8'
);
assert.ok(historicalWisdom.includes('ᛗᚩᛒᛁᚢᛋ')); // First-party MOBIUS rune word.
const bytes = table.byte_rows.flat();
assert.equal(table.byte_rows.length, 32);
assert.ok(table.byte_rows.every((row) => row.length === 8));
assert.equal(bytes.length, 256);
assert.ok(bytes.every((byte) => Number.isInteger(byte) && byte >= 0 && byte < 256));

/** @param {number} x @returns {number} */
const mod = (x) => ((x % 29) + 29) % 29;

/**
 * In-place eight-stage subset zeta/Mobius transform, using the natural
 * 8-bit row-major p50 cell address. Both are bijective over GF(29).
 * @param {number[]} original 256 residues
 * @param {number} sign plus1 zeta; minus1 Mobius
 * @returns {number[]}
 */
function subsetTransform(original, sign) {
  assert.equal(original.length, 256);
  assert.ok(sign === 1 || sign === -1);
  const output = original.slice();
  for (let bit = 0; bit < 8; bit++) {
    const mask = 1 << bit;
    for (let i = 0; i < 256; i++) {
      if (i & mask) output[i] = mod(output[i] + sign * output[i ^ mask]);
    }
  }
  return output;
}

/** @param {number} n @returns {boolean} */
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}

/** @param {number} count @returns {number[]} */
function ordinaryPrimes(count) {
  const primes = [];
  for (let n = 2; primes.length < count; n++) if (isPrime(n)) primes.push(n);
  return primes;
}

// The published solved p56 cipher is P=C-phi(prime) over GF29, skipping the
// one literal plaintext F at local ciphertext index 56 (zero-based).
const encryptedP56 = corpus.pages.find((page) => page.page === 56).indices;
const printedP57 = corpus.pages.find((page) => page.page === 57).indices;
assert.equal(encryptedP56.length, 85);
assert.equal(printedP57.length, 95);
assert.equal(encryptedP56[56], 0);
const primes = ordinaryPrimes(84);
let keyPosition = 0;
const knownP56 = encryptedP56.map((symbol, position) => {
  if (position === 56) return 0;
  const key = primes[keyPosition++] - 1; // Euler phi on an ordinary prime.
  return mod(symbol - key);
});
assert.equal(keyPosition, 84);
assert.equal(knownP56.slice(0, 22)
  .map((index) => corpus.translit[index]).join(''), 'ANENDWITHINTHEDEEPWEBTHER');

// Full source-runic verification, including authentic 2014 F bypass.
let reencryptionKey = 0;
const reencrypted = knownP56.map((symbol, i) => {
  if (i === 56) return symbol;
  return mod(symbol + primes[reencryptionKey++] - 1);
});
assert.deepEqual(reencrypted, encryptedP56);
assert.equal(reencryptionKey, 84);
const known180 = knownP56.concat(printedP57);
assert.equal(known180.length, 180);
console.log('Solved controls: p56 85/85 prime-totient, p57 95/95 literal');

// Natural 32x8 shell walk, outermost to innermost (76,68,60,52).
/** @returns {number[][]} each ring holds absolute source byte-cell indices */
function rings() {
  const all = [];
  for (let layer = 0; layer < 4; layer++) {
    const top = layer;
    const bottom = 31 - layer;
    const left = layer;
    const right = 7 - layer;
    const shell = [];
    for (let col = left; col <= right; col++) shell.push(top * 8 + col);
    for (let row = top + 1; row <= bottom; row++) shell.push(row * 8 + right);
    for (let col = right - 1; col >= left; col--) shell.push(bottom * 8 + col);
    for (let row = bottom - 1; row > top; row--) shell.push(row * 8 + left);
    all.push(shell);
  }
  return all;
}
const ringIndices = rings();
assert.deepEqual(ringIndices.map((ring) => ring.length), [76, 68, 60, 52]);
assert.equal(new Set(ringIndices.flat()).size, 256);

/**
 * Eight natural shell orientations: four original-corner choices and the
 * clockwise / anticlockwise traversal, preserving the chosen first corner.
 * @returns {{name:string, cells:number[]}[]}
 */
function orientations() {
  const list = [];
  for (const flipRows of [false, true]) {
    for (const flipCols of [false, true]) {
      for (const reverse of [false, true]) {
        const cells = ringIndices.flatMap((shell) => {
          const shifted = shell.map((cell) => {
            const row = Math.floor(cell / 8);
            const col = cell % 8;
            return (flipRows ? 31 - row : row) * 8 +
              (flipCols ? 7 - col : col);
          });
          return reverse
            ? [shifted[0], ...shifted.slice(1).reverse()] : shifted;
        });
        assert.equal(new Set(cells).size, 256);
        list.push({
          name: 'r' + Number(flipRows) + 'c' + Number(flipCols) +
            'rev' + Number(reverse), cells
        });
      }
    }
  }
  return list;
}

const raw = bytes.map(mod);
const zeta = subsetTransform(raw, 1);
const mobius = subsetTransform(raw, -1);
assert.deepEqual(subsetTransform(zeta, -1), raw);
assert.deepEqual(subsetTransform(mobius, 1), raw);

const result = [];
for (const [operation, transformed] of [
  ['raw', raw], ['zeta', zeta], ['mobius', mobius]
]) {
  for (const orientation of orientations()) {
    const readout = orientation.cells.slice(76).map((cell) => transformed[cell]);
    assert.equal(readout.length, 180);
    const exactRuneMatches = readout.reduce((sum, symbol, i) =>
      sum + Number(symbol === known180[i]), 0);
    result.push({
      operation, orientation: orientation.name,
      exactRuneMatches,
      first30: readout.slice(0, 30).map((i) => corpus.translit[i]).join('')
    });
  }
}
assert.equal(result.length, 24);
const expectedBounds = {
  raw: [2, 13],
  zeta: [3, 13],
  mobius: [3, 12]
};
for (const name of Object.keys(expectedBounds)) {
  const matches = result.filter((item) => item.operation === name)
    .map((item) => item.exactRuneMatches);
  assert.deepEqual([Math.min(...matches), Math.max(...matches)],
    expectedBounds[name]);
  console.log(name + ' source-fixed eight orientations: ' +
    matches.join(', ') + ', range ' + expectedBounds[name].join('..'));
}
for (const candidate of result.sort((a, b) =>
  b.exactRuneMatches - a.exactRuneMatches)) {
  console.log(JSON.stringify(candidate));
}
console.log('PASS: original p50 table, complete p56 cipher replay, 95 clear ' +
  'p57 GP runes, 24 original-input known180 comparisons and inverse controls');
