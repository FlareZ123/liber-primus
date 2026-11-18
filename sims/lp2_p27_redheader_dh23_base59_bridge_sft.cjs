'use strict';

/**
 * p55 -> p27 red-heading -> signed DH23/base59 pointer closure.
 *
 * Run:
 *   node sims/lp2_p27_redheader_dh23_base59_bridge_sft.cjs
 *
 * Read-only. Uses only repository source fixtures and Node.js standard modules.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} file */
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const corpus = readJson('resources/liber-primus/lp2-corpus.json');
const ink = readJson('resources/liber-primus/lp2-ink-annotations.json');
const grid = readJson('resources/liber-primus/base60-grid.json');

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const tokens = grid.rows.flat();
const base60Alphabet = grid.alphabet;
const base59Alphabet = base60Alphabet.replace('f', '');
assert.equal(tokens.length, 256);
assert.equal(base60Alphabet.length, 60);
assert.equal(base59Alphabet.length, 59);
assert(tokens.every((token) => [...token].every((ch) => base59Alphabet.includes(ch))));

/** @param {string} alphabet */
function decode(alphabet) {
  return tokens.map((token) =>
    alphabet.length * alphabet.indexOf(token[0]) + alphabet.indexOf(token[1]));
}

/** @param {number} n */
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) return false;
  }
  return true;
}

/** @param {number} n */
function primeOrdinal(n) {
  assert(isPrime(n));
  let count = 0;
  for (let value = 2; value <= n; value++) {
    if (isPrime(value)) count++;
  }
  return count;
}

/** @param {string} runes */
function gpPrimeSum(runes) {
  return [...runes].reduce((sum, rune) => {
    const index = runeIndex.get(rune);
    assert.notEqual(index, undefined);
    return sum + corpus.prime[index];
  }, 0);
}

/** @param {number[]} map @param {number} start @param {number} hops */
function walk(map, start, hops) {
  const nodes = [start];
  let at = start;
  for (let step = 0; step < hops; step++) {
    at = map[at];
    nodes.push(at);
  }
  return nodes;
}

const base59 = decode(base59Alphabet);
const base60 = decode(base60Alphabet);
const redSpans = ink.pages.flatMap((page) =>
  (page.red_spans || []).map((span) => ({...span, page: page.page})));
assert.equal(redSpans.length, 18);

const p27 = redSpans.find((span) => span.page === 27 && span.start === 0);
assert(p27);
assert.equal(p27.length, 19);
assert.equal(p27.runes, 'ᛗᛈᚣᛚᛋᚩᚪᚫᚻᛚᛖᛇᛁᛗᛚᛚᛋᚳᛈ');
const p27PrimeSum = gpPrimeSum(p27.runes);
assert.equal(p27PrimeSum, 1109);
assert(isPrime(p27PrimeSum));
const p27Rank = primeOrdinal(p27PrimeSum);
assert.equal(p27Rank, 186);

// Clear p57 MUST independently names the same scalar 186.
const mustIndices = [19, 1, 15, 16];
assert.equal(mustIndices.map((index) => corpus.translit[index]).join(''), 'MUST');
assert.equal(mustIndices.reduce((sum, index) => sum + corpus.prime[index], 0), 186);

// Original table cell186 returns 19 in both plausible radices.
assert.equal(tokens[p27Rank], '0J');
assert.equal(base59[p27Rank], p27.length);
assert.equal(base60[p27Rank], p27.length);
assert.deepEqual(base59.flatMap((value, index) => value === 19 ? [index] : []), [186]);

// Signed Cicada 2013 worked example: DH 23 -> 01 OK 5 8 -> 19 -> DATA 2.
const dh = {p: 23, base: 5, serverPublic: 8, clientPublic: 19, shared: 2};
assert.equal(grid.rows[0].length, dh.serverPublic);
const start = dh.p * dh.serverPublic + dh.shared;
const end = dh.p * dh.serverPublic + dh.base;
assert.equal(start, 186);
assert.equal(end, 189);
assert.equal(base59[start], dh.clientPublic);
assert.equal(base60[start], dh.clientPublic);

const path59 = walk(base59, start, dh.serverPublic);
const path60 = walk(base60, start, dh.serverPublic);
assert.deepEqual(path59, [186, 19, 33, 112, 72, 161, 214, 247, 189]);
assert.deepEqual(path60, [186, 19, 33, 114, 197, 115, 247, 192, 0]);
assert.equal(path59.at(-1), end);
assert.equal(base59[end], end);
assert.equal(path60.at(-1), 0);
assert.notEqual(path60.at(-1), end);

