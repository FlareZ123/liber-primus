#!/usr/bin/env node
'use strict';

/**
 * Source-ranked 5x5 Bifid on the sixteen COMPLETE printed p55 words.
 * Run from the repository root on Windows Node22:
 *   node sims/lp2_p55_wordwise_bifid_source5x5_sft.cjs
 *
 * The first p55 rune continues p54 and is deliberately NOT word-local.
 * Inverse and authentic 75-rune forward reconstructions are verified.
 * No author-authenticated Bifid instruction or plaintext is claimed.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {string} file @returns {any} */
const read = (file) => JSON.parse(fs.readFileSync(path.join(process.cwd(), file), 'utf8'));
const corpus = read('resources/liber-primus/lp2-corpus.json');
const grid = read('resources/liber-primus/base60-grid.json');
const source = fs.readFileSync(path.join(process.cwd(),
  'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const original = corpus.pages.find((p) => p.page === 55).indices;
assert.equal(original.length, 76);
const runeMap = new Map(corpus.runes.map((r, i) => [r, i]));
const runs = source.split(/^%\s*$/m).map((section) => {
  const words = section.replaceAll('/', '').replace(/[\n&$§]/g, '')
    .split(/[-.]/g).map((part) => [...part].filter((r) => runeMap.has(r)))
    .filter((word) => word.length > 0);
  return { words, indices: words.flat().map((r) => runeMap.get(r)) };
});
const matches = runs.filter((s) => s.indices.length === original.length &&
  s.indices.every((x, i) => x === original[i]));
assert.equal(matches.length, 1, 'p55 must be unique in exact original transcription');
const words = matches[0].words;
assert.equal(words.length, 17);
assert.deepEqual(words[0].map((r) => runeMap.get(r)), original.slice(0, 1));
const lengths = words.slice(1).map((word) => word.length);
assert.deepEqual(lengths, [4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]);
assert.equal(lengths.reduce((a, b) => a + b, 0), 75);
const latin = 'ABCDEFGHIKLMNOPQRSTUVWXYZ';
const support = [...new Set(original)].sort((a, b) => a - b);
assert.equal(support.length, 25);
const cipher = original.slice(1).map((i) => latin[support.indexOf(i)]).join('');
assert.equal(cipher.length, 75);
const tokenGrid = grid.rows.flat();
const alphabet = grid.alphabet.replace('f', '');
const values = Array.from({ length: 25 }, (_, i) => {
  const token = tokenGrid[8 * (21 + Math.floor(i / 5)) + 1 + (i % 5)];
  return 59 * alphabet.indexOf(token[0]) + alphabet.indexOf(token[1]);
});
assert.deepEqual([values[0], values[4], values[20], values[24]], [224, 115, 73, 75]);
assert.equal(new Set(values).size, 25);

/**
 * @param {boolean} descending
 * @returns {string}
 */
function rankKey(descending) {
  const order = Array.from({ length: 25 }, (_, i) => i)
    .sort((a, b) => descending ? values[b] - values[a] : values[a] - values[b]);
  const output = Array(25);
  order.forEach((position, i) => { output[position] = latin[i]; });
  return output.join('');
}

/** @param {string} key @param {number} orientation @returns {string} */
function orient(key, orientation) {
  let output = '';
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      let r = row;
      let c = col;
      if (orientation & 1) c = 4 - c;
      if (orientation & 2) r = 4 - r;
      if (orientation & 4) [r, c] = [c, r];
      output += key[5 * r + c];
    }
  }
  return output;
}

/**
 * Classical Bifid encode/decode, resetting coordinate accumulation
 * at each independently printed complete source word.
 * @param {string} input
 * @param {string} key
 * @param {boolean} encode
 * @returns {string}
 */
function wordBifid(input, key, encode) {
  const coordinates = new Map([...key].map((symbol, i) =>
    [symbol, [Math.floor(i / 5), i % 5]]));
  let output = '';
  let offset = 0;
  for (const n of lengths) {
    const word = input.slice(offset, offset + n);
    offset += n;
    const flattened = [...word].flatMap((symbol) => {
      const coordinate = coordinates.get(symbol);
      assert(coordinate, 'Every source symbol must be in the 25-letter key');
      return coordinate;
    });
    const transformed = encode ?
      flattened.filter((_, i) => i % 2 === 0)
        .concat(flattened.filter((_, i) => i % 2 !== 0)) :
      Array.from({ length: 2 * n }, (_, i) =>
        i % 2 ? flattened[n + (i >> 1)] : flattened[i >> 1]);
    for (let i = 0; i < transformed.length; i += 2) {
      output += key[5 * transformed[i] + transformed[i + 1]];
    }
  }
  assert.equal(offset, input.length);
  return output;
}

/** @param {string} input @returns {number} */
function ioc(input) {
  const counts = [...latin].map((ch) => [...input].filter((c) => c === ch).length);
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (input.length * (input.length - 1));
}

/** @param {string} input @returns {string} */
function withWords(input) {
  let offset = 0;
  return lengths.map((n) => {
    const word = input.slice(offset, offset + n);
    offset += n;
    return word;
  }).join(' ');
}

const planted = 'THEPRIMESARESACREDANDTHEREISASTORYUNDERTHESURFACE'
  .repeat(2).slice(0, 75);
assert.equal(planted.length, 75);
const outcomes = [];
for (const descending of [false, true]) {
  for (let orientation = 0; orientation < 8; orientation++) {
    const key = orient(rankKey(descending), orientation);
    const decoded = wordBifid(cipher, key, false);
    assert.equal(wordBifid(decoded, key, true), cipher);
    const encryptedPlant = wordBifid(planted, key, true);
    assert.equal(wordBifid(encryptedPlant, key, false), planted);
    outcomes.push({
      descending, orientation, ioc: ioc(decoded), words: withWords(decoded)
    });
  }
}
assert.equal(outcomes.length, 16);
outcomes.sort((a, b) => b.ioc - a.ioc);
assert(Math.abs(outcomes[0].ioc - 0.04216216216216216) < 1e-12);
assert.equal(outcomes[0].words,
  'XISN UA YI KCODDN CBDSWB RC PUZRAONCCYSML RYLAGP PLCZ UF IRXFIMN TNUCLMH AT ERCSIN SPB QOQ');
console.log(JSON.stringify({
  source: 'Original p55 complete-word suffix 75 runes; 16 source-defined word lengths',
  square: 'p49-51 flat rows21..25, cols1..5; rank order independent of 59/60 codec',
  receiver: 'Wordwise classical Latin25 Bifid; two rank directions, eight square orientations',
  candidateCount: outcomes.length,
  originalForwardRoundtrips: 16,
  independentPlantedRecoveries: 16,
  originalCipherIoC: ioc(cipher),
  best: outcomes[0],
  worst: outcomes[outcomes.length - 1],
  verdict: 'No coherent unknown plaintext; exact finite source-shaped hypothesis rejected'
}, null, 2));
