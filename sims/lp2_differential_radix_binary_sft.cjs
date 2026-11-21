'use strict';

/**
 * Original-input diagnostic for a source-motivated alternative to a letterwise
 * cipher: encode successive GP29 rune displacements as an ordinary radix-28
 * binary file, with rare zero displacements acting as nulls or packet breaks.
 *
 * A valid standard compressed-file header or a reproducible decompression to
 * text would select a reversible route to authentic plaintext. The absence of
 * these signals only constrains this exact binary serialization family.
 *
 * Run: node sims/lp2_differential_radix_binary_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const {createHash} = require('node:crypto');

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(
  root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((n, p) => n + p.indices.length, 0), 12956);

const chapters = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];

/** @param {number[]} symbols @returns {number[]} */
function differences(symbols) {
  return symbols.slice(1).map((x, i) => (x - symbols[i] + 29) % 29);
}

/**
 * Encode a radix-N sequence as a minimal big-endian unsigned binary integer.
 * @param {number[]} digits
 * @param {number} radix
 * @returns {Buffer}
 */
function radixToBinary(digits, radix) {
  let integer = 0n;
  for (const digit of digits) {
    assert(Number.isInteger(digit) && digit >= 0 && digit < radix);
    integer = integer * BigInt(radix) + BigInt(digit);
  }
  let hex = integer.toString(16);
  if (hex.length & 1) hex = '0' + hex;
  return Buffer.from(hex, 'hex');
}

/**
 * Source-forward positive-control encoder. No fitted input parameters.
 * @param {Buffer} bytes
 * @param {number} radix
 * @returns {number[]}
 */
function binaryToRadix(bytes, radix) {
  let integer = BigInt('0x' + bytes.toString('hex'));
  const out = [];
  while (integer > 0n) {
    out.push(Number(integer % BigInt(radix)));
    integer /= BigInt(radix);
  }
  return out.reverse();
}

/**
 * @param {number[]} s
 * @param {'literal29'|'delta29'|'delta28skip'|'delta28zero'} encoding
 * @returns {{digits:number[],radix:number}}
 */
function getDigits(s, encoding) {
  if (encoding === 'literal29') return {digits: s, radix: 29};
  const ds = differences(s);
  if (encoding === 'delta29') return {digits: ds, radix: 29};
  if (encoding === 'delta28skip') return {
    digits: ds.filter(x => x !== 0).map(x => x - 1), radix: 28
  };
  if (encoding === 'delta28zero') return {
    digits: ds.map(x => x ? x - 1 : 0), radix: 28
  };
  throw new Error('Unexpected encoding: ' + encoding);
}

/** @param {Buffer} bytes @returns {number} */
function printableRatio(bytes) {
  let count = 0;
  for (const v of bytes) if (v === 9 || v === 10 || v === 13 ||
      (v >= 32 && v <= 126)) count++;
  return bytes.length ? count / bytes.length : 0;
}

/**
 * Scan exact-format signatures; no fuzzy header search or arbitrary offsets.
 * @param {Buffer} bytes
 * @returns {string[]}
 */
function signatures(bytes) {
  const h = bytes.subarray(0, 16).toString('hex');
  const found = [];
  const sig = [
    ['gzip', '1f8b08'], ['zip', '504b0304'], ['bzip2', '425a68'],
    ['xz', 'fd377a585a00'], ['zstd', '28b52ffd'],
    ['7z', '377abcaf271c'], ['png', '89504e470d0a1a0a'],
    ['pdf', '255044462d'], ['OpenPGP armor', '2d2d2d2d2d']
  ];
  for (const [name, prefix] of sig) if (h.startsWith(prefix)) found.push(name);
  if (bytes.length >= 2 && bytes[0] === 0x78 &&
      [0x01, 0x5e, 0x9c, 0xda].includes(bytes[1])) found.push('zlib');
  return found;
}

/** @param {Buffer} bytes @returns {{codec:string,len:number,sha256:string,head:string}[]} */
function decompress(bytes) {
  const codecs = [
    ['gzip', zlib.gunzipSync],
    ['zlib', zlib.inflateSync],
    ['raw-deflate', zlib.inflateRawSync],
    ['brotli', zlib.brotliDecompressSync]
  ];
  const positive = [];
  for (const [name, decode] of codecs) {
    let output;
    try {output = decode(bytes, {maxOutputLength: 200000});}
    catch {continue;} // Invalid compressed data is an expected format rejection.
    if (output.length >= 50 && printableRatio(output) >= 0.8) {
      positive.push({
        codec: name, len: output.length,
        sha256: createHash('sha256').update(output).digest('hex'),
        head: output.subarray(0, 100).toString('utf8')
      });
    }
  }
  return positive;
}

/**
 * @param {string} id
 * @param {number[]} s
 * @returns {{id:string,symbols:number,zeroSteps:number,tests:number,candidates:object[]} }
 */
