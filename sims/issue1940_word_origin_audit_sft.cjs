#!/usr/bin/env node
'use strict';

// Source-only audit for Issue #1940. Does not read any p0 ciphertext or p0 residual.
const fs = require('node:fs');

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

const rawSquares = read('resources/cicada2014-openpuff-magic-squares.txt');
const numbers = (rawSquares.match(/-?\d+/g) || []).map(Number);
const specs = [
  { label: '5x5/3301', n: 5 },
  { label: '7x7/1033', n: 7 },
  { label: '5x5/1033', n: 5 }
];

let cursor = 0;
const squares = specs.map((spec) => {
  const cells = numbers.slice(cursor, cursor + spec.n * spec.n);
  cursor += spec.n * spec.n;
  if (cells.length !== spec.n * spec.n) {
    throw new Error('Incomplete square: ' + spec.label);
  }
  return {
    ...spec,
    cells,
    center: cells[(spec.n * spec.n - 1) / 2]
  };
});
if (numbers.length !== 99 || cursor !== numbers.length) {
  throw new Error('Expected exactly 99 cells across 5x5, 7x7, 5x5 squares');
}

const signed = read('resources/historical/cicada2016-4gq25-outguess.asc');
const beforeSignature = signed.split('-----BEGIN PGP SIGNATURE-----')[0];
const body = beforeSignature
  .replace(/^-----BEGIN PGP SIGNED MESSAGE-----\r?\nHash:[^\r\n]*\r?\n\r?\n/, '')
  .replace(/-----END PGP SIGNED MESSAGE-----\s*$/, '')
  .trim();
const words = body.match(/[A-Za-z]+/g) || [];
if (words.length !== 43) {
  throw new Error('Expected 43 alphabetic words in signed 2016 body; got ' + words.length);
}

function base29(value) {
  return [Math.floor(value / 29), value % 29];
}
function pair(digits, origin) {
  return digits.map((digit) => words[digit - origin] || '[out-of-range]').join(' ');
}
function locations(value) {
  const found = [];
  for (const square of squares) {
    square.cells.forEach((cell, index) => {
      if (cell === value) {
        found.push({
          square: square.label,
          row0: Math.floor(index / square.n),
          col0: index % square.n
        });
      }
    });
  }
  return found;
}

const centers = squares.map((square, index) => {
  const digits = base29(square.center);
  const candidateDigits = index === 0 ? digits.slice().reverse() : digits;
  return {
    square: square.label,
    center: square.center,
    base29: digits,
    candidateDigitsAfterFirstSquareMirror: candidateDigits,
    zeroBased: pair(candidateDigits, 0),
    oneBased: pair(candidateDigits, 1)
  };
});

const chainValues = [91, 121, 151, 181];
const cellChain = chainValues.map((value) => {
  const digits = base29(value);
  return {
    value,
    base29: digits,
    locations: locations(value),
    zeroBased: pair(digits, 0),
    oneBased: pair(digits, 1)
  };
});

const result = {
  sourceWordCount: words.length,
  adjacentPairStarts: words.length - 1,
  wordWindow: words.slice(2, 8).map((word, i) => ({ index0: i + 2, word })),
  squareCenters: centers,
  cellChain1033: cellChain,
  overlappingZeroBased: words.slice(3, 8).join(' '),
  overlappingOneBased: words.slice(2, 7).join(' '),
  notes: [
    'The word origin is not specified by the signed sources.',
    'Both origins produce literal contiguous substrings of the signed 2016 message.',
    'The 1033-cell chain interleaves the 7x7 and 5x5 geometries.',
    'This script does not inspect p0 ciphertext and does not claim a decryption.'
  ]
};

console.log(JSON.stringify(result, null, 2));
