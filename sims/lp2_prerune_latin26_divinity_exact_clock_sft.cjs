'use strict';

/**
 * SFT: a source-literal Latin26 Vigenere clock BEFORE GP29 rune rendering.
 *
 * Hypothesis: a 26-letter Vigenere operation used by earlier Cicada puzzles
 * was keyed by the unaltered DIVINITY named in solved LP2 p57, and the
 * resulting Latin ciphertext was spelled with the original 29 GP runes.
 * A TH/EO/NG/OE/AE/IA/EA rune advances TWO Latin26 key positions.
 * Key starts at zero at the source-selected chapter/receiver start.
 *
 * This file is an independent bounded test, not a claimed LP2 decryption.
 * Run from the repository on Windows Node.js 22:
 * node sims/lp2_prerune_latin26_divinity_exact_clock_sft.cjs
 *
 * Earlier first-party stages checked:
 * 2012 original-image ASCII Caesar-4 at its authentic trailer;
 * 2014 original Stage04 runic Vigenere, in an existing exact reproducer;
 * LP2 p56 genuine prime-totient solve, in an existing independent regression.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (relative) => fs.readFileSync(path.join(ROOT, relative), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const source = read('resources/liber-primus/lp2-transcription.txt').split('%');
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const key = 'DIVINITY';
const spells = corpus.translit;
const singles = new Set(spells.filter((s) => s.length === 1));
const doubles = new Set(spells.filter((s) => s.length === 2));
const forbidden = new Set(['K', 'Q', 'V', 'Z']);

assert.equal(key.length, 8);
assert.equal(spells.length, 29);
assert.deepEqual([...doubles].sort(), ['AE', 'EA', 'EO', 'IA', 'NG', 'OE', 'TH']);
assert.equal(singles.size, 22);
assert.equal(source.length, 57);
assert.equal(corpus.pages.length, 58);

/**
 * @param {string} letters Uppercase A-Z only
 * @param {-1|1} sign Encrypt (+1) or decrypt (-1).
 * @returns {string}
 */
function vig(letters, sign) {
  let out = '';
  let offset = 0;
  for (const ch of letters) {
    assert.ok(alphabet.includes(ch), 'Latin26 input must be A-Z only');
    const c = ch.charCodeAt(0) - 65;
    const k = key.charCodeAt(offset++ % key.length) - 65;
    out += alphabet[(c + sign * k + 26) % 26];
  }
  return out;
}

/**
 * @param {string} spelling Latin ciphertext
 * @returns {string[]|null} Greedy GP29 glyph spelling, or impossible
 */
function spellToGp(spelling) {
  const out = [];
  for (let i = 0; i < spelling.length;) {
    const pair = spelling.slice(i, i + 2);
    if (doubles.has(pair)) {
      out.push(pair);
      i += 2;
    } else if (singles.has(spelling[i])) {
      out.push(spelling[i]);
      i++;
    } else {
      return null;
    }
  }
  return out;
}

/** @param {number} lo @param {number} hi @returns {string[]} */
function sourceRunes(lo, hi) {
  return corpus.pages.filter((page) => page.page >= lo && page.page <= hi)
    .flatMap((page) => page.indices.map((value) => spells[value]));
}

/** @param {number} lo @param {number} hi @returns {string} */
function originalPrint(lo, hi) {
  return corpus.pages.filter((page) => page.page >= lo && page.page <= hi && page.page !== 50)
    .map((page) => source[page.page <= 49 ? page.page : page.page - 1]).join('');
}

/** @param {string} printed @returns {string[][]} */
function printedWords(printed) {
  return printed.replace(/[\r\n/]/gu, '').split(/[-.]/u)
    .map((word) => Array.from(word).filter((rune) => corpus.runes.includes(rune))
      .map((rune) => spells[corpus.runes.indexOf(rune)]))
    .filter((word) => word.length > 0);
}

/** @param {string[]} text @returns {number} */
function ioc(text) {
  const n = text.length;
  const freq = new Array(26).fill(0);
  for (const ch of text) freq[alphabet.indexOf(ch)]++;
  return freq.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1));
}

/** @param {string[]} glyphs @param {number} lag @returns {{hits:number,total:number,rate:number}} */
function lagRate(glyphs, lag) {
  let hits = 0;
  for (let i = lag; i < glyphs.length; i++) hits += Number(glyphs[i] === glyphs[i - lag]);
  return { hits, total: glyphs.length - lag, rate: hits / (glyphs.length - lag) };
}

/**
 * Measure a lag against ORIGINAL printed-word lengths. Control glyphs are
 * allocated to the same printed word slots, without modifying glyphs.
 * The controls remain lexical source streams, not coherent plaintext plants.
 * @param {string[]} glyphs
 * @param {number[]} lengths
 * @param {number} lag
 */
