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
const plainReference = fs.readFileSync(path.join(base, 'lp1-plaintext-reference.txt'), 'utf8');
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
assert.deepEqual(sourceNative('FUNCTION'), [0, 1, 9, 5, 16, 27, 9]);
const originalRead = decode(cipher);
assert.deepEqual(encode(originalRead), cipher);
assert.equal(ioc(originalRead), ioc(cipher), 'Permutation preserves IC');
const solvedP57 = gp.pages[57].indices.slice(0, 76);
assert.equal(solvedP57.length, 76);
assert.deepEqual(decode(encode(solvedP57)), solvedP57);
// LP1 source-derived prose only; exclude LP2 p56/p57, bracketed editorial
// notes and reference-only duplicated sections 4, 7 and 8. Windows remain
// within the reference section; these are not necessarily physical-page cuts.
const headers = [...plainReference.matchAll(/^###\s+(\d+)\s*$/gm)];
const lp1Sections = headers.map((match, index) => {
  const start = match.index + match[0].length;
  const end = index + 1 < headers.length ? headers[index + 1].index : plainReference.length;
  return { page: Number(match[1]), text: plainReference.slice(start, end).replace(/^#.*$/gm, '')
    .replace(/^\s*\[.*\]\s*$/gm, '') };
}).filter(section => section.page >= 1 && section.page <= 16 && ![4, 7, 8].includes(section.page));
assert.deepEqual(lp1Sections.map(section => section.page),
  [1, 3, 5, 6, 9, 10, 11, 12, 13, 14, 15, 16]);
const nativePages = lp1Sections.map(section => ({
  page: section.page, runes: sourceNative(section.text)
}));
const nativeRuneCount = nativePages.reduce((sum, page) => sum + page.runes.length, 0);
assert.equal(nativeRuneCount, 2797);
const nativeIoc = [];
for (const page of nativePages) {
  for (let i = 0; i + 76 <= page.runes.length; i++) {
    nativeIoc.push(ioc(page.runes.slice(i, i + 76)));
  }
}
nativeIoc.sort((a, b) => a - b);
assert.equal(nativeIoc.length, 2002);
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
  lp1NativePages: nativePages.map(page => page.page),
  lp1NativeRuneCount: nativeRuneCount,
  lp1NativePageContainedWindows76: nativeIoc.length,
  lp1NativeMinIoc: nativeIoc[0],
  lp1NativeMedianIoc: nativeIoc[Math.floor(nativeIoc.length / 2)],
  lp1NativeWindowsAtOrBelowOriginal: countNativeBelow,
  originalPermutedTransliteration: originalRead.map((i) => gp.translit[i]).join(''),
  note: 'No source-selected value-changing operation; no recovered plaintext'
}, null, 2));
