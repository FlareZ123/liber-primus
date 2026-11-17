#!/usr/bin/env node
'use strict';

// Reproduce the narrow #1410 test: a clear monumental red initial seeds
// the starting rank of the solved p56 prime-totient stream. The stream
// carries across page/word wraps and resets only at the next giant initial.
// Run from any directory: node sims/lp2_red_initial_prime_totient_seed_gate.cjs

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
process.chdir(ROOT);

const {
  original,
  decode,
  encrypt,
  encodeWord,
  printedWords,
  concat
} = require('./lp2_ftransparent_original_lexical_viterbi_sft.cjs');

const read = (relative) => fs.readFileSync(path.join(ROOT, relative), 'utf8');
const sha256 = (relative) => crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(ROOT, relative)))
  .digest('hex');
const mod29 = (n) => ((n % 29) + 29) % 29;

function firstPrimes(count) {
  const out = [];
  for (let candidate = 2; out.length < count; candidate += 1) {
    let prime = true;
    for (let divisor = 2; divisor * divisor <= candidate; divisor += 1) {
      if (candidate % divisor === 0) {
        prime = false;
        break;
      }
    }
    if (prime) out.push(candidate);
  }
  return out;
}

const primeStream = firstPrimes(2000);
const runeIndex = new Map(original.runes.map((rune, index) => [rune, index]));

// Same page-carry parser used by lp2-32-pagecarry-p56-wordprime-reset-gate:
// '%' page markers, slash wraps and whitespace do not terminate a word.
function parseCarryWords(source) {
  const words = [];
  const wordStarts = [];
  const symbols = [];
  let current = [];
  let globalOffset = 0;

  for (const character of source) {
    if (runeIndex.has(character)) {
      if (current.length === 0) wordStarts.push(globalOffset);
      const value = runeIndex.get(character);
      current.push(value);
      symbols.push(value);
      globalOffset += 1;
    } else if (character === '%' || character === '/' || /\s/u.test(character)) {
      // Physical page and line wraps are not cipher resets or word cuts.
    } else if (current.length > 0) {
      words.push(current);
      current = [];
    }
  }
  if (current.length > 0) words.push(current);
  return { words, wordStarts, symbols };
}

const seedData = [
  { page: 0, offset: 0, label: 'S' },
  { page: 3, offset: 0, label: 'L' },
  { page: 3, offset: 119, label: 'P' },
  { page: 6, offset: 71, label: 'A' },
  { page: 8, offset: 0, label: 'X' },
  { page: 15, offset: 9, label: 'L' },
  { page: 23, offset: 0, label: 'U' },
  { page: 27, offset: 0, label: 'M' },
  { page: 33, offset: 0, label: 'D' },
  { page: 33, offset: 91, label: 'NG' },
  { page: 39, offset: 119, label: 'IA' },
  { page: 40, offset: 0, label: 'F' },
  { page: 54, offset: 0, label: 'A' }
];

const sourceStream = read('resources/lp2-transcription.txt').split('%').slice(0, 55).join('%');
const parsed = parseCarryWords(sourceStream);
const originalUnknown = original.pages
  .filter((page) => page.page <= 55)
  .flatMap((page) => page.indices);

assert.equal(parsed.symbols.length, 12956, 'unexpected original LP2 rune count');
assert.deepEqual(parsed.symbols, originalUnknown, 'page-carry transcription differs from corpus');
assert.equal(parsed.words.length, 2896, 'unexpected printed word count');

const pageStarts = new Map();
let pageOffset = 0;
for (const page of original.pages.filter((entry) => entry.page <= 55)) {
  pageStarts.set(page.page, pageOffset);
  pageOffset += page.runic_count;
}
assert.equal(pageOffset, 12956);

const seeds = seedData.map((entry) => {
  const seed = original.translit.indexOf(entry.label);
  assert.notEqual(seed, -1, 'unknown GP29 seed label: ' + entry.label);
  const global = pageStarts.get(entry.page) + entry.offset;
  const wordIndex = parsed.wordStarts.indexOf(global);
  assert.notEqual(wordIndex, -1, 'red initial is not a printed word start: ' + entry.page + ':' + entry.offset);
  assert.equal(parsed.symbols[global], seed, 'red initial rune/index mismatch: ' + entry.page + ':' + entry.offset);
  return { ...entry, seed, global, wordIndex };
});

