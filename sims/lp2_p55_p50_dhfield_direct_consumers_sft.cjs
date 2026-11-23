'use strict';
/**
 * A bounded, original-input test of two ways the conditional p55 SHED field
 * (prime P, primitive root Q) might operate on the real p50 byte table.
 * Node 22, CommonJS, read-only. No claim that Cicada authored either cipher.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash, createCipheriv, createDecipheriv } = require('node:crypto');

const root = path.resolve(__dirname, '..');
const load = (name) => JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', name), 'utf8'));
const corpus = load('lp2-corpus.json');
const grid = load('base60-grid.json');
const page = (n) => corpus.pages.find((p) => p.page === n).indices;
const P = 63755441409934721069036418908763882578170591536653256311514221n;
const Q = 1268532719737981052966698570711268391040527137n;

const digits29 = (xs) => xs.reduce((n, x) => 29n * n + BigInt(x), 0n);
const fragmentLengths = [4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
const p55 = page(55);
assert.equal(p55.length, 76);
assert.equal(fragmentLengths.reduce((s, n) => s + n, 0), 75);
const inner = [];
const outer = [];
let position = 1; // p55 initial rune finishes a genuine p54-to-p55 word.
for (const length of fragmentLengths) {
  const word = p55.slice(position, position + length);
  assert.equal(word.length, length);
  outer.push(word[0], word[word.length - 1]);
  inner.push(...word.slice(1, -1));
  position += length;
}
assert.equal(position, 76);
assert.equal(inner.length, 43);
assert.equal(outer.length, 32);
assert.equal(digits29(inner), 8n * P);
assert.equal(digits29(outer), 43n * Q);

const cells = grid.rows.flat();
const bytes = grid.byte_rows.flat();
assert.equal(cells.length, 256);
assert.equal(bytes.length, 256);
const radix = grid.alphabet;
assert.equal(radix.length, 60);
for (let i = 0; i < cells.length; i++) {
  const t = cells[i];
  assert.equal(t.length, 2);
  assert.equal(radix.indexOf(t[0]) * 60 + radix.indexOf(t[1]), bytes[i]);
  assert(bytes[i] >= 0 && bytes[i] <= 255);
}
const ciphertext = Buffer.from(bytes);
const sha256 = (b) => createHash('sha256').update(b).digest();
const digest = sha256(ciphertext).toString('hex');

const powmod = (a0, b0, mod) => {
  let a = a0 % mod;
  let b = b0;
  let out = 1n;
  while (b > 0n) {
    if (b & 1n) out = out * a % mod;
    a = a * a % mod;
    b >>= 1n;
  }
  return out;
};
const secret = powmod(Q, 8n * 43n, P);
assert.equal(secret, 40058585108914257367732574161222353642573409865793191134873737n);
const secretBytes = Buffer.from(secret.toString(16).padStart(52, '0'), 'hex');
assert.equal(secretBytes.length, 26);
const key = sha256(secretBytes);
assert.equal(key.toString('hex'), '40c0a1166d98e3cd7bfed42ed8540b8d67edc6ffbbf1636a7b95c5d8cec0e284');

const aes = (operation, algorithm, data) => {
  const iv = algorithm.endsWith('-ecb') ? null : Buffer.alloc(16);
  const cipher = operation === 'encrypt'
    ? createCipheriv(algorithm, key, iv)
    : createDecipheriv(algorithm, key, iv);
  cipher.setAutoPadding(false);
  return Buffer.concat([cipher.update(data), cipher.final()]);
};
const plaintextSample = Buffer.from('A SOURCE SHAPED PARABLE WITH A DEFINITE READABLE PREFIX. '.repeat(5).slice(0, 256).padEnd(256, ' '));
assert.equal(plaintextSample.length, 256);
const expected = {
  'aes-256-ctr': { first: '998c7e893cdba52bc0028363f1d9e186', printable: 102, gp29: 23 },
  'aes-256-cbc': { first: '9ebd29fb8b3678a29f4111b21e8d5342', printable: 101, gp29: 23 },
  'aes-256-ecb': { first: '9ebd29fb8b3678a29f4111b21e8d5342', printable: 87, gp29: 27 },
};
for (const [mode, want] of Object.entries(expected)) {
  const decoded = aes('decrypt', mode, ciphertext);
  assert.equal(decoded.length, 256);
  assert.deepEqual(aes('encrypt', mode, decoded), ciphertext);
  assert.deepEqual(aes('decrypt', mode, aes('encrypt', mode, plaintextSample)), plaintextSample);
  const printable = [...decoded].filter((v) => v >= 32 && v < 127).length;
  const gp29 = [...decoded].filter((v) => v < 29).length;
  assert.equal(decoded.subarray(0, 16).toString('hex'), want.first);
  assert.equal(printable, want.printable);
  assert.equal(gp29, want.gp29);
  console.log(mode, { first16: want.first, printable, directGP29: gp29 });
}

const key29 = bytes.map((b) => Number(powmod(Q, BigInt(b), P) % 29n));
const indexOfCoincidence = (stream) => {
  const histogram = Array(29).fill(0);
  for (const symbol of stream) histogram[symbol]++;
  return histogram.reduce((sum, count) => sum + count * (count - 1), 0) /
    (stream.length * (stream.length - 1));
};
const decode = (xs) => xs.map((symbol, i) => (symbol - key29[i] + 29) % 29);
const encode = (xs) => xs.map((symbol, i) => (symbol + key29[i]) % 29);
const solved = page(57);
const planted = Array.from({ length: 256 }, (_, i) => solved[i % solved.length]);
assert.deepEqual(decode(encode(planted)), planted);
const pre = page(49);
const post = corpus.pages.filter((p) => p.page >= 51 && p.page <= 55).flatMap((p) => p.indices);
assert.equal(pre.length, 66);
assert(post.length >= 256);
for (const [name, receiver] of [['p49-pre-grid', pre], ['p51plus-post-grid', post.slice(0, 256)]]) {
  const decoded = decode(receiver);
  assert.deepEqual(encode(decoded), receiver);
  const ioc = indexOfCoincidence(decoded);
  console.log(name, { runes: decoded.length, indexOfCoincidence: Number(ioc.toFixed(8)) });
  if (name === 'p49-pre-grid') assert(Math.abs(ioc - 0.03449883) < 1e-7);
  else assert(Math.abs(ioc - 0.03458946) < 1e-7);
}
console.log('PASS: original p55 P/Q source exact, 256 printed p50 byte cells, field/GP29 and AES key consumers, exact original inverse and positive plants. Grid SHA256:', digest);
