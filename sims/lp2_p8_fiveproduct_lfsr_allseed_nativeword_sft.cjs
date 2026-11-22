'use strict';

/**
 * Original p8 long-word all-secret recovery gate for p7 source-defined LFSR.
 * Single-file read-only Windows Node22 SFT:
 *   node sims/lp2_p8_fiveproduct_lfsr_allseed_nativeword_sft.cjs
 *
 * Direct source hypothesis:
 * K[i] = 11*K[i-1]+26*K[i-2]+8*K[i-3]+15*K[i-4]+2*K[i-5] mod29.
 * C[i] = P[i] +/- K[i] mod29.
 * The first five key symbols are completely unrestricted.
 * For any printed long word, candidate P forces a local key sequence.
 * Its order-5 recurrence must hold for every position after its fifth;
 * the necessary condition is independent of all 29^5 secret seeds,
 * key start, page reset and additive sign.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} name */
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const alphabet = corpus.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
const runeMap = new Map(corpus.runes.map((r, i) => [r, i]));
const page7 = corpus.pages[7].indices;
const page8 = corpus.pages[8].indices;
const red7 = ink.pages.find(p => p.page === 7).red_spans[0];
const red8 = ink.pages.find(p => p.page === 8).red_spans[0];

assert.deepEqual([red7.start, red7.length], [194, 14]);
assert.deepEqual([red8.start, red8.length], [0, 12]);
const sourceLengths = [2, 4, 3, 2, 3];
let cursor = red7.start;
const weights = sourceLengths.map(n => {
  const product = page7.slice(cursor, cursor + n).reduce((a, b) => (a * b) % 29, 1);
  cursor += n;
  return product;
});
assert.deepEqual(weights, [11, 26, 8, 15, 2]);
assert.equal(cursor, red7.start + red7.length);

/**
 * Map native word spellings to the attested LP1/LP2 GP29 register.
 * ING is a single NG rune; IO is represented by the IA rune.
 * @param {string} input
 * @returns {number[]}
 */
function encode(input) {
  const s = input.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const output = [];
  for (let i = 0; i < s.length;) {
    if (s.startsWith('ING', i)) {
      output.push(21);
      i += 3;
    } else if (s.startsWith('IO', i)) {
      output.push(27);
      i += 2;
    } else {
      const found = alphabet.find(t => s.startsWith(t.s, i));
      assert.ok(found, 'Unknown GP token in ' + input);
      output.push(found.i);
      i += found.s.length;
    }
  }
  return output;
}

/** @type {Map<number, Map<string,{word:string,digits:number[],freq:number}>>} */
const lexicon = new Map();
let sourceWordCount = 0;
for (const line of read('resources/control/english_wordfreq_textblob.txt').split(/\r?\n/)) {
  const match = /^([a-z]+) (\d+)$/.exec(line);
  if (!match) continue;
  const digits = encode(match[1]);
  const key = digits.join(',');
  const length = digits.length;
  if (!lexicon.has(length)) lexicon.set(length, new Map());
  const bucket = lexicon.get(length);
  const incumbent = bucket.get(key);
  const freq = Number(match[2]);
  if (!incumbent || incumbent.freq < freq) bucket.set(key, {
    word:match[1],digits,freq
  });
  sourceWordCount++;
}
assert.equal(sourceWordCount, 29157);
assert.deepEqual([lexicon.get(2).size,lexicon.get(3).size,
  lexicon.get(9).size,lexicon.get(10).size,lexicon.get(12).size],
[189, 753, 3397, 2388, 767]);

// P8 contains two red heading words, then 48 complete black words and
// one final one-rune black fragment which continues into p9. The precise
// page-local 49-fragment register is tested only as such. The six long
// black words examined below are all complete and wholly inside p8.
const rawP8 = read('resources/lp2-transcription.txt').split('%')[8];
const pageWords = rawP8.split(/[-.&$§]/u)
  .map(part => [...part].filter(r => runeMap.has(r)).map(r => runeMap.get(r)))
  .filter(v => v.length);
assert.equal(pageWords.length, 51);
assert.deepEqual(pageWords.slice(0, 2).map(w => w.length), [4, 8]);
const bodyWords = pageWords.slice(2);
assert.equal(bodyWords.length, 49);
const originalTranscription = read('resources/lp2-transcription.txt').split('%');
const p9FirstRuneFragment = originalTranscription[9].split(/[-.&$§]/u)
  .map(part => [...part].filter(r => runeMap.has(r)).map(r => runeMap.get(r)))
  .find(v => v.length);
assert.equal(bodyWords.at(-1).length, 1);
assert.equal(p9FirstRuneFragment.length, 5);
assert.equal(bodyWords.at(-1).concat(p9FirstRuneFragment).length, 6);
assert.ok(rawP8.trimEnd().endsWith('/'), 'P8 final fragment has no word stop');
const body = bodyWords.flat();
assert.deepEqual(body, page8.slice(red8.length));
assert.equal(body.length, 243);
assert.deepEqual(bodyWords.slice(0, 4).map(w => w.length), [3, 2, 3, 9]);

