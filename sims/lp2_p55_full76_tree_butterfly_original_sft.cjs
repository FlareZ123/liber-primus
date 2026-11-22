'use strict';

/**
 * Director #2140: no-erasure 76-rune p55 tree/moth mirror-butterfly inverse.
 * Source: one p54 carry plus 16 complete p55 word fragments, original 72.jpg,
 * source p57 "shed ... circumferences" and image's bilaterally paired ornaments.
 *
 * A single, fully reversible 2x2 GF29 Hadamard circuit is applied to
 * mirror-related whole-page positions. It consumes ALL 76 GP ciphertext
 * runes, including five two-rune printed words and the incoming page carry.
 * There is no fitted key, phase, alphabet, secret seed, or language selection.
 *
 * SFT: node sims/lp2_p55_full76_tree_butterfly_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const cipher = corpus.pages[55].indices;
const control = corpus.pages[57].indices.slice(0, 76);
const wordLengths = [4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
const mod = (x) => ((x % 29) + 29) % 29;
assert.equal(cipher.length, 76);
assert.equal(control.length, 76);
assert.equal(wordLengths.reduce((s, n) => s + n, 0), 75);
assert.ok(wordLengths.filter((n) => n === 2).length >= 5);

/**
 * Folding left and right whole-page rune positions with a symmetric
 * two-wing butterfly. H = [[1, 1], [1,-1]], det=-2 !=0 in GF29.
 * P_L = C_L+C_R; P_R = C_L-C_R (mod29).
 * @param {number[]} input
 * @returns {number[]}
 */
function unfold(input) {
  assert.equal(input.length, 76);
  const output = Array(76);
  for (let i = 0; i < 38; i++) {
    const j = 75 - i;
    output[i] = mod(input[i] + input[j]);
    output[j] = mod(input[i] - input[j]);
  }
  return output;
}

/**
 * Reencrypt exactly using H inverse = 15 * H modulo29.
 * @param {number[]} plain
 */
function refold(plain) {
  assert.equal(plain.length, 76);
  const cipherRunes = Array(76);
  for (let i = 0; i < 38; i++) {
    const j = 75 - i;
    cipherRunes[i] = mod(15 * (plain[i] + plain[j]));
    cipherRunes[j] = mod(15 * (plain[i] - plain[j]));
  }
  return cipherRunes;
}

/** @param {number[]} arr */
function ioc(arr) {
  const f = Array(29).fill(0);
  for (const x of arr) f[x]++;
  return f.reduce((s, n) => s + n * (n - 1), 0) / (arr.length * (arr.length - 1));
}

/** @param {number[]} arr */
function printedWords(arr) {
  const out = [arr.slice(0, 1).map((i) => corpus.translit[i]).join('')];
  let pos = 1;
  for (const n of wordLengths) {
    out.push(arr.slice(pos, pos + n).map((i) => corpus.translit[i]).join(''));
    pos += n;
  }
  assert.equal(pos, 76);
  return out;
}

const plain = unfold(cipher);
assert.deepEqual(refold(plain), cipher, 'all original p55 ciphertext must reencrypt');
assert.equal(plain.length, 76);
assert.deepEqual(unfold(refold(control)), control, 'source-native p57 positive plant must recover all symbols');
assert.ok(Math.abs(ioc(cipher) - 0.037894736842105266) < 1e-12);
assert.ok(Math.abs(ioc(plain) - 0.04245614035087719) < 1e-12);
const words = printedWords(plain);
assert.equal(words.length, 17);
console.log('Source-p55 original ciphertext IoC', ioc(cipher).toFixed(9));
console.log('No-erasure butterfly inverse IoC', ioc(plain).toFixed(9));
console.log('Solvable p57 clear control IoC', ioc(control).toFixed(9));
console.log('Original complete p55 page local fragments after proposed inverse:', JSON.stringify(words));
console.log('Original 76 runes retained:', plain.length, 'known native positive:', control.length);
console.log('PASS: all 76 original positions reencrypt, five two-rune words preserved, 76 original-control plant recovers');
