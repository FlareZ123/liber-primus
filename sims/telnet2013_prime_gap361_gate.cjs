'use strict';

/**
 * Reconstruct the 361-entry prime/gap sequence reported for Cicada's 2013
 * remote "primes" command, correct the 133/331 indexing convention, and test
 * the exact sequence as a fixed direct-GP29 additive key on original LP2.
 *
 * Source limitation: the omitted-prime list is a secondary historical
 * transcription, not an authenticated capture or server implementation.
 *
 * Run: node sims/telnet2013_prime_gap361_gate.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const pages = corpus.pages.filter(page =>
  page.page <= 55 && page.status === 'unsolved' && page.indices.length
).map(page => page.indices);
const MOD = 29;

function mod(value, modulus) {
  return ((value % modulus) + modulus) % modulus;
}

function primesInRange(lower, upperExclusive) {
  const out = [];
  for (let n = lower; n < upperExclusive; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) {
        prime = false;
        break;
      }
    }
    if (prime) out.push(n);
  }
  return out;
}

const missing = primesInRange(73, 1224);
assert.equal(missing.length, 180);
assert.equal(missing[0], 73);
assert.equal(missing.at(-1), 1223);

// S = gap(71,73), p21, gap(p21,p22), p22, ..., p200, gap(p200,p201).
const sequence = [missing[0] - 71];
for (let i = 0; i < missing.length; i++) {
  const next = i + 1 < missing.length ? missing[i + 1] : 1229;
  sequence.push(missing[i], next - missing[i]);
}
assert.equal(sequence.length, 361);
assert.equal(sequence[0], 2);
assert.equal(sequence.at(-1), 6);
assert.equal(sequence[132], 6);   // one-based position 133
assert.equal(sequence[133], 449); // zero-based offset 133
assert.equal(sequence[330], 6);   // one-based position 331
assert.equal(sequence[331], 1109);// zero-based offset 331

function primeOrdinal(value) {
  return primesInRange(2, value + 1).length;
}
assert.equal(primeOrdinal(449), 87);
assert.equal(primeOrdinal(1109), 186);

const key = sequence.map(value => mod(value, MOD));

function ioc(values) {
  const counts = new Uint32Array(MOD);
  for (const value of values) counts[value]++;
  const n = values.length;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (n * (n - 1));
}

function decodeOriginal(sign, clock) {
  const out = [];
  let global = 0;
  for (const page of pages) {
    for (let local = 0; local < page.length; local++, global++) {
      const offset = clock === 'page' ? local : global;
      out.push(mod(page[local] + sign * key[offset % key.length], MOD));
    }
  }
  return out;
}

function encodeControl(plainPages, sign, clock) {
  const out = [];
  let global = 0;
  for (const page of plainPages) {
    const cipherPage = [];
    for (let local = 0; local < page.length; local++, global++) {
      const offset = clock === 'page' ? local : global;
      cipherPage.push(mod(page[local] - sign * key[offset % key.length], MOD));
    }
    out.push(cipherPage);
  }
  return out;
}

function decodePages(cipherPages, sign, clock) {
  const out = [];
  let global = 0;
  for (const page of cipherPages) {
    const plainPage = [];
    for (let local = 0; local < page.length; local++, global++) {
      const offset = clock === 'page' ? local : global;
      plainPage.push(mod(page[local] + sign * key[offset % key.length], MOD));
    }
    out.push(plainPage);
  }
  return out;
}

function gpEncode(english) {
  const tokens = corpus.translit.map((token, index) => [token, index])
    .sort((a, b) => b[0].length - a[0].length);
  const out = [];
  for (const raw of english.toUpperCase().match(/[A-Z]+/g) || []) {
    const word = raw.replaceAll('QU', 'CW').replaceAll('V', 'U')
      .replaceAll('K', 'C').replaceAll('Z', 'S');
    for (let i = 0; i < word.length;) {
      const match = tokens.find(([token]) => word.startsWith(token, i));
      assert.ok(match, 'No GP token at ' + word.slice(i));
      out.push(match[1]);
      i += match[0].length;
    }
  }
  return out;
}


function concentricShellSums(square) {
  assert.ok(Array.isArray(square) && square.length > 0);
  const n = square.length;
  assert.ok(square.every(row => Array.isArray(row) && row.length === n));
  const shells = [];
  for (let layer = 0; layer < Math.ceil(n / 2); layer++) {
    const lo = layer;
    const hi = n - 1 - layer;
    const values = [];
    if (lo === hi) values.push(square[lo][lo]);
    else {
      values.push(...square[lo].slice(lo, hi + 1));
      for (let row = lo + 1; row <= hi; row++) values.push(square[row][hi]);
      for (let col = hi - 1; col >= lo; col--) values.push(square[hi][col]);
      for (let row = hi - 1; row > lo; row--) values.push(square[row][lo]);
    }
    const sum = values.reduce((total, value) => total + value, 0);
    const residue = mod(sum, MOD);
    shells.push({size:values.length,sum,residue,translit:corpus.translit[residue]});
  }
  return shells;
}

function centerOutSpiralSquare(values, order) {
  assert.equal(values.length, order * order);
  const grid = Array.from({length:order}, () => Array(order).fill(null));
  let row = Math.floor(order / 2);
  let col = Math.floor(order / 2);
  let index = 0;
  grid[row][col] = values[index++];
  const directions = [[0,1],[1,0],[0,-1],[-1,0]];
  let stepLength = 1;
  while (index < values.length) {
    for (let direction = 0; direction < 4 && index < values.length; direction++) {
      const [dr,dc] = directions[direction];
      for (let step = 0; step < stepLength && index < values.length; step++) {
        row += dr;
        col += dc;
        if (row >= 0 && row < order && col >= 0 && col < order) {
          grid[row][col] = values[index++];
        }
      }
      if (direction % 2 === 1) stepLength++;
    }
  }
  assert.equal(grid.flat().filter(Number.isInteger).length, values.length);
  return grid;
}

function run() {
  assert.equal(pages.length, 55);
  const total = pages.reduce((sum, page) => sum + page.length, 0);
  assert.equal(total, 12956);
  const original = pages.flat();
  const rawIoC = ioc(original);
  const models = [];
  for (const clock of ['page', 'continuous']) {
    for (const sign of [-1, 1]) {
      const decoded = decodeOriginal(sign, clock);
      models.push({clock, sign, ioc: ioc(decoded)});
    }
  }

  const english = fs.readFileSync(
    path.join(ROOT, 'resources/control/shakespeare_first300k.txt'), 'utf8');
  const language = gpEncode(english).slice(0, total);
  assert.equal(language.length, total);
  const plainPages = [];
  let cursor = 0;
  for (const page of pages) {
    plainPages.push(language.slice(cursor, cursor + page.length));
    cursor += page.length;
  }
  const positive = [];
  for (const clock of ['page', 'continuous']) {
    const cipher = encodeControl(plainPages, -1, clock);
    const recovered = decodePages(cipher, -1, clock).flat();
    assert.deepEqual(recovered, language);
    positive.push({clock, exactRecovered: recovered.length, ioc: ioc(recovered)});
  }


  // The 361=19^2 residual suggests a row-major 19x19 array. The PARABLE's
  // "shed our own circumferences" wording motivates this one shell-sum read.
  const square19 = Array.from({length: 19}, (_, row) =>
    sequence.slice(row * 19, (row + 1) * 19));
  const shellCheck = concentricShellSums(square19);
  assert.deepEqual(shellCheck.map(x => x.size),
    [72, 64, 56, 48, 40, 32, 24, 16, 8, 1]);
  assert.deepEqual(shellCheck.map(x => x.sum),
    [22868, 20062, 17448, 14890, 12322, 9814, 7388, 4870, 2438, 6]);
  assert.deepEqual(shellCheck.map(x => x.residue),
    [16, 23, 19, 13, 26, 12, 22, 27, 2, 6]);
  assert.deepEqual(shellCheck.map(x => x.translit),
    ['T', 'D', 'M', 'P', 'Y', 'EO', 'OE', 'IA', 'TH', 'G']);
  assert.equal(square19[9][9], 6);

  // "Like the instar tunneling to the surface" motivates one natural
  // center-outward spiral fill. Shell sums are read center to outside.
  const spiral19 = centerOutSpiralSquare(sequence, 19);
  const spiralShellCheck = concentricShellSums(spiral19).reverse();
  assert.deepEqual(spiralShellCheck.map(x => x.size),
    [1, 8, 16, 24, 32, 40, 48, 56, 64, 72]);
  assert.deepEqual(spiralShellCheck.map(x => x.sum),
    [2, 348, 928, 2040, 3954, 7134, 11824, 18494, 27722, 39660]);
  assert.deepEqual(spiralShellCheck.map(x => x.residue),
    [2, 0, 0, 10, 10, 0, 21, 21, 27, 17]);
  assert.deepEqual(spiralShellCheck.map(x => x.translit),
    ['TH', 'F', 'F', 'I', 'I', 'F', 'NG', 'NG', 'IA', 'B']);
  assert.equal(spiral19[9][9], 2);

  const expected = [
    {clock: 'page', sign: -1, ioc: 0.034491326460880746},
    {clock: 'page', sign: 1, ioc: 0.03447049771759632},
    {clock: 'continuous', sign: -1, ioc: 0.034481853434043724},
    {clock: 'continuous', sign: 1, ioc: 0.03446681574867476}
  ];
  for (let i = 0; i < expected.length; i++) {
    assert.equal(models[i].clock, expected[i].clock);
    assert.equal(models[i].sign, expected[i].sign);
    assert.ok(Math.abs(models[i].ioc - expected[i].ioc) < 1e-12);
  }

  return {
    source: 'Secondary transcription of the 2013 remote primes output; not authenticated server code',
    missingPrimeCount: missing.length,
    gapCount: 181,
    sequenceLength: sequence.length,
    sequenceStart: sequence.slice(0, 12),
    sequenceEnd: sequence.slice(-8),
    selectors: {
      zeroBased133: sequence[133],
      zeroBased331: sequence[331],
      oneBased133: sequence[132],
      oneBased331: sequence[330],
      primeOrdinals: {449: primeOrdinal(449), 1109: primeOrdinal(1109)},
      rowMajor19x19ZeroBased: {
        133: [Math.floor(133 / 19), 133 % 19],
        331: [Math.floor(331 / 19), 331 % 19]
      }
    },
    original: {
      pages: pages.length,
      runes: total,
      ioc: rawIoC,
      uniformReference: 1 / MOD,
      fixedDirectGP29Models: models
    },
    positiveControl: positive,
    sourceConstrained19x19ShellCheck: {
      fill: 'row-major corrected 361-entry prime/gap sequence',
      operation: 'outer-to-inner perimeter sum modulo 29',
      shells: shellCheck,
      center: square19[9][9],
      result: shellCheck.map(x => x.translit).join('')
    },
    clueMotivatedCenterOutSpiral19x19ShellCheck: {
      fill: 'center-outward clockwise spiral; start at center; move right/down/left/up with lengths 1,1,2,2,...',
      operation: 'center-to-outside perimeter sum modulo 29',
      shells: spiralShellCheck,
      center: spiral19[9][9],
      result: spiralShellCheck.map(x => x.translit).join(''),
      reverse: spiralShellCheck.slice().reverse().map(x => x.translit).join('')
    },
    decision: 'No original LP2 plaintext from the fixed phase-zero direct-GP29 use or either tested 19x19 shell-sum reading of this 361-value sequence.'
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(run(), null, 2) + '\n');
}

module.exports = {primesInRange, sequence, key, ioc, decodeOriginal, concentricShellSums, centerOutSpiralSquare, run};
