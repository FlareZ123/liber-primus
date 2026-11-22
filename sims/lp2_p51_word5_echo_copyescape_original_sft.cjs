'use strict';
/**
 * Original p51 five-back echo and reversible GP29 copy-escape gate.
 * Run: node sims/lp2_p51_word5_echo_copyescape_original_sft.cjs
 * Tests a fixed plaintext escape rune E copied from C[j-5] for j>=5.
 * All other plaintext runes map bijectively under an unrestricted 28-ary
 * key to the 28 outputs different from C[j-5]. Original printed words
 * and GP29 spelling are preserved. This is only a direct one-layer model.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encodeSourceNativeGP} = require('./lp2_native_gp_source_orthography_sft.cjs');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ids = new Map(gp.runes.map((r, i) => [r, i]));
const source = read('resources/liber-primus/lp2-transcription.txt')
  .split('%').slice(0, 55).join('%');
const original = [];
let word = [], start = 0, offset = 0;
for (const ch of source) {
  if (ids.has(ch)) {
    if (!word.length) start = offset;
    word.push(ids.get(ch)); offset++;
  } else if (ch !== '/' && ch !== '%' && !/\s/u.test(ch)) {
    if (word.length) original.push({word, start});
    word = [];
  }
}
if (word.length) original.push({word, start});
assert.equal(original.length, 2896);
assert.equal(offset, 12956);
const pages = [];
let pos = 0;
for (const p of gp.pages.filter(p => p.page < 56 && p.indices.length)) {
  pages.push({page:p.page, begin:pos, end:pos+p.indices.length});
  pos += p.indices.length;
}
assert.equal(pos, 12956);
/** @param {number[]} w @returns {number} */
function maxRun(w) {
  let run = 0, longest = 0;
  for (let j = 5; j < w.length; j++) {
    run = w[j] === w[j - 5] ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  return longest;
}
const runs = [0, 0, 0, 0];
for (const r of original) runs[Math.min(3, maxRun(r.word))]++;
assert.deepEqual(runs, [2803, 85, 7, 1]);
const target = original[2722];
const page = pages.find(p => target.start >= p.begin && target.start < p.end);
assert.equal(page.page, 51);
assert.equal(target.start - page.begin, 43);
assert.deepEqual(target.word, [15, 23, 21, 6, 20, 15, 23, 21]);
assert.equal(maxRun(target.word), 3);
console.log('Authentic p51 local43 #2723 word: S D NG G L S D NG');
console.log('Whole original wordwise maximum-five-back-run histogram:', runs);
const mod = (x, n) => (x % n + n) % n;
/** @param {number[]} p @param {number} E @param {number[]} k */
function encrypt(p, E, k) {
  const c = [];
  for (let j = 0; j < p.length; j++) {
    if (j < 5) c.push(mod(p[j] + k[j % k.length], 29));
    else {
      const rank = p[j] < E ? p[j] : p[j] - 1;
      c.push(p[j] === E ? c[j-5] :
        mod(c[j-5] + 1 + mod(rank+k[j % k.length], 28), 29));
    }
  }
  return c;
}
/** @param {number[]} c @param {number} E @param {number[]} k */
function decrypt(c, E, k) {
  const p = [];
  for (let j = 0; j < c.length; j++) {
    if (j < 5) p.push(mod(c[j] - k[j % k.length], 29));
    else if (c[j] === c[j-5]) p.push(E);
    else {
      const rank = mod(mod(c[j]-c[j-5]-1, 29)-k[j%k.length], 28);
      p.push(rank < E ? rank : rank + 1);
    }
  }
  return p;
}
let seed = 0x52c01c6a;
/** @param {number} n @returns {number} */
function rand(n) {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) % n;
}
const english = read('resources/control/english_wordfreq_textblob.txt')
  .split(/\r?\n/u).filter(x => /^[a-z]+ \d+$/u.test(x))
  .map(x => encodeSourceNativeGP(x.split(' ')[0]));
