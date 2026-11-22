'use strict';

/**
 * Director #2203: affine running-GP29 key cancellation as cross-chapter
 * repeated-plaintext island detector, with independently pinned GP-native
 * control words. Read-only deterministic single-file test. Node 22.
 *
 * From repo root: node sims/lp2_affine_runningkey_repeated_word_islands_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { parseLP2Words, physicalLP2Page } = require('./lp2_word_pages.cjs');

const ROOT = path.resolve(__dirname, '..');
/** @param {string} filename @returns {string} */
const read = (filename) => fs.readFileSync(path.join(ROOT, filename), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const source = parseLP2Words(read('resources/liber-primus/lp2-transcription.txt'));
assert.deepEqual([source.words.length, source.runeCount, source.crossPageWords],
  [2896, 12956, 32]);
const gp = corpus.translit;
const glyphToIndex = new Map(corpus.runes.map((letter, i) => [letter, i]));
assert.equal(glyphToIndex.size, 29);

/** @param {string} runes @returns {number[]} */
function runeIndices(runes) {
  return [...runes].map((rune) => {
    const index = glyphToIndex.get(rune);
    assert.notEqual(index, undefined);
    return index;
  });
}

/** @param {number} from @param {number} to @returns {number[][]} */
function originalWords(from, to) {
  return source.words
    .filter((word) => physicalLP2Page(word.startPage) >= from &&
      physicalLP2Page(word.endPage) <= to)
    .map((word) => runeIndices(word.runes));
}

const originalA = originalWords(16, 21);
const originalB = originalWords(34, 39);
const holdoutH = originalWords(40, 53);
assert.deepEqual([originalA.length, originalB.length, holdoutH.length], [372, 325, 718]);

/**
 * The complete invariant for C[j]=P[j]+a+b*(globalRunePosition+j) mod29:
 * D2 C[j] = C[j]-2*C[j-1]+C[j-2] mod29 = D2 P[j].
 * If two identical plaintext words are independently encrypted under arbitrary
 * (a,b) in different chapters, their D2 signatures must coincide.
 * @param {number[]} word
 * @returns {string}
 */
function affineFreeSignature(word) {
  const differences = [];
  for (let i = 2; i < word.length; i++) {
    differences.push((word[i] - 2 * word[i - 1] + word[i - 2] + 58) % 29);
  }
  return word.length + ':' + differences.join(',');
}

/**
 * Exact all-placements match; no dictionary or score is fitted to ciphertext.
 * @param {number[][]} wordsA
 * @param {number[][]} wordsB
 * @param {number} [minLen]
 * @returns {{first:number,second:number,len:number,signature:string}[]}
 */
function findMatches(wordsA, wordsB, minLen = 5) {
  const index = new Map();
  for (let i = 0; i < wordsA.length; i++) {
    const word = wordsA[i];
    if (word.length < minLen) continue;
    const key = affineFreeSignature(word);
    if (!index.has(key)) index.set(key, []);
    index.get(key).push(i);
  }
  const results = [];
  for (let j = 0; j < wordsB.length; j++) {
    const word = wordsB[j];
    if (word.length < minLen) continue;
    const signature = affineFreeSignature(word);
    for (const i of index.get(signature) || []) {
      results.push({ first: i, second: j, len: word.length, signature });
    }
  }
  return results;
}

/** @param {number[][]} words @param {number} a @param {number} b @returns {number[][]} */
function encryptAffine(words, a, b) {
  let runicPosition = 0;
  return words.map((word) => word.map((rune) => {
    const result = (rune + a + b * runicPosition) % 29;
    runicPosition++;
    return result;
  }));
}

/** @param {string} token @returns {number[]} */
function nativeGpWord(token) {
  const normalized = token.toUpperCase().replace(/Q/g, 'CW').replace(/K/g, 'C')
    .replace(/V/g, 'U').replace(/Z/g, 'S').replace(/ING/g, 'NG');
  const output = [];
  for (let i = 0; i < normalized.length;) {
    let found = false;
    for (const n of [3, 2, 1]) {
      const gpIndex = gp.indexOf(normalized.slice(i, i + n));
      if (gpIndex !== -1) {
        output.push(gpIndex);
        i += n;
        found = true;
        break;
      }
    }
    assert.ok(found, 'Unmapped GP English token '+token);
  }
  return output;
}

/** @param {string} str @returns {number[][]} */
function gpEnglish(str) {
  return (str.toUpperCase().match(/[A-Z]+/g) || []).map(nativeGpWord);
}

const gibranRaw = read('resources/control/gibran_prophet_58585.txt');
const sourceStart = gibranRaw.indexOf('*** START');
const sourceEnd = gibranRaw.indexOf('*** END');
assert.ok(sourceStart !== -1 && sourceEnd > sourceStart + 10000);
const gibran = gpEnglish(gibranRaw.slice(sourceStart + 20, sourceEnd));
const shakespeare = gpEnglish(read('resources/control/shakespeare_first300k.txt'));
assert.equal(shakespeare.length, 55407);
assert.ok(gibran.length >= 12500 && gibran.length <= 13000);

const originalAB = findMatches(originalA, originalB);
const originalAH = findMatches(originalA, holdoutH);
const originalBH = findMatches(originalB, holdoutH);
assert.equal(originalAB.length, 0);
assert.equal(originalAH.length, 1);
assert.equal(originalBH.length, 0);
assert.equal(originalAH[0].len, 5);
console.log('ORIGINAL: p16-21/p34-39 372x325 whole-words length>=5: 0 affine-invariant matches.');
console.log('HOLDOUT: p40-53 718 original words have only 1 A-to-H matching signature, 0 B-to-H; the single match is 5 runes.');

// Demonstrate actual recovery of repeated plaintext detection from differently
// keyed complete native-GP words, including different affine slopes per chapter.
const clearA = gibran.slice(2000, 2372);
const clearB = gibran.slice(8000, 8325);
const clearMatches = findMatches(clearA, clearB);
assert.ok(clearMatches.length >= 1);
const encryptedA = encryptAffine(clearA, 11, 7);
const encryptedB = encryptAffine(clearB, 5, 13);
assert.deepEqual(findMatches(encryptedA, encryptedB), clearMatches);
for (const match of clearMatches) {
  assert.deepEqual(clearA[match.first], clearB[match.second]);
}
console.log('POSITIVE: ' + clearMatches.length +
  ' actual repeated source-native Gibran GP29 word pairs recovered from two secret independent affine streams.');
// Another independent original solved source encodes 95/95 actual p57 runes.
const clear57 = corpus.pages.find((page) => page.page === 57).indices;
const wrapped57 = encryptAffine([clear57], 11, 7)[0];
assert.deepEqual(wrapped57.map((value, i) => (value - 11 - 7 * i % 29 + 58) % 29), clear57);
console.log('POSITIVE: 95/95 actual solved p57 GP29 runes invert exactly under the frozen affine running cipher.');

/** @param {number[][]} words @param {number} seed @returns {number[]} */
function matchedWindows(words, seed) {
  let state = seed >>> 0;
  function random() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  }
  const out = [];
  for (let run = 0; run < 400; run++) {
    const a = Math.floor(random() * (words.length - 400));
    let b = Math.floor(random() * (words.length - 400));
    if (Math.abs(a - b) < 600) b = (b + 1900) % (words.length - 400);
    out.push(findMatches(words.slice(a, a + originalA.length),
      words.slice(b, b + originalB.length)).length);
  }
  return out;
}

