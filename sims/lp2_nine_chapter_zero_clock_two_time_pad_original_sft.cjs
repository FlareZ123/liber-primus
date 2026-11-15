'use strict';

/**
 * Original nine-visual-chapter same-phase, same-rune-clock reused additive-pad
 * opportunity. An authentic positive would allow a many-time-pad attack.
 *
 * This is NOT a general impossibility result for page-specific keys,
 * transparent-F skips, nonadditive feedback or different plaintext registers.
 * Uses only original LP2 GP29 indices; native p57 encoder exact control.
 *
 * SFT: Node.js 22 CommonJS, read-only, Windows compatible.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.join(__dirname, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const chapterStarts = [0, 3, 8, 15, 23, 27, 33, 40, 54];
const chapterSizes = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];
const unknown = corpus.pages.filter(page => page.page <= 55);
const chapters = chapterStarts.map((start, i) =>
  unknown.filter(page => page.page >= start && page.page < (chapterStarts[i + 1] ?? 56))
    .flatMap(page => page.indices));
assert.deepEqual(chapters.map(x => x.length), chapterSizes);
assert.equal(chapters.reduce((n, x) => n + x.length, 0), 12956);
const mod = x => (x % 29 + 29) % 29;

/**
 * Historical native-Cicada orthography, frozen by original solved p57:
 * K/Q -> GP C, V -> GP U, Z -> GP S, ING -> the single GP NG rune.
 * "TUNNELING" becomes source-native T U N N E L NG.
 *
 * @param {string} str
 * @returns {number[]}
 */
function gp(str) {
  const text = str.toUpperCase().replace(/[^A-Z]/g, '')
    .replace(/[KVQZ]/g, v => ({ K: 'C', V: 'U', Q: 'C', Z: 'S' })[v]);
  const tokens = [{ tok: 'ING', index: 21 },
    ...corpus.translit.map((tok, index) => ({ tok, index }))].sort(
      (a, b) => b.tok.length - a.tok.length);
  const output = [];
  for (let i = 0; i < text.length;) {
    const selected = tokens.find(token => text.startsWith(token.tok, i));
    assert(selected, 'unhandled native GP token '+text.slice(i, i + 12));
    output.push(selected.index);
    i += selected.tok.length;
  }
  return output;
}
const knownP57 = read('resources/liber-primus/lp1-plaintext-reference.txt')
  .split('### 57')[1];
assert(knownP57);
assert.deepEqual(gp(knownP57), corpus.pages.find(page => page.page === 57).indices);

const gibranOriginal = read('resources/control/gibran_prophet_58585.txt');
const gibranBegin = gibranOriginal.indexOf('Almustafa');
assert(gibranBegin !== -1);
const gibranEnd = gibranOriginal.indexOf('End of the Project Gutenberg EBook');
const training = gp(gibranOriginal.slice(gibranBegin,
  gibranEnd > gibranBegin ? gibranEnd : undefined));
assert(training.length > 25000);
const referenceCount = Array(29).fill(0);
for (const symbol of training) referenceCount[symbol]++;
const reference = referenceCount.map(count =>
  (count + 0.5) / (training.length + 29 * 0.5));
const differenceProbabilities = Array.from({ length: 29 }, (_, delta) =>
  reference.reduce((sum, freq, index) =>
    sum + freq * reference[mod(index - delta)], 0));
assert(Math.abs(differenceProbabilities.reduce((a, b) => a + b) - 1) < 1e-10);

/** @param {number[]} a @param {number[]} b */
function compare(a, b) {
  const n = Math.min(a.length, b.length);
  const freq = Array(29).fill(0);
  for (let i = 0; i < n; i++) freq[mod(a[i] - b[i])]++;
  const logBayes = freq.reduce((acc, count, delta) =>
    acc + count * Math.log(29 * differenceProbabilities[delta]), 0);
  const chi2 = freq.reduce((acc, count) =>
    acc + (count - n / 29) ** 2 / (n / 29), 0);
  return { n, llr: logBayes, llrPerRune: logBayes / n, chi2 };
}
/** @param {number[][]} inputs */
function crossChapter(inputs) {
  const result = [];
  for (let i = 0; i < inputs.length; i++) {
    for (let k = i + 1; k < inputs.length; k++) {
      result.push({ chapters: [chapterStarts[i], chapterStarts[k]],
        ...compare(inputs[i], inputs[k]) });
    }
  }
  return result;
}
const original = crossChapter(chapters);
const originalLong = original.filter(x => x.n >= 729);
assert.equal(original.length, 36);
assert.equal(originalLong.length, 28);
assert(original.every(x => x.llr < 0));

