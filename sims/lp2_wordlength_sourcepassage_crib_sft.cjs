'use strict';

/**
 * Original LP2 word-length quotation crib test.
 *
 * An authentic printed word is preserved across line '/' and page '%' wraps.
 * This uses word lengths only, never cipher rune identities, keys, or an
 * inferred plaintext. Native-GP29 source-word lengths use the same orthography
 * as lp2_doublet_mask_sourcepassage_crib_sft.cjs.
 *
 * Windows Node 22: node sims/lp2_wordlength_sourcepassage_crib_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

/** @param {string} relative */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8');
}

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const sourcePaths = [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt',
  'resources/external/cicada2012-blake-marriage-gutenberg45315.txt',
  'resources/external/2013-book-of-law-I.txt',
  'resources/external/2013-book-of-law-II.txt',
  'resources/external/2013-book-of-law-III.txt',
  'resources/external/kjv-passion-gospels-2014.txt',
  'resources/external/tennyson-lady-of-shalott-1842-gutenberg8601.txt',
];

/** @returns {{lengths:number[],starts:number[],runeCount:number}} */
function originalLengths() {
  const symbols = new Set(corpus.runes);
  const text = read('resources/lp2-transcription.txt');
  /** @type {number[]} */
  const lengths = [];
  /** @type {number[]} */
  const starts = [];
  let length = 0;
  let runeCount = 0;
  for (const char of text) {
    if (char === '/' || char === '%' || char === '\n' ||
        char === '\r' || char === ' ') continue;
    if (symbols.has(char)) {
      if (runeCount < 12956) {
        if (length === 0) starts.push(runeCount);
        length++;
        runeCount++;
      }
    } else if (length) {
      lengths.push(length);
      length = 0;
    }
  }
  if (length) lengths.push(length);
  assert.equal(corpus.pages.filter(p => p.page <= 55)
    .reduce((sum, p) => sum + p.indices.length, 0), 12956);
  assert.equal(runeCount, 12956);
  assert.equal(lengths.length, 2896);
  assert.equal(starts.length, 2896);
  assert.equal(lengths.reduce((sum, x) => sum + x, 0), 12956);
  return {lengths, starts, runeCount};
}

const multi = corpus.translit.filter(s => s.length > 1)
  .sort((a, b) => b.length - a.length);

/**
 * Historical-source Latin word represented with the existing research's
 * GP29 spelling normalization. Source punctuation separates words.
 * @param {string} word
 * @returns {number}
 */
function gpLength(word) {
  const source = word.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  let count = 0;
  for (let i = 0; i < source.length;) {
    if (source.startsWith('ING', i)) {
      i += 3;
    } else if (source.startsWith('IO', i)) {
      i += 2;
    } else {
      const matching = multi.find(s => source.startsWith(s, i));
      i += matching ? matching.length : 1;
    }
    count++;
  }
  return count;
}

/**
 * @param {number[]} lengths
 * @param {number} n
 * @returns {Map<string,number[]>}
 */
function gramIndex(lengths, n) {
  const index = new Map();
  for (let i = 0; i <= lengths.length - n; i++) {
    const key = lengths.slice(i, i + n).join('.');
    let offsets = index.get(key);
    if (!offsets) {
      offsets = [];
      index.set(key, offsets);
    }
    offsets.push(i);
  }
  return index;
}

/**
 * Exhaustively evaluate every overlapping n-word match, then extend both
 * directions. For these nine corpora and original word sequence, the global
 * longest exact match is guaranteed to include a 7-word seed.
 *
 * @param {number[]} target
 * @param {number[]} source
 * @param {Map<string,number[]>} index
 * @param {number} n
 */
function longest(target, source, index, n) {
  let seedMatches = 0;
  let bestLength = 0;
  let targetOffset = -1;
  let sourceOffset = -1;
  for (let j = 0; j <= source.length - n; j++) {
    const matches = index.get(source.slice(j, j + n).join('.'));
    if (!matches) continue;
    seedMatches += matches.length;
    for (const i of matches) {
      let left = 0;
      let right = n;
      while (i - left - 1 >= 0 && j - left - 1 >= 0 &&
             target[i - left - 1] === source[j - left - 1]) left++;
      while (i + right < target.length && j + right < source.length &&
             target[i + right] === source[j + right]) right++;
      if (left + right > bestLength) {
        bestLength = left + right;
        targetOffset = i - left;
        sourceOffset = j - left;
      }
    }
  }
  return {seedMatches, bestLength, targetOffset, sourceOffset};
}

function main() {
  assert.equal(corpus.translit.length, 29);
  const original = originalLengths();
  const n = 7;
  const index = gramIndex(original.lengths, n);
  const results = [];
  for (const file of sourcePaths) {
    const sourceWords = read(file).match(/[A-Za-z]+/g) || [];
    const lengths = sourceWords.map(gpLength);
    const forward = longest(original.lengths, lengths, index, n);
    const reverse = longest(original.lengths, lengths.slice().reverse(), index, n);
    assert.ok(forward.bestLength <= 9,
      file + ' exceeds frozen forward maximum');
    assert.ok(reverse.bestLength <= 11,
      file + ' exceeds frozen reverse maximum');
    results.push({
      file,
      sourceWords: lengths.length,
      forward: {
        ...forward,
        targetRuneOffset: original.starts[forward.targetOffset],
        sourceWords: sourceWords.slice(forward.sourceOffset,
          forward.sourceOffset + forward.bestLength).join(' '),
      },
      reverse: {
        ...reverse,
        targetRuneOffset: original.starts[reverse.targetOffset],
        sourceWords: sourceWords.slice().reverse().slice(reverse.sourceOffset,
          reverse.sourceOffset + reverse.bestLength).join(' '),
      },
    });
    if (file === sourcePaths[0]) {
      // Controlled 80-word quotation; a genuine source passage is recovered
      // even with 3 novel word lengths preceding and following it.
      const planted = [99, 98, 97, ...lengths.slice(30000, 30080),
        96, 95, 94];
      const control = longest(planted, lengths,
        gramIndex(planted, n), n);
      assert.equal(control.bestLength, 80);
      assert.equal(control.targetOffset, 3);
      assert.equal(control.sourceOffset, 30000);
    }
  }
  assert.equal(Math.max(...results.map(x => x.forward.bestLength)), 9);
  assert.equal(Math.max(...results.map(x => x.reverse.bestLength)), 11);
  console.log(JSON.stringify({
    provenance: 'Original LP2 pp0-55, 12956 runes, 2896 complete words',
    model: 'GP29-native fixed word lengths, source forward/reverse',
    positive: '80/80 source-word passage found at pinned Shakespeare offset30000',
    results,
  }, null, 2));
}

main();
