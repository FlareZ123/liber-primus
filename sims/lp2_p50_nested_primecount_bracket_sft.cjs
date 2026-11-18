'use strict';

const fs = require('fs');
const path = require('path');

const grid = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-grid-256.json'), 'utf8')
);

function assertEqual(actual, expected, label) {
  if (actual !== expected) throw new Error(`${label}: expected ${expected}, got ${actual}`);
}

const tokens = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace('f', '');

function decode(token, alphabet) {
  return alphabet.indexOf(token[0]) * alphabet.length + alphabet.indexOf(token[1]);
}

function primePi(n) {
  let count = 0;
  for (let x = 2; x <= n; x += 1) {
    let prime = true;
    for (let d = 2; d * d <= x; d += 1) {
      if (x % d === 0) {
        prime = false;
        break;
      }
    }
    if (prime) count += 1;
  }
  return count;
}

const primeCounts = Array.from({ length: 256 }, (_, n) => primePi(n));

function allDuplicatePrimeCountPairs(values) {
  const hits = [];
  for (let left = 0; left < 256; left += 1) {
    for (let right = left + 1; right < 256; right += 1) {
      if (values[left] !== values[right]) continue;
      if (right - left !== primeCounts[values[left]]) continue;
      hits.push({
        left,
        right,
        value: values[left],
        distance: right - left,
      });
    }
  }
  return hits;
}

function nestedPrimeCountHits(values) {
  const hits = [];
  for (let left = 0; left < 255; left += 1) {
    const outerValue = values[left];
    const outerDistance = primeCounts[outerValue];
    const right = left + outerDistance;
    if (outerDistance < 2 || right >= 256 || values[right] !== outerValue) continue;

    const innerValue = values[left + 1];
    const innerDistance = primeCounts[innerValue];
    if (innerDistance !== outerDistance - 2 || values[right - 1] !== innerValue) continue;

    hits.push({
      outerLeft: left,
      outerRight: right,
      outerValue,
      outerDistance,
      innerLeft: left + 1,
      innerRight: right - 1,
      innerValue,
      innerDistance,
    });
  }
  return hits;
}

const base60 = tokens.map((token) => decode(token, alphabet60));
const base59 = tokens.map((token) => decode(token, alphabet59));

assertEqual(tokens.length, 256, 'table size');
assertEqual(base60[82], 201, 'cell82 base60');
assertEqual(base60[128], 201, 'cell128 base60');
assertEqual(primeCounts[201], 46, 'pi(201)');
assertEqual(128 - 82, 46, 'outer distance');
assertEqual(base60[83], 193, 'cell83 base60');
assertEqual(base60[127], 193, 'cell127 base60');
assertEqual(primeCounts[193], 44, 'pi(193)');
assertEqual(127 - 83, 44, 'inner distance');

const base60Pairs = allDuplicatePrimeCountPairs(base60);
const base59Pairs = allDuplicatePrimeCountPairs(base59);
assertEqual(
  JSON.stringify(base60Pairs),
  JSON.stringify([
    { left: 82, right: 128, value: 201, distance: 46 },
    { left: 83, right: 127, value: 193, distance: 44 },
  ]),
  'all base60 duplicate/pi-distance pairs'
);
assertEqual(JSON.stringify(base59Pairs), '[]', 'base59 duplicate/pi-distance pairs');

const sourceNested = nestedPrimeCountHits(base60);
assertEqual(
  JSON.stringify(sourceNested),
  JSON.stringify([
    {
      outerLeft: 82,
      outerRight: 128,
      outerValue: 201,
      outerDistance: 46,
      innerLeft: 83,
      innerRight: 127,
      innerValue: 193,
      innerDistance: 44,
    },
  ]),
  'unique nested source hit'
);

assertEqual(tokens[82], '3L', 'outer left token');
assertEqual(tokens[128], '3L', 'outer right token');
assertEqual(tokens[83], '3D', 'inner left token');
assertEqual(tokens[127], '3D', 'inner right token');
assertEqual(127 - 83 - 1, 43, 'strict payload length');
assertEqual(tokens[105], '13', 'payload midpoint');
assertEqual(tokens.filter((token) => token === '13').length, 1, 'global midpoint token uniqueness');

function makeRng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

function globalShuffle(source, random) {
  const sample = source.slice();
  for (let i = sample.length - 1; i > 0; i -= 1) {
    const j = random() % (i + 1);
    [sample[i], sample[j]] = [sample[j], sample[i]];
  }
  return sample;
}

function rowShuffle(source, random) {
  const sample = source.slice();
  for (let row = 0; row < 32; row += 1) {
    const start = row * 8;
    for (let k = 7; k > 0; k -= 1) {
      const j = random() % (k + 1);
      const a = start + k;
      const b = start + j;
      [sample[a], sample[b]] = [sample[b], sample[a]];
    }
  }
  return sample;
}

function columnShuffle(source, random) {
  const sample = source.slice();
  for (let col = 0; col < 8; col += 1) {
    for (let row = 31; row > 0; row -= 1) {
      const other = random() % (row + 1);
      const a = row * 8 + col;
      const b = other * 8 + col;
      [sample[a], sample[b]] = [sample[b], sample[a]];
    }
  }
  return sample;
}

const trials = 100000;
const randomGlobalRow = makeRng(0x33018246);
let globalAny = 0;
let globalAt82 = 0;
let rowAny = 0;
let rowAt82 = 0;

for (let trial = 0; trial < trials; trial += 1) {
  let hits = nestedPrimeCountHits(globalShuffle(base60, randomGlobalRow));
  if (hits.length > 0) globalAny += 1;
  if (hits.some((hit) => hit.outerLeft === 82)) globalAt82 += 1;

  hits = nestedPrimeCountHits(rowShuffle(base60, randomGlobalRow));
  if (hits.length > 0) rowAny += 1;
  if (hits.some((hit) => hit.outerLeft === 82)) rowAt82 += 1;
}

assertEqual(globalAny, 8, 'global-shuffle nested hits');
assertEqual(globalAt82, 0, 'global-shuffle hits at source start82');
assertEqual(rowAny, 25, 'row-shuffle nested hits');
assertEqual(rowAt82, 25, 'row-shuffle hits at source start82');

const randomColumns = makeRng(0x33014682);
let columnAny = 0;
let columnAt82 = 0;
for (let trial = 0; trial < trials; trial += 1) {
  const hits = nestedPrimeCountHits(columnShuffle(base60, randomColumns));
  if (hits.length > 0) columnAny += 1;
  if (hits.some((hit) => hit.outerLeft === 82)) columnAt82 += 1;
}

assertEqual(columnAny, 12, 'column-shuffle nested hits');
assertEqual(columnAt82, 0, 'column-shuffle hits at source start82');

console.log('PASS p50 nested prime-count bracket');
console.log('  base60 duplicate/pi pairs: (82,128,201,46) and (83,127,193,44); base59: none');
console.log('  unique nested source hit encloses 43 cells; center cell105 is unique token13');
console.log(`  100k global multiset shuffles: any=${globalAny}, at82=${globalAt82}`);
console.log(`  100k within-row shuffles: any=${rowAny}, at82=${rowAt82}`);
console.log(`  100k within-column shuffles: any=${columnAny}, at82=${columnAt82}`);
