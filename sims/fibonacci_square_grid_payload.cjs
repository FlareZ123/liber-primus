'use strict';

/**
 * Test the LP2 page-15 Fibonacci-prime square as an AES-256 decryption key
 * for the actual LP2 pages49-51 256-byte base60 grid.
 *
 * Fixed, clue-derived 32-byte keys and physically plausible grid traversals
 * are evaluated. No per-byte key material is learned from the grid itself.
 *
 * @module fibonacci_square_grid_payload
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createCipheriv, createDecipheriv, createHash} = require('node:crypto');
const {tableBytes} = require('./base60_seeded_stream.cjs');
const {candidates, pack} = require('./fibonacci_spiral_key_derivation.cjs');
const {primeList, uniqueFibonacciPrimeRanks} = require('./fibonacci_prime_spiral.cjs');

const MODES = ['aes-256-ecb', 'aes-256-cbc', 'aes-256-ctr', 'aes-256-cfb', 'aes-256-ofb'];
const N = 256;
const ORIGINAL_SHA = '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290';

/** @param {Buffer} source Exactly 256-byte derived ciphertext. */
function layouts(source) {
  assert.equal(source.length, N);
  const grid = Array.from({length: 32}, (_, i) =>
    Array.from(source.subarray(i * 8, i * 8 + 8)));
  const asBuffer = (rows) => Buffer.from(rows.flat());
  return {
    'row-major': Buffer.from(source),
    'reverse': Buffer.from(source).reverse(),
    'column-major': Buffer.from(Array.from({length: N},
      (_, i) => grid[i % 32][Math.floor(i / 32)])),
    'row-snake': asBuffer(grid.map((row, i) =>
      i % 2 ? row.slice().reverse() : row)),
    'row-mirror': asBuffer(grid.map((row) => row.slice().reverse()))
  };
}

/** @returns {Array<{name:string,key:Buffer}>} */
function allKeys() {
  const seed = candidates();
  const ranks = uniqueFibonacciPrimeRanks();
  const primes = primeList(ranks.at(-1));
  const signed = ranks.map((k) => (3301 - primes[k - 1] + 65536) % 65536);
  const signedReverse = signed.map((x) => (65536 - x) % 65536);
  for (const [name, values] of Object.entries({
    'signed-spiral': signed, 'negative-signed-spiral': signedReverse
  })) {
    for (const endian of ['BE', 'LE']) {
      seed.push({name: name + ':' + endian, key: pack(values, endian)});
    }
  }
  return seed;
}

/**
 * Raw AES decryption, no padding assumptions.
 * @param {string} mode AES-256 mode.
 * @param {Buffer} key 32 bytes.
 * @param {Buffer} iv AES block IV where applicable.
 * @param {Buffer} ciphertext Block-aligned 256-byte input.
 */
function decode(mode, key, iv, ciphertext) {
  const instance = createDecipheriv(mode, key, mode === 'aes-256-ecb' ? null : iv);
  instance.setAutoPadding(false);
  return Buffer.concat([instance.update(ciphertext), instance.final()]);
}

/**
 * Lightweight detection for natural text or low-range GP-rune bytes.
 * @param {Buffer} bytes
 */
function score(bytes) {
  let printable = 0, asciiLetters = 0, lowGP = 0;
  const counts = new Uint16Array(256);
  for (const byte of bytes) {
    counts[byte]++;
    printable += +(byte >= 32 && byte <= 126 || byte === 9 || byte === 10 || byte === 13);
    asciiLetters += +(byte >= 65 && byte <= 90 || byte >= 97 && byte <= 122);
    lowGP += +(byte < 29);
  }
  let entropy = 0;
  for (const f of counts) if (f) {
    const p = f / bytes.length;
    entropy -= p * Math.log2(p);
  }
  return {printable, letters: asciiLetters, lowGP,
    entropy: Number(entropy.toFixed(6)),
    leading16: bytes.subarray(0, 16).toString('hex')};
}

/** @param {Buffer} grid */
function scan(grid) {
  const keys = allKeys(), layoutsByName = layouts(grid);
  const topPrintable = [], topRune = [], topLowEntropy = [];
  let tested = 0;
  const ivModes = (ciphertext, key) => [
    {name: 'zero', iv: Buffer.alloc(16)},
    {name: 'first-cipher-block', iv: ciphertext.subarray(0, 16)},
    {name: 'last-cipher-block', iv: ciphertext.subarray(240, 256)},
    {name: 'first-key-half', iv: key.subarray(0, 16)}
  ];
  for (const key of keys) {
    for (const [layout, ciphertext] of Object.entries(layoutsByName)) {
      for (const mode of MODES) {
        for (const iv of ivModes(ciphertext, key.key)) {
          if (mode === 'aes-256-ecb' && iv.name !== 'zero') continue;
          const decoded = decode(mode, key.key, iv.iv, ciphertext);
          assert.equal(decoded.length, 256);
          tested++;
          const metrics = score(decoded);
          const entry = {key: key.name, layout, mode, iv: iv.name, ...metrics};
          topPrintable.push(entry);
          topRune.push(entry);
          topLowEntropy.push(entry);
        }
      }
    }
  }
  topPrintable.sort((a, b) => b.printable - a.printable ||
    b.letters - a.letters);
  topRune.sort((a, b) => b.lowGP - a.lowGP);
  topLowEntropy.sort((a, b) => a.entropy - b.entropy);
  return {configurations: tested,
    topPrintable: topPrintable.slice(0, 6),
    topRune: topRune.slice(0, 6),
    lowEntropy: topLowEntropy.slice(0, 6)};
}

/** @returns {object} */
function run() {
  const raw = tableBytes();
  const hash = createHash('sha256').update(raw).digest('hex');
  assert.equal(hash, ORIGINAL_SHA);
  const result = scan(raw);
  const knownKey = candidates().find((x) => x.name === 'absolute-spiral:BE');
  assert.ok(knownKey);
  const ref = fs.readFileSync(path.join(__dirname, '..',
    'resources/control/shakespeare_first300k.txt'), 'utf8');
  const plain = Buffer.from(ref, 'utf8').subarray(0, 256);
  assert.equal(plain.length, 256);
  const iv = Buffer.alloc(16);
  const cipher = createCipheriv('aes-256-cbc', knownKey.key, iv);
  cipher.setAutoPadding(false);
  const ciphertext = Buffer.concat([cipher.update(plain), cipher.final()]);
  const recovered = decode('aes-256-cbc', knownKey.key, iv, ciphertext);
  assert.deepEqual(recovered, plain);
  const control = score(recovered);
  assert.ok(control.printable >= 240);
  return {
    originalGridSha256: hash,
    hypothesis: 'AES-256 grid payload masked under LP2 page15 16xuint16 key',
    keyDerivations: allKeys().length,
    gridLayouts: Object.keys(layouts(raw)),
    tested: result,
    positiveControl: {key: 'absolute-spiral:BE', mode: 'aes-256-cbc',
      sameInputRecovered: true, printability: control.printable},
    conclusion: 'Candidates require independent recognizable plaintext to be accepted'
  };
}
if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = {layouts, allKeys, decode, score, scan, run};
