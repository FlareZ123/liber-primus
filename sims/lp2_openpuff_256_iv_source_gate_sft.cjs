'use strict';

/**
 * Original 2014 Cicada MP3 versus original LP2 32x8 numerical grid.
 * OpenPuff carrier files contain a 256-byte encrypted IV. The original
 * manuscript also prints 256 base60 byte cells. A byte-exact relation
 * would be strong cross-round evidence of source reuse.
 *
 * Node.js 22 CJS; run from repository root:
 * node sims/lp2_openpuff_256_iv_source_gate_sft.cjs interconnected.mp3
 *
 * Absence rejects only literal reuse. The MP3 IV may be independent,
 * cryptographically transformed, or encoded in a different carrier plane.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');

const SOURCE_SIZE = 6651873;
const SOURCE_SHA256 = '1ce3839b4a62462d9009c4469acc189b523e1bdcf338cb49cda1cd7bb4efffc6';
const SOURCE_GIT_BLOB = '09fe068192b76a3697c47ec1d604b527703db798';
const TABLE_SHA256 = '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290';

/** @param {Buffer} data @returns {string} */
function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/** @param {Buffer} data @returns {string} */
function gitBlobId(data) {
  return crypto.createHash('sha1')
    .update(Buffer.from('blob ' + data.length + '\0', 'ascii'))
    .update(data).digest('hex');
}

/**
 * Search the entire carrier, without guessing a password or key, for each
 * original eight-byte grid row and each adjacent two-row 16-byte IV unit.
 * @param {Buffer} carrier
 * @param {Buffer} table
 * @returns {{fullOffset:number,eightByteRows:Array<{row:number,offset:number}>,sixteenByteGroups:Array<{group:number,offset:number}>,lameOffsets:number[],sourceSignatureOffsets:number[]}}
 */
function screen(carrier, table) {
  assert.equal(table.length, 256);
  const eightByteRows = [];
  const sixteenByteGroups = [];
  for (let i = 0; i < 32; i++) {
    const offset = carrier.indexOf(table.subarray(i * 8, i * 8 + 8));
    if (offset >= 0) eightByteRows.push({row: i, offset});
  }
  for (let i = 0; i < 16; i++) {
    const offset = carrier.indexOf(table.subarray(i * 16, i * 16 + 16));
    if (offset >= 0) sixteenByteGroups.push({group: i, offset});
  }
  const lameOffsets = [];
  const sourceSignatureOffsets = [];
  const lame = Buffer.from('LAME', 'ascii');
  // Published OpenPuff MP3 signature: PLoS ONE 13(4):e0195737.
  const signature = Buffer.from('0000348380004c414d45332e39', 'hex');
  for (let at = carrier.indexOf(lame, 0);
       at >= 0 && at < Math.min(carrier.length, 65536);
       at = carrier.indexOf(lame, at + 1)) lameOffsets.push(at);
  for (let at = carrier.indexOf(signature, 0);
       at >= 0 && at < Math.min(carrier.length, 65536);
       at = carrier.indexOf(signature, at + 1)) sourceSignatureOffsets.push(at);
  return {
    fullOffset: carrier.indexOf(table),
    eightByteRows, sixteenByteGroups,
    lameOffsets, sourceSignatureOffsets
  };
}

/** @returns {Buffer} */
function loadTable() {
  const file = path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-grid-256.json');
  const record = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.deepEqual(record.pages.map(p => p.rows), [10, 13, 9]);
  const bytes = record.pages.flatMap(p => p.bytes);
  assert.equal(bytes.length, 256);
  const table = Buffer.from(bytes);
  assert.equal(sha256(table), TABLE_SHA256);
  return table;
}

/** @param {Buffer} table */
function selfTest(table) {
  const baseline = Buffer.alloc(4096, 0xa5);
  const implanted = Buffer.from(baseline);
  table.copy(implanted, 740);
  const positive = screen(implanted, table);
  assert.equal(positive.fullOffset, 740);
  assert.equal(positive.eightByteRows.length, 32);
  assert.equal(positive.sixteenByteGroups.length, 16);
  for (let i = 0; i < 32; i++) {
    assert.equal(positive.eightByteRows[i].offset, 740 + 8 * i);
  }
  const negative = screen(baseline, table);
  assert.equal(negative.fullOffset, -1);
  assert.equal(negative.eightByteRows.length, 0);
  assert.equal(negative.sixteenByteGroups.length, 0);
  console.log('Positive implant: full 256-byte hit; all 32 eight-byte rows and 16 sixteen-byte groups.');
}

function main() {
  const table = loadTable();
  selfTest(table);
  const sourcePath = process.argv[2];
  assert(sourcePath, 'Pass the pinned interconnected.mp3 path as the argument');
  const carrier = fs.readFileSync(sourcePath);
  assert.equal(carrier.length, SOURCE_SIZE);
  assert.equal(gitBlobId(carrier), SOURCE_GIT_BLOB);
  assert.equal(sha256(carrier), SOURCE_SHA256);
  const result = screen(carrier, table);
  console.log(JSON.stringify({
    source: 'iBotPeaches/cicada_3301@a0a616d85717af59f8b806875b43d51e06e1e874/tool/storage/interconnected.mp3',
    sourceBytes: carrier.length,
    sourceSha256: SOURCE_SHA256,
    tableSha256: TABLE_SHA256,
    ...result,
    first64Hex: carrier.subarray(0, 64).toString('hex')
  }, null, 2));
  if (result.fullOffset >= 0 || result.eightByteRows.length > 0) {
    console.log('SOURCE BYTE RELATION: an eight-byte or longer exact original site was found.');
  } else {
    console.log('Original MP3: no eight-byte source table row, 16-byte paired-row or 256-byte reuse.');
  }
}
if (require.main === module) main();
module.exports = {screen, gitBlobId, sha256};
