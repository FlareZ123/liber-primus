'use strict';

/*
 * Source-locked test of the literal "find the divinity within" reading:
 * preserve each printed word's first/last rune and apply the six-rune
 * interior of the authentic LP1 DIVINITY Vigenere key to the word interiors.
 *
 * The authentic LP1 encoder makes plaintext F literal/non-consuming.
 * The primary clock is continuous over all unknown word interiors; resetting
 * at each printed word is a separately reported natural control.
 *
 * Run: node sims/lp2_inner_divinity_edge_key_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const corpusText = read('resources/liber-primus/lp2-corpus.json');
const printedText = read('resources/liber-primus/lp2-transcription.txt');
const frequencyText = read('resources/control/english_wordfreq_textblob.txt');
const original = JSON.parse(corpusText);
const runeMap = new Map(original.runes.map((rune, i) => [rune, i]));
const mod29 = (n) => ((n % 29) + 29) % 29;
const sha256 = (text) => crypto.createHash('sha256').update(text).digest('hex');

/*
 * Remove only visual line/page markers. Hyphens and punctuation remain
 * separators, so the resulting rune runs are the printed words. This exact
 * parse is checked against the complete original 13,136-rune corpus.
 */
const wordStrings = printedText
  .replace(/[\r\n/%&$]/gu, '')
  .match(/[\u16A0-\u16FF]+/gu) || [];
const allWords = wordStrings.map((word) => [...word].map((rune) => {
  const index = runeMap.get(rune);
  assert.notEqual(index, undefined);
  return index;
}));
const parsedRunes = allWords.flat();
const corpusRunes = original.pages.flatMap((page) => page.indices);
assert.equal(allWords.length, 2941);
assert.equal(parsedRunes.length, 13136);
assert.deepEqual(parsedRunes, corpusRunes);

const unknownRunes = original.pages
  .filter((page) => page.page <= 55)
  .flatMap((page) => page.indices);
assert.equal(unknownRunes.length, 12956);

const wordSpans = [];
let globalOffset = 0;
for (const word of allWords) {
  wordSpans.push({ start: globalOffset, end: globalOffset + word.length, word });
  globalOffset += word.length;
}
assert.equal(globalOffset, 13136);
const unknownSpans = wordSpans.filter((span) => span.start < unknownRunes.length);
assert.equal(unknownSpans.length, 2896);
assert.ok(unknownSpans.every((span) => span.end <= unknownRunes.length));
const unknownWords = unknownSpans.map((span) => span.word);
assert.deepEqual(unknownWords.flat(), unknownRunes);

const interiorCount = unknownWords.reduce((n, word) =>
  n + Math.max(0, word.length - 2), 0);
const edgeCount = unknownRunes.length - interiorCount;
const interiorCipherFCount = unknownWords.reduce((n, word) =>
  n + (word.length > 2 ? word.slice(1, -1).filter((x) => x === 0).length : 0), 0);
assert.equal(interiorCount, 7247);
assert.equal(edgeCount, 5709);
assert.equal(interiorCipherFCount, 260);

/* Reconfirm the p55 carry and its exact 17 printed-word intersections. */
const p55Start = original.pages.filter((page) => page.page < 55)
  .reduce((n, page) => n + page.runic_count, 0);
const p55End = p55Start + original.pages.find((page) => page.page === 55).runic_count;
const p55Lengths = wordSpans
  .filter((span) => span.end > p55Start && span.start < p55End)
  .map((span) => Math.min(span.end, p55End) - Math.max(span.start, p55Start));
