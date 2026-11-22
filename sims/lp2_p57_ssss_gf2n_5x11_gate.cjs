#!/usr/bin/env node
'use strict';

// Reproduce the source-constrained p57 -> 2013 SSSS -> p32 gate.
// No dependency beyond Node.js built-ins. Run from any cwd.

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const transcription = fs.readFileSync(path.join(ROOT, 'resources/lp2-transcription.txt'), 'utf8');

const tail = transcription.split('%').at(-1).split('§')[0];
const words = tail
  .replace(/\/\s*\r?\n/g, '')
  .replace(/\r?\n/g, '')
  .replace(/\./g, '-')
  .split('-')
  .filter(Boolean);

function gp(word) {
  return Array.from(word, rune => {
    const index = corpus.runes.indexOf(rune);
    if (index < 0) throw new Error('Unknown GP rune: ' + rune);
    return index;
  });
}

const inner = words.flatMap(word => gp(word).slice(1, -1));
const p32 = corpus.pages[32].indices;
assert.equal(words.length, 20, 'p57 word count changed');
assert.equal(inner.length, 55, 'p57 interior-rune count changed');
assert.equal(p32.length, 121, 'p32 rune count changed');

function bytesToInt(bytes) {
  return Buffer.from(bytes).reduce((n, byte) => (n << 8n) | BigInt(byte), 0n);
}

function intToBytes(value, length) {
  const out = Buffer.alloc(length);
  let n = value;
  for (let i = length - 1; i >= 0; i--) {
    out[i] = Number(n & 255n);
    n >>= 8n;
  }
  if (n !== 0n) throw new Error('Field value exceeds byte length');
  return out;
}

function readU32BE(bytes) {
  return (
    (((bytes[0] << 24) >>> 0) |
      ((bytes[1] << 16) >>> 0) |
      ((bytes[2] << 8) >>> 0) |
      bytes[3]) >>> 0
  );
}

function writeU32BE(value) {
  return Buffer.from([
    (value >>> 24) & 255,
    (value >>> 16) & 255,
    (value >>> 8) & 255,
    value & 255
  ]);
}

const DELTA = 0x9E3779B9 >>> 0;
function xteaBlock(v0, v1, decrypt) {
  if (decrypt) {
    let sum = 0xC6EF3720 >>> 0;
    for (let i = 0; i < 32; i++) {
      let mix = (((((v0 << 4) >>> 0) ^ (v0 >>> 5)) + v0) >>> 0) ^ sum;
      v1 = (v1 - (mix >>> 0)) >>> 0;
      sum = (sum - DELTA) >>> 0;
      mix = (((((v1 << 4) >>> 0) ^ (v1 >>> 5)) + v1) >>> 0) ^ sum;
      v0 = (v0 - (mix >>> 0)) >>> 0;
    }
  } else {
    let sum = 0;
    for (let i = 0; i < 32; i++) {
      let mix = (((((v1 << 4) >>> 0) ^ (v1 >>> 5)) + v1) >>> 0) ^ sum;
      v0 = (v0 + (mix >>> 0)) >>> 0;
      sum = (sum + DELTA) >>> 0;
      mix = (((((v0 << 4) >>> 0) ^ (v0 >>> 5)) + v0) >>> 0) ^ sum;
      v1 = (v1 + (mix >>> 0)) >>> 0;
    }
  }
  return [v0, v1];
}

// Mirrors ssss 0.5 mpz_export(order=-1,size=2,endian=1), including
// its degree%16==8 byte-shift for odd byte lengths.
function exportWords(value, byteLength) {
  const bigEndian = intToBytes(value, byteLength);
  const out = Buffer.alloc(byteLength + (byteLength % 2));
  let cursor = 0;

  if (byteLength % 2 === 0) {
    for (let i = byteLength - 2; i >= 0; i -= 2) {
      out[cursor++] = bigEndian[i];
      out[cursor++] = bigEndian[i + 1];
    }
  } else {
    for (let i = byteLength - 1; i >= 1; i -= 2) {
      out[cursor++] = bigEndian[i - 1];
      out[cursor++] = bigEndian[i];
    }
    out[cursor++] = 0;
    out[cursor++] = bigEndian[0];
    out[byteLength - 1] = out[byteLength];
  }
  return out;
}

function importWords(words, byteLength) {
  if (byteLength % 2 === 1) {
    words[byteLength] = words[byteLength - 1];
    words[byteLength - 1] = 0;
  }
  const bigEndian = [];
  for (let i = words.length - 2; i >= 0; i -= 2) {
    bigEndian.push(words[i], words[i + 1]);
  }
  return bytesToInt(bigEndian);
}

