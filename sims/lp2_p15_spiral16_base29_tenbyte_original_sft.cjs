'use strict';

/**
 * One executable original-input test for the p15 16-cell outward spiral as
 * a 16-GP29-digit / 10-byte, lossless binary transport on physical pp16–22.
 *
 * node sims/lp2_p15_spiral16_base29_tenbyte_original_sft.cjs
 *
 * Source art: LP2 p15, original scan 32.jpg. This is a conditional hypothesis,
 * not an author-authenticated cipher or a recovered file.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));

const originalSquare = [
  3258, 3222, 3152, 3038,
  3278, 3299, 3298, 2838,
  3288, 3294, 3296, 2472,
  4516, 1206, 708, 1820,
];
const outward = [5, 6, 10, 9, 8, 4, 0, 1, 2, 3, 7, 11, 15, 14, 13, 12];
const outwardValues = [
  3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222,
  3152, 3038, 2838, 2472, 1820, 708, 1206, 4516,
];
assert.deepEqual(outward.map(i => originalSquare[i]), outwardValues);

const pages = corpus.pages.filter(p => p.page >= 16 && p.page <= 22);
assert.deepEqual(pages.map(p => p.indices.length), [267, 273, 260, 271, 269, 273, 131]);
const source = pages.flatMap(p => p.indices);
assert.equal(source.length, 1744);
assert.equal(source.length % 16, 0);
assert.equal(source.length / 16, 109);
assert(source.every(x => Number.isInteger(x) && x >= 0 && x < 29));

const RADIX = 29n;
const CAPACITY = RADIX ** 16n;
const MAX_FIRST_BYTE = (CAPACITY - 1n) / (256n ** 9n);
assert.equal(MAX_FIRST_BYTE, 52n);

const ascending = Array.from({length: 16}, (_, i) => i);
const orders = {
  printed: ascending,
  clockwise: outward,
  counterclockwise: [outward[0], ...outward.slice(1).reverse()],
};
const expectedFirstTen = {
  'printed/forward': '22650d3842114774a755',
  'printed/reverse': '0a97f21f5b13b4ed3479',
  'clockwise/forward': '0742184e5b888433c165',
  'clockwise/reverse': '1d79eda3ac7f0c737b89',
  'counterclockwise/forward': '067f927bcb387e45cc1d',
  'counterclockwise/reverse': '3383167e058fb86844b1',
};

function indices(order, reverse) {
  return reverse ? order.slice().reverse() : order.slice();
}

function encodeBlock(runicBlock, order) {
  assert.equal(runicBlock.length, 16);
  let n = 0n;
  for (const p of order) {
    const x = runicBlock[p];
    assert(Number.isInteger(x) && x >= 0 && x < 29);
    n = n * RADIX + BigInt(x);
  }
  assert(n < CAPACITY);
  const out = Buffer.alloc(10);
  for (let i = 9; i >= 0; --i) {
    out[i] = Number(n & 255n);
    n >>= 8n;
  }
  assert.equal(n, 0n);
  assert(out[0] <= 52);
  return out;
}

function decodeBlock(chunk, order) {
  assert.equal(chunk.length, 10);
  let n = 0n;
  for (const b of chunk) n = (n << 8n) + BigInt(b);
  assert(n < CAPACITY, 'byte chunk lies outside the lossless base29 image');
  const digits = Array(16).fill(0);
  for (let i = 15; i >= 0; --i) {
    digits[i] = Number(n % RADIX);
    n /= RADIX;
  }
  assert.equal(n, 0n);
  const original = Array(16).fill(0);
  for (let i = 0; i < 16; ++i) original[order[i]] = digits[i];
  return original;
}

function magic(buf) {
  const h = buf.subarray(0, 8).toString('hex');
  const prefix = pattern => h.startsWith(pattern);
  if (prefix('1f8b08')) return 'gzip';
  if (prefix('255044462d')) return 'PDF';
  if (prefix('425a6831') || prefix('425a6839')) return 'bzip2';
  if (prefix('89504e470d0a1a0a')) return 'PNG';
  if (prefix('504b0304')) return 'ZIP';
  if (prefix('52696646')) return 'RIFF';
  if (prefix('7f454c46')) return 'ELF';
  return null;
}

const positives = corpus.pages.find(p => p.page === 57).indices.slice(0, 16);
assert.equal(positives.length, 16);
const gzipHeader = Buffer.from('1f8b0800000000000003', 'hex');
let headerInteger = 0n;
for (const b of gzipHeader) headerInteger = (headerInteger << 8n) + BigInt(b);
assert(headerInteger < CAPACITY);

for (const [name, baseOrder] of Object.entries(orders)) {
  for (const reverse of [false, true]) {
    const order = indices(baseOrder, reverse);
    const id = name + '/' + (reverse ? 'reverse' : 'forward');
    const blocks = [];
    const recovered = [];
    for (let p = 0; p < source.length; p += 16) {
      const cipher = encodeBlock(source.slice(p, p + 16), order);
      blocks.push(cipher);
      recovered.push(...decodeBlock(cipher, order));
    }
    assert.deepEqual(recovered, source);
    const bytes = Buffer.concat(blocks);
    assert.equal(bytes.length, 1090);
    assert.equal(bytes.subarray(0, 10).toString('hex'), expectedFirstTen[id]);
    assert.equal(magic(bytes), null);
    assert(blocks.every(b => b[0] <= Number(MAX_FIRST_BYTE)));
    const printable = bytes.filter(b => (b >= 32 && b <= 126) || b === 9 || b === 10 || b === 13).length;
    assert(printable / bytes.length < 0.5);

    // Source-native GP positive, through the same full 10-byte inverse.
    const clearBlock = encodeBlock(positives, order);
    assert.deepEqual(decodeBlock(clearBlock, order), positives);

    // Format-detector positive: a real 10-byte RFC1952 gzip header is
    // representable by one 16-rune group; this is a header-only control.
    const encodedHeaderDigits = Array(16).fill(0);
    let h = headerInteger;
    for (let k = 15; k >= 0; --k) {
      encodedHeaderDigits[k] = Number(h % RADIX);
      h /= RADIX;
    }
    assert.equal(h, 0n);
    const reconstructed = Array(16).fill(0);
    for (let k = 0; k < 16; ++k) reconstructed[order[k]] = encodedHeaderDigits[k];
    assert.equal(encodeBlock(reconstructed, order).toString('hex'), gzipHeader.toString('hex'));
    assert.equal(magic(gzipHeader), 'gzip');

    console.log(id + ': PASS 1744/1744 roundtrip, 109 frames / 1090 bytes, first10=' +
      bytes.subarray(0, 10).toString('hex') +
      ', printable=' + (printable / bytes.length).toFixed(6) +
      ', standard opening absent');
  }
}
console.log('PASS: capacity first-byte <= 52 under every secret GP29 digit alphabet; ' +
  'BZh/PNG/ZIP/OpenPGP binary headers impossible at 10-byte frame start. ' +
  'No unknown-page plaintext/key/file recovered.');
