'use strict';

/**
 * Original-source Stage04 `<!--1033-->` 256-byte object compared solely to
 * source-print-order LP2 p50 32×8 table. No free keys, periods, offsets,
 * normalization or reverse/cipher family are searched.
 *
 * Run: node sims/lp2_stage04_256_direct_identity_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const stage04Hex = '87de5b7fa26ab85d2256c453e7f5bc3ac7f25ee743297817febd7741ededf07ca0c7e8b1788ea4131441a8f71c63943d8b56aea6a45159e2f59f9a194af23eaabf9de0f3123c041c882d5b7e03e17ac49be67cef29fbc7786e3bda321a176498835f6198ef22e81c30d44281cd217f7a46f58c84dd7b29b941403ecd75c0c735d20266121f875aa8dec28f32fc153b1393e143fc71616945eea3c10d6820bd631cf775cf3c1f27925b4a2da655f783f7616f3359b23cff6fb5cb69bcb745c55dff439f7eb6a4094bd302b65a84360a62f94c8b010250fcc431c190d6ed8cc8a3bfce37dddb24b93f502ad83c5fa21923189d8be7a6127c4105fcf0e5275286f2';
const stage04 = Buffer.from(stage04Hex, 'hex');
assert.equal(stage04Hex.length, 512);
assert.equal(stage04.length, 256);
const stageSha = crypto.createHash('sha256').update(stage04).digest('hex');
assert.equal(stageSha, 'd8c0f83cf91d0deda658035e3eb07712b12e72b36ed0e471a71a2fe07dd14ba6');
const originalSource = [
  'https://github.com/micheloosterhof/cicada-2014/blob/d2bb5ac1d957ff5de70c24303d0f5e3cfb3152aa/stage04/fv7lyucmeozzd5j4.onion/index.html',
  'https://github.com/iBotPeaches/cicada_3301/blob/master/onions/fv7lyucmeozzd5j4.onion/pre/index.html'
];

const sourcePath = path.resolve(__dirname, '../resources/liber-primus/base60-grid.json');
const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const ABC = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
assert.equal(source.alphabet, ABC);
assert.equal(source.rows.length, 32);

/** @type {number[][]} Canonical 32x8 source-printed byte matrix. */
const rows = source.rows.map((row, index) => {
  assert.equal(row.length, 8, `row ${index}`);
  return row.map(token => {
    assert.equal(token.length, 2);
    const high = ABC.indexOf(token[0]);
    const low = ABC.indexOf(token[1]);
    assert.ok(high >= 0 && low >= 0, `bad token ${token}`);
    const value = 60 * high + low;
    assert.ok(value >= 0 && value <= 255);
    return value;
  });
});

const rowMajor = Buffer.from(rows.flat());
const columnMajor = Buffer.from(
  Array.from({ length: 8 }, (_, j) => rows.map(row => row[j])).flat()
);
const gridSha = crypto.createHash('sha256').update(rowMajor).digest('hex');
assert.equal(gridSha, '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
assert.equal(rowMajor.length, stage04.length);
assert.equal(columnMajor.length, stage04.length);

/**
 * @param {Buffer} grid Source-ordered 256-byte array.
 * @returns {object}
 */
function compare(grid) {
  const equal = [];
  const mismatches = [];
  for (let index = 0; index < 256; index += 1) {
    if (grid[index] === stage04[index]) {
      equal.push({index, byte: stage04[index]});
    } else {
      mismatches.push(index);
    }
  }
  return {
    exactIdentity: grid.equals(stage04),
    equalPositions: equal.length,
    equal,
    mismatchedPositions: mismatches.length,
    firstMismatchIndex: mismatches[0]
  };
}
const results = { originalSource, stage04Sha256: stageSha,
  gridSha256: gridSha,
  firstStage04: stage04.subarray(0, 16).toString('hex'),
  firstP50: rowMajor.subarray(0, 16).toString('hex'),
  rowMajor: compare(rowMajor),
  columnMajor: compare(columnMajor) };
assert.equal(results.rowMajor.equalPositions, 1);
assert.deepEqual(results.rowMajor.equal.map(x => x.index), [194]);
assert.equal(results.columnMajor.equalPositions, 3);
assert.deepEqual(results.columnMajor.equal.map(x => x.index), [19,130,245]);
assert.equal(results.rowMajor.exactIdentity, false);
assert.equal(results.columnMajor.exactIdentity, false);
console.log(JSON.stringify(results, null, 2));
