'use strict';
/**
 * SFT: node sims/lp2_wordlocal_fiveback_affine_ab_sft.cjs
 * Test every original 11..14-rune word against a finite native English
 * lexicon under per-word affine five-back feedback with arbitrary A, B,
 * five phase shifts K, and arbitrary first-five initialization.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encodeSourceNativeGP} = require('./lp2_native_gp_source_orthography_sft.cjs');
const root = path.join(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const runeIndex = new Map(gp.runes.map((r, i) => [r, i]));
const runePattern = new RegExp('[' + gp.runes.join('') + ']+', 'gu');
const trans = read('resources/lp2-transcription.txt').split('%').slice(0, 55)
  .join('%').replace(/\/\r?\n/g, '').replace(/[\r\n%]/g, '');
const original = (trans.match(runePattern) || [])
  .map(w => Array.from(w, r => runeIndex.get(r)));
assert.equal(original.length, 2896);
assert.equal(original.reduce((sum, w) => sum + w.length, 0), 12956);
const words = read('resources/control/english_wordfreq_textblob.txt')
  .split(/\r?\n/).filter(line => /^[a-z]+ \d+$/.test(line))
  .map(line => line.split(' ')[0]);
assert.equal(words.length, 29157);
const mod = value => ((value % 29) + 29) % 29;
const inverse = x => {
  assert(x > 0 && x < 29);
  for (let i = 1; i < 29; i++) if (i * x % 29 === 1) return i;
  throw Error('non-invertible field value');
};
/**
 * At j>=10, the observed feedback residual is:
 * Cj-(B+1)*C(j-5)+B*C(j-10) = A*(Pj-P(j-5)) mod29.
 * Unknown K[0..4] and five initial C values cancel identically.
 * @param {number[]} w Original runic word
 * @param {boolean} isCipher Whether to form the ciphertext residual
 * @param {number} B Word-specific feedback multiplier
 * @returns {number[]} Exact field residual
 */
function residual(w, isCipher, B = 1) {
  const d = [];
  for (let j = 10; j < w.length; j++) d.push(isCipher
    ? mod(w[j] - (B + 1) * w[j - 5] + B * w[j - 10])
    : mod(w[j] - w[j - 5]));
  return d;
}
function normalized(d) {
  const firstNonzero = d.find(x => x !== 0);
  const scalar = firstNonzero === undefined ? 1 : inverse(firstNonzero);
  return d.map(x => mod(x * scalar)).join('.');
}
const native = new Map();
for (const word of words) {
  const p = encodeSourceNativeGP(word);
  if (p.length < 11 || p.length > 14) continue;
  if (!native.has(p.length)) native.set(p.length, new Map());
  const m = native.get(p.length), key = normalized(residual(p, false));
  if (!m.has(key)) m.set(key, []);
  m.get(key).push(word);
}
const pageRanges = [];
let start = 0;
for (const page of gp.pages.filter(p => p.page < 56 && p.indices.length)) {
  pageRanges.push({page: page.page, start, end: start + page.indices.length});
  start += page.indices.length;
}
assert.equal(start, 12956);
const summary = [];
const rejections = [];
let offset = 0;
for (let i = 0; i < original.length; i++) {
  const c = original[i], n = c.length;
  if (n >= 11 && n <= 14) {
    let row = summary.find(r => r.length === n);
    if (!row) {
      row = {length: n, original: 0, b1AnyA: 0, anyBAnyA: 0};
      summary.push(row);
    }
    row.original++;
    const index = native.get(n);
    const allowedB = [];
    for (let B = 0; B < 29; B++) {
      if (index.has(normalized(residual(c, true, B)))) allowedB.push(B);
    }
    const b1Allowed = allowedB.includes(1);
    if (b1Allowed) row.b1AnyA++;
    if (allowedB.length) row.anyBAnyA++;
    if (!allowedB.length || !b1Allowed) {
      const page = pageRanges.find(p => offset >= p.start && offset < p.end);
      assert(page);
      rejections.push({
        wordNumber: i + 1, physicalPage: page.page,
        pageRuneOffset: offset - page.start,
        globalRuneOffset: offset, length: n,
        hasCiphertextF: c.includes(0), b1Allowed,
        allCompatibleB: allowedB, runes: c.map(x => gp.runes[x]).join('')
      });
    }
  }
  offset += n;
}
assert.equal(offset, 12956);
summary.sort((a, b) => a.length - b.length);
assert.deepEqual(summary.map(r =>
  [r.length, r.original, r.b1AnyA, r.anyBAnyA]), [
  [11, 32, 32, 32],
  [12, 18, 18, 18],
  [13, 4, 0, 4],
  [14, 3, 0, 0]
]);
const freeBRejects = rejections.filter(r => r.allCompatibleB.length === 0);
assert.equal(freeBRejects.length, 3);
assert.deepEqual(freeBRejects.map(r => [r.physicalPage, r.pageRuneOffset]), [
  [13, 211], [25, 46], [43, 37]
]);
assert.equal(freeBRejects.filter(r => !r.hasCiphertextF).length, 1);
const shifts = [2, 3, 5, 7, 11], iv = [1, 4, 9, 16, 25];
const scenarios = [{A: 1, B: 1}, {A: 7, B: 1},
  {A: 19, B: 17}, {A: 28, B: 0}];
let positive = 0;
for (const {A, B} of scenarios) {
  for (const row of summary) {
    const candidates = [...native.get(row.length).values()].flat();
    for (let k = 0; k < row.original; k++) {
      const p = encodeSourceNativeGP(candidates[k % candidates.length]);
      const c = [];
      for (let j = 0; j < p.length; j++) {
        const feedback = j < 5 ? iv[j] : B * c[j - 5];
        c.push(mod(A * p[j] + shifts[j % 5] + feedback));
      }
      const clear = c.map((value, j) => mod(inverse(A) * (
        value - shifts[j % 5] - (j < 5 ? iv[j] : B * c[j - 5]))));
      assert.deepEqual(clear, p);
      assert.deepEqual(residual(c, true, B),
        residual(p, false).map(x => mod(A * x)));
      assert(native.get(p.length).has(normalized(residual(c, true, B))));
      positive++;
    }
  }
}
assert.equal(positive, 228);
console.log(JSON.stringify({
  status: 'all-secret finite-register exclusion, no recovered LP2 plaintext',
  model: 'word-local GP29 Cj=A*Pj+K(j mod 5)+B*C(j-5), j>=5',
  originalWords: original.length, originalRunes: offset,
  referenceWords: words.length, summary, freeBRejects,
  allScalarAndFeedbackPairsExhaustedPerWord: 28 * 29,
  exactNativePositivePlants: positive
}, null, 2));
