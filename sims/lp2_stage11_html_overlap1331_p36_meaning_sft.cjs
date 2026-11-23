/**
 * 2014 Stage11 HTML 133/331 shortest-superstring key and p36 MEANING gate.
 * Source evidence is independent of LP2 cipher text; overlap as a key operation
 * is exploratory and not an authenticated Cicada instruction.
 * Windows Node.js 22, CommonJS, read-only, no external dependencies.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

/** @param {string} file @returns {string} */
function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

/** @param {string} left @param {string} right @returns {{overlap:number,merged:string}} */
function shortestOrderedOverlap(left, right) {
  for (let n = Math.min(left.length, right.length); n > 0; n--) {
    if (left.endsWith(right.slice(0, n))) {
      return {overlap: n, merged: left + right.slice(n)};
    }
  }
  return {overlap: 0, merged: left + right};
}

/** @param {number[]} values @param {number[]} key @param {-1 | 1} sign @returns {number[]} */
function shift(values, key, sign) {
  return values.map((x, i) => (x + 29 + sign * key[i % key.length]) % 29);
}

/** @param {number[]} runes @returns {number} */
function ioc(runes) {
  const freq = Array(29).fill(0);
  for (const x of runes) freq[x]++;
  return freq.reduce((s, n) => s + n * (n - 1), 0) /
    (runes.length * (runes.length - 1));
}

const html = read('resources/historical/stage11-2014-index.html');
const source = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const signed2016 = read('resources/historical/cicada2016-4gq25-outguess.asc');

const titleMatch = html.match(/<title>(\d+)<\/title>/);
const divMatch = html.match(/<div id="(\d+)">/);
assert.ok(titleMatch && divMatch);
const first = titleMatch[1];
const second = divMatch[1];
assert.equal(first, '133');
assert.equal(second, '331');
const hrefs = Array.from(html.matchAll(/<img src="(\d+)\.jpg"/g), (m) => Number(m[1]));
assert.deepEqual(hrefs, Array.from({length: 58}, (_, i) => i));
const overlap = shortestOrderedOverlap(first, second);
assert.deepEqual(overlap, {overlap: 2, merged: '1331'});
const key = [...overlap.merged].map(Number);
assert.deepEqual(key, [1, 3, 3, 1]);

// The 2016 plaintext is used as an independent proposed word target, not
// to fit the key. Its release postdates 2014, so this is retrospective.
assert.match(signed2016, /their\s+meaning is the road/i);

// Five authentic red-labelled units. p37->p38 label4 carries across
// the actual physical-page seam; no glyph is dropped or invented.
const rows = [
  source.pages[36].indices.slice(99, 238),
  source.pages[37].indices.slice(0, 91),
  source.pages[37].indices.slice(91, 189),
  source.pages[37].indices.slice(189, 228)
    .concat(source.pages[38].indices.slice(0, 57)),
  source.pages[38].indices.slice(57, 186),
];
assert.deepEqual(rows.map((v) => v.length), [139, 91, 98, 96, 129]);
for (const row of rows) for (const c of row) {
  assert.ok(Number.isInteger(c) && c >= 0 && c < 29);
}

const firstCipherword = rows[0].slice(0, 4);
assert.deepEqual(firstCipherword, [20, 2, 12, 22]);
const proposed = shift(firstCipherword, key, -1);
assert.deepEqual(proposed, [19, 28, 9, 21]); // canonical GP MEANING
assert.deepEqual(shift(proposed, key, 1), firstCipherword);

// Independent source-attributed 2016 'MEANING' requires the GP letter
// MEANING to be represented as M-EA-N-NG = [19,28,9,21].
assert.equal(proposed.map((v) => source.translit[v]).join(''), 'MEANNG');
assert.deepEqual(rows[1].slice(0, 4), [9, 26, 18, 14]);
assert.deepEqual(shift(rows[1].slice(0, 4), key, -1), [8, 23, 15, 13]);

// Precisely the full-passage key extension already shown to fail in the
// shared research; calculate only the fixed, untuned sign and reset.
const outcomes = rows.map((row, idx) => {
  const decoded = shift(row, key, -1);
  assert.deepEqual(shift(decoded, key, 1), row);
  return {
    section: idx + 1,
    runes: row.length,
    firstFour: decoded.slice(0, 4),
    iocOriginal: ioc(row),
    iocDecode: ioc(decoded),
  };
});
assert.ok(Math.abs(outcomes[0].iocDecode - 0.03597122302158273) < 1e-12);
assert.ok(Math.abs(outcomes[1].iocDecode - 0.03540903540903541) < 1e-12);
const all = rows.flat();
assert.equal(all.length, 553);
const allDecoded = shift(all, key, -1);
assert.deepEqual(shift(allDecoded, key, 1), all);
assert.ok(Math.abs(ioc(allDecoded) - 0.03395183059464842) < 1e-12);

// A planted source-English word confirms that the cipher operation is
// reversible without relying on one specific original ciphertext.
const positivePlain = [19, 28, 9, 21];
assert.deepEqual(shift(shift(positivePlain, key, 1), key, -1), positivePlain);

console.log(JSON.stringify({
  status: 'PASS',
  original2014HTML: {title: first, divId: second, images: hrefs.length},
  overlapKey: overlap,
  physicalReceiver: {page: 36, redSection: 1, indexRange: [99, 103]},
  ciphertextWord: firstCipherword,
  decodedWord: proposed,
  sourceWord2016: 'MEANING',
  note: 'Retrospective source-key concordance only, no full-item decryption',
  independentlyHeldOutSection2FirstFour: outcomes[1].firstFour,
  entireFiveUnitInverse: {totalRunes: all.length, ioc: ioc(allDecoded)},
  outcomes,
}, null, 2));
