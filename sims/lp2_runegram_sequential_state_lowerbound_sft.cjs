'use strict';

/**
 * SFT: lower bound on hidden state for a lossless, deterministic,
 * one-GP-rune-in / one-GP-rune-out sequential cipher.
 *
 * Run with Node.js 22 and the exact repository source files.
 * All source-native controls are contiguous literary passages,
 * without assuming the LP2 printed word boundaries are plaintext spaces.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {string} file */
const read = (file) => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const originalPages = gp.pages.filter((p) => p.page < 56 && p.indices.length > 0);
const original = originalPages.flatMap((p) => p.indices);
assert.equal(original.length, 12956);
assert.equal(originalPages.length, 55);

const nativePaths = [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt',
];
const chapterLengths = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];
assert.equal(chapterLengths.reduce((a, b) => a + b, 0), original.length);

/** @type {{start:number,end:number}[]} */
const chapters = [];
let cursor = 0;
for (const n of chapterLengths) {
  chapters.push({ start: cursor, end: cursor + n });
  cursor += n;
}
/** @type {{start:number,end:number}[]} */
const pageSpans = [];
cursor = 0;
for (const p of originalPages) {
  pageSpans.push({ start: cursor, end: cursor + p.indices.length, page: p.page });
  cursor += p.indices.length;
}

const tokens = gp.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);

/**
 * Canonical solved-source native GP spelling folds.
 * @param {string} text
 * @returns {number[]}
 */
function encode(text) {
  const result = [];
  const words = text.toUpperCase().match(/[A-Z]+/g) || [];
  for (const word of words) {
    const w = word.replace(/QU/g, 'CW').replace(/V/g, 'U')
      .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
    for (let pos = 0; pos < w.length;) {
      if (w.startsWith('ING', pos)) {
        result.push(21);
        pos += 3;
      } else if (w.startsWith('IO', pos)) {
        result.push(27);
        pos += 2;
      } else {
        const match = tokens.find((t) => w.startsWith(t.s, pos));
        assert(match, 'Unencodable GP-native source word');
        result.push(match.i);
        pos += match.s.length;
      }
    }
  }
  return result;
}

/**
 * For any deterministic sequential encoder with K hidden states, the
 * same plaintext L-gram and same starting state give exactly the same
 * ciphertext L-gram. Thus for every observed plaintext L-gram, at most
 * K distinct ciphertext L-grams can occupy its occurrence positions.
 *
 * No deciphering key, transition function, word alignment or state
 * history is fitted. Every possible state sequence is granted.
 *
 * @param {number[]} plain
 * @param {number[]} cipher
 * @param {number} start
 * @param {number} end
 * @param {number} order
 * @returns {number}
 */
function lowerBound(plain, cipher, start, end, order) {
  const byPlain = new Map();
  for (let i = start; i + order <= end; i++) {
    let p = 0;
    let c = 0;
    for (let j = 0; j < order; j++) {
      p = p * 29 + plain[i + j];
      c = c * 29 + cipher[i + j];
    }
    let values = byPlain.get(p);
    if (!values) {
      values = new Set();
      byPlain.set(p, values);
    }
    values.add(c);
  }
  let k = 0;
  for (const values of byPlain.values()) {
    k = Math.max(k, values.size);
  }
  return k;
}

/**
 * Minimum number of contiguous, independently keyed physical-page domains
 * needed merely to satisfy the K-state two-rune necessary inequality.
 * Greedily take each longest valid consecutive page prefix: D2 is monotone
 * when the segment grows, so an earlier cut cannot reduce the number of
 * remaining blocks. This is the exact optimum under this necessary condition
 * and permits any of 54 source-visible page boundary rekey events.
 *
 * @param {number[]} plain
 * @param {number[]} cipher
 * @param {{start:number,end:number,page:number}[]} spans
 * @param {number} K
 * @returns {{domains:number,cutsAfterPages:number[]}}
 */