/** @param {number} x */
const mod = x => ((x % 29) + 29) % 29;
/** @param {number[]} key */
function nextKey(key) {
  const n = key.length;
  return mod(weights.reduce((a, w, j) => a + w * key[n - 1 - j], 0));
}
/**
 * A candidate word P is feasible at an arbitrary offset under ANY
 * five-state GP29 seed iff its local C-P sequence obeys the recurrence.
 * The overall sign of the residual is irrelevant (homogeneous recurrence).
 * @param {number[]} cipher
 * @param {number[]} plain
 */
function wordCompatible(cipher, plain) {
  assert.equal(cipher.length, plain.length);
  const k = cipher.map((v, i) => mod(v - plain[i]));
  for (let j = 5; j < k.length; j++) {
    const expected = mod(weights.reduce((a, w, t) => a + w * k[j - 1 - t], 0));
    if (k[j] !== expected) return false;
  }
  return true;
}
const longWords = [];
let offset = 0;
for (let wordIndex = 0; wordIndex < bodyWords.length; wordIndex++) {
  const ciphertext = bodyWords[wordIndex];
  if (ciphertext.length >= 9) {
    const bucket = lexicon.get(ciphertext.length);
    assert.ok(bucket);
    const compatible = [];
    for (const candidate of bucket.values()) {
      if (wordCompatible(ciphertext, candidate.digits)) compatible.push(candidate.word);
    }
    longWords.push({
      wordIndex,bodyRuneOffset:offset,length:ciphertext.length,
      lexicalCandidates:bucket.size,matchingLexicalCandidates:compatible
    });
  }
  offset += ciphertext.length;
}
assert.equal(offset, 243);
assert.equal(longWords.length, 6);
assert.deepEqual(longWords.map(w => [w.wordIndex,w.bodyRuneOffset,w.length]),
  [[3,8,9],[27,112,10],[29,128,12],[35,160,10],[37,174,9],[45,221,9]]);
assert.ok(longWords.every(w => w.matchingLexicalCandidates.length === 0));

// An independent, source-preserving Latin reference word register tests
// the same all-secret original sites without retrofitting English spelling.
/** @type {Map<number, Map<string,number[]>>} */
const latin = new Map();
let latinPrintedWords = 0;
for (const s of read('resources/control/latin-vulgate-gp-wholewords.txt').split(/\r?\n/)) {
  if (!/^[0-9A-S]+$/.test(s)) continue;
  const digits = [...s].map(ch => parseInt(ch, 36));
  if (!latin.has(digits.length)) latin.set(digits.length, new Map());
  latin.get(digits.length).set(s, digits);
  latinPrintedWords++;
}
assert.equal(latinPrintedWords, 39835);
assert.deepEqual([latin.get(9).size,latin.get(10).size,latin.get(12).size],
  [935,728,297]);
const latinLongWordResults = longWords.map(({wordIndex,bodyRuneOffset,length}) => {
  const sourceCipher = bodyWords[wordIndex];
  const matches = [];
  for (const [literal, candidate] of latin.get(length).entries()) {
    if (wordCompatible(sourceCipher, candidate)) matches.push(literal);
  }
  return {wordIndex,bodyRuneOffset,length,
    independentLatinCandidates:latin.get(length).size,
    compatibleLatinCandidates:matches};
});
assert.equal(latinLongWordResults.length, 6);
assert.ok(latinLongWordResults.every(w => w.compatibleLatinCandidates.length === 0));


// Actual secret-state recovery, rather than fitting keys to scores.
// The first two original black words total exactly 5 GP runes. Every
// dictionary-native 3+2 GP rune pair uniquely fixes an initial five-pad
// under either source direction. Decode third 3-rune and fourth 9-rune
// words, and require those output words to belong to independent lexicon.
/**
 * @param {number[]} ciphertext
 * @param {number[]} wordLengths
 * @param {number} sign 1 or -1
 */
function recover(ciphertext, wordLengths, sign) {
  assert.ok(sign === 1 || sign === -1);
  let initialPairs = 0;
  let thirdMatches = 0;
  let fourthMatches = 0;
  /** @type {string[][]} */
  const samples = [];
  for (const a of lexicon.get(3).values()) {
    for (const b of lexicon.get(2).values()) {
      initialPairs++;
      const firstFive = a.digits.concat(b.digits);
      const key = firstFive.map((p, i) => mod(sign * (ciphertext[i] - p)));
      let p = 5;
      let matched = 0;
      const decodedWords = [a.word,b.word];
      for (let index = 2; index <= 3; index++) {
        const output = [];
        for (let j = 0; j < wordLengths[index]; j++) {
          const value = nextKey(key);
          key.push(value);
          output.push(mod(ciphertext[p++] - sign * value));
        }
        const candidate = lexicon.get(output.length).get(output.join(','));
        if (!candidate) break;
        matched++;
        decodedWords.push(candidate.word);
      }
      if (matched >= 1) thirdMatches++;
      if (matched === 2) {
        fourthMatches++;
        if (samples.length < 4) samples.push(decodedWords);
      }
    }
  }
  return {sign,initialPairs,thirdMatches,fourthMatches,samples};
}
const wordLengths = bodyWords.map(w => w.length);
const original = [recover(body,wordLengths,1),recover(body,wordLengths,-1)];
assert.deepEqual(original.map(r => [r.initialPairs,r.thirdMatches,r.fourthMatches]),
  [[142317,4453,0],[142317,4453,0]]);

