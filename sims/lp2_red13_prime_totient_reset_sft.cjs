'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const annotations = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const transcript = read('resources/lp2-transcription.txt');
const spellingData = read('resources/control/english_wordfreq_textblob.txt');
const runeMap = new Map(corpus.runes.map((rune, index) => [rune, index]));
const tokens = corpus.translit.map((token, index) => ({ token, index }))
  .sort((a, b) => b.token.length - a.token.length);
const mod29 = (n) => ((n % 29) + 29) % 29;

function encodeWord(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, 'CW').replace(/K/g, 'C').replace(/V/g, 'U')
    .replace(/Z/g, 'S').replace(/ING/g, 'NG').replace(/IO/g, 'IA');
  const result = [];
  for (let i = 0; i < normalized.length;) {
    const found = tokens.find(({ token }) => normalized.startsWith(token, i));
    if (!found) return null;
    result.push(found.index);
    i += found.token.length;
  }
  return result;
}

function parsePageWords(text, page) {
  const matches = text.replace(/\/\s*/gu, '').match(/[\u16A0-\u16FF]+/gu) || [];
  let offset = 0;
  return matches.map((wordText) => {
    const values = [...wordText].map((rune) => {
      const index = runeMap.get(rune);
      assert.notEqual(index, undefined, 'Unknown rune on p' + page);
      return index;
    });
    const word = { page, start: offset, end: offset + values.length, values, text: wordText };
    offset += values.length;
    return word;
  });
}

const pageTexts = transcript.split('%').map((page) => page.trim()).filter(Boolean);
assert.equal(pageTexts.length, 57);
pageTexts.splice(50, 0, '');
assert.equal(pageTexts.length, 58);
const wordsByPage = pageTexts.map(parsePageWords);
for (let page = 0; page < 58; page += 1) {
  assert.deepEqual(wordsByPage[page].flatMap((word) => word.values),
    corpus.pages[page].indices, 'Canonical source mismatch on p' + page);
}

const pageStarts = [];
let pageCursor = 0;
for (let page = 0; page < 58; page += 1) {
  pageStarts[page] = pageCursor;
  pageCursor += corpus.pages[page].runic_count;
}
const unknownRunes = corpus.pages.slice(0, 56)
  .reduce((sum, page) => sum + page.runic_count, 0);
assert.equal(unknownRunes, 12956);
assert.equal(corpus.pages[50].runic_count, 0);

const allWords = wordsByPage.slice(0, 56).flat().map((word) => ({
  ...word,
  globalStart: pageStarts[word.page] + word.start,
  globalEnd: pageStarts[word.page] + word.end
}));

const allRed13 = annotations.pages.flatMap((page) =>
  (page.large_punctuation || [])
    .filter((mark) => mark[1] === 13 && mark[2] === 'red')
    .map((mark) => ({ page: page.page, offset: mark[0], runeCount: page.rune_count }))
);
assert.equal(allRed13.length, 30);
assert.equal(allRed13.filter((m) => m.offset === 0).length, 1);
assert.equal(allRed13.filter((m) => m.offset === m.runeCount).length, 10);
assert.equal(allRed13.filter((m) => m.offset > 0 && m.offset < m.runeCount).length, 19);

const markers = allRed13
  .filter((mark) => mark.page <= 55 && mark.offset < mark.runeCount)
  .map((mark) => ({
    page: mark.page,
    offset: mark.offset,
    global: pageStarts[mark.page] + mark.offset
  }))
  .sort((a, b) => a.global - b.global);
assert.equal(markers.length, 18);
for (const marker of markers) {
  assert.ok(wordsByPage[marker.page].some((word) => word.start === marker.offset),
    'Marker is not at a page-local word start: p' + marker.page + ':' + marker.offset);
}

const runeStream = [];
for (let page = 0; page < 56; page += 1) {
  for (let offset = 0; offset < corpus.pages[page].indices.length; offset += 1) {
    runeStream.push({
      value: corpus.pages[page].indices[offset],
      page, offset, global: pageStarts[page] + offset
    });
  }
}
assert.equal(runeStream.length, unknownRunes);

const boundaries = [0, ...markers.map((marker) => marker.global)]
  .sort((a, b) => a - b)
  .filter((value, index, values) => index === 0 || value !== values[index - 1]);
const segmentRanges = boundaries.map((start, index) => ({
  start, end: boundaries[index + 1] === undefined ? unknownRunes : boundaries[index + 1]
}));
assert.equal(segmentRanges.length, 19);

