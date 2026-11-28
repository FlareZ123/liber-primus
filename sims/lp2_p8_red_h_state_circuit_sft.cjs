'use strict';

/**
 * P15 -> P7 -> chapter -> P8 source-side state closure.
 *
 * This SFT reads only repository source artifacts. It verifies:
 *  - the independently published p15 lower-red/grid state reconstruction;
 *  - the older p7 red-product right-circulant inverse row;
 *  - chapter IN->OUT records from first black words after red rubrics;
 *  - a held-out chapter OUT state row on the p7-selected itinerary;
 *  - the p8 red [4,8] H packet and its manuscript-wide uniqueness;
 *  - the adjacent p8 black word as a unique state continuation;
 *  - the p8 state predicting the complete p7 red-product row.
 *
 * No unknown plaintext or fitted rune key is used.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const MOD = 29;
const mod = (x) => ((x % MOD) + MOD) % MOD;
const sum = (v) => mod(v.reduce((a, b) => a + b, 0));
const product = (v) => v.reduce((a, b) => mod(a * b), 1);
const inv2 = 15;

/** @param {number[]} v @returns {number[]} */
function H(v) {
  const n = v.length;
  const m = Math.floor(n / 2);
  const out = [];
  for (let i = 0; i < m; i += 1) out.push(mod(v[i] - v[n - 1 - i]));
  if (n % 2) out.push(v[m]);
  for (let i = m - 1; i >= 0; i -= 1) out.push(mod(v[i] + v[n - 1 - i]));
  return out;
}

/** @param {number} x @param {number} m @returns {number} */
function inverseScalar(x, m = MOD) {
  for (let y = 1; y < m; y += 1) if ((x * y) % m === 1) return y;
  throw new Error('non-invertible scalar ' + x + ' mod ' + m);
}

/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function powMod(base, exponent, modulus) {
  let result = 1;
  let b = modN(base, modulus);
  let e = exponent;
  while (e > 0) {
    if (e & 1) result = (result * b) % modulus;
    b = (b * b) % modulus;
    e = Math.floor(e / 2);
  }
  return result;
}

/** @param {number} x @param {number} m @returns {number} */
function modN(x, m) {
  return ((x % m) + m) % m;
}

/** @param {number} n @returns {boolean} */
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d += 1) if (n % d === 0) return false;
  return true;
}

/** @param {number[][]} matrix */
function inverseGF29(matrix) {
  const n = matrix.length;
  const rows = matrix.map((row, i) =>
    row.map(mod).concat(Array.from({ length: n }, (_, j) => Number(i === j)))
  );
  let determinant = 1;
  for (let col = 0; col < n; col += 1) {
    let pivot = -1;
    for (let row = col; row < n; row += 1) {
      if (rows[row][col] !== 0) {
        pivot = row;
        break;
      }
    }
    if (pivot < 0) return { determinant: 0, inverse: null };
    if (pivot !== col) {
      [rows[pivot], rows[col]] = [rows[col], rows[pivot]];
      determinant = mod(-determinant);
    }
    const lead = rows[col][col];
    determinant = mod(determinant * lead);
    const scale = inverseScalar(lead);
    rows[col] = rows[col].map((x) => mod(x * scale));
    for (let row = 0; row < n; row += 1) {
      if (row === col || rows[row][col] === 0) continue;
      const factor = rows[row][col];
      rows[row] = rows[row].map((x, j) => mod(x - factor * rows[col][j]));
    }
  }
  return {
    determinant,
    inverse: rows.map((row) => row.slice(n)),
  };
}

/** @param {number[]} row @returns {number[][]} */
function rightCirculant(row) {
  return Array.from({ length: row.length }, (_, i) =>
    Array.from({ length: row.length }, (_, k) => row[(k - i + row.length) % row.length])
  );
}

const corpus = JSON.parse(
  fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8')
);
const ink = JSON.parse(
  fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-ink-annotations.json'), 'utf8')
);
const transcription = fs
  .readFileSync(path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8')
  .replace(/\r/g, '');
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const parts = transcription.split(/^\s*%\s*$/m).slice(0, 55);

/** @param {number} page */
function wordsAt(page) {
  const source = corpus.pages.find((x) => x.page === page).indices;
  const segment = parts[page >= 51 ? page - 1 : page];
  const words = [];
  let current = [];
  let start = 0;
  let offset = 0;

  const flush = () => {
    if (!current.length) return;
    words.push({ start, end: offset, values: current.slice() });
    current = [];
  };

  for (const ch of segment) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      if (!current.length) start = offset;
      assert.equal(source[offset], value, 'transcription mismatch p' + page + '@' + offset);
      current.push(value);
      offset += 1;
    } else if (ch === '/' || /\s/u.test(ch)) {
      continue;
    } else {
      flush();
    }
  }
  flush();
  assert.equal(offset, source.length, 'transcription length p' + page);
  return words;
}

