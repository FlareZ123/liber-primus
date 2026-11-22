#!/usr/bin/env node
'use strict';
/**
 * Source-locked LP2 p55 GP25 candidate, and p50 5x5 ranked Playfair/Bifid receivers.
 * Read-only Windows-compatible Node22 SFT. Neither the square nor cipher is author-selected.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
/** @param {string} file @returns {any} */
const read = (file) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', file), 'utf8'));
const corpus = read('lp2-corpus.json');
const grid = read('base60-grid.json');
const p55 = corpus.pages.find((p) => p.page === 55).indices;
const latin = 'ABCDEFGHIKLMNOPQRSTUVWXYZ';
const support = [...new Set(p55)].sort((a, b) => a - b);
assert.equal(p55.length, 76);
assert.equal(support.length, 25);
assert.deepEqual(Array.from({length: 29}, (_, i) => i).filter((i) => !support.includes(i)), [3, 9, 16, 26]);
const cipher = p55.map((i) => latin[support.indexOf(i)]).join('');
// Key-independent standard Playfair obstruction: encrypted digraphs
// cannot have equal symbols within the same pair, for ANY 25! square.
const p54 = corpus.pages.find((p) => p.page === 54).indices;
assert.equal(p54.length, 232);
assert.deepEqual(p54.slice(19, 21), [21, 21]);
assert.deepEqual(p54.slice(155, 157), [6, 6]);
assert.deepEqual(p55.slice(58, 60), [2, 2]);
// Two original printed p55 terminal words are DJU-BEI (3+3 runes).
// Standalone wordwise Playfair also cannot yield odd-length ciphertext words.
assert.deepEqual(p55.slice(70, 73), [23, 11, 1]);
assert.deepEqual(p55.slice(73, 76), [17, 18, 10]);
const wholeChapter = p54.concat(p55);
assert.equal(wholeChapter.length, 308);
const repeatStarts = Array.from({length: wholeChapter.length - 1}, (_, i) => i)
  .filter((i) => wholeChapter[i] === wholeChapter[i + 1]);
assert.deepEqual(repeatStarts, [19, 155, 290]);
assert(repeatStarts.some((i) => i % 2 === 0), 'Phase 0 forbidden digraph');
assert(repeatStarts.some((i) => i % 2 === 1), 'Phase 1 forbidden digraph');
// Changing the phase at the visible 9-rune p54 red heading also fails:
// the first repeated pair of the black continuation is at relative 10..11.
assert.equal((19 - 9) % 2, 0);

