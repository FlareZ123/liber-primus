'use strict';

// Reproduce one bounded FOLD/MOBIUS interpretation of the original p50 32x8 table.
// Run with Node.js from any working directory.
// Source inputs: original base60 grid and LP2 rune corpus.
// The FOLD address is exploratory; this script tests the fixed construction, not its provenance.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const grid = readJson('resources/liber-primus/lp2-grid-256.json');
const corpus = readJson('resources/liber-primus/lp2-corpus.json');
const bytes = grid.bytes;
const alphabet = corpus.translit;

assert.equal(bytes.length, 256);
assert.equal(grid.rows, 32);
assert.equal(grid.cols, 8);
assert.equal(alphabet.length, 29);

const page = (number) => {
  const found = corpus.pages.find((item) => item.page === number);
  assert.ok(found, 'Missing LP2 page ' + number);
  return found.indices;
};
const p55 = page(55);
const p56Cipher = page(56);
const p57Plain = page(57);
assert.equal(p55.length, 76);
assert.equal(p56Cipher.length, 85);
assert.equal(p57Plain.length, 95);

const mod29 = (value) => ((value % 29) + 29) % 29;

function firstPrimes(count) {
  const out = [];
  for (let candidate = 2; out.length < count; candidate++) {
    let prime = true;
    for (let divisor = 2; divisor * divisor <= candidate; divisor++) {
      if (candidate % divisor === 0) {
        prime = false;
        break;
      }
    }
    if (prime) out.push(candidate);
  }
  return out;
}

function toGpRunes(words) {
  const tokens = alphabet.map((token, index) => ({ token, index }))
    .sort((a, b) => b.token.length - a.token.length);
  const out = [];
  for (const word of words.split(' ')) {
    for (let offset = 0; offset < word.length;) {
      const match = tokens.find(({ token }) => word.startsWith(token, offset));
      assert.ok(match, 'No GP spelling for ' + word.slice(offset));
      out.push(match.index);
      offset += match.token.length;
    }
  }
  return out;
}

// Reconstruct the established p56 plaintext independently as the known 180-rune
// receiver for the inner region. Only the fourth literal F (local position 56)
// bypasses the prime clock; the other four F ciphertext runes consume a prime.
const expectedP56 =
  'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const fPositions = p56Cipher.map((rune, index) => rune === 0 ? index : -1)
  .filter((index) => index >= 0);
assert.deepEqual(fPositions, [35, 47, 51, 56, 74]);
const primes = firstPrimes(p56Cipher.length + 29);
const literalFMask = 8;
let primeClock = 0;
const p56Plain = p56Cipher.map((rune, position) => {
  const fIndex = fPositions.indexOf(position);
  if (fIndex !== -1 && (literalFMask & (1 << fIndex))) return 0;
  return mod29(rune - (primes[primeClock++] - 1));
});
assert.equal(primeClock, 84);
assert.deepEqual(p56Plain, toGpRunes(expectedP56));
const known180 = p56Plain.concat(p57Plain);
assert.equal(known180.length, 180);

// Original 32x8 perimeter: top-left clockwise, with each corner included once.
const perimeter = [];
for (let col = 0; col < 8; col++) perimeter.push(bytes[col]);
for (let row = 1; row < 32; row++) perimeter.push(bytes[row * 8 + 7]);
for (let col = 6; col >= 0; col--) perimeter.push(bytes[31 * 8 + col]);
for (let row = 30; row >= 1; row--) perimeter.push(bytes[row * 8]);
assert.equal(perimeter.length, 76);

// A 2x38 Möbius representation: split the ring into equal halves and reverse
// the second half to make the two strip rows share the same reading direction.
const mobiusRim = perimeter.slice(0, 38).concat(perimeter.slice(38).reverse());
const reverseMobiusRim = mobiusRim.slice().reverse();

function indexOfCoincidence(indices) {
  const frequencies = Array(29).fill(0);
  for (const index of indices) {
    assert.ok(Number.isInteger(index) && index >= 0 && index < 29);
    frequencies[index]++;
  }
  return frequencies.reduce((sum, count) => sum + count * (count - 1), 0)
    / (indices.length * (indices.length - 1));
}

function summarizeRimKey(key) {
  const subtract = p55.map((cipher, index) => mod29(cipher - (key[index] % 29)));
  const add = p55.map((cipher, index) => mod29(cipher + (key[index] % 29)));
  const lowFiveXor = p55.map((cipher, index) => cipher ^ (key[index] & 31));
  return {
    subtractIoC: indexOfCoincidence(subtract),
    addIoC: indexOfCoincidence(add),
    subtractFirst12: subtract.slice(0, 12).map((index) => alphabet[index]),
    addFirst12: add.slice(0, 12).map((index) => alphabet[index]),
    lowFiveXorNativeCount: lowFiveXor.filter((index) => index < 29).length,
    lowFiveXorInvalidPositions: lowFiveXor
      .map((index, position) => index >= 29 ? position : -1)
      .filter((position) => position >= 0)
  };
}

