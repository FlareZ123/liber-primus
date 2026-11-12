'use strict';

/**
 * One original-cipher gate: the printed 32x8 numerical table reshaped in
 * source order into 16x16, one row per 16 identically framed floral pages.
 * Node.js 22, no external modules. This is a tested hypothesis, not a key.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
/** @param {string} relative */
const read = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const corpus = read('resources/liber-primus/lp2-corpus.json');
const grid = read('resources/liber-primus/base60-grid.json');
/** @param {number} n */
const mod29 = (n) => (n % 29 + 29) % 29;

/** @param {number[]} values */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (values.length * (values.length - 1));
}

/** Convert independent prose to the repository's native GP29 rune register.
 * @param {string} source
 * @returns {number[]}
 */
function nativeGp(source) {
  const text = source.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/K/g, 'C').replace(/Z/g, 'S')
    .replace(/ING/g, 'NG').replace(/[^A-Z]/g, '');
  const tokens = corpus.translit.map((spelling, index) => ({spelling, index}))
    .sort((a, b) => b.spelling.length - a.spelling.length);
  const values = [];
  for (let i = 0; i < text.length;) {
    const match = tokens.find((token) => text.startsWith(token.spelling, i));
    if (match) {
      values.push(match.index);
      i += match.spelling.length;
    } else {
      i++;
    }
  }
  return values;
}

const bytes = grid.byte_rows.flat();
assert.deepEqual(grid.page_row_counts, [10, 13, 9]);
assert.equal(bytes.length, 256);
assert.equal(grid.rows.flat().length, 256);
const alphabet = grid.alphabet;
assert.equal(alphabet.length, 60);
for (let i = 0; i < bytes.length; i++) {
  const token = grid.rows.flat()[i];
  assert.equal(60 * alphabet.indexOf(token[0]) + alphabet.indexOf(token[1]), bytes[i]);
}
const sha = crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex');
assert.equal(sha, '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

const floral = corpus.pages.filter((page) => page.page >= 40 && page.page <= 55);
assert.equal(floral.length, 16);
assert.equal(floral[10].page, 50);
assert.equal(floral[10].indices.length, 0);

/** Key at rune offset i of original floral physical page j.
 * @param {number} pageRow Zero-based physical page within 40..55.
 * @param {number} runeOffset Zero-based page-local rune offset.
 */
function key(pageRow, runeOffset) {
  return bytes[pageRow * 16 + runeOffset % 16] % 29;
}

const raw = [];
const decoded = [];
const planted = [];
const solved = corpus.pages[57].indices;
assert.ok(solved.length > 0);
let verified = 0;
for (let j = 0; j < floral.length; j++) {
  const original = floral[j].indices;
  for (let i = 0; i < original.length; i++) {
    const k = key(j, i);
    const cipher = original[i];
    const plain = mod29(cipher - k);
    raw.push(cipher);
    decoded.push(plain);
    assert.equal(mod29(plain + k), cipher);
    verified++;

    const native = solved[planted.length % solved.length];
    const syntheticCipher = mod29(native + k);
    planted.push(mod29(syntheticCipher - k));
    assert.equal(planted.at(-1), native);
  }
}
assert.equal(raw.length, 3316);
assert.equal(verified, 3316);
const rawIoc = ioc(raw);
const decodedIoc = ioc(decoded);
const plantedIoc = ioc(planted);
assert.ok(Math.abs(rawIoc - 0.03446282660786315) < 1e-12);
assert.ok(Math.abs(decodedIoc - 0.03446937650442937) < 1e-12);
assert.ok(Math.abs(plantedIoc - 0.07222116089638973) < 1e-12);

const nativeText = fs.readFileSync(path.join(root, 'resources/control/gibran_prophet_58585.txt'), 'utf8');
const native = nativeGp(nativeText);
const controls = [];
for (let i = 0; i + raw.length <= native.length; i += raw.length) {
  controls.push(ioc(native.slice(i, i + raw.length)));
}
assert.equal(controls.length, 18);
assert.ok(Math.min(...controls) > 0.05);
assert.ok(decodedIoc < Math.min(...controls));
console.log(JSON.stringify({
  sourceByteSHA256: sha,
  cipherRunes: raw.length,
  floralPhysicalPages: floral.map((page) => page.page),
  runelessPhysicalPage: 50,
  keyClock: 'page j=physicalPage-40; cell 16*j+(localRuneOffset mod 16); modulo29',
  rawIoC: rawIoc,
  decodedIoC: decodedIoc,
  solvedP57PlantedIoC: plantedIoc,
  nativeControl: {source: 'Gibran', windows: controls.length,
    minimum: Math.min(...controls), maximum: Math.max(...controls)},
  exactOriginalReencrypt: verified,
  decodedPrefix: decoded.slice(0, 45).map((x) => corpus.translit[x]).join('-'),
  verdict: 'Direct floral16/grid256 additive inverse fails to recover native GP29 plaintext'
}, null, 2));
