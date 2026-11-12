'use strict';

/**
 * Original-image nine-chapter shared GP29 additive-pad invariant.
 *
 * For chapters a,b with a common reset keystream K[t], regardless of K:
 *  C_a[t] === C_b[t]  iff  P_a[t] === P_b[t].
 * For an independently constant chapter offset, differences shift by the
 * offset; allowing each chapter pair its own maximizing residue is a
 * generous phase-invariant upper bound.
 *
 * Human-visible red headings/terminal 13-dot marks select the nine chapter
 * starts. Control native GP29 English words preserve *each original printed
 * word length* and chapter membership. No key/hypothesis is fitted to LP2.
 *
 * Execute: node sims/lp2_visual_chapter_shared_pad_eq_sft.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const text = read('resources/liber-primus/lp2-transcription.txt');
const bounds = [[0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]];
const chapters = bounds.map(([begin, end]) =>
  corpus.pages.filter(p => p.page >= begin && p.page <= end).flatMap(p => p.indices));
const expectedLengths = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];
assert.deepEqual(chapters.map(x => x.length), expectedLengths);
assert.equal(expectedLengths.reduce((s, n) => s + n, 0), 12956);
const source = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
const runeIndex = new Map(corpus.runes.map((v, i) => [v, i]));
const byRune = [];
const groupedWordLengths = Array.from({ length: 9 }, () => []);
let pendingWord = [];
let position = 0;
const starts = [0];
for (let i = 0; i < chapters.length - 1; i++) starts.push(starts.at(-1) + chapters[i].length);
function chapterOf(pos) {
  for (let k = starts.length - 1; k >= 0; k--) if (pos >= starts[k]) return k;
  throw Error('out of source');
}
function flushWord() {
  if (!pendingWord.length) return;
  const j = chapterOf(pendingWord[0]);
  assert.equal(chapterOf(pendingWord.at(-1)), j,
    'Visible original chapter boundary cannot cut a printed source word');
  groupedWordLengths[j].push(pendingWord.length);
  pendingWord = [];
}
for (const ch of text) {
  const v = runeIndex.get(ch);
  if (v !== undefined && position < 12956) {
    byRune.push(v);
    pendingWord.push(position++);
  } else if ('-.$&§'.includes(ch)) flushWord();
}
flushWord();
assert.deepEqual(byRune, source);
assert.equal(position, 12956);
assert.equal(groupedWordLengths.reduce((n, words) => n + words.length, 0), 2896);
for (let j = 0; j < 9; j++) {
  assert.equal(groupedWordLengths[j].reduce((s, n) => s + n, 0), chapters[j].length);
}

const dictionary = Array.from({ length: 15 }, () => []);
const alphabet = corpus.translit.map((symbol, i) => ({ symbol, i }))
  .sort((a, b) => b.symbol.length - a.symbol.length);
/** @param {string} original @returns {number[]} */
function gpWord(original) {
  const word = original.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/K/g, 'C').replace(/Z/g, 'S')
    .replace(/Q/g, 'C');
  const result = [];
  for (let i = 0; i < word.length;) {
    const found = alphabet.find(item => word.startsWith(item.symbol, i));
    if (!found) return [];
    result.push(found.i);
    i += found.symbol.length;
  }
  return result;
}
const nativeTextFiles = [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
];
for (const filename of nativeTextFiles) {
  for (const word of read(filename).match(/[A-Za-z]+/g) || []) {
    const gp = gpWord(word);
    if (gp.length > 0 && gp.length < dictionary.length) dictionary[gp.length].push(gp);
  }
}
assert.ok(dictionary.slice(1).every(a => a.length > 0));
assert.deepEqual(dictionary.slice(11).map(a => a.length), [263, 133, 36, 9]);

let rngState = 0x33010009;
/** @returns {number} */
function rand32() {
  rngState ^= rngState << 13;
  rngState ^= rngState >>> 17;
  rngState ^= rngState << 5;
  return rngState >>> 0;
}
/** @returns {number[][]} */
function sampleEnglish() {
  return groupedWordLengths.map(lengths => {
    const tape = [];
    for (const length of lengths) {
      const options = dictionary[length];
      const word = options[rand32() % options.length];
      tape.push(...word);
    }
    return tape;
  });
}
/** @param {number[][]} tapes */
function statistic(tapes) {
  let comparisons = 0, equal = 0, maximized = 0;
  for (let a = 0; a < 9; a++) for (let b = a + 1; b < 9; b++) {
    const length = Math.min(tapes[a].length, tapes[b].length);
    const residues = new Uint16Array(29);
    for (let k = 0; k < length; k++) {
      residues[(tapes[a][k] - tapes[b][k] + 29) % 29]++;
    }
    comparisons += length;
    equal += residues[0];
    maximized += Math.max(...residues);
  }
  return { comparisons, equal, maximized, equalityRate: equal / comparisons,
    pairwiseBestShiftRate: maximized / comparisons };
}
const original = statistic(chapters);
assert.equal(original.comparisons, 35551);
assert.equal(original.equal, 1161);
assert.ok(Math.abs(original.equalityRate - 0.03265730921774352) < 1e-13);