// The 30x6 interior is the original table after removing the 76-cell rim.
const inner = [];
for (let row = 1; row <= 30; row++) {
  for (let col = 1; col <= 6; col++) inner.push(bytes[row * 8 + col]);
}
assert.equal(inner.length, 180);

// B = 29q + r: q+1 selects a conventional numeric-keypad direction, r is
// the output rune. The long 30-cell axis is joined top-to-bottom with a
// half-twist: crossing that seam reverses the six-cell column coordinate.
const keypad = {
  1: [1, -1], 2: [1, 0], 3: [1, 1],
  4: [0, -1], 5: [0, 0], 6: [0, 1],
  7: [-1, -1], 8: [-1, 0], 9: [-1, 1]
};

function walkInnerMobius(start) {
  const seen = new Map();
  const path = [];
  let current = start;
  let termination = 'unknown';
  while (current >= 0 && !seen.has(current)) {
    seen.set(current, path.length);
    path.push(current);
    const quotient = Math.floor(inner[current] / 29);
    const [dy, dx] = keypad[quotient + 1];
    let row = Math.floor(current / 6) + dy;
    let col = (current % 6) + dx;
    if (row < 0) {
      row = 29;
      col = 5 - col;
    } else if (row >= 30) {
      row = 0;
      col = 5 - col;
    }
    if (col < 0 || col >= 6) {
      current = -1;
      termination = 'open side boundary';
    } else {
      current = row * 6 + col;
    }
  }
  if (current >= 0) {
    termination = {
      kind: 'cycle',
      entryIndex: seen.get(current),
      cycleLength: path.length - seen.get(current)
    };
  }
  const output = path.map((index) => inner[index] % 29);
  return {
    path,
    termination,
    output,
    outputTokens: output.map((index) => alphabet[index]),
    matchesKnownPrefix: output.reduce(
      (count, rune, index) => count + (rune === known180[index] ? 1 : 0), 0
    )
  };
}

// The 76-cell rim itself can also be treated as a 2x38 Möbius direction strip.
// Its short two-cell edges are joined left-to-right with a row reversal.
function walkRimMobius(start) {
  const seen = new Map();
  const path = [];
  let current = start;
  let termination = 'unknown';
  while (current >= 0 && !seen.has(current)) {
    seen.set(current, path.length);
    path.push(current);
    const quotient = Math.floor(mobiusRim[current] / 29);
    const [dy, dx] = keypad[quotient + 1];
    let row = Math.floor(current / 38) + dy;
    let col = (current % 38) + dx;
    if (row < 0 || row >= 2) {
      current = -1;
      termination = 'open width boundary';
    } else {
      if (col < 0) {
        col = 37;
        row = 1 - row;
      } else if (col >= 38) {
        col = 0;
        row = 1 - row;
      }
      current = row * 38 + col;
    }
  }
  if (current >= 0) {
    termination = {
      kind: 'cycle',
      entryIndex: seen.get(current),
      cycleLength: path.length - seen.get(current)
    };
  }
  return {
    path,
    termination,
    directions: path.map((index) => Math.floor(mobiusRim[index] / 29) + 1),
    outputTokens: path.map((index) => alphabet[mobiusRim[index] % 29])
  };
}

const clockwiseKey = summarizeRimKey(mobiusRim);
const reverseKey = summarizeRimKey(reverseMobiusRim);
const innerWalk = walkInnerMobius(0);
const rimWalk = walkRimMobius(0);

assert.equal(innerWalk.path.length, 13);
assert.equal(innerWalk.termination, 'open side boundary');
assert.deepEqual(innerWalk.path, [0, 178, 1, 2, 177, 3, 175, 4, 9, 8, 14, 19, 12]);
assert.deepEqual(innerWalk.outputTokens,
  ['B', 'IA', 'J', 'M', 'OE', 'S', 'P', 'R', 'S', 'R', 'AE', 'D', 'A']);
assert.equal(innerWalk.matchesKnownPrefix, 0);
assert.equal(rimWalk.path.length, 1);
assert.equal(rimWalk.termination, 'open width boundary');
assert.deepEqual(rimWalk.directions, [8]);

console.log(JSON.stringify({
  test: 'source-conditioned p50 FOLD/MOBIUS construction',
  p56Regression: 'PASS',
  knownReceiverRunes: known180.length,
  p55Runes: p55.length,
  perimeterCells: perimeter.length,
  interiorCells: inner.length,
  mobiusRimKey: {
    clockwiseFold: clockwiseKey,
    reverseFoldControl: reverseKey
  },
  inner30x6MobiusDirectionWalk: innerWalk,
  outer2x38MobiusDirectionWalk: rimWalk,
  result: 'FIXED NATURAL CONSTRUCTIONS REJECTED'
}, null, 2));
