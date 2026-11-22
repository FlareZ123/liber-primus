#!/usr/bin/env node
'use strict';

// Reproduce the 13-dot / 32x8 word-direction transducer gate.
// Run from any directory: node sims/lp2_13dot32x8_word_direction_gate.cjs

const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const parse = (p) => JSON.parse(read(p));
const mod = (x, m) => ((x % m) + m) % m;

const transcription = read('resources/lp2-transcription.txt');
const gp = parse('resources/liber-primus/lp2-corpus.json');
const ink = parse('resources/liber-primus/lp2-ink-annotations.json');
const grid = parse('resources/liber-primus/base60-grid.json');
const runeIndex = new Map(gp.runes.map((r, i) => [r, i]));
const prime = gp.prime;
const translit = gp.translit;
const RUNIC = /[\u16A0-\u16FF]/u;

// Page markers are ignored here: words and key state carry across page breaks.
// Slash/whitespace are line-layout only; other non-rune characters end a printed word.
const words = [];
let current = '';
let runeOffset = 0;
let wordStart = 0;
function finishWord() {
  if (!current) return;
  const indices = [...current].map((r) => {
    const ix = runeIndex.get(r);
    if (ix === undefined) throw new Error('Rune outside GP alphabet: ' + r);
    return ix;
  });
  words.push({
    text: current,
    indices,
    start: wordStart,
    end: runeOffset,
    length: indices.length,
    primeSum: indices.reduce((s, x) => s + prime[x], 0),
  });
  current = '';
}
for (const ch of transcription) {
  if (RUNIC.test(ch)) {
    if (!current) wordStart = runeOffset;
    current += ch;
    runeOffset++;
  } else if (ch === '%' || ch === '/' || /\s/u.test(ch)) {
    // Layout only; preserve the stream and carry the word across pages.
  } else {
    finishWord();
  }
}
finishWord();

const pageStarts = new Map();
let pageOffset = 0;
for (const page of gp.pages) {
  pageStarts.set(page.page, pageOffset);
  pageOffset += page.runic_count;
}
const markers = [];
for (const page of ink.pages || []) {
  for (const item of page.large_punctuation || []) {
    const [localOffset, dots, color] = item;
    if (dots === 13) {
      markers.push({
        page: page.page,
        localOffset,
        globalOffset: pageStarts.get(page.page) + localOffset,
        color,
      });
    }
  }
}
markers.sort((a, b) => a.globalOffset - b.globalOffset);

const table = grid.byte_rows;
if (table.length !== 32 || table.some((r) => r.length !== 8)) {
  throw new Error('Expected source table to be exactly 32x8');
}
if (runeOffset !== 13136 || words.length !== 2941 || markers.length !== 31) {
  throw new Error('Source counts changed; inspect the corpus before trusting this gate');
}
const markerAtWordBoundary = markers.every((m) =>
  words.some((w) => w.start === m.globalOffset || w.end === m.globalOffset)
);
const cuts = [0, ...markers.map((m) => m.globalOffset), runeOffset];
const intervals = cuts.slice(0, -1).map((a, i) => {
  const b = cuts[i + 1];
  const ws = words.filter((w) => w.start >= a && w.end <= b);
  return { row: i, start: a, end: b, runes: b - a, words: ws.length };
});

function primeDirection(indices) {
  return indices.reduce((s, x) => s + prime[x], 0) % 8;
}

// Literal F is fixed. The other 28 runes form a bijective cyclic alphabet.
// The row is the interval between authentic 13-dot markers.
// The column is the preceding ciphertext word's direction.
function transformWords(inputWords, seedDirection, operation, directionRule = 'prime') {
  let row = 0;
  let markerIndex = 0;
  let previousDirection = seedDirection;
  const output = [];
  for (const word of inputWords) {
    while (
      markerIndex < markers.length &&
      markers[markerIndex].globalOffset <= word.start
    ) {
      row++;
      markerIndex++;
    }
    if (row > 31) throw new Error('Marker row overflow');
    const shift = table[row][previousDirection] % 28;
    const transformed = word.indices.map((x) => {
      if (x === 0) return 0;
      return 1 + mod(
        operation === 'decrypt' ? (x - 1 - shift) : (x - 1 + shift),
        28
      );
    });
    const ciphertextWord = operation === 'encrypt' ? transformed : word.indices;
    previousDirection = directionRule === 'prime'
      ? primeDirection(ciphertextWord)
      : (ciphertextWord.length % 8);
    output.push({
      ...word,
      indices: transformed,
      row,
      direction: previousDirection,
      shift,
    });
  }
  return output;
}

