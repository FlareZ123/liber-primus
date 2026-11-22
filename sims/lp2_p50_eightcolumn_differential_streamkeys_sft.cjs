'use strict';

/**
 * Source-derived 8×32-byte p50 keys as AES-256-CTR / ChaCha20 keystreams
 * for the observed near-no-repeat GP29 ciphertext *difference* channel.
 *
 * Reversible special-step alphabet: one reserved rune EA=28 encodes ΔC=0;
 * every other rune P in 0..27 encodes 1+((P ± K) mod28).
 * 28-valued K comes from the source's eight 32-byte columns.
 *
 * All geometric, clock and cipher choices are frozen before source inspection.
 * Uses Node22 builtin crypto. Windows: run this single file.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const sourceBuffer = fs.readFileSync(path.join(root, 'resources/lp2-transcription.txt'));
const source = sourceBuffer.toString('utf8').replace(/\r\n/g, '\n');
const gridFile = fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-grid-256.json'));
const grid = JSON.parse(gridFile);
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const bytes = grid.pages.flatMap((page) => page.bytes);
assert.equal(bytes.length, 256);
assert.ok(crypto.getCiphers().includes('chacha20'), 'ChaCha20 stream cipher missing');
const keys = [
  Array.from({ length: 8 }, (_, c) =>
    Buffer.from(Array.from({ length: 32 }, (_, r) => bytes[r * 8 + c]))),
  Array.from({ length: 8 }, (_, c) =>
    Buffer.from(bytes.slice(c * 32, (c + 1) * 32)))
];
const geometries = ['vertical-columns', 'row-major-blocks'];
const runeMap = new Map(corpus.runes.map((r, i) => [r, i]));
const chunks = source.split('%').filter((part) => part.trim()).slice(0, -2);
const sections = chunks.join('%').split('$').filter((s) => /[\u16a0-\u16ff]/u.test(s))
  .map((part) => Array.from(part, (c) => runeMap.get(c)).filter(Number.isInteger));
assert.deepEqual(sections.map((x) => x.length),
  [729, 1145, 1738, 1894, 1021, 1433, 1680, 3316]);
assert.deepEqual(sections.flat(), corpus.pages.filter((x) => x.page <= 55 && x.indices.length)
  .flatMap((x) => x.indices));
const known = corpus.pages.find((x) => x.page === 57).indices;
assert.ok(known.length > 50 && known.every((x) => x >= 0 && x < 29));

/**
 * @param {number[]} xs Original GP29 rune indices.
 * @returns {number} Index of coincidence independent of spaces and symbols order.
 */
function ioc(xs) {
  const counts = new Array(29).fill(0);
  for (const x of xs) counts[x]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) / (xs.length * (xs.length - 1));
}

/**
 * @param {string} algorithm Native AES-256-CTR or ChaCha20.
 * @param {Buffer} key Original 32-byte table column/chunk.
 * @param {number} secIndex Original eight-section index.
 * @param {string} ivMode Either fixed zero or section-index.
 * @param {string} mode Byte %28, or unbiased byte rejection at 252.
 * @param {number} count Maximum per-section key digits.
 * @returns {number[]} 28-valued exact stream key schedule.
 */
function keyStream(algorithm, key, secIndex, ivMode, mode, count) {
  const iv = Buffer.alloc(16);
  if (ivMode === 'section-index') iv.writeUInt32BE(secIndex, 12);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const tape = Buffer.concat([cipher.update(Buffer.alloc(count * 2)), cipher.final()]);
  const result = [];
  for (const b of tape) {
    if (mode === 'byte-mod28' || b < 252) result.push(b % 28);
    if (result.length === count) break;
  }
  assert.equal(result.length, count);
  return result;
}

/**
 * @param {number[]} cipher Full ciphertext section.
 * @param {number[]} key 28-symbol keystream.
 * @param {number} preceding Previous section's last ciphertext rune, or 0.
 * @param {1|-1} sign Encryption polarity.
 * @param {boolean} skipZero If true reserved marker consumes no key.
 * @returns {number[]} Recovered 29-symbol plaintext.
 */
function decode(cipher, key, preceding, sign, skipZero) {
  const plain = [];
  let last = preceding, clock = 0;
  for (let i = 0; i < cipher.length; i++) {
    const step = (cipher[i] - last + 29) % 29;
    const value = step === 0 ? 28 : (step - 1 - sign * key[clock] + 56) % 28;
    plain.push(value);
    if (step !== 0 || !skipZero) clock++;
    last = cipher[i];
  }
  return plain;
}

