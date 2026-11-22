'use strict';
/**
 * Original LP2 complete-word GP29 -> GP30 SPACE transducer.
 * Historic operator: signed 2013 BASE29 source; speculative use of GP+SPACE=30.
 *
 * Execute from repository root on Windows 11 / Node 22:
 *   node sims/lp2_wordspace_base29_to30_original_sft.cjs
 *
 * The exact original physical word boundaries are decoder side information.
 * This is a reversible original-source test, not an authenticated Cicada key.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const txt = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
const json = (file) => JSON.parse(txt(file));
const corpus = json('resources/liber-primus/lp2-corpus.json');
const transcript = txt('resources/lp2-transcription.txt');
const alphabet = new Map(corpus.runes.map((glyph, index) => [glyph, index]));
const source = transcript.split('$').slice(0, 8).join('$');
assert.equal(transcript.split('$').length, 10);

/**
 * @typedef {{runes:number[], start:number}} SourceWord
 * @returns {{words:SourceWord[], runes:number[], crossPageWords:number, sourcePositions:number[]}}
 */
function sourceWords() {
  /** @type {SourceWord[]} */
  const words = [];
  const runes = [];
  const sourcePositions = [];
  /** @type {number[]} */
  let current = [];
  let start = 0;
  let crossing = false;
  let crossPageWords = 0;

  const flush = () => {
    if (!current.length) return;
    words.push({ start, runes: current });
    if (crossing) crossPageWords++;
    current = [];
    crossing = false;
  };

  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    const gp = alphabet.get(ch);
    if (gp !== undefined) {
      if (!current.length) start = runes.length;
      current.push(gp);
      runes.push(gp);
      sourcePositions.push(i);
    } else if (ch === '-' || ch === '.' || ch === '&' || ch === '$') {
      flush();
    } else if (ch === '%') {
      // Only count an actual word crossing the source page delimiter.
      // In the original transcription, punctuation resets the word.
      if (current.length) {
        let next = i + 1;
        while (next < source.length && !alphabet.has(source[next]) &&
          source[next] !== '-' && source[next] !== '.') next++;
        if (next < source.length && alphabet.has(source[next])) crossing = true;
      }
    }
  }
  flush();
  return { words, runes, crossPageWords, sourcePositions };
}

/**
 * Lossless fixed-width natural base conversion with an explicit bound.
 * Preserve printed word length as a public sidecar, including leading F=0.
 * @param {number[]} digits
 * @param {number} fromBase
 * @param {number} toBase
 * @returns {number[]}
 */
function baseConvert(digits, fromBase, toBase) {
  let value = 0n;
  for (const digit of digits) {
    assert.ok(Number.isInteger(digit) && digit >= 0 && digit < fromBase);
    value = value * BigInt(fromBase) + BigInt(digit);
  }
  assert.ok(value < BigInt(toBase) ** BigInt(digits.length),
    'Output integer cannot fit fixed-width recipient block');
  const out = Array(digits.length).fill(0);
  for (let i = out.length - 1; i >= 0; i--) {
    out[i] = Number(value % BigInt(toBase));
    value /= BigInt(toBase);
  }
  assert.equal(value, 0n);
  return out;
}

/**
 * @param {number[]} values
 * @returns {number}
 */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const x of values) assert.ok(x < 29), counts[x]++;
  return counts.reduce((s, x) => s + x * (x - 1), 0) /
    (values.length * (values.length - 1));
}

/**
 * @param {number[]} tokens
 * @returns {{n:number, spaces:number, maxLabelCount:number, maxLabel:number, gpIoC:number}}
 */
function stats(tokens) {
  const counts = Array(30).fill(0);
  for (const x of tokens) counts[x]++;
  const maxLabelCount = Math.max(...counts);
  const gp = tokens.filter(x => x !== 29);
  return {
    n: tokens.length,
    spaces: counts[29],
    maxLabelCount,
    maxLabel: counts.indexOf(maxLabelCount),
    gpIoC: ioc(gp)
  };
}
const sourceData = sourceWords();
const { words, runes, crossPageWords, sourcePositions } = sourceData;
assert.equal(source.split('%').length - 1, 54);
assert.equal(words.length, 2896);
assert.equal(runes.length, 12956);
assert.equal(crossPageWords, 32);
assert.equal(words.filter(x => x.runes.length === 1).length, 83);
assert.equal(words.filter(x => x.runes.length === 2).length, 448);
assert.deepEqual(words.flatMap(x => x.runes), runes);