// Exhaust the natural 2 radix x 2 row-origin x 2 column-origin family.
const conventions = [];
for (const [radix, map] of [['base59', base59], ['base60', base60]]) {
  for (const rowOneBased of [false, true]) {
    for (const columnOneBased of [false, true]) {
      const row = dh.p - (rowOneBased ? 1 : 0);
      const startColumn = dh.shared - (columnOneBased ? 1 : 0);
      const endColumn = dh.base - (columnOneBased ? 1 : 0);
      const candidateStart = row * dh.serverPublic + startColumn;
      const candidateEnd = row * dh.serverPublic + endColumn;
      const candidatePath = walk(map, candidateStart, dh.serverPublic);
      conventions.push({
        radix,
        rowOneBased,
        columnOneBased,
        start: candidateStart,
        end: candidateEnd,
        startValueIsClient: map[candidateStart] === dh.clientPublic,
        closesAfterEight: candidatePath.at(-1) === candidateEnd,
        endpointSelfPoints: map[candidateEnd] === candidateEnd
      });
    }
  }
}
const completeConventions = conventions.filter((entry) =>
  entry.startValueIsClient && entry.closesAfterEight && entry.endpointSelfPoints);
assert.deepEqual(completeConventions, [{
  radix: 'base59',
  rowOneBased: false,
  columnOneBased: false,
  start: 186,
  end: 189,
  startValueIsClient: true,
  closesAfterEight: true,
  endpointSelfPoints: true
}]);

// Red-span control: p27 is the only prime-sum red span whose direct
// zero-based prime-rank table lookup returns that span's rune length.
const eligible = redSpans.flatMap((span) => {
  const sum = gpPrimeSum(span.runes);
  if (!isPrime(sum)) return [];
  const rank = primeOrdinal(sum);
  if (rank >= 256) return [];
  return [{page: span.page, start: span.start, length: span.length, sum, rank,
    value: base60[rank], oneBasedValue: rank > 0 ? base60[rank - 1] : null}];
});
assert.deepEqual(eligible, [
  {page: 3, start: 119, length: 3, sum: 137, rank: 33, value: 114, oneBasedValue: 115},
  {page: 6, start: 71, length: 11, sum: 661, rank: 121, value: 237, oneBasedValue: 42},
  {page: 27, start: 0, length: 19, sum: 1109, rank: 186, value: 19, oneBasedValue: 156},
  {page: 33, start: 0, length: 10, sum: 379, rank: 75, value: 177, oneBasedValue: 205},
  {page: 39, start: 119, length: 3, sum: 173, rank: 40, value: 80, oneBasedValue: 5},
  {page: 57, start: 0, length: 7, sum: 449, rank: 87, value: 65, oneBasedValue: 111}
]);
assert.deepEqual(eligible.filter((entry) => entry.value === entry.length)
  .map((entry) => entry.page), [27]);
assert.equal(eligible.filter((entry) => entry.oneBasedValue === entry.length).length, 0);

// Discovery-aware matched-table diagnostic. Hold the two closure-defining
// source assignments fixed, shuffle the exact remaining base59 value multiset,
// and ask whether 186 first reaches 189 exactly at hop8.
const remaining = base59.slice();
remaining.splice(remaining.indexOf(19), 1);
remaining.splice(remaining.indexOf(189), 1);
let state = 0x27182305;
/** @returns {number} */
function nextRandom() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
const trials = 200000;
let exactEight = 0;
for (let trial = 0; trial < trials; trial++) {
  /** @type {Map<number, number>} */
  const assigned = new Map([[186, 19], [189, 189]]);
  const used = new Set();
  let at = 186;
  let firstReach = -1;
  for (let step = 1; step <= 8; step++) {
    let value = assigned.get(at);
    if (value === undefined) {
      let index;
      do {
        index = nextRandom() % remaining.length;
      } while (used.has(index));
      used.add(index);
      value = remaining[index];
      assigned.set(at, value);
    }
    at = value;
    if (at === 189 && firstReach < 0) firstReach = step;
  }
  if (firstReach === 8) exactEight++;
}
assert.equal(exactEight, 2028);
const fixedAssignmentProbability = (1 / 256) * (4 / 255);
const conditionalEightRate = exactEight / trials;
const impliedFullRate = fixedAssignmentProbability * conditionalEightRate;

process.stdout.write(JSON.stringify({
  status: 'source-constrained structural bridge; NO UNKNOWN PLAINTEXT',
  p27: {redLength: p27.length, primeSum: p27PrimeSum, primeOrdinal: p27Rank,
    tableToken: tokens[p27Rank], tableValue: base59[p27Rank]},
  signedDH23: dh,
  base59Path: path59,
  base60ControlPath: path60,
  naturalConventionFamily: {tested: conventions.length, complete: completeConventions.length},
  matchedTableDiagnostic: {trials, exactEight, conditionalEightRate,
    fixedAssignmentProbability, impliedFullRate, inverseRate: 1 / impliedFullRate}
}, null, 2) + '\n');
