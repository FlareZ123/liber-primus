'use strict';

/**
 * Native-source terminal F/root-24 correspondence.
 * Read-only, single-file CJS experiment. No secret or language-score fitting.
 *
 * Source: original LP2 p55-p57 rune indices and printed pp49-51 32x8 tokens.
 * The numerical GP29 root 24 comes from the independent original p39 red
 * quadratic 15(X-24)^2; its placement here is a retrospective hypothesis.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const table = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-grid-256.json'), 'utf8'));
const tokens = table.pages.flatMap((page) => page.tokens);
const radix59 = table.alphabet.replace('f', '');
const p55 = corpus.pages.find((page) => page.page === 55).indices;
const p56 = corpus.pages.find((page) => page.page === 56).indices;
const p57 = corpus.pages.find((page) => page.page === 57).indices;
assert.deepEqual([p55.length, p56.length, p57.length], [76, 85, 95]);
assert.equal(table.bytes.length, 256);
assert.equal(tokens.length, 256);
assert.equal(corpus.translit[24], 'A');

/** @param {number} n @returns {boolean} */
function isPrime(n) {
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return n >= 2;
}

/** @param {number} count @returns {number[]} */
function phiPrimeShifts(count) {
  const shifts = [];
  for (let i = 2; shifts.length < count; i++) {
    if (isPrime(i)) shifts.push(i - 1);
  }
  return shifts;
}
const shifts = phiPrimeShifts(100);

/** @param {number} cell @param {'base60'|'base59'} codec @returns {number} */
function value(cell, codec) {
  if (codec === 'base60') return table.bytes[cell];
  const t = tokens[cell];
  const hi = radix59.indexOf(t[0]);
  const lo = radix59.indexOf(t[1]);
  assert(hi >= 0 && lo >= 0);
  return 59 * hi + lo;
}

/** @param {number[]} cipher @param {number} globalStart @param {'base60'|'base59'} codec @returns {number[]} */
function markedLiteralFs(cipher, globalStart, codec) {
  return cipher.flatMap((v, i) =>
    v === 0 && value(globalStart + i, codec) % 29 === 24 ? [i] : []);
}

/**
 * Source-established 'AN END' transformation: C - phi(prime) mod 29,
 * except that marked literal F stays F and consumes no prime step.
 *
 * @param {number[]} cipher
 * @param {number[]} skipOffsets
 * @returns {{plaintext:number[], consumed:number, nonSkippedF:number[]}}
 */
function decode(cipher, skipOffsets) {
  const skip = new Set(skipOffsets);
  const plaintext = [];
  const nonSkippedF = [];
  let k = 0;
  cipher.forEach((c, i) => {
    if (skip.has(i)) {
      assert.equal(c, 0, 'transparent GP-F must be printed as GP-F');
      plaintext.push(0);
      return;
    }
    const p = ((c - shifts[k++] % 29) + 29) % 29;
    plaintext.push(p);
    if (p === 0) nonSkippedF.push(i);
  });
  return { plaintext, consumed: k, nonSkippedF };
}

/** @param {number[]} a @param {number[]} b @returns {number} */
function equalCount(a, b) {
  assert.equal(a.length, b.length);
  return a.reduce((s, x, i) => s + Number(x === b[i]), 0);
}

/** @param {number[]} v @returns {number} */
function coincidence(v) {
  const counts = Array(29).fill(0);
  for (const x of v) counts[x]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) / (v.length * (v.length - 1));
}

const marked55 = markedLiteralFs(p55, 0, 'base60');
const marked56 = markedLiteralFs(p56, 76, 'base60');
const marked59_55 = markedLiteralFs(p55, 0, 'base59');
const marked59_56 = markedLiteralFs(p56, 76, 'base59');
assert.deepEqual(marked55, [25]);
assert.deepEqual(marked56, [56]);
assert.deepEqual(marked59_55, []);
assert.deepEqual(marked59_56, [47]);


