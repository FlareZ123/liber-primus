#!/usr/bin/env node
'use strict';

// Bounded test: one 29x29 Hill key whose entries are the 841 32-bit words
// in the 2013 Cicada OS binary after one framing word. The p51-p55 receiver
// is the matching 841-rune block after one framing rune.

const fs = require('node:fs');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const bytes = Buffer.from(
  fs.readFileSync('resources/historical/cicada2013-wisdom-folly.b64', 'utf8').replace(/\s+/g, ''),
  'base64'
);
const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
const pages = corpus.pages.filter(p => p.page >= 51 && p.page <= 55);
const cipher = pages.flatMap(p => p.indices);

assert.equal(sha256, '7e5ec097728197f5c0dba0729980565658fba486965809ffa25e3910a31c385a');
assert.equal(bytes.length, 3368);
assert.deepEqual(pages.map(p => p.runic_count), [92, 263, 179, 232, 76]);
assert.equal(cipher.length, 842);
assert.equal(bytes.length / 4, cipher.length);

const mod = x => ((x % 29) + 29) % 29;
function inverseScalar(a) {
  for (let x = 1; x < 29; x++) if ((a * x) % 29 === 1) return x;
  return null;
}
function invertMatrix(A) {
  const n = 29;
  const M = A.map((row, i) => [
    ...row,
    ...Array.from({ length: n }, (_, j) => i === j ? 1 : 0),
  ]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    while (pivot < n && M[pivot][col] === 0) pivot++;
    if (pivot === n) return null;
    if (pivot !== col) [M[pivot], M[col]] = [M[col], M[pivot]];
    const inv = inverseScalar(M[col][col]);
    if (inv === null) return null;
    for (let j = 0; j < 2 * n; j++) M[col][j] = (M[col][j] * inv) % 29;
    for (let row = 0; row < n; row++) {
      if (row === col || M[row][col] === 0) continue;
      const factor = M[row][col];
      for (let j = 0; j < 2 * n; j++) {
        M[row][j] = mod(M[row][j] - factor * M[col][j]);
      }
    }
  }
  return M.map(row => row.slice(n));
}
function score(seq) {
  const counts = Array(29).fill(0);
  for (const x of seq) counts[x]++;
  const n = seq.length;
  const ioc = counts.reduce((s, x) => s + x * (x - 1), 0) / (n * (n - 1));
  const bigrams = Array(29 * 29).fill(0);
  for (let i = 0; i < n - 1; i++) bigrams[seq[i] * 29 + seq[i + 1]]++;
  const repeatedBigramIoc = bigrams.reduce((s, x) => s + x * (x - 1), 0) / ((n - 1) * (n - 2));
  return {
    ioc,
    fractionF: counts[28] / n,
    repeatedBigramIoc,
    preview: seq.slice(0, 80).map(i => corpus.runes[i]).join(''),
  };
}

const results = [];
for (const endian of ['BE', 'LE']) {
  const words = [];
  for (let i = 0; i < 842; i++) {
    const off = i * 4;
    const word = endian === 'BE' ? bytes.readUInt32BE(off) : bytes.readUInt32LE(off);
    words.push(word % 29);
  }
  for (const framing of ['prefix', 'trailer']) {
    const keyWords = framing === 'prefix' ? words.slice(1) : words.slice(0, 841);
    const cipherBlock = framing === 'prefix' ? cipher.slice(1) : cipher.slice(0, 841);
    for (const orientation of ['row-major', 'column-major']) {
      const A = Array.from({ length: 29 }, (_, r) =>
        Array.from({ length: 29 }, (_, c) =>
          orientation === 'row-major' ? keyWords[r * 29 + c] : keyWords[c * 29 + r]
        )
      );
      const Ainv = invertMatrix(A);
      assert.ok(Ainv, `matrix unexpectedly singular: ${endian}/${framing}/${orientation}`);
      const plain = [];
      for (let block = 0; block < 29; block++) {
        const C = cipherBlock.slice(block * 29, (block + 1) * 29);
        for (let row = 0; row < 29; row++) {
          let value = 0;
          for (let col = 0; col < 29; col++) value = (value + Ainv[row][col] * C[col]) % 29;
          plain.push(value);
        }
      }
      results.push({ endian, framing, orientation, ...score(plain) });
    }
  }
}

assert.equal(results.length, 8);
assert.ok(Math.min(...results.map(r => r.ioc)) > 0.034);
assert.ok(Math.max(...results.map(r => r.ioc)) < 0.035);

console.log(JSON.stringify({
  sourceSha256: sha256,
  sourceBytes: bytes.length,
  receiverPages: pages.map(p => ({ page: p.page, runes: p.runic_count })),
  framing: 'one DWORD + one rune, then 29x29 matrix/key block',
  matrixEntry: '32-bit word modulo 29',
  cipher: '29 blocks of 29 symbols, P = K^-1 C over GF(29)',
  uniformIoc: 1 / 29,
  results,
  decision: 'All eight natural single-29x29 DWORD-Hill configurations are noise-like.',
}, null, 2));
