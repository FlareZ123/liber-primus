'use strict';

/**
 * Read-only, source-exact original-input SFT: p8 4|256 framing versus
 * the later 32x8 numerical grid. Node.js 22, CommonJS, Windows 11.
 *
 * The one frozen consumer: row-major 256 numeric byte values reduced
 * modulo29, used as additive GP29 key on the original 256-rune frame.
 * Both ordinary inverse signs are reported and roundtripped. No fitted
 * offsets, table edits, row resets, transpositions, or English scoring.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = path.join(__dirname, '..', 'resources', 'liber-primus');
/** @param {string} file @returns {any} */
function json(file) {
  return JSON.parse(fs.readFileSync(path.join(source, file), 'utf8'));
}
const corpus = json('lp2-corpus.json');
const ink = json('lp2-ink-annotations.json');
const grid = json('lp2-grid-256.json');
const printed = fs.readFileSync(
  path.join(source, 'lp2-transcription.txt'), 'utf8'
).replace(/\r\n/g, '\n');
const p8 = corpus.pages.find((p) => p.page === 8);
const p9 = corpus.pages.find((p) => p.page === 9);
const red = ink.pages.find((p) => p.page === 8).red_spans;
assert.deepEqual(red.map((s) => [s.start, s.length]), [[0, 12]]);
assert.equal(p8.indices.length, 255);
assert.equal(p9.indices.length, 268);
assert.equal(p8.indices.at(-1), 12);
assert.ok(printed.includes('ᛇ/\n%\nᚣᚹᚫᚷᛄ-'),
  'p8/p9 original boundary is within one six-rune word');
assert.deepEqual(p8.indices.slice(0, 4), [14, 10, 14, 19]);

const frame = [...p8.indices.slice(4), ...p9.indices.slice(0, 5)];
assert.equal(frame.length, 256, 'First four red p8 runes, then exactly 256 through complete carry');
assert.deepEqual(frame.slice(0, 8), [1, 14, 19, 5, 2, 13, 3, 17]);
assert.deepEqual(frame.slice(-6), [12, 26, 7, 25, 6, 11]);
assert.equal(frame.slice(8).length, 248, 'All black p8 plus true five-rune p9 word tail');

assert.equal(grid.shape, '32 rows by 8 columns across LP2 pages 49, 50, 51');
assert.deepEqual(grid.pages.map((p) => [p.rows, p.cols]), [
  [10, 8], [13, 8], [9, 8]
]);
assert.equal(grid.bytes.length, 256);
assert.equal(grid.pages.flatMap((p) => p.tokens).length, 256);
assert.ok(grid.bytes.every((b) => Number.isInteger(b) && b >= 0 && b <= 255));

