#!/usr/bin/env node
'use strict';

// Test the source-motivated 158-word / 158-flank-rune alignment.
// Run from the repository root with: node sims/lp2_158_word_flank_table_bridge_sft.cjs

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { parseLP2Words } = require('./lp2_word_pages.cjs');
const { buildSourceNativeTrigramModel } = require('./lp1_source_native_trigram_model.cjs');

const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const words = parseLP2Words(read('resources/lp2-transcription.txt'), 3);
const mod = (x, n) => ((x % n) + n) % n;
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const wordGP0 = words.map(w => [...w.runes].reduce((s, r) => s + runeIndex.get(r), 0));
const wordPrime = words.map(w => [...w.runes].reduce((s, r) => s + corpus.prime[runeIndex.get(r)], 0));
const p49 = corpus.pages.find(p => p.page === 49).indices;
const p51 = corpus.pages.find(p => p.page === 51).indices;
const flank = [...p49, ...p51];
const flankGP0 = flank;
const flankPrime = flank.map(i => corpus.prime[i]);
const alphabet = corpus.translit;
const languageModel = buildSourceNativeTrigramModel({
  corpus,
  referenceText: read('resources/liber-primus/lp1-plaintext-reference.txt')
});

assert.equal(words.length, 158);
assert.equal(words.reduce((s, w) => s + [...w.runes].length, 0), 729);
assert.deepEqual(wordPrime.slice(0, 2), [347, 315]);
assert.equal(p49.length, 66);
assert.equal(p51.length, 92);
assert.equal(flank.length, 158);
assert.equal(grid.bytes.length, 256);
assert.equal(grid.shape, '32 rows by 8 columns across LP2 pages 49, 50, 51');

function ioc(values) {
  const counts = Array(29).fill(0);
  for (const x of values) counts[x]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) / (values.length * (values.length - 1));
}
function cycleLengths(next) {
  const done = new Set();
  const lengths = [];
  for (let i = 0; i < next.length; i++) {
    if (done.has(i)) continue;
    const seen = new Map();
    const path = [];
    let at = i;
    while (!done.has(at) && !seen.has(at)) {
      seen.set(at, path.length);
      path.push(at);
      at = next[at];
    }
    if (seen.has(at)) lengths.push(path.length - seen.get(at));
    for (const x of path) done.add(x);
  }
  return lengths.sort((a, b) => a - b);
}
function trace(seed, next) {
  const seen = new Map();
  let at = seed;
  let n = 0;
  while (!seen.has(at)) {
    seen.set(at, n++);
    at = next[at];
  }
  return { transient: seen.get(at), cycle: n - seen.get(at), cycleStart: at };
}

const direct = [];
const pointerGraphs = [];
const tableBytes = [];
for (const [wordMode, wordNumbers] of [['GP0', wordGP0], ['prime', wordPrime]]) {
  for (const [keyMode, keyNumbers] of [['GP0', flankGP0], ['prime', flankPrime]]) {
    for (const sign of [1, -1]) {
      const values = wordNumbers.map((x, i) => mod(x + sign * keyNumbers[i], 29));
      direct.push({
        wordMode, keyMode, sign: sign > 0 ? '+' : '-',
        ioc: ioc(values),
        stream: values.map(x => alphabet[x]).join('')
      });

      const next = wordNumbers.map((x, i) => mod(x + sign * keyNumbers[i], 158));
      const seeds = wordNumbers.slice(0, 2).map(x => mod(x, 158));
      pointerGraphs.push({
        wordMode, keyMode, sign: sign > 0 ? '+' : '-',
        cycleLengths: cycleLengths(next),
        firstHeading: trace(seeds[0], next),
        secondHeading: trace(seeds[1], next)
      });
    }
  }

  // Treat each word number as an index into the 256-byte p50 table.
  // Then use the corresponding p49+p51 rune as an additive byte key.
  const data = wordNumbers.map(x => grid.bytes[mod(x, 256)]);
  for (const [keyMode, keyNumbers] of [['GP0', flankGP0], ['prime', flankPrime]]) {
    for (const sign of [1, -1]) {
      const bytes = data.map((x, i) => mod(x + sign * keyNumbers[i], 256));
      const printable = bytes.filter(x => x >= 32 && x <= 126).length;
      tableBytes.push({
        wordMode, keyMode, sign: sign > 0 ? '+' : '-',
        printable, printableRatio: printable / bytes.length,
        hex: Buffer.from(bytes).toString('hex'),
        latin1: Buffer.from(bytes).toString('latin1')
      });
    }
  }
}

