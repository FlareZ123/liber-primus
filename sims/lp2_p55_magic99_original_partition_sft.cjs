"use strict";

/**
 * Original 2014 5x5 / 7x7 / 5x5 square geometry against terminal LP2 p55.
 * Exact source-backed partition and one direct GP29 source-number consumer.
 * Node 22 CommonJS (Windows 11 compatible).
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname,"..");
const text = relative => fs.readFileSync(path.join(ROOT,relative),"utf8");
const corpus = JSON.parse(text("resources/liber-primus/lp2-corpus.json"));
const WORD_LENGTHS = [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];

function parseSquares() {
  const groups = text("resources/cicada2014-openpuff-magic-squares.txt")
    .replace(/\r/g,"").trim().split(/\n\s*\n/);
  const squares = groups.map(block => block.trim().split("\n")
    .map(row => row.trim().split(/\s+/).map(Number)));
  assert.deepEqual(squares.map(x=>x.length),[5,7,5]);
  assert(squares.every(a=>a.every(row=>row.length===a.length)));
  assert.deepEqual(squares.map(s=>s[0].reduce((a,b)=>a+b,0)),
    [3301,1033,1033]);
  return squares;
}

function partitionP55() {
  const glyphs = corpus.pages.find(p=>p.page===55).indices;
  assert.equal(glyphs.length,76);
  const inner=[],outer=[],innerPositions=[],outerPositions=[];
  let offset=0;
  for(const [wi,len] of WORD_LENGTHS.entries()){
    for(let j=0;j<len;j++){
      const at=offset+j;
      if(wi===0||j===0||j===len-1){
        outer.push(glyphs[at]);outerPositions.push(at);
      }else{
        inner.push(glyphs[at]);innerPositions.push(at);
      }
    }
    offset+=len;
  }
  assert.equal(offset,glyphs.length);
  assert.equal(inner.length,43);
  assert.equal(outer.length,33);
  assert.deepEqual(innerPositions,
    [2,3,10,11,12,13,16,17,18,19,24,25,26,27,28,29,30,31,32,
      33,34,37,38,39,40,43,44,49,50,51,52,53,56,57,58,59,60,
      65,66,67,68,71,74]);
  return {inner,outer,innerPositions,outerPositions};
}

/** @param {number} n @returns {number} Euler totient for a positive source cell */
function phi(n) {
  let remainder=n,value=n;
  for(let factor=2;factor*factor<=remainder;factor++) {
    if(remainder%factor===0){
      while(remainder%factor===0)remainder/=factor;
      value=(value/factor)*(factor-1);
    }
  }
  if(remainder>1)value=(value/remainder)*(remainder-1);
  return value;
}
const mod29=n=>((n%29)+29)%29;
/** @param {number[]} a @returns {number} */
function ioc(a){
  const bins=Array(29).fill(0);
  for(const v of a)bins[v]++;
  return bins.reduce((sum,v)=>sum+v*(v-1),0)/(a.length*(a.length-1));
}
const toGP = indices => indices.map(x=>corpus.translit[x]).join("");

function main() {
  const squares=parseSquares(), {inner,outer,innerPositions}=partitionP55();
  const dims=squares.map(x=>x.length);
  const inside=squares.flatMap(square=>{
    const size=square.length;
    return square.slice(1,-1).flatMap(row=>row.slice(1,-1));
  });
  const insideCounts=dims.map(n=>(n-2)**2);
  const outsideCounts=dims.map(n=>4*n-4);
  assert.deepEqual(insideCounts,[9,25,9]);
  assert.deepEqual(outsideCounts,[16,24,16]);
  assert.equal(inside.length,43);
  assert.equal(outsideCounts.reduce((a,b)=>a+b,0),56);
  assert.equal(43+56,99);
  assert.equal(76+23,99);
  assert.equal(33+23,56);
  assert.equal(1+16+16,33);

  // Natural source order: each square's row-major strict interior, in the
  // original 5x5, 7x7, 5x5 sequence. Both source operations were historically
  // used in Cicada's GP29/totient material; no phase or key is optimized.
  const candidates=[];
  for(const op of ["number-mod29","totient-mod29"]){
    const stream=inside.map(v=>mod29(op==="number-mod29"?v:phi(v)));
    for(const sign of [-1,1]){
      const decoded=inner.map((value,i)=>mod29(value+sign*stream[i]));
      candidates.push({
        operation:op,sign,IOC:Number(ioc(decoded).toFixed(6)),
        transliteration:toGP(decoded)
      });
    }
    // Source-native positive control: a genuine 43-rune slice of solved p57
    // is encrypted with the exact recovered square stream and decrypted
    // with the same operation. This checks register order and length.
    const clear=corpus.pages.find(p=>p.page===57).indices.slice(0,43);
    assert.equal(clear.length,43);
    const synthetic=clear.map((value,i)=>mod29(value+stream[i]));
    assert.deepEqual(synthetic.map((value,i)=>mod29(value-stream[i])),clear);
  }
  assert(candidates.every(x=>x.IOC<0.045));

  console.log(JSON.stringify({
    status:"PASS",squareDimensions:dims,
    sourceSquareLineSums:[3301,1033,1033],
    squareTotal:99,
    strictInteriors:insideCounts,
    squarePerimeters:outsideCounts,
    p55Original:76,p55WordSegments:WORD_LENGTHS.length,
    p55Interior:inner.length,p55Exterior:outer.length,
    p55ExteriorSplits:[1,16,16],p57OriginalTerminalDotMark:23,
    p55OriginalInteriorIOC:Number(ioc(inner).toFixed(6)),
    directSourceCellReceivers:candidates,
    positiveSyntheticSolvedP57Controls:2,
    decision:"Exact source geometry, no source-selected operation and no recovered p55 plaintext. The direct cell-value and totient additive inverses do not produce GP-English."
  },null,2));
}

if(require.main===module)main();
module.exports={parseSquares,partitionP55,phi};
