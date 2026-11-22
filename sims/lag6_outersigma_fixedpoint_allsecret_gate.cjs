'use strict';

/**
 * GP29 all-secret fixed-symbol gate against arbitrary T powers and arbitrary
 * hidden *static* outer relabeling. Reads only canonical repository sources.
 * Run: node sims/lag6_outersigma_fixedpoint_allsecret_gate.cjs
 *
 * @module lag6_outersigma_fixedpoint_allsecret_gate
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const ROOT = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/lp2-transcription.txt');
const sourcePaths = [
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/shakespeare_first300k.txt',
  'resources/control/emerson_essays_2944.txt'
];
const runeMap = new Map(corpus.runes.map((v, i) => [v, i]));
const sortedTokens = corpus.translit.map((v, i) => [v, i])
  .sort((a, b) => b[0].length - a[0].length);

/** @param {string} text @returns {number[][]} */
function parseCipherWords(text) {
  const words = [];
  let current = [];
  for (const c of text.split('%').slice(0, 55).join('%')) {
    if (runeMap.has(c)) current.push(runeMap.get(c));
    else if (c === '%' || c === '/' || /\s/u.test(c)) { /* page or line wrap */ }
    else if (current.length) {
      words.push(current);
      current = [];
    }
  }
  if (current.length) words.push(current);
  return words;
}

/** @param {string} word @returns {number[]|null} */
function toGP(word) {
  const s = word.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S').replace(/Q/g, 'CW');
  const out = [];
  for (let i = 0; i < s.length;) {
    const token = sortedTokens.find(x => s.startsWith(x[0], i));
    if (!token) return null;
    out.push(token[1]);
    i += token[0].length;
  }
  return out;
}

/** @param {string} text @returns {number[][]} */
function parseReferenceWords(text) {
  return (text.match(/[a-z]+/ig) || []).map(toGP)
    .filter(w => w && w.length <= 14 && w.length >= 1);
}

/**
 * Four mutually exclusive position classes: singleton word, initial (length>1),
 * final (length>1), and interior. Fixed under any rune-to-rune T-power cipher.
 * @param {number} length @param {number} i
 */
function bucket(length, i) {
  if (length === 1) return 0;
  if (i === 0) return 1;
  if (i === length - 1) return 2;
  return 3;
}

/** @param {number[][]} words @param {number} symbol @returns {number[]} */
function counts(words, symbol) {
  const result = [0, 0, 0, 0];
  for (const w of words)
    for (let i = 0; i < w.length; i++)
      if (w[i] === symbol) result[bucket(w.length, i)]++;
  return result;
}
const original = parseCipherWords(transcript);
assert.equal(original.length, 2896);
assert.equal(original.flat().length, 12956);
assert.deepEqual(original.flat(), corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices));
const originalH = counts(original, 8);
assert.deepEqual(originalH, [4, 89, 91, 230]);

const lengths = new Map();
for (const w of original) lengths.set(w.length, (lengths.get(w.length) || 0) + 1);
const references = sourcePaths.map(p => parseReferenceWords(read(p)));
const half = references.map(ref => {
  const n = Math.floor(ref.length / 2);
  return [ref.slice(0, n), ref.slice(n)];
});

/**
 * Train and test on separate halves, with full-corpus fallback only for
 * length classes absent from one half (rare 14-rune words).
 * @param {number[][]} words @param {number[][]} full
 */
function poolByLength(words, full) {
  const pool = new Map();
  for (const w of words) {
    if (!pool.has(w.length)) pool.set(w.length, []);
    pool.get(w.length).push(w);
  }
  for (const n of lengths.keys())
    if (!pool.has(n)) pool.set(n, full.filter(w => w.length === n));
  return pool;
}

/**
 * @param {number[][]} source
 * @param {number[][]} full
 * @returns {Array<{symbol:number,expected:number[],variance:number[]}>}
 */
