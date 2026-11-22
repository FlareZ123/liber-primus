/**
 * Source-locked sixteen-word 2016 signed clause -> p50 AES-128 test.
 * Read-only, Node.js 22/CommonJS, no external dependencies.
 * Run from repository root: node sims/lp2_signed16_aes128_sft.cjs
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const signed = fs.readFileSync(path.join(root, 'resources/historical/cicada2016-4gq25-outguess.asc'), 'utf8');
const gp = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
assert.equal(gp.translit.length, 29);
assert.equal(gp.prime.length, 29);
assert.equal(grid.bytes.length, 256);
const ciphertext = Buffer.from(grid.bytes);
assert.equal(crypto.createHash('sha256').update(ciphertext).digest('hex'), '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

// The 2016 signed source has exactly sixteen words in this clause. The original
// p15 has sixteen numerals and p50 has sixteen AES-sized blocks. The bridge
// to AES and use of mod256 are test hypotheses, not instructions from Cicada.
const match = signed.match(/Its words are the map,\s+their\s+meaning is the road, and their numbers are the direction\./i);
assert.ok(match, '2016 signed clause not present');
const words = match[0].toUpperCase().replace(/[^A-Z ]/g, ' ').split(/\s+/).filter(Boolean);
assert.deepEqual(words, ['ITS','WORDS','ARE','THE','MAP','THEIR','MEANING','IS','THE','ROAD','AND','THEIR','NUMBERS','ARE','THE','DIRECTION']);
assert.equal(words.length, 16);

const graphemes = gp.translit.map((name, index) => ({name, index})).sort((a, b) => b.name.length - a.name.length);
/** @param {string} word @returns {number[]} */
function nativeGpIndices(word) {
  const result = [];
  let w = word.replaceAll('V','U').replaceAll('K','C').replaceAll('Q','C').replaceAll('Z','S');
  while (w.length) {
    const found = graphemes.find(({name}) => w.startsWith(name));
    assert.ok(found, 'unknown GP grapheme: '+w);
    result.push(found.index);
    w = w.slice(found.name.length);
  }
  return result;
}
const sums = words.map(w => nativeGpIndices(w).reduce((n, i) => n + gp.prime[i], 0));
assert.deepEqual(sums, [143,179,175,72,211,114,319,84,72,204,215,114,295,175,72,337]);
const key = Buffer.from(sums.map(n => n % 256));
assert.equal(key.toString('hex'), '8fb3af48d3723f5448ccd77227af4851');

/** @param {Buffer} b @returns {{printable: number, longest: number}} */
function printableStats(b) {
  let printable = 0, longest = 0, current = 0;
  for (const x of b) {
    if ((x >= 32 && x <= 126) || x === 9 || x === 10 || x === 13) {
      printable += 1;
      current += 1;
      longest = Math.max(longest, current);
    } else current = 0;
  }
  return { printable, longest };
}
const modes = [
  ['ECB', 'aes-128-ecb', null, 100, '97a9786158a45afba7a1809b75637ca726f35c8f0746588d899bb736db9046f7'],
  ['CBC', 'aes-128-cbc', Buffer.alloc(16), 98, 'e8322f22ddd589e7bbe9bc491f9edcc3f7ca4ca7ffa7c844fb06a5c8b2d6ba30'],
  ['CTR', 'aes-128-ctr', Buffer.alloc(16), 91, '5289dcc0a36399bdeb3fb4c71aec414194a70809c15caf67beeb4e4498d71599']
];
/** @param {string} method @param {Buffer | null} iv @param {Buffer} input @param {boolean} encrypt @returns {Buffer} */
function aes(method, iv, input, encrypt) {
  const cipher = encrypt ? crypto.createCipheriv(method, key, iv) : crypto.createDecipheriv(method, key, iv);
  cipher.setAutoPadding(false);
  return Buffer.concat([cipher.update(input), cipher.final()]);
}
const originalPlainSample = Buffer.from(('THE PATH LIES EMPTY THE WORDS ARE THE MAP '.repeat(8)).slice(0,256), 'ascii');
assert.equal(originalPlainSample.length, 256);
const results = [];
for (const [name, alg, iv, expectedPrintable, expectedSha] of modes) {
  const decoded = aes(alg, iv, ciphertext, false);
  assert.deepEqual(aes(alg, iv, decoded, true), ciphertext);
  assert.deepEqual(aes(alg, iv, aes(alg, iv, originalPlainSample, true), false), originalPlainSample);
  const hash = crypto.createHash('sha256').update(decoded).digest('hex');
  assert.equal(hash, expectedSha);
  const stats = printableStats(decoded);
  assert.equal(stats.printable, expectedPrintable);
  assert.equal(stats.longest, 5);
  results.push({name, printable:stats.printable, longest:stats.longest, first32:decoded.subarray(0,32).toString('hex'), sha256:hash});
}
console.log(JSON.stringify({signedClauseWords:words, sourceGematriaPrimeSums:sums, keyHex:key.toString('hex'), tableSha256:'3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290', results, verdict:'No ASCII or binary file header plaintext under these three direct AES-128 modes; no LP2 unknown text recovered'},null,2));
