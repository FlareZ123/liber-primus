#!/usr/bin/env node
'use strict';

// Reproduce the external Wulfic 2026 partial keys for LP2 pages 18 and 19.
// Run from repository root: node sims/external_wulfic_p18_p19_repro.cjs

const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const MOD = 29;
const mod = x => ((x % MOD) + MOD) % MOD;
const render = values => values.map(x => corpus.translit[x]).join('');
const ioc = values => {
  const counts = Array(MOD).fill(0);
  for (const x of values) counts[x]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) / (values.length * (values.length - 1));
};

const cases = [
  {
    page: 18, mode: 'SUB',
    key: [11,6,1,20,25,20,9,15,24,26,25,7,19,8,10,24,18,9,0,16,9,4,14,22,13,13,3,28,5,21,24,19,5,1,27,14,6,17,24,24,22,8,23,6,22,19,2,11,3,19,25,15,24],
    expected: 'BEINGOFALLIWILLASCTHEOATHISSWORNTOTHEONEWITHINTHEABOFETHEWAY'
  },
  {
    page: 19, mode: 'ADD',
    key: [24,15,2,24,4,21,11,10,20,16,9,19,26,11,7,5,11,6,27,8,22,25,21,16,25,0,27,9,21,7,27,15,21,9,3,16,5,22,18,4,5,18,23,28,28,28,28],
    expected: 'REARRANGINGTHEPRIMESNUMBERSWILLSHOWAPATHTOTHEDEOR'
  }
];

const results = cases.map(test => {
  const page = corpus.pages.find(p => p.page === test.page);
  if (!page || !page.indices?.length) throw new Error('Missing corpus page ' + test.page);
  const sign = test.mode === 'SUB' ? -1 : 1;
  const plaintext = page.indices.map((x, i) => mod(x + sign * test.key[i % test.key.length]));
  const rendered = render(plaintext);
  const prefixMatch = rendered.startsWith(test.expected);
  return {
    page: test.page, mode: test.mode, ciphertextRunes: page.indices.length,
    keyLength: test.key.length, prefixMatch, expectedPrefix: test.expected,
    actualPrefix: rendered.slice(0, test.expected.length), IoC: ioc(plaintext),
    first160: rendered.slice(0, 160), last120: rendered.slice(-120)
  };
});

if (results.some(r => !r.prefixMatch)) {
  console.error(JSON.stringify(results, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify(results, null, 2));
}
