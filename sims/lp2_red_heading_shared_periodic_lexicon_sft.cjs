'use strict';

/**
 * Original-LP2 red-title shared-key inverse gate, Node.js 22.
 * Run from repository root: node sims/lp2_red_heading_shared_periodic_lexicon_sft.cjs
 * This test makes no unknown-plaintext claim.
 */
const fs = require('node:fs');
const assert = require('node:assert/strict');

const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const ink = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-ink-annotations.json', 'utf8'));
const lexicon = fs.readFileSync('resources/control/english_wordfreq_textblob.txt', 'utf8');
const HEADS = [
  [0, 0, [8, 5]], [3, 0, [2, 11, 3]], [8, 0, [4, 8]],
  [15, 9, [4, 2, 5]], [23, 0, [2, 6, 3, 5]],
  [27, 0, [3, 12, 4]], [33, 0, [2, 8]],
  [33, 91, [3, 5]], [40, 0, [3, 5]],
];
const SYMBOLS = ['F','U','TH','O','R','C','G','W','H','N','I','J',
  'EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'];
const SYMBOL_INDEX = new Map(SYMBOLS.map((name, index) => [name, index]));
assert.equal(corpus.pages.filter(page => page.page < 56)
  .reduce((count, page) => count + page.indices.length, 0), 12956);
assert.equal(corpus.runes.length, 29);
assert.equal(ink.counts.red, 225);

const pages = new Map(corpus.pages.map(page => [page.page, page.indices]));
const inkPages = new Map(ink.pages.map(page => [page.page, page]));
const words = [];
let globalOffset = 0;
for (const [page, start, lengths] of HEADS) {
  const count = lengths.reduce((sum, length) => sum + length, 0);
  const exactInk = inkPages.get(page).red_spans.some(
    span => span.start === start && span.length === count);
  assert.ok(exactInk, 'missing original red span');
  const redRunes = pages.get(page).slice(start, start + count);
  assert.equal(redRunes.length, count);
  let local = 0;
  for (const length of lengths) {
    words.push({
      page, sourceOffset: start + local, headingOffset: local,
      globalOffset: globalOffset + local, length,
      cipher: redRunes.slice(local, local + length),
    });
    local += length;
  }
  globalOffset += count;
}
assert.equal(globalOffset, 113);
assert.equal(words.length, 23);
const long11 = words.find(word => word.page === 3 && word.sourceOffset === 2);
const long12 = words.find(word => word.page === 27 && word.sourceOffset === 3);
assert.equal(long11.length, 11);
assert.equal(long12.length, 12);

/** @param {string} word @param {boolean} useIng */
function toGp(word, useIng) {
  const original = word.toUpperCase().replace(/K/g, 'C')
    .replace(/V/g, 'U').replace(/Z/g, 'S').replace(/Q/g, 'CW');
  const digraphs = [...(useIng ? ['ING'] : []),
    'TH', 'EO', 'OE', 'AE', 'IA', 'EA', 'NG'];
  const output = [];
  for (let i = 0; i < original.length;) {
    const multi = digraphs.find(unit => original.startsWith(unit, i));
    if (multi !== undefined) {
      output.push(SYMBOL_INDEX.get(multi === 'ING' ? 'NG' : multi));
      i += multi.length;
    } else {
      const symbol = SYMBOL_INDEX.get(original[i]);
      if (symbol === undefined) return null;
      output.push(symbol);
      i++;
    }
  }
  return output;
}
const sourceWords = lexicon.split(/\r?\n/).filter(line => line && !line.startsWith(';'))
  .map(line => line.split(' ')[0]);
assert.equal(sourceWords.length, 29157);

/** @param {boolean} useIng */
function poolFor(useIng) {
  const pool = new Map();
  for (const sourceWord of sourceWords) {
    const values = toGp(sourceWord, useIng);
    if (!values?.length) continue;
    if (!pool.has(values.length)) pool.set(values.length, []);
    pool.get(values.length).push({ sourceWord, values });
  }
  return pool;
}
/**
 * @param {{cipher:number[],headingOffset:number,globalOffset:number,length:number}} word
 * @param {Array<{sourceWord:string,values:number[]}>} candidates
 * @param {number} period
 * @param {boolean} reset
 */