const pageCounts = corpus.pages
  .filter(p => p.indices.length > 0)
  .map(p => ({ page: p.page, count: p.indices.length }));
const pairs158 = [];
for (let i = 0; i < pageCounts.length; i++) {
  for (let j = i + 1; j < pageCounts.length; j++) {
    if (pageCounts[i].count + pageCounts[j].count === 158) {
      pairs158.push([pageCounts[i], pageCounts[j]]);
    }
  }
}
assert.deepEqual(pairs158.map(pair => pair.map(x => x.page)), [[49, 51]]);


const tablePointers = [];
for (const [wordMode, wordNumbers] of [['GP0', wordGP0], ['prime', wordPrime]]) {
  const selectedFlank = wordNumbers.map(x => mod(grid.bytes[mod(x, 256)], 158));
  const flankValues = selectedFlank.map(i => flank[i]);
  tablePointers.push({
    direction: 'word-to-table-to-flank',
    wordMode,
    uniqueFlankSymbols: new Set(flankValues).size,
    ioc: ioc(flankValues),
    stream: flankValues.map(x => alphabet[x]).join('')
  });
}
for (const [keyMode, keyNumbers] of [['GP0', flankGP0], ['prime', flankPrime]]) {
  const selectedWords = keyNumbers.map(x => mod(grid.bytes[mod(x, 256)], 158));
  const values = selectedWords.map(i => mod(wordGP0[i], 29));
  tablePointers.push({
    direction: 'flank-to-table-to-word',
    keyMode,
    uniqueWordSelections: new Set(selectedWords).size,
    ioc: ioc(values),
    selectedWordIndices: selectedWords,
    stream: values.map(x => alphabet[x]).join('')
  });
}


const tableCoordinates = [];
for (const [wordMode, wordNumbers] of [['GP0', wordGP0], ['prime', wordPrime]]) {
  for (const [keyMode, keyNumbers] of [['GP0', flankGP0], ['prime', flankPrime]]) {
    for (const orientation of ['word-row', 'word-col']) {
      const bytes = wordNumbers.map((w, i) => {
        const row = orientation === 'word-row' ? mod(w, 32) : mod(keyNumbers[i], 32);
        const col = orientation === 'word-row' ? mod(keyNumbers[i], 8) : mod(w, 8);
        return grid.bytes[row * 8 + col];
      });
      const indices = bytes.map(x => mod(x, 29));
      const printable = bytes.filter(x => x >= 32 && x <= 126).length;
      tableCoordinates.push({
        wordMode, keyMode, orientation,
        printable, printableRatio: printable / bytes.length,
        trigramScore: languageModel.scoreStream(indices).mean,
        runeText: languageModel.spell(indices)
      });
    }
  }
}
let randomState = 0x33013301;
function randomGP29() {
  randomState ^= randomState << 13;
  randomState ^= randomState >>> 17;
  randomState ^= randomState << 5;
  return (randomState >>> 0) % 29;
}
const randomScores = Array.from({ length: 2000 }, () =>
  languageModel.scoreStream(Array.from({ length: 158 }, randomGP29)).mean
).sort((a, b) => a - b);


