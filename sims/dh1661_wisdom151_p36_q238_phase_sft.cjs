'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

/** @param {string} p */
const read = (p) => fs.readFileSync(p, 'utf8');
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const referenceText = read('resources/liber-primus/lp1-plaintext-reference.txt');

/** @param {number} x */
const mod29 = (x) => ((x % 29) + 29) % 29;

/** @param {number} x */
function inv29(x) {
  for (let i = 1; i < 29; i++) if (mod29(i * x) === 1) return i;
  throw new Error('no inverse');
}

/** @param {number} base @param {number} exp @param {number} modulus */
function modPow(base, exp, modulus) {
  let b = BigInt(base);
  let e = BigInt(exp);
  const m = BigInt(modulus);
  let out = 1n;
  while (e > 0n) {
    if (e & 1n) out = (out * b) % m;
    b = (b * b) % m;
    e >>= 1n;
  }
  return Number(out);
}

/** @param {number} a @param {number} m */
function multiplicativeOrder(a, m) {
  let x = 1;
  for (let n = 1; n <= m; n++) {
    x = (x * a) % m;
    if (x === 1) return n;
  }
  throw new Error('order not found');
}

/** @param {number} n */
function divisors(n) {
  const out = [];
  for (let d = 1; d * d <= n; d++) {
    if (n % d !== 0) continue;
    out.push(d);
    if (d * d !== n) out.push(n / d);
  }
  return out.sort((a, b) => a - b);
}

/** @param {number} n */
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}

/** @param {number} n */
function primeOrdinal(n) {
  assert.equal(isPrime(n), true);
  let rank = 0;
  for (let k = 2; k <= n; k++) if (isPrime(k)) rank++;
  return rank;
}

/** @param {number[]} a @param {number[]} b */
function mulLo(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) out[i + j] = mod29(out[i + j] + a[i] * b[j]);
  }
  return out;
}

/** @param {number[]} a @param {number[]} f */
function divLo(a, f) {
  const r = a.slice();
  const q = Array(a.length - f.length + 1).fill(0);
  const leadInv = inv29(f.at(-1));
  for (let i = q.length - 1; i >= 0; i--) {
    const c = mod29(r[i + f.length - 1] * leadInv);
    q[i] = c;
    for (let j = 0; j < f.length; j++) r[i + j] = mod29(r[i + j] - c * f[j]);
  }
  return { q, rem: r.slice(0, f.length - 1) };
}

/** @param {number[]} a @param {number} phase */
function rotate(a, phase) {
  const p = ((phase % a.length) + a.length) % a.length;
  return a.slice(p).concat(a.slice(0, p));
}

/** @param {string} text */
function parseGp(text) {
  const tokens = corpus.translit.map((s, i) => ({ s, i })).sort((a, b) => b.s.length - a.s.length);
  const prose = text.split(/\r?\n/)
    .filter((line) => !line.trim().startsWith('#') && !line.trim().startsWith('['))
    .join(' ')
    .replace(/[0-9a-f]{64,}/gi, ' ')
    .toUpperCase();
  const out = [];
  for (const word of prose.match(/[A-Z]+/g) || []) {
    let i = 0;
    while (i < word.length) {
      const token = tokens.find((t) => word.startsWith(t.s, i));
      if (token) {
        out.push(token.i);
        i += token.s.length;
      } else {
        i++;
      }
    }
  }
  return out;
}

const reference = parseGp(referenceText);
const split = Math.floor(reference.length * 0.8);
const train = reference.slice(0, split);
const trigramCounts = new Map();
let trigramTotal = 0;
for (let i = 0; i + 2 < train.length; i++) {
  const k = train[i] * 841 + train[i + 1] * 29 + train[i + 2];
  trigramCounts.set(k, (trigramCounts.get(k) || 0) + 1);
  trigramTotal++;
}

/** @param {number[]} sequence */
function score(sequence) {
  const counts = Array(29).fill(0);
  for (const x of sequence) counts[x]++;
  let logp = 0;
  for (let i = 0; i + 2 < sequence.length; i++) {
    const k = sequence[i] * 841 + sequence[i + 1] * 29 + sequence[i + 2];
    logp += Math.log(((trigramCounts.get(k) || 0) + 0.05) / (trigramTotal + 0.05 * 29 ** 3));
  }
  return {
    ioc: counts.reduce((s, c) => s + c * (c - 1), 0) / (sequence.length * (sequence.length - 1)),
    trigramNatsPerRune: logp / (sequence.length - 2),
  };
}

