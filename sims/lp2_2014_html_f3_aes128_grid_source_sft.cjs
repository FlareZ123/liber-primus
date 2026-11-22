'use strict';

/**
 * A source-selected AES-128 ECB inverse, with no key/password search.
 *
 * Hypothesis: Stage11 HTML(133,331) selects original p0 word40, the unique
 * run of three F-headed printed words supplies twelve non-F GP runes, and
 * the same HTML number's four distinct GP-prime factors supply four suffix
 * runes in outside-in ("RIGH") order. This produces exactly 16 source
 * indices, a candidate AES-128 byte key. Original 256-byte p50 numerals are
 * the only receiver. This hypothesis is not creator-authenticated.
 *
 * Node.js 22 CommonJS, source-only, no writes:
 * node sims/lp2_2014_html_f3_aes128_grid_source_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
/** @param {string} relative */
const read = relative => fs.readFileSync(path.join(ROOT, relative), 'utf8');
/** @param {string} relative */
const json = relative => JSON.parse(read(relative));
const source = json('resources/liber-primus/lp2-corpus.json');
const table = json('resources/liber-primus/lp2-grid-256.json');
const html = read('resources/historical/stage11-2014-index.html');
const title = Number(html.match(/<title>(\d+)<\/title>/)[1]);
const id = Number(html.match(/<div id="(\d+)">/)[1]);
assert.deepEqual([title, id], [133, 331]);
assert.equal(table.bytes[title], 141);
assert.equal(table.bytes[id % 256], 177);
assert.equal(table.bytes.length, 256);
const runeIndex = new Map(source.runes.map((glyph, i) => [glyph, i]));
const print = read('resources/liber-primus/lp2-transcription.txt').split('%').slice(0, 55);
const words = [];
let current = [];
let pageRange = [];
for (let p = 0; p < print.length; p++) {
  for (const glyph of Array.from(print[p])) {
    const index = runeIndex.get(glyph);
    if (index !== undefined) {
      current.push(index);
      if (pageRange.at(-1) !== p) pageRange.push(p);
    } else if ('-.,'.includes(glyph) && current.length) {
      words.push({indices: current, pages: pageRange});
      current = [];
      pageRange = [];
    }
  }
}
assert.equal(current.length, 0);
assert.equal(words.length, 2896);
const firstWords = words.filter(w => w.pages.includes(0));
assert.equal(firstWords.length, 59);
let total = 0;
const starts = firstWords.map(w => {
  const at = total;
  total += w.indices.length;
  return at;
});
assert.equal(total, 262);
assert.deepEqual(starts.slice(40, 44), [177, 183, 189, 192]);
assert.deepEqual(firstWords.slice(40, 43).map(w => w.indices.length), [6, 6, 3]);
assert.deepEqual(firstWords.slice(40, 43).map(w => w.indices[0]), [0, 0, 0]);
const tripleF = words.flatMap((word, i) =>
  i + 2 < words.length && [0,1,2].every(d => words[i + d].indices[0] === 0)
    ? [i] : []);
assert.deepEqual(tripleF, [40]);
assert.equal(table.bytes[189], 192);
assert.equal(table.bytes[192], 0);
const twelve = firstWords.slice(40, 43).flatMap(w => w.indices.slice(1));
assert.deepEqual(twelve, [14,25,13,6,14,20,7,12,16,25,6,9]);
assert.equal(twelve.length, 12);

// Stage11 (133|331) is the palindrome 133331=11×17×23×31.
// Outside-in factor order maps to the GP letters "RIGH" before GP T.
const factors = [11,31,17,23];
const four = factors.map(prime => source.prime.indexOf(prime));
assert.deepEqual(four, [4,10,6,8]);
assert.equal(four.map(i => source.translit[i]).join(''), 'RIGH');
assert.equal(Number(String(title) + String(id)), factors.reduce((n,p)=>n*p,1));
const key = Buffer.from([...twelve, ...four]);
assert.equal(key.length, 16);
const cipher = Buffer.from(table.bytes);
assert.equal(crypto.createHash('sha256').update(cipher).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
/** @param {Buffer} input @param {'encrypt'|'decrypt'} action */
function aes(input, action) {
  const method = action === 'decrypt'
    ? crypto.createDecipheriv('aes-128-ecb', key, null)
    : crypto.createCipheriv('aes-128-ecb', key, null);
  method.setAutoPadding(false);
  return Buffer.concat([method.update(input), method.final()]);
}
const plain = aes(cipher, 'decrypt');
assert(plain.length === 256);
assert(aes(plain, 'encrypt').equals(cipher));
const native = Buffer.from(Array.from({length: 256}, (_, i) => i));
assert(aes(aes(native, 'encrypt'), 'decrypt').equals(native));
/** @param {Buffer} data */
function entropy(data) {
  const hist = Array(256).fill(0);
  for (const byte of data) hist[byte]++;
  return hist.reduce((h, count) =>
    count ? h - count / data.length * Math.log2(count / data.length) : h, 0);
}
const counts = {
  printableASCII: [...plain].filter(x => x >= 32 && x <= 126).length,
  GP29Byte: [...plain].filter(x => x < 29).length,
  zero: [...plain].filter(x => x === 0).length,
  entropy: entropy(plain),
};
const signatures = [];
for (const [name, magic] of [
  ['gzip', '1f8b'], ['ZIP', '504b0304'], ['PNG', '89504e47'],
  ['JPEG', 'ffd8ff'], ['PDF', '25504446'], ['PGP', '2d2d2d2d2d']
]) if (plain.subarray(0, magic.length / 2).toString('hex') === magic)
  signatures.push(name);
assert.equal(signatures.length, 0);
const output = {
  source: '2014 HTML 133331 outside-in RIGH + original p0 FFF interiors',
  position: 'complete LP2 p50 numerical table, unchanged byte order',
  keyIndices: [...key],
  keyGP: [...key].map(i => source.translit[i]).join(' '),
  AES: 'aes-128-ecb, no IV, zero padding disabled',
  originalCipherSHA256: crypto.createHash('sha256').update(cipher).digest('hex'),
  decryptedHexFirst32: plain.subarray(0, 32).toString('hex'),
  decryptedASCIIHead: plain.subarray(0, 48).toString('latin1')
    .replace(/[^\x20-\x7e]/g, '.'),
  metrics: counts,
  knownHeaders: signatures,
  native256Positive: true,
  exactRoundTrip256: true,
  verdict: 'No self-describing or intelligible plaintext from this one source-derived AES-128 inverse.'
};
console.log(JSON.stringify(output, null, 2));
