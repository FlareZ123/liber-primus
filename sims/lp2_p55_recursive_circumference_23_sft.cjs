'use strict';

/**
 * Source-visible LP2 p55 nested word-circumference readout.
 *
 * The original clear p57 PARABLE says to shed circumferences. Physical
 * p55 has sixteen complete words after a one-rune page-carry fragment.
 * Peel all complete words repeatedly, retaining all original rune tokens.
 *
 * Node.js 22, built-in modules only.
 * node sims/lp2_p55_recursive_circumference_23_sft.cjs
 *
 * Reports a potential 23-rune *register*, not an authentic plaintext.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const raw = fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');

/**
 * Parse continuous GP rune words. Original punctuation splits words,
 * while slash/whitespace and physical page separators preserve them.
 * First 55 rune-bearing transcript pages are physical LP2 p0..55,
 * skipping the source table's genuinely runeless physical p50.
 * @returns {{indices: number[], startPage: number, endPage: number}[]}
 */
function parseOriginalUnsolvedWords() {
  const source = raw.split('%').slice(0, 55).join('%');
  const runeId = new Map(corpus.runes.map((ch, i) => [ch, i]));
  const words = [];
  let indices = [];
  let page = 0;
  let startPage = 0;
  let endPage = 0;
  function finish() {
    if (!indices.length) return;
    words.push({ indices, startPage, endPage });
    indices = [];
  }
  for (const character of source) {
    const rune = runeId.get(character);
    if (rune !== undefined) {
      if (!indices.length) startPage = page;
      indices.push(rune);
      endPage = page;
    } else if (character === '%') {
      page++;
    } else if (character === '/' || /\s/u.test(character)) {
      // Original line and physical page wrapping do not break words.
    } else {
      finish();
    }
  }
  finish();
  assert.equal(words.length, 2896);
  assert.equal(words.reduce((n, word) => n + word.indices.length, 0), 12956);
  return words;
}

/**
 * Retain runes after n successive layers of both word edges are shed.
 * @param {number[][]} wordArrays
 * @param {number} n
 * @returns {number[]}
 */
function layer(wordArrays, n) {
  return wordArrays.flatMap(word => word.slice(n, Math.max(n, word.length - n)));
}

/** @param {number[]} digits @returns {bigint} */
function base29Number(digits) {
  return digits.reduce((n, digit) => n * 29n + BigInt(digit), 0n);
}

/**
 * Encode a nonnegative integer as exactly n BASE29 digits, zero-padded.
 * @param {bigint} input
 * @param {number} width
 * @returns {number[]}
 */
function base29Digits(input, width) {
  let number = input;
  const digits = Array(width).fill(0);
  for (let i = width - 1; i >= 0; i--) {
    digits[i] = Number(number % 29n);
    number /= 29n;
  }
  assert.equal(number, 0n, 'Integer does not fit frozen 23-digit field');
  return digits;
}

