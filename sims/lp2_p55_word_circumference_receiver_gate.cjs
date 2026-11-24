#!/usr/bin/env node
'use strict';

// Reproduce the LP2 p55 word-circumference / p50 Hill receiver gate.
// No parameter sweep: this records one source-motivated candidate and its
// negative receiver result, plus the separate provisional p55 DH cross-link.

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const transcription = fs.readFileSync(path.join(root, 'resources/lp2-transcription.txt'), 'utf8');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));

const pages = transcription.split('%');
const page55 = pages[54];
const rawWords = page55
  .replaceAll('/', '')
  .replaceAll('\n', '')
  .replaceAll('\r', '')
  .split(/[-.&$§,:!?]/u)
  .map(part => (part.match(/[ᚠ-᛿]+/gu) || []).join(''))
  .filter(Boolean);

// The first one-rune token is a carry from the preceding page.
assert.equal(rawWords.length, 17);
const words = rawWords.slice(1);
assert.equal(words.length, 16);

const { runes, translit, prime } = corpus;
const runeIndex = rune => {
  const i = runes.indexOf(rune);
  assert.notEqual(i, -1, 'rune must belong to GP29');
  return i;
};
const mod = (x, m) => ((x % m) + m) % m;
const modPow = (base, exponent, modulus) => {
  let b = mod(base, modulus);
  let e = BigInt(exponent);
  const m = BigInt(modulus);
  let out = 1n;
  while (e > 0n) {
    if (e & 1n) out = (out * b) % m;
    b = (b * b) % m;
    e >>= 1n;
  }
  return out;
};
const toBase29 = digits => digits.reduce((n, d) => n * 29n + BigInt(d), 0n);
const base29Digits = value => {
  let n = BigInt(value);
  const out = [];
  while (n > 0n) {
    out.push(Number(n % 29n));
    n /= 29n;
  }
  return out.reverse();
};
const render = values => values.map(i => translit[i]).join('');

const innerRunes = words.flatMap(word => Array.from(word).slice(1, -1));
const shellRunes = words.flatMap(word => {
  const chars = Array.from(word);
  return [chars[0], chars[chars.length - 1]];
});
const inner = innerRunes.map(runeIndex);
const shell = shellRunes.map(runeIndex);
assert.equal(inner.length, 43);
assert.equal(shell.length, 32);

function modInverse(a, m) {
  return modPow(BigInt(a), BigInt(m - 2), BigInt(m));
}
function invertMatrix(matrix, modulus) {
  const n = matrix.length;
  const augmented = matrix.map((row, i) => [
    ...row.map(x => mod(x, modulus)),
    ...Array.from({ length: n }, (_, j) => i === j ? 1 : 0)
  ]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    while (pivot < n && augmented[pivot][col] === 0) pivot++;
    if (pivot === n) return null;
    [augmented[col], augmented[pivot]] = [augmented[pivot], augmented[col]];
    const inv = Number(modInverse(augmented[col][col], modulus));
    augmented[col] = augmented[col].map(x => mod(x * inv, modulus));
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = augmented[row][col];
      augmented[row] = augmented[row].map((x, j) => mod(x - factor * augmented[col][j], modulus));
    }
  }
  return augmented.map(row => row.slice(n));
}
function determinantMod(matrix, modulus) {
  const n = matrix.length;
  const a = matrix.map(row => row.map(x => mod(x, modulus)));
  let det = 1;
  for (let col = 0; col < n; col++) {
    let pivot = col;
    while (pivot < n && a[pivot][col] === 0) pivot++;
    if (pivot === n) return 0;
    if (pivot !== col) {
      [a[col], a[pivot]] = [a[pivot], a[col]];
      det = mod(-det, modulus);
    }
    const p = a[col][col];
    det = mod(det * p, modulus);
    const inv = Number(modInverse(p, modulus));
    for (let row = col + 1; row < n; row++) {
      const factor = mod(a[row][col] * inv, modulus);
      for (let j = col; j < n; j++) a[row][j] = mod(a[row][j] - factor * a[col][j], modulus);
    }
  }
  return det;
}
function hillDecrypt(ciphertext, inverse, modulus = 29) {
  assert.equal(ciphertext.length % 4, 0);
  const out = [];
  for (let i = 0; i < ciphertext.length; i += 4) {
    const block = ciphertext.slice(i, i + 4);
    for (let row = 0; row < 4; row++) {
      out.push(mod(inverse[row].reduce((sum, x, j) => sum + x * block[j], 0), modulus));
    }
  }
  return out;
}
function indexOfCoincidence(values) {
  const counts = new Array(29).fill(0);
  for (const x of values) counts[x]++;
  const numerator = counts.reduce((sum, n) => sum + n * (n - 1), 0);
  return numerator / (values.length * (values.length - 1));
}

