'use strict';

/**
 * Original LP2 30-mark fixed-width short-code source gate.
 *
 * Windows 11: node sims/lp2_dot30_historical_shortcodes_sft.cjs
 * Reads canonical manuscript registers, writes no files.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
/** @template T @param {string} rel @returns {T} */
function source(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
}
const ink = source('resources/liber-primus/lp2-ink-annotations.json');
const gp = source('resources/liber-primus/lp2-corpus.json');
const table = source('resources/liber-primus/lp2-grid-256.json');

const events = ink.pages
  .filter((page) => page.page <= 55)
  .flatMap((page) => (page.large_punctuation || [])
    .filter((mark) => mark[2] === 'red' && (mark[1] === 10 || mark[1] === 13))
    .map((mark) => ({ page: page.page, offset: mark[0], dots: mark[1] })))
  .sort((a, b) => a.page - b.page || a.offset - b.offset);

assert.equal(ink.counts.red13, 30);
assert.equal(ink.counts.red10, 4);
assert.equal(ink.counts.black13, 1);
assert.equal(ink.counts.red23, 1);
assert.equal(gp.runes.length, 29);
assert.equal(table.alphabet.length, 60);
assert.equal(events.length, 30);

const bits = events.map(({ dots }) => dots === 13 ? '1' : '0').join('');
const SOURCE_BITS = '111111111111111111111001110111';
assert.equal(bits, SOURCE_BITS);
const zeros = events.flatMap((event, i) => event.dots === 10
  ? [{ ordinal: i + 1, page: event.page, offset: event.offset }] : []);
assert.deepEqual(zeros, [
  { ordinal: 22, page: 36, offset: 99 },
  { ordinal: 23, page: 38, offset: 186 },
  { ordinal: 27, page: 49, offset: 66 }
]);

/** @param {string} stream @param {number} width @returns {number[]} */
function unpack(stream, width) {
  assert.equal(stream.length % width, 0);
  const groups = [];
  for (let i = 0; i < stream.length; i += width) {
    groups.push(Number.parseInt(stream.slice(i, i + width), 2));
  }
  return groups;
}
/** @param {number[]} values @param {number} width @returns {string} */
function pack(values, width) {
  return values.map((v) => {
    assert(Number.isInteger(v) && v >= 0 && v < 2 ** width);
    return v.toString(2).padStart(width, '0');
  }).join('');
}

const five = unpack(bits, 5);
const six = unpack(bits, 6);
assert.deepEqual(five, [31, 31, 31, 31, 19, 23]);
assert.deepEqual(six, [63, 63, 63, 57, 55]);
assert.equal(five.filter((x) => x < 29).length, 2);
assert.equal(six.filter((x) => x < 60).length, 2);

// All-reordering necessary condition: every legal five-bit GP rune (0..28)
// has at least one zero bit; every legal six-bit source base-60 digit (0..59)
// likewise has at least one zero bit. Three source zeros cannot populate
// six/five disjoint groups, regardless of order, bit-endianness, or phase.
const zeroCount = [...bits].filter((v) => v === '0').length;
assert.equal(zeroCount, 3);
assert(zeroCount < 6);
assert(zeroCount < 5);

const inverse = [...bits].map((v) => v === '1' ? '0' : '1').join('');
const fiveReversedPolarity = unpack(inverse, 5);
const sixReversedPolarity = unpack(inverse, 6);
assert.deepEqual(fiveReversedPolarity, [0, 0, 0, 0, 12, 8]);
assert.deepEqual(sixReversedPolarity, [0, 0, 0, 6, 8]);
const invertedGp = fiveReversedPolarity.map((v) => gp.translit[v]).join('');
const invertedBase60 = sixReversedPolarity.map((v) => table.alphabet[v]).join('');
assert.equal(invertedGp, 'FFFFEOH');
assert.equal(invertedBase60, '00068');

// Positive controls, independent of LP2 unknown output. The p57 first six
// known clear source runes are fully representable as six 5-bit GP ordinals.
const knownClear = gp.pages.find((page) => page.page === 57);
assert(knownClear);
const gpControl = knownClear.indices.slice(0, 6);
assert.equal(gpControl.map((v) => gp.translit[v]).join(''), 'PARABL');
assert.deepEqual(unpack(pack(gpControl, 5), 5), gpControl);
const base60Control = [0, 10, 24, 36, 59];
assert.deepEqual(unpack(pack(base60Control, 6), 6), base60Control);

// MIME/PGP Base64, used by Cicada era signatures, is a *different* codebook
// from p50's 60 digits. The 30-bit stream yields five sextets, which cannot
// be one complete RFC4648 Base64 encoding: a five-character length mod 4=1.
const b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const base64Observed = six.map((v) => b64[v]).join('');
const base64Inverse = sixReversedPolarity.map((v) => b64[v]).join('');
assert.equal(base64Observed, '///53');
assert.equal(base64Inverse, 'AAAGI');
assert.equal(base64Observed.length % 4, 1);
assert.equal(Buffer.from('3301', 'utf8').toString('base64'), 'MzMwMQ==');
assert.equal(Buffer.from('MzMwMQ==', 'base64').toString('utf8'), '3301');

// Matched wrong-marker control: replacing one real 10-dot event with 13 dots
// leaves only two zeros, so the all-order capacity obstruction survives.
const wrongMarker = bits.slice(0, 21) + '1' + bits.slice(22);
assert.equal([...wrongMarker].filter((v) => v === '0').length, 2);

console.log(JSON.stringify({
  source: 'canonical ink p0..55, red 10/13-dot only; black and p56/57 excluded',
  sourceBits: bits,
  zeros,
  directGP29_5bit: { values: five, legal: false },
  directBase60_6bit: { values: six, legal: false },
  anyOrderObstruction: {
    sourceZeros: zeroCount,
    gp29MinimumZerosNeeded: 6,
    base60MinimumZerosNeeded: 5
  },
  invertedPolarityNotAuthorSelected: {
    GP29: invertedGp, base60: invertedBase60
  },
  MIME_PGP_Base64NotStandalone: {
    direct: base64Observed, inverted: base64Inverse, lengthMod4: 1
  },
  plantedControls: { solvedP57FirstSix: 'PARABL', sourceBase60: base60Control, base64: 'MzMwMQ==' },
  result: 'No source-selected complete short-code plaintext or key identified'
}, null, 2));
