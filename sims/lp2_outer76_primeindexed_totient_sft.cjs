'use strict';
/**
 * Source-fixed direct p55 outer-ring prime-indexed totient key test.
 * Run: node sims/lp2_outer76_primeindexed_totient_sft.cjs
 *
 * Inputs: 2014 LP2 p55 ciphertext, 2014 pp49-51 32x8 table;
 * operations: source p15 prime-of-index, solved p56 Euler phi of primes,
 * and solved p57's circumference instruction.
 * Tests precisely the clockwise outer 76-cell ring, no fitted phase.
 * The proposed transfer is exploratory and not an authored decoder.
 */
const assert = require('node:assert/strict');
const db = require('../resources/liber-primus/lp2-corpus.json');
const table = require('../resources/liber-primus/base60-grid.json');

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const primes = [];
  for (let n = 2; primes.length < count; n++) {
    if (primes.every((p) => p * p > n || n % p !== 0)) primes.push(n);
  }
  return primes;
}

/** @param {number[]} symbols @returns {number} */
function coincidence(symbols) {
  const frequency = new Array(29).fill(0);
  for (const symbol of symbols) frequency[symbol]++;
  return frequency.reduce((sum, f) => sum + f * (f - 1), 0) /
    (symbols.length * (symbols.length - 1));
}

/** @param {number[]} text @param {number[]} key @param {number} sign @returns {number[]} */
function apply(text, key, sign) {
  return text.map((value, i) => (value + sign * key[i] + 29 * 29) % 29);
}

assert.equal(db.runes.length, 29);
assert.equal(table.byte_rows.length, 32);
assert(table.byte_rows.every((row) => row.length === 8));
const p55 = db.pages.find((page) => page.page === 55).indices;
const p57 = db.pages.find((page) => page.page === 57).indices;
assert.deepEqual([p55.length, p57.length], [76, 95]);
const flat = table.byte_rows.flat();
assert.equal(flat.length, 256);
assert(flat.every((byte) => Number.isInteger(byte) && byte >= 0 && byte < 256));

// Human-visible 32x8 circumference, starting at upper left and going clockwise.
const ring = [];
for (let col = 0; col < 8; col++) ring.push(col);
for (let row = 1; row < 32; row++) ring.push(8 * row + 7);
for (let col = 6; col >= 0; col--) ring.push(8 * 31 + col);
for (let row = 30; row >= 1; row--) ring.push(8 * row);
assert.equal(ring.length, 76);
assert.equal(new Set(ring).size, 76);

const primes = firstPrimes(256);
assert.deepEqual(primes.slice(0, 6), [2, 3, 5, 7, 11, 13]);
assert.equal(primes.at(-1), 1619);
// p15 uses one-based prime index; p56's key is phi(p)=p-1 for prime p.
const key = ring.map((cell) => (primes[flat[cell]] - 1) % 29);
assert.deepEqual(key.slice(0, 12), [1, 8, 10, 14, 27, 13, 12, 23, 26, 21, 2, 12]);

const decodedSubtract = apply(p55, key, -1);
const decodedAdd = apply(p55, key, +1);
assert.deepEqual(apply(decodedSubtract, key, +1), p55);
assert.deepEqual(apply(decodedAdd, key, -1), p55);
assert(Math.abs(coincidence(p55) - 0.037894736842105266) < 1e-12);
assert(Math.abs(coincidence(decodedSubtract) - 0.029473684210526315) < 1e-12);
assert(Math.abs(coincidence(decodedAdd) - 0.037192982456140354) < 1e-12);

