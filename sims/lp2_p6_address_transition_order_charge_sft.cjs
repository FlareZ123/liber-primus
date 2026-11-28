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
  const output = [];
  function visit(prefix, rest) {
    if (!rest.length) {
      output.push(prefix);
      return;
    }
    for (let i = 0; i < rest.length; i += 1) {
      visit(prefix.concat(rest[i]), rest.slice(0, i).concat(rest.slice(i + 1)));
    }
  }
  visit([], values);
  return output;
}

const hPermutations = permutations(H);
const transitionOrders = permutations([0,1,2,3]);

const lengths = [...new Set(source.map((word) => word.length))];
const masks = new Map();

for (let page = 0; page < 56; page += 1) {
  for (let lane = 0; lane < 13; lane += 1) {
    for (const length of lengths) {
      let mask = 0n;
      const words = pages[page];
      const kind = kinds[lane];
      const add = (index) => {
        mask |= 1n << BigInt(mod29(index + 1));
      };

      if (kind === 'adj23') {
        if (length === 5) {
          for (let i = 0; i + 1 < words.length; i += 1) {
            if (
              words[i].values.length === 2 &&
              words[i + 1].values.length === 3
            ) add(i);
          }
        }
      } else if (kind === 'centerQ' || kind === 'centerF') {
        const marker = kind === 'centerQ' ? q : F;
        for (let i = 0; i < words.length; i += 1) {
          const values = words[i].values;
          if (values.length !== length + 1 || values.length % 2 !== 1) continue;
          const middle = (values.length - 1) / 2;
          if (values[middle] === marker) add(i);
        }
      } else if (kind === 'terminal') {
        for (let i = K; i < words.length; i += 1) {
          const values = words[i].values;
          if (values.length !== length + 1 || values[1] !== F) continue;
          const marker = words[i - K];
          if (
            marker.values.length === 3 &&
            hPair3(marker.values).join(',') === '2,1,0'
          ) add(i);
        }
      } else {
        for (let i = 0; i < words.length; i += 1) {
          if (words[i].values.length === length) add(i);
        }
      }

      masks.set(page + '|' + lane + '|' + length, mask);
    }
  }
}

function hasReceiver(page, lane, length, residue) {
  const mask = masks.get(page + '|' + lane + '|' + length);
  return ((mask >> BigInt(residue)) & 1n) === 1n;
}

const tapes = new Map();
let labeled = 0;

for (const permutation of hPermutations) {
  for (let signMask = 0; signMask < 16; signMask += 1) {
    const roles = permutation.map((value, index) =>
      mod29(((signMask >> index) & 1) ? -value : value)
    );

    for (const oneRaw of [1,-1]) {
      const one = mod29(oneRaw);
      const [r0,r1,r2,r3] = roles;
      const left = [r1,one,mod29(-r1),r0];
      const center = [r1,one,F,one,mod29(-r1)];
      const transition = [mod29(-r3),r2,mod29(-r0),one];

      for (const order of transitionOrders) {
        const reordered = order.map((index) => transition[index]);
        const right = left.map((value, index) =>
          mod29(value + reordered[index])
        );

        for (const reverseColumns of [false,true]) {
          for (const reverseVertical of [false,true]) {
            let columns = [left,center,right].map((column) =>
              reverseVertical ? column.slice().reverse() : column.slice()
            );
            if (reverseColumns) columns.reverse();

            const delta = columns.flat();
            const key = delta.join(',');
            labeled += 1;
            if (!tapes.has(key)) tapes.set(key, { delta, labels: 0 });
            tapes.get(key).labels += 1;
          }
        }
      }
    }
  }
}

assert.equal(labeled, 73728);
assert.equal(tapes.size, 36864);

let fullNumeric = 0;
let fullLabeled = 0;
const winners = [];

for (const { delta, labels } of tapes.values()) {
  for (let sourceStart = 0; sourceStart <= 30; sourceStart += 1) {
    for (let pageStart = 0; pageStart <= 43; pageStart += 1) {
      let complete = true;

      for (let lane = 0; lane < 13; lane += 1) {
        const sourceWord = source[sourceStart + lane];
        const residue = mod29(sourceWord.index + delta[lane]);
        if (!hasReceiver(
          pageStart + lane,
          lane,
          sourceWord.length,
          residue
        )) {
          complete = false;
          break;
        }
      }

      if (complete) {
        fullNumeric += 1;
        fullLabeled += labels;
        winners.push({
          sourceStart,
          pageStart,
          delta,
          labels,
        });
      }
    }
  }
}

assert.equal(fullNumeric, 4);
assert.equal(fullLabeled, 8);
assert.ok(winners.every((winner) =>
  winner.sourceStart === 30 && winner.pageStart === 30
));
assert.deepEqual(
  winners.map((winner) => winner.delta.join(',')).sort(),
  [
    '26,1,3,2,26,1,0,1,3,20,6,1,3',
    '26,1,3,2,26,1,0,1,3,20,25,1,3',
    '26,1,3,2,26,1,0,1,3,3,6,1,3',
    '26,1,3,2,26,1,0,1,3,3,25,1,3',
  ].sort()
);

console.log(JSON.stringify({
  status:'PASS',
  family: {
    baseRoleSignOrientationLabels: 3072,
    transitionCoordinateOrders: 24,
    labeled,
    distinctNumeric: tapes.size,
    sourceWindows: 31,
    pageIntervals: 44,
  },
  survivors: {
    numeric: fullNumeric,
    labeled: fullLabeled,
    placements: [...new Set(
      winners.map((winner) =>
        winner.sourceStart + '/' + winner.pageStart
      )
    )],
    deltas: winners.map((winner) => winner.delta),
  },
  decision:
    'Charging every permutation of the four right-column transition coordinates introduces no new complete placement; only the same four source30/page30 tapes survive.',
}, null, 2));
