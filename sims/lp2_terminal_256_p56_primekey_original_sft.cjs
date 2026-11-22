'use strict';
/**
 * Source-typed original-input terminal-table / authentic p56 key concordance.
 * Read-only SFT, Node 22, CommonJS; no external dependencies.
 *
 * Original LP2 terminal page lengths 76 + 85 + 95 = 256 are frozen before
 * testing values. This is an exploratory typed alignment, NOT a decryption.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

/** @param {string} rel @returns {string} */
function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

/** @param {number} n @returns {number} */
function mod29(n) {
  return ((n % 29) + 29) % 29;
}

/** @param {number} length @returns {number[]} */
function firstPrimes(length) {
  const out = [];
  for (let candidate = 2; out.length < length; candidate++) {
    let yes = true;
    for (const p of out) {
      if (p * p > candidate) break;
      if (candidate % p === 0) {
        yes = false;
        break;
      }
    }
    if (yes) out.push(candidate);
  }
  return out;
}

/** @param {number[]} v @returns {number} */
function normalizedIoc(v) {
  const counts = Array(29).fill(0);
  for (const x of v) counts[x]++;
  return 29 * counts.reduce((s, x) => s + x * (x - 1), 0)
    / (v.length * (v.length - 1));
}

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/base60-grid.json'));
const tokens = grid.rows.flat();
assert.equal(grid.rows.length, 32);
assert.ok(grid.rows.every((row) => row.length === 8));
assert.equal(tokens.length, 256);
assert.equal(grid.alphabet.length, 60);
assert.ok(tokens.every((t) => t.length === 2));
assert.ok(!tokens.some((t) => t.includes('f')));
assert.deepEqual([55, 56, 57].map((n) => corpus.pages[n].indices.length),
  [76, 85, 95]);
assert.equal(76 + 85 + 95, tokens.length);

const textP56 =
  'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE ' +
  'THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const units = corpus.translit.map((symbol, index) => ({ symbol, index }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {string} word @returns {number[]} */
function gpWord(word) {
  const result = [];
  for (let i = 0; i < word.length;) {
    const unit = units.find((x) => word.startsWith(x.symbol, i));
    assert.ok(unit, word.slice(i));
    result.push(unit.index);
    i += unit.symbol.length;
  }
  return result;
}
const plain56 = textP56.split(' ').flatMap(gpWord);
assert.equal(plain56.length, 85);
const prime = firstPrimes(100);
let primeClock = 0;
const primeShift = plain56.map((p) => {
  if (p === 0) return null; // Authentic transparent F: no key step.
  return mod29(prime[primeClock++] - 1);
});
assert.equal(primeClock, 84);
assert.deepEqual(plain56.flatMap((x, i) => x === 0 ? [i] : []), [56]);
const cipher56 = plain56.map((v, i) =>
  v === 0 ? 0 : mod29(v + primeShift[i]));
assert.deepEqual(cipher56, corpus.pages[56].indices);
const p55 = corpus.pages[55].indices;
const p57 = corpus.pages[57].indices;
assert.equal(p57.length, 95);

/** @param {string} alphabet @returns {number[]} */
function digitValues(alphabet) {
  const radix = alphabet.length;
  return tokens.map((token) => {
    const a = alphabet.indexOf(token[0]);
    const b = alphabet.indexOf(token[1]);
    assert.ok(a >= 0 && b >= 0);
    const value = radix * a + b;
    assert.ok(value >= 0 && value <= 255);
    return value;
  });
}
const alphabets = [grid.alphabet, grid.alphabet.replace('f', '')];
assert.deepEqual(alphabets.map((x) => x.length), [60, 59]);
const numeric = alphabets.map(digitValues);
const values = numeric.map((row) => row.map((x) => x % 29));
assert.deepEqual(numeric.map((row) => new Set(row).size), [161, 161]);

const target = [
  primeShift.map((x) => x === null ? null : x),
  primeShift.map((x) => x === null ? null : mod29(-x))
];
const used = [];
for (let i = 0; i < primeShift.length; i++) {
  if (primeShift[i] !== null) used.push(i);
}

/**
 * Count exact residue coincidences on all 84 prime-consuming positions.
 * @param {number[]} row
 * @param {number} start
 * @param {number} signIndex 0 = positive authentic key, 1 = negative key
 * @returns {number}
 */
