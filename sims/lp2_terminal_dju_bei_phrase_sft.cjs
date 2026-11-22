'use strict';

/**
 * Single-file source-native test: the unique repeated LP2 two-word phrase
 * at the physical p55 terminus and its earlier p27 occurrence.
 *
 * Run from repository root with Node.js 22:
 *   node sims/lp2_terminal_dju_bei_phrase_sft.cjs
 *
 * No network, random keys, ciphertext changes, or source resegmentation.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');

const raw = fs.readFileSync('resources/lp2-transcription.txt', 'utf8');
const pageParts = raw.split('%');
assert.equal(pageParts.length, 57, '55 rune-bearing unknown pages plus p56/p57');
const source = pageParts.slice(0, 55).join('%');
const runeOrder = [...'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'];
const runeSet = new Set(runeOrder);
const translit = ['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'];
const lengths = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];
const boundaries = [0];
for (const n of lengths) boundaries.push(boundaries.at(-1) + n);

const words = [];
let pending = '';
let runeOffset = 0;
let start = 0;
function finishWord() {
  if (pending) {
    words.push({ text: pending, length: pending.length, start, end: runeOffset });
    pending = '';
  }
}
for (const ch of source) {
  if (runeSet.has(ch)) {
    if (!pending) start = runeOffset;
    pending += ch;
    runeOffset++;
  } else if ('-.&'.includes(ch)) {
    finishWord();
  } else {
    assert.ok('%/\r\n $§0123456789'.includes(ch), 'Unexpected nonrune source character: ' + ch);
  }
}
finishWord();
assert.equal(runeOffset, 12956);
assert.equal(words.length, 2896);
assert.equal(boundaries.at(-1), runeOffset);

const chapterWords = Array.from({ length: 9 }, () => []);
const ids = new Map();
for (let i = 0; i < words.length; i++) {
  const w = words[i];
  const chapter = boundaries.findIndex((b, c) =>
    c < 9 && b <= w.start && w.start < boundaries[c + 1]);
  assert.ok(chapter >= 0);
  assert.ok(w.end <= boundaries[chapter + 1], 'Unexpected word straddles a visual chapter');
  w.chapter = chapter;
  if (!ids.has(w.text)) ids.set(w.text, ids.size);
  w.id = ids.get(w.text);
  chapterWords[chapter].push(i);
}
assert.deepEqual(chapterWords.map(x => x.length),
  [158, 255, 383, 437, 224, 326, 378, 669, 66]);
assert.equal(ids.size, 2731);

const sourceIds = words.map(w => w.id);
const phraseKey = (a, b) => 4096 * a + b;
function repeatedPairs(input) {
  const seen = new Map();
  const duplicates = [];
  for (let i = 0; i < input.length - 1; i++) {
    if (words[i].chapter !== words[i + 1].chapter) continue;
    const key = phraseKey(input[i], input[i + 1]);
    if (seen.has(key)) duplicates.push([seen.get(key), i]);
    else seen.set(key, i);
  }
  return duplicates;
}
const originals = repeatedPairs(sourceIds);
assert.deepEqual(originals, [[1462, 2894]],
  'Only one duplicated adjacent word pair on all unknown pages');
assert.equal(words[1462].start, 6555);
assert.equal(words[2894].start, 12950);
assert.equal(words[2895].end, 12956);
assert.equal(words[1462].text, words[2894].text);
assert.equal(words[1463].text, words[2895].text);
const phrase = [words[2894].text, words[2895].text]
  .map(w => [...w].map(r => translit[runeOrder.indexOf(r)]).join('')).join('-');
assert.equal(phrase, 'DJU-BEI');
assert.equal(words[1462].chapter, 5);
assert.equal(words[2894].chapter, 8);

// The final chapter has exactly one length-3/length-3 pair, at its terminus.
// Of its fourteen length-3 tokens, only DJU and BEI appear outside the chapter.
// They both also occur once in chapter six, whose 83 length-3 positions include
// 25 adjacent length-3/length-3 position pairs. The exact conditional
// terminal-echo probability is (2/(14*13)) * (25/(83*82)).
const lastThree = chapterWords[8].filter(i => words[i].length === 3);
const sixthThree = chapterWords[5].filter(i => words[i].length === 3);
const adjacentSixthThree = chapterWords[5].slice(0, -1).filter(i =>
  words[i].length === 3 && words[i + 1].length === 3).length;
const adjacentFinalThree = chapterWords[8].slice(0, -1).filter(i =>
  words[i].length === 3 && words[i + 1].length === 3).length;
const lastThreeSeenOutside = lastThree.filter(i =>
  words.some((w, j) => j !== i && w.text === words[i].text));
assert.equal(lastThree.length, 14);
assert.equal(sixthThree.length, 83);
assert.equal(adjacentSixthThree, 25);
assert.equal(adjacentFinalThree, 1);
assert.deepEqual(lastThreeSeenOutside, [2894, 2895]);
const exactTerminalChance = (2 / (lastThree.length * (lastThree.length - 1))) *
  (adjacentSixthThree / (sixthThree.length * (sixthThree.length - 1)));
assert.ok(Math.abs(exactTerminalChance - 25 / 619346) < 1e-15);

// Stronger familywise scan: shuffle entire word identities only within their
// original chapter AND exact word-length stratum; keep source length ordering.
// This null preserves the full 2,896-word multiset, 32 carried page words,
// nine chapter boundaries, word lengths, and the rune content of every word.
const strata = new Map();
for (let i = 0; i < words.length; i++) {
  const key = `${words[i].chapter}:${words[i].length}`;
  if (!strata.has(key)) strata.set(key, []);
  strata.get(key).push(i);
}
let seed = 0x33011717;
function rand32() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
const iterations = 20000;
let anyRepeatedPair = 0;
let terminalRepeatedPair = 0;
let multipleRepeatedPairs = 0;
for (let trial = 0; trial < iterations; trial++) {
  const trialIds = sourceIds.slice();
  for (const positions of strata.values()) {
    for (let j = positions.length - 1; j > 0; j--) {
      const k = rand32() % (j + 1);
      const a = positions[j], b = positions[k];
      const temp = trialIds[a];
      trialIds[a] = trialIds[b];
      trialIds[b] = temp;
    }
  }
  const duplicated = repeatedPairs(trialIds);
  if (duplicated.length) anyRepeatedPair++;
  if (duplicated.length > 1) multipleRepeatedPairs++;
  if (duplicated.some(pair => pair[1] === words.length - 2)) terminalRepeatedPair++;
}
assert.equal(anyRepeatedPair, 254, 'Frozen matched-null familywise count');
assert.equal(multipleRepeatedPairs, 3, 'Frozen multi-duplicate null count');
assert.equal(terminalRepeatedPair, 0, 'Frozen sampled terminal null count');
console.log(JSON.stringify({
  result: 'PASS', originalRunes: runeOffset, words: words.length,
  uniqueWordTypes: ids.size, originalRepeatedPairCount: originals.length,
  sourcePhrase: phrase,
  sourceOccurrences: originals[0],
  globalRuneOffsets: [words[1462].start, words[2894].start],
  exactConditionalTerminalChance: exactTerminalChance,
  null: { seed: '0x33011717', trials: iterations,
    anyRepeatedPair, multipleRepeatedPairs, terminalRepeatedPair,
    familywisePlusOneRate: (anyRepeatedPair + 1) / (iterations + 1) }
}, null, 2));
