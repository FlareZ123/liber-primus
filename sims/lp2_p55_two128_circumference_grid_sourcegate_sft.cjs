'use strict';
/**
 * Source-fixed LP2 terminal 128+128 table hypothesis with 85 known pair controls.
 * 32x8 table halves are placed against p55 word interiors + decoded p56,
 * and p55 word exteriors + clear p57. Original unknown p55 is withheld.
 * A genuine repeated direct GP/prime key must cancel at all 85 shared slots.
 *
 * Run: node sims/lp2_p55_two128_circumference_grid_sourcegate_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {encodeSourceNativeGP} = require('./lp2_native_gp_source_orthography_sft.cjs');
const {parseWords, splitWord} = require('./lp2_p57_literal_word_circumference_sft.cjs');
const root = path.resolve(__dirname, '..');
/** @param {string} file @returns {string} */
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const ref = read('resources/liber-primus/lp1-plaintext-reference.txt');
const transcribed = read('resources/liber-primus/lp2-transcription.txt');
const index = new Map(gp.runes.map((rune, i) => [rune, i]));
const p55Text = transcribed.split('%')[54];
const p55 = parseWords(p55Text);
const p55Cipher = gp.pages.find((page) => page.page === 55).indices;
assert.deepEqual([...p55.runes].map((rune) => index.get(rune)), p55Cipher);
assert.equal(p55Cipher.length, 76);
assert.equal(p55.words.length, 17);
const divided = p55.words.map(splitWord);
const interiors = divided.map((w) => w.inside).join('');
const exteriors = divided.map((w) => w.outside).join('');
assert.equal(interiors.length, 43);
assert.equal(exteriors.length, 33);
assert.equal(divided.map((w) => w.inside + w.outside).join('').length, 76);
const ref56 = ref.split('### 56\n')[1].split('### 57\n')[0]
  .replace(/^[0-9a-f]{32,}$/gmi, '');
const ref57 = ref.split('### 57\n')[1];
const plain56 = encodeSourceNativeGP(ref56);
const plain57 = encodeSourceNativeGP(ref57);
assert.equal(plain56.length, 85);
assert.equal(plain57.length, 95);
assert.deepEqual(plain57, gp.pages.find((page) => page.page === 57).indices);
const leftLength = interiors.length + plain56.length;
const rightLength = exteriors.length + plain57.length;
assert.deepEqual([leftLength, rightLength, grid.bytes.length], [128, 128, 256]);
const tableHash = crypto.createHash('sha256').update(Buffer.from(grid.bytes)).digest('hex');
assert.equal(tableHash, '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const left = grid.bytes.slice(0, 128);
const right = grid.bytes.slice(128);
const paired = Array.from({length:85}, (_, i) => {
  const position = i + 43;
  return {position, left: left[position], right: right[position],
    first: plain56[i], second: plain57[i+10]};
});
/** @param {number} value @param {number} n @returns {number} */
const mod = (value, n) => ((value % n) + n) % n;
/** @param {Array<{left:number,right:number,first:number,second:number}>} rows @param {(entry:any)=>boolean} fn @returns {number} */
const count = (rows, fn) => rows.reduce((n, entry) => n + Number(fn(entry)), 0);
const sharedXorGP = count(paired, (x) => (x.left ^ x.right) === (x.first ^ x.second));
const sharedXorPrime = count(paired, (x) => (x.left ^ x.right) ===
  (gp.prime[x.first] ^ gp.prime[x.second]));
const sharedAdd256GP = count(paired, (x) => mod(x.left-x.right,256) === mod(x.first-x.second,256));
const sharedAdd256Prime = count(paired, (x) => mod(x.left-x.right,256) ===
  mod(gp.prime[x.first]-gp.prime[x.second],256));
const sharedAdd29GP = count(paired, (x) => mod(x.left-x.right,29) === mod(x.first-x.second,29));
const sharedAdd29Prime = count(paired, (x) => mod(x.left-x.right,29) ===
  mod(gp.prime[x.first]-gp.prime[x.second],29));
const sharedAdd29GPReverse = count(paired, (x) => mod(x.right-x.left,29) ===
  mod(x.first-x.second,29));
/**
 * Exact minimum edits of known source GP words under a completely unknown,
 * arbitrary deterministic single-byte-to-GP substitution table.
 * @param {number[]} half
 * @param {number} begin
 * @param {number[]} known
 * @returns {{minimumEdits:number, duplicateInputEvents:number,distinctInputs:number}}
 */
function fixedLookupLowerBound(half, begin, known) {
  const groups = new Map();
  for (let i=0;i<known.length;i++) {
    const key = half[begin+i];
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(known[i]);
  }
  let minimumEdits = 0;
  for (const runes of groups.values()) {
    const frequency = new Map();
    for (const rune of runes) frequency.set(rune, (frequency.get(rune) || 0) + 1);
    minimumEdits += runes.length - Math.max(...frequency.values());
  }
  return {minimumEdits, duplicateInputEvents:known.length - groups.size, distinctInputs:groups.size};
}
const lookupP56 = fixedLookupLowerBound(left, 43, plain56);
const lookupP57 = fixedLookupLowerBound(right, 33, plain57);
assert.deepEqual([sharedXorGP, sharedXorPrime, sharedAdd256GP, sharedAdd256Prime,
  sharedAdd29GP, sharedAdd29Prime, sharedAdd29GPReverse], [0,0,0,0,2,3,4]);
assert.deepEqual(lookupP56, {minimumEdits:11,duplicateInputEvents:11,distinctInputs:74});
assert.deepEqual(lookupP57, {minimumEdits:13,duplicateInputEvents:15,distinctInputs:80});
const output = {
  conclusion: 'no source-selected plaintext; bounded negative on shared direct stream and stationary byte lookup',
  terminalPageRunes: [76,85,95], p55PrintedWords:17,
  p55InteriorRunes:43, p55ExteriorRunes:33,
  sourceHalfLengths: [leftLength,rightLength],
  sourceTableSha256:tableHash,knownPairedPositions:paired.length,
  sharedPadMatches: {xorGP:sharedXorGP,xorPrime:sharedXorPrime,
    additive256GP:sharedAdd256GP,additive256Prime:sharedAdd256Prime,
    additive29GP:sharedAdd29GP,additive29Prime:sharedAdd29Prime,
    additive29ReversedGP:sharedAdd29GPReverse},
  independentStaticLookup: {p56:lookupP56,p57:lookupP57}
};
if (require.main === module) console.log(JSON.stringify(output, null, 2));
module.exports = {fixedLookupLowerBound, output};
