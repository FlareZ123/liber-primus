'use strict';

/** Exact source-native GP29 lookahead spelling gate for Issue #2420, no secret maps or fitted keys. */
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const load = (p) => JSON.parse(readFileSync(path.join(root, p), 'utf8'));
const original = load('resources/liber-primus/lp2-corpus.json');
const solved = load('resources/external/relikd-solved-gp29-native-v1.json');
const printed = readFileSync(path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const index = new Map(original.runes.map((r, i) => [r, i]));
const glyph = original.translit;
const greedy = glyph.map((value, i) => ({ value, i })).sort((a, b) => b.value.length - a.value.length || a.i - b.i);

/** Segmentation is original source punctuation; physical page and line turns are non-word breaks. */
function words(src) {
  const result = [];
  let word = [];
  for (const ch of src) {
    if (index.has(ch)) {
      word.push(index.get(ch));
    } else if (ch === '-' || ch === '.' || ch === '•' || ch === '⁘' || ch === '⁜' || ch === '⁚') {
      if (word.length) result.push(word);
      word = [];
    }
  }
  if (word.length) result.push(word);
  return result;
}

/** Decode chart spellings literally; ambiguities are deliberate part of the hypothesis. */
function decode(word) {
  return word.map((r) => glyph[r]).join('');
}

/** Deterministic first-party chart-style longest-match 2-character lookahead. */
function encode(latin) {
  const out = [];
  while (latin.length) {
    const token = greedy.find(({ value }) => latin.startsWith(value));
    assert.ok(token, 'chart missing original alphabet glyph');
    out.push(token.i);
    latin = latin.slice(token.value.length);
  }
  return out;
}

assert.equal(original.pages.length, 58);
assert.equal(original.runes.length, 29);
assert.equal(glyph.length, 29);
assert.equal(glyph.filter((s) => s.length === 2).length, 7);
assert.equal(glyph.filter((s) => s.length === 1).length, 22);
assert.equal(glyph[21], 'NG'); // Literal two-letter chart spelling, even though solved ING is contextual.
const unknownText = printed.split('%').slice(0, 55).join('%');
const originalWords = words(unknownText);
assert.equal(originalWords.length, 2896);
const tape = originalWords.flat();
assert.equal(tape.length, 12956);
assert.deepEqual(tape, original.pages.filter((p) => p.page < 56).flatMap((p) => p.indices));
let bad = 0, shorter = 0, sameLengthDifferent = 0, extraCipherGlyphs = 0;
const examples = [];
for (let i = 0; i < originalWords.length; i++) {
  const source = originalWords[i], rest = encode(decode(source));
  if (source.join(',') === rest.join(',')) continue;
  bad++;
  if (rest.length < source.length) {
    shorter++;
    extraCipherGlyphs += source.length - rest.length;
  } else {
    assert.equal(rest.length, source.length);
    sameLengthDifferent++;
  }
  if (examples.length < 8) examples.push({
    printedWord: i, originalGp: source.map((x) => original.runes[x]).join(''),
    greedilyRetokenizedGp: rest.map((x) => original.runes[x]).join(''),
    latinLiteral: decode(source), lengthLoss: source.length - rest.length
  });
}
assert.equal(bad, 175);
assert.equal(shorter, 97);
assert.equal(sameLengthDifferent, 78);
assert.equal(extraCipherGlyphs, 100);

let sourceNativeWords = 0;
const controls = [];
for (const section of solved.sections) {
  const ws = words(section.source_text);
  const failures = ws.filter((w) => encode(decode(w)).join(',') !== w.join(','));
  sourceNativeWords += ws.length;
  assert.equal(failures.length, 0);
  controls.push({ name: section.name, words: ws.length, noncanonical: failures.length });
}
assert.equal(solved.sections.length, 9);
assert.equal(sourceNativeWords, 740);
assert.equal(controls.find((x) => x.name === 'p57_parable').words, 20);
assert.equal(controls.find((x) => x.name === 'p56_an_end').words, 25);
assert.ok(originalWords[0].length === 8);
assert.equal(decode(originalWords[0]), 'SHEOGMIAF');
// Genuine solved p57 direct original GP spellings have context-dependent English readings:
// ᛚᛁᚳᛖ = LICE under chart, but the known plaintext word is LIKE; ᛝ has ING reading.
const p57 = original.pages.find((p) => p.page === 57);
assert.deepEqual(original.runes.filter((s) => p57.indices.includes(index.get(s))).length > 0, true);
assert.equal(p57.indices.map((x) => original.runes[x]).join('').includes('ᛚᛁᚳᛖ'), true);

console.log(JSON.stringify({
  source: 'unchanged LP2 physical p0–55, printed complete words',
  sourceWordCount: originalWords.length, sourceRuneCount: tape.length,
  firstPartyChartSpelling: '22 singleton letters plus seven native digraphs, greedy 2-char lookahead',
  originalWordsThatDoNotRoundtrip: bad,
  originalWithOneOrMoreFewerGreedyRunes: shorter,
  originalSameLengthButDifferentSegmentation: sameLengthDifferent,
  totalRuneLengthLossUnderGreedy: extraCipherGlyphs,
  independentSolvedSource: { totalWords: sourceNativeWords, controls },
  examples,
  decision: 'Original sender must specify an additional escape/segmentation rule and state/recipient; no authentic unknown plaintext'
}, null, 2));
console.log('PASS exact chart, 2,896 original source words, 740 solved-native positive controls');
