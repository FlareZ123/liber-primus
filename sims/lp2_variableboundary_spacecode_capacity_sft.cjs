'use strict';
/**
 * Issue #973: source-native SPACE token and static variable-boundary codec gate.
 * Node.js 22 CommonJS, no external packages, no file writes.
 *
 * Printed LP2 hyphen/spaces are ignored in the unknown ciphertext decoder:
 * this deliberately allows plaintext word boundaries to move arbitrarily.
 * A hypothetical stationary decoder maps a plaintext token (29 GP runes plus
 * SPACE) to a fixed, nonempty GP29 output word of length at most two.
 * The source-visible cumulative-GP29 layer is tested separately.
 *
 * Necessity theorem (regardless of codeword assignment, prefix length,
 * codeword injectivity, and any fixed GP29 alphabet permutation):
 * every plaintext SPACE consumes the first digit of its codeword. If a
 * scope's largest symbol frequency is M, the scope has S<=M true spaces.
 * For N source output digits and codeword lengths <=2, the number of plain
 * tokens T>=N/2, so S/T<=2M/N. Page-specific codebooks may change the
 * first SPACE digit, in which case M is summed over physical page scopes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const source = fs.readFileSync(path.join(root,
  'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8');
const gpIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const SPACE = 29;
assert.equal(corpus.runes.length, 29);
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
assert.equal(pages.length, 55);
const book = pages.flatMap(p => p.indices);
assert.equal(book.length, 12956);

/** @param {number[]} symbols */
function histogram(symbols) {
  const counts = Array(29).fill(0);
  for (const value of symbols) {
    assert(Number.isInteger(value) && value >= 0 && value < 29);
    counts[value]++;
  }
  return counts;
}
/** @param {number[]} symbols */
function maxFrequency(symbols) {
  return Math.max(...histogram(symbols));
}
/** Decode an additive GP29 running sum with initial state F/index 0. 
 * @param {number[]} ciphertext */
function differences(ciphertext) {
  let previous = 0;
  return ciphertext.map(current => {
    const step = (current - previous + 29) % 29;
    previous = current;
    return step;
  });
}
/** @param {number} lo @param {number} hi */
function chapter(lo, hi) {
  return pages.filter(p => p.page >= lo && p.page <= hi).flatMap(p => p.indices);
}
const p57 = source.slice(source.lastIndexOf('ᛈᚪᚱᚪᛒᛚᛖ.'), source.indexOf('§', source.lastIndexOf('ᛈᚪᚱᚪᛒᛚᛖ.')));
assert(p57.startsWith('ᛈᚪᚱᚪᛒᛚᛖ.'));
const chars = [...p57];
const plaintext = [];
for (let i = 0; i < chars.length; i++) {
  const c = chars[i];
  if (gpIndex.has(c)) {
    plaintext.push(gpIndex.get(c));
  } else if (c === '-' || (c === '.' && chars.slice(i + 1).some(x => gpIndex.has(x)))) {
    plaintext.push(SPACE);
  }
}
assert.deepEqual(plaintext.filter(x => x !== SPACE), corpus.pages[57].indices);
assert.equal(plaintext.length, 114);
assert.equal(plaintext.filter(x => x === SPACE).length, 19);

/**
 * A second independently solved LP2 source-text control: the 85-rune p56
 * AN END ciphertext is known to preserve 25 plaintext word boundaries.
 * Unlike p57 it is encrypted, but its exact printed rune/word structure is
 * source-visible and its 25 words match the authentic solved English.
 */
const p56Start = source.lastIndexOf('ᚫᛄ-ᛟᛋᚱ.');
const p57Start = source.lastIndexOf('ᛈᚪᚱᚪᛒᛚᛖ.');
assert(p56Start > 0 && p57Start > p56Start);
const p56Printed = source.slice(p56Start, p57Start);
let p56RuneCount = 0, p56WordCount = 0, p56InsideWord = false;
for (const character of p56Printed) {
  if (gpIndex.has(character)) {
    p56RuneCount++;
    p56InsideWord = true;
  } else if ((character === '-' || character === '.') && p56InsideWord) {
    p56WordCount++;
    p56InsideWord = false;
  }
}
if (p56InsideWord) p56WordCount++;
assert.deepEqual([p56RuneCount,p56WordCount], [85,25]);
assert.deepEqual(corpus.pages[56].indices.length, p56RuneCount);
const p56SpaceCount = p56WordCount - 1;
const nativeCombinedSPACEFraction = (p56SpaceCount + 19)/
  (p56RuneCount + 95 + p56SpaceCount + 19);
