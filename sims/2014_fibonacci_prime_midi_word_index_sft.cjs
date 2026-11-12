#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const wordsPath = process.argv[2] || path.join(__dirname, '..', 'resources', 'historical', 'cicada2012-midi-49-words.txt');
const words = fs.readFileSync(wordsPath, 'utf8').trim().split(/\s+/);
const fibonacciPrimeIndices = [3, 4, 5, 7, 11, 13, 17, 23, 29, 31, 37, 43];
if (words.length !== 49) throw new Error(\`Expected the pinned 49-word sample, found \${words.length}\`);
for (const i of fibonacciPrimeIndices) if (i < 1 || i > words.length) throw new Error(\`Index \${i} outside 1..49\`);
const oneBased = fibonacciPrimeIndices.map(i => words[i - 1]);
const zeroBased = fibonacciPrimeIndices.map(i => words[i]);
console.log(JSON.stringify({
  input: path.resolve(wordsPath),
  wordCount: words.length,
  fibonacciPrimeIndices,
  oneBasedWords: oneBased,
  oneBasedInitials: oneBased.map(w => w[0].toUpperCase()).join(''),
  zeroBasedWords: zeroBased,
  zeroBasedInitials: zeroBased.map(w => w[0].toUpperCase()).join(''),
}, null, 2));
