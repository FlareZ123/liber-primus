'use strict';

// Source-fixed transfer tests from the only solved LP2 material.
// Run: node sims/lp2_terminal_known_text_transfer_gate.cjs
// No key search, fitted offsets, unknown-F masks, or table-derived inputs.

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { parseSharedCorpus } = require('./lp2_word_pages.cjs');

const ROOT = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const sourceText = fs.readFileSync(
  path.join(ROOT, 'resources/control/shakespeare_first300k.txt'), 'utf8');
const GP = corpus.translit;
const GP_CODES = new Map(GP.map((token, index) => [token, index]));
const GP_TOKENS = [...GP].sort((a, b) => b.length - a.length);
const P56_TEXT = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
// The original p57 GP spelling is TUNNELNG (no I before the NG rune).
const P57_TEXT = 'PARABLE LIKE THE INSTAR TUNNELNG TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE';

function toGpRunes(text) {
  const normalized = text.toUpperCase()
    .replace(/QU/g, 'CW').replace(/V/g, 'U').replace(/K/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let at = 0; at < normalized.length;) {
    if (!/[A-Z]/.test(normalized[at])) {
      at++;
      continue;
    }
    const token = GP_TOKENS.find((candidate) => normalized.startsWith(candidate, at));
    assert.ok(token, 'Unencodable source letter at ' + normalized.slice(at));
    out.push(GP_CODES.get(token));
    at += token.length;
  }
  return out;
}

function firstPrimes(count) {
  const out = [];
  for (let n = 2; out.length < count; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) {
        prime = false;
        break;
      }
    }
    if (prime) out.push(n);
  }
  return out;
}

function encodeEnglishWords(text) {
  return (text.match(/[A-Za-z]+/g) || []).map((word) => toGpRunes(word)).filter((w) => w.length);
}

function buildLanguageModel(words) {
  const unigram = new Float64Array(29);
  const bigram = new Float64Array(29 * 29);
  const trigram = new Float64Array(29 * 29 * 29);
  let total = 0;
  for (const word of words) {
    for (let i = 0; i < word.length; i++) {
      const symbol = word[i];
      unigram[symbol]++;
      total++;
      if (i >= 1) bigram[word[i - 1] * 29 + symbol]++;
      if (i >= 2) trigram[(word[i - 2] * 29 + word[i - 1]) * 29 + symbol]++;
    }
  }
  return { unigram, bigram, trigram, total };
}

function scoreWords(words, model) {
  const { unigram, bigram, trigram, total } = model;
  let score = 0;
  let symbols = 0;
  for (const word of words) {
    for (let i = 0; i < word.length; i++) {
      const symbol = word[i];
      let probability;
      if (i === 0) probability = (unigram[symbol] + 1) / (total + 29);
      else if (i === 1) {
        probability = (bigram[word[i - 1] * 29 + symbol] + 1) /
          (unigram[word[i - 1]] + 29);
      } else {
        const context = word[i - 2] * 29 + word[i - 1];
        probability = (trigram[context * 29 + symbol] + 1) /
          (bigram[context] + 29);
      }
      score += Math.log(probability);
      symbols++;
    }
  }
  return score / symbols;
}

function dictionaryHitRate(words, dictionary) {
  return words.filter((word) => dictionary.has(word.join(','))).length / words.length;
}

// Index-aware version: repeated symbol values must not be confused with positions.
function decodeWordResetByIndex(words, shifts, sign) {
  return words.map((word) => word.map((cipher, index) =>
    (cipher + sign * shifts[index] + 29) % 29));
}

function decodeRunningKey(words, key, sign, reverse) {
  let position = 0;
  return words.map((word) => word.map((cipher) => {
    const keyIndex = position % key.length;
    const symbol = reverse ? key[key.length - 1 - keyIndex] : key[keyIndex];
    position++;
    return (cipher + sign * symbol + 29) % 29;
  }));
}

function splitFlat(flat, lengths) {
  let at = 0;
  return lengths.map((length) => {
    const word = flat.slice(at, at + length);
    at += length;
    return word;
  });
}

function sha256(relativePath) {
  return crypto.createHash('sha256')
    .update(fs.readFileSync(path.join(ROOT, relativePath))).digest('hex');
}

