'use strict';

/** Original LP2 four-apostrophe lag-five plaintext-feedback SFT. Node.js 22 CJS. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {number} x @returns {number} */
const mod = (x) => ((x % 29) + 29) % 29;
/** @param {number} x @returns {number} */
const inverse = (x) => {
  for (let i = 1; i < 29; i++) if (mod(x * i) === 1) return i;
  throw new Error('Not invertible mod29: ' + x);
};

const root = path.join(__dirname, '..', 'resources', 'liber-primus');
const book = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const original = book.pages.slice(0, 56).flatMap((page) => page.indices);
const letters = Object.fromEntries(book.translit.map((name, i) => [name, i])
  .filter(([name]) => name.length === 1));
const prefix = [0];
for (let i = 0; i < 56; i++) prefix.push(prefix.at(-1) + book.pages[i].indices.length);
assert.equal(original.length, 12956);
assert.equal(prefix[56], 12956);

const three = ['DONT', 'CANT', 'WONT', 'AINT', 'ISNT', 'LETS',
  'GODS', 'ONES', 'MANS', 'MENS', 'SHED', 'YOUD', 'ALLS'];
const two = ['ITS', 'HES', 'WED', 'HED', 'ITD', 'DOS'];
const sites = [
  {page: 4, beforeTick: 164, stem: 3, original: [19, 14, 10, 7], options: three},
  {page: 21, beforeTick: 36, stem: 2, original: [25, 3, 26], options: two},
  {page: 35, beforeTick: 80, stem: 2, original: [13, 18, 16], options: two},
  {page: 41, beforeTick: 218, stem: 3, original: [14, 20, 11, 5], options: three},
];
for (const site of sites) {
  site.start = prefix[site.page] + site.beforeTick - site.stem;
  assert.deepEqual(original.slice(site.start, site.start + site.original.length), site.original);
  assert.equal(site.start + site.stem, prefix[site.page] + site.beforeTick);
}
assert.deepEqual(sites.map((s) => s.start), [1107, 5136, 8513, 10086]);
assert.deepEqual(sites.map((s) => s.start + s.stem), [1110, 5138, 8515, 10089]);

/** @param {string} word @returns {number[]} */
const runes = (word) => [...word].map((letter) => {
  assert.ok(Number.isInteger(letters[letter]), 'Unexpected GP rune: ' + letter);
  return letters[letter];
});

// First-party control: original LP1 prints I-RWN'B, solved as I DON'T.
// The 13-rune FIRFUMFERENFE key gives initial differences FIRFU.
// Apostrophe consumes zero rune/key positions, after two earlier literal-F skips.
const lp1Cipher = runes('IRWNB');
const lp1Plain = runes('IDONT');
assert.deepEqual(lp1Cipher, [10, 4, 7, 9, 17]);
assert.deepEqual(lp1Cipher.map((v, i) => mod(v - lp1Plain[i])),
  runes('FIRFUMFERENFE').slice(0, 5));
assert.equal(book.pages[56].indices[0], letters.AE);
assert.equal(mod(book.pages[56].indices[0] - (2 - 1)), letters.A);
console.log('AUTHENTIC POSITIVES: LP1 I-RWN-B to I-DONT; LP2 p56 AE to A');

/**
 * C[i] = a*P[i] + b*P[i-5] + k (mod29), with five global IV runes
 * P[-5]..P[-1]. Neither an apostrophe nor a printed word/page boundary
 * changes the GP-rune-only clock. a,b are fixed source-motivated signs.
 *
 * @param {number[]} plain
 * @param {number} a
 * @param {number} b
 * @param {number} k
 * @param {number[]} iv
 * @returns {number[]}
 */
function encrypt(plain, a, b, k, iv) {
  return plain.map((p, i) => mod(a * p + b * (i < 5 ? iv[i] : plain[i - 5]) + k));
}

/** @param {number[]} cipher @param {number} a @param {number} b
 * @param {number} k @param {number[]} iv @returns {number[]} */
function decrypt(cipher, a, b, k, iv) {
  const ainv = inverse(a);
  const plain = [];
  for (let i = 0; i < cipher.length; i++)
    plain.push(mod(ainv * (cipher[i] - k - b * (i < 5 ? iv[i] : plain[i - 5]))));
  return plain;
}

/**
 * Every P[i] is affine in six shared unknowns [k, IV0..IV4].
 * Expression layout is [constant, coefficient(k), coefficients(IV0..4)].
 * @param {number[]} cipher @param {number} a @param {number} b
 * @returns {number[][]}
 */
function expressions(cipher, a, b) {
  const ainv = inverse(a);
  const lag = Array.from({length: 5}, (_, r) => {
    const row = Array(7).fill(0);
    row[2 + r] = 1;
    return row;
  });
  const out = [];
  for (let i = 0; i < cipher.length; i++) {
    const e = Array(7).fill(0);
    e[0] = mod(ainv * cipher[i]);
    e[1] = mod(-ainv);
    for (let j = 0; j < 7; j++) e[j] = mod(e[j] - ainv * b * lag[i % 5][j]);
    lag[i % 5] = e;
    out.push(e);
  }
  return out;
}