// Independent genuine GP plaintext control, deliberately encrypted by this
// *artificial* key: detects encoder inversion without asserting historical use.
const plainControl = p57.slice(0, 76);
assert.deepEqual(apply(apply(plainControl, key, +1), key, -1), plainControl);
assert.deepEqual(apply(apply(plainControl, key, -1), key, +1), plainControl);
// Independent *source-authenticated* known-plaintext test of any claimed
// unified 256-position terminal-table transport, beyond p55's blind score.
// Original solved p56: skip only the literal plaintext-F at local index56,
// while ciphertext Fs at 35,47,51,74 consume a prime.
const physical56 = db.pages.find((page) => page.page === 56).indices;
const physical57 = db.pages.find((page) => page.page === 57).indices;
assert.deepEqual([physical56.length, physical57.length], [85, 95]);
let primeCursor = 0;
const p56Known = physical56.map((c, i) => i === 56 ? 0 :
  (c - (primes[primeCursor++] - 1) + 29 * 100) % 29);
/** @param {string} english @returns {number[]} */
function knownGp(english) {
  const tokens = db.translit.map((token, index) => ({token, index}))
    .sort((a,b) => b.token.length - a.token.length);
  const out = [];
  for (const word of english.split(' ')) {
    for (let i = 0; i < word.length;) {
      const hit = tokens.find(({token}) => word.startsWith(token,i));
      assert(hit, 'Missing GP symbol in authenticated solved word: ' + word);
      out.push(hit.index);
      i += hit.token.length;
    }
  }
  return out;
}
assert.deepEqual(p56Known, knownGp(
  'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE'
));
const rings = [];
for (let d = 0; d < 4; d++) {
  const cells = [], top = d, bottom = 31 - d, left = d, right = 7 - d;
  for (let x = left; x <= right; x++) cells.push(8 * top + x);
  for (let y = top + 1; y <= bottom; y++) cells.push(8 * y + right);
  for (let x = right - 1; x >= left; x--) cells.push(8 * bottom + x);
  for (let y = bottom - 1; y > top; y--) cells.push(8 * y + left);
  rings.push(cells);
}
assert.deepEqual(rings.map(x => x.length), [76,68,60,52]);
assert.deepEqual(rings[0], ring);
const innerCells = rings.slice(1).flat();
const innerKey = innerCells.map(cell => (primes[flat[cell]] - 1) % 29);
const innerCipher = physical56.concat(physical57);
const innerPlain = p56Known.concat(physical57);
assert.deepEqual([innerKey.length,innerCipher.length,innerPlain.length], [180,180,180]);
assert.deepEqual(innerPlain.slice(128), physical57.slice(43));
const knownInterior = [-1,0,+1].map(sign => {
  const readout = sign === 0 ? innerKey :
    innerCipher.map((cipher,i) => (cipher + sign*innerKey[i] + 29*29) % 29);
  const matches = readout.map((v,i) => Number(v === innerPlain[i]));
  return {sign, totalCorrect:matches.reduce((a,b)=>a+b,0),
    p56Correct:matches.slice(0,85).reduce((a,b)=>a+b,0),
    p57Correct:matches.slice(85).reduce((a,b)=>a+b,0)};
});
assert.deepEqual(knownInterior.map(x => [x.totalCorrect,x.p56Correct,x.p57Correct]),
  [[5,2,3],[7,1,6],[6,3,3]]);

const read = (a) => a.map((i) => db.translit[i]).join(' ');
console.log(JSON.stringify({
  input: 'Original LP2 p55 76 runes and pp49-51 76-cell outer table ring',
  hypothesizedKey: 'phi(prime(tableByte + 1)) mod 29',
  byteIndexOrigin: 1,
  tableTraversal: 'clockwise outer circumference upper-left first',
  originalIoC: coincidence(p55),
  keyHead: key.slice(0, 12),
  inverseReadouts: [
    {sign: 'subtract', IoC: coincidence(decodedSubtract), GP: read(decodedSubtract)},
    {sign: 'add', IoC: coincidence(decodedAdd), GP: read(decodedAdd)}
  ],
  genuineSolvedPagePlant: '76/76 each arithmetic sign',
  independentSolvedInterior180: knownInterior,
  conclusion: 'Original outputs remain nonlinguistic; no recovered p55 plaintext/key'
}, null, 2));
