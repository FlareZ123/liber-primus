"use strict";

/**
 * SFT: global original-ciphertext checksums for the conditional p0-p2 route
 * through THEN (first 17 proposed blocks).
 *
 * Coordinates are frozen from the current documented route. Rune values are
 * always read from the canonical p0-p2 corpus in this repository.
 *
 * Run: node sims/lp2_p0_first17_global_ciphertext_checksums_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(
  path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"
));
const grid=corpus.pages.filter(page=>page.page<=2).flatMap(page=>page.indices);
assert.equal(grid.length,729);

const blocks=[
  [[13,25],[13,26],[13,27],[14,1],[14,2],[14,3],[14,4]],
  [[14,14],[14,15],[14,16],[14,17],[14,18]],
  [[14,19],[13,19],[12,19],[11,19],[10,19]],
  [[14,7],[13,7],[12,7],[11,7]],
  [[26,19],[26,18],[26,17],[26,16]],
  [[19,16],[18,16],[17,16]],
  [[11,16],[12,17],[13,18],[14,19],[15,20]],
  [[15,20],[16,19],[17,18]],
  [[18,15],[18,16]],
  [[19,17],[19,16]],
  [[19,23],[20,23],[21,23]],
  [[21,9],[21,10]],
  [[26,3],[26,2],[26,1]],
  [[25,16],[26,15],[27,14]],
  [[27,18],[26,17],[25,16]],
  [[25,16],[25,17],[25,18],[25,19]],
  [[25,25],[25,26],[25,27]]
];

/** @param {[number,number]} cell */
function indexAt(cell){
  const [row,column]=cell;
  assert(row>=1&&row<=27&&column>=1&&column<=27);
  return grid[(row-1)*27+column-1];
}

/** @param {[number,number]} cell */
function absolutePosition(cell){
  return 27*(cell[0]-1)+cell[1];
}

/** @param {[number,number][]} cells */
function gpSum(cells){
  return cells.reduce((sum,cell)=>sum+corpus.prime[indexAt(cell)],0);
}

/** @param {[number,number][]} cells */
function uniqueCells(cells){
  return [...new Map(cells.map(cell=>[cell.join(","),cell])).values()];
}

/** @param {number} n */
function nthPrime(n){
  let count=0;
  let value=1;
  while(count<n){
    value++;
    let prime=true;
    for(let divisor=2;divisor*divisor<=value;divisor++){
      if(value%divisor===0){
        prime=false;
        break;
      }
    }
    if(prime)count++;
  }
  return value;
}

const uses=blocks.flat();
const distinct=uniqueCells(uses);

assert.equal(uses.length,61);
assert.equal(distinct.length,54);
assert.equal(gpSum(uses),3274);
assert.equal(gpSum(uses)+27,3301);

const uniqueGp=gpSum(distinct);
const uniquePositionSum=distinct.reduce(
  (sum,cell)=>sum+absolutePosition(cell),0
);
assert.equal(uniqueGp,2867);
assert.equal(uniquePositionSum,26083);
assert.equal(nthPrime(uniqueGp),uniquePositionSum);

const symmetries=[
  ([r,c])=>[r,c],
  ([r,c])=>[c,28-r],
  ([r,c])=>[28-r,28-c],
  ([r,c])=>[28-c,r],
  ([r,c])=>[r,28-c],
  ([r,c])=>[28-r,c],
  ([r,c])=>[c,r],
  ([r,c])=>[28-c,28-r]
];
const symmetryPositionSums=symmetries.map(transform=>
  distinct.reduce((sum,cell)=>sum+absolutePosition(transform(cell)),0)
);
assert.deepEqual(symmetryPositionSums,[
  26083,21691,13337,17729,25919,13501,22157,17263
]);
assert.equal(symmetryPositionSums.filter(value=>value===26083).length,1);

const alternateBlocks=blocks.map(block=>block.map(cell=>[...cell]));
alternateBlocks[15]=[[27,24],[27,25],[27,26],[27,27]];
const alternateUses=alternateBlocks.flat();
const alternateDistinct=uniqueCells(alternateUses);
const alternateUniqueGp=gpSum(alternateDistinct);
const alternatePositionSum=alternateDistinct.reduce(
  (sum,cell)=>sum+absolutePosition(cell),0
);

assert.equal(alternateUses.length,61);
assert.equal(alternateDistinct.length,55);
assert.equal(gpSum(alternateUses),3214);
assert.equal(gpSum(alternateUses)+27,3241);
assert.equal(alternateUniqueGp,2854);
assert.equal(alternatePositionSum,26995);
assert.equal(nthPrime(alternateUniqueGp),25939);
assert.notEqual(nthPrime(alternateUniqueGp),alternatePositionSum);

console.log(JSON.stringify({
  status:"PASS: first17 route reproduces both global ciphertext checksums",
  mainRoute:{
    ciphertextCellUses:uses.length,
    distinctCells:distinct.length,
    gpAllUses:gpSum(uses),
    gpAllUsesPlusMatrixSide:gpSum(uses)+27,
    gpDistinct:uniqueGp,
    absolutePositionDistinct:uniquePositionSum,
    primeIndexedPosition:{
      primeOrdinal:uniqueGp,
      prime:nthPrime(uniqueGp)
    },
    d4AbsolutePositionSums:symmetryPositionSums
  },
  alternateSoon:{
    ciphertextCellUses:alternateUses.length,
    distinctCells:alternateDistinct.length,
    gpAllUses:gpSum(alternateUses),
    gpAllUsesPlusMatrixSide:gpSum(alternateUses)+27,
    gpDistinct:alternateUniqueGp,
    absolutePositionDistinct:alternatePositionSum,
    primeOfGpDistinct:nthPrime(alternateUniqueGp)
  },
  decision:"Both identities are exact original-ciphertext/coordinate properties of the conditional main route. They distinguish the documented alternate SOON route, but were recognized after route construction and therefore remain route-level corroboration rather than an independently selected decryption."
},null,2));