function flatten(wordList) {
  return wordList.flatMap((w) => w.indices);
}
function ioc(values) {
  const f = new Array(29).fill(0);
  for (const x of values) f[x]++;
  return f.reduce((s, n) => s + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}
function transliterate(values) {
  return values.map((x) => translit[x]).join('');
}

const trainingWords = words.filter((w) => w.start < 729);
const decodedPrime = transformWords(trainingWords, 13 % 8, 'decrypt', 'prime');
const decodedLength = transformWords(trainingWords, 13 % 8, 'decrypt', 'length');
const candidate = flatten(decodedPrime);
const wrongCandidate = flatten(decodedLength);

// Source-native GP English trigram model: 70/30 split of three independent
// English controls; non-overlapping 40-rune holdout windows.
const tokens = translit
  .map((token, index) => ({ token, index }))
  .sort((a, b) => b.token.length - a.token.length);
function encodeSourceText(text) {
  const normalized = text.toUpperCase()
    .replace(/QU/g, 'CW')
    .replace(/V/g, 'U')
    .replace(/K/g, 'C')
    .replace(/Z/g, 'S')
    .replace(/Q/g, 'C');
  const out = [];
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      const token = tokens.find((t) => word.startsWith(t.token, i));
      if (!token) throw new Error('Unencodable source text at: ' + word.slice(i));
      out.push(token.index);
      i += token.token.length;
    }
  }
  return out;
}
const sourcePaths = [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt',
];
const sourceSplits = sourcePaths.map((p) => {
  const encoded = encodeSourceText(read(p));
  const split = Math.floor(encoded.length * 0.70);
  return { train: encoded.slice(0, split), test: encoded.slice(split) };
});
const trigramCounts = new Uint32Array(29 ** 3);
for (const source of sourceSplits) {
  for (let i = 0; i + 2 < source.train.length; i++) {
    trigramCounts[
      841 * source.train[i] + 29 * source.train[i + 1] + source.train[i + 2]
    ]++;
  }
}
const trigramTotal = trigramCounts.reduce((a, b) => a + b, 0);
function languageScore(values) {
  let sum = 0;
  for (let i = 0; i + 2 < values.length; i++) {
    const key = 841 * values[i] + 29 * values[i + 1] + values[i + 2];
    sum += Math.log(
      (trigramCounts[key] + 0.5) /
      (trigramTotal + 0.5 * trigramCounts.length)
    );
  }
  return sum / (values.length - 2);
}
const nativeScores = [];
for (const source of sourceSplits) {
  for (let i = 0; i + 40 <= source.test.length; i += 40) {
    nativeScores.push(languageScore(source.test.slice(i, i + 40)));
  }
}
nativeScores.sort((a, b) => a - b);
const nativeP1 = nativeScores[Math.floor(nativeScores.length * 0.01)];
const nativeMedian = nativeScores[Math.floor(nativeScores.length * 0.50)];
const nativeP99 = nativeScores[Math.floor(nativeScores.length * 0.99)];
function windowSummary(values) {
  const scores = [];
  for (let i = 0; i + 40 <= values.length; i++) {
    scores.push({ offset: i, score: languageScore(values.slice(i, i + 40)) });
  }
  scores.sort((a, b) => b.score - a.score);
  return {
    count: scores.length,
    best: scores[0],
    aboveNativeP1: scores.filter((x) => x.score >= nativeP1).length,
  };
}
const p57 = gp.pages.find((p) => p.page === 57).indices;
const p57Scores = [];
for (let i = 0; i + 40 <= p57.length; i += 5) {
  p57Scores.push(languageScore(p57.slice(i, i + 40)));
}

// A source-native 95-rune page-57 plant checks exact forward/inverse mechanics.
// Its initial direction is supplied by the preceding original p56 ciphertext word.
const page57Start = pageStarts.get(57);
const p57Words = words.filter((w) => w.start >= page57Start);
const previousP56Word = words.filter((w) => w.end <= page57Start).at(-1);
const p57Seed = primeDirection(previousP56Word.indices);
const plantCipher = transformWords(p57Words, p57Seed, 'encrypt', 'prime');
const plantRecovered = transformWords(plantCipher, p57Seed, 'decrypt', 'prime');
const plantWrong = transformWords(plantCipher, p57Seed, 'decrypt', 'length');
const p57Original = flatten(p57Words);
const plantRoundTrip = JSON.stringify(flatten(plantRecovered)) === JSON.stringify(p57Original);
const wrongPlantFlat = flatten(plantWrong);
const wrongPlantMatches = wrongPlantFlat.filter((x, i) => x === p57Original[i]).length;