function minimumPageKeyDomains(plain, cipher, spans, K) {
  let map = new Map();
  let maxFanout = 0;
  let domains = 0;
  const cutsAfterPages = [];
  let previousPage = -1;

  /** @param {number} start @param {number} end */
  function consume(start, end) {
    for (let i = start; i + 1 < end; i++) {
      const p = 29 * plain[i] + plain[i + 1];
      const c = 29 * cipher[i] + cipher[i + 1];
      let outputs = map.get(p);
      if (!outputs) {
        outputs = new Set();
        map.set(p, outputs);
      }
      outputs.add(c);
      maxFanout = Math.max(maxFanout, outputs.size);
    }
  }

  for (const span of spans) {
    if (domains === 0) {
      domains = 1;
      consume(span.start, span.end);
    } else {
      // Retain the previous-page to current-page bigram only when the
      // two original physical pages share one unchanged key domain.
      consume(span.start - 1, span.end);
      if (maxFanout > K) {
        cutsAfterPages.push(previousPage);
        domains++;
        map = new Map();
        maxFanout = 0;
        consume(span.start, span.end);
      }
    }
    assert(maxFanout <= K,
      'One original page already exceeds its K-state rune-gram capacity');
    previousPage = span.page;
  }
  assert.equal(cutsAfterPages.length, domains - 1);
  return { domains, cutsAfterPages };
}

/**
 * @param {number[]} values
 * @returns {{min:number,max:number,mean:number,le29:number,le58:number,le128:number}}
 */
function stats(values) {
  return {
    min: Math.min(...values),
    max: Math.max(...values),
    mean: values.reduce((a, b) => a + b, 0) / values.length,
    le29: values.filter((v) => v <= 29).length,
    le58: values.filter((v) => v <= 58).length,
    le128: values.filter((v) => v <= 128).length,
  };
}

