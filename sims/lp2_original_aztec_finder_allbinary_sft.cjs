'use strict';

// Standalone, source-complete original manuscript test for direct
// Aztec Rune 11x11 and compact Aztec 15x15 finder patterns.
// A stationary GP29->binary map is granted all 2^29 choices
// analytically; no English scoring, arbitrary guessed codebook,
// fitted origin, ciphertext alteration or barcode decoding.
/** @type {typeof import('node:assert/strict')} */
const assert=require('node:assert/strict');
const corpus=require('../resources/liber-primus/lp2-corpus.json');
const ink=require('../resources/liber-primus/lp2-ink-annotations.json');

/** @typedef {{symbol:number,bit:0|1,row:number,column:number}} FinderEvent */

/**
 * The central 9x9 finder in the 2008 Aztec spec has black rings of
 * Chebyshev radii 0,2,4, with light rings at 1,3.
 * @param {number[]} cells
 * @param {11|15} width
 * @returns {FinderEvent[]}
 */
function finderConstraints(cells,width){
  assert.equal(cells.length,width*width);
  const center=(width-1)/2;
  /** @type {FinderEvent[]} */
  const out=[];
  for(let row=center-4;row<=center+4;row++){
    for(let column=center-4;column<=center+4;column++){
      const r=Math.max(Math.abs(row-center),Math.abs(column-center));
      out.push({
        symbol:cells[row*width+column],
        bit:/** @type {0|1} */ (r%2===0?1:0),
        row,column
      });
    }
  }
  assert.equal(out.length,81);
  assert.equal(out.reduce((sum,x)=>sum+x.bit,0),49);
  return out;
}

/**
 * For a fixed input rune x and unspecified binary mapping b(x), the
 * exact minimum necessary mismatches is min(count_x0,count_x1).
 * These minima add because each of the 29 mapping bits is independent.
 * @param {FinderEvent[]} events
 */
function binaryMapOptimum(events){
  const counts=Array.from({length:29},()=>[0,0]);
  for(const {symbol,bit} of events)counts[symbol][bit]++;
  return {
    constraints:events.length,
    contradictedSymbols:counts.filter(pair=>pair[0]>0&&pair[1]>0).length,
    unavoidableMismatches:counts.reduce((sum,pair)=>sum+Math.min(...pair),0),
    conflictingRunes:counts.flatMap((pair,i)=>pair[0]&&pair[1]?[
      {rune:corpus.translit[i],mustBeLight:pair[0],mustBeDark:pair[1]}
    ]:[])
  };
}

const p32=corpus.pages.find(p=>p.page===32).indices;
assert.equal(p32.length,121);
const originalRed=ink.pages.flatMap(p=>(p.red_spans||[])
  .flatMap(span=>[...span.runes].map(r=>corpus.runes.indexOf(r))));
assert.equal(originalRed.length,225);
assert(originalRed.every(i=>i>=0&&i<29));
const p32Events=finderConstraints(p32,11);
const redEvents=finderConstraints(originalRed,15);
const result={
  p32:binaryMapOptimum(p32Events),
  red:binaryMapOptimum(redEvents),
  joint:binaryMapOptimum([...p32Events,...redEvents])
};
assert.deepEqual(
 [result.p32.contradictedSymbols,result.p32.unavoidableMismatches],
 [16,19]);
assert.deepEqual(
 [result.red.contradictedSymbols,result.red.unavoidableMismatches],
 [16,22]);
assert.deepEqual(
 [result.joint.contradictedSymbols,result.joint.unavoidableMismatches],
 [24,50]);

// Native 2-rune positive plant: paint every required finder module with
// F for dark and U for light. The all-secret inversion must accept.
const synthetic=p32.slice();
for(const e of p32Events)synthetic[e.row*11+e.column]=e.bit===1?0:1;
const positive=binaryMapOptimum(finderConstraints(synthetic,11));
assert.equal(positive.unavoidableMismatches,0);
assert.equal(positive.contradictedSymbols,0);
console.log(JSON.stringify({
 status:'PASS',
 source:'original GP29 p32 (121 cells), entire red ink (225 cells)',
 structures:'Aztec 11x11 Rune and compact 15x15 1-layer',
 assumedMapping:'one arbitrary stationary GP-rune-to-bit assignment',
 positivePlantExact:true,
 findings:result,
 newPlaintext:false,
 authenticatedBinaryCodec:false
},null,2));
