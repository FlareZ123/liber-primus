'use strict';

/**
 * Exhaustive original-p50 binary-format inversion under source-selected
 * 1031×3299 Blum square-state generator. All seeds, two bit endian choices,
 * two adjacent output phases, authentic base60 and historical base59 readings.
 *
 * Windows 11 / Node.js 22: use manual-node22-sft-runner.yml with this path.
 * Read-only. A valid recovered file must pass an intact-format decoder;
 * header coincidences alone never count as plaintext.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/base60-grid.json'), 'utf8'));
const echo = fs.readFileSync(path.join(root, 'resources/historical/cicada2013-os-original-prime-echo.sh'), 'utf8');
const source = grid.byte_rows.flat();
const altAlphabet = grid.alphabet.replace('f', '');
const base59 = grid.rows.flat().map((v) =>
  altAlphabet.indexOf(v[0]) * 59 + altAlphabet.indexOf(v[1]));
const modulus = 1031 * 3299;
assert.equal(source.length, 256);
assert.equal(base59.length, 256);
assert(echo.includes('"1033\t"; sleep 2'));
assert(echo.includes('"3301\t"; sleep 2'));
assert.equal(crypto.createHash('sha256').update(Buffer.from(source)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
assert.equal(modulus, 3401269);
const sourceBytes = [
  { name: 'original-base60', bytes: source },
  { name: 'historic-base59', bytes: base59 }
];
const formats = [
  ['gzip', [0x1f, 0x8b, 0x08]],
  ['zip-local', [0x50, 0x4b, 0x03, 0x04]],
  ['zip-empty', [0x50, 0x4b, 0x05, 0x06]],
  ['png', [0x89, 0x50, 0x4e, 0x47]],
  ['jpeg', [0xff, 0xd8, 0xff]],
  ['bzip2', [0x42, 0x5a, 0x68]],
  ['xz', [0xfd, 0x37, 0x7a, 0x58]],
  ['pdf', [0x25, 0x50, 0x44, 0x46]],
  ['armored-pgp', [0x2d, 0x2d, 0x2d, 0x2d]],
  ['lzma', [0x5d, 0x00, 0x00]],
  ['zlib-default', [0x78, 0x9c]],
  ['zlib-fast', [0x78, 0x01]],
  ['zlib-best', [0x78, 0xda]],
  ['7zip', [0x37, 0x7a, 0xbc, 0xaf]],
  ['ogg', [0x4f, 0x67, 0x67, 0x53]],
  ['id3', [0x49, 0x44, 0x33]]
];

/**
 * @param {number} state - known initial square, includes zero/non-coprime for exhaustive superset
 * @param {number} offset - BBS state first or next square before bit extraction
 * @param {boolean} msb - assemble each byte most significant bit first
 * @param {number} byteCount
 * @returns {Uint8Array}
 */
function bbsBytes(state, offset, msb, byteCount) {
  let s = state;
  for (let j = 0; j < offset; j++) s = s * s % modulus;
  const bytes = new Uint8Array(byteCount);
  for (let i = 0; i < byteCount; i++) {
    let value = 0;
    for (let j = 0; j < 8; j++) {
      const bit = s & 1;
      value = msb ? 2 * value + bit : value + (bit << j);
      s = s * s % modulus;
    }
    bytes[i] = value;
  }
  return bytes;
}
/** @param {readonly number[]} encrypted @param {Uint8Array} pad @returns {Buffer} */
function xor(encrypted, pad) {
  return Buffer.from(encrypted.map((value, i) => value ^ pad[i]));
}
/** @param {Buffer} bytes @returns {string[]} */
function matchedFormats(bytes) {
  return formats.filter(([, signature]) => signature.every((v, i) => bytes[i] === v))
    .map(([name]) => name);
}

