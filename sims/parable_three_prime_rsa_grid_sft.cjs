#!/usr/bin/env node
'use strict';

// Bounded test of the candidate interpretation:
//   N = p*q*r = 1,595,277,641 from the 2013 AUDIO/761 Parable metadata;
//   e = 65,537 from the documented 2014 Cicada RSA stage.
// N-as-modulus is an inference, not an author statement. Since N is only
// 31 bits, OAEP cannot fit; this tests textbook RSA only.
//
// Inputs tested:
//   1) p50's source-derived base60 256-byte reading, in natural 32x8 framing;
//   2) the same byte stream grouped in 3-byte big-endian blocks;
//   3) LP2 pages 0..55 as fixed-width seven-digit GP29 ciphertext blocks.

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { trainNativeGP, languageScore } = require('./historical_solve_path_transfer.cjs');

const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const transcription = read('resources/lp2-transcription.txt');
const emerson = read('resources/control/emerson_essays_2944.txt');
const model = trainNativeGP(emerson);

const N = 1595277641n;
const p = 1259n, q = 1031n, r = 1229n;
const e = 65537n;
const phi = (p - 1n) * (q - 1n) * (r - 1n);
function modInverse(a, m) {
  let [oldR, newR] = [a, m], [oldS, newS] = [1n, 0n];
  while (newR !== 0n) {
    const z = oldR / newR;
    [oldR, newR] = [newR, oldR - z * newR];
    [oldS, newS] = [newS, oldS - z * newS];
  }
  assert.strictEqual(oldR, 1n);
  return (oldS % m + m) % m;
}
function modPow(a, b, m) {
  let out = 1n;
  a %= m;
  while (b > 0n) {
    if (b & 1n) out = (out * a) % m;
    a = (a * a) % m;
    b >>= 1n;
  }
  return out;
}
const d = modInverse(e, phi);
assert.strictEqual(p * q * r, N);
assert.strictEqual((e * d) % phi, 1n);
assert.ok(29n ** 6n < N && N < 29n ** 7n);
assert.strictEqual(modPow(modPow(123456789n, e, N), d, N), 123456789n);

const bytes = grid.bytes;
assert.strictEqual(bytes.length, 256);
assert.strictEqual(grid.shape, '32 rows by 8 columns across LP2 pages 49, 50, 51');
assert.strictEqual(grid.byte_count, 256);

function blocks4(endian) {
  const out = [];
  for (let row = 0; row < 32; row++) {
    for (let col = 0; col < 8; col += 4) {
      let value = 0n;
      for (let k = 0; k < 4; k++) {
        const b = BigInt(bytes[row * 8 + col + k]);
        value = endian === 'big'
          ? (value << 8n) | b
          : value | (b << BigInt(8 * k));
      }
      out.push({ row, col, value });
    }
  }
  return out;
}
function base29Fixed7(value) {
  const out = Array(7).fill(0);
  for (let i = 6; i >= 0; i--) {
    out[i] = Number(value % 29n);
    value /= 29n;
  }
  assert.strictEqual(value, 0n);
  return out;
}
function ioc(xs) {
  const f = Array(29).fill(0);
  for (const x of xs) f[x]++;
  return f.reduce((s, n) => s + n * (n - 1), 0) / (xs.length * (xs.length - 1));
}
function tokenMap(text) {
  const sorted = corpus.translit.map((token, index) => ({ token, index }))
    .sort((a, b) => b.token.length - a.token.length);
  const out = [];
  for (const word of text.split(' ')) {
    for (let i = 0; i < word.length;) {
      const found = sorted.find(({ token }) => word.startsWith(token, i));
      assert.ok(found, 'No GP token for ' + word.slice(i));
      out.push(found.index);
      i += found.token.length;
    }
  }
  return out;
}

// Historical solved p56 plaintext, independently fixed by the regression file.
const p56Words = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const p56Plaintext = tokenMap(p56Words);
assert.strictEqual(p56Plaintext.length, 85);

