#!/usr/bin/env node
'use strict';

// Compare the source-published 29-sign Futhorc equivalent-letter table with
// the repository's GP29 labels. This is a transcription-map audit, not a
// cipher search: rune indices are never permuted or transformed.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const gp = corpus.translit;

// Millward & Hayes, A Biography of the English Language, 3e (2010), Table 5.3.
// The table's Equivalent column; its separate Probable Value column is below.
const tableEquivalent = [
  'F','U','TH','O','R','C','G','W','H','N','I','Y','EO','P','H',
  'S','T','B','E','M','L','NG','OE','D','A','AE','Y','IO','EA'
];
const probableIPA = [
  '/f/','/u/','/θ/','/o/','/r/','/k/','/g/','/w/','/h/','/n/','/i/',
  '/j/','/eə/?','/p/','/x/','/s/','/t/','/b/','/e/','/m/','/l/','/ŋ/',
  '/œ/','/d/','/a/','/æ/','/y/','/io/? /ia/?','/æə/'
];
assert.equal(gp.length, 29);
assert.equal(tableEquivalent.length, 29);
assert.equal(probableIPA.length, 29);
assert.deepEqual(gp, [
  'F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X',
  'S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'
]);

const changed = [];
for (let i = 0; i < 29; i++) {
  if (gp[i] !== tableEquivalent[i]) changed.push(i);
}
assert.deepEqual(changed, [11, 14, 27]);

const unknownPages = corpus.pages.filter(p => p.page <= 55);
const unknown = unknownPages.flatMap(p => p.indices);
const p57 = corpus.pages.find(p => p.page === 57).indices;
assert.equal(unknown.length, 12956);
assert.equal(unknownPages.length, 56);
assert.equal(corpus.pages.find(p => p.page === 50).indices.length, 0);

const count = (xs, value) => xs.reduce((n, x) => n + (x === value ? 1 : 0), 0);
const differences = changed.map(i => ({
  runeIndex: i,
  gpLabel: gp[i],
  tableEquivalent: tableEquivalent[i],
  probableIPA: probableIPA[i],
  unknownCount: count(unknown, i),
  p57Count: count(p57, i)
}));
const changedUnknownLabels = differences.reduce((s, x) => s + x.unknownCount, 0);
const p57ChangedLabels = differences.reduce((s, x) => s + x.p57Count, 0);
const p57GP = p57.map(i => gp[i]).join('');
const p57Table = p57.map(i => tableEquivalent[i]).join('');
assert.equal(changedUnknownLabels, 1378);
assert.equal(p57ChangedLabels, 0);
assert.equal(p57GP, p57Table);

const duplicateLabels = Object.fromEntries(
  [...new Set(tableEquivalent)].filter(label => tableEquivalent.filter(x => x === label).length > 1)
    .map(label => [label, tableEquivalent.flatMap((x, i) => x === label ? [i] : [])])
);
assert.deepEqual(duplicateLabels, { H: [8, 14], Y: [11, 26] });

console.log(JSON.stringify({
  sourceMap: 'Millward & Hayes (2010), Table 5.3, 29-sign English Futhorc',
  gpLabels: gp,
  tableEquivalent,
  probableIPA,
  changedIndices: differences,
  unknownRuneCount: unknown.length,
  changedUnknownLabels,
  changedFraction: changedUnknownLabels / unknown.length,
  duplicateEquivalentLabels: duplicateLabels,
  p57RuneCount: p57.length,
  p57ChangedLabels,
  p57Canonical: p57GP,
  p57TableEquivalent: p57Table,
  indexStreamInvariant: true,
  conclusion: 'The table changes only display labels; /j/ and /x/ match GP J/X, while Eoh and Ior values remain uncertain. No complete distinct source-fixed phonetic cipher map is supplied.'
}, null, 2));
