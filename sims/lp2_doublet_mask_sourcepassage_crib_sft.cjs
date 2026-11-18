'use strict';

/**
 * LP2 word-boundary-free fixed-reserved-rune crib search.
 *
 * A source-native plaintext rune R emits a repeated ciphertext rune iff
 * P[i] === R. Every other plaintext rune can use an arbitrary secret,
 * changing 28-way bijection; its key cancels out of this exact marker mask.
 * Printed LP2 word breaks are ignored completely, but physical page-start
 * transitions are excluded from the mask.
 *
 * The search tests all 29 possible R, every contiguous offset, forward and
 * backward source reading, on the actual original pp0-2 and pp3-7 chapters.
 * A native-GP plant is generated and recovered under an invertible 28-way
 * original-shaped ciphertext emitter as a positive control.
 *
 * Windows Node 22: node sims/lp2_doublet_mask_sourcepassage_crib_sft.cjs
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = corpus.pages.filter(p => p.page <= 55);
const translit = corpus.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
const sources = [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt',
  'resources/external/cicada2012-blake-marriage-gutenberg45315.txt',
  'resources/external/2013-book-of-law-I.txt',
  'resources/external/2013-book-of-law-II.txt',
  'resources/external/2013-book-of-law-III.txt',
  'resources/external/kjv-passion-gospels-2014.txt',
  'resources/external/tennyson-lady-of-shalott-1842-gutenberg8601.txt'
];

/**
 * Existing research's native GP29 source orthography. Whitespace, Roman
 * punctuation and original source word cuts are deliberately discarded.
 * @param {string} source
 * @returns {number[]}
 */
function encodeNative(source) {
  const latin = source.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (const word of latin.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith('ING', i)) {
        out.push(21);
        i += 3;
      } else if (word.startsWith('IO', i)) {
        out.push(27);
        i += 2;
      } else {
        const rune = translit.find(t => word.startsWith(t.s, i));
        if (rune) {
          out.push(rune.i);
          i += rune.s.length;
        } else {
          i++;
        }
      }
    }
  }
  return out;
}

/**
 * @param {number[]} runes
 * @param {number[]} pageStarts
 * @returns {number[]}
 */
function eventSites(runes, pageStarts) {
  const starts = new Set(pageStarts);
  const events = [];
  for (let i = 1; i < runes.length; i++) {
    if (!starts.has(i) && runes[i] === runes[i - 1]) events.push(i);
  }
  return events;
}

/**
 * @param {number} from Inclusive physical page
 * @param {number} to Exclusive physical page
 * @param {number} skip Leading original colored-rune omission
 */
function originalWindow(from, to, skip = 0) {
  const selected = pages.filter(p => p.page >= from && p.page < to);
  const all = [];
  const starts = [0];
  for (const page of selected) {
    all.push(...page.indices);
    starts.push(all.length);
  }
  const runes = all.slice(skip);
  const cuts = [0, ...starts.slice(1, -1)
    .filter(pos => pos > skip).map(pos => pos - skip)];
  const events = eventSites(runes, cuts);
  return {runes, cuts, events};
}

