"use strict";

const assert=require("node:assert/strict");

/** @param {number} x @returns {number} */
function mod29(x){return((x%29)+29)%29;}

const T=[24,16,14,17,19,6,27,15,17,14,12];
const D=[9,13,15,8,20,1,2,13,12,20,6];
const sigma=T.map((value,index)=>mod29(value+D[index]));
const arities=[3,4,2,5,4,4,6,5,4,6,7];
const tapes=[
 ["T",T],
 ["D",D],
 ["sigma",sigma],
 ["T-D",T.map((value,index)=>mod29(value-D[index]))],
];

// Published corridor subtraction keys for p32..p42, including prepared
// deletion receivers on p36/p41/p42. These target-derived values appear only
// in this post-freeze grader, never in the source-only generator commit.
const targetKeys=[
 [3,0,1],
 [25,5,26,2],
 [24,5],
 [19,14,18,15,17],
 [25,19,27,26],
 [12,1,1,22],
 [20,7,7,7,13,4],
 [19,12,19,2,5],
 [20,20,12,6],
 [26,23,1,7,13,22],
 [7,1,12,23,13,2,18],
];
assert.deepEqual(targetKeys.map((key)=>mod29(key.reduce((a,b)=>a+b,0))),sigma);
assert.equal(targetKeys.flat().length,50);

const grades=[];
for(const [tapeName,tape] of tapes){
 for(let phase=0;phase<T.length;phase+=1){
  for(const direction of [1,-1]){
   for(const sign of [1,-1]){
    const keys=[];
    for(let lane=0;lane<arities.length;lane+=1){
     const length=arities[lane];
     const prefix=[];
     for(let j=0;j<length-1;j+=1){
      const tapeIndex=((lane+phase+direction*j)%T.length+T.length)%T.length;
      prefix.push(mod29(sign*tape[tapeIndex]));
     }
     const final=mod29(sigma[lane]-prefix.reduce((a,b)=>a+b,0));
     keys.push(prefix.concat(final));
    }
    let coordinateMatches=0;
    let exactKeys=0;
    for(let lane=0;lane<keys.length;lane+=1){
     if(keys[lane].every((value,index)=>value===targetKeys[lane][index]))exactKeys+=1;
     for(let j=0;j<keys[lane].length;j+=1)if(keys[lane][j]===targetKeys[lane][j])coordinateMatches+=1;
    }
    grades.push({tape:tapeName,phase,direction,sign,coordinateMatches,exactKeys,keys});
   }
  }
 }
}
assert.equal(grades.length,176);
assert.equal(grades.filter((row)=>row.exactKeys===11).length,0);
assert.equal(Math.max(...grades.map((row)=>row.exactKeys)),1);
assert.equal(Math.max(...grades.map((row)=>row.coordinateMatches)),7);
assert.equal(grades.filter((row)=>row.exactKeys>0).length,8);

const coordinateHistogram={};
const exactKeyHistogram={};
for(const row of grades){
 coordinateHistogram[row.coordinateMatches]=(coordinateHistogram[row.coordinateMatches]||0)+1;
 exactKeyHistogram[row.exactKeys]=(exactKeyHistogram[row.exactKeys]||0)+1;
}
assert.deepEqual(coordinateHistogram,{"0":29,"1":52,"2":50,"3":22,"4":15,"5":5,"6":2,"7":1});
assert.deepEqual(exactKeyHistogram,{"0":168,"1":8});

const best=grades.filter((row)=>row.coordinateMatches===7);
assert.equal(best.length,1);
assert.deepEqual({
 tape:best[0].tape,phase:best[0].phase,direction:best[0].direction,sign:best[0].sign,
 exactKeys:best[0].exactKeys
},{tape:"D",phase:2,direction:-1,sign:1,exactKeys:0});

console.log(JSON.stringify({
 status:"PASS",
 frozenFamilyCommit:"8d0d98415d705c51feedeb3ac63bab0c4e1f53f2",
 candidateCount:grades.length,
 fullCorridorMatches:0,
 maxExactKeys:Math.max(...grades.map((row)=>row.exactKeys)),
 candidatesWithAnyExactKey:grades.filter((row)=>row.exactKeys>0).length,
 maxCoordinateMatches:Math.max(...grades.map((row)=>row.coordinateMatches)),
 totalCoordinates:50,
 coordinateHistogram,
 exactKeyHistogram,
 bestCoordinateRule:{
  tape:best[0].tape,phase:best[0].phase,direction:best[0].direction,sign:best[0].sign,
  coordinateMatches:best[0].coordinateMatches,exactKeys:best[0].exactKeys,
 },
},null,2));
