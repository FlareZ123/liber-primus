'use strict';

const fs = require('node:fs');
const assert = require('node:assert/strict');

const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const transcript = fs.readFileSync('resources/lp2-transcription.txt', 'utf8');

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const page55Segments = (transcript.split('%')[54]
  .replace(/\/\s*/gu, '')
  .match(/[\u16A0-\u16FF]+/gu) || [])
  .map((word) => [...word].map((rune) => runeIndex.get(rune)));

const interiors = page55Segments.map((word) => word.length > 2 ? word.slice(1, -1) : []);
const flatInterior = interiors.flat();

assert.equal(page55Segments.length, 17);
assert.equal(page55Segments[0].length, 1);
assert.equal(flatInterior.length, 43);

function positionsOf(index) {
  const positions = [];
  flatInterior.forEach((value, i) => {
    if (value === index) positions.push(i + 1);
  });
  return positions;
}

function segmentNumbersOf(index) {
  const segments = [];
  interiors.forEach((word, i) => {
    if (word.includes(index)) segments.push(i + 1);
  });
  return segments;
}

function foldSpan(a, b) {
  const span = flatInterior.slice(a - 1, b);
  const bits = [];
  for (let i = 0; i < Math.floor(span.length / 2); i += 1) {
    bits.push(span[i] === span[span.length - 1 - i] ? 1 : 0);
  }
  return {
    length: span.length,
    bits,
    value: bits.reduce((value, bit) => (value << 1) | bit, 0),
    centerIndex: span[Math.floor(span.length / 2)]
  };
}

const d = 23;
assert.equal(corpus.translit[d], 'D');
assert.deepEqual(segmentNumbersOf(d), [5, 9]);
assert.deepEqual(positionsOf(d), [5, 23]);

const runesAtSameOrdinalPosition = [];
for (let index = 0; index < 29; index += 1) {
  if (positionsOf(index).includes(index)) runesAtSameOrdinalPosition.push(index);
}
assert.deepEqual(runesAtSameOrdinalPosition, [23]);

const gap19Runes = [];
for (let index = 0; index < 29; index += 1) {
  const positions = positionsOf(index);
  for (let a = 0; a < positions.length; a += 1) {
    for (let b = a + 1; b < positions.length; b += 1) {
      if (positions[b] - positions[a] === 18) {
        gap19Runes.push({ index, positions: [positions[a], positions[b]] });
      }
    }
  }
}
assert.deepEqual(gap19Runes, [
  { index: 14, positions: [13, 31] },
  { index: 23, positions: [5, 23] }
]);

const dFold = foldSpan(5, 23);
const xFold = foldSpan(13, 31);
assert.equal(dFold.length, 19);
assert.equal(dFold.value, 256);
assert.equal(dFold.centerIndex, 10);
assert.equal(corpus.translit[dFold.centerIndex], 'I');
assert.equal(corpus.prime[dFold.centerIndex], 31);

assert.equal(xFold.length, 19);
assert.equal(xFold.value, 256);
assert.equal(corpus.translit[xFold.centerIndex], 'S');
assert.equal(corpus.prime[xFold.centerIndex], 53);

function distinctPrimeFactors(n) {
  const factors = [];
  let value = n;
  for (let p = 2; p * p <= value; p += 1) {
    if (value % p === 0) {
      factors.push(p);
      while (value % p === 0) value /= p;
    }
  }
  if (value > 1) factors.push(value);
  return factors;
}

function isPrime(n) {
  if (n < 2) return false;
  for (let p = 2; p * p <= n; p += 1) {
    if (n % p === 0) return false;
  }
  return true;
}

function numberCommand(n) {
  if (!isPrime(n)) return { input: n, reversed: null, factors: distinctPrimeFactors(n) };
  const reversed = Number(String(n).split('').reverse().join(''));
  return {
    input: n,
    reversed,
    factors: isPrime(reversed) ? [] : distinctPrimeFactors(reversed)
  };
}

assert.deepEqual(numberCommand(193), {
  input: 193,
  reversed: 391,
  factors: [17, 23]
});
assert.deepEqual(numberCommand(190), {
  input: 190,
  reversed: null,
  factors: [2, 5, 19]
});

// 17 and 23 are NUMBER prime factors. Reading them as GP prime weights and
// reading them as zero-based alphabet ordinals are distinct operations.
const factorPrimeWeightRead = [17, 23].map((factor) => corpus.prime.indexOf(factor));
const factorOrdinalRead = [17, 23];
assert.deepEqual(
  factorPrimeWeightRead.map((index) => corpus.translit[index]),
  ['G', 'H']
);
assert.deepEqual(
  factorOrdinalRead.map((index) => corpus.translit[index]),
  ['B', 'D']
);
assert.equal((factorPrimeWeightRead[0] + factorPrimeWeightRead[1]) % 29, 14);
assert.equal(corpus.translit[14], 'X');

console.log('p55 NUMBER(193) / D-within control');
console.log('segments:', page55Segments.length, 'strict interiors:', flatInterior.length);
console.log('D segments:', segmentNumbersOf(d), 'D positions:', positionsOf(d));
console.log('same-ordinal-position runes:', runesAtSameOrdinalPosition);
console.log('19-rune equal-endpoint spans:', gap19Runes);
console.log('D span fold:', dFold);
console.log('X span fold:', xFold);
console.log('NUMBER(193):', numberCommand(193));
console.log('NUMBER(190):', numberCommand(190));
console.log('17/23 as prime weights:', factorPrimeWeightRead.map((i) => corpus.translit[i]));
console.log('17/23 as ordinals:', factorOrdinalRead.map((i) => corpus.translit[i]));
console.log('PASS: D geometry is exact, but the representation and radix choices remain external selectors.');
