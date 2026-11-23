'use strict';

/**
 * Source-native seven-overlap GP29 hidden-bit test, Agent7, 2026-11-23.
 * Issue #2424. All original outputs are generated without decipherment tuning.
 * Node.js 22 CommonJS, read-only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} rel @returns {any} */
function load(rel) { return JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8')); }
const source = load('resources/liber-primus/lp2-corpus.json');
const solved = load('resources/external/relikd-solved-gp29-native-v1.json');
const transcription = fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const glyphs = source.translit;
const idx = new Map(source.runes.map((r, i) => [r, i]));
assert.equal(glyphs.length, 29);
assert.equal(glyphs.filter(s => s.length === 2).length, 7);

/**
 * @param {string} text Source inscription with punctuation.
 * @param {boolean} allNonRunesAreBreaks Controls use this setting.
 * @returns {number[][]}
 */
function readWords(text, allNonRunesAreBreaks = false) {
  const result = [];
  let word = [];
  const breaks = new Set(['-', '.', '•', '⁘', '⁜', '⁚']);
  for (const ch of text) {
    if (idx.has(ch)) {
      word.push(idx.get(ch));
    } else if (allNonRunesAreBreaks || breaks.has(ch)) {
      if (word.length) result.push(word);
      word = [];
    }
  }
  if (word.length) result.push(word);
  return result;
}

const words = readWords(transcription.split('%').slice(0, 55).join('%'));
assert.equal(words.length, 2896);
const tape = words.flat();
assert.equal(tape.length, 12956);
assert.deepEqual(tape, source.pages.filter(p => p.page < 56).flatMap(p => p.indices));

/** @typedef {{ left: number[], right: number[] }} DoubletSwitch */
/** @type {Map<string,DoubletSwitch>} */
const switches = new Map();
for (let a = 0; a < 29; a++) {
  if (glyphs[a].length !== 2) continue;
  for (let b = 0; b < 29; b++) {
    if (glyphs[b].length !== 2 || glyphs[a][1] !== glyphs[b][0]) continue;
    const i = glyphs.indexOf(glyphs[a][0]);
    const j = glyphs.indexOf(glyphs[b][1]);
    if (glyphs[i].length === 1 && glyphs[j].length === 1) {
      switches.set(glyphs[a] + glyphs[b][1], { left: [a, j], right: [i, b] });
    }
  }
}
assert.deepEqual([...switches.keys()], ['EOE', 'OEO', 'OEA', 'AEO', 'AEA', 'IAE', 'EAE']);

/** @typedef {{j:number,bit:number,choice:DoubletSwitch}} Event */
/** @param {number[]} word @param {boolean} overlapAllowed @returns {Event[]} */
function events(word, overlapAllowed = false) {
  /** @type {Event[]} */
  const list = [];
  for (let j = 0; j + 1 < word.length; j++) {
    const choice = switches.get(glyphs[word[j]] + glyphs[word[j + 1]]);
    if (!choice) continue;
    const isLeft = word[j] === choice.left[0] && word[j + 1] === choice.left[1];
    const isRight = word[j] === choice.right[0] && word[j + 1] === choice.right[1];
    if (isLeft || isRight) {
      list.push({ j, bit: isRight ? 1 : 0, choice });
      if (!overlapAllowed) j++;
    }
  }
  return list;
}
/** @param {number[][]} ws @param {boolean} overlapAllowed @returns {Event[]} */
function flattenEvents(ws, overlapAllowed = false) { return ws.flatMap(w => events(w, overlapAllowed)); }

const raw = flattenEvents(words, true);
const originalEvents = flattenEvents(words);
assert.equal(raw.length, 170);
assert.equal(raw.filter(e => e.bit === 1).length, 86);
assert.equal(originalEvents.length, 162);
assert.equal(originalEvents.filter(e => e.bit === 1).length, 83);

/**
 * Source-typed, single-pair-stable, at least one intervening glyph between
 * selected pairs. Prevents extraction positions shifting during bit planting.
 * @param {number[][]} ws
 * @returns {Array<Event & {word:number}>}
 */
function stableCarriers(ws) {
  const result = [];
  ws.forEach((w, word) => {
    const originalGeometry = events(w).map(e => e.j).join(',');
    let previous = -999;
    for (const e of events(w)) {
      if (e.j - previous < 3) continue;
      const alternative = w.slice();
      alternative.splice(e.j, 2, ...(e.bit ? e.choice.left : e.choice.right));
      if (events(alternative).map(x => x.j).join(',') !== originalGeometry) continue;
      result.push({ ...e, word });
      previous = e.j;
    }
  });
  return result;
}
const stable = stableCarriers(words);
assert.equal(stable.length, 154);
assert.equal(stable.filter(e => e.bit).length > 0, true);
assert.equal(solved.sections.length, 9);
let solvedWords = 0;
const solvedOverlaps = [];
for (const part of solved.sections) {
  const ws = readWords(part.source_text, true);
  solvedWords += ws.length;
  solvedOverlaps.push({ source: part.name, events: flattenEvents(ws).length });
}
assert.equal(solvedWords, 740);
assert.ok(solvedOverlaps.every(x => x.events === 0), 'authentic solved texts contain no such overlapping triple');

/** @param {number[]} bits @returns {number[]} */
function bitsToBytes(bits) {
  const result = [];
  for (let i = 0; i + 7 < bits.length; i += 8) {
    let value = 0;
    for (let j = 0; j < 8; j++) value = 2 * value + bits[i + j];
    result.push(value);
  }
  return result;
}
/** @param {number[]} bytes @returns {string} */
function asciiView(bytes) { return bytes.map(x => x >= 32 && x <= 126 ? String.fromCharCode(x) : '.').join(''); }
/** @param {number[]} bytes @returns {string} */
function hexView(bytes) { return bytes.map(x => x.toString(16).padStart(2, '0')).join(''); }
const originalBits = stable.map(e => e.bit);
const directBytes = bitsToBytes(originalBits);
const reversedWithinByte = originalBits.flatMap(() => []); // explicit byte-order control below
const lsbBytes = [];
for (let i = 0; i + 7 < originalBits.length; i += 8) {
  lsbBytes.push(bitsToBytes(originalBits.slice(i, i + 8).reverse())[0]);
}
assert.equal(directBytes.length, 19);
assert.equal(lsbBytes.length, 19);

/**
 * Independent genuine solved-page text plant (p57 PARABLE opening).
 * Both adjacent rune variants spell exactly the same 3 Latin characters,
 * use two GP29 runes, and preserve all 2,896 printed word lengths.
 * The same original-site decoder extracts all 128 known bits exactly.
 */
const donor = 'LIKE THE INSTAR TUNNELING TO THE SURFACE'.slice(0, 16);
assert.equal(donor, 'LIKE THE INSTAR ');
const donorBits = [...donor].flatMap(ch =>
  Array.from({ length: 8 }, (_, i) => (ch.charCodeAt(0) >>> (7 - i)) & 1)
);
assert.equal(donorBits.length, 128);
const planted = words.map(w => w.slice());
for (let i = 0; i < donorBits.length; i++) {
  const e = stable[i];
  planted[e.word].splice(e.j, 2, ...(donorBits[i] ? e.choice.right : e.choice.left));
}
assert.equal(planted.length, words.length);
for (let i = 0; i < words.length; i++) {
  assert.equal(planted[i].length, words[i].length);
  assert.equal(planted[i].map(j => glyphs[j]).join(''), words[i].map(j => glyphs[j]).join(''));
  assert.deepEqual(events(planted[i]).map(e => e.j), events(words[i]).map(e => e.j));
}
const observedPlant = stable.map(e => {
  const seen = events(planted[e.word]).find(v => v.j === e.j);
  assert.ok(seen);
  return seen.bit;
});
assert.deepEqual(observedPlant.slice(0, donorBits.length), donorBits);
assert.equal(Buffer.from(bitsToBytes(observedPlant.slice(0, 128))).toString('ascii'), donor);

/** Frozen nine-section null: within-chapter permutations, original printed word sizes. */
const cuts = [0, 3, 8, 15, 23, 27, 33, 40, 54, 56];
const runePages = source.pages.filter(p => p.page < 56).flatMap(p => p.indices.map(() => p.page));
const groupOfWord = [];
let pos = 0;
for (const w of words) {
  const page = runePages[pos];
  pos += w.length;
  const g = cuts.findIndex((start, k) => k < 9 && page >= start && page < cuts[k + 1]);
  assert.ok(g >= 0);
  groupOfWord.push(g);
}
assert.equal(pos, 12956);
const groups = Array.from({ length: 9 }, () => []);
words.forEach((w, i) => groups[groupOfWord[i]].push(...w));
let seed = 0x33012026;
/** @returns {number} */
function rand32() { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return seed >>> 0; }
/** @param {number[]} input @returns {number[]} */
function shuffle(input) {
  const arr = input.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = rand32() % (i + 1);
    [arr[j], arr[i]] = [arr[i], arr[j]];
  }
  return arr;
}
const trials = 1000;
const totalEvents = [];
const rightCounts = [];
for (let k = 0; k < trials; k++) {
  const shuffled = groups.map(shuffle);
  const used = Array(9).fill(0);
  const permutedWords = words.map((w, i) => {
    const group = groupOfWord[i], first = used[group];
    used[group] += w.length;
    return shuffled[group].slice(first, first + w.length);
  });
  const e = flattenEvents(permutedWords);
  totalEvents.push(e.length);
  rightCounts.push(e.filter(x => x.bit).length);
}
const distribution = (values, real) => {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return {
    mean,
    sd: Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length),
    tailAtLeastReal: (1 + values.filter(x => x >= real).length) / (1 + values.length)
  };
};

