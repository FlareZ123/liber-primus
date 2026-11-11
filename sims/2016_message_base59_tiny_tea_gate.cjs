#!/usr/bin/env node
'use strict';

// Reproduce the 2016/2017 base-59 GP-coordinate hypothesis and a bounded
// TEA/XTEA ciphertext test. Run from the repository root:
//   node sims/2016_message_base59_tiny_tea_gate.cjs

const fs = require('node:fs');

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const corpus = readJson('resources/liber-primus/lp2-corpus.json');
const base60 = readJson('resources/liber-primus/base60-grid.json');

const runeNames = [
  'Feoh', 'Ur', 'Thorn', 'Os', 'Rad', 'Cen', 'Gyfu', 'Wynn', 'Haegl',
  'Nyd', 'Is', 'Ger', 'Eoh', 'Peorth', 'Eolh', 'Sigel', 'Tir', 'Beorc',
  'Eh', 'Mann', 'Lagu', 'Ing', 'Ethel', 'Daeg', 'Ac', 'Aesc', 'Yr',
  'Ior', 'Ear',
];

const gpPrime = new Map(corpus.translit.map((token, i) => [token, corpus.prime[i]]));
gpPrime.set('ING', gpPrime.get('NG'));
gpPrime.set('IO', gpPrime.get('IA'));
gpPrime.set('K', gpPrime.get('C'));
gpPrime.set('V', gpPrime.get('U'));
const tokens = [...gpPrime.keys()].sort((a, b) => b.length - a.length);

function gpSum(text) {
  const letters = text.toUpperCase().replace(/[^A-Z]/g, '');
  const runes = [];
  let i = 0;
  let sum = 0;
  while (i < letters.length) {
    const token = tokens.find((candidate) => letters.startsWith(candidate, i));
    if (!token) throw new Error(`Unmapped GP input at ${i}: ${letters.slice(i, i + 12)}`);
    runes.push(token);
    sum += gpPrime.get(token);
    i += token.length;
  }
  return { count: runes.length, sum, tokens: runes };
}

function getRune(page, offset) {
  const record = corpus.pages.find((p) => p.page === page);
  if (!record || offset < 0 || offset >= record.indices.length) {
    throw new Error(`Invalid rune coordinate page=${page}, offset=${offset}`);
  }
  const index = record.indices[offset];
  return { page, offset, index, translit: corpus.translit[index], rune: corpus.runes[index], name: runeNames[index] };
}

function coordinate(sum, radix = 59) {
  return { page: Math.floor(sum / radix), offset: sum % radix };
}

const sections2016 = [
  'Hello. The path lies empty; epiphany seeks the devoted. Liber Primus is the way.',
  'Its words are the map, their meaning is the road, and their numbers are the direction.',
  'Seek and you will be found. Good luck. 3301. Beware false paths. Verify OpenPGP 7A35090F.',
];
const warning2017 = 'Beware false paths. Always verify PGP signature from 7A35090F.';

const results2016 = sections2016.map((text, i) => {
  const encoded = gpSum(text);
  const coord = coordinate(encoded.sum);
  return { section: i + 1, count: encoded.count, sum: encoded.sum, ...coord };
});
const encoded2017 = gpSum(warning2017);
const coord2017Base59 = coordinate(encoded2017.sum, 59);
const coord2017OwnLength = coordinate(encoded2017.sum, encoded2017.count);

const page50Bytes = base60.byte_rows.flat();
const first = results2016[0];
if (first.page !== 50 || first.offset !== 49 || page50Bytes[first.offset] !== 16) {
  throw new Error('Unexpected page-50 table coordinate/value');
}
const extracted = [
  { source: '2016 §1', ...coordinate(2999), byte: page50Bytes[49], index: page50Bytes[49], name: runeNames[page50Bytes[49]], translit: corpus.translit[page50Bytes[49]] },
  { source: '2016 §2', ...getRune(47, 46) },
  { source: '2016 §3', ...getRune(43, 44) },
  { source: '2017 warning, reused base 59', ...getRune(coord2017Base59.page, coord2017Base59.offset) },
  { source: '2017 warning, own-length control', ...getRune(coord2017OwnLength.page, coord2017OwnLength.offset) },
];