function deriveKeys(word, candidates, period, reset) {
  const start = reset ? word.headingOffset : word.globalOffset;
  const viable = [];
  for (const candidate of candidates) {
    const key = Array(period).fill(-1);
    let valid = true;
    for (let i = 0; i < word.length; i++) {
      const phase = (start + i) % period;
      const value = (word.cipher[i] - candidate.values[i] + 29) % 29;
      if (key[phase] !== -1 && key[phase] !== value) {
        valid = false;
        break;
      }
      key[phase] = value;
    }
    if (valid) viable.push({ sourceWord: candidate.sourceWord, key });
  }
  return viable;
}
/** An exact two-word compatibility certificate for every possible secret key. */
function pairHasCompatibleKeys(left, right, period) {
  const sharedPhases = [];
  for (let i = 0; i < period; i++) {
    if (left.some(item => item.key[i] >= 0) &&
        right.some(item => item.key[i] >= 0)) sharedPhases.push(i);
  }
  const signature = item => sharedPhases.map(i => item.key[i]).join(',');
  const signatures = new Set(left.map(signature));
  return right.some(item => signatures.has(signature(item)));
}
/** Construct source-length native-GP ciphertext under an explicitly planted periodic key. */
function nativePlant(pool, period, reset) {
  const key = Array.from({length:period}, (_, i) => (11 + 7*i) % 29);
  return words.map((word, i) => {
    const candidates = pool.get(word.length);
    assert.ok(candidates?.length);
    const source = candidates[i % candidates.length].values;
    const start = reset ? word.headingOffset : word.globalOffset;
    return {...word, cipher: source.map((value, j) =>
      (value + key[(start+j) % period]) % 29)};
  });
}

/** Pattern equality is invariant under every one-to-one GP29 rune substitution. */
function equalityPattern(values) {
  const ids = new Map();
  return values.map(value => {
    if (!ids.has(value)) ids.set(value, ids.size);
    return ids.get(value);
  }).join(',');
}
const originalP27Pattern = equalityPattern(long12.cipher);
assert.equal(originalP27Pattern, '0,1,2,3,4,5,0,6,7,8,9,0');
for (const useIng of [false, true]) {
  const pool = poolFor(useIng);
  const samePattern = pool.get(12).filter(item =>
    equalityPattern(item.values) === originalP27Pattern);
  assert.equal(samePattern.length, 0,
    'p27 source-long heading word has no English-lexicon monoalphabetic image');
  const sourceWord = pool.get(12)[0].values;
  const seededPermutation = Array.from({length:29}, (_, index) =>
    (5 + 13*index) % 29);
  assert.equal(new Set(seededPermutation).size, 29);
  const implantedCipher = sourceWord.map(value => seededPermutation[value]);
  assert.equal(equalityPattern(implantedCipher),
    equalityPattern(sourceWord),
    'arbitrary secret monoalphabetic mapping must preserve word pattern');
  assert.ok(pool.get(12).some(item =>
    equalityPattern(item.values) === equalityPattern(implantedCipher)),
    'a planted native 12-rune word must survive pattern lookup');
}

const summary = [];
for (const useIng of [false, true]) {
  const pool = poolFor(useIng);
  for (const reset of [false, true]) {
    for (const period of [1, 9, 16]) {
      const plant = nativePlant(pool, period, reset);
      const plantedLeft = deriveKeys(plant.find(word =>
        word.page === 3 && word.sourceOffset === 2),
        pool.get(11), period, reset);
      const plantedRight = deriveKeys(plant.find(word =>
        word.page === 27 && word.sourceOffset === 3),
        pool.get(12), period, reset);
      assert.ok(plantedLeft.length && plantedRight.length);
      assert.ok(pairHasCompatibleKeys(plantedLeft, plantedRight, period),
        'same-clock native control must admit its planted shared secret key');
    }
    for (let period = 1; period <= 16; period++) {
      const left = deriveKeys(long11, pool.get(11), period, reset);
      const right = deriveKeys(long12, pool.get(12), period, reset);
      const compatible = pairHasCompatibleKeys(left, right, period);
      const certificate = period <= 8 ? 'p3 11-rune word unavailable'
        : period === 9 ? 'p27 12-rune word unavailable'
        : 'p3/p27 source words disagree on every common key';
      if (period <= 8) assert.equal(left.length, 0, certificate);
      else if (period === 9) assert.equal(right.length, 0, certificate);
      else assert.equal(compatible, false, certificate);
      summary.push({ useIng, reset, period, left: left.length,
        right: right.length, compatible, certificate });
    }
  }
}
assert.equal(summary.length, 64);
console.log(JSON.stringify({
  status: 'original-source conditional negative, no LP2 plaintext',
  heads: 9, redRunes: 113, originalWords: 23,
  lexiconWords: sourceWords.length,
  periods: '1..16', clocks: ['continuous-red-stream', 'heading-reset'],
  gpIngConventions: ['NG only', 'ING->NG'],
  positiveControls: '12/12 native plants admitted keys; 2/2 arbitrary secret monoalphabet plants found',
  p27Pattern: originalP27Pattern,
  p27MonoalphabeticEnglishLexiconMatches: 0,
  exactCertificates: summary,
}, null, 2));
