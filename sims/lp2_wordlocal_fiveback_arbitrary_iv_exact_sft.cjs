'use strict';
/**
 * One-file original-source gate: independent five-phase additive keys per word,
 * arbitrary five-rune first-block IV, ciphertext feedback at distance five.
 * GP29, exact original 2,896 joined printed words, source-native English lexicon.
 * SFT: node sims/lp2_wordlocal_fiveback_arbitrary_iv_exact_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encodeSourceNativeGP} = require('./lp2_native_gp_source_orthography_sft.cjs');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/lp2-transcription.txt');
const runeIndex = new Map(gp.runes.map((r, i) => [r, i]));
const runePattern = new RegExp('[' + gp.runes.join('') + ']+', 'gu');
const joined = transcription.split('%').slice(0, 55).join('%')
  .replace(/\/\r?\n/g, '').replace(/[\r\n%]/g, '');
const original = (joined.match(runePattern) || [])
  .map(w => Array.from(w, r => runeIndex.get(r)));
assert.equal(original.length, 2896);
assert.equal(original.reduce((n, w) => n + w.length, 0), 12956);
const dictionary = read('resources/control/english_wordfreq_textblob.txt')
  .split(/\r?\n/).filter(line => /^[a-z]+ \d+$/.test(line))
  .map(line => line.split(' ')[0]);
assert.equal(dictionary.length, 29157);
const mod29 = x => ((x % 29) + 29) % 29;

/**
 * C_i = P_i + k_(i mod5) + C_(i-5) for i>=5.
 * C_0..C_4 may be arbitrary, so the IV cancels only at j>=10.
 * For all j>=10:
 * C_j-2*C_(j-5)+C_(j-10) = P_j-P_(j-5) mod 29.
 * @param {number[]} w GP29 source word
 * @param {boolean} cipher Is w ciphertext?
 * @returns {string} Exact key-independent signature
 */
function signature(w, cipher) {
  const out = [];
  for (let j = 10; j < w.length; j++) {
    out.push(cipher
      ? mod29(w[j] - 2 * w[j - 5] + w[j - 10])
      : mod29(w[j] - w[j - 5]));
  }
  return out.join('.');
}
const dictionaryByLength = new Map();
for (const word of dictionary) {
  const p = encodeSourceNativeGP(word);
  if (p.length < 11 || p.length > 14) continue;
  let m = dictionaryByLength.get(p.length);
  if (!m) { m = new Map(); dictionaryByLength.set(p.length, m); }
  const s = signature(p, false);
  if (!m.has(s)) m.set(s, []);
  m.get(s).push(word);
}
const summary = [];
const rejected = [];
const pageRanges = [];
let pageStart = 0;
for (const p of gp.pages.filter(p => p.page < 56 && p.indices.length)) {
  pageRanges.push({page: p.page, start: pageStart, end: pageStart + p.indices.length});
  pageStart += p.indices.length;
}
assert.equal(pageStart, 12956);
let originalRune = 0;
for (let k = 0; k < original.length; k++) {
  const w = original[k];
  const n = w.length;
  if (n >= 11 && n <= 14) {
    let row = summary.find(r => r.length === n);
    if (!row) {
      row = {length: n, total: 0, matches: 0, unmatched: 0, FfreeUnmatched: 0};
      summary.push(row);
    }
    row.total++;
    const s = signature(w, true);
    if (dictionaryByLength.get(n)?.has(s)) row.matches++;
    else {
      row.unmatched++;
      if (!w.includes(0)) row.FfreeUnmatched++;
      const page = pageRanges.find(p => originalRune >= p.start && originalRune < p.end);
      assert(page);
      rejected.push({
        wordOrdinal: k + 1, page: page.page, pageOffset: originalRune - page.start,
        globalRune: originalRune, length: n, Ffree: !w.includes(0),
        signature: s, runes: w.map(r => gp.runes[r]).join('')
      });
    }
  }
  originalRune += n;
}
assert.equal(originalRune, 12956);
summary.sort((a, b) => a.length - b.length);
assert.deepEqual(summary.map(r =>
  [r.length, r.total, r.matches, r.unmatched, r.FfreeUnmatched]), [
  [11, 32, 32, 0, 0],
  [12, 18, 11, 7, 7],
  [13, 4, 0, 4, 2],
  [14, 3, 0, 3, 1]
]);
assert.equal(rejected.length, 14);
assert.equal(rejected.filter(r => r.Ffree).length, 10);

// Constructive tests at every one of the 57 original eligible long-word slots.
const fiveKeys = [2, 3, 5, 7, 11];
const initialOffsets = [1, 4, 9, 16, 25];
let plants = 0;
for (const row of summary) {
  const candidates = [...dictionaryByLength.get(row.length).values()].flat();
  for (let slot = 0; slot < row.total; slot++) {
    const plain = encodeSourceNativeGP(candidates[slot % candidates.length]);
    const cipher = [];
    for (let j = 0; j < plain.length; j++) {
      const predecessor = j < 5 ? initialOffsets[j] : cipher[j - 5];
      cipher.push(mod29(plain[j] + fiveKeys[j % 5] + predecessor));
    }
    const decode = cipher.map((c, j) => mod29(
      c - fiveKeys[j % 5] - (j < 5 ? initialOffsets[j] : cipher[j - 5])));
    assert.deepEqual(decode, plain);
    assert.equal(signature(cipher, true), signature(plain, false));
    assert(dictionaryByLength.get(row.length).has(signature(cipher, true)));
    plants++;
  }
}
assert.equal(plants, 57);
console.log(JSON.stringify({
  result: '14 original long words incompatible with this fixed additive model in native English',
  sourceWords: original.length, sourceRunes: originalRune,
  nativeDictionary: dictionary.length, summary,
  distinctSignatures: [...dictionaryByLength].map(([n, m]) => ({
    length: n, unique: m.size, possible: 29 ** (n - 10)
  })),
  exactSourceNativePositivePlants: plants, rejects: rejected
}, null, 2));