function wordLagRate(glyphs, lengths, lag) {
  assert.equal(glyphs.length, lengths.reduce((a, b) => a + b, 0));
  let start = 0;
  let hits = 0;
  let total = 0;
  for (const length of lengths) {
    for (let j = lag; j < length; j++) {
      total++;
      hits += Number(glyphs[start + j] === glyphs[start + j - lag]);
    }
    start += length;
  }
  return { hits, total, rate: hits / total };
}

/** @param {string} latin @returns {string} */
function lossyFold(latin) {
  return latin.replace(/[KQVZ]/gu, (ch) => ({ K: 'C', Q: 'C', V: 'U', Z: 'S' })[ch]);
}

/** @param {string} english @returns {string[]} */
function nativeControl(english) {
  const letters = (english.toUpperCase().match(/[A-Z]/gu) || []).join('');
  const encrypted = vig(letters, 1);
  const misses = [...encrypted].filter((ch) => forbidden.has(ch)).length;
  const converted = spellToGp(lossyFold(encrypted));
  assert.ok(converted);
  return { glyphs: converted, letters: letters.length, impossible: misses };
}

// Byte-true 2012 positive: ASCII Caesar, which was NOT A-Z ROT26. The original
// image carries the instructive trailer after JPEG EOI and needs no guessed key.
const firstImage = fs.readFileSync(path.join(ROOT, 'resources/historical/cicada2012-first-image.jpg'));
assert.equal(firstImage.length, 29279);
const eoi = firstImage.lastIndexOf(Buffer.from([0xff, 0xd9]));
assert.ok(eoi >= 0);
const trailer = firstImage.subarray(eoi + 2).toString('latin1');
assert.equal(Buffer.byteLength(trailer, 'latin1'), 61);
const historicalCipher = 'lxxt>33m2mqkyv2gsq3q=w]O2ntk';
assert.ok(trailer.includes(historicalCipher));
const historicallySolved = [...historicalCipher]
  .map((character) => String.fromCharCode(character.charCodeAt(0) - 4)).join('');
assert.equal(historicallySolved, 'http://i.imgur.com/m9sYK.jpg');

// Different authentic positives: original Stage04 actually uses GP29,
// and original p56 uses prime totients plus one nonconsuming plaintext-F.
require('./stage04_small_image_vigenere_repro.cjs');
require('./authentic_lp2_p56_totient_regression.cjs');

// Validate exact independent original rune images against both corpus inputs.
// P50 is an original numeral table with no rune text.
for (const page of corpus.pages) {
  if (page.page === 50) {
    assert.equal(page.indices.length, 0);
    continue;
  }
  const scan = source[page.page <= 49 ? page.page : page.page - 1];
  const seen = [...scan].filter((rune) => corpus.runes.includes(rune))
    .map((rune) => corpus.runes.indexOf(rune));
  assert.deepEqual(seen, page.indices, 'Transcription mismatch at p' + page.page);
}
const unknown = sourceRunes(0, 55);
assert.equal(unknown.length, 12956);
const reconstructed = unknown.join('');
assert.equal(reconstructed.length, 16131);
assert.equal(unknown.filter((g) => g.length === 2).length, 3175);
assert.equal(lagRate(unknown, 1).hits, 86);

const allWords = printedWords(originalPrint(0, 55));
assert.equal(allWords.length, 2896);
assert.equal(allWords.reduce((a, w) => a + w.length, 0), unknown.length);
const ambiguousAdjacent = allWords.reduce((sum, word) => {
  for (let i = 1; i < word.length; i++)
    sum += Number(word[i].length === 1 && word[i - 1].length === 1 &&
      doubles.has(word[i - 1] + word[i]));
  return sum;
}, 0);
const wordsChangedByGreedy = allWords.filter((word) => {
  const reparsed = spellToGp(word.join(''));
  return !reparsed || reparsed.join('|') !== word.join('|');
}).length;
assert.equal(ambiguousAdjacent, 100);
assert.equal(wordsChangedByGreedy, 175);

// One source-native, genuine positive under the HYPOTHESIZED Latin26
// operation: the 13-rune p57 substring MUST SHED OUR OW... can be encrypted
// without forbidden Latin letters or broken GP glyph boundaries. That is
// only 13 source runes; the model cannot make a 150-rune native plant under
// an all-letter A-Z cipher without supplying an escape/alias layer.
const p57 = sourceRunes(57, 57);
assert.equal(p57.length, 95);
const plant = p57.slice(39, 52).join('');
assert.equal(plant, 'MUSTSHEDOUROW');
const plantedCipher = vig(plant, 1);
assert.equal(plantedCipher, 'PCNBFPXBRCMWJ');
const plantedRunes = spellToGp(plantedCipher);
assert.ok(plantedRunes);
assert.equal(plantedRunes.length, 13);
assert.equal(vig(plantedRunes.join(''), -1), plant);
const wholeP57AsCipher = vig(p57.join(''), 1);
const unrepresentable = [...wholeP57AsCipher].filter((ch) => forbidden.has(ch)).length;
assert.equal(unrepresentable, 17);
assert.equal(spellToGp(wholeP57AsCipher), null);

