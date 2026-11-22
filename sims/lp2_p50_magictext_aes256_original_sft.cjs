'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');

/** @param {string} file @returns {Buffer} */
const buf = (file) => fs.readFileSync(path.join(root, file));
/** @param {Buffer} bytes @returns {string} */
const sha = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
/** @param {Buffer} b @returns {{printable:number,longest:number,ascii:string}} */
function characterize(b) {
  let printable = 0, longest = 0, current = 0;
  for (const v of b) {
    if (v >= 32 && v <= 126) {
      printable += 1; current += 1;
      longest = Math.max(longest, current);
    } else current = 0;
  }
  return { printable, longest,
    ascii: Buffer.from(b.subarray(0, 64)).toString('latin1')
      .replace(/[^\x20-\x7E]/g, '.') };
}
/** @param {string} mode @param {Buffer} key @param {Buffer} input @returns {Buffer} */
function inverse(mode, key, input) {
  const decipher = crypto.createDecipheriv(mode, key,
    mode.endsWith('ecb') ? null : Buffer.alloc(16));
  if (mode.endsWith('cbc') || mode.endsWith('ecb')) decipher.setAutoPadding(false);
  return Buffer.concat([decipher.update(input), decipher.final()]);
}
/** @returns {void} */
function main() {
  const magic = buf('resources/cicada2014-openpuff-magic-squares.txt');
  const grid = JSON.parse(buf('resources/liber-primus/lp2-grid-256.json').toString('utf8'));
  const digits = grid.alphabet;
  const tokens = grid.pages.flatMap((p) => p.tokens);
  assert.equal(tokens.length, 256);
  const binary = Buffer.from(tokens.map((token) => {
    assert.equal(token.length, 2);
    const a = digits.indexOf(token[0]), b = digits.indexOf(token[1]);
    const v = a * 60 + b;
    assert(a >= 0 && b >= 0 && v <= 255);
    return v;
  }));
  assert.equal(magic.length, 745);
  assert.equal(sha(magic), '9e5c3004eec652c89027e99aa6f31c53a84c1f8c327c04ca9aa6acf7884b6c7f');
  assert.equal(sha(binary), '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
  const key = crypto.createHash('sha256').update(magic).digest();
  const modes = ['aes-256-ctr', 'aes-256-cbc', 'aes-256-ecb'];
  const outputs = modes.map((mode) => {
    const clear = inverse(mode, key, binary);
    assert.equal(clear.length, 256);
    const cip = crypto.createCipheriv(mode, key,
      mode.endsWith('ecb') ? null : Buffer.alloc(16));
    if (mode.endsWith('cbc') || mode.endsWith('ecb')) cip.setAutoPadding(false);
    assert(Buffer.concat([cip.update(clear), cip.final()]).equals(binary));
    return { mode, first32: clear.subarray(0, 32).toString('hex'),
      terminal: clear.subarray(-16).toString('hex'), ...characterize(clear) };
  });
  // An exact first-party key and reversible AES harness decrypt planted plaintext.
  const plant = Buffer.from(('THIS IS A KNOWN TEST SENTENCE ' + 'A'.repeat(240)).slice(0, 256), 'ascii');
  assert.equal(plant.length, 256);
  for (const mode of modes) {
    const enc = crypto.createCipheriv(mode, key,
      mode.endsWith('ecb') ? null : Buffer.alloc(16));
    if (mode.endsWith('cbc') || mode.endsWith('ecb')) enc.setAutoPadding(false);
    const ciphertext = Buffer.concat([enc.update(plant), enc.final()]);
    assert(inverse(mode, key, ciphertext).equals(plant));
  }
  console.log(JSON.stringify({ source: 'author-recovered magic-squares text SHA256 -> AES256',
    originalByteCount: binary.length, keyDigest: key.toString('hex'),
    original: characterize(binary), outputs, plantedAllModes: true }, null, 2));
}
main();
