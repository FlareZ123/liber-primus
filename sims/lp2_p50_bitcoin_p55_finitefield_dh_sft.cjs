'use strict';

/** SFT: original p50 Bitcoin scalar + conditional p55 field modulus/generator finite-field DH. */
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { createHash, createECDH, createCipheriv, createDecipheriv } = require('node:crypto');

const root = path.resolve(__dirname, '..');
const load = (p) => JSON.parse(readFileSync(path.join(root, p), 'utf8'));
const corpus = load('resources/liber-primus/lp2-corpus.json');
const grid = load('resources/liber-primus/base60-grid.json');
const originalText = readFileSync(path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const rmap = new Map(corpus.runes.map((r, i) => [r, i]));
const sha256 = (v) => createHash('sha256').update(v).digest();
const b60 = (token) => grid.alphabet.indexOf(token[0]) * 60 + grid.alphabet.indexOf(token[1]);
const stream = Buffer.from(grid.rows.flat().map(b60));
const privateKey = Buffer.from(grid.rows.map((row) => b60(row[4])));
assert.equal(stream.length, 256);
assert.equal(privateKey.length, 32);
assert.equal(sha256(stream).toString('hex'), '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
assert.equal(privateKey.toString('hex'), '61f7669636e6566ac772adec530e360da9f5f63469949026b0c2463a90ee16b4');
const btc = createECDH('secp256k1'); btc.setPrivateKey(privateKey);
assert.equal(btc.getPublicKey(null, 'compressed').toString('hex'),
  '03ac234dba2f6b2891c4c6032e1378f2e29ed22ce18e34737fa94e34c8f1963a64');

const p55Raw = originalText.split('%')[54];
const rawRunes = Array.from(p55Raw).filter((r) => rmap.has(r)).map((r) => rmap.get(r));
const p55 = corpus.pages.find((p) => p.page === 55).indices;
assert.deepEqual(rawRunes, p55);
assert.equal(p55.length, 76);
const ws = p55Raw.replace(/^\s*ᛝ-/, '').replace(/[\/\s&$]/g, '').split(/[-.]+/).filter(Boolean);
assert.equal(ws.length, 16);
const inner = [], outer = [];
for (const w of ws) {
  const digits = Array.from(w).map((r) => rmap.get(r));
  assert.ok(digits.length >= 2);
  inner.push(...digits.slice(1, -1));
  outer.push(digits[0], digits.at(-1));
}
assert.equal(inner.length, 43);assert.equal(outer.length, 32);
const from29 = (a) => a.reduce((x, i) => x * 29n + BigInt(i), 0n);
const N = from29(inner), E = from29(outer);
assert.equal(N % 8n, 0n); assert.equal(E % 43n, 0n);
const P = N / 8n, Q = E / 43n;
assert.equal(P.toString(), '63755441409934721069036418908763882578170591536653256311514221');
assert.equal(Q.toString(), '1268532719737981052966698570711268391040527137');

/** Binary modular powering, standard finite-field DH. */
function modpow(g, e, p) {
  let r = 1n, b = g % p;
  for (; e > 0n; e >>= 1n, b = b * b % p) if (e & 1n) r = r * b % p;
  return r;
}
const exponent = BigInt('0x' + privateKey.toString('hex'));
const S = modpow(Q, exponent, P);
assert.equal(S.toString(), '32579403211500201287042576527659943856714297584948586011873661');
const bytes = Buffer.from(S.toString(16).padStart(52, '0'), 'hex');
assert.equal(bytes.length, 26);
assert.equal(bytes.toString('hex'), '144632c88b8fe4b0bafe12d38068f4ccc47fba098f75965ed17d');
const key = sha256(bytes);
assert.equal(key.toString('hex'), '8279bef3cf79bacf24872c682ac25676b7695f29168d898eb29fccbe82e6e4cf');
let num = S, digits = [];
while (num) {
  digits.push(Number(num % 29n));
  num /= 29n;
}
digits.reverse();
assert.equal(digits.length, 43);
assert.equal(from29(digits), S);

const coincidence = (a) => {
  const f = Array(29).fill(0);
  a.forEach((x) => f[x]++);
  return f.reduce((acc, x) => acc + x * (x - 1), 0) / (a.length * (a.length - 1));
};
assert.equal(corpus.pages.find((p) => p.page === 57).indices.length, 95);
const solved = corpus.pages.find((p) => p.page === 57).indices;
const plant = solved.map((p, i) => (p + digits[i % 43]) % 29);
assert.deepEqual(plant.map((c, i) => (c - digits[i % 43] + 29) % 29), solved);
for (const sign of [-1, 1]) {
  const dec = p55.map((c, i) => (c + sign * digits[i % 43] + 29) % 29);
  assert.deepEqual(dec.map((x, i) => (x - sign * digits[i % 43] + 29) % 29), p55);
  console.log(JSON.stringify({
    candidate: sign < 0 ? 'subtract 43 raw DH GP29 digits' : 'add 43 raw DH GP29 digits',
    originalIoC: coincidence(p55), decodedIoC: coincidence(dec),
    originalP55: p55.map((v) => corpus.translit[v]).join(''),
    decodedP55: dec.map((v) => corpus.translit[v]).join(''),
    positiveSolvedP57: '95/95'
  }));
}
const c = createDecipheriv('aes-256-ctr', key, Buffer.alloc(16)).update(stream);
assert.equal(c.subarray(0, 32).toString('hex'), 'b192c08efe521e9b0994d40f232123a3f572effa1f38e6d2884e875085bc28ac');
assert.equal(Array.from(c).filter((n) => n >= 32 && n < 127).length, 84);
assert.equal(Array.from(c).filter((n) => n < 29).length, 26);
const native = Buffer.from('LIBER PRIMUS IS THE WAY. ITS WORDS ARE THE MAP.');
const encrypted = createCipheriv('aes-256-ctr', key, Buffer.alloc(16)).update(native);
assert.deepEqual(createDecipheriv('aes-256-ctr', key, Buffer.alloc(16)).update(encrypted), native);
console.log(JSON.stringify({
  field: 'GF(P)', typedGenerator: Q.toString(), typedExponentSource: privateKey.toString('hex'),
  sharedFieldSecret: S.toString(), canonical26ByteSecret: bytes.toString('hex'),
  keySha256: key.toString('hex'), originalP50AesCtrFirst32: c.subarray(0, 32).toString('hex'),
  p50Printable: 84, p50DirectGpBytes: 26, aesPlant: 'PASS'
}));
console.log('PASS original p50/p55 finite-field DH direct original receivers and solved-page native control');
