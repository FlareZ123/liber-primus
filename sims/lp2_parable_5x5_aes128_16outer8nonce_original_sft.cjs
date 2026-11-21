'use strict';

/**
 * Source-constrained exploratory inverse: The original p57 PARABLE clause prime
 * ordinals [205,173,201] give three 5x5 corners of the original 32x8 p50 grid;
 * the 8-node p50 root173 readout supplies the missing NW corner169.
 *
 * Clockwise outer16 bytes are a candidate AES128 key, inner8 a CTR nonce with
 * zero 64-bit counter. This is an investigator-proposed cipher, not an authored
 * AES opcode. Check the 231 source bytes beyond the tile and native p55/p32
 * rune-index byte streams without tuning keys, IV, or plaintext.
 *
 * SFT: node sims/lp2_parable_5x5_aes128_16outer8nonce_original_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const grid = require('../resources/liber-primus/lp2-grid-256.json');
const corpus = require('../resources/liber-primus/lp2-corpus.json');

const tokens = grid.pages.flatMap((page) => page.tokens);
const base60 = Buffer.from(tokens.map((token) =>
  grid.alphabet.indexOf(token[0]) * 60 + grid.alphabet.indexOf(token[1])
));
assert.equal(base60.length, 256);
assert.equal(crypto.createHash('sha256').update(base60).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const radixF = grid.alphabet.indexOf('f');
assert.equal(radixF, 41);
assert.equal(Array.from(base60).filter((v) => v % 60 === radixF).length, 0);
const base59 = Buffer.from(base60.map((value) => {
  const major = Math.floor(value / 60);
  const minor = value % 60;
  return major * 59 + minor - Number(minor > radixF);
}));

/** @param {number} side @returns {Array<[number, number]>} */
function clockwiseRing(side) {
  /** @type {Array<[number, number]>} */
  const out = [];
  for (let x = 0; x < side; x += 1) out.push([0, x]);
  for (let y = 1; y < side; y += 1) out.push([y, side - 1]);
  for (let x = side - 2; x >= 0; x -= 1) out.push([side - 1, x]);
  for (let y = side - 2; y > 0; y -= 1) out.push([y, 0]);
  return out;
}
const outer = clockwiseRing(5).map(([row, col]) => (row + 21) * 8 + col + 1);
const inner = clockwiseRing(3).map(([row, col]) => (row + 22) * 8 + col + 2);
const center = 23 * 8 + 3;
assert.deepEqual([outer.length, inner.length, center], [16, 8, 187]);
assert.deepEqual([outer[0], outer[4], outer[8], outer[12]], [169, 173, 205, 201]);
assert.deepEqual(inner, [178, 179, 180, 188, 196, 195, 194, 186]);
const tile = new Set(Array.from({ length: 25 }, (_, i) =>
  (Math.floor(i / 5) + 21) * 8 + (i % 5) + 1
));
assert.equal(tile.size, 25);
assert.equal(outer.every((n) => tile.has(n)), true);
assert.equal(inner.every((n) => tile.has(n)), true);
assert.equal(tile.has(center), true);

/** @param {Buffer} key @param {Buffer} nonce @param {Buffer} data @returns {Buffer} */
function ctr(key, nonce, data) {
  assert.equal(key.length, 16);
  assert.equal(nonce.length, 8);
  const iv = Buffer.concat([nonce, Buffer.alloc(8)]);
  const stream = crypto.createDecipheriv('aes-128-ctr', key, iv);
  return Buffer.concat([stream.update(data), stream.final()]);
}

/** @param {number[]} symbols @returns {number} */
function ioc(symbols) {
  const counts = Array(29).fill(0);
  for (const v of symbols) counts[v] += 1;
  return counts.reduce((a, n) => a + n * (n - 1), 0)
    / (symbols.length * (symbols.length - 1));
}
const trials = [];
for (const [radix, table] of [['base60', base60], ['base59', base59]]) {
  const key = Buffer.from(outer.map((index) => table[index]));
  const nonce = Buffer.from(inner.map((index) => table[index]));
  const outside = Buffer.from(Array.from(table).filter((_, index) => !tile.has(index)));
  assert.equal(outside.length, 231);
  const recovered = ctr(key, nonce, outside);
  const printable = Array.from(recovered).filter((v) => v >= 32 && v <= 126).length;
  const pageScores = [];
  for (const pageNumber of [55, 32]) {
    const original = corpus.pages.find((page) => page.page === pageNumber).indices;
    const stream = ctr(key, nonce, Buffer.alloc(original.length));
    for (const sign of [-1, 1]) {
      const decoded = original.map((v, i) => ((v + sign * (stream[i] % 29)) % 29 + 29) % 29);
      const recoded = decoded.map((v, i) =>
        ((v - sign * (stream[i] % 29)) % 29 + 29) % 29);
      assert.deepEqual(recoded, original);
      pageScores.push({ page: pageNumber, sign, symbols: decoded.length, ioc: ioc(decoded),
        prefix: decoded.slice(0, 20).map((v) => corpus.translit[v]).join('') });
    }
  }
  // Authentic known GP-native clear p57 is a positive round-trip plant, not a
  // claim this hypothetical operation was used to encrypt historical p57.
  const sourceClear = corpus.pages.find((page) => page.page === 57).indices;
  const stream = ctr(key, nonce, Buffer.alloc(sourceClear.length));
  const synthetic = sourceClear.map((v, i) => (v + stream[i] % 29) % 29);
  const replay = synthetic.map((v, i) => (v - stream[i] % 29 + 29) % 29);
  assert.deepEqual(replay, sourceClear);
  trials.push({ radix, outerKeyHex: key.toString('hex'), nonceHex: nonce.toString('hex'),
    other231Printable: printable, originalPageScores: pageScores,
    sourcePlaintextPlant: { page: 57, symbols: sourceClear.length, restored: replay.length } });
}
assert.deepEqual(trials.map((t) => t.other231Printable), [84, 87]);
assert.ok(trials.every((t) => t.originalPageScores.every((p) => p.ioc < 0.042)));
console.log(JSON.stringify({
  hypothesis: 'AES128-CTR; clockwise source-tile outer16 key + inner8 nonce + zero counter',
  primeOrdinalCorners: [205, 173, 201, 169], outer, inner, center,
  sourceControlP57IoC: ioc(corpus.pages.find((page) => page.page === 57).indices),
  trials
}, null, 2));
console.log('PASS: source rectangle, exact original-data reversals, and negative untouched receivers');
