'use strict';

/**
 * Original LP2 six-back affine invariant as a literal source-quotation
 * retrieval attack. A six-position GF29 rotor followed by any secret fixed
 * bijective alphabet preserves: C[j]=T(C[j-6]) iff P[j]=P[j-6].
 *
 * Original printed word boundaries select eligible positions. The candidate
 * plaintext may have different words and no identical punctuation: it is
 * scanned as a continuous native-GP29 text. No guessed secret substitution,
 * codebook, page keystream, phase or plaintext is fitted to the source.
 *
 * Windows Node22: node sims/lp2_sixback_sourcepassage_mask_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt');
const sourcePaths = [
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

/** @param {number} x @returns {number} */
const mod = x => (x % 29 + 29) % 29;
/** @param {number} x @returns {number} */
const T = x => mod(27 * x + 24);
const translit = corpus.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);

/**
 * Use the source-native solved-GP orthography from the prior pinned
 * literary control corpus, including NG and IA single glyphs.
 * @param {string} source
 * @returns {number[]}
 */
function encodeNative(source) {
  const latin = source.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const result = [];
  for (const word of latin.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith('ING', i)) {
        result.push(21);
        i += 3;
      } else if (word.startsWith('IO', i)) {
        result.push(27);
        i += 2;
      } else {
        const glyph = translit.find(t => word.startsWith(t.s, i));
        if (glyph) {
          result.push(glyph.i);
          i += glyph.s.length;
        } else {
          i++;
        }
      }
    }
  }
  return result;
}

const runeMap = new Map(corpus.runes.map((glyph, index) => [glyph, index]));
const originalPages = corpus.pages.filter(p => p.page <= 55);
const original = originalPages.flatMap(p => p.indices);
assert.equal(original.length, 12956);
const words = [];
let wordStart = 0;
for (const fragment of transcript.split(/[-.]/)) {
  const runes = [...fragment].filter(ch => runeMap.has(ch)).map(ch => runeMap.get(ch));
  if (!runes.length || wordStart >= original.length) continue;
  words.push({start: wordStart, glyphs: runes});
  wordStart += runes.length;
}
assert.equal(wordStart, original.length);
assert.equal(words.length, 2896);
assert.deepEqual(words.flatMap(w => w.glyphs), original);
const pageStart = [0];
for (const page of originalPages) pageStart.push(pageStart.at(-1) + page.indices.length);
assert.equal(pageStart.at(-1), original.length);

/**
 * For each eligible original word-local six-back site, freeze whether the
 * actual original affine relation holds. These equalities are invariant to
 * any stationary secret alphabet in a genuinely six-block-rotated plant.
 *
 * @param {number} fromPage
 * @param {number} untilPage Exclusive
 * @param {number[]} cipher Original or generated C
 * @returns {{len:number,sites:{at:number,yes:boolean}[],hits:number}}
 */
function originalMask(fromPage, untilPage, cipher = original) {
  const start = pageStart[fromPage];
  const end = pageStart[untilPage];
  const sites = [];
  for (const word of words) {
    for (let j = 6; j < word.glyphs.length; j++) {
      const absolute = word.start + j;
      if (absolute < start + 6 || absolute >= end) continue;
      sites.push({
        at: absolute - start,
        yes: cipher[absolute] === T(cipher[absolute - 6])
      });
    }
  }
  return {len: end - start, sites, hits: sites.filter(s => s.yes).length};
}

/**
 * Exact affine-invariant source-search gate, including **negative** events.
 * @param {number[]} seq
 * @param {{len:number,sites:{at:number,yes:boolean}[]}} mask
 * @returns {{hits:number,examples:number[]}}
 */
function matchSource(seq, mask) {
  const sites = mask.sites.slice().sort((a, b) => Number(b.yes) - Number(a.yes));
  let hits = 0;
  const examples = [];
  for (let offset = 0; offset + mask.len <= seq.length; offset++) {
    let matches = true;
    for (const site of sites) {
      if ((seq[offset + site.at] === seq[offset + site.at - 6]) !== site.yes) {
        matches = false;
        break;
      }
    }
    if (matches) {
      hits++;
      if (examples.length < 8) examples.push(offset);
    }
  }
  return {hits, examples};
}


/** Undo a single positive iteration of T(x)=27x+24 over GF29. */
const inverseT = x => mod(14 * (x - 24));

const wordLocalPosition = Array(original.length).fill(0);
for (const word of words) {
  for (let j = 0; j < word.glyphs.length; j++) {
    wordLocalPosition[word.start + j] = j;
  }
}

/**
 * Given an original ciphertext page and a candidate native-GP plaintext
 * fragment, grant every arbitrary fixed 29-way secret substitution codebook,
 * all six starting six-block phases, and two fixed clocks.
 * Lower bound on edits after removing the original T-rotor. Even a
 * noninjective hidden alphabet is allowed.
 *
 * @param {number[]} ciphertext
 * @param {number[]} candidate
 * @param {number} originalStart Absolute book-rune origin
 */