assert.equal(p55Start, 12880);
assert.equal(p55End, 12956);
assert.deepEqual(p55Lengths, [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);

/*
 * LP1 p03/p04's authentic key is DIVINITY in GP29 indices. The literal
 * interior after shedding D/Y is IVINIT in Latin spelling, IUINIT in GP
 * transliteration because V and U share one rune.
 */
const divinityKey = [23, 10, 1, 10, 9, 10, 16, 26];
const key = divinityKey.slice(1, -1);
assert.deepEqual(key, [10, 1, 10, 9, 10, 16]);
const keyGP = key.map((i) => original.translit[i]).join('');
assert.equal(keyGP, 'IUINIT');

/*
 * Exact feasibility gate for the authentic plaintext-F transparent rule.
 * For ciphertext F, a decoder may either emit literal plaintext F without
 * advancing or subtract the key and advance, provided the result is not F.
 * A non-F ciphertext rune that subtracts to plaintext F has no legal branch.
 */
function scanClock(resetEachWord) {
  let phases = new Set([0]);
  let globalStart = 0;
  let ciphertextFBeforeFailure = 0;
  for (const [wordIndex, word] of unknownWords.entries()) {
    const wordStart = globalStart;
    globalStart += word.length;
    if (resetEachWord) {
      phases = new Set([0]);
      ciphertextFBeforeFailure = 0;
    }
    for (let j = 1; j < word.length - 1; j++) {
      const ciphertext = word[j];
      const next = new Set();
      const attempts = [];
      for (const phase of phases) {
        if (ciphertext === 0) next.add(phase);
        const plaintext = mod29(ciphertext - key[phase]);
        attempts.push({ phase, key_value: key[phase], plaintext_value: plaintext });
        if (plaintext !== 0) next.add((phase + 1) % key.length);
      }
      if (!next.size) {
        return {
          valid: false,
          wordIndex,
          word: word.map((i) => original.translit[i]).join(''),
          wordStart,
          globalRuneOffset: wordStart + j,
          interiorOffset: j - 1,
          ciphertext,
          ciphertextTranslit: original.translit[ciphertext],
          phasesBefore: [...phases].sort((a, b) => a - b),
          attempts,
          ciphertextFBeforeFailure
        };
      }
      phases = next;
      if (ciphertext === 0) ciphertextFBeforeFailure++;
    }
  }
  return { valid: true, finalPhases: [...phases], ciphertextFBeforeFailure };
}
const continuous = scanClock(false);
const wordReset = scanClock(true);
assert.equal(continuous.valid, false);
assert.equal(continuous.wordIndex, 5);
assert.equal(continuous.word, 'NEWBASOEEOINGU');
assert.equal(continuous.globalRuneOffset, 31);
assert.equal(continuous.interiorOffset, 7);
assert.equal(continuous.ciphertext, 10);
assert.equal(continuous.ciphertextTranslit, 'I');
assert.deepEqual(continuous.phasesBefore, [2]);
assert.deepEqual(continuous.attempts, [{ phase: 2, key_value: 10, plaintext_value: 0 }]);
assert.equal(continuous.ciphertextFBeforeFailure, 0);

assert.equal(wordReset.valid, false);
assert.equal(wordReset.wordIndex, 6);
assert.equal(wordReset.word, 'NAEGITH');
assert.equal(wordReset.globalRuneOffset, 37);
assert.equal(wordReset.interiorOffset, 2);
assert.equal(wordReset.ciphertext, 10);
assert.equal(wordReset.ciphertextTranslit, 'I');
assert.deepEqual(wordReset.phasesBefore, [2]);
assert.deepEqual(wordReset.attempts, [{ phase: 2, key_value: 10, plaintext_value: 0 }]);
assert.equal(wordReset.ciphertextFBeforeFailure, 0);

/* Fixed TextBlob lexical baseline and all-consuming Vigenere controls. */
const tokens = original.translit.map((token, i) => ({ token, i }))
  .sort((a, b) => b.token.length - a.token.length);
function encodeWord(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, 'CW').replace(/V/g, 'U').replace(/K/g, 'C')
    .replace(/Z/g, 'S').replace(/ING/g, 'NG').replace(/IO/g, 'IA');
  const result = [];
  for (let i = 0; i < normalized.length;) {
    const found = tokens.find(({ token }) => normalized.startsWith(token, i));
    if (!found) return null;
    result.push(found.i);
    i += found.token.length;
  }
  return result;
}
const lexicon = new Map();
for (const line of frequencyText.match(/^[a-z]+\s+\d+$/gm) || []) {
  const [word, count] = line.split(/\s+/u);
  const encoded = encodeWord(word);
  if (!encoded) continue;
  const encodedKey = encoded.join(',');
  lexicon.set(encodedKey, (lexicon.get(encodedKey) || 0) + Number(count));
}
assert.equal(lexicon.size, 29058);
function scoreWords(words) {
  let known = 0;
  let score = 0;
  for (const word of words) {
    const count = lexicon.get(word.join(',')) || 0;
    known += Number(count > 0);
    score += count ? Math.log1p(count) : -8;
  }
  return { known, score, mean: score / words.length };
}
function decodeAllConsuming(resetEachWord) {
  let phase = 0;
  return unknownWords.map((word) => {
    if (resetEachWord) phase = 0;
    const plain = [word[0]];
    for (let j = 1; j < word.length - 1; j++) {
      plain.push(mod29(word[j] - key[phase]));
      phase = (phase + 1) % key.length;
    }
    if (word.length > 1) plain.push(word[word.length - 1]);
    return plain;
  });
}
const rawScore = scoreWords(unknownWords);
const continuousAllConsume = scoreWords(decodeAllConsuming(false));
const wordResetAllConsume = scoreWords(decodeAllConsuming(true));
assert.equal(rawScore.known, 201);
assert.equal(continuousAllConsume.known, 201);
assert.equal(wordResetAllConsume.known, 200);