assert.equal(nativeCombinedSPACEFraction, 43/223);

/**
 * A fully specified, prefix-free source encoder with a continuous GP29
 * feedback step. The source alphabet is 29 GP tokens plus SPACE:
 * 0..26 -> steps 1..27, 27 -> step 0,
 * 28 -> escape [28,1], SPACE -> escape [28,2].
 * There are exactly 30 source tokens, and every codeword has length 1/2.
 * Unchosen escape suffixes are invalid, never fitted to ciphertext.
 * @param {number[]} tokens
 */
function encodeTokens(tokens) {
  const steps = [];
  for (const token of tokens) {
    assert(Number.isInteger(token) && token >= 0 && token <= SPACE);
    if (token <= 26) steps.push(token + 1);
    else if (token === 27) steps.push(0);
    else steps.push(28, token === 28 ? 1 : 2);
  }
  const cipher = [];
  let previous = 0;
  for (const step of steps) {
    previous = (previous + step) % 29;
    cipher.push(previous);
  }
  return cipher;
}
/**
 * @param {number[]} ciphertext
 * @returns {number[]}
 */
function decodeTokens(ciphertext) {
  const steps = differences(ciphertext);
  const out = [];
  for (let i = 0; i < steps.length; i++) {
    const d = steps[i];
    if (d === 28) {
      assert(i + 1 < steps.length, 'truncated escape');
      const next = steps[++i];
      assert(next === 1 || next === 2, 'invalid escape suffix');
      out.push(next === 1 ? 28 : SPACE);
    } else {
      out.push(d === 0 ? 27 : d - 1);
    }
  }
  return out;
}
const planted = encodeTokens(plaintext);
assert.deepEqual(decodeTokens(planted), plaintext);
assert.equal(differences(planted).length, planted.length);
assert.equal(planted.length, 133); // 95 runes + two-digit codes for 19 spaces
const p57Bound = 2 * maxFrequency(differences(planted)) / planted.length;
assert(p57Bound >= 1 / 6, 'planted source must pass the necessary bound');

/** Count source-forbidden escape continuations without resynchronizing by guess.
 * @param {number[]} original */
function frozenOriginalCheck(original) {
  const steps = differences(original);
  let validEscapes = 0;
  let invalidEscapes = 0;
  let firstInvalid = -1;
  for (let i = 0; i < steps.length; i++) {
    if (steps[i] !== 28) continue;
    const next = steps[i + 1];
    if (next === 1 || next === 2) {
      validEscapes++;
      i++;
    } else {
      invalidEscapes++;
      if (firstInvalid < 0) firstInvalid = i;
      if (i + 1 < steps.length) i++;
    }
  }
  return {n: original.length, maxDirect: maxFrequency(original),
    maxDifference: maxFrequency(steps),
    countEscapeSymbol: histogram(steps)[28],
    validEscapes, invalidEscapes, firstInvalid,
    maxSpaceShareAtCodeLength2: 2 * maxFrequency(steps) / original.length};
}
const directBook = maxFrequency(book);
const diffBook = maxFrequency(differences(book));
const directPageMaxSum = pages.reduce((sum, p) => sum + maxFrequency(p.indices), 0);
const diffPageMaxSum = pages.reduce((sum, p) => sum + maxFrequency(differences(p.indices)), 0);
const spanA = frozenOriginalCheck(chapter(54, 55));
const spanB = frozenOriginalCheck(chapter(3, 7));
const spanC = frozenOriginalCheck(chapter(0, 2));
assert.deepEqual([directBook, diffBook, directPageMaxSum, diffPageMaxSum],
  [492, 510, 767, 801]);
assert.deepEqual([spanA.n, spanB.n, spanC.n], [308, 1145, 729]);
assert.deepEqual([spanA.maxDifference, spanB.maxDifference, spanC.maxDifference],
  [20, 55, 38]);
