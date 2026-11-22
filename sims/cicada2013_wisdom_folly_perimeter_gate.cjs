#!/usr/bin/env node
'use strict';

// Test the literal outer perimeter of the original-derived 58x58
// /tmp/wisdom == /tmp/folly byte matrix as a continuous GP29 additive key.
// Run from the repository root:
//   node sims/cicada2013_wisdom_folly_perimeter_gate.cjs

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const root = process.cwd();
const b64Path = path.join(root, 'resources/historical/cicada-2013-os-wisdom-folly.bin.b64');
const corpusPath = path.join(root, 'resources/liber-primus/lp2-corpus.json');
const controlPath = path.join(root, 'resources/control/shakespeare_first300k.txt');

const encoded = fs.readFileSync(b64Path, 'utf8').replace(/\s/g, '');
const sourceBytes = Buffer.from(encoded, 'base64');
assert.equal(sourceBytes.length, 3368);

const gitHeader = Buffer.from('blob ' + sourceBytes.length + String.fromCharCode(0));
const gitBlob = crypto.createHash('sha1')
  .update(Buffer.concat([gitHeader, sourceBytes]))
  .digest('hex');
const sha256 = crypto.createHash('sha256').update(sourceBytes).digest('hex');
assert.equal(gitBlob, '62b1b949a1e4e4a346e75b1c34101000d3c53220');
assert.equal(sha256, '7e5ec097728197f5c0dba0729980565658fba486965809ffa25e3910a31c385a');

const corpus = JSON.parse(fs.readFileSync(corpusPath, 'utf8'));
const alphabet = corpus.translit;
const modulus = alphabet.length;
assert.equal(modulus, 29);

const ciphertext = corpus.pages
  .filter(page => page.page <= 55 && page.page !== 50)
  .flatMap(page => page.indices);
assert.equal(ciphertext.length, 12956);

const controlText = fs.readFileSync(controlPath, 'utf8').toUpperCase().replace(/[^A-Z]/g, '');
const tokens = [...alphabet].sort((a, b) => b.length - a.length);
function tokenizeGp(text) {
  const output = [];
  for (let i = 0; i < text.length;) {
    const token = tokens.find(candidate => text.startsWith(candidate, i));
    if (token) {
      output.push(alphabet.indexOf(token));
      i += token.length;
    } else {
      i += 1;
    }
  }
  return output;
}

const reference = tokenizeGp(controlText);
const split = Math.floor(reference.length * 0.8);
const train = reference.slice(0, split);
const holdout = reference.slice(split);
const trigramCounts = new Map();
const contextCounts = new Map();

for (let i = 2; i < train.length; i += 1) {
  const context = train[i - 2] * modulus + train[i - 1];
  const trigram = context * modulus + train[i];
  trigramCounts.set(trigram, (trigramCounts.get(trigram) || 0) + 1);
  contextCounts.set(context, (contextCounts.get(context) || 0) + 1);
}

function trigramLogScore(values) {
  let total = 0;
  for (let i = 2; i < values.length; i += 1) {
    const context = values[i - 2] * modulus + values[i - 1];
    const trigram = context * modulus + values[i];
    const numerator = (trigramCounts.get(trigram) || 0) + 1;
    const denominator = (contextCounts.get(context) || 0) + modulus;
    total += Math.log(numerator / denominator);
  }
  return total / (values.length - 2);
}

function ioc(values) {
  const frequencies = Array(modulus).fill(0);
  for (const value of values) frequencies[value] += 1;
  const numerator = frequencies.reduce((sum, n) => sum + n * (n - 1), 0);
  return numerator / (values.length * (values.length - 1));
}

function extractPerimeter(matrix, clockwise) {
  assert.equal(matrix.length, 58 * 58);
  const result = [];
  if (clockwise) {
    for (let column = 0; column < 58; column += 1) result.push(matrix[column]);
    for (let row = 1; row < 58; row += 1) result.push(matrix[row * 58 + 57]);
    for (let column = 56; column >= 0; column -= 1) result.push(matrix[57 * 58 + column]);
    for (let row = 56; row >= 1; row -= 1) result.push(matrix[row * 58]);
  } else {
    result.push(matrix[0]);
    for (let row = 1; row < 58; row += 1) result.push(matrix[row * 58]);
    for (let column = 1; column < 58; column += 1) result.push(matrix[57 * 58 + column]);
    for (let row = 56; row >= 0; row -= 1) result.push(matrix[row * 58 + 57]);
    for (let column = 56; column >= 1; column -= 1) result.push(matrix[column]);
  }
  assert.equal(result.length, 228);
  return result;
}

function decrypt(values, key, sign) {
  return values.map((value, index) =>
    ((value + sign * key[index % key.length]) % modulus + modulus) % modulus
  );
}

const results = [];
for (const framing of ['prefix4', 'trailer4']) {
  const matrix = framing === 'prefix4' ? sourceBytes.subarray(4) : sourceBytes.subarray(0, 3364);
  assert.equal(matrix.length, 3364);

  for (const direction of ['clockwise', 'counterclockwise']) {
    const ring = extractPerimeter(matrix, direction === 'clockwise');
    for (const mapping of ['byte mod 29', 'floor(byte*29/256)']) {
      const key = ring.map(byte =>
        mapping === 'byte mod 29' ? byte % 29 : Math.floor(byte * 29 / 256)
      );
      for (const sign of [-1, 1]) {
        const plaintext = decrypt(ciphertext, key, sign);
        const reencrypted = decrypt(plaintext, key, -sign);
        assert.deepEqual(reencrypted, ciphertext, 'exact round-trip failed');
        results.push({
          framing,
          direction,
          mapping,
          operation: sign === -1 ? 'P = C - K' : 'P = C + K',
          trigram_log_nats_per_rune: trigramLogScore(plaintext),
          ioc: ioc(plaintext),
          first_120_translit: plaintext.slice(0, 120).map(index => alphabet[index]).join('')
        });
      }
    }
  }
}

results.sort((a, b) => b.trigram_log_nats_per_rune - a.trigram_log_nats_per_rune);
console.log(JSON.stringify({
  binary_length: sourceBytes.length,
  binary_git_blob_sha1: gitBlob,
  binary_sha256: sha256,
  prefix4: [...sourceBytes.subarray(0, 4)],
  trailer4: [...sourceBytes.subarray(-4)],
  matrix_framings: ['prefix4', 'trailer4'],
  perimeter_length: 228,
  perimeter_relation: '228 = 3 * 76 (not used to segment the key)',
  unknown_runes: ciphertext.length,
  raw_lp2_score: trigramLogScore(ciphertext),
  raw_lp2_ioc: ioc(ciphertext),
  native_shakespeare_holdout_score: trigramLogScore(holdout),
  tested_models: results.length,
  results
}, null, 2));
