'use strict';

/**
 * Test the exact 32-byte cross-page/table register as an HMAC-SHA512 key
 * against the preserved 2014 Stage11 index body. No key, mode, or input
 * variants are searched. Run: node sims/lp2_crosspage32_hmac_stage11_index_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {pageSeams} = require('./lp2_crosspage32_gridbyte_key_sft.cjs');

const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json').toString('utf8'));
const seams = pageSeams();
assert.equal(seams.length, 32);
const table = grid.pages.flatMap(p => p.bytes);
assert.equal(table.length, 256);
const key = Buffer.from(seams.map((s, row) => table[row * 8 + s.right - 1]));
assert.equal(key.toString('hex'),
  '61f9cac6505456feff728edc483f49ed780ad221c0f0839c007f063b446a1671');

const files = [
  'resources/cicada2014-onion7-index.html',
  'resources/external/cicada2014-stage11-onion7-original-index.html',
  'resources/external/cicada2014-stage11-index-archived.html'
];
const bodies = files.map(read);
assert.equal(bodies[0].length, 1640);
for (let i = 1; i < bodies.length; i++) assert.deepEqual(bodies[i], bodies[0]);
const body = bodies[0];
const target =
  '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';
const sha512 = crypto.createHash('sha512').update(body).digest('hex');
const hmac = crypto.createHmac('sha512', key).update(body).digest('hex');
assert.equal(sha512,
  '83e50c118edb70dc34c9c760e332830a066b82006ebbbdcc7347b818d1961a571f32ef5a3717e98e282754d4a004dc0f7f0d99fb3824bb1b281a947c7ba70a31');
assert.equal(hmac,
  '594b4ad4eb93cd898a2b0bcff55e992913d719288a01cdb2bc1c38023a2e50f16b88de4175c3fce9b082e6667c7bd398907d1577a9dd588e2121d20195eeb915');
assert.notEqual(sha512, target);
assert.notEqual(hmac, target);

console.log(JSON.stringify({
  classification: 'BOUNDED NEGATIVE; NO PLAINTEXT OR AUTHENTICATED KEY',
  keySource: '32 chronological original page-crossing words; table row = seam order, one-based column = right-fragment rune count',
  keyHex: key.toString('hex'),
  input: files.map((p, i) => ({path:p, bytes:bodies[i].length, sha256:crypto.createHash('sha256').update(bodies[i]).digest('hex')})),
  distinctBodies: new Set(bodies.map(b => b.toString('hex'))).size,
  sha512,
  hmacSha512: hmac,
  target,
  matches: {sha512:sha512 === target, hmacSha512:hmac === target},
  scope: 'Only the preserved Stage11 index body under this exact seam key and HMAC-SHA512; not an unknown deep-web page or original live HTTP response.'
}, null, 2));
