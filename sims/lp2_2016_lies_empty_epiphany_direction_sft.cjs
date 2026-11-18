'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const grid = require('../resources/liber-primus/lp2-grid-256.json');
const signed2016 = fs.readFileSync(
  path.join(root, 'resources', 'historical', 'cicada2016-4gq25-outguess.asc'),
  'utf8'
);

const A60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const A59 = A60.replace('f', '');
const TOKENS = grid.pages.flatMap((page) => page.tokens);
const TRANSLIT = corpus.translit;
const ORDERED = TRANSLIT
  .map((text, index) => ({ text, index }))
  .sort((a, b) => b.text.length - a.text.length);

/**
 * @param {string} word
 * @returns {number[]}
 */
function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/K/g, 'C')
    .replace(/V/g, 'U')
    .replace(/Q/g, 'C')
    .replace(/Z/g, 'S');
  const out = [];
  let at = 0;
  while (at < normalized.length) {
    const token = ORDERED.find((candidate) => normalized.startsWith(candidate.text, at));
    assert.ok(token, `unmapped signed word: ${word} at ${at}`);
    out.push(token.index);
    at += token.text.length;
  }
  return out;
}

/**
 * @param {number[]} values
 * @returns {number}
 */
function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

/**
 * @param {string} token
 * @param {string} alphabet
 * @returns {number}
 */
function tokenValue(token, alphabet) {
  return alphabet.indexOf(token[0]) * alphabet.length + alphabet.indexOf(token[1]);
}

const clear = signed2016
  .split('-----BEGIN PGP SIGNATURE-----')[0]
  .split(/\r?\n\r?\n/)
  .slice(1)
  .join('\n');
const message = clear.split(/[^A-Za-z0-9]+/)
  .filter((token) => /^[A-Za-z]+$/.test(token));
assert.equal(message.length, 43);

const rows = message.map((word, index) => ({
  index,
  word,
  gp0: sum(gp(word)),
}));

const arithmeticWindows = [];
const equalResidueWindows = [];
for (let i = 0; i + 2 < rows.length; i += 1) {
  const triple = rows.slice(i, i + 3);
  const firstStep = triple[1].gp0 - triple[0].gp0;
  const secondStep = triple[2].gp0 - triple[1].gp0;
  if (firstStep === secondStep) {
    arithmeticWindows.push({
      index: i,
      words: triple.map((row) => row.word.toLowerCase()),
      gp0: triple.map((row) => row.gp0),
      step: firstStep,
    });
  }
  const residues = triple.map((row) => row.gp0 % 29);
  if (residues[0] === residues[1] && residues[1] === residues[2]) {
    equalResidueWindows.push({
      index: i,
      words: triple.map((row) => row.word.toLowerCase()),
      gp0: triple.map((row) => row.gp0),
      residue: residues[0],
    });
  }
}
assert.deepEqual(arithmeticWindows, [{
  index: 3,
  words: ['lies', 'empty', 'epiphany'],
  gp0: [63, 92, 121],
  step: 29,
}]);
assert.deepEqual(equalResidueWindows, [{
  index: 3,
  words: ['lies', 'empty', 'epiphany'],
  gp0: [63, 92, 121],
  residue: 5,
}]);

const directionAddresses = [63, 92, 121];
const coordinates = directionAddresses.map((address) => [
  Math.floor(address / 8),
  address % 8,
]);
assert.deepEqual(coordinates, [[7, 7], [11, 4], [15, 1]]);
const reflected = coordinates.map(([row, col]) => [row, 7 - col]);
assert.deepEqual(reflected, [[7, 0], [11, 3], [15, 6]]);
const reflectedSteps = [
  [reflected[1][0] - reflected[0][0], reflected[1][1] - reflected[0][1]],
  [reflected[2][0] - reflected[1][0], reflected[2][1] - reflected[1][1]],
];
assert.deepEqual(reflectedSteps, [[4, 3], [4, 3]]);
assert.equal(reflectedSteps[0][0] ** 2 + reflectedSteps[0][1] ** 2, 25);
assert.ok(reflected[0][1] - 3 < 0);
assert.ok(reflected[2][1] + 3 >= 8);

assert.equal(grid.bytes[92], 236);
assert.equal(grid.bytes[121], 237);
assert.equal(TOKENS[92], '3u');
assert.equal(TOKENS[121], '3v');

