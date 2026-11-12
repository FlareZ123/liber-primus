'use strict';

/**
 * Source-frozen binary-envelope gate for the 2013 DATA/560.13 GP28 rank
 * candidate on the original LP2 p15:9--p22:end ciphertext.
 *
 * Prior research fixed p15's BASE29 heading quotient as historical byte
 * address 8,952,964, and tested the eight elementary predecessor-exclusion
 * inverse maps as GP28 prose. This test holds those eight maps and the file
 * address fixed, asking a different question: do their GP28 digits directly
 * encode a recognizable big-endian binary file?
 *
 * Node.js 22, single file, read-only. Requires exact original CicadaOS member.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const title = corpus.pages[15].indices.slice(0, 9);
assert.deepEqual(title, [0, 1, 20, 19, 24, 28, 26, 22, 24]);
const titleNumber = title.reduce((n, x) => n * 29n + BigInt(x), 0n);
assert.equal(titleNumber, 29553734724n);
assert.equal(titleNumber % 3301n, 560n);
const padOffset = Number(titleNumber / 3301n);
assert.equal(padOffset, 8952964);
const cipher = corpus.pages.filter(p => p.page >= 15 && p.page <= 22)
  .flatMap(p => p.page === 15 ? p.indices.slice(9) : p.indices);
assert.equal(cipher.length, 1894);
const exceptions = [];
for (let i = 1; i < cipher.length; i++) {
  if (cipher[i] === cipher[i - 1]) exceptions.push(i);
}
assert.deepEqual(exceptions, [240, 777, 968, 995, 1060, 1101, 1162, 1463, 1649, 1864]);

const sourcePath = process.argv[2];
assert.ok(sourcePath, 'Pass an actual DATA/560.13 file path');
const source = fs.readFileSync(sourcePath);
assert.equal(source.length, 118818811);
const digest = crypto.createHash('sha256').update(source).digest('hex');
assert.equal(digest, 'db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f');
const oldCipher = Buffer.from('28c07e1b102d4d5c4c1a376e064477e1416fcc94928765', 'hex');
const oldPlain = Buffer.from(oldCipher.map((byte, i) => byte ^ source[12821 + i]));
assert.equal(oldPlain.toString('ascii'), 'gbyh7znm6c7ezsmr.onion\n');
const sourceSlice = source.subarray(padOffset, padOffset + cipher.length);

/** @param {bigint} n @returns {Buffer} Minimal big-endian unsigned bytes. */
function encodeBytes(n) {
  assert.ok(n >= 0n);
  let h = n.toString(16);
  if (h.length % 2) h = '0' + h;
  return Buffer.from(h, 'hex');
}

/** @param {Buffer} bytes @param {number} width @returns {number[]} */
function rankDigits(bytes, width) {
  let n = BigInt('0x' + bytes.toString('hex'));
  const digits = Array(width).fill(0);
  for (let i = width - 1; i >= 0; i--) {
    digits[i] = Number(n % 28n);
    n /= 28n;
  }
  assert.equal(n, 0n, 'Binary positive must fit in fixed GP28 register');
  return digits;
}

/** @param {Buffer} min @param {Buffer} max @returns {number} */
function commonPrefix(min, max) {
  let count = 0;
  while (count < min.length && count < max.length && min[count] === max[count]) count++;
  return count;
}

/** @param {Buffer} bytes @returns {string[]} */
function signatures(bytes) {
  const rules = [
    ['PDF', '255044462d'], ['PNG', '89504e470d0a1a0a'], ['ZIP', '504b0304'],
    ['gzip', '1f8b08'], ['JPEG', 'ffd8ff'], ['bzip2', '425a68'],
    ['xz', 'fd377a585a00'], ['zstd', '28b52ffd'], ['SQLite', '53514c69746520666f726d6174203300'],
    ['OpenPGP ASCII', Buffer.from('-----BEGIN PGP').toString('hex')]
  ];
  const found = rules.filter(([, hex]) => bytes.subarray(0, hex.length / 2).toString('hex') === hex).map(([label]) => label);
  if (bytes.length > 1 && bytes[0] === 0x78 &&
    (bytes[0] & 15) === 8 && (((bytes[0] << 8) | bytes[1]) % 31) === 0) found.push('zlib');
  return found;
}