const composite = new Uint8Array(200000);
for (let prime = 2; prime * prime < composite.length; prime += 1) {
  if (composite[prime]) continue;
  for (let multiple = prime * prime; multiple < composite.length; multiple += prime) {
    composite[multiple] = 1;
  }
}
const primes = [];
for (let value = 2; value < composite.length; value += 1) {
  if (!composite[value]) primes.push(value);
}
assert.ok(primes.length > unknownRunes);
const key = primes.map((prime) => mod29(prime - 1));

const lexicon = new Map();
for (const line of spellingData.match(/^[a-z]+\s+\d+$/gm) || []) {
  const [word, count] = line.split(/\s+/u);
  const encoded = encodeWord(word);
  if (!encoded) continue;
  const encodedKey = encoded.join(',');
  lexicon.set(encodedKey, (lexicon.get(encodedKey) || 0) + Number(count));
}
assert.equal(lexicon.size, 29058);

function sumCounts(states) {
  let total = 0n;
  for (const count of states.values()) total += count;
  return total;
}

function analyzeRange(start, end) {
  let states = new Map([[0, 1n]]);
  let maxStateCount = 1;
  let failure = null;
  for (let index = start; index < end; index += 1) {
    const item = runeStream[index];
    const next = new Map();
    const add = (used, count) => next.set(used, (next.get(used) || 0n) + count);
    for (const [used, count] of states) {
      if (item.value === 0) add(used, count);
      const plaintext = mod29(item.value - key[used]);
      if (plaintext !== 0) add(used + 1, count);
    }
    if (next.size === 0) {
      const candidates = [...states.keys()].map((used) => ({
        consumed: used,
        nextPrime: primes[used],
        shift: key[used],
        plaintext: mod29(item.value - key[used])
      }));
      assert.ok(candidates.every((candidate) => candidate.plaintext === 0));
      failure = {
        ...item,
        priorStates: [...states.keys()],
        partialPathCount: sumCounts(states).toString(),
        candidates
      };
      break;
    }
    states = next;
    maxStateCount = Math.max(maxStateCount, states.size);
  }
  return {
    complete: failure === null,
    pathCount: sumCounts(states).toString(),
    states: [...states.keys()],
    maxStateCount,
    failure
  };
}

function analyzeValues(values) {
  let states = new Map([[0, 1n]]);
  let failure = null;
  for (let offset = 0; offset < values.length; offset += 1) {
    const ciphertext = values[offset];
    const next = new Map();
    const add = (used, count) => next.set(used, (next.get(used) || 0n) + count);
    for (const [used, count] of states) {
      if (ciphertext === 0) add(used, count);
      const plaintext = mod29(ciphertext - key[used]);
      if (plaintext !== 0) add(used + 1, count);
    }
    if (next.size === 0) {
      failure = { offset, priorStates: [...states.keys()] };
      break;
    }
    states = next;
  }
  return { complete: failure === null, pathCount: sumCounts(states).toString(),
    states: [...states.keys()], failure };
}

function encrypt(plaintext) {
  let consumed = 0;
  return plaintext.map((value) => {
    if (value === 0) return 0;
    return mod29(value + key[consumed++]);
  });
}

function lexicalDecode(inputWords) {
  let states = new Map([[0, {
    score: 0, plaintext: [], literalF: [], dictionaryHits: 0, dictionaryCoveredRunes: 0
  }]]);
  let processedWords = 0;

  for (const word of inputWords) {
    const next = new Map();
    for (const [consumed, previous] of states) {
      let branches = [{ consumed, plaintext: [], literalF: [] }];
      for (let runeIndex = 0; runeIndex < word.values.length; runeIndex += 1) {
        const ciphertext = word.values[runeIndex];
        const expanded = [];
        for (const branch of branches) {
          if (ciphertext === 0) {
            expanded.push({
              consumed: branch.consumed,
              plaintext: branch.plaintext.concat([0]),
              literalF: branch.literalF.concat([word.globalStart + runeIndex])
            });
          }
          const plaintext = mod29(ciphertext - key[branch.consumed]);
          if (plaintext !== 0) {
            expanded.push({
              consumed: branch.consumed + 1,
              plaintext: branch.plaintext.concat([plaintext]),
              literalF: branch.literalF
            });
          }
        }
        branches = expanded;
      }
      for (const branch of branches) {
        const frequency = lexicon.get(branch.plaintext.join(',')) || 0;
        const score = previous.score + (frequency ? Math.log1p(frequency) : -8);
        const candidate = {
          score,
          plaintext: previous.plaintext.concat(branch.plaintext),
          literalF: previous.literalF.concat(branch.literalF),
          dictionaryHits: previous.dictionaryHits + Number(frequency > 0),
          dictionaryCoveredRunes: previous.dictionaryCoveredRunes +
            (frequency ? word.values.length : 0)
        };
        const old = next.get(branch.consumed);
        if (!old || score > old.score) next.set(branch.consumed, candidate);
      }
    }
    if (next.size === 0) break;
    states = next;
    processedWords += 1;
  }

  const best = [...states.values()].sort((a, b) =>
    b.score - a.score ||
    b.dictionaryCoveredRunes - a.dictionaryCoveredRunes ||
    b.dictionaryHits - a.dictionaryHits
  )[0];
  return {
    processedWords,
    score: best.score,
    dictionaryHits: best.dictionaryHits,
    dictionaryCoveredRunes: best.dictionaryCoveredRunes,
    plaintext: best.plaintext,
    plaintextText: best.plaintext.map((value) => corpus.translit[value]).join(''),
    literalF: best.literalF
  };
}