// Standard TEA/XTEA decryption of the page-50 table as 32 row-major 64-bit
// ciphertext blocks. The key candidates below are deliberately source-derived;
// this is not a key search.
const DELTA = 0x9e3779b9 >>> 0;
function teaDec(v0, v1, k) {
  let sum = Math.imul(DELTA, 32) >>> 0;
  for (let i = 0; i < 32; i++) {
    v1 = (v1 - ((((v0 << 4) + k[2]) ^ (v0 + sum) ^ ((v0 >>> 5) + k[3])) >>> 0)) >>> 0;
    v0 = (v0 - ((((v1 << 4) + k[0]) ^ (v1 + sum) ^ ((v1 >>> 5) + k[1])) >>> 0)) >>> 0;
    sum = (sum - DELTA) >>> 0;
  }
  return [v0, v1];
}
function xteaDec(v0, v1, k) {
  let sum = Math.imul(DELTA, 32) >>> 0;
  for (let i = 0; i < 32; i++) {
    v1 = (v1 - (((((v0 << 4) ^ (v0 >>> 5)) + v0) ^ (sum + k[(sum >>> 11) & 3])) >>> 0)) >>> 0;
    sum = (sum - DELTA) >>> 0;
    v0 = (v0 - (((((v1 << 4) ^ (v1 >>> 5)) + v1) ^ (sum + k[sum & 3])) >>> 0)) >>> 0;
  }
  return [v0, v1];
}
function read32(a, little) {
  return little
    ? (a[0] | (a[1] << 8) | (a[2] << 16) | (a[3] << 24)) >>> 0
    : ((a[0] << 24) | (a[1] << 16) | (a[2] << 8) | a[3]) >>> 0;
}
function write32(x, little) {
  return little
    ? [x & 255, (x >>> 8) & 255, (x >>> 16) & 255, (x >>> 24) & 255]
    : [(x >>> 24) & 255, (x >>> 16) & 255, (x >>> 8) & 255, x & 255];
}
function scoreBytes(bytes) {
  const frequencies = new Array(256).fill(0);
  let printable = 0;
  for (const byte of bytes) {
    frequencies[byte]++;
    if (byte >= 32 && byte <= 126) printable++;
  }
  const entropy = -frequencies.filter(Boolean).reduce((acc, count) => {
    const p = count / bytes.length;
    return acc + p * Math.log2(p);
  }, 0);
  return {
    printableRatio: printable / bytes.length,
    entropyBitsPerByte: entropy,
    prefixHex: bytes.slice(0, 24).map((b) => b.toString(16).padStart(2, '0')).join(''),
    prefixAscii: bytes.slice(0, 96).map((b) => b >= 32 && b <= 126 ? String.fromCharCode(b) : '.').join(''),
  };
}
function decryptTable(keyWords, algorithm, blockLittleEndian, keyLittleEndian = false) {
  const decrypt = algorithm === 'TEA' ? teaDec : xteaDec;
  const out = [];
  for (let i = 0; i < 32; i++) {
    const block = page50Bytes.slice(i * 8, i * 8 + 8);
    const v0 = read32(block.slice(0, 4), blockLittleEndian);
    const v1 = read32(block.slice(4, 8), blockLittleEndian);
    const [p0, p1] = decrypt(v0, v1, keyWords.map((x) => x >>> 0));
    out.push(...write32(p0, blockLittleEndian), ...write32(p1, blockLittleEndian));
  }
  return scoreBytes(out);
}

const spiralValues = [3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222, 3152, 3038, 2838, 2472, 1820, 708, 1206, 4516];
const fibonacciPrimes = [2, 3, 5, 7, 13, 23, 43, 79, 149, 263, 463, 829, 1481, 2593, 4507, 7817];
const fibonacciRanks = [1, 2, 3, 4, 6, 9, 14, 22, 35, 56, 90, 145, 234, 378, 611, 988];

const candidateKeys = [
  { name: 'raw GP sums', words: [2999, 2819, 2581, 2131] },
  { name: 'F-adjusted sums', words: [3001, 2819, 2579, 2131] },
  { name: 'prime indices', words: [431, 410, 376, 321] },
  ...[
    ['p15 displayed values mod 256', spiralValues],
    ['p15 Fibonacci primes mod 256', fibonacciPrimes],
    ['p15 Fibonacci ranks mod 256', fibonacciRanks],
  ].map(([name, values]) => ({
    name,
    bytes: values.map((x) => x % 256),
  })),
];

const teaTests = [];
for (const candidate of candidateKeys) {
  for (const algorithm of ['TEA', 'XTEA']) {
    for (const blockLittleEndian of [false, true]) {
      if (candidate.words) {
        teaTests.push({
          key: candidate.name,
          algorithm,
          blockEndian: blockLittleEndian ? 'LE' : 'BE',
          ...decryptTable(candidate.words, algorithm, blockLittleEndian),
        });
      } else {
        for (const keyLittleEndian of [false, true]) {
          const keyWords = Array.from({ length: 4 }, (_, i) =>
            read32(candidate.bytes.slice(i * 4, i * 4 + 4), keyLittleEndian));
          teaTests.push({
            key: candidate.name,
            algorithm,
            keyEndian: keyLittleEndian ? 'LE' : 'BE',
            blockEndian: blockLittleEndian ? 'LE' : 'BE',
            ...decryptTable(keyWords, algorithm, blockLittleEndian),
          });
        }
      }
    }
  }
}

console.log(JSON.stringify({
  2016: results2016,
  2017: {
    count: encoded2017.count,
    sum: encoded2017.sum,
    base59: coord2017Base59,
    ownLength: coord2017OwnLength,
  },
  extracted,
  initialsBase59: extracted.slice(0, 4).map((x) => x.name[0]).join(''),
  teaTests,
}, null, 2));
