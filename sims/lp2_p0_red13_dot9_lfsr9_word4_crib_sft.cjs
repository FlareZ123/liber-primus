'use strict';

/**
 * LP2 p0 image's nine-row 13-dot punctuation motivates a GF(29) order-9
 * homogeneous recurrence test on the conditional "EPIPHANY SEECS" title key.
 * Windows 11 / Node.js 22. Read-only complete enumeration of 29^5 keys.
 * Validates candidate first four native-GP words at original p0 offsets
 * 13..33 under both F-interrupter choices at original offset17.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = (p) => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const p0 = corpus.pages.find((p) => p.page === 0).indices;
const seedP = [18, 13, 10, 13, 8, 24, 9, 26, 15, 18, 18, 5, 15];
const seedC = [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5];
const mod = (x) => ((x % 29) + 29) % 29;
assert.deepEqual(p0.slice(0, 13), seedC);
const seed = seedC.map((c, i) => mod(c - seedP[i]));
assert.deepEqual(seed, [26, 24, 8, 19, 27, 24, 18, 3, 0, 8, 0, 16, 19]);
assert.equal(p0.length, 262);
assert.deepEqual(p0.slice(13, 20), [2, 11, 6, 25, 0, 11, 22]);
assert.equal(p0.indexOf(0, 18), 58);

const runeIndex = new Map(corpus.runes.map((glyph, i) => [glyph, i]));
const firstPage = read('resources/liber-primus/lp2-transcription.txt').split('%')[0];
const sourceWords = firstPage.replace(/[\/\r\n&]/g, '')
  .split(/[-.\s§0-9$]+/g)
  .filter((word) => [...word].some((glyph) => runeIndex.has(glyph)));
assert.deepEqual(sourceWords.slice(0, 6).map((w) => w.length),
  [8, 5, 4, 3, 3, 11]);
assert.deepEqual(sourceWords.slice(0, 6).join('').split('')
  .map((glyph) => runeIndex.get(glyph)),
  p0.slice(0, 34));

// Actual image punctuation has thirteen squares on a 9x3 checkerboard:
// 010 / 101 / 010 / 101 / 010 / 101 / 010 / 101 / 010.
const dotRows = Array.from({length: 9}, (_, row) =>
  Array.from({length: 3}, (_, col) => ((row + col) % 2) === 1 ? 1 : 0));
assert.equal(dotRows.flat().reduce((sum, bit) => sum + bit, 0), 13);

const tokens = corpus.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {string} original @returns {number[]} */
function nativeGp(original) {
  const text = original.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const result = [];
  for (let i = 0; i < text.length;) {
    if (text.startsWith('ING', i)) {
      result.push(21);
      i += 3;
    } else if (text.startsWith('IO', i)) {
      result.push(27);
      i += 2;
    } else {
      const token = tokens.find((t) => text.startsWith(t.s, i));
      if (!token) return [];
      result.push(token.i);
      i += token.s.length;
    }
  }
  return result;
}
const dictionary = [new Set(), new Set(), new Set(), new Set(), new Set()];
const exampleWords = ['TIME', 'FOR', 'ALL', 'ENCOUNTERED'];
/** @param {number[]} a @returns {number} */
function pack(a) {
  let n = 0;
  for (const x of a) n = n * 29 + x;
  return n;
}
for (const line of read('resources/control/english_wordfreq_textblob.txt').split(/\r?\n/)) {
  const match = /^([a-z]+)\s+\d+$/.exec(line);
  if (match) {
    const gp = nativeGp(match[1]);
    if (gp.length === 3) dictionary[1].add(pack(gp));
    if (gp.length === 4) dictionary[0].add(pack(gp));
    if (gp.length === 11) dictionary[3].add(gp.join(','));
  }
}
assert.ok(dictionary[0].has(pack(nativeGp(exampleWords[0]))));
assert.ok(dictionary[1].has(pack(nativeGp(exampleWords[1]))));
assert.ok(dictionary[1].has(pack(nativeGp(exampleWords[2]))));
assert.ok(dictionary[3].has(nativeGp(exampleWords[3]).join(',')));
assert.equal(exampleWords.reduce((s, w) => s + nativeGp(w).length, 0), 21);

