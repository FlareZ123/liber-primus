/**
 * Literal six-prime p57 OUR OWN -> p55 76-glyph columnar transposition.
 *
 * Source inputs:
 * - p57 clear OUR OWN corresponds to GP prime heights [7,3,11,7,19,29].
 * - p55 has 76 original glyphs, equal to their sum and p50 rim length.
 *
 * This selects one historical family known from Cicada: write each of
 * six ciphertext column segments in the six printed-word glyph order,
 * with heights given by their prime weights; read each row left-right.
 * All other orientations, rim keys, rotations and chosen cribs are omitted.
 * This transposition is exactly invertible. No original instruction
 * selects a *value-changing* operation after it.
 *
 * Run: node sims/lp2_p57_ourown_sixprime_columnar76_sft.cjs
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const base = path.join(__dirname, '..', 'resources', 'liber-primus');
const gp = JSON.parse(fs.readFileSync(path.join(base, 'lp2-corpus.json'), 'utf8'));
const plainReference = fs.readFileSync(path.join(base, 'lp1-plaintext-reference.txt'), 'utf8')
  .replace(/^#.*$/gm, '');
const parts = [7, 3, 11, 7, 19, 29];
assert.deepEqual(['O', 'U', 'R', 'O', 'W', 'N'].map(
  (letter) => gp.prime[gp.translit.indexOf(letter)]), parts);
assert.equal(parts.reduce((a, b) => a + b), 76);
assert.equal(2 * (32 + 8) - 4, 76);
const cipher = gp.pages[55].indices;
assert.equal(cipher.length, 76);

function decode(x) {
  const cols = [];
  let at = 0;
  for (const n of parts) { cols.push(x.slice(at, at + n)); at += n; }
  assert.equal(at, x.length);
  const result = [];
  for (let y = 0; y < Math.max(...parts); y++) {
    for (let col = 0; col < cols.length; col++) {
      if (y < cols[col].length) result.push(cols[col][y]);
    }
  }
  return result;
}
function encode(x) {
  const cols = parts.map((n) => new Array(n));
  let at = 0;
  for (let y = 0; y < Math.max(...parts); y++) {
    for (let col = 0; col < cols.length; col++) {
      if (y < cols[col].length) cols[col][y] = x[at++];
    }
  }
  assert.equal(at, x.length);
  return cols.flat();
}
function ioc(x) {
  const hist = Array(29).fill(0);
  for (const v of x) hist[v]++;
  return hist.reduce((a, n) => a + n * (n - 1), 0) / (x.length * (x.length - 1));
}
function sourceNative(x) {
  const tokens = gp.translit.map((s, i) => ({ s, i }))
    .sort((a, b) => b.s.length - a.s.length);
  const clean = x.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (const word of clean.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith('ING', i)) { out.push(21); i += 3; }
      else if (word.startsWith('IO', i)) { out.push(27); i += 2; }
      else {
        const t = tokens.find((t) => word.startsWith(t.s, i));
        assert(t, 'Unmapped word ' + word);
        out.push(t.i);
        i += t.s.length;
      }
    }
  }
  return out;
}
const originalRead = decode(cipher);
assert.deepEqual(encode(originalRead), cipher);
assert.equal(ioc(originalRead), ioc(cipher), 'Permutation preserves IC');
const solvedP57 = gp.pages[57].indices.slice(0, 76);
assert.equal(solvedP57.length, 76);
assert.deepEqual(decode(encode(solvedP57)), solvedP57);
const native = sourceNative(plainReference);
assert.equal(native.length, 3510);
const nativeIoc = [];
for (let i = 0; i + 76 <= native.length; i++) {
  nativeIoc.push(ioc(native.slice(i, i + 76)));
}
nativeIoc.sort((a, b) => a - b);
const sourceIoc = ioc(originalRead);
const countNativeBelow = nativeIoc.filter((x) => x <= sourceIoc).length;
assert.equal(countNativeBelow, 0);
console.log(JSON.stringify({
  source: ['lp2 original p55', 'clear p57 OUR OWN', 'p50 32x8 perimeter'],
  fixedPrimeColumnHeights: parts,
  originalInputRuneCount: cipher.length,
  invertibleOriginal: true,
  solvedP57PlantedExact: true,
  p55IocSourceAndPermutation: sourceIoc,
  p57First76Ioc: ioc(solvedP57),
  lp1NativeWindows76: nativeIoc.length,
  lp1NativeMinIoc: nativeIoc[0],
  lp1NativeMedianIoc: nativeIoc[Math.floor(nativeIoc.length / 2)],
  lp1NativeWindowsAtOrBelowOriginal: countNativeBelow,
  originalPermutedTransliteration: originalRead.map((i) => gp.translit[i]).join(''),
  note: 'No source-selected value-changing operation; no recovered plaintext'
}, null, 2));
