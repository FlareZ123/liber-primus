'use strict';

/**
 * Original-source lexical inverse for authentic Cicada plaintext-F transparency.
 * Recovers the entire 515-rune LP1 WELCOME/DIVINITY passage and the complete
 * 85-rune LP2 p56 from the known key and ciphertext, WITHOUT a skip mask.
 *
 * The word lexicon is the pre-existing 2026-11-10 TextBlob frequency fixture.
 * Dictionary, word segmentation and scoring are source-fixed and never trained
 * on any solved page's F decisions. English-only hypothesis: printed word
 * boundaries are preserved by encryption.
 *
 * Run: node sims/lp2_ftransparent_original_lexical_viterbi_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} file @returns {string} */
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const original = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const printedLP2 = read('resources/liber-primus/lp2-transcription.txt');
const printedLP1 = read('resources/transcriptions/lp1_wulfic_canonical.txt');
const spellingData = read('resources/control/english_wordfreq_textblob.txt');
const runeMap = new Map(original.runes.map((rune, index) => [rune, index]));
const tokens = original.translit.map((token, i) => ({ token, i }))
  .sort((a, b) => b.token.length - a.token.length);

/** @param {number} n @returns {number} */
const mod29 = (n) => ((n % 29) + 29) % 29;

/**
 * Encode English lexical evidence to the native GP29 inventory. Ordinary
 * Cicada orthography equates QU/CW, V/U, K/C, Z/S and groups ING, IO.
 * @param {string} word
 * @returns {number[]|null}
 */
function encodeWord(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, 'CW').replace(/V/g, 'U').replace(/K/g, 'C')
    .replace(/Z/g, 'S').replace(/ING/g, 'NG').replace(/IO/g, 'IA');
  /** @type {number[]} */
  const result = [];
  for (let i = 0; i < normalized.length;) {
    const found = tokens.find(({ token }) => normalized.startsWith(token, i));
    if (!found) return null;
    result.push(found.i);
    i += found.token.length;
  }
  return result;
}

/**
 * Fixed external, non-LP English word counts, indexed by runic spelling.
 * @returns {Map<string,number>}
 */
function makeLexicon() {
  const result = new Map();
  for (const line of spellingData.match(/^[a-z]+\s+\d+$/gm) || []) {
    const [word, count] = line.split(/\s+/u);
    const encoded = encodeWord(word);
    if (!encoded) continue;
    const key = encoded.join(',');
    result.set(key, (result.get(key) || 0) + Number(count));
  }
  return result;
}
const lexicon = makeLexicon();
assert.equal(lexicon.size, 29058);

/**
 * Original -/. form printed word boundaries. / followed by line break is
 * only typesetting: never split a source word at the visual line wrap.
 * @param {string} segment
 * @returns {number[][]}
 */
function printedWords(segment) {
  return (segment.replace(/\/\s*/gu, '').match(/[\u16A0-\u16FF]+/gu) || [])
    .map((word) => [...word].map((rune) => {
      const index = runeMap.get(rune);
      assert.notEqual(index, undefined);
      return index;
    }));
}

/**
 * Exact source-specified plaintext-F key-state inverse, with a scored
 * word-level Viterbi. State at a word boundary = number of key symbols
 * consumed. For ciphertext F, either emit literal plaintext F without
 * consuming, or subtract a key value; other glyphs must consume. A
 * key-consuming step yielding plaintext F is forbidden by the historic
 * forward encoder.
 *
 * Dictionary + ln(1+frequency) score is fixed for all corpora; unsupported
 * whole words receive -8, never rejection. Lexical prior is data-derived,
 * not a hidden plaintext crib.
 *
 * @param {number[][]} words
 * @param {(consumed:number)=>number} shift
 * @returns {{states:Array<{score:number,plain:number[],literals:number[],consumed:number,lexicalWords:number,unseenWords:string[]}>,stateCounts:number[]}}
 */
