'use strict';

/**
 * Original LP2 32x8 numerical-table Hilbert-tile receiver.
 * Four classical 8x8 Hilbert curves cover the table in its printed layout.
 * Each square's start/end are on its top/bottom edge, so adjacent squares
 * join by a single orthogonal step. No rectangular reflow or missing cells.
 *
 * The original puzzle does not command Hilbert travel or a GP29 pad.
 * This tests the simplest literal table-key inverse without fitting phases.
 * Standalone: node sims/lp2_p50_hilbert8x4_original_receiver_sft.cjs
 * Windows 11 / Node.js 22; built-in modules only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
/** @param {string} relative @returns {any} */
function readJson(relative) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
}
const grid = readJson('resources/liber-primus/lp2-grid-256.json');
const corpus = readJson('resources/liber-primus/lp2-corpus.json');
const table = grid.bytes;
assert.equal(table.length, 256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(table))
  .digest('hex'),
'3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
assert.deepEqual(table.slice(0, 8), [203, 231, 167, 186, 97, 237, 126, 183]);

/**
 * Standard order-three Hilbert d->(x,y) mapping in an 8x8 square,
 * rotated through coordinate exchange so endpoints go from row 0 to row 7.
 * This is the classical square algorithm, not a later rectangular extension.
 * @param {number} d integer 0..63
 * @returns {[number,number]} [column,row]
 */
function hilbertTile(d) {
  assert(Number.isInteger(d) && d >= 0 && d < 64);
  let x = 0, y = 0, t = d;
  for (let side = 1; side < 8; side *= 2) {
    const rx = 1 & Math.floor(t / 2);
    const ry = 1 & (t ^ rx);
    if (ry === 0) {
      if (rx === 1) {
        x = side - 1 - x;
        y = side - 1 - y;
      }
      [x, y] = [y, x];
    }
    x += side * rx;
    y += side * ry;
    t = Math.floor(t / 4);
  }
  return [y, x];
}

/** @returns {Array<[number,number]>} */
function basePath() {
  const points = [];
  for (let tile = 0; tile < 4; tile++) {
    for (let ordinal = 0; ordinal < 64; ordinal++) {
      const [x, y] = hilbertTile(ordinal);
      points.push([x, 8 * tile + y]);
    }
  }
  return points;
}

/**
 * Prove complete source geometry: 256 unique source cells, strictly
 * orthogonal single-cell moves, and both endpoints at the table edge.
 * @param {Array<[number,number]>} points
 */
function checkPath(points) {
  assert.equal(points.length, 256);
  assert.equal(new Set(points.map(([x, y]) => {
    assert(Number.isInteger(x) && x >= 0 && x < 8);
    assert(Number.isInteger(y) && y >= 0 && y < 32);
    return 8 * y + x;
  })).size, 256);
  for (let i = 1; i < points.length; i++) {
    const [x, y] = points[i];
    const [a, b] = points[i - 1];
    assert.equal(Math.abs(x - a) + Math.abs(y - b), 1);
  }
}

const base = basePath();
checkPath(base);
assert.deepEqual(base[0], [0, 0]);
assert.deepEqual(base[255], [0, 31]);
assert.deepEqual(base.slice(0, 10).map(([x, y]) => table[8 * y + x]),
  [203, 231, 249, 92, 121, 109, 198, 202, 15, 173]);

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const frequency = Array(29).fill(0);
  for (const symbol of values) {
    assert(Number.isInteger(symbol) && symbol >= 0 && symbol < 29);
    frequency[symbol]++;
  }
  const n = values.length;
  return frequency.reduce((sum, count) => sum + count * (count - 1), 0) /
    (n * (n - 1));
}

/**
 * A literal byte-to-GP29 additive receiver. The original table addresses
 * are consumed continuously through every rune in the printed floral
 * chapter. The runeless physical p50 consumes no byte.
 * @param {number[]} input
 * @param {number[]} key
 * @param {1|-1} sign
 * @returns {number[]}
 */
