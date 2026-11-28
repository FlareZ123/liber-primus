'use strict';

/**
 * Reproduce the legacy community Hill-cipher interpretation of the LP2
 * cuneiform/base-60 object on the corrected canonical p33..p39 ciphertext.
 *
 * Historical source: Uncovering Cicada Wiki, "Cicada Part 9 - Attempts":
 * "The other base-60 text was cuneiform, and appeared as a 2x2 matrix.
 *  Tried that as the key and deciphered using Hill. No results..."
 *
 * The visible matrix is [17 13; 55 1]. Work modulo GP29. We test both
 * column/row-vector conventions (matrix transpose) and both applying the
 * matrix itself vs its modular inverse. Pairing is either continuous across
 * the cuneiform section or restarted at physical page boundaries.
 *
 * No key phase, alphabet permutation, language-fitted transform or p33
 * plaintext crib is searched.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const gp = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const MOD = 29;
const mod = (x) => ((x % MOD) + MOD) % MOD;

function inv(x) {
  for (let i = 1; i < MOD; i++) if ((x * i) % MOD === 1) return i;
  throw new Error('non-invertible');
}

function inverse2(A) {
  const det = mod(A[0][0] * A[1][1] - A[0][1] * A[1][0]);
  const d = inv(det);
  return [
    [mod(d * A[1][1]), mod(-d * A[0][1])],
    [mod(-d * A[1][0]), mod(d * A[0][0])],
  ];
}

const transpose = (A) => [[A[0][0], A[1][0]], [A[0][1], A[1][1]]];

function mul(A, x) {
  return [
    mod(A[0][0] * x[0] + A[0][1] * x[1]),
    mod(A[1][0] * x[0] + A[1][1] * x[1]),
  ];
}

function transformPages(pages, A, pageReset) {
  const out = [];
  if (!pageReset) {
    const src = pages.flatMap(({ indices }) => indices);
    for (let i = 0; i + 1 < src.length; i += 2) out.push(...mul(A, [src[i], src[i + 1]]));
    if (src.length % 2) out.push(src[src.length - 1]);
    return out;
  }
  for (const { indices } of pages) {
    for (let i = 0; i + 1 < indices.length; i += 2) out.push(...mul(A, [indices[i], indices[i + 1]]));
    if (indices.length % 2) out.push(indices[indices.length - 1]);
  }
  return out;
}

function scaledIoC(runes) {
  const h = Array(MOD).fill(0);
  for (const x of runes) h[x]++;
  return MOD * h.reduce((s, n) => s + n * (n - 1), 0)
    / (runes.length * (runes.length - 1));
}

const M = [[17, 13], [55 % MOD, 1]];
const Mi = inverse2(M);
assert.deepEqual(Mi, [[14, 21], [13, 6]]);
assert.equal(mod(M[0][0] * M[1][1] - M[0][1] * M[1][0]), 27);

const section = gp.pages.filter(({ page }) => page >= 33 && page <= 39);
assert.deepEqual(section.map(({ page }) => page), [33, 34, 35, 36, 37, 38, 39]);
assert.equal(section.reduce((n, p) => n + p.indices.length, 0), 1680);

const variants = {
  M,
  MT: transpose(M),
  Mi,
  MiT: transpose(Mi),
};
const results = {};
for (const [name, A] of Object.entries(variants)) {
  for (const pageReset of [false, true]) {
    const key = `${name}-${pageReset ? 'page-reset' : 'continuous'}`;
    const plain = transformPages(section, A, pageReset);
    assert.equal(plain.length, 1680);
    results[key] = {
      scaledIoC: scaledIoC(plain),
      first80: plain.slice(0, 80).map((i) => gp.translit[i]).join(' '),
    };
  }
}

// Mechanism-positive control: Hill encrypt a solved native GP29 stream and
// recover it exactly with the inverse. Use p57 because it is cleartext in the
// canonical corpus and has an even 94-rune prefix.
const control = gp.pages.find(({ page }) => page === 57).indices.slice(0, 94);
const cipher = [];
for (let i = 0; i < control.length; i += 2) cipher.push(...mul(M, [control[i], control[i + 1]]));
const recovered = [];
for (let i = 0; i < cipher.length; i += 2) recovered.push(...mul(Mi, [cipher[i], cipher[i + 1]]));
assert.deepEqual(recovered, control);

const iocs = Object.values(results).map(({ scaledIoC }) => scaledIoC);
assert.ok(Math.min(...iocs) > 0.98 && Math.max(...iocs) < 1.03);

console.log(JSON.stringify({
  status: 'PASS: historical cuneiform 2x2 Hill consumer reproduces as a negative on corrected p33-p39',
  matrix: M,
  determinantMod29: 27,
  inverse: Mi,
  sectionRunes: 1680,
  positiveControlRunes: control.length,
  results,
}, null, 2));
