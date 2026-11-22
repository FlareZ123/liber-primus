'use strict';

// Source-fixed 13/31 LCG traversal over the 32 full-text fragments.
// Inputs are the original LP2 rune corpus and original two-ink annotations.
// The F31 helper supplies the canonical marker boundaries and fixed GP
// trigram model; no parameter is fitted to LP2 ciphertext.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(ROOT, name), 'utf8');

const {
  originalFragments,
  languageScore,
  normalizedIoC
} = require('./lp2_f31_fragment_key_inverse.cjs');

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const pages = corpus.pages;
const full = pages.flatMap((page) => page.indices);
const unknown = pages.filter((page) => page.page < 56).flatMap((page) => page.indices);
const { lengths: redFragmentLengths, bounds } = originalFragments();

assert.equal(pages.length, 58);
assert.equal(full.length, 13136);
assert.equal(unknown.length, 12956);
assert.deepEqual(unknown, full.slice(0, 12956));
assert.equal(bounds.length, 32);
assert.equal(bounds[28], unknown.length);

const fullBoundaries = [...bounds, full.length];
const fullFragments = bounds.map((start, i) => full.slice(start, fullBoundaries[i + 1]));
const fullLengths = fullFragments.map((fragment) => fragment.length);
assert.equal(fullFragments.length, 32);
assert.equal(fullLengths.reduce((a, b) => a + b, 0), 13136);
assert.deepEqual(fullLengths, [
  13, 716, 16, 103, 3, 690, 11, 308, 0, 14, 1729, 0, 9, 11, 1883, 16,
  1005, 19, 1414, 10, 81, 8, 1460, 3, 118, 3008, 9, 299, 5, 80, 7, 88
]);
assert.deepEqual(fullLengths.map((n, i) => n === 0 ? i : -1).filter((i) => i >= 0), [8, 11]);

// Reconstruct the 32 red-only fragments independently, preserving the
// source event convention: a coincident 13-dot mark precedes a red rune.
const pageByNumber = new Map(pages.map((page) => [page.page, page]));
const events = [];
for (const page of ink.pages) {
  for (const span of page.red_spans || []) {
    for (let i = 0; i < span.length; i++) {
      events.push({ page: page.page, offset: span.start + i, kind: 1 });
    }
  }
  for (const mark of page.large_punctuation || []) {
    if (mark[1] === 13) events.push({ page: page.page, offset: mark[0], kind: 0 });
  }
}
events.sort((a, b) => a.page - b.page || a.offset - b.offset || a.kind - b.kind);
const redFragments = [[]];
for (const event of events) {
  if (event.kind === 0) {
    redFragments.push([]);
  } else {
    redFragments[redFragments.length - 1].push(
      pageByNumber.get(event.page).indices[event.offset]
    );
  }
}
assert.equal(redFragments.length, 32);
assert.deepEqual(redFragments.map((fragment) => fragment.length), redFragmentLengths);
assert.equal(redFragments.flat().length, 225);

// Five-slot ornaments give 13 and 31 under the documented binary reading;
// 31 marks therefore define 32 chronological full-text fragments.
const lcgOrder = [];
const seen = new Set();
let state = 0;
for (let i = 0; i < 32; i++) {
  lcgOrder.push(state);
  seen.add(state);
  state = (13 * state + 31) % 32;
}
const inverseOrder = Array.from({ length: 32 }, (_, i) => lcgOrder.indexOf(i));
assert.equal(seen.size, 32);
assert.equal(state, 0);
assert.equal(31 % 2, 1);
assert.equal(13 % 4, 1);

const concat = (ids, fragments) => ids.flatMap((id) => fragments[id]);
const forwardUnknownOrder = lcgOrder.filter((id) => id < 28);
const inverseUnknownOrder = inverseOrder.filter((id) => id < 28);
const forwardUnknown = concat(forwardUnknownOrder, fullFragments);
const inverseUnknown = concat(inverseUnknownOrder, fullFragments);
assert.equal(forwardUnknown.length, 12956);
assert.equal(inverseUnknown.length, 12956);

// Authentic solved-tail positive control.
// p56 wording is the independent regression fixture; p57 is the exact
// rune transcription from Wulfic/Cicada3301-Liber_Primus page_74/runes.txt.
// Keep the rune spelling TUNNELNG rather than normalizing it to English.
const alphabet = corpus.translit;
const sortedTokens = alphabet
  .map((token, index) => ({ token, index }))
  .sort((a, b) => b.token.length - a.token.length);

function toGpRunes(words) {
  const runes = [];
  for (const word of words.split(' ')) {
    for (let i = 0; i < word.length;) {
      const match = sortedTokens.find(({ token }) => word.startsWith(token, i));
      assert.ok(match, 'No GP spelling for ' + word.slice(i));
      runes.push(match.index);
      i += match.token.length;
    }
  }
  return runes;
}

const p56 = toGpRunes(
  'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE'
);
const p57RuneString =
  'ᛈᚪᚱᚪᛒᛚᛖᛚᛁᚳᛖᚦᛖᛁᚾᛋᛏᚪᚱᛏᚢᚾᚾᛖᛚᛝᛏᚩᚦᛖᛋᚢᚱᚠᚪᚳᛖᚹᛖᛗᚢᛋᛏᛋᚻᛖᛞᚩᚢᚱᚩᚹᚾᚳᛁᚱᚳᚢᛗᚠᛖᚱᛖᚾᚳᛖᛋᚠᛁᚾᛞᚦᛖᛞᛁᚢᛁᚾᛁᛏᚣᚹᛁᚦᛁᚾᚪᚾᛞᛖᛗᛖᚱᚷᛖ';
