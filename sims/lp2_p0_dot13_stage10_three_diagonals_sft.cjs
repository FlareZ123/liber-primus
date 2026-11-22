"use strict";
/**
 * Test the physical 4|5|4 13-dot mark as three adjacent diagonals of each
 * original 2014 five-by-five square, rotated 45 degrees.
 *
 * Clue: the band |row-column|<=1 has exactly 13 cells in the original
 * nine staggered rows [1,2,1,2,1,2,1,2,1] of a standard dot13 marker.
 *
 * Original sources only, no fitted key/phase. Windows Node 22, CJS.
 * Run: node sims/lp2_p0_dot13_stage10_three_diagonals_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = x => fs.readFileSync(path.join(ROOT,x),"utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const mod = value => ((value % 29) + 29) % 29;
const CIPHER = corpus.pages.find(p=>p.page===0).indices.slice(0,13);
const CANDIDATE = [18,13,10,13,8,24,9,26,15,18,18,5,15]; // EPIPHANY SEECS
const RESIDUAL = CIPHER.map((v,i)=>mod(v-CANDIDATE[i]));
const RAW_CANDIDATE = [15,18,5,1,18,9,23,10,4,24,16,10,3]; // prior raw SECUENDI RATIO
const RAW_RESIDUAL = CIPHER.map((v,i)=>mod(v-RAW_CANDIDATE[i]));
assert.deepEqual(CIPHER,[15,8,18,3,6,19,27,0,15,26,18,21,5]);
assert.deepEqual(RESIDUAL,[26,24,8,19,27,24,18,3,0,8,0,16,19]);
assert.deepEqual(RAW_RESIDUAL,[0,19,13,2,17,10,4,19,11,2,2,11,2]);

/** @returns {number[][][]} */
function squares() {
  const blocks = read("resources/cicada2014-openpuff-magic-squares.txt")
    .replace(/\r/g,"").trim().split(/\n\s*\n/);
  const parsed = blocks.map(block=>block.trim().split("\n")
    .map(row=>row.trim().split(/\s+/).map(Number)));
  assert.deepEqual(parsed.map(x=>x.length),[5,7,5]);
  return parsed;
}

/**
 * Return the rotated 5x5 central band, physical red-dot layout.
 * The nine displayed rows have populations 1,2,1,2,1,2,1,2,1.
 * Original column order is left4 + center5 + right4.
 * @param {number[][]} matrix
 * @returns {{values:number[], dots:{row:number,column:number,value:number}[]}}
 */
function band(matrix) {
  assert.equal(matrix.length,5);
  const cells=[];
  for(const delta of [1,0,-1])for(let row=0;row<5;row++){
    const column=row-delta;
    if(column>=0&&column<5)cells.push({row,column,value:matrix[row][column]});
  }
  assert.deepEqual(
    [1,0,-1].map(delta=>cells.filter(x=>x.row-x.column===delta).length),
    [4,5,4]
  );
  // Under the 45-degree coordinate map (u=row+column,v=row-column),
  // display rows u=0..8 alternate one center dot and two flanking dots.
  const rows=Array(9).fill(0);
  for(const cell of cells) rows[cell.row+cell.column]++;
  assert.deepEqual(rows,[1,2,1,2,1,2,1,2,1]);
  return {values:cells.map(x=>x.value),dots:cells};
}
/** @param {number} n @returns {number} */
function phi(n) {
  let total=n,rem=n;
  for(let p=2;p*p<=rem;p++)if(rem%p===0){
    while(rem%p===0)rem/=p;
    total=total/p*(p-1);
  }
  if(rem>1)total=total/rem*(rem-1);
  return total;
}
function main() {
  const matrices=squares();
  const passes=[];
  for(const index of [0,2]){
    const m=matrices[index], {values,dots}=band(m);
    assert.equal(values.length,13);
    // Both source 2014 squares are centrally symmetric. Accordingly
    // any stationary secret f(number)->shift is forced to be palindromic
    // on this physically read 13-dot band.
    for(let i=0;i<13;i++)assert.equal(values[i],values[12-i],
      "source cell symmetry required");
    const differingPairs=Array.from({length:6},(_,i)=>({
      pair:[i,12-i],cipher:[CIPHER[i],CIPHER[12-i]],
      requiredShift:[RESIDUAL[i],RESIDUAL[12-i]],
      equal:RESIDUAL[i]===RESIDUAL[12-i]
    }));
    assert(differingPairs.every(x=>!x.equal));
    const rawDifferingPairs = Array.from({length:6},(_,i)=>
      RAW_RESIDUAL[i] !== RAW_RESIDUAL[12-i]);
    assert.equal(rawDifferingPairs.filter(Boolean).length,5);
    const direct=[];
    for(const op of ["number","totient"])for(const sign of [-1,1]){
      const key=values.map(x=>mod(op==="number"?x:phi(x)));
      const output=CIPHER.map((x,i)=>mod(x+sign*key[i]));
      assert.notDeepEqual(output,CANDIDATE);
      assert.notDeepEqual(output,RAW_CANDIDATE);
      const known=corpus.pages.find(p=>p.page===57).indices.slice(0,13);
      const plant=known.map((x,i)=>mod(x+key[i]));
      assert.deepEqual(plant.map((x,i)=>mod(x-key[i])),known);
      direct.push({op,sign,plaintextGP:output.map(x=>corpus.translit[x]).join("")});
    }
    passes.push({squareOrdinal:index===0?1:3,
      diagonalBandValues:values,sourceSymmetryPairs:6,
      incompatibleCandidatePairs:differingPairs.filter(x=>!x.equal).length,
      incompatibleRawSequendiRatioPairs:rawDifferingPairs.filter(Boolean).length,
      direct,syntheticPositive:"exact"});
  }
  console.log(JSON.stringify({status:"PASS",
    markerDotShape:[1,2,1,2,1,2,1,2,1],
    markerColumns:[4,5,4],
    conditionalCandidate:"EPIPHANY SEEKS (GP29 spelled EPIPHANY SEECS)",
    exactOriginalTitle:CIPHER,
    candidateResidual:RESIDUAL,
    secondConditionalCandidate:"SECUENDI RATIO in the one-rune-per-letter historic branch",
    secondResidual:RAW_RESIDUAL,
    results:passes,
    decision:"Both original 2014 5x5 central diagonal bands naturally model the 13-dot shape; however every stationary number-to-shift key from either band is palindromic, whereas the EPIPHANY SEEKS candidate requires six unequal mirror pairs and SECUENDI RATIO requires five. The direct additive source-number-to-shift decoder fails for both published conditional title candidates, including arbitrary stationary secret functions from square numeric values to GP29 shifts."
  },null,2));
}
if(require.main===module)main();
module.exports={band,squares,phi};
