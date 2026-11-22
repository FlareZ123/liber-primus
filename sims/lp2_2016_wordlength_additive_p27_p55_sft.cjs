#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const asc = read('resources/historical/cicada2016-4gq25-outguess.asc');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/lp2-transcription.txt');
const shakespeare = read('resources/control/shakespeare_first300k.txt');
const alpha = corpus.translit;
const tokens = alpha.map((token, index) => ({token, index}))
  .sort((a, b) => b.token.length - a.token.length);

function gpEncode(text) {
  const clean = text.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/K/g, 'C')
    .replace(/Z/g, 'S').replace(/Q/g, 'C');
  const out = [];
  for (const word of clean.match(/[A-Z]+/g) || []) {
    for (let at = 0; at < word.length;) {
      const t = tokens.find(x => word.startsWith(x.token, at));
      assert.ok(t, 'complete GP transliteration');
      out.push(t.index);
      at += t.token.length;
    }
  }
  return out;
}
const messageBody = asc.slice(asc.indexOf('Hello.'),
  asc.indexOf('-----BEGIN PGP SIGNATURE-----'));
const sourceWords = messageBody.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g) || [];
assert.equal(sourceWords.length, 43);
const gpLengths = sourceWords.map(w => gpEncode(w).length);
const asciiLengths = sourceWords.map(w => w.length);

// p55: remove the first and last rune of every printed word. The first
// one-rune carry contributes no interior rune.
const page55 = corpus.pages.find(p => p.page === 55).indices;
const physical55 = transcript.split('%')[54].replace(/\/\s*/g, '')
  .match(/[\u16A0-\u16FF]+/gu) || [];
const p55Offsets = [];
const p55WordShape = [];
let p55Cursor = 0;
for (const word of physical55) {
  const n = [...word].length;
  for (let k = 1; k < n - 1; k++) p55Offsets.push(p55Cursor + k);
  if (n > 2) p55WordShape.push(n - 2);
  else if (n > 1) p55WordShape.push(0);
  p55Cursor += n;
}
assert.equal(p55Cursor, page55.length);
const p55Core = p55Offsets.map(i => page55[i]);
assert.equal(p55Core.length, 43);
assert.equal(p55WordShape.reduce((a, b) => a + b, 0), 43);

// p27: remove its 19-rune red header. The black body is 215 = 5*43.
// The first black rune is the tail of the final header/body word.
const page27 = corpus.pages.find(p => p.page === 27).indices;
assert.equal(page27.length, 234);
const p27Body = page27.slice(19);
assert.equal(p27Body.length, 215);
const p27Text = transcript.split('%')[27].replace(/[\/\n\r&$]/g, '');
const p27PhysicalWords = p27Text.split(/[-.]/)
  .map(s => [...s].filter(ch => ch >= 'ᚠ' && ch <= '᛿')
    .map(ch => corpus.runes.indexOf(ch)))
  .filter(a => a.length);
const p27WordShape = [];
let p27Cursor = 0;
for (const word of p27PhysicalWords) {
  const start = p27Cursor;
  const end = start + word.length;
  const from = Math.max(19, start);
  const to = Math.min(234, end);
  if (to > from) p27WordShape.push(to - from);
  p27Cursor = end;
}
assert.equal(p27Cursor, 234);
assert.equal(p27WordShape.reduce((a, b) => a + b, 0), 215);

const modelText = gpEncode(shakespeare.slice(0, 240000));
const plantText = gpEncode(shakespeare.slice(240000));
const counts = Array.from({length: 29}, () => new Float64Array(29));
const previous = new Float64Array(29);
for (let i = 1; i < modelText.length; i++) {
  counts[modelText[i - 1]][modelText[i]]++;
  previous[modelText[i - 1]]++;
}
function withinWordScore(seq, wordShape) {
  let score = 0, cursor = 0, pairs = 0;
  for (const n of wordShape) {
    for (let j = 1; j < n; j++) {
      const a = seq[cursor + j - 1];
      const b = seq[cursor + j];
      score += Math.log((counts[a][b] + 0.25) /
        (previous[a] + 0.25 * 29));
      pairs++;
    }
    cursor += n;
  }
  assert.equal(cursor, seq.length);
  return {mean: score / pairs, pairs, total: score};
}
const mod29 = (x) => ((x % 29) + 29) % 29;
const cases = [];
for (const [keyName, key] of [
  ['GP-rune-length', gpLengths],
  ['ASCII-letter-length', asciiLengths]
]) {
  const repeated = Array.from({length: 5}, () => key).flat();
  for (const sign of [-1, 1]) {
    const p55Out = p55Core.map((v, i) => mod29(v + sign * key[i]));
    const p27Out = p27Body.map((v, i) => mod29(v + sign * repeated[i]));
    cases.push({
      keyName,
      sign,
      p55: {
        score: withinWordScore(p55Out, p55WordShape),
        output: p55Out.map(i => alpha[i]).join(' ')
      },
      p27: {
        score: withinWordScore(p27Out, p27WordShape),
        first120: p27Out.slice(0, 120).map(i => alpha[i]).join(' ')
      }
    });
  }
}

// Direct book-index reading: each p55 rune value selects one of the
// authenticated message's 43 words. No modulo or free phase is added.
const bookIndex = {
  zeroBased: p55Core.map(v => sourceWords[v]).join(' '),
  oneBasedWithFSkip: p55Core.map(v => v === 0 ? '·' : sourceWords[v - 1]).join(' ')
};

// Positive plants: same fixed length key, exact inverse, no fitted phase.
const key43 = gpLengths;
const key215 = Array.from({length: 5}, () => gpLengths).flat();
const plant43 = plantText.slice(0, 43);
const enc43 = plant43.map((v, i) => mod29(v + key43[i]));
const dec43 = enc43.map((v, i) => mod29(v - key43[i]));
const plant215 = plantText.slice(43, 258);
const enc215 = plant215.map((v, i) => mod29(v + key215[i]));
const dec215 = enc215.map((v, i) => mod29(v - key215[i]));
const exact = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
assert.ok(exact(dec43, plant43));
assert.ok(exact(dec215, plant215));

console.log(JSON.stringify({
  source: {
    signedMessageWords: sourceWords.length,
    asciiLengths,
    gpRuneLengths: gpLengths
  },
  targets: {
    p55Core: p55Core.length,
    p55WordShape: p55WordShape,
    p27BlackBody: p27Body.length,
    p27WordShape: p27WordShape,
    p27Factorization: '5 x 43'
  },
  rawScores: {
    p55: withinWordScore(p55Core, p55WordShape),
    p27: withinWordScore(p27Body, p27WordShape)
  },
  additiveLengthKeyCases: cases,
  directWordIndexBookCipher: bookIndex,
  positivePlants: {
    p55Length43: exact(dec43, plant43),
    p27Length215: exact(dec215, plant215)
  }
}, null, 2));
