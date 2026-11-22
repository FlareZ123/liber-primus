/**
 * Source-seven-rune bridge password -> original 256-byte grid RC4 direct receiver.
 * Usage: node sims/lp2_bridge_seven_rune_rc4_grid_original_sft.cjs
 * Read-only and deterministic. Node.js 22 CommonJS; no network.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
/** @param {string} name */
const json = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const corpus = json('resources/liber-primus/lp2-corpus.json');
const grid = json('resources/liber-primus/lp2-grid-256.json');
/** @param {number[]} symbols */
const translit = (symbols) => symbols.map((i) => corpus.translit[i]).join('');

/**
 * Standard ARC4 KSA/PRGA. Historical OutGuess uses ARC4; crypto's
 * OpenSSL provider commonly disables legacy RC4 so a pinned local
 * implementation is needed for reproducible original input.
 * @param {Buffer} key
 * @param {Buffer} input
 * @returns {Buffer}
 */
function arc4(key, input) {
  const s = Uint8Array.from({ length: 256 }, (_, i) => i);
  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + s[i] + key[i % key.length]) & 255;
    [s[i], s[j]] = [s[j], s[i]];
  }
  let i = 0;
  j = 0;
  const result = Buffer.alloc(input.length);
  for (let k = 0; k < input.length; k++) {
    i = (i + 1) & 255;
    j = (j + s[i]) & 255;
    [s[i], s[j]] = [s[j], s[i]];
    result[k] = input[k] ^ s[(s[i] + s[j]) & 255];
  }
  return result;
}

/** @param {Buffer} bytes */
const sha256 = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
/** @param {Buffer} bytes */
const printable = (bytes) => [...bytes].filter((x) => x >= 0x20 && x <= 0x7e).length;
/** @param {Buffer} bytes */
function maxAsciiRun(bytes) {
  let longest = 0;
  let run = 0;
  for (const b of bytes) {
    run = b >= 32 && b <= 126 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  return longest;
}

function main() {
  const knownStream = arc4(Buffer.from('Key'), Buffer.alloc(10));
  assert.equal(knownStream.toString('hex'), 'eb9f7781b734ca72a719');
  assert.equal(grid.bytes.length, 256);
  const sourceGrid = Buffer.from(grid.bytes);
  assert.equal(sha256(sourceGrid),
    '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

  const p27 = corpus.pages.find((p) => p.page === 27).indices;
  const p55 = corpus.pages.find((p) => p.page === 55).indices;
  const p56 = corpus.pages.find((p) => p.page === 56).indices;
  assert.equal(p27.length, 234);
  assert.equal(p55.length, 76);
  assert.equal(p56.length, 85);
  assert.deepEqual(p27.slice(28, 34), p55.slice(70));
  assert.equal(p27[34], p56[0]);
  const bridge = [...p55.slice(70), p56[0]];
  const password = translit(bridge);
  assert.equal(password, 'DJUBEIAE');
  assert.equal(password.length, 8);
  const key = Buffer.from(password, 'ascii');

  // One frozen original receiver: whole printed grid, row-major base60,
  // original seven-rune ASCII bridge, original ARC4 stream at offset0.
  const plaintext = arc4(key, sourceGrid);
  assert.deepEqual(arc4(key, plaintext), sourceGrid);
  const nativeControl = Buffer.from('THIS IS AN INDEPENDENT SOURCE-SHAPED ASCII POSITIVE; '.repeat(7).slice(0, 256));
  assert.equal(nativeControl.length, 256);
  assert.deepEqual(arc4(key, arc4(key, nativeControl)), nativeControl);
  const testMagic = [
    ['ZIP', '504b0304'], ['GZIP', '1f8b'], ['BZIP2', '425a68'],
    ['PNG', '89504e47'], ['JPEG', 'ffd8ff'], ['PGP armor', '2d2d2d2d2d'],
    ['PDF', '255044462d'],
  ].filter(([,hex]) => plaintext.subarray(0,hex.length/2).toString('hex')===hex)
    .map(([name])=>name);
  const result = {
    keyFromSource:password,
    keyLength:key.length,
    sourceGridSHA256:sha256(sourceGrid),
    decodedSHA256:sha256(plaintext),
    decodedFirst32Hex:plaintext.subarray(0,32).toString('hex'),
    decodedLast16Hex:plaintext.subarray(-16).toString('hex'),
    printableCount:printable(plaintext),
    longestPrintableRun:maxAsciiRun(plaintext),
    startSignatures:testMagic,
    positiveRecovered:256,
    sourceRoundtripRecovered:256,
  };
  assert.equal(result.positiveRecovered,256);
  assert.equal(result.sourceRoundtripRecovered,256);
  console.log(JSON.stringify(result,null,2));
}
main();
