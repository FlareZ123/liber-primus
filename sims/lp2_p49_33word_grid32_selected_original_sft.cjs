'use strict';

/**
 * Read-only original-source test: 33 authentic words before p49's grid and
 * 32 visually printed grid rows. For row r, select col=(GP rune length
 * of source word r) mod 8. Frozen first/last 32 whole words, 2 GP29
 * byte translations and 2 ordinary additive signs, full 308-rune flanks.
 * Run: node sims/lp2_p49_33word_grid32_selected_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = (name) => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt');
const grid = JSON.parse(read('resources/liber-primus/base60-grid.json')).byte_rows;
const dictionary = read('resources/control/english_wordfreq_textblob.txt');
const parts = transcript.split(/^\s*%\s*$/m);
const runeIndices = new Map(corpus.runes.map((rune, i) => [rune, i]));
/** @param {string} s @returns {number[][]} */
function words(s) {
  return (s.replace(/\/\s*/gu, '').match(/[\u16A0-\u16FF]+/gu) || [])
    .map((w) => [...w].map((r) => {
      const value = runeIndices.get(r);
      assert.notEqual(value, undefined);
      return value;
    }));
}
const before = words(parts[48].slice(parts[48].lastIndexOf('.') + 1) + parts[49]);
const after = words(parts[50] + parts[51].slice(0, parts[51].indexOf('.') + 1));
const page = (number) => corpus.pages.find((p) => p.page === number).indices;
assert.deepEqual(before.flat(), page(48).slice(-72).concat(page(49)));
assert.deepEqual(after.flat(), page(51).concat(page(52).slice(0, 78)));
assert.deepEqual([before.length, before.flat().length, after.length, after.flat().length], [33, 138, 40, 170]);
assert.equal(grid.length, 32);
assert.ok(grid.every((row) => row.length === 8 && row.every((x) => Number.isInteger(x) && x >= 0 && x < 256)));
const tokens = corpus.translit.map((token, i) => ({ token, i })).sort((a, b) => b.token.length - a.token.length);
/** @param {string} w @returns {string|null} */
function encode(w) {
  const normalized = w.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S').replace(/ING/g, 'NG').replace(/IO/g, 'IA');
  const result = [];
  for (let i = 0; i < normalized.length;) {
    const match = tokens.find((entry) => normalized.startsWith(entry.token, i));
    if (!match) return null;
    result.push(match.i);
    i += match.token.length;
  }
  return result.join(',');
}
const lexical = new Set();
for (const line of dictionary.match(/^[a-z]+\s+\d+$/gm) || []) {
  const encoded = encode(line.split(/\s+/u)[0]);
  if (encoded !== null) lexical.add(encoded);
}
assert.equal(lexical.size, 29058);
const allWords = before.concat(after), cipher = allWords.flat();
const positive = Array.from({ length: cipher.length }, (_, i) => page(57)[i % page(57).length]);
/** @param {number[]} indices @returns {number} */
function ioc(indices) {
  const counts = Array(29).fill(0);
  for (const index of indices) counts[index]++;
  return counts.reduce((acc, count) => acc + count * (count - 1), 0)
    / (indices.length * (indices.length - 1));
}
/** @param {number[]} indices @returns {{before:number,after:number,matchList:{i:number,word:string}[]}} */
function lexicalMatches(indices) {
  let offset = 0, nBefore = 0, nAfter = 0;
  const matchList = [];
  for (let i = 0; i < allWords.length; i++) {
    const decoded = indices.slice(offset, offset + allWords[i].length);
    if (lexical.has(decoded.join(','))) {
      if (i < before.length) nBefore++; else nAfter++;
      matchList.push({ i, word: decoded.map((r) => corpus.translit[r]).join('') });
    }
    offset += allWords[i].length;
  }
  return { before: nBefore, after: nAfter, matchList };
}
const results = [];
for (const selector of ['first32', 'last32']) {
  const selectedWords = selector === 'first32' ? before.slice(0, 32) : before.slice(1);
  const selected = selectedWords.map((word, row) => grid[row][word.length % 8]);
  assert.equal(selected.length, 32);
  for (const byteReading of ['mod29', 'base29pair']) {
    const key = byteReading === 'mod29'
      ? selected.map((b) => b % 29)
      : selected.flatMap((b) => [Math.floor(b / 29), b % 29]);
    assert.ok(key.every((k) => Number.isInteger(k) && k >= 0 && k < 29));
    for (const encryptionSign of [1, -1]) {
      const decoded = cipher.map((c, i) => ((c - encryptionSign * key[i % key.length]) % 29 + 29) % 29);
      const recovered = decoded.map((p, i) => ((p + encryptionSign * key[i % key.length]) % 29 + 29) % 29);
      assert.deepEqual(recovered, cipher);
      const planted = positive.map((p, i) => ((p + encryptionSign * key[i % key.length]) % 29 + 29) % 29);
      const positiveDecoded = planted.map((c, i) => ((c - encryptionSign * key[i % key.length]) % 29 + 29) % 29);
      assert.deepEqual(positiveDecoded, positive);
      const { before: preWords, after: postWords, matchList } = lexicalMatches(decoded);
      results.push({
        selector, byteReading, encryptionSign,
        keyBytes: selected.map((b) => b.toString(16).padStart(2, '0')).join(''),
        keyGP29: key.length, ioc: ioc(decoded), preWords, postWords,
        lexicalMatches: matchList
      });
    }
  }
}
const scores = results.map((r) => ({
  selector: r.selector, byteReading: r.byteReading, encryptionSign: r.encryptionSign,
  ioc: Number(r.ioc.toFixed(8)), preWords: r.preWords, postWords: r.postWords
}));
assert.deepEqual(scores, [
  { selector: 'first32', byteReading: 'mod29', encryptionSign: 1, ioc: 0.03441347, preWords: 1, postWords: 6 },
  { selector: 'first32', byteReading: 'mod29', encryptionSign: -1, ioc: 0.03344050, preWords: 0, postWords: 3 },
  { selector: 'first32', byteReading: 'base29pair', encryptionSign: 1, ioc: 0.03625365, preWords: 0, postWords: 4 },
  { selector: 'first32', byteReading: 'base29pair', encryptionSign: -1, ioc: 0.03665553, preWords: 2, postWords: 6 },
  { selector: 'last32', byteReading: 'mod29', encryptionSign: 1, ioc: 0.03466729, preWords: 2, postWords: 4 },
  { selector: 'last32', byteReading: 'mod29', encryptionSign: -1, ioc: 0.03460383, preWords: 1, postWords: 3 },
  { selector: 'last32', byteReading: 'base29pair', encryptionSign: 1, ioc: 0.03553450, preWords: 2, postWords: 5 },
  { selector: 'last32', byteReading: 'base29pair', encryptionSign: -1, ioc: 0.03371547, preWords: 0, postWords: 5 }
]);
console.log(JSON.stringify({
  original: { preRunes: 138, preWords: 33, postRunes: 170, postWords: 40, tableRows: 32, tableCols: 8 },
  hypothesis: '33 complete preceding word-lengths select 32 table rows, column L modulo8, generated byte key in printed row order',
  assumptions: ['length-column selector and one extra word', 'table conventional base60', 'GP29 additive cipher with 32/64 repeating digits'],
  sourceKeys: Object.fromEntries([...new Set(results.map((r) => r.selector))].map((s) => [s, results.find((r) => r.selector === s).keyBytes])),
  checks: ['source page join exact', 'all 8 full original reencrypt', 'all 8 synthetic solved-p57 308-rune inverse'],
  variants: results,
  conclusion: 'No 138-rune table caption plaintext and no independent 170-rune post-table language. Source-selected algorithm/key not established.'
}, null, 2));
