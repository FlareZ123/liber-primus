'use strict';

/**
 * Original-cipher word-break conditioning, without changing even one ciphertext rune.
 *
 * Node 22 CommonJS SFT:
 *   node sims/lp2_fixed_cipher_wordbreak_lagfive_sft.cjs
 *
 * Preserve every physical page, every rune and n-gram in their original order,
 * and the full multiset of word lengths on that page. Preserve the locations
 * and complete content of all 32 words carried between original pages. Shuffle
 * only the lengths of complete, within-page words; this moves their delimiters.
 *
 * Primary statistics were explored after lag-five/S had already been noticed,
 * so the resulting conditional tails are not familywise discovery p-values.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const RUNE = /[\u16A0-\u16FF]/u;
const SEED = 0x33011807;
const TRIALS = 10000;

/**
 * @typedef {{start:number,length:number,startPage:number,endPage:number}} Word
 * @typedef {{runes:string[],words:Word[],pages:number}} Corpus
 */

/**
 * The page marker is a printed page break, never a word delimiter.
 * Printed slash and whitespace are only line wraps. Literal punctuation
 * (including period, hyphen, section sign and decimal numerals) ends a word.
 * @param {string} raw
 * @param {string} separator
 * @returns {Corpus}
 */
function parse(raw, separator) {
  const parts = raw.split(separator);
  const corpus = {runes: [], words: [], pages: parts.length};
  let currentPage = 0;
  let start = -1;
  let startPage = 0;
  let endPage = 0;

  function flush() {
    if (start < 0) return;
    corpus.words.push({
      start, length: corpus.runes.length - start, startPage, endPage
    });
    start = -1;
  }
  for (const c of parts.join(separator)) {
    if (RUNE.test(c)) {
      if (start < 0) {
        start = corpus.runes.length;
        startPage = currentPage;
      }
      corpus.runes.push(c);
      endPage = currentPage;
    } else if (c === separator) {
      currentPage++;
    } else if (c === '/' || /\s/u.test(c)) {
      // Printed line wrap, no extra word boundary.
    } else {
      flush();
    }
  }
  flush();
  return corpus;
}

/** @param {Corpus[]} pieces @returns {Corpus} */
function concatenate(pieces) {
  const out = {runes: [], words: [], pages: 0};
  for (const part of pieces) {
    for (const w of part.words) {
      out.words.push({
        start: w.start + out.runes.length,
        length: w.length,
        startPage: w.startPage + out.pages,
        endPage: w.endPage + out.pages
      });
    }
    out.runes.push(...part.runes);
    out.pages += part.pages;
  }
  return out;
}

/**
 * Score exact fifth-back equality, adjacent paired return and repeated S.
 * These are ciphertext equalities: absolutely no GP English decoder is used.
 * @param {string[]} runes
 * @param {number} start
 * @param {number} len
 * @returns {number[]}
 */
function windowScore(runes, start, len) {
  let lag5 = 0;
  let paired = 0;
  let s = 0;
  for (let j = 5; j < len; j++) {
    const at = start + j;
    if (runes[at] === runes[at - 5]) {
      lag5++;
      if (j >= 6 && runes[at - 1] === runes[at - 6]) paired++;
      if (runes[at] === 'ᛋ') s++; // Gematria Primus S rune
    }
  }
  return [lag5, paired, s];
}

/**
 * @param {Corpus} corpus
 * @param {number} [trials]
 * @returns {object}
 */
