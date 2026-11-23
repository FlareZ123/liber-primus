'use strict';

/**
 * Source-led, no-search 18-red-span / Hovamol 18 spell correspondence.
 * Source stanza numbers 147..163 and 165; number164 is the interlude
 * before the eighteenth charm. Source-original exact red spans, original
 * p53 complete 12-word source layout, genuine GP29 native word dictionary.
 * Tests the three conventional same-phase Vigenere group operations.
 *
 * Node.js22 CommonJS, Windows11, read-only, no external libraries.
 * A valid native-GP English paragraph must survive the original complete
 * printed word boundaries and reconstruct the full original ciphertext.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const B = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const poem = JSON.parse(read('resources/control/hovamol_bellows_1923_stanzas.json'));
const runeIndex = new Map(B.runes.map((r, i) => [r, i]));
const runeTokens = B.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
/** Source-calibrated English native GP spellings; no unknown LP2 plaintext. */
function native(word) {
  const text = word.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const result = [];
  for (let i = 0; i < text.length;) {
    if (text.startsWith('ING', i)) {result.push(21); i += 3;}
    else if (text.startsWith('IO', i)) {result.push(27); i += 2;}
    else {
      const t = runeTokens.find(t => text.startsWith(t.s, i));
      assert(t, 'unsupported token in native source: ' + text.slice(i));
      result.push(t.i); i += t.s.length;
    }
  }
  return result;
}
const red = ink.pages.flatMap(p => (p.red_spans || [])
  .map(s => ({
    page: p.page, sourceLocalIndex: s.start,
    indices: [...s.runes].map(r => {
      const i = runeIndex.get(r);
      assert.notEqual(i, undefined, 'unknown source red glyph');
      return i;
    })
  })));
const spellStanzas = poem.stanzas.filter(s =>
  s.stanza >= 147 && s.stanza <= 163 || s.stanza === 165);
assert.equal(red.length, 18);
assert.equal(spellStanzas.length, 18);
assert.deepEqual(spellStanzas.map(s => s.stanza),
  [147,148,149,150,151,152,153,154,155,
    156,157,158,159,160,161,162,163,165]);
const key = spellStanzas.map(s => s.words.flatMap(native));
assert(key.every((s, i) => s.length >= red[i].indices.length));
for (const span of red) {
  const sourcePage = B.pages.find(p => p.page === span.page);
  assert.deepEqual(span.indices, sourcePage.indices.slice(
    span.sourceLocalIndex, span.sourceLocalIndex + span.indices.length));
}
assert.equal(red[14].page, 53);
assert.equal(red[14].indices.length, 51);
assert.equal(spellStanzas[14].stanza, 161);
assert.equal(red[17].page, 57);
assert.equal(red[17].indices.map(x => B.translit[x]).join(''), 'PARABLE');

/** @typedef {'minus'|'plus'|'beaufort'} Mode */
/** @param {number} c @param {number} k @param {Mode} mode */
function inverse(c, k, mode) {
  if (mode === 'minus') return (c - k + 29) % 29;
  if (mode === 'plus') return (c + k) % 29;
  return (k - c + 29) % 29;
}
/** @param {number} p @param {number} k @param {Mode} mode */
function forward(p, k, mode) {
  if (mode === 'minus') return (p + k) % 29;
  if (mode === 'plus') return (p - k + 29) % 29;
  return (k - p + 29) % 29;
}
const dictionary = new Set();
const candidates = new Map();
for (const row of read('resources/control/english_wordfreq_textblob.txt').split(/\r?\n/)) {
  const m = row.match(/^([a-z]+) (\d+)$/);
  if (!m) continue;
  const coded = native(m[1]);
  dictionary.add(coded.join(','));
  const current = candidates.get(coded.length);
  if (!current || current.freq < Number(m[2])) {
    candidates.set(coded.length, {word: m[1],code: coded,freq: Number(m[2])});
  }
}
assert.equal(dictionary.size, 29060);
const lengths = [5,4,4,11,2,3,2,6,5,5,2,2];
assert.equal(lengths.reduce((a,b)=>a+b,0), 51);
/** @param {number[]} seq @returns {{spelling:string,isDictionary:boolean}[]} */
function printedWords(seq) {
  let pos = 0;
  return lengths.map(n => {
    const part = seq.slice(pos, pos + n);
    pos += n;
    return {spelling: part.map(i => B.translit[i]).join(''),
      isDictionary: dictionary.has(part.join(','))};
  });
}
const modes = /** @type {Mode[]} */ (['minus','plus','beaufort']);
const results = [];
for (const mode of modes) {
  const actual = red[14].indices.map((c, i) => inverse(c, key[14][i], mode));
  assert.deepEqual(actual.map((p, i) => forward(p, key[14][i], mode)),
    red[14].indices, 'entire source p53 replay');
  const matchedWords = printedWords(actual);
  // A planted exact original printed-word-shaped GP passage tests the
  // same inverse: each word is chosen independently from public dictionary.
  const plantPlain = lengths.flatMap(n => {
    assert(candidates.has(n), 'no native-GP planted dictionary word length ' + n);
    return candidates.get(n).code;
  });
  assert.equal(plantPlain.length, 51);
  assert.equal(printedWords(plantPlain).filter(w => w.isDictionary).length, 12);
  const plantedCipher = plantPlain.map((p,i)=>forward(p,key[14][i],mode));
  assert.deepEqual(plantedCipher.map((c,i)=>inverse(c,key[14][i],mode)),
    plantPlain);
  results.push({
    mode,
    originalP53RecognizedWords: matchedWords.filter(w => w.isDictionary).length,
    originalP53Words: matchedWords,
    sourceNativePositiveRecognizedWords: 12,
    sourceOriginalFullReplay: true
  });
}
assert.deepEqual(results.map(r => r.originalP53RecognizedWords),[1,0,1]);
const labels = red.map((s,i)=>({
  span: i+1,page:s.page,sourceOffset:s.sourceLocalIndex,
  runes:s.indices.length,spellStanza:spellStanzas[i].stanza
}));
console.log(JSON.stringify({
  original: {redSpans: 18, unknownPageRedSpans: 16,
    clearSolvedLastSpan: 'PARABLE',
    p53CompleteWordLengths: lengths},
  firstPartySourceKey: {historical: 'Hovamol Bellows 1923, spells1-18',
    spelling: 'genuine solved-Cicada native GP29',
    mapping: 'one chronological spell stanza to one original red span',
    keyPhase: 0, noPrivateParameters: true},
  sourceLabels: labels,
  p53Red51: results,
  decision: 'No complete native-GP paragraph under the three direct stanza-key Vigenere conventions; the 18-count resemblance supplies no source-selected cipher or plaintext.'
}, null, 2));
console.log('PASS: original p53 18-spell / red18 key-source bounded inverses.');
