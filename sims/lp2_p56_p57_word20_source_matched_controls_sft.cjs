'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
function read(relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8');
}

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const solved = JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

function parseRuneWords(sourceText) {
  const words = [];
  let current = [];
  for (const character of [...sourceText]) {
    const value = runeIndex.get(character);
    if (value !== undefined) current.push(value);
    else if (current.length && '•⁘⁜⁚ \n'.includes(character)) {
      words.push(current);
      current = [];
    }
  }
  if (current.length) words.push(current);
  return words;
}

function summarizeWords(indices, sourceName) {
  return indices.map((word, index) => ({
    sourceName,
    position: index + 1,
    word: word.map((value) => corpus.translit[value]).join(''),
    gp0: word.reduce((sum, value) => sum + value, 0),
  }));
}

const sections = solved.sections.map((section) => ({
  name: section.name,
  rows: summarizeWords(parseRuneWords(section.source_text), section.name),
}));
const p56Section = sections.find((section) => section.name === 'p56_an_end');
const p57Section = sections.find((section) => section.name === 'p57_parable');
assert.ok(p56Section && p57Section);
const p56Rows = p56Section.rows;
const p57Rows = p57Section.rows;
assert.equal(p56Rows.length, 25);
assert.equal(p57Rows.length, 20);
assert.deepEqual(
  [p56Rows[19].word, p56Rows[19].gp0, p57Rows[19].word, p57Rows[19].gp0],
  ['PILGRIM', 82, 'EMERGE', 83]
);
assert.deepEqual(
  [p56Rows[0].word, p56Rows[1].word, p57Rows[0].word],
  ['AN', 'END', 'PARABLE']
);

const tokens = grid.pages.flatMap((page) => page.tokens);
assert.equal(tokens.length, 256);
assert.deepEqual([tokens[82], tokens[83], tokens[127], tokens[128]], ['3L', '3D', '3D', '3L']);

const occurrences = new Map();
tokens.forEach((token, index) => {
  if (!occurrences.has(token)) occurrences.set(token, []);
  occurrences.get(token).push(index);
});
const nestedStarts = [];
for (let start = 0; start < tokens.length - 1; start += 1) {
  const first = occurrences.get(tokens[start]) || [];
  const second = occurrences.get(tokens[start + 1]) || [];
  if (
    first.length === 2 &&
    second.length === 2 &&
    first.includes(start) &&
    second.includes(start + 1) &&
    first[0] + first[1] === second[0] + second[1]
  ) {
    nestedStarts.push(start);
  }
}
assert.deepEqual(nestedStarts, [82, 127]);

function nestedAddressMatch(leftValue, rightValue) {
  const left = ((leftValue % 256) + 256) % 256;
  const right = ((rightValue % 256) + 256) % 256;
  return nestedStarts.find((start) => start === left && start + 1 === right) ?? null;
}

const targetHits = [];
for (let index = 0; index < 20; index += 1) {
  const start = nestedAddressMatch(p56Rows[index].gp0, p57Rows[index].gp0);
  if (start !== null) targetHits.push({ position: index + 1, start });
}
assert.deepEqual(targetHits, [{ position: 20, start: 82 }]);

