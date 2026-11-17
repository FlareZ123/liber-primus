'use strict';
/**
 * Fixed original-source test: AES-256-CTR and historical RC4 receivers of the 32x8
 * numerical table, keyed by p57's literal SHED... innermost-52-rune passage.
 * Source p55 unknown outer 76 positions are never fitted or scored.
 * This is a bounded negative for a hypothetical cipher, not plaintext.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const grid = require('../resources/liber-primus/lp2-grid-256.json');
const corpus = require('../resources/liber-primus/lp2-corpus.json');

/** @param {number} n @returns {number[]} */
function firstPrimes(n) {
  const result = [];
  for (let x = 2; result.length < n; x += 1) {
    if (result.every((p) => x % p !== 0)) result.push(x);
  }
  return result;
}

/** @returns {Array<Array<[number, number]>>} */
function originalRings() {
  const rings = [];
  for (let k = 0; k < 4; k += 1) {
    const t = k;
    const b = 31 - k;
    const l = k;
    const r = 7 - k;
    const coords = [];
    for (let x = l; x <= r; x += 1) coords.push([t, x]);
    for (let y = t + 1; y <= b; y += 1) coords.push([y, r]);
    for (let x = r - 1; x >= l; x -= 1) coords.push([b, x]);
    for (let y = b - 1; y > t; y -= 1) coords.push([y, l]);
    rings.push(coords);
  }
  assert.deepEqual(rings.map((r) => r.length), [76, 68, 60, 52]);
  return rings;
}

/** @param {number} corner @param {number} direction @returns {number[]} */
function originalRingOrder(corner, direction) {
  const order = [];
  for (const ring of originalRings()) {
    const t = Math.min(...ring.map((p) => p[0]));
    const b = Math.max(...ring.map((p) => p[0]));
    const l = Math.min(...ring.map((p) => p[1]));
    const r = Math.max(...ring.map((p) => p[1]));
    const anchor = [[t, l], [t, r], [b, r], [b, l]][corner];
    const path = direction === 1 ? ring : [ring[0], ...ring.slice(1).reverse()];
    const start = path.findIndex(([y, x]) => y === anchor[0] && x === anchor[1]);
    assert.ok(start >= 0);
    const rotated = path.slice(start).concat(path.slice(0, start));
    order.push(...rotated.map(([y, x]) => y * 8 + x));
  }
  assert.equal(order.length, 256);
  assert.equal(new Set(order).size, 256);
  return order;
}

/** @param {Buffer} input @param {Buffer} key @param {boolean} encrypt @returns {Buffer} */
function aesCtr(input, key, encrypt) {
  const ctx = encrypt
    ? crypto.createCipheriv('aes-256-ctr', key, Buffer.alloc(16))
    : crypto.createDecipheriv('aes-256-ctr', key, Buffer.alloc(16));
  return Buffer.concat([ctx.update(input), ctx.final()]);
}

/** @param {Buffer} input @param {Buffer} key @returns {Buffer} */
function historicalRc4Xor(input, key) {
  const S = Array.from({length: 256}, (_, i) => i);
  let j = 0;
  for (let i = 0; i < 256; i += 1) {
    j = (j + S[i] + key[i % key.length]) & 255;
    [S[i], S[j]] = [S[j], S[i]];
  }
  const output = Buffer.alloc(input.length);
  let i = 0;
  j = 0;
  for (let k = 0; k < input.length; k += 1) {
    i = (i + 1) & 255;
    j = (j + S[i]) & 255;
    [S[i], S[j]] = [S[j], S[i]];
    output[k] = input[k] ^ S[(S[i] + S[j]) & 255];
  }
  return output;
}
assert.equal(historicalRc4Xor(Buffer.alloc(9), Buffer.from('Key')).toString('hex'),
  'eb9f7781b734ca72a7');

const B = Buffer.from(grid.bytes);
assert.equal(B.length, 256);
assert.equal(crypto.createHash('sha256').update(B).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const primes = firstPrimes(85);
let clock = 0;
const p56Cipher = corpus.pages.find((p) => p.page === 56).indices;
const p56 = p56Cipher.map((c, i) => (i === 56 ? c :
  ((c - (primes[clock++] - 1)) % 29 + 29) % 29));
assert.equal(clock, 84);
assert.equal(p56.map((i) => corpus.translit[i]).join(''),
  'ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE');
const p57 = corpus.pages.find((p) => p.page === 57).indices;
assert.equal(p57.length, 95);
const core = p57.slice(-52);
assert.equal(core.map((i) => corpus.translit[i]).join(''),
  'SHEDOUROWNCIRCUMFERENCESFINDTHEDIUINITYWITHINANDEMERGE');
const known = Buffer.from(p56.concat(p57));
assert.equal(known.length, 180);
const rawKeys = {
  printedTransliteration: Buffer.from(core.map((i) => corpus.translit[i]).join(''), 'utf8'),
  originalGPIndices: Buffer.from(core),
};
const trials = [];
for (const [keyForm, rawKey] of Object.entries(rawKeys)) {
  for (const direction of [1, -1]) {
    for (let corner = 0; corner < 4; corner += 1) {
      const order = originalRingOrder(corner, direction);
      const ciphertext = Buffer.from(order.map((k) => B[k]));
      for (const cipherName of ['AES-256-CTR', 'RC4']) {
        const key = cipherName === 'AES-256-CTR'
          ? crypto.createHash('sha256').update(rawKey).digest() : rawKey;
        const output = cipherName === 'AES-256-CTR'
          ? aesCtr(ciphertext, key, false) : historicalRc4Xor(ciphertext, key);
        const hits = [...known].reduce((n, target, j) => n + Number(output[76 + j] === target), 0);
        const gpRange = output.subarray(76).reduce((n, v) => n + Number(v < 29), 0);
        const synthetic = Buffer.concat([Buffer.alloc(76, 0), known]);
        if (cipherName === 'AES-256-CTR') {
          assert.deepEqual(aesCtr(aesCtr(synthetic, key, true), key, false), synthetic);
        } else {
          assert.deepEqual(historicalRc4Xor(historicalRc4Xor(synthetic, key), key), synthetic);
        }
        trials.push({cipherName, keyForm, direction, corner, hits, gpRange});
      }
    }
  }
}
assert.equal(trials.length, 32);
const maximum = Math.max(...trials.map((t) => t.hits));
assert.equal(maximum, 2);
console.log(JSON.stringify({n: 32, maximumExactKnownRuneHits: maximum,
  maxPossible: 180, best: trials.filter((t) => t.hits === maximum),
  trials}, null, 2));
console.log('PASS: inner-52 SHA256-keyed AES256-CTR and historical RC4 receivers rejected; no p55 decryption.');