function profiles(source, full, requiredLengths = lengths) {
  const pools = poolByLength(source, full);
  const out = [];
  for (let symbol = 0; symbol < 29; symbol++) {
    const expected = [0, 0, 0, 0], variance = [0, 0, 0, 0];
    for (const [length, nWords] of requiredLengths) {
      const ws = pools.get(length);
      assert(ws && ws.length, 'missing source word length ' + length);
      const sum = [0, 0, 0, 0], square = [0, 0, 0, 0];
      for (const w of ws) {
        const h = [0, 0, 0, 0];
        for (let i = 0; i < w.length; i++)
          if (w[i] === symbol) h[bucket(length, i)]++;
        for (let i = 0; i < 4; i++) {
          sum[i] += h[i];
          square[i] += h[i] * h[i];
        }
      }
      for (let i = 0; i < 4; i++) {
        const mu = sum[i] / ws.length;
        expected[i] += nWords * mu;
        variance[i] += nWords * (square[i] / ws.length - mu * mu);
      }
    }
    out.push({symbol, expected, variance});
  }
  return out;
}
const allProfiles = half.flatMap(([training], source) =>
  profiles(training, references[source]).map(profile => ({...profile, source})));

/**
 * Minimize over all 29 possible hidden-plaintext rune identities and
 * three independent literary profiles. Variance floor 1 is deliberately
 * permissive toward source letters never seen in singleton words.
 * @param {number[]} observed
 */
function bestFit(observed) {
  let winner = {statistic: Infinity};
  for (const profile of allProfiles) {
    let statistic = 0;
    for (let i = 0; i < 4; i++)
      statistic += (observed[i] - profile.expected[i]) ** 2 /
        Math.max(1, profile.variance[i]);
    if (statistic < winner.statistic) winner = {
      statistic, plaintextSymbol: profile.symbol,
      GP: corpus.translit[profile.symbol], source: sourcePaths[profile.source],
      expected: profile.expected
    };
  }
  return winner;
}

const originalFit = bestFit(originalH);
let rngState = 0x395D2331;
/** @returns {number} */
function random() {
  rngState = (Math.imul(rngState, 1664525) + 1013904223) >>> 0;
  return rngState / 0x100000000;
}

/**
 * Draw a same-word-length manuscript from heldout source and count a
 * prospective hidden fixed symbol in four positions.
 * @param {Map<number,number[][]>} pool @param {number} symbol
 * @returns {number[]}
 */
function drawCounts(pool, symbol) {
  const out = [0, 0, 0, 0];
  for (const [length, nWords] of lengths) {
    const words = pool.get(length);
    for (let i = 0; i < nWords; i++) {
      const w = words[Math.floor(random() * words.length)];
      for (let j = 0; j < length; j++)
        if (w[j] === symbol) out[bucket(length, j)]++;
    }
  }
  return out;
}

const nullBySource = [];
for (let source = 0; source < 3; source++) {
  const pool = poolByLength(half[source][1], references[source]);
  const scores = [];
  for (let symbol = 0; symbol < 29; symbol++)
    for (let sample = 0; sample < 130; sample++) {
      const positions = drawCounts(pool, symbol);
      scores.push({symbol, total: positions.reduce((a, b) => a + b, 0),
        statistic: bestFit(positions).statistic});
    }
  // The actual ciphertext fixed point occurs exactly 414 times. The
  // wide [330,500] conditioning bracket excludes controls with entirely
  // different base frequencies, which would be irrelevant to that observation.
  // Full, unfiltered tail is reported too to prevent cherry-picking.
  const conditioned = scores.filter(x => x.total >= 330 && x.total <= 500);
  const ordered = conditioned.map(x => x.statistic).sort((a, b) => a - b);
  nullBySource.push({
    source: sourcePaths[source], samples: scores.length,
    frequencyMatched: conditioned.length,
    frequencyRange: [330, 500],
    matchedExceedances: conditioned.filter(x => x.statistic >= originalFit.statistic).length,
    unconditionedExceedances: scores.filter(x => x.statistic >= originalFit.statistic).length,
    matchedMax: ordered.at(-1), matched99th: ordered[Math.floor(0.99 * ordered.length)]
  });
}

// Independent, source-visible red-ink boundaries are a natural location for
// a static *section-specific* outer alphabet to change. Every such boundary
// also coincides with an original complete rune-word start, so no word or
// native-English control is split during this gate.
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const pageOffsets = [];
let running = 0;
for (let page = 0; page <= 55; page++) {
  pageOffsets.push(running);
  running += corpus.pages[page].indices.length;
}
assert.equal(running, 12956);
const redStarts = [0, ...ink.pages.flatMap(page => page.page <= 55 ?
  (page.red_spans || []).map(s => pageOffsets[page.page] + s.start) : [])
  .filter(x => x > 0)].sort((a, b) => a - b);
