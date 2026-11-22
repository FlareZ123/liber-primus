'use strict';

/**
 * Agent 27 / Director #2218: source-original mixed 64x51 checksum gate.
 * Read-only Windows 11 / Node 22 CommonJS SFT. This tests a hypothesis,
 * not an authenticated LP2 cipher or a recovered unknown plaintext.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..', 'resources', 'liber-primus');
/** @param {string} name @returns {any} */
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const gp = read('lp2-corpus.json'), grid = read('base60-grid.json');
const ink = read('lp2-ink-annotations.json');
const chapter = gp.pages.filter((p) => p.page >= 40 && p.page <= 53);
const original = chapter.flatMap((p) => p.indices);
const tableStart = chapter.filter((p) => p.page < 50)
  .reduce((sum, p) => sum + p.indices.length, 0);
const p40Red = ink.pages.find((p) => p.page === 40).red_spans[0];
const p53Red = ink.pages.find((p) => p.page === 53).red_spans[0];
assert.equal(original.length, 3008);
assert.equal(tableStart, 2474);
assert.deepEqual([p40Red.start, p40Red.length], [0, 8]);
assert.deepEqual([p53Red.start, p53Red.length], [128, 51]);
assert.deepEqual(original.slice(0, 8), [0, 9, 19, 26, 6, 23, 25, 8]);
const footer = original.slice(-51);
const body = original.slice(0, -51);
assert.equal(body.length, 2957);
assert.equal(p53Red.runes, footer.map((v) => gp.runes[v]).join(''));
const bytes = grid.byte_rows.flat();
assert.equal(bytes.length, 256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const alphabet59 = grid.alphabet.replace('f', '');
assert.equal(alphabet59.length, 59);
assert(grid.rows.flat().every((token) => !token.includes('f')));

/** @param {number} base @returns {number[]} */
function digits(base) {
  if (base === 60) return bytes;
  assert.equal(base, 59);
  return grid.rows.flat().map((token) =>
    59 * alphabet59.indexOf(token[0]) + alphabet59.indexOf(token[1]));
}
/** @param {number[]} values @returns {number[]} */
function columns(values) {
  assert.equal(values.length, 63 * 51);
  return Array.from({length: 51}, (_, c) => {
    let sum = 0;
    for (let r = 0; r < 63; r++) sum += values[r * 51 + c];
    return sum % 29;
  });
}
/**
 * Minimum mismatches even granting any shared unknown deterministic
 * rune substitution of the 29 checksum residues.
 * @param {number[]} input
 * @param {number[]} output
 * @returns {{classes: number, conflicts: number, minimumErrors: number}}
 */
function consistency(input, output) {
  /** @type {Map<number, Map<number, number>>} */
  const groups = new Map();
  for (let i = 0; i < input.length; i++) {
    if (!groups.has(input[i])) groups.set(input[i], new Map());
    const h = groups.get(input[i]);
    h.set(output[i], (h.get(output[i]) || 0) + 1);
  }
  let minimumErrors = 0, conflicts = 0;
  for (const h of groups.values()) {
    if (h.size > 1) conflicts++;
    minimumErrors += [...h.values()].reduce((a, b) => a + b, 0)
      - Math.max(...h.values());
  }
  return {classes: groups.size, conflicts, minimumErrors};
}
/** @param {number[]} x @param {number[]} y @returns {number} */
const matches = (x, y) => x.filter((v, i) => v === y[i]).length;
let randomState = 0x62c92b4b;
/** @returns {number} */
function rand() {
  randomState ^= randomState << 13;
  randomState ^= randomState >>> 17;
  randomState ^= randomState << 5;
  return (randomState >>> 0) / 4294967296;
}
const trials = 50000, output = [];
for (const base of [60, 59]) {
  const inserted = digits(base);
  assert(inserted.every((v) => Number.isInteger(v) && v >= 0 && v <= 255));
  const mixed = body.slice(0, tableStart).concat(inserted, body.slice(tableStart));
  assert.equal(mixed.length, 3213);
  const sums = columns(mixed), direct = matches(sums, footer);
  const complement = matches(sums.map((v) => (29 - v) % 29), footer);
  const invariant = consistency(sums, footer);
  assert.deepEqual([direct, complement, invariant.classes,
    invariant.conflicts, invariant.minimumErrors],
    base === 60 ? [1, 1, 26, 16, 25] : [5, 2, 24, 15, 24]);
  // A planted invertible checksum alphabet must pass every column.
  const planted = sums.map((v) => (13 * v + 31) % 29);
  assert.equal(consistency(sums, planted).minimumErrors, 0);
  assert(planted.every((v, i) => 9 * (v - 31 + 58) % 29 === sums[i]));

  // Shuffling only the authentic 51-rune trailer retains its exact rune
  // inventory. One fixed seed per radix, no selected key or source tuning.
  randomState = 0x62c92b4b ^ base;
  let nullAtLeastObserved = 0;
  for (let trial = 0; trial < trials; trial++) {
    const shuffled = footer.slice();
    for (let j = 50; j > 0; j--) {
      const k = Math.floor(rand() * (j + 1));
      [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
    }
    if (matches(sums, shuffled) >= direct) nullAtLeastObserved++;
  }
  output.push({base, originalRunes: original.length, tableCells: inserted.length,
    originalBodyRunes: body.length, mixedData: mixed.length,
    matrixShape: [64, 51], printedTrailer: footer.length,
    checksumFirst8: sums.slice(0, 8), direct, complement, ...invariant,
    nullTrials: trials, nullAtLeastObserved,
    nullTailRate: nullAtLeastObserved / trials});
}
console.log(JSON.stringify(output, null, 2));
console.log('PASS: original source, two typed radices, planted 51-column inverse, and exact negative consistency constraints');
