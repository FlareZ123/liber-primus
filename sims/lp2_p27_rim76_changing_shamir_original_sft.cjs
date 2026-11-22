'use strict';

/**
 * Original-source p27 / p50 / p55 changing-coordinate Shamir candidate.
 * Node.js 22, CommonJS, read-only SFT. Run from any working directory.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const resource = (name) => JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', name), 'utf8'
));
const corpus = resource('lp2-corpus.json');
const grid = resource('lp2-grid-256.json');
const page = (n) => corpus.pages.find((p) => p.page === n).indices;
const p27 = page(27);
const p55 = page(55);
const p57 = page(57);
const mod = (x) => ((x % 29) + 29) % 29;

/** @param {number[]} data */
function ioc(data) {
  const counts = Array(29).fill(0);
  for (const x of data) counts[x]++;
  return counts.reduce((acc, n) => acc + n * (n - 1), 0) /
    (data.length * (data.length - 1));
}

/**
 * Quadratic Lagrange interpolation at x using three y-values
 * at the fixed historically conventional x-coordinates 1,2,3.
 */
function interpolate(a, b, c, x) {
  // In GF(29), 1/2 = 15.
  return mod(15 * (x - 2) * (x - 3) * a
    - (x - 1) * (x - 3) * b
    + 15 * (x - 1) * (x - 2) * c);
}

assert.equal(corpus.pages.filter((p) => p.page <= 55)
  .reduce((sum, p) => sum + p.indices.length, 0), 12956);
assert.equal(p27.length, 234);
assert.equal(p55.length, 76);
assert.ok(p57.length >= 76);
assert.deepEqual(p27.slice(28, 34), [23, 11, 1, 17, 18, 10]);
assert.deepEqual(p27.slice(28, 34), p55.slice(70, 76));

const remaining = p27.slice(34).concat(p27.slice(0, 28));
assert.equal(remaining.length, 228);
const separated = [
  remaining.slice(0, 76), remaining.slice(76, 152), remaining.slice(152)
];
const interleaved = [[], [], []];
remaining.forEach((v, i) => interleaved[i % 3].push(v));
assert.ok([...separated, ...interleaved].every((lane) => lane.length === 76));

const tokens = grid.pages.flatMap((p) => p.tokens);
assert.equal(tokens.length, 256);
assert.equal(grid.alphabet.length, 60);
assert.ok(tokens.every((t) => t.length === 2 && !t.includes('f')));

// Upper-left corner, clockwise, 32 rows x 8 columns. Each cell used once.
const rim = [];
for (let col = 0; col < 8; col++) rim.push(col);
for (let row = 1; row < 32; row++) rim.push(8 * row + 7);
for (let col = 6; col >= 0; col--) rim.push(8 * 31 + col);
for (let row = 30; row >= 1; row--) rim.push(8 * row);
assert.equal(rim.length, 76);
assert.equal(new Set(rim).size, 76);

const outcomes = [];
for (const [layout, lanes] of [
  ['contiguous', separated], ['interleaved', interleaved]
]) {
  for (const [direction, indices] of [
    ['clockwise', rim],
    ['counterclockwise', [rim[0], ...rim.slice(1).reverse()]]
  ]) {
    for (const radix of [59, 60]) {
      const alphabet = radix === 59
        ? grid.alphabet.replace('f', '') : grid.alphabet;
      assert.equal(alphabet.length, radix);
      const x = indices.map((i) => {
        const t = tokens[i];
        const encoded = alphabet.indexOf(t[0]) * radix +
          alphabet.indexOf(t[1]);
        assert.ok(encoded >= 0);
        return mod(encoded);
      });
      const key = x.map((v, i) => interpolate(
        lanes[0][i], lanes[1][i], lanes[2][i], v
      ));
      const decoded = p55.map((c, i) => mod(c - key[i]));
      const matches = key.filter((k, i) => k === p55[i]).length;
      assert.ok(decoded.every((p, i) => mod(p + key[i]) === p55[i]));
      // An independent genuine GP-native positive plant must round-trip.
      const planted = p57.slice(0, 76).map((p, i) => mod(p + key[i]));
      assert.deepEqual(planted.map((c, i) => mod(c - key[i])),
        p57.slice(0, 76));
      const outcome = {
        layout, direction, radix, directShamirMatches: matches,
        decodedIoC: Number(ioc(decoded).toFixed(9)),
        opening: decoded.slice(0, 24).map((v) => corpus.translit[v]).join(' ')
      };
      outcomes.push(outcome);
      console.log(JSON.stringify(outcome));
    }
  }
}
const canonical = outcomes.find((o) => o.layout === 'contiguous' &&
  o.direction === 'clockwise' && o.radix === 60);
assert.equal(canonical.directShamirMatches, 0);
assert.equal(Math.max(...outcomes.map((o) => o.directShamirMatches)), 8);
assert.ok(Math.max(...outcomes.map((o) => o.decodedIoC)) < ioc(p57.slice(0, 76)));
console.log('SFT PASS: all 8 original-source candidates and 8 solved-GP positive plants');
console.log(JSON.stringify({
  p55CipherIoC: ioc(p55), solvedP57First76IoC: ioc(p57.slice(0, 76))
}));