const chainSpecs = [];
for (const mode of ['gp', 'prime']) {
  for (const rule of ['mod28+1', 'onebased28']) {
    for (const offset of [0, 1]) {
      for (const sign of [1, -1]) chainSpecs.push({ mode, rule, offset, sign });
    }
  }
}
const wordRecords = words.map((w, i) => ({ gp: wordGP0[i], prime: wordPrime[i] }));
const flankDeltas = [
  p49.slice(1).map((x, i) => mod(x - p49[i], 29)),
  p51.slice(1).map((x, i) => mod(x - p51[i], 29))
];
function stepValue(x, rule, sign) {
  const v = rule === 'mod28+1' ? mod(x, 28) + 1 : mod(x - 1, 28) + 1;
  return mod(sign * v, 29);
}
function chainStepCounts(records) {
  return chainSpecs.map(spec => {
    let total = 0;
    const byPage = [];
    for (let page = 0; page < 2; page++) {
      const start = (page === 0 ? 0 : 66) + spec.offset;
      const d = flankDeltas[page];
      let matches = 0;
      for (let i = 0; i < d.length; i++) {
        if (d[i] === stepValue(records[start + i][spec.mode], spec.rule, spec.sign)) matches++;
      }
      total += matches;
      byPage.push(matches);
    }
    return { ...spec, sign: spec.sign > 0 ? '+' : '-', matches: total, p49Matches: byPage[0], p51Matches: byPage[1] };
  });
}
const observedChainCounts = chainStepCounts(wordRecords);
const fixedChainIndex = chainSpecs.findIndex(s =>
  s.mode === 'gp' && s.rule === 'onebased28' && s.offset === 0 && s.sign === 1
);
let permutationState = 0x3301c1ca;
function permutationRandom() {
  permutationState ^= permutationState << 13;
  permutationState ^= permutationState >>> 17;
  permutationState ^= permutationState << 5;
  return permutationState >>> 0;
}
function shuffleRange(records, start, end) {
  const out = records.slice();
  for (let i = end - 1; i > start; i--) {
    const j = start + permutationRandom() % (i - start + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
const chainNull = { n: 20000, fixedGE: 0, maxGE: 0, fixedSum: 0, maxSum: 0, maxima: [] };
for (let trial = 0; trial < chainNull.n; trial++) {
  let permuted = shuffleRange(wordRecords, 2, 66);
  permuted = shuffleRange(permuted, 66, 158);
  const counts = chainStepCounts(permuted).map(x => x.matches);
  const fixed = counts[fixedChainIndex];
  const maximum = Math.max(...counts);
  if (fixed >= observedChainCounts[fixedChainIndex].matches) chainNull.fixedGE++;
  if (maximum >= Math.max(...observedChainCounts.map(x => x.matches))) chainNull.maxGE++;
  chainNull.fixedSum += fixed;
  chainNull.maxSum += maximum;
  chainNull.maxima.push(maximum);
}
chainNull.maxima.sort((a, b) => a - b);
chainNull.fixedMean = chainNull.fixedSum / chainNull.n;
chainNull.maxMean = chainNull.maxSum / chainNull.n;
chainNull.fixedP = (chainNull.fixedGE + 1) / (chainNull.n + 1);
chainNull.familywiseP = (chainNull.maxGE + 1) / (chainNull.n + 1);
chainNull.maxP95 = chainNull.maxima[Math.floor(0.95 * (chainNull.n - 1))];
chainNull.maxP99 = chainNull.maxima[Math.floor(0.99 * (chainNull.n - 1))];
delete chainNull.maxima;

const report = {
  counts: {
    p0p2Words: words.length,
    p0p2Runes: words.reduce((s, w) => s + [...w.runes].length, 0),
    headingGP0Sums: wordGP0.slice(0, 2),
    headingPrimeSums: wordPrime.slice(0, 2),
    p49Runes: p49.length,
    p51Runes: p51.length,
    p49p51Runes: flank.length,
    p50TableBytes: grid.bytes.length
  },
  uniquePagePairSummingTo158: pairs158,
  directGP29Pads: direct,
  pointerGraphs: pointerGraphs.map(x => ({
    ...x,
    cycleLengths: x.cycleLengths,
    firstHeading: { transient: x.firstHeading.transient, cycle: x.firstHeading.cycle },
    secondHeading: { transient: x.secondHeading.transient, cycle: x.secondHeading.cycle }
  })),
  p50TableBytePads: tableBytes,
  tablePointers,
  sourceNativeLanguageControl: {
    trainingScore: languageModel.trainingScore,
    p57Score: languageModel.p57Score,
    random: {
      n: randomScores.length,
      mean: randomScores.reduce((s, x) => s + x, 0) / randomScores.length,
      p95: randomScores[Math.floor(0.95 * (randomScores.length - 1))],
      max: randomScores[randomScores.length - 1]
    }
  },
  tableCoordinates,
  chainStepAlignment: {
    definition: 'page-local flank difference = skip-zero GP0/prime word number, tested modulo-28 conventions',
    variants: observedChainCounts,
    fixedVariant: observedChainCounts[fixedChainIndex],
    pageLocalPermutationNull: chainNull
  }
};

console.log(JSON.stringify(report, null, 2));
