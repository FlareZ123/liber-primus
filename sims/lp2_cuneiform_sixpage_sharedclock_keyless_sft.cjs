'use strict';

/**
 * Source-selected, key-independent LP2 pp34–39 repeated-header test.
 *
 * The top 600 RGB raster rows of each original JPEG 51.jpg ... 56.jpg are
 * byte-identical. If one identical header reset the same position-indexed
 * bijective GP29 cipher table on each page, equality at any shared position
 * is invariant under every one of its secret 29! positionwise permutations.
 *
 * Run: node sims/lp2_cuneiform_sixpage_sharedclock_keyless_sft.cjs
 * Read-only; Node 22 CommonJS; existing repository source-only dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');

/** @param {string} name @returns {string} */
function read(name) {
  return fs.readFileSync(path.join(ROOT, name), 'utf8');
}

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pageIds = [34, 35, 36, 37, 38, 39];
const originals = pageIds.map((page) => corpus.pages[page].indices);
const lengths = originals.map((p) => p.length);
const expectedLengths = [261, 271, 238, 228, 228, 240];
assert.deepEqual(lengths, expectedLengths);
const total = lengths.reduce((s, n) => s + n, 0);
assert.equal(total, 1466);

/**
 * Exactly count all equal runes at the same physical-page local rune offset.
 * @param {number[][]} pages
 * @returns {{equal: number, possible: number}}
 */
function samePhase(pages) {
  assert.equal(pages.length, 6);
  assert.deepEqual(pages.map((p) => p.length), lengths);
  let equal = 0;
  let possible = 0;
  for (let offset = 0; offset < Math.max(...lengths); offset++) {
    for (let a = 0; a < 6; a++) {
      if (offset >= lengths[a]) continue;
      for (let b = a + 1; b < 6; b++) {
        if (offset >= lengths[b]) continue;
        possible++;
        equal += Number(pages[a][offset] === pages[b][offset]);
      }
    }
  }
  return {equal, possible};
}
const observed = samePhase(originals);
assert.deepEqual(observed, {equal: 124, possible: 3507});
console.log('ORIGINAL', observed, 'fraction', observed.equal / observed.possible);

/** @param {number[]} symbols @returns {number[][]} */
function partition(symbols) {
  assert.equal(symbols.length, total);
  let offset = 0;
  return lengths.map((len) => {
    const part = symbols.slice(offset, offset + len);
    offset += len;
    return part;
  });
}

const tokens = corpus.translit.map((token, index) => ({token, index}))
  .sort((a, b) => b.token.length - a.token.length);

/**
 * Native GP29 encoding calibrated by the solved LP1 spelling convention.
 * @param {string} source
 * @returns {number[]}
 */
function gp(source) {
  const words = source.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S')
    .match(/[A-Z]+/g) || [];
  const values = [];
  for (const word of words) {
    for (let i = 0; i < word.length;) {
      const next = tokens.find((t) => word.startsWith(t.token, i));
      assert(next, 'Unknown GP token ' + word.slice(i));
      values.push(next.index);
      i += next.token.length;
    }
  }
  return values;
}

const panels = [
  {file: 'resources/control/gibran_prophet_58585.txt', runes: 63114, count: 1989, min: 164},
  {file: 'resources/control/shakespeare_first300k.txt', runes: 218800, count: 7011, min: 158},
  {file: 'resources/control/emerson_essays_2944.txt', runes: 324630, count: 10425, min: 168},
];

for (const panel of panels) {
  const native = gp(read(panel.file));
  assert.equal(native.length, panel.runes);
  let windows = 0;
  let below = 0;
  let minimum = Infinity;
  for (let offset = 0; offset + total <= native.length; offset += 31) {
    const current = samePhase(partition(native.slice(offset, offset + total)));
    assert.equal(current.possible, observed.possible);
    minimum = Math.min(minimum, current.equal);
    below += Number(current.equal <= observed.equal);
    windows++;
  }
  console.log('CONTROL', panel.file, {windows, minimum, below});
  assert.equal(windows, panel.count);
  assert.equal(minimum, panel.min);
  assert.equal(below, 0);
}

// Genuine language-positive plant with six authentic source-page lengths.
// One secret affine GP29 bijection for each printed local rune position,
// varying with position but shared across all six pages.
const plain = partition(gp(read(panels[0].file)).slice(0, total));
const key = Array.from({length: Math.max(...lengths)}, (_, i) =>
  ({a: (i % 28) + 1, b: (7 * i + 3) % 29}));
const encrypt = plain.map((page) => page.map((x, i) =>
  (key[i].a * x + key[i].b) % 29));
const invert = encrypt.map((page) => page.map((x, i) => {
  const a = key[i].a;
  const aInv = Array.from({length: 28}, (_, j) => j + 1)
    .find((candidate) => (a * candidate) % 29 === 1);
  assert(aInv !== undefined);
  return (aInv * ((x - key[i].b + 29) % 29)) % 29;
}));
assert.deepEqual(invert, plain);
assert.deepEqual(samePhase(plain), samePhase(encrypt));
assert(samePhase(plain).equal > observed.equal);
console.log('POSITIVE', samePhase(encrypt), 'recovered', total, 'of', total);
console.log('PASS: common position-indexed bijections cannot explain original as ordinary GP-English');
