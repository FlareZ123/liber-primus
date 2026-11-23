'use strict';

/**
 * One source-bounded 256-byte table integrity-to-p56 digest receiver test.
 *
 * INPUT: original p49–p51 32x8 base60 grid, authenticated Stage10 1033
 * magic-sum target, original physical page 50, and solved p56's published
 * 128-hex web-page digest. No language scoring, seed, key, XOR or offsets.
 *
 * Node.js 22, CommonJS:
 *   node sims/lp2_p50_missing50_digest_gate_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

const grid = JSON.parse(fs.readFileSync(path.join(
  __dirname, '..', 'resources', 'liber-primus', 'lp2-grid-256.json'
), 'utf8'));
const raw = Buffer.from(grid.bytes);
const target = '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';
const printedTokens = grid.pages.flatMap((page) => page.tokens);

assert.equal(target.length, 128);
assert.equal(raw.length, 256);
assert.equal(grid.pages.reduce((n, page) => n + page.rows, 0), 32);
assert.equal(grid.pages.reduce((n, page) => n + page.cols * page.rows, 0), 256);
assert.equal(raw.reduce((n, byte) => n + byte, 0), 33006);
assert.equal(32 * 1033 - raw.reduce((n, byte) => n + byte, 0), 50);
assert.equal(raw.includes(50), false);
assert.equal(printedTokens.includes('0o'), false);

const sumFirstRadixDigits = printedTokens.reduce((sum, token) =>
  sum + grid.alphabet.indexOf(token[0]), 0);
assert.equal(sumFirstRadixDigits, 424);
assert.equal(33006 - sumFirstRadixDigits, 32582); // base59 rival

/** @param {Buffer} bytes @returns {string} */
const sha512 = (bytes) => createHash('sha512').update(bytes).digest('hex');

const hits = [];
let tests = 0;
/** @param {Buffer} bytes @param {string} label */
const compare = (bytes, label) => {
  tests += 1;
  if (sha512(bytes) === target) hits.push(label);
};

// Literal table; single omitted page-index-50 byte at every full-file position.
compare(raw, 'original table');
for (let pos = 0; pos <= raw.length; pos += 1) {
  const candidate = Buffer.concat([
    raw.subarray(0, pos), Buffer.from([50]), raw.subarray(pos)
  ]);
  compare(candidate, `insert byte 50 at offset ${pos}`);
}

// Source-constrained rival: the total is four short of 10*3301.
// Replacing one of the two printed 0k (=46) cells with missing 0o (=50)
// would make the sum exactly 33010, but two choices remain.
const duplicates46 = [];
const duplicates248 = [];
for (let pos = 0; pos < raw.length; pos += 1) {
  if (raw[pos] === 46) duplicates46.push(pos);
  if (raw[pos] === 248) duplicates248.push(pos);
}
assert.deepEqual(duplicates46, [78, 141]);
assert.deepEqual(duplicates248, [159, 167]);
assert.equal(raw.includes(252), false);
for (const pos of duplicates46) {
  const candidate = Buffer.from(raw);
  candidate[pos] = 50;
  assert.equal(candidate.reduce((n, b) => n + b, 0), 10 * 3301);
  compare(candidate, `one 46→50 substitution at offset ${pos}`);
}
// Additional four-unit checksum rival: printed 48 (=248) could become
// missing 4C (=252), again giving two indeterminate positions.
for (const pos of duplicates248) {
  const candidate = Buffer.from(raw);
  candidate[pos] = 252;
  assert.equal(candidate.reduce((n, b) => n + b, 0), 10 * 3301);
  compare(candidate, `one 248→252 substitution at offset ${pos}`);
}
assert.equal(tests, 262);

console.log('PASS: p50 32×8 row-major base60-byte source checks');
console.log('PASS: literal sum + central page index = 32 × 1033: 33006 + 50 = 33056');
console.log('PASS: base59 rival sum 32582; original byte50 absent; 4-unit rivals nonunique');
console.log('SHA-512 candidates tested:', tests);
console.log('Exact match to original p56 deep-web digest:', hits.length);
if (hits.length) console.log('CANDIDATE ORIGINAL OBJECTS:', JSON.stringify(hits));
else console.log('NO MATCH: these 262 literal/one-erasure/one-substitution byte objects are not the SHA-512 p56 target');
