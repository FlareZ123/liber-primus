'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const transcript = fs.readFileSync(path.join(root, 'resources/lp2-transcription.txt'), 'utf8');
const frequencyText = fs.readFileSync(path.join(root, 'resources/control/english_wordfreq_textblob.txt'), 'utf8');

const page = corpus.pages.find((p) => p.page === 32);
assert(page);
assert.equal(page.indices.length, 121);
const runeIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));
const prime = corpus.prime;
const translit = corpus.translit;
const runePattern = /[\u16A0-\u16FF]/gu;

function words(source) {
  return source.split('-').map((piece) => (piece.match(runePattern) || []).join('')).filter(Boolean);
}

const rawPage = transcript.split('%')[32].replace(/\/\s*/gu, '');
const clauses = rawPage.split(/[.&$§]/u).map(words).filter((clause) => clause.length);
assert.deepEqual(clauses.map((clause) => clause.length), [7, 15]);
const tokens = clauses.flat();
const wordMeta = [];
let offset = 0;
for (let i = 0; i < tokens.length; i++) {
  const runes = [...tokens[i]];
  const indices = runes.map((rune) => runeIndex.get(rune));
  assert(indices.every(Number.isInteger));
  wordMeta.push({ word: i + 1, start: offset, end: offset + runes.length - 1, indices, transliteration: indices.map((x) => translit[x]).join('') });
  offset += runes.length;
}
assert.equal(tokens.length, 22);
assert.equal(offset, 121);
assert.deepEqual(wordMeta.map((w) => w.indices.length), [1, 3, 5, 11, 5, 5, 3, 11, 6, 9, 5, 8, 4, 9, 4, 8, 2, 3, 2, 8, 5, 4]);
assert.deepEqual(wordMeta.flatMap((w) => w.indices), page.indices);

const axis = new Set([
  ...Array.from({ length: 11 }, (_, c) => c),
  ...Array.from({ length: 11 }, (_, r) => 11 * r)
]);
const edgeWindows = [];
for (const word of wordMeta) {
  if (word.indices.length < 4) continue;
  for (const [edge, slice, start] of [
    ['prefix', word.indices.slice(0, 4), word.start],
    ['suffix', word.indices.slice(-4), word.end - 3]
  ]) {
    const text = slice.map((i) => translit[i]).join('');
    const singleLetter = slice.every((i) => /^[A-Z]$/u.test(translit[i]));
    edgeWindows.push({ word: word.word, edge, start, indices: slice, text, singleLetter });
  }
}
const uniqueEdges = [...new Map(edgeWindows.map((e) => [e.start + ':' + e.indices.join(','), e])).values()];
assert.equal(edgeWindows.length, 32);
assert.equal(uniqueEdges.length, 29);
const singleLetterEdges = uniqueEdges.filter((e) => e.singleLetter);
assert.equal(singleLetterEdges.length, 9);

const wordFrequency = new Set(
  frequencyText.split(/\r?\n/u)
    .map((line) => line.trim().match(/^([a-z]{4})\s+\d+/u)?.[1]?.toUpperCase())
    .filter(Boolean)
);
assert.equal(wordFrequency.size, 1809);
const dictionaryEdges = singleLetterEdges.filter((e) => wordFrequency.has(e.text));
assert.deepEqual(dictionaryEdges.map((e) => [e.start, e.text]).sort((a, b) => a[0] - b[0]), [[33, 'HOME'], [93, 'BUDS']]);

const validEdgePairs = [];
for (const a of uniqueEdges) {
  for (const b of uniqueEdges) {
    if (b.start - a.start !== 60) continue;
    const row = Math.floor(a.start / 11);
    const col = a.start % 11;
    if (row <= 5 && col <= 5) validEdgePairs.push({ start: a.start, end: b.start, from: a.text, to: b.text, row, col });
  }
}
assert.deepEqual(validEdgePairs.map((p) => [p.start, p.end]), [[4, 64], [16, 76], [25, 85], [33, 93], [44, 104]]);
const home = uniqueEdges.find((e) => e.start === 33 && e.text === 'HOME');
const buds = uniqueEdges.find((e) => e.start === 93 && e.text === 'BUDS');
assert(home && buds);

const primeSum = (indices) => indices.reduce((sum, i) => sum + prime[i], 0);
const endpointSum = primeSum(home.indices) + primeSum(buds.indices);
const pathOffsets = [33, 45, 57, 69, 81, 93];
const pathIndices = pathOffsets.map((i) => page.indices[i]);
const innerPositions = pathOffsets.slice(1, -1);
const innerWeights = innerPositions.map((i) => prime[page.indices[i]]);
const innerSum = innerWeights.reduce((a, b) => a + b, 0);
assert.deepEqual(pathIndices.map((i) => translit[i]), ['H', 'B', 'M', 'IA', 'NG', 'B']);
assert.deepEqual(innerWeights, [61, 71, 107, 79]);
assert.equal(endpointSum, 374);
assert.equal(innerSum, 318);