function decode(words, shift) {
  /** @type {Map<number,{score:number,plain:number[],literals:number[],lexicalWords:number,unseenWords:string[]}>} */
  let states = new Map([[0, {
    score: 0, plain: [], literals: [], lexicalWords: 0, unseenWords: []
  }]]);
  const stateCounts = [];
  let globalStart = 0;
  for (const [wordIndex, word] of words.entries()) {
    /** @type {typeof states} */
    const next = new Map();
    for (const [consumed, previous] of states.entries()) {
      let branches = [{ consumed, plain: /** @type {number[]} */ ([]),
        literals: /** @type {number[]} */ ([]) }];
      for (const ciphertext of word) {
        /** @type {typeof branches} */
        const expanded = [];
        for (const branch of branches) {
          if (ciphertext === 0) {
            expanded.push({
              consumed: branch.consumed,
              plain: branch.plain.concat([0]),
              literals: branch.literals.concat([globalStart + branch.plain.length])
            });
          }
          const plain = mod29(ciphertext - shift(branch.consumed));
          if (plain !== 0) {
            expanded.push({
              consumed: branch.consumed + 1,
              plain: branch.plain.concat([plain]),
              literals: branch.literals
            });
          }
        }
        branches = expanded;
      }
      for (const branch of branches) {
        const frequency = lexicon.get(branch.plain.join(',')) || 0;
        const score = previous.score + (frequency ? Math.log1p(frequency) : -8);
        const old = next.get(branch.consumed);
        if (!old || score > old.score) {
          const wordText = branch.plain.map((i) => original.translit[i]).join('');
          next.set(branch.consumed, {
            score,
            plain: previous.plain.concat(branch.plain),
            literals: previous.literals.concat(branch.literals),
            lexicalWords: previous.lexicalWords + Number(frequency > 0),
            unseenWords: frequency ? previous.unseenWords
              : previous.unseenWords.concat([wordIndex + ':' + wordText])
          });
        }
      }
    }
    states = next;
    assert.ok(states.size, 'No valid plaintext-F inverse at original word ' + wordIndex);
    stateCounts.push(states.size);
    globalStart += word.length;
  }
  return {
    states: [...states.entries()].map(([consumed, state]) =>
      ({ ...state, consumed })).sort((a, b) => b.score - a.score),
    stateCounts
  };
}

/**
 * Authenticated encryption function, used ONLY as a backward check on the
 * blind lexical decryption. Plaintext F must be literal and not consume.
 * @param {number[]} plain
 * @param {(consumed:number)=>number} shift
 * @returns {number[]}
 */
function encrypt(plain, shift) {
  let k = 0;
  return plain.map((letter) => letter === 0 ? 0 : mod29(letter + shift(k++)));
}
/** @param {number[][]} words @returns {number[]} */
const concat = (words) => words.flat();
/** @param {number[]} values @returns {number[]} */
const fPositions = (values) => values.flatMap((value, i) => value === 0 ? [i] : []);

/** @param {number} count @returns {number[]} */
function primes(count) {
  const result = [];
  for (let n = 2; result.length < count; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) { prime = false; break; }
    }
    if (prime) result.push(n);
  }
  return result;
}

/* LP2 p56 independent solved trial: prime-totient key, original 73.jpg. */
const p56Words = printedWords(printedLP2.split(/^\s*%\s*$/m)[55]);
const p56Cipher = original.pages.find((page) => page.page === 56).indices;
assert.deepEqual(concat(p56Words), p56Cipher);
assert.equal(p56Words.length, 25);
const totients = primes(90).map((p) => p - 1);
const p56Key = (k) => totients[k];
const p56Solve = decode(p56Words, p56Key);
const p56Best = p56Solve.states[0];
const authenticP56Plain = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE'
  .split(' ').flatMap((word) => {
    const values = encodeWord(word);
    assert.ok(values);
    return values;
  });
assert.equal(authenticP56Plain.length, 85);
assert.deepEqual(p56Best.plain, authenticP56Plain);
assert.deepEqual(p56Best.literals, [56]);
assert.deepEqual(encrypt(p56Best.plain, p56Key), p56Cipher);
assert.equal(p56Best.lexicalWords, 24);
assert.equal(p56Best.consumed, 84);
assert.equal(p56Solve.states.length, 5);
assert.ok(p56Best.score - p56Solve.states[1].score > 50);

/* Independent LP1 WELCOME/DIVINITY 515 original runes. */
const welcomeWords = printedWords(printedLP1.split('%').slice(1, 3).join('%'));
const welcomeCipher = concat(welcomeWords);
const divinity = [23, 10, 1, 10, 9, 10, 16, 26];
const welcomeKey = (k) => divinity[k % divinity.length];
assert.equal(welcomeCipher.length, 515);
assert.equal(welcomeWords.length, 124);
const welcomeSolve = decode(welcomeWords, welcomeKey);
const welcomeBest = welcomeSolve.states[0];
const historicallySolvedWelcomeLiterals = [
  48, 74, 84, 132, 159, 160, 250, 421, 443, 465, 514
];
assert.deepEqual(welcomeBest.literals, historicallySolvedWelcomeLiterals);
assert.deepEqual(encrypt(welcomeBest.plain, welcomeKey), welcomeCipher);
assert.equal(welcomeBest.lexicalWords, 121);
assert.equal(welcomeBest.consumed, 504);
const historicalSet = new Set(historicallySolvedWelcomeLiterals);
let knownClock = 0;
const independentWelcome = welcomeCipher.map((c, i) => historicalSet.has(i)
  ? 0 : mod29(c - welcomeKey(knownClock++)));
