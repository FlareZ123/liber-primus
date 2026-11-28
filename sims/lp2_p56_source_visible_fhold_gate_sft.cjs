'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const base = path.join(root, 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(base, 'lp2-corpus.json'), 'utf8'));
const source = fs.readFileSync(path.join(base, 'lp2-transcription.txt'), 'utf8').split('%')[56];
const ink = JSON.parse(fs.readFileSync(path.join(base, 'lp2-ink-annotations.json'), 'utf8'));
const page = corpus.pages.find((entry) => entry.page === 56);
const inkPage = ink.pages.find((entry) => entry.page === 56);
const runeSet = new Set(corpus.runes);
const mod29 = (value) => ((value % 29) + 29) % 29;

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const out = [];
  for (let n = 2; out.length < count; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) { prime = false; break; }
    }
    if (prime) out.push(n);
  }
  return out;
}

/** @returns {Map<number,{word:number,offset:number,length:number}>} */
function wordMetadata() {
  const words = [];
  let current = [];
  let offset = 0;
  for (const symbol of source) {
    if (runeSet.has(symbol)) current.push(offset++);
    else if ((symbol === '-' || symbol === '.') && current.length) {
      words.push(current);
      current = [];
    }
  }
  if (current.length) words.push(current);
  assert.equal(offset, 85);
  assert.equal(words.length, 25);
  const out = new Map();
  words.forEach((word, wordIndex) => word.forEach((runeOffset, i) =>
    out.set(runeOffset, { word: wordIndex, offset: i, length: word.length })));
  return out;
}

/** @returns {Map<number,{line:number,offset:number,length:number}>} */
function lineMetadata() {
  const out = new Map();
  let offset = 0;
  let line = 0;
  for (const physicalLine of source.split('/')) {
    const runes = [...physicalLine].filter((symbol) => runeSet.has(symbol));
    if (!runes.length) continue;
    runes.forEach((_, i) => out.set(offset + i, { line, offset: i, length: runes.length }));
    offset += runes.length;
    line++;
  }
  assert.equal(offset, 85);
  assert.equal(line, 5);
  return out;
}

const shifts = firstPrimes(100).map((prime) => (prime - 1) % 29);
const fPositions = page.indices.flatMap((rune, i) => rune === 0 ? [i] : []);
assert.deepEqual(fPositions, [35, 47, 51, 56, 74]);

/** @type {Array<{keyIndex:number,holds:number[],plaintext:number[]}>} */
let states = [{ keyIndex: 0, holds: [], plaintext: [] }];
for (let i = 0; i < page.indices.length; i++) {
  const cipher = page.indices[i];
  const next = [];
  for (const state of states) {
    if (cipher === 0) {
      next.push({ keyIndex: state.keyIndex, holds: [...state.holds, i],
        plaintext: [...state.plaintext, 0] });
    }
    const plain = mod29(cipher - shifts[state.keyIndex]);
    if (plain !== 0) {
      next.push({ keyIndex: state.keyIndex + 1, holds: state.holds,
        plaintext: [...state.plaintext, plain] });
    }
  }
  states = next;
}

assert.equal(states.length, 22);
const histogram = states.reduce((out, state) => {
  out[state.keyIndex] = (out[state.keyIndex] || 0) + 1;
  return out;
}, {});
assert.deepEqual(histogram, { 81: 4, 82: 8, 83: 6, 84: 3, 85: 1 });

for (const state of states) {
  const held = new Set(state.holds);
  let keyIndex = 0;
  const replay = state.plaintext.map((plain, i) => {
    if (held.has(i)) { assert.equal(plain, 0); return 0; }
    assert.notEqual(plain, 0);
    return mod29(plain + shifts[keyIndex++]);
  });
  assert.equal(keyIndex, state.keyIndex);
  assert.deepEqual(replay, page.indices);
}

const extent84 = states.filter((state) => state.keyIndex === 84);
assert.deepEqual(extent84.map((state) => state.holds), [[51], [56], [74]]);
assert.deepEqual(inkPage.red_spans, [{ start: 0, length: 5, runes: 'ᚫᛄᛟᛋᚱ' }]);
assert.deepEqual(inkPage.large_punctuation, [[5, 13, 'red'], [45, 10, 'red'], [85, 13, 'red']]);

const words = wordMetadata();
const lines = lineMetadata();
const fMetadata = fPositions.map((runeOffset, occurrence) => ({
  occurrence,
  runeOffset,
  block: runeOffset < 5 ? 'red-title' : runeOffset < 45 ? 'pre-hash-body' : 'post-hash-body',
  red: inkPage.red_spans.some((span) =>
    runeOffset >= span.start && runeOffset < span.start + span.length),
  word: words.get(runeOffset),
  line: lines.get(runeOffset),
}));

assert.deepEqual(fMetadata.map((entry) => ({
  runeOffset: entry.runeOffset, block: entry.block, red: entry.red,
  wordLength: entry.word.length, wordOffset: entry.word.offset, line: entry.line.line,
})), [
  { runeOffset: 35, block: 'pre-hash-body', red: false, wordLength: 3, wordOffset: 1, line: 1 },
  { runeOffset: 47, block: 'post-hash-body', red: false, wordLength: 2, wordOffset: 0, line: 3 },
  { runeOffset: 51, block: 'post-hash-body', red: false, wordLength: 4, wordOffset: 0, line: 3 },
  { runeOffset: 56, block: 'post-hash-body', red: false, wordLength: 2, wordOffset: 1, line: 3 },
  { runeOffset: 74, block: 'post-hash-body', red: false, wordLength: 4, wordOffset: 3, line: 4 },
]);

console.log(JSON.stringify({
  page: 56,
  sourceRunes: 85,
  ciphertextFPositions: fPositions,
  legalStrictFPaths: states.length,
  consumedPrimeExtentHistogram: histogram,
  exact84PrimePaths: extent84.map((state) => ({
    hold: state.holds[0],
    ...fMetadata.find((entry) => entry.runeOffset === state.holds[0]),
  })),
  sourceInk: { redSpans: inkPage.red_spans, largePunctuation: inkPage.large_punctuation },
  allFMetadata: fMetadata,
  decision: 'Source-visible p56 structure does not select a unique literal-F path; even exact 84-prime extent leaves holds 51, 56, or 74.',
}, null, 2));
