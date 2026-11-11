#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const lp = path.join(root, 'resources', 'liber-primus');
const derived = path.join(root, 'resources', 'external', 'derived', '2014-stage04');

function read(file) { return fs.readFileSync(file); }
function gitBlobSha(bytes) {
  const header = Buffer.from('blob ' + bytes.length + '\0', 'utf8');
  return crypto.createHash('sha1').update(header).update(bytes).digest('hex');
}
function checkBlob(label, bytes, expectedSha, expectedSize) {
  assert.equal(bytes.length, expectedSize, label + ' byte length');
  const sha = gitBlobSha(bytes);
  assert.equal(sha, expectedSha, label + ' Git blob SHA-1');
  return { label, bytes: bytes.length, gitBlobSha1: sha };
}
function entropy(bytes) {
  const counts = new Array(256).fill(0);
  for (const byte of bytes) counts[byte]++;
  let h = 0;
  for (const count of counts) if (count) {
    const p = count / bytes.length;
    h -= p * Math.log2(p);
  }
  return h;
}

const identities = [];
const p03 = read(path.join(lp, '03.jpg'));
const p04 = read(path.join(lp, '04.jpg'));
const p05 = read(path.join(lp, '05.jpg'));
identities.push(checkBlob('LP1 page 03 = Stage04 03.jpg', p03, 'fb390cedd9e26547f0b39563a1ce8998f0def030', 892759));
identities.push(checkBlob('LP1 page 04 = Stage04 04.jpg', p04, 'e6a27cd5b25948d27d3af5ba029e4ba44fbff46f', 1223337));
identities.push(checkBlob('LP1 page 05 full artifact = Stage04 server-status.bin', p05, '2829e13812015601ff1014cb4427587b4a8aa3a6', 673066));

const eoiStart = p05.indexOf(Buffer.from([0xff, 0xd9]));
assert.equal(eoiStart + 2, 336353, 'first page-05 JPEG EOI boundary');
const page05Jpeg = p05.subarray(0, eoiStart + 2);
identities.push(checkBlob('Stage04 extracted page 05 JPEG prefix', page05Jpeg, '7369644b99426a57d1a41819306bfd7be8935f5f', 336353));

const squareOffset = 0x521e4;
assert.equal(squareOffset, 336356);
assert.equal(squareOffset - (eoiStart + 2), 3, 'square trailer starts three bytes after JPEG EOI');
const squareWindow = p05.subarray(squareOffset, squareOffset + 357);
assert.equal(squareWindow.length, 357);
const reversedHex = Buffer.from(squareWindow).reverse().toString('ascii');
assert.match(reversedHex, /^[0-9a-f]+$/i, 'source-selected window is hexadecimal');
assert.equal(reversedHex.length, 357);
// xxd -p -r consumes complete hex pairs; the last unmatched nibble is discarded.
const squareFromPage05 = Buffer.from(reversedHex.slice(0, -1), 'hex');
const squareStored = read(path.join(derived, '05-square.txt'));
identities.push(checkBlob('derived 05-square.txt', squareStored, 'f081bf3bd3cb45b55359fa0e8961b1f033aa10c7', 178));
assert.deepEqual(squareFromPage05, squareStored, 'page-05 trailer reproduces stored square bytes');

const squareRows = squareStored.toString('ascii').trim().split(/\r?\n/).map(line => line.trim().split(/\s+/).map(Number));
assert.equal(squareRows.length, 5);
assert(squareRows.every(row => row.length === 5), 'square is 5 by 5');
const rowSums = squareRows.map(row => row.reduce((a, b) => a + b, 0));
const columnSums = squareRows[0].map((_, c) => squareRows.reduce((sum, row) => sum + row[c], 0));
const mainDiagonal = squareRows.reduce((sum, row, i) => sum + row[i], 0);
const antiDiagonal = squareRows.reduce((sum, row, i) => sum + row[4 - i], 0);
assert(rowSums.every(x => x === 1033));
assert(columnSums.every(x => x === 1033));
assert.equal(mainDiagonal, 1033);
assert.equal(antiDiagonal, 1033);