/*
 * A second, independently original-visible register: the p55 six-rune
 * closing bookend is a verbatim occurrence from p27, beginning at p55
 * offset 70. It sits on the same exact printed grid token 2n = 169
 * as p56's independently known transparent-F site at global index 132.
 */
const p27 = corpus.pages.find((page) => page.page === 27).indices;
const twoNPositions = table.bytes.flatMap((byte, i) => byte === 169 ? [i] : []);
assert.deepEqual(twoNPositions, [70, 132]);
assert.equal(tokens[70], '2n');
assert.equal(tokens[132], '2n');
assert.deepEqual(p55.slice(70, 76), p27.slice(28, 34));
assert.equal(p55.slice(70, 76).map((v) => corpus.translit[v]).join(''), 'DJUBEI');

const rootCells = table.bytes.flatMap((b, i) => b % 29 === 24 ? [i] : []);
assert.deepEqual(rootCells, [25, 70, 79, 86, 90, 132, 163, 246]);
const center = [123, 124, 131, 132];
assert(center.includes(76 + marked56[0]));
assert.equal(value(132, 'base60'), 169);
assert.equal(value(132, 'base60') % 29, 24);

const knownPlain = decode(p56, [56]);
const from60 = decode(p56, marked56);
const from59 = decode(p56, marked59_56);
const toLatin = (a) => a.map((x) => corpus.translit[x]).join('');
const expected = 'ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE';
assert.equal(toLatin(knownPlain.plaintext), expected);
assert.equal(knownPlain.consumed, 84);
assert.equal(from60.consumed, 84);
assert.deepEqual(from60.plaintext, knownPlain.plaintext);
assert.equal(equalCount(from59.plaintext, knownPlain.plaintext), 75);
assert.deepEqual(from59.plaintext.flatMap((v, i) =>
  v !== knownPlain.plaintext[i] ? [i] : []), [47,48,49,50,51,52,53,54,55,56]);
assert.deepEqual(from60.nonSkippedF, []);

const predicted55 = decode(p55, marked55);
assert.equal(predicted55.consumed, 75);
assert.deepEqual(predicted55.nonSkippedF, [28, 62]);
assert(Math.abs(coincidence(predicted55.plaintext) - 0.03859649122807018) < 1e-12);


/*
 * Hard lexical holdout for the proposed p55 F25 bypass. The actual p55
 * source word is a single 12-rune printed token, with F at offset one.
 * A candidate native-English, word-preserving decipherment must retain
 * that very uncommon second-position F under the proposed transparent
 * exception rule. These control texts are descriptive language priors,
 * never fitted keys or authenticated plaintext.
 */
const transcript = fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8');
const p55Source = transcript.split('%')[54];
const nativeRunes = new Set(corpus.runes);
const p55PrintedWords = p55Source.split(/[-.\/\s]+/u)
  .map((word) => [...word].filter((rune) => nativeRunes.has(rune)))
  .filter((word) => word.length);
let offset = 0;
let predictedFWord = null;
for (const w of p55PrintedWords) {
  if (offset <= 25 && 25 < offset + w.length) {
    predictedFWord = { start: offset, end: offset + w.length - 1,
      length: w.length, positionOfF: 25 - offset, runes: w.join('') };
  }
  offset += w.length;
}
assert.equal(offset, 76);
assert.deepEqual([predictedFWord.start, predictedFWord.end,
  predictedFWord.length, predictedFWord.positionOfF], [24, 35, 12, 1]);