// Candidate key: one interior-prime sum per complete p55 word, row-major 4x4.
// The 4x4 arrangement is an imposed test, not a printed square on the page.
const wordInnerPrimeSums = words.map(word =>
  Array.from(word).slice(1, -1).reduce((sum, rune) => sum + prime[runeIndex(rune)], 0) % 29
);
const keyMatrix = Array.from({ length: 4 }, (_, row) => wordInnerPrimeSums.slice(row * 4, row * 4 + 4));
const keyDeterminant = determinantMod(keyMatrix, 29);
const keyInverse = invertMatrix(keyMatrix, 29);
assert.notEqual(keyDeterminant, 0);
assert.ok(keyInverse);

// Frozen receiver: the entire 32x8 p50 table, byte -> byte mod 29,
// standard column-vector Hill decryption in consecutive blocks of four.
const p50Bytes = grid.bytes;
assert.equal(p50Bytes.length, 256);
const p50Cipher = p50Bytes.map(value => value % 29);
const p50Plain = hillDecrypt(p50Cipher, keyInverse);
const p50Ioc = indexOfCoincidence(p50Plain);

// Control: apply the same fixed matrix to the 32-symbol p55 shell.
const shellHillPlain = hillDecrypt(shell, keyInverse);

// Separate provisional DH cross-link from the p55 split.
// P and Q are conditional candidates already discussed in the p55 DH report;
// this script does not independently certify primality or primitive-root status.
const innerInteger = toBase29(inner);
const shellInteger = toBase29(shell);
assert.equal(innerInteger % 8n, 0n);
assert.equal(shellInteger % 43n, 0n);
const P = innerInteger / 8n;
const Q = shellInteger / 43n;
assert.equal(P.toString(), '63755441409934721069036418908763882578170591536653256311514221');
assert.equal(Q.toString(), '1268532719737981052966698570711268391040527137');

const dIndex = translit.indexOf('D');
const dPositions = inner.map((value, i) => value === dIndex ? i : -1).filter(i => i >= 0);
assert.deepEqual(dPositions, [5, 23]);
const [firstD, secondD] = dPositions;
const inferredSmallTuple = {
  p: dIndex,
  g: firstD,
  a: firstD + 1,
  b: Math.floor((firstD + secondD) / 2) + 1,
  A: Number(innerInteger / P),
  B: secondD - firstD + 1
};
assert.deepEqual(inferredSmallTuple, { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19 });

const smallA = modPow(5n, 6n, 23n);
const smallB = modPow(5n, 15n, 23n);
const smallK = modPow(smallB, 6n, 23n);
assert.equal(smallA, 8n);
assert.equal(smallB, 19n);
assert.equal(smallK, 2n);

const largeA = modPow(Q, 6n, P);
const largeB = modPow(Q, 15n, P);
const sharedSecret = modPow(Q, 90n, P);
assert.equal(modPow(largeB, 6n, P), sharedSecret);
assert.equal(modPow(largeA, 15n, P), sharedSecret);
assert.equal(sharedSecret % 29n, 2n);

const secretDigits = base29Digits(sharedSecret);
assert.equal(secretDigits.length, 43);
const dhShellPlain = shell.map((value, i) => mod(value - secretDigits[i], 29));
const dhInnerPlain = inner.map((value, i) => mod(value - secretDigits[i], 29));
const dhShellTokens = dhShellPlain.map(i => translit[i]);
const foldOffsets = [];
for (let i = 0; i <= dhShellTokens.length - 4; i++) {
  if (dhShellTokens.slice(i, i + 4).join('') === 'FOLD') foldOffsets.push(i);
}

const output = {
  source: {
    p55_transcription_page_index: 54,
    raw_word_groups_including_carry: rawWords.length,
    complete_words: words.length,
    interior_runes: inner.length,
    shell_runes: shell.length,
    p50_grid_shape: grid.shape,
    p50_byte_count: p50Bytes.length
  },
  frozen_hill_receiver: {
    key_rule: 'row-major 4x4 matrix of each p55 word interior GP-prime sum modulo 29',
    key_matrix: keyMatrix,
    determinant_mod_29: keyDeterminant,
    inverse_matrix: keyInverse,
    receiver: 'whole p50 256-byte table; each byte reduced modulo 29',
    convention: 'column-vector Hill decryption, consecutive blocks of four',
    output_symbols: p50Plain.length,
    output_ioc: p50Ioc,
    output_transliteration: render(p50Plain),
    shell_control_transliteration: render(shellHillPlain)
  },
  provisional_p55_dh_crosslink: {
    P: P.toString(),
    Q: Q.toString(),
    inferred_small_tuple: inferredSmallTuple,
    small_group_shared_secret: smallK.toString(),
    large_group_public_A: largeA.toString(),
    large_group_public_B: largeB.toString(),
    large_group_shared_secret: sharedSecret.toString(),
    large_secret_mod_29: Number(sharedSecret % 29n),
    large_secret_base29_digit_count: secretDigits.length,
    large_secret_base29_transliteration: render(secretDigits),
    shell_subtraction_transliteration: render(dhShellPlain),
    shell_FOLD_offsets_zero_based: foldOffsets,
    interior_subtraction_transliteration: render(dhInnerPlain),
    caveat: 'No receiver or complete plaintext established; group construction remains conditional.'
  }
};

console.log(JSON.stringify(output, null, 2));