// ssss default XTEA diffusion: 40 sweeps of overlapping 64-bit blocks.
// decrypt=true is combine's inverse diffusion; false is split's diffusion.
function diffuse(value, byteLength, decrypt) {
  const words = exportWords(value, byteLength);
  const limit = 40 * byteLength;
  const start = decrypt ? limit - 2 : 0;
  const stop = decrypt ? -1 : limit;
  const step = decrypt ? -2 : 2;

  for (let offset = start; decrypt ? offset >= stop : offset < stop; offset += step) {
    const left = Buffer.from(Array.from({ length: 4 }, (_, k) => words[(offset + k) % byteLength]));
    const right = Buffer.from(Array.from({ length: 4 }, (_, k) => words[(offset + 4 + k) % byteLength]));
    const [v0, v1] = xteaBlock(readU32BE(left), readU32BE(right), decrypt);
    const l = writeU32BE(v0);
    const r = writeU32BE(v1);
    for (let k = 0; k < 4; k++) {
      words[(offset + k) % byteLength] = l[k];
      words[(offset + 4 + k) % byteLength] = r[k];
    }
  }
  return importWords(words, byteLength);
}

function field(bits, lowTerms) {
  const poly = (1n << BigInt(bits)) |
    lowTerms.reduce((acc, term) => acc | (1n << BigInt(term)), 1n);
  return { bits, byteLength: bits / 8, poly };
}

function gfMul(a, b, f) {
  let x = a;
  let y = b;
  let product = 0n;
  const top = 1n << BigInt(f.bits);
  for (let i = 0; i < f.bits; i++) {
    if (y & 1n) product ^= x;
    y >>= 1n;
    x <<= 1n;
    if (x & top) x ^= f.poly;
  }
  return product;
}

function gfPow(base, exponent, f) {
  let x = base;
  let e = exponent;
  let result = 1n;
  while (e > 0n) {
    if (e & 1n) result = gfMul(result, x, f);
    x = gfMul(x, x, f);
    e >>= 1n;
  }
  return result;
}

function gfInv(value, f) {
  if (value === 0n) throw new Error('GF inverse of zero');
  return gfPow(value, (1n << BigInt(f.bits)) - 2n, f);
}

// ssss 0.5 threshold-5 monic polynomial: f(x)=x^5+Q(x).
function combine(xs, shareBytes, f) {
  assert.equal(xs.length, 5);
  assert.equal(shareBytes.length, 5);
  const points = xs.map((x, i) => {
    const X = BigInt(x);
    const Y = bytesToInt(shareBytes[i]);
    return { x: X, y: Y ^ gfPow(X, 5n, f) };
  });

  let encodedSecret = 0n;
  for (let i = 0; i < 5; i++) {
    let numerator = 1n;
    let denominator = 1n;
    for (let j = 0; j < 5; j++) {
      if (i === j) continue;
      numerator = gfMul(numerator, points[j].x, f);
      denominator = gfMul(denominator, points[i].x ^ points[j].x, f);
    }
    const basis = gfMul(numerator, gfInv(denominator, f), f);
    encodedSecret ^= gfMul(points[i].y, basis, f);
  }
  return intToBytes(diffuse(encodedSecret, f.byteLength, true), f.byteLength);
}

function evalMonic5(x, coefficients, f) {
  let y = 1n;
  for (let i = 4; i >= 0; i--) {
    y = gfMul(y, BigInt(x), f) ^ coefficients[i];
  }
  return y;
}

function selfTest(f) {
  const secretBytes = Buffer.from(Array.from({ length: f.byteLength }, (_, i) => (i + 1) & 255));
  const secret = bytesToInt(secretBytes);
  const encodedSecret = diffuse(secret, f.byteLength, false);
  const coefficients = [encodedSecret, 0x12345n, 0x23456n, 0x34567n, 0x45678n];
  const shares = [1, 2, 3, 4, 5].map(x =>
    intToBytes(evalMonic5(x, coefficients, f), f.byteLength)
  );
  const recovered = combine([1, 2, 3, 4, 5], shares, f);
  assert.equal(recovered.toString('hex'), secretBytes.toString('hex'));
  return true;
}

const gpRunes = corpus.runes;
function rowRunes(row) {
  return row.map(index => gpRunes[index]);
}

function makeRows(encoding) {
  return Array.from({ length: 5 }, (_, rowIndex) => {
    const indices = inner.slice(rowIndex * 11, rowIndex * 11 + 11);
    const chars = rowRunes(indices);
    if (encoding === 'gp-ordinal') return Buffer.from(indices);
    if (encoding === 'utf16be' || encoding === 'utf16le') {
      const out = Buffer.alloc(22);
      chars.forEach((rune, i) => {
        const cp = rune.codePointAt(0);
        if (encoding === 'utf16be') out.writeUInt16BE(cp, i * 2);
        else out.writeUInt16LE(cp, i * 2);
      });
      return out;
    }
    if (encoding === 'utf8') return Buffer.from(chars.join(''), 'utf8');
    throw new Error('Unknown encoding: ' + encoding);
  });
}