function hits(row, start, signIndex) {
  let n = 0;
  for (const i of used) {
    if (row[(start + i) & 255] === target[signIndex][i]) n++;
  }
  return n;
}

const observed = [
  hits(values[0], 76, 0), hits(values[0], 76, 1),
  hits(values[1], 76, 0), hits(values[1], 76, 1)
];
assert.deepEqual(observed, [3, 5, 6, 11]);
const exactPositions = used.filter((i) =>
  values[1][76 + i] === target[1][i]);
assert.deepEqual(exactPositions,
  [3, 16, 20, 29, 33, 41, 60, 63, 64, 71, 76]);
const matches = exactPositions.map((i) => ({
  p56RuneOffset: i, tableIndex: 76 + i,
  printedToken: tokens[76 + i], numericValue: numeric[1][76 + i],
  nativePlainRune: corpus.translit[plain56[i]],
  originalCipherRune: corpus.translit[cipher56[i]]
}));

const allAlignments = [];
for (let z = 0; z < 2; z++) {
  for (let sign = 0; sign < 2; sign++) {
    for (let offset = 0; offset < 256; offset++) {
      allAlignments.push({
        radix: alphabets[z].length, sign: sign === 0 ? '+' : '-',
        offset, hits: hits(values[z], offset, sign)
      });
    }
  }
}
allAlignments.sort((a, b) => b.hits - a.hits);
assert.equal(allAlignments.length, 1024);
assert.deepEqual(allAlignments[0],
  { radix: 59, sign: '-', offset: 76, hits: 11 });
assert.equal(allAlignments[1].hits, 10);
assert.equal(allAlignments.filter((a) => a.hits === 11).length, 1);

/*
 * Stronger text-derived rival: original p57 explicitly instructs solvers to
 * shed circumferences. The 32x8 table has an outer 76-cell ring, matching
 * p55, while its inner 30x6 rectangle contains 180=85+95 cells. Preserve
 * original row-major order inside that rectangle and test p56 then p57.
 * This differs from a simple contiguous source tape at offsets 76..255.
 */
const ring = [];
const interior = [];
for (let row = 0; row < 32; row++) {
  for (let column = 0; column < 8; column++) {
    const address = row * 8 + column;
    if (row === 0 || row === 31 || column === 0 || column === 7) {
      ring.push(address);
    } else {
      interior.push(address);
    }
  }
}
assert.equal(ring.length, 76);
assert.equal(interior.length, 180);
assert.deepEqual([...ring, ...interior].sort((a, b) => a - b),
  Array.from({ length: 256 }, (_, i) => i));
const interiorScores = values.map((v) =>
  [0, 1].map((sign) =>
    used.reduce((n, i) =>
      n + (v[interior[i]] === target[sign][i]), 0)));
assert.deepEqual(interiorScores, [[3, 1], [3, 3]]);
const interiorP57Matches = values.map((v) =>
  p57.filter((plainRune, i) => v[interior[85 + i]] === plainRune).length);
assert.deepEqual(interiorP57Matches, [2, 6]);

/**
 * A whole-table stationary lookup token -> native plaintext GP rune would
 * require identical printed tokens to always mean identical runes. An exact
 * necessary condition can be rejected on independently solved terminal text.
 * @param {number[]} addresses
 * @returns {{duplicate: number, contradiction: number}}
 */
function fixedTokenContradictions(addresses) {
  const seen = new Map();
  const plain = plain56.concat(p57);
  let duplicate = 0;
  let contradiction = 0;
  addresses.forEach((address, i) => {
    const token = tokens[address];
    const previous = seen.get(token);
    if (previous !== undefined) {
      duplicate++;
      if (previous !== plain[i]) contradiction++;
    } else {
      seen.set(token, plain[i]);
    }
  });
  return { duplicate, contradiction };
}
const ringLookupGate = fixedTokenContradictions(interior);
const linearLookupGate = fixedTokenContradictions(
  Array.from({ length: 180 }, (_, i) => 76 + i));
assert.deepEqual(ringLookupGate, { duplicate: 53, contradiction: 47 });
assert.deepEqual(linearLookupGate, { duplicate: 51, contradiction: 48 });

