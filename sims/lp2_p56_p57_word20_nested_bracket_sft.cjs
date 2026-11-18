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

function summarizeWords(indices, page) {
  return indices.map((word, index) => ({
    page,
    position: index + 1,
    word: word.map((value) => corpus.translit[value]).join(''),
    gp0: word.reduce((sum, value) => sum + value, 0),
    gp1: word.reduce((sum, value) => sum + value + 1, 0),
    prime: word.reduce((sum, value) => sum + corpus.prime[value], 0),
  }));
}

function decode(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return high * alphabet.length + low;
}

function primePi(value) {
  let count = 0;
  for (let candidate = 2; candidate <= value; candidate += 1) {
    let prime = true;
    for (let divisor = 2; divisor * divisor <= candidate; divisor += 1) {
      if (candidate % divisor === 0) {
        prime = false;
        break;
      }
    }
    if (prime) count += 1;
  }
  return count;
}

const p56Section = solved.sections.find((section) => section.name === 'p56_an_end');
const p57Section = solved.sections.find((section) => section.name === 'p57_parable');
assert.ok(p56Section && p57Section);
const p56Rows = summarizeWords(parseRuneWords(p56Section.source_text), 56);
const p57Rows = summarizeWords(parseRuneWords(p57Section.source_text), 57);
assert.equal(p56Rows.length, 25);
assert.equal(p57Rows.length, 20);

assert.deepEqual(
  p56Rows.map((row) => row.word),
  'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE'.split(' ')
);
assert.deepEqual(
  p57Rows.map((row) => row.word),
  'PARABLE LICE THE INSTAR TUNNELNG TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIUINITY WITHIN AND EMERGE'.split(' ')
);

const tokens = grid.pages.flatMap((page) => page.tokens);
assert.equal(tokens.length, 256);
assert.deepEqual(grid.pages.map((page) => page.page), [49, 50, 51]);
const p49 = grid.pages.find((page) => page.page === 49);
const p50 = grid.pages.find((page) => page.page === 50);
assert.ok(p49 && p50);
assert.equal(p49.tokens.length, 80);
assert.equal(p50.tokens.length, 104);
const p50Start = p49.tokens.length;

const local = (globalIndex) => globalIndex - p50Start;
const coordinates = [82, 83, 105, 127, 128].map((globalIndex) => ({
  global: globalIndex,
  local: local(globalIndex),
  row: Math.floor(local(globalIndex) / 8),
  column: local(globalIndex) % 8,
}));
assert.deepEqual(coordinates, [
  { global: 82, local: 2, row: 0, column: 2 },
  { global: 83, local: 3, row: 0, column: 3 },
  { global: 105, local: 25, row: 3, column: 1 },
  { global: 127, local: 47, row: 5, column: 7 },
  { global: 128, local: 48, row: 6, column: 0 },
]);
assert.deepEqual(
  [p50.tokens[2], p50.tokens[3], p50.tokens[25], p50.tokens[47], p50.tokens[48]],
  ['3L', '3D', '13', '3D', '3L']
);

const occurrences = new Map();
tokens.forEach((token, index) => {
  if (!occurrences.has(token)) occurrences.set(token, []);
  occurrences.get(token).push(index);
});

const centerDuplicateClasses = [...occurrences.entries()]
  .filter(([, positions]) => positions.length === 2 && positions[0] + positions[1] === 210)
  .map(([token, positions]) => ({ token, positions }))
  .sort((left, right) => left.token.localeCompare(right.token));
assert.deepEqual(centerDuplicateClasses, [
  { token: '3D', positions: [83, 127] },
  { token: '3L', positions: [82, 128] },
]);
assert.deepEqual(occurrences.get('13'), [105]);

// The same nested duplicate pair appears forward at [82,83] and reversed at [127,128].
const adjacentNestedPairs = [];
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
    adjacentNestedPairs.push({
      start,
      center: (first[0] + first[1]) / 2,
      firstToken: tokens[start],
      firstOccurrences: first,
      secondToken: tokens[start + 1],
      secondOccurrences: second,
    });
  }
}
assert.deepEqual(adjacentNestedPairs.map((pair) => pair.start), [82, 127]);

const p56At20 = p56Rows[19];
const p57At20 = p57Rows[19];
assert.deepEqual(
  [p56At20.word, p56At20.gp0, p56At20.gp1, p56At20.prime],
  ['PILGRIM', 82, 89, 277]
);
assert.deepEqual(
  [p57At20.word, p57At20.gp0, p57At20.gp1, p57At20.prime],
  ['EMERGE', 83, 89, 300]
);

const alignedMatches = [];
for (let index = 0; index < 20; index += 1) {
  const left = p56Rows[index].gp0;
  const right = p57Rows[index].gp0;
  if (adjacentNestedPairs.some((pair) => pair.start === left && pair.start + 1 === right)) {
    alignedMatches.push(index + 1);
  }
}
assert.deepEqual(alignedMatches, [20]);

