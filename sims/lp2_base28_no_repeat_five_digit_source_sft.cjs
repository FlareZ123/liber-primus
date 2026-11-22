'use strict';

/**
 * Original LP2 self-excluding difference and base-28 five-digit byte-packing gate.
 * Run: node sims/lp2_base28_no_repeat_five_digit_source_sft.cjs
 * Reads only canonical local repository files. No external packages or writes.
 * This checks a deliberately narrow, motivated candidate, not a proven LP2 cipher.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const pages = corpus.pages.filter((page) => page.page <= 55 && page.indices.length);
const cipher = pages.flatMap((page) => page.indices);
assert.equal(pages.length, 55);
assert.equal(cipher.length, 12956);
const modulus = 29;
const base = 28;
const blockLength = 5;
const byteLimit = 2 ** 24;
const chapterLengths = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];
assert.equal(chapterLengths.reduce((a, b) => a + b, 0), cipher.length);

/**
 * A digit in [0,27] is the rank of a new GP29 rune among all 28 glyphs
 * different from the immediately preceding rune. A repeated rune is -1.
 * @param {number[]} runes
 * @returns {number[]}
 */
function nonrepeatDigits(runes) {
  return runes.slice(1).map((value, i) => ((value - runes[i] + modulus) % modulus) - 1);
}

/**
 * @param {number[]} digits Five base-28 digits
 * @param {boolean} reverse Least-significant digit first if true
 * @returns {number}
 */
function base28Number(digits, reverse) {
  const order = reverse ? digits.slice().reverse() : digits;
  return order.reduce((value, digit) => value * base + digit, 0);
}

/**
 * @param {number} value Unsigned 24-bit value
 * @returns {number[]}
 */
function encode24(value) {
  assert(Number.isInteger(value) && value >= 0 && value < byteLimit);
  const digits = Array(blockLength);
  for (let i = digits.length - 1; i >= 0; i--) {
    digits[i] = value % base;
    value = Math.floor(value / base);
  }
  assert.equal(value, 0);
  return digits;
}

/**
 * @param {number[]} digits
 * @param {number} initial GP29 starting glyph
 * @returns {number[]}
 */
function encodeNonrepeat(digits, initial) {
  const result = [initial];
  let previous = initial;
  for (const digit of digits) {
    assert(Number.isInteger(digit) && digit >= 0 && digit < base);
    previous = (previous + digit + 1) % modulus;
    result.push(previous);
  }
  return result;
}

/**
 * Count five-digit blocks that cannot represent three raw bytes because their
 * base-28 numeral is >= 2^24. Blocks touching zero-difference escape sites
 * are skipped, as a charitable provision for a separate unknown escape law.
 * @param {number[][]} streams
 * @returns {{phase:number,reverse:boolean,valid:number,illegal:number,escape:number,printable:number,bytes:number}[]}
 */
function scan(streams) {
  const cases = [];
  for (let phase = 0; phase < blockLength; phase++) {
    for (const reverse of [false, true]) {
      let valid = 0;
      let illegal = 0;
      let escape = 0;
      let printable = 0;
      for (const digits of streams) {
        for (let i = phase; i + blockLength <= digits.length; i += blockLength) {
          const block = digits.slice(i, i + blockLength);
          if (block.some((digit) => digit < 0)) {
            escape++;
            continue;
          }
          const value = base28Number(block, reverse);
          if (value >= byteLimit) {
            illegal++;
            continue;
          }
          valid++;
          const bytes = [Math.floor(value / 65536), Math.floor(value / 256) % 256, value % 256];
          printable += bytes.filter((byte) => byte >= 32 && byte <= 126).length;
        }
      }
      cases.push({ phase, reverse, valid, illegal, escape, printable, bytes: 3 * valid });
    }
  }
  return cases;
}

// Positive control: encode exact 24-bit byte triples to base28, apply a
// 29-symbol predecessor-excluding emission, invert and recover every byte.
const plantedBytes = [
  0, 1, 2, 127, 128, 255, 255, 255, 255, 19, 29, 57,
  32, 65, 90, 112, 114, 105, 109, 117, 115, 240, 0, 1
];
const plantedDigits = [];
for (let i = 0; i < plantedBytes.length; i += 3) {
  const value = plantedBytes[i] * 65536 + plantedBytes[i + 1] * 256 + plantedBytes[i + 2];
  plantedDigits.push(...encode24(value));
}
const plantedCipher = encodeNonrepeat(plantedDigits, 13);
assert.deepEqual(nonrepeatDigits(plantedCipher), plantedDigits);
const plantedDecoded = [];
for (let i = 0; i < plantedDigits.length; i += 5) {
  const value = base28Number(plantedDigits.slice(i, i + 5), false);
  assert(value < byteLimit);
  plantedDecoded.push(Math.floor(value / 65536), Math.floor(value / 256) % 256, value % 256);
}
assert.deepEqual(plantedDecoded, plantedBytes);
console.log('POSITIVE 24-byte → 40 base28 digits → 41 GP29 runes → original 24 bytes: PASS');

const book = nonrepeatDigits(cipher);
const zeroCount = book.filter((digit) => digit < 0).length;
assert.equal(book.length, 12955);
assert.equal(zeroCount, 86);
const chapterStreams = [];
let offset = 0;
for (const length of chapterLengths) {
  chapterStreams.push(nonrepeatDigits(cipher.slice(offset, offset + length)));
  offset += length;
}
const byClock = {
  continuous: scan([book]),
  chapter: scan(chapterStreams),
  page: scan(pages.map((page) => nonrepeatDigits(page.indices))),
  'zero-sites-dropped': scan([book.filter((digit) => digit >= 0)])
};

console.log('ORIGINAL exact LP2 pp0–55 runes: ', cipher.length);
console.log('ORIGINAL near-excluded predecessor equalities: ', zeroCount);
console.log('Five base28 digits have ', base ** 5, ' possible values; three bytes have ', byteLimit);
console.log('Unsigned three-byte rejection fraction under uniform base28:', (base ** 5 - byteLimit) / (base ** 5));
for (const [clock, cases] of Object.entries(byClock)) {
  const best = cases.reduce((a, b) => b.illegal < a.illegal ? b : a);
  console.log(clock, 'best of ten fixed phase/orientation cases:', JSON.stringify(best));
  for (const test of cases) {
    console.log(clock, 'phase=' + test.phase, 'reverse=' + test.reverse,
      'legal=' + test.valid, 'ILLEGAL=' + test.illegal,
      'escaped=' + test.escape, 'printable=' + test.printable + '/' + test.bytes);
    assert(test.illegal > 0, clock + ' had an unexpected all-legal readout');
  }
}
assert.equal(byClock.continuous.find((x) => x.phase === 2 && x.reverse).illegal, 47);
assert.equal(byClock.page.find((x) => x.phase === 0 && x.reverse).illegal, 43);
assert.equal(byClock['zero-sites-dropped'].find((x) => x.phase === 4 && !x.reverse).illegal, 54);
console.log('ORIGINAL 5×base28→3-byte fixed-width candidate: REJECTED under all tested source clocks, phases and directions.');
console.log('No unknown LP2 plaintext, author key or original-source byte-packing instruction recovered.');
