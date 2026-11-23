'use strict';

/**
 * Finite human-clue-selected source test: Odin acquired runes from a tree,
 * including nine nights (Hovamol 139), against original nine LP2 chapters.
 *
 * Frozen 1923 Bellows 165-stanza poem, one transliteration register.
 * Never cross source stanza or LP2 red-heading chapter boundaries.
 * Exact whole printed-word GP29 lengths, including carried page/line words.
 * All source copies are public-domain, pinned in resources/control.
 *
 * SFT: Node.js 22 on Windows 11; no network or file modifications.
 * A matched word-length run is a source-quotation clue only; it is not
 * cryptographic plaintext without a working original-cipher inverse.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {parseSharedCorpus, physicalLP2Page} = require('./lp2_word_pages.cjs');

const root = path.resolve(__dirname, '..');
const load = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const corpus = load('resources/liber-primus/lp2-corpus.json');
const source = load('resources/control/hovamol_bellows_1923_stanzas.json');
const original = parseSharedCorpus();
assert.equal(original.words.length, 2896);
assert.equal(original.crossPageWords, 32);
assert.equal(corpus.pages.filter(p => p.page <= 55)
  .reduce((sum, p) => sum + p.indices.length, 0), 12956);

const pairs = new Set(['TH', 'NG', 'EO', 'OE', 'AE', 'IA', 'EA']);
/** @param {string} token @returns {number} */
function gpLength(token) {
  const normalized = token.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  let n = 0;
  for (let i = 0; i < normalized.length; i++, n++) {
    if (normalized.startsWith('ING', i)) i += 2;
    else if (normalized.startsWith('IO', i) ||
      pairs.has(normalized.slice(i, i + 2))) i++;
  }
  return n;
}
/** @param {number} p @returns {number} */
function chapter(p) {
  return p < 3 ? 0 : p < 8 ? 1 : p < 15 ? 2 : p < 23 ? 3
    : p < 27 ? 4 : p < 33 ? 5 : p < 40 ? 6 : p < 54 ? 7 : 8;
}
assert.equal(source.stanzas.length, 165);
assert.equal(source.stanzas.reduce((sum, s) => sum + s.words.length, 0), 5223);
const poem = source.stanzas.map(s => ({
  stanza: s.stanza, words: s.words, lengths: s.words.map(gpLength)
}));
assert.equal(poem[138].stanza, 139);
const words = original.words.map(w => w.length);
const chapters = original.words.map(w => chapter(physicalLP2Page(w.startPage)));
assert.equal(words.reduce((sum, n) => sum + n, 0), 12956);

/** @param {number[]} seq @param {number} i @param {number} n */
const key = (seq, i, n) => seq.slice(i, i + n).join(',');
const K = 4;
const inverted = new Map();
for (const stanza of poem) {
  for (let j = 0; j + K <= stanza.lengths.length; j++) {
    const k = key(stanza.lengths, j, K);
    if (!inverted.has(k)) inverted.set(k, []);
    inverted.get(k).push({stanza, j});
  }
}
/** @param {number[]} tape @param {boolean} details */
function scan(tape, details = false) {
  let best = 0, seedMatches = 0;
  const leaders = [];
  const seen = new Set();
  for (let i = 0; i + K <= tape.length; i++) {
    const region = chapters[i];
    if (chapters[i + K - 1] !== region) continue;
    for (const {stanza, j} of inverted.get(key(tape, i, K)) || []) {
      seedMatches++;
      let left = 0, right = K;
      while (i - left > 0 && j - left > 0 &&
        chapters[i - left - 1] === region &&
        tape[i - left - 1] === stanza.lengths[j - left - 1]) left++;
      while (i + right < tape.length &&
        j + right < stanza.lengths.length &&
        chapters[i + right] === region &&
        tape[i + right] === stanza.lengths[j + right]) right++;
      const n = left + right;
      if (n > best) {
        best = n;
        leaders.length = 0;
        seen.clear();
      }
      if (details && n === best && leaders.length < 12) {
        const k = [i - left, stanza.stanza, j - left].join(':');
        if (!seen.has(k)) {
          seen.add(k);
          leaders.push({
            wordIndex: i - left,
            physicalPage: physicalLP2Page(original.words[i - left].startPage),
            stanza: stanza.stanza,
            stanzaWordStart: j - left,
            length: n,
            sourceWords: stanza.words.slice(j - left, j + right).join(' ')
          });
        }
      }
    }
  }
  return {best, seedMatches, leaders};
}

