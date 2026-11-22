#!/usr/bin/env node
'use strict';

// Source-selected p57 FIND/MUST -> base59 table -> inner-60 / outer-76
// additive-key hypotheses. Original inputs are read-only.
// Run: node sims/lp2_p57_find_must_base59_inner60_p55_key_sft.cjs

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const tokens = grid.pages.flatMap(page => page.tokens);
assert.equal(tokens.length, 256);
const p55 = corpus.pages.find(page => page.page === 55).indices;
const p57 = corpus.pages.find(page => page.page === 57).indices;
assert.equal(p55.length, 76);
assert.equal(p57.length, 95);

const alpha60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const alpha59 = alpha60.replace('f', '');
assert.equal(alpha60.length, 60);
assert.equal(alpha59.length, 59);
const decodeTable = alphabet => tokens.map(token => {
  const a = alphabet.indexOf(token[0]);
  const b = alphabet.indexOf(token[1]);
  assert.ok(a >= 0 && b >= 0, 'every original token must use the selected alphabet');
  return a * alphabet.length + b;
});
const table59 = decodeTable(alpha59);
const table60 = decodeTable(alpha60);

const mod = value => ((value % 29) + 29) % 29;
function phi(value) {
  if (!Number.isSafeInteger(value) || value < 1) return null;
  let remaining = value;
  let result = value;
  for (let factor = 2; factor * factor <= remaining; factor += 1) {
    if (remaining % factor === 0) {
      while (remaining % factor === 0) remaining /= factor;
      result -= result / factor;
    }
  }
  if (remaining > 1) result -= result / remaining;
  return Math.round(result);
}

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const p57Source = transcription.split('%').at(-1).replace(/[\/\r\n§]/g, '');
const printedWords = p57Source.split(/[-.]/).filter(Boolean);
const wordData = printedWords.map(raw => {
  const indices = [...raw].map(rune => runeIndex.get(rune));
  assert.ok(indices.every(Number.isInteger), 'p57 words must use original corpus runes');
  const spelling = indices.map(index => corpus.translit[index]).join('');
  const primeSum = indices.reduce((sum, index) => sum + corpus.prime[index], 0);
  return { spelling, primeSum, indices };
});
assert.equal(wordData.length, 20);
const findWords = wordData.filter(word => word.spelling === 'FIND');
const mustWords = wordData.filter(word => word.spelling === 'MUST');
assert.equal(findWords.length, 1);
assert.equal(mustWords.length, 1);
const findWord = findWords[0];
const mustWord = mustWords[0];
assert.equal(findWord.primeSum, 151);
assert.equal(mustWord.primeSum, 186);
assert.equal(phi(findWord.primeSum), 150);
assert.equal(phi(mustWord.primeSum), 60);

const selfPointerHits = table => wordData.filter(word => {
  const address = phi(word.primeSum);
  return address !== null && address < table.length && table[address] === word.primeSum;
});
const base59SelfHits = selfPointerHits(table59);
const base60SelfHits = selfPointerHits(table60);
assert.deepEqual(base59SelfHits.map(word => word.spelling), ['FIND']);
assert.deepEqual(base60SelfHits.map(word => word.spelling), []);
const base59ValueHits = wordData.filter(word => table59.includes(word.primeSum));
const base60ValueHits = wordData.filter(word => table60.includes(word.primeSum));
assert.equal(base59ValueHits.length, 12);
assert.equal(base60ValueHits.length, 11);

const findCell = phi(findWord.primeSum);
assert.equal(table59[findCell], findWord.primeSum);
assert.notEqual(table60[findCell], findWord.primeSum);
assert.equal(table60[findCell], 153);
const mustCell = findCell + 1;
assert.equal(table59[mustCell], mustWord.primeSum);
assert.equal(table60[mustCell], 189);
const mustValueCells = table59.map((value, index) => value === mustWord.primeSum ? index : null)
  .filter(index => index !== null);
assert.deepEqual(mustValueCells, [151, 254]);
assert.deepEqual(wordData.filter(word => word.primeSum === table59[mustCell])
  .map(word => word.spelling), ['MUST']);
assert.deepEqual(wordData.filter(word => word.primeSum === table60[mustCell])
  .map(word => word.spelling), []);

