'use strict';

/**
 * LP2 source-original page-local word-ordinal many-time-pad attack.
 * Node.js 22 CommonJS, read only, deterministic, Windows 11 compatible.
 * The 2016 signed text mentions words and numbers, but DOES NOT select
 * this exact reuse clock or any of the following pad models.
 *
 * M1  C[p,w,k] = (P[p,w,k] + K[w]) mod 29
 * M2  C[p,w,k] = (P[p,w,k] + K[w,k]) mod 29
 * M3  C[p,w,k] = (P[p,w,k] + K[w,k] + S[p]) mod 29
 *
 * M1 and M2 recover arbitrary shared secret shifts from training pages and
 * score disjoint held-out original pages. M3 removes arbitrary page salts
 * algebraically by pairwise subtraction and maximizes EACH pair's offset
 * separately, deliberately giving the model an advantage. Every benchmark
 * also runs exact original-shaped forward plants.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const sourceDir = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(sourceDir, 'lp2-corpus.json'), 'utf8'));
const transcription = fs.readFileSync(path.join(sourceDir, 'lp2-transcription.txt'), 'utf8');
const reference = fs.readFileSync(path.join(sourceDir, 'lp1-plaintext-reference.txt'), 'utf8');
const alphabet = new Map(corpus.runes.map((s, i) => [s, i]));
const tokens = corpus.translit.map((s, i) => [s, i]).sort((a, b) => b[0].length - a[0].length);

/**
 * @param {string} text
 * @returns {number[]}
 */
function encodeGP(text) {
  const values = [];
  let remaining = text;
  while (remaining.length) {
    const match = tokens.find(([token]) => remaining.startsWith(token));
    if (!match) return [];
    values.push(match[1]);
    remaining = remaining.slice(match[0].length);
  }
  return values;
}

const nativeWords = new Map();
const nativeFreq = Array(29).fill(0.5);
let nativeRuneCount = 0;
for (const line of reference.split(/\r?\n/)) {
  if (line.startsWith('#') || line.startsWith('[')) continue;
  for (const raw of line.toUpperCase().match(/[A-Z]+/g) || []) {
    const native = encodeGP(raw);
    if (native.length === 0) continue;
    if (!nativeWords.has(native.length)) nativeWords.set(native.length, []);
    nativeWords.get(native.length).push(native);
    for (const symbol of native) nativeFreq[symbol]++;
    nativeRuneCount += native.length;
  }
}
const nativeTotal = nativeFreq.reduce((a, b) => a + b, 0);
const logFreq = nativeFreq.map((n) => Math.log(n / nativeTotal));
const refFreq = nativeFreq.map((n) => n / nativeTotal);
const logDiff = Array.from({ length: 29 }, (_, difference) => {
  let value = 0;
  for (let i = 0; i < 29; i++) value += refFreq[i] * refFreq[(i - difference + 29) % 29];
  return Math.log(value);
});

/** @typedef {{page:number, word:number, offset:number, cipher:number}} Symbol */

const symbols = [];
const pageWords = [];
const segments = transcription.split('%');
for (let segment = 0; segment < segments.length; segment++) {
  // The source transcript omits its rune-free physical p50 segment.
  const physicalPage = segment < 50 ? segment : segment + 1;
  if (physicalPage > 55) break;
  const words = [[]];
  let word = 0;
  let n = 0;
  for (const rune of Array.from(segments[segment])) {
    if (rune === '-' || rune === '.') {
      word++;
      words.push([]);
      continue;
    }
    if (!alphabet.has(rune)) continue;
    const cipher = alphabet.get(rune);
    assert.equal(cipher, corpus.pages[physicalPage].indices[n], 'canonical source rune mismatch');
    const offset = words[word].length;
    words[word].push(cipher);
    symbols.push({ page: physicalPage, word, offset, cipher });
    n++;
  }
  assert.equal(n, corpus.pages[physicalPage].indices.length, 'canonical page rune count mismatch');
  pageWords.push(words);
}
assert.equal(pageWords.length, 55);
assert.equal(symbols.length, 12956);
assert.equal(symbols.filter((s) => s.page === 55).length, 76);
const pageFragmentCount = pageWords.reduce((sum, ws) => sum + ws.filter((w) => w.length > 0).length, 0);
assert.equal(pageFragmentCount, 2928);
assert.equal(nativeRuneCount, 2979);
for (const words of pageWords) for (const word of words) {
  if (word.length > 0) assert.ok(nativeWords.has(word.length), 'missing native same-length donor');
}