// Source-native check: original-authored already-solved Liber Primus prose.
// Treat physical spread continuations as one authored statement, not duplicate
// editorial recap headings. Ignore numeric square lines, editorial comments,
// and the solved p56 SHA-512 hex string (non-GP linguistic payload).
const includedCicadaPages = new Set([1, 3, 5, 6, 9, 10, 11, 12, 13, 14, 15, 56, 57]);
const cicadaLines = [];
let activeCicadaPage = -1;
for (const line of read('resources/liber-primus/lp1-plaintext-reference.txt').split(/\r?\n/)) {
  const heading = line.match(/^###\s+(\d+)/);
  if (heading) {
    activeCicadaPage = Number(heading[1]);
    continue;
  }
  if (!includedCicadaPages.has(activeCicadaPage) ||
      line.startsWith('#') || line.startsWith('[') || line.startsWith('(') ||
      /^\s*$/.test(line) || /^\s*[\d\s]+$/.test(line) ||
      /^[\da-f]{60,}$/i.test(line.trim())) continue;
  cicadaLines.push(line);
}
const cicadaKnown = encode(cicadaLines.join(' '));
assert.equal(cicadaKnown.length, 2988);
const cicadaChapterIndices = [2, 3, 6]; // p8-14, p15-22, p33-39
const firstPartyResults = cicadaChapterIndices.map((chapterIndex) => {
  const span = chapters[chapterIndex];
  const chapterCipher = original.slice(span.start, span.end);
  const nativeBounds = [];
  for (let offset = 0; offset <= cicadaKnown.length - chapterCipher.length; offset++) {
    const sourceWindow = cicadaKnown.slice(offset, offset + chapterCipher.length);
    nativeBounds.push(lowerBound(sourceWindow, chapterCipher,
      0, chapterCipher.length, 2));
  }
  return {
    chapter: ['p8-p14', 'p15-p22', 'p33-p39'][cicadaChapterIndices.indexOf(chapterIndex)],
    runes: chapterCipher.length,
    contiguousKnownGpWindows: nativeBounds.length,
    ...stats(nativeBounds),
  };
});
assert.deepEqual(firstPartyResults.map((x) => x.runes), [1729, 1903, 1680]);
assert.deepEqual(firstPartyResults.map((x) => x.contiguousKnownGpWindows),
  [1260, 1086, 1309]);
assert.deepEqual(firstPartyResults.map((x) => x.min), [33, 37, 32]);
assert(firstPartyResults.every((x) => x.le29 === 0));

// Exact positive: a known deterministic 29-state reversible transducer.
// Current state + plaintext determines the output and next state.
const plantedPlain = encode(read(nativePaths[0])).slice(0, original.length);
let state = 7;
/** @type {number[]} */
const plantedCipher = [];
for (const p of plantedPlain) {
  plantedCipher.push((p + state) % 29);
  state = (state + p + 1) % 29;
}
const reconstructed = [];
state = 7;
for (const c of plantedCipher) {
  const p = (c - state + 29) % 29;
  reconstructed.push(p);
  state = (state + p + 1) % 29;
}
assert.deepEqual(reconstructed, plantedPlain);
const plantedBound = lowerBound(plantedPlain, plantedCipher,
  0, plantedPlain.length, 2);
assert(plantedBound <= 29 && plantedBound > 1);

const controls = [];
for (const nativePath of nativePaths) {
  const native = encode(read(nativePath));
  assert(native.length > original.length);
  const data = { book2: [], book3: [], book4: [], chapter2: [], page2: [], domains29: [] };
  for (let trial = 0; trial < 150; trial++) {
    // Source-independent and reproducible: 150 evenly spaced contiguous
    // GP-native windows, preserving prose order and ignoring source spaces.
    const offset = Math.floor(trial * (native.length - original.length - 1) / 149);
    const plain = native.slice(offset, offset + original.length);
    data.book2.push(lowerBound(plain, original, 0, original.length, 2));
    data.book3.push(lowerBound(plain, original, 0, original.length, 3));
    data.book4.push(lowerBound(plain, original, 0, original.length, 4));
    data.chapter2.push(Math.max(...chapters.map((s) =>
      lowerBound(plain, original, s.start, s.end, 2))));
    data.page2.push(Math.max(...pageSpans.map((s) =>
      lowerBound(plain, original, s.start, s.end, 2))));
    data.domains29.push(minimumPageKeyDomains(plain, original, pageSpans, 29).domains);
  }
  controls.push({
    source: nativePath,
    nativeRunes: native.length,
    windows: 150,
    twoRuneGlobal: stats(data.book2),
    threeRuneGlobal: stats(data.book3),
    fourRuneGlobal: stats(data.book4),
    twoRuneNineIndependentChapters: stats(data.chapter2),
    twoRune55IndependentPages: stats(data.page2),
    minimumPhysicalPageKeyDomains29: stats(data.domains29),
  });
}
assert.deepEqual(controls.map((x) => x.nativeRunes),
  [217106, 62492, 321327]);
assert.deepEqual(controls.map((x) => x.twoRuneGlobal.min),
  [176, 214, 205]);
assert.deepEqual(controls.map((x) =>
  x.twoRuneNineIndependentChapters.min), [46, 53, 52]);
assert.deepEqual(controls.map((x) =>
  x.twoRune55IndependentPages.max), [20, 25, 19]);
assert(controls.every((x) => x.twoRuneGlobal.le128 === 0));
assert(controls.every((x) => x.twoRuneNineIndependentChapters.le29 === 0));
assert(controls.every((x) => x.twoRune55IndependentPages.le29 === 150));
assert.deepEqual(controls.map((x) => x.minimumPhysicalPageKeyDomains29.min),
  [9, 11, 11]);
assert.deepEqual(controls.map((x) => x.minimumPhysicalPageKeyDomains29.max),
  [14, 20, 15]);

console.log(JSON.stringify({
  experiment: 'Original LP2 finite-state rune-gram output multiplicity',
  originalRunes: original.length,
  originalPages: originalPages.length,
  sourceWordBoundariesUsed: false,
  message: 'Conditional necessary state bounds; no decipherment or recovered key',
  reversible29StatePlant: {
    exactRecoveredRunes: reconstructed.length, stateCount: 29,
    observedTwoRuneLowerBound: plantedBound,
  },
  coherentLiteraryControls: controls,
  originalCicadaGpTextControls: {
    curatedKnownCicadaRunes: cicadaKnown.length,
    source: 'resources/liber-primus/lp1-plaintext-reference.txt',
    originalChapters: firstPartyResults,
  },
}, null, 2));