const p57 = Array.from(p57RuneString).map((rune) => corpus.runes.indexOf(rune));
assert.equal(p56.length, 85);
assert.equal(p57.length, 95);
assert.ok(p57.every((rune) => rune >= 0));

const tailFragments = new Map([
  [28, p56.slice(0, 5)],
  [29, p56.slice(5)],
  [30, p57.slice(0, 7)],
  [31, p57.slice(7)]
]);
assert.deepEqual([28, 29, 30, 31].map((id) => tailFragments.get(id).length), [5, 80, 7, 88]);

const forwardTailOrder = lcgOrder.filter((id) => id >= 28);
const inverseTailOrder = inverseOrder.filter((id) => id >= 28);
const forwardTail = forwardTailOrder.flatMap((id) => tailFragments.get(id));
const inverseTail = inverseTailOrder.flatMap((id) => tailFragments.get(id));
const expectedTail = p56.concat(p57);
const rotationStart = 92; // p56's 85 runes plus p57's first 7 runes
const expectedRotation = expectedTail.slice(rotationStart).concat(expectedTail.slice(0, rotationStart));
assert.deepEqual(forwardTail, expectedRotation);
assert.deepEqual(inverseTail, expectedRotation);

const rawScore = languageScore(unknown);
const forwardScore = languageScore(forwardUnknown);
const inverseScore = languageScore(inverseUnknown);
const rawIoC = normalizedIoC(unknown);
const forwardIoC = normalizedIoC(forwardUnknown);
const inverseIoC = normalizedIoC(inverseUnknown);
assert.equal(rawIoC, forwardIoC);
assert.equal(rawIoC, inverseIoC);

// Deterministic null: 1,000 uniformly shuffled orders of the 28 unknown
// fragments, with fixed fragment contents and lengths.
let rngState = 0x13311f31 >>> 0;
function random() {
  rngState ^= rngState << 13;
  rngState ^= rngState >>> 17;
  rngState ^= rngState << 5;
  return (rngState >>> 0) / 4294967296;
}
const ids = Array.from({ length: 28 }, (_, i) => i);
const nullScores = [];
for (let trial = 0; trial < 1000; trial++) {
  const shuffled = ids.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  nullScores.push(languageScore(concat(shuffled, fullFragments)));
}
const nullMean = nullScores.reduce((a, b) => a + b, 0) / nullScores.length;
const nullSd = Math.sqrt(
  nullScores.reduce((a, b) => a + (b - nullMean) ** 2, 0) / (nullScores.length - 1)
);
const pForward = (1 + nullScores.filter((score) => score >= forwardScore).length) / 1001;
const pInverse = (1 + nullScores.filter((score) => score >= inverseScore).length) / 1001;

// The same LCG applied to the 225 red-only runes is a distinct, bounded
// control of the earlier red-fragment suggestion.
const redChronological = redFragments.flat();
const redForward = concat(lcgOrder, redFragments);
const redInverse = concat(inverseOrder, redFragments);
const translit = (runes) => runes.map((rune) => alphabet[rune]).join('');

const output = {
  source: {
    physicalPages: pages.length,
    totalRunes: full.length,
    unresolvedRunes: unknown.length,
    thirteenDotMarkers: marksCount(events),
    fullTextFragments: fullFragments.length,
    fullTextFragmentLengths: fullLengths,
    emptyFullTextFragments: [8, 11],
    redRunes: redChronological.length,
    redFragmentLengths,
    emptyRedFragmentIndices: redFragments.map((fragment, i) => fragment.length === 0 ? i : -1).filter((i) => i >= 0)
  },
  lcg: {
    recurrence: 'x_(n+1) = 13*x_n + 31 mod 32; x_0 = 0',
    order: lcgOrder,
    inverseOrder,
    distinctStates: seen.size,
    cycleEnd: state,
    fullPeriodConditions: { incrementOdd: true, multiplierCongruentOneModFour: true },
    forwardEmptyFragmentOutputPositions: lcgOrder.map((id, i) => fullLengths[id] === 0 ? i : -1).filter((i) => i >= 0),
    inverseEmptyFragmentOutputPositions: inverseOrder.map((id, i) => fullLengths[id] === 0 ? i : -1).filter((i) => i >= 0)
  },
  solvedTailControl: {
    p56Runes: p56.length,
    p57Runes: p57.length,
    fragmentIdsInForwardOrder: forwardTailOrder,
    fragmentIdsInInverseOrder: inverseTailOrder,
    fragmentLengths: [5, 80, 7, 88],
    exactForwardCyclicRotation: true,
    exactInverseCyclicRotation: true,
    rotationStartInConcatenatedTail: rotationStart,
    outputTransliteration: translit(forwardTail)
  },
  unknownDirectTransposition: {
    rawGpTrigramMeanLogLikelihood: rawScore,
    forwardLcg: forwardScore,
    inverseLcg: inverseScore,
    randomPermutationNull: { n: nullScores.length, seed: '0x13311f31', mean: nullMean, sd: nullSd, pForward, pInverse },
    normalizedIoC: { raw: rawIoC, forward: forwardIoC, inverse: inverseIoC }
  },
  redOnlyDirectTransposition: {
    rawGpTrigramMeanLogLikelihood: languageScore(redChronological),
    forwardLcg: languageScore(redForward),
    inverseLcg: languageScore(redInverse),
    forwardTransliteration: translit(redForward),
    inverseTransliteration: translit(redInverse)
  },
  status: 'STRUCTURAL_TAIL_MATCH; NO_UNKNOWN_PLAINTEXT'
};

function marksCount(allEvents) {
  return allEvents.filter((event) => event.kind === 0).length;
}

process.stdout.write(JSON.stringify(output, null, 2) + '\n');