/** Decode all original rune words, treating GP+SPACE as the alphabet 30. */
const converted = words.map(w => baseConvert(w.runes, 29, 30));
const out = converted.flat();
assert.equal(out.length, runes.length);
assert.deepEqual(converted.map(w => w.length), words.map(w => w.runes.length));
assert.deepEqual(converted.map(w => baseConvert(w, 30, 29)), words.map(w => w.runes));

// All original glyphs, marks, original punctuation, exact physical line breaks,
// and cross-page word continuations must survive the inverse bit for bit.
const replayGlyphs = words.flatMap(w => w.runes);
const reconstructed = [...source];
sourcePositions.forEach((originalIndex, index) => {
  reconstructed[originalIndex] = corpus.runes[replayGlyphs[index]];
});
assert.equal(reconstructed.join(''), source);

const overall = stats(out);
assert.equal(overall.spaces, 329);
assert.equal(overall.maxLabelCount, 480);
assert.ok(Math.abs(overall.gpIoC - 0.034563618994550925) < 1e-14);

const unknownPages = corpus.pages.filter(p => p.page <= 55).sort((a, b) => a.page - b.page);
const physicalPageStarts = new Map();
let cursor = 0;
let perPageMaximum = 0;
const pageRecords = [];
for (const page of unknownPages) {
  const pageRunes = page.indices.length;
  physicalPageStarts.set(page.page, cursor);
  const originalPage = runes.slice(cursor, cursor + pageRunes);
  assert.deepEqual(originalPage, page.indices, 'Original word segmentation must not alter physical rune order');
  const st = stats(out.slice(cursor, cursor + pageRunes));
  perPageMaximum += st.maxLabelCount;
  pageRecords.push({ page: page.page, ...st });
  cursor += pageRunes;
}
assert.equal(cursor, 12956);
assert.equal(unknownPages.filter(p => p.indices.length > 0).length, 55);
assert.equal(perPageMaximum, 767);
const interval = (first, last) => out.slice(
  physicalPageStarts.get(first),
  physicalPageStarts.get(last) + unknownPages.find(p => p.page === last).indices.length
);
const early = stats(interval(16, 21));
const heldout = stats(interval(40, 53));
assert.deepEqual([early.n, early.spaces, early.maxLabelCount], [1613, 42, 73]);
assert.deepEqual([heldout.n, heldout.spaces, heldout.maxLabelCount], [3008, 66, 124]);
assert.ok(Math.abs(early.gpIoC - 0.03461951696148747) < 1e-14);
assert.ok(Math.abs(heldout.gpIoC - 0.034547089820630573) < 1e-14);

/**
 * The number of eventual plaintext SPACEs under ANY stationary GP30
 * symbol-permutation per physical page is no greater than the observed
 * most frequent output symbol in each such page. The sum is achievable
 * if secret alphabets can differ by page, so this is a tight all-key bound.
 */

/**
 * A complete all-secret classification gate for strictly more favorable
 * source-typed secret alphabets. Each (page, printed word length, rune slot)
 * state may independently apply an arbitrary GP30 permutation. The maximum
 * achievable SPACE count is the sum of its most frequent input symbol.
 * The exact equality witness is a per-state permutation sending the best
 * source symbol to SPACE and every other symbol to a distinct native label.
 *
// Source punctuation's explicit full stops and chapter/section breaks may
// reset a decoder. They do not delete/insert a GP rune and are treated as
// independent secret-alphabet scopes for this all-key capacity gate.
const punctuationAtRune = [];
let punctuationScope = 0;
for (const ch of source) {
  if (ch === '.' || ch === '&') punctuationScope++;
  else if (alphabet.has(ch)) punctuationAtRune.push(punctuationScope);
}
assert.equal(punctuationAtRune.length, 12956);
assert.equal((source.match(/\./g) || []).length, 175);
assert.equal((source.match(/&/g) || []).length, 17);

 * @param {Array<'page'|'chapter'|'length'|'position'|'punctuation'>} fields
 * @returns {{classes:number,maximum:number,achieved:number,fraction:number}}
 */
