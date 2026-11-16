'use strict';
/**
 * Authenticated LP1 solved red-title dual-mode control for Director #1211.
 * Original first-line red rubrics in LP1 03.jpg, 10.jpg, 14.jpg.
 * LP1 p03 and p10 are literally printed; p14 requires its historically
 * solved FIRFUMFERENFE 13-rune key continuously through red title/body.
 * Exact GP29 source runes and independent known-p14 first 49-run text.
 * Node.js 22 CommonJS, no external packages.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const gp = JSON.parse(fs.readFileSync(path.join(root,
  'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const blocks = fs.readFileSync(path.join(root,
  'resources/transcriptions/lp1_wulfic_canonical.txt'), 'utf8')
  .split(/\n%\n/);
const index = new Map(gp.runes.map((rune, i) => [rune, i]));
const mod = x => ((x % 29) + 29) % 29;

/** @param {string} line @returns {number[]} */
function tokenize(line) {
  return [...line].filter(rune => index.has(rune)).map(rune => index.get(rune));
}
/** @param {number} block @returns {number[]} */
function title(block) {
  return tokenize(blocks[block].split('.')[0]);
}
/** @param {number[]} runes @returns {string} */
function translit(runes) {
  return runes.map(i => gp.translit[i]).join('');
}
/** @param {number[]} plain @param {number[]} key @returns {number[]} */
function encodeBeforeF(plain, key) {
  return plain.map((rune, i) => mod(rune + key[i % key.length]));
}
/** @param {number[]} cipher @param {number[]} key @returns {number[]} */
function decodeBeforeF(cipher, key) {
  return cipher.map((rune, i) => mod(rune - key[i % key.length]));
}

const title03 = title(3);
const title10 = title(8);
const title14 = title(12);
assert.equal(title03.length, 10);
assert.equal(title10.length, 16);
assert.equal(title14.length, 5);
assert.equal(translit(title03), 'SOMEWISDOM');
assert.equal(translit(title10), 'THELOSSOFDIUINITY');
assert.equal(translit(title14), 'ASWAI');

// Genuine historical 13-symbol LP1 second-koan keyword, GP notation.
const keyword = [0,10,4,0,1,19,0,18,4,18,9,0,18];
const koan = tokenize(blocks[12]);
assert.equal(koan.length, 226);
assert.deepEqual(koan.slice(0,5), title14);
const decodedTitle = decodeBeforeF(title14, keyword);
assert.equal(translit(decodedTitle), 'ACOAN'); // GP C represents English K.
assert.deepEqual(encodeBeforeF(decodedTitle, keyword), title14);

// The exact historically solved plaintext independently begins:
// A KOAN. DURING A LESSON THE MASTER EXPLAINED THE I ...
// GP-normalized K=>C, V=>U and ING=>single NG rune.
// Up to the first true plaintext-F (absolute original koan offset49),
// this same key MUST advance continuously, including past the red title.
const prefix49 = koan.slice(0,49);
const deciphered49 = decodeBeforeF(prefix49, keyword);
const expectedWords = [
  'A','COAN','DURNG','A','LESSON','THE','MASTER','EXPLAINED',
  'THE','I','THE','I','IS','THE','UOICE','O'
];
const validTokens = gp.translit.map((token,i) => ({token,i}))
  .sort((a,b) => b.token.length-a.token.length);
/** @param {string} word @returns {number[]} */
function gpWord(word) {
  const out = [];
  let offset = 0;
  while (offset < word.length) {
    const item = validTokens.find(x => word.startsWith(x.token, offset));
    assert.ok(item, 'GP spelling mismatch at ' + word.slice(offset));
    out.push(item.i);
    offset += item.token.length;
  }
  return out;
}
const expected49 = expectedWords.flatMap(gpWord);
assert.equal(expected49.length, 49);
assert.deepEqual(deciphered49, expected49);
assert.deepEqual(encodeBeforeF(expected49, keyword), prefix49);

// An entire red heading is successfully encoded while its black prose
// continues the SAME key clock. Reusing that cipher on genuinely literal
// red rubrics produces neither authentic title.
assert.notEqual(translit(decodeBeforeF(title03, keyword)), 'SOMEWISDOM');
assert.notEqual(translit(decodeBeforeF(title10, keyword)), 'THELOSSOFDIUINITY');

console.log(JSON.stringify({
  classification: 'original LP1 solved red-title dual mode; no unknown LP2 plaintext',
  originalScans: ['03.jpg', '10.jpg', '14.jpg'],
  titles: [
    {page:3,source:translit(title03),mode:'literal',runes:title03.length},
    {page:10,source:translit(title10),mode:'literal',runes:title10.length},
    {page:14,source:translit(title14),mode:'encrypted GP29',
      historicalKeyword:'FIRFUMFERENFE',decoded:translit(decodedTitle),
      clearReading:'A KOAN',runes:title14.length}
  ],
  completeSourcePrefixRoundtrip:prefix49.length,
  sourceExactTitle14Roundtrip:title14.length,
  firstFBypassAfterPrefixAt:49,
  conclusion:'Red lettering and initial capitalization do not choose emission mode; a first-party page-specific key/mode source remains necessary.'
}, null, 2));