// Real participant transcript: base 2757, client public 2800 under modulus 3301.
const base = 2757;
const modulus = 3301;
assert.equal(multiplicativeOrder(base, modulus), 550);
const candidates = [];
for (let e = 11; e < modulus; e += 550) if (e >= 2) candidates.push(e);
assert.deepEqual(candidates, [11, 561, 1111, 1661, 2211, 2761]);
for (const e of candidates) assert.equal(modPow(base, e, modulus), 2800);

// Cross-round source selector: the 2013 NUMBER service factors composite input directly,
// and 151 is a printed numeric cell in the 2014 Liber Primus Wisdom/05.jpg square.
const wisdomNumericCells = new Set([272, 138, 131, 151, 18, 226, 245]);
const matching = candidates.map((e) => ({
  e,
  sourceDivisors: divisors(e).filter((d) => d !== 1 && d !== e && wisdomNumericCells.has(d)),
})).filter((r) => r.sourceDivisors.length);
assert.deepEqual(matching, [{ e: 1661, sourceDivisors: [151] }]);
assert.equal(primeOrdinal(151), 36);
assert.equal(151 % 29, 6);
assert.equal(1661 % 29, 8);

// The complete original table factorization yields monic Q238.
const factors = [
  [5, 1],
  [5, 1],
  [11, 18, 1],
  [24, 16, 14, 1],
  [11, 15, 0, 9, 1, 5, 10, 20, 12, 1],
];
const divisor = factors.reduce(mulLo, [1]);
const bytes = grid.pages.flatMap((p) => p.bytes);
const qd = divLo(bytes.slice().reverse().map((x) => mod29(x)).slice(0, 255), divisor);
assert.equal(qd.rem.every((x) => x === 0), true);
const q238 = qd.q.map((x) => mod29(28 * x));
assert.equal(q238.length, 239);
assert.equal(q238[238], 1);

const p36 = corpus.pages.find((p) => p.page === 36).indices;
assert.equal(p36.length, 238);

const transcription = read('resources/lp2-transcription.txt');
const p36Raw = transcription.split('%')[36];
const runeSet = new Set(corpus.runes);
const headingChar = p36Raw.indexOf('1-');
assert(headingChar >= 0);
const runesBeforeHeading = Array.from(p36Raw.slice(0, headingChar)).filter((ch) => runeSet.has(ch)).length;
assert.equal(runesBeforeHeading, 99);
const p36WithHeading = [...p36.slice(0, runesBeforeHeading), 1, ...p36.slice(runesBeforeHeading)];
assert.equal(p36WithHeading.length, 239);

const keyBase = q238.slice(0, 238);
const results = [];
for (const orientation of ['forward', 'reverse']) {
  const oriented = orientation === 'forward' ? keyBase : keyBase.slice().reverse();
  const key = rotate(oriented, 151);
  for (const sign of [-1, 1]) {
    const decoded = p36.map((c, i) => mod29(c + sign * key[i]));
    const plant = reference.slice(0, 238);
    const plantedCipher = plant.map((c, i) => mod29(c - sign * key[i]));
    assert.deepEqual(plantedCipher.map((c, i) => mod29(c + sign * key[i])), plant);
    results.push({ orientation, phase: 151, sign, ...score(decoded) });
  }
}

/** @param {number} n */
function phi(n) {
  let result = n;
  let x = n;
  for (let p = 2; p * p <= x; p++) {
    if (x % p !== 0) continue;
    while (x % p === 0) x /= p;
    result -= result / p;
  }
  if (x > 1) result -= result / x;
  return result;
}

