'use strict';

/**
 * Source-fixed GP29 long-period attack: 1033 and 3301 are printed in the
 * cuneiform register of the original LP2 physical pages 33--39.
 * Every input is the checked-in 2014 original transcription or a separately
 * committed native-language positive control.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const originalPages = corpus.pages.filter((p) => p.page <= 55 && p.indices.length > 0);
const original = originalPages.flatMap((p) => p.indices);
assert.equal(originalPages.length, 55);
assert.equal(original.length, 12956);
const sectionBounds = [[0, 2], [3, 7], [8, 14], [15, 22], [23, 26], [27, 32], [33, 39], [40, 53], [54, 55]];
const chapters = sectionBounds.map(([first, last]) =>
  originalPages.filter((p) => p.page >= first && p.page <= last).flatMap((p) => p.indices));
assert.deepEqual(chapters.map((c) => c.length), [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308]);

/** GP29-native approximate orthography used only for an independently sourced positive control. */
function nativeEnglish(text) {
  const alphabet = new Map(corpus.translit.map((token, index) => [token, index]));
  const normalized = text.toUpperCase().replace(/[VK]/g, (letter) => letter === 'V' ? 'U' : 'C')
    .replace(/[ZQ]/g, (letter) => letter === 'Z' ? 'S' : 'C');
  const special = ['ING', 'TH', 'NG', 'EO', 'OE', 'AE', 'IA', 'EA'];
  const numbers = [];
  for (let index = 0; index < normalized.length;) {
    let width = 0;
    for (const token of special) {
      if (normalized.startsWith(token, index)) {
        numbers.push(alphabet.get(token === 'ING' ? 'NG' : token));
        width = token.length;
        break;
      }
    }
    if (width === 0) {
      if (alphabet.has(normalized[index])) numbers.push(alphabet.get(normalized[index]));
      width = 1;
    }
    index += width;
  }
  return numbers;
}

const gibran = fs.readFileSync(path.join(root, 'resources', 'control', 'gibran_prophet_58585.txt'), 'utf8');
const proseStart = gibran.indexOf('Almustafa');
assert(proseStart > 0);
const native = nativeEnglish(gibran.slice(proseStart)).slice(0, original.length);
assert.equal(native.length, original.length);
assert.equal(native.filter((letter) => letter === 28).length, 148);

/** Convert successive GP29 ciphertext symbols to 29 directed-step classes.
 *  Code 28 is the repeated-predecessor event, codes 0..27 are nonzero steps.
 */
function rankSteps(cipher) {
  let previous = 0;
  return cipher.map((symbol) => {
    const step = (symbol - previous + 29) % 29;
    previous = symbol;
    return step === 0 ? 28 : step - 1;
  });
}

/** Deterministic, merely synthetic periodic key for powered positive controls. */
function fixedKey(period, modulus) {
  let state = 0x33011033;
  const key = [];
  for (let i = 0; i < period; i++) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    key.push((state >>> 0) % modulus);
  }
  return key;
}

/** Standard GP29 additive Vigenere; returns exact ordinary GP rune indices. */
function additiveEncode(plain, period) {
  const key = fixedKey(period, 29);
  return plain.map((symbol, i) => (symbol + key[i % period]) % 29);
}

/**
 * Reversible anti-adjacent-repeat chain: EA/GP28 produces a zero step;
 * all other plaintext symbols use a periodically keyed nonzero step.
 * This is an experimental cipher architecture, not claimed Cicada usage.
 */
function constrainedEncode(plain, period) {
  const key = fixedKey(period, 28);
  let previous = 0;
  return plain.map((symbol, i) => {
    const step = symbol === 28 ? 0 : 1 + (symbol + key[i % period]) % 28;
    previous = (previous + step) % 29;
    return previous;
  });
}

/** Exact inverse for the constructed reversible chain. */
function constrainedDecode(cipher, period) {
  const key = fixedKey(period, 28);
  return rankSteps(cipher).map((symbol, i) =>
    symbol === 28 ? 28 : (symbol - key[i % period] + 28) % 28);
}

/** Equality test across one fixed source-selected period, without a shift search. */
function lag(a, period) {
  let same = 0;
  for (let i = period; i < a.length; i++) if (a[i] === a[i - period]) same++;
  return { pairs: Math.max(a.length - period, 0), equal: same };
}

/** Aggregate only within original 9 chapter boundaries. */
function chaptersAt(chap, period, transform = (a) => a) {
  return chap.reduce((sum, a) => {
    const s = lag(transform(a), period);
    return { pairs: sum.pairs + s.pairs, equal: sum.equal + s.equal };
  }, { pairs: 0, equal: 0 });
}

/** Pair count across the same local rune position of all 55 original pages. */
function pageAlignedPairs(pageArrays) {
  const maxLength = Math.max(...pageArrays.map((x) => x.length));
  let pairs = 0;
  let equal = 0;
  for (let j = 0; j < maxLength; j++) {
    const frequency = new Array(29).fill(0);
    let size = 0;
    for (const p of pageArrays) if (p.length > j) {
      frequency[p[j]]++;
      size++;
    }
    pairs += size * (size - 1) / 2;
    for (const f of frequency) equal += f * (f - 1) / 2;
  }
  return { pairs, equal };
}