// All pairings of the seven non-target records, plus each non-target record
// paired with p56 and p57. Pair order is the fixed section order in the
// pinned source corpus; the p56->p57 target pairing is excluded.
const targetNames = new Set(['p56_an_end', 'p57_parable']);
const pairings = [];
for (let leftIndex = 0; leftIndex < sections.length; leftIndex += 1) {
  for (let rightIndex = leftIndex + 1; rightIndex < sections.length; rightIndex += 1) {
    const left = sections[leftIndex];
    const right = sections[rightIndex];
    if (left.name === 'p56_an_end' && right.name === 'p57_parable') continue;
    const alignedLength = Math.min(left.rows.length, right.rows.length);
    const hits = [];
    for (let index = 0; index < alignedLength; index += 1) {
      const start = nestedAddressMatch(left.rows[index].gp0, right.rows[index].gp0);
      if (start !== null) {
        hits.push({
          position: index + 1,
          start,
          leftWord: left.rows[index].word,
          leftAddress: ((left.rows[index].gp0 % 256) + 256) % 256,
          rightWord: right.rows[index].word,
          rightAddress: ((right.rows[index].gp0 % 256) + 256) % 256,
        });
      }
    }
    const position20 = alignedLength >= 20 ? {
      leftWord: left.rows[19].word,
      leftAddress: ((left.rows[19].gp0 % 256) + 256) % 256,
      rightWord: right.rows[19].word,
      rightAddress: ((right.rows[19].gp0 % 256) + 256) % 256,
      start: nestedAddressMatch(left.rows[19].gp0, right.rows[19].gp0),
    } : null;
    pairings.push({
      left: left.name,
      right: right.name,
      counts: [left.rows.length, right.rows.length],
      alignedLength,
      position20,
      hits,
    });
  }
}
const nonTargetPairings = pairings.filter((pair) =>
  !targetNames.has(pair.left) && !targetNames.has(pair.right));
const anchorPairings = pairings.filter((pair) =>
  targetNames.has(pair.left) || targetNames.has(pair.right));
const position20Pairings = pairings.filter((pair) => pair.position20 !== null);
const allHits = pairings.flatMap((pair) =>
  pair.hits.map((hit) => ({ left: pair.left, right: pair.right, ...hit })));
const position20Hits = position20Pairings.filter((pair) => pair.position20.start !== null);
const alignedComparisons = pairings.reduce((sum, pair) => sum + pair.alignedLength, 0);

assert.equal(pairings.length, 35);
assert.equal(nonTargetPairings.length, 21);
assert.equal(anchorPairings.length, 14);
assert.equal(position20Pairings.length, 27);
assert.equal(alignedComparisons, 1433);
assert.deepEqual(allHits, []);
assert.deepEqual(position20Hits, []);

const nearestLengthPair = nonTargetPairings
  .map((pair) => ({
    left: pair.left,
    right: pair.right,
    counts: pair.counts,
    distance: Math.abs(pair.counts[0] - 25) + Math.abs(pair.counts[1] - 20),
  }))
  .sort((left, right) => left.distance - right.distance)[0];
assert.deepEqual(nearestLengthPair.counts, [31, 18]);
assert.equal(nearestLengthPair.distance, 8);
assert.equal(nonTargetPairings.some((pair) =>
  pair.counts[0] === 25 && pair.counts[1] === 20), false);

const controlWord20 = sections
  .filter((section) => !targetNames.has(section.name) && section.rows.length >= 20)
  .map((section) => ({
    name: section.name,
    wordCount: section.rows.length,
    word: section.rows[19].word,
    gp0Address: ((section.rows[19].gp0 % 256) + 256) % 256,
  }));

// Independent uniform word-order permutations preserve each page's word
// multiset. A second null keeps printed title words in their original slots.
let randomState = 0x20261119;
function nextRandomUint32() {
  randomState ^= randomState << 13;
  randomState ^= randomState >>> 17;
  randomState ^= randomState << 5;
  return randomState >>> 0;
}
function randomBelow(limit) {
  const range = 4294967296;
  const cutoff = range - (range % limit);
  let value;
  do {
    value = nextRandomUint32();
  } while (value >= cutoff);
  return value % limit;
}
function shuffled(rows) {
  const output = rows.slice();
  for (let index = output.length - 1; index > 0; index -= 1) {
    const other = randomBelow(index + 1);
    [output[index], output[other]] = [output[other], output[index]];
  }
  return output;
}
function permutationEvents(leftRows, rightRows) {
  let any = false;
  let at20 = null;
  for (let index = 0; index < 20; index += 1) {
    const start = nestedAddressMatch(leftRows[index].gp0, rightRows[index].gp0);
    if (start !== null) {
      any = true;
      if (index === 19) at20 = start;
    }
  }
  return { any, at20 };
}

