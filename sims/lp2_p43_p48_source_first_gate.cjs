#!/usr/bin/env node
'use strict';

// Reproduce the fixed p43-p48 source-first checks that use the canonical
// transcription: p47 word segmentation, and the preregistered p48 line-reverse
// and standard-Morse holdouts. Run from the repository root with Node 22.

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const blocks = read('resources/liber-primus/lp2-transcription.txt')
  .split('%').map((s) => s.trim()).filter(Boolean);
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const runeToTranslit = new Map(corpus.runes.map((r, i) => [r, corpus.translit[i]]));
const runeSet = new Set(corpus.runes);
const transliterate = (s) => [...s].map((ch) => runeToTranslit.get(ch) ?? ch).join('');
const pageLines = (page) => blocks[page].split('\n').filter(Boolean);

const p47Lines = pageLines(47);
const p47Text = p47Lines.map((line) => line.replace(/\/$/, '')).join('');
const p47Words = p47Text.split(/[-.]/).filter(Boolean);
const p47RuneCount = [...p47Text].filter((ch) => runeSet.has(ch)).length;
const p47Hyphens = (p47Text.match(/-/g) || []).length;
const p47Periods = (p47Text.match(/\./g) || []).length;
const selectedIndices = [10, 21, 22, 29, 39, 42, 48, 58];
const selectedWords = selectedIndices.map((i) => ({
  index: i,
  runes: [...p47Words[i]],
  transliteration: transliterate(p47Words[i]),
}));

assert.equal(p47Lines.length, 12);
assert.equal(p47RuneCount, 274);
assert.equal(p47Hyphens, 54);
assert.equal(p47Periods, 4);
assert.equal(p47Words.length, 59);
assert.deepEqual(selectedWords.map((w) => w.transliteration), [
  'IAYEOEIAGAEFNW', 'LTI', 'AEJE', 'AENG',
  'HTH', 'EOBOEAE', 'LEOEA', 'AOAAE',
]);

const p48Lines = pageLines(48);
const p48Reverse = p48Lines.map((line) => {
  const body = line.replace(/\/$/, '');
  return transliterate([...body].reverse().join(''));
});

const morse = {
  '.-':'A','-...':'B','-.-.':'C','-..':'D','.':'E','..-.':'F','--.':'G','....':'H',
  '..':'I','.---':'J','-.-':'K','.-..':'L','--':'M','-.':'N','---':'O','.--.':'P',
  '--.-':'Q','.-.':'R','...':'S','-':'T','..-':'U','...-':'V','.--':'W','-..-':'X',
  '-.--':'Y','--..':'Z','-----':'0','.----':'1','..---':'2','...--':'3','....-':'4',
  '.....':'5','-....':'6','--...':'7','---..':'8','----.':'9',
};
const p48MorsePackets = p48Lines.map((line) => (line.match(/[-.]/g) || []).join(''));
const p48MorseDecoded = p48MorsePackets.map((packet) => morse[packet] ?? null);
const p48MorseLengths = p48MorsePackets.map((packet) => packet.length);

assert.equal(p48Lines.length, 12);
assert.deepEqual(p48MorseLengths, [7, 5, 6, 6, 5, 5, 6, 6, 5, 6, 4, 5]);
assert.equal(p48MorseDecoded.filter((x) => x === null).length, 7);
assert.equal(p48MorseDecoded.map((x) => x ?? '×').join(''), '×9××90××9××0');

console.log(JSON.stringify({
  p47: {
    lines: p47Lines.length,
    runes: p47RuneCount,
    hyphens: p47Hyphens,
    periods: p47Periods,
    words: p47Words.length,
    selectedWords,
  },
  p48: {
    lines: p48Lines.length,
    reversedLineTransliteration: p48Reverse,
    morsePackets: p48MorsePackets,
    morseLengths: p48MorseLengths,
    morseDecoded: p48MorseDecoded,
    morseInvalidCount: p48MorseDecoded.filter((x) => x === null).length,
  },
}, null, 2));
