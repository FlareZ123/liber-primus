'use strict';

/**
 * Original terminal 256 ring -> source table codebook exact all-secret gate.
 *
 * Runs under Node22: execute this one file from any working directory.
 * No packages beyond built-in Node; no file writes.
 * Every possible stationary byte->rune function is included, and four
 * natural starting corners x clockwise/counterclockwise are enumerated
 * separately for each of the three 180-cell inner rings.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources', 'liber-primus', 'lp2-grid-256.json'), 'utf8'));
const source = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const bytes = grid.pages.flatMap(p => p.bytes);
assert.equal(bytes.length, 256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

/** @param {number} n @returns {number} */
const mod = n => ((n % 29) + 29) % 29;

/** @param {number} size @returns {number[]} */
function primes(size) {
  /** @type {number[]} */
  const out = [];
  for (let n = 2; out.length < size; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) {
        prime = false;
        break;
      }
    }
    if (prime) out.push(n);
  }
  return out;
}
const key = primes(84).map(p => mod(p - 1));
assert.equal(key.length, 84);
const p56 = source.pages.find(p => p.page === 56);
const p57 = source.pages.find(p => p.page === 57);
assert(p56 && p57);
assert.equal(p56.indices.length, 85);
assert.equal(p56.indices[56], 0);
assert.equal(p57.indices.length, 95);
let clock = 0;
const known56 = p56.indices.map((c, i) => i === 56 ? 0 : mod(c - key[clock++]));
assert.equal(clock, 84);
assert.equal(known56.map(i => source.translit[i]).join(''),
  'ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE');
clock = 0;
assert.deepEqual(known56.map((p, i) => i === 56 ? 0 : mod(p + key[clock++])),
  p56.indices);
const known = known56.concat(p57.indices);
assert.equal(known.length, 180);

/**
 * Clockwise ring coordinate positions starting at the top-left.
 * Source table is original 32x8 row-major; coordinates are in full grid.
 * @param {number} row
 * @param {number} col
 * @param {number} h
 * @param {number} w
 * @returns {number[]}
 */
function ring(row, col, h, w) {
  /** @type {number[]} */
  const out = [];
  for (let c = col; c < col + w; c++) out.push(8 * row + c);
  for (let r = row + 1; r < row + h; r++) out.push(8 * r + col + w - 1);
  for (let c = col + w - 2; c >= col; c--) out.push(8 * (row + h - 1) + c);
  for (let r = row + h - 2; r > row; r--) out.push(8 * r + col);
  assert.equal(out.length, 2 * (h + w) - 4);
  assert.equal(new Set(out).size, out.length);
  return out;
}

/** @param {number} row @param {number} col @param {number} h @param {number} w */
function ringPaths(row, col, h, w) {
  const base = ring(row, col, h, w);
  // Explicit corners on the clockwise base path.
  const starts = [0, w - 1, w + h - 2, 2 * w + h - 3];
  assert.equal(new Set(starts).size, 4);
  const paths = [1, -1].flatMap(direction => starts.map(start =>
    Array.from({ length: base.length }, (_, j) =>
      base[(start + direction * j + base.length * (j + 1)) % base.length])));
  assert.equal(new Set(paths.map(x => x.join(','))).size, 8);
  return paths;
}

const outer = ring(0, 0, 32, 8);
assert.equal(outer.length, 76);
const layers = [
  ringPaths(1, 1, 30, 6),
  ringPaths(2, 2, 28, 4),
  ringPaths(3, 3, 26, 2)
];
assert.deepEqual(layers.map(v => v[0].length), [68, 60, 52]);
const all255 = [...outer, ...layers.map(layer => layer[0]).flat()];
assert.equal(all255.length, 256);
assert.equal(new Set(all255).size, 256);

/**
 * A per-byte secret output function is more permissive than a bijection.
 * For each recurring byte, optimally select the observed plaintext rune
 * maximizing the number of fitted known positions. Requires no key fit.
 * @param {number[]} route
 * @param {number[]} plaintext
 * @param {'byte' | 'mod29' | 'quotient29'} projection
 */
function maxSecretLookup(route, plaintext, projection) {
  assert.equal(route.length, plaintext.length);
  /** @type {Map<number, Map<number, number>>} */
  const groups = new Map();
  for (let i = 0; i < route.length; i++) {
    const original = bytes[route[i]];
    const v = projection === 'byte' ? original
      : projection === 'mod29' ? original % 29 : Math.floor(original / 29);
    if (!groups.has(v)) groups.set(v, new Map());
    const c = groups.get(v);
    c.set(plaintext[i], (c.get(plaintext[i]) || 0) + 1);
  }
  let fitted = 0, conflicts = 0;
  for (const map of groups.values()) {
    fitted += Math.max(...map.values());
    if (map.size > 1) conflicts++;
  }
  return { fitted, conflicts, distinctSourceValues: groups.size };
}

// Synthetic secret stationary-byte decoder: model must recognize perfect
// source mapping in every orientation and all byte groups.
const positiveRoute = layers.map(layer => layer[0]).flat();
const sigma = value => mod(7 * value + 3);
const planted = positiveRoute.map(cell => sigma(bytes[cell]));
assert.deepEqual(maxSecretLookup(positiveRoute, planted, 'byte'), {
  fitted: 180, conflicts: 0, distinctSourceValues: 127
});

const cases = {};
for (const projection of ['byte', 'mod29', 'quotient29']) {
  /** @type {{route: number[], fitted: number, conflicts: number, distinctSourceValues: number}[]} */
  const tests = [];
  for (let a = 0; a < 8; a++) {
    for (let b = 0; b < 8; b++) {
      for (let c = 0; c < 8; c++) {
        const route = [...layers[0][a], ...layers[1][b], ...layers[2][c]];
        tests.push({ route: [a, b, c],
          ...maxSecretLookup(route, known, projection) });
      }
    }
  }
  assert.equal(tests.length, 512);
  tests.sort((a, b) => b.fitted - a.fitted || a.conflicts - b.conflicts);
  assert(tests.every(t => t.fitted < 180));
  cases[projection] = {
    strongest: tests[0],
    lowest: tests[511].fitted,
    tested: tests.length
  };
}
assert.equal(cases.byte.strongest.fitted, 137);
assert.equal(cases.mod29.strongest.fitted, 59);
assert.equal(cases.quotient29.strongest.fitted, 43);
console.log(JSON.stringify({
  source: 'original LP2 pp49-51 grid and solved p56/p57 rune sequences',
  tableCellCount: bytes.length,
  outerRing: outer.length,
  knownInnerRingSizes: [68, 60, 52],
  knownGP29: known.length,
  geometricRoutes: 512,
  cases,
  control: 'solved 85-rune p56 F-skip round trip and stationary byte-map planted 180/180',
  decision: 'No stationary table-byte, mod29-residue or integer-quotient lookup can reproduce the authentic inner 180 GP29 runes under any natural independent corner/direction choices.'
}, null, 2));
