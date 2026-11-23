'use strict';

/**
 * Original-input SFT for Director #2375. A p8 four-rune preamble selects
 * circular rotations of the four actual concentric rings of the p49-p51
 * 32x8 numeral panel. Apply the rotated original byte residues as a
 * reversible GP29 additive pad to the p8/p9 256-rune word-complete frame.
 *
 * 2014-visible premises are p57's "shed circumferences", the four-ring
 * 32x8 geometry, the p8 heading's four rune indices and p8/p9's exact
 * four-plus-256 frame. The correspondence and rotation opcode are
 * hypotheses, not authenticated instructions from Cicada.
 *
 * Node.js 22, CommonJS, read-only, Windows compatible.
 * Usage: node sims/lp2_p8_red4_fourring_p50_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', 'resources', 'liber-primus');
/** @param {string} filename @returns {any} */
const load = (filename) => JSON.parse(fs.readFileSync(
  path.join(root, filename), 'utf8'));

const corpus = load('lp2-corpus.json');
const grid = load('lp2-grid-256.json');
const ink = load('lp2-ink-annotations.json');
const p8 = corpus.pages.find((page) => page.page === 8);
const p9 = corpus.pages.find((page) => page.page === 9);
const p57 = corpus.pages.find((page) => page.page === 57);
const preamble = p8.indices.slice(0, 4);
const frame = [...p8.indices.slice(4), ...p9.indices.slice(0, 5)];
const bytes = grid.bytes;
assert.deepEqual(preamble, [14, 10, 14, 19]);
assert.deepEqual(ink.pages.find((p) => p.page === 8)
  .red_spans.map((s) => [s.start, s.length]), [[0, 12]]);
assert.deepEqual(frame.slice(0, 8), [1, 14, 19, 5, 2, 13, 3, 17]);
assert.deepEqual(frame.slice(-6), [12, 26, 7, 25, 6, 11]);
assert.deepEqual([p8.indices.length, p9.indices.length,
  frame.length, bytes.length], [255, 268, 256, 256]);
assert.deepEqual(grid.pages.map((p) => p.rows), [10, 13, 9]);
const mod29 = (value) => ((value % 29) + 29) % 29;

/** @param {number} depth @returns {number[]} */
function ring(depth) {
  const cell = [];
  for (let x = depth; x < 8 - depth; x++) cell.push(depth * 8 + x);
  for (let y = depth + 1; y < 32 - depth; y++)
    cell.push(y * 8 + (7 - depth));
  for (let x = 6 - depth; x >= depth; x--)
    cell.push((31 - depth) * 8 + x);
  for (let y = 30 - depth; y > depth; y--)
    cell.push(y * 8 + depth);
  return cell;
}
const rings = [0, 1, 2, 3].map(ring);
assert.deepEqual(rings.map((r) => r.length), [76, 68, 60, 52]);
assert.equal(new Set(rings.flat()).size, 256);

// Global congruences can look stronger than a cipher selector. Both
// literal historical candidate readings give original GP29 residues that
// happen to match the p8 red word. Test the natural local implications on
// four concentric perimeters and eight printed columns without fitting.
const tokens = grid.pages.flatMap((p) => p.tokens);
const alphabet59 =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx'
    .replace('f', '');
assert.equal(tokens.length, 256);
assert.equal(alphabet59.length, 59);
const bytes59 = tokens.map((pair) =>
  59 * alphabet59.indexOf(pair[0]) + alphabet59.indexOf(pair[1]));
assert(bytes59.every((v) => v >= 0 && v < 256));
/** @param {number[]} values @returns {number} */
const sum = (values) => values.reduce((acc, x) => acc + x, 0);
/** @param {number[]} values @param {number[]} positions @returns {number} */
const subChecksum = (values, positions) =>
  mod29(sum(positions.map((idx) => values[idx])));
const cols = Array.from({length:8}, (_, x) =>
  Array.from({length:32}, (_, y) => 8 * y + x));
const checksum = {
  base60Sum: sum(bytes),
  base59Sum: sum(bytes59),
  base60Residue: mod29(sum(bytes)),
  base59Residue: mod29(sum(bytes59)),
  radixDifferenceResidue: mod29(sum(bytes) - sum(bytes59)),
  red4OrdinalProduct: mod29(preamble.reduce((a, b) => a * b, 1)),
  redWord2: frame.slice(0, 8),
  ringSum60: rings.map((indices) => subChecksum(bytes, indices)),
  ringSum59: rings.map((indices) => subChecksum(bytes59, indices)),
  columnSum60: cols.map((indices) => subChecksum(bytes, indices)),
  columnSum59: cols.map((indices) => subChecksum(bytes59, indices))
};
assert.deepEqual(
  [checksum.base60Sum, checksum.base59Sum, checksum.base60Residue,
    checksum.base59Residue, checksum.radixDifferenceResidue,
    checksum.red4OrdinalProduct],
  [33006, 32499, 4, 19, 14, 4]);