/** @param {number} seed */
function randomGenerator(seed) {
  let state = seed >>> 0;
  return function next(n) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) % n;
  };
}
const next = randomGenerator(0x28c13301);
const wordKey = Array.from({ length: 100 }, () => next(29));
const cellKey = new Map();
const salt = Array.from({ length: 56 }, () => next(29));
const wordSource = new Map();
for (const words of pageWords) {
  // page index is handled by source order; use distinct array identities.
  for (const w of words) {
    if (w.length === 0) continue;
    const donor = nativeWords.get(w.length);
    wordSource.set(w, donor[next(donor.length)]);
  }
}
const first = symbols.map((s) => ({ ...s }));
const plantedWord = [];
const plantedCell = [];
const plantedSalt = [];
const independentNull = [];
let position = 0;
for (let p = 0; p < 56; p++) {
  if (p === 50) continue;
  const ws = pageWords[position++];
  for (let w = 0; w < ws.length; w++) {
    const word = ws[w];
    if (!word.length) continue;
    const plain = wordSource.get(word);
    for (let k = 0; k < word.length; k++) {
      const cell = w + ':' + k;
      if (!cellKey.has(cell)) cellKey.set(cell, next(29));
      const shape = { page: p, word: w, offset: k };
      const base = plain[k];
      plantedWord.push({ ...shape, cipher: (base + wordKey[w]) % 29 });
      plantedCell.push({ ...shape, cipher: (base + cellKey.get(cell)) % 29 });
      plantedSalt.push({ ...shape, cipher: (base + cellKey.get(cell) + salt[p]) % 29 });
      independentNull.push({ ...shape, cipher: (base + next(29) + salt[p]) % 29 });
    }
  }
}
assert.equal(plantedWord.length, symbols.length);
assert.equal(plantedCell.length, symbols.length);
assert.equal(plantedSalt.length, symbols.length);
assert.deepEqual(plantedWord.map((s) => [s.page, s.word, s.offset]),
  symbols.map((s) => [s.page, s.word, s.offset]));
// Exact inverse of every planted cipher, without using language scores.
for (let i = 0; i < symbols.length; i++) {
  const w = plantedCell[i].word;
  const k = plantedCell[i].offset;
  const key = cellKey.get(w + ':' + k);
  assert.equal((plantedWord[i].cipher - wordKey[w] + 29) % 29,
    (plantedCell[i].cipher - key + 29) % 29);
  assert.equal((plantedSalt[i].cipher - salt[plantedSalt[i].page] - key + 58) % 29,
    (plantedCell[i].cipher - key + 29) % 29);
}

/**
 * Train a full arbitrary shared GP29 shift on 4/5 of pages, score 1/5
 * entirely withheld original pages; repeat all five folds.
 * @param {Symbol[]} data
 * @param {(s:Symbol)=>string|number} keyOf
 */
