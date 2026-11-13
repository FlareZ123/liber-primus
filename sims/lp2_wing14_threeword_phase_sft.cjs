'use strict';

/**
 * LP2 p27 wing-14 / repeated three-rune word phase gate.
 * Source-pinned, read-only, Windows-compatible standalone test.
 * Run: node sims/lp2_wing14_threeword_phase_sft.cjs
 *
 * The original 2014 56-page unknown text is kept intact. Page boundaries
 * do not terminate words; printed word and clause punctuation does.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const master = fs.readFileSync(
  path.join(ROOT, 'resources', 'transcriptions', 'liber_primus_master.txt'), 'utf8'
).replace(/\r\n?/g, '\n');
const bodyPages = master.split('%').slice(16, 72);
assert.equal(bodyPages.length, 56);

const starts = [0];
for (const page of corpus.pages.slice(0, 56)) {
  starts.push(starts.at(-1) + page.indices.length);
}
assert.equal(starts.at(-1), 12956);

/** @type {{page:number,offset:number,glyphs:string}[]} */
const threeWords = [];
let absolute = 0;
let completeWordCount = 0;
let page = 0;
for (const token of bodyPages.join('').replaceAll('/', '').replace(/\s/g, '')
  .split(/[-.&$§]/u)) {
  const runes = token.match(/[\u16A0-\u16FF]/gu) ?? [];
  if (runes.length === 0) continue;
  completeWordCount++;
  const first = absolute;
  absolute += runes.length;
  while (page < 55 && first >= starts[page + 1]) page++;
  let finalPage = page;
  while (finalPage < 55 && absolute - 1 >= starts[finalPage + 1]) finalPage++;
  if (runes.length === 3 && finalPage === page) {
    threeWords.push({
      page,
      offset: first - starts[page],
      glyphs: runes.join('')
    });
  }
}
assert.equal(absolute, 12956);
assert.equal(completeWordCount, 2896);
assert.equal(threeWords.length, 716);

/** @type {Map<string, typeof threeWords>} */
const byWord = new Map();
const positions = Array.from({ length: 56 }, () => /** @type {number[]} */([]));
for (const word of threeWords) {
  positions[word.page].push(word.offset);
  const matches = byWord.get(word.glyphs) ?? [];
  matches.push(word);
  byWord.set(word.glyphs, matches);
}
const repetitions = [...byWord.entries()].filter(([, occurrences]) => occurrences.length > 1);
const bookendWords = new Set(['ᛞᛄᚢ', 'ᛒᛖᛁ']);

/** Count exact repeated word pairs whose starts share the page-local period. */
function pairedWords(period, excludeBookend = false) {
  let allPairs = 0;
  let aligned = 0;
  for (const [word, occurrences] of repetitions) {
    if (excludeBookend && bookendWords.has(word)) continue;
    for (let i = 0; i < occurrences.length; i++) {
      for (let j = 0; j < i; j++) {
        allPairs++;
        if ((occurrences[i].offset - occurrences[j].offset) % period === 0) {
          aligned++;
        }
      }
    }
  }
  return { allPairs, aligned };
}
assert.deepEqual(pairedWords(14), { allPairs: 17, aligned: 8 });
assert.deepEqual(pairedWords(14, true), { allPairs: 15, aligned: 6 });
assert.deepEqual(pairedWords(7), { allPairs: 17, aligned: 9 });

/** The repeated p27/p55 two-word seam is phase-zero at both source starts. */
const dju = byWord.get('ᛞᛄᚢ');
const bei = byWord.get('ᛒᛖᛁ');
assert.deepEqual(dju.map(x => [x.page, x.offset]), [[27, 28], [55, 70]]);
assert.deepEqual(bei.map(x => [x.page, x.offset]), [[27, 31], [55, 73]]);
assert.deepEqual(
  corpus.pages[28].indices.slice(224, 229),
  corpus.pages[33].indices.slice(56, 61)
);

/** Page-locked shuffle preserves all source word lengths, original page
 * assignments of repeated words, exact page-specific three-rune word slots,
 * and the original repeated-word multiplicities. It does not preserve glyph
 * assignments at a given slot: that is the tested source phase association.
 */
let state = 0x14fa3301;
/** @param {number} bound */
function randomIndex(bound) {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return (state >>> 0) % bound;
}
const DRAWS = 400000;
let hits14 = 0;
let hits14WithoutSeam = 0;
let hits7 = 0;
const histogram14 = Array.from({ length: 18 }, () => 0);
for (let sample = 0; sample < DRAWS; sample++) {
  const used = Array.from({ length: 56 }, () => new Set());
  let seen14 = 0;
  let seen14WithoutSeam = 0;
  let seen7 = 0;
  for (const [word, occurrences] of repetitions) {
    /** @type {number[]} */
    const drawn = [];
    for (const original of occurrences) {
      const options = positions[original.page];
      let index;
      do {
        index = randomIndex(options.length);
      } while (used[original.page].has(index));
      used[original.page].add(index);
      drawn.push(options[index]);
    }
    for (let i = 0; i < drawn.length; i++) {
      for (let j = 0; j < i; j++) {
        if ((drawn[i] - drawn[j]) % 7 === 0) seen7++;
        if ((drawn[i] - drawn[j]) % 14 === 0) {
          seen14++;
          if (!bookendWords.has(word)) seen14WithoutSeam++;
        }
      }
    }
  }
  histogram14[seen14]++;
  if (seen14 >= 8) hits14++;
  if (seen14WithoutSeam >= 6) hits14WithoutSeam++;
  if (seen7 >= 9) hits7++;
}
assert.equal(hits14, 27);
assert.equal(hits14WithoutSeam, 335);
assert.equal(hits7, 268);

