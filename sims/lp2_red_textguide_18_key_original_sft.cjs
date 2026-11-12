'use strict';

// Frozen source-transfer test: Cicada 2014 Stage04's 18-GP-token
// "WELCOME PILGRIM TO THE" text-guide Vigenere, independently reset at
// offset zero for each original LP2 red-ink span. No parameter search.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const annotations = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');

// Exact RUNE_LOOKUP insertion order and alternatives in the archived
// Stage04 reproducer. Reversing its keys gives the canonical LP2 rune order.
const RUNE_LOOKUP = new Map([
  ['ᛠ', ['F']], ['ᛡ', ['U']], ['ᚣ', ['TH']], ['ᚫ', ['O']], ['ᚪ', ['R']],
  ['ᛞ', ['C', 'K']], ['ᛟ', ['G']], ['ᛝ', ['W']], ['ᛚ', ['H']], ['ᛗ', ['N']],
  ['ᛖ', ['I']], ['ᛒ', ['J']], ['ᛏ', ['EO']], ['ᛋ', ['P']], ['ᛉ', ['X']],
  ['ᛈ', ['S', 'Z']], ['ᛇ', ['T']], ['ᛄ', ['B']], ['ᛁ', ['E']], ['ᚾ', ['M']],
  ['ᚻ', ['L']], ['ᚹ', ['NG', 'ING']], ['ᚷ', ['OE']], ['ᚳ', ['D']], ['ᚱ', ['A']],
  ['ᚩ', ['AE']], ['ᚦ', ['Y']], ['ᚢ', ['IO', 'IA']], ['ᚠ', ['EA']],
]);
const runeKeys = [...RUNE_LOOKUP.keys()].reverse();
const runeValues = [...RUNE_LOOKUP.values()];
const lookup = new Map(runeKeys.map((rune, i) => [rune, runeValues[i]]));
const keyValues = [...lookup.values()].reverse();
assert.deepEqual(runeKeys, corpus.runes, 'Stage04 and LP2 rune order must agree');

const KEY_PHRASE = 'WELCOME PILGRIM TO THE';
const keyText = KEY_PHRASE.replace(/\s+/g, '').toUpperCase();

// Literal archived helper: its non-consuming TH lookahead makes 19 shifts.
function sourceKeyToShifts(key, doubles = true) {
  const shifts = [];
  for (let i = 0; i < key.length; i++) {
    let lookupIndex = 0;
    for (const values of keyValues) {
      const before = shifts.length;
      const peek = i + 1 < key.length && doubles ? key[i + 1] : null;
      for (const token of values) {
        if (peek && key[i] + peek === token) shifts.push(lookupIndex + 1);
        else if (key[i] === token) shifts.push(lookupIndex + 1);
        else if (key[i] === ' ') shifts.push(0);
      }
      if (before < shifts.length) break;
      lookupIndex++;
    }
  }
  return shifts;
}

// Correct GP serialization used by the archived Stage04 reproducer's
// successful 18-symbol control: consume TH as one GP rune.
function gpRuneKeyToShifts(key) {
  const text = key.replace(/\s+/g, '').toUpperCase();
  const shifts = [];
  for (let i = 0; i < text.length;) {
    const pair = text.slice(i, i + 2);
    const pairIndex = keyValues.findIndex((values) => values.includes(pair));
    if (pairIndex !== -1) {
      shifts.push(pairIndex + 1);
      i += 2;
      continue;
    }
    const singleIndex = keyValues.findIndex((values) => values.includes(text[i]));
    assert.notEqual(singleIndex, -1, 'No GP rune for key character ' + text[i]);
    shifts.push(singleIndex + 1);
    i++;
  }
  return shifts;
}

const legacyKey = sourceKeyToShifts(keyText, true);
const key = gpRuneKeyToShifts(KEY_PHRASE);
assert.equal(legacyKey.length, 19);
assert.equal(key.length, 18);
assert.deepEqual(key, [22, 11, 9, 24, 26, 10, 11, 16, 19, 9, 23, 25, 19, 10, 13, 26, 27, 11]);

function decrypt(cipher, shifts = key, direction = 1) {
  let keyIndex = 0;
  let output = '';
  for (const symbol of cipher) {
    if (!lookup.has(symbol)) {
      output += symbol;
      continue;
    }
    const cipherIndex = runeKeys.indexOf(symbol);
    const plainRune = runeKeys[(cipherIndex + direction * shifts[keyIndex % shifts.length] + runeKeys.length) % runeKeys.length];
    output += plainRune;
    keyIndex++;
  }
  return { runes: output, keySymbolsConsumed: keyIndex };
}

function transliterate(runes) {
  return [...runes].map((rune) => lookup.has(rune) ? lookup.get(rune)[0] : rune).join('');
}

function transliterationVariants(runes) {
  let outputs = [''];
  for (const rune of runes) {
    if (!lookup.has(rune)) {
      outputs = outputs.map((prefix) => prefix + rune);
    } else {
      outputs = outputs.flatMap((prefix) => lookup.get(rune).map((choice) => prefix + choice));
    }
  }
  return outputs;
}

// Authentic historical positive control: the 2014 Stage04 small-image
// ciphertext must recover its archived fourth onion host under the same key.
const STAGE04_CIPHER = 'ᚦᛗᛞᛇᚠᛗᚪᚱ5ᚢᚫᛝᚱᛝ3ᛠᛗᛇᚠᛡ';
const EXPECTED_HOST = 'avowyfgl5lkzfj3n.onion'.toUpperCase().replaceAll('V', 'U').replaceAll('.', '');
const stage04 = decrypt(STAGE04_CIPHER);
const stage04Matches = transliterationVariants(stage04.runes).filter((candidate) => candidate === EXPECTED_HOST);
assert.equal(stage04.keySymbolsConsumed, 18);
assert.equal(stage04Matches.length, 1, 'Authentic Stage04 host must be uniquely recovered');