// Build reduced-row echelon GF29 equations:
// K[t] = sum(a[j] * K[t-j-1]), t=9..12.
const rows = Array.from({length: 4}, (_, i) => {
  const t = i + 9;
  return [...Array.from({length: 9}, (_, j) => seed[t - j - 1]), seed[t]];
});
/** @param {number} n @returns {number} */
function inv(n) {
  for (let i = 1; i < 29; i++) if ((n * i) % 29 === 1) return i;
  throw new Error('Singular pivot');
}
const pivots = [];
for (let col = 0; col < 9; col++) {
  const target = pivots.length;
  let r = target;
  while (r < 4 && rows[r][col] === 0) r++;
  if (r === 4) continue;
  [rows[target], rows[r]] = [rows[r], rows[target]];
  const f = inv(rows[target][col]);
  for (let k = col; k <= 9; k++) rows[target][k] = mod(rows[target][k] * f);
  for (let u = 0; u < 4; u++) {
    if (u === target) continue;
    const a = rows[u][col];
    for (let k = col; k <= 9; k++) rows[u][k] = mod(rows[u][k] - a * rows[target][k]);
  }
  pivots.push(col);
}
assert.equal(pivots.length, 4);
const free = Array.from({length: 9}, (_, i) => i)
  .filter((col) => !pivots.includes(col));
assert.equal(free.length, 5);
const N = 29 ** free.length;
assert.equal(N, 20511149);

const coefficients = new Int16Array(9);
const keys = new Int16Array(44);
for (let i = 0; i < seed.length; i++) keys[i] = seed[i];
/** @param {number} t */
function extendKey(t) {
  for (let k = 13; k <= t; k++) {
    let sum = 0;
    for (let j = 0; j < 9; j++) sum += coefficients[j] * keys[k - j - 1];
    keys[k] = mod(sum);
  }
}
/** @param {number[]} c @returns {number[]} */
function evaluate(c) {
  const matches = [];
  extendKey(16);
  let first = 0;
  for (let i = 13; i <= 16; i++) {
    const p = mod(c[i] - keys[i]);
    if (p === 0 && c[i] !== 0) return matches;
    first = first * 29 + p;
  }
  if (!dictionary[0].has(first)) return matches;

  extendKey(19);
  // At c17=0, genuine plaintext F is literal and consumes NO key.
  // The rival is an encrypted non-F value, consuming the key.
  for (let skip = 0; skip <= 1; skip++) {
    if (skip === 1 && c[17] !== 0) continue;
    const second = [];
    second.push(skip ? 0 : mod(c[17] - keys[17]));
    second.push(mod(c[18] - keys[18 - skip]));
    second.push(mod(c[19] - keys[19 - skip]));
    if ((!skip && second[0] === 0) || second[1] === 0 || second[2] === 0) continue;
    if (!dictionary[1].has(pack(second))) continue;

    extendKey(22);
    const third = [];
    for (let i = 20; i <= 22; i++) {
      third.push(mod(c[i] - keys[i - skip]));
    }
    if (third.some((p) => p === 0) || !dictionary[1].has(pack(third))) continue;

    extendKey(33);
    const fourth = [];
    for (let i = 23; i <= 33; i++) {
      fourth.push(mod(c[i] - keys[i - skip]));
    }
    if (fourth.some((p) => p === 0)) continue;
    if (!dictionary[3].has(fourth.join(','))) continue;
    matches.push({
      skipAt17: Boolean(skip),
      words: [c.slice(13, 17).map((v, j) => mod(v - keys[13+j])),
        second, third, fourth]
        .map((w) => w.map((x) => corpus.translit[x]).join(''))
    });
  }
  return matches;
}

