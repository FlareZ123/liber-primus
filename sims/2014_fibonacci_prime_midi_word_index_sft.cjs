#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const wordsPath = process.argv[2] || path.join(__dirname, '..', 'resources', 'historical', 'cicada2012-midi-49-words.txt');
const words = fs.readFileSync(wordsPath, 'utf8').trim().split(/\s+/);
const fibonacciPrimeIndices = [3, 4, 5, 7, 11, 13, 17, 23, 29, 43, 47, 83];
if (words.length !== 49) throw new Error(\`Expected the pinned 49-word sample, found \${words.length}\`);
const oneBasedValid = fibonacciPrimeIndices.filter(i => i >= 1 && i <= words.length);
const zeroBasedValid = fibonacciPrimeIndices.filter(i => i >= 0 && i < words.length);
const oneBased = oneBasedValid.map(i => words[i - 1]);
const zeroBased = zeroBasedValid.map(i => words[i]);
console.log(JSON.stringify({
  input: path.resolve(wordsPath),
  wordCount: words.length,
  fibonacciPrimeIndices,
  outOfRangeIndices: fibonacciPrimeIndices.filter(i => i > words.length),
  oneBasedValidIndices: oneBasedValid,
  oneBasedWords: oneBased,
  oneBasedInitials: oneBased.map(w => w[0].toUpperCase()).join(''),
  zeroBasedValidIndices: zeroBasedValid,
  zeroBasedWords: zeroBased,
  zeroBasedInitials: zeroBased.map(w => w[0].toUpperCase()).join(''),
}, null, 2));