const segments = seeds.map((seed, index) => ({
  ...seed,
  words: parsed.words.slice(
    seed.wordIndex,
    seeds[index + 1] ? seeds[index + 1].wordIndex : parsed.words.length
  )
}));

// The tested rule: the oversized initial is clear and is the only seed.
// For following runes, K_j = phi(p_(s+j+1)) = p_(s+j+1)-1 mod 29,
// where s is the zero-based GP29 index and p_1=2. A ciphertext F may be
// literal plaintext F (no key advance) or encrypted; a non-F ciphertext
// may never decrypt to plaintext F under the p56 forward encoder.
function firstImpossible(segment) {
  let consumedStates = new Set([0]);
  let wordGlobal = segment.global;

  for (let wordIndex = 0; wordIndex < segment.words.length; wordIndex += 1) {
    const word = segment.words[wordIndex];
    const firstRuneOffset = wordIndex === 0 ? 1 : 0; // clear seed rune
    for (let runeOffset = firstRuneOffset; runeOffset < word.length; runeOffset += 1) {
      const cipher = word[runeOffset];
      const nextStates = new Set();

      for (const consumed of consumedStates) {
        if (cipher === 0) nextStates.add(consumed); // literal F bypass
        const prime = primeStream[segment.seed + consumed];
        const totient = prime - 1;
        const plaintext = mod29(cipher - totient);
        if (plaintext !== 0) nextStates.add(consumed + 1);
      }

      if (nextStates.size === 0) {
        const priorConsumed = [...consumedStates].sort((a, b) => a - b);
        return {
          feasible: false,
          page: segment.page,
          seedLabel: segment.label,
          seedIndex: segment.seed,
          segmentGlobalStart: segment.global,
          segmentWordCount: segment.words.length,
          segmentRuneCount: segment.words.reduce((sum, item) => sum + item.length, 0),
          wordIndex,
          wordStartGlobal: wordGlobal,
          runeOffsetInWord: runeOffset,
          globalRune: wordGlobal + runeOffset,
          cipherIndex: cipher,
          cipherToken: original.translit[cipher],
          priorConsumed,
          impossibleBranches: priorConsumed.map((consumed) => {
            const prime = primeStream[segment.seed + consumed];
            const totient = prime - 1;
            return {
              consumed,
              prime,
              totient,
              keyMod29: mod29(totient),
              plaintextIndex: mod29(cipher - totient)
            };
          })
        };
      }
      consumedStates = nextStates;
    }
    wordGlobal += word.length;
  }

  return {
    feasible: true,
    page: segment.page,
    seedLabel: segment.label,
    seedIndex: segment.seed,
    wordCount: segment.words.length,
    runeCount: segment.words.reduce((sum, item) => sum + item.length, 0),
    finalConsumedStates: [...consumedStates].sort((a, b) => a - b)
  };
}

// Positive source control: the repository's validated p56 lexical Viterbi
// must recover the exact solved 85-rune plaintext and literal-F position.
const p56Text = read('resources/liber-primus/lp2-transcription.txt');
const p56Segment = p56Text.split(/^\s*%\s*$/m)[55];
const p56Words = printedWords(p56Segment);
const p56Cipher = original.pages.find((page) => page.page === 56).indices;
assert.deepEqual(concat(p56Words), p56Cipher);
const p56Shift = (consumed) => primeStream[consumed] - 1;
const p56Result = decode(p56Words, p56Shift);
const p56Best = p56Result.states[0];
const p56Expected = concat(
  'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE'
    .split(' ')
    .map(encodeWord)
);
assert.deepEqual(p56Best.plain, p56Expected);
assert.deepEqual(p56Best.literals, [56]);
assert.deepEqual(encrypt(p56Best.plain, p56Shift), p56Cipher);

// Synthetic positive controls: same known no-F plaintext, different clear
// initials L and P. Correct seeds round-trip; wrong seeds do not.
const phraseWords = [
  'THE', 'PRIMES', 'ARE', 'SACRED',
  'THE', 'TOTIENT', 'IS', 'SACRED'
].map(encodeWord);
assert(phraseWords.every(Boolean));
const phrase = concat(phraseWords);
assert(!phrase.includes(0), 'synthetic phrase must contain no plaintext F');

function syntheticCipher(seed) {
  const shift = (consumed) => primeStream[seed + consumed] - 1;
  return [seed, ...encrypt(phrase, shift)];
}
function syntheticDecrypt(cipher, seed) {
  return [
    seed,
    ...cipher.slice(1).map((value, consumed) =>
      mod29(value - (primeStream[seed + consumed] - 1))
    )
  ];
}