assert.deepEqual(checksum.ringSum60, [2,17,9,5]);
assert.deepEqual(checksum.ringSum59, [14,16,20,27]);
assert.deepEqual(checksum.columnSum60, [2,7,3,1,11,5,12,21]);
assert.deepEqual(checksum.columnSum59, [17,20,2,1,3,11,2,21]);
assert(checksum.ringSum60.every((v,i) => v !== preamble[i]));
assert(checksum.columnSum60.every((v,i) => v !== frame[i]));
assert(checksum.columnSum59.every((v,i) => v !== frame[i]));

/**
 * Rotate table values *within* each clockwise ring by the
 * corresponding actual GP0 preamble index, leaving cell locations fixed.
 * Winding choices +1/-1 exhaust the two obvious ring directions.
 * @param {-1|1} winding
 * @returns {number[]}
 */
function ringKey(winding) {
  const key = Array(256);
  for (let depth = 0; depth < 4; depth++) {
    const positions = rings[depth];
    const length = positions.length;
    const shift = preamble[depth];
    for (let slot = 0; slot < length; slot++) {
      const target = positions[slot];
      const source = positions[(slot + winding * shift + length) % length];
      key[target] = bytes[source] % 29;
    }
  }
  assert(key.every((n) => Number.isInteger(n) && n >= 0 && n < 29));
  return key;
}

/** @param {number[]} numbers @returns {number} */
function ioc(numbers) {
  const freq = Array(29).fill(0);
  for (const symbol of numbers) freq[symbol]++;
  return freq.reduce((sum, count) =>
    sum + count * (count - 1), 0) /
    (numbers.length * (numbers.length - 1));
}
/** @param {number[]} symbols @returns {string} */
const translit = (symbols) => symbols.map((s) => corpus.translit[s]).join('');
/** @param {number[]} cipher @param {number[]} pad @param {-1|1} sign */
const decode = (cipher, pad, sign) =>
  cipher.map((symbol, i) => mod29(symbol + sign * pad[i]));
/** @param {number[]} plain @param {number[]} pad @param {-1|1} sign */
const encode = (plain, pad, sign) =>
  plain.map((symbol, i) => mod29(symbol - sign * pad[i]));

// Authentic solved, unencrypted 2014 GP29 source-native control. Repeated
// only to fill the same 256-symbol frame, never fitted to the ciphertext.
const native = Array.from({ length: 256 }, (_, i) =>
  p57.indices[i % p57.indices.length]);
assert.equal(p57.indices.length, 95);
const expectedIocs = new Map([
  ['-1:-1', 0.03630664751208045],
  ['-1:1', 0.03467415436855165],
  ['1:-1', 0.033596708893822644],
  ['1:1', 0.03346610944234034]
]);
const outputs = [];
for (const winding of [-1, 1]) {
  const pad = ringKey(winding);
  for (const sign of [-1, 1]) {
    const candidate = decode(frame, pad, sign);
    assert.deepEqual(encode(candidate, pad, sign), frame);
    const encryptedPlant = encode(native, pad, sign);
    assert.deepEqual(decode(encryptedPlant, pad, sign), native);
    const body = candidate.slice(8);
    const observedIoc = ioc(body);
    assert(Math.abs(observedIoc -
      expectedIocs.get(winding + ':' + sign)) < 1e-12);
    outputs.push({
      winding, sign, bodyIoc: observedIoc,
      candidateBody120: translit(body.slice(0, 120)),
      originalCipherExactReplay: true,
      authenticSolvedNativePlantExactRecovery: true
    });
  }
}
// A wrong rule must not spuriously act as the identical inverse on the
// exact original-shaped solved-native positive plant.
const planted = encode(native, ringKey(1), -1);
const wrongRecovered = decode(planted, ringKey(-1), -1);
const wrongSymbols = wrongRecovered.filter((symbol, i) =>
  symbol !== native[i]).length;
assert(wrongSymbols > 0);
console.log(JSON.stringify({
  source: {
    originalFrame: 'p8 red runes after first word through p9 carried word',
    preambleGP0: preamble,
    fullFrameRunes: frame.length,
    blackAndCarryRunes: 248,
    panelRows: 32,
    panelColumns: 8,
    rings: rings.map((r) => r.length),
    checksumLocalNegative: checksum,
    genuineSolvedP57Ioc: ioc(p57.indices)
  },
  experiment: {
    conditionalRule: 'clockwise nested ring byte rotations by the four red rune indices, GP29 additive inverse',
    originalBlackBodyIoc: ioc(frame.slice(8)),
    models: outputs,
    wrongOrientationPlantSymbolsChanged: wrongSymbols,
    sourceAuthenticatesFullOpcode: false,
    newUnknownPlaintextRecovered: false
  }
}, null, 2));
