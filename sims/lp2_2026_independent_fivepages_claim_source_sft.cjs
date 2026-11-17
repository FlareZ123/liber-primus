'use strict';

/**
 * Reproduce the precise 2026 "five new pages solved" source assertions
 * against the full unmodified LP2 original corpus and print-token table.
 *
 * Claim: 7 Oct 2026, r/mystery/1x0432x
 * Original sources: LP2 JPEGs 17.jpg–74.jpg, corpus and table below.
 * Positive control: p32 complete 11x11 GP29 matrix rank and det=8.
 * No decryptor/unknown plaintext was published in the claimed method.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', 'resources', 'liber-primus');
const read = filename => JSON.parse(fs.readFileSync(path.join(root, filename), 'utf8'));
const lp = read('lp2-corpus.json');
const table = read('lp2-grid-256.json');
const tokens = table.pages.flatMap(p => p.tokens);
const bytes = table.pages.flatMap(p => p.bytes);
assert.equal(tokens.length, 256);
assert.equal(bytes.length, 256);
assert.equal(lp.pages.length, 58);
assert.equal(lp.pages.filter(p => p.status === 'unsolved').length, 55);
assert.equal(lp.pages.filter(p => p.status === 'numeric_grid_only').length, 1);

for (const [index, original] of [[25, '3I'], [246, '3I'], [45, '1l'], [50, '0l']]) {
  assert.equal(tokens[index], original, 'original image-consistent token');
}
const archivalDisagreements = [
  [25, 224], [45, 81], [50, 21], [165, 47], [170, 194],
  [172, 174], [175, 44], [182, 141], [199, 21], [246, 224]
];
const differences = archivalDisagreements.map(([i, historic]) => bytes[i] - historic);
assert.deepEqual(differences, [-26, 26, 26, -29, 60, -26, -26, 26, 26, -26]);
assert.equal(differences.filter(d => Math.abs(d) === 26).length, 8);
console.log('2014 participant variant vs source-correct 256-cell table: 10 differences, only 8 ±26');
console.log('Original printed cell25=' + tokens[25] + ', cell246=' + tokens[246] +
  '; lowercase i is not supported by source pixel glyph shape');

const page = n => lp.pages.find(p => p.page === n);
const scan = n => String(n + 17).padStart(2, '0') + '.jpg';
assert.equal(page(15).runic_count, 159);
assert.equal(page(32).runic_count, 121);
assert.equal(page(39).runic_count, 240);
assert.equal(page(54).runic_count, 232);
assert.equal(page(56).runic_count, 85);
assert.equal(scan(15), '32.jpg');
assert.equal(scan(32), '49.jpg');
assert.equal(scan(39), '56.jpg');
assert.equal(scan(54), '71.jpg');
assert.equal(scan(56), '73.jpg');
console.log('Correct source crosswalk: scan32→LP2 p15(159), scan49→p32(121), scan56→p39(240), scan71→p54(232), scan73→p56(85)');

const p = 29;
const mod = v => (v % p + p) % p;
/** Exact determinant and full rank for source p32's 11x11 GP29 ciphertext matrix. */
function determinant(values, n) {
  assert.equal(values.length, n * n);
  const a = Array.from({length: n}, (_, r) => values.slice(n * r, n * r + n));
  let det = 1;
  for (let i = 0; i < n; i++) {
    let k = i;
    while (k < n && a[k][i] === 0) k++;
    if (k === n) return 0;
    if (k !== i) {
      [a[k], a[i]] = [a[i], a[k]];
      det = mod(-det);
    }
    const pivot = a[i][i];
    det = det * pivot % p;
    let inverse = 1;
    while (inverse * pivot % p !== 1) inverse++;
    for (let row = i + 1; row < n; row++) {
      const factor = a[row][i] * inverse % p;
      for (let col = i; col < n; col++) {
        a[row][col] = mod(a[row][col] - factor * a[i][col]);
      }
    }
  }
  return det;
}
assert.equal(determinant(page(32).indices, 11), 8);
let order = 1, residue = 11;
while (residue !== 1) {
  order++;
  residue = residue * 11 % p;
}
assert.equal(order, 28);
console.log('Exact p32 GF29 11x11 determinant=8 and rank=11; multiplication order of 11 mod29=28');
console.log('p32 is still 121 original ciphertext runes; a matrix determinant alone yields no GP29 plaintext');
console.log('PASS: source-original page crosswalk, ten-versus-eight disagreement, matrix and primitive-root arithmetic');
