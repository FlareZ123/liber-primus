'use strict';

/**
 * Original 2013 CicadaOS DATA/560.13 file indexed at sixteen original LP2 p15
 * prime-square positions, as a possible directly sourced AES-128 key to the
 * original pp49–51 256-byte numeric grid. This is one new source-to-key bridge:
 * previously tested keys used the p15 integers themselves, whereas this test
 * reads the actual historic DATA bytes at those indices.
 *
 * Source caveat: the author did not specify this indirection or AES usage.
 * Node 22, read-only; requires original 2013 DATA/560.13 file as argv[2].
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {readSquare, clockwiseSpiral} = require('./fibonacci_prime_spiral.cjs');

const ROOT = path.join(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
assert.equal(grid.byte_count, 256);
const raw = Buffer.from(grid.bytes);
assert.equal(raw.length, 256);
assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const square = readSquare();
const spiralPositions = clockwiseSpiral();
const rowNumbers = square.flat();
const spiralNumbers = spiralPositions.map(([r, c]) => square[r][c]);
assert.deepEqual(spiralNumbers, [3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222,
  3152, 3038, 2838, 2472, 1820, 708, 1206, 4516]);
assert.equal(new Set(rowNumbers).size, 16);
assert.deepEqual([...rowNumbers].sort((a, b) => a - b), [...spiralNumbers].sort((a, b) => a - b));
const file = process.argv[2];
assert.ok(file, 'Original DATA/560.13 source path required');
const source = fs.readFileSync(file);
assert.equal(source.length, 118818811);
const digest = crypto.createHash('sha256').update(source).digest('hex');
assert.equal(digest, 'db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f');
const oldCipher = Buffer.from('28c07e1b102d4d5c4c1a376e064477e1416fcc94928765', 'hex');
assert.equal(Buffer.from(oldCipher.map((c, i) => c ^ source[12821 + i]))
  .toString('ascii'), 'gbyh7znm6c7ezsmr.onion\n');

/** @param {number[]} numbers @returns {Buffer} */
function addressedKey(numbers) {
  const offsets = numbers.map(n => Number(n));
  assert.equal(offsets.length, 16);
  assert.ok(offsets.every(x => Number.isSafeInteger(x) && x >= 0 && x < source.length));
  return Buffer.from(offsets.map(index => source[index]));
}
const keyMap = new Map([
  ['printed-row/visible-value', addressedKey(rowNumbers)],
  ['clockwise-spiral/visible-value', addressedKey(spiralNumbers)],
  ['printed-row/abs(3301-difference)-primes', addressedKey(rowNumbers.map(x => Math.abs(3301 - x)))],
  ['clockwise-spiral/3301-difference-primes', addressedKey(spiralNumbers.map(x => Math.abs(3301 - x)))]
]);
assert.equal(keyMap.size, 4);
assert.equal(new Set([...keyMap.values()].map(k => k.toString('hex'))).size, 4);

const column = [];
for (let c = 0; c < 8; c++)
  for (let r = 0; r < 32; r++) column.push(raw[8*r+c]);
const layouts = new Map([['printed-row', raw], ['printed-column', Buffer.from(column)]]);

const sourcePlant = fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp1-plaintext-reference.txt'))
  .subarray(0, 256);
assert.equal(sourcePlant.length, 256);

/** @param {Buffer} data */
function score(data) {
  let printable = 0, gpByte = 0, longestAscii = 0, run = 0;
  for (const byte of data) {
    if ((byte >= 32 && byte <= 126) || byte === 9 || byte === 10 || byte === 13) printable++;
    if (byte < 29) gpByte++;
    if (byte >= 32 && byte <= 126) run++;
    else run = 0;
    longestAscii = Math.max(run, longestAscii);
  }
  const magic = [
    ['PDF', '255044462d'], ['PNG', '89504e470d0a1a0a'], ['ZIP', '504b0304'],
    ['gzip', '1f8b08'], ['JPEG', 'ffd8ff'], ['bzip2', '425a68'],
    ['xz', 'fd377a585a00'], ['zstd', '28b52ffd'],
    ['SQLite', '53514c69746520666f726d6174203300']
  ].filter(([,h]) => data.subarray(0, h.length/2).toString('hex') === h)
    .map(([name]) => name);
  if (data.length > 1 && data[0] === 0x78 && (data[0] & 15) === 8 &&
    ((data[0]*256 + data[1]) % 31) === 0) magic.push('zlib');
  return {printable, gpByte, longestAscii, magic};
}

/**
 * @param {'ecb'|'cbc'|'ctr'} mode
 * @param {Buffer} key
 * @param {Buffer} data
 * @param {boolean} encrypt
 * @returns {Buffer}
 */
function crypt(mode, key, data, encrypt) {
  const iv = mode === 'ecb' ? null : Buffer.alloc(16);
  const engine = encrypt
    ? crypto.createCipheriv('aes-128-' + mode, key, iv)
    : crypto.createDecipheriv('aes-128-' + mode, key, iv);
  if (mode !== 'ctr') engine.setAutoPadding(false);
  return Buffer.concat([engine.update(data), engine.final()]);
}
const results = [];
for (const [keyName, key] of keyMap) {
  assert.equal(key.length, 16);
  for (const mode of ['ecb', 'cbc', 'ctr']) {
    const plantCipher = crypt(mode, key, sourcePlant, true);
    const recovered = crypt(mode, key, plantCipher, false);
    assert.deepEqual(recovered, sourcePlant);
    const wrongKey = Buffer.from(key);
    wrongKey[0] ^= 1;
    assert.equal(crypt(mode, wrongKey, plantCipher, false).equals(sourcePlant), false);
    for (const [layout, cipher] of layouts) {
      const decoded = crypt(mode, key, cipher, false);
      assert.equal(decoded.length, 256);
      const metrics = score(decoded);
      results.push({
        keyName, keyHex: key.toString('hex'), mode, layout,
        ...metrics, prefixHex: decoded.subarray(0, 24).toString('hex')
      });
    }
  }
}
assert.equal(results.length, 24);
const allPrintable = results.filter(x => x.printable === 256).length;
const allGpByte = results.filter(x => x.gpByte === 256).length;
const headers = results.filter(x => x.magic.length).length;
console.log(JSON.stringify({
  source: '2013 original DATA/560.13 indexed by original p15 displayed Fibonacci-prime square',
  originalPadSha256:digest,
  gridSha256:crypto.createHash('sha256').update(raw).digest('hex'),
  directions:'Original visible row and independently established clockwise spiral. Direct visible values and absolute 3301-difference source primes.',
  keyCount:4, modeCount:3, gridLayouts:2,
  candidates:24, allPrintable, allGpByte, headers,
  bestPrintable:results.reduce((a,b) => b.printable>a.printable?b:a),
  bestGpBytes:results.reduce((a,b) => b.gpByte>a.gpByte?b:a),
  bestRun:results.reduce((a,b) => b.longestAscii>a.longestAscii?b:a),
  completeResults:results,
  independentPlant:'Every one of 4 source-file indexed AES keys recovers 256/256 genuine LP1 plaintext bytes under all 3 modes; one-bit wrong key excluded'
}, null, 2));