const sector = (angle) => Math.round((((angle % 360) + 360) % 360) / 45) % 8;
const directionNames = ['E', 'NE', 'N', 'NW', 'W', 'SW', 'S', 'SE'];
assert.equal(directionNames[sector(endpointSum)], 'E');
assert.equal(directionNames[sector(innerSum)], 'SE');

const diagonalSums = [];
for (let row = 0; row <= 5; row++) {
  for (let col = 0; col <= 5; col++) {
    const start = 11 * row + col;
    const end = start + 60;
    const inner = [1, 2, 3, 4].map((k) => prime[page.indices[start + 12 * k]]);
    diagonalSums.push({ row, col, start, end, innerWeights: inner, innerSum: inner.reduce((a, b) => a + b, 0) });
  }
}
const exact318Diagonals = diagonalSums.filter((d) => d.innerSum === 318);
assert.deepEqual(exact318Diagonals.map((d) => d.start).sort((a, b) => a - b), [33, 35, 45]);

// Manual transcription of the 4×4 square on LP2 physical p15, original image
// resources/liber-primus/32.jpg. The red 3299 marks the spiral start.
const p15Square = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820]
];
const spiralCoordinates = [
  [1, 1], [1, 2], [2, 2], [2, 1],
  [2, 0], [1, 0], [0, 0], [0, 1],
  [0, 2], [0, 3], [1, 3], [2, 3],
  [3, 3], [3, 2], [3, 1], [3, 0]
];
const spiral = spiralCoordinates.map(([r, c]) => p15Square[r][c]);
assert.equal(spiral[10], 2838);
assert.equal(2838 % 360, 318);
assert.equal(sector(2838), 7);

