'use strict';

/**
 * LP2 original 256-rune p8->p9 seam register versus original p50 32x8.
 * A source-conditioned direct decoding experiment; no plaintext recovered.
 *
 * Run on Windows with Node.js 22:
 *   node sims/lp2_p8_p9_seam256_p50_direct_receiver_sft.cjs
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
/** @param {string} filename */
const json = filename => JSON.parse(fs.readFileSync(path.join(root,filename),'utf8'));
const corpus = json('resources/liber-primus/lp2-corpus.json');
const grid = json('resources/liber-primus/lp2-grid-256.json');
const annotations = json('resources/liber-primus/lp2-ink-annotations.json');
const p8 = corpus.pages[8].indices;
const p9 = corpus.pages[9].indices;
const originalBytes = grid.bytes;
const red = annotations.pages.find(p => p.page===8).red_spans[0];
assert.equal(p8.length,255);
assert.deepEqual([red.start,red.length],[0,12]);
assert.equal(p8.slice(0,4).map(i=>corpus.translit[i]).join(''),'XIXM');
assert.deepEqual(p8.slice(4,12).map(i=>corpus.translit[i]),
  ['U','X','M','C','TH','P','O','B']);
assert.equal(originalBytes.length,256);
assert.equal(grid.tokens.length,256);
assert.equal(grid.tokens[0], '3N');

const transcription = fs.readFileSync(path.join(root,
  'resources/lp2-transcription.txt'),'utf8').split('%');
const glyphs = new Map(corpus.runes.map((glyph,i)=>[glyph,i]));
const fragments = page => page.split(/[-.&$§]/u)
  .map(segment => [...segment].filter(r=>glyphs.has(r)).map(r=>glyphs.get(r)))
  .filter(v=>v.length);
const p8Printed = fragments(transcription[8]);
const p9Printed = fragments(transcription[9]);
assert.equal(p8Printed.length,51);
assert.equal(p8Printed.at(-1).length,1);
assert.equal(p9Printed[0].length,5);
assert.deepEqual(p8Printed.at(-1),p8.slice(-1));
assert.deepEqual(p9Printed[0],p9.slice(0,5));
assert.equal(p8Printed.at(-1).concat(p9Printed[0]).length,6);
assert.ok(transcription[8].trimEnd().endsWith('/'));
const body = p8.slice(12).concat(p9.slice(0,5));
assert.equal(body.length,248); // 31 rows of 8 original rune indices
const firstRow = p8.slice(4,12);
assert.equal(firstRow.length,8);
const register = firstRow.concat(body);
assert.equal(register.length,256); // 32 source-shaped rows of 8
assert.deepEqual(register,p8.slice(4).concat(p9.slice(0,5)));

/** @param {number} v @param {number} n */
const mod=(v,n)=>((v%n)+n)%n;
/** @param {number[]} xs */
function indexOfCoincidence(xs){
  const counts = Array(29).fill(0);
  for(const v of xs){assert.ok(v>=0&&v<29);counts[v]++;}
  return counts.reduce((s,n)=>s+n*(n-1),0)/(xs.length*(xs.length-1));
}
const rowKey=originalBytes.slice();
const columnKey=originalBytes.map((_,i)=>originalBytes[(i%32)*8+Math.floor(i/32)]);
assert.equal(columnKey.length,256);
const originalIoC=indexOfCoincidence(register);

const runeInverseResults=[];
for(const [name,key] of [['source-row-major',rowKey],['source-column-major',columnKey]]){
  for(const sign of [-1,1]){
    const decoded=register.map((cipher,i)=>mod(cipher+sign*(key[i]%29),29));
    const ioc=indexOfCoincidence(decoded);
    assert.ok(ioc<0.045);
    // Validate the exact inverses on a genuinely nonuniform source-native
    // GP29 plant. This confirms the decoder can recover real language.
    const sample=Array.from({length:256},(_,i)=>corpus.pages[57].indices[i%95]);
    const encrypted=sample.map((symbol,i)=>mod(symbol-sign*(key[i]%29),29));
    assert.deepEqual(encrypted.map((v,i)=>mod(v+sign*(key[i]%29),29)),sample);
    runeInverseResults.push({
      tableOrientation:name,sign,originalIoC:ioc,
      originalPreview:decoded.slice(0,40).map(i=>corpus.translit[i]).join(' '),
      nativeGPPlant:'256/256'
    });
  }
}
/** @param {number[]} xs */
const byteSummary = xs => ({
  printableCount:xs.filter(v=>v>=32&&v<=126).length,
  asciiPreview:xs.slice(0,72).map(v=>v>=32&&v<=126?String.fromCharCode(v):'.').join('')
});
const bytes=[];
for(const [name,key] of [['source-row-major',rowKey],['source-column-major',columnKey]]){
  for(const [tag,values] of [
    ['xor-gp-index',register.map((r,i)=>r^key[i])],
    ['xor-gp-prime',register.map((r,i)=>corpus.prime[r]^key[i])],
    ['add-gp-index',register.map((r,i)=>mod(key[i]+r,256))],
    ['subtract-gp-index',register.map((r,i)=>mod(key[i]-r,256))],
    ['add-gp-prime',register.map((r,i)=>mod(key[i]+corpus.prime[r],256))],
    ['subtract-gp-prime',register.map((r,i)=>mod(key[i]-corpus.prime[r],256))]
  ]) {
    bytes.push({tableOrientation:name,receiver:tag,...byteSummary(values)});
  }
}
/**
 * Exact ascending coefficient GF29 remainder for a monic quadratic
 * X^2 + linear*X + constant, under high-degree-first printed order.
 * @param {number[]} values
 * @param {number} linear
 * @param {number} constant
 */
function remainder(values,linear,constant){
  let r0=0,r1=0;
  for(const symbol of values){
    const n0=mod(symbol-constant*r1,29);
    const n1=mod(r0-linear*r1,29);
    r0=n0;r1=n1;
  }
  return [r0,r1];
}
const H=remainder(register,18,11);
const G=remainder(register,10,25);
assert.deepEqual(H,[17,5]);
assert.deepEqual(G,[11,11]);
assert.equal(register.filter((symbol,i)=>symbol===originalBytes[i]%29).length,9);
console.log(JSON.stringify({
  premise:'Second p8 red word (8 runes) + black p8 body (243) + physically continued first p9 word tail (5) = 256 = 32x8',
  p8Header:'XIXM',
  sourceWordsOnPage8:48,
  pageLocalBlackFragments:49,
  p8ToP9ContinuedWordRunes:6,
  originalRegister:{runes:256,redRow8:8,blackBody248:248,ioc:originalIoC},
  firstPartyP50:{rows:32,columns:8,bytes:256},
  GP29DirectInverse:runeInverseResults,
  ASCIIByteCandidates:bytes,
  originalSharedH2013QuadraticRemainder:H,
  originalSharedP39QuadraticRemainder:G,
  exactDirectByteIndexMatches:9,
  recoveredPlaintext:false,
  interpretation:'Original source makes a precise 256-slot candidate, but no authored opcode matches it to p50. These fixed simple receivers yield no verifiable language.'
},null,2));