// Real independently encoded zlib payload under a historical numerical seed.
const nativeMessage = Buffer.from('CICADA 3301: synthetic BBS-file-decoding positive, no original ciphertext');
const compressed = zlib.deflateSync(nativeMessage);
assert(compressed.length < 256);
const plantingSeed = 1033;
const plantingState = plantingSeed * plantingSeed % modulus;
const plantPad = bbsBytes(plantingState, 1, false, 256);
const plantedFile = Buffer.concat([compressed, Buffer.alloc(256 - compressed.length, 0xa5)]);
const plantedCipher = xor([...plantedFile], plantPad);
assert.equal(plantedCipher.length, 256);
assert.deepEqual(xor([...plantedCipher], plantPad), plantedFile);
assert.deepEqual(zlib.inflateSync(xor([...plantedCipher], plantPad)), nativeMessage);

const visited = new Uint8Array(modulus);
let distinctSquaredStates = 0;
let firstHeaderCandidates = 0;
let completeFileHits = 0;
let zlibHeaderCandidates = 0;
let validZlib = 0;
/** @type {Record<string, number>} */
const headerCounts = {};
/** @type {Array<{seed:number, state:number, offset:number, order:string, radix:string, kind:string, firstEight:string}>} */
const shortHits = [];
for (let seed = 0; seed < modulus; seed++) {
  const state = seed * seed % modulus;
  if (visited[state]) continue;
  visited[state] = 1;
  distinctSquaredStates++;
  // All possible seeds are covered, including non-unit seeds and coincident square roots.
  for (const offset of [0, 1]) {
    for (const msb of [true, false]) {
      const key = bbsBytes(state, offset, msb, 4);
      for (const { name, bytes } of sourceBytes) {
        const firstFour = xor(bytes.slice(0, 4), key);
        const candidates = matchedFormats(firstFour);
        if (candidates.length === 0) continue;
        firstHeaderCandidates += candidates.length;
        for (const kind of candidates) {
          headerCounts[kind] = (headerCounts[kind] || 0) + 1;
        }
        const full = xor(bytes, bbsBytes(state, offset, msb, 256));
        for (const kind of candidates) {
          if (kind.startsWith('zlib')) {
            zlibHeaderCandidates++;
            try {
              const decoded = zlib.inflateSync(full, { maxOutputLength: 1024 * 1024 });
              validZlib++;
              if (shortHits.length < 15) shortHits.push({
                seed, state, offset, order: msb ? 'msb' : 'lsb',
                radix: name, kind, firstEight: decoded.subarray(0, 8).toString('hex')
              });
            } catch (err) {
              // False 2-byte zlib headers ordinarily fail checksums or stream structure.
              assert(err instanceof Error);
            }
          } else {
            let verified = false;
            if (kind === 'id3') verified = full[3] >= 2 && full[3] <= 4
              && full[4] === 0 && (full[5] & 0xf0) === 0;
            else if (kind === 'bzip2') verified = full[3] >= 0x31 && full[3] <= 0x39
              && full.subarray(4, 10).toString('hex') === '314159265359';
            else verified = true; // Full specified signature, report for manual validation.
            if (verified) {
              completeFileHits++;
              if (shortHits.length < 15) shortHits.push({
                seed, state, offset, order: msb ? 'msb' : 'lsb',
                radix: name, kind, firstEight: full.subarray(0, 8).toString('hex')
              });
            }
          }
        }
      }
    }
  }
}
assert.equal(distinctSquaredStates, 851400);
assert.equal(firstHeaderCandidates, 320);
assert.deepEqual(headerCounts, {
  'zlib-default': 114,
  'zlib-fast': 86,
  id3: 2,
  'zlib-best': 116,
  bzip2: 2
});
assert.equal(zlibHeaderCandidates, 316);
assert.equal(validZlib, 0);
assert.equal(completeFileHits, 0);
console.log(JSON.stringify({
  source: 'original image-derived 256 bytes, historical alternate 59 alphabet',
  modulus, seedsEnumerated: modulus, distinctSquaredStates,
  bitPhases: 2, bitOrders: 2, tableReadings: 2,
  originalHeaderCandidates: firstHeaderCandidates,
  headerCounts, zlibHeaderCandidates, validZlib, completeFileHits,
  falseHitDetails: shortHits, authenticPositivePlantRecovered: nativeMessage.toString('utf8'),
  conclusion: 'No recognized self-validating original binary file recovered by direct 2013 twin-BBS XOR'
}, null, 2));