const redBreaks = [...new Set(redStarts)];
assert.equal(redBreaks.length, 16);
const originalStarts = [];
let currentWord = false, runeOffset = 0;
for (const c of transcript.split('%').slice(0, 55).join('%')) {
  if (runeMap.has(c)) {
    if (!currentWord) originalStarts.push(runeOffset);
    currentWord = true;
    runeOffset++;
  } else if (c === '%' || c === '/' || /\s/u.test(c)) { /* wrap */ }
  else currentWord = false;
}
assert.equal(runeOffset, 12956);
assert.equal(originalStarts.length, original.length);
const originalStartSet = new Set(originalStarts);
for (const start of redBreaks)
  assert(originalStartSet.has(start), 'red boundary is not a word boundary');
const redSections = redBreaks.map(() => []);
original.forEach((word, i) => {
  let sectionIndex = 0;
  for (let k = 1; k < redBreaks.length; k++) {
    if (redBreaks[k] > originalStarts[i]) break;
    sectionIndex = k;
  }
  redSections[sectionIndex].push(word);
});
assert.equal(redSections.flat().length, original.length);
const redSectionLengths = redSections.map(group => {
  const count = new Map();
  for (const word of group) count.set(word.length, (count.get(word.length) || 0) + 1);
  return count;
});
const sectionModels = redSectionLengths.map(lengthCount =>
  half.flatMap(([training], source) => profiles(training, references[source], lengthCount)
    .map(p => ({...p, source}))));
function bestSectionFit(observed, models) {
  let best = {statistic: Infinity};
  for (const m of models) {
    let statistic = 0;
    for (let i = 0; i < 4; i++)
      statistic += (observed[i] - m.expected[i]) ** 2 / Math.max(1, m.variance[i]);
    if (statistic < best.statistic)
      best = {statistic, source: m.source, symbol: m.symbol};
  }
  return best;
}
const originalSectionFits = redSections.map((words, i) =>
  bestSectionFit(counts(words, 8), sectionModels[i]));
const originalSectionScore = originalSectionFits.reduce((a, x) => a + x.statistic, 0);
let sectionRng = 0x395D2331;
function nextSectionRandom() {
  sectionRng = (Math.imul(sectionRng, 1664525) + 1013904223) >>> 0;
  return sectionRng / 0x100000000;
}
const sectionNull = [];
for (let source = 0; source < 3; source++) {
  const pool = poolByLength(half[source][1], references[source]);
  const scores = [];
  for (let trial = 0; trial < 450; trial++) {
    let score = 0;
    for (let section = 0; section < redSections.length; section++) {
      const symbol = Math.floor(nextSectionRandom() * 29);
      const observed = [0, 0, 0, 0];
      for (const [length, nWords] of redSectionLengths[section]) {
        const ws = pool.get(length);
        for (let i = 0; i < nWords; i++) {
          const word = ws[Math.floor(nextSectionRandom() * ws.length)];
          for (let j = 0; j < length; j++)
            if (word[j] === symbol) observed[bucket(length, j)]++;
        }
      }
      score += bestSectionFit(observed, sectionModels[section]).statistic;
    }
    scores.push(score);
  }
  const ordered = [...scores].sort((a, b) => a - b);
  sectionNull.push({
    source: sourcePaths[source], syntheticManuscripts: scores.length,
    median: ordered[225], p95: ordered[427], maximum: ordered.at(-1),
    exceedances: scores.filter(x => x >= originalSectionScore).length
  });
}