const lSeed = original.translit.indexOf('L');
const pSeed = original.translit.indexOf('P');
const lPlain = [lSeed, ...phrase];
const pPlain = [pSeed, ...phrase];
const lCipher = syntheticCipher(lSeed);
const pCipher = syntheticCipher(pSeed);
assert.deepEqual(syntheticDecrypt(lCipher, lSeed), lPlain);
assert.deepEqual(syntheticDecrypt(pCipher, pSeed), pPlain);
assert.notDeepEqual(lCipher, pCipher);
assert.notDeepEqual(syntheticDecrypt(lCipher, pSeed), lPlain);
assert.notDeepEqual(syntheticDecrypt(pCipher, lSeed), pPlain);

const trainingSegments = segments.filter((segment) =>
  segment.page === 3 || segment.page === 6
);
assert.deepEqual(trainingSegments.map((segment) => segment.label), ['L', 'P', 'A']);
const trainingResults = trainingSegments.map(firstImpossible);
assert(trainingResults.every((result) => result.feasible === false));
assert.deepEqual(trainingResults.map((result) => result.globalRune), [740, 937, 1553]);

const report = {
  decision: 'REJECT: direct GP29-index to prime-rank offset for the p56 prime-totient stream',
  testedRule: {
    clearInitial: true,
    seed: 'zero-based GP29 index of the monumental red initial',
    key: 'K_j = phi(p_(seed+j+1)) = p_(seed+j+1)-1 mod 29',
    literalF: 'ciphertext F may be literal plaintext F and consume no key; key-consuming non-F ciphertext may not produce plaintext F',
    reset: 'only at the 13 monumental red initials; ordinary page, line and word carries do not reset'
  },
  sourceHashesSha256: {
    corpus: sha256('resources/liber-primus/lp2-corpus.json'),
    transcription: sha256('resources/lp2-transcription.txt'),
    p56Transcription: sha256('resources/liber-primus/lp2-transcription.txt'),
    initialAudit: sha256('im-results/lp2-round9-independent-unmapped-class-audit.md'),
    chapterMap: sha256('im-results/lp2-ninechapter-predecessor-sbox-original-capacity.md'),
    pageCarry: sha256('im-results/lp2-32-pagecarry-p56-wordprime-reset-gate.md'),
    p56Decoder: sha256('sims/lp2_ftransparent_original_lexical_viterbi_sft.cjs')
  },
  segmentation: {
    runeCount: parsed.symbols.length,
    wordCount: parsed.words.length,
    matchesOriginalCorpus: true,
    all13SeedsAtPrintedWordStarts: true,
    seeds: seeds.map(({ page, offset, label, seed, global }) => ({
      page, offset, label, gpIndex: seed, globalRune: global
    }))
  },
  p56PositiveControl: {
    exactPlaintext: true,
    runeCount: p56Best.plain.length,
    wordCount: p56Words.length,
    lexicalWords: p56Best.lexicalWords,
    literalFPositions: p56Best.literals,
    consumedKeySymbols: p56Best.consumed,
    scoreGapToRunnerUp: p56Best.score - p56Result.states[1].score,
    exactForwardReplay: true
  },
  syntheticPositiveControls: {
    phrase: 'THE PRIMES ARE SACRED THE TOTIENT IS SACRED',
    plaintextRuneCount: phrase.length,
    plaintextContainsF: false,
    L: {
      seed: lSeed,
      exactRoundTrip: true,
      wrongPSeedFails: true,
      ciphertextPrefix: lCipher.slice(0, 12)
    },
    P: {
      seed: pSeed,
      exactRoundTrip: true,
      wrongLSeedFails: true,
      ciphertextPrefix: pCipher.slice(0, 12)
    },
    differentSeedsProduceDifferentCiphertexts: true
  },
  trainingChapter: {
    pages: 'p3-p7',
    segments: trainingResults
  },
  holdouts: {
    pages: ['p40-p53', 'p54-p55'],
    decodedOrLanguageScored: false
  },
  conclusion: 'All three seed segments in the complete nonfloral p3-p7 training chapter have no legal F-transparent decryption path. This rejects only the tested direct GP-index-to-prime-rank offset rule; it does not establish that the red initials are decorative or exclude a different independently source-selected state update.'
};

process.stdout.write(JSON.stringify(report, null, 2) + '\n');
