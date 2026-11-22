#!/usr/bin/env node
'use strict';
/**
 * Same-illustration / same-page-clock additive GP29 pad decision for LP2 p24/p26.
 * Both pages reuse a byte-identical p24/p26 pair of mayfly images, suggesting
 * (but not establishing) a common page-initial pad. No key is fitted.
 *
 * Run: node sims/lp2_p24_p26_same_mayfly_pad_sft.cjs
 * The first 265 encrypted rune positions of physical pages p24 and p26 are
 * aligned, preserving the original word boundaries and all 29 GP rune values.
 * Every possible additive pad cancels: P24[i]-P26[i] = C24[i]-C26[i] mod29.
 * Dynamic product-trie exact search requires both plaintext streams to be
 * native-GP words in the independently fixed 32,081-word control dictionary.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} file */
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const source = read('resources/lp2-transcription.txt').split('%');
const runeIndex = new Map(gp.runes.map((rune, index) => [rune, index]));
const sourcePaths = [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt',
  'resources/control/english_wordfreq_textblob.txt'
];
/** @param {number} physical */
function pageWords(physical) {
  return (source[physical].replace(/\/\s*/g, '').match(/[\u16A0-\u16FF]+/gu) || [])
    .map(word => [...word].map(rune => runeIndex.get(rune)));
}
const wordsA = pageWords(24);
const wordsB = pageWords(26);
const cipherA = wordsA.flat(), cipherB = wordsB.flat();
assert.deepEqual(cipherA, gp.pages[24].indices);
assert.deepEqual(cipherB, gp.pages[26].indices);
assert.equal(cipherA.length, 270);
assert.equal(cipherB.length, 265);
assert.equal(wordsA.length, 64);
assert.equal(wordsB.length, 59);
const spellings = gp.translit.map((token, index) => ({token, index}))
  .sort((a, b) => b.token.length - a.token.length);
/** @param {string} word */
function spell(word) {
  const src = word.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S').replace(/ING/g, 'NG');
  const out = [];
  for (let i = 0; i < src.length;) {
    const match = spellings.find(({token}) => src.startsWith(token, i));
    if (!match) return null;
    out.push(match.index);
    i += match.token.length;
  }
  return out;
}
const dictionary = new Map();
const pools = [];
for (const file of sourcePaths) {
  const raw = read(file);
  const words = file.endsWith('english_wordfreq_textblob.txt')
    ? (raw.match(/^[a-z]+\s+\d+$/gm) || []).map(row => row.split(/\s+/)[0])
    : (raw.match(/[A-Za-z]+/g) || []);
  const local = new Map();
  for (const word of words) {
    const letters = spell(word);
    if (!letters || letters.length > 20) continue;
    if (!dictionary.has(letters.length)) dictionary.set(letters.length, new Map());
    dictionary.get(letters.length).set(letters.join(','), letters);
    if (!local.has(letters.length)) local.set(letters.length, []);
    local.get(letters.length).push(letters);
  }
  pools.push(local);
}
assert.equal([...dictionary.values()].reduce((s, m) => s + m.size, 0), 32081);
/** @param {Map<string, number[]>} words */
function trie(words) {
  const nodes = [{next: new Int32Array(29).fill(-1), terminal: false}];
  for (const letters of words.values()) {
    let state = 0;
    for (const letter of letters) {
      let child = nodes[state].next[letter];
      if (child < 0) {
        child = nodes.length;
        nodes[state].next[letter] = child;
        nodes.push({next: new Int32Array(29).fill(-1), terminal: false});
      }
      state = child;
    }
    nodes[state].terminal = true;
  }
  return nodes;
}
const tries = new Map([...dictionary.entries()].map(([length, words]) => [length, trie(words)]));
const lengthsA = wordsA.map(word => word.length);
const lengthsB = wordsB.map(word => word.length);
/** @param {number[]} lens */
function cumulative(lens) {
  let position = 0;
  return lens.map(length => (position += length));
}
const endsA = cumulative(lengthsA), endsB = cumulative(lengthsB);
/**
 * Exact all-secret-additive-pad word grammar decision.
 * @param {number[]} a Source or planted GP29 ciphertext
 * @param {number[]} b Source or planted GP29 ciphertext
 */
function compatible(a, b) {
  let states = new Map([['0,0', [0, 0]]]), wordA = 0, wordB = 0;
  const counts = [];
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    while (endsA[wordA] <= i) wordA++;
    while (endsB[wordB] <= i) wordB++;
    const tA = tries.get(lengthsA[wordA]), tB = tries.get(lengthsB[wordB]);
    assert.ok(tA && tB, 'unrepresented printed word length');
    const finishA = endsA[wordA] === i + 1, finishB = endsB[wordB] === i + 1;
    const delta = (a[i] - b[i] + 29) % 29;
    const next = new Map();
    for (const [left, right] of states.values()) {
      for (let pa = 0; pa < 29; pa++) {
        const pb = (pa - delta + 29) % 29;
        const ca = tA[left].next[pa], cb = tB[right].next[pb];
        if (ca < 0 || cb < 0) continue;
        if ((finishA && !tA[ca].terminal) || (finishB && !tB[cb].terminal)) continue;
        const la = finishA ? 0 : ca, lb = finishB ? 0 : cb;
        next.set(la + ',' + lb, [la, lb]);
      }
    }
    states = next;
    counts.push(states.size);
    if (states.size === 0) return {
      possible: false, firstImpossibleRune: i + 1,
      precedingStates: counts.at(-2)
    };
  }
  return {possible: true, finalStates: states.size};
}
const original = compatible(cipherA, cipherB);
assert.deepEqual(original, {
  possible: false, firstImpossibleRune: 32, precedingStates: 8
});
/** Reproducible 32-bit PRNG, used for the positive plant only. */
let seed = 0x3a7b3301;
/** @returns {number} */
function random() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) / 4294967296;
}
/** @param {number[]} lengths */
function plantedWords(lengths) {
  return lengths.flatMap(length => {
    const options = pools[0].get(length);
    assert.ok(options && options.length);
    return options[Math.floor(random() * options.length)];
  });
}
const plainA = plantedWords(lengthsA), plainB = plantedWords(lengthsB);
const pad = Array.from({length: 265}, () => Math.floor(random() * 29));
const cryptA = plainA.map((letter, i) => (letter + (pad[i % 265] || 0)) % 29);
const cryptB = plainB.map((letter, i) => (letter + pad[i]) % 29);
const plant = compatible(cryptA, cryptB);
assert.ok(plant.possible && plant.finalStates > 0);
for (let i = 0; i < cryptB.length; i++) {
  assert.equal((cryptA[i] - cryptB[i] + 29) % 29,
    (plainA[i] - plainB[i] + 29) % 29);
}
console.log(JSON.stringify({
  original: {page24Runes: cipherA.length, page24Words: wordsA.length,
    page26Runes: cipherB.length, page26Words: wordsB.length},
  dictionarySize: 32081, samePadDecision: original,
  positiveControl: {runicPositions: 265, allStatesSurvive: true,
    possibleFinalStates: plant.finalStates}
}, null, 2));
console.log('PASS: fixed-order same-additive-pad/native-English gate; no plaintext recovered');