/**
 * @param {number[]} plain Known GP29 source.
 * @param {number[]} key 28-valued keystream.
 * @param {number} preceding Previous ciphertext rune or zero.
 * @param {1|-1} sign Encryption polarity.
 * @param {boolean} skipZero Reserved marker key bypass.
 * @returns {number[]} Generated true ciphertext.
 */
function encode(plain, key, preceding, sign, skipZero) {
  const cipher = [];
  let last = preceding, clock = 0;
  for (const value of plain) {
    const step = value === 28 ? 0 : 1 + ((value + sign * key[clock] + 28) % 28);
    const next = (last + step) % 29;
    cipher.push(next);
    if (step !== 0 || !skipZero) clock++;
    last = next;
  }
  return cipher;
}

// Confirm full-original-sized independent planted inverse for both available
// historically plausible 256-bit cipher primitives, both F-like key clocks.
for (const algorithm of ['aes-256-ctr', 'chacha20']) {
  for (const skipZero of [false, true]) {
    for (const mode of ['byte-mod28', 'reject252']) {
      let prev = 0;
      for (let section = 0; section < 8; section++) {
        const sectionPlain = Array.from({ length: sections[section].length },
          (_, i) => known[(i + section) % known.length]);
        const key = keyStream(algorithm, keys[0][section], section, 'zero', mode,
          sectionPlain.length);
        const cipher = encode(sectionPlain, key, prev, 1, skipZero);
        const inverse = decode(cipher, key, prev, 1, skipZero);
        assert.deepEqual(inverse, sectionPlain);
        prev = cipher[cipher.length - 1];
      }
    }
  }
}

const candidates = [];
for (const algorithm of ['aes-256-ctr', 'chacha20']) {
  for (let geo = 0; geo < 2; geo++) {
    for (const order of ['forward', 'reverse']) {
      for (const iv of ['zero', 'section-index']) {
        for (const byteMode of ['byte-mod28', 'reject252']) {
          for (const sign of [-1, 1]) {
            for (const predecessor of ['section-reset', 'continuous']) {
              for (const skipZero of [false, true]) {
                let last = 0, totalSpecial = 0;
                const flat = [], local = [];
                for (let i = 0; i < 8; i++) {
                  const sec = sections[i];
                  if (predecessor === 'section-reset') last = 0;
                  const stream = keyStream(algorithm, keys[geo][order === 'forward' ? i : 7-i],
                    i, iv, byteMode, sec.length);
                  const recovered = decode(sec, stream, last, sign, skipZero);
                  local.push(ioc(recovered));
                  flat.push(...recovered);
                  totalSpecial += recovered.filter((x) => x === 28).length;
                  last = sec[sec.length - 1];
                }
                candidates.push({
                  algorithm, geometry: geometries[geo], order, iv,
                  byteMode, sign, predecessor, skipZero,
                  globalIoc: ioc(flat), maxSectionIoc: Math.max(...local),
                  minSectionIoc: Math.min(...local), reservedRuneOccurrences: totalSpecial
                });
              }
            }
          }
        }
      }
    }
  }
}
assert.equal(candidates.length, 256);
const ranking = candidates.slice().sort((a, b) => b.globalIoc - a.globalIoc);
const original = sections.flat();
const zeros = sections.reduce((acc, sec) => {
  for (let i = 1; i < sec.length; i++) acc += Number(sec[i] === sec[i-1]);
  return acc;
}, 0);
console.log(JSON.stringify({
  hypothesis: 'p50 eight table master keys + ciphertext-difference 28-alphabet step channel',
  originalSourceSHA256: crypto.createHash('sha256').update(sourceBuffer).digest('hex'),
  originalGridSHA256: crypto.createHash('sha256').update(gridFile).digest('hex'),
  originalCipherRunes: original.length, originalDifferentialEqualPairsWithinSections: zeros,
  solvedAuthenticClearP57Ioc: ioc(known), originalUnknownIoc: ioc(original),
  frozenFamilies: candidates.length,
  bestTenByWholeTapeIoc: ranking.slice(0, 10),
  maxByCipher: Object.fromEntries(['aes-256-ctr', 'chacha20'].map((algorithm) =>
    [algorithm, ranking.find((c) => c.algorithm === algorithm)])),
  positiveControls: 'All 8 full-size original-shaped planted sections for both ciphers and both clocks reencrypt/decrypt exactly',
  conclusion: ranking[0].globalIoc > 0.052
    ? 'POSSIBLE REAL GP29 PLAINTEXT: inspect and independently verify original source'
    : 'No native-GP plaintext under these exactly defined 256 table-derived differential stream ciphers'
}, null, 2));
