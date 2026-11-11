'use strict';

/**
 * SFT: the two empty thirteen-dot-delimited source fragments, numbered 8
 * and 11 (zero-based), select two eight-byte rows from the original 32x8
 * LP2 table. Test the 16-byte concatenation as one *fixed candidate*
 * AES-128 key. The other 30 rows make exactly fifteen AES-128 blocks.
 *
 * This is conditional on fragment-to-row identity, which is not known to
 * be an authorial cipher rule. No nonce, key search or byte adjustment.
 *
 * Reproduce: node sims/lp2_empty_fragment_aes128_source_gate.cjs
 * Standard Node.js only. Does not write files.
 */
const assert = require('node:assert/strict');
const { createCipheriv, createDecipheriv, createHash } = require('node:crypto');
const grid = require('../resources/liber-primus/base60-grid.json');
const corpus = require('../resources/liber-primus/lp2-corpus.json');

const base60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const base59 = base60.replace('f', '');
const excluded = new Set([8, 11]);
const original = corpus.pages
  .filter((page) => page.page >= 0 && page.page <= 55)
  .flatMap((page) => page.indices);

assert.equal(original.length, 12956);
assert.equal(grid.rows.length, 32);
assert(grid.rows.every((row) => row.length === 8));
assert.equal(corpus.runes.length, 29);

/** @param {string} token @param {string} alphabet @returns {number} */
function decodeToken(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert.equal(token.length, 2);
  assert(high >= 0 && low >= 0);
  const byte = high * alphabet.length + low;
  assert(byte >= 0 && byte <= 255);
  return byte;
}

/** @param {string} alphabet @returns {Buffer[]} */
function tableRows(alphabet) {
  return grid.rows.map((row) => Buffer.from(row.map((token) => decodeToken(token, alphabet))));
}

/** @param {Buffer} key @param {Buffer} input @param {string} mode @returns {Buffer} */
function decrypt(key, input, mode) {
  const iv = mode === 'ecb' ? null : Buffer.alloc(16);
  const decipher = createDecipheriv('aes-128-' + mode, key, iv);
  if (mode !== 'ctr') decipher.setAutoPadding(false);
  return Buffer.concat([decipher.update(input), decipher.final()]);
}

/** @param {Buffer} key @param {number} count @returns {Buffer} */
function aesCounterPad(key, count) {
  const cipher = createCipheriv('aes-128-ctr', key, Buffer.alloc(16));
  return Buffer.concat([cipher.update(Buffer.alloc(count)), cipher.final()]);
}

/** @param {number[]} symbols @returns {number} */
function ioc(symbols) {
  const counts = Array(29).fill(0);
  for (const value of symbols) counts[value]++;
  return counts.reduce((total, n) => total + n * (n - 1), 0) / (symbols.length * (symbols.length - 1));
}

/** @param {number[]} symbols @returns {string} */
function preview(symbols) {
  return symbols.slice(0, 64).map((index) => corpus.translit[index]).join('');
}

/** @param {Buffer} input @returns {number} */
function printable(input) {
  return [...input].filter((b) => (b >= 32 && b <= 126) || b === 9 || b === 10 || b === 13).length / input.length;
}

/** @param {Buffer} input @returns {number} */
function gpByteRate(input) {
  return [...input].filter((b) => b < 29).length / input.length;
}

/** @param {number[]} plaintext @param {Buffer} pad @param {string} reducer @param {number} sign @returns {number[]} */
function transform(plaintext, pad, reducer, sign) {
  return plaintext.map((value, i) => {
    const step = reducer === 'mod29' ? pad[i] % 29 : Math.floor(pad[i] * 29 / 256);
    return ((value + sign * step) % 29 + 29) % 29;
  });
}

/**
 * A readable source-native GP control. The phrase is known before the
 * candidate model is run and is never used to fit an original result.
 * @param {number} n
 * @returns {number[]}
 */
function nativePlant(n) {
  const phrase = 'THE WORDS ARE THE MAP AND THEIR MEANING IS THE DIRECTION THE NUMBERS GIVE THE PATH THE SECRET IS WITHIN THE BOOK ';
  const letters = phrase.replace(/[^A-Z]/g, '');
  const sorted = corpus.translit.map((symbol, index) => ({symbol, index})).sort((a, b) => b.symbol.length - a.symbol.length);
  const values = [];
  for (let i = 0; i < letters.length;) {
    const match = sorted.find((x) => letters.startsWith(x.symbol, i));
    assert(match !== undefined, 'source-native text contains an unencodable character');
    values.push(match.index);
    i += match.symbol.length;
  }
  return Array.from({length:n}, (_, i) => values[i % values.length]);
}

const allResults = [];
for (const [codec, alphabet] of [['base60', base60], ['base59', base59]]) {
  const rows = tableRows(alphabet);
  const body = Buffer.concat(rows.filter((_, i) => !excluded.has(i)));
  assert.equal(body.length, 240);

  if (codec === 'base60') {
    assert.equal(rows[8].toString('hex'), '7aff19c0c749a96c');
    assert.equal(rows[11].toString('hex'), 'd3dcc631ec543823');
  }
  for (const [order, key] of [
    ['8-11', Buffer.concat([rows[8], rows[11]])],
    ['11-8', Buffer.concat([rows[11], rows[8]])],
  ]) {
    assert.equal(key.length, 16);
    for (const mode of ['ecb', 'cbc', 'ctr']) {
      const output = decrypt(key, body, mode);
      assert.equal(output.length, 240);
      const sha256 = createHash('sha256').update(output).digest('hex');
      console.log(JSON.stringify({test:'table',codec,order,mode,printable:printable(output),gpByteRate:gpByteRate(output),sha256,previewHex:output.subarray(0, 32).toString('hex')}));
    }
    const xor = Buffer.from(body.map((b, i) => b ^ key[i % key.length]));
    console.log(JSON.stringify({test:'table',codec,order,mode:'xor',printable:printable(xor),gpByteRate:gpByteRate(xor),previewHex:xor.subarray(0,32).toString('hex')}));

    const pad = aesCounterPad(key, original.length);
    for (const reducer of ['mod29', 'scale29']) {
      for (const sign of [-1, 1]) {
        const output = transform(original, pad, reducer, sign);
        const entry = {test:'original-runes',codec,order,reducer,sign,ioc:ioc(output),p0Ioc:ioc(output.slice(0,262)),preview:preview(output)};
        allResults.push(entry);
      }
    }

    // Fixed native-GP encryption and independent inverse regression.
    const plant = nativePlant(262);
    const plantPad = aesCounterPad(key, plant.length);
    const syntheticCipher = transform(plant, plantPad, 'mod29', 1);
    const recovered = transform(syntheticCipher, plantPad, 'mod29', -1);
    assert.deepEqual(recovered, plant);
  }
}
allResults.sort((a, b) => b.ioc - a.ioc);
for (const row of allResults) console.log(JSON.stringify(row));
console.log(JSON.stringify({test:'summary',models:allResults.length,bestFullIoc:allResults[0].ioc,bestP0Ioc:Math.max(...allResults.map((x)=>x.p0Ioc)),nativeControls:'4/4 exact GP29 recovery',interpretation:'Only these source-fixed AES-128/XOR table and zero-counter original-inverse models are tested; no original cipher claim from a round trip.'}));