/** @param {number} page */
function firstBlackWord(page) {
  const ann = ink.pages.find((x) => x.page === page);
  assert.ok(ann && ann.red_spans && ann.red_spans.length);
  const spans = ann.red_spans.slice().sort((a, b) => a.start - b.start);
  assert.equal(spans[0].start, 0);
  let redEnd = spans[0].length;
  for (let i = 1; i < spans.length && spans[i].start === redEnd; i += 1) {
    redEnd += spans[i].length;
  }
  const word = wordsAt(page).find((x) => x.start === redEnd);
  assert.ok(word, 'missing first black word p' + page);
  return word;
}

// Phase A: independently published p15 lower-red + color-blind grid state.
const p15 = corpus.pages.find((x) => x.page === 15);
const lower = p15.indices.slice(9, 20);
const lowerWords = [lower.slice(0, 4), lower.slice(4, 6), lower.slice(6, 11)];
const lowerDesc = lowerWords.map((v) => ({ L: v.length, S: sum(v), P: product(v) }));
assert.deepEqual(lowerDesc, [
  { L: 4, S: 22, P: 10 },
  { L: 2, S: 6, P: 5 },
  { L: 5, S: 5, P: 0 },
]);
const K = lowerDesc[1].L;
const a = lowerDesc[1].S;
const g = lowerDesc[1].P;
const q = lowerDesc[0].L;
const F = lowerDesc[2].P;
const p = lowerDesc[0].S + 1;
const A = powMod(g, a, p);
assert.deepEqual([p, g, a, K, q, F, A], [23, 5, 6, 2, 4, 0, 8]);

const grid = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820],
];
const residues = grid.map((row) => row.map((x) => x % MOD));
const columns = Array.from({ length: 4 }, (_, c) =>
  H(Array.from({ length: 4 }, (_, r) => residues[r][c]))
);
const bColumn = columns.filter(
  (v) => v[0] === mod(p - g) && v[2] === mod(a * K) && v[3] === K
);
assert.equal(bColumn.length, 1);
const B = bColumn[0][1];
let b = null;
for (let e = 0; e < p - 1; e += 1) {
  if (powMod(g, e, p) === B) {
    b = e;
    break;
  }
}
assert.equal(b, 15);
assert.equal(B, 19);
assert.equal(powMod(B, a, p), K);
const e = inverseScalar(b, p - 1);
assert.equal(e, 3);

// Phase B: older p7 product register and printed-order right-circulant.
const p7Products = [
  product([23, 3]),
  product([22, 16, 2, 25]),
  product([5, 7, 11]),
  product([14, 28]),
  product([6, 28, 19]),
];
assert.deepEqual(p7Products, [11, 26, 8, 15, 2]);
const p7Matrix = inverseGF29(rightCirculant(p7Products));
assert.ok(p7Matrix.inverse);
assert.equal(p7Matrix.determinant, B);
const p7InverseRow = p7Matrix.inverse[0];
assert.deepEqual(p7InverseRow, [p, K, g, K, B]);

// Phase C: chapter first-black SUM->PRODUCT records.
const chapterStarts = [0, 3, 8, 15, 23, 27, 33, 40, 54];
const chapterRecords = chapterStarts.map((page) => {
  const word = firstBlackWord(page);
  return {
    page,
    start: word.start,
    values: word.values,
    length: word.values.length,
    sum: sum(word.values),
    product: product(word.values),
  };
});
assert.deepEqual(chapterRecords.map((x) => x.sum), [15, 9, 23, 22, 25, 2, 5, 27, 19]);
assert.deepEqual(chapterRecords.map((x) => x.product), [23, 11, 2, 13, 16, 19, 3, 3, 27]);

const byIn = new Map(chapterRecords.map((x) => [x.sum, x]));
assert.equal(byIn.size, chapterRecords.length);
const itinerary = p7InverseRow.map((value) => byIn.get(value));
assert.ok(itinerary.every(Boolean));
assert.deepEqual(itinerary.map((x) => x.page), [8, 27, 33, 27, 54]);