// Position 9 is consecutive (24,25), but does not form a repeated centered pair.
assert.deepEqual([p56Rows[8].gp0, p57Rows[8].gp0], [24, 25]);
assert.equal((occurrences.get(tokens[24]) || []).length, 1);
assert.equal((occurrences.get(tokens[25]) || []).length, 3);

// The aligned result requires counting the printed titles as words.
const p56Body = p56Rows.slice(2); // exclude title AN END
const p57Body = p57Rows.slice(1); // exclude title PARABLE
const bodyMatches = [];
for (let index = 0; index < Math.min(p56Body.length, p57Body.length); index += 1) {
  const left = p56Body[index].gp0;
  const right = p57Body[index].gp0;
  if (adjacentNestedPairs.some((pair) => pair.start === left && pair.start + 1 === right)) {
    bodyMatches.push(index + 1);
  }
}
assert.deepEqual(bodyMatches, []);
assert.deepEqual(
  [p56Body[18].word, p56Body[18].gp0, p57Body[18].word, p57Body[18].gp0],
  ['TO', 19, 'EMERGE', 83]
);

const divinity = p57Rows.find((row) => row.word === 'DIUINITY');
assert.deepEqual([divinity.position, divinity.gp0], [17, 105]);
assert.equal(tokens[105], '13');

const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace('f', '');
const outerValue = decode(tokens[82], alphabet60);
const innerValue = decode(tokens[83], alphabet60);
assert.deepEqual([outerValue, innerValue], [201, 193]);
assert.deepEqual([128 - 82, 127 - 83], [46, 44]);
assert.deepEqual([primePi(outerValue), primePi(innerValue)], [46, 44]);

const p56Within = p56Rows.find((row) => row.word === 'WITHIN');
const p57Circumferences = p57Rows.find((row) => row.word === 'CIRCUMFERENCES');
assert.equal(p56Within.gp0, 38);
assert.equal(tokens[38], '2D');
assert.equal(decode(tokens[38], alphabet59), 131);
assert.equal(p57Circumferences.gp0, 131);

const p56Web = p56Rows.find((row) => row.word === 'WEB');
const p57Find = p57Rows.find((row) => row.word === 'FIND');
assert.deepEqual([p56Web.gp0, p57Find.gp0], [42, 42]);
assert.equal(tokens[42], '0S');
assert.deepEqual([decode(tokens[42], alphabet59), decode(tokens[42], alphabet60)], [28, 28]);

const p56Page = p56Rows.find((row) => row.word === 'PAGE');
assert.equal(p56Page.gp0, 61);
assert.equal(tokens[61], '3G');
assert.equal(decode(tokens[61], alphabet59), 193);
assert.equal(decode(tokens[83], alphabet60), 193);

console.log(JSON.stringify({
  status: 'PASS: p56/p57 title-inclusive word20 selects the p50 nested duplicate bracket',
  wordCounts: { p56: p56Rows.length, p57: p57Rows.length },
  alignedWord20: {
    p56: p56At20,
    p57: p57At20,
    alignedMatches,
    titleExcludedMatches: bodyMatches,
    titleExcludedPosition19: { p56: p56Body[18], p57: p57Body[18] },
  },
  p50Bracket: {
    globalCellCoordinates: coordinates,
    duplicateClassesAtCenter105: centerDuplicateClasses,
    adjacentNestedPairStarts: adjacentNestedPairs.map((pair) => pair.start),
    centerToken: tokens[105],
    uniqueCenterTokenPositions: occurrences.get('13'),
    outerBase60Value: outerValue,
    innerBase60Value: innerValue,
    primeCountSeparations: [primePi(outerValue), primePi(innerValue)],
  },
  secondaryEdges: {
    p56WithinToP57Circumferences: {
      p56Gp0: p56Within.gp0,
      p50Token: tokens[38],
      base59: decode(tokens[38], alphabet59),
      p57Gp0: p57Circumferences.gp0,
    },
    p56WebAndP57FindToPage28: {
      p56Gp0: p56Web.gp0,
      p57Gp0: p57Find.gp0,
      p50Token: tokens[42],
      decoded59: decode(tokens[42], alphabet59),
      decoded60: decode(tokens[42], alphabet60),
    },
    p56PageToInnerValue: {
      p56Gp0: p56Page.gp0,
      p50Token: tokens[61],
      base59: decode(tokens[61], alphabet59),
      innerTokenBase60: decode(tokens[83], alphabet60),
    },
  },
  interpretation: 'Navigation hypothesis only. GP0 word-sum, title inclusion, and zero-based addressing remain inferred; no unknown plaintext or reversible receiver is recovered.',
}, null, 2));