function zUniform({ pairs, equal }) {
  const p = 1 / 29;
  return (equal - pairs * p) / Math.sqrt(pairs * p * (1 - p));
}

const globalRank = rankSteps(original);
const periodOut = [];
for (const period of [1033, 3301]) {
  const additive = additiveEncode(native, period);
  const antiRepeat = constrainedEncode(native, period);
  assert.deepEqual(constrainedDecode(antiRepeat, period), native);
  const nativeLag = lag(native, period);
  assert.equal(lag(additive, period).equal, nativeLag.equal);
  assert.equal(lag(rankSteps(antiRepeat), period).equal, nativeLag.equal);
  periodOut.push({
    period,
    raw: lag(original, period),
    rank: lag(globalRank, period),
    plantedNative: nativeLag,
  });
}
assert.deepEqual(periodOut.map((x) => [x.raw.pairs, x.raw.equal, x.rank.equal, x.plantedNative.equal]),
  [[11923, 422, 436, 740], [9655, 326, 354, 616]]);

const original1033Chapter = chaptersAt(chapters, 1033);
const original1033ChapterRank = chaptersAt(chapters, 1033, rankSteps);
let chapterOffset = 0;
const nativeChapters = chapters.map((c) => {
  const part = native.slice(chapterOffset, chapterOffset + c.length);
  chapterOffset += c.length;
  return part;
});
const planted1033Chapter = chaptersAt(nativeChapters, 1033);
assert.deepEqual(chaptersAt(nativeChapters.map((p) => additiveEncode(p, 1033)), 1033), planted1033Chapter);
assert.deepEqual(chaptersAt(nativeChapters.map((p) => constrainedEncode(p, 1033)), 1033, rankSteps),
  planted1033Chapter);
for (const part of nativeChapters) assert.deepEqual(constrainedDecode(constrainedEncode(part, 1033), 1033), part);
assert.deepEqual([original1033Chapter, original1033ChapterRank, planted1033Chapter],
  [{ pairs: 4700, equal: 181 }, { pairs: 4700, equal: 180 }, { pairs: 4700, equal: 269 }]);

const originalPageAligned = pageAlignedPairs(originalPages.map((p) => p.indices));
const originalPageRank = pageAlignedPairs(originalPages.map((p) => rankSteps(p.indices)));
let pageOffset = 0;
const nativePages = originalPages.map((p) => {
  const part = native.slice(pageOffset, pageOffset + p.indices.length);
  pageOffset += p.indices.length;
  return part;
});
const plantedPageAligned = pageAlignedPairs(nativePages);
assert.deepEqual(pageAlignedPairs(nativePages.map((p) => additiveEncode(p, 1033))), plantedPageAligned);
assert.deepEqual(pageAlignedPairs(nativePages.map((p) => rankSteps(constrainedEncode(p, 1033)))),
  plantedPageAligned);
for (const part of nativePages) assert.deepEqual(constrainedDecode(constrainedEncode(part, 1033), 1033), part);
assert.deepEqual([originalPageAligned, originalPageRank, plantedPageAligned],
  [{ pairs: 311132, equal: 10751 }, { pairs: 311132, equal: 11058 }, { pairs: 311132, equal: 18657 }]);

/* Distinct word-index 1033 clock: the 2016 signed clue explicitly mentions words
 * and numbers. The source transcription has no % separator for rune-free p50. */
const originalText = fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8');
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const flattenedUnknown = originalText.split('%').slice(0, 55).join('').replace(/[/%\s]/g, '');
const originalWords = flattenedUnknown.split(/[-.]/).map((word) =>
  Array.from(word).map((rune) => runeIndex.get(rune)).filter((index) => index !== undefined))
  .filter((word) => word.length > 0);
assert.equal(originalWords.length, 2896);
assert.deepEqual(originalWords.flat(), original);
const nativeWords = (gibran.slice(proseStart).match(/[A-Za-z]+/g) || [])
  .map(nativeEnglish).filter((word) => word.length > 0).slice(0, originalWords.length);
assert.equal(nativeWords.length, 2896);

/** Word-index clock; individual letters can use separate secret positions. */
function wordLag(words, period) {
  let first = 0;
  let last = 0;
  let pairs = 0;
  let equal = 0;
  for (let i = period; i < words.length; i++) {
    const a = words[i];
    const b = words[i - period];
    if (a[0] === b[0]) first++;
    if (a[a.length - 1] === b[b.length - 1]) last++;
    for (let j = 0; j < Math.min(a.length, b.length); j++) {
      pairs++;
      if (a[j] === b[j]) equal++;
    }
  }
  return { words: words.length - period, first, last, pairs, equal };
}

