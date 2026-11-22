#!/usr/bin/env node
'use strict';

// Reproduce the p57 FIND/MUST -> p50 base-59 -> (p=151,g=35) observation
// and run a small, clue-constrained set of direct DH consumers against p55.
// Run from the repository root: node sims/lp2_p57_find_must_dh151_gate.cjs

const fs = require('node:fs');
const path = require('node:path');

const readJson = (p) => JSON.parse(fs.readFileSync(path.join(process.cwd(), p), 'utf8'));
const grid = readJson('resources/liber-primus/base60-grid.json');
const corpus = readJson('resources/liber-primus/lp2-corpus.json');
const transcription = fs.readFileSync(path.join(process.cwd(), 'resources/liber-primus/lp2-transcription.txt'), 'utf8');

const BASE60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const BASE59 = BASE60.replace('f', '');
const BASE29 = '0123456789ABCDEFGHIJKLMNOPQRS';
const mod = (x, m) => ((x % m) + m) % m;

function decodeGrid(alphabet) {
  const index = new Map([...alphabet].map((c, i) => [c, i]));
  return grid.rows.flat().map((token) => {
    if (token.length !== 2 || !index.has(token[0]) || !index.has(token[1])) {
      throw new Error('Unexpected p50 token: ' + token);
    }
    return index.get(token[0]) * alphabet.length + index.get(token[1]);
  });
}

function phi(n) {
  if (n === 0) return null;
  let result = n;
  let remainder = n;
  for (let p = 2; p * p <= remainder; p++) {
    if (remainder % p === 0) {
      while (remainder % p === 0) remainder /= p;
      result -= result / p;
    }
  }
  if (remainder > 1) result -= result / remainder;
  return Math.round(result);
}

function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}

function powMod(a, n, m) {
  let result = 1;
  a = mod(a, m);
  while (n > 0) {
    if (n % 2) result = (result * a) % m;
    a = (a * a) % m;
    n = Math.floor(n / 2);
  }
  return result;
}


function isPrimitiveRoot(g, p) {
  if (!isPrime(p) || mod(g, p) === 0) return false;
  let n = p - 1;
  const factors = [];
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) {
      factors.push(d);
      while (n % d === 0) n /= d;
    }
  }
  if (n > 1) factors.push(n);
  return factors.every((q) => powMod(g, (p - 1) / q, p) !== 1);
}

function shuffleSelectorTest(values, words, seed, trials) {
  const candidates = words
    .map((w) => ({ word: w.word, p: w.sum, address: phi(w.sum) }))
    .filter((w) => isPrime(w.p) && w.address !== null &&
      w.address >= 0 && w.address + 1 < values.length);
  let state = seed >>> 0;
  const rand = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
  let any = 0;
  let totalHits = 0;
  let exactlyOne = 0;
  let multiple = 0;
  for (let trial = 0; trial < trials; trial++) {
    const shuffled = values.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = rand() % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    let hits = 0;
    for (const candidate of candidates) {
      if (shuffled[candidate.address] !== candidate.p) continue;
      const q = shuffled[candidate.address + 1];
      const nextWords = words.filter((w) => w.sum === q && w.sum !== candidate.p);
      if (nextWords.length && isPrimitiveRoot(q % candidate.p, candidate.p)) {
        hits++;
      }
    }
    if (hits > 0) {
      any++;
      totalHits += hits;
      if (hits === 1) exactlyOne++;
      else multiple++;
    }
  }
  return {
    trials,
    anyHitTrials: any,
    rate: any / trials,
    totalHits,
    exactlyOneHitTrials: exactlyOne,
    multipleHitTrials: multiple
  };
}

function ring(depth) {
  const top = depth;
  const bottom = 31 - depth;
  const left = depth;
  const right = 7 - depth;
  const cells = [];
  for (let x = left; x <= right; x++) cells.push(top * 8 + x);
  for (let y = top + 1; y <= bottom; y++) cells.push(y * 8 + right);
  for (let x = right - 1; x >= left; x--) cells.push(bottom * 8 + x);
  for (let y = bottom - 1; y > top; y--) cells.push(y * 8 + left);
  return cells;
}

function rotateRing(cells, startCell, direction) {
  const start = cells.indexOf(startCell);
  if (start < 0) throw new Error('Start cell is not on ring: ' + startCell);
  return Array.from({ length: cells.length }, (_, i) =>
    cells[mod(start + direction * i, cells.length)]
  );
}

