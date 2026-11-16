'use strict';

/**
 * Original Cicada 2014 three-square rows against LP2 p55, eight fixed
 * GP29 ciphertext-feedback inverses. Source-selected square file and
 * source-printed p55 word boundaries, no fitted key/phase/target text.
 *
 * Fixed hypotheses: the 2014 numeric squares are a GP29 running pad
 * against (C_i - C_(i-1)) mod29, either arithmetic sign, with page/word
 * feedback reset and either 99-values-in-printed-order or one row
 * per printed word. No claim Cicada instructed these operations.
 *
 * Windows 11, Node.js 22, CommonJS, read-only.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
/** @param {string} p @returns {Buffer} */
function bytes(p) { return fs.readFileSync(path.join(ROOT, p)); }
/** @param {string} p @returns {string} */
function read(p) { return bytes(p).toString('utf8'); }
/** @param {number} value @returns {number} */
function mod29(value) { return (value % 29 + 29) % 29; }
/** @param {number[]} xs @returns {number} */
function ioc(xs) {
  const f = Array(29).fill(0);
  for (const x of xs) f[x]++;
  return f.reduce((s, n) => s + n * (n - 1), 0) / (xs.length * (xs.length - 1));
}
const squarePath = 'resources/cicada2014-openpuff-magic-squares.txt';
assert.equal(crypto.createHash('sha256').update(bytes(squarePath)).digest('hex'),
  '9e5c3004eec652c89027e99aa6f31c53a84c1f8c327c04ca9aa6acf7884b6c7f');
const squares = read(squarePath).trim().split(/\r?\n\s*\r?\n/).map(
  block => block.trim().split(/\r?\n/).map(
    line => line.trim().split(/\s+/).map(Number)));
assert.deepEqual(squares.map(M => M.length), [5, 7, 5]);
assert.ok(squares.every(M => M.every(row => row.length === M.length)));
const key99 = squares.flat(2);
const keyRows = squares.flatMap(M => M);
assert.equal(key99.length, 99);
assert.equal(keyRows.length, 17);

const c = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt')
  .split('%')[54].replace(/\/\s*/g, '');
const printedWords = transcript.match(/[\u16a0-\u16ff]+/gu) || [];
const originalWords = printedWords.map(w => [...w].map(r => c.runes.indexOf(r)));
assert.deepEqual(originalWords.map(w => w.length),
  [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]);
assert.deepEqual(originalWords.flat(), c.pages[55].indices);
assert.equal(c.pages[55].indices.length, 76);
/** @type {Array<{reset:string,pad:string,sign:number,ioc:number,plaintext:string}>} */
const trials=[];
for (const reset of ['page', 'word'])
for (const pad of ['flat99', 'row17'])
for (const sign of [-1, 1]) {
  const output=[];
  const text=[];
  let prior=0,offset=0;
  for (let wi=0;wi<originalWords.length;wi++) {
    if (reset==='word') prior=0;
    const pword=[];
    for (let j=0;j<originalWords[wi].length;j++) {
      const cipher=originalWords[wi][j];
      const k=pad==='flat99' ? key99[offset % 99]
        : keyRows[wi][j % keyRows[wi].length];
      const decoded=mod29(cipher-prior+sign*k);
      assert.equal(mod29(decoded+prior-sign*k), cipher);
      pword.push(decoded);
      output.push(decoded);
      prior=cipher;
      offset++;
    }
    text.push(pword.map(v=>c.translit[v]).join(''));
  }
  assert.equal(output.length, 76);
  const score=ioc(output);
  assert.ok(score < 0.036);
  trials.push({reset,pad,sign,ioc:score,plaintext:text.join(' ')});
}
assert.equal(trials.length, 8);
console.log(JSON.stringify({
  original:'LP2 physical p55, 76 GP29 symbols, 17 printed words',
  authenticated_source:'2014 OpenPuff magicsquares.txt, 99 source numbers / 17 rows',
  experiment:'GP29 previous-ciphertext difference with first-party square numeric pad',
  hypotheses:trials,
  recovered_unknown_plaintext:false
},null,2));
