#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const gridPath = path.join(__dirname, '..', 'resources', 'liber-primus', 'base60-grid.json');
const grid = JSON.parse(fs.readFileSync(gridPath, 'utf8'));
const alphabet60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const alphabet59 = alphabet60.replace('f', '');

assert.equal(alphabet60.length, 60);
assert.equal(alphabet60.indexOf('0'), 0);
assert.equal(alphabet60.indexOf('A'), 10);
assert.equal(alphabet60.indexOf('Z'), 35);
assert.equal(alphabet60.indexOf('a'), 36);
assert.equal(alphabet60.indexOf('f'), 41);
assert.equal(alphabet60.indexOf('x'), 59);
assert.equal(grid.alphabet, alphabet60);

function decodeRows(rows, alphabet) {
  const values = [];
  for (const row of rows) {
    for (const token of row) {
      assert.match(token, /^[0-9A-Za-z]{2}$/);
      const high = alphabet.indexOf(token[0]);
      const low = alphabet.indexOf(token[1]);
      assert.notEqual(high, -1, `unknown high digit in ${token}`);
      assert.notEqual(low, -1, `unknown low digit in ${token}`);
      const value = alphabet.length * high + low;
      assert.ok(value >= 0 && value <= 255, `${token} -> ${value} is not a byte`);
      values.push(value);
    }
  }
  return Buffer.from(values);
}

const [p49Rows, p50Rows] = grid.page_row_counts;
const p50 = grid.rows.slice(p49Rows, p49Rows + p50Rows);
assert.equal(p50.length, 13);
assert.ok(p50.every(row => row.length === 8));
assert.deepEqual(p50[0], ['2M', '0w', '3L', '3D', '2r', '0S', '1p', '15']);

const base60Bytes = decodeRows(p50, alphabet60);
const base59Bytes = decodeRows(p50, alphabet59);
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const samplePositions = [[0, 0], [0, 1], [0, 2], [0, 5], [0, 6]];
const sample = samplePositions.map(([r, c]) => {
  const token = p50[r][c];
  return { row: r, column: c, token, base60: 60 * alphabet60.indexOf(token[0]) + alphabet60.indexOf(token[1]), base59: 59 * alphabet59.indexOf(token[0]) + alphabet59.indexOf(token[1]) };
});
assert.deepEqual(sample.map(x => x.base60), [142, 58, 201, 28, 111]);
assert.deepEqual(sample.map(x => x.base59), [140, 57, 198, 28, 109]);
assert.equal(60 * alphabet60.indexOf('3') + alphabet60.indexOf('D'), 193);
assert.equal(59 * alphabet59.indexOf('3') + alphabet59.indexOf('D'), 190);

const differingBytes = [...base60Bytes].filter((v, i) => v !== base59Bytes[i]).length;
assert.equal(base60Bytes.length, 104);
assert.equal(differingBytes, 87);
assert.equal(sha256(base60Bytes), '61a1a427e40fba732dd96b0fb162241ada5db18e94a284ceabe44aa815133293');
assert.equal(sha256(base59Bytes), '4c6d66d7198fd3aac3e3826bbe22ac79daa3c8f081666ea9eec0788865cc1950');

console.log(JSON.stringify({ source: 'MIRACL User’s Manual, February 2007; exact base-60 digit alphabet', p50_rows: p50.length, p50_tokens: base60Bytes.length, sample, token_3D: { base60: 193, base59: 190 }, base60_p50_sha256: sha256(base60Bytes), base59_p50_sha256: sha256(base59Bytes), differing_bytes: differingBytes, interpretation: 'data fingerprint only; no Cicada-specific selector, key, or plaintext established' }, null, 2));
