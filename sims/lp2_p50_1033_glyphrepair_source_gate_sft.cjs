'use strict';
/**
 * Issue #2427. Frozen, original-source +50 checksum repair locus.
 * Node 22 CommonJS: node sims/lp2_p50_1033_glyphrepair_source_gate_sft.cjs
 * Computes all single-character one-cell radix60 +50 corrections, without
 * fitting page indices, clocks, keys, hashes, or ciphertext/plaintext.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const g = JSON.parse(fs.readFileSync(path.join(
  __dirname, '..', 'resources', 'liber-primus', 'lp2-grid-256.json'
), 'utf8'));
const b = Buffer.from(g.bytes);
const tokens = g.pages.flatMap(p => p.tokens);
const alphabet = g.alphabet;
const target = '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';
const repr = v => alphabet[Math.floor(v / 60)] + alphabet[v % 60];
const sha512 = x => createHash('sha512').update(x).digest('hex');
assert.equal(b.length, 256);
assert.equal(tokens.length, 256);
assert.equal(g.pages.reduce((a, p) => a + p.rows, 0), 32);
assert.equal(b.reduce((a, x) => a + x, 0), 33006);
assert.equal(32 * 1033 - 33006, 50);
assert.equal(b.includes(50), false);
for (let i = 0; i < 256; ++i) assert.equal(tokens[i], repr(b[i]));
const zeros = [];
const allRepairs = [];
const oneGlyphRepairs = [];
for (let i = 0; i < b.length; ++i) {
  if (b[i] === 0) zeros.push(i);
  const n = b[i] + 50;
  if (n > 255) continue;
  const newToken = repr(n);
  const originalToken = tokens[i];
  const hamming = (originalToken[0] !== newToken[0] ? 1 : 0)
                + (originalToken[1] !== newToken[1] ? 1 : 0);
  const fixed = Buffer.from(b);
  fixed[i] = n;
  assert.equal(fixed.reduce((a, x) => a + x, 0), 33056);
  const record = { offset: i, originalToken, newToken, hamming,
    p56DigestHit: sha512(fixed) === target };
  allRepairs.push(record);
  if (hamming === 1) oneGlyphRepairs.push(record);
}
assert.deepEqual(zeros, [192, 229]); // both are printed 00 on p51
assert.equal(allRepairs.length, 212);
assert.equal(oneGlyphRepairs.length, 32);
assert.deepEqual(oneGlyphRepairs.filter(r => r.originalToken === '00')
  .map(r => r.offset), [192, 229]);
assert.equal(allRepairs.filter(r => r.p56DigestHit).length, 0);
assert.equal(sha512(b) === target, false);
console.log('PASS: original 32x8 table sum 33006 and +50 deficit');
console.log('PASS: 212 in-range one-cell +50 repairs; 32 require only one printed-character change');
console.log('PASS: two 00>0o options at global offsets 192 and 229; neither source-selected');
console.log('PASS: none of 212 repairs matches original p56 SHA-512 digest');
console.log(JSON.stringify({oneGlyphRepairOffsets: oneGlyphRepairs.map(r => r.offset),
  rawSHA512: sha512(b), p56DigestHits: 0}));