function base29(n) {
  if (n === 0) return '0';
  let out = '';
  while (n > 0) {
    out = BASE29[n % 29] + out;
    n = Math.floor(n / 29);
  }
  return out;
}

function indexOfCoincidence(values) {
  if (values.length < 2) return 0;
  const counts = Array(29).fill(0);
  for (const v of values) counts[v]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

const base59 = decodeGrid(BASE59);
const base60 = decodeGrid(BASE60);
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const p57Source = transcription.split('%').at(-1).replace(/[\/\r\n§&$]/g, '');
const p57Words = p57Source.split(/[-.]/).filter(Boolean).map((raw) => {
  const indices = [...raw].map((r) => runeIndex.get(r));
  if (indices.some((i) => i === undefined)) throw new Error('Unknown rune in p57 word');
  return {
    word: indices.map((i) => corpus.translit[i]).join(''),
    sum: indices.reduce((s, i) => s + corpus.prime[i], 0)
  };
});
const find = p57Words.find((w) => w.word === 'FIND');
const must = p57Words.find((w) => w.word === 'MUST');
if (!find || !must || find.sum !== 151 || must.sum !== 186) {
  throw new Error('p57 FIND/MUST word sums did not reproduce');
}

const p55 = corpus.pages.find((p) => p.page === 55).indices;
if (p55.length !== 76) throw new Error('Expected 76 p55 rune indices');

const p = find.sum;
const g = must.sum % p;
const orderChecks = [2, 3, 5].map((q) => ({
  primeFactor: q,
  power: powMod(g, (p - 1) / q, p)
}));
const primitiveRoot = isPrime(p) &&
  powMod(g, p - 1, p) === 1 &&
  orderChecks.every((x) => x.power !== 1);

const counts = (a, value) => a.filter((x) => x === value).length;
const fixedSelectorProbability =
  (counts(base59, 151) * counts(base59, 186)) / (256 * 255);

const innerClockwise = rotateRing(ring(2), 149, 1).map((cell) => base59[cell]);
const innerCounterclockwise = rotateRing(ring(2), 149, -1).map((cell) => base59[cell]);
const outerClockwise = rotateRing(ring(0), 151, 1).map((cell) => base59[cell]);
const outerCounterclockwise = rotateRing(ring(0), 151, -1).map((cell) => base59[cell]);

const dhTests = [];
for (const [direction, inner, outer] of [
  ['clockwise', innerClockwise, outerClockwise],
  ['counterclockwise', innerCounterclockwise, outerCounterclockwise]
]) {
  const keyStreams = [
    {
      name: 'generator^inner-exponent mod 151, then mod 29',
      key: inner.map((v) => powMod(g, v % (p - 1), p) % 29),
      period: inner.length
    },
    {
      name: 'p55-GP-prime public share ^ inner exponent mod 151, then mod 29',
      key: p55.map((c, i) =>
        powMod(corpus.prime[c], inner[i % inner.length] % (p - 1), p) % 29
      ),
      period: p55.length
    },
    {
      name: 'p50 outer-ring value ^ inner exponent mod 151, then mod 29',
      key: outer.map((v, i) =>
        powMod(v % p, inner[i % inner.length] % (p - 1), p) % 29
      ),
      period: outer.length,
      invalidPublicSharePositions: outer.map((v, i) => v % p === 0 ? i : null).filter((x) => x !== null)
    }
  ];

  for (const stream of keyStreams) {
    for (const sign of [-1, 1]) {
      const plaintext = p55.map((c, i) => mod(c + sign * stream.key[i % stream.key.length], 29));
      dhTests.push({
        direction,
        stream: stream.name,
        sign: sign === -1 ? 'ciphertext - key' : 'ciphertext + key',
        keyPeriod: stream.period,
        invalidPublicSharePositions: stream.invalidPublicSharePositions || [],
        ioc: indexOfCoincidence(plaintext),
        output: plaintext.map((i) => corpus.translit[i]).join('')
      });
    }
  }
}

const phiInner = innerClockwise.map((v) => phi(v)).filter((v) => v !== null);
const base29PhiLength = phiInner.reduce((n, v) => n + base29(v).length, 0);
const rawInnerBase29Length = innerClockwise.reduce((n, v) => n + base29(v).length, 0);

const randomization = {
  base59: shuffleSelectorTest(base59, p57Words, 0x151035, 100000),
  base60: shuffleSelectorTest(base60, p57Words, 0x60151, 100000)
};


const p57 = corpus.pages.find((page) => page.page === 57).indices;
const inner180RowMajor = [];
for (let row = 1; row <= 30; row++) {
  for (let column = 1; column <= 6; column++) {
    inner180RowMajor.push(row * 8 + column);
  }
}
const p57EncodingOrders = [{ name: 'inner-rectangle row-major', cells: inner180RowMajor }];
for (const direction of [1, -1]) {
  const ring1 = rotateRing(ring(1), 150, direction);
  const ring2 = rotateRing(ring(2), 149, direction);
  const ring3 = rotateRing(ring(3), 148, direction);
  p57EncodingOrders.push({
    name: 'rings outside-in ' + (direction === 1 ? 'clockwise' : 'counterclockwise'),
    cells: [...ring1, ...ring2, ...ring3]
  });
  p57EncodingOrders.push({
    name: 'rings inside-out ' + (direction === 1 ? 'clockwise' : 'counterclockwise'),
    cells: [...ring3, ...ring2, ...ring1]
  });
}
const knownClearP57EncodingControls = p57EncodingOrders.map(({ name, cells }) => {
  const tail = cells.slice(-p57.length);
  const runeIndexMatches = p57.reduce((n, rune, i) =>
    n + (base59[tail[i]] % p === powMod(g, rune, p) ? 1 : 0), 0);
  const primeWeightMatches = p57.reduce((n, rune, i) =>
    n + (base59[tail[i]] % p === powMod(g, corpus.prime[rune], p) ? 1 : 0), 0);
  const literalFZeroMatches = p57.reduce((n, rune, i) =>
    n + (rune === 0 && base59[tail[i]] % p === 0 ? 1 : 0), 0);
  const fCellValues = p57.map((rune, i) => rune === 0 ? ({
    offset: i,
    cell: tail[i],
    residue: base59[tail[i]] % p
  }) : null).filter(Boolean);
  return {
    order: name,
    p57Runes: p57.length,
    runeIndexPowerMatches: runeIndexMatches,
    primeWeightPowerMatches: primeWeightMatches,
    literalFZeroMatches,
    fCellValues
  };
});


function concatenateRingModulo(cells, alphabet) {
  let value = 0;
  for (const cell of cells) {
    const token = grid.rows[Math.floor(cell / 8)][cell % 8];
    for (const digit of token) value = (value * alphabet.length + alphabet.indexOf(digit)) % 150;
  }
  return value;
}

function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return a;
}