assert(spanA.invalidEscapes > 0 && spanB.invalidEscapes > 0);
const output = {
  originalBookRunes: book.length,
  printedWords: 2896,
  p57Source: {runes: 95, wordBreaks: 19, tokens: 114,
    spaceTokenFraction: 19 / 114, plantedCipherRunes: planted.length,
    decodedAll114Tokens: true},
  p56Source: {runes:p56RuneCount,words:p56WordCount,spaces:p56SpaceCount,
    spaceTokenFraction:p56SpaceCount/(p56RuneCount+p56SpaceCount)},
  combinedAuthenticSolvedSPACEFraction:nativeCombinedSPACEFraction,
  globalStaticCodewordBound: {
    directMaxSymbol: directBook, deltaMaxSymbol: diffBook,
    maxSpaceTokensDirect: directBook,
    maxSpaceTokensDelta: diffBook,
    maxSpaceFractionIfAtMost2Digits: 2 * diffBook / book.length,
    minExpansionIfAtLeastOneSixthSpaces: book.length / (6 * diffBook)
  },
  separatePhysicalPageCodebooks: {
    directMaxTotal: directPageMaxSum, deltaMaxTotal: diffPageMaxSum,
    maxSpaceTokensDelta: diffPageMaxSum,
    maxSpaceFractionIfAtMost2Digits: 2 * diffPageMaxSum / book.length,
    minExpansionIfAtLeastOneSixthSpaces: book.length / (6 * diffPageMaxSum)
  },
  sourceCipherGate: {pp54_55: spanA, pp3_7: spanB, pp0_2: spanC},
  decision: 'frozen additive-prefix codec structurally fails; every fixed token-codeword family of max length 2 has insufficient space capacity at p57-native 1/6 density'
};

/**
 * Allow each hidden symbol/SPACE codeword to change with a public period
 * of output-rune positions, independently per visible source scope. Drop
 * each scope's first source C as an unconstrained IV (conservative).
 * Every SPACE still begins with one fixed step at its output phase.
 * @param {number[][]} scopes
 * @param {number} period
 * @param {'direct'|'delta'} [representation]
 */
