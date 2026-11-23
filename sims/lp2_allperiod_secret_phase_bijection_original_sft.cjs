'use strict';
/**
 * Original-LP2 all-secret fixed-period GP29 bijection obstruction.
 * Read-only Windows Node 22 CommonJS SFT. No external packages.
 *
 * Test scopes: one continuous 12,956-rune clock at all q=1..3301;
 * nine genuine illustration-chapter restarts at q=1..1033;
 * 28 physical thirteen-dot mark restarts at q=1..1033;
 * 56 physical-page restarts at q=1..130 (including empty p50).
 * Each clock phase, and each segment if restarted, may have a private
 * arbitrary GP29 permutation. Same-(segment,phase) equality is invariant.
 *
 * Five fixed literary controls: three windows from source-relevant Crowley
 * and two from Blake. These are overlapping works/windows, not a universal
 * English-language null distribution. No unknown plaintext is asserted.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

/** @param {string} rel @returns {string} */
function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
assert.equal(corpus.runes.length, 29);
const pages = corpus.pages.filter(p => p.page <= 55);
assert.equal(pages.length, 56);
const source = pages.flatMap(p => p.indices);
assert.equal(source.length, 12956);
assert.equal(pages.find(p => p.page === 50).indices.length, 0);

const tokens = corpus.translit.map((token, index) => ({ token, index }))
  .sort((a, b) => b.token.length - a.token.length);

/**
 * Encode author-native prose with the same greedy GP29 transliteration
 * as the pinned historical Book-of-Law and Blake controls.
 * @param {string} raw
 * @returns {number[]}
 */
function gp(raw) {
  const text = raw.toUpperCase().replaceAll('V', 'U').replaceAll('K', 'C');
  const output = [];
  for (let i = 0; i < text.length;) {
    const next = tokens.find(t => text.startsWith(t.token, i));
    if (next) {
      output.push(next.index);
      i += next.token.length;
    } else {
      i += 1;
    }
  }
  return output;
}
const crowley = gp(['I', 'II', 'III'].map(roman =>
  read('resources/external/2013-book-of-law-' + roman + '.txt')).join('\n'));
assert.equal(crowley.length, 21611);
const edition = read('resources/external/cicada2012-blake-marriage-gutenberg45315.txt');
const start = edition.indexOf('THE ARGUMENT');
const end = edition.indexOf('*** END OF THIS PROJECT GUTENBERG EBOOK');
assert.ok(start >= 0 && end > start);
const blake = gp(edition.slice(start, end));
assert.equal(blake.length, 18631);

const N = source.length;
const donors = [
  { id: 'Crowley-0', values: crowley.slice(0, N) },
  { id: 'Crowley-4327', values: crowley.slice(4327, 4327 + N) },
  { id: 'Crowley-8655', values: crowley.slice(8655, 8655 + N) },
  { id: 'Blake-0', values: blake.slice(0, N) },
  { id: 'Blake-5675', values: blake.slice(5675, 5675 + N) }
];
for (const d of donors) assert.equal(d.values.length, N);

const ends = [0];
for (const page of pages) ends.push(ends.at(-1) + page.indices.length);
assert.equal(ends.at(-1), N);
const pageSpans = pages.map((_, i) => [ends[i], ends[i + 1]]);
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
assert.equal(ink.counts.red13 + ink.counts.black13, 31);
const markCuts = [0];
for (const entry of ink.pages.filter(p => p.page <= 55)) {
  for (const mark of entry.large_punctuation || []) {
    if (mark[1] === 13) markCuts.push(ends[entry.page] + mark[0]);
  }
}
markCuts.push(N);
markCuts.sort((a, b) => a - b);
assert.equal(markCuts.length, 30); // 28 13-dot physical marks plus endpoints
const markSpans = markCuts.slice(1).map((end, i) => [markCuts[i], end]);
assert.equal(markSpans.filter(([a, b]) => a === b).length, 3);
assert.equal(markSpans.at(-1)[1], N);
const chapterPages = [0, 3, 8, 15, 23, 28, 33, 40, 54, 56];
const starts = chapterPages.map(p => ends[p]);
assert.deepEqual(starts,
  [0, 729, 1874, 3603, 5506, 6761, 7960, 9640, 12648, 12956]);
const chapterSpans = starts.slice(1).map((end, i) => [starts[i], end]);

/**
 * Count every equal-symbol pair from positions sharing both a segment and
 * clock phase. Under C[i] = permutation[segment,(i-start)%q](P[i]),
 * this count is unchanged by ANY choices of the secret bijections.
 * @param {number[]} values
 * @param {number} maximumPeriod
 * @param {number[][]} spans
 * @returns {Int32Array}
 */