function main() {
  const words = parseOriginalUnsolvedWords();
  const carry = words.at(-17);
  assert.equal(carry.startPage, 53);
  assert.equal(carry.endPage, 54);
  assert.equal(carry.indices.length, 11);
  assert.deepEqual(carry.indices.slice(0, 10),
    corpus.pages.find(p => p.page === 54).indices.slice(-10));
  assert.equal(carry.indices.at(-1),
    corpus.pages.find(p => p.page === 55).indices[0]);

  const terminalWords = words.slice(-16).map(word => word.indices);
  const terminalLengths = terminalWords.map(word => word.length);
  assert.deepEqual(terminalLengths,
    [4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]);
  assert.ok(words.slice(-16).every(word =>
    word.startPage === 54 && word.endPage === 54));
  assert.deepEqual(terminalWords.flat(),
    corpus.pages.find(p => p.page === 55).indices.slice(1));

  const stages = Array.from({ length: 8 }, (_, n) =>
    layer(terminalWords, n));
  const lengths = stages.map(s => s.length);
  assert.deepEqual(lengths, [75, 43, 23, 9, 5, 3, 1, 0]);
  assert.deepEqual(stages[2].map(i => corpus.translit[i]),
    ['G', 'D', 'A', 'B', 'F', 'X', 'I', 'M', 'U', 'C',
      'P', 'H', 'NG', 'D', 'IA', 'I', 'G', 'X', 'EO', 'TH', 'TH', 'I', 'M']);
  assert.deepEqual(stages[6].map(i => corpus.translit[i]), ['U']);

  // Compare the *full* stage sequence against all 16-consecutive-word
  // windows across the unmodified 12,956-runic unknown source.
  let windowsLength75 = 0;
  let windowsLength75AndPeel2Length23 = 0;
  const exactMatches = [];
  for (let start = 0; start + 16 <= words.length; start++) {
    const window = words.slice(start, start + 16).map(word => word.indices);
    const s0 = layer(window, 0).length;
    if (s0 === 75) windowsLength75++;
    if (s0 === 75 && layer(window, 2).length === 23)
      windowsLength75AndPeel2Length23++;
    if (stages.every((_, n) => layer(window, n).length === lengths[n]))
      exactMatches.push(start);
  }
  assert.equal(words.length - 15, 2881);
  assert.equal(windowsLength75, 115);
  assert.equal(windowsLength75AndPeel2Length23, 7);
  assert.deepEqual(exactMatches, [2880]);

  // Test one historically available, unfitted base29-integer→byte
  // interpretation of the exactly 23 deeply peeled rune digits.
  // 29^23 < 256^14, so the entire 23-digit register fits 14 bytes.
  const peeled23 = stages[2];
  const rawInteger = base29Number(peeled23);
  const byteHex = rawInteger.toString(16).padStart(28, '0');
  const bytes = Buffer.from(byteHex, 'hex');
  assert.equal(bytes.length, 14);
  assert.equal(byteHex, '3211afb981f0de40d72690a8b44a');
  const printed = [...bytes].map(v =>
    v >= 32 && v <= 126 ? String.fromCharCode(v) : '.').join('');
  assert.equal(printed, '2......@.&...J');
  assert.equal([...bytes].filter(v => v >= 32 && v <= 126).length, 4);

  // Lossless native-2013-style positional BASE29 positive control:
  // a 14-byte source-solved PARABLE register, no chosen digit phase.
  const knownBytes = Buffer.from('PARABLE SOURCE', 'ascii');
  assert.equal(knownBytes.length, 14);
  const knownInteger = BigInt('0x' + knownBytes.toString('hex'));
  const encoded = base29Digits(knownInteger, 23);
  assert.deepEqual(
    Buffer.from(base29Number(encoded).toString(16).padStart(28, '0'), 'hex'),
    knownBytes,
  );

  console.log(JSON.stringify({
    originalUnsolvedWords: words.length,
    originalUnsolvedRunes: 12956,
    sourceCompleteP55Words: 16,
    sourceCarryRuling: '11-rune word from physical p54 to p55 excluded',
    circumferencesRemoved: lengths,
    uniqueExactPathStartWord0Based: exactMatches[0],
    sourceWindowsTested: 2881,
    windows75: windowsLength75,
    windows75Then23: windowsLength75AndPeel2Length23,
    peeled23GP: stages[2].map(i => corpus.translit[i]).join(' '),
    finalInnerRune: corpus.translit[stages[6][0]],
    peeled23Base29BytesHex: byteHex,
    printableByteCount: 4,
    sourceNativePositivePayloadRecovered: knownBytes.toString('ascii'),
    verdict: 'Source-derived register only; BASE29 bytes not ASCII plaintext',
  }, null, 2));
}

if (require.main === module) main();
module.exports = { parseOriginalUnsolvedWords, layer, base29Number, base29Digits, main };
