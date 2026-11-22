'use strict';

// Reproduction of the 2014 Stage04 small runic-image Vigenere step.
// Pinned source: neuroretransmit/cicada@ade9a02889ef8acbc8cde8edbfd0a785c369f4c3
// Image blob: 03.jpg.asc.jpg, 15188 bytes, Git blob f91bdd6e2a890968a5a13d39be4d56899b877920
// Rune transcription blob: 03.jpg.asc.jpg.runes.txt, Git blob 9a4c24fc6b6b3586fb85e5bb7453ba6e718a160b
// Original implementation: gematriaprimus.py, Git blob e3d22a6e13abb3e319c65aa6e813c055ce4f048d

const assert = require('node:assert/strict');

// Exact insertion order and alternatives from the archive's RUNE_LOOKUP.
const RUNE_LOOKUP = new Map([
  ['ᛠ', ['F']], ['ᛡ', ['U']], ['ᚣ', ['TH']], ['ᚫ', ['O']], ['ᚪ', ['R']],
  ['ᛞ', ['C', 'K']], ['ᛟ', ['G']], ['ᛝ', ['W']], ['ᛚ', ['H']], ['ᛗ', ['N']],
  ['ᛖ', ['I']], ['ᛒ', ['J']], ['ᛏ', ['EO']], ['ᛋ', ['P']], ['ᛉ', ['X']],
  ['ᛈ', ['S', 'Z']], ['ᛇ', ['T']], ['ᛄ', ['B']], ['ᛁ', ['E']], ['ᚾ', ['M']],
  ['ᚻ', ['L']], ['ᚹ', ['NG', 'ING']], ['ᚷ', ['OE']], ['ᚳ', ['D']], ['ᚱ', ['A']],
  ['ᚩ', ['AE']], ['ᚦ', ['Y']], ['ᚢ', ['IO', 'IA']], ['ᚠ', ['EA']],
]);

// The archive's mode=None/Vigenere substitution reverses rune keys but retains
// the RUNE_LOOKUP value order. This is intentionally not silently normalized.
const runeKeys = [...RUNE_LOOKUP.keys()].reverse();
const runeValues = [...RUNE_LOOKUP.values()];
const lookup = new Map(runeKeys.map((rune, i) => [rune, runeValues[i]]));
const keyValues = [...lookup.values()].reverse();
const CIPHER = 'ᚦᛗᛞᛇᚠᛗᚪᚱ5ᚢᚫᛝᚱᛝ3ᛠᛗᛇᚠᛡ';
const KEY_PHRASE = 'WELCOME PILGRIM TO THE';
const EXPECTED_HOST = 'avowyfgl5lkzfj3n.onion';

// Literal reproduction of archive key_to_shifts(): doubles=true checks the
// next character for a digraph but does not consume it. This is the bug under test.
function sourceKeyToShifts(key, doubles = true) {
  const shifts = [];
  for (let i = 0; i < key.length; i++) {
    let lookupIndex = 0;
    for (const values of keyValues) {
      const before = shifts.length;
      const peek = i + 1 < key.length && doubles ? key[i + 1] : null;
      for (const token of values) {
        if (peek && key[i] + peek === token) shifts.push(lookupIndex + 1);
        else if (key[i] === token) shifts.push(lookupIndex + 1);
        else if (key[i] === ' ') shifts.push(0);
      }
      if (before < shifts.length) break;
      lookupIndex++;
    }
  }
  return shifts;
}

// Correct GP serialization: consume a recognized two-letter GP rune (here TH)
// as one key symbol. All other phrase letters remain one symbol each.
function gpRuneKeyToShifts(key) {
  const text = key.replace(/\s+/g, '').toUpperCase();
  const shifts = [];
  for (let i = 0; i < text.length;) {
    const pair = text.slice(i, i + 2);
    let pairIndex = -1;
    for (let j = 0; j < keyValues.length; j++) {
      if (keyValues[j].includes(pair)) { pairIndex = j; break; }
    }
    if (pairIndex !== -1) {
      shifts.push(pairIndex + 1);
      i += 2;
      continue;
    }
    let singleIndex = -1;
    for (let j = 0; j < keyValues.length; j++) {
      if (keyValues[j].includes(text[i])) { singleIndex = j; break; }
    }
    assert.notEqual(singleIndex, -1, 'No GP rune for key character ' + text[i]);
    shifts.push(singleIndex + 1);
    i++;
  }
  return shifts;
}