function allPeriods(values, maximumPeriod, spans) {
  const result = new Int32Array(maximumPeriod + 1);
  const counts = new Uint16Array(29 * maximumPeriod);
  for (let q = 1; q <= maximumPeriod; q++) {
    let pairs = 0;
    for (const [begin, end] of spans) {
      counts.fill(0, 0, 29 * q);
      for (let i = begin, phase = 0; i < end; i++, phase++) {
        if (phase === q) phase = 0;
        const idx = phase * 29 + values[i];
        pairs += counts[idx];
        counts[idx] += 1;
      }
    }
    result[q] = pairs;
  }
  return result;
}

/** @param {number} segment @param {number} phase @returns {number[]} */
function privatePermutation(segment, phase) {
  const a = Array.from({ length: 29 }, (_, i) => i);
  let state = (Math.imul(segment + 1, 2654435761) +
    Math.imul(phase + 1, 1013904223)) >>> 0;
  for (let i = a.length - 1; i > 0; i--) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    const j = (state >>> 0) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  assert.equal(new Set(a).size, 29);
  return a;
}

/**
 * Synthetic arbitrary non-affine private bijections, no fitted key.
 * @param {number[]} values
 * @param {number} q
 * @param {number[][]} spans
 * @param {boolean} inverse
 * @returns {number[]}
 */
function transform(values, q, spans, inverse) {
  const out = Array.from(values);
  for (let segment = 0; segment < spans.length; segment++) {
    const [begin, end] = spans[segment];
    const cache = new Map();
    for (let i = begin; i < end; i++) {
      const phase = (i - begin) % q;
      let permutation = cache.get(phase);
      if (!permutation) {
        permutation = privatePermutation(segment, phase);
        cache.set(phase, permutation);
      }
      out[i] = inverse ? permutation.indexOf(values[i]) :
        permutation[values[i]];
    }
  }
  return out;
}

const regimes = [
  { label: 'book-global', maximum: 3301, spans: [[0, N]],
    checks: [{ q: 840, original: 3277,
      donors: [5781, 5802, 5799, 5835, 5680] },
      { q: 3301, original: 634,
        donors: [1198, 1175, 1140, 1160, 1164] }] },
  { label: 'nine-authentic-chapter-restarts', maximum: 1033,
    spans: chapterSpans,
    checks: [{ q: 840, original: 267,
      donors: [478, 497, 494, 502, 475] },
      { q: 1000, original: 212,
        donors: [387, 369, 378, 370, 367] },
      { q: 1033, original: 211,
        donors: [360, 342, 394, 348, 344] }] },
  { label: '28-authentic-13dot-mark-restarts', maximum: 1033,
    spans: markSpans,
    checks: [{ q: 840, original: 256,
      donors: [444, 457, 452, 470, 438] },
      { q: 1000, original: 193,
        donors: [363, 342, 364, 345, 352] },
      { q: 1033, original: 196,
        donors: [338, 324, 357, 336, 312] }] },
  { label: '56-physical-page-restarts', maximum: 130,
    spans: pageSpans,
    checks: [{ q: 64, original: 636,
      donors: [1179, 1106, 1199, 1154, 1187] },
      { q: 130, original: 224,
        donors: [401, 427, 425, 403, 397] }] }
];
for (const regime of regimes) {
  const observed = allPeriods(source, regime.maximum, regime.spans);
  const control = donors.map(d =>
    allPeriods(d.values, regime.maximum, regime.spans));
  let closestGap = Infinity;
  let closestPeriod = -1;
  for (let q = 1; q <= regime.maximum; q++) {
    const minControl = Math.min(...control.map(x => x[q]));
    const gap = minControl - observed[q];
    assert.ok(gap > 0,
      regime.label + ' violates source-native inequality at q=' + q);
    if (gap < closestGap) {
      closestGap = gap;
      closestPeriod = q;
    }
  }
  for (const check of regime.checks) {
    assert.equal(observed[check.q], check.original);
    assert.deepEqual(control.map(x => x[check.q]), check.donors);
  }
  const witness = donors[0].values;
  const plantCipher = transform(witness, regime.maximum, regime.spans, false);
  const recovered = transform(plantCipher, regime.maximum, regime.spans, true);
  assert.deepEqual(recovered, witness);
  assert.equal(allPeriods(plantCipher, regime.maximum,
    regime.spans)[regime.maximum],
  allPeriods(witness, regime.maximum, regime.spans)[regime.maximum]);
  console.log(JSON.stringify({
    regime: regime.label,
    originalSourceRunes: N,
    controls: donors.map(d => d.id),
    periodsCovered: [1, regime.maximum],
    periodsWithOriginalBelowAllFiveControls: regime.maximum,
    nearestObservedControlGap: closestGap,
    atPeriod: closestPeriod,
    frozenWitnesses: regime.checks,
    privatePermutationPositive: 'Exact GP29 forward/decode and invariant PASS'
  }, null, 2));
}
console.log('PASS: all-secret GP29 fixed-period mono-rune families are');
console.log('contradicted by all five source-native controls in stated periods.');
console.log('No unknown original LP2 rune was deciphered.');