function probe(id, s) {
  let tests = 0;
  const candidates = [];
  for (const encoding of ['literal29', 'delta29', 'delta28skip', 'delta28zero']) {
    const {digits, radix} = getDigits(s, encoding);
    for (const reverse of [false, true]) {
      tests++;
      const data = radixToBinary(reverse ? digits.slice().reverse() : digits, radix);
      const sig = signatures(data), dec = decompress(data);
      if (sig.length || dec.length) candidates.push({
        encoding, reverse, digits: digits.length, bytes: data.length,
        hexPrefix: data.subarray(0, 24).toString('hex'),
        signatures: sig, decompressed: dec
      });
    }
  }
  return {id, symbols: s.length,
    zeroSteps: differences(s).filter(d => d === 0).length,
    tests, candidates};
}

/**
 * For zeros-as-separators, probe each maximal nonempty nonzero-delta packet.
 * No packet is re-ordered or guessed.
 * @param {number[]} symbols
 * @returns {number[][]}
 */
function zeroDelimitedPackets(symbols) {
  const out = [];
  let packet = [];
  for (const d of differences(symbols)) {
    if (d === 0) {
      if (packet.length) out.push(packet);
      packet = [];
    } else packet.push(d - 1);
  }
  if (packet.length) out.push(packet);
  return out;
}

function testPlantedCompressedText() {
  const plaintext = Buffer.from(
    'LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES. '.repeat(6));
  const compressed = [
    ['gzip', zlib.gzipSync(plaintext)],
    ['zlib', zlib.deflateSync(plaintext)],
    ['raw-deflate', zlib.deflateRawSync(plaintext)],
    ['brotli', zlib.brotliCompressSync(plaintext)]
  ];
  for (const [codec, bytes] of compressed) {
    const digits = binaryToRadix(bytes, 28);
    const iv = 7;
    const cipher = [iv];
    for (const digit of digits)
      cipher.push((cipher[cipher.length - 1] + digit + 1) % 29);
    const recovered = radixToBinary(getDigits(cipher, 'delta28skip').digits, 28);
    assert.deepEqual(recovered, bytes, codec + ' binary→radix→rune round trip');
    assert(decompress(recovered).some(x => x.codec === codec &&
      x.len === plaintext.length), codec + ' full plaintext recovery');
  }
  assert.equal(decompress(Buffer.alloc(64, 255)).length, 0);
  return {codecs: compressed.map(x => x[0]), bytes: plaintext.length};
}

function main() {
  const planted = testPlantedCompressedText();
  const blocks = [
    {id:'whole-book', seq:pages.flatMap(p => p.indices)},
    ...chapters.map(([start, end]) => ({
      id:'chapter-p' + start + '-' + end,
      seq:pages.filter(p => p.page >= start && p.page <= end).flatMap(p => p.indices)
    })),
    ...pages.map(p => ({id:'page-' + p.page, seq:p.indices}))
  ];
  const results = blocks.map(({id, seq}) => probe(id, seq));
  const packetHits = [];
  let packetCount = 0;
  for (const block of blocks.slice(0, 10)) {
    const packets = zeroDelimitedPackets(block.seq);
    for (let i = 0; i < packets.length; i++) {
      const digits = packets[i];
      if (digits.length < 12) continue;
      packetCount++;
      for (const reverse of [false, true]) {
        const bytes = radixToBinary(reverse ? digits.slice().reverse() : digits, 28);
        const sig = signatures(bytes), dec = decompress(bytes);
        if (sig.length || dec.length) packetHits.push({
          block:block.id,packetIndex:i,reverse,bytes:bytes.length,
          signatures:sig,decompressed:dec
        });
      }
    }
  }
  const candidates = results.flatMap(x => x.candidates.map(y => ({
    block:x.id,...y
  }))).concat(packetHits);
  const summary = {
    scope:'original printed LP2 p0..55; exact unencrypted and differential radix codecs',
    planted, runes:12956, blocks:blocks.length, byteScans:results.reduce((s,x)=>s+x.tests,0),
    zeroSeparatedPacketsTested:packetCount, allDecodeCandidates:candidates,
    observedChapterLengths:results.slice(1,10).map(x=>({
      chapter:x.id,runes:x.symbols,zeroSteps:x.zeroSteps
    })),
    decision:candidates.length ?
      'Inspect exact original candidates; none is automatically authenticated.' :
      'No framed binary-file signature or long printable built-in decompression output under the frozen serializations.'
  };
  console.log(JSON.stringify(summary, null, 2));
  assert.equal(results[0].symbols, 12956);
  assert.equal(results.length, 65);
  assert.equal(results.reduce((s,x) => s + x.tests,0), 520);
}
if (require.main === module) main();
module.exports = {differences, radixToBinary, binaryToRadix,
  getDigits, signatures, decompress, probe, zeroDelimitedPackets};
