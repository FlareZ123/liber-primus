'use strict';
/**
 * LP2 p57 13-dot/PARABLE7 -> p49–51 rim bytes LP3lRA# -> RC4 keyed
 * table interior (30x6, 180 bytes) with independent solved p56+p57 holdout.
 *
 * This is a finite test of a possible standard typed receiver, not a claim
 * that Cicada selected RC4, the p50 shell or an original LP1 page pointer.
 * Exact source and 2014 RC4 known vector; no candidate plaintext fitting.
 * Windows/Node.js 22 CommonJS, read-only, no third-party dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
/** @param {string} pathName @returns {any} */
const read = pathName => JSON.parse(fs.readFileSync(
  path.join(root,pathName),'utf8'));
const grid=read('resources/liber-primus/lp2-grid-256.json');
const corpus=read('resources/liber-primus/lp2-corpus.json');
const ink=read('resources/liber-primus/lp2-ink-annotations.json');
const rows=grid.pages.flatMap(p=>p.tokens),digits59=grid.alphabet.replace('f','');
const p57=ink.pages.find(p=>p.page===57);
assert.deepEqual(p57.large_punctuation,[[7,13,'red'],[95,23,'red']]);
assert.deepEqual(p57.red_spans.map(x=>x.length),[7]);
assert.equal(rows.length,256);
assert.equal(grid.bytes.length,256);
assert.equal(grid.alphabet.length,60);
assert.equal(digits59.length,59);
assert.ok(rows.every(t=>t.length===2));
assert.equal(corpus.pages[55].indices.length,76);
assert.equal(corpus.pages[56].indices.length,85);
assert.equal(corpus.pages[57].indices.length,95);
const targets=corpus.pages[56].indices.concat(corpus.pages[57].indices);
assert.equal(targets.length,180);

const border=[];
for(let x=0;x<8;x++)border.push(x);
for(let y=1;y<32;y++)border.push(8*y+7);
for(let x=6;x>=0;x--)border.push(31*8+x);
for(let y=30;y>=1;y--)border.push(8*y);
assert.equal(border.length,76);
const start=p57.large_punctuation[0][1]-1;
const length=p57.red_spans[0].length;
const key=border.slice(start,start+length).map(index=>grid.bytes[index]);
assert.equal(String.fromCharCode(...key),'LP3lRA#');
assert.deepEqual(key,[76,80,51,108,82,65,35]);
const inside=[];
for(let y=1;y<31;y++)for(let x=1;x<7;x++)inside.push(8*y+x);
assert.equal(inside.length,180);
assert.equal(new Set(inside).size,180);
assert.ok(inside.every(i=>!border.includes(i)));
/** @param {number[]} keyBytes @param {number} length @returns {number[]} */
function rc4(keyBytes,length){
  assert(keyBytes.length>0&&keyBytes.length<=256);
  const permutation=Array.from({length:256},(_,i)=>i);
  let j=0;
  for(let i=0;i<256;i++){
    j=(j+permutation[i]+keyBytes[i%keyBytes.length])&255;
    [permutation[i],permutation[j]]=[permutation[j],permutation[i]];
  }
  let i=0;j=0;
  const out=[];
  for(let k=0;k<length;k++){
    i=(i+1)&255;
    j=(j+permutation[i])&255;
    [permutation[i],permutation[j]]=[permutation[j],permutation[i]];
    out.push(permutation[(permutation[i]+permutation[j])&255]);
  }
  return out;
}
assert.equal(rc4([...('Key')].map(x=>x.charCodeAt(0)),9)
  .map(x=>x.toString(16).padStart(2,'0')).join(''),'eb9f7781b734ca72a7');
/** @param {number} n @returns {number} */
const mod29=n=>((n%29)+29)%29;
/** @param {string} token @returns {number} */
function decode59(token){
  const h=digits59.indexOf(token[0]),l=digits59.indexOf(token[1]);
  assert(h>=0&&l>=0);
  return h*59+l;
}
const stream=rc4(key,180);
const outputs=[];
for(const radix of [60,59]){
  const cells=inside.map(i=>radix===60?grid.bytes[i]:decode59(rows[i]));
  for(const operator of ['xor','minus-gp29','plus-gp29']){
    const decoded=cells.map((value,i)=>
      operator==='xor' ? value^stream[i] :
        mod29(value + (operator==='minus-gp29'?-1:1)*stream[i]));
    const recovered=decoded.map((value,i)=>
      operator==='xor' ? value^stream[i] :
        mod29(value + (operator==='minus-gp29'?1:-1)*stream[i]));
    if(operator==='xor')assert.deepEqual(recovered,cells);
    else assert.deepEqual(recovered,cells.map(mod29));
    const check={
      radix,operator,
      fullKnown180:decoded.filter((v,i)=>v===targets[i]).length,
      clearP57Known95:decoded.slice(85).filter((v,i)=>
        v===corpus.pages[57].indices[i]).length,
      inNativeGP29Range:decoded.filter(v=>v>=0&&v<29).length,
      first24:decoded.slice(0,24)
    };
    outputs.push(check);
    assert(check.fullKnown180<=8);
    assert(check.clearP57Known95<=6);
  }
}
// Independently authenticated 95-rune plaintext donor is recoverable if
// genuinely encrypted with this stream under the declared arithmetic.
const positive=corpus.pages[57].indices;
const cipherPlant=positive.map((p,i)=>mod29(p+stream[i]));
assert.deepEqual(cipherPlant.map((v,i)=>mod29(v-stream[i])),positive);
console.log(JSON.stringify({
  source:'LP2 13-dot+PARABLE7 selects unchanged LP3lRA# from p50 rim',
  sourceCount:{tableCells:256,outerCells:border.length,innerCells:inside.length,
    knownP56:85,clearP57:95},
  standardRC4KnownVector:'Key -> eb9f7781b734ca72a7',
  positivePlantedGP29:'95/95',
  frozenSixOriginalTests:outputs,
  verdict:'No direct source-typed RC4 consumer for inner180 bytes with p56/57 known GP29 receiver; no key or plaintext recovered.'
},null,2));
