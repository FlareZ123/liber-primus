"use strict";

const assert=require("node:assert/strict");

/** @param {number} x @returns {number} */
function mod29(x){return((x%29)+29)%29;}

const T=[24,16,14,17,19,6,27,15,17,14,12];
// Agent44's p6-only companion, derived from the established state packet.
const D=[9,13,15,8,20,1,2,13,12,20,6];
const sigma=T.map((value,index)=>mod29(value+D[index]));
assert.deepEqual(sigma,[4,0,0,25,10,7,0,28,0,5,18]);

// Target-blind prepared receiver arities for p32..p42. These lengths are
// structural inputs; no authenticated target rune values are loaded here.
const arities=[3,4,2,5,4,4,6,5,4,6,7];
assert.equal(arities.reduce((a,b)=>a+b,0),50);

const tapes=[
  ["T",T],
  ["D",D],
  ["sigma",sigma],
  ["T-D",T.map((value,index)=>mod29(value-D[index]))],
];

const candidates=[];
for(const [tapeName,tape] of tapes){
  for(let phase=0;phase<T.length;phase+=1){
    for(const direction of [1,-1]){
      for(const sign of [1,-1]){
        const keys=[];
        for(let lane=0;lane<arities.length;lane+=1){
          const length=arities[lane];
          const prefix=[];
          for(let j=0;j<length-1;j+=1){
            const index=mod29(0); // keep modulo arithmetic explicit below
            void index;
            const tapeIndex=((lane+phase+direction*j)%T.length+T.length)%T.length;
            prefix.push(mod29(sign*tape[tapeIndex]));
          }
          const final=mod29(sigma[lane]-prefix.reduce((a,b)=>a+b,0));
          const key=prefix.concat(final);
          assert.equal(mod29(key.reduce((a,b)=>a+b,0)),sigma[lane]);
          keys.push(key);
        }
        candidates.push({tape:tapeName,phase,direction,sign,keys});
      }
    }
  }
}

assert.equal(candidates.length,176);
assert.equal(new Set(candidates.map((row)=>row.keys.flat().join(","))).size,176);

console.log(JSON.stringify({
  schema:1,
  grading:"PRETARGET_NO_TARGET_RUNES",
  title:T,
  companion:D,
  checksum:sigma,
  arities,
  grammar:{
    tapes:tapes.map(([name])=>name),
    phases:11,
    directions:[1,-1],
    signs:[1,-1],
    completion:"first n-1 values from cyclic tape; final value forced by sigma",
    candidateCount:candidates.length,
  },
  candidates,
},null,2));