// The chapter OUT/product field was not used to address the itinerary.
const outRow = itinerary.map((x) => x.product);
assert.deepEqual(outRow, [K, B, e, B, mod(-K)]);
assert.deepEqual(H(outRow), [q, F, e, q + g, F]);

const outCirculant = inverseGF29(rightCirculant(outRow));
assert.ok(outCirculant.inverse);
assert.equal(outCirculant.determinant, inverseScalar(B));
assert.deepEqual(outCirculant.inverse[0], [b - K, F, mod(-b), B, F]);

// All ten natural ring orientations remain legal chapter addresses, but only
// original printed order reproduces both held-out OUT state packets.
const orientations = [];
for (const reversed of [false, true]) {
  const source = reversed ? p7Products.slice().reverse() : p7Products.slice();
  for (let rotation = 0; rotation < 5; rotation += 1) {
    const row = source.slice(rotation).concat(source.slice(0, rotation));
    const inv = inverseGF29(rightCirculant(row));
    assert.ok(inv.inverse);
    const inverseRow = inv.inverse[0];
    const legal = inverseRow.every((x) => byIn.has(x));
    assert.equal(legal, true);
    const outputs = inverseRow.map((x) => byIn.get(x).product);
    const outInv = inverseGF29(rightCirculant(outputs));
    orientations.push({
      reversed,
      rotation,
      inverseRow,
      outputs,
      h5: H(outputs),
      determinant: outInv.determinant,
      inverseFirstRow: outInv.inverse[0],
    });
  }
}
const orientationHits = orientations.filter(
  (x) =>
    JSON.stringify(x.h5) === JSON.stringify([q, F, e, q + g, F]) &&
    x.determinant === inverseScalar(B) &&
    JSON.stringify(x.inverseFirstRow) ===
      JSON.stringify([b - K, F, mod(-b), B, F])
);
assert.deepEqual(
  orientationHits.map((x) => [x.reversed, x.rotation]),
  [[false, 0]]
);

// Fixed-marginal chapter OUT charge: keep the nine observed products and IN
// labels, permute product assignments, and ask for the exact held-out row.
const products = chapterRecords.map((x) => x.product);
const permutation = products.slice();
let permutations = 0;
let outRowHits = 0;
function enumerate(at) {
  if (at === permutation.length) {
    permutations += 1;
    const map = new Map(chapterRecords.map((x, i) => [x.sum, permutation[i]]));
    const candidate = p7InverseRow.map((x) => map.get(x));
    if (candidate.every((x, i) => x === outRow[i])) outRowHits += 1;
    return;
  }
  for (let i = at; i < permutation.length; i += 1) {
    [permutation[at], permutation[i]] = [permutation[i], permutation[at]];
    enumerate(at + 1);
    [permutation[at], permutation[i]] = [permutation[i], permutation[at]];
  }
}
enumerate(0);
assert.equal(permutations, 362880);
assert.equal(outRowHits, 240);

// Phase D: p8 red heading. It is independently addressed by the p7 row above.
const p8 = corpus.pages.find((x) => x.page === 8);
const p8Ann = ink.pages.find((x) => x.page === 8);
assert.deepEqual(p8Ann.red_spans, [
  { start: 0, length: 12, runes: 'ᛉᛁᛉᛗᚢᛉᛗᚳᚦᛈᚩᛒ' },
]);
const p8Words = wordsAt(8);
assert.deepEqual(p8Words.slice(0, 3).map((x) => x.values), [
  [14, 10, 14, 19],
  [1, 14, 19, 5, 2, 13, 3, 17],
  [27, 9, 16],
]);
const red4 = p8Words[0];
const red8 = p8Words[1];
const firstBlack = p8Words[2];
assert.deepEqual([red4.values.length, red8.values.length], [q, A]);
assert.deepEqual(H(red4.values), [mod(-g), mod(-q), mod(-g), q]);
assert.deepEqual(
  H(red8.values),
  [b - K, inverseScalar(A), a, e, g + K, e, K + b, p - g]
);

