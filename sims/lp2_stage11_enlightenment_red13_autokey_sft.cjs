'use strict';

/**
 * Source-fixed autokey continuations of Cicada's 2014 ENLIGHTENMENT / LP2 p0 red13 clue.
 * Run from repository root: node sims/lp2_stage11_enlightenment_red13_autokey_sft.cjs
 * Input: resources/liber-primus/lp2-corpus.json
 * No fitted phases, keys, page reordering, or word reconstruction.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const mod29 = x => ((x % 29) + 29) % 29;
const source = corpus.pages.slice(0, 3).flatMap(p => p.indices);
const header = source.slice(0, 13);
assert.equal(source.length, 729);
assert.deepEqual(header, [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5]);
assert.equal(corpus.pages[57].indices.length, 95);

const translit = corpus.translit;
function encodeGp(text) {
  const names = [...translit].sort((a, b) => b.length - a.length);
  const result = [];
  for (let i = 0; i < text.length;) {
    const name = names.find(n => text.startsWith(n, i));
    assert.ok(name, 'Unsupported GP fragment at position ' + i);
    result.push(translit.indexOf(name));
    i += name.length;
  }
  return result;
}
const title = encodeGp('ENLIGHTENMENT');
assert.equal(title.length, 13);

/** Statistical diagnostic only, not a cipher correctness proof. */
function ioc(v) {
  const counts = new Array(29).fill(0);
  for (const x of v) counts[x]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) / (v.length * (v.length - 1));
}

/** C_i +/- C_{i-13}, starting after the literal red heading. */
function cipherAuto(cipher, direction) {
  return cipher.slice(13).map((c, k) => mod29(c + direction * cipher[k]));
}

/** P_i = C_i - P_{i-13}, initialized by a fixed visible or signed-text primer. */
function plainAuto(cipher, first13) {
  const p = [...first13];
  for (let i = 13; i < cipher.length; i++) p.push(mod29(cipher[i] - p[i - 13]));
  return p.slice(13);
}

const modes = [
  ['C-minus-C[-13]', cipherAuto(source, -1), 0.03494940813376567],
  ['C-plus-C[-13]', cipherAuto(source, +1), 0.03531273196077665],
  ['P-autokey ENLIGHTENMENT primer', plainAuto(source, title), 0.03469937883345704],
  ['P-autokey literal ciphertext red13 primer', plainAuto(source, header), 0.03460952455365863],
];

// Positive plant: one 82-rune authentic native-GP p57 body through each exact recursive rule.
const native = corpus.pages[57].indices.slice(0, 82);
for (const direction of [-1, +1]) {
  const cipher = [...header];
  for (let i = 0; i < native.length; i++) {
    cipher.push(mod29(native[i] - direction * cipher[i]));
  }
  assert.deepEqual(cipherAuto(cipher, direction), native);
}
for (const primer of [title, header]) {
  const plaintext = [...primer, ...native];
  const cipher = [...header];
  for (let i = 13; i < plaintext.length; i++) cipher.push(mod29(plaintext[i] + plaintext[i - 13]));
  assert.deepEqual(plainAuto(cipher, primer), native);
}

for (const [name, decoded, expected] of modes) {
  assert.equal(decoded.length, 716);
  assert.ok(Math.abs(ioc(decoded) - expected) < 1e-12);
  assert.ok(ioc(decoded) < 0.04);
  process.stdout.write(JSON.stringify({
    name, count: decoded.length, ioc: ioc(decoded),
    first40: decoded.slice(0, 40).map(x => translit[x]).join(' ')
  }) + '\n');
}
process.stdout.write(JSON.stringify({
  controls: '4/4 source-shaped plants recovered 82/82; no original plaintext',
  rawIoc: ioc(source), nativeP57Ioc: ioc(corpus.pages[57].indices)
}) + '\n');