const p0 = corpus.pages.find((page) => page.page === 0).indices;
const transcription = fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-transcription.txt'),
  'utf8'
);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const p0Source = transcription.split(/\n%\n/)[0];
const p0Words = [];
let current = [];
let start = 0;
let offset = 0;
const flush = () => {
  if (!current.length) return;
  p0Words.push({ start, indices: current });
  current = [];
};
for (const ch of [...p0Source]) {
  const value = runeIndex.get(ch);
  if (value !== undefined) {
    if (!current.length) start = offset;
    current.push(value);
    offset += 1;
  } else if (ch === '-' || ch === '.') {
    flush();
  }
}
flush();
assert.equal(offset, p0.length);

const later27 = [];
for (let i = 2; i + 1 < p0Words.length; i += 1) {
  if (p0Words[i].indices.length === 2 && p0Words[i + 1].indices.length === 7) {
    later27.push(i);
  }
}
assert.deepEqual(later27, [52]);
assert.equal(p0Words[52].start + p0Words[52].indices.length - 1, 236);
assert.equal(p0Words[53].start, 237);
assert.equal(gp('THE').length, 2);
assert.equal(gp('DEVOTED').length, 7);

let favorablePlus29 = 0;
for (let a = 0; a < rows.length; a += 1) {
  for (let b = 0; b < rows.length; b += 1) {
    if (b === a) continue;
    for (let c = 0; c < rows.length; c += 1) {
      if (c === a || c === b) continue;
      if (
        rows[b].gp0 - rows[a].gp0 === 29 &&
        rows[c].gp0 - rows[b].gp0 === 29
      ) {
        favorablePlus29 += 1;
      }
    }
  }
}
assert.equal(favorablePlus29, 8);
const orderedTripleCount = 43 * 42 * 41;
const expectedWindows = 41 * favorablePlus29 / orderedTripleCount;
assert.ok(Math.abs(expectedWindows - 0.004429678848283499) < 1e-15);

const cribs = [
  { start: 0, plain: [18, 13, 10, 13, 8, 24, 9, 26, 15, 18, 18, 5, 15] },
  { start: 103, plain: [2, 18, 4, 3, 24, 23] },
  { start: 235, plain: [2, 18, 23, 18, 1, 3, 16, 18, 23] },
];

/**
 * @param {string} alphabet
 * @param {number} sign
 * @returns {number}
 */
function additiveHits(alphabet, sign) {
  let hits = 0;
  for (const crib of cribs) {
    for (let j = 0; j < crib.plain.length; j += 1) {
      const position = crib.start + j;
      const address = (63 + 29 * position) & 255;
      const key = tokenValue(TOKENS[address], alphabet) % 29;
      const predicted = (p0[position] + sign * key + 58) % 29;
      if (predicted === crib.plain[j]) hits += 1;
    }
  }
  return hits;
}

assert.equal(additiveHits(A60, -1), 0);
assert.equal(additiveHits(A60, 1), 1);
assert.equal(additiveHits(A59, -1), 1);
assert.equal(additiveHits(A59, 1), 1);

console.log(JSON.stringify({
  classification: 'signed-2016 source-selected GP0 direction ray into p50 and p0',
  arithmeticWindows,
  equalResidueWindows,
  originalCoordinates: coordinates,
  reflectedCoordinates: reflected,
  reflectedSteps,
  stepLength: 5,
  tableEndpoints: {
    empty: { address: 92, token: TOKENS[92], byte: grid.bytes[92] },
    epiphany: { address: 121, token: TOKENS[121], byte: grid.bytes[121] },
  },
  p0Boundary: {
    theWord: 52,
    theEnd: 236,
    devotedWord: 53,
    devotedStart: 237,
  },
  fixedMultisetCalibration: {
    favorablePlus29OrderedTriples: favorablePlus29,
    orderedTripleCount,
    expectedPlus29Windows: expectedWindows,
  },
  additiveConsumerNegative: {
    base60Subtract: additiveHits(A60, -1),
    base60Add: additiveHits(A60, 1),
    base59Subtract: additiveHits(A59, -1),
    base59Add: additiveHits(A59, 1),
    totalCribSymbols: 28,
  },
  decision: 'preserve +29 / reflected (+4,+3) as a source-selected navigation direction; direct additive table-byte use is rejected',
}, null, 2));
