'use strict';

/**
 * Original LP2 opening-chapter p0-p2 13-rune red heading / 716-rune
 * black-body Hill4 test with four independently reconstructed p15 4x4
 * matrices. This is a different four-rune alignment from continuous book
 * Hill4, but a bounded operation without guessed keys or text fitting.
 * Run on Node.js 22, read-only, Windows-compatible.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const R = path.join(__dirname, '..');
const gp = require('./fibonacci_square_hill4_gate.cjs');
const corpus = JSON.parse(fs.readFileSync(
  path.join(R, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const opening = corpus.pages.slice(0, 3).flatMap((p) => p.indices);
assert.deepStrictEqual(corpus.pages.slice(0, 3).map((p) => p.indices.length),
  [262, 266, 201]);
assert.equal(opening.length, 729);
const red = opening.slice(0, 13);
const body = opening.slice(13);
assert.equal(red.length, 13);
assert.equal(body.length, 716);
assert.equal(body.length / 4, 179);
assert.deepStrictEqual(red, [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5]);

const square = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820]
];
const sourcePrime = [
  [43, 79, 149, 263],
  [23, 2, 3, 463],
  [13, 7, 5, 829],
  [7817, 4507, 2593, 1481]
];
const ordinal = [
  [14, 22, 35, 56],
  [9, 1, 2, 90],
  [6, 4, 3, 145],
  [988, 611, 378, 234]
];
const fibonacci = [
  [13, 21, 34, 55],
  [8, 0, 1, 89],
  [5, 3, 2, 144],
  [987, 610, 377, 233]
];
for (let row = 0; row < 4; row += 1) {
  for (let col = 0; col < 4; col += 1) {
    assert.equal(square[row][col], Math.abs(3301 - sourcePrime[row][col]));
    assert.equal(ordinal[row][col] - 1, fibonacci[row][col]);
  }
}

/**
 * @param {number[]} arr
 * @returns {string}
 */
function latin(arr) {
  return arr.map((i) => corpus.translit[i]).join('');
}
const families = [
  ['printed-distance', square],
  ['prime', sourcePrime],
  ['prime-ordinal', ordinal],
  ['fibonacci', fibonacci]
];
const results = [];
for (const [family, sourceMatrix] of families) {
  const variants = gp.dihedralOrientations(sourceMatrix);
  assert.equal(variants.length, 8);
  for (let orientation = 0; orientation < 8; orientation += 1) {
    const key = variants[orientation].map((row) => row.map(gp.mod));
    const inv = gp.matrixInverse(key);
    assert.ok(inv);
    const choices = [
      ['K', key], ['Kinv', inv],
      ['Kt', key[0].map((_, col) => key.map((row) => row[col]))],
      ['KinvT', inv[0].map((_, col) => inv.map((row) => row[col]))]
    ];
    for (const [name, matrix] of choices) {
      const plain = gp.transformBlocks(body, matrix);
      const score = gp.stats(plain);
      results.push({
        family, orientation, name, ioc: score.ioc, top12: score.top12,
        first60: latin(plain.slice(0, 60))
      });
    }
  }
}
assert.equal(results.length, 128);
results.sort((a, b) => b.ioc - a.ioc);
const plainText = fs.readFileSync(
  path.join(R, 'resources', 'control', 'shakespeare_first300k.txt'), 'utf8');
const control = (plainText.match(/[A-Za-z]+/g) || [])
  .flatMap(gp.encodeEnglishWord).slice(0, 716);
assert.equal(control.length, 716);
const plantedCipher = gp.transformBlocks(control, square.map((row) => row.map(gp.mod)));
const recovered = gp.transformBlocks(plantedCipher,
  gp.matrixInverse(square.map((row) => row.map(gp.mod))));
assert.deepStrictEqual(recovered, control);
assert.ok(results[0].ioc < 0.041);
assert.ok(gp.stats(control).ioc > 0.052);
console.log('PASS source p0–2 729-runic first chapter, red heading13, black body716=179*4');
console.log('PASS all four source matrices, 8 dihedrals, 4 directions = 128 exact inverses');
console.log('PASS source-native English Hill4 plant recovers all 716 runes');
console.log('Original red heading: ' + latin(red));
console.log('Original black-body IoC: ' + gp.stats(body).ioc.toFixed(12));
console.log('Best original-body IoC: ' + results[0].ioc.toFixed(12));
console.log('Best configuration: ' + JSON.stringify(results[0]));
console.log('All-config IoC range: ' +
  Math.min(...results.map((r) => r.ioc)).toFixed(12) + '–' +
  Math.max(...results.map((r) => r.ioc)).toFixed(12));
console.log('Native English plant IoC: ' + gp.stats(control).ioc.toFixed(12));
console.log('NO AUTHENTIC UNKNOWN PLAINTEXT OR KEY RECOVERED');
