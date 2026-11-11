#!/usr/bin/env node
'use strict';

// Reproduce the exploratory p32 / p57 PARABLE mod-19 word-index route.
// Run from the repository root: node sims/p32_parable_mod19_route_sft.cjs
// This is a candidate semantic alignment, not a cipher/decryption claim.

const fs = require('node:fs');
const assert = require('node:assert/strict');

const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const transcription = fs.readFileSync('resources/lp2-transcription.txt', 'utf8');
const pages = transcription.split('%');
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const prime = (r) => corpus.prime[runeIndex.get(r)];

function parseWords(page) {
  const words = [];
  let current = '';
  for (const ch of page) {
    if (runeIndex.has(ch)) current += ch;
    else if (ch === '/' || /\s/u.test(ch)) continue; // printed line-wrap, not a word boundary
    else if (current) { words.push(current); current = ''; }
  }
  if (current) words.push(current);
  return words;
}
const sumWord = (word) => [...word].reduce((sum, rune) => sum + prime(rune), 0);

const parableTokens = parseWords(pages[56]);
const parableTitle = parableTokens[0];
const parableBody = parableTokens.slice(1);
const labels = [
  'LIKE', 'THE', 'INSTAR', 'TUNNELING', 'TO', 'THE', 'SURFACE',
  'WE', 'MUST', 'SHED', 'OUR', 'OWN', 'CIRCUMFERENCES', 'FIND',
  'THE', 'DIVINITY', 'WITHIN', 'AND', 'EMERGE'
];
assert.equal(parableBody.length, 19);
assert.equal(labels.length, 19);

const parableSums = parableBody.map(sumWord);
const next = parableSums.map((sum) => sum % 19);
// One-based alternative: residue 0 selects body word 19; residue r>0 selects word r.
const oneBasedNext = parableSums.map((sum) => { const r = sum % 19; return r === 0 ? 18 : r - 1; });

function findCycles(mapping) {
  const done = new Set();
  const cycles = [];
  const cycleKeys = new Set();
  for (let start = 0; start < mapping.length; start++) {
    const path = [];
    const seen = new Map();
    let x = start;
    while (!done.has(x) && !seen.has(x)) {
      seen.set(x, path.length);
      path.push(x);
      x = mapping[x];
    }
    if (seen.has(x)) {
      const cycle = path.slice(seen.get(x));
      const key = [...cycle].sort((a, b) => a - b).join(',');
      if (!cycleKeys.has(key)) { cycles.push(cycle); cycleKeys.add(key); }
    }
    path.forEach((v) => done.add(v));
  }
  return cycles;
}
function walk(mapping, start) {
  const path = [];
  const seen = new Set();
  let x = start;
  while (!seen.has(x)) { path.push(x); seen.add(x); x = mapping[x]; }
  return path;
}

const p32Words = parseWords(pages[32]);
assert.equal(p32Words.length, 22);
const selectedWord = p32Words[7];
assert.equal([...selectedWord].length, 11);

const p32Indices = corpus.pages[32].indices;
assert.equal(p32Indices.length, 121);
const matrix = Array.from({ length: 11 }, (_, r) =>
  p32Indices.slice(r * 11, (r + 1) * 11).map((i) => corpus.prime[i])
);
const row3 = matrix[3];
assert.deepEqual([...selectedWord].map((r) => runeIndex.get(r)), p32Indices.slice(33, 44));
const row3Residues = row3.map((v) => v % 19);
const row3Labels = row3Residues.map((i) => labels[i]);
const eastFromCentre = row3Residues.slice(5).map((i) => labels[i]);
const westFromCentre = row3Residues.slice(0, 6).reverse().map((i) => labels[i]);

const row3Sum = row3.reduce((a, b) => a + b, 0);
const row3Prefix9 = row3.slice(0, 9).reduce((a, b) => a + b, 0);
const row6Sum = matrix[6].reduce((a, b) => a + b, 0);
const row6Prefix9 = matrix[6].slice(0, 9).reduce((a, b) => a + b, 0);
const titleSum = sumWord(parableTitle);

