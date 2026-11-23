'use strict';

/**
 * Source-gated investigation of the two complete GP compass words in the
 * original p33–39 section and the physically western 32-byte p50 grid column.
 * Read-only single-file test. Requires only Node.js 22 built-ins.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const transcript = fs.readFileSync(path.join(root, 'lp2-transcription.txt'), 'utf8');
const grid = JSON.parse(fs.readFileSync(path.join(root, 'base60-grid.json'), 'utf8'));
const runeToIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const rubricPages = transcript.split('%');

/** @param {string} source @returns {number[]} */
function runeIndices(source) {
  return Array.from(source).filter(rune => runeToIndex.has(rune))
    .map(rune => runeToIndex.get(rune));
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (values.length * (values.length - 1));
}

/** @param {string} token @returns {number} */
function numericCell(token) {
  assert.equal(token.length, 2);
  const a = grid.alphabet.indexOf(token[0]);
  const b = grid.alphabet.indexOf(token[1]);
  assert(a >= 0 && b >= 0);
  const value = a * 60 + b;
  assert(value <= 255);
  return value;
}

/**
 * @param {Buffer} key
 * @param {number} ordinal
 * @param {number} length
 * @param {'big'|'little'} endian
 * @param {'ordinal'|'zero'} nonceSource
 * @param {boolean} rejectHigh
 * @returns {number[]}
 */
function keyStream(key, ordinal, length, endian, nonceSource, rejectHigh) {
  const iv = Buffer.alloc(16);
  if (nonceSource === 'ordinal') {
    if (endian === 'big') iv.writeUInt32BE(ordinal, 12);
    else iv.writeUInt32LE(ordinal, 0);
  }
  const cipher = crypto.createCipheriv('aes-256-ctr', key, iv);
  const bytes = Buffer.concat([
    cipher.update(Buffer.alloc(length * (rejectHigh ? 2 : 1))),
    cipher.final()
  ]);
  const digits = Array.from(bytes)
    .filter(byte => !rejectHigh || byte < 232)
    .slice(0, length)
    .map(byte => byte % 29);
  assert.equal(digits.length, length);
  return digits;
}

/** @param {number[]} text @param {number[]} pad @param {number} sign @returns {number[]} */
function transform(text, pad, sign) {
  assert.equal(text.length, pad.length);
  return text.map((value, i) => (value + sign * pad[i] + 29) % 29);
}

// Physical scans 50.jpg and 56.jpg (LP2 p33 and p39) contain these exact,
// punctuation-bounded GP29 compass digrams. Whole-word lengths are crucial:
// treating printed newlines as separators fabricates additional cardinal words.
assert(rubricPages[33].includes('-ᚾᚹ-'));
assert(rubricPages[39].trimStart().startsWith('ᛋᚹ-'));
const cardinals = new Set(['NE', 'NW', 'SE', 'SW']);
const compassWords = [];
for (let page = 0; page <= 55; page++) {
  for (const printedToken of rubricPages[page].split(/[-.]/)) {
    const word = runeIndices(printedToken)
      .map(index => corpus.translit[index]).join('');
    if (cardinals.has(word)) compassWords.push({page, word});
  }
}
assert.deepEqual(compassWords, [{page: 33, word: 'NW'}, {page: 39, word: 'SW'}]);

// The source-defined NW -> SW geometric reading follows the left/west column
// from the first row down to the last row of the original 32x8 printed grid.
assert.deepEqual(grid.rows.map(row => row.length), Array(32).fill(8));
const key = Buffer.from(grid.rows.map(row => numericCell(row[0])));
assert.equal(key.length, 32);
assert.equal(key.toString('hex'),
  'cb5c796d7350fdfe7aa48ed3de7a492ac90a7de7e9f0eb80006e398e446a9071');
assert.equal(crypto.createHash('sha256').update(key).digest('hex'),
  'dcd70c84ab465e956077ca9fb75974dbfd644e0f95a38858ed4691193b03e4d1');

// The five original numbered units have physical source-printed 1..5 headings.
// Stop each unit at the next heading; the final unit ends at the next '&'.
const headers = [...transcript.matchAll(/(?:^|\n)([1-5])-/g)];
assert.deepEqual(headers.map(header => Number(header[1])), [1, 2, 3, 4, 5]);
const numbered = headers.map((header, i) => {
  const start = header.index + header[0].length;
  const nextHeading = i < 4 ? headers[i + 1].index : transcript.length;
  return runeIndices(transcript.slice(start, Math.min(nextHeading, transcript.indexOf('&', start))));
});
assert.deepEqual(numbered.map(row => row.length), [139, 91, 98, 96, 129]);
const joined = numbered.flat();
assert.equal(crypto.createHash('sha256').update(Buffer.from(joined)).digest('hex'),
  'f432558b32ef4120d80f330d068d4f211005f4a6dac7780e3eec2d1e7a0f191a');

// Full original receiver, all five numbered units, no plaintext-selected keys.
// The ordinal IV is source-visible; zero IV and byte-rejection are explicit
// controls. The AES operation itself has no authenticated author selector.
const native = corpus.pages.find(page => page.page === 57).indices;
assert.equal(native.length, 95);
const results = [];
for (const endian of ['big', 'little']) {
  for (const nonceSource of ['ordinal', 'zero']) {
    for (const rejectHigh of [false, true]) {
      for (const sign of [-1, 1]) {
        const output = [];
        const plant = [];
        for (let i = 0; i < numbered.length; i++) {
          const pad = keyStream(key, i + 1, numbered[i].length, endian, nonceSource, rejectHigh);
          const actual = transform(numbered[i], pad, sign);
          output.push(actual);
          // A genuine solved-p57 native-GP text is encrypted under this precise
          // candidate and the exact positive plaintext recovered independently.
          const plain = Array.from({length: numbered[i].length}, (_, j) => native[j % native.length]);
          const ciphered = transform(plain, pad, -sign);
          const recovered = transform(ciphered, pad, sign);
          assert.deepEqual(recovered, plain);
          plant.push(...recovered);
        }
        assert.equal(plant.length, 553);
        results.push({
          endian, nonceSource, rejectHigh, sign,
          ioc: ioc(output.flat()),
          perItem: output.map(row => ioc(row)),
          plaintext: output.flat()
        });
      }
    }
  }
}
assert.equal(results.length, 16);
assert(Math.abs(ioc(joined) - 0.03423356133867966) < 1e-12);
const best = results.reduce((x, y) => y.ioc > x.ioc ? y : x);
assert(Math.abs(best.ioc - 0.03541945121471814) < 1e-12);
assert(best.ioc < 0.04);
console.log(JSON.stringify({
  sourceCompassWords: compassWords,
  westernColumnKeyHex: key.toString('hex'),
  numberedLengths: numbered.map(row => row.length),
  numberedCorpusSha256: 'f432558b32ef4120d80f330d068d4f211005f4a6dac7780e3eec2d1e7a0f191a',
  rawIoC: ioc(joined),
  sourceNativeP57IoC: ioc(native),
  variants: results.length,
  bestMode: {
    endian: best.endian,
    nonceSource: best.nonceSource,
    rejectHigh: best.rejectHigh,
    sign: best.sign
  },
  highestOriginalDecodedIoC: best.ioc,
  bestPerItemIoC: best.perItem,
  syntheticNativeGpRecovered: 553,
  unknownPlaintextRecovered: false
}, null, 2));
