'use strict';

/**
 * Source-selected verbatim plaintext-crib gate for terminal LP2 p54/p55.
 * Exact printed source 17-word length pattern must be present verbatim
 * in a native-GP donor if that donor is the plaintext and word boundaries
 * were preserved. This is a necessary-condition gate only.
 * Node.js 22, Windows 11, built-ins and repository fixtures.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encodeSourceNativeGP} = require('./lp2_native_gp_source_orthography_sft.cjs');
const root = path.join(__dirname, '..');
const read = (filename) => fs.readFileSync(path.join(root, filename), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const runeValue = new Map(corpus.runes.map((char, index) => [char, index]));
const words = [];
let word = [];
for (const glyph of read('resources/liber-primus/lp2-transcription.txt')
  .split('%').slice(0, 55).join('%')) {
  const value = runeValue.get(glyph);
  if (value !== undefined) word.push(value);
  else if (glyph === '%' || glyph === '/' || /\s/u.test(glyph)) {}
  else if (word.length) { words.push(word); word=[]; }
}
if(word.length) words.push(word);
assert.equal(words.length, 2896);
assert.equal(words.reduce((n,w)=>n+w.length,0),12956);
const lengths = words.slice(-17).map(w=>w.length);
assert.deepEqual(lengths,[11,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
const tail7 = lengths.slice(-7);
const sources = [
 'resources/control/emerson_essays_2944.txt',
 'resources/control/gibran_prophet_58585.txt',
 'resources/control/shakespeare_first300k.txt'
];
/** @param {number[]} sourceLengths @param {number[]} target */
function countMatches(sourceLengths,target){
 let count=0;
 for(let i=0;i+target.length<=sourceLengths.length;i++) {
  if(target.every((n,j)=>sourceLengths[i+j]===n)) count++;
 }
 return count;
}
const result = sources.map(filename=>{
 const ws=read(filename).match(/[A-Za-z]+/g)||[];
 const lens=ws.map(w=>encodeSourceNativeGP(w).length);
 return {filename,wordCount:ws.length,
  exact17:countMatches(lens,lengths),exactFinal7:countMatches(lens,tail7)};
});
assert.deepEqual(result.map(x=>x.wordCount),[77932,15733,55407]);
assert.deepEqual(result.map(x=>[x.exact17,x.exactFinal7]),[[0,0],[0,0],[0,0]]);
// Native solved LP1 source supplies a positive seven-word word-length case.
// This demonstrates that a true GP-native phrase would be detected.
const sample='THE TOTIENT FUNCTION IS SACRED ALL THINGS';
const sampleLengths=sample.split(' ').map(w=>encodeSourceNativeGP(w).length);
assert.deepEqual(sampleLengths,[2,7,7,2,6,3,3]);
assert.equal(countMatches(sampleLengths,tail7),1);
console.log(JSON.stringify({targetWholeWordRunes:86,targetWordLengths:lengths,
 final7Lengths:tail7,sourceSelectedEmersonWitness:'2014 first onion signed verse',
 corpusScans:result,positiveAuthenticLP1SevenWordPhrase:sample,
 positiveExactFinal7:1,unknownPlaintextRecovered:0,
 interpretation:'Original 86-rune terminal cannot be an intact verbatim 17-word quotation from the tested donor files with native GP spelling and unchanged printed word boundaries.'},null,2));