function alphabetSpaceCapacity(fields) {
  /** @type {Map<string,{counts:number[],tokens:number[]}>} */
  const states = new Map();
  const pageAtIndex = unknownPages.flatMap(p => Array(p.indices.length).fill(p.page));
  const chapter = (page) => [3,8,15,23,27,33,40,54].filter(start => page >= start).length;
  const features = words.flatMap((w, wi) =>
    converted[wi].map((digit, position) => ({
      digit, page: pageAtIndex[w.start + position], length: w.runes.length,
      position, chapter: chapter(pageAtIndex[w.start + position]),
      punctuation: punctuationAtRune[w.start + position]
    }))
  );
  assert.equal(features.length, runes.length);
  for (const row of features) {
    const label = fields.map(field => row[field]).join(':');
    if (!states.has(label)) states.set(label, { counts: Array(30).fill(0), tokens: [] });
    const state = states.get(label);
    state.counts[row.digit]++;
    state.tokens.push(row.digit);
  }
  let maximum = 0;
  let achieved = 0;
  for (const { counts, tokens } of states.values()) {
    const most = Math.max(...counts);
    maximum += most;
    const target = counts.indexOf(most);
    // A concrete all-secret bijection can send 'target' to GP30 SPACE29.
    const map = Array.from({ length: 30 }, (_, i) =>
      i === target ? 29 : (i < target ? i : i - 1));
    assert.equal(new Set(map).size, 30);
    achieved += tokens.filter(digit => map[digit] === 29).length;
  }
  assert.equal(maximum, achieved);
  return { classes: states.size, maximum, achieved, fraction: maximum / runes.length };
}
const secretCapacities = {
  global: alphabetSpaceCapacity([]),
  perPage: alphabetSpaceCapacity(['page']),
  perLength: alphabetSpaceCapacity(['length']),
  perChapterLength: alphabetSpaceCapacity(['chapter', 'length']),
  perOriginalPunctuationScope: alphabetSpaceCapacity(['punctuation']),
  perOriginalPunctuationScopeLength: alphabetSpaceCapacity(['punctuation', 'length']),
  perOriginalPunctuationScopePosition: alphabetSpaceCapacity(['punctuation', 'position']),
  perPageLength: alphabetSpaceCapacity(['page', 'length']),
  perChapterLengthPosition: alphabetSpaceCapacity(['chapter', 'length', 'position']),
  perPageLengthPosition: alphabetSpaceCapacity(['page', 'length', 'position'])
};
assert.deepEqual(
  [
    secretCapacities.global.maximum,
    secretCapacities.perPage.maximum,
    secretCapacities.perLength.maximum,
    secretCapacities.perChapterLength.maximum,
    secretCapacities.perOriginalPunctuationScope.maximum,
    secretCapacities.perOriginalPunctuationScopeLength.maximum,
    secretCapacities.perOriginalPunctuationScopePosition.maximum,
    secretCapacities.perPageLength.maximum,
    secretCapacities.perChapterLengthPosition.maximum,
    secretCapacities.perPageLengthPosition.maximum
  ],
  [480, 767, 600, 890, 1028, 2142, 2505, 1595, 1729, 3893]
);
assert.equal(secretCapacities.global.classes, 1);
assert.equal(secretCapacities.perPage.classes, 55);
assert.equal(secretCapacities.perOriginalPunctuationScope.classes, 175);
assert.equal(secretCapacities.perOriginalPunctuationScopeLength.classes, 1055);
assert.equal(secretCapacities.perOriginalPunctuationScopePosition.classes, 1503);
assert.equal(secretCapacities.perPageLength.classes, 529);
assert.equal(secretCapacities.perChapterLengthPosition.classes, 740);
assert.equal(secretCapacities.perPageLengthPosition.classes, 3023);
assert.ok(secretCapacities.perChapterLengthPosition.fraction < 19 / 114);
assert.ok(secretCapacities.perPageLength.fraction < 19 / 114);