const coordinate = (item) => item ? { page: item.page, offset: item.offset } : null;
const segments = segmentRanges.map((range, index) => {
  const analysis = analyzeRange(range.start, range.end);
  const prefixEnd = analysis.failure ? analysis.failure.global : range.end;
  const prefixWords = allWords.filter((word) =>
    word.globalStart >= range.start && word.globalEnd <= prefixEnd
  );
  const lexical = lexicalDecode(prefixWords);
  if (analysis.complete) assert.equal(lexical.plaintext.length, range.end - range.start);
  const expectedCipher = runeStream.slice(range.start, range.start + lexical.plaintext.length)
    .map((item) => item.value);
  const forwardReplay = encrypt(lexical.plaintext);
  assert.deepEqual(forwardReplay, expectedCipher, 'Prefix replay failed in segment ' + index);

  return {
    index,
    start: coordinate(runeStream[range.start]),
    end: coordinate(runeStream[range.end - 1]),
    length: range.end - range.start,
    complete: analysis.complete,
    completePathCount: analysis.complete ? analysis.pathCount : '0',
    partialPathCount: analysis.complete ? null : analysis.pathCount,
    finalStates: analysis.states,
    maxStateCount: analysis.maxStateCount,
    firstImpossible: analysis.failure ? {
      ...coordinate(analysis.failure),
      cipherIndex: analysis.failure.value,
      cipherRune: corpus.runes[analysis.failure.value],
      priorConsumedStates: analysis.failure.priorStates,
      partialPathCount: analysis.failure.partialPathCount,
      candidates: analysis.failure.candidates
    } : null,
    lexical: {
      processedWords: lexical.processedWords,
      score: Number(lexical.score.toFixed(6)),
      dictionaryHits: lexical.dictionaryHits,
      dictionaryCoveredRunes: lexical.dictionaryCoveredRunes,
      plaintextRunes: lexical.plaintext.length,
      plaintextText: lexical.plaintextText,
      literalFGlobalOffsets: lexical.literalF,
      forwardReplay
    }
  };
});

const completeSegments = segments.filter((segment) => segment.complete);
const failedSegments = segments.filter((segment) => !segment.complete);
const totalCompleteRunes = completeSegments.reduce((sum, segment) => sum + segment.length, 0);
const longestCompleteSegment = Math.max(...completeSegments.map((segment) => segment.length));
const maxCompleteCoverage = Math.max(
  ...completeSegments.map((segment) => segment.lexical.dictionaryCoveredRunes)
);
const maxFailedPrefixCoverage = Math.max(
  ...failedSegments.map((segment) => segment.lexical.dictionaryCoveredRunes)
);
assert.equal(completeSegments.length, 7);
assert.equal(failedSegments.length, 11);
assert.equal(totalCompleteRunes, 131);
assert.equal(longestCompleteSegment, 81);
assert.equal(maxCompleteCoverage, 2);
assert.equal(maxFailedPrefixCoverage, 4);
assert.equal(segments[1].firstImpossible.page, 0);
assert.equal(segments[1].firstImpossible.offset, 56);
assert.equal(segments[1].firstImpossible.cipherIndex, 18);
assert.deepEqual(segments[1].firstImpossible.priorConsumedStates, [43]);
assert.equal(segments[1].firstImpossible.candidates[0].nextPrime, 193);
assert.equal(segments[1].firstImpossible.candidates[0].shift, 18);
assert.equal(segments[1].lexical.processedWords, 10);
assert.equal(segments[1].lexical.plaintextRunes, 43);
assert.equal(segments[1].lexical.dictionaryHits, 0);

