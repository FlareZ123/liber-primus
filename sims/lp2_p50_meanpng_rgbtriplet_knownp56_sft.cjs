'use strict';

/**
 * One source-fixed p50 Meanpng RGB-triplet 85-rune consumer against
 * independently established, authentically solved p56.
 *
 * Physical p49-51 numerals provide 256 base60 bytes. Cell 0 = 3N =203;
 * after treating it as a header, remaining 255 = 85 whole RGB triples.
 * Conditional "Meanpng" suggests arithmetic mean of each triple.
 *
 * No key, phase, permutation or cipher mode is fitted to p56.
 * Windows Node.js 22: node sims/lp2_p50_meanpng_rgbtriplet_knownp56_sft.cjs
 * This is a candidate test, not a claimed original decipherment.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

/** @param {string} relative @returns {unknown} */
function readJson(relative) {
  return JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
}
const table = readJson('resources/liber-primus/base60-grid.json');
const gp = readJson('resources/liber-primus/lp2-corpus.json');
assert.equal(table.alphabet, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx');
const all = table.byte_rows.flat();
assert.equal(table.rows.length, 32);
assert.ok(table.rows.every(row => row.length === 8));
assert.equal(all.length, 256);
assert.equal(table.rows[0][0], '3N');
assert.equal(all[0], 203);
const rgb = all.slice(1);
assert.equal(rgb.length, 3 * 85);

/** @param {number[]} bytes @returns {number} */
function meanRgb(bytes) {
  assert.equal(bytes.length, 3);
  return Math.round((bytes[0] + bytes[1] + bytes[2]) / 3);
}
const triples = Array.from({length:85}, (_, i) => rgb.slice(3*i, 3*i + 3));
const byteMeans = triples.map(meanRgb);
const key = byteMeans.map(x => x % 29);
const ciphertext = gp.pages.find(page => page.page === 56).indices;
assert.equal(ciphertext.length, 85);

/** Authentic independently established known p56 plaintext in GP orthography. */
const words = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';

/** @param {string} text @returns {number[]} */
function latinToGp(text) {
  const tokens = gp.translit.map((token, index) => ({token,index})).sort((a,b) => b.token.length - a.token.length);
  const decoded = [];
  for (const word of text.split(' ')) {
    for (let i=0; i<word.length;) {
      const match = tokens.find(x => word.startsWith(x.token, i));
      assert.ok(match, 'Missing GP token in known p56 plaintext');
      decoded.push(match.index);
      i += match.token.length;
    }
  }
  return decoded;
}
const known = latinToGp(words);
assert.equal(known.length, ciphertext.length);

/** @param {number[]} source @param {number[]} mask @returns {number[]} */
function minusMask(source, mask) {
  return source.map((x,i) => (x - mask[i] + 29) % 29);
}
const output = minusMask(ciphertext, key);
const matchingPositions = output.flatMap((rune, i) => rune === known[i] ? [i] : []);
const counts = new Uint16Array(29);
for(const rune of output)counts[rune]++;
const ioc = counts.reduce((sum, n) => sum + n * (n - 1), 0) / (85 * 84);
assert.deepEqual(matchingPositions, [24,68]);
assert.ok(Math.abs(ioc - 0.03137254901960784) < 1e-12);
assert.notDeepEqual(output, known);
const positiveCipher = known.map((rune, i) => (rune + key[i]) % 29);
assert.deepEqual(minusMask(positiveCipher, key), known);
assert.equal(positiveCipher.length, 85);
console.log(JSON.stringify({
  frozenSource: 'p50 first 3N=203 header, remaining 255 original base60 cells as 85 RGB triples',
  tripleCount: triples.length,
  meanRule: 'nearest-integer (R+G+B)/3; mod29; subtract from complete p56 ciphertext',
  sourceCipherRunes: ciphertext.length,
  genuineP56KnownPlaintextRunes: known.length,
  exactPositionMatches: matchingPositions.length,
  matchingPositions,
  decodedIndexOfCoincidence: ioc,
  decodedOpening: output.slice(0, 20).map(i => gp.translit[i]).join('-'),
  knownOpening: known.slice(0, 20).map(i => gp.translit[i]).join('-'),
  nativeGpPlantExactRecovered: 85,
  verdict: 'No p56 plaintext; only this frozen direct original-grid key receiver excluded'
}, null, 2));
console.log('PASS: source-fixed p50 Meanpng RGB triplet recipient is negative on known p56.');