// Positive plant: a reused authentic solved-p56-type phi(prime) key.
// One native chapter is long enough to reveal its entire 3008-symbol key;
// with its known plaintext all nine synthetic chapters recover exactly.
const plantEnglish = sampleEnglish();
const primes = [];
for (let n = 2; primes.length < 3008; n++) {
  let isPrime = true;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) { isPrime = false; break; }
  if (isPrime) primes.push(n);
}
const key = primes.map(p => (p - 1) % 29);
const planted = plantEnglish.map(tape => tape.map((plain, i) => (plain + key[i]) % 29));
assert.deepEqual(statistic(planted), statistic(plantEnglish));
const longest = 7;
const recoveredKey = planted[longest].map((cipher, i) =>
  (cipher - plantEnglish[longest][i] + 29) % 29);
assert.deepEqual(recoveredKey, key);
for (let i = 0; i < 9; i++) {
  const plain = planted[i].map((cipher, k) =>
    (cipher - recoveredKey[k] + 29) % 29);
  assert.deepEqual(plain, plantEnglish[i]);
}
const trials = 2000;
let sharedMean = 0, independentMean = 0;
let sharedShiftMean = 0, independentShiftMean = 0;
let sharedMin = Infinity, sharedShiftMin = Infinity;
let independentBelow = 0, sharedBelow = 0, sharedShiftBelow = 0;
let nullBelow = 0;
for (let iteration = 0; iteration < trials; iteration++) {
  const plain = sampleEnglish();
  const shared = statistic(plain); // a common pad preserves this exactly
  sharedMean += shared.equalityRate;
  sharedShiftMean += shared.pairwiseBestShiftRate;
  sharedMin = Math.min(sharedMin, shared.equalityRate);
  sharedShiftMin = Math.min(sharedShiftMin, shared.pairwiseBestShiftRate);
  if (shared.equalityRate <= original.equalityRate) sharedBelow++;
  if (shared.pairwiseBestShiftRate <= original.pairwiseBestShiftRate) sharedShiftBelow++;

  // Independently sampled GP29 pad at every chapter and rune.
  const independent = plain.map(chapter =>
    chapter.map(v => (v + rand32() % 29) % 29));
  const nullStat = statistic(independent);
  independentMean += nullStat.equalityRate;
  independentShiftMean += nullStat.pairwiseBestShiftRate;
  if (nullStat.equalityRate <= original.equalityRate) nullBelow++;
}
const output = {
  model: 'Same additive GP29 keystream from nine source-visual chapter starts',
  originalBoundaries: bounds,
  sourcePrint: { totalRunes: 12956, totalWords: 2896,
    originalChapterLengths: expectedLengths, pairwisePositions: original.comparisons },
  actualOriginal: original,
  sourceMatchedNativeEnglishControl: { sourceFiles: nativeTextFiles, trials,
    meanEquality: sharedMean / trials,
    minimumEquality: sharedMin,
    equalOrLowerThanOriginal: sharedBelow,
    empiricalLowerTail: (sharedBelow + 1) / (trials + 1),
    meanBestShift: sharedShiftMean / trials,
    minimumBestShift: sharedShiftMin,
    bestShiftEqualOrLowerThanOriginal: sharedShiftBelow,
    bestShiftLowerTail: (sharedShiftBelow + 1) / (trials + 1) },
  independentPadNull: { trials,
    meanEquality: independentMean / trials,
    equalOrLowerThanOriginal: nullBelow,
    empiricalLowerTail: (nullBelow + 1) / (trials + 1),
    meanBestShift: independentShiftMean / trials },
  plantedExact: { gpSymbolCount: 12956, keyLength: 3008, allNineRecovered: true,
    keyRecoveredFromLongestKnownPlaintext: true },
  conclusion: 'No shared native-GP English additive pad starting at all nine original visual chapter boundaries; this invariant cannot rule out independent keys or other cipher families.',
};
console.log(JSON.stringify(output, null, 2));