function experiment(corpus, trials = TRIALS) {
  const {runes, words} = corpus;
  const byPage = Array.from({length: corpus.pages}, (_, p) =>
    words.filter(w => w.startPage === p && w.endPage === p));
  const carried = words.filter(w => w.startPage !== w.endPage);
  const observed = [0, 0, 0];

  /** @param {number[]} total @param {number[]} add */
  function accumulate(total, add) {
    for (let k = 0; k < total.length; k++) total[k] += add[k];
  }
  for (const w of words) accumulate(observed, windowScore(runes, w.start, w.length));

  let opportunities = 0;
  for (const w of words) opportunities += Math.max(0, w.length - 5);
  const fixed = [0, 0, 0];
  for (const w of carried) accumulate(fixed, windowScore(runes, w.start, w.length));

  for (const group of byPage) {
    for (let i = 1; i < group.length; i++) {
      assert.equal(group[i].start, group[i - 1].start + group[i - 1].length,
        'complete page-local words must be contiguous for a boundary-only shuffle');
    }
  }

  let state = SEED;
  function random() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  }
  const sum = [0, 0, 0];
  const squared = [0, 0, 0];
  const greaterOrEqual = [0, 0, 0];
  for (let trial = 0; trial < trials; trial++) {
    const trialScore = fixed.slice();
    for (const group of byPage) {
      if (!group.length) continue;
      const lengths = group.map(w => w.length);
      for (let i = lengths.length - 1; i > 0; i--) {
        const j = random() % (i + 1);
        [lengths[i], lengths[j]] = [lengths[j], lengths[i]];
      }
      let offset = group[0].start;
      for (const len of lengths) {
        accumulate(trialScore, windowScore(runes, offset, len));
        offset += len;
      }
      assert.equal(offset,
        group[group.length - 1].start + group[group.length - 1].length);
    }
    for (let k = 0; k < 3; k++) {
      const value = trialScore[k];
      sum[k] += value;
      squared[k] += value * value;
      if (value >= observed[k]) greaterOrEqual[k]++;
    }
  }
  return {
    runes: runes.length, pages: corpus.pages, words: words.length,
    carriedWords: carried.length, completeWords: words.length - carried.length,
    opportunities, original: observed, fixedCarryEvents: fixed,
    conditional: sum.map((v, k) => ({
      mean: v / trials,
      sd: Math.sqrt(squared[k] / trials - (v / trials) ** 2),
      exceedances: greaterOrEqual[k],
      addOneUpperTail: (greaterOrEqual[k] + 1) / (trials + 1)
    }))
  };
}

const source = parse(read('resources/lp2-transcription.txt').split('%')
  .slice(0, 55).join('%'), '%');
const reference = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
assert.equal(reference.pages.filter(p => p.page < 56 && p.indices.length).length, 55);
assert.deepEqual(source.runes,
  reference.pages.filter(p => p.page < 56 && p.indices.length)
    .flatMap(p => p.indices.map(i => reference.runes[i])));
assert.equal(source.runes.length, 12956);
assert.equal(source.words.length, 2896);
assert.equal(source.pages, 55);
assert.equal(source.words.filter(w => w.startPage !== w.endPage).length, 32);

const original = experiment(source);
assert.equal(original.opportunities, 2105);
assert.deepEqual(original.original, [104, 9, 11]);
assert.deepEqual(original.fixedCarryEvents, [4, 1, 0]);
assert.deepEqual(original.conditional.map(x => x.exceedances), [16, 78, 2]);
assert.deepEqual(original.conditional.map(x => +x.mean.toFixed(4)),
  [80.3507, 4.0198, 3.6991]);

// First-party, genuinely CLEAR GP controls. The original LP1 section
// indices are independently established in the clear-author control report.
const lp1Parts = read('resources/transcriptions/lp1_wulfic_canonical.txt')
  .split('%');
const clearLP1 = concatenate([3, 8, 9, 10, 11, 14]
  .map(i => parse(lp1Parts[i], '&')));
assert.equal(clearLP1.runes.length, 1001);
assert.equal(clearLP1.words.length, 231);
const clear = experiment(clearLP1);
assert.deepEqual(clear.original, [7, 0, 0]);

// First-party historically enciphered LP1 groups: genuine prior Cicada
// cryptograms with their original printed delimiters and source pagination.
// These are not a random-English stand-in or unknown LP2 pages.
const encryptedLP1 = concatenate([0, 1, 2, 4, 5, 6, 7, 12, 13]
  .map(i => parse(lp1Parts[i], '&')));
assert.equal(encryptedLP1.runes.length, 1796);
assert.equal(encryptedLP1.words.length, 467);
const priorCipher = experiment(encryptedLP1);
assert.deepEqual(priorCipher.original, [13, 0, 1]);
assert.deepEqual(priorCipher.conditional.map(x => x.exceedances),
  [4375, 10000, 2108]);
assert.equal(+priorCipher.conditional[0].mean.toFixed(4), 12.0892);

const p57 = parse(read('resources/lp2-transcription.txt').split('%')[56], '%');
assert.equal(p57.runes.length, 95);
assert.equal(p57.words.length, 20);
const ending = experiment(p57);
assert.deepEqual(ending.original, [2, 0, 0]);

console.log(JSON.stringify({seed: SEED, trials: TRIALS,
  original, clearLP1: clear, encryptedLP1: priorCipher,
  clearP57: ending}, null, 2));
