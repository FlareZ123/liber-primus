'use strict';

/**
 * Source-selected p57 circumference / per-word 29-to-28 exception-channel gate.
 * Run from the repository root:
 *   node sims/lp2_circumference_shell_no_repeat_sft.cjs
 *
 * Tests two frozen word-local receivers. This is an exploratory negative, not
 * an assertion that the author used either operation.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8').replace(/\r\n/g, '\n');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt');
const donor = JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const runeIndex = new Map(corpus.runes.map((glyph, i) => [glyph, i]));
const chunks = transcript.split('%');
const sourcePages = corpus.pages.filter((p) => p.page <= 55 && p.indices.length);
const separators = new Set(['-', '.', '&', '$', '§']);
assert.equal(corpus.runes.length, 29);
assert.equal(sourcePages.length, 55);
assert.equal(chunks.length, 57);

function parseWords() {
  const words = [];
  let current = [];
  let memberships = [];
  const stopCounts = {};
  for (let part = 0; part < sourcePages.length; part++) {
    const page = sourcePages[part];
    let count = 0;
    for (const glyph of chunks[part]) {
      if (runeIndex.has(glyph)) {
        current.push(runeIndex.get(glyph));
        memberships.push(page.page);
        count++;
      } else if (separators.has(glyph)) {
        stopCounts[glyph] = (stopCounts[glyph] || 0) + 1;
        if (current.length) {
          words.push({ runes: current, pages: [...new Set(memberships)] });
          current = [];
          memberships = [];
        }
      }
    }
    assert.equal(count, page.indices.length, 'source page ' + page.page);
  }
  if (current.length) words.push({ runes: current, pages: [...new Set(memberships)] });
  assert.deepEqual(stopCounts, { '-': 2727, '.': 175, '&': 17, '$': 8 });
  return words;
}

function rankExcept(value, excluded) {
  assert.notEqual(value, excluded);
  return value - (value > excluded ? 1 : 0);
}
function valueExcept(rank, excluded) {
  assert(rank >= 0 && rank < 28);
  return rank + (rank >= excluded ? 1 : 0);
}

// Receiver A: preserve the order of the 28 symbols after deleting the
// previous ciphertext symbol, then map that rank into GP29 minus q.
function decodeRank(start, q, ciphertext) {
  let previous = start;
  const plain = [];
  for (const c of ciphertext) {
    plain.push(c === previous ? q : valueExcept(rankExcept(c, previous), q));
    previous = c;
  }
  return plain;
}
function encodeRank(start, q, plaintext) {
  let previous = start;
  const ciphertext = [];
  for (const p of plaintext) {
    const c = p === q ? previous : valueExcept(rankExcept(p, q), previous);
    ciphertext.push(c);
    previous = c;
  }
  return ciphertext;
}

// Receiver B: use the natural cyclic GP29 difference. Zero is the exception;
// nonzero differences 1..28 become digits 0..27 and map into GP29 minus q.
function decodeCyclic(start, q, ciphertext) {
  let previous = start;
  const plain = [];
  for (const c of ciphertext) {
    const d = (c - previous + 29) % 29;
    plain.push(d === 0 ? q : valueExcept(d - 1, q));
    previous = c;
  }
  return plain;
}
function encodeCyclic(start, q, plaintext) {
  let previous = start;
  const ciphertext = [];
  for (const p of plaintext) {
    const d = p === q ? 0 : rankExcept(p, q) + 1;
    const c = (previous + d) % 29;
    ciphertext.push(c);
    previous = c;
  }
  return ciphertext;
}

function ioc(values) {
  const counts = new Uint32Array(29);
  for (const value of values) counts[value]++;
  const n = values.length;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1));
}

const words = parseWords();
assert.equal(words.length, 2896);
assert.equal(words.flatMap((w) => w.runes).length, 12956);
// Physical p0's 13-rune red rubric is not part of the black-body cipher.
assert.deepEqual(words.slice(0, 2).map((w) => w.runes.length), [8, 5]);
assert.deepEqual(words[0].pages, [0]);
assert.deepEqual(words[1].pages, [0]);
const bodyWords = words.slice(2);
assert.equal(bodyWords.length, 2894);
const shellCount = bodyWords.reduce((n, w) => n + (w.runes.length === 1 ? 1 : 2), 0);
const interiorCount = bodyWords.reduce((n, w) => n + Math.max(0, w.runes.length - 2), 0);
assert.equal(shellCount, 5705);
assert.equal(interiorCount, 7238);

let interiorRepeats = 0;
let wordsWithInteriorRepeat = 0;
let maxInteriorRepeats = 0;
let leftBoundaryRepeats = 0;
for (const word of bodyWords) {
  const interior = word.runes.slice(1, -1);
  let repeats = 0;
  for (let i = 1; i < interior.length; i++) if (interior[i] === interior[i - 1]) repeats++;
  interiorRepeats += repeats;
  if (repeats) wordsWithInteriorRepeat++;
  maxInteriorRepeats = Math.max(maxInteriorRepeats, repeats);
  if (interior.length && interior[0] === word.runes[0]) leftBoundaryRepeats++;
}
assert.equal(interiorRepeats, 33);
assert.equal(wordsWithInteriorRepeat, 33);
assert.equal(maxInteriorRepeats, 1);
assert.equal(leftBoundaryRepeats, 11);

function runModel(name, decode, encode) {
  const segments = [];
  let exceptionSymbols = 0;
  for (const word of bodyWords) {
    const start = word.runes[0];
    const q = word.runes[word.runes.length - 1];
    const interior = word.runes.slice(1, -1);
    const plain = decode(start, q, interior);
    assert.deepEqual(encode(start, q, plain), interior, name + ' exact original replay');
    exceptionSymbols += plain.filter((p) => p === q).length;
    segments.push(plain);
  }
  assert.equal(segments.flat().length, 7238);
  assert.equal(exceptionSymbols, 44);
  return { name, segments, exceptionSymbols };
}
const rankModel = runModel('rank-preserving', decodeRank, encodeRank);
const cyclicModel = runModel('cyclic-difference', decodeCyclic, encodeCyclic);

const nativeSections = donor.sections.map((section) => ({
  name: section.name,
  values: [...section.source_text].filter((glyph) => runeIndex.has(glyph)).map((glyph) => runeIndex.get(glyph))
}));
assert.equal(nativeSections.reduce((n, s) => n + s.values.length, 0), 2979);
const controls = new Set(['0_welcome', 'jpg107-167']);
const trigramCounts = new Uint32Array(29 ** 3);
const contextCounts = new Uint32Array(29 ** 2);
for (const section of nativeSections.filter((s) => !controls.has(s.name))) {
  for (let i = 2; i < section.values.length; i++) {
    const h = section.values[i - 2] * 29 + section.values[i - 1];
    contextCounts[h]++;
    trigramCounts[h * 29 + section.values[i]]++;
  }
}
function scoreSegments(segments) {
  let total = 0;
  let n = 0;
  for (const values of segments) {
    for (let i = 2; i < values.length; i++) {
      const h = values[i - 2] * 29 + values[i - 1];
      total += Math.log((trigramCounts[h * 29 + values[i]] + 0.5) / (contextCounts[h] + 14.5));
      n++;
    }
  }
  return { n, natsPerRune: total / n };
}
function metrics(segments) {
  const flat = segments.flat();
  const flatScore = scoreSegments([flat]);
  const withinScore = scoreSegments(segments);
  return {
    n: flat.length,
    ioc: ioc(flat),
    trigramFlat: flatScore.natsPerRune,
    trigramWithinWords: withinScore.natsPerRune,
    head: flat.slice(0, 120).map((x) => corpus.translit[x]).join('')
  };
}
function selectedSegments(model, lo, hi) {
  return model.segments.filter((_, i) => bodyWords[i].pages.some((p) => p >= lo && p <= hi));
}

let randomState = 3301 >>> 0;
function randomUint32() {
  randomState ^= randomState << 13;
  randomState ^= randomState >>> 17;
  randomState ^= randomState << 5;
  return randomState >>> 0;
}
function shuffled(values) {
  const out = values.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = randomUint32() % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
function shuffleNull(segments) {
  const actual = scoreSegments(segments).natsPerRune;
  const scores = Array.from({ length: 128 }, () => scoreSegments(segments.map(shuffled)).natsPerRune);
  return {
    trials: scores.length,
    min: Math.min(...scores),
    max: Math.max(...scores),
    mean: scores.reduce((a, b) => a + b, 0) / scores.length,
    atLeastActual: scores.filter((s) => s >= actual).length
  };
}

const nativeControls = nativeSections.filter((s) => controls.has(s.name)).map((s) => ({
  name: s.name,
  ...metrics([s.values])
}));
const result = {
  source: {
    unknownWords: words.length,
    excludedRedHeadingWords: 2,
    bodyWords: bodyWords.length,
    bodyRunes: bodyWords.reduce((n, w) => n + w.runes.length, 0),
    shellRunes: shellCount,
    interiorRunes: interiorCount,
    interiorRepeats: interiorRepeats,
    wordsWithOneInteriorRepeat: wordsWithInteriorRepeat,
    leftBoundaryRepeats: leftBoundaryRepeats,
    totalDecodedExceptionSymbols: 44
  },
  nativeControls,
  rankPreserving: {
    full: metrics(rankModel.segments),
    p0_2: metrics(selectedSegments(rankModel, 0, 2)),
    p16_21: metrics(selectedSegments(rankModel, 16, 21)),
    withinWordShuffle: shuffleNull(rankModel.segments),
    exactOriginalReencryption: true
  },
  cyclicDifference: {
    full: metrics(cyclicModel.segments),
    p0_2: metrics(selectedSegments(cyclicModel, 0, 2)),
    p16_21: metrics(selectedSegments(cyclicModel, 16, 21)),
    withinWordShuffle: shuffleNull(cyclicModel.segments),
    exactOriginalReencryption: true
  }
};
assert.equal(result.rankPreserving.full.n, 7238);
assert.equal(result.cyclicDifference.full.n, 7238);
assert.equal(result.rankPreserving.p0_2.n, 409);
assert.equal(result.rankPreserving.p16_21.n, 886);
console.log(JSON.stringify(result, null, 2));
