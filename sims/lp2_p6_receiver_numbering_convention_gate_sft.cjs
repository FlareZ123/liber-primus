'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), 'utf8').replace(/\r/g, '');
const mod29 = (x) => ((x % 29) + 29) % 29;

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const signed = read('resources/historical/cicada2016-4gq25-outguess.asc');

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, 'CW')
    .replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C')
    .replace(/Z/g, 'S')
    .replace(/[^A-Z]/g, '');
  const values = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith('ING', offset)) {
      values.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith('IO', offset)) {
      values.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, 'unmapped GP token');
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

const clear = signed
  .split('-----BEGIN PGP SIGNATURE-----')[0]
  .slice(signed.indexOf('Hello.'));
const source = clear
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word, index) => ({
    index,
    word: word.toUpperCase(),
    length: gp(word).length,
  }));
assert.equal(source.length, 43);

const parts = transcription.split(/^\s*%\s*$/m).slice(0, 55);
const allWords = [];
let current = [];
let startPage = -1;
let endPage = -1;
let startOffset = -1;

function flush() {
  if (!current.length) return;
  allWords.push({
    page: startPage,
    endPage,
    start: startOffset,
    values: current.slice(),
  });
  current = [];
}

for (let block = 0; block < parts.length; block += 1) {
  const page = block >= 50 ? block + 1 : block;
  let offset = 0;
  for (const char of parts[block]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) {
        startPage = page;
        startOffset = offset;
      }
      endPage = page;
      current.push(value);
      offset += 1;
    } else if (!/[\s/]/u.test(char)) {
      flush();
    }
  }
}
flush();

const canonical = allWords.filter((word) => word.page === word.endPage);
const pages = Array.from({ length: 56 }, (_, page) =>
  canonical.filter((word) => word.page === page)
);

const q = 4;
const K = 2;
const F = 0;
const H = [2,26,5,6];
const kinds = [
  'direct','direct','direct','direct','direct',
  'adj23','centerQ','direct','direct','direct','direct',
  'centerF','terminal',
];

function hPair3(values) {
  return [
    mod29(values[0] - values[2]),
    mod29(values[0] + values[2]),
    values[1],
  ];
}

function permutations(values) {
  const out = [];
  function visit(prefix, rest) {
    if (!rest.length) {
      out.push(prefix);
      return;
    }
    for (let i = 0; i < rest.length; i += 1) {
      visit(prefix.concat(rest[i]), rest.slice(0, i).concat(rest.slice(i + 1)));
    }
  }
  visit([], values);
  return out;
}

function orient(columns, reverseColumns, reverseVertical) {
  let output = columns.map((column) => column.slice());
  if (reverseVertical) output = output.map((column) => column.reverse());
  if (reverseColumns) output.reverse();
  return output.flat();
}

function addressGrid(roles, one, reverseColumns, reverseVertical) {
  const [r0,r1,r2,r3] = roles;
  const left = [r1,one,mod29(-r1),r0];
  const center = [r1,one,F,one,mod29(-r1)];
  const transition = [mod29(-r3),r2,mod29(-r0),one];
  const right = left.map((value, index) => mod29(value + transition[index]));
  return orient([left,center,right], reverseColumns, reverseVertical);
}

const grids = [];
for (const permutation of permutations(H)) {
  for (let signMask = 0; signMask < 16; signMask += 1) {
    const roles = permutation.map((value, index) =>
      mod29(((signMask >> index) & 1) ? -value : value)
    );
    for (const oneRaw of [1,-1]) {
      for (const reverseColumns of [false,true]) {
        for (const reverseVertical of [false,true]) {
          grids.push(addressGrid(
            roles,
            mod29(oneRaw),
            reverseColumns,
            reverseVertical
          ));
        }
      }
    }
  }
}
assert.equal(grids.length, 3072);
assert.equal(new Set(grids.map((grid) => grid.join(','))).size, 3072);

function structuralCount(page, lane, sourceLength, residue, localBase) {
  const words = pages[page];
  const kind = kinds[lane];
  const matchesOrdinal = (index) => mod29(index + localBase) === residue;
  let count = 0;

  if (kind === 'adj23') {
    if (sourceLength !== 5) return 0;
    for (let i = 0; i + 1 < words.length; i += 1) {
      if (
        matchesOrdinal(i) &&
        words[i].values.length === 2 &&
        words[i + 1].values.length === 3
      ) count += 1;
    }
    return count;
  }

  if (kind === 'centerQ' || kind === 'centerF') {
    const marker = kind === 'centerQ' ? q : F;
    for (let i = 0; i < words.length; i += 1) {
      const values = words[i].values;
      if (
        !matchesOrdinal(i) ||
        values.length !== sourceLength + 1 ||
        values.length % 2 !== 1
      ) continue;
      const middle = (values.length - 1) / 2;
      if (values[middle] === marker) count += 1;
    }
    return count;
  }

  if (kind === 'terminal') {
    for (let i = 0; i < words.length; i += 1) {
      const values = words[i].values;
      if (
        !matchesOrdinal(i) ||
        values.length !== sourceLength + 1 ||
        values[1] !== F ||
        i < K
      ) continue;
      const marker = words[i - K];
      if (
        marker.values.length === 3 &&
        hPair3(marker.values).join(',') === '2,1,0'
      ) count += 1;
    }
    return count;
  }

  for (let i = 0; i < words.length; i += 1) {
    if (
      matchesOrdinal(i) &&
      words[i].values.length === sourceLength
    ) count += 1;
  }
  return count;
}

