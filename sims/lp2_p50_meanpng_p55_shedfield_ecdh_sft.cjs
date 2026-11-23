'use strict';

/** Source-fixed secp256k1 ECDH bridge between the original p50 key and conditional p55 SHED integers. */
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { createECDH, createHash, createDecipheriv } = require('node:crypto');

const root = path.resolve(__dirname, '..');
const source = (p) => JSON.parse(readFileSync(path.join(root, p), 'utf8'));
const hash = (b, alg = 'sha256') => createHash(alg).update(b).digest();
const lp2 = source('resources/liber-primus/lp2-corpus.json');
const grid = source('resources/liber-primus/base60-grid.json');
const text = readFileSync(path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const gp = new Map(lp2.runes.map((ch, i) => [ch, i]));
const page = (n) => lp2.pages.find((p) => p.page === n).indices;
const number29 = (a) => a.reduce((n, r) => 29n * n + BigInt(r), 0n);

/** GP29 coincidence index of an original/decoded runic tape. */
function ioc(a) {
  const f = Array(29).fill(0);
  for (const v of a) f[v]++;
  return f.reduce((n, x) => n + x * (x - 1), 0) / (a.length * (a.length - 1));
}

/** Standard Bitcoin compressed secp256k1 P2PKH; native Node.js crypto only. */
function p2pkh(secret) {
  const e = createECDH('secp256k1');
  e.setPrivateKey(secret);
  const h160 = hash(hash(e.getPublicKey(null, 'compressed')), 'ripemd160');
  const data = Buffer.concat([Buffer.from([0]), h160]);
  const bytes = Buffer.concat([data, hash(hash(data)).subarray(0, 4)]);
  const abc = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let n = BigInt('0x' + bytes.toString('hex'));
  let s = '';
  while (n > 0n) {
    s = abc[Number(n % 58n)] + s;
    n /= 58n;
  }
  for (const b of bytes) {
    if (b !== 0) break;
    s = '1' + s;
  }
  return s;
}

assert.equal(lp2.pages.length, 58);
assert.equal(lp2.pages.filter((p) => p.page <= 55).reduce((n, p) => n + p.indices.length, 0), 12956);
assert.equal(page(55).length, 76);
assert.equal(page(57).length, 95);
assert.equal(grid.rows.length, 32);
assert.ok(grid.rows.every((row) => row.length === 8));
const base60 = (token) => 60 * grid.alphabet.indexOf(token[0]) + grid.alphabet.indexOf(token[1]);
const table = Buffer.from(grid.rows.flat().map(base60));
assert.equal(hash(table).toString('hex'), '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const key = Buffer.from(grid.rows.map((row) => base60(row[4])));
assert.equal(key.length, 32);
assert.equal(p2pkh(key), '1Meanpng7jzYW69Cqmto1r2mGeEoynXdoK');

// The derivative plaintext transcription skips the runeless p50; its p55 is % segment 54.
const p55Text = text.split('%')[54];
const transcribed = Array.from(p55Text).filter((ch) => gp.has(ch)).map((ch) => gp.get(ch));
assert.deepEqual(transcribed, page(55));
assert.equal(transcribed[0], 21); // The p54->55 cross-page word's one-rune suffix.
const words = p55Text.replace(/^\s*ᛝ-/, '').replace(/[\/\s&$]/g, '').split(/[-.]+/).filter(Boolean);
assert.equal(words.length, 16);
const middle = [], shell = [];
for (const w of words) {
  const v = Array.from(w).map((ch) => gp.get(ch));
  assert.ok(v.length >= 2);
  shell.push(v[0], v.at(-1));
  middle.push(...v.slice(1, -1));
}
assert.equal(middle.length, 43);
assert.equal(shell.length, 32);
const N = number29(middle), E = number29(shell);
assert.equal(N.toString(), '510043531279477768552291351270111060625364732293226050492113768');
assert.equal(E.toString(), '54546906948733185277568038540584540814742666891');
assert.equal(N % 8n, 0n);
assert.equal(E % 43n, 0n);
const P = N / 8n, Q = E / 43n;
assert.equal(P.toString(), '63755441409934721069036418908763882578170591536653256311514221');
assert.equal(Q.toString(), '1268532719737981052966698570711268391040527137');

const trials = [
  ['conditional p55 prime P', P, '4dd01706306598ac89f2bad4b27db2c7331d5b2f8c961fe04e875838879d51ba', '805c99baaa6053b9425eb1151da46f17f89588cb0fdbfbed744d5269f874085e'],
  ['conditional p55 generator Q', Q, 'e7c82e03d514b9670ec169258f410e00e96622f4dffb281ae09e43599f74fbf8', 'f661edc88fe9a05d6ae10a21f0ded6fa161e9c601adc10ba7f5f4cb0e43930d5'],
];
for (const [label, scalar, expectedX, expectedFirst32] of trials) {
  const a = createECDH('secp256k1'), b = createECDH('secp256k1');
  a.setPrivateKey(key);
  b.setPrivateKey(Buffer.from(scalar.toString(16).padStart(64, '0'), 'hex'));
  const x = a.computeSecret(b.getPublicKey(null, 'compressed'));
  assert.equal(x.toString('hex'), expectedX);
  const minus = page(55).map((c, i) => (c - x[i % 32] % 29 + 29) % 29);
  const plus = page(55).map((c, i) => (c + x[i % 32]) % 29);
  assert.deepEqual(minus.map((p, i) => (p + x[i % 32]) % 29), page(55));

  // Full authentic 95-rune solved-p57 plaintext is encoded and exactly recovered independently.
  const known = page(57);
  const planted = known.map((p, i) => (p + x[i % 32]) % 29);
  assert.deepEqual(planted.map((c, i) => (c - x[i % 32] % 29 + 29) % 29), known);

  const raw = createDecipheriv('aes-256-ctr', x, Buffer.alloc(16)).update(table);
  assert.equal(raw.length, 256);
  assert.equal(raw.subarray(0, 32).toString('hex'), expectedFirst32);
  const original = page(55).map((r) => lp2.translit[r]).join('');
  const decoded = minus.map((r) => lp2.translit[r]).join('');
  console.log(JSON.stringify({
    source: label, x: x.toString('hex'), p55OriginalIoC: ioc(page(55)),
    p55MinusIoC: ioc(minus), p55PlusIoC: ioc(plus),
    p55Original: original, p55Minus: decoded,
    aes256CtrFirst32: raw.subarray(0, 32).toString('hex'),
    aes256CtrPrintable: Array.from(raw).filter((n) => n >= 32 && n < 127).length,
    aes256CtrDirectGpBytes: Array.from(raw).filter((n) => n < 29).length,
    p55Replay: '76/76', solvedOriginalPlant: '95/95'
  }));
}
console.log('PASS original p50/p55 byte and rune inputs, two ECDH receivers, solved-native controls');