assert.deepEqual(welcomeBest.plain, independentWelcome);
assert.equal(welcomeSolve.states.length, 8);
assert.ok(welcomeBest.score > welcomeSolve.states[1].score);

/*
 * LP1 independent koan, original first 110 runes/30 printed words.
 * Separate genuine 13-rune key and two previously solved literal Fs.
 * This is NOT used for choosing the dictionary score or p56/welcome masks.
 */
const koanWords = printedWords(printedLP1.split('$')[5]).slice(0, 30);
const koanCipher = concat(koanWords);
assert.equal(koanCipher.length, 110);
const koanKey = [0, 10, 4, 0, 1, 19, 0, 18, 4, 18, 9, 0, 18];
const koanShift = (k) => koanKey[k % koanKey.length];
const knownKoanF = [49, 58];
const koanSet = new Set(knownKoanF);
let koanClock = 0;
const independentlySolvedKoan = koanCipher.map((c, i) =>
  koanSet.has(i) ? 0 : mod29(c - koanShift(koanClock++)));
assert.deepEqual(encrypt(independentlySolvedKoan, koanShift), koanCipher);
const koanSolve = decode(koanWords, koanShift);
const koanBest = koanSolve.states[0];
// Independently solved third-control plaintext and its two exact true bypasses
// are now required assertions as well, never merely descriptive metrics.
assert.deepEqual(koanBest.literals, knownKoanF);
assert.deepEqual(koanBest.plain, independentlySolvedKoan);
assert.deepEqual(encrypt(koanBest.plain, koanShift), koanCipher);

/*
 * All three real solved controls must pass exactly and reversibly.
 */
const report = {
  method: 'Exact GP29 plaintext-F lexical Viterbi with source word boundaries and known fixed cipher key',
  lexicon: 'Pre-existing original-repo TextBlob english_wordfreq_textblob.txt',
  lexiconEncodedDistinctWords: lexicon.size,
  sourceWordScore: 'ln(1+wordCount) for dictionary match; -8 for unknown word',
  solvedP56: {
    originalRunes: p56Cipher.length, printedWords: p56Words.length,
    blindRecoveredSymbols: p56Best.plain.length,
    blindRecoveredOriginalPlaintext: true,
    blindRecoveredLiteralF: p56Best.literals,
    forwardCipherIdentity: true,
    lexicalWords: p56Best.lexicalWords,
    alternateFinalStates: p56Solve.states.length - 1,
    scoreMarginOverRunnerUp: p56Best.score - p56Solve.states[1].score,
    peakStateCount: Math.max(...p56Solve.stateCounts)
  },
  solvedLP1Welcome: {
    originalRunes: welcomeCipher.length, printedWords: welcomeWords.length,
    blindRecoveredSymbols: welcomeBest.plain.length,
    blindRecoveredOriginalPlaintext: true,
    blindRecoveredLiteralF: welcomeBest.literals,
    forwardCipherIdentity: true,
    lexicalWords: welcomeBest.lexicalWords,
    alternateFinalStates: welcomeSolve.states.length - 1,
    scoreMarginOverRunnerUp: welcomeBest.score - welcomeSolve.states[1].score,
    peakStateCount: Math.max(...welcomeSolve.stateCounts)
  },
  independentLP1Koan: {
    originalRunes: koanCipher.length, printedWords: koanWords.length,
    expectedLiteralF: knownKoanF, selectedLiteralF: koanBest.literals,
    matchedOriginalRuneCount: koanBest.plain.reduce((n, x, i) =>
      n + Number(x === independentlySolvedKoan[i]), 0),
    sourceRuneCount: koanCipher.length,
    forwardCipherIdentity: JSON.stringify(encrypt(koanBest.plain, koanShift)) ===
      JSON.stringify(koanCipher),
    scoreMarginOverRunnerUp: koanSolve.states.length > 1
      ? koanBest.score - koanSolve.states[1].score : null,
    peakStateCount: Math.max(...koanSolve.stateCounts)
  },
  claimLimit: 'Recovers known solved plaintext given the authentic key. No independent key for unsolved LP2 pages.'
};
assert.equal(report.independentLP1Koan.forwardCipherIdentity, true);
console.log(JSON.stringify(report, null, 2));