function decodeKey(bytes, encoding) {
  if (encoding === 'gp-ordinal') {
    const key = Array.from(bytes);
    return key.every(index => index < 29) ? key : null;
  }
  if (encoding === 'utf16be' || encoding === 'utf16le') {
    const key = [];
    for (let i = 0; i < bytes.length; i += 2) {
      const cp = encoding === 'utf16be'
        ? bytes.readUInt16BE(i)
        : bytes.readUInt16LE(i);
      const index = gpRunes.indexOf(String.fromCodePoint(cp));
      if (index < 0) return null;
      key.push(index);
    }
    return key.length === 11 ? key : null;
  }
  if (encoding === 'utf8') {
    let decoded;
    try {
      decoded = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    } catch {
      return null;
    }
    const chars = Array.from(decoded);
    if (chars.length !== 11) return null;
    const key = chars.map(rune => gpRunes.indexOf(rune));
    return key.every(index => index >= 0) ? key : null;
  }
  return null;
}

function p32Consumers(key) {
  const results = [];
  for (const sign of [-1, 1]) {
    for (const skipF of [false, true]) {
      let keyIndex = 0;
      const clear = [];
      for (const cipher of p32) {
        if (skipF && cipher === 0) {
          clear.push(cipher);
          continue;
        }
        clear.push(((cipher + sign * key[keyIndex % key.length]) % 29 + 29) % 29);
        keyIndex++;
      }
      results.push({
        sign,
        skipF,
        consumed: keyIndex,
        text: clear.map(index => corpus.translit[index]).join('')
      });
    }
  }
  return results;
}

const fields = {
  'gp-ordinal': field(88, [7, 6, 2]),       // x^88 + x^7 + x^6 + x^2 + 1
  utf16be: field(176, [11, 3, 2]),          // x^176 + x^11 + x^3 + x^2 + 1
  utf16le: field(176, [11, 3, 2]),
  utf8: field(264, [9, 6, 2])               // x^264 + x^9 + x^6 + x^2 + 1
};

const historical2013 = [
  [2, '41cc481a51fe77f91600f593c1db2ce9babd2626ea6e'],
  [3, '7678a5f6b72042d839151b34b02ffe161cf997fed484'],
  [5, 'fcd82965b6632ea25d80edc3e58baafb4b2938895cbd'],
  [7, 'f3adb3aacb0b4336fa28178bc1e5edce940c16ce5caa'],
  [8, 'b970e507dbc4ac115a273126f62671654c480fce32e5']
];
const fixtureRecovered = combine(
  historical2013.map(item => item[0]),
  historical2013.map(item => Buffer.from(item[1], 'hex')),
  fields.utf16be
);
assert.equal(fixtureRecovered.toString('ascii'), 'p7amjopgric7dfdi.onion');

const variants = [
  { encoding: 'gp-ordinal', xIds: [1, 2, 3, 4, 5] },
  { encoding: 'gp-ordinal', xIds: [2, 3, 5, 7, 8] },
  { encoding: 'utf16be', xIds: [1, 2, 3, 4, 5] },
  { encoding: 'utf16be', xIds: [2, 3, 5, 7, 8] },
  { encoding: 'utf16le', xIds: [1, 2, 3, 4, 5] },
  { encoding: 'utf16le', xIds: [2, 3, 5, 7, 8] },
  { encoding: 'utf8', xIds: [1, 2, 3, 4, 5] },
  { encoding: 'utf8', xIds: [2, 3, 5, 7, 8] }
];

const outputs = variants.map(variant => {
  const f = fields[variant.encoding];
  const secret = combine(variant.xIds, makeRows(variant.encoding), f);
  const key = decodeKey(secret, variant.encoding);
  return {
    encoding: variant.encoding,
    fieldBits: f.bits,
    xIds: variant.xIds,
    secretHex: secret.toString('hex'),
    gpKey: key ? key.map(index => corpus.translit[index]).join('') : null,
    p32Consumers: key ? p32Consumers(key) : null
  };
});

for (const f of Object.values(fields)) selfTest(f);

console.log(JSON.stringify({
  sourceShape: {
    p57Words: words.length,
    p57InteriorRunes: inner.length,
    p57ShareShape: '5 x 11',
    p32Runes: p32.length,
    p32Shape: '11 x 11'
  },
  validation: {
    syntheticRoundTrips: true,
    original2013ShareFixture: fixtureRecovered.toString('ascii'),
    historicalScheme: 'ssss 0.5, threshold 5, monic x^5 polynomial, GF(2^n), default XTEA diffusion'
  },
  outputs
}, null, 2));