const native = txt('resources/transcriptions/liber_primus_master.txt')
  .split(/\r?\n\r?\n/).slice(1).join('\n\n')
  .split(/^\s*%\s*$/m).slice(8, 12).join('');
let nRunes = 0;
let nWords = 0;
let hasWord = false;
for (const ch of native) {
  if (alphabet.has(ch)) { nRunes++; hasWord = true; }
  else if ((ch === '-' || ch === '.' || ch === '&') && hasWord) {
    nWords++;
    hasWord = false;
  }
}
if (hasWord) nWords++;
assert.equal(nRunes, 755);
assert.equal(nWords, 181);
const solvedP57 = corpus.pages.find(p => p.page === 57);
assert.equal(solvedP57.indices.length, 95);
assert.equal(perPageMaximum / 12956 < 0.06, true);
assert.equal(19 / (95 + 19) > perPageMaximum / 12956, true);
assert.equal((nWords - 1) / (nRunes + nWords - 1) > perPageMaximum / 12956, true);

/**
 * Constructive positive control with genuine p57 original GP spellings.
 * Make GP30 plaintext blocks that fit under 29^m by choosing the first
 * digit 0 for blocks of length>1; use a deliberately typed SPACE as the
 * final token in every fifth multi-glyph block. Encode to GP29 and recover.
 */
let plantedSpaces = 0;
const plantedGP30 = words.map((w, index) => {
  const len = w.runes.length;
  if (len === 1) return [solvedP57.indices[index % solvedP57.indices.length]];
  const output = [0, ...Array.from({ length: len - 1 }, (_, k) =>
    solvedP57.indices[(index + k) % solvedP57.indices.length])];
  if (index % 5 === 0) { output[len - 1] = 29; plantedSpaces++; }
  return output;
});
const syntheticSource = plantedGP30.map(w => baseConvert(w, 30, 29));
const syntheticDecoded = syntheticSource.map(w => baseConvert(w, 29, 30));
assert.deepEqual(syntheticDecoded, plantedGP30);
assert.deepEqual(syntheticSource.flatMap(w => baseConvert(w, 29, 30)), plantedGP30.flat());
assert.ok(plantedSpaces > 300);

console.log('INPUT', JSON.stringify({
  originalRuneCount: runes.length,
  originalWords: words.length,
  sourceCrossPageWords: crossPageWords,
  originalOneRuneWords: words.filter(x => x.runes.length === 1).length,
  originalTwoRuneWords: words.filter(x => x.runes.length === 2).length
}));
console.log('ORIGINAL_BASE29_TO_GP30', JSON.stringify(overall));
console.log('ORIGINAL_FIRST_80_GP30', out.slice(0, 80).map(n => n === 29 ? '|' : corpus.translit[n]).join(' '));
console.log('EARLY_P16_21', JSON.stringify(early));
console.log('HELDOUT_P40_53', JSON.stringify(heldout));
console.log('ALL_SECRET_BIJECTION_CLASSES', JSON.stringify(secretCapacities));
console.log('ALL_SECRET_BIJECTION_PER_PAGE', JSON.stringify({
  exactMaxPossibleSpaceTokens: perPageMaximum,
  possibleSpaceTokenFraction: perPageMaximum / out.length,
  literalSpaceTokens: overall.spaces,
  solvedP57SpaceFraction: 19 / 114,
  solvedNativeLP1SpaceFraction: 180 / 935,
  actualSourcePages: pageRecords.length,
}));
console.log('POSITIVE_NATIVE_PLANT', JSON.stringify({
  genuineNativeP57RuneDonor: solvedP57.indices.length,
  exactReconstructedSyntheticWords: syntheticSource.length,
  syntheticallyReconstructedSpaces: plantedSpaces
}));
console.log('PASS. This particular source-motivated fixed-width wordwise base29-to-30 SPACE decoder cannot produce ordinary GP source prose on original receivers, even with arbitrary page-specific stationary output alphabets. The original book does not select base30.');