// Reconstruct the state from the p8 packet itself, without importing labels.
function decodeP8Pair(w4, w8) {
  if (w4.values.length !== 4 || w8.values.length !== 8) return null;
  const h4 = H(w4.values);
  const h8 = H(w8.values);
  if (h4[0] !== h4[2] || h4[1] !== mod(-h4[3]) || h8[3] !== h8[5]) return null;

  const dg = mod(-h4[0]);
  const dq = h4[3];
  const de = h8[3];
  const da = h8[2];
  const dK = mod((h8[6] - h8[0]) * inv2);
  const db = mod((h8[6] + h8[0]) * inv2);
  const dp = h8[7] + dg;

  if (dp >= MOD || !isPrime(dp)) return null;
  if ([dg, dq, de, da, dK, db].some((x) => x <= 0 || x >= dp)) return null;
  if (h8[4] !== mod(dg + dK)) return null;

  const dA = powMod(dg, da, dp);
  const dB = powMod(dg, db, dp);
  if (inverseScalar(dA) !== h8[1]) return null;
  if (powMod(dA, db, dp) !== dK || powMod(dB, da, dp) !== dK) return null;
  if ((db * de) % (dp - 1) !== 1) return null;

  return {
    h4,
    h8,
    state: { p: dp, g: dg, q: dq, e: de, a: da, K: dK, b: db, A: dA, B: dB },
  };
}
const p8Decoded = decodeP8Pair(red4, red8);
assert.ok(p8Decoded);
assert.deepEqual(p8Decoded.state, { p, g, q, e, a, K, b, A, B });

// Broad manuscript charge over source-aware complete words. The '%' page
// separator is not a word delimiter: some printed words cross physical pages.
// P50 is the nonrunic numeric table and therefore separates the two rune tapes.
function seamWords(pageRange) {
  const words = [];
  let current = [];
  let first = null;
  const flush = () => {
    if (!current.length) return;
    words.push({ values: current.slice(), first });
    current = [];
    first = null;
  };
  for (const page of pageRange) {
    const source = corpus.pages.find((x) => x.page === page).indices;
    const segment = parts[page >= 51 ? page - 1 : page];
    let offset = 0;
    for (const ch of segment) {
      const value = runeIndex.get(ch);
      if (value !== undefined) {
        assert.equal(source[offset], value, 'seam transcription mismatch p' + page + '@' + offset);
        if (!current.length) first = { page, local: offset };
        current.push(value);
        offset += 1;
      } else if (ch === '/' || /\s/u.test(ch)) {
        continue;
      } else {
        flush();
      }
    }
    assert.equal(offset, source.length, 'seam transcription length p' + page);
    // Intentionally do not flush at a physical page boundary.
  }
  flush();
  return words;
}

const sourceWords = [
  ...seamWords(Array.from({ length: 50 }, (_, i) => i)),
  ...seamWords([51, 52, 53, 54, 55]),
];
let pairCount = 0;
let arity48Count = 0;
const pairHits = [];
let threeRuneCount = 0;
const firstBlackDescriptorHits = [];
const firstBlackHHits = [];
for (let i = 0; i + 1 < sourceWords.length; i += 1) {
  pairCount += 1;
  const left = sourceWords[i];
  const right = sourceWords[i + 1];
  if (left.values.length === 4 && right.values.length === 8) {
    arity48Count += 1;
    const decoded = decodeP8Pair(left, right);
    if (decoded) {
      pairHits.push({
        page: left.first.page,
        start: left.first.local,
        ...decoded,
      });
    }
  }
}
for (const word of sourceWords) {
  if (word.values.length !== 3) continue;
  threeRuneCount += 1;
  if (sum(word.values) === p && product(word.values) === K) {
    firstBlackDescriptorHits.push({
      page: word.first.page,
      start: word.first.local,
      values: word.values,
    });
  }
  if (JSON.stringify(H(word.values)) === JSON.stringify([inverseScalar(A), q + g, mod(-b)])) {
    firstBlackHHits.push({
      page: word.first.page,
      start: word.first.local,
      values: word.values,
    });
  }
}
assert.equal(pairCount, 2895);
assert.equal(arity48Count, 27);
assert.deepEqual(pairHits.map((x) => [x.page, x.start]), [[8, 0]]);
assert.equal(threeRuneCount, 720);

let redTwoWordSpans = 0;
let redArity48 = 0;
const redHits = [];
for (const ann of ink.pages.filter((x) => x.page <= 55 && x.page !== 50)) {
  const words = wordsAt(ann.page);
  for (const span of ann.red_spans || []) {
    const inside = words.filter(
      (word) => word.start >= span.start && word.end <= span.start + span.length
    );
    if (
      inside.length === 2 &&
      inside[0].start === span.start &&
      inside[1].end === span.start + span.length
    ) {
      redTwoWordSpans += 1;
      if (inside[0].values.length === 4 && inside[1].values.length === 8) {
        redArity48 += 1;
        const decoded = decodeP8Pair(inside[0], inside[1]);
        if (decoded) redHits.push([ann.page, span.start]);
      }
    }
  }
}
assert.equal(redTwoWordSpans, 7);
assert.equal(redArity48, 1);
assert.deepEqual(redHits, [[8, 0]]);