const controlGibran = matchedWindows(gibran, 0x33013381);
const controlShakespeare = matchedWindows(shakespeare, 0x33013381);
/** @param {number[]} values @returns {{min:number,median:number,max:number,zero:number,p:number}} */
function summary(values) {
  const ordered = values.slice().sort((a,b) => a - b);
  const zero = values.filter((x) => x === 0).length;
  return { min: ordered[0], median: ordered[199], max: ordered.at(-1),
    zero, conservativePlusOneTail: (zero + 1) / (values.length + 1) };
}
const statsG = summary(controlGibran);
const statsS = summary(controlShakespeare);
assert.deepEqual(statsG, {
  min: 1, median: 20, max: 124, zero: 0,
  conservativePlusOneTail: 1 / 401
});
assert.deepEqual(statsS, {
  min: 0, median: 14, max: 283, zero: 1,
  conservativePlusOneTail: 2 / 401
});
console.log(JSON.stringify({
  original: { A: originalA.length, B: originalB.length, H: holdoutH.length,
    AB: originalAB.length, AH: originalAH.length, BH: originalBH.length,
    longestAH: originalAH[0].len },
  control: { Gibran: statsG, Shakespeare: statsS },
  positive: { sourcePlainRepeated: clearMatches.length,
    independentlyEncryptedRepeated: findMatches(encryptedA, encryptedB).length },
  unknownPlaintextRecovered: 0,
  conclusion: 'Affine-running-key concealment does not explain ordinary repeated source-English words on original 372/325 word chapter pair'
}, null, 2));
