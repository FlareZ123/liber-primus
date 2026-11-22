/**
 * Issue #2128, p33 word-cell 7x7 historical square direct GP29 shift.
 * Fixed single source-shaped proposal before output is observed:
 * 49 hyphen-delimited nonrubric words in original order, 7x7 Stage7
 * sum1033 square in printed row-major order, authentic Stage04's GP29
 * positive decryption shift per word. Final seven words are an untouched
 * output holdout using identical rules, not a fitted language key.
 * This test does not claim Cicada prescribed that cross-stage transfer.
 *
 * Windows 11 / Node.js 22; read-only standalone CommonJS.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const source = read('resources/lp2-transcription.txt');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const squares = read('resources/cicada2014-openpuff-magic-squares.txt');

const pages = source.split(/\r?\n%\r?\n/);
assert.equal(pages.length, 57, 'source transcription page groups');
const groups = pages[33].split('&');
assert.equal(groups.length, 2, 'two p33 red-headlined bodies');

/** @param {string} s @returns {string[]} */
function printedWords(s) {
  const joined = s.replace(/\/\s*\r?\n/g, '').replace(/[\s/]/g, '');
  return joined.split(/[-.]/g).filter(token => token.length > 0);
}
const all = groups.map(printedWords);
assert.deepEqual(all.map(a => a.length), [23,30]);
const rubrics = all.map(a => a.slice(0,2));
const words = all.flatMap(a => a.slice(2));
assert.equal(words.length, 49);
assert.deepEqual(all.map(a => a.slice(2).length), [21,28]);
assert.deepEqual(rubrics.map(a => a.map(w => [...w].length)), [[2,8],[3,5]]);

const allRuneChars = new Map(corpus.runes.map((r,i) => [r,i]));
/** @param {string[]} w @returns {number[]} */
const gp = w => w.flatMap(token => [...token].map(ch => {
  const v = allRuneChars.get(ch);
  assert.notEqual(v, undefined, 'source contains only canonical GP glyphs');
  return v;
}));
const original = corpus.pages.find(p => p.page === 33).indices;
assert.equal(original.length,214);
const black=original.slice(10,91).concat(original.slice(99));
assert.equal(black.length,196);
assert.deepEqual(gp(words),black,'49 exact hyphen-delimited word contents match original corpus');

const blocks = squares.trim().split(/\r?\n\s*\r?\n/);
assert.equal(blocks.length,3);
const matrix = blocks[1].trim().split(/\r?\n/).map(row =>
  row.trim().split(/\s+/).map(Number));
assert.deepEqual(matrix.map(row=>row.length),Array(7).fill(7));
for (const row of matrix) assert.equal(row.reduce((a,b)=>a+b,0),1033);
for (let k=0;k<7;k++) assert.equal(matrix.reduce((a,row)=>a+row[k],0),1033);
const sourceValues=matrix.flat();
assert.equal(sourceValues.length,49);
for(let i=0;i<49;i++)assert.equal(sourceValues[i],sourceValues[48-i]);
const keys=sourceValues.map(x=>x%29);

/** @param {number} value @returns {number} */
const mod=value=>(value%29+29)%29;
/** @param {number[][]} input @param {number} sign @returns {number[][]} */
function shift(input,sign){
  assert.equal(input.length,49);
  return input.map((part,i)=>part.map(v=>mod(v+sign*keys[i])));
}
/** @param {number[]} arr @returns {number} */
function ioc(arr){
  const counts=Array(29).fill(0);for(const x of arr)counts[x]++;
  return counts.reduce((s,x)=>s+x*(x-1),0)/(arr.length*(arr.length-1));
}
/** @param {number[]} arr @returns {string} */
const phrase=arr=>arr.map(v=>corpus.translit[v]).join('');
const parts=words.map(w=>gp([w]));
const widths=parts.map(w=>w.length);
const known=corpus.pages.find(p=>p.page===57).indices;
assert.equal(known.length,95);
const positive=[...Array(196)].map((_,i)=>known[i%known.length]);
let at=0;
const plant=widths.map(n=>{const q=positive.slice(at,at+n);at+=n;return q;});
assert.equal(at,196);
const concealed=shift(plant,-1);
assert.deepEqual(shift(concealed,+1),plant,'native source-positive 196/196');
assert.deepEqual(shift(shift(parts,+1),-1),parts,'source-original forward/reverse check');
const out=shift(parts,+1);
const lineRows=Array.from({length:7},(_,j)=>out.slice(7*j,7*j+7));
const rawIoc=ioc(black),decoded=out.flat(),newIoc=ioc(decoded);
const rowResults=lineRows.map((row,i)=>({
  row:i+1, sourceKey:matrix[i], printedWordLengths:widths.slice(7*i,7*i+7),
  gpWords:row.map(phrase),holdout:i===6,
}));
const originalText=Array.from({length:7},(_,i)=>words.slice(i*7,i*7+7).map(w=>phrase(gp([w]))));
const freq=Array(29).fill(0);for(const v of decoded)freq[v]++;
const mostFrequent=freq.map((n,i)=>({rune:corpus.translit[i],n})).sort((a,b)=>b.n-a.n).slice(0,6);
console.log('P33_STAGE10_WORD49_FIXED',JSON.stringify({
  status:'unselected candidate, source-shaped word shift; no plaintext claim',
  source:'p33 50.jpg, 2014 Stage7 7x7/1033, 2014 Stage04 positive GP29 shift',
  blackWordCounts:[21,28], blackRuneCount:black.length,
  squareCells:49, distinctSquareNumbers:new Set(sourceValues).size,
  magicHalfTurnSymmetry:true,
  directNumbersMatchSourceWordGPPowers:false,
  originalIoc:rawIoc, directWordShiftIoc:newIoc,
  positiveNativeRecovered:positive.length,
  histogramHead:mostFrequent,
  originalRows:originalText,
  decodedRows:rowResults,
},null,2));
