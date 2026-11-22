'use strict';
/**
 * A finite, source-led tri-fold reading of the signed-2016 FOLD clue.
 *
 * In the preserved 2016 central signed sentence, "the" occurs three times.
 * The independently proposed GP-prime / 58-page book map sends each "the"
 * to the one printed FOLD word (LP2 p14, word1). Three physical half-folds
 * collapse the original printed 32x8 table's eight columns to one eight-layer
 * stack for each of its 32 rows, matching the 32 marked full-book fragments.
 * The preexisting 13/31 five-dot ornament supports a binary reading as a
 * hypothesis, so this test takes each source byte's LSB in fold-layer order.
 *
 * Reading order of three folds has eight source-natural variants; no password
 * or key is fitted to original ciphertext. This is a conditional source-key
 * hypothesis and a narrow standard AEAD-envelope gate, not a plaintext claim.
 * Node.js 22, CommonJS: node sims/signed2016_trifold_parity_aead_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const table = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const signed = read('resources/historical/cicada2016-4gq25-outguess.asc');
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const central = signed.slice(signed.indexOf('Its words are'), signed.indexOf('Seek and you'));
const foldCount = (central.match(/\bthe\b/gi) || []).length;
assert.equal(foldCount, 3);
assert.equal(corpus.prime[2] + corpus.prime[18], 72); // TH + E
const sourcePage = 72 % 58;
const sourceWordIndex = Math.floor(72 / 58);
assert.deepEqual([sourcePage, sourceWordIndex], [14, 1]);
const originalPageWords = transcription.split('%')[14].replaceAll('/', '')
  .replaceAll('\r', '').replaceAll('\n', '')
  .split(/[-.&$§,:!?]/u).map(part => (part.match(/[ᚠ-᛿]+/gu) || []).join(''))
  .filter(Boolean);
assert.equal(originalPageWords[1], 'ᚠᚩᛚᛞ'); // FOLD, independent image transcription
assert.equal(table.bytes.length, 256);
assert.equal(table.shape, '32 rows by 8 columns across LP2 pages 49, 50, 51');
assert.equal(corpus.pages.filter(page => page.page < 56 && page.indices.length).length, 55);

const digits = corpus.pages.filter(page => page.page < 56 && page.indices.length)
  .flatMap(page => page.indices);
const p32 = corpus.pages.find(page => page.page === 32).indices;
const p55 = corpus.pages.find(page => page.page === 55).indices;
assert.deepEqual([digits.length, p32.length, p55.length], [12956, 121, 76]);

/**
 * Apply three half-folds to eight physical paper-column stacks, reversing
 * each moving stack when turning the sheet and laying it on the stationary
 * half. Bit k selects right-over-left (1) or left-over-right (0).
 * @param {number} pattern three fold-direction bits
 * @returns {number[]} order of original columns from top layer to bottom
 */
function foldOrder(pattern) {
  let stacks = Array.from({length: 8}, (_, i) => [i]);
  for (let fold = 0; fold < 3; fold++) {
    const n = stacks.length;
    const middle = n / 2;
    const next = [];
    for (let j = 0; j < middle; j++) {
      if ((pattern >> fold) & 1) {
        next.push([...stacks[n - 1 - j]].reverse().concat(stacks[j]));
      } else {
        next.push([...stacks[middle - 1 - j]].reverse()
          .concat(stacks[middle + j]));
      }
    }
    stacks = next;
  }
  assert.equal(stacks.length, 1);
  assert.equal(new Set(stacks[0]).size, 8);
  return stacks[0];
}

/**
 * Take the binary parity of the eight original table cells in physical
 * top-to-bottom fold order as one byte per printed table row.
 * @param {number[]} order original column indices
 * @returns {Buffer} 32-byte candidate key
 */
function parityKey(order) {
  return Buffer.from(Array.from({length: 32}, (_, row) =>
    order.reduce((byte, column, bit) =>
      byte | ((table.bytes[8 * row + column] & 1) << (7 - bit)), 0)));
}

/**
 * Source GP29 indices packed as one fixed-length big-endian integer.
 * @param {number[]} source GP indices
 * @returns {Buffer}
 */
