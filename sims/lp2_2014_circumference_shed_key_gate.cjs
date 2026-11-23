#!/usr/bin/env node
'use strict';

// Bounded rejection test for two p57-motivated edits to the authenticated
// 2014 LP1 Vigenere keyword. This is not a decryption claim.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const quadText = fs.readFileSync(path.join(root, 'resources/control/dukotah_english_quadgrams.txt'), 'utf8');

const mod29 = (x) => ((x % 29) + 29) % 29;
const historicalKey = 'FIRFUMFERENFE';
assert.equal('CIRCUMFERENCE'.replace(/C/g, 'F'), historicalKey);

const outerTrim = historicalKey.slice(1, -1);
assert.equal(outerTrim, 'IRFUMFERENF');
const markerPositions = new Set([0, 3, 11]); // the three C->F replacements
const markerTrim = [...historicalKey].filter((_, i) => !markerPositions.has(i)).join('');
assert.equal(markerTrim, 'IRUMFERENE');

const unknownPages = corpus.pages
  .filter((p) => p.page >= 0 && p.page <= 55 && p.indices.length > 0);
assert.equal(unknownPages.length, 55); // p50 is a numerical table, not a rune stream
const allRunes = unknownPages.flatMap((p) => p.indices);
const p57 = corpus.pages.find((p) => p.page === 57);
assert(p57 && p57.indices.length > 0);

function exactFBleedPaths(ciphertext, shifts, sign, phase) {
  // Each ciphertext F may be literal/non-consuming or encrypted to a non-F.
  // Any non-F ciphertext that would decrypt to F is not a legal path.
  let states = new Set([0]);
  let peak = 1;
  for (let i = 0; i < ciphertext.length; i++) {
    const next = new Set();
    for (const consumed of states) {
      const decoded = mod29(ciphertext[i] + sign * shifts[(phase + consumed) % shifts.length]);
      if (decoded !== 0) next.add(consumed + 1);
      if (ciphertext[i] === 0) next.add(consumed);
    }
    if (next.size === 0) return { valid: false, firstImpossible: i, maxLiveStates: peak };
    states = next;
    peak = Math.max(peak, states.size);
  }
  return {
    valid: true,
    terminalKeyCounts: [...states].sort((a, b) => a - b),
    maxLiveStates: peak
  };
}

const quadgrams = new Map();
let quadgramTotal = 0;
for (const line of quadText.trim().split(/\r?\n/)) {
  const match = line.trim().match(/^([A-Z]{4})\s+(\d+)$/);
  if (!match) continue;
  const count = Number(match[2]);
  quadgrams.set(match[1], count);
  quadgramTotal += count;
}
assert(quadgrams.size > 0 && quadgramTotal > 0);

function toLetters(indices) {
  return indices.map((i) => corpus.translit[i]).join('').replace(/[^A-Z]/g, '');
}
function quadgramScore(text) {
  let score = 0;
  let n = 0;
  for (let i = 0; i + 4 <= text.length; i++) {
    score += Math.log((quadgrams.get(text.slice(i, i + 4)) || 0.01) / quadgramTotal);
    n++;
  }
  return score / (n || 1);
}
function decodeNoSkip(key, sign, phase, pageReset) {
  const out = [];
  let offset = 0;
  for (const page of unknownPages) {
    for (let i = 0; i < page.indices.length; i++) {
      const keyIndex = pageReset ? (phase + i) % key.length : (phase + offset) % key.length;
      out.push(mod29(page.indices[i] + sign * key[keyIndex]));
      if (!pageReset) offset++;
    }
  }
  return out;
}
function analyze(candidate) {
  const key = [...candidate.text].map((ch) => {
    const index = corpus.translit.indexOf(ch);
    assert.notEqual(index, -1, 'key symbol absent from GP29: ' + ch);
    return index;
  });
  const perPage = unknownPages.map((page) => {
    const viable = [];
    for (const sign of [-1, 1]) {
      for (let phase = 0; phase < key.length; phase++) {
        if (exactFBleedPaths(page.indices, key, sign, phase).valid) viable.push({ sign, phase });
      }
    }
    return { page: page.page, viableCount: viable.length, viable };
  });
  const noPathPages = perPage.filter((p) => p.viableCount === 0).map((p) => p.page);
  const continuous = [];
  for (const sign of [-1, 1]) {
    for (let phase = 0; phase < key.length; phase++) {
      const r = exactFBleedPaths(allRunes, key, sign, phase);
      continuous.push({ sign, phase, valid: r.valid, firstImpossible: r.firstImpossible });
    }
  }
  const noSkip = [];
  for (const pageReset of [false, true]) {
    for (const sign of [-1, 1]) {
      for (let phase = 0; phase < key.length; phase++) {
        const letters = toLetters(decodeNoSkip(key, sign, phase, pageReset));
        noSkip.push({
          pageReset, sign, phase,
          score: quadgramScore(letters),
          sample: letters.slice(0, 90)
        });
      }
    }
  }
  noSkip.sort((a, b) => b.score - a.score);
  return {
    name: candidate.name,
    keyText: candidate.text,
    keyIndices: key,
    impossiblePageCount: noPathPages.length,
    impossiblePages: noPathPages,
    survivingPageCount: perPage.length - noPathPages.length,
    continuousPathCount: continuous.filter((x) => x.valid).length,
    continuousFirstImpossible: continuous.filter((x) => !x.valid).map((x) => ({
      sign: x.sign, phase: x.phase, offset: x.firstImpossible
    })),
    bestNoSkip: noSkip[0]
  };
}

const candidates = [
  { name: 'outer-symbol trim', text: outerTrim },
  { name: 'delete three C-to-F markers, retain genuine interior F', text: markerTrim }
];
const results = candidates.map(analyze);
const baselineScore = quadgramScore(toLetters(allRunes));
const p57Score = quadgramScore(toLetters(p57.indices));

assert.equal(results[0].impossiblePageCount, 27);
assert.equal(results[0].continuousPathCount, 0);
assert.equal(results[1].impossiblePageCount, 38);
assert.equal(results[1].continuousPathCount, 0);

console.log(JSON.stringify({
  source: {
    corpus: 'resources/liber-primus/lp2-corpus.json',
    quadgrams: 'resources/control/dukotah_english_quadgrams.txt',
    runeBearingUnknownPages: unknownPages.length,
    totalUnknownRunes: allRunes.length,
    p57ControlRunes: p57.indices.length
  },
  historicalKey,
  baselineQuadgramScore: baselineScore,
  p57CleartextQuadgramScore: p57Score,
  results
}, null, 2));