// A direct same-table additive-pad decoder on untouched p55 is not language.
const p55Direct = [];
for (let z = 0; z < 2; z++) {
  for (const sign of [-1, 1]) {
    const output = p55.map((v, i) => mod29(v + sign * values[z][i]));
    assert.ok(output.every((v, i) =>
      mod29(v - sign * values[z][i]) === p55[i]));
    p55Direct.push({
      radix: alphabets[z].length, sign, normalizedIoc: normalizedIoc(output),
      prefix: output.slice(0, 20).map((i) => corpus.translit[i]).join('')
    });
  }
}
assert.ok(p55Direct.every((x) => x.normalizedIoc < 1.20));
assert.ok(normalizedIoc(p57) > 1.8);
assert.deepEqual(values.map((row) =>
  p57.filter((v, i) => row[161 + i] === v).length), [4, 2]);

// A proper planted source-native page (fixed first 95 table values) must
// invert exactly. Forward/backward correctness alone does not prove original
// p55 used this candidate key.
for (let z = 0; z < 2; z++) {
  const planted = p57.map((v, i) => mod29(v + values[z][i]));
  assert.deepEqual(planted.map((v, i) => mod29(v - values[z][i])), p57);
}

let seed = 0x03301256;
/** @param {number} n @returns {number} */
function randomIndex(n) {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) % n;
}
/** @param {number[]} a */
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
}

/*
 * Null A: original word-length alignment stays fixed at table offset76;
 * uniformly shuffle the *same 256 original physical table cells* for both
 * radices. This preserves all real printed tokens and their multiplicities.
 */
const index = Array.from({ length: 256 }, (_, i) => i);
let fixedTail = 0;
let fixedFourModeTail = 0;
const fixedTrials = 100000;
for (let trial = 0; trial < fixedTrials; trial++) {
  shuffle(index);
  const n = [0, 0, 0, 0];
  for (const i of used) {
    const j = index[76 + i];
    if (values[0][j] === target[0][i]) n[0]++;
    if (values[0][j] === target[1][i]) n[1]++;
    if (values[1][j] === target[0][i]) n[2]++;
    if (values[1][j] === target[1][i]) n[3]++;
  }
  if (n[3] >= observed[3]) fixedTail++;
  if (Math.max(...n) >= observed[3]) fixedFourModeTail++;
}

/*
 * Null B: a strict guard against retrospective offset selection.
 * In each shuffled original table, examine all 1,024 offset/radix/sign
 * interpretations, charging the entire search rather than just offset76.
 */
for (let i = 0; i < 256; i++) index[i] = i;
seed = 0x330125601;
const globalTrials = 1800;
let globalTail = 0;
for (let trial = 0; trial < globalTrials; trial++) {
  shuffle(index);
  let succeeded = false;
  outer:
  for (let z = 0; z < 2; z++) {
    for (let sign = 0; sign < 2; sign++) {
      for (let start = 0; start < 256; start++) {
        let count = 0;
        for (const i of used) {
          if (values[z][index[(start + i) & 255]] === target[sign][i]) {
            count++;
          }
        }
        if (count >= 11) {
          succeeded = true;
          break outer;
        }
      }
    }
  }
  if (succeeded) globalTail++;
}

const result = {
  input: { physicalPages: [55, 56, 57], lengths: [76, 85, 95],
    tableRows: 32, tableColumns: 8, tableCells: 256,
    p56TransparentFOffset: 56, p56PrimeConsumingRunes: 84 },
  observed: { variants: {
    base60Plus: observed[0], base60Minus: observed[1],
    base59Plus: observed[2], base59Minus: observed[3]
  }, fixedOriginalOffset: 76, exactPositions, matches,
    allOffsetTop: allAlignments.slice(0, 4), p55Direct,
    circumferenceRival: { ringCells: ring.length, innerCells: interior.length,
      innerPrimeKeyMatchesPlusMinus: interiorScores,
      interiorP57Matches, ringLookupGate, linearLookupGate },
    p57NativeNormalizedIoc: normalizedIoc(p57) },
  nulls: {
    fixedOffset: { trials: fixedTrials, fixedTail,
      correctedTail: (fixedTail + 1) / (fixedTrials + 1),
      fourModeTail: fixedFourModeTail,
      fourModeCorrectedTail: (fixedFourModeTail + 1) / (fixedTrials + 1) },
    all1024Offsets: { trials: globalTrials, tail: globalTail,
      correctedTail: (globalTail + 1) / (globalTrials + 1) }
  },
  decision: 'No original unknown plaintext; 73/84 p56 key positions do not match; all direct p55 table-key inverses remain ciphertext-like.'
};
console.log(JSON.stringify(result, null, 2));
