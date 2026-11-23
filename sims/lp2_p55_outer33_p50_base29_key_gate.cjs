#!/usr/bin/env node
'use strict';

// Tests the source-selected p55 exterior33 as a repeating GP29 key for the
// original 256-byte p50 table, using the Cicada base29 byte transport and the
// p56 C-K / literal-F-bypass receiver. A valid output must reconstruct 256
// bytes, not merely produce a plausible-looking rune string.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const mod29 = (x) => ((x % 29) + 29) % 29;

const p55 = corpus.pages.find((p) => p.page === 55).indices;
const printedWordLengths = [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
let offset = 0;
const exterior = [];
for (const length of printedWordLengths) {
  const word = p55.slice(offset, offset + length);
  assert.equal(word.length, length);
  offset += length;
  if (length === 1) exterior.push(word[0]); // the p54 carry is one exterior rune
  else exterior.push(word[0], word[length - 1]);
}
assert.equal(offset, 76);
assert.equal(exterior.length, 33);
const exteriorText = exterior.map((i) => corpus.translit[i]).join('');
assert.equal(exteriorText, 'NGAEWSBXMSAEFUWRBEOMFBCEOEEASESTHOECXDUBI');

assert.equal(grid.bytes.length, 256);
assert(grid.bytes.every((b) => Number.isInteger(b) && b >= 0 && b <= 255));
const base29Digits = grid.bytes.flatMap((b) => [Math.floor(b / 29), b % 29]);
assert.equal(base29Digits.length, 512);

function permissiveFBypass(phase, sign) {
  // State is (key symbols consumed mod 33, decoded high byte digit or null).
  // A ciphertext F may bypass without consuming the key. A shifted F from a
  // non-F ciphertext is illegal. Each decoded pair must reconstruct a byte.
  let states = new Map([['0|', { used: 0, high: null }]]);
  let peakStates = 1;
  for (let pos = 0; pos < base29Digits.length; pos++) {
    const c = base29Digits[pos];
    const next = new Map();
    const isHigh = pos % 2 === 0;
    const add = (used, high) => {
      const id = String(used) + '|' + (high === null ? '' : String(high));
      if (!next.has(id)) next.set(id, { used, high });
    };
    for (const state of states.values()) {
      const shifted = mod29(c - sign * exterior[(phase + state.used) % exterior.length]);
      if (isHigh) {
        if (shifted !== 0 && shifted <= 8) add((state.used + 1) % exterior.length, shifted);
        if (c === 0) add(state.used, 0);
      } else {
        if (state.high !== null && shifted !== 0 && state.high * 29 + shifted <= 255) {
          add((state.used + 1) % exterior.length, null);
        }
        if (c === 0 && state.high !== null && state.high * 29 <= 255) {
          add(state.used, null);
        }
      }
    }
    if (next.size === 0) return { valid: false, firstImpossibleDigit: pos, peakStates };
    states = next;
    peakStates = Math.max(peakStates, states.size);
  }
  return { valid: true, terminalStates: states.size, peakStates };
}

function noSkipBytePairs(phase, sign) {
  const decoded = base29Digits.map((c, i) =>
    mod29(c - sign * exterior[(phase + i) % exterior.length])
  );
  let validPairs = 0;
  let maxValue = 0;
  for (let i = 0; i < decoded.length; i += 2) {
    const value = decoded[i] * 29 + decoded[i + 1];
    if (value <= 255) validPairs++;
    maxValue = Math.max(maxValue, value);
  }
  return { validPairs, totalPairs: decoded.length / 2, maxValue };
}

const trials = [];
const noSkip = [];
for (const sign of [-1, 1]) {
  for (let phase = 0; phase < exterior.length; phase++) {
    const r = permissiveFBypass(phase, sign);
    trials.push({ sign, phase, ...r });
    noSkip.push({ sign, phase, ...noSkipBytePairs(phase, sign) });
  }
}
const paths = trials.filter((x) => x.valid);
noSkip.sort((a, b) => b.validPairs - a.validPairs);
const sourceSubtract = noSkip.find((x) => x.sign === 1 && x.phase === 0);
const oppositePhaseZero = noSkip.find((x) => x.sign === -1 && x.phase === 0);

assert.equal(paths.length, 0);
assert.equal(sourceSubtract.validPairs, 71);
assert.equal(oppositePhaseZero.validPairs, 61);
assert.equal(noSkip[0].validPairs, 78);

console.log(JSON.stringify({
  source: {
    corpus: 'resources/liber-primus/lp2-corpus.json',
    p50Bytes: 'resources/liber-primus/lp2-grid-256.json',
    p50ByteCount: grid.bytes.length,
    p55PrintedWordLengths: printedWordLengths,
    p55ExteriorRuneCount: exterior.length,
    p55ExteriorGP: exteriorText,
    base29Transport: 'byte B -> [floor(B/29), B mod 29]'
  },
  permissiveFBypass: {
    phaseSignTrials: trials.length,
    validCompleteByteStreams: paths.length,
    failures: trials.map((x) => ({
      sign: x.sign, phase: x.phase, firstImpossibleDigit: x.firstImpossibleDigit
    }))
  },
  noSkip: {
    sourceFixedSubtractKeyPhaseZero: sourceSubtract,
    oppositeSignPhaseZero: oppositePhaseZero,
    bestOfAllPhasesAndSigns: noSkip[0]
  }
}, null, 2));
