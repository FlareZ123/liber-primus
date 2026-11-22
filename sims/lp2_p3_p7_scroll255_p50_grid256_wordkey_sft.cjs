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
// Stronger physical adjacency control: the next LP2 page p8 prints precisely
// 255 runes, giving one original adjacent-source GP symbol per scroll word.
const nextPage = corpus.pages.find((p) => p.page === 8).indices;
assert.equal(nextPage.length, 255);
const neighbors = [
  [false, 1, 0.03443521543958225],
  [false, -1, 0.03450850459584084],
  [true, 1, 0.034261153693468105],
  [true, -1, 0.03436956057043393],
];
for (const [reverse, sign, expectedIoc] of neighbors) {
  const key = reverse ? nextPage.slice().reverse() : nextPage;
  const decoded = applyWords(tape, key, 0, sign);
  const measured = ioc(decoded);
  assert(Math.abs(measured - expectedIoc) < 1e-14);
  assert.deepEqual(applyWords(decoded, key, 0, -sign), tape);
  assert.deepEqual(applyWords(applyWords(known, key, 0, -sign), key, 0, sign), known);
  assert(measured < 0.035);
  console.log(`adjacent p8 key reverse=${reverse} sign=${sign}: original IoC ${measured.toFixed(9)}, planted ${known.length}/${known.length}`);
}
// Exploratory direct GP29-index word-sum alignment to the immediately
// following 255-rune page. This observation was found during a broad search;
// treat it as a possible structural marker, never an authenticated decoder.
const wordSums = words.map((w) => mod(w.reduce((sum, x) => sum + x, 0)));
const coincident = (key, shift = 0) => wordSums.reduce((n, x, j) => n + (x === key[(j + shift) % key.length] ? 1 : 0), 0);
assert.equal(coincident(nextPage), 20);
const rotations = Array.from({ length: 255 }, (_, shift) => coincident(nextPage, shift));
assert.equal(Math.max(...rotations.slice(1)), 17);
assert.equal(rotations.filter((n) => n >= 20).length, 1);
const alternatePages = corpus.pages
  .filter((p) => p.page >= 9 && p.page <= 55 && p.indices.length >= 255)
  .map((p) => ({ page: p.page, matches: coincident(p.indices.slice(0, 255)) }));
assert.equal(Math.max(...alternatePages.map((p) => p.matches)), 14);
const directDifference = wordSums.map((v, j) => mod(nextPage[j] - v));
assert(Math.abs(ioc(directDifference) - 0.035602902578354176) < 1e-14);
console.log('EXPLORATORY source-word-sum/p8 equality: 20/255 at phase0, max17 at other 254 rotations, max14 on other 255+-rune page prefixes; difference IoC 0.035602903');
// Multiplicative rival to the additive key: the p7 red packet already uses
// literal GP29 products, so test any wholly unknown per-word field multiplier
// without guessing multipliers. The zero element cannot move under multiplication.
const wordProducts = words.map((w) => mod(w.reduce((v, x) => v * x, 1)));
const zeroContradictions = (values) => values.flatMap((value, j) =>
  value === 0 && nextPage[j] !== 0 ? [j] : []);
const sumObstructions = zeroContradictions(wordSums);
const productObstructions = zeroContradictions(wordProducts);
assert.equal(wordSums.filter((x) => x === 0).length, 9);
assert.equal(wordProducts.filter((x) => x === 0).length, 26);
assert.deepEqual(sumObstructions, [18, 50, 82, 132, 148, 224, 230]);
assert.equal(productObstructions.length, 26);
assert.equal(productObstructions.every((j) => wordProducts[j] === 0 && nextPage[j] !== 0), true);
const gpNativePlant = Array.from({ length: 255 }, (_, j) => gp[j % gp.length]);
for (const donor of [wordSums, wordProducts]) {
  // A positive matched-target source may obey a secret per-word multiplier
  // iff the source is zero exactly where a nonzero output is forbidden.
  const planted = donor.map((v, j) => mod(v * (j % 28 + 1)));
  assert.equal(zeroContradictions(donor.map((v, j) =>
    v === 0 ? 0 : mod(planted[j] * modInverse29(v)))), 0);
}
/** @param {number} value @returns {number} */
function modInverse29(value) {
  assert(value > 0 && value < 29);
  for (let i = 1; i < 29; i++) if (mod(value * i) === 1) return i;
  throw Error('Nonzero GP29 element has no inverse');
}
console.log('all-secret multiplicative source-p8 obstructions: 7/9 zero-sum sites and 26/26 zero-product sites force impossible p8 symbols');
console.log('PASS: source 255-word scroll, grid256 8 inverses, adjacent p8 255-rune 4 inverses, 12 full GP-native plaintext plants');
