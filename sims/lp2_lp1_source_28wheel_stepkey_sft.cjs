'use strict';

/**
 * Source-selected 28-spoke nonzero-step chain test, with the solved LP1 book
 * as the unmodified, finite, cyclic running key.
 *
 * Proposal: C_i=C_(i-1)+step_i mod29.  A nonzero step 1..28 encodes
 * 28 ordinary GP symbols with a GP-index key modulo28. Zero step codes
 * the native rare EA rune (GP28). This can explain the LP2 anti-doublets
 * without trying to tune a new exception or arbitrary glyph substitution.
 *
 * We test every one of the 2797 LP1 key starts, both signs, on every original
 * unsolved rune (p0-p55), retaining p0's first 13 red title runes.
 *
 * Node22 CommonJS SFT. No outside network or file writing.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = path.join(__dirname, '..');
const read = relative => fs.readFileSync(path.join(base, relative), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const source = read('resources/liber-primus/lp1-plaintext-reference.txt');
const sections = source.split(/^### (\d+)\s*$/m);
const selected = new Set([1, 3, 5, 6, 9, 10, 11, 12, 13, 14, 15, 16]);
const pieces = [];
for (let i = 1; i + 1 < sections.length; i += 2) {
  if (!selected.has(Number(sections[i]))) continue;
  pieces.push(sections[i + 1].split('\n')
    .filter(line => !line.startsWith('[') && !line.startsWith('(')).join(' '));
}
const sourceTokens = gp.translit.map((rune, index) => ({rune, index}))
  .sort((a, b) => b.rune.length - a.rune.length);

/** @param {string} input */
function nativeGp(input) {
  const out = [];
  const clean = input.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  for (const word of clean.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith('ING', i)) {out.push(21); i += 3; continue;}
      if (word.startsWith('IO', i)) {out.push(27); i += 2; continue;}
      const token = sourceTokens.find(t => word.startsWith(t.rune, i));
      assert(token, 'unknown native GP encoding: ' + word.slice(i));
      out.push(token.index);
      i += token.rune.length;
    }
  }
  return out;
}

/** @param {Uint8Array|number[]} src */
function ioc(src) {
  const h = new Uint32Array(29);
  for (const x of src) h[x]++;
  return h.reduce((s, x) => s + x * (x - 1), 0) / (src.length * (src.length - 1));
}
const K = Uint8Array.from(nativeGp(pieces.join(' ')).map(x => x % 28));
assert.equal(K.length, 2797);
const ciphertext = Uint8Array.from(gp.pages.filter(p => p.page < 56).flatMap(p => p.indices));
assert.equal(ciphertext.length, 12956);
const steps = new Uint8Array(ciphertext.length);
for (let i = 0; i < steps.length; i++) {
  steps[i] = (ciphertext[i] + 29 - (i ? ciphertext[i - 1] : 0)) % 29;
}
assert.equal(steps.filter(x => x === 0).length, 86);

/** @param {Uint8Array} differences @param {number} start @param {-1|1} sign */
function decode(differences, start, sign) {
  const out = new Uint8Array(differences.length);
  for (let i = 0, k = start; i < differences.length; i++) {
    const d = differences[i];
    out[i] = d === 0 ? 28 : (d - 1 + 28 + sign * K[k] + 28) % 28;
    if (++k === K.length) k = 0;
  }
  return out;
}

/** @param {Uint8Array} plaintext @param {number} start @param {-1|1} sign */
function encrypt(plaintext, start, sign) {
  const out = new Uint8Array(plaintext.length);
  for (let i = 0, k = start, prev = 0; i < plaintext.length; i++) {
    const plain = plaintext[i];
    const d = plain === 28 ? 0 : ((plain + 28 - sign * K[k]) % 28) + 1;
    prev = (prev + d) % 29;
    out[i] = prev;
    if (++k === K.length) k = 0;
  }
  return out;
}
const p57 = gp.pages.find(p => p.page === 57).indices;
assert.equal(p57.length, 95);
const plant = Uint8Array.from({length: ciphertext.length}, (_, i) => p57[i % p57.length]);
const fixedStart = 3301 % K.length;
for (const sign of [-1, 1]) {
  const wrapped = encrypt(plant, fixedStart, sign);
  const delta = new Uint8Array(wrapped.length);
  for (let i = 0; i < delta.length; i++) delta[i] =
    (wrapped[i] + 29 - (i ? wrapped[i - 1] : 0)) % 29;
  assert.deepEqual(decode(delta, fixedStart, sign), plant);
}
assert(ioc(plant) > 0.06);

const trials = [];
for (const sign of [-1, 1]) {
  const top = [];
  for (let offset = 0; offset < K.length; offset++) {
    const score = ioc(decode(steps, offset, sign));
    if (top.length < 3 || score > top[top.length - 1].ioc) {
      top.push({source_key_offset: offset, ioc: score});
      top.sort((a, b) => b.ioc - a.ioc);
      top.length = Math.min(3, top.length);
    }
  }
  trials.push({sign, tested_offsets: K.length, best: top});
}
assert(trials.every(t => t.best[0].ioc < 0.04));
assert(Math.abs(trials[0].best[0].ioc - 0.035375487548093484) < 1e-12);
assert(Math.abs(trials[1].best[0].ioc - 0.03538033726120376) < 1e-12);
console.log(JSON.stringify({
  hypothesis: '28 nonzero GP29 steps + GP28 zero step, solved-LP1 running key',
  source_key_gp29_len: K.length,
  original_unsolved_runes: ciphertext.length,
  original_adjacent_same_count: 86,
  native_solved_12956_rune_plant: 'PASS both signs',
  original_ioc: ioc(ciphertext),
  output: trials,
  outcome: 'no original English plaintext under any LP1 cyclic offset',
  plaintext_recovered: false
}, null, 2));