const results = [];

for (const sourceBase of [0,1]) {
  for (const localBase of [0,1]) {
    let full = 0;
    const placements = new Map();

    for (const delta of grids) {
      for (let sourceStart = 0; sourceStart <= 30; sourceStart += 1) {
        for (let pageStart = 0; pageStart <= 43; pageStart += 1) {
          let complete = true;

          for (let lane = 0; lane < 13; lane += 1) {
            const sourceWord = source[sourceStart + lane];
            const residue = mod29(
              sourceWord.index + sourceBase + delta[lane]
            );
            if (!structuralCount(
              pageStart + lane,
              lane,
              sourceWord.length,
              residue,
              localBase
            )) {
              complete = false;
              break;
            }
          }

          if (complete) {
            full += 1;
            const key = sourceStart + '|' + pageStart;
            placements.set(key, (placements.get(key) || 0) + 1);
          }
        }
      }
    }

    results.push({
      sourceBase,
      localBase,
      full,
      placements: [...placements.entries()].map(([key,count]) => {
        const [sourceStart,pageStart] = key.split('|').map(Number);
        return { sourceStart, pageStart, count };
      }),
    });
  }
}

assert.deepEqual(results, [
  { sourceBase:0, localBase:0, full:0, placements:[] },
  {
    sourceBase:0,
    localBase:1,
    full:4,
    placements:[{ sourceStart:30, pageStart:30, count:4 }],
  },
  { sourceBase:1, localBase:0, full:0, placements:[] },
  { sourceBase:1, localBase:1, full:0, placements:[] },
]);

const directionResults = [];

for (const sourceDirection of [1,-1]) {
  for (const pageDirection of [1,-1]) {
    for (const deltaSign of [1,-1]) {
      let full = 0;
      const placements = new Map();

      for (const delta of grids) {
        for (let sourceStart = 0; sourceStart <= 30; sourceStart += 1) {
          for (let pageStart = 0; pageStart <= 43; pageStart += 1) {
            let complete = true;

            for (let lane = 0; lane < 13; lane += 1) {
              const sourceWord = source[
                sourceDirection === 1
                  ? sourceStart + lane
                  : sourceStart + 12 - lane
              ];
              const page =
                pageDirection === 1
                  ? pageStart + lane
                  : pageStart + 12 - lane;
              const residue = mod29(
                sourceWord.index + deltaSign * delta[lane]
              );

              if (!structuralCount(
                page,
                lane,
                sourceWord.length,
                residue,
                1
              )) {
                complete = false;
                break;
              }
            }

            if (complete) {
              full += 1;
              const key = sourceStart + '|' + pageStart;
              placements.set(key, (placements.get(key) || 0) + 1);
            }
          }
        }
      }

      directionResults.push({
        sourceDirection,
        pageDirection,
        deltaSign,
        full,
        placements: [...placements.entries()].map(([key,count]) => {
          const [sourceStart,pageStart] = key.split('|').map(Number);
          return { sourceStart, pageStart, count };
        }),
      });
    }
  }
}

assert.deepEqual(directionResults, [
  {
    sourceDirection:1,
    pageDirection:1,
    deltaSign:1,
    full:4,
    placements:[{ sourceStart:30, pageStart:30, count:4 }],
  },
  {
    sourceDirection:1,
    pageDirection:1,
    deltaSign:-1,
    full:4,
    placements:[{ sourceStart:30, pageStart:30, count:4 }],
  },
  { sourceDirection:1, pageDirection:-1, deltaSign:1, full:0, placements:[] },
  { sourceDirection:1, pageDirection:-1, deltaSign:-1, full:0, placements:[] },
  { sourceDirection:-1, pageDirection:1, deltaSign:1, full:0, placements:[] },
  { sourceDirection:-1, pageDirection:1, deltaSign:-1, full:0, placements:[] },
  { sourceDirection:-1, pageDirection:-1, deltaSign:1, full:0, placements:[] },
  { sourceDirection:-1, pageDirection:-1, deltaSign:-1, full:0, placements:[] },
]);

const visualChapters = [
  [0,2],[3,7],[8,14],[15,22],[23,26],
  [27,32],[33,39],[40,53],[54,55],
];
const sevenPageChapterStarts = visualChapters
  .filter(([start,end]) => end - start + 1 === 7)
  .map(([start]) => start);
const centeredThirteenPageStarts = sevenPageChapterStarts
  .map((chapterStart) => chapterStart - 3)
  .filter((start) => start >= 0 && start + 12 <= 55);

assert.deepEqual(sevenPageChapterStarts, [8,33]);
assert.deepEqual(centeredThirteenPageStarts, [5,30]);

console.log(JSON.stringify({
  status:'PASS',
  family: {
    addressGrids: 3072,
    sourceWindows: 31,
    pageIntervals: 44,
    numberingConventions: 4,
    sourceDirections: 2,
    pageDirections: 2,
    deltaSigns: 2,
  },
  numberingResults: results,
  directionResults,
  sourceVisibleChapterConsequence: {
    sevenPageChapterStarts,
    thirteenPageIntervalsWithThreePageFlanks: centeredThirteenPageStarts,
    selectedByFullAddressFamily: 30,
  },
  decision:
    'Only zero-based source indices, one-based local ordinals, forward source order and forward page order admit a full placement. Delta sign is a label symmetry of the signed grid family, not a second placement.',
}, null, 2));
