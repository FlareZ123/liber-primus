'use strict';

// Original-input SFT: source-fixed 2014 Onion6 square labels versus LP2 pp49–51.
// node sims/lp2_stage10_three_square_pp49_51_sft.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const source = path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-grid-256.json');
const raw = fs.readFileSync(source);
const corpus = JSON.parse(raw.toString('utf8'));
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';

const contracts = [
  { page: 49, image: '66.jpg', n: 5, magicSum: 3301,
    rows: [884, 966, 473, 655, 519], columns: [640, 994, 708, 505, 650], diagonals: [546, 647] },
  { page: 50, image: '67.jpg', n: 7, magicSum: 1033,
    rows: [906, 1054, 822, 664, 920, 615, 968],
    columns: [1013, 1050, 871, 915, 742, 857, 501], diagonals: [798, 1131] },
  { page: 51, image: '68.jpg', n: 5, magicSum: 1033,
    rows: [422, 579, 655, 369, 626], columns: [437, 779, 541, 358, 536], diagonals: [611, 653] }
];

/** @param {number[][]} grid */
function sums(grid) {
  const n = grid.length;
  return {
    rows: grid.map(row => row.reduce((a, b) => a + b, 0)),
    columns: Array.from({ length: n }, (_, c) => grid.reduce((s, row) => s + row[c], 0)),
    diagonals: [
      grid.reduce((s, row, r) => s + row[r], 0),
      grid.reduce((s, row, r) => s + row[n - 1 - r], 0)
    ]
  };
}

/** Standard odd-order Siamese construction, used as an independent algorithm control.
 * @param {number} n
 * @returns {number[][]}
 */
function siamese(n) {
  const grid = Array.from({ length: n }, () => Array(n).fill(0));
  let r = 0;
  let c = Math.floor(n / 2);
  for (let v = 1; v <= n * n; v++) {
    grid[r][c] = v;
    const nr = (r + n - 1) % n;
    const nc = (c + 1) % n;
    if (grid[nr][nc]) r = (r + 1) % n;
    else { r = nr; c = nc; }
  }
  return grid;
}

assert.equal(corpus.pages.length, 3);
assert.deepEqual(corpus.pages.map(p => p.rows), [10, 13, 9]);
assert.deepEqual(corpus.pages.map(p => p.tokens.length), [80, 104, 72]);
for (const n of [5, 7]) {
  const expected = n * (n * n + 1) / 2;
  const positive = siamese(n);
  const s = sums(positive);
  assert([...s.rows, ...s.columns, ...s.diagonals].every(x => x === expected));
  positive[0][0]++;
  assert([...Object.values(sums(positive)).flat()].some(x => x !== expected));
  console.log('Positive-control magic order', n, 'sum', expected, 'PASS; perturbation rejected');
}

console.log('Source', path.relative(path.join(__dirname, '..'), source));
console.log('Source SHA256', crypto.createHash('sha256').update(raw).digest('hex'));
for (let i = 0; i < contracts.length; i++) {
  const f = contracts[i];
  const page = corpus.pages[i];
  assert.equal(page.page, f.page);
  assert.equal(page.image, f.image);
  const decoded = page.tokens.map(token => {
    assert.equal(token.length, 2);
    const a = alphabet.indexOf(token[0]);
    const b = alphabet.indexOf(token[1]);
    assert(a >= 0 && b >= 0);
    return 60 * a + b;
  });
  assert.deepEqual(decoded, page.bytes);
  const grid = Array.from({ length: f.n }, (_, r) => decoded.slice(8 * r, 8 * r + f.n));
  assert(grid.every(row => row.length === f.n));
  const s = sums(grid);
  assert.deepEqual(s.rows, f.rows);
  assert.deepEqual(s.columns, f.columns);
  assert.deepEqual(s.diagonals, f.diagonals);
  assert([...s.rows, ...s.columns, ...s.diagonals].some(x => x !== f.magicSum));
  console.log(JSON.stringify({
    page: f.page, image: f.image, dimension: f.n, target: f.magicSum,
    topLeftTokens: Array.from({ length: f.n }, (_, r) => page.tokens.slice(8 * r, 8 * r + f.n)),
    topLeftValues: grid,
    rowSums: s.rows, columnSums: s.columns, diagonalSums: s.diagonals,
    magic: false
  }));
}
// Director #3103: source-cued centered order-seven candidate on p50.
// The 13 printed rows give one centered seven-row window (zero-based 3..9).
// The source-visible tree reflection c -> 7-c maps the two possible 7-column
// windows in the eight-column page: columns 0..6 and 1..7. Test both, without
// searching other row origins, radices, or receivers.
const p50 = corpus.pages[1];
assert.equal(p50.page, 50);
const p50TokenRows = Array.from({ length: p50.rows }, (_, r) =>
  p50.tokens.slice(8 * r, 8 * r + 8));
const p50ValueRows = p50TokenRows.map(row => row.map(token => {
  const a = alphabet.indexOf(token[0]);
  const b = alphabet.indexOf(token[1]);
  assert(a >= 0 && b >= 0);
  return 60 * a + b;
}));
assert.deepEqual(p50ValueRows.flat(), p50.bytes);
const centered7 = [0, 1].map(c0 => {
  const grid = p50ValueRows.slice(3, 10).map(row => row.slice(c0, c0 + 7));
  const s = sums(grid);
  return {
    firstColumn: c0,
    rowSums: s.rows,
    columnSums: s.columns,
    diagonalSums: s.diagonals,
    magic1033: [...s.rows, ...s.columns, ...s.diagonals].every(x => x === 1033)
  };
});
assert.deepEqual(centered7, [
  {
    firstColumn: 0,
    rowSums: [664, 920, 615, 968, 836, 1173, 942],
    columnSums: [804, 994, 739, 937, 793, 987, 864],
    diagonalSums: [1139, 1010],
    magic1033: false
  },
  {
    firstColumn: 1,
    rowSums: [657, 1031, 766, 938, 978, 1237, 959],
    columnSums: [994, 739, 937, 793, 987, 864, 1252],
    diagonalSums: [930, 477],
    magic1033: false
  }
]);
const p50RowReflectionPairs = p50TokenRows.filter((row, r) =>
  row.join('') === p50TokenRows[12 - r].slice().reverse().join('')).length;
const p50CenterRowPalindrome =
  p50TokenRows[6].join('') === p50TokenRows[6].slice().reverse().join('');
assert.equal(p50RowReflectionPairs, 0);
assert.equal(p50CenterRowPalindrome, false);
console.log(JSON.stringify({
  sourceCuedCenteredP50Order7: {
    selectedRowsZeroBased: [3, 9],
    reflectedSevenColumnWindows: centered7,
    tableDataMirrorPairs: p50RowReflectionPairs,
    centerRowPalindrome: p50CenterRowPalindrome,
    decision: 'Neither horizontal-reflection placement is a 7x7 magic square of constant 1033.'
  }
}));

assert(5 * 255 < 3301, 'A byte-valued five-entry row cannot sum to 3301');
console.log('PASS: top-left and centered/reflection-related Stage10 candidates rejected; no variant search performed');
