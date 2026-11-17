'use strict';

/**
 * SFT for a clue-constrained, but unconfirmed, 256-byte red-page clock.
 * The original p27 and p55 six-rune duplication is exactly 6395 rune
 * positions apart, with five intervening pages bearing red GP runes.
 *
 * This test fixes a single added clock tick at the beginning of each
 * source-annotated red-bearing physical page. It does not fit key phases
 * to unknown plaintext. Source input is the current canonical LP2 corpus.
 *
 * Execute with Node.js 22; no packages or file writes are required.
 */

const assert = require('node:assert/strict');
const gp = require('../resources/liber-primus/lp2-corpus.json');
const ink = require('../resources/liber-primus/lp2-ink-annotations.json');
const grid = require('../resources/liber-primus/lp2-grid-256.json');

/** @param {number[]} values @returns {number} */
function coincidence(values) {
  const counts = new Array(29).fill(0);
  for (const value of values) counts[value] += 1;
  const n = values.length;
  return counts.reduce((sum, k) => sum + k * (k - 1), 0) / (n * (n - 1));
}

/**
 * @param {number[]} data
 * @param {number[]} clock
 * @param {number} length
 * @returns {{pairs:number,raw:number,adjusted:number,independent:number,indRaw:number,indAdjusted:number}}
 */
function repeatedPairs(data, clock, length) {
  /** @type {Map<string, number[]>} */
  const seen = new Map();
  const counts = {
    pairs: 0, raw: 0, adjusted: 0, independent: 0,
    indRaw: 0, indAdjusted: 0,
  };
  for (let end = length; end <= data.length; end += 1) {
    const at = end - length;
    const fingerprint = data.slice(at, end).join(',');
    const previous = seen.get(fingerprint) ?? [];
    for (const earlier of previous) {
      if (at - earlier < length) continue;
      const focal = Math.abs(earlier - 6555) <= 4 &&
        Math.abs(at - 12950) <= 4;
      const raw = (at - earlier) % 256 === 0;
      const adjusted = (clock[at] - clock[earlier]) % 256 === 0;
      counts.pairs += 1;
      counts.raw += Number(raw);
      counts.adjusted += Number(adjusted);
      if (!focal) {
        counts.independent += 1;
        counts.indRaw += Number(raw);
        counts.indAdjusted += Number(adjusted);
      }
    }
    previous.push(at);
    seen.set(fingerprint, previous);
  }
  return counts;
}

/**
 * @param {number[]} ciphertext
 * @param {number} globalStart
 * @param {number[]} clock
 * @param {number[]} table
 * @param {number} sign
 * @param {number} anchor
 * @returns {number[]}
 */
function decode(ciphertext, globalStart, clock, table, sign, anchor) {
  return ciphertext.map((c, i) =>
    (c + sign * table[((clock[globalStart + i] - anchor) % 256 + 256) % 256] % 29 + 29) % 29);
}

/** @param {number[]} values @returns {string} */
function words(values) {
  return values.map((value) => gp.translit[value]).join('');
}

const pages = gp.pages.filter((page) => page.page <= 55);
const starts = new Map();
const cipher = [];
for (const page of pages) {
  starts.set(page.page, cipher.length);
  cipher.push(...page.indices);
}
assert.equal(cipher.length, 12956);
assert.equal(gp.translit.length, 29);
assert.equal(grid.bytes.length, 256);
assert.ok(grid.bytes.every((v) => Number.isInteger(v) && v >= 0 && v <= 255));

const redPages = ink.pages.filter((page) =>
  page.page <= 55 && (page.red_spans?.length ?? 0) > 0);
const events = redPages.map((page) => ({
  page: page.page,
  offset: starts.get(page.page) +
    Math.min(...page.red_spans.map((span) => span.start)),
}));
assert.deepEqual(events.map(({page}) => page),
  [0, 3, 6, 7, 8, 15, 23, 27, 33, 39, 40, 53, 54]);

const eventAt = new Set(events.map((event) => event.offset));
const clock = [];
let added = 0;
for (let i = 0; i < cipher.length; i += 1) {
  if (eventAt.has(i)) added += 1;
  clock.push(i + added);
}

const first = starts.get(27) + 28;
const second = starts.get(55) + 70;
const six = 6;
assert.equal(first, 6555);
assert.equal(second, 12950);
assert.deepEqual(cipher.slice(first, first + six), cipher.slice(second, second + six));
assert.equal(words(cipher.slice(first, first + six)), 'DJUBEI');
assert.equal(second - first, 6395);
const intervening = events.filter(({offset}) => offset > first && offset <= second);
assert.deepEqual(intervening.map(({page}) => page), [33, 39, 40, 53, 54]);
assert.equal(clock[second] - clock[first], 25 * 256);

const repeats = Object.fromEntries([3, 4, 5, 6].map((size) =>
  [size, repeatedPairs(cipher, clock, size)]));
assert.deepEqual(repeats[4],
  { pairs: 129, raw: 2, adjusted: 3, independent: 126, indRaw: 2, indAdjusted: 0 });
assert.deepEqual(repeats[5],
  { pairs: 6, raw: 0, adjusted: 2, independent: 4, indRaw: 0, indAdjusted: 0 });
assert.deepEqual(repeats[6],
  { pairs: 1, raw: 0, adjusted: 1, independent: 0, indRaw: 0, indAdjusted: 0 });

const p55 = pages.find((page) => page.page === 55).indices;
const heldStart = starts.get(40);
const held = cipher.slice(heldStart, starts.get(54));
assert.equal(p55.length, 76);
assert.equal(held.length, 3008);

const rawAnchor = 0;
const tableInsertionAt = starts.get(49) +
  pages.find((page) => page.page === 49).indices.length;
const tableAnchor = clock[tableInsertionAt - 1] + 1;
const results = [];
for (const [anchorLabel, anchor] of [
  ['book', rawAnchor],
  ['after-p49', tableAnchor],
]) {
  for (const sign of [-1, 1]) {
    const decoded55 = decode(p55, starts.get(55), clock, grid.bytes, sign, anchor);
    const decodedHeld = decode(held, heldStart, clock, grid.bytes, sign, anchor);
    assert.deepEqual(
      decode(decoded55, starts.get(55), clock, grid.bytes, -sign, anchor), p55,
      'The additive codec must invert on original ciphertext');
    results.push({
      anchor: anchorLabel,
      sign,
      p55IoC: coincidence(decoded55),
      heldoutIoC: coincidence(decodedHeld),
      p55Prefix: words(decoded55.slice(0, 24)),
    });
  }
}

const expectedP55 = [
  0.03263157894736842,
  0.031228070175438598,
  0.036491228070175435,
  0.03508771929824561,
];
results.forEach((result, i) => {
  assert.ok(Math.abs(result.p55IoC - expectedP55[i]) < 1e-12);
  assert.ok(result.heldoutIoC < 0.04);
});

console.log(JSON.stringify({
  status: 'PASS',
  originalRuneCount: cipher.length,
  sourceRedPages: events.map(({page}) => page),
  focal: { first, second, gap: second - first, extraTicks: intervening.length,
    correctedGap: clock[second] - clock[first] },
  repeatKgramPairs: repeats,
  originalP55IoC: coincidence(p55),
  results,
  conclusion: 'No independent repeat-phase confirmation or unknown LP2 prose; retire this direct clock/table consumer only.',
}, null, 2));