// Archive rune_to_english() convention: move forward by the key shift in the
// reversed-key lookup order, retaining every ambiguous transliteration.
function decrypt(cipher, key, direction = 1) {
  let outputs = [''];
  let keyIndex = 0;
  for (const symbol of cipher) {
    if (!lookup.has(symbol)) {
      outputs = outputs.map((prefix) => prefix + symbol);
      continue;
    }
    const shift = key[keyIndex % key.length];
    const cipherIndex = runeKeys.indexOf(symbol);
    const plainRune = runeKeys[(cipherIndex + direction * shift + runeKeys.length) % runeKeys.length];
    const choices = lookup.get(plainRune);
    outputs = choices.flatMap((choice) => outputs.map((prefix) => prefix + choice));
    keyIndex++;
  }
  return { outputs, keySymbolsConsumed: keyIndex };
}

const runeCount = [...CIPHER].filter((symbol) => lookup.has(symbol)).length;
const visualSymbolCount = [...CIPHER].length;
const sourceKey = sourceKeyToShifts(KEY_PHRASE.replace(/\s+/g, ''), true);
const correctedKey = gpRuneKeyToShifts(KEY_PHRASE);
const sourceResult = decrypt(CIPHER, sourceKey);
const correctedResult = decrypt(CIPHER, correctedKey);
const wrongKeyResult = decrypt(CIPHER, gpRuneKeyToShifts('THE GREAT JOURNEY TOWARD'));
const wrongDirectionResult = decrypt(CIPHER, correctedKey, -1);

// The published possibilities file is exactly the four branches produced by
// the archive's non-consuming key conversion.
assert.deepEqual(sourceResult.outputs, [
  'AUOWYFGL5LCSFJ3NONPM',
  'AUOWYFGL5LKSFJ3NONPM',
  'AUOWYFGL5LCZFJ3NONPM',
  'AUOWYFGL5LKZFJ3NONPM',
]);
assert.equal(runeCount, 18);
assert.equal(visualSymbolCount, 20); // 18 runes plus the literal 5 and 3.
assert.equal(sourceKey.length, 19); // TH was double-counted as T and H.
assert.equal(correctedKey.length, 18); // TH is one GP rune.
assert.equal(correctedResult.keySymbolsConsumed, 18);

// Normalize GP U=V and the URL dot, as the original archive explicitly notes.
const normalizedHost = EXPECTED_HOST.toUpperCase().replaceAll('V', 'U').replaceAll('.', '');
const exactMatches = correctedResult.outputs.filter((candidate) => candidate === normalizedHost);
assert.equal(exactMatches.length, 1);
assert.equal(exactMatches[0], 'AUOWYFGL5LKZFJ3NONION');
assert.equal(wrongKeyResult.outputs.includes(normalizedHost), false);
assert.equal(wrongDirectionResult.outputs.includes(normalizedHost), false);

console.log(JSON.stringify({
  source: {
    repository: 'neuroretransmit/cicada',
    commit: 'ade9a02889ef8acbc8cde8edbfd0a785c369f4c3',
    imageBlob: 'f91bdd6e2a890968a5a13d39be4d56899b877920',
    transcriptionBlob: '9a4c24fc6b6b3586fb85e5bb7453ba6e718a160b',
    implementationBlob: 'e3d22a6e13abb3e319c65aa6e813c055ce4f048d',
  },
  cipher: CIPHER,
  visualSymbolCount,
  runeCount,
  keyPhrase: KEY_PHRASE,
  latinKeyLetters: KEY_PHRASE.replace(/\s+/g, '').length,
  sourceKeyShifts: sourceKey,
  sourceKeyShiftCount: sourceKey.length,
  sourceOutputs: sourceResult.outputs,
  correctedGpKeyShifts: correctedKey,
  correctedKeyShiftCount: correctedKey.length,
  correctedOutputs: correctedResult.outputs,
  normalizedArchivedHost: normalizedHost,
  exactHostMatches: exactMatches,
  wrongKeyControlMatches: wrongKeyResult.outputs.filter((candidate) => candidate === normalizedHost),
  wrongDirectionControlMatches: wrongDirectionResult.outputs.filter((candidate) => candidate === normalizedHost),
  conclusion: 'One GP-tokenized WELCOME PILGRIM TO THE key exactly reproduces the archived fourth onion host; no LP2 instruction is present in the decoded string.',
}, null, 2));
