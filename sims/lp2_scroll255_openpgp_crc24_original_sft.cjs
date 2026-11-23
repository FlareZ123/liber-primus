'use strict';
/**
 * Original LP2 p3–p7 255 complete words -> p8 255 runes.
 * Bounded OpenPGP CRC-24 word-register consumer, without learned keys.
 *
 * The authentic 2013–2016 Cicada material routinely used OpenPGP ASCII
 * armor. CRC-24 is the standard OpenPGP armor checksum (initial B704CE,
 * polynomial 1864CFB), so it supplies an independently specified algorithm.
 * This source DOES NOT explicitly instruct its use on LP2 printed words.
 *
 * Test source-native rune indices, prime values, transliteration ASCII
 * and rune UTF-8; checksum per word or carry across words; raw CRC-24
 * mod29 and each byte mod29, optionally through either literal table
 * interpretation of original p49–p51 256 cells. Both GP29 addition signs.
 * No tuned key, word selector, seed, page phase or English score is used.
 *
 * Node.js 22 CommonJS SFT: node sims/lp2_scroll255_openpgp_crc24_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(root, 'lp2-grid-256.json'), 'utf8'));
const transcription = fs.readFileSync(path.join(root, 'lp2-transcription.txt'), 'utf8');
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const words = [];
let current = [];
for (let page = 3; page <= 7; page++) {
  for (const ch of transcription.split('%')[page]) {
    if (runeIndex.has(ch)) current.push(runeIndex.get(ch));
    else if ((ch === '-' || ch === '.') && current.length) {
      words.push(current);
      current = [];
    }
  }
}
if (current.length) words.push(current);
const original = corpus.pages[8].indices;
assert.equal(words.length, 255);
assert.equal(original.length, 255);
assert.deepEqual(words.flat(), corpus.pages.slice(3, 8).flatMap(p => p.indices));
const mod = x => (x % 29 + 29) % 29;

/**
 * Standard CRC-24/OpenPGP register, identical to RFC 4880 section 6.1.
 * @param {readonly number[]} bytes
 * @param {number} [seed]
 * @returns {number}
 */
function crc24(bytes, seed = 0xB704CE) {
  let reg = seed;
  for (const byte of bytes) {
    assert(Number.isInteger(byte) && byte >= 0 && byte <= 255);
    reg ^= byte << 16;
    for (let bit = 0; bit < 8; bit++) {
      reg <<= 1;
      if (reg & 0x1000000) reg ^= 0x1864CFB;
    }
  }
  return reg & 0xffffff;
}
assert.equal(crc24([...Buffer.from('123456789', 'ascii')]), 0x21CF02);

/** @type {Record<string, (word: number[]) => number[]>} */
const serializers = {
  'gp-index-byte': word => word,
  'gp-prime-byte': word => word.map(v => corpus.prime[v]),
  'translit-ascii': word => [...word.map(v => corpus.translit[v]).join('')]
    .map(ch => ch.charCodeAt(0)),
  'rune-utf8': word => [...Buffer.from(word.map(v => corpus.runes[v]).join(''), 'utf8')]
};
const tokens = grid.pages.flatMap(page => page.tokens);
assert.equal(tokens.length, 256);
const table = {};
for (const radix of [59, 60]) {
  const alphabet = radix === 59 ? grid.alphabet.replace('f', '') : grid.alphabet;
  table[radix] = tokens.map(token => {
    const first = alphabet.indexOf(token[0]);
    const second = alphabet.indexOf(token[1]);
    assert(first >= 0 && second >= 0);
    return radix * first + second;
  });
}

/** @param {number[]} symbols @returns {number} */
function ioc(symbols) {
  const freq = Array(29).fill(0);
  for (const i of symbols) freq[i]++;
  return freq.reduce((total, n) => total + n * (n - 1), 0) /
    (symbols.length * (symbols.length - 1));
}
const controls = corpus.pages[57].indices;
assert.equal(controls.length, 95);
const sourceNativeIOC = ioc(controls);
const originalIOC = ioc(original);
assert(Math.abs(sourceNativeIOC - 0.06270996640537514) < 1e-12);

const records = [];
for (const [serializer, encode] of Object.entries(serializers)) {
  for (const state of ['reset-per-word', 'carry-register']) {
    let previous = 0xB704CE;
    const crc = words.map(word => {
      const value = crc24(encode(word), state === 'reset-per-word' ? 0xB704CE : previous);
      previous = value;
      return value;
    });
    /** @type {Record<string, number[]>} */
    const keys = {
      'crc24-whole-mod29': crc.map(x => x % 29),
      'crc24-low-byte': crc.map(x => (x & 255) % 29),
      'crc24-middle-byte': crc.map(x => ((x >>> 8) & 255) % 29),
      'crc24-high-byte': crc.map(x => (x >>> 16) % 29)
    };
    for (const radix of [59, 60]) {
      for (const [name, shift] of [['low', 0], ['middle', 8], ['high', 16]]) {
        keys['p50-radix' + radix + '-' + name] =
          crc.map(x => table[radix][(x >>> shift) & 255] % 29);
      }
    }
    for (const [key, stream] of Object.entries(keys)) {
      assert.equal(stream.length, 255);
      for (const sign of [-1, +1]) {
        const decode = cipher => cipher.map((c, i) => mod(c + sign * stream[i % stream.length]));
        const encodeCipher = plain => plain.map((p, i) => mod(p - sign * stream[i % stream.length]));
        const plain = decode(original);
        assert.deepEqual(encodeCipher(plain), original);
        const native = Array.from({length: 255}, (_, i) => controls[i % controls.length]);
        assert.deepEqual(decode(encodeCipher(native)), native);
        const score = ioc(plain);
        records.push({
          serializer, state, key, sign,
          exactKeyMatches: original.reduce((sum, c, i) => sum + Number(c === stream[i]), 0),
          decodedIOC: score,
          first35GP: plain.slice(0, 35).map(v => corpus.translit[v]).join('')
        });
      }
    }
  }
}
assert.equal(records.length, 160);
records.sort((a, b) => b.decodedIOC - a.decodedIOC);
const best = records[0];
const strongestMatches = [...records].sort((a, b) => b.exactKeyMatches - a.exactKeyMatches)[0];
assert(best.decodedIOC < 0.04, 'Unexpectedly structured original-channel output');
console.log(JSON.stringify({
  original: 'LP2 p3–p7 255 complete printed words -> p8 255 unchanged runes',
  algorithm: 'OpenPGP CRC-24 exact RFC 4880 parameters',
  positiveRFC4880Vector: '123456789 -> 21CF02',
  wordCount: words.length,
  originalIOC, solvedP57IOC: sourceNativeIOC,
  serializers: Object.keys(serializers),
  stateModels: ['reset-per-word', 'carry-register'],
  candidateCount: records.length,
  bestDecodedIOC: best,
  strongestDirectMatch: strongestMatches,
  sourceNativePlantRecovered: 255,
  originalReencrypted: 255,
  verdict: 'No authentic 255-rune plaintext or checksum equality from the specified source-native CRC-24 family; conditional OpenPGP-word checksum hypothesis rejected, no claim about other ciphers'
}, null, 2));