/** @param {number[]} values @returns {number} */
function coincidence(values) {
  const counts = Array.from({ length: 29 }, (_, v) =>
    values.filter((n) => n === v).length);
  return counts.reduce((t, n) => t + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

/** @param {number} n @returns {number} */
const gp29 = (n) => ((n % 29) + 29) % 29;
for (const sign of [-1, 1]) {
  const plaintext = frame.map((n, i) => gp29(n + sign * grid.bytes[i]));
  const replay = plaintext.map((n, i) =>
    gp29(n - sign * grid.bytes[i]));
  assert.deepEqual(replay, frame, 'Exact 256/256 original GP29 replay');
  const unknownPlain = plaintext.slice(8);
  const ioc = coincidence(unknownPlain);
  assert.ok(ioc < 0.045,
    'Frozen direct key yields original nonprose unigram distribution');
  const initial = unknownPlain.slice(0, 120).map((n) =>
    corpus.translit[n]).join('');
  console.log('PAD_SIGN', sign,
    'ORIGINAL_UNKNOWN_RUNES', unknownPlain.length,
    'IOC', ioc.toFixed(11),
    'PREVIEW120', initial);
}
// Second, materially different typed consumer: interpret each authentic
// byte as a literal address 0..255 into the exactly corresponding p8
// original 256-rune frame. This is a readout and need not be invertible.
const indexReadout = grid.bytes.map((index) => frame[index]);
const distinctPositions = new Set(grid.bytes).size;
assert.equal(distinctPositions, 161);
assert.equal(indexReadout.length, 256);
const lookupIoc = coincidence(indexReadout);
assert.ok(Math.abs(lookupIoc - 0.03946078431372549) < 1e-12);
console.log('DIRECT_ADDRESS_READOUT',
  'SOURCE_POSITIONS', distinctPositions,
  'REPEATED_ADDRESS_EVENTS', 256 - distinctPositions,
  'IOC', lookupIoc.toFixed(11),
  'PREVIEW120', indexReadout.slice(0, 120).map((n) => corpus.translit[n]).join(''));
// All-secret stationary codebook invariant. If the p50 byte at index i
// is an input to ANY deterministic secret byte-to-GP29 mapping, repeated
// source byte values must always produce the same p8 GP rune. This test
// is over original 248 black/carried receiver positions only (no rubric).
const classes = new Map();
for (let position = 8; position < frame.length; position += 1) {
  const key = grid.bytes[position];
  const observed = frame[position];
  if (!classes.has(key)) {
    classes.set(key, { values: new Set(), count: 0 });
  }
  const group = classes.get(key);
  group.values.add(observed);
  group.count += 1;
}
const groups = Array.from(classes.values());
const conflictingClasses = groups.filter((g) => g.values.size > 1);
const repeatOccurrences = 248 - classes.size;
const affectedOccurrences = conflictingClasses.reduce((sum, g) =>
  sum + g.count, 0);
assert.equal(classes.size, 157);
assert.equal(repeatOccurrences, 91);
assert.equal(conflictingClasses.length, 65);
assert.equal(affectedOccurrences, 156);
console.log('NO_ALL_SECRET_STATIONARY_BYTE_TO_RUNE_MAP',
  'INPUT_CLASSES', classes.size,
  'REPEAT_EVENTS', repeatOccurrences,
  'CONFLICTING_CLASSES', conflictingClasses.length,
  'CONFLICTED_ORIGINAL_SLOTS', affectedOccurrences);
// Independent, fully source-frozen p8-only candidate: the first complete
// 4-rune red heading as a row-major 2x2 invertible Hill matrix over GP29,
// acting on the following complete 256-rune frame in adjacent pairs.
const [a, b, c, d] = p8.indices.slice(0, 4);
const determinant = gp29(a * d - b * c);
const determinantInverse = Array.from({ length: 28 }, (_, index) => index + 1)
  .find((value) => gp29(value * determinant) === 1);
assert.equal(determinant, 10);
assert.equal(determinantInverse, 3);
const hillInverse = [
  [gp29(d * determinantInverse), gp29(-b * determinantInverse)],
  [gp29(-c * determinantInverse), gp29(a * determinantInverse)]
];
assert.deepEqual(hillInverse, [[28, 28], [16, 13]]);
const hillOutput = [];
for (let i = 0; i < frame.length; i += 2) {
  const left = frame[i];
  const right = frame[i + 1];
  const p0 = gp29(hillInverse[0][0] * left +
    hillInverse[0][1] * right);
  const p1 = gp29(hillInverse[1][0] * left +
    hillInverse[1][1] * right);
  hillOutput.push(p0, p1);
  assert.equal(gp29(a * p0 + b * p1), left);
  assert.equal(gp29(c * p0 + d * p1), right);
}
assert.equal(hillOutput.length, 256);
const hillIoc = coincidence(hillOutput.slice(8));
assert.ok(Math.abs(hillIoc - 0.03604544860911584) < 1e-12);
console.log('FOUR_RED_GP_RUNES_2X2_HILL_INVERSE',
  'DET', determinant, 'INV_MATRIX', JSON.stringify(hillInverse),
  'ORIGINAL_UNKNOWN_248_IOC', hillIoc.toFixed(11),
  'HEADING_RED8', hillOutput.slice(0, 8).map((n) =>
    corpus.translit[n]).join(''),
  'BODY120', hillOutput.slice(8, 128).map((n) =>
    corpus.translit[n]).join(''));
console.log('P8_WHOLE_PRINTED_4PLUS256_SOURCE_FRAME', frame.length);
console.log('P50_TABLE_SHAPE', grid.shape);
console.log('PASS: exact original frame and negative fixed row-major byte-mod29 pad gate');