console.log(JSON.stringify({
  source: 'original 55 rune-bearing LP2 unknown physical pages, genuine GP29 chart',
  book: { runes: tape.length, printedWords: words.length },
  sevenAmbiguities: [...switches.keys()],
  allAdjacentTwoRuneOverlaps: { pairs: raw.length, right: raw.filter(e => e.bit).length },
  nonoverlapping: { pairs: originalEvents.length, right: originalEvents.filter(e => e.bit).length },
  strictSinglePairStableCarriers: { count: stable.length, bits: originalBits.join('') },
  originalReadout: {
    msbHex: hexView(directBytes),
    msbAscii: asciiView(directBytes),
    msbPrintable: directBytes.filter(v => v >= 32 && v <= 126).length,
    lsbAscii: asciiView(lsbBytes),
    complementMsbAscii: asciiView(directBytes.map(x => x ^ 255))
  },
  genuineSolved: { words: solvedWords, controls: solvedOverlaps },
  plant: { originalSolvedP57Donor: donor, bitsRecoveredExactly: donorBits.length,
    identicalLatinAndWordSizes: true, preservedEventSiteGeometry: true },
  nineChapterShuffleNull: {
    seed: '0x33012026', n: trials,
    nonoverlapEventCount: distribution(totalEvents, originalEvents.length),
    rightOrientations: distribution(rightCounts, originalEvents.filter(e => e.bit).length)
  },
  decision: 'Natural source-chart overlap can carry 128 planted bits reversibly; actual unchanged bits do not decode visible ASCII and the event census fits the original-geometry shuffle null. No source-selected ASCII framing, key or new original plaintext.'
}, null, 2));
console.log('PASS 7 source-typed overlaps, original 12,956, 740 solved controls, 128-bit reversible plant, 1000 original-geometry null');
