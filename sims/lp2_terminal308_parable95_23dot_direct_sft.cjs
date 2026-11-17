'use strict';

/**
 * Source-frozen LP2 terminal 308 / PARABLE 95 / final 23-dot gate.
 * Run from the repository root on Node.js 22:
 *   node sims/lp2_terminal308_parable95_23dot_direct_sft.cjs
 *
 * The 23-dot offset is a motivated hypothesis, not an authenticated opcode.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const at = (page) => source.pages.find((x) => x.page === page).indices;
const ciphertext = at(54).concat(at(55));
const key = at(57);
const label = (part) => part.map((x) => x < 29 ? source.translit[x] : '[' + x + ']').join('');
const ioc = (part) => {
  const hist = Array(29).fill(0);
  for (const v of part) if (v < 29) hist[v]++;
  return hist.reduce((sum, f) => sum + f * (f - 1), 0) / (part.length * (part.length - 1));
};
const decode = (part, offset, kind) => part.map((c, i) => {
  const k = key[(i + offset) % key.length];
  if (kind === 'minus') return (c - k + 29) % 29;
  if (kind === 'plus') return (c + k) % 29;
  return c ^ k;
});
const encode = (plain, offset, kind) => plain.map((p, i) => {
  const k = key[(i + offset) % key.length];
  if (kind === 'minus') return (p + k) % 29;
  if (kind === 'plus') return (p - k + 29) % 29;
  return p ^ k;
});

assert.equal(at(54).length, 232);
assert.equal(at(55).length, 76);
assert.equal(key.length, 95);
assert.equal(ciphertext.length, 3 * key.length + 23);
assert.deepEqual(ciphertext.slice(0, 9), [24, 19, 21, 23, 27, 2, 14, 10, 19]);
assert.equal(source.translit[key[0]], 'P');
assert.equal(source.translit[key[23]], 'E');
assert.equal(label(key.slice(0, 7)), 'PARABLE');

const expected = [
  [0, 'minus', 'J', 'ABEAIJAEMN', 0, 0.03566140699691188],
  [0, 'plus', 'H', 'XAEESOEOUF', 0, 0.03454037818858666],
  [0, 'xor', 'NG', 'JBSIOEEA[30]AE', 26, 0.028300689538474554],
  [23, 'minus', 'G', 'EAFWAFAEAE', 0, 0.03426540885824273],
  [23, 'plus', 'P', 'IPIUROAEL', 0, 0.03426540885824273],
  [23, 'xor', 'I', 'WFWAFEACE', 25, 0.02802572020813063]
];
for (const [offset, kind, one, next, invalid, score] of expected) {
  const decoded = decode(ciphertext, offset, kind);
  assert.equal(label(decoded.slice(0, 1)), one);
  assert.equal(label(decoded.slice(1, 9)), next);
  assert.equal(decoded.filter((x) => x >= 29).length, invalid);
  assert.ok(Math.abs(ioc(decoded) - score) < 1e-12);
  assert.deepEqual(encode(decoded, offset, kind), ciphertext);
  // Independent 308-rune GP-native positive, using p57 as a fixed clear source.
  const planted = Array.from({length: ciphertext.length}, (_, i) => key[i % key.length]);
  assert.deepEqual(decode(encode(planted, offset, kind), offset, kind), planted);
  console.log(JSON.stringify({offset, kind, firstWord: one, secondWord: next, invalid, ioc: ioc(decoded)}));
}
assert.ok(ioc(key) > 0.055);
console.log('PASS: 308 original runes, source-fixed 95/23 registration and six direct gates');