function bestStaticLookup(ciphertext, candidate, originalStart) {
  assert.equal(ciphertext.length, candidate.length);
  let best = {mismatches: ciphertext.length, clock: '', phase: -1};
  for (const clock of ['global', 'word']) {
    for (let phase = 0; phase < 6; phase++) {
      const rows = Array.from({length: 29}, () => Array(29).fill(0));
      for (let i = 0; i < ciphertext.length; i++) {
        let state = ciphertext[i];
        let steps = Math.floor(((clock === 'global' ? i :
          wordLocalPosition[originalStart + i]) + phase) / 6);
        while (steps-- > 0) state = inverseT(state);
        rows[candidate[i]][state]++;
      }
      const mismatches = rows.reduce(
        (sum, row) => sum + row.reduce((a, b) => a + b, 0) - Math.max(...row),
        0);
      if (mismatches < best.mismatches) {
        best = {mismatches, clock, phase};
      }
    }
  }
  return best;
}

const scopes = [
  {name: 'p0', from: 0, to: 1},
  {name: 'p0-p2', from: 0, to: 3},
  {name: 'p3-p7', from: 3, to: 8},
  {name: 'p15-p22', from: 15, to: 23},
  {name: 'p27', from: 27, to: 28},
  {name: 'p29', from: 29, to: 30},
  {name: 'p40-p53', from: 40, to: 54},
];
const masks = scopes.map(s => ({...s, ...originalMask(s.from, s.to)}));
assert.deepEqual(masks.slice(0, 3).map(m => [m.len, m.sites.length, m.hits]),
  [[262, 26, 4], [729, 79, 6], [1145, 106, 6]]);
const complete = originalMask(0, 56);
assert.equal(complete.hits, 80);
assert.equal(complete.sites.length, 1290);

/**
 * Fully invertible author-readable six-position rotor plant, with secret
 * permutation sigma(P)=7P+3 and source *printed-word* clock.
 * When j>=6 within a word, C[j]=T(C[j-6]) iff P[j]=P[j-6].
 * @param {number[]} plaintext
 * @returns {number[]}
 */
function plantRotor(plaintext) {
  assert.equal(plaintext.length, original.length);
  const cipher = plaintext.slice();
  for (const word of words) {
    for (let j = 0; j < word.glyphs.length; j++) {
      const index = word.start + j;
      let value = mod(7 * plaintext[index] + 3);
      for (let k = 0; k < Math.floor(j / 6); k++) value = T(value);
      cipher[index] = value;
    }
  }
  return cipher;
}

function main() {
  let totalNative = 0;
  const sources = [];
  let firstSource = null;
  const shortCandidateRejects = [];
  for (const sourcePath of sourcePaths) {
    const native = encodeNative(read(sourcePath));
    totalNative += native.length;
    if (!firstSource) firstSource = native;
    const outcomes = {};
    for (const [direction, seq] of [
      ['forward', native],
      ['reverse', native.slice().reverse()]
    ]) {
      for (const mask of masks) {
        const found = matchSource(seq, mask);
        outcomes[mask.name + '/' + direction] = found;
        if (mask.name === 'p0') {
          assert.equal(found.hits, found.examples.length);
          for (const at of found.examples) {
            shortCandidateRejects.push({source: sourcePath, direction,
              at, ...bestStaticLookup(original.slice(0, mask.len),
                seq.slice(at, at + mask.len), 0)});
          }
        }
      }
    }
    sources.push({name: sourcePath, nativeLength: native.length, outcomes});
  }

  // A legitimate source-quotation passage is recovered under a secret
  // 29-symbol relabeling that the retrieval algorithm never observes.
  const nativeOffset = 12345;
  const plaintext = Array.from({length: original.length}, (_, i) =>
    firstSource[(nativeOffset + i) % firstSource.length]);
  const planted = plantRotor(plaintext);
  const plantedMask = originalMask(0, 3, planted);
  const recovered = matchSource(firstSource, plantedMask);
  assert(recovered.examples.includes(nativeOffset));
  assert(plantedMask.sites.every(site => site.yes === (
    plaintext[site.at] === plaintext[site.at - 6])));
  assert.equal(recovered.hits >= 1, true);
  assert.equal(bestStaticLookup(planted.slice(0, 729),
    plaintext.slice(0, 729), 0).mismatches, 0);
  assert.equal(shortCandidateRejects.length, 3);
  assert.deepEqual(shortCandidateRejects.map(c => c.mismatches),
    [209, 211, 213]);

  const long = masks.filter(m => m.len >= 700);
  const totalLongHits = sources.reduce((sum, source) =>
    sum + long.reduce((n, mask) => n +
      source.outcomes[mask.name + '/forward'].hits +
      source.outcomes[mask.name + '/reverse'].hits, 0), 0);
  console.log(JSON.stringify({
    question: 'exact original six-back equality mask: literal native-GP source passage?',
    original: {runes: original.length, words: words.length,
      sourceFullbookPairs: complete.sites.length,
      sourceFullbookHits: complete.hits},
    scopes: masks.map(m => ({name: m.name, runes: m.len, pairs: m.sites.length, events: m.hits})),
    textSources: sourcePaths.length,
    nativeRunes: totalNative,
    directionsPerSource: 2,
    longWindowMatchingOffsets: totalLongHits,
    originalP0MaskMatches: shortCandidateRejects,
    plant: {sourceOffset: nativeOffset, recoveredExactly: true,
      plantedPairs: plantedMask.sites.length,
      plantedEvents: plantedMask.hits},
    sources
  }, null, 2));
}

if (require.main === module) main();

module.exports = {encodeNative, originalMask, matchSource,
  plantRotor, bestStaticLookup};
