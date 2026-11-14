#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const mod29 = (value) => ((value % 29) + 29) % 29;

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const primeEcho = read('resources/historical/cicada2013-os-original-prime-echo.sh');
const sourcePrimes = [...primeEcho.matchAll(/echo\s*(?:-n\s*)?"(\d+)\t";\s*sleep/g)]
  .map((match) => Number(match[1]));

assert.equal(sourcePrimes.length, 464);
assert.equal(sourcePrimes[0], 2);
assert.equal(sourcePrimes[173], 1033);
assert.equal(sourcePrimes[174], 1039);
assert.equal(sourcePrimes[463], 3301);
assert.equal(sourcePrimes.indexOf(1033) + 1, 174);
assert.equal(sourcePrimes.indexOf(3301) + 1, 464);

const full464 = sourcePrimes;
const first174 = sourcePrimes.slice(0, 174);
const tail290 = sourcePrimes.slice(174);
assert.equal(first174.length, 174);
assert.equal(tail290.length, 290);
assert.equal(full464.length % 29, 0);
assert.equal(first174.length % 29, 0);
assert.equal(tail290.length % 29, 0);

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const wordStrings = transcription
  .replace(/\/\s*/gu, '')
  .replace(/%/gu, '')
  .replace(/\s+/gu, '')
  .match(/[\u16A0-\u16FF]+/gu) || [];
const allWords = wordStrings.map((word) => [...word].map((rune) => {
  const index = runeIndex.get(rune);
  assert.notEqual(index, undefined, 'noncanonical rune in transcription');
  return index;
}));
const unknownWords = allWords.slice(0, 2896);
const unknownCipher = unknownWords.flat();
const originalUnknownCipher = corpus.pages
  .filter((page) => page.page <= 55)
  .flatMap((page) => page.indices);
assert.equal(allWords.length, 2941);
assert.equal(unknownWords.length, 2896);
assert.equal(unknownCipher.length, 12956);
assert.deepEqual(unknownCipher, originalUnknownCipher,
  'transcription must match original pages 0-55 rune-for-rune');

const p56Cipher = corpus.pages.find((page) => page.page === 56).indices;
const p57Cipher = corpus.pages.find((page) => page.page === 57).indices;
assert.deepEqual(allWords.slice(2896, 2921).flat(), p56Cipher);
assert.deepEqual(allWords.slice(2921).flat(), p57Cipher);

const sortedTokens = corpus.translit
  .map((token, index) => ({ token, index }))
  .sort((a, b) => b.token.length - a.token.length);

function encodeDictionaryWord(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, 'CW')
    .replace(/V/g, 'U')
    .replace(/K/g, 'C')
    .replace(/Z/g, 'S')
    .replace(/ING/g, 'NG')
    .replace(/IO/g, 'IA');
  const encoded = [];
  for (let offset = 0; offset < normalized.length;) {
    const match = sortedTokens.find(({ token }) => normalized.startsWith(token, offset));
    if (!match) return null;
    encoded.push(match.index);
    offset += match.token.length;
  }
  return encoded;
}

const spellingData = read('resources/control/english_wordfreq_textblob.txt');
const lexicon = new Map();
for (const line of spellingData.match(/^[a-z]+\s+\d+$/gm) || []) {
  const [word, count] = line.split(/\s+/u);
  const encoded = encodeDictionaryWord(word);
  if (encoded) {
    const key = encoded.join(',');
    lexicon.set(key, (lexicon.get(key) || 0) + Number(count));
  }
}
assert.equal(lexicon.size, 29058);