// The two 151 cells are opposite anti-diagonal corners of the reconstructed
// 2014 Wisdom/05.jpg 5x5 magic square. Test only that uniquely selected diagonal.
const antiDiagonal = [151, 320, 91, 320, 151];
assert.equal(antiDiagonal.reduce((a, b) => a + b, 0), 1033);
const antiDiagonalKeys = {
  rawMod29: antiDiagonal.map((x) => mod29(x)),
  totientMod29: antiDiagonal.map((x) => mod29(phi(x))),
};
assert.deepEqual(antiDiagonalKeys.rawMod29, [6, 1, 4, 1, 6]);
assert.deepEqual(antiDiagonalKeys.totientMod29, [5, 12, 14, 12, 5]);
const antiDiagonalResults = [];
for (const [name, key] of Object.entries(antiDiagonalKeys)) {
  for (const sign of [-1, 1]) {
    const decoded = p36.map((c, i) => mod29(c + sign * key[i % key.length]));
    antiDiagonalResults.push({ name, sign, ...score(decoded) });
  }
}

const headingAnchoredResults = [];
for (const direction of [1, -1]) {
  const source = Array.from(
    { length: 239 },
    (_, tokenIndex) => q238[((238 + direction * (tokenIndex - runesBeforeHeading)) % 239 + 239) % 239],
  );
  assert.equal(source[runesBeforeHeading], 1);

  const forwardMap = new Map();
  const reverseMap = new Map();
  let sameInputConflicts = 0;
  let sameOutputConflicts = 0;
  for (let i = 0; i < source.length; i++) {
    const a = source[i];
    const b = p36WithHeading[i];
    if (forwardMap.has(a) && forwardMap.get(a) !== b) sameInputConflicts++;
    else if (!forwardMap.has(a)) forwardMap.set(a, b);
    if (reverseMap.has(b) && reverseMap.get(b) !== a) sameOutputConflicts++;
    else if (!reverseMap.has(b)) reverseMap.set(b, a);
  }

  const decodedRows = [];
  for (const sign of [-1, 1]) {
    const decoded = [];
    for (let tokenIndex = 0; tokenIndex < 239; tokenIndex++) {
      if (tokenIndex === runesBeforeHeading) continue;
      decoded.push(mod29(p36WithHeading[tokenIndex] + sign * source[tokenIndex]));
    }
    decodedRows.push({ sign, ...score(decoded) });
  }

  headingAnchoredResults.push({
    direction: direction === 1 ? 'ascending-from-monic' : 'descending-from-monic',
    sameInputConflicts,
    sameOutputConflicts,
    permutationPossible: sameInputConflicts === 0 && sameOutputConflicts === 0,
    decodedRows,
  });
}
assert(headingAnchoredResults.every((r) => !r.permutationPossible));

const nativeWindows = [];
for (let i = 0; i + 238 <= reference.length; i++) nativeWindows.push(score(reference.slice(i, i + 238)).trigramNatsPerRune);
nativeWindows.sort((a, b) => a - b);
const bestOriginal = Math.max(...results.map((r) => r.trigramNatsPerRune));
const bestAntiDiagonal = Math.max(...antiDiagonalResults.map((r) => r.trigramNatsPerRune));
assert(bestOriginal < nativeWindows[0]);
assert(bestAntiDiagonal < nativeWindows[0]);

console.log(JSON.stringify({
  selector: {
    dhCandidates: candidates,
    uniqueNumberWisdomMatch: matching[0],
    primeOrdinal151: primeOrdinal(151),
    gpResidues: [151 % 29, 1661 % 29],
  },
  target: {
    page: 36,
    runes: p36.length,
    q238Degree: q238.length - 1,
    phase: 151,
  },
  rawP36: score(p36),
  results,
  antiDiagonal: {
    values: antiDiagonal,
    keys: antiDiagonalKeys,
    results: antiDiagonalResults,
  },
  headingAnchor: {
    runesBeforeHeading,
    combinedTokens: p36WithHeading.length,
    q238Coefficients: q238.length,
    results: headingAnchoredResults,
  },
  native238Windows: {
    count: nativeWindows.length,
    minimum: nativeWindows[0],
    median: nativeWindows[Math.floor(nativeWindows.length / 2)],
    maximum: nativeWindows.at(-1),
  },
  decision: 'The phase-151, 151-selected anti-diagonal, and visible-heading-1 anchored Q238 additive models all fail; the heading-anchored 239-token alignment is also impossible under any fixed secret 29-symbol permutation.'
}, null, 2));