/* Synthetic positive plant, including an interior plaintext F bypass. */
const plantPlain = ['THE', 'AFTER', 'DIVINITY', 'WITHIN', 'EMERGE']
  .map((word) => {
    const encoded = encodeWord(word);
    assert.ok(encoded, 'Unencodable plant word: ' + word);
    return encoded;
  });
assert.ok(plantPlain.some((word) => word.slice(1, -1).includes(0)));
function encryptPlant(words) {
  let phase = 0;
  return words.map((word) => {
    const cipher = [word[0]];
    for (const plaintext of word.slice(1, -1)) {
      if (plaintext === 0) cipher.push(0);
      else {
        cipher.push(mod29(plaintext + key[phase]));
        phase = (phase + 1) % key.length;
      }
    }
    if (word.length > 1) cipher.push(word[word.length - 1]);
    return cipher;
  });
}
function decodePlantWithKnownFMask(cipherWords, expectedWords) {
  let phase = 0;
  return cipherWords.map((word, wi) => {
    const expected = expectedWords[wi];
    const plain = [word[0]];
    for (let j = 1; j < word.length - 1; j++) {
      if (expected[j] === 0) {
        assert.equal(word[j], 0);
        plain.push(0);
      } else {
        assert.notEqual(word[j], 0);
        const recovered = mod29(word[j] - key[phase]);
        assert.equal(recovered, expected[j]);
        plain.push(recovered);
        phase = (phase + 1) % key.length;
      }
    }
    if (word.length > 1) plain.push(word[word.length - 1]);
    return plain;
  });
}
const plantCipher = encryptPlant(plantPlain);
const plantRecovered = decodePlantWithKnownFMask(plantCipher, plantPlain);
assert.deepEqual(plantRecovered, plantPlain);

const report = {
  source: {
    corpus_sha256: sha256(corpusText),
    transcription_sha256: sha256(printedText),
    lexicon_sha256: sha256(frequencyText),
    parsed_words_all_pages: allWords.length,
    parsed_runes_all_pages: parsedRunes.length,
    exact_corpus_match: true,
    unknown_words: unknownWords.length,
    unknown_runes: unknownRunes.length,
    interior_runes: interiorCount,
    unchanged_edge_runes: edgeCount,
    ciphertext_F_in_interiors: interiorCipherFCount,
    p55_start: p55Start,
    p55_word_intersections: p55Lengths
  },
  hypothesis: {
    source_phrase: 'SHED OUR OWN CIRCUMFERENCES. FIND THE DIVINITY WITHIN AND EMERGE.',
    historical_LP1_key: divinityKey,
    inner_key_latin: 'IVINIT',
    inner_key_GP: keyGP,
    inner_key_indices: key,
    operation: 'Preserve first/last rune of every printed word; LP1 Vigenere subtraction on interiors only; plaintext F literal/non-consuming',
    clocks_tested: ['continuous over all interiors from first word', 'reset to phase zero at each word']
  },
  authentic_plaintext_F_gate: {
    continuous,
    wordReset
  },
  all_consuming_control: {
    raw: rawScore,
    continuous: continuousAllConsume,
    wordReset: wordResetAllConsume,
    interpretation: 'No lexical gain: continuous finds the same 201/2896 words as raw; word-reset finds 200/2896.'
  },
  synthetic_positive_control: {
    words: ['THE', 'AFTER', 'DIVINITY', 'WITHIN', 'EMERGE'],
    interior_plaintext_F_exercised: true,
    exact_round_trip: true
  },
  conclusion: 'Reject this exact IVINIT + literal-edge + historical plaintext-F Vigenere composition; no unknown LP2 plaintext or key recovered.'
};
console.log(JSON.stringify(report, null, 2));
