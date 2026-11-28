'use strict';
// Source-constrained 32-byte inner / 8-byte boundary key+nonce test.
// Node 22 CommonJS. Tests only one continuous GP29 additive stream over LP2 p0-55.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createCipheriv, createHash } = require('node:crypto');
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const pages = corpus.pages.filter(p => p.page <= 55);
assert.equal(pages.length, 56);
const ciphertext = Buffer.from(pages.flatMap(p => p.indices));
assert.equal(ciphertext.length, 12956);
assert.ok(pages.every(p => p.status === 'unsolved' || p.runic_count === 0));

const gpIndex = new Map(corpus.translit.map((s, i) => [s, i]));
function gp(ch) { return gpIndex.get(ch === 'V' ? 'U' : ch); }
const inner = [], outer = [];
for (const word of ['CONSUMPTION', 'PRESERVATION', 'ADHERENCE', 'DIVINITY']) {
  outer.push(gp(word[0]), gp(word[word.length - 1]));
  for (const ch of word.slice(1, -1)) inner.push(gp(ch));
}
assert.equal(inner.length, 32);
assert.equal(outer.length, 8);
const registers = [
  { name: 'GP ordinal', key: Buffer.from(inner), nonce: Buffer.from(outer) },
  { name: 'GP prime', key: Buffer.from(inner.map(i => corpus.prime[i])), nonce: Buffer.from(outer.map(i => corpus.prime[i])) }
];
assert.equal(registers[0].key.toString('hex'), '03090f01130d100a0304120f12040118100a03170812041209050a010a090a10');
assert.equal(registers[0].nonce.toString('hex'), '05090d091812171a');
assert.equal(registers[1].key.toString('hex'), '071d3503472b3b1f070b4335430b03613b1f075917430b431d0d1f031f1d1f3b');
assert.equal(registers[1].nonce.toString('hex'), '0d1d2b1d61435967');

const sigma = Buffer.from('expand 32-byte k', 'ascii');
function rot(v, n) { return ((v << n) | (v >>> (32 - n))) >>> 0; }
function salsa20Block(key, nonce, counter) {
  assert.equal(key.length, 32);
  assert.equal(nonce.length, 8);
  const s = [
    sigma.readUInt32LE(0), key.readUInt32LE(0), key.readUInt32LE(4),
    key.readUInt32LE(8), key.readUInt32LE(12), sigma.readUInt32LE(4),
    nonce.readUInt32LE(0), nonce.readUInt32LE(4), counter >>> 0,
    Math.floor(counter / 0x100000000) >>> 0, sigma.readUInt32LE(8),
    key.readUInt32LE(16), key.readUInt32LE(20), key.readUInt32LE(24),
    key.readUInt32LE(28), sigma.readUInt32LE(12)
  ];
  const x = s.slice();
  for (let j = 0; j < 10; j++) {
    x[4] ^= rot((x[0] + x[12]) >>> 0, 7); x[8] ^= rot((x[4] + x[0]) >>> 0, 9); x[12] ^= rot((x[8] + x[4]) >>> 0, 13); x[0] ^= rot((x[12] + x[8]) >>> 0, 18);
    x[9] ^= rot((x[5] + x[1]) >>> 0, 7); x[13] ^= rot((x[9] + x[5]) >>> 0, 9); x[1] ^= rot((x[13] + x[9]) >>> 0, 13); x[5] ^= rot((x[1] + x[13]) >>> 0, 18);
    x[14] ^= rot((x[10] + x[6]) >>> 0, 7); x[2] ^= rot((x[14] + x[10]) >>> 0, 9); x[6] ^= rot((x[2] + x[14]) >>> 0, 13); x[10] ^= rot((x[6] + x[2]) >>> 0, 18);
    x[3] ^= rot((x[15] + x[11]) >>> 0, 7); x[7] ^= rot((x[3] + x[15]) >>> 0, 9); x[11] ^= rot((x[7] + x[3]) >>> 0, 13); x[15] ^= rot((x[11] + x[7]) >>> 0, 18);
    x[1] ^= rot((x[0] + x[3]) >>> 0, 7); x[2] ^= rot((x[1] + x[0]) >>> 0, 9); x[3] ^= rot((x[2] + x[1]) >>> 0, 13); x[0] ^= rot((x[3] + x[2]) >>> 0, 18);
    x[6] ^= rot((x[5] + x[4]) >>> 0, 7); x[7] ^= rot((x[6] + x[5]) >>> 0, 9); x[4] ^= rot((x[7] + x[6]) >>> 0, 13); x[5] ^= rot((x[4] + x[7]) >>> 0, 18);
    x[11] ^= rot((x[10] + x[9]) >>> 0, 7); x[8] ^= rot((x[11] + x[10]) >>> 0, 9); x[9] ^= rot((x[8] + x[11]) >>> 0, 13); x[10] ^= rot((x[9] + x[8]) >>> 0, 18);
    x[12] ^= rot((x[15] + x[14]) >>> 0, 7); x[13] ^= rot((x[12] + x[15]) >>> 0, 9); x[14] ^= rot((x[13] + x[12]) >>> 0, 13); x[15] ^= rot((x[14] + x[13]) >>> 0, 18);
  }
  const out = Buffer.alloc(64);
  for (let i = 0; i < 16; i++) out.writeUInt32LE((x[i] + s[i]) >>> 0, i * 4);
  return out;
}
function salsa20Stream(key, nonce, length) {
  const out = Buffer.alloc(length);
  for (let off = 0, counter = 0; off < length; off += 64, counter++) {
    salsa20Block(key, nonce, counter).copy(out, off, 0, Math.min(64, length - off));
  }
  return out;
}
function chacha20Stream(key, nonce, length) {
  // OpenSSL's original ChaCha20 layout: 64-bit little-endian counter || 64-bit nonce.
  const iv = Buffer.concat([Buffer.alloc(8), nonce]);
  const cipher = createCipheriv('chacha20', key, iv);
  return Buffer.concat([cipher.update(Buffer.alloc(length)), cipher.final()]);
}
function transform(input, stream, sign) {
  const out = Buffer.alloc(input.length);
  for (let i = 0; i < input.length; i++) out[i] = (input[i] + sign * (stream[i] % 29) + 29) % 29;
  return out;
}
function metrics(input) {
  const counts = Array(29).fill(0);
  let adjacentEqual = 0;
  for (let i = 0; i < input.length; i++) {
    counts[input[i]]++;
    if (i && input[i] === input[i - 1]) adjacentEqual++;
  }
  const ioc = counts.reduce((s, n) => s + n * (n - 1), 0) / (input.length * (input.length - 1));
  return {
    n: input.length,
    ioc: Number(ioc.toFixed(12)),
    adjacentEqual,
    adjacentEqualRate: Number((adjacentEqual / (input.length - 1)).toFixed(8)),
    top: counts.map((n, i) => ({ rune: corpus.translit[i], n })).sort((a, b) => b.n - a.n).slice(0, 8),
    prefix: input.subarray(0, 120).map ? Array.from(input.subarray(0, 120), i => corpus.translit[i]).join('') : Array.from(input.subarray(0, 120)).map(i => corpus.translit[i]).join('')
  };
}

