'use strict';
// Word-conditioned GP29 and no-repeat GP28 inverses from the source LP1 5x5 square.
// Node.js 22 / CommonJS: node sims/lp2_magic5_causal_word_rank28_inverse_sft.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {parseLP2Words, parseSharedCorpus} = require('./lp2_word_pages.cjs');

const corpus = JSON.parse(fs.readFileSync(path.join(
  __dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const sourceTranscript = fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'lp2-transcription.txt'), 'utf8');

const square = [
  [272, 138, 341, 131, 151],
  [366, 199, 130, 320, 18],
  [226, 245, 91, 245, 226],
  [18, 320, 130, 199, 366],
  [151, 131, 341, 138, 272]
];
const runeToIndex = new Map(corpus.runes.map((r, i) => [r, i]));
assert.equal(square.length, 5);
for (const row of square) assert.equal(row.reduce((a, b) => a + b, 0), 1033);

/** @param {number} x @param {number} base @returns {number} */
function mod(x, base) { return (x % base + base) % base; }

/** @param {{runes:string}[]} sourceWords @returns {number[][]} */
function toIndices(sourceWords) {
  return sourceWords.map(w => [...w.runes].map(r => {
    assert.ok(runeToIndex.has(r), 'unexpected rune');
    return runeToIndex.get(r);
  }));
}

/** @param {number[]} symbols @returns {number} */
function coincidence(symbols) {
  const counts = Array(29).fill(0);
  for (const c of symbols) counts[c]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (symbols.length * (symbols.length - 1));
}

/**
 * The square row is selected by the PREVIOUS printed ciphertext word's
 * standard Gematria Primus prime sum modulo 5. Key columns cycle 0..4
 * within each complete printed word, including page-spanning words.
 * For rank28: the immediately previous ciphertext rune is excluded
 * from the 28 allowed nonrepeat outputs. A repeat carries plaintext
 * index 28, EA, without any secret or extra channel.
 *
 * @param {number[][]} wordCiphertexts
 * @param {'caesar29'|'rank28'} mode
 * @param {1|-1} sign Sign used in the forward encoder
 * @returns {{words:number[][], rows:number[]}}
 */
function decipher(wordCiphertexts, mode, sign) {
  let previousC = 0;
  let previousWordSum = 0;
  const result = [];
  const rows = Array(5).fill(0);
  for (const cipherWord of wordCiphertexts) {
    const row = previousWordSum % 5;
    rows[row]++;
    const decoded = [];
    for (let i = 0; i < cipherWord.length; i++) {
      const c = cipherWord[i];
      const k = square[row][i % 5] % (mode === 'rank28' ? 28 : 29);
      let p;
      if (mode === 'rank28') {
        p = c === previousC ? 28 :
          mod((c > previousC ? c - 1 : c) - sign * k, 28);
      } else {
        p = mod(c - sign * k, 29);
      }
      decoded.push(p);
      previousC = c;
    }
    previousWordSum = cipherWord.reduce((sum, c) =>
      sum + corpus.prime[c], 0);
    result.push(decoded);
  }
  return {words: result, rows};
}

/**
 * A fully reversible forward emitter with causal ciphertext state.
 * @param {number[][]} plaintextWords
 * @param {'caesar29'|'rank28'} mode
 * @param {1|-1} sign
 * @returns {number[][]}
 */
function encipher(plaintextWords, mode, sign) {
  let previousC = 0;
  let previousWordSum = 0;
  const result = [];
  for (const plainWord of plaintextWords) {
    const row = previousWordSum % 5;
    const encrypted = [];
    for (let i = 0; i < plainWord.length; i++) {
      const p = plainWord[i];
      const k = square[row][i % 5] % (mode === 'rank28' ? 28 : 29);
      let c;
      if (mode === 'rank28') {
        if (p === 28) {
          c = previousC;
        } else {
          const rank = mod(p + sign * k, 28);
          c = rank >= previousC ? rank + 1 : rank;
        }
      } else {
        c = mod(p + sign * k, 29);
      }
      encrypted.push(c);
      previousC = c;
    }
    previousWordSum = encrypted.reduce((sum, c) =>
      sum + corpus.prime[c], 0);
    result.push(encrypted);
  }
  return result;
}

const unknownWords = toIndices(parseSharedCorpus().words);
const original = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
const flatUnknown = unknownWords.flat();
assert.equal(unknownWords.length, 2896);
assert.equal(flatUnknown.length, 12956);
assert.deepEqual(flatUnknown, original);
assert.ok(Math.abs(coincidence(original) - 0.03447839786450569) < 1e-12);

// This source segment is only an authentic, independently already-clear
// plaintext plant; its encrypted form is not present in the historical book.
const solvedWords = toIndices(parseLP2Words(
  sourceTranscript.split('%')[56], 1).words);
const solved = corpus.pages.find(p => p.page === 57).indices;
assert.deepEqual(solvedWords.flat(), solved);
assert.equal(solved.length, 95);

const frozenExpectations = [
  ['caesar29', 1, 0.03445051499306086, 448, null],
  ['caesar29', -1, 0.03445945181083164, 414, null],
  ['rank28', 1, 0.03527675358536192, 448, 86],
  ['rank28', -1, 0.03529927436614429, 458, 86]
];
const outputs = [];
for (const [mode, sign, expectedIoc, expectedDoublets, expectedEa] of frozenExpectations) {
  const {words, rows} = decipher(unknownWords, mode, sign);
  const output = words.flat();
  assert.deepEqual(rows, [587, 561, 548, 589, 611]);
  const observedIoC = coincidence(output);
  assert.ok(Math.abs(observedIoC - expectedIoc) < 1e-12);
  const doublets = output.filter((v, i) => i && v === output[i - 1]).length;
  assert.equal(doublets, expectedDoublets);
  const ea = output.filter(v => v === 28).length;
  if (expectedEa !== null) assert.equal(ea, expectedEa);
  assert.deepEqual(encipher(words, mode, sign).flat(), original);

  // Independent native-GP positive with exact carried word boundaries.
  const planted = encipher(solvedWords, mode, sign);
  assert.deepEqual(decipher(planted, mode, sign).words, solvedWords);
  // The wrong square row/phase should generally fail to decode this plant.
  const corrupt = planted.map(w => w.slice());
  corrupt[0][0] = (corrupt[0][0] + 1) % 29;
  assert.notDeepEqual(decipher(corrupt, mode, sign).words, solvedWords);

  outputs.push({
    mode, sign, originalIoc: observedIoC, literalE: output.filter(v => v === 18).length,
    literalEA: ea, doublets,
    first90GP: output.slice(0, 90).map(i => corpus.translit[i]).join('')
  });
}
console.log(JSON.stringify({
  source: 'original GP29 12,956 unsolved runes and actual LP1 5x5 numeric square',
  fiveByFiveRowSum: 1033,
  ciphertextWords: 2896,
  originalIoC: coincidence(original),
  recoveredPlaintext: false,
  positiveControl: '95/95 authentic already-clear p57 GP runes, four exact roundtrips',
  outputs
}, null, 2));