/** Exhaustive source-stanza subwindow overlap with a fixed original target. */
function longestFor(originalLengths) {
  let best = 0, match = null;
  for (const stanza of poem) {
    for (let a = 0; a < originalLengths.length; a++) {
      for (let b = 0; b < stanza.lengths.length; b++) {
        let n = 0;
        while (a + n < originalLengths.length &&
          b + n < stanza.lengths.length &&
          originalLengths[a + n] === stanza.lengths[b + n]) n++;
        if (n > best) {
          best = n;
          match = {stanza: stanza.stanza,
            targetOffset: a, words: stanza.words.slice(b, b + n).join(' ')};
        }
      }
    }
  }
  return {best, match};
}

assert.deepEqual(words.slice(2818, 2830),
  [5, 4, 4, 11, 2, 3, 2, 6, 5, 5, 2, 2],
  'original p53 51 red rune words / 13-dot stanza');
assert.deepEqual(words.slice(2880, 2896),
  [4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3],
  'original p55 16 fully page-local words');

const frozenTargets = {
  p53Red51: longestFor(words.slice(2818, 2830)),
  p55: longestFor(words.slice(2880, 2896))
};
assert.equal(frozenTargets.p53Red51.best, 4);
assert.equal(frozenTargets.p55.best, 5);

// Deliberate genuine source copying must be recognized under the same lookup.
const injected = words.slice();
const fixedStanza = poem.find(s => s.stanza === 139);
assert.equal(chapters[5], chapters[18]);
injected.splice(5, 14, ...fixedStanza.lengths.slice(0, 14));
assert.ok(scan(injected).best >= 14, '14-word Hovamol copy plant');

const real = scan(words, true);
assert.equal(real.best, 8);

let rng = 0x33011392;
function random() {
  rng ^= rng << 13;
  rng ^= rng >>> 17;
  rng ^= rng << 5;
  return (rng >>> 0) / 4294967296;
}
const chapterIds = Array.from({length: 9}, () => []);
chapters.forEach((c, i) => chapterIds[c].push(i));
const D = 300, nullBest = [], hist = {};
for (let trial = 0; trial < D; trial++) {
  const perm = words.slice();
  for (const group of chapterIds) {
    const shuffled = group.map(i => perm[i]);
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    group.forEach((index, i) => { perm[index] = shuffled[i]; });
  }
  const best = scan(perm).best;
  nullBest.push(best);
  hist[best] = (hist[best] || 0) + 1;
}
const exceed = nullBest.filter(n => n >= real.best).length;
console.log(JSON.stringify({
  original: {runes: 12956, words: 2896, chapters: 9},
  source: {work: 'Hovamol Bellows 1923', stanzas: poem.length,
    words: 5223, frozenHistoricalGitBlob: source.source.git_blob_sha},
  actual: real, targets: frozenTargets,
  positiveControl: {copiedStanza: 139, copiedWords: 14,
    recoveredMinimum: scan(injected).best},
  null: {draws: D, observedMatchOrBetter: exceed,
    addOneP: (exceed + 1) / (D + 1), histogram: hist,
    randomSeed: '0x33011392'},
  decision: 'No intact copied Hovamol stanza passage in the original source word-length tape; no candidate original LP2 plaintext or key.'
}, null, 2));
console.log('PASS: original LP2 / historical Norse rune-poem quotation gate.');