// Published eSTREAM Salsa20/20 256-bit Set1vector0 known-answer check.
const vectors = JSON.parse(fs.readFileSync(path.join(root, 'resources/external/salsa20-estream-vectors-256.json'), 'utf8'));
const v = vectors[0].Set1vector0;
const katKey = Buffer.from(v.key1 + v.key2, 'hex');
const katNonce = Buffer.from(v.iv, 'hex');
assert.equal(salsa20Block(katKey, katNonce, 0).toString('hex').toUpperCase(), v.stream1expected);

// Independent cross-runtime fingerprint for the original ChaCha20 64-bit counter/nonce layout.
assert.equal(
  chacha20Stream(registers[0].key, registers[0].nonce, 64).toString('hex'),
  '32147dc87f06f2fa1aea9f74837049ef96944c2d4fa9880c51199d128225139287fea3ee23d371aa16d06ef27ebec34c579c1d44271a9cb5c21c17a9110837f7'
);

const results = [];
for (const register of registers) {
  for (const primitive of ['Salsa20/20', 'ChaCha20/20-64']) {
    const stream = primitive === 'Salsa20/20'
      ? salsa20Stream(register.key, register.nonce, ciphertext.length)
      : chacha20Stream(register.key, register.nonce, ciphertext.length);
    // Reversible planted source-native controls; these validate the GP29 stream inverse only.
    const p57 = Buffer.from(corpus.pages.find(p => p.page === 57).indices);
    const p57Stream = primitive === 'Salsa20/20'
      ? salsa20Stream(register.key, register.nonce, p57.length)
      : chacha20Stream(register.key, register.nonce, p57.length);
    const planted = transform(p57, p57Stream, -1);
    assert.deepEqual(transform(planted, p57Stream, 1), p57);
    for (const sign of [-1, 1]) {
      const decoded = transform(ciphertext, stream, sign);
      results.push({
        primitive,
        register: register.name,
        inverse: sign === -1 ? 'subtract' : 'add',
        ...metrics(decoded)
      });
    }
  }
}
const sourceSha256 = createHash('sha256').update(ciphertext).digest('hex');
console.log(JSON.stringify({
  corpus: 'resources/liber-primus/lp2-corpus.json',
  p0to55Runes: ciphertext.length,
  p0to55Sha256: sourceSha256,
  innerKeyBytes: inner.length,
  boundaryNonceBytes: outer.length,
  keyNonceRegisters: registers.map(r => ({ name: r.name, key: r.key.toString('hex'), nonce: r.nonce.toString('hex') })),
  salsa20EstreamSet1vector0: 'PASS',
  chacha20CrossRuntimePrefix: 'PASS',
  reversibleP57Plants: 4,
  results
}, null, 2));
