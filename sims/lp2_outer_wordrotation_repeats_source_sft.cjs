'use strict';

/**
 * LP2 original-word outer cyclic-rotation necessary-condition test.
 * Run on Windows Node.js 22 as one standalone test file.
 * Reads the exact source's 2,896 complete words, retaining page-carry words.
 * No decryption or inferred key is used.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const transcript = fs.readFileSync(path.join(ROOT, 'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8');
const alphabet = new Map(corpus.runes.map((r, i) => [r, i]));
const source = corpus.pages.filter(p => p.page < 56).flatMap(p => p.indices);
assert.equal(source.length, 12956);

const words = [];
let runeCount = 0;
for (const token of transcript.replace(/\/\r?\n/g, '').replace(/[\r\n%&$]/g, '').split(/[-.]+/)) {
  if (runeCount === source.length) break;
  const w = [...token].filter(glyph => alphabet.has(glyph)).map(glyph => alphabet.get(glyph));
  if (w.length) {
    words.push(w);
    runeCount += w.length;
  }
}
assert.equal(words.length, 2896);
assert.equal(runeCount, source.length);
assert.deepEqual(words.flat(), source);

const maxLength = Math.max(...words.map(w => w.length));
assert.equal(maxLength, 14);

/** @param {number} a @param {number} b @returns {number} */
function gcd(a, b) {
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}

/** @param {number} shift @returns {{ within: number, between: number, total: number }} */
function countDirect(shift) {
  let previous = null;
  let within = 0;
  let between = 0;
  for (const w of words) {
    const L = w.length;
    const r = ((shift % L) + L) % L;
    for (let i = 0; i < L; i++) {
      const glyph = w[(r + i) % L];
      if (previous === glyph) {
        if (i === 0) between++;
        else within++;
      }
      previous = glyph;
    }
  }
  return { within, between, total: within + between };
}
assert.deepEqual(countDirect(0), { within: 63, between: 23, total: 86 });
assert.equal(countDirect(12).total, 146);
assert.equal(countDirect(-2).total, 271);

// Cost-factorized all-r exhaustive theorem. Each within-word cost depends
// only on r modulo that word length. Boundary cost depends on the two lengths.
const interior = Array.from({ length: maxLength + 1 }, (_, L) => new Int32Array(L));
const edges = new Map();
for (let k = 0; k < words.length; k++) {
  const w = words[k], L = w.length;
  for (let r = 0; r < L; r++) {
    for (let i = 1; i < L; i++) {
      if (w[(r + i - 1) % L] === w[(r + i) % L]) interior[L][r]++;
    }
  }
  if (k > 0) {
    const previous = words[k - 1], M = previous.length;
    const key = M + ',' + L;
    if (!edges.has(key)) edges.set(key, { M, L, counts: new Int32Array(M * L) });
    const counts = edges.get(key).counts;
    for (let i = 0; i < M; i++) {
      const last = previous[(i + M - 1) % M];
      for (let j = 0; j < L; j++) if (last === w[j]) counts[i * L + j]++;
    }
  }
}
let period = 1;
for (let L = 1; L <= maxLength; L++) period = period / gcd(period, L) * L;
assert.equal(period, 360360);

let smallest = Infinity;
let ties = [];
let largest = -Infinity;
for (let r = 0; r < period; r++) {
  let count = 0;
  for (let L = 1; L <= maxLength; L++) count += interior[L][r % L];
  for (const { M, L, counts } of edges.values()) count += counts[(r % M) * L + r % L];
  if (r < 20 || r === 1033 || r === 3301) assert.equal(count, countDirect(r).total);
  if (count < smallest) {
    smallest = count;
    ties = [r];
  } else if (count === smallest) ties.push(r);
  if (count > largest) largest = count;
}
assert.equal(smallest, 86);
assert.equal(ties.length, 33);
assert.ok(ties.includes(0));

const decision = {
  sourceRunes: source.length, sourceWords: words.length, maxWordLength: maxLength,
  original: countDirect(0), fullRotationPeriod: period,
  minimalEqualPairs: smallest, numberOfGlobalRotationsTyingMinimum: ties.length,
  minNonzeroSmallRotation: Math.min(...Array.from({ length: 28 }, (_, i) => i < 14 ? i - 14 : i - 13)
    .filter(r => r !== 0).map(r => countDirect(r).total)),
  maximumEqualPairs: largest,
  allFixedRotationsImproveOnOriginal: false,
  keyOrPlaintextRecovered: false
};
assert.equal(decision.minNonzeroSmallRotation, 146);
console.log(JSON.stringify(decision, null, 2));
console.log('PASS: the unchanged original is a global fixed-rotation minimum; no rotation removes repeats.');
