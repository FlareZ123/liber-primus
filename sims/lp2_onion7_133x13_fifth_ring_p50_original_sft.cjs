'use strict';
/**
 * Source-fixed Onion7 title 133 / LP2 p8–14 13×133 fifth-ring readout.
 * Input: original rune pages, original p50 256-cell table and 2014 HTML.
 * Run Node 22 in the repository root; writes nothing.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const load = file => fs.readFileSync(path.join(root, file), 'utf8');
const corpus = JSON.parse(load('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(load('resources/liber-primus/lp2-grid-256.json'));
const source = load('resources/cicada2014-onion7-index.html');
assert.match(source, /<title>133<\/title>/);
assert.match(source, /<div id="331">/);
const chapter = corpus.pages.filter(p => p.page >= 8 && p.page <= 14).flatMap(p => p.indices);
const tokens = grid.pages.flatMap(p => p.tokens);
assert.equal(chapter.length, 1729);
assert.equal(tokens.length, 256);
const slots = [];
for (let x = 4; x <= 128; x++) slots.push(4 * 133 + x);
for (let y = 5; y <= 8; y++) slots.push(y * 133 + 128);
for (let x = 127; x >= 4; x--) slots.push(8 * 133 + x);
for (let y = 7; y > 4; y--) slots.push(y * 133 + 4);
assert.equal(slots.length, 256);
assert.equal(new Set(slots).size, 256);
const ring = slots.map(i => chapter[i]);
/** @param {number[]} a @returns {number} */
function pairs(a) {
  const counts = Array(29).fill(0);
  for (const x of a) counts[x]++;
  return counts.reduce((sum, n) => sum + n * (n - 1) / 2, 0);
}
/** @param {number[]} a @returns {number} */
function ioc(a) { return 2 * pairs(a) / (a.length * (a.length - 1)); }
/** @param {string} alphabet @returns {number[]} */
function addresses(alphabet) {
  return tokens.map(s => {
    assert.equal(s.length, 2);
    const high = alphabet.indexOf(s[0]);
    const low = alphabet.indexOf(s[1]);
    assert.ok(high >= 0 && low >= 0);
    const address = alphabet.length * high + low;
    assert.ok(address >= 0 && address < 256);
    return address;
  });
}
assert.equal(pairs(ring), 1117);
console.log('SOURCE chapter1729=13x133 ring-depth4=256 ringIoC=' + ioc(ring).toFixed(12));
/** @type {{base:number,direction:string,locations:number[],observed:number}[]} */
const cases = [];
const expected = {'60-CW':1179,'60-CCW':1320,'59-CW':1184,'59-CCW':1317};
for (const [base,alphabet] of [[60,grid.alphabet],[59,grid.alphabet.replace('f','')]]) {
  assert.equal(alphabet.length, base);
  const pointer = addresses(alphabet);
  for (const orientation of ['CW','CCW']) {
    const locations = pointer.map(i => orientation === 'CW' ? i : (256 - i) % 256);
    const readout = locations.map(i => ring[i]);
    const observed = pairs(readout);
    assert.equal(observed, expected[String(base) + '-' + orientation]);
    cases.push({base,direction:orientation,locations,observed});
    console.log('ORIGINAL base=' + base + ' direction=' + orientation +
      ' pairs=' + observed + ' IoC=' + ioc(readout).toFixed(12) +
      ' first25=' + readout.slice(0,25).map(i => corpus.translit[i]).join(' '));
  }
}
// Shuffle the 256 original ring locations, keeping the original histogram and
// exact p50 pointer repetitions. Xorshift32 seed fixed before null comparison.
let state = 0xb13a322;
/** @returns {number} */
function random32() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
for (const test of cases) {
  state = 0xb13a322;
  const shuffled = ring.slice();
  let sum = 0, sumSquares = 0, upper = 0, lower = 0;
  for (let rep = 0; rep < 5000; rep++) {
    for (let i = 255; i > 0; i--) {
      const j = random32() % (i + 1);
      [shuffled[i],shuffled[j]] = [shuffled[j],shuffled[i]];
    }
    const count = pairs(test.locations.map(i => shuffled[i]));
    sum += count;
    sumSquares += count * count;
    if (count >= test.observed) upper++;
    if (count <= test.observed) lower++;
  }
  const mean = sum / 5000;
  const sd = Math.sqrt(sumSquares / 5000 - mean * mean);
  console.log('NULL base=' + test.base + ' direction=' + test.direction +
    ' mean=' + mean.toFixed(4) + ' sd=' + sd.toFixed(4) +
    ' z=' + ((test.observed - mean) / sd).toFixed(4) +
    ' tailUpper=' + ((upper+1)/5001).toFixed(5) +
    ' tailLower=' + ((lower+1)/5001).toFixed(5));
}
console.log('PASS: 4 exact source readouts and 5000 fixed-seed conditional nulls each');