// The 11th spiral entry's established Fibonacci index / zero-based prime order is also an address into p32.
// Prime rank is one-based; convert it to the canonical zero-based rune offset.
function primeRank(n) {
  let count = 0;
  for (let candidate = 2; candidate <= n; candidate++) {
    let isPrime = true;
    for (let d = 2; d * d <= candidate; d++) {
      if (candidate % d === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) count++;
  }
  return count;
}
const spiralComplement = 3301 - spiral[10];
const oneBasedPrimeOrdinal = primeRank(spiralComplement);
const fibonacciIndex = oneBasedPrimeOrdinal - 1; // p15 construction: 3301-v = p_(F+1)
const zeroBasedPrimeOrder = fibonacciIndex;
const addressedOffset = fibonacciIndex;
const addressedWord = wordMeta.find((w) => w.start === addressedOffset);
assert.equal(spiralComplement, 463);
assert.equal(oneBasedPrimeOrdinal, 90);
assert.equal(fibonacciIndex, 89);
assert.equal(zeroBasedPrimeOrder, 89);
assert.equal(addressedOffset, 89);
assert.equal(addressedWord?.transliteration, 'OENGOMBUDS');
const addressedSuffixStart = addressedWord.end - 3;
const addressedSuffix = addressedWord.indices.slice(-4).map((i) => translit[i]).join('');
assert.equal(addressedSuffixStart, 93);
assert.equal(addressedSuffix, 'BUDS');

// The modulo-121 reading is only a possible page pointer, not a cipher.
const p55 = corpus.pages.find((p) => p.page === 55);
assert.equal(spiral[10] % 121, 55);
assert.equal(p55.indices.length, 76);

const xAxes = page.indices.slice(0, 11).map((i) => prime[i]);
const yAxes = Array.from({ length: 11 }, (_, r) => prime[page.indices[11 * r]]);
const bounds = (steps) => [0, ...steps.reduce((acc, n) => (acc.push(acc[acc.length - 1] + n), acc), [0]).slice(1)];
const xBounds = bounds(xAxes);
const yBounds = bounds(yAxes);
assert.deepEqual(xBounds, [0, 73, 78, 179, 198, 299, 302, 345, 452, 465, 484, 563]);
assert.deepEqual(yBounds, [0, 73, 96, 101, 124, 203, 262, 315, 394, 453, 562, 569]);
const tileCells = [[3, 0], [4, 1], [5, 2], [6, 3], [7, 4], [8, 5]];
const tileRectangles = tileCells.map(([r, c]) => ({
  cell: [r, c],
  x: [xBounds[c], xBounds[c + 1]],
  y: [yBounds[r], yBounds[r + 1]]
}));
assert.deepEqual(tileRectangles.map((t) => [t.x, t.y]), [
  [[0, 73], [101, 124]],
  [[73, 78], [124, 203]],
  [[78, 179], [203, 262]],
  [[179, 198], [262, 315]],
  [[198, 299], [315, 394]],
  [[299, 302], [394, 453]]
]);

// Exact within-word conditional null: hold the 21 axes fixed and permute
// each word's free rune multiset independently. Enumerate all endpoint
// placements and the four interior path-cell placements.
function kPermutations(items, k) {
  const out = [];
  const visit = (chosen, used) => {
    if (chosen.length === k) {
      out.push(chosen.map((i) => items[i]));
      return;
    }
    for (let i = 0; i < items.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      chosen.push(i);
      visit(chosen, used);
      chosen.pop();
      used[i] = false;
    }
  };
  visit([], Array(items.length).fill(false));
  return out;
}
const word8 = wordMeta[7].indices;
const word16 = wordMeta[15].indices;
const word8Free = word8.slice(1); // first rune H at offset 33 is a fixed axis cell
const prefixOptions = kPermutations(word8Free, 3).map((tail) => [word8[0], ...tail])
  .filter((q) => q.every((i) => /^[A-Z]$/u.test(translit[i])) && wordFrequency.has(q.map((i) => translit[i]).join('')));
const suffixOptions = kPermutations(word16, 4)
  .filter((q) => q.every((i) => /^[A-Z]$/u.test(translit[i])) && wordFrequency.has(q.map((i) => translit[i]).join('')));
assert.equal(prefixOptions.length, 9);
assert.equal(suffixOptions.length, 3);
const endpointE = [];
for (const a of prefixOptions) {
  for (const b of suffixOptions) {
    const sum = primeSum(a) + primeSum(b);
    if (sector(sum) === 0) endpointE.push({ from: a.map((i) => translit[i]).join(''), to: b.map((i) => translit[i]).join(''), sum });
  }
}
assert.equal(endpointE.length, 7);

const innerFreePrimeLists = innerPositions.map((position) => {
  const word = wordMeta.find((w) => position >= w.start && position <= w.end);
  const freePositions = Array.from({ length: word.indices.length }, (_, i) => word.start + i).filter((p) => !axis.has(p));
  return freePositions.map((p) => prime[page.indices[p]]);
});
assert.deepEqual(innerFreePrimeLists.map((x) => x.length), [5, 8, 7, 8]);
let innerTotal = 0;
let inner318 = 0;
for (const a of innerFreePrimeLists[0]) {
  for (const b of innerFreePrimeLists[1]) {
    for (const c of innerFreePrimeLists[2]) {
      for (const d of innerFreePrimeLists[3]) {
        innerTotal++;
        if (a + b + c + d === 318) inner318++;
      }
    }
  }
}
assert.equal(innerTotal, 2240);
assert.equal(inner318, 18);
const jointNumerator = endpointE.length * inner318;
const jointDenominator = 720 * 1680 * innerTotal;
assert.equal(jointNumerator, 126);
assert.equal(jointDenominator / jointNumerator, 21504000);

const result = {
  status: 'conditional route candidate; not a decryption',
  words: { count: tokens.length, lengths: wordMeta.map((w) => w.indices.length) },
  edgeWindows: { raw: edgeWindows.length, unique: uniqueEdges.length, singleLetter: singleLetterEdges.length, frequencyWords: dictionaryEdges.map((e) => ({ start: e.start, word: e.text, token: e.word, edge: e.edge })) },
  validSouthEastWordEdgePairs: validEdgePairs,
  route: { pathOffsets, runeLabels: pathIndices.map((i) => translit[i]), endpointSum, endpointDirection: 'E', innerWeights, innerSum, innerDirection: 'SE' },
  otherExact318Diagonals: exact318Diagonals,
  p15Spiral: { values: spiral, eleventh: spiral[10], modulo360: spiral[10] % 360, complement: spiralComplement, oneBasedPrimeOrdinal, fibonacciIndex, zeroBasedPrimeOrder, addressedOffset, addressedWord: addressedWord.transliteration, addressedSuffix, modulo121: spiral[10] % 121, possibleTargetPage: 55, targetPageRuneCount: p55.indices.length },
  tileRectangles,
  conditionalNull: {
    lexicon: 'resources/control/english_wordfreq_textblob.txt',
    endpointDictionaryOptions: [prefixOptions.length, suffixOptions.length],
    endpointEastPairs: endpointE.length,
    inner318: [inner318, innerTotal],
    joint: [jointNumerator, jointDenominator],
    probability: '1/21504000'
  },
  caveat: 'The 4-rune edge extraction and 11th-spiral selector are plausible source-guided choices, not explicit instructions. The exact 3301-complement→p90→F=89 address matches p32 zero-based offset 89, but no reversible downstream readout is established; 2838 mod 121 = 55 is only a possible p55 page pointer. The conditional null is not familywise over alternative pages, fragment lengths, spirals, or operations.'
};
process.stdout.write(JSON.stringify(result, null, 2) + '\n');