// IMPORTANT scope check: the observed T fixes ciphertext rune H. If an extra
// unknown *post*-rotor substitution is allowed, the output fixed point can be
// any of 29 ciphertext glyphs. Scan all 29*29 possible cipher/plain fixed
// symbols, not just the intended T index8, and apply the identical models.
// This wider family is less sharply excluded by the native-source controls.
const byCipherRune = Array.from({length: 29}, (_, rune) => counts(original, rune));
function freeOutputBestFit(histogram) {
  let best = {statistic: Infinity};
  for (let cipherRune = 0; cipherRune < 29; cipherRune++) {
    for (const m of allProfiles) {
      let statistic = 0;
      for (let i = 0; i < 4; i++)
        statistic += (histogram[cipherRune][i] - m.expected[i]) ** 2 /
          Math.max(1, m.variance[i]);
      if (statistic < best.statistic)
        best = {statistic, cipherRune, plaintextSymbol: m.symbol, source: m.source};
    }
  }
  return best;
}
const freeOutputOriginal = freeOutputBestFit(byCipherRune);
let freeOutputRng = 0x395D2331;
function freeOutputRandom() {
  freeOutputRng = (Math.imul(freeOutputRng, 1664525) + 1013904223) >>> 0;
  return freeOutputRng / 0x100000000;
}
const freeOutputNull = [];
for (let source = 0; source < 3; source++) {
  const pool = poolByLength(half[source][1], references[source]);
  const scores = [];
  for (let trial = 0; trial < 350; trial++) {
    const plaintextFixed = Math.floor(freeOutputRandom() * 29);
    const cipherFixed = Math.floor(freeOutputRandom() * 29);
    const otherOutput = [...Array(29).keys()].filter(x => x !== cipherFixed);
    const histogram = Array.from({length: 29}, () => [0, 0, 0, 0]);
    for (const [length, nWords] of lengths) {
      const words = pool.get(length);
      for (let i = 0; i < nWords; i++) {
        const word = words[Math.floor(freeOutputRandom() * words.length)];
        for (let j = 0; j < length; j++) {
          const c = word[j] === plaintextFixed ? cipherFixed :
            otherOutput[Math.floor(freeOutputRandom() * 28)];
          histogram[c][bucket(length, j)]++;
        }
      }
    }
    scores.push(freeOutputBestFit(histogram).statistic);
  }
  const ordered = [...scores].sort((a, b) => a - b);
  freeOutputNull.push({
    source: sourcePaths[source], count: scores.length,
    median: ordered[175], maximum: ordered.at(-1),
    exceedances: scores.filter(x => x >= freeOutputOriginal.statistic).length
  });
}

// Synthetic test: any secret global outer permutation can relabel the fixed
// plaintext symbol, and any per-rune rotor exponent is allowed. The four
// ciphertext buckets must equal the plaintext source symbol's buckets.
const T = x => ((24 - 2 * x) % 29 + 29) % 29;
const orbit = [0];
for (let i = 1; i < 28; i++) orbit.push(T(orbit.at(-1)));
assert.equal(new Set(orbit).size, 28);
const rank = Array(29).fill(-1);
orbit.forEach((x, i) => { rank[x] = i; });
function power(x, n) {
  if (x === 8) return 8;
  return orbit[((rank[x] + n) % 28 + 28) % 28];
}
let plantChecks = 0;
for (const symbol of [5, 8, 19, 20]) {
  const sourcePool = poolByLength(half[2][1], references[2]);
  const plaintext = Array.from({length: 14}, () => []);
  for (const [length, nWords] of lengths) {
    const words = sourcePool.get(length);
    for (let i = 0; i < nWords; i++)
      plaintext[length - 1].push(words[Math.floor(random() * words.length)]);
  }
  const words = plaintext.flat();
  const encMap = new Array(29);
  encMap[symbol] = 8;
  const ins = [...Array(29).keys()].filter(x => x !== symbol);
  const outs = [...Array(29).keys()].filter(x => x !== 8);
  ins.forEach((x, i) => { encMap[x] = outs[(i * 9) % 28]; });
  assert.equal(new Set(encMap).size, 29);
  let previous = 0, t = 0;
  const encrypted = words.map(w => w.map(p => {
    const c = power(encMap[p], 13 + 6 * t++ + previous);
    previous = c;
    return c;
  }));
  assert.deepEqual(counts(encrypted, 8), counts(words, symbol));
  assert.equal(encrypted.flat().length, 12956);
  plantChecks++;
}

console.log(JSON.stringify({
  model: 'all 29 unknown outer-label fixed points, arbitrary per-rune T powers',
  original: {words: original.length, runes: original.flat().length,
    fixedPointCipherRune: 8, GP: 'H', positions: originalH,
    occurrences: originalH.reduce((a, b) => a + b, 0), bestFit: originalFit},
  lexicalProfiles: allProfiles.length, sourceHalfSplit: true,
  nullBySource,
  sectionModel: {
    source: 'all 16 original unsolved red-span starts, 16 independent outer alphabets',
    breaks: redBreaks, sourceWordBreakAligned: true,
    sectionWordCounts: redSections.map(x => x.length),
    originalStatistic: originalSectionScore,
    sectionFits: originalSectionFits,
    null: sectionNull
  },
  arbitraryPostRotorRelabel: {
    original: freeOutputOriginal,
    outputFixedPointUnknown: true,
    control: freeOutputNull
  },
  plantChecks,
  limits: 'English-like native-GP words with canonical word boundaries; no model-independent ciphertext solution'
}, null, 2));
