#!/usr/bin/env node
'use strict';

// Deterministic source-page carry and state-transition control.
// The LP2 rune stream is used as plaintext only for a synthetic plant.
// This is NOT a proposed LP2 decryption.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const lp2Transcription = fs.readFileSync(path.join(root, 'resources/lp2-transcription.txt'), 'utf8');
const lp1Transcription = fs.readFileSync(path.join(root, 'resources/transcriptions/lp1_wulfic_canonical.txt'), 'utf8');

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeCount = value => Array.from(value).filter(ch => runeIndex.has(ch)).length;
const textSegments = lp2Transcription.split('%').slice(0, 55);
const lp2Pages = corpus.pages.filter(page => page.page <= 55 && page.indices.length);
const pageLengths = lp2Pages.map(page => page.indices.length);
const segmentRuneCounts = textSegments.map(runeCount);

assert.equal(textSegments.length, 55, 'expected 55 rune-bearing LP2 text pages');
assert.deepEqual(segmentRuneCounts, pageLengths, 'transcription segments must match corpus page lengths');
assert.equal(pageLengths.reduce((sum, value) => sum + value, 0), 12956, 'unexpected LP2 rune total');

const words = [];
let current = [];
let seams = [];
let pageIndex = 0;
let absolute = 0;
let wordStart = 0;

function flushWord() {
  if (!current.length) return;
  words.push({
    runes: current.slice(),
    seams: seams.slice(),
    start: wordStart,
    length: current.length
  });
  current = [];
  seams = [];
}

const joinedText = textSegments.join('%');
for (const ch of Array.from(joinedText)) {
  if (runeIndex.has(ch)) {
    if (!current.length) wordStart = absolute;
    current.push(runeIndex.get(ch));
    absolute += 1;
  } else if (ch === '%') {
    if (current.length) seams.push({ pageIndex, offset: current.length });
    pageIndex += 1;
  } else if (ch !== '/' && !/\s/u.test(ch) && current.length) {
    flushWord();
  }
}
flushWord();

const physicalPage = page => page >= 50 ? page + 1 : page; // LP2 p50 is the rune-free table page.
const carryRows = words.flatMap(word => word.seams
  .filter(seam => seam.offset < word.length)
  .map(seam => ({
    from: physicalPage(seam.pageIndex),
    to: physicalPage(seam.pageIndex + 1),
    offset: seam.offset,
    wordLength: word.length,
    suffixLength: word.length - seam.offset,
    suffixStart: word.start + seam.offset,
    wordRunes: word.runes.map(index => corpus.runes[index]).join('')
  })));
const carryEdges = new Set(carryRows.map(row => row.from === 49 ? 49 : row.from).map(from => {
  // Convert physical page number back to the text-bearing page index.
  return from >= 51 ? from - 1 : from;
}));
const pageEdgeCount = pageLengths.length - 1;
const completedWordEdges = pageEdgeCount - carryEdges.size;
const carrySuffixRunes = carryRows.reduce((sum, row) => sum + row.suffixLength, 0);

assert.equal(absolute, 12956);
assert.equal(carryRows.length, 32, 'expected 32 genuine word carries');
assert.equal(carryEdges.size, 32);
assert.equal(completedWordEdges, 22);
assert.equal(carrySuffixRunes, 83);

// The LP1 A KOAN key is used only as a known source-native state machine.
const key = Array.from('FIRFUMFERENFE', ch => corpus.translit.indexOf(ch));
assert.deepEqual(key, [0, 10, 4, 0, 1, 19, 0, 18, 4, 18, 9, 0, 18]);

const lp2PlainPlant = lp2Pages.flatMap(page => page.indices);
function encryptContinuous(plain) {
  let keyPosition = 0;
  const cipher = [];
  for (const value of plain) {
    const shift = key[keyPosition % key.length];
    if (value === 0 && shift === 0) {
      cipher.push(0); // source-specific F interrupter: no key consumption
    } else {
      cipher.push((value + shift) % 29);
      keyPosition += 1;
    }
  }
  return { cipher, keyConsumed: keyPosition };
}

const planted = encryptContinuous(lp2PlainPlant);
function decryptPlant(policy) {
  let keyPosition = 0;
  let absolutePosition = 0;
  const decoded = [];
  for (let page = 0; page < pageLengths.length; page += 1) {
    if (page > 0) {
      const edge = page - 1;
      const isCarry = carryEdges.has(edge);
      if (policy === 'reset-every-page' || (policy === 'reset-after-completed-word' && !isCarry)) {
        keyPosition = 0;
      }
    }
    for (let i = 0; i < pageLengths[page]; i += 1) {
      const cipher = planted.cipher[absolutePosition];
      const shift = key[keyPosition % key.length];
      if (cipher === 0 && shift === 0) {
        decoded.push(0);
      } else {
        decoded.push((cipher - shift + 29) % 29);
        keyPosition += 1;
      }
      absolutePosition += 1;
    }
  }
  let errors = 0;
  for (let i = 0; i < decoded.length; i += 1) {
    if (decoded[i] !== lp2PlainPlant[i]) errors += 1;
  }
  let carrySuffixErrors = 0;
  for (const row of carryRows) {
    for (let i = row.suffixStart; i < row.suffixStart + row.suffixLength; i += 1) {
      if (decoded[i] !== lp2PlainPlant[i]) carrySuffixErrors += 1;
    }
  }
  return { errors, carrySuffixErrors, carrySuffixRunes };
}

