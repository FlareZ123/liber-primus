'use strict';

/**
 * Original 2014 Stage11 signature as a literal 256-byte table key.
 * Self-contained offline original-data test, requiring Node.js 22.
 * Usage: node sims/lp2_2014_signature_half_grid_sft.cjs
 *
 * A bounded candidate: 512 RSA signature octets split into two halves,
 * optionally XORed, mapped directly onto 256 printed table bytes.
 * It makes no claim about a hidden or intended author-selected key.
 *
 * @typedef {{name:string, key:Buffer}} Pad
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const signed = fs.readFileSync(path.join(root,
  'resources/historical/cicada2014-stage11-message.asc'), 'utf8');
const grid = JSON.parse(fs.readFileSync(path.join(root,
  'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const match = signed.match(/-----BEGIN PGP SIGNATURE-----([\s\S]*?)-----END PGP SIGNATURE-----/);
assert.ok(match, 'archived Stage11 OpenPGP armor missing');
const b64 = match[1].split(/\r?\n/)
  .map(line => line.trim())
  .filter(line => /^[A-Za-z0-9+/]{16,}={0,2}$/.test(line))
  .join('');
const packet = Buffer.from(b64, 'base64');
assert.equal(packet.length, 543);
assert.equal(packet.subarray(0, 3).toString('hex'), '89021c');
const rsa = packet.subarray(packet.length - 512);
assert.equal(rsa.length, 512);
assert.deepEqual(grid.pages.map(page => page.bytes.length), [80, 104, 72]);
const sourceBytes = Buffer.from(grid.bytes);
assert.equal(sourceBytes.length, 256);
assert.equal(sourceBytes[0], 203);
assert.equal(sourceBytes[255], 80);

/** @type {Pad[]} */
const pads = [
  {name: 'RSA first 256', key: rsa.subarray(0, 256)},
  {name: 'RSA last 256', key: rsa.subarray(256)},
  {name: 'RSA halves XOR', key: Buffer.from(
    Array.from({length: 256}, (_, i) => rsa[i] ^ rsa[256+i]))},
];
/** @param {Buffer} bytes @returns {{printable:number,maxRun:number}} */
function statistics(bytes) {
  let printable = 0;
  let run = 0;
  let maxRun = 0;
  for (const b of bytes) {
    if (b >= 32 && b <= 126) {
      printable++;
      run++;
      maxRun = Math.max(maxRun, run);
    } else {
      if (b === 9 || b === 10 || b === 13) printable++;
      run = 0;
    }
  }
  return {printable, maxRun};
}
/** @param {Buffer} data @param {Buffer} key @param {string} operation @returns {Buffer} */
function transform(data, key, operation) {
  return Buffer.from(Array.from(data, (b, i) => {
    if (operation === 'xor') return b ^ key[i];
    if (operation === 'subtract') return (b - key[i] + 256) & 255;
    return (b + key[i]) & 255;
  }));
}
const expected = [
  [92,6], [89,5], [84,3],
  [102,8], [86,5], [102,4],
  [99,5], [94,6], [88,7],
];
let j = 0;
for (const pad of pads) {
  for (const op of ['xor', 'subtract', 'add']) {
    const out = transform(sourceBytes, pad.key, op);
    const got = statistics(out);
    assert.deepEqual([got.printable, got.maxRun], expected[j++],
      pad.name + '/' + op + ' source result changed');
    const readable = Array.from(out, b => (b >= 32 && b <= 126)
      ? String.fromCharCode(b) : '.').join('');
    console.log(pad.name, op, got, readable.slice(0, 60));
  }
}
// Plant a genuine printable message at source positions, then recover all bytes.
const plant = Buffer.from('AN ORIGINAL SIGNATURE-KEY CONTROL PHRASE FROM CICADA 3301', 'ascii');
const keyed = transform(plant, pads[0].key, 'xor');
assert.deepEqual(transform(keyed, pads[0].key, 'xor'), plant);
assert.equal(j, 9);
console.log('2014 RSA-signature direct-table gate: all 9 original outputs negative; plant passed');
