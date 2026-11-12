'use strict';

/**
 * LP2 original printed-word-length crib retrieval, with exact solved-p57 control.
 * Run as: node sims/lp2_original_wordlength_crib_sft.cjs
 * Native GP spellings count ING/TH/NG/EO/OE/AE/IA/EA once per rune.
 * A hit is a source-text candidate, not an original-cipher plaintext proof.
 * No network, dependencies outside Node standard library, or file writes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

/** @param {string} relative @returns {string} */
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const runeSet = new Set(corpus.runes);
const grouped = ['ING', 'TH', 'NG', 'EO', 'OE', 'AE', 'IA', 'EA'];

/** @param {string} word @returns {number} */
function lengthGP(word) {
  const letters = word.toUpperCase().replace(/[^A-Z]/g, '');
  let n = 0;
  for (let i = 0; i < letters.length; n++) {
    const group = grouped.find(g => letters.startsWith(g, i)) || letters[i];
    i += group.length;
  }
  return n;
}

/** @param {string} source @returns {{word:string,n:number}[]} */
function latinWords(source) {
  return (source.toUpperCase().match(/[A-Z]+/g) || []).map(word => ({
    word, n: lengthGP(word)
  }));
}

/**
 * Parse the original rune transcription. Preserve a word split between
 * original physical pages by tracking the start page through '%' joins.
 * Source page 50 is an image-only numeric table and has no text record.
 * @param {string} source
 * @returns {{page:number,n:number,runes:string}[]}
 */
function originalWords(source) {
  const out = [];
  let page = 0;
  let start = 0;
  let token = '';
  const finish = () => {
    if (token.length) {
      out.push({page: start < 50 ? start : start + 1,
        n: [...token].length, runes: token});
      token = '';
    }
  };
  for (const symbol of source) {
    if (runeSet.has(symbol)) {
      if (!token) start = page;
      token += symbol;
    } else if (symbol === '%') {
      page++;
    } else if ('-.$&§'.includes(symbol)) {
      finish();
    }
  }
  finish();
  return out;
}

/**
 * Source-order retrieval of maximal exact word-length matches. The only
 * index is a seven-word signature; longer matches are verified rune-length
 * by rune-length before being reported.
 * @param {{n:number}[]} unknown
 * @param {{word:string,n:number}[]} source
 * @param {number} seedSize
 * @returns {{windows:number,longest:number,atLeast10:number,best:object[]}}
 */
function search(unknown, source, seedSize = 7) {
  const key = (a, start) => a.slice(start, start + seedSize).map(w => w.n).join(',');
  /** @type {Map<string,number[]>} */
  const index = new Map();
  for (let j = 0; j + seedSize <= source.length; j++) {
    const signature = key(source, j);
    if (!index.has(signature)) index.set(signature, []);
    index.get(signature).push(j);
  }
  let windows = 0;
  let longest = 0;
  let atLeast10 = 0;
  const maximal = [];
  for (let i = 0; i + seedSize <= unknown.length; i++) {
    for (const j of index.get(key(unknown, i)) || []) {
      windows++;
      if (i && j && unknown[i - 1].n === source[j - 1].n) continue;
      let n = seedSize;
      while (i + n < unknown.length && j + n < source.length &&
          unknown[i + n].n === source[j + n].n) n++;
      longest = Math.max(longest, n);
      if (n >= 10) atLeast10++;
      maximal.push({n, originalIndex: i, sourceIndex: j,
        page: unknown[i].page,
        phrase: source.slice(j, j + n).map(w => w.word).join(' ')});
    }
  }
  maximal.sort((a, b) => b.n - a.n || a.originalIndex - b.originalIndex);
  return {windows, longest, atLeast10, best: maximal.slice(0, 3)};
}

function main() {
  assert.deepEqual(corpus.translit, [
    'F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B',
    'E','M','L','NG','OE','D','A','AE','Y','IA','EA'
  ]);
  const original = originalWords(read('resources/liber-primus/lp2-transcription.txt'));
  const unknown = original.filter(w => w.page <= 55);
  assert.equal(unknown.length, 2896);
  assert.equal(unknown.reduce((n,w) => n + w.n, 0), 12956);

  // Real historical positive control: p57 is genuinely decoded and its
  // canonical orthographic text, unlike LP2's unknown pages, is known.
  const solvedText = read('resources/liber-primus/lp1-plaintext-reference.txt')
    .split('### 57\n')[1].trim();
  const solvedWords = original.filter(w => w.page === 57);
  const known = latinWords(solvedText);
  assert.equal(solvedWords.length, 20);
  assert.deepEqual(solvedWords.map(w => w.n), known.map(w => w.n));
  assert.equal(solvedWords.reduce((s,w) => s + w.n, 0), 95);
  const positive = search(solvedWords, known);
  assert.equal(positive.longest, 20);

  const paths = [
    'resources/control/gibran_prophet_58585.txt',
    'resources/control/emerson_essays_2944.txt',
    'resources/control/shakespeare_first300k.txt',
    'resources/external/2013-liber-al-bookcode-I.txt',
    'resources/external/2013-liber-al-bookcode-II.txt',
    'resources/external/2013-liber-al-bookcode-III.txt'
  ];
  const controls = paths.map(relative => {
    const words = latinWords(read(relative));
    return {source: relative, sourceWords: words.length, ...search(unknown, words)};
  });
  assert.deepEqual(controls.map(x => x.sourceWords), [15733, 77932, 55407, 1897, 1968, 2002]);
  assert.deepEqual(controls.map(x => x.longest), [9, 9, 9, 7, 8, 8]);
  assert.deepEqual(controls.map(x => x.windows), [104, 277, 270, 9, 19, 12]);
  assert.equal(controls.reduce((s,x) => s + x.atLeast10, 0), 0);
  console.log(JSON.stringify({
    claim: 'No exact ten-word source-native GP length crib in three literary texts or three authentic 2013 book-code chapters',
    scope: 'Only contiguous verbatim excerpts under exact original word boundaries and original GP spelling rule',
    unknown: {pages: 55, runes: 12956, words: 2896},
    solvedP57Positive: {words: 20, runes: 95, longest: positive.longest},
    seed: 7, controls
  }, null, 2));
}

if (require.main === module) main();
module.exports = {lengthGP, latinWords, originalWords, search};