function firstFailure(words, key) {
  let reachable = new Set([0]);
  let runeOffset = 0;
  for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
    const word = words[wordIndex];
    const fCount = word.filter((rune) => rune === 0).length;
    assert.ok(fCount <= 15);
    const next = new Set();
    for (const startPhase of reachable) {
      for (let mask = 0; mask < (1 << fCount); mask++) {
        let phase = startPhase;
        let fOrdinal = 0;
        let valid = true;
        for (const cipherRune of word) {
          if (cipherRune === 0 && ((mask >> fOrdinal) & 1)) {
            fOrdinal++;
            continue;
          }
          if (cipherRune === 0) fOrdinal++;
          if (mod29(cipherRune - (key[phase] - 1)) === 0) {
            valid = false;
            break;
          }
          phase = (phase + 1) % key.length;
        }
        if (valid) next.add(phase);
      }
    }
    if (next.size === 0) {
      assert.ok(word.every((rune) => rune !== 0));
      const witnesses = [...reachable].sort((a, b) => a - b).map((startPhase) => {
        let phase = startPhase;
        for (let wordPosition = 0; wordPosition < word.length; wordPosition++) {
          const cipherIndex = word[wordPosition];
          const keyPrime = key[phase];
          const keyShift = mod29(keyPrime - 1);
          if (mod29(cipherIndex - keyShift) === 0) {
            return {
              phase: startPhase,
              wordPosition,
              globalRuneOffset: runeOffset + wordPosition,
              cipherRune: corpus.translit[cipherIndex],
              cipherIndex,
              keyPrime,
              keyShift
            };
          }
          phase = (phase + 1) % key.length;
        }
        return { phase: startPhase, noWitness: true };
      });
      return {
        feasible: false,
        wordIndex,
        wordRuneOffset: runeOffset,
        cipherWord: word.map((index) => corpus.translit[index]).join(''),
        fPositions: word.flatMap((rune, index) => rune === 0 ? [index] : []),
        previousPhases: [...reachable].sort((a, b) => a - b),
        witnesses
      };
    }
    reachable = next;
    runeOffset += word.length;
  }
  return { feasible: true, finalPhases: [...reachable].sort((a, b) => a - b) };
}

function ordinaryVigenere(words, key) {
  const cipher = words.flat();
  const plain = cipher.map((rune, index) =>
    mod29(rune - (key[index % key.length] - 1)));
  let wordHits = 0;
  let offset = 0;
  for (const word of words) {
    if (lexicon.has(plain.slice(offset, offset + word.length).join(','))) wordHits++;
    offset += word.length;
  }
  const counts = new Array(29).fill(0);
  for (const rune of plain) counts[rune]++;
  const ioc = counts.reduce((sum, count) => sum + count * (count - 1), 0)
    / (plain.length * (plain.length - 1));
  const reencrypted = plain.every((rune, index) =>
    mod29(rune + (key[index % key.length] - 1)) === cipher[index]);
  assert.ok(reencrypted);
  return {
    period: key.length,
    wordHits,
    wordCount: words.length,
    indexOfCoincidence: Number(ioc.toFixed(8)),
    preview: plain.slice(0, 180).map((rune) => corpus.translit[rune]).join(''),
    reencryptedExactly: reencrypted
  };
}

const rawWordHits = unknownWords.reduce((sum, word) =>
  sum + (lexicon.has(word.join(',')) ? 1 : 0), 0);
assert.equal(rawWordHits, 201);

const transparentF = {
  full464: firstFailure(unknownWords, full464),
  first174: firstFailure(unknownWords, first174),
  tail290: firstFailure(unknownWords, tail290)
};
assert.deepEqual(transparentF.full464, {
  feasible: false, wordIndex: 52, wordRuneOffset: 235, cipherWord: 'HC',
  fPositions: [], previousPhases: [231],
  witnesses: [{
    phase: 231, wordPosition: 0, globalRuneOffset: 235,
    cipherRune: 'H', cipherIndex: 8, keyPrime: 1459, keyShift: 8
  }]
});
assert.deepEqual(transparentF.first174, {
  feasible: false, wordIndex: 47, wordRuneOffset: 211, cipherWord: 'OEDMO',
  fPositions: [], previousPhases: [33],
  witnesses: [{
    phase: 33, wordPosition: 0, globalRuneOffset: 211,
    cipherRune: 'OE', cipherIndex: 22, keyPrime: 139, keyShift: 22
  }]
});
assert.deepEqual(transparentF.tail290, {
  feasible: false, wordIndex: 18, wordRuneOffset: 83, cipherWord: 'IAEHXTHPG',
  fPositions: [], previousPhases: [79, 81, 82],
  witnesses: [
    {
      phase: 79, wordPosition: 4, globalRuneOffset: 87,
      cipherRune: 'TH', cipherIndex: 2, keyPrime: 1627, keyShift: 2
    },
    {
      phase: 81, wordPosition: 1, globalRuneOffset: 84,
      cipherRune: 'AE', cipherIndex: 25, keyPrime: 1621, keyShift: 25
    },
    {
      phase: 82, wordPosition: 5, globalRuneOffset: 88,
      cipherRune: 'P', cipherIndex: 13, keyPrime: 1667, keyShift: 13
    }
  ]
});