// Build page-global offsets and original textual separators. Hyphens delimit
// words; periods delimit/terminate words. Ignore periods that are the separately
// annotated large dot glyphs (10/13/23 dots), not textual punctuation.
const pageStarts = new Map();
let pageOffset = 0;
for (const page of corpus.pages) {
  pageStarts.set(page.page, pageOffset);
  assert.equal(page.indices.length, page.runic_count);
  pageOffset += page.runic_count;
}
const largePunctuation = new Set();
for (const page of annotations.pages) {
  for (const [localOffset] of (page.large_punctuation || [])) {
    largePunctuation.add(pageStarts.get(page.page) + localOffset);
  }
}
const runeSet = new Set(runeKeys);
const separators = [];
let transcriptionRuneCount = 0;
for (const character of transcription) {
  if (runeSet.has(character)) {
    transcriptionRuneCount++;
  } else if (character === '-' || character === '.') {
    separators.push({ offset: transcriptionRuneCount, character });
  }
}
const expectedRuneCount = corpus.pages.reduce((sum, page) => sum + page.runic_count, 0);
assert.equal(transcriptionRuneCount, expectedRuneCount);
assert.equal(transcriptionRuneCount, annotations.counts.runes);
assert.equal(annotations.counts.red, 225);

function renderWithOriginalBoundaries(runes, globalStart, globalEnd) {
  const internal = separators
    .filter((item) => item.offset > globalStart && item.offset < globalEnd)
    .filter((item) => item.character !== '.' || !largePunctuation.has(item.offset))
    .sort((a, b) => a.offset - b.offset);
  let cursor = 0;
  let output = '';
  for (const item of internal) {
    const relative = item.offset - globalStart;
    output += transliterate([...runes].slice(cursor, relative).join('')) + item.character;
    cursor = relative;
  }
  output += transliterate([...runes].slice(cursor).join(''));
  // Preserve a genuine textual full stop at the span end, but not a large-dot glyph.
  if (separators.some((item) => item.offset === globalEnd && item.character === '.' && !largePunctuation.has(item.offset))) {
    output += '.';
  }
  return output;
}

const spans = annotations.pages.flatMap((page) =>
  (page.red_spans || []).map((span) => ({ page: page.page, ...span }))
);
assert.equal(spans.length, 18);
assert.equal(spans.reduce((sum, span) => sum + span.length, 0), 225);

const results = spans.map((span) => {
  const page = corpus.pages.find((candidate) => candidate.page === span.page);
  assert.ok(page, 'Missing physical page ' + span.page);
  const originalRunes = page.indices
    .slice(span.start, span.start + span.length)
    .map((index) => corpus.runes[index])
    .join('');
  assert.equal(originalRunes, span.runes, 'Ink annotation must match canonical original rune sequence');
  const globalStart = pageStarts.get(span.page) + span.start;
  const globalEnd = globalStart + span.length;
  const decoded = decrypt(originalRunes);
  assert.equal(decoded.keySymbolsConsumed, span.length, 'Every rune must consume exactly one key symbol');
  return {
    page: span.page,
    start: span.start,
    length: span.length,
    cipherRunes: originalRunes,
    plaintextRunes: decoded.runes,
    sourceText: renderWithOriginalBoundaries(originalRunes, globalStart, globalEnd),
    textGuideOutput: renderWithOriginalBoundaries(decoded.runes, globalStart, globalEnd),
  };
});

// Keep the known p3/p39 Atbash observations separate from this text-guide test.
function atbash(runes) {
  return [...runes].map((rune) => {
    const index = runeKeys.indexOf(rune);
    assert.notEqual(index, -1);
    return runeKeys[28 - index];
  }).join('');
}
const p3Atbash = transliterate(atbash('ᛈᛞᚦ'));
const p39Atbash = transliterate(atbash('ᛡᚳᛋ'));
assert.equal(p3Atbash, 'SCY');
assert.equal(p39Atbash, 'UDP');

// Solved red spans are mode-change controls, not candidates for the unknown-page key.
const p56 = results.find((result) => result.page === 56);
const p57 = results.find((result) => result.page === 57);
assert.equal(p56.textGuideOutput, 'EOE-THIU');
assert.equal(p57.textGuideOutput, 'GGPMXUF');

console.log(JSON.stringify({
  keyPhrase: KEY_PHRASE,
  legacyNonConsumingKeyShiftCount: legacyKey.length,
  correctedGpKeyShifts: key,
  stage04PositiveControl: {
    cipher: STAGE04_CIPHER,
    decodedRunes: stage04.runes,
    matchingArchivedHost: stage04Matches[0],
    success: true,
  },
  originalInputCounts: {
    transcriptionRunes: transcriptionRuneCount,
    redSpans: spans.length,
    redRunes: spans.reduce((sum, span) => sum + span.length, 0),
  },
  heldOutControls: {
    p3Atbash: p3Atbash,
    p39Atbash: p39Atbash,
    p56SolvedPlaintext: 'AN END',
    p56TextGuideOutput: p56.textGuideOutput,
    p57SolvedPlaintext: 'PARABLE',
    p57TextGuideOutput: p57.textGuideOutput,
  },
  results,
}, null, 2));