function ring(depth) {
  const top = depth;
  const bottom = 31 - depth;
  const left = depth;
  const right = 7 - depth;
  const cells = [];
  for (let column = left; column <= right; column += 1) cells.push(top * 8 + column);
  for (let row = top + 1; row <= bottom; row += 1) cells.push(row * 8 + right);
  for (let column = right - 1; column >= left; column -= 1) cells.push(bottom * 8 + column);
  for (let row = bottom - 1; row > top; row -= 1) cells.push(row * 8 + left);
  return cells;
}
function startRing(cells, start, direction) {
  const offset = cells.indexOf(start);
  assert.ok(offset >= 0, 'source-selected start must belong to its ring');
  return Array.from({ length: cells.length }, (_, index) =>
    cells[(offset + direction * index + cells.length * 2) % cells.length]);
}
const outerRing = ring(0);
const innerRing = ring(2);
assert.deepEqual([outerRing.length, ring(1).length, innerRing.length, ring(3).length],
  [76, 68, 60, 52]);
const innerStart = findCell - 1;
const outerStart = findCell + 1;
assert.equal(findCell, 150);
assert.equal(innerStart, 149);
assert.equal(outerStart, 151);
assert.ok(innerRing.includes(innerStart));
assert.ok(outerRing.includes(outerStart));
assert.equal(innerRing.length, phi(mustWord.primeSum));
const p55CipherF = p55.map((value, index) => value === 0 ? index : null)
  .filter(index => index !== null);
assert.deepEqual(p55CipherF, [15, 25, 41]);

function ioc(values) {
  const counts = new Array(29).fill(0);
  values.forEach(value => { counts[value] += 1; });
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (values.length * (values.length - 1));
}
function decodeTransparent(cipher, key, literalFPositions) {
  let keyPosition = 0;
  const plaintext = [];
  for (let offset = 0; offset < cipher.length; offset += 1) {
    const value = cipher[offset];
    if (value === 0 && literalFPositions.has(offset)) {
      plaintext.push(0);
      continue;
    }
    const keyValue = key[keyPosition % key.length];
    const plainValue = mod(value - keyValue);
    if (plainValue === 0) {
      return {
        valid: false,
        contradiction: { offset, cipher: value, key: keyValue, plaintext: plainValue, keyPosition },
        consumed: keyPosition + 1
      };
    }
    plaintext.push(plainValue);
    keyPosition += 1;
  }
  return { valid: true, plaintext, consumed: keyPosition };
}
function encodeTransparent(plaintext, key) {
  let keyPosition = 0;
  return plaintext.map(value => {
    if (value === 0) return 0;
    const cipherValue = mod(value + key[keyPosition % key.length]);
    keyPosition += 1;
    return cipherValue;
  });
}
function testKey(mapping, innerCells, outerCells, key) {
  assert.equal(outerCells.length, p55.length);
  const keyZeroCells = innerCells.map((cell, keyPosition) =>
    key[keyPosition] === 0 ? { cell, keyPosition } : null).filter(Boolean);
  const branchResults = [];
  for (let mask = 0; mask < 8; mask += 1) {
    const literalFPositions = new Set(p55CipherF.filter((_, bit) => (mask & (1 << bit)) !== 0));
    const decoded = decodeTransparent(p55, key, literalFPositions);
    branchResults.push({
      mask,
      literalFPositions: [...literalFPositions],
      valid: decoded.valid,
      contradiction: decoded.contradiction || null
    });
  }
  assert.ok(branchResults.every(result => !result.valid));
  const firstContradiction = branchResults[0].contradiction;
  assert.ok(branchResults.every(result =>
    JSON.stringify(result.contradiction) === JSON.stringify(firstContradiction)));
  assert.ok(firstContradiction.offset < p55CipherF[0]);

  const noSkipPlaintext = p55.map((value, index) => mod(value - key[index % key.length]));
  const noSkipText = noSkipPlaintext.map(index => corpus.translit[index]).join('');
  const noSkipIoc = ioc(noSkipPlaintext);

  const plant = p57.slice(0, 76);
  const plantCipher = encodeTransparent(plant, key);
  const plantLiteralF = new Set(plant.map((value, index) => value === 0 ? index : null)
    .filter(index => index !== null));
  const recoveredPlant = decodeTransparent(plantCipher, key, plantLiteralF);
  assert.equal(recoveredPlant.valid, true);
  assert.deepEqual(recoveredPlant.plaintext, plant);
  assert.deepEqual(encodeTransparent(recoveredPlant.plaintext, key), plantCipher);

  return {
    mapping,
    keyLength: key.length,
    firstKeyValue: key[0],
    keyZeroCells,
    firstContradiction,
    p55TransparentFBranches: branchResults,
    noSkipIoc,
    noSkipPlaintext: noSkipText,
    p57NativePlantRecovered: recoveredPlant.plaintext.length,
    p57NativePlantFPositions: [...plantLiteralF]
  };
}

