#!/usr/bin/env node
'use strict';

// Direct cross-round test of the 2014 LP1 prime-page Vigenere key on LP2.
// Source key schedule: key_to_shifts() returns the 1-based reverse-GP
// position; adding that shift is equivalent to P = C - GP_INDEX(key) mod 29.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { encode } = require('./grid_keyskip_viterbi.cjs');

const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const mod = x => ((x % 29) + 29) % 29;

function trainSymbols(xs) {
  const u = new Uint32Array(29);
  const b = new Uint32Array(29 * 29);
  const t = new Uint32Array(29 * 29 * 29);
  for (let i = 0; i < xs.length; i++) {
    u[xs[i]]++;
    if (i > 0) b[xs[i - 1] * 29 + xs[i]]++;
    if (i > 1) t[(xs[i - 2] * 29 + xs[i - 1]) * 29 + xs[i]]++;
  }
  const U = new Float64Array(29);
  const B = new Float64Array(29 * 29);
  const T = new Float64Array(29 * 29 * 29);
  for (let c = 0; c < 29; c++) U[c] = Math.log((u[c] + 1) / (xs.length + 29));
  for (let a = 0; a < 29; a++) {
    for (let c = 0; c < 29; c++) {
      B[a * 29 + c] = Math.log((b[a * 29 + c] + 12 * Math.exp(U[c])) / (u[a] + 12));
    }
  }
  for (let a = 0; a < 29; a++) {
    for (let v = 0; v < 29; v++) {
      for (let c = 0; c < 29; c++) {
        const i = (a * 29 + v) * 29 + c;
        T[i] = Math.log((t[i] + 9 * Math.exp(B[v * 29 + c])) / (b[a * 29 + v] + 9));
      }
    }
  }
  return { U, B, T };
}

function score(xs, model) {
  if (xs.length < 3) return NaN;
  let total = model.U[xs[0]] + model.B[xs[0] * 29 + xs[1]];
  for (let i = 2; i < xs.length; i++) {
    total += model.T[(xs[i - 2] * 29 + xs[i - 1]) * 29 + xs[i]];
  }
  return total / xs.length;
}

function split80(text) {
  const words = text.match(/[A-Za-z]+/g) || [];
  return words.slice(0, Math.floor(words.length * 0.8)).join(' ');
}

function pageSection(text, page) {
  const match = new RegExp('^### ' + page + '\\s*$', 'm').exec(text);
  assert(match, 'missing LP1 plaintext page ' + page);
  const rest = text.slice(match.index + match[0].length);
  const next = rest.search(/^### \d+/m);
  return (next < 0 ? rest : rest.slice(0, next))
    .replace(/\[[^\]]*(?:Continuation|Conclusion)[^\]]*\]/gi, ' ')
    .replace(/\(continued from[^)]*\)/gi, ' ')
    .trim();
}

function weightedScores(pages, field, models) {
  const total = pages.reduce((sum, p) => sum + p[field].length, 0);
  return Object.fromEntries(Object.entries(models).map(([name, model]) => [
    name,
    pages.reduce((sum, p) => sum + score(p[field], model) * p[field].length, 0) / total
  ]));
}

function ioc(xs) {
  const counts = new Uint32Array(29);
  for (const x of xs) counts[x]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (xs.length * (xs.length - 1));
}

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const lp1 = read('resources/liber-primus/lp1-plaintext-reference.txt');
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length >= 3);
const key = 'FIRFUMFERENCE';
const keyIndices = [...key].map(ch => corpus.translit.indexOf(ch));
assert(keyIndices.every(i => i >= 0), 'key letter missing from GP alphabet');
const keyShifts = keyIndices.map(i => 29 - i);
assert.deepEqual(keyIndices, [0, 10, 4, 0, 1, 19, 0, 18, 4, 18, 9, 5, 18]);
assert.deepEqual(keyShifts, [29, 19, 25, 29, 28, 10, 29, 11, 25, 11, 20, 24, 11]);

let keyPosition = 0;
const decodedPages = pages.map(page => ({
  page: page.page,
  indices: page.indices,
  plain: page.indices.map(cipher => {
    const plain = mod(cipher + keyShifts[keyPosition % keyShifts.length]);
    keyPosition++;
    return plain;
  })
}));
const raw = pages.flatMap(p => p.indices);
const decoded = decodedPages.flatMap(p => p.plain);
assert.equal(pages.length, 55);
assert.equal(raw.length, 12956);
assert.equal(keyPosition, 12956);
assert.equal(keyPosition % key.length, 8);
assert.equal(corpus.pages.find(p => p.page === 50).indices.length, 0);
const colonCount = (transcription.match(/:/g) || []).length;
assert.equal(colonCount, 0, 'LP2 transcription unexpectedly contains 2014 colon skip markers');

const controls = {
  emerson: 'resources/control/emerson_essays_2944.txt',
  gibran: 'resources/control/gibran_prophet_58585.txt',
  shakespeare: 'resources/control/shakespeare_first300k.txt'
};
const models = Object.fromEntries(Object.entries(controls).map(([name, file]) => {
  const xs = encode(split80(read(file))).slice(0, 700);
  assert.equal(xs.length, 700, name + ' matched training size');
  return [name, trainSymbols(xs)];
}));
const p56 = encode(pageSection(lp1, 56).replace(/[0-9a-f]{32,}/gi, ' '));
const p57 = encode(pageSection(lp1, 57));
const controlScores = {
  p56: Object.fromEntries(Object.entries(models).map(([n, m]) => [n, score(p56, m)])),
  p57: Object.fromEntries(Object.entries(models).map(([n, m]) => [n, score(p57, m)]))
};
const rawScores = weightedScores(pages.map(p => ({ ...p, plain: p.indices })), 'plain', models);
const decodedScores = weightedScores(decodedPages, 'plain', models);
const deltas = Object.fromEntries(Object.keys(models).map(n => [n, decodedScores[n] - rawScores[n]]));

console.log(JSON.stringify({
  hypothesis: 'LP2 p57 “circumferences” points to the 2014 FIRFUMFERENCE Vigenere key',
  operation: 'P = C + (29 - GP_INDEX(key_letter)) mod 29',
  key,
  keyIndices,
  keyShifts,
  keySchedule: 'continuous across all rune-bearing pages; no page resets; punctuation consumes no key; p50 has zero runes',
  pages: pages.length,
  runes: raw.length,
  finalKeyOffset: keyPosition % key.length,
  lp2ColonSkipMarkers: colonCount,
  rawIoC: ioc(raw),
  decodedIoC: ioc(decoded),
  matched700RuneControlScores: controlScores,
  rawWeightedScores: rawScores,
  decodedWeightedScores: decodedScores,
  decodedMinusRaw: deltas,
  decodedPrefix: decoded.slice(0, 120).map(i => corpus.translit[i]).join('')
}, null, 2));
