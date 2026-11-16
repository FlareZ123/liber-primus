#!/usr/bin/env node
'use strict';

// Bounded source-derived test: interpret the 2014 Stage11 HTML numbers 133/331
// as DH public shares or private exponents under the p32/image-derived p=569,g=563.
// Then test only direct BASE29->GP29 repeating-key consumers and SHA-512-XOR of
// the 256-byte p50 stream. No fitted offsets, phases, or keys.

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const table = JSON.parse(read('resources/liber-primus/lp2-grid-256.json')).bytes;
const html = read('resources/historical/stage11-2014-index.html');
const title = Number(html.match(/<title>\s*(\d+)\s*<\/title>/i)?.[1]);
const divId = Number(html.match(/<div\s+id=["'](\d+)["']/i)?.[1]);
if (title !== 133 || divId !== 331) throw new Error('Stage11 HTML source values changed');
if (table.length !== 256) throw new Error('Expected the canonical 256-byte table');

const p32 = corpus.pages.find(p => p.page === 32).indices;
const prime = corpus.prime;
const rowSums = Array.from({length: 11}, (_, r) =>
  p32.slice(r * 11, r * 11 + 11).reduce((s, i) => s + prime[i], 0));
const colSums = Array.from({length: 11}, (_, c) =>
  p32.filter((_, i) => i % 11 === c).reduce((s, i) => s + prime[i], 0));
if (rowSums[0] !== 563 || colSums[0] !== 569) throw new Error('p32 axis checksum changed');

const mod = (x, n) => ((x % n) + n) % n;
function modPow(a, e, m) {
  let x = 1, b = BigInt(a), n = BigInt(e), q = BigInt(m);
  while (n > 0n) { if (n & 1n) x = Number((BigInt(x) * b) % q); b = (b * b) % q; n >>= 1n; }
  return x;
}
function dlog(g, y, p) {
  let x = 1;
  for (let e = 0; e < p - 1; e++) { if (x === y) return e; x = (x * g) % p; }
  throw new Error('No discrete log in selected group');
}
const alpha = '0123456789ABCDEFGHIJKLMNOPQRS';
function toBase29(n) {
  let s = '';
  do { s = alpha[n % 29] + s; n = Math.floor(n / 29); } while (n);
  return s;
}
function fromBase29(s) { return [...s].map(ch => alpha.indexOf(ch)); }
const p = 569, g = 563;
const pubA = title, pubB = divId;
const pubX = dlog(g, pubA, p), pubY = dlog(g, pubB, p);
const publicSecret = modPow(pubA, pubY, p);
if (publicSecret !== modPow(pubB, pubX, p)) throw new Error('Public-share DH agreement failed');

const privateA = modPow(g, title, p), privateB = modPow(g, divId, p);
const privateSecret = modPow(privateA, divId, p);
if (privateSecret !== modPow(privateB, title, p)) throw new Error('Private-exponent DH agreement failed');

const variants = [
  {name: '133/331 interpreted as public shares', A: pubA, B: pubB,
   x: pubX, y: pubY, secret: publicSecret, key: fromBase29(toBase29(publicSecret))},
  {name: '133/331 interpreted as private exponents', A: privateA, B: privateB,
   x: title, y: divId, secret: privateSecret, key: fromBase29(toBase29(privateSecret))},
  {name: '133 and 331 directly BASE29-encoded and concatenated',
   A: null, B: null, x: null, y: null, secret: null,
   key: [...fromBase29(toBase29(title)), ...fromBase29(toBase29(divId))]}
];

function ioc(a) {
  const counts = new Uint32Array(29);
  for (const x of a) counts[x]++;
  let n = 0;
  for (const x of counts) n += x * (x - 1);
  return n / (a.length * (a.length - 1));
}
function decryptPages(pages, key, mode, clock) {
  const out = [];
  let global = 0;
  for (const page of pages) {
    for (let i = 0; i < page.indices.length; i++) {
      const phase = clock === 'global' ? global + i : i;
      const c = page.indices[i], k = key[phase % key.length];
      out.push(mode === 'sub' ? mod(c - k, 29) :
               mode === 'add' ? mod(c + k, 29) : mod(k - c, 29));
    }
    global += page.indices.length;
  }
  return out;
}
const unknownPages = corpus.pages.filter(p => p.page < 56);
const selectedPages = [32, 55].map(n => corpus.pages.find(p => p.page === n));
const vigenere = [];
for (const v of variants) {
  for (const mode of ['sub', 'add', 'beaufort']) {
    for (const clock of ['global', 'page']) {
      const full = decryptPages(unknownPages, v.key, mode, clock);
      const p32Out = decryptPages([selectedPages[0]], v.key, mode, 'page');
      const p55Out = decryptPages([selectedPages[1]], v.key, mode, 'page');
      vigenere.push({
        candidate: v.name, key: v.key, mode, clock,
        fullLength: full.length, fullIoC: ioc(full),
        p32IoC: ioc(p32Out), p55IoC: ioc(p55Out),
        p32Prefix: p32Out.slice(0, 32).map(i => corpus.translit[i]).join(''),
        p55Prefix: p55Out.slice(0, 32).map(i => corpus.translit[i]).join('')
      });
    }
  }
}

// One source-motivated KDF check: SHA-512 of the DH secret (decimal or BASE29
// representation) XORed cyclically over the 256-byte p50 stream.
const hashTarget = '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';
const hashXor = [];
for (const v of variants.slice(0, 2)) {
  const encodings = [
    ['decimal ASCII', Buffer.from(String(v.secret), 'ascii')],
    ['BASE29 ASCII', Buffer.from(toBase29(v.secret), 'ascii')],
    ['uint16 big-endian', Buffer.from([v.secret >> 8, v.secret & 255])],
    ['uint32 big-endian', Buffer.from([0, 0, v.secret >> 8, v.secret & 255])]
  ];
  for (const [encoding, input] of encodings) {
    const digest = crypto.createHash('sha512').update(input).digest();
    const out = Buffer.from(table.map((b, i) => b ^ digest[i % digest.length]));
    const printable = [...out].filter(b => b === 9 || b === 10 || b === 13 || (b >= 32 && b <= 126)).length;
    const signatures = ['%PDF-', 'PK\\x03\\x04', 'GIF8', 'OggS', 'RIFF', 'ID3', 'MZ'];
    const prefix = out.subarray(0, 8);
    hashXor.push({
      candidate: v.name, encoding, digestMatchesP56Target: digest.toString('hex') === hashTarget,
      printableBytes: printable, printableFraction: printable / out.length,
      first16Hex: out.subarray(0, 16).toString('hex'),
      knownHeader: signatures.some(sig => prefix.equals(Buffer.from(sig, 'binary')))
    });
  }
}

// Algebraic positive control for all three direct GP29 key orientations.
const control = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28];
for (const v of variants) for (const mode of ['sub', 'add', 'beaufort']) {
  const k = v.key;
  const enc = control.map((x, i) => mode === 'sub' ? mod(x + k[i % k.length], 29) :
    mode === 'add' ? mod(x - k[i % k.length], 29) : mod(k[i % k.length] - x, 29));
  const dec = enc.map((x, i) => mode === 'sub' ? mod(x - k[i % k.length], 29) :
    mode === 'add' ? mod(x + k[i % k.length], 29) : mod(k[i % k.length] - x, 29));
  if (dec.some((x, i) => x !== control[i])) throw new Error('Synthetic inverse control failed');
}

console.log(JSON.stringify({
  evidence: {
    stage11Html: {title, divId, provenance: '2014 participant Git archive; not a PGP-signed HTTP response'},
    p32AxisSums: {firstRow: rowSums[0], firstColumn: colSums[0]},
    dh: {p, g, publicShares: {A: pubA, B: pubB, privateExponents: {x: pubX, y: pubY}, sharedSecret: publicSecret, base29: toBase29(publicSecret)},
      privateExponents: {x: title, y: divId, publicShares: {A: privateA, B: privateB}, sharedSecret: privateSecret, base29: toBase29(privateSecret)}},
    variants: variants.map(v => ({name: v.name, key: v.key, base29: v.secret === null ? null : toBase29(v.secret)}))
  },
  directRepeatingKeyTests: vigenere,
  sha512RepeatedXorOfP50: hashXor,
  syntheticRoundTrips: 'passed'
}, null, 2));