/** @param {number[]} sorted @param {number} value */
function lowerBound(sorted, value) {
  let lo = 0;
  let hi = sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (sorted[mid] < value) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/**
 * Fixed-symbol match with no unknown phase or fitted 28-way secret map.
 * @param {{runes:number[],cuts:number[],events:number[]}} window
 * @param {number[]} source Native GP29 continuous source rune sequence
 * @param {number[]} positions Source offsets of one marker R
 * @returns {number[]} All exact offsets whose complete event mask matches
 */
function sourceOffsets(window, source, positions) {
  const {events, cuts, runes} = window;
  if (!events.length) return [];
  const result = [];
  const first = events[0];
  for (const hit of positions) {
    const offset = hit - first;
    if (offset < 0 || offset + runes.length > source.length) continue;
    if (!events.every(i => source[offset + i] === source[hit])) continue;
    const total = lowerBound(positions, offset + runes.length)
      - lowerBound(positions, offset);
    const ignored = cuts.reduce((n, i) =>
      n + Number(source[offset + i] === source[hit]), 0);
    if (total === events.length + ignored) result.push(offset);
  }
  return result;
}

/**
 * Source-shaped positive: each nonmarker plaintext rune receives a unique
 * nonzero successor rank, while R alone repeats its predecessor.
 * @param {number[]} plaintext
 * @param {number[]} cuts
 * @param {number} marker
 */
function encodePlant(plaintext, cuts, marker) {
  const starts = new Set(cuts);
  const out = [];
  for (let i = 0; i < plaintext.length; i++) {
    if (starts.has(i)) {
      out.push((plaintext[i] + 7) % 29);
    } else if (plaintext[i] === marker) {
      out.push(out[i - 1]);
    } else {
      const rank = plaintext[i] < marker ? plaintext[i] : plaintext[i] - 1;
      const delta = 1 + (rank + 13) % 28;
      out.push((out[i - 1] + delta) % 29);
    }
  }
  return out;
}

function main() {
  assert.equal(corpus.runes.length, 29);
  assert.equal(pages.reduce((n, p) => n + p.indices.length, 0), 12956);
  const cases = [
    {name: 'p0', window: originalWindow(0, 1)},
    {name: 'p0-p2', window: originalWindow(0, 3)},
    {name: 'p0-p2-black', window: originalWindow(0, 3, 13)},
    {name: 'p3-p7', window: originalWindow(3, 8)},
    {name: 'p19', window: originalWindow(19, 20)},
    {name: 'p24', window: originalWindow(24, 25)},
    {name: 'p27', window: originalWindow(27, 28)},
    {name: 'p29', window: originalWindow(29, 30)},
    {name: 'p44', window: originalWindow(44, 45)}
  ];
  assert.deepEqual(cases.map(c => c.window.runes.length),
    [262, 729, 716, 1145, 271, 270, 234, 277, 273]);
  assert.deepEqual(cases.slice(4).map(c => c.window.events.length),
    [5, 5, 5, 4, 4]);
  assert.equal(cases[1].window.events.length, 4);
  assert.deepEqual(cases[1].window.events, [122, 207, 456, 653]);
  const results = [];
  for (const sourcePath of sources) {
    const native = encodeNative(read(sourcePath));
    const answer = {source: sourcePath, nativeRunes: native.length, matches: {}};
    for (const direction of ['forward', 'reverse']) {
      const seq = direction === 'forward' ? native : native.slice().reverse();
      const sites = Array.from({length: 29}, () => []);
      for (let i = 0; i < seq.length; i++) sites[seq[i]].push(i);
      for (const scope of cases) {
        let hits = 0;
        for (let marker = 0; marker < 29; marker++) {
          hits += sourceOffsets(scope.window, seq, sites[marker]).length;
        }
        answer.matches[scope.name + '/' + direction] = hits;
      }
    }
    results.push(answer);
  }

  const long = [
    'p0-p2', 'p0-p2-black', 'p3-p7', 'p19', 'p24', 'p27', 'p29', 'p44'
  ];
  for (const row of results) {
    for (const scope of long) {
      assert.equal(row.matches[scope + '/forward'], 0, row.source + ' ' + scope);
      assert.equal(row.matches[scope + '/reverse'], 0, row.source + ' ' + scope);
    }
  }

  const control = encodeNative(read(sources[0]));
  const sourceOffset = 12345;
  const plantOriginal = cases[1].window;
  const plantPlaintext = control.slice(sourceOffset,
    sourceOffset + plantOriginal.runes.length);
  assert.equal(plantPlaintext.length, 729);
  const marker = 28; // EA, deliberately rare in the native GP register
  const plantCipher = encodePlant(plantPlaintext, plantOriginal.cuts, marker);
  const plant = {
    runes: plantCipher,
    cuts: plantOriginal.cuts,
    events: eventSites(plantCipher, plantOriginal.cuts)
  };
  const markerSites = [];
  for (let i = 0; i < control.length; i++) {
    if (control[i] === marker) markerSites.push(i);
  }
  assert.deepEqual(plant.events,
    plantPlaintext.flatMap((v, i) =>
      !plantOriginal.cuts.includes(i) && v === marker ? [i] : []));
  assert(sourceOffsets(plant, control, markerSites).includes(sourceOffset));

  const shortMatches = results.reduce((total, row) =>
    total + row.matches['p0/forward'] + row.matches['p0/reverse'], 0);
  assert(shortMatches > 0);

  console.log(JSON.stringify({
    classification: 'word-boundary-free source-quotation gate, no plaintext',
    originalWindows: cases.map(c => ({
      name: c.name,
      runes: c.window.runes.length,
      repeatEvents: c.window.events.length,
      physicalStarts: c.window.cuts
    })),
    allReservedGP29Markers: 29,
    sourceCount: sources.length,
    directionsPerSource: 2,
    fullChapterMatchingSourceOffsets: 0,
    shortSinglePageMatchingSourceOffsets: shortMatches,
    plantedReversibleCipherSourceRecovery: true,
    sources: results
  }, null, 2));
}

if (require.main === module) main();

module.exports = {encodeNative, originalWindow, sourceOffsets, encodePlant};