/** @param {number[][]} rows @returns {{rank:number,ok:boolean,pivots:number[],matrix:number[][]}} */
function solve(rows) {
  const matrix = rows.map((row) => row.slice());
  const pivots = [];
  let rank = 0;
  for (let col = 0; col < 6; col++) {
    let pivot = rank;
    while (pivot < matrix.length && matrix[pivot][col] === 0) pivot++;
    if (pivot === matrix.length) continue;
    [matrix[pivot], matrix[rank]] = [matrix[rank], matrix[pivot]];
    const inv = inverse(matrix[rank][col]);
    matrix[rank] = matrix[rank].map((v) => mod(v * inv));
    for (let i = 0; i < matrix.length; i++) {
      if (i === rank || !matrix[i][col]) continue;
      const factor = matrix[i][col];
      matrix[i] = matrix[i].map((v, j) => mod(v - factor * matrix[rank][j]));
    }
    pivots.push(col);
    rank++;
  }
  return {rank, ok: matrix.slice(rank).every((r) => r[6] === 0), pivots, matrix};
}

/** @param {number[][]} ex @param {number} siteIndex @param {string} word */
function constraints(ex, siteIndex, word) {
  const site = sites[siteIndex];
  assert.equal(word.length, site.original.length);
  return runes(word).map((p, j) => {
    const e = ex[site.start + j];
    return [...e.slice(1), mod(p - e[0])];
  });
}

/** Full source-shaped positive: original GP rune spellings and original site geometry. */
for (const a of [1, 28]) for (const b of [1, 28]) {
  const native = Array.from({length: original.length},
    (_, i) => book.pages[57].indices[i % book.pages[57].indices.length]);
  for (let site = 0; site < 4; site++) {
    const s = sites[site];
    native.splice(s.start, s.original.length, ...runes(site % 2 ? 'ITS' : 'DONT'));
  }
  // Site 2 is also 2+1, site 3 is 3+1.
  native.splice(sites[2].start, 3, ...runes('HED'));
  native.splice(sites[3].start, 4, ...runes('CANT'));
  const iv = [4, 9, 13, 20, 24], k = 11;
  const planted = encrypt(native, a, b, k, iv);
  assert.deepEqual(decrypt(planted, a, b, k, iv), native);
  assert.deepEqual(encrypt(decrypt(planted, a, b, k, iv), a, b, k, iv), planted);
  const ex = expressions(planted, a, b);
  const solution = solve([...constraints(ex, 0, 'DONT'), ...constraints(ex, 1, 'ITS')]);
  assert.ok(solution.ok);
  if (solution.rank === 6) {
    const found = Array(6).fill(0);
    for (let i = 0; i < 6; i++) found[solution.pivots[i]] = solution.matrix[i][6];
    assert.deepEqual(found, [k, ...iv]);
    assert.deepEqual(decrypt(planted, a, b, found[0], found.slice(1)), native);
  }
  const wrong = decrypt(planted, a, b === 1 ? 28 : 1, k, iv);
  assert.notDeepEqual(wrong.slice(0, 150), native.slice(0, 150));
  console.log('PLANTED', {a, b, sourceLength: native.length, fullRoundtrip: true,
    trainRank: solution.rank, exactKeyRecovered: solution.rank === 6});
}

/** Original fit: train only on p4/p21, hold p35/p41 and 150 contiguous runes out. */
const result = [];
for (const a of [1, 28]) for (const b of [1, 28]) {
  const ex = expressions(original, a, b);
  let train = 0, rankSix = 0, hit35 = 0, hit41 = 0, joint = 0;
  const witnesses = [];
  for (const w0 of sites[0].options) for (const w1 of sites[1].options) {
    const solution = solve([...constraints(ex, 0, w0), ...constraints(ex, 1, w1)]);
    if (!solution.ok) continue;
    train++;
    assert.equal(solution.rank, 6, 'All original training fits expected to be unique');
    rankSix++;
    const x = Array(6).fill(0);
    for (let i = 0; i < 6; i++) x[solution.pivots[i]] = solution.matrix[i][6];
    const decoded = decrypt(original, a, b, x[0], x.slice(1));
    assert.deepEqual(encrypt(decoded, a, b, x[0], x.slice(1)), original);
    const found35 = sites[2].options.filter((w) =>
      runes(w).every((v, j) => v === decoded[sites[2].start + j]));
    const found41 = sites[3].options.filter((w) =>
      runes(w).every((v, j) => v === decoded[sites[3].start + j]));
    if (found35.length) hit35++;
    if (found41.length) hit41++;
    if (found35.length && found41.length) joint++;
    const interval = decoded.slice(5060, 5210);
    const count = Array(29).fill(0);
    for (const v of interval) count[v]++;
    const ioc = count.reduce((sum, n) => sum + n * (n - 1), 0) / (150 * 149);
    witnesses.push({train: [w0, w1], k: x[0], iv: x.slice(1),
      decodedHeldout35: decoded.slice(sites[2].start, sites[2].start + 3)
        .map((v) => book.translit[v]).join('-'),
      decodedHeldout41: decoded.slice(sites[3].start, sites[3].start + 4)
        .map((v) => book.translit[v]).join('-'),
      intervalStart: 5060, intervalLength: 150, intervalIoc: Number(ioc.toFixed(8)),
      intervalFirst30: interval.slice(0, 30).map((v) => book.translit[v]).join('-')});
  }
  console.log('ORIGINAL', JSON.stringify({a, b, train, rankSix, hit35, hit41, joint, witnesses}));
  result.push([a, b, train, hit35, hit41, joint]);
}
assert.deepEqual(result, [
  [1, 1, 0, 0, 0, 0],
  [1, 28, 6, 0, 0, 0],
  [28, 1, 2, 0, 0, 0],
  [28, 28, 0, 0, 0, 0],
]);
console.log('PASS: all four source-driven sign models; 78 training tuples each; no held-out original contraction or unknown LP2 plaintext.');
