#!/usr/bin/env node
'use strict';

// Test the printed 32x8 table of 256 two-character tokens on original LP2 pages49–51 as a cyclic GP29 key for original p55; its base60 byte conversion is unproven,
// with deterministic output-aware collision rejection. Run from repository root:
//   node sims/lp2_p50_rim_collision_skip_gate.cjs

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const read = (p) => fs.readFileSync(path.join(process.cwd(), p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const english = read('resources/control/shakespeare_first300k.txt');
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const bytes = grid.pages.flatMap((p) => p.bytes);

const N = 31;
const START = 29;
const END = 30;
const alphabet = corpus.translit;
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const tokenIndex = new Map(alphabet.map((r, i) => [r, i]));
const mod = (x) => ((x % 29) + 29) % 29;

assert.equal(bytes.length, 256);
assert.ok(bytes.every((x) => Number.isInteger(x) && x >= 0 && x <= 255));

function encodeWord(word) {
  const s = word.toUpperCase()
    .replace(/QU/g, 'CW')
    .replace(/V/g, 'U')
    .replace(/K/g, 'C')
    .replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < s.length;) {
    const digraph = s.slice(i, i + 2);
    if (tokenIndex.has(digraph)) {
      out.push(tokenIndex.get(digraph));
      i += 2;
    } else {
      if (tokenIndex.has(s[i])) out.push(tokenIndex.get(s[i]));
      i += 1;
    }
  }
  return out;
}

function trainBigram(text) {
  const counts = new Float64Array(N * N);
  const totals = new Float64Array(N);
  const unigram = new Float64Array(N);
  const words = text.slice(0, 240000).match(/[A-Za-z]+/g) || [];
  for (const word of words) {
    let previous = START;
    for (const current of [...encodeWord(word), END]) {
      counts[previous * N + current] += 1;
      totals[previous] += 1;
      unigram[current] += 1;
      previous = current;
    }
  }
  const total = unigram.reduce((a, b) => a + b, 0);
  const prior = Float64Array.from(unigram, (x) => (x + 1) / (total + N));
  const lm = new Float64Array(N * N);
  for (let previous = 0; previous < N; previous++) {
    for (let current = 0; current < N; current++) {
      lm[previous * N + current] =
        Math.log((counts[previous * N + current] + 5 * prior[current]) / (totals[previous] + 5));
    }
  }
  return lm;
}

function extractPage(pageNumber) {
  const segments = transcription.split('%');
  const raw = segments[pageNumber >= 51 ? pageNumber - 1 : pageNumber];
  const indices = [];
  const starts = [];
  const ends = [];
  let activeWord = false;
  for (const ch of raw) {
    if (runeIndex.has(ch)) {
      indices.push(runeIndex.get(ch));
      starts.push(!activeWord);
      ends.push(false);
      activeWord = true;
    } else if ('-.$&§'.includes(ch)) {
      if (ends.length) ends[ends.length - 1] = true;
      activeWord = false;
    }
  }
  const page = corpus.pages.find((p) => p.page === pageNumber);
  assert.ok(page, 'missing page ' + pageNumber);
  assert.deepEqual(indices, page.indices, 'transcription/corpus mismatch on p' + pageNumber);
  if (indices.length) ends[ends.length - 1] = true;
  return { indices, starts, ends };
}

const ringPositions = [
  ...Array.from({ length: 8 }, (_, i) => i),
  ...Array.from({ length: 31 }, (_, i) => (i + 1) * 8 + 7),
  ...Array.from({ length: 7 }, (_, i) => 31 * 8 + (6 - i)),
  ...Array.from({ length: 30 }, (_, i) => (30 - i) * 8),
];
assert.equal(ringPositions.length, 76);
assert.equal(new Set(ringPositions).size, 76);
assert.ok(ringPositions.every((i) => i >= 0 && i < 256));

const lm = trainBigram(english);
const p55 = extractPage(55);
assert.equal(p55.indices.length, 76);
p55.starts[0] = false;
p55.ends[0] = true;
assert.equal(p55.starts.filter(Boolean).length, 16);
assert.equal(p55.ends.filter(Boolean).length, 17);

function decodeRing(cipher, starts, ends, key, start, direction) {
  let cursor = start;
  let skips = 0;
  let score = 0;
  const plain = [];
  for (let i = 0; i < cipher.length; i++) {
    if (i > 0 && cipher[i] !== cipher[i - 1]) {
      let guard = 0;
      while (guard < key.length) {
        const next = (cursor + direction + key.length) % key.length;
        if (mod(key[cursor] - key[next]) !== mod(cipher[i - 1] - cipher[i])) break;
        cursor = next;
        skips += 1;
        guard += 1;
      }
      assert.ok(guard < key.length, 'collision rejection exhausted the whole ring');
    }
    const current = mod(cipher[i] - key[cursor]);
    plain.push(current);
    if (i === 0 && !starts[i]) {
      if (ends[i]) score += lm[current * N + END];
    } else {
      const previous = starts[i] ? START : plain[i - 1];
      score += lm[previous * N + current];
      if (ends[i]) score += lm[current * N + END];
    }
    cursor = (cursor + direction + key.length) % key.length;
  }
  const events = cipher.length - 1 + ends.filter(Boolean).length;
  let preview = '~' + alphabet[plain[0]] + ' | ';
  for (let i = 1; i < plain.length; i++) {
    if (starts[i]) preview += ' ';
    preview += alphabet[plain[i]];
  }
  return {
    score: score,
    scorePerRune: score / cipher.length,
    scorePerEvent: score / events,
    events: events,
    skips: skips,
    plain: plain,
    preview: preview,
  };
}

function encryptSynthetic(plain, key, start, direction) {
  let cursor = start;
  let previousCipher = null;
  let skips = 0;
  const cipher = [];
  for (const current of plain) {
    let candidate = mod(current + key[cursor]);
    let guard = 0;
    while (previousCipher !== null && candidate === previousCipher && guard < key.length) {
      cursor = (cursor + direction + key.length) % key.length;
      candidate = mod(current + key[cursor]);
      skips += 1;
      guard += 1;
    }
    assert.notEqual(candidate, previousCipher, 'synthetic key ring cannot avoid a collision');
    cipher.push(candidate);
    previousCipher = candidate;
    cursor = (cursor + direction + key.length) % key.length;
  }
  return { cipher, skips };
}

function decryptSynthetic(cipher, key, start, direction) {
  let cursor = start;
  let skips = 0;
  const plain = [];
  for (let i = 0; i < cipher.length; i++) {
    if (i > 0 && cipher[i] !== cipher[i - 1]) {
      let guard = 0;
      while (guard < key.length) {
        const next = (cursor + direction + key.length) % key.length;
        if (mod(key[cursor] - key[next]) !== mod(cipher[i - 1] - cipher[i])) break;
        cursor = next;
        skips += 1;
        guard += 1;
      }
      assert.ok(guard < key.length, 'synthetic inverse exhausted the ring');
    }
    plain.push(mod(cipher[i] - key[cursor]));
    cursor = (cursor + direction + key.length) % key.length;
  }
  return { plain, skips };
}

const candidates = [];
for (const mapping of [
  { name: 'mod29', convert: (byte) => byte % 29 },
  { name: 'scaled29', convert: (byte) => Math.floor(byte * 29 / 256) },
]) {
  const values = bytes.map(mapping.convert);
  for (const layout of ['row-major', 'column-major']) {
    const ordered = layout === 'row-major'
      ? values
      : Array.from({ length: 8 }, (_, column) =>
          Array.from({ length: 32 }, (_, row) => values[row * 8 + column])).flat();
    const key = ringPositions.map((i) => ordered[i]);
    for (const direction of [1, -1]) {
      for (let start = 0; start < 76; start++) {
        const decoded = decodeRing(p55.indices, p55.starts, p55.ends, key, start, direction);
        candidates.push({
          mapping: mapping.name,
          layout: layout,
          direction: direction,
          start: start,
          scorePerEvent: decoded.scorePerEvent,
          scorePerRune: decoded.scorePerRune,
          skips: decoded.skips,
          preview: decoded.preview,
        });
      }
    }
  }
}
candidates.sort((a, b) => b.scorePerEvent - a.scorePerEvent);
const bestWithSkips = candidates.filter((x) => x.skips > 0).sort((a, b) => b.scorePerEvent - a.scorePerEvent)[0];
const median = candidates[Math.floor(candidates.length / 2)].scorePerEvent;

const p56Words = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE'.split(' ');
let p56Score = 0;
let p56Events = 0;
let p56Runes = 0;
for (const word of p56Words) {
  let previous = START;
  for (const current of encodeWord(word)) {
    p56Score += lm[previous * N + current];
    p56Events += 1;
    p56Runes += 1;
    previous = current;
  }
  p56Score += lm[previous * N + END];
  p56Events += 1;
}

const syntheticKey = ringPositions.map((i) => bytes[i] % 29);
const syntheticStart = 13;
const syntheticPlain = [5];
const firstCipher = mod(syntheticPlain[0] + syntheticKey[syntheticStart]);
syntheticPlain.push(mod(firstCipher - syntheticKey[(syntheticStart + 1) % 76]));
for (let i = 2; i < 24; i++) syntheticPlain.push((i * 7 + 3) % 29);
const planted = encryptSynthetic(syntheticPlain, syntheticKey, syntheticStart, 1);
const recovered = decryptSynthetic(planted.cipher, syntheticKey, syntheticStart, 1);
assert.ok(planted.skips >= 1);
assert.equal(recovered.skips, planted.skips);
assert.deepEqual(recovered.plain, syntheticPlain);

const report = {
  hypothesis: 'printed 256-token table (base60 byte conversion) as cyclic additive GP29 key for p55, with deterministic output-aware collision rejection',
  sourceInputs: [
    'resources/liber-primus/lp2-grid-256.json',
    'resources/liber-primus/lp2-corpus.json',
    'resources/liber-primus/lp2-transcription.txt',
    'resources/control/shakespeare_first300k.txt',
  ],
  tableBytes: bytes.length,
  ringCells: ringPositions.length,
  p55: {
    ciphertextRunes: p55.indices.length,
    completeWords: p55.starts.filter(Boolean).length,
    carriedInitialRune: true,
    wordEnds: p55.ends.filter(Boolean).length,
  },
  candidates: candidates.length,
  best: candidates[0],
  bestWithSkips: bestWithSkips,
  medianScorePerEvent: median,
  knownP56EnglishControl: {
    plaintextRunes: p56Runes,
    scoredEvents: p56Events,
    scorePerEvent: p56Score / p56Events,
  },
  syntheticPositiveControl: {
    plaintextRunes: syntheticPlain.length,
    encoderSkips: planted.skips,
    decoderSkips: recovered.skips,
    exactRecovery: true,
  },
  conclusion: 'No candidate produces coherent plaintext. This rejects only this deterministic cyclic-ring/additive-GP29/collision-rejection consumer; it does not reject the p57-to-p50 navigation hypothesis or other source-selected rim-only operations.',
  top: candidates.slice(0, 8),
};
console.log(JSON.stringify(report, null, 2));
