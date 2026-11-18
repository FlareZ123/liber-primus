'use strict';

/**
 * Original-source LP2 36 ink-stop / 256 table pointer experiment.
 * Run: node sims/lp2_ink36_zero_affine_grid_source_sft.cjs
 *
 * Classification: low-confidence postselected affine alignment and
 * exact negative receivers. No unknown-LP2 plaintext or author-selected
 * key is claimed.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
/** @param {string} file */
function json(file) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'resources', 'liber-primus', file), 'utf8'));
}
const corpus = json('lp2-corpus.json');
const grid = json('base60-grid.json');
const ink = json('lp2-ink-annotations.json');
const bytes = grid.byte_rows.flat();
const allRunes = corpus.pages.flatMap((page) => page.indices);
const starts = new Map();
let offset = 0;
for (const page of corpus.pages) {
  starts.set(page.page, offset);
  offset += page.indices.length;
}
assert.equal(allRunes.length, 13136);
assert.equal(bytes.length, 256);
assert.equal(bytes[7], 183);
assert.equal(grid.byte_rows.length, 32);
assert(grid.byte_rows.every((row) => row.length === 8));
assert.equal(
  crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290'
);

const marks = ink.pages.flatMap((page) =>
  (page.large_punctuation || []).map(([end, dots, color]) => ({
    page: page.page,
    end,
    dots,
    color,
    pos: starts.get(page.page) + end
  }))
).sort((a, b) => a.pos - b.pos);
assert.equal(marks.length, 36);

const segments = [];
let prev = 0;
for (const mark of marks) {
  const values = allRunes.slice(prev, mark.pos);
  segments.push({
    length: values.length,
    indexSum: values.reduce((s, x) => s + x, 0) % 29,
    primeSum: values.reduce((s, x) => s + corpus.prime[x], 0) % 29,
    dots: mark.dots,
    mark
  });
  prev = mark.pos;
}
assert.equal(prev, allRunes.length);

const empty = segments.flatMap((s, i) => s.length === 0 ? [i] : []);
const zeroCells = bytes.flatMap((v, i) => v === 0 ? [i] : []);
assert.deepEqual(empty, [8, 11]);
assert.deepEqual(zeroCells, [192, 229]);

// This affine candidate was noticed AFTER observing the two zeros.
// Its slope is the literal top-right printed byte; its intercept is
// the eight-column table width. It is not an authenticated Cicada rule.
const slope = bytes[7];
const intercept = grid.byte_rows[0].length;
/** @param {number} i */
const address = (i) => (slope * i + intercept) % 256;
const addressedZeros = Array.from({ length: 36 }, (_, i) => i)
  .filter((i) => bytes[address(i)] === 0);
assert.deepEqual(addressedZeros, empty);
assert.equal(address(8), 192);
assert.equal(address(11), 229);
assert.equal(new Set(Array.from({ length: 256 }, (_, i) => address(i))).size, 256);

// Source-orthographic 220-rune channel = all red-runic ink except
// the five red runes of solved physical p56. This is a proposed
// grouping, motivated by the 36+220=256 numerical alignment.
const red = ink.pages
  .filter((page) => page.page !== 56)
  .flatMap((page) =>
    (page.red_spans || []).flatMap((span) =>
      Array.from(span.runes, (r) => {
        const code = corpus.runes.indexOf(r);
        assert(code >= 0, 'original red rune outside GP29 alphabet');
        assert.equal(corpus.pages[page.page].indices[span.start + Array.from(span.runes).indexOf(r)], code);
        return code;
      })
    )
  );
assert.equal(red.length, 220);

/** @param {number[]} source */
function syndrome(source) {
  assert.equal(source.length, 256);
  const values = source.map((x) => ((x % 29) + 29) % 29);
  const f = [1, 28, 13, 9, 14];
  for (let i = 0; i < 252; i++) {
    const v = values[i];
    for (let j = 0; j < 5; j++) {
      values[i + j] = (values[i + j] + 29 - (v * f[j]) % 29) % 29;
    }
  }
  return values.slice(-4);
}
assert.deepEqual(syndrome(bytes), [0, 0, 0, 0]);

const hybridResults = {};
for (const type of ['length', 'indexSum', 'primeSum', 'dots']) {
  /** @type {(number|null)[]} */
  const hybrid = Array(256).fill(null);
  for (let i = 0; i < marks.length; i++) {
    hybrid[address(i)] = segments[i][type] % 29;
  }
  let redIndex = 0;
  for (let i = 0; i < 256; i++) {
    if (hybrid[i] === null) hybrid[i] = red[redIndex++];
  }
  assert.equal(redIndex, 220);
  const full = /** @type {number[]} */ (hybrid);
  const rem = syndrome(full);
  const directMatches = full.filter((v, i) => v === bytes[i] % 29).length;
  hybridResults[type] = { syndrome: rem, directMatches };
}
assert.deepEqual(hybridResults, {
  length: { syndrome: [18, 26, 13, 10], directMatches: 14 },
  indexSum: { syndrome: [27, 9, 26, 14], directMatches: 16 },
  primeSum: { syndrome: [7, 16, 23, 15], directMatches: 15 },
  dots: { syndrome: [28, 21, 13, 16], directMatches: 13 }
});

// Three authentic p56 punctuation sites are independently solved.
// The predecessor cipher-to-plaintext shifts are [10,22,26] mod29;
// the affine-indexed bytes predict [16,19,16], with no exact matches.
const p56Known = [
  { i: 31, cipher: 4, plaintext: 23 },
  { i: 32, cipher: 25, plaintext: 3 },
  { i: 33, cipher: 15, plaintext: 18 }
];
const knownKey = p56Known.map(({ cipher, plaintext }) => (cipher - plaintext + 29) % 29);
const proposedKey = p56Known.map(({ i }) => bytes[address(i)] % 29);
assert.deepEqual(knownKey, [10, 22, 26]);
assert.deepEqual(proposedKey, [16, 19, 16]);
assert.equal(proposedKey.filter((x, i) => x === knownKey[i]).length, 0);

/** @param {number[]} values */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const v of values) counts[v]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) / (values.length * (values.length - 1));
}
const p55 = corpus.pages.find((page) => page.page === 55).indices;
assert.equal(p55.length, 76);
const key76 = p55.map((_, i) => bytes[address(i)] % 29);
const plus = p55.map((x, i) => (x + key76[i]) % 29);
const minus = p55.map((x, i) => (x - key76[i] + 29) % 29);
assert(Math.abs(ioc(plus) - 0.028771929824561403) < 1e-14);
assert(Math.abs(ioc(minus) - 0.034736842105263156) < 1e-14);
for (const [sign, plain] of [[1, plus], [-1, minus]]) {
  assert.deepEqual(plain.map((x, i) => (x - sign * key76[i] + 58) % 29), p55);
}

console.log(JSON.stringify({
  source: { gpRunes: allRunes.length, inkMarks: marks.length, nonP56Red: red.length },
  affine: { slope, intercept, empty, zeroCells, addressedZeros },
  hybridResults,
  p56Known: { requiredShifts: knownKey, proposedShifts: proposedKey, matches: 0 },
  p55: { plusIoc: ioc(plus), minusIoc: ioc(minus) },
  interpretation: 'Two-zero match discovered post hoc; all four exact codeword checks and both direct p55 inverses fail.'
}, null, 2));
