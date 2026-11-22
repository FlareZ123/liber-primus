// @ts-check
/**
 * LP2 p40 red-eight / eight grid-column ChaCha20/256 gate.
 * Self-contained original-input SFT. Run from the repository root with Node.js 22.
 * Original manuscript supplies all key, nonce and ciphertext bytes; no tuning.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');

const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const grid = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-grid-256.json', 'utf8'));
const bodyWithHeader = corpus.pages.slice(40, 54).flatMap(/** @param {{indices:number[]}} page */ page => page.indices);
const nonce = bodyWithHeader.slice(0, 8);
const cipher = bodyWithHeader.slice(8);
assert.deepEqual(nonce, [0, 9, 19, 26, 6, 23, 25, 8]);
assert.equal(bodyWithHeader.length, 3008);
assert.equal(cipher.length, 3000);
assert.equal(grid.bytes.length, 256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(grid.bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

/** @param {number} x @param {number} n @returns {number} */
const rot = (x, n) => (x << n) | (x >>> (32 - n));

/**
 * ChaCha20 with 32-byte key, 64-bit nonce and zero high counter.
 * @param {number[]} key
 * @param {number[]} nonceBytes
 * @param {number} blockIndex
 * @returns {number[]}
 */
function chachaBlock(key, nonceBytes, blockIndex) {
  assert.equal(key.length, 32);
  assert.equal(nonceBytes.length, 8);
  const s = new Uint32Array(16);
  s.set([0x61707865, 0x3320646e, 0x79622d32, 0x6b206574]);
  /** @param {number[]} input @param {number} i */
  const read32 = (input, i) => (input[i] | (input[i + 1] << 8) |
    (input[i + 2] << 16) | (input[i + 3] << 24)) >>> 0;
  for (let i = 0; i < 8; i++) s[i + 4] = read32(key, i * 4);
  s[12] = blockIndex >>> 0;
  s[13] = 0;
  s[14] = read32(nonceBytes, 0);
  s[15] = read32(nonceBytes, 4);
  const v = Uint32Array.from(s);
  /** @param {number} a @param {number} b @param {number} c @param {number} d */
  function quarter(a, b, c, d) {
    v[a] = (v[a] + v[b]) >>> 0;
    v[d] = rot(v[d] ^ v[a], 16);
    v[c] = (v[c] + v[d]) >>> 0;
    v[b] = rot(v[b] ^ v[c], 12);
    v[a] = (v[a] + v[b]) >>> 0;
    v[d] = rot(v[d] ^ v[a], 8);
    v[c] = (v[c] + v[d]) >>> 0;
    v[b] = rot(v[b] ^ v[c], 7);
  }
  for (let round = 0; round < 10; round++) {
    quarter(0, 4, 8, 12); quarter(1, 5, 9, 13);
    quarter(2, 6, 10, 14); quarter(3, 7, 11, 15);
    quarter(0, 5, 10, 15); quarter(1, 6, 11, 12);
    quarter(2, 7, 8, 13); quarter(3, 4, 9, 14);
  }
  const out = [];
  for (let i = 0; i < 16; i++) {
    const word = (v[i] + s[i]) >>> 0;
    for (let b = 0; b < 4; b++) out.push((word >>> (8 * b)) & 255);
  }
  return out;
}

/** @param {number[]} key @param {number[]} iv @param {number} n @returns {number[]} */
function keystream(key, iv, n) {
  const out = [];
  for (let i = 0; i < n; i += 64) out.push(...chachaBlock(key, iv, i / 64));
  return out.slice(0, n);
}

/** @param {number[]} arr @returns {number} */
function ioc(arr) {
  const bins = Array(29).fill(0);
  for (const v of arr) { assert(v >= 0 && v < 29); bins[v]++; }
  return bins.reduce((sum, x) => sum + x * (x - 1), 0) /
    (arr.length * (arr.length - 1));
}

/** @param {number} actual @param {number} expected */
const almost = (actual, expected) => assert(Math.abs(actual - expected) < 1e-12,
  `expected ${expected}, got ${actual}`);

const kat = Buffer.from(chachaBlock(Array(32).fill(0), Array(8).fill(0), 0)).toString('hex');
assert.equal(kat.slice(0, 64), '76b8e0ada0f13d90405d6ae55386bd28bdd219b8a08ded1aa836efcc8b770dc7');

const reported = [];
const plant = Array.from({length: cipher.length},
  (_, i) => corpus.pages[57].indices[i % corpus.pages[57].indices.length]);
assert.equal(corpus.pages[57].indices.length, 95);
for (let col = 0; col < 8; col++) {
  const key = Array.from({length: 32}, (_, row) => grid.bytes[8 * row + col]);
  const ks = keystream(key, nonce, cipher.length);
  for (const sign of [-1, 1]) {
    const original = cipher.map((c, i) => (c + sign * (ks[i] % 29) + 29) % 29);
    const reciphered = original.map((p, i) => (p - sign * (ks[i] % 29) + 29) % 29);
    assert.deepEqual(reciphered, cipher);
    const encryptedPlant = plant.map((p, i) => (p - sign * (ks[i] % 29) + 29) % 29);
    const recoveredPlant = encryptedPlant.map((c, i) => (c + sign * (ks[i] % 29) + 29) % 29);
    assert.deepEqual(recoveredPlant, plant);
    reported.push({column: col, sign, index_of_coincidence: ioc(original)});
  }
}
const expected = [
  [0, -1, 0.034586862287429146], [0, 1, 0.03441947315771924],
  [1, -1, 0.034422807602534175], [1, 1, 0.0346377681449372],
  [2, -1, 0.03441591641658331], [2, 1, 0.03431810603534512],
  [3, -1, 0.034454151383794596], [3, 1, 0.0346648882960987],
  [4, -1, 0.03444703790152273], [4, 1, 0.0343730132266311],
  [5, -1, 0.034565744136934536], [5, 1, 0.03442525286206513],
  [6, -1, 0.03440280093364455], [6, 1, 0.03460597977103479],
  [7, -1, 0.03440680226742247], [7, 1, 0.034535956429921084]
];
for (let i = 0; i < expected.length; i++) {
  assert.equal(reported[i].column, expected[i][0]);
  assert.equal(reported[i].sign, expected[i][1]);
  almost(reported[i].index_of_coincidence, expected[i][2]);
}
almost(ioc(cipher), 0.03454440369011893);
reported.sort((a, b) => b.index_of_coincidence - a.index_of_coincidence);
console.log(JSON.stringify({
  source: 'LP2 physical pp40-53, red8 nonce + 3000 original body runes',
  nonce_hex: Buffer.from(nonce).toString('hex'),
  byte_table_sha256: '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290',
  baseline_ioc: ioc(cipher), source_native_plants: '16/16 exact',
  all_ciphers_reencrypt: '16/16 exact', test_vector: 'PASS', candidates: reported
}, null, 2));