const continuousPlant = decryptPlant('continuous');
const pageResetPlant = decryptPlant('reset-every-page');
const completedResetPlant = decryptPlant('reset-after-completed-word');
assert.equal(continuousPlant.errors, 0);
assert.equal(continuousPlant.carrySuffixErrors, 0);
assert.equal(pageResetPlant.errors, 7862);
assert.equal(pageResetPlant.carrySuffixErrors, 46);
assert.equal(completedResetPlant.errors, 6771);
assert.equal(completedResetPlant.carrySuffixErrors, 35);

// Reproduce the open-word page-edge control in the LP1 A KOAN section.
// The source transcription splits STOPPED as STOP | PED at this page seam.
const lp1Segments = lp1Transcription.split('%');
const koanPages = [lp1Segments[12], lp1Segments[13]];
assert.deepEqual(koanPages.map(runeCount), [226, 93]);
const expectedStopped = ['S', 'T', 'O', 'P', 'P', 'E', 'D'].map(ch => corpus.translit.indexOf(ch));

function decodeKoan(resetAtPageEdge) {
  let keyPosition = 0;
  const decodedPages = [];
  let keyPositionAtEdge = null;
  for (let page = 0; page < koanPages.length; page += 1) {
    if (page === 1 && resetAtPageEdge) keyPosition = 0;
    const decoded = [];
    for (const ch of Array.from(koanPages[page])) {
      if (!runeIndex.has(ch)) continue;
      const cipher = runeIndex.get(ch);
      const shift = key[keyPosition % key.length];
      const skip = cipher === 0 && shift === 0;
      decoded.push(skip ? 0 : (cipher - shift + 29) % 29);
      if (!skip) keyPosition += 1;
    }
    if (page === 0) keyPositionAtEdge = keyPosition;
    decodedPages.push(decoded);
  }
  return {
    keyPositionAtEdge,
    tail: decodedPages[0].slice(-4),
    head: decodedPages[1].slice(0, 3),
    joined: decodedPages[0].slice(-4).concat(decodedPages[1].slice(0, 3))
  };
}

const koanContinuous = decodeKoan(false);
const koanPageReset = decodeKoan(true);
assert.deepEqual(koanContinuous.joined, expectedStopped, 'continuous key must recover STOPPED across the page seam');
assert.equal(koanContinuous.keyPositionAtEdge, 224);
assert.notDeepEqual(koanPageReset.joined, expectedStopped, 'page reset must fail the STOPPED seam control');

const welcomePages = [lp1Segments[1], lp1Segments[2]];
const welcomePageRunes = welcomePages.map(runeCount);
assert.deepEqual(welcomePageRunes, [251, 264]);
assert.equal(welcomePageRunes.reduce((sum, value) => sum + value, 0), 515);

const result = {
  lp2: {
    runeBearingPages: pageLengths.length,
    runes: absolute,
    pageEdges: pageEdgeCount,
    carriedWordEdges: carryRows.map(row => ({
      edge: row.from + '->' + row.to,
      split: row.offset + '/' + row.wordLength,
      suffixRunes: row.suffixLength
    })),
    carryCount: carryRows.length,
    completedWordEdges,
    carrySuffixRunes
  },
  lp1SourceControl: {
    aKoanPageRunes: koanPages.map(runeCount),
    key: 'FIRFUMFERENFE',
    keyValues: key,
    keyPositionAtOpenWordPageEdge: koanContinuous.keyPositionAtEdge,
    keyPhaseAtEdge: koanContinuous.keyPositionAtEdge % key.length,
    continuousPageSeam: koanContinuous.joined.map(index => corpus.translit[index]).join(''),
    pageResetPageSeam: koanPageReset.joined.map(index => corpus.translit[index]).join(''),
    expected: 'STOPPED',
    welcomeWisdomPageRunes: welcomePageRunes,
    welcomeWisdomTotal: 515,
    welcomeWisdomBoundaryTail: welcomePages[0].slice(-60),
    welcomeWisdomBoundaryHead: welcomePages[1].slice(0, 60),
    welcomeWisdomContinuousKeySource: 'Wulfic canonical test: DIVINITY is applied continuously over the complete 515-rune WELCOME/WISDOM section spanning the two page segments.'
  },
  syntheticPlant: {
    plaintextSource: 'The original 12,956 LP2 rune indices; synthetic control only, not LP2 plaintext.',
    key: 'FIRFUMFERENFE',
    keyConsumed: planted.keyConsumed,
    continuous: continuousPlant,
    resetEveryPage: pageResetPlant,
    resetOnlyAfterCompletedWordEdges: completedResetPlant
  }
};

console.log(JSON.stringify(result, null, 2));
