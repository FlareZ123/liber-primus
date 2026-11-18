'use strict';

/**
 * Original p49-p51 32x8-byte table vs AES-256 240-byte round-key schedule
 * plus 16-byte IV, under eight canonical 2D reading orientations.
 *
 * A universal necessary AES-256 condition: for every 4-byte word i>=8
 * except i congruent to 0 or 4 (mod 8),
 * w[i] == w[i-8] XOR w[i-1]. The other words can be arbitrary secrets.
 * All original results are independent of secret key and S-box.
 *
 * Run with Node.js 22: node sims/lp2_p50_aes256_schedule_necessary_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const grid = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'base60-grid.json'), 'utf8'
));
const rows = grid.byte_rows;
assert.equal(rows.length, 32);
assert.ok(rows.every(row=>row.length === 8 &&
  row.every(x=>Number.isInteger(x) && x>=0 && x<=255)));

/** @param {number[]} a @param {number[]} b @returns {number[]} */
function xor(a,b) {return a.map((x,i)=>x ^ b[i]);}

/**
 * Count the exact 4-byte necessary AES-256 expanded-key recurrences.
 * AES-256 has Nk=8, Nr=14 and 60 4-byte schedule words = 240 bytes.
 * @param {number[]} arr
 * @returns {{wordMatches:number,eligibleWords:number,byteMatches:number}}
 */
function count(arr) {
  assert.equal(arr.length,240);
  const w=Array.from({length:60},(_,i)=>arr.slice(i*4,i*4+4));
  let wordMatches=0,byteMatches=0,eligibleWords=0;
  for(let i=8;i<60;i++){
    if(i%8===0||i%8===4)continue;
    eligibleWords++;
    const z=xor(w[i-8],w[i-1]);
    const b=z.filter((x,j)=>x===w[i][j]).length;
    byteMatches+=b;
    if(b===4)wordMatches++;
  }
  return {wordMatches,eligibleWords,byteMatches};
}

/** @type {Array<{label:string,tape:number[]}>} */
const orientations=[];
for(const major of ['row','column']) {
  for(const outerReverse of [false,true]) {
    for(const innerReverse of [false,true]) {
      const outerN=major==='row'?32:8, innerN=major==='row'?8:32;
      const tape=[];
      for(let outer=0;outer<outerN;outer++){
        const a=outerReverse?outerN-1-outer:outer;
        for(let inner=0;inner<innerN;inner++){
          const b=innerReverse?innerN-1-inner:inner;
          tape.push(major==='row'?rows[a][b]:rows[b][a]);
        }
      }
      assert.equal(tape.length,256);
      orientations.push({
        label:major+'_outer'+(outerReverse?'rev':'fwd')+
          '_inner'+(innerReverse?'rev':'fwd'),tape
      });
    }
  }
}
assert.equal(orientations.length,8);

// A positive plant satisfying all 39 necessary recurrences, including
// arbitrary seed and nonlinear (i % 8==0,4) positions. This only checks
// the necessary linear branch, without claiming a valid full AES expansion.
const plant=Array.from({length:60},(_,i)=>
  Array.from({length:4},(_,j)=>(i*53+j*17+i*j*3+11)&255));
for(let i=8;i<60;i++){
  if(i%8===0||i%8===4)continue;
  plant[i]=xor(plant[i-8],plant[i-1]);
}
const positive=count(plant.flat());
assert.deepEqual(positive,{wordMatches:39,eligibleWords:39,byteMatches:156});

const outcomes=[];
for(const {label,tape} of orientations) {
  for(const offset of [0,16]) {
    const result=count(tape.slice(offset,offset+240));
    assert.equal(result.eligibleWords,39);
    outcomes.push({layout:label,ivPosition:offset===0?'after schedule':'before schedule',...result});
  }
}
const max=Math.max(...outcomes.map(x=>x.wordMatches));
assert.equal(max,0, 'original unexpectedly fits a branch of the AES schedule');
console.log(JSON.stringify({
  source:'original p49-51 32x8 base60 byte grid',
  proposedLayout:'AES-256 240-byte key expansion plus 16-byte IV',
  testedOrientations:orientations.length,
  IVOffsets:2,
  expectedUniversalRecurrences:39,
  positive,
  maxOriginalMatching4ByteWords:max,
  cases:outcomes
},null,2));
