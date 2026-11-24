#!/usr/bin/env node
'use strict';

/*
 * Leave-one-source-out native-GP word-trigram gate.
 *
 * Inputs are solved GP29 reference strings and fixed English controls only.
 * No candidate LP2 plaintext or unknown-page decryption is used.
 *
 * Run with Node 22:
 *   node sims/lp2_native_gp_syntax_author_holdout_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const BOS = '<s>';
const EOS = '</s>';
const SOURCE_BOOST = 10;
const CONTROL_LIMIT = 400;

function read(name) {
  return fs.readFileSync(path.join(ROOT, name), 'utf8');
}

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const solved = JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const runeToLabel = new Map(corpus.runes.map((rune, index) => [rune, corpus.translit[index]]));
const labels = corpus.translit.slice().sort((a, b) => b.length - a.length);

function encodeLatinWord(input) {
  const normalized = input.toUpperCase()
    .replaceAll('QU', 'CW')
    .replaceAll('V', 'U')
    .replaceAll('K', 'C')
    .replaceAll('Q', 'C')
    .replaceAll('Z', 'S');
  const encoded = [];
  for (let offset = 0; offset < normalized.length;) {
    const label = labels.find(candidate => normalized.startsWith(candidate, offset));
    if (!label) return null;
    encoded.push(label);
    offset += label.length;
  }
  return encoded.join(' ');
}

function encodeRuneWord(input) {
  const encoded = [...input].map(rune => runeToLabel.get(rune));
  assert(encoded.every(Boolean), 'Solved source contains a rune outside the canonical GP alphabet');
  return encoded.join(' ');
}

const dictionary = new Map();
for (const line of read('resources/control/english_wordfreq_textblob.txt').split(/\r?\n/u)) {
  const match = line.trim().match(/^([a-z]+)\s+(\d+)$/iu);
  if (!match) continue;
  const encoded = encodeLatinWord(match[1]);
  if (encoded) dictionary.set(encoded, (dictionary.get(encoded) || 0) + Number(match[2]));
}
assert.equal(dictionary.size, 29062, 'Fixed normalized GP dictionary changed');

const dictionaryByLength = new Map();
for (const [word, frequency] of dictionary) {
  const length = word.split(' ').length;
  if (!dictionaryByLength.has(length)) dictionaryByLength.set(length, []);
  dictionaryByLength.get(length).push({ word, frequency });
}
for (const candidates of dictionaryByLength.values()) {
  candidates.sort((a, b) => b.frequency - a.frequency);
}

function parseSolvedSection(section) {
  let text = section.source_text;
  // These two source records switch from prose to numeric tables at the
  // literal first printed table value; the table is not sentence prose.
  if (section.name === '0_wisdom') text = text.split(/\n272\b/u)[0];
  if (section.name === 'jpg229') text = text.split(/\n434\b/u)[0];

  const matches = [...text.matchAll(/[\u16A0-\u16FF]+/gu)];
  const sentences = [];
  let current = [];
  for (let index = 0; index < matches.length; index++) {
    const match = matches[index];
    current.push(encodeRuneWord(match[0]));
    const end = match.index + match[0].length;
    const next = index + 1 < matches.length ? matches[index + 1].index : text.length;
    const separator = text.slice(end, next);
    if (/[⁘⁜]/u.test(separator)) {
      sentences.push(current);
      current = [];
    }
  }
  if (current.length) sentences.push(current);
  return { name: section.name, sentences };
}

const cicadaSections = solved.sections.map(parseSolvedSection);
const sectionWordCounts = cicadaSections.map(section =>
  section.sentences.reduce((sum, sentence) => sum + sentence.length, 0));
assert.deepEqual(sectionWordCounts, [45, 124, 18, 208, 181, 88, 18, 25, 20]);
assert.equal(sectionWordCounts.reduce((sum, count) => sum + count, 0), 727);

const key2 = (a, b) => a + '\u0001' + b;

function makeModel(trainingSections) {
  const unigram = new Map(dictionary);
  const bigramFollowers = new Map();
  const trigramFollowers = new Map();
  const bigramTotals = new Map();
  const trigramTotals = new Map();
  const bigramTypes = new Map();
  const trigramTypes = new Map();

  function addFollower(map, context, word) {
    if (!map.has(context)) map.set(context, new Map());
    const followers = map.get(context);
    followers.set(word, (followers.get(word) || 0) + 1);
  }

  function addType(map, context, word) {
    if (!map.has(context)) map.set(context, new Set());
    map.get(context).add(word);
  }

  for (const section of trainingSections) {
    for (const sentence of section.sentences) {
      const sequence = [BOS, BOS, ...sentence, EOS];
      for (let index = 2; index < sequence.length; index++) {
        const word = sequence[index];
        const previous1 = sequence[index - 1];
        const context = key2(sequence[index - 2], previous1);
        unigram.set(word, (unigram.get(word) || 0) + SOURCE_BOOST);
        addFollower(bigramFollowers, previous1, word);
        addFollower(trigramFollowers, context, word);
        bigramTotals.set(previous1, (bigramTotals.get(previous1) || 0) + 1);
        trigramTotals.set(context, (trigramTotals.get(context) || 0) + 1);
        addType(bigramTypes, previous1, word);
        addType(trigramTypes, context, word);
      }
    }
  }

  const unigramTotal = [...unigram.values()].reduce((sum, count) => sum + count, 0);
  const pUnigram = word => (unigram.get(word) || 0) / unigramTotal;

  // Witten-Bell backoff must return the lower-order distribution when the
  // higher-order context has no observations. Returning zero here falsely
  // makes every unseen-context target rank first.
  const pBigram = (previous1, word) => {
    const observations = bigramTotals.get(previous1) || 0;
    const types = bigramTypes.get(previous1)?.size || 0;
    if (observations + types === 0) return pUnigram(word);
    return ((bigramFollowers.get(previous1)?.get(word) || 0) +
      types * pUnigram(word)) / (observations + types);
  };

  const pTrigram = (previous2, previous1, word) => {
    const context = key2(previous2, previous1);
    const observations = trigramTotals.get(context) || 0;
    const types = trigramTypes.get(context)?.size || 0;
    if (observations + types === 0) return pBigram(previous1, word);
    return ((trigramFollowers.get(context)?.get(word) || 0) +
      types * pBigram(previous1, word)) / (observations + types);
  };

  const candidateCache = new Map();
  function candidateWords(previous2, previous1, length, branch) {
    const cacheKey = previous2 + '\u0002' + previous1 + '\u0002' + length + '\u0002' + branch;
    if (candidateCache.has(cacheKey)) return candidateCache.get(cacheKey);

    // Every observed context follower is included. For words unseen at both
    // context orders, Witten-Bell probability is proportional to unigram
    // probability, so the top 40 length-matched unigrams cover every possible
    // member of the top 30 candidate list used here.
    const candidates = new Set((dictionaryByLength.get(length) || [])
      .slice(0, 40).map(entry => entry.word));
    for (const word of bigramFollowers.get(previous1)?.keys() || []) {
      if (word !== EOS && word.split(' ').length === length) candidates.add(word);
    }
    for (const word of trigramFollowers.get(key2(previous2, previous1))?.keys() || []) {
      if (word !== EOS && word.split(' ').length === length) candidates.add(word);
    }

    const ranked = [...candidates]
      .map(word => ({ word, probability: pTrigram(previous2, previous1, word) }))
      .sort((a, b) => b.probability - a.probability)
      .slice(0, branch);
    candidateCache.set(cacheKey, ranked);
    return ranked;
  }

  return {
    pTrigram,
    bigramFollowers,
    trigramFollowers,
    candidateWords
  };
}

function conditionalRank(model, previous2, previous1, target) {
  const length = target.split(' ').length;
  const candidates = dictionaryByLength.get(length) || [];
  const targetProbability = model.pTrigram(previous2, previous1, target);
  let rank = 1;
  for (const candidate of candidates) {
    if (model.pTrigram(previous2, previous1, candidate.word) >
        targetProbability + 1e-18) rank++;
  }
  return rank;
}

function unigramRank(target) {
  const length = target.split(' ').length;
  const candidates = dictionaryByLength.get(length) || [];
  const frequency = dictionary.get(target);
  return 1 + candidates.filter(candidate => candidate.frequency > frequency).length;
}

function evaluateHeldoutSection(heldout) {
  const model = makeModel(cicadaSections.filter(section => section.name !== heldout.name));
  const result = {
    name: heldout.name,
    total: 0,
    inVocabulary: 0,
    oov: 0,
    top1: 0,
    top5: 0,
    top10: 0,
    unigramTop1: 0,
    unigramTop5: 0,
    unigramTop10: 0,
    trigramContextSeen: 0,
    exactTrigramSeen: 0,
    exactTrigramTop1: 0,
    trigramContextUnseen: 0,
    trigramContextUnseenTop1: 0,
    sentenceStarts: 0,
    sentenceStartTop1: 0,
    sentenceStartTop5: 0,
    sentenceStartTop10: 0
  };

  for (const sentence of heldout.sentences) {
    let previous2 = BOS;
    let previous1 = BOS;
    for (let index = 0; index < sentence.length; index++) {
      const word = sentence[index];
      result.total++;
      if (!dictionary.has(word)) {
        result.oov++;
        previous2 = previous1;
        previous1 = word;
        continue;
      }

      result.inVocabulary++;
      const rank = conditionalRank(model, previous2, previous1, word);
      const baseRank = unigramRank(word);
      if (rank === 1) result.top1++;
      if (rank <= 5) result.top5++;
      if (rank <= 10) result.top10++;
      if (baseRank === 1) result.unigramTop1++;
      if (baseRank <= 5) result.unigramTop5++;
      if (baseRank <= 10) result.unigramTop10++;

      const context = key2(previous2, previous1);
      if (model.trigramFollowers.has(context)) {
        result.trigramContextSeen++;
        if (model.trigramFollowers.get(context).has(word)) {
          result.exactTrigramSeen++;
          if (rank === 1) result.exactTrigramTop1++;
        }
      } else {
        result.trigramContextUnseen++;
        if (rank === 1) result.trigramContextUnseenTop1++;
      }

      if (index === 0) {
        result.sentenceStarts++;
        if (rank === 1) result.sentenceStartTop1++;
        if (rank <= 5) result.sentenceStartTop5++;
        if (rank <= 10) result.sentenceStartTop10++;
      }
      previous2 = previous1;
      previous1 = word;
    }
  }
  return result;
}

function parseEnglishSentences(text) {
  const sentences = [];
  let token = '';
  let current = [];
  for (const character of text) {
    if (/[A-Za-z]/u.test(character)) {
      token += character;
    } else {
      if (token) {
        const encoded = encodeLatinWord(token);
        if (encoded) current.push(encoded);
        token = '';
      }
      if (/[.!?]/u.test(character) && current.length) {
        sentences.push(current);
        current = [];
      }
    }
  }
  if (token) {
    const encoded = encodeLatinWord(token);
    if (encoded) current.push(encoded);
  }
  if (current.length) sentences.push(current);
  return sentences;
}

function evaluateControlWords(name, text) {
  const model = makeModel(cicadaSections);
  const result = {
    name,
    total: 0,
    inVocabulary: 0,
    oov: 0,
    top1: 0,
    top5: 0,
    top10: 0,
    unigramTop1: 0,
    unigramTop5: 0,
    unigramTop10: 0
  };

  for (const sentence of parseEnglishSentences(text)) {
    let previous2 = BOS;
    let previous1 = BOS;
    for (const word of sentence) {
      if (result.total >= CONTROL_LIMIT) break;
      result.total++;
      if (!dictionary.has(word)) {
        result.oov++;
        previous2 = previous1;
        previous1 = word;
        continue;
      }
      result.inVocabulary++;
      const rank = conditionalRank(model, previous2, previous1, word);
      const baseRank = unigramRank(word);
      if (rank === 1) result.top1++;
      if (rank <= 5) result.top5++;
      if (rank <= 10) result.top10++;
      if (baseRank === 1) result.unigramTop1++;
      if (baseRank <= 5) result.unigramTop5++;
      if (baseRank <= 10) result.unigramTop10++;
      previous2 = previous1;
      previous1 = word;
    }
    if (result.total >= CONTROL_LIMIT) break;
  }
  return result;
}

function beamSearch(model, targetWords, initialContext, width, branch, addSentenceEnd) {
  let beam = [{
    previous2: initialContext[0],
    previous1: initialContext[1],
    words: [],
    score: 0
  }];

  for (let index = 0; index < targetWords.length; index++) {
    const length = targetWords[index].split(' ').length;
    const next = [];
    for (const state of beam) {
      for (const candidate of model.candidateWords(
        state.previous2, state.previous1, length, branch)) {
        const previous2 = state.previous1;
        const previous1 = candidate.word;
        let score = state.score + Math.log(candidate.probability);
        if (addSentenceEnd && index === targetWords.length - 1) {
          score += Math.log(model.pTrigram(previous2, previous1, EOS));
        }
        next.push({
          previous2,
          previous1,
          words: [...state.words, candidate.word],
          score
        });
      }
    }
    next.sort((a, b) => b.score - a.score);
    beam = next.slice(0, width);
    if (!beam.length) break;
  }

  const actual = targetWords.join('|');
  const index = beam.findIndex(state => state.words.join('|') === actual);
  return index < 0 ? null : index + 1;
}

function evaluatePhraseWindows(section) {
  const model = makeModel(cicadaSections.filter(item => item.name !== section.name));
  const ranks = [];
  for (const sentence of section.sentences) {
    if (sentence.length < 3) continue;
    for (let start = 0; start + 3 <= sentence.length; start += 3) {
      const phrase = sentence.slice(start, start + 3);
      if (!phrase.every(word => dictionary.has(word))) continue;
      let context;
      if (start === 0) context = [BOS, BOS];
      else if (start === 1) context = [BOS, sentence[0]];
      else context = sentence.slice(start - 2, start);
      ranks.push(beamSearch(model, phrase, context, 500, 30, false));
      if (ranks.length >= 5) return ranks;
    }
  }
  return ranks;
}

function evaluateControlPhraseWindows(name, text) {
  const model = makeModel(cicadaSections);
  const ranks = [];
  for (const sentence of parseEnglishSentences(text)) {
    if (sentence.length < 3) continue;
    for (let start = 0; start + 3 <= sentence.length; start += 3) {
      const phrase = sentence.slice(start, start + 3);
      if (!phrase.every(word => dictionary.has(word))) continue;
      let context;
      if (start === 0) context = [BOS, BOS];
      else if (start === 1) context = [BOS, sentence[0]];
      else context = sentence.slice(start - 2, start);
      ranks.push(beamSearch(model, phrase, context, 500, 30, false));
      if (ranks.length >= 5) return { name, ranks };
    }
  }
  return { name, ranks };
}

function evaluateBlindSentences(section) {
  const model = makeModel(cicadaSections.filter(item => item.name !== section.name));
  const ranks = [];
  for (const sentence of section.sentences) {
    if (sentence.length < 3 || sentence.length > 18) continue;
    if (!sentence.every(word => dictionary.has(word))) continue;
    ranks.push(beamSearch(model, sentence, [BOS, BOS], 100, 15, true));
  }
  return { name: section.name, ranks };
}

function summarizeRanks(groups) {
  const ranks = groups.flatMap(group => group.ranks);
  return {
    count: ranks.length,
    top1: ranks.filter(rank => rank === 1).length,
    top10: ranks.filter(rank => rank !== null && rank <= 10).length,
    top100: ranks.filter(rank => rank !== null && rank <= 100).length
  };
}

function sumFields(rows, fields) {
  const out = {};
  for (const field of fields) out[field] = rows.reduce((sum, row) => sum + row[field], 0);
  return out;
}

const heldoutWordResults = cicadaSections.map(evaluateHeldoutSection);
const cicadaWordAggregate = sumFields(heldoutWordResults, [
  'total', 'inVocabulary', 'oov', 'top1', 'top5', 'top10',
  'unigramTop1', 'unigramTop5', 'unigramTop10',
  'trigramContextSeen', 'exactTrigramSeen', 'exactTrigramTop1',
  'trigramContextUnseen', 'trigramContextUnseenTop1',
  'sentenceStarts', 'sentenceStartTop1', 'sentenceStartTop5', 'sentenceStartTop10'
]);

const controls = [
  {
    name: 'Gibran',
    text: read('resources/control/gibran_prophet_58585.txt')
      .slice(read('resources/control/gibran_prophet_58585.txt').indexOf('|Almustafa'))
  },
  {
    name: 'Emerson',
    text: read('resources/control/emerson_essays_2944.txt')
      .slice(read('resources/control/emerson_essays_2944.txt').indexOf('I. HISTORY.'))
  },
  {
    name: 'Blake',
    text: (() => {
      const value = read('resources/control/blake_song_of_liberty_train.txt');
      return value.slice(value.indexOf('BEGIN SOURCE TEXT') + 'BEGIN SOURCE TEXT'.length,
        value.indexOf('END SOURCE TEXT'));
    })()
  },
  {
    name: 'Hapgood',
    text: read('resources/control/hapgood1906_service_excerpts.txt')
      .slice(read('resources/control/hapgood1906_service_excerpts.txt').indexOf('THE BEATITUDES'))
  }
];
const controlWordResults = controls.map(control =>
  evaluateControlWords(control.name, control.text));

const cicadaPhraseResults = cicadaSections.map(section => ({
  name: section.name,
  ranks: evaluatePhraseWindows(section)
}));
const cicadaPhraseAggregate = summarizeRanks(cicadaPhraseResults);
const controlPhraseResults = controls.map(control =>
  evaluateControlPhraseWindows(control.name, control.text));
const controlPhraseAggregate = summarizeRanks(controlPhraseResults);

const blindSentenceResults = cicadaSections.map(evaluateBlindSentences);
const blindSentenceAggregate = summarizeRanks(blindSentenceResults);

assert.deepEqual(cicadaWordAggregate, {
  total: 727,
  inVocabulary: 676,
  oov: 51,
  top1: 129,
  top5: 242,
  top10: 326,
  unigramTop1: 82,
  unigramTop5: 178,
  unigramTop10: 263,
  trigramContextSeen: 200,
  exactTrigramSeen: 60,
  exactTrigramTop1: 29,
  trigramContextUnseen: 476,
  trigramContextUnseenTop1: 84,
  sentenceStarts: 91,
  sentenceStartTop1: 13,
  sentenceStartTop5: 28,
  sentenceStartTop10: 52
});
assert.deepEqual(controlWordResults.map(result => [
  result.name, result.total, result.inVocabulary, result.oov,
  result.top1, result.top5, result.top10,
  result.unigramTop1, result.unigramTop5, result.unigramTop10
]), [
  ['Gibran', 400, 391, 9, 69, 161, 186, 73, 159, 188],
  ['Emerson', 400, 391, 9, 61, 130, 174, 58, 121, 168],
  ['Blake', 353, 326, 27, 48, 92, 114, 54, 91, 113],
  ['Hapgood', 400, 385, 15, 59, 115, 148, 57, 110, 142]
]);
assert.deepEqual(cicadaPhraseAggregate, { count: 35, top1: 1, top10: 3, top100: 3 });
assert.deepEqual(controlPhraseAggregate, { count: 20, top1: 0, top10: 0, top100: 0 });
assert.deepEqual(blindSentenceAggregate, { count: 46, top1: 0, top10: 0, top100: 1 });

const result = {
  classification: 'bounded negative for blind sentence/phrase recovery; no unknown LP2 plaintext or key',
  inputs: {
    solvedSourceRecords: solved.sections.length,
    solvedGpWords: 727,
    dictionaryCoveredWords: 676,
    dictionaryOovWords: 51,
    normalizedGpDictionaryTypes: dictionary.size,
    candidateLp2PlaintextUsed: false
  },
  model: {
    representation: 'Gematria Primus rune tokens; exact GP word lengths and original sentence boundaries',
    languageModel: 'Witten-Bell word trigram backed off to word bigram and TextBlob-derived GP unigram counts',
    cicadaTraining: 'leave one solved source record out; 8 source records train each held-out record',
    sourceBoostPerObservedTrainingToken: SOURCE_BOOST,
    correction: 'unseen contexts explicitly back off; no zero-probability fallback'
  },
  heldoutCicadaWordRanks: cicadaWordAggregate,
  heldoutCicadaWordRanksBySource: heldoutWordResults,
  unrelatedControlWordRanks: controlWordResults,
  phraseRecoveryWithOracleTwoWordPrefix: {
    cicada: cicadaPhraseAggregate,
    cicadaBySource: cicadaPhraseResults,
    controls: controlPhraseAggregate,
    controlsBySource: controlPhraseResults,
    search: 'top-500 beam; exact top-30 length-matched candidate words at each slot; up to five non-overlapping three-word windows per source; actual two-word prefix supplied'
  },
  blindSentenceRecoveryFromSkeleton: {
    aggregate: blindSentenceAggregate,
    bySource: blindSentenceResults,
    search: 'BOS/BOS only; exact original word-length sequence; top-100 beam; top-15 candidate words per slot; sentences of 3–18 words'
  },
  decision: 'The model offers a weak next-word prior after true plaintext context is known, but cannot recover exact phrases from the original length/punctuation skeleton, even when given a true two-word prefix. It does not justify key inference or integration into an unselected cipher family.'
};

console.log(JSON.stringify(result, null, 2));