/** Native GP spelling, with attested K/Q->C, V->U, Z->S, QU->CW. */
const gpSpellings = [...corpus.translit].sort((a, b) => b.length - a.length);
const gpIndexes = new Map(corpus.translit.map((g, i) => [g, i]));
/** @param {string} latinWord */
function nativeGPWord(latinWord) {
  let rest = latinWord.toUpperCase().replaceAll('QU', 'CW')
    .replaceAll('V', 'U').replaceAll('K', 'C')
    .replaceAll('Q', 'C').replaceAll('Z', 'S');
  /** @type {number[]} */
  const out = [];
  while (rest) {
    const next = gpSpellings.find(s => rest.startsWith(s));
    assert.ok(next, 'unmappable Latin source');
    out.push(gpIndexes.get(next));
    rest = rest.slice(next.length);
  }
  return out;
}
const shakespeare = fs.readFileSync(
  path.join(ROOT, 'resources', 'control', 'shakespeare_first300k.txt'), 'utf8'
);
const nativeThree = (shakespeare.match(/[a-z]+/gi) ?? []).map(nativeGPWord)
  .filter(runes => runes.length === 3);
assert.equal(nativeThree.length, 13106);
const and = nativeGPWord('AND');
let andInWindow = 0;
let minimumAnd = Infinity;
for (let i = 0; i < nativeThree.length; i++) {
  if (nativeThree[i].every((value, j) => value === and[j])) andInWindow++;
  if (i >= threeWords.length && nativeThree[i - threeWords.length]
    .every((value, j) => value === and[j])) andInWindow--;
  if (i >= threeWords.length - 1) minimumAnd = Math.min(minimumAnd, andInWindow);
}
assert.equal(minimumAnd, 54);

/** Pigeonhole: one GP3 word occurring n times in 14 phases produces at
 * least this many pairs of identical ciphertext words in the same phase,
 * under ANY fixed per-phase bijection of the full 29-rune alphabet.
 */
function minimumCoincidentPairs(n, phases) {
  const q = Math.floor(n / phases);
  const r = n % phases;
  return r * (q * (q + 1) / 2) +
    (phases - r) * (q * (q - 1) / 2);
}
assert.equal(minimumCoincidentPairs(22, 14), 8);
assert.equal(minimumCoincidentPairs(23, 14), 9);
assert.equal(minimumCoincidentPairs(54, 14), 78);

/** Fixed secret affine alphabet by local rune position, a valid bijection
 * over GF29. Plant a whole Shakespeare GP3 register into the exact source
 * 716 word slots. A source-independent real period-14 decoder must preserve
 * all same-phase three-word equalities.
 */
const forward = (value, phase) => {
  const a = 1 + (7 * phase % 28);
  const b = (11 * phase + 5) % 29;
  return (a * value + b) % 29;
};
const reverse = (value, phase) => {
  const a = 1 + (7 * phase % 28);
  const b = (11 * phase + 5) % 29;
  let inv = 1;
  while ((a * inv) % 29 !== 1) inv++;
  return (((value - b + 29) * inv) % 29);
};
const synthetic = new Map();
let syntheticSamePhasePairs = 0;
let recovered = 0;
for (let i = 0; i < threeWords.length; i++) {
  const source = nativeThree[i];
  const slot = threeWords[i];
  const cipher = source.map((rune, j) => forward(rune, (slot.offset + j) % 14));
  const inverse = cipher.map((rune, j) => reverse(rune, (slot.offset + j) % 14));
  assert.deepEqual(inverse, source);
  recovered += source.length;
  const key = `${slot.offset % 14}:${cipher.join(',')}`;
  syntheticSamePhasePairs += synthetic.get(key) ?? 0;
  synthetic.set(key, (synthetic.get(key) ?? 0) + 1);
}
assert.equal(recovered, 2148);
assert.ok(syntheticSamePhasePairs >= 78);

const report = {
  source: { runes: absolute, words: completeWordCount,
    fullThreeRuneWords: threeWords.length, repeatedTypes: repetitions.length },
  observed: { threeRunePairs: pairedWords(14), withoutKnownBookend: pairedWords(14, true),
    period7: pairedWords(7), period14: pairedWords(14) },
  pageLockedNull: { draws: DRAWS,
    phase14Exceedances: hits14, corrected14: (hits14 + 1) / (DRAWS + 1),
    phase14WithoutBookendExceedances: hits14WithoutSeam,
    corrected14WithoutBookend: (hits14WithoutSeam + 1) / (DRAWS + 1),
    phase7Exceedances: hits7, corrected7: (hits7 + 1) / (DRAWS + 1),
    histogram14: histogram14.slice(0, 12) },
  allSecretStationary14: { minimumAndInAnyShakespeareThreeWordWindow: minimumAnd,
    mandatoryRepeatedCipherWordPairs: minimumCoincidentPairs(minimumAnd, 14),
    originalTotalRepeatedCipherWordPairsSamePhase: 8,
    maximumPermittedRepeatedSinglePlainWord: 22 },
  positiveControl: { sourceRunesRecovered: recovered, encryptedSamePhasePairs: syntheticSamePhasePairs },
  conclusion: 'Strong conditioned three-word phase association; ordinary stationary periodic substitution fails the source-native-English necessary condition. No decryption.'
};
console.log(JSON.stringify(report, null, 2));
