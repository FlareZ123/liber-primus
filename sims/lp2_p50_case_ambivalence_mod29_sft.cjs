'use strict';

/**
 * Original LP2 numeric-panel I/l glyph ambiguity, source read-only SFT.
 * Run on Windows Node.js 22 from the project root:
 * node sims/lp2_p50_case_ambivalence_mod29_sft.cjs
 *
 * The 2015 page transcription is a nonauthorial comparison and plays no role
 * in the arithmetic result. The canonical original-image adjudication and
 * the literal radix-60 alphabet are independent pinned inputs.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const table = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-grid-256.json'), 'utf8'
));
const digits60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const digits59 = digits60.replace('f', '');
assert.equal(table.alphabet, digits60);
assert.equal(digits60.length, 60);
assert.equal(digits59.length, 59);
assert.equal(digits60.indexOf('I'), 18);
assert.equal(digits60.indexOf('l'), 47);
assert.equal(digits59.indexOf('I'), 18);
assert.equal(digits59.indexOf('l'), 46);
assert.deepEqual(table.pages.map(p => [p.page, p.rows, p.cols]),
  [[49, 10, 8], [50, 13, 8], [51, 9, 8]]);

const tokens = table.pages.flatMap(p => p.tokens);
assert.equal(tokens.length, 256);
assert.equal(table.bytes.length, 256);
const mod29 = value => ((value % 29) + 29) % 29;
const decode = (token, base, alphabet) =>
  base * alphabet.indexOf(token[0]) + alphabet.indexOf(token[1]);

for (let i = 0; i < tokens.length; i++) {
  const token = tokens[i];
  assert.match(token, /^[0-4][0-9A-Za-x]$/);
  assert.equal(decode(token, 60, digits60), table.bytes[i]);
}
const alternate = token => token[0] + (token[1] === 'I' ? 'l' : 'I');
const ambiguous = tokens.flatMap((token, i) =>
  (token[1] === 'I' || token[1] === 'l') ? [i] : []);
assert.equal(ambiguous.length, 10);
assert.equal(ambiguous.filter(i => tokens[i][1] === 'I').length, 5);
assert.equal(ambiguous.filter(i => tokens[i][1] === 'l').length, 5);
assert.deepEqual(ambiguous, [2, 25, 45, 50, 90, 165, 175, 182, 199, 246]);
// Above assertion fixes all source locations. If incorrect, correct against
// original images before using this as an original-input reproducibility test.

for (const i of ambiguous) {
  const before = decode(tokens[i], 60, digits60);
  const after = decode(alternate(tokens[i]), 60, digits60);
  assert.equal(Math.abs(after - before), 29);
  assert.equal(mod29(after), mod29(before));

  const before59 = decode(tokens[i], 59, digits59);
  const after59 = decode(alternate(tokens[i]), 59, digits59);
  assert.equal(Math.abs(after59 - before59), 28);
  assert.notEqual(mod29(after59), mod29(before59));
}
const originalRes = table.bytes.map(mod29);
let alternativeCount = 0;
for (let mask = 0; mask < (1 << ambiguous.length); mask++) {
  const variant = tokens.slice();
  for (let i = 0; i < ambiguous.length; i++) {
    if (mask & (1 << i)) variant[ambiguous[i]] = alternate(variant[ambiguous[i]]);
  }
  const residue = variant.map(token => mod29(decode(token, 60, digits60)));
  assert.deepEqual(residue, originalRes, 'radix60 mod29 ambiguity must cancel');
  alternativeCount++;
}
assert.equal(alternativeCount, 1024);
assert.deepEqual(table.pages.map(p => p.bytes.length), [80, 104, 72]);
console.log('PASS: ten canonical printed I/l second-digit positions, locations ' +
  ambiguous.join(','));
console.log('Radix60 indices I/l 18/47 differ by exactly29; all ' +
  alternativeCount + ' variants yield the same COMPLETE 256-symbol GP29 stream');
console.log('Radix59 f-removed I/l indices18/46 differ by28; each ambiguous flip changes its GP29 residue');
console.log('No reconstructed plaintext, source-selected cipher opcode, or authentic key is claimed.');
