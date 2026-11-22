/**
 * Exact GP30 5x6 coordinate-space gate. Windows Node.js 22 CommonJS SFT.
 * The 29 original runes and printed separators form a temporary 30-token
 * hypothesis. Neither this grid nor a shift has been attributed to Cicada.
 *
 * A hidden 5x6 cell grid is allowed to be ANY permutation; even the plaintext
 * and ciphertext grids may be independently permuted. For lag s, the plaintext
 * SPACE test after the first s tokens is C[i] in a secret row R (six symbols)
 * and C[i-s] in a secret column K (five), R intersection K one symbol.
 * Enumerate all 593775 row sets. For each, the best column comprises the
 * highest-weight row member and four highest-weight nonmembers.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const src = path.resolve(__dirname, '..', 'resources', 'liber-primus');
const metadata = JSON.parse(fs.readFileSync(path.join(src, 'lp2-corpus.json'), 'utf8'));
const alphabet = new Map(metadata.runes.map((r, i) => [r, i]));
const texts = fs.readFileSync(path.join(src, 'lp2-transcription.txt'), 'utf8').split(/^\s*%\s*$/m);
assert.equal(texts.length, 57);
const pages = texts.map((text) => {
  const out = [];
  for (const glyph of text) {
    const rune = alphabet.get(glyph);
    if (rune !== undefined) out.push(rune);
    else if ((glyph === '-' || glyph === '.') && out.length && out[out.length - 1] !== 29) out.push(29);
  }
  return out;
});
/** @param {number} first @param {number} last */
function scope(first, last) {
  const out = [];
  for (let physical = first; physical <= last; physical++) {
    if (physical === 50) continue;
    out.push(...pages[physical <= 49 ? physical : physical - 1]);
  }
  return out;
}
/** @param {number[]} data @param {number} lag @param {boolean} reverse */
function contingency(data, lag, reverse) {
  const matrix = Array.from({ length: 30 }, () => new Int32Array(30));
  for (let i = lag; i < data.length; i++) {
    const a = reverse ? data[i - lag] : data[i];
    const b = reverse ? data[i] : data[i - lag];
    matrix[a][b]++;
  }
  return matrix;
}
/** @param {Int32Array[]} matrix */
function allSecretMaximum(matrix) {
  const sums = new Int32Array(30);
  const included = new Uint8Array(30);
  const row = [];
  let best = -1;
  let bestRow = [];
  let bestColumn = [];
  let examined = 0;
  function choose(depth, next) {
    if (depth === 6) {
      examined++;
      let inside = -1;
      let insideLabel = -1;
      const outside = [-1, -1, -1, -1];
      const labels = [-1, -1, -1, -1];
      for (let j = 0; j < 30; j++) {
        const value = sums[j];
        if (included[j]) {
          if (value > inside) { inside = value; insideLabel = j; }
        } else if (value > outside[3]) {
          let k = 3;
          while (k > 0 && value > outside[k - 1]) {
            outside[k] = outside[k - 1];
            labels[k] = labels[k - 1];
            k--;
          }
          outside[k] = value;
          labels[k] = j;
        }
      }
      const result = inside + outside[0] + outside[1] + outside[2] + outside[3];
      if (result > best) {
        best = result;
        bestRow = row.slice();
        bestColumn = [insideLabel, ...labels];
      }
      return;
    }
    for (let i = next; i <= 30 - (6 - depth); i++) {
      row.push(i);
      included[i] = 1;
      for (let j = 0; j < 30; j++) sums[j] += matrix[i][j];
      choose(depth + 1, i + 1);
      for (let j = 0; j < 30; j++) sums[j] -= matrix[i][j];
      included[i] = 0;
      row.pop();
    }
  }
  choose(0, 0);
  assert.equal(examined, 593775);
  assert.equal(bestRow.length, 6);
  assert.equal(bestColumn.length, 5);
  assert.equal(bestRow.filter((x) => bestColumn.includes(x)).length, 1);
  let reconstructed = 0;
  for (const r of bestRow) for (const c of bestColumn) reconstructed += matrix[r][c];
  assert.equal(reconstructed, best);
  return { best, row: bestRow, column: bestColumn };
}
// Native-positive: original p57 clear GP runes with its 19 genuine internal
// separators; remove the terminal period's editorial separator.
const clear = scope(57, 57).slice();
assert.equal(clear.pop(), 29);
assert.equal(clear.length, 114);
assert.equal(clear.filter((x) => x === 29).length, 19);
const perm = Array.from({ length: 30 }, (_, i) => (11 * i + 7) % 30);
assert.equal(new Set(perm).size, 30);
const inverse = Array(30);
for (let i = 0; i < 30; i++) inverse[perm[i]] = i;
for (const lag of [5, 6]) {
  const hidden = clear.map((x) => perm[x]);
  const cipher = hidden.map((x, i) => inverse[6 * Math.floor(x / 6) + hidden[(i + lag) % hidden.length] % 6]);
  const decoded = cipher.map((x, i) =>
    inverse[6 * Math.floor(perm[x] / 6) + perm[cipher[(i - lag + cipher.length) % cipher.length]] % 6]);
  assert.deepEqual(decoded, clear);
  const compatible = allSecretMaximum(contingency(cipher, lag, false)).best;
  const actual = decoded.slice(lag).filter((x) => x === 29).length;
  assert.ok(compatible >= actual);
  console.log('PLANT p57 shift ' + lag + ': all 114/114 source tokens recovered; ' +
    actual + ' retained true SPACE positions inside ' + compatible + ' all-key maximum');
}
const chapters = [[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
const expected = [
  [112,116,113,116], [185,171,185,171], [256,245,253,244],
  [284,276,285,276], [160,157,164,156], [216,212,218,211],
  [239,250,242,249], [431,406,430,409], [58,57,58,57]
];
for (let k = 0; k < chapters.length; k++) {
  const [first, last] = chapters[k];
  const data = scope(first, last);
  const found = [];
  for (const reverse of [false, true]) for (const lag of [5, 6]) {
    const result = allSecretMaximum(contingency(data, lag, reverse));
    found.push(result.best);
    const generousDensity = (result.best + lag) / data.length;
    if (k < 8) assert.ok(generousDensity < 1/6);
  }
  assert.deepEqual(found, expected[k], 'Original frozen source matrix mismatch at chapter ' + k);
  console.log('ORIGINAL p' + first + '-' + last + ' tokens=' + data.length +
    ' runes=' + data.filter((x) => x !== 29).length +
    ' observedSeparators=' + data.filter((x) => x === 29).length +
    ' maxima [forward5,forward6,reverse5,reverse6]=' + found.join(',') +
    ' generousMaxSpaceDensity=' + Math.max(
      (found[0]+5)/data.length, (found[1]+6)/data.length,
      (found[2]+5)/data.length, (found[3]+6)/data.length).toFixed(8));
}
const book = scope(0, 55);
assert.equal(book.length, 15850);
assert.equal(book.filter((v) => v !== 29).length, 12956);
const global = [];
for (const reverse of [false, true]) for (const lag of [5, 6]) {
  global.push(allSecretMaximum(contingency(book, lag, reverse)).best);
}
assert.deepEqual(global, [1660,1596,1660,1602]);
console.log('GLOBAL source 15850 tokens, all-secret maxima [f5,f6,r5,r6]=' + global.join(','));
console.log('PASS: source-native reversible positive and full original 30-symbol all-secret space-capacity gate. No LP2 unknown plaintext/key recovered.');
