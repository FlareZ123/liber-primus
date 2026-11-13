'use strict';
/**
 * SFT: node sims/lp2_p55_latin_rank_wordshape_sft.cjs
 * Frozen original-input p55 predecessor-rank/K-marker family.
 * Reads exact source files, uses no fitted key on LP2 ciphertext.
 * The bijective rank code preserves every plaintext equality pattern.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const glyphs = [...'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'];
const glyphIndex = new Map(glyphs.map((s, i) => [s, i]));
const source = read('resources/liber-primus/lp2-transcription.txt').split('%');
const page = [...source[54]].filter(s => glyphIndex.has(s)).map(s => glyphIndex.get(s));
assert.equal(page.length, 76);
assert.equal(page[0], 21); // original p54 -> p55 carried word
/** @param {number[]} cipher @param {number} initial @returns {number[]} */
function toRanks(cipher, initial) {
  const out = [];
  let previous = initial;
  for (const c of cipher) {
    assert(c >= 0 && c < 29);
    out.push(c === previous ? 28 : c - (c > previous ? 1 : 0));
    previous = c;
  }
  return out;
}
/** @param {number[]} ranks @param {number} initial @returns {number[]} */
function fromRanks(ranks, initial) {
  const out = [];
  let previous = initial;
  for (const r of ranks) {
    assert(r >= 0 && r <= 28);
    const c = r === 28 ? previous : r + (r >= previous ? 1 : 0);
    out.push(c);
    previous = c;
  }
  return out;
}
const lengths = [4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
assert.equal(lengths.reduce((s, n) => s + n, 0), 75);
const ranks = toRanks(page.slice(1), page[0]);
assert.deepEqual(fromRanks(ranks, page[0]), page.slice(1));
const wordStarts = lengths.map((_, i) => lengths.slice(0, i).reduce((s, n) => s + n, 0));
const word7 = ranks.slice(wordStarts[6], wordStarts[6] + 13);
assert.deepEqual(word7, [16, 27, 0, 13, 10, 18, 1, 4, 12, 8, 20, 20, 12]);
assert.equal(word7.includes(28), false);
assert.equal(word7[10], word7[11]);
assert.equal(word7[8], word7[12]);
/** @param {Array<string|number>} letters @returns {string} */
function pattern(letters) {
  const indices = new Map();
  return letters.map(c => {
    if (!indices.has(c)) indices.set(c, indices.size);
    return indices.get(c);
  }).join(',');
}
/** @param {Array<string|number>} a @returns {{distinct:number,max:number}} */
function spectrum(a) {
  const counts = new Map();
  for (const v of a) counts.set(v, (counts.get(v) || 0) + 1);
  return {distinct: counts.size, max: Math.max(...counts.values())};
}
assert.deepEqual(spectrum(ranks.slice(0, 45)), {distinct: 23, max: 3});
assert.deepEqual(spectrum(ranks), {distinct: 25, max: 5});
assert.equal(ranks.filter(x => x === 28).length, 1);
/**
 * Conditional iid-uniform 28-rank occupancy law for n original nonrepeats.
 * A source-selected code would need more evidence than a chance-low rank count.
 * @param {number} m @param {number} n @param {number} cap
 * @returns {number}
 */
function occupancyAtMost(m, n, cap) {
  let p = Array(m + 1).fill(0);
  p[0] = 1;
  for (let i = 0; i < n; i++) {
    const q = Array(m + 1).fill(0);
    for (let d = 0; d <= m; d++) {
      q[d] += p[d] * d / m;
      if (d < m) q[d + 1] += p[d] * (m - d) / m;
    }
    p = q;
  }
  return p.slice(0, cap + 1).reduce((sum, x) => sum + x, 0);
}
const conditionalUniformRankP = occupancyAtMost(28, 74, 24);
assert(Math.abs(conditionalUniformRankP - 0.09524737506390421) < 1e-12);
console.log('Source p55 nonrepeat rank occupancy: 24/28 observed in 74 draws; iid uniform P(<=24)=' + conditionalUniformRankP);
const referenceFiles = [
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/shakespeare_first300k.txt',
  'resources/control/emerson_essays_2944.txt',
  'resources/liber-primus/lp1-plaintext-reference.txt',
  'resources/control/latin-vulgate-latin26-wholewords.txt'
];
const englishWithoutMarker = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].filter(c => c !== 'K');
const key = new Map(englishWithoutMarker.map((c, i) => [c, (i * 5 + 3) % 28]));
assert.equal(new Set(key.values()).size, 25);
const inverse = new Map([...key.entries()].map(([c, r]) => [r, c]));
/** @param {string} text @returns {number[]} */
function encrypt(text) {
  const symbols = [...text.toUpperCase()];
  const plaintextRanks = symbols.map(c => c === 'K' ? 28 : key.get(c));
  assert(plaintextRanks.every(n => Number.isInteger(n)));
  return fromRanks(plaintextRanks, page[0]);
}
/** @param {number[]} cipher @returns {string} */
function decrypt(cipher) {
  return toRanks(cipher, page[0]).map(r => r === 28 ? 'K' : inverse.get(r)).join('');
}
/** @param {number} seed @returns {() => number} */
function lcg(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s;
  };
}
const trialCount = 100000;
const targetShape = pattern(word7);
for (const [refIndex, filename] of referenceFiles.entries()) {
  const raw = read(filename);
  const content = (filename.includes('lp1-plaintext-reference') || filename.includes('latin-vulgate-latin26-wholewords'))
    ? raw.split('\n').filter(s => !s.startsWith('#')).join(' ')
    : raw;
  const words = content.toUpperCase().match(/[A-Z]+/g) || [];
  const buckets = Array.from({length: 14}, () => []);
  for (const w of words) if (w.length <= 13) buckets[w.length].push(w);
  assert(lengths.every(n => buckets[n].length > 0));
  const exact13 = [...new Set(buckets[13])].filter(w => pattern([...w]) === targetShape);
  assert.deepEqual(exact13, []); // key-invariant original exclusion across native English and Latin
  if (filename.includes('latin-vulgate')) {
    assert.equal(new Set(words.join('')).size, 23);
    assert.equal(words.filter(w => w.includes('K')).length, 0);
    assert.equal(buckets[13].length, 241);
    assert.equal(words.length, 39835);
  }
  const rand = lcg(0x741a14 + refIndex * 0x10101);
  let unique45 = 0;
  let flat45 = 0;
  let both45 = 0;
  let both75 = 0;
  let oneKAndBoth75 = 0;
  let minimumMax45 = Infinity;
  let minimumMax75 = Infinity;
  for (let i = 0; i < trialCount; i++) {
    const picked = lengths.map(n => {
      const bucket = buckets[n];
      return bucket[rand() % bucket.length];
    });
    const text45 = [...picked.slice(0, 9).join('')];
    const text75 = [...picked.join('')];
    const s45 = spectrum(text45);
    const s75 = spectrum(text75);
    if (s45.distinct >= 23) unique45++;
    if (s45.max <= 3) flat45++;
    if (s45.distinct >= 23 && s45.max <= 3) both45++;
    if (s75.distinct >= 25 && s75.max <= 5) both75++;
    if (text75.filter(c => c === 'K').length === 1 &&
        s75.distinct >= 25 && s75.max <= 5) oneKAndBoth75++;
    minimumMax45 = Math.min(minimumMax45, s45.max);
    minimumMax75 = Math.min(minimumMax75, s75.max);
    if (i === 0) {
      const sample = picked.join('');
      const cipher = encrypt(sample);
      assert.equal(cipher.length, 75);
      assert.equal(decrypt(cipher), sample);
      assert.deepEqual(toRanks(cipher, page[0]).map(r => r === 28 ? 'K' : inverse.get(r)), [...sample]);
      const withK = sample.slice(0, 52) + 'K' + sample.slice(53);
      assert.equal(decrypt(encrypt(withK)), withK);
    }
  }
  // Intentionally allow rare counts to vary when a corpus is revised.
  assert.equal(both45, 0);
  assert.equal(both75, 0);
  console.log(JSON.stringify({
    reference: filename, sourceWords: words.length, source13: buckets[13].length,
    original13Exact: exact13.length, trials: trialCount,
    first45DistinctAtLeast23: unique45, first45MaxAtMost3: flat45,
    first45Both: both45, full75DistinctAtLeast25AndMaxAtMost5: both75,
    full75AlsoExactlyOneK: oneKAndBoth75,
    minMaxCount45: minimumMax45, minMaxCount75: minimumMax75
  }));
}
console.log('PASS: exact p55 source ranks, bijective encrypted positive plants, five native-source word-shape and flatness gates.');