/**
 * Decode every known GP28 successor rank and retain exact uncertainty at
 * ten original adjacent-doublet exceptions (rank in [0,27]).
 * i=0 is the actual transmitted GP29 initial state; binary begins at i=1.
 * @param {number[]} ciphertext
 * @param {'sorted'|'cyclic'} order
 * @param {number[]} keys
 * @param {number} sign
 * @returns {{digits:number[],min:bigint,max:bigint}}
 */
function unpack(ciphertext, order, keys, sign) {
  let min = 0n, max = 0n;
  const digits = [];
  for (let i = 1; i < ciphertext.length; i++) {
    const previous = ciphertext[i - 1], current = ciphertext[i];
    if (current === previous) {
      digits.push(-1);
      min *= 28n;
      max = max * 28n + 27n;
      continue;
    }
    const rank = order === 'sorted'
      ? current - Number(current > previous)
      : (current - previous + 29) % 29 - 1;
    assert.ok(rank >= 0 && rank < 28);
    const digit = ((rank - sign * keys[i]) % 28 + 28) % 28;
    digits.push(digit);
    min = min * 28n + BigInt(digit);
    max = max * 28n + BigInt(digit);
  }
  assert.equal(digits.length, 1893);
  return { digits, min, max };
}

/** @param {number[]} digits @param {'sorted'|'cyclic'} order @param {number[]} keys @param {number} sign */
function plantCipher(digits, order, keys, sign) {
  const out = [cipher[0]];
  for (let i = 1; i < cipher.length; i++) {
    if (cipher[i] === cipher[i - 1]) {
      out.push(out[i - 1]);
      continue;
    }
    const rank = (digits[i - 1] + sign * keys[i] % 28 + 28) % 28;
    const x = order === 'sorted'
      ? rank < out[i - 1] ? rank : rank + 1
      : (out[i - 1] + rank + 1) % 29;
    out.push(x);
  }
  return out;
}

// Source-free positive: a full-length fixed binary file that starts with the
// unmistakable PDF header. Its final 1136 bytes fit in 1893 base28 digits.
const plant = Buffer.alloc(1136);
for (let i = 0; i < plant.length; i++) plant[i] = (i * 73 + 19) % 256;
plant.set(Buffer.from('%PDF-1.7\n', 'ascii'), 0);
const plantDigits = rankDigits(plant, 1893);
assert.deepEqual(encodeBytes(plantDigits.reduce((n, d) => n * 28n + BigInt(d), 0n)), plant);

const items = [];
for (const order of ['sorted', 'cyclic']) {
  for (const projection of ['mod28', 'scaled28']) {
    const keys = Array.from(sourceSlice, b => projection === 'mod28' ? b % 28 : Math.floor(28 * b / 256));
    for (const sign of [-1, 1]) {
      const original = unpack(cipher, order, keys, sign);
      assert.equal(original.digits.filter(d => d === -1).length, 10);
      const candidateMin = encodeBytes(original.min);
      const candidateMax = encodeBytes(original.max);
      const stable = commonPrefix(candidateMin, candidateMax);
      const planted = unpack(plantCipher(plantDigits, order, keys, sign), order, keys, sign);
      for (let i = 0; i < planted.digits.length; i++) {
        if (plantDigits[i] !== planted.digits[i] && planted.digits[i] !== -1) {
          assert.fail('Native binary positive disagrees at an unmasked GP28 rank');
        }
      }
      const plantedStable = commonPrefix(encodeBytes(planted.min), encodeBytes(planted.max));
      assert.ok(plantedStable >= 64, 'Erasure-aware binary positive must retain a usable header');
      assert.equal(encodeBytes(planted.min).subarray(0, 9).toString('ascii'), '%PDF-1.7\n');
      const hits = signatures(candidateMin.subarray(0, stable));
      items.push({
        order, projection, sign, knownDigits: 1883, unknownDigits: 10,
        nominalByteSize: candidateMin.length, guaranteedPrefixBytes: stable,
        prefixHex: candidateMin.subarray(0, 32).toString('hex'),
        signatureHits: hits,
        binaryPositivePrefixBytes: plantedStable
      });
    }
  }
}
assert.equal(items.length, 8);
console.log(JSON.stringify({
  input: 'physical p15 offset9 through p22 end; 1894 original GP29 runes',
  authenticPad: 'DATA/560.13', padSha256: digest, padStart: padOffset,
  independentOriginalDoubletLocations: exceptions,
  decoding: 'source-selected 28-ary digit clock; full sequence min/max under original repeated-output erasures',
  result: items, anyHeader: items.some(x => x.signatureHits.length > 0)
}, null, 2));