const residueMatrix = matrix.map((row) => row.map((v) => v % 19));
const target = [0, 13, 15, 16];
const directions = [
  [-1, -1, 'NW'], [-1, 0, 'N'], [-1, 1, 'NE'], [0, -1, 'W'],
  [0, 1, 'E'], [1, -1, 'SW'], [1, 0, 'S'], [1, 1, 'SE']
];
const hits = [];
let directedWindows = 0;
for (let r = 0; r < 11; r++) for (let c = 0; c < 11; c++) {
  for (const [dr, dc, direction] of directions) {
    const coords = target.map((_, k) => [r + dr * k, c + dc * k]);
    if (coords.some(([rr, cc]) => rr < 0 || rr >= 11 || cc < 0 || cc >= 11)) continue;
    directedWindows++;
    if (coords.every(([rr, cc], k) => residueMatrix[rr][cc] === target[k])) {
      hits.push({ start: [r, c], direction, coords });
    }
  }
}
assert.equal(directedWindows, 608);

const counts = Array(19).fill(0);
residueMatrix.flat().forEach((v) => counts[v]++);
const permutationNullExpected = directedWindows *
  (counts[0] / 121) * (counts[13] / 120) *
  (counts[15] / 119) * (counts[16] / 118);

const pgpText = fs.readFileSync('resources/historical/cicada2016-4gq25-outguess.asc', 'utf8');
const begin = pgpText.indexOf('-----BEGIN PGP SIGNATURE-----');
const end = pgpText.indexOf('-----END PGP SIGNATURE-----');
assert(begin >= 0 && end > begin);
const armor = pgpText.slice(begin, end).split(/\r?\n\r?\n/).slice(1).join('\n');
const base64 = armor.split(/\r?\n/).filter((line) => line && !line.startsWith('=')).join('');
const packet = Buffer.from(base64, 'base64');
assert.equal(packet[0], 0x89);
const signatureBodyBytes = packet.readUInt16BE(1);
assert.equal(packet.length, signatureBodyBytes + 3);

const graphCycles = findCycles(next);
const oneBasedCycles = findCycles(oneBasedNext);
const oneBasedEast = row3Residues.slice(5).map((r) => labels[r === 0 ? 18 : r - 1]);
const output = {
  classification: 'exploratory semantic route; not a decoder',
  parable: {
    bodyWordCount: parableBody.length,
    titlePrimeSum: titleSum,
    words: labels.map((word, i) => ({
      index: i, word, gpPrimeSum: parableSums[i],
      nextIndex: next[i], nextWord: labels[next[i]]
    })),
    cycles: graphCycles.map((cycle) => cycle.map((i) => labels[i])),
    walkFromLike: walk(next, 0).map((i) => labels[i])
  },
  oneBasedControl: {
    eastFromCentre: oneBasedEast,
    cycles: oneBasedCycles.map((cycle) => cycle.map((i) => labels[i]))
  },
  p32: {
    wordIndex: 7,
    wordTransliteration: [...selectedWord].map((r) => corpus.translit[runeIndex.get(r)]).join(''),
    runePrimeValues: row3,
    residuesModulo19: row3Residues,
    mappedWords: row3Labels,
    fromCentreEast: eastFromCentre,
    fromCentreWest: westFromCentre,
    row3Sum,
    row3Prefix9Sum: row3Prefix9,
    row6Sum,
    row6Prefix9Sum: row6Prefix9,
    uniqueFourCellHits: hits
  },
  2016: {
    asciiArmoredFileBytes: Buffer.byteLength(pgpText, 'utf8'),
    signaturePacketBytes: packet.length,
    signaturePacketBodyBytes: signatureBodyBytes
  },
  permutationControl: {
    directedLength4Windows: directedWindows,
    residueCounts: counts,
    expectedOccurrencesUnderRandomPermutationOfFixedResidueMultiset: permutationNullExpected
  }
};

assert.equal(titleSum, 449);
assert.equal(row3Sum, signatureBodyBytes);
assert.equal(row3Prefix9, titleSum);
assert.equal(row6Prefix9, titleSum);
assert.equal(row6Sum, 577);
assert.deepEqual(row3Residues.slice(5, 9), target);
assert.deepEqual(oneBasedEast.slice(0, 4), ['EMERGE', 'CIRCUMFERENCES', 'THE', 'DIVINITY']);
assert.deepEqual(oneBasedCycles.map((cycle) => cycle.map((i) => labels[i])), [['THE']]);
assert.equal(hits.length, 1);
assert.deepEqual(hits[0], {
  start: [3, 5], direction: 'E',
  coords: [[3, 5], [3, 6], [3, 7], [3, 8]]
});
console.log(JSON.stringify(output, null, 2));