const ordinary = {
  full464: ordinaryVigenere(unknownWords, full464),
  first174: ordinaryVigenere(unknownWords, first174),
  tail290: ordinaryVigenere(unknownWords, tail290)
};
assert.equal(ordinary.full464.wordHits, 204);
assert.equal(ordinary.first174.wordHits, 197);
assert.equal(ordinary.tail290.wordHits, 213);

const p56ExpectedText = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const p56ExpectedPlain = p56ExpectedText.split(' ').flatMap((word) => {
  const encoded = encodeDictionaryWord(word);
  assert.ok(encoded);
  return encoded;
});
assert.equal(p56ExpectedPlain.length, 85);
assert.deepEqual(p56Cipher.flatMap((rune, index) => rune === 0 ? [index] : []),
  [35, 47, 51, 56, 74]);
assert.deepEqual(p56ExpectedPlain.flatMap((rune, index) => rune === 0 ? [index] : []), [56]);
let p56Consumed = 0;
const p56Reencrypted = p56ExpectedPlain.map((plainRune) => {
  if (plainRune === 0) return 0;
  return mod29(plainRune + (sourcePrimes[p56Consumed++] - 1));
});
assert.deepEqual(p56Reencrypted, p56Cipher);
assert.equal(p56Consumed, 84);
const p56DictionaryHits = p56ExpectedText.split(' ').reduce((sum, word) => {
  const encoded = encodeDictionaryWord(word);
  return sum + (lexicon.has(encoded.join(',')) ? 1 : 0);
}, 0);

console.log(JSON.stringify({
  source: {
    primeEchoCount: sourcePrimes.length,
    firstPause: { prime: 1033, oneBasedOrdinal: 174, blockLength: first174.length },
    secondPause: { prime: 3301, oneBasedOrdinal: 464, blockLength: tail290.length },
    blocks: {
      full464: [full464[0], full464.at(-1)],
      first174: [first174[0], first174.at(-1)],
      tail290: [tail290[0], tail290.at(-1)]
    }
  },
  input: {
    unknownPages: '0-55',
    runeBearingPages: 55,
    printedWords: unknownWords.length,
    runes: unknownCipher.length,
    transcriptionMatchesOriginalCorpus: true,
    dictionaryEntries: lexicon.size,
    rawCiphertextDictionaryWordHits: rawWordHits
  },
  p56PositiveControl: {
    plaintext: p56ExpectedText,
    runes: p56ExpectedPlain.length,
    ciphertextFPositions: [35, 47, 51, 56, 74],
    literalPlaintextFPositions: [56],
    keySymbolsConsumed: p56Consumed,
    dictionaryWordHits: p56DictionaryHits,
    exactForwardReencryption: true
  },
  transparentF: {
    rule: 'ciphertext F may be literal plaintext F without key advance or encrypted non-F; a key-consuming output cannot be plaintext F',
    initialPhase: 0,
    pageAndWordResets: false,
    full464: transparentF.full464,
    first174: transparentF.first174,
    tail290: transparentF.tail290
  },
  ordinaryVigenere: ordinary,
  conclusion: 'All three source-defined repeated prime-totient key blocks are structurally impossible under the p56 transparent-F rule; ordinary no-bypass Vigenere remains ciphertext-like.'
}, null, 2));
