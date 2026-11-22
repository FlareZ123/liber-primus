'use strict';
/**
 * Conditional human-path: 32x8 source numeric table -> sixteen 16-byte
 * flower records, with p50's otherwise unused page-local record becoming
 * the AES-128 key for the remaining fifteen records (ECB, no IV).
 * EXACT ORIGINAL BYTE TEST, not creator-authenticated cipher selection.
 *
 * Windows Node22: node sims/lp2_floral_branch22_p50_selfkey_aes128_ecb_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const data = JSON.parse(fs.readFileSync(path.join(
  __dirname, '..', 'resources', 'liber-primus', 'lp2-grid-256.json'
), 'utf8')).bytes;
assert.equal(data.length, 256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(data))
  .digest('hex'), '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
/** @param {number} x */
function mod32(x) { return ((x % 32) + 32) % 32; }
/** @param {number} i @param {number} leftStep @param {number} rightStep */
function record(i, leftStep, rightStep) {
  const l = mod32(22 + leftStep * i);
  const r = mod32(31 + rightStep * i);
  return Buffer.from([
    ...data.slice(l * 8, l * 8 + 8),
    ...data.slice(r * 8, r * 8 + 8)
  ]);
}
/** @param {Buffer} bytes @param {Buffer} key @param {boolean} encrypt */
function aes128Ecb(bytes, key, encrypt) {
  const crypt = encrypt ?
    crypto.createCipheriv('aes-128-ecb', key, null) :
    crypto.createDecipheriv('aes-128-ecb', key, null);
  crypt.setAutoPadding(false);
  return Buffer.concat([crypt.update(bytes), crypt.final()]);
}
/** @param {Buffer} bytes */
function printableMetrics(bytes) {
  let printable = 0;
  let letters = 0;
  let longest = 0;
  let run = 0;
  for (const byte of bytes) {
    if (byte >= 32 && byte <= 126) {
      printable++;
      run++;
      longest = Math.max(longest, run);
    } else run = 0;
    if ((byte >= 65 && byte <= 90) ||
        (byte >= 97 && byte <= 122)) letters++;
  }
  return {printable, letters, longestPrintableRun: longest};
}
const results = [];
for (const leftStep of [-2, 2]) {
  for (const rightStep of [-2, 2]) {
    const records = Array.from({length: 16},
      (_, i) => record(i, leftStep, rightStep));
    assert.equal(records.length, 16);
    assert.ok(records.every(r => r.length === 16));
    const key = records[10]; // Source page p40+10=p50, exactly zero GP runes
    const dataBlocks = Buffer.concat(records.filter((_, i) => i !== 10));
    assert.equal(dataBlocks.length, 240);
    const decoded = aes128Ecb(dataBlocks, key, false);
    assert.deepEqual(aes128Ecb(decoded, key, true), dataBlocks);

    // Synthetic coherent ASCII plant, independent of unknown original ciphertext.
    const plant = Buffer.from(
      'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO A'+
      ' SECRET VALUE READ THE WORDS FOLLOW THE THREAD OF THE BOOK', 'ascii');
    const fullPlant = Buffer.alloc(240);
    for (let i = 0; i < 240; i++) fullPlant[i] = plant[i % plant.length];
    assert.deepEqual(aes128Ecb(aes128Ecb(fullPlant, key, true), key, false), fullPlant);
    const metrics = printableMetrics(decoded);
    assert.ok(metrics.printable <= 105);
    assert.ok(metrics.longestPrintableRun <= 6);
    results.push({
      leftStep, rightStep, masterPage: 50,
      keyHex: key.toString('hex'), decodedBytes: decoded.length,
      ...metrics, first32BytesHex: decoded.subarray(0, 32).toString('hex')
    });
  }
}
assert.deepEqual(results.map(x => x.printable), [98, 105, 77, 93]);
assert.deepEqual(results.map(x => x.longestPrintableRun), [5, 5, 3, 6]);
console.log(JSON.stringify({
  result: 'PASS: original 4 source-orientation ECB master-key attempts recover no readable bytes',
  originalCells: 256, masterKeyBytes: 16, otherBytes: 240,
  models: results
}, null, 2));