const fourByte = {};
for (const endian of ['big', 'little']) {
  const all = blocks4(endian);
  const valid = all.filter(x => x.value < N);
  const invalid = all.filter(x => x.value >= N);
  const decrypted = valid.map(x => modPow(x.value, d, N));
  const digits = decrypted.flatMap(base29Fixed7);
  fourByte[endian] = {
    blockCount: all.length,
    validBlocks: valid.length,
    invalidBlocks: invalid.length,
    validBlockLocations: valid.map(x => [x.row, x.col]),
    decryptedBase29Runes: digits.length,
    ioc: ioc(digits),
    emersonGpLanguageScore: languageScore(digits, model),
  };
}

// Alternative 3-byte stream packing: 85 full blocks and one unconsumed byte.
const threeByteBlocks = [];
for (let i = 0; i + 2 < bytes.length; i += 3) {
  threeByteBlocks.push(
    (BigInt(bytes[i]) << 16n) |
    (BigInt(bytes[i + 1]) << 8n) |
    BigInt(bytes[i + 2])
  );
}
const threeByteDecrypted = threeByteBlocks.map(x => modPow(x, d, N));
const threeByteDigits = threeByteDecrypted.flatMap(base29Fixed7);
const threeByteColumns = Array.from({ length: 7 }, (_, col) =>
  threeByteDecrypted.map(x => base29Fixed7(x)[col]));
const columnMatches = threeByteColumns.map(xs =>
  xs.reduce((n, x, i) => n + (x === p56Plaintext[i] ? 1 : 0), 0));
const lowDigit = threeByteDecrypted.map(x => Number(x % 29n));
const lowDigitMatches = lowDigit.reduce((n, x, i) => n + (x === p56Plaintext[i] ? 1 : 0), 0);

// Fixed-width seven-digit GP29 representation of any c < N must begin with
// digit 0, 1, or 2. Test every possible fixed phase, allowing any static
// permutation from rune symbols to base29 digits.
const unknown = corpus.pages.filter(page => page.page <= 55).flatMap(page => page.indices);
assert.strictEqual(unknown.length, 12956);
const leadingPhases = [];
for (let phase = 0; phase < 7; phase++) {
  const xs = [];
  for (let i = phase; i < unknown.length; i += 7) xs.push(unknown[i]);
  leadingPhases.push({
    phase,
    samples: xs.length,
    distinctRunes: new Set(xs).size,
    possibleUnderAnyStaticDigitPermutation: new Set(xs).size <= 3,
  });
}

const report = {
  hypothesis: 'Three-prime textbook RSA with Parable product as N and e=65537',
  provenance: {
    modulusCandidate: '2013 AUDIO/761 TXXX Parable product; p57 clause sums 1259*1031*1229',
    exponentCandidate: 'e=65537 from the documented 2014 Cicada RSA stage',
    status: 'cross-round inference; no source explicitly names this product as an LP2 RSA modulus',
    padding: 'OAEP cannot fit a 31-bit modulus; textbook RSA only',
  },
  key: { N: N.toString(), p: p.toString(), q: q.toString(), r: r.toString(),
    phi: phi.toString(), e: e.toString(), d: d.toString(),
    base29Pow6: (29n ** 6n).toString(), base29Pow7: (29n ** 7n).toString() },
  controls: { syntheticRsaRoundTripPassed: true },
  p50Base60Grid: {
    bytes: bytes.length,
    shape: [32, 8],
    fourByteBlocks: fourByte,
    threeByte: {
      blocks: threeByteBlocks.length,
      trailingByte: bytes[threeByteBlocks.length * 3],
      decryptedBase29Runes: threeByteDigits.length,
      ioc: ioc(threeByteDigits),
      emersonGpLanguageScore: languageScore(threeByteDigits, model),
      lowDigitMatchesSolvedP56: lowDigitMatches,
      bestOfSevenFixedDigitColumnsMatchesSolvedP56: Math.max(...columnMatches),
      allSevenColumnMatches: columnMatches,
    },
  },
  unknownLp2: {
    runes: unknown.length,
    fixedSevenDigitLeadingPhases: leadingPhases,
  },
  conclusion: 'The tested direct textbook-RSA framings do not recover plaintext. This does not exclude other uses of the Parable number, other moduli, or source-fixed non-RSA mechanisms.',
};
console.log(JSON.stringify(report, null, 2));