assert.equal(english.length, 29157);
let positive = 0;
for (const p of english) {
  if (p.length < 6 || positive === 1000) continue;
  const E = rand(29), k = Array.from({length:13}, () => rand(28));
  const c = encrypt(p, E, k);
  assert.deepEqual(decrypt(c, E, k), p);
  for (let j = 5; j < p.length; j++)
    assert.equal(c[j] === c[j-5], p[j] === E);
  positive++;
}
assert.equal(positive, 1000);
const nativeEight = english.filter(w => w.length === 8);
const englishWordList = read('resources/control/english_wordfreq_textblob.txt')
  .split(/\r?\n/u).filter(x => /^[a-z]+ \d+$/u.test(x))
  .map(x => x.split(' ')[0]);
const englishThreeCopy = englishWordList.filter((w, i) =>
  english[i].length === 8 &&
  [0, 1, 2].every(j => english[i][j] === english[i][j+5]));
assert.deepEqual(englishThreeCopy, ['mesdames']);
const latinAlphabet = '0123456789ABCDEFGHIJKLMNOPQRS';
const latinEight = read('resources/control/latin-vulgate-gp-wholewords.txt')
  .split(/\r?\n/u).filter(x => /^[0-9A-S]{8}$/u.test(x))
  .map(s => Array.from(s, ch => latinAlphabet.indexOf(ch)));
const latinThreeCopy = latinEight.filter(w =>
  [0, 1, 2].every(j => w[j] === w[j+5]));
assert.deepEqual(Array.from(new Set(latinThreeCopy.map(w =>
  w.map(x => latinAlphabet[x]).join('')))), ['G14HIG14']);
assert.equal(latinThreeCopy.length, 2);
console.log('Only native original-equality-pattern candidates for p51 echo:',
  {english:englishThreeCopy,latin:'TURBETUR (two occurrences)'});
for (let E = 0; E < 29; E++) {
  assert.equal(nativeEight.filter(w =>
    w[5] === E && w[6] === E && w[7] === E).length, 0);
  assert.equal(latinEight.filter(w =>
    w[5] === E && w[6] === E && w[7] === E).length, 0);
}
console.log('No word with a triple identical final GP rune in source English or Latin 8-rune dictionaries; no direct fixed-E copy escape survivor');
const repeated = original.filter(r => r.word.length >= 6 &&
  new Set(r.word).size < r.word.length)
  .map(r => ({word:r.word,
    mask:r.word.slice(1).map((v, i) => +(v === r.word[i]))}));
assert.equal(repeated.length, 441);
/** @param {number[]} src @returns {number[]} */
function shuffle(src) {
  const v = src.slice();
  for (let i = v.length-1; i > 0; i--) {
    const j = rand(i+1);
    [v[i],v[j]] = [v[j],v[i]];
  }
  return v;
}
/** @param {number[]} w @param {number[]} mask */
function valid(w, mask) {
  for (let j = 1; j < w.length; j++)
    if (+(w[j] === w[j-1]) !== mask[j-1]) return false;
  return true;
}
seed = 0x52c01c6a;
const N = 10000;
let wordsRun2 = 0, wordsRun3 = 0, high2 = 0, high3 = 0;
for (let t = 0; t < N; t++) {
  let c2 = 0, c3 = 0;
  for (const {word:w, mask} of repeated) {
    let candidate;
    do {candidate = shuffle(w);} while (!valid(candidate, mask));
    const r = maxRun(candidate);
    c2 += +(r >= 2);
    c3 += +(r >= 3);
  }
  wordsRun2 += c2;
  wordsRun3 += c3;
  high2 += +(c2 >= 8);
  high3 += +(c3 >= 1);
}
assert.equal(high2, 5);
assert.equal(high3, 410);
console.log({sampled:N,meanRun2:wordsRun2/N,meanRun3:wordsRun3/N,
  pAtLeast8Run2:high2/N,pAtLeast1Run3:high3/N,
  positiveOriginalShapeInverse:positive});
console.log('PASS original source five-back run and direct reversible copy escape obstruction');