/** @param {number} key */
function seedStream(key) {
  let state = key >>> 0;
  const output = [];
  for (let i = 0; i < 3008; i++) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    output.push((state >>> 0) % 29);
  }
  return output;
}
/** @param {number[]} sequence @param {number[]} key */
function addKey(sequence, key) {
  return sequence.map((symbol, i) => mod(symbol + key[i]));
}
/** @param {number[]} cipher @param {number[]} key */
function removeKey(cipher, key) {
  return cipher.map((symbol, i) => mod(symbol - key[i]));
}
const pad = seedStream(0x33012014);
function nativePlant(relative, first) {
  const source = gp(read(relative));
  const plain = chapters.map((chapter, i) => {
    const at = first + i * 4000;
    assert(at + chapter.length <= source.length);
    return source.slice(at, at + chapter.length);
  });
  const sharedCipher = plain.map(sequence => addKey(sequence, pad));
  assert.deepEqual(sharedCipher.map(sequence => removeKey(sequence, pad)), plain);
  const distinctPads = chapters.map((chapter, i) => seedStream(0x33012014 + 1000 + i));
  const wrongCipher = plain.map((sequence, i) => addKey(sequence, distinctPads[i]));
  const shared = crossChapter(sharedCipher);
  const unrelated = crossChapter(wrongCipher);
  return {
    source: relative,
    nativeRunes: source.length,
    sharedPositivePairs: shared.filter(x => x.llr > 0).length,
    sharedPositiveLongPairs: shared.filter(x => x.n >= 729 && x.llr > 0).length,
    sharedPositiveMinLongLLR: Math.min(...shared.filter(x => x.n >= 729).map(x => x.llr)),
    unrelatedPositivePairs: unrelated.filter(x => x.llr > 0).length,
    sharedPairP15P40: shared.find(x => x.chapters[0] === 15 && x.chapters[1] === 40),
    unrelatedPairP15P40: unrelated.find(x => x.chapters[0] === 15 && x.chapters[1] === 40)
  };
}
const shakespeare = nativePlant('resources/control/shakespeare_first300k.txt', 14000);
const emerson = nativePlant('resources/control/emerson_essays_2944.txt', 16000);
assert.equal(shakespeare.sharedPositiveLongPairs, originalLong.length);
assert.equal(emerson.sharedPositiveLongPairs, originalLong.length);
const strongest = [...original].sort((a, b) => b.llrPerRune - a.llrPerRune);

console.log(JSON.stringify({
  test: 'source-visible nine-chapter zero-clock additive many-time pad; GP rune position advances key even through F',
  sourceNativeP57ProseExact: true,
  originalChapters: chapterStarts.map((p, i) => ({ firstPhysicalPage: p, runes: chapterSizes[i] })),
  unknownCipherRunes: unknown.reduce((n, page) => n + page.indices.length, 0),
  trainingNativeGibranRunes: training.length,
  trainedDeltaZeroMass: differenceProbabilities[0],
  nativeSourcePositive: [shakespeare, emerson],
  originalAll36: {
    pairs: original.length,
    positiveLogBayesPairs: original.filter(x => x.llr > 0).length,
    positiveLongPairs: originalLong.filter(x => x.llr > 0).length,
    originalLongPairCount: originalLong.length,
    closestToPositive: strongest.slice(0, 8),
    greatestRawUniformChi2: [...original].sort((a, b) => b.chi2 - a.chi2).slice(0, 3)
  },
  decision: 'No source-native English additive keystream cancellation at any original nine-chapter red-heading zero-phase alignment. Only fixed clock shared pad tested. No unknown plaintext.'
}, null, 2));
