'use strict';

/**
 * Original LP2 test of an explicitly exploratory Westcott Sefer Yetzirah crib
 * and running-book-key hypothesis. This script claims no historical key.
 * Run from the repository root with Node.js 22; no external packages.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
/** @param {string} p @returns {string} */
function read(p) { return fs.readFileSync(path.join(root, p), 'utf8'); }
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const source = JSON.parse(read('resources/external/sefer-yetzirah-westcott-archive.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const runeValues = new Map(corpus.runes.map((r, i) => [r, i]));
const tokenValues = new Map(corpus.translit.map((r, i) => [r, i]));
const groups = ['ING', 'TH', 'NG', 'EO', 'OE', 'AE', 'IA', 'EA'];
for (const [alias, canonical] of [['ING', 'NG'], ['K', 'C'], ['Q', 'C'],
  ['Z', 'S'], ['V', 'U']]) tokenValues.set(alias, tokenValues.get(canonical));

/** GP29-length-preserving source word encoder.
 * @param {string} word @returns {number[]}
 */
function encodeWord(word) {
  const letters = word.replace(/QU/g, 'KW');
  const out = [];
  for (let i = 0; i < letters.length;) {
    const unit = groups.find(g => letters.startsWith(g, i)) || letters[i];
    assert(tokenValues.has(unit), 'Unsupported GP source token: ' + unit);
    out.push(tokenValues.get(unit));
    i += unit.length;
  }
  return out;
}
/** @param {string} s @returns {{word:string,n:number,indices:number[]}[]} */
function sourceWords(s) {
  return (s.toUpperCase().match(/[A-Z]+/g) || []).map(word => {
    const indices = encodeWord(word);
    return {word, n: indices.length, indices};
  });
}
/** @param {number} first @param {number} last */
function sourceRange(first, last) {
  const text = source.filter(p => p.pageNumber >= first && p.pageNumber <= last)
    .map(p => p.pageContent).join(' ');
  const words = sourceWords(text);
  return {words, indices: words.flatMap(w => w.indices)};
}

/** Rejoin words split by source line/page wrapping, keep actual separators.
 * @returns {{n:number,indices:number[],page:number}[]}
 */
function actualWords() {
  const out = [];
  let token = [], page = 0, firstPage = 0;
  function finish() {
    if (!token.length) return;
    out.push({n: token.length, indices: token, page: firstPage < 50 ?
      firstPage : firstPage + 1});
    token = [];
  }
  for (const ch of transcription) {
    if (runeValues.has(ch)) {
      if (!token.length) firstPage = page;
      token.push(runeValues.get(ch));
    } else if (ch === '%') {
      page++;
    } else if ('-.$&§'.includes(ch)) {
      finish();
    }
  }
  finish();
  const unsolved = out.slice(0, 2896);
  const expected = corpus.pages.filter(p => p.page <= 55)
    .flatMap(p => p.indices);
  assert.equal(unsolved.length, 2896);
  assert.deepEqual(unsolved.flatMap(w => w.indices), expected);
  return unsolved;
}

/** Source-native exact word-length matches; no rune key fitted.
 * @param {{n:number}[]} candidate @param {{n:number}[]} external
 */
function longestLengthMatch(candidate, external) {
  const seed = 5;
  /** @type {Map<string,number[]>} */
  const index = new Map();
  /** @param {{n:number}[]} seq @param {number} p */
  function signature(seq, p) {
    return seq.slice(p, p + seed).map(w => w.n).join(',');
  }
  for (let j = 0; j + seed <= external.length; j++) {
    const k = signature(external, j);
    if (!index.has(k)) index.set(k, []);
    index.get(k).push(j);
  }
  let best = 0, matches10 = 0;
  for (let i = 0; i + seed <= candidate.length; i++) {
    for (const j of index.get(signature(candidate, i)) || []) {
      if (i && j && candidate[i - 1].n === external[j - 1].n) continue;
      let n = seed;
      while (i + n < candidate.length && j + n < external.length &&
        candidate[i + n].n === external[j + n].n) n++;
      if (n >= 10) matches10++;
      best = Math.max(best, n);
    }
  }
  return {best, matches10};
}

/** 29-times normalized index of coincidence (uniform expectation 1).
 * @param {number[]} symbols
 */
function scaledIoC(symbols) {
  const counts = new Uint32Array(29);
  for (const symbol of symbols) counts[symbol]++;
  let matches = 0;
  for (const f of counts) matches += f * (f - 1);
  return 29 * matches / (symbols.length * (symbols.length - 1));
}

/** First 350 runes decide source offsets; full chapter used only after locking.
 * @param {number[]} ciphertext @param {number[]} key @param {number} topn
 * @returns {{score:number,offset:number,sign:number}[]}
 */
function topOffsets(ciphertext, key, topn = 5) {
  const n = Math.min(ciphertext.length, 350);
  const top = [];
  // Key must cover the entire chapter. No partial source tails.
  for (let offset = 0; offset + ciphertext.length <= key.length; offset++) {
    for (const sign of [-1, 1]) {
      const counts = new Uint16Array(29);
      for (let j = 0; j < n; j++) {
        counts[(ciphertext[j] + sign * key[offset + j] + 29) % 29]++;
      }
      let equalPairs = 0;
      for (let j = 0; j < 29; j++)
        equalPairs += counts[j] * (counts[j] - 1);
      const score = 29 * equalPairs / (n * (n - 1));
      if (top.length >= topn && score <= top[top.length - 1].score) continue;
      top.push({score, offset, sign});
      top.sort((a, b) => b.score - a.score);
      if (top.length > topn) top.pop();
    }
  }
  return top;
}

/** @param {number[]} ciphertext @param {number[]} key
 *  @param {number} offset @param {number} sign */
function fullInverse(ciphertext, key, offset, sign) {
  return ciphertext.map((c, i) => (c + sign * key[offset + i] + 29) % 29);
}

const main = sourceRange(2, 10);
const paths = sourceRange(11, 14);
assert.equal(main.indices.length, 13214);
assert.equal(paths.indices.length, 7524);
const original = actualWords();
const lengthResults = {
  main: longestLengthMatch(original, main.words),
  paths: longestLengthMatch(original, paths.words)
};
assert.deepEqual(lengthResults, {
  main: {best: 8, matches10: 0},
  paths: {best: 7, matches10: 0}
});
const ranges = [[0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]];
const expectedLengths = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];
const chapters = ranges.map(([first, last], i) => {
  const indices = corpus.pages.filter(p => p.page >= first && p.page <= last)
    .flatMap(p => p.indices);
  assert.equal(indices.length, expectedLengths[i]);
  return {name: 'p' + first + '-' + last, indices};
});

const scored = [];
for (const [sourceName, key] of [['main', main.indices],
  ['32paths', paths.indices]]) {
  for (const chapter of chapters) {
    const top = topOffsets(chapter.indices, key, 5);
    for (const candidate of top) {
      const recovered = fullInverse(chapter.indices, key,
        candidate.offset, candidate.sign);
      candidate.full = scaledIoC(recovered);
      candidate.fullRunes = recovered.length;
      // An inverse in this family has an exact forward equation.
      for (let i = 0; i < recovered.length; i++) {
        assert.equal((recovered[i] - candidate.sign *
          key[candidate.offset + i] + 29) % 29, chapter.indices[i]);
      }
    }
    scored.push({source: sourceName, chapter: chapter.name,
      runes: chapter.indices.length, sourceNativeBaseline: scaledIoC(chapter.indices),
      max350: top[0].score, top});
  }
}

// Original-source positive: a separate passage of genuine Westcott prose
// is encrypted with a different public-book passage at an unseen key offset.
const positiveOffset = 1234;
const positivePlain = main.indices.slice(1600, 2329);
assert.equal(positivePlain.length, 729);
const positiveCipher = positivePlain.map((p, i) =>
  (p + paths.indices[positiveOffset + i]) % 29);
const positiveTop = topOffsets(positiveCipher, paths.indices, 5);
assert.equal(positiveTop[0].offset, positiveOffset);
assert.equal(positiveTop[0].sign, -1);
assert.deepEqual(fullInverse(positiveCipher, paths.indices,
  positiveOffset, -1), positivePlain);
assert(positiveTop[0].score > 1.30);
assert(scored.every(r => r.max350 < 1.20));

console.log(JSON.stringify({
  source: 'W. Wynn Westcott Sepher Yetzirah, supplied independent archive OCR',
  sourceScope: {mainRunes: main.indices.length, pathsRunes: paths.indices.length},
  unknown: {words: original.length, runes: original.reduce((s, w) => s + w.n, 0)},
  wordLengthMatches: lengthResults,
  scans: scored.length,
  sourceKeyOffsetsTested: scored.reduce((sum, item) =>
    sum + 2 * ((item.source === 'main' ? main.indices.length :
      paths.indices.length) - item.runes + 1), 0),
  positive: {offset: positiveTop[0].offset, sign: positiveTop[0].sign,
    matched729: true, scaledIoC350: positiveTop[0].score},
  chapters: scored.map(r => ({source: r.source, chapter: r.chapter,
    n: r.runes, max350: r.max350,
    bestLockedFull: r.top[0].full,
    keyOffset: r.top[0].offset, sign: r.top[0].sign}))
}, null, 2));