const originalRanges = [[0, 2], [40, 53], [54, 55]];
const ranges = originalRanges.map(([lo, hi]) => {
  const glyphs = sourceRunes(lo, hi);
  const latin = glyphs.join('');
  const proposed = vig(latin, -1);
  assert.equal(vig(proposed, 1), latin);
  const words = printedWords(originalPrint(lo, hi));
  assert.equal(words.reduce((a, w) => a + w.length, 0), glyphs.length);
  return {
    physical_pages: 'p' + lo + '-p' + hi,
    runes: glyphs.length,
    inputLatinLetters: latin.length,
    digraphRunes: glyphs.filter((g) => g.length === 2).length,
    recoveredLatinIoC: ioc([...proposed]),
    proposedOpening: proposed.slice(0, 180),
    sourceOriginalRoundtrip: true,
    sourcePrintedWordSegments: words.length,
    observedLag1: lagRate(glyphs, 1),
    observedLag5: lagRate(glyphs, 5)
  };
});
assert.equal(ranges[0].runes, 729);
assert.equal(ranges[1].runes, 3008);
assert.equal(ranges[2].runes, 308);
assert.ok(ranges.every((r) => r.recoveredLatinIoC < 0.045));

const fullLatin = vig(reconstructed, -1);
assert.equal(vig(fullLatin, 1), reconstructed);
const sourceLengths = allWords.map((word) => word.length);
const controls = [
  ['Gibran', 'resources/control/gibran_prophet_58585.txt'],
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt']
].map(([name, file]) => {
  const n = nativeControl(read(file));
  const glyphs = n.glyphs.slice(0, unknown.length);
  assert.equal(glyphs.length, unknown.length);
  return {
    source: name,
    inputLetters: n.letters,
    originalUnrepresentableLettersBeforeLossyFold: n.impossible,
    postFoldDigraphShare: n.glyphs.filter((g) => g.length === 2).length / n.glyphs.length,
    postFoldLag1: lagRate(glyphs, 1),
    postFoldLag5: lagRate(glyphs, 5),
    originalWordSlotLag5: wordLagRate(glyphs, sourceLengths, 5)
  };
});
const originalStats = {
  totalOriginalRunes: unknown.length,
  originalLatinExpansionLetters: reconstructed.length,
  originalGPDigraphRunes: 3175,
  originalDigraphShare: 3175 / unknown.length,
  originalLatinIoCOnFixedDIVINITYInverse: ioc([...fullLatin]),
  originalLag1: lagRate(unknown, 1),
  originalLag5: lagRate(unknown, 5),
  originalWordSlotLag5: wordLagRate(unknown, sourceLengths, 5),
  sourcePrintedWordSegmentsUnderLiteralSeparatorParser: allWords.length,
  bareLatinSpellingsWithTwoSingleRuneToOneDigraphAmbiguities: ambiguousAdjacent,
  wordsGreedyReparseWouldChange: wordsChangedByGreedy
};

assert.ok(originalStats.originalDigraphShare > 0.24);
assert.ok(controls.every((r) => r.postFoldDigraphShare < 0.02));
assert.ok(controls.every((r) => r.postFoldLag1.rate > 0.04));
assert.ok(originalStats.originalLag1.rate < 0.007);
assert.ok(originalStats.originalLatinIoCOnFixedDIVINITYInverse < 0.045);

console.log(JSON.stringify({
  status: 'NEGATIVE: exact Latin26 DIVINITY letter-clock decrypts no unknown page',
  exactSourcePositive2012AsciiCaesar: historicallySolved,
  authenticGpPositives: '2014 Stage04 and p56 independent regressions PASS',
  latin26PositivePlant: { source: 'clear LP2 p57', offset: 39, runes: 13,
    nativePlain: plant, exactGpCipher: plantedCipher },
  p57FullNativeLatinPlant: { runes: 95, ciphertextLatinLetters: wholeP57AsCipher.length,
    missingGPAlphabetLetters: unrepresentable },
  candidateKey: key,
  letterClock: 'one key advancement per Latin character; digraph runes consume 2',
  originalStats, independentOriginalRanges: ranges, nativeSourceControls: controls,
  explicitLimits: 'A different 26-to-29 escape alphabet, secret normalization, keyed transducer, non-English register, or different key is outside this frozen model. Lossy K/Q->C and V->U and Z->S folding is used in native null controls only; it is not a proposed decryptor.'
}, null, 2));