const innerSecretClockwise = concatenateRingModulo(rotateRing(ring(2), 149, 1), BASE59);
const innerSecretCounterclockwise = concatenateRingModulo(rotateRing(ring(2), 149, -1), BASE59);
const innerSecretBase60 = concatenateRingModulo(rotateRing(ring(2), 149, 1), BASE60);
const ourWord = p57Words.find((w) => w.word === 'OUR');
const groupPublic = powMod(g, innerSecretClockwise, p);
const groupPublicRuneIndex = corpus.prime.indexOf(groupPublic);
const groupLog = Array(p).fill(null);
for (let exponent = 0; exponent < p - 1; exponent++) {
  groupLog[powMod(g, exponent, p)] = exponent;
}

const singleExponentDhTests = [];
for (const [direction, outer] of [
  ['clockwise', outerClockwise],
  ['counterclockwise', outerCounterclockwise]
]) {
  const outerResidues = outer.map((v) => v % p);
  const streams = [
    {
      name: 'outer ring as DH public shares: outer^21 mod 151, then mod 29',
      key: outerResidues.map((v) => powMod(v, innerSecretClockwise, p) % 29),
      invalidPublicSharePositions: outerResidues.map((v, i) => v === 0 ? i : null).filter((x) => x !== null)
    },
    {
      name: 'outer ring as exponents: 35^(21*outer) mod 151, then mod 29',
      key: outer.map((v) =>
        powMod(g, mod(innerSecretClockwise * mod(v, p - 1), p - 1), p) % 29
      )
    },
    {
      name: 'p55 GP-prime values as DH public shares: prime^21 mod 151, then mod 29',
      key: p55.map((c) => powMod(corpus.prime[c], innerSecretClockwise, p) % 29),
      symbolMapDistinct: new Set(corpus.prime.map((q, c) =>
        mod(c - (powMod(q, innerSecretClockwise, p) % 29), 29)
      )).size
    },
    {
      name: 'p55 GP-prime values as public shares: shared exponent 21*log_g(q) mod 150, then mod 29',
      key: p55.map((c) =>
        mod(innerSecretClockwise * groupLog[corpus.prime[c]], p - 1) % 29
      ),
      symbolMapDistinct: new Set(corpus.prime.map((q, c) =>
        mod(c - (mod(innerSecretClockwise * groupLog[q], p - 1) % 29), 29)
      )).size
    }
  ];
  for (const stream of streams) {
    for (const sign of [-1, 1]) {
      const plaintext = p55.map((c, i) => mod(c + sign * stream.key[i], 29));
      singleExponentDhTests.push({
        direction,
        stream: stream.name,
        sign: sign === -1 ? 'ciphertext - key' : 'ciphertext + key',
        invalidPublicSharePositions: stream.invalidPublicSharePositions || [],
        symbolMapDistinct: stream.symbolMapDistinct ?? null,
        ioc: indexOfCoincidence(plaintext),
        output: plaintext.map((i) => corpus.translit[i]).join('')
      });
    }
  }
}