const trials = 300000;
const counts = {
  fullShuffle: { at20: 0, any: 0, forwardAt20: 0, reverseAt20: 0 },
  titlesFixed: { at20: 0, any: 0, forwardAt20: 0, reverseAt20: 0 },
};
for (let trial = 0; trial < trials; trial += 1) {
  const full = permutationEvents(shuffled(p56Rows), shuffled(p57Rows));
  if (full.at20 !== null) {
    counts.fullShuffle.at20 += 1;
    if (full.at20 === 82) counts.fullShuffle.forwardAt20 += 1;
    if (full.at20 === 127) counts.fullShuffle.reverseAt20 += 1;
  }
  if (full.any) counts.fullShuffle.any += 1;

  const fixed56 = p56Rows.slice(0, 2).concat(shuffled(p56Rows.slice(2)));
  const fixed57 = p57Rows.slice(0, 1).concat(shuffled(p57Rows.slice(1)));
  const fixed = permutationEvents(fixed56, fixed57);
  if (fixed.at20 !== null) {
    counts.titlesFixed.at20 += 1;
    if (fixed.at20 === 82) counts.titlesFixed.forwardAt20 += 1;
    if (fixed.at20 === 127) counts.titlesFixed.reverseAt20 += 1;
  }
  if (fixed.any) counts.titlesFixed.any += 1;
}

const frequency = (rows, address) => rows.filter((row) =>
  ((row.gp0 % 256) + 256) % 256 === address).length;
const addressFrequencies = {
  p56: { 82: frequency(p56Rows, 82), 83: frequency(p56Rows, 83),
    127: frequency(p56Rows, 127), 128: frequency(p56Rows, 128) },
  p57: { 82: frequency(p57Rows, 82), 83: frequency(p57Rows, 83),
    127: frequency(p57Rows, 127), 128: frequency(p57Rows, 128) },
};
assert.deepEqual(addressFrequencies, {
  p56: { 82: 1, 83: 0, 127: 0, 128: 0 },
  p57: { 82: 0, 83: 1, 127: 0, 128: 0 },
});
assert.deepEqual(counts, {
  fullShuffle: { at20: 612, any: 11761, forwardAt20: 612, reverseAt20: 0 },
  titlesFixed: { at20: 702, any: 12256, forwardAt20: 702, reverseAt20: 0 },
});

const exactRates = {
  fullShuffle: { fixedPosition20: 1 / 500, anyAlignedPosition: 1 / 25 },
  titlesFixed: { fixedPosition20: 1 / 437, anyAlignedPosition: 18 / 437 },
};

console.log(JSON.stringify({
  status: 'PASS: source-matched controls and word-order permutation gates',
  target: {
    p56WordCount: p56Rows.length,
    p57WordCount: p57Rows.length,
    p56Position20: p56Rows[19],
    p57Position20: p57Rows[19],
    targetHits,
    nestedStarts,
  },
  sourceMatchedControls: {
    otherSourceRecords: sections.filter((section) => !targetNames.has(section.name)).length,
    pairings: pairings.length,
    nonTargetPairings: nonTargetPairings.length,
    p56OrP57AnchorPairings: anchorPairings.length,
    position20Pairings: position20Pairings.length,
    alignedPositionComparisons: alignedComparisons,
    allAlignedHits: allHits,
    position20Hits,
    controlWord20,
    nearestLengthPair,
    exact25By20ControlPairFound: false,
  },
  wordOrderPermutation: {
    seed: '0x20261119',
    trials,
    addressFrequencies,
    exactRates,
    observed: {
      fullShuffle: {
        ...counts.fullShuffle,
        fixedPosition20Rate: counts.fullShuffle.at20 / trials,
        anyAlignedPositionRate: counts.fullShuffle.any / trials,
      },
      titlesFixed: {
        ...counts.titlesFixed,
        fixedPosition20Rate: counts.titlesFixed.at20 / trials,
        anyAlignedPositionRate: counts.titlesFixed.any / trials,
      },
    },
  },
  interpretation: 'The position-20 pair is selective within this pinned solved-text control corpus and under word-order permutations. The GP0 sum, title-inclusive index, and zero-based table address remain inferred; this is navigation evidence, not an unknown-page decryption.',
}, null, 2));