// Alternative 5+3-bit transition-table reading: byte high five bits = next state,
// low three bits = next direction. Test its first locked transition from state 13.
const firstWordDirectionByInterval = intervals.map((interval) => {
  const first = words.find((w) =>
    w.start >= interval.start && w.end <= interval.end
  );
  return first ? primeDirection(first.indices) : null;
});
const automatonDirection = firstWordDirectionByInterval[13];
const automatonCell = table[13][automatonDirection];
const automatonNextState = automatonCell >> 3;
const automatonNextDirection = automatonCell & 7;
const automatonExpectedNextDirection = firstWordDirectionByInterval[automatonNextState];

const markerOffsets = markers.map((m) => m.globalOffset);
const markerPages = {
  unknownPages0to55: markers.filter((m) => m.page <= 55).length,
  solvedPages56to57: markers.filter((m) => m.page >= 56).length,
};
const p0p2 = {
  runes: candidate.length,
  printedWords: decodedPrime.length,
  ioc: ioc(candidate),
  first20DecodedWords: decodedPrime.slice(0, 20).map((w) => transliterate(w.indices)),
  prefix: transliterate(candidate.slice(0, 180)),
  wholeTrigramScore: languageScore(candidate),
  windows40: windowSummary(candidate),
};
const wrongNull = {
  wholeTrigramScore: languageScore(wrongCandidate),
  windows40: windowSummary(wrongCandidate),
};
const result = {
  source: {
    totalRunes: runeOffset,
    totalPrintedWords: words.length,
    unknownRunesPages0to55: 12956,
    unknownPrintedWordsPages0to55: words.filter((w) => w.start < 12956).length,
    markerCount: markers.length,
    markerPages,
    allMarkersAtPrintedWordBoundaries: markerAtWordBoundary,
    markerOffsets,
    intervalCount: intervals.length,
    emptyIntervals: intervals.filter((x) => x.runes === 0).map((x) => x.row),
    intervalRuneLengths: intervals.map((x) => x.runes),
    intervalWordCounts: intervals.map((x) => x.words),
    tableShape: [table.length, table[0].length],
  },
  frozenTransducer: {
    initialDirection: 13 % 8,
    row: 'number of 13-dot markers at or before current printed-word start',
    column: 'previous ciphertext word prime-sum modulo 8',
    shift: 'table[row][column] modulo 28',
    alphabet: 'F (index 0) fixed; indices 1..28 rotate bijectively modulo 28',
    hyphens: 'control boundaries; not emitted as plaintext spaces',
    smallStops: 'preserved punctuation; no key consumption or state reset',
    pageBoundaries: 'carry row and previous-word direction',
  },
  nativeLanguageReference: {
    sources: sourcePaths,
    trainSplit: 0.70,
    holdoutWindowLength: 40,
    nonOverlappingHoldoutWindows: nativeScores.length,
    p1: nativeP1,
    median: nativeMedian,
    p99: nativeP99,
    page57PositiveControl: {
      windowCount: p57Scores.length,
      min: Math.min(...p57Scores),
      max: Math.max(...p57Scores),
    },
  },
  p0to2Training: p0p2,
  wrongGrammarNullPreviousWordLengthModulo8: wrongNull,
  page57Plant: {
    runes: p57Original.length,
    printedWords: p57Words.length,
    initialDirectionFromPrecedingP56CiphertextWord: p57Seed,
    exactForwardInverse: plantRoundTrip,
    wrongGrammarExact: JSON.stringify(wrongPlantFlat) === JSON.stringify(p57Original),
    wrongGrammarMatchingRunes: wrongPlantMatches,
  },
  alternative5plus3Automaton: {
    startState: 13,
    firstWordDirection: automatonDirection,
    cell: automatonCell,
    nextState: automatonNextState,
    nextDirection: automatonNextDirection,
    expectedNextIntervalDirection: automatonExpectedNextDirection,
    matches: automatonNextDirection === automatonExpectedNextDirection,
  },
  holdout: 'p40-p53 not run: the frozen p0-p2 training gate failed',
};
if (!markerAtWordBoundary) throw new Error('A 13-dot marker is not at a word boundary');
if (!plantRoundTrip) throw new Error('Page-57 source-native plant failed exact round-trip');
console.log(JSON.stringify(result, null, 2));
