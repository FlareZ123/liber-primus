'use strict';

/**
 * Sentence/paragraph-anchored fixed-cipher LP2 word-break shuffle.
 *
 * This is a robustness test for the 18-Nov original-cipher wordbreak finding:
 * retain every source rune and page in its exact original position; preserve
 * every non-hyphen explicit punctuation boundary (including periods, section
 * delimiters, paragraph &/$ separators); preserve all 32 page-crossing words;
 * shuffle complete-word lengths only inside contiguous runs between those
 * original punctuation anchors and page-crossing fragments.
 *
 * Does not preserve the within-run locations of ordinary hyphen word breaks.
 * The previously noticed lag-five/S targets make all tails exploratory.
 *
 * Node.js 22:
 *   node sims/lp2_fixedcipher_sentenceword_lagfive_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const raw = fs.readFileSync(path.join(root,
  'resources', 'transcriptions', 'lp2-image-corrected.txt'), 'utf8')
  .split('%').slice(0, 55).join('%');
const RUNIC = /[\u16A0-\u16FF]/u;
const runes = [];
/** @type {Array<{start:number,length:number,startPage:number,endPage:number,hardAfter:boolean}>} */
const words = [];
let page = 0;
let begin = -1;
let startPage = 0;
let endPage = 0;
function finish(mark) {
  if (begin < 0) return;
  words.push({
    start: begin, length: runes.length - begin,
    startPage, endPage, hardAfter: mark !== '-'
  });
  begin = -1;
}
for (const c of raw) {
  if (RUNIC.test(c)) {
    if (begin < 0) {
      begin = runes.length;
      startPage = page;
    }
    runes.push(c);
    endPage = page;
  } else if (c === '%') {
    page++;
  } else if (c === '/' || /\s/u.test(c)) {
    // No word break at line wrap.
  } else if (begin >= 0) {
    finish(c);
  } else if (c !== '-' && words.length) {
    // Upgrade a preceding hyphen to a hard boundary if subsequent
    // punctuation without intervening rune demands it.
    words[words.length - 1].hardAfter = true;
  }
}
finish('.');
assert.equal(runes.length, 12956);
assert.equal(words.length, 2896);
const gp = JSON.parse(fs.readFileSync(path.join(root,
  'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
assert.deepEqual(runes, gp.pages.filter(p => p.page < 56 && p.indices.length)
  .flatMap(p => p.indices.map(i => gp.runes[i])));

const blocks = [];
const carried = [];
let current = [];
function close() {
  if (!current.length) return;
  blocks.push(current);
  current = [];
}
for (const w of words) {
  if (w.startPage !== w.endPage) {
    close();
    carried.push(w);
    continue;
  }
  if (current.length) {
    const previous = current[current.length - 1];
    if (previous.startPage !== w.startPage || previous.hardAfter) close();
  }
  current.push(w);
  if (w.hardAfter) close();
}
close();
assert.equal(carried.length, 32);
assert.equal(words.filter(w => w.hardAfter).length, 174);
assert.equal(blocks.length, 217);
assert.equal(blocks.filter(x => x.length > 1).length, 211);
for (const block of blocks) {
  for (let i = 1; i < block.length; i++) {
    assert.equal(block[i].start,
      block[i - 1].start + block[i - 1].length);
  }
}

/** @param {number} start @param {number} length @returns {number[]} */
function score(start, length) {
  let fifth = 0;
  let paired = 0;
  let s = 0;
  for (let j = 5; j < length; j++) {
    const k = start + j;
    if (runes[k] === runes[k - 5]) {
      fifth++;
      if (j >= 6 && runes[k - 1] === runes[k - 6]) paired++;
      if (runes[k] === 'ᛋ') s++;
    }
  }
  return [fifth, paired, s];
}
/** @param {number[]} out @param {number[]} val */
function add(out, val) {
  for (let i = 0; i < 3; i++) out[i] += val[i];
}
const original = [0, 0, 0];
const fixed = [0, 0, 0];
for (const w of words) add(original, score(w.start, w.length));
for (const w of carried) add(fixed, score(w.start, w.length));
assert.deepEqual(original, [104, 9, 11]);
assert.deepEqual(fixed, [4, 1, 0]);

let state = 0x33011807;
function random() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
const N = 10000;
const sums = [0, 0, 0];
const squared = [0, 0, 0];
const greaterOrEqual = [0, 0, 0];
for (let t = 0; t < N; t++) {
  const trial = fixed.slice();
  for (const block of blocks) {
    const lengths = block.map(w => w.length);
    for (let i = lengths.length - 1; i > 0; i--) {
      const j = random() % (i + 1);
      [lengths[i], lengths[j]] = [lengths[j], lengths[i]];
    }
    let offset = block[0].start;
    for (const len of lengths) {
      add(trial, score(offset, len));
      offset += len;
    }
    assert.equal(offset,
      block[block.length - 1].start + block[block.length - 1].length);
  }
  for (let i = 0; i < 3; i++) {
    sums[i] += trial[i];
    squared[i] += trial[i] * trial[i];
    if (trial[i] >= original[i]) greaterOrEqual[i]++;
  }
}
const conditional = sums.map((n, i) => ({
  original: original[i],
  mean: n / N,
  sd: Math.sqrt(squared[i] / N - (n / N) ** 2),
  exceedances: greaterOrEqual[i],
  plusOneTail: (greaterOrEqual[i] + 1) / (N + 1)
}));
assert.deepEqual(conditional.map(x => x.exceedances), [15, 77, 29]);
assert.deepEqual(conditional.map(x => +x.mean.toFixed(4)),
  [79.8651, 4.1648, 5.4653]);
console.log(JSON.stringify({
  statisticOrder: ['fifth', 'paired fifth', 'fifth S'],
  sourceRunes: runes.length, sourceWords: words.length,
  carriedWords: carried.length,
  originalHardBoundaryWords: words.filter(w => w.hardAfter).length,
  fixedRuneSentenceBlocks: blocks.length,
  blocksWithShufflableHyphenBoundaries:
    blocks.filter(x => x.length > 1).length,
  initialSeed: 0x33011807, trials: N, conditional,
  noOriginalPlaintextOrKey: true
}, null, 2));