function transform(input, key, sign) {
  return input.map((cipher, i) =>
    ((cipher + sign * (key[i % 256] % 29)) % 29 + 29) % 29);
}

const source = corpus.pages.slice(40, 56);
assert.deepEqual(source.map(page => page.runic_count),
  [231,273,272,274,273,270,270,274,271,66,0,92,263,179,232,76]);
const original = source.flatMap(page => page.indices);
assert.equal(original.length, 3316);
assert.equal(source[10].indices.length, 0);
const native95 = corpus.pages[57].indices;
assert.equal(native95.length, 95);
const nativePlant = Array.from({length: original.length},
  (_, i) => native95[i % native95.length]);
assert(ioc(nativePlant) > 0.05);

// Horizontal/vertical reflection and read-direction cover the native
// table's unambiguous geometric symmetries. Some labels are duplicates;
// deduplicate by their complete 256-byte stream before cryptanalysis.
const candidates = new Map();
for (const flipX of [false, true]) {
  for (const flipY of [false, true]) {
    for (const backwards of [false, true]) {
      const locations = base.map(([x, y]) =>
        [flipX ? 7 - x : x, flipY ? 31 - y : y]);
      if (backwards) locations.reverse();
      checkPath(locations);
      const bytes = locations.map(([x, y]) => table[8 * y + x]);
      const id = Buffer.from(bytes).toString('hex');
      if (!candidates.has(id)) {
        candidates.set(id, {
          name: 'flipX=' + Number(flipX) + ',flipY=' +
            Number(flipY) + ',reverse=' + Number(backwards),
          key: bytes
        });
      }
    }
  }
}
assert.equal(candidates.size, 4);
const results = [];

for (const candidate of candidates.values()) {
  const key = candidate.key;
  for (const sign of [-1, 1]) {
    const plain = transform(original, key, sign);
    assert.deepEqual(transform(plain, key, -sign), original);
    // Exact known-language positive with the same original source key,
    // while all genuine original ciphertext symbols remain unchanged.
    const encryptedPlant = transform(nativePlant, key, -sign);
    assert.deepEqual(transform(encryptedPlant, key, sign), nativePlant);
    const first = plain.slice(0, 3008);
    const last = plain.slice(3008);
    assert.equal(first.length, 3008);
    assert.equal(last.length, 308);
    const output = {
      path: candidate.name,
      sign,
      body40to53IoC: ioc(first),
      terminal54to55IoC: ioc(last),
      completeFloralIoC: ioc(plain),
      p49LocalIoC: ioc(transform(corpus.pages[49].indices, key, sign)),
      p51LocalIoC: ioc(transform(corpus.pages[51].indices, key, sign)),
      first32Runes: plain.slice(0, 32).map(v => corpus.translit[v]).join('.')
    };
    results.push(output);
    assert(output.completeFloralIoC < 0.045,
      'An original candidate is more concentrated than the fixed rejection gate');
  }
}
assert.equal(results.length, 8);
const max = Math.max(...results.map(v => v.completeFloralIoC));
const min = Math.min(...results.map(v => v.completeFloralIoC));
assert(max < 0.035 && min > 0.034);
console.log(JSON.stringify({
  originalSource: 'LP2 physical p49–51 original numeral grid; original floral pp40–55',
  sourceByteSHA256: crypto.createHash('sha256').update(Buffer.from(table)).digest('hex'),
  sourceTable: '32 printed rows x 8 cells',
  historicalRoute: 'Four stacked classical order-three 8x8 Hilbert paths, all native geometric reflections',
  tableKeys: candidates.size,
  testedOriginalInverses: results.length,
  fullRunes: original.length,
  runeFreePhysicalPage: 50,
  originalFirstCohort: 3008,
  originalHeldOutLastTwoPages: 308,
  solvedNativePositiveIoC: ioc(nativePlant),
  originalIoCRange: [min, max],
  tests: results,
  decision: 'Eight complete source-key inverses remain GP29-uniform; no plaintext or source-authored Hilbert instruction recovered.'
}, null, 2));