function base29Fixed2(n) {
  return base29(n).padStart(2, '0');
}
const p55Pairs = Array.from({ length: 38 }, (_, i) => p55[2 * i] * 29 + p55[2 * i + 1]);
const p55PairShares = p55Pairs.map((v) => v % p);
const p55PairSecrets = innerClockwise.slice(0, 38).map((v) => mod(v, p - 1));
const p55PairShared = p55PairShares.map((share, i) =>
  powMod(share, p55PairSecrets[i], p)
);
const p55PairBase29 = p55PairShared.map(base29Fixed2).join('');
const p55PairBase29Text = [...p55PairBase29]
  .map((digit) => corpus.translit[BASE29.indexOf(digit)] ?? '?')
  .join('');

const result = {
  sourceFiles: [
    'resources/liber-primus/base60-grid.json',
    'resources/liber-primus/lp2-corpus.json',
    'resources/liber-primus/lp2-transcription.txt',
    'resources/external/2013-tcp-server-signed-source.md'
  ],
  p57WordSums: { FIND: find.sum, MUST: must.sum },
  selector: {
    base59Cell150: base59[150],
    base59Cell151: base59[151],
    base60Cell150: base60[150],
    base60Cell151: base60[151],
    base59Count151: counts(base59, 151),
    base59Count186: counts(base59, 186),
    exactFixedSelectorShuffleProbability: fixedSelectorProbability
  },
  group: {
    modulus: p,
    generator: g,
    modulusPrime: isPrime(p),
    phiModulus: phi(p),
    phiMust: phi(must.sum),
    orderChecks,
    primitiveRoot
  },
  geometry: {
    outerRingLength: ring(0).length,
    innerRingLength: ring(2).length,
    p55RuneLength: p55.length
  },
  base29LengthChecks: {
    rawInnerRingOutputLength: rawInnerBase29Length,
    phiInnerRingOutputLength: base29PhiLength
  },
  randomization,
  knownClearP57EncodingControls,
  innerRingSecretExponent: {
    base59Clockwise: innerSecretClockwise,
    base59Counterclockwise: innerSecretCounterclockwise,
    base60Clockwise: innerSecretBase60,
    p57OURWordSum: ourWord?.sum ?? null,
    matchesOUR: innerSecretClockwise === ourWord?.sum &&
      innerSecretCounterclockwise === ourWord?.sum,
    groupPublic: groupPublic,
    groupPublicPrimeIndex: groupPublicRuneIndex,
    groupPublicRune: groupPublicRuneIndex >= 0 ? corpus.translit[groupPublicRuneIndex] : null,
    publicKeyOrder: (p - 1) / gcd(p - 1, innerSecretClockwise)
  },
  singleExponentDhTests,
  pairedP55Base29DhTest: {
    pairCount: p55Pairs.length,
    zeroPublicSharePositions: p55PairShares.map((v, i) => v === 0 ? i : null).filter((x) => x !== null),
    outputLength: p55PairBase29.length,
    output: p55PairBase29,
    decodedText: p55PairBase29Text
  },
  directDhTests: dhTests
};

console.log(JSON.stringify(result, null, 2));