const tokens = grid.rows.flat();
assert.equal(tokens.length, 256);
const square = Array.from({length: 25}, (_, i) => tokens[(21 + Math.floor(i / 5)) * 8 + (1 + i % 5)]);
const a59 = grid.alphabet.replace('f', '');
/** @param {string} t @param {string} a */
const num = (t, a) => a.length * a.indexOf(t[0]) + a.indexOf(t[1]);
const v59 = square.map((t) => num(t, a59));
const v60 = square.map((t) => num(t, grid.alphabet));
assert.deepEqual([v59[0], v59[4], v59[20], v59[24]], [224, 115, 73, 75]);
assert.equal(new Set(v59).size, 25);
/** @param {number[]} vals @param {boolean} desc */
function rankKey(vals, desc) {
  const sorted = Array.from({length: 25}, (_, i) => i).sort((i, j) => desc ? vals[j] - vals[i] : vals[i] - vals[j]);
  const out = Array(25).fill('');
  sorted.forEach((position, rank) => { out[position] = latin[rank]; });
  return out.join('');
}
assert.equal(rankKey(v59, false), rankKey(v60, false));
/** @param {string} key @param {number} variant */
function orient(key, variant) {
  let g = Array.from({length: 5}, (_, i) => [...key.slice(i * 5, i * 5 + 5)]);
  if (variant >= 4) g = g.map((row) => row.slice().reverse());
  for (let n = 0; n < variant % 4; n++) {
    g = Array.from({length: 5}, (_, r) => Array.from({length: 5}, (_, c) => g[c][4 - r]));
  }
  return g.flat().join('');
}
/** @param {string} input @param {string} key @param {boolean} enc */
function playfair(input, key, enc) {
  assert.equal(input.length % 2, 0);
  const coords = Object.fromEntries([...key].map((ch, i) => [ch, [Math.floor(i / 5), i % 5]]));
  const step = enc ? 1 : 4;
  let out = '';
  for (let i = 0; i < input.length; i += 2) {
    const [r1, c1] = coords[input[i]], [r2, c2] = coords[input[i + 1]];
    if (r1 === r2) out += key[5 * r1 + (c1 + step) % 5] + key[5 * r2 + (c2 + step) % 5];
    else if (c1 === c2) out += key[5 * ((r1 + step) % 5) + c1] + key[5 * ((r2 + step) % 5) + c2];
    else out += key[5 * r1 + c2] + key[5 * r2 + c1];
  }
  return out;
}
/** @param {string} input @param {string} key @param {number} period @param {boolean} enc */
function bifid(input, key, period, enc) {
  const coords = Object.fromEntries([...key].map((ch, i) => [ch, [Math.floor(i / 5), i % 5]]));
  let out = '';
  for (let offset = 0; offset < input.length; offset += period) {
    const word = input.slice(offset, offset + period);
    const n = word.length, flat = [...word].flatMap((ch) => coords[ch]);
    const transformed = enc ? flat.filter((_, i) => i % 2 === 0).concat(flat.filter((_, i) => i % 2 !== 0))
      : Array.from({length: 2 * n}, (_, i) => i % 2 ? flat[n + (i >> 1)] : flat[i >> 1]);
    for (let i = 0; i < 2 * n; i += 2) out += key[5 * transformed[i] + transformed[i + 1]];
  }
  return out;
}
/** @param {string} s */
function ioc(s) {
  const h = Array(25).fill(0);
  for (const ch of s) h[latin.indexOf(ch)]++;
  return h.reduce((sum, v) => sum + v * (v - 1), 0) / (s.length * (s.length - 1));
}
const plant = 'THEPRIMESARESACREDANDTHEREISASTORYUNDERTHESURFACE'.repeat(2).slice(0, 76);
const out = [];
for (const desc of [false, true]) {
  for (let variant = 0; variant < 8; variant++) {
    const key = orient(rankKey(v59, desc), variant);
    const plain = playfair(cipher, key, false);
    assert.equal(playfair(plain, key, true), cipher);
    assert.equal(playfair(playfair(plant, key, true), key, false), plant);
    out.push({method: 'Playfair', desc, variant, ioc: ioc(plain), text: plain});
    for (const tail of [false, true]) {
      for (const period of [5, 25, 75, 76]) {
        const source = cipher.slice(Number(tail));
        const candidate = bifid(source, key, period, false);
        assert.equal(bifid(candidate, key, period, true), source);
        const planted = plant.slice(Number(tail));
        assert.equal(bifid(bifid(planted, key, period, true), key, period, false), planted);
        out.push({method: 'Bifid', desc, variant, period, tail, ioc: ioc(candidate), text: candidate});
      }
    }
  }
}
assert.equal(out.filter((x) => x.method === 'Playfair').length, 16);
assert.equal(out.filter((x) => x.method === 'Bifid').length, 128);
let windows = 0, exact25 = 0, atMost25 = 0;
for (const page of corpus.pages.filter((p) => p.page <= 55)) {
  for (let i = 0; i + 76 <= page.indices.length; i++) {
    const count = new Set(page.indices.slice(i, i + 76)).size;
    windows++;
    exact25 += Number(count === 25);
    atMost25 += Number(count <= 25);
  }
}
assert.deepEqual([windows, exact25, atMost25], [8840, 560, 734]);
const best = (method) => out.filter((x) => x.method === method).sort((a,b) => b.ioc - a.ioc)[0];
console.log(JSON.stringify({
  source: 'original LP2 p55 76 GP29 runes; p50 5x5 at row21..25, col1..5',
  missing: [3,9,16,26].map((i) => corpus.translit[i]),
  alphabetSelection: '25 observed p55 runes mapped in GP29 sorted order to Latin A-Z without J; interpret cautiously',
  rareAlphabetBaseline: { windows, exact25, atMost25 },
  modelCount: { playfair: 16, bifid: 128 },
  bestPlayfair: best('Playfair'),
  bestBifid: best('Bifid'),
  sourceRoundtrip: 'PASS 144 original receiver trials',
  nativePlant: 'PASS 144 planted trials',
  interpretation: 'All models nonprose; no authentic key, plaintext or first-party model selection'
}, null, 2));