function packGP29(source) {
  let value = 0n;
  for (const digit of source) {
    assert(Number.isInteger(digit) && digit >= 0 && digit < 29);
    value = value * 29n + BigInt(digit);
  }
  const result = Buffer.alloc(Math.ceil(source.length * Math.log2(29) / 8));
  for (let i = result.length - 1; i >= 0; i--) {
    result[i] = Number(value & 255n);
    value >>= 8n;
  }
  assert.equal(value, 0n);
  return result;
}

/**
 * Read a standard 12-byte IV / ciphertext / 16-byte authentication-tag
 * packet from a source bigint payload. Exact verification or null on
 * normal expected AEAD tag failure.
 * @param {'aes-256-gcm'|'chacha20-poly1305'} algorithm
 * @param {Buffer} key
 * @param {Buffer} packet
 * @returns {Buffer|null}
 */
function decrypt(algorithm, key, packet) {
  assert(packet.length >= 28);
  const iv = packet.subarray(0, 12);
  const cipher = packet.subarray(12, -16);
  const tag = packet.subarray(-16);
  const d = crypto.createDecipheriv(algorithm, key, iv, {authTagLength: 16});
  d.setAuthTag(tag);
  try {
    return Buffer.concat([d.update(cipher), d.final()]);
  } catch (error) {
    if (error instanceof Error && /authenticat|bad decrypt/i.test(error.message))
      return null;
    throw error;
  }
}

/**
 * Authenticate a planted native plaintext and explicitly reject a corrupted
 * tag, for both algorithms and all source-fold keys.
 * @param {'aes-256-gcm'|'chacha20-poly1305'} algorithm
 * @param {Buffer} key
 */
function plant(algorithm, key) {
  const plain = Buffer.from('SOURCE-LOCKED TRI-FOLD GP29 CONTROL', 'ascii');
  const iv = Buffer.alloc(12);
  const c = crypto.createCipheriv(algorithm, key, iv, {authTagLength: 16});
  const packet = Buffer.concat([iv, c.update(plain), c.final(), c.getAuthTag()]);
  assert.deepEqual(decrypt(algorithm, key, packet), plain);
  const corrupted = Buffer.from(packet);
  corrupted[corrupted.length - 1] ^= 1;
  assert.equal(decrypt(algorithm, key, corrupted), null);
}

const originalPackets = {
  completeUnsolvedBook: packGP29(digits),
  p32TreePage: packGP29(p32),
  p55LastUnknownPage: packGP29(p55)
};
assert.deepEqual(Object.values(originalPackets).map(v => v.length), [7868, 74, 47]);
const hypotheses = [];
for (let pattern = 0; pattern < 8; pattern++) {
  const order = foldOrder(pattern);
  const key = parityKey(order);
  for (const algorithm of ['aes-256-gcm', 'chacha20-poly1305']) {
    plant(algorithm, key);
    for (const [name, packet] of Object.entries(originalPackets)) {
      const plain = decrypt(algorithm, key, packet);
      hypotheses.push({folds: pattern.toString(2).padStart(3, '0'),
        algorithm, corpus: name, authenticated: plain !== null});
    }
  }
}
assert.equal(hypotheses.length, 48);
assert.equal(hypotheses.filter(row => row.authenticated).length, 0);
const keys = Array.from({length: 8}, (_, pattern) => {
  const order = foldOrder(pattern);
  return {folds: pattern.toString(2).padStart(3, '0'),
    columnsTopToBottom: order, keyHex: parityKey(order).toString('hex')};
});
assert.equal(new Set(keys.map(row => row.keyHex)).size, 8);
console.log(JSON.stringify({
  classification: 'conditional three-fold 32-byte source keys; finite AEAD negatives',
  source: {signedOccurrencesOfTheToFOLD: foldCount, tableShape: [32, 8],
    resultingOneColumnRows: 32, generatedKeyBytes: 32,
    originalUnknownRunes: digits.length},
  candidates: keys,
  packetBytes: Object.fromEntries(
    Object.entries(originalPackets).map(([key,value]) => [key,value.length])),
  positiveControlAuthentications: 16,
  negativeControlTamperRejections: 16,
  authenticatedOriginalPackets: hypotheses.filter(row => row.authenticated),
  originalAttempts: hypotheses.length,
  status: 'NO_NEW_UNKNOWN_PLAINTEXT'
},null,2));