// The immediately adjacent black word is a complete state continuation.
assert.deepEqual(
  { L: firstBlack.values.length, S: sum(firstBlack.values), P: product(firstBlack.values) },
  { L: e, S: p, P: K }
);
assert.deepEqual(H(firstBlack.values), [inverseScalar(A), q + g, mod(-b)]);
assert.deepEqual(firstBlackDescriptorHits, [{ page: 8, start: 12, values: [27, 9, 16] }]);
assert.deepEqual(firstBlackHHits, [{ page: 8, start: 12, values: [27, 9, 16] }]);

// The p8-derived state predicts the complete older p7 product row.
const p7PredictedFromP8 = [
  inverseScalar(A),
  inverseScalar(B),
  A,
  inverseScalar(K),
  K,
];
assert.deepEqual(p7PredictedFromP8, p7Products);

// The itinerary's literal words form the existing 27-rune operand. Its
// source-native aggregate descriptor is itself a compact state packet.
const chapter27 = itinerary.flatMap((x) => x.values);
assert.equal(chapter27.length, 27);
assert.deepEqual(
  { L: chapter27.length, S: sum(chapter27), P: product(chapter27) },
  { L: mod(-K), S: p - 1, P: p - g }
);

// P8 page geometry closes on the same state.
const isRed = Array(p8.indices.length).fill(false);
for (const span of p8Ann.red_spans) {
  for (let i = span.start; i < span.start + span.length; i += 1) isRed[i] = true;
}
const black = p8.indices.filter((_, i) => !isRed[i]);
assert.deepEqual(
  {
    total: p8.indices.length,
    red: p8Ann.red_spans[0].length,
    black: black.length,
    totalMod29: p8.indices.length % MOD,
    blackMod29: black.length % MOD,
  },
  { total: 255, red: 12, black: 243, totalMod29: p, blackMod29: inverseScalar(A) }
);

console.log(
  JSON.stringify(
    {
      status: 'PASS',
      classification:
        'source-only structural state closure; no unknown LP2 plaintext or complete body decoder',
      p15State: { p, g, a, b, A, B, K, e, q, F },
      p7: {
        products: p7Products,
        determinant: p7Matrix.determinant,
        inverseFirstRow: p7InverseRow,
      },
      chapter: {
        records: chapterRecords,
        itinerary: itinerary.map((x) => x.page),
        outRow,
        outH5: H(outRow),
        outCirculant: {
          determinant: outCirculant.determinant,
          inverseFirstRow: outCirculant.inverse[0],
        },
        orientationHits: orientationHits.map((x) => [x.reversed, x.rotation]),
        fixedMarginal: {
          permutations,
          exactOutRowHits: outRowHits,
          oneIn: permutations / outRowHits,
        },
        chapter27: {
          length: chapter27.length,
          sum: sum(chapter27),
          product: product(chapter27),
        },
      },
      p8: {
        redWords: [red4.values, red8.values],
        h4: H(red4.values),
        h8: H(red8.values),
        recoveredState: p8Decoded.state,
        pairCensus: {
          manuscriptPairs: pairCount,
          arity48Pairs: arity48Count,
          dhClosureHits: pairHits.map((x) => [x.page, x.start]),
          redTwoWordSpans,
          redArity48,
          redDhClosureHits: redHits,
        },
        firstBlack: {
          values: firstBlack.values,
          descriptor: [firstBlack.values.length, sum(firstBlack.values), product(firstBlack.values)],
          h3: H(firstBlack.values),
          threeRuneWords: threeRuneCount,
          descriptorHits: firstBlackDescriptorHits,
          h3Hits: firstBlackHHits,
        },
        pageGeometry: {
          totalRunes: p8.indices.length,
          redRunes: p8Ann.red_spans[0].length,
          blackRunes: black.length,
          totalMod29: p8.indices.length % MOD,
          blackMod29: black.length % MOD,
        },
        predictsP7Products: p7PredictedFromP8,
      },
      boundary:
        'The p8 packet grammar and chapter OUT interpretation were recognized after their objects were independently selected, so counts are finite post-discovery diagnostics, not discovery-wide probabilities. This strengthens an original-artifact state/navigation circuit but does not decrypt p8 body text.',
    },
    null,
    2
  )
);