function heldout(data, keyOf) {
  let logP = 0;
  let logC = 0;
  let count = 0;
  let modelCount = 0;
  for (let fold = 0; fold < 5; fold++) {
    const rows = new Map();
    for (const s of data) if (s.page % 5 !== fold) {
      const state = keyOf(s);
      if (!rows.has(state)) rows.set(state, Array(29).fill(0));
      rows.get(state)[s.cipher]++;
    }
    const chosen = new Map();
    for (const [state, counts] of rows) {
      let best = -Infinity;
      let shift = 0;
      for (let k = 0; k < 29; k++) {
        let ll = 0;
        for (let c = 0; c < 29; c++) ll += counts[c] * logFreq[(c - k + 29) % 29];
        if (ll > best) { best = ll; shift = k; }
      }
      chosen.set(state, shift);
    }
    modelCount += chosen.size;
    for (const s of data) if (s.page % 5 === fold) {
      const shift = chosen.get(keyOf(s));
      if (shift === undefined) continue;
      logP += logFreq[(s.cipher - shift + 29) % 29];
      logC += logFreq[s.cipher];
      count++;
    }
  }
  return {
    heldout: count,
    keysPerFold: modelCount / 5,
    decodedMean: logP / count,
    cipherMean: logC / count,
    gain: (logP - logC) / count
  };
}
const byWord = (s) => s.word;
const byCell = (s) => s.word + ':' + s.offset;
const aOriginal = heldout(first, byWord);
const aPositive = heldout(plantedWord, byWord);
const bOriginal = heldout(first, byCell);
const bPositive = heldout(plantedCell, byCell);

/**
 * Pairwise secret-salt elimination: K[w,k] cancels exactly.
 * Give EACH page pair its independently optimal unknown delta salt.
 * @param {Symbol[]} data
 */
function pairwise(data) {
  const pages = new Map();
  for (const s of data) {
    if (!pages.has(s.page)) pages.set(s.page, new Map());
    pages.get(s.page).set(s.word + ':' + s.offset, s.cipher);
  }
  const list = [...pages.values()];
  let ll = 0;
  let aligned = 0;
  let pairs = 0;
  for (let p = 0; p < list.length; p++) for (let q = p + 1; q < list.length; q++) {
    const counts = Array(29).fill(0);
    const a = list[p], b = list[q];
    for (const [cell, va] of a) {
      const vb = b.get(cell);
      if (vb === undefined) continue;
      counts[(va - vb + 29) % 29]++;
    }
    const n = counts.reduce((x, y) => x + y, 0);
    if (!n) continue;
    let best = -Infinity;
    for (let delta = 0; delta < 29; delta++) {
      let score = 0;
      for (let d = 0; d < 29; d++) score += counts[d] * logDiff[(d - delta + 29) % 29];
      if (score > best) best = score;
    }
    ll += best;
    aligned += n;
    pairs++;
  }
  return { mean: ll / aligned, aligned, pagePairs: pairs };
}
const cOriginal = pairwise(first);
const cPositive = pairwise(plantedSalt);
const cNull = pairwise(independentNull);
assert.equal(aOriginal.heldout, 12951);
assert.equal(bOriginal.heldout, 12846);
assert.equal(cOriginal.aligned, 218980);
assert.equal(cOriginal.pagePairs, 1485);
assert.ok(aPositive.gain > 1.0 && aOriginal.gain < 0.10);
assert.ok(bPositive.gain > 0.9 && bOriginal.gain < 0.10);
assert.ok(cPositive.mean > cOriginal.mean + 0.015);
assert.ok(cPositive.mean > cNull.mean + 0.015);
console.log('Source: 55 pages, 12956 source runes, ' + pageFragmentCount
  + ' physical page word fragments, ' + nativeRuneCount + ' native control runes');
console.log('M1 page-word-ordinal shared key, original ', JSON.stringify(aOriginal));
console.log('M1 same-length native-plaintext planted ', JSON.stringify(aPositive));
console.log('M2 page-word-ordinal+offset shared key, original ', JSON.stringify(bOriginal));
console.log('M2 same-length native-plaintext planted ', JSON.stringify(bPositive));
console.log('M3 arbitrary secret page salts removed, original ', JSON.stringify(cOriginal));
console.log('M3 original-shaped shared-key/native-page-salt planted ', JSON.stringify(cPositive));
console.log('M3 independent-pad/native-page-salt null ', JSON.stringify(cNull));
console.log('PASS: all original source assertions, blinded recoverability, salt-free bound and positive plants');