// Independently planted native GP words in EXACT authentic page-local
// fragment lengths (48 whole black words plus one continued fragment),
// encrypted with an arbitrary unknown 5-symbol key state. Recovery must
// find the planted seed from both original word lengths and original driver.
const plantedWords = wordLengths.map(len =>
  [...lexicon.get(len).values()].sort((a, b) => b.freq - a.freq)[0].digits);
const plantedPlaintext = plantedWords.flat();
assert.equal(plantedPlaintext.length, 243);
const plantedSeed = [7,11,3,23,5];
const plantResults = [];
for (const sign of [1,-1]) {
  const key = plantedSeed.slice();
  for (let i = 5; i < 243; i++) key.push(nextKey(key));
  const cipher = plantedPlaintext.map((p, i) => mod(p + sign * key[i]));
  const plantedRecovery = cipher.map((c, i) => mod(c - sign * key[i]));
  assert.deepEqual(plantedRecovery,plantedPlaintext);
  let p=0;
  for (const word of plantedWords) {
    assert.equal(wordCompatible(cipher.slice(p,p+word.length),word),true);
    p+=word.length;
  }
  const recovered = recover(cipher,wordLengths,sign);
  assert.ok(recovered.fourthMatches >= 1);
  plantResults.push({sign,recoveredPairs:recovered.fourthMatches,
    exactKnownSeedRoundtrip:'243/243'});
}

// Chapter scope: preserve word continuation over every physical page seam.
// This is an independent all-secret test over the seven-page p8..14 group,
// where the five red products are a plausible heading-derived key.
// Only actual complete printed words wholly contained in a page are
// counted. The 1-rune page8 tail is not a standalone lexical word.
const chapterSource = read('resources/lp2-transcription.txt');
/** @type {{startPage:number,endPage:number,digits:number[]}[]} */
const joinedWords = [];
let active = [];
let currentPage = 0;
let startPage = 0;
function finishWord() {
  if (active.length) joinedWords.push({
    startPage, endPage:currentPage, digits:active
  });
  active = [];
}
for (const ch of chapterSource) {
  if (ch === '%') currentPage++;
  else if (runeMap.has(ch)) {
    if (active.length === 0) startPage = currentPage;
    active.push(runeMap.get(ch));
  } else if (ch === '/' || /\s/u.test(ch)) {
    // Line wraps preserve the current word.
  } else {
    finishWord();
  }
}
finishWord();
const chapterWords = joinedWords.filter(w => w.startPage >= 8
  && w.startPage <= 14 && w.endPage === w.startPage);
const chapterLong = [];
for (const item of chapterWords) {
  const C = item.digits;
  if (C.length < 9) continue;
  const englishMatches = [];
  for (const candidate of lexicon.get(C.length).values()) {
    if (wordCompatible(C, candidate.digits)) englishMatches.push(candidate.word);
  }
  const latinMatches = [];
  for (const [token, digits] of latin.get(C.length).entries()) {
    if (wordCompatible(C, digits)) latinMatches.push(token);
  }
  chapterLong.push({page:item.startPage, length:C.length,
    originalContainsF:C.includes(0),englishMatches,latinMatches});
}
assert.equal(chapterWords.length, 380);
assert.equal(chapterLong.length, 29);
assert.deepEqual(Array.from({length:7}, (_, i) =>
  chapterLong.filter(w => w.page === i+8).length),[6,3,2,9,5,3,1]);
assert.equal(chapterLong.filter(w => !w.originalContainsF).length, 18);
assert.ok(chapterLong.every(w =>
  w.englishMatches.length === 0 && w.latinMatches.length === 0));

console.log(JSON.stringify({
  statement:'p8 original six long words incompatible with any fifth-order p7-product LFSR seed under source-native English GP rune words',
  input:{originalBlackRunes:243,originalBlackWords:49,
    nativeDictionaryWords:sourceWordCount,originalP8CompleteBlackWords:48,
    p8ToP9ContinuedWordLength:6},
  originalLongWords:longWords,
  sourceChapterP8ThroughP14LongWords:chapterLong,
  independentLatinLongWords:latinLongWordResults,
  sourceFirst5KeyProductWeights:weights,
  originalFirstFourWordRecovery:original,
  plantedNativeWordControls:plantResults,
  limitations:'Strict source p7 homogeneous fifth-order additive GP29 recurrence; exact printed words and finite source-native dictionary. Other generators, changed word boundaries, exceptional clocking and non-native registers untested.',
  newUnknownPlaintext:false
},null,2));