const signedTextBytes = read(path.join(derived, '03-outguess.asc'));
identities.push(checkBlob('page-03 OutGuess clear-signed text', signedTextBytes, '2a355d1bf14d37041384f09d8700e2ee274a13e6', 31809));
const signedText = signedTextBytes.toString('utf8');
assert(signedText.startsWith('-----BEGIN PGP SIGNED MESSAGE-----'));
assert(signedText.includes('Let the text guide you.'));
assert(signedText.includes('3301'));
const lower = signedText.toLowerCase();
const imageStart = lower.indexOf('ffd8');
const imageEnd = lower.indexOf('ffd9', imageStart);
assert(imageStart >= 0 && imageEnd > imageStart, 'signed message contains a JPEG hex span');
const imageHex = signedText.slice(imageStart, imageEnd + 4).replace(/\s/g, '');
const embeddedImage = Buffer.from(imageHex, 'hex');
const smallImageStored = read(path.join(derived, '03-small-rune-image.jpg'));
identities.push(checkBlob('page-03 embedded small rune JPEG', smallImageStored, 'f91bdd6e2a890968a5a13d39be4d56899b877920', 15188));
assert.deepEqual(embeddedImage, smallImageStored, 'signed-message hex span equals stored small JPEG');
assert.equal(embeddedImage[0], 0xff);
assert.equal(embeddedImage[1], 0xd8);
assert.equal(embeddedImage[embeddedImage.length - 2], 0xff);
assert.equal(embeddedImage[embeddedImage.length - 1], 0xd9);

const opaque = read(path.join(derived, '04-outguess.bin'));
identities.push(checkBlob('page-04 OutGuess opaque binary', opaque, 'd738b052bf0548e2f431e231af7ef1514becb4ad', 7524));
const commonMagics = [
  ['JPEG', Buffer.from([0xff, 0xd8, 0xff])],
  ['PNG', Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
  ['GIF', Buffer.from('GIF8')],
  ['ZIP', Buffer.from([0x50, 0x4b, 0x03, 0x04])],
  ['GZIP', Buffer.from([0x1f, 0x8b])],
  ['PDF', Buffer.from('%PDF-')],
  ['ELF', Buffer.from([0x7f, 0x45, 0x4c, 0x46])],
  ['BZIP2', Buffer.from('BZh')],
  ['XZ', Buffer.from([0xfd, 0x37, 0x7a, 0x58, 0x5a, 0x00])]
];
const magicMatches = commonMagics.filter(([, sig]) => opaque.subarray(0, sig.length).equals(sig)).map(([name]) => name);
assert.equal(magicMatches.length, 0, 'page-04 payload has none of the tested common file signatures');
const opaqueEntropy = entropy(opaque);
assert(opaqueEntropy > 7.95 && opaqueEntropy < 8.0, 'page-04 payload is near-maximal byte entropy');

console.log(JSON.stringify({
  source: { repository: 'neuroretransmit/cicada', commit: 'ade9a02889ef8acbc8cde8edbfd0a785c369f4c3', directory: '2014/005-third-onion' },
  identities,
  page05: { eoiEndExclusive: eoiStart + 2, squareOffset, squareWindowBytes: squareWindow.length, squareOutputBytes: squareStored.length, rowSums, columnSums, mainDiagonal, antiDiagonal },
  page03: { signedTextBytes: signedTextBytes.length, embeddedJpegBytes: embeddedImage.length, containsInstruction: true },
  page04OutGuess: { bytes: opaque.length, gitBlobSha1: gitBlobSha(opaque), entropyBitsPerByte: Number(opaqueEntropy.toFixed(6)), testedCommonMagicMatches: magicMatches, first16Hex: opaque.subarray(0, 16).toString('hex') },
  conclusion: 'The 3301 update reproduces LP1 pages 03–05 and the established 1033 square. The 04 OutGuess object remains opaque. No source-selected LP2 key or operation is established.'
}, null, 2));