const originalWordLag = wordLag(originalWords, 1033);
const originalWordChainLag = wordLag(originalWords.map(rankSteps), 1033);
const plantedWordLag = wordLag(nativeWords, 1033);
assert.deepEqual(originalWordLag, { words: 1863, first: 76, last: 63, pairs: 5940, equal: 228 });
assert.deepEqual(originalWordChainLag, { words: 1863, first: 76, last: 60, pairs: 5940, equal: 220 });
assert.deepEqual(plantedWordLag, { words: 1863, first: 122, last: 181, pairs: 5221, equal: 463 });

/* End-of-word equality is invariant only when the key repeats at a single
 * shift per WORD; a separate shift at each character changes the last-key slot
 * whenever the two words have different lengths. */
const wordScalarKey29 = fixedKey(1033, 29);
const scalarWordCipher = nativeWords.map((word, i) => word.map((symbol) =>
  (symbol + wordScalarKey29[i % 1033]) % 29));
assert.deepEqual(wordLag(scalarWordCipher, 1033), plantedWordLag);
assert.deepEqual(scalarWordCipher.map((word, i) => word.map((symbol) =>
  (symbol - wordScalarKey29[i % 1033] + 29) % 29)), nativeWords);

const wordScalarKey28 = fixedKey(1033, 28);
const scalarWordChain = nativeWords.map((word, i) => {
  const key = wordScalarKey28[i % 1033];
  let previous = 0;
  return word.map((symbol) => {
    const step = symbol === 28 ? 0 : 1 + (symbol + key) % 28;
    previous = (previous + step) % 29;
    return previous;
  });
});
assert.deepEqual(wordLag(scalarWordChain.map(rankSteps), 1033), plantedWordLag);
assert.deepEqual(scalarWordChain.map((word, i) => rankSteps(word).map((symbol) =>
  symbol === 28 ? 28 : (symbol - wordScalarKey28[i % 1033] + 28) % 28)), nativeWords);

/** End-of-word equality is *not* invariant for an independently keyed position. */
function alignedOnly(stats) {
  return { words: stats.words, first: stats.first, pairs: stats.pairs, equal: stats.equal };
}

const wordWidth = 64;
assert(nativeWords.every((word) => word.length <= wordWidth));
const wordKey29 = fixedKey(1033 * wordWidth, 29);
const wordKey28 = fixedKey(1033 * wordWidth, 28);
const wordCipher = nativeWords.map((word, i) => word.map((symbol, j) =>
  (symbol + wordKey29[(i % 1033) * wordWidth + j]) % 29));
assert.deepEqual(alignedOnly(wordLag(wordCipher, 1033)), alignedOnly(plantedWordLag));
assert.deepEqual(wordCipher.map((word, i) => word.map((symbol, j) =>
  (symbol - wordKey29[(i % 1033) * wordWidth + j] + 29) % 29)), nativeWords);

const wordChain = nativeWords.map((word, i) => {
  let prior = 0;
  return word.map((symbol, j) => {
    const key = wordKey28[(i % 1033) * wordWidth + j];
    const step = symbol === 28 ? 0 : 1 + (symbol + key) % 28;
    prior = (prior + step) % 29;
    return prior;
  });
});
assert.deepEqual(alignedOnly(wordLag(wordChain.map(rankSteps), 1033)), alignedOnly(plantedWordLag));
assert.deepEqual(wordChain.map((word, i) => rankSteps(word).map((symbol, j) =>
  symbol === 28 ? 28 : (symbol - wordKey28[(i % 1033) * wordWidth + j] + 28) % 28)), nativeWords);

console.log(JSON.stringify({
  schema: 1,
  corpusRunes: original.length,
  plantedEnglishRunes: native.length,
  sourcePeriods: periodOut.map((x) => ({
    period: x.period,
    originalRaw: { ...x.raw, z: zUniform(x.raw) },
    originalNoRepeatRank: { ...x.rank, z: zUniform(x.rank) },
    nativePositive: { ...x.plantedNative, z: zUniform(x.plantedNative) },
  })),
  chapterReset1033: {
    originalRaw: { ...original1033Chapter, z: zUniform(original1033Chapter) },
    originalNoRepeatRank: { ...original1033ChapterRank, z: zUniform(original1033ChapterRank) },
    nativePositive: { ...planted1033Chapter, z: zUniform(planted1033Chapter) },
  },
  wordIndexPeriod1033: {
    originalRaw: originalWordLag,
    originalNoRepeatRank: originalWordChainLag,
    nativePositive: plantedWordLag,
    nativeExactWordRecovery: '2896/2896 for each fixed word-period model',
  },
  pageResetSharedKey: {
    originalRaw: { ...originalPageAligned, z: zUniform(originalPageAligned) },
    originalNoRepeatRank: { ...originalPageRank, z: zUniform(originalPageRank) },
    nativePositive: { ...plantedPageAligned, z: zUniform(plantedPageAligned) },
  },
  nativeExactReversibility: '12956/12956 for each fixed period',
}, null, 2));
console.log('PASS source-fixed 1033/3301 long-period original inverse gate');