function main() {
  const parsed = parseSharedCorpus();
  const words = parsed.words.map((word) =>
    [...word.runes].map((rune) => corpus.runes.indexOf(rune)));
  assert.equal(words.length, 2896);
  assert.equal(parsed.runeCount, 12956);
  assert.ok(words.every((word) => word.every((symbol) => symbol >= 0 && symbol < 29)));

  const original = corpus.pages.filter((page) => page.page <= 55)
    .flatMap((page) => page.indices);
  const flattened = words.flat();
  assert.equal(flattened.length, original.length);
  assert.deepEqual(flattened, original);

  const primes = firstPrimes(100);
  const shifts = primes.map((prime) => (prime - 1) % 29);
  const p56Cipher = corpus.pages.find((page) => page.page === 56).indices;
  const p57Plain = corpus.pages.find((page) => page.page === 57).indices;
  const expectedP56 = toGpRunes(P56_TEXT);
  const expectedP57 = toGpRunes(P57_TEXT);

  // Reproduce the authenticated continuous p56 rule: one literal F at offset 56.
  let primeClock = 0;
  const p56Plain = p56Cipher.map((cipher, position) => {
    if (position === 56) return 0;
    return (cipher - shifts[primeClock++] + 29) % 29;
  });
  assert.deepEqual(p56Plain, expectedP56);
  assert.deepEqual(p57Plain, expectedP57);
  assert.equal(p56Plain.length, 85);
  assert.equal(p57Plain.length, 95);

  // Candidate A: reuse the authentic phi(prime) subtraction, but reset prime_0
  // at every printed word. No literal-F skip is added or searched.
  const wordResetMinus = decodeWordResetByIndex(words, shifts, -1);
  const wordResetPlus = decodeWordResetByIndex(words, shifts, +1);
  const wordResetPlantPlain = encodeEnglishWords(sourceText.slice(240000)).slice(0, 1000);
  const wordResetPlantCipher = wordResetPlantPlain.map((word) =>
    word.map((plain, i) => (plain + shifts[i]) % 29));
  const wordResetPlantRecovered = decodeWordResetByIndex(wordResetPlantCipher, shifts, -1);
  assert.deepEqual(wordResetPlantRecovered, wordResetPlantPlain);

  // Candidate B: use all 180 known p56+p57 plaintext runes in printed order
  // as one repeated additive GP29 key over the entire unknown stream.
  const terminalKey = [...p56Plain, ...p57Plain];
  assert.equal(terminalKey.length, 180);
  const runningModels = [];
  for (const sign of [-1, +1]) {
    for (const reverse of [false, true]) {
      const decoded = decodeRunningKey(words, terminalKey, sign, reverse);
      runningModels.push({
        sign,
        reverse,
        score: scoreWords(decoded, languageModel),
        dictionaryHitRate: dictionaryHitRate(decoded, dictionary),
        prefix: decoded.slice(0, 45).map((word) =>
          word.map((symbol) => GP[symbol]).join('')).join(' '),
      });
    }
  }

  const plantWords = encodeEnglishWords(sourceText.slice(240000)).slice(0, 1000);
  const plantLengths = plantWords.map((word) => word.length);
  const plantFlat = plantWords.flat();
  const plantCipherFlat = plantFlat.map((plain, i) =>
    (plain + terminalKey[i % terminalKey.length]) % 29);
  const plantRecoveredFlat = plantCipherFlat.map((cipher, i) =>
    (cipher - terminalKey[i % terminalKey.length] + 29) % 29);
  const plantRecoveredWords = splitFlat(plantRecoveredFlat, plantLengths);
  assert.deepEqual(plantRecoveredWords, plantWords);

  const rawScore = scoreWords(words, languageModel);
  const result = {
    hypothesis: 'Two direct transfers from authenticated solved LP2 material to the 12,956 unknown runes; fixed source choices only.',
    source: {
      unknownWords: words.length,
      unknownRunes: flattened.length,
      crossPageWords: parsed.crossPageWords,
      p56KnownPlaintextRunes: p56Plain.length,
      p57KnownPlaintextRunes: p57Plain.length,
      concatenatedTerminalKeyRunes: terminalKey.length,
      p56ExactCipherRegression: true,
      p57ExactOriginalPlaintext: true,
      p56PrimeSymbolsConsumed: primeClock,
      sha256: {
        corpus: sha256('resources/liber-primus/lp2-corpus.json'),
        transcription: sha256('resources/lp2-transcription.txt'),
        languageControl: sha256('resources/control/shakespeare_first300k.txt'),
      },
    },
    languageModel: {
      trainingCharacters: 240000,
      heldoutCharacters: 60000,
      trainingWords: trainingWords.length,
      heldoutWords: heldoutWords.length,
      heldoutEnglishScore: scoreWords(heldoutWords, languageModel),
      rawCiphertextScore: rawScore,
      rawDictionaryHitRate: dictionaryHitRate(words, dictionary),
    },
    wordResetPhiPrime: {
      operation: 'P[j] = C[j] - (prime[j]-1) mod29; prime index resets to zero at every printed word',
      literalFPolicy: 'No F bypass; no unknown mask or key search',
      subtraction: {
        score: scoreWords(wordResetMinus, languageModel),
        dictionaryHitRate: dictionaryHitRate(wordResetMinus, dictionary),
        prefix: wordResetMinus.slice(0, 45).map((word) =>
          word.map((symbol) => GP[symbol]).join('')).join(' '),
      },
      additionControl: {
        score: scoreWords(wordResetPlus, languageModel),
        dictionaryHitRate: dictionaryHitRate(wordResetPlus, dictionary),
      },
      positivePlant: {
        words: wordResetPlantPlain.length,
        exactInverse: true,
      },
    },
    solvedTerminalPlaintextRunningKey: {
      operation: 'P[i] = C[i] - K[i mod180] mod29; K = p56 plaintext || p57 plaintext',
      keyOrder: 'p56 then p57, forward, continuous across all word/page boundaries',
      variants: runningModels,
      positivePlant: {
        words: plantWords.length,
        runes: plantFlat.length,
        exactInverse: true,
      },
    },
    decision: 'Neither source-fixed transfer recovers GP-English plaintext. These are bounded negatives for the exact clocks and key order tested, not a general exclusion of other cipher layers or registers.',
  };

  console.log('RESULT_JSON_BEGIN');
  console.log(JSON.stringify(result, null, 2));
  console.log('RESULT_JSON_END');
}

const trainingWords = encodeEnglishWords(sourceText.slice(0, 240000));
const heldoutWords = encodeEnglishWords(sourceText.slice(240000));
const languageModel = buildLanguageModel(trainingWords);
const dictionary = new Set(trainingWords.map((word) => word.join(',')));

main();