const counts = [0, 0, 0, 0];
const originalSurvivors = [];
for (let candidate = 0; candidate < N; candidate++) {
  let q = candidate;
  for (const col of free) {
    coefficients[col] = q % 29;
    q = Math.floor(q / 29);
  }
  for (let i = 0; i < 4; i++) {
    let rhs = rows[i][9];
    for (const col of free) rhs -= rows[i][col] * coefficients[col];
    coefficients[pivots[i]] = mod(rhs);
  }
  // Recheck every complete fixed original title equation only for 2
  // independent representative combinations; the RREF proves all others.
  if (candidate === 0 || candidate === N - 1) {
    for (let t = 9; t <= 12; t++) {
      let sum = 0;
      for (let j = 0; j < 9; j++) sum += coefficients[j] * seed[t - j - 1];
      assert.equal(mod(sum), seed[t]);
    }
  }
  extendKey(16);
  let first = 0;
  let feasible = true;
  for (let i = 13; i <= 16; i++) {
    const p = mod(p0[i] - keys[i]);
    if (p === 0) { feasible = false; break; }
    first = first * 29 + p;
  }
  if (!feasible || !dictionary[0].has(first)) continue;
  counts[0]++;
  extendKey(19);
  for (let skip = 0; skip <= 1; skip++) {
    const second = [
      skip ? 0 : mod(-keys[17]),
      mod(p0[18] - keys[18 - skip]),
      mod(p0[19] - keys[19 - skip])
    ];
    if ((!skip && second[0] === 0) || second[1] === 0 || second[2] === 0 ||
      !dictionary[1].has(pack(second))) continue;
    counts[1]++;
    extendKey(22);
    const third = [
      mod(p0[20] - keys[20 - skip]),
      mod(p0[21] - keys[21 - skip]),
      mod(p0[22] - keys[22 - skip])
    ];
    if (third.some((p) => p === 0) || !dictionary[1].has(pack(third))) continue;
    counts[2]++;
    extendKey(33);
    const fourth = [];
    for (let i = 23; i <= 33; i++) fourth.push(mod(p0[i] - keys[i - skip]));
    if (fourth.some((p) => p === 0) || !dictionary[3].has(fourth.join(','))) continue;
    counts[3]++;
    originalSurvivors.push({
      coefficientId: candidate, coefficients: [...coefficients],
      skipAt17: Boolean(skip),
      output: [first, second, third, fourth.map((v) => corpus.translit[v]).join('')]
    });
  }
}
assert.ok(counts.every((n) => n <= N));
assert.ok(counts[0] >= counts[1] / 2);
assert.ok(counts[1] >= counts[2]);
assert.ok(counts[2] >= counts[3]);
console.log(JSON.stringify({
  source: 'Original physical p0 red 13-rune heading, nine-row 13-dot punctuation',
  hypothesis: 'EPIPHANY SEECS heading, GF29 order-nine continuous homogeneous key',
  allTitleCompatibleCoefficients: N,
  pivotColumns: pivots,
  freeColumns: free,
  originalFirstWordDictionaryCandidates: counts[0],
  originalFirstTwoWordBranches: counts[1],
  originalFirstThreeWordBranches: counts[2],
  originalFirstFourWordBranches: counts[3],
  originalSurvivors
}, null, 2));

// Native GP positive test under the first title-compatible q9 recurrence,
// with the literal plaintext-F at the first position of word two.
coefficients.fill(0);
for (let i = 0; i < 4; i++) {
  let rhs = rows[i][9];
  coefficients[pivots[i]] = mod(rhs);
}
extendKey(33);
const native = exampleWords.flatMap((w) => nativeGp(w));
assert.equal(native.length, 21);
const planted = p0.slice();
let clock = 13;
for (let i = 13; i < 34; i++) {
  const x = native[i - 13];
  planted[i] = x === 0 ? 0 : mod(x + keys[clock++]);
}
const positive = evaluate(planted);
assert.ok(positive.some((v) => v.skipAt17),
  'Exact positive source-native planted words with literal F must be found');
console.log('SFT PASS: 29^5 complete original title-compatible q9 keys enumerated');
console.log('SFT PASS: original GP native four-word positive plant with F bypass');
