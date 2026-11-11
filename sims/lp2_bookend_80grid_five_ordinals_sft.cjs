"use strict";
/**
 * Source-exact 81x81 -> 80x80 bookend/ordinal experiment.
 * Node.js 22, CommonJS, single-file SFT. No writes and no CI trigger.
 *
 * Hypothesis only: the first 6561 source runes constitute an 81x81 square.
 * Five printed Arabic ordinals, which are not runes in the canonical corpus,
 * can be placed in the trailing 6395 positions to complete an 80x80 square.
 * Test the 128 natural direct field29 masks induced by aligned square
 * crops, four adjacent 2x2 operations, 8 dihedral orientations, and 2 signs.
 * An exact inverse on a native literary plant is an implementation control.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const load = file => JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8"));
const corpus = load("resources/liber-primus/lp2-corpus.json");
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
const original = pages.flatMap(p => p.indices);
const MOD = 29, SIZE1 = 81, SIZE2 = 80, CUT = SIZE1 * SIZE1;
const mod = value => ((value % MOD) + MOD) % MOD;
assert.equal(original.length, 12956);
assert.equal(CUT, 6561);
assert.equal(original.length - CUT, 6395);
assert.deepEqual(original.slice(CUT - 6, CUT), [23,11,1,17,18,10]);
assert.deepEqual(original.slice(-6), [23,11,1,17,18,10]);

// Original JPEG numbered paragraphs on physical pp36-38; these numbers are
// nonrune artwork, and the starts are independently indexed in the existing
// seven-page source SFT. No source ciphertext optimization chose them.
const NUMBERED_STARTS = [8805, 8944, 9035, 9133, 9229, 9358];
assert.deepEqual(NUMBERED_STARTS.slice(1).map((x,i) => x-NUMBERED_STARTS[i]),
  [139,91,98,96,129]);
const numberedPositions = NUMBERED_STARTS.slice(0,-1)
  .map((offset,i) => offset - CUT + i);
assert.deepEqual(numberedPositions, [2244,2384,2476,2575,2672]);
const marked = new Set(numberedPositions);
const first = original.slice(0,CUT);
const second = original.slice(CUT);
for (let i=0; i<5; i++) second.splice(numberedPositions[i],0,i+1);
assert.equal(second.length, 6400);
const firstAt = (x,y) => {
  assert(x>=0 && x<81 && y>=0 && y<81);
  return first[y*81+x];
};
const top12 = values => {
  const counts = Array(29).fill(0);
  for(const value of values) counts[value]++;
  counts.sort((a,b)=>b-a);
  return counts.slice(0,12).reduce((a,b)=>a+b,0);
};
const ioc = values => {
  const counts = Array(29).fill(0);
  for(const value of values) counts[value]++;
  return counts.reduce((a,b)=>a+b*(b-1),0)/(values.length*(values.length-1));
};
/** @typedef {"crop"|"mixed"|"det"|"dx"|"dy"} Kind */
/** @typedef {{kind:Kind,x0:number,y0:number,d:number,sign:number}} Variant */
/** @param {Variant} variant @returns {number[]} */
function pad(variant) {
  const key = Array(6400);
  for(let pos=0;pos<6400;pos++) {
    const x=pos%80, y=Math.floor(pos/80);
    const xx=(variant.d&1)?79-x:x, yy=(variant.d&2)?79-y:y;
    const a=(variant.d&4)?yy:xx, b=(variant.d&4)?xx:yy;
    const a00=firstAt(a+variant.x0,b+variant.y0);
    let v=a00;
    if(variant.kind!=="crop") {
      const a10=firstAt(a+1,b), a01=firstAt(a,b+1);
      const a11=firstAt(a+1,b+1);
      if(variant.kind==="mixed") v=a00-a10-a01+a11;
      else if(variant.kind==="det") v=a00*a11-a10*a01;
      else if(variant.kind==="dx") v=a00-a10;
      else v=a00-a01;
    }
    key[pos]=mod(v);
  }
  return key;
}
/** @param {number[]} source @param {number[]} key @param {number} sign */
function decode(source,key,sign) {
  const out=[];
  for(let i=0;i<6400;i++)if(!marked.has(i))
    out.push(mod(source[i]+sign*key[i]));
  assert.equal(out.length,6395);
  return out;
}
/** @param {number[]} native @param {number[]} key @param {number} sign */
function encryptPlant(native,key,sign) {
  const out=second.slice();
  let j=0;
  for(let i=0;i<6400;i++)if(!marked.has(i))
    out[i]=mod(native[j++]-sign*key[i]);
  assert.equal(j,6395);
  return out;
}
/** @param {string} input @returns {number[]} */
function gpEncode(input) {
  const mapping=new Map(corpus.translit.map((name,i)=>[name,i]));
  const output=[];
  for(let word of input.toUpperCase().match(/[A-Z]+/g) || []) {
    word=word.replace(/QU/g,"CW").replace(/V/g,"U")
      .replace(/K/g,"C").replace(/Z/g,"S");
    for(let i=0;i<word.length;) {
      const two=word.slice(i,i+2);
      if(mapping.has(two)){output.push(mapping.get(two));i+=2;}
      else {
        const glyph=mapping.get(word[i]);
        if(glyph!==undefined) output.push(glyph);
        i++;
      }
    }
  }
  return output;
}
const book=fs.readFileSync(
  path.join(ROOT,"resources/control/gibran_prophet_58585.txt"),"utf8");
const literature=gpEncode(book);
assert(literature.length>=60000);
const native=literature.slice(0,6395);
const windows=[];
for(let start=0;start+6395<=literature.length;start+=3197)
  windows.push(top12(literature.slice(start,start+6395)));
assert.equal(windows.length,18);
assert.equal(Math.min(...windows),4881);
const variants=[];
for(const kind of ["crop","mixed","det","dx","dy"])
for(let x0=0;x0<=(kind==="crop"?1:0);x0++)
for(let y0=0;y0<=(kind==="crop"?1:0);y0++)
for(let d=0;d<8;d++)for(const sign of [-1,1])
  variants.push({kind,x0,y0,d,sign});
assert.equal(variants.length,128);
const scored=[];
for(const variant of variants) {
  const key=pad(variant);
  const decoded=decode(second,key,variant.sign);
  assert.deepEqual(decode(encryptPlant(native,key,variant.sign),key,variant.sign),native);
  scored.push({ ...variant, top12:top12(decoded), ioc:ioc(decoded) });
}
scored.sort((a,b)=>b.top12-a.top12);
assert.equal(scored[0].top12,2863);
const strongestIoc=Math.max(...scored.map(x=>x.ioc));
assert(Math.abs(strongestIoc-0.03458603073688855)<1e-13);
assert(scored.every(x=>x.top12<4881));
console.log(JSON.stringify({
  source:{firstRunes:6561,remainingRunes:6395,ordinalPositions:numberedPositions,
    fullSecondSquare:6400,originalDoubletPhrase:original.slice(-6)},
  originalVariants:scored.length,top12Best:scored[0],
  iocBest:strongestIoc, nativeLiteraryWindows:windows.length,
  nativeTop12Minimum:Math.min(...windows),
  sourceNativeExactReencryptions:scored.length,
  recoveredNewLP2Plaintext:false
},null,2));