function phaseCapacity(scopes, period, representation='delta') {
  let maxFirst = 0, symbolCount = 0;
  for (const scope of scopes) {
    const buckets = Array.from({length:period}, () => new Uint16Array(29));
    let previous = scope[0];
    for (let i = 1; i < scope.length; i++) {
      const step = representation==='direct' ? scope[i] : (scope[i]-previous+29)%29;
      previous = scope[i];
      buckets[(i-1) % period][step]++;
      symbolCount++;
    }
    for (const bin of buckets) maxFirst += Math.max(...bin);
  }
  return {period, maxFirst, symbolCount,
    maxSpaceFractionL2: 2 * maxFirst / symbolCount};
}
const chapterEnds = [729,1874,3603,5506,6527,7960,9640,12648,12956];
const chapters = [];
let begin = 0;
for (const end of chapterEnds) {
  chapters.push(book.slice(begin,end));
  begin=end;
}
assert.equal(begin,book.length);
assert.equal(chapters.length,9);
/** @param {number[][]} scopes @param {'direct'|'delta'} [representation] */
function firstFeasiblePeriod(scopes,representation='delta',targetFraction=1/6) {
  for (let k=1; k<=300; k++) {
    const b=phaseCapacity(scopes,k,representation);
    if (b.maxSpaceFractionL2>=targetFraction) return b;
  }
  throw new Error('No phase period <=300 can fit native p57 density');
}
const models={
  oneBookCodebook:[book],
  nineVisibleChapterCodebooks:chapters,
  fiftyFivePageCodebooks:pages.map(p=>p.indices),
  originalTerminalChapter:[chapters[8]],
  independentSecondChapter:[chapters[1]]
};
const phaseSourceGate={};
for (const [name,scopes] of Object.entries(models)) {
  phaseSourceGate[name]={
    one:phaseCapacity(scopes,1),
    five:phaseCapacity(scopes,5),
    seven:phaseCapacity(scopes,7),
    sixteen:phaseCapacity(scopes,16),
    firstPermittedAtP57Density:firstFeasiblePeriod(scopes),
    rawAlphabetFirstPermittedAtP57Density:firstFeasiblePeriod(scopes,'direct'),
    rawAlphabetAtFive:phaseCapacity(scopes,5,'direct'),
    combinedNativeFirstPermitted:firstFeasiblePeriod(scopes,'delta',nativeCombinedSPACEFraction),
    rawAlphabetCombinedNativeFirstPermitted:firstFeasiblePeriod(scopes,'direct',nativeCombinedSPACEFraction)
  };
}
assert.deepEqual([
  phaseSourceGate.oneBookCodebook.firstPermittedAtP57Density.period,
  phaseSourceGate.nineVisibleChapterCodebooks.firstPermittedAtP57Density.period,
  phaseSourceGate.fiftyFivePageCodebooks.firstPermittedAtP57Density.period,
  phaseSourceGate.originalTerminalChapter.firstPermittedAtP57Density.period,
  phaseSourceGate.independentSecondChapter.firstPermittedAtP57Density.period
], [152,18,3,3,12]);
assert.deepEqual([
  phaseSourceGate.oneBookCodebook.five.maxFirst,
  phaseSourceGate.nineVisibleChapterCodebooks.five.maxFirst,
  phaseSourceGate.fiftyFivePageCodebooks.five.maxFirst,
  phaseSourceGate.nineVisibleChapterCodebooks.sixteen.maxFirst
], [552,762,1325,1036]);
assert.deepEqual([
  phaseSourceGate.oneBookCodebook.rawAlphabetFirstPermittedAtP57Density.period,
  phaseSourceGate.nineVisibleChapterCodebooks.rawAlphabetFirstPermittedAtP57Density.period,
  phaseSourceGate.fiftyFivePageCodebooks.rawAlphabetFirstPermittedAtP57Density.period,
  phaseSourceGate.originalTerminalChapter.rawAlphabetFirstPermittedAtP57Density.period,
  phaseSourceGate.independentSecondChapter.rawAlphabetFirstPermittedAtP57Density.period
], [164,20,4,4,15]);
assert.deepEqual([
  phaseSourceGate.oneBookCodebook.combinedNativeFirstPermitted.period,
  phaseSourceGate.nineVisibleChapterCodebooks.combinedNativeFirstPermitted.period,
  phaseSourceGate.fiftyFivePageCodebooks.combinedNativeFirstPermitted.period,
  phaseSourceGate.originalTerminalChapter.combinedNativeFirstPermitted.period,
  phaseSourceGate.independentSecondChapter.combinedNativeFirstPermitted.period
], [237,27,5,7,21]);
assert.deepEqual([
  phaseSourceGate.oneBookCodebook.rawAlphabetCombinedNativeFirstPermitted.period,
  phaseSourceGate.nineVisibleChapterCodebooks.rawAlphabetCombinedNativeFirstPermitted.period,
  phaseSourceGate.fiftyFivePageCodebooks.rawAlphabetCombinedNativeFirstPermitted.period,
  phaseSourceGate.originalTerminalChapter.rawAlphabetCombinedNativeFirstPermitted.period,
  phaseSourceGate.independentSecondChapter.rawAlphabetCombinedNativeFirstPermitted.period
], [224,30,5,7,23]);
assert(phaseCapacity([planted],1).maxSpaceFractionL2>=1/6);
assert(phaseCapacity([planted],5).maxSpaceFractionL2>=1/6);
output.phaseChangingCodebookGate={
  sourceSPACEReference:'p57 19/114=1/6 is conditional, not proven for p0-55',
  secondNativeReference:'solved p56 has 85 cipher runes, 25 preserved plaintext words, 24/109 SPACE fraction',
  combinedNativeReference:'solved p56+p57 has 180 rune tokens and 43 within-page spaces, 43/223 combined SPACE fraction',
  clock:'output-rune phase k with first C in each scope as arbitrary IV',
  models:phaseSourceGate,
  caveat:'Only fixed codeword per state and at most 2 output runes per token. Dynamic hidden key, token-index phase, blocks and altered plaintext register remain open.'
};

console.log(JSON.stringify(output, null, 2));
