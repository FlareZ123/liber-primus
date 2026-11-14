'use strict';

// Standalone, source-complete original manuscript test for direct
// Aztec Rune 11x11 and compact Aztec 15/27x15/27 finder patterns.
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
 * @param {11|15|27} width
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

const opening=corpus.pages.slice(0,3).flatMap(p=>p.indices);
assert.equal(opening.length,729);
const openingEvents=finderConstraints(opening,27);

/**
 * Micro QR M1/M3 has one 7x7 concentric dark/white/dark finder
 * at a symbol corner. Try all four corners to grant all rotations
 * and reflections. The dark center is 3x3 (radius<=1).
 * @param {number[]} cells
 * @param {11|15} width
 * @param {number} top
 * @param {number} left
 * @returns {FinderEvent[]}
 */
function microQrFinder(cells,width,top,left){
  assert.equal(cells.length,width*width);
  /** @type {FinderEvent[]} */
  const events=[];
  for(let row=0;row<7;row++)for(let column=0;column<7;column++){
    const radius=Math.max(Math.abs(row-3),Math.abs(column-3));
    events.push({
      symbol:cells[(top+row)*width+left+column],
      bit:/** @type {0|1} */ (radius===3||radius<=1?1:0),
      row:top+row,column:left+column
    });
  }
  assert.equal(events.length,49);
  return events;
}

/**
 * @param {number[]} source
 * @param {11|15} size
 */
function microQrCornerOptima(source,size){
  const out=[];
  for(const row of [0,size-7])for(const column of [0,size-7]){
    const metrics=binaryMapOptimum(microQrFinder(source,size,row,column));
    out.push({row,column,minimumErrors:metrics.unavoidableMismatches,
      conflicted:metrics.contradictedSymbols});
  }
  return out;
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
  opening:binaryMapOptimum(openingEvents),
  p32:binaryMapOptimum(p32Events),
  red:binaryMapOptimum(redEvents),
  joint:binaryMapOptimum([...openingEvents,...p32Events,...redEvents])
};
const microQrP32=microQrCornerOptima(p32,11);
const microQrRed=microQrCornerOptima(originalRed,15);
assert.deepEqual(microQrP32.map(x=>x.minimumErrors),[9,9,7,12]);
assert.deepEqual(microQrRed.map(x=>x.minimumErrors),[8,8,11,7]);
assert.deepEqual(
 [result.opening.contradictedSymbols,result.opening.unavoidableMismatches],
 [20,24]);
assert.deepEqual(
 [result.p32.contradictedSymbols,result.p32.unavoidableMismatches],
 [16,19]);
assert.deepEqual(
 [result.red.contradictedSymbols,result.red.unavoidableMismatches],
 [16,22]);
assert.deepEqual(
 [result.joint.contradictedSymbols,result.joint.unavoidableMismatches],
 [27,86]);

// Native 2-rune positive plant: paint every required finder module with
// F for dark and U for light. The all-secret inversion must accept.
const synthetic=p32.slice();
for(const e of p32Events)synthetic[e.row*11+e.column]=e.bit===1?0:1;
const positive=binaryMapOptimum(finderConstraints(synthetic,11));
assert.equal(positive.unavoidableMismatches,0);
assert.equal(positive.contradictedSymbols,0);
console.log(JSON.stringify({
 status:'PASS',
 source:'original GP29 opening p0-2 (729 cells), p32 (121 cells), entire red ink (225 cells)',
 structures:'Aztec 11x11 Rune, compact 15x15 1-layer, compact 27x27 4-layer',
 assumedMapping:'one arbitrary stationary GP-rune-to-bit assignment',
 positivePlantExact:true,
 findings:result,
 microQrFinderOverAllFourCorners:{p32:microQrP32,red225:microQrRed},
 newPlaintext:false,
 authenticatedBinaryCodec:false
},null,2));
