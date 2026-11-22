'use strict';
/**
 * Source p3-p7 five-scroll 255-word sequence as the 255 keyed entries of
 * the original p49-p51 256-token table (one endpoint reserved).
 * Simple complete, reversible word-constant GP29 addition only.
 * Windows 11 / Node.js 22 / CommonJS, read only, no CLI parameters.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(root, 'base60-grid.json'), 'utf8'));
const text = fs.readFileSync(path.join(root, 'lp2-transcription.txt'), 'utf8');
const alphabet = new Map(corpus.runes.map((r, i) => [r, i]));
const physical = text.split('%').slice(3, 8).join('').replace(/[\n\/&$]/g, '');
const words = physical.split(/[-.]/).map((part) =>
  [...part].filter((r) => alphabet.has(r)).map((r) => alphabet.get(r))
).filter((w) => w.length > 0);
const tape = corpus.pages.filter((p) => p.page >= 3 && p.page <= 7).flatMap((p) => p.indices);
assert.deepEqual([words.length, words.flat().length, tape.length], [255, 1145, 1145]);
assert.deepEqual(words.flat(), tape);
assert.deepEqual(corpus.pages.filter((p) => p.page >= 3 && p.page <= 7).map((p) => p.indices.length), [217, 261, 263, 196, 208]);
assert.deepEqual(grid.byte_rows.map((r) => r.length), Array(32).fill(8));
const row = grid.byte_rows.flat();
const ring = [];
for (let k = 0; k < 4; k++) {
  const top = k, bottom = 31 - k, left = k, right = 7 - k;
  for (let col = left; col <= right; col++) ring.push(grid.byte_rows[top][col]);
  for (let j = top + 1; j <= bottom; j++) ring.push(grid.byte_rows[j][right]);
  for (let col = right - 1; col >= left; col--) ring.push(grid.byte_rows[bottom][col]);
  for (let j = bottom - 1; j > top; j--) ring.push(grid.byte_rows[j][left]);
}
assert.equal(row.length, 256);
assert.equal(ring.length, 256);
assert.deepEqual([...row].sort((a, b) => a - b), [...ring].sort((a, b) => a - b));
/** @param {number} x @returns {number} */
const mod = (x) => ((x % 29) + 29) % 29;
/** @param {number[]} source @param {number[]} key @param {number} offset @param {number} sign @returns {number[]} */
function applyWords(source, key, offset, sign) {
  let i = 0;
  const out = [];
  for (let word = 0; word < words.length; word++) {
    const shift = mod(key[word + offset]);
    for (let k = 0; k < words[word].length; k++) out.push(mod(source[i++] + sign * shift));
  }
  assert.equal(i, 1145);
  return out;
}
/** @param {number[]} symbols @returns {number} */
function ioc(symbols) {
  const counts = Array(29).fill(0);
  for (const s of symbols) counts[s]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (symbols.length * (symbols.length - 1));
}
const expected = [
  ['printed', 0, -1, 0.034074877087977525],
  ['printed', 0, 1, 0.03420465996885211],
  ['printed', 1, -1, 0.034386356002076526],
  ['printed', 1, 1, 0.03465966348062418],
  ['peel', 0, -1, 0.03422908968760497],
  ['peel', 0, 1, 0.03441231257825144],
  ['peel', 1, -1, 0.034277949125110695],
  ['peel', 1, 1, 0.034510031453262896],
];
const gp = corpus.pages.find((p) => p.page === 57).indices;
assert.equal(gp.length, 95);
const known = Array.from({ length: tape.length }, (_, i) => gp[i % gp.length]);
assert(ioc(known) > 0.06);
for (const [mode, offset, sign, expectedIoc] of expected) {
  const key = mode === 'printed' ? row : ring;
  const originalDecoded = applyWords(tape, key, offset, sign);
  const measured = ioc(originalDecoded);
  assert(Math.abs(measured - expectedIoc) < 1e-14);
  assert.deepEqual(applyWords(originalDecoded, key, offset, -sign), tape);
  const planted = applyWords(known, key, offset, -sign);
  assert.deepEqual(applyWords(planted, key, offset, sign), known);
  const deciphered = originalDecoded.slice(0, 35).map((i) => corpus.translit[i]).join('');
  console.log(`${mode} skip=${offset} sign=${sign}: original IoC ${measured.toFixed(9)}, planted ${known.length}/${known.length}; ${deciphered}`);
  assert(measured < 0.035);
}
console.log('PASS: source 255-word scroll, complete 256-token table, eight 1145/1145 direct inverse and GP-native plants');