const directions = [];
for (const direction of [1, -1]) {
  const innerCells = startRing(innerRing, innerStart, direction);
  const outerCells = startRing(outerRing, outerStart, direction);
  const rawValues = innerCells.map(cell => table59[cell]);
  assert.equal(rawValues.length, 60);
  const zeroCells = innerCells.map((cell, keyPosition) =>
    rawValues[keyPosition] === 0 ? { cell, keyPosition } : null).filter(Boolean);
  assert.deepEqual(zeroCells.map(item => item.cell), [229]);
  const rawKey = rawValues.map(value => mod(value));
  const phiKey = rawValues.filter(value => value !== 0).map(value => mod(phi(value)));
  assert.equal(phiKey.length, 59);
  assert.equal(rawKey.length, 60);
  directions.push({
    direction: direction === 1 ? 'clockwise' : 'counterclockwise',
    innerStart,
    outerStart,
    rawZeroCells: zeroCells,
    rawKey: testKey('raw base59 value mod29', innerCells, outerCells, rawKey),
    phiKey: testKey('phi(base59 value) mod29; omit the single zero because phi(0) is undefined',
      innerCells.filter(cell => table59[cell] !== 0), outerCells, phiKey)
  });
}
const expected = [
  { rawOffset: 5, rawCipher: 15, rawKey: 15, rawIoc: 0.03263157894736842,
    phiOffset: 0, phiCipher: 21, phiKey: 21, phiIoc: 0.034035087719298245 },
  { rawOffset: 12, rawCipher: 23, rawKey: 23, rawIoc: 0.031228070175438598,
    phiOffset: 0, phiCipher: 21, phiKey: 21, phiIoc: 0.0343859649122807 }
];
for (let i = 0; i < directions.length; i += 1) {
  const result = directions[i];
  const e = expected[i];
  assert.equal(result.rawKey.firstContradiction.offset, e.rawOffset);
  assert.equal(result.rawKey.firstContradiction.cipher, e.rawCipher);
  assert.equal(result.rawKey.firstContradiction.key, e.rawKey);
  assert.equal(result.phiKey.firstContradiction.offset, e.phiOffset);
  assert.equal(result.phiKey.firstContradiction.cipher, e.phiCipher);
  assert.equal(result.phiKey.firstContradiction.key, e.phiKey);
  assert.ok(Math.abs(result.rawKey.noSkipIoc - e.rawIoc) < 1e-15);
  assert.ok(Math.abs(result.phiKey.noSkipIoc - e.phiIoc) < 1e-15);
  assert.equal(result.rawKey.p57NativePlantRecovered, 76);
  assert.equal(result.phiKey.p57NativePlantRecovered, 76);
}

console.log(JSON.stringify({
  classification: 'bounded negatives for two source-motivated inner60-to-outer76 additive consumers; no unknown plaintext',
  p57WordCount: wordData.length,
  base59RawWordValueHits: base59ValueHits.length,
  base60RawWordValueHits: base60ValueHits.length,
  findPrimeSum: findWord.primeSum,
  phiFind: phi(findWord.primeSum),
  mustPrimeSum: mustWord.primeSum,
  phiMust: phi(mustWord.primeSum),
  base59SelfPointerWords: base59SelfHits.map(word => word.spelling),
  base60SelfPointerWords: base60SelfHits.map(word => word.spelling),
  base59MustValueCells: mustValueCells,
  findCell,
  mustCell,
  base59FindValue: table59[findCell],
  base59MustValue: table59[mustCell],
  base60FindCellValue: table60[findCell],
  base60MustCellValue: table60[mustCell],
  rings: [outerRing.length, ring(1).length, innerRing.length, ring(3).length],
  p55CipherF,
  directions
}, null, 2));
