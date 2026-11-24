'use strict';

/**
 * Original-LP2 test of the only key stream physically present after the EOI
 * of earlier LP1 archive 05.jpg. No key-phase or alphabet search.
 * Node.js 22: node sims/lp1_jpeg05_trailer_original_key_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', 'resources', 'liber-primus');
const image = fs.readFileSync(path.join(root, '05.jpg'));
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const tail = image.subarray(image.lastIndexOf(Buffer.from([0xff, 0xd9])) + 2);
assert.equal(tail.length, 72700);
assert.ok(tail.equals(Buffer.from(image.subarray(0, 72700)).reverse()));

const ciphertext = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(ciphertext.length, 12956);

/** @param {number[]} values */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (values.length * (values.length - 1));
}
/**
 * @param {number[]} values
 * @param {Buffer} key
 * @param {-1|1} sign
 */
function apply(values, key, sign) {
  return values.map((value, i) => (value + 29 + sign * (key[i] % 29)) % 29);
}

const keyReadings = [
  ['physical-tail', tail],
  ['tail-reversed', Buffer.from(tail).reverse()],
];
const results = [];
for (const [name, key] of keyReadings) {
  for (const sign of [-1, 1]) {
    const decoded = apply(ciphertext, key, sign);
    const score = ioc(decoded);
    const p0Ioc = ioc(decoded.slice(0, corpus.pages[0].indices.length));
    results.push({name, sign, fullIoC: score, page0IoC: p0Ioc});
    // A positive code control tests implementation only: the authentic
    // solved p57 GP words remain invariant under encode then decode.
    const solved = corpus.pages.find(p => p.page === 57).indices;
    assert.equal(solved.length, 95);
    const plant = apply(solved, key, -sign);
    assert.deepEqual(apply(plant, key, sign), solved);
  }
}
assert.deepEqual(results.map(r => Number(r.fullIoC.toFixed(12))), [
  0.034481293393, 0.034495020346, 0.034469401468, 0.034483199915,
]);
assert.deepEqual(results.map(r => Number(r.page0IoC.toFixed(12))), [
  0.033254365184, 0.033137375333, 0.034658243397, 0.035389429967,
]);
assert.ok(results.every(r => r.fullIoC < 0.035));

// Source-fixed binary interpretation: encode the complete GP29 stream as one
// big-endian base-29 integer, then XOR with the first N source trailer bytes.
// This is distinct from the bytewise (byte % 29) additive test above.
const binarySignatures = [
  ['PNG', Buffer.from('89504e470d0a1a0a', 'hex')],
  ['ZIP', Buffer.from('504b0304', 'hex')],
  ['PDF', Buffer.from('%PDF-', 'ascii')],
  ['GIF', Buffer.from('GIF8', 'ascii')],
  ['JPEG', Buffer.from('ffd8ff', 'hex')],
  ['GZIP', Buffer.from('1f8b08', 'hex')],
  ['ELF', Buffer.from('7f454c46', 'hex')],
  ['Ogg', Buffer.from('OggS', 'ascii')],
  ['ID3', Buffer.from('ID3', 'ascii')],
  ['SQLite', Buffer.from('SQLite format 3\0', 'ascii')],
  ['PGP', Buffer.from('-----BEGIN PGP', 'ascii')],
  ['HTML', Buffer.from('<!DOCTYPE', 'ascii')],
];
/** @param {number[]} values */
function base29IntegerBytes(values) {
  let integer = 0n;
  for (const value of values) integer = integer * 29n + BigInt(value);
  let hex = integer.toString(16);
  if (hex.length % 2) hex = '0' + hex;
  return Buffer.from(hex, 'hex'); // minimal big-endian integer serialization
}
/** @param {number[]} values @param {Buffer} key @param {string} stream @param {string} orientation */
function binaryXorSummary(values, key, stream, orientation) {
  const packed = base29IntegerBytes(values);
  const output = Buffer.alloc(packed.length);
  for (let i = 0; i < packed.length; i++) output[i] = packed[i] ^ key[i];

  const counts = Array(256).fill(0);
  let printable = 0;
  let longestPrintableRun = 0;
  let currentPrintableRun = 0;
  for (const byte of output) {
    counts[byte]++;
    if (byte >= 32 && byte <= 126) {
      printable++;
      currentPrintableRun++;
      longestPrintableRun = Math.max(longestPrintableRun, currentPrintableRun);
    } else {
      currentPrintableRun = 0;
    }
  }
  let entropyBits = 0;
  for (const count of counts) {
    if (count) {
      const probability = count / output.length;
      entropyBits -= probability * Math.log2(probability);
    }
  }
  const prefix = output.subarray(0, 32);
  const signatureMatches = binarySignatures
    .filter(([, signature]) => prefix.subarray(0, signature.length).equals(signature))
    .map(([name]) => name);
  return {
    stream,
    keyOrientation: orientation,
    bytes: output.length,
    entropyBits,
    printablePct: 100 * printable / output.length,
    longestPrintableRun,
    first32Hex: prefix.toString('hex'),
    first80Ascii: output.subarray(0, 80).toString('latin1').replace(/[^\x20-\x7e]/g, '.'),
    signatureMatches,
  };
}
const postHeaderBody = ciphertext.slice(13); // p0's source-visible 13-rune red heading
assert.equal(postHeaderBody.length, 12943);
const binaryResults = [];
for (const [stream, values] of [['full-12956', ciphertext], ['post-header-12943', postHeaderBody]]) {
  const packed = base29IntegerBytes(values);
  assert.equal(packed.length, stream === 'full-12956' ? 7868 : 7860);
  for (const [orientation, key] of keyReadings) {
    binaryResults.push(binaryXorSummary(values, key, stream, orientation));
  }
}
assert.deepEqual(binaryResults.map(r => r.first32Hex), [
  '088ce20e4e9d7d0b34e35ecf3109da6d33eb0ecd63749dca',
  'f7abb7a3a541d99af23431b465a3a118ff878b43e8c251f2',
  '02a156e78acefab293d64debd3ee1acedc7ec60aa0bd01ee',
  'fd86034a61125e2355012290874461bb101243842b0bcdd6',
]);
assert.ok(binaryResults.every(r => r.signatureMatches.length === 0));
assert.ok(binaryResults.every(r => r.entropyBits > 7.9 && r.printablePct < 40 && r.longestPrintableRun <= 13));

console.log(JSON.stringify({
  originalRuneCount: ciphertext.length,
  originalIoC: ioc(ciphertext),
  sourceJpegTailBytes: tail.length,
  decoded: results,
  binaryXor: binaryResults,
  decision: 'These four source-fixed byte%29 GP29 additions leave original LP2 random-like; no English recovery',
}, null, 2));