const noReset = analyzeRange(0, unknownRunes);
assert.equal(noReset.complete, false);
assert.equal(noReset.failure.page, 0);
assert.equal(noReset.failure.offset, 235);
assert.deepEqual(noReset.failure.priorStates, [231]);
const noResetWords = allWords.filter((word) =>
  word.globalStart >= 0 && word.globalEnd <= noReset.failure.global
);
const noResetLexical = lexicalDecode(noResetWords);
assert.equal(noResetLexical.plaintext.length, 235);
assert.deepEqual(encrypt(noResetLexical.plaintext),
  runeStream.slice(0, noResetLexical.plaintext.length).map((item) => item.value));

const knownP56 = (
  'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE ' +
  'THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE'
).split(/\s+/u).flatMap(encodeWord);
assert.equal(knownP56.length, 85);
const p56Cipher = corpus.pages[56].indices;
assert.deepEqual(encrypt(knownP56), p56Cipher);
assert.deepEqual(p56Cipher.flatMap((value, index) => value === 0 ? [index] : []),
  [35, 47, 51, 56, 74]);
assert.deepEqual(knownP56.flatMap((value, index) => value === 0 ? [index] : []), [56]);
const p56Reachability = analyzeValues(p56Cipher);
assert.equal(p56Reachability.complete, true);
assert.equal(p56Reachability.pathCount, '22');
const p56Words = wordsByPage[56].map((word) => ({
  ...word, globalStart: pageStarts[56] + word.start
}));
const p56Lexical = lexicalDecode(p56Words);
assert.deepEqual(p56Lexical.plaintext, knownP56);
assert.equal(p56Lexical.plaintext.length, 85);
assert.deepEqual(encrypt(p56Lexical.plaintext), p56Cipher);
assert.deepEqual(p56Lexical.literalF.map((global) => global - pageStarts[56]), [56]);
assert.equal(p56Lexical.dictionaryHits, 24);
assert.equal(p56Lexical.dictionaryCoveredRunes, 79);
assert.equal(corpus.pages[57].runic_count, 95);

console.log(JSON.stringify({
  model: 'every nonterminal red13 resets p56 phi(prime), first prime 2; plaintext F transparent',
  unknownPages: 'p0-p55; p50 numeric-only; page boundaries do not reset',
  unknownRunes,
  originalRed13Marks: allRed13.length,
  red13Distribution: {
    internal: allRed13.filter((m) => m.offset > 0 && m.offset < m.runeCount).length,
    terminal: allRed13.filter((m) => m.offset === m.runeCount).length,
    pageStart: allRed13.filter((m) => m.offset === 0).length
  },
  markers: markers.map(({ page, offset }) => ({ page, offset })),
  segments,
  totals: {
    segments: segments.length,
    completeSegments: completeSegments.length,
    failedSegments: failedSegments.length,
    completeSegmentRunes: totalCompleteRunes,
    longestCompleteSegment,
    maxDictionaryCoveredRunesInCompleteSegment: maxCompleteCoverage,
    maxDictionaryCoveredRunesInFailedPrefix: maxFailedPrefixCoverage
  },
  noResetBaseline: {
    complete: noReset.complete,
    firstImpossible: {
      ...coordinate(noReset.failure),
      cipherIndex: noReset.failure.value,
      cipherRune: corpus.runes[noReset.failure.value],
      priorConsumedStates: noReset.failure.priorStates,
      partialPathCount: noReset.failure.partialPathCount,
      candidates: noReset.failure.candidates
    },
    prefixWords: noResetLexical.processedWords,
    dictionaryHits: noResetLexical.dictionaryHits,
    dictionaryCoveredRunes: noResetLexical.dictionaryCoveredRunes,
    score: Number(noResetLexical.score.toFixed(6))
  },
  p56PositiveControl: {
    originalCipherRunes: p56Cipher.length,
    exactForwardReplay: true,
    legalTransparentFPaths: p56Reachability.pathCount,
    ciphertextFPositions: [35, 47, 51, 56, 74],
    authenticPlaintextFPosition: 56,
    lexicalViterbiMatchesKnownPlaintext: true,
    dictionaryHits: p56Lexical.dictionaryHits,
    dictionaryCoveredRunes: p56Lexical.dictionaryCoveredRunes,
    score: Number(p56Lexical.score.toFixed(6))
  },
  p57ClearControlRunes: corpus.pages[57].runic_count
}, null, 2));