/** @param {string} source @param {boolean} sourceNative @returns {{native12:number,secondF:number,soleF:number,examples:string[]}} */
function longWordSecondFCensus(source, sourceNative = false) {
  const words = source.toUpperCase().match(/\b[A-Z]{2,}\b/g) || [];
  let native12 = 0;
  let secondF = 0;
  let soleF = 0;
  const examples = new Set();
  for (const word of words) {
    // Source-native solved LP1 spells QU as CW (one replacement for both letters).
    const gpLatin = word.replace(/QU/g, 'CW').replace(/[KVZQ]/g, (letter) =>
      ({ K: 'C', V: 'U', Z: 'S', Q: 'C' })[letter]);
    // LP1 p10–p13 and clear LP2 p57 attest single-rune ING and IO.
    const gp = gpLatin.match(sourceNative
      ? /ING|TH|NG|EO|OE|AE|IA|EA|IO|[A-Z]/g
      : /TH|NG|EO|OE|AE|IA|EA|[A-Z]/g);
    if (gp?.length === 12) {
      native12++;
      if (gp[1] === 'F') {
        secondF++;
        if (gp.filter((token) => token === 'F').length === 1) soleF++;
        examples.add(word);
      }
    }
  }
  return { native12, secondF, soleF, examples: [...examples].slice(0, 5) };
}
const lexicalFiles = [
  ['shakespeare_first300k.txt', 78, 0, 62, 0],
  ['gibran_prophet_58585.txt', 64, 0, 35, 0],
  ['emerson_essays_2944.txt', 481, 2, 368, 0],
  ['english_wordfreq_textblob.txt', 890, 1, 772, 0]
];
// Nonvacuous positive: source-native AFTERTHOUGHTS has 12 GP runes, only F at index1.
assert.deepEqual(longWordSecondFCensus('AFTERTHOUGHTS', true),
  {native12: 1, secondF: 1, soleF: 1, examples: ['AFTERTHOUGHTS']});
// Negative control: legacy AFFECTIONATE has two Fs; source-native IO contraction shortens it.
assert.deepEqual(longWordSecondFCensus('AFFECTIONATE', false),
  {native12: 1, secondF: 1, soleF: 0, examples: ['AFFECTIONATE']});
assert.deepEqual(longWordSecondFCensus('AFFECTIONATE', true),
  {native12: 0, secondF: 0, soleF: 0, examples: []});
const lexicalControls = lexicalFiles.map(([name, legacyN, legacyHits, nativeN, nativeHits]) => {
  const source = fs.readFileSync(path.join(root, 'resources', 'control', name), 'utf8');
  const legacy = longWordSecondFCensus(source);
  const sourceNative = longWordSecondFCensus(source, true);
  assert.deepEqual([legacy.native12, legacy.secondF],
    [legacyN, legacyHits], 'legacy GP control: ' + name);
  assert.deepEqual([sourceNative.native12, sourceNative.secondF, sourceNative.soleF],
    [nativeN, nativeHits, 0], 'source-native GP control: ' + name);
  return { source: name, legacy, sourceNative };
});

console.log(JSON.stringify({
  model: 'row-major terminal256: p55(76), p56(85), p57(95)',
  originalPrintedGridRoot24Cells: rootCells,
  repeated2nMarkerPositions: twoNPositions,
  sourceP55FinalSixEqualsP27: true,
  specialCentralCell: { index: 132, row0: 16, col0: 4, byte: 169, mod29: 24 },
  printedF: {
    p55: p55.flatMap((v, i) => v === 0 ? [i] : []),
    p56: p56.flatMap((v, i) => v === 0 ? [i] : []),
    root24MarkedBase60: { p55: marked55, p56: marked56 },
    root24MarkedBase59: { p55: marked59_55, p56: marked59_56 }
  },
  knownP56: { base60ExactRunes: equalCount(from60.plaintext, knownPlain.plaintext),
    base59ExactRunes: equalCount(from59.plaintext, knownPlain.plaintext),
    total: 85, keySteps: from60.consumed },
  predictedP55PlainWord: predictedFWord,
  nativeEnglishSecondFControls: lexicalControls,
  proposedP55: { literalF: marked55, simpleTotientIoC: coincidence(predicted55.plaintext),
    forbiddenUnmarkedPlainFs: predicted55.nonSkippedF, decoded: toLatin(predicted55.plaintext) },
  conclusion: 'Source-aligned F-mask hypothesis, not recovered unknown p55 plaintext'
}, null, 2));
