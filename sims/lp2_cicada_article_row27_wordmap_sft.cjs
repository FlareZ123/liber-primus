#!/usr/bin/env node
'use strict';

// Source-only candidate route: 2013 cicada article -> 221-index -> p50 table -> 2016 word map.
// The 221 address and the zero-based origins are hypotheses tested here, not authenticated instructions.
const fs = require('node:fs');

function read(path) {
  return fs.readFileSync(path, 'utf8');
}
function base29(n) {
  return [Math.floor(n / 29), n % 29];
}
function base29Text(n) {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRS';
  return base29(n).map(d => alphabet[d]).join('');
}
function wordPair(value, words, origin) {
  return base29(value).map((d) => words[d - origin] || '[out-of-range]').join(' ');
}
function render(indices, alphabet) {
  return indices.map((n) => alphabet[n]).join(' ');
}
function addKey(cipher, key, sign) {
  return cipher.map((v, i) => (v + sign * key[i % key.length] + 58) % 29);
}
function locateTableIndex(grid, index) {
  let offset = 0;
  for (const page of grid.pages) {
    if (index < offset + page.bytes.length) {
      const local = index - offset;
      return {
        page: page.page,
        localIndex: local,
        rowOnPage0: Math.floor(local / page.cols),
        col0: local % page.cols,
        token: page.tokens[local],
        globalRow0: Math.floor(index / 8),
        globalCol0: index % 8
      };
    }
    offset += page.bytes.length;
  }
  throw new Error('Table index outside preserved pages: ' + index);
}
function decodeBase60(token) {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
  if (typeof token !== 'string' || token.length !== 2) {
    throw new Error('Expected a two-character base-60 token: ' + token);
  }
  const a = alphabet.indexOf(token[0]);
  const b = alphabet.indexOf(token[1]);
  if (a < 0 || b < 0) throw new Error('Invalid base-60 token: ' + token);
  return 60 * a + b;
}

const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
if (grid.bytes.length !== 256) throw new Error('Expected 256 table values');
const signed = read('resources/historical/cicada2016-4gq25-outguess.asc');
const beforeSignature = signed.split('-----BEGIN PGP SIGNATURE-----')[0];
const body = beforeSignature
  .replace(/^-----BEGIN PGP SIGNED MESSAGE-----\r?\nHash:[^\r\n]*\r?\n\r?\n/, '')
  .replace(/-----END PGP SIGNED MESSAGE-----\s*$/, '')
  .trim();
// Word tokens exclude the trailing alphanumeric OpenPGP key ID; it is not a message word.
const words = body.match(/\b[A-Za-z]+\b/g) || [];
if (words.length !== 43) throw new Error('Expected 43 signed-message words; got ' + words.length);

const tableVariants = {
  zeroBasedAddress: [221, 222, 223],
  oneBasedOrdinals: [220, 221, 222]
};
const wordOrigins = [0, 1];
const decodedVariants = {};
for (const [name, indices] of Object.entries(tableVariants)) {
  const values = indices.map((i) => grid.bytes[i]);
  const locations = indices.map((i) => locateTableIndex(grid, i));
  const tokens = locations.map((x) => x.token);
  const recomputed = tokens.map(decodeBase60);
  if (JSON.stringify(recomputed) !== JSON.stringify(values)) {
    throw new Error('Original token/base-60 check failed');
  }
  decodedVariants[name] = {
    indices,
    locations,
    tokens,
    values,
    base29: values.map(base29),
    base29Text: values.map(base29Text),
    wordPairs: Object.fromEntries(wordOrigins.map(origin => [
      'origin' + origin,
      values.map(v => wordPair(v, words, origin))
    ]))
  };
}
if (JSON.stringify(decodedVariants.zeroBasedAddress.values) !== JSON.stringify([52, 51, 151])) {
  throw new Error('Unexpected zero-based 221–223 values');
}
if (JSON.stringify(decodedVariants.zeroBasedAddress.tokens) !== JSON.stringify(['0q', '0p', '2V'])) {
  throw new Error('Original p51 tokens do not match the frozen triple');
}

// Verify that 151 is also present in the third Stage10 square (5x5/1033).
const squareValues = (read('resources/cicada2014-openpuff-magic-squares.txt').match(/-?\d+/g) || []).map(Number);
const squareSpecs = [
  { label: '5x5/3301', n: 5 },
  { label: '7x7/1033', n: 7 },
  { label: '5x5/1033', n: 5 }
];
let cursor = 0;
const squares = squareSpecs.map(spec => {
  const cells = squareValues.slice(cursor, cursor + spec.n * spec.n);
  cursor += spec.n * spec.n;
  return { ...spec, cells };
});
const square151 = squares.filter(s => s.label === '5x5/1033').flatMap(s =>
  s.cells.map((v, i) => v === 151 ? { row0: Math.floor(i / s.n), col0: i % s.n } : null).filter(Boolean)
);

// Reproduce the two natural direct additive key readings against p55.
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const p55Report = read('im-results/lp2-2016-p50-p55-43unit-source-selector-gate.md');
const interiorMatch = p55Report.match(/The interior sequence, represented as exact zero-based GP rune indices, is:\s*\n\s*\[([^\]]+)\]/);
if (!interiorMatch) throw new Error('Could not locate frozen 43-rune p55 interior');
const p55Interior = interiorMatch[1].split(',').map(x => Number(x.trim()));
if (p55Interior.length !== 43) throw new Error('Expected 43 p55 interiors');
const p55Full = corpus.pages.find(p => p.page === 55).indices;
const alphabet = corpus.translit;
const bytes = decodedVariants.zeroBasedAddress.values;
const keys = [
  { name: 'table-values-mod29', key: bytes.map(v => v % 29) },
  { name: 'concatenated-base29-digits', key: bytes.flatMap(base29) }
];
const directKeyTests = [];
for (const item of keys) {
  for (const [target, cipher] of [['p55-interior43', p55Interior], ['p55-full76', p55Full]]) {
    for (const sign of [-1, 1]) {
      directKeyTests.push({
        keyName: item.name,
        key: item.key,
        target,
        sign,
        output: render(addKey(cipher, item.key, sign), alphabet)
      });
    }
  }
}

console.log(JSON.stringify({
  signedWordCount: words.length,
  wordWindow0: words.slice(0, 28).map((word, index) => ({ index, word })),
  tableShape: '32x8 across LP2 pages 49-51',
  articleInputs: { 221YearCoincidence: 221, broodYears: [2013, 2014, 2015] },
  tableVariants: decodedVariants,
  stage10SquareCrossLink: { value: 151, positionsIn5x5_1033: square151 },
  directKeyTests
}, null, 2));
