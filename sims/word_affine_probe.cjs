/**
 * Search for word-to-next-word affine state transfer in LP2 rune indices.
 * The permutation null preserves canonical words grouped by first-rune page.
 * Run using Node.js 20+ from the repository root.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const markup = fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const pageTexts = markup.split('%');
const alphabet = new Map(corpus.runes.map((r, i) => [r, i]));

const offsetSet = [0, 1, -2, -1];
const modes = [];
for (const left of offsetSet) {
  for (const right of offsetSet) {
    if (left === -1 && right === 0) continue;
    modes.push({ left, right });
  }
}

for (const page of corpus.pages) {
  if (page.status !== 'unsolved') continue;
  const text = pageTexts[page.page > 50 ? page.page - 1 : page.page];
  const indices = Array.from(text).filter(c => alphabet.has(c)).map(c => alphabet.get(c));
  assert.deepEqual(indices, page.indices, 'Rune mismatch on page ' + page.page);
}

// Preserve the 32 whole rune-words spanning physical page boundaries.
// For page-local tests, assign each crossing word to its first-rune page.
// The nonlinear scanner imports this exact same canonical grouping.
const { parseSharedCorpus } = require('./lp2_word_pages.cjs');
const parsed = parseSharedCorpus();
assert.equal(parsed.words.length, 2896, 'Page fragments are not words');
assert.equal(parsed.crossPageWords, 32);
assert.equal(parsed.runeCount, 12956);
const wordPages = parsed.byStartPage.map(words =>
  words.map(word => Array.from(word.runes, rune => alphabet.get(rune))));
assert.equal(wordPages.length, 55);
assert.equal(wordPages.reduce((n, words) => n + words.length, 0), 2896);
assert.equal(wordPages.reduce((s, ws) => s + ws.reduce((n, w) => n + w.length, 0), 0), 12956);

const maps = [];
for (let a = 1; a < 29; a++) {
  for (let b = 0; b < 29; b++) {
    const positions = [];
    for (let x = 0; x < 29; x++) positions.push(29 * x + (a * x + b) % 29);
    maps.push({ a, b, positions });
  }
}

function value(word, offset) {
  return offset >= 0 ? word[offset] : word[word.length + offset];
}

/** @returns {{maxZ:number, best:object}} */
function scan(pages) {
  let best = { z: -Infinity };
  for (const { left, right } of modes) {
    const freq = new Uint32Array(841);
    let n = 0;
    for (const words of pages) {
      for (let i = 1; i < words.length; i++) {
        const x = value(words[i - 1], left);
        const y = value(words[i], right);
        if (x === undefined || y === undefined) continue;
        freq[29 * x + y]++;
        n++;
      }
    }
    const expectation = n / 29;
    const sd = Math.sqrt(expectation * 28 / 29);
    for (const { a, b, positions } of maps) {
      let hits = 0;
      for (let i = 0; i < 29; i++) hits += freq[positions[i]];
      const z = (hits - expectation) / sd;
      if (z > best.z) best = { z, a, b, left, right, hits, n };
    }
  }
  return { maxZ: best.z, best };
}

// Deterministic PRNG, independent from input data.
function makeRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(pages, rand) {
  return pages.map(words => {
    const output = words.slice();
    for (let i = output.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [output[i], output[j]] = [output[j], output[i]];
    }
    return output;
  });
}

function plant(pages, rand, rate) {
  const out = pages.map(ws => ws.map(w => w.slice()));
  for (const ws of out) {
    for (let i = 1; i < ws.length; i++) {
      if (ws[i - 1].length < 2 || ws[i].length < 2 || rand() >= rate) continue;
      ws[i][ws[i].length - 2] = (9 * ws[i - 1][ws[i - 1].length - 2] + 4) % 29;
    }
  }
  return out;
}

function study(replicates = 500, controls = 50, seed = 3301) {
  const rand = makeRandom(seed);
  const observed = scan(wordPages);
  const maxima = [];
  for (let i = 0; i < replicates; i++) maxima.push(scan(shuffle(wordPages, rand)).maxZ);
  maxima.sort((a, b) => a - b);
  const p = (1 + maxima.filter(z => z >= observed.maxZ).length) / (replicates + 1);
  const bar95 = maxima[Math.ceil(0.95 * replicates) - 1];
  const bar99 = maxima[Math.ceil(0.99 * replicates) - 1];
  let controlHits = 0;
  for (let i = 0; i < controls; i++) {
    const test = scan(plant(shuffle(wordPages, rand), rand, 0.03));
    if (test.maxZ > bar99) controlHits++;
  }
  return {
    hypothesis: 'next-word affine map y = a*x+b modulo 29 for 15 position pairs',
    wordPages: wordPages.length,
    words: wordPages.reduce((n, p) => n + p.length, 0),
    unsolvedRunes: 12956,
    seed,
    replicates,
    observed: observed.best,
    familywiseP: p,
    null95: bar95,
    null99: bar99,
    controlPlant: '3% forced penultimate-to-penultimate mapping a=9,b=4',
    controlRecoveries: controlHits,
    controlTrials: controls,
    caveat: 'Canonical 2896 words, including 32 page-crossing words assigned by first-rune page; this page grouping is a modeling choice. Null preserves words but not cross-word anti-doublet suppression; immediate boundary mode excluded.'
  };
}

if (require.main === module) {
  const result = study();
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
}

module.exports = { study, scan, plant, shuffle, wordPages, modes, makeRandom };
