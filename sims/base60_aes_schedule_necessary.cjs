"use strict";
/**
 * Source-sized complete AES expanded key schedule gate for the original
 * 256-byte LP2 number grid. A standard AES expanded schedule has many
 * *mandatory* 4-byte XOR recurrences independent of its nonlinear S-box.
 * Every authentic AES-128/192/256 expanded schedule must satisfy them.
 *
 * This is a necessary-condition test only. An authentic AES-128 FIPS 197
 * appendix-A fixed round-key example provides an independent positive
 * control; no invented S-box or key expansion implementation is required.
 * Run: node sims/base60_aes_schedule_necessary.cjs
 */
const assert = require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const input=JSON.parse(fs.readFileSync(path.join(
  __dirname,"..","resources/liber-primus/base60-grid.json"),"utf8"));
const matrix=input.byte_rows;
assert.equal(matrix.length,32);
assert.ok(matrix.every(row=>row.length===8&&row.every(
  x=>Number.isInteger(x)&&x>=0&&x<=255)));
const rows=matrix.flat();
const columns=Array.from({length:8},(_,j)=>matrix.map(r=>r[j])).flat();
assert.equal(rows.length,256);
/**
 * @param {number[]} bytes
 * @param {number} start
 * @param {4|6|8} nk
 * @returns {{linear:number,valid:number,firstFault:number|null}}
 */
function check(bytes,start,nk){
  const totalWords=4*(nk+6+1);
  assert.ok(start>=0&&start+4*totalWords<=bytes.length);
  let valid=0,linear=0,firstFault=null;
  for(let i=nk;i<totalWords;i++){
    if(i%nk===0||(nk===8&&i%nk===4))continue;
    linear++;
    let okay=true;
    for(let b=0;b<4;b++){
      const v=bytes[start+4*i+b]^
        bytes[start+4*(i-1)+b]^
        bytes[start+4*(i-nk)+b];
      if(v!==0){okay=false;break;}
    }
    valid+=Number(okay);
    if(!okay&&firstFault===null)firstFault=i;
  }
  return {linear,valid,firstFault};
}
// Known AES-128 expanded initial round words (NIST FIPS 197, Appendix A).
// W5=W4 xor W1; W6=W5 xor W2; W7=W6 xor W3.
const aes128=Array.from(Buffer.from(
  "2b7e151628aed2a6abf7158809cf4f3c"+
  "a0fafe1788542cb123a339392a6c7605", "hex"));
const xorWord=(w,i,j)=>Array.from({length:4},(_,b)=>
  w[4*i+b]^w[4*j+b]);
assert.deepEqual(xorWord(aes128,4,5),
  aes128.slice(4,8));
assert.deepEqual(xorWord(aes128,5,6),
  aes128.slice(8,12));
assert.deepEqual(xorWord(aes128,6,7),
  aes128.slice(12,16));
// A direct corruption must fail.
const corrupted=aes128.slice();
corrupted[24]^=1;
assert.notDeepEqual(xorWord(corrupted,5,6),
  corrupted.slice(8,12));

const cases=[],traversals=[
  ["row-major",rows],
  ["row-major-reversed",rows.slice().reverse()],
  ["column-major",columns],
  ["column-major-reversed",columns.slice().reverse()]
];
for(const [name,data] of traversals)
  for(const nk of [4,6,8]){
    const expandedLength=4*4*(nk+6+1);
    assert.ok(expandedLength<=256);
    let maxValid=-1,matchingStarts=0,starts=0,first=null,zeroCount=0;
    for(let off=0;off+expandedLength<=data.length;off++){
      const res=check(data,off,nk);
      starts++;
      if(res.valid===0)zeroCount++;
      if(res.valid>maxValid){maxValid=res.valid;first=off;}
      if(res.valid===res.linear)matchingStarts++;
    }
    cases.push({traversal:name,keyBits:nk*32,
      expandedBytes:expandedLength,starts,
      maxLinearRecurrencesMatched:maxValid,
      bestStart:first,zeroMatchedStarts:zeroCount,
      fullScheduleCandidates:matchingStarts});
  }
assert.equal(cases.length,12);
assert.ok(cases.every(x=>x.fullScheduleCandidates===0));
const controls={
  fips197AppendixA128ConsecutiveLinearRelations:3,
  fips197AppendixA128Verified:[
    xorWord(aes128,4,5).map(x=>x.toString(16).padStart(2,"0")).join(""),
    xorWord(aes128,5,6).map(x=>x.toString(16).padStart(2,"0")).join(""),
    xorWord(aes128,6,7).map(x=>x.toString(16).padStart(2,"0")).join("")
  ],
  oneByteCorruptionDetected:true
};
console.log(JSON.stringify({
  model:"256-byte LP2 source grid directly contains an AES-128/192/256 expanded round key schedule",
  sourceCells:256,orientations:traversals.map(x=>x[0]),
  fips197Invariant:"For i%Nk != 0 and (AES256) i%Nk != 4, W[i]=W[i-1] xor W[i-Nk]",
  cases,controls,
  conclusion:"All 12 complete source read/traversal/key-size families fail exact AES schedule recurrence; none yields an AES key.",
  limitations:"Not a test of encrypted, incomplete or nonstandard key derivation."
},null,2));
